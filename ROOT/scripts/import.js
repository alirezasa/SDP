var start_index =1;

function checkRecords(tabName,fileFormat,module,parentEntity,parentEntityId,noheader,from,entityListMap,fileInfo,results){

    var entity = jQuery("#entityName").val();
    var encodeURL = encodeURIComponent('{"entity" : "'+ entity +'","file_format":"'+ fileFormat +'","list_info": {"start_index": "' + start_index + '", "row_count": "25" }}'); //NO I18N
    var importHistoryUrl='/servlet/ImportServlet?submitaction=import_history&module='+module+'&input_data='+encodeURL //No I18N
    importHistoryUrl=appendParentDetailsInImportUrl(parentEntity,parentEntityId,importHistoryUrl)
    sdpAjax({
        url:importHistoryUrl,
        dataType: 'json', //No I18N
        success: function(jsonResponse) {
            if(jsonResponse.import_history.length>0)
            {
                jQuery('#importHistory').show();
            }
        }
    });
    jQuery('#importHistory').off('click').on('click',()=>{//NO I18N
            showImportHistory(from,module,parentEntity,parentEntityId)
    });
    jQuery('#viewMoreDiv').off('click').on('click',()=>{//NO I18N
        importHistory(tabName,fileFormat,module)
    });
    jQuery('#backButton').off('click').on('click',()=>{//NO I18N
        hideImportHistory(from)
    });
    jQuery('#cancel').off('click').on('click',()=>{//NO I18N
        cancelOperation(noheader,module)
    });

    if(from=="getinput"){ //No I18N
        jQuery('#fileNameDiv').off('click').on('click',()=>{//NO I18N
            getfilename()
        });
        jQuery('#importOptionForm').off('submit').on('submit',()=>{//NO I18N
            return validateImportForm()
        });
        jQuery('#theFile').off('change').on('change',()=>{//NO I18N
            return browseFileForImport(module,parentEntity,parentEntityId)
        });

    }

    if(from=="mapfields"){
        jQuery('#previousImpPage').off('click').on('click',()=>{//NO I18N
            importURL(module,"xls/xlsx/csv",noheader,false,parentEntity,parentEntityId)//NO I18N
        });
        jQuery('#submit').off('click').on('click',()=>{//NO I18N
            return validateMappingForm(fileInfo,entityListMap,noheader)
        });
    }

    if(from=="summary"){
        jQuery('#downloadResultXls').off('click').on('click',()=>{//NO I18N
            getResults(results,module,parentEntity,parentEntityId);return false
        })
        jQuery('#finishImport').off('click').on('click',()=>{//NO I18N
            importURL(module,"xls/xlsx/csv",noheader,true,parentEntity,parentEntityId)//NO I18N
        })
    }

}


function cancelOperation(noheader,module)
{
    if(noheader!=undefined&&noheader==true){
        window.close();
    }
      var import_config = JSON.parse(sdpToJSON(global_import_config));
      var importConfig = import_config[module];
      if(importConfig!=undefined&&importConfig.cancelRedirectUrl!=undefined){
          window.open(importConfig.cancelRedirectUrl,'_parent');
      }else{
          jQuery("#sdp-tabs").find("li.active").find("a")[0].click();
      }
}

var fileType;
function showImportHistory(from,module,parentEntity,parentEntityId)
   {
    jQuery("#importHistory").hide();
    if(from=="getinput"){ //No I18N
        jQuery("#wizardcontent,#allButtons,#wizardheader").hide();
    }else if(from=="mapfields"){ //No I18N
        jQuery("#fieldMap,#mapFields").hide();
    }else if(from=="summary"){ //No I18N
        jQuery("#summarydiv").hide();
    }
    jQuery("#impWizard").hide();
    jQuery("#importresults,#backButton,#impSummary").show();
    var selectedModule = jQuery('#entity').val();
    jQuery("#entityName").val(encodeHTMLAttribute(selectedModule));
    // setting the selectedModule  in  entityName  due to viewmore div in importhistory
    importHistory(jQuery("#sdp-tabs").find("li.active").find("a").attr("id"),fileType,module,parentEntity,parentEntityId);
   }


