// $Id$

/* Vendor slider Action starts */

var $vendorPopup = {
    /** To fetch metainfo for currency and vendor
      * @param {string} module
    */
    fetchMetaData: function(module){
        sdpAjax({
            url: "/api/v3/"+encodeURIComponent(module)+"/_metainfo", // No I18N
            success: function(resp) {
                if(module === "vendors"){
                    $vendorPopup.metaData = resp.metainfo;
                }
                else {
                    $currencyPopup.metaData = resp.metainfo;
                }
            },
            failedCallBack : function(resp){
                var responseText = resp.responseJSON.response_status;
                    if(responseText.status_code === 4000) {
                        window.location.href = "/jsp/AuthError.jsp?ErrorMsg=sdp.admin.invalidparam";
                    } else if(responseText && responseText.messages && responseText.messages[0].message){
                        showalert('failure', e_html(responseText.messages[0].message),"isAutoHide=false,delay=5"); // No I18N
                        isValidEntity = false;
                    }
            },
            async:false
        });

    },

    /** To load vendor slider
      * @param {string} key
    */
    load: function(key){
        let opts = {
            title: translate("ae.vendor.add.form.title"),   //No I18N
            width: "1000px",//No I18N
            minimizable:false,
            closeOnEscKey: false,
            draggable: false,
            resizable: true,
            height: jQuery(window).height(),
            custom_options: {
                slider: true,
            }
        };
        jQuery("#"+key).sdp_zcomponent_dialog(opts);
    },

    /** To cancel vendor add form
      * @param {}
    */
    cancel: function() {
        jQuery('#vendor-container').sdp_zcomponent_dialog('close'); // No I18N
    },

    /** To open vendor add form
      * A function, to open vendor add form with sections
      * @param {string} module
    */
    open: function(module,fieldData){
        var vendorView =[
            {
                "name" : translate("sdp.purchase.addNew.general.vendorDetail"), //No I18N
                "fields" : { //No I18N
                    "name" : {"autocomplete": "off"}, //No I18N
                    "currency" : {}, //No I18N
                    "description":{"autocomplete": "off"}, //No I18N
                    "contact_person":{"autocomplete": "off"}, //No I18N
                }
            },{
                "name" : translate("sdp.about.vendorinfo.address"), //No I18N
                "fields" : { //No I18N
                    "door_no":{"autocomplete": "off"}, //No I18N
                    "street":{"autocomplete": "off"}, //No I18N
                    "landmark" : {"autocomplete": "off"}, //No I18N
                    "city" : {"autocomplete": "off"}, //No I18N
                    "postal_code" : {"autocomplete": "off"}, //No I18N
                    "state" : {"autocomplete": "off"}, //No I18N
                    "country" : {"autocomplete": "off"}, //No I18N
                }
            },{
                "name" : translate("sdp.admin.orgrole.contactinfo"), //No I18N
                "fields" : { //No I18N
                    "phone" : {"autocomplete": "off"}, //No I18N
                    "fax" : {"autocomplete": "off"}, //No I18N
                    "email_id" : {"autocomplete": "off"}, //No I18N
                    "web_url" : {"autocomplete": "off"} //No I18N
                }
            },{
                "name": translate("sdp.inventory.mapfields.additionaldetails"), //No I18N
                "fields":{ //No I18N
                 "vendor_udf_fields":{}, //No I18N
                }
            }
        ];
        $vendorPopup.fetchMetaData("vendors");//No I18N
        var formData = vendorView;
        var template = $vendorPopup.buildLayout(formData, $vendorPopup.metaData.fields);
        var configJSON = {
            name: "vendor", // No I18N
            entity: "vendor", // No I18N
            entitypath: "vendor", // No I18N
            entitydata: null,
            template: template,
            metadata: jQuery.extend(true, {}, $vendorPopup.metaData),
            mode: "new", // No I18N
            container: "vendor-container", // No I18N
            formid: "vendor_popup", // No I18N
            edit:{
                fields:{
                    currency:{
                        search_keys: ["name", "code"],//No I18N
                        formatResult:function(data){
                            return '<span>'+e_html(data.name)+' - '+e_html(data.code)+'</span>';
                        },
                        processResults: function(cacheData, data) {
                            cacheData.push({id: data.id, name: data.name, code: data.code,symbol:data.symbol});
                        },
                       formatSelection: function(data) {
                            return '<span>'+e_html(data.name)+' - '+e_html(data.code)+'</span>';
                        }
                    }
                }
            },
            save: {
                url: "/api/v3/vendors",	//No I18N
                submit: true,
                success: function (response) {
                    showalert("success", translate("sdp.admin.common.addedsuccessfully"), "isAutoHide=true"); // No I18N
                    $vendorPopup.cancel();
                    if($vendorPopup.fieldData !== undefined ){
                        $vendorPopup.fieldData.data("sdp_select2").cache = {};//No I18N
                        $vendorPopup.fieldData.select2('data', response.vendor).trigger('change');//No I18N
                    }
                    else{
                        jQuery("#vendorID").append("<option value='" + Number(response.vendor.id) + "'>" + e_html(response.vendor.name) + "</option>");
                        jQuery("#vendorID").val(response.vendor.id).change();
                    }
                },
                submitbutton: {
                    add: window.translate("common.add"),	//No I18N
                },
                cancel: "$vendorPopup.cancel", //No I18N
            },
            afterRenderCallback: function () {
                if ( "false" === isMDHSetup && sdp_user.ROLES.includes('SDAdmin')){
                    jQuery("#currency_control").parent().append('<button title="'+translate("ae.addNewCurrency.popup.title")+'" dropdown-field="currency"   id="addcurrency_form" class="btn fr btn-default btn-xs " data-ele="addlNewBtn" data-route="currency" type="button"><span class="common-sprite icon-xs common-add-icon2 vtop top3"></span></button>');
                    jQuery("#currency_control").addClass('disp-ib').removeClass("fw").css("width", "calc(100% - 40px)"); //No I18N
                    jQuery("#addcurrency_form").off('click').on('click', function(){ //No I18N
                        $currencyPopup.open();
                   })

                }
            }
        };
        if(jQuery("#vendor-container").length != 0) { //No I18N
        jQuery("#vendor-container").remove(); //No I18N
        }
        jQuery("body").append('<div id="vendor-container"></div>'); //No I18N
        $vendorPopup.FC = new FC(configJSON);
        $vendorPopup.module = module;
        $vendorPopup.fieldData = fieldData;
        $vendorPopup.load("vendor-container"); //No I18N
    },

    /** To build layout for vendor
      * A function, to build layout that contains two columns and rows according to the fields in section.
      * @param {JSON,JSON} form_fields, meta_info
    */
    buildLayout: function(form_fields, meta_info){
        var resp_obj = {},  metainfo_Obj = {}, sections = [];
        for(var i=0; i < form_fields.length;i++){
            var sectionFields = form_fields[i].fields;
            var sec_col = sec_row = 1;
            var section ={};
            section.position = {"col" : sec_col, "row" : sec_row}; // No I18N
            section.name = form_fields[i].name;
            section.field_align = "left-right"; // No I18N
            section.column_count = 2;
            var fields = [];
            var fld_col = fld_row = 1;
            var sectionFieldsArray = Object.keys(sectionFields);
            var sectionFieldsCnt = sectionFieldsArray.length;
            for(var j=0; j < sectionFieldsCnt;j++){
                var fieldName = sectionFieldsArray[j];
                var value = sectionFields[fieldName];
                var field_metainfo = meta_info && meta_info[fieldName];
                if(field_metainfo && field_metainfo.type == "udf"){ // No I18N
                    var flds = field_metainfo.fields;
                    if(!jQuery.isEmptyObject(flds)){
                        var fieldsArray = Object.keys(flds);
                        var fieldsCnt = fieldsArray.length
                        fields1 = [];
                        for(var key=0; key < fieldsCnt;key++){
                          field = flds[fieldsArray[key]];
                          fields1[field.id] = fieldsArray[key];
                        }
                        fieldsArray.clear();
                        for(var key in fields1){
                           if(fields1.hasOwnProperty(key)){
                               fieldsArray.push(fields1[key]);
                           }
                        }
                        for(var k=0; k < fieldsCnt;k++){
                            var subfield_name = fieldsArray[k];
                            var field = flds[subfield_name];
                            field.position = { "col": fld_col, "row": fld_row }; // No I18N
                            field.name = subfield_name;
                            field.context = fieldName;
                            if(!field.fieldname){
                                field.fieldname = subfield_name;
                            }
                            fields.push(field);
                            if(fld_col == section.column_count) {
                                fld_col = 1;
                                fld_row +=1;
                            }else{
                                fld_col += 1;
                            }
                            metainfo_Obj[fieldName+"."+subfield_name] = field;
                        }
                    }
                }else{
                    var field = value;
                    field.position = { "col": fld_col, "row": fld_row }; // No I18N
                    field.name = fieldName;
                    if(field_metainfo){
                        jQuery.extend(field,field_metainfo);
                    }
                    else if(field.frommeta == true){
                        field.default_hide = true;
                    }
                    fields.push(field);
                    if(fld_col == section.column_count) {
                        fld_col = 1;
                        fld_row +=1;
                    }else{
                        fld_col += 1;
                    }
                    metainfo_Obj[fieldName] = field;
                }
                section.fields = fields;
                sec_row++;
            }
            section.name = form_fields[i].name;
            section.column_count = 2;
            section.style_properties = {"field_style":{"field_align":"top"}}; //NO I18N
            sections.push(section);
        }
        var layout = {};
        layout.sections = sections;
        resp_obj.layouts = [layout];
        return resp_obj;
    },
}

