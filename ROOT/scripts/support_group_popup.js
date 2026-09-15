var $supportGroupPopup = {
    fetchMetaData: function(id){
        sdpAjax({
            url: "/api/v3/support_groups/" + id,//No I18N
            success: function (response) {
                $supportGroupPopup.resp = response;
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
            async: false
        });
        sdpAjax({
            url: "/api/v3/support_groups/_metainfo", // No I18N
            success: function(resp) {
                $supportGroupPopup.metaData = resp.metainfo;
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
    loadsupportGroupPopup: function(key) {
        jQuery('#'+key).panelSlider({
            title : translate("ae.cmdb.importci.header.groupDetails"),
            modal:"true",
            resizable: false,
            width: "650px",  // No I18N
            placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
            dialogClass: "tabui-rightpanel", // NO I18N
            close: function(){
                jQuery('#'+key).dialog("destroy"); // No I18N
            }
        });
    },
    cancelPopup: function() {
        jQuery('#supportGroupPopup').dialog("close"); // No I18N
    },
    openPopup: function(id){
        var groupView = [{
            "name" : " Support Group", //No I18N
            "fields" : { //No I18N
                "name" : {}, //No I18N
                "site" : {}, //No I18N
                "description" : {} //No I18N
                }
            },
            {
            "name" : "Additional Details", //No I18N
            "fields" : { //No I18N
                "udf_fields" : {} //No I18N
            }
        }];
        $supportGroupPopup.fetchMetaData(id);
        var formData = groupView;
        var template = $supportGroupPopup.constructLayoutObject(formData, $supportGroupPopup.metaData.fields, false);
        template.style_properties = {
             "section_style": { //No I18N
                "font_size": "15px" //No I18N
             },
             "field_style": { //No I18N
                 "font_size": "13px", //No I18N
                 "font_weight": "bold" //No I18N
              }
        };
        var configJSON = {
            name: "support_group",// No I18N
            entity: "mdh",// No I18N
            entitypath: "support_groups",// No I18N
            entitydata: $supportGroupPopup.resp.support_group,
            template: template,
            metadata: jQuery.extend(true, {}, $supportGroupPopup.metaData),
            mode: "view",    // No I18N
            container: "supportGroupPopup",// No I18N
            formid: "support_group_popup",// No I18N
            canEdit: false,
            afterRenderCallback: function () {
                jQuery("#supportGroupPopup").dialog("option", "position", { my: "center", at: "center", of: window }); //No I18N
            }
        };
        var fc = new FC(configJSON);
        $supportGroupPopup.loadsupportGroupPopup("supportGroupPopup"); //No I18N
    },
    constructLayoutObject: function(form_fields, meta_info, isPopUp)
    {
        var resp_obj = {}, layouts = [], metainfo_Obj = {}, sections = [];
        if(!isPopUp) {
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
                        var fieldsCnt = fieldsArray.length;
                        for(var k=0; k < fieldsCnt;k++){
                            var subfield_name = fieldsArray[k];
                            var field = flds[subfield_name];
                            field.position = { "col": fld_col, "row": fld_row }; // No I18N
                            field.name = fieldName+"."+subfield_name;
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
                sections.push(section);
            }
            var layout = {};
            layout.sections = sections;
            resp_obj.layouts = [layout];
            return resp_obj;
        }
        else {
            for(var i=0; i < form_fields.length;i++){
                var sectionFields = form_fields[i].fields;
                var section ={};
                section.name = form_fields[i].name;
                section.column_count = "1";
                section.field_align = "center";  // No I18N
                var fields = [];
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
                        var fieldsCnt = fieldsArray.length;
                        for(var k=0; k < fieldsCnt;k++){
                            var subfield_name = fieldsArray[k];
                            var field = flds[subfield_name];
                            field.name = fieldName+"."+subfield_name;
                            if(!field.fieldname){
                            field.fieldname = subfield_name;
                            }
                            metainfo_Obj[fieldName+"."+subfield_name] = field;
                        }
                    }
                }else{
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
                }
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
}