function validateImportForm()
{
    if( file == undefined){
        showBaloonToolTip('fileName', getMessageForKey('sdp.import.locatefile'));//No I18N
        return false;
    }
    var input_data = {};
    input_data.attachment_id = jQuery("#attachment_id").val();
    input_data.operation = "input_file";    //No I18N
    input_data.entity =  jQuery('#entity').val();
    if(input_data.entity==""){
      showalert('failure', getMessageForKey("sdp.import.select.module"), 'isAutoHide=true');//NO I18N
      return false;
    }
    input_data.file_format = jQuery('#fileFormat').val();
    if(isFileFormatValid(input_data.file_format,file.name)){
          showalert('failure', getMessageForKey("sdp.import.incorrect.file.format"), 'isAutoHide=true');//NO I18N
          return false;
    }
    input_data.import_action = jQuery('#importaction').val();
    input_data.sheet_no = jQuery('#sheetno').val();

    var isSheetNoValid=jQuery.isNumeric(input_data.sheet_no) && input_data.sheet_no>0;
    if(jQuery( "#fileFormat" ).val()!="CSV" && !isSheetNoValid) {
        showalert('failure', getMessageForKey("sdp.import.minimumvalue.alert"), 'isAutoHide=true');//NO I18N
        return false;
    }

    if(!isSheetNoValid){
        jQuery("#sheetno").val(1)
        input_data.sheet_no=1
    }

    input_data.import_action=jQuery("#import_action").val()
    jQuery("#input_data").val(sdpToJSON(input_data));
    var options={};
    options.entity=input_data.entity;
    options.file_format=input_data.file_format;
    options.import_action=input_data.import_action;
    if(input_data.file_format!=="CSV"){
        if(jQuery("#sheetno option:selected").val()!=""){
            options.sheet_tab_name= jQuery("#sheetno option:selected").html();
        }
    }
    addPersonalization("import_config_"+jQuery('#module').val(),options);// NO I18N
    jQuery("#loadingDIV").html('<div data-id="cview-freeze" class="cview-freeze" style="z-index: 99;">'+ajaxBar("white")+'</div>');

}

function uploadFileForImport()
{
        jQuery(".upload-div .cap-txt").append('<span class="cspr icon-xs task-loading ml10"></span>');
        var formData = new FormData();
        if(file == undefined)
        {
            return;
        }
        formData.append('input_file', file); //No I18N

        sdpAjax({

          url: '/api/v3/'+jQuery('#upload_to').val(), //No I18N
          type: 'POST', //No I18N
          data: formData,
          processData: false,
          async: false,
          contentType: false,
          ignorefailuremessage : true,
          success : function(res){
            if(res.response_status.status == "success"){
              jQuery("#attachment_id").val(res.attachment.id);
              jQuery("#uploaded_to").val(e_attr(res.attachment.module.split("_import")[0]))
            }
          },error : function(res){
            showFailureMessageForImport(res)
            resetSheetTabNameDiv()
            jQuery("#theFile").val("");jQuery('#fileName').html("");file=undefined
          }
        });
        jQuery(".upload-div .cap-txt span").remove()
}

function browseFileForImport(module,parentEntity,parentEntityId) {
    var eleId = jQuery("#theFile").attr('id');
    file = document.getElementById(eleId).files[0];
    jQuery('#fileName').html(encodeHTML(file.name));
    uploadFileForImport();
    if(jQuery('#fileFormat').val()!=="CSV"){
        setSheetTabNamesAsOptions(module,parentEntity,parentEntityId);
    }
}

