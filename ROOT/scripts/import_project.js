/* $Id$ */
var fileUniqueCount=1;
var files=[];
var importfailedCount =0,importsuccesCount=0,totalfilecount=0;
var msg;
var ids="";
var additonalfieldsJSON = {};

/* Import Project Code starts here */
function validateMPPForm(btn) {

    importsuccesCount=0;
    totalfilecount=files.length;
    fileUniqueCount=1;
    if(ids==""){
    var res = {};
        for (var i = 0; i < files.length; i++) {
            uploadFile(files[i],res)
            if(res.attachment_id!=undefined){
                ids +=res.attachment_id
                if((i+1<files.length)){
                    ids+=",";//No I18N
                }
                res = {};
            }else{
                ids="";break;
            }
        }
        }

  if(ids!=""){
    var div = checkForAdditionalFields(ids);
    if(div == "divEnabled")
        {
          msg = jQuery(btn).button('loading'); //No I18N
            loadAdditionalFieldJSON();
            var arr=ids.split(",");
            for (var i = 0; i <arr.length;i++){
                callAjaxToImportProject(arr[i]);
            }
            jQuery("#filedrag").show();
            jQuery("#additionalFields").hide();
            jQuery("#noAdditionalFields").hide();
            ids="";
        }
    }
}

function loadAdditionalFieldJSON()
{

    for(i=0;i<jQuery(".impfield").length;i++)
    {


        if(jQuery(".impfield").find('select').eq(i).val() != "" )
            {
                additonalfieldsJSON[jQuery(".impfield").find('select').eq(i).attr('name')] = jQuery(".impfield").find('select').eq(i).val();
            }

    }

}


function checkForAdditionalFields(ids)
{
    if(jQuery("#additionalFields").is(":visible") || jQuery("#noAdditionalFields").is(":visible")){
            return "divEnabled";    //No I18N
    }else{
      var encodedURL = '/servlet/ImportServlet?submitaction=getAdditionalFieldsFromMpp&module=Projects' //No I18N
      var input_data=sdpAjaxInputData(sdpToJSON({'entity':'project','operation':'mpp_additional_fields'})); //No I18N
      sdpAjax({
          url: encodedURL,
          type: 'POST', //No I18N
          data: {ids:ids,input_data:input_data},
          ignorefailuremessage : true,
          success : function(res){
            if(Object.keys(res).length > 0){
                additionalFieldsHeader(res);
            }else{
                jQuery("#filedrag").hide();
                jQuery("#noAdditionalFields").show();
                showalert('info',getMessageForKey('project.import.mpp.noadditional.fields.info'),'isAutoHide=true'); //No I18N
            }
          },
          error : function(res){
          if(res.status==415||res.status==500){
                showalert('failure',getMessageForKey(res.responseText),'isAutoHide=false');//No I18N
            }else{
              showFailureMessageForImport(res)
            }
          }
      });
      }
}

function additionalFieldsHeader(res)
{

        for(i=0;i<jQuery(".impfield").length;i++)
            {

            jQuery(".impfield").find('select').eq(i).find('option').remove();
            jQuery(".impfield").find('select').eq(i).append(jQuery("<option>" , {
                text: getMessageForKey("ae.networkdevice.manunfacturerName.selectVendor"),
                value: 'color:#888888'//No I18N
            }));

            for(j=0;j<Object.keys(res).length;j++)
                {

            jQuery(".impfield").find('select').eq(i).append(jQuery("<option>" , {
                text: encodeHTML(res[j]),
                value: encodeHTMLAttribute(res[j])
            }));
            }
            }

        jQuery("#filedrag").hide();
        jQuery("#additionalFields").show();
        if(jQuery("#add-field").length > 0) {
          showalert('info',getMessageForKey('project.import.mpp.add.additional.info'),'isAutoHide=false'); //No I18N
        }




}


function callAjaxToImportProject(id) {

        var input_data = {};
        input_data.attachment_id=id;
        input_data.operation = "input_file";  //No I18N
        input_data.file_format = "MPP"; //No I18N
        input_data.entity = "project";  //No I18N
        input_data.addReferEntityIfNotExists=jQuery("#addReferEntityIfNotExists").prop('checked');//No I18N

        input_data.addtionalFieldJson = additonalfieldsJSON;
        input_data =sdpToJSON(input_data);
        input_data = sdpAjaxInputData(input_data);

        sdpAjax({
          url: '/servlet/ImportServlet?submitaction=importMpp&module=Projects', //No I18N
          type: 'POST', //No I18N
          data: { input_data: input_data },
          ignorefailuremessage : true,
          success : function(res){
            zcomponent.collapsible_destroy('#importprjZC');// No I18N
            if(res.status == "success"){
          importsuccesCount = importsuccesCount+1;
        }
        totalfilecount--;
        if(totalfilecount == 0) {
          projectimporterror(importsuccesCount);
              importHistory("projects","MPP","Projects");  //No I18N
            }
          }
        });


    }

