/* $Id$ */

/* IE8 and below versions are not compatible. */

olderIE();

// For IE 8 , IE 9 and 10 compatibility messages
function detectIEVersion() {
  var ua = window.navigator.userAgent;
  
  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }
  
  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }
  
  // other browser
  return false;
}

function olderIE() {
  var IEver = detectIEVersion();
  if(IEver !== false && fromIframe !== 'true'){
    window.location.href="/html/Non_Compatible_Browsers.html"; //No I18N
    return false;
  }
}
