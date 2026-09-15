/* $Id$ */
var jQ = jQuery;
function tableComponent(table_info, table_content, options, controller) {
    this.t_obj = {};
    //this.defaultpath = "/api/v3/"; // No I18N
    this.tableId = options.tableHolder ? options.tableHolder : options.entity_name;
    // table container 
    this.tblContainerId = options.view_mode == "full_kanban" ? this.getTableId('','_kanban_div') : this.getTableId('','_div');
    this.tblContainer = jQ('#'+this.tblContainerId) ;
    if(options.defaultpath == undefined){
        options.defaultpath="/api/v3/"; //No I18N
    }
    this.t_obj.options = options;
    this.t_obj.table_info = table_info;
    if (!jQ.isEmptyObject(table_info) && table_info.list_info) {
        if(table_info.list_info.search_fields){
            this.t_obj.table_info.default_searchfields = table_info.list_info.search_fields;
        }
        if(table_info.list_info.default_search_criteria) {
            this.t_obj.default_search_criteria = table_info.list_info.default_search_criteria;
            delete table_info.list_info.default_search_criteria;
        }
    }

    this.t_obj.meta_info = table_content.header;
    if (controller) { //For 'EMBER' modules only 
        this.context = controller;
    }
    this.localTranslate = this.getKeyTranslation
    this.sort_asc = "A";
    this.sort_desc = "D";

    this.checkToEnableCopyTicket(options);

    if (options.isODAPI) {
        this.sort_asc = "asc";
        this.sort_desc = "desc";
    }
    if (options.urlSearch) { // Search and navigation can do through URL
        this.setLocSeachObj();
        if (window.location.href.indexOf("url_search").length === -1) {
            window.history.pushState("listviewurl", '', null); // No I18N
        }
    }
    if (options.previewSettings) {
        this.previewEnabled = true;
    }



    if(options.lazyloadingEnabled){
         this.loadedData = [];
    }
    this.loadAddon(this.t_obj.options); //load addon files dynamically
    this.init(); // Component Init call
}
tableComponent.prototype = {
    /* Component initialization starts here */
    init: function () {
        var _self = this;

         if(_self.tblContainer && _self.tblContainer.length) {
            //add table instance to containter
            _self.tblContainer[0].tableInstance = _self;
        }

        //Methods to set table width and height based on settings
        _self.setWidth();
        _self.setHeight();

        //init table component event
        jQuery(document).trigger('initTableComponent',[_self,_self.t_obj.options]);

        //Remove list view settings dom if present
        if(jQ("#t_setting_popup_"+_self.tableId).length > 0) {
            jQ("#t_setting_popup_"+_self.tableId).remove(); // No I18N
        }

        var table = "";
        if (_self.t_obj.options.view == "kanban") { // No I18N
            /*Constructing base structure of Kanban view*/
            _self.t_obj.options.columnWidth = _self.t_obj.options.width / 12;
            _self.t_obj.options.columnlabelWidth = _self.t_obj.options.columnlabelWidth || (_self.t_obj.options.view_mode == "linear") ? 100 : 75;
            if ( (_self.t_obj.options.view_mode != "full_kanban") && ( !_self.t_obj.options.combined_settings || _self.t_obj.options.combined_settings.component_type == "parent") ) {
                
                let containerCss = {'overflow-y':'auto','overflow-x':'hidden','border-top':'1px solid #e5e5e5','height':(_self.t_obj.options.height)+'px'};
                let contentDiv = jQ('<div id="'+_self.getTableId('','_kanban_div')+'"></div>')
                .addClass('pb10 pos-rel tc-kanban')
                .css(containerCss);
                jQ(_self.getTableId('#','_div')).css('width', _self.t_obj.options.width + "px").append(contentDiv);
            }
            /*If No data banner enabled, we will be hiding listview div initially and will be showing if it has any data or will be showing empty data banner*/
            if (_self.t_obj.options.nodatabanner_callback) {
                jQ(_self.getTableId('#','_kanban_div')).hide();
            }
            // refere table info when custom view is present.
            _self.t_obj.options.isCustomView && (_self.t_obj.def_table_info = Object.assign({},_self.t_obj.table_info));
            if(!_self.checkCustomViewEnabled()){
                _self.setupHeaderColumns();
            }
            //At the time of initialization, "constructKanbanContent" will be called for normal Kanban view / If Unified view, for "parent" component only.
            if (!_self.t_obj.options.combined_settings || _self.t_obj.options.combined_settings.component_type == "parent") {
                if (_self.t_obj.options.data) {
                    _self.constructKanbanData(_self.t_obj.options.data);
                    _self.afterInitialKanbanRender();
                } else {
                    _self.constructKanbanContent(false, true, undefined, function () {
                        _self.afterInitialKanbanRender();
                    });
                }
            }
            // setTimeout(function () {
                _self.listControlsEvents();
                if (_self.t_obj.options.isBulkSelectEnabled) {
                    _self.bindChkboxEvent(); // Checkbox - onchange Event for delete button enable 
                    _self.bulkSelect.initEvents();
                }
            // }, 200);
        }else if(_self.t_obj.options.view == "gallery"){
            _self.t_obj.options.height = _self.t_obj.options.height ? _self.t_obj.options.height : (jQ(window).height() - 140);
            _self.t_obj.options.width = _self.t_obj.options.width ? _self.t_obj.options.width : (jQ(window).width() - 50);
            var contDiv = jQ(`<div id="${_self.getTableId('','_gallery_div')}" class="p10 pos-rel flex-card"></div>`); // No I18N
            contDiv.addClass('p10 pos-rel flex-card');
            
            jQ(_self.getTableId('#','_div')).append(contDiv).css('width', _self.t_obj.options.width+"px");
            _self.t_obj.options.data ? _self.constructGalleryData(_self.t_obj.options.data) :  _self.constructRowContent();
            
             // setTimeout(function(){
                _self.listControlsEvents();
            // },200);
        } else {
            /*Constructing Base structure of 'TABLE' - start*/
            var tblCss = _self.t_obj.options.columnFullWidth ? {'table-layout':'fixed'} : {};
            let id = _self.getTableId('','');
            var stickyClass = _self.t_obj.options.staticHeader ? 'sticky-header' : '';
            var classes = ('tableComponent '+stickyClass).trim();
            table = jQ(`<table id="${id}" class="${classes}" width="100%">
                                <thead id="${_self.getTableId('','_head')}"></thead>
                                <tbody id="${_self.getTableId('','_body')}"></tbody>
                            </table>`).css(tblCss);

            /** bulk association comes under form */
            if(_self.t_obj.options.bulkAssociate){
                table = _self.bulkAssociation.addFormTag(table);
            }
            let $tblDiv = jQ(_self.getTableId('#','_div'));
            $tblDiv.append(table); // No I18N
            if (_self.t_obj.options.staticHeader) {
                _self.setWidthHeight(); // it will set width and height only staticHeader enabled
            }

            if (_self.t_obj.options.inlineEditEnabled) {
                let div = jQ("<div id='" +_self.getTableId('','_inlineEditFields')+"'></div>").css('display','none');
                $tblDiv.append(div);
            }
            /*If No data banner enabled, we will be hiding listview div initially and will be showing if it has any data or will be showing empty data banner*/
            if (_self.t_obj.options.nodatabanner_callback) {
                $tblDiv.hide();
            }
            // refere table info when custom view is present.
            _self.t_obj.options.isCustomView && (_self.t_obj.def_table_info = Object.assign({},_self.t_obj.table_info));
            if(!_self.checkCustomViewEnabled()){
                _self.setupHeaderColumns();
            }
             _self.constructRowContent('init');
            _self.afterInitialRender();
            if (_self.t_obj.options.urlSearch) { // Search and navigation can do through URL
                jQ(window).on("popstate.tbstate_" + _self.tableId, function (e) {
                    var state = e.originalEvent ? e.originalEvent.state : null;
                    if (state != null) {
                        var e_Obj = state;
                        if (state === "listviewurl") {
                            e_Obj = null;
                        }
                        if(state.listview_search) {
                            _self.setLocSeachObj(e_Obj, true);
                            _self.changeFilterString("stateSearch");
                        }
                    }
                });
            }
            /*Constructing Base structure of 'TABLE' - End*/
        }
        //Whether to change table width and height on window resizing
        if(_self.t_obj.options.handleWindowResize) {
            _self.handleResize();
        }


    },
    setWidthHeight:function(isReset){
        var _self = this;
        isReset && _self.setWidth(true) && _self.setHeight(true);
        let $tblDiv = jQ(_self.getTableId('#','_div'));
        $tblDiv.css({
            'overflow': 'auto',     // No I18N
            height: _self.t_obj.options.height + 50,    //35 head + 15 scrollbar
            width: _self.t_obj.options.width
        });
    },
    isCopyTicketAllowedEntity: function (entity_name) {
        const copyTicketAllowedEntity = ['associated_requests','request','requests','associated_incidents','initiated_by_requests','initiated_requests','arc_initiated_by_requests','arc_initiated_requests'];
        return copyTicketAllowedEntity.includes(entity_name);
    },
    //to enable copy ticket in table based on option and allowed entity name
    checkToEnableCopyTicket: function (options) {
        const _self = this;
        // const isTableView = (_self.t_obj.options.view == undefined || _self.t_obj.options.view == 'table');

        //support for copy ticket id in table
        if (options.hasOwnProperty('enable_copy_ticket')) {
            _self.t_obj.options.enable_copy_ticket = options.enable_copy_ticket ;
        } else if(_self.isCopyTicketAllowedEntity(options.entity_name)) {
            _self.t_obj.options.enable_copy_ticket = true;
        }
    },
     //return string - will get table id with prefix and suffix 
    getTableId:function (prefix,suffix){
        var _self = this;
        prefix=prefix||'';
        return prefix+_self.tableId+suffix;
    },
    //To Load table component addon files according to options given
    loadAddon:function(options) {
        var _self=this;
        //load file map object
        function getDefaultConfig(name){
            return {
                fileName:name+'.js',
                isLoaded:()=>typeof window[name] == 'function',
                callAddon:(addonOptions)=>window[name](_self,options,addonOptions)
            }
        }
        var addonMap = {
            'childView':'tableChildView',
            'reorderEnabled':'tableRowReorder',
            'bulkSelectionSetting':'bulkSelectionOperation',
            'bulkAssociate':'tableAssociation',
            'enablePickListSearch':'tableInlinePLSearch',
            'tableExport':'tableExport'
        };

        function loadFile(name,addonOptions) {
           var data = typeof name == 'string' ? getDefaultConfig(name) : name;
           
            var config = {
                js: ["/scripts/"+data.fileName], // No I18N
                async:false,
                process:'series',
                /**
                 * To load environment-specific files based on IS_DEVELOPMENT_MODE.
                 */
                jsMinify : true,
                success:()=>{
                    data.callAddon(addonOptions);
                }
            };
            //load file if not loaded already
            data.isLoaded() ? config.success() : ResourceLoader(config);
        }

        var loadFiles = (addOnName)=> options[addOnName] && loadFile(addonMap[addOnName],options[addOnName]);
        Object.keys(addonMap).forEach(loadFiles);
    },
    afterInitialRender: function () {
        //Function will be called once for table, at initial loading
        /*jQ.expr[':'].truncated = function(e) { //Expression is for finding ellipsis applied element and setting title
            return (e.offsetWidth < e.scrollWidth && e.title == "") ? e.title = e_html(e.textContent) : false;
        };*/
        var _self = this;
        _self.listControlsEvents();
        _self.tableEvents();
        if (typeof _self.t_obj.options.callbackAfterInitialRender == "function") {
            _self.callbackEmberNonember(_self.t_obj.options.callbackAfterInitialRender); // No I18N
        }
    },
    listControlsEvents: function () {
        var _self = this;
        if (_self.t_obj.options.columnChooserEnabled) {
           /** Column chooser button construction when listview load */
           var columnChooserContainer = _self.constructColumnChooserBtn();
           if(columnChooserContainer) {
                //table component not creating column chooser button and container, so no need to add event, means which handled by module side
                _self.columnChooserContainer = columnChooserContainer;
                /** Event binding for openup the column chooser */
                function initColumnChooserDrop(){
                        /** prevent multiple times bind events and construction of column chooser */
                            _self.constructColumnChooser(false,_self.columnChooserContainer);
                            var sortableParId = _self.tableId;
                            //For Unified view, we are creating ID as tableholder with module name i.e) "activities_request"
                            if(_self.t_obj.options.combined_settings){
                                sortableParId = _self.tableId + "_"+_self.t_obj.options.combined_settings.module;
                            }

                        var findRowCheckbox = (uiItem)=>{
                            return function(position) {
                                var row;
                                if(position == 'next'){
                                    row = uiItem.next('li');
                                } else if(position == 'prev'){
                                    row = uiItem.prev('li');
                                } else {
                                    row = uiItem;
                                }
                                var found = row.find('input.colcheckbox');
                                return found.length ? found.get(0) : {};
                            }
                        }
                        var getCheckboxStatus = (findCheckbox)=> {
                            return (position)=>findCheckbox(position).checked;
                        }


                        /** Column chooser loading */
                        /** timeout for prevent dropdown open */
                        var sortableOption = {
                            placeholder: "ui-state-highlight",  //No I18N
                            handle: '.ctl i',   //No I18N
                            start: function(e, ui){
                                ui.placeholder.height(ui.item.height());
                            },
                            stop: function(e,ui) {
                                var findCheckbox = findRowCheckbox(jQ(ui.item));
                                var isChecked = getCheckboxStatus(findCheckbox);
                                var prev = isChecked('prev')|| false, next = isChecked('next')|| false,current = isChecked();
                                //current disabled checkbox
                                var currentCheckbox = findCheckbox();
                                var isStopUpdate = ()=>{
                                    var disabledCheckbox = currentCheckbox.disabled && current && prev != current;
                                    return disabledCheckbox && prev == next;
                                }
                                //Stop update the current checkbox to unchecked when it is in disabled.
                                var revertPosition =()=>jQ(this).sortable('cancel');
                                
                                //To update current checkbox to prev and next checkbox same state
                               var updateCheckbox=()=> {
                                    if((current !== prev && current !== next) || (current == false && current !== next)){
                                        currentCheckbox.checked = !current;
                                    }
                                } 

                                isStopUpdate() ? revertPosition() : setTimeout(updateCheckbox,1);

                            },
                            scrollSpeed : 10
                        };


                            jQ('.sortlist',this).sortable(sortableOption);
                            jQ(".showmenu",this).children(':nth-child(1)').show().end().children(':nth-child(2)').hide();

                            jQ("#" + sortableParId + "_colsort").on('change', '.colcheckbox', function() { // No I18N
                                _self.reOrderColChooser(this);
                            });
                            var eventNamespace = _self.eventNamespace = '.table-component_'+_self.tableId;
                            jQ(this).on('click'+eventNamespace,"#"+sortableParId+"_col-save-btn", function() { // No I18N
                                var button = this;
                                var doAction = ()=> {
                                    _self.isRefresh = true;
                                    _self.columnChooserChanges(button);
                                }
                                !_self.bulkAssociationAlert(doAction,'columnChooserChanges') && doAction();
                            });
                }
                var eventNamespace = _self.eventNamespace = '.table-component_'+_self.tableId;
                var hasOldInstanceEvent =  columnChooserContainer[0].lastEvent ? (Date.now() - (columnChooserContainer[0].lastEvent)) >300 : null;
                if(hasOldInstanceEvent) {
                    //has old instance event for table view, then off that event
                    columnChooserContainer.off('click'+eventNamespace);
                }
                columnChooserContainer.one('click'+eventNamespace,initColumnChooserDrop);
                columnChooserContainer[0].lastEvent = Date.now();
           }
           
        }
        /** 
         * Listview settings
         */
        if (_self.t_obj.options.listSettingEnabled) {
            _self.constructListViewSettings();
            _self.loadListSettingEvents();
            function closePopup(evt){
                 var isSelect2Mask = jQ(evt.target).hasClass('select2-drop-mask');
                 var insideDropdown = jQ(evt.target).closest('div.popover-inner').length || isSelect2Mask;
                 if(!insideDropdown){
                     closeDD();
                     jQ('body').off('mouseup.table-settings');
                 }
             }
             function addOutSideClik(){
                 jQ('body').off('mouseup.table-settings').on('mouseup.table-settings',closePopup);
             }
             jQ("#t_list_settings_" + _self.tableId + " > button").off('click.table-settings').on('click.table-settings', function (evt) { // No I18N
                var ls_detach = jQuery("#t_ls_detach_" + _self.tableId).detach();
                jQuery('body').off("click.popoverEv");
                jQuery(document).off("keydown.popoverEv");
                //To Close open bootstrap dropdowns in list controls
                jQuery('body').trigger('click');
                showPopover(evt, 'click', function () {
                    jQuery(".listview-settings").find(".popover-inner").append(ls_detach);
                    addOutSideClik();
                });
            });
        }

        if (_self.t_obj.options.paginationEnabled) {
            _self.constructPaginationDetails();
            jQ("#pagination_comp_" + _self.tableId).find('ul').on('click', 'li', function () { // No I18N
                var liElement = this;
                var count = this.dataset.value;
                var doAction =()=> _self.paginationChanged(liElement,count);
                
                !_self.bulkAssociationAlert(doAction,'pageLimit') && doAction();
            });
            jQ("#pagination_comp_" + _self.tableId).find('#prevPage,#nextPage').on('click', function () { // No I18N
                var button = this;
                var field = button.dataset.field;
                var doAction =()=> _self.nextPrevNav(field);
                !_self.bulkAssociationAlert(doAction,'pageNav') && doAction();
            });
            if (_self.t_obj.options.get_total_count == false) {
                jQ("#pagination_comp_" + _self.tableId).find('.gettotalcount').on('click', function () { // No I18N
                    _self.getTotalCount();
                });
            }

        }
        if (_self.t_obj.options.multiDeleteEnabled) {
            _self.constructDeleteIcon();
            jQ("#" + _self.tableId + "_btn_delete").on('click', function () { // No I18N
                _self.deleteRecords();
            });
        }
        //To construct bulk selection label content.
        if (_self.t_obj.options.isBulkSelectEnabled) {
            let bulkSelectionDiv = jQ("#bulk_selection_" + _self.tableId);
            let dropDownElem = table_comp.applyDataStyle(_self.bulkSelect.getDropDownHTML());
            bulkSelectionDiv.empty().append(dropDownElem);
            
        }
        if (_self.t_obj.options.view == "kanban") { // No I18N
            if (_self.t_obj.options.sortingEnabled) {
                _self.constructSortableColumns();
                jQ("#t_sorticon_" + _self.tableId + " ul li").on("click", function () {
                    jQ("#t_sorticon_" + _self.tableId + " ul li").removeClass("active");
                    jQ(this).addClass("active");
                    var sort_field = jQ(this).find("span").attr('data-value');
                    var value_path = jQ(this).find("span").attr('data-valuepath');
                    var selected_text = jQ(this).find("span").text();
                    jQ("#" + _self.tableId + "_sortfield .sorttext").text(selected_text);
                    jQ("#" + _self.tableId + "_sortfield > button").attr("title", _self.localTranslate("common.sortby") + " : " + e_attr(selected_text));    // No I18N
                    _self.t_obj.table_info.list_info.sort_field = sort_field;
                    if (value_path) {
                        _self.t_obj.table_info.list_info.sort_valuepath = value_path;
                    } else {
                        delete _self.t_obj.table_info.list_info.sort_valuepath;
                    }
                    //updating sort_field in personalization
                    setTimeout(function () {
                        _self.updateTableInfoPeronalization("sorting"); // No I18N
                    });
                });

                jQ("#" + _self.tableId + "_sortorder").on("click", function () {
                    var sortOrder = jQ(this).find("span").hasClass("asc") ? "A" : "D";
                    var sort_ord_ele = jQ(this).find("span"), sort_order = "";
                    var sortSelect = jQ(this).prevAll('select').get(0);
                    var sort_field = sortSelect && sortSelect.value;
                    var value_path = sortSelect && (sortSelect[sortSelect.selectedIndex].dataset && sortSelect[sortSelect.selectedIndex].dataset.valuepath ? sortSelect[sortSelect.selectedIndex].dataset.valuepath : false);  
                    !sortSelect && (value_path = _self.t_obj.table_info.list_info.sort_valuepath);

                    sort_ord_ele.removeClass('asc desc1');
                        
                    if (sortOrder == "D") {
                        sort_ord_ele.addClass('asc').end().attr('title', translate('common.sortasc')).uitooltip({ content: translate('common.sortasc') }); //NO I18N 
                        sort_order = _self.sort_desc; // No I18N     
                    } else {
                        sort_ord_ele.addClass('desc1').end().attr('title', translate('common.sortdesc')).uitooltip({ content: translate('common.sortdesc') }); //NO I18N       
                        sort_order = _self.sort_asc; // No I18N
                    }
                    _self.t_obj.table_info.list_info.sort_order = sort_order;
                    sortSelect && (_self.t_obj.table_info.list_info.sort_field = sort_field);
                    if (value_path) {
                        _self.t_obj.table_info.list_info.sort_valuepath = value_path;
                    } else {
                        delete _self.t_obj.table_info.list_info.sort_valuepath;
                    }
                    //updating sort_order in personalization
                    setTimeout(function () {
                        _self.updateTableInfoPeronalization("sorting"); // No I18N
                    });
                });
            }
            if (_self.t_obj.options.searchEnabled) {
                _self.constructSearchIcon();
                jQ("#" + _self.tableId + "_listSearch").on('click', function () {
                    var that = this;
                    if (typeof FormComponent === "function") {
                        _self.constructSearchPopup(this);
                    } else {
                        ResourceLoader({
                            js: (sdp_app.IS_DEVELOPMENT_MODE ? ["/scripts/old_form_component.js"] : ["/scripts/old_form_component.min.js"]),    //No I18N
                            async : false,
                            process : "series", //NO I18N
                            cache : true,
                            success :function() {
                                _self.constructSearchPopup(that);
                            }
                        });
                    }
                });
            }
            jQ("[id*='" + _self.tableId + "_head_chk']").on('change', function () {
                if (_self.t_obj.options.isBulkSelectEnabled) {
                    _self.bulkSelect.selectAllRecords(this.checked, _self);
                }
            });
        }
        if (this.t_obj.options.advSrchFiltEnabled) {
            _self.constructAdvFilter();
        }
        if (_self.t_obj.options.group_by_settings && _self.t_obj.options.group_by_settings.enable) {
            _self.constructGroupBy();
        }
        //construct and bind refresh frequency
        if (this.t_obj.options.refreshEnabled) {
            var opt = this.t_obj.options;
            _self.constructRefreshFreq();
            if (opt.listSettingEnabled && opt.listSettingOptions && opt.listSettingOptions.enableSettings && opt.listSettingOptions.enableSettings.indexOf("refresh_frequency") > -1) {
                if (_self.t_obj.table_info.refresh_time) {
                    _self.updateRefreshFreqPersonalize(_self.t_obj.table_info.refresh_time, false);
                }
            } else {
                jQ("ul#" + _self.tableId + "-refresh-frequency li input[name=Minutes]").on('click', function () { //NO I18N   
                    _self.updateRefreshFreqPersonalize(jQ(this).val());
                    jQ("#t_refresh_freq_" + _self.tableId + " .bs-noconflict").removeClass('open');
                });

                if (_self.t_obj.table_info.refresh_time) {
                    jQ('ul#' + _self.tableId + '-refresh-frequency li input[name=Minutes]').filter('[value=' + _self.t_obj.table_info.refresh_time + ']').prop('checked', true).trigger('click');
                }
            }
            jQ("#" + _self.tableId + "_refreshfreq").off('click.' + _self.tableId + '_refreshfreq').on('click.' + _self.tableId + '_refreshfreq', function () { //NO I18N
                _self.refreshTable("refresh"); //NO I18N
            });
        }
        if (this.t_obj.options.trashEnabled) {
            _self.constructRestoreButton();
            jQ("#" + _self.tableId + "_restore").on('click', function () {
                _self.restoreRecords();
            });
        }
    },
    trashEvents: function () {
        var _self = this;
        var nonTrashAction = jQ("[data-non-trash='" + _self.tableId + "']");
        hide(nonTrashAction);
        function hide(e) {
            e.each(function () { this.style.setProperty("display", "none", "important"); });
        }
    },
    bulkAssociationAlert:function(doAction,actionName){
        var _self = this;
        var stopAction = false;
        var skipAlert = false;
        var isSearchClose = ()=>!jQ('table#' + _self.tableId + ' .searchRow:first').is(':visible');
        skipAlert = actionName =='searchToggle' && isSearchClose(); //To skip alert for to search open case

        if(_self.t_obj.options.bulkAssociate && !skipAlert) {
            stopAction =_self.bulkAssociation.beforeClearActionAlert(doAction,actionName);
        }
        return stopAction;
    },
    tableEvents: function () {
        /*Binding events, after Table re-render every time*/
        var _self = this;
        var thead = jQ("table#" + _self.tableId + " thead"); // No I18N
        var eventName = '.table-component';
        thead.off(eventName);
        thead.on('change'+eventName,"#" + _self.tableId + "_head_chk", function () {
            _self.t_obj.options.isBulkSelectEnabled ?  _self.bulkSelect.selectAllRecords(this.checked, _self) : _self.selectAllCheckbox();
        });
        if (_self.t_obj.options.searchEnabled) {
            _self.constructSearchIcon();
            thead.on('keydown'+eventName, '.searchRow input', function (evt) { // No I18N
                var isEnter = evt.key == 'Enter';
                if(!isEnter){
                    return;
                }
                var input = this;
                var doAction =()=>_self.changeFilterString('Enter', jQ(input).attr('data-id'));
                var callSearch =()=> !_self.bulkAssociationAlert(doAction,'searchChange') && doAction();

                setTimeout(function(){callSearch();},1);
            });
            jQ("#" + _self.tableId + "_listSearch").off('click'+eventName).on('click'+eventName, function () {
                var doAction = ()=>_self.toggleSearchRow();
                !_self.bulkAssociationAlert(doAction,'searchToggle') && doAction();
            });
        }
        if (_self.t_obj.options.sortingEnabled) {
            thead.on('click'+eventName,"[data-sort='true']", function () {
                var column = this;
                var doAction = ()=>_self.sortColumn(jQ(column).attr('data-field'));
                !_self.bulkAssociationAlert(doAction,'sortColumn') && doAction();
            });
        }
        if (_self.t_obj.options.columnChooserEnabled) {
            _self.initResizeColumns(_self.tableId);
        }
        if (_self.t_obj.options.isBulkSelectEnabled) {
            _self.bulkSelect.initEvents();
        }
        //Initialize tooltip on actions bar
        initTooltip(".listcontrols");   // No I18N
    },
    afterBodyLoadedBind: function () {
        /*Binding events, after Table body data gets loaded every time*/
        var _self = this;
        var eventName = '.tbl-row-action_'+_self.tableId;

        setTimeout(function () {
            var eleHolder = (_self.t_obj.options.view == "kanban") ? (jQ('#' + _self.tableId + '_kanban_div').find(".tc-row>.row").length > 0 ? jQ('#' + _self.tableId + '_kanban_div').find(".tc-row>.row") : jQ('#' + _self.tableId + '_kanban_div')) : jQ('#' + _self.tableId + '_body >tr.tc-row td');
            var eventName = '.tbl-row-action_'+_self.tableId;
           
            //event assigned for empy row case parent element - Removed
            if(_self.t_obj.options.view == 'kanban'){
                jQ('#' + _self.tableId + '_kanban_div').off('click'+eventName);
            }

            eleHolder.off('click'+eventName); //No I18N
            eleHolder.on('click'+eventName, '.clickaction', function () { // No I18N
                var a_name = jQ(this).attr('data-action-name');
                var a_param = jQ(this).attr('data-action-param');
                if (typeof Ember !== "undefined") {
                    a_name = _self.context.actions[a_name] ? _self.context.actions[a_name] : _self.context.controller.actions[a_name];
                    _self.callbackEmberNonember(a_name, [a_param, this]); // No I18N
                } else {
                    if(a_name) {
                        _self.callbackEmberNonember(a_name, a_param); // No I18N
                    }
                }
            });
            if (typeof _self.t_obj.options.callbackAfterBodyRender == "function") {
                _self.callbackEmberNonember(_self.t_obj.options.callbackAfterBodyRender); // No I18N
            }

            //jQ('table tbody tr td div.d_w:truncated'); // No I18N
            if (_self.t_obj.options.inlineEditEnabled) {
                _self.bindInlineEditEvents();
            }
            eleHolder.off("click.table-delete-action").on("click.table-delete-action","[data-table-delete]", function () {
                var entity_id = jQ(this).attr("data-entityid");
                _self.deleteRecords(entity_id);
            });
            show_kanbandropdown();//kanban listview's dropdown options hide in last list
            handleResizeBtnVal(jQuery(".listcontrols")); // No I18N
        }, 0);
        if (_self.t_obj.options.view == "kanban") {
            initTooltip("#" + this.tableId + "_kanban_div");
        } else {
            initTooltip("#" + this.tableId + "_div");
        }

        if (jQ('#' + _self.tableId + "_head_chk").length > 0) {
            _self.bindChkboxEvent(); // Checkbox - onchange Event
        }

        if (_self.previewEnabled) {
            _self.previewer.init(_self, _self.t_obj.options.previewSettings);
        }

        //Handle bootstrap dropdown position
        var $tbody = jQ("#"+_self.tableId+"_div"); // No I18N
        if (_self.t_obj.options.staticHeader && $tbody.find('.bs-noconflict').length) {
            var tr_len = $tbody.find("tbody tr").length;  // No I18N
            var tr_height = $tbody.find("tbody tr").height(); // No I18N
            var drop_height = $tbody.find("tbody tr").find(".sdmenu-dd").height(); // No I18N
            var diff = tr_len - (Math.ceil(drop_height / tr_height) + 1);
            $tbody.find('.bs-noconflict').on('show.sdp.sdmenu', function () {
                if ($tbody.scrollTop() > 0 && (jQ(this).closest("tr").index() > diff)) {
                    jQ(this).find(".sdmenu-dd").css({ "top": "auto", "bottom": "100%" });   // No I18N
                }
            });
        }

        // Radio - onchange Event handling
            _self.bindRadioEvent();

        /**
        * SD-109158 Sticky checkbox column
        */
        if(_self.t_obj.options.staticHeader && _self.t_obj.options.staticCheckbox){
            var direction = sdp_user.DIRECTION === "RTL" ? "right" :"left";
            //table header
            jQ('#'+_self.tableId+'_head').find("tr").eq(0).addClass("pos-rel").end()
            .find('[data-id="'+_self.tableId+'_head_chk"]').css({"z-index":"2", [direction]: 0}).addClass('pos-sticky');
            _self.t_obj.options.searchEnabled && jQ('#'+_self.tableId+'_head .searchRow td').eq(0).css({[direction]: "0px","z-index": "1"}).addClass('pos-sticky');
            //table body
            jQ('#'+_self.tableId+'_body').find("tr").addClass("pos-rel").end()
            .find(".headercheckbox").css({"position": "sticky","z-index":"1", [direction]: 0}).addClass('pos-sticky');
        }

        if(jQ('#'+_self.tableId+'_div').find("[data-attach-component=true]").length != 0) {
            jQ('#'+_self.tableId+'_div').find("[data-attach-component=true]").each(function(ui, val){
                    var attachOptions = {
                    api: false,
                    upload_api: false,
                    upload: false,
                    enable_delete: false,
                    download: true,
                    title: false,
                    upload_limit: "1"
                };
                new attachPreview("#"+jQ(this).attr("id"), attachOptions);
            })
        }

    },
    constructHeaderInput: function () {
        var _self = this, retHeader = {}, available_minfo_fields = {},options =_self.t_obj.options;
        if (options.columnChooserEnabled || options.getmetaInfo || options.meta_data) {
            var header = _self.t_obj.meta_info, metaInfo = {}, udf_fields = {};
            if (options.getmetaInfo || options.meta_data) {
                 if (options.meta_data) {
                      // Check to pass metainfo directly fetch from API and passed to the listview option. To avoid multiple metainfo callbacks
                    if(options.meta_data.hasOwnProperty("fields") && options.meta_data.hasOwnProperty("entity")) {
                        metaInfo = options.meta_data.fields;
                        _self.metaInfo = jQuery.extend(true, {}, options.meta_data);
                    } else {
                        metaInfo = options.meta_data;
                        _self.metaInfo = jQuery.extend(true, {}, {
                            fields: metaInfo
                        });
                    }
                } else {
                    var dataVal = options.metaInfo_input && sdpAjaxInputData(options.metaInfo_input) || '';
                    var entity_name = options.metainfo_entity || options.entity_name;
                    if (options.static_meta) {
                        metaInfo = options.static_meta;
                    } else {
                        sdpAjax({
                            url: "/api/v3/" + entity_name + "/_metainfo", // No I18N
                            data: dataVal,
                            success: function (data) {
                                options.updateMetaInfo && (data.metainfo.fields = options.updateMetaInfo(data.metainfo.fields));
                                 metaInfo = data.metainfo.fields;
                                 _self.metaInfo = data.metainfo;
                            },
                            cache: false,
                            async: false
                        });
                    }
                }
                if (!jQ.isEmptyObject(metaInfo)) {
                    var discard_flds = _self.t_obj.options.discarded_fields;
                    var included_fields = _self.t_obj.options.included_fields;

                    var restrictedUdfFieldTypes = ['MultiSelect','CheckBox','Attachment','Html']; //Restricted fields in UDF 
                     
                    var fieldsToRemove = (field,header)=> {
                        var cbFieldRemove = _self.t_obj.options.fieldsToRemoveCallback;
                        var restrictedUDFFieldsRemove = (field.is_udf == true && restrictedUdfFieldTypes.includes(field.display_type));
                        var hiddenHeaderRemove = header &&  header.isHidden; // header hidden fields to remove
                        return hiddenHeaderRemove || restrictedUDFFieldsRemove || (cbFieldRemove && cbFieldRemove(field));
                    };
                    var overwriteProp = (fromObj,toObj)=>{ 
                        var overrideKey = (key,value)=> {
                            var assign = (value)=>( toObj[key] = (value != undefined) ? value : fromObj[key] );
                            (fromObj != toObj) ? (fromObj.hasOwnProperty(key) && (assign()) ) : assign(value);
                            return overrideKey;                            
                        }
                        return overrideKey;
                    };
                    
                    for (var key in metaInfo) {
                        var meta_fld = metaInfo[key];
                        if (key in header) {
                            if (fieldsToRemove(meta_fld,header[key])) {
                                delete header[key];
                                continue;
                            }
                            header[key]["is_inmeta"] = true;
                             copyHeaderPropToMeta = overwriteProp(header[key],meta_fld);
                             copyHeaderPropToMeta('type')('href');
                            jQ.extend(header[key], meta_fld);
                            available_minfo_fields[key] = meta_fld;
                        } else if (~key.indexOf('_fields') && meta_fld.type === "udf") {
                            var u_flds = Object.assign({},meta_fld.fields);
                            if (!jQ.isEmptyObject(u_flds)) {
                                for (var fld in u_flds) {
                                    /** Restricted fields in UDF  */
                                    u_flds[fld].is_udf = true;
                                    if ( !(fieldsToRemove(u_flds[fld])) )  {
                                        //no in fields to remove can add here
                                        let keyStr = key + "." + fld;
                                        u_flds[keyStr] = u_flds[fld];
                                        u_flds[keyStr]["isTitleEnabled"] = true;
                                    }
                                    delete u_flds[fld];
                                }
                                jQ.extend(udf_fields, u_flds);
                            }
                        } else {
                            /*
                                **You not giving any discarded fields specifically
                                **Then you can discard the fields , whichever doesn't having "display_name" in metainfo.
                                    options.discard_without_displayname = true;
                                **If you want to avoid any of fields (which doesn't have "display_name" in metainfo) to be getting discarded, then you can include the fields in 
                                    options.included_fields = ["field1", "field2"];
                            */
                            var included_fields = _self.t_obj.options.included_fields;
                            if (meta_fld.type !== "group" && _self.t_obj.options.discard_without_displayname && !meta_fld.display_name && (!included_fields || (included_fields && included_fields.indexOf(key) == -1))) {
                                if (!discard_flds || (discard_flds != undefined && discard_flds.indexOf(key) == -1)) {
                                    available_minfo_fields[key] = meta_fld;
                                }
                                continue;
                            }

                            if (meta_fld.type != "Association" && meta_fld.type !== "group" && (!included_fields || (included_fields && included_fields.indexOf(key) == -1))) {
                                var discard_flds = _self.t_obj.options.discarded_fields;
                                if (discard_flds != undefined) {
                                    if (discard_flds.indexOf(key) == -1) {
                                        header[key] = meta_fld;
                                        let addProp = overwriteProp(header[key],header[key]);
                                        addProp('is_inmeta',true)('isTitleEnabled',true);
                                    }
                                } else {
                                    header[key] = meta_fld;
                                    let addProp = overwriteProp(header[key],header[key]);
                                        addProp('is_inmeta',true)('isTitleEnabled',true);
                                }
                            }
                            /*To include all the fields(which has type as "group") to available metainfo*/
                            var g_fields = {};
                            if (meta_fld.type === "group") {
                                var g_flds = meta_fld.fields;
                                if (!jQ.isEmptyObject(g_flds)) {
                                    for (var fld in g_flds) {
                                        var keyStr = key + "." + fld;
                                        var meta_fld = g_flds[fld];
                                        if (keyStr in header) {
                                            if (fieldsToRemove(meta_fld,header[keyStr])) {
                                                delete header[keyStr];
                                                continue;
                                            }
                                            header[keyStr]["is_inmeta"] = true;
                                            if (header[keyStr].type) {
                                                meta_fld.type = header[keyStr].type;
                                            }
                                            jQ.extend(header[keyStr], meta_fld);
                                            //available_minfo_fields[keyStr] = meta_fld;
                                        }
                                        g_fields[keyStr] = meta_fld;
                                    }
                                    jQ.extend(available_minfo_fields, g_fields);
                                }
                            } else {
                                available_minfo_fields[key] = meta_fld;
                            }
                        }
                        var mandatory_fields = _self.t_obj.options.must_included_fields;
                        if (mandatory_fields) {
                            for (var i = 0; i < mandatory_fields.length; i++) {
                                available_minfo_fields[mandatory_fields[i]] = "";
                            }
                        }
                    }
                    jQ.extend(true, header, udf_fields);
                    if (_self.t_obj.options.additional_metainfo) {
                        header = jQ.extend(true, header, _self.t_obj.options.additional_metainfo);
                    }
                    jQ.extend(available_minfo_fields, udf_fields);
                    _self.t_obj.available_minfo_fields = available_minfo_fields;
                    _self.t_obj.meta_info = jQ.extend({}, header);
                }
            }
            if (_self.t_obj.options.additional_metainfo) {
                _self.t_obj.available_minfo_fields = jQ.extend(true, _self.t_obj.available_minfo_fields, _self.t_obj.options.additional_metainfo);
            }
            /*  If field is removed from Meta_info, we need to remove them from "list_info.fields_required" 
                _self.t_obj.options.row_inputdata.fields_required will be the "list_info.fields_required" for API call
            */
            var rowinputfields_req = _self.t_obj.options.row_inputdata ? _self.t_obj.options.row_inputdata.fields_required : null;
            if (rowinputfields_req) {
                var reqfldNewArray = [], mObjModified = Object.keys(_self.t_obj.meta_info);
                var fields_required = _self.t_obj.table_info.fields_required;
                for (var i = 0; i < rowinputfields_req.length; i++) {
                    var reqField = rowinputfields_req[i], reqFldTemp = reqField;
                    var checkboxInd = (reqField).indexOf("_head_chk");
                    if(checkboxInd == -1 || (checkboxInd != -1 && (_self.t_obj.meta_info[reqField] && _self.t_obj.meta_info[reqField]["default"] != true))){
                        var combine_settings = _self.t_obj.options.combined_settings;
                        if (combine_settings) {
                            reqField = reqField.replace(combine_settings.module + ".", "");
                        }
                        if (reqField.indexOf('_fields.') > -1 || (fields_required[reqField] && fields_required[reqField]["is_inmeta"] == true)) {
                            /* We are ignoring deleted fields from meta, which are already personlaized "fields_required"*/
                            if (mObjModified.indexOf(reqField) > -1) {
                                reqfldNewArray.push(reqFldTemp);
                            }
                        } else {

                            /*
                                Before personalization, if columns are available in meta_info, we will mark it as "is_inmeta=true"
                                Then only, after personalization we can identify the deleted fields from meta and remove it from "fields_required"
                            */
                            if (mObjModified.indexOf(reqField) > -1 && (fields_required[reqField] || fields_required[reqField] == "")) {
                                if (fields_required[reqField] == "") {
                                    fields_required[reqField] = { "is_inmeta": true };
                                } else {
                                    fields_required[reqField]["is_inmeta"] = true;
                                }
                                reqfldNewArray.push(reqFldTemp);
                            } else {
                                if (_self.t_obj.available_minfo_fields) {
                                    if (!jQuery.isEmptyObject(_self.t_obj.available_minfo_fields[reqField])) {
                                        reqfldNewArray.push(reqFldTemp);
                                    }
                                } else {//For Table, which doesn't have API meta_info
                                    //Checking the personalized field is existing in header input data(static meta_info) || Non personalized, supporting additonal fields
                                    if (header[reqFldTemp] || fields_required[reqField] == undefined) {
                                        reqfldNewArray.push(reqFldTemp);
                                    }
                                }
                            }
                        }
                    }
                }
                _self.t_obj.options.row_inputdata.fields_required = reqfldNewArray;
            }

            //If field is removed from Listview / Meta info, need to remove them from personalization ("column_order", "fields_required") fields, 
            var avaiCols = Object.keys(header).filter(function(cur){
               return cur.indexOf("_fields") == -1;
            }), colsOrder = _self.t_obj.table_info.column_order;
 
             /** 
              * SD-104929 
              * when no personalization or personalization unordered udf need to sorted in the columnchooser list.
              * so we sorting the udf fields order and merging with default one
              *
             */
             var udfFieldsOrder = {};
             jQuery.each(header, function(key, value){
                 if(key.indexOf("_fields") > -1){
                     udfFieldsOrder[key] = value.name || value.display_name;
                 }
             })
             if(Object.keys(udfFieldsOrder).length > 0){
                 udfFieldsOrder = Object.entries(udfFieldsOrder).sort(function(a, b){return a[1].localeCompare(b[1])}).map(function(a){return a[0]});
                 avaiCols = avaiCols.concat(udfFieldsOrder)
             }
            var dublicateHeader = jQuery.extend({}, header);
            if (colsOrder) {
                var defaultColOrderArray = [], colOrderNewArray = [], fields_req = _self.t_obj.table_info.fields_required;
                 /** removing the colum order which are not selected (field_required )when its came from personalization */
                 colsOrder = colsOrder.filter(function(el){
                    return fields_req[el] != undefined;
                })
                for (var i = 0; i < colsOrder.length; i++) {
                    /**
                        **If the field is not available in metainfo or checkbox column with "default=true" , then need to delete from fields_required object
                        **Otherwise API will be throwing as "Invalid Input".
                    **/
                    if(avaiCols.indexOf(colsOrder[i]) < 0 || ((colsOrder[i]).indexOf("_head_chk") != -1 && (_self.t_obj.meta_info[colsOrder[i]] && _self.t_obj.meta_info[colsOrder[i]]["default"] == true))){
                        delete fields_req[colsOrder[i]];
                    } else {
                        var h_obj = dublicateHeader[colsOrder[i]];
                        if(h_obj && h_obj["default"]){
                            //When we are changing default columns display position, it will re-arrange in column_order array even after personalization
                            var colPosition = h_obj.index || avaiCols.indexOf(colsOrder[i]);
                            defaultColOrderArray.splice(colPosition, 0, colsOrder[i]);
                        } else {
                            colOrderNewArray.push(colsOrder[i]);
                        }
                        delete dublicateHeader[colsOrder[i]];
                    }
                }
                /** SD-105703 removing duplication column present in personalization - migration case */
                var uniqColumn = colOrderNewArray.filter(function(item, index) {
                    if (colOrderNewArray.indexOf(item) == index){
                      return item;
                    }
                });

                colOrderNewArray = defaultColOrderArray.concat(uniqColumn);

                //When we are adding new columns in static metaObject, it will be appended with column_order object
                //SD-104929 sorting the udf column orders
               udfFieldsOrder = {};
                jQuery.each(dublicateHeader, function(key, value){
                   if(key.indexOf("_fields") > -1){
                       udfFieldsOrder[key] = value.name || value.display_name;
                   }
               })
               var dupHeaderSort = Object.keys(dublicateHeader).filter(function(cur){
                   return cur.indexOf("_fields") == -1;
               });
               if(Object.keys(udfFieldsOrder).length > 0){
                   udfFieldsOrder = Object.entries(udfFieldsOrder).sort(function(a, b){return a[1].localeCompare(b[1])}).map(function(a){return a[0]});
                   dupHeaderSort = dupHeaderSort.concat(udfFieldsOrder)
               }
               for(var k = 0; k < dupHeaderSort.length; k++ ){
                   if(dublicateHeader[dupHeaderSort[k]]["default"]){

                       var colPosition = avaiCols.indexOf(dupHeaderSort[k]);
                       colOrderNewArray.splice(colPosition, 0, dupHeaderSort[k]);
                    }else{
                       colOrderNewArray.push(dupHeaderSort[k]);
                   }
               }
                _self.t_obj.table_info.column_order = colOrderNewArray;
                _self.t_obj.table_info.fields_required = fields_req;
            } else {
                _self.t_obj.table_info.column_order = avaiCols;
            }

            var retObj = table_comp.constructTableHeader(_self.t_obj.table_info.column_order, _self.t_obj.table_info.fields_required || {}, header);
            retHeader = retObj.header_content;
            _self.t_obj.table_info.column_order = retObj.column_order;
        }
        else {
            /*
                If User given the static "meta_info" alone (without API metainfo), then control will be coming here
            */
            var hdObj = _self.t_obj.meta_info, hdArr = [];
            if (!jQ.isArray(hdObj)) {
                jQ.each(hdObj, function (a, b) {
                    b.id = a;
                    hdArr.push(b);
                });
                retHeader = hdArr;
            } else {
                retHeader = hdObj;
            }
        }
        //To remove the deleted field present in personalized "sort_field" || If it is combined view , sort_field might be present in current meta_info or Parent Component meta_info. So just ignore the deletion of sort_field
        if (_self.t_obj.table_info && _self.t_obj.table_info.list_info && _self.t_obj.table_info.list_info.sort_field && !jQ.isEmptyObject(_self.t_obj.meta_info) && !_self.t_obj.options.combined_settings) {
            var fldMetaObj = _self.t_obj.meta_info[_self.t_obj.table_info.list_info.sort_field] || _self.getValuePathField(_self.t_obj.meta_info,_self.t_obj.table_info.list_info.sort_field);
            if (!fldMetaObj) {
                delete _self.t_obj.table_info.list_info.sort_field;
                _self.t_obj.options.row_inputdata && _self.t_obj.options.row_inputdata.list_info && delete _self.t_obj.options.row_inputdata.list_info.sort_field;
            } else {
                if (fldMetaObj.value_path) {
                    _self.t_obj.table_info.list_info.sort_valuepath = fldMetaObj.value_path;
                    _self.t_obj.options.row_inputdata && _self.t_obj.options.row_inputdata.list_info && (_self.t_obj.options.row_inputdata.list_info.sort_valuepath = fldMetaObj.value_path);
                }
            }
        }
        return retHeader;
    },
    setupHeaderColumns: function () {
        /* constructing Header object */
        var _self = this;
        _self.column_count = 0;
        var opt = _self.t_obj.options, list_info = _self.t_obj.table_info.list_info, nodataColspan = 0;
        if (list_info !== undefined) {
            var search_fields = list_info.search_fields;
            var sorting_field = list_info.sort_field || (_self.t_obj.options.default_sort_field && _self.t_obj.options.default_sort_field.sort_field);
            var sorting_order = list_info.sort_order || (_self.t_obj.options.default_sort_field && _self.t_obj.options.default_sort_field.sort_order);
            var k_search_fields = [], k_sort_fields = [];

            _self.t_obj.header = _self.constructHeaderInput();
            var nColumns = (_self.t_obj.header).map(function (head_obj) {
                var c = head_obj;
                var col_type = c.type;
                //To set (enable/disable) sorting , searching and resizing for columns
                var isSearchdisabled = false, isSortdisabled = false, isResizable = true;
                if ((_self.t_obj.options.view == "kanban" && c.searchingEnabled != true) || (_self.t_obj.options.view !== "kanban" && (c.searchable == false || c.disableSearching || col_type === "checkbox" || col_type === "icon" || (col_type && ~col_type.indexOf("date")) || col_type === "boolean" || col_type === "delete" || col_type === "radio"))) {
                    isSearchdisabled = true;
                }
                if (c.sortable == false || c.disableSorting || col_type === "checkbox" || col_type === "icon" || col_type === "delete" || col_type === "radio") {
                    isSortdisabled = true;
                }
                if (opt.columnChooserEnabled === false || c.resizable === false || col_type === "checkbox" || col_type === "icon" || col_type === "delete" || col_type === "actions" || col_type === "radio") {
                    isResizable = false;
                }
                if (!c.isHidden) {
                    nodataColspan = nodataColspan + 1;
                }
                if(c.isTitleEnabled != false && !c.dataInlineCellTransformer && !c.dataCelltransformer && c.type != "link" && c.type !== "icon" && c.type !== "checkbox" && c.type !== "delete" && c.type !== "actions" && c.type !== "radio"){
                    c.isTitleEnabled = true;
                }
                // Setting search string for column
                if (opt.searchEnabled && !isSearchdisabled) {
                    c.searchEnabled = true;
                    var filterString = "";
                    if (!jQ.isEmptyObject(search_fields)) {
                        filterString = (c.type == "lookup" && search_fields[c.id + "." + c.lookup_field]) ? search_fields[c.id + "." + c.lookup_field] : (search_fields[c.id] ? search_fields[c.id] : "");
                    }
                    if (filterString & _self.t_obj.options.isODAPI) {
                        filterString = filterString.replace(/\\\\/g, '\\');// No I18N
                    }
                    c.filterString = filterString;
                    if (_self.t_obj.options.view == "kanban") {
                        k_search_fields.push(c.id);
                    }
                }
                /** Bulk associate disable the fields sortable */
                if(opt.bulkAssociate){
                    isSortdisabled =_self.bulkAssociation.checkDisableSortField(c);
                }
                // Setting sorting fields
                if (opt.sortingEnabled && !isSortdisabled) {
                    c.sortingEnabled = true;
                    let fieldId = _self.getValuePath(c.id,c);
                    
                    if (sorting_field !== undefined && (sorting_field === fieldId || (c.value_path ? sorting_field == c.value_path : false))) {

                        c.sort_field = sorting_field = fieldId; // adding udf sort field with lookup_field "udf_fields.udf_pick_301" to "udf_fields.udf_pick_301.name"
                        c.sort_order = sorting_order;
                        _self.t_obj.table_info.list_info.sort_field = sorting_field;
                        _self.t_obj.table_info.list_info.sort_order = sorting_order;
                    }
                    if (_self.t_obj.options.view == "kanban") {
                        k_sort_fields.push(c.id);
                    }
                }
                //Setting resizable for column
                if (opt.columnChooserEnabled) {
                    c.resizable = isResizable;
                }
                //Setting label for column
                if (c.text) {
                    c.text = _self.localTranslate(c.text);
                } else if (c.display_name) {
                    c.text = c.display_name;
                } else if (c.name) {
                    c.text = c.name;
                } else {
                    c.text = c.id;
                }

                if (c.display_type && c.display_type.toLowerCase() == "currency") {
                    c.text += " (" + sdp_app.CURRENCY_SYMBOL + ")";
                }
                //Setting width to column
                var stylewidth = "", stylewidthlabel = "";
                if (c.width) {
                    stylewidth = 'width:' + c.width; // No I18N
                } else {
                    if (col_type === "checkbox" || col_type === "icon" || col_type === "delete" || col_type === "actions" || col_type === "radio") { // No I18N
                        stylewidth = "width:31px"; // No I18N
                    } else if (opt.view_mode == "linear") {// No I18N
                        if (_self.t_obj.options.column_settings && _self.t_obj.options.column_settings.assign_content_width !== false) {
                            stylewidth = "width:200px"; // No I18N
                        }
                    } else {
                        /** default width applies when no personalization width for the fields */
                        stylewidth = c.default_width ? "width:"+ c.default_width : "width:150px"; // No I18N
                    }
                }
                if (_self.t_obj.options.view == "kanban" && (!_self.t_obj.options.column_settings || (_self.t_obj.options.column_settings && _self.t_obj.options.column_settings.assign_label_width !== false))) {
                    if (c.labelwidth) {
                        stylewidthlabel = 'width:' + c.labelwidth; // No I18N
                    } else {
                        stylewidthlabel = 'width:' + _self.t_obj.options.columnlabelWidth + "px;"; // No I18N
                    }
                }
                if (_self.t_obj.options.view == "kanban" && _self.t_obj.options.column_settings && _self.t_obj.options.column_settings.assign_content_width == false) {
                    stylewidth = "";
                }
                c.stylewidthlabel = stylewidthlabel;
                c.stylewidth = stylewidth;

                return c;
            });
            _self.t_obj.nodataColspan = nodataColspan;
            if(_self.t_obj.options.addEmptyHeaderCell){
                //add 1 to no data colspan for add Empty Header cell case
                _self.t_obj.nodataColspan += 1;
            }
            _self.t_obj.processedColumns = nColumns;
        } else {
            _self.t_obj.nodataColspan = _self.t_obj.meta_info.length;
            _self.t_obj.processedColumns = _self.t_obj.meta_info;
        }
        if (_self.t_obj.options.view == "kanban") { // No I18N
            _self.t_obj.searchable_fields = k_search_fields;
            _self.t_obj.sortable_fields = k_sort_fields;
        } else {
             var rows = _self.constructHeaderContent();
            stickyClass = _self.t_obj.options.staticHeader ? 'pos-sticky top0' : '';
            inlineCss =  _self.t_obj.options.staticHeader ? {zIndex:2} : {};
            //Appending Header row content
            jQ('#' + _self.tableId + '_head').empty().addClass(stickyClass).css(inlineCss).append(rows.headerRow,rows.searchRow);
            // support inline search for memory type field, units eg B,KB,MB,GB,TB,.. will be add
            _self.initMemoryUnitSelect2(jQ('#' + _self.tableId + '_head tr.searchRow'));
            if(!jQ(rows.searchRow).hasClass('hide')) {
                let isOpen = true;
                jQ(rows.searchRow).trigger('searchRowToggle',[isOpen,'fromInit']);
            }
        }
    },
    constructHeaderContent: function () {
        /*Constructing Header content using Header object created in setupHeaderColumns() method*/
        var _self = this;
        var processedColumns = _self.t_obj.processedColumns; //Array of Header objects
        var p_len = processedColumns.length, headrow_str = [], searchrow_str = [], h_index = 0,isdisplay;
         /**
             * If reorder option enabled will construct the reorder header cells 
             */

        for (var j = 0; j < p_len; j++) {
            var h_d = processedColumns[j]; // h_d -> single header object
            let fieldId = _self.getValuePath(h_d.id,h_d);
            if (!h_d.isHidden) {
                var inner_col_html = "", inner_search_html = "", th_class = "", stylewidth = h_d.stylewidth ? {'width':h_d.stylewidth.split(':')[1]} : (h_d.width ? {"width": h_d.width} : {});
                if (h_d.type == "checkbox") {
                    th_class = "tc"; // No I18N
                    inner_col_html = jQ('<input type="checkbox">');// No I18N
                    inner_col_html
                    .attr('id',_self.tableId+'_head_chk')
                    .attr('data-header-chekcbox',true)
                    .attr('aria-label',_self.localTranslate("common.selectall"));

                } else if (h_d.headCellTransformer) {
                    inner_col_html=SDPTemplate('<span>'+_self.callbackEmberNonember(h_d.headCellTransformer, h_d,i)+'</span>').get(); // fallback to handle text content
                    inner_col_html = inner_col_html.childNodes;
                } else if (h_d.type == "icon" || h_d.type == "delete" || h_d.type==="actions" || h_d.type==="radio") {
                    th_class = "tc"; // No I18N
                    inner_col_html = jQ('<span >&nbsp;</span>').addClass(h_d["class"]);   // No I18N
                } else if (h_d.text) {
                    let titleText = _self.localTranslate(h_d.text);

                    inner_col_html = jQ("<span></span>");
                    inner_col_html.addClass('mr5 text-overflow disp-ib').css('width','CALC(100% - 25px)')
                    .attr({'title':titleText,'mode_ellipsis':'true','rel':'uitip'}).text(titleText);
                }
                if (_self.t_obj.options.sortingEnabled && h_d.sortingEnabled) {
                    let s_Class1 = "",s_Class2 = "";

                    if (h_d.sort_field === fieldId) {
                        s_Class1 = (h_d.sort_order == _self.sort_asc) ? "cspr desc1 icon-sm" : ""; // No I18N
                        s_Class2 = (h_d.sort_order == _self.sort_desc) ? "cspr asc icon-sm" : ""; // No I18N
                    }
                    var sort_title1 = "", sort_title2 = "";
                    (h_d.sort_order == "asc") && (sort_title1 = translate("sdp.ascending.order"));
                    (h_d.sort_order == "desc") && (sort_title2 = translate("sdp.descending.order"));
                    

                    let getSortSpan = (id,title,className)=> {
                        var sortSpan = jQ(`<span role="img">
                                                    <span class="path1"></span>
                                                    <span class="path2"></span>
                                                </span>`);

                        sortSpan.attr({'title':title,'data-id':id})
                        .addClass('sortclass '+className);
                        return sortSpan;
                    }

                    let sortSpan = jQ('<span></span>');
                    let valuePath = h_d.value_path == undefined ? 'undefined' : h_d.value_path;
                    
                    sortSpan.addClass('cur-ptr')
                    .attr({'data-valuepath':valuePath,'data-field':fieldId,'data-sort':'true'});

                    var ascSpan = getSortSpan(fieldId+'_1',sort_title1,s_Class1);
                    var desSpan = getSortSpan(fieldId+'_2',sort_title2,s_Class2);
                    var sortWrapper = jQ('<span>',{
                        class:'mt2 p5 pos-abs right0 srot-wrapper'
                    }).append(ascSpan,desSpan);
                    sortSpan.append(inner_col_html,sortWrapper);

                    inner_col_html = sortSpan;         
                }
                var data_resize = "";
                (_self.t_obj.options.columnChooserEnabled) && (data_resize = h_d.resizable);
               
                var resize_div = "";
                if (_self.t_obj.options.columnChooserEnabled && h_d.resizable) {
                    let id = _self.getTableId('','_id'+j);
                    let resizeDiv = document.createElement('div');
                    resizeDiv.id = id;
                    resizeDiv.dataset.id = fieldId;
                    resizeDiv.dataset.index = h_index;
                    resizeDiv.dataset.columnId = h_d.id;
                    resize_div = jQ(resizeDiv).addClass('rc_d_h');
                }
                if (_self.t_obj.options.staticHeader || (h_d.type !== "icon" && h_d.type !== "checkbox" && h_d.type !== "delete" && h_d.type !== "radio")) {
                    let divWrapper = jQ('<div></div>');
                    divWrapper.css(stylewidth).addClass('d_w').append(inner_col_html);
                    inner_col_html = divWrapper;
                }
                //Adding sticky position for th tag to handle static header
                if(_self.t_obj.options.staticHeader) {
                    stylewidth = jQuery.extend({},stylewidth);
                    stylewidth.position = 'sticky';
                    stylewidth.top = '0';
                    stylewidth.zIndex = '1';
                }
                let rowTh = jQ(document.createElement('th'));
                rowTh.attr({'data-id':fieldId,'data-index':h_index,'data-col-resizable':data_resize})
                rowTh.addClass('tableHeader '+th_class);
                rowTh.css(stylewidth)
                rowTh.append(inner_col_html,resize_div);
                headrow_str.push(rowTh);
                h_index = h_index + 1;

                if (_self.t_obj.options.searchEnabled) {
                    if (h_d.searchEnabled) {
                        var searchfield = h_d.value_path ? h_d.value_path : h_d.id;
                        var td_dir = "";
                        
                        (h_d.display_dir) && (td_dir = h_d.display_dir);
                        var fieldValue = _self.search_ele_values && _self.search_ele_values[searchfield] ? _self.search_ele_values[searchfield] : h_d.filterString;
                        inner_search_html = jQ("<input type='text' autocomplete='off'></input>");
                        inner_search_html.val(fieldValue)
                        .attr({'data-id':searchfield,'data-field-type':h_d.type,'dir':td_dir})
                        .addClass('form-control default-inline-search');
                         inner_search_html.get(0).field=h_d; // add field data to search box

                        if(h_d.type == "long" || h_d.type == "int" || h_d.type == "double" || h_d.type == "memory") {
                            var min_val = {};
                            (h_d.hasOwnProperty('min')) && (min_val = {min:h_d.min} );
                        
                            let minAttr = h_d.id === "id" ? {min:'1'} : min_val;
                            inner_search_html.attr('type','number');    // No I18N
                            inner_search_html.attr(minAttr).val(h_d.filterString);
                        } else {
                            inner_search_html.wrap("<span class='inline-search-wrapper'></span>")
                        }
                    }
                    //SD-109261
                   stylewidth = jQuery.extend({},stylewidth);
                   stylewidth.position = (_self.t_obj.options.staticHeader ? "sticky": "");// No I18N
                   stylewidth.top = (_self.t_obj.options.staticHeader ? "34px": 0);// No I18N
                   stylewidth.zIndex = '1';// No I18N

                   let searchTd = jQ('<td class="tableHeader"></td>');
                   let div = jQ('<div></div>').addClass('d_w');
                       div.append(inner_search_html);
                        searchTd.append(div);
                        searchrow_str.push(searchTd.get(0));
                }
            }
        }
        if (_self.t_obj.options.searchEnabled) {
            let searchTd = jQ("<td class='hide'><input type='text'/></td>");
             searchrow_str.push(searchTd.get(0));

            var def_obj = _self.t_obj.table_info.default_searchfields;
            var search_obj = _self.t_obj.table_info.list_info.search_fields;

            if (jQ.isEmptyObject(search_obj) || (def_obj != null && (search_obj.length == def_obj.length))) {
                isdisplay = "none"; // No I18N
            }
        } else {
            isdisplay = "none"; // No I18N
        }

        var headRow =  jQ(document.createElement('tr'));
        headRow.append(...headrow_str);
        var searchRow = jQ(document.createElement('tr'));
        searchRow.addClass('searchRow');
        searchRow.append(...searchrow_str);

        isdisplay == 'none' ? searchRow.addClass('hide') : null; // add hide class search row
         _self.addEmptyHeaderCell(headRow,searchRow);

        return {
            headerRow:headRow.get(0),
            searchRow:searchRow.get(0)
        };
    },
    // support inline search for memory type field, its unts Eg B,KB,MB,GB,TB and PB addded
    initMemoryUnitSelect2:function($row) {
        //for memory field unit select2 added
        var memorySearchBoxes = jQ('input[data-field-type="memory"]',$row).get();

        if(memorySearchBoxes.length) {
            let defaultUnitValue = 'GB'; // default unit to be selected
            //memory units data list
            let memoryUnits = [
              { id: "B",  text: "B"  },
              { id: "KB", text: "KB" },
              { id: "MB", text: "MB" },
              { id: "GB", text: "GB" },
              { id: "TB", text: "TB" },
              { id: "PB", text: "PB" }
            ];

            //unit change set the data-unit-value to searchbox
            let changeUnit = function (){
                var searchBox = jQ(this).closest('span.input-group').find('input[type="number"]');
                searchBox.attr('data-unit-value',this.value).focus();
            };

             //create memory field structure and unit list select2
            let addUnitField = function (searchBox) {
                searchBox.dataset.unitValue = defaultUnitValue; // set default unit in searchbox
                searchBox.min = 0; // min start number
                var config = {
                    data: memoryUnits,
                    formatNoMatches: translate("sdp.search.notfound"),
                    minimumResultsForSearch: 1
                };
                var template = `<span class="input-group">
                                    <span class="input-group-addon p0">
                                        <input type="hidden" class="form-control memory-unit-field noborder"/>
                                    </span>
                                </span>`;

                var container = SDPTemplate(template).get();
                jQ(container).appendTo(searchBox.parentElement).find('span.input-group-addon').before(searchBox)
                .find('input[type="hidden"]').css('width','70').val(defaultUnitValue).select2(config)
                .end().find('div.memory-unit-field > a.select2-choice').addClass('pl5');
            }

            memorySearchBoxes.forEach(addUnitField); // add memory unit select2 options

            //add change event to unit select for add unit in searchbox attribute data-unit-value
            $row.off('change.memory-unit')
            .on('change.memory-unit','input.memory-unit-field',changeUnit);

        }
    },
    addEmptyHeaderCell: function (headRow,searchRow) {
        var _self = this;
        if (_self.t_obj.options.addEmptyHeaderCell) {
            let emptyTh = jQ('<th class="tableHeader"></th>');
            let emptyTd = jQ('<td class="tableHeader"></td>');
            headRow.append(emptyTh.get(0));
            searchRow.append(emptyTd.get(0));
        }
    },
    addEmptyRowCell: function (col_str) {
        var _self = this;
        if(_self.t_obj.options.addEmptyHeaderCell){
            col_str[col_str.length - 1] = col_str[col_str.length - 1].replace('<td ', '<td colspan="2" ');
        }
    },
    updateInputObject:function(inputObject,action) {
        /**
         * When support_search_criteria enable the search fields are converted into search_criteria before api calls
         * if search_criteria already available just pass as its. 
         */
        var _self = this;
        if(_self.t_obj.options.support_search_criteria && inputObject.list_info.search_fields){
            var search_criteria = _self.convertFieldsIntoCriteria(inputObject.list_info.search_fields,action);
            if (jQuery.isEmptyObject(search_criteria)) {
                if(jQuery.isEmptyObject(inputObject.list_info.search_criteria) || action == 'k_reset' ){
                    delete inputObject.list_info.search_criteria;
                }
                delete inputObject.list_info.search_fields;
            } else {
                delete inputObject.list_info.search_fields;
                inputObject.list_info.search_criteria = search_criteria;
            }
            if(typeof _self.t_obj.options.callbackInputSearchCriteria === "function"){
                inputObject = _self.t_obj.options.callbackInputSearchCriteria(inputObject, _self)
            }
        }
        return inputObject;
    },
    customViewInputUpdate:function(inputObject,action){
        var _self = this;
        function deleteProp(keyName,list_info){
            delete list_info[keyName];
        }

        /** When custom view enabled the fields required sort_order sort_fields never sends in API */
        if(_self.checkCustomViewEnabled() && action !== 'colchooser' && action !== 'sorting'){
            deleteProp('fields_required',inputObject.list_info);
            deleteProp('sort_order',inputObject.list_info);
            deleteProp('sort_field',inputObject.list_info);
        }
        //When sorting applies in custom view filter sort only sends in
        if(_self.checkCustomViewEnabled() && action === 'sorting'){
            deleteProp('fields_required',inputObject.list_info);
        }
        //When reset_column_width applies in custom view has_more_rows
        if(_self.checkCustomViewEnabled() && action === 'reset_column_width') {
            deleteProp('has_more_rows',inputObject.list_info);
            deleteProp('total_count',inputObject.list_info);
        }
    },
    constructRowContent: function (action) { // constructing Row Data object
        /*Constructing body content for Table Component*/
        var _self = this, opt = _self.t_obj.options;
        if (typeof opt.callbackDataGet == "function") {
            var data = _self.callbackEmberNonember(opt.callbackDataGet);
            if(opt.childView){
                let searchCriteria = _self.t_obj.table_info.list_info.search_fields || {};
                var searchFields = Object.keys(searchCriteria).map( function(key){
                    var data ={};
                    data[key] = searchCriteria[key];
                    return data;
                });
                var childViewData = jQ.extend(true,{},data);
                searchFields = searchFields.length ? searchFields : null;
                data = _self.extendChildViewdData(childViewData,searchFields);
            }
            _self.processingResponse(data,null,null,null,action);

        } else {
            jQ(_self.getTableId('#','_scrollbardiv')).scrollTop(0).hide();
            var tBodyDiv = jQ(_self.getTableId('#','_body'),_self.tblContainer);
            let loadingTemplate = _self.getLoadingTemplate();
            var loadingElement = table_comp.applyDataStyle(loadingTemplate);
            //To show loading icon in middle hieght of the table
            loadingElement.filter('.loading1').css('top', '50%'); // No I18N
            tBodyDiv.append(loadingElement);

            var inputObject = {};
            var tempInObject = opt.row_inputdata || {};
            inputObject = jQuery.extend({}, tempInObject);
            var sort_valuepath = inputObject && inputObject.list_info && inputObject.list_info.sort_valuepath, sort_field = "";
            
            //add default search criteria
            if(action == 'init' && _self.t_obj.default_search_criteria) {
                inputObject.list_info.search_criteria = _self.getDefaultSearchCriteria();
            }

            if (sort_valuepath) {
                sort_field = inputObject.list_info.sort_field;
                inputObject.list_info.sort_field = sort_valuepath;
                delete inputObject.list_info.sort_valuepath;
            }
            if (_self.t_obj.options.isFR_ListInfo_Support) {
                inputObject.list_info.fields_required = tempInObject.fields_required;
                delete inputObject.fields_required;
            } else {
                inputObject.fields_required = tempInObject.fields_required;
            }
            if (opt.globalSearchEnabled == true && _self.t_obj.options.callbackGlobalSearch) {
                inputObject.list_info.search_criteria = _self.callbackEmberNonember(_self.t_obj.options.callbackGlobalSearch, _self.t_obj.meta_info);
                action = "search"; // No I18N
            }

            if (opt.paginationEnabled && (inputObject.list_info.get_total_count != false && _self.t_obj.options.get_total_count != false)) {
                inputObject.list_info.get_total_count = true;
            }
            var doEscapeString = (action == "search" && _self.t_obj.options.isODAPI) ? true : false;
            var default_sort_field = _self.t_obj.options.default_sort_field;
            /** If the Group by options is enabled */
            if (_self.t_obj.options.groupBy && _self.t_obj.options.groupBy.field) {
                /** Create the sort_fields array with default user input */
                inputObject.list_info.sort_fields = [_self.t_obj.options.groupBy.field];
                if (inputObject.list_info.sort_field && inputObject.list_info.sort_order) {
                    /** Push the current sort field  */
                    inputObject.list_info.sort_fields.push({
                        field: inputObject.list_info.sort_field,
                        order: inputObject.list_info.sort_order
                    })
                    /** Remove the sort_field & sort_order from the list_info */
                    delete inputObject.list_info.sort_field;
                    delete inputObject.list_info.sort_order;
                } else {
                    if (default_sort_field) {
                        /** add the default sort field  */
                        inputObject.list_info.sort_fields.push({
                            field: default_sort_field.sort_field,
                            order: default_sort_field.sort_order
                        })
                    }
                }
            } else if (inputObject.list_info && !inputObject.list_info.sort_field && default_sort_field) {
                /** add the default sort field  */
                inputObject.list_info.sort_field = default_sort_field.sort_field;
                inputObject.list_info.sort_order = default_sort_field.sort_order;
            }
                var t_info = _self.t_obj.table_info;
            if (t_info && t_info.module) {
                inputObject.module = t_info.module;
            }

                if(t_info && t_info["for"]) {
                    inputObject["for"] = t_info["for"];
            }

            /** Include support */
            if(t_info.hasOwnProperty("include") && _self.t_obj.options.isAPI_include_support){
                inputObject.include = t_info.include;
            }

            if (_self.t_obj.options.print) {
                inputObject.list_info.row_count = 100;
            }
            if (_self.t_obj.options.callbackInputdata) {
                inputObject = _self.callbackEmberNonember(_self.t_obj.options.callbackInputdata, inputObject);
            }

            if (_self.t_obj.options.links_enabled) {
                inputObject.include = ["links"];
            }

            inputObject = _self.updateInputObject(inputObject,action);

            //Do custom view related list_info update
            _self.customViewInputUpdate(inputObject,action);

            //before inputObject event
            _self.triggerEvent('beforeInputObject',[inputObject]);

            inputObject = _self.updateInputObject(inputObject,action);

            //before inputObject event
            _self.TimeFilter && _self.TimeFilter.beforeApiCall(inputObject,action);

            var dataVal = window.sdpAjaxInputData(inputObject, doEscapeString);

            if (opt.globalSearchEnabled == true) { //To avoid global search on further search operation
                _self.t_obj.options.globalSearchEnabled = false;
                delete inputObject.list_info.search_criteria;
            }
     
            var ignorefailuremessage = typeof _self.t_obj.options.callbackOnAPIFailure == "function" ? true : false;
            sdpAjax({
                url: opt.defaultpath + opt.callbackURL,
                data: dataVal,
                success: function (obj) {
                    if (_self.t_obj.options.links_enabled && obj._links) {
                        var _links = {};
                        for (var i = 0; i < obj._links.length; i++) {
                            _links[obj._links[i].method + "_" + obj._links[i].name] = obj._links[i];
                        }
                        _self._links = _links;
                    }
                    _self.processingResponse(obj, sort_field, sort_valuepath,sort_valuepath,action);
                },
                async: false,
                ignorefailuremessage: ignorefailuremessage,
                error: function (xhr, statusText) {
                    if (typeof _self.t_obj.options.callbackOnAPIFailure == "function") {
                        _self.callbackEmberNonember(_self.t_obj.options.callbackOnAPIFailure, [_self, xhr, statusText]);
                    } else {
                        if (xhr.responseJSON && xhr.responseJSON.response_status && xhr.responseJSON.response_status.messages && xhr.responseJSON.response_status.messages[0].message) {
                            showalert('failure', e_html(xhr.responseJSON.response_status.messages[0].message), "isAutoHide=false"); // No I18N
                        }
                    }
                    _self.tblContainer.find('#' + _self.tableId + '_body').html("");
                },
                skipSUBREQUEST: opt.skipSUBREQUEST || false,
                acceptODCompatible: opt.acceptODCompatible,
                errMsgAutoHide: opt.errMsgAutoHide
            });
        }
    },
    storeRangeCriteria:function(obj,action) {
        //store the range Criteria data in instance
        var _self = this;
        var rangeCriteria =  obj.list_info && obj.list_info.range_criteria && jQuery.extend(true,[],obj.list_info.range_criteria) || null;
        _self.rangeCriteria = rangeCriteria;
        _self.TimeFilter && _self.TimeFilter.afterResponse(rangeCriteria,action,obj.list_info);
    },
    processingResponse: function (obj, sort_field, sort_valuepath, isAppend, action, callback) {
        var _self = this;
       	_self.storeRangeCriteria(obj,action);
        /**
         * Handling the custom view flag is enabled
         * when flag is true the list_info was served from the GET ALL API, 
         * So will process the column based on the info
         */
        if(_self.checkCustomViewEnabled()){
            if(typeof _self.t_obj.options.cbCustomViewRender === "function"){
                _self.t_obj.options.cbCustomViewRender(_self, obj);
            }else{
                if(_self.t_obj.options.isFR_ListInfo_Support){
                    _self.t_obj.options.row_inputdata = {fields_required: obj.list_info.fields_required}
                    _self.t_obj.options.row_inputdata.list_info = obj.list_info
                    _self.t_obj.table_info.fields_required = obj.list_info.fields_required.reduce((ac,a) => ({...ac,[a]:{}}),{});
                }else{
                    _self.t_obj.options.row_inputdata.list_info = obj.list_info;
                }
            }
            if(action != 'search') {
                _self.setupHeaderColumns();
            }
        }

        if (_self.t_obj.table_info.list_info) {
            if (_self.t_obj.options.paginationEnabled) {
                if (obj.list_info.row_count == 0 && _self.t_obj.table_info.list_info.start_index && _self.t_obj.table_info.list_info.start_index != 1) {
                    _self.t_obj.table_info.list_info.start_index = _self.t_obj.table_info.list_info.start_index - parseInt(_self.t_obj.table_info.list_info.row_count);
                    _self.refreshTable(action || 'refresh');
                    return false;
                }
            }
            var r_c = jQ("#pagination_comp_" + _self.tableId).find('.row_count_display').text() || jQ("#row_count_" + _self.tableId).val(); // No I18N; // No I18N
            var row_count = r_c ? r_c : _self.t_obj.table_info.list_info.row_count, l_i = obj.list_info || {};
            if (parseInt(l_i.start_index) > 0) {
                if (parseInt(l_i.row_count) == 0 || parseInt(l_i.start_index) > parseInt(l_i.total_count)) {
                    l_i.start_index = 0;
                }
            }
            var end_index = (parseInt(l_i.start_index) + parseInt(l_i.row_count) - 1);
            if (sort_field) {
                l_i.sort_field = sort_field;
            }
            if (sort_valuepath) {
                l_i.sort_valuepath = sort_valuepath;
            }
            _self.t_obj.table_info.list_info = l_i;
            _self.t_obj.table_info.list_info.end_index = end_index < 0 ? 0 : end_index;
            _self.t_obj.table_info.list_info.row_count = row_count;
        }
        if (_self.t_obj.options.links_enabled && obj._links) {
            var _links = {};
            for (var i = 0; i < obj._links.length; i++) {
                _links[obj._links[i].method + "_" + obj._links[i].name] = obj._links[i];
            }
            _self._links = _links;
        }
        if (_self.t_obj.options.view == "kanban") { // No I18N
            _self.constructKanbanData(obj[_self.t_obj.options.entity_name], isAppend, action, callback);
        }else if(_self.t_obj.options.view == "gallery"){
            _self.constructGalleryData(obj[_self.t_obj.options.entity_name], isAppend, action, callback);
        } else {
            _self.constructRowData(obj[_self.t_obj.options.entity_name],action);
        }
        /*
            No data banner changes
            nodatabanner_callback - Should provide this callback
                                    If return nodatabanner string from module, it will be displaying or will work as default behaviour
            [data-no-records-hide] - If you want to hide element/section when nodata scenario, have to provide 'data-no-records-hide' attribute
            [data-no-records-show] - If you want to show element/section when nodata scenario, have to provide 'data-no-records-show' attribute
        */
        if (_self.t_obj.options.nodatabanner_callback) {
            var norecordbanner = jQ("#" + _self.tableId + "_nodatabanner");
            var nodatabanner_str = "";
            if (obj[_self.t_obj.options.entity_name].length == 0 && _self.t_obj.options.nodatabanner_callback) {
                nodatabanner_str = _self.callbackEmberNonember(_self.t_obj.options.nodatabanner_callback, _self);
            }
            var parentDiv = _self.t_obj.options.view == "kanban" ? _self.tableId + "_kanban_div" : _self.tableId + "_div";
            if (nodatabanner_str) {
                if (typeof nodatabanner_str == "string") {
                    if (norecordbanner.length == 0) {
                        let noBannerDiv = "<div id='" + _self.tableId + "_nodatabanner'>" + nodatabanner_str + "</div>";
                        noBannerDiv = table_comp.applyDataStyle(noBannerDiv);
                        jQ("#" + _self.tableId + "_div").after(noBannerDiv);
                    } else {
                        nodatabanner_str = table_comp.applyDataStyle(nodatabanner_str);
                        jQ('#' + _self.tableId + '_nodatabanner').empty().append(nodatabanner_str);
                    }
                    table_comp.addSdEvents(jQ("#" + _self.tableId + "_nodatabanner"));
                }
                jQ("#" + parentDiv + ", [data-no-records-hide='" + _self.tableId + "']").hide();
                jQ("[data-no-records-show='" + _self.tableId + "']").show();
            } else {
                norecordbanner.remove();
                jQ("#" + parentDiv + " ,[data-no-records-hide='" + _self.tableId + "']").show();
                jQ("[data-no-records-show='" + _self.tableId + "']").hide();
            }
        }
        if (_self.t_obj.options.trashEnabled) {
            _self.trashEvents();
        }
    },
    scrollContainer:function($contaienr,isAppend) {
        //To scroll container to top or given position
        !isAppend && $contaienr.scrollTop(0);
    },
    //trigger table component custom events
    // @eventName - {string} - event name 
    // @data - {Array} - Array of data to pass for the event 
    triggerEvent:function(eventName,data) {
        jQuery(this).trigger(eventName,data);
    },
    //get value path id for entity fields
    getIdByValuePath:function(id,rowData){
        if(!id){
            const _self = this;
            let valuePath = _self.t_obj.meta_info.id && _self.t_obj.meta_info.id.value_path ? _self.t_obj.meta_info.id.value_path : null;
            return valuePath ? table_comp.getFieldsRequiredByString(rowData, valuePath) : null;
        } else {
            return id;
        }
    },
    //To add loaded records to the table component
    addLoadedRecords:function(rowData) {
        const _self = this;
        const id = _self.getIdByValuePath(rowData.id,rowData);
        if(id){
            _self.loadedRecords[id] = rowData;
            _self.loadedIDs.push(id);
        }
    },
    constructRowData: function (visibleContents,action) {
        var _self = this;
        _self.visibleContents = visibleContents;
        var opt = _self.t_obj.options;
        var row_str = "", v_len = _self.visibleContents.length, isBulkSelectEnabled = _self.t_obj.options.isBulkSelectEnabled, groupProcessedRow = {}, groupByField = "";
        _self.loadedRecords = {}, _self.loadedIDs = [];
        _self.tblContainer.get(0).loadedRecords = _self.loadedRecords;
        var processedColumns = _self.t_obj.processedColumns;
        for (var i = 0; i < v_len; i++) {
            var col_str = []; // No I18N;
            var rowData = _self.visibleContents[i], p_len = processedColumns.length, inlineEditEnabled = _self.t_obj.options.inlineEditEnabled;
            if (opt.process_rowdata) {
                rowData = _self.callbackEmberNonember(opt.process_rowdata, rowData);
                //If rowData is not present, that row will be ignored
                if(!rowData) {
                    continue;
                }
            }

            _self.addLoadedRecords(rowData); //To add loaded records to the table component
            /** Get the totalDisplayed columns for the groupBy ColSpan value */
            var totalColumn = 0;

            for (var j = 0; j < p_len; j++) {
                var h_d = processedColumns[j];
                if (!h_d.isHidden) {
                    totalColumn++;
                    var disp_str = "-", td_class = "", div_class = "", column_str = "", stylewidth = h_d.stylewidth ? h_d.stylewidth : (h_d.width ? "width:" + h_d.width : "");
                    if (h_d.td_class) {
                        td_class = h_d.td_class;
                    }
                    if (h_d.type == "checkbox") {
                        //tbl-bg-mode class for checkbox background
                        td_class += " headercheckbox tbl-bg-mode ";
                    }

                    /**
                     * Bulk Associate handling
                     */
                    if (opt.bulkAssociate) {
                        td_class = _self.bulkAssociation.addClassForCell(h_d,td_class);
                    }

                    if (inlineEditEnabled && h_d.inlineEdit === true) {
                        td_class += " pos-rel ";
                    }
                    if (h_d.div_class) {
                        div_class = h_d.div_class;
                    }
                    var retObj = _self.cellDataConstruction(h_d, rowData, j);
                    disp_str = retObj.disp_str;
                    var innerHtml = ""; // No I18N
                    if (opt.staticHeader || (h_d.type !== "icon" && h_d.type !== "checkbox" && h_d.type !== "delete" && h_d.type !== "radio")) {
                        var titleStr = retObj.titleStr || "";
                        opt.columnFullWidth && (div_class += " fw ");
                        var wrapCellClass = h_d.wrapped ? " wspace-normal-imp ": "";
                        /** In bulk association table cell width would be full width */
                        if(opt.bulkAssociate){
                            stylewidth = _self.bulkAssociation.checkToSkipWidth(h_d,stylewidth);
                        }
                        var dwClassName = 'd_w';
                        if(_self.t_obj.options.cellWrap){
                            // wspace-normal-imp - to show full content in cell
                            dwClassName+=' wspace-normal-imp';
                        }
                        var dwClass = retObj.dw_class_remove == true ? '' : dwClassName;
                        var allClass = (dwClass +' '+ div_class +' '+wrapCellClass).trim();
                        var styleAttr = 'data-style="'+stylewidth+'"';
                        if(h_d.id == "notification_status") {
                            //Task - 132923 - email icon count show support class added
                            allClass += " of-v";
                        }
                        innerHtml = '<div '+styleAttr+' class="'+allClass+'"  ' + titleStr + '>' + disp_str + '</div>';
                    } else {
                        td_class += "tc"; // No I18N
                        innerHtml = disp_str;
                    }
                    var td_attr = "";
                    if (h_d.display_dir) {
                        td_attr = " dir='" + h_d.display_dir + "' ";
                    }
                    var color = "";
                    var darkStyle = "";
                    if (_self.t_obj.options.color_settings && _self.t_obj.options.color_settings.is_enabled) {
                        var colorData = _self.rowColorStyling(h_d, rowData, j);
                        color = e_attr(colorData.color);
                        darkStyle = isDark() ? colorData.darkStyle+';':'';

                    }
                    var style = 'data-style="background-color:' + color + ';'+darkStyle + stylewidth + '"' ;
                    td_class = td_class.trim();
                    var classAttr = td_class.length ? 'class="'+td_class.trim()+'"': '';
                    column_str = !!color ? '<td data-bg="' + color + '" '+style+' ' + classAttr + '  ' + td_attr + '>' + innerHtml + '</td>' : '<td '+style+' '+classAttr+' ' +td_attr + '>' + innerHtml + '</td>'; //No I18N
                    col_str.push(column_str);
                }
            }

            _self.addEmptyRowCell(col_str);

            _self.column_count = totalColumn;
            /**
             * If group by object not empty and the current row's groupByField value is already processed or not
             */
            if (!jQ.isEmptyObject(opt.groupBy) && _self.checkGroupBy(groupProcessedRow, rowData, opt.groupBy.field.field)) {
                groupByField = opt.groupBy.field.field;
                var group_str = _self.addGroupBy(groupByField, groupProcessedRow, rowData, h_d);
                if (group_str){
                    row_str = row_str + "<tr class='tc-row visi-parent' role=\"group\" aria-id=\""+(rowData.id || "")+"\" ><td colspan=\""+totalColumn+"\" class=\"colHead whitebg brdtop0 brdleft0 brdright0\">" + group_str + "</td></tr>";    // No I18N
                }
            }
            var tr_class = "";
            if (opt.tr_class) {
                var cbData = { row_data: rowData };
                tr_class = opt.tr_class.indexOf("fx:") != -1 ? _self.callbackEmberNonember(opt.tr_class.split("fx:")[1], cbData) : opt.tr_class;
            }
            var childCls = "", parentAttr="";
            if(opt.childView) {
                var attrObj = _self.getChildViewParentAttr(rowData,action);
                childCls = attrObj.childCls;
                parentAttr = attrObj.parentAttr;
            }
            //  Add the processed row the extisting row
            col_str = col_str.join('');
            row_str = row_str + "<tr class='tc-row visi-parent "+tr_class+" "+childCls+"' "+parentAttr+" data-cs-field='row' data-entityid='"+(rowData.id || '')+"'>" + col_str + "</tr>";
        }

        // Enable / Disable the export button based on the available data
        opt.tableExport && _self.enableExportBtn(!!row_str);
        
        if (!row_str) {
            let divWidth = jQ("#" + _self.tableId + "_div").width() || false;
            divWidth = divWidth ? (divWidth - 10)+'px' : 'auto'; // if it has no width set it as auto
            
            let div_width = (opt.staticHeader) ? "width:"+divWidth : "";
            let nodatastring = _self.localTranslate("sdp.listview.nodataavailble"); // No I18N
            if (_self.t_obj.options.nodataString) {
                nodatastring = _self.t_obj.options.nodataString;
            } else if (_self.t_obj.options.nodatastring_callback) {
                nodatastring = _self.callbackEmberNonember(_self.t_obj.options.nodatastring_callback);
            }
            row_str = '<tr><td class="text-center" colspan="' + _self.t_obj.nodataColspan + '"><div><div id="'+_self.tableId + '_norecordsdiv" data-style="'+div_width+'">' + nodatastring + '</div></div></td></tr>';
        }
        if (isBulkSelectEnabled) {
            _self.bulkSelect.loadedRecords = _self.loadedRecords;
        }
        //Appending Body content
        setTimeout(function () {
            var tBody = _self.tblContainer.find('#' + _self.tableId + '_body');
            var rowsElem = table_comp.applyDataStyle(row_str);
            tBody.empty().append(rowsElem);
            table_comp.addSdEvents(tBody);
            _self.tblContainer.trigger('afterRowRender');
            _self.scrollContainer(_self.tblContainer);//SD-115758 -  scroll to top
            _self.afterBodyLoadedBind();
            if(opt.childView) {
                var isSearchClose = ()=>!jQ('table#' + _self.tableId + ' .searchRow:first').is(':visible');
                let ownAction = action=='search' && isSearchClose() ? 'searchClose' :action;
                _self.chidViewAfterRender(ownAction);
            }

            if (_self.t_obj.options.selectedId) {
                var modified_row = jQ('#' + _self.tableId + '_body',_self.tblContainer).find("input[type='checkbox'][data-table-checkbox][value='" + _self.t_obj.options.selectedId + "']").closest("tr.tc-row");
                if (modified_row.length > 0) {
                    var posTop = modified_row.offset().top - (_self.t_obj.options.isSubmodule ? jQ('#' + _self.tableId + '_body').offset().top : jQ('#' + _self.tableId + '_body').offset().top);
                    jQ('#' + _self.tableId + '_body').scrollTop(posTop);
                    modified_row.addClass("modify-row");
                    setTimeout(function () {
                        modified_row.removeClass("modify-row");
                    }, 3000);
                }
                _self.t_obj.options.selectedId = "";
            }

            //the setTimeout is used to prevent including the disabled checkbox that's being removed.
            isBulkSelectEnabled && setTimeout(()=>_self.bulkSelect.reSelectRecords(), 1);

        }, 1); //acting different thread for to show loading icon while page navigation
    },
    constructKanbanContent: function (isAppend, onInit, action, callback, moreoption) {
        /*Constructing body content for Kanban Component*/
        var _self = this, opt = _self.t_obj.options;
        if (typeof opt.callbackDataGet == "function") {
            var data = _self.callbackEmberNonember(opt.callbackDataGet, moreoption ? moreoption : {});
            _self.processingResponse(data, "", "", isAppend, action, callback);
        } else {
            /*Constructing body content for Kanban Component*/
            /*  Whenever scroll is reached bottom of the div, "constructKanbanContent" function will be gettting called and "isAppend" will be true
                "isAppend" will be used for Appending/Replacing the content
            */
            if (isAppend) {
                _self.t_obj.table_info.list_info.start_index = _self.t_obj.options.row_inputdata.list_info.start_index = parseInt(_self.t_obj.table_info.list_info.start_index) + parseInt(_self.t_obj.table_info.list_info.row_count);
            } 
            var inputObject = {};

            /*Unified view fields_required object construction to giving input API call - starts*/
            var combined_settings = _self.t_obj.options.combined_settings, asyncVal = false;
            if (combined_settings) {
                inputObject = jQuery.extend({}, opt.row_inputdata);
                var parentComponent = combined_settings.parentComponent ? table_comp.getFieldsRequiredByString(window, combined_settings.parentComponent) : _self;
                asyncVal = true;
                if (action == "colchooser") {
                    var retObj = parentComponent.t_obj.options.combined_settings.table_info;
                    inputObject.list_info = retObj.list_info;
                    if (_self.t_obj.options.lazyloadingEnabled) {
                        inputObject.list_info.start_index = 1;
                    }
                    if (_self.t_obj.options.isFR_ListInfo_Support) {
                        inputObject.list_info.fields_required = retObj.fields_required || retObj.list_info.fields_required;
                        delete inputObject.fields_required;
                    } else {
                        inputObject.fields_required = retObj.fields_required;
                    }
                } else {
                    if (onInit) {
                        _self.getCombinedAPIInputObject(onInit, inputObject);
                    }
                    var retObj = parentComponent.t_obj.options.combined_settings.table_info;
                    inputObject.list_info = _self.t_obj.table_info.list_info;
                    if (_self.t_obj.options.isFR_ListInfo_Support) {
                        inputObject.list_info.fields_required = retObj.fields_required || retObj.list_info.fields_required;
                        delete inputObject.fields_required;
                    } else {
                        inputObject.fields_required = retObj.fields_required;
                    }
                    /** Include support */
                    if(_self.t_obj.options.isAPI_include_support && retObj.hasOwnProperty("include")){
                        inputObject.include = retObj.include;
                    }
                }
            } else {
                var tempinputObject = jQuery.extend({}, opt.row_inputdata);
                if (_self.t_obj.options.isFR_ListInfo_Support) {
                    inputObject.list_info = tempinputObject.list_info;
                    if (tempinputObject.fields_required) {
                        inputObject.list_info.fields_required = tempinputObject.fields_required;
                    }
                    delete inputObject.fields_required;
                } else {
                    inputObject = tempinputObject;
                }
                /** Include support */
                if(_self.t_obj.options.isAPI_include_support && tempinputObject.hasOwnProperty("include")){
                    inputObject.include = tempinputObject.include;
                }
            }
            /*Unified view fields_required object construction to giving input API call - ends*/

            if (opt.paginationEnabled && (inputObject.list_info.get_total_count != false && _self.t_obj.options.get_total_count != false)) {
                inputObject.list_info.get_total_count = true;
            }
            var sort_valuepath = inputObject.list_info && inputObject.list_info.sort_valuepath, sort_field = "";
            if (sort_valuepath) {
                sort_field = inputObject.list_info.sort_field;
                inputObject.list_info.sort_field = sort_valuepath;
                delete inputObject.list_info.sort_valuepath;
            }
        var doEscapeString = (action == "search" && _self.t_obj.options.isODAPI) ? true : false;
        var default_sort_field = _self.t_obj.options.default_sort_field;
        if(_self.t_obj.options.groupBy && _self.t_obj.options.groupBy.field){
            /** Create the sort_fields array with default user input */
            inputObject.list_info.sort_fields = [_self.t_obj.options.groupBy.field];
            if(inputObject.list_info.sort_field && inputObject.list_info.sort_order){
                /** Push the current sort field  */
                inputObject.list_info.sort_fields.push({
                    field: inputObject.list_info.sort_field,
                    order: inputObject.list_info.sort_order
                })
                /** Remove the sort_field & sort_order from the list_info */
                delete inputObject.list_info.sort_field ;
                delete inputObject.list_info.sort_order;
            }else{
                if(default_sort_field){
                     /** add the default sort field  */
                    inputObject.list_info.sort_fields.push({
                        field: default_sort_field.sort_field,
                        order: default_sort_field.sort_order
                    })
                }
            }
        }else if(inputObject.list_info && !inputObject.list_info.sort_field && default_sort_field){
             /** add the default sort field  */
            inputObject.list_info.sort_field = default_sort_field.sort_field;
            inputObject.list_info.sort_order = default_sort_field.sort_order;
        }
        var t_info = _self.t_obj.table_info;
        if(t_info && t_info.module) {
            inputObject.module = t_info.module;
        }

        if(t_info && t_info["for"]) {
            inputObject["for"] = t_info["for"];
        }
        
        if(_self.t_obj.options.print){
            inputObject.list_info.row_count = 100;
        }
        if(_self.t_obj.options.callbackInputdata){
            inputObject= _self.callbackEmberNonember(_self.t_obj.options.callbackInputdata,inputObject);
        }

        if(_self.t_obj.options.links_enabled){
            inputObject.include = ["links"];
        }

            inputObject = _self.updateInputObject(inputObject,action);
            
        //before inputObject event
        _self.TimeFilter && _self.TimeFilter.beforeApiCall(inputObject);

         /** When custom view enabled the fields required sort_order sort_fields never sends in API */
            if(_self.checkCustomViewEnabled() && action !== 'colchooser' && action !== 'sorting'){
                delete inputObject.list_info.fields_required
                delete inputObject.list_info.sort_order
                delete inputObject.list_info.sort_field
            }
            if(_self.checkCustomViewEnabled() && action === 'sorting'){
                delete inputObject.list_info.fields_required
            }
            
            //before inputObject event

            var dataVal = window.sdpAjaxInputData(inputObject, doEscapeString);
            var visibleContents = {};
            var ignorefailuremessage = typeof _self.t_obj.options.callbackOnAPIFailure == "function" ? true : false;

            sdpAjax({
                url: opt.defaultpath + opt.callbackURL,
                data: dataVal,
                success: function (obj) {
                    _self.processingResponse(obj, sort_field, sort_valuepath, isAppend, action, callback);
                },
                ignorefailuremessage: ignorefailuremessage,
                error: function (xhr, statusText) {
                    if (typeof _self.t_obj.options.callbackOnAPIFailure == "function") {
                        _self.callbackEmberNonember(_self.t_obj.options.callbackOnAPIFailure, [_self, xhr, statusText]);
                    } else {
                        if (xhr.responseJSON && xhr.responseJSON.response_status && xhr.responseJSON.response_status.messages && xhr.responseJSON.response_status.messages[0].message) {
                            showalert('failure', e_html(xhr.responseJSON.response_status.messages[0].message), "isAutoHide=false"); // No I18N
                        }
                    }
                    jQ("#" + _self.tableId + "_kanban_div").html("");
                },
                acceptODCompatible: opt.acceptODCompatible,
                skipSUBREQUEST: opt.skipSUBREQUEST || false,
                errMsgAutoHide: opt.errMsgAutoHide
            });
        }
    },
    constructKanbanData: function (visibleContents, isAppend, action, callback) {
        var _self = this, opt = _self.t_obj.options;
        _self.visibleContents = visibleContents;
        //when lazyloading enabled, to hold the loaded data in the object for reference
        if(_self.t_obj.options.lazyloadingEnabled){
            _self.loadedData = [..._self.loadedData, ...visibleContents]
        }
        var v_len = _self.visibleContents.length, mainDivContent = ""; // No I18N
        var selectedId = _self.t_obj.options.selectedId ? parseInt(_self.t_obj.options.selectedId) : "", isSelectedAvailable = false;
        /*Constructing kanban items - starts*/
        /*  
            {
                "column_settings" : {"default_position" : 1, "columns" :[{"size" :2},{"size" :10,pipe_separation:true, width:"200px"}]}
            }
            "column_settings"  - will contains the settings that how the Kanban view should be
            "default_position" - when we are not mentioning the display position of the field, it will be the default poistion of the DOM element of the field
            "columns"          - will contains the Array of column properties.
                                 We are spliting as "12" column layout as to support sdpdesign class
                                 So User can split the columns with number of size
        */
        var column_settings = {}, autoResizeEnabled = jQ(window).width() > 1600 && _self.t_obj.options.view_mode !== "linear", isBulkSelectEnabled = _self.t_obj.options.isBulkSelectEnabled, groupProcessedRow = {};
        if (opt.column_settings) {
            column_settings = opt.column_settings;
            column_settings.default_position = column_settings.default_position || 1;
            column_settings.default_rowposition = column_settings.default_rowposition || 1;
            column_settings.row_count = column_settings.row_count || 1;
            column_settings.columns = column_settings.columns || [{ "size": 12, "pipe_separation": true, "row_count": 1 }];
        } else {
            column_settings = { default_rowposition: 1, "default_position": 1, "columns": [{ "size": 12, "pipe_separation": true, "row_count": 1 }] }; // No I18N
        }
        _self.loadedRecords = isAppend ? _self.loadedRecords:{}, _self.loadedIDs = [];
        _self.tblContainer.length && (_self.tblContainer.get(0).loadedRecords = _self.loadedRecords);
        for (var i = 0; i < v_len; i++) {
            var colStrObject = {};
            var rowStrObject = {};
            var rowData = _self.visibleContents[i], iconsString = "", aciveClass = ""; // No I18N
            var local_self = jQ.extend({}, _self), local_opt = jQ.extend({}, opt);
            var rowCustomClass = column_settings.row_custom_class || "";
            var cellCustomClass = column_settings.cell_custom_class || "";
            var labelCustomClass = column_settings.label_custom_class || "";
            if (local_opt.process_rowdata) {
                rowData = local_self.callbackEmberNonember(local_opt.process_rowdata, rowData);
            }

            _self.addLoadedRecords(rowData); //To add loaded records to the table component
            if (local_opt.combined_settings) {
                /*
                    For unified view, we need to change the Component object (in local scope) to render the different view
                */
                if (local_opt.changeComponentObject) {
                    local_self = local_self.changeComponentObject(rowData);
                    local_opt = local_self.t_obj.options;
                }
                /*
                    For unified view, we need to change the Column settings to render the respective view
                */
                if (local_opt.column_settings) {
                    column_settings = local_opt.column_settings;
                    column_settings.default_rowposition = column_settings.default_rowposition || 1;
                    column_settings.row_count = column_settings.row_count || 1;
                }
            }
            /*
                We are construcing and saving the Column-wise data as String in columnString_1, columnString_2 ... objects.
            */
            var no_of_columns = column_settings.columns.length;
            for (var k = 1; k <= no_of_columns; k++) {
                colStrObject["columnString_" + k] = {}; // No I18N
                colStrObject["columnString_hover_" + k] = ""; // No I18N
                colStrObject["columnString_ref_" + k] = {}; // No I18N

                rowStrObject = {};
                var column_row_count = column_settings.columns[k - 1].row_count || 1;
                for (var j = 1; j <= column_row_count; j++) {
                    //rowStrObject["rowString_"+j] = ""; // No I18N
                    colStrObject["columnString_" + k][j] = "";
                    colStrObject["columnString_ref_" + k][j] = {};
                }
            }
            colStrObject["columnString_hover_default"] = "";
            /*
                Setting the selected record as "Active" in Left Panel
            */
            if (selectedId != "" && (selectedId == rowData.id)) {
                aciveClass = "active"; // No I18N
                isSelectedAvailable = true;
                _self.selectedId = selectedId;
            }
            var ref_module = "", disabled_row = "";
            if (local_opt.combined_settings) {
                ref_module = 'data-module="' + local_opt.combined_settings.module + '"';
                if (isBulkSelectEnabled && _self.bulkSelect.selectedModule) {
                    disabled_row = _self.bulkSelect.selectedModule != local_opt.combined_settings.module ? " disable-row " : "";
                }
            }
            if (local_opt.combined_settings) {
                if (!_self.loadedRecords[rowData.id]) {
                    _self.loadedRecords[rowData.id] = {};
                }
                _self.loadedRecords[rowData.id][local_opt.combined_settings.module] = rowData;
            }
            else {
                _self.loadedRecords[rowData.id] = rowData;
            }
            var styleAttrs = "";
            if (local_opt.row_min_height) {
                styleAttrs = "min-height:" + local_opt.row_min_height + "px";
            }
            /**
             * If group by object not empty and the current row's groupByField value is already processed or not
             */
            if (!jQ.isEmptyObject(local_opt.groupBy) && _self.checkGroupBy(groupProcessedRow, rowData, local_opt.groupBy.field.field)) {
                groupByField = local_opt.groupBy.field.field;
                var group_str = _self.addGroupBy(groupByField, groupProcessedRow, rowData);
                if (group_str) {
                    mainDivContent += "<div class='m10'>" + group_str + "</div>";
                }
            }
            var rowDivClass = "row m0 p10 pt0 pb15"; //No I18N
            rowDivClass = _self.t_obj.options.view_mode == "full_kanban" ? "row m0 p10 pt0 pb5" : rowDivClass; //No I18N
            //Dark mode support for linear view
            var darkStyle = "";
            var colorData;
            if (isDark() && local_opt.color_settings && local_opt.color_settings.is_enabled) {
                colorData = _self.rowColorStyling({id:_self.tableId + "_head_chk"}, rowData);
                darkStyle = colorData.darkStyle;
            }
            mainDivContent += '<div data-style="' + styleAttrs + ';'+darkStyle+'" class="tc-row cv-task-item p0 visi-parent ' + rowCustomClass + " " + aciveClass + disabled_row + '" ' + ref_module + ' data-cs-field="kanban-card" data-entityid="' + (rowData.id || "") + '"><div class="' + rowDivClass + '">'; // No I18N
            var processedColumns = local_self.t_obj.processedColumns;
            var p_len = processedColumns.length, pipeColCount = 0;;
            for (var j = 0; j < p_len; j++) {
                var h_d = processedColumns[j];
                if (!h_d.isHidden) {
                    var disp_str = "-";
                    if (h_d.div_class) {
                        div_class = h_d.div_class;
                    }
                    var retObj = local_self.cellDataConstruction(h_d, rowData, i);
                    disp_str = retObj.disp_str;
                    var titleStr = retObj.titleStr || "", inlineEditIconStr = retObj.inlineEditIconStr || "";
                    /*Constructing all the icons at the BOTTOM*/
                    if (h_d.type == "icon" && local_opt.icon_settings && local_opt.icon_settings.show_icons_Bottom != false) { // No I18N
                        iconsString += disp_str;
                        continue;
                    }

                    var hd_colSetting = h_d.column_settings || {};
                    var colId = hd_colSetting.position || column_settings.default_position;
                    var colSetting = column_settings.columns[colId - 1];
                    var rowposition = hd_colSetting.rowposition || colSetting.default_rowposition || column_settings.default_rowposition;
                    var isRowType = (hd_colSetting.view_type == "row");
                    var isTwoColLayout = colSetting.auto_resize && autoResizeEnabled;
                    var col_str = "<div class='mt10'>", colCloseStr = "</div>"; // No I18N
                    if (_self.t_obj.options.view_mode == "linear") { // No I18N
                        var rightSpace = "";
                        if (colSetting.pipe_separation != true) {
                            rightSpace = "mright40";
                        }
                        let defaultClasses = 'disp-ib k_div mt5';
                        retObj.removeClass && (defaultClasses = retObj.removeClass(defaultClasses));
                        col_str = "<div class='"+defaultClasses+" " + cellCustomClass + " " + rightSpace + "'>"; // No I18N
                    }

                    if (_self.t_obj.options.view_mode !== "linear" || isRowType) {

                        var colSize = colSetting.size;
                        /*Padding left and right 20px and space between label and value is 10px. So totally needs to subtract 30px*/
                        var actColWidth = (_self.t_obj.options.columnWidth * colSize) - 30, fwClass = "";
                        if (isRowType) {
                            fwClass = "fw";
                            pipeColCount = 1;
                        } else {
                            /*For kanban view , single column/Double Column layout based on screen size. So here , we are setting the default width for columns based on that*/
                            if (isTwoColLayout) {
                                actColWidth = actColWidth / 2 - 20;
                            }
                        }
                        if (actColWidth < 31) {
                            actColWidth = 31;
                        }
                        if (_self.t_obj.options.column_settings && _self.t_obj.options.column_settings.assign_content_width !== false) {
                            if (actColWidth > _self.t_obj.options.columnlabelWidth) {
                                h_d.stylewidth = "width:" + Math.round(actColWidth - 10 - (hd_colSetting.view_type == "row" ? 0 : (h_d.labelwidth || _self.t_obj.options.columnlabelWidth))) + "px";
                            } else {
                                h_d.stylewidth = "width:" + Math.round(actColWidth) + "px";
                            }
                            fwClass += " text-nowrap ";
                        } else {
                            if (isRowType || h_d.id == "is_service_request") {   // No I18N
                                h_d.stylewidth = "max-width:98%;"; // No I18N
                            } else {
                                h_d.stylewidth = "max-width:50%;";  // No I18N
                            }
                        }
                        var mtop = _self.t_obj.options.view_mode == "linear" ? "mt15 mb2" : "mt5"; // No I18N
                        mtop = _self.t_obj.options.view_mode == "full_kanban" ? "mt2" : mtop;  // No I18N
                        col_str = "<div class='k_div " + mtop + " " + fwClass + " " + cellCustomClass + "'>";
                    } else {
                        if (colSetting.pipe_separation) {
                            colCloseStr = "<span class='table-pipeline opac3'>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span>" + colCloseStr;
                        }
                    }

                    /*To hide the label of the field*/
                    if (h_d.hide_label != true) {
                        let styleAttr = h_d.stylewidthlabel ? 'data-style="' + h_d.stylewidthlabel + '"' : '';
                         col_str += '<label class="text-muted m0 text-overflow disp-ib ' + labelCustomClass + '" ' + styleAttr + ' ><span rel="uitip" mode_ellipsis="true" title="'+e_attr(h_d.text)+'">'+e_html(h_d.text)+'</span> </label>&nbsp;<span class="vmiddle">:</span>&nbsp;'; // No I18N
                    }
                    if (hd_colSetting.view == "hover") {

                        /*Saving the Hover Fields String by column-wise*/
                        if (hd_colSetting.position) {
                            colStrObject["columnString_hover_" + colId] += disp_str;
                        } else {
                            colStrObject["columnString_hover_default"] += disp_str;
                        }
                    } else {
                        if (isTwoColLayout && colSetting.pipe_separation == true) {
                            if (pipeColCount % 2 == 0) {
                                colCloseStr = "<span class='table-pipeline opac3'>|</span>" + colCloseStr;
                            }
                            pipeColCount++;
                        }
                        var class_list = ['disp-ib','text-overflow'];
                        retObj.class && class_list.push(retObj.class);
                        var class_str = class_list.join(' ');
                        var styleAttribute = h_d.stylewidth ? 'data-style="' + h_d.stylewidth + '"' : ''; //it will remove empty data-style="" 
                        disp_str = '<span class="'+class_str+'" ' + styleAttribute + ' ' + titleStr + '>' + disp_str + '</span>';
                        /*Saving the Fields String by column-wise*/
                        if (!colStrObject["columnString_" + colId][rowposition] && hd_colSetting.view_type == "row") {
                            colStrObject["columnString_ref_" + colId][rowposition].view_type = "row";
                        }
                        colStrObject["columnString_" + colId][rowposition] += (col_str + disp_str + colCloseStr); // No I18N
                    }
                }
            }
            var iconStrPos = 1, iconStrRowPos = 1, isRowAppend = true;
            if (iconsString != "") {
                        iconsString = '<div class="' + (local_opt.icon_settings && local_opt.icon_settings["class"] || "") + '">' + iconsString + '</div>';
                local_opt.icon_settings.isPrepend ? iconsString = iconsString + '<div class="disp-ib pipe dark2 vmiddle mr10"></div>' : "";// No I18N
                if (local_opt.icon_settings) {
                    if (local_opt.icon_settings.position) {
                        iconStrPos = local_opt.icon_settings.position;
                    }
                    if (local_opt.icon_settings.rowPosition) {
                        iconStrRowPos = local_opt.icon_settings.rowPosition;
                    }
                    if (local_opt.icon_settings.isPrepend) {
                        isRowAppend = false;
                    }
                }
            }
            /*Constructing new tab link*/
            if(local_opt.newtab_settings && local_opt.newtab_settings.enabled){
                var linkVal = ""; // No I18N
                if(local_opt.newtab_settings.link_string){
                    linkVal = table_comp.getCompiledString(local_opt.newtab_settings.link_string,rowData);
                } else {
                    linkVal = local_opt.newtab_settings.link;
                }
                colStrObject["columnString_hover_"+(local_opt.newtab_settings.position || column_settings.default_position)] += '<span data-openwindow-href="'+linkVal+'" role="button"  class="cspr flat icon-sm newtab pr20 a-tag" title="'+translate("table.open.newtab")+'" rel="uitip" ></span>'; // No I18N
            }
            for (var l = 1; l <= no_of_columns; l++) {
                if (l == iconStrPos) {
                    if (isRowAppend) {
                        colStrObject["columnString_" + l][iconStrRowPos] += iconsString;
                    } else {
                        colStrObject["columnString_" + l][iconStrRowPos] = iconsString + colStrObject["columnString_" + l][iconStrRowPos];
                    }
                }
                var columnString = "";
                var colsetting = column_settings.columns[l - 1];
                var col_row_count = colsetting.row_count || column_settings.row_count;
                for (var m = 1; m <= col_row_count; m++) {
                    var colStringRef = colStrObject["columnString_ref_" + l][m];
                    columnString += colStrObject["columnString_" + l][m];
                    if (m != col_row_count && colStringRef.view_type != "row") {
                        columnString += "<br/>";
                    }
                }

                if (colStrObject["columnString_hover_" + l]) {
                    columnString += '<div class="pos-abs right0 top0 p10 pr15 visi-item whitebg">' + colStrObject["columnString_hover_" + l] + '</div>';
                }
                var colSize = colsetting.size;
                var widthStr = colsetting.width ? "width:" + colsetting.width + ";" : "";
                var maxwidthStr = colsetting.maxwidth ? "max-width:" + colsetting.maxwidth + ";" : "";
                var k_class = (_self.t_obj.options.view_mode !== "linear" && colsetting.auto_resize) ? "kan-lg-row-2" : "";
                var styleContent =  (widthStr + maxwidthStr).trim();
                var styleAttribute = styleContent ? 'data-style="'+styleContent+'"' :''; //it will remove empty data-style="" attribute
                mainDivContent += '<div class="' + k_class + ' col-xs-' + colSize + ' p0" '+ styleAttribute +'>' + columnString + '</div>';
            }
            if (colStrObject["columnString_hover_default"]) {
                mainDivContent += '<div class="pos-abs right0 top0 p10 pr15 visi-item whitebg">' + colStrObject["columnString_hover_default"] + '</div>';
            }
            mainDivContent += '</div></div>'; // No I18N
        }
        /*If no records available*/
				var nostrHgt = null, nostrMinHgt = null;//Empty string height/min-height set for business rules page
        if (!mainDivContent) {
            if (_self.t_obj.options.nodataString) {
                mainDivContent = _self.t_obj.options.nodataString;
            } else if (_self.t_obj.options.nodatastring_callback) {
                mainDivContent = _self.callbackEmberNonember(_self.t_obj.options.nodatastring_callback);
            } else {
                mainDivContent = '<div class="pos-rel tc p10" data-style="top:50%;transform:translateY(-50%);">' + _self.localTranslate("sdp.listview.nodataavailble") + '</div>' // No I18N
            }
            if (_self.t_obj.options.nodataStringhgt) {//Empty string height set 'nodataStringhgt'
                nostrHgt = _self.t_obj.options.nodataStringhgt
            }
					if(_self.t_obj.options.nodataStringminhgt){//Empty string min-height set 'nodataStringhgt'
						nostrMinHgt = _self.t_obj.options.nodataStringminhgt
					}
        }
        if (isBulkSelectEnabled) {
            _self.bulkSelect.loadedRecords = _self.loadedRecords;
        }
        /*Constructing kanban items - ends*/
        //Appending Body content
        // setTimeout(function () {
            var containerDiv = jQ("#" + _self.tableId + "_kanban_div"); // No I18N
            containerDiv.removeClass("active").find(".loading-more").remove();
            var mainDivContentElem = table_comp.applyDataStyle(mainDivContent);
                mainDivContentElem = table_comp.addSdEvents(mainDivContentElem);
                if (isAppend) {
                    containerDiv.append(mainDivContentElem);
                } else {
                    containerDiv.empty().append(mainDivContentElem);
                }
                table_comp.addSdEvents(containerDiv);

            _self.scrollContainer(containerDiv,isAppend);//SD-115758 -  scroll to top
            if (nostrHgt != null) {
                containerDiv.css('height', nostrHgt);
            }
					if(nostrMinHgt != null) {
						containerDiv.css('min-height',nostrMinHgt);
					}
            if (_self.t_obj.options.view == "kanban") {
                initTooltip("#" + _self.tableId + "_kanban_div");
            }
            _self.afterKanbanBodyLoadedBind(action);
            /*Setting the selected record as "Active", if available in LeftPanel*/
            if (isSelectedAvailable) {
                var selected_item = document.querySelector("#" + _self.tableId + "_kanban_div .tc-row[data-entityid='" + selectedId + "']"); // No I18N
                if(selected_item) {
                    containerDiv.scrollTop(selected_item.offsetTop - 30);
                    containerDiv.animate({
                        scrollTop: selected_item.offsetTop
                    });
                }
                if (_self.t_obj.options.view_mode == "linear") {
                    jQ(selected_item).addClass("modify-row");
                    setTimeout(function () {
                        jQ(selected_item).removeClass("modify-row");
                    }, 3000);
                }
                _self.t_obj.options.selectedId = "";
            }

            /** append loading animation */
            if (_self.t_obj.table_info.list_info.has_more_rows === true && _self.t_obj.options.lazyloadingEnabled) {
                var st_index = _self.t_obj.table_info.list_info.start_index;
                var row_count = parseInt(_self.t_obj.table_info.list_info.row_count);
                if (!_self.t_obj.options.maxgetcount || (_self.t_obj.options.maxgetcount && _self.t_obj.options.maxgetcount > (st_index + row_count - 1))) {
                    containerDiv.append("<div class='loading-more'></div>");    //No I18N
                    containerDiv.find(".loading-more").skLoader({   //No I18N
                        rows: 2,
                        header: true,
                        col: [4, 8],
                        cards: 1,
                        animation: false
                    });
                }
                /** when the lazy loading reaches maxgetcount, the message has to be shown saying only first n rows are displayed */
                if (_self.t_obj.options.maxgetcount && _self.t_obj.options.maxgetcount <= (st_index + row_count - 1)) {
                    // containerDiv.append("<div class='more-rows-message'>Only first " + _self.t_obj.options.maxgetcount + " results are displayed.</div>");
                }
            }

            //the setTimeout is used to prevent including the disabled checkbox that's being removed.
            // setTimeout(function () {
                _self.afterBodyLoadedBind();
                if (isBulkSelectEnabled) {
                    _self.bulkSelect.reSelectRecords();
                }
            // }, 250);
        // }, 100);
        if (typeof callback === "function") {
            callback();
        }
    },
    constructGalleryData : function(visibleContents, isAppend, action, callback){
         var _self = this, opt = _self.t_obj.options; 
            _self.visibleContents = visibleContents;
            _self.loadedIDs = [];

            if(opt.template){
                _self.loadedRecords = {};
                _self.tblContainer.get(0).loadedRecords = _self.loadedRecords;
                var v_len = _self.visibleContents.length, mainDivContent = ""; // No I18N
                for (var i = 0; i < v_len; i++) {
                    let folderPath = opt.template_folder;
                    _self.addLoadedRecords(visibleContents[i]); //To add loaded records to the table component
                    mainDivContent += renderhbs(null,opt.template, _self.visibleContents[i], false, folderPath,null,null,null,true); // No I18N
                }
                let galleryDiv = jQ(_self.getTableId("#","_gallery_div"));
                galleryDiv.empty().append(mainDivContent);
                table_comp.addSdEvents(galleryDiv);

                if (_self.t_obj.options.paginationEnabled && action !== "colchooser" && action !== "sorting") {
                    _self.updatePaginationDetails(action);
                }
            }
    },
    getCombinedAPIInputObject: function (onInit, inputObject) {
        var _self = this;
        var combined_settings = _self.t_obj.options.combined_settings;
        var childCompsFldsReq = [];
        var parentComponent = combined_settings.parentComponent ? table_comp.getFieldsRequiredByString(window, combined_settings.parentComponent) : null;
        var childComponents = jQuery.extend([], parentComponent ? parentComponent.t_obj.options.combined_settings.child_component : combined_settings.child_component);
        if (parentComponent) {
            childComponents.push(combined_settings.parentComponent);
        }
        var combined_modules_object = {};

        var currentmodule = combined_settings.module;
        for (var i = 0; i < childComponents.length; i++) {
            var childComp = childComponents[i];
            childComp = table_comp.getFieldsRequiredByString(window, childComp);
            var modulename = childComp.t_obj.options.combined_settings.module;
            var childFldsReq = childComp.t_obj.table_info.fields_required;
            var childColumnOrder = childComp.t_obj.table_info.column_order;
            if (onInit || currentmodule != modulename) {
                childCompsFldsReq = childCompsFldsReq.concat(childComp.t_obj.options.row_inputdata.fields_required);
                combined_modules_object[modulename] = {};
                combined_modules_object[modulename]["fields_required"] = childFldsReq;
                    combined_modules_object[modulename]["column_order"] = _self.getColumnOrder(childColumnOrder, childFldsReq);
            }
        }
        combined_modules_object[currentmodule] = {};
        combined_modules_object[currentmodule]["fields_required"] = _self.t_obj.table_info.fields_required;
            combined_modules_object[currentmodule]["column_order"] = _self.getColumnOrder(_self.t_obj.table_info.column_order,_self.t_obj.table_info.fields_required);

        inputObject.fields_required = (inputObject.fields_required).concat(childCompsFldsReq);
        if (parentComponent) {
            inputObject.list_info = parentComponent.t_obj.options.row_inputdata.list_info;
        } else {
            parentComponent = _self;
        }
        parentComponent.t_obj.options.combined_settings.table_info = inputObject;
        parentComponent.t_obj.options.combined_settings.combined_modules_object = combined_modules_object;
        //return inputObject;
    },
    /** Allow only selected fields in column order */
    getColumnOrder: function(column_order, fields_required){
        column_order = column_order = column_order ? column_order.filter(function(el){
            return fields_required.hasOwnProperty(el);
        }) : column_order;
        return column_order
    },
    /*Callback - After every time kanban render/re-render*/
    afterKanbanBodyLoadedBind: function (arg) {
        var _self = this;
        if (_self.t_obj.options.paginationEnabled && arg !== "colchooser" && arg !== "sorting") {
            _self.updatePaginationDetails();
        }

    },
    /*Callback - After first time kanban render*/
    afterInitialKanbanRender: function () {
         var _self = this,eventNameSpace='.kanbanscroll';
         var scrollType = 'onscrollend' in window ? 'scrollend' : 'scroll';
        /*If Lazyloading is enabled for Kanban view*/
        if (_self.t_obj.options.lazyloadingEnabled) {
            jQ('#' + _self.tableId + '_kanban_div')
             .off(eventNameSpace)
             .on(scrollType+eventNameSpace, function () { // No I18N
                var ele = this;
                if (_self.lazyscrollDebounce) {
                    clearTimeout(_self.lazyscrollDebounce);
                }
                _self.lazyscrollDebounce = setTimeout(function () {
                    var divHeight = Math.ceil(jQ(ele).scrollTop() + jQ(ele).innerHeight());
                    var scrollHeight = Math.ceil(jQ(ele)[0].scrollHeight);
                    //Getting API call, whenver scroll reaches the bottom of the div and "has_more_rows" is true
                    if (Math.abs(divHeight - scrollHeight) <= 1 && !_self.isRefresh) {
                        if (_self.t_obj.table_info.list_info.has_more_rows === true) {
                            var st_index = _self.t_obj.table_info.list_info.start_index;
                            var row_count = parseInt(_self.t_obj.table_info.list_info.row_count);
                            /*
                                ** Lazyloading will be trigger once scroll reaches bottom of the page
                                ** We are disabling the lazyloading, when get count reaches "maxgetcount" (If User given the "maxgetcount").
                            */
                            if (!_self.t_obj.options.maxgetcount || (_self.t_obj.options.maxgetcount && _self.t_obj.options.maxgetcount > (st_index + row_count - 1))) {
                                /** running the animation of the loader */
                                jQ(ele).find(".loading-more").length > 0 && (jQ(ele).find(".loading-more").skLoader("run"));
                                _self.t_obj.table_info.list_info = _self.listInfoConstructToAPI();
                                _self.constructKanbanContent(true, null, null, null, {"lazyloading":true});
                            }
                        }
                    } else {
                        _self.isRefresh = false;
                    }
                }, 300);
            });
        }
        if (typeof _self.t_obj.options.callbackAfterInitialRender == "function") {
            _self.callbackEmberNonember(_self.t_obj.options.callbackAfterInitialRender); // No I18N
        }
    },

    /*Callback - After first time gallery render*/
    afterInitialGalleryRender : function(){
        if(typeof _self.t_obj.options.callbackAfterInitialRender == "function"){
            _self.callbackEmberNonember(_self.t_obj.options.callbackAfterInitialRender); // No I18N
        }
    },
    //render memory field from rowData
    constructMemoryField:function(h_d,rowData) {
        var fieldId = h_d.id,fieldData = rowData[fieldId],text,displayString,key='display_text';
        if(fieldData && fieldData.display_value) {
            text = fieldData.display_value;
            displayString = '<span class="memory-field-display-value">'+ e_html(text)+'</span>';
        } else if(fieldData && fieldData.value && fieldData.unit) {
            text = fieldData.value+' '+fieldData.unit;
            displayString = '<span class="memory-field-unit">'+ e_html(text)+'</span>';
        }
        h_d.title_string = '${'+key+'}';
        rowData[key]=text;
        return displayString;
    },
    /*Cell construction*/
    cellDataConstruction: function (h_d, rowData, index) {
        var _self = this, disp_str = "-";
        var col_data = {}, retObj = {};
        retObj.disp_str = "";
        retObj.titleStr = "";
        retObj.inlineEditIconStr = "";
        if (typeof (h_d.value_path) !== "undefined" || typeof (h_d.id) !== "undefined") {
            if (h_d.value_path || ~(h_d.id).indexOf('.')) {
                var key = (h_d.value_path && h_d.type !== "select" && h_d.type !== "lookup") ? h_d.value_path : h_d.id;
                col_data = table_comp.getFieldsRequiredByString(rowData, key);
            } else {
                col_data = rowData[h_d.id];
            }
        }
        if (h_d.dataCelltransformer) {
            var arr_arg = {};
            arr_arg.head_data = h_d;
            arr_arg.row_data = rowData;
            if (_self.t_obj.options.links_enabled) {
                arr_arg._links = _self._links;
            }
            disp_str = _self.callbackEmberNonember(h_d.dataCelltransformer, arr_arg);
        } else if (h_d.dataCellHTML) {
            /*
                h_d.dataCellHTML (String)
                h_d.dataCellHTML = "Hello '${requester}' for signup";
                o/p -> Hello 'Shawn' for signup
            */
            disp_str = table_comp.getCompiledString(h_d.dataCellHTML, rowData);
        }
        /**Bulk association cell transfer method*/
        else if(_self.t_obj.options.bulkAssociate && _self.bulkAssociation.isFormFields(h_d)){
            disp_str = _self.bulkAssociation.checkCellTransformer(h_d,rowData,retObj);
        }
        else {
            if(h_d.type == 'memory') {
                //render memory field type data
                disp_str = _self.constructMemoryField(h_d,rowData);
            } else if (h_d.type === "checkbox") {
                disp_str = '<input type="checkbox" value=' + rowData.id + ' data-table-checkbox>';
            } else if (h_d.type === "delete") {
                disp_str = !rowData.prominent ? '<span data-entityid="' + rowData.id + '" class="btn btn-link btn-xs" title="' + translate("common.delete") + '" rel="uitip" data-table-delete><span aria-hidden="true" class="cspr trash icon-sm vmiddle"></span></span>' : "";
            }else if (h_d.type === "link") {
                var href = h_d.href_string ? table_comp.getCompiledString(h_d.href_string, rowData) : (rowData[h_d.id] && rowData[h_d.id].href) ? rowData[h_d.id].href : false;
                var target = h_d.target || "_blank";
                var title = (h_d.title_string ? table_comp.getCompiledString(h_d.title_string, rowData) : (col_data ? (col_data.name || col_data) : ""));
                var relAttr = "";
                var onClick = h_d.onClick ? h_d.onClick : "";
                var onClickParam = h_d.onClick ?`${index},${rowData.id}`: "";
                if (h_d.isDefaultTitle == true) {
                    relAttr = " data-default-tooltip='true' ";

                }
                let getTag = (type)=>{
                    var text = e_html(col_data ? (col_data.name || col_data) : "");
                    var tag = '<span rel="uitip" mode_ellipsis=true ' + relAttr + ' title="' + e_attr(title) + '">' + text + '</span>';
                    if(type == 'click'){
                        tag = '<span role="button" class="a-tag" ' + relAttr + ' data-onclick="' + onClick +'" data-onclick-param="'+onClickParam+'" class="text-link text-overflow disp-b fw" rel="uitip" mode_ellipsis=true title="' + e_attr(title) + '">' + text + '</span>';
                    } else if(type == 'href'){
                        tag = '<a href="' + href + '" target="' + target + '" ' + relAttr + ' class="text-link text-overflow disp-b fw" rel="uitip" mode_ellipsis=true title="' + e_attr(title) + '">' + text + '</a>';
                    }
                    return tag;
                }
               
                //handle actions separately
                var type = href && 'href' || onClick && 'click' || 'span-text';
                disp_str =  getTag(type);
            } else if (h_d.type == "date-time" || h_d.type == "date" || h_d.type == "datetime" || h_d.type == "timediff") {
                disp_str = col_data ? (typeof col_data != "object" ? col_data : col_data.display_value) : "-";
            } else if (h_d.type === "radio") {
                disp_str = '<input type="radio" value=' + rowData.id + ' name="'+_self.tableId+'_radio">';  //No I18N
            } else if(h_d.type === "color"){
                // check if the color data from udf is available or not
                var rw_data = h_d.id.indexOf('_fields.') >= -1 && table_comp.getFieldsRequiredByString(rowData,h_d.id);
                disp_str = "";
                if(rw_data){
					var l_w = (_self.t_obj.options.view == "kanban") ? "100px" : "100%";
                    disp_str = '<div data-style="background-color:' + e_attr(rw_data) + ';' +
                                    'height: 12px; width: '+l_w+';box-shadow: 2px 3px 6px -2px #777;">' +
                                '</div>';
                }
            }
            else {
                if (col_data != undefined) {
                    if (typeof col_data === 'object') {
                        const getDepartmentSiteView = ()=>{
                            if(h_d.id == 'department' && col_data.site) {
                                //For department and site associated field to view as "department name, site name"
                                return col_data.name +', '+ col_data.site.name;
                            }
                            return null;
                        }
                        //To support lookup field in metadata, or translated_name else default name
                        disp_str = getDepartmentSiteView() || col_data[h_d.lookup_field] || col_data.name;

                    } else if (col_data.constructor === Array) {
                        for (var i = 0; i < col_data.length; i++) {
                            if (typeof col_data[i] === 'object') {
                                disp_str += col_data[i].name + ", ";
                            } else {
                                disp_str += col_data[i] + ", ";
                            }
                        }
                        if (disp_str != "") {
                            disp_str = disp_str.substring(0, disp_str.length - 1);
                        }
                    } else {
                        disp_str = col_data;
                    }
                }
            }
            //check large content and to replace disp-ip to disp-b class
            var isLargeContent = (content)=>{
                isLarge = content.length >200;
                isLarge && (retObj.removeClass=(classes)=>classes.replace('disp-ib','disp-b'));
            }
            if(h_d.type !== "link" && h_d.type !== "checkbox" && h_d.type !== "delete" && h_d.type !== "actions" && h_d.type !== "radio" && h_d.type !== "color" && !h_d.dataCelltransformer){
                if (h_d.isTitleEnabled) {
                    var titleStr = h_d.title_string ? table_comp.getCompiledString(h_d.title_string, rowData) : "";
                    titleStr = (titleStr || disp_str || "");//NO I18N
                    var dataAttr = "", isMultiLine = false,isSingleLine=false;//NO I18N

                    dataAttr +=h_d.display_type ? ' data-field-display-type="'+h_d.display_type+'" ' : '';

                    if (h_d.type == "multi-line" || h_d.type == "Multi Line" || h_d.display_type == "multi-line" || h_d.display_type == "Multi Line") {//NO I18N
                        dataAttr += " data-multiline='true' ";//NO I18N
                        isMultiLine = h_d.isDefaultTitle = true;
                    }
                    if( h_d.display_type == 'Single Line'){
                        isSingleLine = true;
                    }
                    if (h_d.isDefaultTitle == true || h_d.isRTAText) {
                        dataAttr += " data-default-tooltip='true' ";
                    }
                    if (h_d.isRTAText) {
                        dataAttr += " mode_html=true ";
                    }
                    retObj.titleStr = dataAttr + ' rel="uitip" mode_ellipsis=true title="' + e_attr(titleStr) + '"';
                    if (h_d.isRTAText) {
                        var regexBrReplace = /<br\s*[\/]?>/gi;
                        disp_str = disp_str.replace(regexBrReplace, " ");
                        disp_str = trim(e_html(jQ("<a>").html(disp_str).text())) || "-";
                            //SD-107159 When empty string in html field we don't need tooltip and title 
                            if(disp_str === "-"){
                                retObj.titleStr = "";
                            }

                    } else if (isMultiLine) {
                        isLargeContent(disp_str); //check large content and to replace disp-ip to disp-b class
                        disp_str = jQ("<a>").text(disp_str).html();
                        retObj.class = 'maxw-85per';
                        disp_str = disp_str;
                    } else if(isSingleLine){
                        retObj.class = 'maxw-85per';
                        disp_str = e_html(disp_str);
                        isLargeContent(disp_str); //check large content and to replace disp-ip to disp-b class
                    }
                    //Boolean type value need to be in string Yes or NO
                    else if(h_d.type === "boolean"){
                        disp_str = (disp_str === true || disp_str === "true") ? _self.localTranslate("common.yes") : _self.localTranslate("common.no")
                    } else if(h_d.type == 'memory') {
                        //has html encoded content, so skip e_html
                        disp_str = disp_str;
                    } else {
                        disp_str = e_html(disp_str);
                    }
                } else {
                    disp_str = e_html(disp_str);
                }
            }
        }

        if (_self.t_obj.options.inlineEditEnabled && h_d.inlineEdit === true) {
            var inclass = "", select_inclass = "", select_margin = "";
            if (h_d.dataInlineCellTransformer != undefined) {
                var arr_arg = {};
                arr_arg.head_data = h_d;
                arr_arg.row_data = rowData;
                disp_str = _self.callbackEmberNonember(h_d.dataInlineCellTransformer, arr_arg);
            } else {
                if (h_d.type == "date-time" || h_d.type == "date" || h_d.type == "datetime") {
                    select_inclass = "date cspr icon-sm ml5 visi-item";
                } else if (typeof col_data === 'object' || h_d.type === "select" || h_d.type === "lookup") { // No I18N
                    select_inclass = "caret visi-item ml5"; // No I18N
                    select_margin = "mt10"; // No I18N
                    if (h_d.type != "lookup") {
                        h_d.type = "select";
                    }
                } else {
                    h_d.type = "text";
                    inclass = "calstm"; // No I18N
                }
                var inlineEditIconStr = select_inclass ? "<span class='" + select_inclass + "'></span>" : "";
                retObj.inlineEditIconStr = inlineEditIconStr;
                disp_str = "<div id='" + h_d.type + "_" + h_d.id + "_" + rowData.id + " ' " + retObj.titleStr + " data-rowid='" + e_attr(rowData.id) + "' data-field='" + e_attr(h_d.id) + "' data-type='" + e_attr(h_d.type) + "' class='text-overflow cur-ptr inline-disp vsub " + inclass + "'>" + disp_str + inlineEditIconStr + "</div><div class='inline-edit hide boxsetpanel " + select_margin + "'><div class='inline-edit-content fl'></div></div>";
            }
        }
        if (h_d.preview) {
            var org_str = disp_str;
            disp_str = '<div data-id="' + rowData.id + '" data-name="preview_' + _self.tableId + '_' + rowData.id + '" class="icon-sm mr10 cspr circle-arrow-down top0 preview_icon" title="' + translate('sdp.common.expand') + '" rel="uitip"></div>' + disp_str; // No I18N
            if (h_d.is_column_preview) {
                disp_str = '<div data-id="' + rowData.id + '" data-name="preview_' + _self.tableId + '_' + rowData.id + '" class="cur-ptr text-overflow"><span class="icon-sm mr10 cspr circle-arrow-down top0 preview_icon" title="' + translate('sdp.common.expand') + '" rel="uitip"></span>' + org_str + '</div>'; // No I18N
            }
        }
        if(_self.t_obj.options.childView && typeof rowData.indent == "number" && h_d.has_child) {
            disp_str = _self.constructChildViewCellData(rowData,disp_str);
        }
	// To add span wrapper for copy ticket
        if(_self.t_obj.options.enable_copy_ticket && h_d.id == 'id') {
            let dataPath = key ? key.replace('.id','') : '';
            var option = {
                module: _self.t_obj.options.entity_name,
                id: col_data,
                dataPath:dataPath,
                containerId:_self.tblContainerId,
                viewType:'table',
            }

            var replaceStr =  constructCopyTicketSpan(option);;
            disp_str = replaceStr;
        }
        retObj.disp_str = (disp_str) || "";
        return retObj;
    },
    sortColumn: function (id) {
        var _self = this;
        var tableHead = jQ("#" + _self.tableId + "_head");
        tableHead.children('tr:first').children().not('th[data-id="' + id + '"]').find('span.sortclass').attr('class', 'sortclass');
        var sort_order = "",
            ele1 = tableHead.find('[data-id="' + id + '_1"]'),
            ele2 = tableHead.find('[data-id="' + id + '_2"]');
        if (ele1.hasClass('cspr desc1 icon-sm')) {
            ele1.attr('class', 'sortclass');
            ele2.addClass('cspr asc icon-sm');
            ele2.attr('title', translate("sdp.descending.order"));
            sort_order = _self.sort_desc; // No I18N
        } else {
            ele2.attr('class', 'sortclass');
            ele1.addClass('cspr desc1 icon-sm');
            ele1.attr('title', translate("sdp.ascending.order"));
            sort_order = _self.sort_asc; // No I18N
        }
        if (sort_order != "") {
            _self.t_obj.table_info.list_info.sort_order = sort_order;
            var valuepath = tableHead.find('th[data-id="' + id + '"]').find('[data-field="' + id + '"]').attr('data-valuepath');
            _self.t_obj.table_info.list_info.sort_field = id;
            if (valuepath != "undefined") {
                _self.t_obj.table_info.list_info.sort_valuepath = valuepath;
            } else {
                delete _self.t_obj.table_info.list_info.sort_valuepath;
            }
        } else {
            delete _self.t_obj.table_info.list_info.sort_order;
            delete _self.t_obj.table_info.list_info.sort_field;
            delete _self.t_obj.table_info.list_info.sort_valuepath;
        }
        //updating sort_field in personalization
        // setTimeout(function () {
            _self.updateTableInfoPeronalization("sorting"); // No I18N
        // });
    },
    //To get field by value_path
    getValuePathField:function(meta_info,value_path) {
        var getField = (key)=>meta_info[key].value_path == value_path;
        var [key] = Object.keys(meta_info).filter(getField);
        return key && meta_info[key];
    },
    //To get value path by field
    getValuePath:function(fieldId,fieldObj) {
        var _self = this,sort_field;
        var opt = _self.t_obj.options;
        function getUDFValuePath() {
            //udf sort field transform from "udf_fields.udf_pick_301" to "udf_fields.udf_pick_301.name". name - refers to lookup_field
            return (opt.udfValuePath && fieldObj.is_udf == true && fieldObj.lookup_field && fieldId+'.'+fieldObj.lookup_field);
        }
        //Having value path  take it or is udfValuePath process it and give
        sort_field = fieldObj.value_path || getUDFValuePath() || fieldId;

        return sort_field;
    },
    constructSortableColumns: function () {
        var _self = this;
        var sortDiv = jQ("#t_sorticon_" + _self.tableId);
        if(!sortDiv.length){
            //skip if no container to render
            return;
        }
        var sortFieldsArray = _self.t_obj.sortable_fields || [];
        var sortBtnStr = "", display_sort_str = "",
            sort_field = _self.t_obj.table_info.list_info.sort_field,
            sort_order = _self.t_obj.table_info.list_info.sort_order || _self.sort_asc;
        var opt = _self.t_obj.options;
        var isLSSortEnabled = opt.listSettingEnabled && opt.listSettingOptions && opt.listSettingOptions.enableSettings && opt.listSettingOptions.enableSettings.indexOf("sorting") !== -1
        for (var i = 0; i < sortFieldsArray.length; i++) {
            var fieldId = sortFieldsArray[i];
            var fieldObj = _self.t_obj.meta_info[fieldId];
            var value_path = _self.getValuePath(fieldId,fieldObj);
            var fieldName = fieldObj.display_name;
            var sortFieldClass = "";

            if (sort_field && sort_field == fieldId || (value_path && value_path == sort_field)) {
                display_sort_str = fieldName;
                sortFieldClass = "active";
                if (value_path) { _self.t_obj.table_info.list_info.sort_valuepath = value_path };
            }
            var value_path_str = "";

            if (value_path) {
                value_path_str = ' data-valuepath="' + value_path + '"';
            }
            if (isLSSortEnabled) {
                sortBtnStr += '<option ' + (sortFieldClass ? "selected" : "") + ' value="' + e_attr(fieldId) + '" ' + value_path_str + '">' + e_html(fieldName) + '</option>'
            } else {
                sortBtnStr += '<li class="' + sortFieldClass + '"><span class="a-tag-sdmenu" data-value="' + e_attr(fieldId) + '" ' + value_path_str + '>' + e_html(fieldName) + '</span></li>';
            }
        }
        var sort_title;
        if (!display_sort_str) {
            display_sort_str = _self.localTranslate("common.sortby");
            sort_title = _self.localTranslate("common.sortby"); // No I18N
        } else {
            display_sort_str = e_html(display_sort_str);
            sort_title = _self.localTranslate("common.sortby") + " : " + display_sort_str; // No I18N
        }

        var sortTitleKey = "common.sortasc";
        if (sort_order == "asc") {
            sortTitleKey = "common.sortdesc";
        }
        var opt = _self.t_obj.options;
        var max_width = opt.sort_max_width ? opt.sort_max_width : "200px";  // No I18N
        if (isLSSortEnabled) {
            sortBtnStr = '<select id="' + _self.tableId + '_sortfield" class="w-80per" data-style="max-width:' + max_width + '">' + sortBtnStr + '</select>';
        } else {
            sortBtnStr = '<div class="btn-group bs-noconflict"  data-style="display: none;" id="' + _self.tableId + '_sortfield"><button type="button" class="btn btn-default btn-sm sdmenu-toggle pt1" rel="uitip" title="' + sort_title + '" data-switch="sdmenu"><span class="sorttext disp-ib text-overflow vmiddle" data-style="max-width:' + max_width + '">' + display_sort_str + '</span><span class="ml5 caret ml0"></span></button><ul class="sdmenu-dd sort-list maxh-300px of-a" >' + sortBtnStr + '</ul></div>';
        }
        var s_Class1 = (sort_order == _self.sort_desc) ? "asc" : ""; // No I18N
        var s_Class2 = (sort_order == _self.sort_asc) ? "desc1" : ""; // No I18N
        var sortOrderStr = isLSSortEnabled ? '<div class="disp-ib p5 cur-ptr pl10" id="' + _self.tableId + '_sortorder" rel="uitip" title="' + _self.localTranslate(sortTitleKey) + '"><span class="cspr ' + s_Class1 + s_Class2 + ' icon-sm"></span></div>' : '<button type="button" class="btn btn-default btn-sm task-sort-by btn-rad-rgt"  id="' + _self.tableId + '_sortorder" rel="uitip" aria-label="' + _self.localTranslate(sortTitleKey) + '" title="' + _self.localTranslate(sortTitleKey) + '"><span class="cspr ' + s_Class1 + s_Class2 + ' icon-sm"></span></button>';
        
        var sortContentElem =  table_comp.applyDataStyle(sortBtnStr + sortOrderStr);
        sortDiv.empty().append(sortContentElem); // No I18N

        if (isLSSortEnabled) {
            jQ("#" + _self.tableId + "_sortfield").select2({
                formatNoMatches: translate("ae.common.select2nomatchesfound")
            }).on("change", function () {
                var sort_field = this.value;
                var value_path = this[this.selectedIndex].dataset && this[this.selectedIndex].dataset.valuepath ? this[this.selectedIndex].dataset.valuepath : false;
                _self.t_obj.table_info.list_info.sort_field = sort_field;
                if (value_path) {
                    _self.t_obj.table_info.list_info.sort_valuepath = value_path;
                } else {
                    delete _self.t_obj.table_info.list_info.sort_valuepath;
                }
                //updating sort_field in personalization
                // setTimeout(function () {
                    _self.updateTableInfoPeronalization("sorting"); // No I18N
                    jQ(".listview-settings").hide();
                //});
            });
        }
    },
    constructSearchPopup: function (button) {
        var _self = this;
        var dialog,searchElem;
        var searchId = _self.tableId+'_searchForm';
        var formString  = '<div class="form-wrapper maxh-490px of-a" id="'+searchId+'"></div><div class="form-footer"><button class="btn btn-primary k_searchBtn mr10" type="button">'+translate("common.search.title")+'</button><button class="btn btn-default mr10" id="k_searchBtn_reset" type="button">' + translate("sdp.common.reset") + '</button><button class="btn btn-default" id="k_searchBtn_cancel" type="button">' + translate("common.cancel") + '</button></div>';
        function search(e) {
            if((e.type == 'keydown' && e.key == 'Enter') || e.type == 'click') {
                if(e.type == 'click') {
                    //focus to first input on click buttons search and reset
                    searchElem.focus();
                }
                _self.gokanbanSearch('k_search');
            }
        }
        function resetSearch() {
            // Reset search popup when it gets closed
            //reset, cancel and close popup handled
            searchElem.focus();
            _self.resetKanbanSearch('k_reset');
            var id = this.id;
            if(id == 'dialog_closeButton' || id == 'k_searchBtn_cancel') {
                //close dialog when click close icon
                closeDialog();
                // after close,focus to search icon to continue keyboard action(eg space to open search)
                button.focus();
                if(dialog) {
                    //clear searchform data after popup close
                    // remove dialog container from dom
                    dialog.remove();
                    dialog = searchElem = undefined;
                    delete _self.searchform;
                    window.closeCallBack = undefined;
                    window.oDialog = undefined;
                    delete window.beforeClose;
                }
            }
        }

        function bindEvents(dialogElem,off) {
            var $kanbanDialog = jQ(dialogElem); //NO I18N
            var eventNameSpace = '.kanban-search-popup'; //NO I18N
            
            $kanbanDialog.off(eventNameSpace);
            if(off == true) {
                //kill the event
                return;
            }
            $kanbanDialog.on("click"+eventNameSpace,".k_searchBtn",search)
            .on("keydown"+eventNameSpace,"#"+_self.tableId+"_searchForm input",search)
            .on("click"+eventNameSpace,"#k_searchBtn_reset,#k_searchBtn_cancel,#dialog_closeButton",resetSearch);
        }

        function renderForm() {  
            var searchFieldsArray = _self.t_obj.searchable_fields || [];
            var search_form_fields = [];
            for (var i = 0; i < searchFieldsArray.length; i++) {
                var fieldMeta = jQ.extend({}, _self.t_obj.meta_info[searchFieldsArray[i]]);
                fieldMeta.name = searchFieldsArray[i];
                search_form_fields.push(fieldMeta);
            }
            var form_data = {}, options = {}, formObject = [{ "sections": { "header": "", "fields": [{ "fields": search_form_fields }] } }];
            options.holderele = jQ("#_DIALOG_LAYER").find("#" + _self.tableId + "_searchForm");
            options.layoutObj = formObject;
            options.metainfo = _self.t_obj.meta_info;
            options.skipInvalidValue = true;
            options.searchForm = true;
                    options.disableAutoComplete = true;
            _self.searchform = new FormComponent(options, form_data);
            dialog = jQ("#_DIALOG_LAYER");

            searchElem = jQ(dialog).find('input:first');//NO I18N
            searchElem.focus();  

            bindEvents(dialog.get(0));
            dialog=null;
        }
        window.closeCallBack = 'beforeClose';
        window.beforeClose = beforeClose;
        function beforeClose() {
            //escape close popup
            resetSearch.call({id:'dialog_closeButton'});
        }
        showDialog(formString, "width=400, title=" + translate('common.search.list') + ",position=absmiddle", renderForm); //NO I18N
        var container = jQ('#'+searchId);
        table_comp.applyDataStyle(container);
    },
    gokanbanSearch : function(action){
        var _self = this;
        var searchObj = _self.searchform.getInputObject();
        var def_searchField = _self.t_obj.table_info.default_searchfields || {};
            if (jQ.isEmptyObject(def_searchField)) {
                _self.t_obj.k_search_fields = searchObj;
            }else{
                _self.t_obj.k_search_fields = jQ.extend(true, searchObj, def_searchField);
            }
            _self.t_obj.table_info.list_info.start_index = 1;
            if(!jQ.isEmptyObject(searchObj)){
                jQ.each(searchObj, function(field, valueObj){
                    if(typeof valueObj == "object"){
                        var fldKey = Object.keys(valueObj);
                        searchObj[field+"."+fldKey] = valueObj[fldKey];
                        delete searchObj[field];
                    }
                });
            }
            _self.t_obj.table_info.list_info.search_fields = searchObj;
            _self.refreshTable(action || "search");
    },
    resetKanbanSearch: function(action){
        var _self = this;
        jQ(':input', '#'+ _self.tableId +'_searchForm').not(':button').val(''); // No I18N
        jQuery.each(_self.searchform.select2Objects, function (fields, Obj) {
            jQ("#" + Obj.select2Id).select2("val", ""); // No I18N
        });
        _self.t_obj.table_info.list_info.search_fields = _self.t_obj.table_info.default_searchfields;
        _self.refreshTable(action || "search");

    },
    constructColumnChooser: function (ignoreEvents,columnChooserContainer) { //Constructing column chooser div
        var _self = this, processedColumns = _self.t_obj.processedColumns, combine_settings = _self.t_obj.options.combined_settings;

        var li_elements = "", checked_elements = "", unchecked_elements = "", defaultColCount = 0;
        for (var i = 0; i < processedColumns.length; i++) {
            if (!processedColumns[i]["default"]) {
                var li = '<li><label class="disp-b fw"><span class="ctl"><i><b></b></i>';
                var checkedstr = "",disableCheckbox='';
                if (!processedColumns[i].isHidden) {
                    checkedstr = "checked=true"; // No I18N
                }
                if (processedColumns[i].checkbox_disable == true && !processedColumns[i].isHidden) {
                    //only reorder allow, should not uncheck it
                    disableCheckbox = "disabled=true"; // No I18N
                }
                var chk_ele = '<input type="checkbox" value="' + processedColumns[i].id + '" class="colcheckbox" id="chooser_' + processedColumns[i].id + '" ' + checkedstr + ' ' + disableCheckbox + '>';
                li = li + chk_ele;
                li = li + '</span><span class="item ml10">' + e_html(processedColumns[i].text) + '</span></label></li>';
                if (processedColumns[i].isHidden) {
                    unchecked_elements += li;
                } else {
                    checked_elements += li;
                }
            } else {
                defaultColCount++;
            }
        }
        li_elements = checked_elements + unchecked_elements;
        li_elements += '<li class="noitem tc text-color3 p10 noborder whitebg hidden" >' + translate('admin.search.notfound') + '</li>';
        _self.t_obj.defaultColCount = defaultColCount;

        var sortableParId = _self.tableId;
        if (_self.t_obj.options.combined_settings) {
            sortableParId = _self.tableId + "_" + _self.t_obj.options.combined_settings.module;
        }
        if (ignoreEvents) {
            //render list item
            let colSortDiv = jQ("#" + sortableParId + "_colsort");
            let sortLiElem = table_comp.applyDataStyle(li_elements);
            colSortDiv.empty().append(sortLiElem);

        } else {
            //render structure
            var column_choos_string = "";
            if(!combine_settings){
                column_choos_string = '<ul class="sdmenu-dd showmenu pb0 colchoose" aria-labelledby="columnsort"><li>';
            }
            var search_column_string = '<div role="form"><div class="form-footer p10 bs-noconflict mt-6"> <div class="search-box" data-action-name="column_search"><span class="sdp-glyph sdp-glyph-search pl0"></span> <span class="sdp-glyph sdp-glyph-failure inputclear-icon pos-abs top5 mt3 right10" title="' + translate('admin.search.clear') + '" data-style="display:none;"></span> <input type="text" class="form-control pl30"  id="search-input" autocomplete="off"></div> </div>';
            var elementsStr = search_column_string + '<ul class="sortlist cs ui-sortable" id="' + sortableParId + '_colsort">' + li_elements + '</ul><div class="form-footer p5"><button type="button" class="btn btn-primary col-save-btn mr10" id="'+sortableParId+'_col-save-btn">' + _self.localTranslate('common.save') + '</button><button type="button" class="btn btn-default col-cancel-btn" >' + _self.localTranslate('common.cancel') + '</button></div></div>';
            var search_column_string_close = '</li></ul></div>';
            //Appending Column Chooser content

            if (combine_settings) {
                var col_settings = combine_settings.columnchooser;
                var tabString = '<li><a href="#' + col_settings.id + '_tab" role="tab" data-switch="sdtab" data-module="' + col_settings.id + '">' + col_settings.title + '</a></li>'
                var tabContString = '<div class="sdtab-pane fade in pt5" id="' + col_settings.id + '_tab"><div class="columnsort_' + col_settings.id + '">' + elementsStr + '</div></div>';
                let colChooseDiv = jQ('#combined_colchoose_'+_self.tableId+'','#t_column_choos_' + _self.tableId);
                if(colChooseDiv.html() == ""){
                    var multiTabstring = '<div class="sdtabs-ui2"><ul class="nav nav-sdtabs column-choose-tab" id="' + _self.tableId + '_tabs" data-style="display: block;">' + tabString + '</ul><div class="sdtab-content">' + tabContString + '</div></div>';
                    let columnChooserElem = table_comp.applyDataStyle(column_choos_string+multiTabstring);
                    colChooseDiv
                    .html(columnChooserElem)
                    .find('.column-choose-tab li:first,.sdtab-pane').addClass("active");
                    
                } else {
                    let tabs = jQ("#" + _self.tableId + "_tabs");
                    let colChooseTabDiv = jQ('.sdtab-content','#t_column_choos_' + _self.tableId);
                    tabs.append(tabString);
                    colChooseTabDiv.append(tabContString);

                }
            } else {
                var dropdownString = column_choos_string+elementsStr+search_column_string_close;
                let button = jQ('#t_column_choos_' + _self.tableId +' button');
                button.after(dropdownString); // No I18N
            }

           function fakeClick(evt) {
                const isPinColumn = ()=>jQ(evt.target).closest('.column-chos-setting').length;
                //dropdown first time show, label item click not select checkbox issue fix workaround
                if(evt.target.init == undefined && !isPinColumn()) {
                    jQ(evt.target).parent().find('.showmenu').trigger('click');
                    evt.target.init = true
                }
            }

            function columnChooseDropToggle(evt) {
                //focus search box and clear value if exist
                var searchInputs = evt.target.querySelectorAll('#search-input');
                if(evt.type == 'shown') {
                    searchInputs.forEach(function(input){
                        if(input.clientHeight >0) {
                            input.focus();
                            jQ(input).val('').trigger('keyup');
                        }
                    });
                    //dropdown first time show, label item click not select checkbox issue fix workaround
                     fakeClick(evt);
                    //close popover if exist
                    _self.constructColumnChooser(true);
                    window.closeDD && closeDD();
                }
                if(evt.type == 'hide') {
                    //on close dropdown
                    _self.constructColumnChooser(true);
                }
            }

            _self.columnChooserSearchFilter();
            //To focus search on open dropdown and close clear search value
            jQ('#columnsort',columnChooserContainer).parent().off('shown.sdp.sdmenu hide.sdp.sdmenu').on('shown.sdp.sdmenu hide.sdp.sdmenu', columnChooseDropToggle);
           
            var eventNameSpace = '.table-column-choose';
            //To prevent column chooser div from hiding ,when user click on it
            jQ("#t_column_choos_" + _self.tableId).closest(".listcontrols")
            .on('click'+eventNameSpace, '.showmenu', function (evt) { //NO I18N
                var isCancelButton = jQ(evt.target).hasClass('col-cancel-btn');
                if (!isCancelButton) {
                    stopCloseDropdown(this);
                } else {
                    //close dropdown
                    jQ(this).parent().trigger('click');
                   _self.constructColumnChooser(true);
                }
            });
        }
    },
    constructColumnChooserBtn: function(){
        var _self = this,columnChooserContainer,ulList='';
        /** when combined setting column chooser we wrapped the combined column in div, condition only applied to the when parent component called */
        _self.t_obj.options.combined_settings && _self.t_obj.options.combined_settings.component_type == "parent" && (ulList = '<ul class="sdmenu-dd showmenu pb0" aria-labelledby="columnsort" id="combined_colchoose_'+_self.tableId+'"></ul>');
        
        var column_btn_string = `<div class="btn-group bs-noconflict">
                                    <button type="button" class="btn btn-default btn-sm sdmenu-toggle" data-switch="sdmenu" id="columnsort"   title="${_self.localTranslate("column.chooser.title")}" rel="uitip">
                                        <span class="cspr clmchooser icon-sm vsub top-1" aria-hidden="true"></span>
                                    </button>
                                    ${ulList}
                                </div>`;
       
        columnChooserContainer = jQ('#t_column_choos_' + _self.tableId);
        if(columnChooserContainer.length) {
            columnChooserContainer.html(column_btn_string);
            return columnChooserContainer;
        }
    },
    columnChooserSearchFilter: function () {
        var _self = this;
        var eventNameSpace = '.table-columnchooser-search';
        // Prevent Hiding the dropdown when click 

        jQ('[data-action-name="column_search"]')
        .off(eventNameSpace)
        .on('keyup'+eventNameSpace,'#search-input',search)
        .on('click'+eventNameSpace,'.sdp-glyph-failure', function (evt) {
            evt.preventDefault();
            var parEle = "";
            if (_self.t_obj && _self.t_obj.options.combined_settings) {
                parEle = jQ(this).closest("div[role='form']");
            } else {
                parEle = jQ(this).closest('.btn-group');
            }
            parEle.find('ul.sortlist li.noitem').addClass('hidden');
            parEle.find('#search-input').val('').trigger('focus').trigger('keyup');
        });

        //search column chooser
        function search() {
            var _this = jQ(this);
            var searchString = _this.val();
            var btn = "";
            if (_self.t_obj && _self.t_obj.options.combined_settings) {
                btn = _this.closest("div[role='form']");
            } else {
                btn = _this.parents('.btn-group');
            }
            var sortableElement = btn.find(".sortlist").sortable();
            var totalLi = btn.find(".sortlist li").length;
            /* search all li items */
            btn.find("ul.sortlist li:not(.noitem)").each(function (index, el) {
                if (jQ(this).text().toUpperCase().indexOf(searchString.toUpperCase()) > -1) {
                    jQ(this).show().addClass('show');
                } else {
                    jQ(this).hide().removeClass('show');
                }
            });
            btn.find('.inputclear-icon').show(); // Show Clear Icon 
            var showLength = btn.find('ul.sortlist li.show').length;
            if (showLength == 0) { // when No matches found
                btn.find('ul.sortlist li.noitem').removeClass('hidden'); // Show No item Found Message
            } else if (showLength == (totalLi - 1)) {
                sortableElement.sortable("enable");
                btn.find('ul.sortlist li.noitem').addClass('hidden');
                btn.find('ul.sortlist li .ctl i').css('visibility', '').end().find('.sdp-glyph-failure').hide() //NO I18N
            } else {
                btn.find('ul.sortlist li.noitem').addClass('hidden');
                btn.find('ul.sortlist li .ctl i').css('visibility', 'hidden'); //NO I18N
                sortableElement.sortable("disable"); // Disable Sortable
            }
        }
    },
    reOrderColChooser: function (chk_ele) {
        var _self = this;
        var curr_ele = jQ(chk_ele).closest('li'); // No I18N
        var par_ele = jQ(chk_ele).closest('ul'); // No I18N
        var c_len = par_ele.find(".colcheckbox:checked").length;
        var li_index = curr_ele.index();
        var sortableParId = _self.tableId;
        if (_self.t_obj.options.combined_settings) {
            sortableParId = _self.tableId + "_" + _self.t_obj.options.combined_settings.module;
        }
        var defaultMaxColumn = 100;
        //column chooser max limit 100
        var maxAllowedfields = _self.t_obj.options.max_allowed_fields || defaultMaxColumn;
         defaultMaxColumn = Math.min(defaultMaxColumn, maxAllowedfields);
        //if max allowed fields is less than default max column
        maxAllowedfields = defaultMaxColumn > maxAllowedfields ? defaultMaxColumn : maxAllowedfields;

        if (maxAllowedfields && c_len > maxAllowedfields) {
            showalert('failure', translate("api.max.limit.exceeded", [maxAllowedfields + ""]), "isAutoHide=true"); // No I18N
            jQ(chk_ele).prop('checked', false);
            return false;
        }
        if (jQ(chk_ele).is(':checked')) {
            if (c_len === 1) {
                jQ("#" + sortableParId + "_colsort").prepend(curr_ele);
            } else {
                jQ("#" + sortableParId + "_colsort li").eq(c_len - 2).after(curr_ele);
            }
        } else {
            if (c_len > 0 && li_index !== c_len) {
                jQ("#" + sortableParId + "_colsort li").eq(c_len).after(curr_ele);
            }
        }
    },
    columnChooserChanges: function (savebtn) {
        var _self = this;
        var fields_required = {};
        var col_order = [];
        var col_order_default = _self.t_obj.table_info.column_order;
        var metainfoavailable = false;
        if (_self.t_obj.available_minfo_fields && !jQ.isEmptyObject(_self.t_obj.available_minfo_fields)) {
            metainfoavailable = true;
        }
        var sortableParId = _self.tableId;
        if (_self.t_obj.options.combined_settings) {
            sortableParId = _self.tableId + "_" + _self.t_obj.options.combined_settings.module;
        }
        var colsortElement = jQ(savebtn).closest("div[role='form']").find("#" + sortableParId + "_colsort");
        colsortElement.find("input[type='checkbox']").each(function () {

            if (jQ(this).is(":checked")) {
                var field_obj = {};
                if (_self.t_obj.options.view !== "kanban") {
                    var ele = jQ("#" + _self.tableId + "_head tr:first th[data-id='" + this.value + "']");
                    if (ele[0]) {
                        if (ele[0].style.width) {
                            field_obj.width = ele[0].style.width;
                        }
                    }
                }
                fields_required[this.value] = field_obj;
                if (metainfoavailable) {
                    var fieldinMeta = _self.t_obj.available_minfo_fields[this.value];
                    if (fieldinMeta) {
                        fields_required[this.value]["is_inmeta"] = true;
                    }
                }
                col_order.push(this.value);
            }
        });
        /*Appending default columns with fields_required and column_order*/
        var defColCount = _self.t_obj.defaultColCount;
        if (defColCount > 0) {
            col_order = col_order_default.slice(0, defColCount).concat(col_order);
            for (var i = 0; i < defColCount; i++) {
                if ((col_order_default[i]).indexOf("_head_chk") == -1) {
                    fields_required[col_order_default[i]] = {};
                    if (metainfoavailable) {
                        var fieldinMeta = _self.t_obj.available_minfo_fields[col_order_default[i]];
                        if (fieldinMeta) {
                            fields_required[col_order_default[i]]["is_inmeta"] = true;
                        }
                    }
                }
            }
        }
        _self.t_obj.table_info.column_order = col_order;
        _self.t_obj.table_info.fields_required = fields_required;
        _self.updateTableInfoPeronalization('colchooser'); //Personlization for fields required  // No I18N
    },
    constructPaginationDetails: function () { //Constructing pagination div
        var _self = this;
        var pageLengthArray = ["10", "25", "50", "100"], //default page length array
            list_info = _self.t_obj.table_info.list_info,
            pageLength = list_info.row_count || 10,
            prevClass = "",
            nextClass = ""; //No I18N
        /**
         * Custom page length 
         */
        if(_self.t_obj.options.custom_page_length){
            pageLengthArray = _self.t_obj.options.custom_page_length;          
        }
        if (parseInt(list_info.start_index) <= 1) {
            prevClass = "disabled"; //No I18N
        }
        if (list_info.has_more_rows != undefined && (list_info.has_more_rows).toString() === "false") {
            nextClass = "disabled"; //No I18N
        }
        var pagination_string = '<div class="btn-group ml10">',
            pageLengthHtml = '<div class="fl btn-group ' + (_self.t_obj.options.hidePageLength ? "hidden" : "bs-noconflict") + '"><button rel="uitip" title="' + translate("sdp.records.per.page") + '" type="button" class="btn btn-default sdmenu-toggle btn-sm" data-switch="sdmenu" ><span class="row_count_display">' + pageLength + '</span> <span class="caret"></span></button>';
        var isListSettingEnabled = _self.t_obj.options.listSettingEnabled && _self.t_obj.options.listSettingOptions.enableSettings && _self.t_obj.options.listSettingOptions.enableSettings.indexOf("record_per_page") !== -1 && !_self.t_obj.options.hidePageLength;
        var li_elements_str = '<ul class="sdmenu-dd mt-2 minw-50px" id="row_count_' + _self.tableId + '" >', select_element_str = "<div class='mr10'><select id='row_count_" + _self.tableId + "' class='w-80per'>";
        isListSettingEnabled && (pageLengthHtml = "", li_elements_str = "");
        if (!_self.t_obj.options.hidePageLength) {
            for (var i = 0; i < pageLengthArray.length; i++) {
                if (isListSettingEnabled) {
                    select_element_str += '<option value=' + pageLengthArray[i] + '>' + pageLengthArray[i] + '</option>'
                } else {
                    var li_element = '<li data-value=' + pageLengthArray[i] + '>';

                    var a_ele = '<span class="a-tag-sdmenu" role="button" > ' + pageLengthArray[i] + '</span>';
                    li_element = li_element + a_ele;
                    li_element = li_element + '</li>';
                    li_elements_str = li_elements_str + li_element;
                }
                if (_self.t_obj.options.maxgetcount && _self.t_obj.options.maxgetcount == pageLengthArray[i]) {
                    break;
                }
            }
            if (isListSettingEnabled) {
                select_element_str += "</select></div>";
                let paginationListDiv = jQ("#t_pagelength_ls_" + _self.tableId);
                let select_element_elem = table_comp.applyDataStyle(select_element_str);
                paginationListDiv.empty().append(select_element_elem);

                paginationListDiv.find("#row_count_" + _self.tableId).select2({
                    formatNoMatches: translate("ae.common.select2nomatchesfound")
                }).on("change", function () {
                    _self.t_obj.table_info.list_info.row_count = jQ(this).val();
                    _self.t_obj.table_info.list_info.start_index = 1;
                    if (_self.t_obj.options.urlSearch) {
                        _self.setPushStateObj();
                    }
                    _self.updateTableInfoPeronalization("pagelength"); // No I18N
                    jQ(".listview-settings").hide();
                    jQ("#t_setting_popup_"+_self.tableId).append(jQ("#t_ls_detach_"+_self.tableId).detach());
                });
                jQ("#row_count_" + _self.tableId).select2("val", pageLength);

            } else {
                li_elements_str += "</ul>";
            }
        }
        var disabledText = "", total_count_str = "", hideClass = "";
        if (_self.t_obj.options.get_total_count == false) {
            total_count_str = "<b class='gettotalcount' title='" + translate("table.totalcount.view") + "'>...</b>";
            hideClass = "hide";
        } else {
            disabledText = " disabled";
        }
         var getPaginationString = ()=>{
            var pageContent = pageLengthHtml + li_elements_str;
            return pageContent ? pagination_string + pageLengthHtml + li_elements_str+'</div>' : '';
        }
        var total_disp_str = '<span class="displaytotal_count ' + hideClass + '">' + _self.localTranslate("common.of") + ' <span name="total" id="total_count">' + (list_info.total_count || 0) + '</span></span>' + total_count_str;

        pagination_string = getPaginationString() + '</div><button type="button" class="btn btn-default btn-sm listcount" ' + disabledText + '><span name="start" id="startPageIndex">' + (list_info.start_index || 0) + '</span> - <span name="end" id="endPageIndex">' + (list_info.end_index || 0) + '</span> <span class="total_count_container">' + total_disp_str + '</span></button><button type="button" class="btn btn-default btn-sm"' + prevClass + ' id="prevPage" aria-label="' + _self.localTranslate("common.previous") + '" title="' + _self.localTranslate("common.previous") + '" data-field="previous" rel="uitip"><span class="rspr icon-sm chevron-left1 flat"></span></button><button type="button" class="btn btn-default btn-sm btn-rad-rgt" ' + nextClass + ' id="nextPage" aria-label="' + _self.localTranslate("common.next") + '" title="' + _self.localTranslate("common.next") + '" data-field="next" rel="uitip"><span class="rspr icon-sm chevron-right1 flat"></span></button></div>'; // No I18N


        var paginationCompDiv = jQ('#pagination_comp_' + _self.tableId);
        paginationCompDiv.addClass("ml10"); //add margin to the container, act as separator
        //Appending Pagination content
        var pagination_string_elem = table_comp.applyDataStyle(pagination_string);
        paginationCompDiv.empty().append(pagination_string_elem); // No I18N

        //To set selected 'li' as 'active' in dropdown
        paginationCompDiv.find('ul li[data-value="' + pageLength + '"]').addClass('active');
        
    },
    updatePaginationDetails: function (action) { //Updating pagination elements
        var _self = this;
        var list_info = _self.t_obj.table_info.list_info;
        var parent = jQ('#pagination_comp_' + _self.tableId);
        parent.find("#prevPage,#nextPage").prop('disabled', false); // No I18N
        if (parseInt(list_info.start_index) <= 1) {
            parent.find("#prevPage").prop("disabled", true); //No I18N
        }
        if (list_info.has_more_rows != undefined && (list_info.has_more_rows === false || list_info.has_more_rows === "false")) {
            parent.find("#nextPage").prop("disabled", true); //No I18N
        }
        parent.find('#startPageIndex').text(list_info.start_index); // No I18N
        parent.find('#endPageIndex').text(list_info.end_index); // No I18N
        if (_self.t_obj.options.get_total_count == false) {
            if (action !== "next" && action !== "previous" && action !== "pagelength") {
                parent.find('.gettotalcount').removeClass("hide");
                parent.find('.displaytotal_count').addClass("hide");
            }
        } else {
            parent.find('#total_count').text(list_info.total_count); // No I18N
        }
    },
    paginationChanged: function (ele, row_count) {
        var _self = this;
        var parent = jQ('#pagination_comp_' + _self.tableId);
        parent.find('ul#row_count_' + _self.tableId + ' li.active').removeClass('active'); // No I18N
        parent.find(ele).addClass('active');

        parent.find('.row_count_display').text(row_count); // No I18N
        _self.t_obj.table_info.list_info.row_count = row_count;
        _self.t_obj.table_info.list_info.start_index = 1;
        if (_self.t_obj.options.urlSearch) {
            _self.setPushStateObj();
        }
        _self.updateTableInfoPeronalization("pagelength"); // No I18N
    },
    nextPrevNav: function (nextPrev) {
        var _self = this;
        var par_ele = jQ("#pagination_comp_" + _self.tableId); // No I18N
        var startIndex = "",
            rowcount = par_ele.find('.row_count_display').text() || jQ("#row_count_" + _self.tableId).val(); // No I18N;
        if (nextPrev == "next") {
            startIndex = parseInt(par_ele.find('#endPageIndex').text()) + 1; // No I18N
        } else {
            startIndex = parseInt(par_ele.find('#startPageIndex').text()) - parseInt(rowcount); // No I18N
        }
        _self.t_obj.table_info.list_info.start_index = startIndex;
        _self.t_obj.table_info.list_info.row_count = rowcount;
        if (_self.t_obj.options.urlSearch) {
            _self.setPushStateObj();
        }
        _self.updateTableInfoPeronalization(nextPrev);
    },
    getTotalCount: function () {
        /*
            To replace the Total count on click , on "..." in Pagination control
        */
        var _self = this;
        var opt = _self.t_obj.options, inputObject = {}, list_info = _self.listInfoConstructToAPI(true);
        if (opt.include_fieldsreq_gettotal) {
            if (opt.isFR_ListInfo_Support) {
                list_info.fields_required = _self.t_obj.table_info.list_info.fields_required;
            } else {
                inputObject.fields_required = _self.t_obj.table_info.list_info.fields_required;
            }
        }
        list_info.get_total_count = true;
        list_info.row_count = 0;
        inputObject.list_info = list_info;
        var dataVal = sdpAjaxInputData(inputObject);
        var succeeFun, url = opt.defaultpath + opt.callbackURL;

        function getQueryParamUrl() {
            var url = opt.defaultpath + opt.callbackURL + "/_total_count";
            let urlCallback = opt.callbackURL.split('?');
            let callbackURL =  urlCallback[0];
            let queryParams = urlCallback.length >1 ? '?'+urlCallback[1] : '';
            var hasConvenienceOperation = callbackURL.indexOf('/_')>1;
            !hasConvenienceOperation && (url = opt.defaultpath + callbackURL + "/_total_count"+queryParams);
            return url;
        }

        // New API support for getting total count
        if(opt.isODAPI && !opt.hasOwnProperty('support_old_get_total_count') ){
            //To support query param in callback url
            url = getQueryParamUrl();

            delete list_info.row_count;
            delete list_info.start_index;
            delete list_info.get_total_count;
            succeeFun = function(obj){
                jQ("#pagination_comp_" + _self.tableId).find('.gettotalcount,.displaytotal_count').toggleClass("hide").end()
                .find(".total_count_container #total_count").text(obj._total_count[opt.entity_name]);
            }
        }else{
            succeeFun = function(obj){
                jQ("#pagination_comp_" + _self.tableId).find('.gettotalcount,.displaytotal_count').toggleClass("hide").end()
                .find(".total_count_container #total_count").text(obj.list_info.total_count);
            }
        }
        sdpAjax({
            url: url,
            data: dataVal,
            success:succeeFun,
            skipSUBREQUEST: true
        });
    },
    constructSearchIcon: function () { //Constructing Search Icon
        var _self = this;
        var search_icon = '<button type="button" data-name="spot_search" class="btn btn-default btn-sm" id="' + _self.tableId + '_listSearch" title="' + _self.localTranslate("common.search.title") + '" rel="uitip"><span class="rspr icon-sm search1 vsub opac7"></span></button>';
        jQ("#t_searchicon_" + _self.tableId).html(search_icon); // No I18N
    },
    constructDeleteIcon: function () { //Constructing Delete Icon
        var _self = this;
        var delete_icon = '<button id="' + _self.tableId + '_btn_delete" type="button" class="btn btn-default btn-sm pt-delete-btn" data-link="tablelist" title="' + _self.localTranslate('common.delete') + '" rel="uitip" data-icontoggle="true" data-i18n-key="common.delete" data-icon-class="cspr delete2 icon-sm vsub top0" disabled data-table-id="listcontrols">'+_self.localTranslate('common.delete')+'</button>';
        jQ("#deleteicon_" + _self.tableId).html(delete_icon); // No I18N
    },
    //Listview Settings construction starts
    constructListViewSettings: function () {
        var _self = this;
        var list_settings = _self.t_obj.table_info.list_settings;
        var lv_settings = _self.constructListSettingOption();
        if (_self.t_obj.options.view == "kanban") {
            delete lv_settings.reset_column_width;
        }

                jQuery('#t_list_settings_' + _self.tableId).html('<button class="btn btn-default btn-sm btn-rad-rgt" custom-class="listview-settings" closeon-esckey="yes" closeon-bodyclick="no" data-target-id="#t_setting_popup_' + _self.tableId + '" type="button" rel="uitip" aria-label="' + translate("common.listsetting") + '" title="' + translate("common.listsetting") + '"><span aria-hidden="true" class="cspr icon-sm listview-setting flat vmiddle top-1"></span></button>'); //No I18N
        var settingHtml = "";
        jQuery.each(lv_settings, function (index, setting) {
            settingHtml += '<div class="form-group col-md-12 p0">' +
            '<div class="col-md-4 pl0"><label for="'+setting.label+'" class="pt5" data-i18n-key="'+setting.label+'">'+setting.label+'</label></div>'+
                '<div class="col-md-8 pl0 pr0">' + setting.html + '</div> </div>'; //No I18N
        })
        var popupHtml = '<div aria-labelledby="listViewSetting" class="hide" id="t_setting_popup_' + _self.tableId + '">' + //No I18N
                        '<div id="t_ls_detach_'+_self.tableId+'"><div id="Right-Section" class="p0"><div class="p15 pr10 lw-settings listview noborder t_list_setting_'+_self.tableId+'"><h4 class="mb15 mt0" data-i18n-key="common.listsetting">'+translate("common.listsetting")+'</h4><form class="form-horizontal" role="form">'+settingHtml+'</form></div></div>'+
            '</div></div>'; //No I18N
        var settingPopupDiv = jQ('#t_setting_popup_' + _self.tableId,"body");    
        settingPopupDiv.remove(); //remove setting popup div if already exist in body
        var popupHtmlElem = table_comp.applyDataStyle(popupHtml);
        jQ('body').append(popupHtmlElem);
        settingPopupDiv = jQ('#t_setting_popup_' + _self.tableId,"body"); 


        if(jQ(".listview-settings").find(".popover-inner").length) {
            jQ(".listview-settings").find(".popover-inner").empty();    //No I18N
        }
        if (list_settings && list_settings.display_density) {
            jQ("[data-lvs='display_density']").removeClass("btn-theme").find("svg").removeClass("tabactive"); //No I18N
            jQ("[data-lvs-type='" + list_settings.display_density + "']").addClass("btn-theme").find("svg").addClass("tabactive"); //No I18N
            var density_class = _self.t_obj.options.view == "kanban" ? ".tc-kanban" : ".tableComponent"; //No I18N
            list_settings.display_density === "compact" ? jQ("#" + _self.tableId + "_div").find(density_class).removeClass("compactview").addClass("compactview") : jQ("#" + _self.tableId + "_div").find(density_class).removeClass("compactview"); //No I18N
        }
        if (list_settings && list_settings.text_wrapping) {
            jQ("[data-lvs='text_wrapping']").removeClass("btn-theme").find("svg").removeClass("tabactive"); //No I18N
            jQ("[data-lvs-type='" + list_settings.text_wrapping + "']").addClass("btn-theme").find("svg").addClass("tabactive"); //No I18N
        }
        if(list_settings && list_settings.cv_preferred_column){
            jQuery("[data-lvs='cv_preferred_column']").removeClass("btn-theme") //No I18N
            jQuery("[data-lvs-type='" + list_settings.cv_preferred_column + "']").addClass("btn-theme") //No I18N
        }
        if(!_self.t_obj.options.isCustomView){
            jQuery("[data-lvs='cv_preferred_column']").closest('.form-group').addClass('hidden')
        }
    },
    constructListSettingOption: function () {
        var _self = this, lv_settings = {};

        var default_lv_settings = {
            display_density: {
                label: translate("common.display.density"),
                html: '<div class="btn-group"><button class="btn btn-default btn-sm btn-rad-lft btn-theme display-density" type="button" data-lvs="display_density" data-lvs-type="comfortable" aria-label="'+translate("common.display.density.comfortable")+'"><span class="disp-ib"><svg class="default-fill vmiddle tabactive" aria-hidden="true" width="16" height="16"><use href="#Comfortable_ic"></use></svg></span><span class="text-overflow disp-ib vmiddle pl5 max-w100px" data-i18n-key="common.display.density.comfortable">'+translate("common.display.density.comfortable")+'</span></button><button class="btn btn-default btn-sm btn-rad-rgt display-density" type="button" data-lvs="display_density" data-lvs-type="compact" aria-label="'+translate("common.display.density.compact")+'"><span class="disp-ib"><svg class="default-fill vmiddle" aria-hidden="true" width="16" height="16"><use href="#Compact_ic"></use></svg></span><span class="text-overflow disp-ib vmiddle pl5 max-w100px" data-i18n-key="common.display.density.compact">'+translate("common.display.density.compact")+'</span></button></div>' //No I18N
            },
            text_wrapping: {
                label: translate("common.text.wrapping"),
                html: '<div class="btn-group"><button class="btn btn-default btn-sm btn-rad-lft btn-theme" type="button" aria-label="'+translate("common.text.wrapping.clip")+'" data-lvs="text_wrapping" data-lvs-type="clip" rel="uitip" title="'+translate("common.text.wrapping.clip.tooltip")+'"><span class="disp-ib"><svg class="default-fill vmiddle tabactive" aria-hidden="true" width="16" height="16"><use href="#Clip_ic"></use></svg></span><span class="text-overflow disp-ib vmiddle pl5 max-w90px" data-i18n-key="common.text.wrapping.clip">'+translate("common.text.wrapping.clip")+'</span></button><button class="btn btn-default btn-sm btn-rad-rgt" type="button" aria-label="'+translate("common.text.wrapping.wrap")+'" data-lvs="text_wrapping" data-lvs-type="wrap" rel="uitip" title="'+translate("common.text.wrapping.wrap")+'"><span class="disp-ib"><svg class="default-fill vmiddle" aria-hidden="true" width="16" height="16"><use href="#Wrap_ic"></use></svg></span><span class="text-overflow disp-ib vmiddle pl5 max-w90px"  data-i18n-key="common.text.wrapping.wrap">'+translate("common.text.wrapping.wrap")+'</span></button></div>'
            },
            reset_column_width: {
                label: translate("common.reset.columnresize"),
                html: '<div class="btn-group"><button class="btn btn-default btn-sm btn-rad-lft btn-rad-rgt" type="button" aria-label="'+translate("common.reset.columnresize.btn")+'" data-lvs="reset_column_width" rel="uitip" title="'+translate("common.reset.columnresize.btn")+'"><span class="text-overflow disp-ib vmiddle" data-i18n-key="common.reset.columnresize.btn">'+translate("common.reset.columnresize.btn")+'</span></button></div>'
            },
            reset_personalization: {
                label: translate("sdp.app.tourview.personalization"),
                html: '<div class="btn-group"><button class="btn btn-default btn-sm btn-rad-lft btn-rad-rgt" type="button" aria-label="'+translate("common.reset.personalization")+'" data-lvs="reset_personalization" rel="uitip" title="'+translate("common.reset.personalization")+'"><span class="text-overflow disp-ib vmiddle" data-i18n-key="common.reset.personalization">'+translate("common.reset.personalization")+'</span></button></div>'
            },
            cv_preferred_column: {
                label: translate("preferred.column"),
                html: '<div class="btn-group">'+
                        '<button class="btn btn-default btn-sm btn-rad-lft btn-theme" type="button" aria-label="'+translate("sdp.common.enable")+'"             data-lvs="cv_preferred_column" data-lvs-type=true rel="uitip" title="'+translate("sdp.common.enable")+'">'+
                        '<span class="disp-ib"><span class="text-overflow disp-ib vmiddle pl5 maxw-90px" data-i18n-key="sdp.common.enable">'+
                            translate("sdp.common.enable")+
                        '</span>'+
                        '</button>'+
                        '<button class="btn btn-default btn-sm btn-rad-rgt" type="button" aria-label="'+translate("sdp.common.disable")+'" data-lvs="cv_preferred_column" data-lvs-type=false rel="uitip" title="'+translate("sdp.common.disable")+'">'+
                            '<span class="disp-ib"></span>'+
                            '<span class="text-overflow disp-ib vmiddle pl5 maxw-90px"  data-i18n-key="sdp.common.disable">'+
                                translate("sdp.common.disable")+
                            '</span>'+
                        '</button>'+
                      '</div>'
            }
        }

        if (_self.t_obj.options.listSettingOptions) {
            jQuery.each(_self.t_obj.options.listSettingOptions.enableSettings, function (index, setting) {
                if (setting === "refresh_frequency") {
                    lv_settings.refresh_frequency = {
                        label: translate("sdp.requests.listview.refresh.frequency"),
                        html: '<div class="fw"><div id="t_refresh_freq_ls_' + _self.tableId + '"></div></div>'
                    }
                } else if (setting === "record_per_page") {
                    lv_settings.record_per_page = {
                        label: translate("common.recordperpage"),
                        html: '<div class="fw"><div id="t_pagelength_ls_' + _self.tableId + '"></div></div>'
                    }
                } else if (setting === "sorting") {
                    lv_settings.sorting = {
                        label: translate("common.sortby"),
                        html: '<div class="fw"><div id="t_sorticon_' + _self.tableId + '"></div></div>'
                    }
                }
            })
            jQuery.each(_self.t_obj.options.listSettingOptions.disableSettings, function (i, s) {
                // Avoid deleting the disabled list setting when isCustomview flag is enabled
                if(_self.t_obj.options.isCustomView && s === 'cv_preferred_column'){
                    return;
                }
                delete default_lv_settings[s];
            })
        }


        return jQuery.extend(true, lv_settings, default_lv_settings)
    },
    getListControl:function(id){
        var $listControlElem = jQuery("#"+id).closest('.listcontrols');
        if(!_self.$listControlElem && $listControlElem.length) {
            _self.$listControlElem = $listControlElem;
        }
        return _self.$listControlElem;
    },
    loadListSettingEvents: function () {
        var _self = this;
        // To show confirm box with default options title okay and cancel default
        function sdpShowConfirm(options,callback) {
            var title = options.title || translate("common.confirm");
            var message = options.message || '';
            var submitbutton = options.submitbutton || translate('sdp.common.ok');
            var cancelbutton = options.cancelbutton || translate('sdp.common.cancel');
            let messageConfig = 'title=' + title + ', message=' + message + ', submitbutton=' + submitbutton + ', cancelbutton=' + cancelbutton + ', closebutton=yes, closeOnEscKey=yes';
            showconfirm(true,messageConfig , (isConfirm) => isConfirm && callback());
        }
        jQ(".t_list_setting_" + _self.tableId).find("[data-lvs]").off().on('click', function (event) {
            if (jQ(this).hasClass("active")) {
                return;
            }
            var currentState = jQ(this).attr("data-lvs"), //No I18N
                currentStateType = jQ(this).attr("data-lvs-type"); //No I18N
            if (currentState !== "reset_column_width" && currentState !== "reset_personalization") {
                !_self.t_obj.table_info.list_settings && (_self.t_obj.table_info.list_settings = {});
                _self.t_obj.table_info.list_settings[currentState] = currentStateType;
                _self.t_obj.options.personalize_key && _self.addPersonalizeData(_self.t_obj.table_info);
                jQ("[data-lvs='" + currentState + "']").removeClass("btn-theme").find("svg").removeClass("tabactive"); //No I18N
                jQ(this).addClass("btn-theme").find("svg").addClass("tabactive"); //No I18N
                switch (currentState) {
                    case "display_density":
                        var density_class = _self.t_obj.options.view == "kanban" ? ".tc-kanban" : ".tableComponent"; //No I18N
                        currentStateType === "compact" ? jQ("#" + _self.tableId + "_div").find(density_class).removeClass("compactview").addClass("compactview") : jQ("#" + _self.tableId + "_div").find(density_class).removeClass("compactview"); //No I18N
                        break;
                }
            } else if (currentState === "reset_column_width") {
                function doColumnResize(){
                    jQuery.each(_self.t_obj.table_info.fields_required, function (index, value) {
                        if (value.width) {
                            delete value.width;
                        }
                    })
                    _self.t_obj.options.personalize_key && _self.addPersonalizeData(_self.t_obj.table_info);
                    _self.setupHeaderColumns();
                    _self.constructRowContent();
                    jQ(".listview-settings").hide();
                }
                closeDD();
                let opt = {title:translate("common.reset.columnresize"),message:translate("common.resetwidth.confirm")};
                sdpShowConfirm(opt,doColumnResize);

            } else if (currentState === "reset_personalization") {
                async function doResetPersonalization(){
                    _self.t_obj.options.personalize_key && await ClientUtil.addUserPersonalization('table_component', {},{internalKey:_self.t_obj.options.personalize_key});
                    jQ("#" + _self.tableId + "_div").html('');
                    jQ("#t_setting_popup_" + _self.tableId).remove();
                    jQ("#t_ls_detach_" + _self.tableId).remove();
                    jQ(".listview-settings").hide();
                    typeof _self.t_obj.options.reinitializeCalback === "function" && _self.t_obj.options.reinitializeCalback();
                }
                closeDD();
                let opt = {title:translate("common.reset.personalization"),message:translate("common.resetpersonalization.confirm")};
                sdpShowConfirm(opt,doResetPersonalization);
            } else if (currentState === "cv_preferred_column") {
                jQuery("[data-lvs='" + currentState + "']").removeClass("btn-theme"); //No I18N
                jQuery(this).addClass("btn-theme"); //No I18N
                jQuery("#" + _self.tableId + "_div").html('');
                jQuery(".listview-settings").hide();
                var t_info;
                if(_self.checkCustomViewEnabled()){
                    !_self.t_obj.table_info.list_settings && (_self.t_obj.table_info.list_settings = {});
                    _self.t_obj.table_info.list_settings[currentState] = currentStateType;
                    t_info = _self.t_obj.table_info
                    t_info.fields_required = _self.t_obj.def_table_info.fields_required;
                    t_info.column_order = _self.t_obj.def_table_info.column_order;
                    _self.t_obj.def_table_info.list_info.sort_order && (t_info.list_info.sort_order = _self.t_obj.def_table_info.list_info.sort_order);
                    _self.t_obj.def_table_info.list_info.sort_field && (t_info.list_info.sort_field = _self.t_obj.def_table_info.list_info.sort_field);
                    jQuery(".listview-settings [data-lvs='cv_preferred_column']").closest('.form-group').addClass('hidden')
                }else{
                    !_self.t_obj.table_info.list_settings && (_self.t_obj.table_info.list_settings = {});
                    _self.t_obj.table_info.list_settings[currentState] = currentStateType;
                    t_info = _self.t_obj.table_info
                }
                _self.addPersonalizeData(t_info, true);
                typeof _self.t_obj.options.reinitializeCalback === "function" && _self.t_obj.options.reinitializeCalback();
            }
        });
    },
    //Listview Settings construction ends
    //construct refresh frequency
    constructRefreshFreq: function () {
        var _self = this;
        var opt = _self.t_obj.options;
        var refreshHTML = '<button type="button" class="btn btn-default btn-sm sdmenu-toggle list-icon-groups btn-rad-rgt" data-switch="sdmenu" id="reqconfig" rel="uitip" aria-label=' + translate("sdp.requests.listview.refresh.frequency") + 'title=' + translate("sdp.requests.listview.refresh.frequency") + '><span class="caret ml0"></span></button><ul class="sdmenu-dd showmenu pt0 m0" aria-labelledby="reqconfig"><li class="req-refresh-list"><div class="h4 m0">' + translate("sdp.requests.listview.refresh.frequency") + '</div><ul id="' + _self.tableId + '-refresh-frequency" class="sortlist"><li class="p0"><label data-name="Never" data-value="1"><input type="radio" value="0" class="mr5" name="Minutes" checked="">' + translate("sdp.requests.viewrequest.noRefresh") + '</label></li><li class="p0"><label data-name="3 Minutes"><input type="radio" value="3" class="mr5" name="Minutes">3 ' + translate("sdp.requests.viewrequest.minute") + '</label></li><li class="p0"><label data-name="5 Minutes"><input type="radio" value="5" class="mr5" name="Minutes">5 ' + translate("sdp.requests.viewrequest.minute") + '</label></li><li class="p0"><label data-name="10 Minutes"><input type="radio" value="10" class="mr5" name="Minutes">10 ' + translate("sdp.requests.viewrequest.minute") + '</label></li><li class="p0"><label data-name="15 Minutes"><input type="radio" value="15" class="mr5" name="Minutes">15 ' + translate("sdp.requests.viewrequest.minute") + '</label></li><li class="p0"><label data-name="20 Minutes"><input type="radio" value="20" class="mr5" name="Minutes">20 ' + translate("sdp.requests.viewrequest.minute") + '</label></li><li class="p0"><label data-name="30 Minutes"><input type="radio" value="30" class="mr5" name="Minutes">30 ' + translate("sdp.requests.viewrequest.minute") + '</label></li></ul></li></ul>';
        if (opt.listSettingEnabled && opt.listSettingOptions && opt.listSettingOptions.enableSettings && opt.listSettingOptions.enableSettings.indexOf("refresh_frequency") !== -1) {
            let refreshTableDiv = jQ("#t_refresh_freq_ls_" + _self.tableId);
            let refreshHTMLStr = '<div class="mr10"><select id="' + _self.tableId + '-refresh-frequency" class="w-80per"><option value="0">' + translate("sdp.requests.viewrequest.noRefresh") + '</option><option value="3">3 ' + translate("sdp.requests.viewrequest.minute") + '</option><option value="5">5 ' + translate("sdp.requests.viewrequest.minute") + '</option><option value="10">10 ' + translate("sdp.requests.viewrequest.minute") + '</option><option value="15">15 ' + translate("sdp.requests.viewrequest.minute") + '</option><option value="20">20 ' + translate("sdp.requests.viewrequest.minute") + '</option><option value="30">30 ' + translate("sdp.requests.viewrequest.minute") + '</option></select></div>';
            let refreshHTMLElem = table_comp.applyDataStyle(refreshHTMLStr);
            refreshTableDiv.empty().append(refreshHTMLElem);

            jQ("#" + _self.tableId + "-refresh-frequency").select2({
                formatNoMatches: translate("ae.common.select2nomatchesfound")
            }).on("change", function () {
                _self.updateRefreshFreqPersonalize(jQ(this).val());
                jQ(".listview-settings").hide();
            });
            if (_self.t_obj.table_info.refresh_time) {
                jQ("#" + _self.tableId + "-refresh-frequency").select2("val", _self.t_obj.table_info.refresh_time);
            }
            refreshHTML = "";
        }
        jQ('#t_refresh_freq_' + _self.tableId).html(
            '<div class="btn-group bs-noconflict mr10"> <button type="button" class="btn btn-default btn-sm list-icon-groups btn-rad-lft" id="' + _self.tableId + '_refreshfreq" rel="uitip" aria-label=' + translate("sdp.admin.ad.ou.refresh") + ' title=' + translate("sdp.admin.ad.ou.refresh") + '><span aria-hidden="true" class="rspr flat icon-sm rotate-right1"></span></button>' + refreshHTML + '</div>'
        );
    },
    updateRefreshFreqPersonalize: function (refreshTime, isPersonalize) {
        var _self = this;
        _self.t_obj.table_info.refresh_time = refreshTime;
        isPersonalize != false ? _self.addPersonalizeData(_self.t_obj.table_info) : "";
        _self.refreshInterval ? (clearInterval(_self.refreshInterval), _self.refreshInterval = undefined) : "";
        if (_self.t_obj.table_info.refresh_time != '0') {
            _self.refreshInterval = setInterval(function () {
                if (jQ("#" + _self.tableId + "_div").length == 0) {
                    _self.destroy();
                    return false;
                }
                _self.refreshTable("refresh"); //NO I18N
            }, parseInt(_self.t_obj.table_info.refresh_time) * 60 * 1000);
        }
    },
    constructRestoreButton: function () {
        var _self = this;
		var entitytitle = _self.t_obj.options.entity_display_name ? _self.t_obj.options.entity_display_name : _self.tableId;
        jQ('#restore_' + _self.tableId).html(
            '<button id="'+_self.tableId+'_restore" type="button" class="btn btn-default btn-sm" rel="uitip" title="'+e_attr(translate("sdp.trash.restore",[e_attr(entitytitle)]))+'" data-link="'+_self.tableId+'" disabled data-i18n-key="sdp.requests.restorerequests">'+translate("sdp.requests.restorerequests")+'</button>'
        );
    },
    restoreRecords: function () {
        var _self = this;
        var ids = _self.bulkSelect.getSelectedIDs();
        if (ids.length == 0) {
            return;
        }
		var entitytitle = _self.t_obj.options.entity_display_name ? _self.t_obj.options.entity_display_name : _self.tableId;
        showconfirm(true, 'title='+translate("common.confirm")+', message=' + translate("sdp.restore.confirmation",[e_html(entitytitle)]) + ', submitbutton='+translate('sdp.common.ok')+', cancelbutton='+translate('sdp.common.cancel')+', closebutton=yes, closeOnEscKey=yes', function(confirm){
            if (confirm) {
                var restoreURL = _self.t_obj.options.restoreURL ? _self.t_obj.options.restoreURL : (_self.t_obj.options.entity_name + "/restore_from_trash");
                var url = _self.t_obj.options.defaultpath + restoreURL + '?ids=' + ids.toString(); // No I18N
                sdpAjax({
                    url: url, //No I18N
                    type: "PUT", //No I18N
                    success: function (obj) {
                        // var resp = obj.response_status;
                        var success_msg = _self.t_obj.options.entity_display_name ? _self.localTranslate("sdp.restore.success", [e_html(_self.t_obj.options.entity_display_name)]) : _self.localTranslate("sdp.requests.history.restored");
                        showalert('success', success_msg, "isAutoHide=true"); // No I18N
                        _self.refreshTable("refresh"); //NO I18N
                        // restore action callback
                        if(typeof _self.t_obj.options.callbackAfterRestore === "function"){
                            _self.callbackEmberNonember(_self.t_obj.options.callbackAfterRestore);
                        }
                    }
                });
            }
        });
    },
    constructGroupBy: function () {
        var _self = this;
        var group_by_options = _self.t_obj.options.group_by_settings.fields;
        var group_by_metainfo = _self.t_obj.options.group_by_settings.metainfo || {};
        var table_metainfo = _self.t_obj.available_minfo_fields;
        var groupByStr = '<span class="mr5" data-i18n-key="sdp.reports.customReport.chooserowone">'+translate("sdp.reports.customReport.chooserowone")+'</span>';                
        groupByStr += '<input id="select_groupBy_' + _self.tableId + '" class="form-control w-180px">';

        var select_groupBy_options = [];
        for (var iter = 0; iter < group_by_options.length; iter++) {
            var field = group_by_options[iter];
            if (!group_by_metainfo[field]) {
                group_by_metainfo[field] = {};
            }
            //array of options: id, text
            select_groupBy_options[iter] = {};
            select_groupBy_options[iter].id = field;
            select_groupBy_options[iter].text = table_metainfo[field] ? (table_metainfo[field].display_name || group_by_metainfo[field].display_name) : group_by_metainfo[field].display_name;
        }
        _self.t_obj.options.group_by_settings.metainfo = group_by_metainfo;
        var groubByDiv = jQ("#groupby_" + _self.tableId);
        var groupByStrElem = table_comp.applyDataStyle(groupByStr); 
        groubByDiv.empty().append(groupByStrElem);//No I18N
    
        jQ("#select_groupBy_" + _self.tableId).select2({ placeholder: translate("sdp.change.sla.select"), allowClear: true, data: select_groupBy_options });
        jQ("#select_groupBy_" + _self.tableId).on("change", function (param) {// No I18N   
            if (param.added) {
                var sort_by = group_by_metainfo[param.added.id].sort_order;
                _self.groupbySelected(param.added.id, sort_by);
            }
            else {
                jQ("#group_sort_by_" + _self.tableId).remove();
                _self.t_obj.options.groupBy = {};
                _self.refreshTable("refresh");
            }
        });
    },
    groupbySelected: function (group_by_option, sort_by) {
        var _self = this;
        var title_sort_by;
        var sort_by_class;
        var sort_by_class_old;
        if (sort_by == "desc") {
            title_sort_by = translate("common.sortby.ascending");
            sort_by_class = "desc1";
            sort_by_class_old = "asc";
        }
        else {
            sort_by = "asc";
            title_sort_by = translate("common.sortby.descending");
            sort_by_class = "asc";
            sort_by_class_old = "desc1";
        }
        if (jQ("#group_sort_by_" + _self.tableId).length == 0) {
            var sortIcon = '<button type="button" id="group_sort_by_' + _self.tableId + '" class="btn btn-default btn-sm task-sort-by pt3 ml-1" rel="uitip" title="' + title_sort_by + '" data-sortOrder="' + sort_by + '" > <span class="cspr ' + sort_by_class + ' icon-sm vmiddle top-1 right1"></span></button>';
            let groupByDiv = jQ("#groupby_" + _self.tableId);
            let sortIconElem = table_comp.applyDataStyle(sortIcon);
            groupByDiv.append(sortIconElem);

            jQ("#group_sort_by_" + _self.tableId).on('click', function () { // No I18N                
                var current_sort_order = jQ(this).attr('data-sortOrder');
                var new_sort_order = (current_sort_order == "asc") ? "desc" : "asc";
                if (_self.t_obj.options.groupBy.field) {
                    _self.groupbySelected(_self.t_obj.options.groupBy.field.field, new_sort_order);
                    group_by_metainfo[_self.t_obj.options.groupBy.field.field].sort_order = new_sort_order;
                }
                else {
                    _self.groupbySelected(group_by_option, new_sort_order);
                    group_by_metainfo[group_by_option].sort_order = new_sort_order;
                }

            });
        }
        else {
            var old_sort_order = jQ("#group_sort_by_" + _self.tableId).attr('data-sortOrder');
            if (old_sort_order != sort_by) {
                jQ('#group_sort_by_' + _self.tableId).attr('title', title_sort_by);
                jQ('#group_sort_by_' + _self.tableId).attr('data-sortOrder', sort_by);
                jQ('#group_sort_by_' + _self.tableId + ' > span').removeClass(sort_by_class_old).addClass(sort_by_class);
            }
        }
        var group_by_metainfo = _self.t_obj.options.group_by_settings.metainfo;
        var group_str = group_by_metainfo[group_by_option].transformer;
        _self.t_obj.options.groupBy = { field: { field: group_by_option, order: sort_by }, transformer: group_str };
        _self.refreshTable("refresh");
    },
    addGroupBy: function (groupByField, groupProcessedRow, rowData, h_d) {
        var _self = this;
        // Construct the callback function
        var arr_arg = {};
        arr_arg.head_data = h_d;
        arr_arg.row_data = rowData;
        if (_self.t_obj.options.groupBy.transformer)
            return _self.callbackEmberNonember(_self.t_obj.options.groupBy.transformer, arr_arg);
        else
            return _self.defaultGroupByTransformer(groupByField, arr_arg);
    },
    defaultGroupByTransformer: function (groupByField, info) {
        var _self = this;
        var table_metainfo = _self.t_obj.available_minfo_fields;
        return '<span class="sb">' + e_html(table_metainfo[groupByField].display_name) + ' : ' + e_html(info.row_data[groupByField].name) + '</span>';
    },
    checkGroupBy: function (groupProcessedRow, rowData, groupByField) {
        var _self = this;
        var table_metainfo = _self.t_obj.available_minfo_fields;
        if (table_metainfo[groupByField].type == "boolean") {
            if (groupProcessedRow[groupByField] != rowData[groupByField]) {
                // Add Reference for the processed group by field value
                groupProcessedRow[groupByField] = rowData[groupByField];
                return true;
            }
            return false;
        }
        else if (table_metainfo[groupByField].type == "lookup") {
            if (groupProcessedRow[groupByField] != rowData[groupByField].name) {
                // Add Reference for the processed group by field value
                groupProcessedRow[groupByField] = rowData[groupByField].name;
                return true;
            }
            return false;
        }
    },
    toggleSearchRow: function (toShowOrHide,focusElementId) { 
        //Toggle search row i.e) (show/hide)
        var _self = this,isOpen;
        var $searchRow = jQuery("table#" + _self.tableId +" .searchRow",_self.tblContainer);
        function triggerSearchRowEvent(status){
            $searchRow.trigger('searchRowToggle',[status]);
            _self.isSearchVisible = status;
        }
        if($searchRow.css('display') == 'none'){
            $searchRow.addClass('hide'); //No I18N
            $searchRow.css('display',''); //No I18N
        }

        isOpen = !$searchRow.hasClass('hide');

        if(toShowOrHide == 'closeSearchbox'){
             $searchRow.addClass('hide'); //No I18N
             triggerSearchRowEvent(false); // false means search row is closed
             return;
        }

        if(isOpen ==  toShowOrHide) {
            return; //skip same state, already opened or closed
        }


        $searchRow.toggleClass('hide'); //No I18N

        isOpen = !$searchRow.hasClass('hide');

        if (isOpen) {
            //open state
            // To do focus input, default first one or given input field
            var inputSelector = focusElementId ?  'td input[data-id="' + searchTextId + '"]' : 'td div input:first';
            jQuery(inputSelector,$searchRow).trigger('focus');
        } else {
            //close state
            //clear the input values
            $searchRow.find("input").val(""); //No I18N
            //Rest the search input values when the search is closed or not values entered
            _self.changeFilterString("clearSearch",'searchToggle');
            _self.search_ele_values = {};
        }
        
        triggerSearchRowEvent(isOpen);
        return isOpen;
    },
    changeFilterString: function (action,isFrom) { //SearchRow textbox KEYUP event
        var _self = this;
        if (action == 'Enter' || action === "defaultSearch" || action === "clearSearch" || action === "stateSearch" || action === "clearOnly") { //When 'ENTER' key is pressed , search will trigger

            var search_fields = {},
                meta_info = _self.t_obj.meta_info;
            var searchEleArray = jQ('table#' + _self.tableId + ' .searchRow:first input.default-inline-search:not(:disabled)'); // No I18N
            if (action === "stateSearch") {
                search_fields = _self.t_obj.table_info.list_info.search_fields;
                if(_self.t_obj.options.support_search_criteria){
                    /**
                     * When listview render with url search will retain the search for display the value in the search rows.
                     * So we extract the search criteria back to search fields
                     */

                    search_fields = _self.extractSearchCriteria(_self.t_obj.table_info.list_info.search_criteria);
                }
                for (var i = 0; i < searchEleArray.length; i++) {
                    var eleId = jQ(searchEleArray[i]).attr('data-id');
                    if (meta_info[eleId] && meta_info[eleId].type === "lookup" && meta_info[eleId].lookup_field) {
                        eleId = eleId + "." + meta_info[eleId].lookup_field;
                    }
                    jQ(searchEleArray[i]).val((search_fields && search_fields[eleId]) ? search_fields[eleId] : "");
                }
            } else {
                for (var i = 0; i < searchEleArray.length; i++) {
                    let columnVal = "";
                    let searchElem = searchEleArray[i];
                    let unit = searchElem.dataset.unitValue;
                    let eleId = searchElem.dataset.id;

                    if (action === "clearSearch" || action === "clearOnly") {
                        searchElem.value='';
                    } else {
                        columnVal = searchElem.value.nativeTrim();
                    }
                    if (columnVal.length) {
                        if (_self.t_obj.options.isODAPI && meta_info[eleId] && meta_info[eleId].type === "lookup" && meta_info[eleId].lookup_field) {
                            eleId = eleId + "." + meta_info[eleId].lookup_field;
                        }
                         //support inline search for memory type field search criteria values in array eg [{value:'70',unit:'GB'}]
                        let value = unit ? [{ value:columnVal, unit:unit }] : columnVal;
                        search_fields[eleId] = value;
                    }
                }

                if(_self.t_obj.options.enablePickListSearch ) {
                    let plAllowClearActions = ['clearSearch','clearOnly']; // list of allowed clear action list
                    //clearOnly - when filter change
                    //clearSearch - when search close by click search icon button in list control
                    plAllowClearActions.includes(action) && _self.clearInlinePLSearchCriteria();
                }
                _self.t_obj.table_info.list_info.start_index = 1;
            }
            var def_searchField = _self.t_obj.table_info.default_searchfields;
            var plSearchCriteria = _self.plSearchCriteria;
            if (jQ.isEmptyObject(search_fields) && !plSearchCriteria) {
                if (def_searchField == null) {
                    delete _self.t_obj.table_info.list_info.search_fields;
                } else {
                    _self.t_obj.table_info.list_info.search_fields = def_searchField;
                }
                let isFromSearchToggle = isFrom == 'searchToggle';
                if(!isFromSearchToggle) {
                    action == 'clearSearch' ? _self.toggleSearchRow('closeSearchbox') : _self.toggleSearchRow(false);
                    if(action == 'Enter'){
                        return;
                    }
                } 
            } else {
                let isFromSearchToggle = isFrom == 'searchToggle';
                !isFromSearchToggle && _self.toggleSearchRow(true);
                _self.t_obj.table_info.list_info.search_fields = jQ.extend({}, def_searchField, search_fields);
            }
            if (_self.t_obj.options.urlSearch && action !== "stateSearch") {
                _self.setPushStateObj(action);
            }
            if (_self.t_obj.options.support_search_criteria) {
                var search_criteria = _self.convertFieldsIntoCriteria(_self.t_obj.table_info.list_info.search_fields);
                if (jQuery.isEmptyObject(search_criteria)) {
                    delete _self.t_obj.table_info.list_info.search_criteria;
                } else {
                    delete _self.t_obj.table_info.list_info.search_fields;
                    _self.t_obj.table_info.list_info.search_criteria = search_criteria;
                }
            }
            if (action !== "clearOnly") {
                if (typeof _self.t_obj.options.callbackSearchFunction === "function") {
                    _self.callbackEmberNonember(_self.t_obj.options.callbackSearchFunction, "tableSearch");
                } else {
                    _self.updateTableInfoPeronalization("search"); //No I18N
                }
            }
        }
    },
    setDefaultSearchCriteria:function(search_criteria){
        var _self = this;
        _self.t_obj.default_search_criteria = search_criteria;
    },
    getDefaultSearchCriteria:function(search_criteria) {
        var _self = this;
        var defaultCriteria = _self.t_obj.default_search_criteria;
        var copyBase = Array.isArray(defaultCriteria) ? [] : {};
        return defaultCriteria  && Object.assign(copyBase,defaultCriteria) || search_criteria;
    },
    convertFieldsIntoCriteria: function (search_Obj,action) {
        var _self = this;
        var defaultCriteria = _self.getDefaultSearchCriteria(),critChildArray = [];
        var search_criteria = defaultCriteria && !Array.isArray(defaultCriteria) ?  defaultCriteria : {};
        var meta_info = _self.t_obj.meta_info;
        if(action == 'k_reset') {
            //clear search criteria for reset btn click
            return search_criteria;
        }
        //condition eq allowed field types
        const  allowedTypes = ["int", "long", "double", "icon", "boolean"];

        jQuery.each(search_Obj, function (key, value) {
            var condition = "contains";
            var fld_meta = "";
            if (key.indexOf(".") != -1) {
                fld_meta = table_comp.getFieldsRequiredByString(meta_info, key);
            } else {
                fld_meta = meta_info[key];
            }
            // when discard files are provided in options those fields are not available in _self.t_obj.meta_info 
            // to handle for inactive and active case in admin 
            if(!fld_meta && _self.t_obj.available_minfo_fields) {
                fld_meta = _self.t_obj.available_minfo_fields[key];
            }

            if(!fld_meta && _self.t_obj.options.callbackGetType) {
                fld_meta = _self.t_obj.options.callbackGetType(key);
            }
            
            if (fld_meta && allowedTypes.includes(fld_meta.type)) {
                condition = "eq";
            }

            var crit_Obj = {
                "field": key, // No I18N
                "value": value, // No I18N
                "condition": condition, // No I18N
                "logical_operator": "AND" // No I18N
            }
            if(Array.isArray(value)) {
                crit_Obj.values = value;
                crit_Obj.condition = 'eq';
                delete crit_Obj.value;
            }

            // support inline search for memory type field
            if(fld_meta && fld_meta.type == 'memory') {
                //for memory field condition - `is`
                crit_Obj.condition = 'is';
            }

            if (jQuery.isEmptyObject(search_criteria)) {
                search_criteria = crit_Obj;
            } else {
                critChildArray.push(crit_Obj);
            }
        });
        if (critChildArray.length > 0) {
            search_criteria.children = critChildArray;
        }
        if(Array.isArray(defaultCriteria) && defaultCriteria.length && !jQuery.isEmptyObject(search_criteria)) {
            search_criteria = defaultCriteria.concat(search_criteria);
        } else if(defaultCriteria) {
            search_criteria = defaultCriteria;
        }

        //To add inline Picklist search criteria to existing search criteria
        if(_self.t_obj.options.enablePickListSearch) {
            search_criteria = _self.addInlinePLSearchCriteria(search_criteria);
        }

        return search_criteria;
    },
    /**
     * 
     * @param {Object} obj 
     * @returns extracted field and value from the search criteria
     */
    extractSearchCriteria: function (obj) {
        const pairs = {};
        function traverse(obj) {
            for (const key in obj) {
              if (typeof obj[key] === "object") {
                traverse(obj[key]);
              } else if (key === "field") {
                const value = obj.value || obj.values || "";
                pairs[obj[key]] = value;
              }
            }
          }
        traverse(obj);
        return pairs;
    },
    getLoadingTemplate:function(){
        let loadingTemplate = "<div class='fh freezelayerbg2 fw opac3 pos-abs top0 z-ind1'></div>" + ajaxBar();
        return loadingTemplate;
    },
    updateTableInfoPeronalization: function (arg) {
        var _self = this;
        _self.t_obj.table_info.list_info = _self.listInfoConstructToAPI(false, arg);
        if (arg === "colchooser") {
            _self.t_obj.options.row_inputdata = _self.callbackEmberNonember(_self.t_obj.options.callbackRowfunction, _self.t_obj.table_info);
            jQ("#t_column_choos_" + _self.tableId + "> .btn-group").trigger('click');
            jQ('#' + _self.tableId + '_scrollbardiv').scrollTop(0).hide();  // No I18N
            var tBodyDiv = jQ('#' + _self.tableId + '_body',_self.tblContainer);
            let loadingElement = jQ(_self.getLoadingTemplate());
            //To show loading icon in middle hieght of the table
            loadingElement.filter('.loading1').css('top', '50%'); // No I18N
            tBodyDiv.empty().append(loadingElement); // No I18N


            var combined_settings = _self.t_obj.options.combined_settings;
            if (combined_settings) {
                var inputObject = jQuery.extend({}, _self.t_obj.options.row_inputdata);
                _self.getCombinedAPIInputObject(false, inputObject);
            }
        }
        //Timeout is added to show loader while synchronous calls happen
        //setTimeout(function(){
        if (arg !== "next" && arg !== "previous" && arg !== "search" && arg !== "refresh" && _self.t_obj.options.personalize_key) {
            _self.t_obj.options.personalize_key && _self.addPersonalizeData(_self.t_obj.table_info);
        }
        // Personalized the pagination index
        if(_self.t_obj.options.isPersonalizePagination && ( arg == "next" || arg == "previous")){
            _self.addPersonalizeData(_self.t_obj.table_info);
        }
        if (arg === "colchooser") {
            /** check to retain the search values when applying the column chooser */
            var isSearhVisible = jQ('table#' + _self.tableId + ' .searchRow:first').is(':visible')
            if(isSearhVisible){
                var meta_info = _self.t_obj.meta_info;
                _self.search_ele_values = {};
                if(_self.t_obj.options.enablePickListSearch) {
                    _self.clearInlinePLSearchCriteria(); //for column chooser change column, clearing the picklist Search criteria.
                }
                var searchEleArray = jQuery('table#' + _self.tableId + ' .searchRow:first input.default-inline-search:not(:disabled)');
                for (var i = 0; i < searchEleArray.length; i++) {
                    var eleId = jQ(searchEleArray[i]).attr('data-id');
                    //check to only allowed selected column search value in the search referenance 
                    var colId = eleId.indexOf('_fields.') ===  -1 ? eleId.split('.')[0] : eleId;
                    if(_self.t_obj.table_info.column_order.includes(colId)){
                        if (meta_info[eleId] && meta_info[eleId].type === "lookup" && meta_info[eleId].lookup_field) {
                            eleId = eleId + "." + meta_info[eleId].lookup_field;
                        }
                        var inputValue = jQ(searchEleArray[i]).val() || "";
                        if(inputValue){
                            _self.search_ele_values[eleId] = inputValue;
                        }
                    }
                }
            }
            _self.setupHeaderColumns();
            
            if(_self.search_ele_values && Object.keys(_self.search_ele_values).length > 0){
                jQ('table#' + _self.tableId + ' .searchRow:first').show();
            }
            //If search row is visible will trigger search based data fetch..
            if(isSearhVisible){
                _self.changeFilterString('defaultSearch');
                return;
            }
        } else {
            _self.t_obj.options.row_inputdata.list_info = _self.t_obj.table_info.list_info;
        }
        if (_self.t_obj.options.view == "kanban") {
            var combined_settings = _self.t_obj.options.combined_settings;
            var parentComponent = combined_settings && combined_settings.parentComponent ? table_comp.getFieldsRequiredByString(window, combined_settings.parentComponent) : _self;
            if (parentComponent.selectedId) {
                parentComponent.t_obj.options.selectedId = parentComponent.selectedId;
            }
            var kanbanCallback;
            if (arg == "sorting") {
                kanbanCallback = function(){
                    _self.updatePaginationDetails();
                }
            }
            parentComponent.constructKanbanContent(null, null, arg,kanbanCallback);

        } else {
            _self.constructRowContent(arg);
            if (_self.t_obj.options.paginationEnabled && arg !== "colchooser" && arg !== "sorting") {
                _self.updatePaginationDetails(arg);
            }
        }
        
        if (!kanbanCallback && arg == "sorting") {
                setTimeout(function () {
                    _self.updatePaginationDetails();
            }, 500);
        }
        //},10);
    },
    listInfoConstructToAPI: function (isGetTotalCount, action) {
        /*Constructing list_info to be personalized*/
        var _self = this;
        var search_fields = {};
        var list_info = {};
        var t_li = _self.t_obj.table_info.list_info;
        var defatulCriteria = _self.getDefaultSearchCriteria();

        if(action == 'k_reset') {
             t_li.search_criteria = defatulCriteria || {};
        }

        if (t_li.row_count) {
            list_info.row_count = t_li.row_count;
            list_info.start_index = action == "sorting" ? 1 : t_li.start_index;
        }
        if (t_li.get_total_count) {
            list_info.get_total_count = t_li.get_total_count;
        }
        if (!jQ.isEmptyObject(t_li.search_fields)) {
            list_info.search_fields = t_li.search_fields;
        } else if (!jQ.isEmptyObject(t_li.search_criteria)) {
            list_info.search_criteria = t_li.search_criteria;
        }

        var sort_field = t_li.sort_field;
        if (!isGetTotalCount && sort_field !== undefined && sort_field !== "") {
            list_info.sort_field = t_li.sort_field;
            list_info.sort_valuepath = t_li.sort_valuepath;
            list_info.sort_order = t_li.sort_order;
        } else if(!isGetTotalCount && t_li.sort_fields) {
            list_info.sort_fields = t_li.sort_fields;
        }

        if (t_li.filter != undefined) {
            list_info.filter = t_li.filter;
        }
        if (t_li.filter_by != undefined) {
            list_info.filter_by = t_li.filter_by;
            /** When custom view flag enabled will send the view_info instead of filter_by*/
            if(_self.t_obj.options.isCustomView){
                list_info.view_info = t_li.filter_by;
                delete list_info.filter_by;
            }
        }
         //To support asset module custom filter by
        if (t_li.asset_filter_by != undefined) {
            list_info.asset_filter_by = t_li.asset_filter_by;
        }
        if (t_li.additional_params != undefined) {
            list_info.additional_params = t_li.additional_params;
        }
        if (!jQ.isEmptyObject(t_li.group_by)) {
            list_info.group_by = t_li.group_by;
        }
        if (t_li.gsearch != undefined) {
            list_info.gsearch = t_li.gsearch;
        }

        return list_info;
    },
    deleteRecords: function (entity_id) {
        var _self = this;
        var template_ids = [];
        if (entity_id) {
            template_ids = entity_id;
        } else if (_self.t_obj.options.isBulkSelectEnabled) {
            template_ids = _self.bulkSelect.getSelectedIDs();
        } else {
            template_ids = jQ("#" + _self.tableId + "_body input[type='checkbox'][data-table-checkbox]:checked").map(function () {
                return this.value;
            }).get();
        }
        //variabe to check the bulk summary setting enable and only trigger if more then 1 data should be delete
        var isbulkSummaryEnabled = _self.t_obj.options.isBulkSelectEnabled && _self.t_obj.options.bulk_action_summary && !entity_id && template_ids.length > 1;
        /** Before delete callback */
        if(_self.t_obj.options.hasOwnProperty('deleteOption') && typeof _self.t_obj.options.deleteOption.beforeDelete === "function"){
            _self.t_obj.options.deleteOption.beforeDelete(_self,template_ids);
        }
        if (template_ids.length > 0) {
            var deleteURL = _self.t_obj.options.deleteURL ? _self.t_obj.options.deleteURL : _self.t_obj.options.entity_name;
            var deletemsg =  _self.t_obj.options.deleteOption &&  _self.t_obj.options.deleteOption.delete_message ? _self.localTranslate(_self.t_obj.options.deleteOption.delete_message) : _self.localTranslate("common.delete.confirm");
            deletemsg = e_html(deletemsg);
            /** if comma present in the confirm message, option for showconfirm spliting and not showing the message properly. So, to prevent check the comma and changed to hex code */
            if(deletemsg.indexOf(",") > 0){
                deletemsg = deletemsg.replace(/,/g,"&#x2c;");
            }
             //update table view - call in success and error case to handle (TFA) Two Factor Authentication case to work
            var updateView = ()=>{
                jQuery('#' + _self.tableId + '_body').html("");
                // delete when the kanban view have multidelete enable
                _self.t_obj.options.view === "kanban" ? _self.constructKanbanContent(false,false): _self.constructRowContent(); //No I18N
                if (_self.t_obj.options.paginationEnabled) {
                    _self.updatePaginationDetails();
                }
                if (_self.t_obj.options.isBulkSelectEnabled) {
                    _self.bulkSelect.resetSelectedRecords();
                    _self.bulkSelect.unSelectAll();
                }
                if(_self.t_obj.options.delete_callback){
                    _self.callbackEmberNonember(_self.t_obj.options.delete_callback);
                }
            }
            showconfirm(true, 'title='+translate("common.confirm")+', message=' + deletemsg + ', submitbutton='+translate('sdp.common.ok')+', cancelbutton='+translate('sdp.common.cancel')+', closebutton=yes, closeOnEscKey=yes', function(confirm){
				if(confirm) {
                    var tBodyDiv = jQ('#' + _self.tableId + '_body',_self.tblContainer);
                    var loadingElem = _self.getLoadingTemplate();
                    loadingElement = table_comp.applyDataStyle(loadingElem);
                    //To show loading icon in middle hieght of the table
                    loadingElement.filter('.loading1').css('top', '50%'); // No I18N
                    tBodyDiv.empty().append(loadingElement); // No I18N

                    setTimeout(function(){
                        var callback=_self.t_obj.options && _self.t_obj.options.callback && _self.t_obj.options.callback["delete"];
                            sdpAjax({
                                url: _self.t_obj.options.defaultpath + deleteURL + '?ids=' + template_ids, // No I18N
                                type: 'DELETE', //No I18N
                                success: function (obj) {
                                    
                                    if(callback && callback.success){
                                        _self.callbackEmberNonember(callback.success, obj);
                                        updateView();
                                        return;
                                    }
                                        //bulk delete records summary info
                                    if(isbulkSummaryEnabled){
                                        _self.showUpdateOrDeleteSummary(obj, "delete");
                                        updateView();
                                        return;
                                    }else{
                                        _self.showRespDialog(obj);
                                        updateView();
                                    }
                                    _self.t_obj.options.row_inputdata.list_info.start_index = 1;
                                },
                                error: function (result) {
                                    if(callback && callback.error){
                                        _self.callbackEmberNonember(callback.error, result);
                                        updateView();
                                        return;
                                    }
                                    //bulk delete records summary info
                                    if(isbulkSummaryEnabled){
                                        _self.showUpdateOrDeleteSummary(result.responseJSON, "delete");
                                        updateView();
                                        return;
                                    }
                                    _self.handleErrorMsg(result);
                                    updateView();
                                },
                                async: false,
                                acceptODCompatible : _self.t_obj.options.acceptODCompatible,
                                // ignore the failure message when bulk summary action preform 
                                ignorefailuremessage: isbulkSummaryEnabled
                            });
                }, 1);
				}
			},true);
        } else {
            showalert('failure', translate("common.delete.atleastone"), 'isAutoHide=false');
        }
    },

    handleErrorMsg: function (resp, custom_options) {
        var _self = this;
        var results = resp.responseJSON.response_status;
        var failedEntityIds = [], failureMsg = translate('common.delete.failure.msg'), entityNameMsg = "";
        var failedMsgs = "";
        var availableRecords = this.loadedRecords, delete_msg_display_field = "";
        if (this.t_obj) {
            if (this.t_obj.options.isBulkSelectEnabled) {
                availableRecords = this.bulkSelect.loadedRecords;
            }
            delete_msg_display_field = this.t_obj.options.delete_msg_display_field;
        }
        if (custom_options || (this.t_obj && this.t_obj.options.delete_entity_name)) {
            if (this.t_obj && this.t_obj.options.delete_entity_name) {
                entityNameMsg = this.t_obj.options.delete_entity_name;
            }
            for (var i = 0; i < results.length; i++) {
                if (results[i].messages && (results[i].messages[0].status_code == 4004 || results[i].messages[0].status_code == 4005 || (custom_options && custom_options.status_code.indexOf(results[i].messages[0].status_code) != -1))) {
                    failedEntityIds.push(results[i].id);
                } else if (results[i].status != "success") {
                    if(this.t_obj.options.skipIDInErrorMsg){
                        failedMsgs += e_html(results[i].messages[0].message) + "<br/>";
                    } else if (delete_msg_display_field) {
                        var fieldValue = table_comp.getFieldsRequiredByString(availableRecords[results[i].id] || {}, delete_msg_display_field);
                        failedMsgs += e_html(fieldValue) + " - " + e_html(results[i].messages[0].message) + "<br/>";
                    } else if (this.t_obj.options.skipIDInErrorMsg) {
                        failedMsgs += e_html(results[i].messages[0].message) + "<br/>";
                    } else {
                        failedMsgs += "[" + results[i].id + "] - " + e_html(results[i].messages[0].message) + "<br/>";
                    }
                }
            }
            if (failedEntityIds && failedEntityIds.length > 0) {
                var failureMessageCB = custom_options && custom_options.error_message;
                if (failureMessageCB) {
                    failureMsg = _self.callbackEmberNonember(failureMessageCB, failedEntityIds);
                } else {
                    entityNameMsg = entityNameMsg + '-' + '[' + failedEntityIds + ']';
                    failureMsg = translate('delete.entity.failure.msg', [entityNameMsg]);
                }
            }
            else if (failedMsgs) {
                failureMsg = "";
            }
        } else if(results && jQ.isPlainObject(results)) {
            // Handle the case when results is an object
            if (results.messages && results.messages[0].message) {
                failureMsg = results.messages[0].message;
            }
        } else {
            if (results[0].messages && results[0].messages[0].message) {
                failureMsg = results[0].messages[0].message;
            }
        }
        var msg = e_html(failureMsg);
        if (failedMsgs) {
            msg = msg ? msg + "<br>" + failedMsgs : failedMsgs;
        }
        showalert('failure', msg, 'isAutoHide=false');
    },

    showRespDialog: function (obj) {
        var _self = this;
        var resp = obj.response_status;
        if (this.t_obj.options.delete_entity_name) {
            var failedEntityIds = [], failedEntityMsg = '', availableRecords = _self.loadedRecords, delete_msg_display_field = _self.t_obj.options.delete_msg_display_field;
            if (_self.t_obj.options.isBulkSelectEnabled) {
                availableRecords = _self.bulkSelect.loadedRecords;
            }
            if (Array.isArray(resp)) {
                for (var i = 0; i < resp.length; i++) {
                    if (resp[i].messages && resp[i].messages[0] && resp[i].messages[0].status_code == 4005) {
                        failedEntityIds.push(resp[i].id);
                      if(i>0 && failedEntityIds.length > 1){
                            failedEntityMsg += '<br>';
                        }
                        failedEntityMsg += '<b>' + (availableRecords[resp[i].id][delete_msg_display_field] ? e_html(availableRecords[resp[i].id][delete_msg_display_field]) : (availableRecords[resp[i].id].name ? e_html(availableRecords[resp[i].id].name) : resp[i].id)) + '</b> - ' + e_html(resp[i].messages[0].message);
                    }
                }
            }
            if (failedEntityIds.length > 0) {
                showalert('failure', failedEntityMsg, 'isAutoHide=false');
            } else if (resp.status != "Failed" || resp.status_code == 2000) {
                showalert('success', _self.localTranslate("common.delete.success"), "isAutoHide=true"); // No I18N
            } else {
                showalert('failure', e_html(resp.messages[0].message)); // No I18N
            }
        } else if (resp.status != "Failed" || resp.status_code == 2000) {
            showalert('success', _self.localTranslate("common.delete.success"), "isAutoHide=true"); // No I18N
        } else {
            showalert('failure', e_html(resp.messages[0].message)); // No I18N
        }
        return;
    },
    bindChkboxEvent: function () {
        var _self = this,options=_self.t_obj.options, isBulkSelectEnabled = options.isBulkSelectEnabled;
        var eventNamespace = _self.eventNamespace = '.table-component_'+_self.tableId;
        var getTableDiv = ()=>{
            return options.view == "kanban" ? "#" + _self.tableId + "_kanban_div .cv-task-item" : "#" + _self.tableId + "_body >tr.tc-row td " ;
        }
        var tableDiv = getTableDiv();
        var getCheckboxes = ()=>jQ(tableDiv+" input[type='checkbox'][data-table-checkbox]:not([disabled])");   //No I18N
        var headerCheckBox = jQ('#' + _self.tableId + "_head_chk").prop('checked', false); //No I18N
        //By default enable all buttons and links
        jQ('#' + _self.tableId + "_btn_delete,[data-link='" + _self.tableId + "']").prop('disabled', true); //No I18N


        //Table row selection change
        function rowSelection() {
            var checkBox = this;
            var isChecked = checkBox.checked;
            var checkBoxes = getCheckboxes();
            var totalCount = checkBoxes.length;
            var updateHeaderCheckbox = (isChecked)=> {
                //update header checkbox checked when all are checked
                var isAllSelected =()=>(checkBoxes.filter(":checked").length === totalCount);
                var status = isChecked ? isAllSelected() : false;
                totalCount > 0 && headerCheckBox.prop( "checked", status ); //No I18N
            }
            var highlightRow = (isSelected)=>{
                //isSelected true/false - highlight selected row by add class selected-row
                var tr = jQ(checkBox).closest(".tc-row");
                isSelected ? tr.addClass("selected-row") : tr.removeClass("selected-row");
            }
            var buttonsEnableDisable = ()=>{
                //button enable disable respective to checkbox check/unchecked for bulkselect not enabled case
                if(!isBulkSelectEnabled) {
                    var isSelected = jQ(tableDiv).find('input').is(":checked");
                    jQ('#' + _self.tableId + '_btn_delete, [data-link="' + _self.tableId + '"]')
                    .prop('disabled', !isSelected);
                }
            }
            var bulkSelectAddRemove = (status)=> {
                //bulk selection add or remove according to isChecked
                var bulkSelect = _self.bulkSelect;
                var add = ()=>{
                    if(!bulkSelect.selectRecord(checkBox)) {
                        //it stop selection when max selection limit reached
                        checkBox.checked = isChecked = false;
                    }
                }
                var remove =()=> bulkSelect.removeRecord(checkBox.value,checkBox);

                isBulkSelectEnabled && (status ? add() : remove());
            }

            bulkSelectAddRemove(isChecked); // add or remove bulk selection
            highlightRow(isChecked); // highlight selected row
            updateHeaderCheckbox(isChecked); //update header checkbox check/uncheck
            buttonsEnableDisable();///button enable disable 
        }

        //Row checkbox change event
        jQ(tableDiv)
        .off('change'+eventNamespace)
        .on('change'+eventNamespace,"input[type='checkbox'][data-table-checkbox]", rowSelection);

    },
    addPersonalizeData: function (table_info, is_customview) {
        /*POST Personalization API call*/
        var _self = this;
        if (table_info) {
            var tbl_inf = {},
                list_info = {},
                t_l = table_info.list_info;
            var personalize_key = _self.t_obj.options.personalize_key;
            var combined_settings = _self.t_obj.options.combined_settings;
            if (combined_settings) {
                var parentComponent = combined_settings.parentComponent ? table_comp.getFieldsRequiredByString(window, combined_settings.parentComponent) : _self;
                personalize_key = parentComponent.t_obj.options.personalize_key;
                tbl_inf.combined_modules_object = parentComponent.t_obj.options.combined_settings.combined_modules_object;
            } else {
                if (table_info.fields_required) {
                    // Filters the fields_required object to include only keys with width and is_inmeta properties,for to avoid extra key found error while personalization
                    const filterFieldsRequired = (fields) => {
                        let fields_required = {};
                        let copyKey =key => {
                            fields_required[key] = {};
                            if (fields[key].width) {
                                fields_required[key].width = fields[key].width;
                            }
                            if (fields[key].is_inmeta) {
                                fields_required[key].is_inmeta = fields[key].is_inmeta;
                            }
                        }
                        Object.keys(fields).filter((field)=>field.length).forEach(copyKey);
                        return fields_required;
                    }

                    tbl_inf.fields_required = filterFieldsRequired(table_info.fields_required);
                }
                if (table_info.column_order != undefined) {
                     /** SD-104929 allow only the selected column should be save in the personalization */
                     tbl_inf.column_order = _self.getColumnOrder(table_info.column_order, table_info.fields_required);
                }
            }
            list_info.start_index = 1;
            if(_self.t_obj.options.isPersonalizePagination){
                list_info.start_index = t_l.start_index;
            }
            if (t_l.row_count && _self.t_obj.options.paginationEnabled) {
                list_info.row_count = t_l.row_count;
            }
            if (t_l.sort_field) {
                list_info.sort_field = t_l.sort_field;
                list_info.sort_order = t_l.sort_order;
            }
            if (t_l.filter) {
                list_info.filter = t_l.filter;
            }
            if (t_l.filter_by && t_l.filter_by.name != "trash") {
                list_info.filter_by = t_l.filter_by;
            }
            if (table_info.refresh_time != undefined) {
                tbl_inf.refresh_time = table_info.refresh_time;
            }

            if (table_info.custom != undefined) {
                tbl_inf.custom = table_info.custom;
            }

            if (table_info.list_settings) {
                tbl_inf.list_settings = table_info.list_settings;
            }

           _self.TimeFilter && _self.TimeFilter.addPersonalize(tbl_inf);

            tbl_inf.list_info = list_info;
            if (typeof _self.t_obj.options.personalizeCallback == "function") {
                var callback_input = _self.cloneObject(tbl_inf);
                tbl_inf = _self.callbackEmberNonember(_self.t_obj.options.personalizeCallback, callback_input);
            }
            if(_self.checkCustomViewEnabled() && !is_customview){
                return;
            }

            ClientUtil.addUserPersonalization('table_component', tbl_inf,{internalKey:_self.t_obj.options.personalize_key});

        }
        return true;
    },
    cloneObject:function(data) {
        // Workaround -  double quote issue for array value which is overwrite in prototype.js '{"column_order":"[\\"name\\"]"}'
        let originalArrayToJSON = Array.prototype.toJSON;
        delete Array.prototype.toJSON;

        data = jQuery.extend(true, {}, data);
         //revert back
        originalArrayToJSON &&  (Array.prototype.toJSON = originalArrayToJSON);

        return data;
    },
    selectAllCheckbox: function () {
        /* Select All checkbox*/
        var _self = this;
        jQ("#" + _self.tableId + "_body >tr.tc-row td input[type='checkbox'][data-table-checkbox]:not([disabled])").prop('checked', jQ("#" + _self.tableId + "_head_chk").is(":checked"));
        var ischecked = jQ("#" + _self.tableId + "_body >tr.tc-row").find('input').is(":checked");
        jQ('#' + _self.tableId + '_btn_delete, [data-link="' + _self.tableId + '"]').prop('disabled', !ischecked); // No I18N
        if (ischecked) {
            jQ("#" + _self.tableId + "_body >tr.tc-row input[type='checkbox'][data-table-checkbox]:checked",_self.tblContainer).closest("tr.tc-row").addClass("selected-row");
        } else {
            jQ("#" + _self.tableId + "_body >tr.tc-row",_self.tblContainer).removeClass("selected-row");
        }
    },
    initResizeColumns: function (table_id) {
        var _self = this;
        var eventNamespace = _self.eventNamespace = '.table-component_'+_self.tableId;
        jQ("#" + _self.tableId + "_div").off('mouseenter'+eventNamespace).on('mouseenter'+eventNamespace,'div.rc_d_h',function(){ //No I18N
            if(this.initResize) {
                return;
            }
            jQ(this).draggable({
                    axis: "x", //No I18N
                    stop: function (evt, ui) {
                        var $elem = jQ(this);
                        var oldPos = ui.originalPosition.left;
                        var newPos = ui.position.left;
                        jQ(this).removeAttr('style'); //No I18N
                        var index = $elem.parent().index();

                        _self.resetColumnSizes(jQ('table#' + table_id), newPos - oldPos, index, $elem.data("columnId")); //No I18N
                    }
            });
            this.initResize = true
        });
    },
    setTableWidth: function (width) {
        var _self = this;
        if (_self.t_obj.options.staticHeader) {
            var tableDiv = "#" + _self.tableId + "_div", norecordsdiv = "#" + _self.tableId + "_norecordsdiv,";
            jQ(norecordsdiv + tableDiv).css("width", width + "px");
        }
    },
    setTableHeight: function (height) {
        var _self = this;
        var tableDiv = "", tableBodyDiv = "", scrollbardiv = "";
        if (_self.t_obj.options.view == "kanban") {
            tableDiv = "#" + _self.tableId + "_kanban_div";
            jQ(tableDiv).css("height", height + "px");
        } else {
            if (_self.t_obj.options.staticHeader) {
                tableDiv = "#" + _self.tableId + "_div";
                jQ(tableDiv).css("height",(height + 15)+"px");    //No I18N
            }
        }
    },
    resetColumnSizes: function (table, change, columnIndex, colId) {
        /*Setting width to Resized header and columns*/
        var _self = this;
        var column =  jQ('table#' + _self.tableId + ' TR TH').get(columnIndex); //No I18N
        var searchColumn =  jQ('table#' + _self.tableId + ' tr.searchRow td').get(columnIndex); //No I18N
        const isPLSearchColumn = jQ(searchColumn).find('div.inline-pl-search-enabled').length > 0;
        const isSearchVisible =()=> jQ('table#' + _self.tableId + ' .searchRow:first').is(':visible');
        var myWidth = column.offsetWidth; //No I18N
        var adjust = -15;
        var newWidth = (myWidth + change + adjust);
        var minWidth = 31;

        if(isPLSearchColumn && isSearchVisible()) {
            //For inline picklist search column, setting minimum width value as '150px'
            minWidth = 150; 
        }

        if (newWidth < minWidth) {
            newWidth = minWidth; //Setting minimum width value as '31'
        }
        var head_tr = jQ('table#' + _self.tableId).find('TR:first'); //No I18N
        head_tr.find('th').eq(columnIndex).css('width', newWidth + 'px').find('>div.d_w').css('width', newWidth + 'px'); //No I18N
        // table.find('.searchRow td').eq(columnIndex).css('width', newWidth + 'px').find('>div').css('width', newWidth + 'px'); //No I18N
        var body_ele = "#" + _self.tableId + ">tbody";  //No I18N
        jQ(body_ele).children().each(function () {
            var td = jQ(this).children().eq(columnIndex);
            var dw_div = td.find('>div');
            td.css('width', newWidth);
            dw_div.css('width',newWidth);
        });

        _self.updateColumnresizePersonalize(colId, newWidth);
    },
    updateColumnresizePersonalize: function (id, newWidth) {
        /*Personlizing all the resized columns width*/
        var _self = this;
        _self.t_obj.table_info.fields_required[id] = _self.t_obj.table_info.fields_required[id] || {};
        _self.t_obj.table_info.fields_required[id]["width"] = newWidth + "px"; //No I18N
        _self.t_obj.processedColumns = jQ.map(_self.t_obj.processedColumns, function (e) {
            if (e.id == id) {
                e.width = newWidth + "px"; //No I18N
                e.stylewidth = "width:" + newWidth + "px"; //No I18N
            }
            return e;
        });
        if (_self.t_obj.options.personalize_key) {
            _self.addPersonalizeData(_self.t_obj.table_info);
        }
    },
    callbackEmberNonember: function (fn_name, arg) {
        /*Common callback function for EMBER and NON-EMBER*/
        if (typeof Ember == "undefined") {
            if (typeof fn_name === "string") {
                if (fn_name.indexOf('.') != -1) {
                    var fndefn = table_comp.getFieldsRequiredByString(window, fn_name);
                    return fndefn(arg, this.context, this);
                } else {
                    return window[fn_name](arg, this.context, this);
                }
            } else {
                return fn_name(arg, this.context, this);
            }
        } else {
            if (arg && arg.constructor == Array) {
                arg.push(this.context);
                arg.push(this);
                return fn_name.apply(window, arg, this);
            }
            // Fix for execute function in ember pages 
            else if (typeof fn_name === "string") {
                if (fn_name.indexOf('.') != -1) {
                    var fndefn = table_comp.getFieldsRequiredByString(window, fn_name);
                    return fndefn(arg, this.context, this);
                } else {
                    return window[fn_name](arg, this.context, this);
                }
            } else {
                return fn_name(arg, this.context, this);
            }


        }
    },
    refreshTable: function (action) {
        var skipFor = ['search','init'];
        if (!skipFor.includes(action) && this.t_obj.options.isBulkSelectEnabled) {
            this.bulkSelect.resetSelectedRecords();
            this.bulkSelect.unSelectAll();
        }
        this.updateTableInfoPeronalization(action);
    },
    setLocSeachObj: function (stateObj, isPopstate) {
        var loc_obj = {};
        if (stateObj != null && stateObj.hasOwnProperty("list_info")) {
            loc_obj = JSON.parse(stateObj.list_info);
        }
        else {
            if (location.search != "" && (location.search).indexOf('url_search') != -1) {
                try {
                    loc_obj = location.search ? JSON.parse(decodeURIComponent((location.search).split('url_search=')[1])) : {};
                    if (loc_obj.hasOwnProperty("list_info")) {
                        loc_obj = loc_obj.list_info;
                        window.history.replaceState({ "list_info": sdpToJSON(loc_obj), "mode": "url_search", "searchURL": location.href }, "", location.href)
                    }
                }
                catch (e) {
                    loc_obj = {};
                }
            }
        }

         if (!jQ.isEmptyObject(loc_obj)) {
             //clear existing search field 
            delete this.t_obj.table_info.list_info.search_fields;
            delete this.t_obj.table_info.list_info.start_index;
            if (loc_obj.search_fields) {
                //add new search data to row_inputdata
                let opt = this.t_obj.options;
                opt.row_inputdata && opt.row_inputdata.list_info && (opt.row_inputdata.list_info.search_fields = loc_obj.search_fields);
                this.t_obj.table_info.list_info.search_fields = loc_obj.search_fields;
            }
            if (loc_obj.start_index && !isNaN(loc_obj.start_index)) {
                this.t_obj.table_info.list_info.start_index = loc_obj.start_index;
            }
        }
    },
    //To remove url_search param in url string
    removeUrlSearch : function(urlString){
        urlString = urlString || window.location.href;
        const urlObj = new URL(urlString);
        const params = new URLSearchParams(urlObj.search);
        params.delete("url_search");
        urlObj.search = params.toString();
        return urlObj.href;
    },
    setPushStateObj: function (state) {
        if (state === "clearSearch" || state === "clearOnly") {
            if(externalframe || window.externalframe) {/** Skip URL change/replace event **/
                return;
            }
            window.history.pushState("listviewurl", '', this.removeUrlSearch()); // No I18N
            return;
        }
        var l = {}, s = {};
        var l_obj = this.t_obj.table_info.list_info;

        if (l_obj.search_fields) {
            s.search_fields = l_obj.search_fields;
        }
        if (l_obj.start_index) {
            s.start_index = l_obj.start_index;
        }
        var urlData = encodeURIComponent(sdpToJSON({ "list_info": s }));
        var urlStr = replaceUrlParam(window.location.href, "url_search", urlData)

        if (!jQ.isEmptyObject(s) && state !== "clearSearch") {
            var stateObj = { "mode": "url_search", "list_info": sdpToJSON(s), "searchURL": urlStr };
            var tempURL = window.location.search;
            if (tempURL.split("url_search=")[1] != urlData) {
                window.history.pushState(stateObj, '', urlStr); // No I18N
            }
        }
        // Replace the URL with searched data 
        function replaceUrlParam(url, paramName, paramValue) {
            if (paramValue == null) {
                paramValue = '';
            }
            var pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
            if (url.search(pattern) >= 0) {
                return url.replace(pattern, '$1' + paramValue + '$2');
            }
            url = url.replace(/[?#]$/, '');
            return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
        }
    },
    bindInlineEditEvents: function () {
        var _self = this;
        var eventNamespace = _self.eventNamespace = '.table-component';
        var parentEle = _self.getTableId("#","_div .tableComponent div.d_w");
        if (_self.t_obj.options.view == "kanban") {
            parentEle = _self.getTableId("#","_kanban_div .row");
        }
        //off all events
        jQ(document).off(eventNamespace);

        jQ(document).on('click'+eventNamespace, parentEle + ' .inline-disp', function (e) { // No I18N
            var cur_ele = jQ(this);
            var local_self = _self.changeComponentObject(jQ(cur_ele).closest(".tc-row"));
            jQ("#" + local_self.tableId + "_div .tc-row").removeClass("modify-row");
            jQ(this).closest('.tc-row').addClass("modify-row");
            jQ(".inline-edit").addClass('hide'); // No I18N
            jQ(".inline-disp").removeClass('hide'); // No I18N
            jQ("#_CALDIALOG_LAYER").css("visibility", "hidden"); // No I18N
            
            local_self.t_obj.options.selectedId = cur_ele.closest(".tc-row").find("input[type='checkbox'][data-table-checkbox]").val();
            var c_ele = jQ(this);
            var data_type = c_ele.attr('data-type');
            if (local_self.t_obj.options.allowedValuesURL && (data_type != "date-time" && data_type != "date" && data_type != "datetime") && !local_self.t_obj.inlineEdit_allowed_values) {
                sdpAjax({
                    url: local_self.t_obj.options.defaultpath + local_self.t_obj.options.allowedValuesURL,
                    success: function (data) {
                        local_self.t_obj.inlineEdit_allowed_values = data.allowed_values;
                    },
                    async: false
                });
            }
            var pos = c_ele.position();
            var tp = (data_type == "date-time" || data_type == "date" || data_type == "datetime") ? (pos.top - 5) : (pos.top + 15); // No I18N
            var lp = pos.left;
            var par_ele = local_self.t_obj.options.view == "kanban" ? c_ele.closest('.k_div') : c_ele.closest('.d_w');
            var editEle = local_self.getInlineEditHTML(c_ele, local_self);
            var inlineEditDiv = par_ele.find('.inline-edit-content');
            editEle = table_comp.applyDataStyle(editEle);
            inlineEditDiv.empty().append(editEle);

            par_ele.find('.inline-edit').removeClass('hide').css({ 'left': lp + "px", 'top': tp + "px" }); // No I18N
            if (data_type === "date-time" || data_type === "date" || data_type == "datetime") {
                par_ele.find('.inline-disp').addClass('hide');
                c_ele.next().find('span.table-calendar-input').trigger('click');
            }
        });

        jQ(document).on('click'+eventNamespace, '.tableComponent .inline-save', function () {
            var cur_ele = jQ(this);
            var local_self = _self.changeComponentObject(jQ(cur_ele).closest(".tc-row"));
            local_self.inlineEditCallback(local_self, this);
        });
        jQ(document).on('click'+eventNamespace, '.tableComponent .inline-cancel', function () {
            var cur_ele = jQ(this);
            var local_self = _self.changeComponentObject(jQ(cur_ele).closest(".tc-row"));
            jQ(this).parent().addClass('hide');
            jQ(this).parent().prev().removeClass('hide');
            jQ("#_CALDIALOG_LAYER").css("visibility", "hidden"); // No I18N
            jQ("#" + local_self.tableId + "_div .tc-row").removeClass("modify-row");
        });
        jQ(document).on('change'+eventNamespace, 'select[id^=Inline_],input.select2-offscreen[id^=Inline_]', function () { // No I18N
            var cur_ele = jQ(this);
            var local_self = _self.changeComponentObject(jQ(cur_ele).closest(".tc-row"));
            /** SD-108347 check to prevent saving when clicking again Not specified value.*/
            var curRowId = jQ(cur_ele).closest(".tc-row").attr("data-entityid");
            var rowDiv = local_self.t_obj.options.view_mode === "linear" ? "k_div" : "d_w"; // No I18N
            var curField = jQ(cur_ele).closest("."+rowDiv).find("[data-field]").attr("data-field");
            var entityObj = local_self.loadedRecords[curRowId];
            var combineSettings = local_self.t_obj.options.combined_settings;
            if (combineSettings) {
                entityObj = entityObj[combineSettings.module] || {};
            }
            var curFieldData = entityObj[curField]
            if(curFieldData === null && jQ(cur_ele).val() === ''){
                return;
            }
            local_self.inlineEditCallback(local_self, this);
        });
        jQ(document).on('click'+eventNamespace, '.table-calendar-input', function () {
            var cur_ele = jQ(this);
            var local_self = _self.changeComponentObject(jQ(cur_ele).closest(".tc-row"));
            jQ("#" + local_self.tableId + "_div .tc-row").removeClass("modify-row");
            jQ(this).closest('.tc-row').addClass("modify-row");
            jQ("#_CALDIALOG_LAYER").css("visibility", "visible"); // No I18N
            var parId = jQ(this).parent().find('input.data-save').attr('id');
            local_self.initInlineCalendar(this, parId);
        });
        jQ(document).on('blur'+eventNamespace, ".table-inlineedit-input .select2-input", function () {
            var cur_ele = jQ(this);
            var local_self = _self.changeComponentObject(jQ(cur_ele).closest(".tc-row"));
            jQ('.inline-edit').addClass('hide'); // No I18N
            jQ("#" + local_self.tableId + "_div .tc-row").removeClass("modify-row");
            var id = jQ(this).attr('id').split("_search")[0];
            setTimeout(function () {
                jQ("#" + id).closest(".inline-edit-content .data-save").select2('close');
                jQ("#" + id).closest(".inline-edit-content").html('');
            }, 500);
        });
        jQ(document).on('click'+eventNamespace, 'td span.failure3', function () {
            var cur_ele = jQ(this);
            var local_self = _self.changeComponentObject(jQ(cur_ele).closest(".tc-row"));
            jQ('.inline-edit').addClass('hide'); // No I18N
            jQ('.inline-disp').removeClass('hide'); // No I18N
            jQ("#" + local_self.tableId + "_div .tc-row").removeClass("modify-row");
        });
    },
    getInlineEditHTML: function (cur_ele, local_self) {
        var _self = local_self;
        var rowid = cur_ele.attr('data-rowid');
        var entityObj = _self.loadedRecords[rowid];
        var combineSettings = local_self.t_obj.options.combined_settings;
        if (combineSettings) {
            entityObj = entityObj[combineSettings.module] || {};
        }
        var field = cur_ele.attr('data-field');
        var fieldObj = entityObj[field];
        var lookup_meta =  jQuery.extend({},_self.t_obj.meta_info[field]);
        var type = lookup_meta.type;
        var p_inline = jQ("#" + _self.tableId + "_inlineEditFields");
        var eleId = _self.tableId + "_" + field;
        var org_ele = p_inline.find("#" + eleId);

        if (org_ele.length == 0) {
            var newEle = "";
            if (type === "select" && (_self.t_obj.inlineEdit_allowed_values && _self.t_obj.inlineEdit_allowed_values[field])) {
                var all_val = _self.t_obj.inlineEdit_allowed_values[field];
                newEle = "<select class='data-save w-180px'><option>" + translate("common.select.default") + "</option>";
                for (var i = 0; i < all_val.length; i++) {
                    var obj = all_val[i];
                    newEle += "<option value=" + obj.id + ">" + obj.name + "</option>";
                }
                newEle += "</select>";
            } else if (type === "lookup") {
                newEle = "<input class='data-save w-180px' />";
            } else if (type === "date-time" || type === "date" || type === "datetime") { // No I18N
                newEle = '<input type="hidden" class="data-save"><input type="text" clear-update="yes" data-clear="yes" readonly="true" class="display-data table-calendar-input"><span class="table-calendar-input cspr icon-sm date cur-ptr ml5"></span>';
            }
            newEle = '<div id="' + eleId + '">' + newEle + '</div>';
            newEle = table_comp.applyDataStyle(newEle);
            p_inline.append(newEle);
            org_ele = jQ(newEle);
        }

        var op_ele = org_ele.clone();
        if (type === "select") {
            op_ele.find('select.data-save').attr({ 'id': "Inline_" + eleId }).val(fieldObj ? fieldObj.id : "").select2({
                formatNoMatches: translate("ae.common.select2nomatchesfound")
            });
            setTimeout(function () {
                op_ele.find('.data-save').select2('open'); // No I18N
            }, 0);
        } else if (type === "lookup") {
            if (lookup_meta.href.indexOf("${") != -1) {
                lookup_meta.href = table_comp.getCompiledString(lookup_meta.href, entityObj);
            }
            var select2Id = "Inline_" + eleId;
            if (lookup_meta.changeCallBack) {
                select2Id = "Custom_Inline_" + eleId;
            }
            op_ele.find('input.data-save').attr({ 'id': select2Id });
            setTimeout(function () {
                var lookupURL = lookup_meta.href;
                var lookup_options = {
                    cache: {},
                    multiple: false,
                    placeholder: translate("form.select.placeholder", [lookup_meta.display_name]), // No I18N
                    value: fieldObj,
                    url: [{
                        url: "/api/v3" + lookupURL,//NO I18N
                        field: field,//NO I18N
                        list_info: { start_index: 1, row_count: 25 }
                    }],
                    // SD-108347
                    processResults:function(cacheData,data,field,i,dat) {
                        if(!cacheData.length && !i.term) {
                            var n_index = dat.findIndex(function(obj){ return obj.id == null; });
                            if(n_index == -1) {
                                cacheData.push({"id": null, "text":translate("sdp.requests.fieldFormRules.rules.notspecified")});
                            }
                        }
                        cacheData.push({id:data.id,text:data.text || data.name});
                    }
                };
                // SD-108347 when meta fields had mandatory fields need to avoid the Not specified value in dropdown
                if(lookup_meta.hasOwnProperty("mandatory") && lookup_meta.mandatory){
                    delete lookup_options.processResults;
                }
                if (_self.t_obj.options.acceptODCompatible) {
                    var headerAccept = "application/vnd.manageengine.sdp.v3+json";
                    lookup_options.url[0].headers = { Accept: headerAccept };
                }
                if (lookup_meta.criteriaCallback) {
                    lookup_options.criteriaCallback = lookup_meta.criteriaCallback;
                }
                if (fieldObj && !fieldObj.text) {
                    fieldObj.text = fieldObj.name || fieldObj.value || fieldObj.title;
                }
                lookup_options.dropdownCssClass = "table-inlineedit-input";
                jQ("#" + select2Id).sdp_select2(lookup_options);
                if (lookup_meta.changeCallBack) {
                    jQ("#" + select2Id).off('change').on('change', function () { // No I18N
                        _self.callbackEmberNonember(lookup_meta.changeCallBack, this);
                    });
                }
                op_ele.find('.data-save').select2('open'); // No I18N
            }, 0);
        }
        else if (type === "date-time" || type === "date" || type === "datetime") {
            var calId = eleId + "_" + rowid;
            if (!fieldObj) {
                fieldObj = {};
            }
            var display_date = fieldObj.value ? _self.displayClientTime(fieldObj.value) : "";
            op_ele.find('input.display-data').attr({ "id": "Inline_" + calId + "_Display", "value": display_date }).end()
                .find('.data-save').attr({ "id": "Inline_" + calId, "value": fieldObj.value });
        }
        op_ele.removeAttr('id');
        return op_ele;
    },
    validateFunction: function (_self, ele, dateClearStr) {
        if(!shouldSubmit && dateClearStr !== "clear"){ // shouldSubmit - Global variable defined in ZDPCalendar.js
            return true;
        }
        var cur_ele = jQ(ele);
        var div_ele = _self.t_obj.options.view == "kanban" ? cur_ele.closest('.k_div') : cur_ele.closest('.d_w');
        var par_ele = div_ele.find('.inline-disp'); // No I18N
        var arrObj = [], type = par_ele.attr('data-type'), rowid = par_ele.attr('data-rowid'), field = par_ele.attr('data-field');
        var selectedVal = div_ele.find('.data-save:last').val(); // No I18N
        if (type === "date-time" || type === "date" || type === "datetime") {
            if (selectedVal != '' && selectedVal != '-') {
                var field_meta = _self.t_obj.meta_info[field];
                var entityObj = _self.loadedRecords[rowid];
                var c_val = "";
                if (field_meta.comparefield) {
                    var c_date = "";
                    if (entityObj[field_meta.comparefield] != null) {
                        c_val = entityObj[field_meta.comparefield].value;
                    }
                }
                var msg = translate("sdp.common.task.actualtimecheck.jserror"), errorCondition = "";
                if (field.indexOf("end_time") >= 0) {
                    errorCondition = "less"; // No I18N
                    if (dateClearStr == "clear") {
                        selectedVal = "";
                    }
                } else {
                    if (dateClearStr == "clear" && !c_val) {
                        selectedVal = "";
                    }
                }
                var valid = true;
                if (selectedVal) {
                    var element = jQ("<input>").val(selectedVal);
                    var compareElement = jQ("<input>").val(c_val);
                    valid = checkValidDate(element[0], compareElement[0], msg, errorCondition);
                }
                if (!valid) { return false; }
                else {
                    _self.inlineEditCallback(_self, ele);
                }
            }
        }
    },
    inlineEditCallback: function (comp, ele) {
        var _self = this;
        if (jQuery.isArray(_self)) {
            _self = _self[0];
        }
        var cur_ele = ele ? jQ(ele) : jQ(comp);
        var div_ele = _self.t_obj.options.view == "kanban" ? cur_ele.closest('.k_div') : cur_ele.closest('.d_w');
        var par_ele = div_ele.find('.inline-disp'); // No I18N
        var arrObj = {}, rowid = par_ele.attr('data-rowid'), field = par_ele.attr('data-field');
        var lookup_meta = _self.t_obj.meta_info[field];
        var type = lookup_meta.type;
        var selectedVal = div_ele.find('.data-save:last').val(); // No I18N
        arrObj.type = type;
        arrObj.field = field;
        arrObj.entity_id = rowid;
        arrObj.fieldid = selectedVal;
        if (_self.t_obj.options.inlineUpdatefunction) {
            _self.callbackEmberNonember(_self.t_obj.options.inlineUpdatefunction, [arrObj, cur_ele]);
            return false;
        } else {
            _self.saveInlineEditChanges(arrObj, cur_ele);
            _self.refreshTable("refresh");
        }
        jQ("#_CALDIALOG_LAYER").css("visibility", "hidden"); // No I18N
    },
    saveInlineEditChanges: function (arg, cur_ele) {
        /*
               For unified view, we need to change the Component object (in local scope) to render the different view
           */
        var local_self = this.changeComponentObject(jQ(cur_ele).closest(".tc-row"));
        var type = arg.type, field = arg.field, entity_id = arg.entity_id, sel_val = arg.fieldid, temp = {}, input_obj = {};
        if (type == "select" || type == "lookup") {
            temp[field] = sel_val && sel_val != "" ? { "id": sel_val } : null;
        } else {
                temp[field] = sel_val && (sel_val !="" && sel_val !="null") ? { "value": sel_val } : null;
        }
        input_obj[local_self.t_obj.options.inlineEditEntity || local_self.t_obj.options.entity_name] = temp;
        var dataVal = sdpAjaxInputData(input_obj);
        sdpAjax({
            url: local_self.t_obj.options.defaultpath + (local_self.t_obj.options.inlineEditUrl || local_self.t_obj.options.callbackURL) + "/" + entity_id, //NO I18N
            type: "PUT", //NO I18N
            data: dataVal,
            success: function (resp) {
                var message = "";
                if (resp.response_status.messages) {
                    message = resp.response_status.messages[0].message;
                } else {
                    message = local_self.localTranslate("sdp.admin.common.updatedsuccessfully");
                }
                showalert('success', message, "isAutoHide=true"); // No I18N
            },
            async: false,
            errMsgAutoHide: local_self.t_obj.options.errMsgAutoHide
        });
    },
    initInlineCalendar: function (ele, idStr, displayType) {
        var local_self = this.changeComponentObject(jQ(ele).closest(".tc-row"));
        var setHrsMins = "00:00", showNow_Today = true, hideTime = false;
        if(displayType === "Date"){
            hideTime = true;
        }
        if (idStr.indexOf("end_time") >= 0) {
            setHrsMins = "23:59";
        }
        initCalendar(idStr, null, null, null, null, local_self.validateFunction, window,[local_self,ele] , showNow_Today, setHrsMins ,hideTime, null, null,null , {
            /**Close callback function to hide the calendar in the table row */
            close: function(){
                jQ('.inline-edit').addClass('hide'); // No I18N
                jQ('.inline-disp').removeClass('hide'); // No I18N
                jQ("#" + local_self.tableId + "_div .tc-row").removeClass("modify-row");
            }
        });
    },
    displayClientTime: function (val) {
        var date = new Date();
        var op_date = "";
        var elementType = "date-time"; // No I18N

        var monthObject = {};
        monthObject["0"] = "Jan";//NO I18N
        monthObject["1"] = "Feb";//NO I18N
        monthObject["2"] = "Mar";//NO I18N
        monthObject["3"] = "Apr";//NO I18N
        monthObject["4"] = "May";//NO I18N
        monthObject["5"] = "Jun";//NO I18N
        monthObject["6"] = "Jul";//NO I18N
        monthObject["7"] = "Aug";//NO I18N
        monthObject["8"] = "Sep";//NO I18N
        monthObject["9"] = "Oct";//NO I18N
        monthObject["10"] = "Nov";//NO I18N
        monthObject["11"] = "Dec";//NO I18N
        date.setTime(val);

        // When the client is in a different format and the time zone selected is in a different format, then while editing the values will be displayed on the client timezone. To overcome this, the selected time zone's offset is obtained and calculated.
        var utc = date.getTime();
        var usertimezone = parent.sdp_user.USERTIMEZONECODE;
        var usertimezoneoffset = getUserTimezoneOffset(date.getTime(), usertimezone);
        utc = utc + usertimezoneoffset;
        date.setTime(utc);

        var min = date.getMinutes();
        if (min >= 0 && min < 10) {
            min = '0' + min;//NO I18N
        }

        var hrsMins = "";

        if (elementType != 'date') { hrsMins = ", " + date.getHours() + ":" + min + ":00"; }

        op_date = date.getDate() + " " + monthObject[date.getMonth()] + " " + date.getFullYear() + hrsMins;//NO I18N
        // SD-45680
        // The date was getting displayed as "May 2012, 9:44:00 14" in RTL where 14 is the date. It should have been "14 May 2012, 9:44:00". This has been fixed by adding a class to the field name wherein the directoin will be forced left.
        //document.getElementById(calId+'_Display').className = "dateFieldForceLTR tl formStyle"; // No I18N
        return op_date;
    },
    changeComponentObject: function (cur_ele) {
        var local_self = this;
        if (local_self.t_obj.options.combined_settings && local_self.t_obj.options.changeComponentObject) {
            var local_self = local_self.callbackEmberNonember(local_self.t_obj.options.changeComponentObject, cur_ele);
        }
        return local_self;
    },
    /*
     * Method to apply filter search criteria to table values
     */
    applyFilterTable: function (search_criteria, filter_info) {
        var _self = this;
        _self.changeFilterString("clearOnly");
        _self.isAdvFilterApplied = true;
        search_criteria = JSON.parse(sdpToJSON(search_criteria));
        _self.advancedfilter_criteria = search_criteria;
        if (_self.t_obj.options.applyFilterTable) {
            _self.callbackEmberNonember(_self.t_obj.options.applyFilterTable, search_criteria);
        } else {
            _self.t_obj.table_info.list_info.search_criteria = search_criteria;
            _self.refreshTable("refresh");   //No i18n
        }
    },
    /**
     * Method to to cancel applied search filter
     * @param {Boolean} isManual whether cancel is triggered manually
     */
    cancelFilterTable: function(isManual) {
        var _self = this;
        _self.changeFilterString("clearOnly");
        _self.isAdvFilterApplied = false;
        _self.advancedfilter_criteria = {};
        if (_self.t_obj.options.cancelFilterTable) {
            _self.callbackEmberNonember(_self.t_obj.options.cancelFilterTable, isManual);
        } else {
            delete _self.t_obj.table_info.list_info.search_criteria;
            _self.refreshTable("refresh");   //No i18n
        }
    },
    /*
     * Method to construct advanced search filter component
     */
    constructAdvFilter: function () {
        var vfOptions = {
            skipFields: this.t_obj.options.discarded_fields,
            metaInfoData: { "metainfo": this.metaInfo },    //No i18n
            parentDiv: "t_advfilter_" + this.t_obj.options.tableHolder, //No i18n
            entityComponent: this,
            applyFn: this.applyFilterTable,
            cancelFn: this.cancelFilterTable,
            haveNestedColumns: true
        };
        if (this.t_obj.options.advFilterSettings && this.t_obj.options.advFilterSettings.options) {
            var advOptions = this.t_obj.options.advFilterSettings.options;
            if (advOptions.metainfo_entity) {
                var dataVal = ""; // No I18N
                if (advOptions.metaInfo_input != undefined) {
                    dataVal = sdpAjaxInputData(advOptions.metaInfo_input);
                }
                sdpAjax({
                    url: "/api/v3/" + advOptions.metainfo_entity + "/_metainfo", // No I18N
                    data: dataVal,
                    success: function (data) {
                        vfOptions.metaInfoData.metainfo = data.metainfo;
                    },
                    cache: false,
                    async: false
                });
            }
            var skipdiscarded_fields = advOptions.skipdiscarded_fields;
            if (skipdiscarded_fields) {
                for (var i = 0; i < skipdiscarded_fields.length; i++) {
                    var fldindex = vfOptions.skipFields.indexOf(skipdiscarded_fields[i]);
                    if (fldindex != -1) {
                        vfOptions.skipFields.splice(fldindex, 1);
                    }
                }
            }
            //Extra fields to be skipped in advanced filter
            var skip_fields = advOptions.skip_fields;
            if (skip_fields) {
                for (var j = 0; j < skip_fields.length; j++) {
                    if (vfOptions.skipFields.indexOf(skip_fields[j]) == -1) {
                        vfOptions.skipFields.push(skip_fields[j]);
                    }
                }
            }
            vfOptions = jQuery.extend(true, vfOptions, this.t_obj.options.advFilterSettings.options);
        }
        viewFilterComponent.initComponent(vfOptions);
    },
    /**
    * Destory the Table component
    *   Unbinding the events
    * */
    destroy: function () {
        var _self = this;
        if (_self.refreshInterval) {
            clearInterval(_self.refreshInterval);
        }
        if (_self.t_obj.options.urlSearch) {
            jQ(window).off("popstate.tbstate_" + _self.tableId);
        }
        if(_self && _self.eventNamespace) {
            //off table related document and window events
            jQ(document).off(_self.eventNamespace);
            jQ(window).off('resize.'+_self.eventNamespace);
            _self.eventNamespace = null;
        }
        
        _self = null;
    },
    /**
 * Object for initializing and refreshing row preview
 */
    previewer: {
        rp: {},
        init: function (_self, prevStg) {
            this.rp = _self;
            jQ("[data-name^='preview_" + _self.tableId + "']").on("click", function (event, type) {
                var prev_span = jQ(this).parent().find(".preview_icon");   // No I18N
                var is_open = false;
                if (!type) {
                    is_open = prev_span.hasClass("circle-arrow-up");   // No I18N
                    jQ("#" + _self.tableId + "_div").find(".preview_icon").addClass("circle-arrow-down").removeClass("circle-arrow-up").attr("title", translate('sdp.common.expand'));  // No I18N
                    !is_open ? prev_span.addClass("circle-arrow-up").removeClass("circle-arrow-down").attr("title", translate('sdp.common.collapse')) : prev_span.addClass("circle-arrow-down").removeClass("circle-arrow-up").attr("title", translate('sdp.common.expand')); // No I18N
                }
                var data_name = this.getAttribute('data-name').replace('preview', 'previewcontent');    // No I18N
                if (!type && jQ("[data-name='" + data_name + "']").length > 0) {
                    jQ("[data-name='" + data_name + "']").remove(); // No I18N
                    jQ(this).closest('.tc-row').css({ "background-color": "", "border-bottom": "" }).find('td').css({ "background-color": "", "border-bottom": "" });   // No I18N
                } else {
                    if (jQ("[data-name^='previewcontent_']").length > 0) {
                        jQ("[data-name^='previewcontent_']").remove();  // No I18N
                    }
                    var parentTag = jQ(this).closest('.tc-row');    // No I18N
                    var rowData = _self.loadedRecords[this.getAttribute('data-id')] || {};  // No I18N
                    var preview_url = prevStg.href_string ? table_comp.getCompiledString(prevStg.href_string, rowData) : (prevStg.href || "");  // No I18N
                    var pre_win_height = prevStg.height || "auto"; // No I18N
                    var pre_win_width = prevStg.width || "100%";   // No I18N
                    var heightStr = ' height : ' + pre_win_height + ';';   // No I18N
                    var widthStr = pre_win_width && ' width : calc(' + pre_win_width + ' - 20px);'; // No I18N
                    if (preview_url) {
                        var previewData = "<iframe class='fw fh noborder' src='" + preview_url + "'></iframe>"; // No I18N
                    } else {
                        var previewCallback = prevStg.contentCB;
                        var previewData = previewCallback.apply(rowData);
                    }
                    var parentAttrs = ' data-name=\"' + data_name + '\" ';  // No I18N
                    if (_self.t_obj.options.view == "kanban") {
                        parentTag.after("<div " + parentAttrs + " data-style='" + heightStr + widthStr + " background-color: #f7f7f7;' class='p10'>" + previewData + "</div>").css({ "background-color": "#f7f7f7", "border-bottom": "none" });   // No I18N
                    } else {
                        parentTag.after("<tr " + parentAttrs + "><td colspan='" + _self.column_count + "' data-style='background-color: #f7f7f7;'><div data-style='" + heightStr + widthStr + " box-sizing: content-box;' class='p10'>" + previewData + "</div></td></tr>").find("td").css({ "background-color": "#f7f7f7", "border-bottom": "none" });    // No I18N
                    }
                    table_comp.applyDataStyle(parentTag.parent());
                    if (prevStg.afterCB) {
                        prevStg.afterCB(rowData, data_name);
                    }
                }
            });
        },
        refresh: function () {
            if (jQ("#" + this.rp.tableId + "_div").find("[data-name^='previewcontent_']").length) {
                var par_row = jQ("#" + this.rp.tableId + "_div").find("[data-name^='previewcontent_']").prev(".tc-row");    // No I18N
                par_row.find(".preview_icon").trigger("click", "refresh"); // No I18N
            }
        }
    },
    /**
     * Method to handle table dimensions on window resize
     */
    handleResize: function() {
        var _self = this;
        var body_width = jQ("body").width();    // No I18N
        var body_height = jQ("body").height();  // No I18N
        _self.resizeDebounce = null;
        var eventNamespace = _self.eventNamespace = '.table-component_'+_self.tableId;
        var offResizeEvent = ()=>jQuery(window).off('resize'+eventNamespace);
        var isSetParentWidth =_self.t_obj.options.resizeParentWidth;
        var getParentWidth =(tableDiv)=>tableDiv.parent().width();
        var getWidth = (tableDiv)=>document.body.clientWidth - (body_width - tableDiv.outerWidth());

        offResizeEvent();    // No I18N
        jQuery(window).on('resize'+eventNamespace, function() {
            if(_self.resizeDebounce) {
                clearTimeout(_self.resizeDebounce);
            }
            function resizeTable() {
                var containerDivId = (_self.t_obj.options.view == "kanban") ? _self.tableId +"_kanban_div" :  _self.tableId +"_div";  // No I18N
                var tableDiv = jQuery("#" + containerDivId);
                var isAlive = tableDiv.prop('isConnected');
                if(!isAlive) {
                    offResizeEvent();
                    return;
                }

                var new_body_width = document.body.clientWidth;
                var new_body_height = document.body.clientHeight;
                var width = isSetParentWidth ? getParentWidth(tableDiv) : getWidth(tableDiv);

                var new_width = width;   // No I18N
                var new_height = new_body_height - (body_height - tableDiv.outerHeight()); // No I18N

                tableDiv.css({'width': new_width , 'height': new_height});   // No I18N

                body_width = new_body_width;
                body_height = new_body_height;
            }
            _self.resizeDebounce = setTimeout(resizeTable, 100);
        });
    },
    //   Method to set width
    setWidth: function(isReset) {
        var _self = this;
        var dec_width = 50;
        var r_width;
        let getLeftWidth =() => jQ('#admin-sidebar').width()+25 || 0;
        if(_self.t_obj.options.width_settings) {
            // 20 - body padding
            var r_w = 20;

            r_w +=getLeftWidth();
            if(_self.t_obj.options.width_settings.adjustWidth) {
                const layout = sdp_user.CLIENT_CONF.userTheme.layout;
                const isSidebar = layout == 'sidebar' || layout == 'sidebarlite'  || false;
                const isSidebarWidth =  isSidebar ? jQ("#sdp-tab-menu-sidebar").outerWidth() : 0;  // No I18N
                r_w += jQ("#admin-sidebar").outerWidth() + isSidebarWidth;   // No I18N
                r_w += parseInt(_self.t_obj.options.width_settings.adjustWidth);
            }
            dec_width = r_w;
        }
        _self.t_obj.options.width = _self.t_obj.options.width && !isReset ? _self.t_obj.options.width : (jQ(window).width() - dec_width);
        r_width = _self.t_obj.options.width;
        return r_width;
    },
    //   Method to set height
    setHeight: function(isReset) {
        var _self = this;
        var dec_height = (_self.t_obj.options.view == "kanban") ? 140 : 200;    // No I18N
         //license violation banner case height added
        var licenseViolationHeight = ()=>jQ('.license-banner').height() || 0;
        var getTopHeight = ()=>_self.tblContainer[0].getBoundingClientRect().top+15-licenseViolationHeight();
        var r_height;
        if(_self.t_obj.options.height_settings) {
            /**33 - height of table header 
             * 15 - horizontal scrollbar height
             * 20 - body padding
             */
            var r_h = 33 + 15 + 20;
            r_h += getTopHeight();

            if(_self.t_obj.options.height_settings.adjustHeight) {
                r_h += parseInt(_self.t_obj.options.height_settings.adjustHeight);
            }
            dec_height = r_h;
        }
        _self.t_obj.options.height = _self.t_obj.options.height && !isReset ? _self.t_obj.options.height : (jQ(window).height() - dec_height);
        r_height = _self.t_obj.options.height;
        return r_height;
    },
    // Method to handle change event in radio 
    bindRadioEvent: function() {
        var _self = this, tableDiv  = "";
        var eventNameSpace = '.tableRadio';
        tableDiv = "#" + _self.tableId + "_body >tr.tc-row td ";    //No I18N
        jQ('#' + _self.tableId + "_btn_delete,[data-link='"+ _self.tableId +"']").prop('disabled', true); //No I18N
        jQ(tableDiv).off(eventNameSpace);
        //To remove  .selected-row of previous selected row 
        var rowSelector = 'tr.tc-row.selected-row td input[type="radio"]';
        var triggerPrevUnchecked = ()=>jQ(rowSelector,_self.tblContainer).trigger('change',['tableComponent']);
        
        if(jQ('#'+_self.tableId+'_div').find("input[type='radio']").length > 0) {
            jQ(tableDiv).on('change'+eventNameSpace,'input[type="radio"]', function(e,from) {
                from !='tableComponent' && triggerPrevUnchecked(from);
                if(jQ(this).is(":checked")) {
                    jQ(this).closest(".tc-row").addClass("selected-row");   //No I18N
                }else{
                    jQ(this).closest(".tc-row").removeClass("selected-row");    //No I18N
                }
                var ischecked = jQ(tableDiv).find("input[type='radio']").is(":checked");  //No I18N
                jQ('#' + _self.tableId + '_btn_delete, [data-link="'+ _self.tableId +'"]').prop('disabled', !ischecked); // No I18N
            });
        }
    },
    /**
     *
     * @returns Method to get selected radio id
     */
    getSelectedRadio: function() {
        var _self = this;
        var sel_id;  //No I18N
        if(jQ('#'+_self.tableId+'_div').find("input[type='radio']:checked").length) {
            sel_id = jQ('#'+_self.tableId+'_div').find("input[type='radio']:checked").val();    //No I18N
        }
        return sel_id;
    },
     /**
    * 
    * @param {object} data error response data
    * @param {string } type summary type (delete/update)
    * Used Module: Admin module component.
    * function for showing the error response summary in bulk edit or delete operation.
    */
    showUpdateOrDeleteSummary:function(data, type){
        var summary = data.response_status;
        var opt = this.t_obj.options;
        var entity_field = opt.bulk_action_summary.field || "id";
        var failed = [], success = [], inactive = [];
        for(var i =0;i<summary.length;i++){
            var summaryData = summary[i];
            var tblRecord = this.visibleContents.filter(function(el){
                return el.id == summaryData.id;
            })
            var fieldData = tblRecord.length > 0 ? tblRecord[0][entity_field] : summaryData.id;
            if(summaryData.status == "success"){ //No I18N
                if(summaryData.messages && summaryData.messages[0].status_code != 2000){
                    summaryData.messages[0].status_code == 4005 ? inactive.push({ field: fieldData, message: summaryData.messages[0].message }) : failed.push({ field: fieldData, message: summaryData.messages[0].message });
                }else{
                    success.push({ field: fieldData });
                }
            }else if(summaryData.status == "failed"){ //No I18N
                    failed.push({ field: fieldData, message: summaryData.messages[0].message });
            }
        }
        // prevent to display the summary if there is no error
        if(summary.length == success.length){
            this.showRespDialog(data);
            return;
        }
        var hbsData = { success: success, inactive: inactive, failed: failed, entity_i18n: (translate(opt.bulk_action_summary.entity_i18n) || translate("sdp.common.id")) };
        var summary_container_div = jQ('<div>');
        renderhbs(summary_container_div, "summary-component", hbsData, true, "components", true, true); //No I18N
        var title = type == "delete" ? translate("common.delete.summary") : translate("common.update.summary"); //No I18N
        var dialogWidth = "550"; //No I18N
        setTimeout(function(){
            var dialogContent = jQ('#summary_container',summary_container_div);
            summary_container_div = null;
            jQ(dialogContent).dialog({
                modal: true,
                width: dialogWidth,
                title: title,
                open: function(){
                    initTooltip("#summary_container");
                    jQ(".ui-dialog-titlebar-close").attr("title",translate("sdp.common.close"));
                },
                close: function(){
                    jQ(this).dialog("destroy");
                    //Unbind the events when the dialog closes.
                    jQ("#tb_summary_dialog_close").off("click");
                }
            })
            /** Event for closing the dialog */
            jQ("#tb_summary_dialog_close").off("click").on("click", function(){
                jQ("#summary_container").dialog('close');
            });
        }, 500);
    },
       /**
     * State for handling aka flag
     */

    getKeyTranslation: function(key, args){
        return getI18nKeyValue(true, null, key, args)
    },
    /**
     *
     * @param {object} header_data header meta data of each fields
     * @param {object} rowData each row data from the api data
     * @param {number} index column index
     * @returns color and darkStyle
     * generic method for both table and linear(classic view)
     */
    rowColorStyling: function(header_data, rowData, colIndex){
        let _self = this;
        let localOpt = _self.t_obj.options;
        if (localOpt.changeComponentObject) {
            _self = localOpt.changeComponentObject(rowData);
            localOpt = _self.t_obj.options;
        }
        let colorSetting = localOpt.color_settings;
        let csField = colorSetting.field;
        let darkStyle = "";
        let column_id = header_data.id === _self.tableId + "_head_chk" ? "checkbox" : header_data.id; //No I18N
        let colorSettingColumn;
        /**
         * restrict to show color strip only on chechbox or first column when dark mode enables with all column and classic view case
         * if the checkbox not present case consider the first column to show the strips
        **/
        if(isDark() && colorSetting.columns.includes("all_columns") || localOpt.view === "kanban"){
            colorSettingColumn = colIndex === 0 ? column_id.indexOf("_head_chk") != -1 ? ["checkbox"] : [column_id] : ["checkbox"];
        } else{
            colorSettingColumn = colorSetting.columns;
        }
        if (colorSettingColumn.includes(column_id) || colorSettingColumn.includes("all_columns")) {
            let curFieldval = rowData[csField] && rowData[csField].id;
            if(!curFieldval && localOpt.callback_colorsetting) {
                curFieldval = _self.callbackEmberNonember(localOpt.callback_colorsetting, [rowData,csField]);
            }
            if (colorSetting[csField]) {
                if (curFieldval && colorSetting[csField][curFieldval]) {
                    color = colorSetting[csField][curFieldval].background_color;
                    darkStyle = sdp_user.DIRECTION == "RTL" ? "border-right:5px solid "+ color : "border-left:5px solid "+ color;
                } else {
                    if (!curFieldval && colorSetting[csField][0]) {
                        color = colorSetting[csField][0].background_color;
                        darkStyle = sdp_user.DIRECTION == "RTL" ? "border-right:5px solid "+ color : "border-left:5px solid "+ color;
                    } else {
                        color = colorSetting.default_color;
                        darkStyle = sdp_user.DIRECTION == "RTL" ? "border-right:5px solid #121212" : "border-left:5px solid #121212";
                    }
                }
            } else {
                color = colorSetting.default_color;
            }
        } else {
            if (colorSetting.default_background) {
                color = colorSetting.default_background;
            }
        }
        //by default make the color as per dark mode in all the cell
        if(isDark()){
            color = '#121212'
        }
        return {
            color: color,
            darkStyle : darkStyle
        }
    },
    enableExportBtn: function(isEnabled) {
        const btn = jQuery("#exportlistview_btn_"+ this.tableId)
        isEnabled ? btn.removeClass('disableDiv'): btn.addClass('disableDiv');
    },
    /**
     * 
     * @returns boolean
     * Function to check if the custom view is enabled along with personalization
     */
    checkCustomViewEnabled: function() {
        var isEnabled = this.t_obj.options.isCustomView ? true : false;
        var list_setting = this.t_obj.table_info.list_settings;
        if(isEnabled && list_setting && list_setting.hasOwnProperty('cv_preferred_column')){
            isEnabled = list_setting.cv_preferred_column === 'true' ? true : false; //No I18N
        }
        return isEnabled;
    }
    
};
var table_comp = {
    //To add data-onclick="click", data-onclick-param="1,2" to add event to the element
    addSdEvents:function(container) {
        // table component internal onclick event handled separately.(to avoid gloablEval call execution of script) 
        var addClickEvent = (element)=> {
            //add onclick event with 
            //$annList.openAnnouncement to clickable function
            var data = element.dataset;
            var actionName = data.onclick;
            var actionParam = data.onclickParam;
            actionParam = actionParam.length > 1 ? actionParam.split(',') : [];
            var actionNameFn = table_comp.getFieldsRequiredByString(window,actionName);
            delete element.dataset.onclick;
            delete element.dataset.onclickParam;
            doOnclick=()=> {
                actionNameFn && actionNameFn.apply(element,actionParam);
            }
            actionNameFn && jQuery(element).off('.table-click').on('click.table-click',doOnclick);
        }
        var hrefConvert = (element)=>{
            //used in detail page request list, to open in new window
            var data = element.dataset;
            var openLink = data.openwindowHref;

            if(openLink){
                element.href=openLink;
                delete element.dataset.openwindowHref;
                const openInNewWindow = ()=>{window.open(openLink, '_blank', 'noopener,noreferrer'); return false;};
                jQ(element).off('.table-href').on('click.table-href',openInNewWindow);
            }
        }

        var transform = (element)=>{
            var data = element.dataset;
            data.onclick && addClickEvent(element);
            (data.href || data.openwindowHref) && hrefConvert(element);
             data.handler && $sdEventListener(element,true);
        }
        //table component internal events
        container.find('[data-onclick],span[data-openwindow-href],[data-handler]').get().forEach(transform);

        return container;
    },
    //To convert data-style attribute to style apply it via jquery css 
    //For CSP inline-style fix
    //container - it should be jQuery element or html string to convert jQuery Element
    applyDataStyle: function (container) {
        // Convert it to fragment if container is string html content
        var getQueryElement = ()=>jQ(SDPTemplate(container).get());
        var convertTojQuery =(containerElem)=>containerElem.jquery ? containerElem : jQ(containerElem);

        // Convert string to element or if exist give same
        var $container = typeof container == 'string' ? getQueryElement() : convertTojQuery(container); 

        $sdStyleConverter($container);

        return $container;
    },
    getTableInfo: function (entity, ref_entity, def_row_count) {
        /* Getting  Personalized Table info object */
        var table_info = {};
        if (entity) {
            var _self = this;
            var entity_key = entity.replace(/\./g, '_');
            table_info = getPersonalizeData(entity_key);
            var full_obj = {};
            var t_g_info = JSON.parse(sdpToJSON(global_table_info));
            if (jQ.isEmptyObject(table_info)) {
                if (!jQ.isEmptyObject(t_g_info)) {
                    full_obj = _self.getFieldsRequiredByString(t_g_info, ref_entity || entity);
                }
                if (full_obj) {
                    table_info = full_obj;
                } else {
                    var list_info = {};
                    list_info.row_count = def_row_count || "10";    // No I18N
                    list_info.start_index = "1";
                    table_info.list_info = list_info;
                }
            } else {
                if (!jQ.isEmptyObject(t_g_info)) {
                    full_obj = _self.getFieldsRequiredByString(t_g_info, ref_entity || entity);
                    if (full_obj) {
                        /*Since we are not personalized search_fields , we need to append it with list_info when page load*/
                        if (full_obj.isDefaultSearch) {
                            table_info.list_info.search_fields = full_obj.list_info.search_fields;
                        }
                    }
                }
            }
        } else {
            var list_info = {};
            list_info.row_count = def_row_count || "10";    // No I18N
            list_info.start_index = "1";
            table_info.list_info = list_info;
        }
        return table_info;
    },
    getFieldsRequiredByString: function (table_info, key) {
        /*To get value from table info file using string key
            ** i.e) if user gives the key like 'project.milestone' ,it will get the output from given object  
            given object
            ------------
            {'project' : {
                'milestone' :{
                        //output value
                    }
                }
           }
        */

        //If key is present in main object itself return that value
        if (key in table_info && table_info[key] != null) {
            return table_info[key];
        }

        var a = key.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];
            if (k in table_info && table_info[k] != null) {
                table_info = table_info[k];
            } else {
                return;
            }
        }
        return table_info;
    },
    getCompiledString: function (dataString, data) {
        /*
            dataString = "Hello '${requester}' for signup";
            data = { "requester" : "Shawn" };
            o/p -> Hello Shawn for signup
        */
       var _self=this;
       var getData =(key,data)=>_self.getFieldsRequiredByString(data,key);

        var compiledString = dataString.replace(/\$(?:\{|%7B)(.*?)(?:\}|%7D)/g, function ($1, $2) {
            return  getData($2,data) || '';
        });
        return compiledString;
    },
    constructTableHeader: function (column_order, fields_required, meta_Org) {
        var header_content = [], header_content_default = [], meta_data = jQuery.extend({}, {}, meta_Org); // To avoid implicit binding
        var fld_keys = Object.keys(fields_required);
        var normalCols = [], defaultCols = [];
        for (var i = 0; i < column_order.length; i++) {
            var col_name = column_order[i],
                fieldObj = {};
            if ((col_name.indexOf("_fields.") > -1 && meta_data[col_name] == undefined) || (meta_data[col_name] && meta_data[col_name].frommeta == true && meta_data[col_name].is_inmeta != true)) {
                delete meta_data[col_name];
                /*
                ** Removing the field from meta_Org(contains frommeta=true), where this field is missing in API metainfo.
                ** When the field is having {frommeta : true} in static metainfo(Client side metainfo), it should be available in API metainfo, otherwise it will be getting deleted
                */
                delete meta_Org[col_name];
                continue;
            } else {


                var tempObj = {
                    "id": col_name //No I18N
                };

                var tempObj1 = jQ.extend(true, {}, meta_data[col_name], tempObj);

                var field_index = fld_keys.indexOf(col_name);
                jQ.extend(true, fieldObj, tempObj1,fields_required[col_name]); //overwrite default width with respect to personalized and other properties
                if (field_index === -1 && fieldObj["default"] !== true) {
                    fieldObj.isHidden = true;
                } else {
                    fieldObj.isHidden = false;
                }
                if(meta_data[col_name] && meta_data[col_name]["default"]){
                    defaultCols.push(col_name);
                    header_content_default.push(fieldObj);
                } else {
                    normalCols.push(col_name);
                    header_content.push(fieldObj);
                }
                delete meta_data[col_name];
            }

        }
        column_order = defaultCols.concat(normalCols);
        var meta_keys = Object.keys(meta_data);
        for (var j = meta_keys.length - 1; j >= 0; j--) { //To add newly added UDF columns
            var locObj = {
                "id": meta_keys[j], //No I18N
                "isHidden": true // No I18N
            };
            var fieldObj = jQ.extend(true, {}, meta_data[meta_keys[j]], locObj);
            header_content.push(fieldObj);
        }

        header_content = header_content_default.concat(header_content);
        return { "header_content": header_content, "column_order": column_order };
    }
}

