/* $Id$ */
// ------------------- General Object related methods ---------------------- //

if (document.all)
	var browser_ie=true
else if (document.layers)
	var browser_nn4=true
else if (document.layers || (!document.all && document.getElementById))
	var browser_nn6=true

if (window.navigator.userAgent.toUpperCase().indexOf("OPERA") >= 0)	
	var browser_opera=true;
	
/**
 * Retruns the x position of the given object in the window / screen.
 */
function findPosX(obj) {
	
	var curleft = 0;
	if (document.getElementById || document.all) {
		while (obj.offsetParent) {
			curleft += obj.offsetLeft;
			obj = obj.offsetParent;
		}
	} 
	else if (document.layers) {
		curleft += obj.x;
	}
	return curleft;
}

/**
 * Retruns the x position of the given object in the window / screen.
 */
function findPosY(obj) {
	var curtop = 0;
	if (document.getElementById || document.all) {
		while (obj.offsetParent) {
			curtop += obj.offsetTop;
			obj = obj.offsetParent;
		}
	} else if (document.layers) {
		curtop += obj.y;
	}
	return curtop;
}

function findDocDim() {
	if (browser_ie) {
		return {
    		width : document.body.offsetWidth,
			height : document.body.offsetHeight
		}
	} else if (browser_nn4 || browser_nn6) {
		return {
    		width : window.screen.width - ((scrX - pgeX) + document.body.scrollLeft),
			height : window.screen.height - ((scrY - pgeY) + document.body.scrollTop)
		}
	}
}

var scrollConst = 0;
if (browser_nn4 || browser_nn6) scrollConst = 125;

/**
 * Finding screenTop, screenLeft, pageTop, pageLeft during a particular event (used for Mozilla browser)
 */
var scrX = 0, scrY = 0, pgeX = 0, pgeY = 0, srcElement;
if (browser_ie) {
	document.attachEvent("onclick", popUpListener);//No i18N
} else if (browser_nn4 || browser_nn6) {
	document.addEventListener("click", popUpListener, true);//No i18N
}

function popUpListener(e) {
	if (browser_ie) {
		srcElement = window.event.srcElement;
	} else if (browser_nn4 || browser_nn6) {
		srcElement = e.target;
		scrX = e.screenX;
		scrY = e.screenY;
		pgeX = e.pageX;
		pgeY = e.pageY;
	}
}

/**
 * Retruns the object for the given element id and document object.
 */
function getObj(n,d) {
	var p,i,x; 
	if(!d)
		d=document;

	if((p=n.indexOf("?"))>0&&parent.frames.length) {
		d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);
	}

	if(!(x=d[n])&&d.all){
		x=d.all[n];
	}

	for(i=0;!x&&i<d.forms.length;i++){
		x=d.forms[i][n];
	}

	for(i=0;!x&&d.layers&&i<d.layers.length;i++){
		x=getObj(n,d.layers[i].document);
	}

	if(!x && d.getElementById){
		x=d.getElementById(n);
	}
	return x;
}

/**
 * Creating trim() function and added to String object
 */
String.prototype.trim = function() {
  var x = this;
  x = x.replace(/^\s*(.*)/, "$1");//No i18N
  x = x.replace(/(.*?)\s*$/, "$1");//No i18N
  return x;
}

function reloadAndCloseWindow(additionalParamsToPass)
{
    if(self.parent.window.opener != null)
    {
     	self.parent.window.opener.addRequestParams(self.parent.window.opener.ROOT_VIEW_ID, additionalParamsToPass);
        self.parent.window.opener.refreshCurrentView();
    }
   self.parent.window.close();
}

function enableCustomization(){
	var previousData = stateData[ROOT_VIEW_ID]["_D_RP"];//No i18N
	if(previousData != null){
		stateData[ROOT_VIEW_ID]["_D_RP"] = previousData + "PERSONALIZE=TRUE";//No i18N
	}
	else {
	stateData[ROOT_VIEW_ID]["_D_RP"] = "PERSONALIZE=TRUE";//No i18N
	}
	refreshCurrentView();
}

function enableViewMode(){
	var previousData = stateData[ROOT_VIEW_ID]["_D_RP"];//No i18N
	if(previousData != null){
		stateData[ROOT_VIEW_ID]["_D_RP"] = previousData + "PERSONALIZE=FALSE";//No i18N
	}
	else {
	stateData[ROOT_VIEW_ID]["_D_RP"] = "PERSONALIZE=FALSE";//No i18N
	}
	refreshCurrentView();
}

