"use strict";// No I18N
var assetHistoryList = {
    /**
     * Execute function to initiate asset history listview 
     */
    init: function () {
        const self = this;
        self.options = self.getOptions();
        renderhbs('#asst_history_list_container', 'asset-history-list-view', self.options,false,"assets");// No I18N
        self.loadListView(self.options);
    },
    /**
     * Execute function to get listview options
     * @returns 
     */
    getOptions: function () {
        const urlParams = new URLSearchParams(window.location.search);
        const operationTime = urlParams.get('operationTime');
        const operationType = urlParams.get('operationType');
        const options = {
            days_count: operationTime,
            audit_filter: operationType
        };
        return options;

    },
    /**
     * Execute function to get row input data
     * @param {object} table_info 
     * @returns 
     */
    getRowInputData: function (table_info) {
        const self = this;
        let inputObject = {};
        const days_count = self.options.days_count;
        let list_info = table_info ? table_info.list_info : {};
        inputObject.fields_required =["asset_info.name", "asset_info.module","operation_time","asset_operation_status_entity","operation_owner","asset_operation_source_entity","field_name", "field_display_name", "new_value","old_value","operation","operation_name","is_display_key"];// No I18N
        list_info.search_criteria = [];
        list_info.search_criteria.push(self.getScanCriteria());
        list_info.search_criteria.push(self.getOperationTimeCriteria(days_count));
        inputObject.list_info = list_info;
        inputObject.for = self.getAuditFilterCriteria();
        return inputObject;
    },
    /**
     * Execute function to initiate audit filter 
     * @param {object} options 
     */
    initAuditFilter: function (options) {
        const self = this, parentEle = jQuery("#asst_history_list_container");
        /**Already discussed with client team for default data yet we are not supported to sdp_select2 so we use select2 */
        parentEle.find("#audit_filter").select2({
            data: [
                { id: "all", text: getMessageForKey("sdp.asset.auditlistview.filter.allChanges") }, // No I18N
                { id: "hardware", text: getMessageForKey("sdp.asset.auditlistview.filter.allHWChanges") }, // No I18N
                { id: "software", text: getMessageForKey("sdp.asset.auditlistview.filter.allSWChanges") }, // No I18N
                { id: "processor", text: getMessageForKey("sdp.asset.auditlistview.filter.allProcessorChanges") }, // No I18N
                { id: "memory", text: getMessageForKey("sdp.asset.auditlistview.filter.allMemChanges") }, // No I18N
                { id: "network", text: getMessageForKey("sdp.asset.auditlistview.filter.allNWChanges") }, // No I18N
                { id: "hard_disk", text: getMessageForKey("sdp.asset.auditlistview.filter.allHDChanges") }, // No I18N
                { id: "other_hardware", text: getMessageForKey("sdp.asset.auditlistview.filter.allOtherChanges") } // No I18N
            ],
            minimumResultsForSearch: -1
        }).val(options.audit_filter).trigger('change');
        parentEle.on("change","#audit_filter", function (evt) {
            self.tableObject.changeFilterString("clearOnly");// No I18N
            self.options.audit_filter = evt.val;
            self.refreshTable();
        });
    },
    /**
     * 
     * @param {object} options 
     */
    initNumberOfDays: function (options) {
        const self = this, parentEle = jQuery("#asst_history_list_container");
        /**Already discussed with client team for default data yet we are not supported to sdp_select2 so we use select2 */
        parentEle.find("#number_of_days").select2({
            data: [
                { id: 7, text: getMessageForKey("sdp.asset.auditlistview.filter.last7daysChanges") },
                { id: 30, text: getMessageForKey("sdp.asset.auditlistview.filter.last30daysChanges") },
                { id: 60, text: getMessageForKey("sdp.asset.auditlistview.filter.last60daysChanges") },
                { id: 90, text: getMessageForKey("sdp.asset.auditlistview.filter.last90daysChanges") }
            ],
            minimumResultsForSearch: -1
        }).val(options.days_count).trigger('change');
        parentEle.on("change", "#number_of_days",function (evt) {
            self.tableObject.changeFilterString("clearOnly");// No I18N
            self.options.days_count = evt.val;
            self.refreshTable();
        });
    },
    /**
     * Load listview of the asset history
     * @param {object} options 
     */
    loadListView: function(options) {
        const self = this,
              table_info = self.getRowInputData();
        let table_content = {};
        table_content.header = {
            "name" : {// No I18N
                "display_name":getMessageForKey("sdp.inventory.viewAssets.detailView.assetName"),// No I18N
                "value_path":"asset_info.name",// No I18N
                "dataCelltransformer":self.constructName,// No I18N
                "default": true,// No I18N
                "default_width" : "200px"// No I18N
            },
            "operation_time" :{// No I18N
                "display_name":getMessageForKey("sdp.inventory.detailWS.audittime"),// No I18N
                "value_path":"operation_time.display_value",// No I18N
                "default": true,// No I18N
                "searchable":false,// No I18N
                "sortable":false,// No I18N
                "default_width" : "150px"// No I18N
            },
            "operation_owner" : {// No I18N
                "display_name":getMessageForKey("sdp.inventory.wsDetails.auditHistory.operationOwner"),// No I18N
                "value_path":"operation_owner.name",// No I18N
                "default": true,// No I18N
                "sortable":false,// No I18N
                "default_width" : "150px"// No I18N
            },
            "operation": {// No I18N
                "display_name":getMessageForKey("sdp.itil.common.changetype"),// No I18N
                "value_path":"operation_name",// No I18N
                "searchable":false,// No I18N
                "sortable":false,// No I18N
                "default": true,// No I18N
                "default_width" : "100px"// No I18N
            },
            "field_name": {// No I18N
                "display_name":getMessageForKey("gdpr.field.name"),// No I18N
                "value_path":"field_display_name",// No I18N
                "default": true,// No I18N
                "default_width" : "180px"// No I18N
            },
            "change_details": {// No I18N
                "display_name":getMessageForKey("sdp.change.details"),// No I18N
                "value_path":"change_details",// No I18N
                "default": true,// No I18N
                "searchable":false,// No I18N
                "default_width" : "350px"// No I18N
            }
        };
        const table_options  = {
            tableHolder                 : "asset_history",// No I18N
            callbackURL                 : "asset_history_diff",// No I18N
            entity_name                 : "asset_history_diff",// No I18N
            row_inputdata               : self.getRowInputData(table_info),
            callbackRowfunction         : self.getRowInputData,
            paginationEnabled           : true,
            searchEnabled               : true,
            sortingEnabled              : true,
            refreshEnabled              : true,
            get_total_count             : true,
            isODAPI                     : true
        };
        self.tableObject = new tableComponent(table_info, table_content, table_options, self);
        self.initNumberOfDays(options);
        self.initAuditFilter(options);
    },
    /**
     * Update listinfo by giving criteria to listinfo
     */
    updateListInfo: function() {
        const self = this;
        let listInfo = self.tableObject.t_obj.table_info.list_info;
        listInfo.search_criteria = [];
        listInfo.search_criteria[0] =self.getScanCriteria();
        listInfo.search_criteria[1] = self.getOperationTimeCriteria(self.options.days_count);
        self.tableObject.t_obj.table_info.for = self.getAuditFilterCriteria();
    },
    /**
     * Execute function to get operation time creiteria 
     * @param {integer} days_count
     */
    getOperationTimeCriteria: function(days_count) {
        const current_date = new Date();
        let check = new Date();
        check.setDate(current_date.getDate() - days_count);
        const current_time = current_date.getTime();
        const check_time = check.getTime();
        const criteria = {
                "field": "operation_time",// No I18N
                "condition": "between",// No I18N
                "values": [check_time, current_time],// No I18N
                "logical_operator": "AND"// No I18N
            }
        return criteria;
    },
    /**
     * Execute function to get scan time creiteria 
     * @returns 
     */
    getScanCriteria : function(){
        return {
            "field": "asset_operation_source_entity.name",// No I18N
            "value": "SCAN",// No I18N
            "condition":"is",// No I18N
            "logical_operator": "AND",// No I18N
            "children": [{ "field": "asset_operation_status_entity.is_success", "value": "true", "condition": "is", "logical_operator": "and" }] // No I18N
        };
    },
    /**
     * Execute function to get audit time creiteria 
     * @returns 
     */
    getAuditFilterCriteria : function(){
        const self = this;
        const options = self.options;
        if(options.audit_filter){
            return options.audit_filter;
        }else{
            return "all"; // No I18N
        }
    },
    /**
     * Execute function to Construct name 
     * @param {object} table_info 
     * @returns 
     */
    constructName : function(table_info){
        const id = table_info.row_data.asset_info.id;
        const urlStr = "/ui/asset?entity_id="+id+"&module="+ table_info.row_data.asset_info.module.api_plural_name ;// No I18N
        const html = `<a data-cs-field="asset_${id}" rel="noopener" data-id="${id}" id="assetlink_${id}" href="${urlStr}" target="_blank" class="disp-ib truncate-ellipsis"><span rel="uitip" mode_ellipsis='true' class="truncate-wrapper" title="${e_attr(table_info.row_data.asset_info.name)}"> ${e_html(table_info.row_data.asset_info.name)}</span></a>`;
        return html;
    },
    /**
     * Execute function to refresh in listview
     */
    refreshTable : function(){
        const self = this;
        self.updateListInfo();
        self.tableObject.refreshTable("refresh"); // No I18N
    }
};