/* $Id$ */

/****
 * 
 * Version 1.0.0
 * Changes : 
 * **** Code unification changes have been updated for set/get mapping functionality
 * **** MC JSON construct function updated
 * **** Usablity updated 
 * **** **** https://connect.zoho.com/portal/intranet/stream/105000992004408
 * **** **** Listview mode support
 * **** **** Details page Right panel support
 * **** **** Custom action support in Form and Details tabs
 * **** Callback provide for "popupoption"
 * 
 * ***/

let MC_Mapper = {};


class MC {
    /**
     * The `MC` class is a JavaScript class that handles the initialization and loading of different components in the MC application.
     * To initialize the `MC` class, you need to create an instance of it by calling the constructor function `MC(options)`. The `options` parameter is an object containing the configuration options for the MC application.
     * 
     * 
     * **/
    constructor(options) {
        this.propReset();
        this.options = options;
        MC["options"] = this.options; //No I18N
        let mapper = MC.prototype.getMapper(options.name);
        if(mapper && mapper.components) {/** Maintain the component information to render for list and details page**/
            this.options["components"] = mapper.components;
        }
        if(mapper && mapper.filter) {
            this.options["filter"] = mapper.filter;
        }
        if(!options.skipmapping) {
            MC.prototype.setMapper(options.name, this.options);
        }
        this.init(this.options);

    }

    /**
     * Function to retrieve mapper data for a specific module and option.
     * @param {string} name - Module name.
     * @param {string} poption - Particular option.
     * @returns {object} - Mapper data for the specified module and option.
     */
    getMapper(name, poption) {
        // Initialize an empty object to store the mapper data
        let getjson = {};
        
        // Retrieve the route for the specified module from the MC_Mapper object
        let route = MC_Mapper[`module_${name}`];
        
        // Check if a route exists for the specified module
        if (route) {
            // If a route exists, assign it to the getjson object
            getjson = route;
            
            // If a particular option is specified, retrieve the data for that option
            if (poption) {
                getjson = getjson[poption];
            }
        }
        
        // Return the retrieved mapper data
        return getjson;
    }
    /**
     * Function to set mapper data for a specific module and option.
     * @param {string} name - Module name.
     * @param {object|string|array} data - Data to be set.
     * @param {string} poption - Particular option.
     */
    setMapper(name, data, poption) {
        // Check if a particular option is specified
        if (poption) {
            // Retrieve the route for the specified module
            let route = MC_Mapper[`module_${name}`];
            
            // Check if a route exists for the specified module
            if (route) {
                // If the particular option contains dot notation
                if (poption.includes(".")) {
                    // Split the option using dot notation
                    let dotsplit = poption.split('.');
                    let splitdata;
                    
                    // Traverse through the nested structure defined by the dot notation
                    for (var i = 0; i < dotsplit.length; i++) {
                        splitdata = dotsplit[i];
                        
                        // Create nested objects if they don't exist
                        if (typeof route[splitdata] == "undefined") {
                            route[splitdata] = {};
                        }
                        
                        // If it's the last part of the dot notation, assign poption to it
                        if (dotsplit.length == i + 1) {
                            poption = splitdata;
                        } else {
                            route = route[splitdata];
                        }
                    }
                }
                
                // If the particular option doesn't exist, create it
                if (typeof route[poption] == "undefined") {
                    route[poption] = {};
                }
                
                // Set the data for the particular option
                route[poption] = data;
            }
        } else {
            // If no particular option is specified, set the data directly under the module name
            MC_Mapper[`module_${name}`] = data;
        }
    }

    /**
     * Resets the component's internal properties to their initial values.
     * 
     * **/
    propReset() {
        this.container = "";
        this.base_path = "";
        this.history_skip_module = false;
        this.entity = null;
        this.entity_id = null;
        this.mode = "list"; //No I18N
        this.current_page = "list"; //No I18N
        this.previous_page = "list"; //No I18N
        this.additional_details = null;
        this.permissions = {
            add: false,
            delete: false,
            edit: false,
            move_to_trash: false,
            restore_from_trash: false,
        };
        this.options = {};
        this.dialog = false;
        this.use_listviewdata_everywhere = false;
        this.kb_shortcuts = false;
        this.skip_leftpanel_render = false;
        this.skip_entityid_tolayout_call = false;
        this.scrolltotop = true;//Skip scrolltop event in listview
        this.scrolltoelement = false;//Scrollto container event in listview
    }

    /**
     * Initializes the component with the provided options.
     * 
     * options (Object): The configuration options for the component.
     * 
     * **/
    init(options) {
        this.current_page = options.mode || "list"; //No I18N
        jQuery('body').removeClass('of-h'); //No I18N
        this.options = Object.assign({}, this.options, MC.prototype.omitObjects(options, false));
        jQuery.extend(true, this, MC.prototype.omitObjects(options, true));
        this.load(options);
    }


    /**
     * Loads the component with the specified options and name.
     * 
     * options (Object): The options for loading the component.
     * name (String): The name of the component.
     * 
     * **/
    load(options, name) {
        var _self = this;
        if (name) {
            let opti = MC.prototype.getMapper(name);
            _self = MC.prototype.omitObjects(opti, true);
            _self.options = {
                ..._self,
                ...MC.prototype.omitObjects(opti, false)
            };
            if(options.skip_leftpanel_render) {/** Skip lefpanel render data get call **/
                _self.skip_leftpanel_render = options.skip_leftpanel_render;
            } else {
                MC.prototype.setMapper(name+'_tabledata', {"ids": [], "records": {},"info": {}});
                if(opti && opti.filter) {
                    delete opti.filter;
                }
            }
        }
        _self.previous_page = options.from || _self.current_page || "list"; //No I18N

        MC.current_page = options.mode || "list"; //No I18N
        let opt = _self.options;

        if (opt.container && (!_self.container || isEmpty(_self.container))) {
            _self.container = "#" + opt.container.id;
        }
        if (_self.model || (opt && opt.model && opt.model.length > 0)) {
            _self.base_path = false;
            if (_self.dialog) {
                jQuery(_self.dialog).sdp_zcomponent_dialog("close"); //No I18N
            }
            const titleopt = {
                "list": "pagescripts.request.listview", //No I18N
                "add": "common.new.label", //No I18N
                "edit": "common.edit.label", //No I18N
                "details": "sdp.app.asset.details", //No I18N
            };
            const headertitle = translate(titleopt[options.mode], [_self.display_name]);
            _self.options["dialog_title"] = headertitle;
            if (jQuery(_self.container + "_popup").length == 0) {
                jQuery(_self.container).append(`<div id="${_self.container.replace("#","")}_popup"></div>`); //No I18N
            }
        } else {
            jQuery(_self.container).html('');
        }

        if (!_self.history_skip_module) {
            var urlParams = `module=${_self.name}&mode=${options.mode}`;
        } else {
            var urlParams = `&mode=${options.mode}`;
            _self.base_path = _self.default_module != undefined ? _self.base_path : false;
        }
        if (window.externalframe) {
            urlParams += `&externalframe=true`;
        }

        _self.mode = options.mode;
        let mappercomp = MC.prototype.getMapper(options.name || opt.name, 'components');
        if (!mappercomp) {
            MC.prototype.setMapper(options.name || opt.name, {}, 'components');
        }

        let callbackcomponent;
        if (options.mode) {
            let mode = options.mode == "edit" || options.mode == "new" ? "form" : options.mode;
            callbackcomponent = opt[options.mode] && opt[options.mode].options.component && opt[options.mode].options.component.callback;
        }
        jQuery(document).off("keypress.mcshortcuts");
        //jQuery('body').removeClass('oh-i'); //No I18N
        switch (options.mode) {
            case 'details': //No I18N
                if (options.entity_id && options.entity_id !== 'null') { //No I18N
                    urlParams += '&entity_id=' + options.entity_id; //No I18N
                }
                _self.entity_id = options.entity_id;
                var details = new MC_DETAILS(opt, _self);
                MC.prototype.setMapper(options.name || opt.name, details, 'components.details');
                jQuery('body').removeClass('of-h'); //No I18N
                break
            case 'add': //No I18N
                opt.entity_id = null;
                delete opt.data;
                _self.entity_id = null;
                if (callbackcomponent) {
                    opt = new MC_CALLBACKS({"mode":"details", "type": "pre"}, opt, _self, callbackcomponent);
                }
                opt.form.entity_id = null;
                var form = new MC_FORM(opt, _self);
                MC.prototype.setMapper(options.name || opt.name, form, 'components.form');
                if (callbackcomponent) {
                    form = new MC_CALLBACKS({"mode":"details", "type": "post"}, form, _self, callbackcomponent);
                }
                jQuery('body').removeClass('of-h'); //No I18N
                break;
            case 'edit': //No I18N
                if (options.type) {
                    opt.mode = options.type;
                }
                if (options.entity_id && options.entity_id !== 'null') { //No I18N
                    urlParams += '&entity_id=' + options.entity_id; //No I18N
                }
                _self.entity_id = options.entity_id;
                if (callbackcomponent) {
                    opt = new MC_CALLBACKS({"mode":"form", "type": "pre"}, opt, _self, callbackcomponent);
                }
                let eurl;
                /** Entity URL changed from edit operation(refer reminder) **/
                if(options.entity_url) {
                    eurl = opt.form.meta.entity_url;
                    opt.form.meta.entity_url = options.entity_url;
                }
                var form = new MC_FORM(opt, _self);
                if(eurl) {
                    opt.form.meta.entity_url = eurl;
                }
                MC.prototype.setMapper(options.name || opt.name, form, 'components.form');
                if (callbackcomponent) {
                    form = new MC_CALLBACKS({"mode":"form", "type": "post"}, form, _self, callbackcomponent);
                }
                jQuery('body').removeClass('of-h'); //No I18N
                break;
            case 'list': //No I18N
                const mdl = options.model ? this.options.model : {};
                if (!jQuery.isEmptyObject(mdl) && !mdl.includes(options.mode)) {
                    if (jQuery(_self.container + '_popup').length != 0) { //No I18N
                        jQuery(_self.container + '_popup').remove(); //No I18N
                    }
                }
                if (_self.base_path) {
                    jQuery('body').addClass('of-h'); //No I18N
                }
                /** MC have static call event to get tablecomponent data to details page leftpanel, sometime its pass to common variable so the reason its delete **/
                let cdataget = opt.list && opt.list.meta && opt.list.meta.additional_options;
                if(cdataget && cdataget['callback-data-get'] == '$MC.details.leftpanel.leftPanelListviewData') {
                    delete cdataget['callback-data-get'];
                }
                if (callbackcomponent) {
                    opt = new MC_CALLBACKS({"mode":"list", "type": "pre"}, opt, _self, callbackcomponent);
                }
                var list = new MC_LIST(opt, _self);
                let listmeta = MC.prototype.getMapper(name+'_meta');
                if(!listmeta) {
                    let listdata = {//No I18N
                        "meta": list.tableComp && list.tableComp.metaInfo,//No I18N
                        "url": "/api/v3/"+list.options.name+"/metainfo"//No I18N
                    };
                    MC.prototype.setMapper(list.options.name+'_meta', listdata);
                }
                if(!options.skipmapping) {
                    MC.prototype.setMapper(options.name || opt.name, list, 'components.list');
                }
                if (callbackcomponent) {
                    list = new MC_CALLBACKS({"mode":"list", "type": "post"}, list, _self, callbackcomponent);
                }
                if(_self.scrolltotop) {
                    jQuery('html').scrollTop(0); //No I18N
                } else if(_self.scrolltoelement) {
                    jQuery("html,body").animate({
                        scrollTop: jQuery(_self.container).offset().top - 30
                    },1000);
                }
                applyBrowserTitle(); // command to update the browser title
                break;
            default:
                break;
        }
        if (_self.options.model && _self.options.model.includes(options.mode)) {
            jQuery('body').addClass('of-h'); //No I18N
        }

        if (_self.base_path) {
            if (_self.mode == "details") {
                urlParams += window.location.hash;
            }
            window.history.pushState({
                spa_skipstate: true
            }, '', _self.base_path + urlParams);
        }
    }

    /**
     * Filters out objects or non-objects from the provided object.
     * 
     * options (Object): The object to filter.
     * skipobj (Boolean): Specifies whether to filter objects or non-objects.
     * 
     * **/
    omitObjects(obj, isobj) {
        var result = {};
        for (var key in obj) {
            var isObject = typeof obj[key] === "object";
            var isFunction = typeof obj[key] === "function";
            if ((isobj && !isObject && !isFunction) || (!isobj && isObject && !isFunction)) {
                result[key] = obj[key];
            }
        }
        return result;
    }

    /**
     * Moves an item to the trash.
     * 
     * id (String): The ID of the item to move to the trash.
     * 
     * **/
    moveToTrash(id, name) {
        // Use const instead of var where possible
        let modulename = name || MC_LIST.options.name;
        const module_options = MC.prototype.getMapper(modulename);
        const display_name = e_html(module_options.display_name);

        let module_data = MC.prototype.getMapper(modulename+'_tabledata');
        // Use arrow function to avoid issues with this keyword
        const deleteFn = (conf) => {
            if (conf) {
                let plural_name1 = module_options.name;
                let plural_name = module_options.list.meta.callbackURL || plural_name1;
                // Use template literals for string concatenation
                sdpAjax({
                    url: `/api/v3/${plural_name}/${id}/_move_to_trash`,
                    method: 'DELETE', //No I18N
                    success: (resp) => {
                        // Use backticks and ${} syntax for string interpolation
                        showalert('success', `${translate('api.trashed.success', [display_name])}`, 'isAutoHide=true'); //No I18N
                        if(module_data && !jQuery.isEmptyObject(module_data)) {
                            MC.prototype.setMapper(modulename+'_tabledata', {"ids": [], "records": {},"info": {}});
                        }
                        if(module_options.list.meta.callbackURL) {
                            plural_name = plural_name1;
                        }
                        MC.load({
                            mode: 'list'
                        }, plural_name); //No I18N
                    },
                    async: false
                });
            }
        };

        // Use template literals for string concatenation
        const options = `title=${translate('sdp.requests.trashrequest')}, 
                       message=${translate('common.trash.confirmation')},
                       submitbutton=${translate('sdp.common.ok')},
                       cancelbutton=${translate('sdp.common.cancel')},
                       closebutton=yes, closeOnEscKey=yes`;

        // Use arrow function to avoid issues with this keyword
        showconfirm(true, options, deleteFn, true);
    }

    /**
     * Restores an item from the trash.
     * 
     * entity_id (String): The ID of the item to restore.
     * returnTo (String): The location to return to after restoring the item.
     * 
     * **/
    restoreFromTrash(entity_id, name, returnTo) {
        let modulename = name || MC_LIST.options.name;
        const module_options = MC.prototype.getMapper(modulename);
        const display_name = e_html(module_options.display_name);

        let module_data = MC.prototype.getMapper(modulename+'_tabledata');
        const restoreFn = (conf) => {
            if (conf) {
                let plural_name1 = module_options.name;
                let plural_name = module_options.list.meta.callbackURL || plural_name1;
                sdpAjax({
                    url: `/api/v3/${plural_name}/${entity_id}/_restore_from_trash`,
                    method: 'PUT', //No I18N
                    success: (resp) => {
                        showalert('success', translate('sdp.restore.success', [display_name]), 'isAutoHide=true'); //No I18N
                        if(module_data && !jQuery.isEmptyObject(module_data)) {
                            MC.prototype.setMapper(modulename+'_tabledata', {"ids": [], "records": {},"info": {}});
                        }
                        module_options.components.list.tableComp.t_obj.table_info.list_info["filter_by"] = {"name":"trash"};
                        if(module_options.list.meta.callbackURL) {
                            plural_name = plural_name1;
                        }
                        MC.load({
                            mode: 'list'
                        }, plural_name); //No I18N
                    },
                    async: false,
                });
            }
        };

        const options = `title=${translate('sdp.requests.restorerequests')}, message=${translate('common.restore.confirmation')}, submitbutton=${translate('sdp.common.ok')}, cancelbutton=${translate('sdp.common.cancel')}, closebutton=yes, closeOnEscKey=yes`; //No I18N

        showconfirm(true, options, restoreFn, false);
    }

    /**
     * Deletes the data associated with the specified entity_id.
     * 
     * entity_id (String): The ID of the entity to be deleted.
     * 
     * **/
    deleteData(entity_id, name, returnTo) {
        let modulename = name || MC_LIST.options.name;
        const module_options = MC.prototype.getMapper(modulename);
        const display_name = e_html(module_options.display_name);

        let module_data = MC.prototype.getMapper(modulename+'_tabledata');
        const deleteFn = (conf) => {
            if (conf) {
                let plural_name1 = module_options.name;
                let plural_name = module_options.list.meta.callbackURL || plural_name1;
                sdpAjax({
                    url: `/api/v3/${plural_name}/${entity_id}`,
                    method: 'DELETE', //No I18N
                    success: (resp) => {
                        showalert('success', translate('common.delete.success'), 'isAutoHide=true'); //No I18N
                        if(module_data && !jQuery.isEmptyObject(module_data)) {
                            MC.prototype.setMapper(modulename+'_tabledata', {"ids": [], "records": {},"info": {}});
                        }
                        if(module_options.list.meta.callbackURL) {
                            plural_name = plural_name1;
                        }
                        MC.load({
                            mode: 'list'
                        }, plural_name); //No I18N
                    },
                    async: false,
                    errMsgAutoHide: false
                });
            }
        };

        let delMsg = translate('sdp.customview.list.delete.confirm');
        if(module_options.permissions.trash){
            delMsg = translate('custom.delete.permanent.confirm.message');
        }
        const options = `title=${translate('sdp.common.delete')}, message=${delMsg}, submitbutton=${translate('sdp.common.ok')}, cancelbutton=${translate('sdp.common.cancel')}, closebutton=yes, closeOnEscKey=yes`; //No I18N

        showconfirm(true, options, deleteFn, true);
    }

    /**
     * Pushes a hash value to the URL using the HTML5 history API.
     * 
     * tabName (String): The hash value to be added to the URL.
     * 
     * **/
    pushHashToURL(tabName) {
        window.history.replaceState({
            hash: tabName,
            spa_skipstate: true
        }, '', urlStr);
    }

    /**
     * Performs an AJAX request to the specified URL.
     * 
     * url (String): The URL for the AJAX request.
     * name (String): The name of the response property to extract.
     * 
     * **/
    ajax(url, name) {
        let resp;
        sdpAjax({
            url,
            type: 'GET', // No I18N
            async: false,
            cache: false,
            success: (res) => {
                resp = res[name];
            }
        });
        return resp;
    }

    /**
     * Displays a dialog box with the specified options.
     * 
     * opt (Object): The options for the dialog box.
     * title (String): The title of the dialog box.
     * extraoption (Object): Additional options for the dialog box.
     * 
     * **/
    dialogfn(opt, title, extraoption) {
        MC.prototype.dialog = opt.container;
        var doptions = {
            title: title,
            type: "modal", //No I18N
            width: '80%', //No I18N
            draggable: false,
            height: jQuery(window).height(),
            className: "modulecomp-popup sdpzcompdialog",
            custom_options: {
                slider: true,
            },
            resizeWindow: true,//SD-113992 fix
            close: function () {
                jQuery(this).remove();
                MC.prototype.dialog = false;
                closeCalDialog(); // this is to fix calendar close issue in popup.
            }
        };
        var count = jQuery(opt.container).sdp_zcomponent_dialog("getcount");
        doptions = jQuery.extend({}, doptions, extraoption);
        let mcdialogopen = true;
        if (!jQuery.isEmptyObject(count)) {
            jQuery.each(count, function(val, prop){
                if("#"+val == opt.container) {
                    mcdialogopen = false;
                }
            })
        }
        if (jQuery.isEmptyObject(count) || mcdialogopen) {
            jQuery(opt.container).sdp_zcomponent_dialog(doptions); //No I18N
        } else {
            if (typeof extraoption.open == "function") {
                extraoption.open();
            }
        }
        $sdEventListener(opt.container);
    }

    /**
     * Function to get the value of a property in an object using dot notation.
     * @param {Object} obj - The object to search.
     * @param {String} props - The dot notation string representing the property path.
     * @returns {*} - The value at the specified property path, or undefined if not found.
     * 
     * @example
     * const obj = { a: { b: { c: 42 } } };
     * const value = MC.dotObjgetval(obj, 'a.b.c'); // 42
     */
    static dotObjgetval(obj, props) {
        if(!obj) return;
        if (!props) {
            return obj;
        }
        let propsArr = props.split('.');
        let prop = propsArr.splice(0, 1);
        return MC.dotObjgetval(obj[prop], propsArr.join('.'));
    }

    /**
     * @description
     * Function to perform an AJAX request and return the value at a specified path in the response object.
     * 
     * @param {String | Object} opt - The URL or options for the AJAX request.
     * @param {String} valPath - The path to the value in the response object.
     * @returns {*} - The value at the specified path in the response object.
     * 
     * @example Asynchronous usage:
     * const result = await MC.doAjax('/api/v3/users', 'users');
     * 
     * @example
     * const result = await MC.doAjax({ url: '/api/v3/technician/5', method: 'GET' }, 'technician.department');
     * 
     * @example Promise based usage:
     * MC.doAjax('/api/v3/some-endpoint', 'data.value').then(result => {
     *     console.log(result);
     * });
     */

