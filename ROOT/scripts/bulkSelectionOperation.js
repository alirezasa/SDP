function bulkSelectionOperation(tableInstance,options) {
    "use strict";

    var bulkSelectOperation = {
        tableId: null, //module name. e.g "users"
        selectedRecords: {},//has IDs of the selected records/rows id.
        loadedRecords: {},  //current page records of the list view.
        selectedRecordsCount: 0,
        constructSelectedListCB: null,//callback function for constructing dropdown menu list.
        selectionLimit: 100,
        selectedModule: "",
        init: function (options) {
            jQuery.extend(true, this, options);
            this.constructSelectedListCB = options.constructSelectedListCB || this.constructSelectedDefaultCB;
            this.selectionLimit = options.selectionLimit || this.selectionLimit;
            this.selectedRecordsCount = this.getSelectedIDs().length;
        },
        constructSelectedDefaultCB: function (data) {
            var str = data[this.selectionDisplayField] || data.name;
            return '<span rel="uitip" mode_ellipsis=true title="' + e_attr(str) + '">#' + data.id + ' ' + e_html(str) + '</span>';
        },
        initEvents: function () {
            var _self = this, tableId = this.tableId;
            var selectedMenu = jQ("#selected_" + tableId + "_ul");
            var bulkClearBtn = jQ("#bulk_unselect_" + tableId);
            function clearAll() { 
                var checkboxes = _self.getSelectedCheckbox();
                checkboxes.trigger('click'); // uncheck checkbox by click programatically
                _self.resetSelectedRecords();
                _self.removeRowSelection(checkboxes);
            }

            function loadList() {
                jQ("#selected_" + tableId + "_list").empty();//clear previous data.
                _self.appendRecordsToMenu(jQuery.map(_self.selectedRecords, (value)=> value ));
            }

            jQ('[data-' + tableId + '-action="menu-search"]').menuSearch();
            
            selectedMenu.off('.bulk-select').on('click.bulk-select',function(){stopCloseDropdown(this)});
            bulkClearBtn.off('.bulk-select').on('click.bulk-select', clearAll);

            //load the selected records to the bulk edit dropdown menu.
            jQ("#selected_" + tableId + "_button").off('.bulk-select').on("click.bulk-select", loadList);

        },
        clearMenuItem: function (clearBtn) {
            var _self = this;
            clearBtn = jQ(clearBtn);
            var id = clearBtn.attr("data-" + _self.tableId + "-id");//getting id of the record.
            var getTableDiv = ()=>{
                return _self.view == "kanban" ? "#" + _self.tableId + "_kanban_div .cv-task-item" : "#" + _self.tableId + "_body >tr.tc-row td " ;
            }
            var tableDiv = getTableDiv();

            var checkBox = jQ(tableDiv + " input[type='checkbox'][value=" + id + "][data-table-checkbox]:not([disabled])");

            stopCloseDropdown(clearBtn); // to stop close dropdown on remove item click
            clearBtn.closest("li").remove();//remove item from dropdown list.

            if (checkBox.length > 0) {
                //check box unselected is visible case
                checkBox.trigger('click'); // uncheck visible checkbox by click programmatically
            } else {
                //checkbox unselected is not in view
                _self.removeRecord(id);
                _self.setSelectedRecordsCount();
                typeof _self.unSelectionCallback == "function" && _self.unSelectionCallback([]);
                _self.selectedRecordsCount == 0 && _self.resetSelectedRecords();
            }
        },
        getSelectedIDs: function () {
            return Object.keys(this.selectedRecords);
        },
        addRecord: function (id) {        
            if (!this.selectedRecords.hasOwnProperty(id)) {
                if (this.selectionLimit !== -1 && this.selectedRecordsCount >= this.selectionLimit) {
                    var msg = this.localTranslate("sdp.listview.bulkedit.limit.message", [this.selectionLimit]);
                    showalert('failure', msg, "isAutoHide=true"); // No I18N
                    return false;
                }
                this.selectedRecordsCount++;
            }
            this.selectedRecords[id] = this.loadedRecords[id];//add or update record.
            return true;
        },
        addRowSelection: function (checkbox) {
            this.setSelectedRecordsCount();
            typeof this.selectionCallback == "function" && this.selectionCallback(checkbox);
        },
        removeRowSelection: function (checkboxes) {
            var _self = this;
            this.setSelectedRecordsCount();
            typeof _self.unSelectionCallback == "function" && _self.unSelectionCallback(checkboxes);
            _self.selectedRecordsCount == 0 ? _self.selectedModule = "" : "";
        },
        selectRecord: function (checkbox) {
            if (this.addRecord(checkbox.value)) {
                this.addRowSelection(checkbox);
                return true;
            }
            return false;
        },
        removeRecord: function (id,checkbox) {
            if (this.selectedRecords.hasOwnProperty(id)) {
                delete this.selectedRecords[id];
                this.selectedRecordsCount--;
            }
            checkbox && this.unSelectAll(checkbox);
        },
        selectAllRecords: function (isSelectAll) {
            var _self = this, tableDiv = "#" + _self.tableId + "_body";
            if (_self.view == "kanban") { // No I18N
                tableDiv = "#" + _self.tableId + "_kanban_div >.tc-row ";
            }
            var checkboxSelector = isSelectAll ? ':not(:checked)':':is(:checked)';
            var foundCheckbox = jQ(tableDiv + " input[type='checkbox'][data-table-checkbox]:not([disabled])"+checkboxSelector)
            foundCheckbox.prop('checked',isSelectAll).trigger('change',['fromSelectAllRecords']);
        },
        getSelectedCheckbox:function(){
            var _self = this;
            var tableDiv = "#" + _self.tableId + "_body";
            if (_self.view == "kanban") { // No I18N
                tableDiv = "#" + _self.tableId + "_kanban_div >.tc-row ";
            }

            var getValues=()=>{
                var  values = Object.keys(_self.selectedRecords);
                var makeValue =(value)=>'[value="'+value+'"]';
                return values.map(makeValue).join(',');
            }
            var currentCheckboxes = jQ(tableDiv + " input[type='checkbox'][data-table-checkbox]:not([disabled])").filter(getValues());
            return currentCheckboxes;
        },
        //selects the records when the user navigates/revists to the page where the selected records were selected.
        reSelectRecords: function () {
            var _self = this, actionBtn;
            var hasSelectedRecords =()=> Object.keys(_self.selectedRecords).length>0;
            if(!hasSelectedRecords()) {
                //skip if no record selected
                return;
            }

            var currentCheckboxes = _self.getSelectedCheckbox();
            currentCheckboxes.trigger('click');  // check visible checkbox by click programmatically

            if (this.selectedRecordsCount) {
                actionBtn = jQ('#' + this.tableId + '_btn_delete, [data-link="' + this.tableId + '"]');
                actionBtn.prop("disabled", false);
                this.setSelectedRecordsCount();
            }
        },
        //unselects all the pages selected records.
        unselectBulkRecords: function () {
            this.resetSelectedRecords();
            this.unSelectAll();
        },
        //unselects all the records of the current page.
        unSelectAll: function (checkbox) {
            checkbox ? this.removeRowSelection(jQ(checkbox)) : this.removeRowSelection(jQ(this.checkBoxes));
        },
        //updates selected records count for the bulk update.
        setSelectedRecordsCount: function () {
            var count = this.selectedRecordsCount;
            jQ("#selected_records_count_" + this.tableId).text(count);
            this.switchBulkEditMenu(count > 0);
        },
        //show bulk edit elements and hide non action elements or vice versa.
        switchBulkEditMenu: function (isBulkEdit) {
            var bulkAction = jQ("[data-bulk-action='" + this.tableId + "']");
            var nonBulkAction = jQ("[data-non-action='" + this.tableId + "']");
            var actionBtn = jQ('#' + this.tableId + '_btn_delete, [data-link="' + this.tableId + '"]');
            actionBtn.prop("disabled", !isBulkEdit);
            if (isBulkEdit) {
                show(bulkAction);
                hide(nonBulkAction);
            } else {
                show(nonBulkAction);
                hide(bulkAction);
            }
            function hide(e) {
                e.each(function () { this.style.setProperty("display", "none", "important"); });
            }
            function show(e) {
                e.each(function () { this.style.setProperty("display", "inline-block", "important"); });
            }
        },
        //appends selected records to the dropdown menu.
        appendRecordsToMenu: function (list) {
            var _self = this, tableId = _self.tableId;
            var menuList = [], container = jQ("#selected_" + _self.tableId + "_list");
        
            for (var i = 0, l = list.length; i < l; i++) {
                var data = _self.selectedModule ? list[i][_self.selectedModule] : list[i];
                menuList[i] = ' <li class="p5" ><span class="text-overflow disp-ib text-color2 cl-title vmiddle" data-style="width: calc(100% - 20px);">' + this.constructSelectedListCB(data) + '</span>' +
                    '        <span class="insertoption vmiddle pos-rel top-3" >\n' +
                    '            <span title="' + this.localTranslate("sdp.common.remove") + '" class="cspr icon-sm close-red cur-ptr a11yemphasize" data-' + tableId + '-id="' + data.id + '"> </span>\n' +
                    '        </span> \n' +
                    '    </li>';
            }
            var menuElement = table_comp.applyDataStyle(menuList.join(''));
            container.append(menuElement);
            initTooltip("#selected_" + this.tableId + "_ul");
            //dropdown list items clear button.
            container.off('.bulkSelect').on('click.bulkSelect',"[data-" + tableId + "-id]", function () { _self.clearMenuItem(this); });
            jQ("#selected_" + tableId + "_ul").find(".sdp-glyph-failure").trigger("click");
        },
        //resets selected records for the bulk selection.
        resetSelectedRecords: function () {
            this.selectedRecords = {};
            this.selectedRecordsCount = 0;
            this.setSelectedRecordsCount();
            this.selectedModule = "";
        },
        getDropDownHTML: function () {
            var tableID = this.tableId;
            var headCheckBox = this.view == "kanban" ? '<input class="vmiddle" type="checkbox" id="' + tableID + '_head_chk"/>' : "";

            var dropDown = '<div data-bulk-action="'+tableID+'" data-style="display: none;" class="fl"><div class="btn-group bs-noconflict mr10 fl p3 sd-bulk-select" >'+ headCheckBox +
            '    <span  data-switch="sdmenu" class="sdmenu-toggle vmiddle disp-ib cur-ptr"  id="selected_' + tableID + '_button" data-i18n-key="common.selected.records">' + this.localTranslate("common.selected.records", ['<span id="selected_records_count_' + tableID + '">0</span>']) + '<span class="caret ml5"></span></span>'+
            '    <ul class="sdmenu-dd w-320px p0 colchoose" id="selected_' + tableID + '_ul">'+
            '        <li class="search-box ui-component-li">'+
            '            <div class="p10 sdpsearch-group pos-rel search-box z-ind1">'+
            '                <span class="cspr search icon-sm  opac5 pos-abs top15 left10 mt2 ml10"></span>'+
            '                <input type="text" data-' + tableID + '-action="menu-search" placeholder="' + this.localTranslate("common.search") + '" class="form-control m0 pl30 pr30 srchfiltertxt" autofocus="on" autocomplete="off"><span class="sdp-glyph sdp-glyph-failure p10" title="' + this.localTranslate("admin.search.clear") + ' " ></span></div>'+
            '               <ul class="content-list p5 pt0 maxh-40vh h-auto list-nostyle" id="selected_' + tableID + '_list"></ul>' +
            '        </li>'+
            '               </ul>'+
            '<span class="v-bar">&nbsp;</span>'+
            '<span  class="fr pr5 pl10 cur-ptr" id="bulk_unselect_' + tableID + '" title="' + this.localTranslate("common.clearall") + '"><span class="cspr icon-sm close-red vmiddle"></span></span></div></div>';
            return dropDown;
        }
    };

    function init(){

        tableInstance.t_obj.options.isBulkSelectEnabled = true;
        tableInstance.bulkSelect = bulkSelectOperation;
        var settings = Object.assign({}, options.bulkSelectionSetting);
        var addSettings = {
            tableId: tableInstance.tableId,
            localTranslate: tableInstance.localTranslate,
            view: tableInstance.t_obj.options.view,
        }
        options.bulkAssociate && (addSettings.bulkAssociate = true)
        settings = Object.assign(settings, addSettings);
        tableInstance.bulkSelect.init(settings);
    }

    init();
}
