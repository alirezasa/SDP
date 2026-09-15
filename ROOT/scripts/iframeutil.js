/* $Id$ */

/**
 * utils.js 
 *
 *
 * Created: Mon 12 Sept 2005 16:10
 *
 * @author <a href="mailto: DSM.Ranjith Kumar">ranjithdsm</a>
 * @version
 **/

// Method to attach an inner HTML to a div node.

function IFrameUtils() {
}

IFrameUtils.callOnLoadOfFrame = function(frame, callback) {
	var f = document.getElementById(frame);
	
	var readyState = f.contentWindow.document.readyState
	if (readyState == "complete") {
		callback(f.contentWindow);
	}
	else {
		setTimeout(function() { IFrameUtils.callOnLoadOfFrame(frame, callback) ; } , 100);
	}
}

// Called for the Edit and the view page. 
// Reason is used whether to open the edit menus or not.
IFrameUtils.loadMenu = function(docInfo, action, frame, callback) {

	
		var f = document.getElementById(frame);
		f.onload = function() {
			callback(this.contentWindow);
		}
		
	document.docHidForm.target = frame;
	document.docHidForm.DOCUMENT_ID.value = docInfo.DOCUMENT_ID;
	document.docHidForm.DOCUMENT_NAME.value = docInfo.DOCUMENT_NAME;
	document.docHidForm.action = action;
	document.docHidForm.method="GET";//No i18N
	document.docHidForm.submit();

}


IFrameUtils.loadDocument = function(docId , action, frame, callback) {
	
	
		var f = document.getElementById(frame);
		f.onload = function() {
			callback(this.contentWindow);
		}
	
	document.getElementById("gotoband").style.display="none";//No i18N
	document.getElementById("body").innerHTML = "";
	window.parent.document.docHidForm.target=frame;
	window.parent.document.docHidForm.DOCUMENT_ID.value = docId;
	window.parent.document.docHidForm.action = action;
	window.parent.document.docHidForm.method = "GET";//No i18N
	window.parent.document.docHidForm.submit();
}

IFrameUtils.loadVersionDetails = function (docId, action, frame, callback) {
	
		var f = document.getElementById(frame);
		f.onload = function() {
			callback(this.contentWindow);
		}

	document.historyForm.DOCUMENT_ID.value = docId;
	document.historyForm.target=frame;
	document.historyForm.action = action;
	document.historyForm.method = "GET";//No i18N
	document.historyForm.submit();
}