    static async doAjax(opt, valPath) {
        const url = typeof opt === 'string' ? opt : opt.url;
        let options = {
            url,
            type: 'GET', // No I18N
            cache: false
        };

        if (typeof opt === 'object') {
            options = Object.assign({}, options, opt);
        }

        delete options.async;

        let result;

        try {
            result = await sdpAjax(options);

            if(valPath) {
                result = MC.dotObjgetval(result, valPath);
            }

            return result;
        } catch (error) {
            console.error(error);
        }
    }

}

class MC_DETAILS {

    /**
     * 
     * The `MC_DETAILS` class is a JavaScript class that handles the loading and rendering of details for a specific entity in the MC component.
     * To initialize the `MC_DETAILS` class, you need to create an instance of it by calling the constructor function `MC_DETAILS(options, $this)`. The `options` parameter is an object containing the configuration options for the details component, and the `$this` parameter refers to the instance of the MC component that the details component belongs to.
     * 
     * **/
    constructor(options, $this) {
        MC_DETAILS["options"] = options; //No I18N
        this.self = this;
        this.dc = {};
        this.options = {};

        this.callbackhbs = {};
        this.callbackcomponent = {};
        this.popupoption = {};

        this.load(options, $this);
    }

    /**
     * Loads and renders the details component based on the specified options.
     * 
     * options (Object): The configuration options for the details component.
     * $this (Object): The instance of the MC component that the details component belongs to.
     * 
     * **/
    load(options, $this) {
        this.options = {
            "base_url": "/api/v3/", //No I18N
        };
        this.callbackhbs = options.details.options && options.details.options.hbs && options.details.options.hbs.callback;
        this.callbackcomponent = options.details.options && options.details.options.component && options.details.options.component.callback;
        this.popupoption = options.details.options && options.details.options.popupoption && options.details.options.popupoption.callback;

        Object.assign(this.options, MC.prototype.omitObjects($this, true), options.details, {
            "permissions": options.permissions //No I18N
        }, {
            "additional_details": options.additional_details //No I18N
        }, options.details.meta);

        if (options.model) {
            Object.assign(this.options, {
                "model": options.model //No I18N
            });
        }

        var opt = this.options;
        opt["form_data"] = {}; //No I18N
        var layout, meta;
        if (!this.options.base_url) {
            this.options["base_url"] = "/api/v3/"; //No I18N
        }

        opt.layout = [];
        var url = opt.base_url + (opt.layout_entity ? opt.layout_entity : (opt.entity_url ? opt.entity_url : opt.name) + "/" + opt.entity_id); //No I18N

        let layoutname = opt.name + (opt.skip_entityid_tolayout_call ? '' : opt.entity_id) + "_layout"; //No I18N
        let mlayout = MC.prototype.getMapper(layoutname);
        if (!mlayout || url !== mlayout.url || !mlayout.layout) {
            MC.prototype.setMapper(layoutname, {});
            if (!opt.skiplayoutcall) {
                layout = MC.prototype.ajax(url, (opt.entity_name ? opt.entity_name : opt.layout_name));
                let ldata = {
                    "url": url,
                    "layout": layout
                };
                MC.prototype.setMapper(layoutname, ldata);
            }
        } else {
            layout = mlayout.layout;
        }


        var e_data = {};
        if (!opt.skipresponsecall) {/** Used to details page header section display name and panel component render **/
            let storeddata = MC.prototype.getMapper(opt.name+'_tabledata');
            var e_url = opt.base_url + (opt.entity_url ? opt.entity_url : opt.name) + "/" + opt.entity_id;
            if(storeddata && storeddata.records && storeddata.records[opt.entity_id]) {
                e_data = storeddata.records[opt.entity_id];
            } else {
                e_data = MC.prototype.ajax(e_url, opt.entity_name);
                if(storeddata && storeddata.records) {
                    MC_Mapper['module_'+opt.name+'_tabledata'].records[e_data.id] = e_data;
                }
            }
        }
        opt["data"] = { //No I18N
            "entity_data": e_data //No I18N
        };

        if (options.model && options.model.includes($this.mode)) {
            opt.container = opt.container + "_popup"; // No I18N
        }
        if (this.callbackhbs) {
            opt = new MC_CALLBACKS({"mode":"details", "type": "pre"}, opt, $this, this.callbackhbs);
        }
        var _self = this;
        var details_opt = {
            module: opt.name,
            container: opt.container.replace("#", ""), // No I18N
            //container: options.container.id, // No I18N
            data: opt.data,
            entity_id: opt.entity_id,
            additional_details: opt.additional_details,
            //additonal_data: {},
            layout: layout,
            permissions: opt.permissions,
            personalize_key: opt.entity_name + '_details_page', // No I18N
            panel_details: {
                content_panel: {
                    header_panel: {
                        show: true,
                        template_namespace: 'modules', // No I18N
                        template: 'detail-header', // No I18N
                        'class': 'headerbar', // No I18N
                        afterRenderfunction: this.afterHeaderPanelRender,
                    },
                    actions_panel: {
                        show: window.printmode ? false : true,
                        left_panel: {
                            show: true,
                            dataCallback: this.getActionTemplateData,
                            template_namespace: 'modules', //No I18N
                            template: 'detail-header-action', //No I18N
                            afterRenderfunction: this.afterDetailActionRender,
                        }
                    },
                    tabs_panel: {
                        show: true,
                        name: 'details', // No I18N
                        //'class': 'pr20 pl20', //No I18N
                        type: 'tab', //No I18N
                        tabs: (opt.additional_options && opt.additional_options.tabs ? opt.additional_options.tabs : ["details", "history"]), //No I18N
                        active: opt.mode || "details", //No I18N
                        //custom: true,
                        template_namespace: 'modules', // No I18N
                        childAfterRenderfunction: this.afterTabRender,
                        afterRenderfunction: this.gotoActiveTab,
                        settings: {
                            details: {
                                show: true,
                                display_name: translate('common.details'), // No I18N
                                renderfunction: this.viewDetails,
                                dataCallback: this.viewDetailsData,
                                afterRenderfunction: this.afterDetailTemplateRender,
                                template: 'detail-template', // No I18N
                                template_namespace: 'modules', // No I18N
                            },
                            history: {
                                show: true,
                                display_name: translate('common.history'), // No I18n
                                href: '/common/ViewHistory.jsp?id=' + opt.entity_id + '&module=' + opt.additional_options.history.module + (opt.additional_options.history.entity ? '&' + opt.additional_options.history.entity + '=' + opt.name : '') + '&key=' + opt.name + '_history_sort_order', //No I18N
                                HTML: '<div id="ui-framework-design1"><div id="' + opt.name + 'History_DIV"></div></div>', //No I18N
                            },
                            tasks: {
                                show: true,
                                display_name: translate("sdp.admin.task.title"),//No I18N
                                renderfunction: this.loadTaskListview,
                                HTML: '<div id="tasksDiv" class="mt10"></div>' //No I18N
                            },
                            comments: {
                                show: true,
                                display_name: translate("common.comments"),//No I18N
                                renderfunction: this.loadComments,
                                HTML: '<div id="Comments_DIV" class="mt10"></div>' //No I18N
                            },
                            approval_levels: {
                                show: true,
                                display_name: translate("approval.approvals"),//No I18N
                                renderfunction: this.loadApprovals,
                                HTML: '<div id="approval_levels_DIV"></div>' //No I18N
                            }
                        }
                    },
                    right_panel: {
                        show: false,
                        toggle: false,
                        sections: ["properties"], // no i18n 
                        settings: {
                            "properties": { // No I18N
                                show: true,
                                //class: "form-horizontal form-section inplace-edit pb10 pos-rel top0 right0", // No I18N
                                class: "",
                                template: "detail-rightpanel-properties",// No I18N
                                template_namespace: "modules",// No I18N
                                afterRenderfunction: this.loadRightPropertyAction,//After construct HBS
                                dataCallback: this.loadRightPropertySection,//Before construct HBS
                                //renderfunction: this.loadRightPropertySection,
                            },
                        }
                    }
                },
                left_panel: {
                    show: window.externalframe || window.printmode ? false : true,
                    //show: true,
                    renderfunction: this.leftPanelListview,
                    id: opt.name + '_left_panel_list_view', //No I18N
                    class: 'pb10 req-sdbar of-h', //No I18N
                    attributes: {
                        'data-id': 'pinnable-contentfixed' //No I18N
                    },
                    personalize: true,
                    top_panel: {
                        show: true,
                        template_namespace: 'modules', //No I18N
                        //dataCallback: this.loadLeftHeaderSection,//Before construct HBS
                        //afterRenderfunction: this.loadLeftHeaderAction,//After construct HBS
                        template: 'detail-leftpanel-top-section' //No I18N
                    }
                }
            }
        };
        if (opt.additional_options && opt.additional_options.history && opt.additional_options.history.sub_module) {
            details_opt.panel_details.content_panel.tabs_panel.settings.history.href += '&entity_key=' + opt.additional_options.history.sub_module;
        }
        if (opt.details_component) {
            details_opt = jQuery.extend(true, details_opt, opt.details_component);
        }
        

        if(layout && layout.sub_entities) {
            //layout[opt.additional_options.tabs_info.getFromLayout]
            let tabs_info = layout.sub_entities;
            let tabsdata = ["details"];
            if(tabs_info.length){
                let isTaskPresent = false;
                let areCommentsPresent = false;
                let areApprovalsPresent = false;
                let tasksName,commentsName,approvalsName;
                tabs_info.forEach(subEntity =>{
                    if(subEntity.is_subform) {
                        return;
                    }
                    var tabId = (subEntity.singular_name == "task") ? "tasksDiv"  : (((subEntity.singular_name == "comment") ? "Comments" : subEntity.name) + "_DIV"); //No I18N

                    if(subEntity.singular_name == "task") {
                        isTaskPresent = true;
                        tasksName = subEntity.name;
                    } else if(subEntity.singular_name == "comment") {
                        areCommentsPresent = true;
                        commentsName = subEntity.name;
                    } else if(subEntity.singular_name == "approval_level"){ //No I18N
                        areApprovalsPresent = true;
                        approvalsName = subEntity.name;
                    } else {
                        tabsdata.push(subEntity.name);
                        var settings = {
                            show: true,
                            display_name: subEntity.sub_entity && subEntity.sub_entity.display_plural_name,
                            renderfunction: _self.renderCustomtabs,
                            HTML: '<div id="' + tabId + '" class="mt10"></div>' //No I18N
                        };
                        details_opt.panel_details.content_panel.tabs_panel.settings[subEntity.name] = settings;
                    }
                });
                if(isTaskPresent){
                    tabsdata = tabsdata.slice(1,tabsdata.length);
                    tabsdata = ["details",tasksName].concat(tabsdata);
                }
                if(areApprovalsPresent){
                    tabsdata.push(approvalsName);
                }
                if(areCommentsPresent){
                    tabsdata.push(commentsName);
                }
                if(details_opt.panel_details.content_panel.tabs_panel.tabs.includes("associations")) {
                    tabsdata.push("associations");
                }
                tabsdata.push("history");
                details_opt.panel_details.content_panel.tabs_panel.tabs = tabsdata;
            }
        }
        details_opt["model"] = options.model;
        details_opt["mode"] = $this.mode;
        details_opt["display_name"] = opt.display_name;
        details_opt["additional_options"] = {
            "hide_description": (opt.additional_options && opt.additional_options.render_panel_component ? false : true) || false
        };
        if(opt.data.entity_data && (opt.data.entity_data.approval_status || opt.data.entity_data.status) ) {
             /** Header action panel approval badge info added **/
             let actionpanel = details_opt.panel_details.content_panel.actions_panel;
             actionpanel["right_panel"] = {
                 show: true,
                 afterRenderfunction: $MC.approvalsStatus,
                 //HTML: '<div id='+options.name+'"custom-right-panel"></div>' //No I18N
             };
         }
        if (opt.additional_options) {
            Object.assign(details_opt.additional_options, opt.additional_options);
        }

        if(window.printmode) {
            delete details_opt.panel_details.content_panel.tabs_panel.settings.details.dataCallback
            details_opt.printPreview = window.printmode;
            /*details_opt.print_hideFooter = true;
            details_opt.print_hideFilter = true;*/
            let pmeta = {
                "header_panel": {
                    "path": "content_panel.header_panel", // No I18N
                    "default": true // No I18N
                }
            };
            let ptabs = details_opt.panel_details.content_panel.tabs_panel.tabs || ["header_panel", "details"];
            for (const tab of ptabs) {
                pmeta[tab] = {
                    "path": `content_panel.tabs_panel.settings.${tab}` // ES6 template literal
                };
            }
            ptabs = ptabs.filter(tab => tab !== 'approval_levels' && tab !== 'history');
            ptabs.unshift('header_panel');

            details_opt.print_details = {
                print_sections: ptabs,
                print_metainfo: pmeta
            };
            if(window.externalframe) {
                details_opt.print_hideFooter = true;
                details_opt.print_hideFilter = true;
            }
        }
        if (typeof opt.beforeConstructtabs == "function") { //No I18N
            details_opt = opt.beforeConstructtabs(details_opt);
        }
        if (options.model && options.model.includes($this.mode)) {
            details_opt.panel_details.left_panel.show = false;
            details_opt.panel_details.content_panel.class = "noborder"; //No I18N
            var extraoption = {
                open: function () {
                    details_opt.container = details_opt.container + " .zdialog__content"; //Need to check
                    _self.detailcomponentcall(details_opt, $this);
                },
                beforeclose: function() {
                    if($MC.formupdatedindetails) {
                        delete $MC.formupdatedindetails;
                        MC.load({
                            mode: 'list', //No I18N
                        }, opt.name);
                    }
                    if(_self.popupoption && typeof _self.popupoption.close == "function") {
                        _self.popupoption.close(_self,'close');
                        return;
                    }
                }
            };

            MC.prototype.dialogfn(opt, options.dialog_title, extraoption);
        } else {
            _self.detailcomponentcall(details_opt, $this);
        }
        MC.prototype.setMapper($this.name, {//No I18N
            ...this
        }, 'module_options');//No I18N
    }

    /**
     * Function called after the header panel has been rendered.
     * It removes the print subtitle if in print mode.
     */
    afterHeaderPanelRender(opt, entity_data) {
        // Check if the application is in print mode
        let _self = this, selector = '#mc_detail_header';
        let $container = _self.options.container ? jQuery(_self.options.container).find(selector) : jQuery(selector);
        if (window.printmode) {
            // Remove the print subtitle from the header panel
            jQuery("#header_panel_printcontainer div.print-subtitle").remove();
            selector = '#preview-panel';
            $container = jQuery(selector);
        }

        $container.find('[data-id="user_details_popup"]').off('click.mcuser').on('click.mcuser', function(eve, $this) {
            $MC.userDetailspopup(this.dataset.userid);
        });
    }

    afterDetailTemplateRender(tabName, tabSetting, tabs_panel) {
        const _self = this, selector = '[data-id="property-section"]';
        let container = _self.options.container;
        if((_self.options && _self.options.model && _self.options.model.include("details")) && jQuery(container).attr("id").indexOf("_popup") == -1) {
           container = jQuery("#"+jQuery(container).attr("id") + "_popup").get(0);
        }
        const $container = container ? jQuery(container).find(selector) : jQuery(selector);
        const module = tabs_panel.options.module;

        $container.find('[data-id="blockEditEntityFields"]').off('click.mcblockedit').on('click.mcblockedit', () => {
            $MC.initFC(module);
        });
    }

    afterDetailActionRender(opt, entity_data) {
        const _self = this, selector = '#mc_detail_header_action';
        // const ad = _self.options.additional_details || {},
        const $container = _self.options.container ? jQuery(_self.options.container).find(selector) : jQuery(selector);
        const module = _self.name ? _self.name : _self.module;

        if(opt.navigation) {
            $container.find('[data-id="mc_prev"]').off('click.mcprev').on('click.mcprev', () => {
                $MC.details.prev(opt.prevId, module);
            });

            $container.find('[data-id="mc_next"]').off('click.mcnext').on('click.mcnext', () => {
                $MC.details.next(opt.nextId, module, (opt.currId == opt.nextId ?  'true' : 'false'));
            });
        }

        $container.find('[data-id="back_btn"]').off('click.mcback').on('click.mcback', () => MC.load({ mode: 'list' }, module));

        $container.find('[data-id="restore_btn"]').off('click.mcrestore').on('click.mcrestore', () => {
            MC.prototype.restoreFromTrash(entity_data.id, module, "details");
        });

        $container.find('[data-id="delete_btn"]').off('click.mcdelete').on('click.mcdelete', () => {
            MC.prototype.deleteData(entity_data.id, module, "details");
        });

        $container.find('[data-id="edit_btn"]').off('click.mcedit').on('click.mcedit', () => {
            MC.load({ from:'details', mode:'edit', entity_id: entity_data.id }, module);
        });

        $container.find('[data-id="move_to_trash"]').off('click.mctrash').on('click.mctrash', () => {
            MC.prototype.moveToTrash(entity_data.id, module);
        });
        let headercusoptions = _self.options && _self.options.details && _self.options.details.options && _self.options.details.options.header;
        $container.find('[data-id="print"]').off('click.print').on('click.print', () => {
            let url = "/ui/print?entity_id=" + entity_data.id;
            if(typeof headercusoptions.print.pre == "function") {
                url = headercusoptions.print.pre(url, module, entity_data);
            }
            NewWindowP(url, "", "1100", "700", "yes", "center", "yes", "yes");
        });
    }


    /**
     * This function is responsible for calling a detail component with potential callbacks.
     * 
     * ***/

    detailcomponentcall(details_opt, $this) {
        var _self = this;
        // Set an afterRenderfunction for details_opt which gets executed after rendering the component.
        if($this.kb_shortcuts) {
            details_opt.afterRenderfunction = function() {
                _self.kbshortcutsfn(_self.dc);
            };
        }
        // Check and execute a pre-callback from the callbackcomponent object if available.
        if (_self.callbackcomponent) {
            details_opt = new MC_CALLBACKS({"mode":"details", "type": "pre"}, details_opt, $this, _self.callbackcomponent);
        }
        details_opt.disable_DOM_scroll = details_opt.additional_options && details_opt.additional_options.disable_DOM_scroll || false;//skip dom scroll
        // Initialize a new DetailsComponent instance.
        _self.dc = new DetailsComponent(details_opt, $this);
        if (_self.callbackcomponent) {
            new MC_CALLBACKS({"mode":"details", "type": "post"}, _self.dc, $this, _self.callbackcomponent);
        }
        _self.detailcomponentevents(_self.dc);
    }
    // This function is responsible for attaching events to the details component.
    detailcomponentevents(dc) {
        const $container = jQuery(`#${dc.container}`);
        
        $container.off('click.mcfilter').on('click.mcfilter', '#mc_detail_leftpanel_ts #filtersList [data-name="filter-ele"]', (evt) => {
            const dataSet = evt.currentTarget.dataset;
            $MC.changeFilter(evt.currentTarget, (dataSet.filterTrash === 'true' ? 'trash' : dataSet.prop), 'details');
        });
    }

    /**
     * This function sets up keyboard shortcuts for navigating between components.
     * 
     * ***/
    kbshortcutsfn() {
        jQuery(document).off("keypress.mcshortcuts").on("keypress.mcshortcuts", function( event ) {
            if(event.target.nodeName == "BODY" && (event.which == 110 || event.which == 112)) {
                event.preventDefault();
                let keybasedid = event.which == 110 ? "mc_next" : "mc_prev"
                // Trigger a click event on an element with a specific data-id attribute.
                if (!jQuery('[data-id='+keybasedid+']').prop('disabled')) {
                    jQuery('[data-id='+keybasedid+']').trigger("click");
                }
            }
        });
    }

    /**
     * Returns the template data for the action templates in the details component.
     * 
     * opti (Object): The template options.
     * tabSetting (Object): The settings for the current tab.
     * tabs_panel (Object): The configuration options for the tabs panel.
     * 
     * **/
    getActionTemplateData(opti, tabSetting, tabs_panel) {
        let tc = MC_LIST && MC_LIST.options && MC_LIST.options.components && MC_LIST.options.components.list && MC_LIST.options.components.list.tableComp;
        let mapper = MC.prototype.getMapper(this.name+"_tabledata");
        if ((tc && tc.loadedIDs) || mapper) {

            var ids = tc && tc.loadedIDs;
            if(!jQuery.isEmptyObject(mapper)) {
                ids = mapper.ids;
            }
            if(ids) {
                opti["navigation"] = true; //No I18N
                var currIndex = ids.indexOf(this.entity_id.toString());
                opti["currId"] = this.entity_id;
                opti["prevId"] = (currIndex > 0) ? ids[currIndex - 1] : null; //No I18N
                opti["nextId"] = (currIndex < ids.length - 1) ? ids[currIndex + 1] : null; //No I18N
                if(!currIndex < ids.length - 1 && tc && tc.t_obj.table_info.list_info.has_more_rows) {
                    opti["nextId"] = this.entity_id;
                }
            }
        }
        if (this.options && this.options.model) {
            opti["mode"] = this.mode; //No I18N
            opti["model"] = this.options.model; //No I18N
            opti["entity"] = this.name; //No I18N
            opti["entity_id"] = this.entity_id; //No I18N
        }
        /**
         * Details page header section after Edit/Delete button add custom button/UI use belo function to add data
         * "header_custom_action_buttons": "functions"
         * ***/
        if (this.options.details.meta && this.options.details.meta.additional_options && this.options.details.meta.additional_options.header_custom_action_buttons) {
            opti["custom_action_btn"] = execFuncByName(this.options.details.meta.additional_options.header_custom_action_buttons, window);
        }
        return opti;
    }