var file;
var mandateFields = [];
function importFile(fileInfo,noheader,parentEntity,parentEntityId){
     var encodeURL = sdpAjaxInputData(sdpToJSON(fileInfo));
     var url="/servlet/ImportServlet?submitaction=import&module="+fileInfo.module, //No I18N
     url=appendParentDetailsInImportUrl(parentEntity,parentEntityId,url)
     sdpAjax({
          url: url,
          type: 'POST', //No I18N
          data: { input_data: encodeURL },
          ignorefailuremessage : true,
          success : function(res){
            function callbackmodule(fileInfo) {
                if(fileInfo.module == "UdfOptions") {/** UDF option call back to render options in parent window **/
                    parent.opener.$udfcommon.$udfform.importfromservlet();
                }
            }
            var messages=[];
            var importStatus = res[fileInfo.entity].status;
            var status = "",showImportHistory=false;
            if(importStatus == "success") {
                messages.push({'type' : "success", 'text' : getMessageForKey("sdp.request.import.success")});showImportHistory=true;
                callbackmodule(fileInfo);
            }else if(importStatus == "failure") {//No I18N
                messages.push({'type' : "failure", 'text' : getMessageForKey("sdp.import.failedmsg")});showImportHistory=true;
            }else if(importStatus=='partial_success'){//No I18N
                callbackmodule(fileInfo);
                messages.push({'type' : "failure", 'text' : getMessageForKey("sdp.import.partialimport")});showImportHistory=true;
            }else if(importStatus=="validation_failure"){//No I18N
                var importMsg=res[fileInfo.entity].message;
                var msgKey="sdp.admin.ad.sso.mandatory";//NO I18N
                if(importMsg=="non importable fields present"){
                    msgKey="sdp.admin.action.fupdate.invalidfields";//NO I18N
                }else if(importMsg=="Invalid Url"){//NO I18N
                    msgKey="sdp.api.error.url.invalid";//NO I18N
                }
                jQuery("#loadingDIV").html("");
                showalert('failure', getMessageForKey(msgKey) , 'isAutoHide=false');//NO I18N
            }else{
                showalert('failure', getMessageForKey("sdp.import.invalid.file") , 'isAutoHide=false');//NO I18N
            }
            if(showImportHistory){
                var summaryUrl="/servlet/ImportServlet?entity="+fileInfo.entity+"&module="+fileInfo.module+"&submitaction=import_summary"; //NO I18N
            	if(noheader!=undefined&&noheader==true){
            	    summaryUrl+="&noheader="+noheader;  //NO I18N
            	}
            	summaryUrl=appendParentDetailsInImportUrl(parentEntity,parentEntityId,summaryUrl);
                window.open(summaryUrl,'_parent');
            }
            else{jQuery("#loadingDIV").html("");}
          },error : function(res){
            showFailureMessageForImport(res)
          }
     })
}

function getMandateFields(){
	var mandateFields=['vendor_name','vendor_currency'];//NO I18N
	if(jQuery("#checkBoxProduct").prop('checked')){
		mandateFields.push('product_vendor_association_product');//NO I18N
		mandateFields.push('product_vendor_association_product_price');//NO I18N
	}
	if(jQuery("#checkBoxService").prop('checked')){
		mandateFields.push('vendor_service_association_vendor_service');//NO I18N
		mandateFields.push('vendor_service_association_service_price');//NO I18N
	}
	return mandateFields
}

function validateMappingForm(fileInfo,entityList,noheader)
{
	if(fileInfo.module=='Vendors'){// for vendors module to get the required mandatory fields and to check if the we are importing both product and service in the same import
		mandateFields=getMandateFields();
	}
	if(fileInfo.module=='Solutions' && jQuery("#topic_default_value").val() == ""){
        showalert('failure', translate("solution.import.default.topic.mandatory.alert") , 'isAutoHide=false');//NO I18N
        return false;
    }
    
    if(!mandatoryCheck(mandateFields)){
        return false;
    }
    var mappedData = {};

    for(var i=0;i<entityList.length;i++){
        var mappedEntityData={},entityUDFFields={}, entityName = entityList[i];
        if(entityName == "user" || entityName == "orguser"){
                     var categories = [entityName+"personalDetails",entityName+"contactInfo",entityName+"departmentDetails",entityName+"selfservice"]; //NO I18N
                     for(var j=0;j<categories.length;j++){
                         jQuery("#"+categories[j]).find("select").each(function(index,el){
                             if(el.value != ""){
                                 if(el.name == "udfFields"){entityUDFFields[el.id]=el.value }
                                 else{ mappedEntityData[el.id]=el.value }
                             }
                         });
                     }
                 }
        jQuery("#"+entityName).find("select").each(function(index,el){
            if(el.value != ""){
                if(el.name == "udfFields"){entityUDFFields[el.id]=el.value }
                else{ mappedEntityData[el.id]=el.value }
            }
        });
        if(Object.keys(entityUDFFields).length  > 0){
            mappedEntityData.udf_fields = entityUDFFields
        }
        if (entityName.startsWith('dyna_')) {
            entityName = entityName.substring(5);
        }
        mappedData[entityName]=mappedEntityData
        if(entityName == "solution"){
            mappedEntityDefaultData = setSolutionDefaultValuesToInputObject();
            mappedData[entityList[i]+"_default_values"]=mappedEntityDefaultData;
        }
    }

    var otherSelectables=[];
    otherSelectables.push("dateFieldsDiv");
    otherSelectables.push("subEntiyFieldsDiv");
    for(var i=0;i<otherSelectables.length;i++){
        jQuery("#"+otherSelectables[i]).find("select").each(function(index,el){
        if(el.value != ""){
                mappedData[el.id]=el.value
        }
    });
    }
    fileInfo.mappings = mappedData;
    fileInfo.addReferEntityIfNotExists=jQuery("#addReferEntityIfNotExists").prop('checked');// No I18N
    fileInfo.associateAssetToUserSite=jQuery("#associateAssetToUserSite").prop('checked');// No I18N
    fileInfo.checkBoxProduct=jQuery("#checkBoxProduct").prop('checked');// No I18N
    fileInfo.checkBoxService=jQuery("#checkBoxService").prop('checked');// No I18N
    addPersonalization("import_mapping_"+fileInfo.entity,fileInfo);// NO I18N
    importFile(fileInfo,noheader,jQuery("#parentEntity").val(),jQuery("#parentEntityId").val());
    jQuery("#loadingDIV").html('<div data-id="cview-freeze" class="cview-freeze" style="z-index: 99;">'+ajaxBar("white")+'</div>');
}

