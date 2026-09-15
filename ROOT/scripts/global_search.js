/* $Id $ */
/**
 *  Global Search Component
 *  @param {Object} options
 *  @param {String} selector 
 *  isPortal is true - across protal search enabled
 *  modules - list of modules to be searched
 *  api_url - apiurl for search 
 *  search_text - text to be searched
 *  newTab - open the result in the new tab 
 */
 var globalSearch = (function () {

    function globalSearch(options, selector) {
        this.options = {
            // /* type of search perform listview | select2  */
            // type_search: "listview", //No I18N
            /* is portal specfic search */
            isPortal: false, //No I18N
            /* render as popup model */
            isPopupRender: false,
            /* list module to perfer search */
            modules: [],
            api_url: "/api/v3/portals/search", //No I18N
            search_text: "",
            newTab: false
        }
        this.jQ = jQuery("body");
        this.options = jQuery.extend(this.options, options);
        this.selector = selector || "globalsearch"; //No I18N
        try {
            decodeURIComponent(this.options.search_text) !== this.options.search_text;
        } catch (err) {
            this.options.search_text = encodeURIComponent(this.options.search_text);
        }
        this.options.search_text = decodeURIComponent(this.options.search_text);
        this.validateOption();
        // list of module table component object stored here
        this.tbCompObj = {};
        // list of selected module
        this.activeMod = [];
        // list of searched data fetch from API
        this.modData = {};
        this.flag = {};
        this.isTextChanged = false;
        this.portalData = {};
        this.currentPortal = this.options.selectedPortal ? parseInt(this.options.selectedPortal) : 0;
        this.initSearch();
    }

    /** initialize search  */
    globalSearch.prototype.initSearch = function () {
        this.constructBase();
        this.renderSearch();
        this.loadEvent();
        this.setSearchHeight();
        if(this.options.isPopupRender){
            this.setUrlState();
        }
    }

    /** 
     * Construct the search base
     */
    globalSearch.prototype.constructBase = function () {
        if (this.options.isPopupRender) {
            this.jQ.append("<div class='result-overlay'> <div id='" + this.selector + "_div'></div></div>");
            if (this.options.isInputTriggered) {
                this.jQ.find(".result-overlay").css("animation", "none"); //No I18N
            } else {
                this.jQ.find(".result-overlay").css("animation", "1s slideup"); //No I18N
            }
            if(this.jQ.find('#header-placeholder').length == 0) {
                this.jQ.find(".result-overlay").css("top", jQuery('#top-header').height());  //No I18N
            } else {
                this.jQ.find(".result-overlay").css("top", jQuery('#header-placeholder').height());  //No I18N
            }
            this.jQ.addClass("atp-open");
        }
        this.constructModuleBase();
        this.options.isPortal && !this.options.isSinglePortal && this.constructPortalsList();
        if (this.options.search_text != "") {
            this.jQ.find("#globalsearch_input_gs").val(this.options.search_text);
        } else {
            this.jQ.find("#gs_cleartext").addClass("hide");
        }
    }

    /**
     * Construct the portal list if the isportal is enable 
     */
    globalSearch.prototype.constructPortalsList = function () {
        var _self = this;
        sdpAjax({
            type: "GET", //No I18N
            async: false,
            url: "/api/v3/accessibleportals", //No I18N
            success: function (resp) {
                this.portalData = resp.accessibleportal;
                var defActive = _self.currentPortal == 0 ? "active" : ""; //NO I18N
                var portalHtml = '<li class="whitebg ' + defActive + '" data-portalid="0"><a href="#portal_all" rel="uitip" role="tab" data-switch="sdtab" title="' + getMessageForKey("sdp.requests.common.all") + '">' + getMessageForKey("sdp.requests.common.all") + '</a></li>';
                jQuery.each(this.portalData, function (i, v) {
                    if(v.type !== 'Custom') {
                    var active = v.id == _self.currentPortal ? "active" : "";
                    var description = v.description ? v.description : ""; //NO I18N
                    portalHtml += '<li class="whitebg ' + active + '" data-portalid="' + v.id + '"><a href="#portal_' + v.id + '" rel="uitip" role="tab" data-switch="sdtab" title="' + e_attr(description) + '">' + e_html(v.name) + '</a></li>';
                    }
                })
                _self.jQ.find("#portals_gs").removeClass("hide").find(".nav-sdtabs").html(portalHtml);
            }
        });
    }

    /**
     * construct the module base for the table component initialize 
     */
    globalSearch.prototype.constructModuleBase = function () {
        //TODO icon based checkbox
        var modchkHtml,
            modulesDet = [];
        modchkHtml = '<ul class="gsearch-content" data-name="mainContainer">';
        for (var i = 0; i < this.options.modules.length; i++) {
            var modData = modulesJson[this.options.modules[i]]
            if (modData) {
                var isChecked = "checked"; //No I18N
                if (this.options.activeModules) {
                    isChecked = this.options.activeModules.indexOf(this.options.modules[i]) != -1 ? "checked" : ""; //No I18N
                }
                modchkHtml += '<li class="disp-t pt10">' +
                    '<label class="cus-input xs checkbox-inline fw">' + //No I18N
                    '<input type="checkbox" ' + isChecked + ' aria-label="'+e_attr(modData.id)+'" value="' + modData.id + '" class="mr10 vsub globalchk">' +
                    '<em></em>' + e_html(modData.text) +
                    '</label>' +
                    '</li>';

                modulesDet.push(modData);
            }
        }
        modchkHtml += '</ul>';
        renderhbs("#" + this.selector + "_div", "global-search", modulesDet, false, "common"); // NO I18N
        this.jQ.find("#globalsearch_checkgroup_gs").html(modchkHtml);
    }
    /**
     *  Render search 
     */
    globalSearch.prototype.renderSearch = function () {
        //getting modules from DOM 
        var _self = this;
        var isTextChanged = _self.isTextChanged ? true : false;
        _self.loader(true);
        if (_self.options.activeModules) {
            _self.activeMod = _self.options.activeModules;
            _self.options.activeModules = undefined;
        } else {
            _self.activeMod = _self.getModules();
        }
        _self.getSearchData(function () {
            _self.renderData(isTextChanged);
            _self.showEntityDiv();
            _self.loader(false);
        });
    }
    /**
     * Load the search component events
     */
    globalSearch.prototype.loadEvent = function () {
        var _self = this;

        // handling the search text keydown with debounce method 
        _self.jQ.find("#globalsearch_input_gs").off("keydown.gs_search").on("keydown.gs_search", debounce(function (e) { //NO I18N
            if (e.metaKey || e.keyCode == 16 || e.keyCode == 18 || e.keyCode == 17 || e.keyCode == 27) {
                return false;
            }
            var search_text = encodeURIComponent(_self.jQ.find(this).val());
            var modules = _self.getModules();
            if (modules.length == 0 && e.keyCode != 27) {
                alert(getMessageForKey("sdp.reports.queryreports.pleaseselectmod"));
                return false;
            }
            if (search_text.trim() == "") {
                _self.options.search_text = "";
                _self.modData = {};
                _self.showEntityDiv();
                _self.jQ.find("#globalsearch_no_record").delay(500).removeClass("hide").fadeIn('fast'); //NO I18N
                _self.jQ.find("#gs_cleartext").addClass("hide");
                return false;
            }
            _self.jQ.find("#gs_cleartext").removeClass("hide");
            _self.options.search_text = search_text;
            _self.setUrlState();
            _self.isTextChanged = true;
            _self.renderSearch();
        }, 1000));

        //handling the checkbox changes 
        _self.jQ.find("#globalsearch_checkgroup_gs input").off("change.gs_search").on("change.gs_search", function () { //NO I18N
            var isChecked = _self.jQ.find(this).is(":checked"); //No I18N
            _self.activeMod = _self.getModules();
            /**
             * To delete the web-component instance.
             */
            (isChecked) ? _self.isTextChanged = true : "";
            if (_self.options.fromRequesterZC) {
                if (_self.activeMod.length == 1) {
                    _self.options.list_info.row_count = 10;
                    // change rowcount in dom
                    jQuery("#pagination_comp_" + _self.activeMod[0]).find(".row_count_display").text('10'); //No I18N
                    _self.renderSearch();
                } else {
                    _self.options.list_info.row_count = 5;
                    // change rowcount in dom
                    jQuery("#globalsearch_modules").find(".row_count_display").text('5'); //No I18N
                }
            }
            if (isChecked && _self.options.search_text != "" && _self.options.search_text == _self.getSearchText()) {
                _self.renderSearch();
            } else if (isChecked && _self.options.search_text != "" && _self.options.search_text != _self.getSearchText()) {
                _self.renderSearch();
                return;
            } else if (isChecked && _self.getSearchText() == "") {
                return;
            }
            _self.showEntityDiv();
            _self.setUrlState();
        })

        //handling the portal tabs switch
        _self.jQ.find("#portals_gs .nav-sdtabs > li").off("click.gs_search").on("click.gs_search", function () { //No I18N
            if (_self.getModules().length == 0) {
                alert(getMessageForKey("sdp.reports.queryreports.pleaseselectmod"));
                return false;
            }
            var portalId = _self.jQ.find(this).attr("data-portalid");
            if (_self.currentPortal && _self.currentPortal == portalId) {
                return false;
            }
            _self.currentPortal = portalId;
            _self.setUrlState();
            if (_self.options.search_text != "") {
                _self.renderSearch();
            } else {
                _self.modData = {};
                // _self.showEntityDiv();
            }
        });

        //handling the modules result data redirection
        // jQuery(document).off("click.gs_search").on("click.gs_search", "[data-gs-entity]", function () { //No I18N
        //     var entity = _self.jQ.find(this).attr("data-gs-entity");
        //     var entId = _self.jQ.find(this).closest(".tc-row").attr("data-entityid"); //No I18N
        //     var portalId = "";
        //     if (_self.options.isPortal) {
        //         portalId = _self.jQ.find(this).attr("data-portal-id");
        //     }
        //     _self.modulesRedirect(entity, {
        //         id: entId,
        //         portal_id: portalId
        //     });
        // })

        //handling the clear buttin in search text box 
        _self.jQ.find("#gs_cleartext").off("click.gs_search").on("click.gs_search", function () { //NO I18N
            _self.jQ.find("#globalsearch_input_gs").val("");
            _self.modData = {};
            _self.options.search_text = "";
            _self.showEntityDiv(true);
            //display the accessable module text on clearing the search text in search box
            var modString = [], clearGSMsg = "global.search.nodata4"; // NO I18N
            for (var i = 0; i < _self.options.modules.length; i++){
                modString.push(modulesJson[_self.options.modules[i]].text);
            }

            if (window.location.href.indexOf('ESM.do?') > 0) {
                clearGSMsg = "global.search.nodata5"; // NO I18N
            }
            _self.jQ.find("#nomodule_founds").html(translate(clearGSMsg, [modString.toString()]));
            _self.jQ.find("#globalsearch_no_record").addClass("hide");
            _self.jQ.find("#globalsearch_empty_record").delay(500).removeClass("hide").fadeIn('fast'); //NO I18N
            _self.jQ.find(this).addClass("hide");
            _self.jQ.find("#globalsearch_input_gs").focus();
        });
        //resize the search result container 
        jQuery(window).off("resize.gs_search").on("resize.gs_search", function (e) { //No I18N
            _self.setSearchHeight();
        });

        _self.jQ.find("#gs_back_btn").off("click.gs_search").on("click.gs_search", function () { //NO I18N
            if (_self.options.isPortal) {
                jQuery(".result-overlay").css("animation", "2s slidedown"); //No I18N
                setTimeout(function () {
                    _self.jQ.find(".result-overlay").remove();
                }, 500);
                _self.jQ.find("#gs_portal_search").val(jQuery("#globalsearch_input_gs").val())

                if (_self.options.fromRequesterZC) {
                    _self.options.onCloseCallback();
                } else {
                    window.history.replaceState({}, "globalsearch", "/ESM.do?type=portal"); //NO I18N
                }

                WebComponents.instancePool = {};
                _self.jQ.find("#gs_portal_search").removeAttr("data-triggered");
                _self.jQ.removeClass("atp-open"); //NO I18N
            } else {
                window.history.back();
            }
        })
        _self.jQ.off("keydown.gs_search").on("keydown.gs_search", function (e) { //NO I18N
            if (e.keyCode == 27) {
                if (jQuery(".result-overlay").is(":visible")) {
                    typeof _self.options.onCloseCallback == "function" ? _self.options.onCloseCallback() : ""; //NO I18N
                    _self.jQ.find(".result-overlay").css("animation", "2s slidedown"); //No I18N
                    setTimeout(function () {
                        _self.jQ.find(".result-overlay").remove();
                    }, 500);
                    _self.jQ.removeClass("atp-open"); //NO I18N
                    WebComponents.instancePool = {};
                }
            }
        })
    
        jQuery("#search_filter_list li").off("click.gs_search").on("click.gs_search",function() {//No I18N
            var search_text = encodeURIComponent(_self.jQ.find('#globalsearch_input_gs').val());
            var modules = _self.getModules();
            
            if (modules.length == 0 && e.keyCode != 27) {
                showalert('failure', getMessageForKey("sdp.reports.queryreports.pleaseselectmod"), 'isAutoHide=false'); //NO I18N
                return false;
            }
            
            if (search_text.trim() == "") {
                _self.options.search_text = "";
                _self.modData = {};
                _self.showEntityDiv();
                _self.jQ.find("#globalsearch_no_record").delay(500).removeClass("hide").fadeIn('fast'); //NO I18N
                _self.jQ.find("#gs_cleartext").addClass("hide");
                return false;
            }
            _self.jQ.find("#gs_cleartext").removeClass("hide");
            _self.options.search_text = search_text;
            _self.options.sort_by = jQuery(this).attr('value');
            _self.setUrlState();
            _self.isTextChanged = true;
            _self.renderSearch();
        })
    }
    globalSearch.prototype.setUrlState = function () {
        if (window.location.pathname === "/ESM.do") {// For
            var _self = this;
            var s_txt = _self.options.search_text,
                s_modules = _self.getModules(),
                s_portal_string = "";
            if (_self.options.isPortal) {
                var p_id = _self.currentPortal;
                s_portal_string = p_id != "0" ? "&type=portal&selectedPortal=" + p_id : "&type=portal";
            }
            //fix for URl malformed - if the search contain % in the text;
            try {
                decodeURIComponent(s_txt) !== s_txt;
            } catch (err) {
                s_txt = encodeURIComponent(s_txt);
            }
            window.history.replaceState({}, "globalsearch", window.location.pathname + "?searchText=" + s_txt + s_portal_string); //No i18N
        }
    }
    globalSearch.prototype.setSearchHeight = function () {
        var baseH = 0;
        if (this.options.isPortal) {
            baseH = this.jQ.find(".result-overlay").height() - 78; //NO I18N
            this.jQ.find(".reorder-container").height(baseH)//css("height", "90vh"); //NO I18N
            baseH -= 35;
        } else {
            baseH = jQuery(window).height() - ( jQuery('#header-placeholder').height() + 102 ); //NO I18N
            jQuery("#modulelist").css('height',baseH+'px'); //NO I18N
        }
        if (this.jQ.find("#no_data_entity").length != 0) {
            baseH -= 35;
        }
        this.jQ.find("#globalsearch_container").height(baseH);
    }
    /**
     * Giving the data for table component initializing 
     */
    globalSearch.prototype.renderData = function (isTextChanged) {
        for (var i = 0; i < this.activeMod.length; i++) {
            //Custom rendering for request module to display request and arc request 
            var current_module = this.activeMod[i];
            if (current_module == "request" && this.modData.arc_request && this.modData.arc_request.data.length > 0) {
                this.constructRequestBase(true);
                if (isTextChanged) {
                    delete WebComponents.instancePool["webc-request"];//No i18N
                    delete WebComponents.instancePool["webc-arc_request"];//No i18N
                }
                this.setFlag({
                    current_module: "arc_request" //No i18N
                })
                // if (WebComponents.getInstance("webcArc_request")) {
                //     var tbObj = WebComponents.instancePool.webcArc_request;
                //     tbObj.t_obj.table_info.list_info = {
                //         row_count: "5",
                //         start_index: 1
                //     };
                //     WebComponents.instancePool.webcArc_request = tbObj;
                //     WebComponents.getInstance("webcArc_request").refreshTable();
                // } else {
                WebComponents.render("webc-arc_request");
                // }

                this.setFlag({})
                this.jQ.find("#arc_request_totalcount_gs").text(this.modData.arc_request.list_info.total_count);
                this.setFlag({
                    current_module: "request" //No i18N
                })

                WebComponents.render("webc-request");
                this.setFlag({})
                this.jQ.find("#request_totalcount_gs").text(this.modData.request.list_info.total_count);
            } else {
                if (current_module == "request") {
                    this.constructRequestBase(false);
                    delete WebComponents.instancePool["webc-request"];//No i18N
                    delete WebComponents.instancePool["webc-arc_request"];//No i18N
                    // WebComponents.render("webc-request");
                }
                // this.initTableComp(this.activeMod[i], this.modData[this.activeMod[i]])
                this.setFlag({
                    current_module: current_module
                })
                var wc_name = "webc-" + current_module; //No i18N
                if (WebComponents.getInstance(wc_name)) {
                    var tbObj = WebComponents.instancePool[wc_name];
                    var tb_row_count = this.modData[current_module].list_info.total_count < 5 ? this.modData[current_module].list_info.total_count : 5;
                    tbObj.t_obj.table_info.list_info = {
                        row_count: tb_row_count,
                        start_index: 1
                    };
                    WebComponents.instancePool[wc_name] = tbObj;
                    WebComponents.getInstance(wc_name).refreshTable();
                } else {
                    WebComponents.render("webc-" + this.activeMod[i]);
                }
                this.jQ.find("#" + current_module + "_totalcount_gs").text(this.modData[current_module].list_info.total_count);
                this.setFlag({})
            }
        }
        this.isTextChanged = false;
    }
    /** 
     * @param {boolean} isArcreq -  if the value is true, rendering the request and arc requets structure 
    */
    globalSearch.prototype.constructRequestBase = function (isArcreq) {
        // below code is added for construction of the request and arc request tabs as both modules search result
        // shows under request module with 2 tabs each for request and arc request
        var arcHtml = '<div class="sdtabs-ui2" id="request_mod_gs">' +
            '<ul class="nav nav-sdtabs pos-rel top1" role="tablist">' +
            '<li class="active whitebg" data-portalid="0" role="tab"><a href="#request_gs" data-switch="sdtab"><h4 class="text-color4">' + e_html(modulesJson.request.text) + '(<span id="request_totalcount_gs"></span>)</h4></a></li>' +
            '<li class="whitebg" data-portalid="1" role="tab"><a href="#arc_request_gs" data-switch="sdtab"><h4 class="text-color4">' + e_html(modulesJson.arc_request.text) + '(<span id="arc_request_totalcount_gs"></span>)</h4></a></li>' +
            '</ul>' +
            '</div>' +
            '<div class="sdtab-content">' +
            '<div class="sdtab-pane active" id="request_gs" role="tabpanel">' +
            '<div class="pos-abs top20 right5 mr15" id="pagination_comp_request"></div>' +
            '<web-component  id="webc-request" autoload="true">' + //No i18N
            '<table-component table-holder="request" view="kanban" view_mode="linear" table-info="$gsWebComponent.searchCompObj.tableEntityInfo" row_inputdata="$gsWebComponent.searchCompObj.tableListInfo" callback-headerfunction="$gsWebComponent.searchCompObj.headerDataConstruct" callback-rowfunction="$gsWebComponent.searchCompObj.rowDataConstruct" callback-data-get="$gsWebComponent.searchCompObj.tbCompDataCallBack" entity_name="request" pagination-enabled="true" other-options="$gsWebComponent.searchCompObj.tableCompOptions">' + //No i18N
            '</table-component>' + //No i18N
            '</web-component>' + //No i18N
            '</div>' +
            '<div class="sdtab-pane" id="arc_request_gs" role="tabpanel">' +
            '<div class="pos-abs top20 right5 mr15" id="pagination_comp_arc_request"></div>' +
            '<web-component  id="webc-arc_request" autoload="true">' + //No i18N
            '<table-component table-holder="arc_request" view="kanban" view_mode="linear" table-info="$gsWebComponent.searchCompObj.tableEntityInfo" row_inputdata="$gsWebComponent.searchCompObj.tableListInfo" callback-headerfunction="$gsWebComponent.searchCompObj.headerDataConstruct" callback-rowfunction="$gsWebComponent.searchCompObj.rowDataConstruct" callback-data-get="$gsWebComponent.searchCompObj.tbCompDataCallBack" entity_name="arc_request" pagination-enabled="true" other-options="$gsWebComponent.searchCompObj.tableCompOptions">' + //No i18N
            '</table-component>' + //No i18N
            '</web-component>' + //No i18N
            '</div>' +
            '</div>';
        // below code is added for construction of the request search result title, navigation and data in global search page    
        var reqHtml = '<div class="disp-t fw p20 pb5 pl0 gsearchtitle">' +
            '<div class="fl"><h4 class="m0">' + e_html(modulesJson.request.text) + ' (<span id="request_totalcount_gs"></span>)</h4></div>' +
            '<div class="fr" id="pagination_comp_request"></div>' +
            '</div>' +
            '<web-component  id="webc-request" autoload="true">' + //No i18N
            '<table-component table-holder="request" view="kanban" view_mode="linear" table-info="$gsWebComponent.searchCompObj.tableEntityInfo" row_inputdata="$gsWebComponent.searchCompObj.tableListInfo" callback-headerfunction="$gsWebComponent.searchCompObj.headerDataConstruct" callback-rowfunction="$gsWebComponent.searchCompObj.rowDataConstruct" callback-data-get="$gsWebComponent.searchCompObj.tbCompDataCallBack" entity_name="request" pagination-enabled="true" other-options="$gsWebComponent.searchCompObj.tableCompOptions">' + //No i18N
            '</table-component>' + //No i18N
            '</web-component>' + //No i18N
            '</div>';

        // below code is added for construction of the arc request search result title, navigation and data in global search page
        var arcReqHtml = '<div class="disp-t fw p20 pb5 pl0 gsearchtitle">' +
            '<div class="fl"><h4 class="m0">' + e_html(modulesJson.arc_request.text) + ' (<span id="arc_request_totalcount_gs"></span>)</h4></div>' +
            '<div class="fr" id="pagination_comp_arc_request"></div>' +
            '</div>' +
            '<web-component  id="webc-arc_request" autoload="true">' + //No i18N
            '<table-component table-holder="arc_request" view="kanban" view_mode="linear" table-info="$gsWebComponent.searchCompObj.tableEntityInfo" row_inputdata="$gsWebComponent.searchCompObj.tableListInfo" callback-headerfunction="$gsWebComponent.searchCompObj.headerDataConstruct" callback-rowfunction="$gsWebComponent.searchCompObj.rowDataConstruct" callback-data-get="$gsWebComponent.searchCompObj.tbCompDataCallBack" entity_name="arc_request" pagination-enabled="true" other-options="$gsWebComponent.searchCompObj.tableCompOptions">' + //No i18N
            '</table-component>' + //No i18N
            '</web-component>' + //No i18N
            '</div>';
        if (isArcreq && this.modData.request.list_info.total_count != 0 && this.modData.arc_request) { //No I18N
            this.jQ.find("#request_wrapper").html(arcHtml); //No I18N
        } else if(isArcreq && this.modData.request.list_info.total_count == 0) { //No I18N
            this.jQ.find("#request_wrapper").html(arcReqHtml); //No I18N
        } else {
            this.jQ.find("#request_wrapper").html(reqHtml);
        }
        //isArcreq ? this.jQ.find("#request_wrapper").html(arcHtml) : this.jQ.find("#request_wrapper").html(reqHtml);
    }
    /**
     * callback function for web component to get tablecomponent list info
     */
    globalSearch.prototype.tableListInfo = function () {
        var _self = this,
            listInfo;
        var entity = _self.flag.current_module;
        if (entity) {
            var entityData = _self.modData[entity];
            listInfo = {
                start_index: 1,
                end_index: 5,
                total_count: entityData.list_info.total_count,
                row_count: 5,
                has_more_rows: entityData.list_info.total_count > _self.options.list_info.row_count
            }
            return listInfo;
        }
    }
    /** callback function for web component to get default table info all entity */
    globalSearch.prototype.tableEntityInfo = function () {
        var listInfo = {
            start_index: 1,
            row_count: 5
        }
        return {
            "list_info": listInfo //No i18N
        };
    }
    /**
     *  callback function for web component to get tablecomponent other options
     */
    globalSearch.prototype.tableCompOptions = function () {
        var _self = this,
            options = {};
        options = {
            "column_settings": { //No i18N
                "default_position": 2, //No i18N
                "assign_content_width": false, //No i18N
                "assign_label_width": false, //No i18N
                "columns": [{ //No i18N
                    "size": 1, //No i18N
                    "width": '35px' //No i18N
                },
                {
                    "size": 11, //No i18N
                    "width": '93%', //No I18N
                    "row_count": 2, //No i18N
                    "default_position": 2 //No i18N

                }
                ]
            },
            "height": " ", //No I18N
            "width": "100%",//_self.jQ.find("#globalsearch_container").width(), //No I18N
            "hidePageLength": true, //No I18N
            "callbackAfterBodyRender": _self.afterRenderSearch//No I18N
        }
        return options;
    }
    /**
     * callback function for web component to get table component row construct 
     */
    globalSearch.prototype.rowDataConstruct = function () {
        var entity = this.flag.current_module;
        var metadata = this.options.rowDataConstruct(this, entity); //No I18N
        return metadata;
    }
    globalSearch.prototype.headerDataConstruct = function () {
        var entity = this.flag.current_module;
        var metadata = this.options.headerdataConstruct ? this.options.headerdataConstruct(this, entity) : headerdataConstruct(this, entity);
        return metadata;
    }
    /**
     * table component after render search - reset the flag while in table component construct
     */
    globalSearch.prototype.afterRenderSearch = function () {
        globalSearch.prototype.flag = {};
        $gsWebComponent.searchCompObj ? setTimeout(function () {
            $gsWebComponent.searchCompObj.setSearchHeight();
            jQuery("#globalsearch_input_gs").focus();
        }, 500) : "";
        initTooltip("#global_search"); //No I18N
        $extFrame.setOptions();
    }
    /**
     * tablecomponent data callback - every navigaton and table component initialize its called
     * @param {Object} _self - current component object
     * @param {Object} tbObj-  call back table component object
     */
    globalSearch.prototype.tbCompDataCallBack = function (tbObj) {
        var _self = this;
        var entity = tbObj.t_obj.options.entity_name;
        var entityData = _self.modData[entity].data;
        var wc_name = "webc-" + entity; //No i18N
        if (!WebComponents.getInstance(wc_name)) {
            // portal return set of 25 records so we slice the record based on the row count
            if (_self.options.isPortal) {
                var rc = _self.options.list_info.row_count || 5;
                entityData = entityData.length ? entityData.slice(0, rc) : [];
            }
            var tb_row_count = _self.options.list_info.row_count || 5;
            _self.modData[entity].list_info.total_count < 5 ? tb_row_count = _self.modData[entity].list_info.total_count : "";
            tbObj = {
                "list_info": { //No i18N
                    "row_count": tb_row_count, //No i18N
                    "total_count": _self.modData[entity].list_info.total_count, //No i18N
                    "start_index": 1, //No i18N
                    "has_more_rows": _self.modData[entity].list_info.total_count > _self.options.list_info.row_count //No i18N
                }
            }
            tbObj[entity]= entityData;
            return tbObj;
        } else {
            _self.setFlag({
                isEntity: true,
                current_module: entity
            });
            var listInfo = tbObj.t_obj.table_info.list_info,
                inputObject = {};
            var row_count;
            if (_self.options.isPortal) {
                // listInfo.end_index = 
                listInfo.start_index == 0 ? listInfo.start_index = 1 : "";
                var slicedData = entityData.length ? entityData.slice(listInfo.start_index - 1, listInfo.start_index - 1 + _self.options.list_info.row_count || 5) : "";
                row_count = slicedData.length;
                listInfo.end_index = (parseInt(listInfo.start_index) + parseInt(row_count) - 1);
                listInfo.has_more_rows = listInfo.start_index - 1 + row_count < _self.modData[entity].list_info.total_count;
                listInfo.total_count = _self.modData[entity].list_info.total_count;
                row_count < 5 ? listInfo.row_count = row_count : "";
                var retVal = {
                    "list_info": listInfo //No i18N
                }
                retVal[entity]= slicedData;
                return retVal;
            } else {
                var entity_ids = _self.modData[entity].list_info.ids;
                listInfo.start_index == 0 ? listInfo.start_index = 1 : "";
                var ids = entity_ids.slice(listInfo.start_index - 1, listInfo.start_index - 1 + _self.options.list_info.row_count || 5);
                row_count = ids.length;
                listInfo.end_index = (parseInt(listInfo.start_index) + parseInt(row_count) - 1);
                listInfo.total_count = _self.modData[entity].list_info.total_count;
                listInfo.has_more_rows = listInfo.start_index - 1 + row_count < _self.modData[entity].list_info.total_count;
                /**
                 * If the row count is below 5, we change that based on data.
                 */
                row_count < 5 ? listInfo.row_count = row_count : "";
                if (!_self.isTextChanged) {
                    _self.getSearchData(null, entity, ids)
                }
            }
            var retVal={
                "list_info": listInfo //No i18N
            }
            retVal[entity] = _self.modData[entity].data;
            return retVal;
        }
    }
    /**
     * Getting the search text from search box
     */
    globalSearch.prototype.getSearchText = function () {
        var searchText = encodeURIComponent(this.jQ.find("#globalsearch_input_gs").val());
        return decodeURIComponent(searchText);
    }
    /**
     * Getting the list module currenttly checked 
     */
    globalSearch.prototype.getModules = function () {
        var modules = [];
        var chkMod = this.jQ.find("#globalsearch_checkgroup_gs input:checked");
        jQuery.each(chkMod, function (i, v) {
            modules.push(chkMod[i].value);
        })
        return modules;
    }
    /**
     * Getting the global search data from api 
     */
    globalSearch.prototype.getSearchData = function (cb, entity, ids) {
        var _self = this;
        var modules = _self.activeMod;
        if (modules.length == 0) {
            _self.modData = {};
            _self.showEntityDiv();
            // typeof cb == "function" ? cb() : "";
            return;
        }
        var input_data = {
            search: {
                search_text: _self.getSearchText(),
                row_count: _self.options.list_info.row_count
            }
        }
        if (!_self.options.isPortal) {
            input_data.search.current_portal = true;
            //PORTALID is global object
            input_data.search.portal = {
                id: PORTALID
            }
        } else {
            _self.currentPortal != 0 ? input_data.search.portal = {
                id: _self.currentPortal
            } : "";
            delete input_data.search.row_count;
        }
        input_data.search.include_modules = modules.slice(); //NO I18N
        if (entity) {
            input_data.search.include_ids = ids
            input_data.search.include_modules = [entity];
            delete input_data.search.search_text;
        }
        if (_self.options.sort_by) {
            input_data.search.sort_by = _self.options.sort_by;
        }
        // Currently portal search not support arc request so remove the arc request when sending in api
        if (!_self.options.isPortal && !entity && input_data.search.include_modules.indexOf("request") != -1) {
            input_data.search.include_modules.push("arc_request");
        }
        var ajaxOpt = {
            type: "GET", //NO I18N
            url: _self.options.api_url,
            data: sdpAjaxInputData(input_data),
            success: function (resp) {
                var formatData = dataFormation(resp, entity ? [entity] : input_data.search.include_modules);
                entity ? _self.modData[entity].data = formatData[entity].data : _self.modData = formatData;
                typeof cb == "function" && cb(); //No I18N
            },
            //handling the failuer in api response
            failedCallBack: function (resp) {
                showalert('failure', e_html(resp.responseJSON.response_status.messages[0].message), "isAutoHide=true"); // No I18N
                _self.modData = {};
                _self.showEntityDiv();
                _self.loader(false);
                _self.jQ.find("#globalsearch_no_record").delay(500).removeClass("hide").fadeIn('fast'); // No I18N
            }
        }
        entity ? ajaxOpt.async = false : "";
        sdpAjax(ajaxOpt);
    }
    /**
     * Every module data redirection handling 
     */
    globalSearch.prototype.moduleURL = function (entity, data) {
        var _self = this;
        var url = "",
            portal = "";
        if (_self.options.isPortal) {
            portal = "&PORTALID=" + data.portal.id; //No I18N
        }
        switch (entity) {
            case "request": //No I18N
                url = "/WorkOrder.do?woMode=viewWO&woID=" + data.id + portal; //No I18N
                break;
            case "arc_request": //No I18N
                url = 'SDArchiveWorkOrder.do?woMode=viewWO&woID=' + data.id + portal; // NO I18N
                break;
            case "solution": //No I18N
                url = "/ui/solutions?entity_id="+data.id+"&mode=detail" + portal; //No I18N
                break;
            case "user": //No I18N
                url = '/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId=' + data.id + '&minContent=true&externalframe=true' + portal; // NO I18N
                break;
            case "asset": //No I18N
                url = '/asset/AssetPopup.jsp?forwardTo=detail&module=assets&entity_id=' + data.id + '&from=showdetails&externalframe=true' + portal; // NO I18N
                break;
            case "project": //No I18N
                url = "ProjectAction.do?submitaction=ViewProject&projectid=" + data.id + portal; //No I18N
                break;
            case "template": //No I18N
                url = "/WorkOrder.do?woMode=newWO&reqTemplate=" + parseInt(data.id); //No I18N
                break;
        }
        // if (!_self.options.newTab) {
        // var Stateurl = window.location.href.indexOf("ViewChanged") != -1 ? window.location.href : window.location.href; //No I18N
        // history.pushState({
        //     modules: _self.getModules()
        // }, "globalsearch", Stateurl); //No I18N
        // sdpAjaxUrlHandler(url)
        // var modules = _self.getModules();
        // var searchData = {
        //     modules: modules,
        //     search_text: _self.getSearchText()
        // }
        // sessionStorage.setItem("globalsearch", sdpToJSON(searchData)); //No I18N
        //     window.location.href = url;
        // } else {
        //     window.open(url, "_blank");
        // }
        return url;
    }
    /**
     * Entity (Module) table component refreshing 
     */
    globalSearch.prototype.refreshSearch = function (entity) {
        if (entity) {
            this.setFlag({
                current_module: entity
            });
            this.tbCompObj[entity].refreshTable("refresh");
            this.setFlag({});
            return;
        }
        var mods = this.activeMod;
        for (var i = 0; i < mods.length; i++) {
            this.setFlag({
                current_module: entity
            });
            this.tbCompObj[mods[i]].refreshTable("refresh");
            this.setFlag({});
        }
    }
    /**
     * Setting Flag
     * @param {Object} flag 
     */
    globalSearch.prototype.setFlag = function (flag) {
        if (jQuery.isEmptyObject(flag)) {
            this.flag = {};
            return false;
        }
        var flags = Object.keys(flag);
        for (var i = 0; i < flags.length; i++) {
            this.flag[flags[i]] = flag[flags[i]];
        }
    }
    /**
     * Show Hide Modules in the DOM
     */
    globalSearch.prototype.showEntityDiv = function (isCleared) {
        var modIsempty = 0;
        for (var i = 0; i < this.options.modules.length; i++) {
            var entity = this.options.modules[i];
            if (this.activeMod.indexOf(entity) != -1 && this.modData[entity] && this.modData[entity].list_info.total_count != 0) {
                this.jQ.find("#" + entity + "_wrapper").removeClass("hide");
            } else {
                this.modData[entity] && this.modData[entity].list_info.total_count == 0 ? modIsempty += 1 : "";
                this.jQ.find("#" + entity + "_wrapper").addClass("hide");
            }

            // when no request present and the arc request came to show tht request parent div to display the arc request only
            if (entity === "request" && this.activeMod.indexOf(entity) != -1 && this.modData[entity] && this.modData[entity].list_info.total_count == 0 && this.modData.arc_request && this.modData.arc_request.list_info.total_count != 0) {
                this.jQ.find("#" + entity + "_wrapper").removeClass("hide");
            }
        }
        if (this.activeMod.length == 0) {
            var noDataSelector = isCleared ? "#globalsearch_empty_record" : "#globalsearch_no_record"; //No I18N
            this.jQ.find(noDataSelector).delay(500).removeClass("hide").fadeIn('fast'); //NO I18N
        } else {
            this.jQ.find("#globalsearch_no_record").addClass("hide").end().find("#globalsearch_empty_record").addClass("hide");
        }
        this.checkNoData(isCleared);
    }
    /**
     * Checking module have no data and display the module has not data in DOM
     */
    globalSearch.prototype.checkNoData = function (isCleared) {
        var _self = this;
        var noDataHtml = jQ('<div></div>').attr('id', 'no_data_entity')
                                          .addClass('pr20 pl20 pos-rel')
                                          .css({'box-shadow': '0 -1px 3px rgba(0, 0, 0, 0.1)'}); //NO I18N
        if (_self.jQ.find("#no_data_entity").length == 0) {
            _self.jQ.find("#globalsearch_container").after(noDataHtml);
        }
        var noDataMod = [];
        var arc_request_present = false;
        jQuery.each(_self.modData, function (i, v) {
            var activeModule = _self.getModules();
            if (activeModule.indexOf(i) != -1) {
                v.list_info.total_count == 0 && noDataMod.push(modulesJson[i].text);
            }
            if(i == "arc_request" && v.list_info.total_count != 0 && _self.activeMod.indexOf("request") != "-1") {
                arc_request_present = true;
            }
        })
        noDataHtml = "";
        if (noDataMod.length != 0 && _self.activeMod.length != noDataMod.length) {
            noDataHtml = '<div class=" pt10 pb10">' +
                '<span class="msg text-dark pl20">' + getMessageForKey("global.search.nodatamod", [e_html(_self.getSearchText()), noDataMod.toString()]) + '</span>' +
                '</div>';
            _self.jQ.find("#no_data_entity").html(noDataHtml);
            if (noDataMod.length == _self.options.modules.length) {
                notFountDisp();
            } else if (noDataMod.indexOf("requests") != -1 && _self.activeMod.length - 1 == noDataMod.length) {
                notFountDisp();
            } else if (_self.activeMod.length == noDataMod.length) {
                notFountDisp();
            }
        } else {
            _self.jQ.find("#no_data_entity").remove();
            noDataMod.length == _self.activeMod.length && notFountDisp();
        }
        function notFountDisp() {
            var no_selector = isCleared ? "#globalsearch_empty_record" : "#globalsearch_no_record"; //No I18N
            if (_self.jQ.find(no_selector).is("visible") || arc_request_present) {
                return;
            }
            _self.jQ.find(no_selector).delay(500).removeClass("hide").fadeIn('fast'); //NO I18N
        }
    }
    /**
     * Search loader 
     */
    globalSearch.prototype.loader = function (isShow) {
        if (this.jQ.find(".search-sk-loader").length == 0) {
            this.jQ.find("#globalsearch_container").append('<div class="search-sk-loader pos-abs top0 bgwhite w-100per h-100per"></div>')
            this.jQ.find(".search-sk-loader").html(ajaxBar(".search-sk-loader")); //No I18N

            // jQuery(".search-sk-loader").skLoader({
            //     col: [6, 6],
            //     header: true,
            //     icon: true,
            //     cards: 8,
            //     rows: 2
            // });
        }
        // ̣isShow ? jQuery(".search-sk-loader").skLoader("show") : jQuery(".search-sk-loader").skLoader("hide");
        this.jQ.find("#globalsearch_container").scrollTop(0); //No I18N
        isShow ? jQuery(".search-sk-loader").show() : jQuery(".search-sk-loader").hide(); //No I18N
        isShow ? this.jQ.find("#globalsearch_container").css("overflow", "hidden") : this.jQ.find("#globalsearch_container").css("overflow", "auto"); //No I18N
    }
    /**
     * Just validation for component options
     */
    globalSearch.prototype.validateOption = function () {
        if (this.options.modules.length == 0) {
            throw "Please include modules to initialize search" //No I18N
        };
        if (this.options.activeModules && this.options.activeModules.length > 0) {
            var valModules = []
            for (var i = 0; i < this.options.activeModules.length; i++) {
                if (this.options.modules.indexOf(this.options.activeModules[i]) != -1) {
                    Object.keys(modulesJson[this.options.activeModules[i]]).length > 0 && valModules.push(this.options.activeModules[i]);
                }
            }
            this.options.activeModules = valModules;
        }
        this.options.selectedPortal && isNaN(this.options.selectedPortal) ? this.options.selectedPortal = "" : "";
    }
    /**
     * Default header construct for table component 
     */
    function headerdataConstruct(_self, entity) {
        //Default meta data
        var meta = {
            "module_icon": { //No i18N
                "column_settings": { //No I18N
                    "position": 1 //No I18N
                }, //No i18N
                "hide_label": true, //No i18N
                "default": true, //No i18N
                "dataCelltransformer": constructModuleIcon //No i18N
            },
            "title": { //No i18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                },
                "dataCelltransformer": constructTitle //No i18N

            },
            // "portal": { //No i18N
            //     "text": getMessageForKey("common.portal"), //No i18N
            //     "value_path": "portal.name" //No i18N
            //     // "dataCelltransformer": constructProtalData //No i18N
            // },
            "description": { //No i18N
                "hide_label": true, //No i18N
                "isRTAText" : true //No i18N
            }
        };
        return meta;
    }

    function constructTitle(rd) {
        var _self = $gsWebComponent.searchCompObj, portalID;
        var rd = rd.row_data,
            str = '',
            portalhtml = ''; // No I18N
        if (_self.options.isPortal) {
            portalID = "data-portal-id='" + rd.portal.id + "'"; //No I18N
            portalhtml = "<span class='gs-portal-label' rel='uitip' mode_ellipsis='true' title='"+e_attr(rd.portal.name)+"'>" + e_html(rd.portal.name) + "</span>";
        }
        if (_self.flag.current_module == "announcement") {
            var onclick = "$announcements.viewAnnouncement("+rd.id+", null,null, "+(_self.options.isPortal ? rd.portal.id : null)+")"; //No I18N
            str = '<span class="disp-ib pt3 pb3 truncate-ellipsis w-80per"><span class="truncate-wrapper fw"><span class ="uni-heading a-tag" rel="uitip" mode_ellipsis="true" title="'+e_attr(rd.title)+'" ' + portalID + ' data-gs-entity="' + _self.flag.current_module + '"  nonce="'+sdpNonce+'" data-event="click"  data-handler="'+onclick+'">' + e_html(rd.title) + '</span></span></span>' + portalhtml; //No i18N
        } else {
            var isExternalFrame = (_self.flag.current_module == 'template' || _self.flag.current_module == "request") ? true : false; //No I18N
            str = '<span class="disp-ib pt3 pb3 truncate-ellipsis w-80per"><span class="truncate-wrapper fw"><a class ="uni-heading" rel="uitip" mode_ellipsis="true" title="'+e_attr(rd.title)+'" href="' + _self.moduleURL(_self.flag.current_module, rd) + '" ' + portalID + 'data-externalframe="'+ isExternalFrame +'"' + ' data-gs-entity="' + _self.flag.current_module + '">'+(_self.flag.current_module != "project" ? ' #' + rd.id + ' ': "") + e_html(rd.title) + '</a></span><span class="visi-item"><a href="' + _self.moduleURL(_self.flag.current_module, rd) + '" target="_blank" rel="noopener noreferrer"><span class="ml5 cspr flat icon-sm newtab" title="'+translate("table.open.newtab")+'" rel="uitip"></span></a></span>' + portalhtml; //No i18N
        }
        return str;
    }

    function constructModuleIcon(rd) {
        var _self = $gsWebComponent.searchCompObj;
        var rd = rd.row_data,
            title = "", // No I18N 
            ic_class = ""; // No I18N
        switch (_self.flag.current_module) {
            case "request": // No I18N
                title = translate("sdp.requests.view.incidentrequest"); //No i18N
                ic_class = "cspr inci-req icon-lg"; //No i18N
                if (rd.is_service_request && rd.is_service_request == "true") {
                    title = translate("sdp.home.ssp.templates.tooltip.servicerequest"); // No I18N
                    ic_class = "cspr serv-req icon-lg top3 pos-abs ml1"; // NO I18N
                }
                break;
            case "solution": // No I18N
                title = translate("sdp.header.newsolution"); // No I18N
                ic_class = "hspr ri-solutn2 icon-lg"; // NO I18N
                break;
            case "user": // No I18N
                title = translate("sdp.header.user"); // No I18N
                ic_class = "cspr user-notify icon-md tf1-2 top3 pos-abs ml1"; // NO I18N
                break;
            case "asset": // No I18N
                title = translate("common.asset"); // No I18N
                ic_class = "cspr icon-lg cube opac7"; //No i18N
                break;
            case "project": // No I18N
                title = translate("sdp.header.projects"); // No I18N
                ic_class = "hm-sprite ri-project2 icon-lg"; //No i18N
                break;
            case "announcement": //No I18N
                title = modulesJson.announcement.text;
                ic_class = "cspr announcement1 icon-lg"; //No I18N
                break;
            case "template": //No I18N
                title = modulesJson.template.text; //No i18N
                ic_class = "req-sprite  all-req-icon2-off icon-lg"; //No i18N
                break;
        }
        return "<span title='" + e_attr(title) + "' rel='uitip' class='mt10 " + ic_class + "'></span>"; // No I18N
    }
    /**
     *  Data formating for tablecomponent rendering
     * @param {Array of Object} data list for module data 
     * @param {Array} modls list of modules 
     */
    function dataFormation(data, modls) {
        var datas = data.search;
        var modSpecifc = {};
        for (var i = 0; i < modls.length; i++) {
            var key = modls[i] + "s";
            var module = modls[i];
            if (datas[key]) {
                modSpecifc[module] = {};
                if (datas.search_info) {
                    modSpecifc[modls[i]] = {
                        list_info: {
                            ids: datas.search_info[module + "_ids"],
                            total_count: datas.search_info[module + "_ids"].length
                        }
                    };
                } else {
                    modSpecifc[module] = {
                        list_info: {
                            total_count: datas[key].length
                        }
                    };
                }
                modSpecifc[module].data = datas[key];
            } else {
                modSpecifc[module] = {
                    list_info: {
                        ids: [],
                        total_count: 0
                    }
                };
                modSpecifc[module].data = [];
            }
        }

        var newModule = "template"; //No I18N
        var newKey = newModule + "s"; //No I18N
        if (datas[newKey]) {
            var newTemplates = [];
            var templates = datas[newKey];
            var portalid = datas["portalId"];
            var portalName = datas["portalName"];
            var defaultTemp = {};
            for (var i = 0; i < templates.length; i++) {
                var temp = templates[i];
                temp.portal = {
                    id: portalid,
                    name: portalName
                };
                temp.title = temp.name;
                delete temp.name;

                if (temp.title === "Default Request") { //No I18N
                    defaultTemp = temp;
                } else {
                    newTemplates.push(temp);
                }
            }

            if (defaultTemp.id) {
                newTemplates.push(defaultTemp);
            }
            modSpecifc[newModule] = {
                list_info: {
                    total_count: templates.length
                }
            };
            modSpecifc[newModule].data = newTemplates;
        }

        return modSpecifc;
    }
    // Modules and the I18n keys 
    var modulesJson = {
        request: {
            id: "request", //No I18N
            text: translate("common.requests")
        },
        arc_request: {
            id: "arc_request", //No I18N
            text: translate("common.arqrequests")
        },
        solution: {
            id: "solution", //No I18N
            text: translate("sdp.header.solutions")
        },
        user: {
            id: "user", //No I18N
            text: translate("sdp.admin.leftpanel.users")
        },
        asset: {
            id: "asset", //No I18N
            text: translate("common.inventory")
        },
        project: {
            id: "project", //No I18N
            text: translate("common.projects")
        },
        announcement: {
            id: "announcement", //No I18N
            text: getMessageForKey("sdp.home.announcement.label")
        },
        template: {
            id: "template", //No I18N
            text: translate("common.templates")
        }

    }

    return globalSearch;
})();

