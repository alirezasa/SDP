
/////**************Utility functions************////////
var APISection = {
	/**
	 * Populates the operation form with the provided entity, operation JSON, and other parameters.
	 * @param {string} entity - The entity name.
	 * @param {Object} operationJson - The JSON object containing operation details.
	 * @param {number} noOfInputs - The number of input fields in the form.
	 * @param {HTMLElement} apiSection - The API section element.
	 * @param {string} entityGroup - The group to which the entity belongs.
	 */
	populateOperationForm : function(entity, operationJson, noOfInputs, apiSection, entityGroup) {
		var apiPanel = '#api-section';	//No I18N
		var inputGroup = jQuery(apiSection).find('.input-group')[0];
		var apiForm = jQuery(apiSection).find('.api-form')[0];

		var pathInput = jQuery(inputGroup).find('.form-control').eq(0);

		if (jQuery.isArray(operationJson.path) && operationJson.path.length == 1) {
			operationJson.path = operationJson.path[0];
		}
		if (jQuery.isArray(operationJson.path) && operationJson.path.length > 1) {
			var pathSelect = document.createElement('select');
			pathSelect.className = 'form-control';

			operationJson.path.map(i=>{
				var pathOption = document.createElement('option');
				var entity = i.split("/")[3];
				entity = entity.charAt(0).toUpperCase() + entity.slice(1);
				var ent = entity.slice(0,-1);
				ent = ent.includes("_") ? ent.split("_")[0] : ent;
				if(!APISidebar.isModuleEnabled(ent)){return;}
				pathOption.value = i;
				pathOption.text = i;
				pathSelect.appendChild(pathOption);
			});
			jQuery(pathSelect).on('change', function () { //No I18N
				var apiTextDiv = jQuery(this).parents('.pos-rel')[0];
				jQuery(apiTextDiv).find('.api-form .req_field').parent().remove();
				APISidebar.includeMandatoryInputs(apiTextDiv, this.value);
			});
			jQuery(pathSelect).insertAfter(e_html(pathInput));
			pathSelect.id = 'path';
			pathInput.hide();
		}
		else {
			pathInput.attr('id', 'path');//No I18N
			pathInput.val(operationJson.path);
		}

		jQuery('#entity-of-operation').val(entity);//No I18N
		jQuery('#entity-group').val(entityGroup);//No I18N

		jQuery(inputGroup).find('.api-request-type')[0].id = 'http_method';

		if (operationJson.name && operationJson.name != "") {
			jQuery(apiForm).find('input.form-control')[noOfInputs].id = 'other_parameters';
			jQuery(apiForm).find('input.form-control')[noOfInputs].value = 'OPERATION_NAME=' + e_param(operationJson.name); //No I18N
		}
		else { jQuery(apiForm).find('input.form-control').eq(noOfInputs).parent().remove(); }

		files[apiPanel] = [];

		if (!operationJson.fileinput && operationJson.fileinput != 'true') { jQuery(apiForm).find('#fileInput').eq(0).remove(); }

		else {
			jQuery('.import-droptarget').unbind().click(function (e) {//No I18N
				e.preventDefault();
				jQuery('#filesDrag').trigger('click');//No I18N
			});
			jQuery('#api-section').off().on('click', '.import-files .common-close-icon3', function () { //No I18N
				APISection.removeFileSelection(this);
				jQuery(this).parent().remove();
			});
		}

		jQuery(apiForm).find('.show-attr')[0].id = 'attrToggler';
		if (operationJson.input) {
			var sampleInput = operationJson.input.sample;
			var beautifiedInput = APISection.replaceDynamicValues(APISection.beautifiedValue(sampleInput));
			var inputData_Textbox = jQuery(apiForm).find('textarea.form-control')[0];
			inputData_Textbox.id = 'input_data';
			inputData_Textbox.value = beautifiedInput;
			jQuery(inputData_Textbox).off("change").on("change" ,function () { //No I18N
				this.value = APISection.beautifiedValue(this.value);
			});

			if (operationJson.input.showattr && operationJson.input.showattr == 'true') {
				jQuery(apiForm).find('.show-attr').show(); //No I18N
			}

			//determining whether to store input_data or INPUT_DATA and to be sent for response
			var inputDataNameDiv = jQuery(apiForm).find('textarea.input-data-name')[0];
			inputDataNameDiv.value = "INPUT_DATA"; //No I18N

			if (entity.indexOf('_V01') == -1 && entity.indexOf('_V1') == -1 && entity.indexOf('Conversations') == -1) {
				inputDataNameDiv.value = "input_data"; //No I18N
			}

		}
		else {
			jQuery(apiForm).find('ul li:last-child').remove();
		}
		jQuery(apiForm).find('.btn-primary')[0].id = 'tryNowBtn';
	},
	/**
	 * Creates the API response by constructing and sending the URL.
	 * @param {string} apiPanel - The selector for the API panel. - API-section
	*/
	createResponse : function(apiPanel) {

		if (jQuery(apiPanel + ' .api-response')[1]) {
			jQuery(apiPanel).removeClass('multi-response');
			jQuery(apiPanel + ' .api-response')[1].remove();
		}
		APISection.createApiResponse(apiPanel);
	},
	/**
	 * Constructs and sends the API request, then processes the response.
	 * @param {string} apiPanel - The selector for the API panel.
	*/
	createApiResponse : function(apiPanel) {

		var httpMethod = jQuery(apiPanel + ' .input-group .api-request-type')[0].textContent;
		var path = encodeURI(jQuery(apiPanel + ' #path')[0].value.trim());
		var entity = jQuery('#entity-of-operation').val();//No I18N
		var entityGroup = jQuery('#entity-group').val();//No I18N
	
		var ajaxJson = {};
		ajaxJson.data = {};
	
		path = path.replace(/%7B/g, '{');
		path = path.replace(/%7D/g, '}');
	
		if (path.indexOf('/v3/') == -1) {
			ajaxJson.data.format = 'json';//No I18N
		}
		jQuery(apiPanel + ' .req_field').each(function(i) {
			if(path.indexOf('{') > -1){
			   path = path.replace(path.substring(path.indexOf('{'), path.indexOf('}') + 1), jQuery(this).val().trim());
			}
		});
        // CMDB API - Get Relationship between two CIs 
		if(path.includes('%3C') || path.includes('%3E')){
			path = path.replace(/%3C/g, '<');
			path = path.replace(/%3E/g, '>');
		}
		
		if (jQuery(apiPanel + ' .api-form #other_parameters')[0]) {
			var oper_name = jQuery(apiPanel + ' .api-form #other_parameters')[0].value.split('=')[1];
			ajaxJson.data.OPERATION_NAME = oper_name;
		}
	
		ajaxJson = APISection.fileInputData(apiPanel, ajaxJson);
	
		var inputData_Textbox = jQuery(apiPanel + ' .api-form textarea.form-control');//No I18N
		if (inputData_Textbox.length > 0 && inputData_Textbox.val().trim() != '') {
			var input_data = inputData_Textbox.val().trim();

			if (APISection.isJSON(input_data)) {
				if (attachmentIds.length > 0) {
					input_data = JSON.parse(input_data);

					for (var key in input_data) {
						if ((key != "list_info" && key != "fields_required" && key != "includes") && input_data.hasOwnProperty(key)) {
							input_data[key].attachments = attachmentIds;
							attachmentIds = [];
							jQuery(apiPanel + ' .api-form textarea.form-control').val(vkbeautify.json(sdpAjaxInputData(input_data)))//No I18N
						}
					}
					input_data = sdpAjaxInputData(input_data);
				}
				input_data = vkbeautify.jsonmin(input_data);
			}
	
			var inputDataName = jQuery(apiPanel + ' .api-form textarea.input-data-name').val().trim();//No I18N
	
			(jQuery(apiPanel + ' .api-form input[type=file]').length > 0) ? path = encodeURI(path + '?' + inputDataName + '=' + input_data) : ajaxJson.data[inputDataName] = input_data;	// NO I18N
		}
	
		if (typeof PORTALID !== 'undefined') {	//No I18N
			if (path.indexOf('/v3/') != -1) {
				if (ajaxJson.headers) {
					ajaxJson.headers.PORTALID = PORTALID;
				}
			} else {
				ajaxJson.data.PORTALID = PORTALID;
			}
		}
		ajaxJson.type = httpMethod;
		ajaxJson.url = baseUrl + path;
		if (path.endsWith("_download") || path.endsWith("download")) { 
			ajaxJson.dataType = "text"; //No I18N
		}
	
		ajaxJson.success = function (msg, status, xhr) {
			jQuery(apiPanel + ' .api-response').eq(0).html(jQuery('.sample-api-response').html());//No I18N
			jQuery(apiPanel + ' .api-response label.sample').addClass('hidden');//No I18N
			APISection.showResponseAPI(baseUrl + path, xhr.responseText, jQuery(apiPanel + ' .api-response')[0]);
		};
	
		ajaxJson.error = function (xhr, ajaxOptions, thrownError) {
			if (!APISection.isJSON(xhr.responseText)) {
				alert(thrownError);
			} else {
				jQuery(apiPanel + ' .api-response').eq(0).html(jQuery('.sample-api-response').html());//No I18N
				jQuery(apiPanel + ' .api-response label.sample').addClass('hidden');//No I18N
				APISection.showResponseAPI(baseUrl + path, xhr.responseText, jQuery(apiPanel + ' .api-response')[0]);
			}
		   
		};
	
		if (path.endsWith("_upload") || path.endsWith("upload")) { //No I18N
			ajaxJson.headers = { 'Accept': 'application/vnd.manageengine.sdp.v3+json' }; //No I18N
		} else if (APISection.checkIfAPIOverODFramework(entity, entityGroup)) { 
			ajaxJson.headers = { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 'Accept': 'application/vnd.manageengine.sdp.v3+json', 'ApiClient': 'doc-tool' }; //No I18N
		}
	
		ajaxJson.ignorefailuremessage=true;
		sdpAjax(ajaxJson);
	
	},
	/**
	 * Checks if the API is over the OD framework for the given entity and group.
	 * @param {string} entity - The entity name.
	 * @param {string} entityGroup - The group to which the entity belongs.
	 * @returns {boolean} - True if the API is over the OD framework, false otherwise.
	*/
	checkIfAPIOverODFramework : function(entity, entityGroup) {
		var res = false;
		indexJson.entities[entityGroup].forEach(function (val) {
			if (val.entityName === entity && val.isOverODFW) {
				res = true;
				return;
			}
		});
		return res;
	},
	/**
	 * Processes file input data for the API request.
	 * @param {string} apiPanel - The selector for the API panel.
	 * @param {Object} ajaxJson - The AJAX JSON object to be updated.
	 * @returns {Object} - The updated AJAX JSON object.
	*/
	fileInputData : function(apiPanel, ajaxJson) {

		if (files[apiPanel] && files[apiPanel].length > 0) {
			ajaxJson.data = new FormData();
			files[apiPanel].map(function(item,i) {
				if (i < files[apiPanel].length && item) { ajaxJson.data.append('input_file', item, item.name); }
			});
			ajaxJson.processData = false;
			ajaxJson.contentType = false;
		}
		return ajaxJson;
	},
	/**
	 * Displays the API response in the right panel.
	 * @param {string} url - The API URL.
	 * @param {string} responseText - The response text from the API.
	 * @param {HTMLElement} responseBody - The element to display the response.
	*/
	showResponseAPI : function(url, responseText, responseBody) {

		if (APISection.isJSON(responseText)) { responseText = vkbeautify.json(responseText); }
		else if (responseText.match(/<script>/i) || responseText == '') { responseText = "Error occured on server side"; } //No I18N


		jQuery(responseBody).find('.form-control')[0].id = 'response_url';
		jQuery(responseBody).find('.form-control')[0].value = url;
		jQuery(responseBody).find('.response-body textarea').text(responseText);

		APIactions.resize();

		if (APISection.isJSON(responseText)) {

			var codemirror = CodeMirror.fromTextArea(jQuery(responseBody).find('.response-body textarea')[0], {
				mode: "application/ld+json",//No I18N
				lineWrapping: true,
				readOnly: true,
				foldGutter: true,
				scrollbarStyle: "null",//No I18N
				viewportMargin: Infinity,
				gutters: ["CodeMirror-foldgutter"],//No I18N
				styleSelectedText: true
			});
			codemirror.setSize("100%", "auto");//No I18N
			this.responseCodeMirror = codemirror;
		}
		else { jQuery(responseBody).find('.response-body').append(document.createTextNode(responseText)); }

		jQuery(responseBody).find('.res-body').height(jQuery('.api-response').height() - 100);//No I18N
	},
	/**
	 * Displays a sample API response in the right panel.
	 * @param {string} sampleText - The sample response text.
	 * @param {HTMLElement} responseBody - The element to display the response.
	*/
	showSampleResponse : function(sampleText, responseBody) {

		jQuery(responseBody).html(jQuery('.sample-api-response').html());//No I18N
		jQuery(responseBody).find('div')[0].className = '';
		jQuery(responseBody).find('label.real').addClass('hidden');
		jQuery(responseBody).show();
	
		APISection.hideOtherElements(['api-response']);//No I18N
	
		var url = baseUrl + jQuery('#api-section #path')[0].value.trim();
	
		APISection.showResponseAPI(url, sampleText, responseBody);
	},
	/**
	 * Beautifies the provided sample value (JSON or XML).
	 * @param {string} sampleValue - The sample value to beautify.
	 * @returns {string} - The beautified value.
	*/
	beautifiedValue : function(sampleValue) {
		return APISection.isJSON(sampleValue) ? vkbeautify.json(sampleValue) : vkbeautify.xml(sampleValue);
	},
	/**
	 * Retrieves the main file (e.g., RestApi) and constructs the left navigation.
	*/
	getMainFile : function() {

		var fileName = "RestApi";	//No I18N

		sdpAjax({
			type: "get",//No I18N
			url: encodeURI("/doctool/client_data/entities/" + fileName + ".txt?_=" + sdp_app.BUILD_NUMBER),//No I18N
			async: false,
			ignorefailuremessage: true,
			success: function (msg, status, xhr) {
				indexJson = JSON.parse(xhr.responseText);
				indexJson.lastModified = new Date(xhr.getResponseHeader("Last-Modified")).getTime();//No I18N
				APISidebar.constructLeftNav();
			},
			error: function (xhr, ajaxOptions, thrownError) {

				APISection.readJsonFile('entities/RestApi', function (arry) {//No I18N
					indexJson = arry[0];
					indexJson.lastModified = arry[1];
					APISidebar.constructLeftNav();
			    });
			}
		});

		setTimeout(function(){
			APISection.docElmentsEventBindings();
		},3000);
	},
	/**
	 * Reads a JSON file and executes a callback with the file data.
	 * @param {string} fileName - The name of the file to read.
	 * @param {Function} callback - The callback function to execute with the file data.
	*/
    readJsonFile : function(fileName, callback) {

		try {
			sdpAjax({
				type: "get",//No I18N
				url: encodeURI("/doctool/client_data/" + fileName + ".txt?_=" + sdp_app.BUILD_NUMBER),//No I18N
				ignorefailuremessage: true,
				success: function (data, status, request) {
					var responseHeadrs = request.getResponseHeader("Last-Modified"); //No I18N
					var fileDetails = [];
					fileDetails.push(data);
					fileDetails.push(new Date(responseHeadrs).getTime());
	
					callback(fileDetails);
				}
			});
		} catch (ex) {}
	},
	/**
	 * Retrieves the last modified time of a file.
	 * @param {string} fileName - The name of the file.
	 * @returns {number} - The last modified time in milliseconds.
	 */
	getFileModifiedTime: function(fileName) {

		var responseHeadrs = sdpAjax({
			type: "get",//No I18N
			url: encodeURI("/doctool/client_data/entities/" + fileName + ".txt?_=" + sdp_app.BUILD_NUMBER),//No I18N
			ignorefailuremessage: true,
			async: false
		}).getResponseHeader("Last-Modified"); //No I18N

		return new Date(responseHeadrs).getTime();

	},
	/**
	 * Retrieves the index file and constructs the left navigation.
	 */
	getIndexFile : function() {

		var fileName = "RestApi";	//No I18N
		sdpAjax({
			type: "get",//No I18N
			url: encodeURI("/doctool/client_data/entities/" + fileName + ".txt?_=" + Math.random()),//No I18N
			ignorefailuremessage: true,
			async: false,
			success: function (msg, status, xhr) {
				indexJson = JSON.parse(xhr.responseText);
				indexJson.lastModified = new Date(xhr.getResponseHeader("Last-Modified")).getTime();//No I18N
				APISidebar.constructLeftNav(true);
			},
			error: function (xhr, ajaxOptions, thrownError) {
				   APISection.readJsonFile('entities/RestApi', function (arry) {//No I18N
					indexJson = arry[0];
					indexJson.lastModified = arry[1];
					APISidebar.constructLeftNav(true);
				});
			}
		});
	},
	/**
	 * Retrieves the file name for the given entity.
	 * @param {string} entity - The entity name.
	 * @returns {string} - The file name.
	 */
	getFileName : function(entity) {

		var entDet = APISection.findJson(entity);
		var fileName = '';
		try {
			fileName = indexJson.entities[entDet[0]][entDet[1]].fileName || entity;
		}
		catch (e) { }
		return fileName;
	},
	/**
	 * Finds the JSON object for the given entity.
	 * @param {string} entity - The entity name.
	 * @returns {Array} - An array containing the group and index of the entity.
	 */
	findJson: function(entity) {

		for (var group in indexJson.entities) {
			for (var i in indexJson.entities[group]) {
				if (indexJson.entities[group][i].entityName == entity) { return [group, i]; }
			}
		}
		return [];
	},
	/**
	 * Finds the operation JSON object for the given entity and operation name.
	 * @param {string} entity - The entity name.
	 * @param {string} operationOldName - The old name(previous name) of the operation.
	 * @returns {Object} - The operation JSON object.
	 */
	findOperationJson: function(entity, operationOldName) {

		var operationsArray = contentsJson[entity].operations;
		var operJsonData = operationsArray.find(item => item.disp_desc == operationOldName);
		if(operJsonData){ return operJsonData;}
		return {};
	},
	/**
	 * Checks if the provided string is in JSON format.
	 * @param {string} data - The string to check.
	 * @returns {boolean} - True if the string is JSON, false otherwise.
	 */
	isJSON : function(data) {
		try {
			JSON.parse(data);
			return true;
		} catch (e) { return false; }
	},
	/**
	 * Hides other HTML elements in the right panel except the specified ones.
	 * @param {Array<string>} showList - The list of elements to show.
	 */
	hideOtherElements: function(showList) {

		var hideList = ['attr-list', 'api-response', 'form-element', 'check-output']; //No I18N
		hideList.map(function(item,i) {
			if (i < hideList.length && showList.indexOf(item) == -1 && jQuery('#api-section .preview-panel').find('.' + item)[0]) {
				jQuery('#api-section .preview-panel').find('.' + item).hide();//No I18N
			}
		});
	},
	/**
	 * Handles file browsing and updates the file list.
	 * @param {HTMLElement} e - The file input element.
	 */
	browseFile : function(e) {

		var apiPanel = '#api-section';	//No I18N
		var eleId = jQuery(e).attr('id');//No I18N
		var filesTemp = document.getElementById(eleId).files;
	
		if (files[apiPanel] == undefined) { files[apiPanel] = []; }
	
		var uploads = jQuery('#filesArea').text().split(" ")[1];
		if (uploads == undefined) {
			var f = filesTemp[0];
			files[apiPanel].push(filesTemp[0]);
			fileUniqueCount = e_html(fileUniqueCount);
			f.fileUniqueCount = fileUniqueCount;
			jQuery('#filesArea').append('<div class="import-files import-files-progress">' + e_html(f.name) + ' <span class="common-sprite icon-sm common-close-icon3 floatright" title='+translate("sdp.common.close")+'></span><span class=hide>' + fileUniqueCount + '</span></div>');
			fileUniqueCount = fileUniqueCount + 1;
			jQuery('#' + eleId).val("");
			APISection.projectorichange();
		}
	},
	/**
	 * Adjusts the layout for file upload elements.
	 */
	projectorichange : function() {
		if (jQuery('.import-drag-mainarea').width() <= 1240) {
			jQuery('.import-drag-mainarea .import-files').css('width', (jQuery('.import-drag-mainarea').width() - (40)) / 3); //No I18N
			jQuery('.import-file').css('width', 'auto'); //No I18N
		} else {
			jQuery('.import-drag-mainarea .import-files').css('width', (jQuery('.import-drag-mainarea').width() - (50)) / 4); //No I18N
			jQuery('.import-file').css('width', 'auto'); //No I18N
		}
	},
	/**
	 * Removes a selected file from the file list.
	 * @param {HTMLElement} ele - The element representing the file to remove.
	 */
	removeFileSelection : function(ele) {

		var apiPanel = '#api-section'; //No I18N
		var eleId = jQuery(ele).parent().find('.hide').text();
		
		files[apiPanel].map(function(item,i) {
			if ( i < files[apiPanel].length && parseInt(eleId) == parseInt(item.fileUniqueCount)) {
				files[apiPanel].splice(i, 1);
			}
		});
	},
	/**
	 * Replaces dynamic values in the provided text.
	 * @param {string} textToReplace - The text containing dynamic values.
	 * @returns {string} - The text with dynamic values replaced.
	 */
	replaceDynamicValues : function(textToReplace) {

		if (loggedInUserEmailIdOrName != null && loggedInUserEmailIdOrName != 'null') {
			textToReplace = textToReplace.replace(/##email##/g, loggedInUserEmailIdOrName);
		} else {
			textToReplace = textToReplace.replace(/"email_id": "##email##"/g, '"name":"' + loggedInUserEmailIdOrName + '"');
		}
    	return textToReplace;
    },
	/**
	 * Retrieves a JSON file for the given entity and executes a callback.
	 * @param {string} entity - The entity name.
	 * @param {string} fileName - The file name (optional).
	 * @param {Function} callback - The callback function to execute.
	 */
	getJsonFile : function(entity, fileName, callback) {

		if (!fileName) { fileName = APISection.getFileName(entity); }
	
		APISection.readJsonFile('entities/' + fileName, function (arry) {//No I18N
	
		contentsJson[entity.replace(/ /g, '_')] = arry[0];
		contentsJson[entity.replace(/ /g, '_')].lastModified = arry[1];
	
		callback(entity);
	
		});
	},
	/* Copies the API response to the clipboard. */
	copyResponse : function() {
		var temp = document.createElement("textarea");
		temp.textContent = this.responseCodeMirror.getValue();
		temp.style.position = "fixed";
		document.body.appendChild(temp);
		window.getSelection().selectAllChildren(temp);
		document.execCommand("copy"); //No I18N
		document.body.removeChild(temp);
		showalert('success', translate("msteams.copied"), 'isAutoHide=true');//No I18N
	},
	/* Binds event handlers for document elements.*/
    docElmentsEventBindings : function(){
		jQuery(".api-doc").off("click").on("click","#searchattr",function(){ //No I18N
			APIactions.callTableSearch(this);
		}).on("click","#code",function(){
			APICode.showCode();
		}).on("click","[data-name='copyResponse']",function(){
			APISection.copyResponse();
		}).on("change","#filesDrag",function(){
			APISection.browseFile(this);
		}).on("submit","[data-name='api-form']",function(){
			return false;
		}).on("click","[data-name='intro']",function(){
		  APIactions.loadAPIpage('/html/doctool/api-intro-page.html'); //No I18N
		  APIactions.toggleSidebarLinks(this);
		}).on("click","[data-name='APIintro']",function(){
		  APIactions.toggleSidebarLinks(this);
		});
	
		jQuery("#code-dialog").off("click").on("click","#copytoclipboard",function(){ //No I18N
			APICode.copyToClipboard();
		}).on("click","#downloadAsFile",function(){
			APICode.downloadCodeAsFile();
		});
	},
	/* Retrieves header data and updates the UI accordingly.*/
	getHeaderData : function() {
		sdpAjax({
		  cache: false,
		  async: false,
		  ignorefailuremessage: true,
		  url: "/servlet/AJaxServlet?action=GetHeaderDetails",//NO I18N
		  success: function (data) {
			if (data.esm_details.multiple_instances) {
			  data.portaldata = APISection.loadAccessPortals();
			}
			licenseModules = data.license_modules;
			APISection.renderHeaderLogo(data);
			APISection.portalUpdateCall();
		  }
		});
	},
	/**
	 * Renders the header logo with the provided data.
	 * @param {Object} data - The data for rendering the header logo.
	 */
	renderHeaderLogo : function(data) {
		renderhbs('#doctool-header', 'sdpheader_doctool', data, false, 'doctool'); // NO I18N
	},
	/* Handles portal update calls and reloads the page.*/
	portalUpdateCall : function() {
		jQuery("#helpdesksection li[data-id]").on('click', function () {	//NO I18N
		var pId = jQuery(this).attr('data-id');	//NO I18N
		sdpAjax({
			type: 'PUT', //NO I18N 
			url: encodeURI('/api/v3/change_portal?portalid=' + pId), //NO I18N
			data: null,
			ignorefailuremessage: true,
			dataType: 'text', //NO I18N 
			success: function (responseJson) {
			  window.location.reload();
			},
			error: function (responseJson) {
			 showalert('failure',translate('doctool.helpdesk.error'), 'isAutoHide=true'); //NO I18N
			}
		});
		});
	},
	/**
	 * Loads accessible portals and returns the data.
	 * @returns {Object} - The accessible portals data.
	 */
	loadAccessPortals: function() {
		var op = {};
		sdpAjax({
		  url: '/api/v3/accessibleportals', // No I18N
		  success: function (resp) {
			op = resp;
		  },
		  async: false
		});
		return op;
	}
};