function sdpAjaxInputData(inputValue, doEscapeString) {
    if (inputValue instanceof Object || typeof inputValue == "object") {
        var outputString = "input_data=" + encodeURIComponent(sdpToJSON(inputValue, doEscapeString)); //No I18N
        return outputString;
    }
    return inputValue;
}

function sdpToJSON(value, doEscape) {
    var output = "";// No I18N
    if (window.Prototype && typeof Ember == "undefined") {
        var _json_stringify = JSON.stringify;
        var _array_tojson = Array.prototype.toJSON;
        delete Array.prototype.toJSON;
        output = _json_stringify(value);
        Array.prototype.toJSON = _array_tojson;
    } else {
        output = JSON.stringify(value);
    }
    if (doEscape && output.indexOf("\\") > -1) {// No I18N
        output = output.replace(/\\\\/g, '\\\\\\\\');// No I18N
    }
    return output;
}
//To Stop bootstrap dropdown close, when dropdown item click
//dropItemElement - dropdown click element
function stopCloseDropdown(element,isBtnParent) {
    //SD-118424 - left panel column chooser issue
    var $elem = isBtnParent ? jQ(element) : jQ(element).parent();
    var $elemParentBtn = $elem.parents('div.btn-group');//for left panel column chooser fix
    var stopClose = (evt)=>evt.preventDefault();
    $elem.one('hide.sdp.sdmenu',stopClose);
    $elemParentBtn.length && $elemParentBtn.one('hide.sdp.sdmenu',stopClose);
    //off the event after the our click done  for scenario two call for checkbox label click
    function removeEvent(){
        $elem.off('hide.sdp.sdmenu');
        $elemParentBtn.length && $elemParentBtn.off('hide.sdp.sdmenu');
    }
    setTimeout(removeEvent,1);
}

