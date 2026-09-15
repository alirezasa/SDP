class OAUTH_LIST_META_HEADER {
    constructor(list, options) {
        let list_opt = {
            "add": {//No I18N
                "enable": true       // No I18N
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
        list.cells.static_cells.checkbox = false; //No I18N
        var field_meta = $oauth_provider.metadata.fields;
        list.cells.fields_required = {
            "icon": {     // No I18N
                "default": "true",      // No I18N
                "type": "icon", //No I18N
                "data-celltransformer": "$oauth_provider.header_icon_render"      // No I18N
            },
            "provider_name": {      // No I18N
                "default": "true",      // No I18N
                "data-celltransformer": "$oauth_provider.provider_name_render",      // No I18N
                "width": "200px",        // No I18N
                "text": field_meta.provider_name.display_key       // No I18N
            },
            "client_id": {      // No I18N
                "default": "true",      // No I18N
                "width": "200px",        // No I18N
                "text": field_meta.client_id.display_key       // No I18N
            },
            "endpoint_url": {       // No I18N
                "default": "true",       // No I18N
                "width": "200px",        // No I18N
                "text": field_meta.endpoint_url.display_key       // No I18N
            }
        }
        return list;
    }
}

class OAUTH_LIST_META_AO {
    constructor(list, options) {
        let ao = {
            "handle-window-resize": true, //No I18N
            "width": jQuery('#oauth_provider_div').width() - 20, //No I18N
            "callback-inputdata": "$oauth_provider.list_inputdata", //No I18N
            "personalize_key": "oauth_provider"
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
                    "column_count": "1",       // No I18N
                    "fields": [        // No I18N
                        { "name": "provider_name","position": {"col": 1, "row": 1}},        // No I18N
                        { "name": "endpoint_url","position": {"col": 1, "row": 1}},     // No I18N
                        { "name": "client_id","position": {"col": 1, "row": 2}},        // No I18N
                        { "name": "token_url","position": {"col": 1, "row": 2}}        // No I18N
                    ],
                    "style_properties": {       // No I18N
                        "section_style": {"padding": "20px"},       // No I18N
                        "field_style": {"field_align": "top"}       // No I18N
                    },
                    "has_fields": true        // No I18N
                }]
            }]
        };

        let frm = {
            "meta": {       // No I18N
                "entity_name": "oauth_provider",//No I18N
                "layout_customization": function(opt) {//No I18N
                    opt.template = {"layouts": layouts};        // No I18N
                    return opt;
                }
            },
            "options": {        // No I18N
                "hbs": {        // No I18N
                    "callback": {       // No I18N
                        "pre": function(opt, mode) {        // No I18N
                            opt.form_data.metadata = $oauth_provider.metadata;
                            if(mode == "edit") {        // No I18N
                                var data = {exclude_fields: ["feature", "additional_fields"]};       // No I18N
                                sdpAjax({
                                    url: "/api/v3/oauth_providers/" + opt.entity_id,        // No I18N
                                    type: 'GET', // No I18N
                                    data: sdpAjaxInputData(data),
                                    success: (res) => {
                                        opt.form_data.entitydata = res.oauth_provider;
                                    }
                                });
                            }
                            return opt;
                        }
                    }
                },
                "component": {//No I18N
                    "callback": {//No I18N
                        "pre": function(opt) {//No I18N
                            opt.save.onsave = function (payload) {
                                if ($iconattachment.ischanged) {
                                    var icon_id = $iconattachment.selectedIcon.split("/").pop();
                                    payload.icon = (!icon_id || icon_id == "no-image-icon.svg") ? null : {"id": icon_id};        // No I18N
                                }
                                return payload;
                            }
                            opt.edit = {"fields": {}};      // No I18N
                            opt.edit.fields.token_url = {"custom_rules": [{"rule_name":"url2", "rule_value":true}]};      // No I18N
                            opt.edit.fields.endpoint_url = {"custom_rules": [{"rule_name":"url2", "rule_value":true}]};      // No I18N
                            return opt;
                        },
                        "post": function(fc, opt) {//No I18N
                            jQuery('.form-section .col-group').before('<div class="m15 disp-ib w-120px h-120px" id="icon-attachment-wrapper"></div>');
                            var icons = [];
                            var icon_data = MC.prototype.ajax("api/v3/oauth_providers/icon", 'icon');
                            for (var i=0; i < icon_data.length; i++) {
                                icons.push(icon_data[i]["content-url"]);
                            }
                            var selected_icon = "";
                            if(fc.entitydata.icon) {
                                selected_icon = '/api/v3/oauth_providers/' + fc.entitydata.id + '/images/' + fc.entitydata.icon.id;
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
                                "icons": icons,
                                "max_file_size": 3,     //No I18N
                                "max_upload_length": 1      //No I18N
                            };
                            $iconattachment.init(icon_opt);
                            return fc;
                        }
                    }
                },
                "popupoption": {
                    "callback": {
                        "beforeopen": function(opt) {
                            opt.width = '60%';
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

var $oauth_provider = {
    metadata: {},    // To cache the metadata
    init: function() {
        var meta = MC.prototype.ajax("/api/v3/oauth_providers/metainfo", 'metainfo');        // No I18N
        $oauth_provider.metadata = {"fields": meta.fields};      // No I18N
    },
    header_icon_render: function(data, row) {
        var rd = data.row_data;
        var url = rd.icon ? '/api/v3/oauth_providers/' + rd.id + '/images/' + rd.icon.id : "/images/no-image-icon.svg";       // No I18N
        var html = '<img src="' + url + '" alt="none" class="vbase icon-lg tf1-2 rounded5 ml5" title="' + e_attr(rd.provider_name) + '" rel="uitip">'
        return html;
    },
    provider_name_render: function(data, row) {
        var rd = data.row_data;
        var e_name = e_html(rd.provider_name)
        var html = `<a href="/" class="a-tag vmiddle text-overflow disp-ib fw" data-event="click" data-handler="MC.load({ from: 'list', mode: 'edit', entity_id: ${rd.id} }, 'oauth_providers');"><span rel="uitip" mode_html="true" mode_ellipsis="true" title="${e_attr(e_name)}">${e_name}</span></a>`;
        return html;
    },
    list_inputdata: function(data) {
        data.list_info.fields_required = ["icon", "provider_name", "client_id", "endpoint_url"];     // No I18N
        return data;
    },
    commonjson: {
        "container": "#oauth_provider_div",      // No I18N
        "mode": "list",     // No I18N
        "name": "oauth_providers",       // No I18N
        "module": "oauth_providers",     // No I18N
        "skipresponsecall": true,       // No I18N
        "permissions": {        //No I18N
            "add": true,    //No I18N
            "delete": true,    //No I18N
            "edit": true    //No I18N
        },
        "base_path": "/api/v3",     // No I18N
        "in_active": false,     // No I18N
        "is_trash": false,      // No I18N
        "display_name": translate('auth.oauth.provider'),      // No I18N
        "entity_name": "oauth_provider",     // No I18N
        "model": "add,edit",     // No I18N
        "skipmetacall":true,        // No I18N

        "list": OAUTH_LIST,     // No I18N
        "form": OAUTH_FORM     // No I18N
    }
}
