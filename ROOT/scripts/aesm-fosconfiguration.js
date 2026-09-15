/* $Id$ */
var isFOSChecked=false;
var isDRChecked=false;
var isFOS=false;
jQuery(function() {
    if (jQuery("#fosconfiguration").length)
    {
        getConfig();
        getHistoryConfig();
    }
    else if(jQuery("#fosreplication").length)
    {
        getConfigRepl();
        getHistoryRepl();
    }
    if (isMDHSetup==="true")
    {
        jQuery("#admin-sidebar").hide();
        jQuery("#wizardheadertab").hide();
    }
    else if(isMDHSetup==="false")
    {
        jQuery("#admin-sidebar").show();
        jQuery("#wizardheadertab").show();
    }
});

function getConfig()
{
    sdpAjax({
        url: "/servlet/AJaxServlet?action=getHAConfig", //No I18N
        method: "GET", //No I18N
        skipSUBREQUEST:true,
        success: function(dataArg)
        {
            var data = dataArg;
            renderhbs("#fosconf","ha-configuration",data,false,'admin',null,null,function () {//No I18N
                const elements = ['#primaryserverfos','#nicprimaryserver','#primarysubnet','#secondaryserverfos','#nicsecondaryserver','#secondarysubnet','#virtualip','#commonaliasnamefos','#fosemail','#primaryserverdr','#secondaryserverdr','#commonaliasnamedr','#dremail'];//No I18N

                elements.forEach(selector => {
                    jQuery(selector).off("focus").on("focus", function(event) {//No I18N
                        iphelpcard.showtooltip(this);
                    });
                    jQuery(selector).off("focusout").on("focusout", function(event) {//No I18N
                        iphelpcard.hidetooltip(this);
                    });
                });
            });
            if (data.primary_server_IP && data.primary_server_IP.length > 0)
            {
                jQuery('#fosconfig').hide();
                jQuery('#fosconfig1').removeClass('hide');
                fos.toggleMode("drha");// No I18N
                jQuery('#cancelfos').removeClass('hide');
                if(data.mode_of_operation==="FOS")
                {
                    jQuery("#fosha").prop('checked',true);// No I18N
                    jQuery("#drha").prop('checked',false);// No I18N
                    if(data.is_HA_enabled=="Enabled")
                    {
                        jQuery("#fosmode").prop('checked',true);// No I18N
                        jQuery("#drmode").prop('checked',false);// No I18N
                        isFOSChecked=true;
                    }
                    else if(data.is_HA_enabled=="Disabled")
                    {
                        jQuery("#fosmode").prop('checked',false);// No I18N
                        jQuery("#drmode").prop('checked',false);// No I18N
                        isFOSChecked=false;
                    }
                    isFOS=true;
                    fos.toggleMode("fosha");// No I18N
                }
                else if(data.mode_of_operation==="DR")
                {
                    jQuery("#fosha").prop('checked',false);// No I18N
                    jQuery("#drha").prop('checked',true);// No I18N
                    if(data.is_HA_enabled=="Enabled")
                    {
                        jQuery("#drmode").prop('checked',true);// No I18N
                        jQuery("#fosmode").prop('checked',false);// No I18N
                        isDRChecked=true;
                    }
                    else if(data.is_HA_enabled=="Disabled")
                    {
                        jQuery("#drmode").prop('checked',false);// No I18N
                        jQuery("#fosmode").prop('checked',false);// No I18N
                        isDRChecked=false;
                    }
                    isFOS=false;
                    fos.toggleMode("drha");//No I18N
                }
                jQuery('#fosmode').prop('disabled', true); //No I18N
                jQuery("#drmode").prop('disabled',true);// No I18N
                jQuery('#fosha').prop('disabled',true);// No I18N
                jQuery('#drha').prop('disabled',true);// No I18N
                jQuery("#fosdescription,#drdescription,hr#fosdrhr").removeAttr("style");//No I18N
            }
            else
            {
                jQuery('#editfos').addClass('vhide');
                jQuery('#editdr').addClass('vhide');
                jQuery('#cancelfos').addClass('hide');
                fixedformfooter(document.querySelector('[name=fosconfig]'),document.querySelector('[name=fosconfig] #form-footer'));// NO I18N
                jQuery("#primaryserverfos").focus();
                jQuery("#fosha").prop('checked',true);// No I18N
            }
        }
    }); //NO I18N
}

function getConfigRepl()
{
    sdpAjax({
        url: "/servlet/AJaxServlet?action=getHAConfigrepl", //No I18N
        method: "GET", //No I18N
        skipSUBREQUEST:true,
        success: function(dataArg)
        {
            var data = dataArg;
            renderhbs("#fosrepl","ha-replication",data,false,'admin',null,null,function () {//No I18N
                const elements = ['#primarypassword','#secondarypassword'];//No I18N

                elements.forEach(selector => {
                    jQuery(selector).off("focus").on("focus", function (event) {//No I18N
                        iphelpcard.showtooltip(this);
                    });
                    jQuery(selector).off("focusout").on("focusout", function (event) {//No I18N
                        iphelpcard.hidetooltip(this);
                    });
                });
            });
            if (data.username_primary_server && data.username_primary_server.length > 0)
            {
                jQuery('#fosconfigrepo').hide();
                jQuery('#fosconfigrepo1').removeClass('hide');
                jQuery('#cancelfosrepl').removeClass('hide');
            }
            else
            {
                jQuery('#editfosrepo').addClass('hide');
                jQuery('#cancelfosrepl').addClass('hide');
                fixedformfooter(document.querySelector('[name=fosconfigrepo] [data-id=form-fosconfrepo]'),document.querySelector('[name=fosconfigrepo] .form-footer'));// NO I18N
                jQuery("#primaryipaddress").focus();
            }
        }
    }); //NO I18N
}

