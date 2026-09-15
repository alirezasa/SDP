/* $Id$ */

/**
 * Following are the list of properties that can be used in config json for notification popup component,
 *
 * module - Module or entity name. Eg: release
 * module_id - Module or entity id
 * template_type - Template content to be shown in the description
 * type - Notification type
 * sub_module - Default to notification. Use "approval" for approval mails
 * sub_module_id - Parent notification id or approval level id in case of approval mail
 * approval_ids - Array of selected approvals
 * to - Array of emails ids (optional)  {email_id:"abc@example.com"}
 * afterNotificationSent - callback function on after sending notification
 * has_attachments - option for popup should have attachment | default true
 * has_cc - option for enable or disable the CC fields in form | default true
 * has_to - option for enable or disable the TO fields in form | default true
 * is_tagging - option for enable or disable  create choice in select2 
 * dialog_height - to set the dialog hieght along with form height | default 680
 * get_temp_content_url - option for sending custom url for getting template content
 * notification_submit_url - custom submit url 
 * api_type - Ajax call type
 * user_fetch - custom user fetching options 
 *  {
 *      url: - option for custom url for user fetch
 *      lookup_field: - option for user lookup field in response 
 *      search_keys: - option for search fields in search criteria | eg : ["email_id", "name"]
 *  }
 * metaSearchParam - option for sending the 'for' param in the search API call
 * beforeNotificationSend - callback function for before notification send
 * recipientsLimit - No of recipients can be added in to cc bcc fields. (SD-127326)
 * _validatorConfig - Config for jQuery validator, Which will override the default config.(SD-127326)
 * For send notification
 * $notification_popup.openNotificationForm({type: "notify_release", "template_type":"Notify_Release", module: "release", module_id: "1"});
 *
 * For reply/forward
 * $notification_popup.openNotificationForm({type: "reply", module: "release", module_id: "1", sub_module_id: "23"});
 *
 * For Approval Mail
 * $notification_popup.openNotificationForm({type: "approval_release", module: "release", module_id: "1",sub_module: "approval", sub_module_id: "23", approval_ids:[2,3,4], to: []});
 *
 */
