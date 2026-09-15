/**
 * This component requires the advanced filter component
 * @requires webapps\ROOT\scripts\custom_filter.js
 */

/**
 * holder: dom id to build the component
 * metadata: metainfo api call response
 * entity: entity to be used in metainfo api call(requests, release, problems...)
 * entityComponent: entity component in which changes needs to be handled
 * metaParam: 'for' query parameter to be used for making metainfo API call
 * applyFn: entity method to be called on applying filter having criteria as parameter
 * cancelFn: entity method to be called on canceling filter
 * saveConfig: Object containing save related options
 * ***** views: array containing scopes to be shown for viewing filter, allowed values - private, public, shared
 * ***** showDescription: whether to show description field or not.
 * ***** sharedConfig Object containing mutli select configuration
 * ***** columnConfig
 * ***** ***** fields: Array of fields to be listed in column chooser
 * ***** ***** preProcessFields: method to pre process fields
 * ***** sortConfig
 * ***** ***** fields: Array of fields to be listed in sort dropdown
 * ***** ***** default: default sort field id
 * ***** ***** def_order: default order of sorting
 * ***** ***** preProcessFields: method to pre process fields
 * ***** preSaveFn: entity method to be called before saving filter
 * ***** saveFn: entity method to be called on success of saving filter 
 * ***** errorFn: entity method to be called on failure of saving filter
 * ***** module: 'module' query parameter to be used for making save filter API call
 * ***** defaultView: Whether to have save as default view
 * customConfig: Object containing customized texts and other options
 * criteriaOptions: object containing criteria options
 * passOnlyIds: whether to pass only ids in criteria when saving/updating filter 
 * isCustomView: whether the filter is for custom view or not, handled column chooser & api
 * updateData: data to be updated
 * disableApply: whether to show/hide apply button, by default it will be shown
 * hideViews: whether to hide views section
 * showRange: whether to show range criteria section or not
 * timeFilterConfig: Object containing time filter component initialization values
 */