function getHistoryConfig()
{
    sdpAjax({
        url: "/servlet/AJaxServlet?action=getHAHistory", //No I18N
        data: {
            operationmode: "fosConfiguration" //No I18N
        },
        method: "GET", //No I18N
        skipSUBREQUEST:true,
        async: false,
        success: function(dataArg)
        {
            zcomponent.collapsible_destroy('#fosconfHis'); //NO I18N
            var datavalue = dataArg;
            jQuery('#History .panel').not(':first').remove(); //NO I18N
            var current_date = new Date();
            for (var iter = 0; iter < datavalue.history.length; iter++)
            {
                var history = datavalue.history[iter];
                if (history.operation_name === "edit")
                {
                    jQuery("#icon_action_config").attr("class", 'sdp-glyph sdp-glyph-edit2');
                    jQuery("#actionvalue").text(getMessageForKey("sdp.requests.history.updated"));
                }
                else if (history.operation_name === "add")
                {
                    jQuery("#icon_action_config").attr("class", 'list-sprite icon-sm notes-icon2');
                    jQuery("#actionvalue").text(getMessageForKey("sdp.history.added"));
                }
                var d = new Date(history.client_time.date);
                if (iter > 0 && (d.getDate() === current_date.getDate()) && (d.getMonth() === current_date.getMonth()) && (d.getFullYear() === current_date.getFullYear()))
                {
                    var $el = jQuery('#History .hist-row:first').clone();
                    var addedstring = "";
                    $el.find('.history-time').html(history.client_time.time);
                    $el.find('#operation_detail').html(); //NO I18N
                    for (index = 0; index < history.diff.length; index++)
                    {
                        if (history.operation_name === "edit")
                        {
                            if (history.diff[index].previous_value)
                            {
                                addedstring +="<p>"+e_html(history.diff[index].field) + "&emsp;" + getMessageForKey("sdp.common.from") + " : <span class=\"sb\">" + e_html(history.diff[index].previous_value) + "</span>&emsp;" + getMessageForKey("sdp.common.to") + " : <span class=\"sb\">" + e_html(history.diff[index].current_value) + "</span></p>";//No I18N
                            }
                            else
                            {
                                addedstring +="<p>"+e_html(history.diff[index].field) + " : <span class=\"sb\">" + e_html(history.diff[index].current_value) + "</span></p>";
                            }
                        }
                        else if (history.operation_name === "add")
                        {
                            var addedvalue = JSON.parse(history.diff[index].current_value);
                            addedstring ="<p>"+getMessageForKey("sdp.fos.configuration.primaryserver") + " : <span class=\"sb\">" + e_html(addedvalue.primary_server_IP) + "</span></p><p> " + getMessageForKey("sdp.fos.configuration.secondaryserver") + " : <span class=\"sb\">" + e_html(addedvalue.secondary_server_IP)  + "</span></p>"; //No I18N
                            if(addedvalue.nic_primary_server!="" && addedvalue.nic_primary_server !=null)
                            {
                                addedstring +="<p>"+ getMessageForKey("sdp.fos.configuration.nicprimary") + " : <span class=\"sb\">" + e_html(addedvalue.nic_primary_server) + "</span></p> "; //No I18N
                            }
                            if(addedvalue.nic_secondary_server!="" && addedvalue.nic_secondary_server !=null)
                            {
                                addedstring +="<p>"+ getMessageForKey("sdp.fos.configuration.nicsecondary") + " : <span class=\"sb\">" + e_html(addedvalue.nic_secondary_server) + "</span></p> "; //No I18N
                            }
                            if(addedvalue.virtual_IP!="" && addedvalue.virtual_IP !=null)
                            {
                                addedstring +="<p>"+ getMessageForKey("sdp.fos.configuration.virtualip") + " : <span class=\"sb\">" + e_html(addedvalue.virtual_IP) + "</span></p> "; //No I18N
                            }
                            if(addedvalue.is_HA_enabled!="" && addedvalue.is_HA_enabled!=null)
                            {
                                if(addedvalue.mode_of_operation!="" && addedvalue.mode_of_operation!=null && addedvalue.mode_of_operation==="DR")
                                {
                                    addedstring +="<p>"+ getMessageForKey("dr.configuration.mode") + " : <span class=\"sb\">" + e_html(addedvalue.is_HA_enabled) + "</span></p> "; //No I18N
                                }
                                else
                                {
                                    addedstring +="<p>"+ getMessageForKey("sdp.fos.configuration.mode") + " : <span class=\"sb\">" + e_html(addedvalue.is_HA_enabled) + "</span></p> "; //No I18N
                                }
                            }
                            if(addedvalue.mode_of_operation!="" && addedvalue.mode_of_operation!=null)
                            {
                                addedstring +="<p>"+getMessageForKey("dr.configuration.mode.operation") + " : <span class=\"sb\">" + e_html(addedvalue.mode_of_operation) + "</span></p> "; //No I18N
                            }
                            if (addedvalue.subnet_primary_server != "" && addedvalue.subnet_primary_server != null)
                            {
                                addedstring +="<p>"+ getMessageForKey("sdp.fos.configuration.subnetprimary") + " : <span class=\"sb\">" + e_html(addedvalue.subnet_primary_server) + "</span></p> "; //No I18N
                            }
                            if (addedvalue.subnet_secondary_server != "" && addedvalue.subnet_secondary_server != null)
                            {
                                addedstring +="<p>"+ getMessageForKey("sdp.fos.configuration.subnetsecondary") + " : <span class=\"sb\">" + e_html(addedvalue.subnet_secondary_server) + "</span></p> "; //No I18N
                            }
                            if (addedvalue.common_alias_name != null && addedvalue.common_alias_name != "")
                            {
                                addedstring += "<p>"+getMessageForKey("sdp.fos.configuration.commonaliasname") + " : <span class=\"sb\">" + e_html(addedvalue.common_alias_name) + "</span></p>"; //No I18N
                            }
                            if (addedvalue.email_addresses != null && addedvalue.email_addresses != "")
                            {
                                addedstring +="<p>"+ getMessageForKey("sdp.admin.backup.settings.fos.mailto.text") + " : <span class=\"sb\">" + e_html(addedvalue.email_addresses) + "</span></p>"; //No I18N
                            }
                        }
                        $el.find('#actionby').html("<p>"+getMessageForKey("sdp.common.by") + " : <span class=\"sb\"> " + e_html(history.by.name) + "</span></p>"); //No I18N
                        $el.find('#operation_detail').html(addedstring);
                    }
                    jQuery('#History .panel-body:last').append($el);
                }
                else
                {
                    var addedstring = "";
                    current_date = d;
                    var $el = jQuery('#History .panel:first').clone().removeClass("hide");
                    $el.find('.panel-title').html(history.client_time.date + '<span class="cspr icon-sm circle-arrow-down fr"></span>');

                    $el.find('.history-time').html(history.client_time.time);
                    for (index = 0; index < history.diff.length; index++)
                    {
                        if (history.operation_name === "edit")
                        {
                            if (history.diff[index].previous_value)
                            {
                                addedstring +="<p>"+e_html(history.diff[index].field) + "&emsp;From : <span class=\"sb\">" + e_html(history.diff[index].previous_value) + "</span>&emsp;To : <span class=\"sb\">" + e_html(history.diff[index].current_value) + "</span></p> ";
                            }
                            else
                            {
                                addedstring +="<p>"+e_html(history.diff[index].field) + " : <span class=\"sb\">" + e_html(history.diff[index].current_value) + "</span></p> ";
                            }
                        }
                        else if (history.operation_name === "add")
                        {
                            var addedvalue = JSON.parse(history.diff[index].current_value);
                            addedstring ="<p>"+getMessageForKey("sdp.fos.configuration.primaryserver") + " : <span class=\"sb\">" + e_html(addedvalue.primary_server_IP) + "</span></p><p> " + getMessageForKey("sdp.fos.configuration.secondaryserver") + " : <span class=\"sb\">" + e_html(addedvalue.secondary_server_IP)  + "</span></p>"; //No I18N
                            if(addedvalue.nic_primary_server!="" && addedvalue.nic_primary_server !=null)
                            {
                                addedstring +="<p>"+ getMessageForKey("sdp.fos.configuration.nicprimary") + " : <span class=\"sb\">" + e_html(addedvalue.nic_primary_server) + "</span></p> "; //No I18N
                            }
                            if(addedvalue.nic_secondary_server!="" && addedvalue.nic_secondary_server !=null)
                            {
                                addedstring +="<p>"+ getMessageForKey("sdp.fos.configuration.nicsecondary") + " : <span class=\"sb\">" + e_html(addedvalue.nic_secondary_server) + "</span></p> "; //No I18N
                            }
                            if(addedvalue.virtual_IP!="" && addedvalue.virtual_IP !=null)
                            {
                                addedstring +="<p>"+ getMessageForKey("sdp.fos.configuration.virtualip") + " : <span class=\"sb\">" + e_html(addedvalue.virtual_IP) + "</span></p> "; //No I18N
                            }
                            if(addedvalue.is_HA_enabled!="" && addedvalue.is_HA_enabled!=null)
                            {
                                if(addedvalue.mode_of_operation!="" && addedvalue.mode_of_operation!=null && addedvalue.mode_of_operation==="DR")
                                {
                                    addedstring +="<p>"+ getMessageForKey("dr.configuration.mode") + " : <span class=\"sb\">" + e_html(addedvalue.is_HA_enabled) + "</span></p> "; //No I18N
                                }
                                else
                                {
                                    addedstring +="<p>"+ getMessageForKey("sdp.fos.configuration.mode") + " : <span class=\"sb\">" + e_html(addedvalue.is_HA_enabled) + "</span></p> "; //No I18N
                                }
                            }
                            if(addedvalue.mode_of_operation!="" && addedvalue.mode_of_operation!=null)
                            {
                                addedstring +="<p>"+getMessageForKey("dr.configuration.mode.operation") + " : <span class=\"sb\">" + e_html(addedvalue.mode_of_operation) + "</span></p> "; //No I18N
                            }
                            if (addedvalue.subnet_primary_server != "" && addedvalue.subnet_primary_server != null)
                            {
                                addedstring +="<p>"+getMessageForKey("sdp.fos.configuration.subnetprimary") + " : <span class=\"sb\">" + e_html(addedvalue.subnet_primary_server) + "</span></p> "; //No I18N
                            }
                            if (addedvalue.subnet_secondary_server != "" && addedvalue.subnet_secondary_server != null)
                            {
                                addedstring +="<p>"+getMessageForKey("sdp.fos.configuration.subnetsecondary") + " : <span class=\"sb\">" + e_html(addedvalue.subnet_secondary_server) + "</span></p> "; //No I18N
                            }
                            if (addedvalue.common_alias_name != null && addedvalue.common_alias_name != "")
                            {
                                addedstring +="<p>"+getMessageForKey("sdp.fos.configuration.commonaliasname") + " : <span class=\"sb\">" + e_html(addedvalue.common_alias_name) + "</span></p>"; //No I18N
                            }
                            if (addedvalue.email_addresses != null && addedvalue.email_addresses != "")
                            {
                                addedstring +="<p>"+getMessageForKey("sdp.admin.backup.settings.fos.mailto.text") + " : <span class=\"sb\">" + e_html(addedvalue.email_addresses) + "</span></p>"; //No I18N
                            }
                        }
                    }
                    $el.find('#actionby').html("<p>"+getMessageForKey("sdp.common.by") + " : <span class=\"sb\">" + e_html(history.by.name) + "</span></p>"); //No I18N
                    $el.find('#operation_detail').html(addedstring);
                    jQuery('#History .panel-group').append($el);
                }
            }
            zcomponent.collapsible_init('#fosconfHis');//NO I18N
        }
    }); //NO I18N
}