function mandatoryCheck(mandateFields){
  var arrayLength = mandateFields.length;
  for (var i = 0; i < arrayLength; i++) {
    var string=mandateFields[i];
    if(jQuery("select[name='"+string+"']").val()==""){
      showalert('failure', getMessageForKey("sdp.admin.ad.sso.mandatory") , 'isAutoHide=false');//NO I18N
      return false;
    }
  }
  return true;
}

function setPersonalizedFieldMapping(entityName,entityList){
    var personalizeData=getPersonalizeData("import_mapping_"+entityName)// NO I18N
    if(Object.keys(personalizeData).length!=0) {
        var mappingData=personalizeData.mappings;
        for(var i=0;i<entityList.length; i++){
            jQuery("#"+entityList[i]).find("select").each(function(index,el){
        var data;
        try{
            if(el.name == "udfFields"){
                    if(mappingData[entityList[i]]!=undefined){
                        data=mappingData[entityList[i]].udf_fields[el.id];
                    }else{
                data=mappingData.udf_fields[el.id];
                    }
                }else{
                    if(mappingData[entityList[i]]!=undefined){
                        data=mappingData[entityList[i]][el.id];
            }else{
                data=mappingData[el.id];
            }
        }
            }catch(err) {
            	
            }
            if(data==undefined){
                jQuery('tbody#'+entityList[i]+' select#'+el.id+' option').removeAttr('selected')// No I18N
            }else{
                jQuery('tbody#'+entityList[i]+' select#'+el.id+' option[value="'+data+'"]').attr('selected','selected')
            }
            });
        }

        var otherSelectables=[];
        otherSelectables.push("dateFieldsDiv");
        otherSelectables.push("subEntiyFieldsDiv");
        for(var i=0;i<otherSelectables.length;i++){
            jQuery("#"+otherSelectables[i]).find("select").each(function(index,el){
               var data;
               try{
                data=mappingData[el.id];
               }catch(err) {

        }
        if(data==undefined){
                jQuery('#'+otherSelectables[i]+' select#'+el.id+' option').removeAttr('selected')// No I18N
        }else{
                jQuery('#'+otherSelectables[i]+' select#'+el.id+' option[value="'+data+'"]').attr('selected','selected')
        }
        });
       }
        jQuery("#addReferEntityIfNotExists").prop('checked',personalizeData.addReferEntityIfNotExists);// No I18N
        jQuery(".impfield select").select2({});
    }
}

function setPersonalizedImportOption(module){
    var personalizeData=getPersonalizeData("import_config_"+module)// NO I18N
    jQuery('#entity option[value="'+personalizeData.entity+'"]').attr('selected','selected');
    jQuery('#fileFormat option[value="'+personalizeData.file_format+'"]').attr('selected','selected');
    jQuery('#import_action option[value="'+personalizeData.import_action+'"]').attr('selected','selected');
    if(jQuery('#import_action > option').length==1){jQuery('#importActionDiv').addClass('hide')}
    if(jQuery('#fileFormat').val()!=="CSV"){
        jQuery('#sheet_tab_name').val(personalizeData.sheet_tab_name)
    }
}