// Debouce method to prevent the every keybinding 
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this,
            args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args)
            };
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(function() { later(); }, wait);
        if (callNow) {
            func.apply(context, args)
        };
    };
};

/**
 * Wrapper object to connect web component and search component 
 */
var $gsWebComponent = {
    searchCompObj: {},
    initSearchComponent: function (options) {
        this.modules = options.modules;
        options.headerdataConstruct = !options.isPortal ? this.headerdataConstruct : "";
        this.searchCompObj = new globalSearch(options, options.selector ? options.selector : "globalsearch"); //No i18N
    },
    headerdataConstruct: function (obj, moduleName) {
        //TODO: separate meta data for all
        var request_meta = {}, solution_meta = {}, requester_meta = {} ,asset_meta = {}, change_meta = {};
        //Request row data construct
        request_meta = {
            "is_service_request": { //No i18N
                "column_settings": {//No i18N
                    "position": 1 //No i18N
                }, 
                "hide_label": true, //No i18N
                "default": true, //No i18N
                "dataCelltransformer": $gsWebComponent.constructIsServiceReq //No i18N
            },
            "subject": { //No i18N
                "default": true, //No i18N
                "dataCelltransformer": $gsWebComponent.constructSubjectCell, //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                } 
            },
            "requester": { //No i18N
                "text": getMessageForKey("common.newrequester") //No i18N
            },
            "created_time": { //No i18N
                "type": "date", //No i18N
                "text": getMessageForKey("sdp.reports.surveyDetails.createOn") //No i18N
            },
            "status": { //No i18N
                "text": getMessageForKey("common.status"), //No i18N
                "dataCelltransformer": $gsWebComponent.constructStatusCell //No i18N
            },
            "technician": { //No i18N
                "text": getMessageForKey("sdp.inventory.resource.state.assigned") //No i18N
            }
        };
        //Arc Request row data construct
        // if (moduleName == "arc_request") { //No i18N
            // request_meta.title = request_meta.subject;
            // delete request_meta.subject;
        // }
        //Solutions row data construct
        solution_meta = {
            "title": { //No i18N
                "default": true, //No i18N
                "dataCelltransformer": $gsWebComponent.constructSolAssetTitle, //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                } 
            },
            "last_updated_time": { //No i18N
                "text": translate("sdp.solutions.newsolution.updatedon"), //No i18N
                "type": "date" //No i18N
            },
            "topic": { //No i18N
                "text": translate("sdp.solutions.newsolution.topic") //No i18N
            }
        };
        solution_meta.icon = request_meta.is_service_request;

        //requester row data construct
        requester_meta = {
            "name": { //No i18N
                "default": true, //No i18N
                "dataCelltransformer": $gsWebComponent.constructUserNameCell, //No i18N
                "text": translate("sdp.common.name"), //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                } 
            },
            "email_id": { //No i18N
                "text": translate("sdp.admin.orgrole.import.key2") //No i18N
            },
            "phone": { //No i18N
                "text": translate("sdp.viewuserdetails.phone") //No i18N
            },
            "mobile": { //No i18N
                "text": translate("common.mobile") //No i18N
            },
            "department": { //No i18N
                "text": translate("sdp.common.dept.is") //No i18N
            }
        };
        requester_meta.icon = request_meta.is_service_request;


        //assets row data construct
        asset_meta = {
            "name": { //No i18N
                "default": true, //No i18N
                "dataCelltransformer": $gsWebComponent.constructSolAssetTitle, //No i18N
                "hide_label": true, //No i18N
                "column_settings": { //No i18N
                    "rowposition": 1, //No i18N
                    "view_type": "row" //No i18N
                } 
            },
            "model": { //No i18N
                "text": translate("ae.cmdb.source.model"), //No i18N
                "value_path": "product.name" //No i18N
            },
            "org_serial_number": { //No i18N
                "text": translate("sdp.common.serialno"), //No i18N
                "type": "date" //No i18N
            },
            "location": { //No i18N
                "text": translate("sdp.inventory.detailWS.location") //No i18N
            },
            "user": { //No i18N
                "text": translate("sdp.helpdesk.common.user") //No i18N
            }
        };
        asset_meta.icon = request_meta.is_service_request;

        switch (moduleName) {
            case "request": //No i18N
            case "arc_request": //No i18N
                return request_meta;
            case "solution": //No i18N
                return solution_meta;
            case "user": //No i18N
                return requester_meta;
            case "asset": //No i18N
                return asset_meta;
        }
    },
    constructStatusCell: function (rdData) {
        var rd = rdData.row_data;
        var Str = "-"; //No i18N
        if (rd.status) {
            Str = "<em class='priority-badge mr5 minw-0px' data-style='background:" + e_attr(rd.status.color) + ";'>&nbsp;</em>" + e_html(rd.status.name); //No i18N
        }
        return Str;
    },
    constructIsServiceReq: function (tb_data) {
        var _self = $gsWebComponent.searchCompObj;
        var rd = tb_data.row_data,
            title = "",
            ic_class = ""; // No I18N
        switch (_self.flag.current_module) {
            case "request": // No I18N
            case "arc_request": // No I18N
                title = translate("sdp.requests.view.incidentrequest"); //No i18N
                ic_class = "cspr inci-req icon-lg"; // NO I18N

                if (rd.is_service_request) {
                    title = translate("sdp.home.ssp.templates.tooltip.servicerequest"); // No I18N
                    ic_class = "cspr serv-req icon-lg top3 pos-abs ml1"; // NO I18N
                }
                break;
            case "solution": // No I18N
                title = translate("sdp.header.newsolution"); // No I18N
                ic_class = "hspr ri-solutn2 icon-lg"; // NO I18N
                break;
            case "user": // No I18N
                title = translate("sdp.header.user"); // No I18N
                ic_class = "cspr user-notify icon-md tf1-2 top3 pos-abs ml1"; // NO I18N
                break;
            case "asset": // No I18N
                title = translate("common.asset"); // No I18N
                ic_class = "cspr icon-lg cube opac7"; //No i18N
        }

        return "<span title='" + e_attr(title) + "' rel='uitip' class='mt10 " + ic_class + "'></span>"; // No I18N
    },
    constructSubjectCell: function (tb_data) {
        var _self = $gsWebComponent.searchCompObj;
        var rd = tb_data.row_data,
            str = '',
            title = '',
            isArcWo = _self.flag.current_module == 'arc_request'; // No I18N

        if (isArcWo) {
            str = '<span class="disp-ib p3 truncate-ellipsis"><span class="truncate-wrapper"><a class ="uni-heading" data-externalframe="true" href="' + _self.moduleURL("arc_request", rd) + '" rel="uitip noopener noreferrer" data-gs-entity="request" target="_blank" title="'+ e_attr(rd.subject) +'"> #' + rd.id + ' ' + e_html(rd.subject) + '</a></span></span>'; //No i18N
        } else {
            var url = '/WorkOrder.do?woMode=viewWO&externalframe=true&woID=' + rd.id + "&noheader=true&from=global_search"; // NO I18N
            var title = '#' + rd.id + ' ' + e_attr(e_html(rd.subject)); // NO I18N
            var hrefUrl = '/WorkOrder.do?woMode=viewWO&woID=' + rd.id; // NO I18N

            str = '<span class="disp-ib p3 truncate-ellipsis"><span class="truncate-wrapper"><a class ="uni-heading listview-popup" data-externalframe="true" href="'+ hrefUrl +'" rel="uitip" data-gs-entity="request" nonce="'+sdpNonce+'" data-event="click" data-handler="$previewComponent.load(\'' + url + '\',\'' + title + '\', null, 200, null, \'wo-details-frame\')" title="' + e_attr(rd.subject) + '"> #' + rd.id + ' ' + e_html(rd.subject) + '</a></span></span>'; //No i18N
        }
        return str;
    },
    constructUserNameCell: function (tb_data) {
        var _self = $gsWebComponent.searchCompObj;
        var rd = tb_data.row_data, name = rd.name,
            str = '',
            url = _self.moduleURL("user", rd); // No I18N
            var hrefUrl = '/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId=' + rd.id + '&minContent=true'; // NO I18N
        var sliderTitle = '#' + rd.id + ' ' + e_attr(e_html(name));
        str = '<a href="' + hrefUrl + '" data-event="click" nonce="'+sdpNonce+'" data-handler="$previewComponent.load(\'' + url + '\', \''+ sliderTitle +'\', 250, 200, null, \'globalsearch_popup\')" data-gs-entity="user" class="uni-heading">' + rd.id + ' - ' + e_html(name);

        if (rd.is_vipuser) {
            str += ' <span title="' + translate('sdp.admin.requesterDef.vipuser') + '" rel="uitip" class="cspr vip icon-sm mr30"></span>';
        }
        str +=  '</a>';

        return str;
    },
    constructSolAssetTitle: function (rd) {
        var _self = $gsWebComponent.searchCompObj;
        var rd = rd.row_data,
            str = '',
            module = _self.flag.current_module, title = '';// No I18N
        switch (module) {
            case "solution": // No I18N
            case "project": // No I18N
            case "announcement": // No I18N
                title = rd.title;
                break;
            case "asset": // No I18N
                title = rd.name;
                var hrefUrl = '/Assets.do?entity_id=' + rd.id + '&module='+rd.module.api_plural_name; // NO I18N
                return str = '<span class="disp-ib p3 truncate-ellipsis"><span class="truncate-wrapper"><a class ="uni-heading" rel="noopener noreferrer" href="' + hrefUrl + '" nonce="'+sdpNonce+'" data-event="click" data-handler="assetsObj.loadAssetDetailPopup(\'' + rd.id + '\', \'' + rd.module.api_plural_name + '\');" data-gs-entity="' + module + '" rel="uitip noopener" title="' + e_attr(title) + '"> ' + e_html(title) + '</a></span></span>'; //No i18
            case "user": // No I18N
                title = rd.name;
            break;
        }
        str = '<span class="disp-ib p3 truncate-ellipsis"><span class="truncate-wrapper"><a class="uni-heading" href="' + _self.moduleURL(module, rd) + '" target="_blank" data-gs-entity="' + module + '" rel="uitip noopener noreferrer" title="'+ e_attr(title) +'"> ' + e_html(title) + '</a></span></span>'; //No i18N
        return str;
    }
}
