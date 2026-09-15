/* $Id$ */

var editfcid = null;
var askstate = false;
var movrfcid = null;
var movrlname = null;
var fcls = 'field-outer-container';//No I18N
var fmcls = 'field-outer-container-hover';//No I18N
var facls = 'field-outer-container-action';//No I18N
var mydiv=null;
var typearr= new Array();
var MainContent = undefined;
typearr[0] = 'newattrib';//No I18N
typearr[1] = 'source-fields';//No I18N
typearr[2] = 'single-line';//No I18N
typearr[3] = 'multi-line';//No I18N
typearr[4] = 'pick-list';//No I18N
typearr[5] = 'Long';//No I18N
typearr[6] = 'DateTime';//No I18N

var myCache=new Array();
function fcm(elem, out) {
	mydiv=elem;
	if(dragging != true && askstate != true) {
		if(selfid != null) {
			docid(selfid).className = fcls;
			selfid = null;
		}
		var cls = elem.className.split(' ')[0];
		var fcid = elem.id;
		if(out && cls.indexOf(fmcls) != -1) {
			elem.className = fcls;
		} else if(!out && cls.indexOf(fmcls) == -1) {
			if(movrfcid) {
				var prevelem = docid(movrfcid);
				if(prevelem && prevelem.className.indexOf(fmcls) != -1) {
					prevelem.className = fcls;
				}
			}
			movrfcid = fcid;
			elem.className = fmcls;

		}
	}
}

function onLoad(){
	MainContent = new GridCustomize("MainContent", "setSeq");//No I18N
	MainContent.regEventByClass("div", "field-outer-container");//No I18N
}


function movrli(elem, ovr) {
	if(dragging == true) {
		return;
	}
	if(ovr) {
		elem.className = 'field-icons-hover';
	} else {
		elem.className = 'field-icons-active';
	}

}


//showing the attribute pop up
function showf(loadDiv) {
	docid(loadDiv).style.visibility = 'hidden';//No I18N
	var typeName = typearr[helem.getElementsByTagName('li').item(0).getAttribute("typeid")];
	var ty = helem.getElementsByTagName('li').item(0).getAttribute("typeid");
	//alert(ty);
	var id = document.NewCIType.ciTypeID.value;	
	var mapTo = document.NewCIType.mapTo.value;	
        var myWidth;
                  var myHeight;
                  if( typeof( window.innerWidth ) == 'number' ) {
                    //Non-IE
                    myWidth = window.innerWidth;
                    myHeight = window.innerHeight;
                  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                    //IE 6+ in 'standards compliant mode'
                    myWidth = document.documentElement.clientWidth;
                    myHeight = document.documentElement.clientHeight;
                  }
                  
                 var top = (myHeight/2)-100;
                 var left = (myWidth/2)-250;
	var url = "";
	if(typeName == 'source-fields'){
		url = '/setup/AddSourceFieldAtt.jsp?ciTypeID='+id+'&typeId='+ty;//No I18N
	}
	else{
		url = '/setup/AddCIAttributes.jsp?mode=getAttribute&ciTypeID='+id+'&typeOfField='+typeName+'&typeId='+ty;//No I18N
	}

	if(mapTo != -1 && mapTo != null){
		url += '&mapTo='+mapTo;//No I18N
	}

	if(typeName == 'source-fields'){
          showURLInDialog(url+"&"+(new Date()).getTime(),"closeButton=no,position=absolute,modal=yes,top=100,left=350");//NO I18N
	}
	else{
		showURLInDialog(url+"&"+(new Date()).getTime(),"closeButton=no,position=absolute,modal=yes,top="+top+",left="+left);//No I18N
	}

}

