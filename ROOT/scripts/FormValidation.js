//$Id$
/* Array conatins elements name and type and its mandatory or not*/
var mandatoryListArray = [];

/*form Validation function */
var counterror = 0;
var formCheckValid = (function(){
  /*Name of the form*/
  var formName = "";
  /*form Validation Intialsation without rules*/
  //parameter name can be passed as form name or form id. For ex - "[name=ChangeFormName]" / "#ChangeFormId"
  var formValidInt = function(name){
	  formName = name != undefined ?jQuery(name) : formName;
      formName.validate({
          onkeyup: function(element) {
            jQuery(element).valid();
            counterror = 0;
          },
          onchange: function(element){
            jQuery(element).valid();
            counterror = 0;
          },
          onclick: false,
          onfocusout: false,
          rules: {},
          errorClass: 'error-text',	//NO I18N
          errorElement: "span",	//NO I18N
          errorPlacement: function(error, element) {
          counterror++;
            if(counterror == 1 && error[0].textContent != ''){
              position = element.position();
              vertPosi = element.height()/2;
              element.closest(".nrcnt").append(error);	//NO I18N
              error.addClass( 'alert alert-danger alert-arrow p5' ).css({ 'position':'absolute','overflow':'visible','z-index':'100','top':'25px' }); 	//NO I18N
            }
            element.focus();
          },
          success: function(error,element){
            error.remove();
          }
      });
  };
  /*form Event triggering for change,click and blur*/
  var formEvent = function(){
     // formName.find("select").change(function(){formCheckValid.formRules(); counterror=0;});
      formName.find("select").select2().on('change',function(){ formCheckValid.elementValid(jQuery(this).attr('name')); counterror=0;});
      formName.find("input").on('click', function(){formCheckValid.formRules(); counterror=0;});
      formName.find("input").on('blur', function(){formCheckValid.formRules(); counterror=0;});
  };
  /*form rules initializing for validation accoding to array list
    Params : m = Passed boolen (eg. true)*/
  var formRules = function(m){
      /* Steps:
              1. Form validated 
              2. form rules are initialized according to array list 
              3. if m is true form check for valid()*/
      formCheckValid.formValidate();
      for(var i=0; i< mandatoryListArray.length; i++){
      	mandatoryListArray[i].name = mandatoryListArray[i].name == 'RISK' ? 'RISKID' : mandatoryListArray[i].name;
      	mandatoryListArray[i].name = mandatoryListArray[i].name == 'SUBCATEGORY' ? 'SUBCATEGORYID' : mandatoryListArray[i].name;
        var dataCheck = jQuery("[name="+mandatoryListArray[i].name+"]");
        if(mandatoryListArray[i].mandatory == true && dataCheck.length > 0){
          dataCheck.rules("add", 'required');	//NO I18N
          mandatoryListArray[i].type != '' ? dataCheck.rules('add',mandatoryListArray[i].type) : '';
          var selectcheck = dataCheck[0].nodeName == 'SELECT' ? true : false;
          dataCheck.rules('add',{	//NO I18N
            messages :{
              required : mandatoryListArray[i].message
            },
            SelectNonZero : selectcheck
          })
        }
      }
      m == true ? formCheckValid.formValid() : '';
  };
  /*form Rules Delete function */
  var formRulesDelete = function(){
  	var settings = formName.validate().settings;
  		for (var i in settings.rules){
	  	 delete settings.rules[i].required;
         delete settings.rules[i].SelectNonZero;
	   }
  };
  /* check form valid function */
  var formValid = function(mand){
      var dataCheck = formName.valid(),
          bodyError = jQuery('body').find('span.error-text');
      formCheckValid.assetCheck();
      setTimeout(function(){
	      formCheckValid.editorCheck();
      },300);
      bodyError.hide();
      bodyError.eq(0).show();
      if(mand == true){
        return dataCheck == true ? true : false;
      }
  };
  /* check for element valid function */
  var elementValid = function(ele){
    ele = ele == 'ASSET' ? 'ASSETID' : ele;	//NO I18N
    var element = jQuery('[name='+ele+']'),
        assetCheck = element.closest('.nrcnt').find('.select2-container');	//NO I18N
    element.valid();
    if(ele == 'ASSETID'){
      element.hasClass('error-text') ? assetCheck.addClass('error-text') : assetCheck.removeClass('error-text');	//NO I18N
    }
  };
  /* form remove all errors */
  var formRemoveError = function(m){
    var elementThis = jQuery('[name='+m+']');
  	elementThis.closest('span.error-text').remove();	//NO I18N
    if(elementThis.hasClass('error-text')){
      elementThis.removeClass('error-text');
      elementThis.closest('.nrcnt').find('.select2-container').removeClass('error-text');	//NO I18N
    }
  };
  /* form validate function */
  var formValidate = function(){
      formName.validate();
  };
  /* array updation function
     Params : n = Passed element name (eg. 'userNameOutgoing') 
              m = Passed boolean (eg. true / false )*/
  var MadFieldUpdate = function(n,m){
      /*Steps:
              1. name is checked in array list and its mandatory field is set according to m parameter
              2. form rules initializied 
              3. form check for valid()*/
      for(var j=0; j < mandatoryListArray.length; j++){
        if(mandatoryListArray[j].name == n){
          mandatoryListArray[j].mandatory = m;
        }
      }
      formCheckValid.formRules();
      formCheckValid.elementValid(n);
  };
  /* array insert function 
     Params : nam   = Passed element name (eg. 'userNameOutgoing') 
              typ   = Passed element type (eg. 'email')
              mand  = Passed boolean (eg. true / false ) 
              valid = Passed boolean (eg. true/false ) */
  var arrayInsert = function(nam,typ,mand,msg,valid){
      /*Steps:
              1. according to the params data is formated and pushed in array list
              2. form rules initializied 
              3. form check for valid()*/
      nam = nam == 'RISK' ? 'RISKID' : nam;	//NO I18N
      nam = nam == 'ASSET' ? 'ASSETID' : nam;	//NO I18N
      nam = nam == 'SUBCATEGORY' ? 'SUBCATEGORYID' : nam;	//NO I18N
      var pushData = { name : nam, type : typ, mandatory : mand, message : msg },
          isTrue = formCheckValid.arrayExists(mandatoryListArray,nam,true);
      isTrue == true ? '' : mandatoryListArray.push(pushData);
      formCheckValid.formRules();
      valid == true ? formCheckValid.elementValid(nam) : '';
  };
  /*Array Exists Check function 
    Params : inArry = Passed array (eg. array)
             j = Passed name of the element (eg. 'AssetId')
             k = Passed boolean (eg. true )*/
  var arrayExists = function(inArry,j,k){
	for (i = 0; i < inArry.length; i++ )
	    {
	        if (inArry[i].name == j)
	        {
	            return (k === true) ? true : inArry[i];
	        }
	    }
	    /*if(inArry.length == 0){
        return false;
      }*/
  };
  /* array delete function 
     Params : k  = Passed element name (eg. 'userNameOutgoing')  */
  var arrayDelete = function(k){
      	k = k == 'RISK' ? 'RISKID' : k;	//NO I18N
        k = k == 'ASSET' ? 'ASSETID' : k;	//NO I18N
      	k = k == 'SUBCATEGORY' ? 'SUBCATEGORYID' : k;	//NO I18N
      /*Steps:
              1. according to the k value selective array removed form array list
              2. form rules initializied 
              3. form check for valid()*/
      for(var s=0; s < mandatoryListArray.length; s++){
        if(mandatoryListArray[s].name == k){
          mandatoryListArray.splice(s,1);
        }
      }
      formCheckValid.formRemoveError(k);
      formCheckValid.formValidInt();
      formCheckValid.formRules();
  };

  /* html editor validate function */
  var editorCheck = function(){
    var isCheck = formCheckValid.arrayExists(mandatoryListArray,'FULL_DESCRIPTION',true),	//NO I18N
        editorSelect = jQuery('#ze_HTMLDesc_RFC').find('.ze');
        if( isCheck == true && parent.editor != undefined){
          if(parent.editor.isEmpty())
          {
           editorSelect.css('border-color','#a24449');	//NO I18N
           return false;
          } else{
           editorSelect.removeAttr('style');	//NO I18N
          }
        }
  };
  /* AssetID multiselect validate function */
  var assetCheck = function(){
    var selector = jQuery('input.select2-offscreen.error-text'),
        len = selector.length,
        idData;
    for(var k=0; k < len; k++){
      if(formName.find('input.select2-offscreen').hasClass('error-text')){
        idData = selector.eq(k).attr('id');
        jQuery('#'+idData).closest('.nrcnt').find('.select2-container').addClass('error-text');
      }
    }
    var selectorNew = jQuery('input.select2-offscreen.valid'),
        lenNew = selectorNew.length,
        idDataNew;
    for(var l=0; l < lenNew; l++){
      if(formName.find('input.select2-offscreen').hasClass('valid')){
          idDataNew = selectorNew.eq(l).attr('id');
          jQuery('#'+idDataNew).closest('.nrcnt').find('.select2-container').removeClass('error-text');
      }
    }
  };

  return {
    formValidInt : formValidInt,
    formEvent : formEvent,
    formRules : formRules,
    formRulesDelete : formRulesDelete,
    formValid : formValid,
    elementValid : elementValid,
    formRemoveError : formRemoveError,
    formValidate : formValidate,
    MadFieldUpdate : MadFieldUpdate,
    arrayInsert : arrayInsert,
    arrayExists : arrayExists,
    arrayDelete : arrayDelete,
    editorCheck : editorCheck,
    assetCheck : assetCheck
  }

})(jQuery);