/* $Id$ */
// This file contains common configurations for form fields.
FC.config = {
    //Handles Technicians/Users field with status filter buttons
    "techStatus": {
        formatResult: function (item) {
            return FC.config.techStatus.formater(item);
        },
        formatSelection: function (item) {
            return FC.config.techStatus.formater(item, true);
        },
        formater: function (item, isSelection) {
            var status = item.status;
            var statusTitle = ""; //No I18N
            var statusIcon = ""; //No I18N
            var name = item.name || item.text;
            switch (status) {
                case 0:
                    statusTitle = translate("sdp.techMarking.logout"); //No I18N
                    statusIcon = "logedicon"; //No I18N
                    break;
                case 1:
                    statusTitle = translate("sdp.techMarking.online"); //No I18N
                    statusIcon = "onlineicon btn-success"; //No I18N
                    break;
                case 2:
                    statusTitle = translate("sdp.techMarking.offline"); //No I18N
                    statusIcon = "offlineicon btn-secondary"; //No I18N
                    break;
            }
            if (item.leave) {
                statusTitle = translate("sdp.techMarking.leave"); //No I18N
                statusIcon = "cspr icon-xs leave-icon vmiddle wmask-cspr"; //No I18N
            }
            var optionHtml = `<div class='disp-flex valign-center gap-5'><div title='${statusTitle}' rel='uitip' class='disp-flex flex1 valign-center gap-5 ${isSelection ? "oxh" : ""}'><span class='${statusIcon} shrink0'></span> ${e_html(name)}</div>`; //No I18N
            if (item.id && item.id !== "0" && item.id !== "-1") { //No I18N
                optionHtml += `<span class='icon-sm th-technician-mask wmask-cspr shrink0' data-id='${item.id}' rel='uitip' title='${translate("common.viewdetails")}'></span>`; //No I18N
            }
            optionHtml += "</div>"; //No I18N
            optionHtml = jQuery(optionHtml);
            optionHtml.uitooltip({
                content: function () {
                    var element = jQuery(this);
                    return element.attr('title');    //NO I18N
                },
                track: true,
                show: {
                    delay: 50
                },
                tooltipClass: "uitip" //No I18N
            });
            return optionHtml;
        },
        processResults: function (search_data, data) {
            var item = {
                id: data.id,
                name: data.name
            };
            if (data.id != "0") {
                item.status = data.status || 0;
            }
            if (data.is_online) {
                item.status = parseInt(data.is_online);
            }
            if (data.id && FC.config.techs_on_leave && FC.config.techs_on_leave[data.id]) {
                item.leave = true;
            }
            search_data.push(item);
        },
        handleFilter: function (selectEle, fetchFromAPI, fieldData) {
            var status_div = "<div class='select2-filter-option disp-flex valign-center p5'>" + //No I18N
                "<div class='w-50per'>" +
                "<label class='disp-iflex valign-center cur-ptr'>" +
                "<input type='radio' name='filter' value='off'>" + translate('sdp.common.showall') +
                "</label>" +
                "</div>" +
                "<div class='w-50per'>" +
                "<label class='disp-iflex valign-center cur-ptr'>" +
                "<input type='radio' name='filter' value='on'>" + translate('sdp.techMarking.online') +
                "</label>" +
                "</div>" +
                "</div>";
            selectEle.off("select2-opening.status").on("select2-opening.status", function (ev) {  //No I18N
                handleIcon(event, ev); //No I18N
                var dropdown = selectEle.select2("dropdown");   //NO I18N
                !dropdown.find(".select2-filter-option").length && dropdown.append(status_div);

                if (fieldData.online) {
                    dropdown.find("input[value='on']").prop("checked", true); //No I18N
                } else {
                    dropdown.find("input[value='off']").prop("checked", true); //No I18N
                }

            });
            selectEle.select2("container").find(".select2-drop").on("click", "label", function (event) {    //No I18N
                event.stopPropagation();
                var $target = jQuery(this);
                var online = $target.find('input').val() === "on";  //No I18N
                fieldData.online = online;
                if (fetchFromAPI) {

                    selectEle.select2("close"); //No I18N
                    jQuery(fieldData.element).data().sdp_select2.cache = {};    //No I18N
                    selectEle.select2("open");  //No I18N
                } else {
                    if (online) {    //No I18N
                        jQuery('.select2-results li div').each(function (index) {    //No I18N
                            if (index >= 1) {
                                return;
                            }
                            var $this = jQuery(this);
                            $this.parent().toggleClass('hide', !$this.parent().find('span').hasClass('onlineicon')); //No I18N
                        });
                    } else {
                        jQuery('.select2-results li div').removeClass('hide');  //No I18N
                    }
                }
            });
            selectEle.off("select2-selecting.status").on("select2-selecting.status", function (ev) {  //No I18N
                handleIcon(event, ev); //No I18N
            });

            function handleIcon(event, ev) {
                var $target = jQuery(event.srcElement);
                if ($target.hasClass("th-technician-mask")) {
                    ev.preventDefault();
                    var techId = $target.data("id"); //No I18N
                    NewWindow('/setup/UsersPopup.jsp?isUser=false&viewType=mydetails&userId=' + techId, 'TechnicianDetails', '450', '500', 'yes', 'center', null, null, null, true);    //No I18N
                }
            }
        }
    },
    //Handle Priority field in color in dropdown & selection
    "priority": {
        processResults: function (search_data, data) {
            search_data.push({
                id: data.id,
                name: data.translated_name || data.name,
                color: data.color
            });
        },
        formatResult: function (item) {
            return FC.config.priority.formater(item);
        },
        formatSelection: function (item) {
            return FC.config.priority.formater(item);
        },
        formater: function (item) {
            var optionHtml = jQuery("<div class='disp-flex valign-center'>" + (item.color ? "<em class='icon-xs rounded3 top0 mr5'></em>" : "") + "<span>" + e_html(item.name) + "</span></div>"); //No I18N
            optionHtml.find("em").css("background-color", item.color);  //No I18N
            return optionHtml;
        }
    },
    //Handle Site field in department
    "department": {
        formatResult: function (data) {
            if (FC.config.department.display_fields) {
                var obj = {
                    "display_fields": FC.config.department.display_fields, // No I18N
                    "lookup_field": FC.config.department.lookup_field, // No I18N
                    "type": FC.config.department.type  // No I18N
                };
                return cl_form.formater(data, true, '', obj);
            } else {
                return '<span>' + e_html(data.name) + (data.site ? ', ' + e_html(data.site.name) : '') + '</span>'; // No I18N
            }
        },
        formatSelection: function (data, grid) {
            if (FC.config.department.display_fields) {
                var obj = {
                    "display_fields": FC.config.department.display_fields, // No I18N
                    "lookup_field": FC.config.department.lookup_field, // No I18N
                    "type": FC.config.department.type  // No I18N
                };
                return cl_form.formater(data, false, grid, obj);
            } else {
                let itemText = data.name;
                if (data.site && !data.name.includes(', ' + e_html(data.site.name))) {
                    itemText += ', ' + data.site.name;
                }
                return '<span>' + e_html(itemText) + '</span>'; // No I18N
            }
        },
        formatValue: function (data, display_value) {
            if (!data) {
                return display_value || '-'; // No I18N
            }
            let text;
            if (Array.isArray(data)) {
                let copyData = data.slice();
                text = copyData.map(function (item) {
                    let itemText = FC.config.department.display_fields ? e_html(item.name) : e_html(item.name);
                    if (item.site && !item.name.includes(', ' + e_html(item.site.name))) {
                        itemText += ', ' + e_html(item.site.name);
                    }
                    return itemText;
                }).join(' | ');
            } else {
                text = FC.config.department.display_fields ? e_html(data.name) : e_html(data.name) + (data.site ? ', ' + e_html(data.site.name) : '');
            }
            return text;
        },
        processResults: function (search_data, data) {
            if (FC.config.department.display_fields) {
                cl_form.processResults(search_data, data, FC.config.department.display_fields);
            } else {
                search_data.push({
                    id: data.id,
                    name: data.name,
                    site: data.site
                });
            }
        },
    },
    skipFormAlert: false //Whether to skip form alert or not
};

