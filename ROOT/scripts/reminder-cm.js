
var $remmodule = {
    module_details: {},
    scheduler: {},
    init: function(module) {
        //mode added in initialization options for the module component from the module details object
        let options = { mode: module.mode };

        //removing mode from module details object
        delete module.mode;

        // Check if the module is related to the "calendar" entity
        if (module) {
            if(module.entity == "calendar") {//No I18N
            // Create a 'scheduler' object based on the 'module' (possibly for scheduling)
            this.scheduler = Object.assign({}, module);

            // Remove the 'currentdate' property from the original 'module' object
            delete module.currentdate;
        
                options["model"] = (options.mode == "list")?["list"]:["add","edit"];//No I18N
            }
            else if(module.entity == "change" || module.entity == "release") {
                if(options.mode == "list") {
                    module["type"] = "details";//No I18N
                    options["model"] = ['add','edit'];//No I18N
                }
                module["permissions"] = $rc.stagePermissions.global.edit;
            }
            else if(module.entity == "home" || module.entity == "reminderlist") {
                options["model"] = (options.mode == "list")?["add","edit"]:["add","edit","list"];//No I18N
                if(options.mode == "edit" && module.entity == "home") {
                    options["entity_id"] = module.entity_id;
                }
            }
            else {
                options["model"] = ["add","edit","list"];//No I18N
            }
            options["entity_url"] = (['home','reminderlist','calendar','quickaction'].includes(module.entity)) ? "":module.entity+"s/"+module.entity_id+"/";//No I18N
            module["skip_nextpage_navigation"] = $remmodule.getSkipNextPageNavigation(module.entity, options.mode);
        }
        // Store the module details in 'module_details'
        this.module_details = module;

        // Prepare options for initializing the MC (Master Component)
        var optionsMC = jQuery.extend({}, {}, $remmodule.getCommonjson(options, module));
        // 'optionsMC' likely contains configuration for the MC component.

        // Initialize the MC component with the prepared options
        new MC(optionsMC);
        // This creates an instance of the MC component with the specified options.
    },

    callbacksearchfn: function(table_info) {
        // Get the table component for reminders
        let tcomp = MC_Mapper.module_reminders.components.list.tableComp;

        if(sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[this.module_details.entity+"_filter"] && sdp_user.CLIENT_CONF[this.module_details.entity+"_filter"].filter_by) {
            tcomp.t_obj.table_info.list_info.filter_by = {
                name : sdp_user.CLIENT_CONF[this.module_details.entity+"_filter"].filter_by
            };
        }
        if($remmodule.module_details.entity == "calendar") {
            // Create a search criteria object to filter by 'id' and your module's 'ids'
            let cri = {"field": "date", "value": sdpToJSON(this.module_details.from), "condition": "greater or equal", "logical_operator": "AND"};//No I18N
            cri["children"] = [{"field": "date", "value": sdpToJSON(this.module_details.to), "condition": "lesser or equal", "logical_operator": "AND"}];//No I18N

            // Check if there are existing search criteria
            if (tcomp.t_obj.table_info.list_info.search_criteria) {
                // Create a 'children' array to include the existing criteria along with the new one
                cri["children"].push(tcomp.t_obj.table_info.list_info.search_criteria);//No I18N
            }

            // Update the search criteria for the table
            tcomp.t_obj.table_info.list_info["search_criteria"] = cri;//No I18N
        }
        // Refresh the table to apply the updated search criteria
        tcomp.refreshTable("search");//No I18N
    },

    rowDataConstruct: function(table_info) {
        // Check if the entity is "calendar"
        if(sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[this.module_details.entity+"_filter"] && sdp_user.CLIENT_CONF[this.module_details.entity+"_filter"].filter_by) {
            table_info.list_info.filter_by = {
                name : sdp_user.CLIENT_CONF[this.module_details.entity+"_filter"].filter_by
            };
        }
        if (this.module_details.entity == "calendar") {//No I18N
            // Create a search criteria object to filter by 'id' and your module's 'ids'
            let cri = {"field": "date", "value": sdpToJSON(this.module_details.from), "condition": "greater or equal", "logical_operator": "AND"};//No I18N
            cri["children"] = [{"field": "date", "value": sdpToJSON(this.module_details.to), "condition": "lesser or equal", "logical_operator": "AND"}];//No I18N

            // Update the search criteria for the table
            table_info.list_info["search_criteria"] = cri;//No I18N
        }

        // Return the modified 'list_info' to be used in constructing row data
        return {
            list_info: table_info.list_info
        };
    },

    getTableOptions: function() {
        // Initialize the default options
        var opt = {
            bulkSelectionSetting: {
                enabled: true,
                unSelectionCallback: function (elm, $this, opt) {
                    // Check if any element is checked
                    var ischecked = false;
                    if(MC_Mapper.module_reminders.components.list.tableComp.bulkSelect.selectedRecordsCount == 0) {
                        ischecked = true;
                    }
                    // Disable or enable elements with 'data-name=select'
                    jQuery('[data-name=select]').prop('disabled', ischecked);//No I18N
                },
                selectionCallback: function (elm) {
                    // Check if any element is checked
                    var ischecked = true;
                    if(MC_Mapper.module_reminders.components.list.tableComp.bulkSelect.selectedRecordsCount > 0) {
                        ischecked = false;
                    }
                    // Disable or enable elements with 'data-name=select'
                    jQuery('[data-name=select]').prop('disabled', ischecked);//No I18N
                },
            },
            callback: {
                delete: {
                    success: function() {
                        $remmodule.closeShowAlert("success", translate("api.deleted.success",[translate("sdp.calendar.reminders")]), 'isAutoHide=true');//No I18N
                    },
                    error: function() {
                        $remmodule.closeShowAlert("failure", translate("api.deleted.failure",[translate("sdp.calendar.reminders")]), 'isAutoHide=true');//No I18N
                    }
                }
            }
        };

        return opt;
    },

    summary: function(data, row) {
        var rd = data.row_data;

        // Check the status of the reminder
        const linkStyle = rd.status.internal_name === "Open" ? `${e_html(rd.summary)}` : `<s>${e_html(rd.summary)}</s>`;//No I18N

        // Check if the entity is "calendar"
        if ($remmodule.module_details.entity == "calendar") {//No I18N
            return `<span title="${e_html(rd.summary)}" rel="uitip" mode_ellipsis="true">${e_html(rd.summary)}</span>`;
        }

        // Initialize entity URL
        let e_url = "";
        let parentModule = rd.associated_module.toLowerCase();

        // Check if 'rd' has a 'module'
        if (parentModule != "general") {
            e_url = ", entity_url: '" + parentModule + "s/" + rd[parentModule].id + "/reminders'";//No I18N
        }

        // Adjust style based on the 'status'
        return `<a href="/" sdphrefJs="js-href-reminder-cm-0" title="${e_html(rd.summary)}" data-event="click" data-handler="MC.load({from: 'list', mode: 'edit', entity_id: ${rd.id}${e_url}}, 'reminders');" nonce="${sdpNonce}" rel="uitip" mode_ellipsis="true">${linkStyle}</a>`; //No I18N
    },

    date: function(data, row) {
        return data.row_data.date.display_value;
    },
    linkto: function(data, row) {
        var rd = data.row_data;
        var link = ""; // Initialize link
        var value = ""; // Initialize value

        let parentModule = rd["associated_module"].toLowerCase();

        // Check if 'rd' has a "module"
        if (parentModule != "general") {//No I18N
            link = $remmodule.getLink(parentModule,rd[parentModule].id);
            // Create a value by combining module display name and ID
            value = $remmodule.getModuleName(parentModule) + " : " + rd[parentModule].id;//No I18N
        }

        return '<a href="' + link + '" target="_blank" rel="noopener" rel="noreferrer">' + value + '</a>';//No I18N
    },
    deletecallback: function(info, data, tinfo) {
        if (($remmodule.module_details.entity == "release" || $remmodule.module_details.entity == "change") && $remmodule.module_details.type == "details") {
            $rc.refreshLeftPanelCount("reminder"); //No I18N
        }
    },
    setWidth: function() {
        return (this.module_details.entity == "release"|| this.module_details.entity == "change") && this.module_details.type == "details"?jQuery("#reminder-module-details").width() - 5:"100%";
    },
    completebtn: function() {

        var xhtml = '<div class="fl btn-group bs-noconflict" style="display: none;">'+//No I18N
        '<button type="button" aria-label="Actions" class="btn btn-default btn-sm sdmenu-toggle btn-rad-lft btn-rad-rgt" data-switch=sdmenu data-cs-field="actions" id="bulkactionsMenu" aria-expanded="false" data-name="select" disabled>'+ //No I18N
        '<span data-i18n-key="sdp.common.actions">'+translate("sdp.reminder.state.change")+'</span>'+//No I18N
        '<span class="caret ml5"></span></button>'+//No I18N
        '<ul class="sdmenu-dd" aria-labelledby="bulkactionsMenu">'+//No I18N
        '<li id="reminderopen" data-cs-field="open">'+//No I18N
        '<a href="/" sdphrefJs="js-href-reminder-cm-2" data-event="click" data-handler="$remmodule.stateaction(this)" nonce='+sdpNonce+'>'+//No I18N
        '<span data-i18n-key="sdp.export.pdf.button.value">'+translate("sdp.dashboard.open")+'</span>'+//No I18N
        '</a>'+//No I18N
        '</li>'+//No I18N
        '<li id="reminderclose" data-cs-field="close">'+//No I18N
        '<a href="/" sdphrefJs="js-href-reminder-cm-4" data-event="click" data-handler="$remmodule.stateaction(this)" nonce='+sdpNonce+'>'+//No I18N
        '<span data-i18n-key="sdp.export.pdf.button.value">'+translate("sdp.common.close")+'</span>'+//No I18N
        '</a>'+//No I18N
        '</li>'+//No I18N
        '</ul>'+//No I18N
        '</div>';//No I18N
        return xhtml;
    },
    listviewheader: function(module) {
        if (module) {
            if (module.entity === "calendar" || module.entity === "reminderlist" || module.entity === "quickaction") {//No I18N
                // If the entity is "calendar," "reminderlist," or "quickaction," return false
                return false;
            } else if (module.entity === "request") {//No I18N
                // If the entity is "request," construct a link to the request with the entity label and ID
                return "<div class='fr'>" + $remmodule.getTableHeader(module.entity) + " <a href=" + $remmodule.getLink(module.entity, module.entity_id) + " target='_blank' rel='noopener'>" + module.entity_id + "</a></div>";
            }
            // For other entities, display the entity label
            return "<div class='fr'>" + $remmodule.getTableHeader(module.entity) + "</div>";//No I18N
        }
        // If 'module' is not defined, return an empty right-aligned div
        return "<div class='fr'></div>";//No I18N
    },
    stateaction: function($this) {
        var state = jQuery($this).parent().attr("data-cs-field");//No I18N
        var parentVar = jQuery($this).closest("#listviewloader").find("web-component").attr("id");//No I18N
        var tableopt = WebComponents.getInstance(parentVar || "webc-reminders");//No I18N

        let module = $remmodule.module_details;
        let entityURL = (!["home","quickaction","reminderlist","calendar"].includes(module.entity)) ? (module.entity+"s/"+module.entity_id)+"/" : "";//No I18N
        if(!tableopt) {
            return false;
        }
        var selecteddata = tableopt.bulkSelect.getSelectedIDs();
        if(selecteddata.length != 0) {
            sdpAjax({
                async: false,
                type: "PUT", //No I18N
                url: "/api/v3/"+entityURL+"reminders/"+state+"?ids="+selecteddata.join(','),//No I18N
                success: function(resp) {
                    tableopt.refreshTable();
                    $remmodule.closeShowAlert("success", translate("api.updated.success",[translate("sdp.calendar.reminders")]), 'isAutoHide=true');//No I18N
                },
                error: function(resp) {
                    $remmodule.closeShowAlert("failure", translate("api.updated.failure",[translate("sdp.calendar.reminders")]), 'isAutoHide=false');//No I18N
                }
            });
        }
    },
    getCommonjson: function(options, module) {
        let sdp_header;
        if(window.externalframe && typeof sdpheader_data == 'undefined') {
            sdp_header = $previewComponent.iframeActiveParent().window.sdpheader_data;
        } else if(sdpheader_data) {
            sdp_header = sdpheader_data;
        }
        // Define default permissions for the module
        let isDBOperationAllowed = sdp_header.esm_details && sdp_header.esm_details.current_portal.canAllowedDBOperation;
        var permissions = {
            "add": isDBOperationAllowed,//No I18N
            "delete": isDBOperationAllowed,//No I18N
            "edit": isDBOperationAllowed//No I18N
        };

        // Set the "options" property in the $remmodule object
        $remmodule["options"] = options;//No I18N

        // Check if the element with the ID 'reminder-module' exists in the DOM
        if (jQuery('#reminder-module').length !== 0) {//No I18N
            // If 'module' is defined and its entity is not "quickaction," remove the element with the ID 'reminder-module'
            if (module && module["entity"] !== "quickaction") {//No I18N
                jQuery('#reminder-module').remove();//No I18N
            }
        }

        // Initialize the 'ids' variable with the value "reminder-module"
        let ids = "reminder-module";//No I18N

        // Check the entity of the 'module'
        if (module && module["entity"] === "reminderlist") {//No I18N
            // If the entity is "reminderlist," append a new element with the ID 'reminder-module' to the content-details-inner
            jQuery('#content-details-inner').append('<div id="reminder-module"></div>');//No I18N
        } else if (module && (module["entity"] === "release" || module["entity"] === "change")) {//No I18N
            // If the entity is "release" or "change"
            if (module["type"] === "details") {//No I18N
                // If the module type is "details," change the 'ids' variable to "reminder-module-details"
                ids = "reminder-module-details";//No I18N
                // Remove the element with the ID 'reminder-module-quickaction'
                jQuery('#reminder-module-quickaction').remove();//No I18N
                // Append a new element with the ID 'reminder-module-details' to the content-details-inner
                jQuery('#content-details-inner-' + module.entity).append('<div id="reminder-module-details"></div>');//No I18N
            } else {
                // For other module types, append a new element with the ID 'reminder-module' to the body
                jQuery('body').append('<div id="reminder-module"></div>');//No I18N
            }

            // Check if module.permissions is defined
            if (!module.permissions) {
                permissions["add"] = false;//No I18N
            }
        } else if (module && module["entity"] === "quickaction") {//No I18N
            // If the entity is "quickaction," change the 'ids' variable to "reminder-module-quickaction"
            ids = "reminder-module-quickaction";//No I18N
            // Remove the element with the ID 'reminder-module-quickaction'
            jQuery('#reminder-module-quickaction').remove();//No I18N
            // Append a new element with the ID 'reminder-module-quickaction' to the body
            jQuery('body').append('<div id="reminder-module-quickaction"></div>');//No I18N
        } else {
            // For other entities, append a new element with the ID 'reminder-module' to the body
            jQuery('body').append('<div id="reminder-module"></div>');//No I18N
        }


        let modulejson = {
            //Base element to render content
            "container": document.getElementById(ids),//No I18N
            //List/Form(add/edit),Details page
            "mode": options.mode,//No I18N
            "name": "reminders",//No I18N
            "module": "reminder",//No I18N
            //Check for add/edit/delete action -- Object
            "permissions": permissions,//No I18N
            //URL for history push state
            "history_state_url": "/AllReminders.do?",//No I18N
            //"history_skip_module": true,//No I18N
            //Module active or not
            "in_active": false,//No I18N
            //Trash view info message with common action
            "is_trash": false,//No I18N
            //module based reminders url
            "entity_url": options.entity_url,//No I18N
            //Module name
            "display_name": translate("sdp.calendar.reminder"),//No I18N
            "model": options.model || ["add","edit"],//No I18N
            "list": REM_LIST,//No I18N
            "form": REM_FORM,//No I18N
        };
        let mc_commonjson = new MC_OPTIONS(modulejson);
        mc_commonjson.container = document.getElementById(ids);
        mc_commonjson.model = modulejson.model;
        let commonjson = mc_commonjson;

        if(module && module.entity) {
            if(module.entity == "quickaction") {//No I18N
                //commonjson.secondary_name = "reminders_quickaction";//No I18N
            }
            if(module.container) {
                commonjson.container = module.container;
                if(module.entity == "home") {
                    commonjson.view = "classic";//No I18N
                }
            }
            if(!["home","quickaction","reminderlist","calendar"].includes(module.entity)) {
                delete commonjson.list.meta.cells.fields_required.id;
            }
        }
        if(options.entity_id) {
            commonjson.entity_id = options.entity_id;
        }
        return commonjson;
    },
    getTableOptions_classic: function() {
        var class_options = {
            column_settings: {
                default_position: 1,
                columns: [{
                    size: 12,
                    row_count: 1,
                    default_rowposition: 1
                }],
                assign_content_width: false,
                assign_label_width: false,
                hide_label:true
            },
            searchEnabled: false,
            view_mode: "linear",//No I18N
            lazyloadingEnabled: true,
            nodatabanner_callback: "$remmodule.setNoDataBanner",//No I18N
            callbackAfterBodyRender: function() {
                jQuery("#reminders_list_kanban_div").addClass("brdtop0").find(".row").addClass("list-anno").find(".col-xs-12").addClass("widget-details-highlight noborder");
            }
        };
        return class_options;
    },
    setNoDataBanner: function() {
        return `<div class="widget-panel p0"><div class="disp-t fw fh"><div class="disp-c vmiddle tc"><p><span aria-hidden="true" class="hm-sprite myrmdr-ctr"></span></p><p data-i18n-key="sdp.home.allReminder.noreminderavailable">${translate("sdp.home.allReminder.noreminderavailable")}</p></div></div></div>`;//No I18N
    },
    getRemindBefore: function(name) {
        const mappings = {
            [ "1 " + translate("sdp.events.hr") ]: 3600000,
            [ "2 " + translate("sdp.events.hr") ]: 7200000,
            [ "6 " + translate("sdp.events.hr") ]: 21600000,
            [ "12 " + translate("sdp.events.hr") ]: 43200000,
            [ "1 " + translate("sdp.home.day") ]: 86400000,
            [ "2 " + translate("common.days") ]: 172800000,
            [ "1 " + translate("sdp.home.week") ]: 604800000,
            [ "15 " + translate("sdp.events.mins") ]: 900000,
            [ "30 " + translate("sdp.events.mins") ]: 1800000,
            [ "45 " + translate("sdp.events.mins") ]: 2700000
        };

        return mappings[name]||null;
    },
    getRemindBeforeString: function(name) {
        name = Number(name);
        const mappings = {
            3600000:"1 "+translate("sdp.events.hr"),
            7200000:"2 "+translate("sdp.events.hr"),
            21600000:"6 "+translate("sdp.events.hr"),
            43200000:"12 "+translate("sdp.events.hr"),
            86400000:"1 "+translate("sdp.home.day"),
            172800000:"2 "+translate("common.days"),
            604800000:"1 "+translate("sdp.home.week"),
            900000:"15 "+translate("sdp.events.mins"),
            1800000:"30 "+translate("sdp.events.mins"),
            2700000:"45 "+translate("sdp.events.mins")
        };
        return mappings[name] || translate("sdp.requests.viewrequest.noRefresh");
    },
    getModuleName: function (name) {
        const mappings = {
            "request": "common.requestid",//No I18N
            "problem": "sdp.problem.problemId",//NO I18N
            "change": "sdp.change.changeId",//No I18N
            "release": "common.release.id"//No I18N
        };

        return translate(mappings[name]) || null;
},
    getLink: function (module, moduleId) {
        const mapping = {
            "request" : "/WorkOrder.do?woMode=viewWO&woID="+moduleId,//No I18N
            "change" : "/ui/changes?mode=detail&entity_id="+moduleId,//No I18N
            "problem" : "/ui/problems?mode=detail&entity_id="+moduleId,//No I18N
            "release" : "/ui/releases?mode=detail&entity_id="+moduleId//No I18N
        };
        return mapping[module] || null;
    },
    getTableHeader: function(module) {
        if(module == "request") {
            return translate("sdp.home.allReminder.tableHeading1");
        }
        return '';
    },
    getSkipNextPageNavigation: function(module, mode) {
        return (module == "reminderlist" || mode == "add" || mode == "edit");//No I18N
    },
    editRemHome: function(id) {
        $header.invokeReminders({'mode':'edit','entity':'home','entity_id':id});//No I18N
    },
    classicsummary: function(data, row) {
        let rd = data.row_data;
        const deleteicon = `<div style="width: 25px;" class="vtop disp-c"><a data-event="click" data-handler="$home_page.reminderAction('/api/v3/reminders/${rd.id}','delete','DELETE');return false;" nonce="${sdpNonce}" href="/" sdphrefJs="js-href-reminder-cm-7" target="_self" data-name="delete_reminder" rel='uitip' title="${translate('sdp.home.reminderDisplay.deletereminder')}" class="mr5"><span aria-hidden="true" class="cspr trash icon-sm"></span></a></div>`;//No I18N
        const statushtml = rd.status.internal_name == "Closed" ? `<a data-event="click" data-handler="$home_page.reminderAction('/api/v3/reminders/${rd.id}/_open','statusupdate','PUT');return false;" nonce="${sdpNonce}" href="/" sdphrefJs="js-href-reminder-cm-9" target="_self" data-name="clock_inactive" class="mr5" rel='uitip' title="${translate('sdp.home.reminder.changestatus')}"><span class="cspr reminder-cls icon-sm"></span></a>` : `<a data-event="click" data-handler="$home_page.reminderAction('/api/v3/reminders/${rd.id}/_close','statusupdate','PUT');return false;" nonce="${sdpNonce}" href="/" sdphrefJs="js-href-reminder-cm-9" target="_self" data-name="clock_active" class="mr5" rel='uitip' title="${translate('sdp.home.reminder.changestatus')}"><span class="cspr reminder icon-sm"></span></a>`;//No I18N
        const status = `<div style="width: 25px;" class="vtop disp-c">${statushtml}</div>`;//No I18N

        const summarytext = rd.status.internal_name == "Closed" ? `<strike class="text-muted">${e_html(rd.summary)}</strike>` : `${e_html(rd.summary)}`;//No I18N
        const summaryhtml = `${deleteicon}${status}<div class="vtop disp-c"><div class="truncate-ellipsis mb5"><a href="/" sdphrefJs="js-href-reminder-cm-12" rel='uitip' data-event="click" data-handler="$remmodule.editRemHome('${rd.id}');" nonce="${sdpNonce}" data-name="update_reminder" class="truncate-wrapper pr20 fw sb" title='${e_html(rd.summary)}'><strong>${summarytext}</strong></a></div><p class="text-muted m0 mb0">${rd.date.display_value}</p></div>`;//No I18N
        return summaryhtml;
    },
    setHeight: function() {
        return jQuery("#sdphome-reminder-placeholder").height() - jQuery("#sdphome-reminder-placeholder .widget-header").outerHeight() - 5;//No I18N
    },
    closeShowAlert:function(status,responseText,features){
        jQuery("#alertbox").remove();// No I18N
        showalert(status,responseText,features);
    },
    closerempreview: function() {
        if(window.location.pathname == "/ui/reminders") {
            location.reload();
        }
    },
    summarycolumn: function(data) {
        data.column_settings = {
            view_type: "row"
        };
        return data;
    },
};
class REM_FORM extends MODULE_FORM {
    /**
     * Creates a new REM_FORM instance.
     * @param {object} form - The form object representing a reminder.
     * @param {object} options - Additional options for the form.
     */
    constructor(form, options) {
        let module = $remmodule.module_details;// Get the module details from the $remmodule.
        let frm = {
            "meta": REM_FORM_META, //No I18N
            "options": {//No I18N
                "hbs": {//No I18N
                    "callback": {//No I18N
                        "pre": function(opt) {//NO I18N
                            if(opt.mode == "edit") {
                                opt.form_data.entitydata["remind_before"]=$remmodule.getRemindBeforeString(opt.form_data.entitydata.remind_before);
                            } else {
                                opt.form_data.entitydata["remind_before"]={"id": $remmodule.getRemindBeforeString(900000), "name": $remmodule.getRemindBeforeString(900000), "text": $remmodule.getRemindBeforeString(900000)};//No I18N
                            }
                            opt.form_data["allowedValues"] = {//NO I18N
                                "remind_before": [//NO I18N
                                    {id:translate("sdp.requests.viewrequest.noRefresh"),name:translate("sdp.requests.viewrequest.noRefresh")},
                                    {id:"15 "+translate("sdp.events.mins"),name:"15 "+translate("sdp.events.mins")},
                                    {id:"30 "+translate("sdp.events.mins"),name:"30 "+translate("sdp.events.mins")},
                                    {id:"45 "+translate("sdp.events.mins"),name:"45 "+translate("sdp.events.mins")},
                                    {id:"1 "+translate("sdp.events.hr"),name:"1 "+translate("sdp.events.hr")},
                                    {id:"2 "+translate("sdp.events.hr"),name:"2 "+translate("sdp.events.hr")},
                                    {id:"6 "+translate("sdp.events.hr"),name:"6 "+translate("sdp.events.hr")},
                                    {id:"12 "+translate("sdp.events.hr"),name:"12 "+translate("sdp.events.hr")},
                                    {id:"1 "+translate("sdp.home.day"),name:"1 "+translate("sdp.home.day")},
                                    {id:"2 "+translate("common.days"),name:"2 "+translate("common.days")},
                                    {id:"1 "+translate("sdp.home.week"),name:"1 "+translate("sdp.home.week")}
                                ]
                            };
                            opt.form_data.save["entity_name"] = "reminder";//NO I18N
                            opt.form_data.save["serializer"] = function(payload) {//NO I18N

                                if(!payload.reminder.date) {
                                    payload.reminder["date"] = {"value": MC_Mapper['module_reminders'].components.form.fc.entitydata.date.value};//No I18N
                                }
                                if(payload.reminder["remind_before"]) {
                                    payload.reminder["remind_before"] = $remmodule.getRemindBefore(payload.reminder.remind_before.name);//NO I18N
                                }
                            };
                            return opt;
                        },
                    },
                },
                "popupoption": {//No I18N
                    "callback": {//No I18N
                        "beforeopen": function(extraoption) {//No I18N
                            return jQuery.extend({},extraoption,{"width": "920px",});//No I18N
                        },
                        "close": function(opt, mode, $this) {//No I18N
                            if(mode == "cancel") {
                                if($this.options.model.contains("list") && !$remmodule.module_details.skip_nextpage_navigation) { //No I18N
                                    MC.load({
                                        mode: "list", //No I18N
                                    }, 'reminders'); //No I18N
                                    return false;
                                }
                                else {
                                    jQuery(opt.container || ("#"+MC.options.container.id+"_popup")).sdp_zcomponent_dialog("close"); //No I18N
                                }
                            }
                            else if(mode == "save") {
                                if(!$remmodule.module_details.skip_nextpage_navigation) {
                                    if(module && module.entity == "release" || module.entity == "change") {
                                        jQuery(opt.container || ("#"+MC.options.container.id+"_popup")).sdp_zcomponent_dialog("close"); //No I18N
                                    }
                                    else {
                                        MC.load({
                                            mode: "list", //No I18N
                                        }, 'reminders'); //No I18N
                                    }
                                }
                                else {
                                    jQuery(opt.container || ("#"+MC.options.container.id+"_popup")).sdp_zcomponent_dialog("close"); //No I18N
                                }
                                if(module) {
                                    if(module.entity == "home") {//No I18N
                                        $home_page.processReminders();
                                    }
                                    else if(module.entity == "reminderlist") {//NO I18N
                                        WebComponents.getInstance("webc-reminders").refreshTable();//NO I18N
                                    }
                                    else if(module.entity == "calendar") {//No I18N
                                        //calendar refresh function
                                        loadCalendarForTech(parent.sdp_user.LOGGEDIN_USERID);
                                    }
                                    else if(module.entity == "release" || module.entity == "change") {//No I18N
                                        //refresh release left panel count and list view
                                        if(jQuery("#webc-reminders").length > 0) {
                                            WebComponents.getInstance("webc-reminders").refreshTable();//NO I18N
                                        }
                                        $rc.refreshLeftPanelCount("reminder");//No I18N
                                    }
                                }
                            }
                        },
                    }
                },
                "component": {//No I18N
                    "callback": {//No I18N
                        "pre": function(formdata) {//No I18N
                            if(formdata.mode == "new" && module && module.entity == "calendar") {
                                formdata.entitydata["date"] = {"display_value": getFormattedDateTime(new Date(parseInt($remmodule.scheduler.currentdate)), true),"value": $remmodule.scheduler.currentdate};//No I18N
                            }
                            return formdata;
                        },
                        "post": function(formdata) {//No I18N
                            let str = '';
                            if(formdata.mode == "edit") {
                                str = '<div id="historyid" class="fr"><a href="/" class="cur-ptr thm-spr fr" entity-key="'+translate("sdp.calendar.reminder")+'" data-id="reminders" data-history-width="850px" sdphrefJs="js-href-reminder-cm-13" data-event="click" data-handler="viewModuleHistory(this)" nonce='+sdpNonce+' is-date-filter="true" admin-entity="false" is-new-history="true" entity-id="'+formdata.entitydata.id+'"  ><span class="disp-ib vmiddle mr5"><svg width="20" height="20"><use href="#crspr-history-ic"></use></svg></span>'+translate("common.viewhistory")+'</a></div>';//No I18N
                            }
                            if(module && module.entity) {
                                if(!(module.entity == "reminderlist" || module.entity == "home" || module.entity == "calendar" || module.entity == "quickaction")) {//No I18N
                                    str = str + '<div id="moduleid" class="fl">'+$remmodule.getModuleName(module.entity)+' : <a class="text-link cur-ptr" href="'+$remmodule.getLink(module.entity, module.entity_id)+'" rel="noreferrer" target="_blank" rel="noopener">'+module.entity_id+'</a></div>';//No I18N
                                }
                                else if(formdata.mode == "edit" && formdata.entitydata.associated_module.toLowerCase() != "general") {
                                    let parentEntity = formdata.entitydata.associated_module.toLowerCase();
                                    str = str + '<div id="moduleid" class="fl">'+$remmodule.getModuleName(parentEntity)+' : <a class="text-link cur-ptr" href="'+$remmodule.getLink(parentEntity,formdata.entitydata[parentEntity].id)+'" rel="noreferrer" target="_blank" rel="noopener">'+formdata.entitydata[parentEntity].id+'</a></div>';//No I18N
                                }
                            }
                            jQuery("#"+formdata.formid).before('<div class="fl fw p15 pb5">'+str+'</div>');//No I18N
                            setTimeout(function() {
                                jQuery("#for_summary").focus();
                                $sdEventListener('[sdphrefJs="js-href-reminder-cm-13"]');//No I18N
                            },50);
                        }
                    }
                }
            },
        }
        super(frm, options); // Call the constructor of the parent class MODULE_LIST.
        return this.form;
    }
}

