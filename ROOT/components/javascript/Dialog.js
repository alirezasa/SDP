/* $Id$ */


var oDialog, doc, srcEl, closeOnEscKey = true, closeOnBodyClick = false, iframeIEHack, closeCallBack = undefined, emptyOnClose = false;
var dialogProperties = new Array("position", "top", "left", "height", "width", "srcElement", "modal", "draggable", "title", "closeButton", "closeOnEscKey", "transitionType", "transitionInterval","closeOnBodyClick","stickyFooter", "closeCallBack", "emptyOnClose"); // No I18N

/**
* <h3>Example:</h3>
*<br/>	Following are the different ways the showDialog method can be used:
*<br/>	1. showDialog( html);
*<br/>	2. showDialog( html, "position=relative" );
*<br/>	3. showDialog( html, "position=absolute, top=50, left=400, height=200, width=400",event);
*<br/>	4. showDialog( html, "position=relative, top=10, left=-30" );
*<br/>	5. showDialog( html, "position=relative, modal=yes, closeOnEscKey=no" );
*<br/>	6. showDialog( html, "position=relative, transitionType=boxIn, transitionInterval=20" );
*<br/>	
*<br/>
*<br/>	@param sHTML 	Mandatory. String that specifies the HTML content to display. 	
*<br/>		   
*<br/>	@param sFeatures Optional. This String parameter is a list of items separated by commas.
*<br/>			Each item consists of an option and a value, separated by an equals sign
*<br/>			(for example, "position=relative, modal=yes"). 
*<br/>
*<br/>
*<br/>
*<br/><h3> The following features are supported.</h3>
*<br/>	
*<br/>		 	<h3>position = { absmiddle | absolute | relative }</h3>	Specifies how the dialog should be positioned.
*<br/>									The "absmiddle" type displays the dialog exactly
*<br/>									at the center of the page. The "absolute" type
*<br/>									displays the dialog based on the "top" and "left"
*<br/>									(mentioned below) parameters provided. The "relative"
*<br/>									type displays it exactly below the element from
*<br/>									where the dialog is opened or from the element id
*<br/>									specified in "srcElement" parameter. [absmiddle]
*<br/>
*<br/>									Note:- "relative" type also accepts "top" and 
*<br/>									"left" parameters where the top and left values are
*<br/>									relative to the element from where the dialog is
*<br/>									opened or from the element id specified in
*<br/>									"srcElement" parameter.
*<br/>
*<br/>			<h3>srcEl = id</h3>					Specifies the HTML element from where the Dialog
*<br/>									should be positioned relatively. The value given is
*<br/>									the HTML element's id.
*<br/>							
*<br/>			<h3>top = number</h3>					Specifies the top position of the dialog, in pixels.
*<br/>									This value is relative to the upper-left corner of
*<br/>									the screen.
*<br/>
*<br/>			<h3>left = number</h3>					Specifies the left position of the dialog, in pixels.
*<br/>									This value is relative to the upper-left corner of
*<br/>									the screen.					
*<br/>			
*<br/>			<h3>height = number</h3>					Specifies the height of the dialog, in pixels.
*<br/>									If not specified, the default value is the content's
*<br/>									height.					
*<br/>
*<br/>			<h3>width = number</h3>					Specifies the width of the dialog, in pixels.
*<br/>									If not specified, the default value is the content's
*<br/>									width.
*<br/>
*<br/>			<h3>modal = { yes | no }</h3>				Specifies whether the dialog should be opened as a
*<br/>									modal dialog or not. [no]
*<br/>			
*<br/>			<h3>title = text</h3>			Specifies the title text to be displayed.
*<br/>									Note: If title is not specified and also if 
*<br/>									closeButton is set as "no", then the dialog box
*<br/>									displays only the HTML content passed and the
*<br/>									surrounding box won't be displayed.
*<br/>
*<br/>			<h3>closeButton = { yes | no }</h3>	Specifies whether the close button should be 
*<br/>									displayed or not. If the value is "no" the button
*<br/>									won't be displayed, vice versa. [yes]
*<br/>
*<br/>			<h3>closeOnEscKey = { yes | no }</h3>	Specifies whether the dialog should be closed or not
*<br/>									when "ESC" key is pressed. [yes]
*<br/>
*<br/>			<h3>draggable = { yes | no }</h3>			Specifies whether dragging/moving the Dialog Box is
*<br/>									allowed or not. [yes]
*<br/>
*<br/>			<h3>transitionType = { boxIn }</h3>	Specifies the type of transition effect to be used
*<br/>									when the dialog is displayed. [boxIn]
*<br/>
*<br/>			<h3>transitionInterval = number</h3>	Specifies the transition interval, in milliseconds.
*<br/>									[10]
*<br/>
*<br/>
*<br/>
*<br/>			<h3>closeOnBodyClick = { yes | no }</h3>Specifies whether to close on click [no]. 
*<br/>									[10]
*<br/>
*<br/>
*<br/>			<h3>closeCallBack = text</h3>			Specifies the callback to be executed after closeDialog.
*<br/>
*<br/>
*<br/>			<h3>emptyOnClose = text</h3>			calls 'emptyDialog' function when closing.
*<br/>
*<br/>
*<br/>Road Map:
*<br/>
*<br/>	Following are the features that will be provided in future:
*<br/>	
*<br/>	1. Restrict Dragging
*<br/>	2. Resizeable Dialogs
*<br/>	3. Close Button hiding
*<br/>	4. Different types of transition effects will be provided
*<br/>
*<br/>**/


