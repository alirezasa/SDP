/* $Id$ */
/**
  ** Form Fields object, generally looks like
  EX :  {
    "layoutObj" : [
        {
            "sections" : [
                {
                   fields : []
                },
                {
                   fields : []
                }
            ]
        },
        {
            "sections" : [
                {
                   fields : []
                },
                {
                   fields : []
                }
            ]
        }
    ]
  }
  *** component creates a form in two column layout (Add / Edit/ View page )
  *** Form validation ia happening through jquery.validation and select2 lazy loading will be handled here
  *** Supported field types "text", "password", "lookup, multi_select, Pick List", "date" , "checkbox"
  *** We can enable / disable Form fields through configration by setting == > editable=false
  *** For Viewpage , we can enable/disable "SpotEdit" by setting == > inlineEditDisabled=true
**/
function FormComponent(options, formdata) {
  this.options = options;
  this.formdata = formdata;
  this.validateRules = {};
  this.validateMsg = {};
  this.select2Objects = {};
  this.init();
}

FormComponent.prototype = {
  /* Component initialization starts here */
  init: function () {
    this.constructFieldOptions();
  },
  /** Here constructing the fields basedon type **/
  constructFieldOptions: function () {
    var _self = this;
    var formdata = this.formdata;
    var isEditForm = this.formdata.id ? true : false;
    var ele = _self.options.holderele, fieldsArray = _self.options.layoutObj;
    var tabIndex = this.options.startTabIndex || 0;
    jQuery(ele).html('');
    /* Sections iteration starts */
    for (var i = 0; i < fieldsArray.length; i++) {

      var secObj = fieldsArray[i].sections;
      if (secObj.default_hide) { //If field is having default_hide as 'true', we skipped the field construction
        continue;
      }
      var secHeader = secObj.header || "<hr>";
      if (secHeader !== "<hr>") { //Appending section header
        secHeader = '<div class="pos-rel mb20"><hr class="pos-abs fw top10 m0 mt2 p0"><div class="pl20 pos-rel">' + secHeader + '</div></div>';
      }
      /* form-group div construction Starts*/
      var form_group = jQuery('<div class="form-group" id="' + secObj.name + '" data-formgroup="' + i + '"></div>');
      jQuery(ele).append(form_group);
      if (_self.options.searchForm != true) {
        if (_self.options.isDetailForm) { //for Viewpage , wrapping form-group into form-section
          jQuery(form_group).wrap("<div class='form-section mt20'></div>");
        } else {
          jQuery(secHeader).insertBefore(form_group);
        }
      }
      /* form-group div construction Ends*/

      if (secObj.section_html) {
        //if section is having customized HTML
        jQuery(ele).find('[data-formgroup="' + i + '"]').append(secObj.section_html);
      } else {
        var sections = secObj.fields;
        for (var j = 0; j < sections.length; j++) {
          if (sections[j].default_hide) {
            continue;
          }
          var colGrpClass = (_self.options.searchForm != true) ? "col-group" : "mb10";  //No I18N
          var col_group = jQuery('<div class="' + colGrpClass + '" data-colgroup="' + j + '"></div>');
          jQuery(ele).find('[data-formgroup="' + i + '"]').append(col_group);

          col_group = jQuery('<div class="' + colGrpClass + '" data-colgroup="' + j + '_' + (j + 1) + '"></div>');
          jQuery(ele).find('[data-formgroup="' + i + '"]').append(col_group);

          var fields = sections[j].fields;
          for (var k = 0; k < fields.length; k++) {
            var fld_obj = fields[k];
            var hideClass = "", isMandatory = false, mandateStr = "";
            var type = fld_obj.type = fld_obj.display_type ? fld_obj.display_type : fld_obj.type;
            if (fld_obj.default_hide || (_self.options.discard_readonly_fields && fld_obj.editable == false)) {
              continue;
            } else {
              tabIndex++;
              formdata.tabIndex = tabIndex;
            }
            if (fld_obj.mandatory && fld_obj.no_display_name != true && !_self.options.inlineEditDisabled) {
              isMandatory = true;
              mandateStr = '<span class="mandatory">*</span>';
            }
            var colFldClass = (_self.options.searchForm != true) ? "col-fields" : "mb10"; //No I18N
            var col_field = jQuery('<div class="' + colFldClass + '" data-colfields="' + k + '"></div>');
            var fld_holder = "";
            if (_self.options.searchForm != true) {
              if (k % 2 == 0) {
                fld_holder = jQuery(ele).find('[data-formgroup="' + i + '"]').find('[data-colgroup="' + j + '"]');
              } else {
                fld_holder = jQuery(ele).find('[data-formgroup="' + i + '"]').find('[data-colgroup="' + j + '_' + (j + 1) + '"]');
              }
            } else {
              fld_holder = jQuery(ele).find('[data-formgroup="' + i + '"]').find('[data-colgroup="' + j + '"]');
            }

            fld_holder.append(col_field);
            var labelName = fld_obj.display_name + ((type == "currency" && parent.sdp_app.CURRENCY_SYMBOL) ? " (" + parent.sdp_app.CURRENCY_SYMBOL + ")" : ""); //No I18N
            var inline_translate = "data-i18n-key=" + fld_obj.display_key;  //No I18N
            if (fld_obj.fieldname != undefined && fld_obj.fieldname.indexOf("udf_") != -1) {
              inline_translate = "";
            }
            var left_col = jQuery('<label class="left-col control-label disp-b pb5"  for=' + e_attr(fld_obj.name) + '>' + mandateStr + '<span class="label-text" ' + inline_translate + '></span></label>');

            var spotEditclass = "", spotHolderEle = "";
            if (_self.options.isDetailForm) {
              spotEditclass = "spot-field"; // No I18N
              spotHolderEle = ".control-holder"; // No I18N
            }
            var right_col = jQuery('<div class="right-col ' + spotEditclass + '"></div>');
            var colfld_holder = fld_holder.find('[data-colfields="' + k + '"]');
            colfld_holder.append(left_col);
            colfld_holder.append(right_col);
            colfld_holder.find("label .label-text").text((fld_obj.no_display_name && !_self.options.isDetailForm) ? '' : labelName);
            var editClass = "form-control-static spot-static spot-customedit pr25", controlreadOnly = "", controlAutoComplete = ""; // No I18N
            if ((_self.options.isDetailForm && _self.options.inlineEditDisabled == true) || fld_obj.editable === false || fld_obj.readonly === true) {
              editClass = "form-control-static"; // No I18N
              controlreadOnly = " disabled "; // No I18N
            }
            if (_self.options.disableAutoComplete) {
              controlAutoComplete = "autocomplete='off'"; // No I18N
            }
            var fieldName = fld_obj.name;
            if (_self.options.isDetailForm) {
              var dataAttr = "", blockClass = "", overflowClass = "";
              if (fld_obj.type == "Multi Line") {
                blockClass = "disp-b maxh-60px mb10";  //No I18N
                dataAttr = "mode_multiline='true' rel='uitip'"; //No I18N

                overflowClass = ' text-overflow ';  //No I18N
              }
              if (fld_obj.display_dir) {
                dataAttr += " dir=" + fld_obj.display_dir;  //No I18N
              }
              var statStr = '<p id="' + fieldName + '_static" class="' + editClass + overflowClass + ' w-90per"><span class="spot-static-content ' + blockClass + overflowClass + '" ' + dataAttr + '></span></p>';
              if (_self.options.inlineEditDisabled != true) {
                var selFields = ["Pick List", "lookup"];	//NO I18N
                var saveBtnStr = "";
                if (selFields.indexOf(type) < 0) {
                  saveBtnStr = '<button class="btn btn-sm btn-link inlinesave" title="' + translate("common.save") + '" rel="uitip"><span class="spot-icon success"></span></button>';
                }
                statStr += '<div class="spot-form"><div class="control-holder"></div><div class="spot-actions">' + saveBtnStr + '<button class="btn btn-sm btn-link inlinecancel" title="' + translate("common.cancel") + '" rel="uitip"><span class="spot-icon failure icon-xs"></span></button></div></div>';
              }
              statStr = jQuery(statStr);
              if (fld_obj.type == "Multi Line") {
                statStr.find('.spot-static-content').css("white-space", "pre"); //No I18N
              }
              statStr.filter(".spot-form").css("display", "none"); //No I18N
              colfld_holder.find('.right-col').html(statStr);
            }

            var ctl_holder = jQuery('<div id="' + fieldName + '_control"></div>');
            colfld_holder.find('.right-col ' + spotHolderEle).append(ctl_holder);

            //To extend UDF_FIELDS with META_INFO (For system attributes)
            if ((fld_obj.name).indexOf('_fields.udf_pick') != -1) {
              var fieldInMeta = _self.options.metainfo[fld_obj.fieldname];
              if (fieldInMeta) {
                fieldInMeta = jQuery.extend({}, {}, fieldInMeta)
                fld_obj = jQuery.extend(fieldInMeta, fld_obj);
              }
            }
            var displayDetailStr = "", fieldContainsDefaultValue = false;
            if (typeof fld_obj.dataFieldtransformer === "function" && !_self.options.isDetailForm) {
              //If customized field HTML comes
              var innerHTML = callbackFormFunc(fld_obj.dataFieldtransformer, formdata);
              ctl_holder.html(innerHTML);
              this.options.startTabIndex = this.options.startTabIndex + fld_obj.tabindex_count;
            }
            else {
              /** Getting selected value(s) for field Starts **/
              var selected_data = "";
              if (isEditForm || _self.options.isDetailForm) {
                var value_path = fld_obj.value_path ? fld_obj.value_path : fld_obj.name;
                displayDetailStr = selected_data = value_path ? (getFunctionDefnOrVariable(formdata, value_path) || "") : (fld_obj ? fld_obj : "");
                if (selected_data.constructor === Array) {
                  if (selected_data.length > 0) {
                    var selArr = [];
                    var arrStr = "";
                    var dataLength = (fld_obj.showmaxlength && fld_obj.showmaxlength < selected_data.length) ? fld_obj.showmaxlength : selected_data.length;
                    var disData = [];
                    for (var b = 0; b < dataLength; b++) {
                      if (selected_data[b].name) {
                        selected_data[b].text = selected_data[b].name;
                        arrStr += selected_data[b].name + ", ";
                      } else {
                        arrStr += selected_data[b] + ", ";
                      }
                      disData.push(selected_data[b]);
                    }
                    selected_data = disData;
                    if (arrStr != "") {
                      arrStr = arrStr.substring(0, arrStr.length - 2);
                    }
                    displayDetailStr = arrStr;
                  } else {
                    selected_data = ""; //NO I18N
                  }
                } else if (typeof selected_data === "object" && !jQuery.isEmptyObject(selected_data)) { // No I18N
                  displayDetailStr = selected_data.text = selected_data.text || selected_data.name || selected_data.display_value || selected_data.value;
                }
              }

              if (!displayDetailStr && fld_obj.default_value != undefined && fld_obj.editable != false && _self.options.discard_default_value != true) {
                fieldContainsDefaultValue = true;
                displayDetailStr = selected_data = fld_obj.default_value;
                if (typeof selected_data === "object") {
                  displayDetailStr = selected_data.text = selected_data.text || selected_data.name || selected_data.value;
                }
              }
              /** Getting selected value(s) for field Ends **/
              /** Field construction Starts **/
              // It happens only when ADD/ EDIT and (View page with Inline edit Enabled)

              if (!_self.options.isDetailForm || (_self.options.isDetailForm && _self.options.inlineEditDisabled != true)) {
                var nameStr = "";
                if (!fld_obj.is_supporting_field) {
                  nameStr = ' name=' + fieldName; // No I18N
                }
                var max_length = "";
                if (fld_obj.type == "Multi Line" || (fld_obj.constraints && fld_obj.constraints.max_length)) {
                  if (fld_obj.constraints && fld_obj.constraints.max_length) {
                    max_length = fld_obj.constraints.max_length
                  } else if (fld_obj.type == "Multi Line") {
                    max_length = "250";
                    if (fieldName.indexOf("_fields.") > -1) {
                      max_length = "4000";
                    }
                  }
                }
                var ruleObj = _self.constructRuleObj(fld_obj);
                if (!jQuery.isEmptyObject(ruleObj.rules)) {
                  _self.validateRules[fieldName] = ruleObj.rules
                }
                if (!jQuery.isEmptyObject(ruleObj.messages)) {
                  _self.validateMsg[fieldName] = ruleObj.messages;
                }

                var property = {};
                property.type = type;
                property.fieldName = fieldName;
                property.fieldObj = fld_obj;
                property.selected_data = selected_data;
                property.controlreadOnly = controlreadOnly;
                property.controlAutoComplete = controlAutoComplete;
                property.ctl_holder = ctl_holder;
                property.colfld_holder = colfld_holder;
                property.nameStr = nameStr;
                property.displayDetailStr = displayDetailStr;
                property.showmaxlength = fld_obj.showmaxlength
                property.tabIndex = tabIndex;
                if (max_length) {
                  property.max_length = fld_obj.max_length = max_length;
                }
                ctl_holder = _self.fieldsConstruction(property);
              }
            }
            /** Field construction Ends **/
            if (_self.options.isDetailForm) { //Only for ViewPage
              if (fieldContainsDefaultValue) {
                displayDetailStr = "";
              }
              if (fld_obj.dataDetailStaticTransformer) {
                displayDetailStr = callbackFormFunc(fld_obj.dataDetailStaticTransformer, [formdata, fld_obj]);
              } else if (type == "checkbox") {  //No I18N
                if (displayDetailStr == true) {
                  displayDetailStr = translate("sdp.admin.settings.yes"); //NO I18N
                } else {
                  displayDetailStr = translate("sdp.admin.settings.no"); //NO I18N
                }
              }
              var staticEle = colfld_holder.find('.right-col .spot-static-content');
              var titleStr = "-"; //NO I18N
              fld_obj.isTooltipEnabled = false;
              if (displayDetailStr) {
                if (fld_obj.type == "Multi Line") { //NO I18N
                  if (displayDetailStr.length > 100 || (displayDetailStr.match(/\n/g) || []).length > 3) {
                    if (jQuery("body").attr("data-nouserpop") !== undefined) { //NO I18N
                      staticEle.parent().append('<button type="button" class="btn btn-link txt-dec-none-i p0">' + translate('sdp.common.show') + ' ' + translate('sdp.common.more') + '<span class="text-content hide"></span></button>').find('.text-content').text(displayDetailStr); //NO I18N
                    }
                    else {
                      staticEle.parent().append('<button type="button" class="btn btn-link txt-dec-none-i p0">' + translate('sdp.common.show') + ' ' + translate('sdp.common.more') + '<span class="text-content hide"></span></button>').find('.text-content').text(displayDetailStr); //NO I18N
                      const display_name = fld_obj.display_name;
                      staticEle.parent().find('.btn-link').off('click.mline').on('click.mline', function (e) {  //NO I18N
                        FormComponent.prototype.viewContentInDialog(e, this, e_attr(display_name));
                      });
                    }
                  } else {
                    fld_obj.isTooltipEnabled = true;
                    titleStr = displayDetailStr;
                  }
                } else {
                  if (!fld_obj.skipEncode) {
                    titleStr = displayDetailStr;
                    displayDetailStr = e_html(displayDetailStr);
                  }
                }
              } else {
                displayDetailStr = "-";
              }
              if (fld_obj.type == "Multi Line") { //NO I18N
                staticEle.text(displayDetailStr);
              } else {
                staticEle.html(displayDetailStr);
              }
              if (fld_obj.isTooltipEnabled != false) {
                staticEle.attr("title", titleStr);
              }
            }

          }
        }
      }
    }
    /* Sections iteration Ends */

    /*** Events Binding Starts ***/
    /**
      For View Page, 
          * SAVE
          * CANCEL
          * SPOT-EDIT

      
    **/
    setTimeout(function () {
      if (_self.options.isDetailForm && _self.options.inlineEditDisabled != true) {
        var parEle = jQuery(ele);
        parEle.off("click", '.spot-static');	//NO I18N
        parEle.off('change', '[id*="select_"][data-type!="multi_select"]');	//NO I18N
        parEle.off('keydown', 'input[type="text"]');	//NO I18N
        parEle.find('.inlinesave').off('click');		//NO I18N
        parEle.find('.inlinecancel').off('click');	//NO I18N

        parEle.on("click", '.spot-static', function () {
          closeCalDialog();
          if (jQuery('.spot-form').find('span.text-danger:visible').length <= 0) {
            var visiEle = jQuery('.spot-form:visible');
            if (visiEle.length == 1) {
              var ele = visiEle.find(".form-control");
              var eleId = ele.attr("id");
              var dtype = jQuery(ele).attr('data-type');
              if (eleId && eleId.indexOf("s2id") == -1 && dtype && dtype.toLowerCase().indexOf("date") == -1) {
                var val = _self.formdata[eleId];
                jQ(ele).val(val);
              }
            }
            jQuery('.spot-form').find("span.text-danger:hidden").remove();
            jQuery(".spot-form").hide();
            jQuery(".spot-static").show();
            jQuery(this).hide().next().show();
            var editId = jQuery(this).attr('data-id');
            if (editId) {
              jQuery("[id='" + editId + "']").select2('open'); //NO I18N
            } else {
              jQuery(this).next().find('.form-control:first').trigger('focus');
            }
          }
        });

        parEle.on('change', '[id*="select_"][data-type!="multi_select"]', function () {
          _self.inlineSaveChanges(this);
        });

        parEle.on('keydown', 'input[type="text"]', function (e) {
          if (e.which === 13 && !(jQuery(e.target).is('textarea'))) { //No I18N
            _self.inlineSaveChanges(this);
            return false;
          }
        });

        parEle.find('.inlinesave').on('click', function () {
          _self.inlineSaveChanges(this);
          return false;
        });

        parEle.find('.inlinecancel').on('click', function () {
          closeCalDialog();
          _self.constructFieldOptions();
          return false;
        });
      }
      /*** Events Binding Ends ***/
      //To remove all the empty col-group elements
      (_self.options.holderele).find('.col-group:empty').remove();
      var emptyGroup = _self.options.holderele.find(".form-group:empty");
      emptyGroup.next("hr").remove(); //No I18N
      emptyGroup.remove();

      //AfterFormRender "callbackAfterRender" will be called , if callback is there
      if (typeof _self.options.callbackAfterRender === "function") {
        callbackFormFunc(_self.options.callbackAfterRender, formdata);
      }
      initTooltip("#" + _self.options.holderele.attr("id"));
      charCounter.init();
    }, 0);
  },
  fieldsConstruction: function (property) {
    var _self = this;
    var type = property.type;
    var fieldObj = property.fieldObj;
    var fieldName = property.fieldName;
    var selected_data = property.selected_data;
    var nameStr = property.nameStr;
    var controlreadOnly = property.controlreadOnly;
    var controlAutoComplete = property.controlAutoComplete;
    var ctl_holder = property.ctl_holder;
    var colfld_holder = property.colfld_holder;
    var displayDetailStr = property.displayDetailStr;
    var tabIndex = property.tabIndex;
    if (fieldName.indexOf("_udf_fields.") > -1 && selected_data == "" && fieldObj.editable != false && _self.options.discard_default_value != true) { // No I18N
      selected_data = fieldObj.default_value || ""; // No I18N

    }
    switch (type) {
      case 'multi_select': //NO I18N
      case "Pick List": //NO I18N
      case "lookup": //NO I18N
        var multiple = false,
          allowClear = true;
        if (fieldObj.mandatory) {
          allowClear = false;
        }
        if (~fieldName.indexOf('pickref') && selected_data === "-") {
          selected_data = ""; // No I18N
        } else if (type === "multi_select") { // No I18N
          multiple = true;
        } else if (type === "Pick List" && typeof selected_data !== "object" && selected_data != "") { // No I18N
          selected_data = { "id": selected_data, "text": selected_data }; // No I18N
        }

        /* get field allowed value options string */
        ctl_holder.html('<input tabindex="' + tabIndex + '" id="select_' + fieldName + '"' + nameStr + ' data-type="' + type + '" class="form-control" multiple="' + multiple + '" ' + controlreadOnly + ' autocomplete="off"/> ');
        var currentSelect = ctl_holder.find("[id='select_" + fieldName + "']");

        if (!fieldObj.href) {
          currentSelect.select2({
            "data": fieldObj.allowed_values || [], // No I18N
            allowClear: allowClear,
            placeholder: translate("form.select.placeholder", [fieldObj.display_name]) // No I18N
          }).select2('data', selected_data); // No I18N
        } else {
          var field = fieldObj.fieldname || fieldObj.name;
          var input_options = {
            select2Id: 'select_' + fieldName, // No I18N
            callbackURL: fieldObj.href,
            data: selected_data,
            multiple: multiple,
            allowClear: allowClear,
            closeOnSelect: false,
            minimumInputLength: fieldObj.minimumInputLength,
            placeholder: translate("form.select.placeholder", [fieldObj.display_name]), //NO I18N
            formatResult: fieldObj.formatResult,
            formatSelection: fieldObj.formatSelection,
            entity_name: field,
            lazyLoadingEnabled: (fieldObj.lazyLoadingEnabled ? fieldObj.lazyLoadingEnabled : true),
            changeCallBack: fieldObj.changeCallBack,
            criteriaCallback: fieldObj.criteriaCallback,
            enable: fieldObj.editable,
            readonly: fieldObj.readonly,
            isTooltipEnabled: fieldObj.isTooltipEnabled,
            showmaxlength: fieldObj.showmaxlength,
            listinfoCallback: fieldObj.listinfoCallback,
            taggingNeeded: fieldObj.taggingNeeded,
            taggingField: fieldObj.taggingField
          };
          _self.select2Objects[field] = new Select2APIComponent(input_options);
        }
        colfld_holder.find('.right-col').find('.form-control-static').attr('data-id', 'select_' + fieldName).find('.spot-actions .sdp-glyph-ok').addClass('hide');
        break;
      case 'Date/Time': //NO I18N
      case 'datetime': //NO I18N
      case 'date-time': //NO I18N
      case 'date': //NO I18N
        if (selected_data) {
          var longTime = selected_data.value;
          var displayTime = selected_data.display_value;
        }
        fieldName = fieldName.replace(/\./g, '_'); //NO I18N
        var fieldHiddenID = fieldName + '_IN'; //NO I18N
        var fieldID = fieldName + '_IN_Display'; //NO I18N
        var readonlyDtText = '';
        if (fieldObj.editable != false) {
          readonlyDtText = ' readonly '; //NO I18N

        }
        ctl_holder.html('<input type="hidden" id="' + fieldHiddenID + '"' + nameStr + ' data-type="' + type + '" value="' + (longTime ? longTime : '') + '" class="form-control" ' + controlreadOnly + '><div class="input-group date"> <input tabindex="' + tabIndex + '" data-clear="yes" type="text" ' + readonlyDtText + controlreadOnly + ' class="form-control"  data-type="' + type + '" id=' + fieldID + ' value="' + (displayTime ? displayTime : '') + '">       <span class="input-group-addon">      <span class="cspr calendar"></span>      </span></div>');  //NO I18N
        if (fieldObj.editable != false) {
          ctl_holder.find('.input-group-addon').off('click.date').on('click.date', function () {  //NO I18N
            FormComponent.prototype.initCalendar(fieldName, fieldObj.display_type);
          });
        }
        break;
      case 'Multi Line': //NO I18N
        var rowspan = fieldObj.rowspan || "5";
        ctl_holder.html('<textarea charcount="true" maxlength="' + fieldObj.max_length + '" tabindex="' + tabIndex + '" id="' + fieldName + '"' + nameStr + ' class="form-control" rows="' + rowspan + '" data-type="' + type + '" ' + controlreadOnly + '></textarea>');
        ctl_holder.find("textarea").text(selected_data);
        break;
      case 'email-multiple': //NO I18N
        var rowspan = fieldObj.rowspan || "5";
        ctl_holder.html('<textarea tabindex="' + tabIndex + '" id="' + fieldName + '"' + nameStr + ' class="form-control" rows="' + rowspan + '" data-type="' + type + '" ' + controlreadOnly + '></textarea>');
        ctl_holder.find("textarea").text(selected_data);
        break;
      case 'checkbox': //NO I18N
        var selStr = "false";
        if (displayDetailStr == true) {
          selStr = "true";
        }
        if (_self.options.isDetailForm) {
          ctl_holder.html('<select id="select_' + fieldName + '"' + nameStr + ' data-type="checkbox" autocomplete="off"><option value="true">' + translate("sdp.admin.settings.yes") + '</option><option value="false">' + translate("sdp.admin.settings.no") + '</option></select>');
          ctl_holder.find('[id="select_' + fieldName + '"]').select2().select2('val', selStr); //NO I18N

        } else {
          var checkedStr = (selected_data == true ? ' checked ' : ''); //NO I18N
          ctl_holder.html('<label class="cus-input xs"><input tabindex="' + tabIndex + '" type="checkbox" id="' + fieldName + '"' + nameStr + checkedStr + ' data-type="' + type + '"  value="' + (selected_data ? selected_data : false) + '" ' + controlreadOnly + '><em></em>' + e_html(fieldObj.display_name) + '</label>');
        }
        break;
      case 'password': // No I18N
        ctl_holder.html('<input tabindex="' + tabIndex + '" type="password" id="' + fieldName + '"' + nameStr + ' class="form-control"  data-type="' + type + '" value="' + e_attr(selected_data) + '" ' + controlreadOnly + '></input>');
        break;
      case 'long': // No I18N
      case 'Numeric': // No I18N
      case 'currency': // No I18N
        ctl_holder.html('<input tabindex="' + tabIndex + '" type="text" id="' + fieldName + '"' + nameStr + ' class="form-control"  data-type="' + type + '" value="' + selected_data + '" ' + controlreadOnly + ' ' + controlAutoComplete + '></input>');
        break;
      default:
        var data_attr = "";
        if (fieldObj.display_dir) {
          data_attr = " dir='" + fieldObj.display_dir + "' "; //No I18N
        }
        ctl_holder.html('<input tabindex="' + tabIndex + '" type="text" id="' + fieldName + '"' + nameStr + ' class="form-control"  ' + data_attr + ' data-type="' + type + '" value="' + e_attr(selected_data) + '" ' + controlreadOnly + ' ' + controlAutoComplete + '></input>');
    }
    return ctl_holder;
  },
  getInputObject: function () {
    var _self = this;
    var formObject = {}, udflds_obj = {}, FORM = jQ("#" + _self.options.formId);
    jQuery(FORM).find("[name]:visible,input[name*='date'],input[data-type='date'],input[data-type='date-time']").each(function (index, ele) { // No I18N
      var eleName = ele.name;
      var elevalue = ele.value;
      var eleObj = "";
      var dtype = jQuery(ele).attr('data-type');
      if (dtype == "Date/Time" || dtype === "datetime" || dtype === "date-time") { // No I18N
        var eleVisible = jQ("[name='" + eleName + "']").parent().find('.date input').is(":visible");  //NO I18N
        if (!eleVisible) {
          return;
        }
      }
      if (elevalue != "") {
        if (~eleName.indexOf("pick_")) {
          eleObj = jQuery(ele).select2('data').text; // No I18N
        }
        else if (dtype === "lookup" || dtype === "Pick List" || dtype === "multi_select") {
          var seleObj = jQuery(ele).select2('data'); // No I18N
          if (seleObj) {
            if (seleObj.constructor === Array && dtype !== "Pick List") {
              eleObj = [];
              for (var i = 0; i < seleObj.length; i++) {
                eleObj.push({ "id": seleObj[i].id });
              }
            } else {
              eleObj = {};
              if (seleObj.length != 0 && (typeof seleObj == "object" && !jQuery.isEmptyObject(seleObj))) {
                if (seleObj.isTag) {
                  eleObj = { "name": seleObj.id }; // No I18N
                } else {
                  eleObj = { 'id': seleObj.id }; // No I18N
                }
              }
            }
          } else {
            eleObj = null;
            if (_self.options.skipInvalidValue) {
              return;
            }
          }
        } else if (dtype == "Date/Time" || dtype === "datetime" || dtype === "date-time") { // No I18N
          eleObj = { "value": elevalue }; // No I18N
        }
        else {
          eleObj = elevalue ? elevalue.trim() : elevalue;
        }
      } else if (elevalue === "" && dtype == "checkbox") {
        eleObj = jQuery(ele).select2('data').id; // No I18N
      }
      else {
        if (_self.options && _self.options.skipInvalidValue) {
          return;
        }
        if (dtype === "multi_select") { // No I18N
          eleObj = [];
        } else {
          eleObj = null;
        }
      }
      if (~eleName.indexOf("_fields.")) {
        var udf_nameArr = eleName.split('.');
        var udf_name = udf_nameArr[0];
        var fld_name = udf_nameArr[1];
        if (udflds_obj[udf_name] == undefined) {
          udflds_obj[udf_name] = {};
        }
        udflds_obj[udf_name][fld_name] = eleObj;
      } else {
        formObject[eleName] = eleObj;
      }

    });
    formObject = jQuery.extend(formObject, udflds_obj);
    return formObject;
  },
  inlineSaveChanges: function (ele) { //Inline spot edit save function
    if (jQuery(this.options.holderele).find('.spot-form').find('span.text-danger:visible').length <= 0) {
      var currentELe = jQuery(ele).closest('.spot-form').find('.form-control'); //NO I18N
      callbackFormFunc(this.options.inlineSaveCallback, "details", currentELe); //NO I18N
    }
  },
  initCalendar: function (id, type) { //calendar init function
    var hideTime = true;
    if (type == "Date/Time" || type === "datetime" || type === "date-time") { //NO I18N
      hideTime = false;
    }
    initCalendar(id + "_IN", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, hideTime); //NO I18N
  },
  /** constructs the jquery validator rules and messages object */
  constructRuleObj: function (field) {
    var obj = {
      rules: {},
      messages: {}
    };
    var fld_type = field.type || field.TYPE;
    var fld_name = field.display_name || field.TITLE;
    fld_name = e_html(fld_name);
    if (field.mandatory) {
      if (fld_type === "lookup" || fld_type === "Pick List") { //No I18N
        obj.rules.select = true;
        obj.messages.select = translate("common.validation.select", [fld_name]); //No I18N
      } else if (fld_type === "datetime" || fld_type === "Date/Time" || fld_type === "date-time") { //No I18N
        obj.rules["date-required"] = true; //NO I18N
        obj.messages["date-required"] = translate("common.validation", [fld_name]); //No I18N
      } else {
        obj.rules.required = true;
        obj.messages.required = translate("common.validation", [fld_name]); //No I18N
      }
    }

    if (fld_type === "long" || fld_type === "Numeric") { //No I18N
      obj.rules.regex = /^\d+$/;
      obj.messages.regex = translate("sdp.common.invalidnumber"); //No I18N
    } else if (fld_type === "double") { //No I18N
      obj.rules.number = true;
      obj.messages.number = translate("common.invalid.decimal"); //No I18N
    } else if (fld_type === "currency") { //NO I18N
      obj.rules["positive-decimal"] = true; //NO I18N
    } else if (fld_type === "email") { //NO I18N
      obj.rules["email"] = {
        depends: function () {
          //To trim white spaces
          jQ(this).val(jQ.trim(jQ(this).val()));
          return true;
        }
      };
    } else if (fld_type === "custom-email") { //NO I18N
      obj.rules["custom-email"] = { //No I18N
        depends: function () {
          //To trim white spaces
          jQ(this).val(jQ.trim(jQ(this).val()));
          return true;
        }
      };
    } else if (fld_type === "email-multiple") { //NO I18N
      obj.rules["email-multiple"] = true; //NO I18N
    }

    if (fld_type === "long" || fld_type === "Numeric" || fld_type === "double" || fld_type === "currency") {
      obj.rules["maxvalue-numeric"] = true; //NO I18N
    }
    if (field.max_length) {
      obj.rules["maxlength"] = field.max_length; //NO I18N
      obj.messages.maxlength = translate("common.maxlength", [fld_name, field.max_length]); //No I18N
    }

    return obj;
  },
  /*
   *  Initializes the jQuery validator for the given form
   *      1) formID - element ID of the form
   *      2) rules - Valid jquery validation Rules object
   *      3) messages - Valid jquery validation Messages object
   *      4) onerror = {"class" :Class Names} - Can pass the class names for error element
   */
  initFormValidator: function (formID, rules, messages, onerror, onsuccess) {
    this.customValidationMethods();
    var element = jQuery("#" + formID);
    /** Checks the rule validation for the select, select2 and date fields */
    element.find("select, input[type='hidden'], input[name],input[id^='select_*']").on("change", function (event) {
      jQuery(this).valid();
    });
    return element.validate({
      rules: rules,
      messages: messages,
      ignore: [],
      errorClass: 'text-danger', //No I18N
      errorElement: 'span', // No I18N
      onkeyup: function (element) {
        this.element(element); //To trigger keyup event once validation is initialized to form.
      },
      onchange: function (element) {
        this.element(element); //To trigger change event once validation is initialized to form.
      },
      errorPlacement: function (error, element) {
        var errorClass = "p5 fr m0"; //No I18N
        if (typeof onerror == "object" && !jQuery.isEmptyObject(onerror)) { //No I18N
          if (onerror.class) {
            errorClass = onerror.class;
          }
        }
        if (element.parents(".input-group").length > 0) {
          element = element.parents(".input-group"); //No I18N
        } else if ((element.attr("type") === "checkbox" || element.attr("type") === "radio") && element.parent("label").length > 0) { //NO I18N
          element = element.parent("label"); //NO I18N
        }
        error.insertAfter(element);
        var eleHeight = element.height();
        if (element.parent().find('.select2-container').length > 0) {
          eleHeight = element.parent().find('.select2-container').height();
        }
        error.addClass("alert alert-danger " + errorClass).css({ 'width': 'auto', 'overflow': 'visible', 'top': (element.next().height() + eleHeight + 10) + 'px' }); // No I18N
      },
      success: function (error, element) {
        error.remove();
        if (typeof (onsuccess) === "function") { //No I18N
          onsuccess(error, element);
        }
      },
      invalidHandler: function (form, validator) {//To focus first error element
        var errors = validator.numberOfInvalids();
        if (errors) {
          validator.errorList[0].element.focus();
        }
      }
    });
  },

  customValidationMethods: function () {
    /** Regex validator */
    jQuery.validator.addMethod(
      "regex", // No I18N
      function (value, element, regexp) {
        var re = new RegExp(regexp);
        return this.optional(element) || re.test(value);
      },
      window.translate("common.validation.msg") // No I18N
    );

    /** select or select2 validator */
    jQuery.validator.addMethod(
      "select", // No I18N
      function (value, element) {
        var isOptional = this.optional(element);
        //typeof isOptional !== "boolean" && (isOptional = false);
        //return isOptional || value && value != "0" ? true : false;
        return isOptional != "dependency-mismatch" || value && value != "" ? true : false;  //No I18N
      },
      window.translate("common.validation.msg") // No I18N
    );


    /** positive-decimal validator */
    jQuery.validator.addMethod(
      "positive-decimal", // No I18N
      function (value, element, params) {
        var re = new RegExp(/^\d+(\.\d{1,2})?$/);
        return this.optional(element) || re.test(value);
      },
      window.translate("common.invalid.decimal") // No I18N
    );

    /** maxvalue-numeric validator */
    jQuery.validator.addMethod(
      "maxvalue-numeric", // No I18N
      function (value, element, params) {
        return this.optional(element) || (Math.max(value) <= Math.max(9223372036854775808));
      },
      window.translate("sdp.additional.fields.exceeded") // No I18N
    );

    /** Date Time validator */
    jQuery.validator.addMethod(
      "date-required", // No I18N
      function (value, element) {
        return this.optional(element) || value && value != "0" ? true : false;
      },
      window.translate("common.validation.msg") // No I18N
    );
    jQuery.validator.addMethod(
      "custom-email", // No I18N
      function (value, element) {
        var valid = true, invalidMailArr = "";
        var respObj = FormComponent.prototype.getTextToArray(value);
        if (!jQuery.isEmptyObject(respObj)) {
          valid = respObj.valid;
          invalidMailArr = respObj.mailList;
        }
        return valid;
      },
      window.translate("sdp.common.email.id.invalid")
    );
    /** Multiple Email validator */
    var errMailMsg = window.translate("common.validation.msg"); //NO I18N
    jQuery.validator.addMethod(
      "email-multiple", // No I18N
      function (value, element) {
        var valid = true, invalidMailArr = "";
        var respObj = FormComponent.prototype.getTextToArray(value);
        if (!jQuery.isEmptyObject(respObj)) {
          valid = respObj.valid;
          invalidMailArr = respObj.mailList;
        }
        if (!valid) {
          errMailMsg = translate("sdp.admin.requester.invalidEmail") + "<br>" + invalidMailArr; //NO I18N
        }
        return valid;
      },
      function vaidateEmailMessage() {
        return errMailMsg;
      }
    );
  },
  getTextToArray: function (mailList) {
    mailList = mailList.replace(/(\r\n|\n|\r|\s)/gm, ",");
    var mailArr = (mailList.trim()).split(",");
    mailArr = this.validate(mailArr);
    return mailArr;
  },
  getInvalidEmail: function (outArr) {
    var leading = /^\s*/g;
    var trailing = /\s*$/g;
    var temp, len = outArr.length,
      invalidMail = "";
    for (temp = 0; temp < len; temp++) {

      var str = outArr[temp];
      leadingremoved = str.replace(leading, "");
      str = leadingremoved.replace(trailing, "");
      if (str.length > 0) {
        var posadr1 = 0;
        var posdot = str.indexOf(".");
        var posadr = str.indexOf("@");
        posadr1 = str.lastIndexOf("@"); //No I18N
        if ((posdot < 0) || (posadr < 0) || (posadr1 != posadr)) {
          invalidMail = invalidMail + encodeHTML(str) + "<br>";
          continue;
        }
      }
      var j = str.length;
      var strobj = str;
      if (strobj.charAt(j - 1) == "." || strobj.charAt(0) == "@" || strobj.charAt(j - 1) == "@" || strobj.charAt(j - 1) == "-" || strobj.charAt(j - 1) == "_" || strobj.charAt(j - 2) == "_" || strobj.indexOf(">") != -1 || strobj.indexOf("<") != -1) {
        invalidMail = invalidMail + e_html(str) + "<br>";
        continue;
      }
    }
    return invalidMail;
  },
  validate: function (outArr) {
    var retObj = {};
    var invalidMailList = this.getInvalidEmail(outArr)
    if (invalidMailList == "") {
      retObj.mailList = outArr;
      retObj.valid = true;
    } else {
      retObj.mailList = invalidMailList;
      retObj.valid = false;
    }
    return retObj;
  },
  eliminateDuplicateEleFromArray: function (arr) {
    arr = arr.replace(/(\r\n|\n|\r|\s)/gm, ",");
    arr = (arr.trim()).split(",");
    var i, len = arr.length, out = [], obj = {};
    for (i = 0; i < len; i++) {
      obj[arr[i]] = 0;
    }
    for (i in obj) {
      if (i != "" && i != null) {
        out.push(i);
      }
    }
    return out;
  },
  constructLayout: function (form_fields, meta_info) {
    var resp_obj = {}, layouts = [], metainfo_Obj = {};
    for (var i = 0; i < form_fields.length; i++) {
      var layout = {}
      var sectionsObj = {};
      var sectionsArr = [];

      var sectionFields = form_fields[i].fields;
      var sec_col = sec_row = 1;
      var section = {};
      section.position = { "col": sec_col, "row": sec_row };
      section.name = form_fields[i].name;
      section.field_align = "left-right"; // No I18N
      section.column_count = 1;

      var fields = [];
      var fld_col = fld_row = 1;
      jQuery.each(sectionFields, function (fieldName, value) {
        var field_metainfo = meta_info[fieldName];
        if (field_metainfo && field_metainfo.type == "udf") {
          var flds = field_metainfo.fields;
          if (!jQuery.isEmptyObject(flds)) {
            jQuery.each(flds, function (subfield_name, field) {
              field.position = { "col": fld_col, "row": fld_row };
              field.name = fieldName + "." + subfield_name;
              if (!field.fieldname) {
                field.fieldname = subfield_name;
              }
              fields.push(field);
              if (fld_col == section.column_count) {
                fld_col = 1;
                fld_row += 1;
              } else {
                fld_col += 1;
              }
              metainfo_Obj[fieldName + "." + subfield_name] = field;
            });
          }
        } else {
          var field = value;
          field.position = { "col": fld_col, "row": fld_row };
          field.name = fieldName;
          if (field_metainfo) {
            if (field.display_type) {
              field_metainfo.display_type = field.display_type;
            }
            jQuery.extend(field, field_metainfo);
          } else if (field.frommeta == true) {
            field.default_hide = true;

          }
          fields.push(field);
          if (fld_col == section.column_count) {
            fld_col = 1;
            fld_row += 1;
          } else {
            fld_col += 1;
          }
          metainfo_Obj[fieldName] = field;
        }
        section.fields = fields;
        sec_row++;
      });
      sectionsArr.push(section);
      sectionsObj.fields = sectionsArr;
      sectionsObj.default_hide = form_fields[i].default_hide || false;
      sectionsObj.header = form_fields[i].section_head;
      sectionsObj.name = form_fields[i].name;
      layout.sections = sectionsObj;
      layouts.push(layout);
    }
    resp_obj.layouts = layouts;
    resp_obj.metainfo = metainfo_Obj;
    return resp_obj;
  },

  viewContentInDialog: function (event, element, title) {
    event.stopPropagation();
    event.preventDefault();
    var content = '<div class="p20 pl10 pr10 wspace-prewrap">' + jQuery(element).find('.text-content').html() + '</div>';
    title = title || jQuery(element).parents(".col-fields").eq(0).find(">label").text();  //No I18N
    showDialog(content, "modal=yes, width=450px, height=300px, title=" + e_attr(title) + ", position=absmiddle"); //No I18N
  }
}