class REM_FORM_META {
    /**
     * Creates a new REM_FORM_META instance.
     * @param {object} form - The form object.
     * @param {object} options - Additional options for the form.
     */
    constructor(form, options) {
        let formopt = {
            "entity_url" : (options.entity_url || "") + "reminders",//No I18N
            "entity_name": "reminder",//No I18N
            "layout_customization": function(opti) {//No I18N
                var layouts = {
                    "layouts": [{//No I18N
                        "name": "form",//No I18N
                        "attributes": null,//No I18N
                        "sections": [{//No I18N
                            "column_count": "1",//No I18N
                            "name": "-1",//No I18N
                            "collapsed_state": "expanded",//No I18N
                            "position": {//No I18N
                                "col": 1,//No I18N
                                "row": 1//No I18N
                            },
                            "fields": [{//No I18N
                                "name": "summary",//No I18N
                                "position": {//No I18N
                                    "col": 1,//No I18N
                                    "col_size": 12,//No I18N
                                    "row": 1//No I18N
                                },
                                "mandatory": true,//No I18N
                                "height": "100",//No I18N
                                "constraints": {//No I18N
                                    "max_length":250//No I18N
                                }
                            }
                            ],
                            "help_text": null,//No I18N
                            "style_properties": {//No I18N
                                "field_style": {//No I18N
                                    "field_align": "top"//No I18N
                                },
                                "section_style": {}//No I18N
                            },
                        },
                            {
                                "column_count": "2", //No I18N
                                "name": "-1", //No I18N
                                "collapsed_state": "expanded", //No I18N
                                "position": {//No I18N
                                    "col": 1, //No I18N
                                    "row": 1, //No I18N
                                },
                                "fields": [{//No I18N
                                    "name": "date", //No I18N
                                    "position": {//No I18N
                                        "col": 1, //No I18N
                                        "col_size": 12, //No I18N
                                        "row": 1, //No I18N
                                    },
                                    "mandatory": true, //No I18N
                                    "args":{//No I18N
                                        "calendar_options":{//No I18N
                                            "minDate":getDateInUserTimezone()//No I18N
                                        }
                                    }
                                },
                                    {
                                        "mandatory": false, //No I18N
                                        "name": "remind_before", //No I18N
                                        "disableSort": true, //No I18N
                                        "position": {//No I18N
                                            "col": 1, //No I18N
                                            "col_size": 12, //No I18N
                                            "row": 2, //No I18N
                                        },
                                    }],
                                "help_text": null, //No I18N
                                "style_properties": {//No I18N
                                    "field_style": {//No I18N
                                        "field_align": "top", //No I18N
                                    },
                                    "section_style": {}, //No I18N
                                },
                            }],
                        "help_text": null//No I18N
                    }]
                };
                opti["template"] = {
                    "layouts": layouts//No I18N
                };
                return opti;
            },
        };
        return formopt;
    }
}

