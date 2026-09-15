/**
 * APICode is an object that provides functionality for displaying and managing 
 * API code snippets in various programming languages. It includes methods for 
 * constructing code snippets, handling language-specific templates, managing 
 * a code editor, and facilitating user interactions such as copying or downloading 
 * the generated code.
 * 
 * Properties:
 * - `allLangCodeChanges` (string): Stores code changes for all languages.
 * - `reqData` (object): Stores request data including method, URL, input data, 
 *   and operation name.
 */
var APICode = {
    allLangCodeChanges :"",
	reqData : {
		method : "",
		url : "",
		input_data : null,
		operation_name : null
	},
	/* Displays the code snippet dialog, initializes the editor and handles language-specific tab changes*/ 
	showCode : function(){

		var code = "",reqData = APICode.reqData;
		APICode.allLangCodeChanges = {};
		APICode.readAPIData(reqData);
		jQuery("#code-dialog").dialog("open"); //No I18N
		var lang = jQuery("#tabs-primary .active").attr("data-name"); //No I18N
		// To hide deluge sdtab for attachemnent entity which has fileInput
		var ele = jQuery("[data-name='deluge']") ,pythonele= jQuery("[data-name='python']"); //No I18N
		if(reqData.fileinput){
			ele.hide();
			if(lang == "deluge"){
				pythonele.addClass('active');
				lang = 'python'; //No I18N
			}
		}
		else if(reqData.fileinput == undefined){
			ele.show();
			if(lang == "deluge"){
			pythonele.removeClass('active');
			ele.addClass('active');
			}
		}
		
		jQuery("#code-dialog #tabs-primary").on('shown.sdp.sdtab',function(e){//No I18N
			setTimeout(function(){
				APICode.changeLanguage(jQuery(e.target).closest("li").data("name"));//No I18N
			},100);
		});
		var operationName = jQuery("#api-section > div.api-text > div.pos-rel h1").text().trim(); //No I18N
		jQuery("span.ui-dialog-title").text(operationName+" - "+translate("doctool.code.snippet")); //No I18N
		code = APICode.constructCode(reqData,lang);
		APICode.handleEditor(lang,code);
		
		jQuery( "#code-dialog" ).on( "dialogclose", function( event) { //No I18N
		
			if(jQuery("#CMEditor > .CodeMirror").length){
				jQuery("#CMEditor > .CodeMirror")[0].parentNode.removeChild(jQuery("#CMEditor > .CodeMirror")[0]);
			}
		} );
		
	},
	/* Reads API data from the UI and populates the `reqData` object */
	readAPIData : function(reqData){
 
		reqData.method  = jQuery("#http_method").text().trim().toLowerCase(); //No I18N
		
		var baseUrl = document.location.origin;
		
		var path = encodeURI(jQuery("#path").val().trim()); //No I18N
		var input_data = jQuery("#input_data").val(); //No I18N
		var entity = jQuery('#entity-of-operation').val(); //No I18N
		var entityGroup = jQuery('#entity-group').val(); //No I18N
		// To fetch operation Json
		var oldOperationName = jQuery("#api-section > div.api-text > div.pos-rel h1").text().trim(); //No I18N
		var JsonData = APISection.findOperationJson(entity, oldOperationName);
		reqData.fileinput = JsonData.fileinput; 
		reqData.input_data = input_data != null ? input_data : null;
		
		path = path.replace(/%7B/g, '{');
		path = path.replace(/%7D/g, '}');
		var matches = path.match(/{[a-z_\-]+}/g);
		if(matches){
			matches.map((match, i) => {
				if (i < matches.length) {
					let id = match.substring(1, match.length - 1).trim();
					let val = jQuery("#"+id).val().trim();

					if (val !== "") {
						path = path.replace(match, val);
					}
			   }
			});
		}
		
		reqData.url = baseUrl + path;
		
		var operation_name = jQuery("#other_parameters").val(); //No I18N
		reqData.operation_name = operation_name != null ? operation_name.trim().split('=')[1] : null;
		
		var portalId = sdp_app.PORTAL_ID;		
		if( APISection.checkIfAPIOverODFramework(entity,entityGroup)){
			reqData.headers = '{\"authtoken\":\"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX\",\"accept\" : \"application/vnd.manageengine.sdp.v3+json\"' 
			+ (sdp_app.IS_SDP ? ',\"PORTALID\":\"' + portalId + '\"' : '') + '}'; //No I18N
		}	
		else {
			reqData.headers = '{\"authtoken\":\"XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX\"' 
			+ (sdp_app.IS_SDP ? ',\"PORTALID\":\"' + portalId + '\"' : '') + '}'; //No I18N
		}
		
	},
	/** Constructs the code snippet for the selected language. */
	constructCode : function(reqData,language){

		var code = '';
		switch(language){
			case "python":   //No I18N
				code = APICode.constructPython();
				break;
			case "powershell": //No I18N
				code = APICode.constructPowershell();
				break;
			case "deluge": //No I18N
				code = APICode.constructDeluge();
				break;
			default:
				return "";
		}
		code = APICode.replacePlaceHolders(code,reqData,language);
		
		return code;
		
	},
	/** Constructs the Python code snippet template. */
	constructPython : function(){

        var reqData = APICode.reqData;
		var python = {
			helpcontent : "#Python version - 3.8\n"+ //No I18N
						  "#This script requires requests module installed in python.\n", //No I18N
			fileModule : "import mimetypes\n", //No I18N
			modules : "import requests\n \n", //No I18N
			url : "url = \"{{url}}\"\n", //No I18N
			init : "params = None\n"+ //No I18N
				   "data = None\n", //No I18N
			headers : "headers ="+reqData.headers+ "\n", //No I18N
			params : "input_data = '''{{input_data}}'''\n"+ //No I18N
						"params = {'input_data': input_data}\n", //No I18N
			data : "input_data = '''{{input_data}}'''\n"+ //No I18N
				   "data = {'input_data': input_data}\n", //No I18N
			codeContent :`fileName = "<file_name>" #data.csv\nfilePath = "<file_path>" #"C:\\\\Users\\\\adams\\\\Downloads\\\\data.csv"\nfileType = mimetypes.guess_type(filePath)\n\n#Replace fileName, filePath, fileType with the exact values\n\nfiles = []\nfileObj = ('input_file', (fileName,open(filePath,'rb'), fileType))\nfiles.append(fileObj)\ndata = files\n` ,//No I18N
			data_v1 : "input_data = '''{{input_data}}'''\n"+ //No I18N
						 "data = {\n'INPUT_DATA': input_data,\n"+ //No I18N
								   "'OPERATION_NAME' : '{{operation_name}}',\n"+ //No I18N
								   "'format' : 'json'\n"+ //No I18N
								 "}\n", //No I18N
			operation_v1 : "data = {\n'OPERATION_NAME' : '{{operation_name}}',\n"+ //No I18N
										 "'format' : 'json'\n"+ //No I18N
										 "}\n", //No I18N
			httprequest : "response = requests.{{method}}(url,headers=headers,params=params,data=data,verify=False)\n", //No I18N
			httprequest_params : "response = requests.{{method}}(url,headers=headers,params=params,verify=False)\n", //No I18N
			httpFile_data : "response = requests.{{method}}(url,headers=headers,files=data,verify=False)\n", //No I18N
			httprequest_data : "response = requests.{{method}}(url,headers=headers,data=data,verify=False)\n", //No I18N
			httprequest_nodata : "response = requests.{{method}}(url,headers=headers,verify=False)\n", //No I18N
			response : "print(response.text)\n" //No I18N
		
		}
		
		var code = '';
		
		if(reqData.method == 'get' && reqData.input_data != null){ //No I18N
			code += python.helpcontent + python.modules + python.url + python.headers + python.params + python.httprequest_params + python.response;
		}
		else if(reqData.fileinput){
			code += python.helpcontent + python.fileModule + python.modules  + python.url + python.headers + python.codeContent + python.httpFile_data + python.response;
		}
		else if(reqData.input_data == null && reqData.operation_name == null){
			code += python.helpcontent + python.modules + python.url + python.headers + python.httprequest_nodata + python.response;
		}
		else if(reqData.input_data != null && reqData.operation_name == null){
			code += python.helpcontent + python.modules + python.url + python.headers + python.data + python.httprequest_data + python.response;
		}
		else if(reqData.input_data == null && reqData.operation_name != null){
			code += python.helpcontent + python.modules + python.url + python.headers + python.operation_v1 + python.httprequest_data + python.response;
		}
		else if(reqData.input_data != null && reqData.operation_name != null){
			code += python.helpcontent + python.modules + python.url + python.headers + python.data_v1 + python.httprequest_data + python.response;
		}
		
		return code;
	},
	/** Constructs the PowerShell code snippet template. */
	constructPowershell : function(){

        var reqData = APICode.reqData;
		var powershell = {
			helpcontent : "#Powershell version - 5.1\n", //No I18N
			url : "$url = \"{{url}}\"\n", //No I18N
			headers : "$technician_key = @"+reqData.headers+"\n", //No I18N
			fileheaders : "$technician_key = @"+reqData.headers.replace(':','=')+"\n", //No I18N
			data : "$input_data = @'\n{{input_data}}\n'@\n"+ //No I18N
				   "$data = @{ 'input_data' = $input_data}\n", //No I18N
			codeContent : `\n$fileName = "<file_name>" #data.csv\n$FilePath  = "<file_path>" #C:\\Users\\adams\\Downloads\\$fileName\n$fileBytes = [System.IO.File]::ReadAllBytes($FilePath);\n$fileEnc = [System.Text.Encoding]::GetEncoding('UTF-8').GetString($fileBytes);\n$boundary = [System.Guid]::NewGuid().ToString();\n$LF = "\`r\`n";\n\n$bodyLines = (\n\t"--$boundary",\n\t"Content-Disposition: form-data; name=\`"input_file\`";\n\tfilename=$fileName",\n\t"Content-Type: application/octet-stream$LF",\n\t$fileEnc,\n\t"--$boundary--$LF"\n)\t-join $LF\n\n$data = $bodyLines;\n\n#Write-Host $data;\n`, //No I18N  
			data_v1 : "$input_data = @'\n{{input_data}}\n'@\n"+ //No I18N
					  "$data = @{ 'INPUT_DATA' = $input_data,\n"+ //No I18N
								 "'OPERATION_NAME' = '{{operation_name}}',\n"+ //No I18N
								 "'format' = 'json'\n"+ //No I18N
								   "}\n", //No I18N
			operation_v1 : "$data = @{ 'OPERATION_NAME' = '{{operation_name}}',\n"+ //No I18N
								 "'format' = 'json'\n"+ //No I18N
								   "}\n", //No I18N
			httpFile_data : '$response = Invoke-RestMethod -Uri $url -Method {{method}} -ContentType "multipart/form-data; boundary=`"$boundary`"" -Body $data -Headers $technician_Key\n', //No I18N
			httprequest : "$response = Invoke-RestMethod -Uri $url -Method {{method}} -Body $data -Headers $technician_Key -ContentType \"application/x-www-form-urlencoded\"\n", //No I18N
			httprequest_nodata:"$response = Invoke-RestMethod -Uri $url -Method {{method}} -Headers $technician_Key\n", //No I18N
			response : "$response\n" //No I18N
		}
		
		var code = '';
		
		if(reqData.fileinput){
			code += powershell.helpcontent + powershell.url + powershell.headers + powershell.codeContent + powershell.httpFile_data + powershell.response;
		}
		else if(reqData.input_data == null && reqData.operation_name == null){
			code += powershell.helpcontent + powershell.url + powershell.headers + powershell.httprequest_nodata + powershell.response;
		}
		else if(reqData.input_data != null && reqData.operation_name == null){
			code += powershell.helpcontent + powershell.url + powershell.headers + powershell.data + powershell.httprequest + powershell.response;
		}
		else if(reqData.input_data == null && reqData.operation_name != null){
			code += powershell.helpcontent + powershell.url + powershell.headers + powershell.operation_v1 + powershell.httprequest + powershell.response;
		}
		else if(reqData.input_data != null && reqData.operation_name != null){
			code += powershell.helpcontent + powershell.url + powershell.headers + powershell.data_v1 + powershell.httprequest + powershell.response;
		}
		
		return code;
	},
	/** Constructs the Deluge code snippet template. */
	constructDeluge : function(){

		var reqData = APICode.reqData;
		var deluge = {
			helpcontent : "// Deluge Sample script\n", //No I18N
			url : "url = \"{{url}}\";\n", //No I18N
			headers : "headers = "+reqData.headers+";\n", //No I18N
			params : "input_data = {{input_data}};\n"+ //No I18N
						"params = {\"input_data\": input_data};\n", //No I18N
			params_v1 : "input_data = {{input_data}};\n"+ //No I18N
						   "params = {\n\"INPUT_DATA\": input_data,\n"+ //No I18N
								   "\"OPERATION_NAME\" : \"{{operation_name}}\",\n"+ //No I18N
								   "\"format\" : \"json\"\n"+ //No I18N
								 "};\n", //No I18N
			operation_v1 : "params = {\n\"OPERATION_NAME\" : \"{{operation_name}}\",\n"+ //No I18N
										 "\"format\" : \"json\"\n"+ //No I18N
										 "};\n", //No I18N
			httprequest : "response = invokeurl\n[\n\turl: url\n\ttype: {{method}}\n\theaders: headers\n];\n", //No I18N	   	          		
			httprequest_params : "response = invokeurl\n[\n\turl: url\n\ttype: {{method}}\n\tparameters: params\n\theaders: headers\n];\n", //No I18N
			response : "info response;\n" //No I18N
		
		}
		
		var code = '';
		
		if(reqData.input_data == null && reqData.operation_name == null){
			code += deluge.helpcontent + deluge.url + deluge.headers + deluge.httprequest + deluge.response;
		}
		else if(reqData.input_data != null && reqData.operation_name == null){
			code += deluge.helpcontent + deluge.url + deluge.headers  + deluge.params + deluge.httprequest_params + deluge.response;
		}
		else if(reqData.input_data == null && reqData.operation_name != null){
			code += deluge.helpcontent + deluge.url + deluge.headers + deluge.operation_v1 + deluge.httprequest_params + deluge.response;
		}
		else if(reqData.input_data != null && reqData.operation_name != null){
			code += deluge.helpcontent + deluge.url + deluge.headers + deluge.params_v1 + deluge.httprequest_params + deluge.response;
		}
		
		return code;
	},
	/** Replaces placeholders in the code template with actual request data. */
    replacePlaceHolders : function(code,reqData,language){

		for(var key in reqData){
			var placeholder = "{{"+key+"}}";
			if(reqData.hasOwnProperty(key) && (code.indexOf(placeholder) != -1)){
				if(language === "deluge" && key === "method"){
					code = code.replace(placeholder,reqData[key].toUpperCase());
				}
				else{
					code = code.replace(placeholder,reqData[key]);
				}
			}
		}
		return code;
	},
	/** Initializes and configures the code editor with the given language and code. */
	handleEditor : function(language,code){

		this.editor = CodeMirror(document.getElementById('CMEditor'), {
			mode: language, 
			lineNumbers: true,
			lineWrapping: true
		});
		this.editor.setSize("100%", "550px");//No I18N
		this.editor.doc.setValue(code);
		
		setTimeout(function(){	
			jQuery(".CodeMirror-gutters").css("left" , "0px"); //No I18N	
			jQuery(".CodeMirror-gutter-wrapper").css("left" , "-30px"); //No I18N	
		},100);	
	},
	/** Handles language changes in the editor and updates the code snippet. */
	changeLanguage : function(lang){

		window.getSelection().removeAllRanges();
		APICode.storeCode();
		if(!APICode.allLangCodeChanges[lang]){
			code = APICode.constructCode(APICode.reqData,lang);	
		}
		else{
			code = APICode.allLangCodeChanges[lang];
		}
		
		this.editor.doc.setValue("");
		this.editor.doc.clearHistory();
		
		this.editor.doc.setValue(code);
		this.editor.setOption('mode', lang);
		
	},
	/** Copies the current code in the editor to the clipboard. */
	copyToClipboard : function() {
		var temp = document.createElement("textarea");
		temp.textContent = this.editor.getValue();
		temp.style.position = "fixed";
		document.body.appendChild(temp);
		window.getSelection().selectAllChildren(temp);
		document.execCommand("copy"); //No I18N
		document.body.removeChild(temp);
		showalert('success',translate("msteams.copied"),'isAutoHide=true');//No I18N
	},
	/** Downloads the current code in the editor as a file. */
	downloadCodeAsFile : function() {

		var title = jQuery("#api-section > div.api-text > div.pos-rel h1").text().trim(); //No I18N
		var type = jQuery("#tabs-primary .active").attr("data-name"); //No I18N
		var types = {
			python: {
				extension: "py" //No I18N
			},
			powershell: {
				extension: "ps1" //No I18N
			},
			deluge: {
				extension: "txt" //No I18N
			}
		};
		type = type || "deluge"; //No I18N
		if(!types[type]) {
			showalert('failure',translate("doctool.invalid.file"), 'isAutoHide=true');//No I18N
			return;
		}
		var code = this.editor.getValue();
		
		var blob = new Blob([code], {
			type: "text/" + type //No I18N
		});
		title && (title = title.split(" ").join(""));
		title += "." + e_html(types[type].extension);
		if (window.navigator && window.navigator.msSaveBlob) {
			window.navigator.msSaveBlob(blob, title);
			return;
		}
		var link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = title;
		document.body.appendChild(link);
		link.dispatchEvent(new MouseEvent('click', {//No I18N
			'view': window,//No I18N
			'bubbles': true,//No I18N
			'cancelable': true//No I18N
		}));
		window.URL.revokeObjectURL(link.href);
		link.remove();
	},
	/** Stores the current code in the editor for the active language. */
	storeCode : function(){
		var lang = this.editor.getOption("mode");
		APICode.allLangCodeChanges[lang] = "";
		APICode.allLangCodeChanges[lang] = this.editor.doc.getValue();
	}
};	
