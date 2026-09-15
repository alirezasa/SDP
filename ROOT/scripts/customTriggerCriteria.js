/* $Id$ */
var cust_trigger = (function($){
    var c_t = {};
    var filter_table = {};
    var jD  = jQuery(document);
    c_t.initCritComp = function(showType,module,criteriajson){
        this.module = module;

        if(showType === "editCriteria" && criteriajson != null) {
            cust_trigger.newOrEditCriteria(criteriajson, false);
        } else {
            cust_trigger.newOrEditCriteria('');
        }
    },
    c_t.loadfiltercontent = function(table_info) {
        var _self = this;
            var table_content = {}. filter_table = {};
            table_content.header = this.headerdataConstruct(table_info);
            setTimeout(function(){
                var options = {};
                    options.paginationEnabled   = true;
                    options.searchEnabled       = true;
                    options.sortingEnabled      = true;
                    options.multiDeleteEnabled=true;
                    options.personalize_key     = _self.module;
                    options.callbackRowfunction = "cust_trigger.rowdataConstruct";//No I18N
                    options.row_inputdata       = _self.rowdataConstruct(table_info);
                    options.callbackURL         = "list_view_filters"; // No I18N
                    options.entity_name         = "list_view_filters"; // No I18N
                    options.isODAPI             = true;
                    filter_table = new tableComponent(table_info,table_content,options, _self);
            },0);
    },
    c_t.getCriteriaString = function(condition) {
        var filterConditions = condition;
        var filterConcatString = "";
        for (var i = 0; i < filterConditions.length; i++) {
                filterConcatString = filterConcatString + translate(filterConditions[i].display_value) + " ";

            var filterCondString = filterConditions[i].condition;
            var filterCondVal = (filterCondString.indexOf("_duration") === -1) ? filterCondString.replace(/_/g, " ") : (filterCondString.split("_duration")[0]).replace(/_/g, " ");
            filterConcatString = filterConcatString + filterCondVal + " ";

            var criteriavalDisplay = "";
            var cond_obj = filterConditions[i].values;
            for(var j=0;j<cond_obj.length;j++){
                if (criteriavalDisplay === "") {
                    criteriavalDisplay = cond_obj[j].name;
                } else {
                    criteriavalDisplay = criteriavalDisplay + "," + cond_obj[j].name;
                }
            }
            filterConcatString = filterConcatString + criteriavalDisplay;
            if (i < filterConditions.length - 1) {
                filterConcatString = filterConcatString + " " + filterConditions[i + 1].logical_operator + " ";
            }
        }
        return encodeHTML(filterConcatString);
    },
    c_t.rowdataConstruct = function(table_info) {
        var inputObject = {};
        var list_info = table_info.list_info;
            list_info.get_total_count = true;
            inputObject.list_info = list_info;
            inputObject.module = this.module;
            return inputObject;
    },

    c_t.newOrEditCriteria = function (json, preview) {
        //variable 'dynamicId' initialized for Filter component globally in filterFields.js file. We need to re-initialize everytime ,when page is loaded.
        dynamicId = 0;
        var _self = this;
        var allowed_values_obj;
        sdpAjax({
            headers: {
                "accept": "application/vnd.manageengine.sdp.v3+json"  // No I18N
            },
            url: '/api/v3/list_view_filters/new_form?input_data='+encodeURIComponent('{"module":"' + _self.module + '"}'), // No I18N
            success: function(j_obj) {
                if(typeof j_obj === 'string') {
                 j_obj = JSON.parse(j_obj);
                }
                j_obj = j_obj.new_form;
                allowed_values_obj = j_obj.allowed_values;
            },
            async:false
         });
         _self.removeUnSupportedFields(allowed_values_obj,_self.module);
         _self.constructFilterFieldsOpt(allowed_values_obj);
        if (json !== "") {
            jQuery('#editView').removeClass("hide");
            var critCond = _self.updateFilterCondition(json,allowed_values_obj);
            jQuery('#container1').filterFields('update', critCond); // No I18N
        }else{
            jQuery('#newView').removeClass("hide");
        }
    },
    c_t.removeUnSupportedFields = function(allowed_values , module){
        var fields = allowed_values.criteria_field_details;
        var fieldsSupported;
         if("task" == module){
            fieldsSupported = ["status","priority","type","owner","marked_owner","group","marked_group","associated_entity","created_by","site","title","description", "tags"];		// No I18N
            if(isMSPOrSCP){
                fieldsSupported.push("account");
            }
         }else if ("project"  == module){		// No I18N
            fieldsSupported = ["status","priority","owner","created_by","type","department","site","title","description","estimated_hours","estimated_cost", "tags"];		// No I18N
            if(isMSP){
                fieldsSupported.push("account");
            }
         }

        for (var c=0;c<fields.length;){
            var field = fields[c].field;
            if(!field.startsWith("udf_fields") && fieldsSupported.indexOf(field) == -1){
                fields.splice(c,1);
            }else{
                c++;
            }
        }
    },
    c_t.constructFilterFieldsOpt = function(j_obj){
        var opt = {
            "addRowValidationFunction" : this.customAddRowValidateFunction, //No I18N
            "isSortable" : false, //No I18N
            "validateField" :true, //No I18N
            "validationMessageClass" :'validation-msgg', //No I18N
            "columnData" : { //No I18N
                "dataList": this.getColumnDataList(j_obj.criteria_field_details) //No I18N
            },
            "criteria" : { //No I18N
                "isSelectable": true, //No I18N
                "dataList": this.getCriteriaFieldData(j_obj.criteria_field_types) //No I18N
            },
            "criteriaValue" : { //No I18N
                    "dataList": this.getCriteriaValueDataList(j_obj.criteria_field_details) //No I18N
            },
            "addRowCBFunction" : this.CustomAddorRemoveRowCBFunction, //No I18N
            "removeRowCBFunction" : this.CustomAddorRemoveRowCBFunction //No I18N
        };
        this.columnDataList = opt.columnData;
        jQuery("#columnname").value="";
        jQuery("#container1").filterFields(opt);
    },
    c_t.getColumnDataList = function(c_tD) {
        var cols_arr = [];
        for (var i = 0; i < c_tD.length; i++) {
            var cols = {};
            cols.TITLE = translate(c_tD[i].display_value);
            cols.TYPE = c_tD[i].field_type;
            cols.VALUE = c_tD[i].field;
            cols_arr.push(cols);
        }
        return cols_arr.sort(function(a,b) {return (a.TITLE.toLowerCase() > b.TITLE.toLowerCase()) ? 1 : ((b.TITLE.toLowerCase() > a.TITLE.toLowerCase()) ? -1 : 0);} );
    },
    c_t.getCriteriaFieldData = function(c_tT) {

            var fieldTypes = [{
                    "type": "text",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "text",  // No I18N
                            "condition": "is"  // No I18N
                        },
                        {
                            "value_type": "text",  // No I18N
                            "condition": "is not"  // No I18N
                        },
                        {
                            "value_type": "text",  // No I18N
                            "condition": "starts with"  // No I18N
                        },
                        {
                            "value_type": "text",  // No I18N
                            "condition": "ends with"  // No I18N
                        },
                        {
                            "value_type": "text",  // No I18N
                            "condition": "contains"  // No I18N
                        }
                    ]
                },
                {
                    "type": "select",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "select",  // No I18N
                            "condition": "is"  // No I18N
                        },
                        {
                            "value_type": "select",  // No I18N
                            "condition": "is not"  // No I18N
                        },
                        {
                            "value_type": "multiselect",  // No I18N
                            "condition": "in"  // No I18N
                        },
                        {
                            "value_type": "multiselect",  // No I18N
                            "condition": "not in"  // No I18N
                        }
                    ]
                },
                {
                    "type": "#HREF",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "ajax_select",  // No I18N
                            "condition": "is"  // No I18N
                        },
                        {
                            "value_type": "ajax_select",  // No I18N
                            "condition": "is not"  // No I18N
                        },
                        {
                            "value_type": "ajax_multiselect",  // No I18N
                            "condition": "in"  // No I18N
                        },
                        {
                            "value_type": "ajax_multiselect",  // No I18N
                            "condition": "not in"  // No I18N
                        }
                    ]
                },
                {
                    "type": "boolean",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "boolean",  // No I18N
                            "condition": "is"  // No I18N
                        },
                        {
                            "value_type": "boolean",  // No I18N
                            "condition": "is not"  // No I18N
                        }
                    ]
                },
                {
                    "type": "double",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "double",  // No I18N
                            "condition": "eq"  // No I18N
                        },
                        {
                            "value_type": "double",  // No I18N
                            "condition": "neq"  // No I18N
                        },
                        {
                            "value_type": "double",  // No I18N
                            "condition": "greater than"  // No I18N
                        },
                        {
                            "value_type": "double",  // No I18N
                            "condition": "lesser than" // No I18N
                        },
                        {
                            "value_type": "double",  // No I18N
                            "condition": "greater or equal"  // No I18N
                        },
                        {
                            "value_type": "double",  // No I18N
                            "condition": "lesser or equal"  // No I18N
                        }
                    ]
                },
                {
                    "type": "long",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "long",  // No I18N
                            "condition": "eq"  // No I18N
                        },
                        {
                            "value_type": "long",  // No I18N
                            "condition": "neq"  // No I18N
                        },
                        {
                            "value_type": "long",  // No I18N
                            "condition": "greater than"  // No I18N
                        },
                        {
                            "value_type": "long",  // No I18N
                            "condition": "lesser than"  // No I18N
                        },
                        {
                            "value_type": "long",  // No I18N
                            "condition": "greater or equal"  // No I18N
                        },
                        {
                            "value_type": "long",  // No I18N
                            "condition": "lesser or equal"  // No I18N
                        }
                    ]
                },
                {
                    "type": "date",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "date",  // No I18N
                            "condition": "on"  // No I18N
                        },
                        {
                            "value_type": "date",  // No I18N
                            "condition": "after"  // No I18N
                        },
                        {
                            "value_type": "date",  // No I18N
                            "condition": "before"  // No I18N
                        },
                        {
                            "value_type": "date",  // No I18N
                            "condition": "on or after"  // No I18N
                        },
                        {
                            "value_type": "date",  // No I18N
                            "condition": "on or before"  // No I18N
                        }
                    ]
                },
                {
                    "type": "picklist",  // No I18N
                    "options": [{  // No I18N
                            "value_type": "picklist",  // No I18N
                            "condition": "is"  // No I18N
                        },
                        {
                            "value_type": "picklist",  // No I18N
                            "condition": "is not"  // No I18N
                        },
                        {
                            "value_type": "picklist",  // No I18N
                            "condition": "in"  // No I18N
                        },
                        {
                            "value_type": "picklist",  // No I18N
                            "condition": "not in"  // No I18N
                        }
                    ]
                }
            ]




        var _self =  this;
        var c_list = {};
            $.each(fieldTypes, function(key, value) {
            var c_dateField = [],
                c_selectField = [],
                c_list_Combined = {};
            var c_opt = value.options;
            for (var i = 0; i < c_opt.length; i++) {
                var c_data1 = {},
                    c_data2 = {};
                if (value.type === 'date') {
                    var date_objs = c_opt[i];
                    var disp_cond = translate(_self.getI18NKeysForCondition(date_objs.condition));
                        c_data1.TITLE = disp_cond;
                        c_data1.TYPE = date_objs.value_type;
                        c_data1.VALUE = date_objs.condition;
                        c_dateField.push(c_data1);
                        if(_self.module !='change')
                        {
                       c_data2.TITLE = disp_cond;
                        c_data2.TYPE = 'select'; // No I18N
                        c_data2.VALUE = date_objs.condition + "_duration"; // No I18N
                        c_selectField.push(c_data2);
                }
                }
                else {
                    var disp_cond = translate(_self.getI18NKeysForCondition(c_opt[i].condition));
                    c_data1.TITLE = disp_cond;
                    c_data1.TYPE = c_opt[i].value_type;
                    c_data1.VALUE = c_opt[i].condition;
                    c_selectField.push(c_data1);
                }

            }
            if (value.type === 'date'){
                c_list_Combined.Date = c_dateField;
                if(_self.module !='change')
                {
                c_list_Combined.Duration = c_selectField;
                }
                c_list[value.type] = c_list_Combined;
            }
            else{
                c_list[value.type] = c_selectField;
            }
        });

        return c_list;
    },
    c_t.getCriteriaValueDataList = function(c_AF) {
        var allowed_obj = {};
        var module=this.module;

            var dateValues = [{
                    "id": "$(current_time)",  // No I18N
                    "name": "sdp.common.currenttime"  // No I18N
                },
                {
                    "id": "$(today)", // No I18N
                    "name": "sdp.common.today" // No I18N
                },
                {
                    "id": "$(tomorrow)", // No I18N
                    "name": "sdp.common.tomorrow" // No I18N
                },
                {
                    "id": "$(yesterday)", // No I18N
                    "name": "sdp.common.yesterday" // No I18N
                },
                {
                    "id": "$(this_week)", // No I18N
                    "name": "sdp.common.thisweek" // No I18N
                },
                {
                    "id": "$(last_week)",  // No I18N
                    "name": "sdp.common.lastweek"  // No I18N
                },
                {
                    "id": "$(next_week)",  // No I18N
                    "name": "sdp.common.nextweek"  // No I18N
                },
                {
                    "id": "$(last_month)",  // No I18N
                    "name": "sdp.common.lastmonth"  // No I18N
                },
                {
                    "id": "$(next_month)",  // No I18N
                    "name": "sdp.common.nextmonth"  // No I18N
                },
                {
                    "id": "$(this_month)", // No I18N
                    "name": "sdp.common.thismonth" // No I18N
                },
                {
                    "id": "$(this_year)", // No I18N
                    "name": "sdp.common.thisyear" // No I18N
                }
            ]
            var boolValues = [{
                "id": "true",  // No I18N
                "name": "Yes"  // No I18N
            },
            {
                "id": "false", // No I18N
                "name": "No" // No I18N
            }
        ]

        $.each(c_AF, function(key, value) {

                if (value.field_type === 'date') {
                    value.values = dateValues;
                }
                if (value.field_type === 'boolean') { // No I18N
                    value.values = boolValues;
                }
                if (typeof value.values != 'string') {
                    if (value.values != null) {
                        value.values = value.values.sort(function(a, b) {
                     return (a.name > b.name);
                        });
                    }
                }
                var a_arr = [];
                if (Array.isArray(value.values)) {
                    for (var i = 0; i < value.values.length; i++) {
                        var jsonObj = {}, display_value = "", valueObj = value.values[i]; // No I18N
                            if(value.field=='status' && module=='change'){ // No I18N
                                display_value = valueObj.stage ? valueObj.stage.name+" -> "+valueObj.name : valueObj.name; // No I18N
                            }else if(value.field=='subcategory'){ // No I18N
                                if(valueObj.name==translate('common.none')){
                                    display_value = valueObj.name;
                                }else{
                                    display_value = valueObj.category.name+" -> "+valueObj.name; // No I18N
                                }
                            }else if(value.field=='item'){ // No I18N
                                if(valueObj.name==translate('common.none')){
                                    display_value = valueObj.name;
                                }else{
                                    display_value = valueObj.subcategory.category.name+" -> "+valueObj.subcategory.name+" -> "+valueObj.name; // No I18N
                                }
                            }else if(value.field=='group' && valueObj.hasOwnProperty("siteid")){	//NO I18N
                            	if(valueObj.name==translate('common.none')){
                                    display_value = valueObj.name;
                                }else if(valueObj.siteid==null){
                                	display_value = translate('common.site.nosite')+" -> "+valueObj.name;
                                }else{
                                    display_value = valueObj.siteid.name+" -> "+valueObj.name; // No I18N
                                }
                            }else{
                                display_value = translate(valueObj.name);
                            }
                        jsonObj.TITLE = display_value;
                        jsonObj.VALUE = valueObj.id;
                        a_arr.push(jsonObj);
                    }
                    allowed_obj[value.field] = a_arr;
                }else{
                    if(value && value.field_type === "#HREF") {
                        allowed_obj[value.field] = encodeURI(value.values);
                    } else {
                        allowed_obj[value.field] = value.values;
                    }
                }

        });
        return allowed_obj;
    },
    c_t.getI18NKeysForCondition = function(key) {
            key = key.replace(/\s+/g, '_');
        var conditionKeys = {};
        conditionKeys.is = "sdp.condition.1"; // No I18N
        conditionKeys.is_not = "sdp.condition.2"; // No I18N
        conditionKeys.starts_with = "sdp.condition.3"; // No I18N
        conditionKeys.ends_with = "sdp.condition.4"; // No I18N
        conditionKeys.in = "sdp.condition.5"; // No I18N
        conditionKeys.not_in = "sdp.condition.6"; // No I18N
        conditionKeys.eq = "sdp.condition.7"; // No I18N
        conditionKeys.neq = "sdp.condition.8"; // No I18N
        conditionKeys.greater_than = "sdp.condition.9"; // No I18N
        conditionKeys.lesser_than = "sdp.condition.10"; // No I18N
        conditionKeys.greater_or_equal = "sdp.condition.11"; // No I18N
        conditionKeys.lesser_or_equal = "sdp.condition.12"; // No I18N
        conditionKeys.on = "sdp.condition.13"; // No I18N
        conditionKeys.after = "sdp.condition.14"; // No I18N
        conditionKeys.before = "sdp.condition.15"; // No I18N
        conditionKeys.on_or_after = "sdp.condition.16"; // No I18N
        conditionKeys.on_or_before = "sdp.condition.17"; // No I18N
        conditionKeys.contains = "sdp.condition.18"; // No I18N
        return conditionKeys[key];
    },
    c_t.criteriaComponentOutput = function() {
            var outputData = [];
            var _self = this;
            jQuery('#container1').find('li.singlefilterwrapper').each(function(i, v) {
                // get selected operator attributes
                var operator = "";
                if (i > 0) {
                    operator = jQuery(this).find('.andor option:selected').attr('value');
                } else {
                    operator = '';
                }

                // get selected column attributes
                var columnField = jQuery(this).find('.columnname option:selected').attr('value');

                // get selected criteria attributes
                var criteriaField = jQuery(this).find('.selectcriteria option:selected').attr('value');

                // check the data-type of criteriaField and get the value accordingly
                var inputType = jQuery(this).find('.selectcriteria option:selected').attr('data-type');
                var criteriaValField = {};
                var criteriavalTemp = [];
                var criteriaval = [];
                switch (inputType) {
                    case 'ajax_select': //NO I18N
                        var crit_fld_obj = jQuery(this).find('input.criteriaval').select2('data');//No I18N
                        criteriaValField = crit_fld_obj != null ? crit_fld_obj.id+"" : "";
                        break;
                    case 'select': //NO I18N
                        criteriaValField = jQuery(this).find('.criteriaval option:selected').val();
                        criteriaValField = criteriaValField != null ? criteriaValField+"" : "";
                        if (criteriaField.indexOf('_duration') >= 0) {
                            criteriaField = criteriaField.split('_duration')[0];
                        }
                        break;
                    case 'ajax_multiselect': //NO I18N
                        criteriaval = [];
                        jQuery(jQuery(this).find("input.criteriaval").select2('data')).each(function(index, crt_obj) {//No I18N
                            var $this = jQuery(this);
                            criteriavalTemp = "";
                            criteriavalTemp = crt_obj.id+"";
                            criteriaval.push(criteriavalTemp);
                        });
                        criteriaval = (criteriaval.length === 0)? null : criteriaval;
                        break;
                    case 'multiselect': //NO I18N
                        criteriaval = [];
                        jQuery(this).find("select.criteriaval option:selected").each(function() {
                            criteriavalTemp = jQuery(this).val();
                            criteriaval.push(criteriavalTemp);
                        });
                        criteriaval = (criteriaval.length === 0)? null : criteriaval;
                        break;
                    case 'datetime': //NO I18N
                    case 'date': //NO I18N
                        criteriaValField = (_self.filterBeginEndDayCal(criteriaField,Number(jQuery(this).find(("input[id*=datepicker]"))[0].value))); //To get start or end time with selected date
                        break;
                    default:
                        criteriaValField = jQuery(this).find('.criteriaval')[0].value;
                        break;
                }

                if(inputType === 'multiselect' || inputType === 'ajax_multiselect'){
                    criteriaValField =  criteriaval;
                } else if (!Array.isArray(criteriaValField)) {
                    criteriaValField =  [criteriaValField];
                }
                outputData.push({
                    'logical_operator': operator, //No I18N
                    'field': columnField, //No I18N
                    'condition': criteriaField, //No I18N
                    'values': criteriaValField //No I18N
                });
            });
        return outputData;
    },
    c_t.isValidFilterCondition = function(filterDetailArray) {
        // validating all the fields
        for (var i = 0; i <= filterDetailArray.length - 1; i++) {
            var filterData = filterDetailArray[i];
            var columnVar = filterData.field;
            var critVar = filterData.condition;
            var critValVar = filterData.values != null ? filterData.values[0] : "";
            var columnType  = this.getFilterColumnType(filterData);
            var regex       = /^[0-9]+$/;
            var regex_double = /^\d*(\.\d+)?$/;
            if(columnType === "date" && typeof critValVar === "string" && critValVar.startsWith("$")){
                return true;
            }

            if ((columnVar === '' || columnVar === -1) || (critVar === '' || critVar === -1) || (critValVar === '' || critValVar === -1 || critValVar === undefined) || ((columnType === 'number' || columnType === 'long') && (!regex.test(critValVar))) || (columnType === 'double' && (!regex_double.test(critValVar))) || (columnType === 'date' && (isNaN(critValVar)))) {
                jQuery("#alertbox").remove();
                showalert('warning',getMessageForKey("sdp.task.error.invalid.criteria"),'isAutoHide=true,delay=5'); //No I18N
                return false;
            }
        }
        return true;
    },
    c_t.filterBeginEndDayCal = function(criteriaField, inputDate) {
            var outputJSONDate = [];
        var d   = new Date(inputDate);
        var day = d.getDate();
        var mon = d.getMonth();
        var yr  = d.getFullYear();

        if (criteriaField === 'on') {
            var start = new Date(inputDate);
            start.setHours(0, 0, 0, 0);

            var end = new Date(inputDate);
            end.setHours(23, 59, 59, 999);

            outputJSONDate.push(start.getTime());
            outputJSONDate.push(end.getTime());
            return outputJSONDate;
        }

        if(criteriaField === "after" || criteriaField === "on or before"){
            day++;
            var endDate;
            endDate = new Date(yr, mon, day, 0, -1, 0);
            outputJSONDate = endDate.getTime(); //End of day in milliseconds
        }

        if(criteriaField === "before" || criteriaField === "on or after"){
            var startDate;
            startDate = new Date(yr, mon, day, 0, 0, 0);
            outputJSONDate = startDate.getTime(); //Start of day in milliseconds
        }

        return outputJSONDate;
    },
    c_t.getFilterColumnType = function(filterObj) {
        var dataList = this.columnDataList.dataList;
            for(var i=0;i<dataList.length;i++){
                if (filterObj.field == dataList[i].VALUE) {
                    return dataList[i].TYPE;
                }
            }
    },
    c_t.CustomAddorRemoveRowCBFunction = function() {
        jQuery('#container1').find('li.singlefilterwrapper').find('.addrowbtn').removeClass('hide');
        if (jQuery('#container1').find('li.singlefilterwrapper').length >= 25) {
            jQuery('#container1').find('li.singlefilterwrapper:last').find('.addrowbtn').addClass('hide');
            jQuery('#hasmorerows').text(false);
        }else{
            jQuery('#hasmorerows').text("");
        }
    },
    c_t.updateFilterCondition = function (filterCondition, crit) {
        var jsonDataAry = [];
        for (var i = 0; i < filterCondition.length; i++) {
            var field = filterCondition[i].field;
            var isAjax = false;
            var c_arr  = crit.criteria_field_details;
            var field_type;
            for(var k=0;k< c_arr.length;k++){
                if(c_arr[k].field == field){
                    field_type = c_arr[k].field_type;
                    if(field_type === "#HREF"){
                        isAjax = true;
                    }
                }
            }
            var jsonData = {};
            jsonData.column = filterCondition[i].field;
            jsonData.criteria = filterCondition[i].condition;
            var criteriavalDisplay = [];
            var condObj = filterCondition[i].values;
            for(var j=0;j<condObj.length;j++){
                if(isAjax){
                    condObj[j].text = translate(condObj[j].name);
                    delete condObj[j].name;
                    criteriavalDisplay.push(condObj[j]);
                }else{
                    var dispval = typeof condObj[j] == "object" ? condObj[j].id : condObj[j];
                    criteriavalDisplay.push(dispval);
                }
            }
            if(field_type === "date" && !isNumeric(condObj[0].id)){
                jsonData.criteria = jsonData.criteria + "_duration"; // NO I18N
            }
            jsonData.criteriaVal = criteriavalDisplay;
            jsonData.operator = filterCondition[i].logical_operator;
            jsonDataAry.push(jsonData);
        }
        return jsonDataAry;
    },
    c_t.isAjaxField = function(field,c){
        var isAjax = false;
        var c_arr  = c.criteria_field_details;
        for(var i=0;i< c_arr.length;i++){
            if(c_arr[i].field == field && c_arr[i].field_type == "#HREF"){
                isAjax = true;
            }
        }
        return isAjax;
    },
    c_t.customAddRowValidateFunction = function(inputElArr) {
        var c_val = null;
        inputElArr.each(function(index) {
            jQuery(this).find('span.isValidated').remove();
            c_val = jQuery(this).find('.criteriaval');
            var errormsg = jQuery(this).parent().find('span.validation-msgg').text();
            if(c_val.length) {
                if (c_val.val() === null || c_val.val() === '' || c_val.val() === undefined) {
                    jQuery("#alertbox").remove();
                     showalert( 'warning',translate("sdp.project.filters.error.fillcond"),"isAutoHide=true"); // No I18N
                    jQuery(this).append('<span class="isValidated hidden">false</span>');//NO i18N
                    return false;
                }else if (errormsg.length > 0) {
                    jQuery("#alertbox").remove();
                    showalert( 'warning',translate("sdp.project.filters.error.invalidcond"),"isAutoHide=true"); //NO i18N
                    jQuery(this).append('<span class="isValidated hidden">false</span>');//NO i18N
                    return false;
                }else{
                    jQuery(this).append('<span class="isValidated hidden">true</span>');//NO i18N
                    var rowCount = index+1;
                    if(parseInt(rowCount) >= 25){
                        if(jQuery('#hasmorerows').text() == "false"){
                            jQuery("#alertbox").remove();
                            showalert( 'warning',translate("sdp.api.customfilter.condition.length"),"isAutoHide=true"); // No I18N
                            return false;
                        }
                    }
                }
            }
            else{
                jQuery(this).append('<span class="isValidated hidden">true</span>');//NO i18N
                var rowCountVal = index+1;
                if(parseInt(rowCountVal) >= 25){
                    if(jQuery('#hasmorerows').text() == "false"){
                        jQuery("#alertbox").remove();
                        showalert(translate("sdp.api.customfilter.condition.length"), 'warning', "isAutoHide=false"); // No I18N
                        return false;
                    }
                }
            }
        });
    },
    c_t.getCriteriaString = function(condition) {
         var filterConditions = condition;
            var filterConcatString = "";
            for (var i = 0; i < filterConditions.length; i++) {
                filterConcatString = filterConcatString + translate(filterConditions[i].display_value) + " ";

                var filterCondString = filterConditions[i].condition;
                var filterCondVal = (filterCondString.indexOf("_duration") === -1) ? filterCondString.replace(/_/g, " ") : (filterCondString.split("_duration")[0]).replace(/_/g, " ");
                filterConcatString = filterConcatString + translate(this.getI18NKeysForCondition(filterCondVal)) + " ";

                var criteriavalDisplay = "";
                var cond_obj = filterConditions[i].values;
                for(var j=0;j<cond_obj.length;j++){
                    var display_value = ""; // No I18N
                        if(filterConditions[i].field  == "status" && this.module =="change"){
                            display_value = cond_obj[j].stage ? cond_obj[j].stage.name+" -> "+cond_obj[j].name : cond_obj[j].name;
                        }else if(filterConditions[i].field =='subcategory'){ // No I18N
                            if(cond_obj[j].name==translate('common.none')){
                                display_value = cond_obj[j].name;
                            }else{
                                display_value = cond_obj[j].category.name+" -> "+cond_obj[j].name; // No I18N
                            }
                        }else if(filterConditions[i].field =='item'){ // No I18N
                            if(cond_obj[j].name==translate('common.none')){
                                display_value = cond_obj[j].name;
                            }else{
                                display_value = cond_obj[j].subcategory.category.name+" -> "+cond_obj[j].subcategory.name+" -> "+cond_obj[j].name; // No I18N
                            }
                        }else if(filterConditions[i].field=='group'  && cond_obj[j].hasOwnProperty("siteid")){
                        	if(cond_obj[j].name==translate('common.none')){
                                display_value = cond_obj[j].name;
                            }else if(cond_obj[j].siteid==null){
                            	display_value = translate('common.site.nosite')+" -> "+cond_obj[j].name;
                            }else{
                                display_value = cond_obj[j].siteid.name+" -> "+cond_obj[j].name; // No I18N
                            }
                        }else{
                            display_value = (typeof cond_obj[j] == "object" ? cond_obj[j].name : cond_obj[j]);
                        }

                        if (criteriavalDisplay === "") {
                            criteriavalDisplay = display_value;
                        } else {
                            criteriavalDisplay = criteriavalDisplay + "," + display_value;
                        }
                }
                filterConcatString = filterConcatString + criteriavalDisplay;
                if (i < filterConditions.length - 1) {
                    filterConcatString = filterConcatString + " " + filterConditions[i + 1].logical_operator + " ";
                }
            }
            return encodeHTML(filterConcatString);
    },
    c_t.saveAndManage = function(arg) {
        var _self =this;
        var arrVar = this.criteriaComponentOutput();
        var viewName = jQuery('#filtername').val(); // No I18N
        if(viewName.length > 50){
            jQuery("#alertbox").remove();
            showalert('warning',translate("sdp.customfilter.invalid.filterName"),'isAutoHide=true,delay=5'); //No I18N
            return;
        }
        var description= jQuery('#filterdesc').val();
        if(description.length > 250){
            jQuery("#alertbox").remove();
            showalert('warning',translate("sdp.customfilter.invalid.filterDesc"),'isAutoHide=true,delay=5'); //No I18N
            return;
        }
        var filter_id = jQuery("#filter_id").val(); // No I18N
        if (jQuery.trim(viewName) == "") {
            showsdpMessage(translate("sdp.project.filters.error.filtername"), 'warning', 8000); // No I18N
            jQuery('#filtername').val("").focus();
            return false;
        } else if (this.isValidFilterCondition(arrVar)) {
            var urlVal = "";
            var inputObject = {};
            var l_f = {};
                l_f.display_name = viewName;
                l_f.criteria = arrVar;
                l_f.description = description;
                l_f.is_public = jQuery("#chk_public").prop('checked'); //No I18N
                l_f.module = this.module;
                inputObject.list_view_filter = l_f;
            var dataVal = "",
                methodType = "";
                url = "/api/v3/list_view_filters"  // No I18N
                methodType = filter_id !== "" ? 'PUT' : 'POST'; // No I18N
                url = methodType == 'PUT' ? url + "/" + filter_id : url;
                dataVal = sdpAjaxInputData(inputObject);
                jQuery.ajax({
                    headers: {
                        "accept": "v3+json"  // No I18N
                    },
                    url: url,
                type: methodType,
                dataType: "json",  // No I18N
                data: dataVal,
                success: function(resp) {
                    responseText = resp.response_status;
                      if (responseText && (responseText.status === "success" || (responseText.messages && responseText.messages[0].type.toLowerCase() == "success"))) {
                        if (arg == 'save') {
                            window.location.href = '/ListViewFilter.do?module=' + _self.module + '&action=listview';
                        } else {
                            window.location.href = '/ListViewFilter.do?module=' + _self.module + '&action=addfilter';
                        }
                      } else {
                        showalert('failure', responseText.messages[0].message,"isAutoHide=true"); // No I18N
                      }
                    },
                error: function(jqXHR, textStatus, errorThrown) {
                    response = JSON.parse(jqXHR.responseText);
                    if(response.response_status.messages[0].status_code === 4008){
                        showsdpMessage(translate("sdp.api.customfilter.name.exists"), 'warning', 5000); //NO I18N
                    }
                    if(response.response_status.messages[0].status_code === 4001){
                        if(response.response_status.messages[0].field == "display_name"){
                            showsdpMessage(translate("sdp.customfilter.invalid.name"), 'warning', 5000); //NO I18N
                        } else {
                            showsdpMessage(response.response_status.messages[0].message, 'warning', 5000); //NO I18N
                        }
                    }
                }
            });
        }
    }
    return c_t;
}(jQuery));