function importURL(module,file_type,noheader,cancel,parentEntity,parentEntityId) {
    if(cancel){
        window.close();
    }
    if(module != undefined && module == "UdfOptions"){  // No I18N
        history.back();
    }
	if(file_type=='mpp') {
        if(isMSP && module=='Projects' && getAccountId()==0 && sdp_user.USERTYPE != "Requester"){
            alert(getMessageForKey("sdp.admin.requesterImportWiz.selectAccountErrMsg"));//No I18N
            return;
        }
	    window.open("/servlet/ImportServlet?submitaction=loadImportTab&module="+module+"&file_type="+file_type,'_parent');
	}
	else {
	var url="/servlet/ImportServlet?submitaction=loadImportTab&module="+module ;//NO I18N
	if(noheader!=undefined&&noheader==true){
	        url+="&noheader="+noheader; //NO I18N
	}
	url=appendParentDetailsInImportUrl(parentEntity,parentEntityId,url)
	    window.open(url,'_parent');
    }
}

function appendParentDetailsInImportUrl(parentEntity,parentEntityId,url){
    if( parentEntity!=""&&parentEntity!=undefined&&parentEntityId!=""&&parentEntityId!=undefined){
        url=url+"&parentEntity="+encodeURIComponent(parentEntity)+"&parentEntityId="+encodeURIComponent(parentEntityId);// No I18N
    }
    return url;
   }
function enableProductAssociationFields(checkBoxProduct){
	jQuery("#product [name=product_all_product_type],#product [name=product_name],#product_vendor_association [name=product_vendor_association_product_price],#product_vendor_association [name=product_vendor_association_product],#product_vendor_association [name=maintenance_vendor],#product_vendor_association [name=comments],#product_vendor_association [name=tax_rate],#product_vendor_association [name=warranty_period_years],#product_vendor_association [name=warranty_period_months]").prop("disabled", !checkBoxProduct.checked);// No I18N
}

function enableServiceFields(checkBoxService){
	jQuery("#vendor_service [name=vendor_service_name],#vendor_service_association [name=vendor_service_association_service_price],#vendor_service_association [name=comments],#vendor_service_association [name=support_vendor],#vendor_service_association [name=tax_rate],#vendor_service_association [name=service_period_months],#vendor_service_association [name=service_period_years],#vendor_service [name=gl_code],#vendor_service [name=vendor_service_type],#vendor_service [name=part_no]").prop("disabled", !checkBoxService.checked);// No I18N
}

function setSampleFileUrl(module,parentEntity,parentEntityId){
    var href="/servlet/ImportServlet?submitaction=SampleXLSFile&module="+encodeURIComponent(module) ; // No I18N
    href=appendParentDetailsInImportUrl(parentEntity,parentEntityId,href)
    if(jQuery("#entity").val()!=undefined&&jQuery("#entity").val()!=''){
        href+="&entity="+encodeURIComponent(jQuery("#entity").val())// No I18N
    }
    var sample_file="<a class=\"text-link\" href="+href+" rel=\"noopener noreferrer\">"+translate("sdp.import.samplefile")+"</a>";
    jQuery("#sampleXLS").html(translate("sdp.import.samplefiledownload",[sample_file]))
}

function setImportInputFields(module,parentEntity,parentEntityId){

setSampleFileUrl(module,parentEntity,parentEntityId);
jQuery( "#fileFormat" ).change(function() {
    if(this.value == "CSV"){
        if(!(jQuery.isNumeric(jQuery("#sheetno").val()) && jQuery("#sheetno").val()>0)){
            jQuery("#sheetno").val(1)
        }
        jQuery("#sheetNoDiv").hide()
    }else if(jQuery("#theFile").val()!=''){
                setSheetTabNamesAsOptions(module,parentEntity,parentEntityId);
        }

});

jQuery("#entity").off("change").on("change",function(){//No I18N
    setSampleFileUrl(module,parentEntity,parentEntityId);
});
}

