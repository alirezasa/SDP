//$id: $
function assignElements(form)
{
	var elems = form.elements;
	var len = elems.length;
	for(var i=0; i<len; i++) {
		var obj = elems[i];
		if(obj.type == 'checkbox') {
			if(obj.id.indexOf("ID_")!=-1 && elemObj[obj.id] == null){
				elemObj[obj.id] = elems[i];
				obj.name = "selectedOUs";
			}
		}
		
	}

	var j = 0;	
	elems = document.images;
	len = elems.length;	
	for(var i=0; i<len; i++) {
		var obj = elems[i];	
		if(obj.id != null) { 
			if(obj.id.indexOf("ceimg_")!=-1){
				imgObj[j] = obj;
				j++;
				}
		}
		else
		{
			//alert('no id');
		}
		
	}

}

/*
 *group check ....
 * */
function gc(nodeKey)
{
	var eleKey = "ID_" + nodeKey ;		//no i18n
	var changedEle = elemObj[eleKey];
	if(changedEle.checked == true)
	{
		checkAllChildOUs(nodeKey, true);
	}
	else
	{
		checkAllChildOUs(nodeKey, false);
	}
}		


function checkAllChildOUs(nodeId, operation) {

	var childObj = elemObj["ID_" + nodeId];		//no i18n
	if(childObj) {
		childObj.checked = operation;
		childObj.value = nodeId;
	}
	if(childStore[nodeId] != null) {
		var childNodes = childStore[nodeId]; 
		var length = childNodes.length;
		do {
			if(childStore[childNodes[length-1]] != null) {
				checkAllChildOUs(childNodes[length-1], operation);
			}
			else {
				if(elemObj["ID_" + childNodes[length-1]]) {		 //no i18n
					elemObj["ID_" + childNodes[length-1]].checked = operation;	 //no i18n
				}
			}
		}
		while(--length);
	}
}

function ce(nodeId)
{
	collapseExpand(nodeId);
}

/*
 *To collapse and expand the tree structure...
 * */
function collapseExpand(nodeId)
{
	//document.getElementById("load").style.display = "block";
	var state = document.getElementById("CE_"+nodeId).className;

	if(state == "hide")	//no i18n
	{
		document.getElementById("CE_"+nodeId).className = "show";
		if(document.getElementById("ceimg_"+nodeId).src.match("jb-p.gif") == "jb-p.gif")	//no i18n
		{
			document.getElementById("ceimg_"+nodeId).src="/images/jb-m.gif";	//no i18n
		}
		else if(document.getElementById("ceimg_"+nodeId).src.match("jn-p.gif") == "jn-p.gif")	//no i18n
		{
			document.getElementById("ceimg_"+nodeId).src = "/images/jn-m.gif";			//no i18n
		}
		else if(document.getElementById("ceimg_"+nodeId).src.match("p.gif") == "p.gif")	//no i18n
		{
			document.getElementById("ceimg_"+nodeId).src="/images/m.gif";			//no i18n
		}
	}
	else
	{
		document.getElementById("CE_"+nodeId).className="hide";
		
		if(document.getElementById("ceimg_"+nodeId).src.match("jb-m.gif") == "jb-m.gif")	//no i18n
		{
			document.getElementById("ceimg_"+nodeId).src="/images/jb-p.gif";			//no i18n
		}
		else if(document.getElementById("ceimg_"+nodeId).src.match("jn-m.gif") == "jn-m.gif")	//no i18n
		{
			document.getElementById("ceimg_"+nodeId).src = "/images/jn-p.gif";			//no i18n
		}
		else if(document.getElementById("ceimg_"+nodeId).src.match("m.gif") == "m.gif")		//no i18n
		{

			document.getElementById("ceimg_"+nodeId).src="/images/p.gif";				//no i18n
		}
	}
	//document.getElementById("load").style.display = "none";	
}

var elemObj = new Object();
var imgObj  = new Array();
var childStore = new Object();

var req = false;
function callAjax(url, params, requestID,domainname,objecttype) {

	var ajax_request_id = requestID;

	req = false;
	// branch for native XMLHttpRequest object
	if(window.XMLHttpRequest)	
	{
		try
		{
			req = new XMLHttpRequest();
		}
		catch(e)
		{
			req = false;
		}
		// branch for IE/Windows ActiveX version
	}	
	else if(window.ActiveXObject)
	{
		try
		{
			req = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch(e)
		{
			try 
			{
				req = new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch(e)
			{
				req = false;
			}
		}
	}

	if(req)
	{
		try
		{
			req.open("POST", url, true);
			req.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
			req.setRequestHeader("Content-length", params.length);
			req.setRequestHeader("X-CSPN-TOKEN", sdpNonce);

			if(domainname != null)
			{
				req.onreadystatechange = function(){activeDirectory.ouImportDone(domainname,objecttype);};
			}
			else
			{
				req.onreadystatechange = ouImportDone;
			}
			req.send(params);
		}
		catch(e)
		{
			alert("Error while sending the request : " + e.message); // no i18n
		}
	}
}