    /**
     * Renders the left panel list view in the details component.
     * 
     * **/
    leftPanelListview() {
        var listOpt = {
            name: this.name,
            view: "classic", //No I18N
            from: 'details', // No I18N
            current_view: 'classic', // No I18N
            container: '#' + this.name + '_left_panel_list_view', //No I18N
            selectedId: this.entity_id,
            width: "280"
        };
        let opti = MC.prototype.getMapper(this.name);
        let opt = Object.assign({}, MC.prototype.omitObjects(opti, false)); //Only pass object option in these variables
        
        
        if(this.skip_leftpanel_render || opti.use_listviewdata_everywhere) {
            MC.options.name = this.name;
            let calldata = {"callback-data-get": "$MC.details.leftpanel.leftPanelListviewData"};
            Object.assign(opt.list.meta.additional_options,calldata);
        }
        var list = new MC_LIST(opt, listOpt);
        list.options.view = listOpt.view;
        if(!this.skip_leftpanel_render) {
            opti['components']['list'] = list;
        }

        jQuery(document).off('click.columnchoosersave').on('click.columnchoosersave', '.left-panel-settings .col-save-btn', function () { //No I18N
            jQuery(this).closest('.left-panel-settings').find('.btn-group').removeClass('open'); // No I18N
        });
        jQuery('.left-setting-btn').on('click', function () { //No I18N
            jQuery('#columnsort').show(); //No I18N
        });
        jQuery(document).off("click.columnchooserbtn").on('click.columnchooserbtn', '.left-panel-settings #columnsort', function () { //No I18N
            let $this = this;
            setTimeout(function() {
                jQuery($this).hide().closest('.left-panel-settings').find('.btn-group').addClass('open'); // No I18N
            },1)
        });
    }

    /**
     * This method is called to retrieve the data for the view details template in the details component.
     * 
     * tabName (String): The name of the current tab.
     * tabSetting (Object): The settings for the current tab.
     * tabs_panel (Object): The configuration options for the tabs panel.
     * 
     * **/
    viewDetailsData(tabName, tabSetting, tabs_panel) {
        tabs_panel.template_namespace = "modules"; //No I18N
        tabs_panel.template = "detail-template"; //No I18N
        tabs_panel.options["entity_name"] = this.entity_name
    }

    /**
     * This method is called to render the view details template in the details component.
     * 
     * tabName (String): The name of the current tab.
     * tabSetting (Object): The settings for the current tab.
     * tabs_panel (Object): The configuration options for the tabs panel.
     * 
     * **/
    viewDetails(tabName, tabSetting, tabs_panel) {
        let mapper = MC.prototype.getMapper(this.name);
        mapper.entity_id = this.entity_id;
        var opt = Object.assign({}, MC.prototype.omitObjects(mapper, false));
        var opti = Object.assign({}, MC.prototype.omitObjects(mapper, true));
        var listOpt = {
            name: this.name,
            mode: "view", //No I18N
            container: '#' + this.name + '-details', //No I18N
        };
        listOpt = jQuery.extend(true, opti, listOpt);
        var form = new MC_FORM(opt, listOpt);
        mapper['components']['form'] = form;


        var details = this.options.details;
        if (!details) {
            var ent = tabs_panel.options.module;
            var ent_id = tabs_panel.options.entity_id;
            MC.load({
                mode: 'details',
                entity_id: ent_id
            }, ent); //No I18N
            return false;
        }
        if (details.meta.additional_options && details.meta.additional_options.render_panel_component) {
            if (details.meta.additional_options.render_panel_component) {
                var mopt = mapper.module_options; //No I18N
                (form.fc && form.fc.options && form.fc.options.entitydata) && Object.assign(mopt.options.data.entity_data, form.fc.options.entitydata);
                MC_DETAILS.prototype.renderpanelcomponent(mopt);
                jQuery('#' + this.entity_name + '_description').removeClass('hide').addClass('show'); //No I18N
            } else {
                jQuery('#' + this.entity_name + '_description').attr('class', 'hide'); //No I18N
            }
        }
        if (this.options && (!this.options.model || (this.options.model && (!this.options.model.includes(this.mode) || !this.options.model.includes('details'))))) { //No I18N
            MC_DETAILS.prototype.afterTabRender('details', this)
        }
        let rpanel = tabs_panel && tabs_panel.options && tabs_panel.options.rightpanel
         if(rpanel && rpanel.panels&& rpanel.panels.includes("properties")) {
            let mcfcmapper = FC_Mapper && FC_Mapper["form_"+this.name+"_rightform"];
            if(mcfcmapper && form.fc && form.fc.options) {
                mcfcmapper.options.save = form.fc.options.save
            }
        }
    }


    /**
     * Loads the task list view for a specific tab.
     *
     * @param {string} tabName - The name of the tab.
     * @param {object} tabSetting - The settings for the tab.
     * @param {object} tabs_panel - The tabs panel containing the tab.
     */
    loadTaskListview(tabName, tabSetting, tabs_panel) {
        // Use the $tasks object to load the task list view with specified parameters.
        // Parameters: loadTasks(mode, module, entity_id, ...additional_parameters)
        setTimeout(function(){
            $tasks.loadTasks('list', tabs_panel.options.module, tabs_panel.options.entity_id, null, window.printmode ? "printView" : null, null, null);
        },100)
        // Note: The 'list' mode and other parameters should be replaced with actual values.
    }

    /**
     * Loads comments for a specific tab.
     *
     * @param {string} tabName - The name of the tab.
     * @param {object} tabSetting - The settings for the tab.
     * @param {object} tabs_panel - The tabs panel containing the tab.
     */
    loadComments(tabName, tabSetting, tabs_panel) {
        // Determine the status and readonly mode for comments.
        let readonlyMode = false;
        var tabsoptions = tabs_panel.options;
        if(tabsoptions) {
            let status = tabsoptions.additional_details && tabsoptions.additional_details.status;
            // Check if the status indicates a readonly mode.
            if (status.id == "3" || status.id == "4") { //No I18N
                readonlyMode = true;
            }

            let filter = sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[tabsoptions.module+'_filter'];
            let permission = tabsoptions.permissions;
            if( (filter && filter.is_trash) || !permission.add && !permission.edit) {
                readonlyMode = true;
            }
        }
        
        // Define options for showing comments.
        var options = {
            entity: tabsoptions.module,
            entityId: tabsoptions.entity_id,
            readonly: readonlyMode,
            parentSingularName: tabsoptions.entity_name,
            mentionSupport: false
        };

        // Call the function to display comments with the specified options.
        showComments(options);
    }

    /**
     * Loads the left header action for a specific tab.
     * @param {string} tabName - Name of the tab.
     * @param {Object} tabSetting - Settings of the tab.
     * @param {Object} tabs_panel - Panel containing the tabs.
     */
    loadLeftHeaderAction(tabName, tabSetting, tabs_panel) {
        // Get the filter settings for the current module
        let filter = MC.prototype.getMapper(tabs_panel.options.module);
        filter = filter && filter.filter;

        // If advanced filter is enabled, load the view filter component
        if (filter && filter.advancedFilter && filter.advancedFilter.is_enabled) {
            let criteria = filter.advancedFilter.criteria
            
            setTimeout(function() {
                // Get the mapper for the current module
                let mapper = MC.prototype.getMapper(tabs_panel.options.module);
                let mcomp = mapper && mapper.components && mapper.components.list && mapper.components.list.tableComp;

                // Options for the view filter component
                var vfOptions = {
                    skipFields: mcomp.t_obj.options.discarded_fields,
                    metaInfoData: { "metainfo": mcomp.metaInfo }, // Metadata information
                    parentDiv: tabs_panel.options.module + "_viewFilterGrid", // Parent div ID
                    entityComponent: mcomp, // Entity component
                    haveNestedColumns: true,
                    haveMultiString: true,
                    childAsParentFields: ['cm_fields'], // Child fields as parent fields
                    ignoreTypes: ['Color', 'MultiSelect', 'CheckBox', 'Attachment', 'Url', 'Email', 'Phone', 'Html'], // Ignored field types
                    enableSave: false, // Save option disabled
                    applyFn: $MC.setFilteroptions, // Apply function
                    cancelFn: $MC.setFilteroptions, // Cancel function
                    compactView: true, // Compact view
                };
                
                // Initialize the view filter component
                viewFilterComponent.initComponent(vfOptions);

                // Set criteria if available
                setTimeout(function() {
                    if (criteria.length) {
                        viewFilterComponent.setCriteria(criteria);
                        // Update the filter component on icon click
                        jQuery(".viewFiltLeft #viewFiltIcon").off("click").on("click", function() {
                            setTimeout(function() {
                                viewFilterComponent.updateComponent({ "search_criteria": criteria });
                            }, 500);
                        });
                    }
                }, 100);
            }, 10);
        }
        /*if(tabs_panel.options && tabs_panel.options.filter && tabs_panel.options.filter.is_enabled) {

        }*/
    }

    /**
     * Loads the left header section for a specific tab.
     * @param {string} tabName - Name of the tab.
     * @param {Object} tabSetting - Settings of the tab.
     * @param {Object} tabs_panel - Panel containing the tabs.
     */
    loadLeftHeaderSection(tabName, tabSetting, tabs_panel) {
        // Get the mapper for the current module
        let mapper = MC.prototype.getMapper(tabSetting.module);

        // Extract header filter settings from the mapper
        let header_filter = mapper.list && mapper.list.options && mapper.list.options.header && mapper.list.options.header.filter;

        // If header filter is enabled, add it to the tab settings
        if (header_filter.enable) {
            tabSetting["header"] = { "filter": header_filter };
        }

        // Add general filter settings to the tab settings
        tabSetting["filter"] = { "enabled": true };
    }

    /**
     * Loads the right property section for a specific tab.
     * @param {string} tabName - Name of the tab.
     * @param {Object} tabSetting - Settings of the tab.
     * @param {Object} tabs_panel - Panel containing the tabs.
     */
    loadRightPropertySection(tabName, tabSetting, tabs_panel) {
        // Initialize the object to hold the right panel settings
        let rightpanel = {
            //"panels": ["properties","userdetails"],
        };

        // Get the additional options for the tab
        let additional_options = tabSetting && tabSetting.additional_options;

        // Extract the right panel settings from the additional options
        let rpanel = additional_options && additional_options.right_panel;

        // If right panel settings exist and contain panels, add them to the right panel object
        if (rpanel && rpanel.panels) {
            rightpanel.panels = rpanel.panels;
        }
        /*if(rightpanel.panels && rightpanel.panels.length == 0) {
            tabName.show = false;
        }*/

        // Add the right panel settings to the tab settings
        tabSetting["rightpanel"] = rightpanel;
    }

    /**
     * Loads the right property action for a specific tab.
     * @param {string} tabName - Name of the tab.
     * @param {Object} tabSetting - Settings of the tab.
     * @param {Object} tabs_panel - Panel containing the tabs.
     */
    loadRightPropertyAction(tabName, tabSetting, tabs_panel) {
        // Extract entity data from the tabs panel options
        let edata = tabs_panel.options.data.entity_data;

        // Get the default right panel settings and custom right panel settings
        let defaultrightpanel = tabs_panel.options.rightpanel;
        let customrightpanel = tabs_panel.options.additional_options.right_panel;

        // Reference to the current scope
        let _self = this;

        // Extract the panels from the default right panel settings
        let panel = defaultrightpanel.panels;

        // Iterate over each panel
        for (var i = 0; i < panel && panel.length; i++) {
            // Find the element corresponding to the panel ID
            let ele = tabSetting.find("#" + _self.name + "_" + panel[i]);

            // Handle properties panel
            if (panel[i] == "properties") {
                // Display a loading indicator
                jQuery(ele).html(ajaxBar());

                // Delay execution to ensure the loading indicator is displayed
                setTimeout(function () {
                    // Call the rightpanelform function to render the properties panel
                    MC_DETAILS.prototype.rightpanelform(tabs_panel, ele, defaultrightpanel, customrightpanel);
                }, 500);
            } 
            // Handle userdetails panel
            else if (panel[i] == "userdetails") {
                // Get the user ID and construct the URL
                let userid = edata.created_by.id;
                let userurl = `/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId=${userid}&minContent=true&card=true`;


                // Check if custom userdetails settings exist
                if (customrightpanel && customrightpanel.userdetails) {
                    // Check if a custom URL function is provided
                    if (typeof customrightpanel.userdetails.url == "function") {
                        // Call the custom URL function to get the user URL
                        userurl = customrightpanel.userdetails.url(tabs_panel, userurl);
                    }
                }

                // Load the user details HTML into the element
                jQuery(ele).load(userurl);
            } 
            // Handle associations panel
            else if (panel[i] == "associations") {
                // Get the list of associations from the custom right panel settings
                let asslist = customrightpanel && customrightpanel.associations && customrightpanel.associations.list;
                let asslisthtml = '';

                // Iterate over each association in the list
                jQuery.each(asslist, function (index, value) {
                    // Generate HTML for each association
                    asslisthtml += `<div class="disp-t mb10">
                                        <div class="disp-c vmiddle w-150px">
                                            <p class="text-color4 m0 vmiddle" aria-labelledby="associated_changes_count" data-i18n-key="sdp.project.associate.change.title">${translate("common.associations")} ${e_html(value.display_name)}</p>
                                        </div>
                                        <div class="disp-c">
                                            <span class="badge ui1 default-c cur-ptr" id="${value.association_field}" aria-label="${e_html(value.display_name)}" role="button">${value.count}</span>
                                        </div>
                                    </div>`;

                });

                // Construct the HTML for the associations panel
                let asshtml = `<div role="region" aria-label="Associations Summary">
                                    <div class="p10 sb">${translate("common.associations")}</div>
                                    <div class="p10 pt0">${asslisthtml}</div>
                                </div>`;


                // Insert the associations HTML into the element
                jQuery(ele).html(asshtml).promise().done(function() {
                    let ele_self = this;
                    jQuery(ele_self).off("click").on("click", function() {
                        $MC.associationsNav(this.id,this.dataset.name);
                    })
                });
            } 
            // Handle other custom panels
            else {
                // Get the settings for the current panel
                let otherprop = customrightpanel && customrightpanel[panel[i]];

                // Check if custom settings exist for the current panel
                if (otherprop) {
                    // Check if a custom render function is provided
                    if (typeof otherprop.renderhtml == "function") {
                        // Call the custom render function to render the HTML
                        otherprop.renderhtml(edata, jQuery(ele));
                    }
                }
            }
        }
    }

    /**
     * Renders the right panel form for properties.
     * @param {Object} _self - Reference to the current context.
     * @param {Object} ele - HTML element to render the form into.
     * @param {Object} defaultrightpanel - Default right panel settings.
     * @param {Object} customrightpanel - Custom right panel settings.
     */
    rightpanelform(_self, ele, defaultrightpanel, customrightpanel) {
        // Get the fields configuration from custom right panel settings or use default fields
        let fields = customrightpanel && customrightpanel.properties && customrightpanel.properties.fields;
        if (typeof fields == "function") {
            fields = fields(_self);
        } else {
            fields = ["title", "subject"];
        }

        // Get module information from the options
        let options = _self.options;
        let module = MC.prototype.getMapper(options.module);
        let component = module && module.components;

        // Get metadata and layout information
        let meta = MC.prototype.getMapper(options.module + "_meta");
        meta = meta && meta.meta;
        if (!meta && component) {
            meta = component.list && component.list.tableComp.metaInfo;
        }
        let layout = MC.prototype.getMapper(options.module + "_layout").layout;

        // Get entity data
        let e_data = component && component.details && component.details.options.data.entity_data;

        // Initialize an array to store fields
        let fieldsarr = [];
        let keyindex = 1;

        // Iterate over layout sections to extract fields
        for (var i = 0; i < layout.layouts.length; i++) {
            let sections = layout.layouts[i].sections;
            for (var j = 0; j < sections.length; j++) {
                if (sections[j].is_subform) {
                    continue;
                }
                let lfields = sections[j].fields;
                for (var k = 0; k < lfields.length; k++) {
                    if (fields.includes(lfields[k].name)) {
                        let dtype;
                        if (lfields[k].context) {
                            dtype = meta.fields[lfields[k].context].fields[lfields[k].name].display_type;
                        } else {
                            dtype = meta.fields[lfields[k].name].display_type;
                        }
                        if ((!lfields[k].primary_field) && (dtype !== "rich_text_area" && dtype !== "Html" && dtype !== "CheckBox" && dtype !== "Radio" && dtype !== "MultiSelect" && dtype !== "Attachment")) {
                            let lfieldsobj = cl_form.deepClone(lfields[k]);
                            lfieldsobj.position = { col: 1, col_size: 12, row: keyindex };
                            keyindex++;
                            fieldsarr.push(lfieldsobj);
                        }
                    }
                }
            }
        }

        // Get form options
        let formOpt1 = component.form && component.form.fc && component.form.fc.options;
        if (!formOpt1) {
            module.entity_id = MC_DETAILS.options.entity_id;
            formOpt1 = Object.assign({}, MC_FORM.prototype.saveAPI(module, "view", MC.options, {}));
        }
        if ((!meta && jQuery.isEmptyObject(meta)) || !formOpt1) {
            // If metadata is not available or form options are not defined, return empty HTML
            jQuery(ele).html("");
            return;
        }

        // Prepare initial form layout with a limited number of fields
        let skipfieldsarr = fieldsarr.splice(0, 5);
        let sec = {
            attributes: null,
            collapsed_state: "none",
            column_count: "1",
            editable: true,
            fields: skipfieldsarr,
            style_properties: {},
            position: { col: 1, row: 1 },
        }
        let clonelayout = [{
            "sections": [sec]
        }];

        // Set up form options
        let formOpt = {
            metadata: meta,
            template: {
                layouts: clonelayout
            },
            container: jQuery(ele).attr("id"),
            name: MC.options.name + "_right",
            formid: MC.options.name + "_rightform",
            mode: "view",
            entitydata: e_data,
            save: formOpt1.save,
            afterRenderCallback: "$MC.afterrightform" // Callback after form rendering
        };

        // Initialize a new form component
        new FC(formOpt);
    }
    
    /**
     * Loads approvals for a specific tab.
     *
     * @param {string} tabName - The name of the tab.
     * @param {object} tabSetting - The settings for the tab.
     * @param {object} tabs_panel - The tabs panel containing the tab.
     */
    loadApprovals(tabName, tabSetting, tabs_panel){        
        var _self = tabs_panel;
            var params = {
            "entity_name": _self.options.additional_details.name,// No I18N
            "entity_plural_name": _self.options.module,// No I18N
            "changeId": _self.options.entity_id,// No I18N
            "stageId": "",// No I18N
            "approvalStageId": null,// No I18N 
            "contentHolderId": "approval_levels_DIV",// No I18N
            "isCurrentStage":true, //No I18N
            "edit": true,   //No I18N
            "delete": true,// No I18N
            "approve" : true,   //No I18N
            "approvalRestricted" : false,// No I18N
            "isCompletedStage" : false,  //No I18N
            "isNonLogin" : false, //No I18N
            "isAppend" : false,//No I18N
            "support_all_rules":true,//No I18N
            /*"postApprovalAction": function (resp){  //No I18N
                    if(resp){
                        _self.reloadApprovalStatusInfo();
                    }
                },
            "postApprovalSent" : function() { _self.reloadApprovalStatusInfo(); },//No I18N
            "postApprovalLevelDelete": function() {_self.reloadApprovalStatusInfo();}//No I18N*/
        };
     var mlaObject = new MLAComponent(params);
    
    }


    /**
     * Render custom tabs based on the tabName and tabSetting
     * @param {string} tabName - The name of the custom tab to render
     * @param {object} tabSetting - The settings for the custom tab
     * @param {object} tabs_panel - The parent tabs panel containing the options
     */
    renderCustomtabs(tabName, tabSetting, tabs_panel) {
        let tabscall = tabs_panel.options && tabs_panel.options.additional_details;

        let tabarray = tabscall.sub_entities;
        if(tabarray) {
            let curtabs = tabarray.find(se => se.name == tabName);
            let customtabs = new MC_CUSTOMTABS(curtabs, tabs_panel);
        }
    }