function showDialog(content, features, callBackFunc) {
	if (typeof(features) == "undefined"){ var features = "position=absmiddle"; }// No I18N
	features = features.split(","); // No I18N
	
	var featurePresent;
	for (var i = 0; i < dialogProperties.length; i++) {
		featurePresent = false;
		for (var j = 0; j < features.length; j++) {
			if (features[j].indexOf(dialogProperties[i]) >= 0) {
				featurePresent = true;
				break;
			}
 		}
		
		self["dialog_" + dialogProperties[i]] = (featurePresent) ? features[j].substr(features[j].indexOf("=") + 1, features[j].length).trim() : "undefined"; // No I18N
	}
	
	if (document.getElementById("_DIALOG_LAYER") == null) {
		oDialog = document.createElement("DIV");
		oDialog.id = "_DIALOG_LAYER"; // No I18N
		document.body.appendChild(oDialog);
	} else {
		oDialog = document.getElementById("_DIALOG_LAYER");
        oDialog.innerHTML = "";
        oDialog.style.width = "";
        oDialog.style.height = "";
		closeDialog();
	}
	
	var content = '<div id="_DIALOG_CONTENT">' + content + '</div>'; // No I18N
	
	var box = '<table class="DialogBox" border="0" cellspacing="0" cellpadding="0"><tr><td class="boxTL"><img src="/images/spacer.gif" width="24" height="1"></td>'; // No I18N

	if (dialog_draggable != "undefined" && dialog_draggable == "no"){
            box += '<td class="boxHeader">';// No I18N
        } else {
            box += '<td class="boxHeader drag pl10" id="d_box_header">';// No I18N
        } 

	if (dialog_title != "undefined") {
		if (dialog_title.charAt(0) == "'" && dialog_title.charAt(dialog_title.length - 1) == "'"){  // No I18N
			dialog_title = dialog_title.substr(1, dialog_title.length - 2);
                    }
		if (dialog_title.trim().length == 0) {
			dialog_title = "&nbsp;"; // No I18N
                    }
	} else {
            dialog_title = "&nbsp;";// No I18N
        } 

	box += dialog_title + '</td><td class="boxCtrlButtonPane">'; // No I18N
	/**
	 * This code is taken from the SDP repo.
	 */
	if (dialog_closeButton != "undefined" && dialog_closeButton == "no"){ 
        box += '&nbsp;</td>'; // No I18N
    } else if(dialog_closeButton != "undefined" && dialog_closeButton !== "yes"){ // No I18N
		box+=dialog_closeButton;
	}
	else{
        box += '<button type="button" class="dig-close-btn" id="dialog_closeButton"></button></td>';//No i18N
    }
	
	box += '<td class="boxTR"><img src="/images/spacer.gif" width="24" height="1"></td></tr><tr><td class="boxML"><img src="/images/spacer.gif" width="1" height="1"></td><td colspan="2" class="boxContent">' + content + '</td><td class="boxMR"><img src="/images/spacer.gif" width="1" height="1"></td></tr>'; // No I18N
	box += '<tr><td class="boxBL"><img src="/images/spacer.gif" width="1" height="1"></td><td class="boxBC" colspan="2"><img src="/images/spacer.gif" width="1" height="1"></td><td class="boxBR"><img src="/images/spacer.gif" width="1" height="1"></td></tr></table>'; // No I18N
	
	oDialog.style.visibility = "visible"; // No I18N
	/**
	 * This code is taken from the SDP repo.
	 */
	oDialog.style.display = ""; // No I18N
	
	var showInBox = true;
	if (dialog_closeButton != "undefined" && dialog_title == "&nbsp;" && dialog_closeButton == "no"){
	   showInBox = false;
       }

	if (showInBox){ 
		oDialog.innerHTML = "<table cellpadding='0' cellspacing='0'><tr><td height='100%' style='display:block'>" + box + "</td></tr></table>";	 // No I18N
        }else{
		oDialog.innerHTML = "<table cellpadding='0' cellspacing='0'><tr><td height='100%' style='display:block'>" + content + "</td></tr></table>";	 // No I18N
        }
	oDialog.style.position = "absolute"; // No I18N
	//oDialog.style.left = "-1000px"; // No I18N
	oDialog.style.top = "-1000px"; // No I18N
	oDialog.style.zIndex = "100"; // No I18N

	var scriptTags = oDialog.getElementsByTagName("SCRIPT");
	for (var i = 0; i < scriptTags.length; i++) {
		var scriptTag = document.createElement("SCRIPT");
		/**
		 * This code is taken from the SDP repo.
		 */
		scriptTag.type = scriptTags[i].type != "" ? scriptTags[i].type : "text/javascript"; // No I18N
		scriptTag.language = scriptTags[i].language != "" ? scriptTags[i].language : "javascript"; // No I18N
		if (scriptTags[i].src != "") { scriptTag.src = scriptTags[i].src;}
		scriptTag.text = scriptTags[i].text;
		scriptTag.nonce = typeof sdpNonce != "undefined" ? sdpNonce : "rAnd0m";// No I18N
		if (typeof document.getElementsByTagName("HEAD")[0] == "undefined") {
			document.createElement("HEAD").appendChild(scriptTag)
		} else {
			document.getElementsByTagName("HEAD")[0].appendChild(scriptTag);
		}			
	}

	if (browser_opera) {
		var temp = content;
		var styleTags = oDialog.getElementsByTagName("STYLE");
		for (var i = 0; i < styleTags.length; i++) {
			styleTags[i].innerHTML = temp.substring(temp.indexOf("<style>") + 7, temp.indexOf("</style>") - 1); // No I18N
			temp = temp.substring(temp.indexOf("</style>") + 8, temp.length); // No I18N
		}
	}

	if (dialog_width != "undefined") {
		if (browser_ie){	
                    oDialog.childNodes[0].style.width = parseInt(dialog_width) + "px";// No I18N 
                }else if (browser_nn4 || browser_nn6){ 
                    oDialog.childNodes.item(0).style.width = parseInt(dialog_width) + "px";// No I18N
                } 
	}
	
	if (dialog_height != "undefined") {
		if (browser_ie){
                    oDialog.childNodes[0].style.height = parseInt(dialog_height) + "px";// No I18N
                } else if (browser_nn4 || browser_nn6){
                     oDialog.childNodes.item(0).style.height = parseInt(dialog_height) + "px";// No I18N
                } 
	}

	oDialogContent = getObj("_DIALOG_CONTENT"); // No I18N
	
	var left = 0, top = 0;

	if (browser_opera) {
		if (dialog_width != "undefined") {
			oDialogContent.style.width = parseInt(dialog_width) + "px"; // No I18N
		} else {
			oDialogContent.style.width = oDialogContent.offsetWidth + "px"; // No I18N
			oDialog.style.width = oDialogContent.offsetWidth + "px"; // No I18N
		}
	}

	if (browser_nn4 || browser_nn6 || browser_ie) {
		if (dialog_width != "undefined"){
                    oDialogContent.style.width = parseInt(dialog_width) + "px";// No I18N
                } else {
                    oDialogContent.style.width = (oDialogContent.offsetWidth + 20) + "px";// No I18N
                } 
	}

	if (dialog_height != "undefined") {
		if (browser_ie && (parseInt(dialog_height) < oDialogContent.offsetHeight)) {left = -15};
		oDialogContent.style.height = parseInt(dialog_height) + "px"; // No I18N
    }
    oDialogContent.style.overflow = "auto"; // No I18N

	var width = oDialog.offsetWidth;
	var height = oDialog.offsetHeight;
	doc = findDocDim();

	if (dialog_closeOnEscKey != "undefined" && dialog_closeOnEscKey == "no"){
            closeOnEscKey = false;
        }else {
            closeOnEscKey = true;
        }
        
	if (dialog_closeCallBack != "undefined"){
		closeCallBack = dialog_closeCallBack;
	} 

	if (dialog_emptyOnClose != false) {
		emptyOnClose = dialog_emptyOnClose; // SD-111680 fix
	}
	
	if (dialog_closeOnBodyClick != "undefined" && dialog_closeOnBodyClick == "yes"){
            closeOnBodyClick = true;
        }else {
            closeOnBodyClick = false;
        }
	
	if (!browser_opera) {
		if (dialog_modal != "undefined" && dialog_modal == "yes"){
                    freezeBackground();
                }else if (document.getElementById("FreezeLayer") != null) {
                    document.body.removeChild(document.getElementById("FreezeLayer"));// No I18N
                } 
	}

	if (dialog_left != "undefined"){left += parseInt(dialog_left)};
	if (dialog_top != "undefined") {top += parseInt(dialog_top)};

	/* changes for column chooser IE allignment */
	var scrlTop = document.body.scrollTop || document.documentElement.scrollTop;
	var scrlLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
	
	//for chrome dialog position issue
	var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
	if(is_chrome){
		var docH = window.innerHeight;
		var docW = window.innerWidth;
		}
	else{
		var docH = doc.height;
		var docW = doc.width;
	}
	
	if (dialog_position != "undefined" && dialog_position == "relative") {
		if (dialog_srcElement != "undefined") {
                    srcEl = getObj(dialog_srcElement);
                }else if (srcEl == null){
                     srcEl = document.body;
                }
		var obj;
		if(srcEl.id == " "){
			obj = document.getElementById(srcEl.id);
		}
		else{
			obj = srcEl;
		}
		if ((width - (docW - findPosX(obj))) + scrollConst > 0){
			left += findPosX(obj) + ((obj.offsetWidth) ? obj.offsetWidth : 0) - width;
		}
		else{
			left += findPosX(obj);
		}
		var selectorvalid = srcEl.id.length > 0 ? jQuery("#"+srcEl.id) : jQuery(srcEl);
		var heightSelector = selectorvalid.closest('tr'); // No I18N
		
		if ((height - (docH - findPosY(obj))) + scrollConst > 0){
			if(jQuery('.reportlistviewpage-titleinfo').length > 0 && featurePresent == false) {
				var heightNullcheck = heightSelector.length > 0 ? heightSelector.outerHeight() : 0;
				top += findPosY(obj) - height - heightNullcheck;
			}
			else {
				top += findPosY(obj) - height;
			}
		}
		else{
			if(jQuery('.reportlistviewpage-titleinfo').length > 0 && featurePresent == false) {
				var heightNullcheck1 = heightSelector.find('a.publicReport').length > 0 ? heightSelector.find('a.publicReport').outerHeight() : 0;
				top += findPosY(obj) + heightNullcheck1;
			}
			else {
				top += findPosY(obj) + ((obj.offsetHeight) ? obj.offsetHeight : 0) + 2;
			}
		}
	}  
	else if (dialog_position != "undefined" && dialog_position == "absolute") { // No I18N
	
		left += scrlLeft;
		top += scrlTop;		
	} 
	else {
		left = (docW / 2 ) - (width / 2) + scrlLeft;
		top = (docH / 2) - (height / 2) + scrlTop;		
	}

	left = (left > 0) ? left : 0;
	top = (top > 0) ? top : 0;

	if (dialog_transitionType != "undefined") {
		if (dialog_transitionInterval == "undefined") {dialog_transitionInterval = 10;}	
		MC_Effect.init(	{ type : dialog_transitionType, speed : dialog_transitionInterval ,layerId : "_DIALOG_LAYER", layerTop : top, layerLeft : left } ); // No I18N
		MC_Effect.display();		
	} else {
		oDialog.style.left = parseInt(left) + "px"; // No I18N
		oDialog.style.top = parseInt(top) + "px"; // No I18N
	}

	if (browser_ie && !browser_opera) {
		iframeIEHack = document.createElement("IFRAME");
		iframeIEHack.scrolling = "no"; // No I18N
		iframeIEHack.frameBorder = 0;
                if(window["CONTEXT_PATH"] != null)
                {
                   iframeIEHack.src= CONTEXT_PATH + "/framework/html/blank.html"; // No I18N
                }
		else  {
                   iframeIEHack.src = "/framework/html/blank.html"; // No I18N
		}
		iframeIEHack.style.position = "absolute"; // No I18N
		iframeIEHack.style.zIndex = "98"; // No I18N
		iframeIEHack.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)'; // No I18N
		
		if (dialog_modal != "undefined" && dialog_modal == "yes") {
			iframeIEHack.style.width = document.getElementById("FreezeLayer").style.width; // No I18N
			iframeIEHack.style.top = "0px"; // No I18N
			iframeIEHack.style.left = "0px"; // No I18N
		} else { 
			iframeIEHack.style.width = oDialog.offsetWidth + "px"; // No I18N
			iframeIEHack.style.height = oDialog.offsetHeight + "px"; // No I18N
			iframeIEHack.style.top = parseInt(top) + "px"; // No I18N
			iframeIEHack.style.left = parseInt(left) + "px"; // No I18N
		}
		
		document.body.appendChild(iframeIEHack);
	}
	
	if (!browser_opera) {
		if (dialog_modal != "undefined" && dialog_modal == "yes") {
			document.getElementById("FreezeLayer").style.height = (document.body.offsetHeight + document.body.scrollHeight) + "px"; // No I18N
			document.getElementById("FreezeLayer").style.width = (document.body.scrollWidth) + "px"; // No I18N
			if (browser_ie){ iframeIEHack.style.height = document.getElementById("FreezeLayer").style.height;} // No I18N
		}
	}
	
	if(dialog_height != "undefined" && dialog_stickyFooter != "undefined" && dialog_stickyFooter == "yes"){
		var wrapper = oDialog.getElementsByClassName("form-wrapper")[0];
		wrapper.style.height = (parseInt(dialog_height) - 50 )+ "px"; // No I18N
		wrapper.style.overflow = 'auto';
		oDialogContent.style.height = '';
    }
    RemovePageScroll();
	if (callBackFunc){	callBackFunc();}

	/**
	 * Dialog event bindings
	 */
	jQuery("#dialog_closeButton").off('click.closedialog').on('click.closedialog', function(){ // No I18N
		closeDialog();
	})
	jQuery("#d_box_header").off('mousedown.dragdialog').on('mousedown.dragdialog', function(e){ // No I18N
		captureDialog(e);
	})


	return oDialog;
}
// #84865 issueFix Remove page scroll when Dialog box appears with modal(FreezeLayer)  
function RemovePageScroll(){
	if(dialog_modal != "undefined" && dialog_modal == "yes"){  // No I18N
		jQuery('body').addClass('of-h');
	}
}
/**
 *@private
 */