function setSheetTabNamesAsOptions(module,parentEntity,parentEntityId){
if(!isFileFormatValid(jQuery( "#fileFormat" ).val(),file.name)){
    var url='/servlet/ImportServlet?submitaction=getSheetDetails&module='+module+'&attachment_id='+jQuery("#attachment_id").val() // No I18N
    url=appendParentDetailsInImportUrl(parentEntity,parentEntityId,url)
    url=url+'&entity='+encodeURIComponent(jQuery("#uploaded_to").val());
    sdpAjax({
        url: url,
        dataType: 'json', //No I18N
        success: function(jsonResponse) {
            var sheetDetails=jsonResponse.sheetDetails
            jQuery("#sheetno").html("")
            jQuery("#sheetno").append(jQuery("<option>",{value:"",text:getMessageForKey("ae.networkdevice.manunfacturerName.selectVendor")}))// No I18N
            jQuery.each(sheetDetails, function(index, jsonObject) {
                jQuery("#sheetno").append(jQuery("<option>",{value:parseInt(index)+1,text:jsonObject}));//No I18N
            });
            var sheetNoVal=jQuery('#sheetno option').filter(function () { return jQuery(this).html() == jQuery("#sheet_tab_name").val(); }).val();
            if (sheetNoVal==undefined&&Object.keys(sheetDetails).length==1){sheetNoVal=1}
            jQuery('#sheetno option[value="'+sheetNoVal+'"]').attr('selected','selected');
            jQuery("#sheetno").select2({});
            jQuery("#sheetNoDiv").show();
            jQuery(".task-loading").remove();

        },
        error : function(res){
            resetSheetTabNameDiv()
        }
    });

    }else{
        jQuery("#sheetNoDiv").hide();
        jQuery("#sheetno").html("")
        jQuery("#sheetno").append(jQuery("<option>",{value:"",text:getMessageForKey("ae.networkdevice.manunfacturerName.selectVendor")}))// No I18N
    }
}
function resetSheetTabNameDiv(){
    jQuery("#sheetNoDiv").hide();
    jQuery("#sheetno").html("")
    jQuery("#sheetno").append(jQuery("<option>",{value:"",text:getMessageForKey("ae.networkdevice.manunfacturerName.selectVendor")}))// No I18N
    jQuery("#sheetno").select2({});
    jQuery("#attachment_id").val("")
}
function isFileFormatValid(file_format,filename){
    var re = /(?:\.([^.]+))?$/;
    var ext =re.exec(filename)[1];
    var upper =ext.toUpperCase();
    if(file_format!=upper){
        return true;
    }
    return false;
    }

function showFailureMessageForImport(res){
        var message =  getMessageForKey("sdp.vulnerability.error.unknownexception.msg");
        if(res.responseJSON != null && res.responseJSON.response_status!=null){
            if(res.responseJSON.response_status.messages[0]!=null&&res.responseJSON.response_status.messages[0].message != null){
                message = res.responseJSON.response_status.messages[0].message;
            }
        }
        showalert('failure', encodeHTML(message), 'isAutoHide=false');//NO I18N
}

