/* $Id $ */

/* HELPERS NEEDED FOR THE HANDLEBAR TEMPLATES ARE AVAILABLE HERE*/

// Register translation helper
Handlebars.registerHelper('i18n', function(stringKey, options){ //NO I18N
    var arr = [];
    arr.push(stringKey);
    if(options){
      if(arguments.length > 2) {
        for(var i=1; i<arguments.length; i++) {
          arr.push(arguments[i]);
        }
      } else {
        arr.push(options);
      }
    }
    return new Handlebars.SafeString(i18nHelper(arr));
});

Handlebars.registerHelper('h_i18n', function(stringKey, options){ //NO I18N
    var arr = [];
    arr.push(stringKey);
    if(options){
      if(arguments.length > 2) {
        for(var i=1; i<arguments.length; i++) {
          arr.push(arguments[i]);
        }
      } else {
        arr.push(options);
      }
    }
    return new Handlebars.SafeString(i18nHelper(arr));
});

Handlebars.registerHelper('Hi18n', function(stringKey, options){//NO I18N
  var arr = [];
  arr.push(stringKey);
  if(options){
      arr.push(options);
  }
  return new Handlebars.SafeString(i18nHelper(arr));
});

// helper for comparing string and for using conditional operators
Handlebars.registerHelper('compare', function(lvalue, operator, rvalue, options){	//NO I18N
  	var arr = [];
  	arr.push(lvalue, operator, rvalue, options);
  	return compareHelper(arr);
});

/**
 * returns the resultant of the math operation done on given operands
 */
Handlebars.registerHelper('math', function(lvalue, operator, rvalue, options){ //NO I18N
    var arr = [];
    arr.push(lvalue, operator, rvalue, options);
    return mathHelper(arr);
});

/**
 * loops the index from @beginIndex -> @endIndex and increments @increment value in each loop
 * By default, @increment value is 1, if not given
 * Example:
 * {{#for 0 10 1}}
 *    <li class="item">Item {{this}}</li>
 * {{/for}}
 */
Handlebars.registerHelper('for', function(beginIndex, endIndex, increment, block) { //No I18N
    if(isNaN(beginIndex) || isNaN(endIndex)) {
        throw new Error("#for helper ::: beginIndex or endIndex is invalid.");  //No I18N
        return "";  //No I18N
    }
    if(isNaN(increment)) {
        block = increment;
        increment = 1;
    }
    var output = "";  //No I18N
    for(var i = beginIndex; i <= endIndex; i += increment) {
        output += block.fn(i);
    }
    return output;
});

// helper for setting the value where null might be needed. (Handlebars doesn't set the null value to the html by default)
Handlebars.registerHelper('setValue', function(value){	//NO I18N
  	if(value) {
  		return value;
  	} else {
  		return 'null';	//No I18N
  	}
});

// helper for checking values in the filter
Handlebars.registerHelper('isFilter', function(diff) //NO I18N
{
    if ($historyvar.filter_values.length == 0 || $history.CheckFilterValues(diff)) {
    	$historyvar.noHistory = false;
        return true;
    } 
    else
    {
        return false;
    }
});

// helper for replacing null with None
Handlebars.registerHelper('nullReplace', function(value, i18nValue) { //NO I18N
  if (value == null || value == 'null' || value=="") {
      /**
       * If i18nValue exists, we display the value of that key. Otherwise, we will display "none".
       */
      return i18nValue.string ? i18nValue.string : translate('common.none'); //NO I18N
  } else {
      return value;
  }
});

// helper for checking null or empty values
Handlebars.registerHelper('isvalid', function(value, isField, allowNull) { //NO I18N
    if (isField != true && value && value !== "null" ){
        return true;
    }else if(isField == true){
      // if allowNull is true field should be null, if allow null is false field shouln't be null and it also shouldn't be id.
      if((allowNull == true && (value == "null" || value == null)) || (allowNull != true && ((typeof value == 'string' && value != 'id' && value != "null") || (typeof value == "object" && value != null && value.name !="id" && value.name != "null")))) {
        return true;
      }else{
        return false;
      }
    } else {
        return false;
    }
});