function dootherworks(sel, hidden) {
	var fclabels = 	docid("formcontainer").parentNode.getElementsByTagName('label');//No I18N
	var fcarr = new Array();
	var cd = 1;
	divs = docid('formcontainer1').getElementsByTagName('div');//No I18N
	if(divs.length > 1) {
		cd = 2;
	}

	var before = -1;
	if(hidden) {
		cd = 2;
		var dl = docid('dotlayer');//No I18N
		if(dl.parentNode.id == 'formcontainer') {
			cd = 1;
		}
		var divs = dl.parentNode.getElementsByTagName('div');
		for(var i=0; i<divs.length; i++) {
			if(divs.item(i) == dl && i != divs.length-1) {
				before = divs.item(i+1).id + "";
				break;
			}
		}
		if(before == -1 && cd == 1) {
			divs = docid('formcontainer1').getElementsByTagName('div');//No I18N
			if(divs.length > 1) {
				before = divs.item(1).id + "";
			}
		}
	}
	editfcid = null;
	var parArr=new Array();
	parArr["cd"]=cd;//No I18N
	parArr["before"]=before;//No I18N
	return parArr;

}


var selfid = null;

function addField(txt,paramsObj) {
	
	//showing the attribute pop up
	if(txt != null && txt != '' && txt.length != 0 && txt.indexOf('error:') == 0) {
		return;
	}
	//closeDialog(); /* Close showDialog window */
	askstate = true;
	removedrag();
	var newfcId = '';
	var bf;
	var before = -1;
	var newdi;
	var cd = 1;
	if(editfcid == null) {
		cd = paramsObj.cd;
		before = paramsObj.before;
		var di = document.createElement('div');
		if(before == -1 || before == '') {
			if(cd == 1) {
				docid("formcontainer").appendChild(di);//No I18N
				di.outerHTML = txt;
				newdi = getLast(true);
			} else {
				docid("formcontainer1").appendChild(di);//No I18N
				di.outerHTML = txt;
				newdi = getLast();
			}
		} else {
			bf = docid(before);
			if(cd == 1 && bf.parentNode == docid("formcontainer1")) {
				docid("formcontainer").appendChild(di);//No I18N
				di.outerHTML = txt;
				newdi = getLast(true);
			} else {
				if(bf) {
					bf.parentNode.insertBefore(di,bf);
					di.outerHTML = txt;
					newdi = getPrev(docid(before));
				} else {
					docid("formcontainer1").appendChild(di);//No I18N
					di.outerHTML = txt;
					newdi = getLast();
				}
			}
		}
	} else {
		docid(editfcid).outerHTML = txt;
		newdi = docid(editfcid);
	}
	var temphtml = docid("formcontainer").innerHTML;//No I18N
	docid("formcontainer").innerHTML = temphtml;//No I18N
	//docid("addfieldinfo").style.display = 'none';
	if(paramsObj && paramsObj['selAppId'])
	{
		var selAppId = paramsObj['selAppId'];//No I18N
		var elem = docid("input" + newfcId);//No I18N
		elem.setAttribute('refAppId',selAppId);

	}
	if(selfid && selfid != null) {
		var ss = docid(selfid);
		if(ss) {
			ss.className = fcls;
		}
	}
	selfid = null;
	if(newdi && newdi.id) {
		fadeIn(newdi.id, 150, clearMovr);
		selfid = newdi.id;
		docid(selfid).className = facls;
		var loadbox = docid(selfid);
		loadbox.innerHTML ="<div id='loadDiv' class='CIprogress'><span>Loading<em></em></span></div>";//No I18N
		//docid('printhere').innerHTML = newdi;
	} else {
		clearMovr();
	}
	showf('loadDiv');//No I18N
}

function clearMovr() {
	MainContent.regEventByClass("div", "field-outer-container");//No I18N
	currOrd = getCurrentOrder();
	askstate = false;
	if(selfid && selfid != null) {
		//docid(selfid).className = fmcls;
	}
}

var fadeOutCall = false;

function getCurrentOrder() {
	var curOrd = MainContent.getCurrentOrderAsString();
	curOrd = curOrd.split("|");
	var seqCount = 1;
	var send = '';
	var colCount = 1;
	for (var j = 1; j < curOrd.length; j++) {
		var result = curOrd[j];
		result = result.split("_");
		for (var i = 0; i < result.length; i++) {
			var fcid = result[i];
			if((fcid == null) || (fcid == '_') || (fcid == '') || isNaN(fcid)) continue;
			send = send + fcid + ":" + (colCount) + ":" + (seqCount++) + ",";//No I18N
		}
		colCount++;
	}
	return send;
}