class REM_LIST_META_AO {
    /**
     * Creates a new REM_LIST_META_AO instance.
     * @param {object} list - The list object representing reminders.
     * @param {object} options - Additional options for the list.
     */
    constructor(list, options) {
        let module = $remmodule.module_details;// Get the module details from the $remmodule.
        // Initialize the 'ao' (Additional Options) object with default values.
        let ao = {
            "other-options": "$remmodule.getTableOptions",//No I18N
            "handle-window-resize": true, //No I18N
            "width": "fx:$remmodule.setWidth", //No I18N
            "delete_callback": "$remmodule.deletecallback", //No I18N
            "row_inputdata": "$remmodule.rowDataConstruct", //No I18N
            "delete-url": (!["home","quickaction","reminderlist","calendar"].includes(module.entity)) ? (module.entity+"s/"+module.entity_id)+"/reminders" : "reminders", //No I18N
            "callback-Search-Function": "$remmodule.callbacksearchfn" //No I18N
        };

        if((module.entity == "release"|| module.entity == "change") && module.type == "details") {
            ao["height"] = "fx:$remmodule.setHeight"; //No I18N
            delete ao["handle-window-resize"];//No I18N
        }

        if(module.entity == "home") {
            ao["other-options"] = "$remmodule.getTableOptions_classic";//No I18N
            ao["height"] = "fx:$remmodule.setHeight"; //No I18N
            delete ao["handle-window-resize"];//No I18N
        }
        else {
            ao["personalize_key"] = "reminder_"+module.entity+"_table_listview";//No I18N
        }
        // Return the 'ao' object with the configured options.
        return {"additional_options": ao}; //No I18N
    }
}