    /**
     * This method is called to render the panel component in the details component.
     * 
     * self (Object): The instance of the MC_DETAILS class.
     * 
     * **/
    renderpanelcomponent(self) {
        var _self = this;

        var opt = self.options;
        var metaent = "module_" + opt.name + (opt.skip_entityid_tolayout_call ? '' : opt.entity_id) + "_meta"; //No I18N
        var metaurl = opt.base_url + opt.name + (opt.skip_entityid_tolayout_call ? '' : "/" + opt.entity_id) + "/metainfo"; //No I18N

        var ename = opt.name + (opt.skip_entityid_tolayout_call ? '' : opt.entity_id) + "_meta"; //No I18N
        let mapper = MC.prototype.getMapper(ename);
        if (!mapper || metaurl !== mapper.url || !mapper.meta) {
            MC.prototype.setMapper(ename,{});

            var metainfo = MC.prototype.ajax(metaurl, "metainfo"); //No I18N

            MC.prototype.setMapper(ename,{
                "url": metaurl,//No I18N
                "meta": metainfo//No I18N
            });
        } else {
            metainfo = mapper.meta;
        }

        var permissions = opt.permissions;
        var isModuleActive = !opt.is_active;
        var data = jQuery.extend(true, {}, opt.data.entity_data);
        /** Image token added in description section **/
        if(data.image_token && data.description) {
            data.description = appendImageToken(data.description, data.image_token);
        }
        var panel_opt = {
            id: opt.entity_id,
            name: opt.module + '_description', //No I18N
            base_url: '/api/v3', //No I18N
            entity: opt.name,
            lookup_entity: opt.entity_name,
            data: data,
            metainfo: metainfo,
            canEdit: isModuleActive && permissions.edit,
            expand: true,
            display_name: metainfo.fields.description.display_name,
            container: opt.entity_name + '_description', // No I18N
            detailsHbsTemplate: 'entity_description_template', // No I18N
            print_mode: window.printmode || false
        };


        if (opt.additional_options && opt.additional_options.render_attach_component) {
            panel_opt.attachment = {
                rerender: function (data) {
                    opt.data.entity_data.attachments = data;
                },
                container: opt.additional_details.name + "_description_attachment" //No I18N
            }
        } else {
            panel_opt.attachment = false;
            panel_opt.data.attachments = false;
        }

        if(opt.is_trash) {
            panel_opt.canEdit = false;
            panel_opt.attachment = false;
            panel_opt.data.attachments = false;
        }
        _self.descriptionPC = new PanelComponent(panel_opt);

    }

    /**
     * This method is called after the tab is rendered in the details component.
     * 
     * tabName (String): The name of the current tab.
     * tabSetting (Object): The settings for the current tab.
     * panelObj (Object): The panel object for the tab.
     * 
     * **/
    afterTabRender(tabName, tabSetting, panelObj) {
        let opt = this.options || tabSetting.options;
        if ((opt.model && opt.model.includes(opt.mode)) || !opt.base_path) {
            return;
        }
        if (!opt.history_skip_module) {
            var urlStr = opt.base_path + "module=" + opt.name + "&mode=details&entity_id=" + (tabSetting.entity_id || opt.entity_id);
        } else {
            var urlStr = opt.base_path + "mode=details&id=" + (tabSetting.entity_id || this.entity_id);
        }
        if (window.externalframe) {
            urlStr += `&externalframe=true`;
        }
        urlStr += "#" + tabName;
        window.history.pushState({
            'forwardTo': tabName,
            "spa_skipstate": true
        }, '', urlStr); // No I18N
    }

    /**
     * This method is called to navigate to the active tab in the details component.
     * 
     * tabName (String): The name of the current tab.
     * tabSetting (Object): The settings for the current tab.
     * tabObject (Object): The tab object for the active tab.
     * 
     * **/
    gotoActiveTab(tabName, tabSetting, tabObject) {
        var _self = this;
        var hashURL = window.location.hash.replace("#", "");
        if (this.options.model && this.options.model.includes(this.mode)) {
            var name = tabObject.active || "details";
        } else {
            var name = hashURL || tabObject.active || "details";
        }
        jQuery("#" + tabObject.options.container || _self.$detailsComp.options.container).find("[data-detail-tab=" + name + "]").trigger("click"); // No I18N
    }


}


class MC_FORM {

    /**
     * The `MC_FORM` class is a JavaScript class that handles the loading and rendering of a form component in the MC component.
     * To initialize the `MC_FORM` class, you need to create an instance of it by calling the constructor function `MC_FORM(opt, _self)`. The `opt` parameter is an object containing the configuration options for the form component, and the `_self` parameter refers to the instance of the MC component that the form component belongs to.
     * 
     * 
     * **/
    constructor(opt, _self) {
        MC_FORM["options"] = opt; //No I18N
        this.self = this;
        this.fc = {};
        this.options = {};
        this.block_edit_form = {};

        this.callbackhbs = {};
        this.callbackcomponent = {};
        this.popupoption = {};

        if (opt.mode == "view" || _self.mode == "view") {
            this.viewmode(opt, _self);
        } else {
            this.load(opt, _self);
        }
    }

    /**
     * This method is called to render the form component in view mode.
     * 
     * mode (String): The mode of the form component.
     * jsonval (Object): The JSON value for the form component.
     * 
     * **/
    viewmode(mode, jsonval) {
        let _self = this;
        let $this, options;
        if (jsonval && jsonval.name) {
            let opti = MC.prototype.getMapper(jsonval.name);
            options = Object.assign({}, this.options, MC.prototype.omitObjects(opti, false));
            $this = jQuery.extend(true, this, MC.prototype.omitObjects(opti, true));

            $this.entity_id = jsonval.entity_id;
            $this.entity = jsonval.name;
        } else {
            $this = MC.prototype;
            options = MC.prototype.options;
        }
        this.callbackhbs = options.form.options && options.form.options.hbs && options.form.options.hbs.callback;
        this.callbackcomponent = options.form.options && options.form.options.component && options.form.options.component.callback;
        this.popupoption = options.form.options && options.form.options.popupoption && options.form.options.popupoption.callback;

        const blockEdit = this.block_edit_form;
        blockEdit.initFC = function (mode) {
            jQuery('[data-id="blockEditEntityFields"]').show();
            $this.mode = "details"; //No I18N
            let opt = _self.getformoption(options, $this, mode);
            opt.form_data.container = `${opt.name}-details`;
            opt.form_data.mode = mode || 'view'; //No I18N

            if (!opt.form_data.entity) {
                opt.form_data.entity = opt.entity_url ? opt.entity_url :  opt.form_data.name;
            }

            if (_self.callbackcomponent) {
                opt = new MC_CALLBACKS({"mode":"form", "type": "pre"}, opt, mode, _self.callbackcomponent);
            }
            opt.form_data.print_mode = window.printmode || false;
            _self.fc = new FC(opt.form_data);
            if (_self.callbackcomponent) {
                new MC_CALLBACKS({"mode":"form", "type": "post"}, _self.fc, mode, _self.callbackcomponent);
            }
        };
        this.block_edit_form.initFC('view'); //No I18N
        if (_self.fc && _self.fc.layouts) {
            if (_self.fc.layouts.length === 1 && _self.fc.layouts[0].sections.length === 0) {
                jQuery('#info_label').addClass('hide'); //No I18N
            } else {
                jQuery('#info_label').removeClass('hide'); //No I18N
            }
        }
    }

    /**
     * This method is called to retrieve the form options for rendering the form component.
     * 
     * options (Object): The configuration options for the form component.
     * $this (Object): The instance of the MC component.
     * mode (String): The mode of the form component.
     * 
     * **/
    getformoption(options, $this, mode) {
        const _self = options.form;
        var options_dub = { //No I18N
            base_url: '/api/v3/', //No I18N
            template: {
                layouts: []
            },
            metadata: {},
        };
        _self.options = Object.assign(
            _self,
            options_dub,
            MC.prototype.omitObjects($this, true),
            options.form, {
                permissions: options.permissions
            }, {
                additional_details: options.additional_details
            },
            options.form.meta,
            options.form.options
        );

        var opt = _self.options;
        opt.form_data = {};
        let layout, meta;

        opt.layout = [];
        let e_data = {};

        if (typeof opt.layout_customization === 'function') { //No I18N
            opt = opt.layout_customization(opt);
            layout = opt.template.layouts;
        } else if (opt.name) {
            if (opt.entity_id || opt.layout_entity) {
                /** Layout structure API call **/
                const url = opt.base_url + (opt.layout_entity ? opt.layout_entity : `${opt.name}/${opt.entity_id}`);

                let elayout = opt.name + "_layout";
                let mlayout = MC.prototype.getMapper(elayout);
                if (!mlayout || url !== mlayout.url || !mlayout.layout) {
                    if (!opt.skiplayoutcall) {
                        layout = MC.prototype.ajax(url, opt.layout_name);
                    }
                    MC.prototype.setMapper(elayout,{
                        "url": url,
                        "layout": layout
                    });
                } else {
                    layout = mlayout.layout;
                }
            }
        }

        if (opt.name) {
            /** Meta structure API call **/
            let eid = `${opt.entity_id ? '/' + opt.entity_id : ''}`;
            const metaurl = `${opt.base_url}${opt.entity_url || opt.name}${eid}/metainfo`;
            //(opt.entity_url ? opt.entity_url : opt.entity)
            var metaent = "module_" + opt.name + "_meta";
            let emeta = opt.name + "_meta";
            let mmeta = MC.prototype.getMapper(emeta);
            if (!mmeta || metaurl !== mmeta.url || !mmeta.meta) {
                if (!opt.skipmetacall) {
                    meta = MC.prototype.ajax(metaurl, 'metainfo'); //No I18N
                    MC.prototype.setMapper(emeta,{
                        "url": metaurl,
                        "meta": meta
                    });
                }
            } else {
                meta = mmeta.meta;
            }

            if (opt.entity_id && opt.entity_id !== 'null') { //No I18N
                let edata = opt.name + "_tabledata";
                let mdata = MC.prototype.getMapper(edata);
                let tabledata = mdata && mdata.records;
                if (!opt.skipresponsecall) {
                    /** Get data API call **/
                    const e_url = `${opt.base_url}${opt.entity_url || opt.name}/${opt.entity_id}`;
                    //(opt.entity_url ? opt.entity_url : opt.entity)
                    let res = MC.prototype.ajax(e_url, opt.entity_name);
                    if(tabledata && !jQuery.isEmptyObject(tabledata)) {
                        tabledata[res.id] = res;
                    }
                    Object.assign(e_data, res);
                }
            }
        }
        if (opt && opt.additional_options) {
            const udfffield = opt.additional_options.includeSubFields;
            if (udfffield) {
                try {
                    layout.layouts[0].sections.forEach((section) => {
                        section.fields.forEach((field) => { //Layout field's context applied for UDF fields
                            var mf = meta.fields;
                            if (section.is_subform) {
                                mf = mf[section.referrer].fields;
                            }
                            field.context = udfffield.find((id) => mf[id].fields[field.name]);
                        });
                    });
                } catch (error) {}
            }
        }

        layout = layout || {
            "layouts": [] //No I18N
        };
        layout = cl_form.deepClone(layout);
        meta = cl_form.deepClone(meta);
        let formOpt = {
            metadata: meta,
            template: {
                layouts: layout.layouts
            },
            handleDynamicFAFR:true,
            container: `${opt.module}-container`,
            name: `${opt.module}`,
            formid: `${opt.module}_form`,
            mode: opt.mode == "add" ? "new" : "edit", //No I18N
            entitydata: e_data,
            entityName: e_html(opt.display_name),
            // customform: true,
        };

        if (mode !== "view") { //No I18N
          if(layout.layouts[0] && layout.layouts[0].help_text) {
            layout["help_text"] = layout.layouts[0].help_text;
            this.loadHelpCard(layout.layouts[0].help_text);
            formOpt.rightpane = {
              partial: 'form-helpcontent-template', //No I18N
              classes: 'p10 form-cmtsection text-wrap vtop',  //No I18N
              width: '350px'  //No I18N
            };
          }
        }
        formOpt = Object.assign(formOpt, this.saveAPI(opt,mode,$this,options));
        opt.form_data = layout;
        opt.form_data = Object.assign(formOpt, opt.form_data);
        if (options.model && options.model.includes(mode)) {
            opt.container = opt.container + "_popup"; //No I18N
        }
        if(options.form.ffr && options.form.ffr.enable){
          opt.form_data.ffr={
                id:opt.moduleId,
                entity:opt.entity,
                inbuild_roles:true,
                toggleMode:(form,event,mode)=>{
                    if(mode=="view") {
                      $MC.initFC(opt.entity);
                   }
                }
              };
              opt.form_data.ffr={...opt.form_data.ffr,...options.form.ffr};
        }
        if (this.callbackhbs) {
            opt = new MC_CALLBACKS({"mode":"form", "type": "pre"}, opt, mode, this.callbackhbs);
            opt.form_data.container = `${$this.module}-container`;
            opt.form_data.name = `${$this.module}`;
            opt.form_data.formid = `${$this.module}_form`;
        }
        return opt;
    }

    saveAPI(opt, mode, $this,options) {
        let _self = this;
        let formaction = {};
            opt.base_url = opt.base_url ? opt.base_url : "/api/v3/";//No I18N
            formaction["save"] = {
                url: `${opt.base_url}${opt.entity_url ? opt.entity_url : opt.name}${opt.entity_id ? '/' + opt.entity_id : ''}`, //No I18N
                entity: opt.entity_name,
                exit_alert: (options.model && options.model.indexOf(mode) != -1) ? false : true,
                submit: true,
                postsuccess: (data) => {
                    let mpr = MC.prototype.getMapper(opt.name || MC.options.name);
                    let rightfmapper = FC_Mapper["form_"+(opt.name || MC.options.name)+"_rightform"];
                    let detailfmapper = FC_Mapper["form_"+(opt.name || MC.options.name)+"_form"];
                    let currentform = $this && $this.fc && $this.fc;
                    if(rightfmapper && currentform && rightfmapper.formid && currentform.formid && (rightfmapper.formid !== currentform.formid)) {
                        rightfmapper.entitydata = data[opt.entity_name];
                        rightfmapper.renderForm(true);
                        //mpr.components.details.dc.refreshPanel("panel","content-right");
                    }
                    if(mpr && mpr.components.form && mpr.components.form.fc && mpr.components.form.fc.options.mode == "view") {
                        $MC.formupdatedindetails = true;
                        //return;
                    }
                    if (opt.entity_data) {
                        opt.entity_data = data;
                    }
                    let tabledata = MC.prototype.getMapper((opt.name || MC.options.name)+'_tabledata');
                    if(!tabledata || jQuery.isEmptyObject(tabledata)) {
                        tabledata = {"ids": [], "records": {},"info": {}};
                    }
                    if(opt.mode == "add") {
                        tabledata.ids.push(data[opt.entity_name].id);
                        tabledata.records[data[opt.entity_name].id] = data[opt.entity_name];
                    } else {
                        if(tabledata && !jQuery.isEmptyObject(tabledata) && tabledata.records[data[opt.entity_name].id]) {
                            tabledata.records[data[opt.entity_name].id] = data[opt.entity_name];
                        }
                    }
                    let curpage = ($this.current_page == "details" ? $this.current_page : undefined) || (MC.current_page == "details" ? MC.current_page : undefined);
                    let prevPage = $this.previous_page || MC.previous_page || curpage;
                    if (($this.mode == "details" && opt.entity_id) || curpage == "details") {
                        if($this.block_edit_form && mode != "view") {
                            if(detailfmapper && jQuery("#"+detailfmapper.formid).length) {
                                $this.block_edit_form.initFC("view");
                            }
                        }
                    } else {
                        if (options && options.model && options.model.includes(mode)) {
                            if(_self.popupoption && typeof _self.popupoption.close == "function") {
                                _self.popupoption.close(_self,'save');
                                return;
                            }
                            if(options.form.skip_nextpage_navigation) {
                                jQuery(MC.prototype.dialog).sdp_zcomponent_dialog("close"); //No I18N
                                return false;
                            }
                            if (options.model.includes(prevPage)) {
                                if(prevPage == 'details') {
                                    MC.load({
                                        mode: 'details', //No I18N
                                        entity_id: data[opt.save && opt.save.entity_name ? opt.save.entity_name : opt.entity_name].id
                                    }, opt.entity);
                                } else {
                                    MC.load({
                                        mode: 'list', //No I18N
                                    }, opt.name);
                                }
                            } else {
                                if (opt.mode == "add" || opt.mode == "edit") { //No I18N
                                    jQuery(MC.prototype.dialog).sdp_zcomponent_dialog("close"); //No I18N
                                    MC.load({
                                        mode: 'list', //No I18N
                                    }, opt.name);
                                }
                            }
                        } else {
                            MC.load({
                                mode: 'details', //No I18N
                                entity_id: data[opt.save && opt.save.entity_name ? opt.save.entity_name : opt.entity_name].id
                            }, opt.name);
                        }
                    }
                },
            }
            if (mode !== "view") { //No I18N
                formaction.save.cancel = () => {
                    let curpage = ($this.current_page == "details" ? $this.current_page : undefined) || (MC.current_page == "details" ? MC.current_page : undefined);
                    let prevPage = $this.previous_page || MC.previous_page || curpage;
                    if (mode != "view" && (($this.mode == "details" && opt.entity_id) || curpage == "details")) {
                            $this.block_edit_form.initFC("view");
                    } else {
                        if (options && options.model && options.model.includes(mode)) {
                            if(_self.popupoption && typeof _self.popupoption.close == "function") {
                                _self.popupoption.close(_self,'cancel',$this);
                                return;
                            }
                            if(options.form.skip_nextpage_navigation) {
                                jQuery(MC.prototype.dialog).sdp_zcomponent_dialog("close"); //No I18N
                                return false;
                            }
                            if (options.model.includes(prevPage)) {
                                if(opt.entity_id) {
                                    MC.load({
                                        mode: prevPage ? prevPage : opt.entity_id ? "details" : "list", //No I18N
                                        entity_id: opt.entity_id,
                                    }, opt.name);
                                } else {
                                    MC.load({
                                        mode: prevPage || "list", //No I18N
                                    }, opt.name);
                                }
                            } else {
                                jQuery(MC.prototype.dialog).sdp_zcomponent_dialog("close"); //No I18N
                            }
                        } else {
                            MC.load({
                                mode: (prevPage && prevPage != $this.current_page) ? prevPage : opt.entity_id ? "details" : "list", //No I18N
                                entity_id: opt.entity_id,
                            }, opt.name);
                        }
                    }
                };
            }
            return formaction;
    }

    //Registers the helpcard partial. Used in form component
    loadHelpCard(help_text) {
        var htmlStr = renderhbs(null,'mc-form-helpcontent-template',null,null,'modules',null,true,null,true); //No I18N
        Handlebars.registerPartial('form-helpcontent-template', htmlStr);  //No I18N
    }

    /**
     * This method is called to load and render the form component.
     * 
     * options (Object): The configuration options for the form component.
     * $this (Object): The instance of the MC component.
     * 
     * **/
    load(options, $this) {
        this.callbackhbs = options.form.options && options.form.options.hbs && options.form.options.hbs.callback;
        this.callbackcomponent = options.form.options && options.form.options.component && options.form.options.component.callback;
        this.popupoption = options.form.options && options.form.options.popupoption && options.form.options.popupoption.callback;
        var _self = this;
        let opt = this.getformoption(options, $this, $this.mode);
        let appendvia = opt.container;
        if (options.model) {
            opt.model = options.model;
            var count = jQuery(opt.container).sdp_zcomponent_dialog("getcount");
            if (!jQuery.isEmptyObject(count)) {
                ZComponents.dialog(document.getElementById(opt.container.replace("#",""))).setAttribute("title", options.dialog_title);
                appendvia = opt.container + " .zdialog__content";
            }
        }
        renderhbs(appendvia, 'form', opt, false, 'modules', true, null, () => { //No I18N
            if(jQuery("#formheaderbackbutton").length != 0) {
                // hbs for back button removed and handled in js itself
                const $btn = jQuery('<button>', {
                    'type': 'button', 'class': 'btn btn-default btn-xs fl ml10 mt10', 'rel': 'uitip',
                    'html': `<span class="common-sprite icon-sm common-go-back-icon1"></span>`,
                });

                if(opt.previous_page === 'list' || opt.previous_page === 'add') {
                    $btn.attr('title', translate('common.back.listview'));
                    $btn.off('click.backbtn').on('click.backbtn', () => MC.load({mode:'list'}, opt.name));
                }
                else {
                    $btn.attr('title', translate('back.to.details'));
                    $btn.off('click.backbtn').on('click.backbtn', () => MC.load({mode:'details', entity_id: opt.entity_id }, `${opt.name}`));
                }

                jQuery(opt.container+' #formheaderbackbutton').html($btn);
                initTooltip(opt.container+' #formheaderbackbutton');
            }
            if (_self.callbackhbs) {
                new MC_CALLBACKS({"mode":"form", "type": "post"}, opt, appendvia, _self.callbackhbs);
            }
            if (options.model && options.model.includes($this.mode)) {
                var extraoption = {
                    open: function () {
                        _self.renderForm(opt.form_data, $this, true);
                    }
                };
                if (_self.popupoption && typeof _self.popupoption.beforeopen == "function") { //No I18N
                    extraoption = _self.popupoption.beforeopen(extraoption);
                }
                MC.prototype.dialogfn(opt, options.dialog_title, extraoption, _self);
            } else {
                _self.renderForm(opt.form_data, $this, false);
            }
        });
    }

