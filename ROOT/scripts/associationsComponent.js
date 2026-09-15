var $associations = {
    destination_filter: [],
    // initializes the component with required options containing container, module, module_id, entity_name, display_name, is_trashed.
    init: function(options) {
        var _self = this;
        _self.options = options;
        // getting the association summary of that module/module_id.
        sdpAjax({
            async: false,
            url: "/api/v3/" + options.module + "/" + options.module_id + "/association_summary", // NO I18N
            success: function(resp) {
                var associations = resp.association_summary;
                _self.constructAssociations(associations);
            }
        });
    },
    constructAssociations: function (associations) {
        var _self = this;
        associations.forEach(assoc =>{
            assoc.table_holder = assoc.association_field.replaceAll(" ","_");
        });
        _self.associations = associations;
        if(_self.options && _self.options.custom_options && typeof _self.options.custom_options.associations_template == "function") {
            for(var i=0; i<_self.associations.length; i++) {
                _self.initializeTable(_self.associations[i].association_field, false);
            }
            _self.options.custom_options.associations_template(_self, _self.associations);
        } else {
            // rendering the associations collapsible panels structure.
            renderhbs("#"+_self.options.containerId, "associations_template", {"associations" : associations, printmode: _self.options.is_printmode}, false, "common", null, false, function(){
                 // click event to open associations map.
                 jQuery("#assoc_map").off("click.association_map").on("click.association_map", function(){ //No I18N
                    $associations.viewAssociationMap();
                 });
             });

            // for each panel we are creating an click event, so that particular associations data will be loaded.
            associations.forEach(assoc =>{
                jQuery("#" + assoc.association_field + "_toggle").parent().on("click", function (params) {
                    _self.initializeTable(assoc.association_field, true);
                })
            });

            $associations.searchedTable = associations[0].association_field; // when search field or sort field are present we will make use of searchedTable, since first association will be opened by default we are setting that associations_field as searched.
                const toggleField = _self.options.is_printmode ? associations.map(assoc => assoc.association_field) : (associations[0] && associations[0].association_field ? [associations[0].association_field] : []);

            toggleField.forEach(field => {
                if (field) jQuery(`#${field}_toggle`).click();
            });
        }
    },
    // clicked associations required json will get constructed and TC will be initialized.
    initializeTable: function(expandedAssociation, rendertable){
        if(jQuery("#webc-" + expandedAssociation).length){
            return;
        }
        var _self = this;
        var selectedAssociation = _self.associations.find(assoc => assoc.association_field == expandedAssociation);
        _self.getMetainfo(selectedAssociation);
        selectedAssociation.associationType = (selectedAssociation.metaInfo.fields.cardinality == "many_to_many" || selectedAssociation.metaInfo.fields.cardinality == "one_to_many") ? "checkbox" : "radio"; //No I18N
        selectedAssociation.api_plural_name = selectedAssociation.metaInfo.plural_name;
        selectedAssociation.api_singular_name = selectedAssociation.metaInfo.entity;
        selectedAssociation.hasUdfFields = (Object.keys(selectedAssociation.metaInfo.fields.udf_fields.fields).length > 0);
        selectedAssociation.associate_url = selectedAssociation.metaInfo.fields.destination.href.replace("/","");
        selectedAssociation.associated_url = _self.options.module + '/' + _self.options.module_id + '/'  + selectedAssociation.association_field;
        selectedAssociation.dissociate_url = _self.options.module + '/' + _self.options.module_id + '/'  + selectedAssociation.association_field;
        selectedAssociation.associated_entity_key = selectedAssociation.association_field;
        selectedAssociation.associate_entity_key = (selectedAssociation.metaInfo.fields.destination.href.indexOf("/destination") != -1) ? "destination" : "source"; //No I18N
        _self.formatMetaInfoFields(selectedAssociation.metaInfo);
        selectedAssociation.fields_required = Object.keys(selectedAssociation.metaInfo.metaDatafields);
        jQuery("#" + expandedAssociation + "_content").html('<div id="'+selectedAssociation.table_holder+'"></div>');
        if(rendertable) {
            _self.initModuleComponent(selectedAssociation);
        }
    },
    // initializing the selected Association's TC using MC with required options.
    initModuleComponent: function (association) {
        var _self = this;
        var ass = association;
        var commonjson = {
                "container": document.getElementById(ass.table_holder),//Base element to render content //No I18N
                "mode": "list",//List/Form(add/edit),Details page //No I18N
                "name": ass.associated_entity_key, //No I18N
                "entity_name": ass.associated_entity_key, //No I18N
                "display_name": "",//Module name //No I18N
                "scrolltotop": false, //No I18N
                //"scrolltoelement": true, //No I18N
                "list": { //No I18N
                    "meta": {//No I18N

                      "view": "table",//Listview view type "table/classic" //No I18N
                      "getmetainfo": "false", //No I18N
                        "header": {//No I18N
                            "actions": { //No I18N
                              "bulk_selection": { //No I18N
                                "enable": true //No I18N
                              },
                              "custom_action_1": { //No I18N
                                "enable": true, //No I18N
                                "custom_class": "fl mr10", //No I18N
                                "renderhtml": '<button id="' + association.table_holder + '_associate" class="btn btn-default btn-sm fl mr10" type="button" title="' + translate("sdp.common.records",[translate("sdp.common.associate")]) + '" aria-label="Associate" data-no-records-hide="'+ass.associated_entity_key+'_list" data-non-action="'+ass.associated_entity_key+'_list" data-cs-field="associate">' + translate("sdp.common.associate") + '</button>', // custom button for association. //No I18N
                              },
                              "custom_action_2": { //No I18N
                                "enable": true, //No I18N
                                "custom_class": "fl mr10", //No I18N
                                "renderhtml": '<button id="' + association.table_holder + '_dissociate" class="btn btn-default btn-sm fl mr10" type="button" title="' + translate("sdp.common.records",[translate("sdp.common.dissociate")]) + '" aria-label="Dissociate" data-no-records-hide="'+ass.associated_entity_key+'_list" data-link="'+ass.associated_entity_key+'_list" data-cs-field="dissociate">' + translate("sdp.common.dissociate") + '</button>', // custom button for dissociation. //No I18N
                              },
                              "t_searchicon": { //No I18N
                                "enable": (association.associationType == "checkbox"), // when associationtype is radio only one record can be associated, hence no need of search in that case. //No I18N
                                "custom_class": "fl", //No I18N
                              },
                              "t_column_choos": { //No I18N
                                "enable": ass.hasUdfFields, // column chooser will be shown only if association additional fields are present,in other cases column chooser will be empty hence disabling. //No I18N
                                "custom_class": "fl" //No I18N
                              },
                              "pagination_comp": {//No I18N
                                "enable": (association.associationType == "checkbox"), // when associationtype is radio only one record can be associated, hence no need of pagination in that case. //No I18N
                                "custom_class": "btn-group"//No I18N
                              },
                            },
                        },
                        "additional_options": {//No I18N
                            "get_total_count" : false, // NO I18N
                            "personalize_key": ass.table_holder+"_table_listview", //No I18N
                            "callback-url": ass.associated_url, //No I18N
                            "row_inputdata": "$associations.row_inputdata", //No I18N
                            "callback-rowfunction": "$associations.row_inputdata", //No I18N
                            "other-options": "$associations.getOtherOptions", //No I18N
                            "height": "fx:$associations.setHeight", //No I18N
                            "width": "fx:$associations.setWidth", //No I18N
                        },
                        /** Column list **/
                        "cells": {//No I18N
                            "static_cells": { //No I18N
                              "checkbox": window.printmode ? false : true, //No I18N
                              //"edit": true, //No I18N
                            },
                            "fields_required": {} //No I18N
                        },
                    },
                    "options": { //No I18N
                        "component": { //No I18N
                            "callback": { //No I18N
                                "post": function(tableinfo) {
                                    var table_holder = (tableinfo.options && tableinfo.options) ? tableinfo.options.container : "#"+tableinfo.container.id;
                                    var table_name = (tableinfo.options && tableinfo.options) ? tableinfo.options.name : tableinfo.name;
                                    // click event to open associate popup.
                                    jQuery(table_holder + "_associate").off("click.association_associate").on("click.association_associate", function(){ //No I18N
                                        $associations.openAssociations(table_name + "_list");
                                    });

                                    // click event for dissociating records.
                                    jQuery(table_holder + "_dissociate").off("click.association_dissociate").on("click.association_dissociate", function(){ //No I18N
                                        $associations.dissociateRecords(table_name, table_name);
                                    });

                                    // click events for editing additional fields of each record.
                                    jQuery("[data-edit='" + table_holder.replace("#","") +"']").each(function(){
                                        var child = jQuery(this).children();
                                        var id = jQuery(child).attr("data-id");
                                        jQuery(child).off("click.association_form").on("click.association_form", function(){ //No I18N
                                            $associations.editUdfFields(table_holder.replace("#",""), id);
                                        });
                                    });

                                    // click event for catching latest clicked table
                                    jQuery(table_holder + "_content").off("click.association_selected").on("click.association_selected", function(){ //No I18N
                                        $associations.tableClicked(table_holder.replaceAll("#", ""));
                                    });

                                    // click event for catching latest searched table
                                    jQuery("#t_searchicon_" + table_holder.replaceAll("#","") + "_list").off("click.association_searched").on("click.association_searched", function(){ //No I18N
                                        event.stopPropagation();
                                        $associations.searchClicked(table_name);
                                    });
                                } //No I18N
                            }
                        }
                    }
                },
            };
            //commonjson.list.fields_required
            var fieldobj = {};
            let primary_fieldinfo = $MC.getprimaryfieldvalue(ass.metaInfo.fields.primary_field,ass.metaInfo.fields);
            if(!window.printmode) {
                if(ass.metaInfo.fields.cardinality == "one_to_one" || ass.metaInfo.fields.cardinality == "many_to_one") {
                    delete commonjson.list.meta.cells.static_cells;
                    fieldobj["select_radio"] = {
                        "type": "radio", //No I18N
                        "default": "true", //No I18N
                        "render": "$associations.constructRadioButton" //No I18N
                    };
                }
                if(ass.hasUdfFields && (ass._links.indexOf("put") != -1)){
                    fieldobj["editRow"] = {
                        "data-assoc": ass.table_holder, //No I18N
                        "type": "icon", //No I18N
                        "render": "$associations.constructEditRow", //No I18N
                        "default": "true", //No I18N
                        "searchable": "false" //No I18N
                    };
                }
                fieldobj["newtablink"] = { //No I18N
                    "type": "icon", //No I18N
                    "render": "$associations.constructNewTabIcon", //No I18N
                    "default": "true", //No I18N
                    "searchable": "false" //No I18N
                };
            }
            for(var i=0; i<ass.fields_required.length; i++) {
                if (i === 25) {
                    break;
                }
                if(ass.fields_required[i] !== "cm_fields"){
                    var fieldmeta = ass.metaInfo.fields.udf_fields && ass.metaInfo.fields.udf_fields.fields[ass.fields_required[i]] ? ass.metaInfo.fields.udf_fields.fields[ass.fields_required[i]] : {};
                    if(!jQuery.isEmptyObject(fieldmeta) && (fieldmeta.display_type == "Attachment")) {
                        fieldobj[ass.fields_required[i]] = {
                            "name": ass.fields_required[i],
                            "render": "$associations.constructCellDataAttach", //No I18N
                            "width": "200px", //No I18N
                            "sortable" : false,
                        };
                    } else {
                        fieldobj[ass.fields_required[i]] = {
                            "name": ass.fields_required[i],
                            "render": "$associations.constructCellData", //No I18N
                            "sortable" : (association.associationType == "checkbox"), // when associationtype is radio only one record can be associated, hence no need of sort in that case.
                        };
                        if(primary_fieldinfo.field == ass.fields_required[i]) { // primary field is default in table, will not be shown in column chooser as well to remove from table.
                            fieldobj[ass.fields_required[i]].default = true;
                        }
                    }
                }
            }
            commonjson.list.meta.cells.fields_required = fieldobj;
            cm = new MC(commonjson);
            // disabling the associate button for one-to-one and many-to-one association types because only one record can be associated or if record is trashed we cannot associate new record or if user doesn't have add permission.
            if((association.associationType && association.associationType == "radio" && association.count > 0) || _self.options.is_trashed || (association._links.indexOf("post") == -1)){
                jQuery("#" + association.table_holder + "_associate").prop("disabled", true);
            }
            if(association._links.indexOf("delete") == -1){
                jQuery("#" + association.table_holder + "_dissociate").prop("disabled", true);
            }
    },
    // gets metainfo of the association.
    getMetainfo : function(associationData){
        var _self = this;
        sdpAjax({
            async: false,
            url: "/api/v3/" + _self.options.module + '/' + _self.options.module_id + '/'  + associationData.association_field + '/_metainfo', // NO I18N
            success: function(resp) {
                associationData.metaInfo = resp.metainfo;
            }
        });
        sdpAjax({
            async: false,
            url: "/api/v3/" + _self.options.module + '/' + _self.options.module_id + '/'  + associationData.association_field + '/_links', // NO I18N
            success: function(resp) {
                associationData._links = _self.processLinks(resp._links);
            }
        });
    },
    // function to process links to processable format.
    processLinks: function(_links){
        var links = [];
        _links.forEach(link =>{
            links.push(link.method);
        });
        return links;
    },
    // render function to construct editUDFFields icon.
    constructEditRow: function(tdata){
        return '<div data-edit="' + tdata.head_data.dataAssoc + '" class="right0 top0 p5 pr5 disp-ib"><a data-id="' + tdata.row_data.id + '" class="cspr flat icon-sm tc-edit cur-ptr" title="' + translate('common.edit') + '" rel="uitip"></a></div>';
    },
    // when edit icon is clicked, that particular row's udf fields edit form will be initialized in popup.
    editUdfFields : function(table_holder, dataId){
        var _self = this;
        var selectedAssociation = _self.associations.find(assoc => assoc.table_holder == table_holder);
        var tableObj = WebComponents.instancePool["webc-" + table_holder]; //No I18N
        var selectedRecord = tableObj.visibleContents.find(row => row.id == dataId);
        //form layout
        var udffields = selectedAssociation.metaInfo.fields.udf_fields;
        var form_udffields = [];
        if(udffields.fields) {
            var i = 1;
            for(var key in udffields.fields){
                form_udffields.push({
                    "name": key, //No I18N
                    "position": { //No I18N
                        "col": 1, //No I18N
                        "col_size": 12, //No I18N
                        "row": i //No I18N
                    },
                    "mandatory": false, //No I18N
                    "context": "udf_fields", //No I18N
                });
                i++;
            }
        }

        var template = {
            "layouts": [{ //No I18N
                "name": "form", //No I18N
                "sections": [{ //No I18N
                    "is_common": false, //No I18N
                    "form_type": "none", //No I18N
                    "column_count": "1", //No I18N
                    "name": "-1", //No I18N
                    "collapsed_state": "none", //No I18N
                    "position": { //No I18N
                        "col": 1, //No I18N
                        "row": 2 //No I18N
                    },
                    "fields": form_udffields //No I18N
                }]
            }]
        };
        var rdata;
        sdpAjax({
            "url": "/api/v3/"+ selectedAssociation.associated_url + "/" + dataId, //No I18N
            async: false,
            success: function(resp) {
                var data = resp[selectedAssociation.metaInfo.entity];
                rdata = data;
            }
        });
        var metadata = {
            "container": "detailstempform", //No I18N
            "mode": "edit", //No I18N
            "name": "detailsadmintempform", //No I18N
            "formid": "detailsadmintempform", //No I18N
            "entity": selectedAssociation.associated_url, //No I18N
            "entityName": translate("common.association"), //No I18N
            "parentKey": selectedAssociation.association_field, //No I18N
            "layouts": template.layouts, //No I18N
            "template": template, //No I18N
            "metadata": selectedAssociation.metaInfo, //No I18N
            "save": { //No I18N
                "entity": selectedAssociation.metaInfo.entity, //No I18N
                "exit_alert": false, //No I18N
                "submit": true, //No I18N
                "url":"/api/v3/" + _self.options.module + "/" + _self.options.module_id + "/" + selectedAssociation.association_field + "/" + selectedRecord.id, //No I18N
                "submitbutton": { //No I18N
                    "add": translate("common.save"), //No I18N
                    "edit": translate("common.update"), //No I18N
                },
                "onsubmit": "$associations.submitPopup", //No I18N
                "cancel": "$associations.closePopup", //No I18N
            },
            "entitydata": rdata, //No I18N
            "disableFieldOnly": true, //No I18N
        };



        jQuery("#" + _self.options.containerId).append("<div id='associations_popup_form'></div>");
        let doptions = _self.associationzdialog();
        let coption = {
            title: selectedAssociation.display_name,
            open: function(ui, $this) {
                jQuery(ui.ui.container).find(".zdialog__content").html('<div id="detailstempform" class="pt15"></div>');
                $associations.popupformsubmit = false;
                setTimeout(function() {
                    new FC(metadata);
                },100)
            },
            close: function() {
                if($associations.popupformsubmit) {;
                    let mapper = selectedAssociation.table_holder;
                    if(MC_Mapper['module_'+mapper]) {
                        MC_Mapper['module_'+mapper].components.list.tableComp.refreshTable();
                    }
                }
            },
            width: 920,
        };
        jQuery("#associations_popup_form").sdp_zcomponent_dialog(Object.assign(doptions,coption));
    },
    // when editudf popup is submitted, we will close the popup and refresh the table for updated data.
    submitPopup: function(opt) {
        if(!jQuery.isEmptyObject(opt.getChangedValues()) && opt.validateForm()) {
            $associations.popupformsubmit = true;
            jQuery("#associations_popup_form").sdp_zcomponent_dialog("close"); //No I18N
        }
    },
    // when cancel button is clicked in editudf popup, we need to close the popup.
    closePopup: function(a,b,c){
        jQuery("#associations_popup_form").sdp_zcomponent_dialog("close"); //No I18N
    },
    // callback function to construct attachment cell data.
    constructCellDataAttach: function(table_data){
        var field = table_data.head_data.id;
        var data = table_data.row_data;
        var value;
        if (~(field).indexOf('.')) {
            value = table_comp.getFieldsRequiredByString(data, field); // if field is like destination.cm_fields.sline, "getFieldsRequiredByString" will iterate through field path destination, cm_fields and fetch value.
        } else if(data.destination && data.destination[field]) {
            value = data.destination[field] || "-";
        }
        else if(data.udf_fields && data.udf_fields[field]) {
            value = data.udf_fields[field] || "-";
        }
        else if(data[field]) {
            value = data[field] || "-";
        }
        else {
            value = "-";
        }
        if(value != "-" && table_data.head_data.display_type){
            var id = "cm_fields_"+table_data.head_data.id + "_" +data.id+ "_view"; //No I18N
            let desc = '';
            if(value.destination) {
                desc = 'data-attach-description="'+e_html(value.description)+'"';//No I18N
            }
            value = '<div id="'+id+'" class="pt5 pb5" data-attach-component=true><button type="button" data-href="'+value.content_url+'" data-attach-size="'+value.size.display_value+'" id="'+value.id+'" data-attach-id="'+value.id+'" '+desc+' data-attach-by="'+value.attached_by.name+'" data-attach-on="'+value.attached_on.display_value+'">'+e_html(value.name)+'</button></div>';
        }
        return value;
    },
    // callback function to construct non-attachment cell data.
    constructCellData: function(table_data){
        var field = table_data.head_data.id;
        var data = table_data.row_data;
        var value;
        if (~(field).indexOf('.')) { // if field is like destination.cm_fields.sline, "getFieldsRequiredByString" will iterate through field path destination, cm_fields and fetch value.
            value = table_comp.getFieldsRequiredByString(data, field);
            if(!value) {
                value = table_comp.getFieldsRequiredByString(data.destination, field);
            }
        }
        if(!value){
            if(data.destination && Object.keys(data.destination).indexOf(field) != -1) {
                value = data.destination[field] || "-";
            }
            else if(data.udf_fields && Object.keys(data.udf_fields).indexOf(field) != -1)
            {
                value = data.udf_fields[field] || "-";
            }
            else if(data.destination && data.destination.cm_fields && Object.keys(data.destination.cm_fields).indexOf(field) != -1)
            {
                value = data.destination.cm_fields[field] || "-";
            }
            else if(data[field])
            {
                value = data[field] || "-";
            }
            else
            {
                value = "-";
            }
        }
        // fix for boolean if value is false.
        if(value == "-" && (table_data.head_data.display_type.toLowerCase() == "bool" || table_data.head_data.display_type.toLowerCase() == "boolean")){
            var udf_fields = Object.keys(data.udf_fields);
            var destination_fields = Object.keys(data.destination);
            var destination_cm_fields = [];
            if(data.destination.cm_fields){
                destination_cm_fields = Object.keys(data.destination.cm_fields);
            }
            if(udf_fields.indexOf(field) != -1){
                value = data.udf_fields[field];
            }
            else if(destination_fields.indexOf(field) != -1){
                value = data.destination[field];
            }
            else if(destination_cm_fields.indexOf(field) != -1){
                value = data.destination.cm_fields[field];
            }
        }
        if(value != "-" && table_data.head_data.display_type){
            if(table_data.head_data.display_type == "Radio" || table_data.head_data.display_type == "Pick List"){
                value = value.name;
            }
            else if(table_data.head_data.display_type == "Date" || table_data.head_data.display_type == "Date/Time"){
                value = value.display_value;
            }
            else if(table_data.head_data.display_type == "Color"){
                value = '<button type="button" rel="uitip" class="disp-ib img-circle table-bordered clr-picker" nonce="' + sdpNonce + '" data-style="height: 25px;width: 25px;background: '+ value + ';" tabindex="3"></button>'; //No I18N
            }
            else if(table_data.head_data.display_type.toLowerCase() == "bool" || table_data.head_data.display_type.toLowerCase() == "boolean"){ //changing value from true/false to yes/no.
                if(value == true){
                    value = "Yes";
                }else{
                    value = "No";
                }
            }
        }
        if(table_data.head_data.display_type == "Color"){
            return value;
        } else {
            return '<span rel="uitip" mode_ellipsis="true" mode_html="true" title="'+e_html(e_attr(value))+'">'+e_html(value)+'</span>';
        }
    },
    // if the associatio type is one-to-one or many-to-one, radio button has to be constructed instead of checkbox.
    constructRadioButton: function(table_data){
        return '<input type="radio" value=' + table_data.row_data.id + ' data-table-radio name="select_radio" data-table-checkbox class="non-form-field">';
    },
    // when search clicked in any table, we will store the clicked table data for processing the input data.
    searchClicked: function(associate_key){
        var _self = this;
        _self.searchedTable = associate_key;
    },
    // when any table is clicked, we will store the clicked table data for processing the input data.
    tableClicked: function(associate_key){
        var _self = this;
        var assoc = _self.associations.find(asso => asso.table_holder == associate_key);
        _self.searchedTable = assoc.association_field;
    },
    // callback for constructing input_data for associated records table.
    row_inputdata: function(tableInfo){
        var row_inputdata = {};
        /*if(tableInfo.list_info.sort_field){
            delete tableInfo.list_info.sort_field;
        }*/
        if(typeof tableInfo.column_order == "string") {
            tableInfo.column_order = JSON.parse(tableInfo.column_order);
        }
        row_inputdata.list_info = tableInfo.list_info;
        return row_inputdata;
    },
    // callback for constructing input_data for associate records table.
    popup_row_inputdata: function(tableInfo){
        var row_inputdata = {};
        if(typeof tableInfo.column_order == "string") {
            tableInfo.column_order = JSON.parse(tableInfo.column_order);
        }
        delete tableInfo.list_info.has_more_rows;
        delete tableInfo.list_info.total_count;
        row_inputdata.list_info = tableInfo.list_info;
        row_inputdata.fields_required = Object.keys(tableInfo.fields_required);
        let customheader = this.options && this.options.associate_popup && this.options.associate_popup.header_customization;
        return row_inputdata;
    },
    // callback for processing input_data for associated records table.
    callbackInputdata: function(input_data){
        if((input_data.list_info.search_criteria || input_data.list_info.sort_field)  && $associations.searchedTable){
            var selectedAssociation = $associations.associations.find(assoc => assoc.association_field == $associations.searchedTable);
            var defaultFields = Object.keys(selectedAssociation.metaInfo.fields.destination_fields);
            if(selectedAssociation.metaInfo.fields.destination_fields.cm_fields){
                var cm_fields = Object.keys(selectedAssociation.metaInfo.fields.destination_fields.cm_fields.fields);
                for(var i = 0; i < cm_fields.length; i++){
                    cm_fields[i] = "cm_fields." + cm_fields[i];
                }
                defaultFields = defaultFields.concat(cm_fields);
            }
            var udfFields = Object.keys(selectedAssociation.metaInfo.fields.udf_fields.fields);
            // if sorted/searched field is udf_field then udf_field.<field> has to be the field while passing to API, if it's a primary field then "destination.<field>" has to be the value, "getSearchCriteriaFieldWithPrefix" will be processing that.
            var meta = jQuery.extend({}, selectedAssociation.metaInfo.fields.destination_fields, selectedAssociation.metaInfo.fields);
            if(input_data.list_info.sort_field){
                input_data.list_info.sort_field = $associations.getSearchCriteriaFieldWithPrefix(input_data.list_info.sort_field, defaultFields, udfFields, meta).field;
            }
            // if sorted/searched field is udf_field then udf_field.<field> has to be the field while passing to API, if it's a primary field then "destination.<field>" has to be the value, "getSearchCriteriaFieldWithPrefix" will be processing that.
            if(input_data.list_info.search_criteria){
                var fieldData = $associations.getSearchCriteriaFieldWithPrefix(input_data.list_info.search_criteria.field, defaultFields, udfFields, meta);
                input_data.list_info.search_criteria.field = fieldData.field;
                if(fieldData.isNum){// for numeric field .condition has to be eq instead of contains in search condition.
                    input_data.list_info.search_criteria.condition = "eq";
                }
                if(input_data.list_info.search_criteria.children && input_data.list_info.search_criteria.children.length){
                    input_data.list_info.search_criteria.children.forEach(criteria => {
                        var fieldData = $associations.getSearchCriteriaFieldWithPrefix(criteria.field, defaultFields, udfFields, meta);
                        criteria.field = fieldData.field;
                        if(fieldData.isNum){// for numeric field .condition has to be eq instead of contains in search condition.
                            criteria.condition = "eq";
                        }
                    });
                }
            }
        }
        return input_data;
    },
    // callback for processing input_data for associate records table.
    callbackPopupInputdata: function(input_data){
        var association = $associations.associations.find(a => a.association_field == $associations.searchedTable);
        /*var personalizedData = sdp_user.CLIENT_CONF[association.table_holder + "_popup_table_listview"];
        if(personalizedData && personalizedData.fields_required){
            input_data.list_info.fields_required = Object.keys(personalizedData.fields_required);
        }*/
        return input_data;
    },
    // when any field is searched in table with data, we will get the prefix of the field to pass it in input_data.
    getSearchCriteriaFieldWithPrefix(field, defaultFields, udfFields, meta){
        var fieldpath = field.split("."), currpath = "", fieldType,isNum = false;
        for(var i = 0; i<fieldpath.length ; i++){
            currpath = fieldpath[i];
            if(meta[currpath] && meta[currpath].display_type){
                fieldType = meta[currpath].display_type.toLowerCase();
                break;
            }else if(meta[currpath]){
                meta = meta[currpath];
                if(currpath == "cm_fields" || currpath == "udf_fields"){
                    meta = meta.fields;
                }
            }
        }

        if(field.indexOf("destination.") == -1 && field.indexOf("udf_fields.") == -1){
            if(defaultFields.indexOf(field) != -1){
                field = "destination." + field; //No I18N
            }
            else if(udfFields.indexOf(field) != -1){
                field = "udf_fields." + field; //No I18N
            }
        }

        if(fieldType == "pick list" || fieldType == "attachment"){
            field += ".name"; // for picklist and attachment fields .name has to be added in search field.
        }
        isNum = (fieldType == "numeric");
        return {"field" : field, "isNum" : isNum};
    },
    // callback to pass other options to TC for associated records table.
    getOtherOptions: function(options, windowObj){
        var _self = this;
        var selectedAssociation = _self.associations.find(assoc => assoc.associated_entity_key+"_list" == options.tableHolder);
        var otherOptions = {};
        var primary_field = selectedAssociation.metaInfo.fields.primary_field;
        otherOptions.bulkSelectionSetting = {
            "enabled":true, //No I18N
            "selectionDisplayField":primary_field, //No I18N
            "constructSelectedListCB": function(data){ // text to show in selected records dropdown will be constructed here. //No I18N
                var val = data.destination && data.destination[primary_field] ? data.destination[primary_field] : (data.destination && data.destination.cm_fields && data.destination.cm_fields[primary_field]) ? data.destination.cm_fields[primary_field] : "-";
                return '<span rel="uitip" mode_ellipsis="true" mode_html="true" title="' + e_html(e_attr(val)) + '">#' + data.destination.id + ' ' + e_html(val) + '</span>';
            }
        };
        otherOptions.meta_data = selectedAssociation.metaInfo.metaDatafields;
        otherOptions.callbackInputdata = $associations.callbackInputdata; // callback function to process input_data before trigerring api.
        otherOptions.max_allowed_fields = 25;
        return otherOptions;
    },
    // callback to pass other options to TC for associate records table.
    getPopupOtherOptions: function(options, windowObj){
        var _self = this;
        var selectedAssociation = _self.associations.find(assoc => "popup_"+assoc.associated_entity_key+"_list" == options.tableHolder);
        var otherOptions = {};
        var primary_field = selectedAssociation.metaInfo.fields.primary_field;
        otherOptions.bulkAssociate = true;
        let fields = Object.keys(selectedAssociation.metaInfo.fields.destination_fields);
        let primary_fieldinfo = $MC.getprimaryfieldvalue(selectedAssociation.metaInfo.fields.primary_field,selectedAssociation.metaInfo.fields);
        if(primary_fieldinfo && primary_fieldinfo.field) {
            fields.push(primary_fieldinfo.field);
        }
        otherOptions.bulkAssociateSettings = {"nonFormFields":fields}; //No I18N
        otherOptions.bulkAssociateSettings.nonFormFields.push("newtablink");
        otherOptions.bulkSelectionSetting = 
        {
            "enabled":true, //No I18N
            "selectionDisplayField":primary_field, //No I18N
            "constructSelectedListCB": function(data){ // text to show in selected records dropdown will be constructed here.  //No I18N
                var val = data && data[primary_field] ? data[primary_field] : (data && data.cm_fields && data.cm_fields[primary_field]) ? data.cm_fields[primary_field] : "-";
                return '<span rel="uitip" mode_ellipsis="true" mode_html="true" title="' + e_html(e_attr(val)) + '">#' + data.id + ' ' + e_html(val) + '</span>';
            },
            selectionCallback: function (elm) {
                jQuery('[data-filter=true]').addClass("hide");
            },
            unSelectionCallback: function (elm) {
                if(WebComponents.instancePool["webc-popup_"+MC.options.name].bulkSelect.getSelectedIDs().length == 0){
                    jQuery('[data-filter=true]').removeClass("hide");
                }
            }
        };
        otherOptions.meta_data = selectedAssociation.metaInfo.metaDatafields;
        otherOptions.callbackInputdata = $associations.callbackPopupInputdata; // callback function to process input_data before trigerring api.
        otherOptions.entity_name = selectedAssociation.associate_entity_key;
        otherOptions.isFR_ListInfo_Support = true;
        otherOptions.max_allowed_fields = 25;
        otherOptions.custom_page_length = ["10", "25"]; // this option is to reduce the load on bulk selection, in records per page only 10,25 will be shown as options.
        /*otherOptions.personalizeCallback = function (info, tinfo, table_info) {
            return table_info.t_obj.table_info;
        }*/

        return otherOptions;
    },
    // render function to construct new tab icon.
    constructNewTabIcon: function(tdata){
        var moduleurl = "javascript:void(0);";//No I18N
        if(tdata.row_data.destination && tdata.row_data.destination.entity && tdata.row_data.destination.entity.api_plural_name) {
            var ent = tdata.row_data.destination.entity;
            if(ent.api_plural_name.indexOf("cm_") != "-1") {
                moduleurl = "/ui/custom_module?module="+ent.api_plural_name+"&mode=details&entity_id="+tdata.row_data.destination.id;//No I18N
            }
        }
      return '<div><div class="right0 top0 p5 pr5 disp-ib"><a class="cspr flat icon-sm newtab" title="' + translate('sdp.requests.newrequest.autosuggest.newwindow.open') + '" href="'+moduleurl+'" target="_blank" rel="noopener noreferrer uitip"></a></div></div>';
    },
    // setting the default height for associate records table due to UI issues in popup.
    setPopupHeight: function() {
        let hgt = this.options && this.options.associate_popup && this.options.associate_popup.header_customization && this.options.associate_popup.header_customization.enable
        var contentHeight = jQuery(window).height() - 160 - (hgt ? jQuery('[data-id="customsection-header"]').outerHeight(true) : 0);
        if(contentHeight < 380){
            return 370;
        }else{
            return contentHeight;
        }
    },
    // setting the default height for associated records tables, so that when large data tables are loaded, we don't need to scroll through out the page.
    setHeight: function() {
        return window.printmode ? "100%" : 380;
    },
    // returns filtered fields of type date.
    getDateFields: function(udf_fields) {
        var fieldKeys = Object.keys(udf_fields);
        return fieldKeys.filter(f => udf_fields[f].display_type === "Date" || udf_fields[f].display_type === "Date/Time");
    },
    formatMetaInfoFields : function(metaInfo){
        var fields = {};
        let dfields = Object.assign({},fields,metaInfo.fields.destination_fields);
        for(var dkey in dfields){
            var dvalue = dfields[dkey];
            if(typeof dvalue == "object" && dvalue.fields && (dvalue.type == "udf")) {
                let ufields = dvalue.fields;
                for(var ukey in ufields){
                    let udffield = {};
                    udffield[dkey + "." + ukey] = ufields[ukey];
                    dfields = Object.assign(dfields,udffield);
                }
            }
        }
        fields = jQuery.extend({},fields,dfields);
        if(metaInfo.fields && metaInfo.fields.udf_fields && metaInfo.fields.udf_fields.fields) {
            var udfFields = {};
            for(var key in metaInfo.fields.udf_fields.fields){
                udfFields[key] = metaInfo.fields.udf_fields.fields[key];
                udfFields[key]["value_path"] = "udf_fields."+key;
            }
            fields = jQuery.extend({},fields,udfFields);
        }
        metaInfo.metaDatafields = fields;
    },
    getRequiredFields : function(metaInfo){
        var _self = this;
        var fields = [];
        if(metaInfo.fields && metaInfo.fields.destination_fields){
            fields = fields.concat(Object.keys(metaInfo.fields.destination_fields));
        }
        if(metaInfo.fields && metaInfo.fields.udf_fields && metaInfo.fields.udf_fields.fields){
            fields = fields.concat(Object.keys(metaInfo.fields.udf_fields.fields));
        }
        return fields;
    },
    // when associate button is clicked in associate records popup, udf field data will be gathered from UI and record gets associated.
    associateRecords : function(associate_key, webCompId){
        if(jQuery("#popup_" + associate_key + "_associate").length){
            jQuery("#popup_" + associate_key + "_associate").prop("disabled", true); // NO I18N
        }
        var _self = this,input_data = {};
        var t_obj = WebComponents.instancePool["webc-"+webCompId]; //No I18N
        var selectedAssociation = _self.associations.find(assoc => assoc.table_holder == webCompId.replace("popup_",""));
        var dateFields = _self.getDateFields(selectedAssociation.metaInfo.fields.udf_fields.fields);
        if(selectedAssociation.associationType == "radio")
        {
            var selectedId = t_obj.getSelectedRadio();
            var udfFields = t_obj.bulkAssociation.getRowValues()[0];
            if(!udfFields) {
                jQuery("#popup_" + associate_key + "_associate").prop("disabled", false);
                return;
            }
            if(dateFields.length){
                dateFields.forEach(field =>{
                    var value = udfFields[field];
                    if(value){
                        udfFields[field] = {"value" : value};
                    }
                })
            }
             delete udfFields.id;
            var selectedIdsArray = [{"destination":{"id":selectedId}, "udf_fields":udfFields}]; //No I18N
        }
        else{
            var selectedIds = t_obj.bulkSelect.getSelectedIDs();
            var udfFields = t_obj.bulkAssociation.getRowValues();
            if(!udfFields) {
                jQuery("#popup_" + associate_key + "_associate").prop("disabled", false);
                return;
            }
            var selectedIdsArray = [];
            selectedIds.forEach(id =>{
                var row_udfFields = udfFields.find(row => row.id == id);
                if(dateFields.length){
                    dateFields.forEach(field =>{
                        var value = row_udfFields[field];
                        if(value){
                            row_udfFields[field] = {"value" : value};
                        }
                    })
                }
                delete row_udfFields.id;
                var idJson = {"destination":{"id":id}, "udf_fields":row_udfFields}; //No I18N
                selectedIdsArray.push(idJson);
            })
        }
        input_data[associate_key] = selectedIdsArray;
        let custom_sec = _self.options && _self.options.associate_popup && _self.options.associate_popup.header_customization
        if(custom_sec && custom_sec.associated && custom_sec.associated.pre) {
            input_data = execFuncByName(custom_sec.associated.pre, window, input_data)
        }
        /*
            SD-127024, SD-119146 fix - If popover is open, then close it before closing the dialog
        */
        if(jQuery('#showPopover').is(':visible')) {
            closeDD();
        }
        sdpAjax({
            async: false,
            data: sdpAjaxInputData(input_data),
            type: "POST", //No I18N
            url: "/api/v3/" + _self.options.module + "/" + _self.options.module_id + "/" + associate_key, // NO I18N
            success: function(resp) {
                const successMsgKey = _self.options.successMsgKey ? _self.options.successMsgKey : "sdp.checklist.associated";   //No I18N
                showalert("success", translate(successMsgKey), "isAutoHide=true, delay=3"); //No I18N
                jQuery("#associations_popup").sdp_zcomponent_dialog("close"); //No I18N
                if(custom_sec && custom_sec.enable && custom_sec.associated && custom_sec.associated.post) {
                    execFuncByName(custom_sec.associated.post, window, resp);
                } else {
                    if(webCompId.indexOf("popup_") != -1){
                        webCompId = webCompId.replace("popup_","");
                    }
                    WebComponents.instancePool["webc-"+webCompId].refreshTable(); //No I18N
                    var count = _self.updateAssociationCount(selectedAssociation.association_field);
                    if(count != undefined && jQuery("#"+webCompId+"_count").length){
                        jQuery("#"+webCompId+"_count").html("(" + count + ")");
                    }
                    selectedAssociation.count = count; //No I18N
                    // if any record is already associated in single record association types, disabling associate button.
                    if(selectedAssociation.count > 0 && selectedAssociation.associationType == "radio"){
                        jQuery("#" + selectedAssociation.table_holder + "_associate").prop("disabled", true);
                    }
                }
            },
            error: function(resp){
                resp = resp.responseJSON.response_status;
                if(jQuery.isArray(resp)){
                    resp = resp[0];
                }
                var fields = selectedAssociation.metaInfo.fields.udf_fields.fields;
                if(resp.status_code == 4000){
                    var errorMsg = e_html(resp.messages[0].message);
                    var field = resp.messages[0].field;
                    var fieldMeta = fields[field];
                    if(fieldMeta){
                        errorMsg = errorMsg + " - <strong>" + e_html(fieldMeta.display_name) + "</strong>";
                    }
                    showalert('failure', errorMsg, "isAutoHide=true"); // NO I18N
                }
            }
        });
    },
    // when dissociate button is clicked in associated records table
    dissociateRecords : function(associate_key, webCompId){
        var _self = this,selectedIds;
        var t_obj = WebComponents.instancePool["webc-"+webCompId]; //No I18N
        var selectedAssociation = _self.associations.find(assoc => assoc.table_holder == webCompId);
        if(selectedAssociation.associationType == "radio"){
            selectedIds = [t_obj.getSelectedRadio()];
        }
        else{
            selectedIds = t_obj.bulkSelect.getSelectedIDs();
        }
        sdpAjax({
            async: false,
            //  data: sdpAjaxInputData(input_data),
            type: "DELETE", //No I18N
            url: "/api/v3/" + _self.options.module + "/" + _self.options.module_id + "/" + selectedAssociation.association_field + "?ids=" + selectedIds.toString(), // NO I18N
            success: function(resp) {
                showalert("success", translate("sdp.checklist.dissociated"), "isAutoHide=true, delay=3"); //No I18N
                t_obj.refreshTable();
                var count = _self.updateAssociationCount(selectedAssociation.association_field);
                if(count != undefined && jQuery("#"+webCompId+"_count").length){
                    jQuery("#"+webCompId+"_count").html("(" + count + ")");
                }
                selectedAssociation.count = count; //No I18N
                // if no records are associated in single record association types, enabling associate button(module record shouldn't be trashed and user should have edit permission).
                if(selectedAssociation.count == 0 && selectedAssociation.associationType == "radio" && !_self.options.is_trashed && (selectedAssociation._links.indexOf("post") != -1)){
                  jQuery("#" + selectedAssociation.table_holder + "_associate").prop("disabled", false);
                }
            }
        });
    },
    // gets the total associated records count.
    updateAssociationCount: function(assocKey){
        let count,_self = this;
        sdpAjax({
            url: "/api/v3/" + _self.options.module + "/" + _self.options.module_id + "/" + assocKey + "/_total_count",
            async: false,
            success: function(data) {
                count = data && data._total_count && data._total_count[assocKey];
            }
        });
        return count;
    },
    // json for initializing MC for associate records popup.
    associateListviewpopup: function(asso) {
        let ass = asso.associations;
        var commonjson = {
            "container": "#popup_"+ass.table_holder,//Base element to render content //No I18N
            //"container": "#assoMC",
            "mode": "list",//List/Form(add/edit),Details page //No I18N
            "name": ass.associated_entity_key, //No I18N
            "entity_name": ass.associate_entity_key, //No I18N
            "display_name": "",//Module name //No I18N
            "callbackURL": ass.associate_url, //No I18N
            "list": { //No I18N
                "meta": {//No I18N
                    "view": "table",//Listview view type "table/classic" //No I18N
                  "getmetainfo": "false", //No I18N
                  "duplicate_name": "popup_"+ass.associated_entity_key, //No I18N
                    "header": {//No I18N
                        "actions": { //No I18N
                          "bulk_selection": { //No I18N
                            "enable": true //No I18N
                          },
                          "custom_action_1": { //No I18N
                                "enable": true, //No I18N
                                "custom_class": "fl mr10", //No I18N
                                "renderhtml": '<button class="btn btn-primary btn-sm fl mr10" type="button" id="popup_' + ass.associated_entity_key + '_associate" title="' + translate("sdp.common.records",[translate("sdp.common.associate")]) + '" aria-label="Associate" data-no-records-hide="popup_'+ass.associated_entity_key+'_list" data-link="popup_'+ass.associated_entity_key+'_list" data-cs-field="associate">' + translate("sdp.common.associate") + '</button>', //No I18N
                            },
                          "t_searchicon": { //No I18N
                            "enable": true, //No I18N
                            "custom_class": "fl" //No I18N
                          },
                          "t_column_choos": { //No I18N
                            "enable": ass.hasUdfFields, //No I18N
                            "custom_class": "fl" //No I18N
                          },
                          "pagination_comp": {//No I18N
                            "enable": true,//No I18N
                            "custom_class": "btn-group fl"//No I18N
                          },
                        },
                    },
                    "additional_options": {//No I18N
                        "personalize_key": ass.table_holder+"_table_listview", //No I18N
                        "callback-url": ass.associated_url, //No I18N
                        "row_inputdata": "$associations.popup_row_inputdata", //No I18N
                        "callback-rowfunction": "$associations.popup_row_inputdata", //No I18N
                        "other-options": "$associations.getPopupOtherOptions", //No I18N
                        "height": "fx:$associations.setPopupHeight", //No I18N
                        "width": "fx:$associations.setWidth", //No I18N
                        "callback-after-initial-render": "$associations.callbackAfterBodyRender",//No I18N
                        "handle-window-resize": true, //No I18N
                    },
                    /** Column list **/
                    "cells": {//No I18N
                        "static_cells": { //No I18N
                          "checkbox": true, //No I18N
                        },
                        "fields_required": {} //No I18N
                    }
                },
                "options": { //No I18N
                    "component": { //No I18N
                            "callback": { //No I18N
                                "post": function(tableinfo) {
                                    var table_name = (tableinfo.options && tableinfo.options) ? tableinfo.options.name : tableinfo.name;
                                    // click event to associate records.
                                    jQuery("#popup_" + table_name + "_associate").off("click.association_associatepopup").on("click.association_associatepopup", function(){ //No I18N
                                        $associations.associateRecords(table_name, "popup_" + table_name);
                                    });
                                    if(asso && asso.is_popup) {
                                        jQuery('body').addClass('of-h'); //No I18N
                                    }
                                } //No I18N
                            }
                        }
                },
            },
        };
        var fieldobj = {};
        if(ass.metaInfo.fields.cardinality == "one_to_one" || ass.metaInfo.fields.cardinality == "many_to_one") {
            delete commonjson.list.meta.cells.static_cells;
            fieldobj[ass.associate_entity_key+"_head_chk"] = {
                "type": "radio", //No I18N
                "default": "true", //No I18N
                "render": "$associations.constructRadioButton", //No I18N
                //"width": "200px", //No I18N
            };
        }
        let metafields =ass.metaInfo && ass.metaInfo.fields;
        let desfield = metafields.destination_fields;
        for(var i=0; i<ass.fields_required.length; i++) {
            if(i == 25){
                break;
            }
            if(ass.fields_required[i] !== "id" && ass.fields_required[i] !== "cm_fields" && ass.fields_required[i].indexOf('cm_fields.') !== 0) {//No I18N
                let dessearch = ((desfield && desfield[ass.fields_required[i]] && !jQuery.isEmptyObject(desfield[ass.fields_required[i]])) || (ass.fields_required[i].indexOf("cm_fields." + metafields.primary_field) !== -1));//No I18N
                fieldobj[ass.fields_required[i]] = {
                    "name": ass.fields_required[i],
                    "searchable" : dessearch //No I18N
                    //"width": "50%", //No I18N
                };
                if(ass.fields_required[i] == "module") { //No I18N
                    fieldobj[ass.fields_required[i]]["value_path"] = "module.display_name"; //No I18N
                    fieldobj[ass.fields_required[i]]["type"] = "string"; //No I18N
                }
            }
        }
        if(metafields) {
            let primaryfield = metafields.primary_field;
            let primary_fieldinfo = $MC.getprimaryfieldvalue(primaryfield,metafields);
            if(primary_fieldinfo && primary_fieldinfo.field) {
                primaryfield = primary_fieldinfo.field;
            }
            if(fieldobj[primaryfield]) {
                fieldobj[primaryfield].default = true;
                fieldobj[primaryfield]["data-celltransformer"] = "$associations.titledata"; //No I18N
            }
            var filter = metafields.destination_filter;
            if(filter && filter.length != 0) {
                var filteroptions = {
                    "enable": true, //No I18N
                    "custom_class": "fl ml10 mr10", //No I18N
                    "custom_attr": "data-filter=true", //No I18N
                    "partial": "$associations.associationFilter", //No I18N
                };
                commonjson.list.meta.header.actions["custom_action_2"] = filteroptions;
                $associations.destination_filter = metafields.destination_filter
            }
        }
        commonjson.list.meta.cells.fields_required = fieldobj;
        return commonjson;
    },
    // this function is to initilize filter criteris dropdown in associate popup.
    callbackAfterBodyRender: function() {
        const filter = $associations.destination_filter;

        const fieldplaceholder = (ele, val) => {
            ele.attr("title", e_attr(val)).attr('rel', 'uitip').attr('mode_ellipsis', 'true').html(e_html(val));//No I18N
            initTooltip('[data-filter="true"]');//No I18N
        };

        for (let i = 0; i < filter.length; i++) {
            const select2Options = {
                allowClear: true,
                placeholder: translate(`form.select.placeholder`, [filter[i].display_name]), // No I18N
                url: [{
                    url: `/api/v3${filter[i].href}`, // No I18N
                    field: filter[i].name,
                }],
                formatSelection: (item, $span) => {
                    fieldplaceholder($span, item.text);
                    return $span;
                },
            };

            jQuery(`#destination_filter${i}`).sdp_select2(select2Options);//No I18N

            jQuery(`#destination_filter${i}`).on('select2-selecting', function (event) {
                $associations.associationfilterchange(event.choice, this.getAttribute("data-name"));
            });

            jQuery(`#destination_filter${i}`).on('select2-removed', (item, $this) => {//No I18N
                const select2Instance = jQuery(item.target).data('select2');//No I18N
                const $span = select2Instance.selection.find('span.select2-chosen');//No I18N
                fieldplaceholder($span, jQuery($span).text());
                $associations.associationfilterchange(undefined, item.target.getAttribute("data-name"));
            });

            let userclientpkey = sdp_user.CLIENT_CONF && sdp_user.CLIENT_CONF[MC_LIST.options.list.meta.additional_options.personalize_key];
            let cri = userclientpkey && userclientpkey.list_info && userclientpkey.list_info.search_criteria;
            if (cri) {
                for (let j = 0; j < cri.length; j++) {
                    if (cri[j].field === filter[i].name) {
                        const json_data = {
                            "list_info": {//No I18N
                                "search_criteria": { //No I18N
                                    "condition": "is", //No I18N
                                    "field": "id", //No I18N
                                    "value": cri[j].value //No I18N
                                }
                            }
                        };
                        sdpAjax({
                            url: `/api/v3${filter[i].href}`, //No I18N
                            data: sdpAjaxInputData(json_data),
                            async: false,
                            cache: false,
                            success: (res) => {
                                const data = res[filter[i].name][0];
                                data["text"] = data.name; //No I18N
                                jQuery(`#destination_filter${i}`).select2("data", data); //No I18N
                            }
                        });
                    }
                }
            } else {
                const dval = jQuery(`#destination_filter${i}`).select2("data"); //No I18N
                if (!dval) {
                    const select2Instance = jQuery(`#destination_filter${i}`).data('select2'); //No I18N
                    const $span = select2Instance.selection.find('span.select2-chosen'); //No I18N
                    fieldplaceholder($span, translate(`form.select.placeholder`, [filter[i].display_name])); //No I18N
                }
            }
        }

    },
    // processing input_data with selected search criteria.
    associationfiltercriteria: function(linfo, newcriteria, type) {
        var cri = [], cri1 = [];
        if(linfo.search_criteria) {
            cri = linfo.search_criteria;
        } else {
            linfo["search_criteria"] = []; // No I18N
        }
        for(var i=0; i<cri.length; i++) {
            if(cri[i].field !== type) {
                cri1.push(cri[i]);
            }
        }
        if(!jQuery.isEmptyObject(newcriteria)) {
            cri1.push(newcriteria);
        }
        linfo.search_criteria = cri1;
    },
    // when any filter is selected/changed this function will be trigerred.
    associationfilterchange: function(selecteddata, type) {
        let components = WebComponents.instancePool['webc-popup_'+MC_LIST.options.name]; // No I18N
        if(components) {
            var linfo = components.t_obj.table_info.list_info;
            var cri = {};
            if(selecteddata) {
                let val = (selecteddata.id == "-1") ? null : selecteddata.id
                cri = {"field":type,"condition":"is","value":val,"logical_operator":"and"}; // No I18N
            }
            this.associationfiltercriteria(linfo,cri,type);
            components.refreshTable();
        }
    },
    associationFilter: function() {
        var filter = $associations.destination_filter;
        var filterhtml = '';
        let inputwidth = 360 / filter.length;
        for(var i=0; i<filter.length; i++) {
            var name = "'"+filter[i].name+"'"; // No I18N
            filterhtml = filterhtml + '<input id="destination_filter'+i+'" class="form-control mr10" data-style="width: '+inputwidth+'px;" data-name=' + name + '>' // No I18N
        }
        return filterhtml;
    },
    // when associate button in clicked in associated records table, available record to associate popup will be opened.
    openAssociations : function(association_field){
        var _self = this;
        var selectedAssociation = _self.associations.find(assoc => assoc.association_field+"_list" == association_field);
        if(selectedAssociation.table_holder.indexOf("_popup") == -1){
            selectedAssociation.table_holder = selectedAssociation.table_holder+"_popup"; //No I18N
        }
        var data = jQuery.extend({}, selectedAssociation, {"is_popup": true}); //No I18N

        var commonjson = _self.associateListviewpopup({"is_popup": true, "associations" : data}); //No I18N
        commonjson.skipmapping = true;
        commonjson.scrolltotop = false;
        jQuery("#" + _self.options.containerId).append("<div id='associations_popup'></div>");
        let doptions = _self.associationzdialog();
        let coption = {
            title: _self.options.dialog_title || selectedAssociation.display_name,
            open: function(ui, $this) {
                var popup_holder = jQuery("<div>", {"id" : "popup_" + data.table_holder});
                popup_holder.css("width", "99.5%");
                jQuery(ui.ui.container).find(".zdialog__content").html(popup_holder);
                setTimeout(function() {
                    let ass_popup = _self.options && _self.options.associate_popup;
                    if(ass_popup && ass_popup.skip_table_auto_render) {
                        new ASSOCIATION_CUSTOM_HEADER(commonjson, _self.associations, ass_popup);
                    } else {
                        new MC(commonjson);
                    }
                    jQuery("body").addClass("of-h"); //No I18N
                },100)
            },
            close: function(ui, $this) {
                jQuery("body").removeClass("of-h");
            },
            width: 920,
        };
        jQuery("#associations_popup").sdp_zcomponent_dialog(Object.assign(doptions,coption));
        selectedAssociation.table_holder = selectedAssociation.table_holder.replace("_popup", "");
    },
    // function to initialize association map functionality in popup.
    viewAssociationMap : function(){
       var _self = this;
       // loading the associationsTree.js file for associations map.
        ResourceLoader({
            js: ["/scripts/d3.min.js","/scripts/associationsTree.js"],//No I18N
            success :function() {
                jQuery("#associations_map_popup").remove()
                jQuery("body").append("<div id='associations_map_popup'><div id='association_tree_container'></div></div>");
                let primaryFieldValue = $MC.getprimaryfieldvalue(_self.options.module);
                let doptions = _self.associationzdialog();
                let coption = {
                    title: primaryFieldValue.value || _self.options.display_name + " "+ translate("common.associations"),
                    width: jQuery(window).width(),
                    open: function(ui, $this){
                        setTimeout(function(){
                            associationMap.initMap(_self.options.entity_name, _self.options.module, _self.options.module_id, {
                                selector: "association_tree_container", //No I18N
                                height: jQuery(ui.ui.container).height() - 49,
                                width: jQuery(ui.ui.container).width()
                            });
                        }, 200);
                        jQuery('body').addClass('oh-i');
                    },
                    close: function(){
                        jQuery('body').removeClass('oh-i');
                    }
                };
                jQuery("#associations_map_popup").sdp_zcomponent_dialog(Object.assign(doptions,coption));
            }
        });
    },
    // default width for all tables is width of it's parent.
    setWidth: function() {
        return "100%";
    },
    associationzdialog: function() {
        let doptions = {
            closeOnEscKey: true,
            height: jQuery(window).height(),
            position: {
                right: "0px", //No I18N
                top: "0px" //No I18N
            },
            draggable: false,
            resizable: {
                directions: "w" ,//No I18N
                minWidth: 920
            },
            animation: {
                open: {
                    className: 'zeffects--slideright', //No I18N
                    duration: 300
                },
                close: {
                    className:'zeffects--slideright--reverse', //No I18N
                    duration:300
                }
            },
            resizeWindow: true, //SD-118941 fix
        };

        if(sdp_user.DIRECTION == "RTL") {
            doptions.position = {
                left: "0px", //No I18N
                top: "0px" //No I18N
            };
            doptions.resizable = {
                directions: "e" , //No I18N
                minWidth: 920
            };
            doptions.animation={
                open:{
                    className:'zeffects--slideleft', //No I18N
                    duration: 300
                },
                close: {
                    className: "zeffects--slideleft--reverse", //No I18N
                    duration: 300
                }
            }
        }
        return doptions;
    },
    titledata: function(data, info) {
        let rd = data.row_data;
        let field = data.head_data.id;
        let rdata = rd[field];
        if (!rdata) {
             // if field is like destination.cm_fields.sline, "getFieldsRequiredByString" will iterate through field path destination, cm_fields and fetch value.
            rdata = table_comp.getFieldsRequiredByString(rd, field);
        }
        if(!rdata){
            if(rd[field])
            {
                rdata = rd[field] || "-";
            }
            else if(rd.cm_fields && rd.cm_fields[field])
            {
                rdata = rd.cm_fields[field] || "-";
            }
            else
            {
                rdata = "-";
            }
        }
        rdata = e_html(rdata);
        return '<span rel="uitip" mode_ellipsis="true" mode_html="true" title="'+e_attr(rdata)+'">'+rdata+'</span>';//No I18N
    }
};