function freezeBackground() {
	var oFreezeLayer = document.createElement("DIV");
	oFreezeLayer.id = "FreezeLayer"; // No I18N
	oFreezeLayer.className = "freezeLayer"; // No I18N
	oFreezeLayer.style.width = "100%"; // No I18N
	oFreezeLayer.style.zIndex = "99"; // No I18N

	document.body.appendChild(oFreezeLayer);
}

var diffLeft=0, diffTop=0;
/**
 *@private
 */
function captureDialog(ev) {
	oDialog.style.cursor = "var(--sdpcursor-move)"; // No I18N
	var scrlTop = document.body.scrollTop || document.documentElement.scrollTop;
	var scrlLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
	
	if (browser_ie) {
		diffLeft = window.event.clientX + scrlLeft - parseInt(findPosX(oDialog));
		diffTop = window.event.clientY + scrlTop - parseInt(findPosY(oDialog));
	} else if (browser_nn4 || browser_nn6) {
		diffLeft = ev.pageX - parseInt(findPosX(oDialog));
		diffTop = ev.pageY - parseInt(findPosY(oDialog));
	}
	
	document.onmousemove = moveDialog;
	document.onmouseup = releaseDialog;
}

/**
 *@private
 */
function moveDialog(ev) {
	clearTextSelection();
	if (browser_ie) {
		var scrlTop = document.body.scrollTop || document.documentElement.scrollTop;
		var scrlLeft = document.body.scrollLeft || document.documentElement.scrollLeft;
		
		var left = window.event.clientX + scrlLeft - diffLeft;
		var top = window.event.clientY + scrlTop - diffTop;
		
		left = (left >= 0) ? left : 0;
		top = (top >= 0) ? top : 0;
	
		if (document.getElementById("FreezeLayer") != null || browser_opera) {
			oDialog.style.left = left + "px"; // No I18N
			oDialog.style.top = top + "px"; // No I18N
		} else {
			oDialog.style.left = iframeIEHack.style.left = left + "px"; // No I18N
			oDialog.style.top = iframeIEHack.style.top = top + "px"; // No I18N
		}
	} else if (browser_nn4 || browser_nn6) {
		oDialog.style.left = ((ev.pageX - diffLeft > 0) ? ev.pageX - diffLeft : 0) + "px"; // No I18N
		oDialog.style.top = ((ev.pageY - diffTop > 0) ? ev.pageY - diffTop : 0) + "px";	 // No I18N
	}
}


