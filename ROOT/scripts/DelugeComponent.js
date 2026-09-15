/* $Id$ */
var deluComp = {
    reference:{
        isBinded:false,
        st_count:"",
        data_obj:[]
    },
    //Initiate component
    init: function(init_options) {
        // Options stored in dre_obj;
        this.dre_obj = init_options;
        /**
         * Before creating the form we need data.
        */
        if (this.dre_obj.dc_id) {
            this.dre_obj.dc_data = this.dreAjax('/api/v3/custom_functions/' + this.dre_obj.dc_id, "GET",true,false, false, false).responseJSON; // No I18N
        }
        // Construct form append in main container.
        jQuery("#" + init_options.selector).html(this.constructForm());
        // call init dre function. This function used to Initialize deluge editor 
        this.initDRE();
        /**
         * To validate the form.
         */
        this.formValidation();
    },
    /**
     * To validate the form
     */
    formValidation : function(){
        jQuery('#dc-form').validate({
            errorPlacement: function(error, element) {
                error.addClass('alert alert-danger alert-arrow  p5').css({'position': 'absolute', 'left': '0px', 'top': '26px'});//NO I18N
                error.insertAfter(element);
            }
        })
    },
    // Form construction
    constructForm: function() {
        var str = "";
        this.translateKey = (typeof translate === "function") ? translate : translate; // No I18N
        /**
        * Obtaining custom function data
        */
        const get_dc_data = (this.dre_obj && this.dre_obj.dc_data) ? this.dre_obj.dc_data.custom_function : null;
        /**
        * We check whether it is latest version or not.
        */
        const is_latest_api = (get_dc_data && !get_dc_data.is_latest_version && get_dc_data.module)? true : false;
        str += '<div id="deluge-container">';
        /**
        * If it's an older API version, we'll display a warning message.
        */
        if(is_latest_api){
           str += `<div id="api-warning" class="alert alert-warning icon"><span class="msg">${this.translateKey("dre.api.warning.msg",[e_html(get_dc_data.module.display_name)])}</span></div>`; // No I18N
        }
        if(!this.dre_obj.is_popup){
            // setting custom or global function header name based on the new or edit page.
            var dc_header_name = "";
            if(this.dre_obj.tab_view == "custom-actions"){
                dc_header_name =  (this.dre_obj.dc_controller.context.id == "new") ? this.translateKey("dre.new.function") : this.translateKey("dre.edit.function");
            }
            else{
                dc_header_name = (this.dre_obj.dc_controller.context.id == "new") ? this.translateKey("dre.global.function") : this.translateKey("dre.edit.global.function");
            }
            str += '<button type="button" class="btn btn-default fl mr10 mt-5" data-event="click" data-handler="deluComp.validateBeforeUnload()" nonce='+sdpNonce+' title="' + this.translateKey("common.back.listview") + '" rel="uitip"><span class="sdp-glyph sdp-glyph-arrow-left"></span></button>'; // No I18N
            str += '<p class="sb mt10">' +dc_header_name+ '</p> <hr class="mb10" />';
            str += '<div class="row pt10 mr0 ml0 mb10">';
        }
        else{
            str += '<div class="row m0 p15 ml5">';
        }
        str += '<form id="dc-form" data-id="dc-form" class="form-horizontal four-col one-col form-edit" data-event="submit" data-handler="return false;" nonce='+sdpNonce+'><div type="hidden" id="dc-function-id" data-id="dc-function-id"></div><div class="form-section"><div class="form-group">';
        sdpAjax({ //To check whether TFA is enabled for CF
                                url: "/ids-authn/v1/wc/accessrules", // NO I18N
                                type: "GET", // NO I18N
                                async:false,
                                success: function(response) {
                                    let isProtected = true;

                                    if (response && response.data && Array.isArray(response.data)) {
                                        if(response.data.length == 0){
                                            isProtected = false;
                                        }
                                        response.data.forEach(function(item) {
                                            if (item.attributes &&
                                                item.attributes.authnsettings &&
                                                item.attributes.authnsettings.is_mfa_enabled &&
                                                item.attributes.authnsettings.resources &&
                                                item.attributes.authnsettings.resources.actions) {

                                                item.attributes.authnsettings.resources.actions.forEach(function(action) {
                                                    if (action.action_name === "custom_functions_tfa") {
                                                        if (typeof action.is_protected !== 'undefined') {
                                                            isProtected = action.is_protected;
                                                        } else {
                                                            isProtected = false;
                                                        }
                                                    }
                                                });
                                            }else if(item.attributes && item.attributes.authnsettings && !item.attributes.authnsettings.is_mfa_enabled){
                                                isProtected = false;
                                            }
                                        });
                                    }
                                    // If TFA is not enabled, proceeding to check security settings configuration
                                    if (!isProtected) {
                                        sdpAjax({
                                            url: "/api/v3/security_settings", // NO I18N
                                            type: "GET", // NO I18N
                                            async:false,
                                            success: function(securityResponse) {
                                                if (securityResponse &&
                                                    securityResponse.security_settings) {

                                                    if ('disable_local_ip' in securityResponse.security_settings) {
                                                        isProtected = true;
                                                    }
                                                }
                                                // Display the alert if isProtected is still false after both checks
                                                if (!isProtected) {
                                                    var error_message = "custom.function.localip.alert.helpdeskconfig"; // No I18N
                                                   if(sdp_user.ROLES.includes("SDAdmin") || sdp_user.ROLES.includes("SDOrgAdmin")){
                                                        error_message = "custom.function.localip.alert"; // No I18N
                                                   }
                                                    str += '<div class="alert alert-info icon mb10" role="alert"><span class="msg">'+this.translate(error_message)+'</span></div>';
                                                }
                                            }
                                        });
                                    }
                                }
                            });


        var dc_func_width = (this.dre_obj.tab_view == "global-functions") ? "max-width: 385px" : (!this.dre_obj.is_popup) ? "max-width: 385px" : "max-width: 364px"; // No I18N
        str += '<div class="col-group mr20 mb15" style="'+dc_func_width+'"><div class="col-fields"><label class="control-label p0" for="dc-func-name">' + this.translateKey("dre.function.name") + '<span class="mandatory"> * </span></label><input aria-label="'+ this.translateKey("dre.function.name") +'" autofocus id="dc-func-name" maxlength = "150" data-id="dc-func-name" name="funcName" type="text" data-errorclass="mt25" class="form-control" aria-required="true" value=""></div></div>'; 
        // If tab view equal to global function or need global common fields like parameters, return type delugue editor header then going to below if check.
        if(this.dre_obj.tab_view == "global-functions" || this.dre_obj.global_common_fields){
            str += '<div class="col-group mr20 mb15" style="max-width: 395px"><div class="col-fields"><label class="control-label p0" for="return-type">' + this.translateKey("dre.returntype") + '<span class="mandatory"> * </span></label>';
            var opt = "";
            /**
             * We have provide an option to set the return type data.
             */
            var returnTypeData = this.dre_obj.return_type_data;
            var data_types = (returnTypeData && Array.isArray(returnTypeData) && returnTypeData.length != 0) ? returnTypeData : [this.translateKey("sdp.inventory.getinputfile.selecttype"), "Map", "string", "int", "bool", "date", "float", "void"]; // No I18N
            var data_types_len = data_types.length;
            for (var i = 0; i < data_types_len; i++) {
                var dc_data_val = (data_types[i] != this.translateKey("sdp.inventory.getinputfile.selecttype")) ? data_types[i] : "";
                opt += '<option value="'+dc_data_val+'">' + data_types[i] + '</option>'; 
            }
            str += '<select class="form-control" aria-label="'+ this.translateKey("dre.returntype") +'" id="return-type" data-id="return-type" data-errorclass="mt25" name="returnType" aria-required="true" data-event="change" data-handler="deluComp.updateReturnType()" nonce='+sdpNonce+'>' + opt + '</select></div></div>';
        }
        var main_class = "",sub_class = "",max_width = "";
        // If tab view equal to global function or need global common fields like parameters, return type delugue editor header then going to below if check.
        (this.dre_obj.tab_view == "global-functions" || this.dre_obj.global_common_fields) ? (main_class = "col-group pl0 fw mb15", sub_class = "control-label p0 pb5", max_width = "max-width:800px") : (main_class = "col-xs-8 pl0 char-topright pr0 mb15", sub_class = "control-label p0", max_width = "max-width:845px;"); // No I18N
        str += '<div class="' + main_class + '" style="' + max_width + '"><div class="col-fields"><label class="' + sub_class + '" for="dc-desc">' + this.translateKey("sdp.common.description") + '</label><textarea aria-label="'+ this.translateKey("sdp.common.description") +'" id="dc-desc" data-id="dc-desc" data-event="blur" data-handler="deluComp.descriptionResize()" nonce='+sdpNonce+' maxlength="1000" style="resize:none;height: 26px;" charcount="true" class="form-control"></textarea></div></div>';
        str += '</div>';
        /**
         * Checking for Api integration is available or not.
         */
        var isAPIIntegration = (this.dre_obj.tab_view == "custom-actions" && this.dre_obj.api_integration) ? true : false; //NO I18N
        var apiInputClass = "", apiInputStyle = "";
        /**
         * If Api integration is not present, we are adding classes and style in API input box 
         */
        (!isAPIIntegration) ? (apiInputClass = " disp-ib mr10", apiInputStyle = "width: calc(100% - 26px);") : ""; //NO I18N
        str += '<div class="form-group"><div class="col-group mr20 mb15" style="'+dc_func_width+'"><div class="col-fields"><label id="dc-api-name" class="control-label p0" for="api-name">'+this.translateKey("admin.common.apiname")+'<span class="mandatory"> * </span></label><input aria-label="api-name" autofocus id="api-name" maxlength = "100" data-id="dc-api-name" name="apiName" type="text" data-errorclass="mt25" aria-required="true" class="form-control'+apiInputClass+'" value="" data-event="blur" data-handler="deluComp.setApiName()" nonce="'+sdpNonce+'" style="'+apiInputStyle+'">';
        /**
         * If Api integration is not present, we are including info icon.
         */
        if(!isAPIIntegration){
            str += '<span class="cspr info icon-sm" id="api_input_info" data-id="api_input_info" rel="uitip" title="' + this.translateKey("admin.custom.apiname.info") + '"></span>';
        }
        str += '</div></div>';
        /**
         * Provided the option to select the function type
         */
        if(this.dre_obj.ft_selection){
            str += '<div class="col-group mr20 mt25" style="max-width: 385px">';
            str +=    '<div id="ft_container" class="col-fields">';
            str +=        '<label class="radio-inline" for="ft_action">'; //NO I18N
            str +=            '<input type="radio" name="ft_radio_butt" id="ft_action"  data-id="ft_action" data-return-type="Map" data-function-type="customaction" data-event="change" data-handler="deluComp.funtionType(this)" nonce='+sdpNonce+' checked>';
            str +=            '<span>'+ this.translateKey("common.action") +'</span>'; //NO I18N
            str +=        '</label>';
            str +=        '<label class="radio-inline" for="ft_condition">'; //NO I18N
            str +=            '<input type="radio" name="ft_radio_butt" id="ft_condition" data-id="ft_condition" data-return-type="bool" data-function-type="conditional" data-event="change" data-handler="deluComp.funtionType(this)" nonce='+sdpNonce+'>';
            str +=            '<span>'+ this.translateKey("sdp.admin.workflow.stencil.condition") +'</span>'; //NO I18N
            str +=        '</label>';
            str +=    '</div>';
            str += '</div>';
        }

        // Constructs Execute Url & publish fields in custom actions
        if(isAPIIntegration){
            str += '<div class="col-group mr0 mb15" style="width: calc(100% - 405px);"><div class="col-fields fl" style="max-width: calc(100% - 60px);"><label class="control-label p0" for="callback-url">'+this.translateKey("admin.callback.custom.executeurl")+'</label><input disabled aria-label="callback-url"  id="callback-url" data-id="callback-url" name="callback-url" type="text" data-errorclass="mt25" class="form-control" aria-required="true" value=""></div><span class="cspr flat icon-md copy ml10 pos-rel cur-ptr top25 disableDiv" id="copy_url" rel="uitip" title="'+this.translateKey("sdp.common.copy.to.clipboard")+'" data-event="click" data-handler="deluComp.copyToClipboard()" nonce='+sdpNonce+'></span><span class="cspr info icon-sm ml10 top25" id="api_info" data-id="api_info" rel="uitip" title="' + this.translateKey("admin.callback.custom.apiurl.info") + '"></span></div>';
            if(this.dre_obj.publish_function){
                str += '<div class="col-group mb15"><label class="checkbox-inline"><input id="dc-publish" type="checkbox"name="">'+this.translateKey("sdp.home.ssp.customization.common.publish")+'</label></div></div>';
            }
            else{
                str+= '</div>'
            }
        }
        else{
            str+= '</div>';
        }
        str += '</div>';
        // If tab view equal to global function or need global common fields like parameters, return type delugue editor header then going to below if check.
        if (this.dre_obj.tab_view == "global-functions" || this.dre_obj.global_common_fields) {
            /**
             * Setting the width based on the configuration
             */
            var cloneRowWidth =  (this.dre_obj.clone_rows && this.dre_obj.clone_rows.options && this.dre_obj.clone_rows.options.width) ? this.dre_obj.clone_rows.options.width : "896";
            str += '<span class="sb">' + this.translateKey("dre.parameters") + '</span><hr class="mt10"><div id="dc-clone-rows" data-id="dc-clone-rows" class="pos-rel right10" style=width:'+cloneRowWidth+'px></div>';
        }
        /**
         * We customize the width of the editor based on the configuration
         */
        var editorWidth = (this.dre_obj.editor_width) ? this.dre_obj.editor_width + "px" : "100%"; // No I18N
        str += '<div id="dc-delu-edit-area" data-id="dc-delu-edit-area" style="width:'+editorWidth+'; max-width: 1250px; height: 500px;" class="mb30 mt20"></div>';
        /**
        * If it's an older API version, we'll show a checkbox to update to the latest API version
        */
        if(is_latest_api){
           str += `<div id="acknowledge-container" class="mb30"><label for="acknowledge"><input type="checkbox" name="acknowledge" id="acknowledge" class="top1">${this.translateKey("dre.api.ack.msg",[e_html(get_dc_data.module.display_name)])}</label><span class="mandatory"> * </span></div>`; // No I18N
        }
        str += '<div class="form-footer p0"><div class="pl0"><div class="pt10 pb10"><button type="button" data-id="dc-save" class="btn btn-primary mr10" data-event="click" data-handler="deluComp.saveCustomFunction({save_execute : false});return false;" nonce='+sdpNonce+'>' + this.translateKey("sdp.common.save") + '</button>';
        /**
         * To skip the save and test button
         */
        if(!this.dre_obj.skip_save_and_test){
            str += '<button type="button" class="btn btn-default"  data-id="dc-save-test" data-event="click" data-handler="deluComp.saveCustomFunction({save_execute : true});return false;" nonce='+sdpNonce+'>' + this.translateKey("dre.save.test") + '</button>'; //NO I18N
        }
        str += '<button data-event="click" data-handler="deluComp.validateBeforeUnload()" nonce='+sdpNonce+' type="button" class="btn btn-default" id="dc-cancel" data-id="dc-cancel">' + this.translateKey("sdp.common.cancel") + '</button></div></div></div>';
        str += '</form></div>';
        str += '</div><div class="p15 disp-h" id="dc-script-summary" data-id="dc-script-summary" title="' + this.translateKey("dre.script.summary")+ '"></div>';
        str += '</div><div class="p15 disp-h" id="test-script" data-id="test-script" title="' + this.translateKey("dre.test.script")  + '" ></div>';
        return str;
    },
    /**
     * This function is triggered when the radio button of the function type is changed.
     * @param {object} selectedFT
     */
    funtionType : function(selectedFT){
        var $this = jQuery(selectedFT);
        var returnType = $this.attr("data-return-type");
        this.updateReturnType(returnType);
        this.dre_obj.function_type = $this.attr("data-function-type");
        this.dre_obj.returnType = returnType;
    },
    // to copy the url from Execute URL
    copyToClipboard: function() {
        var urltext = jQuery("#callback-url").val();
        var dynInput = document.createElement('input');
        dynInput.setAttribute('value', encodeURI(urltext));
        document.body.appendChild(dynInput);
        dynInput.select();
        var result = document.execCommand('copy'); // No I18N
        document.body.removeChild(dynInput);
        showalert('success',this.translateKey("msteams.copied"),'isAutoHide=true');//No I18N
        return result;
    },
    // Set values in form
    setValues: function(){
        // Get custom function data.
        var dc_data = this.dre_obj.dc_data.custom_function,dc_func_val,dc_desc_val;
        // Encode function name.
        (typeof Ember !== "undefined") ? (dc_func_val = Ember.String.htmlSafe(dc_data.name).string , dc_desc_val = Ember.String.htmlSafe(dc_data.description).string) :(dc_func_val = e_attr(dc_data.name) , dc_desc_val = e_attr(dc_data.description)); // No I18N
        // Set function and description name.
        jQ("#dc-form").find("#dc-func-name").val(dc_func_val).end().find("#dc-desc").val(dc_desc_val); // No I18N
        jQ("#dc-form").find("#api-name").val(dc_data.api_name); // No I18N
        if(this.dre_obj.tab_view == "custom-actions" && this.dre_obj.api_integration){
            dc_data.callback_url ? jQ("#dc-form").find("#callback-url").val(encodeURI(dc_data.callback_url)) : jQ("#dc-form").find("#callback-url").val(""); //No I18N
            var dc_publish = jQ("#dc-form").find("#dc-publish"); // No I18N
            if(dc_data.is_callback_exposed){
                jQuery("#copy_url").removeClass("disableDiv"); // No I18N
                dc_publish.prop("checked",true); // No I18N
            }
            else{
                dc_publish.prop("checked",false); // No I18N
            }
        }
        deluComp.descriptionResize();
        /**
         * Global function or global common fields.
         */
        if (this.dre_obj.tab_view == "global-functions" || this.dre_obj.global_common_fields) {
            /**
             * To set the value of clone rows when editing.
             */
            this.setValueCR();
            /**
             * To validate the parmeters
             */
            this.validateParameters();
        }
        /**
         * To select the radio button of function type
         */
        if(this.dre_obj.ft_selection){
            this.selectFTRadioButt(dc_data);
        }

    },
    /**
     * To select the radio button of function type based on the response.
     * @param {object} dc_data
     */
    selectFTRadioButt : function(dc_data){
        jQuery("#dc-form").find("#ft_container").addClass("opac5 ptr-ev-none").end().find("[data-function-type="+dc_data.function_type+"]").prop('checked', true); //NO I18N
        this.dre_obj.function_type = dc_data.function_type;
    },
    // Set function name in the DRE editor header.
    setFunctionName : function(){
        /** Function name getting in the initialization **/
        var dc_function_val = (this.dre_obj.dc_id) ? this.dre_obj.dc_data.custom_function.api_name : "";
        jQuery("#dc-function-update").text(dc_function_val);
    },
    // Initiate DRE
    initDRE: function() {
        /** Module object getting in the initialization **/
        var dre_json;
        // Get return type value.
        var dc_return_type = (this.dre_obj.dc_id) ? this.dre_obj.dc_data.custom_function.return_type : this.dre_obj.return_type ? this.dre_obj.return_type : "Map"; // No I18N
        /**
         * Getting the return type is based on config.
         */
        this.dre_obj.returnType = dc_return_type;
        jQuery("#return-type").select2().select2("val" , e_html(dc_return_type)); // No I18N
        // Construct dre json.
        dre_json = {
            "labels": { //No I18N
                "header": this.translateKey("dre.custom.function") + " <span class='cspr info icon-sm ml5 top-1' id='return_type_info' data-id='return_type_info' rel='uitip' title='" + this.translateKey("dre.header.text", [e_attr(dc_return_type)]) + "'></span>"//No I18N
            },
            "systemFields": { //No I18N
                "hideAll": true //No I18N
            },
            "integrationFields": { //No I18N
                "hideAll": true //No I18N
            },
            "hideTasks": [{ //No I18N
                "groupName": "Notifications", //No I18N
                "elements": ["post_to_chat"] //No I18N
            }, {
                "groupName": "Integrations", //No I18N
                "elements": ["zoho_integration"] //No I18N
            }],
            "topBar":{ //No I18N
                "config" :[{ //No I18N
                    "label": "Help", //No I18N
                    "submenu": [ //No I18N
                    {
                        "action":"remove", //No I18N
                        "label" : "Support" //No I18N
                    }]
                }]
            },
            "ZE":{ //No I18N
                create : function(initparam){
                  initparam.customName = "dreEditor"; // No I18N
                  initparam.customThresholdValue = -20;
                  initparam.toolbar = "delugeToolbar"; // No I18N
                  initparam.buttonsToHide = ["image"]; // No I18N
                  zeditor(initparam);
                  return parent.dreEditor;
                },
                "changeobj" : { //No I18N
                  "id" : "element" //No I18N
                }
            },
            "callback" : function(){ //No I18N
                deluComp.afterInitializeEditor();
                $sdEventListener(jQuery("#deluge-container"));
            },
            "serviceName":"onPremises", //No I18N
            "syntaxAssist": false//No I18N
        };
        initializeDelugeEditor(jQ("#dc-delu-edit-area")[0], dre_json);
    },
    /**
     * Function will be called after initialize the editor
     */
    afterInitializeEditor : function(){
        var dc_module_obj = this.dre_obj.module_obj;
        if (delugeEditor != "undefined" && delugeEditor != null) {
            var dc_header_html, dc_context_str = "", dc_context_obj = "";
            // If tab view equal to custom action then going to below if check.
            if(this.dre_obj.tab_view == "custom-actions" && !this.dre_obj.global_common_fields){
                /** For context in the deluge header **/
                if(this.dre_obj.context_needed){
                   dc_context_str = ",Map&nbsp;context"; //No I18N
                   dc_context_obj = ",Map:context"; //No I18N
                }
                dc_header_html = "<span id='dc-header' data-id='dc-header' class='fh disp-if align-vh-center'><span id='dc-return-type' data-id='dc-return-type'>"+this.dre_obj.returnType+"</span>&nbsp<span class='txt-wrap' id='dc-function-update' data-id='dc-function-update' style='max-width:250px'></span><span>&nbsp;(&nbsp;</span><span id='dc-arguments' data-id='dc-arguments'><span>Map&nbsp;</span>"+dc_module_obj+"</span>"+dc_context_str+"&nbsp;)&nbsp;{</span>";
                delugeEditor.addFuncParamsToEditor("{Map:"+dc_module_obj+""+dc_context_obj+"}"); //No I18N
            // If tab view not equal to custom action then going to below else check.
            }else{
                dc_header_html = "<span id='dc-header' data-id='dc-header' class='fh disp-if align-vh-center'><span id='dc-return-type' data-id='dc-return-type'></span>&nbsp<span class='txt-wrap' id='dc-function-update' data-id='dc-function-update' style='max-width:250px'></span><span>&nbsp;(&nbsp;</span><span id='dc-arguments' rel='uitip' class='txt-wrap' data-id='dc-arguments' style='max-width:500px'><span></span></span>&nbsp;)&nbsp;{</span>";
            }
            var dc_editor_area = jQ("#dc-delu-edit-area"); //No I18N
            jQ(dc_editor_area).find('.dre-deluge-task-header').after(dc_header_html);
            if(!this.dre_obj.is_popup){
                jQ(dc_editor_area).find('.dre-deluge-actions').before("<a href='/' data-event='click' data-handler='deluComp.showfullscreen(this)' nonce="+sdpNonce+" data-id='dc-full-screen' class='ful-scr' rel='noopener uitip' title='" + this.translateKey("sdp.fullscreen") + "'><span class='cspr full-screen icon-sm'></span></a>");
            }
            jQ(dc_editor_area).find('.deluge-tools').before("<span class='fl'>}</span>");
        }
        if(this.dre_obj.dc_id) {
            // Get function content
            var dc_function_content = this.dre_obj.dc_data.custom_function.function_content;
            if(dc_function_content != undefined && dc_function_content != null && dc_function_content != ''){
                var dc_script = dc_function_content.substring(dc_function_content.indexOf("{") + 1, dc_function_content.length - 2);
                // Scripts append in deluge editor
                delugeEditor.setEditorContent(dc_script);
            }
            else{
                delugeEditor.editor.setValue("");
            }
        }
        // Initialize tool tip.
        initTooltip('#deluge-container'); // No I18N
        /**
         * For Global function
         */
        (this.dre_obj.tab_view == "global-functions" || this.dre_obj.global_common_fields) ? (jQuery("#return-type").select2(),jQuery("#dc-return-type").text(jQuery("#return-type").val())) : ""; // No I18N
        /**
         * Updating the values in form when edit mode.
         */
        if(this.dre_obj.dc_id){
            this.setValues()
        } else{
            /**
             * To render the clone Rows in new form
             */
            this.renderCloneRows();
            /**
             * Appending the arguments in header based on the clone row input.
             */
            this.appendArguments();
        }
        this.setFunctionName();
        // Initialize char count in description
        charCounter.init();
        jQuery("#append_loader .loading1").remove(); //NO I18N
        jQuery("#main_container").css('visibility','visible'); // No I18N
        // Focus on the Funciton name on form load
        jQuery("#dc-func-name").trigger("focus");
        /**
         * After initializing the editor, we provide a callback function.
         */
        if(this.dre_obj.after_initialize && typeof this.dre_obj.after_initialize == "function"){
            this.dre_obj.after_initialize(this);
        }
    },
    // Get customfunction name.
    getCustomFunctions : function(options){
        var self=this;
        (self.reference.st_count == "") ? self.reference.st_count=1 : "";
        options.listInfo.start_index = self.reference.st_count;
        self.dreAjax(options.url, "GET" , true , {"list_info":options.listInfo} , false , false , function(data) { // No I18N
            if(data.list_info.has_more_rows == true){
                    self.reference.data_obj = self.reference.data_obj.concat(data.custom_functions);
                    self.reference.st_count = self.reference.st_count+100;
                    self.getCustomFunctions(options);
                }
                // If (has more rows) false. call below else check.
                else{
                    (data.list_info.start_index == 1) ? self.reference.data_obj = data.custom_functions : self.reference.data_obj = self.reference.data_obj.concat(data.custom_functions);
            }
        });
    },
    // DRE ajax componet
    dreAjax: function(url, type, encode, inputData, async, cache, successCallBack, failureCallBack){
        if(encode){
             inputData = (inputData) ? sdpAjaxInputData(inputData) : "";
        }
        return sdpAjax({
            url: url,
            type: type,
            async: async,
            data: inputData,
            cache: cache,
            ignorefailuremessage:true,
            success: function(response) {
                // Success call back
                if (typeof successCallBack === "function") { //No I18N
                    successCallBack(response);
                }
                return response;
            },
            error: function(jqXHR, textStatus, errorThrown) {
                // Failure call back
                if (typeof failureCallBack === "function") { //No I18N
                    failureCallBack(jqXHR, textStatus, errorThrown);
                }
            }
        });
    },
    // Scroll to Mandatory field and focus on the field if the field is empty on submit
    scrollToMandateField : function(ele){
        var elePos = jQuery(ele).offset().top;
        var containerID = (this.dre_obj.is_popup) ? "#"+this.dre_obj.is_popup.popup_id : "html,body";
        jQuery(containerID).animate({
            scrollTop: elePos - 60
        }, function() {
            if(ele.data("select2")) {
                ele.select2("open");	//No I18N
            } else {
                ele.focus();
            }
        });
    },
    /**
     * Form validation
     * @param {*} dc_save_opt
     * @returns
     */
    saveCustomFunction: function(dc_save_opt) {
        var dc_form = jQ('#dc-form'), dc_self = this, dreObj = dc_self.dre_obj; // No I18N
        /**
         * Before save callback
         */
        var dc_is_popup = dreObj.is_popup;
        if(dc_is_popup){

            var getBSC = dreObj.dc_controller[dc_is_popup.before_save_callback];
            if(typeof getBSC == "function"){
                if(!getBSC()){
                    return false;
                }
            }
        }
        var dc_funct_name = dc_form.find('#dc-func-name').val(), dc_apiname = dc_form.find("#api-name").val().trim();
        var getId, getData;
        jQuery.extend(true, dc_save_opt, {"dc_form": dc_form, "dc_self": dc_self, "dc_funct_name": dc_funct_name, "dc_apiname": dc_apiname}); //NO I18N
        /**
         * when click on save and execute button, we get the id and data for validation purpose.
         */
        var functionId = jQ('#dc-form').find('#dc-function-id').val(); // No I18N
        if(dreObj){
            (functionId != "") ? (getId = functionId, getData = dreObj.internal_data) : (getId = dreObj.dc_id, getData = dreObj.dc_data);
        }
        if(dc_funct_name == ""){
            showalert('failure',translate("dre.function.name.error.msg"),"isAutoHide=false"); // No I18N
            dc_self.scrollToMandateField(dc_form.find('#dc-func-name'));
            return false;
        }
        else if(dc_apiname == ""){
            showalert('failure',translate("admin.common.apiname.required"),"isAutoHide=false"); // No I18N
            dc_self.scrollToMandateField(dc_form.find("#api-name"));
            return false;
        }
        /**
         * If the Api value changes during the edit process, we throw a confirm alert.
         */
        else if(getId && getData && getData.custom_function && getData.custom_function.api_name != dc_apiname){
            showconfirm(true, 'title='+translate("common.confirm.submit.msg")+', message='+translate("admin.custom.apiname.msg")+', submitbutton='+translate("common.proceed")+', cancelbutton='+translate("common.no")+', closebutton=yes, closeOnEscKey=yes',function(boolean){ //NO I18N
                if(boolean){
                    dc_self.saveCFAction(dc_save_opt);
                }else{
                    dc_self.scrollToMandateField(dc_form.find("#api-name"));
                    return false;
                }
            });
        }else{
            dc_self.saveCFAction(dc_save_opt);
        }
    },
    /**
     * Save custom and global function action
     * @param {object} dc_save_opt
     * @returns
     */
    saveCFAction : function(dc_save_opt){
        var dc_form = dc_save_opt.dc_form , dc_self = dc_save_opt.dc_self , dc_funct_name = dc_save_opt.dc_funct_name , dc_apiname = dc_save_opt.dc_apiname , dc_publish = dc_form.find("#dc-publish").is(":checked") , dc_editer_funct_name = jQuery("#dc-function-update").text() , dc_desc = dc_form.find('#dc-desc').val() , dc_module_obj = dc_self.dre_obj.module_obj , dc_function_type = dc_self.dre_obj.function_type , dc_param_details = {} , dc_return_type = "" , dc_script="" , dc_details = {} , dc_url = "" , dc_type = "" , dc_input_data = {} ,dc_module = dc_self.dre_obj.module_key , dc_success_msg=""; //NO I18N
        /**
         * Obtaining main container of deluge.
         */
        const get_main_container = jQuery("#deluge-container");
        /**
         * Obtaining the value of check box.
         */
        const isAcknowledgeChecked = get_main_container.find("#acknowledge").is(":checked");    // No I18N
        /**
         * Module name will be include based on the configuration.
         */
        if(dc_self.dre_obj.module_needed && this.dre_obj.tab_view != "global-functions"){
            dc_details.module = dc_module;
        }
        /**
        * We send "is_latest_version = true" during the new custom function
         */
        (dc_self.dre_obj && !dc_self.dre_obj.dc_data && !dc_self.dre_obj.internal_data) ?  dc_details.is_latest_version = true : "";
        /**
         * We send this value if the checkbox is checked
         */
        if(isAcknowledgeChecked){
           dc_details.is_latest_version = true;
        } else if(get_main_container.find("#acknowledge").length != 0) {
            /**
             * Show alert if checkbox is not enabled
             */
            showalert('failure',translate("dre.api.ack.selectcheckbox"),"isAutoHide=false"); // No I18N
            dc_self.scrollToMandateField(get_main_container.find("#acknowledge"));
            return false;
        }
        // If tab view equal to custom function then going to below if check.
        if(dc_self.dre_obj.tab_view == "custom-actions" && !dc_self.dre_obj.global_common_fields){
            // Construct param details.
            dc_param_details[dc_module_obj] = {"dataType":"Map"};    //No I18N
            dc_return_type = this.dre_obj.returnType;
            // Get deluge editor value
            dc_script = getEditorValue();
            if(dc_script != null && dc_script !== '') {
                if(dc_self.dre_obj.context_needed){
                    dc_param_details.context = {"dataType":"Map"}; // No I18N
                    dc_script = dc_return_type+" "+ dc_editer_funct_name + "(Map "+dc_module_obj+", Map context){" + dc_script + "\n}"; // No I18N
                }else{
                    dc_script = dc_return_type+" "+ dc_editer_funct_name + "(Map "+dc_module_obj+"){" + dc_script + "\n}"; // No I18N
                }
                // Get deluge editor header content.
                dc_details.function_content = dc_script;
            }  else {
                showalert('failure',translate("dre.function.cannot.empty"),"isAutoHide=false"); // No I18N
                dc_self.scrollToMandateField(dc_form.find('#dc-func-name'));
                return false;
            }
        // If tab view not equal to custom function then going to below else if check.
        }else{
            dc_return_type = dc_form.find('#return-type').val();
            if(dc_return_type == ""){
                showalert('failure',translate("dre.return.type.error.msg"),"isAutoHide=false"); // No I18N
                dc_self.scrollToMandateField(dc_form.find("#return-type"));
                return false;
            }
            /**
             * Getting the clone rows data.
             */
            var dc_param_data = deluComp.cloneObj.getValues();
            dc_function_type = (dc_self.dre_obj.tab_view == "global-functions") ? "global" : dc_self.dre_obj.function_type; //No I18N
            /**
             * Validating the form
             */
            if(!jQuery("#dc-form").valid()){
                dc_self.scrollToMandateField(dc_form.find("#dc-clone-rows"));
                return false;
            }
            /**
             * Iterate the clone rows data
             */
            else if(dc_param_data.length != 0){
                for (let index = 0; index < dc_param_data.length; index++) {
                    dc_param_details[dc_param_data[index].name] = {"dataType": dc_param_data[index].type};
                    /**
                     * Override the clone rows data based on the configuration.
                     */
                    var getCloneRows = dc_self.dre_obj.clone_rows;
                    if(getCloneRows && getCloneRows.options && typeof getCloneRows.options.override_data == "function"){
                        dc_param_details[dc_param_data[index].name] = getCloneRows.options.override_data(dc_param_details[dc_param_data[index].name], dc_param_data[index]);
                    }
                }
                /**
                 * Including the default arguments in clone rows data.
                 */
                if(dc_self.dre_obj.default_arguments){
                    this.appendDefaultArguments(dc_self.dre_obj.default_arguments, dc_param_details);
                }
            }
            /** To allow empty value in clone rows */
            else if(dc_self.dre_obj.clone_rows && dc_self.dre_obj.clone_rows.options.allow_empty_row_save){
                /**
                 * Including the default arguments in clone rows data.
                 */
                if(dc_self.dre_obj.default_arguments){
                    this.appendDefaultArguments(dc_self.dre_obj.default_arguments, dc_param_details);
                }
            }
            // Get deluge editor value
            dc_script = getEditorValue();
            if(dc_script != null && dc_script !== '') {
                /**
                 * Clone Rows values are appending in the function content.
                 */
                var getArguments = jQuery("#dc-arguments").text();
                dc_details.function_content = dc_return_type+" "+dc_editer_funct_name+" (" +getArguments+ "){"+dc_script+"\n}";
            }else {
               showalert('failure',translate("dre.function.cannot.empty"),"isAutoHide=false"); // No I18N
               dc_self.scrollToMandateField(dc_form.find('#dc-func-name'));
               return false;
            }
        }
        // combine dc_details json.
        var dc_saved_cf_id = jQ('#dc-form').find('#dc-function-id').val(); // No I18N
        var dc_cf_id = dc_self.dre_obj.dc_id || dc_saved_cf_id;
         /**
          * The dc_param_details json object is passed as a string as recommended by the server team.
          */
         jQuery.extend(dc_details , {"name" : dc_funct_name , "description" : dc_desc , "return_type" : dc_return_type , "function_type" : dc_function_type , "param_details" : sdpToJSON(dc_param_details) , "api_name" : dc_apiname});//No I18N
        if(this.dre_obj.tab_view == "custom-actions" && dc_self.dre_obj.api_integration){
            jQuery.extend(dc_details, {"is_callback_exposed": dc_publish}); // No I18N
        }
        (dc_self.dre_obj.dc_id || dc_saved_cf_id != "") ? (dc_url = '/api/v3/custom_functions/'+dc_cf_id , dc_type = 'PUT' , dc_success_msg = "dre.function.updated") : (dc_url = '/api/v3/custom_functions' , dc_type = 'POST' , dc_success_msg = "dre.function.added"); // No I18N
        dc_input_data = {"custom_function" : dc_details};   //No I18N
        dc_self.dreAjax(dc_url , dc_type, true , sdpAjaxInputData(dc_input_data) , true , false , function(data) {
            var dc_resp_status = data.response_status;
            /**
             * We store the data for using this purpose.
             * If the Api value changes during the edit process, we throw a confirm alert.
             */
            deluComp.dre_obj.internal_data = data;
            if(data.custom_function.function_type == "callback"){
               if(data.custom_function.is_callback_exposed) {
                   jQuery("#callback-url").val(encodeURI(data.custom_function.callback_url));
                   jQuery("#copy_url").removeClass("disableDiv");
                } else{
                    jQuery("#callback-url").val(" ");
                    jQuery("#copy_url").addClass("disableDiv");
                }
            }
            if(dc_resp_status.status == "failed"){
                if(dc_resp_status.messages){
                    showalert('failure',e_html(dc_resp_status.messages[0].message), "isAutoHide=false"); // No I18N
                    return false;
                }
            }
            delugeEditor.delugeEditorContent = delugeEditor.getEditorValue();
            var dc_custom_func_obj = data.custom_function;
            jQuery("#dc-function-update").text(dc_custom_func_obj.api_name);
            jQ('#dc-form').find('#dc-function-id').val(dc_custom_func_obj.id); // No I18N
            /**
             * Removing the "Latest API Version" checkbox and its warning message when clicking the "Save and Test" button.
             */
            get_main_container.find("#api-warning, #acknowledge-container").remove();
            // If tab view equal to custom function then going to below if check.
            if(dc_self.dre_obj.tab_view == "custom-actions" && !dc_self.dre_obj.global_common_fields){
                // If clicking save and execute button then going to below if check.
                if(dc_save_opt.save_execute){
                    var get_popup = dc_self.dre_obj.save_test_popup;
                    /**
                     * To select the radio button of function type
                     */
                    if(dc_self.dre_obj.ft_selection){
                        dc_self.selectFTRadioButt(data.custom_function);
                    }
                    if(!jQuery.isEmptyObject(get_popup)){
                            jQuery('#'+get_popup.id+"-form").css('visibility', 'hidden'); // No I18N
                            jQuery('#'+get_popup.id).dialog({
                                resizable: false,
                                height:'auto',    //No I18N
                                width: 600,
                                modal: true,
                                open: function(){
                                    jQuery('#'+get_popup.id+"-loader").html(ajaxBar());
                                    dc_self.dre_obj.dc_controller[get_popup.function_name]();
                                    setTimeout(function(){
                                        jQuery('#'+get_popup.id+"-loader .loading1").remove();
                                        jQuery('#'+get_popup.id+"-form").css('visibility', 'visible'); // No I18N
                                    },300);
                                    jQuery("body").addClass('pos-rel'); //No I18N
                                },
                                close: function() {
                                    jQuery('#'+get_popup.id).dialog("destroy"); // No I18N
                                    jQuery("body").removeClass('pos-rel'); //No I18N
                                }
                            });
                    }else{
                        /**
                         * We send the exact module name as the module param to show the list view of the chosen custom module.
                         */
                        var dc_module_name = dc_self.dre_obj.module_name ? dc_self.dre_obj.module_name : dc_self.dre_obj.module;
                        var dc_file_name = "/setup/CFSaveAndTestView.jsp?module="+dc_module_name;   // No I18N
                        NewWindow(dc_file_name, dc_module_name, '800', '600', 'yes', 'center',null,null,"changeAsset"); // No I18N
                    }
                // If clicking save button then going to below else check.
                }else{
                    showalert('success', translate(dc_success_msg), "isAutoHide=true"); // No I18N
                    // Redirect to url.
                    dc_self.constructRouteUrl();
                }

            }
            // If tab view not equal to custom function then going to below else check.
            else{
                // If clicking save and execute button then going to below if check.
                if(dc_save_opt.save_execute){
                    /**
                    * The string is converted to a json object
                    */
                    dc_custom_func_obj.param_details = JSON.parse(dc_custom_func_obj.param_details);
                  if(!jQuery.isEmptyObject(dc_custom_func_obj.param_details)){
                    var dc_arg_html = "";
                    dc_arg_html += '<div id="dc-test-script" data-id="dc-test-script" title="'+dc_self.translateKey("dre.test.script")+'"><div class="p15"><p class="sb">'+dc_self.translateKey("dre.global.test.values")+'</p>';
                    dc_arg_html += '<div class="block-bordered p15 mb20" id="dc-argument-list" data-id="dc-argument-list" style="min-height: 250px;">';
                    jQuery.each(dc_custom_func_obj.param_details, function(key,value){
                        /**
                         * We have skip the default arguments
                         */
                        var getCloneRows = dc_self.dre_obj.clone_rows;
                        if(!getCloneRows || (getCloneRows && getCloneRows.options && getCloneRows.options.skipRow.indexOf(key) == -1)){
                            dc_arg_html += '<div class="mb20"><input type="text" style="width:250px;" aria-label="Argument name" name="dc-arg-name" data-id="dc-arg-name" class="form-control form-control-auto bg-light"  disabled value="'+key+'"><span class="pl10 pr10">=</span><input type="text" style="width:250px;" aria-label="Argument value" name="dc-arg-value" data-id="dc-arg-value" class="form-control form-control-auto" value=""></div>';
                        }
                    });
                    dc_arg_html +='</div>';
                        dc_arg_html +='<div class="form-footer p0"><div class="pl0"><div class="pt10 pb10"><button type="button" class="btn btn-primary" data-id="dc-test-execute" data-event="click" data-handler="deluComp.selectlistAndExecuteDre()" nonce='+sdpNonce+'>'+dc_self.translateKey("site24x7.action.execute")+'</button><button type="button" class="btn btn-default"  data-id="dc-test-cancel" data-event="click" data-handler="deluComp.closeDialog()" nonce='+sdpNonce+'>'+dc_self.translateKey("sdp.common.cancel")+'</button></div></div></div>';
                    jQuery('#test-script').html(dc_arg_html);
                    $sdEventListener(jQuery("#test-script"));
                    // Show test script popup.
                    jQuery('#test-script').dialog({
                      resizable: false,
                      height:'auto',    //No I18N
                      width: 950,
                      modal: true,
                      open: function(){
                        jQ('#test-script').removeClass('disp-h'); //No I18N
                        jQuery("body").addClass('pos-rel'); //No I18N
                      },
                      close: function() {
                        jQ('#test-script').addClass('disp-h'); //No I18N
                        jQ('#test-script').parent().remove(); // No I18N
                        jQuery("body").removeClass('pos-rel'); //No I18N
                      }
                    });
                  }
                  else{
                    deluComp.selectlistAndExecuteDre();
                  }
                // If clicking save button then going to below else check.
                }else{
                  showalert('success', translate(dc_success_msg), "isAutoHide=true"); // No I18N
                  dc_self.constructRouteUrl();
                }

            }
            /**
             * We get the value of which button is triggered.
             */
            var triggeredButton = (dc_save_opt.save_execute) ? "save_execute" : "save"; //NO I18N
			/** After save call back **/
			var dc_is_popup = dc_self.dre_obj.is_popup;
			if(dc_is_popup){
			   dc_self.dre_obj.dc_controller[dc_is_popup.after_save_callback](data.custom_function, triggeredButton);
			}     
        },function(jqXHR, textStatus, errorThrown) {
            //Error message checks.
            if(jqXHR.responseJSON.status === 'mfa_required'){
                showalert("failure",translate('mfa.required'),'isAutoHide=false,delay=30');// No I18N
            }
            var dc_resp_msg = JSON.parse(jqXHR.responseText).response_status.messages[0] , dc_name;
            if (dc_resp_msg != undefined && dc_resp_msg.status_code === 4008) {
                dc_name = translate("dre.function.name.exists");
                if(dc_resp_msg.field == "api_name"){
                    dc_name = translate("admin.common.apiname.failure.msg");
                }
            } else if (dc_resp_msg != undefined && dc_resp_msg.status_code === 4007) {
                showalert('failure' , translate("dre.function.not.exists" , [data.custom_function.id]) , "isAutoHide=false"); // No I18N
                return false;
            } else if(dc_resp_msg != undefined && dc_resp_msg.status_code === 4001 && dc_resp_msg.message == "Extra key found in JSON"){ // No I18N
                dc_name = translate("dre.not.valid.param");
            } else if(dc_resp_msg != undefined && dc_resp_msg.status_code === 4012 && dc_resp_msg.message == "Value not provided"){ // No I18N
                dc_name = translate("dre.function.name.error.msg");
            } else if(dc_resp_msg != undefined && dc_resp_msg.status_code === 4001 && dc_resp_msg.message == "Value provided is not valid" && dc_resp_msg.field == "api_name"){ // No I18N
                dc_name = translate("dre.not.valid.apiname");
            } else if (dc_resp_msg != undefined && dc_resp_msg.message != undefined) {
                dc_name = dc_resp_msg.message;
            } else {
                dc_name = translate("sdp.common.failed");
            }
            showalert('failure' , e_html(dc_name) , "isAutoHide=false"); // No I18N
        });
    },
    // Close dialog
    closeDialog : function(){
        jQuery("#test-script").dialog("close"); // No I18N
        return false;
    },
    validateBeforeUnload: function(){
        var dc_editor_boolean = (this.dre_obj.dc_id || jQ('#dc-form').find('#dc-function-id').val() != "") ? delugeEditor.isEditorContentModified() : (getEditorValue() == "") ? false : true;
        (dc_editor_boolean && !confirm(translate("sdp.requests.resolution.content.notsaved.alert"))) ? (event) ? (event.preventDefault(),event.stopPropagation()): "" : (this.constructRouteUrl());
    },
    // Construct route url
    constructRouteUrl : function(){
        var dre_obj = this.dre_obj;
        var dc_get_popup = dre_obj.is_popup;
        if(dc_get_popup){
            jQ("#"+dc_get_popup.popup_id).dialog('close');
        }else{
            window.location.href = "/app#/admin/custom-functions/"+dre_obj.module+"/"+dre_obj.tab_view+""; // No I18N
        }
    },
    // Construct execute DRE obj
    selectlistAndExecuteDre : function(options){
        var dc_param_obj = {} , dc_req_id ,dc_obj,param_details={},dc_msg="";
        // Custom Actions
        if(options != undefined && options.tab_view == "custom-actions"){
            if(options.module == "rcf") {
                dc_req_id = jQ('[name="requests_head_chkd"]:checked').val(); // No I18N
                dc_obj="requestObj"; // No I18N
                dc_msg="dre.choose.request"; // No I18N
            } else if(options.module == "ccf") { // No I18N
                //dc_req_id = this.getChangeId();
				dc_req_id = jQ('[name="changes_head_chkd"]:checked').val(); // No I18N
                dc_obj="changeObj"; // No I18N
                dc_msg="dre.choose.change"; // No I18N
            } else if(options.module == "tcf") { // No I18N
                dc_req_id = jQ('[name="tasks_head_chkd"]:checked').val(); // No I18N
                dc_obj="taskObj"; // No I18N
                dc_msg="dre.choose.task"; // No I18N
            } else if(options.module == "pcf") { // No I18N
                dc_req_id = jQ('[name="projects_head_chkd"]:checked').val(); // No I18N
                dc_obj="projectObj"; // No I18N
                dc_msg="dre.choose.project"; // No I18N
            }
			else if(options.module == "pbcf") { // No I18N
				dc_req_id = jQ('[name="problems_head_chkd"]:checked').val(); // No I18N
				dc_obj="problemObj"; // No I18N
				dc_msg="dre.choose.problem"; // No I18N
			}
            else if(options.module == "relcf") { // No I18N
                dc_req_id = jQ('[name="releases_head_chkd"]:checked').val(); // No I18N
                dc_obj="releaseObj"; // No I18N
                dc_msg="dre.choose.release"; // No I18N
            }
            else if(options.module.startsWith("cm_")) { // No I18N
                dc_req_id = jQ('[name="'+options.module+'_head_chkd"]:checked').val(); // No I18N
                dc_obj = "customModuleObj"; // No I18N
                dc_msg = "dre.choose.custom.module"; // No I18N
            }
            if (dc_req_id == undefined || dc_req_id == "") {
                alert(translate(dc_msg));
            }
            else{
                param_details[dc_obj] = {"id": dc_req_id}
                dc_param_obj = {param_details:param_details};
                if(window.opener.current_page && window.opener.current_page.indexOf("webhook")!=-1 && window.opener.webhook.execute){
                    window.opener.webhook.execute(dc_param_obj.param_details[dc_obj]);
                }else{
                    window.opener.deluComp.executeDRE(dc_param_obj);
                }
                window.close(); 
            }
        // Global functions
        }else{
            var dc_param = {};
            jQuery('#dc-argument-list div').each(function() {
              dc_arg_name = jQ(this).find('[name=dc-arg-name]').val();
              dc_arg_value = jQ(this).find('[name=dc-arg-value]').val();
              dc_param[dc_arg_name] = dc_arg_value;
            });
            dc_param_obj = {"param_details":dc_param};//No I18N
            this.executeDRE(dc_param_obj);
        }
    },
    // Execute DRE
    executeDRE: function(dc_param_obj) {  
      var  dc_self = this , dc_func_id;
      dc_func_id = jQ('#dc-form').find('#dc-function-id').val(); // No I18N
      ((this.dre_obj.tab_view == "global-functions" || this.dre_obj.global_common_fields) && !jQuery.isEmptyObject(dc_param_obj.param_details)) ? this.closeDialog():""; // No I18N
      dc_self.dreAjax("api/v3/custom_functions/"+ dc_func_id + "/execute" , "PUT" , true ,sdpAjaxInputData({"custom_function": dc_param_obj}) , false , false , function(data) { // No I18N
          var dc_message = data.response_status.messages[0].message;
          dc_self.constScriptSummary({msg: dc_message});
      },function(jqXHR, textStatus, errorThrown) {
          var dc_resp , dc_messages , dc_name;
          dc_resp = JSON.parse(jqXHR.responseText);
          dc_messages = dc_resp.response_status.messages[0];
          if (dc_messages != undefined && dc_messages.status_code === 4001) {
             dc_self.constScriptSummary({msg: dc_messages});
             return false;
          }else if(dc_messages != undefined && dc_messages.status_code === 4007) {
              showalert('failure', translate("dre.function.not.exists", [dc_func_id]), "isAutoHide=false"); // No I18N
              return false;
          }else if (dc_messages != undefined && dc_messages.message != undefined) {
              dc_name = dc_messages.message;
          }else {
              dc_name = translate("sdp.common.failed");  
          }
          showalert('failure', e_html(dc_name) , "isAutoHide=false"); // No I18N
      });    
    },
    // Construct script summary
    constScriptSummary: function(summary_options){
        var dc_message = summary_options.msg, dc_self = this , dc_info = '' , dc_output = "", dc_str = "" , dc_result="" , dc_cls="",dc_msg="";
        // Get script datas.
        if(dc_message.result){
            dc_output = dc_message.output || "" ;
            dc_result = dc_message.result || "" ;
            dc_msg = dc_message.userMessage || "" ;
            dc_cls = "alert-success"; // No I18N
        }
        else{
            dc_output = dc_message.message.errorMessage || "" ;
            dc_result = dc_message.message.result || "" ;
            dc_msg = dc_message.message.userMessage || "" ;
            dc_cls = "alert-danger"; // No I18N
        }
        if(dc_msg != undefined && dc_msg != null && dc_msg!="") {
            jQuery.each(dc_msg, function(index, value) {
                // Get script information.
                 dc_info += "<span>"+e_html(value)+"</span></br>";
            });
        }
        // Get script output.
        if(dc_output != undefined && dc_output!=""){
            dc_output = sdpToJSON(dc_output);
        }
        // Construct Script summary
        dc_str = '<div class="alert icon mb20 '+dc_cls+'" role="alert"><span class="msg">' + e_html(dc_result) + '</span></div><p class="sb">' + dc_self.translateKey("dre.output") + ':</p><div id="dc-output" data-id="dc-output" class="dot-border mb20 p5"><span style="height:138px;">' + e_html(dc_output) + '</span></div><p class="sb">' + dc_self.translateKey("common.info") + ':</p><div id="dc-info" data-id="dc-info" class="block-bordered mb10 p10 info-blk"><span>' + dc_info + '</span></div></div>'; // No I18N
        jQ('#dc-script-summary').html(dc_str); // No I18N
        // Script summary dialog
        jQ('#dc-script-summary').dialog({ // No I18N
            resizable: false,
            height: 'auto', //No I18N
            width: 950,
            modal: true,
            open: function(){
                jQ('#dc-script-summary').removeClass("disp-h");
                jQuery("body").addClass('pos-rel'); //No I18N
            },
            close: function() {
                jQ('#dc-script-summary').addClass("disp-h");
                jQ('#dc-script-summary').parent().remove(); // No I18N
                jQuery("body").removeClass('pos-rel'); // No I18N
            }
        });
    },
    // DRE full screen function
    showfullscreen: function(element) {
        var this_I = jQuery(element),
            this_E = this_I.find('.cspr');
        if (this_E.hasClass('full-screen')) {
            this_E.removeClass('full-screen').addClass('small-screen');
            this_E.closest('a').uitooltip("option", "content", translate("sdp.exit.fullscreen")); //No I18N
            jQuery('body').addClass('of-h');
            jQuery('.zls-btnmn').hide();
            var actions = '<div class="disp-ib form-footer p0 noborder" id="dc_footer" data-id="dc_footer">'; //No I18N
            actions += '<button type="button" class="btn btn-primary" data-id="dc-editor-save" data-event="click" data-handler="deluComp.saveCustomFunction({save_execute : false});return false;" nonce='+sdpNonce+'>' + this.translateKey("sdp.common.save") + '</button>'; //No I18N
            /**
             * To skip the save and test button
             */
            if(!this.dre_obj.skip_save_and_test){
                actions += '<button type="button" data-id="dc-editor-save-test" class="btn btn-default" data-event="click" data-handler="deluComp.saveCustomFunction({save_execute : true});return false;" nonce='+sdpNonce+'>' + this.translateKey("dre.save.test") + '</button>'; //No I18N
            }
            actions += '<button data-event="click" data-handler="deluComp.validateBeforeUnload()" nonce='+sdpNonce+' type="button" class="btn btn-default" id="dc-editor-cancel" data-id="dc-editor-cancel">' + this.translateKey("sdp.common.cancel") + '</button>'; //No I18N
            actions += '</div>'; //No I18N
            // Append new button in table componet list view
            jQuery(".deluge-tools").addClass('tl').closest('.deluge-editor-footer').addClass('tc pt10 pb10').end().before(actions);  //No I18N
            $sdEventListener(jQuery("#dc-delu-edit-area"));
        } else {
            this_E.removeClass('small-screen').addClass('full-screen');
            this_E.closest('a').uitooltip("option", "content", translate("sdp.fullscreen")); //No I18N
            jQuery('body').removeClass('of-h');
            jQuery("#dc_footer").remove();
            jQuery('.zls-btnmn').show();
            jQuery(".deluge-tools").removeClass('tl').closest('.deluge-editor-footer').removeClass('tc pt10 pb10'); //No I18N
        }
        this_I.closest('.delugeEditorArea').toggleClass('ful-scn'); //No I18N
        DelugeEditorUtil.resizeEditor(jQ("#dc-delu-edit-area")[0]);
    },
    
    renderCloneRows: function(data){
        /**
         * We are initializing the clone-row component, if it is global function or global common fields.
         */
        var getDreObj = this.dre_obj;
        if (getDreObj.tab_view == "global-functions" || getDreObj.global_common_fields) {
            var self = this;
            var staticTypeData = ["Map", "string", "int", "bool", "date", "float"]; // No I18N
            var typeData = [];
            for (let index = 0; index < staticTypeData.length; index++) {
                typeData.push({"id" : staticTypeData[index], "text" : staticTypeData[index]});
            }
            /**
             * Clone Rows configuration
             */
            this.cloneOpt = {
                mode : "new", //NO I18N
                selector : "dc-clone-rows", //NO I18N
                min_rows : 1,
                max_rows : 10,
                meta_info : {
                    "name" : { //NO I18N
                        type : "input", //NO I18N
                        place_holder : "sdp.common.name", //NO I18N
                        unique : true,
                        maxlength : 200,
                        error_messages : {
                            data_msg_required : translate("dre.clone.field.error.msg")
                        },
                        onKeyup : function(ele, row){
                            self.validateParameters(ele, row);
                        }
                    },
                    "type" : { //NO I18N
                        type : "select2", //NO I18N
                        place_holder : "sdp.inventory.getinputfile.selecttype", //NO I18N
                        select2 : {"data" : typeData}, //NO I18N
                        error_messages : {
                            data_msg_required : translate("dre.clone.field.error.msg")
                        },
                        onChange : function(ele, row){
                            self.validateParameters(ele, row);
                        }
                    }
                },
                callbackRowDelete : function(){
                    self.validateParameters();
                }
            }
            /**
             * For Edit mode
             */
            if(data){
                this.cloneOpt.data = data;
                this.cloneOpt.mode = "edit"; //NO I18N
            }
            /**
             * Merging the meta_info based on the configuration.
             */
            if(getDreObj.clone_rows && getDreObj.clone_rows.options){
                if(getDreObj.clone_rows.options.meta_info){
                    var getType = getDreObj.clone_rows.options.meta_info.type;
                    if(getType && getType.select2.data){
                        jQuery.extend(this.cloneOpt.meta_info.type.select2, getType.select2);
                    }
                }
                jQuery.extend(true, this.cloneOpt, getDreObj.clone_rows.options);
            }
            this.cloneObj = new cloneRows(this.cloneOpt);
        }
    },

    /**
     * To validate the parmeters
     * @param {array} ele 
     * @param {array} row 
     */
    validateParameters : function(ele, row){
        var getCRValues = deluComp.cloneObj.getValues(true);
        this.appendArguments(getCRValues);
    },

    /**
     * Appending the arguments in header based on the clone row input.
     * @param {array} args 
     */
    appendArguments : function(args){
        var getDreObj = this.dre_obj;
        if (getDreObj.tab_view == "global-functions" || getDreObj.global_common_fields) {
            var delugeArgs = "{";
            var headerArgs = "";
            var getDreObj = this.dre_obj;
            delugeEditor.editor.metadata.delugeFunctionArgs=[];
            /**
             * To Get the default arguments based on the configuration
             */
            args = args || [];
            args = (getDreObj.default_arguments) ?  getDreObj.default_arguments.concat(args) : args;
            for (let index = 0; index < args.length; index++) {
                var getName = args[index]["name"];
                var getType = args[index]["type"];
                if(getName != "" && getType !=""){ 
                    delugeArgs += getType+":"+getName+",";
                    headerArgs += getType+' '+getName+",";
                } 
            }
            headerArgs = headerArgs.slice(0,-1);
            delugeArgs = delugeArgs.slice(0,-1);
            delugeArgs += "}";
            argsElement = jQuery("#dc-arguments");
            /**
             * Arguments are appending in header.
             */
            jQuery(argsElement).text(headerArgs);
            var argsTitle = (argsElement[0].scrollWidth > jQuery(argsElement).outerWidth()) ? headerArgs : "";
            jQuery(argsElement).attr("title", e_attr(argsTitle));
            /**
             * Sending the arguments to the tdeluge editor.
             */
            delugeEditor.addFuncParamsToEditor(delugeArgs);
        }
    },

    /**
     * Updating the return type value in header when changing the return type.
     */
    updateReturnType : function(return_type){
        /**
         * Get the return type value based on the input and we set it in header.
         */
        var dc_return_type_val = return_type ? return_type : jQuery("#return-type").val();
        jQuery("#dc-return-type").text(dc_return_type_val);
        /**
         * we set the return type info in deluge editor info icon.
         */
        jQuery("#return_type_info").attr("title",this.translateKey("dre.header.text", [dc_return_type_val]));
    },

    /**
     * When changing the API field value we set the api name in the header of the editor.
     */
    setApiName : function(){    
         var apiName = jQuery("#api-name").val();
         jQuery("#dc-function-update").text(apiName);
    },

    /**
     * Update the clone rows data when editing.
     */
    setValueCR : function(){
        var self = this;
        var dc_param_data = self.dre_obj.dc_data.custom_function.param_details;
        var paramDetails = [];
        var dreObj = self.dre_obj;
        /**
          * The string is converted to a json object
          */
         dc_param_data = JSON.parse(dc_param_data);
        jQuery.each(dc_param_data, function(key, value){
            /**
             * We have skip the default arguments.
             */
            if(!dreObj.clone_rows || (dreObj.clone_rows && dreObj.clone_rows.options && dreObj.clone_rows.options.skipRow.indexOf(key) == -1)){
                var paramObj = {"name" : key, "type" : {name : value.dataType, "id": value.dataType}}; //NO I18N
                /**
                 * Override the clone rows data based on the configuration.
                 */
                var getCloneRows = self.dre_obj.clone_rows;
                if(getCloneRows && getCloneRows.options && typeof getCloneRows.options.override_data == "function"){
                    paramObj = getCloneRows.options.override_data(paramObj, value);
                }
                paramDetails.push(paramObj);
            }
        });
        self.renderCloneRows(paramDetails);
    },

    /**
     * Including the default arguments in clone rows data.
     * @param {Array} default_args 
     * @param {Object} param_details 
     */
    appendDefaultArguments : function(default_args, param_details){
        for (let index = 0; index < default_args.length; index++) {
            param_details[default_args[index].name] = {"dataType" : default_args[index].type};      
        }
    },
    
    // Get change Id
    getChangeId : function() {
        var elements = null;
        elements = document.ChangeListForm.elements;
        var changeID = "";
        for(var i = 0; i < elements.length; i++) {
            var ele = elements[i];
            if(ele.type == "radio" && ele.name == "checkbox") {
                if(ele.checked) {
                    changeID = ele.value;
                    break;
                }
            }
        }
        return changeID;
    },
    // Description is resized while typing inside description.
    descriptionResize : function(){
        var dc_desc_obj = jQuery("#dc-desc");
        var dc_desc_value = jQuery(dc_desc_obj).val();
        var dc_desc_lines = dc_desc_value.split("\n");
        var dc_comments_len = dc_desc_value.length;
        var dc_desc_width = jQuery(dc_desc_obj).width();
        var dc_desc_chars = Math.round(dc_desc_width/6);
        if(dc_comments_len > dc_desc_chars || dc_desc_lines.length > 1){
          jQuery(dc_desc_obj).css('height','60px'); // No I18N
        }
        else{
          jQuery(dc_desc_obj).css('height','28px'); // No I18N
        }
    }
}