class REM_LIST_META_HEADER {
    /**
     * Creates a new REM_LIST_META_HEADER instance.
     * @param {object} list - The list object representing reminders.
     * @param {object} options - Additional options, including permissions.
     */
    constructor(list, options) {
        let permissions = options.permissions;
        let module = $remmodule.module_details;
        let listopt = {
            "add": {//No I18N
                "enable": permissions.add //No I18N
            },
            "t_searchicon": {//No I18N
                "enable": true,//No I18N
                "custom_class": "fl"//No I18N
            },
            "deleteicon": {//No I18N
                //(compare isTrash '&&' permissions.delete) '||' permissions.move_to_trash
                "enable": permissions.delete || permissions.move_to_trash,//No I18N
                "custom_class": "fl ml10"//No I18N
            },
            "custom_action": {//No I18N
                "enable": permissions.edit,//No I18N
                "custom_class": "fl ml10",//No I18N
                "partial": "$remmodule.completebtn",//No I18N
                "custom_attr": "data-id='reminders'",//No I18N
            },
            "custom_action_1": {//No I18N
                "enable": true,//No I18N
                "custom_class": "fl ml10",//No I18N
                "renderhtml": $remmodule.listviewheader(module) //No I18N
            },
            "pagination_comp": {//No I18N
                "enable": true,//No I18N
                "custom_class": "btn-group"//No I18N
            },
        };
        if(module.entity == "calendar") {
            listopt.add.enable = false;
            listopt.custom_action.enable = false;
            listopt.deleteicon.enable = false;
        } else if((module.entity == "release"|| module.entity == "change") && module.type == "details") {
            if(!module.permissions) {
                if(['change','release'].includes(module.entity)  && !permissions["edit"]) {
                    listopt.custom_action.enable = false;
                }
            }
        }
        return listopt || list;
    }
}