// helper for checking panel
Handlebars.registerHelper('isPanel',function(){ //NO I18N 
	if($historyvar.isPanel == true){
		return true;
	}
	return false;
});

Handlebars.registerHelper('NoHistory', function(){ //NO I18N
	return $historyvar.noHistory;
});

// helper for checking current date with previous stored date
Handlebars.registerHelper('Comparison_Date',function(current_date){ //NO I18N 
	if($historyvar.previous_date == current_date){
		return false;
	}else {
		$historyvar.previous_date = current_date;
		$historyvar.isPanel = true;
		return true;
	}
});

/** iniline-if helper for hbs - if the condition is true it will return the trueVal argument else falseVal argument */
Handlebars.registerHelper('ternary', function(condition, trueVal, falseVal){ //NO I18N
  if(condition) {
    /** since the empty array return true in js, the length is checked only if the condition is an array and return accordingly */
    if(jQuery.isArray(condition)) {
      if(condition.length > 0) {
        return trueVal;
      } else {
        return falseVal;
      }
    }
    return trueVal;
  } else {
    return falseVal;
  }
});

// helper for checking Popup fields values
Handlebars.registerHelper('showDiffInPopup', function(value) { //NO I18N 
  var isPopupfield = false;
  var popupFields = $historyvar.options.diffInPopupFields;
  if(popupFields && popupFields.length > 0){
    if(value.display_value){
      isPopupfield = popupFields.indexOf(value.display_value) != -1;
    }else if(value.name){
       isPopupfield = popupFields.indexOf(value.name) != -1;
    }else{
      isPopupfield = popupFields.indexOf(value) != -1;
    }
  }
  return isPopupfield;
});


//To get the Attachment Size values in KB and MB from Bytes
Handlebars.registerHelper('getAttachmentSize', function(size){  //NO I18N
  if(size >= 1024 && size < 1048576) {
    size = Math.round((size * 100)/1024) / 100;
    return size + " KB" //NO I18N
  } else if(size >= 1048576) {
    size = Math.round((size * 100)/1048576) / 100;
    return size + " MB" //NO I18N
  } else {
    return size + " B"; //NO I18N
  }
});

/*
 * Checks if the user has the give role permission
 */
Handlebars.registerHelper('containsRole', function(role){  //NO I18N
  var userRoles = window.sdp_user.ROLES ? window.sdp_user.ROLES : $req.sdp_user.ROLES;
  if(role && userRoles.indexOf(role) > -1) {
    return true;
  } else {
    return false;
  }
});

/*    
 * Returns the time difference in min(s) / hour(s) / day(s) for the given from_time.    
 * If the to_time is not provided, then difference will be taken between the current time and the given from_time   
 */   
Handlebars.registerHelper('getTimeDiff', function(from_time, to_time, options){  //NO I18N    
  if(isNaN(to_time) || to_time == null) {   
    return window.getTimeDiff(from_time);     
  } else {    
    return window.getTimeDiff(from_time, to_time);    
  }   
});

Handlebars.registerHelper("isTech",function(){ //NO I18N
  if(sdp_user.USERTYPE === 'Technician'){
    return true;
  }else{
    return false;
  }
});

/* 
 * returns true, if the string | array (param1) contains the substring | element (param2) 
 */
Handlebars.registerHelper('contains', function(param1, param2, options) { //No I18N
  if(!param1) {
    return false;
  }
  if(param1.indexOf(param2) !== -1) {
    return true;
  } else {
    return false;
  }
});

/*
 * returns true, if object array (param1) contains the given id (param2) 
 */
