var OutlookAddIn = {
	dialog_properties:function(data){ // This returns the properties of dialog box for reply,notes in request deatils page
		return {
			title:data,
			width:250,
			height: "auto",//No i18n
			modal: true,
			position: 'center',//No i18n
			top:100,
			resizable: true,
			close: function(event, ui)    //This ensure the closing a dialog box in reply , notes in request details page
			   {
				if(event.target.id=="reply_addIn"){
				   iframe_element.jQuery("#reply_addIn").dialog("destroy").hide();//No i18n
				   }
				else{
				   iframe_element.jQuery("#notes_addIn").dialog("destroy").hide();//No i18n
				   }
			 }
		}
	},

	uploadfile: function(data){// This api call is used to upload the attachments in mail to request form attachment field 
		var attach_component = iframe_element.$rf.fields.attachments.component;
		attach_component.excluded_filesize=[]; 
		attach_component.upload(data,iframe_element.jQuery("#attachments"),null,true,false);
	},

	b64toBlob:function(b64Data, contentType,sliceSize,filename,fileformat) { // This function convert the 64based encoded string into blob format and returns a file 
		  contentType = contentType || "";
		  sliceSize = sliceSize || 512;  //However the performance can be improved a little by processing the byteCharacters in smaller slices, rather than all at once. In rough testing 512 bytes seems to be a good slice size.
		  let byteCharacters = atob(b64Data);
		  let byteArrays = [];

		  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) 
			  {
				let slice = byteCharacters.slice(offset, offset + sliceSize);
				let byteNumbers = new Array(slice.length);

					for (let i = 0; i < slice.length; i++) 
					  {
						 byteNumbers[i] = slice.charCodeAt(i);
					  }  

				let byteArray = new Uint8Array(byteNumbers);
				byteArrays.push(byteArray);
			  }

		  return new File(byteArrays, filename, { type:fileformat});
						 
	},

	performFileOperation: function() {
	if(typeof outlookClientID !== "undefined" && outlookClientID !== null && outlookClientID !== ""){
			OutlookAddIn.initializeMSAL(outlookClientID);
			return;
		}
		var inputData = {
			"list_info": { //NO I18N
				"search_fields": { //NO I18N
					"name": "Outlook AddIn" //NO I18N
				}
			}
		};

		iframe_element.sdpAjax({
			url: "/api/v3/integrations", //NO I18N
			type: "GET", //NO I18N
			async: false,
			context: this,
			data: iframe_element.sdpAjaxInputData(inputData),
			success: function(data) {
				if (data && data.response_status.status === "success" && data.integrations) {
					const integration = data.integrations.find(i => i.name === "Outlook AddIn");
					if (integration && integration.configuration && integration.configuration.clientId) {
						OutlookAddIn.initializeMSAL(integration.configuration.clientId);
					}
				}
			}
		});
	},

	initializeMSAL: function(clientId) {
		// Initialize MSAL
		const msalConfig = {
			auth: {
				clientId: clientId,
				authority: "https://login.microsoftonline.com/common" //NO I18N
			},
			cache: {
				cacheLocation: "sessionStorage", //NO I18N
				storeAuthStateInCookie: true
			}
		};
		const msalInstance = new msal.PublicClientApplication(msalConfig);
		const loginRequest = {
			scopes: ["Mail.Read", "Files.Read"] //NO I18N
		};

		// Clear any existing interaction state
		try {
			// Force clear any interaction state
			sessionStorage.removeItem("msal.interaction.status"); //NO I18N
			sessionStorage.removeItem("msal.interaction.in.progress"); //NO I18N
			
			// Clear all MSAL interaction-related entries
			const keys = Object.keys(sessionStorage);
			keys.forEach(key => {
				if (key.startsWith("msal.") && (key.includes("interaction") || key.includes("request"))) {
					sessionStorage.removeItem(key);
				}
			});
			
			//Try clearing from localStorage if it exists there
			const localKeys = Object.keys(localStorage);
			localKeys.forEach(key => {
				if (key.startsWith("msal.") && (key.includes("interaction") || key.includes("request"))) {
					localStorage.removeItem(key);
				}
			});
		} catch (error) {
		}

		// Check if there's a cached account
		const accounts = msalInstance.getAllAccounts();
		
		if (accounts.length > 0) {
			// Account is available, set it as active
			msalInstance.setActiveAccount(accounts[0]);
			
			// Try silent token acquisition
			msalInstance.acquireTokenSilent(loginRequest)
				.then(response => {
					const accessToken = response.accessToken;
					OutlookAddIn.fetchAndProcessAttachments(accessToken);
				})
				.catch(error => {
					// Fall back to interactive method
					msalInstance.loginPopup(loginRequest)
						.then(response => {
							msalInstance.setActiveAccount(response.account);
							return msalInstance.acquireTokenSilent(loginRequest);
						})
						.then(response => {
							const accessToken = response.accessToken;
							OutlookAddIn.fetchAndProcessAttachments(accessToken);
						})
						.catch(error => {
							// MSAL failed, fallback to legacy token
							OutlookAddIn.getLegacyTokenAndFetchAttachments();
						});
				});
		} else {
			// No cached account, start interactive login
			msalInstance.loginPopup(loginRequest)
				.then(response => {
					msalInstance.setActiveAccount(response.account);
					return msalInstance.acquireTokenSilent(loginRequest);
				})
				.then(response => {
					const accessToken = response.accessToken;
					OutlookAddIn.fetchAndProcessAttachments(accessToken);
				})
				.catch(error => {
					// MSAL failed, fallback to legacy token
					OutlookAddIn.getLegacyTokenAndFetchAttachments();
				});
		}
	},

	getLegacyTokenAndFetchAttachments: function() { //fallback function for legacy token when MSAL fails
		Office.context.mailbox.getCallbackTokenAsync({isRest: true}, function(result) {
			if (result.status === "succeeded") { //NO I18N
				const accessToken = result.value;
				OutlookAddIn.fetchAndProcessAttachmentsLegacy(accessToken);
			}
		});
	},

	fetchAndProcessAttachmentsLegacy: function(accessToken) { //legacy version of fetchAndProcessAttachments using REST API
		const itemId = OutlookAddIn.getItemRestId();
		const getMessageUrl = Office.context.mailbox.restUrl + '/v2.0/me/messages/' + itemId + '/attachments'; //NO I18N
		
		iframe_element.sdpAjax({
			async: "false", //NO I18N
			url: getMessageUrl,
			dataType: 'json', //NO I18N
			headers: { 'Authorization': 'Bearer ' + accessToken } //NO I18N
		}).then(function(item) {
			item = item.value;
			if (item.length > 0) {
				for (let i = 0; i < item.length; i++) {
					const attachment = item[i];
					let content = attachment.ContentBytes; // REST API returns ContentBytes
					let format = "base64"; //NO I18N
					let file = OutlookAddIn.b64toBlob(content, format, null, attachment.Name, attachment.ContentType);
					let sdp_attachsize = iframe_element.sdp_app.MAX_FILE_ATTACHMENT_SIZE_IN_MB;
					
					if (attachment.Size / 1024 / 1024 < sdp_attachsize && !attachment.IsInline) {
						OutlookAddIn.uploadfile(file);
					} else if (attachment.Size / 1024 / 1024 < sdp_attachsize && attachment.IsInline) {
						let cid = "cid:" + attachment.ContentId; //NO I18N
						OutlookAddIn.uploadimage_description(file, cid);
					} else if (attachment.Size / 1024 / 1024 > sdp_attachsize) {
						iframe_element.showalert("failure", iframe_element.translate("sdp.api.attachment.upload.size.failed", ["[<strong>" + iframe_element.e_html(attachment.Name) + "</strong>]", sdp_attachsize]), "isAutoHide=false", "multi"); //NO I18N
					}
				}
			}
			if (!jQuery(OutlookAddIn.description).html().trim() === '') {
				iframe_element.$CS.setDescription(OutlookAddIn.description.html());
				OutlookAddIn.description = "";
			}
		}).catch(error => {
			return;
		});
	},

	uploadimage_description:function(data,cid){ // This api call is used to upload the mail description in the request from description field
		const editor=iframe_element.ZEditor[iframe_element.$rf.fields.description.zeditor_id];
		let url=iframe_element.ZE_Init.uploadImgApi(editor,data,true);
		  if(url){
			 let html=OutlookAddIn.description;
			 jQuery(html).find(`img[src$="${cid}"]`).attr("src",url);
		  }
	},

	fetchAndProcessAttachments:function(accessToken){ 
		const itemId = OutlookAddIn.getItemRestId();
		// Use Microsoft Graph API endpoint
		const getMessageUrl = `https://graph.microsoft.com/v1.0/me/messages/${itemId}/attachments`;
		
		iframe_element.sdpAjax({
			async: "false",
			url: getMessageUrl,
			dataType: 'json', //NO I18N
			headers: { 'Authorization': 'Bearer ' + accessToken } //NO I18N
		}).then(function(item){			    
			item = item.value;
			if (item.length > 0 ) { 					
				for (let i = 0 ; i < item.length ; i++) { 
					const attachment = item[i];										
					let content = attachment.contentBytes; // Graph API returns base64 content
					let format = "base64"; //NO I18N
					let file = OutlookAddIn.b64toBlob(content, format, null, attachment.name, attachment.contentType);
					let sdp_attachsize = iframe_element.sdp_app.MAX_FILE_ATTACHMENT_SIZE_IN_MB;                                        
					
					if(attachment.size/1024/1024 < sdp_attachsize && !attachment.isInline){ 
						OutlookAddIn.uploadfile(file); 
					}
					else if(attachment.size/1024/1024 < sdp_attachsize && attachment.isInline){				                          	
						let cid = "cid:" + attachment.contentId; //NO I18N
						OutlookAddIn.uploadimage_description(file,cid); 
					}
					else if(attachment.size/1024/1024 > sdp_attachsize){
						iframe_element.showalert("failure", iframe_element.translate("sdp.api.attachment.upload.size.failed", ["[<strong>" + iframe_element.e_html(attachment.name) + "</strong>]",sdp_attachsize]), "isAutoHide=false", "multi"); //NO I18N
					}
				}
			}
			if(jQuery(OutlookAddIn.description).html().trim() !== ''){
				iframe_element.$CS.setDescription(jQuery(OutlookAddIn.description).html());
				OutlookAddIn.description="";
			}
		}).catch(error => {
		});
	},

	 getItemRestId:function() {  //this funtion  convert the normal item id to rest outlook api itemid format
		  if (Office.context.mailbox.diagnostics.hostName === 'OutlookIOS') {
			// itemId is already REST-formatted.
			return Office.context.mailbox.item.itemId;
		  } else {
			return Office.context.mailbox.convertToRestId(
			  Office.context.mailbox.item.itemId,
			  Office.MailboxEnums.RestVersion.v2_0
			);
		  }
		},

	init: function() {
		var iframe = document.createElement('iframe');
		iframe.id = 'common_iframe'; 
		iframe.className = 'hide fh'
		iframe.onload = function() {
			OutlookAddIn.render_iframe();
			if(!jQuery("#list_view_container").is(":visible")){
				iframe_element.$CS.findElement("list_view_container").removeClass("disp-h"); //No I18N
			}
			iframe_element.ResourceLoader({js:["/scripts/hbs_template_requests.js"]}); //No I18N
		};
		iframe.src = "/WOListView.do?externalframe=true&service=OutlookAddIn&noheader=true";
		document.getElementById("page").appendChild(iframe);
		Office.context.mailbox.addHandlerAsync(Office.EventType.ItemChanged, eventArgs => {});
		jQuery("#common_iframe").css("height",window.outerHeight);//No I18N
	},
	render_iframe:()=>{
		iframe_element=document.getElementById('common_iframe').contentWindow;
		iframe_element.sdpAjax({
		  cache: false,		
		  url: "/servlet/AJaxServlet?action=GetHeaderDetails",//NO I18N		
		  success: function(data) {		
			iframe_element.template_settings=data.template_settings;
		  }		
		});
		let description;
		function getDescription() {
			return new Promise((resolve, reject) => {
				if(description!=undefined){
					resolve(description);
				}
				Office.context.mailbox.item.body.getAsync("html", { asyncContext: "value" }, function (asyncResult) { //No I18N
					if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
						resolve(asyncResult.value);
						description=asyncResult.value;
					} else {
						reject(asyncResult.error);
					}
				});
			});
		}
		function triggerOutlookEvent(data){
			const item = Office.context.mailbox.item;
			const outlok_data={
				description:data,
				subject:item.subject,
				sender:item.sender,
				user_email:Office.context.mailbox.initialData.userEmailAddress,
				to: item.to || [],
				cc: item.cc || [],
				bcc: item.bcc || []
			}
			iframe_element.$CS.findElement("outlook_page").trigger("outlook_request_form",[outlok_data,Office.context.mailbox.item]); //No I18N
		}
		iframe_element.externalCallback=function(data,obj){
			switch(data){
				case "request_form"://set reset and fetch from mail icon //No I18N
					iframe_element.jQuery("body").off("click", ".sdpIcon-mailFetch").off("click", ".sdpIcon-FormReset").on("click",".sdpIcon-mailFetch",function(){ //No I18N
						iframe_element.jQuery(".sdpIcon-FormReset").removeClass('inactive');
						iframe_element.jQuery(".sdpIcon-mailFetch").addClass('inactive');
						iframe_element.$CS.setValue("SUBJECT",Office.context.mailbox.item.subject);//No I18N
						if(iframe_element.$CS.isTechnician()){
							let $CS_instance = iframe_element.$CS;
								if($CS_instance.isTechnician()){
										iframe_element.sdpAjax({
												url:"/api/v3/requests/requester", //No I18N
												data:iframe_element.sdpAjaxInputData({"list_info":{"row_count":100,"search_criteria":{"condition":"is","field":"email_id","value":Office.context.mailbox.item.sender.emailAddress,"logical_operator":"AND"}}}), //No I18N
												ignorefailuremessage: true,
												success:(dt)=>{
													if(dt.requester.length){
														$CS_instance.setValue("REQUESTER",dt.requester[0].name);//No I18N
													return;
												}
												$CS_instance.setValue("REQUESTER",	$CS_instance.getLoggedInUserName());//No I18N
											},
											error:()=>{
												$CS_instance.setValue("REQUESTER",	$CS_instance.getLoggedInUserName());//No I18N
											}
										})
							}
						}
						function updateDescription(data){
							OutlookAddIn.description=jQuery.parseHTML("<div id='description'>"+data+"</div>");
							OutlookAddIn.performFileOperation(); //sync file
						}
						getDescription().then(function(data){
							updateDescription(data);
						})
					});   
					iframe_element.jQuery("#woform").removeClass("hide");
					iframe_element.ZEditor[iframe_element.$rf.fields.description.zeditor_id].initobj.allowPasteImage=true;
					iframe_element.ZEditor[iframe_element.$rf.fields.description.zeditor_id].regenerateToolbar();
					jQuery(iframe_element.ZEditor[iframe_element.$rf.fields.description.zeditor_id].doc).find("head").append('<style type="text/css">.ze_spell{display:none}');//No i18n
					iframe_element.jQuery("body").on("click",".sdpIcon-FormReset",function(){
						iframe_element.jQuery(".sdpIcon-FormReset").addClass('inactive');
						iframe_element.jQuery(".sdpIcon-mailFetch").removeClass('inactive');
						iframe_element.FC.reset(iframe_element.$rf.form);
					});
					iframe_element.jQuery(".sdpIcon-FormReset").show();
					if(iframe_element.$req.form.edit_mode==true){
						iframe_element.jQuery(".sdpIcon-FormReset").hide();
					}
					iframe_element.jQuery(".showmore").hide();
					if(iframe_element.$req.form.edit_mode==false){
						setTimeout(function(){iframe_element.jQuery(".sdpIcon-mailFetch").trigger('click');},10);	
					}
					getDescription().then(function(data){
						setTimeout(function(){triggerOutlookEvent(data);},30); // time out to prevent  the overide of fields like subject,etc.
					 });
					iframe_element.jQuery("body").css({"overflow":"hidden"});	//No I18N
					if(iframe_element.isMSP)
					{
						iframe_element.jQuery('[data-name="form-footer"]').css({"marginBottom":"38px"}); //No I18N
					}
					break;
				case "edit"://While trying to edit from details page //No I18N
					iframe_element.requestListViews.openAjaxForm(iframe_element.woID);
					break;
				case "request_listview":// used to do once page renders in request  list view //No I18N
					iframe_element.jQuery("body").scrollTop();
					iframe_element.temp_current_req_mode="rq_leftpanel";//No I18N
					iframe_element.requestListViews.backToAjaxListview();
					var cssLink = document.createElement("link");
					cssLink.href = "/style/sdp-outlook-addin.css?"+iframe_element.sdp_app.BUILD_NUMBER;
					if(iframe_element.sdp_user.DIRECTION=="RTL"){
						cssLink.href = "/style/sdp-outlook-addin-rtl.css?"+iframe_element.sdp_app.BUILD_NUMBER;
					}
					cssLink.rel = "stylesheet";  
					cssLink.id="outlook_addin_css";
					cssLink.type = "text/css";
					if(iframe_element.jQuery("#outlook_addin_css").length==0){
						iframe_element.document.body.appendChild(cssLink);	
					}
					if(iframe_element.sdp_user.ROLES.indexOf("CreateRequests")==-1 || (iframe_element.template_settings && iframe_element.template_settings.is_default_template_enabled==false)){
						OutlookAddIn.render('request_listview');
						iframe_element.$CS.hideElement("new_request");	//No I18N
					}
					iframe_element.jQuery("body").css({"overflow":"hidden"});	//No I18N
					jQuery('#page').removeClass('hide');	
					jQuery('#load_ticket').addClass('hide');
					break;
				case "reply":// used to show reply //No I18N
				case "notes":// used to show notes //No I18N
					var $ele = iframe_element.jQuery("#reply_addIn"),title=iframe_element.getMessageForKey("sdp.requests.common.reply");
					if(data=="notes"){
						$ele = iframe_element.jQuery("#notes_addIn");
						title = iframe_element.getMessageForKey("sdp.requests.common.notes");
					}
					$ele.find("input,textarea").val("");
					if(data=="reply"){
						$ele.find("[name=to]").val(iframe_element.$req.details.request_info.requester.email_id);
						$ele.find("[name=subject]").val("Re: "+iframe_element.$req.details.request_info.subject);//no i18n
					}
					$ele.removeClass('hide').dialog(OutlookAddIn.dialog_properties(title));
					$ele.dialog(OutlookAddIn.dialog_properties(title));
					$ele.find("button").off().on("click",function(){
						OutlookAddIn.update_request(data);
					});
					break;
				case "ticket_created"://After ticket created/ edited //No I18N
					iframe_element.requestListViews.openAjaxRequest(obj.woID);
					break;
				case "request_details"://After ticket created/edited //No I18N
					OutlookAddIn.loadDetailsPage(obj);
					iframe_element.jQuery("#addIn_description").find("[href]").attr("target","_blank");
					iframe_element.jQuery("body").css({"overflow":"hidden"});	//No I18N
					break;
			}
		};
	},
	update_request:function(data){ // this function is used to send reply , notifications for that ticket in deatils page
		let element;
		let input_data;
		if(data=="reply"){ 
			element=iframe_element.jQuery("#reply_addIn");	
			if(element.find('input[name=subject]').val()=="" || (iframe_element.sdp_user.USERTYPE!="Technician" && element.find('input[name=to]').val()=="") || (iframe_element.sdp_user.USERTYPE == "Technician" && element.find('input[name=to]').val()=="")){
				iframe_element.showalert("failure",iframe_element.getMessageForKey("ae.cmdb.admin.relationship.type.mandatoryfield"), 'isAutoHide=false, delay=5');	//No I18N
				return;
			}
			input_data = {
				notification:{
					 subject: element.find('input[name=subject]').val(),
					 description:element.find('textarea').val(),
					 content_type: "text/html",//No i18n
					 type: (iframe_element.sdp_user.USERTYPE=="Technician") ? "reply" : "conversation",//No i18n
					 mode: "E-Mail",//No i18n
			   }
			};
			if(iframe_element.sdp_user.USERTYPE=="Technician"){
				  var to_mails = [];
				  var mail_values=element.find('input[name=to]').val();
				  if (mail_values.includes(',') && mail_values.includes(';')) {
					iframe_element.showalert('failure', iframe_element.getMessageForKey("sdp.requests.fieldFormRules.invalidEmail"), 'isAutoHide=true, delay=5'); //No I18N
					return;
				  }
				  var toMail = mail_values.split(/[,;]/);
				  for(var i = 0; i < toMail.length ; i++){
					  to_mails.push({"email_id": toMail[i]});
				  }
				   input_data.notification.to = to_mails;
			}
			iframe_element.sdpAjax({
				  url:"/api/v3/requests/"+iframe_element.woID+"/notifications",//No I18N
				   type: "POST", //No I18N
				   data:iframe_element.sdpAjaxInputData(input_data),
				 success: function(data) {
				  if(data.response_status.status.toLowerCase()=="success"){
				   iframe_element.showalert('success', iframe_element.getMessageForKey("sdp.common.success"), 'isAutoHide=true, delay=5'); //No I18N
				   element.dialog("close"); //No I18N
					}
				 },
				 error:function(data){
					 iframe_element.showalert('failure', iframe_element.e_html(data.responseJSON.response_status.messages[0].message), 'isAutoHide=false, delay=5');    //No I18N
				 }
			});
		}
		else{ 
			element=iframe_element.jQuery("#notes_addIn");	
			if(element.find('textarea').val()==""){
				iframe_element.showalert("failure",iframe_element.getMessageForKey("ae.cmdb.admin.relationship.type.mandatoryfield"), 'isAutoHide=false, delay=5');	//No I18N
				return;
			}
			input_data = {
				note:{
					description:element.find('textarea').val()	
				}
			};
			iframe_element.sdpAjax({
				url:"/api/v3/requests/"+iframe_element.woID+"/notes",//No I18N
				type:"POST",//No I18N
				data:iframe_element.sdpAjaxInputData(input_data),
				success:function(data){
					if(data.response_status.status=="success"){
						iframe_element.showalert('success', iframe_element.getMessageForKey("sdp.common.success"), 'isAutoHide=true, delay=5');	//No I18N
						element.dialog("close");//No I18N
					}
				},
				error:function(data){
					iframe_element.showalert('failure', iframe_element.e_html(data.responseJSON.response_status.messages[0].message), 'isAutoHide=false, delay=5');	//No I18N
				}
			})
		}
	},
	render:function(data,obj){
		iframe_element.sdp_user.KB_SHORTCUTS=false;
		jQuery("#common_iframe").removeClass('hide');
		setTimeout(function(){
			if(data=="request_form") {
					iframe_element.requestListViews.openAjaxForm();	
			}
			jQuery("#landing_screen").addClass('hide');
		},500);
	},
	rerender_attachment:function(){ // this function is used the re-render the attachments in details page after adding/removing an attachment
		iframe_element.sdpAjax({
		  cache: false,
		  url: "/api/v3/requests/"+iframe_element.woID+"/attachments",//NO I18N
		  success: function(data) {
			iframe_element.$req.prop.fieldDetails.attachments=data.attachments;
			OutlookAddIn.render_attachment(iframe_element.$req);
		  }
		});
	},
	render_attachment:function($req){ // this function is used to add the attachments in the request deatils page
		iframe_element.renderhbs("#desc-attachments","addin-attachments",{attachments:$req.prop.fieldDetails.attachments},false,"requests",true,true);//No I18N
		  var attach_options = {
		"entity" : "requests", // No I18N
		"api" : false, // No I18N
		"is_odapi": true,   //No I18N
		"is_odapi_v2":true, //No I18N
		"upload_api" : true, //No I18N
		"direct_upload": true,  //No I18N
		"skipPreview": true,//No I18N
		"entity_id": $req.details.request_info.id, // No I18N
		"rerenderOnUpload": false,  //No I18N
		"description":false, // NO I18N
		/** Enable Role Check when upload attachments */
		"upload" :  (!$req.details.request_info.is_trashed && $req.details.operational_data.links && $req.details.operational_data.links.attachments && $req.details.operational_data.links.attachments.post) ? true : false , //No I18N
		"enable_delete" :  (!$req.details.request_info.is_trashed && $req.details.operational_data.links && $req.details.operational_data.links.edit && $req.details.operational_data.links.edit.put && $req.sdp_user.USERTYPE === "Technician") ? true : false, //No I18N
		"onupload": ['OutlookAddIn.rerender_attachment', window], //No I18N
		"ondelete": ['OutlookAddIn.rerender_attachment', window], //No I18N
		"description_viewimages": "req-desc-body",  //No I18N
		"attachWrap": true,  //No I18N
	   };
	   new iframe_element.attachPreview('#attachment-api',attach_options);//No I18N
   },
   bindEvents:function(){
	// one time binding 
	iframe_element.jQuery("#listview_page").click(()=>{
		iframe_element.requestListViews.backToAjaxListview();
	});
	iframe_element.jQuery("[data-callback]").click(function(){
		iframe_element.externalCallback(jQuery(this).data('callback')) //No I18N
	})
   },
	loadDetailsPage:function(obj){ // this function loads the details page for a  ticket
		var $req=iframe_element.$req;
		$req.details.initialize(obj.id);
		$req.rpanel.fieldsObj={};
		$req.prop.fieldDetails = $req.prop.getPropertyData();
		$req.prop.fieldDetails.subject=$req.details.request_info.subject;
		$req.prop.fieldDetails.description=$req.details.request_info.description;
		$req.prop.fieldDetails.attachments = $req.details.request_info.attachments;
		$req.prop.fieldDetails.subject=$req.details.request_info.subject;
		$req.prop.fieldDetails.woID=obj.id;
		$req.prop.fieldDetails.isTechnician=(iframe_element.sdp_user.USERTYPE=="Technician");//No I18N
		$req.prop.fieldDetails.isEdit=iframe_element.sdp_user.ROLES.indexOf("ModifyRequests")!=-1;
		iframe_element.renderhbs("#detailview",'property-addin',$req.prop.fieldDetails,false,"requests",true,true);  //NO I18N
		  OutlookAddIn.render_attachment($req);
		OutlookAddIn.bindEvents();
		var rd_view = {
			render: function() {
				this.setFormInfo();
				this.initForm();
			},
			setFormInfo: function() {
				/** form props */
				$req.common.mode = "view";//No I18N
				$req.common.request_info = $req.details.request_info.request_info || {};
				$req.common.ssp = $req.details.self_service_portal_settings;
				$req.common.is_service_template = $req.details.template_info.is_service_template;
				$req.common.template = $req.details.template_info;
				$req.common.formname = "req-prop-form";	//No I18N
				$req.common.resourceform = "resource-container";	//No I18N
				$req.common.links = $req.details.operational_data.links;
			},
			/**
			 * Initializes the Form component for the Request form
			 */
			initForm: function() {
				var template = this.constructTemplateInfo();
				var formoptions = {
					name: "WorkOrderForm",	//No I18N
					entity: "request",	//No I18N
					entityName: iframe_element.getMessageForKey("common.request"),	//No I18N
					entitypath: "/requests",	//No I18N
					entitydata: $req.details.request_info,
					template: template,
					metadata: $req.details.meta_info,
					mode: "view",	//No I18N
					container: "PropertyFrame",	//No I18N
					formid: "req-prop-form",	//No I18N
					skipFields: [ "assets","description","subject" ],	//No I18N
					additional_contexts: ["udf_fields", "onhold_scheduler", "closure_info", "resolution"],	//No I18N
					skipEmptyFields : "all",//No I18N
					showmore:false,
					templateMetaMap: {
						requester_name: "requester",	//No I18N
						asset: "assets"	//No I18N
					},
					view: {
						defaults: {
							lookup: {
								text: iframe_element.getMessageForKey("sdp.common.notassigned")	//No I18N
							}
						}
					},
					canEdit: false,
					afterRenderCallback:function(){
						if(iframe_element.jQuery("#resource-container").find(".form-section").length==0){
							iframe_element.jQuery("#resource-container").hide();
						}
					}
				};
				/** skips the site field if there is no site configured in the application */
				if(!iframe_element.sdp_app.IS_SITE_CONFIGURE) {
					formoptions.skipFields.push("site");	//No I18N
				}
				window.$rf = new iframe_element.FC(formoptions);
			},

			constructTemplateInfo: function() {
				var template = JSON.parse(iframe_element.sdpToJSON($req.details.template_info));
				var layouts = template.layouts;

				/** set extra fields to the property */
				var extrasection = $req.common.getExtraFields();
				/** removing the other usertype's layout form the template */
				for(var i = 0; i < layouts.length; i++) {
					if(iframe_element.sdp_user.USERTYPE === "Technician") {
						if(layouts[i].name === "requester_layout") {
							layouts.splice(i, 1);
							i--;
							continue;
						} else if(layouts[i].name === "technician_layout") {	//No I18N
							layouts[i].name = "properties_layout";	//No I18N
							layouts[i].sections.push(extrasection);
						}
					} else {
						if(layouts[i].name === "technician_layout") {
							layouts.splice(i, 1);
							i--;
							continue;
						} else if(layouts[i].name === "requester_layout") {
							layouts[i].name = "properties_layout";	//No I18N
							layouts[i].sections.push(extrasection);
						}
					}
					/** setting custom properties in the resources layout */
					if(layouts[i].name === "resource_layout") {
						if(layouts[i].sections && layouts[i].sections.length > 0) {
							layouts[i].id = "resource-container";	//No I18N
							layouts[i].widget = false;
							layouts[i].title = iframe_element.getMessageForKey("common.resources");	//No I18N
							layouts[i].view_type = layouts[i].resource_view;
							layouts[i].section_class = "addresource";
						}
					}
					if(layouts[i].name=="properties_layout"){
						layouts[i].id = "property-container";	//No I18N
					}
					if(layouts[i].name === "properties_layout" || layouts[i].name === "resource_layout") {	
						/** iterates and modifies the fields' template configs as required */
						for(var j = 0, jLen = layouts[i].sections.length; j < jLen; j++) {
							if(layouts[i].sections[j].fields) {
								for(var k = 0, kLen = layouts[i].sections[j].fields.length; k < kLen; k++) {
									if(this.modifyFieldConfig(layouts[i].sections[j].fields[k], layouts[i].sections[j]) === false) {
										layouts[i].sections[j].fields.splice(k, 1);
										k--;
										kLen--;
									}
									if(!!layouts[i].sections[j].fields[k].style_properties) {
										if(typeof layouts[i].sections[j].style_properties=="undefined"){
											layouts[i].sections[j].style_properties={field_style:{}};
										}
										if(!!layouts[i].sections[j].style_properties.field_style && !jQuery.isEmptyObject(layouts[i].sections[j].style_properties.field_style)) {
											layouts[i].sections[j].style_properties.field_style.field_align = "left";	//No I18N
										} else {
											layouts[i].sections[j].style_properties.field_style = {"field_align": "left"};	//No I18N
										}									
									}
									layouts[i].sections[j].fields[k].position.col = "1";	//No I18N
									layouts[i].sections[j].fields[k].position.row = (k + 1).toString();
									if(layouts[i].sections[j].column_count>2){
										layouts[i].sections[j].column_count=2;
										layouts[i].sections[j].fields[k].position.col_size="2";
									}
									delete layouts[i].sections[j].fields[k].style_properties;
								}
							}
							if(layouts[i].name=="resource_layout"){
								layouts[i].sections[j].column_count=1;
								layouts[i].sections[j].name=layouts[i].sections[j].title;
							}else{
								layouts[i].title =iframe_element.getMessageForKey("sdp.home.ssp.customization.common.properties");	//No I18N
							}
							delete layouts[i].sections[j].style_properties;
						}
					}
					if(layouts[i] && layouts[i].sections&& layouts[i].sections.length==0){
						delete layouts.splice(i,1);
					}
					template.style_properties = {"field_style": {"field_align" : "left"}};	//No I18N
				}

				return template;
			},

			/**
			 * modifies the fields' default config in the template configuration object
			 */
			modifyFieldConfig: function(field, section) {
				if(field.name.indexOf("udf_") > -1) {
					field.context = "udf_fields";	//No I18N
				} else if(field.name.indexOf("qstn_") > -1) {	//No I18N
					field.context = "resources." + section.name;	//No I18N
					field.image_dimension = "100x80";	//No I18N
					if(field.name.indexOf("qstn_text") > -1) {
						field.value_path = field.context + "." + field.name + ".value";	//No I18N
					}
				}
			},

			isCostEnabled: function() {
				return iframe_element.sdp_user.USERTYPE === "Technician" && $req.details.request_info.template_info.is_service_template && 		//No I18N
					$req.details.request_info.template_info.is_cost_enabled && $req.details.request_info.total_cost;
			}
		}
		rd_view.render();
	}
}; 

