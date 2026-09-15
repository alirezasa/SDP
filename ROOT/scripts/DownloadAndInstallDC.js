var installDC = {
    init: function(options) {
   
        var self = installDC;
        options = options || {};
        self.modal = options.modal === false ? false : true;
        self.onDCInstalledCB = function() {
            options.onDCInstalledCB && options.onDCInstalledCB();
            jQuery('#dc_dialog z-collapsiblepanel div.zcollapsiblepanel__header').removeClass('ptr-ev-none'); //NO I18N
            self.showDialogCloseButton();
        }
        self.noCloseButton = options.noCloseButton || false;
        self.dialogId = "dc_dialog"; //NO I18N

        Handlebars.registerHelper('incremented',  function (index) {//NO I18N
            return index + 1;
        });
        if(!options.method) {
            self.configureDCSetup(options.dialogFor);
        } else {
            var method = options.method;
            self[method.name].apply(self, method.args);
        }
    },
    enableDownload: function (isEnabled) {
        installDC.getDialog().find("#dc_download_install").prop("disabled", !isEnabled);//No I18N
    },
    bindEvents: function() {
        switch (this.statusCode) {
            case 0:
                var dialog = this.getDialog();
                var installBtn = dialog.find("#dc_download_install");

                installBtn.mouseover(function () {
                    dialog.find("#dc_folder_info").show();
                });

                installBtn.mouseout(function () {
                    dialog.find("#dc_folder_info").hide();
                });

                break;
        }
    },
    configureDCSetup: function(dialogFor) {
        var self = this;

        this.getDCSetupStatus(function(statusCode, response) {
            if (statusCode !== 4) {
                self.openDialog();
                jQuery("#freezeAgentConfig .loading1").hide();
                self.openDialogWithContent("dc_install_st_loading");//NO I18N
            } else {
                self.onDCInstalledCB();
                return;
            }

            /*
            Handling DC incompatibility Error Message here to avoid breakage in UI components
            */
            var uemProdName = getUEMProdName(false, false);
            if(response.dc_status === -2) {
                self.getDCDownloadLink(function(link) {
                    var data = {link: link, required_dc_version: response.required_dc_version, dc_patch_url: response.dc_patch_url, prodName: encodeHTML(uemProdName.uem_integ_prod), isAssetBuild: sdp_app.IS_AE};
                    self.setDialog(translate("sdp.dc.incompatible.title", encodeHTML([uemProdName.uem_central])), renderhbs(null, 'scan-incompatable-version-msg', data, false, 'scan', null, null, null, true));//NO I18N
                });

                return;
            }

            self.isRemoteServer = response.is_remote_server;
             //Migrated case - when Learn More is clicked for agent replace header message - fromHeader
            if(dialogFor !== "fromHeader" && response.customer_type !== 1 && self.showErrorSummary(response, dialogFor)) {
                return;
            }
            
            if(dialogFor !== "status"  && response.customer_type === 1 || response.customer_type === 2 &&( dialogFor === "fromHeader" || (dialogFor !== "fromHeader" && statusCode !== 4))) {   //no i18n
                return self.showDCSwitchInfo();
            }

            

            if(statusCode === 0) {
                //shows download and install dialog if Central Desktop dependency component is not installed in SDP.
                self.showDownloadDialog(statusCode, response);
            } else {
                //show downloading/installation progress.
                self.showDownloadingStatus(statusCode);
            }
        });
    },
    retry: function () {
        var self = installDC;
        this.getDCSetupStatus(function (statusCode, response) {
            if(statusCode === 0) {
                self.showDownloadDialog(statusCode, response);
            } else {
                self.configureDCSetup();
            }
        });
    },
    contactSupport: function () {
        NewWindow('/supportRequest.do?submitAction=fillDCform', 'notifyuser', '850', '600', 'yes', 'center');
    },
    handleOtherDCProducts: function (response) {
        var isIdentified = response.is_other_dc_products_identified;
        this.setDialogContent(isIdentified === "true" ? "confirm_dc_install" : "dc_other_prod_info");//NO I18N
    },
    showDownloadDialog: function (statusCode, response) {
        var self = installDC;
        response.UEM_CENTRAL_DC = encodeHTML(getUEMProdName(false, false).uem_central);
        response.dcIntegrationLink = "/app#/admin/uemproducts"; //NO I18N
        self.setDialog(translate("sdp.dc.install.suc.title"), renderhbs(null, 'scan-dc-config-setup-template', response, false, 'scan', null, null, null, true));//NO I18N
        self.bindEvents(statusCode);
    },
    //returns "Status code" of the downloading/installation of dependency component.
    getDCSetupStatus: function(callback) {
        var self = this;
        sdpAjax({
            url: "/DCActions.do?action=status", //No i18N
            success: function(response) {
                var statusCode = response.dc_status;
                self.statusCode = statusCode;
                self.customer_type = response.customer_type;
                callback(statusCode, response);
            },
            failedCallBack: function() {
                self.closeDialog();
                showalert("failure", translate("sdp.vulnerability.error.unknownexception.msg"),'isAutoHide=true');  //No i18N
            },
            ignorefailuremessage: true
        });
    },
    getDialog: function () {
        return jQuery("#" + this.dialogId);
    },
    setDialog: function(title, html) {
        var dialog = this.getDialog();

        if(dialog.hasClass('ui-dialog-content')) {
            dialog.dialog('option', 'title', title);//NO I18N
        }

        dialog.html(html);
    },
    setDialogContent: function(id) {
        var content = jQuery("#" + id);
        this.setDialog(content.attr("title"), content.html());
    },
    onDialogClose: function () {
        var self = installDC;

        jQuery("body").css("position", "");//NO I18N
        self.isDialogOpen = false;
        self.clearTimer();
    },
    openDialog: function() {
        var self = this;
        var container = self.getDialog();
        if(self.isDialogOpen) {
            return;
        }
        jQuery("body").css("position", "relative");//NO I18N
        self.isDialogOpen = true;
        container.dialog({
            width: 'auto', //NO I18N
            height: 'auto', //NO I18N
            maxHeight: 650,
            appendTo: '#dc_dialog_container', //NO I18N
            position: { my: "center top", at: "center top+100", of: window }, //NO I18N
            create: function (event, ui) {
                jQuery(this).css("maxWidth", "750px"); //NO I18N
            },
            modal: self.modal,
            close: self.onDialogClose
        });

        if(self.noCloseButton) {
            self.hideDialogCloseButton();
        }
    },
    openDialogWithContent: function(id) {
        var self = installDC;
        self.openDialog();
        self.setDialogContent(id);
    },
    hideDialogCloseButton: function () {
        jQuery(".ui-dialog-titlebar-close").hide();
    },
    showDialogCloseButton: function () {
        jQuery(".ui-dialog-titlebar-close").show();
    },
    closeDialog() {
        if(this.getDialog().hasClass('ui-dialog-content')) {
           this.getDialog().dialog("close"); //No i18N
        }
    },
    showProxyConfig: function() {
        var self = this;
        self.setDialogContent("proxy_config_dialog"); //No i18N
        self.clearTimer();

        var rules = {
            proxy_host_addrs: {
                required: true
            },
            proxy_port_no: {
                required: true,
                number: true,
                maxlength: 5
            },
            proxy_user_name: {
                required: true
            },
            proxy_pwd: {
                required: true
            }
        };
        var messages = {
            proxy_host_addrs: {
                required: translate("host.mandatory.error")
            },
            proxy_port_no: {
                required: translate("port.mandatoryerror")
            },
            proxy_user_name: {
                required: translate("dc.username.mandatoryerror")
            },
            proxy_pwd: {
                required: translate("sdp.jserror.password")
            }
        };

        sdpAjax({
            url: "/api/v3/proxy_settings", //No i18N
            success: function(response) {
                var settings = response.proxy_settings;
                if(settings.length) {
                    settings = settings[0];
                    jQuery("#proxy_host_addrs").val(settings.host);
                    jQuery("#proxy_port_no").val(settings.port);
                    jQuery("#proxy_user_name").val(settings.username);
                    jQuery("#proxy_pwd").val(settings.password);
                    self.proxySettingId;
                }
            },
            ignorefailuremessage: true
        });

        var form = self.getDialog().find("form");
        this.validateForm(form, rules, messages);
    },
    validateForm: function(form, rules, messages) {
        form[0].reset(); //reset form values.

        var validator = form.validate({
            rules: rules,
            messages: messages,
            ignore: [],
            errorClass: 'text-danger', //No I18N
            errorElement: 'span', //No i18N
            errorPlacement: function(error, element) {
                error.insertAfter(element);
                error.addClass("alert alert-danger p5 fl m0");
                error.css({ 'width': 'auto', 'overflow': 'visible', 'top': (element.next().height() + element.height() + 10) + 'px' }); //No i18N
            }
        });
        validator.resetForm();//reset validation.
    },
    saveProxySetting: function() {
        var self = this;
        var dialog = self.getDialog();
        var isValid = dialog.find("#proxy_config_form").valid();
        if(isValid) {
            var data = {
                proxy_setting: {
                    host: dialog.find("[name=proxy_host_addrs]").val(),
                    port: dialog.find("[name=proxy_port_no]").val(),
                    username: dialog.find("[name=proxy_user_name]").val(),
                    password: dialog.find("[name=proxy_pwd]").val()
                }
            };

            var id = this.proxySettingId;
            var type = "POST" //No i18N
            if(id) {
                type = "PUT"; //No i18N
                data.id = id;
            }

            sdpAjax({
                url: "/api/v3/proxy_settings", //No i18N
                type: type,
                data: sdpAjaxInputData(data),
                success: function() {
                    showalert("success", translate("sdp.admin.proxy.save.success"),"isAutoHide=true,delay=2"); //No i18N
                        if(self.customer_type === 1) {
                            self.dialogId = "dc_dialog"; //NO I18N
                            installDC.showDCSwitchStepsByCustomerType({ customer_type: 1 });
                            return;
                        }
                    setTimeout(function() {
                        self.setDialog(translate("sdp.dc.install.suc.title"), renderhbs(null, 'scan-dc-config-setup-template', { is_remote_server: self.isRemoteServer, dcIntegrationLink : "/app#/admin/uemproducts", UEM_CENTRAL_DC : encodeHTML(getUEMProdName(false, false).uem_central) }, false, 'scan', null, null, null, true));//NO I18N
                    }, 2000);
                },
                failedCallBack: function() {
                    self.closeDialog();
                    showalert("failure", translate("sdp.vulnerability.error.unknownexception.msg"),'isAutoHide=true');  //No i18N
                },
                ignorefailuremessage: true
            });
        }
    },
    //show Switch DC Message by the customer type.
    //type 1: existing customer without DC integrated
    //type 2: existing customer with DC integrated
    showDCSwitchInfo: function() {
        var self = installDC;
        self.getDCSetupStatus(function (statusCode, response) {
            var count;
            self.openDialog();

            if (self.hasError(response) || statusCode !== 0 && response.customer_type !== 2) {
                return self.showDCSwitchSteps();
            }

            if(response.customer_type === 2) {
                count = response.asset_count;
                var windowsMsg = '';
                var sshMsg = '';
                if(count.windows !== '0'){
                    windowsMsg = translate("sdp.dc.in.environment.c2.info1", ZSEC.Encoder.encodeForHTML[count.windows]);
                }
                if(count.ssh !== '0'){
                   sshMsg = translate("sdp.dc.in.environment.c2.info2", ZSEC.Encoder.encodeForHTML[count.ssh]);
                }
                response.cust2  = {
                    info1:  windowsMsg,
                    info2: sshMsg
                }
            }
            
            if(response.dc_status === 0 || response.customer_type === 2){
            var DCConfigured = false;
            var uemProdName = getUEMProdName(false, false);
            sdpAjax({
                    url: '/servlet/AJaxServlet?action=isDCConfigured',//NO I18N
                    type: "GET", //NO I18N
                    success: function(resp) {
                        if(resp.responseText == 'true')
                        {
                            DCConfigured=true;
                        }
                    }
                    });
            response.UEM_PRODUCT = encodeHTML(uemProdName.uem_prod);
            response.UEM_CENTRAL_DC = encodeHTML(uemProdName.uem_central);
            response.isDCConfigured = DCConfigured;
            self.setDialog(translate("sdp.dc.agent.switching.title"),renderhbs(null, 'scan-switch-dc-dialog', response, false, 'scan', null, null, null, true));//NO I18N
        	}
        });
    },
    //hide body/content of first step 1 and sets parent element of step 1 content body to step content title element.
    //so that any update on content of step 1 will be visible in title as per design/proto.
    moveContentToStepTitle: function () {
        this.dialogId = "switch_dc_step_0"; //NO I18N
        jQuery("#step_0").hide();
    },
    initDownload: function() {
        var self = this;
        this.getDCSetupStatus(function (status, response) {
            self.handleOtherDCProducts(response);
        });
    },
    showDCLicense: function() {
        var self = installDC;
        sdpAjax({
            url: "/DCActions.do?action=get_dc_agreement_link", //No i18N
            success: function(response){
                if(response.status === "success") {
                        window.open('/DCActions.do?action=show_dc_license_agreement','_blank');
                }
                else{
                   self.showProxyConfig();
                }
           }
        })
    },
    downloadAndInstall: function() {
        var self = installDC;
        sdpAjax({
            url: "/DCActions.do?action=download", //No i18N
            type:"POST", //NO I18N
            success: function(response) {
                var status = response ? response.init_status : "";
                
                self.customer_type === 1 && self.moveContentToStepTitle();

                if(status === "success") {
                    self.showDownloadingStatus();
                } else if(response.no_disk_space === "true") {
                    showalert("failure", translate("dc.no.disk.space"),"isAutoHide=false"); //No i18N
                } else if(response.proxy_required === "true") {
                    self.showProxyConfig();
                } else {
                    showalert("failure", translate("sdp.vulnerability.error.unknownexception.msg"),'isAutoHide=false');  //No i18N
                }
            }, 
            failedCallBack: function(response) {
                showalert("failure", translate("sdp.vulnerability.error.unknownexception.msg"),'isAutoHide=false'); //No i18N
            },
            ignorefailuremessage: true
        });
    },
    showDCSwitchSteps: function() {
        var self = installDC;
        self.getDCSetupStatus(function (status, response) {
            self.showDCSwitchStepsByCustomerType(response);
            self.showErrorSummary(response);
        });
    },
    showDCSwitchStepsByCustomerType: function(response) {
        var steps = [
            {
                title: translate("sdp.dc.switching.stepb"),
                html: agentSetting.getDownloadLinks()
            },
            {
                title: translate("sdp.dc.switching.stepc"),
                html: jQuery("#replace_dc_steps").html()
            },
            {
                title: translate("sdp.dc.switching.stepd"),
                html: jQuery("#instl_dc_othr_win_os").html()
            }
        ];

        if(response.customer_type === 1) {
            response.UEM_CENTRAL_DC = encodeHTML(getUEMProdName(false, false).uem_central);
            response.dcIntegrationLink = "/app#/admin/uemproducts"; //NO I18N
            steps = [{
                title: translate("sdp.dc.install.suc.title"),
                html: renderhbs(null, 'scan-dc-config-setup-template', response, false, 'scan', null, null, null, true),//NO I18N
                id: "dc_switch_config"//NO I18N
            }].concat(steps);
        } else {
            this.showDialogCloseButton(); //enable close buton as dc is already installed.
        }

        jQuery("#dc_dialog").css("minWidth", "750px");//NO I18N
        this.setDialog(translate("sdp.dc.agent.switch.stepsfor"), renderhbs(null, 'scan-switch-dc-steps', steps, false, 'scan', null, null, null, true));//NO I18N
        this.dialogId = "dc_switch_config";//NO I18N

        agentSetting.setDownloadLinks(true); //set agents downloading links for different os.
        this.configureDCSetup("status"); //show DC downloading status  //NO I18N
        jQuery("#step_0").addClass("in"); //expand first step.

        response.customer_type === 1 && this.disableStepsExpand();

        sdpAjax({
            url: "/DCActions.do?action=get_agent_download_links", //No i18N
            success: function (response) {
                jQuery("#win_agent_link").href = response.windows_agent;
            }
        });
    },
    disableStepsExpand: function () {
        var self = installDC;
        if (self.statusCode !== 4) {
            jQuery('#dc_dialog z-collapsiblepanel div.zcollapsiblepanel__header').addClass('ptr-ev-none'); //NO I18N
        }
    },
    getDCDownloadLink: function(callback) {
        sdpAjax({
            url: "/DCActions.do?action=get_dc_download_link",//NO I18N
            success: function (response) {
                callback(response.dc_download_link);
            }
        })
    },
    hasError: function (response) {
        var errorSummary = response.error_summary;

        if (response.dc_status === -2) {
            return true;
        }
        for (var error in errorSummary) {
            errorInfo = errorSummary[error];
            if(errorInfo.status === "true") {
                return true;
            }
        }
        return false;
    },
    showErrorSummary: function(response, dialogFor) {
        var self = this;
        var error = [];
        var errorSummary = response.error_summary;
        var isTimeout = errorSummary.timeout_error.status === "true";
        var isWindows = response.server_os === "windows";//NO I18N

        if (isTimeout || (!isWindows && response.dc_status !== 4) || response.proceed_manual === "true" && response.customer_type === 0  && dialogFor === "fromHeader") {
            this.dialogId = response.customer_type === 1 ? this.dialogId : "dc_dialog";//NO I18N

            self.getDCDownloadLink(function(link) {
                var data = {isTimeout: isTimeout, isWindows: isWindows, downloadLink: link, dcIntegrationLink : "/app#/admin/uemproducts"}; //No I18N
                self.setDialog(translate("sdp.dc.install.suc.title"), renderhbs(null, 'scan-dc-time-out-steps', data, false, 'scan', null, null, null, true));//NO I18N
            });

            return true;
        }

        if(errorSummary.integration_error.status === "true") {
            error.push({
                info: translate("sdp.dc.content.deploydc.error.integrationfailed"),
                html: '<div style="text-align: center"><a href="/app#/admin/uemproducts">' + translate("sdp.dc.init.integration.msg") + '</a></div>' //TODO: add url.
            });
        }

        if(errorSummary.port_not_available_error.status === "true") {
            error.push({
                info: translate("sdp.dc.ports.unavailable", ZSEC.Encoder.encodeForHTML([errorSummary.port_not_available_error.ports_not_available])),
                message: errorSummary.port_not_available_error.error_message
            });
        }

        if(errorSummary.not_enough_disk_space.status === "true") {
            error.push({
                info: translate("sdp.dc.no.diskspace"),
                message: errorSummary.not_enough_disk_space.error_message
            });
        }

        if(error.length) {
            this.setDialog(translate("sdp.dc.install.suc.title"), renderhbs(null, 'scan-dc-error-summary', error, false, 'scan', null, null, null, true));//NO I18N
            return true;
        }

        return false;
    },
    showDownloadingStatus: function(statusCode) {
        var self = installDC;

        self.showLoadingBar();

            if(statusCode) {
                self.showDownloadingByStatusCode(statusCode, {customer_type: self.customer_type});
            }

            //check downloading status every 3 sec.
            self.timer = setInterval(function () {
                //stop getting status once the dialog closed.
                self.getDCSetupStatus(function(statusCode, response) {
                    self.showErrorSummary(response);
                    self.showDownloadingByStatusCode(statusCode, response);
                });
            }, 3000);
        },
        clearTimer: function () {
            clearInterval(this.timer);
        },
        showDownloadingByStatusCode: function (statusCode, response) {
            var self = installDC;
            if(statusCode === 1){ //Dowloading 
                return;
            }
            if(statusCode === -1) {
                showalert("failure", translate("dc.unsupported.version"),'isAutoHide=true');  //No i18N
            }
            else if(statusCode === 4) { //installed
                self.clearTimer();
                self.onDCInstalledCB();
                installDC.setDialogContent(response && response.customer_type === 1 ? "dc_install_succ_custmr_1" : "dc_install_succ");//NO I18N
                jQuery(".ui-dialog-titlebar-close").show();//show close button.
            } else if(statusCode > 1 && statusCode < 4) {
                //dc is being installed in the background.
                self.setLoadingBarStatusText(translate("sdp.dc.installing",ZSEC.Encoder.encodeForHTML([getUEMProdName(false, false).uem_central])));
            }
            else if(statusCode !== 0) {
                showalert("failure", translate("sdp.vulnerability.error.unknownexception.msg"),'isAutoHide=true');  //No i18N
            }
        },
        getLoadingBarId: function() {
            return "dc_comp_downloading_bar"; //No i18N
        },
        showLoadingBar: function() {
            this.setDialogContent(this.getLoadingBarId());
        },
        setLoadingBarStatusText: function(text) {
            this.getDialog().find("[data-status]").text(text);
        },
    };