var mouseLeft;
var mouseTop;
var helem;
var mfobj;
var mainObj=null;
function movefield(ev, fobj)
{
	document.getElementById('DropFieldsInfo').style.display = 'none';
	document.getElementById('dragForm').style.display = 'block';
	mainObj=fobj;
	disableDefaultAction(ev);
	if (document.all) {
		mouseLeft = window.event.clientX + jQuery(window).scrollLeft() - parseInt(findPosX(fobj));
		mouseTop = window.event.clientY + jQuery(window).scrollTop() - parseInt(findPosY(fobj));
	} else {
		mouseLeft = ev.pageX - parseInt(findPosX(fobj));
		mouseTop = ev.pageY - parseInt(findPosY(fobj));
	}
	mfobj = fobj;
	helem = document.getElementById("hiddendiv");
	helem.style.left =  mouseLeft+'px';
	helem.style.top = mouseTop+'px';

	var reqText = fobj.outerHTML;
	// outerHTML will work in IE only. For FF, it will not work. So as a
	// fix, creating a temp div and then adding the required content to
	// that div and then taking the innerHTML to imitate outerHTML
	// functionality.  
	if(!fobj.outerHTML) {
		var element1;
		element1 = document.createElement("div");
		element1.appendChild(fobj.cloneNode(true));
		reqText = element1.innerHTML;
	}

	helem.innerHTML = "<ul class='field-icons'>" + reqText + "</ul>";

	helem.style.width = "205px";

	var divs = docid("formcontainer").getElementsByTagName('div');//No I18N
	var mdiv = null;
	if(divs.length < 2) {
		var divs1 = docid("formcontainer1").getElementsByTagName('div');//No I18N
		if(divs1.length < 2) {
			mdiv = divs.item(0);
		} else {
			divs = divs1;
		}
	}

	if(mdiv == null) {
		mdiv = divs.item(1);
	}
	var dl = docid('dotlayer');//No I18N
	dl.style.width = mdiv.offsetWidth + "px";
	//removemovr();
	movrfcid = null;
	document.onmousemove = movemouse;
	document.onmouseup = dragstop;
}

function movemouse(ev) {
	if(mfobj.className != 'field-icons-hover') {
		mfobj.className = 'field-icons-hover';
	}
	dragging = true;
	disableDefaultAction(ev);
	if(document.all) {
		mouseLeft = window.event.clientX + jQuery(window).scrollLeft() ;
		mouseTop = window.event.clientY + jQuery(window).scrollTop() ;
	} else {
		mouseLeft = ev.pageX;
		mouseTop = ev.pageY;
	}
	//console.log("mouseLeft="+mouseLeft+"=mouseTop="+mouseTop);
	helem.style.left = (mouseLeft - helem.offsetWidth/2) + "px";
	helem.style.top = (mouseTop - helem.offsetHeight/2) + "px";
	helem.style.visibility = "visible";

	var suc = domousemove(mouseLeft, mouseTop, true);
	if(suc != true) {
		domousemove(mouseLeft, mouseTop, false);
	}
}

function domousemove(mouseLeft, mouseTop, first) {
	var divs = docid("formcontainer1").getElementsByTagName('div');//No I18N
	if(first == true) {
		divs = docid("formcontainer").getElementsByTagName('div');//No I18N
	}
	var dotlayer = docid("dotlayer");//No I18N
	var success = false;
	//docid('printhere').innerHTML = 'aaaaa';
	for(var i=0; i<divs.length; i++) {
		var di = divs.item(i);
		var x = parseInt(findPosX(di));
		var y = parseInt(findPosY(di));
		//console.log("divIdx="+x+"=divIdy="+y+"=di="+di.getAttribute('id'));
		if(di.className.indexOf(fcls) == -1) {
			continue;
		}
		if((first == true && mouseLeft + helem.offsetWidth/2 < x) ||
				(first == false && mouseLeft < x) ||
				(i == 0 && (mouseTop + helem.offsetHeight/2< y))) { // left and top

			if((first == false && mouseLeft < x) && findPosY(docid("formcontainer")) + docid("formcontainer").offsetHeight > (mouseTop + helem.offsetHeight/2)) { // left and bottom
				docid("formcontainer").appendChild(dotlayer);//No I18N
				showLayer(dotlayer, true);
			} else { // outside
				document.documentElement.appendChild(dotlayer);
				showLayer(dotlayer, false);
			}
			success = true;
			break;
		} else if(mouseLeft > x + dotlayer.offsetWidth) { // right
			if(first == true && findPosY(docid("formcontainer1")) + docid("formcontainer1").offsetHeight > (mouseTop + helem.offsetHeight/2)) { // right and bottom
				docid("formcontainer1").appendChild(dotlayer);//No I18N
				showLayer(dotlayer, true);
			} else { // outside
				document.documentElement.appendChild(dotlayer);
				showLayer(dotlayer, false);
			}
			success = false;
			break;
		}
		if(mouseTop - helem.offsetHeight - di.offsetHeight < y) { // inbetween
			var elemnext = di.nextSibling;
			if(elemnext) {
				di.parentNode.insertBefore(dotlayer, elemnext);
			} else {
				di.parentNode.appendChild(dotlayer);
			}
			showLayer(dotlayer, true);
			success = true;
			break;
		}
	}
	return success;
}


