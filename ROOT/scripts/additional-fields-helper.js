// Module specific options are moved to this file
//all possible options below
/*
        Options
-------------------------------
showPIIField - whether to show 'PII checkbox' or not
showEncryptField - whether to show 'Encrypt the Field' or not
fieldtype_enabled - whether to show 'API Field name' field or not


        Functions
-------------------------------
setPopupConditions - field releated options when popup is opened from template
udffieldEntities   - field releated options when popup is opened from admin(For eg: from request additional field)
get_mdl_options    - field releated options when we change field type (For eg: from Single line to Multi Line)

*/

var $udfHelper = {
    "checklist": { //No I18N
        setPopupConditions(popup_action) {
            return {
                showPIIField: false,
                showEncryptField: false,
                fieldtype_enabled: (popup_action == "updateField") ? false : true, //No I18N
                dataMsg: "item_name.empty.error", //No I18N
                name_disabled: false,
                showCommonField: false,
                showDesc: false,
                showCopyDescOption: false,
                showPermissions: false,
            }
        },
        setValuesForFieldTypes() {
            return {
                show_display_options: false,
                isConstraintsShown: false,
                isUDF: true
            }
        },
        get_mdl_options() {
            return {
                "showPIIField": false, //No I18N
                // this configuration is not neede for checklist
                "showEncryptField": false, //No I18N
                "show_display_options": false, //No I18N
            }
        }
    },
    "user": { //No I18N
        udffieldEntities(...args) {
            const opts = $udfHelper.technician.udffieldEntities(...args);
            return Object.assign(opts, {autoSelectEncryptField: true});
        }
    },
    "technician": { //No I18N
        udffieldEntities(cntrl, popup_action, fieldInfo) {
            return {
                showPIIField: $udfcommon.$udfform.isPIIField(fieldInfo.display_type),
                piiI18: "sdp.admin.additionalfields.piiorephifield", //No I18N
                piiI18Title: "sdp.admin.additionalfields.piiorephifield.infoicon", //No I18N
                isPII: (popup_action == "updateField") ? fieldInfo.is_pii : false,//No I18N
                encryptField_extrafiled: ["pick_list","radio"],//No I18N
                helpContentTemplate: false,
            }
        }
    },
    "release": { //No I18N
        setPopupConditions(popup_action, fieldInfo) {
            return {
                showPIIField: false,
                fieldtype_enabled: (popup_action == "updateField") ? false : true, //No I18N
                //name_disabled: (fieldInfo.udfid == undefined) ? false : true,
                requestercanEdit: false,
                requestercanView: false,
                descmultiHgt: false,
                fieldKey: (popup_action == 'newField') ? true : false,//No I18N
                allownumbers_show: (fieldInfo.display_type == "single_line") ? true : false, //No I18N
                allow_numbers_only: fieldInfo.allow_numbers_only || fieldInfo.only_numeric || false,
                mline_maxlength: (fieldInfo.display_type == "multi_line") ? 500 : 250, //No I18N
                helpContent: true,
                disable_defval: (fieldInfo.display_type == "decimal" && fieldInfo.udfid == undefined) ? true : false, //NO I18N
                datepickerdisable: fieldInfo.isDisable || false,
                showPermissions: (fieldInfo.id=="completed_time"||fieldInfo.id=="created_time"||fieldInfo.label == 'Site' || fieldInfo.id == 'subject') ? false : true, //No I18N
                showFieldTabs: true,
                showFieldCustomization: true,
            }
        },
        udffieldEntities(cntrl, popup_action) {
            return {
                fieldKey: (popup_action == 'newField') ? true : false, //No I18N
                saveAndAddBtn: true,
                helpContent: true,
            }
        },
        setValuesForFieldTypes(popup_action, fieldInfo) {
            return {
                show_display_options: false,
                isUDF: (popup_action == "newField" || fieldInfo.udfid != undefined) ? true : false //No I18N
            }
        },
        get_mdl_options(display_type) {
            return {
                "mline_maxlength": 500, //No I18N
                "showPIIField": false, //No I18N
                "show_display_options": false, //No I18N
                "disable_defval": display_type == "decimal" ? true : false, //No I18N
            }
        },
    },
    "problem": { //No I18N
        udffieldEntities() {
            return {
                saveAndAddBtn: true,
                helpContent: true,
                showEncryptField:false,
            }
        },
        setPopupConditions(popup_action, fieldInfo) {
            const mopt = {
                showPIIField: false,
                fieldtype_enabled: (popup_action == "updateField") ? false : true, //No I18N
                //name_disabled: (fieldInfo.udfid == undefined) ? false : true,
                requestercanEdit: false,
                requestercanView: false,
                datepickerdisable:fieldInfo.isDisable,
                descmultiHgt: false,
                allownumbers_show: (fieldInfo.display_type == "single_line") ? true : false, //No I18N
                allow_numbers_only: fieldInfo.allow_numbers_only || fieldInfo.only_numeric || false,
                mline_maxlength: (fieldInfo.display_type == "multi_line") ? 500 : 250, //No I18N
                helpContent: false,
                disable_defval: (fieldInfo.display_type == "decimal" && fieldInfo.udfid == undefined) ? true : false, //NO I18N
                showPermissions: (fieldInfo.id=="closed_time"||fieldInfo.id=="reported_time"||fieldInfo.id == 'site' || fieldInfo.id == 'title' || fieldInfo.id=='status') ? false : true, //No I18N
                showEncryptField : false,
                showFieldTabs: true,
                showFieldCustomization: true,
            };
            if(fieldInfo.udfid == undefined && fieldInfo.id!='new_field'){
                mopt['max_field_length'] = 250;
                mopt['sline_char_limit'] = 250;
            }
            return mopt;
        },
        setValuesForFieldTypes(popup_action, fieldInfo) {
            return {
                show_display_options: false,
                isUDF: (popup_action == "newField" || fieldInfo.udfid != undefined) ? true : false//No I18N  
            }
        }
    },
    "task": { //No I18N
        udffieldEntities(cntrl, popup_action) {
            return {
                saveAndAddBtn: (popup_action == 'newField') ? true : false, //No I18N
                skipEncryptField: true,
                helpContentTemplate: false,
                fieldKey: (popup_action == 'newField') ? true : false, //No I18N  
            }
        },
    },
    "custom_module": { //No I18N
        setPopupConditions: (...args) => $udfHelper.custom_modules.setPopupConditions(...args),
        setValuesForFieldTypes: (...args) => $udfHelper.custom_modules.setValuesForFieldTypes(...args),
        get_mdl_options: (...args) => $udfHelper.custom_modules.get_mdl_options(...args),
        udffieldEntities: (...args) => $udfHelper.custom_modules.udffieldEntities(...args),
        callbackAfterBodyRender(table) {
            let hgt = jQuery(table.tblContainer).closest('.admin-temp-listview').offset().top + is_chathgt + 60;//No I18N
            jQuery(table.tblContainer).closest('.admin-temp-listview').css('min-height', 'calc(100vh - ' + hgt + 'px)');//No I18N
        }
    },
    "custom_modules": { //No I18N
        setPopupConditions(popup_action, fieldInfo, module) {
            let field_type = fieldInfo.display_type;
            return {
                field_name_length: "50",//No I18N
                showPIIField: $udfcommon.$udfform.isPIIField(field_type, ["email","phone","date"]), //No I18N
                isPII: (popup_action == "updateField") ? (fieldInfo.hasOwnProperty('response') && (jQuery.isPlainObject(fieldInfo.response) && fieldInfo.response.hasOwnProperty('is_pii')) ? fieldInfo.response.is_pii : fieldInfo.is_pii) : false,//No I18N
                showUnique: (fieldInfo.display_type == 'single_line')&&(module!='udf_fields')? true: false,//No I18N
                showPrimaryField: (fieldInfo.display_type == 'single_line')&&(module!='udf_fields')? true: false,//No I18N
                showEncryptField: (popup_action == 'newField') ? (fieldInfo.display_type == 'email' || fieldInfo.display_type == 'phone') ? true : false : false,//No I18N
                //encryptField_extrafiled: ["email","phone"],//No I18N
                fieldtype_enabled: (popup_action == "updateField") ? false : true, //No I18N
                requestercanEdit: false,
                requestercanView: false,
                name_disabled: ((fieldInfo.udfid == undefined) && (popup_action == "updateField")) ? true : false, // No I18N
                descmultiHgt: false,
                fieldKey: (fieldInfo.udfid == undefined && fieldInfo.id!='new_field')? false: true, // No I18N
                labeltofieldkeyCopy: (popup_action == "updateField") ? false : true, //No I18N
                allownumbers_show: (fieldInfo.display_type == "single_line") ? true : false, //No I18N
                mline_maxlength: (fieldInfo.display_type == "multi_line") ? 500 : 250, //No I18N
                helpContent: true,
                datepickerdisable: true,
                disable_defval: (fieldInfo.display_type == "decimal" || fieldInfo.display_type == "date/time" ||(fieldInfo.id!='new_field' && fieldInfo.udfid == undefined)) ? true : false, //NO I18N
                disableRightsec: fieldInfo.refer_field_value > 0 ? true:false,
                refer_field: (field_type == "pick_list" || field_type == "multi_select" || field_type == "radio" || field_type == "checkbox") && (fieldInfo.refer_field_value || popup_action == "newField") ? true : false, //NO I18N
                refer_field_disabled: fieldInfo.refer_field_value ? true: false,
                // disable_udf_fixed_length: fieldInfo.primary_field ? true : false,
                disable_udf_fixed_length:  (fieldInfo.primary_field || (fieldInfo.udfid == undefined && fieldInfo.id!='new_field')) ? true : false, //No I18N
                fieldKey_disabled: (popup_action == "updateField") ? true : false, //No I18N
                // disable_udf_allownumber: fieldInfo.primary_field ? true : false,
                disable_udf_allownumber:  (fieldInfo.primary_field || (fieldInfo.udfid == undefined && fieldInfo.id!='new_field')) ? true : false, //No I18N
                allow_numbers_only: (fieldInfo.hasOwnProperty('only_numeric') ? fieldInfo.only_numeric : fieldInfo.allow_numbers_only) || false, //No I18N
                showFieldTabs: true,
                showFieldCustomization: true,
                refer_field_for: { for: 'custom_module' }, //No I18N
		sendDefValue: true
            }
        },
        setValuesForFieldTypes(popup_action, fieldInfo) {
            return {
                show_display_options: false,
                isUDF: (popup_action == "newField" || fieldInfo.udfid != undefined) ? true : false //No I18N
            }
        },
        get_mdl_options() {
            return {
                "show_display_options": false, //No I18N
            };
        },
        udffieldEntities(cntrl, popup_action, fieldInfo) {
            return {
                field_name_length: "50",//No I18N
                fieldKey: (popup_action == 'newField') ? true : false, //No I18N
                refer_field: (fieldInfo.display_type == "pick_list" || fieldInfo.display_type == "multi_select" || fieldInfo.display_type == "radio" || fieldInfo.display_type == "checkbox") && (fieldInfo.refer_field_value || popup_action == "newField") ? true : false, //NO I18N
                refer_field_disabled: fieldInfo.refer_field_value ? true: false,
                saveAndAddBtn: true,
                helpContent: true,
                showEncryptField: (popup_action == 'newField') ? (fieldInfo.display_type == 'email' || fieldInfo.display_type == 'phone') ? true : false : false,//No I18N
                sendDefValue: true
            };
        }
    },
    // space and facility share same options
    "space_structure": { //No I18N
        udffieldEntities: (...args) => $udfHelper.space.udffieldEntities(...args)
    },
    "space_campus": { //No I18N
        udffieldEntities: (...args) => $udfHelper.space.udffieldEntities(...args)
    },
    "space_floor": { //No I18N
        udffieldEntities: (...args) => $udfHelper.space.udffieldEntities(...args)
    },
    "space_room": { //No I18N
        udffieldEntities: (...args) => $udfHelper.space.udffieldEntities(...args)
    },
    "space": { //No I18N
        udffieldEntities: (...args) => $udfHelper.facility_service.udffieldEntities(...args),
        setPopupConditions: (...args) => $udfHelper.facility_service.setPopupConditions(...args),
        setValuesForFieldTypes: (...args) => $udfHelper.facility_service.setValuesForFieldTypes(...args),
        get_mdl_options: (...args) => $udfHelper.facility_service.get_mdl_options(...args),
    },
    "facility_service": { //No I18N
        udffieldEntities(cntrl, popup_action) {
            return {
                fieldKey: (popup_action == 'newField') ? true : false, //No I18N
                saveAndAddBtn: true,
                helpContent: true,
            }
        },
        setPopupConditions(popup_action, fieldInfo) {
            return {
                showPIIField: false,
                fieldtype_enabled: (popup_action == "updateField") ? false : true, //No I18N
                name_disabled: (popup_action == 'newField') ? false : true, //No I18N
                requestercanEdit: false,
                requestercanView: false,
                descmultiHgt: false,
                fieldKey: (popup_action == 'newField') ? true : false,//No I18N
                allownumbers_show: (fieldInfo.display_type == "single_line") ? true : false, //No I18N
                allow_numbers_only: fieldInfo.allow_numbers_only || fieldInfo.only_numeric || false,
                mline_maxlength: (fieldInfo.display_type == "multi_line") ? 500 : 250, //No I18N
                helpContent: true,
                disable_defval: (fieldInfo.display_type == "decimal" && fieldInfo.udfid == undefined) ? true : false, //NO I18N
                showPermissions:  true,
                showFieldTabs: true,
                showFieldCustomization: true,
                hideDefaultVal: true,
            }
        },
        setValuesForFieldTypes(popup_action, fieldInfo) {
            return {
                isUDF: (popup_action == "newField" || fieldInfo.udfid != undefined) ? true : false //No I18N
            }
        },
        get_mdl_options(display_type) {
            return {
                "mline_maxlength": 500, //No I18N
                "showPIIField": false, //No I18N
                "disable_defval": display_type == "decimal" ? true : false, //No I18N
            }
        }
    },
    "project": { //No I18N
        udffieldEntities: (...args) => $udfHelper.worklog.udffieldEntities(...args)
    },
    "worklog": { //No I18N
        udffieldEntities(cntrl, popup_action) {
            return {
                saveAndAddBtn: (popup_action == 'newField') ? true : false, //No I18N
                fieldKey: (popup_action == 'newField') ? true : false, //No I18N
                skipEncryptField: true
            }
        },
        setPopupConditions(popup_action, fieldInfo) {
            return mopt = {
                allow_numbers_only: fieldInfo.allow_numbers_only || fieldInfo.only_numeric || false,
                allownumbers_show: (fieldInfo.display_type == "single_line") ? true : false, //No I18N
                mline_maxlength: (fieldInfo.display_type == "multi_line") ? 500 : 250, //No I18N
                fieldtype_enabled: (popup_action == "updateField") ? false : true, //No I18N
                fieldKey: (popup_action == 'newField') ? true : false,//No I18N
                showPermissions: ["owner","total_cost", "owner_cost"].indexOf(fieldInfo.id) == -1, //No I18N
                datepickerdisable:fieldInfo.isDisable,
                disable_defval: fieldInfo.read_only,
                showFieldCustomization: true,
                showEncryptField : false,
                requestercanEdit: false,
                requestercanView: false,
                showFieldTabs: true,
                showPIIField: false,
                descmultiHgt: false,
                helpContent: true
            };
        },
        get_mdl_options(){
            return {
                showPIIField: false,
                showEncryptField: false
            }
        }
    },
    "request": { //No I18N
        setPopupConditions(popup_action, fieldInfo) {
            const mopt = {
                skipEncryptField: false, //No
                // showPIIField: $udfcommon.$udfform.isPIIField(fieldInfo.display_type),
                isPII: (popup_action == "updateField") ? (fieldInfo.is_pii == true) : false,//No I18N
                showFieldTabs: true,
                showFieldCustomization: true,
                disable_defval: fieldInfo.display_type == "decimal" ? true : false, //No I18N
                field_helptext_maxlength: 1500,
                autoSelectEncryptField: true
            }
            if(fieldInfo.udfid == undefined && fieldInfo.id!='new_field'){
                mopt.showPIIField = false; // default (refer) fields like technician, priority, category, etc  => shouldn't have PII field
            }
            return mopt;
        },
        udffieldEntities(cntrl, popup_action, fieldInfo) {
            return {
                saveAndAddBtn: (popup_action == 'newField') ? true : false, //No I18N
                skipEncryptField: false,
                helpContent: true,
                helpContentTemplate: true,
                showPIIField: fieldInfo.display_type == "decimal" ? false : true, //No I18N
                isPII: (popup_action == "updateField") ? fieldInfo.is_pii : false,//No I18N
                field_helptext_maxlength: 1500,
                autoSelectEncryptField: true
            }
        },
        get_mdl_options(display_type) {
            return {
                "field_helptext_maxlength": 1500, //No I18N
                "disable_defval": display_type == "decimal" ? true : false, //No I18N
            }
        },
        getFieldCount() {
            return {
                showInfoIcon: true,
                infoIconContent: translate('additional.field.count.resources')
            }
        },
        listViewOpt() {
            return {
                personalize_key: 'request_udf_list' //No I18N
            }
        },
        setSectionFormValues() {
            return {
                section_helptext_maxlength: 2500
            }
        }
    },
    "account_group": { //No I18N
        udffieldEntities: (...args) => $udfHelper.account.udffieldEntities(...args),
    },
    "account": { //No I18N
        udffieldEntities() {
            return {
                helpContentTemplate: false,
            };
        }
    },
    "associations": { //No I18N
        setPopupConditions(popup_action, fieldInfo) {
            return {
                field_name_length: "50",//No I18N
                showPIIField: (popup_action == 'newField') ? $udfcommon.$udfform.isPIIField(fieldInfo.display_type, ["email","phone", "date"]) : false, //No I18N
                fieldKey: (popup_action == 'newField') ? true : false, //No I18N
                saveAndAddBtn: true,
                encryptField_extrafiled: ["email","phone"],//No I18N
                helpContentTemplate: false,
                showEncryptField: (popup_action == 'newField') ? (fieldInfo.display_type == 'email' || fieldInfo.display_type == 'phone') ? true : false : false,//No I18N
                default_encryptField: [],
            }
        },
        udffieldEntities(cntrl, popup_action, fieldInfo) {
            return {
                field_name_length: "50",//No I18N
                showPIIField: (popup_action == 'newField') ? $udfcommon.$udfform.isPIIField(fieldInfo.display_type, ["email","phone", "date"]) : false, //No I18N
                fieldKey: (popup_action == 'newField') ? true : false, //No I18N
                saveAndAddBtn: true,
                encryptField_extrafiled: ["email","phone"],//No I18N
                helpContentTemplate: false,
                showEncryptField: (popup_action == 'newField') ? (fieldInfo.display_type == 'email' || fieldInfo.display_type == 'phone') ? true : false : false,//No I18N
                default_encryptField: [],
            };
        },
        listViewOpt() {
            return {
                insidePopup: true,
                popupContainer: '#relationship-association-container' //No I18N
            }
        }
    },
    "customize_ag_form": { //No I18N
        setPopupConditions(popup_action, fieldInfo, module, service_catalog_module_enabled, cntrl) {
            const mopt = {};
            if(module == "customize_ag_form"){
                mopt.showPermissions = !cntrl.techMandatoryFields.includes(fieldInfo.id);
                if(cntrl.techMandatoryFields.includes(fieldInfo.id) || fieldInfo.fieldKey == "description"){
                    fieldInfo.right_side_shown = false;
                    mopt.showUnique = false;
                    mopt.showPrimaryField = false;
                    mopt.showPermissions = false;
                }
                mopt.refer_field = false;
            }
            if(cntrl && (cntrl.routeName == "account")){
                mopt['showPIIField']=$udfcommon.$udfform.isPIIField(field_type) ;//No I18N
                mopt['isPII']= fieldInfo.is_pii;//No I18N
                mopt['piiI18'] = "sdp.admin.additionalfields.piiorephifield"; //No I18N
                mopt['piiI18Title'] = "sdp.admin.additionalfields.piiorephifield.infoicon"; //No I18N
            }
            return mopt;
        },
        setValuesForFieldTypes: (...args) => $udfHelper.custom_modules.setValuesForFieldTypes(...args),
    },
    "vendor": { //No I18N
        udffieldEntities(cntrl, popup_action) {
            return {
                fieldKey: (popup_action == 'newField') ? true : false, //No I18N
                helpContentTemplate: false
            }
        }
    },
    cmdb: {
        getFieldCount() {
            return {
                inputData: {"type_wise_count":{"category" : "cmdb"}} //No I18N
            }
        },
        setPopupConditions(popup_action, fieldInfo, module, service_catalog_module_enabled, cntrl) {
            const display_type = fieldInfo.display_type;
            const canEnableField = (fieldInfo.udfid == undefined && fieldInfo.id !== "new_field");//No I18N
            return {
                refer_field_for: { for: "cmdb" }, //No I18N
                showPIIField: $udfcommon.$udfform.isPIIField(display_type, ["email","phone", "date"]), //No I18N
                disable_defval: (display_type == "decimal" || display_type == "date/time" || canEnableField), //NO I18N
                name_disabled: canEnableField,
                showEncryptField: (popup_action == 'newField') && ["single_line", "multi_line", "email", "phone"].includes(display_type),//No I18N
                showUnique: display_type === "single_line",//No I18N
                fieldKey: popup_action == "newField",//No I18N
                showPermissions: true,
                disable_udf_fixed_length: canEnableField,
                requestercanEdit: false,
                requestercanView: false,
                helptext_maxlength: 250,
                sendDefValue: true,
                field_name_length: 50
            }
        },
        setValuesForFieldTypes(popup_action, fieldInfo) {
            fieldInfo.right_side_shown = true;
            return {
                isUDF : true
            }
        },
        get_mdl_options(display_type, fieldTypeId) {
            return {
                "showUnique": fieldTypeId === "single_line",//No I18N
                "disable_defval": fieldTypeId == "decimal" || fieldTypeId == "date/time", //NO I18N
                "showPIIField": $udfcommon.$udfform.isPIIField(fieldTypeId, ["email","phone","date"]),//No I18N
                "showEncryptField": ["single_line", "multi_line", "email", "phone"].includes(fieldTypeId)//No I18N
            }
        },
        udffieldEntities: function(cntrl, popup_action, fieldInfo) {
            const { display_type } = fieldInfo;
            return {
                "showPIIField": $udfcommon.$udfform.isPIIField(display_type, ["email","phone","date"]),//No I18N
                "fieldKey": popup_action == "newField",//No I18N
                "disable_defval": display_type == "decimal" || display_type == "date/time", //NO I18N
                "sendDefValue": true, //NO I18N
                "field_name_length": 50, //No I18N
                "saveAndAddBtn": true, //No I18N
                "showEncryptField": (popup_action == 'newField') && ["single_line", "multi_line", "email", "phone"].includes(display_type)//No I18N
            }
        }
    },
    "udf_fields": { //No I18N
        setPopupConditions(popup_action, fieldInfo, module, service_catalog_module_enabled, cntrl) {
            return $udfcommon.$udfform.udffieldEntities(cntrl, popup_action, fieldInfo)
        },
        setValuesForFieldTypes() {
            return {
                show_display_options: false,
                isUDF: true
            }
        },
        get_mdl_options(display_type, fieldTypeId, rn) {
            let map = {
                "release": { //No I18N
                    "showPIIField": false, //No I18N
                    "helpContent": true, //No I18N
                },
                "problem": { //No I18N
                    "showPIIField": false, //No I18N
                    "helpContent": true, //No I18N
                    "showEncryptField": false//No I18N
                },
                "project": { //No I18N
                    "showPIIField": false, //No I18N
                },
                "worklog": { //No I18N
                    "showPIIField": false, //No I18N
                },
                "space": { //No I18N
                    "showPIIField": false, //No I18N
                    "helpContent": true, //No I18N
                },
                "facility_service": { //No I18N
                    "showPIIField": false, //No I18N
                    "helpContent": true, //No I18N
                },
                "request": { //No I18N
                    "showPIIField": $udfcommon.$udfform.isPIIField(display_type), //No I18N
                    autoSelectEncryptField: true,
                    "helpContent": ["pick_list", "radio", "multi_select", "checkbox"].includes(fieldTypeId) ? false : true, //No I18N
                },
                "task": { //No I18N
                    "showPIIField": false, //No I18N
                },
                "vendor": { //No I18N
                    "showPIIField": false //No I18N
                },
                cmdb:{
                    "showPIIField": $udfcommon.$udfform.isPIIField(fieldTypeId, ["email","phone","date"]),//No I18N
                    "showEncryptField": ["single_line", "multi_line", "email", "phone"].includes(fieldTypeId)//No I18N
                },
                "asset_asset":{ //No I18N
                    "showPIIField": false //No I18N
                }
            };
            let rn_option = map[rn] ? map[rn] : {};
            let mdl_options = {
                "mline_maxlength": 500, //No I18N
                "show_display_options": false, //No I18N
                "disable_defval": display_type == "decimal" ? true : false, //No I18N
                "helpContent": ["single_line", "numeric", "decimal", "email", "percentage", "html", "attachment"].includes(fieldTypeId) ? true : false, //No I18N
            }
            return jQuery.extend({}, mdl_options, rn_option);
        }
    },
    "asset_asset":{ //No I18N
        getFieldCount() {
            return {
                inputData: {"type_wise_count":{"category" : "asset"}} //No I18N
            }
        },
        setPopupConditions(popup_action, fieldInfo, module, service_catalog_module_enabled, cntrl) {
            var field_type = fieldInfo.display_type;
            return {
                field_name_length: "50",//No I18N
                requestercanEdit: false,
                requestercanView: false,
                showPIIField: false,
                fieldtype_enabled: (popup_action == "updateField") ? false : true, //No I18N
                descmultiHgt: false,
                fieldKey: (popup_action == 'newField') ? true : false,//No I18N
                allownumbers_show: (field_type == "single_line") ? true : false, //No I18N
                allow_numbers_only: fieldInfo.allow_numbers_only || fieldInfo.only_numeric || false,
                mline_maxlength: (field_type == "multi_line") ? 500 : 250, //No I18N
                helpContent: true,
                disable_defval: (field_type == "decimal" || field_type == "date/time" || (fieldInfo.udfid == undefined && fieldInfo.id!='new_field')) ? true : false, //NO I18N
                datepickerdisable: true,
                freezelayer: false,
                showEncryptField: (popup_action === 'newField') ? (field_type == 'single_line' || field_type == 'multi_line') ? true : false : false,//No I18N
                showUnique: (field_type == 'single_line') ? true: false,//No I18N
                refer_field: (field_type == "pick_list" || field_type == "multi_select" || field_type == "radio" || field_type == "checkbox") && (fieldInfo.refer_field_value || popup_action == "newField") ? true : false, //NO I18N
                refer_field_for: { for: "asset" },// No I18N
                name_disabled: ((fieldInfo.udfid == undefined) && (popup_action == "updateField")) ? true : false, // No I18N
                disable_udf_fixed_length: (fieldInfo.udfid == undefined && fieldInfo.id!='new_field') ? true : false, //No I18N
                disable_udf_allownumber: (fieldInfo.udfid == undefined && fieldInfo.id!='new_field') ? true : false, //No I18N
                refer_field_disabled: fieldInfo.refer_field_value ? true: false,
                disableRightsec: fieldInfo.refer_field_value > 0 ? true:false,
                hideDefaultVal: (popup_action !== 'newField' && field_type === 'multi_line' && fieldInfo.udfid === undefined) ? true: false, //No I18N
                sendDefValue: true
            }
        },
        setValuesForFieldTypes(popup_action, fieldInfo) {
            fieldInfo.right_side_shown = true;
            return {
                isUDF : (popup_action == "newField" || fieldInfo.udfid != undefined) ? true : false//No I18N
            }
        },
        get_mdl_options(display_type, fieldTypeId) {
            return {
                "show_display_options": false, //No I18N
                "disable_defval": (fieldTypeId == "decimal" || fieldTypeId == "date/time") ? true : false, //NO I18N
                "showUnique": (fieldTypeId == "single_line") ? true : false, //NO I18N
                'refer_field': (fieldTypeId == "pick_list" || fieldTypeId == "multi_select" || fieldTypeId == "radio" || fieldTypeId == "checkbox") ? true : false, //NO I18N
                'refer_field_for': { for: "asset" },// No I18N
                "showPIIField": false, //No I18N
                "sendDefValue": true, //NO I18N
                "showEncryptField": fieldTypeId == 'single_line' || fieldTypeId == 'multi_line'//No I18N
            }
        },
        udffieldEntities(cntrl, popup_action, fieldInfo) {
            return {
                field_name_length: "50",//No I18N
                showPIIField: false,
                fieldKey: (popup_action == 'newField') ? true : false, //No I18N
                saveCloseBtn: true, 
                helpContent: true,
                showEncryptField: (popup_action == 'newField') ? true : false,//No I18N
                disable_defval: (fieldInfo.display_type == "decimal" || fieldInfo.display_type == "date/time") ? true : false, //NO I18N
                helpContentTemplate: true,
                saveAndAddBtn:true
            };
        }
    },
    "department": { //No I18N
        udffieldEntities(cntrl, popup_action) {
            return {
                fieldKey: (popup_action == 'newField') ? true : false, //No I18N
                helpContentTemplate: false
            }
        }
    },
    "support_group": { //No I18N
            udffieldEntities(cntrl, popup_action) {
                return {
                    //sd-129782
                    showPIIField: true,
                    fieldKey: (popup_action == 'newField') ? true : false, //No I18N
                    helpContentTemplate: false
                }
            }
        }
};