class REM_LIST_META_CELLS {
    /**
     * Creates a new REM_LIST_META_CELLS instance.
     * @param {object} list - The list object representing reminders.
     * @param {object} options - Additional options, including permissions.
     */
    constructor(list, options) {
        let module = $remmodule.module_details; // Get the module details from $remmodule.
        // Delete the 'row_actions' property from the 'static_cells' object in the list.
        // This effectively removes the row actions from the list's cells.
        delete list.cells.static_cells.row_actions;
        let permissions = options.permissions;// Extract permissions from the provided options.
        list.cells["fields_required"] = {
            "summary": {//No I18N
                "text": translate("update.summary"),//No I18N
                "data-celltransformer": "$remmodule.summary",//No I18N
            },
            "date": {//No I18N
                "text": translate("sdp.common.date"),//No I18N
                "searchable": false,//No I18N
                "data-celltransformer": "$remmodule.date"//No I18N
            },
            "associated_module": {//No I18N
                "text": translate("gdpr.field.module"),//No I18N
            },//ReminderDisplay.jsp
            "id": {//No I18N
                "data-celltransformer": "$remmodule.linkto",//No I18N
                "searchable": false,//No I18N
                "sortable": false,//No I18N
                "text": translate("sdp.common.link")//No I18N
            },
            "status": {//No I18N
                "text": translate("sdp.requests.common.status"),//No I18N
                "value_path": "status.name"//No I18N
            }
        };
        if(module.entity == "calendar") {
            delete list.cells.fields_required['module.display_name'];//No I18N
            list.cells.static_cells.checkbox = false;
        } else if((module.entity == "release"|| module.entity == "change") && module.type == "details") {
            if(!module.permissions) {
                if(['change','release'].includes(module.entity)  && !permissions["edit"]) {
                    list.cells.static_cells.checkbox = false;
                }
            }
        }
        if(module.entity == "home") {
            list.cells['fields_required'] = {//No I18N
                "summary": {//No I18N
                    "text": "Summary",//No I18N
                    "hide_label": "true",//No I18N
                    "data-celltransformer": "$remmodule.classicsummary",//No I18N
                    "callback-columnoption": "fx:$remmodule.summarycolumn",//No I18N
                }
            };
        }
        return list;
    }
}