    /**
     * This method is called to render the form component.
     * 
     * opt (Object): The configuration options for the form component.
     * $this (Object): The instance of the MC component.
     * popup (Boolean): Indicates whether the form component is rendered in a popup or not.
     * 
     * **/
    renderForm(opt, $this, popup) {
        let opti = $this.options.form;
        if (!opt.entity) {
            /** for attachment and form component option changes updated **/
            opt.entity = opti.entity_url || opt.name || $this.name;
        }
        if (this.callbackcomponent) {
            opt = new MC_CALLBACKS({"mode":"form", "type": "pre"}, opt, $this, this.callbackcomponent);
        }
        opt.print_mode = window.print_mode || false;
        this.fc = new FC(opt);
        if (this.callbackcomponent) {
            new MC_CALLBACKS({"mode":"form", "type": "post"}, this.fc, $this, this.callbackcomponent);
        }
        if ($this.options && $this.options.additional_details) {
            jQuery('#' + $this.options.additional_details.name + '_description').removeClass('show').addClass('hide'); //No I18N

            if (!popup) {
                jQuery('#' + $this.module + '-container').on('editLoaded', () => { //No I18N
                    const fullHeight = jQuery(window).height() - (getConsolidatedHeight() + jQuery('#' + $this.module + '-header').outerHeight() + 70); //No I18N
                    jQuery('div[data-cs-field="title"]').closest('.main-pane.disp-c').addClass('pt20').css('height', fullHeight); //No I18N
                });
            }
        }
    }


}

class MC_LIST {

    /**
     * The `MC_LIST` class is a JavaScript class that handles the loading and rendering of a list view component in the MC component.
     * To initialize the `MC_LIST` class, you need to create an instance of it by calling the constructor function `MC_LIST(opt, _self)`. The `opt` parameter is an object containing the configuration options for the list view component, and the `_self` parameter refers to the instance of the MC component that the list view component belongs to.
     * 
     * This property stores the instance of the table component used in the list view.
     * 
     * **/
    constructor(opt, _self) {
        MC_LIST["options"] = opt; //No I18N
        this.options = {};
        this.tableComp = {};

        this.callbackhbs = {};
        this.callbackcomponent = {};

        this.load(opt, _self);
    }

    /**
     * This method is called to load and render the list view component.
     * 
     * options (Object): The configuration options for the list view component.
     * $this (Object): The instance of the MC component.
     * 
     * **/
    load(options, $this) {
        this.options = {};
        
        let actions = options.list.meta && options.list.meta.header && options.list.meta.header.actions || {};
        if (typeof actions === 'object' && !Array.isArray(actions)) {
            // Convert the object into an array of objects
            options.list.meta.header.actions = Object.entries(actions).map(([key, value]) => ({ [key]: value }));
        }
        options.list.options.header = {
            ...options.list.meta.header,
            ...options.list.options.header
        };
        this.options = Object.assign(MC.prototype.omitObjects($this, true), options.list.meta, options.list.options, {
            "permissions": options.permissions
        }, {
            "additional_details": options.additional_details
        }); //No I18N
        if (options.model) {
            this.options = Object.assign(this.options, {
                "model": options.model
            }); //No I18N
        }
        let opt = {
            ...this.options
        };
        opt.view = $this.view || opt.view;
        
        this.commonoption(opt, $this);

        if(!opt.dialog_title) {
            opt.dialog_title = options.dialog_title;
        }
        this.renderListView(opt, false);
    }

    /**
     * This method is called to render the list view component.
     * 
     * opt (Object): The configuration options for the list view component.
     * 
     * **/
    renderListView(opt, dynamicrender) {
        let _self = this;
        var webc = opt.duplicate_name ? opt.duplicate_name : opt.name;
        delete WebComponents.instancePool['webc-' + webc]; //No I18N
        //let parentDiv = opt.container ? opt.container : '#custom-module-content';//No I18N
        let parentDiv = opt.container; //No I18N
        if (opt.model && opt.model.includes(opt.mode)) {
            opt.container = opt.container + "_popup"; //No I18N
            parentDiv = opt.container;
            var count = jQuery(parentDiv).sdp_zcomponent_dialog("getcount");
            if (!jQuery.isEmptyObject(count)) {
                ZComponents.dialog(document.getElementById(parentDiv.replace("#",""))).setAttribute("title", opt.dialog_title);
                parentDiv = parentDiv + " .zdialog__content";
            }
        }
        if(dynamicrender) {
            _self.commonoption(opt, _self);
        }
        let tablemode = opt.header && opt.header.list_mode;
        if(tablemode && tablemode.enable) {
            tablemode.active = sdp_user.CLIENT_CONF[tablemode.personalize_key] && sdp_user.CLIENT_CONF[tablemode.personalize_key].mode ? sdp_user.CLIENT_CONF[tablemode.personalize_key].mode : tablemode.active;
        }
        renderhbs(parentDiv, 'listview', opt, false, 'modules', true, false, function () { //No I18N
            if (_self.callbackhbs) {
                new MC_CALLBACKS({"mode":"list", "type": "post"}, opt, parentDiv, _self.callbackhbs);
            }
            if (opt.model && opt.model.includes(opt.mode)) {
                var extraoption = {
                    open: function () {
                        WebComponents.render('webc-' + webc); //No I18N
                        _self.tableComp = WebComponents.getInstance('webc-' + webc); //No I18N
                    }
                };
                MC.prototype.dialogfn(opt, opt.dialog_title, extraoption);
            } else {
                WebComponents.render('webc-' + webc); //No I18N
                _self.tableComp = WebComponents.getInstance('webc-' + webc); //No I18N
            }
            _self.listViewEvents(parentDiv, opt);
        });
        let mtdata = MC.prototype.getMapper(webc+"_tabledata");
        if(!mtdata) {
            MC.prototype.setMapper(webc+"_tabledata",{});
        }
        if(opt.mode == "list" && this.tableComp && this.tableComp.loadedIDs) {
            mtdata = MC.prototype.getMapper(webc+"_tabledata");
            if(this.tableComp.loadedIDs.length) {
                let ids = [];
                let records = {};
                if(jQuery.isEmptyObject(mtdata)) {
                    ids = this.tableComp.loadedIDs;
                    records = this.tableComp.loadedRecords;
                } else {
                    var concatarray = mtdata.ids.concat(this.tableComp.loadedIDs);
                    ids = concatarray.filter((item, pos) => concatarray.indexOf(item) === pos);
                    records = Object.assign({}, mtdata.records, this.tableComp.loadedRecords);
                }
                MC.prototype.setMapper(webc+"_tabledata",{"ids": ids, "records": records,"info": {"table_info": this.tableComp.t_obj.table_info}});
            } else {
                MC.prototype.setMapper(webc+"_tabledata",{});
            }
        }
        /*if (_self.callbackcomponent) {
            if (typeof _self.callbackcomponent.duration == "function") { //No I18N
                _self.callbackcomponent.duration(this.tableComp);
            }
        }*/
    }
    listViewEvents(parent, opt) {
        parent = jQuery(parent);

        if(opt.mode === 'list') {
            if(opt.is_trash) {
                parent.find('#back_to_all_filter').off('click.backtolist').on('click.backtolist', () => $MC.backtoAllfilter(`${opt.name}`));
            }

            if(opt.header && opt.header.filter && opt.header.filter.enable) {
                parent
                .off('click.mcfilter')
                .on('click.mcfilter', '#mc_listview_container #filtersList [data-filter-ele="true"]', (evt) => {
                    const dataSet = evt.currentTarget.dataset;
                    $MC.changeFilter(evt.currentTarget, (dataSet.filterTrash === 'true' ? 'trash' : dataSet.prop));
                });
            }

            if(opt.header && opt.header.list_mode && opt.header.list_mode.enable) {
                parent.find('#viewBtnGrp').on('click.viewmode', '[data-view-mode]', (evt) => {
                    const view = evt.currentTarget.dataset.viewMode;

                    if(view !== opt.header.list_mode.active) {
                        $MC.tableMode(view, opt.header.list_mode.personalize_key)
                    }
                });
            }

            parent.find('#listcontrolsDiv [data-id="add_new"]').off('click.addnew').on('click.addnew', (evt) => MC.load({mode:'add'}, `${opt.name}`, evt.currentTarget));
        }
    }
    /**
     * Enhances the provided options object with additional default options and executes callbacks if defined.
     * 
     * @param {Object} opt - The options object to be enhanced.
     * @param {HTMLElement} $this - The HTML element which triggered the function call.
     */
    commonoption(opt, $this) {
        // Default additional options
        let default_ao = {
            "callback-after-body-render": "$MC.afterrendertable", // No I18N
            "height": "fx:$MC.setHeight", // No I18N
            "width": "fx:$MC.setWidth", // No I18N
            "row_inputdata": "$MC.rowDataConstruct", // No I18N
            "callback-rowfunction": "$MC.rowDataConstruct", // No I18N
            "delete_callback": "$MC.deletecallback", // No I18N
            "pagination-enabled": "true", // No I18N
            "skipsubrequest": "true", // No I18N
            "static-header": "true" // No I18N
            //"apply-Filter-Table":  "$MC.setFilteroptions",
            //"cancel-Filter-Table": "$MC.setFilteroptions",
        };
        if(window.printmode) {
            default_ao["cell-wrap"] = "true";
            default_ao["add-empty-header-cell"] = "true";
        }

        // Merge default additional options with those provided in the opt parameter
        opt.additional_options = Object.assign({}, default_ao, opt.additional_options);

        this.callbackhbs = opt.hbs && opt.hbs.callback;
        this.callbackcomponent = opt.component && opt.component.callback;

        // Execute HBS callback if it exists and $this is provided
        if (this.callbackhbs) {
            opt = new MC_CALLBACKS({ "mode": "list", "type": "pre" }, opt, $this, this.callbackhbs);
        }

        // Execute filter render callback if defined
        let filterrender;
        if (filterrender = opt.header && opt.header.filter && opt.header.filter) {
            if (typeof filterrender.before_callback === "function") { // No I18N
                opt = filterrender.before_callback(filterrender, opt);
            }
        }
    }
    /**
     * Binds event handlers to elements within the specified container based on data attributes.
     * @param {HTMLElement|jQuery} container - The container within which to bind the event handlers.
     * @param {Object} mapper - An object containing module information for event handling.
     */
    actions(container, mapper) {
        // Convert the container to a jQuery object if it isn't already
        container = jQuery(container);

        // Bind event handler for elements with the data attribute [data-mcdelete]
        container.find("[data-mcdelete]").off("click." + mapper.module).on("click." + mapper.module, function() {
            let data = this.dataset;
            // Call the deleteData method of MC.prototype with the ID and module
            MC.prototype.deleteData(data.id, mapper.module);
        });

        // Bind event handler for elements with the data attribute [data-mcedit]
        container.find("[data-mcedit]").off("click." + mapper.module).on("click." + mapper.module, function() {
            let data = this.dataset;
            // Load the edit mode for the entity with the given ID
            MC.load({ from: 'list', mode: 'edit', entity_id: data.id }, mapper.module);
        });

        // Bind event handler for elements with the data attribute [data-mcrestore]
        container.find("[data-mcrestore]").off("click." + mapper.module).on("click." + mapper.module, function() {
            let data = this.dataset;
            // Call the restoreFromTrash method of MC.prototype with the ID and module
            MC.prototype.restoreFromTrash(data.id, mapper.module, 'list');
        });

        // Bind event handler for elements with the data attribute [data-mctrash]
        container.find("[data-mctrash]").off("click." + mapper.module).on("click." + mapper.module, function() {
            let data = this.dataset;
            // Call the moveToTrash method of MC.prototype with the ID and module
            MC.prototype.moveToTrash(data.id, mapper.module);
        });

        // Bind event handler for elements with the data attribute [data-mcaddnew]
        container.find("[data-mcaddnew]").off("click." + mapper.module).on("click." + mapper.module, function() {
            let data = this.dataset;
            // Load the add mode
            MC.load({ mode: 'add' }, mapper.module);
        });

        // Bind event handler for elements with the data attribute [data-mcload]
        container.find("[data-mcload]").off("click." + mapper.module).on("click." + mapper.module, function() {
            let data = this.dataset;
            let mode = (data.mcload == "details") ? "details" : "list";
            // Load the specified mode (either details or list) for the entity with the given ID
            MC.load({ from: 'list', mode: mode, entity_id: data.id }, mapper.module);
        });

        // Bind event handler for elements with the data attribute [data-mcleftpanleclick]
        container.find("[data-mcleftpanleclick]").off("click." + mapper.module).on("click." + mapper.module, function() {
            let data = this.dataset;
            // Trigger a click on the left panel with the given ID and module
            $MC.details.leftpanel.click(data.id, mapper.module);
        });


        // Bind event handler for elements with the data attribute [data-classicviewcolumnchooser]
        container.find("[data-id=classicviewcolumnchooser]").off("click." + mapper.module).on("click." + mapper.module, function() {
            $MC.classicviewcolumnchooser();
        });
    }

}

class MC_CALLBACKS {
    constructor(ui, options, commonjson, cb) {
        if (cb && typeof cb[ui.type] == "function") { //No I18N
            if (Object.getOwnPropertyDescriptor(cb[ui.type], 'prototype').writable) {
                options = cb[ui.type](options, commonjson);
            } else {
                options = new cb[ui.type](options, commonjson);
            }
        } else {
            if(ui.mode == "list") {
                if(ui.type == "pre") {
                    options = this.precallback(options, commonjson);
                }
                if(ui.type == "post") {
                    options = this.postcallback(options, commonjson);
                }
            }
            if(ui.mode == "form") {
                if(ui.type == "pre") {
                    options = this.precallback(options, commonjson);
                }
                if(ui.type == "post") {
                    options = this.postcallback(options, commonjson);
                }
            }
            if(ui.mode == "details") {
                if(ui.type == "pre") {
                    options = this.precallback(options, commonjson);
                }
                if(ui.type == "post") {
                    options = this.postcallback(options, commonjson);
                }
            }
        }
        return options;
    }

    precallback(options, $this) {
        return options;
    }
    postcallback(options, $this) {
        return $this;
    }
}

/**
 * Represents a custom tabs for MC (Module Customization) in an application. -- Sub entites
 */

class MC_CUSTOMTABS {
    /**
     * Constructs an instance of the MC_CUSTOMTABS class.
     *
     * @param {object} curtabs - The current tabs configuration.
     * @param {object} tabs_panel - The tabs panel containing options and permissions.
     */
    constructor(curtabs, tabs_panel) {
        // Set and initialize options, then render the tabs.
        let opt = this.setoptions(curtabs, tabs_panel);
        this.options = opt;
        this.render(curtabs.name, opt);
    }

    /**
     * Set and initializes the options for the custom tabs.
     *
     * @param {object} curtabs - The current tabs configuration.
     * @param {object} tabs_panel - The tabs panel containing options and permissions.
     * @returns {object} - The split and initialized options.
     */
    setoptions(curtabs, tabs_panel) {
        let permissions = {"permissions": tabs_panel.options && tabs_panel.options.permissions || {} };
        let parentcategory =  {"category": tabs_panel.options && tabs_panel.options.additional_details && tabs_panel.options.additional_details.category || {} };
        if(parentcategory) {
            if(parentcategory.category.name == "custom_module") {
               parentcategory.category.entityURL = "custom_modules";
               parentcategory.category.entityname = "custom_module";
            }
        }
        let parententity = tabs_panel.options.module;
        let parententityid = tabs_panel.options.entity_id;
        let entity = curtabs.name;
        let entityname = curtabs.singular_name;
        let entityid = curtabs.sub_entity.id;
        let rt_obj = {};
            rt_obj[entity] = Object.assign(permissions, parentcategory, {"entity":entity, "entity_name": entityname, "entity_id": entityid, "callbackURL": parententity+"/"+parententityid+"/"+entity, "container": entity+"_DIV","display_name": curtabs.display_name} )
        return rt_obj;
    }

    /**
     * Renders the custom tabs based on the provided options.
     *
     * @param {string} name - The name of the custom tab.
     * @param {object} options - The options for the custom tab.
     */
    render(name, options) {
        let moduleobject = options[name];
        let url = "/api/v3/" + ((moduleobject.category && moduleobject.category.entityURL) ? moduleobject.category.entityURL + "/" : "") + moduleobject.entity_id;
        let rdata = MC.prototype.ajax(url, moduleobject.category && moduleobject.category.name);
        let normallistopt = this.setListviewoption(rdata);

        this.constructMC(moduleobject, rdata, normallistopt);
        
    }

    /**
     * Constructs an MC (Module Customization) instance based on the provided options and data.
     *
     * @param {object} moduleobject - The module object containing permissions and metadata.
     * @param {object} rdata - The data related to the custom tab.
     * @param {object} normallistopt - Options for the list view.
     */
    constructMC(moduleobject, rdata, normallistopt) {
        let permissions = moduleobject.permissions;
        let customtabsmc = {
            "container": document.getElementById(moduleobject.container), //No I18N
            "mode": "list", //No I18N
            "name": moduleobject.entity, //No I18N
            "permissions": permissions,
            "is_active": false, //No I18N
            "display_name": moduleobject.display_name, //No I18N
            "model": ["add","edit","details"],//No I18N
            "module": moduleobject.entity,//No I18N
            "entity_name": moduleobject.entity_name, //No I18N

            "list": { //No I18N
                "meta": {//No I18N
                  "view": "table", //No I18N
                  "getmetainfo": true, //No I18N
                  "callbackURL" : moduleobject.callbackURL, //No I18N
                  "header": { //No I18N
                    "actions": {  //No I18N
                      "bulk_selection": {  //No I18N
                        "enable": false  //No I18N
                      },
                      "add": {  //No I18N
                        "enable": permissions && permissions.edit ? true : false//No I18N
                      },
                      "t_searchicon": {  //No I18N
                        "enable": true,  //No I18N
                        "custom_class": "fl"  //No I18N
                      },
                      "t_column_choos": {  //No I18N
                        "enable": true,  //No I18N
                        "custom_class": "fl"  //No I18N
                      },
                      "pagination_comp": {  //No I18N
                        "enable": true,  //No I18N
                        "custom_class": "btn-group"  //No I18N
                      },
                    },
                  },
                  "additional_options": {//No I18N
                      "personalize_key": moduleobject.entity+"_table_listview", //No I18N
                      "discarded_fields": normallistopt.discardedFields.toString(), //No I18N
                      "nodatabanner_callback": "$MC.$customtbas.noDataBannerHTML",//Function checked code changes updated  //No I18N
                      "discard_without_displayname": true, //No I18N
                      "height": "fx:$MC.$customtbas.setStaticHeight", //No I18N
                      "width": "fx:$MC.$customtbas.setWidth", //No I18N
                  },
                  /** Column list **/
                  "cells": {//No I18N
                    "fields_required": { //No I18N
                      "actioncell": { //No I18N
                        "is_show": permissions && permissions.edit ? true : false, //No I18N
                        "default": "true", //No I18N
                        "type": "icon", //No I18N
                        "data-celltransformer": "$MC.$customtbas.constructActionCell", //No I18N
                        "class": "pos-rel", //No I18N
                        "td_class": "pos-rel" //No I18N
                      }
                    }
                  },
                },
                "options": {},//No I18N
            },
        };
        let coption = $MC.customTabs(moduleobject);
        customtabsmc = Object.assign(customtabsmc, coption);
        customtabsmc.list.meta.cells.fields_required = jQuery.extend({},customtabsmc.list.meta.cells.fields_required,normallistopt.fields);

        let clonetabs = jQuery.extend(false, moduleobject, rdata);
            clonetabs = jQuery.extend(false, clonetabs, normallistopt);
        MC_CUSTOMTABS.data = clonetabs;
        var subEntityCM = new MC(customtabsmc);
    }

    /**
     * Constructs options for a set list view based on provided data.
     *
     * @param {object} rdata - The data related to the custom tab.
     * @returns {object} - The constructed list view options.
     */
    setListviewoption(rdata) {
        let options = {
            fields: {},
            primaryField: "",
            discardedFields: ["is_trashed","description","attachments"], //No I18N
            nonListFieldTypes: ["Html","Attachment","MultiSelect","CheckBox","Radio"], //No I18N
        };

        options.primaryField = rdata.primary_field;
        rdata.sub_entities.forEach(field=>{
          options.discardedFields.push(field.name);
        });

        var isTitlePresent=false, isDescPresent = false;
        rdata.fields.forEach(field =>{
          var isPrimaryField = (options.primaryField == field.name);
          if(field.name != "title" && field.name != "description"){ // for custom fields value should be fetched using cm_fields.<id>
            field.name = "cm_fields." + field.name;
          }else{
            if(field.name == "title"){
              isTitlePresent = true;
            }
            if(field.name == "description"){
              isDescPresent = true;
            }
          }
          if(!options.nonListFieldTypes.includes(field.field_type)){
            if(isPrimaryField){ // for primary field we are constructing detail page navigation in transformPrimaryKey function and field should be defaultly shown.
              options.fields[field.name] = {
                "default": "true", //No I18N
                "hide_label": "true", //No I18N
                "data-celltransformer": "$MC.transformPrimaryKey", //No I18N
              };
            }
          }
        });
        // Title and Description fields are sent in metainfo as they are default fields, hence hiding those if they are not rendered in template.
        if(!isTitlePresent){
          options.discardedFields.push("title");
        }
        if(!isDescPresent){
          options.discardedFields.push("description");
        }

        return options;
    }

}