/**
 * Represents a customizable header for association-related actions.
 */
class ASSOCIATION_CUSTOM_HEADER {
    /**
     * Constructs a new Association Custom Header.
     *
     * @param {Object} commonjson - Common JSON data for the header.
     * @param {Array} associations - An array of association objects.
     * @param {Object} options - Additional options for customizing the header.
     */
    constructor(commonjson, associations, options) {
        this.mc = commonjson;
        this.options = options;
        this.associations = associations;
        this.sectionConstruct();
        this.constructEvents();
    }

    /**
     * Constructs the custom header section based on provided options.
     */
    sectionConstruct() {
        let customsection = this.options && this.options.header_customization;
        let container = this.mc.container;
        let associations = this.associations;

        if (customsection.enable) {
            let customHeaderUI = '<div class="p10" data-id="customsection-header"><div class="disp-ib fw mr10">';

            if (customsection.choose_all) {
                customHeaderUI += '<div class="disp-ib mr10"><label class="radio-inline"><input type="radio" name="' + container + '" data-association-action="radio" value="choose">'+customsection.choose_all_lable+'</label>';
                customHeaderUI += '<input type="text" class="form-control ml10 vmiddle hide w-220px" data-id="' + container + '_choose" data-association-action="select" data-name="association-select"></div>';
            }

            if (customsection.renderhtml) {
                customHeaderUI += execFuncByName(customsection.renderhtml, window, customHeaderUI);
            }

            customHeaderUI += '</div></div>';

            if (customsection.position === "top") {
                jQuery(container).before(customHeaderUI);
            }
        }
    }

