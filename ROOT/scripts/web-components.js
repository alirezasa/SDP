/**
 * Web Component
 * Verision : 1.0.4
 * Last Change : WebComponent's attachment now can be initialize by using mode="new|edit|view"
 */
var WebComponents;
(function () {
    /* @Class */
    var WebComponent = (function () {
        /** @Constructor */
        function WebComponent() {
            /** List od registered component  */
            this.components = [];
            /** Callbacks for every registered component*/
            this.componentCallbacks = {};
            /**
             * Running component instance pool
             * Indentifier from hash memory pool
             */
            this.instancePool = {};
            /** Jquery body instance, to avoid multiple instance creation */
            this.$body = jQuery("body");
        }
        /**
         * A hook to register a new component
         */
        WebComponent.prototype.register = function(component, callback) {
            if (this.components.indexOf(component) === -1) {
                /** Push the component array : */
                this.components = this.components.concat(component);
                this.componentCallbacks[component] = callback;
            }
        };
        /**
         * A method is used to processComponent
         * i.e Compile the handlebars
         *  call the component callbacks
         */
        WebComponent.prototype.processComponent = function(e, forceRender, componentName) {
            var _this = this;
            /** Component Name  */
            var component = forceRender ? jQuery(e) : jQuery(e).closest("web-component");
            /** if this is force render, then the component should be web-component tag */
            if (forceRender) {
                e = component.find(componentName)[0];
            }
            /**  Get all the components options provied in web-component tag */
            var componentOptions = _this.getAllAttributes(component[0]);
            if (!componentOptions.autoload || forceRender) {
                /** If the web-component tag have id then take it as instance id*/
                instanceId = componentOptions.id ? componentOptions.id : _this.uuidGen();
                /** Wrap the web-component tag around component placeholder*/
                component.wrap('<div class="component-placeholder"></div>');
                targetParent = component.closest(".component-placeholder");
                options = _this.getAllAttributes(e);
                /** Call the component callbacks */
                _this.componentCallbacks[componentName](e, options, _this, instanceId);
            }
        };
        /**
         * A method is used to populateComponent every webComponent
         */
        WebComponent.prototype.populateComponent = function() {
            var _this = this;
            var compLen = this.components.length;
            var componentName;
            for (var i = compLen - 1; i >= 0; i--) {
                componentName = this.components[i];
                jQuery("web-component > " + componentName).each(function(index, el) {
                    let webelement = jQuery(el).closest("web-component");
                    if(webelement && webelement.attr("id") && _this.instancePool[webelement.attr("id")]) {
                        return console.warn("Action skiped because of component already rendered");
                    }
                    _this.processComponent(el, false, componentName);
                });
            }
        };
        /**
         * A function hook is used to read all the custom attributes inside the component
         * @param el {HTMLElement}
         */
         WebComponent.prototype.getColAttributes = function(el) {
            var _this = this;
            var attrs = {};
            if (el.attributes) {
                for (var _i = 0, _a = el.attributes; _i < _a.length; _i++) {                    
                    var nodeEle = _a[_i];
                    var attr_value = nodeEle.value || "";
                    var name = nodeEle.name;                              
                    name = _this.camelCase(name);
                    attr_value = _this.toBoolean(attr_value);
                    attrs[name] = attr_value;
                }
            }
            return attrs;
        };
        WebComponent.prototype.getAllAttributes = function (el) {
            var _this = this;
            var attrs = {};
            if (el.attributes) {
                for (var _i = 0, _a = el.attributes; _i < _a.length; _i++) {
                    var nodeEle = _a[_i];
                    var attr_value = nodeEle.value || "";
                    var name = nodeEle.name;
                    /** If the attributes contains -, than that should be converted in to camelCase */
                    name = _this.camelCase(name);
                    /** If the component have false or true, then it should be converted in to a boolean*/
                    attr_value = _this.toBoolean(attr_value);
                    attrs[name] = attr_value;
                }
            }
            return attrs;
        };
        /** Helper method is used to convert the string into camelCase*/
        WebComponent.prototype.camelCase = function(str) {
            return str.replace(/-([a-z])/g, function(g) {
                return g[1].toUpperCase();
            });
        };
        /** Helper method is used to generate unique id */
        WebComponent.prototype.uuidGen = function() {
            return "webc_xxxxxx4xx-xxxx".replace(/[xy]/g, function(c) {
                var r = (Math.random() * 16) | 0,
                    v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
        };
        WebComponent.prototype.toBoolean = function(value) {
            var _value = value;
            if (typeof _value === "string") {
                _value = value.trim().toLowerCase();
            }
            switch (_value) {
                case true:
                case "true":
                    return true;
                case false:
                case "false":
                    return false;
                default:
                    return value;
            }
        };
        /**
         * A helper method, used to get the instance by given the ID
         */
        WebComponent.prototype.getInstance = function(instanceId) {
            if (this.instancePool[instanceId]) {
                return this.instancePool[instanceId];
            }
            return null;
        };
        WebComponent.prototype.render = function(instanceId) {
            if (!jQuery("#" + instanceId).length) {
                return console.error("Unable to find the component");
            }
            if (this.instancePool[instanceId]) {
                return console.warn("Action skiped because of component already rendered");
            }
            var componentName = jQuery("#" + instanceId).children().prop("tagName").toLowerCase();
            this.processComponent("#" + instanceId, true, componentName);
        };
        return WebComponent;
    })();
    /**
     * Based on singleton design pattern
     * Register the WebComponent
     */
    window.WebComponents = new WebComponent();
})();
jQuery(function() {
    WebComponents.populateComponent();
});
/**
 * Register the table Component
 */
WebComponents.register("table-component", function(element, options, instance, instanceId) {
    var columns = [];
    var header = {};
    jQuery(element).find("column").each(function (index, el) {
        var attributes = instance.getColAttributes(el);
        attributes["html"] = jQuery(el).html();
        columns.push(attributes);
    });
    var colLength = columns.length;
    var fields_required = [];
    var raw_options = jQuery.extend({}, options);
    var fields_required_obj = {};
    for (var i = 0; i < colLength; i++) {
        fields_required.push(columns[i].name);
        fields_required_obj[columns[i].name] = {};
        if (columns[i].render) {
            columns[i].dataCelltransformer = function(tableData, controller) {
                return execFuncByName(tableData.head_data.render, window, tableData, controller);
            };
        }
        if (columns[i].inline_render) {
            columns[i].dataInlineCellTransformer = function(tableData, controller) {
                return execFuncByName(tableData.head_data.inline_render, window, tableData, controller);
            };
        }
        if (columns[i].onclick) {
            columns[i].onClick = columns[i].onclick;
            delete columns[i].onclick;
        }
        if (columns[i].type && columns[i].type === "actions") {
            var items = columns[i].html;
            var actions = [];
            jQuery("<div>" + items + " </div>").find("item").each(function(eve, item) {
                actions.push({
                    label: item.innerText,
                    onClick: item.onclick
                });
            });
            columns[i].actions = actions;
        }
        if (columns[i].width && columns[i].width.indexOf("fx:") !== -1) {
            columns[i].width = execFuncByName(columns[i].width.split("fx:")[1], window);
        }
        if (columns[i].isrtatext) {
            columns[i].isRTAText = true;
            delete columns[i].isrtatext;
        }
         if(columns[i].callbackColumnoption && columns[i].callbackColumnoption.indexOf("fx:") !== -1){
            columns[i] = execFuncByName(columns[i].callbackColumnoption.split("fx:")[1], window, columns[i]);
            delete columns[i].callbackColumnoption;
         }
        header[columns[i].name] = columns[i];
    }
    if (Object.keys(header).length == 0) {
         if (options.callbackHeaderfunction) {
        header = execFuncByName(options.callbackHeaderfunction, window);
    }
     }
    if (options.isOdapi) {
        options.isODAPI = true;
        delete options.isOdapi;
    }
    if (options.skipsubrequest) {
        options.skipSUBREQUEST = true;
        delete options.skipsubrequest;
    }
    if (options.isfr_listinfo_support) {
        options.isFR_ListInfo_Support = true;
        delete options.isfr_listinfo_support;
    }
    if (options.getmetainfo) {
        options.getmetaInfo = true;
        delete options.getmetainfo;
    }
    if (options.deleteUrl) {
        options.deleteURL = options.deleteUrl;
        delete options.deleteUrl;
    }
    if (options.callbackrowfunction) {
        options.callbackRowfunction = options.callbackrowfunction;
        delete options.callbackrowfunction;
    }
    if (options.acceptodcompatible) {
        options.acceptODCompatible = true;
        delete options.acceptodcompatible;
    }
    /**
     * We have added this to enable search and navigation by URL
     */
    if (options.urlsearch) {
        options.urlSearch = true;
        delete options.urlsearch;
    }
    /**
     * Table Component inputs
     */
    var id = options.tableHolder ? options.tableHolder : instance.uuidGen();

    var tinfo;
    if (options.tableInfo) {
        if (typeof options.tableInfo == "string") {
            tinfo = execFuncByName(options.tableInfo, window, options.personalize_key || options.entity_name);
        } else {
            tinfo = options.tableInfo;
        }

    } else {
        tinfo = table_comp.getTableInfo(options.personalize_key || options.entity_name || undefined, undefined, options.default_row_count || undefined);
    }

    /*while initializing, if there is no fields_required object provided, we will be constructing fields_required based on header objcet*/
    if(tinfo && !tinfo.fields_required && fields_required_obj){
        tinfo.fields_required = fields_required_obj;
    }
    if (options.row_inputdata) {
        if(typeof options.row_inputdata == "string"){
            options.row_inputdata = execFuncByName(options.row_inputdata, window, tinfo);
        }
    }
    if (options.meta_data) {
        if(typeof options.meta_data == "string"){
            options.meta_data = execFuncByName(options.meta_data, window);
        }
    }
    if (options.callbackRowfunction) {
        options.callbackRowfunction = function (table_info) {
            return execFuncByName(raw_options.callbackRowfunction, window, table_info);
        };
    }
    if (options.callbackSearchFunction) {
        options.callbackSearchFunction = function (table_info) {
            return execFuncByName(raw_options.callbackSearchFunction, window, table_info);
        };
    }

    if (options.callbackDataGet) {
        options.callbackDataGet = function (info, args, tbobj) {
            return execFuncByName(raw_options.callbackDataGet, window, tbobj, info);
        };
    }
    if (options.callbackAfterInitialRender) {
        options.callbackAfterInitialRender = function () {
            return execFuncByName(raw_options.callbackAfterInitialRender, window);
        };
    }
    if (options.callbackAfterBodyRender) {
        options.callbackAfterBodyRender = function (params) {
            return execFuncByName(raw_options.callbackAfterBodyRender, window, params);
        };
    }
    if (options.callbackSearchFunction) {
        options.callbackSearchFunction = function (params, data) {
            return execFuncByName(raw_options.callbackSearchFunction, window, params, data);
        };
    }
    if (options.metaInfo_input) {
        if (typeof options.metaInfo_input == "string") {
            options.metaInfo_input = execFuncByName(options.metaInfo_input, window);
        }
    }
    if (options.advFilterSettings) {
        if (typeof options.advFilterSettings == "string") {
            options.advFilterSettings = execFuncByName(raw_options.advFilterSettings, window);
        };
    }
    //setting height
    if (options.height && options.height.indexOf("fx:") !== -1) {
        options.height = execFuncByName(raw_options.height.split("fx:")[1], window);
    }
    //setting width
    if (options.width && options.width.indexOf("fx:") !== -1) {
        options.width = execFuncByName(raw_options.width.split("fx:")[1], window);
    }
    //height settings
    if (options.height_settings && options.height_settings.indexOf("fx:") !== -1) {
        options.height_settings = execFuncByName(raw_options.height_settings.split("fx:")[1], window);
    }
    //width settings
    if (options.width_settings && options.width_settings.indexOf("fx:") !== -1) {
        options.width_settings = execFuncByName(raw_options.width_settings.split("fx:")[1], window);
    }
    //setting nodataString
    if (options.nodataString) {
        options.nodataString = execFuncByName(raw_options.nodataString, window);
    }
    if (options.bulkSelectionSetting) {
        var bulkOptions = raw_options.bulkSelectionSetting;
        try {
            bulkOptions = JSON.parse(bulkOptions);
        } catch (error) {
            /* eslint-disable no-console */
            console.error(error);
            /* eslint-enable no-console */
        }
        raw_options.bulkSelectionSetting = bulkOptions;
        var bulkOptionsName = bulkOptions.constructSelectedListCB ? bulkOptions.constructSelectedListCB : undefined;
        options.bulkSelectionSetting = bulkOptions;
        if (bulkOptionsName) {
            options.bulkSelectionSetting.constructSelectedListCB = function (params) {
                return execFuncByName(bulkOptionsName, window, params);
            };
        }
    }
    if (options.discarded_fields) {
        options.discarded_fields = options.discarded_fields.split(",");
    }
    if (options.must_included_fields) {
        options.must_included_fields = options.must_included_fields.split(",");
    }
    if (options.callbackUrl) {
        options.callbackURL = options.callbackUrl;
        delete options.callbackUrl;
    } else {
        options.callbackURL = options.entity_name;
    }
    //getting additional_metainfo
    if (options.additional_metainfo && options.additional_metainfo.indexOf("fx:") !== -1) {
        options.additional_metainfo = execFuncByName(options.additional_metainfo.split("fx:")[1], window);
    }

    if (options.previewSettings && options.previewSettings.indexOf("fx:") !== -1) {
        options.previewSettings = execFuncByName(options.previewSettings.split("fx:")[1], window);  //NO I18N
    }

    var tableContent = {
        header: header
    };
    jQuery(element).closest(".component-placeholder").append("<div id='" + id + '_div\' class="tablelist p0 tablebrd1"></div>');
    var defaultOptions = {
        tableHolder: id
    };
    if (options.otherOptions) {
        var otherOptions = execFuncByName(options.otherOptions, window, options);
        options = jQuery.extend({}, options, otherOptions);
    }
    var tableComponentOptions = jQuery.extend(true, {}, defaultOptions, options);

    /*if (!tinfo.fields_required || (tinfo.fields_required && !tinfo.fields_required.length)) {
        tinfo.fields_required = fields_required_obj;
    }*/
    if (!tinfo.fields_required || (jQ.isPlainObject(tinfo.fields_required) && !Object.keys(tinfo.fields_required).length) &&(!tinfo.fields_required || (tinfo.fields_required && !tinfo.fields_required.length)) ) {
        tinfo.fields_required = fields_required_obj;
    }
    var tableComponentInstance = new tableComponent(tinfo, tableContent, tableComponentOptions);
    /**
     * @important
     * Don't forget to push the component instance into the
     * instance pool, so that it will accessible the getInstance method
     */
    instance.instancePool[instanceId] = tableComponentInstance;
});
WebComponents.register("attachment-component", function(element, options, instance, instanceId) {
    // do the component initialize render
    jQuery(element).closest(".component-placeholder").append('<div id="atp_' + instanceId + '" />');
	var actions = [];
	var header_section = {};
    jQuery(element).find("header-section").each(function (index, el) {
		var $this = jQuery(this);
		var attributes = instance.getColAttributes(el);
			header_section = attributes;
			var header_actions = {};
		$this.find("action").each(function (i, ele) {
			var attr = instance.getColAttributes(ele);
			attr["order"] = i+1;
			header_actions[attr.name] = attr;
			actions.push("attr");
			if(attr.headerbtn_cb) {
				var cb_str = attr.headerbtn_cb;
				attr.headerbtn_cb = function (opt) {
					return execFuncByName(cb_str, window, opt);
				};
			}
		});
		header_section["actions"] = header_actions;
	});
    var row_options = {};
    jQuery(element).find("option").each(function (index, el) {
		var $this = jQuery(this);
		$this.find("column").each(function (index, ele) {
			var attr = instance.getColAttributes(ele);
			if(attr.name) {
				var name = attr.name;
				row_options[name] = attr;
			}
		});
    });
	var table_info = {"table_info": {"header_section": header_section,"options": row_options}};
	options = jQuery.extend({}, table_info, options);
    var raw_options = jQuery.extend({}, options);
    switch (options.mode) {
        case "new":
        case "edit":
            options.api = true;
            options.upload_api = true;
            options.upload = true;
            options.enable_delete = true;
            options.download = false;
            options.is_new_form = options.mode === "new";
            options.is_odapi = true;
            options.no_preview = false;
            options.direct_upload = options.mode === "edit";
            options.rerenderOnUpload = false;
            if (options.inputs) {
                /**
                 * Callback after upload
                 */
                var onReadyCallback = function() {
                    var inputs = jQuery("#inputs_" + instanceId);
                     var container = WebComponents.getInstance(instanceId) && WebComponents.getInstance(instanceId).selector || jQuery("#" + instanceId);
                    var optionsTag = "";
                    container.find(".preAttach").each(function(ind, ele) {
                        var id = jQuery(ele).data("attachId");
                        if(typeof id !== 'undefined') {
                            optionsTag += '<option value="' + id + '" selected="true">' + id + "</option>";
                        }
                    });
                    inputs.find('[name="attId"]').html(optionsTag);
					if (options.additional_inputs) {
						var coloptionsTag = "";
						container.find(".preAttach").each(function(ind, ele) {
							var id = jQuery(ele).data("attachId");
							var colopt = jQuery(ele).data(options.additional_inputs) === undefined ? "" : jQuery(ele).attr("data-"+options.additional_inputs.toLowerCase());
							coloptionsTag += '<option value="' + colopt + '" selected="true" id="'+id+'">' + colopt + "</option>";
						});
						inputs.find('[name="'+options.additional_inputs+'"]').html(coloptionsTag);
					}
                };
                options.servlet_cb = function(response, newFile, attachmentInstance) {
                    var inputs = jQuery("#inputs_" + instanceId);
                    response && response.responseJSON && (response = response.responseJSON);
                    if (response && response.response_status && response.response_status.status === "failed" && response.response_status.messages) {
                        showalert("failure", response.response_status.messages[0].message, "isAutoHide=false", "multi"); //NO I18N
                         jQuery(newFile).closest('.btn-group').remove();
                    }
                    if (response && response.response_status && response.response_status.status === "success") {
                        if (response && response.attachment) {
                            response.attachment.content_url && newFile.attr("data-attach-url", response.attachment.content_url);
                            response.attachment.id && newFile.attr("data-attach-id", response.attachment.id);
                            var fsizeval = response.attachment.size && response.attachment.size.value ? response.attachment.size.value : response.attachment.size;
                            if (attachmentInstance.options.is_odapi) {
                                if (response.attachment.size && response.attachment.size.hasOwnProperty("display_value")) {
                                    fsizeval = response.attachment.size.display_value;
                                }
                            }
                            fsizeval && newFile.attr("data-attach-size", fsizeval);
                            attachmentInstance.options.description && response.attachment.description && newFile.attr("data-attach-description", e_html(response.attachment.description));
                        }
                        inputs.find('[name="attId"]').append('<option value="' + response.attachment.id + '" selected="true">' + response.attachment.id + "</option>");
						if (options.additional_inputs) {
							inputs.find('[name="'+options.additional_inputs+'"]').append('<option value="' + response.attachment[options.additional_inputs] + '" selected="true" id="' + response.attachment.id + '">' + response.attachment.id + "</option>");
						}
                        newFile.closest(".btn").find(".fl").eq(1).html('<span class="atdrpactn tc" data-attach-delete="true"><em class="cspr close3 mt1 flat"></em></span>');
                        /** Try to bind the attachment component event for newly added attachment  */
                        try {
                            WebComponents.getInstance(instanceId).loadEvents();
                        } catch (error) {
                            /* eslint-disable no-console */
                            console.error(error);
                            /* eslint-enable no-console */
                        }
                    }
                    var selector = '[data-attach-uuid="' + attachmentInstance.options.uid + '"]';
                    initTooltip(selector);
                };
                /**
                 * On Delete Callback
                 */
                options.ondelete = function(context, element) {
                    var data = element.data();
                    var inputs = jQuery("#inputs_" + instanceId);
                    var inputOptions = options.inputs;
                    showconfirm(true, 'title='+translate("common.confirm.submit")+', message='+translate("sdp.inventory.ws.attachdelete.alert")+', submitbutton='+translate("common.proceed")+', cancelbutton='+translate("common.no")+', closebutton=yes, closeOnEscKey=yes', function(response) {
                        if (response) {
                            inputs.find('[name="attId"]').find('option[value="' + data.attachId + '"]').remove();
                            if (options.additional_inputs) {
                                inputs.find('[name="'+options.additional_inputs+'"]').find('option[id="' + data.attachId + '"]').remove();
                            }
                            if(self.options.view === "table") {
                                var id = element[0].dataset.id || element[0].dataset.attachId;
                                element.closest("tr#"+id).remove();
                                var attachTable = WebComponents.getInstance(instanceId);
                                delete attachTable.options.table_response[id];
                                if(jQuery.isEmptyObject(attachTable.options.table_response)) {
                                    attachTable.loadTableheadersection();
                                }
                            } else {
                                element.closest(".btn-group").remove();
                            }
                            if (inputOptions) {
                                onReadyCallback();
                            }
                        }
                    });
                };
                /**
                 * Old's attachment component input
                 */
                if (!jQuery("#inputs_" + instanceId).length) {
                    if (options.inputs) {
                        jQuery(element).closest(".component-placeholder").append('<div id="inputs_' + instanceId + '"><select class="hide" name="attId" multiple=""></select></div>');
						if (options.additional_inputs) {
							jQuery(element).closest(".component-placeholder").find('#inputs_' + instanceId).append('<select class="hide" name="'+options.additional_inputs+'" multiple=""></select>');
						}
                    }
                }
                options.onready = onReadyCallback;
            }
            break;
        case "view":
            options.upload = true;
            options.api = true;
            options.direct_upload = true;
            options.is_odapi = true;
            options.is_odapi_v2 = true;
            break;
        default:
            break;
    }
    /**
     * While destorying the attachment component, we need to update the attachment
     */
    options.ondestory = function() {
        var ele = jQuery("#atp_" + instanceId).closest(".component-placeholder");
        ele.find("#atp_" + instanceId).remove();
        ele.find("#file-browser-area").remove();
        delete WebComponents.instancePool[instanceId];
    };
    /** Merge the options and raw_options for override the mode value by using webComponent's input */
    options = jQuery.extend(options, raw_options);
    if (options.mode === "new") {
        delete options.entity_id;
    }
    if (options.print_preview) {
        delete options.upload;
    }
    if (options.allowed_ext) {
        options.allowed_ext = options.allowed_ext.split(",");
    }
    if (options.unsupported_files) {
        options.unsupported_files = options.unsupported_files.split(",");
    }
    if (!options.inputs && options.onupload) {
        options.onupload = [options.onupload, window];
    }
    if (!options.inputs && options.ondelete) {
        options.ondelete = [options.ondelete, window];
    }
    if (options.popover) {
        try {
            options.popover = JSON.parse(options.popover);
        } catch (error) {
            console.warn("Please provide the proper JSON input for the popover");
            delete options.popover;
        }
    }
    if (!options.inputs && options.servlet_cb) {
        options.servlet_cb = function(response) {
            return execFuncByName(raw_options.servlet_cb, window, response);
        };
    }
    if (options.otherOptions) {
        var otherOptions = execFuncByName(options.otherOptions, window);
        options = jQuery.extend({}, options, otherOptions);
    }
    var atpComponentInstance = new attachPreview("#atp_" + instanceId, options);
    /**
     * @important
     * Don't forget to push the component instance into the
     * instance pool, so that it will accessible the getInstance method
     */
    instance.instancePool[instanceId] = atpComponentInstance;
});
WebComponents.register("history-component", function(element, options, instance, instanceId) {
    jQuery(element).closest(".component-placeholder").html('<div id="history_' + instanceId + '"></div>');
    if (!options.key) {
        options.key = "history_sort_order_" + module;
    }
    instance.$body.find("#history_" + instanceId).load("/common/ViewHistory.jsp?id=" + options.id + "&module=" + options.module + "&key=" + options.key, function() {
        if (options.onready) {
            execFuncByName(options.onready, window);
        }
    }); //No I18N
});
/*Helpcard component initialization*/
WebComponents.register("helpcard-component", function(element, options, instance, instanceId) {
    var raw_options = jQuery.extend({}, options);
    if(raw_options.type == "icon"){
        raw_options["icon_destination"] = raw_options.task+"_helpcard_icon";
    }
    var hepcardInstance = new helpcardComponent(raw_options);
    instance.instancePool[instanceId] = hepcardInstance;
});
/*Calendar component initialization*/
WebComponents.register("calendar-component", function(element, options, instance, instanceId) {
    options = jQuery.extend({}, options);
    if(options.id){
        Object.keys(options).forEach(function(option){
            if(typeof(options[option]) == 'string' && options[option].indexOf("fx:") != -1){
                options[option] = execFuncByName(options[option], window)
            }
        });
        jQuery("#"+options.id).ZSDPCalendar(options);
    }
});
