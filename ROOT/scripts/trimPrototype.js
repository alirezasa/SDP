/* $Id$ */
// ------------------- General Object related method ---------------------- //

/**
 * Creating trim() function and added to String object
 */
String.prototype.trim = function() {
  var x = this;
  x = x.replace(/^\s*(.*)/, "$1");//No i18N
  x = x.replace(/(.*?)\s*$/, "$1");//No i18N
  return x;
}