/**
 *@private
 */
function releaseDialog() {
	oDialog.style.cursor = "var(--sdpcursor-default)"; // No I18N
	document.onmousemove = null;
	document.onmouseup = null;
}

function closeDialog(callBackFunc) {
	if (oDialog != null && oDialog.style.visibility != "hidden") {
		oDialog.style.visibility = "hidden"; // No I18N
		/**
		 * This code is taken from the SDP repo.
	   */
    oDialog.style.visibility = "none"; // No I18N
		oDialog.style.top = "0";//No I18N
		if (document.getElementById("FreezeLayer") != null) {document.body.removeChild(document.getElementById("FreezeLayer"))};
		if (browser_ie && !browser_opera) {
			document.body.removeChild(iframeIEHack);
			iframeIEHack = null;
		}
		closeOnBodyClick = false;
		//#84865 issuefix
		if(jQuery('body').hasClass('of-h')){
			jQuery('body').removeClass('of-h');
		}

		if (callBackFunc){
			callBackFunc()
		}
		if(typeof emptyDialog === 'function' && emptyOnClose == 'true') {
			emptyDialog()
		} //106491 - issuefix
	}
	if(document.getElementById('_CUSTOMALERTFRAME') != null) {
		document.getElementById("_CUSTOMALERTFRAME").src = '/framework/html/blank.html'; // No I18N
	}
}