var $MC = {
    /**
     * This function is called when a filter option is changed. It retrieves the corresponding filter option and performs actions based on the configuration. It also updates the view based on the selected filter.
     * **/
    changeFilter: function (ele, prop, mode) {
        ele = jQuery(ele);
        let opt = MC_LIST.options;
        let header = opt.list.options && opt.list.options.header;
        if (!header) {
            return;
        }
        let optProp = header.filter.options[prop];
        let inputData = opt.input_data;
        let mname = opt.name || opt.module;
        let mpr = MC.prototype.getMapper(mname);
        if(!mname) {
            mname = opt.additional_details.api_plural_name;
            mpr = opt = MC.prototype.getMapper(mname)
        }
        mpr.list.options.header.filter.label = optProp.label;

        let module_data = MC.prototype.getMapper(mname+'_tabledata');
            MC.prototype.setMapper(mname+'_tabledata',{"ids": [], "records": {},"info": {}});

        if (!inputData) {
            inputData = opt["input_data"] = {}; //No I18N
        }
        let records = mpr.components && mpr.components.list && mpr.components.list.tableComp;
        if(records) {
            mpr.components.list.tableComp.loadedIDs = [];
            mpr.components.list.tableComp.loadedRecords = {};
        }
        opt.is_trash = prop == "trash" ? true : false; //No I18N
        if (optProp.action_callback && typeof optProp.action_callback == "function") { //No I18N
            opt = optProp.action_callback(opt);
        }
        jQuery('#module-filters').text(optProp.label); //No I18N
        let tableComp = mpr.components.list.tableComp;
        if(mode == "details") {
            tableComp.refreshTable();
            return;
        }
        if(header.filter.hbsrender_skip) {
            if (optProp.table_info_callback && typeof optProp.table_info_callback == "function") { //No I18N
                optProp.table_info_callback(opt, tableComp.t_obj.table_info);
            }
            tableComp.refreshTable();
            return;
        }

        opt.list.options.header = {
            ...opt.list.meta.header,
            ...opt.list.options.header
        };
        opt = Object.assign(MC.prototype.omitObjects(opt, true), opt.list.meta, opt.list.options, {
            "additional_details": opt.additional_details //No I18N
        });
        opt.mode = "list";
        
        mpr.is_trash = opt.is_trash;
        opt.container = mpr.container;
        if (mpr.model && mpr.model.includes(opt.mode)) {
            opt.container = opt.container + "_popup"; //No I18N
        }
        if(prop !== "trash" && !jQuery.isEmptyObject(mpr.permissions)) {
            mpr.permissions = $MC.getPermissions(mname);
        }
        MC_LIST.prototype.renderListView(opt, true);
    },

    /**
     * Get permissions for a given entity or path.
     *
     * @param {string} path - The API path to fetch permissions for.
     * @param {string} entity_id - The ID of the entity (optional).
     * @returns {Object} - The permissions object for the specified entity or path.
     */
    getPermissions: function(path, entity_id) {
        let linksPath = '/api/v3/' + path; // Construct the API path
        let permissions = {};

        // If an entity ID is provided, append it to the path
        if (entity_id) {
            linksPath += '/' + entity_id; // Construct the full API path for the entity
        }

        linksPath += '/_links'; // Add '_links' to the path to fetch permissions

        // Check if permissions for this path/entity have already been fetched
        if (!permissions.hasOwnProperty(linksPath)) {
            var permissionsObj = {};

            // Make an asynchronous AJAX request to fetch permissions
            sdpAjax({
                acceptODCompatible: true,
                url: linksPath,
                async: false,
                success: function(data) {
                    var links = data._links.links ? data._links.links : data._links;
                    for (var i = 0; i < links.length; i++) {
                        // Set permissions based on data from the API response
                        permissionsObj[links[i].name] = window.printmode || is_from == "associations" ? false : true;
                    }
                }
            });

            // Store the fetched permissions in the permissions object
            if (entity_id) {
                permissions[linksPath] = permissionsObj;
            } else {
                permissions = permissionsObj;
            }
        }

        // Return the permissions for the specified entity or path
        return entity_id ? permissions[linksPath] : permissions;
    },

    changeView: function(mode, name) {
        let mapper = MC.prototype.getMapper(name);
            mapper.mode = "list";
        $CMCommon.loadMC(mapper)
    },
    /**
     * Trash list to normal list click event
     * now we maintain only in custom module specific
     * **/
    backtoAllfilter: function(name) {
        //addPersonalization(name+"_filter",{"is_trash": false});
        //MC_Mapper['module_'+name].components.list.tableComp.refreshTable();
        jQuery('#all_filter').click();
    },
    /**
     * This function constructs the row data object for a table based on the provided table_info. It retrieves the list information and sets the filter based on whether it is in the trash mode or not.
     * **/
    rowDataConstruct: function (table_info) {
        let opti = MC_LIST.options;
        let info = {
            list_info: table_info.list_info
        };
        if (opti.input_data && opti.input_data.list_info) {
            info.list_info = jQuery.extend({}, info.list_info, opti.input_data.list_info)
        }
        let filter = sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[MC.options.name+'_filter'];
        if (opti.is_trash || (filter && filter.is_trash)) {
            info.list_info.filter_by = {
                name: 'trash' //No I18N
            }
        }
        return info;
    },
    /**
     * This function calculates and returns the height for a component based on the current page and view type. It takes into account the window height, header height, chat bar height, and other factors.
     * **/
    setHeight: function () {
        let opti = MC.prototype.getMapper(MC.options.name) || MC_LIST.options;
        if (!opti) {
            return;
        }
        if ((MC.current_page != "list" || !MC.current_page) && opti.mode == "details") {
            return jQuery('#listviewloader').height(); //No I18N
        }
        const listview_height = 70;
        const chatbar_height = typeof is_chathgt != "undefined" ? is_chathgt : 0; //No I18N
        let height = jQuery('#header-placeholder').length == 0 ? (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height - 80) : (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - listview_height); //No I18N
        height = height - jQuery("#listviewloader .listcontrols").outerHeight(true);
        if (opti.model && opti.model.includes('list')) {
            height = jQuery(window).height() - listview_height - 80;
        }
        return height;
    },
    /**
     * This function calculates and returns the width for a component based on the current page and mode.
     * **/
    setWidth: function () {
        let opti = MC.prototype.getMapper(MC.options.name) || MC_LIST.options;
        if ((opti.options && opti.options.mode == "details") || (opti.mode == "details" && jQuery('[data-id=pinnable-headerfixed]').length !== 0)) {
            return '275'; //No I18N
        }
        return jQuery("#listview").width(); // No I18N
    },
    /**
     * This function constructs the action cell HTML for a table row based on the provided table_data. It checks the permissions and generates appropriate action links for editing, moving to trash, restoring from trash, and deleting.
     * **/
    constructActionCell: function (table_data) {
        const additional_details = MC_LIST.options.additional_details;
        const opt = MC_LIST.options;
        const permissions = MC_LIST.options.permissions;
        const rd = table_data.row_data;
        let tableview = sdp_user && sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[opt.name+"_tablemode"];
        let classname = (tableview && tableview.mode == "classic") ? "pl10 mt5" : "ml-5";
        let col_str = `<div class="${classname} tc">
                            <div class="btn-group tc-req-edit bs-noconflict pos-abs ml-5">
                                <span class="cur-ptr cspr menulist icon-xs flat  sdmenu-toggle vmiddle" data-switch="sdmenu" title="${translate("sdp.common.actions")}" rel="uitip" role="button"></span>
                                <ul class="sdmenu-dd" role="menu">`; //No I18N
        let deletehtml = permissions.delete ? `<li><span role="button" class="a-tag-sdmenu" data-mcdelete="true" data-id=${rd.id}>${translate("sdp.common.delete")}</span></li>` : ``;
        let edithtml = permissions.edit ? `<li><span role="button" class="a-tag-sdmenu" data-mcedit="true" data-id=${rd.id}>${translate("sdp.common.edit")}</span></li>` : ``;
        if (permissions.move_to_trash) {
            if (opt.is_trash) {
                if (permissions.restore_from_trash) {
                    col_str += `<li><span role="button" class="a-tag-sdmenu" data-mcrestore="true" data-id=${rd.id}>${translate("sdp.requests.restorerequests")}</span></li>`; //No I18N
                }
                col_str += deletehtml;
            } else {
                col_str += edithtml;
                col_str += `<li><span role="button" class="a-tag-sdmenu" data-mctrash="true" data-id=${rd.id}>${translate("sdp.common.delete")}</span></li>`; //No I18N
            }
        } else {
            col_str += opt.is_trash ? '' : edithtml; //No I18N
            col_str += deletehtml;
        }
        col_str += `</ul></div></div>`; //No I18N
        return col_str;
    },
    /**
     * This function updates the column chooser element in the classic view.
     * **/
    classicviewcolumnchooser: function () {
        jQuery("[data-id=mc-classicview-column-chooser] #columnsort").html(`<span class="cspr clmchooser icon-sm vsub top-1 mr5" aria-hidden="true"></span>${translate("common.columnchooser")}`);
        jQuery("#columnsort").show();
    },
    /**
     * This function initializes the form component for editing in a specified module. It retrieves the form component from the module's mapper and calls the initFC function on it.
     * **/
    initFC: function (module) {
        let mapper = MC.prototype.getMapper(module);
        mapper.components.form.block_edit_form.initFC("edit");
        jQuery('[data-id="blockEditEntityFields"]').hide();
    },
    /**
     * This function opens a user details popup for the specified user ID.
     * **/
    userDetailspopup: function (userid) {
        $previewComponent.load('/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId=' + userid + '&minContent=true&externalframe=true', translate("sdp.inventory.wsRtPanel.userDetails"), '600px')
    },
    /**
     * Get and set id's to render navigation link in details page
     * ***/
    afterrendertable: function(tableinfo, data) {
        const modulename = tableinfo && tableinfo.t_obj && tableinfo.t_obj.options && tableinfo.t_obj.options.entity_name ? tableinfo.t_obj.options.entity_name : MC_LIST.options.name ? MC_LIST.options.name : MC_LIST.options.components.list.options.name;
        let mapper = MC.prototype.getMapper(modulename);

        let tdata = MC.prototype.getMapper(modulename+"_tabledata");
        if(!tdata || jQuery.isEmptyObject(tdata)) { //No I18N
          tdata = {"ids":[],"records":{}}; //No I18N
        }
        let listcomp = mapper.components.list && mapper.components.list.tableComp;
        if(listcomp && listcomp.loadedIDs && MC.current_page == "list") {
          var concatarray = tdata.ids.concat(mapper.components.list.tableComp.loadedIDs); //No I18N
          let ids = concatarray.filter((item, pos) => concatarray.indexOf(item) === pos);
          let records = Object.assign({}, tdata.records, mapper.components.list.tableComp.loadedRecords); //No I18N
          listcomp.t_obj.table_info = tdata && tdata.info && tdata.info.table_info ? tdata.info.table_info : listcomp.t_obj.table_info;
          MC.prototype.setMapper(modulename+"_tabledata",{"ids": ids, "records": records, "info": listcomp.t_obj.table_info}); //No I18N
        }
        let callback = mapper.list && mapper.list.options && mapper.list.options.component && mapper.list.options.component.callback
        if(callback && callback.post && typeof callback.post == "function") {
            callback.post(mapper);
        }
        if(this.customtable) {
            execFuncByName(this.customtable,window);
        }
        MC_LIST.prototype.actions(mapper.container, mapper);
    },
    deletecallback: function(info, data, tinfo) {
        //let mapper = MC.prototype.getMapper(tinfo.metaInfo.plural_name+'_tabledata');
        MC.prototype.setMapper(tinfo.metaInfo.plural_name+'_tabledata',{"ids": [], "records": {},"info": {}});
    },
    details: {
        /**
         * This function is used to navigate to the next entity's details.
         * id - parameter represents the ID of the current entity.
         * name - parameter is used to identify the module.
         * currIndex - parameter seems to indicate whether the current index should be considered when navigating.
         * 
         * **/
        next: function(id, name, currIndex) {
            if(currIndex == "true") {
                let tc = MC_LIST.options.components && MC_LIST.options.components.list && MC_LIST.options.components.list.tableComp;
                if (tc && tc.loadedIDs) {
                    var ids = tc.loadedIDs;
                    let mapper = MC.prototype.getMapper(name+"_tabledata");
                    if(mapper && mapper.ids) {
                        ids = mapper.ids;
                    }
                    var currIndex = ids.indexOf(id.toString());
                    id = (currIndex < ids.length - 1) ? ids[currIndex + 1] : ids[0]; //No I18N
                }
            }
            MC.load({mode: "details", entity_id: id },name);
        },
        /**
         * This function is used to navigate to the previous entity's details.
         * id - parameter represents the ID of the current entity.
         * name - parameter is used to identify the module.
         * 
         * **/
        prev: function(id, name) {
            MC.load({mode: "details", entity_id: id },name);
        },
        leftpanel: {
            name: "",
            mode: "",
            /**
             * 
             * This function is used when a left panel item is clicked. It sets the module name in the name property and then loads the details of the clicked entity.
             * **/
            click: function(id, name) {
                //this.name = name;
                MC.load({from: 'details', mode:'details', entity_id: id, skip_leftpanel_render: true},name);
            },
            /**
             * This function is used to retrieve data for rendering in the left panel list view.
             * **/
            leftPanelListviewData: function(tinfo, moreoption) {
                let ename = (tinfo.t_obj && tinfo.t_obj.options && tinfo.t_obj.options.entity_name) || this.name || MC.options.name;
                let mapper = MC.prototype.getMapper(ename);
                let skipcall = false;
                let tableinfo = mapper.components.list ? mapper.components.list.tableComp : tinfo;
                let info = tableinfo.t_obj.table_info;
                let data = MC.prototype.getMapper((ename) + "_tabledata");
                let rdata = {};
                if(data && data.ids && data.ids.length) {
                    let ids = data.ids;
                    let rdataArray = [];
                    for (let i = 0; i < ids.length; i++) {
                        rdataArray.push(data.records[ids[i]]);
                    }
                    rdata = {
                        [mapper.name]: rdataArray,
                        list_info: info.list_info
                    };
                    if(moreoption && moreoption.lazyloading && mapper.components.list) {
                        if(mapper.components.list.tableComp.t_obj.table_info.list_info.start_index === info.list_info.start_index) {
                            info.list_info = tinfo.t_obj.table_info.list_info;
                            info.list_info.start_index = (info.list_info.start_index + parseInt(info.list_info.row_count));
                            skipcall = true;
                        }
                    }
                } else {
                   skipcall = true;
                }
                if(skipcall) {
                    let url = tableinfo.t_obj.options.defaultpath + tableinfo.t_obj.options.entity_name;

                    delete info.list_info.has_more_rows;
                    delete info.list_info.total_count;
                    delete info.list_info.end_index;
                    delete info.list_info.sort_valuepath;

                    let filter = sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[MC.options.name+'_filter'];
                    if (filter && filter.is_trash) {
                        info.list_info.filter_by = {
                            name: 'trash' //No I18N
                        }
                    } else {
                         delete info.list_info.filter_by;
                    }

                    sdpAjax({
                        url,
                        type: 'GET', // No I18N
                        data: sdpAjaxInputData({list_info: info.list_info}),
                        async: false,
                        cache: false,
                        success: (res) => {
                            if(jQuery.isEmptyObject(data)) {
                                data = {"ids": [], "records": {}, "info": {}};
                            }
                            let resdata = res[tableinfo.t_obj.options.entity_name];
                            let ids = [];
                            let records = {};
                            for(let i=0; i<resdata.length; i++) {
                                ids.push(resdata[i].id);
                                records[resdata[i].id] = resdata[i];
                            }
                            let concatarray = data.ids.concat(ids); //No I18N
                            ids = concatarray.filter((item, pos) => concatarray.indexOf(item) === pos);
                            records = Object.assign({}, data.records, records); //No I18N
                            MC.prototype.setMapper(ename + "_tabledata",{"ids": ids, "records": records, "info": {"table_info": res.list_info}});
                            rdata = {
                                [tableinfo.t_obj.options.entity_name] : resdata,
                                list_info: res.list_info
                            };
                        }
                    });
                }
                return rdata;
            }
        }
    },
    
    /**
     * Recursively searches for an object within a nested object that has a specific key-value pair.
     *
     * @param {Object} obj - The object to search within.
     * @param {string} key - The key to search for.
     * @param {any} val - The value that the key should have.
     * @returns {Object} - The found object or an empty object if not found.
     */
    getObjects: function(obj, key, val) {
        let foundObject = {}; // Initialize an empty object to hold the found object.
        let _self = this; // Store a reference to the current context.

        // Iterate through each property of the object.
        for (var prop in obj) {
            if (!obj.hasOwnProperty(prop)) continue; // Skip properties inherited from prototypes.

            // Check if the current property is an object.
            if (typeof obj[prop] == 'object') {
                // Check if the object has a 'fields' sub-property with the specified 'key'.
                if(obj[prop][key]) {
                    // Construct a key to identify the found object.
                    foundObject['key'] = key;
                    // Copy the found object into the 'foundObject' using the constructed key.
                    foundObject[key] = Object.assign({}, obj[prop][key]);
                    break; // Exit the loop since the desired object is found.
                } else if (obj[prop].fields && obj[prop].fields[key]) {
                    // Construct a key to identify the found object.
                    foundObject['key'] = prop + "." + key;
                    // Copy the found object into the 'foundObject' using the constructed key.
                    foundObject[prop + "." + key] = Object.assign({}, obj[prop].fields[key]);
                    break; // Exit the loop since the desired object is found.
                } else {
                    // If 'foundObject' is still empty, continue searching recursively.
                    if (jQuery.isEmptyObject(foundObject)) {
                        foundObject = jQuery.extend(foundObject, _self.getObjects(obj[prop], key, val));
                    } else {
                        break; // Exit the loop since the desired object is already found.
                    }
                }
            }
        }
        return foundObject; // Return the found object or an empty object if not found.
    },

    /**
     * Get the primary field value for a given entity.
     *
     * @param {string} entity_name - The name of the entity.
     * @param {Object} meta - Metadata object containing information about the entity's fields.
     * @param {Object} entitydata - Data object for the entity.
     * @returns {Object} - An object containing the primary field name and its corresponding value.
     */
    getprimaryfieldvalue: function(entity_name, meta, entitydata) {
        let mapper = MC.prototype.getMapper(entity_name);
        let displayobj = '-'; // Default value if primary field is not found.
        let prifield = entity_name; // Default primary field name.
        let edata = {}; // Initialize an empty object for entity data.
        let componentinfo = mapper && mapper.components && mapper.components.details && mapper.components.details.dc.options;
        let getfieldvalue = false; // Flag to determine if primary field value needs to be fetched.

        if (meta) {
            edata = entitydata ? entitydata : edata; // Use provided entity data or an empty object.
            // Find the mapping for the primary field within the metadata.
            let fieldmapping = this.getObjects(meta, prifield, edata);
            prifield = fieldmapping.key; // Update primary field name.
            getfieldvalue = true; // Set the flag to true indicating primary field value needs to be fetched.
        } else if (componentinfo) {
            edata = entitydata ? entitydata : componentinfo.data.entity_data; // Use provided entity data or data from component info.
            prifield = componentinfo.layout.primary_field; // Get the primary field name from component info.
            getfieldvalue = true; // Set the flag to true indicating primary field value needs to be fetched.
        }

        if (getfieldvalue) {
            displayobj = edata[prifield]; // Get the value of the primary field.
            if (!displayobj) {
                // If the primary field value is not found at the top level, search within sub-objects.
                jQuery.each(edata, function(index, value) {
                    if (value && typeof value == "object" && value[prifield]) {
                        displayobj = value[prifield];
                        prifield = index + "." + prifield; // Update primary field name with sub-object path.
                    }
                });
            }
        }

        return {"field": prifield, "value": displayobj}; // Return an object with the primary field name and value.
    },



    /*
    * Modifies the layout object to render the form in details, add and edit modes.
    * For Details page, primary field and description not needed in layout. so they are removed.
    * For Add and Edit mode the fields are retained.
    * If the custom module supports attachments, Attachment component options are added in a section.
    */
    getFormLayoutconstruct: function(mode, options, type) {
        var moduleObj = options.module_details || options.additional_details || options.form_data;
        var layout = jQuery.extend(true, {}, options.layouts ? options.layouts[0] : options.form_data.layouts[0]);
        var layouts=[];
        let mapper = MC.prototype.getMapper(options.name+'_layout');
            mapper = mapper && mapper.layout
        //removing the default section for details page.
        if (mode == 'view' && !type) {
          var pi = moduleObj && moduleObj.primary_index ? moduleObj.primary_index : mapper.primary_index;
          moduleObj = moduleObj ? moduleObj : mapper;
          layout.sections[pi[0]] ? layout.sections[pi[0]].fields.splice(pi[1], 1) : layout.sections;
          if (moduleObj.desc_index) {
            var descIndex = moduleObj.desc_index[1];
            if (moduleObj.desc_index[0] == pi[0] && moduleObj.desc_index[1] > pi[1]) {
              descIndex--;
            }
            layout.sections[moduleObj.desc_index[0]].fields.splice(descIndex, 1);
          }
        }
        for(var i=0; i<layout.sections.length; i++) {
          if(layout.sections[i].referrer && layout.sections[i].referrer=='attachments'){
            var entity_data = options.data ? options.data.entity_data : options.form_data ? options.form_data : options;
               layout.sections[i].title = translate("sdp.common.attachments"); //No I18N
               //layout.sections[i].name = "-1"; //No I18N
               layout.sections[i].name = translate("sdp.common.attachments"); //No I18N
                layout.sections[i].type='attachments'; //No I18N
                layout.sections[i].id='attachments'; //No I18N
                layout.sections[i].container_id= 'cmattachment'; //No I18N
                layout.sections[i].wrapper= false;
                let eid = this.entity_id!=null?this.entity_id: options.entity_id;
                layout.sections[i].options= {
                    title: true,
                    static_title: true,//118182 -- Attachment section static title added in MC component
                    layouts: true,
                    api: false,
                    upload_api: true,
                    upload: (entity_data === null || !entity_data.is_trashed) && !moduleObj.is_active && (!!options.permissions && options.permissions.edit),
                    is_odapi: true,
                    download: true,
                    enable_delete: !moduleObj.is_active && (entity_data === null || !entity_data.is_trashed),
                    entity: moduleObj.api_plural_name,
                    entity_id: eid,
                    entity_upload: this.entity_id ? true : (options.entity_id? true: false),
                };
                if(moduleObj && moduleObj.metadata && moduleObj.metadata.fields.attachments && moduleObj.metadata.fields.attachments.href) {
                  var href = moduleObj.metadata.fields.attachments.href.replace("/attachments",""); //No I18N
                  if(eid) {
                    href = href.replace("/"+moduleObj.api_plural_name+"/"+eid,"/"+moduleObj.api_plural_name);
                  }
                  layout.sections[i].options.entity = href.slice(1);
                }
                if(options.is_trash || window.printmode) {
                  layout.sections[i].options.upload = false;
                  layout.sections[i].options.enable_delete = false;
                }
                layout.sections[i].fields= [];
                if ('view' === mode) {
                  layout.sections[i].options.ondelete = [];
                  layout.sections[i].options.is_odapi_v2 = true;
                  if(entity_data.status && (entity_data.status.internal_name == "suspended" || entity_data.status.internal_name == "retired")) {
                    layout.sections[i].options.enable_delete = false;
                  }
                  let mstatus = mapper && mapper.status;
                  if(type == "subentity" && (mstatus && (mstatus.internal_name == "suspended" || mstatus.internal_name == "retired"))) {
                    layout.sections[i].options.enable_delete = false;
                  }
                  layout.sections[i].name = "-1";
                }else {
                  delete layout.sections[i].options.ondelete
                  layout.sections[i].options.is_odapi_v2 = false;
                  layout.sections[i].options.title = false;
                }
          }
        }
        layouts.push(layout);

        return layouts;
    },
    /**
     * Removes subform sections from the layout and returns a modified layout.
     * @param {string} mode - The mode of the form (e.g., "edit" or "view").
     * @param {boolean} condition - true/false for if condiiton 
     * @param {array} layout - The original layout of the form containing sections.
     * @returns {array} - A modified layout with subform sections removed.
     */
    getFormwithoutsubform: function(mode, layout, condition) {  
        for (let i = 0; i < layout.length; i++) {
            var layoutObj = layout[i];
            var sectionArray = layoutObj.sections;
            let j = 0;
            while (j < sectionArray.length) {
                var sectionObj = sectionArray[j];
                if ( (condition && sectionObj.is_subform) || (!condition && !sectionObj.is_subform)) {
                    // Remove the subform section from the array.
                    sectionArray.splice(j, 1);
                    // Update the index to account for the removed section.
                    j = (j === 0) ? 0 : (j - 1);
                } else {
                    // Move to the next section.
                    j = j + 1;
                }
            }
        }
        return layout;
    },
    /**
     * Extracts subform sections from the layout and returns a layout containing only subform sections.
     *
     * @param {string} mode - The mode of the form (e.g., "edit" or "view").
     * @param {array} layout - The original layout of the form containing sections.
     * @returns {array} - A layout containing only subform sections.
     */
    getFormsubformalone: function(mode, layout) {
        for (let i = 0; i < layout.length; i++) {
            var layoutObj = layout[i];
            var sectionArray = layoutObj.sections;
            let j = 0;
            while (j < sectionArray.length) {
                var sectionObj = sectionArray[j];
                if (!sectionObj.is_subform) {
                    // Remove non-subform sections from the array.
                    sectionArray.splice(j, 1);
                    // Update the index to account for the removed section.
                    j = (j === 0) ? 0 : (j - 1);
                } else {
                    // Move to the next section.
                    j = j + 1;
                }
            }
        }
        return layout;
    },
    /**
     * Constructs a form with the specified options and mode.
     *
     * @param {object} opt - The options for constructing the form.
     * @param {string} mode - The mode of the form (e.g., "new", "edit", "view").
     * @returns {object} - The updated options object with the constructed form data and layout.
     */
    formconstruct: function(opt, mode) {
        mode = mode ? mode : "new"; // Default mode is "new"

        let metadata = opt.form_data.metadata;
        let udfmeta = metadata && metadata.fields;
        // Define edit mode settings for specific field types
        opt.form_data.formatValues = function(search_data, field_name,data, event){
            var fields = data.metadata.fields;
            if(fields != null){
               for(var field in fields){
                  if(fields[field].type == "udf"){ //No I18N
                    var udf_fields = fields[field].fields;
                        if(udf_fields[field_name] && udf_fields[field_name].lookup_entity){ //No I18N
                          for(var i=0;i<search_data.length;i++){
                             if(search_data[i].site != null){
                               search_data[i].name = search_data[i].name +", "+ search_data[i].site.name;
                             }
                             search_data[i].name = search_data[i].text ? search_data[i].text : search_data[i].name;
                          }
                        }
                  }
               }
            }
        };
        opt.form_data.edit = {
            "fields": {
                "MultiSelect": {
                    "maxvalues": 25,
                    "selection_handler": false
                },
                "CheckBox": { "maxvalues": 25 },
                "description": { "images_api": true }
            },
            "defaults": {
                "lookup": {
                    "clear": true
                }
            }
        };
        
        // Get the form layout construct based on mode and entity type
        var contructlayout = $MC.getFormLayoutconstruct(mode, opt, 'subentity');
        
        // Clone the layout for later use
        var contructlayout_clone = jQuery.extend(true, [], contructlayout);
        
        // If the mode is "view" or "edit" within list view, remove subform sections
        if (mode == "view" || (opt.mode == "list" && mode == "edit")) {
            contructlayout = $MC.getFormwithoutsubform(mode, contructlayout, true);
        }
        if (mode == "view") {
            let edata = opt.form_data && opt.form_data.entitydata;
            if(edata) {
                var fields = metadata.fields;
                if(fields != null){
                    for(var field in fields){
                        if(fields[field].type == "udf"){ //No I18N
                            var udf_fields = fields[field].fields;
                            for(var udf_field in udf_fields) {
                                    var data = edata[field][udf_field];
                                    const processEntry = data => {
                                        if (data && data.site && data.site.name) {
                                                                  data.name = data.text ? data.text : data.name + ", " + data.site.name; //No I18n
                                        }
                                    };
                                    if (!Array.isArray(data)) {
                                        processEntry(data);
                                    } else {
                                        data.forEach(processEntry);
                                    }
                            }
                        }
                    }
                }
            }
        }
        
        // If the mode is "edit" within details view, remove subform sections
        if (opt.mode == "details" && mode == "edit") {
            contructlayout = $MC.getFormwithoutsubform(mode, contructlayout, true);
        }
        
        // Update the form data with the constructed layout
        opt.form_data.layouts = contructlayout;
        opt.form_data.template.layouts = contructlayout;

        // Determine if the user has edit permissions
        let perm = opt.permissions || {};
        opt.form_data.canEdit = perm.edit ? perm.edit : (perm.add && perm.mode != "details") ? perm.add : false;

        // Define an afterRenderCallback function for view mode
        opt.form_data["afterRenderCallback"] = function(formopt) {
            if (mode == "view" && jQuery("#" + formopt.container + "_subforms").length == 0) {
                var formopt1 = jQuery.extend(true, {}, formopt);
                delete formopt1.options.afterRenderCallback;
                
                // Check if subform sections are present
                var lay2 = $MC.getFormsubformalone(mode, contructlayout_clone);
                if(externalframe && formopt.entitydata.attachments && formopt.entitydata.attachments.length == 0) {
                  /** Skip attachment section in UI **/
                    for(var m=0; m<lay2.length; m++) {
                        let mlay = lay2[m].sections;
                        for(var n=0; n<mlay.length; n++) {
                            let msec = mlay[n];
                            if(msec.is_subform && msec.referrer) {
                                lay2[m].sections.splice(n, 1);
                            }
                        }
                    }
                }
                // Create a container for subforms
                jQuery("#" + formopt1.container).after('<div id="' + formopt1.container + '_subforms" class="mt15"></div>');
                formopt1.container = formopt1.container + "_subforms";
                formopt1.formid = formopt1.formid + "_subforms";
                formopt1.mode = "view";
                formopt1.layouts = lay2;
                formopt1.template.layouts = lay2;
                
                // Create and initialize the subform
                new FC(formopt1);
            }
        };
        
        return opt;
    },
    /**
     * Set placeholders for lookup fields in the given fields object.
     *
     * @param {object} fields - The fields object to set placeholders for.
     */
    fieldplacholder: function(fields) {
        // Iterate through each field in the fields object
        Object.keys(fields).forEach(function(key) {
            // Check if the field type is 'lookup'
            if (fields[key].type === 'lookup') {
                // Set the placeholder for the lookup field using a translated message
                fields[key].placeholder = translate('form.select.placeholder', [fields[key].display_name]);
                
                // If the lookup field has nested fields, recursively set placeholders
                if (fields[key].fields && !jQuery.isEmptyObject(fields[key].fields)) {
                    $MC.fieldplacholder(fields[key].fields);
                }
            } else if (fields[key].type === 'udf') { // Check if the field type is 'udf'
                let udf_fields = fields[key].fields;
                
                // Iterate through each udf field in the udf_fields object
                Object.keys(udf_fields).forEach(function(key1) {
                    // Check if the udf field type is 'lookup'
                    if (udf_fields[key1].type === 'lookup') {
                        // Set the placeholder for the lookup field using a translated message
                        udf_fields[key1].placeholder = translate('form.select.placeholder', [udf_fields[key1].display_name]);
                    }
                });
            }
        });
    },
    /**
     * Transforms the primary key value into a clickable link for the table view.
     *
     * @param {object} table_data - The table data object.
     * @param {object} data - The data associated with the primary key.
     * @param {object} tableinfo - Information about the table.
     * @returns {string} - The HTML string representing the transformed primary key link.
     */
    transformPrimaryKey: function(table_data, data, tableinfo) {
        var value,fieldId = table_data.head_data.id;
        const opt = MC_LIST.options;
        if(fieldId.includes(".")){
            fieldId = fieldId.split(".")[1];
            value = table_data.row_data.cm_fields[fieldId];
        } else {
            value = table_data.row_data[fieldId];
        }
        var title = `title="${e_html(e_attr(value))}"`;
        let click = window.printmode ? '' : `data-mcload="details" data-id=${table_data.row_data.id}`;
        var ret_str = `<span role="button" class="a-tag vmiddle text-overflow disp-ib fw" ${click}><span rel="uitip" mode_html="true" mode_ellipsis="true" ${title}>` + e_html(value) + `</span></span>`;//No I18N
        return ret_str;
    },
    $customtbas: {
        /**
         * Constructs the action cell for a table row, including edit and delete actions if permitted.
         *
         * @param {object} table_data - The table data object.
         * @returns {string} - The HTML string representing the action cell.
         */
        constructActionCell: function(table_data) {
            let permissions = MC.options.permissions;
            if(permissions.edit || permissions.delete){
                const opt = MC_LIST.options;
                const rd = table_data.row_data;
                let col_str = '<div class="ml-5 tc"><div class="btn-group tc-req-edit bs-noconflict pos-abs ml-5">';//No I18N
                    col_str += `<span class="cur-ptr cspr menulist icon-xs flat  sdmenu-toggle vmiddle" data-switch="sdmenu" title=${translate("sdp.common.actions")} rel="uitip" role="button"></span>`;//No I18N
                    col_str += '<ul class="sdmenu-dd" role="menu">';//No I18N
                if(permissions.edit){
                    col_str += `<li><span role="button" data-mcedit="true" class="a-tag-sdmenu" data-id=${rd.id}>${translate("sdp.common.edit")}</span></li>`;//No I18N
                }

                if(permissions.delete){
                    col_str += `<li><span role="button" data-mcdelete="true" class="a-tag-sdmenu" data-id=${rd.id}>${translate("sdp.common.delete")}</span></li>`;//No I18N
                }

                col_str += `</ul></div></div>`;//No I18N
                return col_str;
            }
        },

        /**
        * Deletes the data associated with the specified entity_id.
        * 
        * entity_id (String): The ID of the entity to be deleted.
        * 
        * **/
        deleteDataSubentity(entity_id, name, returnTo) {
          let mname = name || MC_LIST.options.name
          const module_options = MC.prototype.getMapper(mname);
          const display_name = e_html(module_options.display_name);

          let module_data = MC.prototype.getMapper(mname+'_tabledata');
          const deleteFn = (conf) => {
              if (conf) {
                  const plural_name1 = module_options.name;
                  const plural_name = module_options.list.meta.callbackURL || plural_name1;
                  sdpAjax({
                      url: `/api/v3/${plural_name}/${entity_id}`,
                      method: 'DELETE', //No I18N
                      success: (resp) => {
                          showalert('success', translate('common.delete.success'), 'isAutoHide=true'); //No I18N
                          if(module_data && !jQuery.isEmptyObject(module_data)) {
                              MC.prototype.setMapper(mname+'_tabledata',{"ids": [], "records": {},"info": {}});
                          }
                          MC.load({
                              mode: 'list' //No I18N
                          }, plural_name1);
                      },
                      async: false
                  });
              }
          };
          const options = `title=${translate('sdp.common.delete')}, message=${translate('common.delete.confirm')}, submitbutton=${translate('sdp.common.ok')}, cancelbutton=${translate('sdp.common.cancel')}, closebutton=yes, closeOnEscKey=yes`; //No I18N

          showconfirm(true, options, deleteFn, true);
        },
        /**
         * Generates the HTML for the "no data" banner, which is displayed when there are no records to show in the table.
         *
         * @param {object} table_data - The table data object.
         * @returns {string|boolean} - The HTML for the banner or false if search filters are active.
         */
        noDataBannerHTML: function(table_data) {
            const listInfo = table_data.t_obj.table_info.list_info;
            const search_filter = listInfo && listInfo.search_criteria && (!jQuery.isEmptyObject(listInfo.search_criteria) || listInfo.search_criteria.length > 0);
            if(search_filter) {
              return false;
            } else {
                let permissions = MC.options.permissions;
                let iconurl = MC_CUSTOMTABS.data && MC_CUSTOMTABS.data.icon;
                if(!window.printmode && (iconurl || iconurl == null)) {
                    let addBtn = permissions && permissions.edit ? `<button class="btn btn-primary" data-mcaddnew="customtabs" data-i18n-key="common.createnew">${translate("common.createnew")} ${e_html(MC.options.display_name)}</button>` : ``;
                    let urldata = iconurl && iconurl['content-url'] ? iconurl['content-url'] : '/images/no-image-icon.svg';
                    let emptyrecords = translate('common.no.record.found');
                    return `<div id="${MC.options.entity_name}_nodatabanner" class="mt20 h-500px"><div class="disp-t fw tc"><img rel="uitip" alt="${e_attr(MC.options.display_name)}" title="${e_attr(MC.options.display_name)}" src="${urldata}" height="130" width="180" class=""></div><div class="disp-t fw tc maxw-500px m-center"><p class="font-medium2 lh24 mb20 ww-bw">${emptyrecords}</p>${addBtn}</div></div>`;
                } else {
                    let addBtn = permissions && permissions.edit ? `<span class="text-link ml5" data-mcaddnew="customtabs" data-i18n-key="common.createnew" role="button">${translate("common.createnew")} ${e_html(MC.options.display_name)}</span>` : ``;
                    let hgt = window.printmode ? '' : 'h-500px';
                    return `<div id="` + MC.options.entity_name + `_nodatabanner" class="${hgt}"><div class="alert-nodata mt10"><span class="msg"><span data-i18n-key="common.entity.notavailable">${translate("common.entity.notavailable",[e_html(MC.options.display_name)])}.</span>${addBtn}</span></div></div>`;
                }
            }
        },
        setStaticHeight: function() {
            return window.printmode ? "100%" : 420;
        },
        setWidth: function() {
            return "100%";//No I18N
        },
    },
    callbackSearchFunction: function(type, tb_obj, $table) {
        let modulename = MC.prototype.getMapper(MC.options.name);
        MC.prototype.setMapper(MC.options.name+'_tabledata',{"ids": [], "records": {},"info": {}});
        let listcomponent = modulename.components && modulename.components.list && modulename.components.list.tableComp;
        listcomponent.refreshTable('search'); //No I18N
    },
    tableMode: function(type, key) {
        ClientUtil.addUserPersonalization("mc_listview_mode",{"mode": type},{internalKey: key});
        let mapper = MC.prototype.getMapper(MC_LIST.options.name);
        mapper = mapper && mapper.components && mapper.components.list && mapper.components.list.options;
        let pkey = "_table_listview";
        if(type == "classic") {
            pkey = "_table_listview_classic";
        }
        mapper.additional_options.personalize_key = (mapper.name || mapper.module) + pkey;
        let actions = mapper.header && mapper.header.actions;
        if(actions.filter(val => val["t_searchicon"]).length) {
            let tableview = sdp_user && sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[MC_LIST.options.name+"_tablemode"]; //No I18N
            if (tableview && tableview.mode == "classic") {
                actions.filter(val => val["t_searchicon"])[0].t_searchicon.enable = false; //No I18N
            } else {
                actions.filter(val => val["t_searchicon"])[0].t_searchicon.enable = true; //No I18N
            }
        }
        if(mapper) {
            MC_LIST.prototype.renderListView(mapper, true);
        } else {
            var list = new MC_LIST(opt, MC.options);
        }
    },
    /**
      * Render an approvals status using Handlebars template.
      *
      * @param {Object} ui - An object containing information about the target HTML element.
      * @param {Object} data - Data to be injected into the Handlebars template.
      */
     approvalsStatus: function(ui, data) {
         renderhbs("#"+ui.id, 'detail-header-action-right-panel', data, false, 'modules', true);
     },
     checkActionsfn: function(data) {
        data.column_settings = {
            position: 1
        };
        return data;
     },
     afterrightform: function(finfo) {
        let ele = jQuery("#"+finfo.formid).find("[data-id=form-inner-wrapper] .form-group");
        ele.append(`<div class="disp-ib fw pl10 pt10">
                        <button id="more-prop-btn" class="btn btn-link pl0" data-i18n-key="request.properties.more" type="button">${translate('request.properties.more')}</button>
                    </div>`).promise().done(function() {
                        ele.find("#more-prop-btn").off("click.more").on("click.more", function() {
                            $MC.moreproperties('properties',finfo.metadata.plural_name);
                        });
                    });

     },
     highlightto: function(ele) {
        /** Highlights Properties section by blinking the border of the Properties section */
        ele.css({ boxShadow: "#ffefe4 0px 0px 2px 5px" });  //NO I18N
        setTimeout(function() {
            ele.css({ boxShadow: "none" }); //NO I18N
        }, 500);
     },
     moreproperties: function(tab, mname) {
        let mapper = MC.prototype.getMapper(mname)
        let dc = mapper && mapper.components && mapper.components.details && mapper.components.details.dc;
        let splitdc = dc.currentPath.split(".");
        if(splitdc[splitdc.length - 1] !== "details") {
            jQuery('[data-name="details"]').trigger('click');
        }
        //highlightfn(jQuery('[data-id=property-section]').get(0),'autoscroll=true,highlight=true');
        let ele = jQuery('[data-id=property-section] .form-template');
        let container = jQuery('html, body');   //No I18N
        if(ele.offset().top > jQuery(window).height) {
            container.stop( true, true ).animate({
                scrollTop: ele.offset().top - 70
            }, 300, function() {
                $MC.highlightto(ele);
            });
        } else {
            $MC.highlightto(ele);
        }
     },
     setFilteroptions: function(criteria) {
        let modulename = MC.options.name || this.options.entity_name;
        MC.prototype.setMapper(modulename+"_tabledata",{"ids": [], "records": {},"info": {}});
        let route = MC.prototype.getMapper(modulename);
        if(criteria && !isEmpty(criteria)) {
            route.components.list.tableComp.t_obj.table_info.list_info.search_criteria = criteria;
        } else {
            delete route.components.list.tableComp.t_obj.table_info.list_info.search_criteria;
        }
        route.components.list.tableComp.refreshTable("refresh");
        if(!route.filter) {
            route.filter = {}
        }
        if(criteria && !isEmpty(criteria)) {
            route.filter["advancedFilter"] = {
                "is_enabled": true,
                "criteria": criteria
            };
        } else {
            route.filter["advancedFilter"] = {
                "is_enabled": false,
            };
        }
     },
    associationsNav(key, mname) {
        //\'associations\',
        let mapper = MC.prototype.getMapper(mname)
        let dc = mapper && mapper.components && mapper.components.details && mapper.components.details.dc;
        let splitdc = dc.currentPath.split(".");
        if(splitdc[splitdc.length - 1] !== "associations") {
            jQuery('[data-name="associations"]').trigger('click');
        }
        let ele = jQuery('#Associations_DIV');
        $MC.highlightto(ele);
    },
    customTabs(moduleobject) {
        let option = {};
        let modules = moduleobject.category && moduleobject.category.name;
        switch(modules) {
            case "custom_module": //No I18N
                option = {
                    "form": { //No I18N
                        "meta": {//No I18N
                          "layout_entity": "custom_modules/"+moduleobject.entity_id, //No I18N
                          "layout_name": "custom_module", //No I18N
                          "entity_name": moduleobject.entity_name, //No I18N
                          "entity_url": moduleobject.callbackURL, //No I18N
                          "additional_options": { //No I18N
                            "includeSubFields": ["cm_fields"], //No I18N
                          },
                        },
                        "options": {//No I18N
                          "hbs": {//No I18N
                            "callback": {
                                "pre": function(opt, mode) { //No I18N
                                    return $MC.formconstruct(opt, mode);
                                }
                            }
                          },
                          "component": {//No I18N
                            "callback": {//No I18N
                              "pre": function(opt, $this) {//No I18N
                                var fields = opt.metadata.fields;
                                $MC.fieldplacholder(fields);
                                opt.metadata.fields = fields;
                                opt.cloneSubForms = true; //To support clone in subforms
                                return opt;
                              },
                            },
                          },
                        },
                    },

                    "details": { //No I18N
                      "meta": {//No I18N
                        "layout_entity": "custom_modules/"+moduleobject.entity_id, //No I18N
                        "layout_name": "custom_module", //No I18N
                        "entity_name":  moduleobject.entity_name, //No I18N
                        "entity_url": moduleobject.callbackURL, //No I18N
                        "additional_options": { //No I18N
                          "history": { //No I18N
                            "module": "custom", //No I18N
                            "entity": "custom_module", //No I18N
                            "sub_module": moduleobject.callbackURL //No I18N
                          },
                          "tabs": ["details","history"], //No I18N
                          "hide_description": true,//No I18N
                        },
                        "details_component": {//No I18N
                          "panel_details": {//No I18N
                            "content_panel": {//No I18N
                              "header_panel": {//No I18N
                                "show": false//No I18N
                              },
                              "actions_panel": {//No I18N
                                "show": false//No I18N
                              }
                            }
                          }
                        }
                      },
                      "options": {},//No I18N
                    },

                };
                break;
            default:
                break;
        }
        return option;
    }
};