var $notification_popup = {

    // Default values
    module: null,
    module_id: null,
    mail_configured: false,
    // Store temporarily form data
    notification: {},
    /**
    * Sets the properties from config of popup
    * @param {Object} config Config values
    */
    setConfig: function (config) {

        if(!config || !config.module || !config.module_id || !config.type) {
            throw "Notification component requires config properties";  //No I18N
        }

        this.config = config;

        this.config.isMSP = sdp_app.IS_MSP;
        this.config.isMSPOrSCP = sdp_app.IS_MSPOrSCP;
        this.module = config.module + "s";  // No I18N
        this.module_id = config.module_id;
        this.sub_module = config.sub_module || "notification";  // No I18N
        this.template_type = config.template_type || "";
        this.setUserURL(config);
        // For approval mails alone
        this.approval_ids = config.approval_ids || [];
        // Object to store the notification data temporarily
        this.notification = {};
        this.notification.parent_id = config.sub_module_id || ""; //No I18N
        this.notification.type = config.type; //No I18N
        this.notification.uploadedAttachments = [];
        this.notification.to=[];
        this.notification.cc=[];
        this.notification.bcc=[];
        this.config.has_attachments = config.hasOwnProperty("has_attachments") ? config.has_attachments : true; //No I18N
        this.config.has_cc = config.hasOwnProperty("has_cc") ? config.has_cc : true; //No I18N
        this.config.dialog_height = config.hasOwnProperty("dialog_height") ? config.dialog_height : 650; //No I18N
        this.config.dialog_maxheight = this.config.dialog_height - 50;
        this.config.is_tagging = config.hasOwnProperty("is_tagging") ? config.is_tagging : true; //No I18N
        this.config.show_reply_templates = config.hasOwnProperty("show_reply_templates") ? config.show_reply_templates : false;//No I18N
        this.allowTechCreateReplyTemplate = config.hasOwnProperty("allowTechCreateReplyTemplate") ? config.allowTechCreateReplyTemplate : false;//No I18N
        this.recommend_template_window = config.hasOwnProperty("recommend_template_window") ? config.recommend_template_window : false;//No I18N
        this.mode = config.hasOwnProperty("mode") ? config.mode : "E-Mail";//No I18N
        this.config.has_to = config.hasOwnProperty("has_to") ? config.has_to : true; //No I18N
        this.config.copied_from = config.hasOwnProperty("copied_from") ? config.copied_from : {};//No I18N
        this.config.autoDraft = config.hasOwnProperty("autoDraft") ? config.autoDraft : false;//No I18N
        this.config.draftInterval = config.hasOwnProperty("draftInterval") ? config.draftInterval : 80;//No I18N
        this.config.has_bcc = config.hasOwnProperty("has_bcc") ? config.has_bcc : false; //No I18N
        this.config.populate_cc = config.hasOwnProperty("populate_cc") ? config.populate_cc : true;//No I18N
        this.config.populate_bcc = config.hasOwnProperty("populate_bcc") ? config.populate_bcc : true;//No I18N
        this.config.module_info = config.hasOwnProperty("module_info") ? config.module_info : {};//No I18N
        this.config.zia_suggested_template = config.hasOwnProperty("zia_suggested_template") ? config.zia_suggested_template : {}; //No I18N
        this.config.closeOnEscKey = config.hasOwnProperty("closeOnEscKey") ? config.closeOnEscKey : "yes";//No I18N
        //SD-109330 : To maintain the old Behaviour, any number is accepted, when mode is SMS.
        this.config.is_sms_gateway = config.hasOwnProperty("is_sms_gateway") ? config.is_sms_gateway : false;//No I18N
        this.formChanged = false;
        this.isOpen=false; //Whether notificaiton pop up is on open
        this.firstSave=true;// whether saving draft for the first time
        this.isMinimized=false
        this.config.email_draggable = config.hasOwnProperty("email_draggable") ? config.email_draggable : true;//No I18N
        this.config.email_copy = config.hasOwnProperty("email_copy") ? config.email_copy : true; //No I18N
        this.config.focusField=config.hasOwnProperty("focusField")?config.focusField:"description"; //No I18N
        this.config.ccUsersEnabled = config.hasOwnProperty("ccUsersEnabled") ? config.ccUsersEnabled : false;    // variable introduced for MSP/SCP   //No I18N
        this.config.sendAccManagersEnabled = config.hasOwnProperty("sendAccManagersEnabled") ? config.sendAccManagersEnabled : false;   // variable introduced for MSP/SCP  //No I18N
        if(this.config.show_reply_templates){
            ResourceLoader({js:["/scripts/replytemplate.js","/scripts/hbs-template-solutions-suggest.js","/scripts/include_solutions.js"]});  // No I18N
        }

        //Reply Assistant object will be loaded only if the reply assistant is enabled
        if (this.config.isReplyAssistEnabled) {
            if (typeof $platformai_reply_assist === "undefined") {
                let jsList = ["/scripts/platformai-reply-assist.min.js", "/scripts/hbs-template-platformai-reply-assist.js"];    //NO I18N
                if(sdp_app.IS_DEVELOPMENT_MODE){
                    jsList = ["/scripts/platformai_reply_assist.js"];   //NO I18N
                }
                ResourceLoader({
                    js: jsList,
                    success: function () {
                        $platformai_reply_assist.init();
                    }
                });
            } else {
                $platformai_reply_assist.init();
            }
        }
        this.config.popuptitle = config.popup_title ? config.popup_title : translate('sdp.change.actions.notifylink');//No I18N
        //Popup Description label text customization
        this.config.descriptionText = config.descriptionText ? config.descriptionText : translate("common.description"); //No I18N
        //placeholder added to replace the static To/Cc comment
        var placeHolder = (this.sub_module === 'approval') ? translate("sdp.approvers.select.approvers.placeholder") : translate("announcement.select.email");
        this.config.placeholder = {
             "technicians": (config.placeholder &&  config.placeholder.technicians) ? config.placeholder.technicians : placeHolder,     //No I18N
             "requester": (config.placeholder &&  config.placeholder.requester) ? config.placeholder.requester : placeHolder,     //No I18N
        };
        if(config.to){
            config.to.forEach((mail) => {
               this.notification.to.push({email_id:mail})
              });
        }
        if(config.cc){
            config.cc.forEach((mail) => {
               this.notification.cc.push({email_id:mail})
              });
        }
        if(config.bcc){
            config.bcc.forEach((mail) => {
               this.notification.bcc.push({email_id:mail})
              });
        }

    },
      checkForUnsentNotifications: function (open) {
      //open : Will be passed as true when this method is trigger while opening another notification window
                    if (this.isOpen && open!== undefined ){
                             if(confirm(translate("mailPopups.open"))) { // Alert for opening another notification window when already one is open
                                jQuery("#notification-component-popup-wrapperclose").click(); //No I18N
                                return true;
                              } else {
                                return false;
                              }
                    }
                  else{ // If this method is triggered for page navigation . (open) will be undefined
                       if(this.isMinimized){  // Closing the popup without alert. Because already contents are saved as draft when minimized. Content wont be lost.
                              jQuery("#notification-component-popup").closest("#notification-component-popup-wrapper").find("[data-id='cancel_notification']").trigger('click');//No I18N
                       }
                       else if(jQuery("#notification-component-popup").length>=1){
                               return false; //Double click will append notificaiton-component-popup twice . So returning false.
                       }
                     return true;
                   }
                 },
    /**
     * configure the url to get mail ids on "to" "cc" fields
     *
     * @param {String} module
     */
    setUserURL: function (config) {
        var self = this;
        var extConfig = jQuery.extend({},config);
        self.config.user_fetch = {};
        self.config.user_fetch.url = '/api/v3/users';    //No I18N
        self.config.user_fetch.lookup_field = 'users';   //No I18N
        self.config.user_fetch.search_keys = ['email_id'];   //No I18N
        /**
         * custom user fetch url | lookup field | search keys
         */
        if(!jQuery.isEmptyObject(extConfig.user_fetch)){
            self.config.user_fetch = jQuery.extend(self.config.user_fetch, extConfig.user_fetch);
        }
    },


    /**
     * Opens notification form in dialog
     * @param {String} modId Module id
     * @param {String} notificationId Notification id
     */
    openNotificationForm: function (config) {
        if(!$notification_popup.checkForUnsentNotifications(true)){ //If notification popup is open already returning fasle
               return false ;
        }
           var _self = this;
        // Set config values and load html
        _self.setConfig(config);

        // var { button_element } = config;

        var templateValue = {
            module: _self.module,
            sub_module: _self.sub_module
        };

        
        // Fetch default notification content to be shown in UI
        _self.getNotificationDataToLoadForm().
        done(function (data) {
            if (data.response_status.status === 'success') {
                var notificationData = data.notification_templates ? data.notification_templates : (data.draft ? data.draft : data.notification);
                // Modify description and subject for reply and forward mails
                var modifiedDetails = _self.getModifiedDescAndSubject(_self.notification.type, notificationData);
                if(_self.module == "changes" && _self.config.type === "approval_change"){ // No I18N
                    notificationData.attachments = _self.getEntityAttachments(_self.module,_self.module_id);
                    if(notificationData.attachments.length > 0){
                        notificationData.has_attachments = true;
                    }
                }
                _self.notification = jQuery.extend(_self.notification, modifiedDetails)
                _self.notification = jQuery.extend(_self.notification,{
                    attachments: notificationData.attachments || [],
                    has_attachments: notificationData.has_attachments || false,
                    from: notificationData.from
                //    to: notificationData.to || [],
                //    cc: notificationData.cc || [],
                });
                //Since release module notification content are handled in js level not based on API, skipping release module
                if(_self.module !== 'releases' && _self.module !== 'changes'){//No I18N
                 //_self.notification is used to compare for saving draft.
                    if(notificationData.to && notificationData.to.length > 0){
                       _self.notification.to=notificationData.to;
                    }
                    if(notificationData.cc && notificationData.cc.length > 0 && _self.config.populate_cc){
                       _self.notification.cc=notificationData.cc;

                    }
                    if(notificationData.bcc && notificationData.bcc.length > 0 && _self.config.populate_bcc){
                       _self.notification.bcc=notificationData.bcc;

                    }
                }


                // In case of reply,
                // 1. If the parent notification is an incoming mail,  set to as sender of parent notification
                // 2. If the parent notification is an outgoing mail, set to and cc from parent notification
                if(_self.notification.type.indexOf("reply") != -1){
                    if (notificationData.type &&  notificationData.type.indexOf("incoming") != -1) {
                        notificationData.sender && notificationData.sender.email_id && _self.notification.to.push({email_id:notificationData.sender.email_id})
                    } else {
                        notificationData.to && notificationData.to.forEach(function(x){_self.notification.to.push(x)})
                        notificationData.cc && notificationData.cc.forEach(function(x){_self.notification.cc.push(x)})
                    }
                }

                templateValue = jQuery.extend(_self.notification, templateValue)
                
                templateValue.config = _self.config;
                if(notificationData.type == "recommend_template"){
                    _self.config.recommend_template_window = true;
                    _self.config.show_reply_templates = false;
                    _self.config.custom_type = "recommend_template";//No I18N
                    _self.notification.recommend_template = notificationData.recommend_template;
                }
                if(notificationData.type == 'forward') {
                    _self.config.custom_type = "forward";//No I18N
                }
                _self.openDialog(templateValue);
                _self.populatePopupData(notificationData);

                //bind event for elements inside notification form
                _self.attachEvents();
                _self.setValidatorForForm(document.getElementById("notification_form"));
                if(_self.notification.bcc.length > 0){
                    _self.showBCC();
                 }
                }
             jQuery("#notification-component-popup-wrapper").trigger("notification-popup",[{replyId:_self.notification.parent_id,moduleId:_self.notification.config.module_id}]);     
        });
    },
    /*
    SD-127326 To validate the notification form.
    */
    setValidatorForForm: function(form){
        let _self = this;
        let _validatorConfig = {
            rules: {
                to:"required",//No i18N
                subject: {
                  required: true,
                  maxlength: 500,
                  normalizer: function(value) {
                     value = !value?"":value;//Handed false case.
                     value = trimAll(value);
                     value = value.replace(/\u200B/g, '');
                     return value;
                  }
                }
              },
            messages: {
                to:{
                    required: translate("common.validation",[translate("sdp.common.mail.to")])
                },
                subject: {
                  required:  translate("sdp.common.mail.jsSubErr"),
                  maxlength: translate("form.udf.options.char.length",[500]) //No I18N
                }
              },
            errorPlacement: function(error, element) {
                error.insertAfter(element);
                error.addClass('error text-danger alert-danger pos-abs of-v p3 pl10 pr10 font-small right0 z-ind95');//NO I18N
            },
            invalidHandler: function(event, validator) {//Handle the focus for the first invalid element
                if(validator.numberOfInvalids()>0){
                let invalidElement = jQuery(validator.errorList[0].element);
                if (invalidElement.data("select2")) {//No i18N
                    invalidElement.select2("open");//No i18N
                }else{
                    invalidElement.focus();
                }
              }
            },
        }
        if(_self.config && _self.config._validatorConfig){
            _validatorConfig = jQuery.extend(true,_validatorConfig, _self.config._validatorConfig);//Deep merging.
        }
        jQuery(form).validate(_validatorConfig);
    },
    /**
     * Initalizing the popup form when dialog opens
     */
    initDialogForm : function(){
        var _self = this;
        _self.emailDragDropInit(_self);
        _self.setSelect2DataInForm();
        if(!$notification_popup.checkMailConfigured()){
            jQuery("#notifErrorMsg").show();
            jQuery('#send-notification-section').find(".form-wrapper").css("padding-bottom", "50px"); //NO I18N
            // Cannot provide subexpression inside expression in handlebar template. Hence handling it here
            jQuery("#notifEmailError").text(translate('sdp.admin.importwsdetails.here')); //NO I18N
            // Do not show email not configured banner to users without SDADMIN permission
            if (sdp_user.ROLES.indexOf("SDAdmin") == -1) {
                jQuery("#notifErrorMsg .msg").html('<strong>' +  translate('sdp.common.mail.contactAdmin')  + '</strong>');//No I18N
            }
            if(sdp_user.USERTYPE === "Requester" && _self.config.module === "request"){
                jQuery("#notifErrorMsg").hide();
            }
        }
         //Reply template 
        if(_self.config.show_reply_templates){
            $reply_template.load_rt(_self);
            initTooltip('#send-notification-section');//No I18N
        }   
        if(_self.config.show_status_update){
            jQuery("#reply_template_status").removeClass("hide");
            jQuery("#reply_template_status").addClass("show");
            let status_ele= jQuery("<em class='priority-badge mr5' style='background-color:"+e_attr(_self.config.module_info.request_info.status.color)+"'>&nbsp;</em>"+e_html(_self.config.module_info.request_info.status.name)+'<span class="caret ml5"></span>');
            jQuery("[name=reply_template_status]").find("[name=viewWOStatus]").append(status_ele); //NO I18N
        }
    },
    //For release, to, cc input will be loaded
    setSelect2DataInForm: function () {
        var _self = this;
        var is_sms_gateway = _self.config.is_sms_gateway;
        var enableEmailDraggable = _self.config.email_draggable;
        var enableCopyEmail = _self.config.email_copy;

        if(enableEmailDraggable) {
            var elements = ['sendnotifyto', 'sendnotifycc', 'sendnotifybcc']; //No I18N

            if(!_self.config.has_cc && !_self.config.has_bcc){
            	 enableEmailDraggable = false;
            } else {
                jQuery(_self).trigger('select2BeforeInit',[elements]);
            }

        }

        //For requester login, only tagging alone enabled
        if(sdp_user.USERTYPE == "Requester"){
            var input_data = {
                tags:[],
                minimumInputLength: 1,
                maximumSelectionSize: _self.config.recipientsLimit?_self.config.recipientsLimit:100,
                placeholder: _self.config.placeholder.requester,
                formatInputTooShort: function() {
                    return translate('tfa.email.enterEmail');
                },
                formatNoMatches: translate("sdp.common.email.id.invalid"),
                createSearchChoicePosition: "top",  //NO I18N
                createSearchChoice:function(term, data) {
                    term =term.trim();
                    var matchFound = data.some(function(item){
                        return item.text.toLowerCase() === term.toLowerCase();
                    });
                    if(matchFound){return null;}
                    //Used while creating tags this used when we are providing tag options
                    var patt = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                    //SD- Unable to type a new mail if it is substring of existing mail
                    if(patt.test(term)){
                        return {id:term,text:term};
                    }
                }
            };
        }
        else{
            var list_info = {start_index: 1, row_count: 20, sort_field: 'name'}; // No I18N
            if(_self.config.users_fields_required){
                list_info.fields_required = _self.config.users_fields_required;
            }
            var input_data = {
                maximumSelectionSize: _self.config.recipientsLimit?_self.config.recipientsLimit:100,
                formatSearching: window.translate("ae.common.search.text"),
                formatNoMatches: window.translate("ae.common.select2nomatchesfound"),
                formatNoRecordsFound: window.translate("ae.common.select2norecordsfound"),
                tags: true,
                placeholder: _self.config.placeholder.technicians,
                multiple: true,
//                maximumSelectionSize: (is_sms_gateway && _self.mode==='SMS') ? 1 : null, //NO I18N
                closeOnSelect: false,
                createSearchChoicePosition: "top",  //NO I18N
                createSearchChoice:function(term, data) {
                    term =term.trim();
                    if(data) {
                        var matchFound = data.some(function(item){
                            return item.text.toLowerCase() === term.toLowerCase();
                        });
                    }
                    if(matchFound){return null;}
                    //Used while creating tags this used when we are providing tag options
                    var patt = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                    //SD-109330 : To maintain the old Behaviour, any number is accepted, when mode is SMS.
                    var num_patt = /^\+?[0-9]*$/;
                    //SD- Unable to type a new mail if it is substring of existing mail
                    if(is_sms_gateway && _self.mode==='SMS'){
                        if(num_patt.test(term)){
                            term = term.replace('+','');
                            return {id:term,text:term};
                        }
                    }
                    else if(patt.test(term)){
                        return {id:term,text:term};
                    }
                },
                url: [{
                    async: true,
                    url: _self.config.user_fetch.url,
                    field: _self.config.user_fetch.lookup_field,
                    list_info: list_info,
                    cache: [],
                    search_keys: _self.config.user_fetch.search_keys,
                    processResults: function (cacheData, data, field, i) {
                        //SD-109330 : To maintain the old Behaviour, any number is accepted, when mode is SMS.
                        if(_self.mode !='SMS' || !is_sms_gateway){
                            if ((data.email_id && data.email_id.length) || (data.value && data.value.email_id && data.value.email_id.length)) {
                                cacheData.push({
                                    id: data.id ,
                                    text: data.text || data.email_id || data.value.email_id,
                                    value: data
                                });
                            }
                        }
                    },
                    input_data_Callback: _self.config.input_data_Callback && typeof _self.config.input_data_Callback == "function" ? _self.config.input_data_Callback : function(options, inputObj){//No I18N
                        //SD-113636 : Search Criteria to get Email ID's which are not null.
                        if(inputObj.list_info.search_criteria){
                            inputObj.list_info.search_criteria.push({
                                field: 'email_id',//No I18N
                                condition: 'NEQ',//No I18N
                                values: null,
                                logical_operator: "and"//No I18N
                              })
                        }
                        else{
                            inputObj.list_info.search_criteria = [{
                                field: 'email_id',//No I18N
                                condition: 'NEQ',//No I18N
                                values: null,
                                logical_operator: "and"//No I18N
                              }];
                        }
                        if(isMSP && _self.config.msp_users_search_criteria){
                            inputObj.list_info.search_criteria.push(_self.config.msp_users_search_criteria);
                        }
                        return inputObj;
                    }
                }],
                // formating the search data with user name and email
                formatResult: function(result, container, query, escapeMarkup){
                    if(!jQuery.isEmptyObject(result.value)){
                        var markup=[];
                        var name = result.value.name ? result.value.name : (result.value.value ? result.value.value.name : "");
                        window.Select2.util.markMatch(name +","+result.text, query.term, markup, escapeMarkup);
                        if (result.isNew) {
                            return markup.join("");
                        } else {
                            return '<span class="post-tag">'+markup.join("")+'</span>';
                        }
                    }else{
                        return e_html(result.text);
                    }
                },
                formatSelectionCssClass: function(result, div) {
                    var name = (result.value && result.value.name) ? result.value.name : (result.value && result.value.value ? result.value.value.name : "");

                    if (enableCopyEmail) {
                        //create copy element
                        var span = createCopyEmail(div[0], {
                            name: name,
                            email: result.text,
                            eventName: 'replyCopyEmail', //No I18N
                            positionElement:'parent' //No I18N
                        });
                    }


                    if(enableEmailDraggable) {
                        jQuery($notification_popup).trigger('select2AddChoice',[div]);
                    }

                },
                formatSelection : function(result)
                {
                    var name = (result.value && result.value.name) ? result.value.name : (result.value && result.value.value ? result.value.value.name : "");
                    return e_html(isEmpty(name) ? result.text : name + "," + result.text);
                }
            };
        }

        if(_self.config.metaSearchParam && !_self.config.is_add_level){
            input_data.searchInputDataCallback = function(inputObj){
                inputObj["for"] = _self.config.metaSearchParam;
                return inputObj;
            }
        }

        if(!_self.config.is_tagging){
            input_data.createSearchChoice = function(){
                return undefined;
            };
        }

        // Set `to` field value
        // SD-113636 : Common Select2 for all to, cc and bcc.
        var toEle = jQuery("#sendnotifyto, #sendnotifycc, #sendnotifybcc"); //No I18N
        if(sdp_user.USERTYPE == "Requester"){  //NO I18N
            toEle.select2(input_data);
        }else{
            toEle.sdp_select2(input_data);
        }
        //By default open "TO" field in select2
        toEle.on("select2-selecting",function(e){
            modifySelect2data(e,this)
             handleDropdownClose(e,this)

        });
        _self.notification.to && toEle.select2('data', _self.notification.to.map(function (email){ // No I18N
            return {
                id: email.email_id,
                text: email.email_id
            }
        })); //no i18n
        // disable to field if notification opened from approvals
        if(_self.sub_module === 'approval' && _self.notification.to.length > 0){
            jQuery("#sendnotifyto").select2('enable', false);   //NO I18N
        }

        // Set cc field value
        if(_self.config.has_cc){
            var ccEle = jQuery("#sendnotifycc");

            ccEle.on("select2-selecting",function(e){
                 modifySelect2data(e,this)
                 handleDropdownClose(e,this)
            })
            _self.notification.cc && ccEle.select2('data', _self.notification.cc.map(function (email){ // No I18N
                return {
                    id: email.email_id,
                    text: email.email_id
                }
            })); //no i18n
        }
        if(_self.config.has_bcc){
            var bccEle = jQuery("#sendnotifybcc");
            bccEle.data("select2").opts.maximumSelectionSize = 10//No i18N
            bccEle.on("select2-selecting",function(e){
               modifySelect2data(e,this)
               handleDropdownClose(e,this)
            })
            _self.notification.bcc && bccEle.select2('data', _self.notification.bcc.map(function (email){ // No I18N
                return {
                    id: email.email_id,
                    text: email.email_id
                }
            }));
        }

        if(enableEmailDraggable) {
             jQuery($notification_popup).trigger('select2AfterInit');
        }

        // handle drowdown close when selecting the data
         function handleDropdownClose(e, $this){
             e.preventDefault();
             var target = jQuery($this);
             let maxSelectionSize = target.data("select2").opts.maximumSelectionSize;//No I18N
             if(maxSelectionSize && target.select2('data').length >= maxSelectionSize){//SD-127326 If maximum values selected we can close the select2 field.
                 target.select2("close"); //No I18N
             }
             else{
                target.select2("open"); //No I18N
                target.select2("positionDropdown"); //No I18N
             }
             target.valid();//SD-127326 If error tool tip was already showing, It can be removed if valid now.
         }
         function modifySelect2data(e,$this){ //To modify the selected select2 data.
             e.preventDefault();
             var target = jQuery($this);
             var data = target.select2('data'); //No I18N
             if(typeof _self.config.modifySelect2data== "function" ){ //NO I18N
                 _self.config.modifySelect2data(e,data);
             }
             else{
                 data.push({'id': e.object.id, 'text': e.object.text,'value': e.object.value }); //No I18N
             }
             target.select2('data', data); //No I18N
          }
   

       
    },
    openDialog: function (hbsData) {
        jQuery('.page-progressbar, #freeze-details').show(); //Progress bar load before opening dialog //No I18N
        //TODO change the height to default 680
        var _self = this;

            jQuery("body").append("<div id='notification-component-popup-wrapper' class='disp-h'></div>"); //No I18N

            jQuery("#notification-component-popup-wrapper").append('<div id="notification-component-popup" class="fw"></div>'); //No I18N
            renderhbs('#notification-component-popup', 'notification-component', hbsData, false, 'components', null, null);
            var options = {
                title: _self.config.popuptitle,
                minimizable: (_self.config.canMinimize)?_self.config.canMinimize:false,
                maximizable: true,
                type:(_self.config.popupModel)?_self.config.popupModel:"modal", //No I18N
                width:'950px',//No I18N
                closeOnEscKey: false,
                open:function(eve){
                      _self.isOpen=true;
                      jQuery('.page-progressbar,#freeze-details').hide(); // Stoping progress bar after opening the dialog //No I18N
                      //Editor focus is already given in loadRTAforNotification() method.Since it is not working for zcomp-dialog
                    //Giving editor focus manually.
                       if( _self.config.focusField=='description' && ZEditor && ZEditor.notificationDescEditor){ //No I18N
                          ZE_Init.focus("notificationDescEditor"); //No I18N
                       }
                       else if(_self.config.focusField=='to'){ //set focus for to field //No I18N
                          jQuery("#sendnotifyto").select2("open"); //No I18N
                       }
                },
                minimize :function(eve){
                     if(_self.config.enableDraft && !_self.pauseAutoDraft){ //Saving draft on minimize if draft is enabled.
                               _self.saveAsDraft(document.getElementById("notification_form"));//No I18N
                      }
                       _self.isMinimized=true;
                },
                restore : function(eve){
                     _self.isMinimized=false;

                },
                beforeclose: function(eve) {
                    if(jQuery("#notification-component-popup-wrapper").length >= 1) { //No I18N
                        jQuery("#notification-component-popup-wrapper").remove(); //No I18N
                    }
                    _self.isOpen=false;
                    _self.isMinimized=false;
                },

                height: jQuery(window).height(),
                position: {
                    right: "0px", //No I18N
                    top: "0px" //No I18N
                },
                draggable: false,
                resizable: {

                    directions: "w" ,//No I18N
                    minWidth: 920

                },
                animation:{
                 open:{
                     className:'zeffects--slideright', //No I18N
                     duration:300
                 }
                }
            };
            if(_self.config.freezelayer){
                options.custom_options= {//Custom option for freeze layer with minimize icon
                       freezelayer: true
                 }
              }
            if(sdp_user.DIRECTION == "RTL"){ //No I18N
              options.position = {
                left: "0px", //No I18N
                 top:"0px", //No I18N
              };
              options.resizable = {
                 directions: "e" , //No I18N
                 minWidth: 920
              };
              options.animation={
               open:{
                  className:'zeffects--slideleft', //No I18N
                  duration: 300
               }
              }
            }
            jQuery("#notification-component-popup-wrapper").sdp_zcomponent_dialog(options); //No I18N

        _self.initDialogForm();
        if(_self.config.autoDraft){
            _self.intervalHandler = setInterval(function(){
                if(!_self.isMinimized && !_self.pauseAutoDraft){ //Auto draft will be paused on minimize
                      _self.saveAsDraft(document.getElementById("notification_form"));//No I18N
                }
            },_self.config.draftInterval * 1000);
        }
        jQuery("#notification-component-popup-wrapperclose").off('click').on('click',(event)=>{($notification_popup.handleCloseDialog())});//No I18N
        jQuery("#notification-component-popup-wrapperminimize").off('click').on('click',(event)=>{($notification_popup.handleMinimizeDialog())});//No I18N


    },
    handleMinimizeDialog: function(){
         var _self=this;
        _self.showHideActionIncludeSolutionBackToReplyButton();
        if(!_self.isMinimized && _self.config && _self.config.minimizeCallback && typeof _self.config.minimizeCallback === "function" ){
            if(!_self.config.minimizeCallback(_self)){{ // Returns whether (can minimize or not).
                    window.event.stopPropagation(); //stopping event
                    return;
            }}
        }


    },
    handleCloseDialog: function(){
        var _self = this;
        if(_self.config.enableDraft){
            var input_data =  _self.getNotificationDataFromForm(document.getElementById("notification_form"));
            if(_self.compareObject(input_data) && confirm(translate("sdp.requestcatalog.reorder.save"))){
                _self.saveAsDraft(document.getElementById("notification_form"));//No I18N
            }
        }
        jQuery("#notification-component-popup").closest("#notification-component-popup-wrapper").find("[data-id='cancel_notification']").trigger('click');//No I18N
    },
    /**
     * Popuplating the data after popup render
     */
    populatePopupData: function(notificationData){
        var _self = this;
        // If notification has attachments in it and if message type is forward
        //if (_self.notification.type.indexOf("forward") != -1 && notificationData.has_attachments) {
            var typesForAttachments=["forward","approval_change"];
            if(notificationData.has_attachments && ((_self.module !== "releases"&& _self.module !== "changes") || typesForAttachments.indexOf(_self.notification.type) != -1)){//No I18N
               _self.populateAttachments(notificationData.attachments);
        }

        if(_self.config.recommend_template_window){
            jQuery("#rf-template-list-section").removeClass("hide");    //No I18N
            var selected_template = {}, isServiceTemplate = false;
            if(notificationData.recommend_template){
                selected_template.id = notificationData.recommend_template.id;
                selected_template.text = notificationData.recommend_template.name;
                isServiceTemplate = notificationData.recommend_template.is_service_template;
                _self.setRecommendTemplate(selected_template.id);
            }
            else if(_self.config.zia_suggested_template.id){
                selected_template.id = _self.config.zia_suggested_template.id;
                selected_template.text = _self.config.zia_suggested_template.text;
                isServiceTemplate = _self.config.zia_suggested_template.is_service_template;
                _self.setRecommendTemplate(selected_template.id);
            }
             $req.common.switchTemplateTab( isServiceTemplate ? "service" : "incident", true,"Recommend_Template" ); //No I18N
             if(selected_template.id){
                jQuery("#rf-template-" + (isServiceTemplate ? "service" : "incident") + "-list").select2("data", { id: selected_template.id, text: selected_template.text });    //No I18N
             }


        }
        // Enable the edit button
        // jQuery(button_element).prop("disabled", false); //No I18N
        //Load Rich text area
        _self.loadRTAForNotifications()

    },
    /**
     * Attach events for the popup action buttons
     */
    attachEvents: function () {
        var self = this;
        var dialog_layer = jQuery("#notification-component-popup").closest("#notification-component-popup-wrapper");//No I18N
        // Attach send button
        dialog_layer.off('click.notificationpop', '[data-id="send_notification"]').on('click.notificationpop', '[data-id="send_notification"]', function (event) { //No I18N
            event.stopPropagation();
            self.onNotificationSend(document.getElementById("notification_form"));
        });
        // Attach cancel button
        dialog_layer.off('click.notificationpop', '[data-id="cancel_notification"]').on('click.notificationpop', '[data-id="cancel_notification"]', function (event) { //No I18N
            event.preventDefault();
            //Clear the notification data before leave form
            self.notification = {};
            self.notification.parent_id = ""; //No I18N
            self.notification.type = ""
            self.notification.uploadedAttachments = [];
            if (self.dialog) {
                self.effectBackFromFormInNotifDialog();
            } else {
                self.clearAutoDraftInterval();
                jQuery("#notification-component-popup-wrapper").sdp_zcomponent_dialog("close");//No I18N
            }
            self.config.hasOwnProperty("afterNotificationCancel") //No I18N
                && (typeof self.config.afterNotificationCancel === 'function')    //No I18N
                && self.config.afterNotificationCancel.call();

        });
        // Hide outgoing mail not configured banned on trigger
        dialog_layer.off('click.notificationpop', '#notifEmailError').on('click.notificationpop', '#notifEmailError', function (event) { //No I18N
            jQuery('#send-notification-section').find(".form-wrapper").css("padding-bottom", "10px"); //NO I18N
            jQuery("#notifErrorMsg").hide();
            parent.closeDialog();
        });

          dialog_layer.off('click.notificationpop', '[data-id="saveDraft"]').on('click.notificationpop', '[data-id="saveDraft"]', function (event) { //No I18N

            if(dialog_layer.find("#sendnotifysub").valid() && !self.saveAsDraft(document.getElementById("notification_form"),true)){//No I18N
                        showalert("warning", translate("common.nothing.to.save"), "isAutoHide=true, delay=15");	//No I18N
                    }
                });

        dialog_layer.off('click.notificationpop', '#addBcc').on('click.notificationpop', '#addBcc', function(){ //No I18N
            self.showBCC();
        });

        dialog_layer.off('click.notificationpop', '[data-id="send_for_review"]').on('click.notificationpop', '[data-id="send_for_review"]', function(){ //No I18N
            !self.pauseAutoDraft && self.saveAsDraft(document.getElementById("notification_form"));//Saving draft before moving to send for review //No I18N
            $review_window.openReviewDialog(true, self.config.module_id);
        });

         dialog_layer.off('click.notificationpop', '[name="viewWOStatus"]').on('click.notificationpop', '[name="viewWOStatus"]', function(){ //No I18N
            $req.prop.setEditReplyTemplateStatus(false,self.config.fromListView);
        });

        jQuery("#notifDescText").off('ZE.insertTemplate').on('ZE.insertTemplate',function(event,instance) {     //No I18N
            $includeSolution.openIncludeSolutionPage();
        });
        if(self.config.recommend_template_window){
            dialog_layer.off('change').on('change', '#rf-template-incident-list,#rf-template-service-list', function(event){ //No I18N
               let val= jQuery(this).get(0).value
               self.setRecommendTemplate(val)
            });
        }
        jQuery("#notification-component-popup").find("[data-id='send_notification'],[data-id='cancel_notification'],[data-id='send_for_review'],[data-id='saveDraft']").removeClass("disabled"); //No I18N
    },


    /**
     *
     * Modify title and description values for reply/forward mails
     *
     * @param {String} type Notification Type
     * @param {Object} details Notification Template details
     */
    getModifiedDescAndSubject: function (type, details) {
        var self=this;
        //TODO need to check with server team regard content
        var desc = details.description || details.content ;
        // Notification template has subject and, notification has title, as field names
        var subject = details.title || details.subject;
        var sender_mailid="";
        if(typeof details.sender!=="undefined" && typeof details.sender.email_id!=="undefined" && details.sender.email_id!==null ){
            sender_mailid=details.sender.email_id!=null?"&lt;" + details.sender.email_id + "&gt; <br>":""
        }
        if(self.module === "releases" || self.module === "changes"){
            if (type == "reply") {
                desc = "<br><hr><br>" + //No I18N
                    "---- On "+details.sent_time.display_value+" <b>"+e_html(details.sender.name)+" "+sender_mailid+" wrote ----</b>" + //No I18N
                    "<blockquote> " + //No I18N
                    desc + "</blockquote>"; //No I18N
                subject = translate('sdp.common.email.prefix.reply') + subject; //No I18N
            } else if (type == "forward") { //no i18n
                var ccmails = details.cc.map(function(user){
                    return user.email_id;
                });
                var tomails = details.to.map(function(user){
                    return user.email_id;
                })
                var cc_desc = (details.cc.length > 0) ? (translate('sdp.common.cc') + " : " + ccmails.join(", ") + "<br>") : ""; //No I18N
                desc = "<br>============ " + translate('sdp.common.email.forwardedmsg') + " ============<br>" + //No I18N
                    translate('sdp.common.mail.from') + " : " + e_html(details.sender.name) + sender_mailid+ "<br>" + //No I18N
                    translate('sdp.common.mail.to') + " : " + tomails.join(", ") + "<br>" + //No I18N
                    cc_desc +
                    translate('sdp.common.date') + " : " + details.sent_time.display_value + " <br>" + //No I18N
                    translate('sdp.common.subject') + " : " + subject + "<br>" + //No I18N
                    "============ " + translate('sdp.common.email.forwardedmsg') + " ============<br><br>" + desc; //No I18N
                subject = translate('sdp.common.email.prefix.forward') + subject; //No I18N
            }
        }

        return {
            "subject": subject, //No I18N
            "description": desc //No I18N
        }
    },

    /**
     * Gets the notification details for v3 api
     * @return {Object} Returns jQuery XMLHttpRequest Object
     */
    getNotificationDataToLoadForm: function () {

        var _self = this;

        // For approval mails
        if(_self.sub_module === 'approval'){
            var get_aprv_content_url = '/api/v3/' + _self.module + '/' + _self.module_id + '/approval_levels/' + _self.notification.parent_id + '/approvals/_get_notification_content'; // No I18N
            //if approval url present in config
            _self.config.get_temp_content_url && (get_aprv_content_url = _self.config.get_temp_content_url);

             var ajaxJson = {
                url: get_aprv_content_url,
                type: 'GET', // No I18N
                async: false
            }
            if(_self.config.is_add_level)
            {
                ajaxJson.data = sdpAjaxInputData({"for":"add_approval_level"}); // No I18N
            }

             return sdpAjax(ajaxJson);
        }else if(_self.config.get_temp_content_url){
             return sdpAjax({
                url: _self.config.get_temp_content_url,
                type: 'GET', // No I18N
                async: false
            });



        }else{

            var input_data = {
                notification_template : {
                    type: _self.template_type,
                    module: _self.module.replace(/s$/, '')
                }
            };
            // For send notification. First make call to get notification id, then make call again to get notification content
            if (_self.notification.parent_id === "") {

                var notificationContent =  sdpAjax({
                    url: '/api/v3/' + _self.module + '/' + _self.module_id + '/_notification_templates', // No I18N
                    type: 'GET', // No I18N
                    data: sdpAjaxInputData(input_data),
                    async: false
                });

            if (notificationContent.responseJSON.notification_templates && notificationContent.responseJSON.notification_templates[0].id) {
                    return sdpAjax({
                        url: '/api/v3/' + _self.module + '/' + _self.module_id + '/_notification_templates/' + notificationContent.responseJSON.notification_templates[0].id, // No I18N
                        type: 'GET', // No I18N
                        async: false
                    });
                }
            }
            else {
                if(_self.module !== "releases" && _self.module !== "changes"){
                    return sdpAjax({
                        url: '/api/v3/' + _self.module + '/' + _self.module_id + '/notifications/' + _self.notification.parent_id + '/_notification_templates', // No I18N
                        type: 'GET', // No I18N
                        data: sdpAjaxInputData(input_data),
                        acceptODCompatible: true,
                        async: false
                    });
                }
                else{
                    return sdpAjax({
                        url: '/api/v3/' + _self.module + '/' + _self.module_id + '/notifications/' + _self.notification.parent_id, // No I18N
                        type: 'GET', // No I18N
                        //data: sdpAjaxInputData(input_data),
                        acceptODCompatible: true,
                        async: false
                    });
                }
            }
        }
    },

    /**
     * Loads Rich text editor for the notification description field
     */
    loadRTAForNotifications: function () {

        // Unable to specify fullScreen mode in config
        var _self = this;
        var config = {
            element: 'notifDescText', //No I18N
            edithtml: true,
            allowFullscreen: {
                title: translate("sdp.common.description") //Description editor full screen allowed
            },
           fullscreenClose: function() {/*Editor close callback event */
                jQuery('body').removeClass('of-h');
            },
            isEnterKeyHandler: true,
            avoidMoreOption: true,
            customName: "notificationDescEditor", //No I18N
            focus: (_self.config.focusField=='description')?true:false, //No I18N
            needWrapper:true,
            maintainStructure: true,
            inlineimagesAPI: '/api/v3/' + _self.module + '/' + _self.module_id + '/notifications/images', //No I18N
            showAsVideo : true,
            /**
             * SD - 118354 -> String trim overwrite issue fix
             */
            enableNativeTrim : _self.config.enableNativeTrim || false
        };
        if(_self.config.imgParameters){
            config.imgParameters = _self.config.imgParameters;
        }
        // Inline image is not supported for approval in phase 1
        if(_self.sub_module === "approval"){
            config.buttonsToHide = ["image"]; //No I18N
        }

        //Inline image is not supported for forward and submit approval for solution module
                if(_self.module === "solutions"){
                    config.buttonsToHide = ["image"]; //No I18N
                }

        //For include solution button for request's reply popup
        if(_self.config.module == "request" && _self.config.custom_type == "reply" && sdp_user.ROLES.indexOf("ViewSolutions") != -1){
            config.insertTemplate = true;
            config.insertTemplateTooltip = translate("solution.insert.include");
        }

        config.customizeInitObject = function (initobject) {
            /**
             * Can be customized this as per your preference
             */

            //For inserting GPT icon for providing reply assistance in request's reply popup
            if (_self.config.isReplyAssistEnabled &&
                (_self.config.custom_type == 'reply' || _self.config.custom_type == 'forward' || _self.config.custom_type == 'conversation')    //NO I18N
            ) {
                initobject.toolbarOrder.push([["custom", translate('zia.bot.platformai.usecase6'), "cspr icon-xl chat-gpt mt2 tf0-8", function () { //No i18N
                    $platformai_reply_assist.showDropDown(_self.config.custom_type);
                }, "", "", "", "other"]]);
            }

        }

        parent.window.zeditor(config); //No i18n
		if(_self.config && _self.config.has_attachments) {//Attachment initialize call skip in has_attachments as "false"
			_self.initialiseNotificationAttachPreview();
		}
    },

    /**
     * Initializes the attachment preview
     */
    initialiseNotificationAttachPreview: function () {
        var self = this;
        var attach_options = {
            "api": false, // No I18N
            "upload_api": true, //No I18N
            "is_odapi": true, //No I18N
            "direct_upload": false, //No I18N
            "base_url": "/api/v3/" + self.module + "/" + self.module_id, //No I18N
            "entity": "notifications", //No I18N
            "entity_id": "", //No I18N
            "drop_element": "#notification-attachments", //No I18N
            "download": false, //No I18N
            "rerenderOnUpload": false, //No I18N
            "servlet_cb": function (response, attachmentEle) { //No I18N
                self.onuploadNotificationAttachmentCB(response, attachmentEle);
            },

            "title": false, //No I18N
            "upload": true, //No I18N
            "enable_delete": true, //No I18N
            "ondelete": function (context, attachmentEle) { //No I18N
                self.onDeleteNotificationAttachmentCB(context, attachmentEle);
            }


        };
        self.attachComponent = new attachPreview('#notification-attachments-api', attach_options); //No I18N
    },

    /**
     * Callback function after attachment is uploaded
     * @param {Object} response Response received for the /upload api call
     * @param {Element} attachmentEle Attachment element
     */
    onuploadNotificationAttachmentCB: function (response, attachmentEle) {
        var isFailed = false,
            self = this;
        response && response.responseJSON && (response = response.responseJSON);
        if (response && response.response_status) {
            if (response.response_status.status === "success") {
                if (response.attachment) {
                    self.notification.uploadedAttachments.push(response.attachment);

                    if (attachmentEle && attachmentEle.length > 0) {
                        var fsize = response.attachment.size.display_value || response.attachment.size;
                        var filename = response.attachment.name || response.attachment.file_name;
                        attachmentEle.data("attach-id", response.attachment.id); //No I18N
                        attachmentEle.data("attach-url", response.attachment.content_url); //No I18N
                        attachmentEle.data("attach-size", fsize); //No I18N
                        attachmentEle.data("attach-name", filename); //No I18N
                        /** Get title from attach component function and render to element, latest feature suppoRT attach by/on in tooltip **/
                        var title = attachPreview.prototype.constructTitle(filename, fsize, null, response.attachment.attached_by.name, response.attachment.attached_on.display_value);
                        attachmentEle.attr({"title": title,"rel":"uitip","mode_html":"true"}); //No I18N
                        attachmentEle.parent().siblings("span:first") //No I18N
                            .html('<span class="atdrpactn text-center" data-attach-delete="true"><i class="cspr close3 mt1 flat" rel="uitip"  mode-ellipsis="true"  title="'+translate("common.delete")+'"></i></span>'); //No I18N
                    }
                    /** re-binding the events for the attachments */
                    if (self.attachComponent && self.attachComponent.loadEvents) {
                        self.attachComponent.loadEvents();
                    }
                }
                self.formChanged = true;
            } else if (response.response_status.messages) {
                window.showalert("failure", e_html(response.response_status.messages[0].message), "isAutoHide=true"); //No I18N
                isFailed = true;
            }
        } else {
            window.showalert("failure", translate("sdp.common.attachment.error"), "isAutoHide=true"); //No I18N
            isFailed = true;
        }

        if (isFailed && attachmentEle && attachmentEle.length > 0) {
            attachmentEle.closest(".btn-group").remove(); //No I18N
            if (jQuery("#notification-attachments-api").find(".btn-group").length == 0) {
                jQuery("#notification-attachments-api").hide();
            }
        }
        initTooltip("#notification-attachments-api"); //No I18N

    },

    /**
     * Callback function after attachment is deleted
     * @param {Object} context Context of the function when invoked
     * @param {Element} attachmentEle Attachment element
     */
    onDeleteNotificationAttachmentCB: function (context, attachmentEle) {

        if (!attachmentEle) {
            return;
        }
        var attach_id = attachmentEle.data("attach-id"), //No I18N
            self = this;
        var index;
        var len = self.notification.uploadedAttachments.length;
        for (var i = 0; i < len; i++) {
            if (self.notification.uploadedAttachments[i].id == attach_id) {
                index = i;
                break;
            }
        }

        self.notification.uploadedAttachments.splice(index, 1);

        attachmentEle.closest(".btn-group").fadeOut("fast", function () { //No I18N
            jQuery(this).remove();
            if (jQuery("#notification-attachments-api").find(".btn-group").length == 0) {
                jQuery("#notification-attachments-api").hide();
            }
        });
        self.formChanged = true;
    },

    /**
     * Adding notification via v3 api
     * @param {Element} notificationForm Notifications form element
     */
    onNotificationSend: function (notificationForm) {
        var self = this;
        self.is_formsubmit = true;
        self.input_data = {};
        // Validate form
        if (self.validateNotificationForm(notificationForm)) {
            var $notificationForm = jQuery(notificationForm);
            self.input_data =  self.getNotificationDataFromForm(notificationForm);
            var url = '',
                type = '';

            if(self.config.hasOwnProperty("beforeNotificationSend") && typeof self.config.beforeNotificationSend === 'function'){
                self.config.beforeNotificationSend(self,notificationForm);
            }
            var notification = self.input_data;
            var inputData = sdpAjaxInputData({
                "notification" : notification //No I18N
            });
            // Change URL as per subentity name
            if(self.sub_module === "approval"){
                if(self.config.api_type != "POST"){
                    url = '/api/v3/' + self.module + '/' + self.module_id + '/approval_levels/' + self.notification.parent_id + '/approvals/_send_notification?ids=' + self.approval_ids.join(','); // No I18N
                    type = 'PUT'; // No I18N
                    inputData = sdpAjaxInputData({
                        approval: {
                            notification: {
                                title: notification.subject,
                                description: notification.description,
                                attachments: notification.attachments,
        //                            Commented for now, remove comment when inline image handled properly
        //                            images: notification.images || {}
                            }
                        }
                    });
                }else{
                    type = "POST"; //No I18N
                    inputData = sdpAjaxInputData(self.input_data)
                }
            } else {
                url = '/api/v3/' + self.module + '/' + self.module_id + '/notifications'; // No I18N
                type = 'POST'; // No I18N
            }
            self.config.notification_submit_url && (url = self.config.notification_submit_url);
            self.config.api_type && (type = self.config.api_type);
            if(self.is_formsubmit){
                self.pauseAutoDraft = true;
                self.disableSaveButton(true);
                sdpAjax({
                    url: url,
                    type: type,
                    data: inputData,
                    acceptODCompatible: true,
                    success: function (response) {
                        if ((Array.isArray(response.response_status) ? response.response_status[0].status : response.response_status.status) === "success") {
                            self.clearAutoDraftInterval();
                            jQuery("#notification-component-popup-wrapper").sdp_zcomponent_dialog('close'); //No I18N
                            // In case of approval check if mail sent failed
                            var approval_data = response.approvals ? response.approvals : (response.submit_for_approval ? response.submit_for_approval.notification_status : {});
                            var noOfMailFailedUsers = (self.sub_module === "approval" && approval_data && approval_data.mail_sent_failed_approvals) ? approval_data.mail_sent_failed_approvals.length : 0 ; // No I18N
                            var noOfUnresolvedOrgRoles = (self.sub_module === "approval" && approval_data && approval_data.unresolved_org_roles) ? approval_data.unresolved_org_roles.length : 0 ; // No I18N
                            var level_automated_by_system = (self.sub_module === "approval" && approval_data) ? approval_data.level_automated_by_system : null; // No I18N

                            if(noOfMailFailedUsers != 0) {
                                var mailFailedUsers = approval_data.mail_sent_failed_approvals ;
                                var emailErrorMessage = translate("sdp.change.approval.sendemail.error.message") + "<div  class='mt10 mr-30 of-a maxh-500px'>"; // No I18N
                                for(var i=0; i<noOfMailFailedUsers-1;i++) {
                                    emailErrorMessage = emailErrorMessage + "<div>" + e_html(mailFailedUsers[i]) + "</div>" ;
                                }
                                emailErrorMessage = emailErrorMessage + e_html(mailFailedUsers[noOfMailFailedUsers-1]) + "</div>" ;
                                showalert('failure', emailErrorMessage,'isAutoHide=false,width=400px');//No I18N
                            }
                            else if(noOfUnresolvedOrgRoles != 0)
                            {
                                var unresolved_roles = approval_data.unresolved_org_roles ;
                                var errorMessage = translate("approval.unresolve.roles.not.send") + "<div class='mt10 mr-30 of-a maxh-500px'>"; // No I18N
                                for(var i=0; i<noOfUnresolvedOrgRoles-1;i++) {
                                    errorMessage = errorMessage + "<div>" + e_html(unresolved_roles[i]) + "</div>" ;
                                }
                                errorMessage = errorMessage + e_html(unresolved_roles[noOfUnresolvedOrgRoles-1]) + "</div>" ;
                                showalert('failure', errorMessage,'isAutoHide=false,width=400px');//No I18N
                            }
                            else if(level_automated_by_system)
                            {
                                var errorMessage = translate("api.mla.request.level.auto.approve.msg",level_automated_by_system);// No I18N
                                errorMessage = e_html(errorMessage);
                                showalert('success',errorMessage, "isAutoHide=true"); // No I18N
                            }
                             else{
                                showalert('success', translate("sdp.support.reportissue.successMsg"), "isAutoHide=true"); // No I18N
                            }
                            self.config.hasOwnProperty("afterNotificationSent") //No I18N
                            && (typeof self.config.afterNotificationSent === 'function')    //No I18N
                            && self.config.afterNotificationSent.call(self,response,notification);
                        }
                        self.pauseAutoDraft = false;
                        self.disableSaveButton(false);
                    },
                    error: function (response) {
                        self.handleError(response);
                        self.disableSaveButton(false);
                        self.pauseAutoDraft = false;
                        //Incase of recommend template, notification sent but error in request update.
                        //In such scenario, closing the notification popup if response contains notification data.
                        if(response.notification){
                            jQuery("#notification-component-popup-wrapper").closeDialog(self.clearAutoDraftInterval()); //No I18N
                        }
                    }
                });
            }

        }
    },
    /*
    This method show alert with the failed fields & response message.
    */
    handleError:function(response){
                        response = response.responseJSON;
                        if (response.response_status.messages) {
                            if (typeof response.response_status.messages[0].message === "string") {
                                let fields = response.response_status.messages[0].fields;
                                if(!fields && response.response_status.messages[0].field) {
                                    fields = [response.response_status.messages[0].field];
                                }
                                let message = response.response_status.messages[0].message;
                                if(fields && fields.length > 0){
                                    message = message + " : " + fields.join(", ");
                            }
                                showalert('failure', e_html(message), "isAutoHide=false"); // No I18N
                        }
                        }
    },



    /**
     * Validating the fields in the form
     * @param {Element} thisForm Notification form element
     */
    validateNotificationForm: function (thisForm) {
        let _self = this;
          if(jQuery(thisForm).valid()){
            if(_self.config.validateNotificationForm && typeof _self.config.validateNotificationForm=="function"){
               return _self.config.validateNotificationForm(thisForm);
        }
        return true;
          }
    },
    /**
     * Gets the notification data from the form to submit
     * @param {Element} notificationForm Notification form element
     * @return {Object} Returns notification object
     */
    getNotificationDataFromForm: function (notificationForm) {

        var $notificationForm = jQuery(notificationForm),
            notification = {},
            self = this;

        var description = parent.notificationDescEditor ? notificationDescEditor.getHTML() : "";
        notification.description = description;

        notification.subject = notificationForm.sendnotifysub.value;
        notification.content_type = "text/html"; //No I18N

        //TODO need to check the type that different from relase module
        notification.type = this.config.custom_type ? this.config.custom_type : this.notification.type;
        notification.mode = this.mode;
        if(this.config.has_to){
            /* Extract to-emails field out of select2 box */
            notification.to = [];
            if ($notificationForm.find('#sendnotifyto').length > 0) {
                var toMails = $notificationForm.find('#sendnotifyto').select2('data'); //No I18N
                toMails.forEach(function(mail){
                    notification.to.push({
                    email_id: mail.text
                    })
                });
            }
        }
        if(this.config.has_cc){
            /* Extract cc-emails field out of select2 box */
            notification.cc = [];
            if ($notificationForm.find('#sendnotifycc').length > 0) {
                var ccMails = $notificationForm.find('#sendnotifycc').select2('data'); //No I18N
                ccMails.forEach(function(mail){
                    notification.cc.push({
                        email_id: mail.text
                   });
                });
            }
        }
        if(this.config.has_bcc){
            /* Extract cc-emails field out of select2 box */
            notification.bcc = [];
            if ($notificationForm.find('#sendnotifybcc').length > 0) {
                var ccMails = $notificationForm.find('#sendnotifybcc').select2('data'); //No I18N
                ccMails.forEach(function(mail){
                    notification.bcc.push({
                        email_id: mail.text
                   });
                });
            }
        }
        if(this.config.isMSP && this.config.sendAccManagersEnabled)
        {
            if(($notificationForm.find("#sendAccManagersID").length > 0) &&  $notificationForm.find("#sendAccManagersID").is(':checked'))
            {
                notification.sendAccManagersEnabled = true;
            }
        }
        // Get the inline image path from editor object
        /*if (parent.notificationDescEditor && notificationDescEditor.initobj.options.imgParameters.inlineimages.length > 0) {
            notification.images = {
                "description": notificationDescEditor.initobj.options.imgParameters.inlineimages // NO I18N
            }
        }*/

        if(this.config.has_attachments){
            // Get attachments from UI
            notification.attachments = [];
            self.notification.uploadedAttachments.forEach(function (attachment) {
                notification.attachments.push({
                    id: attachment.id
                });
            });

            notification.copied_from = this.config.copied_from;
        }

        // add attachment copy details for forwarded mail
        if (this.notification.type.indexOf("forward") != -1) {
            notification.copied_from = {
                id: this.notification.parent_id,
                module: this.module.replace(/s$/, '') + "_notification" // NO I18N
            }
        }

        //Solution Module-add attachment copy details for forwarded mail/approval mail
        if (this.notification.type.indexOf("SOLFORWARD") != -1 || this.notification.type.indexOf('Notify_ApproveSolution')!=-1) {
                    notification.copied_from = {
                                id: self.module_id,
                        module: this.module.replace(/s$/, '') + "_notification" // NO I18N
                    }
                }


        if(this.config.recommend_template_window){
            var selectedTemplateId = jQuery("#recommendtemplateid").val();
            if(selectedTemplateId != ""){
                notification.recommend_template={
                    id : selectedTemplateId
                }
            }
            if(self.config.zia_suggested_template.id){
                notification.zia_recommend_template={
                    id : self.config.zia_suggested_template.id
                }
            }
        }

        return notification;
    },
    /**
     * Check if outgoing mail is configured
     */
    checkMailConfigured: function () {
        var self = this;
        if (!self.mail_configured) {
            sdpAjax({
                async: false,
                url: "/servlet/HdClientUtilServlet?command=isOutgoingMailConfigured", //NO I18N
                success: function (resp) {
                    self.mail_configured = resp;
                },
            });
        }
        return self.mail_configured;
    },
    /*
    * Disable save & send button
    * @param {boolean} prop - true to disable, false to enable
    */
    disableSaveButton: (prop) => {
        jQuery('[data-id="send_notification"]').prop('disabled',prop);//No I18N
        jQuery('[data-id="saveDraft"]').prop('disabled',prop);//No I18N
    },
    /**
     * Save the draft if draft i enabled
     */
    saveAsDraft:function(formObj,userEvent){

     //userEvent will be true when save draft method is called on clicking save button.
        var _self = this;
        userEvent=(userEvent==undefined)?false:userEvent;
        var formData = _self.getNotificationDataFromForm(document.getElementById("notification_form"));
        //If default contents are not changed.No comparisions should be done if user clicked "save" button for the first time.
        if(!(userEvent && _self.firstSave) && !_self.compareObject(formData)){
            return false;
        }

        var input_data = {
            draft: formData
        }
        _self.disableSaveButton(true);
        jQuery("#notification-attachments-api").append("<div id='notification-attachment-loader'></div>");
        jQuery("#notification-attachment-loader").html(ajaxBar()); //Show loading icon
        _self.pauseAutoDraft = true;
        sdpAjax({
            type: "POST", //No I18N
            url: "/api/v3/"+_self.module+"/"+_self.module_id+"/drafts", //No I18N
            data: sdpAjaxInputData(input_data), //No I18N
            success:function(resp){
                if(resp.response_status.status === "success"){
                    //When draft call is made, img urls in description will be replaced with the image urls from response.
                    var respContent = new DOMParser().parseFromString(resp.draft.description, "text/html");  //No I18N
                    var imgTagsResp = respContent.images;

                    //SD-107873 IssueFix starts
                    var imageElements = parent.notificationDescEditor.doc.body.querySelectorAll("img[src]"); //No I18N
                    for(var i=0; i<imgTagsResp.length; i++){
                        //The src of the inline image alone is set to image src from response.
                        imageElements[i].src = imgTagsResp[i].getAttribute('src'); //No I18N
                    }
                    jQuery('#AlertDraft').slideDown();
                    setTimeout(function() {
                        jQuery('#AlertDraft').slideUp();
                    },3000);
                    //SD-107873 IssueFix ends

                    typeof _self.config.saveDraftCallback === "function" && _self.config.saveDraftCallback(resp,_self.config.fromListView); //No I18N
                    _self.modifyDefaultNotificationData(formData);//Updating _self.notification . Since draft is saved .
                    if(resp.draft.attachments){
                        jQuery("#notification-attachments-api").empty(); //SD-119157 - Initializing the attachment component with the new attachment IDs after draft save.
                        _self.populateAttachments(resp.draft.attachments);
                        _self.initialiseNotificationAttachPreview();
                        _self.config.copied_from.id = resp.draft.id;
                        _self.config.copied_from.module = _self.config.module+"_notification";//No I18N
                    }
                       notificationDescEditor.initValue=notificationDescEditor.getHTML(); //Setting current description content as initial value
                      _self.formChanged=false;
                      if(_self.firstSave){_self.firstSave=false}
                }
                _self.disableSaveButton(false);
                _self.pauseAutoDraft = false;

            },
            error:function(response){
                _self.handleError(response);
                jQuery("#notification-attachment-loader").html(ajaxBar()).remove();
                _self.disableSaveButton(false);
                _self.pauseAutoDraft = false;
            }
        })
        return true;
    },
        getEntityAttachments:function(module,module_id){
            var attachments = [];
            if(module = "changes"){ // No I18N
                var url='/servlet/CmClientUtilServlet?command=getChangeAttachments&'+ 'CHANGEID='+encodeURIComponent(module_id);//No I18N
                sdpAjax({
                    url:url,
                    type: "GET", // No I18N
                    success: function(resp){
                        if(resp.response_status && resp.response_status[0].status == "success"){
                            attachments = resp.attachments;
                        }
                    },
                    async: false
                });
            }
            return attachments;
        },
    modifyDefaultNotificationData:function(input){
        var toCompare = ['to','cc','bcc','subject','description','recommend_template']; //No I18N
        var _self=this;

        toCompare.forEach(function(compareField)
                    {
                        if(_self.notification[compareField] || input[compareField]){
                            _self.notification[compareField]=input[compareField];
                        }

                    });
     },
    clearAutoDraftInterval:function(){
        var self = this;
        if(self.config.autoDraft && self.intervalHandler){
            clearInterval(self.intervalHandler);
        }
    },

    setRecommendTemplate:function(selectedTemplateId){
        if(selectedTemplateId !== undefined){
            jQuery("#recommendtemplateid").val(selectedTemplateId);
        }
    },

    showBCC:function(){
        jQuery("#bcc_section").removeClass("hide").addClass("show");
        jQuery("#sendnotifycc").parent('div').addClass("col-md-11 pr0").removeClass("col-md-10").removeAttr('style');//No I18N
        jQuery("#addBcc").parent('div').addClass("hide");
    },

    populateAttachments:function(attachments, jsonMerge){
        var _self = this;
        attachments.forEach(function (attachment) {
            var a = '<button type="button" data-href="' + e_attr(attachment.content_url) + '" data-attach-id="' + attachment.id + '" data-attach-size="' + e_attr(attachment.size.display_value) + '">' + e_attr(attachment.name) + '</button>';//No I18N
            jQuery("#notification-attachments-api").append(a);
        });
        // task - 10029
        if(jsonMerge) {
            _self.notification.uploadedAttachments = jQuery.isArray(_self.notification.uploadedAttachments) ?
                                                    jQuery.merge(_self.notification.uploadedAttachments, attachments) :
                                                    jQuery.merge([], attachments);
        } else {
            _self.notification.uploadedAttachments = attachments;
        }
    },
    compareObject: function(output_data){
        var _self = this;
       if(_self.formChanged){ //If formChanged by upload/Delete attachments avoiding comparision.
          return true;
       }
         var input_data=_self.notification;
         var toCompare = ['to','cc','bcc','subject','description','recommend_template']; //No I18N
        toCompare.forEach(function(compareField)
                    {
                        var inputFieldName = compareField;
                        var fieldType = compareField;
                        if(compareField == "description"){//No I18N
                            fieldType = "html";//No I18N
                        }else if(compareField == "recommend_template"){//No I18N
                            fieldType = "refer_json";//No I18N
                        }
                        if(!(_self.compareValue(input_data[inputFieldName],output_data[compareField],fieldType))){
                          _self.formChanged= true;
                        }
                    });
                    return _self.formChanged;
    },

    compareValue: function(input,output,fieldType){
        switch(fieldType) {
            case "html"://No I18N
                var desc = notificationDescEditor.initValue;
                var htmlData = notificationDescEditor.getHTML();
                if(desc === htmlData){
                    return true;
                }
                break;
            case "refer_json"://No I18N
                var oldValue = (input != null) ? input.id : null;
                var newValue = (output != null) ? output.id : null;
                if(oldValue === newValue){
                    return true;
                }
            default:
                if(sdpToJSON(input) === sdpToJSON(output)){
                    return true;
                }
                break;
        }
        return false;
    },
    //Notification T0,CC and BB Email Drag and Drop
    emailDragDrop:function (select2Elements) {
    	var fn = {};


        var select2DragDrop = {
            eventName: 'email-drag-drop',//No I18N
            dragClass: 'email-dragging',//No I18N
            removeLi: function() {
                var $ulElem = select2DragDrop.dragLi.parent();
                select2DragDrop.dragLi.find('.select2-search-choice-close').trigger('click');
                select2DragDrop.dragData = null;
                //To remove search focus
                setTimeout(function() {
                    $ulElem.find('input').trigger('blur');
                }, 0);

            },
            start: function(evt) {
                 sdpDropDown.lock();
                 sdpCopyInstance.lock();

                 setTimeout(function(){
                    sdpDropDown.lock();
                    sdpCopyInstance.lock();
                },250);

                var $liElem = select2DragDrop.dragLi = jQuery(evt.target);
                var data = $liElem.data('select2Data');//No I18N
                select2DragDrop.dragData = data;
                $liElem.addClass(select2DragDrop.dragClass);

            },
            leave:function(evt) {
               select2DragDrop.dragLi.removeClass(select2DragDrop.dragClass);
               sdpDropDown.lock();
               sdpCopyInstance.release();
               sdpDropDown.release();

               setTimeout(function(){
                    sdpDropDown.closeAll();
                    sdpCopyInstance.release();
                    sdpDropDown.release();
               },200);
            },
            end: function(evt) {
                var $select2Container = jQuery(evt.currentTarget);
                var dragData = select2DragDrop.dragData;
                var select2 = $select2Container.data('select2');//No I18N
                sdpDropDown.closeAll();

                setTimeout(function(){
                    sdpDropDown.closeAll();
                    sdpCopyInstance.release();
                    sdpDropDown.release();
                },301);

                var ul =  select2DragDrop.dragLi.closest('ul.select2-choices');//No I18N
                setTimeout(function(){
                    if(ul){
                       ul.find('.select2-search-choice')
                       .each(function(ind,li) {
                            jQuery(li).find('.sdp-copy-text').trigger('mouseout');
                       });
                    }
                },200);


                if (dragData && select2 && select2.data) {
                    var newValue = dragData;
                    var data = select2.data();
                    var alreadyExist = data.filter(function(item) {
                        return item.id == newValue.id
                    }).length > 0;
                    //Check if maximum selection size is set and if the current selection has reached the limit
                    const isMaxSelection =()=> select2.opts.maximumSelectionSize && data.length >= select2.opts.maximumSelectionSize;

                    if(isMaxSelection()){
                        select2.open(); //to show the error message
                        return;
                    }
                    if (!alreadyExist) {
                        data.push(newValue);
                        select2.data(data);
                        select2DragDrop.removeLi();
                    }

                }

            }
        };

        var Email = sdpDragDrop(select2DragDrop.start,select2DragDrop.end,select2DragDrop.leave);

        function init() {

            select2Elements.forEach(function(element) {
                var $elem = jQuery('#' + element);
                var select2 = $elem.data('select2');//No I18N
                if (select2 && select2.container) {
                    var $container = select2.container;
                    Email.addDrop($container.get(0));
                }
            });
        }

        fn.init = init;
        fn.addDrag = Email.addDrag;

        return fn;

    },
    emailDragDropInit: function (notify) {

        var EmailDragDropInstance;
        var _self = this;

        jQuery(notify)
        .off('select2BeforeInit') //No I18N
        .off('select2AfterInit') //No I18N
        .off('select2AddChoice') //No I18N
        .on('select2BeforeInit',function(evt,select2Elements) {
             EmailDragDropInstance = _self.emailDragDrop(select2Elements);
        }).on('select2AfterInit',function() {
            EmailDragDropInstance.init();
        }).on('select2AddChoice',function(evt,div) {
            EmailDragDropInstance.addDrag(div.parent().get(0));
        });
    },
    //This function is used to hide and show the Back to Reply button in request's include solution popup
    showHideActionIncludeSolutionBackToReplyButton : function(){
        var _self = this;
        if(_self.module == "requests" && jQuery("#notification-component-popup-wrapper").find('[data-id="back_to_reply"]').length > 0){
            var incjQuery = jQuery("#notification-component-popup-wrapper").find('[data-id="back_to_reply"]');  //No I18N
            if(!incjQuery.hasClass("hide")){
                incjQuery.addClass("hide");
            }
            else{
                incjQuery.removeClass("hide");
            }
        }
    }

};