/* This function is used to construct select2 div for import solution default values */
function setSolutionDefaultValues(entityList){
    var unApprovedId = "";
    var approvalStatusArray = [];
    var statusMap = new Map();
    statusMap.set("Approved", "sdp.common.status.approved");    // No I18N
    statusMap.set("UnApproved", "sdp.solution.status.unapproved");  // No I18N
    statusMap.set("Approval Pending", "sdp.solution.status.approvalpending");   // No I18N
    statusMap.set("Rejected", "sdp.purchase.status.rejected");  // No I18N
    var statusListInfo = { list_info:{start_index: 1, sort_field: "name",row_count: 4, "search_criteria":{"field":"name","values":["Expired"],"condition":"is not"}}};  // No I18N
    if(sdp_user.ROLES.indexOf("SolutionsApprove") == -1){
        statusListInfo.list_info.search_criteria.values.push("Approved");
        statusListInfo.list_info.search_criteria.values.push("Rejected");
    }
    sdpAjax({
        url: '/api/v3/solutions/approval_status', //No I18N
        type: 'GET', //No I18N
        data: sdpAjaxInputData(statusListInfo),
        async: false,
        success : function(res){
            var result = res.approval_status;
            const resultLength =  result.length;
            for(i = 0;i<resultLength;i++){
                approvalStatusArray.push({"id":result[i].id, "text": translate(statusMap.get(result[i].name))});
                if(result[i].name == "UnApproved"){
                    unApprovedId = result[i].id;
                }
            }
        },
    });
    for(var i=0;i<entityList.length;i++){
        jQuery("#"+entityList[i]).find("select").each(function(index,el){
            if(jQuery("#"+el.id+"_default_value").length > 0 && el.id != "created_time" && el.id != "last_updated_time" && el.id != "is_public" && el.id != "approval_status"){
                var url = [{
                    url : "/api/v3"+jQuery("#"+el.id+"_default_value").data().href,     // No I18N
                    field : el.id
                }];
                var options = {
                    "url" : url,    // No I18N
                    "width" : 200,  // No I18N
                    "allowClear" : true // No I18N
                };
                if(el.id == "last_updated_by" || el.id == "created_by"){
                    options.value = { id: sdpheader_data.user_details.LOGGEDIN_USERID, text: sdpheader_data.user_details.USERNAME};
                    options.list_info = {"fields_required":["id", "name"]};     // No I18N
                }
                else if(el.id == "owner" || el.id == "user_group_mapping"){
                    options.multiple = true;
                }
                if(isMSP && (el.id == "associated_accounts" || el.id == "associated_account_groups")){
                    options.multiple = true;
                }
               jQuery("#"+el.id+"_default_value").sdp_select2(options);
            }
        });
    }
    var isPublicOptions = {
        data : [{ id: true, text: translate('common.yes')}, { id: false, text: translate('common.no')}]
    }
    jQuery("#is_public_default_value").select2(isPublicOptions);
    jQuery("#is_public_default_value").select2("data",{ id: false, text: translate('common.no')});  //NO I18N

    var approvalStatusOptions = {
        data : approvalStatusArray,
        allowClear : false
    }
    jQuery("#approval_status_default_value").select2(approvalStatusOptions);
    jQuery("#approval_status_default_value").select2("data",{ id: unApprovedId, text: translate('sdp.solution.status.unapproved')});  //NO I18N
}

/* Set a defaults values for server side handling */
function setSolutionDefaultValuesToInputObject() {
    var mappedEntityDefaultData = {};
    var solDefaultFieldsArray = ["topic", "owner", "last_updated_by", "created_by", "approval_status", "user_group_mapping", "created_time", "last_updated_time", "is_public"]; //No I18N
    if(isMSP){
        solDefaultFieldsArray.push("associated_accounts");
        solDefaultFieldsArray.push("associated_account_groups");
    }
    for(i =0 ; i<solDefaultFieldsArray.length;i++){
        var fieldValue = jQuery("#"+solDefaultFieldsArray[i]+"_default_value").val();
        if(fieldValue != undefined && fieldValue != ""){
            mappedEntityDefaultData[solDefaultFieldsArray[i]]=fieldValue;
        }
    }
    return mappedEntityDefaultData;
}

/* This function is used to set a date limit when calendar component initialization */
function setDateLimit (){
    var currentTime = new Date().getTime();
    var offSet = getTimezoneDifference(currentTime);
    currentTime = currentTime + offSet;
    var currentDate = new Date(currentTime);
    var options = { "maxDate": currentDate, "maxTime": currentDate }; //No I18N
    return options;
}

/* This function is used to check created and last updated time combination */
function checkAndValidateDateField (id) {
    const createdTimeDefaultValue = jQuery("#created_time_default_value").val();
    const lastUpdatedTimeDefaultValue = jQuery("#last_updated_time_default_value").val();
    if(id == "lut"){
        if(createdTimeDefaultValue != '' && createdTimeDefaultValue > lastUpdatedTimeDefaultValue){
            alert(translate('solution.import.alert.last_updated_time'));
            return false;
        }
    }
    else if(id == "ct"){
        if(lastUpdatedTimeDefaultValue != '' && createdTimeDefaultValue > lastUpdatedTimeDefaultValue){
            alert(translate('solution.import.alert.created_time'));
            return false;
        }
    }
}

