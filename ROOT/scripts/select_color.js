/* $Id$ */
/*
window.resizeTo(240, 182);
function _CloseOnEsc() {
  if (event.keyCode == 27) { window.close(); return; }
}
*/
var prevColor= '000000'; // No I18N
var prevBkColor='000000'; // No I18N
var is_bkcolor=0;
function View(color) {                  // preview color
  document.getElementById("ColorPreview").style.backgroundColor = '#' + color; // No I18N
  document.getElementById("ColorHex").value = '#' + color; // No I18N
}

function  setPrevColor(color){    // previous color
    document.getElementById("PrevColor").style.backgroundColor = '#' + color; // No I18N
 }	 

function Set(string) {                   // select color
	var color = ValidateColor(string);
	if (color == null) { alert("Invalid color code: " + string); }      
	else {                                                                // valid color
		View(color);                          // show selected color
		setPrevColor(color);	 
		newDialog._return(color);
		closeDialog();
	}
}

function ValidateColor(string) {                // return valid color code
  string = string || '';
  string = string + "";
  string = string.toUpperCase();
  var chars = '0123456789ABCDEF'; // No I18N
  var out   = '';

  for (var i=0; i<string.length; i++) {             // remove invalid color chars
    var schar = string.charAt(i);
    if (chars.indexOf(schar) != -1) { out += schar; }
  }

  if (out.length != 6) { return null; }            // check length
  return out;
}
