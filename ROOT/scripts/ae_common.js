/* $Id$ */

function beforePOCancel() {
	if(window.confirm(document.getElementById("confirmMsg").innerHTML)) {
		return true;
	}
	else {
		return false;
	}
}

function updateLists(sourceList,destList)
{
        var opt,i=0;
        while(opt = sourceList.options[i++] )
        {
                if(opt.selected &&(opt.index >=0))
                {
                        destList.options[destList.options.length] = new Option(opt.text, opt.value, true, false);
                        sourceList.options[i-1] = null;
                        i--;
                }
        }
        return false;
}

function handleSoftware(source,destination,operation,direction) {
        var len = source.length;
        var isSelected = false;
        for (i=0; i<len; i++) {
                opt = source.options[i];
                if (opt.selected) {
                        isSelected = true;
                }
        }
        if (! isSelected) {
		alert(document.getElementById("sdp.inventory.selectoptionjserro").innerHTML);
                return false;
        }
        if (operation == 'update') {
                updateLists(source,destination);
        }
        else {
                moveUp(source);
        }
	var destlen = document.ProductDefForm.associatedSoftwareList.length;
        for (j=0;j<destlen; j++) {
                opt = document.ProductDefForm.associatedSoftwareList.options[j];
                if (j == 0) {
                        opt.className = 'optparent'; //NO I18n
                        var val = opt.innerHTML;
                        if (val.indexOf("&nbsp;") != -1) {
                                opt.innerHTML = val.substring(18,val.length);
                        }
                }
                else {
                        opt.className = 'optchild'; //NO I18n
                        var val = opt.innerHTML;
                        if (val.indexOf("&nbsp;") == -1)
                        {
                                opt.innerHTML = '&nbsp;&nbsp;&nbsp;' + opt.innerHTML;//NO I18n
                        }
                }
        }
	var manSWLen = document.ProductDefForm.softwareList.length;
        if (direction == '2to1') {
                for (k=0;k<manSWLen;k++) {
                        opt = document.ProductDefForm.softwareList.options[k];
                        opt.className = 'optchild';//NO I18n
                        value = opt.innerHTML;
                        if (value.indexOf("&nbsp;") != -1) {
                                value = value.substring(18,value.length);
                        }
                        opt.innerHTML = value;
                }
        }
        return true;
}

function isNumeric(strString) {
        var strValidChars = "0123456789";
        var strChar;
        var blnResult = true;
        if (strString.length == 0) return false;
        for (i = 0; i < strString.length && blnResult == true; i++) {
                strChar = strString.charAt(i);
                if (strValidChars.indexOf(strChar) == -1) {
                        blnResult = false;
                }
        }
        return blnResult;
}

function hideEditFieldBlock()
{
	var attributeId = jQuery("#updateRow").data("attributeId"); // No I18n
	document.getElementById("Edit_"+attributeId).innerHTML = "";

	jQuery("#Edit_"+attributeId).fadeOut("slow", function() // No I18n
		{
			jQuery("#Row_"+attributeId).fadeIn(3000); // No I18n
		}
	);
	jQuery("#updateRow").removeData("attributeId"); // No I18n
}

/* SD-123202, SD-123179, SD-123809, SD-123307 */
/* Common methods from reports moved here */
/* Start */
function copyListValues(from, to, selectTagObj) {
    if (selectTagObj != null) {
        selectTagObj.selected = true;
    }
    var sel = false;
    try {
        var fromList = document.getElementById(from);
        var toList = document.getElementById(to);

        if (fromList.options.length > 0) {
            for (var i = 0; i < fromList.options.length; i++) {
                if (fromList.options[i].selected) {
                    toList.appendChild(fromList.options[i]);
                    i--;
                    sel = true;
                }
            }
        }
    } catch (e) {
        alert(e.message);
    }
    if (!sel) {
        alert(getMessageForKey('sdp.jserror.options.noselection'));
    }
}

function getLongDate(dtFormat, hh, mm) {
    var tmp = dtFormat.split("-"); //No I18N
    var dt = new Date();
    /*
    dt.setYear(tmp[2]);
    dt.setMonth(tmp[1] - 1);
    dt.setDate(tmp[0]);
    */
    dt.setYear(tmp[0]);
    dt.setMonth(tmp[1] - 1);
    dt.setDate(tmp[2]);

    dt.setHours(hh);
    dt.setMinutes(mm);
    dt.setSeconds(0);
    dt.setMilliseconds(0);
    return dt.getTime();
}

function displayFadeMsg(msg, showClose) {
    if (document.getElementById('centerstatusmsg') != undefined) {
        document.getElementById('centerstatusmsg').innerHTML = msg;
        var sts = document.getElementById('centerstatus');
        var width = sts.offsetWidth;
        var height = sts.offsetHeight;
        var left = (window.screen.width / 2) + document.body.scrollLeft - 50;
        var topx = (window.screen.height / 2) + (document.body.scrollTop / 2) - (height / 2);
        sts.style.left = parseInt(left) + "px"; //No I18N
        sts.style.top = parseInt(topx) + "px"; //No I18N
        sts.style.backgroundColor = "rgb(255,255,255)"; //No I18N
        sts.style.border = 'solid black 1px'; //No I18N
        sts.style.display = 'block'; //No I18N
        if (!showClose) {
            setTimeout(function() { sts.style.display = 'none'; }, 3000); //No I18N
        }
    }
}

/* End */