document.onkeydown = function(ev) {
	if (browser_ie) {
            var keyCode = window.event.keyCode;
        }else if (browser_nn4 || browser_nn6){
             var keyCode = ev.which;
        }
	
	if (keyCode == 27 && closeOnEscKey == true && oDialog != null && oDialog.style.visibility != "hidden") {
		var cb = window[closeCallBack] ? window[closeCallBack] : undefined; // 106491 - fix
		closeDialog(cb);
	}
}

document.onmousedown = function(ev) {
	if (browser_ie) {
		srcEl = window.event.srcElement;		
		var x = window.event.x;
		var y = window.event.y;
	} else if (browser_nn4 || browser_nn6) {
		srcEl = ev.target;
		var x = ev.pageX;
		var y = ev.pageY;
	}

	if (typeof closeOnBodyClick != "undefined" && closeOnBodyClick == true && oDialog != null && oDialog.style.visibility != "hidden") {
		if ((x < findPosX(oDialog) || x >= findPosX(oDialog) + oDialog.offsetWidth) || (y < findPosY(oDialog) || y >= findPosY(oDialog) + oDialog.offsetHeight)){
                    			closeDialog();
                }
	}
}

var scrollEnd = 0, cnt = 0;

/**
 *@private
 */
function scrollPage() {
	if (cnt <= scrollEnd) {
		document.body.scrollTop += 10;
		cnt += 10;
	} else {
		scrollEnd = cnt = 0;
		clearInterval(scrollInterval);
	}
}


/**
 * Used to show the contents of the url in a dialog.
 * @param sURL		Mandatory. String that specifies the URL to display.
 * @param Features	Optional. Sames as mentioned in showDialog() function
 * <h3>Example:</h3>
 *  showURLInDialog( "InstantFeedback.cc", "position=relative",callBackFunction );	
 */
function showURLInDialog(url, features,callBackFunc) {
	var xmlhttp = getXMLHttpRequest();
        if(parent["USESUBREQESTINDIALOG"])
        {
           if(url.indexOf("SUBREQUEST") == -1)
           {                            
              url = getURLSuffixed(url);
              url += "SUBREQUEST=true"; // No I18N
           }
        }

	xmlhttp.open("GET", url, true); // No I18N
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4) {
			showDialog(xmlhttp.responseText, features,callBackFunc);
		}
	}	
	xmlhttp.send(null);
}
