$platformai_config = {
    /**
     * Below functions are used for Chat GPT Configurations
     */
    //The below variable is used to store the div element of Chat GPT Settings in the DOM after rendering the model and it can be accessed for the controller acitons
    chatGptSettingsDiv: null,
    //The below variable is used to store the flag to check whether the data privacy notice is read or not
    isPrivacyRead: false,
    /**
     * To return the configuration data of Chat GPT from the API while rendering the configuration page
     * @param {Object} routeObj - admin.chatgpt route object
     * @returns configuration data of Chat GPT
     */
    getConfigurationData: function (routeObj) {
        let responseData = {
            isVendorEnabled: false,
            platform_ai_configuration: {},
            platform_ai_usecases: []
        };
        $platformai_config.isPrivacyRead = false;
        responseData.admin = routeObj.modelFor('admin'); //NO I18N
        return new Promise(function (resolve, reject) {
            sdpAjax({
                url: "/api/v3/platform_ai_vendors/_get_configurations", //No I18N
                type: "GET", //No I18N
                async: false,
                data: {
                    input_data: sdpToJSON({
                        list_info: {
                            search_criteria: {
                                field: "name",    //NO I18N
                                value: "Chat GPT",  //NO I18N
                                condition: "is" //NO I18N
                            }
                        }
                    })
                },
                success: function (data) {
                    responseData.isVendorEnabled = data.platform_ai_vendor.is_enabled;
                    responseData.vendor_id = data.platform_ai_vendor.id;
                    responseData.platform_ai_configuration = data.platform_ai_vendor.platform_ai_configuration;
                    responseData.platform_ai_usecases = $platformai_config.sortUsecases(data.platform_ai_vendor.platform_ai_usecases);
                    $platformai_config.isPrivacyRead = responseData.isVendorEnabled;
                    resolve(responseData);
                }
            });
        });
    },
    /**
     * It will be called from the afterModel hook to make any changes in the configuration UI
     * @param {Object} model - Chat GPT Configuration model
     */
    afterModelRenderConfigurations: function (model) {
        this.chatGptSettingsDiv = jQuery('#chatgpt-settings');
        let chatGptSettings = this.chatGptSettingsDiv;
        chatGptSettings.find('#gpt-enable-checkbox').prop('checked', model.isVendorEnabled);    //NO I18N
        chatGptSettings.find('#chatgpt-form').addClass(model.isVendorEnabled ? '' : 'disableDiv');
        if (model.isVendorEnabled && model.platform_ai_usecases.length) {
            model.platform_ai_usecases.forEach(function (usecase) {
                let usecaseInternalName = usecase.name;
                let usecaseCheckBox = chatGptSettings.find('#' + usecaseInternalName);
                usecaseCheckBox.prop('checked', usecase.vendor_id ? true : false);  //NO I18N
                let usecaseScopeButton = chatGptSettings.find('#scope-' + usecaseInternalName);
                usecaseScopeButton.closest('div').addClass(usecase.vendor_id ? '' : 'disableDiv');  //NO I18N
                usecaseScopeButton.closest('td').addClass(usecase.vendor_id ? '' : 'cur-na');   //NO I18N
            });
        }
    },
    /**
     * To set the selected scope value to the scope button for the usecase
     * @param {String} usecaseInternalName - The usecase internal name which is clicked
     * @param {String} scope - The scope which is selected from scope dropdown
     * @param {String} i18nKey - The i18n key of the scope
     */
    setUseCaseScope: function (usecaseInternalName, scope, i18nKey) {
        let chatGptSettings = this.chatGptSettingsDiv;
        let scopeButton = chatGptSettings.find('#scope-' + usecaseInternalName);
        let scopeButtonSpan = scopeButton.find('span#scope-' + usecaseInternalName + '-value')[0];
        scopeButton.attr('data-scope', scope);
        scopeButtonSpan.innerHTML = translate(i18nKey);
        scopeButton[0].sdpShowDropInstance.hide();
    },
    /**
     * Enable/disable the features listed
     * @param {String} usecaseInternalName - The usecase internal name which is selected/deselected
     * @param {String} scope - current scope of the usecase
     */
    selectUseCase: function (usecaseInternalName, scope) {
        let chatGptSettings = this.chatGptSettingsDiv;
        let usecaseCheckBox = chatGptSettings.find('#' + usecaseInternalName);
        let isChecked = usecaseCheckBox.is(':checked'); //NO I18N
        if(isChecked){
            if(usecaseInternalName == 'template_prediction'){
                if(typeof(sdp_app.platformai_info.is_template_prediction_enabled_once) !== undefined && sdp_app.platformai_info.is_template_prediction_enabled_once == false ){
                    let message = translate('platformai.templateprediction.privacyalert') + ' ' + translate('chatgpt.data.privacy.proceed');
                    message = message.replace(/,/g, "&#x2c;");
                    showconfirm(true, 'title=' + translate("chatgpt.data.privacy.title") + ', message=' + message + ', submitbutton=' + translate('common.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', function (proceed) { //NO I18N
                        if (!proceed) {
                            $platformai_config.chatGptSettingsDiv.find('#template_prediction').prop('checked', false); // No I18N
                        }
                        // Once shown, delete the flag
                        delete sdp_app.platformai_info.is_template_prediction_enabled_once;
                    });
                }
            } else if(usecaseInternalName == 'solution_suggestion_curation'){ // No I18N
                if(typeof(sdp_app.platformai_info.is_solution_suggestion_curation_enabled_once) !== undefined  && sdp_app.platformai_info.is_solution_suggestion_curation_enabled_once == false){
                    let message = translate('platformai.solutioncuration.privacyalert') + ' ' + translate('chatgpt.data.privacy.proceed');
                    message = message.replace(/,/g, "&#x2c;");
                    showconfirm(true, 'title=' + translate("chatgpt.data.privacy.title") + ', message=' + message + ', submitbutton=' + translate('common.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', function (proceed) { //NO I18N
                        if (!proceed) {
                            $platformai_config.chatGptSettingsDiv.find('#solution_suggestion_curation').prop('checked', false); // No I18N
                        }
                        // Once shown, delete the flag
                        delete sdp_app.platformai_info.is_solution_suggestion_curation_enabled_once;
                    });
                }
            }
        }
        if (scope !== 'internal') {
            let usecaseScopeButton = chatGptSettings.find('#scope-' + usecaseInternalName);
            usecaseScopeButton.closest('div').toggleClass('disableDiv', !isChecked);    //NO I18N
            usecaseScopeButton.closest('td').toggleClass('cur-na', !isChecked); //NO I18N
        }
    },
    /**
     * Enable/Disable the Chat GPT Configuration
     * Note: On enabling the dialog will be shown to accept the data privacy notice
     */
    enableDisableGPT: function () {
        let chatGptSettings = this.chatGptSettingsDiv;
        let gptEnableCheckBox = chatGptSettings.find('#gpt-enable-checkbox');
        let isChecked = gptEnableCheckBox.is(':checked');   //NO I18N
        if (isChecked) {
            if ($platformai_config.isPrivacyRead) {
                chatGptSettings.find('#chatgpt-settings-div').removeClass('cur-na');
                chatGptSettings.find('#chatgpt-form').removeClass('disableDiv');
            } else {
                let privacyNoticeDialog = jQuery('#gpt-data-privacy-notice');
                privacyNoticeDialog.dialog({
                    modal: true,
                    open: function () {
                        jQuery('#gpt-privacy-notice-proceed').off('click.gpt-proceed').on('click.gpt-proceed', function () {    //NO I18N
                            $platformai_config.isPrivacyRead = true;
                            if(typeof(sdp_app.platformai_info.is_template_prediction_enabled_once) !== undefined){
                                delete sdp_app.platformai_info.is_template_prediction_enabled_once;
                            }
                            if(typeof(sdp_app.platformai_info.is_solution_suggestion_curation_enabled_once) !== undefined){
                                delete sdp_app.platformai_info.is_solution_suggestion_curation_enabled_once;
                            }
                            chatGptSettings.find('#chatgpt-settings-div').removeClass('cur-na');
                            chatGptSettings.find('#chatgpt-form').removeClass('disableDiv');
                            privacyNoticeDialog.dialog('close');  //NO I18N
                        });
                        jQuery('#gpt-privacy-notice-cancel').off('click.gpt-cancel').on('click.gpt-cancel', function () {   //NO I18N
                            gptEnableCheckBox.prop('checked', false);    //NO I18N
                            privacyNoticeDialog.dialog('close');  //NO I18N
                        });
                    },
                    close: function () {
                        jQuery('body').removeClass('of-h');
                        privacyNoticeDialog.dialog('destroy');  //NO I18N
                    },
                    width: 500,
                    position: {
                        my: 'center', //NO I18N
                        at: 'center' //NO I18N
                    },
                    dialogClass: 'dpn-gpt' // no i18n
                });
            }

        } else {
            chatGptSettings.find('#chatgpt-settings-div').addClass('cur-na');
            chatGptSettings.find('#chatgpt-form').addClass('disableDiv');
        }
    },
    /**
     * To save the Chat GPT Configuration by doing necessary validations
     * @param {Object} controllerObj - admin.chatgpt controller object to get the model and modify the data
     * @returns 
     */
    saveGPTConfiguration: function (controllerObj) {
        let chatGPTSettings = this.chatGptSettingsDiv;
        let isGPTEnabled = chatGPTSettings.find('#gpt-enable-checkbox').is(':checked'); //NO I18N
        let model = controllerObj.get('model');
        if (!isGPTEnabled) {
            if (model.isVendorEnabled) {
                sdpAjax({
                    url: "/api/v3/platform_ai_vendors/" + model.vendor_id, //No I18N
                    type: "PUT", //No I18N
                    async: false,
                    data: {
                        input_data: sdpToJSON({
                            platform_ai_vendor: {
                                is_enabled: false
                            }
                        })
                    }
                }).then(function (data) {
                    if (data.response_status.status == "success") {
                        $platformai_config.isPrivacyRead = false;
                        controllerObj.set('model.isVendorEnabled', false);  //NO I18N
                        controllerObj.set('model.platform_ai_configuration', {});   //NO I18N
                        let platform_ai_usecases = [];
                        controllerObj.model.platform_ai_usecases.forEach(function (usecase) {
                            let useCaseObj = {
                                scope: 'internal',  //NO I18N
                                vendor_id: null,
                                id: usecase.id,
                                name: usecase.name,
                                display_name: usecase.display_name
                            };
                            if (usecase.scope != 'internal') {
                                useCaseObj.scope = 'All';   //NO I18N
                            }
                            platform_ai_usecases.push(useCaseObj);
                        });
                        controllerObj.set('model.platform_ai_usecases', platform_ai_usecases);   //NO I18N

                        showalert('success', translate("common.action.disabled", [translate("chatgpt.configuration.label")]), "isAutoHide=true"); // No I18N
                    }
                });
            } else {
                showalert('warning', translate("sdp.common.nochangestosave"), "isAutoHide=true"); // No I18N
            }
        } else {
            let chatGPTForm = chatGPTSettings.find('#chatgpt-form');

            let organization_name = chatGPTForm.find('#organization_name');
            let organizationNameVal = organization_name.val().trim();
            if (!organizationNameVal) {
                organization_name.val('');
            }

            let organization_id = chatGPTForm.find('#organization_id');
            let organizationIdVal = organization_id.val().trim();
            if (!organizationIdVal) {
                organization_id.val('');
            }

            let api_key = chatGPTForm.find('#api_key');
            let apiKeyVal = api_key.val().trim();
            if (!apiKeyVal) {
                api_key.val('');
            }

            if (!chatGPTForm.valid()) {
                return;
            }

            let isAdd = !model.platform_ai_configuration.id;
            let vendorID = model.vendor_id;
            if (isAdd) {
                $platformai_config.addConfiguration(chatGPTForm, model, organizationIdVal, organizationNameVal, apiKeyVal, vendorID, controllerObj);
            } else {
                $platformai_config.updateConfiguration(chatGPTForm, model, organizationIdVal, organizationNameVal, apiKeyVal, vendorID, controllerObj);
            }
        }
    },
    /**
     * PlatformAI Configuration Add API call will be triggerred with the form data
     * @param {Form} chatGPTForm - The form element of Chat GPT Configuration
     * @param {Object} model - Chat GPT Configuration model
     * @param {String} orgID - Organization ID
     * @param {String} orgName - Organization Name
     * @param {String} apiKey - API Key
     * @param {String} vendorID - Vendor ID
     * @param {Object} controllerObj - admin.chatgpt controller object
     */
    addConfiguration: function (chatGPTForm, model, orgID, orgName, apiKey, vendorID, controllerObj) {
        sdpAjax({
            url: "/api/v3/platform_ai_vendors/" + vendorID, //No I18N
            type: "PUT", //No I18N
            async: false,
            data: {
                input_data: sdpToJSON({
                    platform_ai_vendor: {
                        platform_ai_configuration: {
                            organization_id: orgID,
                            organization_name: orgName,
                            api_key: encryptDataWithRSA(apiKey)
                        }
                    }
                })
            }
        }).then(function (data) {
            if (data.response_status.status == "success") {
                let platform_ai_configuration = data.platform_ai_vendor.platform_ai_configuration;
                controllerObj.set('model.platform_ai_configuration', platform_ai_configuration);    //NO I18N
                controllerObj.set('model.isVendorEnabled', true);   //NO I18N
                $platformai_config.updateUseCases(chatGPTForm, model, controllerObj, vendorID);
                showalert('success', translate("api.saved.success", [translate("chatgpt.configuration.label")]), "isAutoHide=true"); // No I18N
            }
        });
    },
    /**
     * PlatformAI Configuration Update API call will be triggerred with the form data
     * @param {Form} chatGPTForm - The form element of Chat GPT Configuration
     * @param {Object} model - Chat GPT Configuration model
     * @param {String} orgID - Organization ID
     * @param {String} orgName - Organization Name
     * @param {String} apiKey - API Key
     * @param {String} vendorID - Vendor ID
     * @param {Object} controllerObj - admin.chatgpt controller object
     */
    updateConfiguration: function (chatGPTForm, model, orgID, orgName, apiKey, vendorID, controllerObj) {
        let platform_ai_configuration = model.platform_ai_configuration;
        let configurationID = platform_ai_configuration.id;
        let currentOrgID = platform_ai_configuration.organization_id;
        let currentOrgName = platform_ai_configuration.organization_name;
        let currentApiKey = platform_ai_configuration.api_key;
        let isConfiguationModified = false;
        let platform_ai_configuration_data = { id: configurationID };
        if (orgID !== currentOrgID) {
            isConfiguationModified = true;
            platform_ai_configuration_data.organization_id = orgID;
        }
        if (orgName !== currentOrgName) {
            isConfiguationModified = true;
            platform_ai_configuration_data.organization_name = orgName;
        }
        if (apiKey !== currentApiKey) {
            isConfiguationModified = true;
            platform_ai_configuration_data.api_key = encryptDataWithRSA(apiKey);
        }
        if (isConfiguationModified) {
            sdpAjax({
                url: "/api/v3/platform_ai_vendors/" + vendorID, //No I18N
                type: "PUT", //No I18N
                async: false,
                data: {
                    input_data: sdpToJSON({
                        platform_ai_vendor: {
                            platform_ai_configuration: platform_ai_configuration_data
                        }
                    })
                },
                error: function (data) {
                    data = data.responseJSON;
                    if (data.response_status.messages[0].message) {//Get the mesage from response
                        let errmsg = data.response_status.messages[0].message;
                        showalert("failure", errmsg, "isAutoHide=false");//No I18N
                    }
                }
            }).then(function (data) {
                if (data.response_status.status == "success") {
                    let platform_ai_configuration = data.platform_ai_vendor.platform_ai_configuration;
                    chatGPTForm.find('#api_key').val(platform_ai_configuration.api_key);
                    controllerObj.set('model.platform_ai_configuration', platform_ai_configuration);    //NO I18N
                    $platformai_config.updateUseCases(chatGPTForm, model, controllerObj, vendorID);
                    showalert('success', translate("api.updated.success", [translate("chatgpt.configuration.label")]), "isAutoHide=true"); // No I18N
                }
            });
        } else {
            let isModified = $platformai_config.updateUseCases(chatGPTForm, model, controllerObj, vendorID);
            if (isModified) {
                showalert('success', translate("api.updated.success", [translate("chatgpt.configuration.label")]), "isAutoHide=true"); // No I18N
            } else {
                showalert('warning', translate("sdp.common.nochangestosave"), "isAutoHide=true"); // No I18N
            }
        }

    },
    /**
     * Method to check whether the usecases are modified or not using the usecase array data from model object and the current one
     * @param {Array} useCaseData - current usecases data
     * @param {Array} oldUseCases - old usecases data
     * @returns isUseCasesModified - Whether the usecases are modified or not
     */
    isUseCasesModified: function (useCaseData, oldUseCases) {
        let isUseCasesModified = false;

        useCaseData.some(newUseCase => {

            let oldUseCase = oldUseCases.find(function (usecase) { return usecase.id == newUseCase.id; });

            //If the scope is internal then scope modified check is not required
            //Else have to check whether the scope is modified or not
            if (oldUseCase.scope != 'internal' && oldUseCase.scope != newUseCase.scope) {
                isUseCasesModified = true;

                //If the usecase is disabled before and enabled now
                //or if the usecase is enabled before and disabled now
            } else if ((!oldUseCase.vendor_id && newUseCase.vendor_id) ||
                (oldUseCase.vendor_id && !newUseCase.vendor_id)) {
                isUseCasesModified = true;
            }

            //If isUseCasesModified is true then it breaks the loop
            return isUseCasesModified;
        });
        return isUseCasesModified;
    },
    /**
     * PlatformAI UseCases Update API call will be triggerred with the usecases selected and scope modified
     * @param {Form} chatGPTForm - The form element of Chat GPT Configuration
     * @param {Object} model - Chat GPT Configuration model
     * @param {Object} controllerObj - admin.chatgpt controller object
     * @param {String} vendorID - Vendor ID
     * @returns isModified - Whether the usecases are modified or not
     */
    updateUseCases: function (chatGPTForm, model, controllerObj, vendorID) {
        let useCaseData = [];
        chatGPTForm.find('input[type=checkbox]').each(function (i, usecaseCheckBox) {
            let useCaseInternalName = usecaseCheckBox.id;
            let useCaseId = jQuery(usecaseCheckBox).attr('data-id');
            let isUseCaseEnabled = usecaseCheckBox.checked;
            let usecase = {
                id: useCaseId,
                vendor_id: null
            };
            let initialScope = jQuery(usecaseCheckBox).attr('data-scope');
            if (!isUseCaseEnabled) {
                if (initialScope !== 'internal') {
                    usecase.scope = 'All';  //NO I18N
                }
                useCaseData.push(usecase);
            } else if (isUseCaseEnabled) {
                usecase.vendor_id = { "id": vendorID }; //NO I18N
                if (initialScope !== 'internal') {
                    let useCaseScopeButton = chatGPTForm.find('#scope-' + useCaseInternalName);
                    let scope = useCaseScopeButton.attr('data-scope');
                    usecase.scope = scope;
                }
                useCaseData.push(usecase);
            }
        });
        if (useCaseData.length && $platformai_config.isUseCasesModified(useCaseData, model.platform_ai_usecases)) {
            return sdpAjax({
                url: "/api/v3/platform_ai_vendors/" + vendorID, //No I18N
                type: "PUT", //No I18N
                async: false,
                data: {
                    input_data: sdpToJSON({
                        platform_ai_vendor: {
                            platform_ai_usecases: useCaseData
                        }
                    })
                }
            }).then(function () {
                let platform_ai_usecases = [];
                model.platform_ai_usecases.forEach(function (usecase) {
                    let useCaseObj = {
                        scope: 'internal',  //NO I18N
                        vendor_id: null,
                        id: usecase.id,
                        name: usecase.name,
                        display_name: usecase.display_name
                    };
                    var currentUseCaseData = useCaseData.find(obj => obj.id == usecase.id);
                    if (currentUseCaseData.scope) {
                        useCaseObj.scope = currentUseCaseData.scope;
                    }
                    useCaseObj.vendor_id = currentUseCaseData.vendor_id;
                    platform_ai_usecases.push(useCaseObj);
                });
                controllerObj.set('model.platform_ai_usecases', platform_ai_usecases);    //NO I18N
                setTimeout(function () {
                    platform_ai_usecases.forEach(function (usecase) {
                        let usecaseInternalName = usecase.name;
                        let usecaseCheckBox = chatGPTForm.find('#' + usecaseInternalName);
                        usecaseCheckBox.prop('checked', usecase.vendor_id ? true : false);  //NO I18N
                        let usecaseScopeButton = chatGPTForm.find('#scope-' + usecaseInternalName);
                        usecaseScopeButton.closest('div').addClass(usecase.vendor_id ? '' : 'disableDiv');  //NO I18N
                        usecaseScopeButton.closest('td').addClass(usecase.vendor_id ? '' : 'cur-na');   //NO I18N
                    });
                }, 10);
                return true;
            });
        } else {
            return false;
        }
    },
    /**
     * Sort the usecases based on the scope and display name
     * @param {List} usecases - UseCases list
     * @returns sorted usecases list
     */
    sortUsecases: function (usecases) {
        const internalScopeUseCases = usecases.filter(obj => obj.scope === 'internal'); //NO I18N
        internalScopeUseCases.sort((a, b) => a.display_name.localeCompare(b.display_name));

        const nonInternalScopeUsecases = usecases.filter(obj => obj.scope !== 'internal');  //NO I18N
        nonInternalScopeUsecases.sort((a, b) => a.display_name.localeCompare(b.display_name));

        return [...internalScopeUseCases, ...nonInternalScopeUsecases];

    },
    /**
     * Below functions are used for Usage Statistics Popup
     */
    //The below variable is used to store the date criteria selected in the Usage Statistics Filter
    date_criteria: null,
    //The below variable is used to store the web component id of the Usage Statistics Popup
    webComponentId: 'webc-platform_ai_usage_statistics',    //NO I18N
    //The below variable is used to store the flag to check whether the Usage Statistics Popup is opened or not
    isUsageStatsOpened: false,
    /**
     * To open the Usage Statistics Popup
     */
    openUsageStatsPopUp: function () {
        jQuery('.page-progressbar, #freeze-details').show(); //Progress bar load before opening dialog //No I18N
        $platformai_config.isUsageStatsOpened = false;
        let usageStatsdialog = jQuery('<div id="usage-statistics-popup" class="gpt-us-container"></div>'); //No I18N
        $platformai_config.renderListView(usageStatsdialog);
        var options = {
            title: translate('chatgpt.usagestats.title'),
            minimizable: false,
            maximizable: false,
            type: "modal", //No I18N
            width: 'auto',//No I18N
            closeOnEscKey: true,
            closeOnOverlayClick: true,
            resizeWindow: true,
            open: function () {
                jQuery('.page-progressbar,#freeze-details').hide(); // Stoping progress bar after opening the dialog //No I18N
            },
            beforeclose: function () {
                jQuery("#platform-ai-usage-statistics-popup-wrapper").remove(); //No I18N
                delete WebComponents.instancePool[$platformai_config.webComponentId];
                jQuery('#usage-statistics-listview-container').remove();
            },
            height: jQuery(window).height(),
            position: {
                right: "0px", //No I18N
                top: "0px" //No I18N
            },
            draggable: false,
            animation: {
                open: {
                    className: 'zeffects--slideright', //No I18N
                    duration: 300
                }
            }
        };
        if (sdp_user.DIRECTION == "RTL") { //No I18N
            options.position = {
                left: "0px", //No I18N
                top: "0px" //No I18N
            };
            options.animation = {
                open: {
                    className: 'zeffects--slideleft', //No I18N
                    duration: 300
                }
            }
        }
        jQuery("#platform-ai-usage-statistics-popup-wrapper").sdp_zcomponent_dialog(options); //No I18N
    },
    /**
     * To render the Usage Statistics List View
     * @param {jQueryObject} usageStatsdialog - Usage Statistics dialog
     */
    renderListView: function (usageStatsdialog) {
        /**
         * Render the Usage Statistics list view using table component
         */

        jQuery("body").append("<div id='platform-ai-usage-statistics-popup-wrapper'  style='display:none'></div>"); //No I18N
        jQuery("#platform-ai-usage-statistics-popup-wrapper").append(usageStatsdialog); //No I18N
        renderhbs('#usage-statistics-popup', 'platformai_usage_statistics', {}, false, "platform_ai");  //NO I18N

        WebComponents.render($platformai_config.webComponentId);
    },
    /**
     * To initialize the event listeners for the Usage Statistics Filter
     * @param {jQueryObject} usageStatsdialog - Usage Statistics dialog
     */
    listenFilterEvents: function (usageStatsdialog) {
        const timeFilterContainer = usageStatsdialog.find('div#usage_stats_filter_date')[0];
        let tablecomp = WebComponents.getInstance($platformai_config.webComponentId);

        //When the date filter is modified, the criteria will be stored in the variable $platformai_config.date_criteria
        jQuery(timeFilterContainer).off('timeFilterChange.usage-stats-date-filter').on('timeFilterChange.usage-stats-date-filter', function () { //No I18N
            const getCriteria = timeFilterContainer.timeFilter.getCriteria();
            $platformai_config.date_criteria = getCriteria;

        });

        //When the Apply button is clicked, the table will be refreshed with the new criteria based on the filter options
        jQuery(usageStatsdialog).find('#usage-stats-filter-apply').off('click.usage-stats-filter-apply').on('click.usage-stats-filter-apply', function () { //NO I18N
            let search_criteria = [];
            let performedBy = jQuery(usageStatsdialog).find("#performed_by").select2('data')    //NO I18N
            let features = jQuery(usageStatsdialog).find("#platform_ai_features").select2('data');  //NO I18N

            if ($platformai_config.date_criteria) {
                search_criteria.push($platformai_config.date_criteria);
            }
            if (performedBy.length) {
                let performedByArr = [];
                performedBy.forEach(function (user) {
                    performedByArr.push(user.id);
                });
                search_criteria.push({
                    "condition": "in",  //NO I18N
                    "field": "user_id", //NO I18N
                    "values": performedByArr,   //NO I18N
                    "logical_operator": "and"   //NO I18N
                });
            }
            if (features.length) {
                let featureArr = [];
                features.forEach(function (feature) {
                    featureArr.push(feature.id);
                });
                search_criteria.push({
                    "condition": "in",  //NO I18N
                    "field": "usecase_id",  //NO I18N
                    "values": featureArr,   //NO I18N
                    "logical_operator": "and"   //NO I18N
                });
            }
            tablecomp.t_obj.table_info.list_info.search_criteria = search_criteria;

            tablecomp.refreshTable();
            $platformai_config.updateTotalTokenCount(search_criteria);
        });

        //When the Reset button is clicked, the filter options will be reset
        jQuery(usageStatsdialog).find('#usage-stats-filter-reset').off('click.usage-stats-filter-reset').on('click.usage-stats-filter-reset', function () { //NO I18N
            if (tablecomp.t_obj.table_info.list_info.search_criteria && tablecomp.t_obj.table_info.list_info.search_criteria.length) {
                tablecomp.t_obj.table_info.list_info.search_criteria = [];
            }
            $platformai_config.date_criteria = null;
            usageStatsdialog.find('#performed_by, #platform_ai_features').select2("val", ""); //No I18N
            jQuery(timeFilterContainer).find('.zselectbox__clearbutton').trigger('mousedown');
        });

        //When the Show/Hide Filter button is clicked, the filter options will be shown/hidden
        jQuery(usageStatsdialog).find('#usage-stats-filter-btn').off('click.usage-stats-filter-btn').on('click.usage-stats-filter-btn', function () {   //NO I18N
            let filterBtnContainer = jQuery(this);
            let filterSpan = filterBtnContainer.find('span:first');
            const isHideFilterOptionShown = filterSpan.hasClass('remove-col');  //NO I18N
            const removeClass = isHideFilterOptionShown ? 'remove-col' : 'filter3'; //NO I18N
            const addClass = isHideFilterOptionShown ? 'filter3' : 'remove-col';    //NO I18N
            const filterOptionName = isHideFilterOptionShown ? translate('sdp.request.advsearch.showfilter') : translate('sdp.request.advsearch.hidefilter');
            isHideFilterOptionShown ? jQuery(usageStatsdialog).addClass('hd-filter') : jQuery(usageStatsdialog).removeClass('hd-filter');
            filterSpan.removeClass(removeClass).addClass(addClass);
            filterBtnContainer.find('#show-hide-filter-label').text(filterOptionName);
            filterBtnContainer.attr('aria-label', filterOptionName);
        });
    },
    /**
     * Initialize the Time Filter component for the Usage Statistics Filter
     */
    timeFilter: function (usageStatsdialog) {
        const timeFilterContainer = usageStatsdialog.find('div#usage_stats_filter_date')[0];
        const tf_options = {
            holder: timeFilterContainer,
            optionsOrder: ['today', 'yesterday', 'last_7_days', 'last_30_days', 'this_week', 'last_month', 'this_month', 'specific_date', 'custom_range'],  //NO I18N
            fieldName: 'completed_time',    //NO I18N
            defaultValue: null,
            placeHolder: translate('sdp.common.choosedate_caps'),
            dollarValue: false,
            for: 'usage-stats'  //NO I18N
        };
        timeFilter(tf_options);
    },
    /**
     * To initialize the Performed By select2 dropdowns for the Usage Statistics Filter
     * @param {Element} performed_by_select - Performed By select2 dropdown input element
     */
    performedBySelect2: function (performed_by_select) {
        let performedBy = [];
        sdpAjax({
            method: "GET",//No I18N
            url: "/api/v3/platform_ai_usage_statistics/_get_performed_by",    //NO I18N
            acceptODCompatible: true,
            async: true,
            success: function (response) {
                jQuery.each(response.performed_by, function (i, data) {
                    var obj = {
                        "text": data.name,//No I18N
                        "id": data.id//No I18N
                    };
                    performedBy.push(obj);
                });
                performed_by_select.select2({
                    placeholder: translate("sdp.change.sla.select"),
                    multiple: true,
                    data: performedBy,
                    closeOnSelect: false
                }).off('.usagestats_performedby').on('change.usagestats_performedby', function () { //NO I18N
                    //Only 200 performed by users can be selected since the values array in search_criteria has a limitation of 200
                    let performedByData = performed_by_select.select2('data');  //NO I18N
                    if (performedByData.length > 200) {
                        performed_by_select.select2('data', performedByData.slice(0, 200)); //NO I18N
                        performed_by_select.select2('close');   //NO I18N
                        showalert('failure', translate('sdp.admin.multiselect.max.option.exceed', [200]), "isAutoHide=false"); // No I18N
                    }
                });
                performed_by_select.prev().find(".select2-choices").prop("style", "max-height: 65px!important; overflow-y: auto;");  //NO I18N
            }
        });
    },
    /**
     * To initialize the Feature select2 dropdowns for the Usage Statistics Filter
     * @param {Element} feature_select - Feature select2 dropdown input element
     */
    featureSelect2: function (feature_select) {
        let featureOptions = [];
        sdpAjax({
            method: "GET",//No I18N
            url: "/api/v3/platform_ai_usage_statistics/_get_usecases",    //NO I18N
            acceptODCompatible: true,
            async: false,
            success: function (response) {
                const sortedUsecases = $platformai_config.sortUsecases(response.usecases);
                jQuery.each(sortedUsecases, function (i, data) {
                    var obj = {
                        "text": data.display_name,//No I18N
                        "id": data.id//No I18N
                    };
                    featureOptions.push(obj);
                });
                feature_select.select2({
                    placeholder: translate("sdp.change.sla.select"),
                    multiple: true,
                    data: featureOptions,
                    closeOnSelect: false
                });
                feature_select.prev().find(".select2-choices").prop("style", "max-height: 65px!important; overflow-y: auto;");  //NO I18N
            }
        });
    },
    /**
     * Callback function to manipulate the data inside the Input Data of the API call
     *
     * @param {object} table_info - It holds the list_info and fields_required of the API call
     * @returns
     */
    row_inputdata: function (table_info) {
        const listInfo = table_info.list_info ? table_info.list_info : { "sort_field": "id", "sort_order": "asc", "get_total_count": true };    //NO I18N
        var row_inputdata = { "list_info": listInfo };   //NO I18N

        return row_inputdata;
    },
    /**
     * Callback function after table body render
     *
     * isUsageStatsOpened flag is used to check whether the Usage Statistics Popup is opened or not for the first time
     * If there is no data then we can hide the filter options and Total Token Count label
     * If there is data then we can initialize the filter options and then listen the events
     */
    callbackAfterBodyRender: function () {
        if (!$platformai_config.isUsageStatsOpened) {
            let tableComp = WebComponents.getInstance($platformai_config.webComponentId);
            let usageStatsdialog = jQuery('#usage-statistics-popup');
            if (tableComp.loadedIDs.length) {
                /**
                 * Initialize the Time Filter, Performed By and Feature select2 dropdowns for the Usage Statistics Filter
                 */
                $platformai_config.timeFilter(usageStatsdialog);
                $platformai_config.performedBySelect2(usageStatsdialog.find('#performed_by'));
                $platformai_config.featureSelect2(usageStatsdialog.find('#platform_ai_features'));
                $platformai_config.listenFilterEvents(usageStatsdialog);

                /**
                 * Update the total token in the list view on initial loading
                 */
                $platformai_config.updateTotalTokenCount();
            } else {
                jQuery(usageStatsdialog).addClass('hd-filter');
                jQuery(usageStatsdialog).find('#usage-stats-filter-div').addClass('hide');
                jQuery(usageStatsdialog).find('#total_token_count_div').removeClass('disp-ib').addClass('hide');
            }
            $platformai_config.isUsageStatsOpened = true;
        }
    },
    /**
     * Update Total Token Count based on the filter selected
     * @param {Object} search_criteria - Search Criteria based on the filter selected in the Usage Statistics pop-up
     */
    updateTotalTokenCount: function (search_criteria) {
        let sdpAjaxObj = {
            url: "/api/v3/platform_ai_usage_statistics/_get_total_token_count", //No I18N
            type: "GET", //No I18N
            async: true,
            success: function (data) {
                jQuery('#total_token_count').html(data.platform_ai_usage_statistics.total_tokens_count); //NO I18N
            }
        };
        if (search_criteria) {
            sdpAjaxObj.data = {
                input_data: sdpToJSON({
                    list_info: {
                        search_criteria: search_criteria
                    }
                })
            }
        }
        sdpAjax(sdpAjaxObj);
    }
};