/* vendor slider action ends */

/* currency popup action starts */
var $currencyPopup={

    /** To load currency popup
      * @param {string} module
    */
    load: function(key) {
        jQuery('#'+key).dialog({
            title:translate("ae.addNewCurrency.vendorPopup.lable"),
            modal:"true",
            resizable: false,
            width: "500px",  // No I18N
        });
    },

    /** To cancel currency add form
      * @param {}
    */
    cancel: function() {
       jQuery('#currency-container').dialog("destroy"); // No I18N
       jQuery('#currency-container').remove();
    },

    /** To open currency add form
      * A function, to open currency add form with sections
      * @param {}
    */
    open: function(){
        var symbol ='';
        var currencyView = [{
            "fields":{ //No I18N
                "name":{}, //No I18N
                "symbol":{}, //No I18N
                "exchange_rate":{} //No I18N
            }
        }];
        $vendorPopup.fetchMetaData("currencies");//No I18N
        $currencyPopup.metaData.fields.name = {
            "display_name":translate("ae.currency.currencyName"), //No I18N
            "type": "lookup", //No I18N
            "href" : "/currencies", //No I18N
            "read_only": false, //No I18N
            "entity_name":"currencies", //No I18N
            "list_info":{"filter_by": {"name": "Others"},"sort_order":"asc","sort_field":"name"}, //No I18N
            "mandatory": true, //No I18N
            search_keys: ["name", "code"],//No I18N
            formatResult:function(data){
                return '<span>'+e_html(data.name)+' - '+e_html(data.code)+'</span>';
            },
            processResults: function(cacheData, data) {
                cacheData.push({id: data.id, name: data.name, code: data.code,symbol:data.symbol});
            },
            formatSelection:function(data){
                jQuery("#for_symbol").val(data.symbol).trigger("change");
                jQuery("#for_exchange_rate").val("0.0");
                return '<span>'+e_html(data.name)+' - '+e_html(data.code)+'</span>';
            }
        }
        $currencyPopup.metaData.fields.exchange_rate.constraints.min_greater = "0";
        var template = $currencyPopup.buildLayout(currencyView,$currencyPopup.metaData.fields);
        var configJSON = {
            name: "currency",// No I18N
            entity: "currency",// No I18N
            entitypath: "currency",// No I18N
            entitydata: null,
            template: template,
            metadata: jQuery.extend(true, {}, $currencyPopup.metaData),
            mode: "edit",    // No I18N
            container: "currency-container",// No I18N
            formid: "currecny_popup",// No I18N
            disableSaveBtn : true,
            save: {
                url: "/api/v3/currencies",	//No I18N
                submit: true,
                success: function (response) {
                    showalert("success", translate("sdp.admin.common.addedsuccessfully"), "isAutoHide=true"); // No I18N
                    $currencyPopup.cancel();
                    var currency = jQuery("#currency_control").find('[name="currency"]'); // No I18N
                        currency.data("sdp_select2").cache = {}; // No I18N
                        currency.select2('data', response.currency).trigger('change'); // No I18N
                },
                submitbutton: {
                    add: window.translate("common.add"),	//No I18N
                    edit: window.translate("common.save")	//No I18N
                },
                cancel: "$currencyPopup.cancel", // No I18N
                serializer:function(data,FC){
                    FC.options.save.url = "/api/v3/currencies/" +Number(data.currency.name.id); //No I18N
                }
            },
            afterRenderCallback: function () {
                jQuery(".fafr-label").css('width',185+"px"); //No I18N
                jQuery("#currency-container").dialog("option", "position", { my: "center", at: "center", of: window }); //No I18N
            }
        };
        if(jQuery("#currency-container").length != 0) { //No I18N
            jQuery("#currency-container").remove(); //No I18N
        }
        jQuery("body").append('<div id="currency-container"></div>'); //No I18N
        $currencyPopup.FC = new FC(configJSON);
        $currencyPopup.load("currency-container"); //No I18N
    },

    /** To build layout for currency
      * A function, to build layout that contains one column and rows according to the fields in section.
      * @param {JSON,JSON} form_fields, meta_info
    */
    buildLayout:function(form_fields, meta_info){
        var resp_obj = {}, metainfo_Obj = {}, sections = [];
        for(var i=0; i < form_fields.length;i++){
            var sectionFields = form_fields[i].fields;
            var section ={};
            section.name = form_fields[i].name;
            section.column_count = "1";
            section.field_align = "left"// No I18N
            var fields = [];
            var sectionFieldsArray = Object.keys(sectionFields);
            var sectionFieldsCnt = sectionFieldsArray.length;
            for(var j=0; j < sectionFieldsCnt;j++){
                var fieldName = sectionFieldsArray[j];
                var value = sectionFields[fieldName];
                var field_metainfo = meta_info && meta_info[fieldName];
                var field = value;
                field.name = fieldName;
                field.position = { "col": 1};
                if(field_metainfo){
                    jQuery.extend(field,field_metainfo);
                }
                else if(field.frommeta == true){
                    field.default_hide = true;
                }
                fields.push(field);
                metainfo_Obj[fieldName] = field;
                section.fields = fields;
            }
            section.name = form_fields[i].name;
            sections.push(section);
        }
        var layout = {};
        layout.sections = sections;
        resp_obj.layouts = [layout];
        return resp_obj;
    }
}
/* currency popup action ends */

