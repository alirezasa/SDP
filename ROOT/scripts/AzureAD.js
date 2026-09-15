var azuread=
{
    template : {
        "layouts": [{ //No I18N
            "sections": [ //No I18N
                {"column_count": "2", //No I18N
                "fields": [ //No I18N
                    {"name": "name", "position": {"col": "1","col_size": "1","row": "1","row_size": "1"}}, //No I18N
                    {"name": "client_id", "position": {"col": "1","col_size": "1","row": "2","row_size": "1"}}, //No I18N
                    {"name": "client_secret", "position": {"col": "1","col_size": "1","row": "3","row_size": "1"}}, //No I18N
                    {"name": "token_url", "position": {"col": "1","col_size": "1","row": "4","row_size": "1"}} //No I18N
                ]}
            ]
        }]
    },
    customRenderClientSecret : '<div id="old_AzureClientSecret"><a href="/" data-event="click" data-handler="javascript:azuread.showAzureClientSecret(\'AzureClientSecret\',true);" nonce="'+sdpNonce+'" class="text-link mt5 disp-ib">'+translate("sdp.common.reset")+'&nbsp;'+translate("auth.oauth.common.clientsecret")+'</a></div><div id="new_AzureClientSecret"  class="pos-rel hide"><p data-name="client_secret" type="password" data-value="null" data-event="click" data-handler="FC.setInlineEdit(&quot;client_secret&quot;, &quot;form_AzureForm&quot;, event); return false;" nonce="'+sdpNonce+'" class="form-control-static hide spot-static pr25">-</p><div class="spot-form"><div id="client_secret_control" class="control-holder fw" data-atm="client_secret"><input type="password" autocomplete="off" name="client_secret" id="for_client_secret" class="form-control" maxlength="40" data-field="undefined" value="" data-type="password" tabindex="23"></div><div id="client_secret_actions" class="spot-actions hide"><button type="button" class="spot-save btn btn-sm btn-link pl0 pr0" title="'+translate("sdp.common.save")+'" data-event="click" data-handler="FC.saveInlineEdit(" nonce="'+sdpNonce+'"form_AzureForm", "client_secret", event)"><span class="spot-icon success mr5"></span></button><button type="button" class="spot-cancel btn btn-sm btn-link pl0 pr0" title="'+translate("sdp.common.cancel")+'" data-event="click" data-handler="FC.cancelInlineEdit(" nonce="'+sdpNonce+'"form_AzureForm", "client_secret", event)"><span class="spot-icon failure icon-xs"></span></button></div></div><a class="cspr icon-xs close2 pos-abs right-5 top5 mt3 mr-20" id="db_AzureClientSecret" href="/" rel="uitip" title="'+translate("sdp.common.cancel")+'" data-event="click" data-handler="resetClientSecret(\'AzureClientSecret\')" nonce="'+sdpNonce+'"></a></div>',
    orgDataMap:{},
    cloneObj:"",
    scheduleDetails:{},
    syncRuleOption:"",
    oneTimeImportMaxUserCount:5,
    azureFieldsMeta:{},
    azureDomainMetaInfo:{fields:{}},
    azureSupportedFieldMap:{},
    azureSupportedFieldIdVsDisplayName:{},
    sdpVsAzureFieldMap:{
        "email_id": "mail",//NO I18N
        "reporting_to": "manager",//NO I18N
        "department": "department",//NO I18N
        "first_name": "givenName",//NO I18N
        "jobtitle":"jobTitle",//NO I18N
        "mobile": "mobilePhone",//NO I18N
        "last_name": "surname",//NO I18N
        "secondary_emailids": "otherMails",//NO I18N
        "login_name": "userPrincipalName",//NO I18N
        "phone": "businessPhones",//NO I18N
        "employee_id": "employeeId",//NO I18N
        "name": "displayName",//NO I18N
        "site": "officeLocation"//NO I18N
    },
    allowEdit : true,
    $fc : {},
    init: function()
    {
        //SD-127419 issue fix
        if(sdp_app.IS_ESMDIR)
        {
            jQuery('#content').find('.adminview').addClass('noborder');
            jQuery('#content').find('.admin-panel').addClass('noborder');
        }

        var data={};
        var apiData = sdpAjaxInputData({"list_info":{"start_index":1,"row_count":100,"get_total_count":true}}); //No I18N
        data.domainlist=azuread.apiCall("/api/v3/azure_domains","GET",false,apiData); //No I18N
        var azureConfiguration=azuread.getAzureConfig();
        data.deleteSync=azureConfiguration.deleteSync;
        data.schedule=azureConfiguration.schedule;
        azuread.scheduleDetails=data.schedule;
        data.localAuthConfig=azureConfiguration.localAuthConfig;
        var syncRuleData=azuread.apiCall("/api/v3/azure_configs","GET"); //No I18N
        syncRuleData.azure_configs.forEach((value,index) => {
            if(value.parameter == 'DELETE_USER_TYPE')
            {
                data.syncRuleID=value.id;
                azuread.syncRuleOption=value.param_value;
            }
            else if(value.parameter == 'ONE_TIME_IMPORT_MAX_USER_COUNT')
            {
                if(value.param_value <= 15)
                {
                    data.oneTimeImportMaxUserCount=value.param_value;
                }
                else
                {
                    data.oneTimeImportMaxUserCount=15;
                }
                azuread.oneTimeImportMaxUserCount=data.oneTimeImportMaxUserCount;
            }
            else if(value.parameter == 'DELETED_REQ_COUNT')
            {
                data.deletedUserCount=value.param_value;
            }
        });

        renderhbs("#azuread-config", "azuread-template", data, false, "admin", null, true, function(){ // NO I18N

            //Binding keypress event here as it could not be done using $sdEventListener
            jQuery("#loginNames").off("keypress.azureDialog").on("keypress.azureDialog", function(event){ // NO I18N
                adCommon.restrictEnter(event);
            });

            initTooltip("#azuread-config"); //No I18N
        });

        azuread.showSchedule();
        azuread.showSyncRule();
        $passwordChecker.init('#preDefinedPassValue','#localAuthPass'); //No I18N
        adCommon.localAuthPassParam=azureConfiguration.localAuthConfig.isRandomPwd;
        adCommon.loadLAuthPass();
        azureFieldsMeta=azuread.apiCall("/api/v3/azure_fields/metainfo","GET",true); //No I18N
        azuread.azureDomainMetaInfo.fields=azuread.apiCall("/api/v3/azure_domains/metainfo","GET",true); //No I18N
        azuread.setSupportedFieldMap();
        azuread.allowEdit=true;
    },
    domainDialog: function(mode,id)
    {
        var _self = this;
        var formoptions = {
            name: "AzureForm", //No I18N
            entity: "azure_domain", //No I18N
            entitypath: "/azure_domains", //No I18N
            entitydata: null,
            template: azuread.template,
            metadata: azuread.azureDomainMetaInfo,
            mode: "new", //No I18N
            container: "AzureFormContainer", //No I18N
            formid: "AzureForm", //No I18N
            entityName: "AzureDomain", //No I18N
            customform: true,
            afterRenderCallback: function () {
                jQuery('#AzureFormContainer').find(".form-wrapper").removeClass('pb25');
            }
        };
        var selectedFieldListInfo= { "sort_field":"name", "row_count":20 , "search_criteria": [{ "field": "name", "value": "manager", "condition": "is_not" }] };//NO I18N
        var cloneOpt = {
            //mode: "new", //No I18N
            selector: "AzureCloneRows", //No I18N
            min_rows: 2,
            max_rows: 50,
            meta_info:{
                sdp_field_name: {
                    type:"select2", //No I18N
                    unique: true,
                    place_holder: translate("form.select.placeholder",[translate("admp.createuser.sdpfield")]), //No I18N
                    error_messages : {
                        data_msg_required : translate("dre.clone.field.error.msg")
                    },
                    select2: {
                        data: azuread.getOrgUserData()
                    },
                    events: {
                        change: field => {
                            var sdpField=field.value;
                            var source = jQuery(field).closest('[data-attr="clonerows"]').find('[data-name=azure_field_name]');
                            source.select2("enable", true);
                            //middle_name - no equivalent in azure default fields
                            const userFields=['email_id','reporting_to','department','first_name','jobtitle','mobile','last_name','secondary_emailids','login_name','phone','employee_id','name','site']; //No I18N
                            if(userFields.includes(sdpField))
                            {

                                //SD-129986 - If the azure attribute is already mapped to a sdp field and if the default sdp field of the azure attribute is selected, the azure attribute will be mapped to 2 sdp fields causing the issue during domain save
                                var selectedAzureAttributes=[];
                                var cloneRowsObject = jQuery.find('[data-attr=clonerows]');
                                cloneRowsObject.forEach( (cloneRow) => {
                                    var azureAttributeId=jQuery(cloneRow).find('[data-name=azure_field_name]').val();
                                    if(azureAttributeId != undefined && azureAttributeId != "")
                                    {
                                        selectedAzureAttributes.push(azuread.azureSupportedFieldIdVsDisplayName[azureAttributeId]);
                                    }
                                });

                                var azureField=azuread.sdpVsAzureFieldMap[sdpField];
                                if(selectedAzureAttributes.includes(azureField))
                                {
                                    source.select2("focus"); //No I18N
                                    source.select2("val",""); //No I18N
                                }
                                else
                                {
                                    var option = {};
                                    option.id = azuread.azureSupportedFieldMap[azureField];
                                    option.text=azureField;
                                    source.select2("data", option); //No I18N
                                }
                                if(sdpField == 'reporting_to')
                                {
                                    source.select2("enable", false); //No I18N
                                }
                            }
                            else
                            {
                                source.select2("focus");
                                source.select2("val",""); //No I18N
                            }
                        }
                    }
                },
                azure_field_name: {
                    type:"lookup", //No I18N
                    unique: true,
                    place_holder: translate("form.select.placeholder",[translate("azure.ad.attribute")]), //No I18N
                    error_messages : {
                        data_msg_required : translate("dre.clone.field.error.msg")
                    },
                    select2_options: {
                    url: [{
                            url: "/api/v3/azure_supported_fields", //No I18N
                            field: "azure_supported_fields", //No I18N
                            list_info: selectedFieldListInfo
                        }]
                    }
                }
            },
            callbackRowAdd: function(obj){
                azuread.mandateDefaultFieldRows();
            }
        }
        var criteriaOptions = {
          "metainfo": azureFieldsMeta,  //No I18N
          haveMultiString: true,
          notMandatory: true,  //Enabling this option as criteria will be empty if Without_Criteria is enabled
          allowed_value: {"callback": azuread.criteriacallback}, //No I18N
          metaOverride: {user_type: {type: "lookup", values: [{id: "Guest", text: "Guest"}, {id: "Member", text: "Member"}]}}, //No I18N
          syncFields: ["group"],
          syncCallback: function(field, meta, callback)
          {
                sdpAjax({
                            url: "/servlet/AJaxServlet?action=syncAzureGroups&domainID="+jQuery('#azureDomainID').val(), //No I18N
                            method:"GET", //No I18N
                            success: function (response) {
                                callback();
                            }
                        });
          },
          fieldTypeConditions: {user_type: ["is", "is_not"]} //No I18N
          /*"skipFieldTypeConditions": {
            "associated_roles":["is_empty", "is_not_empty"]
          }*/
        };
        var dialog_options = {
            title: ('add'==mode) ? translate("sdp.admin.domain.addDomainTitle"):translate("sdp.admin.domain.editDomainTitle"), //No I18N
            type: "modal",  //modeless for dialog without freezelayer //No I18N
            width: '1100px', //No I18N
            draggable: false,
            height: jQuery(window).height(),
            freezelayer: false,
            className: "modulecomp-popup sdpzcompdialog", //No I18N
            position: {
                right: "0px", //No I18N
                top: "0px" //No I18N
            },
            animation: {
                open: {
                    className: 'zeffects--slideright', //No I18N
                    duration: 300
                }
            },
            open: function(event)
            {
                var azureDialogContainer=jQuery('#AzureDialog');
                if('add'==mode)
                {
                    delete formoptions.template.layouts[0].sections[0].fields[2].custom_render;
                    _self.$fc = new FC(formoptions);
                    cloneOpt.mode="edit"; //No I18N
                    cloneOpt.data=azuread.getDefaultFieldRows();
                    azuread.cloneObj = new cloneRows(cloneOpt);
                    azuread.mandateDefaultFieldRows();
                    azureDialogContainer.find("#AzureCustomFilter").custom_filter(criteriaOptions);
                    azureDialogContainer.find('#AzureDomainConfigSection,#saveAndTestConnection,#AzureMappingAndCriteriaSection').removeClass('hide');
                    azureDialogContainer.find('#isNewAzureDomain').val('true');
                }
                else if('edit'==mode)
                {
                    //setting domain id prior to custom_filter initialization as custom_filter allowed values callback requires this data.
                    azureDialogContainer.find('#azureDomainID').val(id);
                    azureDialogContainer.find('#isNewAzureDomain').val('false');
                    var azureDomainData=azuread.apiCall("/api/v3/azure_domains/"+id,"GET"); //No I18N

                    formoptions.template.layouts[0].sections[0].fields[2].custom_render=function(){
                        return azuread.customRenderClientSecret;
                    };
                    formoptions.mode="edit"; //No I18N
                    formoptions.entitydata=azureDomainData.azure_domain;
                    _self.$fc = new FC(formoptions);

                    cloneOpt.mode="edit"; //No I18N
                    cloneOpt.data=azuread.getSelectedFieldRows(azureDomainData);
                    if(!cloneOpt.data.length) //if domain details alone saved without fieldmapping, selectedrows will be empty
                    {
                        cloneOpt.data=azuread.getDefaultFieldRows();
                    }
                    azuread.cloneObj = new cloneRows(cloneOpt);
                    azuread.mandateDefaultFieldRows();

                    azureDialogContainer.find("#AzureCustomFilter").custom_filter(criteriaOptions);
                    var isCriteriaEnabled=azureDomainData.azure_domain.is_criteria_enabled;
                    if(isCriteriaEnabled == null || isCriteriaEnabled)
                    {
                        azureDialogContainer.find("#basedOnCriteria").attr('checked', true);
                        azuread.enableCriteriaSection();
                        var criteriaArray=azuread.getCriteriaArray(azureDomainData);
                        azureDialogContainer.find('#AzureCustomFilter').custom_filter('update', criteriaArray); //No I18N
                    }
                    else
                    {
                        azureDialogContainer.find("#withoutCriteria").attr('checked', true).trigger('change');
                    }

                    if(!jQuery.isEmptyObject(azureDomainData.azure_domain.azure_credential)){
                        azureDialogContainer.find('#AzureDomainFooter,#AzureDomainConfigSection,#AzureMappingSection,#AzureCloneRows,#AzureCriteria,#azureUpdateBtn').removeClass('hide');

                        azureDialogContainer.find('#azureSaveBtn').addClass('hide');
                        azureDialogContainer.find('#azureUpdateBtn').attr('data-handler', 'azuread.saveDomainConfigurations('+id+',false)');

                        azureDialogContainer.find('#importBtn').attr('data-handler', 'azuread.oneTimeImport('+id+')');
                    }
                    else{
                        azureDialogContainer.find('#AzureDomainConfigSection,#AzureMappingAndCriteriaSection').removeClass('hide');
                    }
                    azureDialogContainer.find('#testConnect').removeClass('hide').attr('data-handler', 'azuread.saveDomainConfigurations('+id+',true)');
                }

                initTooltip("#AzureDialog"); //No I18N

                azureDialogContainer.find("#AzureFormContainer").on("editLoaded", function() {
                    var value=azureDialogContainer.find('#for_name').val();
                    azureDialogContainer.find('#for_name').val('').val(value).trigger('focus');
                });
            },
            close: function()
            {
                jQuery('#AzureDialog').remove();
                _self.$fc = {};
                azuread.init();
            }
        };

        jQuery("#AzureDialog").sdp_zcomponent_dialog(dialog_options);
    },
    apiCall: function(url,method,isMetaCall,apiData)
    {
        var result={};
        sdpAjax({
            url: url,
            method:method,
            data:apiData,
            success: function (response) {
                if(!isMetaCall)
                {
                    result=response;
                }
                else
                {
                    result=response.metainfo.fields;
                }
            },
            error: function(response)
            {
                result=response;
            },
            async: false
        });
        return result;
    },
    getCriteriaArray:function(azureDomainData)
    {
        var azureFieldsMap=azuread.getAzureFieldsMap(true);
        var criteriaData=azureDomainData.azure_domain.criteria_json; //If json parse is not used, it is not getting processed properly

        if(!jQuery.isEmptyObject(criteriaData)){

            criteriaData.forEach((value,index) => {
                value.display_value=value.field;
                value.field=azureFieldsMap.get(value.field);
            });
        }
        return criteriaData;
    },
    getSelectedFieldRows:function(azureDomainData)
    {
        var selectedFieldMapData=azureDomainData.azure_domain.azure_field_map;
        var selectedData =[];
        selectedFieldMapData.forEach((value,index) => {
            if(azuread.orgDataMap[value.sd_field_name] != undefined)
            {
                var obj = {} ;
                obj.sdp_field_name = {"id": value.sd_field_name, "name": azuread.orgDataMap[value.sd_field_name]}; //No I18N
                obj.azure_field_name = {"id": value.azure_field_id.id, "name": value.azure_field_id.name}; //No I18N
                selectedData.push(obj);
            }
        });
        return selectedData;
    },
    getOrgUserData:function()
    {
        var result=[];
        var metaInfo=azuread.apiCall("/api/v3/orgusers/metainfo","GET",true); //No I18N
        const userFields=['email_id','reporting_to','department','first_name','jobtitle','mobile','last_name','secondary_emailids','login_name','phone','employee_id','name','middle_name']; //No I18N
        Object.entries(metaInfo).forEach(([index,value]) => {
            if(userFields.includes(index))
            {
                var fieldData={
                    id: index,
                    text: value.display_name
                 };
                result.push(fieldData);
                azuread.orgDataMap[index]=value.display_name;
            }
            else if(index == 'user_udf_fields')
            {
                var udfFields = value.fields;
                Object.entries(udfFields).forEach(([udfIndex,udfValue]) => {
                    if(udfValue.type != 'datetime'){
                        var fieldData={
                            id: udfIndex,
                            text: udfValue.display_name
                        };
                        result.push(fieldData);
                        azuread.orgDataMap[udfIndex]=udfValue.display_name;
                    }
                });
            }
        });
        //site field not available in orguser meta
        var fieldData={
            id: "site", // No I18N
            text: translate("sdp.requests.common.site")
         };
        result.push(fieldData);
        azuread.orgDataMap["site"]=translate("sdp.requests.common.site"); // No I18N

        return result;
    },
    showSchedule: function()
    {
        var azureScheduleContainer=jQuery('#AzureSchedule');
        var checked=azuread.scheduleDetails.fullSync.isEnabled;
        azureScheduleContainer.find('#schedule').prop('checked',checked); // No I18N
        azureScheduleContainer.find('#scheduleDays').prop('disabled',true);// No I18N
        if(checked){
            azureScheduleContainer.find('#scheduleDays').val(azuread.scheduleDetails.fullSync.scheduleDays);
            document.getElementById("personalizedSch").textContent = azuread.scheduleDetails.fullSync.personalizedNextScheduleDate;
            document.getElementById("schDays").textContent = azuread.scheduleDetails.fullSync.scheduleDays;
            azureScheduleContainer.find('#schmsg').addClass('hide');
            azureScheduleContainer.find('#totsch').removeClass('hide');
        }
        else
        {
            azureScheduleContainer.find('#schmsg').removeClass('hide');
            azureScheduleContainer.find('#totsch').addClass('hide');
        }
        azureScheduleContainer.find('#schDays,#personalizedSch').removeClass('hide');
        azureScheduleContainer.find('#scheduleDays').addClass('hide');
    },
    editSection: function(section, btn)
    {
        if(!azuread.allowEdit){
            alert(translate("sdp.ad.anotherform.open"));
            return false;
        }
        azuread.allowEdit = false;
        if("schedule" == section)
        {
            var azureScheduleContainer=jQuery('#AzureSchedule');
            azureScheduleContainer.find('#schmsg,#schDays,#personalizedSch').addClass('hide');
            azureScheduleContainer.find('#totsch,#scheduleDays,#editCal').removeClass('hide');
            azureScheduleContainer.find('#schedule').prop('disabled', false); //No I18N
            adCommon.initCalendarField('azureadsched');//No I18N
            azuread.scheduleCheck('#schedule'); //No I18N
        }
        else if("syncRule" == section)
        {
            jQuery('#removeUser,#doNothing').prop('disabled',false); //No I18N
        }
        else if("localAuthPass" == section)
        {
            adCommon.editLocalAuthPassSection();
        }

        jQuery(btn).closest('.activedirect-section').find('.submit-row').removeClass('hide'); //No I18N
        jQuery(btn).closest('.activedirect-section').find('.modal-overlay2,.freezelayer-text').addClass('hide'); //No I18N
    },
    scheduleCheck : function (el)
    {
        var azureScheduleContainer=jQuery('#AzureSchedule');
        var c = azureScheduleContainer.find(el).is(':checked'); //No I18N
        if(c){
          azureScheduleContainer.find("#azureadsched").removeClass('dpicker-disabled'); // No I18N
          azureScheduleContainer.find('#scheduleDays').prop('disabled',false); // No I18N
          azureScheduleContainer.find('#azureadsched').find('input').prop('disabled',false);//No I18N
          azureScheduleContainer.find('#scheduleDays').trigger('focus');
        }
        else{
          azureScheduleContainer.find('#scheduleDays').prop('disabled',true); // No I18N
          azureScheduleContainer.find('#azureadsched').find('input').prop('disabled',true);//No I18N
          azureScheduleContainer.find("#azureadsched").addClass('dpicker-disabled'); // No I18N
        }
    },
    cancelSection : function (section,btn)
    {
        if("schedule" == section)
        {
            jQuery('#editCal').addClass('hide');
            azuread.showSchedule();
        }
        else if("localAuthPass" == section)
        {
            adCommon.loadLAuthPass();
        }
        else if("syncRule" == section)
        {
            azuread.showSyncRule();
        }

        jQuery(btn).closest('.activedirect-section').find('.submit-row').addClass('hide').end().find('input').prop('disabled', true); //No I18N
        jQuery(btn).closest('.activedirect-section').find('.modal-overlay2,.freezelayer-text').removeClass('hide'); //No I18N
        azuread.allowEdit = true;
    },
    saveLocalAuthConfig: function(btn)
    {
        azuread.allowEdit = adCommon.saveLocalAuthPass(btn);
    },
    saveAzureSchedule: function(btn)
    {
        var azureScheduleContainer=jQuery('#AzureSchedule');
        var scheduleJSON={azureScheduleConfig:{}};
        if(azureScheduleContainer.find('#schedule').is(":checked"))
        {
            if(!isLoginNotifcation_Outgoing_Enabled()){
                    return false;
            }
            scheduleJSON.azureScheduleConfig.enabled = 'true'; //No I18N
            if(azuread.checkintegervalue(azureScheduleContainer.find('#scheduleDays').val()) ==  false){
                alert(translate("sdp.fullSyncSchedule.interval.invalid")); //No I18N
                azureScheduleContainer.find('#scheduleDays').trigger('focus');
                return false;
            }
            else if(azureScheduleContainer.find('#scheduleDays').val() === '0'){
                alert(translate("sdp.adschedule.days.zero"));
                azureScheduleContainer.find('#scheduleDays').trigger('focus');
                return false;
            }
            else if(azureScheduleContainer.find('#scheduleDays').val() > 365 || azureScheduleContainer.find('#scheduleDays').val()<7){
                alert(translate("sdp.fullSyncSchedule.interval.invalid"));
                azureScheduleContainer.find('#scheduleDays').trigger('focus');
                return false;
            }
            else if(azureScheduleContainer.find('#azureadsched_IN').val() == '' || azureScheduleContainer.find('#azureadsched_IN').val() == '-' || azureScheduleContainer.find('#azureadsched_IN').val() == 'null'){
                alert(translate("sdp.admin.auditsettings.scaninterval.choosedate"));
                initCalendar("azureadsched_IN"); //No I18N
                return false;
            }
            else if(Date.now() > azureScheduleContainer.find('#azureadsched_IN').val())
            {
              alert(translate("sdp.adschedule.time.greater"));
              initCalendar("azureadsched_IN"); //No I18N
                return false;
            }
            else
            {
                scheduleJSON.azureScheduleConfig.repeat_every = azureScheduleContainer.find('#scheduleDays').val(); //No I18N
                scheduleJSON.azureScheduleConfig.start_time={value: azureScheduleContainer.find('#azureadsched_IN').val()}; //No I18N
            }
        }
        else
        {
            scheduleJSON.azureScheduleConfig.enabled = 'false'; //No I18N
        }
        azuread.scheduleAjaxCall(btn, scheduleJSON);
        azuread.allowEdit = true;
    },
    scheduleAjaxCall: function(btn, scheduleJSON)
    {
        var _self = this;
        var formSaveButton = jQuery(btn).button("loading");

        sdpAjax({
            url: "/servlet/AJaxServlet?action=saveAzureSchedule", //No I18N
            method:"POST", //No I18N
            data: sdpAjaxInputData(scheduleJSON),
            dataType : "text",//No I18N
            success: function (response) {
                var scheduleResponse = JSON.parse(response);
                var status=scheduleResponse.status;
                var message = scheduleResponse.message;
                if('Success' == status)
                {
                    showalert('success',message,'isAutoHide=true'); //No I18N
                    azuread.init();
                }
                else if("Info" == status){
                    showalert('info',message,'isAutoHide=true'); //No I18N
                    _self.cancelSection('schedule', btn);
                }
                else
                {
                    showalert('failure',message,'isAutoHide=false,closeOnEscKey=no'); //No I18N
                }
                formSaveButton.button("reset"); //No I18N
            },
            error: function(){
                showalert('failure', translate('sdp.admin.dcconfig.settings.error.message'), 'isAutoHide=false,closeOnEscKey=no'); //No I18N
                formSaveButton.button("reset"); //No I18N
            }
        });
    },
    getAzureConfig:function()
    {
        var configJSON=azuread.apiCall("/servlet/AJaxServlet?action=getAzureConfiguration","GET"); //No I18N
        return configJSON;
    },
    saveSyncRule:function(id,btn)
    {
        var data={azure_config:{}};
        if(jQuery('#removeUser').is(":checked"))
        {
            data.azure_config.param_value='auto'; //No I18N
        }
        else
        {
            data.azure_config.param_value='manual'; //No I18N
        }
        sdpAjax({
            url: "/api/v3/azure_configs/"+id, //No I18N
            method:"PUT", //No I18N
            data: sdpAjaxInputData(data),
            success: function (response) {
                showalert('success',translate("sdp.admin.SettingsAction.success.save"),'isAutoHide=true'); //No I18N
            }
        });
        azuread.init();
        azuread.allowEdit = true;
    },
    showSyncRule:function()
    {
        if("auto" == azuread.syncRuleOption)
        {
            jQuery('#removeUser').prop('checked',true);//No I18N
        }
        else
        {
            jQuery('#doNothing').prop('checked',true);//No I18N
        }
    },
    getDomainInputData:function(domainID,isTestConnection,isOneTimeImport)
    {
        var azureDomainAPIInput=isTestConnection? {azure_domain:{}} : {azure_domain:{azure_field_map:[],azure_selected_field:[],criteria_json:{}}};
        var isClientSecretChanged=jQuery('#changeClientSecret').val();
        var _self = this;
        var isFormValueMissing=false;

        jQuery('#AzureForm :input[name=name],[name=client_id],[name=client_secret],[name=token_url]').each(function(key,val){

            if(domainID!=null && val.name == 'client_secret' && isClientSecretChanged == 'false' )
            {
                return;
            }

            if(!_self.$fc.validateField(val.name))
            {
                isFormValueMissing=true;
            }
            else{

                if(val.name == 'client_secret'){
                    azureDomainAPIInput.azure_domain[val.name] = encryptDataWithRSA(val.value);
                }
                else{
                    azureDomainAPIInput.azure_domain[val.name] = val.value;
                }
            }
        });

        if(isFormValueMissing)
        {
            _self.$fc.scrollToErrorMsg();
            return false;
        }

        if(!isTestConnection)
        {
            var cloneRowObject=azuread.cloneObj.getValues();
            if(cloneRowObject.length)
            {
                cloneRowObject.forEach((value,index) => {
                    var fieldMapData={
                        sd_field_name: value.sdp_field_name,
                        azure_field_id: { id: value.azure_field_name.id}
                    };
                    azureDomainAPIInput.azure_domain.azure_field_map.push(fieldMapData);

                    var selectedFieldData={
                        azure_field_id: value.azure_field_name.id
                    };
                    azureDomainAPIInput.azure_domain.azure_selected_field.push(selectedFieldData);
                });
            }
            else
            {
                showalert('failure',translate("common.empty.msg",[translate("azure.ad.field.mapping")]),'isAutoHide=true,delay=5'); // No I18N
                return false;
            }

            if(!isOneTimeImport)
            {
                var criteriaObject = jQuery('#AzureCustomFilter').custom_filter('getFilterData'); //No I18N
                azuread.modifyAttributeNameForSubmission(criteriaObject);
                var isCriteriaEnabled=jQuery('#basedOnCriteria').is(":checked"); //No I18N
                var withoutCriteriaEnabled=jQuery('#withoutCriteria').is(":checked"); //No I18N
                if(isCriteriaEnabled)
                {
                    if(criteriaObject)
                    {
                        azureDomainAPIInput.azure_domain.criteria_json=criteriaObject;
                        azureDomainAPIInput.azure_domain.is_criteria_enabled=true;
                    }
                    else
                    {
                        showalert('failure',translate("common.empty.msg",[translate("filter.criteria")]),'isAutoHide=true,delay=5'); // No I18N
                        return false;
                    }
                }
                else if(withoutCriteriaEnabled)
                {
                    azureDomainAPIInput.azure_domain.criteria_json=[];
                    azureDomainAPIInput.azure_domain.is_criteria_enabled=false;
                }
                else
                {
                    delete azureDomainAPIInput.azure_domain.criteria_json;
                }
            }
            else
            {
                delete azureDomainAPIInput.azure_domain.criteria_json;
            }
        }
        return azureDomainAPIInput;
    },
    saveDomainConfigurations:function(domainID,isTestConnection,isOneTimeImport)
    {
        var azureDomainAPIInput=azuread.getDomainInputData(domainID,isTestConnection,isOneTimeImport);
        if(azureDomainAPIInput != false)
        {
            if(isTestConnection)
            {
                azuread.testConnectionButtonChange(false);
            }
            azuread.domainAPICall(domainID,azureDomainAPIInput,isTestConnection,isOneTimeImport);
            if(!isTestConnection && !isOneTimeImport)
            {
                jQuery('#AzureDialog').sdp_zcomponent_dialog("close");//No I18N
            }
        }
    },
    domainAPICall: function(domainID,azureDomainAPIInput,isTestConnection,isOneTimeImport)
    {
        var _self = this;
        var input_data=sdpAjaxInputData(azureDomainAPIInput);
        if(domainID == undefined)
        {
            sdpAjax({
                url: "/api/v3/azure_domains", //No I18N
                method:"POST", //No I18N
                async:false,
                data: input_data,
                success: function (response) {
                    domainID=response.azure_domain.id;
                    jQuery('#azureDomainID').val(domainID);
                    if(isTestConnection)
                    {
                        azuread.testConnectionAndEnableFieldsAndCriteria(domainID,'add',azureDomainAPIInput.azure_domain.name); //No I18N

                        var formoptions = {
                            name: "AzureForm", //No I18N
                            entity: "azure_domain", //No I18N
                            entitypath: "/azure_domains", //No I18N
                            entitydata: response.azure_domain,
                            template: azuread.template,
                            metadata: azuread.azureDomainMetaInfo,
                            mode: "edit", //No I18N
                            container: "AzureFormContainer", //No I18N
                            formid: "AzureForm", //No I18N
                            entityName: "AzureDomain", //No I18N
                            customform: true,
                            afterRenderCallback: function () {
                                jQuery('#AzureFormContainer').find(".form-wrapper").removeClass('pb25');
                            }
                        };
                        formoptions.template.layouts[0].sections[0].fields[2].custom_render=function(){
                            return azuread.customRenderClientSecret;
                        };
                        _self.$fc = new FC(formoptions);
                    }
                },
                error: function (response) {
                    var message=response.responseJSON.response_status.messages[0].message;
                    if(response.responseJSON.response_status.messages[0].field)
                    {
                        message=message+" : <strong>"+azuread.azureDomainMetaInfo.fields[response.responseJSON.response_status.messages[0].field].display_name+"</strong>";
                    }
                    showalert('failure',message,'isAutoHide=true,delay=5'); // No I18N
                    azuread.testConnectionButtonChange(true);
                }
            });
        }
        else
        {
            sdpAjax({
                url: "/api/v3/azure_domains/"+domainID, //No I18N
                method:"PUT", //No I18N
                async:false,
                data: input_data,
                success: function (response) {
                    if(!isOneTimeImport && !isTestConnection)
                    {
                        var message=translate("sdp.common.domaindetailsupdated.message");
                        var scheduleEnabled=azuread.scheduleDetails.fullSync.isEnabled;
                        if(scheduleEnabled)
                        {
                            showalert('success',message,'isAutoHide=true,delay=5'); //No I18N
                        }
                        else
                        {
                            showconfirm(true,'title='+translate("azure.ad.domain.configuration")+', message='+message+" "+translate("azure.ad.enable.schedule.info")+', cancelbutton='+translate('sdp.common.ok')+', closebutton=yes, closeOnEscKey=yes', function(){return;});
                        }
                    }
                    if(isTestConnection)
                    {
                        azuread.testConnectionAndEnableFieldsAndCriteria(domainID,'edit',azureDomainAPIInput.azure_domain.name); //No I18N
                    }
                },
                error: function (response) {
                    var message=response.responseJSON.response_status.messages[0].message;
                    if(response.responseJSON.response_status.messages[0].field)
                    {
                        message=message+" : <strong>"+azuread.azureDomainMetaInfo.fields[response.responseJSON.response_status.messages[0].field].display_name+"</strong>";
                    }
                    showalert('failure',message,'isAutoHide=true,delay=5'); // No I18N
                    azuread.testConnectionButtonChange(true);
                }
            });
        }
    },
    testConnectionAndEnableFieldsAndCriteria:function(domainID,mode,domainName)
    {
        var result=false;
        var message="";
        if('add' == mode)
        {
            message=translate("sdp.common.domaindetailsadded.message");
        }
        else
        {
            message=translate("sdp.common.domaindetailsupdated.message");
        }
        sdpAjax({
                url: "/api/v3/azure_domains/"+domainID+"/test_domain_connection", //No I18N
                method:"GET", //No I18N
                async:false,
                success: function (response) {
                    var azureDialogContainer=jQuery('#AzureDialog');
                    if(response.test_domain_connection.status_code == 2000 )
                    {
                        if('add' == mode)
                        {
                            showconfirm(true,'title='+translate("azure.ad.domain.configuration")+', message='+message+" "+translate("azure.ad.domainadd.message")+', cancelbutton='+translate('sdp.common.ok')+', closebutton=yes, closeOnEscKey=yes');
                        }
                        else if('edit'==mode)
                        {
                            showalert('success',message+" "+translate("remote.success.alert"),'isAutoHide=true,delay=5'); //No I18N
                        }
                        result=true;

                        azureDialogContainer.find('#AzureDomainFooter,#AzureMappingSection,#AzureCloneRows,#AzureCriteria,#testConnect').removeClass('hide');
                        azureDialogContainer.find('#AzureMappingAndCriteriaSection,#saveAndTestConnection').addClass('hide');
                        azureDialogContainer.find('#azureSaveBtn').attr('data-handler', 'azuread.saveDomainConfigurations('+domainID+',false)');

                        azureDialogContainer.find('#testConnect').attr('data-handler', 'azuread.saveDomainConfigurations('+domainID+',true)');

                        azureDialogContainer.find('#importBtn').attr('data-handler', 'azuread.oneTimeImport('+domainID+')');
                    }
                    else
                    {
                        showalert('failure',message+"<br>"+translate("sdp.admin.dcconfig.connection.error")+" "+translate("sdp.request.edit.reason")+":"+response.test_domain_connection.message,'isAutoHide=false,delay=5'); // No I18N
                        azureDialogContainer.find('#saveAndTestConnection').attr('data-handler', 'azuread.saveDomainConfigurations('+domainID+',true)');
                    }
                    azuread.testConnectionButtonChange(true);
                },
                error: function (response) {
                    showalert('failure',message+"<br>"+translate("sdp.admin.dcconfig.connection.error")+" "+translate("sdp.request.edit.reason")+":"+response.responseJSON.response_status.messages[0].message,'isAutoHide=false,delay=5'); // No I18N
                    jQuery('#saveAndTestConnection').attr('data-handler', 'azuread.saveDomainConfigurations('+domainID+',true)');
                    azuread.testConnectionButtonChange(true);
                }
        });
        return result;
    },
    deleteDomain:function(id)
    {
        showconfirm(true,'title='+translate('sdp.requests.config.delete')+', message='+translate("common.delete.confirm") + ', submitbutton='+translate('sdp.requests.config.delete')+', cancelbutton='+translate('sdp.common.cancel')+', closebutton=yes', function(proceed){ //NO I18N
            if(proceed)
            {
                var result=azuread.apiCall("/api/v3/azure_domains/"+id,"DELETE"); //No I18N
                var status=result.response_status.status;
                if("success"==status)
                {
                    showalert('success',translate('sdp.admin.domain.updated'),'isAutoHide=true'); //No I18N
                }
                azuread.init();
            }
        },true);
    },
    closeDomainDialog:function()
    {
        jQuery('#AzureDialog').sdp_zcomponent_dialog("close");//No I18N
    },
    enableCriteriaSection:function(animation)
    {
        jQuery('#noRuleCriteria').addClass('hide');// No I18N
        jQuery('#fieldCriteria').removeClass('hide');// No I18N
        if(animation)
        {
            jQuery('.zdialog__content').animate({
                scrollTop: jQuery('.zdialog__content').scrollTop() + 100
            }, 700);
        }
    },
    disableCriteriaSection:function()
    {
        jQuery('#fieldCriteria').addClass('hide');// No I18N
        jQuery('#noRuleCriteria').removeClass('hide');// No I18N
    },
    getAzureFieldsMap:function(forUI)
    {
        var azureFieldsMap=new Map();
        Object.entries(azureFieldsMeta).forEach(([index,value]) => {
            azureFieldsMap.set(forUI?value.display_name:index,forUI?index:value.display_name);
        });
        return azureFieldsMap;
    },
    modifyAttributeNameForSubmission:function(criteriaObject)
    {
        var azureFieldsMap=azuread.getAzureFieldsMap(false);

        if(!jQuery.isEmptyObject(criteriaObject)){

            criteriaObject.forEach((value,index) => {
                value.field=azureFieldsMap.get(value.field);
            });
        }
        return criteriaObject;
    },
    periodicTab : function()
    {
        var azureDialogContainer=jQuery('#AzureDialog');
        azureDialogContainer.find('#importBtn').addClass('hide');
        var isNew=azureDialogContainer.find('#isNewAzureDomain').val();
        if(isNew == 'true')
        {
            azureDialogContainer.find('#azureSaveBtn').removeClass('hide');
        }
        else
        {
            azureDialogContainer.find('#azureUpdateBtn').removeClass('hide');
        }
        azureDialogContainer.find("#freezeFooter").removeAttr("uitip").removeAttr("title"); //No I18N
        azureDialogContainer.find("#freezeFooter button").removeAttr("disabled"); //No I18N
    },
    oneTimeTab : function()
    {
        var azureDialogContainer=jQuery('#AzureDialog');
        var isNew=azureDialogContainer.find('#isNewAzureDomain').val();
        azureDialogContainer.find("#azureSaveBtn, #azureUpdateBtn").addClass("hide");
        if(azureDialogContainer.find("#importSummary.active").length)
        {
            azureDialogContainer.find("#freezeFooter").attr("rel","uitip").attr("title",translate("azure.ad.onetime.freeze.button"));
            azureDialogContainer.find("#azureSaveBtn,#azureUpdateBtn,#azureCancelBtn").attr("disabled",'');
            azureDialogContainer.find("#importBtn").addClass("hide");

            if(isNew  == 'true')
            {
                azureDialogContainer.find('#azureSaveBtn').removeClass('hide');
            }
            else
            {
                azureDialogContainer.find('#azureUpdateBtn').removeClass('hide');
            }
        }
        else
        {
            azureDialogContainer.find("#freezeFooter").removeAttr("uitip").removeAttr("title"); //No I18N
            azureDialogContainer.find("#freezeFooter button").removeAttr("disabled"); //No I18N
            azureDialogContainer.find("#importBtn").removeClass("hide");
       }

       if(azureDialogContainer.find("#loginNames").val())
       {
           azureDialogContainer.find("#importBtn").removeAttr("disabled"); //No I18N
       }
       else
       {
           azureDialogContainer.find("#importBtn").attr("disabled",'');
       }

    },
    oneTimeImport:function(id)
    {
        var azureDialogContainer=jQuery('#AzureDialog');
        var upns=azureDialogContainer.find("#loginNames").val();
        var userNames=upns.split(",");

        if(userNames.length > azuread.oneTimeImportMaxUserCount)
        {
          var errMessage=translate('sdp.api.error.constraint.max_count',['0',azuread.oneTimeImportMaxUserCount]);
          showalert('failure',errMessage,'isAutoHide=true,delay=5'); //No I18N
          azuread.upnKeyUp();
          azureDialogContainer.find("#importBtn").html(translate("sdp.inventory.assetImport.stepThree.importNow"));
          return false;
        }

        var regex=/^[A-Za-z0-9'.\-_!#^~@,]+$/;
        var matched=regex.test(upns);
        if(!matched)
        {
            showalert('failure', translate('sdp.api.errormessage.invalid.getall',['- '+translate('ae.asset.o365.userprincipalname')]), 'isAutoHide=true,delay=5');//No I18N
            return false;
        }

        for(var i=0; i<userNames.length; i++){

            if(userNames[i].trim().length <= 0){
                showalert('failure', translate('sdp.api.errormessage.invalid.getall',['- '+translate('ae.asset.o365.userprincipalname')]), 'isAutoHide=true,delay=5');//No I18N
                return false;
            }
        }
        azureDialogContainer.find("#importBtn").html('<em class="icon-sm mr5 spinner-icon2 vmiddle top0"></em>'+translate("sdp.admin.requesterImportWiz.importingMsg")).attr("disabled",''); //No I18N

        azuread.saveDomainConfigurations(id,false,true);

        var upns=azureDialogContainer.find("#loginNames").val();
        var inputJSON={userPrincipalNames:upns,domainID:id};
        sdpAjax({
            url: "/servlet/AJaxServlet?action=azureOneTimeImport", //No I18N
            method:"POST", //No I18N
            data: sdpAjaxInputData(inputJSON),
            dataType : "text",//No I18N
            success: function (response)
            {
                var importResponse = JSON.parse(response);
                var status=importResponse.status;
                if('success' == status)
                {
                    azureDialogContainer.find('#totalUsers').text(importResponse.totalUsersCount);
                    azureDialogContainer.find('#addedUsers').text(importResponse.addedUsersCount);
                    azureDialogContainer.find('#updatedUsers').text(importResponse.updatedUsersCount);
                    azureDialogContainer.find('#failedUsers').text(importResponse.failedUsersCount);
                    if(importResponse.failedUsersCount > 0)
                    {
                        azureDialogContainer.find('#failedUsersLink').attr('data-handler','javascript:Community_ErrorLog.openErrorLog(\'ErrorLogDetails.do?errorId='+importResponse.failedUsersErrorLogId+'\',\'\' , \'ErrorLogDetails\',\'1000\')');
                        azureDialogContainer.find('#failedUsersLink').removeClass('hide');
                    }
                    else
                    {
                        azureDialogContainer.find('#failedUsersLink').addClass('hide');
                    }
                    azureDialogContainer.find("#importNowDiv").hide();
                    azureDialogContainer.find("#importSummary").fadeIn(500).addClass("active");

                    azureDialogContainer.find("#freezeFooter").attr("rel","uitip").attr("title",translate("azure.ad.onetime.freeze.button"));
                    azureDialogContainer.find("#freezeFooter button").attr("disabled",'');
                    azureDialogContainer.find("#importBtn").addClass("hide");
                    initTooltip('#AzureDomainFooter'); //No I18N

                    var isNew=azureDialogContainer.find('#isNewAzureDomain').val();
                    if(isNew == 'true')
                    {
                        azureDialogContainer.find('#azureSaveBtn').removeClass('hide');
                    }
                    else
                    {
                        azureDialogContainer.find('#azureUpdateBtn').removeClass('hide');
                    }
                }
                else
                {
                    var message = importResponse.errorMessage;
                    showalert('failure',message,'isAutoHide=true,delay=5'); //No I18N
                    azuread.upnKeyUp();
                }

                azureDialogContainer.find("#importBtn").html(translate("sdp.inventory.assetImport.stepThree.importNow"));
            }
        });
    },
    upnKeyUp:function()
    {
        if(jQuery('#loginNames').val()){
          jQuery("#importBtn").removeAttr("disabled");
        }else{
          jQuery("#importBtn").attr("disabled",'');
        }
    },
    reImport:function()
    {
        var azureDialogContainer=jQuery('#AzureDialog');
        azureDialogContainer.find("#azureSaveBtn, #azureUpdateBtn").addClass("hide");
        azureDialogContainer.find("#freezeFooter").removeAttr("uitip").removeAttr("title"); //No I18N
        azureDialogContainer.find("#freezeFooter button").removeAttr("disabled"); //No I18N

        azureDialogContainer.find("#loginNames").val('');
        azureDialogContainer.find("#importBtn").removeClass("hide").attr("disabled",'');
        azureDialogContainer.find("#importSummary").hide().removeClass("active");
        azureDialogContainer.find("#importNowDiv").fadeIn(500);
    },
    criteriacallback:function(list_info, field)
    {
        if(field == 'group')
        {
            //To fetch domain specific groups, domainID is passed in search_criteria
            return { start_index: "1", sort_field: "name", row_count: "20", search_criteria: [{field:"domain_id", values:[jQuery('#azureDomainID').val()],condition:"is"}]}; //No I18N
        }
        else
        {
            return list_info;
        }
    },
    setSupportedFieldMap:function()
    {
        var apiData = sdpAjaxInputData({"list_info":{"start_index":1,"row_count":100}}); //No I18N
        var supportedFieldsData=azuread.apiCall("/api/v3/azure_supported_fields","GET",false,apiData); //No I18N
        supportedFieldsData.azure_supported_fields.forEach((value,index) => {
            azuread.azureSupportedFieldMap[value.name]=value.id;
            azuread.azureSupportedFieldIdVsDisplayName[value.id]=value.name;
        });
    },
    getDefaultFieldRows:function()
    {
        var selectedData =[];

        var obj1 = {} ;
        obj1["sdp_field_name"] = {"id": "name", "name": azuread.orgDataMap["name"]}; //No I18N
        obj1["azure_field_name"] = {"id": azuread.azureSupportedFieldMap["displayName"], "name": "displayName"}; //No I18N
        selectedData.push(obj1);

        var obj2 = {} ;
        obj2["sdp_field_name"] = {"id": "login_name", "name": azuread.orgDataMap["login_name"]}; //No I18N
        obj2["azure_field_name"] = {"id": azuread.azureSupportedFieldMap["userPrincipalName"], "name": "userPrincipalName"}; //No I18N
        selectedData.push(obj2);

        return selectedData;
    },
    mandateDefaultFieldRows:function()
    {
       var cloneRowsObject = jQuery.find('[data-attr=clonerows]');
       cloneRowsObject.forEach( (cloneRow) => {
           var sdpField=jQuery(cloneRow).find('[data-name=sdp_field_name]');
           if("name" == sdpField.val() || "login_name" == sdpField.val())
           {
               //disable select2
               sdpField.select2("enable",false);
               //disable delete row icon
               var deleteRow=jQuery(cloneRow).find('[data-action=removerow]');
               deleteRow.attr("disabled",true);
           }
           else if("reporting_to" == sdpField.val()){
               var azureField = jQuery(cloneRow).find('[data-name=azure_field_name]');
               azureField.select2("enable", false); //No I18N
           }
       });
    },
    showAzureClientSecret:function(eleId, showDeleteButton)
    {
        showClientSecret(eleId, showDeleteButton);
        jQuery('#for_client_secret').trigger('focus');
    },
    testConnectionButtonChange:function(enable)
    {
        var buttonID="testConnect"; //No I18N
        var isNew=jQuery('#isNewAzureDomain').val();
        if(isNew == 'true')
        {
            buttonID="saveAndTestConnection"; //No I18N
        }
        if(enable)
        {
            jQuery('#'+buttonID).html(translate("sdp.discovery.sccm.testsave")).removeAttr("disabled"); //No I18N
        }
        else
        {
            jQuery('#'+buttonID).html('<span class="icon-sm mr5 spinner-icon2 hide"></span>'+translate("sdp.admin.common.saving")).attr("disabled",''); //No I18N
        }
    },
    checkintegervalue:function(x) {
    	var anum=/(^\d+$)|(^\d+\.\d+$)/;
    	if (x!=null && x!="" && anum.test(x)) {
    		testresult=true;
    		if(x.indexOf(".")>=0) {
    			testresult=false;
    		}
    		maxVal = Math.max(x,2147483648);
    		if(maxVal!=2147483648 || x==maxVal) {
    			testresult=false;
    		}
    	}
    	else {
    		testresult=false;
    	}
    	return (testresult);
    }
}