class REM_LIST_META extends MODULE_LIST_META {
    /**
     * Creates a new REM_LIST_META instance.
     * @param {object} list - The list object representing reminders.
     * @param {object} options - Additional options.
     */
    constructor(list, options, json) {

        let optoption = $remmodule.options; // Get options from the $remmodule.

        // Set the 'actions' property of the list's 'header' to the 'REM_LIST_META_HEADER' class.
        list.header.actions = REM_LIST_META_HEADER;

        // Set the 'cells' property of the list to the 'REM_LIST_META_CELLS' class.
        list.cells = REM_LIST_META_CELLS;

        // Set the 'additional_options' property of the list to the 'REM_LIST_META_AO' class.
        list.additional_options = REM_LIST_META_AO;

        // Construct the 'callbackURL' by combining 'entity_url' (if available) with "reminders".
        list["callbackURL"] = (optoption.entity_url || "") + "reminders";//No I18N

        super(list, options, json);
        // Return the modified 'list' object.
        return this;
    }
}


class REM_LIST_OPTIONS {
    /**
     * Creates a new REM_LIST_OPTIONS instance.
     * @param {object} list - The list object representing reminders.
     * @param {object} commonjson - Common JSON data.
     */
    constructor(list, commonjson) {
        let module = $remmodule.module_details; // Get module details from $remmodule.
        let filter = (sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[module.entity+"_filter"]) ? sdp_user.CLIENT_CONF[module.entity+"_filter"].filter_by : "all";
        list.header = {
            "logo": {//No I18N
                "enable": true,//No I18N
                "classname": "hm-sprite hm-rmdr icon-lg vbottom list-icon-groups" //No I18N
            },
            "filter": {//No I18N
                "enable": true,//No I18N
                "active": "all",//No I18N
                "label": filter == "open" ? translate("sdp.events.incomplete") : (filter == "close" ? translate("sdp.events.complete") : translate("sdp.home.allReminder.heading")),//No I18N
                "trash": false,//No I18N
                "hbsrender_skip": true,//No I18N
                "options": {//No I18N
                    "all": {//No I18N
                        "label": translate("sdp.home.allReminder.heading"),//No I18N /** Display value **/
                        "type": "all_filter",//No I18N
                        "table_info_callback": function(opt, inputdata){//No I18N
                            addPersonalization(module.entity+"_filter",{"filter_by": "all"});
                            inputdata.list_info.filter_by = {
                                "name" : "all" //No I18N
                            }
                            return opt;
                        }
                    },
                    "open": {//No I18N
                        "label": translate("sdp.events.incomplete"),//No I18N
                        "type": "Open",//No I18N
                        "table_info_callback": function(opt, inputdata) {//No I18N
                            addPersonalization(module.entity+"_filter",{"filter_by": "open"});
                            inputdata.list_info.filter_by = {
                                "name" : "open" //No I18N
                            }
                            return opt;
                        }
                    },
                    "close": {//No I18N
                        "label": translate("sdp.events.complete"),//No I18N
                        "type": "Closed",//No I18N
                        "table_info_callback": function(opt, inputdata) {//No I18N
                            addPersonalization(module.entity+"_filter",{"filter_by": "close"});
                            inputdata.list_info.filter_by = {
                                "name" : "close" //No I18N
                            }
                            return opt;
                        }
                    }
                }
            },
        };
        list.hbs = function(opt) {
            let cb = {
                "pre": REM_PRE_CALLBACKS,//No I18N
            };
            if(module && module.entity) {
                if(module.entity == "home") {//No I18N
                    cb["post"] = REM_POST_CALLBACKS;//No I18N
                }
            }
            return cb;
        };
        list.component = function(opt) {
            let module = $remmodule.module_details;
            let cb = {
                "post": function(formdata) {//No I18N
                    if(module && (module["entity"] == "release"|| module["entity"] == "change")) {//No I18N
                        if(module["type"] == "details") {//No I18N
                            var con = formdata.options && formdata.options.container ? formdata.options.container : formdata.container;
                            jQuery(con).find('.oyh.oxh').removeClass('oyh oxh');//No I18N
                        }
                    }
                },
            };
            return cb;
        };
        return list;
    }
}

