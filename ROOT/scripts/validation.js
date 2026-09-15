/* $Id$ */


/**
 * checkValidDate is a generic method to compare the values of two date fields
 * it will throw an alert message and return false if date1 is greater than date2
 * Can be used to check start and end date values and the like...
 *
 * dateFieldOrId        - date field or ID (both accepted) for which a new date has been selected
 * checkDateFieldOrId   - date field whole value needs to be compared to check whether the new date is valid
 * errorMessageOrId     - Message id or text to be notified to the user when the date combination is not valid
 * errorCondition       - takes only one value "less" or can be left empty. reverses the condition check
 *                        if less is specified then error is thrown when date1 is less then date2
 */
function checkValidDate(dateFieldOrId, checkDateFieldOrId, errorMessageOrId, errorCondition)
{
    var curDate = null;
    var checkDate = null
    var dateField = $(dateFieldOrId);
    var checkDateField = $(checkDateFieldOrId);
    var curDateStr = dateField.value;
    var checkDateStr = checkDateField.value;

    if(checkDateStr == -1 || checkDateStr == "" || checkDateStr == 0) {
        return true;    // if no checkDate to compare
    }

    var curDateNum = Number(curDateStr);
    var checkDateNum = Number(checkDateStr);
    if(curDateNum == NaN) {
        curDate = new Date(curDateStr);
        checkDate = new Date(checkDateStr);
    }
    else {
        curDate = new Date(curDateNum);
        checkDate = new Date(checkDateNum);
    }

    if(checkDate != null) {
        if(errorCondition == "less") {
            if(curDate < checkDate) {
                alert(getMessageForKey(errorMessageOrId));
                return false;
            }
        }
		else {
            if(curDate > checkDate) {
                alert(getMessageForKey(errorMessageOrId));
                return false;
            }
		}
	}
    return true;
}


/**
 * Generic validate methods that can be used anywhere.
 */
function checkTime(fromObj, toObj) {
	var fromTime = fromObj.value;
	var toTime = toObj.value;
	if(fromTime != "" && toTime != "") {
            fromTime = getDateFromString(fromTime, null);
            toTime = getDateFromString(toTime, null);
		if(Date.parse(fromTime) > Date.parse(toTime)) {
			if(document.getElementById(fromObj.name + "_TIME") != null) {
				formObj.value = document.getElementById(fromObj.name + "_TIME").innerHTML;
			}
			if(document.getElementById(toObj.name + "_TIME") != null) {
				toObj.value = document.getElementById(toObj.name + "_TIME").innerHTML;
			}
			return false;
		}
	}
	return true;
}

function trimAll(str)
{
	/*************************************************************
	Input Parameter :str
	Purpose         : remove all white spaces in front and back of string
	Return          : str without white spaces
	***************************************************************/

	//check for all spaces
	var objRegExp =/^(\s*)$/;
	if (objRegExp.test(str))
	{
		str = str.replace(objRegExp,'');
		if (str.length == 0){
                    return str;
                }
	}

	// check for leading and trailling spaces
	objRegExp = /^(\s*)([\W\w]*)(\b\s*$)/;
	if(objRegExp.test(str))
	{
		str = str.replace(objRegExp, '$2');//No I18N
	}
	return str;
}

function isEmailId(str)
{
	/*****************************************************************
	Input   :  str
	purpose :  To validate for email
	output  :  valid email true/false
	*******************************************************************/
	var objRegExp  = /^[a-z0-9]([a-z0-9_\-\.\+\/]*)@([a-z0-9_\-\.]*)(\.[a-z]{2,3}(\.[a-z]{2}){0,2})$/i;
	return objRegExp.test(str);
}

function isEmpty(str)
{
	/*************************************************************
	input    : str
	purpose  : To check if empty
	output   : if empty true or false
	***************************************************************/

	var temp = trimAll(str);
	if (temp.length > 0 )
		return false;
	return true;
}

function isIpAddress(str)
{
	//var ipAddress = trimAll(str.value);
	var ipAddress = trimAll(str);
	ipAddress = ipAddress.split(".");//No I18N
	if(ipAddress.length != 4)
	{
		return false;
	}
	for(i=0;i<ipAddress.length;i++)
	{
		if(isPositiveInteger(ipAddress[i]))
		{
			var temp = parseInt(ipAddress[i],10);
			if(temp > 255)
			{
				return false;
			}
		}
		else
		{
			return false;
		}

	}
	return true;
}
function isIpV6Address(str){
	var ipAddress = trimAll(str);
	return /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i.test(ipAddress);
}
function isInteger(str)
{
	/****************************************************************
	input   : str
	purpose : check if number is integer
	output  : returns true or false
	*****************************************************************/
	var objRegExp = /(^-?\d\d*$)/;
	return objRegExp.test(str);
}

function isPositiveInteger(str)
{
	/****************************************************************
	input   : str
	purpose : check if number is positive integer
	output  : returns true or false
	*****************************************************************/
	var temp  = parseInt(str,10);
	if ( isNaN(temp) || temp.toString().length != str.length) {
		return false;
	}
	var objRegExp = /(^\d\d*$)/;
	return objRegExp.test(temp);
}

function isDouble(str) {
	var objRegExp = /^\d\d*(\.\d\d*)?$/;
	return objRegExp.test(str);
}

function checkinteger(order) {
	var x=order.value;
	return checkintegervalue(x);
}

function checkintegervalue(x) {
	var anum=/(^\d+$)|(^\d+\.\d+$)/;
	if (x!=null && x!="" && anum.test(x)) {
		testresult=true;
		if(x.indexOf(".")>=0) {
			testresult=false;
		}
		maxVal = Math.max(x,2147483648);
		if(maxVal!=2147483648 || x==maxVal) {
			testresult=false;
		}
	}
	else {
		testresult=false;
	}
	return (testresult);
}

function checklong(order) {
	var x=order.value;
	var anum=/(^\d+$)|(^\d+\.\d+$)/;
	if (x!=null && x!="" && anum.test(x)) {
		testresult=true;
		if(x.indexOf(".")>=0) {
			testresult=false;
		}
		maxVal = Math.max(x,9223372036854775808);
		if(maxVal!=9223372036854775808 || x==maxVal) {
			testresult=false;
		}
	}
	else {
		testresult=false;
	}
	return (testresult);
}

function checknumber(order) {
	var x=order.value;
	var anum=/(^\d+$)|(^\d+\.\d+$)/;
	if (x!=null && x!="" && anum.test(x)) {
		testresult=true;
	}
	else {
		alert(document.getElementById('invalidnumber').innerHTML);
		testresult=false;
	}
	return (testresult);
}

function checkForIntegerZero(order) {
	var x=order.value;
	if(!checkinteger(order)) {
		return false;
	}
	for(var i=0; i < x.length; i++) {
		y = x.charAt(i);
		if(y=='0') {
			x = x.substring(i+1,x.length);
			i--;
			if(i<0 && x.length==0) {
				break;
			}
		}
		else {
			break;
		}
	}
	order.value=x;
	if(x==null || x=='') {
		return false;
	}
	else {
		return true;
	}
}
