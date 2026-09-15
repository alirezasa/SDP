var dragging = false;
var myCache=new Array();

GridCustomize = function(layoutAreaId, saveFunc) {
	this.layoutAreaId = layoutAreaId;
	this.layoutArea = getObj(layoutAreaId).rows[0];
	this.saveFunc = saveFunc;
	
	this.oMoveLayer = document.createElement("DIV");
	this.oMoveLayer.style.cursor = "move";
	this.oMoveLayer.style.zIndex = "100";
	
	this.oHiliteLayer = document.createElement("DIV");
	this.oHiliteLayer.style.border = "1px dashed #F00";
	this.oHiliteLayer.style.zIndex = "99";
	
	this.oMoveLayer.style.position = this.oHiliteLayer.style.position = "absolute";	
	this.oMoveLayer.style.left = this.oHiliteLayer.style.left = "-1000px";
	this.oMoveLayer.style.top = this.oHiliteLayer.style.top = "-1000px";	
	
	document.documentElement.appendChild(this.oMoveLayer);
	document.documentElement.appendChild(this.oHiliteLayer);

	this.oColumns = new Array();
	this.oColumns = this.findChild(this.layoutArea, "TD");//No I18N
	
	for (var i = 0; i < this.oColumns.length; i++) {
		this.oColumns[i].width = (100 / this.oColumns.length) + "%";
		this.oColumns[i].className += " gridColumn";//No I18N
		var oDIV = this.findChild(this.oColumns[i], "DIV");//No I18N
		for (var j = 0; j < oDIV.length; j++) {
			oDIV[j].className += " gridItem";//No I18N
		}
	}
};


GridCustomize.prototype.regEventByAttrib = function(elType, customAttrib) {
	var oTD = this.layoutArea.getElementsByTagName(elType);
	for (var k = 0; k < oTD.length; k++) {
		if (oTD[k].getAttribute(customAttrib) != null || oTD[k].getAttribute(customAttrib) != "") {
		  this.registerEventForEl(oTD[k]);
		}
	}
};

GridCustomize.prototype.regEventByClass = function(elType, className) {
	var oTD = this.layoutArea.getElementsByTagName(elType);
	for (var k = 0; k < oTD.length; k++) {
		if (oTD[k].className != null && (oTD[k].className.indexOf(className) > -1)) {
		  this.registerEventForEl(oTD[k]);
		}
	}
};

GridCustomize.prototype.registerEventForEl = function(elToReg) {
	elToReg["dragLis"] = this;//No I18N
	elToReg.onmousedown = function(ev) {
		this["dragLis"].captureLayer(ev);//No I18N
	};
	elToReg.style.cursor="move";
};