/*Below method is encode the html data in Ember and Non Ember pages */
function e_html(val) {
    if (typeof Ember == "undefined") {
        val = encodeHTML(val);
    }
    else {
        val = Ember.Handlebars.Utils.escapeExpression(val);
    }
    return val;
}

/**
    * Below method is encode the html Attributes data in Ember and Non Ember pages
    * @param data {string} - Data needs to be encoded
* */
function e_attr(data) {
    if (typeof Ember == "undefined") {
        if (!data || (typeof enableEncoding !== "undefined" && !enableEncoding)) {
            return data;
        }
        return $ESAPI.encoder().encodeForHTMLAttribute(data);
    }
    else {
        return Ember.Handlebars.Utils.escapeExpression(data);
    }
}

function e_param(data) {
    if (typeof Ember == "undefined") {
        if (!data || (typeof enableEncoding !== "undefined" && !enableEncoding)) {
            return data;
        }
        data = data.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\t/g, '\\t').replace(/\v/g, '\\v');
        data = encodeURIComponent(data)
        data = data.replace(/'/g, "\\'").replace(/"/g, '\\"');

        return data;
    }
    else {
        return Ember.Handlebars.Utils.escapeExpression(data);
    }
}

var clientErrorHandling = {
    error: function (e) {
        console.error(e);
    },
    log: function (e) {
        console.error(e);
    },
    warn: function (e) {
        console.warn(e);
    }
}

//construct span tag for copy ticket
function constructCopyTicketSpan(option) {
    var span = document.createElement('span');
    span.classList.add('sdp-copy-text','copy-ticket-holder','sdp-init-component');
    span.dataset.id = option.id;
    span.dataset.module = option.module;
    span.dataset.viewType = option.viewType;
    span.dataset.containerId = option.containerId;
    option.dataPath && (span.dataset.dataPath = option.dataPath);
    span.dataset.eventName = 'requestListTable';
    span.textContent = option.id;
    var spanHTML = span.outerHTML;
    return spanHTML;
}


