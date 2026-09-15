/* $Id$ */

var $changeFAFR = {
    //Fields not to be shown for show/hide/mandate/non-mandate actions in change module
    mandatoryFields: ['STAGE', 'STATUS', 'TITLE', 'TEMPLATE', 'CREATEDTIME', 'COMPLETEDTIME'], //NO I18N

    //Fields not to be shown in criteria field list in change module
     criteriaIgnoreFields: ['TEMPLATE', 'ASSET', 'CI', 'INITIATOR', 'CHANGEMANAGER', 'TECHNICIAN', 'SCHEDULEDSTARTTIME', 'SCHEDULEDENDTIME', 'CREATEDTIME', 'COMPLETEDTIME'], //NO I18N

    //Fields not to be shown in onChange field list in change module
     onChangeIgnoreFields: ['TEMPLATE', 'SERVICE', 'ASSET','CI','INITIATOR'] //NO I18N
};
var $CS=(function(){
    /*This method return value of a field for a given */
    var getValue=function(fieldId, isManual,formid) {
        fieldId=getNewUDFName(fieldId);
        if(fieldId === "TEMPLATE" && $se.module != 'CHANGE') {
            if(window.req_module){
                return $req.form.template.id ? $req.form.template.id :  $req.details.request_info.template.id;
            }else{
                if($se.module=="INCIDENT" || jQuery("#req_template_name").length==0 ) {
                    return jQuery('[name="reqTemplate"]').select2("data").id;//no i18n
                }else {
                    return jQuery("#req_template_name").attr("data-value");
                }
            }
        }
        if(formid!= undefined){
            let form_id=$CS.findElement(formid).attr("data-formid");
            let form= FC_Mapper[form_id]?FC_Mapper[form_id]:null;
            var fvalue = form.getFieldValue(fieldId, true);
            if(fvalue==undefined && form && form.entitydata && form.entitydata.hasOwnProperty([fieldId])){
                fvalue=form.entitydata[fieldId];
                if(fvalue==null){
                    return "";
                }
            }
            return fvalue; 
        }
        if($se.page_scripts.enabled && fieldId.indexOf('REQUESTER')==-1) {
            if($se.page_scripts.module_id != "rdp_page"){
                return "";
            }
            return $se.page_scripts.getValue(fieldId);
        }
        //$se.fieldsJson object contains method to acess field properties such as type, label, id , allowed values
        var fieldType=$se.fieldsJson.getFieldType(fieldId);
        //Here we used different method than $se.element since in details view page we have different sections (resources, request properties) and at a time only section might be open, thus we won't be able to access element since data-field will not be present. But using elementUsedInGetValue we will be able to access value of field irrespective of whether section containing field is in edit mode or non-edit mode.
        try{
            var fieldObject=$se.elementUsedInGetValue(fieldId);
            if(fieldId.indexOf('REQUESTER')===0 && !(fieldId === "REQUESTER.OBO" || fieldId === "REQUESTER.ASSETS")){
                return getRequesterDetails(fieldId);
            }else if(fieldId === "REQUESTER" && $se.module != 'CHANGE'){ //No I18N
                if(window.req_module) {
                    //requester cannot be changed from the details page, hence we return the requester info from the request_info object
                    var value = $req.details.request_info.requester;
                    if(Object.keys(value).length){
                        return value.name;
                    }else{
                        return undefined;
                    }
                }
                if(fieldObject && fieldObject.select2("data")){
                    return fieldObject.select2("data").name;    //no i18n
                }
                else{
                    return "";
                }
            }
        }
        catch(e){
            alert("Error while fetching the field object : " + e.message);      //NO I18N
        }

        if($se.isFormComponent && $se.form) {
            if (fieldId == "SERVICE_SLA" && $req.form.sla_options) {
                let id = jQuery("#servicesla-selected").attr("data-id");    //No I18N
                let as_id = jQuery("#servicesla-selected").attr("data-association-id");   //No I18N
                let val = as_id ? as_id : id;
                for (const item of $req.form.sla_options) {
                    if (val === item.id) {
                        return item.sla.id;
                    }
                }
            }
            var fname;
            if(fieldObject.length==0){
                fname = $se.form.fafr_key_map[fieldId];
            }
            else{
               fname = fieldObject.attr("name");   //No I18N
            }
            if($se.isResource(fieldId) && (isManual || typeof isManual !== "boolean")) {
                var fvalue = $se.form.getFieldValue(fname);
                if(fvalue===undefined){
                    fvalue = $se.form.getFieldText(fname);
                }
                if(fvalue && fvalue == getMessageForKey('sdp.requests.fieldFormRules.rules.notspecified')) {  //No I18N
                    fvalue = "0";   //No I18N
                }
            } else {
                var fvalue = $se.form.getFieldValue(fname, true);
                if((fvalue==undefined || $se.form.getDOMValueObj(fname)==null) && $se.form && $se.form.entitydata && $se.form.entitydata.hasOwnProperty([fname])){
                    if(fname == undefined){
                        fname=$se.form.fafr_key_map[fieldId];
                    }
                    fvalue=$se.form.getEnityValue(fname, true);
                    if(fvalue==null){
                        return "";
                    }
                }
                var datatype=["number","date","datetime","double","long"]; //No I18N
                if(fvalue === null && (datatype.includes($se.fieldsJson.getFieldType(fieldId) ))) {
                    fvalue = "";    //No I18N
                }
            }
            if(fieldId === "SITE" && sdp_user.USERTYPE === "Requester" && (!checkIfMSP() || sdp_user.ROLES.indexOf("SDAccountManager") == -1) && $req.form.requester_info) {    //No I18N
                // fvalue = ($req.form.requester_info.department && $req.form.requester_info.department.site) ? $req.form.requester_info.department.site.id : ($se.form.fields.site ? $se.form.fields.site.default_id : undefined);
                // if ($req.form.obo_info) {
                //     fvalue = ($req.form.obo_info.department && $req.form.obo_info.department.site) ? $req.form.obo_info.department.site.id : ($se.form.fields.site ? $se.form.fields.site.default_id : undefined);
                // }
                // fvalue = ($se.form.fields.site && $se.form.fields.site.field_value && $se.form.fields.site.edit) ? $se.form.fields.site.field_value.id : fvalue;
                fvalue = $se.form.fields.values.site;
            }
            if(fieldId === "EMAILCC" && fvalue && fvalue.constructor === Array) {   //No I18N
                fvalue = fvalue.join(",");  //No I18N
            }
            return fvalue;
        }

        /* check form on details rules */
        if($se.onDetailPage){
            if($se.isResource(fieldId)){
                var position = fieldId.match("_QUS_");
                var resource = "resource_"+fieldId.slice(4,position.index); //NO I18N
                var question = "question_"+fieldId.slice(position.index+5,fieldId.length); //NO I18N
                /* request API value*/
                var detail = $req.details.request_info.resources;
                if(detail[resource][question]){
                    /* check for assets value resources*/
                    if(jQuery.type(detail[resource][question]) === "object" && Object.keys(detail[resource][question]).length ){
                       return detail[resource][question].id;
                    }else if(jQuery.type(detail[resource][question][0]) === "object"){
                        return detail[resource][question][0].id;
                    }
                    else{
                      return detail[resource][question];
                    }
                }else if(fieldType === "multiselect"){ //NO I18N
                    return 0;
                }else{
                    return "";
                }
            }else{
                var detail = $req.details.request_info;
                //EmailCC,REASON,DESCRIPTION is not working
                var fieldName = jQuery('[fafr-name='+fieldId+']').attr('data-name');
                if(fieldId.lastIndexOf("udf_") !== -1){
                    var value = $req.details.request_info.udf_fields[fieldName];
                    if(fieldType === "multipleselect" && !value.length){
                        return null;
                    }else if(fieldType==="multiselect" && value === null){ //NO I18N
                        return 0;
                    }else if(fieldType === "date"){ //NO I18N
                        if(Object.keys(value).length){
                            return new Date(parseInt(value.value));
                        }
                    }else{
                        return value;
                    }
                }
                if(fieldType === "textarea"){
                    fieldType = "text"; //NO I18N
                }
                switch(fieldType){
                    case "multiselect": //NO I18N
                        if(Object.keys(detail[fieldName]).length){
                            return (detail[fieldName].id).toString();
                        }else{
                            return "0";
                        }
                        break;
                    case "text": //NO I18N
                        if(detail[fieldName] && detail[fieldName].length){
                            return detail[fieldName];
                        }
                        return "";
                        break;
                    case "date": //NO I18N
                        if(Object.keys(detail[fieldName]).length){
                            return new Date(parseInt(detail[fieldName].value));
                        }else{
                            return undefined;
                        }
                        break;
                    case "multipleselect": //NO I18N
                        if(detail[fieldName] && detail[fieldName].length){
                            return detail[fieldName];
                        }else{
                            return null;
                        }

                }
            }
        }

        //for details view page, we don't have subject as a field thus we get the content of subject using a global variable ($se.subjectValue).
        if(fieldId==='SUBJECT' && $se.isInlineView){
            //window.req_module is true in the details page
            if(window.req_module){
                return $req.details.request_info.subject;
            }
            return $se.subjectValue;
        }
        else if(fieldId==='DESCRIPTION'){
            return $CS.getDescription();
        }
        else if(fieldType==='date' || fieldType==='datetime'){  //No I18N
            var val=fieldObject.val();
            if(!fieldObject.length){
                var detail = $req.details.request_info;
                var fieldName = jQuery('[fafr-name='+fieldId+']').attr('data-name');
                val = detail[fieldName] ?  detail[fieldName].value : val = "";
            }
            return val?new Date(parseInt(val)):val;
        }
        else if(isDynamicLoadingField(fieldObject) && fieldType==='multipleselect'){
            //only multiselect dynamic loading fields need to be handled seperately.
            var values = [];
            //not using select2("val") to retrieve the selected values, as it breaks when the options have a comma in the text
            fieldObject.select2("data").each(function(ele){ //No I18N
                values.push(ele.id);
            });
            return values;
        }
        else if(fieldType==='multipleselect'){
            var values = [];
            fieldObject.select2("data").each(function(ele){ //No I18N
                values.push(ele.id);
            });
            return values;
        }
        else if(fieldType==='multicheckbox' || fieldType==='checkbox' || fieldType==='radio'){
            var valuesArr=[];
            //using getFieldObject method of $se.fieldsJson object to get field attributes such as label, id , type and allowed values.
            var valuesObj=$se.fieldsJson.getFieldObject(fieldId).AllowedValues;
            //for checkbox getValue should return checkbox title (not value), especially for existing CIs
            fieldObject.filter(function(){return jQuery(this).prop('checked');}).each(function(){//NO I18N
            /*
                Need to Check Later
                fieldObject.find('[type=checkbox]').filter(function(){return jQuery(this).prop('checked');}).each(function(){//NO I18N
             */
                var val=this&&this.getAttribute("data-optionid")?this.getAttribute("data-optionid"):jQuery(this).val();
                var allowedValue = valuesObj[val];
                //if(allowedValue){
                    if(typeof allowedValue === 'object'){
                        //for resource questions, allowed values are an object with value and cost as properties
                        allowedValue = allowedValue.id;
                    }else{
                        allowedValue = val;
                    }
                    if(fieldType==='radio'){
                        //for radio fields, getValue should return a string
                        valuesArr=allowedValue;
                    }else{
                        valuesArr.push(allowedValue);
                    }
                //}
            });
            return valuesArr;
        }
        else if(isSelectField(fieldObject)){
            if(!fieldObject.select2("data")&&window.req_module){
                var fieldName = jQuery("[fafr-name=" + fieldId + "]").attr("data-name");
                var value = $req.details.request_info[fieldName]
            }
            else{
                var value = fieldObject.select2("data").id;     //NO I18N
            }
            if(value!=='null'){
                return value; //NO I18N
            }
            else{
                return "0";//NO I18N
            }
        }
        else if(fieldId=="EMAILCC" || fieldId=="REQUESTER.ASSETS" && window.req_module){
            if(!!fieldObject.select2("data")) {
                var values = [];
                fieldObject.select2("data").each(function(ele){ //No I18N
                    values.push(ele.id);
                });
                return (fieldId)==="EMAILCC" ? values.join(",") : values;   //No I18N
            }
            return "";
        }
        else if(fieldObject){
            return fieldObject.val();
        }
    },
    //Method to handle udf name changes during migration
    getNewUDFName=function(fieldId){
        if ($se.udf_mapping_names && ((PORTALID==1&&($se.udf_mapping_names.hasOwnProperty(fieldId)||$se.udf_mapping_names.hasOwnProperty("ServiceCatalog_Fields_"+fieldId)))||(PORTALID!=1&&($se.udf_mapping_names.hasOwnProperty(fieldId)||$se.udf_mapping_names.hasOwnProperty("ServiceCatalog_Fields_"+PORTALID+"_"+fieldId))))) {
            if($se.udf_mapping_names.hasOwnProperty(fieldId)){
                return $se.udf_mapping_names[fieldId];
            }
            else{
                if(PORTALID==1){
                    return $se.udf_mapping_names["ServiceCatalog_Fields_"+fieldId];
                }
                else{
                    return $se.udf_mapping_names["ServiceCatalog_Fields_"+PORTALID+"_"+fieldId];    //NO I18N
                }
            }
        } else {
            return fieldId;
        }
    },
    getRequesterDetails=function(fieldId){
        fieldId=getNewUDFName(fieldId);
        //to get new api requester key of the old one.
        var requesterIdMap = {
            "JOBTITLE": "jobtitle",//NO I18N
            "DEPARTMENT": "department.name",//NO I18N
            "EMAILID": "email_id",//NO I18N
            "MOBILE": "mobile",//NO I18N
            "CONTACTNUMBER":"phone",//NO I18N
            "EMPLOYEEID": "employee_id",//NO I18N
            "USERID": "id",//NO I18N
            "USERNAME": "name",//NO I18N
            "LOGINNAME": "login_name",//NO I18N
            "DOMAINNAME": "domain.name",//NO I18N
            "REQUESTER": "name",//NO I18N
            "SITE": "department.site.name",//NO I18N
            "ISVIPUSER": "is_vipuser"//NO I18N
        };
        var requesterId = fieldId.split(".");

        //handles user additional fields.
        if(requesterId[1] === "user_udf_fields") {
            var value = $se.requesterDetails.user_udf_fields[requesterId[2]];
            if(value === null || value === undefined) {
                return value;
            }
            if(value.hasOwnProperty('value') && isInteger(value.value)){
                return new Date(parseInt(value.value));//to get value of date
            }
            return value;
        }

        if(requesterId[0] === "REQUESTER") {
            requesterId = requesterId[1] !== undefined ? requesterId[1] : "REQUESTER";
            if(typeof requesterIdMap[requesterId] != "undefined"){
                fieldId = requesterIdMap[requesterId].split(".");
            }else{
                return undefined;
            }
        } else {
            fieldId = requesterId.slice(1); //if new API key is passed.
        }

        var value = $se.requesterDetails;

        //if the given field is an property of an object then traversing through the object to get the field.
        //e.g "department.site.name"
        for(var i = 0, n = fieldId.length;i < n; i++) {
            if(value == null) {
                break;
            }
            value = value[fieldId[i]];
        }
        return value||"";
    },
    //this method return options of select field if it contains given value as option's "value" attribute
    filterOptionsForValue=function($fieldObject,value){
        if($se.isFormComponent && $se.form) {
            var fname = $fieldObject.attr("name");
            if($se.form.fields[fname] && $se.form.fields[fname].allowedIds) {
                if($se.form.fields[fname].allowedIds.indexOf(value) > -1) {
                    return [value];
                } else {
                    return [];
                }
            } else {
                return [];
            }
        } else {
            return $fieldObject.find('option').filter(function(){
                return jQuery.trim(jQuery(this).val()) === jQuery.trim(value);//NO I18N
            });
        }
    },
   /* this method return the key or value of the Select Approval Field */
   getSelectApprovalOptionsKey=function(values,valueType){
        var textValues = [];
        var objectApprover = jQuery("#selApprs").find('option');
        var len = objectApprover.length;
        for(var i=0;i<len;i++){
            var pos= objectApprover[i].text.indexOf('[');
            var appValue = objectApprover[i].text.slice(0,pos-1);
            if(pos==-1){
                appValue = objectApprover[i].text;
            }
            if(values.indexOf(appValue)!=-1){
                if(valueType==true){
                    textValues.push(objectApprover[i].value);
                }
                else{
                    textValues.push(objectApprover[i].text);
                }
            }
        }
        return textValues;
    },
    
    //set option id or value of a field with data-field as fieldId
    setValue=function(fieldId,value,isResMulticheck,forUnset) {
        //If current value and new value is same for dependent fields, don't set value
        fieldId=getNewUDFName(fieldId);
        var curVal = $CS.getValue(fieldId);
        var depFields = ["CATEGORY", "SUBCATEGORY", "ITEM", "SITE", "GROUP", "TECHNICIAN"]; //No I18N
        if(depFields.indexOf(fieldId) != -1 && curVal && value && curVal.toString() === value.toString()) {
            return;
        }
        if ($se.skipRuleFields.includes(fieldId)) {
            return;
        }
        var fieldObject=$se.element(fieldId);
        var fieldType=$se.fieldsJson.getFieldType(fieldId);
        if($se.isFormComponent && $se.form) {
            if (fieldId == "SERVICE_SLA" && $req.form.sla_options) { //No I18N
                for (const item of $req.form.sla_options) {
                    if (value === item.sla.id) {
                        $req.form.selectSLA(item.id);
                        break;
                    }
                }
                return;
            }
            var fname = fieldObject.attr("name");   //No I18N
            if(fieldId === "CREATEDDATE") {
                return;
            } else if(fieldId === "EMAILCC" && value) { //No I18N
                if(sdp_user.USERTYPE === "Technician"){ //No I18N
                    value = value.split(",");  //No I18N
                    value = value.map(function(item) {
                        item = item ? item.trim() : item;
                        return {
                            id: item,
                            name: item
                        };
                    });
                }
            } else if((fieldType == "text" || fieldType == "string" || fieldType == "textarea") && value && value.constructor ===  Array && fieldId !== "REQUESTER.ASSETS") {  //No I18N
                value = value.join(",");    //No I18N
            }
            if($se.form.options.isAddIn==true && fieldId=="STATUS"){
                return;
            }
            if(fieldType=="boolean"){
              value = (value === "1") ? true : false  
            }
            $se.form.setFieldValue(fname, value);
            return;
        }

        if(!fieldObject.length){
            return;
        }
        if(isDynamicLoadingField(fieldObject)){
            var dynamicFieldName = fieldObject.data("fieldName"); //No I18N
            value = getArray(value);
            var setValues = [];
            for(var i=0, len=value.length; i<len; i++){
                if(value[i] === "0"){
                    //in the code below, we clone and remove children to get the field name, to avoid issues when the field is mandated or has help text added.
                    var displayName = fieldObject.parents(".fafr-row").find(".fafr-label").clone().children().remove().end().text().trim(); //No I18N
                    var placeHolderText = "-- " + getMessageForKey("sdp.common.select") + " " + displayName + " --";
                    if(window.req_module){
                        placeHolderText = getMessageForKey("sdp.requests.fieldFormRules.rules.notspecified");
                    }
                    setValues.push({"id":0, "text":placeHolderText});
                }else{
                    if(typeof value[i] === "object"){
                        var option={};
                        option.id=value[i].id;
                        if(value[i].name){
                            option.text=value[i].name;
                        }
                        setValues.push(option);
                    }
                    else if(indexInArrayOfObjects(dynamicLoading.optionsMap[dynamicFieldName], "text", value[i]) > -1&&isResMulticheck){
                        //if the value is currently present in the field's options
                        var option = {};
                        option.id = dynamicLoading.optionsMap[dynamicFieldName][indexInArrayOfObjects(dynamicLoading.optionsMap[dynamicFieldName], "text", value[i])].id;
                        option.text = value[i];
                        setValues.push(option);
                    }else if(indexInArrayOfObjects(dynamicLoading.optionsMap[dynamicFieldName], "id", value[i]) > -1){
                        //if the value is currently present in the field's options
                        var option = {};
                        option.id = value[i];
                        option.text = dynamicLoading.optionsMap[dynamicFieldName][indexInArrayOfObjects(dynamicLoading.optionsMap[dynamicFieldName], "id", value[i])].text;
                        setValues.push(option);
                    }
                }
            }
            if(!fieldObject[0].hasAttribute("multiple")){
                //for picklist fields alone
                setValues = setValues[0];
            }
            fieldObject.select2("data", setValues); //No I18N
        }
        else if(fieldType==='multicheckbox'||fieldType==='checkbox'||fieldType==='radio'){
            values = getArray(value);
            value = values;
            if($se.refer_fields && $se.refer_fields.includes(fieldId)){
                value = value.map(function(val, ind) {
                    return val.name;
                });
            }
            if(((fieldType==='multicheckbox' && isResMulticheck)||(fieldType==='checkbox' && isResMulticheck)||(fieldType==='radio' && isResMulticheck)||($se.isResource(fieldId) && fieldType=="radio" && isResMulticheck))&&($CS.element(fieldId) && $se.refer_fields && !$se.refer_fields.includes(fieldId))){
                // when users set fafr using the Set Field dropdown, we store the
                var allowedValues=$se.fieldsJson.getAllowedValues(fieldId);
                //for checkbox setValue function accepts titles directly, especially for existing CIs
                value = [];
                var j=0;
                for(var i in allowedValues){
                    if(values.indexOf(allowedValues[i]) !== -1){
                        value[j++]=i;
                    }
                }
            }

            var oldValues = $CS.getValue(fieldId);
            var newValues = value;
            var unsetValues = [];
            var setValues = [];
            if(fieldType==='radio'){
                setValues = value;
                if(setValues[0] !== oldValues){
                    unsetValues = getArray(oldValues);
                }
            }else{
                for(var i=0,len=oldValues.length; i<len; i++){
                    if(newValues.indexOf(oldValues[i]) === -1){
                        unsetValues.push(oldValues[i]);
                    }
                }
                for(var i=0,len=newValues.length; i<len; i++){
                    if(oldValues.indexOf(newValues[i]) === -1){
                        setValues.push(newValues[i]);
                    }
                }
            }
            newValues = filterArrayInCheckBox(fieldObject,setValues);
            if(unsetValues.length>0){
                unsetValue(fieldId,unsetValues);
            }
            //removing all checked options for field
            /* Need to check Again
            fieldObject.find('[type=checkbox]').prop('checked',false);//NO I18N
            */
            // fieldObject.prop('checked',false);//NO I18N
            //checking all options for field found in value array
            newValues.prop('checked',true);//NO I18N

            for(var i=0,len=newValues.length; i<len; i++){
                fireEvent(null,"change",newValues[i]); //No I18N
            }
        }
        else if(fieldType==='date'|| fieldType==='datetime'){   //NO I18N
            //setting value for created date field is not allowed
            if(fieldId==='CREATEDDATE'){
                return;
            }
            if(value!==''&&value instanceof Date){
                fieldObject.val(value.getTime());
                displayClientTime(fieldObject.attr('id'));
                fieldObject.parents('.rows').eq(0).find('input#'+ fieldId +'_Display')  //NO I18N
                            .removeClass().addClass("dateFieldForceLTR tl form-control advsearch-input-cal");
            }
            else
            {
                fieldObject.val("");
                displayClientTime(fieldObject.attr('id'));
                fieldObject.parents('.rows').eq(0).find('input#'+ fieldId +'_Display')  //NO I18N
                            .removeClass().addClass("dateFieldForceLTR tl form-control advsearch-input-cal");
            }
        }
        else if(fieldType==='multipleselect'){
            var val=value;
            if(fieldId==='APPROVERS' && value[0]!=undefined && value[0].endsWith('_orgRoleId')==false){
                value = getSelectApprovalOptionsKey(value,true);
            }else if(fieldId==="SERVICE"){  //NO I18N
                if(!forUnset)
                {//If called during unset for retaining values,does not need allowed values check
                    for(var i=0; i<value.length; i++){
                        value[i] = $se.fieldsJson.getAllowedValues(fieldId)[value[i]];
                    }
                }

            }
            else if(fieldId==="ASSET") {
                var selectVal = [];
                var assetName;
                var succFunc = function (data) {
                    if (data.length !== 0 && data[0]['children'].length !== 0) {
                        var selData = data[0]['children'][0];
                        if (selData['text'] === assetName) {
                            selectVal.push(selData);
                        }
                    }
                };
                for (var i = 0; i < value.length; i++) {
                    assetName = value[i];
                    var url = '/selectci.json?searchText=' + encodeURIComponent(assetName);//NO I18N
                    sdpAjax({
                        url: url,
                        async: false,
                        dataType: 'jsonp',//NO I18N
                        success: succFunc
                    });
                }
                if (selectVal.length) {
                    jQuery('#assetlist').select2('data', selectVal);//NO I18N
                }
            }
            else if(fieldObject.attr("data-ref-field")=="true"){
                value.text=value.name;
                fieldObject.select2('data', value); //NO I18N
            }
            if(value.length==0){
                value=val;
            }
            //for mutiple select type field we use select2 plugin, thus setting value of field using the API of select2 plugin.
            if(fieldId !== "ASSET" && value){
                if(window.req_module){
                    var revObject=$se.getAllowedOptionsObject(fieldId);
                    if(Array.isArray(value)){
                        for(i=0;i<value.length;i++){
                            if(revObject[value[i]]){
                                value[i]=revObject[value[i]];
                            }
                        }
                    }
                    else{
                        value[i]=revObject[value[i]];
                    }
                }
                fieldObject.select2("val",value);//NO I18N
                fieldObject.data('select2').close();//NO I18N
            }
        }
        //Site is a special case here since based on Global Config we might have Site field as select field or auto-completable input field. Thus we are getting value of Site field based on wether it is select field.
        else if((fieldId==='SITE'&&!isSelectField(fieldObject)) ||( (fieldId==='TECHNICIAN' ||fieldId==='CHANGEMANAGER' ) && $se.module == 'CHANGE')){
            //Get allowed values of a given field in {value:text} format
            var fieldOptions=$se.getOptionsObject(fieldId);//NO I18N
            var text = "";
            if(fieldOptions[value]){
                text = fieldOptions[value];
            }
            if(text =="" &&($se.module == 'CHANGE'))
            {
                return;
            }
            if(window.req_module|| $se.module == 'CHANGE' ){
                //in the details page, the site field is a select2 component, built on top over an <input> element.
                fieldObject.select2("data",{"id":value, "text":text}); //No I18N
            }else{
                //for new request/global edit in case of more than 100 sites...
                fieldObject.val(value);
                jQuery('#siteID_siteSearch').val(text);
            }
        }
        else if(fieldType==='select'||fieldType==='multiselect'||fieldType==='lookup'){
            if(filterOptionsForValue(fieldObject,value).length){
                //Fix for Disabled fields
                fieldObject.select2('val', value); //NO I18N
            }else if(fieldObject.attr("data-ref-field")=="true"){
                value.text=value.name;
                fieldObject.select2('data', value); //NO I18N
            } else {
                if(window.current_req_mode === "kanban") {
                    return false;
                }
            }
        }
        else if(window.req_module && (sdp_user.USERTYPE == "Technician") && (fieldId == "EMAILCC")) {  //No I18N
            value = value ? value.split(",") : [];  //No I18N
            value = value.map(function(item) {
                item = item ? item.trim() : item;
                return {
                    id: item,
                    name: item
                };
            });
            fieldObject.select2("data", value);//NO I18N
        }
        else if(fieldObject){
            if(fieldId=="REQUESTER"){
                sdpAjax({
                    url: '/api/v3/requests/requester',//no i18n
                    cache:false,
                    async:false,
                    data: {input_data: sdpToJSON({list_info:{search_criteria:{condition: "is",field: "name",value: value}}})},
                    success:function(data){
                        if(data.requester[0]){
                            fieldObject.select2("data",{id:data.requester[0].id,name:data.requester[0].name});//no i18n
                            value=data.requester[0].id;
                        }else{
                            fieldObject.select2("data",{id:0,name:value,value:value});   //no i18n
                        }

                    }
                });
            }
            fieldObject.val(value);
            if(fieldId==='INITIATOR' && $se.module == 'CHANGE')
            {
                jQuery("#requesterID").select2('data',{name:value,id:0}).removeClass('error-text');//No I18N
            }
        }
        //triggering resource modified, which will update resourceModifiedOne/resourceModifiedTwo field that value is updated, otherwise value will not be updated after saving the form.
        if($se.isResource(fieldId)){
            setResourceModified();
        }

        //checking for value undefined when inactive options are not listed, onchange trigger should not happen
        if(!(fieldType==='multicheckbox'||fieldType==='checkbox'||fieldType==='radio') && value!=undefined){
            if(fieldObject[0].hasAttribute("data-dynamic-options") && fieldObject.data().select2){
                fireEvent(fieldId, 'select2.change'); //No I18N
            }else{
                if(fieldObject[0].hasAttribute("disabled")){
                    //removing the dsiabled attribute, as events are not fired for disabled input fields in IE and Firefox
                    var isDisabled = true;
                    fieldObject[0].removeAttribute("disabled");
                }
                fireEvent(fieldId,'change');//NO I18N
            }
            if(isDisabled){
                fieldObject.prop("disabled",true);//NO I18N
            }
        }
        return true;
    },
    //get selected display option text value of a field with attribute data-field as fieldId
    getText=function(fieldId,form){
        fieldId=getNewUDFName(fieldId);
        if(fieldId === "TEMPLATE" && $se.module != 'CHANGE') {
            if(window.req_module){
                return $req.form.template.name ? $req.form.template.name :  $req.details.request_info.template.name;
            }else{
                if($se.module=="INCIDENT" ||  jQuery("#req_template_name").length ==0) {
                    return jQuery('[name="reqTemplate"]').select2("data").text;//no i18n
                }else {
                    return jQuery("#req_template_name").text();
                }
            }
        }
            if(form!=undefined){
                let form_id=$CS.findElement(form).attr("data-formid")
               return FC_Mapper[form_id]?FC_Mapper[form_id].getFieldText(fieldId):null;
            }
        var fieldObject=$se.elementUsedInGetValue(fieldId);

        if($se.isFormComponent && $se.form) {
            if (fieldId == "SERVICE_SLA" && $req.form.sla_options) { //No I18N
                let val = jQuery("#servicesla-selected").find(".servicesla_name").text();
                return val;
            }
            var fname = fieldObject.attr("name");   //No I18N
            if(fieldId === "SITE" && sdp_user.USERTYPE === "Requester" && (!checkIfMSP() || sdp_user.ROLES.indexOf("SDAccountManager") == -1) && $req.form.requester_info) {    //No I18N
                // var svalue = ($req.form.requester_info.department && $req.form.requester_info.department.site) ? $req.form.requester_info.department.site.name : ($se.form.fields.site ? $se.form.fields.site.default_name : undefined);
                // if ($req.form.obo_info) {
                //     svalue = ($req.form.obo_info.department && $req.form.obo_info.department.site) ? $req.form.obo_info.department.site.name : ($se.form.fields.site ? $se.form.fields.site.default_name : undefined);
                // }
                // return ($se.form.fields.site && $se.form.fields.site.field_value && $se.form.fields.site.edit) ? $se.form.fields.site.field_value.name : svalue;
                var svalue = undefined;
                if ($se.form.fields.site) {
                    svalue = jQuery($se.form.fields.site.container).find("p[data-name='site']").text(); //No I18N
                }
                return svalue;
            }
            if(fieldId == "ATTACHMENT") {
                if($rf.fields.attachments && $rf.fields.attachments.value.length) {
                    var attach_arr = $rf.fields.attachments.attachments.filter(function(val) {
                        return $rf.fields.attachments.value.indexOf(val.id) !== -1;
                    });
                    if($rf.fields.attachments.added && $rf.fields.attachments.added.length) {
                        var added_arr = $rf.fields.attachments.added.filter(function(val) {
                            return $rf.fields.attachments.value.indexOf(val.id) !== -1;
                        });
                        attach_arr = attach_arr.concat(added_arr);
                    }
                    if(attach_arr.length) {
                        return getNames(attach_arr);
                    }
                }
            }
            return $se.form.getFieldText(fname);
        }

        if($se.onDetailPage){
            if($se.isResource(fieldId)){
                var position = fieldId.match("_QUS_");
                var resource = "resource_"+fieldId.slice(4,position.index); //NO I18N
                var question = "question_"+fieldId.slice(position.index+5,fieldId.length); //NO I18N
                var detail = $req.details.request_info.resources;
                if(Object.keys(detail[resource][question]).length){
                    if(jQuery.type(detail[resource][question]) === "object"){
                        return detail[resource][question].name;
                    }else{
                       return detail[resource][question];
                    }
                }else{
                    return getMessageForKey("sdp.servicerequest.resource.question.unanswered.text"); //NO I18N
                }
            }else{
                var detail = $req.details.request_info;
                var fieldName = jQuery('[fafr-name="'+fieldId+'"]').attr('data-name');  //NO I18N
                if(fieldId.indexOf("udf_") !== -1){
                    var value = $req.details.request_info.udf_fields[fieldName];
                    if(["datetime","date"].indexOf($se.fieldsJson.getFieldType(fieldId))!=-1){
                        return value;
                    }
                    if(typeof value === 'object'){
                        return Array.isArray(value)?value.map(item => item.name?item.name:item.id):(value.name?value.name:value);
                    }
                    if(value){
                        return value;
                    }else{
                        return getMessageForKey("sdp.servicerequest.resource.question.unanswered.text"); //NO I18N
                    }
                } else if(fieldId == "ATTACHMENT" && detail.attachments && detail.attachments.length) { //NO I18N
                    return getNames(detail.attachments);
                }
                if(Object.keys(detail[fieldName]).length){
                    var val = detail[fieldName].name;
                    if(Array.isArray(detail[fieldName]) && typeof detail[fieldName][0] === "object") {
                        val = [];
                        for(var i = 0, len = detail[fieldName].length; i < len; i++) {
                            val.push(detail[fieldName][i].name);
                        }
                    }
                    return val;
                }else{
                    return getMessageForKey("sdp.servicerequest.resource.question.unanswered.text"); //NO I18N
                }
            }
        }
        var fieldType=$se.fieldsJson.getFieldType(fieldId);
         if($se.module === 'CHANGE' && (fieldId === 'SERVICE' || fieldId === 'ASSET' || fieldId === 'CI')) {
             //create text for SERVICE,ASSET and CI in change module
            var value = [];
            fieldObject.find("option").each(function(i, o) {
                value.push(o.text);
            });
            return value;
        }
        else if(isDynamicLoadingField(fieldObject)){
            //dynamic loading is only enabled for udf field, whose option id and text are the same
            let sel_data = fieldObject.select2("data");  //No I18N
            if (Array.isArray(sel_data)) {
                return sel_data.map(item => item.text ? item.text : item.id);
            } else {
                return sel_data.text ? sel_data.text : sel_data.id;
            }
        }
        else if(isSelectField(fieldObject)){
            if(fieldObject.attr('multiple'))
            {
                return getValue(fieldId);
            }
            else
            {
                var text=getMessageForKey("sdp.requests.fieldFormRules.rules.notspecified");
                if($se.module==='CHANGE'){
                    if(getValue(fieldId)!==""||(getValue(fieldId)==="0"&&fieldId==='SITE')){
                        text=fieldObject.find(':selected').text();
                    }
                }else{
                    if(getValue(fieldId)!=="0"||(getValue(fieldId)==="0"&&fieldId==='SITE')){
                        if(fieldObject.find(':selected').attr("disp-value")){
                        text=fieldObject.find(':selected').attr("disp-value");
                    }else{
                        text=fieldObject.find(':selected').text();
                    }
                  }
                }
                return jQuery.trim(text);
            }
        }
        else if(fieldType==='multicheckbox' || fieldType==='checkbox' || fieldType==='radio'){
            var valuesArr=[];
            var valuesObj=$se.fieldsJson.getFieldObject(fieldId).AllowedValues;
            fieldObject.filter(function(){return jQuery(this).prop('checked');}).each(function(){//NO I18N
                var val=jQuery(this).val();
                var allowedValue = valuesObj[val];
                if(typeof allowedValue === 'object'){
                    allowedValue = allowedValue.value;
                }else{
                    allowedValue = val;
                }
                if(fieldType==='radio'){
                    valuesArr=allowedValue;
                }else{
                    valuesArr.push(allowedValue);
                }
            });
            return valuesArr;
        }
        else if(fieldType==="textarea"||fieldType==="text"){
            return fieldObject.val().trim();
        }
        //Site is a special case here since based on Global Config we might have Site field as select field or auto-completable input field. Thus below we are using getValue method to get value of SITE and than converted to text label
        else if(fieldId==='SITE' ||( (fieldId==='TECHNICIAN' ||fieldId==='CHANGEMANAGER') && $se.module == 'CHANGE')){
            var value=getValue(fieldId);
            var text=getMessageForKey("sdp.requests.fieldFormRules.rules.notspecified");
            if(value!=="0"){
                //Get allowed values of a given field in {value:text} format
                text=$se.getOptionsObject(fieldId)[value];
            }
            return jQuery.trim(text);
        }
        //if priority matrix is enabled and override is disabled
        else if(fieldId==="PRIORITY" && jQuery("#Priority_Phrase").length > 0){
            return jQuery("#Priority_Phrase").text();
        }
        //Handle attachment field
        else if(fieldId==="ATTACHMENT" && window.req_module && $req.details.request_info.attachments && $req.details.request_info.attachments.length) { //NO I18N
            return getNames($req.details.request_info.attachments);
        }
        else if(fieldId=="EMAILCC" || fieldId=="REQUESTER.ASSETS" && window.req_module) {
            if(!!fieldObject.select2("data")) {
                var values = [];
                fieldObject.select2("data").each(function(ele){ //No I18N
                    values.push(ele.name);
                });
                return values;
            }
            return "";
        }
        //Method to return attachment names
        function getNames(attachments) {
            var att_arr = [];
            jQuery.each(attachments, function(ind, val) {
                att_arr.push(val.name);
            });
            return att_arr;
        }
    },
    //set selected display option text value of a field with attribute data-field as fieldId and display text as text
    setText=function( fieldId,text ){
        fieldId=getNewUDFName(fieldId);
        var fieldObject=$se.element(fieldId);
        if ($se.skipRuleFields.includes(fieldId)) {
            return;
        }
        if($se.isFormComponent && $se.form) {
            if (fieldId == "SERVICE_SLA" && $req.form.sla_options) { //No I18N
                for (const item of $req.form.sla_options) {
                    if (text === item.sla.name) {
                        $req.form.selectSLA(item.id);
                        break;
                    }
                }
                return;
            }
            var fname = fieldObject.attr("name");   //No I18N
            if($se.form.options.isAddIn==true && fieldId=="STATUS"){
                return;
            }
            $se.form.setFieldByText(fname, text);
            return;
        }

        var textArray = getArray(text);
        var fieldType = $se.fieldsJson.getFieldType(fieldId);
        if(isDynamicLoadingField(fieldObject)){
            //for udf fields, the id and text for options will be the same
            setValue(fieldId, text,true);
        }
        if(isSelectField(fieldObject)){
            for(var i=0; i<textArray.length; i++){
                //testing whether any option exist for given label and based on that getting "value" of option.
                var valueId=filterTextInOptions(fieldObject,text).val() || "";
                setValue(fieldId,valueId);
            }
        }
        //Site is a special case here since based on Global Config we might have Site field as select field or auto-completable input field. Thus we are setting value of Site field based on wether it is select field.
        else if(fieldId==='SITE' ||( (fieldId==='TECHNICIAN' ||fieldId==='CHANGEMANAGER') && $se.module == 'CHANGE') ){
            var fieldOptions=$se.getAllowedOptionsObject(fieldId);//NO I18N
            if(fieldOptions[text]){
                if(window.req_module ||fieldId==='TECHNICIAN' ||fieldId==='CHANGEMANAGER' ){
                    //in the details page, the site field is a select2 component, built on top over an <input> element.
                    fieldObject.select2("data",{"id":fieldOptions[text], "text":text}); //No I18N
                    fieldObject.change();
                    // fireEvent(null,"change",fieldObject);
                }else{
                    fieldObject.val(fieldOptions[text]);
                    jQuery('#siteID_siteSearch').val(text).trigger('focus').trigger("blur");
                }
            }
        }
        else if (fieldType==="textarea"||fieldType==="text"){
            setValue(fieldId, text);
        }
    },
    //if the field's value is present in the list of options, unset it and trigger the change by 'user_api' event
    // *options should be an array of text values in the case of multiselect fields and id values otherwise
    unsetValue=function(fieldId,options){
        fieldId=getNewUDFName(fieldId);
        var fieldType=$se.fieldsJson.getFieldType(fieldId);
        if ($se.skipRuleFields.includes(fieldId)) {
            return;
        }
        if($se.isFormComponent && $se.form) {
            var fname = fieldObject.attr("name");   //No I18N
            $se.form.unsetFieldOptions(fname, options);
            return;
        }

        var selectedOptions = $CS.getValue(fieldId);

        if(fieldType==="multiselect"){
            selectedOptions = $CS.getText(fieldId);
            if (isDynamicLoadingField($se.element(fieldId))) {
                selectedOptions = $CS.getValue(fieldId);
            }
        }
        if(fieldType==="multicheckbox" || fieldType==="checkbox" || fieldType==="radio"){
            if(fieldType==="radio"){
                options = getArray(options);
            }
            if(window.req_module){
                var allowedValues=$se.fieldsJson.getAllowedValues(fieldId);
                vals=[];
                var j=0;
                for(var i in allowedValues){
                    if(options.indexOf(allowedValues[i]) !== -1){
                        vals[j++]=i;
                    }
                }
                options=vals;
            }
            var fieldObject=$se.element(fieldId);
            options = filterArrayInCheckBox(fieldObject,options);
            var checkOrRadio = true;
        }
        if(checkOrRadio){
            for(var i=0,len=options.length; i<len; i++){
                if(jQuery(options[i]).prop("checked")){
                    jQuery(options[i]).prop("checked", false); //No I18N
                    fireEvent(null,"change",options[i]); //No I18N
                }
            }
        }else if(fieldType==="multiselect" || fieldType==="lookup"){ //No I18N
            if(options.indexOf(selectedOptions) > -1){
                /* assets multiSelect has null Value */
                if($se.isResource(fieldId)){
                  $CS.setValue(fieldId,"null"); //No I18N
                }else{
                    if(typeof requestListViews !== "undefined" && requestListViews.viewMode == "kanban" && !requestListViews.kan_col_id) { //No I18N
                        $CS.setValue(fieldId,$req.prop.field_values[fieldId.toLowerCase()]);
                    } else if ($se.module === "CHANGE") { //No I18N
                        var fldObj = $se.element(fieldId);
                        if (filterOptionsForValue(fldObj, "0").length) {
                            $CS.setValue(fieldId, "0");
                        } else if (filterOptionsForValue(fldObj, "").length) {
                            $CS.setValue(fieldId, "");
                        } else {
                            /*SD-89461 if no option with val '0' or '' is present, then
                                1. one of the remaining options is set.
                                2. if no remaining options empty value is set.
                             */
                            var allFieldOptions = fldObj.find('option');
                            var remainingValues = [];
                            for (var i=0; i<allFieldOptions.length; i++) {
                                var value = allFieldOptions[i];
                                if(options.indexOf(value.text) === -1) {
                                    remainingValues.push(value);
                                }
                            }
                            if (remainingValues.length) {
                                $CS.setValue(fieldId, remainingValues[0].value);
                            } else {
                                fldObj.select2('val', "");
                            }
                        }
                    } else {
                        $CS.setValue(fieldId, "0");
                    }
                }
            }
        }else if(fieldType==="multipleselect"){ //No I18N
            var retainedValues = [];
            if(jQuery.isArray(selectedOptions)){
                for(var i=0,len=selectedOptions.length; i<len; i++){
                    if(options.indexOf(selectedOptions[i]) === -1){
                        retainedValues.push(selectedOptions[i]);
                    }
                }
                if(fieldId=="SERVICE" && $se.module === "CHANGE")
                {/*For service field during remove options,unset is called,and some values are retained, while setting the retained values,
                allowed values check is not needed since already set values are retained.*/
                  $CS.setValue(fieldId,retainedValues,false,true);
                }
                else
                {
                    $CS.setValue(fieldId,retainedValues);
                }
            }
        }
    },

    /**
     * Method to add options to a field with data-field as fieldId
     * @param {String} fieldId id of the field
     * @param {JSON} options json array with values as display option text or object with id and text
     * @param {Boolean=} isIds whether object with id & text is passed in options
     */
    addOptions=function(fieldId,options,isIds){
        fieldId=getNewUDFName(fieldId);
        var htmlOptions=[], optionLen=options.length,fieldObject=$se.element(fieldId);
        if ($se.skipRuleFields.includes(fieldId)) {
            return;
        }
        if($se.isFormComponent && $se.form) {
            if(fieldObject.length === 0) {
                if(isIds) {
                    $se.form.addAllowedValues(fieldId, options);
                } else {
                    $se.form.addAllowedValuesByNames(fieldId, options, "fafr_key"); //No I18N
                }
            } else {
                var fname = fieldObject.attr("name");   //No I18N
                if(isIds) {
                    $se.form.addAllowedValues(fname, options);
                } else {
                    $se.form.addAllowedValuesByNames(fname, options);
                }
            }
            return;
        }

        //get allowed options of field {text:value} pairs
        var allowedValues=$se.getAllowedOptionsObject(fieldId);
        //get type of field using getFieldType method of $se.fieldsJson
        var fieldType=$se.fieldsJson.getFieldType(fieldId);
        //add options to field only if option exist in allowedValues object  and there is no existing option with given text
        if(isDynamicLoadingField(fieldObject)){
            var dynamicFieldName = fieldObject.data("fieldName"); //No I18N
            for(var i=0; i<optionLen; i++){
                var title = options[i];
                if(allowedValues[title] && (indexInArrayOfObjects(dynamicLoading.optionsMap[dynamicFieldName], "text", title) === -1)){
                    //adding the value to the optionsMap Array
                    dynamicLoading.optionsMap[dynamicFieldName].push({id: allowedValues[title], text: title});
                }
            }
            //reloading the select2 component for the changes to be reflected
            dynamicLoading.refreshSelect2(fieldObject, dynamicFieldName);
        }
        if(isSelectField(fieldObject)&&allowedValues){
            for(var i=0;i<optionLen;i++){
                var title=options[i];
                var costEnabled=fieldObject.attr("cost-enabled");
                var hasImages = fieldObject.attr("data-hasimages");
                if(costEnabled === "true"){
                    //We don't store the cost details in the reverse allowedValues object
                    var cost = $se.fieldsJson.getFieldObject(fieldId).AllowedValues[allowedValues[title]].cost;
                    var titleWithCost = title + " - " + sdp_app.CURRENCY_SYMBOL + " " + cost;
                }
                if(!filterTextInOptions(fieldObject,title).length){
                    if(allowedValues[title]){
                        var option = new Option(title,allowedValues[title]);
                        if(costEnabled === "true"){
                            option.setAttribute("data-cost",cost);
                        }
                        if(hasImages === "true"){
                            var imageLinkArr = $se.fieldsJson.getFieldObject(fieldId).AllowedValues[allowedValues[title]].images;
                            if(imageLinkArr.length) {
                                option.setAttribute("data-images",imageLinkArr[0]);
                            }else {
                                option.setAttribute("data-images", "../images/dummyimage.png");
                            }
                        }
                        option.setAttribute("disp-value",title); // NO I18N
                        htmlOptions.push(option);
                    }
                }
            }
            fieldObject.append(htmlOptions);
        }
        else if(fieldType==='multicheckbox'){
            filterArrayInCheckBox(fieldObject,options).each(function(i,element){
                //rscblk : resource block
                jQuery(element).parents('.rscblk').eq(0).removeClass('hide');//NO I18N
            });
            fixHeight();
        }
        else if(fieldType==='checkbox' || fieldType==='radio'){
            filterArrayInCheckBox(fieldObject,options).each(function(i,element){
                jQuery(element).parent().eq(0).removeClass('hide');//NO I18N
            });
        }
        if($se.isFormField(fieldId) && window.req_module){
            //this block is to add the fieldId to the modified options obj
            $req.prop.modified_options[fieldId] = "";
        }
        /* if we removed some option in Approvers and then ON onField change,we added options then
        *  by using processStateChangeUD we added MAIL-ID's with options.
        */
        if(fieldId==='APPROVERS'){
            var req1= getValue('REQUESTER');//NO I18N
                if(req1!=''){
                    processStateChangeUD();
                }
        }
        else if ($se.module === 'CHANGE' && (fieldId === 'TECHNICIAN' || fieldId === 'CHANGEMANAGER')) {
            fieldObject[0].fafrAddOptions = options;
        }

    },

    /**
     * Method to remove options to a field with data-field as fieldId
     * @param {String} fieldId id of the field
     * @param {JSON} options json array with values as display option text or object with id and text
     * @param {Boolean=} isIds whether object with id & text is passed in options
     */
    removeOptions=function(fieldId,options, isIds){
        fieldId=getNewUDFName(fieldId);
        var fieldObject=$se.element(fieldId);
        var skipFireEventFields = ["STATUS"];   //No I18N
        if ($se.skipRuleFields.includes(fieldId)) {
            return;
        }
        if($se.isFormComponent && $se.form) {
            var fname = fieldObject.attr("name");   //No I18N
            if(isIds) {
                $se.form.removeAllowedValues(fname, options);
            } else {
                $se.form.removeAllowedValuesByNames(fname, options);
            }
            return;
        }

        var fieldType=$se.fieldsJson.getFieldType(fieldId);
        var allowedValues=$se.fieldsJson.getAllowedValues(fieldId);
        var optionIds = [];

        if(fieldType!=="multiselect"){
            for(var i=0,len=options.length; i<len; i++){
                optionIds.push(allowedValues[options[i]]);
        }
        unsetValue(fieldId,optionIds);
        }else{
            if(!skipFireEventFields.includes(fieldId)) {
                //using the text values for multiselect fields, as some fields' allowedValues aren't available (technician, group, etc)
                unsetValue(fieldId,options);
            }
        }

        if(fieldId==='APPROVERS'){
            options=getSelectApprovalOptionsKey(options,false);
        }
        else if ($se.module === 'CHANGE' && (fieldId === 'TECHNICIAN' || fieldId === 'CHANGEMANAGER')) {
            fieldObject[0].fafrRemoveOptions = options;
        }
        if(isDynamicLoadingField(fieldObject)){
            var dynamicFieldName = fieldObject.data("fieldName"); //No I18N
            for(var i=0, len = options.length; i<len; i++){
                var title = options[i];
                var index = indexInArrayOfObjects(dynamicLoading.optionsMap[dynamicFieldName], "text", title);
                if(index > -1){
                    //removing the value from the optionsMap Array
                    dynamicLoading.optionsMap[dynamicFieldName].splice(index, 1);
                }
            }
            //reloading the select2 component for the changes to be reflected
            dynamicLoading.refreshSelect2(fieldObject, dynamicFieldName);
        }
        if(isSelectField(fieldObject)){
            if(jQuery.isArray((options))){
                filterArrayInOptions(fieldObject,options).remove();
            }
//            else{
//                getFilteredOptions(fieldObject,options).remove();
//            }
            if(fieldType==='multipleselect'){
                //refreshing select2 for multiselect field after removing options
                refreshSelect2(fieldId);
                if(fieldId==='APPROVERS'){
                    jQuery('#selApprs').select2();
                }
            }
        }
        else if(fieldType==='multicheckbox'){
            filterArrayInCheckBox(fieldObject,options).each(function(i,element){

                //rscblk: resource block
                jQuery(element).parents('.rscblk').eq(0).addClass('hide');//NO I18N
            });
            fixHeight();
        }
        else if(fieldType==='checkbox' || fieldType==='radio'){
            filterArrayInCheckBox(fieldObject,options).each(function(i,element){
                jQuery(element).parent().eq(0).addClass('hide');//NO I18N
            });
        }
        if($se.isFormField(fieldId) && window.req_module){
            //this block is to add the fieldId to the modified options obj
            $req.prop.modified_options[fieldId] = "";
        }
    },
    //below method can be used to filter options based on  wildstring "*" (eg:  ab*, a*b and *ab)
    getFilteredOptions=function($fieldObject,str){
        var wildString=str.replace(/\*/g,'');
        var filterOptions=jQuery();
        if(str.startsWith('*')&&str.endsWith('*')){
            filterOptions=$fieldObject.find('option').filter(function(){
                return jQuery.trim(jQuery(this).val()).indexOf(wildString)!==-1;    //NO I18N
            });
        }
        else if(str.startsWith('*')){
            filterOptions=$fieldObject.find('option').filter(function(){
                return jQuery.trim(jQuery(this).val()).endsWith(wildString);    //NO I18N
            });
        }
        else if(str.endsWith('*')){
            filterOptions=$fieldObject.find('option').filter(function(){
                return jQuery.trim(jQuery(this).val()).startsWith(wildString);    //NO I18N
            });
        }
        return filterOptions;
    },
    //below method can be used to filter checkboxes based on  wildstring "*" (eg:  ab*, a*b and *ab)
    getFilteredCheckBoxes=function($fieldObject,str){
        var wildString=str.replace(/\*/g,'');
        var filterOptions=jQuery();
        if(str.startsWith('*')&&str.endsWith('*')){
            filterOptions=$fieldObject.filter(function(){
                return jQuery.trim(jQuery(this).val()).indexOf(wildString)!==-1;
            });
        }
        else if(str.startsWith('*')){
            filterOptions=$fieldObject.filter(function(){
                return jQuery.trim(jQuery(this).val()).endsWith(wildString);
            });
        }
        else if(str.endsWith('*')){
            filterOptions=$fieldObject.filter(function(){
                return jQuery.trim(jQuery(this).val()).startsWith(wildString);
            });
        }
        return filterOptions;
    },
    //remove all options of select fieldIds.
    removeAllOptions=function(fieldIds){
        fieldIds=getArray(fieldIds);
        for(var i=0,len=fieldIds.length;i<len;i++){
            if ($se.skipRuleFields.includes(fieldIds[i])) {
                return;
            }           
            fieldIds[i]=getNewUDFName(fieldIds[i]);
            if ($se.skipRuleFields.includes(fieldIds[i])) {
                return;
            }
            var fieldType=$se.fieldsJson.getFieldType(fieldIds[i]);
            var selectedOptions=$CS.getValue(fieldIds[i]);
            var fieldObject = $se.element(fieldIds[i]);
            if($se.isFormComponent && $se.form) {
                var fname = fieldObject.attr("name");   //No I18N
                $se.form.removeAllowedValues(fname, "all"); //No I18N
                continue;
            }
            if(fieldType==="multiselect"){
                selectedOptions=$CS.getText(fieldIds[i]);
                if (isDynamicLoadingField(fieldObject)) {
                    selectedOptions = $CS.getValue(fieldIds[i]);
                }
            }
            unsetValue(fieldIds[i],selectedOptions);
            if($se.isFormField(fieldIds[i])){
                // var fieldType=$se.fieldsJson.getFieldType(fieldIds[i]);
                if(isDynamicLoadingField(fieldObject)){
                    var dynamicFieldName = fieldObject.data("fieldName"); //No I18N
                    dynamicLoading.optionsMap[dynamicFieldName] = [];
                    //reloading the select2 component for the changes to be reflected
                    dynamicLoading.refreshSelect2(fieldObject, dynamicFieldName);
                }else if(fieldType == "checkbox" || fieldType==='radio') { //No I18N
                    $se.element(fieldIds[i]).each(function(){
                        jQuery(this).parent().eq(0).addClass("hide");
                    });
                }else if ($se.module == 'CHANGE' && (fieldIds[i] === 'TECHNICIAN' || fieldIds[i] === 'CHANGEMANAGER')) { //NO I18N
                    fieldObject[0].fafrRemoveOptions = [-1];
                }
                else{
                    $se.element(fieldIds[i]).find('option').not('[value=0]').remove();//NO I18N
                    //reinitializing select2 after removing options
                    //$se.element(fieldIds[i]).select2();
                }
                if(window.req_module){
                    //this block is to add the fieldId to the modified options obj
                    $req.prop.modified_options[fieldIds[i]] = "";
                }
            }
            else if($se.isResource(fieldIds[i])){
                if(fieldType==="multicheckbox"){
                    $se.element(fieldIds[i]).each(function(){
                        jQuery(this).parents('label').eq(0).addClass("hide");
                    });
                }else{
                    //for resources field default option value is "null" thus handling
                    $se.element(fieldIds[i]).find('option').not('[value=null]').remove();//NO I18N
                }
            }
        }
    },
    //add All options
    addAllOptions=function(fieldIds){
        fieldIds=getArray(fieldIds);
        for(var i=0,len=fieldIds.length;i<len;i++){
            var allowedValues = $se.getAllowedOptionsArray(fieldIds[i]);
            if($se.isResource(fieldIds[i]) && allowedValues[0]===getMessageForKey("sdp.requests.fieldFormRules.rules.notspecified")){
                //we only have Not Specified in AllowedValues in order to not break any old rules
                allowedValues.splice(0,1);
            }
            var fieldObject=$se.element(fieldIds[i]);
            addOptions(fieldIds[i],allowedValues);
        }
    },
    //diable options of select field
    disableOptions=function(fieldId,options){
        fieldId=getNewUDFName(fieldId);
        var fieldObject=$se.element(fieldId);
        //getting type of field using getFieldType method of $se.fieldsJson object
        var fieldType=$se.fieldsJson.getFieldType(fieldId);
        if(isSelectField(fieldObject)){
            if(jQuery.isArray((options))){
            filterArrayInOptions(fieldObject,options).prop('disabled',true);//NO I18N
        }
//            else{
//                getFilteredOptions(fieldObject,options).prop('disabled',true);//NO I18N
//            }
        }
        else if(fieldType==='multicheckbox'){
            if(jQuery.isArray(options)){
                filterArrayInCheckBox(fieldObject,options).each(function(i,element){
                    jQuery(element).prop('disabled',true).parents('label').eq(0).addClass('ui-opacity5');//NO I18N
            });

        }
//            else{
//                getFilteredCheckBoxes(fieldObject,options).each(function(i,element){
//                    jQuery(element).prop('disabled',true).parents('label').eq(0).addClass('ui-opacity5');//NO I18N
//                });
//            }
            }
    },
    //enable options of select field
    enableOptions=function(fieldId,options){
        fieldId=getNewUDFName(fieldId);
        var fieldObject=$se.element(fieldId);
        var fieldType=$se.fieldsJson.getFieldType(fieldId);
        if(isSelectField(fieldObject)){
            if(jQuery.isArray((options))){
            filterArrayInOptions(fieldObject,options).prop('disabled',false);//NO I18N
        }
//            else{
//                getFilteredOptions(fieldObject,options).removeAttr('disabled');//NO I18N
//            }
        }
        else if(fieldType==='multicheckbox'){
            if(jQuery.isArray(options)){
                filterArrayInCheckBox(fieldObject,options).each(function(i,element){
                    jQuery(element).prop('disabled',false).parents('label').eq(0).removeClass('ui-opacity5');//NO I18N
            });        }
//            else{
//                getFilteredCheckBoxes(fieldObject,options).removeAttr('disabled');//NO I18N
//            }
        }
    },
    //To enable text area fields held in an iframe like description and resolution
    enableTextArea=function(fieldId){
        fieldId=getNewUDFName(fieldId);
        jQuery("#"+fieldId).parent().find(".ze").parent().css("pointer-events","auto").removeClass('hidden-overlay-child')
          .parent().removeClass('hidden-overlay').find('.ze_area').css('background-color', '').contents().off('keydown'); //NO I18N
    },
    //Enable a single field or multiple fields .
    //To enable multiple field at once call function with an array of data-field fieldIds.
    enableField = function (fieldIds) {
        fieldIds = getArray(fieldIds);
        for (var i = 0, len = fieldIds.length; i < len; i++) {
            if ($se.skipRuleFields.includes(fieldIds[i])) {
                return;
            }            
            fieldIds[i]=getNewUDFName(fieldIds[i]);
            if ($se.skipRuleFields.includes(fieldIds[i])) {
                return;
            }
            if($se.isFormComponent && $se.form) {
                var fname = $se.element(fieldIds[i]).attr("name");   //No I18N
                if($se.form.options.isAddIn==true && fieldIds[i]=="STATUS"){
                    return;
                }
                if($se.form.options&&$se.form.options.ffr&&($se.form.options.ffr.entity.toLowerCase()=="change"||$se.form.options.ffr.entity.toLowerCase()=="release")){
                    if(fieldIds[i]=="assets"||fieldIds[i]=="ASSET"){
                        if (sdp_user.ROLES && sdp_user.ROLES.length > 0 && sdp_user.ROLES.contains('ViewInventoryWS') == false) {
                            return;
                        }
                    }
                    if(fieldIds[i]=="configuration_items"||fieldIds[i]=="services"){
                        if (sdp_user.ROLES && sdp_user.ROLES.length > 0 && sdp_user.ROLES.contains('ViewCI') == false) {
                            return;
                        }
                    }
                }
                $se.form.enableField(fname);
                if($se.isResource(fieldIds[i]) ){
                    jQuery("[data-cost-prev-delete='"+fieldIds[i]+"']").css({"visibility":"visible"});  //NO I18N
                }
                continue;
            }
            if(fieldIds[i]=='DESCRIPTION'){
                enableTextArea('HTMLDesc'); //No I18N
            }
            else if(fieldIds[i] === "REQUESTER.OBO" && sdp_user.USERTYPE !== "Requester"){
                //The On-Behalf-of field should not be enabled for technicians, as they are not allowed to change it
                return;
            }
            else if (fieldIds[i] !== 'SITEID' && fieldIds[i] !== 'APPROVALSTATUS') {
                var fieldType = $se.fieldsJson.getFieldType(fieldIds[i]);
                var fieldObject = $se.element(fieldIds[i]);
                if($se.module == 'CHANGE'){
                     if("ASSET" === fieldIds[i]  || "CI" === fieldIds[i]){
                        fieldObject.select2("enable",true); //No I18N
                    }else{
                        fieldObject.prop('readonly',false).removeClass( 'hidden-overlay-child' ).parent().removeClass( 'hidden-overlay' );//NO I18N
                    }
                }else{
                    fieldObject.prop('readonly', false).prop('disabled', false).parents('.fafr-row').eq(0).removeClass('ui-opacity5 disableDiv');//NO I18N
                     if(isDynamicLoadingField(fieldObject) || fieldIds[i]=="REQUESTER.ASSETS" || fieldIds[i]=="SITE"||fieldIds[i]=="CONFIGURATION_ITEMS"||fieldIds[i]=="SPACE"){
                        fieldObject.select2("enable"); //No I18N
                    }
                    if(fieldIds[i]=="REQUESTER.ASSETS"||fieldIds[i]=="CONFIGURATION_ITEMS"||fieldIds[i]=="SPACE"){
                        fieldObject.parents(".fafr-row").find("a").removeClass("disabled");//no i18n
                    }
                }
                //for enabling/disabling date type fields we also need to take care of calendar icon.
                var field_row = fieldObject.parents('.fafr-row').eq(0); //No I18N
                if (fieldType === 'date') {
                    //un-hide calender icon for date fields in change module
                    if ($se.module === 'CHANGE') {
                        fieldObject.parents('.fafr-row').eq(0).find('.date').removeClass('hide');//NO I18N
                    } else {
                        field_row.find('.input-group-addon').removeClass('hide');//NO I18N
                        field_row.find('.date').addClass('input-group');//NO I18N
                        field_row.find('.dateFieldForceLTR').addClass('form-control').removeClass('form-control');//NO I18N
                    }
                } else if (fieldType === 'multipleselect' || fieldType === 'checkbox' || fieldType === 'radio') {//NO I18N
                    if(window.req_module){
                        //for the bulk select option
                        field_row.find("span.bulk-select").css({"pointer-events":"", "cursor":""}); //No I18N
                    }else{
                        field_row.find('.img').removeClass('hide');//NO I18N
                        field_row.find('span[data-name=multiselecttemplate]').removeClass('hide');
                    }
                }
                //for enabling/disabling date type fields we also need to take care of removing icon for custom multi-select fields.
                if (field_row.find('.sb').length) {
                    field_row.find('.sb').removeClass('hide');//NO I18N
                }
                if ($se.module === 'CHANGE') {
                    //un-hide add icon for SERVICE/ASSET/CI in change module
                     if (fieldIds[i] === 'SERVICE' || fieldIds[i] === 'ASSET' || fieldIds[i] === 'CI') {
                        field_row.find('.add-items').removeClass('hide');//NO I18N
                    }
                    //un-hide add icon for INITIATOR in change module
                    if (fieldIds[i] === 'INITIATOR') {
                        field_row.find('.userslookup').removeClass('hide');//NO I18N
                    }
                }
                else if(fieldIds[i] === 'REQUESTER' && ($se.module === 'INCIDENT' || $se.module === 'SERVICE')) {
                    jQuery("#showRequesterList").prop('disabled',false); //NO I18N
                }
                else if(fieldIds[i] === "REQUESTER.OBO"){
                    jQuery("#showOBOUserList").removeClass('hide'); //NO I18N
                }
                if(typeof window.req_module=="undefined" && $se.isResource(fieldIds[i]) ){
                    jQuery("[data-cost-prev-delete='"+fieldIds[i]+"']").css({"visibility":"visible"});  //NO I18N
                }
            }
        }
    },
    //To disable text area fields held in an iframe
    disableTextArea=function(fieldId){
        setTimeout(function(){ //we add a delay as the description field is loaded in an iframe
            fieldId=getNewUDFName(fieldId);
            if((jQuery("#"+fieldId).parent().find(".ze").length) !== 0){
                jQuery("#"+fieldId).parent().find(".ze").parent().css("pointer-events","none").addClass('hidden-overlay-child').parent().addClass('hidden-overlay')
                .find('.ze_area').css('background-color', '#f3f3f3').contents().on('keydown', function(e){e.preventDefault();}); //No i18n
            }else{
                disableTextArea(fieldId);
            }
        },500);
    },
    //Disable a single field or multiple fields.
    //To disable multiple field at once call function with an array of data-field fieldIds.
    disableField = function (fieldIds) {
        fieldIds = getArray(fieldIds);
        for (var i = 0, len = fieldIds.length; i < len; i++) {
            if ($se.skipRuleFields.includes(fieldIds[i])) {
                return;
            }
            fieldIds[i]=getNewUDFName(fieldIds[i]);
            if ($se.skipRuleFields.includes(fieldIds[i])) {
                return;
            }
            if($se.isFormComponent && $se.form) {
                var fname = $se.element(fieldIds[i]).attr("name");   //No I18N
                $se.form.disableField(fname);
                if($se.isResource(fieldIds[i]) ){
                    jQuery("[data-cost-prev-delete='"+fieldIds[i]+"']").css({"visibility":"hidden"});   //NO I18N
                }
                continue;
            }
            if(fieldIds[i]=='DESCRIPTION'){
                disableTextArea('HTMLDesc'); //No I18N
            }
            else if (fieldIds[i] !== 'SITEID' && fieldIds[i] !== 'APPROVALSTATUS') {
                var fieldType = $se.fieldsJson.getFieldType(fieldIds[i]);
                var fieldObject = $se.element(fieldIds[i]);
                if($se.module=='CHANGE'){
                    if("ASSET" === fieldIds[i] || "CI" === fieldIds[i]){
                        fieldObject.select2("enable", false); //No I18N
                    }else{
                        fieldObject.prop('readonly',true).addClass( 'hidden-overlay-child' ).parent().addClass( 'hidden-overlay' );//NO I18N
                    }
                }else{
                    fieldObject.prop('readonly',true).prop('disabled',true).parents('.fafr-row').eq(0).addClass('ui-opacity5 disableDiv');//NO I18N
                    if(isDynamicLoadingField(fieldObject) || fieldIds[i]=="REQUESTER.ASSETS" || fieldIds[i]=="SITE"||fieldIds[i]=="CONFIGURATION_ITEMS"||fieldIds[i]=="SPACE"){
                        fieldObject.select2("disable"); //No I18N
                    }
                    if(fieldIds[i]=="REQUESTER.ASSETS"||fieldIds[i]=="CONFIGURATION_ITEMS"||fieldIds[i]=="SPACE"){
                        fieldObject.parents(".fafr-row").find("a").addClass("disabled");//no i18n
                    }
                }
                var field_row = fieldObject.parents('.fafr-row').eq(0); //No I18N
                //for enabling/disabling date type fields we also need to take care of calendar icon.
                //SD-99683
                if (fieldType === 'date') {
                    try {
                        closeCalDialog();
                    } catch (error) {}
                    //hide calender icon for date fields in change module
                    if ($se.module === 'CHANGE') {
                        field_row.find('.date').addClass('hide');//NO I18N
                    } else {
                        field_row.find('.input-group-addon').addClass('hide');//NO I18N
                        field_row.find('.date').removeClass('input-group');//NO I18N
                        field_row.find('.dateFieldForceLTR').addClass('form-control').removeClass('form-control');//NO I18N
                    }

                } else if (fieldType === 'multipleselect' || fieldType === 'checkbox' || fieldType === 'radio') {//NO I18N
                    if(window.req_module){
                        //handling the bulk select option
                        field_row.find("span.bulk-select").css({"pointer-events":"none", "cursor":"default"}); //No I18N
                    }else{
                        field_row.find('.img').addClass('hide');//NO I18N
                        field_row.find('span[data-name=multiselecttemplate]').addClass('hide');
                    }
                }
                //for enabling/disabling date type fields we also need to take care of removing icon for custom multi-select fields.
                if (field_row.find('.sb').length) {
                    field_row.find('.sb').addClass('hide');//NO I18N
                }
                if ($se.module === 'CHANGE') {
                    //hide add icon for SERVICE/ASSET/CI in change module
                    if (fieldIds[i] === 'SERVICE' || fieldIds[i] === 'ASSET'|| fieldIds[i] === 'CI') {
                        field_row.find('.add-items').addClass('hide');//NO I18N
                    }
                    //hide add icon for INITIATOR in change module
                    if (fieldIds[i] === 'INITIATOR') {
                        field_row.find('.userslookup').addClass('hide');//NO I18N
                    }
                }
                else if(fieldIds[i] === 'REQUESTER' && ($se.module === 'INCIDENT' || $se.module === 'SERVICE')) {
                    jQuery("#showRequesterList").prop('disabled', true); //NO I18N
                }
                else if(fieldIds[i] === "REQUESTER.OBO"){
                    jQuery("#showOBOUserList").addClass('hide'); //NO I18N
                }
                if(typeof window.req_module=="undefined" && $se.isResource(fieldIds[i]) ){
                    jQuery("[data-cost-prev-delete='"+fieldIds[i]+"']").css({"visibility":"hidden"});   //NO I18N
                }
            }
        }
    },
    //This function fix height for resources fields.
    //Included try catch so that if setHeight function is removed than also code should work.
    fixHeight=function(){
        try{
            if($se.isInlineView){
                setHeight(true);
            }
            else{
                setHeight(false);
            }
        }catch(e){}
    },
    /* this function hide the detail page property unanswered field or unanswered resources*/
    hideUnansweredFields=function(hideFieldArry){
        if(hideFieldArry !== undefined){
            var length = hideFieldArry.length;
            for(var i=0;i< length ; i++){
                switch(hideFieldArry[i]){
                    case 'properties': //NO I18N
                        $CS.hideField($req.prop.emptyPropertyFields);
                        break;
                    case 'resources': //NO I18N
                        $CS.hideField($req.prop.emptyResourceFields);
                        break;
                    default:
                        break;

                }
            }
        }else{
            $CS.hideField($req.prop.emptyPropertyFields);
            $CS.hideField($req.prop.emptyResourceFields);
        }
    },
    //Hide a single field or multiple fields.
    // To hide multiple field at once call function with an array of data-field fieldIds.
    hideField = function (fieldIds) {
        fieldIds = getArray(fieldIds);
        var ignore_fields = ['SUBJECT', 'STATUS', 'CREATEDDATE', 'SITEID', 'APPROVALSTATUS', 'REQUESTER'];//NO I18N
        ignore_fields = ignore_fields.concat($se.skipRuleFields);

        if ($se.onDetailPage || window.print_mode || $se.page_scripts.enabled) {
            //var otherFields = ['assets','first_response_due_by_time','sla','department','editor','last_updated_time','responded_time','completed_time','closure_comments','closure_code','time_elapsed']; //NO I18N
            for (var i = 0, len = fieldIds.length; i < len; i++) {
                fieldIds[i]=getNewUDFName(fieldIds[i]);
                if(ignore_fields.indexOf(fieldIds[i]) == -1){
                    // added the !window.print_mode check below, as $se.fieldsJson is not defined in the print preview section, and it might
                    // be overkill to initialize all fafr methods just to hide the unanswered resources. In the future, if need be,
                    // define the $se.fieldsJson object and remove the print_mode check below.
                    if (!window.print_mode && $se.isFormField(fieldIds[i])) {
                        var api_key = $req.prop.fafrKeyMapping[fieldIds[i]] && $req.prop.fafrKeyMapping[fieldIds[i]].name;
                        if ($req.layout.properties.indexOf(api_key) !== -1) {
                            var rightPnlId = api_key + "-right-panel";//no i18n
                            jQuery('#' + rightPnlId).parent().addClass('hide');
                        }
                        var field = $se.formObject.find('[data-name="' + fieldIds[i] + '"]');
                        if(field.length === 0){
                            field = $se.formObject.find('[fafr-name="' + fieldIds[i] + '"]');
                        }
                        if($se.page_scripts.enabled){
                            field.parents(".fafr-row").hide(); //NO I18N
                            continue;
                        }
                        field.parents('.fafr-row').addClass('hide'); //NO I18N
                    }
                    else if($se.hideInPreview && $se.isFormField(fieldIds[i])){
                        var field = $se.formObject.find(`[data-name="${fieldIds[i]}"],[fafr-name="${fieldIds[i]}"]`);
                            if ($se.page_scripts.enabled && field.length > 0) {
                                field.parents(".fafr-row").hide(); //NO I18N
                        }
                    }
                    else {
                        var field = jQuery('#' + fieldIds[i]);
                        var section = field.parents('[value="ResourceDiv"]').eq(0); //NO I18N
                        var container = section.parent().hasClass("resourceportletContainer") ? section.parent() : null; //No I18N

                        field.addClass('hide');
                        //Hide resource  header if all questions are hiden
                        showHideSection(section, '.resourceportletRow');
                        if(container){
                            showHideSection(container, '[value="ResourceDiv"]');
                        }
                        $req.resource.showHideEmptyResourceMessage();
                    }
                }
            }
        } else {
            function hideCostDeleteOption(element) {
                element.find("[data-field]").each(function(){
                    var id=jQuery(this).attr("data-field");
                    jQuery("[data-cost-prev-delete='"+id+"']").css({"visibility":"hidden"});    //NO I18N
                });
            }
            for (var i = 0, len = fieldIds.length; i < len; i++) {
                fieldIds[i]=getNewUDFName(fieldIds[i]);
                if (isVisible(fieldIds[i]) && ($se.module === 'CHANGE' ? $changeFAFR.mandatoryFields.indexOf(fieldIds[i]) == -1 : ignore_fields.indexOf(fieldIds[i]) == -1)) {

                    var fieldObject=$se.element(fieldIds[i]);
                    if($se.isFormComponent && $se.form) {
                        var fname = fieldObject.attr("name");   //No I18N
                        $se.form.hideField(fname);
                        if($se.isResource(fieldIds[i])){
                            jQuery("[data-cost-prev-delete='"+fieldIds[i]+"']").css({"visibility":"hidden"});   //NO I18N
                        }
                        continue;
                    }

                    //for resource fields if we are hiding any field than we if all of resources of that particular resource block is hidden than we hide the resource block too.
                    if ($se.isResource(fieldIds[i])) {
                        var resourceField = $se.element(fieldIds[i]);
                        var section = resourceField.parents('[value="ResourceDiv"]').eq(0); //NO I18N

                        resourceField.parents('.fafr-row').eq(0).addClass('hide');//NO I18N
                        if (window.req_module) {
                            var container = section.parent().hasClass("resourceportletContainer") ? section.parent() : null; //No I18N
                            //Hide resource  header if all questions are hiden
                            showHideSection(section, ".resourceportletRowEdit .fafr-row");
                            if(container){
                                showHideSection(container, '[value="ResourceDiv"]');
                            }
                        } else {
                            //Hide resource  header if all questions are hiden
                            showHideSection(section);
                            fixHeight();
                        }
                        if(typeof window.req_module=="undefined"){
                            jQuery("[data-cost-prev-delete='"+fieldIds[i]+"']").css({"visibility":"hidden"});   //NO I18N
                        }
                    } else if ($se.isFormField(fieldIds[i])) {
                        if (window.req_module) {
                            var hideModalField = function() {
                                if(["CATEGORY", "SUBCATEGORY", "ITEM"].indexOf(fieldIds[i]) !== -1) {
                                    jQuery("#categoryPopUp").find('[data-field="'+fieldIds[i]+'_popup"]').parent().addClass("hide").prev("label").addClass("hide"); //NO I18N
                                } else if(["SITE", "GROUP", "TECHNICIAN"].indexOf(fieldIds[i]) !== -1) {    //NO I18N
                                    jQuery("#technicianPopUp").find('[data-field="'+fieldIds[i]+'_popup"]').parent().addClass("hide").prev("label").addClass("hide");   //NO I18N
                                }
                            }
                            if ($req.prop.checkRightPanel && $req.layout.properties.indexOf(fieldIds[i].toLowerCase()) !== -1) {
                                $req.prop.hideRightPanelFields.push(fieldIds[i]);
                                hideModalField();
                            }
                            else if($req.prop.checkRightPanel) {
                                hideModalField();
                            }
                            //to get track mandate fields
                            if($CS.isMandated(fieldIds[i])){
                                    var index=$req.prop.fafr_mandate_keys.indexOf(fieldIds[i]);
                                    if(index!=-1){
                                        $req.prop.fafr_mandate_keys.splice(index,1);
                                        nonMandateInValidator("#propertyDetailForm", $se.element(fieldIds[i]).attr("name")); //NO I18N
                                        if($req.prop.wizard.isEnabled){
                                            $req.prop.wizard.tabs.tab_order[0].validation()
                                        }
                                    }
                            }
                            $se.element(fieldIds[i]).parents('.fafr-row').addClass('hide');//addClass('hide');//NO I18N
                        } else {
                            $se.element(fieldIds[i]).parents('.fafr-row').eq(0).addClass('hide');//NO I18N
                        }
                        if ($se.isInlineView) {
                            //for request details view page due to design of form we need to add or remove a dummy field block whenever a field is show or hidden.
                            $se.element(fieldIds[i]).parents('.column').eq(0).append($dummyRow);
                            fixRowHeightForSpotEdit($se.element(fieldIds[i]));
                        } else {
                            //we need to fix height of section once we hide any field
                            //fixSectionRowsHeight($se.element(fieldIds[i]).parents('.seccolumn').eq(0));
                            //Hide section header if all fields are hiden
                            var section=$se.element(fieldIds[i]).parents('.form-section').eq(0);
                            showHideSection(section);
                        }
                    // fixTabIndexForHide($se.element(fieldIds[i]));
                    }
                } else {
                    //Added for the hide_resource
                    if($se.resourcesObj != undefined){
                        if($se.isFormComponent && $se.form) {
                            $se.form.hideSection(fieldIds[i], $se.resourcesObj);
                            var $src = $se.resourcesObj.find('#' + fieldIds[i]);    //NO I18N
                            if($src != undefined) {
                                hideCostDeleteOption($src);
                            }
                            continue;
                        }
                        var $source = $se.resourcesObj.find('#' + fieldIds[i]);
                        if ($source != undefined && $source.attr('value') === "ResourceDiv") {  //NO I18N
                            $source.addClass('hide');
                            $source.attr("data-hidden-by-rule","true");
                            if(window.req_module){
                                var container = $source.parent().hasClass("resourceportletContainer") ? $source.parent() : null; //No I18N
                                if(container){
                                    showHideSection(container, '[value="ResourceDiv"]');
                                }
                            }else{
                                hideCostDeleteOption($source);
                            }
                        }
                    }

                }
            }
        }
    },
    //Show a single field or multiple fields.
    // To show multiple field at once call function with an array of data-field fieldIds.
    showField=function(fieldIds){
        fieldIds=getArray(fieldIds);
        var ignore_fields=['SUBJECT','STATUS','CREATEDDATE','SITEID','APPROVALSTATUS'];//NO I18N
        ignore_fields = ignore_fields.concat($se.skipRuleFields);
        function showCostDeleteOption(element) {
            element.find("[data-field]").each(function(){
                var id=jQuery(this).attr("data-field");
                jQuery("[data-cost-prev-delete='"+id+"']").css({"visibility":"visible"});   //NO I18N
            })
        }
        for(var i=0,len=fieldIds.length;i<len;i++){
            fieldIds[i]=getNewUDFName(fieldIds[i]);
            if(((!isVisible(fieldIds[i]))|| $se.page_scripts.enabled) && ($se.module==='CHANGE' ? $changeFAFR.mandatoryFields.indexOf(fieldIds[i])==-1 : (ignore_fields.indexOf(fieldIds[i])==-1) || $req.layout.properties.indexOf(fieldIds[i].toLowerCase())==-1)) {

                var fieldObject=$se.element(fieldIds[i]);
                if($se.isFormComponent && $se.form) {
                    var fname = fieldObject.attr("name");   //No I18N
                    if(fname) {
                        $se.form.showField(fname);
                        if($se.isResource(fieldIds[i])){
                            jQuery("[data-cost-prev-delete='"+fieldIds[i]+"']").css({"visibility":"visible"});   //NO I18N
                        }
                        continue;
                    }
                }

                //for resource fields if we show any of the field than we check if all of resources of that particular resource block is hidden than we hide the resource block too.
                if($se.isResource(fieldIds[i])){
                    var resourceField = $se.element(fieldIds[i]);
                    var section = resourceField.parents('[value="ResourceDiv"]').eq(0); //NO I18N

                    resourceField.parents('.fafr-row').eq(0).removeClass('hide'); // NO I18N
                    if(window.req_module){
                        var container = section.parent().hasClass("resourceportletContainer") ? section.parent() : null; //No I18N
                        //Show resource  header if if any one question is visible
                        showHideSection(section, ".resourceportletRowEdit .fafr-row");
                        if(container){
                            showHideSection(container, '[value="ResourceDiv"]');
                        }
                    }else{
                        //Hide resource  header if if any one question is visible
                        showHideSection(section);
                        fixHeight();
                        jQuery("[data-cost-prev-delete='"+fieldIds[i]+"']").css({"visibility":"visible"});  //NO I18N

                    }
                }
                else if($se.isFormField(fieldIds[i])){
                    if(window.req_module){
                        var showModalField = function() {
                            if(["CATEGORY", "SUBCATEGORY", "ITEM"].indexOf(fieldIds[i]) !== -1) {
                                jQuery("#categoryPopUp").find('[data-field="'+fieldIds[i]+'_popup"]').parent().removeClass("hide").prev("label").removeClass("hide").closest('.form-group').removeClass('hide'); //NO I18N
                            } else if(["SITE", "GROUP", "TECHNICIAN"].indexOf(fieldIds[i]) !== -1) {    //NO I18N
                                jQuery("#technicianPopUp").find('[data-field="'+fieldIds[i]+'_popup"]').parent().removeClass("hide").prev("label").removeClass("hide").closest('.form-group').removeClass('hide'); //NO I18N
                            }
                        }
                        if ($req.prop.checkRightPanel && $req.layout.properties.indexOf(fieldIds[i].toLowerCase()) !== -1) {
                            showModalField();
                        }
                        else if($req.prop.checkRightPanel) {
                            showModalField();
                        }
                        // to get track mandate fields
                        if($CS.isMandated(fieldIds[i])){
                            var index=$req.prop.fafr_mandate_keys.indexOf(fieldIds[i]);
                            if(index==-1){
                                $req.prop.fafr_mandate_keys.push(fieldIds[i]);
                                var id = $se.element(fieldIds[i]).attr("name");
                                var title = $se.fieldsJson.getFieldTitle(fieldIds[i]);
                                mandateInValidator("#propertyDetailForm", id, title); //NO I18N
                            }
                        }
                        if($se.page_scripts.enabled){
                            var api_key = $req.prop.fafrKeyMapping[fieldIds[i]] && $req.prop.fafrKeyMapping[fieldIds[i]].name;
                                if ($req.layout.properties.indexOf(api_key) !== -1) {
                                    var rightPnlId = api_key + "-right-panel";//no i18n
                                    jQuery('#' + rightPnlId).parent().addClass('hide');
                                }
                                var field = $se.formObject.find('[data-name=' + fieldIds[i] + ']');
                                if(field.length === 0){
                                    field = $se.formObject.find('[fafr-name=' + fieldIds[i] + ']');
                                }
                                field.parents('.fafr-row').removeClass('hide').show(); //NO I18N
                        }
                        $se.element(fieldIds[i]).parents('.fafr-row').removeClass('hide'); //NO I18N
                    }else{
                         $se.element(fieldIds[i]).parents('.fafr-row').eq(0).removeClass('hide');//NO I18N
                    }
                    if($se.isInlineView){
                        //for request details view page due to design of form we need to add or remove a dummy field block whenever a field is show or hidden.
                        $se.element(fieldIds[i]).parents('.column').eq(0).find('[name=dummyRow]').eq(0).remove();   //NO I18N
                        fixRowHeightForSpotEdit($se.element(fieldIds[i]));
                    }
                    else{
                        //we need to fix height of section once we hide any field
                        //fixSectionRowsHeight($se.element(fieldIds[i]).parents('.seccolumn').eq(0));//NO I18N
                        //Show section header is any one field is visible
                        var section=$se.element(fieldIds[i]).parents('.form-section').eq(0);
                        showHideSection(section);
                    }
                }
                else{
                //Added for the show Resource
                if($se.resourcesObj != undefined ){
                    if($se.isFormComponent && $se.form) {
                        $se.form.showSection(fieldIds[i], $se.resourcesObj);
                        var $src = $se.resourcesObj.find('#' + fieldIds[i]);    //NO I18N
                        if($src != undefined) {
                            showCostDeleteOption($src);
                        }
                        continue;
                    }
                    var $source = $se.resourcesObj.find('#'+fieldIds[i]);
                    if($source != undefined && $source.attr('value') === "ResourceDiv"){    //NO I18N
                        $source.removeClass('hide');
                        $source.attr("data-hidden-by-rule","false");
                        if(!window.req_module){
                            setHeight();
                            showCostDeleteOption($source);
                        }else{
                            var container = $source.parent().hasClass("resourceportletContainer") ? $source.parent() : null; //No I18N
                            if(container){
                                showHideSection(container, '[value="ResourceDiv"]');
                            }
                        }
                    }
                }

            }
                // fixTabIndexForShow($se.element(fieldIds[i]));
            }
        }
    },
    //Mandate a single field or multiple fields.
    //To mandate multiple field at once call function with an array of data-field fieldIds.
    mandateField=function(fieldIds,form){
        fieldIds=getArray(fieldIds);
        var ignore_fields=['SUBJECT','STATUS','CREATEDDATE','APPROVALSTATUS'];//NO I18N
        var hideMandateDetails=["site","group"];    //NO I18N
        ignore_fields = ignore_fields.concat($se.skipRuleFields);
        for(var i=0,len=fieldIds.length;i<len;i++){
            fieldIds[i]=getNewUDFName(fieldIds[i]);
            var field = form!=undefined? []: $se.element(fieldIds[i]);
            if(($se.module==='CHANGE' ? $changeFAFR.mandatoryFields.indexOf(fieldIds[i])==-1 : ignore_fields.indexOf(fieldIds[i])==-1)){
                if(form!=undefined){
                    let form_id=$CS.findElement(form).attr("data-formid");
                     FC_Mapper[form_id]?FC_Mapper[form_id].addMandatoryField(fieldIds[i]):"";
                     continue;
                }
                else{
                    if($se.isFormComponent && $se.form) {
                        if($CRObj&&$CRObj.fromPage=="details"&&hideMandateDetails.indexOf(fieldIds[i])!=-1){
                            continue;
                        }
                        if(field.length === 0) {
                            $se.form.addMandatoryField(fieldIds[i], "fafr", "fafr_key"); //No I18N
                        } else {
                            var fname = field.attr("name");   //No I18N
                            $se.form.addMandatoryField(fname, "fafr"); //No I18N
                        }
                        continue;
                    }
                }

                if($se.module==='CHANGE') {
                    // * on right side of text in change module
                    field.attr('data-mandatory','true')
                            .parents('.fafr-row').eq(0) //NO I18N
                            .find('.fafr-label span em').remove().end()
                            .find('.fafr-label span').prepend('<em class="mandatory">* </em>');
                    //setOnChangeEventMandatoryFields(document.ChangeForm,false,[$se.element(fieldIds[i])[0].name]);
                    /*Written for Mandatory fields updation*/
                    /*Start of Code*/
                    var fieldId=$se.element(fieldIds[i])[0].name;
                    if(fieldId.indexOf("TIME")!=-1){
                        fieldId=fieldId+"_Display"; //NO I18N
                    }
                    mandatoryListObj.push(fieldId);
                    formCheckValid.formValidInt("#newchangeform");//NO I18N
                    if(document.loaded==true){
                        formCheckValid.arrayInsert(fieldId,'',true,'',true);
                    }else{
                        formCheckValid.arrayInsert(fieldId,'',true,'',false);
                    }

                    /*End of Code*/
                } else {
                    if(fieldIds[i]==='ATTACHMENT'){
                        $se.isAttachmentMandate = true
			//mandatory sign is duplicated when FAFR is executed twice -- same fix can be adopted for SDP too
                        var mandatoryTag = $se.element(fieldIds[i]).parents('.attachtemplate').find('[data-name="attachment-header"]').find('span.mandatory');//NO I18N
			if(!checkIfMSPOrSCP() || mandatoryTag.length == 0) {
                        $se.element(fieldIds[i]).attr('data-mandatory','true').parents('.attachtemplate').find('[data-name="attachment-header"]').prepend('<span class="mandatory">*</span>');//NO I18N
			}
                    }else{
                        var mandatoryTag = field.parents('.fafr-row').eq(0).find('.fafr-label').find('span.mandatory'); //NO I18N
                        if(mandatoryTag.length === 0){
                            //to get track mandate fields
                            if(window.req_module){
                                var index=$req.prop.fafr_mandate_keys.indexOf(fieldIds[i]);
                                if(index==-1 && $CS.isVisible(fieldIds[i])){
                                    $req.prop.fafr_mandate_keys.push(fieldIds[i]);
                                }
                            }
                            field.attr('data-mandatory', 'true').parents('.fafr-row').eq(0) //NO I18N
                                .find('.fafr-label').prepend('<span class="mandatory">*</span>');
                        }
                    }
                    if(window.req_module){
                            //to get track mandate fields
                            var index=$req.prop.fafr_mandate_keys.indexOf(fieldIds[i]);
                            if(index==-1 && $CS.isVisible(fieldIds[i])){
                                var id = $se.element(fieldIds[i]).attr("name");
                                var title = $se.fieldsJson.getFieldTitle(fieldIds[i]);
                                mandateInValidator("#propertyDetailForm", id, title); //NO I18N
                            }
                    }
                }
            }
        }
    },
    collapseTab=function(id){
        const element=$CS.findElement(id);
        if(element.is("z-collapsiblepanel")){
            ZComponents.collapsiblepanel($CS.findElement(id)).collapsePanel();
        }
        else{
           ZComponents.collapsiblepanels($CS.findElement(id)).collapsePanel();}
        },
    expandTab=function(id){
        const element=$CS.findElement(id);
        if(element.is("z-collapsiblepanel")){
            ZComponents.collapsiblepanel($CS.findElement(id)).expandPanel();
        }else{
            ZComponents.collapsiblepanels($CS.findElement(id)).expandPanel();
        }
    },
    //Remove mandate of a single field or multiple fields.
    //To remove mandate of multiple field at once call function with an array of data-field fieldIds.
    nonMandateField=function(fieldIds,form){
        fieldIds=getArray(fieldIds);
        var ignore_fields=['SUBJECT','STATUS','CREATEDDATE','APPROVALSTATUS','REQUESTER'];//NO I18N
        ignore_fields = ignore_fields.concat($se.skipRuleFields);
        for(var i=0,len=fieldIds.length;i<len;i++){
            var field = form!=undefined? []: $se.element(fieldIds[i]);
            fieldIds[i]=getNewUDFName(fieldIds[i]);
            if(($se.module==='CHANGE' ? $changeFAFR.mandatoryFields.indexOf(fieldIds[i])==-1 : ignore_fields.indexOf(fieldIds[i])==-1)){
                if(window.req_module){
                    if($req.prop&&$req.prop.fafr_mandate&&$req.prop.fafr_mandate.includes(fieldIds[i])){
                        continue;
                    }
                }
                if(form!=undefined){
                    let form_id=$CS.findElement(form).attr("data-formid");
                     FC_Mapper[form_id]?FC_Mapper[form_id].removeMandatoryField(fieldIds[i],"fafr"):"";
                     continue;
                }
                if($se.isFormComponent && $se.form) {
                    if(field.length === 0) {
                        $se.form.removeMandatoryField(fieldIds[i], "fafr", "fafr_key"); //No I18N
                    } else {
                        var fname = field.attr("name");   //No I18N
                        $se.form.removeMandatoryField(fname, "fafr"); //No I18N
                    }
                    continue;
                }

                if(fieldIds[i]=='ATTACHMENT'){
                    $se.isAttachmentMandate = undefined; //84822
                    $se.element(fieldIds[i]).attr('data-mandatory','false').parents('.attachtemplate').find('[data-name="attachment-header"] > span').remove();//No I18N
                }
                else{
                    var mandatoryTag = field.parents('.fafr-row').eq(0).find('.fafr-label').find('.mandatory'); //NO I18N
                    //the update-mandatory class is added to fields that are mandated in the template
                    if( !mandatoryTag.hasClass("update-mandatory") && !mandatoryTag.hasClass("close-mandatory") ){
                        field.attr('data-mandatory', 'false');
                        mandatoryTag.remove();
                        if($se.module==='CHANGE'){
                            //changeFormMandateCheck(document.ChangeForm,$se.element(fieldIds[i])[0],null);
                            /*Written for non-Mandatory fields updation*/
                            /*Start of Code*/
                            var fieldId=$se.element(fieldIds[i])[0].name;
                            if(fieldId.indexOf("TIME")!=-1){
                                fieldId=fieldId+"_Display"; //NO I18N
                            }
                            mandatoryListObj.remove([fieldId]);
                            formCheckValid.formRulesDelete(fieldId);
                            formCheckValid.arrayDelete(fieldId);
                            /*End of Code*/
                        }
                    }
                    if(window.req_module){
                        //to get track mandate fields
                        var index=$req.prop.fafr_mandate_keys.indexOf(fieldIds[i]);
                        if(index!=-1){
                            $req.prop.fafr_mandate_keys.splice(index,1);
                            nonMandateInValidator("#propertyDetailForm", $se.element(fieldIds[i]).attr("name")); //NO I18N
                            if($req.prop.wizard.isEnabled){
                                $req.prop.wizard.tabs.tab_order[0].validation()
                            }
                        }
                    }
                }
            }
        }
    },
    // Refer Field
    toJSONString=function(data){
        return sdpToJSON(data);
    },
    referField=function(fieldId,entityName,options){
        fieldId=getNewUDFName(fieldId);
        var selValue = $CS.getValue(fieldId);
        let start_index=1//NO I18N
        let search_term="";
        const  select2intaializer=(fieldId,entityName,options)=>{
        var def_options = {
            type:"GET",//no i18n
            url: (options && options.url)||("/api/v3/requests/" + entityName), //NO I18N
            cache:false,
            transport: function(params, success, failure) {
            var modify_data=JSON.parse(params.data.input_data);
            if(modify_data.list_info.search_fields!=undefined){
                modify_data.list_info.search_criteria=[];
                Object.entries(modify_data.list_info.search_fields).forEach(([key, value]) => {
                    modify_data.list_info.search_criteria.push({
                          "field":key,//NO I18N
                          "condition": "contains",//NO I18N
                          "value": value,//NO I18N
                          "logical_operator": "and"//NO I18N
                    });
                });
                 delete modify_data.list_info.search_fields;
                 params.data.input_data=sdpToJSON(modify_data);
             }
            return jQuery.ajax(
                jQuery.extend({},params,{success: success,failure: failure})
              );
            },
            data:function(params,page){
                var searchValue = params;
                var input_data = {
                    list_info:{ "row_count": "100", "fields_required": ["name"],"start_index":1 } //NO I18N
                }
                if(options.lazyLoad){
                    search_term=searchValue;
                    if(searchValue.length||page==1){
                        start_index=1;
                    }
                    input_data.list_info.start_index=start_index;
                }

                if (searchValue) {
                    input_data.list_info.search_criteria = { "field": "name", "value": searchValue, "condition": "contains", "logical_operator": "AND" }; // No I18N
                }
                input_data = sdpToJSON(input_data);
                return {"input_data":input_data}; //NO I18N
            },
            results:function(res){
                var list = [];
                var data=res[entityName];
                for (var i = 0; i < data.length; i++) {
                  var name=data[i][options.display_value||"name"];
                  if(options.needID===true&&name) {
                    name=data[i].id+'--'+name;
                  }
                 if(name){
                    list.push({id:name,text:name});
                  }
                }
                if(!options.lazyLoad){
                return {results: list};
                }
                    const res_list_info=res.list_info;
                    start_index=res_list_info.start_index+res_list_info.row_count;
                return {results:list,more:search_term?false:res_list_info.has_more_rows};
            }
        }
        ajax_data=jQuery.extend(true,{}, def_options,options.ajax);
        var general_options={
            placeholder:  "-- " + getMessageForKey("sdp.common.select") +" --",
            ajax:ajax_data
        };
        general_options=jQuery.extend(true,{}, general_options,options);
        delete options.url;
        //Handle Separator
        if ($CS.element(fieldId).data("select2")) {
            general_options.separator = $CS.element(fieldId).data("select2").opts.separator;    //NO I18N
        }
        $CS.element(fieldId).select2(general_options);
        if(selValue){
            $CS.element(fieldId).select2('data', {id: selValue, text: selValue}); //NO I18N
        }
    }
    select2intaializer(fieldId,entityName,options);
    return $CS.element(fieldId);
    },
    // get user associated groups
    getUserAssociatedGroups = function(){
        var grp_data=[];
        sdpAjax({
        url:"/servlet/Select2Servlet?module=user_associated_groups", //NO I18N
        async:false,
        success:function(data){
            for(var i=0;i<data.length;i++){
            grp_data.push(data[i].name);
            }
        }
    });
    return grp_data;
    },
    //Set tasks specified in a given array taskIds
    setTasks=function(taskIds){
        taskIds=getArray(taskIds);
        var tasksCnt=taskIds.length;
        for(var i=0;i<tasksCnt;i++){
            if($se.isTask(taskIds[i])){
                $se.element(taskIds[i]).prop('checked',true);//NO I18N
                if($se.isFormComponent && $se && sdp_user.USERTYPE === "Requester"){ // NO I18N
                    $se.element(taskIds[i]).closest(".row").removeClass("hide"); // NO I18N
                }
            }
        }
    },
    //Unset tasks specified in a given array taskIds
    unSetTasks=function(taskIds){
        taskIds=getArray(taskIds);
        for(var i=0,len=taskIds.length;i<len;i++){
            if($se.isTask(taskIds[i])){
                $se.element(taskIds[i]).prop('checked',false);//NO I18N
                if($se.isFormComponent && $se && sdp_user.USERTYPE === "Requester"){ // NO I18N
                    $se.element(taskIds[i]).closest(".row").addClass("hide"); // NO I18N
                }
            }
        }
    },
    //hide task specified in a given array taskIds
    hideTasks=function(taskIds){
      taskIds=getArray(taskIds);
      for(var i=0,len=taskIds.length;i<len;i++){
            if($se.isTask(taskIds[i])){
                $se.tasksObj.find('#'+taskIds[i]+'Id').hide();
            }
        }
    },
    //show task specified in a given array taskIds
    showTasks=function(taskIds){
     // taskIds can we strig  so using getArray we make it as Array
      taskIds=getArray(taskIds);
      for(var i=0,len=taskIds.length;i<len;i++){
        //we are checking isTask here coz throw the script we can put a wrong id
            if($se.isTask(taskIds[i])){
                $se.tasksObj.find('#'+taskIds[i]+'Id').show();
            }
        }
    },
    setAllTasks=function(){
        $se.tasksObj.find('[name="tmplTaskId"]').prop('checked',true);//NO I18N
    },
    unSetAllTasks=function(){
        $se.tasksObj.find('[name="tmplTaskId"]').prop('checked',false);//NO I18N
    },
    //this function is used to set resolution field content
    /* setResolution=function(text){
        if(window.editor2){
            window.editor2.setContent(text);
        }
        else{
            //SD-110531 Removed toggleResolution() function from Request.js file. Because toggleResolution() function doesn't used in any places
            //toggleResolution();
            window.editor2.setContent(text);
        }
    },
    getResolution=function(){
    if(window.editor2){
            return window.editor2.getContent();
        }
    },*/
    //this function Increase the Days upto (27) and hours upto(23)
    setDateFromCurrentDate=function(fieldName,day,hour){
        var today = new Date();
        var todayDate=(today.getDate()+day);
        var todayMonth=(today.getMonth());
        var todayYear=today.getFullYear();
        var timeHour=(today.getHours()+hour); //you can increase upto 23 Hour
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];//NO I18N
        //***********HOUR CHANGED***************//
        // if timeHoue  more than 24 than day increases by 1
        if(timeHour >= 24){
        timeHour=timeHour-24;
        todayDate=todayDate+1;
        }
        var time = timeHour + ":" + today.getMinutes() + ":" + today.getSeconds();
        //****************************************//
        //there are three main if checks first for 28Days,second for 30 Days and last for 31 Days

        //Month with 28 Days (Febuary)
        if(todayMonth===1){
        //check for Leap Year (Feb have 29 Days)
        if( ((todayYear % 400) === 0) || ( ((todayYear % 4) === 0) && ((todayYear % 100) !== 0))){
            if(todayDate >29){
            todayDate=todayDate-29;
            todayMonth=2;// Month become March
            }
        }//Feb in Non Leap Year (Feb have 28 Days)
        else if(todayDate >28){
            todayDate=todayDate-28;
            todayMonth=2;
        }
        }

        //Months with 30 Days
        if(todayMonth===3 || todayMonth===5 || todayMonth===8 ||todayMonth===10){
        if(todayDate >30){
            todayDate=todayDate-30;
            todayMonth=todayMonth+1;
        }
        }
        else{//Months With 31 Days
        if(todayDate > 31){
            todayDate=todayDate-31;
            //If Month is December,than month will change in January and Year will be increase by 1
            if(todayMonth===11){
                todayMonth=0;
                todayYear=todayYear+1;
            }
            else{
                todayMonth=todayMonth+1;
            }
        }
        }
        var Currentday=todayDate+' '+monthNames[todayMonth]+' '+todayYear;
        setValue(fieldName,new Date(Currentday+","+time));
    },
    //this function is used to set description field content
    setDescription=function(text){
        var editorId = "editor";  //No I18N
        if($se.isFormComponent && $se.form) {
            if($se.form.fields.description && $se.form.fields.description.zeditor_id) {
                editorId = $se.form.fields.description.zeditor_id;
                //Handle null value in description
                if(text == null) {
                    text = "";  //No I18N
                }
                if(text.constructor == Array) {
                    text = text.join(",");  //No I18N
                }
                $se.form.setFieldValue("description",text); //No I18N
            }
        }
        if(window[ editorId ]){
            //we need to use htmleditor method setContent to update description field as it is based on htmleditor implementation.
            window[ editorId ].setHTML(text);
            if($se.onFormSubmit&&!$se.isInlineView){
                $se.formObject[0].description.value=getHTMLDescription(editorId);
            }
        }
    },
    //this function is used to get content of description field
    getDescription=function(){
        var editor = "editor";  //No I18N
        if($se.isFormComponent && $se.form) {
            if($se.form.fields.description && $se.form.fields.description.zeditor_id) {
                editor = $se.form.fields.description.zeditor_id;
            }
        }
        if(window[ editor ]){
            //we need to use htmleditor method getContent to get value of description field as it is based on htmleditor implementation.
            return window[ editor ].getHTML();
        }else{
            return $req.details.request_info.description;
        }
    },
    //this method can be used to stop submission of a form
    stopFormSubmission=function(){
        $se.stopFormSubmission=true;
    },
    //set fields dependency for two or three levels.
    setFieldDependency=function(dependencyObj){
           $se.setParentListener(dependencyObj);
    },
    //return true if logged in user is Requester else return false
    isRequester=function(){
        return (parent.sdp_user.USERTYPE==='Requester');//NO I18N
    },
    //return true if logged in user is Technician else return false
    isTechnician=function(){
        return (parent.sdp_user.USERTYPE==='Technician');//NO I18N
    },
    //return true if logged in user has role with given roleName else return false
    hasRole=function(roleName){
        return (jQuery.inArray(roleName,parent.sdp_user.ROLES)!==-1);
    },
    //return user id of logged in user
    getLoggedInUserId=function(){
        return (parent.sdp_user.LOGGEDIN_USERID);
    },
    //return user name of logged in user
    getLoggedInUserName=function(){
        return (parent.sdp_user.USERNAME);
    },
    getLoggedInUserLoginName=function(){
        return (sdp_user.LOGINNAME);
    },
   /* getLoggedInUserEmailId=function(){
        return (parent.sdp_user.EMAILID);
    },
    getLoggedInUser_SuppotGroup=function(){
        return (parent.sdp_user.SUPPORTGROUP);
    }, */
    //return the current status of Approval
    getApprovalStatus=function(){
        var approval_status = null;
        if(window.req_module) {
            if($se.isFormComponent && $se.form) {
                approval_status = $req.form && $req.form.request_info ? $req.form.request_info.approval_status : null;
            } else {
                approval_status = $req.details.request_info.approval_status;
            }
        }
        if(approval_status) {
            return approval_status.name;
        } else {
            return null;
        }
    },
    getApprovalStatusValue=function(){
        var approval_status = null;
        if(window.req_module) {
            if($se.isFormComponent && $se.form) {
                approval_status = $req.form && $req.form.request_info ? $req.form.request_info.approval_status : null;
            } else {
                approval_status = $req.details.request_info.approval_status;
            }
        }
        if(approval_status) {
            return approval_status.id;
        } else {
            return null;
        }
    },
    //this function is used to create an array if none exists
    getArray=function(fieldId){
        var fieldIds=(!jQuery.isArray(fieldId))?[fieldId]:fieldId;
        return fieldIds;
    },
    //this function return true if a field is visible
    isVisible=function(fieldId){
        fieldId=getNewUDFName(fieldId);
        if($se.isFormComponent && $se.form) {
            var fname = $se.element(fieldId).attr("name");   //No I18N
            return $se.form.isVisible(fname);
        }

        if(!jQuery.isArray(fieldId)&&$se.isFormField([fieldId])){
            return !$se.element(fieldId).parents('.fafr-row').eq(0).hasClass('hide');//NO I18N
        }
        else if(!jQuery.isArray(fieldId)&&$se.isResource([fieldId])){
            if( $se.element(fieldId).parents('.fafr-row').eq(0).hasClass('hide') || ($se.element(fieldId).parents('[value="ResourceDiv"]').eq(0).hasClass('hide') && $se.element(fieldId).parents('[value="ResourceDiv"]').attr("data-hidden-by-rule") === "true") ){ //NO I18N
                /*the second part of the if condition is true for resource sections hidden by the hide resource action alone.
                * in case a section has been hidden by the showHideSection method as a result of having all it's fields hidden, then the condition evaluates to false.
                */
                return false;
            }else{
                return true;
            }
        }
    },
    //this function return true if a field is enabled to be edited
    isEnabled=function(fieldId){
        fieldId=$CS.getNewUDFName(fieldId);
        if(!jQuery.isArray(fieldId)&&($se.isFormField([fieldId])||$se.isResource([fieldId]))){
            return $se.element(fieldId).prop('disabled') !== true;//NO I18N
        }
    },
    //this function return true if a field is mandatory
    isMandated=function(fieldId){
        fieldId=$CS.getNewUDFName(fieldId);
        if(!jQuery.isArray(fieldId)&&($se.isFormField([fieldId])||$se.isResource([fieldId]))){
            if(window.$rf){
                var fieldId = $rf.fafr_key_map[fieldId] || "";
               return $rf.mandatoryFields.includes(fieldId);
            }
            return $se.element(fieldId).attr('data-mandatory')==='true';//NO I18N
        }
    },
    //this function is used to filter options of a select fields based on a given title
    filterTextInOptions=function(selectField,title){
        if($se.isFormComponent && $se.form) {
            var fname = selectField.attr("name");   //No I18N
            if($se.form[fname] && $se.form[fname].allowedValues) {
                $se.form[fname].allowedValues.filter(function(option) {
                    return option.name === title;
                });
            }
            return;
        }
        return selectField.find('option').filter(function(){
            if(jQuery(this).attr("disp-value")){
                return jQuery.trim(jQuery(this).attr("disp-value")) === title;
            }
            return jQuery.trim(jQuery(this).text()) === title;
        });
    },
    //this function is used to filter options of a select fields based on an array of options
    filterArrayInOptions=function(selectField,optionsArr){
        if($se.isFormComponent && $se.form) {
            var fname = selectField.attr("name");   //No I18N
            if($se.form[fname] && $se.form[fname].allowedValues) {
                $se.form[fname].allowedValues.filter(function(option) {
                    return optionsArr.indexOf(option.name) !== -1;
                });
            }
            return;
        }
        return selectField.find('option').filter(function(){
            if(jQuery(this).attr("disp-value")){
                return jQuery.inArray(jQuery.trim(jQuery(this).attr("disp-value")),optionsArr)!==-1;
            }
            return jQuery.inArray(jQuery.trim(jQuery(this).text()),optionsArr)!==-1;
        });
    },
    //get checkbox elements found  in optionsArr
    filterArrayInCheckBox=function(fieldObject,optionsArr){
        return fieldObject.filter(function(){
               /* Need to Check Later
                  return fieldObject.find('[type=checkbox]').filter(function(){ */
            return jQuery.inArray(jQuery.trim(jQuery(this).attr("data-label")),optionsArr)!==-1;
        });
    },
    //this function is used to detect if a field is dropdown field
    isSelectField=function(fieldObject){
        return fieldObject&&fieldObject.is("select");//NO I18N
    },
    //this function is used to detect if a field is a dynamic loading field
    isDynamicLoadingField=function(fieldObject){
        return fieldObject && (fieldObject.attr("data-dynamic-options") === "true");//NO I18N
    },
    fireEvent=function(field,event,element){
        if($se.skipFireEvent==true){return;}
        if(element){
            var fieldObject = element;
        }else{
            var fieldObject=$se.element(field)[0];
        }
        //we are creating a custom event for triggering the field change to identify custom event vs default event.
        var evt = document.createEvent("HTMLEvents");//NO I18N
        evt.firedBy='user_api';            //NO I18N
        evt.initEvent(event, true, true ); // event type,bubbling,cancelable
        return !fieldObject.dispatchEvent(evt);
    },
    isAttachmentEmpty=function(){
        var attachmentEmpty = false;
        if(window.req_module){
          if(!$req.details.request_info.attachments || $req.details.request_info.attachments.length==0){
             attachmentEmpty = true;
          }
          if(window.$rf && $rf.fields && $rf.fields.attachments && $rf.fields.attachments.value.length ){
             attachmentEmpty = false;
          }
        }else{
           if(jQuery("#displayAttachments").text().length === 0){
              attachmentEmpty = true;
           }
        }
        return attachmentEmpty;
    },
    ajax=function(url){
        var response;
        sdpAjax({
            type:'GET',//NO I18N
            cache:false,
            async:false,
            url:url,
            success:function(data){
                response=data;
            }
        });
        return response;
    },
    getRequestId=function(){
        if(parent.WOID){
            return parent.WOID;
        }
    },
    setMultiLineFieldHeight=function(field,px){
        if(px > 700){
            px = 700;
        }else if(px < 40){
            px = 40;
        }
        px = px.toString() + "px"; //No i18n
        $se.element(field).css("height",px); //No I18N
    },
    findElement=function(selector,regex){
        var map_regex={
            "starts_with":"^",//No i18n
            "ends_with":"$",//No i18n
            "contains":"*", //No i18n
        }
        var field=jQuery("[data-cs-field"+(regex?map_regex[regex]:"")+"='"+selector+"']"); //No I18N
        if(field.length==0) {
            field=jQuery("[data-name='"+selector+"']"); //No I18N
            if(field.length==0) {
                field=jQuery("[data-id='"+selector+"']");   //No I18N
                if(field.length==0 && !selector.startsWith("#")) {
                    field=jQuery("#"+selector);   //No I18N
                }
            }
        }
        if(field.length==0){
            return jQuery(selector);
        }
        return field;
    },
    hideElement=function(selector){
        var elements=getArray(selector);
        for(var i=0;i<elements.length;i++){
            var field=$CS.findElement(elements[i]);
            if($se.page_scripts.module_id=="rdp_page"){
                switch (elements[i]) {
                    case "assign": // no i18n
                        field=field.parent()
                        $CS.findElement("edit").addClass('mr10');// no i18n
                        break;
                    case "pickup":// no i18n
                        field=field.parents("ul").prev();// no i18n
                        $CS.findElement("assign").addClass('mr10');// no i18n
                        break;

                }
            }
            if(field.length){
                field.each(function(i,element){
                       element.style.setProperty('display', 'none', 'important');//no i18n
                })
            }
        }
    },
    showElement=function(selector){
        var elements=getArray(selector);
        for(var i=0;i<elements.length;i++){
            var field=$CS.findElement(elements[i]);
            if(field.length){
                field.show();
            }
        }
    },
    addElement=function(selector,element,position){
        var field=$CS.findElement(selector);
        if(field.length){
            field[position](element);
        }
    },
    addButton=function(selector,name,callback,options){
        options=jQuery.extend(true,{class:"btn btn-default btn-xs",position:"after"},options);//no i18n
        var field=$CS.findElement(selector);
        if(field.length){
            var id=name.replace(/ /g,"_");
            if($CS.findElement(id).length==0) {
                var element=jQuery('<button type="button" data-cs-field='+id+' class="'+options.class+'">'+name+'</button>');
                if(callback){
                    element.on("click",function(event){
                        event.preventDefault();
                        callback(event);
                        return false;
                    })
                }
                field[options.position](element);
            }
        }
    },
    addTab=function(content,type,name,selector,callback){
        var id = name.replace(/ /g,"_");
        if(!selector){
            selector=jQuery("[data-cs-field*=-tab]:last").attr("data-cs-field");
        }
        if(jQuery("[data-cs-field="+selector+"]").length!=0){
            var tabElement=jQuery('<li data-cs-field="'+id+'-tab" ><a role="tab" data-switch="sdtab" data-tab-collapse="collapse" href="/" id="'+id+'-tab">'+name+'</a></li>');
            if($CS.findElement(id+"-tab").length==0){
                $CS.addElement(selector,tabElement);
                tabElement.on("click",function(){
                    jQuery("#desc-section, #resource-section, #conversation-section, #property-section").addClass("hide");
                    jQuery("#tab-content").removeClass("hide");
                    $CS.addWidget(content,type,name,"#tab-content",{position:"html"});//no i18n
                    if(callback){
                        callback();
                    }
                });
            }
        }
    },
    executeEvent=function(elementId,eventType,callback) {
        jQuery(document).off(eventType,'[data-cs-field="' + elementId + '"]').on(eventType,'[data-cs-field="' + elementId + '"]', callback); //NO I18N
    },
    addMoreResource=function(resource,options){
        var table=[];
        var table_array = $CS.findElement("#"+resource).find("[data-field]");
        var temp_table=[];
        table_array.each(function(index, el) {
            var fieldId=jQuery(el).attr("data-field");
            if(temp_table.indexOf(fieldId)==-1){
                table.push({
                    display_name:$se.fieldsJson.getFieldTitle(fieldId),
                    fafrKey:fieldId,
                    validate:options.individualValidation||true
                });
                temp_table.push(fieldId);
            }

        });
        var def_options={
            section: resource, // Rescource section can be taken in execute script
            button: {// Name of the button
                name:"Add", //NO I18N
                element:null
            },
            resetVal:true,
            individualValidation:true,
            table: table,
            validate: function() {
                for (var i = 0, n = this.table.length; i < n; i++) {
                    var value = $CS.getValue(this.table[i].fafrKey);
                    if (this.table[i].validate) {
                        if (!value || value == 0 || (jQuery.isArray(value) && value.length == 0)) {
                            alert("Kindly fill this field: " + this.table[i].display_name); // Message if field is empty
                            return false;
                        }
                    }
                }
            },
            addButton: function() {
                var self=this;
                if(this.button.element==null){
                    this.button.element=jQuery('<div class="form-footer" style="border: 1px solid #cccccc"><input type="button" value="' + this.button.name + '" class="btn btn-primary"></div>');
                }
                this.button.element.on("click",function(){
                        self.constructRow();
                });
                jQuery("#" + this.section).removeClass("pb15").css("padding-bottom","45px").append(this.button.element);
            },
            getVal:function(data, key) {
                    if (key == "fafrKey") {
                        var text = $CS.getText(data[key]);
                        if($se.fieldsJson.getFieldType(data[key]) == "datetime"){
                            text = $CS.getValue(data[key]);
                            if(text instanceof Date){
                                text=text.toLocaleString();
                            }
                        }
                        text = text && text != 0 ? text : "-";
                        if(this.resetVal){
                            if($se.fieldsJson.getFieldType(data[key]) == "text") {  //NO I18N
                                $CS.setValue(data[key], "");    //NO I18N
                            } else {
                                $CS.setValue(data[key], null);
                            }
                            $CS.removeAllOptions(data[key]);
                            $CS.addAllOptions(data[key]);
                        }
                        return this.transformText?this.transformText(data[key],text):text;
                    }
                    return data[key];
                },
            addRow:function(html,i,data,type){
                 var self=this
                 var value= (type=="row") ? (self.getVal(self.table[i],"fafrKey")) : ("<b>"+self.getVal(self.table[i],"display_name")+"</b>") ; //no i18n
                 html += "<td>" + value + "</td>";
                 if(type=="row"){
                     data[self.table[i].fafrKey]=value;
                 }
                 return html;
             },
            constructRow: function() {
                if (this.validate() == false) {
                    return;
                }
                var data={};
                var html;
                var table = $CS.element("DESCRIPTION").parent().find("iframe").contents().find("body"); //NO I18N
                var key = "fafrKey"; //NO I18N
                var html = "<tr>";
                if (table.find("table."+this.section).length == 0 ) {
                    table.append('<br><table class="ze_tableView '+this.section+'" cellpadding="2" cellspacing="2" border="1" style="width: 100%; border-collapse: collapse; border: 1px solid black;">');
                    for (var i = 0, n = this.table.length; i < n; i++) {
                        html=this.addRow(html,i,null,"heading"); //no i18n
                    }
                    html += "</tr><tr>";
                }
                table = table.find("table."+this.section);
                for (var i = 0, n = this.table.length; i < n; i++) {
                    html=this.addRow(html,i,data,"row"); //no i18n
                }
                if(options.callback){
                    options.callback(data);
                }
                table.append(html + "</tr>");
                //Triggering change value manually when description content is set
                if ($se.isFormComponent && $se.form) {
                    $se.form.fields.values.description = window[ $se.form.fields.description.zeditor_id ].getHTML();
                }
            }
        }
        options=jQuery.extend(true,def_options,options);//no i18n
        options.addButton();
    },
    /**
     * options {
     * default_val:"val",
     * onchange:()=>{
     *
     * },
     * dependency:["fafrkey1","fafrkey2","fafrkey3"]
     * }
        Example
        $CS.readAndPopulateData("Catalog.csv",{
        "WorkOrder_Fields_UDF_CHAR3":"Incident Type",
        "CATEGORY": "Service Category",
        "SUBCATEGORY": "Sub Category",
        "ITEM": "Sub Sub Category",
        },{
            dependency:["WorkOrder_Fields_UDF_CHAR3","CATEGORY","SUBCATEGORY"],
            default_value:"Unable to launch MS Excel",
            primarykey:"WorkOrder_Fields_UDF_CHAR3",
            onChange:(a,b)=>{
                code
            })

     */
           //format result ,
           readAndPopulateData = (path, map, options) => {
            const csvObj = {};
            const dependency = options.dependency;
            const primaryKey = options.primarykey;
            const primaryColumn = map[primaryKey];
            delete map[primaryKey];
            const primaryType = $se.fieldsJson.getFieldType(primaryKey);
            const intial_value=$CS.getValue(primaryKey);
            const editMode = !(intial_value==undefined || intial_value==0 || intial_value==null) ;
            const select2Options = {};
            const checkDependencyValues = (values, dependencyValues) => {
              let valid = true;
              Object.entries(dependencyValues).map(([fafrKey, val]) => {
                const column = map[fafrKey];
                if (val != "" && values[column] != val) {
                  valid = false;
                  return;
                }
              });
              return valid;
            };
            const sanitizeValue = value => value.trim().toString().replaceAll(/[\"]*/g, "");
            let defaultOptions = {
              sanitizeValue: sanitizeValue,
            };
            defaultOptions = jQuery.extend(true, defaultOptions, options);
            select2Options.formatResult = defaultOptions.formatResult;
            select2Options.placeholder = defaultOptions.placeholder;
            const dependencyOptions = (data, fields, dependencyColumn, dependencyValues) => {
              let valid = true;
              if (!dependencyColumn) {
                Object.entries(map).map(([key, val]) => {
                  const currVal = data[val];
                  if (fields[val] == undefined) {
                    fields[val] = [];
                  }
                  if (fields[val].find(obj => obj.text == currVal) == undefined) {
                    fields[val].push({ id: currVal, name: currVal, text: currVal });
                  }

                });
                return;
              } else if (dependencyValues != undefined && dependencyColumn) {
                valid = checkDependencyValues(data, dependencyValues);
              }
              if (valid) {
                let dependencyData = data[dependencyColumn];
                if (fields[dependencyColumn] == undefined) {
                  fields[dependencyColumn] = [];
                }
                if (fields[dependencyColumn].find(obj => obj.text == dependencyData) == undefined) {
                  fields[dependencyColumn].push({ id: dependencyData, name: dependencyData, text: dependencyData });
                }
              }

            };
            const populateCsvFields = field => {
              if (!dependency) {
                updateLayout(undefined, false);
              }
              if (primaryKey && options.autopopulate) {
                const data = csvObj[field];
                if (data != undefined) {
                  if (dependency) {
                    dependency.map(fafrKey => {
                      if (fafrKey != primaryKey)
                        setFieldValue(data, map[fafrKey], fafrKey);
                    });
                  }
                  else {
                    Object.entries(map).forEach(([key, val]) => {
                      setFieldValue(data, val, key);
                    });
                  }
                }
              }
            };
            const setFieldValue = (data, val, key) => {
              if (data == undefined) {
                return;
              }
              let value = data[val];
              if (value !== undefined) {
                value = defaultOptions.sanitizeValue(value);
              }
              $CS.setText(key, value);
            };
            const csvJSON = csv => {
              const lines = csv.split("\n");
              const headers = lines[0].split(",");
              for (let i = 1; i < lines.length - 1; i++) {
                const currentLine = lines[i].split(",");
                const obj = {};
                if (primaryKey) {
                  headers.forEach((header, index) => {
                    if (primaryColumn === header || Object.values(map).includes(header)) {
                      obj[header] = defaultOptions.sanitizeValue(currentLine[index].trim());
                    }
                  });
                  let currObj = obj[primaryColumn];
                  if (csvObj[currObj] != undefined) { // Primary key is not unique
                    if (csvObj[currObj].multiple) {
                      csvObj[currObj].sdpMulti.push(obj);
                    } else {
                      csvObj[currObj].multiple = true;
                      csvObj[currObj].sdpMulti = [obj];
                    }
                  } else {
                    csvObj[currObj] = obj;
                  }
                } else {
                  headers.forEach((header, index) => {
                    let colValue = defaultOptions.sanitizeValue(currentLine[index].trim());
                    if (csvObj[header]) {
                      csvObj[header].push(colValue);
                    } else {
                      csvObj[header] = [colValue];
                    }
                  });
                }
              }
            };
            const getCsvValues = (key, removeDuplicate) => {
              const values = [];
              const dup = {};
              Object.keys(csvObj).forEach(csvKey => {
                const value = csvObj[csvKey][key];
                if (value != undefined) {
                  if (removeDuplicate) {
                    if (!dup[value]) {
                      values.push({ name: value, id: value, text: value });
                      dup[value] = true;
                    }
                  } else {
                    values.push({ name: value, id: value, text: value });
                  }
                }
              });
              return values;
            };
            const updateDependencyLayout = (fieldData, columnName, fafrKey) => {
              const element = $CS.element(fafrKey);
              const eleType = $se.fieldsJson.getFieldType(fafrKey);
              if (eleType != "text") return;
              element.select2('destroy'); //no i18n
              $CS.setValue(fafrKey, '');
              select2Options.data = fieldData[columnName];
              element.select2(select2Options);

            };
            const updatePrimary = () => {
              if (primaryType == "text") {
                const select2Opts = Object.keys(csvObj).map(key => { return { name: key, id: key, text: key }; });
                select2Options.data = select2Opts;
                $CS.element(primaryKey).select2(select2Options);
              }
            };
            const updateLayout = (fieldData, updatePrimary) => {
              if (updatePrimary) {
                updatePrimary();
              }
              Object.keys(map).forEach(key => {
                const fieldType = $se.fieldsJson.getFieldType(key);
                if (fieldType == "text") {
                  const element = $CS.element(key);
                  element.select2('destroy'); //no i18n
                  $CS.setValue(key, '');
                  if (element == undefined || element.length == 0) {
                    return;
                  }
                  else {
                    let data;
                    if (fieldData != undefined) {
                      data = fieldData[map[key]];
                    }
                    else {
                      data = getCsvValues(map[key], true);
                    }
                    if (data != undefined && data.length) {
                      select2Options.data = data;
                      element.select2(select2Options);
                    }
                  }
                }
              });

            };
            const resetDependentFields = (index) => {
              for (let i = index; i < dependency.length; i++) {
                const eleType = $se.fieldsJson.getFieldType(dependency[i]);
                if (eleType != "text") return;
                $CS.element(dependency[i]).select2('destroy');
                $CS.setValue(dependency[i], '');
              }
            };
            const handle_data =(data)=>{
                data=data.responseText;
                  csvJSON(data);
                  options.dependency && options.dependency.map(fafrKey => {
                    $CS.element(fafrKey).on("change", (e) => {
                      // Populate the dependent options
                      const currValue = $CS.getText(fafrKey);
                      if (currValue == undefined || currValue == '' || (!(e.originalEvent && e.originalEvent.manual))) return;
                      let currDependency = options.dependency.indexOf(fafrKey);
                      let fields = {};
                      if (currDependency != options.dependency.length - 1) {
                            resetDependentFields(currDependency+1);
                          let dependentValues = {};
                          const populateColumn = map[dependency[currDependency + 1]];
                          Object.keys(map).forEach(key => {
                            dependentValues[key] = $CS.getText(key);
                          });
                          delete dependentValues[primaryKey];
                          const data = csvObj[$CS.getText(primaryKey)];
                          dependencyOptions(data, fields, populateColumn, dependentValues);
                          if (data.multiple) {
                            data.sdpMulti.forEach(dt => {
                              dependencyOptions(dt, fields, populateColumn, dependentValues);
                            });
                          } else if (!data.multiple && fafrKey == primaryKey) {
                            fields[map[dependency[currDependency + 1]]] = [{ id: data[map[dependency[currDependency + 1]]], text: data[map[dependency[currDependency + 1]]] }];
                          }
                          updateDependencyLayout(fields, populateColumn, dependency[currDependency + 1]);
                        }
                        options.onChange ? options.onChange(fafrKey, csvObj) : "";
                      });
                    });
                    if (primaryKey) {
                      if (!dependency && !editMode) {
                        updateLayout(undefined, true);
                      }
                      const primaryElement = $CS.element(primaryKey);
                      if (dependency == undefined || options.autopopulate) {
                        primaryElement.on("change", () => populateCsvFields($CS.getText(primaryKey)));
                      }
                      updatePrimary();
                      if (!editMode) {
                          if (options.defaultValue) { $CS.setText(primaryKey, options.defaultValue); }
                        }
                    }
            };
            const updateCsvObj = path => {
              sdpAjax({
                url: `/custom/${path}`,
                ignorefailuremessage:true,
                // processData: false,
                contentType:false,
                error: data => {
                    handle_data(data)
                  },
                success:function(data){
                    handle_data(data)
                }
                })
              };

              updateCsvObj(path);
            },
    addWidget=function(content,type,name,selector,options){
        options=jQuery.extend(true,{header:true,position:"prepend"},options);//no i18n
        var iframeHTML;
        var id=name.replace(/ /g,"_");
        function constructHTML(content,id,header){
            return header?'<div data-cs-field="'+id+'" class="widget-bg" style="height:auto"><div class="widget-header" style="height:auto"><h4 class="new-header extr-titl widgets-hdr-txt disp-ib">'+name+'</h4> </div> <div class="p0 widget-panel"><div class="form-section">'+content+'</div></div></div>':'<div class="form-section">'+content+'</div>';
        }
        if(type=="html"){
            iframeHTML=constructHTML(content,id,(typeof options.header=="undefined")?true:options.header);//No i18n
        }
        if(type=="url") {
            iframeHTML=constructHTML('<iframe style="border: none;width: 100%;max-height: 800px;" src="'+content+'" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>',id,(typeof options.header=="undefined")?true:options.header);//No i18n
        }
        if($CS.findElement(id).length==0){
            $CS.addElement(selector,iframeHTML,options.position);
        }
        return iframeHTML;
    },
    showInfo=function(htmlinfo, options, type) {
        var def_opts  = {
            "dialog" : {    //NO I18N
                modal: true,
                maxHeight: 500,
                maxWidth: 1000,
                draggable: false,
                resizable: false,
                close: function(event, ui) {
                    jQuery("#fafr_info").dialog("destroy"); //NO I18N
                }
            },
            "popup" : { //NO I18N
                type: "info",   //NO I18N
                isAutoHide: "true"  //NO I18N
            }
        };
        var options = jQuery.extend(true, {}, def_opts[type], options);
        if(!jQuery("#fafr_info").length) {   //NO I18N
            var $div = jQuery("<div>", {"id" : "fafr_info"});   //NO I18N
            jQuery("body").append($div);    //NO I18N
        }
        if(type == "dialog") {  //NO I18N
            jQuery("#fafr_info").html(htmlinfo).dialog(options);    //NO I18N
        } else {
            var ft_opts = "";   //NO I18N
            jQuery.each(options, function(ind, val) {
                if(ind != "type") { //NO I18N
                    ft_opts = !!ft_opts ? ft_opts + "," : ft_opts;  //NO I18N
                    ft_opts += ind + "=" + val; //NO I18N
                }
            });
            window.showalert(options.type, htmlinfo, ft_opts);
        }
    },
    handleFieldInfo = function(fieldId, notes) {
        let field = $CS.element(fieldId);
        if (field.length === 0) {
            return;
        }
        if ($se.isFormComponent && $se.form) {
            $se.form.handleFieldInfo(field.attr("name"), notes);   //No I18N
        }
    };
    return{
        element:function(fieldId){
            return $se.element(fieldId);
        },
        getNewUDFName:function(fieldId){
            return getNewUDFName(fieldId);
        },
        getValue:function(fieldId, isManual){
            if((fieldId.indexOf("UDF_")!=-1&&fieldId.indexOf("DATE")==-1)||fieldId.indexOf("RES_")!=-1){
                return getText(fieldId);
            }
            if(typeof isManual !== "boolean"){
                return getValue(fieldId,null,isManual);
            }
            return getValue(fieldId, isManual);
        },
        redirectTo:function(url){
            FC.config.skipFormAlert = true;
            window.location.href = url;
            FC.config.skipFormAlert = false;
        },
        setValue:function(fieldId,value,isResMulticheck,forUnset){
            if($se.page_scripts.getForm(isResMulticheck)!=undefined){
                $se.page_scripts.handleformFunction(isResMulticheck,"setFieldValue",[fieldId,value]);
                return;
            }
            return setValue(fieldId,value,isResMulticheck,forUnset);
        },
        getText:function(fieldId,form){
            return getText(fieldId,form);
        },
        setText:function(fieldId,text,form){
            if(form!=undefined){
                $se.page_scripts.handleformFunction(form,"setFieldByText",[fieldId,text])
                return;
            }
            setText( fieldId,text );
        },
        setTasks:function(taskIds){
            setTasks(taskIds);
        },
        unSetTasks:function(taskIds){
            unSetTasks(taskIds);
        },
        showTasks:function(taskIds){
            showTasks(taskIds);
        },
        hideTasks:function(taskIds){
            hideTasks(taskIds);
        },
        setAllTasks:function(){
            setAllTasks();
        },
        unSetAllTasks:function(){
            unSetAllTasks();
        },
       /* setResolution:function(content){
            setResolution(content);
        },
        getResolution:function(){
            return getResolution();
        },*/
        setDateFromCurrentDate:function(fieldId,nextDay,nextHour){
            setDateFromCurrentDate(fieldId,nextDay,nextHour);
        },
        setDescription:function(content){
            setDescription(content);
        },
        getDescription:function(){
            return getDescription();
        },
        enableField:function(fieldIds,form){
            if(form!=undefined){
                fieldIds=getArray(fieldIds);
                fieldIds.map(field=>$se.page_scripts.handleformFunction(form,"enableField",[field]));
                return;
            }
            enableField(fieldIds);
        },
        disableField:function(fieldIds,form){
            if(form!=undefined){
                fieldIds=getArray(fieldIds);
                fieldIds.map(field=>$se.page_scripts.handleformFunction(form,"disableField",[field]));
                return;
            }
            disableField(fieldIds);
        },
        hideField:function(fieldIds){
            hideField(fieldIds);
        },
        showField:function(fieldIds){
            showField(fieldIds);
        },
        exportPdf:function(opts){
            exportPdf(opts);
        },
        mandateField:function(fieldIds,form){
            mandateField(fieldIds,form);
        },
        expandTab:function(id){
            return expandTab(id);
        },
        collapseTab:function(Id){
            return  collapseTab(Id);
        },
        nonMandateField:function(fieldIds,form){
            nonMandateField(fieldIds,form);
        },
        toJSONString:function(data){
            return toJSONString(data);
        },
        referField:function(fieldId,entityName,options){
            referField(fieldId,entityName,options||{});
        },
        getUserAssociatedGroups:function(){
            return getUserAssociatedGroups();
        },
        isEnabled:function(fieldId){
            return isEnabled(fieldId);
        },
        isVisible:function(fieldId){
            return isVisible(fieldId);
        },
        isMandated:function(fieldId){
            return isMandated(fieldId);
        },
        enableOptions:function(fieldId,options){
            enableOptions(fieldId,options);
        },
        disableOptions:function(fieldId,options){
            disableOptions(fieldId,options);
        },
        addOptions:function(fieldId,options,isIds){
            addOptions(fieldId,options,isIds);
        },
        removeOptions:function(fieldId,options,isIds){
            removeOptions(fieldId,options,isIds);
        },
        removeAllOptions:function(fieldIds){
            removeAllOptions(fieldIds);
        },
        addAllOptions:function(fieldId){
            addAllOptions(fieldId);
        },
        stopFormSubmission:function(){
            stopFormSubmission();
        },
        setFieldDependency:function(dependencyObj){
            setFieldDependency(dependencyObj);
        },
        getLoggedInUserName:function(){
            return getLoggedInUserName();
        },
        getLoggedInUserLoginName:function(){
            return getLoggedInUserLoginName();
        },
        /*getLoggedInUserEmailId:function(){
        return getLoggedInUserEmailId();
        },
        getLoggedInUser_SuppotGroup:function(){
        return getLoggedInUser_SuppotGroup();
    },*/
        getLoggedInUserId:function(){
            return  getLoggedInUserId();
        },
        hasRole:function(roleName){
            return hasRole(roleName);
        },
        getApprovalStatusValue:function(){
        return getApprovalStatusValue();
        },
        getApprovalStatus:function(){
            return getApprovalStatus();
        },
        isRequester:function(){
            return isRequester();
        },
        isTechnician:function(){
            return isTechnician();
        },
        isFormSubmit:function(){
            return $se.onFormSubmit;
        },
        ajax:function(url){
            return ajax(url);
        },
        getRequestId:function(){
            return getRequestId();
        },
        hideUnansweredFields:function(hideFieldArray){
            hideUnansweredFields(hideFieldArray);
        },
        setHeight:function(field, px){
            //the setHeight function name is already in use
            return setMultiLineFieldHeight(field, px);
        },
        isDynamicLoadingField:function(fieldObject){
            return isDynamicLoadingField(fieldObject);
        },
        isAttachmentEmpty:function(){
            if($se.module != 'CHANGE'){
                return isAttachmentEmpty();
            }
        },
        hideSection:function(selector){
            jQuery("[data-section='"+encodeHTML(selector)+"']").hide();//no i18n
        },
        showSection:function(selector){
            jQuery("[data-section='"+encodeHTML(selector)+"']").show();//no i18n
        },
        enableSection:function(selector){
            jQuery("[data-section='"+encodeHTML(selector)+"']").removeClass("section-disable");//no i18n
        },
        disableSection:function(selector){
            jQuery("[data-section='"+encodeHTML(selector)+"']").addClass("section-disable");//no i18n
        },
        addElement:function(selector,element,position){
            addElement(selector,element,position||"after");//no i18n
        },
        readAndPopulateData:function(path, map,  options){
            return readAndPopulateData(path, map,  options);
        },
        addButton:function(selector,name,callback,options){
            addButton(selector,name,callback,options||{});//no i18n
        },
        findElement:function(selector,regex){
            return findElement(selector,regex);
        },
        hideElement:function(selector){
            hideElement(selector);
        },
        showElement:function(selector){
            showElement(selector);
        },
        hideAssociation:function(){
            hideElement("tech_association");//no i18n
        },
        addWidget:function(content,type,name,selector,options){
            addWidget(content,type||"url",name,selector||"#content-inner",options||{});//no i18n
        },
        addTab:function(content,type,name,selector,callback){
            addTab(content,type||"url",name,selector,callback);  //no i18n
        },
        executeEvent:function(elementId,eventType,callback){
            executeEvent(elementId,eventType,callback);
        },
        widgetEvent:(evnt,message)=>{
            SdpWidgets.eventHandler.triggerEvent(evnt,message);
        },
      openCustomWidget:function(name,location){
            SdpWidgets.utils.openWidget(name,location)
        },
        hideCustomWidget:function(name,location){
            SdpWidgets.utils.hideWidget(name,location)
        },
        showCustomWidget:function(name,location){
            SdpWidgets.utils.showWidget(name,location)
        },
        addMoreResource:function(resource, options){
            addMoreResource(resource,options||{});
        },
        getLoggedInUserEmailId:function(){
            return (sdp_user.EMAILID);
        },
        getLoggedInUserDomainName:function(){
            return (sdp_user.DOMAINNAME);
        },
        getServerTime:function(){
            var dt = new Date();
            var utc = dt.getTime() + (dt.getTimezoneOffset() * 60000); // Adding local timezone offset to get UTC time
            return new Date(utc+sdp_user.OFFSET).getTime();
        },
        showInfo:function(htmlinfo, options, type) {
            showInfo(htmlinfo, options, type || "popup");   //no i18n
        },
        showFieldInfo: function(fieldId, notes) {
            handleFieldInfo(fieldId, notes);
        },
        removeFieldInfo: function(fieldId) {
            handleFieldInfo(fieldId);
        }
    };
})();

/*
this module implmentation exposes field properties using API such as
getFieldId        : Get field Id (data-field)
getFieldObject    : Get field Object (attributes of field)
getFieldTitle     : Gte field title (label of field)
getAllowedValues  : Get allowed values of field if select,multi-select, checkbox field
getFieldType      : Get type of field
getFieldCategory  : Get category of field
*/
var fieldDetailsFunction=(function(fieldsJson){
    var object=fieldsJson, reverse_fieldsJson={};
    for(var i in fieldsJson){
        reverse_fieldsJson[fieldsJson[i].TITLE]=i;
    }
    return{
        getFieldId:function(title){
            return reverse_fieldsJson[title];
        },
        getFieldObject:function(fieldId){
            fieldId=$CS.getNewUDFName(fieldId);
            return object[fieldId];
        },
        getFieldTitle:function(fieldId){
            fieldId=$CS.getNewUDFName(fieldId);
            if(object[fieldId]){
                return object[fieldId].TITLE;
            }
        },
        getAllowedValues:function(fieldId){
            fieldId=$CS.getNewUDFName(fieldId);
            if(object[fieldId]){
                return object[fieldId].ALLOWEDVALUES;
            }else{
                return {};
            }
        },
        getFieldType:function(fieldId){
            fieldId=$CS.getNewUDFName(fieldId);
            if($se.page_scripts.enabled){
                var fieldType = $se.page_scripts.getFieldType(fieldId);
                return fieldType;
            } else if(typeof requestListViews !== "undefined" && requestListViews.viewMode == "kanban" && $req.prop.fafrKeyMapping && $req.prop.fafrKeyMapping[fieldId]) {  //no i18n
                return $req.prop.fafrKeyMapping[fieldId].type;
            }
            if($se.ffr && $se.ffr.inbuild_roles ==true && !object[fieldId]){
                var fieldType = $se.page_scripts.getFieldType(fieldId);
                if(fieldType == undefined && $se.ffr && $se.ffr.form&& $se.ffr.form.metadata.fields[fieldId]){
                    return $se.ffr.form.metadata.fields[fieldId].type;
                }
                return fieldType;
            }
            if(object[fieldId]){
                return object[fieldId].TYPE;
            }
        },
        getFieldCategory:function(fieldId){
            fieldId=$CS.getNewUDFName(fieldId);
            if(object[fieldId]){
                return object[fieldId].CATEGORY;
            }
        }
    };
});

//SE : Script Execution
if (!se) {
    var se = {};
}
se.req = function() {
    this.dom=jQuery(document);
    this.formObject=undefined;      //WorkOrderForm object
    this.resourcesObj=undefined;    //Resource WorkOrderForm object
    this.tasksObj=undefined;        //Tasks object
    this.rules ="";
    this.mappingJson="";            //fields [name to data-field] mapping
    this.fieldsJson="";             //fields details
    this.resources={};              //resources details
    this.tasks={};                  //tasks details
    this.isInlineView=false;        //true if operation is inline edit
    this.oldFieldFormHtml='';       //Used for inline edit only. Store WorkOrderForm html content so that on cancel request edited fields can be fixed.
    this.oldResourceFormHtml='';
    this.addFieldForm=true;        //Used for inline edit only. True if fields section is in edit mode.
    this.addResourceForm=true;     //Used for inline edit only. True if resources section is in edit mode.
    this.subjectValue="";           //Used for inline edit only. Store subject field's value need if it is present in criteria.
    this.dependentFields=['SUBCATEGORY','ITEM','GROUP','TECHNICIAN'];//NO I18N
    this.actionInvoked = [];
    this.lastExecutedRule="";       //Used to print console log when there is issue in any rule
    this.stopFormSubmission=false;
    this.onFormSubmit=false;
    this.module="";
    this.requesterDetails={};
    this.isCreateOperation=false;
    this.ruleDataDummyObject=[];
    this.onDetailPage=false; //check for onform detail
    //this.mappingFieldJson={}; //this json contain all the field id which is associated with data-field.
    // 84822 -- Used for Mandating the attachment field.
    this.isAttachmentMandate=undefined;
    //you can define some global values here
    this.skipRuleFields = [];
};
se.req.prototype = {
    //this functions returns options of a select field as an array of option labels
    getAllowedOptionsArray:function(fieldId){
        fieldId=$CS.getNewUDFName(fieldId);
        var allowedValues=this.fieldsJson.getAllowedValues(fieldId);
        //for dependent fields we get {value:text} pairs where text is in category>>sub-category>>item format
        if(this.dependentFields.indexOf(fieldId)!==-1){
            allowedValues=this.getDynamicValuesForDefaultFields(fieldId);
        }
        var values=[];
        for(var i in allowedValues){
            values.push(i);
        }
        return values;
    },
    //this functions returns options of a select field as JSON Object of {label:id} pairs
    getAllowedOptionsObject:function(fieldId){
        fieldId=$CS.getNewUDFName(fieldId);
        var allowedValues=this.fieldsJson.getAllowedValues(fieldId);
        //for dependent fields we get {value:text} pairs where text is in category>>sub-category>>item format
        if(this.dependentFields.indexOf(fieldId)!==-1){
            allowedValues=this.getDynamicValuesForDefaultFields(fieldId);
        }
        return allowedValues;
    },
    //get options object of a select field as JSON Object of {id:label} pairs
    getOptionsObject:function(field){
        var allowedValues=this.getAllowedOptionsObject(field);
        var optionsObject={};
        jQuery.each(allowedValues,function(i,v){
            optionsObject[v]=i;
        });
        return optionsObject;
    },
    //Get jQuery object of field with a given data-field as fieldIds or an array of data-field as fieldId, will get valid object only if form is in edit stage. This is mainly used for Request Details View page since here we have multiple sections such as resources, request properties and at a time some of the section might not be in edit state.
    element:function(fieldId){
        fieldId=$CS.getNewUDFName(fieldId);
        var isTask=this.isTask(fieldId),
            isResource=this.isResource(fieldId),
            isFormField=this.isFormField(fieldId);
        if((isFormField&&!this.addFieldForm)||(isResource&&!this.addResourceForm)){
            return jQuery([]);
        }
        else{
            var dom=(isTask)?this.tasksObj:(isResource?this.resourcesObj:this.formObject);
            if(!dom){
                dom = jQuery(document);
            }
            return dom.find('[data-field="'+fieldId+'"]').not('.hide');//NO I18N
        }
    },
    //Allows to get value of a field irrespective of whether actions such as mandate,hide can be applied to it.
    //Used in inline edit operation with multiple forms.
    elementUsedInGetValue:function(fieldId){
        fieldId=$CS.getNewUDFName(fieldId);
        var isTask=this.isTask(fieldId),
            isResource=this.isResource(fieldId),
            isFormField=this.isFormField(fieldId);
            var dom=(isTask)?this.tasksObj:(isResource?this.resourcesObj:this.formObject);
            if(!dom){
                dom = jQuery(document);
            }
        return dom.find('[data-field="'+fieldId+'"]').not('.hide');//NO I18N
    },
    /*Returns true if form field*/
    isFormField:function(fieldId){
        fieldId=$CS.getNewUDFName(fieldId);
        if($se.page_scripts.enabled ){
            return true;
        }
        return this.fieldsJson.getFieldCategory(fieldId)==='formField';//NO I18N
    },
    /*Returns true if resource*/
    isResource:function(fieldId){
        fieldId=$CS.getNewUDFName(fieldId);
        return this.fieldsJson.getFieldCategory(fieldId)==='resourcefield';//NO I18N
    },
    /*Returns true if task*/
    isTask:function(taskId){
        return this.fieldsJson.getFieldCategory(taskId)==='taskField';//NO I18N
    },
    /*Check if given criteria matches*/
    isCriteriaMatched : function(criterias){
        var conditionMatched = true,res=false;
        for(var i=0,len=criterias.length;i<len;i++){
            var field = criterias[i].FIELDID,
                condition=criterias[i].CONDITION,
                operator=criterias[i].OPERATOR,
                values=criterias[i].VALUES,
                fieldType=$se.page_scripts.enabled?$se.page_scripts.getFieldType(field):this.fieldsJson.getFieldType(field),
                fieldVal = $CS.getValue(field, criterias[i].ISMANUALOPTION),
                emptyVal=undefined; //in the fieldVal we added "" if the fieldVal is null

            //we converted group and site field to text fields thus for checking values, thus we have to check text value of choosen option
            if(field==='GROUP'||field==='group'){
                emptyVal= getMessageForKey('sdp.requests.fieldFormRules.rules.notspecified');
                fieldType='text';//NO I18N
                fieldVal =$CS.getText(field);
            }
            else if(field==='SITE'||field==='site') {
                //Issue fix site field condition based field and form rules not working
                emptyVal = getMessageForKey('sdp.admin.technician.addtechnician.nosite');
                if($se.element('SITE').is("select")){
                    fieldType='text';//NO I18N
                    fieldVal =$CS.getText(field);
                    if($CS.isRequester()){
                        fieldVal=jQuery('#siteName').val();
                    }
                }
                else{
                        fieldType='text';//NO I18N
                        fieldVal =$CS.getValue(field);
                        var sites=$se.getOptionsObject('SITE');//NO I18N
                        fieldVal=sites[fieldVal];
                        if (sdp_user.USERTYPE === "Requester") {
                            fieldVal = $CS.getText(field);
                        }
                        //SD-112314
                        if (!fieldVal && ($CS.getValue(field) === "0"||(ChangeReleaseForm&&!window.req_module&&!ChangeReleaseForm.isChangeModule&&$CS.getValue(field) == "-1"))) {//Check for new release form in this scenario
                            fieldVal = emptyVal;
                        }
                        if(!fieldVal&&ChangeReleaseForm&&!window.req_module&&!ChangeReleaseForm.isChangeModule&&$CS.getValue(field) != "-1"){
                            fieldVal = $CS.getText(field);
                        }
                    }
                if($se.page_scripts.enabled ){
                    fieldType='text';//no i18n
                    fieldVal=$CS.getText(field);
                }
            }
            //Values for multi select fields in details page is saved under fieldName_val element
            else if(!window.req_module && field.indexOf("udf_multiselect_") == 0 && fieldVal == null)
            {
                if(jQuery('#'+field+"_val").val() == "-")
                {
                    fieldVal ="";
                }
                else
                {
                    fieldVal = jQuery('#'+field+"_val").val().toString().split(';');
                }
            }
            else if(field === 'LOGGEDIN_USERID'){
                fieldVal = $CS.getLoggedInUserId();
            }
            else if(field === 'USERNAME'){
                fieldVal = $CS.getLoggedInUserName();

            }
            else if(field === 'LOGINNAME'){
                fieldVal = $CS.getLoggedInUserLoginName();
            }
            else if(field === 'ROLES'){
                fieldVal = undefined;
                for(var j=0,leng=values.length;j<leng;j++){
                    var rolePresent = $CS.hasRole(values[j]);
                    //set the value of res, depending on whether the condition is "is" or "is not"
                    res = (condition === 'is' ? rolePresent : !rolePresent); //No I18N
                    if(res==true){
                        break;
                    }
                }
                //fieldType = 'multiselect'; //NO I18N
            }
            /*else if(field==='LOGGEDIN_SUPPORTGROUP'){
                fieldVal = $CS.getLoggedInUser_SuppotGroup();
                console.log(fieldVal);
            }
            else if(field==='LOGGEDIN_EMAILID'){
                fieldVal = $CS.getLoggedInUserEmailId();
            }*/
            else if(field === 'APPROVALSTATUS'){
             fieldVal = $CS.getApprovalStatusValue();
            }
            else if (field === 'REQUESTER.OBO') {
                fieldVal = $CS.getText(field);
            }
            if(emptyVal!=undefined && fieldVal==emptyVal){
                fieldVal = 0;
                //SD-112314
                if ((field === "SITE" || field === "site") && condition !== "is_empty" && condition !== "is_not_empty") {
                    fieldVal = emptyVal;
                }
            }
            //SD-63389 fix
            //console.log(fieldVal,values,condition,fieldType);
            if(fieldVal!==undefined && field !== 'ROLES'){
                res=this.getResultUsingCondition(fieldVal,values,condition,fieldType);
            }
            if(operator==='and'){
                conditionMatched=conditionMatched&&res;
            }
            else if(operator==='or'){
                conditionMatched=conditionMatched||res;
            }
            else{
                conditionMatched=res;
            }
        }
        return conditionMatched;
    },

    /*add on form load and on field change event rules*/
    addRulesToForm: function(skipOnLoad){
        //Code for on Load Fields Start
        var onLoadRules=this.rules.onform_load;
        let exitBlock=false;
        if(onLoadRules && skipOnLoad !== true){
            if(this.form&&this.form.options.ffr&&this.form.options.ffr.skipOnload && this.form.options.ffr.skipOnload==true){
                exitBlock=true;
            }
            if(!exitBlock){
                for(var i=0,len=onLoadRules.length;i<len;i++){
                    this.executeRule(onLoadRules[i]);
                }
            }
        }
        if($se.form && $se.form.options.ffr && $se.form.options.ffr.afterOnLoad){
            $se.form.options.ffr.afterOnLoad($se.form);
        }
        //Code for On change Fields Start
        var onChangeRules = this.rules.onfield_change;
        if(onChangeRules){
            var that = this;
            /* set TimeOut added for Requester because It's onchange Rule execute at the Onform Load time So after Compliting the OnFormLoad Operation we add onchange Rules on Fields */
            setTimeout(function(e){
                for(var i=0,len=onChangeRules.length;i<len;i++){
                        that.addListenerToField(onChangeRules[i]);
                }
            },1);
        }
    },

    //for input/textarea type fields we do not use onchange event listener instead we have onBlur and onFocus listener to detect changes to a field, otherwise for every key press rule will be executed, for this we add an oldValue attribute to field whenever users focus on field with current field value and this value we compare with latest value of field when user focus out from field to trigger change.
    addTriggerChangeEventForInputElements:function($element) {
        $element.on('focus', function() {   //NO I18N
            $element.attr('oldValue', $element.val());
        });
        $element.on('blur', function() {    //NO I18N
            var oldValue = $element.attr('oldValue');   //NO I18N
            var newValue = $element.val();
            if (oldValue !== newValue) {
                $element.attr('oldValue',newValue);
                $element.trigger('customchange');//NO i18N
            }
        });
    },
    addListenerToRequester:function(){
        for(var i=0; i<this.ruleDataDummyObject.length ;i++){
            $se.executeRule(this.ruleDataDummyObject[i]);
        }
       $se.ruleDataDummyObject=[];
    },
    /*Add listener to field for on field change event*/
    addListenerToField:function(ruleData){
        var fieldType=$se.fieldsJson.getFieldType(ruleData.FIELDID);
        if(ruleData.FIELDID == "EMAILCC" && (sdp_user.USERTYPE == "Technician")) { //NO i18N
            fieldType = "multi_select"; //NO i18N
        }
        if(fieldType==='text'||fieldType==='textarea'){
            this.addTriggerChangeEventForInputElements(this.element(ruleData.FIELDID));

            //listening for customchange event trigger by custom implementation for detecting changes (refer to addTriggerChangeEventForInputElements method)
            this.element(ruleData.FIELDID).off("customchange" + "." + ruleData.RULEID).on("customchange" + "." + ruleData.RULEID, function(e) {//NO i18N
                if(!((e.originalEvent && ( e.originalEvent.firedBy==='user_api' || e.originalEvent.manual )) || e.firedBy === 'user_api' || e.manual)) {
                    $se.executeRule(ruleData);
                }
            });
        }
        else {
            //To keep track of site events so that we can trigger them after site gets changed using dialog
            if($se.isFormComponent && $se.form && ruleData.FIELDID === "SITE" && FC.config.site) {
                FC.config.site.site_events.push(ruleData.RULEID);
            }
            this.element(ruleData.FIELDID).off(ruleData.LISTENER + "." + ruleData.RULEID).on(ruleData.LISTENER + "." + ruleData.RULEID, function(e) {
                if(!((e.originalEvent && ( e.originalEvent.firedBy==='user_api' || e.originalEvent.manual )) || e.firedBy === 'user_api' || e.manual)) {
                    if(ruleData.FIELDID=='REQUESTER') {
                        var userId=$se.element("REQUESTER").val();//no i18n
                        $se.ruleDataDummyObject.push(ruleData);
                        if(userId && !isNaN(userId) && parseInt(userId) !==0){
                             /*
                                onField change Event when we create Rule based on onChange Requester
                                and Condition depend on the Change Requester (ex. job Title) then
                                rule execute first and then details updated.
                            */
                            $se.getUserDetails(userId);
                        }else{
                            $se.requesterDetails = {};
                            $se.addListenerToRequester();
                        }
                    }else {
                        if($se.isFormComponent && $se.form) {
                            setTimeout(function(){
                                $se.executeRule(ruleData);
                            },10);
                        } else {
                            $se.executeRule(ruleData);
                        }
                    }
                }
            });
        }

    },
    /*Execute a rule by checking its criteria and than executing actions*/
    executeRule:function(ruleData){
        var criterias=ruleData.CRITERIAS;
        if(!criterias.length||this.isCriteriaMatched(criterias)){
            this.invokeAction(ruleData);
        }
    },
    /*Apply given actions when criteria is satisfied*/
    invokeAction: function(ruleData){
        this.lastExecutedRule=ruleData.RULENAME.replace(/\\"/g,'"');
        var actions=ruleData.ACTIONS;
        for(var i=0,len=actions.length;i<len;i++){
            var actionType=actions[i].ACTIONTYPE,fields=actions[i].FIELDS;
            var fieldArr=[],values=[];
            for(var j=0,jlen=fields.length;j<jlen;j++){
                fieldArr.push(fields[j].FIELDID);
                if(fields[j].VALUES){
                    values=fields[j].VALUES;
                    for(var p=0,plen=values.length;p<plen;p++){
                        if(typeof values[p] === "object") {
                            values[p].name=values[p].name.replace(/\\\\\\\\"/g,'"');
                        } else {
                            values[p]=values[p].replace(/\\\\\\\\"/g,'"');
                        }
                    }
                }
            }
            let isRefField=false;
            switch (actionType){
                case "enable_action":  //NO I18N
                    $CS.enableField(fieldArr);
                    break;
                case "disable_action": //NO I18N
                    $CS.disableField(fieldArr);
                    break;
                case "show_action": //NO I18N
                    $CS.showField(fieldArr);
                    break;
                case "hide_action": //NO I18N
                    $CS.hideField(fieldArr);
                    break;
                case "mandate_action": //NO I18N
                    $CS.mandateField(fieldArr);
                    break;
                case "non_mandate_action": //NO I18N
                    $CS.nonMandateField(fieldArr);
                    break;
                case "execute_script_action": //NO I18N
                    if(ruleData.JSCODE){
                        this.executeCustomScript(ruleData.JSCODE);
                    }
                    break;
                case "add_options_action": //NO I18N
                    if($se.isFormComponent && $se.form && $se.form.fafrDynamic.indexOf(fieldArr[0].toLowerCase()) !== -1) {
                        $CS.addOptions(fieldArr[0], values, true);
                        break;
                    }
                    if($se.refer_fields&&$se.refer_fields.includes(fieldArr[0])){
                        isRefField=true;
                    }
                    if (typeof values[0] === "object") {
                        values = values.map(function(val, ind) {
                            return val.id;
                        });
                    }
                    var fieldValues=$se.getOptionsObject(fieldArr[0]);
                    var textValues=[];
                    for(var k=0,klen=values.length;k<klen;k++){
                        textValues.push(fieldValues[values[k]]);
                    }
                    $CS.addOptions(fieldArr[0],textValues);
                    break;
                case "remove_options_action": //NO I18N
                    if($se.isFormComponent && $se.form && $se.form.fafrDynamic.indexOf(fieldArr[0].toLowerCase()) !== -1) {
                        $CS.removeOptions(fieldArr[0], values, true);
                        break;
                    }
                    if($se.refer_fields&&$se.refer_fields.includes(fieldArr[0])){
                        isRefField=true;
                    }
                    if (typeof values[0] === "object") {
                        values = values.map(function(val, ind) {
                            return val.id;
                        });
                    }
                    var fieldValues=$se.getOptionsObject(fieldArr[0]);
                    var textValues=[];
                    for(var k=0,klen=values.length;k<klen;k++){
                        textValues.push(fieldValues[values[k]]);
                    }
                    $CS.removeOptions(fieldArr[0],textValues);
                    break;
                case "set_field_action": //NO I18N
                    var fieldType=$se.fieldsJson.getFieldType(fieldArr[0]);
                    if($se.refer_fields&&$se.refer_fields.includes(fieldArr[0])){
                        isRefField=true;
                    }

                    if (typeof values[0] === "object"&&isRefField==false ) {
                        values = values.map(function(val, ind) {
                            return val.id.toString();
                        });
                    }
                    if(fieldArr[0]==='SITE'||fieldArr[0]==='GROUP'){
                        $CS.setText(fieldArr[0],values[0]);
                    }
                    else if(fieldType==='date'||fieldType==='datetime'){
                        values=new Date(parseInt(values[0]));
                        $CS.setValue(fieldArr[0],values);
                    }
                    else if(fieldType==='multiselect' || fieldType==='radio' || fieldType === 'lookup'){  //NO I18N
                        $CS.setValue(fieldArr[0],values[0],true);
                    }
                    else if(fieldType==='textarea' || fieldType==='text' || fieldType==='number'){  //NO I18N
                        if(values.constructor == Array) {
                            $CS.setValue(fieldArr[0],values[0],true);
                        } else {
                            $CS.setValue(fieldArr[0],values,true);
                        }
                    }
                    else if(fieldType==='boolean'){  //NO I18N
                        $CS.setValue(fieldArr[0],values[0]);
                    }
                    else{
                        $CS.setValue(fieldArr[0],values,true);
                    }
                    break;
                case "clear_field_action": //NO I18N
                    for(var k=0,klen=fieldArr.length;k<klen;k++){
                        var fieldType=$se.fieldsJson.getFieldType(fieldArr[k]);
                        if(fieldType==='select'||fieldType==='multiselect'){
                            if($se.isResource(fieldArr[k])){
                                //in the new request page, the default option for select fields has the value null, instead of 0
                                $CS.setValue(fieldArr[k],"null");
                            }else{
                                $CS.setValue(fieldArr[k],"0");
                            }
                        }
                        else if(fieldType==='multipleselect'){
                            $CS.setValue(fieldArr[k],[]);
                        }
                        else if(fieldType==='radio'){   //NO I18N
                            $CS.setValue(fieldArr[k], null);
                        }
                        else{
                            $CS.setValue(fieldArr[k],"");
                        }
                    }
                    break;
                case "set_task_action": //NO I18N
                     $CS.setTasks(fieldArr);
                    break;
                case "unset_task_action": //NO I18N
                    $CS.unSetTasks(fieldArr);
                    break;
                case "hide_resource_action": //NO I18N
                    $CS.hideField(fieldArr);
                    break;
                case "show_resource_action": //NO I18N
                    $CS.showField(fieldArr);
                    break;
                case "show_task_action": //NO I18N
                    $CS.showTasks(fieldArr);
                    break;
                case "hide_task_action": //NO I18N
                    $CS.hideTasks(fieldArr);
                    break;
            }
        }
    },
    //this functions removes special characters from field details object
    removeSpecialCharFromFields:function(){
        jQuery.each(this.fieldsJson,function(viewId,v){
            var allowedValues=v.AllowedValues;
            if(allowedValues){
                v.ALLOWEDVALUES={};
                if(Array.isArray(allowedValues)){
                    for(var i=0;i<allowedValues.length;i++){
                       var a=allowedValues[i].name;
                       v.ALLOWEDVALUES[a]=allowedValues[i].id;
                    }
                }
                else{
                    for(var i in allowedValues){
                        var a=i.replace(/\\"/g,'"').unescapeHTML();
                        v.ALLOWEDVALUES[a]=allowedValues[i].replace(/\\"/g,'"').unescapeHTML();
                    }
                }
            }
            v.TITLE= v.TITLE ? v.TITLE.replace(/\\"/g,'"').unescapeHTML() : "";
            v.CATEGORY='formField';//NO I18N
        });
    },
    /*Called to population field with data-field and to apply field & form rules*/
    populateFieldData:function(formObject,viewFormObject){
            this.formObject=jQuery(formObject);
            this.removeSpecialCharFromFields();
            this.addDataFieldAttrToTasks();
            this.addDataFieldAttrToFields();
            this.isInlineView=false;
            this.addFieldForm=this.addResourceForm=true;
            if(viewFormObject){
                this.isInlineView=true; //Details View Page
                if(this.dom.find('#WOResourceForm').length){
                    this.resourcesObj=this.dom.find('#WOResourceForm');
                    this.addDataFieldAttrToResources();
    //                    this.oldResourceFormHtml=this.resourcesObj.html()//.clone().detach();
                }
            }
            else{
                if(this.dom.find('#WOResourceDetails').length){
                    this.resourcesObj=this.dom.find('#WOResourceDetails');
                    this.addDataFieldAttrToResources();
                }
            }
            this.fieldsJson=fieldDetailsFunction(this.fieldsJson);

            //add data-mandatory as true for fields which are made mandatory through template settings
            if(this.isInlineView){
                this.addMandatoryFieldFromForm(formObject);
            }
            else{
                 if(typeof mandatoryArray !== 'undefined' && mandatoryArray.length){
                     $se.addMandatoryList(mandatoryArray);
                 }
                 if(typeof mandatoryListArray !== 'undefined' && mandatoryListArray.length){
                     $se.addMandatoryList(mandatoryListArray);
                 }
            }

            if($se.isCreateOperation && $CS.isRequester()){
                var requesterId=WorkOrderForm.reqID.value;
                this.getUserDetails(requesterId);
            }else if($se.isInlineView){
               var requesterId=jQuery('#REQUESTERID_RCUR').attr("val");
               $se.getUserDetails(requesterId);
            }else{
               var requesterId="";
               if(jQuery('[name=WorkOrderForm]').length){
                   requesterId=WorkOrderForm.reqID.value;
                   this.getUserDetails(requesterId);
                }
            }

            //changed to fix SD-62869
            var rulesExist=this.rules.onform_load||this.rules.onfield_change||this.rules.onform_submit;
            if(rulesExist){
                if(this.isInlineView){
                    this.oldFieldFormHtml=this.formObject.html();  //to handle cancel editing for inline edit
                    this.handleInlineFieldForm(this.formObject,jQuery(viewFormObject));
                    this.handleInlineResourceForm();
                    this.addFieldForm=this.addResourceForm=false;
                }
                else{
                    this.addRulesToForm();
                    fixAllSections();
                }
            }
    },
    addRulesToInlineForm:function(){
        $se.addFieldForm=true;
        $se.addRulesToForm();
    },
    //This functions handle editing an inline edit form.
    handleInlineFieldForm:function($formObject,$inlineFormObject){
        var inline_field_form_edit_btn=this.dom.find('#Inline_RequestEdit_ID');
        $inlineFormObject.find('.spotEdit').prop('onclick',null).off('click').on('click',function(){  //NO I18N
            inline_field_form_edit_btn.click();
            fixSectionRowsHeight($formObject);
        });
//        inline_field_form_edit_btn.off('click').on('click',function(){  //NO I18N
//            fixSectionRowsHeight($formObject);
//        });
        //Handle cancel
        this.formObject.find('[name=Cancel]').off('click').on('click',function(){   //NO I18N
             $se.addFieldForm=false;
             $se.formObject.html($se.oldFieldFormHtml);
        });
    },
    executeOnFormSubmitScripts:function(callback){
        var onsubmitRules=this.rules.onform_submit;
        if(onsubmitRules && !this.onDetailPage){
        var onSubmitRulesLen=onsubmitRules.length;
            for(var i=0;i<onSubmitRulesLen;i++){
                var criterias=onsubmitRules[i].CRITERIAS;
                if(!criterias.length||this.isCriteriaMatched(criterias)){
                    if(onsubmitRules[i].ACTIONS.ACTIONTYPE == 'execute_script_action')
                    {
                        this.lastExecutedRule=onsubmitRules[i].RULENAME.replace(/\\"/g,'"');
                        this.executeCustomScript(onsubmitRules[i].JSCODE);
                    }
                    else{
                        this.invokeAction(onsubmitRules[i]);
                    }
                }
            }
            if(typeof callback == "function") { //NO I18N
                callback();
            }
        }
    },
    //This functions handle editing an inline edit resource form.
    handleInlineResourceForm:function(){
        var resourceDiv=this.dom.find('#WOResourceDetails_div');
        if(resourceDiv.length){
            resourceDiv.find('#resource_inline_edit').off('click').on('click',function(){   //NO I18N
                $se.addResourceForm=true;
                $se.addRulesToForm();
                resourceDiv.find('#resourceUpdateRow')
                            .find('[name=Update]')
                            .prop('onclick',null)      //NO I18N
                            .off('click')   //NO I18N
                            .on('click',function(){   //NO I18N
                                $se.checkOnSubmitCall();
                });
            });
            //Handle cancel
            resourceDiv.find('[name=Cancel]').off('click').on('click',function(){   //NO I18N
                $se.addResourceForm=false;
//                $se.resourcesObj.html($se.oldResourceFormHtml)//.clone();
            });
        }
    },
    /*Add data-fields to field of form object using mappingJson*/
    addDataFieldAttrToFields:function(){
        var currentForm=this.formObject;
        if(this.mappingJson){
            jQuery.each(this.mappingJson,function(index, el) {
                if(index+'_hid'!==currentForm.find('[name='+index+']').attr('id')){
                    currentForm.find('[name='+index+']').attr('data-field',el);//NO I18N
                }
            });
            currentForm.find('[name*=UDF_]').not('[id$=_hid]').each(function(){ //NO I18N
                jQuery(this).attr('data-field',this.name);//NO I18N
            });
            currentForm.find('[name^=GUDF_]').not('[id$=_hid]').each(function(){    //NO I18N
                jQuery(this).attr('data-field',this.name);//NO I18N
            });
        }
    },
    //this function is used to add data-field attributes to resources if any
    addDataFieldAttrToResources:function(){
        jQuery.each(this.resources,function(id,robject){
            var ids_arr=id.split('_');
            var rid=ids_arr[1],qid=ids_arr[3];
            robject.CATEGORY='resourcefield';//NO I18N
            var reverseAllowedValues={};
            jQuery.each(robject.AllowedValues,function(i,v){
                if(i==="null"){
                    i="0";
                }
                if(typeof v === 'string'){
                    v=v.replace(/\\"/g,'"').unescapeHTML();
                }else{
                    //v is an object if there is a cost associated with a resource question
                    v=v.value.replace(/\\"/g,'"').unescapeHTML();
                }
                i=i.replace(/\\"/g,'"').unescapeHTML();
                reverseAllowedValues[v]=i;
            });
            robject.ALLOWEDVALUES=reverseAllowedValues;
            $se.resourcesObj.find('#'+rid+'\\:'+qid).attr('data-field',id);//NO I18N
        });
        this.fieldsJson=jQuery.extend({},this.fieldsJson,this.resources);
    },
        //this function is used to add data-field attributes to tasks if any
    addDataFieldAttrToTasks:function(){
        var tasks=this.tasks;
        if(!jQuery.isEmptyObject(tasks)){
            this.tasksObj=this.dom.find('#templateTask_div');
            for(var i in tasks){
                var id="templateTask"+i;//NO I18N
                this.tasksObj.find('input#'+id).attr('data-field',id);//NO I18N
                this.fieldsJson[id]={
                    TITLE:tasks[i].replace(/\\"/g,'"').unescapeHTML(),
                    CATEGORY:'taskField'    //NO I18N
                };
            }
        }
    },
    /*On submit event rules execution*/
    checkOnSubmitCall:function (){
        this.stopFormSubmission=false;
        try{
            var onsubmitRules=this.rules.onform_submit;
            if(onsubmitRules && !this.onDetailPage){
            var onSubmitRulesLen=onsubmitRules.length;
                for(var i=0;i<onSubmitRulesLen;i++){
                    var criterias=onsubmitRules[i].CRITERIAS;
                    if(!criterias.length||this.isCriteriaMatched(criterias)){
                        if(onsubmitRules[i].ACTIONS.ACTIONTYPE == 'execute_script_action'){
                            this.lastExecutedRule=onsubmitRules[i].RULENAME.replace(/\\"/g,'"');
                            this.executeCustomScript(onsubmitRules[i].JSCODE);
                        }else{
                            this.invokeAction(onsubmitRules[i]); // ID: 68078
                        }
                        if(this.stopFormSubmission){
                            closeDialog();
                            return false;
                        }
                    }
                }
            }
        }catch(e){
            if(typeof console==="undefined"){

            }
        }
        return !this.stopFormSubmission;
    },
    //this function is used to get escaped string
    getEscapedString:function(str){
        str=str.replace(/\\/g,'\\\\');
        str=str.replace(/\n/g,'\\n');
        str=str.replace(/\t/g,'\\t');
        str=str.replace(/\r/g,'\\r');
        str=str.replace(/\f/g,'\\f');
        str=str.replace(/\'/g,"\\'");
        str=str.replace(/\"/g,'\\"');
        return str;
    },
    //this function is used to get unescaped string
    getUnescapedString:function(str){
        str=str.replace(/\\\\"/g,'"');
        return str;
    },
    /*apply given condition and get result of a and b*/
    getResultUsingCondition:function(a,b,condition,fieldType,field){
        var result=false,c;
        if(["date","datetime"].indexOf(fieldType)!=-1){
            var dateA=a?a.getTime():undefined,
                dateB=new Date(parseInt(b[0])).getTime();
            switch (condition){
                case 'is_empty': //NO I18N
                      if(a == 0 || a == ''){
                        result = true;
                      }
                      break;
                case 'is_not_empty': //NO I18N
                      if(a != 0 && a!=''){
                        result = true;
                      }
                      break;
                case 'is':            /*simulate is equals condition*/     //NO I18N
                        result=dateA===dateB;
                    break;
                case 'is_not':        /*simulate is not equals condition*/   //NO I18N
                        result=dateA!==dateB;
                    break;
                case 'after':   /*simulate date is after specified date */   //NO I18N
                        result=dateA>dateB;
                            break;
                case 'before':  /*simulate date is before specified date */   //NO I18N
                        result=dateA<dateB;
                    break;
            }
        }
        else if(['number','number_notEmpty','long','double'].indexOf(fieldType)!=-1){
            c=b[0];
            a=jQuery.isNumeric(a)?parseFloat(a):a;
            c=jQuery.isNumeric(c)?parseFloat(c):c;
            switch (condition){
                case 'is_empty': //NO I18N
                      if(a == 0 || a==''){
                        result = true;
                      }
                      break;
                case 'is_not_empty': //NO I18N
                      if(a != 0 && a!='' ){
                        result = true;
                      }
                      break;
                case 'is':            /*simulate is equals condition*/     //NO I18N
                    result=(a===c);
                    break;
                case 'is_not':        /*simulate is not equals condition*/   //NO I18N
                    result=(a!==c);
                    break;
                case 'greater': /*simulate number is greater than specified */   //NO I18N
                    result=(a>c);
                    break;
                case 'lesser': /*simulate number is lesser than specified */   //NO I18N
                    result=(a<c);
                    break;
            }
        }
        else if(['text','textarea','text_notEmpty','multi_line','string','color','rich_text_area','html','file_upload'].indexOf(fieldType)!=-1){
            if (typeof b[0] === "object") {
                b = b.map(function(val, ind) {
                    return val.id;
                });
            }
            c=this.getUnescapedString(b[0]);
            switch (condition){
                case 'is_empty': //NO I18N
                      if(a == 0 || a=='' || a==null || a=='null'){
                        result = true;
                      }
                      break;
                case 'is_not_empty': //NO I18N
                      if(a != 0 && a!='' && a!=null && a!='null'){
                        result = true;
                      }
                      break;
                case 'is':            /*simulate is equals condition*/     //NO I18N
                    result=(a===c);
                    break;
                case 'is_not':        /*simulate is not equals condition*/   //NO I18N
                    result=(a!==c);
                    break;
            case 'contains':     /*simulate text string contains a given string */   //NO I18N
                    a = (a === null) ? "" : a;  //SD-119122
                    if(a.constructor  === Array) {
                        a = a.join(",");     //NO I18N
                    }
                    result=(a.toString().toLowerCase().indexOf(c.toLowerCase())!==-1);
                    break;
            case 'not_contains': /*simulate text string does not contains a given string */   //NO I18N
                    a = (a === null) ? "" : a;  //SD-119122
                    if(a.constructor  === Array) {
                        a = a.join(",");     //NO I18N
                    }
                    result=(a.toString().toLowerCase().indexOf(c.toLowerCase())===-1);
                    break;
            }
        }
        else if(['multiselect','multiselect_notEmpty','lookup','multi_select'].indexOf(fieldType)!=-1){
            /* a is the list of object with data
             * b is the list of passed selected condtion field's option
             */
            switch (condition){
                case 'is_empty': //NO I18N
                      if(a==null || a == 0 || a=='' || a=='null'){
                        result = true;
                      }
                      break;
                case 'is_not_empty': //NO I18N
                      if(a != 0 && a!='' && a!=null && a!='null'){
                        result = true;
                      }
                      break;
                case 'is_not': //NO I18N
                    if (typeof b[0] === "object") {
                        b = b.map(function(val, ind) {
                            return val.id;
                        });
                    }
                    for(var i=0,len=b.length;i<len;i++){
                        if($se.module === 'CHANGE' && field === 'SERVICE') {
                            //workaround for 'sevices affected' in change module
                            result = true;
                            var val = this.getUnescapedString(b[i]);
                            jQuery("[data-field=SERVICE]").find("option").each(function(i, o) {
                                result &= (o.value !== val);
                                if(result == false) {
                                    return false;
                                }
                            });
                        } else {
                            result=(a!==this.getUnescapedString(b[i]));
                        }
                        if(!result){
                            break;
                        }
                    }
                    break;
                case 'is':    /*simulate is any of (or) condition*/   //NO I18N
                    if (typeof b[0] === "object") {
                        b = b.map(function(val, ind) {
                            return val.id;
                        });
                    }
                    for(var i=0,len=b.length;i<len;i++){
                        if($se.module === 'CHANGE' && field === 'SERVICE') {
                            //workaround for 'sevices affected' in change module
                            result = false;
                            var val = this.getUnescapedString(b[i]);
                            jQuery("[data-field=SERVICE]").find("option").each(function(i, o) {
                                result |= (o.value === val);
                                if(result == true) {
                                    return false;
                                }
                            });
                        } else {
                            result=(a===this.getUnescapedString(b[i]));
                            if($se.page_scripts.enabled && jQuery.isArray(a)){
                                result=(a.indexOf(this.getUnescapedString(b[i]))!=-1);
                            }
                        }
                        if(result){
                            break;
                        }
                    }
                    break;
                 case 'are':        /*simulate are equals condition*/   //NO I18N
                    if (typeof b[0] === "object") {
                        b = b.map(function(val, ind) {
                            return val.id;
                        });
                    }
                    if(b.indexOf('0')!==-1){
                        result=(a.length===0);
                    }
                    else if(a.length===b.length){
                        var result=true;
                        for(var i=0,len=b.length;i<len;i++){
                            result=(a.indexOf(this.getUnescapedString(b[i]))!=-1);
                            if(!result){
                                break;
                            }
                        }
                    }
                    break;
            }
        }
         else if(['multicheckbox','multipleselect','checkbox','radio'].indexOf(fieldType)!=-1){
            if (typeof b[0] === "object") {
                b = b.map(function(val, ind) {
                    return val.id;
                });
            }
            switch (condition){
                case 'is_empty': //NO I18N
                      if(a == 0 || a=='' || a==null || a=='null'){
                        result = true;
                      }
                      break;
                case 'is_not_empty': //NO I18N
                      if(a != 0 && a!='' && a!=null && a!='null'){
                        result = true;
                      }
                      break;
                case 'is': //NO I18N
                    if(a==null){
                        return false;
                    }
                    if (typeof b[0] === "object") {
                        b = b.map(function(val, ind) {
                            return val.id;
                        });
                    }
                    for(var i=0,len=b.length;i<len;i++){
                        if(b[i]==='0'&&fieldType!="radio"){
                            result=(a.length===0);
                        }
                        else if(typeof a === 'string'){
                            result=(a == this.getUnescapedString(b[i]));
                        }
                        else{
                            result=(a.indexOf(this.getUnescapedString(b[i]))!=-1);
                        }
                        if(result){
                            break;
                        }
                    }
                    break;
                case 'is_not':        /*simulate is not equals condition*/   //NO I18N
                    if(a==null){
                        return true;
                    }
                    if (typeof b[0] === "object") {
                        b = b.map(function(val, ind) {
                            return val.id;
                        });
                    }
                    for(var i=0,len=b.length;i<len;i++){
                        if(b[i]==='0'&&fieldType!="radio"){
                            result=(a.length!==0);
                        }
                        else if(typeof a === 'string'){
                            result=(a != this.getUnescapedString(b[i]));
                        }
                        else{
                            result=(a.indexOf(this.getUnescapedString(b[i]))==-1);
                        }
                        if(!result){
                            break;
                        }
                    }
                    break;
                case 'are':        /*simulate are equals condition*/   //NO I18N
                if (typeof b[0] === "object") {
                    b = b.map(function(val, ind) {
                        return val.id;
                    });
                }
                if(b.indexOf('0')!==-1){
                    result=(a.length===0);
                }
                else if(a.length===b.length){
                    var result=true;
                    for(var i=0,len=b.length;i<len;i++){
                        result=(a.indexOf(this.getUnescapedString(b[i]))!=-1);
                        if(!result){
                            break;
                        }
                    }
                }
                break;
            }
        }
        else if(["boolean"].indexOf(fieldType)!=-1){
            switch (condition){
                case 'is': //NO I18N
                    if(!isNaN(parseInt(b[0]))){
                        result=(a===!!(parseInt(b[0])));
                        break;
                    }
                    else{
                        result=(a===(b[0]==="true")); //NO I18N
                        break;
                    }
                
            }
        }
        return result;
    },
    /*Invoke action for on sumbit events*/
    executeCustomScript:function(script){
        jQuery(document).ready(function() {
            script=script.replace(/\\"/g,'"');
            var dummyDiv=document.createElement('script');
            dummyDiv.nonce=sdpNonce;
        /*Adding script in anonymous function so that no conflict can occur with global variables.*/
        dummyDiv.innerHTML='(function () {\n'+script+'\n})();';//NO I18N
        document.body.appendChild(dummyDiv);
        });
    },
    //check if a field is hidden or if mandate is false
    isHiddenOrNonMandatory:function(fieldObject){
        var fieldObj=jQuery(fieldObject);
    if(fieldObj.attr('data-field')===undefined){    //SD-61577
        return false;
    }
        try{
            // fieldObj.parents('.rows').eq(0).
            var visibility = fieldObj.parents('.rows').eq(0).hasClass('hide') ? "none" : "block"; //NO I18N
            if(this.isInlineView){
                visibility=fieldObj.css('visibility');//NO I18N
            }
            if(visibility==="none"){
                return true;
            }
        }catch(e){
            if(typeof console==="undefined"){

            }
        }
        try{
            var objDataFieldMandatory=fieldObj.attr('data-mandatory');//NO I18N
            if(this.isInlineView){
                objDataFieldMandatory=fieldObj.find('.form-control').attr('data-mandatory');//NO I18N
            }
            if(objDataFieldMandatory!=="true"&&objDataFieldMandatory!==undefined){  //SD-61577
                return true;
            }
        }catch(e){
            if(typeof console==="undefined"){

            }
        }
        return false;
    },
    //this function is used to set attribute data-mandatory as true for fields in  mandatory field list
    addMandatoryList:function(mandatoryFieldList){
        for(var i=0,len=mandatoryFieldList.length;i<len;i++){
            var fieldId=(this.mappingJson[mandatoryFieldList[i]])
                            ? this.mappingJson[mandatoryFieldList[i]]
                            : mandatoryFieldList[i];
            if(this.fieldsJson.getFieldObject(fieldId)){
                var element=this.elementUsedInGetValue(fieldId);
                if(!element.attr('data-mandatory')){
                    element.attr('data-mandatory','true');//NO I18N
                }
            }
        }
    },
    //this function is used to set attribute data-mandatory as true for mandatory fields in form object
    addMandatoryFieldFromForm:function(form){
    for(var i=0,len=form.elements.length; i<len; i++){
            var formFieldName=form.elements[i].name;
            var manObj = document.getElementById(formFieldName + "_MANDATORY"); //NO I18N
            if(manObj&&manObj.value==='true'){
               var fieldId=(this.mappingJson[formFieldName])
                               ? this.mappingJson[formFieldName]
                               : formFieldName;
               if(this.fieldsJson.getFieldObject(fieldId)){
                   var element=this.elementUsedInGetValue(fieldId);
                   if(!element.attr('data-mandatory')){
                        element.attr('data-mandatory','true');//NO I18N
                   }
               }
            }
        }
    },
    /*On submit event mandatory field validation*/
    getMandatoryFields:function(){
        var mandate =[];
        try{
            var dom=jQuery(document);
            dom.find('[data-mandatory=true]').each(function(){
                var datafield=jQuery(this).attr('data-field');//NO I18N
                /* if(datafield == 'ATTACHMENT'){
                  dom.find('[data-field="ATTACHMENT"]').val(jQuery('#whitebg').text());
                }*/
                var fieldValue = jQuery.trim(jQuery(this).val());
                //check for mandatory resource fields if resource form is in edit mode
                // and mandatory form field if form fields is in edit mode (inline view)
                if((!$se.isResource(datafield)&&$se.addResourceForm)||($se.isFormField(datafield)&&$se.addFieldForm)){
                    mandate.push(dom.find("[data-field='"+datafield+"']").attr("name"));
                }
            });
        }catch(e){
            if(typeof console==="undefined"){

            }
        }
        return mandate;
    },
    /*On submit event mandatory field validation*/
    checkMandatoryValidation:function(){
        var isMand =false;
        try{
            var dom=jQuery(document);
            if($se.isAttachmentMandate && $CS.isAttachmentEmpty()){
                alert(getMessageForKey("sdp.common.attachments")+" "+getMessageForKey("sdp.requests.newrequest.udf.mandatory"));
                if($req.prop.fromListview) {
                    jQuery('.page-progressbar').hide();
                }
                return isMand;
            }
            dom.find('[data-mandatory=true]').each(function(){
                var datafield=jQuery(this).attr('data-field');//NO I18N
                if(datafield == 'ATTACHMENT'){
                    if(jQuery(this).parent().find('#displayAttachments').find(".ath-fle").length > 0){
                        jQuery(this).val('attachmentsPresent'); //NO I18N
                    }else{
                         jQuery(this).val(''); //NO I18N
                    }
                }
                var fieldValue = jQuery.trim(jQuery(this).val());
                //check for mandatory resource fields if resource form is in edit mode
                // and mandatory form field if form fields is in edit mode (inline view)
                if(($se.isResource(datafield)&&$se.addResourceForm)||($se.isFormField(datafield)&&$se.addFieldForm)){
                    if(datafield){
                        fieldValue=$CS.getValue(datafield);
                    }
                    var isHidden=!$CS.isVisible(datafield);
                    var isSelectField=jQuery(this).is("select");//NO I18N
                    if(datafield == "SITE"){
                        isSelectField = true;
                    }
                    var isDynamicLoadingField = $CS.isDynamicLoadingField(jQuery(this));
                    var isFieldValueEmptyArray=jQuery.isArray(fieldValue) && fieldValue.length===0;
                    var isEmptySelectField=(isSelectField || isDynamicLoadingField) && (!fieldValue || fieldValue === '0' || fieldValue==='null');//NO I18N
                    var isEmptyInputField=!isSelectField && !fieldValue;

                    /*if(datafield =='ATTACHMENT' && fieldValue == ''){
                        isMand = true;
                        closeDialog();
                        var fieldTitle=$se.fieldsJson.getFieldTitle(datafield);
                        var msg=getMessageForKey("sdp.admin.srequest.mandatory.message",[fieldTitle]);//NO I18N
                        alert(msg);
                        jQuery('#attachmentDiv .linkBorder').trigger('focus');
                        return false;
                    }
                    else */
                    if(!isHidden && (isFieldValueEmptyArray || isEmptySelectField || isEmptyInputField))
                    {
                        isMand = true;
                        closeDialog();
                        var fieldTitle=$se.fieldsJson.getFieldTitle(datafield);
                        var msg=getMessageForKey("sdp.admin.srequest.mandatory.message",[fieldTitle]);//NO I18N
                        alert(msg);
                        $se.element(datafield).trigger('focus');
                        return false;
                    }
                }
            });
        }catch(e){
            if(typeof console==="undefined"){

            }
        }
        return !isMand;
    },
    /*Add html options to to given field where option can be json array or json object*/
    addHtmlOptions:function(field,options){
        var allowedValues=this.fieldsJson.getAllowedValues(field);
        var fieldObject = this.element(field);
        var fieldType = this.fieldsJson.getFieldType(field);
        if(allowedValues){
            if($CS.isDynamicLoadingField(fieldObject)){
                var dynamicFieldName = fieldObject.data("fieldName"); //No I18N
                //empty the optionsMap array and then add the new options, based on the parent field's value
                dynamicLoading.optionsMap[dynamicFieldName] = [];
                var arrOpts = [];
                if(jQuery.type(options)==='array'){
                    for(var i=0, optionLen = options.length; i<optionLen; i++){
                        var title = options[i];
                        if(allowedValues[title] && (indexInArrayOfObjects(dynamicLoading.optionsMap[dynamicFieldName], "text", title) === -1)){
                            //adding the value to the optionsMap Array
                            dynamicLoading.optionsMap[dynamicFieldName].push({id:allowedValues[title], text:title});
                            arrOpts.push(title);
                        }
                    }
                }
                //all other fields options will be object in dependency object
                else{
                    for(var i in options){
                        var title = i;
                        if(allowedValues[title] && (indexInArrayOfObjects(dynamicLoading.optionsMap[dynamicFieldName], "text", title) === -1)){
                            //adding the value to the optionsMap Array
                            dynamicLoading.optionsMap[dynamicFieldName].push({id:allowedValues[title], text:title});
                            arrOpts.push(title);
                        }
                    }
                }
                //reloading the select2 component for the changes to be reflected
                dynamicLoading.refreshSelect2(fieldObject, dynamicFieldName);
                if($se.isFormComponent && $se.form) {
                    $se.form.addAllowedValuesByNames(dynamicFieldName, arrOpts);
                }
            }else{
            var optHtml=[];
            var allowedOptions = [];
            //last options is array in dependency object
            if(jQuery.type(options)==='array'){
                for(var i=0,len=options.length;i<len;i++){
                    if(allowedValues[options[i]]!==undefined){
                        if($se.isFormComponent && $se.form) {
                            allowedOptions.push(options[i]);
                        } else {
                            optHtml.push(new Option(options[i],allowedValues[options[i]]));
                        }
                    }
                }
            }
            //all other fields options will be object in dependency object
            else{
                for(var i in options){
                    if(allowedValues[i]!==undefined){
                        if($se.isFormComponent && $se.form) {
                            allowedOptions.push(i);
                        } else {
                            optHtml.push(new Option(i,allowedValues[i]));
                        }
                    }
                }
            }
            if($se.isFormComponent && $se.form) {
                var fname = fieldObject.attr("name");   //No I18N
                $se.form.addAllowedValuesByNames(fname, allowedOptions);
            } else {
                fieldObject.append(optHtml);
            }
            }
        }
    },
    /*Set dependency parent field add listener to parent field*/
    setParentListener: function(dependencyObj){
        if(window.req_module && $req.prop.wizard.isEnabled!=true){
            $req.prop.fafr_dependent_fields.push(jQuery.extend(true,{},{},dependencyObj));
        }
        var values=dependencyObj.VALUES,
            fields=dependencyObj.FIELDS,
            selectedValues=[];
        //get pre selected values (set via template default configurations) or when request is in edit mode
        for(var i=0,len=fields.length;i<len;i++){
            fields[i]=this.fieldsJson.getFieldId(fields[i]);
            if(!this.fieldsJson.getFieldObject(fields[i])){
                return;
            }
            selectedValues[i]=$CS.getValue(fields[i]);
        }
        var parentValue=selectedValues[0];
        //If some value of field is already selected than show dependent fields options accordingly
        if(parentValue&&parentValue!=="0"&&parentValue!=="null"){
            this.addOptionsToDependentField(fields,values,selectedValues);
        }
        else{
            //remove options of all fields exception default option eg: (--select --)
            $se.skipFireEvent=true;
            $CS.removeAllOptions(fields);
            $se.skipFireEvent=false;
            //add options for current field
            this.addHtmlOptions(fields[0],values);
        }
        //attach change listener for current field
        $se.element(fields[0]).off('change.udf_dependency').on('change.udf_dependency', function(){ //NO I18N
            $se.addOptionsToDependentField(fields,values,selectedValues);
        });
        /** If the allowed values are changed, then the change event gets reinitialized.
            This is done to maintain change event order */
        $se.element(fields[0]).on("valuesChanged", function(ev) {
            $se.element(fields[0]).off('change.udf_dependency').on('change.udf_dependency', function() {    //NO I18N
                $se.addOptionsToDependentField(fields,values,selectedValues);
            });
        });
    },
    /*add options to child field for selected parent value*/
    addOptionsToDependentField:function(fields,values,selectedValues){
        var fieldsLen=fields.length;
        if(fieldsLen>1){
            var lastfield=fields[0],
                currfield=fields[1],
                newfields=fields.slice(1),
                newSelectedValues=selectedValues.slice(1);
            $se.skipFireEvent=true;
            $CS.removeAllOptions(newfields);
            $se.skipFireEvent=false;
            //Here using getText since for resources existing CI's value,title pair is different
            var selectedOption=$CS.getText(lastfield);

            if(values){
                var newValues=[];
                var object={};
                var len=0;
                if(selectedOption!=null){
                    len=selectedOption.length;
                }

                // if field is PickList
                if(len!=0 && values[selectedOption[0]]==undefined){
                    newValues=values[selectedOption];
                }
                else{ // if Field is MultipleSelect
                    for(var i=0;i<len;i++){
                        if(jQuery.isArray(values[selectedOption[i]])){
                            newValues = newValues.concat(values[selectedOption[i]]);
                        }else{
                                newValues=[];
                                object=jQuery.extend(object,values[selectedOption[i]]);
                                newValues=object;
                        }
                    }
                }

                this.addHtmlOptions(currfield,newValues);

                if(newSelectedValues[0]!=="0"&&newSelectedValues[0]!=="null"){
                    $CS.setValue(currfield,newSelectedValues[0]);
                    this.addOptionsToDependentField(newfields,newValues,newSelectedValues);
                }
                //If more dependent fields exist attach change listener to current field.
                if(fieldsLen>2){
                    $se.element(currfield).off('change.udf_dependency').on('change.udf_dependency', function(){ //NO I18N
                        $se.addOptionsToDependentField(newfields,newValues,newSelectedValues);
                    });
                    /** If the allowed values are changed, then the change event gets reinitialized.
                        This is done to maintain change event order */
                    $se.element(currfield).on("valuesChanged", function(ev) {
                        $se.element(currfield).off('change.udf_dependency').on('change.udf_dependency', function(){ //NO I18N
                            $se.addOptionsToDependentField(newfields,newValues,newSelectedValues);
                        });
                    });
                }
            }
        }
    },
    //handle CSI, grpTech, siteTech, siteGrp models to add Options
    getDynamicValuesForDefaultFields:function(fieldId){
        fieldId=$CS.getNewUDFName(fieldId);
        var allowedValues={};
        if(fieldId==='SUBCATEGORY'||fieldId==='ITEM'){
            var selectedCategory=$CS.getValue('CATEGORY');//NO I18N
            if(!selectedCategory||selectedCategory==='0'){
                return allowedValues;
            }
            if(window.req_module){
                selectedCategory = $CS.getText('CATEGORY'); //No I18N
                if (!selectedCategory || selectedCategory === translate("sdp.requests.fieldFormRules.rules.notspecified")) {
                    return allowedValues;
                }
                var subCategoriesObj=($se.isFormComponent && $se.form && $req.form) ? $req.form.csi_json[selectedCategory].sub_categories  : $req.csi.csi_model[selectedCategory].sub_categories;
                if(fieldId==='ITEM'){
                    var selectedSubCategory=$CS.getValue('SUBCATEGORY');//NO I18N
                    if(!selectedSubCategory||selectedSubCategory==='0'){
                        return allowedValues;
                    }
                    selectedSubCategory=$CS.getText('SUBCATEGORY');//NO I18N
                    if (!selectedSubCategory || selectedSubCategory === translate("sdp.requests.fieldFormRules.rules.notspecified")) {
                        return allowedValues;
                    }
                    allowedValues=this.createValuesObjectCSI(subCategoriesObj[selectedSubCategory].items);
                }
                else{
                    allowedValues=this.createValuesObjectCSI(subCategoriesObj);
                }
            }else{
            var subCategories=csi.list[selectedCategory][1];
            if(fieldId==='ITEM'){
                var selectedSubCategory=$CS.getValue('SUBCATEGORY');//NO I18N
                if(!selectedSubCategory||selectedSubCategory==='0'){
                    return allowedValues;
                }
                allowedValues=this.createValuesObject(subCategories[selectedSubCategory][1]);
            }
            else{
                allowedValues=this.createValuesObject(subCategories);
            }
        }
        }
        else{
            var selectedSite=$CS.getValue('SITE');//NO I18N
            if(fieldId==='GROUP'){
                 if(selectedSite && siteGrpModel.list[selectedSite] && siteGrpModel.list[selectedSite][1]!==-1){
                    if(siteGrpModel.list[selectedSite][1] != undefined) {
                        allowedValues=this.createValuesObject(siteGrpModel.list[selectedSite][1]);
                    } else {
                        allowedValues={};
                    }
                } else{
                    allowedValues=this.createValuesObject(siteGrpModel.list['0'][1]);
                }
            }
            else{
                var selectedGroup=$CS.getValue('GROUP');//NO I18N
                var valuesArr=[];
                if(selectedGroup&&selectedGroup!=='0'){
                    valuesArr=grpTechModel.list[selectedGroup];
                } else if(selectedSite&&(!selectedGroup||selectedGroup==='0')){
                    valuesArr=siteTechModel.list[selectedSite];
                    if(valuesArr && valuesArr.length === 1 && valuesArr[0] === -1){
                        //if the site is a refer site, change the allowedValues accordingly.
                        valuesArr = siteTechModel.list[0];
                        if(siteRefModel.list[selectedSite]){
                            var referredSite = siteRefModel.list[selectedSite];
                            valuesArr = siteTechModel.list[referredSite];
                        }
                    }
                }
                else{
                    valuesArr=siteTechModel.list['0'];
                }
               // SD-78637 issue fix
                if(valuesArr !== undefined) {
                    for(var i=0,len=valuesArr.length;i<len;i++){
                        var techId=valuesArr[i];
                        var techName=techID_NameModel.list[techId][1];
                        allowedValues[techName]=techId;
                    }
                }
            }
        }
        return allowedValues;
    },
    //this function is used internally to get json object from dependend fields model CSI,grpTech,siteTech and so
    createValuesObject:function(object){
        var valuesObj={};
        for(var i in object){
            valuesObj[object[i][0]]=i;
        }
        return valuesObj;
    },
    //this function is used internally to get json object from dependend fields model CSI in the details page
    createValuesObjectCSI:function(object){
        var valuesObj={};
        if(Array.isArray(object)){
            for(var i=0; i<object.length; i++){
                valuesObj[object[i].name] = object[i].id
            }
        }else{
            for(var i in object){
                valuesObj[i]=object[i].id;
            }
        }
        return valuesObj;
    },
/*
Request Object format :
        {
            url:'',
            method_type:'',
            post_content:'',
            headers:{

            },
            url_parameters:{

            }
        }
Response Object format :
        {
            response_data:,
            response_message:,
            response_code:
        }
*/
    // This function is used to make custom ajax call and request object should be in above format
    customAjaxCall:function(requestObject){
        if(!requestObject.url){
            return;
        }
        if(!requestObject.method_type){
            requestObject.method_type='get';//NO I18N
        }
        var methodType='get',resultObject;//NO I18N
        if(requestObject.method_type.toLowerCase()==='post'){
            methodType='post';//NO I18N
        }
        var requestData= (typeof sdpToJSON != 'undefined') ? sdpToJSON(requestObject) : JSON.stringify(requestObject) ; //NO I18N
        sdpAjax({
            type:methodType,
            async:false,
            url:'/servlet/ActionExecutorServlet',//NO I18N
            data:{requestData:requestData},
            success:function(data){
                resultObject = data;
           }
       });
       return resultObject;
    },
    getUserDetails:function(userId){
        /* when we change the template then we get the requester id 0*/
        if(userId && !isNaN(userId) && parseInt(userId) !==0){
            var data = {
                url: '/api/v3/users/'+userId, // No I18N
                async:false,
                ignorefailuremessage: true,
                success: function(data){
                    if(data.user !== undefined){
                            $se.requesterDetails = data.user;
                            $se.addListenerToRequester();
                    }
                }
            }
            if(jQuery("#oboID").val()){
                var input_data={"list_info":{"fields_required":["name","email_id","department","phone","mobile","jobtitle","employee_id","first_name","middle_name","last_name"],"search_criteria":{"field":"id","values":[userId],"condition":"is"}}}//no i18n
                data.url = "/api/v3/requests/on_behalf_of";// No I18N
                data.data={input_data:sdpToJSON(input_data)};
                data.success=function(data){
                    if(data.on_behalf_of !== undefined){
                        $se.requesterDetails = data.on_behalf_of[0];
                        $se.addListenerToRequester();
                    }
                }
            }
            sdpAjax(data)
       }
    },
    ffr:{
      fieldsObj:{},
      didFetchRules:false,
      /**
       * fetches the FAFR for the template ( create | edit )
       * and executes the callback after fetching the FAFR
       */
      getFAFR: function(callback, args) {
        var templateId = $se.ffr.form.options.ffr.id;
        var module = $se.ffr.form.options.ffr.entity.toUpperCase(); 
        var mode = $se.ffr.form.mode === "new" ? "create" : "edit"; //No I18N
        let asyncFlag=$se.ffr.form.options.ffr.async;
        $se.ffr.form.options.ffr.async=true;
        var role=sdp_user.USERTYPE;
        if(module=="CHANGE"){
            if(!$CRObj.isCMCO){
                role="UserExceptCMCO";  //NO I18N
            }
        }else{
            if(!$CRObj.isRMRE&&module=="RELEASE"){
                role="UserExceptRMRE";  //NO I18N
            }
        }
        var _self=this;
        return sdpAjax({
          url: "/servlet/SDAjaxServlet?action=getTemplateRulesJson&module=" + module + "&templateId=" + templateId + "&sdUserType=" + role + "&mode=" + mode + "&rulesRequired=all", //NO I18N
          type: 'GET',  //NO I18N
          cache: false,
          async:asyncFlag,
          context: this,
          success: function(data){
            _self.didFetchRules = true;
            _self.rulesObj=data;
            if(typeof callback === "function") {
              callback.apply(_self, args);
            }
          }
        });
      },

      /**
       * sets Field and form Rules to the form
       * skipOnLoad - on opening the form in popup, the onload rules should be skipped from executing
       */
      setFieldAndFormRules: function (form,skipRules) {
        var setFAFR = function() {
          /** fetches the template's fields information including allowed values */
          
          var mappingField={
                      "single_line":"text",//No i18n
                      "multi_line":"textarea",//No i18n
                      "pick_list":"multiselect",//No i18n
                      "multi_select":"multipleselect",//No i18n
                      "numeric":"number",//No i18n
                      "decimal":"number",//No i18n
                      "date":"date",//No i18n
                      "date/time":"date",//No i18n
                      "email":"text",//No i18n
                      "url":"text",//No i18n
                      "phone":"text",//No i18n
                      "percentage":"number",//No i18n
                      "boolean":"boolean",//No i18n
                      "html":"rich_text_area"//No i18n
                  };
          var fields=$se.ffr.form.current_layout_fields
          Object.keys(fields).forEach(i=>{
              var field=fields[i];
              var id=field.id;
              var fafr_key=field.fafr_key;
              var type=field.display_type;
              var udf_field= field.udfif!=undefined;
              var altered_type= field.type;
              altered_type=mappingField[altered_type]?mappingField[altered_type]:altered_type;
              if(type=="Radio"){
                altered_type="radio";//no i18n
              }
              $se.ffr.fieldsObj[fafr_key]={
                  "AllowedValues":field.allowed_values,//No i18n
                  "TITLE":field.display_name,//No i18n
                  "CATEGORY":udf_field?translate("sdp.requests.fieldFormRules.scriptpopup.additionalFields"):translate("sdp.requests.fieldFormRules.scriptpopup.systemFields"),//No i18n
                  "VALUE":id,//No i18n
                  "TYPE":altered_type,//No i18n
                  "isUDF":field.udfif!=undefined,//No i18n
              }
          });
          initFAFR();
        };

        var initFAFR = function() {
          var self= $se.ffr;
          $se.isCreateOperation = form.mode === "new" ? true : false; //No I18N
          $se.resourcesObj = jQuery(document);
          $se.formObject = jQuery("#" + self.form.container);
          $se.module = self.form.module;
          $se.rules = self.rulesObj;
          $se.fieldsJson = self.fieldsObj;
          
          /** removes special characters from field details object */
          $se.removeSpecialCharFromFields();
          $se.resources = self.resourceObj;
          $se.fieldsJson = fieldDetailsFunction($se.fieldsJson);

          /** Adding the rules to Form */
          $se.onDetailPage = false;
          $se.isInlineView = true;
          $se.isFormComponent = true;
          $se.form = self.form;
          self.inbuild_roles=self.form && self.form.options && self.form.options.ffr.inbuild_roles;
          if(skipRules!=true){
            $se.addRulesToForm(false);  
          }
        }
        this.form=form;
        if(!this.didFetchRules) {
          this.getFAFR(setFAFR);
        } else {
          setFAFR();
        }
        return $se.rules;
      }

    },
    page_scripts:{
        handleformFunction: function(form,functionName,params){
            form=$se.page_scripts.getForm(form)
           return form?form[functionName](...params):"";
       },
   
       getForm: function(form){
        try{
            /*Adding try catch to handle special case
            Ex:$CS.findElement(true)
            $CS.findElement({});
            ..etc
            */
           let form_id=$CS.findElement(form).attr("data-formid");
           return FC_Mapper[form_id]?FC_Mapper[form_id]:undefined
        }
        catch(e){}
       },
          mapping:{"rdp_page":"ps_request_details","all_page":"CustomScripts","rlv_page":"ps_request_listview"},//no i18n
          fieldsObj:{
                            "LOGGEDIN_USERID":{"TYPE":"number"},//no i18n
                            "LOGINNAME":{"TYPE":"text"},//no i18n
                            "ROLES":{"TYPE":"multiselect"},//no i18n
                            "USERNAME":{"TYPE":"text"}//no i18n
                          },
          getValue:function(fieldId){
            fieldId=$CS.getNewUDFName(fieldId);
            var field_data=$req.prop.fafrKeyMapping[fieldId];
            if(field_data){
                if(["date","datetime"].indexOf(field_data.type)!=-1 && field_data.value){
                    return new Date(field_data.value);
                }
                if(fieldId=="EMAILCC"){
                    if(field_data.value){
                        return field_data.value.join(",");
                    }
                    return "";
                }
                if(typeof field_data.value === 'object'){
                    return field_data.value.map(item => item.id);
                }
                return field_data.value;
            }
            if(fieldId=="SUBJECT"){
               return $req.details.request_info.subject;
            }
            if(fieldId=="EMAILCC"){ // if data is not in api then it will be empty so returning empty string instead of undefined
                return "";
            }
            if(this.module_id=="rdp_page" && $req.details.request_info.hasOwnProperty(fieldId)){
                return $req.details.request_info[fieldId];
            }
          },
          getFieldType:function(fieldId){
            fieldId=$CS.getNewUDFName(fieldId);
                if(fieldId=="EMAILCC"){
                    return "text";//no i18n
                }
                if($se.page_scripts.module_id=="rdp_page" &&  $req.prop.fafrKeyMapping[fieldId]){
                    return $req.prop.fafrKeyMapping[fieldId].type;
                }
                if($se.page_scripts.fieldsObj[fieldId]){
                    return $se.page_scripts.fieldsObj[fieldId].TYPE;
                }
                if(fieldId == "SUBJECT"){
                    return "text";//no i18n
                }
                if(fieldId.indexOf("REQUESTER")!=-1){
                    return "text";//no i18n
                }
                if(fieldId.indexOf("APPROVALSTATUS")!=-1){
                    return "multiselect";//no i18n
                }
          },
          render:function(module_id){
            if(sdp_app.IS_ESMDIR){return;}
            var timestamp=parseInt(sdp_app.CLIENT_CONF.pagescript.timestamp);
            if(!timestamp){
                return;
            }
            if(typeof window[module_id]== "undefined"){
              jQuery.ajax({
                url: "/custom/scripts/"+this.mapping[module_id]+"_PORTALID_"+PORTALID+".js?"+timestamp,//no i18n
                dataType: 'script',//no i18n
                cache:true,
                converters: {
                    'text script': function(result) { //no i18n
                      if(result[0]!="<"){
                      jQuery.globalEval(result);}
                    }
                }
              }).done(function(){
                setTimeout(function(){
                    $se.page_scripts.execute(module_id);
                },100);
              });
            }else{
                setTimeout(function(){
                    $se.page_scripts.execute(module_id);
                },100)
            }
          },
          execute:function(module_id){
            var ruleArray=window[module_id];
            if(ruleArray && ruleArray.length){
                if(module_id=="rdp_page"){
                    $req.prop.resetUserDetails(true);
                }
              for(var i=0;i<ruleArray.length;i++){
                if(ruleArray[i].USERTYPE== "all_users" ||ruleArray[i].USERTYPE==sdp_user.USERTYPE){
                  this.enabled=true;//no i18n
                  this.module_id=module_id;
                  $se.executeRule(ruleArray[i]);
                  delete this.module_id;
                  this.enabled=false;
                }
              }
            }
          }
        }
};
var $se = new se.req();

window.addEventListener('error', function (evt) {//NO I18N
    if(typeof console !==undefined){
        var stack=evt.error.stack,
            isStackContainsFunction1=stack.indexOf('executeCustomScript')!==-1,
            isStackContainsFunction2=stack.indexOf('invokeAction')!==-1 || stack.indexOf('checkOnSubmitCall')!==-1,
            isStackContainFunctions=isStackContainsFunction1&& isStackContainsFunction2;

        if(isStackContainFunctions){
            var message_array=[$se.lastExecutedRule,evt.lineno-1,evt.colno,evt.message],
                message=getMessageForKey("sdp.requests.fieldFormRules.console.logs",message_array);//NO I18N

        evt.preventDefault();
    }
    }
});
function showHideSection($formSection, fieldSelector) {
    var allHidden = true;
    if(window.req_module && fieldSelector){
        var viewMode = $req.resource.resource_info.resource_view;
        if(fieldSelector === '[value="ResourceDiv"]' && (viewMode === "1")){
            //table view
            var oneHidden = false;
            var singleSection = false;
            if($formSection.find('[value=ResourceDiv]').length === 1){
                singleSection = true;
            }
            $formSection.find(fieldSelector).each(function(){
                if(!jQuery(this).hasClass('hide')){
                    allHidden = false;
                }else{
                    oneHidden = true;
                }
                //removing the fl class to avoid another iteration
                jQuery(this).removeClass("fl");
            });
            $formSection.find('[data-name="verticalSeperator"]').removeClass("hide");
            if((!allHidden && oneHidden) || singleSection){
                $formSection.find(fieldSelector).each(function(){
                    jQuery(this).addClass("fl");
                });
                $formSection.find('[data-name="verticalSeperator"]').addClass("hide");
            }
        }else{
            $formSection.find(fieldSelector).each(function(){
                if(!jQuery(this).hasClass('hide')){
                    allHidden=false;
                    return false;
                }
            });
        }
    }else{
        //we do not need below code, since by default if we display any field of resource block and it is hidden we can display it directly without checking for all field of that block.
        $formSection.find('[data-field]').each(function () {
            var fieldId = jQuery(this).attr('data-field');
            if ($CS.isVisible(fieldId)) {
                allHidden = false;
                    return false;
            }
        });
    }
    if (!allHidden) {
        $formSection.removeClass("hide");
    } else {
        $formSection.addClass("hide");
    }
}
//this method can be called to update height of all sections in the page
function fixAllSections(){
    jQuery('.seccolumn').each(function(){
        var $section=jQuery(this);
        fixSectionRowsHeight($section);
    });
}
//this method can be called to update height of an individual section such as request properties. below method will adjust any height related differences between columns of a row so both columns are aligned to each other horizontally.
function fixSectionRowsHeight($section){
        var $leftColumnRows =$section.find('.column').eq(0).find('.rows:visible'),
            $rightColumnRows =$section.find('.column').eq(1).find('.rows:visible'),
            leftRowsCnt=$leftColumnRows.length,
            rightRowsCnt=$rightColumnRows.length,
            maxRowsCnt  = (leftRowsCnt<rightRowsCnt)
                            ?leftRowsCnt
                            :rightRowsCnt;


        var labelClass=($leftColumnRows.eq(0).find('.rv-nlabel').length)?'.rv-nlabel':'.rved-label',//NO I18N
            valueClass=($leftColumnRows.eq(0).find('.rv-nvalues').length)?'.rv-nvalues':'.rved-values';//NO I18N
        for(var i=0;i<maxRowsCnt;i++){
            var $leftRow=$leftColumnRows.eq(i),
                $rightRow=$rightColumnRows.eq(i),
                leftRowLabelHeight=$leftRow.find(labelClass).outerHeight(),
                leftRowValueHeight=$leftRow.find(valueClass).outerHeight(),
                leftRowHeight=(leftRowLabelHeight>leftRowValueHeight)
                                ?leftRowLabelHeight
                                :leftRowValueHeight,

                rightRowLabelHeight=$rightRow.find(labelClass).outerHeight(),
                rightRowValueHeight=$rightRow.find(valueClass).outerHeight(),
                rightRowHeight=(rightRowLabelHeight>rightRowValueHeight)
                                ?rightRowLabelHeight
                                :rightRowValueHeight,
                maxRowHeight=(leftRowHeight>rightRowHeight)
                                ?leftRowHeight
                                :rightRowHeight;
            $leftRow.find(labelClass).parent().height(maxRowHeight);
            $rightRow.find(labelClass).parent().height(maxRowHeight);
        }
}
//this method can be called to update height of an individual section during spot edit in (details view page). below method will adjust any height related differences between columns of a row so both columns are aligned to each other horizontally.
function fixRowHeightForSpotEdit($element){
    var $row=$element.parents('.rows').eq(0);   //NO I18N
    var $section=$row.parents('.column').eq(0); //NO I18N
    var $otherSection=($section.hasClass('columnr'))     //NO I18N
                            ?$row.parents('.seccolumn').eq(0).find('.column').eq(0) //NO I18N
                            :$row.parents('.seccolumn').eq(0).find('.column').eq(1);    //NO I18N
    var index=$section.find('.rows').index($row);
    var $otherRow=$otherSection.find('.rows:eq('+index+')'),    //NO I18N
        $rowValDiv=$row.find('.rved-values').find('div:eq(0)'),     //NO I18N
        $otherRowValDiv=$otherRow.find('.rved-values').find('div:eq(0)');   //NO I18N
    if($rowValDiv.length&&$otherRowValDiv.length){
        var rowHeight=$rowValDiv.outerHeight(),
            otherRowHeight=$otherRowValDiv.outerHeight(),
            height=(rowHeight>otherRowHeight)?rowHeight+1:otherRowHeight+1;
        $rowValDiv.parents('tr').eq(0).height(height);//NO I18N
        $otherRowValDiv.parents('tr').eq(0).height(height);//NO I18N
    }
}
var $dummyRow='<div name="dummyRow" class="rows"><table width="100%" border="0" cellpadding="0" cellspacing="0"><tbody><tr style="height: 37px;"><td class="rved-label"></td><td class="rved-values"></td></tr></tbody></table></div>';

jQuery(document).ready(function(){
    fixAllSections();
});
//function SdpAjax(){
//    var response=undefined;
//}
//SdpAjax.prototype={
//    getResponseJson:function(){
//        var response=this.response,
//            type=jQuery.type(response);
//
//       if(type === 'string'){
//           return JSON.parse(response);
//       }
//       else if(type === 'object'){
//           return response;
//       }
//    },
//    getResponseText:function(){
//       var response=this.response,
//           type=jQuery.type(response);
//
//       if(type === 'string'){
//           return response;
//       }
//       else if(type === 'object'){
//           return  JSON.stringify(response);
//       }
//    },
//    init:function(url){
//        var that=this;
//        var ajaxObject={
//            type:'GET',
//            cache:false,
//            async:false,
//            url:url,
//            success:function(data){
//                that.response=data;
//            }
//        };
//        var ajaxObj=jQuery.extend({},defaultAjaxObject,ajaxObject);
//        jQuery.ajax(ajaxObj);
//    }
//};
//this method is used to refresh/reintialize select2 component once some script is executed over field without using select2 API
function refreshSelect2(fieldName){
    jQuery('#'+fieldName).select2("destroy");//No I18N
    //Getting already selected options for the field
    var displayName=$se.fieldsJson.getFieldTitle(fieldName);
    var selectedValues = jQuery("#"+fieldName+"_val").val();
    var maxSelectionCount = jQuery('#maxOptions4MultiSelect').val();
    jQuery("#"+fieldName).select2({
    placeholder: getMessageForKey('sdp.leftpanel.search.title')+" "+displayName,//No I18N
    closeOnSelect: false,
    maximumSelectionSize:maxSelectionCount,
            formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message'); }, //No I18N
        formatSelectionTooBig: function (limit) {return getMessageForKey('sdp.admin.multiselect.max.option.exceed',[maxSelectionCount])} //No I18N
    });
    jQuery("#"+fieldName).val(selectedValues);
}
//this method can be used to fix tab-index if any of the field is hidden, calling this method after the hide action will update the tab index acorrdingly
function fixTabIndexForHide($field){
    var fieldTabIndex=parseInt($field.attr('tabindex'));//NO I18N
    $field.attr('oldtabindex',fieldTabIndex);//NO I18N
    $field.removeAttr('tabindex');//NO I18N
    $field.parents('.seccolumn').eq(0).find('[tabindex]').each(function(){ //NO I18N
        var currentFieldTabIndex=jQuery(this).attr('tabindex');//NO I18N
        currentFieldTabIndex=parseInt(currentFieldTabIndex);
        if(currentFieldTabIndex>=fieldTabIndex){
            if(fieldTabIndex%2==1&&currentFieldTabIndex%2==1){
                jQuery(this).attr('tabindex',currentFieldTabIndex-2);//NO I18N
            }
            else if(fieldTabIndex%2==0&&currentFieldTabIndex%2==0){
                jQuery(this).attr('tabindex',currentFieldTabIndex-2);//NO I18N
            }
        }
    });
}
//this method can be used to fix tab-index if any of the field is made visible, calling this method after the show action will update the tab index acorrdingly
function fixTabIndexForShow($field){
    var fieldTabIndex=parseInt($field.attr('oldtabindex'));//NO I18N
    $field.parents('.seccolumn').eq(0).find('[tabindex]').each(function(){  //NO I18N
        var currentFieldTabIndex=jQuery(this).attr('tabindex');//NO I18N
        currentFieldTabIndex=parseInt(currentFieldTabIndex);
        if(currentFieldTabIndex>=fieldTabIndex){
            if(fieldTabIndex%2==1&&currentFieldTabIndex%2==1){
                jQuery(this).attr('tabindex',currentFieldTabIndex+2);//NO I18N
            }
            else if(fieldTabIndex%2==0&&currentFieldTabIndex%2==0){
                jQuery(this).attr('tabindex',currentFieldTabIndex+2);//NO I18N
            }
        }
    });
    $field.attr('tabindex',fieldTabIndex);//NO I18N
}
function indexInArrayOfObjects(objArr, ele, val){
    for(var i=0, len=objArr.length; i<len; i++){
        if(objArr[i][ele] === val){
            return i;
        }
    }
    return -1;
}
jQuery( document ).ready(function(){
    jQuery( document ).on( 'click' , '.hidden-overlay' , function(){ //NO I18N
        var disabledElementField = jQuery( this ).find( '.hidden-overlay-child' ); //NO I18N
        if( disabledElementField.attr( 'id' ) == undefined ){  //NO I18N
            disabledElementField.attr( 'id' , disabledElementField.attr( 'name' ) ); //NO I18N
        }
        showBaloonToolTip( disabledElementField.attr( 'id' ) , getMessageForKey('sdp.request.fafr.disableinfo') ); //NO I18N
        jQuery( this ).find( '#normalbubbletooltip' ).css({ 'top' : 'auto' , 'left' : 'auto'}); //NO I18N
    });
    jQuery( document ).on( 'click' , '.hidden-overlay #normalbubbletooltip_close' , function( event ){ //NO I18N
        event.stopPropagation();
    });

    /* cursur set to SUBJECT to DESCRIPTION */
    if(checkIfMSPOrSCP()) {
        setTimeout(function(){      //setting timeout as MSP Incident creation page is delayed
            moveFocusFromSubjectToDescription();
        },500);
    } else {
        // this block is always executed for SDP
        moveFocusFromSubjectToDescription();
    }
});
// code moved to separate JS method for MSP
function moveFocusFromSubjectToDescription() {
    jQuery("[data-field=SUBJECT]").on('keydown', function (e) {
        if (e.which == 9){
            setTimeout(function(){
                var element = jQuery('#ze_HTMLDesc').find('.ze_area');
                element.contents().find('.ze_body').focus();
                element[0].contentWindow.focus();
            },100);
        }
    });
}