var $cx_keeys = {//not used right now we will proceed later
    encrypt(value) {
      var result="";
      for(i=0;i<value.length;i++) {
        if(i<value.length-1) {
            result+=value.charCodeAt(i)+10;
            result+="-";
        } else {
            result+=value.charCodeAt(i)+10;
        }
      }
      return result;
    },

    decrypt(value) {
      var result="";
      var array = value.split("-");

      for(i=0;i<array.length;i++) {
        result+=String.fromCharCode(array[i]-10);
      }
      return result;
    }
};


MC.load = MC.prototype.load;




/**
 * Construct options/JSON for MC component with callback function to construct JSON format for module requirements
 * 
let json = {
    container: {{element}}
    .....,
    list: {
        meta: {  ----> Object/class/function example meta: classname
            "view": "table",
            "getmetainfo": true,
            header: function(opt) {  ----> Object/class/function
                .....,
                return opt;
            },
            "cells": function(opt) {  ----> Object/class/function
                .....,
                return opt;
            },
            "additional_options": {  ----> Object/class/function
                .....,
            }
        },
        "options": {
            header: {  ----> Object/class/function
                .....,
            },
            hbs: function(opt) {  ----> Object/class/function
                .....,
                return opt;
            },
            component: function(opt) {  ----> Object/class/function
                .....,
                return opt;
            }
        }
    },
    form: {
        "meta": {  ----> Object/class/function
            ......,
        },
        "options": {  ----> Object/class/function
            hbs: function(opt) { ----> Object/class/function
                .....,
                return opt;
            },
            component: function(opt) { ----> Object/class/function
                .....,
                return opt;
            }
        }
    },
    details: {
        "meta": {//No I18N
            ......,
        },
        "options": {
            hbs: function(opt) {  ----> Object/class/function
                .....,
                return opt;
            },
            component: function(opt) {  ----> Object/class/function
                .....,
                return opt;
            }
        }
    }
};

let mcjson = new MC_OPTIONS(json);
 * 
 * 
 */