if (typeof sdp_user !== "undefined" && (sdp_user.USERTYPE === "Technician") && !window.isMSP) {
    FC.config.site = {
        "selection_handler": "FC.config.site.siteSelector",	// No I18N
        "selection_icon_class": "sdp-glyph sdp-glyph-home icon-sm",	//No I18N
        "selection_title": translate("sdp.asset.assignOwner.chooseSite"),	//No I18N
        "site_events": [],
        "siteSelector": function (formalias) {
            closeCalDialog();
            if (jQuery("#siteDialog").length === 0) {
                jQuery("body").append("<div id='siteDialog' class='hide'></div>");	//No I18N
            }
            let $dialog = jQuery("#siteDialog");    //No I18N
            $dialog.empty();
            let dialog_options = {
                title: translate("common.site_list"), //No I18N
                open() {
                    delete WebComponents.instancePool["fc_site_popup"]; //No i18N
                    FC.config.sitePopup.init(formalias);
                },
                draggable: false
            };
            $dialog.removeClass("hide").sdp_zcomponent_dialog(dialog_options);  //No I18N
        }
    };
    FC.config.sitePopup = {
        /**
         * Method to initialize site list popup content
         * @param {String} formalias form alias for reference 
         */
        init: function (formalias) {
            let sp_ref = FC.config.sitePopup;
            let url = FC_Mapper[formalias].metadata.fields.site.href;
            if (url.startsWith("/")) {
                url = url.substring(1);
            }
            let data = {
                url: url,
                isNotAssociatedSiteAvailable: (sdp_user.ROLES.includes("Resources not in any site") || sdp_user.ROLES.includes("SDAdmin"))  //No I18N
            }
            //If default site is hidden in form config hide the button
            if (FC_Mapper[formalias].fields.site.hideDefaultSite) {
                data.isNotAssociatedSiteAvailable = false;
            }
            let $dialog = jQuery("#siteDialog");    //No I18N
            if (jQuery(".ui-dialog").length !== 0 && jQuery(".ui-dialog").is(":visible")) { //No I18N
                jQuery(".zdialog--overlay ").css("cssText", "z-index: 103 !important"); //No I18N
                let siteDialogCss = $dialog.attr("style");    //No I18N
                $dialog.css("cssText", siteDialogCss + "; z-index: 104 !important"); //No I18N
            }
            let dialog_content = renderhbs(null, "form-site-dialog", data, true, "form", false, true, '', true); // NO I18N
            $dialog.find(".zdialog__content").html(dialog_content);   //No I18N
            WebComponents.render("fc_site_popup");    //NO I18N

            //Bind Events

            $dialog.find(".fc_search_btn").off("click.site").on("click.site", function () {
                let val = $dialog.find(".fc_search_text").val();    //No I18N
                sp_ref.search(val);
            }).end().find(".fc_search_text").off("keydown.site").on("keydown.site", function (event) {
                if (event.which === 13) { // Enter key pressed
                    let val = $dialog.find(".fc_search_text").val(); //No I18N
                    sp_ref.search(val);
                }
            }).end().find(".fc_no_site").off("click.site").on("click.site", function () {
                sp_ref.updateSelectedSite(-1, formalias);
            });
            $dialog.off("click.fc").on("click.fc", ".fc_site_cell", function () {
                let siteId = jQuery(this).data("id"); //No I18N
                sp_ref.updateSelectedSite(siteId, formalias);
            });
        },
        /**
         * Method to construct site column in site list table
         * @param {Object} table_data data refence  
         * @returns sire cell html
         */
        siteColumn: function (table_data) {
            let rowData = table_data.row_data;
            return '<button type="button" class="btn btn-link txt-dec-none-i text-color4 p0 fc_site_cell" data-id="' + rowData.id + '">' + e_html(rowData.name) + '</button>'; // NO I18N
        },
        /**
         * Method to construct row inputdata for site list table
         * @param {Object} table_info Table criteria info 
         * @returns table info for API call
         */
        rowDataConstruct: function (table_info) {
            table_info = {
                "fields_required": ["name", "region"], // NO I18N
                "list_info": {
                    "search_criteria": [{ "field": "id", "condition": "is not", "values": ["-1"] }] // NO I18N
                }
            };
            return table_info;
        },
        /**
         * Method to handle user search
         * @param {String} input value provided by user 
         */
        search: function (input) {
            let instance = WebComponents.getInstance("fc_site_popup"); //NO I18N
            instance.t_obj.table_info.list_info.search_criteria = [
                { "field": "id", "condition": "is not", "values": ["-1"], "logical_operator": "and" }, //NO I18N
                { "field": "name", "condition": "like", "values": [input], "logical_operator": "and" } // NO I18N
            ];
            instance.changeFilterString("clearOnly"); // NO I18N
            instance.refreshTable("search"); //NO I18N
        },
        /**
         * Callback method provided for table component criteria construction
         */
        callbackSearchFunction: function () {
            let instance = WebComponents.getInstance("fc_site_popup"); //NO I18N
            // convert search_fields into search_criteria
            instance.t_obj.table_info.list_info.search_criteria = [{ "field": "id", "condition": "is not", "values": ["-1"], "logical_operator": "and" }]; //NO I18N
            if (instance.t_obj.table_info.list_info.search_fields) {
                let search_criteria = instance.convertFieldsIntoCriteria(instance.t_obj.table_info.list_info.search_fields);
                instance.t_obj.table_info.list_info.search_criteria.push(search_criteria);
                delete instance.t_obj.table_info.list_info.search_fields;
            }
            instance.refreshTable('search'); // NO I18N
        },
        /**
         * Method to update selected site in form
         * @param {String} siteId selected site id
         * @param {String} formalias form alias for reference
         */
        updateSelectedSite: function (siteId, formalias) {
            let $dialog = jQuery("#siteDialog");    //No I18N
            let self = FC_Mapper[formalias];
            let siteRef = self.fields.site;
            let instance = WebComponents.getInstance("fc_site_popup"); //NO I18N

            let siteName = instance.loadedRecords[siteId] ? instance.loadedRecords[siteId].name : null;
            if (siteId === -1) {
                siteId = "0";   //No I18N
                siteName = translate('common.site.nosite'); //No I18N
            }
            let current_value = siteRef.current_value ? siteRef.current_value.id : "0"; //No I18N
            let isChanged = siteId != current_value;
            self.setFieldValue("site", { id: siteId.toString(), name: siteName });	//No I18N
            jQuery(siteRef.element).select2("focus"); //No I18N
            //To handle FAFR events
            if (isChanged && siteRef.site_events.length) {
                siteRef.site_events.forEach(event_id => {
                    jQuery(siteRef.element).trigger("change." + event_id); //No I18N
                });
            }
            $dialog.sdp_zcomponent_dialog("close");   //No I18N
            $dialog.addClass("hide");   //No I18N
        }
    };
}
