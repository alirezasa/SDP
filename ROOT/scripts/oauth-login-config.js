var $oauth_config = {
    metadata: {},    // To cache the merged metadata
    $iconattachment: new IconAttachment(),

    mapped_property_allowed_values: [{
        id:"WindowsName",    // No I18N
        name: translate("sdp.login.domain.username")
    }, {
        id:"upn",       // No I18N
        name: translate("ae.asset.o365.userprincipalname")
    }, {
        id:"email",        // No I18N
        name: translate("sdp.common.email")
    }],

    render_functions: {
        global_sso_status: function() {
            var sso_status = MC.prototype.ajax("/api/v3/oauth_features/_get_sso_status", 'oauth_feature');        // No I18N
            var sso_tab = jQuery("#oauth_tab");
            sso_tab.find("#dynamic_user_addition_alert").toggleClass('hide', !sso_status.show_dynamic_user_addition_alert);      // No I18N
            sso_tab.find("#redirect_url_alert").toggleClass('hide', !sso_status.show_redirect_url_alert);      // No I18N
            sso_tab.find("#oauth_sso_status").prop('checked', sso_status.oauth_sso_status);      // No I18N
            sso_tab.find("#collapse_login_form_status").prop('checked', sso_status.collapse_login_form).parent().toggleClass('opac5 ptr-ev-none', !sso_status.oauth_sso_status);      // No I18N
        },
        header_is_enabled: function(data, row) {
            var rd = data.row_data;
            var html = '<label class="disp-iflex vmiddle mt-3">' +      //No I18N
                            '<input type="checkbox" class="togglechk" ' + (rd.is_enabled? "checked" : "") + ' data-fid="' + rd.id + '" data-pid="' + rd.provider.id + '" data-event="change" data-handler="$oauth_config.callback_functions.list_toggle_enable(this)"><span class="slide-toggle togg-sm"><span class="switch-toggle"></span></span>' +        //No I18N
                        '</label>';      //No I18N
            return html;
        },
        header_icon: function(data, row) {
            var rd = data.row_data;
            var url = rd.provider.icon ? '/api/v3/oauth_providers/' + rd.provider.id + '/images/' + rd.provider.icon.id : "/images/no-image-icon.svg";       // No I18N
            var html = '<img src="' + url + '" alt="' + e_attr(rd.provider.provider_name) + '" class="vbase icon-lg tf1-2 rounded5 ml5" title="' + e_attr(rd.provider.provider_name) + '" rel="uitip">'
            return html;
        },
        header_provider_name: function(data, row) {
            var rd = data.row_data;
            var e_name = e_html(rd.provider.provider_name)
            var html = `<a href="/" class="a-tag vmiddle text-overflow disp-ib fw" data-event="click" data-handler="MC.load({ from: 'list', mode: 'edit', entity_id: ${rd.id} }, 'oauth_features');"><span rel="uitip" mode_html="true" mode_ellipsis="true" title="${e_attr(e_name)}">${e_name}</span></a>`;
            return html;
        },
        form_redirect_url: function (opt) {
            var input_div = jQuery(opt.container).find("input");
            var html = `<span class="input-group-addon cur-ptr" id="copy_redirect_url">
                            <span rel="uitip" title="${translate('auth.oauth.common.copy.link')}" class="cspr link icon-sm flat"></span>
                        </span>`;
            input_div.attr('readonly', true).after(html);
            input_div.parent().addClass("input-group").find("#copy_redirect_url").off("click.oauth").on("click.oauth", function() {copyToClipboard('for_feature_redirect_url');})       // No I18N
            initTooltip('#copy_redirect_url');      // No I18N
        },
        form_client_secret: function () {
            var mode = FC_Mapper.form_oauth_features_form.options.mode;
            var data = {"display_name": translate('auth.oauth.common.clientsecret'), "name": "client_secret", "edit": mode == "new"}        // No I18N
            return renderhbs(null, 'password-field', data, false, 'admin/password-field', null, null, null, true)      // No I18N
        },
        form_additional_fields: function(opt, fc) {
            jQuery(opt.container).find("label").prepend('<input type="checkbox" id="' + opt.name + '_cb" class="mr10">').attr('for', opt.name + "_cb");        // No I18N
            for (index in fc.entitydata.additional_fields) {
                var field = fc.entitydata.additional_fields[index];
                if(field.sd_field_name == opt.name) {
                    jQuery(opt.container).find("input[type='checkbox']").prop('checked', field.import).data('id', field.id);     // No I18N
                    jQuery(jQuery(opt.container).find("input")[1]).val(field.oauth_field_name);
                }
            }
        }
    },

    callback_functions: {
        onMessageCallback: function(event) {
            try {
                if(event.data.type == "oauth_test_message") {
                    var is_success = event.data.response_status.status == "success";      // No I18N
                    if(is_success) {
                        showalert("success", event.data.result.message, 'isAutoHide='+is_success); // No I18N
                    } else {
                        $notification_popup.handleError({responseJSON:event.data});
                    }
                }
            } catch(e) {}
        },
        global_status_toggle: function(obj) {
            var checked = jQuery(obj).is(":checked");       // No I18N
            var data = {"login_config": [{"parameter": "ENABLED", "category": "OAUTH_SSO", "param_value": checked}]};       // No I18N
            sdpAjax({
                url: "/api/v3/login_config/",        // No I18N
                type: 'PUT', // No I18N
                data: sdpAjaxInputData(data),
                success: (res) => {
                    showalert('success', translate("sdp.admin.common.updatedsuccessfully"), "isAutoHide=true"); // No I18N
                    $oauth_config.render_functions.global_sso_status();
                },
                error: (res) => {
                    jQuery(obj).prop('checked', !checked);      // No I18N
                    try{
                        showalert('failure', res.responseJSON.response_status[0].messages[0].field, 'isAutoHide=false'); // No I18N
                    } catch (e) {
                        showalert('failure', translate("sdp.api.unknown.error"), 'isAutoHide=false'); // No I18N
                    }
                }
            });
        },
        global_form_collapse: function(obj) {
            var checked = jQuery(obj).is(":checked");       // No I18N
            var data = {"login_config": [{"parameter": "COLLAPSE_LOGIN_FORM", "category": "LOGIN_FORM", "param_value": checked}]};       // No I18N
            sdpAjax({
                url: "/api/v3/login_config/",        // No I18N
                type: 'PUT', // No I18N
                data: sdpAjaxInputData(data),
                success: (res) => {
                    showalert('success', translate("sdp.admin.common.updatedsuccessfully"), "isAutoHide=true"); // No I18N
                },
                error: (res) => {
                    jQuery(obj).prop('checked', !checked);      // No I18N
                    showalert('failure', translate("sdp.api.unknown.error"), 'isAutoHide=false'); // No I18N
                }
            });
        },
        list_toggle_enable: function(obj) {
            var cb = jQuery(obj);
            var fid = cb.data("fid");        // No I18N
            var pid = cb.data("pid");        // No I18N
            var checked = cb.is(":checked");       // No I18N
            var data = {"oauth_provider": {"feature": {"id": fid, "is_enabled": checked}}, "for":"AUTHENTICATION"};       // No I18N
            sdpAjax({
                url: "/api/v3/oauth_providers/" + pid,        // No I18N
                type: 'PUT', // No I18N
                data: sdpAjaxInputData(data),
                success: (res) => {
                    showalert('success', translate("sdp.admin.common.updatedsuccessfully"), "isAutoHide=true"); // No I18N
                    $oauth_config.render_functions.global_sso_status();
                    if(checked) {
                        $oauth_config.callback_functions.test_sso(res.oauth_provider.feature.id, res.oauth_provider.feature.feature_info);
                    }
                },
                error: (res) => {
                    cb.prop('checked', !checked);      // No I18N
                    $notification_popup.handleError(res);
                }
            });
        },
        list_inputdata: function(data) {
            data["for"] = "AUTHENTICATION";     // No I18N
            data.list_info.fields_required = ["is_enabled", "provider.icon", "provider.provider_name", "provider.client_id", "provider.endpoint_url", "get_resource_url"];     // No I18N
            return data;
        },
        form_on_provider_change: function (fc, provider_id) {
            sdpAjax({
                url: "/api/v3/oauth_providers/" + provider_id,      // No I18N
                type: 'GET', // No I18N
                success: (res) => {
                    var provider = res.oauth_provider;
                    var provider_div = jQuery('[name="oauth_features"] #provider_div');
                    provider_div.find("[name='provider.endpoint_url']").val(provider.endpoint_url);
                    provider_div.find("[name='provider.client_id']").val(provider.client_id);
                    provider_div.find("[name='provider.token_url']").val(provider.token_url);
                    var url = provider.icon ? '/api/v3/oauth_providers/' + provider.id + '/images/' + provider.icon.id : "/images/no-image-icon.svg";       // No I18N
                    $oauth_config.$iconattachment.iconChoose(url);
                    fc.entitydata.provider = provider;
                }
            });
        },
        form_onSave: function (payload) {
            var fc = FC_Mapper.form_oauth_features_form;
            var provider_div = jQuery("#provider_div");
            var provider_data = {};
            ["provider_name", "endpoint_url", "client_id", "token_url"].forEach(field => {      // No I18N
                var value = provider_div.find("[name='provider." + field + "']").val();
                if(fc.options.mode == 'new') {
                    provider_data[field] = value;
                } else {
                    var current_val = fc.fields['provider.' + field].current_value;
                    current_val = typeof(current_val) == 'object'? current_val.id : current_val;        // No I18N
                    if(current_val != value) {
                        provider_data[field] = value;
                    }
                }
                delete payload["provider." + field];
            });

            if ($oauth_config.$iconattachment.ischanged) {
                var icon_id = $oauth_config.$iconattachment.selectedIcon.split("/").pop();
                provider_data.icon = (!icon_id || icon_id == "no-image-icon.svg") ? null: {"id": icon_id};        // No I18N
            }

            if(payload.client_secret && !jQuery("#input_client_secret").val()) {
                delete payload.client_secret;
            }
            // We will calculate the additional field data in serializer. For now, we just need to know if there is a change in additional fields.
            var is_additional_fields_changed = false;
            for (var key in payload) {
                // Loop through and see if any input are changed already, and remove them all.
                if (key.startsWith("default_fields") || key.startsWith("user_defined_fields")) {
                    is_additional_fields_changed = true;
                    delete payload[key];
                }
            }

            if(!sdp_app.IS_AE && !is_additional_fields_changed) {
                // We'll quickly loop over and check if checkboxes alone have changed
                ['default_fields', 'user_defined_fields'].forEach(prefix => {       // No I18N
                    Object.keys($oauth_config.metadata.fields[prefix]).forEach(field_name => {
                        const fieldKey = prefix + "." + field_name;
                        const checked = jQuery(fc.fields[fieldKey].container.find("input")[0]).prop('checked');
                        for (var index in fc.entitydata.additional_fields) {
                            var field = fc.entitydata.additional_fields[index];
                            if(field.sd_field_name == fieldKey && field.import != checked) {
                                is_additional_fields_changed = true;
                                break;
                            }
                        }
                    });
                });
            }
            if(!jQuery.isEmptyObject(payload)) {
                provider_data.feature = payload;
            }
            if(is_additional_fields_changed) {
                provider_data.additional_fields_changed = true;
            }
            return provider_data;
        },
        form_serializer: function (data, fc) {
            data.oauth_provider = data.oauth_feature;
            delete data.oauth_feature;
            if(data.oauth_provider.feature && data.oauth_provider.feature.hasOwnProperty("mapped_property")) {
                data.oauth_provider.feature.mapped_property = jQuery(fc.fields.mapped_property.element).val();
            }

            if(!sdp_app.IS_AE) {
                // delete the flag even if it's set or not, as we'll serialise all additional fields here
                delete data.oauth_provider.additional_fields_changed
                var additional_fields = [];
                ['default_fields', 'user_defined_fields'].forEach(prefix => {       // No I18N
                    Object.keys($oauth_config.metadata.fields[prefix]).forEach(field_name => {
                        const fieldKey = prefix + "." + field_name;
                        const inputs = fc.fields[fieldKey].container.find("input");
                        const checked = jQuery(inputs[0]).prop('checked');
                        const id = jQuery(inputs[0]).data('id');
                        const val = jQuery(inputs[1]).val();

                        if (val) {
                            var add_data = {
                                "oauth_provider": fc.entitydata.hasOwnProperty('provider') ? fc.entitydata.provider.id : 0,      // No I18N
                                "sd_field_name": fieldKey,        // No I18N
                                "oauth_field_name": val,      // No I18N
                                "import": checked       // No I18N
                            }
                            if(id) {
                                add_data.id = id;
                            }
                            additional_fields.push(add_data);
                        }
                    });
                });
                data.oauth_provider.additional_fields = additional_fields;
            }

            if (fc.options.mode == "new") {
                data.oauth_provider.feature.is_enabled = false;
                data.oauth_provider.feature.feature_redirect_url = jQuery("#for_feature_redirect_url").val();        // No I18N
                data.oauth_provider.feature.error_redirect_url = "/";        // No I18N
                data.oauth_provider.feature.feature_name = "AUTHENTICATION";        // No I18N
            }

            if(fc.entitydata.hasOwnProperty("id") && data.oauth_provider.feature && !data.oauth_provider.feature.hasOwnProperty("id")) {
                data.oauth_provider.feature.id = fc.entitydata.id;
            }

            var provider_name_field = jQuery("[name='provider.provider_name']");
            var provider_id = null;
            var provider_name = null;
            if (fc.entitydata.hasOwnProperty('provider')) {
                provider_id = fc.entitydata.provider.id;
                provider_name = fc.entitydata.provider.provider_name;
            } else if (provider_name_field.data('select2') != undefined) {      // No I18N
                var selected = provider_name_field.select2('data');       // No I18N
                provider_id = selected.provider_id;
                provider_name = selected.provider_name;
            }
            if (provider_id != null) {
                fc.options.save.type = "PUT";    // No I18N
                fc.options.save.url = "/api/v3/oauth_providers/" + provider_id;      // No I18N
                data.oauth_provider.provider_name = provider_name;
            } else {
                fc.options.save.type = "POST";      // No I18N
                fc.options.save.url = "/api/v3/oauth_providers";      // No I18N
            }
            data["for"] = "AUTHENTICATION";     // No I18N
        },
        form_post_serializer: function (data, fc) {
            data.oauth_feature = data.oauth_provider.feature;
            delete data.oauth_provider;
        },
        test_sso: function (id, feature_info) {
            var alias_url = $oauth_config.scheme + "://" + $oauth_config.alias
            if(window.location.origin == alias_url) {
                var has_valid_time = false;
                try {
                    var tested_time = JSON.parse(feature_info).tested_time;
                    // If recently tested but disabled for over 2 days and if enabled, we will test again
                    if (tested_time && (new Date() - new Date(tested_time)) > 2 * 24 * 60 * 60 * 1000) {
                        has_valid_time = false;
                    } else if (tested_time) {
                        has_valid_time = true;
                    }
                } catch(ignored) {
                }
                if(!has_valid_time) {
                    var url = '/servlet/SDOAuthRequestServlet?id=' + id + '&mode=login&test=true';     // No I18n
                    setTimeout(function () {
                        showalert('warning', translate('auth.oauth.test'), 'timeout=5');        // No I18n
                    }, 1000);
                    setTimeout(function () {
                        NewWindow(url, 'preferences', '750', '650', 'yes', 'center');        // No I18n
                    }, 5000);
                }
            } else {
                setTimeout(function () {
                    showalert('warning', translate('auth.oauth.test.warn', [alias_url]), 'isAutoHide=false');        // No I18n
                }, 1000);
            }
        },
        form_enableFeatureField: function(field, disable=false) {
            field.attr("disabled", disable).parent().toggleClass("cur-na", disable).parent().toggleClass("opac5", disable);     // No I18N
        },
        form_afterRender: function (form_comp) {
            // Need to store the form_comp in a variable as it's not available in the inner functions.
            var fc = form_comp;
            var parent_div = jQuery('[name="oauth_features"]');

            var provider_div = parent_div.find("#provider_div");
            var provider_name = provider_div.find("[name='provider.provider_name']");
            var edit_button = provider_div.find("#edit_provider");

            var enableField = $oauth_config.callback_functions.form_enableFeatureField
            var select2Format = function(data) {
                if(!data.hasOwnProperty("provider_id")) {
                    data.provider_id = data.id;
                }
                var url = data.icon ? '/api/v3/oauth_providers/' + data.provider_id + '/images/' + data.icon.id : "/images/no-image-icon.svg";       // No I18N
                var no_image = "/images/no-image-icon.svg" == url;      // No I18N
                return '<img src="' + url + '" alt="'+ e_attr(data.provider_name) +'" class="icon-md ' + (no_image ? 'noimgicon mr3' : '') + ' "> ' + e_html(data.provider_name);
            }

            if(provider_name.val()) {
                edit_button.removeClass("hide");
            } else {
                enableField(provider_name);
                var sel_opt = {
                    cache:{},
                    url:[{
                        url:"/api/v3/oauth_providers",//NO I18N
                        field:'oauth_providers',//NO I18N
                        list_info: {
                            "start_index": 1,       // No I18N
                            "sort_field": "provider_name",      // No I18N
                            "row_count": 100       // No I18N
                        }
                    }],
                    searchInputDataCallback: function (data) {
                        data["for"] = "AUTHENTICATION";     // No I18N
                        return data;
                    },
                    criteriaCallback: function (data) {
                        return {
                            "field": "provider_name",       // No I18N
                            "value": data,      // No I18N
                            "condition": "contains",        // No I18N
                            "logical_operator": "AND"       // No I18N
                        };
                    },
                    processResults: function(search_data, data, field) {
                        if(!data.hasOwnProperty("provider_id")) {
                            data.provider_id = data.id;
                            data.id = data.provider_name;
                        }
                        search_data.push(data);
                    },
                    dropdownCssClass: 'noimgicn-s2',        // No I18N
                    processSearchData: function(search_data) {
                        return search_data.oauth_providers;
                    },
                    formatSelection: function(data) {
                        return select2Format(data);
                    },
                    formatResult: function(data, page) {
                        return select2Format(data);
                    },
                    multiple:false
                };
                provider_name.sdp_select2(sel_opt);
                provider_name.off("select2-open.provider_name").on("select2-open.provider_name", function () {      // No I18N
                    var dropdown = jQuery("#select2-drop");
                    var button = dropdown.find("#add-provider-option");
                    if (!button.length) {
                        // Append the add new option in the dropdown
                        dropdown.append("<div class='select2-filter-option disp-t fw'><div class='disp-c pl10 w-50per'><a href='/' id='add-provider-option'>" + translate('common.addnew') + "</a></div></div>");
                        dropdown.find("#add-provider-option").off("click.provider_add").on("click.provider_add", function (e) {     // No I18N
                            provider_name.off('change.provider_name').select2('destroy')      // No I18N
                            enableField(provider_div.find("input").val(''));
                            // Adding the back button in the top
                            html = '<button id="providers_back_btn" class="btn btn-default btn-xs fl mr10" rel="uitip" title="' + translate("sdp.common.back") + '" aria-label="' + translate("sdp.common.back") + '">' +       // No I18N
                                        '<span class="common-sprite icon-sm common-go-back-icon1"></span>' +
                                    '</button>';
                            jQuery("#oauth_sso_div_popup .zdialog__title").before(html);
                            var back_btn = jQuery("#oauth_sso_div_popup #providers_back_btn");
                            back_btn.off("click.back_btn").on("click.back_btn", function () {       // No I18N
                                enableField(provider_div.find("input").val(''), true);
                                back_btn.remove();
                                enableField(provider_name);
                                provider_name.sdp_select2(sel_opt);
                                provider_name.off('change.provider_name').on('change.provider_name', function (e) {     // No I18N
                                    $oauth_config.callback_functions.form_on_provider_change(fc, e.added.provider_id);
                                })
                            });
                        });
                    }
                }).off('change.provider_name').on('change.provider_name', function (e) {        // No I18N
                    $oauth_config.callback_functions.form_on_provider_change(fc, e.added.provider_id);
                });
            }
            if(!sdp_app.IS_AE) {
                setTimeout(function() {
                    var mapped_property = jQuery('[name="mapped_property"]');
                    $oauth_config.callback_functions.form_on_mapped_property_change(fc, mapped_property.val());
                }, 10);
            }
        },
        form_provider_edit: function () {
            var provider_div = jQuery("#provider_div");
            var edit_button = provider_div.find("#edit_provider");
            $oauth_config.callback_functions.form_enableFeatureField(provider_div.find('[name="provider.endpoint_url"], [name="provider.client_id"], [name="provider.token_url"]'));
            edit_button.addClass("hide");
        },
        form_on_mapped_property_change: function (fc, selectedValue) {
            fc.removeMandatoryField("default_fields.login_name");       // No I18N
            fc.enableField("default_fields.login_name");        // No I18N
            fc.enableField("default_fields.domain");        // No I18N
            fc.enableField("default_fields.email_id");      // No I18N
            fc.fields['default_fields.login_name'].container.removeClass('cur-na').find("input[type='checkbox']").attr('disabled', false)     // No I18N
            fc.fields['default_fields.domain'].container.removeClass('cur-na').find("input[type='checkbox']").attr('disabled', false)         // No I18N
            fc.fields['default_fields.email_id'].container.removeClass('cur-na').find("input[type='checkbox']").attr('disabled', false)     // No I18N

            if(selectedValue == "WindowsName") {
                fc.disableField("default_fields.login_name");       // No I18N
                fc.disableField("default_fields.domain");       // No I18N
                fc.fields['default_fields.login_name'].container.addClass('cur-na').find("input[type='checkbox']").attr('disabled', true)     // No I18N
                fc.fields['default_fields.domain'].container.addClass('cur-na').find("input[type='checkbox']").attr('disabled', true)         // No I18N
            } else {
                if (selectedValue == "email") {
                    fc.disableField("default_fields.email_id");     // No I18N
                    fc.fields['default_fields.email_id'].container.addClass('cur-na').find("input[type='checkbox']").attr('disabled', true)     // No I18N
                }
                if($oauth_config.is_dynamic_user_addition_enabled) {
                    fc.fields['default_fields.login_name'].container.find("input[type='checkbox']").prop('checked', true).attr('disabled', true);     // No I18N
                    fc.addMandatoryField("default_fields.login_name");      // No I18N
                }
            }
        },
        form_mapped_property: function (field) {
            var fc = this;
            jQuery(field.element).off('change.form_mapped_property').on('change.form_mapped_property', function(e) {        // No I18N
                var selectedValue = jQuery(this).val();
                $oauth_config.callback_functions.form_on_mapped_property_change(fc, selectedValue);
            });
        }
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class OAUTH_LIST_META_HEADER {
    constructor(list, options) {
        let list_opt = {
            "add": {//No I18N
                "enable": true,      // No I18N
            },
            "bulk_selection": {     // No I18N
                "enable": false     // No I18N
            },
            "t_searchicon": {//No I18N
                "enable": true,//No I18N
                "custom_class": "fl"//No I18N
            },
            "pagination_comp": {//No I18N
                "enable": true,//No I18N
                "custom_class": "btn-group"//No I18N
            }
        };
        return list_opt || list;
    }
}

class OAUTH_LIST_META_CELLS {
    constructor(list, options) {
        list.cells.static_cells["checkbox"] = false; //No I18N
        var field_meta = $oauth_config.metadata.fields;
        list.cells.fields_required = {
            "is_enabled": {     // No I18N
                "default": "true",      // No I18N
                "width": "20px",        // No I18N
                "type": "icon", //No I18N
                "data-celltransformer": "$oauth_config.render_functions.header_is_enabled"      //No I18N
            },
            "icon": {     // No I18N
                "default": "true",      // No I18N
                "width": "30px",        // No I18N
                "type": "icon", //No I18N
                "data-celltransformer": "$oauth_config.render_functions.header_icon"//No I18N
            },
            "provider_name": {      // No I18N
                "default": "true",      // No I18N
                "value_path": "provider.provider_name",        // No I18N
                "width": "200px",        // No I18N
                "text": field_meta.provider.provider_name.display_key,       // No I18N
                "data-celltransformer": "$oauth_config.render_functions.header_provider_name"//No I18N
            },
            "client_id": {      // No I18N
                "default": "true",      // No I18N
                "width": "200px",        // No I18N
                "text": field_meta.provider.client_id.display_key,       // No I18N
                "value_path": "provider.client_id"      // No I18N
            },
            "endpoint_url": {       // No I18N
                "default": "true",       // No I18N
                "width": "200px",        // No I18N
                "text": field_meta.provider.endpoint_url.display_key,       // No I18N
                "value_path": "provider.endpoint_url"      // No I18N
            },
            "get_resource_url": {       // No I18N
                "width": "200px",        // No I18N
                "text": field_meta.get_resource_url.display_key,       // No I18N
                "default": "true"       // No I18N
            }
        }
        return list;
    }
}

class OAUTH_LIST_META_AO {
    constructor(list, options) {
        let ao = {
            "handle-window-resize": true, //No I18N
            "width": jQuery('#oauth_sso_div').width() - 20, //No I18N
            "personalize_key": "oauth_feature",     // No I18N
            "callback-inputdata": "$oauth_config.callback_functions.list_inputdata" //No I18N
        };
        return {"additional_options": ao}; //No I18N
    }
}

class OAUTH_LIST_META extends MODULE_LIST_META {
    constructor(list, options, json) {
        list.cells = OAUTH_LIST_META_CELLS;
        list.additional_options = OAUTH_LIST_META_AO;
        list.header.actions = OAUTH_LIST_META_HEADER;
        super(list, options, json);
        return this;
    }
}

class OAUTH_LIST extends MODULE_LIST {
    constructor(options, json) {
        options.meta = OAUTH_LIST_META;
        super(options, json);
        return this.list;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class OAUTH_FORM extends MODULE_FORM {
    constructor(form, options) {
        var layouts = {
            "layouts": [{       // No I18N
                "name": "oauth_form",       // No I18N
                "sections": [{      // No I18N
                    "column_count": "2",       // No I18N
                    "fields": [        // No I18N
                        { "name": "provider.provider_name","position": {"col": 1, "row": 1}},        // No I18N
                        { "name": "provider.endpoint_url","position": {"col": 1, "row": 1}},     // No I18N
                        { "name": "provider.client_id","position": {"col": 2, "row": 1}},        // No I18N
                        { "name": "provider.token_url","position": {"col": 2, "row": 1}}        // No I18N
                    ],
                    "style_properties": {       // No I18N
                        "section_style": {"padding": "20px"},       // No I18N
                        "field_style": {"field_align": "top"}       // No I18N
                    },
                    "custom_section": true,        // No I18N
                    "partial": 'oauth-feature-config',       // No I18N
                    "has_fields": true        // No I18N
                },
                {
                    "column_count": "2",       // No I18N
                    "name": translate('sdp.app.asset.details', [translate('auth.oauth.feature')]),    // No I18N
                    "fields": [     // No I18N
                        { "name": "scope","position": {"col": 1, "row": 1}},        // No I18N
                        { "name": "client_secret","position": {"col": 2, "row": 1}},        // No I18N
                        { "name": "user_property","position": {"col": 1, "row": 1}},        // No I18N
                        { "name": "mapped_property","position": {"col": 2, "row": 1}},      // No I18N
                        { "name": "get_resource_url","position": {"col": 1, "row": 1}},     // No I18N
                        { "name": "feature_redirect_url","position": {"col": 2, "row": 1}}     // No I18N
                    ],
                    "style_properties": {       // No I18N
                        "section_style": {"padding": "20px"},       // No I18N
                        "field_style": {"field_align": "top"}       // No I18N
                    }
                }]
            }]
        };
        if(!sdp_app.IS_AE) {
            layouts.layouts[0].sections.push({
                "custom_section": true,        // No I18N
                "section_html": '<div class="form-section noborder">' +     // No I18N
                 '<div class="section-title p10 mb0" style="font-size: 15px;">' + translate('sdp.admin.leftpanel.customfields.home') + '<hr class="mt5 mb5"></div>'  +     // No I18N
                 '<div class="p10"><div class="alert alert-info icon mb0" role="alert"><span class="msg">' + translate('oauth.fields.info') + '</span></div></div>' +
                '</div>'
            });

            ["default_fields", "user_defined_fields"].forEach(type => {     // No I18N
                var fields = [];
                Object.keys($oauth_config.metadata.fields[type])
                .sort((a, b) => {
                    if(type == 'default_fields') {
                        return $oauth_config.metadata.fields.default_fields[a].display_index - $oauth_config.metadata.fields.default_fields[b].display_index
                    } else {
                        return 0;
                    }
                }).forEach((key, index) => {
                    fields.push({"name": type + "." + key, "position": { "col": 1 + index % 2, "row": 1 + Math.floor(index / 2)}});       // No I18N
                });

                if(type == 'user_defined_fields' && fields.length == 0) {
                    var link = sdp_app.IS_MDH_SETUP ? "/ESM.do?type=users-udf" : "/app#/admin/additional-fields/user";     // No I18N
                    var info = '<div class="p10"><div class="alert alert-info icon mb5" role="alert">' +     //No I18N
                                    '<span class="msg">' + translate('sso.udf.empty') + ' <a target="_blank" href="' + link + '" rel="noopener" >' + translate('sdp.inventory.home.scan.configurenow') + '</a></span>' +     //No I18N
                               '</div></div>';   //No I18N
                    var html = '<div class="form-section noborder">' +     // No I18N
                        '<div class="section-title p10 mb0" style="font-size: 15px;">' + translate('saml.fields.udf.title') + '<hr class="mt5 mb5"></div>'  + info    // No I18N
                    '</div>'
                    layouts.layouts[0].sections.push({
                        "custom_section": true,        // No I18N
                        "section_html": html   // No I18N
                    })
                } else {
                    layouts.layouts[0].sections.push({
                        column_count: "2", // No I18N
                        name: translate(type == 'default_fields' ? 'saml.fields.default.title' : 'saml.fields.udf.title'), // No I18N
                        fields: fields,
                        style_properties: {
                            section_style: { padding: "20px" }, // No I18N
                            field_style: { field_align: "left" } // No I18N
                        }
                    });
                }
            });
        }

        let frm = {
            "meta": {       // No I18N
                "entity_name": "oauth_feature",//No I18N
                "layout_customization": function(opt) {//No I18N
                    opt.template = {"layouts": layouts};        // No I18N
                    return opt;
                }
            },
            "options": {        // No I18N
                "hbs": {        // No I18N
                    "callback": {       // No I18N
                        "pre": function(opt, mode) {        // No I18N
                            opt.form_data.metadata = jQuery.extend(true, {}, $oauth_config.metadata);
                            if(mode == 'edit') {
                                var provider = opt.form_data.entitydata.provider;
                                var feature_id = opt.form_data.entitydata.id;
                                jQuery.extend(opt.form_data.entitydata, provider);
                                opt.form_data.entitydata.id = feature_id;
                                // To allow the mapped property to be rendered properly as select2 field.
                                for(var i=0; i<$oauth_config.mapped_property_allowed_values.length; i++) {
                                    var json = $oauth_config.mapped_property_allowed_values[i];
                                    if(json.id.toUpperCase() == opt.form_data.entitydata.mapped_property.toUpperCase()) {
                                        opt.form_data.entitydata.mapped_property = json;
                                        break;
                                    }
                                }
                            }
                            return opt;
                        },
                        "post": function(opt) {     // No I18N
                            return opt;
                        }
                    }
                },
                "component": {//No I18N
                    "callback": {//No I18N
                        "pre": function(opt) {//No I18N
                            opt.allowedValues = {
                                "mapped_property": $oauth_config.mapped_property_allowed_values      // No I18N
                            };
                            opt.save.onsave = $oauth_config.callback_functions.form_onSave;
                            opt.save.serializer = $oauth_config.callback_functions.form_serializer;
                            opt.save.postserializer = $oauth_config.callback_functions.form_post_serializer;
                            var original_postsuccess = opt.save.postsuccess;
                            opt.save.postsuccess = function(data, fc) {
                                $oauth_config.callback_functions.test_sso(data.oauth_feature.id, data.oauth_feature.feature_info);
                                original_postsuccess(data, fc);
                            };
                            opt.save.errorinterrupt = function(response) {
                                if(typeof(response.response_status.messages[0].message) === 'object') {
                                    response.response_status.messages[0] = response.response_status.messages[0].message.response_status.messages[0];
                                }
                                if(response.response_status.messages[0].fields && response.response_status.messages[0].fields[0] == 'provider_name') {
                                    response.response_status.messages[0].fields[0] = 'provider.provider_name';      // No I18N
                                }
                                return true;
                            }
                            opt.afterRenderCallback = $oauth_config.callback_functions.form_afterRender;
                            opt.edit = {"fields": {}};      // No I18N
                            ['default_fields', 'user_defined_fields'].forEach(fieldType => {        // No I18N
                                for (var field in opt.metadata.fields[fieldType]) {
                                    opt.edit.fields[fieldType + '.' + field] = { "post": $oauth_config.render_functions.form_additional_fields };       // No I18N
                                }
                            });
                            opt.edit.fields.feature_redirect_url = {"post": $oauth_config.render_functions.form_redirect_url};      // No I18N
                            opt.edit.fields.get_resource_url = {"custom_rules": [{"rule_name":"url2", "rule_value":true}]};      // No I18N
                            opt.edit.fields["provider.token_url"] = {"custom_rules": [{"rule_name":"url2", "rule_value":true}]};      // No I18N
                            opt.edit.fields["provider.endpoint_url"] = {"custom_rules": [{"rule_name":"url2", "rule_value":true}]};      // No I18N
                            if(!sdp_app.IS_AE) {
                                opt.edit.fields.mapped_property = {"post": $oauth_config.callback_functions.form_mapped_property};      // No I18N
                            }
                            return opt;
                        },
                        "post": function(fc, opt) {//No I18N
                            var icons = [];
                            var icon_data = MC.prototype.ajax("api/v3/oauth_providers/icon", 'icon');       // No I18N
                            for (var i=0; i < icon_data.length; i++) {
                                icons.push(icon_data[i]["content-url"]);
                            }
                            var selected_icon = "";
                            if(fc.entitydata.icon) {
                                selected_icon = '/api/v3/oauth_providers/' + fc.entitydata.provider.id + '/images/' + fc.entitydata.icon.id;     // No I18N
                            }
                            const icon_opt = {
                                "display_type": "icon",     //No I18N
                                "servlet_url": "/api/v3/oauth_providers/images",     //No I18N
                                "upload_param": "input_image",      //No I18N
                                "allowed_ext": ["jpeg","jpg","png","gif"],      //No I18N
                                "accept_mimes": "image/png,image/jpeg,image/gif",     //No I18N
                                "type": "image",        //No I18N
                                "is_new_ui": true,        //No I18N
                                "selectedIcon": selected_icon,      //No I18N
                                "customClass": "nofltr-popup",       //No I18N
                                "uploadTab_alone": false,       //No I18N
                                "popover": true,        //No I18N
                                "default_icon_url": "/",     // No I18N
                                "recommended_resolution": '120px X 120px',      //No I18N
                                "icons": icons,     // No I18N
                                "max_file_size": 3,     //No I18N
                                "max_upload_length": 1      //No I18N
                            };
                            $oauth_config.$iconattachment.init(icon_opt);

                            if(!sdp_app.IS_AE && !jQuery.isEmptyObject($oauth_config.metadata.fields.user_defined_fields)) {
                                var warning = '<div class="p10"><div class="alert alert-warning icon mb5" role="alert">' +     //No I18N
                                                '<span class="msg">' + translate('sso.udf.info') + '</span>' +     //No I18N
                                           '</div></div>';
                                jQuery("#" + fc.container + " .section-title").last().after(warning);
                            }
                            if(sdp_user.DIRECTION == 'RTL') {
                                jQuery("#oauth_features_form label").css("text-align", "right");        // No I18N
                            }
                            return fc;
                        }
                    }
                },
                "popupoption": {        // No I18N
                    "callback": {       // No I18N
                        "beforeopen": function(opt) {       // No I18N
                            opt.width = '80%';
                            return opt;
                        }
                    }
                }
            }
        }
        super(frm, options);
        return this.form;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

jQuery.extend($oauth_config, {
    init: function() {
        Handlebars.registerPartial("oauth-feature-config", renderhbs(null, 'oauth-feature-config', null, false, 'admin/oauth-sso', null, null, null, true));	//No I18N

        var feature_meta = MC.prototype.ajax("/api/v3/oauth_features/metainfo", 'metainfo');        // No I18N
        $oauth_config.metadata = {"fields": feature_meta.fields};      // No I18N

        var provider_meta = MC.prototype.ajax("/api/v3/oauth_providers/metainfo", 'metainfo');      // No I18N
        for(field_name in provider_meta.fields) {
            $oauth_config.metadata.fields.provider[field_name] = provider_meta.fields[field_name];
        }

        $oauth_config.metadata.fields.client_secret.custom_render = $oauth_config.render_functions.form_client_secret;

        var field_map_meta = MC.prototype.ajax("/api/v3/oauth_field_map_entries/metainfo", 'metainfo');        // No I18N
        $oauth_config.metadata.fields.default_fields = field_map_meta.default_fields;
        for(field_name in field_map_meta.default_fields) {
            $oauth_config.metadata.fields.default_fields[field_name].display_name = translate(field_map_meta.default_fields[field_name].display_key);
            $oauth_config.metadata.fields.default_fields[field_name].constraints = {"max_length": "500"};       // No I18N
        }
        $oauth_config.metadata.fields.user_defined_fields = field_map_meta.user_defined_fields
        for(field_name in field_map_meta.user_defined_fields) {
            $oauth_config.metadata.fields.user_defined_fields[field_name].constraints = {"max_length": "500"};      // No I18N
        }

        $oauth_config.render_functions.global_sso_status();
        window.addEventListener("message", (event) => {
            $oauth_config.callback_functions.onMessageCallback(event);
        });
    },

    commonjson: {
        "container": "#oauth_sso_div",      // No I18N
        "mode": "list",     // No I18N
        "name": "oauth_features",       // No I18N
        "module": "oauth_features",     // No I18N
        "permissions": {        //No I18N
            "add": true,    //No I18N
            "delete": true,    //No I18N
            "edit": true    //No I18N
        },
        "base_path": "/api/v3",     // No I18N
        "in_active": false,     // No I18N
        "is_trash": false,      // No I18N
        "display_name": translate('auth.oauth.configuration'),      // No I18N
        "entity_name": "oauth_feature",     // No I18N
        "model": "add,edit",     // No I18N
        "skipmetacall":true,        // No I18N

        "list": OAUTH_LIST,     // No I18N
        "form": OAUTH_FORM     // No I18N
    }
});