/*$Id$*/
/* Jquery plugin to Filter UI based on list in HTML */
/* GLOBAL */
var dynamicId = 0;
/* GLOBAL ends */
(function($, window, document, undefined) {
    // Default function for validation while adding a new row.
    // @arg1: inputElArr (array of row objects)
    var addRowValidateFunctionDef = function (inputElArr) {
        var tmp = null;
        inputElArr.each(function(index) {
            $(this).find('span.isValidated').remove();
            tmp = $(this).find('.criteriaval');
            // If not a custom field without the particular element class
            if(tmp.length) {
                if ((tmp.data("select2") && (!tmp.select2("data") || tmp.select2("data").length === 0)) || (!tmp.data("select2") && (tmp.val() === null || tmp.val() === '' || tmp.val() === undefined))) {
                    //if select2, and select2(data) is null (piclist) or an empty array (multiselect)
                    //or, if element is not a select2 component, if val is empty string, etc 
                    showalert('failure', translate('sdp.requests.fieldFormRules.fillAllFields'), 'isAutoHide=false');//NO I18N
                    $(this).append('<span class="isValidated hidden">false</span>');//NO i18N
                    return false;
                } else {
                    $(this).append('<span class="isValidated hidden">true</span>');//NO i18N
                }
            } else {
                $(this).append('<span class="isValidated hidden">true</span>');//NO i18N
            }
        });
    };
    // Create the defaults once
    var pluginName = "filterFields",//NO I18N
        defaults = {
            isSortable: false, //TRUE/FALSE switch between sortable and unsortable rows.
            sortingPlaceholderClass: 'ui-state-highlight', //Class name for sorting placeholder. //NO I18N
            validateField: true, //TRUE/FALSE switch field validation on/off (number and email available currently).
            validationMessageClass: 'validation-msg', //Class name for validation message wrapper //NO I18N
            isEditState: false,
            listTag: 'ol',//NO I18N
            listClass: 'filterwrapper',//NO I18N
            listItemClass: 'singlefilterwrapper',//NO I18N
            enableDragHandle: false, //Toggle to show the drag handle.
            dragHandleClass: 'drag-handle', //Class of drag handle. //NO I18N
            addRowCBFunction: '', //Call back function for addRow event (@arg newRow obj). //NO I18N
            addRowValidate: true, //Decide whether to call a validate function or not.
            addRowValidationFunction: addRowValidateFunctionDef, //Function to include validation function if any for adding a row (@arg inputElArray object).
            removeRowCBFunction: '', //Call back function for removeRow event. //NO I18N
            operator: {
                isSelectable: true, //TRUE/FALSE switch between static and selectable operator.
                useSelectSwitch: false,
                dataList: [                //Array data for populating the Column field (selectbox).
                            {"TITLE":translate('sdp.requests.fieldFormRules.operators.and'), "VALUE":"and"},//NO I18N
                            {"TITLE":translate('sdp.requests.fieldFormRules.operators.or'), "VALUE":"or"}//NO I18N
                          ],
                containerClassName: 'operatorsdiv', //CSS class name of the container element. //NO I18N
                elementClassName: 'andor', //CSS class name of the element. //NO I18N
                useSelect2: true, //Option to toggle select2 plugin.
                select2Alternative: '', //Function to initiate third party plugin other than select2 default options.
                isDisabled: false //Disable(will not appear) this field.
            },
            columnData: {
                isSearchable: 0,
                placeholder: translate('sdp.requests.fieldFormRules.selectColumn'), //NO I18N
                isSelectablePlaceholder: true, //show the placeholder as a selectable/disabled option.
                dataList: {}, //Array data for populating the Column field (selectbox).
                containerClassName: 'columnnamediv', //CSS class name of the container element. //NO I18N
                elementClassName: 'columnname', //CSS class name of the element. //NO I18N
                useSelect2: true, //Option to toggle select2 plugin.
                select2Alternative: '' //Function to initiate third party plugin other than select2 default options.
            },
            criteria: {
                isSearchable: 0,
                isSelectable: true, //TRUE/FALSE switch between selectable and static criteria.
                placeholder: translate('sdp.requests.fieldFormRules.selectCriteria'), //NO I18N
                dataList: {}, //JSON object if criteria is selectable, string if criteria is static.
                containerClassName: 'criteriadiv', //CSS class name of the container element. //NO I18N
                elementClassName: 'selectcriteria', //CSS class name of the element. //NO I18N
                useSelect2: true, //Option to toggle select2 plugin.
                select2Alternative: '', //Function to initiate third party plugin other than select2 default options.
                isDisabled: false //Disable(will not appear) this field.
            },
            criteriaValue: {
                isSearchable: 0,
                placeholder: translate('sdp.requests.fieldFormRules.selectValue'), //NO I18N
                dataList: {}, //JSON object for values.
                containerClassName: 'criteriavaldiv', //CSS class name of the container element.  //NO I18N
                elementClassName: 'criteriaval', //CSS class name of the element. //NO I18N
                useSelect2: true //Option to toggle select2 plugin.
            }
        };
    // plugin constructor
    function Plugin(element, options) {
        this.element = element;
        this._options = options;
        this._defaults = defaults;
        this.settings = {};
        this._name = pluginName;
        this.deepClone();
        this.init();
    }
    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        // initialize
        init: function() {
            var row = $(this.element).find('li:first');
            this.setClassNames(row);
            this.setColumnInput(row);
            return row;
        },
        // Function to support extending nested JSON.
        deepClone: function() {
            this.settings = $.extend({}, this._defaults, this._options);
            // Currently only 4 specific keys have objects as values. So no looping is used.
            this.settings.operator = $.extend({}, this._defaults.operator, this._options.operator);
            this.settings.columnData = $.extend({}, this._defaults.columnData, this._options.columnData);
            this.settings.criteria = $.extend({}, this._defaults.criteria, this._options.criteria);
            this.settings.criteriaValue = $.extend({}, this._defaults.criteriaValue, this._options.criteriaValue);
        },
        // Forces class names (from options) for required elements on priliminary DOM.
        // @arg1: row (current row DOM object)
        setClassNames: function(row) {
            var options = this.settings;
            var containerClassNames = [
                    {'containerClassName': options.operator.containerClassName, 'elementClassName': options.operator.elementClassName},//NO I18N
                    {'containerClassName': options.columnData.containerClassName, 'elementClassName': options.columnData.elementClassName},//NO I18N
                    {'containerClassName': options.criteria.containerClassName, 'elementClassName': options.criteria.elementClassName},//NO I18N
                    {'containerClassName': options.criteriaValue.containerClassName, 'elementClassName': options.criteriaValue.elementClassName}//NO I18N
                ];
            $.each(containerClassNames, function(i, v) {
                if(!row.children('div:nth-child('+ (i+1) +')').hasClass(v.containerClassName)) {
                    row.children('div:nth-child('+ (i+1) +')').addClass(v.containerClassName);//NO I18N
                }
                if(!row.children('div:nth-child('+ (i+1) +')').children().hasClass(v.elementClassName)) {
                    row.children('div:nth-child('+ (i+1) +')').children().addClass(v.elementClassName);//NO I18N
                }
            });
            if(!$(this.element).hasClass(options.listClass)) {
                $(this.element).addClass(options.listClass);
            }
            if(!row.hasClass(options.listItemClass)) {
                row.addClass(options.listItemClass);
            }
        },
        // Change the value of isEditState to togle between Edit and View form.
        // @arg1: boolean - true/false or 0/1
        changeEditMode: function(value) {
            this.settings.isEditState = value;
        },
        // Populate select options.
        // @arg1: data (JSON object of option title and value)
        // @arg2: currentSelect (DOM object)
        populateSelectOptions: function(data, currentSelect){
            // Check if the input data is array or object.
            // If object, the data contains <optgroup>
            var htmlOpts=[];
            if($.isArray(data)){
                $.each(data, function(i, v) {
                    htmlOpts.push($(new Option(v.TITLE,v.VALUE)).attr({'title':v.TITLE, 'data-type': v.TYPE}));//NO I18N
                });
                currentSelect.append(htmlOpts);
            } else {
                var that = this;
                   $.each(data, function(i, v){
                    currentSelect.append('<optgroup label="' + e_html(i) + '"></optgroup>');//NO I18N
                    htmlOpts = [];
                    $.each(v, function(j, u) {
                        htmlOpts.push($(new Option(u.TITLE,u.VALUE)).attr({'title':u.TITLE, 'data-type': u.TYPE}));//NO I18N
                    });
                    currentSelect.find('optgroup:last').append(htmlOpts);//NO I18N
                });
            }
        },
        // Switch the input type of Criteria Value field and load
        // options if the input type is "select" or "multiselect".
        // @arg1: row (current row DOM object)
        // @arg2: selectedData (attributes of slected options in Column and Criteria fields)
        switchInputType: function(row, selectedData) {
            var options = this.settings;
            var currentCell = row.find('.'+ options.criteriaValue.containerClassName);
            var selectedValue = selectedData.selectedColumnData.VALUE;
            var inputType = selectedData.selectedColumnData.TYPE;
            if (options.criteria.isSelectable && !options.criteria.isDisabled) {
                inputType = selectedData.selectedCriteriaData.TYPE;
            }
            if(inputType===undefined){
                currentCell.html('<input type="text" class="form-control '+ options.criteriaValue.elementClassName +' disabled" value="" disabled="disabled" />');
            }
            if(inputType==='sdp_mselect2'){
                inputType="sdp_select2";        //NO I18N
            }
            switch (inputType) {
        case 'empty'://NO I18N
                    currentCell.html('<input type="text" class="form-control disabled" disabled="disabled"" />');
                    break;
                case 'ajax_multiselect'://NO I18N
                case 'ajax_select'://NO I18N
                    currentCell.html('<input type="text" class="form-control '+ options.criteriaValue.elementClassName +'"/>');
                    var currentSelect = currentCell.find('input');
                    var url = options.criteriaValue.dataList[selectedValue];
                    //if (data) {
                        var multiselect = false;
                        if(inputType == "ajax_multiselect"){
                            multiselect = true;
                        }
                        this.initAjaxSelect2(currentSelect, currentCell, options.criteriaValue.placeholder, options.criteriaValue.isSearchable, options.criteriaValue.useSelect2,url,selectedValue,multiselect);
                    //}
                    if(!options.isEditState) {
                        this.triggerSelectElement(currentSelect, options.criteriaValue.useSelect2);
                    }
                    break;
                case 'boolean'://NO I18N
                case 'select'://NO I18N
                    var data = options.criteriaValue.dataList[selectedValue];
                    if(data.length > 500 && selectedValue.indexOf("UDF") > -1){
                        //for udf fields that have over 500 options, use dynamicLoading
                        currentCell.html('<input class="form-control '+ options.criteriaValue.elementClassName +'" data-dynamic-options="true" autocomplete="off"/>');//NO I18N
                        var currentSelect = currentCell.find('input');
                        var optionsArray = [];
                        for(var i=0, len=data.length; i<len; i++){
                            optionsArray.push({"id":data[i].VALUE, "text":data[i].TITLE});
                        }
                        dynamicLoading.init(jQuery(currentSelect), {
                            allowedValues: optionsArray
                        });
                        if(!options.isEditState) {
                            this.triggerSelectElement(currentSelect, options.criteriaValue.useSelect2);
                        }
                    }else{
                        currentCell.html('<select class="form-control '+ options.criteriaValue.elementClassName +'" autocomplete="off"></select>');//NO I18N
                        var currentSelect = currentCell.find('select');
                        if(options.criteriaValue.useSelect2) {
                            currentSelect.html('<option></option>');
                        } else {
                            currentSelect.html('<option value="" disabled selected>'+ options.criteriaValue.placeholder +'</option>');
                        }
                        if (data) {
                            this.populateSelectOptions(data, currentSelect);
                            this.initSelect2(currentSelect, currentCell, options.criteriaValue.placeholder, options.criteriaValue.isSearchable, options.criteriaValue.useSelect2,options);
                        }
                        if(!options.isEditState) {
                            this.triggerSelectElement(currentSelect, options.criteriaValue.useSelect2);
                        }
                    }
                    break;
                case "sdp_select2": //NO I18N
                  currentCell.html(`<input type="text" class="form-control `    //NO I18N
                  + options.criteriaValue.elementClassName +
                  `" data-dynamic-options="true" autocomplete="off"/>`);        //NO I18N
                 var currentSelect = currentCell.find('input');
                 var url = options.criteriaValue.dataList[selectedValue];
                 currentSelect.sdp_select2({
                     multiple:true,
                         url:[{
                             url:url,
                             field:selectedValue.toLowerCase(),
                             input_fields:(selectedValue.toLowerCase()=="stage"||selectedValue.toLowerCase()=="status")&&options.workFlowId?{"workflow_id":options.workFlowId}:{}//NO I18N
                         }],
                         placeholder: translate(options.criteriaValue.placeholder),
                         allowClear: true,
                         default_option:{"id":"0","text":translate("sdp.requests.fieldFormRules.rules.notspecified")},//NO I18N
                         closeOnSelect: false,
                         processResults: function(cacheData, data) {
                             var obj = {};
                             obj.text = data.name || data.text;
                             obj.id = data.id;
                             if(data.stage) {
                                 obj.stage = data.stage;
                             }
                             else if(data.category){
                                 obj.category = data.category;
                             }
                             else if(data.subcategory){
                                obj.subcategory = data.subcategory;
                             }
                             cacheData.push(obj);
                         },
                         formatResult: function(data) {
                             var name = data.text;
                             if(data.stage) {
                                 name = data.text + " >> " + data.stage.name;
                             }
                             else if(data.category){
                                 name = data.text + " >> " + data.category.name;
                             }
                             else if(data.subcategory){
                                name = data.text + " >> " + data.subcategory.name
                                if(data.subcategory.category){
                                    name=name+ " >> " + data.subcategory.category.name;
                                }
                             }
                             return e_html(name);
                         },
                         formatSelection: function(data) {
                             var name = data.text;
                             if(data.stage) {
                                 name = data.text + " >> " + data.stage.name;
                             }
                             else if(data.category){
                                 name = data.text + " >> " + data.category.name;
                             }
                             else if(data.subcategory){
                                name = data.text + " >> " + data.subcategory.name
                                if(data.subcategory.category){
                                    name=name+ " >> " + data.subcategory.category.name;
                                }
                             }
                             return e_html(name);
                         }
                 })
                 if(!options.isEditState) {
                     this.triggerSelectElement(currentSelect, options.criteriaValue.useSelect2);
                 }
                 break;
                case 'multiselect'://NO I18N
                    var data = options.criteriaValue.dataList[selectedValue];
                    if(data.length > 500 && selectedValue.indexOf("UDF") > -1){
                        //for udf fields that have over 500 options, use dynamicLoading
                        currentCell.html('<input class="form-control '+ options.criteriaValue.elementClassName +'" data-dynamic-options="true" autocomplete="off"/>');//NO I18N
                        var currentSelect = currentCell.find('input');
                        var optionsArray = [];
                        for(var i=0, len=data.length; i<len; i++){
                            optionsArray.push({"id":data[i].VALUE, "text":data[i].TITLE});
                        }
                        dynamicLoading.init(jQuery(currentSelect), {
                            allowedValues: optionsArray,
                            multiple: true
                        });
                        if(!options.isEditState) {
                            this.triggerSelectElement(currentSelect, options.criteriaValue.useSelect2);
                        }
                    }else{
                        currentCell.html('<select class="form-control '+ options.criteriaValue.elementClassName +'" multiple></select>');//NO I18N
                        var currentSelect = currentCell.find('select');
                        if(options.criteriaValue.useSelect2) {
                            currentSelect.html('<option></option>');
                        } else {
                            currentSelect.html('<option value="" disabled selected>'+ options.criteriaValue.placeholder +'</option>');
                        }
                        if(Array.isArray(data)){
                            data = data.filter(function(data) { return !(typeof data.VALUE === "string" && data.VALUE.indexOf("$(") === 0) } ); // NO I18N
                        }
                        if (data) {
                            this.populateSelectOptions(data, currentSelect);
                            this.initSelect2(currentSelect, currentCell, options.criteriaValue.placeholder, options.criteriaValue.isSearchable, options.criteriaValue.useSelect2,null,options);
                        }
                        if(!options.isEditState) {
                            this.triggerSelectElement(currentSelect, options.criteriaValue.useSelect2);
                        }
                    }
                    break;
                case 'date'://NO I18N
                    dynamicId = dynamicId + 1;
                    var b_id = dynamicId;
                    currentCell.html('<input type="hidden" class="'+ options.criteriaValue.elementClassName +' disp-h" name="values1" value="" id="datepicker' + dynamicId + '">' + '<input type="text" value="" id="datepicker' + dynamicId + '_Display" class="form-control advsearch-input-cal cur-ptr" readonly="true"></td>');//NO I18N
                    currentCell.find(".form-control").off("click.date").on("click.date", function(){    //NO I18N
                        initCalendar('datepicker'+ b_id, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true); //NO I18N
                    });
                    if(!options.isEditState) {
                        setTimeout(function() {
                            currentCell.find('input').trigger('click');//NO I18N
                        }, 1);
                    }
                    break;
                case 'datetime'://NO I18N
                    dynamicId = dynamicId + 1;
                    var b_id = dynamicId;
                    currentCell.html('<input type="hidden" class="'+ options.criteriaValue.elementClassName +' disp-h" name="values1" value="" id="datetimepicker' + dynamicId + '">' + '<input type="text" value="" id="datetimepicker' + dynamicId + '_Display" class="form-control advsearch-input-cal cur-ptr" readonly="true"></td>');//NO I18N
                    currentCell.find(".form-control").off("click.date").on("click.date", function(){    //NO I18N
                        initCalendar('datetimepicker'+ b_id); //NO I18N
                    });
                    if(!options.isEditState) {
                        setTimeout(function() {
                            currentCell.find('input').trigger('click');//NO I18N
                        }, 1);
                    }
                    break;
                case 'text'://NO I18N
                    currentCell.html('<input class="form-control '+ options.criteriaValue.elementClassName +'" type="text" value="" />');//NO I18N
                    if(!options.isEditState) {
                        setTimeout(function() {
                            currentCell.find('input').trigger('focus');
                        }, 1);
                    }
                    break;
                case 'textarea'://NO I18N
                    currentCell.html('<textarea class="form-control '+ options.criteriaValue.elementClassName +'" value=""></textarea>');//NO I18N
                    if(!options.isEditState) {
                        setTimeout(function() {
                            currentCell.find('input').trigger('focus');
                        }, 1);
                    }
                    break;
                case 'email'://NO I18N
                    currentCell.html('<input class="form-control '+ options.criteriaValue.elementClassName +'" type="text" value="" />');//NO I18N
                    if (options.validateField) {
                        this.validate(inputType, currentCell.find('input'));
                    }
                    if(!options.isEditState) {
                        setTimeout(function() {
                            currentCell.find('input').trigger('focus');
                        }, 1);
                    }
                    break;
                case 'double'://NO i18N
                case 'long'://NO i18N
                case 'number'://NO I18N
                    currentCell.html('<input class="form-control '+ options.criteriaValue.elementClassName +'" type="text" value="" />');//NO I18N
                    if (options.validateField) {
                        this.validate(inputType, currentCell.find('input'));
                    }
                    if(!options.isEditState) {
                        setTimeout(function() {
                            currentCell.find('input').trigger('focus');
                        }, 1);
                    }
                    break;
                default:
                    if(typeof options.criteriaValue.dataList[selectedValue] === "function") {
                        var cb = options.criteriaValue.dataList[selectedValue];
                        cb(inputType, currentCell); //apply any HTML markup or any plugin
                    }
                    break;
            }
        },
        // Switch And/Or IMPLEMENTATION
        implementSwitchSelect: function(domObject) {
            var options = this.settings;
            var selectSwitchObj = domObject.parent().html(
                              '<div class="'+options.operator.elementClassName+' select-switch form-control">'//NO I18N
                                 +'<span class="">'+options.operator.dataList[0].TITLE+'</span>'//NO I18N
                                 +'<i class="caret fr mt10"></i>'//NO I18N
                                 +'<select class="form-control disp-h">'//NO I18N
                                 +'</select>'//NO I18N
                              +'</div>');//NO I18N
            selectSwitchObj.find('span').text(options.operator.dataList[0].TITLE);
            $(options.operator.dataList).each(function(){
                selectSwitchObj.find('select').append('<option value="'+this.VALUE+'">'+this.TITLE+'</option>');
            });
            selectSwitchObj.on('click', function(){//NO I18N
                var v1 = jQuery(this).find('select option').eq(0);
                var v2 = jQuery(this).find('select option').eq(1);
                if(v1.text()==jQuery(this).find('span').text()){
                      jQuery(this).find('span').removeClass('active').text(v2.text()).attr('title',v2.attr('title'));
                }
                else{ jQuery(this).find('span').addClass('active').text(v1.text()).attr('title',v1.attr('title')); }
            });
        },
        // Add new row
        // @arg1: AddRow button (DOM object)
        addRow: function(obj) {
            var options = this.settings;
            var thisRow = obj.closest('li.' + options.listItemClass);//NO I18N
            var newRow = thisRow.clone();
            var listWrapper = obj.closest(options.listTag + '.' + options.listClass);
            listWrapper.find('.removerowbtn').removeClass('hide');//NO I18N
            thisRow.after(newRow);
            this.setColumnInput(newRow);
            if(options.addRowCBFunction !== '' && typeof options.addRowCBFunction == "function") {
                var cb = options.addRowCBFunction;
                cb(newRow);
            }
        },
        // Remove the current row
        // @arg1: obj (DOM object)
        removeRow: function(obj) {
            var options = this.settings;
            var that = this;
            var thisRow = obj.closest('li.' + options.listItemClass),//NO I18N
                nextRow = thisRow.next(),
                prevRow = thisRow.prev();
            thisRow.remove();
            if (nextRow.index() >= 0) {
                // if next row of the removed row exists
                if(!options.operator.isDisabled) {
                    this.toggleOperators(nextRow);
                }
                this.toggleAddRemoveButtons(nextRow);
                if (options.isSortable && nextRow.closest('.' + options.listClass).find('li.' + options.listItemClass).length == 1) {
                    var listWrapper = nextRow.closest(options.listTag + '.' + options.listClass);
                    listWrapper.find('.' + options.dragHandleClass).remove();
                    listWrapper.sortable('destroy');//NO I18N
                }
            } else {
                // if previous row of the removed row exists
                if(!options.operator.isDisabled) {
                    this.toggleOperators(prevRow);
                }
                this.toggleAddRemoveButtons(prevRow);
                if (options.isSortable && prevRow.closest('.' + options.listClass).find('li.' + options.listItemClass).length == 1) {
                    var listWrapper = prevRow.closest(options.listTag + '.' + options.listClass);
                    listWrapper.find('.' + options.dragHandleClass).remove();
                    listWrapper.sortable('destroy');//NO I18N
                }
            }
            if(options.removeRowCBFunction !== '' && typeof options.removeRowCBFunction == "function") {
                var cb = options.removeRowCBFunction;
                cb();
            }
        },
        // Function to toggle visibility of and/or operator
        // @arg1: row (current row)
        toggleOperators: function(row) {
            var options = this.settings;
            var listWrapper = row.closest(options.listTag + '.' + options.listClass);
            // Cannot be chanined because the altenative lines will return undefined
            // when the operator is switched between static or seclectable.
            if (options.operator.isSelectable && options.operator.useSelect2) {
                listWrapper.find('.'+ options.operator.containerClassName +' .select2-container').removeClass('hide');//NO I18N
                listWrapper.find('li.' + options.listItemClass + ':first .'+ options.operator.containerClassName +' .select2-container').addClass('hide');//NO I18N
            } else {
                listWrapper.find('.'+ options.operator.elementClassName).removeClass('hide');//NO I18N
                listWrapper.find('li.' + options.listItemClass + ':first .'+ options.operator.elementClassName).addClass('hide');//NO I18N
            }
        },
        // Function to toggle visibility of Add/remove buttons
        // @arg1: row (current row)
        toggleAddRemoveButtons: function(row) {
            var options = this.settings;
            var listWrapper = row.closest(options.listTag + '.' + options.listClass);
            if (listWrapper.find('li.' + options.listItemClass).length > 1) {
                listWrapper.find('.removerowbtn').removeClass('hidden');
            } else {
                listWrapper.find('.removerowbtn').addClass('hidden');
            }
        },
        // Function to automatically open the dropdown of a selectbox (Depends on select2 plugin)
        // @arg1: obj (DOM object)
        // @arg2: useSelect2 (true/false)
        triggerSelectElement: function(obj, useSelect2) {
            var options = this.settings;
            // condition to check is the column select in the row is already chosen.
            if ($(obj).hasClass(options.columnData.elementClassName) && $(obj).val() !== '' && $(obj).val() !== null) {
                return false;
            } else {
                if(useSelect2) {
                    //$(obj).select2('val', 'All');
                    var select2 = $(obj).data('select2');
                    select2.enable(true);
                        if (!select2.opened()) {
                            select2.open();
                        }
                }
            }
        },
        // Function to call intitate Select2 plugin for any select box
        // @arg1: obj (DOM object)
        // @arg2: parentObj (DOM object)
        // @arg3: phtext (placeholder text)
        // @arg4: val (0/-1 switch on/off search option)
        // @arg5: useSelect2 (true/false)
        // @arg6: select2Alternative (function for alternative plugin initiation)
        initSelect2: function(obj, parentObj, phtext, val, useSelect2, select2Alternative,options) {
            if(useSelect2) {
                $(parentObj).find('.select2-container').remove().end()
                    .find('.select2-offscreen').removeClass('select2-offscreen');
                $(obj).select2('destroy');
                $(obj).select2({
                    placeholder: phtext,
                    closeOnSelect: false,
                    minimumResultsForSearch: val,
                    maximumSelectionSize:options && options.maximumSelectionSize,
                    formatNoMatches: function (){ return translate('ae.select2.no.message'); }, //NO I18N
                    adaptContainerCssClass: function(c) {
                            return undefined;
                        } //avoids copying of class of original select tag
                });
            } else if(!useSelect2 && select2Alternative !== '' && typeof select2Alternative === "function") {//NO I18N
                select2Alternative(obj, phtext);
            } else{
                return true;
            }
        },
        initAjaxSelect2 : function(obj, parentObj, phtext, val, useSelect2, url, field_name,multiselect, select2Alternative) {
            var options = this.settings;
            if(useSelect2) {
                $(parentObj).find('.select2-container').remove().end()
                    .find('.select2-offscreen').removeClass('select2-offscreen');
                $(obj).select2('destroy');
                var select2Config = {
                    placeholder: phtext,
                    multiple : multiselect,
                    closeOnSelect: false,
                    minimumResultsForSearch: val,
                    formatNoMatches: function (){ return translate('ae.select2.no.message'); },//NO i18N
                    // initSelection: function (element, callback) {
                    //     console.log(element);
                    //     console.log(callback);
                    //     var data = { "id": "7" };
                    //     callback(data);
                    // },
                    ajax: {
                        url: url,
                        dataType: 'json', //No I18N
                        data: function (search_text) {
                            var d_input = {};
                            if(search_text !== ""){
                                if (field_name == "requester" || field_name == "created_by" || field_name == "owner" || field_name.indexOf("member") != -1 || field_name == "marked_owner" || field_name == "change_owner" || field_name == "change_requester" || field_name == "change_manager") {
                                    d_input.searchTerm = search_text;
                                }else{
                                    d_input.searchText = search_text;
                                }
                            }
                            return d_input;
                          },
                        results: function (resp, page) {
                            var o_result = null;
                            if(resp !== undefined){
                                if (field_name == "requester" || field_name == "created_by" || field_name == "owner" || field_name.indexOf("member") != -1 || field_name == "marked_owner"  || field_name == "change_owner" || field_name == "change_requester" || field_name == "change_manager") {
                                    resp = jQuery.map( resp, function( data, index ) {
                                        if(multiselect && (typeof data.id === "string" && (data.id === "$(my_group)" || data.id === "$(my_site)" || data.id === "$(is_pending)" || data.id === "$(is_completed)"))){
                                            return null;
                                        }
                                                data.text = data.name;
                                                delete data.name;
                                                delete data.deptName;
                                                delete data.employeeId;
                                                return data;
                                            });
                                } else if(multiselect) {
                                    resp = jQuery.map( resp, function( data, index ) {
                                        if(typeof data.id === "string" && (data.id === "$(my_group)" || data.id === "$(my_site)" || data.id === "$(is_pending)" || data.id === "$(is_completed)")){
                                            return null;
                                        }
                                        return data;
                                    });
                                }
                                o_result = {results : resp};
                            }else{
                                o_result = {results : ""};
                            }
                            return o_result;
                        }
                    },
                    adaptContainerCssClass: function(c) {
                            return undefined;
                    } //avoids copying of class of original select tag
                };
                if(url.includes("entity=change")) {
                    select2Config.formatResult = function(result) {
                        return encodeHTML(result.text);
                    }
                }
                $(obj).select2(select2Config);

                // if(!options.isEditState) {
                //         this.triggerSelectElement(obj, options.criteriaValue.useSelect2);
                // }
            } else if(!useSelect2 && select2Alternative !== '' && typeof select2Alternative === "function") {//NO I18N
                select2Alternative(obj, phtext);
            } else{
                return true;
            }
        },
        // Reset fields and values when loaded and when new row is added.
        // @arg1: row (current row)
        resetFields: function(row) {
            var options = this.settings;
            // Populate options for "operator" field and apply select2
            if(!options.operator.isDisabled) {
                if (options.operator.isSelectable) {
                    var that = this;
                    row.find('.'+ options.operator.containerClassName).html('<select class="form-control '+ options.operator.elementClassName +'"></select>').end()
                        .find('.'+ options.operator.elementClassName).off('change');
                    this.populateSelectOptions(options.operator.dataList, row.find('select.'+ options.operator.elementClassName));
                    if(!options.isEditState) {
                        row.find('.'+ options.operator.elementClassName).on('change', {}, function() {
                            that.triggerSelectElement(row.find('select.'+ options.columnData.elementClassName), options.operator.useSelect2);
                        });
                    }
                    if(options.operator.useSelectSwitch && !options.operator.isDisabled && !options.operator.useSelect2 && options.operator.dataList.length==2){
                        this.implementSwitchSelect(row.find('.'+ options.operator.elementClassName));
                    } else{
                        this.initSelect2(row.find('.'+ options.operator.elementClassName), row.find('.'+ options.operator.containerClassName), '', -1, options.operator.useSelect2, options.operator.select2Alternative,options);
                    }
                } else {
                    row.find('.'+ options.operator.containerClassName).html('<p class="'+ options.operator.elementClassName +'">' + options.operator.dataList + '</p>');//NO I18N
                }
                this.toggleOperators(row);
            } else {
                row.find('.'+ options.operator.containerClassName).remove();
            }
            this.toggleAddRemoveButtons(row);
            // insert drag handle
            if(options.isSortable) {
                if(options.enableDragHandle) {
                    row.css({'cursor':'var(--sdpcursor-default)'});//NO I18N
                } else {
                    row.css({'cursor':'var(--sdpcursor-grab)'});//NO I18N
                }
            }
            if (options.criteria.isSelectable && !options.criteria.isDisabled) {
                // reset html for criteria
                row.find('select.'+ options.criteria.elementClassName).html('<option></option>');
                this.initSelect2(row.find('.'+ options.criteria.elementClassName), row.find('.'+ options.criteria.containerClassName), options.criteria.placeholder, options.criteria.isSearchable, options.criteria.useSelect2, options.criteria.select2Alternative,options);
            } else if(options.criteria.isDisabled) {
                row.find('.'+ options.criteria.containerClassName).remove();
            } else {
                row.find('.'+ options.criteria.containerClassName).html('<p class="'+ options.criteria.elementClassName +'">' + options.criteria.dataList + '</p>');//NO I18N
            }
            // reset html for criteria value
            row.find('.'+ options.criteriaValue.containerClassName).html('<input type="text" class="form-control '+ options.criteriaValue.elementClassName +' disabled" value="" disabled="disabled" />');//NO I18N
            this.initSorting(row);
            this.initAddRemoveClicks(row);
        },
        // Initiate jquery UI sortable.
        // @arg1: row (current row)
        initSorting: function(row) {
            var options = this.settings;
            if (options.isSortable && row.closest('.' + options.listClass).find('li.' + options.listItemClass).length > 1) {
                var firstRow = $(this.element).find('li.' + options.listItemClass).eq(0);
                if(!firstRow.find('.' + options.dragHandleClass).length) {
                    firstRow.prepend('<div title="' + translate('sdp.requests.fieldFormRules.dragHandle') + '" class="fl '+ options.dragHandleClass +'"><b></b></div>');//NO I18N
                }
                if(!row.find('.' + options.dragHandleClass).length){
                    row.prepend('<div title="' + translate('sdp.requests.fieldFormRules.dragHandle') + '" class="fl '+ options.dragHandleClass +'"><b></b></div>');//NO I18N
                }
                var listWrapper = row.closest(options.listTag + '.' + options.listClass);//NO I18N
                var that = this;
                var sortableEl = $(listWrapper).sortable({
                    forcePlaceholderSize: true,
                    handle: (options.enableDragHandle) ? '.'+options.dragHandleClass : options.enableDragHandle,
                    placeholder: options.sortingPlaceholderClass,
                    update: function(event, ui) {
                        if(!options.operator.isDisabled) {
                            that.toggleOperators($(ui.item));
                        }
                        that.toggleAddRemoveButtons($(ui.item));
                    }
                });
                $(listWrapper).disableSelection();
                row.on( 'click', 'input', function () {    //NO I18N
                    $(this).trigger('focus');
                }).on( 'click', 'textarea', function () {   //NO I18N
                    $(this).trigger('focus');
                });
            }
        },
        // Implement validation
        // @arg1: type (input type: number/email)
        // @arg2: field (DOM object)
        validate: function(type, field) {
            switch (type) {
                case 'double'://NO I18N
                    var regex = /^\d*(\.\d+)?$/;
                    var that = this;
                    field.on('focusout', function() {
                        if (!regex.test(field.val()) && field.val() !== '') {
                            that.showValidationError(field, translate("sdp.requests.fieldFormRules.digitOnly")); //NO I18N
                            return false;
                        } else {
                            that.hideValidationError(field);
                            return true;
                        }
                    });
                    break;
                case 'number'://NO I18N
                case 'long'://NO I18N
                    var regex = /^[0-9]+$/;
                    var that = this;
                    field.on('focusout', function() {
                        if (!regex.test(field.val()) && field.val() !== '') {
                            that.showValidationError(field, translate("sdp.common.number.validation.msg"));//NO i18N
                            return false;
                        } else {
                            that.hideValidationError(field);
                            return true;
                        }
                    });
                    break;
                case 'email'://NO I18N
                    var regex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
                    var that = this;
                    field.on('focusout', function() {
                        if (!regex.test(field.val()) && field.val() !== '') {
                            that.showValidationError(field, translate("sdp.requests.fieldFormRules.invalidEmail")); //NO I18N
                            return false;
                        } else {
                            that.hideValidationError(field);
                            return true;
                        }
                    });
                    break;
            }
        },
        // Show error message for validation
        // @arg1: field (DOM object)
        // @arg2: msg (message string to display)
        showValidationError: function(field, msg) {
            var options = this.settings;
            field.attr('aria-invalid', 'true');
            var currentCell = field.parent();
            currentCell.find('.'+ options.validationMessageClass).remove();
            currentCell.append('<span class="'+ options.validationMessageClass +'">' + msg + '</span>');//NO I18N
            currentCell.find('.'+ options.validationMessageClass).addClass('err');
            //currentCell.find('.'+ options.validationMessageClass).css('margin-left', '-' + currentCell.find('.'+ options.validationMessageClass).width() + 'px');//NO I18N
            currentCell.find('.'+ options.validationMessageClass).show();
        },
        // Hide validation error on success
        // @arg1: field (DOM object)
        hideValidationError: function(field) {
            var options = this.settings;
            field.attr('aria-invalid', 'false');
            var currentCell = field.parent();
            currentCell.find('.' + options.validationMessageClass).remove();
        },
        // Display errors except validation errors
        // @arg1: msg (message string)
        globalError: function(msg) {
            showalert('failure', msg, 'isAutoHide=false');//NO I18N
        },
        // initialize click event for all AddRow and RemoveRow buttons.
        // @arg1: row (current row)
        initAddRemoveClicks: function(row) {
            var that = this;
            var options = this.settings;
            $(row).find('.addrowbtn').off('click').on('click', function() {// NO I18N
                var inputElArr = $(row).closest(options.listTag + '.' + options.listClass).find('.' + options.criteriaValue.containerClassName);
                var isValidated = false;
                if(options.addRowValidate && typeof options.addRowValidationFunction === 'function') {
                    var cb = options.addRowValidationFunction;
                    cb(inputElArr);
                    $('span.isValidated').each(function() {
                        if($(this).html()==='false') {
                            isValidated = false;
                            return false;
                        } else {
                            isValidated = true;
                        }
                    });
                } else {
                    isValidated = true;
                }
                if (isValidated) {
                    that.addRow($(this));
                }
            });
            $(row).find('.removerowbtn').on('click', function() {//NO I18N
                that.removeRow($(this));
            });
        },
        // Set the options for Column select field from input data array
        // @arg1: row (current row)
        setColumnInput: function(row) {
            var options = this.settings;
            var currentCell = row.find('.'+ options.columnData.containerClassName);
            var currentSelect = currentCell.find('select.'+ options.columnData.elementClassName);
            var columnDataList = options.columnData.dataList;
            if(options.columnData.isSelectablePlaceholder) {
                currentSelect.html('<option value="-1">'+options.columnData.placeholder+'</option>');
            } else {
                currentSelect.html('<option value="" disabled selected>'+options.columnData.placeholder+'</option>');
            }
            if (columnDataList) {
                this.populateSelectOptions(columnDataList, currentSelect);
                this.initSelect2(currentSelect, row.find('.'+ options.columnData.containerClassName), options.columnData.placeholder, options.columnData.isSearchable, options.columnData.useSelect2, options.columnData.select2Alternative,options);
                this.resetFields(row);
                currentSelect.off('change');//NO I18N
                var that = this;
                if (options.criteria.isSelectable && !options.criteria.isDisabled) {
                    currentSelect.on('change', {}, function() {//NO I18N
                        that.setCriteriaInput(row);
                    });
                } else {
                    currentSelect.on('change', {}, function() {//NO I18N
                        that.setCriteriaValueInput(row);
                    });
                }
            }
        },
        // Set options for Criteria select/static field
        // @arg1: row (current row)
        setCriteriaInput: function(row) {
            var options = this.settings;
            var selectedType = row.find('.'+ options.columnData.elementClassName +' option:selected').attr('data-type');//NO I18N
            var criteriaData = options.criteria.dataList[selectedType];
            var currentCell = row.find('.'+ options.criteria.containerClassName);
            var currentSelect = currentCell.find('select.'+ options.criteria.elementClassName);
            row.find('.'+options.criteriaValue.containerClassName).html('<input type="text" class="form-control '+ options.criteriaValue.elementClassName +' disabled" value="" disabled="disabled" />');
            closeCalDialog();
            currentSelect.html('<option value="-1">'+options.criteria.placeholder+'</option>');
            if (criteriaData) {
                this.populateSelectOptions(criteriaData, currentSelect);
                currentSelect.prop('disabled', false);//NO I18N
                this.initSelect2(currentSelect, row.find('.'+ options.criteria.containerClassName), options.criteria.placeholder ,options.criteria.isSearchable, options.criteria.useSelect2, options.criteria.select2Alternative,options);
                if(!options.isEditState) {
                    this.triggerSelectElement(currentSelect, options.criteria.useSelect2);
                }
                currentSelect.off('change');//NO I18N
                var that = this;
                currentSelect.on('change', {}, function() {
                    that.setCriteriaValueInput(row);
                });
            }
            if(!options.isEditState) {
                this.triggerSelectElement(currentSelect, options.criteria.useSelect2);
            }
        },
        // Set options for Criteria Value field
        // @arg1: row (current row)
        setCriteriaValueInput: function(row) {
            var options = this.settings;
            var selectedData = {
                selectedColumnData: {
                    'TITLE': row.find('.'+ options.columnData.elementClassName +' option:selected').attr('title'),//NO I18N
                    'VALUE': row.find('.'+ options.columnData.elementClassName +' option:selected').val(),//NO I18N
                    'TYPE': row.find('.'+ options.columnData.elementClassName +' option:selected').attr('data-type')//NO I18N
                }
            };
            if (options.criteria.isSelectable && !options.criteria.isDisabled) {
                selectedData.selectedCriteriaData = {
                        'TITLE': row.find('.'+ options.criteria.elementClassName +' option:selected').attr('title'),//NO I18N
                        'VALUE': row.find('.'+ options.criteria.elementClassName +' option:selected').val(),//NO I18N
                        'TYPE': row.find('.'+ options.criteria.elementClassName +' option:selected').attr('data-type')//NO I18N
                };
            }
            closeCalDialog();
            this.switchInputType(row, selectedData);
        },
        // Get or Update criteriaValue field.
        // @arg1: row index
        // @arg2: field values for particular row
        // @arg3: row object
        // @arg4: mode (get or set)
        // @arg5: custom functions object
        getSetCriteriaVal: function(i, v, row, mode, customFunctions) {
            var options = this.settings;
            var inputType = row.find('.'+ options.columnData.elementClassName +' option:selected').attr('data-type');//NO I18N
            if (options.criteria.isSelectable && !options.criteria.isDisabled) {
                inputType = row.find('.'+ options.criteria.elementClassName +' option:selected').attr('data-type');//NO I18N
            }
            if(inputType === "select" || inputType === "multiselect"){
                if(row.find("input."+options.criteriaValue.elementClassName).attr("data-dynamic-options") === "true"){
                    inputType = "dynamic_loading"; //No i18n
                }
            }
            if(inputType === "sdp_mselect2"){
                inputType="sdp_select2";        //NO I18N
            }
            switch(inputType) {
        case 'empty'://NO I18N
                    break;
                case 'ajax_select'://NO I18N
                    if(mode === 'set') {
                        if(options.criteriaValue.useSelect2) {
                            row.find('.'+ options.criteriaValue.elementClassName).select2("data", v.criteriaVal[0]);//NO I18N
                        }
                    } else {
                        row.find('.row-output').append($('<span>',{'class':'criteriaval-output',text:row.find('select.'+ options.criteriaValue.elementClassName).val()}));
                    }
                    break;
                case 'boolean'://NO I18N
                case 'select'://NO I18N
                     if(mode === 'set') {
                        if(options.criteriaValue.useSelect2) {
                            row.find('.'+ options.criteriaValue.elementClassName).select2("val", v.criteriaVal);//NO I18N
                        } else {
                            row.find('.'+ options.criteriaValue.elementClassName).val(v.criteriaVal);
                        }
                    } else {
                        row.find('.row-output').append($('<span>',{'class':'criteriaval-output',text:row.find('select.'+ options.criteriaValue.elementClassName).val()}));
                    }
                    break;
                case 'ajax_multiselect'://NO I18N
                    if(mode === 'set') {
                        if(options.criteriaValue.useSelect2) {
                            row.find('.'+ options.criteriaValue.elementClassName).select2("data", v.criteriaVal);//NO I18N
                        }
                    } else {
                        var rowVal = '';
                        if(row.find('select.'+ options.criteriaValue.elementClassName).val() !== null) {
                            rowVal = (row.find('select.'+ options.criteriaValue.elementClassName).val());//.toString();
                        }
                        for(var i=0,len=rowVal.length;i<len;i++){
                            row.find('.row-output').append($('<span>',{'class':'criteriaval-output',text:rowVal[i]}));
                        }
                    }
                    break;
                case 'multiselect'://NO I18N
                    if(mode === 'set') {
                        if(options.criteriaValue.useSelect2) {
                            if(v.module&&v.module=="RELEASE"&&v.column.indexOf("udf_")==-1){
                                var selectedValues = [];
                                for(var i=0,len=v.criteriaVal.length; i<len; i++){
                                    if(typeof v.criteriaVal[i] === 'object'){
                                        selectedValues.push({"id":v.criteriaVal[i].id, "text":v.criteriaVal[i].name});// reason for breakage
                                    }
                                    else{
                                        if(v.column=="ROLES"){
                                            selectedValues.push({"text":v.criteriaVal[i]});// Need to make some changes
                                        }else{
                                            selectedValues.push({"id":v.criteriaVal[i]});
                                        }
                                    }
                                }
                                row.find('.'+ options.criteriaValue.elementClassName).select2("data", selectedValues);//NO I18N
                            }
                            else{
                                row.find('.'+ options.criteriaValue.elementClassName).select2("val", v.criteriaVal);//NO I18N
                            }
                        } else {
                            row.find('.'+ options.criteriaValue.elementClassName).val(v.criteriaVal);
                        }
                    } else {
                        var rowVal = '';
                        if(row.find('select.'+ options.criteriaValue.elementClassName).val() !== null) {
                            rowVal = (row.find('select.'+ options.criteriaValue.elementClassName).val());//.toString();
                        }
                        for(var i=0,len=rowVal.length;i<len;i++){
                            row.find('.row-output').append($('<span>',{'class':'criteriaval-output',text:rowVal[i]}));
                        }
                    }
                    break;
                case 'sdp_select2'://NO I18N
                     if(mode === 'set') {
                         var selectedValues = [];
                         for(var i=0,len=v.criteriaVal.length; i<len; i++){
                             selectedValues.push({"id":v.criteriaVal[i].id, "text":v.criteriaVal[i].name});// reason for breakage
                         }
                         if(options.criteriaValue.useSelect2) {
                             row.find('.'+ options.criteriaValue.elementClassName).select2("data", selectedValues);//NO I18N
                         }
                     } else {
                         var rowVal = [];
                         if(row.find('input.'+ options.criteriaValue.elementClassName).val() !== null) {
                             valuesObj = (row.find('input.'+ options.criteriaValue.elementClassName).select2("data")); //No i18n
                         }
                         for(var i=0,len=valuesObj.length; i<len; i++){
                             rowVal.push(valuesObj[i].id);
                             row.find('.row-output').append($('<span>',{'class':'criteriaval-output',text:valuesObj[i].id}));
                         }
                     }
                     break;
                case 'dynamic_loading'://No i18n
                    if(mode === 'set') {
                        var selectedValues = [];
                        for(var i=0,len=v.criteriaVal.length; i<len; i++){
                            selectedValues.push({"id":v.criteriaVal[i], "text":v.criteriaVal[i]});
                        }
                        if(options.criteriaValue.useSelect2) {
                            row.find('.'+ options.criteriaValue.elementClassName).select2("data", selectedValues);//NO I18N
                        }
                    } else {
                        var rowVal = [];
                        if(row.find('input.'+ options.criteriaValue.elementClassName).val() !== null) {
                            valuesObj = (row.find('input.'+ options.criteriaValue.elementClassName).select2("data")); //No i18n
                        }
                        for(var i=0,len=valuesObj.length; i<len; i++){
                            rowVal.push(valuesObj[i].id);
                        }
                        for(var i=0,len=rowVal.length;i<len;i++){
                            row.find('.row-output').append($('<span>',{'class':'criteriaval-output',text:rowVal[i]}));
                        }
                    }
                    break;
                case 'date'://NO I18N
                    if(mode === 'set') {
                        var elID=row.find('.'+ options.criteriaValue.containerClassName).find('input[type=hidden]').attr('id');
                        row.find('#'+elID).val(v.criteriaVal[0]).attr('elementType', 'date');
                        displayClientTime(elID);
                        row.find('input#'+ elID +'_Display').removeClass().addClass("dateFieldForceLTR tl form-control advsearch-input-cal");//NO I18N
                    } else {
                        row.find('.row-output').append($('<span>',{'class':'criteriaval-output',text:row.find('.'+ options.criteriaValue.containerClassName).find('input[type=hidden]').val()}));
                    }
                    break;
                case 'datetime'://NO I18N
                    if(mode === 'set') {
                        var elID=row.find('.'+ options.criteriaValue.containerClassName).find('input[type=hidden]').attr('id');
                        row.find('#'+elID).val(v.criteriaVal[0]);
                        displayClientTime(elID);
                        row.find('input#'+ elID +'_Display').removeClass().addClass("dateFieldForceLTR tl form-control advsearch-input-cal");//NO I18N
                    } else {
                        row.find('.row-output').append($('<span>',{'class':'criteriaval-output',text:row.find('.'+ options.criteriaValue.containerClassName).find('input[type=hidden]').val()}));
                    }
                    break;
                case 'text'://NO I18N
                    if(mode === 'set') {
                        row.find('.'+ options.criteriaValue.elementClassName).val(v.criteriaVal[0]);
                    } else {
                        row.find('.row-output').append($('<span>',{'class':'criteriaval-output',text:row.find('.'+ options.criteriaValue.elementClassName).val()}));
                    }
                    break;
                case 'textarea'://NO I18N
                    if(mode === 'set') {
                        row.find('.'+ options.criteriaValue.elementClassName).val(v.criteriaVal[0]);
                    } else {
                        row.find('.row-output').append($('<span>',{'class':'criteriaval-output',text:row.find('.'+ options.criteriaValue.elementClassName).val()}));
                    }
                    break;
                case 'email'://NO I18N
                    if(mode === 'set') {
                        row.find('.'+ options.criteriaValue.elementClassName).val(v.criteriaVal[0]);
                    } else {
                        row.find('.row-output').append($('<span>',{'class':'criteriaval-output',text:row.find('.'+ options.criteriaValue.elementClassName).val()}));
                    }
                    break;
                case 'double'://NO I18N
                case 'long'://NO I18N
                case 'number'://NO I18N
                    if(mode === 'set') {
                        row.find('.'+ options.criteriaValue.elementClassName).val(v.criteriaVal[0]);
                    } else {
                        row.find('.row-output').append($('<span>',{'class':'criteriaval-output',text:row.find('.'+ options.criteriaValue.elementClassName).val()}));
                    }
                    break;
                default:
                    if(mode === 'set') {
                        if(inputType !== undefined) {
                            if(typeof customFunctions.criteriaValue[inputType] === "function") {
                                var cf = customFunctions.criteriaValue[inputType];
                                cf(i, v, row, inputType);
                            }
                        }
                    } else {
                        if(inputType !== undefined) {
                            var wrapperClass='row-output',//NO I18N
                                elClass='criteriaval-output';//NO I18N
                            if(typeof customFunctions.criteriaValue[inputType] === "function") {
                                var cf = customFunctions.criteriaValue[inputType];
                                cf(i, v, row, inputType, wrapperClass, elClass);
                            } else {
                            row.find('.' + wrapperClass).append('<span class="'+ elClass +'"></span>');
                            }
                        }
                    }
                    break;
            }
        },
        // Public Method
        // Get the current rows data of filters whenever this is called.
        // @arg1: Object ontaining custom fucntions.
        getFilterData: function(customGetFunctions) {
            var outputData = [],
                options = this.settings,
                operatorField = '',
                columnField = '',
                criteriaField = '',
                criteriaValField = '',
                that = this;
            var operatorFunction = '';
            if(options.operator.isSelectable && options.operator.select2Alternative === '' && !options.operator.isDisabled&&!options.operator.useSelectSwitch) {
                operatorFunction = function(i, v, row, wrapperClass, elClass){
                    row.find('span.'+ wrapperClass).append('<span class="'+ elClass +'">'
                                            + row.find('select.'+ options.operator.elementClassName).val()
                                            + '</span>');
                };
            } else if(options.operator.useSelectSwitch && !options.operator.isDisabled && !options.operator.useSelect2 && options.operator.dataList.length==2){
                operatorFunction = function(i, v, row, wrapperClass, elClass) {
                    row.find('span.'+ wrapperClass).append('<span class="'+ elClass +'">'
                                            + row.find('div.'+options.operator.elementClassName+' span').text()
                                            + '</span>');
                    };
            } else if(typeof options.operator.select2Alternative === 'function' && !options.operator.isDisabled) {//NO I18N
                if(typeof customGetFunctions.operator === 'function') {
                    operatorFunction = customGetFunctions.operator;
                }
            } else {
                operatorFunction = function(i, v, row, wrapperClass, elClass) {
                    row.find('span.'+ wrapperClass).append('<span class="'+ elClass +'"></span>');
                };
            }
            var columndataFunction = '';
            if(options.columnData.select2Alternative === '') {
                columndataFunction = function(i, v, row, wrapperClass, elClass){
                    row.find('span.'+ wrapperClass).append('<span class="'+ elClass +'">'
                                            + row.find('select.'+ options.columnData.elementClassName).val()
                                            + '</span>');
                };
            } else if (typeof options.columnData.select2Alternative === 'function') {//NO I18N
                if(typeof customGetFunctions.columnData === 'function') {
                    columndataFunction = customGetFunctions.columnData;
                }
            } else {
                columndataFunction = function(i, v, row, wrapperClass, elClass) {
                    row.find('span.'+ wrapperClass).append('<span class="'+ elClass +'"></span>');
                };
            }
            var criteriaFunction = '';
            if(options.criteria.isSelectable && options.criteria.select2Alternative === '' && !options.criteria.isDisabled) {
                criteriaFunction = function(i, v, row, wrapperClass, elClass){
                    row.find('span.'+ wrapperClass).append('<span class="'+ elClass +'">'
                                            + row.find('select.'+ options.criteria.elementClassName).val()
                                            + '</span>');
                };
            } else if(typeof options.criteria.select2Alternative === 'function' && !options.criteria.isDisabled) {//NO I18N
                if(typeof customGetFunctions.criteria === 'function') {
                    criteriaFunction = customGetFunctions.criteria;
                }
            } else {
                criteriaFunction = function(i, v, row, wrapperClass, elClass) {
                    row.find('span.'+ wrapperClass).append('<span class="'+ elClass +'"></span>');
                };
            }
            $(this.element).find('li.' + options.listItemClass).each(function(i, v){
                $(this).append('<span class="row-output hide"></span>');
                operatorFunction(i, v, $(this), "row-output", "operator-output");
                columndataFunction(i, v, $(this), "row-output", "columndata-output");
                criteriaFunction(i, v, $(this), "row-output", "criteria-output");
                that.getSetCriteriaVal(i, v, $(this), 'get', customGetFunctions);//NO I18N
                operatorField = $(this).find('.row-output .operator-output').html();
                columnField = $(this).find('.row-output .columndata-output').html();
                criteriaField = $(this).find('.row-output .criteria-output').html();
                criteriaValField = '';
                var inputType = $(this).find('.'+ options.columnData.elementClassName +' option:selected').attr('data-type');//NO I18N
                if (options.criteria.isSelectable && !options.criteria.isDisabled) {
                        inputType = $(this).find('.'+ options.criteria.elementClassName +' option:selected').attr('data-type');//NO I18N
                }
                if(inputType==='multiselect'||inputType==='sdp_select2'||inputType==='sdp_mselect2'){
                    criteriaValField=[];
                    $(this).find('.row-output .criteriaval-output').each(function(){
                        if($(this).html()){
                            criteriaValField.push($(this).text());
                        }
                    });
                } else {
                    if($(this).find('.row-output .criteriaval-output').html() !== '' && $(this).find('.row-output .criteriaval-output').length > 0) {
                            criteriaValField = $(this).find('.row-output .criteriaval-output').text().trim();
                    }
                    criteriaValField=[criteriaValField];
                }
                if(i > 0 && !options.operator.isDisabled) {
                    outputData.push({'operator':operatorField, 'column':columnField, 'criteria':criteriaField, 'criteriaVal':criteriaValField});//NO I18N
                } else {
                    outputData.push({'operator':'', 'column':columnField, 'criteria':criteriaField, 'criteriaVal':criteriaValField});//NO I18N
                }
                $(this).find('span.row-output').remove();
            });
            return outputData;
        },
        // Public Method
        // Function to load the filters for edit/view mode
        // @arg1: filterList (Array object of row data).
        // @arg2: customUpdateFunctions (Object containing custom fucntions).
        update: function(filterList, customUpdateFunctions) {
            var options = this.settings;
            this.changeEditMode(true);
            var that = this;

            var operatorFunction = '';
            if(options.operator.isSelectable && options.operator.select2Alternative === '' && !options.operator.isDisabled) {
                if(options.operator.useSelect2) {
                    operatorFunction = function(i, v, row){
                        row.find('.'+ options.operator.elementClassName).select2("val", v.operator);//NO I18N
                    };
                } else if(options.operator.useSelectSwitch && options.operator.dataList.length==2){
                    operatorFunction = function(i, v, row) {
                        row.find('div.'+options.operator.elementClassName+' span').text(v.operator);//NO I18N
                        };
                } else {
                    operatorFunction = function(i, v, row){
                        row.find('.'+ options.operator.elementClassName).val(v.operator);
                    };
                }
            } else if(typeof options.operator.select2Alternative === 'function' && !options.operator.isDisabled) {//NO I18N
                if(typeof customUpdateFunctions.operator === 'function') {
                    operatorFunction = customUpdateFunctions.operator;
                }
            } else {
                operatorFunction = function(i, v, row) {};
            }
            var columndataFunction = '';
            if(options.columnData.useSelect2 && options.columnData.select2Alternative === '') {
                columndataFunction = function(i, v, row){
                    row.find('.'+ options.columnData.elementClassName).select2("val", v.column);//NO I18N
                };
            } else if(!options.columnData.useSelect2 && options.columnData.select2Alternative === '') {
                columndataFunction = function(i, v, row){
                    row.find('.'+ options.columnData.elementClassName).val(v.column);
                };
            } else if (typeof options.columnData.select2Alternative === 'function') {//NO I18N
                if(typeof customUpdateFunctions.columnData === 'function') {
                    columndataFunction = customUpdateFunctions.columnData;
                }
            } else {
                columndataFunction = function(i, v, row) {};
            }
            var criteriaFunction = '';
            if(options.criteria.isSelectable && options.criteria.select2Alternative === '' && !options.criteria.isDisabled) {
                if(options.criteria.useSelect2) {
                    criteriaFunction = function(i, v, row){
                        that.setCriteriaInput(row, true);
                        row.find('.'+ options.criteria.elementClassName).select2("val", v.criteria);//NO I18N
                    };
                } else {
                    criteriaFunction = function(i, v, row){
                        that.setCriteriaInput(row, true);
                        row.find('.'+ options.criteria.elementClassName).val(v.criteria);
                    };
                }
            } else if(typeof options.criteria.select2Alternative === 'function' && !options.criteria.isDisabled) {//NO I18N
                if(typeof customUpdateFunctions.criteria === 'function') {
                    that.setCriteriaInput(row, true);
                    criteriaFunction = customUpdateFunctions.criteria;
                }
            } else {
                criteriaFunction = function(i, v, row) {};
            }
            $.each(filterList, function(i, v) {
                var row = $(that.element).find('li.' + options.listItemClass).eq(i);
                if(i !== 0) {
                    //load operators
                    operatorFunction(i, v, row);
                }
                //load columndata
                columndataFunction(i, v, row);
                //load criteria
                criteriaFunction(i, v, row);
                //load criteriaValue
                that.setCriteriaValueInput(row, true);
                that.getSetCriteriaVal(i, v, row, 'set', customUpdateFunctions);//NO I18N

                if(filterList.length-1 > i) {
                    that.addRow(row.find('.addrowbtn'));
                } else {
                    return false;
                }
            });
        },
        // Public Method
        // Reset (Function to reset filters).
        reset: function() {
            var options = this.settings;
            var row = $(this.element).find('li.' + options.listItemClass).eq(0);
            $(this.element).html(row);
            this.setColumnInput(row);
            if(options.isSortable && $(this.element).hasClass('ui-sortable')) {
                $(this.element).find('.' + options.dragHandleClass).remove();
                $(this.element).sortable('destroy');//NO I18N
            }
        }
    });
    // Plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function(options) {
        var args = arguments;
        if (options === undefined || typeof options === 'object') {
            return this.each(function() {
                if (!$.data(this, 'plugin_' + pluginName)) {//NO I18N
                    $.data(this, 'plugin_' + pluginName, new Plugin(this, options));//NO I18N
                }
            });
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {//NO I18N
            var returns;
            this.each(function() {
                var instance = $.data(this, 'plugin_' + pluginName);//NO I18N
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
                if (options === 'destroy') {//NO I18N
                    $.data(this, 'plugin_' + pluginName, null);//NO I18N
                }
            });
            return returns !== undefined ? returns : this;
        }
    };
})(jQuery, window, document);