//Email copy component init code start

//<span class="sdp-copy-text" data-email="test@gmail.com">test@gmail.com<span>
jQuery(document).off('sdpCopyText.replyCopyEmail.init').on('sdpCopyText.replyCopyEmail.init', replyCopyEmail); //No I18N

//Reply copy component init code
function replyCopyEmail(evt, holderData, callback) {

    var i18n = {
        email:translate('sdp.common.email'),
        name:translate('sdp.common.name'),
        copyToClipboard:translate('sdp.common.copy.to.clipboard')
    };

    function doActions(actionName,config) {
        if(actionName == 'copy_email' || actionName == 'holder_click') {
            var copyData = config.copyData;
            var copyText = copyData.email;
            var appendTo = config.holder.closest('form');//No I18N
            config.copy(copyText,appendTo);
            showalert('success', config.message, 'isAutoHide=true,delay=1');//No I18N
        }
    }

    var options = {
        dropDownClass:'email-copy',//No I18N
        dropDownContainer:'#send-notification-section', //No I18N
        initTooltip:true, //No I18N //To init tooltip component to dropdown
        dropdown_list: [{
            actionName:'copy_email',//No I18N
            copy_message:translate('msteams.copied'),
            renderElement:function(holderData,holder) {
                var name = holderData.name || '-';
                var email = holderData.email;
                var temp = `<div class="mb5">
                                 <strong>${i18n.name} :</strong><span class="name-text" rel="uitip" mode_ellipsis="true" title="${name}"></span>
                            </div>
                            <div>
                             <strong>${i18n.email} :</strong><span  class="email-text" rel="uitip" mode_ellipsis="true" title="${email}"></span>
                             <span rel="uitip" data-action="copy_email" class="cspr copy-id ml5 vmiddle cur-ptr icon-sm opac5" title="${i18n.copyToClipboard}"></span>
                            </div>`;
                var template = SDPTemplate(temp).get();
                template[0].querySelector('.name-text').textContent = name;
                template[1].querySelector('.email-text').textContent = email;
                return template;
            }
        }],
        getCopyData: function (holderData,holder) {
            var copyData = holderData;
            return copyData;
        },
        positionConfig: {
            within:'#send-notification-section',//No I18N
        },
        // to position dropdown within container
        holder_click:{
            message:translate('msteams.copied')
        },
        actionCallback:doActions
    }

    if (callback) {
        callback(options);
    }
}

//Email copy component init code end