var customViewFilter = (() => {
    "use strict";

    let def_view = {
        have_icon: true,
        title_text: "", //No I18N
        apply_text: translate('sdp.admin.dcconfig.standbybutton'),  //No I18N
        reset_text: translate('sdp.common.reset'),  //No I18N
        cancel_text: translate('common.cancel'),    //No I18N
        save_text: translate('common.save'),    //No I18N
        label_text: translate('sdp.request.customview.filtername'), //No I18N
        clear_text: translate('sdp.common.clear'),   //No I18N
        update_text: translate('common.update'), //No I18N
        customview_text: translate('custom.view.save'), //No I18N
        dialog_title_text: translate('sdp.inventory.workstations.listview.advFilter'),   //No I18N
        title_btn_style: "background-color: transparent; border:none; box-shadow: none;",   //No I18N
        dialog_width: "1040" //No I18N
    };
    let save_config = {
        columnConfig: {},
        sortConfig: {
            def_order: "asc"    //No I18N
        }
    };
    let views = {
        private: {
            icon_cls: 'private-filter', //No I18N
            key: 'sdp.dashboard.common.private',    //No I18N
            value: '1' //No I18N
        },
        public: {
            icon_cls: 'public-filter',  //No I18N
            key: 'sdp.dashboard.common.public',    //No I18N
            value: '2' //No I18N
        },
        shared: {
            icon_cls: 'share2', //No I18N
            key: 'sdp.dashboard.common.shared',    //No I18N
            value: '3' //No I18N
        }
    };
    let ranges = {
        pending: {
            key: 'sdp.requests.viewrequest.allpendingrequests',    //No I18N
            value: '$(is_pending)' //No I18N
        },
        completed: {
            key: 'sdp.requests.viewrequest.allcompletedrequests',    //No I18N
            value: '$(is_completed)' //No I18N
        },
        all: {
            key: 'sdp.requests.viewrequest.requester.allrequests',    //No I18N
            value: 'all' //No I18N
        }
    };
    let _self;
    let $cv_grid;
    let $cf_grid;
    let $dialog;
    let save_view = false;
    let sharedUsers;
    function init(options) {
        _self = this;

        _self.opts = options;
        let opts = _self.opts;

        //If range is shown, need to set the range related values in options
        if (opts.showRange) {
            opts.ranges = ranges;
        }
        opts.customConfig = jQuery.extend({}, def_view, opts.customConfig);
        let save_opts = opts.saveConfig;
        if (save_opts) {
            save_opts = jQuery.extend({}, save_config, save_opts);
            save_opts.sortConfig = jQuery.extend({}, save_config.sortConfig, save_opts.sortConfig);
            opts.save_filter = true;
            if (save_opts.defaultView || opts.updateData) {
                save_view = true;
            }
            if (save_opts.views) {
                let obj = {};
                save_opts.views.forEach(view => {
                    obj[view] = views[view];
                });
                save_opts.views = obj;
            } else {
                save_opts.views = views;
            }
            _self.opts.save = save_opts;
        }
        $cv_grid = jQuery(`#${options.holder}`).empty();
        buildCVButton();
    }
    /**
     * Method to construct custom view clickable button
     */
    function buildCVButton() {
        let opts = _self.opts;
        let c_ref = opts.customConfig.title_text ? `<span class="title">${opts.customConfig.title_text}</span>` : '<span class="cspr icon-md adv-filter vsub"></span>'; //No I18N
        let btn = opts.save_filter ? `<button class="btn btn-link save-filter hide" rel="uitip" title="${opts.customConfig.customview_text}" type="button">${opts.customConfig.save_text}</button>` : ''; //No I18N
        var $div = jQuery(`<div class="flex-center"><div class="viewFiltLeft"><button type="button" id="viewFiltIcon" class="btn btn-sm btn-default" rel="uitip" title="${opts.customConfig.dialog_title_text}">${c_ref}<span class="pl5"></span></button></div><div class="viewFiltRight flex-center">${btn}<button class="btn cancel-filter p0 pl5 pr5 brd-left-medium" type="button" rel="uitip" title="${opts.customConfig.clear_text}"><i class="cspr icon-sm close-red"></i></button></div></div>`);   //No I18N
        $div.find("#viewFiltIcon").css("cssText", opts.customConfig.title_btn_style).find("span").eq(1).css("display", "none")
        .end().end()
        .find(".cancel-filter").css("display", "none");   //No I18N
        $cv_grid.append($div);

        $cv_grid.off('click.viewFiltLeft').on('click.viewFiltLeft', '.viewFiltLeft', () => {    //No I18N
            getMetaInfo(() => {
                if (opts.save_filter) {
                    renderhbs($cv_grid, "customview-component", opts, true, "components", true, true, () => { //No I18N
                        buildModal();
                    });
                } else {
                    $div = jQuery(`<div id="customViewModal" class="hide"><div class="form-horizontal four-col one-col form-edit p15"><div class="form-wrapper p0"><div class="form-group mb30 pb20 oya"><label class="mb5 disp-b">${translate("filter.criteria")}</label><div id="criteriaGrid"></div></div></div></div><div class="form-footer pos-abs bottom0 fw z-ind95"><button class="btn btn-primary apply-filter mr5" type="button">${opts.customConfig.apply_text}</button><button class="btn btn-default reset-filter mr5" type="button">${opts.customConfig.reset_text}</button><button class="btn btn-default cancel-filter" type="button">${opts.customConfig.cancel_text}</button></div></div>`);  //No I18N
                    $div.find(".form-group").css("max-height", "300px");    //No I18N
                    $cv_grid.append($div);
                    buildModal();
                }
                if (opts.showRange) {
                    let tf_opts = {
                        holder: document.getElementById('timeFilterGrid'),   // No I18N
                        for: 'custom_view' // No I18N
                    }
                    if (opts.timeFilterConfig) {
                        tf_opts = jQuery.extend({}, tf_opts, opts.timeFilterConfig);
                    }
                    _self.timeFilter = timeFilter(tf_opts);
                }
            });
        });
        function buildModal() {
            $cf_grid = jQuery("#criteriaGrid");  //No I18N
            $dialog = jQuery("#customViewModal"); //No I18N
            initCustomFilter(opts.criteriaOptions);
            constructDialog();
            bindEvents();
        }
    }
    /**
     * Method to fetch meta info
     * @param {Function} callback method to be called after getting metainfo 

     */
    function getMetaInfo(callback) {
        let opts = _self.opts;
        if (!!opts.metadata || !!_self.metaInfoCF) {
            opts.metadata ? setMetaInfo(opts.metadata) : null;
            callback();
            return;
        }
        let ajax_data = {};
        if (opts.metaParam) {
            ajax_data = { input_data: sdpToJSON({ "for": opts.metaParam }) }    //No I18N
        }
        sdpAjax({
            url: `/api/v3/${opts.entity}/metainfo`,    //No I18N
            type: "GET",    //No I18N
            cache: false,
            data: ajax_data,
            success: (data) => {
                setMetaInfo(data);
                callback();
            },
            error: (xhr, status, error) => {
                // TODO: Error handling
            }
        });

        /**
         * Method to set meta info data in reference variables
         * @param {Object} data meta data
         */
        function setMetaInfo({ metainfo }) {
            _self.metaInfoCF = metainfo.fields;
            let save_opts = opts.save;
            if (opts.save_filter) {
                opts.meta_fields = [];
                for (let field in _self.metaInfoCF) {
                    if (_self.metaInfoCF.hasOwnProperty(field) && _self.metaInfoCF[field].display_name) {
                        opts.meta_fields.push({ id: field, text: _self.metaInfoCF[field].display_name });
                    }
                }
                if (!save_opts.columnConfig.fields) {
                    save_opts.columnConfig.fields = opts.meta_fields.slice();
                }
                if (!save_opts.sortConfig.fields) {
                    save_opts.sortConfig.fields = opts.meta_fields.slice();
                }
                if (save_opts.columnConfig.preProcessFields) {
                    save_opts.columnConfig.preProcessFields.call(opts.entityComponent, save_opts.columnConfig.fields, metainfo.fields);
                }
                if (save_opts.sortConfig.preProcessFields) {
                    save_opts.sortConfig.preProcessFields.call(opts.entityComponent, save_opts.sortConfig.fields, metainfo.fields);
                }
            }
        }
    }
    /**
     * Method to construct dialog
     */
    function constructDialog() {
        let offset = $cv_grid.find("#viewFiltIcon").offset();   //No I18N
        let opts = _self.opts;
        let d_opts = {
            title: `<span class="cspr icon-md adv-filter mr5 vsub"></span>${translate('sdp.admin.change.filters')}`,   //No I18N
            isTitleHTMLEncoded: true,
            width: opts.customConfig.dialog_width,
            // closeOnEscKey: false,
            draggable: false,
            resizable: false,
            animation: {
                open: {
                    className: 'zeffects--slideupin', //No I18N
                    duration: 300
                },
                close: {
                    className: 'zeffects--slidedownout', //No I18N
                    duration: 300
                }
            },
            open() {
                if (save_view) {
                    $dialog.find(".zdialog__content").css("margin-bottom", "50px").find(".form-horizontal").removeClass("mb40");    //No I18N
                }
                if (_self.search_criteria) {
                    $cf_grid.custom_filter("update", _self.search_criteria);  //No I18N
                    $cf_grid.find("ol.filterwrapper").css("min-width", `${_self.opts.customConfig.dialog_width - 60}px`);   //No I18N              
                }
                if (_self.range_criteria) {
                    setRangeData(_self.range_criteria);
                }
            },
            beforeclose(event) {
                if (!_self.save_data) {
                    save_view = false;
                }
                if (opts.save && opts.save.defaultView) {
                    save_view = true;
                }
                closeCalDialog();
            }
        };
        if (!opts.save) {
            d_opts.position = {
                left: offset.left - 5,
                top: offset.top - 12,
            };
        }
        if (save_view) {
            d_opts.animation.open.className = 'zeffects--slideright'; //No I18N
            d_opts.position = { right: "0px", top: "0px" };    //No I18N
            d_opts.height = "100vh";  //No I18N
            bindSaveEvents(_self.save_data);
            $dialog.find(".save_grid").show().end().find(".save-filter").removeClass("hide").end().find(".apply-filter").addClass("btn-default").removeClass("btn-primary").end().find(".custom-filter").remove().end().find("#cus_name").focus();   //No I18N
        }
        $dialog.removeClass("hide").sdp_zcomponent_dialog(d_opts);    //No I18N
        if (!save_view) {
            ZComponents.dialog($dialog).setAttribute("height", "auto");    //No I18N
        }
        $dialog.css("transition", "left 1s ease, top 1s ease").find(".zdialog__content").css("transition", "height 1s ease");  //No I18N
        if (opts.updateData) {
            update(opts.updateData);
        }
    }
    /**
     * Method to initialize custom filter after constructing options 
     */
    function initCustomFilter(criteria = {}) {
        criteria.metainfo = _self.metaInfoCF;
        $cf_grid.custom_filter(_self.opts.criteriaOptions);
        $cf_grid.find("ol.filterwrapper").css("min-width", `${_self.opts.customConfig.dialog_width - 60}px`);   //No I18N
    }
    /**
     *  Bind all user events
     */
    function bindEvents() {
        let opts = _self.opts;
        if (!opts.save) {
            $dialog.off('click.adv-filter').on('click.adv-filter', '.adv-filter', () => {
                destroyDialog();
            });
        }

        $dialog.off('click.apply-filter').on('click.apply-filter', '.apply-filter', () => {
            let search_criteria = $cf_grid.custom_filter("getFilterData");    //No I18N
            if (opts.showRange) {
                _self.range_criteria = getRangeData();
            }
            if (opts.save) {
                _self.save_data = getData();
            }
            if (!!search_criteria && search_criteria.length > 0) {
                _self.search_criteria = $cf_grid.custom_filter("getFilterData", "", true);    //No I18N
                destroyDialog();
                opts.applyFn.call(opts.entityComponent, search_criteria, _self.save_data, _self.range_criteria);
                let filCount = search_criteria.length;
                $cv_grid.find(".viewFiltLeft .title").hide().end().find(".viewFiltLeft span:last-child").show().text(translate("common.view.filters.applied", [filCount])).end().find(".viewFiltRight button").show().end().css({ "background-color": "#f1f1f1", "border": "1px solid #cfcfcf" });   //No I18N
                if (opts.save) {
                    $cv_grid.find(".save-filter").removeClass("hide");  //No I18N
                    if (_self.update_filter_id) {
                        $cv_grid.find(".save-filter").text(_self.options.customConfig.update_text);    //No I18N
                    }
                }
            }
        });
        $dialog.off('click.cancel-filter').on('click.cancel-filter', '.cancel-filter', () => {     //No I18N
            destroyDialog();
        });
        $dialog.off('click.reset-filter').on('click.reset-filter', '.reset-filter', () => {    //No I18N
            $cf_grid.custom_filter("reintialize"); //No I18N
            $cf_grid.find("ol.filterwrapper").css("min-width", `${opts.customConfig.dialog_width - 60}px`);   //No I18N
            resetValues();
        });
        $dialog.off('click.custom-filter').on('click.custom-filter', '.custom-filter', () => {  //No I18N
            save_view = true;
            $dialog.find(".save_grid").slideToggle().end().find(".save-filter").removeClass("hide").end().find(".apply-filter").addClass("btn-default").removeClass("btn-primary").end().find(".custom-filter").remove().end().find("#cus_name").focus().end().find(".apply-filter").remove().end().find(".reset-filter").remove();   //No I18N
            let rig = `${parseInt($dialog.css("left")) * 2}px`; //No I18N
            ZComponents.dialog($dialog).setAttribute("position", { left: rig, top: "0px" }); //No I18N
            ZComponents.dialog($dialog).setAttribute("height", "100vh");   //No I18N
            ZComponents.dialog($dialog).setAttribute("title", `<span class="cspr icon-md adv-filter mr5 vsub"></span>${translate('sdp.requests.listview.customview.create.button')}`);   //No I18N
            $dialog.find(".zdialog__content").css("margin-bottom", "50px").find(".form-horizontal").removeClass("mb40");    //No I18N
            bindSaveEvents();
        });

        $cv_grid.find(".viewFiltRight").off("click.cancelfilter").on('click.cancelfilter', '.cancel-filter', () => {   //No I18N
            save_view = false;
            resetValues(true);
            opts.cancelFn.call(opts.entityComponent);
            $cv_grid.find(".viewFiltLeft .title").show().end().find(".viewFiltLeft span:last-child").hide().text("").end().find(".viewFiltRight button").hide().end().css({ "background-color": "transparent", "border": "none" });   //No I18N
            if (opts.save) {
                $cv_grid.find(".save-filter").addClass("hide");  //No I18N
            }
        });
        $cv_grid.find(".viewFiltRight").off("click.save-filter").on('click.save-filter', '.save-filter', () => {   //No I18N
            save_view = true;
            $cv_grid.find(".viewFiltLeft").trigger("click");    //No I18N
        });

        //Initialize tooltip
        initTooltip(`#${opts.holder}`);   //No I18N
    }
    /**
     *  Bind all user save events
     */
    function bindSaveEvents(data) {
        let opts = _self.opts;
        $dialog.find(".show_view").find("input[type=radio]").off().on("change", function () {
            const isShared = this.value === "3";    //No I18N
            $dialog.find(".share_filter").toggleClass("hide", !isShared);   //No I18N
        });

        opts.save.sharedConfig.holder = $dialog.find('#shareNotifyTo');   //No I18N

        sharedUsers = sdpMultiSelect(opts.save.sharedConfig);

        $dialog.off("change.enableColumn").on("change.enableColumn", '#enableColumn', function () {   //No I18N
            if (jQuery(this).is(":checked")) {
                $dialog.find(".col_section").removeClass("hide");    //No I18N
            } else {
                $dialog.find(".col_section").addClass("hide");    //No I18N
            }
        });

        $dialog.find(".sortlist").sortable({
            placeholder: "ui-state-highlight",  //No I18N
            handle: '.ctl i',   //No I18N
            start: (e, { placeholder, item }) => {
                placeholder.height(item.height());
            },
            stop: (e, { item }) => {
                let $item = jQuery(item);
                let c_ele_checked = $item.find('.colcheckbox').prop('checked');  //No I18N
                let p_ele_checked = $item.prev().find('.colcheckbox').prop('checked');  //No I18N
                let n_ele_checked = $item.next().find('.colcheckbox').prop('checked');  //No I18N
                setTimeout(() => {
                    if ((c_ele_checked !== p_ele_checked && c_ele_checked !== n_ele_checked) || (c_ele_checked == false && c_ele_checked !== n_ele_checked)) {
                        $item.find('.colcheckbox').prop('checked', !c_ele_checked); //No I18N
                    }
                }, 1);
            },
            scrollSpeed: 10
        });
        $dialog.find(".sortlist").off('change.colcheckbox').on('change.colcheckbox', '.colcheckbox', function (e) {   //No I18N
            let $cur = jQuery(this);
            let curr_ele = $cur.closest('li'); // No I18N
            let par_ele = $cur.closest('ul'); // No I18N
            let c_len = par_ele.find(".colcheckbox:checked").length;    // No I18N
            let li_index = curr_ele.index();
            let maxAllowedfields = 25;
            if (maxAllowedfields && c_len > maxAllowedfields) {
                showalert('failure', translate("api.max.limit.exceeded", [`${maxAllowedfields}`]), "isAutoHide=true"); // No I18N
                $cur.prop('checked', false);    // No I18N
                return false;
            }
            if ($cur.is(':checked')) {
                if (c_len === 1) {
                    $dialog.find(".sortlist").prepend(curr_ele);    // No I18N
                } else {
                    $dialog.find(".sortlist li").eq(c_len - 2).after(curr_ele); // No I18N
                }
            } else if (c_len > 0 && li_index !== c_len) {
                $dialog.find(".sortlist li").eq(c_len).after(curr_ele); // No I18N
            }
        });
        $dialog.find('#search-input').on('keyup', function () {
            let _this = jQuery(this);
            let searchString = _this.val();
            let btn = _this.parents('.btn-group');  //No I18N
            let sortableElement = btn.find(".sortlist").sortable(); //No I18N
            let totalLi = btn.find(".sortlist li").length;  //No I18N
            /* search all li items */
            btn.find("ul.sortlist li:not(.noitem)").each(function (index, el) {
                if (jQuery(this).text().toUpperCase().includes(searchString.toUpperCase())) {
                    jQuery(this).show().addClass('show');   //No I18N
                } else {
                    jQuery(this).hide().removeClass('show');    //No I18N
                }
            });
            btn.find('.failure').show().removeClass("hide"); // Show Clear Icon
            let showLength = btn.find('ul.sortlist li.show').length;    //No I18N
            if (showLength == 0) { // when No matches found
                btn.find('ul.sortlist li.noitem').removeClass('hide'); // Show No item Found Message
            } else if (showLength == (totalLi - 1)) {
                sortableElement.sortable("enable"); //No I18N
                btn.find('ul.sortlist li.noitem').addClass('hide');   //No I18N
                btn.find('ul.sortlist li .ctl i').css('visibility', '').end().find('.failure').hide() //No I18N
            } else {
                btn.find('ul.sortlist li.noitem').addClass('hide');   //No I18N
                btn.find('ul.sortlist li .ctl i').css('visibility', 'hidden'); //No I18N
                sortableElement.sortable("disable"); //No I18N
            }
        }).end().find('.failure').on('click', function (event) {
            event.preventDefault();
            let parEle = "";
            if (_self.t_obj && _self.t_obj.options.combined_settings) {
                parEle = jQuery(this).closest("div[role='form']");  //No I18N
            } else {
                parEle = jQuery(this).closest('.btn-group');    //No I18N
            }
            parEle.find('ul.sortlist li.noitem').addClass('hide');    //No I18N
            parEle.find('#search-input').val('').trigger('focus').trigger('keyup'); //No I18N

        });

        $dialog.find("#sortCol").select2({
            data: opts.save.sortConfig.fields,
            placeholder: translate("sdp.requests.fieldFormRules.selectColumn")  //No I18N
        });
        $dialog.find("#sortCol").select2("val", opts.save.sortConfig.def_order);  //No I18N

        $dialog.off('click.save-filter').on('click.save-filter', '.save-filter', () => {  //No I18N
            let save_obj = { "sort_info": {} };   //No I18N
            let cus_name = $dialog.find("#cus_name").val(); //No I18N
            if (!cus_name) {
                showalert('warning', translate("sdp.change.disable.please.fill.required"), 'isAutoHide=true,delay=5'); //No I18N
                $dialog.find("#cus_name").focus();  //No I18N
                return;
            }
            save_obj.name = cus_name;
            let desc = $dialog.find("#cus_desc").val(); //No I18N
            if (desc) {
                save_obj.description = desc;
            }
            let range_criteria = getRangeData();
            if (range_criteria) {
                save_obj.range_criteria = range_criteria;
            }
            let search_criteria = $cf_grid.custom_filter("getFilterData");    //No I18N
            if (!search_criteria || search_criteria.length === 0) {
                return;
            }
            save_obj.criteria = search_criteria;
            let view_mode = $dialog.find("input[name='widgetShareType']:checked").val();    //No I18N
            save_obj.scope = view_mode;
            if (view_mode === "3") {
                save_obj.shared_to = []
                let selectedIds = sharedUsers.getSelectedIds();
                if (jQuery.isEmptyObject(selectedIds)) {
                    showalert('warning', translate("common.validation.select", [opts.save.sharedConfig.choose_display_name]), 'isAutoHide=true,delay=5'); //No I18N
                    setTimeout(() => {
                        sharedUsers.open();
                    }, 10);
                    return;
                }
                selectedIds.forEach((type, values) => {
                    values.forEach(({ id }) => {
                        save_obj.shared_to.push({ reference_id: id, reference_type: type });
                    });
                });
            }

            let custom_view = $dialog.find("#enableColumn").is(":checked"); //No I18N
            save_obj.is_custom_view = custom_view;
            if (custom_view) {
                let col_order = [];
                $dialog.find("#colOrder").find("input[type='checkbox']").each(function () { //No I18N
                    if (jQuery(this).is(":checked")) {  //No I18N
                        col_order.push(this.value);
                    }
                });
                save_obj.fields_required = col_order;

                let sort_field = $dialog.find("#sortCol").select2("val");   //No I18N
                if (!sort_field) {
                    showalert('warning', translate("sdp.change.disable.please.fill.required"), 'isAutoHide=true,delay=5'); //No I18N
                    $dialog.find("#sortCol").select2("open");   //No I18N
                    return;
                }
                save_obj.sort_info.sort_field = sort_field;
                save_obj.sort_info.sort_order = $dialog.find("[name='order']:checked").val();  //No I18N
            }
            if (_self.update_data) {
                let cnd = sdpToJSON(save_obj.criteria) == sdpToJSON(_self.update_data.formatted_criteria);
                cnd = cnd && (save_obj.name === _self.update_data.name);
                cnd = cnd && (save_obj.description == _self.update_data.description);
                cnd = cnd && (save_obj.scope == _self.update_data.scope);
                cnd = cnd && (save_obj.is_custom_view == _self.update_data.is_custom_view);
                let cnd1 = true, cnd2 = true, cnd3 = true, cnd4 = true;
                if (cnd && save_obj.scope === "3") {
                    cnd1 = sdpToJSON(save_obj.shared_to) == sdpToJSON(_self.update_data.formatted_shared_to);
                }
                cnd = cnd && cnd1;
                if (cnd && save_obj.is_custom_view) {
                    cnd2 = sdpToJSON(save_obj.fields_required) == sdpToJSON(_self.update_data.fields_required);
                    cnd3 = sdpToJSON(save_obj.sort_info) == sdpToJSON(_self.update_data.sort_info);
                }
                cnd = cnd && cnd2 && cnd3;
                if (cnd && save_obj.range_criteria) {
                    cnd4 = sdpToJSON(save_obj.range_criteria) == sdpToJSON(_self.update_data.range_criteria);
                }
                cnd = cnd && cnd4;
                if (cnd) {
                    window.showalert("warning", translate("common.nothing.to.save"), "isAutoHide=true, delay=10");	//No I18N
                    return;
                }
            }
            saveFilter(save_obj);
        });
        if (data) {
            setData(data);
        }
        initTooltip('#customViewModal');   //No I18N
    }
    /**
     * Destroy dialog after animation ends
     */
    function destroyDialog() {
        $dialog.sdp_zcomponent_dialog("close");   //No I18N
        $dialog.sdp_zcomponent_dialog("destroy");   //No I18N
        setTimeout(() => {
            $dialog.remove();
        }, 500);
    }
    /**
     * Method to save filter
     * @param {Obj} save_obj save object 
     */
    function saveFilter(save_obj) {
        let opts = _self.opts;
        if (opts.passOnlyIds) {
            save_obj.criteria = formatCriteria(save_obj.criteria);
        }
        if (opts.preSaveFn) {
            save_obj = opts.preSaveFn.call(opts.entityComponent, save_obj);
        }
        let key_name = opts.isCustomView ? "custom_view" : "list_view_filter";   //No I18N
        let reqData = {};
        reqData[key_name] = {
            display_name: save_obj.name,
            criteria: save_obj.criteria,
            module: opts.module,
            scope: save_obj.scope,
            is_custom_view: save_obj.is_custom_view
        };
        if (save_obj.is_custom_view) {
            reqData.custom_view.sort_info = save_obj.sort_info;
            reqData.custom_view.fields_required = save_obj.fields_required;
        }
        if (save_obj.shared_to) {
            reqData.custom_view.shared_to = save_obj.shared_to;
        }
        if (save_obj.description) {
            reqData[key_name].description = save_obj.description;
        }
        if (save_obj.range_criteria) {
            reqData[key_name].range_criteria = save_obj.range_criteria;
        }
        let api_name = opts.isCustomView ? "custom_views" : "list_view_filters";   //No I18N
        sdpAjax({
            url: _self.update_filter_id ? `/api/v3/${api_name}/${_self.update_filter_id}` : `/api/v3/${api_name}/`,    //No I18N
            type: _self.update_filter_id ? "PUT" : "POST",    //No I18N
            data: sdpAjaxInputData(reqData),
            success(data) {
                let text = _self.update_filter_id ? "api.updated.success" : "api.added.success";    //No I18N
                if (opts.saveFn) {
                    opts.saveFn.call(opts.entityComponent, data);
                }
                jQuery("#alertbox").remove();      //No I18N
                showalert('success', translate(text, [translate("common.filter")]), 'isAutoHide=false'); //No I18N
                destroyDialog();
                resetValues(true);
                save_view = opts.save && opts.save.defaultView;
            },
            error(xhr, status, error) {
                jQuery("#alertbox").remove();      //No I18N
                if (opts.errorFn) {
                    opts.errorFn.call(opts.entityComponent, xhr);
                    return;
                }
                let text = _self.update_filter_id ? "api.updated.failure" : "api.added.failure";    //No I18N
                showalert('failure', translate(text, [translate("common.filter")]), 'isAutoHide=false'); //No I18N
            }
        });
    }
    /**
     * Method to get data
     */
    function getData() {
        let save_obj = { "sort_info": {} };   //No I18N
        let cus_name = $dialog.find("#cus_name").val(); //No I18N
        if (cus_name) {
            save_obj.name = cus_name;
        }
        let desc = $dialog.find("#cus_desc").val(); //No I18N
        if (desc) {
            save_obj.description = desc;
        }
        let view_mode = $dialog.find("input[name='widgetShareType']:checked").val();    //No I18N
        save_obj.scope = view_mode;
        if (view_mode === "3") {
            save_obj.shared_to = sharedUsers.getSelectedIds();
        }
        let custom_view = $dialog.find("#enableColumn").is(":checked"); //No I18N
        save_obj.is_custom_view = custom_view;
        if (custom_view) {
            let col_order = [];
            $dialog.find("#colOrder").find("input[type='checkbox']").each(function () { //No I18N
                if (jQuery(this).is(":checked")) {  //No I18N
                    col_order.push(this.value);
                }
            });
            save_obj.fields_required = col_order;
            let sort_field = $dialog.find("#sortCol").select2("val");   //No I18N
            if (sort_field) {
                save_obj.sort_info.sort_field = sort_field;
            }
            save_obj.sort_info.sort_field = sort_field;
            save_obj.sort_info.sort_order = $dialog.find("[name='order']:checked").val();   //No I18N
        }
        return save_obj;
    }
    /**
     * Method to format criterias to pass ids only
     */
    function formatCriteria(data) {
        function recFormat(criteria) {
            for (let i = 0, len = criteria.length; i < len; i++) {
                if (criteria[i].values) {
                    let ids = [];
                    for (let j = 0, len1 = criteria[i].values.length; j < len1; j++) {
                        if (criteria[i].values[j] != null && criteria[i].values[j].id) {
                            ids.push(criteria[i].values[j].id);
                        } else {
                            ids.push(criteria[i].values[j]);
                        }
                    }
                    criteria[i].values = ids;
                    if (criteria[i].children) {
                        recFormat(criteria[i].children);
                    }
                }
            }
        }
        recFormat(data);
        return data;
    }
    /**
     * Method to update data
     */
    function update(data) {
        _self.update_data = data;
        _self.update_filter_id = data.filter_id;
        ZComponents.dialog($dialog).setAttribute("title", `<span class="cspr icon-md adv-filter mr5 vsub"></span>${translate('sdp.project.filters.editview')}`);   //No I18N
        $dialog.find(".save-filter").text(_self.opts.customConfig.update_text);    //No I18N
        $cf_grid.custom_filter("update", data.search_criteria);  //No I18N
        $cf_grid.find("ol.filterwrapper").css("min-width", `${_self.opts.customConfig.dialog_width - 60}px`);   //No I18N
        data.name = data.filter_name;
        if (data.shared_to && Array.isArray(data.shared_to)) {
            let shared_to = {};
            for (let i = 0, len = data.shared_to.length; i < len; i++) {
                let dd = data.shared_to[i];
                if (!shared_to[dd.reference_type]) {
                    shared_to[dd.reference_type] = [];
                }
                shared_to[dd.reference_type].push({ id: dd.reference_id.toString() });
            }
            _self.update_data.formatted_shared_to = data.shared_to.slice();
            data.shared_to = shared_to;
        }
        setTimeout(() => {
            _self.update_data.formatted_criteria = $cf_grid.custom_filter("getFilterData"); //No I18N
        }, 100);
        setData(data);
    }
    /**
     * Method to set data
     */
    function setData({ name, description, scope, fields_required, sort_info, is_custom_view, shared_to, range_criteria }) {
        if (name) {
            $dialog.find("#cus_name").val(name); //No I18N
        }
        if (description) {
            $dialog.find("#cus_desc").val(description); //No I18N
        }
        $dialog.find(".show_view").find(`input[type=radio][value='${scope}']`).prop("checked", true);    //No I18N
        if (scope == "3") {
            $dialog.find(".share_filter").removeClass("hide");   //No I18N
            sharedUsers.removeAllItem();
            sharedUsers.setSelectedIds(shared_to);
        }
        $dialog.find("#enableColumn").prop("checked", is_custom_view); //No I18N
        if (is_custom_view) {
            $dialog.find(".col_section").removeClass("hide");    //No I18N
        }
        if (fields_required) {
            for (let i = 0, len = fields_required.length; i < len; i++) {
                $dialog.find(".sortlist").find(`input[value='${fields_required[i]}']`).trigger("click");  //No I18N
            }
        }
        if (sort_info && sort_info.sort_field) {
            $dialog.find("#sortCol").select2("val", sort_info.sort_field);  //No I18N
        }
        if (sort_info && sort_info.sort_order) {
            $dialog.find(`[name='order'][value='${sort_info.sort_order}']`).prop("checked", true);   //No I18N
        }
        if (range_criteria) {
            setRangeData(range_criteria);
        }
    }
    /**
     * Method to reset data
     */
    function resetValues(noUpdate) {
        _self.search_criteria = null;
        if (_self.opts.save) {
            if (noUpdate) {
                _self.update_data = null;
                _self.update_filter_id = null;
                return;
            }
            if (_self.update_data) {
                update(_self.update_data);
                return;
            } else {
                $dialog.find("#cus_name").val('').end() //No I18N
                    .find("#cus_desc").val('').end() //No I18N
                    .find(".show_view").find("input[type=radio][value='1']").prop("checked", true).end()    //No I18N
                    .find(".share_filter").addClass("hide");   //No I18N
                sharedUsers && sharedUsers.removeAllItem && sharedUsers.removeAllItem();
                if (_self.opts.isCustomView) {
                    $dialog.find("#enableColumn").prop("checked", false); //No I18N          
                    $dialog.find("#colOrder").find("input[type='checkbox']").each(function () { //No I18N
                        jQuery(this).prop("checked", false);    //No I18N
                    });
                    $dialog.find(".col_section").addClass("hide");    //No I18N
                }
                $dialog.find("#sortCol").select2("val", _self.opts.save.sortConfig.default);  //No I18N
                $dialog.find(`[name='order'][value='${_self.opts.save.sortConfig.def_order}']`).prop("checked", true);   //No I18N
                if (_self.opts.showRange) {
                    $dialog.find("input[name='rangeType'][value='$(is_pending)']").prop("checked", true);    //No I18N
                    _self.timeFilter.setValue("$(last_30_days)");   //No I18N
                }
            }
            _self.save_data = null;
            _self.update_data = null;
            _self.update_filter_id = null;
        }
    }
    /**
     * Method to get range data
     * @returns {Object} returns object containing range criteria
     */
    function getRangeData() {
        if (!_self.opts.showRange) {
            return null;
        }
        let req_type = $dialog.find("input[name='rangeType']:checked").val();    //No I18N
        let range_criteria = [];
        if (req_type !== "all") {
            range_criteria.push({
                "logical_operator": "AND", "field": "status", "condition": "in", "values": [req_type]  //No I18N
            });
        }
        range_criteria.push(_self.timeFilter.getCriteria());
        return range_criteria;
    }
    /**
     * Method to set range data
     * @param {Array} data array containing range criteria 
     */
    function setRangeData(data) {
        let is_all_req = true;
        for (let i = 0, len = data.length; i < len; i++) {
            let crit = data[i];
            if (crit.field === "status") {
                is_all_req = false;
                $dialog.find(`input[name='rangeType'][value='${crit.values[0].id || crit.values[0]}']`).prop("checked", true);    //No I18N
            } else if (crit.field === "last_updated_time") {
                _self.timeFilter.setValue(crit.value.id || crit.value);
            }
        }
        if (is_all_req) {
            $dialog.find("input[name='rangeType'][value='all']").prop("checked", true);    //No I18N
        }
    }
    /**
     * Method to change view mode for component
     * @param {Boolean} isSave whether to have custom save view or not
     */
    function changeMode(isSave) {
        save_view = isSave;
    }

    return {
        init,
        update,
        reset: resetValues,
        changeMode
    };
})();