function disableDefaultAction(event) {
	if(document.all) {
		document.onselectstart = function() {
			return false;
		};
	} else {
		event.preventDefault();
	}
}

var currSecOrder = '';

function dragstop(ev) {
	mfobj.className = 'field-icons-active';
	document.onmousemove = null;
	document.onmouseup = null;
	if(document.all) {
		document.onselectstart=null;
	}

	var ty = helem.getElementsByTagName('li').item(0).getAttribute("typeid");
	helem.style.visibility = "hidden";
	helem.style.left = '0px';
	helem.style.top = '0px';
	if(docid('dotlayer').style.visibility == 'visible') {
		ty = parseInt(ty);
		var params=new Array();
		params=dootherworks(ty, true);
		addField(docid(typearr[ty]).innerHTML,params);

		/*if(mainObj!=null && ty != 0)
		  {

		  myCache[ty]=mainObj.parentNode.removeChild(mainObj);
		//console.log("adding "+ ty +":::"+myCache[ty].innerHTML);
		}*/


	} else {
		removedrag();
	}
	dragging = false;
}


function removedrag() {
	if(helem) {
		helem.style.visibility = "hidden";
		document.documentElement.appendChild(docid('dotlayer'));//No I18N
		showLayer(docid('dotlayer'), false);//No I18N
	}
	optfcid = null;
}

function showLayer(dl, show) {
	if(show == true) {
		dl.style.visibility='visible';
		dl.style.height = 32+'px';
	} else {
		dl.style.visibility='hidden';
		dl.style.height = 0+'px';
	}
}

var alphaVal = 0, fadeInIntvl, fadeOutIntvl;
function fadeIn(elId, intvl, callBackFunc) {
	alphaVal = 0;
	var el = document.getElementById(elId);
	el.style.opacity = alphaVal;
	el.style.filter = "alpha(opacity=" + alphaVal + ")";//No I18N
	el.style.display = "";
	fadeInIntvl = window.setInterval(() => doFadeIn(elId, callBackFunc), intvl);
}

function doFadeIn(elId, callBackFunc) {
	var el = document.getElementById(elId);
	if(!el) {
		window.clearInterval(fadeInIntvl);
		if (typeof callBackFunc != "undefined") callBackFunc();
		return;
	}
	if (alphaVal < 10) {
		el.style.filter = "alpha(opacity=" + (alphaVal * 4) + ")";//No I18N
		el.style.opacity = alphaVal / 6;
		alphaVal++;
	} else {
		el.style.filter = "alpha(opacity=100)";//No I18N
		el.style.opacity = 0.99;
		window.clearInterval(fadeInIntvl);
		if (typeof callBackFunc != "undefined") callBackFunc();
	}
}