function showBorder(elementId){
	element = document.getElementById(elementId + "_Border");//No i18N
	element.className = 'showDivBorder';//No i18N
}
function hideBorder(elementId){
	element = document.getElementById(elementId + "_Border");//No i18N
	element.className = 'divBorder';//No i18N
}

function searchViews(searchObject){
	document.getElementById('views').className = 'show';//No i18N
	return updateSearchData('ListViewConfigurations', searchObject);//No i18N
}

function expandCollapse(elemId, imgID){
	var ids = new Array('rmImg', 'avlImg');//No i18N
	var tabs = new Array('_RmTab', '_AvlTab');//No i18N
	if(document.getElementById('_NewTab') != null){
		ids[ids.length] = 'newImg';//No i18N
		tabs[tabs.length] = '_NewTab';//No i18N
	}
	if(document.getElementById('_SearchTab') != null){
		ids[ids.length] = 'srcImg';//No i18N
		tabs[tabs.length] = '_SearchTab';//No i18N
	}
	for(var i = 0; i < tabs.length; i++){
		currId = tabs[i];
		if(currId == elemId){
			if(document.getElementById(elemId).className == 'show'){
				document.getElementById(elemId).className = 'hide';//No i18N
				document.getElementById(imgID).className = 'collapse';//No i18N
				document.getElementById('views').className = 'hide';//No i18N
			}
			else {
				document.getElementById(elemId).className = 'show';//No i18N
				document.getElementById(imgID).className = 'expand';//No i18N
				if(currId == '_SearchTab'){
					document.getElementById('views').className = 'hide';//No i18N
					document.getElementById('orgTab1').className = 'hide';//No i18N
					document.getElementById('orgTab2').className = 'hide';//No i18N
					document.getElementById('dummyTab1').className = 'show';//No i18N
					document.getElementById('dummyTab2').className = 'show';//No i18N
				}
				if(currId == '_AvlTab'){
					document.getElementById('views').className = 'show';//No i18N
					document.getElementById('orgTab1').className = 'show';//No i18N
					document.getElementById('orgTab2').className = 'show';//No i18N
					document.getElementById('dummyTab1').className = 'hide';//No i18N
					document.getElementById('dummyTab2').className = 'hide';//No i18N
					if(stateData["ListViewConfigurations"]){
						updateSearchData('ListViewConfigurations', document.getElementById('groupSearch'));//No i18N
					}
				}
				if(currId == '_RmTab'){
					document.getElementById('views').className = 'hide';//No i18N
					document.getElementById('orgTab1').className = 'show';//No i18N
					document.getElementById('orgTab2').className = 'show';//No i18N
					document.getElementById('dummyTab1').className = 'hide';//No i18N
					document.getElementById('dummyTab2').className = 'hide';//No i18N

				}
				if(currId == '_NewTab'){
					document.getElementById('views').className = 'hide';//No i18N
				}
			}
		}
		else {
			document.getElementById(currId).className = 'hide';//No i18N
			document.getElementById(ids[i]).className = "collapse";//No i18N
		}
	}
}

function enableForm(formName){
	document.getElementById(formName + "ReadMode").className = 'hide';//No i18N
	document.getElementById(formName + "EditMode").className = 'show';//No i18N
}

var customize_uniqueId = null;
/**
 *
 */
function showCustomizeLinks(linksId, id, event,referenceId){
	customize_uniqueId = referenceIds[referenceId];
	linksId = linksId + referenceId;
	getObj(linksId).style.display="block";//No i18N
	getObj(linksId).style.left=findPosX(getObj(id));
	getObj(linksId).style.top=findPosY(getObj(id))+getObj(id).offsetHeight;
}

/**
 *
 */
function hideCustomizationMenu(ev)
{
	// TODO:
	// This is not the way for healthy coding. The links to be removed have
	// been hardcoded. This is because, hiding takes place on click of the
	// body. Two events cannot be fired from there.Hence  the hardcoding.
	// Something needs to be done.
	if (browser_ie){
		currElement=window.event.srcElement;
	}
	else if (browser_nn4 || browser_nn6){
		currElement=ev.target;
	}
	var id = currElement.id;
	if(id.indexOf("ICM") < 0 && customize_uniqueId != null){
		var refId = stateData[customize_uniqueId]["ID"];//No i18N
		var element = document.getElementById("GridCustomizationLinks" + refId);//No i18N
		if(element != null){
			if (getObj("GridCustomizationLinks" + refId).style.display=="block"){
				getObj("GridCustomizationLinks" + refId).style.display="none";//No i18N
			}
		}
		element = document.getElementById("TabCustomizationLinks" + refId);//No i18N
		if(element != null){
			if (getObj("TabCustomizationLinks" + refId).style.display=="block"){
				getObj("TabCustomizationLinks" + refId).style.display="none";//No i18N
			}
		}

	}
}