function getHistoryRepl()
{
    sdpAjax({
        url: "/servlet/AJaxServlet?action=getHAHistory", //No I18N
        data:
        {
            operationmode: "fosReplication"  //No I18N
        },
        method: "GET", //No I18N
        skipSUBREQUEST:true,
        async: false,
        success: function(dataArg)
        {
            zcomponent.collapsible_destroy('#fosrepHis'); //NO I18N
            var datavalue = dataArg;
            jQuery('#History .panel').not(':first').remove(); //NO I18N
            var current_date = new Date();
            for (var iter = 0; iter < datavalue.history.length; iter++)
            {
                var history = datavalue.history[iter];
                if (history.operation_name === "edit")
                {
                    jQuery("#icon_action_repl").attr("class", 'sdp-glyph sdp-glyph-edit2');
                    jQuery("#actionvalue_repl").text(getMessageForKey("sdp.requests.history.updated"));
                }
                else if (history.operation_name === "add")
                {
                    jQuery("#icon_action_repl").attr("class", 'list-sprite icon-sm notes-icon2');
                    jQuery("#actionvalue_repl").text(getMessageForKey("sdp.history.added"));
                }
                var d = new Date(history.client_time.date);
                if (iter > 0 && (d.getDate() === current_date.getDate()) && (d.getMonth() === current_date.getMonth()) && (d.getFullYear() === current_date.getFullYear()))
                {
                    var $el = jQuery('.hist-row:first').clone();
                    var addedstring = "";
                    $el.find('.history-time').html(e_html(history.client_time.time));
                    $el.find('#operation_detail_repl').html(); //NO I18N
                    for (index = 0; index < history.diff.length; index++) {
                        if (history.operation_name === "edit")
                        {
                            if (history.diff[index].field.includes("Password"))
                            {
                                addedstring +="<p>"+e_html(history.diff[index].field) +" : <span class=\"sb\">**********</span></p> ";
                            }
                            else
                            {
                                if (history.diff[index].previous_value)
                                {
                                    addedstring +="<p>"+e_html(history.diff[index].field) + "&emsp;From : <span class=\"sb\">" + e_html(history.diff[index].previous_value) + "</span>&emsp;To : <span class=\"sb\">" + e_html(history.diff[index].current_value) + "</span></p>";
                                }
                                else
                                {
                                    addedstring +="<p>"+e_html(history.diff[index].field) + " : <span class=\"sb\">" + e_html(history.diff[index].current_value) + "</span></p>";
                                }
                            }
                        }
                        else if (history.operation_name === "add")
                        {
                            var addedvalue = JSON.parse(history.diff[index].current_value);
                            addedstring +="<p>"+getMessageForKey("sdp.fos.configuration.primaryserver") + " : <span class=\"sb\">" + e_html(addedvalue.primary_server_IP) + "</span></p><p>" + getMessageForKey("sdp.fos.configuration.primary") + " " + getMessageForKey("common.username") + " : <span class=\"sb\">" + e_html(addedvalue.username_primary_server) + "</span></p><p> " + getMessageForKey("sdp.fos.configuration.primary") + " " + getMessageForKey("common.password") + " : <span class=\"sb\">*******</span></p><p> " + getMessageForKey("sdp.fos.configuration.secondaryserver") + " : <span class=\"sb\">" + e_html(addedvalue.secondary_server_IP) + "</span></p><p> " + getMessageForKey("sdp.fos.configuration.secondary") + " " + getMessageForKey("common.username") + " : <span class=\"sb\">" + e_html(addedvalue.username_secondary_server) + "</span></p><p>" + getMessageForKey("sdp.fos.configuration.secondary") + " " + getMessageForKey("common.password") + " : <span class=\"sb\">*******</span></p>"; //No I18N
                        }
                    }
                    $el.find('#actionby_repl').html("<p>"+getMessageForKey("sdp.common.by") + " : <span class=\"sb\"> " + e_html(history.by.name) + "</span></p>"); //No I18N
                    $el.find('#operation_detail_repl').html(addedstring);
                    jQuery('#History .panel-body:last').append($el);
                }
                else
                {
                    var addedstring = "";
                    current_date = d;
                    var $el = jQuery('#History .panel:first').clone().removeClass("hide");
                    $el.find('.panel-title').html(e_html(history.client_time.date) + '<span class="cspr icon-sm circle-arrow-down fr"></span>');
                    $el.find('.history-time').html(e_html(history.client_time.time));
                    for (index = 0; index < history.diff.length; index++)
                    {
                        if (history.operation_name === "edit")
                        {
                            if (history.diff[index].field.includes("Password"))
                            {
                                addedstring +="<p>"+e_html(history.diff[index].field) +" : <span class=\"sb\">**********</span></p> ";
                            }
                            else
                            {
                                if (history.diff[index].previous_value)
                                {
                                    addedstring +="<p>"+e_html(history.diff[index].field) + "&emsp;From : <span class=\"sb\">" + e_html(history.diff[index].previous_value) + "</span>&emsp;To : <span class=\"sb\">" + e_html(history.diff[index].current_value) + "</span></p>";
                                }
                                else
                                {
                                    addedstring +="<p>"+e_html(history.diff[index].field) + " : <span class=\"sb\">" + e_html(history.diff[index].current_value) + "</span></p> ";
                                }
                            }
                        }
                        else if (history.operation_name === "add")
                        {
                            var addedvalue = JSON.parse(history.diff[index].current_value);
                            addedstring +="<p>"+getMessageForKey("sdp.fos.configuration.primaryserver") + " : <span class=\"sb\">" + e_html(addedvalue.primary_server_IP) + "</span></p><p>" + getMessageForKey("sdp.fos.configuration.primary") + " " + getMessageForKey("common.username") + " : <span class=\"sb\">" + e_html(addedvalue.username_primary_server) + "</span></p><p> " + getMessageForKey("sdp.fos.configuration.primary") + " " + getMessageForKey("common.password") + " : <span class=\"sb\">*******</span></p><p> " + getMessageForKey("sdp.fos.configuration.secondaryserver") + " : <span class=\"sb\">" + e_html(addedvalue.secondary_server_IP) + "</span></p><p> " + getMessageForKey("sdp.fos.configuration.secondary") + " " + getMessageForKey("common.username") + " : <span class=\"sb\">" + e_html(addedvalue.username_secondary_server) + "</span></p><p>" + getMessageForKey("sdp.fos.configuration.secondary") + " " + getMessageForKey("common.password") + " : <span class=\"sb\">*******</span></p>"; //No I18N
                        }
                    }
                    $el.find('#actionby_repl').html("<p>"+getMessageForKey("sdp.common.by") + " : <span class=\"sb\"> " + e_html(history.by.name) + "</span></p>"); // No I18N
                    $el.find('#operation_detail_repl').html(addedstring);
                    jQuery('#History .panel-group').append($el);
                }
            }
            zcomponent.collapsible_init('#fosrepHis');//NO I18N
        }
    }); //NO I18N
}

