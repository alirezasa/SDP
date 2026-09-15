

function resetToDefaultPath(defaultPath)
{
	 document.attachmentSettingsForm.attachmentPath.value = defaultPath;
}


function checkIfAttachPathAccessible(path)
{
	var isOk = false;
	var url = "/servlet/AJaxServlet"; // No I18N
	sdpAjax({
		async : false,
		url : url,
		type : 'post',//NO I18N
		data : {action:'check_if_attachment_path_exists', attchPath:path},//NO I18N
		success : function(resp)
		{
			isOk = resp.status;
			isValidPath = resp.isValidPath;
		}
	})
	if(!isValidPath)
	{
		alert(translate("sdp.settings.filePath.invalid"));// No i18n
		jQuery("#attachmentPath").addClass('is-invalid');
		document.getElementById("attachmentPath").focus();
	}
	else if(!isOk)
	{
		alert(translate("sdp.settings.filePathExists.error.msg"));// No i18n
	}

	var flAttachExists = isValidPath && isOk;

	return flAttachExists;
}

var attachmentSettings = {
		attachemntLoadTimePath: "",
		oldAllFiles : "",
		init : function(){
			sdpAjax({
				url: "/api/v3/attachment_settings/1", //NO I18N
				type: "GET", //NO I18N
				success: function(data) {
					attachmentSettings.oldAllFiles = (data.attachment_settings.filter_type == 'All Files') ? true : false;//NO I18N
					
					var attachmentPath = data.attachment_settings.attachment_path;
					

					if(attachmentPath == "FileAttachments" || attachmentPath.trim() == "")
					{
						data.attachment_settings.attachment_path = data.attachment_settings.default_path;
					}
					attachmentSettings.attachemntLoadTimePath = data.attachment_settings.attachment_path;
					renderhbs('#attachmentSettingsContainer','attachmentSettings', data.attachment_settings , false, 'admin', "", "", function(){// NO I18N
						if(sdpheader_data.security_banner && sdpheader_data.security_banner.length != 0 && sdpheader_data.security_banner[0].attachmentPathError) {
							showBubbleTip( jQuery("#attachmentPath") ,translate('admin.ssp.attachmentsettings.storagepath.warning',["<a  data-action='attachmentPathError' href='/'  class='text-link sb'>"+translate('sdp.common.clickhere') +"</a>"] ) ,'focusOutHide =false,isAutoHide=false,closebutton=false' );  // No I18N
					        setTimeout(function () {jQuery('[data-action="attachmentPathError"]').click(function(){attachmentSettings.resetAttachsecurityfn();});}, 1500);	//No I18N
						}
					});
					//Adding event here instead of inline to avoid '\' issue in windows setup 
					jQuery('button[name=resetPath]')[0].onclick=function(){
						resetToDefaultPath(data.attachment_settings.default_path);
					};
					
					jQuery('#AttachmentSettingsInclude, #AttachmentSettingsExclude').sdp_select2({
						multiple: true,
						placeholder: translate("file.restrictions.select.extensions"),//NO I18N
						allowClear: true,
						cache: {},
						url: [{
							url: "/api/v3/attachment_settings/extensions",//NO I18N
							list_info: {start_index: 1, row_count: 25},
							field:'extensions'//NO I18N
						}],
						closeOnSelect: false
					});

					var JB = jQuery('body');

					  jQuery('[data-id=AttachmentSettings]').on("select2-opening",function()
						{
    						if(JB.find(".select2-drop.select2-drop-active a[data-addtopic]").length==0)
							{
	      						setTimeout(function()
								{
							        if(JB.find(".select2-drop.select2-drop-active .select2-filter-option").length >= 1)
									{
							          JB.find(".select2-drop.select2-drop-active .select2-filter-option").remove()
							        }
							        JB.find(".select2-drop.select2-drop-active").append(jQuery("#addTopicSelect2").html());
	      						},10);
    						}
  						});
			        jQuery('[data-id="addNewExtensionPopup"]').off('click').on('click', function(event) {  event.preventDefault();  attachmentSettings.initUploadExtensionPopUp();  } );//No I18N
					attachmentSettings.updateExtensions(data.attachment_settings.extensions,data.attachment_settings.filter_type);
					
					let modeButtons = document.getElementsByName("FileValidationApproach");
					if(data.attachment_settings.mode === "STRICT")
					{
						modeButtons[0].checked = true;
					}
					else{
						modeButtons[1].checked = true;;
					}
				}
			});
		},
		resetAttachsecurityfn: function() {
			sdpAjax({
				url: "/api/v3/attachment_settings/update_storage_flag",  // No I18N
				type: "PUT",  // No I18N
				success: function(data) {
					if(data.response_status.status == "success") {
						window.location.reload();
					}
				}
			});
		},
		updateAttachmentSettings : function(e){

			if( !checkIfAttachPathAccessible(document.attachmentSettingsForm.attachmentPath.value) )
			{
				return false;
			}
			
			var extensionsArray = [];
			
			if( jQuery('#fileFilterAll').prop('checked') == false )
			{
				var extensionListId = jQuery('#fileFilterExc').prop('checked') ? '#AttachmentSettingsExclude' : '#AttachmentSettingsInclude';//NO I18N

				if( jQuery(extensionListId).select2('data').length == 0 )
				{
					showalert("failure", translate("file.restrictions.select.extensions"), "isAutoHide=false");//NO I18N
					return false;
				}
				
				var selectedExtensions = jQuery(extensionListId).select2('data');//NO I18N

				for( var i = 0 ; i < selectedExtensions.length ; i ++ )
				{
					extensionsArray[i] = selectedExtensions[i].text;
				}
			}

			var input = { 'attachment_path' : jQuery('#attachmentPath').val() , 'attachment_size' : jQuery('[name=attachmentSize]').val()  };//NO I18N

			if( !(input.attachment_size > 0 &&  input.attachment_size < 1025) )
			{
				showalert("failure", translate("api.invalid.input",[translate("sdp.admin.settings.attachmentSize"),input['attachment_size']]), "isAutoHide=false");//NO I18N
				return false;				
			}

			input['filter_type'] = jQuery('[name=fileFilterType]:checked').val();//NO I18N

			if( input['filter_type'] == undefined )
			{
				showalert("failure", translate("sdp.admin.survey.question.radio.nooption"), "isAutoHide=false");//NO I18N
			}
			
			input['extensions'] = extensionsArray;
			/*sd-112260*/
			let radioButtons = document.getElementsByName("FileValidationApproach");
            let selectedValue;
            
            for (let i = 0; i < radioButtons.length; i++) {
                if (radioButtons[i].checked) {
                    selectedValue = radioButtons[i].value;
                    break;
                }
            }
			input['mode']=selectedValue;
			
			if(attachmentSettings.attachemntLoadTimePath == input.attachment_path) {
				checkAttachmentFilter(true);
			} else {
				showconfirm(true,'title=' + translate('common.confirm.submit.msg') + ', message=' + translate('sdp.admin.attachment.path.change.warning') + ', submitbutton=' + translate('common.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes',checkAttachmentFilter);// NO I18N
			}
			
			function checkAttachmentFilter(s)
			{
				if( !s || !(input['filter_type'] == "All Files") || attachmentSettings.oldAllFiles )
				{
					formsubmit1(s);
					return
				}
				
				showconfirm(true,'title=' + translate('common.confirm.submit.msg') + ', message=' + translate('sdp.admin.attachment.noretriction.warning') + ', submitbutton=' + translate('common.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes',formsubmit1);// NO I18N
			}
			
			function formsubmit1(s) {
				if(s) {
				    document.getElementById("attachmentSettingsSave").disabled = true;
					sdpAjax({
						type: 'PUT', //NO I18N
						url: '/api/v3/attachment_settings/1', //NO I18N
						data: sdpAjaxInputData(input),
						success: function(data) {
							attachmentSettings.attachmentSettingsAPISuccessCallBack(data);
							attachmentSettings.attachemntLoadTimePath = data.attachment_settings.attachment_path;
							attachmentSettings.oldAllFiles = (data.attachment_settings.filter_type == 'All Files') ? true : false;//NO I18N
						},
						error: function(data) {
							document.getElementById("attachmentSettingsSave").disabled = false;
							if (data.responseJSON && data.responseJSON.response_status.messages[0].status_code == 21001) {
							    jQuery('#alertbox').find('li.alert-danger').remove();
								function formsubmit2(d) {
									if (d) {
										document.getElementById("attachmentSettingsSave").disabled = true;
										input.force_update = true;
										sdpAjax({
											type: 'PUT', //NO I18N
											url: '/api/v3/attachment_settings/1', //NO I18N
											data: sdpAjaxInputData(input),//NO I18N
											success: function(data) {
												attachmentSettings.attachmentSettingsAPISuccessCallBack(data);
												attachmentSettings.attachemntLoadTimePath = data.attachment_settings.attachment_path;
												window.location.reload();
											}, error: function(data) {
												document.getElementById("attachmentSettingsSave").disabled = false;
											}
										});
									} else {
									    document.getElementById("attachmentSettingsSave").disabled = false;
										jQuery("#attachmentPath").val(attachmentSettings.attachemntLoadTimePath);
									}
								}
								showconfirm(true,'title=' + translate('common.confirm.submit.msg') + ', message=' + translate('apicodes.21001') + ', submitbutton=' + translate('common.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes',formsubmit2);// NO I18N
							} else if(data.messages && data.messages[0] )
							{
								showalert('failure', data.messages[0].message, 'isAutoHide=true');//NO I18N
							}
					}
					});
				} else {
					jQuery("#attachmentPath").val(attachmentSettings.attachemntLoadTimePath);
				}
			}
		},
		attachmentSettingsAPISuccessCallBack: function(data) {
			document.getElementById("attachmentSettingsSave").disabled = false;
			if( data.response_status.status == 'success' )	{
				var resp = data.attachment_settings;
				jQuery('#attachmentPath').val( resp.attachment_path );
				jQuery('[name=attachmentSize]').val( resp.attachment_size );
				attachmentSettings.updateExtensions(data.attachment_settings.extensions,data.attachment_settings.filter_type);
				sdp_app.MAX_FILE_ATTACHMENT_SIZE_IN_MB = resp.attachment_size;
				if( resp.restart_required )
				{
					showalert('warning', translate("sdp.fos.restart.warning"), 'isAutoHide=false');//NO I18N
					jQuery('#restart_warning').show();
				}
				else
				{
					showalert('success', translate("sdp.security.settings.update.success.msg"), 'isAutoHide=true');//NO I18N
				}
			}
		},
		updateExtensions : function(extensions,filterType)
		{
			//showing selected values
			var array = [];
			for( var extn of extensions )
			{
				var obj = {"id":extn,"text":extn};	//NO I18N
				array.push(obj);
			}
			
			if(filterType=="All Files")
			{
				jQuery('#AttachmentSettingsInclude').select2('data',[]);//NO I18N
				jQuery('#AttachmentSettingsExclude').select2('data',[]);//NO I18N
			}
			else
			{
			jQuery( jQuery('#fileFilterExc').prop('checked') ? '#AttachmentSettingsExclude' : '#AttachmentSettingsInclude' ).select2('data',array);//NO I18N
			jQuery( jQuery('#fileFilterExc').prop('checked') ?  '#AttachmentSettingsInclude': '#AttachmentSettingsExclude' ).select2('data',[]);//NO I18N
			}
			
			if( filterType == 'Include' )
			{
				jQuery('#fileFilterInc').click();//NO I18N
			}
			else if( filterType == 'Exclude' )
			{
				jQuery('#fileFilterExc').click();//NO I18N
			}
			else
			{
				jQuery('#fileFilterAll').click();//NO I18N
			}
		},

		uploadNewExtension: function() {
			if(document.getElementById('UploadAttachment').files.length == 0) {
				jQuery('#AttachmentError').removeClass('hide');
				setTimeout(function(){jQuery('#AttachmentError').addClass('hide');}, 2000);
			} else {
				var sampleFile = document.getElementById('UploadAttachment').files[0];
				var formdata = new FormData();
				formdata.append("input_image", sampleFile);//NO I18N
				sdpAjax({
					processData: false,
					contentType: false,
					type: "POST",//NO I18N
					url: "/api/v3/attachment_settings/upload_new_extension",//NO I18N
					data: formdata,
					success: function(response){
						jQuery('#NewExtensionDigContent').dialog('close');//NO I18N
						var sampleFileName = sampleFile.name;
						var extn = sampleFileName.substring(sampleFileName.lastIndexOf('.') + 1).toLowerCase();
						if( response.upload_new_extension.restart_required )
						{	
							showalert('warning', translate("sdp.fos.restart.warning"), 'isAutoHide=false');//NO I18N
							jQuery('#restart_warning').show();
						}
						else
						{
							showalert('success', translate('api.saved.success', [extn]), 'isAutoHide=true,delay=3,width=auto');//NO I18N
						}
					}
				});
			}
		},

		initUploadExtensionPopUp: function() {
			jQuery('[data-id=AttachmentSettings]').select2('close');//NO I18N
			jQuery('#NewExtensionDigContent').dialog({'width': '500', 'modal': 'true', 'resize': 'false'})//NO I18N
			jQuery('#UploadAttachment').val('').blur();
			jQuery('#AttachmentError').addClass('hide');
		},

		changeExtensionFilterType: function(elementId) {
			jQuery('div[data-name=extensionList]').hide();
			jQuery('#addNewExtnPopup').hide();
			if(elementId == 'include') {
				jQuery('#extensionListInclude').show();
				jQuery('#addNewExtnPopup').show();
			} else if(elementId == 'exclude') { //NO I18N
				jQuery('#extensionListExclude').show();
				jQuery('#addNewExtnPopup').show();
			}
		}
};
