/* $Id$ */

/**
 * docutils.js 
 *
 *
 * Created: Mon 21 Mar 2005 16:10
 *
 * @author <a href="mailto: vijayr">vijayr</a>
 * @version
 **/
 
DocUtils.serverName = null;
DocUtils.serverPort = null;
DocUtils.contextPath = null;

function DocUtils(editor) {
	this.editor = editor;
	this.oldinnerHTML = null;
	this.xmlString = null;
	this.docId = null;

	this.setXmlString = _DocUtils_setXmlString;
	this.setDocId = _DocUtils_setDocId;
	
}

DocUtils.initializeEditor = function(innerHTML, docInfo, fullscreen) {

 	//setTimeout(function() { initialize() ; }, 100);

	var editor = new AdvHTMLArea("ta");//No i18N
 	//editor.setXmlString(xmlString);
 	editor.setDocId(docInfo.DOCUMENT_ID);
	if (fullscreen) {
		editor._editor.config.hideSomeButtons(" popupeditor ");//No i18N
	}
	editor.innerHTML = innerHTML;
 	editor.generate();
	editor.setServerUrl("http://"+DocUtils.serverName+":"+DocUtils.serverPort+DocUtils.contextPath+"/");//No i18N

	var verId = docInfo.VERSION;
	editor.verId = verId;

	editor.docName = docInfo.DOCUMENT_NAME;
	editor.docAuthor = docInfo.AUTHOR;

	return editor;

}

function _DocUtils_setXmlString(xmlString) {
	this.xmlString = xmlString;
}

function _DocUtils_setDocId(docId) {
	this.docId = docId;
}

DocUtils.editInFullScreen = function(docId, editor) {

	var url = "fullscreen.cc?DOCUMENT_ID="+ encodeURIComponent(docId); //No i18N
	
	if (editor) {
		window.editor = editor;
	}
	else {
		var divNode = document.getElementById("htmlview");
		window.innerHTML = divNode.innerHTML;
	}
	//openURL(url,"_blank","scrollbars=yes,resizable=yes,status=yes");
	openURL(url, "ha_fullscreen", "toolbar=no,menubar=no,personalbar=no,width=640,height=480,scrollbars=no,resizable=yes");//No i18N
}

DocUtils.saveDocument = function(editor, action,_id,_name,is_sav) {         //is_sav is false for autosave

	//var xmlStringToBeSaved = editor.saveDocument();
	//alert(xmlStringToBeSaved);
	//alert(editor.styleXML);
	/*
	document.saveForm.hiddocId.value = editor.docId;
	document.saveForm.hiddocName.value = editor.docName;
	*/

	_htmlCont=editor._editor._iframe.contentWindow.document;   //Removing script tags 
	len=_htmlCont.getElementsByTagName("script").length;//No i18N
	for(i=0;i<len;i++)   
	{
	_htmlCont.getElementsByTagName("script")[0].parentNode.removeChild(_htmlCont.getElementsByTagName("script")[0]);
	}
	if(is_sav){

		if(Writer._total=="")  document.saveForm.hidHtml.value=editor._editor.getInnerHTML();
		else  document.saveForm.hidHtml.value=Writer._total;
		Writer.aftersave=function()
		{            
		Writer.wordCount(Writer.editor.getText(Writer.editor._editor._iframe.contentWindow.document.body),true,true);
		}
	}
	else document.saveForm.hidHtml.value=editor._editor.getInnerHTML();

	if(_id && _name){  // book marklet documents
	document.saveForm.hiddocId.value=_id;
	document.saveForm.hiddocName.value=_name;
	}else{
	document.saveForm.hiddocId.value = Writer.currentDocInfo.DOCUMENT_ID;
	document.saveForm.hiddocName.value = Writer.currentDocInfo.DOCUMENT_NAME;
   	}	
	document.saveForm.action=action;
	document.saveForm.method="Post";//No i18N
	document.saveForm.enctype="multipart/form-data";//No i18N
	document.saveForm.submit();
	
}

DocUtils.saveTemplate = function(editor, action) {

        document.saveTemp.hidHtml.value = editor._editor.getInnerHTML();
        document.saveTemp.hiddocId.value = Writer.tempid;
        document.saveTemp.hiddocName.value = Writer.tempname;

        document.saveTemp.action=action;
        document.saveTemp.method="Post";//No i18N
        document.saveTemp.enctype="multipart/form-data";//No i18N
        document.saveTemp.submit();

}

DocUtils.customSaveDocument = function(content,docId,docName, action) {

        //var xmlStringToBeSaved = editor.saveDocument();
        //alert(xmlStringToBeSaved);
        //alert(editor.styleXML);
        document.saveForm.hidHtml.value = content;
        document.saveForm.hiddocId.value = docId;
        document.saveForm.hiddocName.value = docName;

        document.saveForm.action=action;
        document.saveForm.method="Post";//No i18N
        document.saveForm.enctype="multipart/form-data";//No i18N
        document.saveForm.submit();

}

DocUtils.load_iframe = function(editor, callfn) {
	var saveError = 0;
	callfn(saveError,document.getElementById("hid_iframe").contentWindow);
}