class REM_LIST extends MODULE_LIST {
    /**
     * Creates a new REM_LIST instance.
     * @param {object} options - Options for configuring the list.
     * @param {object} json - JSON data.
     */
    constructor(options, json) {
        options.meta = REM_LIST_META; // Set the metadata for the list.
        options.options = REM_LIST_OPTIONS; // Set the list options.

        super(options, json); // Call the constructor of the parent class MODULE_LIST.

        // Return the 'list' property of this instance.
        return this.list;
    }
}


class REM_PRE_CALLBACKS extends MC_CALLBACKS {
    /**
     * Creates a new REM_PRE_CALLBACKS instance for pre-callbacks.
     * @param {object} options - Options for configuring the pre-callbacks.
     * @param {object} json - JSON data.
     */
    constructor(options, json) {
        super({"mode":"list", "type": "pre"}, options, json); // Call the constructor of the parent class MC_CALLBACKS for pre-callbacks. //No I18N
        if (($remmodule.module_details.entity == "release" || $remmodule.module_details.entity == "change") && $remmodule.module_details.type == "details") {
            delete options.additional_options["static-header"];//No I18N
            delete options.additional_options["height"];//No I18N
            delete options.additional_options["width"];//No I18N
        }
        if($remmodule.module_details.entity == "home") {//No I18N
            if(!options.additional_details) {
                options.additional_details = {};
            }
            options.additional_details["custom_class"] = "noborder";//No I18N
        }
        // Return the 'options' object.
        return options;
    }