function fadeOut(elId, intvl, callBackFunc) {
	alphaVal = 9;
	fadeOutCall = true;
	fadeOutIntvl = window.setInterval(() => doFadeOut(elId, callBackFunc), intvl);
			}

			function doFadeOut(elId, callBackFunc) {
			var el = document.getElementById(elId);
			if(!el || fadeOutCall == false) {
			alphaVal = 0;
			fadeOutCall = false;
			window.clearInterval(fadeOutIntvl);
			if (typeof callBackFunc != "undefined") callBackFunc();
			} else {
			if (alphaVal > 0) {
			el.style.filter = "alpha(opacity=" + (alphaVal * 10) + ")";//No I18N
			//alert(el + " : " + alphaVal);
			el.style.opacity = (alphaVal / 10);
			alphaVal--;
			} else {
			alphaVal = 0;
			el.style.filter = "alpha(opacity=0)";//No I18N
			el.style.opacity = 0.01;
			el.style.display = "none";
			window.clearInterval(fadeOutIntvl);
			fadeOutCall = false;
			if (typeof callBackFunc != "undefined") callBackFunc();
			}
			}
			}

function getPrev(elem) {
	var divs = docid('formcontainer').getElementsByTagName('div');//No I18N
	var prevDiv;
	for(var i=0; i<divs.length; i++) {
		var di = divs.item(i);
		if(di.className.indexOf(fcls) == -1) {
			continue;
		}
		if(di == elem) {
			return prevDiv;
		}
		prevDiv = di;
	}
	divs = docid('formcontainer1').getElementsByTagName('div');//No I18N
	for(var i=0; i<divs.length; i++) {
		var di = divs.item(i);
		if(di.className.indexOf(fcls) == -1) {
			continue;
		}
		if(di == elem) {
			return prevDiv;
		}
		prevDiv = di;
	}
}

function getLast(first) {
	var divs = docid('formcontainer1').getElementsByTagName('div');//No I18N
	if(first == true) {
		divs = docid('formcontainer').getElementsByTagName('div');//No I18N
	}
	var toRet;
	for(var i=0; i<divs.length; i++) {
		var di = divs.item(i);
		if(di.className.indexOf(fcls) == -1) {
			continue;
		}
		toRet = di;
	}
	return toRet;
}


var tabmouseLeftDiff;
var tabmouseTopDiff;
var movetab;
var dragtab;
var actType;
var dragging = false;
var tabPosY = null;

function tabmovemouse(ev) {
	dragtab.style.visibility = 'hidden';
	dragging = true;
	disableDefaultAction(ev);
	var currml = null;
	var currmt = null;
	var xcorr = 0;
	if(document.all) {
		currml = window.event.clientX + jQuery(window).scrollLeft() ;
		currmt = window.event.clientY + jQuery(window).scrollTop() ;
	} else {
		currml = ev.pageX;
		currmt = ev.pageY;
		xcorr = 30;
	}


	movetab.style.left = (currml - tabmouseLeftDiff - xcorr) + "px";
	movetab.style.top = tabPosY  - 3 + "px";
	movetab.style.visibility = "";
	if (actType == 1)
	{
		var lis = docid('tabmain').getElementsByTagName('li');//No I18N
	}
	else
	{
		var lis = docid('tabmain1').getElementsByTagName('li');//No I18N
	}
	var moveposright = currml - tabmouseLeftDiff;
	var moveposleft = currml - tabmouseLeftDiff;
	for(var i=0; i<lis.length-1; i++) {
		//	docid("testdiv").innerHTML = docid("testdiv").innerHTML + "," + i;
		var lie = lis.item(i);

		var x = parseInt(findPosX(lie));
		var y = parseInt(findPosY(lie));

		var tobreak = false;
		var ins = null;
		var bf = null;

		if(moveposright < (x + (lie.offsetWidth/2)))
		{

			var	par = lie.parentNode;
			var tabnext = lie.nextSibling;
			if(tabnext == null) {
				par.appendChild(dragtab);
			}
			else
			{
				par.insertBefore(dragtab, tabnext);
			}
			break;
		}
	}

}

if(!(document.all) && !(document.createElement('div').outerHTML)) {
	HTMLElement.prototype.__defineGetter__("outerHTML", function() { //NO I18N
		var span = document.createElement("span"); span.appendChild(this.cloneNode(true));
		return span.innerHTML;
	});

	HTMLElement.prototype.__defineSetter__("outerHTML", function(html) {//NO I18N
		var range = document.createRange();
		this.innerHTML = html;
		range.selectNodeContents(this);
		var frag = range.extractContents();
		this.parentNode.insertBefore(frag, this);
		this.parentNode.removeChild(this);
	});
}