Handlebars.registerHelper('containsObj', function(objArr, id, options) { //No I18N
  if(!objArr) {
    return false;
  }
  for(var i = 0, len = objArr.length; i < len; i++) {
    if(objArr[i] && objArr[i].id == id) {
      return true;
    }
  }
  return false;
});

/* 
 * returns the type of the conversation if the type is 'system_notification' or 'notes'
 * else returns 'email' for all other conversation types 
 */
Handlebars.registerHelper('getConversationType', function(type) { //No I18N
  if(type === "system_notification" || type === "notes") {  //No I18N
    return type;
  } else {
    return "email"; //No I18N
  }
});

/**
 * concatenating the strings to form a single string
 */
Handlebars.registerHelper('concat', function(options){ //No I18N
    var concatstr = ""; //No I18N
    if(options){
      if(arguments.length > 1) {
        for(var i=0; i<arguments.length; i++) {
          if(typeof arguments[i] !== "object" && typeof arguments !== "undefined") {
            concatstr += arguments[i];
          }
        }
      } else {
        concatstr = options;
      }
    }
    return concatstr;
});

/**
 * Encodes the content that are passed as the arguments to the helpers (which are not being encoded by Handlebars)
 */
Handlebars.registerHelper('ehtml', function(content) {  //No I18N
  return e_html(content);
});

/**
 * Encodes the content that are passed as the arguments to the helpers (which are not being encoded by Handlebars)
 */
Handlebars.registerHelper('encodeAttr', function(content) {  //No I18N
  return e_attr(content);
});

/**
 * Encodes the content that are passed as the arguments to the helpers (which are not being encoded by Handlebars)
 */
Handlebars.registerHelper('e_param', function(content) {  //No I18N
  return e_param(content);
});

// Checking Index
Handlebars.registerHelper('checkIndex', function(params,val) { //No I18N
    if(params % val === 0){
        return true;
    }
});

Handlebars.registerHelper('getVariableOrFunction', function(variablename){ // No I18N
  var parVar = window;
  var a = variablename.split('.');
      for (var i = 0, n = a.length; i < n; ++i) {
          var k = a[i];
          if (k in parVar && parVar[k] != null) {
              parVar = parVar[k];
          } else {
              return;
          }
      }
      return parVar;
});
Handlebars.registerHelper('getValueByKey', function(dataObject, variablename){ // No I18N
  var value = table_comp.getFieldsRequiredByString(dataObject, variablename);
      return value;
});
/**
 * Returns if the given module should be selected by default in Global search for the current tab
 */
Handlebars.registerHelper("selectSearch", function(module, current_tab, options) {  //No I18N
  return selectGlobalSearch(module, current_tab, options);
});

/**
 * Returns the placeholder for the Global search based on the selected module and its subitem
 */
Handlebars.registerHelper("searchPlaceholder", function(current_tab, items, options) {  //No I18N
  return globalSearchPlaceholder(current_tab, items, options);
});

/**
 * Prints the given 1D array with provided separator
 * By default, the elements are printed with comma separator
 */
Handlebars.registerHelper('printArray', function(options) {  //No I18N
  if(options){
    if(!jQuery.isArray(arguments[0])) {
      throw new Error("printArray helper: The first arugment provided to the helper is not an array."); //NO I18N
      return "";  //No I18N
    }
    var separator = ", "; //No I18N
    if(arguments.length > 1 && typeof arguments[1] !== "object" && typeof arguments !== "undefined") {
      separator = arguments[1];
    }
    if(arguments.length > 2 && typeof arguments[1] !== "object" && typeof arguments !== "undefined") {
      wrapper = arguments[2];
      wrapper = jQuery(wrapper);
      for(var i=0; i<arguments[0].length; i++) {
        var clone = wrapper.clone();
        clone[0].innerHTML = arguments[0][i];
        arguments[0][i] = clone[0].outerHTML;
      }
    }
    return arguments[0].join(separator);
  }
});

/**
 * Returns if the current index is the last element of the array
 */
