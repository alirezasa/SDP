

var advanced_search_filter = (function($){

    var search_filter = {};
    var filter_table = {};
    search_filter.filterId = '';

    search_filter.loadFilterCriteria = function(module) {
        var adv_search_config = JSON.parse(sdpToJSON(global_adv_search_config));
        var advancedSearchConfig = adv_search_config[module];
        this.module = module;
        this.advancedSearchConfig = advancedSearchConfig;
        jQuery('#tablelist_div').attr('id', this.advancedSearchConfig.entity + "_div");
        jQuery('#t_column_choos').attr('id', "t_column_choos_" + this.advancedSearchConfig.entity);
        jQuery('#t_searchicon').attr('id', "t_searchicon_" + this.advancedSearchConfig.entity);
        jQuery('#pagination_comp').attr('id', "pagination_comp_" + this.advancedSearchConfig.entity);
        cust_filter.initAdvancedSearchFilter(this.module, true);
    },

    search_filter.resetFilter = function() {
        jQuery("#container1").filterFields("reset"); //No I18N
    },

    search_filter.cancel = function() {
        window.open(this.advancedSearchConfig.cancelRedirectUrl, '_parent');
    },

    search_filter.search = function() {
        var arrVar = cust_filter.criteriaComponentOutput();
        if (cust_filter.isValidFilterCondition(arrVar)) {
            jQuery('#content').hide().removeClass('hide');
            jQuery("#content").show();
            //table info is configured in tableInfo.js
            var table_info = table_comp.getTableInfo(this.advancedSearchConfig.entity);
            search_filter.saveSearchCriteria(arrVar);
            search_filter.loadSearchContent(table_info);
        }
    },

    search_filter.saveSearchCriteria = function(arrVar) {

        var list_view_filter = {
            'list_view_filter': { //No I18N
                "display_name": this.module + '_' + sdp_user.LOGGEDIN_USERID, //No I18N
                "criteria": arrVar, //No I18N
                "is_public": false, //No I18N
                "module": this.module, //No I18N
                "is_advanced_search": true //No I18N
            }
        };

        var url = '', method = '';
        if (search_filter.filterId != '') {
            url = '/api/v3/list_view_filters/' + search_filter.filterId; //No I18N
            method = 'PUT'; //No I18N
        } else {
            url = '/api/v3/list_view_filters'; //No I18N
            method = 'POST'; //No I18N
        }

        sdpAjax({
            url: url,
            type: method,
            data: sdpAjaxInputData(list_view_filter)
        });
    },

    search_filter.loadSearchContent = function(table_info) {

        var _self = this;
        var table_content = {}. filter_table = {};
            //table_content.header = this.headerdataConstruct(table_info);
            table_content.header = this.advancedSearchConfig.header;
            setTimeout(function(){
                var options = {};
                    options.paginationEnabled   = true;
                    options.searchEnabled       = true;
                    options.sortingEnabled      = true;
                    options.personalize_key     = _self.advancedSearchConfig.personalizeKey;
                    options.callbackRowfunction = "advanced_search_filter.rowdataConstruct";//No I18N
                    options.row_inputdata       = search_filter.rowdataConstruct(table_info);
                    options.callbackURL         = _self.advancedSearchConfig.callbackURL; // No I18N
                    //meta info url is done with entity name
                    options.entity_name         = _self.advancedSearchConfig.entity; // No I18N
                    options.getmetaInfo         = true;
                    options.isODAPI             = true;
                    options.discarded_fields    = _self.advancedSearchConfig.discardedFields;
                    options.columnChooserEnabled = true;
                    options.getDefaultListViewHeader = true;
                    options.callbackSearchFunction = advanced_search_filter.searchCallBackFunction;
                    options.discard_without_displayname = true;
                    //options.callbackAfterBodyRender = 12;
                    filter_table = new tableComponent(table_info,table_content,options, _self);
            },0);

    },

    search_filter.rowdataConstruct = function(table_info) {
        var inputObject = {};
        var list_info = table_info.list_info;
        list_info.get_total_count = true;
        list_info.search_criteria = cust_filter.criteriaComponentOutput();
        inputObject.list_info = list_info;
        var fields_required = table_info.fields_required;
        var fields_required_arr = Object.keys(fields_required);
        inputObject.fields_required = fields_required_arr;
        return inputObject;
    },

    search_filter.searchCallBackFunction = function(param, data) {

        var customFilterCriteria = cust_filter.criteriaComponentOutput();
        var columnSearchFieldObj = filter_table.t_obj.table_info.list_info.search_fields;
        var columnSearchFieldKeys = Object.keys(columnSearchFieldObj);

        columnSearchFieldKeys.forEach(element => {
            var columnSearchCriteria = {
                "logical_operator": "and", //No I18N
                "field": element, //No I18N
                "condition": "contains", //No I18N
                "value": columnSearchFieldObj[element]
            };
            customFilterCriteria.push(columnSearchCriteria);
        });

        delete filter_table.t_obj.table_info.list_info.search_fields;
        filter_table.t_obj.table_info.list_info.search_criteria = customFilterCriteria;
        filter_table.refreshTable(filter_table);
    }

    return search_filter;
}(jQuery));