    /**
     * Constructs events and actions related to the custom header.
     */
    constructEvents() {
        let _self = this;
        let associations = this.associations;
        let container = this.mc.container;
        let customsection = this.options && this.options.header_customization;
        let containerParent = jQuery(container).parent();

        if (customsection.choose_all) {
            let selectOptions = [];
            for (let i = 0; i < associations.length; i++) {
                if (associations[i].api_plural_name !== 'assoc_ci_relationships') {
                    selectOptions.push({ "text": associations[i].display_name, "id": associations[i].api_plural_name });
                }
            }
            /**
            * sort the data based on text. By default, sort will be based in id field.
            */
            selectOptions.sort((a, b) => {
                const textA = a.text.toLowerCase();
                const textB = b.text.toLowerCase();
                if (textA < textB) {
                    return -1;
                }
                if (textA > textB) {
                    return 1;
                }
                return 0;
            });
            containerParent.find('[data-id="' + container + '_choose"]').select2({
                 data: selectOptions,
                 placeholder: translate("sdp.change.sla.select"),
                 formatSelection: (data,ele) => {
                    const value = data.text;
                    ele.attr("title",value).attr('rel', 'uitip').attr('mode_ellipsis', 'true').html(e_html(value));//No I18N
                    initTooltip('[data-filter="true"]');//No I18N
                    return ele;
                },
            });

        }

        containerParent.find('[data-association-action="radio"]').off("change.association").on("change.association", function () { //No I18N
            let elements = containerParent.find('[data-name=association-select]');
            let $this = this;
            Array.from(elements).forEach( (el) => {
                if(jQuery(el).attr("data-id") == $this.name + "_" + $this.value) {
                    jQuery(el).select2("container").removeClass("hide"); // NO I18N
                } else {
                    jQuery(el).select2("container").addClass("hide"); // NO I18N
                    jQuery(el).select2("val", ""); // NO I18N
                    jQuery(el).select2("container").find(".select2-chosen").attr("title", "");
                }
            });
        });

        containerParent.find('[data-association-action="select"]').off("change.association").on("change.association", function () { //No I18N
            let data = jQuery(this).select2('data'); //No I18N
            let selectedAssociation = _self.associations.find(assoc => assoc.association_field == data.id);
            let commonjson = $associations.associateListviewpopup({ "is_popup": true, "associations": selectedAssociation }); //No I18N

            containerParent.find("[data-id=custom_association_popup]").remove();
            var popupContainer = jQuery("<div>", {"id" : "popup_" + selectedAssociation.table_holder, "css" : {"width" : "99.5%"}, "data-id" : "custom_association_popup"});
            containerParent.append(popupContainer);
            new MC(commonjson);
        });

        if(customsection.actions) {
            execFuncByName(customsection.actions, window, _self);
        }
    }
}