function setModulesToImportForAsset(){
    let api_name = getUrlParameterByName("entity"); //No I18N
    if(!api_name){
        api_name = jQuery('#entity').val();
    }
    hierarchySelect2.init({
      id : "dynamicEntity",       //No I18N
      return_value : "api_name",    //No I18N
      entity : "module",      //No I18N
      url : "/api/v3/asset_assets/module",     //No I18N
      placeHolder : "select",       //No I18N
      displayField : "display_name",        //No I18N
      list_info : {"search_criteria":{"field":"internal_name","value":"Asset","condition":"is not","logical_operator":"AND"}}, //No I18N
      selectedValueByApiName: api_name ? {"name":api_name} : null, //No I18N
      events: {change: function (e) {
        jQuery('#upload_to').val(e_attr(e.added.api_plural_name)+"/_upload?for=import"); //No I18N
        jQuery("#entity").val(jQuery("#dynamicEntity").select2("data").name); //NO I18N
        if(file != null){
            jQuery("#theFile").val("");jQuery('#fileName').html("");file=undefined;
        }
        jQuery("#sheetNoDiv").hide();
      }}
     }
    ).then((response) => {
       if(response && response.data && response.data.length == 1){
           var moduleInfo = response.data[0];
           jQuery('#upload_to').val(moduleInfo.api_plural_name+"/_upload?for=import"); //No I18N
           jQuery('#entity').val(moduleInfo.name); //No I18N
       }else{
           jQuery('#upload_to').val(e_attr(jQuery("#dynamicEntity").select2("data").api_plural_name)+"/_upload?for=import"); //No I18N
           jQuery("#entity").val(jQuery("#dynamicEntity").select2("data").name); //NO I18N
       }
    });
}
function setModulesToImportForCMDB(){
    let api_name = getUrlParameterByName("entity"); //No I18N
    if(!api_name && api_name != null){
        api_name = jQuery('#entity').val();
    }
    hierarchySelect2.init({
      id : "dynamicEntity",       //No I18N
      return_value : "name",    //No I18N
      entity : "module",      //No I18N
      url : "/api/v3/cmdb/module",     //No I18N
      placeHolder : "select",       //No I18N
      displayField : "display_name",        //No I18N
      selectedValueByApiName: api_name ? {"name":api_name} : null, //No I18N
      list_info : {
        search_criteria:{
            field:"name",   //No I18N
            value:"cmdb",   //No I18N
            condition:"is not", //No I18N
            logical_operator:"and"  //No I18N
        },
        fields_required : ["parent","name","api_plural_name","display_name"],   //No I18N
        start_index : 1,
        row_count : 100,
        sort_field : "display_name",  //No I18N
        sort_order : "asc"  //No I18N
        },
      events: {change: function (e) {
        jQuery('#upload_to').val(e.added.api_plural_name+"/_upload?for=import") //No I18N
        jQuery("#entity").val(jQuery("#dynamicEntity").select2("data").name);           //No I18N
        if(file != null){
            jQuery("#theFile").val("");jQuery('#fileName').html("");file=undefined;
        }
        jQuery("#sheetNoDiv").hide();
      }}
     }
    ).then(function(){
        jQuery('#upload_to').val(jQuery("#dynamicEntity").select2("data").api_plural_name+"/_upload?for=import") //No I18N
        jQuery("#entity").val(jQuery("#dynamicEntity").select2("data").name);           //No I18N
    });
}

function setModulesToImport(module){
    jQuery(".impfield select").select2({
        minimumResultsForSearch: -1
    });
    var import_config = JSON.parse(sdpToJSON(global_import_config));
    var importConfig = import_config[module];
    if(importConfig!=undefined&&importConfig.modulesToImportCallBackFn!=undefined){
        execFuncByName(importConfig.modulesToImportCallBackFn, window)
        jQuery("#dynamicEntity").removeClass("hide");
        jQuery("#entity").addClass("hide")
    }
}

var global_import_config = {
	"Vendors":{//NO I18N
    "cancelRedirectUrl": "/app#/admin/modules/vendor"//NO I18N
	},
    "cmdb":{   //NO I18N
         "cancelRedirectUrl":"/BusinessView.do?operation=openBusinessView", //NO I18N
         "modulesToImportCallBackFn" : "setModulesToImportForCMDB"//NO I18N
    },
    "asset_asset":{
        "modulesToImportCallBackFn" : "setModulesToImportForAsset"//NO I18N
    },
    "association_ci_relationship":{ //NO I18N
        "cancelRedirectUrl":"/BusinessView.do?operation=openBusinessView" //NO I18N
    }
};