Handlebars.registerHelper('isLast', function(options) {  //No I18N
  if(arguments.length > 1) {
    if(arguments[0] && arguments[0].constructor === Array) {
     return arguments[0].last() == arguments[1];
    } else {
      if(arguments[0].constructor == Object)
      {
          var lastKeyInJson = Object.keys(arguments[0]).last();
          return arguments[0][lastKeyInJson] == arguments[1]
      }
      else
      {
        throw new Error("isLast helper: The first arugment provided to the helper is not an array."); //NO I18N
      }
      
    }
  } else {
    throw new Error("isLast helper: Two arguments are required ( array, value )."); //NO I18N
  }
});

Handlebars.registerHelper('isFirst', function(options) {  //No I18N
  if(arguments.length > 1) {
    if(arguments[0] && arguments[0].constructor === Array) {
     return arguments[0].first() == arguments[1];
    } else {
      if(arguments[0].constructor == Object)
      {
          var lastKeyInJson = Object.keys(arguments[0]).first();
          return arguments[0][lastKeyInJson] == arguments[1];
      }
      else
      {
        throw new Error("isFirst helper: The first arugment provided to the helper is not an array."); //NO I18N
      }
    }
  } else {
    throw new Error("isFirst helper: Two arguments are required ( array, value )."); //NO I18N
  }
});


Handlebars.registerHelper('isLastElement', function(options) {  //No I18N
  if(arguments.length > 1) {
    if(arguments[0] && arguments[0].constructor === Array) {
      if(isNaN(parseInt(arguments[1]))) {
        throw new Error("isLastElement helper: The second arugment provided to the helper is not an number."); //NO I18N
        return;
      }
      if(arguments[0].length -1 == parseInt(arguments[1])) {
        return true;
      } else {
        return false;
      }
    } else {
      throw new Error("isLastElement helper: The first arugment provided to the helper is not an array."); //NO I18N
    }
  } else {
    throw new Error("isLastElement helper: Two arguments are required ( array, current index )."); //NO I18N
  }
    });
Handlebars.registerHelper('jsonArrToStr',function(jsonArr){//NO I18N
    var concatString='',i=0;
    if(jsonArr){
        for(i=0;i<jsonArr.length;i++){
            var obj=jsonArr[i];
            concatString+=obj.name;
            if(i<jsonArr.length-1){
                concatString+=" , ";
            }
        }
    }
    if(concatString.length==0){
        concatString='-';
    }
    return concatString;
});
//zia starts(need to check Thangamani)
Handlebars.registerHelper('ellipsis2', function(len, str) {//No I18N
  if (str.length > len) {
    return str.substring(0,len) + '...';
  }
  return str;
});
/*
* Appends dimensions(_48x48,_100x80,_450x350) after the file name
*/
Handlebars.registerHelper('addDimensions',function(param1,param2){ //NO I18N
    return appendDimensions(param1,param2)
})

/*make the checkbox options as selected
*/
Handlebars.registerHelper('checked',function(param1){ //NO I18N
  return (param1)?'checked="checked"':""; //NO I18N
})

/* Or logic */
Handlebars.registerHelper('or',function(){//NO I18N
    var params=[];
    for(i=0;i<arguments.length-1;i++){
        params.push(arguments[i]);
    }
    return booleanOr(params)
})

Handlebars.registerHelper('and',function(){//NO I18N
    var params=[];
    for(i=0;i<arguments.length-1;i++){
        params.push(arguments[i]);
    }
    return booleanAnd(params)
})

/**
 * This helper will take a single value and return its logical negation
 */
Handlebars.registerHelper('not', function(value) { //NO I18N
  /**
   *  If 'value' is truthy, it returns false; if 'value' is falsy, it returns true
   */
  return !value;
});

Handlebars.registerHelper('hasKey', function(params, options) {//NO I18N
    var hasKey=false;

    if(Object.keys(params).length>0){
        hasKey=true;
    }
    return hasKey;
 });