GridCustomize.prototype.captureLayer = function(ev) {

	
	if (browser_ie) srcElement = window.event.srcElement;
	else if (browser_nn4 || browser_nn6) srcElement = ev.target;
	
	if (typeof srcElement != "undefined" && srcElement != null) {
		var prevEl = srcElement;//.parentNode;
		var pathEl = new Array();
		cnt = 0;
		while (prevEl) {
			if (prevEl == this.layoutArea) {
				this.oCurrLayer = pathEl[cnt - 2];
				break;
			}
			pathEl[cnt] = prevEl;
			prevEl = prevEl.parentNode;
			cnt++;
		}
		var action = srcElement.getAttribute('alt');
		
		var ty = 0;
		//alert(mydiv);
		if(mydiv!=undefined)
		{
			ty=mydiv.getAttribute('typeid');
			var divId = mydiv.getAttribute('id');
			//alert(divId);
		}
		if(action == 'edit')
		{
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
                  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                    //IE 4 compatible
                    myWidth = document.documentElement.clientWidth;
                    myHeight = document.documentElement.clientHeight;
                  }
                  
                 var top = (myHeight/2)-100;
                 var left = (myWidth/2)-250;
            var id = document.NewCIType.ciTypeID.value;	
            var attID = ty;
            var url = '/setup/AddCIAttributes.jsp?mode=edit&ciTypeID='+id+'&attID='+attID+"&"+(new Date()).getTime();//No I18N
            showURLInDialog(url,"closeButton=no,position=absolute,modal=yes,top="+top+",left="+left);//No I18N
			return;
		}
		else if(action == 'close')
		{
			var divId = mydiv.getAttribute('id');
			//alert(mydiv.getAttribute('id'));
            if(ty == 0 || divId ==365000000181001 || divId ==365000000181002 || divId ==365000000181003 || divId ==365000000181004 || divId == 365000000181005 || divId == 365000000181006){
				//alert(divId);
                mydiv.parentNode.removeChild(mydiv);
				mydiv=null;
            }
            else if(confirm(getMessageForKey("ae.cmdb.admin.citype.citypeattdelete.confirmmess")) && mydiv!=null)
            {
				mydiv.parentNode.removeChild(mydiv);
				mydiv=null;
			
                deleteAtt(ty);
				if(ty != 0) {
				    if((myCache[ty]+'') != 'undefined'){
                                      docid('fieldicons').appendChild(myCache[ty]);//No I18N
                                    }
				    //console.log("re-inserting "+ ty +":::"+ docid('fieldicons').appendChild(myCache[ty]).innerHTML);
				}
			}
			return;
		}

		this.oMoveLayer.className = 'field-outer-container-drag';
		this.oMoveLayer.style.width = this.oCurrLayer.offsetWidth+'px';
		this.oMoveLayer.style.height = this.oCurrLayer.offsetHeight+'px';
		this.oMoveLayer.style.height = "auto";
		this.oMoveLayer.style.left = findPosX(this.oCurrLayer) + "px";
		this.oMoveLayer.style.top = findPosY(this.oCurrLayer) + "px";
		this.oMoveLayer.innerHTML = this.oCurrLayer.innerHTML;
		this.oMoveLayer.className = 'field-outer-container-drag';
		this.showHiliteLayer(this.oCurrLayer);
		this.oCurrLayer.style.visibility = "hidden";
		
		if (browser_ie) {
			this.diffLeft = window.event.clientX + jQuery(window).scrollLeft() - parseInt(this.oMoveLayer.style.left);
			this.diffTop = window.event.clientY + jQuery(window).scrollTop() - parseInt(this.oMoveLayer.style.top);
		} else if (browser_nn4 || browser_nn6) {
			this.diffLeft = ev.pageX - parseInt(this.oMoveLayer.style.left);
			this.diffTop = ev.pageY - parseInt(this.oMoveLayer.style.top);
		}
	
		//var currLayout = this.layoutAreaId;
        document["dragLis"] = this;//No I18N
		document.onmousemove = function(ev) {
		     document["dragLis"].moveLayer(ev);//No I18N
		};
		
		document.onmouseup = function(ev) {
			
		     document["dragLis"].releaseLayer(ev);//No I18N
		};
	}
};

GridCustomize.prototype.moveLayer = function(ev) {
	dragging = true;
	clearTextSelection();
	
	if (browser_ie) {
		if (window.event.clientY + window.screenTop + 50 >= window.screen.height - 50) 
			{ var st = jQuery(window).scrollTop(); st = st+20; }
		else if (window.event.clientY <= 50) 
			{ var st = jQuery(window).scrollTop(); st = st-20; }

		var currLeft = (window.event.clientX - this.diffLeft) + jQuery(window).scrollLeft();
		var currTop = (window.event.clientY - this.diffTop) + jQuery(window).scrollTop();
	} else if (browser_nn4 || browser_nn6) {
		var currLeft = (ev.pageX - this.diffLeft);
		var currTop = (ev.pageY - this.diffTop);
	}
	
	this.oMoveLayer.style.left = currLeft + "px";
	this.oMoveLayer.style.top = currTop + "px";

	var layerMidX = currLeft + (parseInt(this.oMoveLayer.style.width) / 2);
	var layerMidY = currTop + (parseInt(this.oMoveLayer.style.height) / 2);
	
	for (var i = 0; i < this.oColumns.length; i++) {
		if (layerMidX >= findPosX(this.oColumns[i]) && layerMidX <= (findPosX(this.oColumns[i]) + this.oColumns[i].offsetWidth)) {
			var oHoverColumn = this.oColumns[i];
			break;
		}
	}
	
	if (oHoverColumn != null && typeof oHoverColumn != "undefined") {
		var oLayers = new Array();
		oLayers = this.findChild(oHoverColumn, "DIV");//No I18N
		for (var j = 0; j < oLayers.length; j++) {
			if (currTop <= findPosY(oLayers[j])) {
				var oHoverLayer = oLayers[j];
				break;
			}
		}
		
		oNewLayer = this.oCurrLayer;
	
		if (oHoverLayer) oHoverLayer.parentNode.insertBefore(this.oCurrLayer, oHoverLayer);
		else oHoverColumn.appendChild(this.oCurrLayer);
		
		this.oCurrLayer = oNewLayer;
		this.showHiliteLayer(oNewLayer);
	}
};