class COMMON_MC {
    /**
     * Construct a new instance of COMMON_MC.
     */
    constructor() {
        // The constructor is typically used to initialize properties, but in this case, it's empty.
        return this || {};
    }

    /**
     * Constructs and returns options based on the provided method and options.
     *
     * @param {Function|Object} method - A function or object that defines the options.
     * @param {Object} options - Additional options to be combined with or used by the method.
     * @returns {Object} - The constructed options object.
     */
    constructOptions(method, options) {
        // Initialize an empty options object.
        let opt = options || {};
        let opt1;
        if (typeof options === 'object' && Array.isArray(options)) {
            opt = options[0];
            opt1 = options[1];
        }

        // Check the type of the 'method' parameter.
        if (typeof method === 'function') {
            // If 'method' is a function, check if it's a constructor (writable prototype).
            if (Object.getOwnPropertyDescriptor(method, 'prototype').writable) {
                // If it's a constructor, call the function with the provided 'options'.
                opt = method(opt,opt1);
            } else {
                // If not a constructor, treat it as a constructor and create a new instance with 'options'.
                opt = new method(opt,opt1);
            }
        } else if (typeof method === 'object' && !jQuery.isEmptyObject(method)) {
            // If 'method' is an object, assign it directly to 'opt'.
            opt = method;
        } else if(typeof method == "string") {
            opt = execFuncByName(method, window, opt1);
        }

        // Return the constructed options object.
        return opt;
    }

    typeofOptions(method) {
        let opt = 'string';

        if (typeof method === 'function') {
            if (Object.getOwnPropertyDescriptor(method, 'prototype').writable) {
                opt = 'function';
            } else {
                opt = 'class';
            }
        } else if (typeof method === 'object') {
            opt = 'object';
        }

        return opt;
    }


    /**
     * Get custom options by merging HBS (Handlebars) and component callbacks.
     * 
     * @param {object} options - An object containing HBS and component callbacks.
     * @returns {object} - Custom options with merged callbacks.
     */
    getCustomOption(options) {
        // Extract HBS callback and component callback, if provided.
        let hbsCall = {};
        let componentCall = {};
        let popupoptionCall = {};
        let hbs1 = options.hbs && this.constructOptions(options.hbs.callback ? options.hbs.callback : options.hbs) || {};
        let component1 = options.component && this.constructOptions(options.component.callback ? options.component.callback : options.component) || {};
        let popupoption1 = options.popupoption && this.constructOptions(options.popupoption.callback ? options.popupoption.callback : options.popupoption) || {};
        
        if(hbs1) {
            hbsCall = { hbs: { callback: hbs1 }};
        }
        if(component1) {
            componentCall = { component: { callback: component1 }};
        }
        if(popupoption1) {
            popupoptionCall = { popupoption: { callback: popupoption1 } };
        }
        // Merge HBS and component callbacks into custom options.
        let copt = Object.assign({}, hbsCall, componentCall, popupoptionCall);

        return copt;
    }

    /**
     * Extract JSON options from the provided options.
     * 
     * @param {object} options - An object containing various options.
     * @returns {object} - A new object with JSON options.
     */
    getJSON(options, getvalue) {
        let opt = MC.prototype.omitObjects(options, getvalue);
        return opt;
    }
}

class MC_OPTIONS extends COMMON_MC {
    /**
     * Construct a new instance of MC_OPTIONS.
     * 
     * @param {object} options - An object containing various options.
     */
    constructor(options) {
        super(options);

        // Get JSON options from the provided options.
        let opt = this.getJSON(options, true);

        let listtypetion = options.permissions && this.typeofOptions(options.permissions);
        let permissions = {};
        if(listtypetion == "class") {
            permissions = new options.permissions(options);
        } else {
            permissions = new MODULE_PERMISSION(options);
        }

        // Create a merged options object.
        let c_option = Object.assign({}, opt);
            c_option = Object.assign(c_option, {"permissions": permissions});

        // Get mode options from the provided options.
        let mode = MC_OPTIONS.prototype.getMode(options, c_option);
            c_option = Object.assign(c_option, mode);

        return c_option;
    }

    /**
     * Get mode options for list, form, and details.
     * 
     * @param {object} options - An object containing various options.
     * @returns {object} - A merged options object.
     */
    getMode(options, commonjson) {
        var classes = {
            list: MODULE_LIST,
            form: MODULE_FORM,
            details: MODULE_DETAILS
        };
        let _self = this;
        function getInstance(option, className) {
            var optionType = _self.typeofOptions(option);
            return (optionType === 'class') ? 
                _self.constructOptions(option, [option, commonjson]) :
                new classes[className](option, commonjson);
        }
        var list = options.list ? getInstance(options.list, 'list') : null;
        var form = options.form ? getInstance(options.form, 'form') : null;
        var details = options.details ? getInstance(options.details, 'details') : null;

        return { list: list, form: form, details: details };
    }
}

class MODULE_PERMISSION extends COMMON_MC {
    /**
     * Construct a new instance of MODULE_PERMISSION.
     * 
     * @param {object} options - An object containing module and entity_id.
     */
    constructor(options) {
        super(options);
        this.options = options;
        return this.getPermissions();
    }

    /**
     * Get permissions based on the provided options.
     * 
     * @returns {object} - Permissions object.
     */
    getPermissions() {
        // If permissions are already provided in options, return them.
        if (this.options.permissions) {
            return this.options.permissions;
        } else {
            // Determine the entity_id existence.
            let eid = this.options.entity_id && this.options.entity_id !== "null";

            // Build the API path to fetch permissions.
            let linksPath = '/api/v3/' + this.options.module; //No I18N

            if (eid) {
                linksPath += '/' + this.options.entity_id; //No I18N
            }

            linksPath += '/_links'; //No I18N

            // Initialize the permissions object if not already done.
            if (!this.permissions) {
                this.permissions = {};
            }

            if (!this.permissions.hasOwnProperty(linksPath)) {
                // Initialize an object to store permissions.
                var permissionsObj = {};

                // Fetch permissions via an AJAX request.
                sdpAjax({
                    acceptODCompatible: true,
                    url: linksPath,
                    async: false,
                    success: function(data) {
                        var links = data._links.links ? data._links.links : data._links;
                        for (var i = 0; i < links.length; i++) {
                            // Set permissions based on specific conditions.
                            permissionsObj[links[i].name] = window.printmode || window.is_from == "associations" ? false : true;
                        }
                    }
                });

                if (eid) {
                    // Store permissions in the permissions object.
                    this.permissions[linksPath] = permissionsObj;
                } else {
                    this.permissions = permissionsObj;
                }

                // Additional custom button condition.
                let customButton = (sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[this.options.module + "_filter"] && sdp_user.CLIENT_CONF[this.options.module + "_filter"].is_trash || externalframe == "true") ? false : true; //No I18N

                // Modify permissions based on the custom button condition.
                if (!customButton) {
                    this.permissions.add = false;
                    this.permissions.edit = false;
                }
            }

            // Return permissions based on the entity_id existence.
            return eid ? this.permissions[linksPath] : this.permissions;
        }
    }
}

class MODULE_LIST_META extends COMMON_MC {
    /**
     * Constructs list meta options for MC based on the provided inputs.
     *
     * @param {Object|function} options - Custom list meta options or a function that generates options.
     * @param {Object} list_options - Existing list options.
     * @param {Object} commonjson - Common JSON data.
     */
    constructor(options, list_options, commonjson) {
        super(options);

        // Default options
        let defaultOptions = {
            "view": "table",
            "getmetainfo": false,
        };
        let head = {
            "header": {
                "actions": {}
            }
        };
        let ao = {
            "additional_options": {}
        };
        let cell = {
            "cells": {}
        };

        // Use the provided meta options or create default options
        let meta = options;

        // Determine the type of the provided options
        let optionType = this.typeofOptions(meta);

        if (optionType === 'class') {
            // If options are of type class, create an instance and merge with default options
            list_options = Object.assign(defaultOptions, head, ao, cell);
            list_options = new meta(list_options, commonjson);
            meta = list_options;
        }

        // Get any custom options to merge with default options
        let customOptions = MC.prototype.omitObjects(meta, true);
        defaultOptions = jQuery.isEmptyObject(customOptions) ? defaultOptions : customOptions;

        // Merge common options with default options
        defaultOptions = Object.assign(defaultOptions, meta.common && this.constructOptions(meta.common, defaultOptions) || defaultOptions);

        // Build the header, additional options, and cell information
        head.header.actions = this.getMetaHeader(meta.header, commonjson);
        ao = this.getMetaAO(meta.additional_options, commonjson);
        cell = this.getMetaCell(meta.cells, commonjson);

        // Merge meta information with default options to get the final list options
        list_options = Object.assign(defaultOptions, head, ao, cell);

        return list_options;
    }

    /**
     * Get header actions for list view.
     *
     * @param {Object} header - Custom header actions or a function that generates header actions.
     * @param {Object} commonjson - Common JSON data.
     * @returns {Object} - Header actions for the list view.
     */
    getMetaHeader(header, commonjson) {
        // Extract the actions from the provided header object
        let actions = header.actions ? header.actions : header;

        // Define default header actions
        let defaultActions = {
            "bulk_selection": {
                "enable": true
            },
            "t_advfilter": {
                "enable": true,
                "custom_class": "fl mr10"
            },
            "restore": {
                "enable": false,
                "custom_class": "fl mr10"
            },
            "add": {
                "enable": true,
                "custom_attr": "data-uncheckedlistaction"
            },
            "t_searchicon": {
                "enable": true,
                "custom_class": "fl"
            },
            "t_column_choos": {
                "enable": true,
                "custom_class": "fl"
            },
            "deleteicon": {
                "enable": true,
                "custom_class": "fl ml10"
            },
            "pagination_comp": {
                "enable": true,
                "custom_class": "btn-group"
            },
            "t_list_settings": {
                "enable": false,
                "custom_class": "fr mr10"
            }
        };

        // Create the header object with default actions
        let head = {
            "header": {
                "actions": Object.assign({}, defaultActions)
            }
        };

        // Merge custom header actions with default actions and common JSON
        head = Object.assign(actions && this.constructOptions(actions, [head, commonjson]) || {});

        return head;
    }

    /**
     * Get additional options for list view.
     *
     * @param {Object} ao1 - Custom additional options or a function that generates additional options.
     * @param {Object} commonjson - Common JSON data.
     * @returns {Object} - Additional options for the list view.
     */
    getMetaAO(ao1, commonjson) {
        // Extract the actions from the provided ao1 object
        let actions = ao1;

        // Define default additional options
        let defaultAO = {
            "personalize_key": commonjson.module + "_table_listview"
        };

        // Create the additional options object with default values
        let ao = {
            "additional_options": Object.assign({}, defaultAO)
        };

        // Merge custom additional options with default options and common JSON
        ao = Object.assign(actions && this.constructOptions(actions, [ao, commonjson]) || {});

        return ao;
    }

    /**
     * Get cell-related options for the list view.
     *
     * @param {Object} cells - Custom cell options or a function that generates cell options.
     * @param {Object} commonjson - Common JSON data.
     * @returns {Object} - Cell options for the list view.
     */
    getMetaCell(cells, commonjson) {
        // Extract the cell actions from the provided cells object
        let actions = cells;

        // Define default cell options
        let defaultCell = {
            "static_cells": {
                "checkbox": true,
                "row_actions": {
                    "is_show": true,
                    "default": "true",
                    "type": "icon",
                    "data-celltransformer": "$MC.constructActionCell",
                    "class": "pos-rel",
                    "td_class": "pos-rel"
                }
            },
            "fields_required": {}
        };

        // Create the cell options object with default values
        let cell = {
            "cells": Object.assign({}, defaultCell)
        };

        // Merge custom cell options with default options and common JSON
        /*cell = {
            "cells": Object.assign(actions && this.constructOptions(actions, [cell, commonjson]) || {})
        };*/
        cell = Object.assign(actions && this.constructOptions(actions, [cell, commonjson]) || {});

        return cell;
    }
}

class MODULE_LIST_OPTIONS extends COMMON_MC {
    /**
     * Constructs list options for MC based on the provided inputs.
     *
     * @param {Object|function} options - Custom list options or a function that generates options.
     * @param {Object} list_options - Existing list options.
     * @param {Object} commonjson - Common JSON data.
     */
    constructor(options, list_options, commonjson) {
        super(options);
        let defaultOptions = {
            "header": {}
        };

        // Determine the type of the provided options
        let optionType = this.typeofOptions(options);

        if (optionType === 'class') {
            // If options are of type class, create an instance and merge with default options
            list_options = new options(list_options, commonjson);
        } else {
            // If options are plain objects, merge with default options
            list_options = Object.assign(options && this.constructOptions(options, [defaultOptions, commonjson]) || {});
        }

        return list_options;
    }
}

class MODULE_LIST extends COMMON_MC {
    /**
     * Construct a new instance of MODULE_LIST.
     * 
     * @param {object} options - An object containing meta, options, and common functions.
     */
    constructor(options, commonjson) {
        super(options);
        // Define default options.
        // Initialize list_options object.
        let list_options = {"list": {"meta": {}, "options": {}}};

        // Check if meta information is provided.
        if (options.meta) {
            let meta = options.meta;
            if(this.typeofOptions(meta) == "class") {
                let default_meta = {"header": {}, "additional_options": {}, "cells": {}};
                list_options.list.meta = new meta(default_meta, list_options.list.meta, commonjson);
            } else {
                list_options.list.meta = new MODULE_LIST_META(meta, list_options.list.meta, commonjson);
            }
        }

        // Check if options are provided.
        if (options.options) {
            let opti = options.options;
            if(this.typeofOptions(opti) == "class") {
                list_options.list.options = new opti(opti, list_options.list.options, commonjson);
            } else {
                list_options.list.options = new MODULE_LIST_OPTIONS(opti, list_options.list.options, commonjson);
            }
            opti = (list_options.list.options) ? list_options.list.options : opti;
            // Define and merge header options and custom callbacks.
            let head = Object.assign({"header": opti.header && this.constructOptions(opti.header, commonjson) || {}});
            let cb = this.getCustomOption(opti);
            // Merge options with header and custom callbacks.
            list_options.list.options = Object.assign(head, cb);
        }
        return list_options;
    }
}

class MODULE_FORM extends COMMON_MC {
    /**
     * Construct a new instance of MODULE_FORM.
     * 
     * @param {object} options - An object containing meta and options.
     */
    constructor(options, commonjson) {
        super(options);
        let meta = options.meta || {};
        let form_options = {"form": {"meta": meta, "options": {}}};
        // Initialize the meta object with additional options.
        if(!jQuery.isEmptyObject(meta)) {
            let optionstype = this.typeofOptions(options.meta);
            if (optionstype === 'class') {
                meta = new options.meta(form_options.form.meta, commonjson);
            } else if (optionstype === 'function') {
                meta = Object.assign(options.meta, options.meta && this.constructOptions(form_options.form.meta, commonjson) || {});
            }
            form_options.form.meta = meta;
        }

        // Check if options are provided.
        if (options.options) {
            let opti = options.options;
            // Get custom callbacks.
            let cb = this.getCustomOption(opti);

            // Merge custom callbacks with form_options.
            form_options.form.options = Object.assign(cb);
        }
        return form_options;
    }
}

class MODULE_DETAILS extends COMMON_MC {
    /**
     * Construct a new instance of MODULE_DETAILS.
     * 
     * @param {object} options - An object containing meta and options.
     */
    constructor(options, commonjson) {
        super(options);
        let meta = options.meta || {};

        // Initialize details_options object.
        let details_options = {"details": {"meta": meta, "options": {}}};

        // Initialize the meta object with additional options.
        if(!jQuery.isEmptyObject(meta)) {
            let optionstype = this.typeofOptions(options.meta);
            if (optionstype === 'class') {
                meta = new options.meta();
            } else if (optionstype === 'function') {
                meta = Object.assign(options.meta, options.meta && this.constructOptions(options.meta) || {});
            }
            details_options.details.meta = meta;
        }

        // Check if options are provided.
        if (options.options) {
            let opti = options.options;

            // Get custom callbacks.
            let cb = this.getCustomOption(opti);

            // Merge custom callbacks with details_options.
            details_options.details.options = Object.assign(cb);
        }

        return details_options;
    }
}


