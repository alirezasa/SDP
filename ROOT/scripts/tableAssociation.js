/* $Id$ */
/**
 * Table data association method for table component
 * Bulk association implementation
 */
function tableAssociation(tableInstance) {
    var eventNameSpace = '.tbl-association'; //event namespace for bulk associate events
    var isRadio = null; //row selection input type checkbox or radio, to find different way for count

    var bulkAssociation = {
        validationRules: {},
        validationMessages: {},
        fields: {},
        autoId:1,
        isInit: false,
        init:function(){
            this.fields = {};
            this.initEvent();
            this.isInDialog();
        },
        /**
         * 
         * @param {Object} field_meta 
         * @param {Object} rowData 
         * @returns transfer the cell into form field
         */
        cellTransfer: function(field_meta, rowData){
            // field_meta.div_class='control-holder fw';
            return this.getFieldHtml(field_meta, rowData);
        },
        // check if non form field available in association settings
        //To check if field is form field or not
        isFormFields:function(h_d){
            var bulkAssociateSet = tableInstance.t_obj.options.bulkAssociateSettings, formField = false;
            if(!jQuery.isEmptyObject(bulkAssociateSet) && bulkAssociateSet.nonFormFields && bulkAssociateSet.nonFormFields.length > 0){
                formField = !bulkAssociateSet.nonFormFields.contains(h_d.id);
            }
            return formField;
        },
        // check if non form field available in association settings
        checkCellTransformer:function(h_d,rowData,retObj){
            retObj.dw_class_remove = true;//To remove d_w class for bulk associate input field
            disp_str =  bulkAssociation.cellTransfer(h_d, rowData);
            return disp_str;
        },
        //fields sortable disabled for non form fields
        checkDisableSortField:function(c){
            var opt = tableInstance.t_obj.options,isSortdisabled = false;
            if(opt.bulkAssociateSettings && opt.bulkAssociateSettings.nonFormFields.length > 0){
                isSortdisabled = opt.bulkAssociateSettings && opt.bulkAssociateSettings.nonFormFields.indexOf(c.id) != -1 ? false : true;
            }
            return isSortdisabled;
        },
        //To add class for td according to field type checkbox or radio
        addClassForCell:function(h_d,td_class) {
            var opt = tableInstance.t_obj.options;
            var bulkAssociateSet = opt.bulkAssociateSettings, hasField = false;
            if(!jQuery.isEmptyObject(bulkAssociateSet) && bulkAssociateSet.nonFormFields && bulkAssociateSet.nonFormFields.length > 0){
                hasField = bulkAssociateSet.nonFormFields.contains(h_d.id)
            }
            // association radio box in list view case
            if (h_d.id.indexOf("_head_chk") !== -1 && h_d.type == "radio") {
                td_class += " headercheckbox tbl-bg-mode non-form-field ";
            }
            hasField && (td_class += " non-form-field ");
            td_class +=' p5 vtop '; // for fix - Field text box position input box top
            return td_class;
        },
        // To reset width for column types checkbox and radio
        checkToSkipWidth:function(h_d,stylewidth){
            skipWidthReset = !['checkbox','radio'].includes(h_d.type);
            if(skipWidthReset){
                stylewidth = '';
            }   
            return stylewidth;
        },
        //To wrap form tag for table tag, for form field validation purpose
        addFormTag:function(table){
            var form = jQuery('<form id="form_table_' + tableInstance.tableId + '"></form>');
            form.on('submit',()=>false);
            form.append(table);
            return form;
        },
        /**
         * 
         * @param {Object} field_meta 
         * @param {Object} rowData 
         * @returns Getting the meta field form html
         */
        getFieldHtml: function(field_meta, rowData){
            var fieldHtml = "";
            var placeHolder  = "";
            var fieldName = field_meta.id
            var fieldRowName = fieldName + "_"+rowData.id;
            var ftype = field_meta.type  === "long" || field_meta.type === "double" ? "number" : field_meta.type;
            ftype === "string" && field_meta.display_type && field_meta.display_type === "Multi Line" && (ftype = "multi_line");
            field_meta.display_type == 'Date' &&  (ftype = "date"); // take type from display_type not from type because type updated some from date to datetime in edit ass

            var defaultValueField = ftype == 'date' && field_meta.default_value ? field_meta.default_value.display_value : field_meta.default_value;
            var defaultValue = e_attr(defaultValueField) || '';
            var maxlengthAttr = field_meta.constraints ? ' maxlength="'+field_meta.constraints.max_length+'" ' : '';
            var getDefaultValueAttr = (givenValue)=> {
                var value = givenValue || defaultValue;
                return ' value="'+value+'" ' || '';
            }
            if(field_meta.display_type === "Attachment"){
                ftype = "file_upload";
            }
            var autoId = 'associate_'+(bulkAssociation.autoId++);
            var longText=(text)=>text.length>20 ? text.substr(0,20)+'...':text;
            switch(ftype){
                case "string":
                case "number":
                case "email":
                case "phone":
                    //TODO phone type validation
                    var inputType = ftype;
                    (ftype == 'string' && field_meta.display_type == "Url") && (inputType="url");
                    (ftype == 'string') && (inputType="text");

                    fieldHtml = '<input data-errorClass=" pos-stat"  data-aso-name="'+fieldName+'" '+getDefaultValueAttr()+' data-aso-type="'+ftype+'" type="'+inputType+'" name="'+fieldRowName+'" placeholder="'+placeHolder+'" class="form-control" '+maxlengthAttr+' />'
                    break;
                case "lookup":
                    var defLookupValue = field_meta.hasOwnProperty('default_value') && field_meta.default_value.name ? field_meta.default_value.name : '';
                    defLookupValue = longText(defLookupValue);
                    fieldHtml = '<input data-aso-name="'+fieldName+'" data-aso-type="'+ftype+'" value="'+e_html(defLookupValue)+'"   name="'+fieldRowName+'" class="form-control" placeholder="'+placeHolder+'" '+maxlengthAttr+' />';
                break;
                case "date":
                    var internalValue = field_meta.default_value ? field_meta.default_value.value : ''; // for save purpose, date value will be long value eg 1710181800000
                    fieldHtml = '<div class="rel table-aso-calendar-input"><input id="Inline_dt_' +autoId+ '_' +rowData.id+ '"  data-aso-type="'+field_meta.display_type+'" data-aso-name="'+fieldName+'" '+getDefaultValueAttr(internalValue)+' type="hidden" class="data-save"><div class="input-group date right-col"><input id="Inline_dt_' +autoId+ '_' + rowData.id + '_Display" '+getDefaultValueAttr()+' type="text" clear-update="yes" data-clear="yes" readonly="true" class="form-control display-data cur-ptr z-ind1"><span class="input-group-addon cur-ptr"><span class="cspr calendar vbase"></span></span></div></div>';
                    break;
                case "datetime":
                    fieldHtml = '<div class="rel table-aso-calendar-input"><input id="Inline_dttime_' +autoId+ '_' +rowData.id+ '"  data-aso-type="'+field_meta.display_type+'" data-aso-name="'+fieldName+'" value="" type="hidden" class="data-save" value=""><div class="input-group date right-col"><input id="Inline_dttime_' +autoId+ '_' + rowData.id + '_Display" value="" type="text" clear-update="yes" data-clear="yes" readonly="true" class="form-control display-data cur-ptr z-ind1"><span class="input-group-addon cur-ptr"><span class="cspr calendar vbase"></span></span></div></div>';
                    break;
                case "multi_line":  
                    fieldHtml = '<textarea data-aso-name="'+fieldName+'" data-aso-type="'+ftype+'" name="'+fieldRowName+'" class="form-control resize-disabled" rows="3" '+maxlengthAttr+'>'+defaultValue+'</textarea>'
                    break;
                case "checkbox":
                    fieldHtml = '<input type="checkbox" value=' + rowData.id + ' data-table-checkbox>';
                    break;
                case "boolean":
                    let checked = field_meta.hasOwnProperty("default_value") ? (field_meta.default_value === 'true') : false;
                    fieldHtml = '<div class="fw text-center"><input type="checkbox" data-aso-name="'+fieldName+'"  class="ml5" data-aso-type="'+ftype+'" '+(checked ? "checked": " ")+'></div>';
                    break;
                case "color":
                    fieldHtml = '<div class="clr-pick-row pos-rel text-center">' +
                                    '<button type="button" title="' + translate("sdp.admin.itil.change.type.pickcolor.tooltip") + '" rel="uitip" class="cur-ptr p10 pt5 pb5 disp-ib img-circle pos-rel table-bordered clr-picker" data-style="background: #fff">&nbsp;&nbsp;<span class="rspr flat icon-sm color-pick-brush pos-abs"></span></button>'+
                                    '<input name="' + fieldName + '" data-aso-name="'+fieldName+'" class="form-control pos-abs left0" data-aso-type="'+ftype+'" data-style="visibility:hidden;"/>' +
                                '</div>';
                    break;
                case "file_upload":
                    fieldHtml = '<div class="fw text-center">'+
                                    '<label for="for_' + rowData.id + '">'+
                                        '<a role="button" href="/" data-aso-name="'+fieldName+'" data-aso-type="'+ftype+'" data-aso-rowid="' + rowData.id + '" data-aso-href="'+field_meta.href+'" data-aso-field="'+field_meta.id+'"  data-target-id="#'+autoId+'_'+rowData.id+'_drop" id="'+rowData.id+'" custom-class="attachPopup" closeonesckey="false" closeonbodyclick="true">'+
                                        '<span aria-hidden="true" class="cspr paperclip icon-sm opac5 ptr-ev-none"></span>' +
                                        '<span class="ml5 mr5 sb hide" data-id="attachcount"></span>'+
                                        '<span class="caret ptr-ev-none"></span>'+
                                        '</a>'+
                                        '<div id="'+autoId+'_'+rowData.id+'_drop" class="hidden"> </div>'
                                    '</label>'+
                                    '<input type="file" id="for_' + rowData.id + '"  >'+
                                '</div>';
                    break;
                
            }
            return fieldHtml;
        },
        /**
         * 
         * Get the Row values.
         * input with data-name attribute will return the values.
         */
        getRowValues: function(){
            var _self = this;
            var rowValues = [];
            var form  = jQuery('#form_table_'+tableInstance.tableId);
            //To show the error field in smooth scroll view 
            var showErroField = (form)=> {
                var config = { behavior: "smooth", block: "end", inline: "nearest" };
                var input = form[0].querySelector('input.text-danger');
                input.closest('td').scrollIntoView(config);
                setTimeout(()=>input.focus(),500); // focus the input after smooth scroll
            }

            if(!form.valid()){
                showErroField(form);
                return false;
            }
            var tblContainer = tableInstance.tblContainer;
            function formData(index, el){
                //To get row field values
                var data = this;
                var field = jQuery(el).data("aso-name");
                var fieldType = jQuery(el).data("aso-type");
                var fieldValue = el.dataset.defaultValue ? el.dataset.defaultValue : el.value;
                if(field === "id"){
                    return;
                }
                if(fieldType === "lookup") {
                    fieldValue === "" ? (data[field] = null) : (data[field] = {id: fieldValue});
                } else if(fieldType === "boolean") {
                    data[field] = jQuery(el).is(":checked")
                } else if(fieldType === "file_upload") {
                    var curRowId = data.id+"_"+field;
                    data[field] = _self.fields[curRowId] ? _self.fields[curRowId] : null;
                } else {
                    // No value present send as null
                    data[field] = fieldValue ? fieldValue : null;
                }
            }
            function getValues(index, rw){
                var rowID = rw.id;
                var rowEl = jQuery("tr[data-entityid='"+rowID+"'] td [data-aso-name]",tblContainer);
                var checkBox = jQuery("tr[data-entityid='"+rowID+"'] td input[data-table-checkbox]",tblContainer);
                var isChecked = checkBox.length > 0 && jQuery(checkBox).is(":checked");
                var data = {id: rowID};
                if(isChecked){
                    jQuery.each(rowEl, formData.bind(data));
                    rowValues.push(data);
                }
            }

            jQuery.each(tableInstance.visibleContents, getValues);
            return rowValues;
        },
        initSelect2:function($select2Input) {
            //init select2 for Pick List field
            var tblObj = tableInstance;
            var meta = tblObj.t_obj.meta_info;
            var field = $select2Input.attr('data-aso-name');
            var m_value = meta[field];

            if($select2Input.length <= 0) {
                // no input element found so skip select2 init
                return;
            }
    
            var isInitialized = $select2Input[0].initSelect2;
            if(isInitialized) {
                //stop init select2 again
                return;
            }
            
            var placeHolder = translate("form.select.placeholder", [m_value.display_name]);
            $select2Input.attr('placeholder',placeHolder);
            var defaultValue = m_value.hasOwnProperty('default_value') ? m_value.default_value : false;
            defaultValue && ($select2Input[0].dataset.defaultValue = defaultValue.id);
            defaultValue && $select2Input.attr('title',defaultValue.name);
            
            function showTooltip(elem) {
                //To show tooltip for pick list
                var div = elem.closest('div');
                var id = div.attr('id');
                initTooltip('#'+id);
            }
            function setTitle(span,text){
                span
                .text(text)
                .attr('title',text)
                .attr('rel','uitip')
                .attr('mode_ellipsis','true');
            }
            //set title text to select2  selected text/placeholder
            function setTitleToPL(titleTxt){
                var select2Instance = $select2Input.data('select2');
                var span = select2Instance.selection.find('span.select2-chosen');
                setTitle(span,titleTxt || placeHolder);
                showTooltip(span);
            }

            var render =()=>{
                var lookupURL = m_value.href;
                var lookup_options = {
                    cache: {},
                    multiple: false,
                    placeholder:placeHolder, // No I18N
                    allowClear: true,
                    formatSelection:function(data,span){
                        setTitleToPL(data.text);
                        return span;
                    },
                    url: [{
                        url: "/api/v3" + lookupURL,//NO I18N
                        field: field,//NO I18N
                        list_info: { start_index: 1, row_count: 25 }
                    }]
                };
                if (tblObj.t_obj.options.acceptODCompatible) {
                    var headerAccept = "vnd.manageengine.v3+json";
                    lookup_options.url[0].headers = { Accept: headerAccept };
                }
                delete $select2Input[0].dataset.defaultValue;
                $select2Input.sdp_select2(lookup_options);
                $select2Input
                .on('select2-removed'+eventNameSpace,()=>setTitleToPL());
                var setDefaultValue = ()=> $select2Input.select2('data', {id: defaultValue.id, text: defaultValue.name});

                defaultValue ? setDefaultValue(): setTitleToPL();  
            }
            render();
            $select2Input[0].initSelect2 = true;
        },
        initAttachment:function(anchorElem) {
            //init attachment for the field
            var _self = this;
            var $anchorElem = jQuery(anchorElem)
            var href = $anchorElem.attr("data-aso-href");
            var field = $anchorElem.attr("data-aso-field");
            var rowId = $anchorElem.data("aso-rowid");
    
            var options = {
                api: false,
                layouts: false,
                enable_header: true,
                is_odapi: true,
                multiple: false,
                attachWrap: true,
                popover: {
                    enable: true,
                    target: $anchorElem.data("targetId")
                },
                mode: "edit",
                multiple: false,
                upload: true,
                upload_limit: 1,
                entityname: field,
                servlet_url: "/api/v3"+ href,
                type: "field",   //No I18N
                enable_delete: true,
                servlet_cb: function(response) {
                    var curRowAttach  = rowId+"_"+field;
                    response && response.responseJSON && ( response = response.responseJSON );
                    if(response && response.response_status && response.response_status.status === "success") {
                        if(response[field]) {
                            _self.fields[curRowAttach] = {id: response[field].id}
                        }
                    } else if(response.response_status.messages) {
                        window.showalert("failure", e_html(response.response_status.messages[0].message), "isAutoHide=false");  //No I18N
                    } else {
                        window.showalert("failure", translate("form.attachment.add.failed"), "isAutoHide=false");   //No I18N
                    }
                },
                ondelete: function() {
                    var curRowAttach  = rowId+"_"+field;
                    delete _self.fields[curRowAttach];
                }
            };
            anchorElem.initAttachment =  new attachPreview($anchorElem, options);
            anchorElem.click();
        },
        initPicker: function(pickerButton) {
            //init color picker
            var picker = jQuery("#cp_picker");
            if(!picker.length){
                picker = jQuery('<div id="cp_picker" data-field-></div>');
                picker[0].pickerButton = pickerButton;
                jQuery("body").append(picker);
            }
    
            if(pickerButton.initPicker) {
                //destroy previous picker instance
                delete pickerButton.initPicker;
                picker.zcolorpicker('destroy');
            }
    
            var options = {
                "valueColorModel": "hex",
                "otherUsedColors":false,
                "forElement": pickerButton
            };
            var input = jQuery(pickerButton).closest(".clr-pick-row").find("input");
            var color = input.val().length ? input.val() : 'transparent';
           
            function change(origEvent) { // No I18N
                var bg_color = origEvent.detail.color;
                origEvent.detail.color = (bg_color === "transparent") ? '' : bg_color;  // No I18N
                input.val(origEvent.detail.color).trigger("change");	// No I18N
                jQuery(pickerButton).css("background", bg_color);	// No I18N
            }
    
            //on close destroy component
            var close = ()=> picker.remove(); picker.zcolorpicker('destroy');
    
            picker.zcolorpicker(options);
            color && picker.zcolorpicker('setAttribute', 'value', color); //NO I18N

            picker.one('zcolorpickerchange'+eventNameSpace,change)
                  .one('zcolorpickerclose'+eventNameSpace,close)
                  .zcolorpicker('open'); //NO I18N

            pickerButton.initPicker = picker;
            return picker;
        },
        unbindEvents:function(row_id, curRowEle){
            var tblObj = tableInstance;
            var meta = Object.assign({}, tblObj.t_obj.meta_info);
            var fieldSelector = [];

            function findErrorField(field) {
                //clear the error of field when uncheck the row 
                var fieldName =  field+'_'+row_id;
                fieldSelector.push("[name='" +fieldName + "'].text-danger");
            }
    
            Object.keys(meta).forEach(findErrorField);
            //group all field selector [name="per_percentage_124"],[name="per_percentage_124"]
            var selector = fieldSelector.join(',');
            var fieldInputs = jQuery(selector,curRowEle);
            //clear error value in input
            fieldInputs.val('').trigger('change');
        },
        // Event binding of meta fields
        bindEvents: function(row_id, curRowEle){
            if(curRowEle.initRule){
                return;
            }
            var _self = this;
            var tblObj = tableInstance;
            var meta = tblObj.t_obj.meta_info;
    
            function initComponent(field) {
                //init form rule for row fields
                var m_value = meta[field];
                var type = m_value.type;

                if(m_value.display_type === "Attachment"){
                    type = "file_upload";
                }

                var fieldName = field+'_'+row_id;
                var input = jQuery("[name='" + fieldName + "']",curRowEle);

                //init select2 for lookup fields
                type == 'lookup' && _self.initSelect2(input);
                
                var addRule =()=>{
                    var validatioRule = cl_form.addValidator(fieldName, meta[field]);
                    if(_self.init && !jQuery.isEmptyObject(validatioRule.validationRules)) {
                        var rules = jQuery.extend({}, validatioRule.validationRules[fieldName]);
                        rules.messages = validatioRule.validationMessages[fieldName];
                        input.rules("add", rules);	//No I18N
                    }
                };
                input.length && input.one('focus',addRule);                
            }
            var form = document.getElementById('form_table_'+tableInstance.tableId);
    
            if(!form.isInitRule){
                cl_form.addRules();
                !_self.validatorForm && (_self.validatorForm = {} );
                var onerror = (errorSpan)=> {
                    // clear the no-wrap to normal for to show  error message without cut in UI
                    errorSpan.css('whiteSpace','normal'); 
                    return errorSpan;
                }

                initFormValidator('form_table_'+tableInstance.tableId, this.validationRules,this.validationMessages,onerror);
                form.isInitRule = true;
            }
            Object.keys(meta).forEach(initComponent);
            curRowEle.initRule = true;
        },
        //To check any one/more rows is selected for associate
        hasSelectedRow:function(){
           var getForCheckbox =()=> !!Object.keys(tableInstance.bulkSelect.selectedRecords).length;
           //for Many to Many case association - mean checkbox type selection rows
           var getForRadio = ()=>!!tableInstance.tblContainer[0].querySelector('td.headercheckbox input[type=radio]:checked');
           //For one to one association - means radio type selection rows

           var hasSelected = isRadio ? getForRadio() : getForCheckbox();
           return hasSelected;
        },
        showConfirm:function(callback) {
            //show confirm box for bulk associate row form value clear
            var message = translate('form.leave.alert');
            var _self = this;
            var hasSelectedRow = _self.hasSelectedRow();
            if(hasSelectedRow) {
                let options = 'title='+translate("common.confirm")+', message=' + message + ', submitbutton=OK, cancelbutton=Cancel, closebutton=yes, closeOnEscKey=yes';
                let okAction = function (confirm){
                    if(confirm) {
                        var bulkClearBtn = jQ("#bulk_unselect_" + tableInstance.tableId);
                        //clear bulk selection
                        bulkClearBtn.trigger('click');
                        //do pending action via callback
                        callback && callback();
                    }
                }
                showconfirm(true, options,okAction);
                return true;
            }
            return false;
        },
        //To disable row non form field td cell
        disableRows:function(){
           jQuery(".tc-row td:not(.headercheckbox):not(.non-form-field)",tableInstance.tblContainer).addClass("disableDiv");
        },
        //To reset form rule
        resetFormRule:function(){
            var form = document.getElementById('form_table_'+tableInstance.tableId);
            delete form.isInitRule; // reset for form validation for new rendered rows
        },
        //To do after row render process like resetform and disable row fields
        doAfterRowRender:function(){
            var _self = bulkAssociation;
            _self.resetFormRule();
            _self.disableRows();
        },
        beforeClearActionAlert:function(doAction,actionName){
            //doAction - to proceed the process where it stop for confirm
            //To clear bulk selected content show confirm alert
            //actionName = for actions in table column sort,column change, search and page navigation
            var stop = this.showConfirm(doAction);
            return stop;
        },
        //To disable and enable row
        disableRow:function(isDisable,$tableRow) {
            var $rowtd = $tableRow.find("td:not(.headercheckbox):not(.non-form-field)");
            isDisable ? $rowtd.removeClass("disableDiv") :  $rowtd.addClass("disableDiv");
        },
        //To do enable/disable the row fields and add/disable form validation
        doEnableDisableRow:function(input) {
            var isChecked = input.checked;
            var row_id = input.value;
            var $tableRow = jQuery(input).closest("tr");
            var disableRow = bulkAssociation.disableRow;
            isRadio == null && (isRadio = (input.type == 'radio'));
            
            disableRow(isChecked,$tableRow);
            isChecked ? bulkAssociation.bindEvents(row_id,$tableRow) :  bulkAssociation.unbindEvents(row_id,$tableRow);
        },
        // row selection change, enable/disable the row fields
        rowSelectChange:function() {
            var input = this;
            bulkAssociation.doEnableDisableRow(input);
        },
        //attachment component init on click anchor
        attachAction:function (){
            var anchorElem = this;
            !anchorElem.initAttachment && bulkAssociation.initAttachment(anchorElem);
            bulkAssociation.addInitializedClass(anchorElem);
        },
         //color picker component init for each row on demand
        pickerAction:function (){
            var btn = this;
            bulkAssociation.initPicker(btn);
        },
        //calendar component init for each row on demand
        calendarAction:function (){
            jQuery(this).closest('.tc-row').addClass("modify-row");
            jQuery("#_CALDIALOG_LAYER").css("visibility", "visible"); // No I18N
            var parId = jQuery('input.data-save',this).attr('id');
            var dateType =jQuery('input.data-save',this).attr('data-aso-type');
            tableInstance.initInlineCalendar(this, parId, dateType);
            bulkAssociation.addInitializedClass(this);
        },
        //add init class to avoid click again to init
        addInitializedClass:function(element){
            jQuery(element).addClass('added');
        },
        //to destroy calendar 
        removeAllCalendar:function(){
            jQuery('div.sdpcalendar').parent().remove();
        },
        //to destroy component related thing here 
        destroy:function() {
            var _self = this;
            _self.removeAllCalendar();
            //off event
            jQuery(tableInstance.tblContainer).off(eventNameSpace);
        },
        //add dialog close event to destroy component
        isInDialog:function(){
            var _self = this;
            var zDialog = jQuery(tableInstance.tblContainer).closest('div.sdpzcompdialog');
            if(zDialog && zDialog.length){
                zDialog.one("zdialogclose", ()=>_self.destroy());
            }
        },
        //init inline calendar for rows
        initEvent: function() {
            var _self = this; //this refers bulkAssociation Object
            
            //off event
            jQuery(tableInstance.tblContainer).off(eventNameSpace);

            //adding init component for fields calendar,color picker,attachment and row checkbox change
            jQuery(tableInstance.tblContainer)
            // reset form rule for each page render, for validation to updated
            .on("afterRowRender"+eventNameSpace, _self.doAfterRowRender) 
            .on("click"+eventNameSpace, ".table-aso-calendar-input", _self.calendarAction)
            .on("click"+eventNameSpace, "td:not(.disableDiv) button.clr-picker", _self.pickerAction)
            .on("mouseup"+eventNameSpace, "td:not(.disableDiv) a[data-aso-type=\"file_upload\"]:not(.added)",_self.attachAction)
            .on('change'+eventNameSpace,'tbody input[type="checkbox"][data-table-checkbox]',_self.rowSelectChange)
            .on('change'+eventNameSpace,'tbody input[type="radio"][data-table-checkbox]',_self.rowSelectChange);
        }
    };

    tableInstance.bulkAssociation =  bulkAssociation;
    bulkAssociation.init();
}