GridCustomize.prototype.releaseLayer = function() {
	document.onmousemove = null;
	document.onmouseup = null;
	
	this.transXPoints = new Array();
	this.transYPoints = new Array();
	
	this.drawPath(parseInt(this.oMoveLayer.style.left), parseInt(this.oMoveLayer.style.top), findPosX(this.oCurrLayer), findPosY(this.oCurrLayer));
	this.transPitStops = (this.transXPoints.length > 10) ? (this.transXPoints.length - 1) / 10 : 1; 
	this.transPosCnt = 0;

	this.transIntervalId = window.setInterval(function(){ document['dragLis'].positionLayer(); }, 15);
	dragging = false;
	
}

GridCustomize.prototype.positionLayer = function() {
	if (this.transPosCnt < this.transXPoints.length - 1) {
		this.oMoveLayer.style.left = this.transXPoints[this.transPosCnt] + "px";
		this.oMoveLayer.style.top = this.transYPoints[this.transPosCnt] + "px";
		this.transPosCnt = this.transPosCnt + Math.round(this.transPitStops);
	} else {
		this.transPosCnt = 0;
		this.transXPoints = this.transYPoints = null;
		window.clearInterval(this.transIntervalId);
		
		this.oMoveLayer.style.left = this.oMoveLayer.style.top = "-1000px";
		this.oHiliteLayer.style.left = this.oHiliteLayer.style.top = "-1000px";
		this.oCurrLayer.style.visibility = "";
		this.oMoveLayer.innerHTML = "";
        callsaveIndex('updateIndex');//No I18N
                //parent[this["saveFunc"]](this);
	}
};

GridCustomize.prototype.showHiliteLayer = function(oLayer) {
	this.oHiliteLayer.style.width = oLayer.offsetWidth+'px';
	this.oHiliteLayer.style.height = oLayer.offsetHeight+'px';
	this.oHiliteLayer.style.left = findPosX(oLayer) + "px";
	this.oHiliteLayer.style.top = findPosY(oLayer) + "px";
};

GridCustomize.prototype.drawPath = function(x1, y1, x2, y2) {
	var dist = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	var dx = (x2 - x1) / dist;
	var dy = (y2 - y1) / dist;

	for (var i = 0; i < dist; i++) {
		this.transXPoints[i] = x1 += dx;
		this.transYPoints[i] = y1 += dy;
	}
};

GridCustomize.prototype.findChild = function(oParent, tagName) {
	if (oParent != null && typeof oParent.childNodes != "undefined") {
		var oChild = new Array();
		for (var i = 0, k = 0; i < oParent.childNodes.length; i++) {
			if (browser_ie) {
				if (oParent.childNodes[i].tagName == tagName) {
					oChild[k] = oParent.childNodes[i];
					k++;
				}
			} else if (browser_nn4 || browser_nn6) {
				if (oParent.childNodes.item(i).tagName == tagName) {
					oChild[k] = oParent.childNodes[i];
					k++;
				}
			}
		}
		
		return oChild;
	}
};

GridCustomize.prototype.getCurrentOrderAsString = function() {
	var result = "";
	for (var i = 0; i < this.oColumns.length; i++) {
		var oDIV = this.findChild(this.oColumns[i], "DIV");//No I18N
		result += "|";//No I18N
		for (var j = 0; j < oDIV.length; j++) {
			result += oDIV[j].id;
			if (j != oDIV.length - 1) result += "_"
		}
	}
        return result;
}

GridCustomize.prototype.getCurrentOrderAsMatrix = function(attrib) {
  var result = new Array();
  for (var i = 0; i < this.oColumns.length; i++) {
    result[i] = new Array();
    var oDIV = this.findChild(this.oColumns[i], "DIV");//No I18N
    for (var j = 0; j < oDIV.length; j++) {
      result[i][j] = oDIV[j].getAttribute(attrib);
    }
  }	
  return result;
}

function docid(id) {
	return document.getElementById(id);
}

function trimString(str) {
   if(str != null) {
   	str = str.replace( /^\s+/g, "" );// strip leading
   	str = str.replace( /\s+$/g, "" );// strip trailing
   }
   return str;
 }