    /**
     * Pre-callback function to handle pre-processing.
     * @param {object} options - Options for pre-processing.
     * @returns {object} - Processed options.
     */
    precallback(options) {
        super.precallback(options); // Call the pre-callback function of the parent class MC_CALLBACKS.

        return options; // Return the processed options.
    }
}


class REM_POST_CALLBACKS extends MC_CALLBACKS {
    /**
     * Creates a new REM_POST_CALLBACKS instance for post-callbacks.
     * @param {object} options - Options for configuring the post-callbacks.
     * @param {object} json - JSON data.
     */
    constructor(options, json) {
        super({"mode":"list", "type": "post"}, options, json); // Call the constructor of the parent class MC_CALLBACKS for post-callbacks. //No I18N

        // Return the 'options' object.
        return options;
    }

    /**
     * Post-callback function to handle post-processing.
     * @param {object} options - Options for post-processing.
     * @param {object} json - JSON data.
     * @returns {object} - Processed options.
     */
    postcallback(options, json) {
        super.postcallback(options, json); // Call the post-callback function of the parent class MC_CALLBACKS.

        // Remove elements with class "listcontrols" from the JSON data using jQuery.
        jQuery(json).find(".listcontrols").remove(); //No I18N
        widgetbgwdh('#sdphome-reminder-placeholder .widget-bg');//No I18N

        return options; // Return the processed options.
    }
}