function uploadFile(file,input_data)
{
        var formData = new FormData();
        formData.append('input_file', file); //No I18N

        sdpAjax({

          url: '/api/v3/projects/upload?for=mpp_import', //No I18N
          type: 'POST', //No I18N
          data: formData,
          processData: false,
          async: false,
          contentType: false,
          ignorefailuremessage : true,
          success : function(res){
            if(res.response_status.status == "success"){
              input_data.attachment_id = res.attachment.id;
        }
        },
        error : function(res){
            showFailureMessageForImport(res)
        }

    });
}

function projectimporterror(importsuccesCount) {
    var messages=[];
    var failLine = "";
    var title = getMessageForKey("sdp.request.import.summary");
    importfailedCount = files.length - importsuccesCount; //No I18N
    files=[];
    jQuery('#impResultDisplay').empty();
    start_index = 1;
    if(importsuccesCount > 0) {
        succLine = getMessageForKey('sdp.project.import.successmsg',[importsuccesCount]); //No I18N
        messages.push({'type' : "success", 'text' : succLine}); //No I18N
    }
    if(importfailedCount > 0) {
        failLine = getMessageForKey('sdp.project.import.failuremsg',[importfailedCount]); //No I18N
        messages.push({'type' : "failure", 'text' : failLine}); //No I18N
    }
    else {
        setTimeout(function() {
            closeDialog();
        },3000);
    }
    msg.button('reset'); //No I18N
    jQuery('#import-tab-headscetion li:eq(1) a').trigger('click');
    var param = {'messages' : messages, 'title' : title};   //No I18N
    showNewDialog(param,550,210); //No I18N
    jQuery('[sdpJs="js-event-ImportProject-close"]').off('click').on('click', function(event) { closeDialog(); } ); //No I18N
}

function projectimportMPPerror() {
    var title = getMessageForKey("sdp.request.import.summary");
    var failLine = getMessageForKey('sdp.project.import.locatempp'); //No I18N
    var messages=[];
    messages.push({'type' : "failure", 'text' : failLine}); //No I18N
    var param = {'messages' : messages, 'title' : title};   //No I18N
    showNewDialog(param,550,210); //No I18N
    jQuery('[sdpJs="js-event-ImportProject-close"]').off('click').on('click', function(event) { closeDialog(); } ); //No I18N
}
function browseFile(e) {
    var eleId     = jQuery(e).attr('id');
    var filesTemp = document.getElementById(eleId).files;
    var invalidFileCount = 0;
    for (var i = 0; i < filesTemp.length; i++) {
        var f = filesTemp[i];
        if (f.name == '' || !(f.name.endsWith('.mpp') || f.name.endsWith('.mpx'))) {
            invalidFileCount++;
        } else {
            files.push(filesTemp[i]);
            f.fileUniqueCount = fileUniqueCount;
            jQuery('#filesArea').append('<div class="import-files import-files-progress">' + encodeHTML(f.name) + ' <span class="common-sprite icon-sm common-close-icon3 fr" title="Close"></span><span class=hide>'+fileUniqueCount+'</span></div>');
            fileUniqueCount = fileUniqueCount + 1;
            jQuery('.import-browser-area').hide();
            jQuery('.import-droptarget,.import-import-btn,.addRefCheck').show();
        }
    }
    if(invalidFileCount > 0){  projectimportMPPerror(); } //No I18N
    jQuery('#'+eleId).val("");
    projectorichange();
}
function showImportProjectErrors(ele) {
    jQuery(ele).siblings('div.errorfiles-list').slideToggle(500); //No I18N
    jQuery(ele).html(jQuery(ele).text() == getMessageForKey('sdp.project.import.error.show') ? getMessageForKey('sdp.project.import.error.hide') : getMessageForKey('sdp.project.import.error.show'))
       .attr('title',jQuery(ele).text() == getMessageForKey('sdp.project.import.error.hide') ? getMessageForKey('sdp.project.import.error.hide') : getMessageForKey('sdp.project.import.error.show')); //No I18N
    jQuery('.import-result .panel-collapse').scroll().getNiceScroll().resize();
}

function deleteImportProject(eleId){
    for(var i=0;i< files.length;i++){
        if(parseInt(eleId) == parseInt(files[i].fileUniqueCount)){
            files.splice(i,1);
        }
    }
}


function projectorichange() {
    if (jQuery('.import-drag-mainarea').width() <= 1240) {
        jQuery('.import-drag-mainarea .import-files').css('width', (jQuery('.import-drag-mainarea').width() - ( 40 )) / 3); //No I18N
        jQuery('.import-file').css('width', 'auto'); //No I18N
    } else {
        jQuery('.import-drag-mainarea .import-files').css('width', (jQuery('.import-drag-mainarea').width() - ( 50 )) / 4); //No I18N
        jQuery('.import-file').css('width', 'auto'); //No I18N
    }
}