/*
 *
 */
function openCustomizationWindow(url, params){
	url = url + "&UNIQUEID=" + encodeURIComponent(customize_uniqueId);//No i18N
	window.open(url, customize_uniqueId, params);
}

function openCW(url, type, refId, reqParams, winParams){
	var uId = referenceIds[refId];
	var vName = stateData[uID]["_VN"];//No i18N
	url = url + "?VIEWNAME=" + encodeURIComponent(vName) + "&UNIQUEID=" + encodeURIComponent(uId);//No i18N
	if(type != null){
		url = url + "&TYPE=" + encodeURIComponent(type);//No i18N
	}
	if(reqParams != null){
		url = url + "&" + reqParams;//No i18N
	}
	window.open(url, uId, winParams);
}


function popWindow(url,name,x,y,isResizable)
{

 // To pop upa new window with the given url and dimensions
 var posX = (screen.width/2)-(x/2);
 var posY = (screen.height/2)-(y/2);
 var winPref = "width=" + x + ",height=" + y//No i18N
  + ",innerWidth=" + x + ",innerHeight=" + y//No i18N
  + ",left=" + posX + ",top=" + posY//No i18N
  + ",screenX=" + posX + ",screenY=" + posY//No i18N
  + ",toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=yes,"//No i18N
  + "resizable="+isResizable;//No i18N
  
 var newWin = window.open(url,name,winPref);
 
 if (window.focus)
 {
  newWin.focus();
 }
 
}

/**
 * Transfers the content from the source mesage holder to the destination
 * message holder which are represented by the srcMessageDiv and
 * destMessageDiv. Also by default it sets the scroll bars back to their
 * original position of [0,0]. This can de disabled by setting the initScroll
 * to false.
 *
 * @param	srcMessageDiv		the source message div id.
 * @param	destMessageDiv	the destination message div id.
 * @param	initScroll			true to reset scroll position, false to leave is as such.
 */
function addContentToMessageDiv(srcMessageDiv, destMessageDiv, initScroll){
	var srcObj = document.getElementById(srcMessageDiv);
	var destObj = document.getElementById(destMessageDiv);
	if(srcObj != null && destObj != null){
		destObj.innerHTML = srcObj.innerHTML;
	}
	if(initScroll == null || initScroll){
		document.body.scrollTop = 0;
		document.body.scrollLeft = 0;
	}
}

//Functionality not  used
function promptViewTitleIfReq(cusViewName,frm)
{
	var title = prompt("Enter View Title");//No i18N
	if(title == null)
	{
		return false;
	}
	frm.VIEWNAME.value = title;
	frm.TITLE.value = title;
	return true;
}

function isBrowserSupported()
{
	var agt=navigator.userAgent.toLowerCase();
	this.major = parseInt(navigator.appVersion);
	this.minor = parseFloat(navigator.appVersion);

	this.nav  = ((agt.indexOf('mozilla')!=-1) && (agt.indexOf('spoofer')==-1)
			&& (agt.indexOf('compatible') == -1) && (agt.indexOf('opera')==-1)
			&& (agt.indexOf('webtv')==-1));//No i18N
	this.nav5up = (this.nav && (this.major >= 5));

	this.ie   = (agt.indexOf("msie") != -1);//No i18N
	this.ie5up  = (this.ie && (this.major == 4) && (agt.indexOf("msie 6.0")> 0) );//No i18N
	this.opera = (agt.indexOf("opera") != -1);//No i18N
	if((this.nav5up || this.ie5up) && !this.opera){
		return true;
	}
	else {
		return false;
	}
}

/**
 * Appends either ? or & to the url. Can be used for appending further parameters.
 */ 
function getURLSuffixed(url)
{
    if(url.lastIndexOf('?') == -1)
    {
        url += "?";//No i18N
    }
    else if(url.indexOf('?') > 0 && url.charAt(url.length-1) != '&')
    {
        url += "&";//No i18N
    }
    return url;
}


/**
 * Appends the parameter to the url. Takes care of appending ? or & and
 * also escapes the value. In case paramvalue is null, then url is just returned.
 **/
function appendParamToUrl(url,paramname,paramvalue)
{
  if(paramvalue == null) return url;
  return getURLSuffixed(url)+  paramname + "=" + escape(paramvalue);//No i18N
}