Handlebars.registerHelper('getElemByKey', function(metainfo, field) {//NO I18N
      return metainfo && metainfo[field] || undefined;
 });

  Handlebars.registerHelper('is_even', function(conditional, options) {//NO I18N
  if((conditional % 2) == 0) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('is_odd', function(conditional, options) {//NO I18N
  if((conditional % 2) == 1) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});


Handlebars.registerHelper('showValue',function(value,display_type){//NO I18N
   var concatString='',i=0;
   var retVal=(display_type=='pick_list')?translate('sdp.common.notassigned'):'-';//NO I18N

   if(value){
       if(display_type=='multi_line'||display_type=='single_line'||display_type=='radio'||display_type=='decimal'){
          retVal=value;
       }
       else if(display_type=='datetime'||display_type.startsWith('Date/Time')){
          retVal=value.display_value;
       }
       else if(display_type=='pick_list'){
          retVal=(value.name)?value.name:value;
       }
       else if(display_type=='CheckBox'||display_type=='check_box'||display_type=='multi_select'||display_type=='MultiSelect'){
          if(value){
              for(i=0;i<value.length;i++){
                var obj=value[i];
                if(obj){
                  concatString+='<span class="disp-b mb5">'+e_html((obj.name)?obj.name:obj) +'</span>';
                }
              }
          }
          if(concatString.trim().length==0){
             concatString='-';
          }
          retVal=concatString;
       }
       else{
           retVal=(value.name)?value.name:value;
       }
   }
   return retVal; 
});

Handlebars.registerHelper('headerIcon',function(id){ // NO I18N
  return $header.headerIconMapper(id);
});

Handlebars.registerHelper('headerIconTabs',function(id){ // NO I18N
  return $header.headerIconMapperTabs(id);
});

Handlebars.registerHelper('quickActionsIcon',function(id){  // NO I18N
  if(id) {
    return '<span class="cspr th-' + id + ' icon-sm mr5"></span>';
  }
  return '';
});

/*
 * Executes given js method while rendering the Handlebars templates
 */
Handlebars.registerHelper("execFunc", function(method, context) { //No I18N
  context = context || window;
  return execFuncByName(method, context);
});

/**
 * Converts the given cost ( number | string ) to the decimal format with DB configured number of digits in decimal
 */
Handlebars.registerHelper("formatCost", function(cost) {  //No I18N
  return window.getFormattedCost(cost);
});


/**
 * Handlebars swith case starts
 */
 Handlebars.__switch_stack__ = [];
 Handlebars.registerHelper("switch", function(value, options) { //No I18N
     Handlebars.__switch_stack__.push({
         switch_match: false,
         switch_value: value
     });
     var html = options.fn(this);
     Handlebars.__switch_stack__.pop();
     return html;
 });

 Handlebars.registerHelper("case", function(value, options) { //No I18N
     var args = Array.from(arguments);
     var options = args.pop();
     var caseValues = args;
     var stack = Handlebars.__switch_stack__[Handlebars.__switch_stack__.length - 1];
     if (stack.switch_match || caseValues.indexOf(stack.switch_value) === -1) {
         return '';
     } else {
         stack.switch_match = true;
         return options.fn(this);
     }
 });

 Handlebars.registerHelper("default", function(options) { //No I18N
     var stack = Handlebars.__switch_stack__[Handlebars.__switch_stack__.length - 1];
     if (!stack.switch_match) {
         return options.fn(this);
     }
 });
/**
 * Handlebars switch case ends
 */

//Security banner
Handlebars.registerHelper('securityBannerTotalCount', function(securityBanner) { // NO I18N
    return (securityBanner.admin_password?1:0)
    	 + (securityBanner.guest_password?1:0)
    	 + (securityBanner.user_account_failure?1:0)
    	 + (securityBanner.reset_password_first_login?1:0)
    	 
    	 + (securityBanner.two_factor_auth?1:0)
    	 + (securityBanner.disableConcurrentLogin?1:0) 
    	 + (securityBanner.inActiveSessionTimeout?1:0) 
    	 + (securityBanner.mobileAppSessionTimeout?1:0) 
    	 + (securityBanner.isPasswordEncryptionNotEnabled?1:0) 

    	 + (securityBanner.dc_admin_password?1:0) 
    	 + (securityBanner.backup_password?1:0)
    	 + (securityBanner.https_mode?1:0)
    	 + (securityBanner.isAttachmentsNotStoredAsPasswordProtected?1:0)

    	 + (securityBanner.disableDomainDropDown?1:0) 
    	 + (securityBanner.disableShowFilterDomainList?1:0) 
    	 + (securityBanner.disableHTTPCompression?1:0) 
    	 + (securityBanner.disableClipboardContentOnPasswordFields?1:0)
    	 + (securityBanner.disableAntivirusScanning?1:0)
    	 + (securityBanner.disablePushNotificationForURLAccessViolation?1:0)
    	 + (securityBanner.disableThrottles?1:0)

    	 + (securityBanner.password_policy?1:0)
    	 
    	 + (securityBanner.attachmentSettings?1:0)
    	 
    	 + (securityBanner.allowNonLoginUsersToViewSolution?1:0)
    	 + (securityBanner.allowLoginUsersForApprovalAction?1:0)
    	 
    	 + (securityBanner.enableFileProtection?1:0)
    	 
    	 + (securityBanner.assignLowPrivilegeRolesInIntegrationKey?1:0)
    	 + (securityBanner.attachmentPathError?1:0)
	 + (securityBanner.ro_user_configured?0:1)
    	 + (securityBanner.dynamicUserAddtion?1:0)
	 + (securityBanner.dynamicUserLogin?1:0)
    	 + (securityBanner.password_policy_expires_never?1:0)
	 + (securityBanner.acceptEmailFromNewUser?1:0)
	 + (securityBanner.autoUpdate_disabled?1:0)
	 + (securityBanner.isLocalIPEnabled?1:0)

});

//Security banner
Handlebars.registerHelper('securityBannerAttachmentTotalCount', function(securityBanner) { // NO I18N
  return (securityBanner.attachmentPathError?1:0)
});

/** Add index plus  one on each */
Handlebars.registerHelper("inc", function(value, options){ //No I18N
    return parseInt(value,10) + 1;
});

/*To render the HTML in given destination ID - */
Handlebars.registerHelper("hbs_wormhole", function(destinationId, options){ //No I18N
  jQuery("#" + destinationId).html(options.fn(this));
});
//helper to check value is an array
Handlebars.registerHelper('isArray',function(value){ // NO I18N
  if(Array.isArray(value)){
    return true;
  }
});

// helper for checking multi select fields
Handlebars.registerHelper('isMultiSelectField', function(value) { //NO I18N
  var multiSelect = false;
  var multiSelectFields = $historyvar.options.multiSelectFields;
  if(multiSelectFields && multiSelectFields.length > 0){
    if(value.display_value){
      multiSelect = multiSelectFields.indexOf(value.display_value) != -1;
    }else if(value.name){
       multiSelect = multiSelectFields.indexOf(value.name) != -1;
    }else{
      multiSelect = multiSelectFields.indexOf(value) != -1;
    }
  }
  return multiSelect;
});

// helper for checking value is defind or not
Handlebars.registerHelper('isdefined', function (value) { //NO I18N
  return value !== undefined;
});

/*
helpers for msp and scp start
*/
Handlebars.registerHelper('ismsp', function() { //NO I18N
	return sdp_app.IS_MSP;
});

Handlebars.registerHelper('isscp', function() { //NO I18N
	return sdp_app.IS_SCP;
});
/*
helpers for msp and scp end
*/

// helper for escaping quotes in a string
Handlebars.registerHelper('escapeQuotesInString', function(str) //NO I18N
{
	if(str){
		return str.replace(/"/g, '\\"').replace(/'/g,"\\'");
	}
	return str;
});

Handlebars.registerHelper('startsWith', function(str, subs) { //No I18N
   return str && str.startsWith(subs);
});

//helper to return entity names for new history UI
Handlebars.registerHelper('entityName', function(name, obj){//NO I18N
  return obj[name] ? obj[name].name || obj[name].title : "";
});
/**
 * Method converts a JavaScript value to a JSON string, optionally replacing values if a replacer function is specified or optionally including only the specified properties if a replacer array is specified.
 */
Handlebars.registerHelper('sdpToJSON', function(context) { //NO I18N
  return sdpToJSON(context);
});
//Set variable value in root
Handlebars.registerHelper("setVariable", function(varName, varValue, options) {//No I18N
  options.data.root[varName] = varValue;
});

// returns day or time from day_based_time(Today||2:58 AM) index=0 returns "Today" and index=1 returns "2:58 AM"
Handlebars.registerHelper("getDayfromtime", function(day_based_time, index , options) {//NO I18N
  return day_based_time.split("||")[index];
});


//This method is specifically written for channels to remove a key from the actions object in @root
Handlebars.registerHelper("removeFromActions", function(key , options) {//NO I18N
  delete options.data.root.actions[key];
});

//This method is specifically written for channels to get the i18n key for certain action
Handlebars.registerHelper("getchanneli18n", function(key) {//NO I18N
  const permissions = {
    "edit_channel": "channel.permission.edit",//NO I18N
    "add_member": "channel.permission.add",//NO I18N
    "remove_member": "channel.remove.member",//NO I18N
    "delete_channel": "channel.delete",//NO I18N
    "post_message": "channel.permission.message",//NO I18N
    "pin_message": "channel.permission.pin",//NO I18N
    "role_change": "channel.permission.role",//NO I18N
    "archive_channel": "channel.archive"//NO I18N
  };
  return translate(permissions[key]) || key;
  });

//This method is to get i18n key for criteria conditions and operators
Handlebars.registerHelper("getI18NForCriteria", function(key) {//NO I18N
  const permissions = {
    //operators
    "and": "sdp.reports.operator.AND",//NO I18N
    "or": "sdp.reports.operator.OR",//NO I18N
    //conditions
    "is": "sdp.admin.rule.addrule.condition.is",//NO I18N
    "is not": "sdp.admin.rule.addrule.condition.isnot",//NO I18N
    "contains": "sdp.admin.rule.addrule.condition.contains",//NO I18N
    "not contains": "sdp.admin.rule.addrule.condition.dncontain",//NO I18N
    "starts with": "sdp.admin.rule.addrule.condition.begins",//NO I18N
    "ends with": "sdp.admin.rule.addrule.condition.ends"//NO I18N
  };
  return permissions[key];
});

//This method is to parse JSON
Handlebars.registerHelper("parseJSON", function(value) {//NO I18N
  return JSON.parse(value);
});

//To have common nonce 
Handlebars.registerHelper('getNonce', function(){ //NO I18N  
  return window.sdpNonce;
});//helper to remove html tags from content of announcement response
Handlebars.registerHelper('removeHTML', function(value,option) {  //No I18N
  var newDiv = jQuery('<div></div>').html(value)
  var content=jQuery(newDiv)[0].innerText;
  return (option=="trim")? content.trim():content;//No i18n
});

//helper functions for encoding JavaScript and CSS
Handlebars.registerHelper("encodeJS", function(str) { //NO I18N
  return ZSEC.Encoder.encodeForJavaScript(str);
});
Handlebars.registerHelper("encodeCSS", function(str) { //NO I18N
  return ZSEC.Encoder.encodeForCSS(str);
});
