"use strict";// No I18N
var assetFailedWsList = {
    filterData: {"product_type":0,"scanned_on":"last_scan"}, //No i18n
    /**
     * Initiate failed workstation/computer listview
     */
    init: function(){
        const self = this;
        const days=getUrlParameterByName("auditFilter");//No i18n
        if (days==null){
            self.filterData.scanned_on = "last_scan"//No i18n
        } else {
            self.filterData.scanned_on = days
        }
        const productType=getUrlParameterByName("productType");//No i18n
        if (productType!=null){
            self.filterData.product_type = productType
        }
        self.setPersonaizedFilter();
        self.loadListView();
        self.loadSelect2ForScannedOn();
        self.loadSelect2ForComputerProductType();
    },
    /**
     * Construct row of the failed computers table listview
     * @param {object} table_info 
     * @returns 
     */
    rowDataConstruct: function(table_info){
        let inputObject = {};
        let fields_required = table_info.fields_required;
        let fields_required_arr = Object.keys(fields_required);
        let fieldRequiredAddl = ["name", "module", "site", "os_name", "last_scan_status_code"];//NO I18N
        fields_required_arr = fields_required_arr.concat(fieldRequiredAddl);
        inputObject.fields_required = fields_required_arr;
        inputObject.list_info = table_info.list_info;
        inputObject.list_info.search_criteria = assetFailedWsList.getFilterCriteria();
        inputObject.list_info.asset_filter_by =assetFailedWsList.getFilter();
        return inputObject;
    },
    /**
     * Callback function after table render
     */
    callbackTableRender: function () {
        const parentEle = jQuery("#failed_ws_list_container");
        if (assetFailedWsList.tableObject.visibleContents.length < 1) {
            parentEle.find("#load_export_dialog").addClass('disabled');
        }
        else {
            parentEle.find("#load_export_dialog").removeClass('disabled');
        }
        parentEle.find("#load_export_dialog").on("click",function () { //No I18N
            assetFailedWsList.exportListViews.render({
                title: translate('sdp.inventory.export.dataandpush.exportingData'), //No I18N
            });
        });
        /**On click function for export assets in dropdown from listview */
        jQuery(document).off("click.exportlistview").on("click.exportlistview", "#export_listview", function () { //No I18N
            assetFailedWsList.exportListViews.export();
        });
        let nodesList = document.querySelectorAll('[sdphrefJs*="js-href-asset-failed-list-"]');//No I18N
        nodesList.forEach(function(node){
            node.addEventListener("click", function(event) {
                event.preventDefault();
                assetsObj.loadAssetDetailPopup(node.dataset.id,node.dataset.module);
            });
        });
    },
    /**
     * Execute function to Load listview by calling table component with constructing metainfo and options
     */
    loadListView: function() {
        const self = this;
        let metaInfo;
        sdpAjax({
            url:"/api/v3/asset_computers/_metainfo", //NO I18N
            async:false,
            success: function(response){
                metaInfo = response.metainfo;
            },
        });
        let keys = Object.keys(metaInfo.fields);
        keys.forEach(function(key){
            if(metaInfo.fields[key].for_list_view === false && key != "last_scan_status_code"){
                delete metaInfo.fields[key];
            }
        });
        let links;
        sdpAjax({
            url:"/api/v3/asset_computers/_links", //NO I18N
            async:false,
            success: function(response){
                links = response._links;
            },
        });
        let permissions = {
            delete : false,
            scan_now : false,
            change_scan_credential : false
        };
        links.forEach(function (link) {
            if(link.method == "delete" && link.name == "delete"){ //NO I18N
                permissions.delete = true;
            }else if(link.name == "scan_now"){ //NO I18N
                permissions.scan_now = true;
            }else if(link.name == "change_scan_credential"){ //NO I18N
                permissions.change_scan_credential = true;
            }
        });
        let table_info = getPersonalizeData("failed_ws"); //NO I18N
        if(jQuery.isEmptyObject(table_info)){
            let fields_required = {};
            let columnOrder = ["name", "last_scan_time", "site"]; //NO I18N
            columnOrder && columnOrder.forEach(function(field) {
                fields_required[field] = {};
            });

            let list_info =  { "sort_field": "name", "sort_order": "asc", "row_count": "25"};  // No I18N
            table_info.fields_required = fields_required;
            table_info.list_info = list_info;
        }
        let table_content = {};
        let table_header={
                failed_ws_list_head_chk : {
                        "type" : "icon", // No I18N
                        "default" : true, // No I18N
                        headCellTransformer : function(){
                            return `<input type="checkbox" id="failed_ws_list_head_chk" class="ml5">`; // No I18N
                        },
                        dataCelltransformer: function (table_info) {
                            return `<span class="pull-left ml5"><input type="checkbox" name="checkbox" value="${table_info.row_data.id}" data-table-checkbox ></span>`;
                        }
                    },
                name :{
                        "checkbox_disable": true,// No I18N
                        dataCelltransformer: self.constructName
                    },
                last_scan_history_description:{
                            "display_name":translate("sdp.inventory.asset.failedwslistview.errormessage"),// No I18N
                            dataCelltransformer: self.getErrorMsg
                    },
                last_scan_time:{
                            "display_name": translate("sdp.inventory.asset.failedwslistview.lastscanned"),// No I18N
                            frommeta: true
                    },
                site:{
                            frommeta: true,
                    }
                }
        table_content.header = table_header;
        let table_options = {
            callbackURL                 : "asset_computers", //NO I18N
            entity_name                 : "asset_computers", //NO I18N
            paginationEnabled           : true,
            searchEnabled               : true,
            sortingEnabled              : true,
            multiDeleteEnabled          : permissions.delete,
            refreshEnabled              : true,
            columnChooserEnabled        : true,
            getmetaInfo                 : true,
            staticHeader                : true,
            callbackRowfunction         : self.rowDataConstruct,
            row_inputdata               : self.rowDataConstruct(table_info,{}),
            personalize_key             : "failed_ws", //NO I18N
            discard_without_displayname : true,
            isODAPI                     : true,
            width                       : jQuery(window).width() -  40,
            tableHolder                 : "failed_ws_list", //NO I18N
            bulkSelectionSetting        : {enabled: true},
            callbackAfterBodyRender     : self.callbackTableRender,
            default_sort_field          : { "sort_field": "name", "sort_order": "asc" }, //No I18N
            meta_data                   : metaInfo,
            max_allowed_fields          : 50
        };
        renderhbs("#failed_ws_list_container", "asset-scan-troubleshoot-listview", permissions, false, "assets"); // No I18N
        self.tableObject = new tableComponent(table_info, table_content, table_options, self);
    },
    /**
     * Execute function to construct name 
     * @param {object} row 
     * @returns 
     */
    constructName: function(row){
        const row_data = row.row_data,
              id = row_data.id,
              name = row_data.name,
              module = row_data.module.api_plural_name;
        let iconStr;
        if(row_data.icon){
            iconStr = row_data.os_name != null ? `<span class="icon-sd vmiddle disp-ib" style="background: url('${e_attr(row_data.icon)}') no-repeat"></span>` : `<span class="icon-md vmiddle disp-ib" style="background: url('${e_attr(row_data.icon)}') no-repeat"></span>`//No i18n
        }
        else{
            iconStr = "";
        }

        return iconStr+"<a href='/' sdphrefJs='js-href-asset-failed-list-"+id+"' data-id='"+id+"' data-module='"+e_attr(module)+"' title='"+e_attr(name)+"' rel='uitip noopener' mode_ellipsis='true'> "+e_html(name)+"</a>";//No i18n
    },
    /**
     * Construct row  function for field Error message 
     * @param {object} row 
     * @returns 
     */
    getErrorMsg: function(row){
        const row_data = row.row_data;
        if(row_data.last_scan_status_code){
            const url = row_data.last_scan_status_code.link;
            return `<a href='${url}' rel="noopener uitip" target="_blank" title='${e_attr(row_data.last_scan_history_description)}'>${e_html(row_data.last_scan_history_description)}</a>`;
        }else{
            return '-';
        }
    },
    /**
     * Execute to load select2 scanned function
     */
    loadSelect2ForScannedOn: function(){
        const self = this, parentEle = jQuery("#failed_ws_list_container"),
              scannedDisplayKeys = {"last_scan":translate("sdp.inventory.failedwslistview.filter.lastscan"),"7":translate("sdp.inventory.failedwslistview.filter.last7days"),"30":translate("sdp.inventory.failedwslistview.filter.last30days"),"90":translate("sdp.inventory.failedwslistview.filter.last90days")}, //No i18n
              scannedOptions = [
                { text: translate("sdp.inventory.failedwslistview.filter.lastscan"), id: "last_scan" },// No I18N
                { text: translate("sdp.inventory.failedwslistview.filter.last7days"), id: "7" },// No I18N
                { text: translate("sdp.inventory.failedwslistview.filter.last30days"), id: "30" },// No I18N
                { text: translate("sdp.inventory.failedwslistview.filter.last90days"), id: "90" }// No I18N
            ],
            options = {
                data: scannedOptions,
                allowClear: false
            },
            selectedValue = {
                id: self.filterData.scanned_on ,text:scannedDisplayKeys[self.filterData.scanned_on]
            }
            parentEle.find("#scanned_on_filter").select2(options);
            parentEle.find("#scanned_on_filter").select2("data",selectedValue);//No i18n
            parentEle.on("change","#scanned_on_filter", function(){
                self.filterData.scanned_on = parentEle.find("#scanned_on_filter").val();
                self.refreshList();
            });
    },
    /**
     * Load product type dropdown using hierarchy component
     * @returns 
     */
    loadSelect2ForComputerProductType: function(){
        const hierarchyOptions = {
            url: "/api/v3/asset_computers/module", //No I18N
            entity: "module", //No I18N
            inputData: {list_info:{row_count:100, start_index:1, "sort_field" : "display_name", "sort_order" : "asc"}, "for" : "computer_unscanned"}, //No I18N
            id : "computer_product_type_filter", //No I18N
            placeholder: translate("sdp.admin.product.listview.type"),
            allowClear: false,
            selectedValue: assetFailedWsList.filterData.product_type && assetFailedWsList.filterData.product_type != "0"? {"id" : assetFailedWsList.filterData.product_type} : 0,
            defaultOption : {"id": 0, "display_name": translate("asset.failed.list.filter.default")},//No I18N
            width: 250,
            displayField : "display_name" // NO I18N
        }
        hierarchySelect2.init(hierarchyOptions);
        jQuery("#failed_ws_list_container").on("change","#computer_product_type_filter",function(){ //No i18n
            assetFailedWsList.filterData.product_type = jQuery("#computer_product_type_filter").val(); //No i18n
            assetFailedWsList.refreshList();
        })
        return

    },
    setPersonaizedFilter: function () {
        var self = this;
        var id = self.filterData.product_type;
        if (!id) {
            return true;
        }
        return sdpAjax({
            url: "/api/v3/asset_computers/module",// No I18N
            data: sdpAjaxInputData({
                list_info: {
                    search_criteria: {
                        "field" : "id",         // No I18N
                        "condition" : "is",     // No I18N
                        "value": id             // No I18N
                    }
                },"for" : "computer_unscanned" // No I18N
            }),
            async: false,
            success: function (response) {
                var data = response.module[0]; 
                if (!data) {
                    self.filterData.product_type = "0"; // No I18N
                }
            },
            ignorefailuremessage: true
        });
    },
    /** 
     * Execute function to refresh table in table component
     */
    refreshList: function(){
        const self = this, parentEle = jQuery("#failed_ws_list_container");
        delete self.tableObject.t_obj.table_info.list_info.search_criteria;
        self.tableObject.t_obj.table_info.list_info.search_criteria = self.getFilterCriteria();
        self.tableObject.t_obj.table_info.list_info.asset_filter_by = self.getFilter();
        self.tableObject.refreshTable("refresh"); //No i18n
        if (self.tableObject.visibleContents.length < 1) {
            parentEle.find("#load_export_dialog").addClass('disabled');
        }
        else {
            parentEle.find("#load_export_dialog").removeClass('disabled');
        }
    },
    /**
     * Execute function to Get search criteria for filter
     * @returns 
     */
    getFilterCriteria: function(){
        let new_criteria = []
        const self = this;
        if(self.filterData.product_type != 0 && self.filterData.product_type != "0"){
            new_criteria.push({
                "field": "module.id", // No I18N
                "value": self.filterData.product_type, // No I18N
                "condition": "is", // No I18N
                "logical_operator": "AND" // No I18N
            });
        }
        return new_criteria;
    },
    /**
     * Execute function to Get filter object 
     * @returns 
     */
    getFilter: function(){
        const self = this;
        if(!(self.filterData.scanned_on === "last_scan")){
            return {"name": "computer_unscanned", "days": self.filterData.scanned_on}; //NO I18N
        } else {
            return {"name": "computer_failed_scan"}; //NO I18N
        }
    },
    /**
     * Execute function while confirming to scan
     * @param {string} msg 
     * @returns 
     */
    confirmToScan: function(msg){
        const typename = jQuery("#computer_product_type_filter").select2("data").display_name;//No i18n
        const errmsg = translate(msg,[e_html(typename)]);
        const selectedRecords = assetFailedWsList.tableObject.bulkSelect.selectedRecords;
        if(!this.isValid(selectedRecords, errmsg)){
            return;
        }
        let form = document.getElementById("groupscanform");//No i18n
        let ids = "";
        for (let id in selectedRecords) {
            ids += id + ";";
        }
        const ciIds = ids;
        if(form == null){
            jQuery(document.body).append(
             `<form id="groupscanform" action="/DomainDiscovery.do?action=getwsidtoscan&isgroupScan=true" method="POST" target="Scan_WS"><input type="hidden" name="ciId" value="${ciIds}"><input type="hidden" name="isFromCMDB" value="false"><input type="hidden" name="type" value="${typename}"><input type="hidden" name="${getCSRFParamName()}" value="${getCSRFParamValue()}"></form>`);//No i18n
            form = document.getElementById("groupscanform");//No i18n
        }
        window.open('about:blank', 'Scan_WS', 'scrollbars=yes,menubar=no,height=450,width=810,resizable=yes,toolbar=no,status=no,rel=noopener');//No i18n
        form.submit();
        jQuery('#groupscanform').remove();//No i18n
    },
    /**
     * Execute function while confirming changes
     * @param {string} msg 
     * @returns 
     */
    confirmChangeCredentials: function(msg){
        const typename = jQuery("#computer_product_type_filter").select2("data").display_name;//No i18n
        const errmsg = translate(msg,[e_html(typename)]);
        const selectedRecords = assetFailedWsList.tableObject.bulkSelect.selectedRecords;
        if(!this.isValid(selectedRecords, errmsg)){
            return;
        }
        const url = '/WsScanSettings.do?operation=changeforbulk&isBulk=true&isWorkstation=true'; //NO I18N
        NewWindow(url,'Scan_WS','640','260','yes','center', null, null, null, false);//No I18N
    },
    /**
     * Check and return value if form is valid or not
     * @param {object} selectedRecords 
     * @param {string} msg 
     * @returns 
     */
    isValid: function(selectedRecords, msg){
        if(Object.keys(selectedRecords).length == 0){
            showalert("failure",translate(msg),"isAutoHide=true"); //No i18n
            return false;
        }
        return true;
    },
    /**
     * return tableobj arrat after concat with "," separated
     * @returns 
     */
    getSelectedResources: function()
    {
        let tempArray = "";
        var getTableObj = Object.keys(assetFailedWsList.tableObject.bulkSelect.selectedRecords);
        for(let i = 0;i<getTableObj.length;i++){
            tempArray = tempArray + getTableObj[i] + ',';
        }
        tempArray = tempArray.slice(0,tempArray.length-1);
        return tempArray;
    },
    /**
     * return tableobj array after concat with ";" separated used for Bulk Save Creds
     * @returns
     */
    getSelectedResourcesWithSemiColon: function()
    {
        let tempArray = "";
        var getTableObj = Object.keys(assetFailedWsList.tableObject.bulkSelect.selectedRecords);
        for(let i = 0;i<getTableObj.length;i++){
            tempArray = tempArray + getTableObj[i] + ';';
        }
        tempArray = tempArray.slice(0,tempArray.length-1);
        return tempArray;
    },
    /**
     * Export list view inside failed workstation listview
     */
    exportListViews : {
        context: {},
        /**Object for exporting type list */
        exportModal: function() {
            this.context.formats = [{
                key: 'HTML',    //NO I18N
                name: translate('ae.export.format.html'),   //NO I18N
                icon_class: 'attachment-sprite attach-ie',       //NO I18N
                checked: "checked"  //NO I18N
            }, {
                key: 'XLS', //NO I18N
                name: translate('sdp.reports.customreport.xls'),    //NO I18N
                icon_class: 'attachment-sprite attach-xls',  //NO I18N
                checked: ""  //NO I18N
            }, {
                key: 'XLSX', //NO I18N
                name: translate('reports.customreport.xlsx'),    //NO I18N
                icon_class: 'attachment-sprite attach-xls',  //NO I18N
                checked: ""  //NO I18N
            }, {
                key: 'PDF', //NO I18N
                name: translate('sdp.reports.customreport.pdf'),    //NO I18N
                icon_class: 'attachment-sprite attach-pdf',  //NO I18N
                checked: ""  //NO I18N
            }, {
                key: 'CSV', //NO I18N
                name: translate('sdp.reports.customreport.csv'),    //NO I18N
                icon_class: 'attachment-sprite attach-file', //NO I18N
                checked: ""  //NO I18N
            }];
        },
        /**
         * Execute funtion to Export failed workstation listview
         */
        export: function(){
            const type = jQuery('input[name="export-format"]:checked').val();
            let list_info = assetFailedWsList.tableObject.t_obj.table_info.list_info;
            delete list_info.has_more_rows;
            delete list_info.end_index;
            delete list_info.total_count;
            delete list_info.sort_valuepath;

            let options = {
                type: type,
                list_info: assetFailedWsList.tableObject.t_obj.table_info.list_info,
                module: assetFailedWsList.tableObject.t_obj.options.entity_name,
                title: translate("sdp.inventory.assethome.unauditedworkstations")//No I18N
            }
            options.list_info.fields_required = Object.keys(assetFailedWsList.tableObject.t_obj.table_info.fields_required);
            assetFailedWsList.exportListViews.exportView(options);
        },
        /**Initiate function */
        init: function () {
            this.exportModal();
            this.context.info = translate('ae.mc.export.info.rowlimit');    //NO I18N
        },
        /**
         * Render export function
         * @param {object} options 
         */
        render: function (options) {
            const _self = this,
                 totalRecords = assetFailedWsList.tableObject.visibleContents.length || 0;
            if (totalRecords > 0) {
                if (assetFailedWsList.tableObject.t_obj.table_info.fields_required) {
                    _self.init(options);
                    if (!jQuery("#exportlistview").length) { //No I18N
                        jQuery('body').append("<div id='exportlistview'></div>"); //NO I18N
                    }
                    this.context = jQuery.extend(true, _self.context, options);
                    renderhbs("#exportlistview", "export-view", this.context, false, 'common');//NO I18N
                    jQuery("#export_listview").parent().next().attr("data-handler","assetFailedWsList.exportListViews.closedialog()");
                    var title = translate("sdp.inventory.assethome.unauditedworkstations"); //NO I18N
                    jQuery("#exportlistview").dialog({ //No I18N
                        title: translate("ae.cmdb.relationshipmap.helpcontent.Exportas")+" "+title,
                        width: 500,
                        close: function () {
                            jQuery(this).dialog("close").remove(); //NO I18N
                        }
                    })
                }else {
                    showalert('info',translate('ae.mc.export.invalidcolumns'), 'isAutoHide=true');   //NO I18N
                }
            }
        },
        /**To preview export view of listview 
         * @param {object} options 
        */
        exportView: function (options) {
            let input_data = {
                "export": { //No I18N
                    "format": options.type, //No I18N
                },
                "list_info": options.list_info //No I18N
            }
            if(options.title){
                input_data["export"]["title"] = options.title;
            }
            try {
                let link = document.createElement("a");
                const fileType = options.type.toLowerCase();
                link.download = (options.title ? options.title : Date.now()) + "."+fileType;
                link.href = "/api/v3/" + encodeHTMLAttribute(options.module) + "/export?" + sdpAjaxInputData(input_data);
                link.click();
                jQuery('#exportlistview').dialog('close'); //No I18N
            } catch (e) { }
        },
        closedialog: function() {
            jQuery('#exportlistview').dialog('close').remove(); //NO I18N
        }
    }
}