function showMessage(message, result){
	var htmlSnippet = "";//No i18N
	if(result == "true"){
		htmlSnippet = htmlSnippet.concat("<Input type='button' class='successMessage'>");//No i18N
	}
	else {
		htmlSnippet = htmlSnippet.concat("<Input type='button' class='failureMessage'>");v
	}
	htmlSnippet = htmlSnippet.concat(message);
	var insertObj = document.getElementById("messagediv");//No i18N
	insertObj.innerHTML = htmlSnippet;
	insertObj.className = "MessageDiv";//No i18N
}

function getXMLHttpRequest(){
	if (typeof XMLHttpRequest!='undefined') {
		return new XMLHttpRequest();
	}
	var xmlhttp=false;
	try {
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");//No i18N
	} 
	catch (e) {
		try {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");//No i18N
		} 
		catch (E) {
			xmlhttp = false;
		}
	}
	return xmlhttp;
}


/**
 * Finding immediate parent TD in a row
*/
function findTD(oCheckBox) {
	var oCurrTD;
	var oElement = oCheckBox.parentNode;
	while (oElement) {
		if (oElement.tagName == "TD") {
			oCurrTD = oElement;
			break;
		}
		oElement = oElement.parentNode;
	}
	
	return oCurrTD;
}

/**
 * Finding sibilings of a TD tag
*/
function findOtherTD(oCurrTD) {
	var i = 0;
	var oOtherTD = new Array();
	var oPrevTD = oCurrTD.previousSibling;
	while (oPrevTD) {
		oOtherTD[i] = oPrevTD;
		oPrevTD = oPrevTD.previousSibling;
		i++;
	}
	
	var oNextTD = oCurrTD.nextSibling;
	while (oNextTD) {
		oOtherTD[i] = oNextTD;
		oNextTD = oNextTD.nextSibling;
		i++;
	}
	
	return oOtherTD;
}

/**
 * Hiltes selected row
*/
function rowSelect(oCheckBox) {
	var oCurrTD = "";
	oCurrTD = findTD(oCheckBox);
	
	var oOtherTD = new Array();
	oOtherTD = findOtherTD(oCurrTD);
	
	oCurrTD.className = (oCheckBox.checked) ? oCurrTD.className + " select" : oCurrTD.className.substr(0,oCurrTD.className.indexOf("select"));//No i18N
	for (var i = 0; i < oOtherTD.length; i++)
		oOtherTD[i].className = (oCheckBox.checked) ? oOtherTD[i].className + " select" : oOtherTD[i].className.substr(0,oOtherTD[i].className.indexOf("select"));//No i18N
	
	if (oCheckBox.type == 'radio') {
		var currId = oCheckBox.value;
		var oRadio = oCheckBox.form.elements[oCheckBox.name];
		
		for (var i = 0; i < oRadio.length; i++) {
			if (i != oCheckBox.value) {
				oCurrTD = findTD(oCheckBox.form.elements[oCheckBox.name][i]);
				oOtherTD = new Array();
				oOtherTD = findOtherTD(oCurrTD);
				
				if (oCurrTD.className.indexOf("select") >= 0) {
					oCurrTD.className = oCurrTD.className.substr(0,oCurrTD.className.indexOf("select"))
					for (var j = 0; j < oOtherTD.length; j++)
						oOtherTD[j].className = oOtherTD[j].className.substr(0,oOtherTD[j].className.indexOf("select"));//No i18N
				}
			}
		}
	}		
}


/**
 * Hiltes when row is hovered
*/
function rowHover(oTR, bIsHover) {
	for (var i=0; i<oTR.childNodes.length; i++) {
		if (document.all) oTD = oTR.childNodes[i];
		else oTD = oTR.childNodes.item(i);
		
		if (oTD && oTD.tagName=="TD") {
			if (oTD.className.indexOf("select") < 0)
				oTD.className = (bIsHover) ? oTD.className + " hilite" : oTD.className.substr(0,oTD.className.indexOf("hilite"));//No i18N
		}
	}
}

/**
 * Clears text selection
 */
function clearTextSelection() {
	if (document.selection) document.selection.empty();
	else if (window.getSelection) window.getSelection().removeAllRanges();	
}

function checkForAD(form){
	var val = form.j_username.value;
	if(val.indexOf("\\") > 0){
		var val1 = val.substring(0, val.indexOf("\\"));
		var val2 = val.substring(val.indexOf("\\") + 1);
		form.j_username.value = val2;
		var obj = document.createElement("input");//No i18N
		obj.type = "hidden";//No i18N
		obj.value = val1;
		obj.name = "domainName";//No i18N
		form.appendChild(obj);
		alert(form.domainName.value);
	}
}
