var agentSetting  = {
    enableAgentSettings: function() {
        var self = agentSetting;
        //self.setDownloadLinks();
        self.loadGeneralSetting();


    },
    validateFrom: function () {
        jQuery.validator.addMethod("isIPAddres", function (value, element) { //NO I18N
            if (value === "127.0.0.1") {
                return false;
            }
            var ip = value.split(".");
            return ip.length === 4 && ip.every(function (token) {
                return isInteger(token) && token >= 0 && token <= 255;
            });
        });

        jQuery.validator.addMethod("isValidNATAddress", function (value) { //NO I18N
            return /^[^`~!@#$%^&*()=+_[\]{}\\|;:.'",<>\/?\s][^`~!@#$%^&*()=+_[\]{}\\|;:'",<>\/?\s]*[^`~!@#$%^&*()=+_[\]{}\\|;:'",<>\/?\s]$/.match(value); //no i18n
        });

        jQuery("#agent_settings_form").validate({
            rules: {
                agent_ip_add: {
                    isIPAddres: true,
                    required: true
                },
                agent_nat_add: {
                    required: true,
                    isValidNATAddress: true
                }
            },
            messages: {
                agent_nat_add: {
                    required: translate("sslimport.fieldmandatory"),
                    isValidNATAddress: translate("ae.cmdb.inventory.addNewWorkstationCI.valideIP.message"),
                },
                agent_ip_add: {
                    isIPAddres: translate("ae.cmdb.inventory.addNewWorkstationCI.valideIP.message"),
                    required: translate("sslimport.fieldmandatory")
                }
            },
            ignore: [],
            errorClass: 'text-danger', //No I18N
            errorElement: 'span', //No i18N
            errorPlacement: function (error, element) {
                if (element.parents(".input-group").length > 0) {
                    element = element.parents(".input-group"); //No I18N
                } else if ((element.attr("type") === "checkbox" || element.attr("type") === "radio") && element.parent("label").length > 0) { //NO I18N
                    element = element.parent("label"); //NO I18N
                }
                error.insertAfter(element);
                error.addClass("alert alert-danger p5 fl m0");
                error.css({ 'width': 'auto', 'overflow': 'visible', 'top': (element.next().height() + element.height() + 10) + 'px' }); //No i18N
            }
        })
    },
    select2: function(url, field, container, placeholder, default_option) {
        var options = {
            allowClear: true,
            width: "70%", // No I18N
            url: [{
                url:"/api/v3/" + url,//NO I18N
                field: field
            }]
        };

        if(placeholder) {
            options.placeholder = placeholder;
        }

        options.default_option = {
            id: -1,
            text: default_option || placeholder
        };

        jQuery(container).sdp_select2(options);
    },
    getDownloadLinks: function() {
        return '<a id="download_windows_agent" name="win-agent-download" download="" target="_blank" rel="noopener noreferrer">\
                <button class="btn btn-default whitebg mr10" type="button" aria-label="agent-windows"><span class="aspr win-lg icon-lg vmiddle mr5"></span><span class="vmiddle">' + getMessageForKey("sdp.admin.windowsagent.download") + '</span></button>\
            </a>\
            <a id="download_linux_agent" download="" name="linux-agent-download" target="_blank" rel="noopener noreferrer">\
                <button class="btn btn-default whitebg mr10" type="button" aria-label="agent-linux"><span class="aspr lin-lg icon-lg vmiddle mr5"></span><span class="vmiddle">' + getMessageForKey("sdp.admin.agentsettings.downloadlinuxagent") + '</span></button>\
            </a>\
            <a id="download_mac_agent" download="" name="mac-agent-download" target="_blank" rel="noopener noreferrer">\
                <button class="btn btn-default whitebg mr10" type="button" aria-label="agent-mac"><span class="aspr mac-lg icon-lg vmiddle mr5"></span><span class="vmiddle">' + getMessageForKey("sdp.admin.agentsettings.downloadmacagent") + '</span></button>\
            </a>';
    },
    setDownloadLinks: function(isforDialog) {
        sdpAjax({
            url: "/DCActions.do?action=get_agent_download_links", //No i18N
            success: function(response) {
                if (response.status !== "failure") {
                    if(isforDialog){
                        /* In agent settings there are two agent download tags, one in header and one in agent settings.
                         * This is for when header dialog is opened
                         */
                        document.getElementById('dc_dialog').getElementsByTagName('a').download_windows_agent.href =  response.windows_agent;
                        document.getElementById('dc_dialog').getElementsByTagName('a').download_linux_agent.href =  response.linux_agent;
                        document.getElementById('dc_dialog').getElementsByTagName('a').download_mac_agent.href =  response.mac_agent;
                    }
                    else{
                        document.getElementById("download_windows_agent").href = response.windows_agent //+ parameter;
                    document.getElementById("download_linux_agent").href = response.linux_agent //+ parameter;
                    document.getElementById("download_mac_agent").href = response.mac_agent //+ parameter;
                    }
                }
            }
        });
    },
    downloadAgentFile: function (link) {
        if (link.indexOf("/DCActions.do") === -1) {
            window.open(link, "_blank");
            return true;
        }

        sdpAjax({
            url: link,
            success: function (response) {
                if (response.status === "failure") {
                    showalert("failure", encodeHTML(response.remark), "isAutoHide=true"); // No I18N
                } else {
                    window.open(link, "_blank");
                }
            }
        });
    },
    loadGeneralSetting: function() {
        var self  = this;
        sdpAjax({
            url: "/DCActions.do?action=get_agent_settings", //No i18N
            success: function(response) {
                if (response.call_status === "failure") {
                    showalert('failure', translate(response.remark, [encodeHTML(response.uem_integ_prod), response.uem_central, encodeHTML(response.uem_integ_prod)]), "isAutoHide=true"); //No I18N
                    self.freezeAgentSection();
                    return;
                }
                if(response !== null) {
                    self.setGeneralSetting(response);
                    jQuery("#freezeAgentConfig").hide();
                    jQuery(".loading1").hide();
                    // self.setLinuxSettings(response.macAgentSettings);
                    // self.setMacSettings(response.macAgentSettings);
                }else{
                    jQuery("#freezeAgentConfig").show();
                    jQuery(".loading1").hide(); 
                }
            }
        });
    },
    setGeneralSetting: function(response) {
        jQuery("#agent-ipaddress").val(response.serverIPAddress); //No i18N
        jQuery("#nat-address").val(response.natAddress); //No i18N
        jQuery("#detect-ipaddress").prop("checked", response.autoSaveIPChange); //No i18N
        jQuery("#uninstall-agent").prop("checked", response.hideAgentUninstall); //No i18N
        jQuery("#stopping-agent").prop("checked", response.hideAgentServiceStop); //No i18N
        jQuery("#remotecontrol-prompt").prop("checked", response.remotecontrolprompt); //No i18N
        jQuery('#notify-user').prop("checked",response.notifyUser);//No i18n
        jQuery("#enable-idle-settings").prop("checked", response.isIdleSessionTimeout); //No i18N
        jQuery("#certificate-auth").prop("checked", response.isClientCertAuthEnabled); //No i18N
        jQuery("#strict-https").prop("checked", response.isStrictHttpsCommEnabled); //No i18N
        jQuery('#idle-timeout').val(response.idleTimeout); //No i18N

        if(response.remotecontrolprompt == true){
           jQuery('#prompt-when-logged-off').prop("disabled", false); //No i18N
            jQuery("#prompt-when-logged-off").prop("checked", response.isAlwaysPrompt); //No i18N
        }
        else{
           jQuery('#prompt-when-logged-off').prop("disabled", true);   //no i18n   
        }

        if(response.notifyUser == true){
            jQuery("#end-user-disconnect").prop("disabled",false);//No i18N
        }
        else{
            jQuery("#end-user-disconnect").prop("disabled",true); //no i18n
        }
            jQuery("#end-user-disconnect").prop("checked", response.endUserDisconnect); //No i18N

        if(response.isIdleSessionTimeout == true){
            jQuery('#idle-timeout').prop("disabled",false); //no i18n
            jQuery('#disconnect').prop("disabled",false); //no i18n
            jQuery('#disconnectandlock').prop("disabled",false);  //no i18n
        }
        else{
            jQuery('#idle-timeout').prop("disabled",true); //no i18n
            jQuery('#disconnect').prop("disabled",true); //no i18n
            jQuery('#disconnectandlock').prop("disabled",true); //no i18n
        }
           if(response.timeoutAction == 0){
                jQuery('#disconnect').prop("checked",true); //no i18n
                jQuery('#disconnectandlock').prop("checked",false); //no i18n
            }
            else{
                jQuery('#disconnectandlock').prop("checked",true); //no i18n
                jQuery('#disconnect').prop("checked",false); //no i18n
            }
            if( response.isStrictHttpsCommEnabled == true){
                jQuery('#strict-https').prop("disabled",true);  //no i18n
            }
    },
    showHidePrompWhenLoggedOff: function(){
        if(document.getElementById("remotecontrol-prompt").checked == true){
            jQuery('#prompt-when-logged-off').prop("disabled", false); //no i18n
        }
        else{
            jQuery('#prompt-when-logged-off').prop("disabled", true); //no i18n
        }
    },
    showHideIdleTimeSettings: function(){
        if(document.getElementById("enable-idle-settings").checked == true){
            jQuery('#idle-timeout').prop("disabled",false); //no i18n
            jQuery('#disconnect').prop("disabled",false); //no i18n
            jQuery('#disconnectandlock').prop("disabled",false); //no i18n
            jQuery('#idle-timeout').val(5); 
        }
        else{
           jQuery('#idle-timeout').prop("disabled",true); //no i18n
            jQuery('#disconnect').prop("disabled",true); //no i18n
            jQuery('#disconnectandlock').prop("disabled",true); //no i18n
        }
    },
    showHideEndUserDisconnect: function(){
        if(document.getElementById("notify-user").checked == true){
            jQuery("#end-user-disconnect").prop("disabled",false); //no i18n
        }
        else{
            jQuery("#end-user-disconnect").prop("disabled",true); //no i18n
            
        }
    },
    disableStrictHttpsSetting: function(){
        if(document.getElementById("strict-https").checked == true){
                jQuery('#disconnectandlock').prop("disabled",true);  //no i18n
        }
    },
    setMacSettings: function(macAgentSettings) {
        var placeHolder = translate("sdp.inventory.addWSAction.selectDomainMsg");
        var default_option = placeHolder;

        if(macAgentSettings) {
            this.getDomainId(macAgentSettings.macDomainName);
            default_option =  macAgentSettings.macDomainName;
        }

        this.select2("domains", "domains", jQuery("#macDomainName"), placeHolder, default_option); //No i18N
    },
    setLinuxSettings: function(linuxAgentSettings) {
        var placeHolder = translate("sdp.inventory.addWSAction.selectDomainMsg");
        var default_option = linuxAgentSettings ? linuxAgentSettings.linuxDomainName : placeHolder;

        if(linuxAgentSettings) {
            this.getDomainId(linuxAgentSettings.linuxDomainName);
        }
        
        this.select2("domains", "domains", jQuery("#linuxDomainName"), placeHolder, default_option); //No i18N
    },
    getDomainId: function(domains, DomainName) {
        var index = domains.findIndex(function(domain) {
            return domain.name === DomainName;
        });

        return index === -1 ? -1 : domains[index].id;
    },
    getAgentSettingsData() {
        var ipAddress = jQuery("#agent-ipaddress").val(),
            natAddress = jQuery("#nat-address").val(),
            autoSaveIPChange = jQuery("#detect-ipaddress").prop("checked"), //No i18N
            hideAgentUninstall = jQuery("#uninstall-agent").prop("checked"), //No i18N
            hideAgentServiceStop = jQuery("#stopping-agent").prop("checked"),//No i18N
            remotecontrolprompt = jQuery("#remotecontrol-prompt").prop("checked"),//No i18N
            isAlwaysPrompt = jQuery("#prompt-when-logged-off").prop("checked"),//No i18N
            notifyUser = jQuery('#notify-user').prop("checked"),//No i18N
            endUserDisconnect = jQuery('#end-user-disconnect').prop("checked"),//No i18n
            isIdleSessionTimeout = jQuery('#enable-idle-settings').prop("checked"),//no i18n
            idleTimeout = jQuery('#idle-timeout').val(),//no i18n
            isTimeoutActionZero = jQuery('#disconnect').prop("checked"),//no i18n
            isClientCertAuthEnabled = jQuery('#certificate-auth').prop("checked"),//no i18n
            isStrictHttpsCommEnabled = jQuery('#strict-https').prop("checked"),//no i18n
            data ="&serverIPAddress="+encodeURIComponent(ipAddress)+"&autoSaveIPChange="+encodeURIComponent(autoSaveIPChange)+"&hideAgentUninstall="+encodeURIComponent(hideAgentUninstall)+"&hideAgentServiceStop="+encodeURIComponent(hideAgentServiceStop)+"&natAddress="+encodeURIComponent(natAddress)+"&remotecontrolprompt="+encodeURIComponent(remotecontrolprompt)+"&isAlwaysPrompt="+encodeURIComponent(isAlwaysPrompt)+"&notifyUser="+encodeURIComponent(notifyUser)+"&endUserDisconnect="+encodeURIComponent(endUserDisconnect)+"&isIdleSessionTimeout="+encodeURIComponent(isIdleSessionTimeout)+"&idleTimeout="+encodeURIComponent(idleTimeout)+"&isClientCertAuthEnabled="+encodeURIComponent(isClientCertAuthEnabled)+"&isStrictHttpsCommEnabled="+encodeURIComponent(isStrictHttpsCommEnabled);//no i18n
            if(isIdleSessionTimeout == true){
                            if(isTimeoutActionZero == true)
                            {
                                data = data+"&timeoutAction="+0;//no i18n
                            }
                            else
                            {
                               data = data+"&timeoutAction="+1;//no i18n
                            }
                        }
            return data;
    },
    freezeAgentSection: function() {
        jQuery("#freezeAgentConfig").show();
        jQuery("#freezeAgentConfig .loading1").hide();
    },
    saveSettings: function() {
        var self = this;
        var data  = this.getAgentSettingsData();
        var saveBtn;

        self.validateFrom();

        if (!jQuery("#agent_settings_form").valid()) {
            return;
        }

        saveBtn = jQuery("#agnet-save-settings").button('loading');

        sdpAjax({
            url: '/DCActions.do?action=update_agent_settings'+data, //No i18N
            contentType: "plain/text", //No i18N
            type: "POST", //No i18N
            success: function(response) {
                if (response.status === "failure") {
                    if(response.remark != undefined){
                        showalert('failure', translate(response.remark, [encodeHTML(response.uem_integ_prod), response.uem_central, encodeHTML(response.uem_integ_prod)]), "isAutoHide=true"); //No I18N
                    }
                    else{
                        showalert('failure', translate("sdp.api.unknown.error"), "isAutoHide=true"); //No I18N
                    }
                    self.freezeAgentSection();
                    return;
                }
                var msg = translate("sdp.admin.agentsettings.succeed");
                showalert("success", msg, "isAutoHide=true"); // No I18N
            },
            complete: function() {
                saveBtn.button('reset');
            },
            ignorefailuremessage: true
        });
    }
};