function isValidIPAddress(ipAddress)
{
    var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipAddress.match(ipformat))
    {
        var index = ipAddress.indexOf(".");
        var ip = ipAddress.substring(0, index);
        if (ip >= 1 && ip <= 126)
        {
            return true;
        }
        else if (ip >= 128 && ip <= 191)
        {
            return true;
        }
        else if (ip >= 192 && ip < 223)
        {
            return true;
        }
        else if (ip >= 224 && ip <= 239)
        {
            return false;
        }
        else
        {
            return false;
        }
    }
    else
    {
        return false;
    }
}

function isSubnetValid(subnet)
{
    var octate_value = 0,
        counter = 0;
    var validOctate = [0, 128, 192, 224, 240, 248, 252, 254, 255];
    if (subnet != null && subnet != "")
    {
        var subnet_octate = subnet.split(".");
        if(subnet_octate.length<4)
        {
            return false;
        }
        for (var iter = 0; iter < subnet_octate.length; iter++)
        {
            octate_value = subnet_octate[iter];
            if (octate_value == 0 && iter == 0)
            {
                break;
            }
            else
            {
                for (var j = 0; j < validOctate.length; j++)
                {
                    if (octate_value == validOctate[j])
                    {
                        counter++;
                        break;
                    }
                }
            }
        }
        if (counter == subnet_octate.length)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    else
    {
        return true;
    }
}

function validateEmailAddress(email)
{
    var str = email;
    if (str == "")
    {
        return false;
    }
    if (str.length > 0)
    {
        var posadr1 = 0;
        var posdot = str.indexOf(".");
        var posadr = str.indexOf("@");
        posadr1 = str.lastIndexOf("@"); //No I18N
        if ((posdot < 0) || (posadr < 0) || (posadr1 != posadr))
        {
            return false;
        }
    }
    var j = str.length;
    var strobj = new String(str);
    if (strobj.charAt(j - 1) == "." || strobj.charAt(0) == "@" || strobj.charAt(j - 1) == "@" || strobj.charAt(0) == "." || strobj.charAt(0) == "-" || strobj.charAt(j - 1) == "-" || strobj.charAt(j - 1) == "_" || strobj.charAt(j - 2) == "." || strobj.charAt(j - 2) == "-" || strobj.charAt(j - 2) == "_")
    {
        return false;
    }
    var indexForDot=strobj.indexOf(".");
    if(strobj.charAt(indexForDot-1) == "." || strobj.charAt(indexForDot+1) == ".")
    {
        return false;
    }
    var indexforAt=strobj.indexOf("@");
    if(!strobj.charAt(indexforAt-1).match("[a-zA-Z0-9]") || !strobj.charAt(indexforAt+1).match("[a-zA-Z0-9]"))
    {
        return false;
    }
    var emailAddressFormat="^[a-zA-Z0-9.+/=_-]+@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$";  //NO I18N
    if(!(email.match(emailAddressFormat)))
    {
        return false;
    }
    else
    {
        return true;
    }
}

function validateAliasName(common_alias_name)
{
    var aliasNameFormat =/^([a-zA-Z0-9])+(([\-\.]{1})?([a-zA-Z0-9])+)*(\.[a-zA-Z]{2,5})*(:[0-9]{1,5})*$/;
    if (common_alias_name.match(aliasNameFormat))
    {
        return true;
    }
    else
    {
        return false;
    }
}

function setFocus(element)
{
    jQuery('#alertbox button.close').on('click',function(){
        element.trigger('focus');
    });
}

var fos = (function()
{
    var fosfunc = {};

    fosfunc.viewtab = function()
    {
        jQuery("#Details").removeClass('active');
        jQuery("#History").addClass('active');
        getHistoryConfig();
    }

    fosfunc.viewtabrepl = function()
    {
        jQuery("#Details").removeClass('active');
        jQuery("#History").addClass('active');
        getHistoryRepl();
    }

    fosfunc.cancelfos = function()
    {
        jQuery('#fosconfig').hide();
        jQuery('#fosconfig1').removeClass('hide');
        jQuery('#editfos').removeClass('vhide');
        jQuery('#editdr').removeClass('vhide');
        jQuery('input#fosmode').prop('checked',isFOSChecked);//No I18N
        jQuery('input#fosmode').prop('disabled', true); // No I18N
        jQuery('input#drmode').prop('checked',isDRChecked);//No I18N
        jQuery('input#drmode').prop('disabled', true); // No I18N
        jQuery('#fosha').prop('disabled',true);// No I18N
        jQuery('#drha').prop('disabled',true);// No I18N
        jQuery("#fosdescription,#drdescription,hr#fosdrhr").removeAttr("style");//No I18N
        jQuery('#fosconfigurationtab').addClass("hide");
        jQuery('#drconfigurationtab').addClass("hide");
        jQuery('#form-footer').addClass("hide");
        if(isFOS)
        {
            jQuery('#fosha').prop('checked',true);// No I18N
            jQuery('#drha').prop('checked',false);// No I18N
        }
        else
        {
            jQuery('#fosha').prop('checked',false);// No I18N
            jQuery('#drha').prop('checked',true);// No I18N
        }
    }

    fosfunc.savefos = function()
    {
        var fosmode,drmode, check_primary_server, check_secondary_server, check_virtual_ip,mode_of_operation,emailaddress,virtualip,primarysubnet,secondarysubnet,nicprimary,nicsecondary,primaryserver,secondaryserver,commonaliasname,
            foscheckbox = jQuery("#fosmode").prop("checked"),// No I18N
            drcheckbox = jQuery("#drmode").prop("checked"),// No I18N
            loadingconf = jQuery("#loadingconf"),
            loadingconfdr = jQuery("#loadingconfdr"),
            foshamode=jQuery("#fosha").prop("checked");//No I18N

        if(foshamode)
        {
            mode_of_operation="FOS";// No I18N
            emailaddress=jQuery("#fosemail");
            virtualip = jQuery("#virtualip");
            primarysubnet = jQuery("#primarysubnet");
            secondarysubnet = jQuery("#secondarysubnet");
            nicprimary = jQuery("#nicprimaryserver");
            nicsecondary = jQuery("#nicsecondaryserver");
            primaryserver = jQuery("#primaryserverfos");
            secondaryserver = jQuery("#secondaryserverfos");
            commonaliasname = jQuery("#commonaliasnamefos");
        }
        else
        {
            mode_of_operation="DR";// No I18N
            emailaddress=jQuery("#dremail");
            primaryserver = jQuery("#primaryserverdr");
            secondaryserver = jQuery("#secondaryserverdr");
            commonaliasname = jQuery("#commonaliasnamedr");
        }
        if (primaryserver.val() && jQuery.trim(primaryserver.val())!="")
        {
            check_primary_server = isValidIPAddress(primaryserver.val());
            if(!check_primary_server)
            {
                showalert('failure',getMessageForKey("sdp.fos.primaryip.invalid"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                setFocus(primaryserver);
                return;
            }
        }
        else
        {
            showalert('failure', getMessageForKey("sdp.fos.primaryip.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
            setFocus(primaryserver);
            return;
        }
        if ((secondaryserver.val()) && jQuery.trim(secondaryserver.val())!="")
        {
            check_secondary_server = isValidIPAddress(secondaryserver.val());
            if(!check_secondary_server)
            {
                showalert('failure', getMessageForKey("sdp.fos.secondaryip.invalid"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                setFocus(secondaryserver);
                return;
            }
        }
        else
        {
            showalert('failure', getMessageForKey("sdp.fos.secondaryip.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
            setFocus(secondaryserver);
            return;
        }
        if (primaryserver.val() === secondaryserver.val())
        {
            showalert('failure', getMessageForKey("sdp.fos.sameip.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
            setFocus(secondaryserver);
            return;
        }
        if(foshamode)
        {
            if (virtualip.val() && jQuery.trim(virtualip.val())!="")
            {
                check_virtual_ip = isValidIPAddress(virtualip.val());
                if(!check_virtual_ip)
                {
                    showalert('failure', getMessageForKey("sdp.fos.virtualip.invalid.class"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                    setFocus(virtualip);
                    return;
                }
            }
            else
            {
                showalert('failure', getMessageForKey("sdp.fos.virtualip.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                setFocus(virtualip);
                return;
            }
        }
        if (check_primary_server && check_secondary_server && (!foshamode || check_virtual_ip))
        {
            var check_primary_subnet, check_secondary_subnet;
            if(foshamode)
            {
                if (primarysubnet.val() != "" && primarysubnet.val() != null)
                {
                    check_primary_subnet = isSubnetValid(primarysubnet.val());
                    if (!(check_primary_subnet))
                    {
                        showalert('failure', getMessageForKey("sdp.fos.primary.subnet.invalid"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                        setFocus(primarysubnet);
                        return;
                    }
                }
                if (secondarysubnet.val() != "" && secondarysubnet.val() != null)
                {
                    check_secondary_subnet = isSubnetValid(secondarysubnet.val());
                    if (!(check_secondary_subnet))
                    {
                        showalert('failure', getMessageForKey("sdp.fos.secondary.subnet.invalid"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                        setFocus(secondarysubnet);
                        return;
                    }
                }

                if(primarysubnet.val()!=secondarysubnet.val())
                {
                    showalert('failure', getMessageForKey("sdp.fos.subnet.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                    setFocus(primarysubnet);
                    return;
                }
            }


            if(commonaliasname.val().length && jQuery.trim(commonaliasname.val())!="")
            {
                if(!validateAliasName(commonaliasname.val()))
                {
                    showalert('failure', getMessageForKey("sdp.admin.settings.aliasURL.invalid"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                    setFocus(commonaliasname);
                    return;
                }
            }
            else
            {
                if(!foshamode)
                {
                    showalert('failure', getMessageForKey("dr.configuration.commonaliasname.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                    setFocus(commonaliasname);
                    return;
                }
            }

            if (emailaddress.val().length)
            {
                var isValidEmailIds;
                if (emailaddress.val().includes(","))
                {
                    var emailid = emailaddress.val().split(",");
                    for (var iter = 0; iter < emailid.length; iter++)
                    {
                        isValidEmailIds = validateEmailAddress(emailid[iter]);
                        if (!isValidEmailIds)
                        {
                            showalert('failure', getMessageForKey("sdp.requests.fieldFormRules.invalidEmail"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                            setFocus(emailaddress);
                            return;
                        }
                        else
                        {
                            continue;
                        }
                    }
                }
                else
                {
                    var isValidEmailId = validateEmailAddress(emailaddress.val());
                    if (!isValidEmailId)
                    {
                        showalert('failure', getMessageForKey("sdp.requests.fieldFormRules.invalidEmail"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                        setFocus(emailaddress);
                        return;
                    }
                }
            }

            if(foshamode)
            {
                if (!(jQuery.trim(nicprimary.val())!="" && nicprimary.val() != null))
                {
                    showalert('failure', getMessageForKey("sdp.fos.primary.nic.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                    setFocus(nicprimary);
                    return;
                }
                else
                {
                    var nicaddressFormat=/^[A-Fa-f0-9-{}]*$/;
                    if(!nicprimary.val().match(nicaddressFormat))
                    {
                        showalert('failure', getMessageForKey("sdp.fos.primary.nic.invalid"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                        setFocus(nicprimary);
                        return;
                    }
                }


                if (!(jQuery.trim(nicsecondary.val())!="" && nicsecondary.val() != null))
                {
                    showalert('failure', getMessageForKey("sdp.fos.secondary.nic.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                    setFocus(nicsecondary);
                    return;
                }
                else
                {
                    var nicaddressFormat=/^[A-Fa-f0-9-{}]*$/;
                    if(!nicsecondary.val().match(nicaddressFormat))
                    {
                        showalert('failure', getMessageForKey("sdp.fos.secondary.nic.invalid"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                        setFocus(nicsecondary);
                        return;
                    }
                }

                loadingconf.removeAttr("style"); // NO I18N
                loadingconfdr.removeAttr("style"); // NO I18N
                if (foscheckbox)
                {
                    fosmode = "Enabled"; // NO I18N
                    isFOSChecked=true;
                }
                else
                {
                    fosmode = "Disabled"; // NO I18N
                    isFOSChecked=false;
                }
            }
            else
            {
                loadingconf.removeAttr("style"); // NO I18N
                loadingconfdr.removeAttr("style"); // NO I18N
                if(drcheckbox)
                {
                    drmode = "Enabled"; // NO I18N
                    isDRChecked=true;
                }
                else
                {
                    drmode = "Disabled"; // NO I18N
                    isDRChecked=false;
                }
            }

            var haConfig={};
            if(foshamode)
            {
                haConfig ={
                            primary_server_IP: primaryserver.val(),
                            subnet_primary_server: primarysubnet.val(),
                            secondary_server_IP: secondaryserver.val(),
                            subnet_secondary_server: secondarysubnet.val(),
                            nic_primary_server: nicprimary.val(),
                            nic_secondary_server: nicsecondary.val(),
                            virtual_IP: virtualip.val(),
                            email_addresses: emailaddress.val(),
                            common_alias_name: commonaliasname.val(),
                            is_HA_enabled: fosmode,
                            mode_of_operation:mode_of_operation,
                            action: "haConfig"  // No I18N
                          }
            }
            else
            {
                haConfig ={
                    primary_server_IP: primaryserver.val(),
                    secondary_server_IP: secondaryserver.val(),
                    email_addresses: emailaddress.val(),
                    common_alias_name: commonaliasname.val(),
                    is_HA_enabled: drmode,
                    mode_of_operation:mode_of_operation,
                    action: "haConfig"  // No I18N
                  }
            }
                jQuery.ajax({
                    url: "/servlet/AJaxServlet?action=haConfig", //No I18N
                    type: "POST", //No I18N
                    data: "haConfig=" + sdpToJSON(haConfig), // No I18N
                    success: function(data)
                    {
                        if (("SUCCESS") === data)
                        {
                            loadingconf.css("display", "none"); // NO I18N
                            loadingconfdr.css("display", "none"); // NO I18N
                            var message="";
                            if(foshamode)
                            {
                            message = getMessageForKey("sdp.fos.configuration.success",["Failover Service"]) + getMessageForKey("sdp.fos.restart.warning");
                            }
                            else
                            {
                            message = getMessageForKey("sdp.fos.configuration.success",["Disaster Recovery"]) + getMessageForKey("sdp.fos.restart.warning");
                            }
                            showalert('warning', message, 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // No I18N
                            getConfig();
                            jQuery('#fosconfig').hide();
                            jQuery('#fosconfig1').removeClass('hide');
                            jQuery('#editfos').removeClass('vhide');
                            jQuery('#editdr').removeClass('vhide');
                            jQuery('#fosmode').prop('disabled', true); // No I18N
                            jQuery('#drmode').prop('disabled',true);// No I18N
                            jQuery('#fosha').prop('disabled',true);// No I18N
                            jQuery('#drha').prop('disabled',true);// No I18N
                            jQuery("#fosdescription,#drdescription,hr#fosdrhr").removeAttr("style");//No I18N
                                if(foshamode)
                                {
                                    fos.toggleMode("fosha");// No I18N
                                }
                                else
                                {
                                    fos.toggleMode("drha");// No I18N
                                }
                                if(foshamode)
                                {
                                    jQuery("#fosha").checked=true;
                                    jQuery("#drha").checked=false;
                                }
                                else
                                {
                                    jQuery("#fosha").checked=false;
                                    jQuery("#drha").checked=true;
                                }
                        }
                        else
                        {
                            loadingconf.css("display", "none"); //NO I18N
                            loadingconfdr.css("display", "none"); //NO I18N
                            if(data)
                            {
                                showalert('failure', data, 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // No I18N
                            }
                            else
                            {
                                showalert('failure',getMessageForKey("sdp.change.exception.msg"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // No I18N
                            }
                        }
                    }
                }); //NO I18N
        }
    }

    fosfunc.editfos = function()
    {
        jQuery('#fosconfig').show();
        jQuery('#fosconfig1').addClass('hide');
        jQuery('button#editfos,button#editdr').addClass('vhide'); //No I18N
        jQuery('#fosmode,#drmode,#fosha,#drha').prop('disabled', false); //No I18N
        jQuery('#fosdescription,#drdescription,hr#fosdrhr').attr("style","max-width:60%");//NO I18N
        jQuery('#form-footer').removeClass("hide");
        if(isFOS)
        {
            this.toggleMode("fosha");// No I18N
        }
        else
        {
            this.toggleMode("drha");// No I18N
        }
        fixedformfooter(document.querySelector('[name=fosconfig]'),document.querySelector('[name=fosconfig] #form-footer'));// NO I18N
    }
    fosfunc.editfosrepl = function()
    {
        jQuery("#primarypassword,#primarypwdicon,#secondarypassword,#secondarypwdicon").addClass('hide');
        jQuery('#fosconfigrepo,[ data-attr="fos-rep-update"]').removeClass('hide');
        jQuery('#fosconfigrepo').show();
        jQuery('#fosconfigrepo1,#editfosrepo').addClass('hide');
        fixedformfooter(document.querySelector('[name=fosconfigrepo] [data-id=form-fosconfrepo]'),document.querySelector('[name=fosconfigrepo] .form-footer'));// NO I18N
    }

    fosfunc.cancelfosrepo=function()
    {
        jQuery('#fosconfigrepo').addClass('hide');
        jQuery('#fosconfigrepo1,#editfosrepo').removeClass('hide');
        jQuery('#primarypassword,#secondarypassword').addClass('hide').css('height', '0px'); // NO I18N
        jQuery("#clearprimarypassword,#clearsecondarypassword").addClass('hide');
    }
    fosfunc.savefosrepo = function()
    {
        var check_primary_server, check_secondary_server;
        var primaryip = jQuery("#primaryipaddress");
        var secondaryip = jQuery("#secondaryipaddress");
        var primaryusername = jQuery("#primaryusername");
        var secondaryusername = jQuery("#secondaryusername");
        var primarypassword = jQuery("#primarypassword");
        var secondarypassword = jQuery("#secondarypassword");
        var loadingconfrepl = jQuery("#loadingconfrepl");
        if (primaryip.val() && jQuery.trim(primaryip.val())!="")
        {
            check_primary_server = isValidIPAddress(primaryip.val());
            if(!check_primary_server)
            {
                showalert('failure', getMessageForKey("sdp.fos.primaryip.invalid"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                setFocus(primaryip);
                return;
            }
        }
        else
        {
            showalert('failure', getMessageForKey("sdp.fos.primaryip.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
            setFocus(primaryip);
            return;
        }
        if (secondaryip.val() && jQuery.trim(secondaryip.val())!="")
        {
            check_secondary_server = isValidIPAddress(secondaryip.val());
            if(!check_primary_server)
            {
                showalert('failure', getMessageForKey("sdp.fos.secondaryip.invalid"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
                setFocus(secondaryip);
                return;
            }
        }
        else
        {
            showalert('failure', getMessageForKey("sdp.fos.secondaryip.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
            setFocus(secondaryip);
            return;
        }
        if (primaryusername.val().length === 0 || jQuery.trim(primaryusername.val())=="")
        {
            showalert('failure', getMessageForKey("sdp.fos.primaryusername.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
            setFocus(primaryusername);
            return;
        }

        if (secondaryusername.val().length === 0 || jQuery.trim(secondaryusername.val())=="")
        {
            showalert('failure', getMessageForKey("sdp.fos.secondaryusername.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
            setFocus(secondaryusername);
            return;
        }

        if (primarypassword.val().length === 0 && !primarypassword.is(":hidden"))
        {
            showalert('failure', getMessageForKey("sdp.fos.primarypassword.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
            setFocus(primarypassword);
            return;
        }
        if (secondarypassword.val().length === 0 && !secondarypassword.is(":hidden"))
        {
            showalert('failure', getMessageForKey("sdp.fos.secondarypassword.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
            setFocus(secondarypassword);
            return;
        }

        if (primaryip.val() === secondaryip.val())
        {
            showalert('failure', getMessageForKey("sdp.fos.sameip.error"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // NO I18N
            setFocus(secondaryip);
            return;
        }

        if (check_primary_server && check_secondary_server)
        {
            if(primarypassword.is(":hidden"))
            {
                primarypassword.val("*****");
            }
            if(secondarypassword.is(":hidden"))
            {
                secondarypassword.val("*****");
            }
            loadingconfrepl.removeAttr("style"); // NO I18N
            var haConfigRepl = {
                primary_server_IP: primaryip.val(),
                secondary_server_IP: secondaryip.val(),
                username_primary_server: trimAll(primaryusername.val()),
                password_primary_server: encryptDataWithRSA(trimAll(primarypassword.val())),
                username_secondary_server: trimAll(secondaryusername.val()),
                password_secondary_server: encryptDataWithRSA(trimAll(secondarypassword.val())),
                action: "haConfig_repl" // No I18N
            }

            jQuery.ajax({
                url: "/servlet/AJaxServlet?action=haConfig_repl", //No I18N
                type: "POST", //No I18N
                data: "haConfigRepl=" + encodeURIComponent(sdpToJSON(haConfigRepl)), // No I18N
                success: function(data)
                {
                    if (("SUCCESS") === data)
                    {
                        loadingconfrepl.css("display", "none"); // NO I18N
                        var message = getMessageForKey("sdp.fos.configuration.success",["File Replication"]) + getMessageForKey("sdp.fos.restart.warning");
                        showalert('warning', message, 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // No I18N
                        getConfigRepl();
                        jQuery('#fosconfigrepo').addClass('hide');
                        jQuery('#fosconfigrepo1').removeClass('hide');
                        jQuery('#editfosrepo').removeClass('hide');
                        jQuery('#primarypassword,#secondarypassword').addClass('hide').css('height', '0px'); // NO I18N
                    }
                    else
                    {
                        loadingconfrepl.css("display", "none"); //NO I18N
                        if(data)
                        {
                            showalert('failure', data, 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // No I18N
                        }
                        else
                        {
                            showalert('failure',getMessageForKey("sdp.change.exception.msg"), 'isAutoHide=false,closeOnEscKey=yes,width=auto,height=80'); // No I18N
                        }
                    }
                }
            }); //NO I18N
        }

    }
    fosfunc.updatepassword = function(element)
    {
        var hideid = jQuery('#' + jQuery(element).prev().prev().attr('id'));
        hideid.removeClass('hide').removeAttr('style').focus(); // NO I18N
        var nextelement=jQuery('#' + jQuery(element).next().attr('id'));
        nextelement.removeClass('hide');
        jQuery(element).addClass('hide');
    }
    fosfunc.showResetPwd = function(element)
    {
        jQuery(element).addClass('hide');
        var hideid = jQuery('#' + jQuery(element).prev().attr('id'));
        hideid.removeClass('hide'); // NO I18N
        var hideinput=jQuery('#' + jQuery(hideid).prev().prev().attr('id'));
        hideinput.addClass('hide');
    }

    fosfunc.toggleMode = function(element)
    {
        var drheader = jQuery('#drheader,#editdr'),
        fosheader = jQuery('#fosheader,#editfos'),
        drconfigurationtab = jQuery('#drconfigurationtab'),
        fosconfigurationtab = jQuery('#fosconfigurationtab'),
        helpcard_content_inner = jQuery('#helpcard_content_inner');

        if("fosha"===element)
        {
            drheader.addClass("hide");
            fosheader.removeClass("hide");
            drconfigurationtab.addClass("hide");
            fosconfigurationtab.removeClass("hide");
            helpcard_content_inner.find("#foshelpcard").removeClass("hide");
            helpcard_content_inner.find("#drhelpcard").addClass("hide");
        }
        else if("drha"===element)
        {
            fosheader.addClass("hide");
            drheader.removeClass("hide");
            fosconfigurationtab.addClass("hide");
            drconfigurationtab.removeClass("hide");
            helpcard_content_inner.find("#foshelpcard").addClass("hide");
            helpcard_content_inner.find("#drhelpcard").removeClass("hide");
        }
    }
    return fosfunc;
})(jQuery);