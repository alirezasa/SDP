/* $Id$ */
/*This file contains CMDB related scripts.*/
// using in user form
function updateChanges(elementObj1,elementObj2)
{
	try
	{	
		if((elementObj1.value <= 0 || elementObj1.value == null) && (elementObj1.type == 'select-one'))
		{
			firstOptionValue = "0";
			if(elementObj2.hasChildNodes)
			{
				for(i=0;i<elementObj2.childNodes.length;i++)
				{
					testObj = elementObj2.childNodes[i];					
					if(testObj.value != 'undefined' && testObj.value != null)//NO I18n
					{					
						firstOptionValue = testObj.value;
						break;
					}
				}
			}		
			elementObj2.value = firstOptionValue;
		}
		else
		{
			elementObj2.value = elementObj1.value;		
		}

		//This block is only for add new server page to populate the product input field
		if( elementObj1.name == 'CI_SystemInfo_MODEL' && elementObj2.name == 'wsModel' )
		{
			elementObj2 = document.getElementById('componentID');//NO I18n

			if( elementObj2 != undefined && elementObj2.type == 'select-one' )
			{
				for( i=0; i<elementObj2.options.length; i++ )
				{
					if( elementObj2.options[i].innerHTML == elementObj1.value )
					{
						elementObj2.value = elementObj2.options[i].value;
					}
				}
			}
		}
	}
	catch(e)
	{
		alert(e);
		return false;
	}
}
/**
 *
 * This is used to split the query string based given parameter.
 * @params 1. delimiter(text)            : Used as delimiter.(*mandetory)
 * 	   2.escDelimiter(text)          : Used as escaped delimiter for first param(Optional).
 * 	   				   default value is same delimiter1
 *	   3.features(Object)            : Used for additional options like trimming the value.
 *	     {trimmedValues:true/false}	
 *
 *	     i.trimmedValues             : For triming the each element in return array.default value is false.
 *	     ii.concateType		 : For concating the elements in side the return array to trim into size of 3.
 *	        {FIRST/MIDDLE/LAST}        default value is middle.
 *
 * @returns the Array of splitted strings.
 *
 * */

jQuery.fn.customQuerySplitter = function(delimiter,escDelimiter,features) {

	var trimmedValues = false;
	var concateType = 'MIDDLE';//NO I18N
	var maxArrLength ;
	if(typeof(features) != 'undefined') {
		if(typeof(features) == 'string') {features = JSON.parse(features)};
		if(features.trimValues) trimmedValues = true;
		if(features.concateType != undefined)  {maxArrLength=3;concateType = features.concateType.toUpperCase();}
	}
	var returnObj = new Array();
	var noOfObjects = 0;

	if(typeof(delimiter) == 'undefined') throw 'delimiter is not specified!'; //NO I18N

	if(typeof(escDelimiter) == 'undefined' ) escDelimiter = delimiter; 
	
	var query = this.val();
	if(typeof(query) == 'undefined' || query == '') throw 'Query is Empty or Undefined'; //NO I18N
	query = query.trim()+delimiter;

	do {
		if(query.trim() == '') break;
		var startsWithSecDD=query.startsWith(escDelimiter);
		var startIndx = 0;
		if(startsWithSecDD) {
			var endInd = query.indexOf(escDelimiter,1);
			if(endInd < 0) {
				endInd = query.length;
			}
			var value = query.substring(startIndx+1,endInd);
			if(trimmedValues) {
				value = value.trim();
			}
			returnObj[noOfObjects++]=value;
		}
		else {
			var startsWithfirstD=query.startsWith(delimiter);
			if(startsWithfirstD) {
				if(query.charAt(1) == escDelimiter) {
					startIndx = startIndx+2;
					var endInd = query.indexOf(escDelimiter,startIndx);
					if(endInd < 0) {
						endInd = query.length;
					}
				}
				else {
					startIndx = startIndx+1;
					var endInd = query.indexOf(delimiter,startIndx);
					if(endInd < 0) {
						endInd = query.length;
					}
				}
				var value = query.substring(startIndx,endInd);
				if(trimmedValues) {
					value = value.trim();
				}
				returnObj[noOfObjects++]=value;
			}
			else {
			   var endInd = query.indexOf(delimiter);
			   var value = query.substring(startIndx,endInd);
			   if(trimmedValues) {
				   value = value.trim();
			   }
			   returnObj[noOfObjects++]=value;
			}
		}
		query = query.substring(endInd+1,query.length);
		if(!(query.split(delimiter).length >2 || query.split(escDelimiter).length > 2)) {
			var value = query;
			if(trimmedValues) {
				value = value.trim();
			}
			if(value != '') {
				returnObj[noOfObjects++]=value;
			}
			query = '';
		}
	} while(query.split(delimiter).length >2 || query.split(escDelimiter).length > 2);

	//concating the Data.
	var arrayLength =  returnObj.length;
	if(maxArrLength != undefined && maxArrLength <arrayLength) {
		var concatedObj = ['','',''];
	        var sliceStartInd=1;
		var sliceEndInd=arrayLength-1;
		if(concateType == 'LAST') {
			sliceStartInd = 2;
			sliceEndInd = arrayLength;
			concatedObj[0] = returnObj[0];
			concatedObj[1] = returnObj[1];
		}
		else if(concateType == 'FIRST') {
			sliceStartInd = 0;
			sliceEndInd = arrayLength-2;
			concatedObj[1] = returnObj[arrayLength-2];
			concatedObj[2] = returnObj[arrayLength-1];
		}
		else {
			concatedObj[0] = returnObj[0];
			concatedObj[2] = returnObj[arrayLength-1];
		}

		jQuery.each(returnObj.slice(sliceStartInd,sliceEndInd),function(index,data) {
						if(index = 0) {
							concatedObj[sliceStartInd] = data;
						}
						else {
							concatedObj[sliceStartInd] = (concatedObj[sliceStartInd]+delimiter+data).trim();
						}
				}
			   );
		returnObj = concatedObj;
	}
	return returnObj;
}

/**
 * This method is used to load the Options to Select Object.
 * @param responseObj is a JSON Object which should contain the 
 * 	1.suggestions as an Array.(*Mandetory)
 * 	2.title  as an Array.(Optional,If not this will be replaced with suggestions)
 * 	3.data  as an Array.(Optional,If not this will be replaced with suggestions)
 *
 *      Eg : [ "suggestions": ['Option1','Option2'] , "data": ['value1','value2'] , "title": ['title1','title2'] ]
 *
 * */
var msMovecnt=0;
jQuery.fn.loadOptions = function(responseObj,features) {
	var titleAsHTML = false;
	if(typeof(features) !='undefined') {
		if(features.title == 'HTML') titleAsHTML = true;
	}
	var optionsDataArray = responseObj.suggestions;
	var selectElement = this;
	var eleId= this.attr('id'); //no i18n
	selectElement.children().remove();
	selectElement.show();
	if(optionsDataArray && optionsDataArray.length > 0 ) {

		var optionsIdArray = optionsDataArray;
		if(responseObj.data)  optionsIdArray = responseObj.data;

		var titleArray = optionsDataArray;
		if(responseObj.title) titleArray = responseObj.title;
		var count=1;
        	jQuery.each(optionsDataArray,function(index,optionData) {
				var optVal = optionsIdArray[index];
	
				if(eleId == 'selectedRELID'){
					if(count%2 == 0){
						optionData = "\u00A0\u00A0\u00A0\u00A0"+optionData;	// no i18n
					}
					
				}
				
          			var option = new Option(optionData,optionsIdArray[index]);
				if(!titleAsHTML) option.title = titleArray[index]+'';
				else  {
					var titleDiv=  $('title_div_'+optionsIdArray[index]);//NO I18N
					divExists = true;
					if( titleDiv== undefined ) {
						divExists = false;
						var titleDiv=document.createElement('DIV');//NO I18N
					}
					titleDiv.setAttribute('class','alertBG1'); //NO I18N
					titleDiv.id='title_div_'+optionsIdArray[index];//NO I18N
					titleDiv.innerHTML = encodeHTML(titleArray[index])+'';//NO I18N
					titleDiv.setAttribute('style','display:none');//NO I18N
					if(!divExists) jQuery('#selectedCIID1').prevAll('DIV').append(titleDiv);//NO I18N
				}
				option.id = 'ID_'+optionsIdArray[index]+'';
				if(eleId == 'selectedRELID'){
					if(count%2 == 1){
						option.className = 'sb';
					}
				}
				count++;
					selectElement.append(option,null);
					
        		}
		);

		if(titleAsHTML) {
			jQuery.each(optionsIdArray,function(index,optionData) {
					selectElement.children('OPTION#'+optionData).on('mouseover',function(event){//NO I18N
													msMovecnt =0;
													leftVal=event.pageX-jQuery(this).offset().left+50+"px";//NO I18N
													topVal=event.pageY+"px";//NO I18N
									                                jQuery('div#title_div_'+optionData).css({left:leftVal,top:topVal}).fadeIn(100);//NO I18N
										                  }
										    );

					selectElement.children('OPTION#'+optionData).on('mouseout',function(event){//NO I18N
													msMovecnt =0;
													jQuery('div#title_div_'+optionData).fadeOut(2);//NO I18N
												 }
										    );
					selectElement.children('OPTION#'+optionData).on('mousemove',function(event){//NO I18N
													msMovecnt++;
													if(msMovecnt<10) {
														leftVal=event.pageX-jQuery(this).offset().left+50+"px";//NO I18N
														topVal=event.pageY-jQuery(this).parent().height()+"px";//NO I18N

														jQuery('div#title_div_'+optionData).css({left:leftVal,top:topVal})//NO I18N
													}
													else {
    														jQuery('div#title_div_'+optionData).fadeOut(2);//NO I18N
													}
												       }
											 );
					});
		}
	}
}

function showMap(url,windowName) {
	var params  = 'width='+screen.width;//NO I18N
	params += ', height='+screen.height;//NO I18N
	params += ', top=0, left=0';//NO I18N
		params += '';//NO I18N

	newwin=window.open(url,windowName, params);
	if (window.focus) {newwin.focus()}
	return false;
}

function popoutMap(ciId, d3) {
	if(d3 != null) {
		showMap('/RelationshipMapD3.do?operation=showRelD3&ciId='+ciId,'RelationshipMap_WS');	//NO I18N
	}
	else {
	showMap('/RelationshipMap.do?action=showRelMap&loadDataFromParent=true&ciId='+ciId,'RelationshipMap_WS');	//NO I18N
	}
	//showMap('/RelationshipMap.do?ciId='+ciId,'RelationshipMap_WS');	//NO I18N
}

//Searcing the field........
var jQueryCacheData = null;
var jQueryCacheChar = null;
var jQueryCacheLiIndex = null;
var jQueryCachedLiObject = null;

// using in custom report page
function searchAndSelectInDropDown(dropDownId,firstLiId,ulIdToScroll,idForSearchResult,chosenCiTypeId)
{
jQuery("#"+dropDownId).on('keydown', function (e) {//No I18N
  if ((65 <= e.which && e.which <= 65 + 25) || (97 <= e.which && e.which <= 97 + 25)) { 
    var keyValue = e.which;
    if((97 <= e.which && e.which <= 97 + 25)){
        keyValue -=  32;
    }
    var keyStr = String.fromCharCode(keyValue);
    if(keyStr != jQueryCacheChar){
      jQueryCacheChar = keyStr;
      jQueryCacheData = jQuery("li[searchchar='"+keyStr+"']");//No I18N
      jQueryCacheLiIndex = 0;
    }
         
    var currentjQueryLiLength = jQueryCacheData.length;

    if( jQueryCachedLiObject != null ){
      jQuery(jQueryCachedLiObject).removeAttr('className');//No I18N
    }
         
    if( currentjQueryLiLength >0 ){
      if( ( currentjQueryLiLength-1 ) < jQueryCacheLiIndex ){
        jQueryCacheLiIndex = 0;
      }

      jQueryCachedLiObject = jQueryCacheData[jQueryCacheLiIndex];
      updateSelecteStyleAndData(ulIdToScroll,idForSearchResult,chosenCiTypeId);
      jQueryCacheLiIndex += 1; 
    }

  } else if (e.which == 13) {
  }
  else if(e.which == 38 || e.which == 40){
    // for up and down keys...
    if( jQueryCachedLiObject != null ){
      var count = jQuery(jQueryCachedLiObject).attr('count');//No I18N
      if(e.which == 40 && count > 0){
        count = +count +1;
      }
      else if(e.which == 38 && count > 0){
        count = +count -1;
      }
      
      if(count == 0 ){
        count = count + 1;
      }
      if(jQuery("li[count='"+count+"']").length ==0){//No I18N
        return false;
      }
      jQuery(jQueryCachedLiObject).removeAttr('className');//No I18N
      jQueryCachedLiObject = jQuery("li[count='"+count+"']"); //No I18N

      updateSelecteStyleAndData(ulIdToScroll,idForSearchResult,chosenCiTypeId);
      
      jQueryCacheLiIndex = 0; 
    }

  }
});

  //In this we are using iframs so,this function maye called multiple time.Even though we are taking only one
  jQuery('body').off('click');//No I18N
  jQuery('#'+firstLiId).off('click');//No I18N
  jQuery('body').on('click', function() {//No I18N
  jQuery('#'+firstLiId+' iframe').hide();//No I18N
  jQuery('#'+firstLiId).removeClass('mnuActive');//No I18N
  jQuery('#'+firstLiId).addClass("mnuNormal");//No I18N
  
  });

   jQuery("#"+firstLiId).click//No I18N
  (
  	function(e)
	{
		if (jQuery(this).is('.mnuNormal') && !jQuery(this).hasClass('.disable-opacity3')) {//No I18N
		         jQuery(this).removeClass('mnuNormal');//No I18N
		         jQuery(this).addClass("mnuActive");//No I18N
		         jQuery('#'+firstLiId+' iframe').show();//No I18N
		} else {
		         jQuery(this).removeClass('mnuActive');//No I18N
		         jQuery(this).addClass("mnuNormal");//No I18N
			 jQuery('#'+firstLiId+' iframe').hide();//No I18N
		}
		e.stopPropagation();
	}
   );



}

var floatingmenubarscroll;
(function($) {
    $(document).ready(function() {
    	jQuery( document ).on( 'click' , '#operation_status' , function(){ // No i18n
    		setTimeout(function(){
    			if( !jQuery( '#operation_status' ).is( ':visible' )  ){  // No i18n
    				floatingmenubarscroll();
    			}
    		},100);
    	});
		floatingmenubarscroll = function() {
			if(parent.sdp_app.IS_FLOAT_MENU_ENABLED == "true" && jQuery( '.floating-menubar' ).length > 0)   // No i18n
			{
				var className = jQuery( '.floating-menubar' );			// No i18n
				try {
					var top          = className.offset().top,
					    height       = className.height(),
					    fixedElement = className.closest( 'table' ), // No i18n
					    floating_mleft,
					    floating_pleft;
						jQuery( window ).on('resize', function(){
							if ( className.css( 'position' ) == 'fixed' ){
								className.css( 'width' , fixedElement.width() ); // No i18n
							}
						});	
					$( window ).on('scroll', function() {

						var scrollPos = ( document.documentElement && document.documentElement.scrollTop ) || document.body.scrollTop;
						if ( scrollPos > top )  {
							var oldScrollLeft = jQuery( window ).scrollLeft();
							var rightWidth    = fixedElement.outerWidth();  

							if( oldScrollLeft ) {
								if( jQuery( 'body' ).css( 'direction' ) == 'ltr' ) {  // No i18n
									 floating_mleft = parseInt( className.parent().css( 'margin-left' ) ); // No i18n
									 floating_pleft = parseInt( className.parent().css( 'padding-left' ) ); // No i18n

									if( oldScrollLeft >= fixedElement.offset().left+1 ) {  // No i18n
										var offsetScrollLeftval = Math.abs( fixedElement.offset().left - oldScrollLeft );  
										    offsetScrollLeftval = offsetScrollLeftval - ( floating_mleft + floating_pleft );
										className.css({
										  "top": "0px","left":-offsetScrollLeftval, "position": "fixed", "z-index": 98,"width":rightWidth		//No i18n
										});
									}
									else {
										var offsetScrollLeftval = Math.abs( oldScrollLeft - fixedElement.offset().left );  
											offsetScrollLeftval = offsetScrollLeftval + ( floating_mleft + floating_pleft );
										className.css({
										  "top": "0px","left":offsetScrollLeftval, "position": "fixed", "z-index": 98,"width":rightWidth		//No i18n
										});
									}
								}
								else {
									floating_mleft    = parseInt( className.parent().css( 'margin-right' ) ); // No i18n
									floating_pleft    = parseInt( className.parent().css( 'padding-right' ) ); // No i18n
									win_scroll_left   = -(oldScrollLeft);
									fixedElement_left = jQuery( window ).width() - ( fixedElement.offset().left + fixedElement.outerWidth() );

									if( win_scroll_left <= fixedElement_left+1 ) {  
										var offsetScrollLeftval = Math.abs( fixedElement_left - win_scroll_left );
											offsetScrollLeftval = offsetScrollLeftval + ( floating_mleft + floating_pleft );

										className.css({
										  "top": "0px","right":offsetScrollLeftval, "position": "fixed", "z-index": 98,"width":rightWidth		//No i18n
										});
									}
									else {
										var offsetScrollLeftval = Math.abs(  win_scroll_left - fixedElement_left );
											offsetScrollLeftval = offsetScrollLeftval - ( floating_mleft + floating_pleft );

										className.css({
										  "top": "0px","right":-offsetScrollLeftval, "position": "fixed", "z-index": 98,"width":rightWidth		//No i18n
										});
									}
								}
							}
							else {
								className.css({
								  "top": "0px","left": "","right":"", "position": "fixed", "z-index": 98,"width":rightWidth		//No i18n
								});
							}	
							className.css( 'box-sizing' , 'border-box' ); // No i18n
							fixedElement.css( 'margin-top' , height );  // No i18n			
						} else {
								className.removeAttr('style');  // No i18n
								fixedElement.removeAttr( 'style');  // No i18n
						}
					})
				} catch (ex) { }
			}
		}
		floatingmenubarscroll();
    })
})(jQuery);


/* Business view reorder starts */

var reorder = (function() {
	//Join columns into views
	function joinColumns(){

		var container = jQuery('.views-container');

		container.find('>ul li.view-page-num').remove();

		var elm = new Array();
		container.find('ul li').each(function(index){
			elm.push(jQuery(this).clone());
		});

		container.html('<ul class="p10 clearfix"></ul>');
		for(var i = 0; i<elm.length; i++){
			container.find('ul').append(elm[i]);
		}
	}

	//Split views into columns
	function splitColumns(){

		var container = jQuery('.views-container');
		var len  = container.find('>ul li').length;
		if(len>12){
			var m = Math.ceil(len/4); // Check no. of pages

			var n = Math.ceil(len/12); // Check no. of columns

				m = Math.ceil(m/n)*4; // Check no. of columns

			var elm = new Array();
			container.find('>ul:first li').each(function(index){
				elm.push(jQuery(this).clone());
			});

			container.find('ul').remove();

			for(var j = 0; j< n; j++){
				container.append('<ul class="p10 clearfix fl ui-sortable"></ul>');

				for(var i = 12*j; i< 12*(j+1); i++){
					if(i<len){
						container.find('ul:last').append(elm[i]);
					}
				}
			}
		}
	}

	//Set views by pages
	function setPages(){
		jQuery('.views-container>ul li.view-page-num').remove();
		jQuery('.views-container>ul li').each(function(index){
			jQuery('.views-container>ul li').eq(index*5).before('<li class="view-page-num">'+translate("sdp.reports.customReport.page")+' '+parseInt(index+1)+'</li>') //NO I18N
		});
		callSortableViews();
		//Tooltip for CMDB widget reorder after sortable
		initTooltip("#_DIALOG_LAYER");//NO I18N
	}

	//Sortable views
	function callSortableViews(){
		jQuery('.arrange-views ul').sortable({
			scroll: true, scrollSensitivity: 300,
			placeholder: "ui-state-highlight",// No I18N
			items: ">li:not(.view-page-num)", //NO I18N
			start: function(e, ui){	ui.placeholder.height(ui.item.height()); },
			update: function( event, ui ) { ui.item.addClass('dropping'); },
			stop: function( event, ui ) { var x = ui; setTimeout(function(){ x.item.attr('class','dropped'); joinColumns(); splitColumns(); setPages(); },100); },
			connectWith: ".p10" //NO I18N
		})
		.disableSelection();
	}

	function addViews(data) {
		var ul = jQuery('#viewslist');
		data.forEach(function(v) {
				var li = jQuery('<li>');//Value decode and append to li
				var nameDecoded = v.name;
        		var spandata = jQuery('<div>');//Value decode and append to li track table tooltip added for if element overlap only show tooltip for sortable issue fix
        				spandata.attr({"rel": "uitip", "title": e_attr(nameDecoded), "mode_html":true, "class":"text-overflow pr30"});
            		spandata.append(encodeHTML(nameDecoded));
            li.attr('id', v.viewId);
				var span = jQuery('<span class="cspr icon-xs drag1 mt2 pos-abs top5 right10"></span>');
						li.append(spandata);
						li.append(span);
				ul.append(li);
		});
		initTooltip("#_DIALOG_LAYER");//NO I18N
	}

	function saveOrder() {
		var reorderedList = jQuery('.arrange-views ul').sortable('toArray');//NO I18N
		jQuery.post('/BusinessView.do', {operation: 'reorderViewsPost', reorderedList:  (typeof sdpToJSON != 'undefined') ? sdpToJSON(reorderedList) : JSON.stringify(reorderedList) }, function() {//NO I18N
			closeDialog();
		    reloadPage(window);
		});
	}
	
	return {
		saveOrder: saveOrder,
		addViews: addViews,
		setPages: setPages,
		splitColumns: splitColumns
	}
})();


/* reorder ends */

/* dashboard starts */
var dashboard = (function() {
	var navPointer = 0;
	var viewsCount = 0;
	var viewData;
	var currentPage = 1;
	
	function initialize() {
		// load dashboard widgets
	    jQuery.get("/BusinessView.do", {operation: 'getWidgets'}, function(data) { //no i18n
	      if(data.length != 0)  {
	    	  
	    	// load widgets 4 at a time. 
	        viewsCount = data.length;
	        data = data.sort(function(a, b) { 
	        	if(a.position && b.position) { 
	        		return a.position - b.position;
	        	}
	        	else if(a.position && !b.position) {
	        		return -1;
	        	}
	        	else if(!a.position && b.position) {
	        		return 1;
	        	}
	        	else {
	        		return a.viewId - b.viewId;
	        	}
	       	});
	        
	        viewData = data;
	        generateViews(data.slice(0, 4));
	        // if only 4 more widgets are there, disable next
	        if(data.length <= 4) {
	          jQuery("#next").addClass("disabled"); //NO I18N
	          jQuery(".nav-pages-btn").prop("disabled", true); //NO I18N
	          jQuery("#reorder-btn").prop("disabled", true); //NO I18N
	        }
	        
	        updateViewStats();
	        addPages();

	        // Call draggable for Widget infobox to make it draggable
	        jQuery('.wdt-inner-cis').each(function(){
	          jQuery(this).draggable({ containment: jQuery(this).parent(), scroll: false });
	        });

	        // fix for widget map size and scroll bar problem
	        jQuery(window).trigger('resize');
	      }
	    });

	    // new view select2 for ci
	    // create select2
	    jQuery("#cis").sdp_select2({
			placeHolder: translate("ae.cmdb.relationshipmap.selectci"),
			url: [{
				url: "/api/v3/cmdb", //NO I18N
				field: 'cmdb' //NO I18N
			}],
		});
	    // open the select2 list
	    jQuery("#newview-btn").on('click',function() {
	        setTimeout(function() {
	          jQuery("#cis").select2("open"); // no i18n
	        }, 300);
	    });

	    // trigger click on body to close select2 list
	    jQuery("#cis").on('change', function(e) {
	        var url = "RelationshipMapD3.do?operation=showRelD3&ciId=" + e.val + ""; //NO I18N
	        window.open(url, '_blank');  //NO I18N
	        jQuery(this).select2('data', null); //no i18n
	        jQuery(document.body).trigger('click');
	    });
	   
		jQuery("#cis").on("select2-close",function(){ // No I18N
			jQuery(".ci-select2-container").removeClass("open"); // No I18N
		});	
	}
	
	// Method to call more info popup. type and forbaseci parameters are to scroll to a particular listview on load.
	function showMoreInfo(viewId, viewName, baseCiid, forBaseCI) {
		var url = "/BusinessView.do?operation=showMoreInfo&viewId=" + viewId + "&ciId=" + baseCiid + "&forBaseCI=" + forBaseCI; // no i18n
	    showURLInDialog(url, "title='" + viewName + "',modal=yes,position=absmiddle,method=GET,width=900,heigth=500"); //NO I18N
	}

	// add pages.
	function addPages() {
		var noOfPages = Math.floor(viewsCount/4) + (viewsCount % 4?1:0);
	    var pagesUl = jQuery("#nav-pages");
	    for(var i = 1; i <= noOfPages; i++) {
	    	var pagesLi = jQuery("<li>");
	      	pagesLi.append(jQuery("<a class='cur-ptr' name='page-nav' data-page-num="+i+" />", { "href": "/"}).html(getMessageForKey("sdp.reports.customReport.page") + " " + i));
	      	pagesUl.append(pagesLi);
	    }
		pagesUl.find("[name='page-nav']").off("click").on("click", function(e) {    //NO I18N
			navigatePage(parseInt(jQuery(this).attr('data-page-num')));
		});
	}

	// update navigation counters on page navigation and load the next/previous page widgets.
	function navigatePage(page) {
		if(page == currentPage) {
	      	return;
	    }
	    else {
	      	navPointer += (page - currentPage) * 4;
	      	if(page - currentPage > 0) {
	      		// navigate to next page
	        	navPointer -= 4;
	        	currentPage = page - 1;
	        	next();
	      	}
	      	else {
	      		// navigate to previous page
	        	navPointer += 4;
	        	currentPage = page + 1;
	        	previous();
	      	}
	   }
	}

	// navigation page counter
	function updateViewStats() {
		var start = navPointer + 1;
	    var end = (navPointer + 4 > viewsCount)?viewsCount:(navPointer + 4);
	    jQuery("#views-stats").html(getMessageForKey("ae.cmdb.businessview.pagecount", [Number(start), Number(end), Number(viewsCount)])); //no i18n
	}

	function previous() {
	    jQuery(".businessview").remove();

		currentPage--;
	    navPointer -= 4;
	    
	    generateViews(viewData.slice(navPointer, navPointer + 4));
	    updateViewStats();
	    // disable previous for first page
	    if(navPointer == 0) {
	    	jQuery("#previous").addClass("disabled"); //NO I18N
	    }
	    // disable next for last page
	    if(navPointer + 4 >= viewsCount) {
	    	jQuery("#next").addClass("disabled"); //NO I18N
	    }
	    else {
	    	jQuery("#next").removeClass("disabled"); //NO I18N
	    }
	    
	    jQuery(".nav-pages-btn").html(getMessageForKey("sdp.reports.customReport.page") + " " + currentPage + " <span class=\"caret\"></span>"); //no i18n
	    // Call draggable for Widget infobox
	    jQuery('.wdt-inner-cis').each(function(){
	    	jQuery(this).css('position','absolute').draggable({ containment: jQuery(this).parent(), scroll: false });  //NO I18N
	    });

	    jQuery(window).trigger('resize');
	}

	function next() {
		jQuery(".businessview").remove();

	    currentPage++;
	    navPointer += 4;
	    
	    generateViews(viewData.slice(navPointer, navPointer + 4));
	    updateViewStats();
	    
	    jQuery("#previous").removeClass("disabled"); //NO I18N
	    if((navPointer + 4) >= viewsCount) {
	    	jQuery("#next").addClass("disabled"); //NO I18N
	    }
	    jQuery(".nav-pages-btn").html(getMessageForKey("sdp.reports.customReport.page") + " " + currentPage + " <span class=\"caret\"></span>"); //no i18n
	    // Call draggable for Widget infobox
	    jQuery('.wdt-inner-cis').each(function(){
	      	jQuery(this).css('position','absolute').draggable({ containment: jQuery(this).parent(), scroll: false });  //NO I18N
	    });

	    jQuery(window).trigger('resize');
	}

	function generateViews(data) {
	    var viewUl = jQuery(".cmdb-cards");
	    var viewHTML = jQuery("#sample-content");
	    var viewContent = viewHTML.clone();
	    var viewHTMLData = new Array();
	    for(var i = 0; i < data.length; i++) {
			viewContent.removeAttr("id"); //no i18n
	      	viewContent.removeAttr("style"); //no i18n
	      	viewContent.attr("id", "view-" + data[i].viewId);
	      	viewContent.attr("class", "businessview ci-" + data[i].baseCI);
	      	var viewNameDecoded =  data[i].viewName;
                        if(viewNameDecoded.length > 50) {
                                viewContent.find(".view-name").text(viewNameDecoded.substring(0,50) + "...");
                                viewContent.find(".view-name").attr({'rel': 'uitip', "mode_html":true, title:(e_attr(viewNameDecoded))});
                        }
			else {
                                viewContent.find(".view-name").text(viewNameDecoded);
                        }
			if(data[i].ownerDetails.name != undefined) {
				viewContent.find(".view-owner").text(encodeHTML(data[i].ownerDetails.name));
				viewContent.find(".owner-contactinfo").text(data[i].ownerDetails.phone);
				viewContent.find(".owner-email").text(encodeHTML(data[i].ownerDetails.email));
			}

			viewContent.find("iframe").attr("src", data[i].url);
	      	viewContent.find(".btn-newtab").attr({"href": data[i].newTabUrl, "target": "_blank"});
	      	const viewId = data[i].viewId;
            const encodedName = encodeHTMLAttribute(viewNameDecoded);
            const baseCI = data[i].baseCI;
            viewContent.find(".moreinfo-btn").attr('data-viewid', viewId);
            viewContent.find(".moreinfo-btn").attr('data-viewname', encodedName);
            viewContent.find(".moreinfo-btn").attr('data-baseci', baseCI);
	      
			var baseCIdataDiv = constructDataString(data[i], true, "baseCIIncidentCount", "baseCIProblemCount", "baseCIChangeCount", "baseCIEmergencyChangeCount", "baseCIReleaseCount", "baseCIEmergencyReleaseCount"); // No i18n
			if(baseCIdataDiv == null) {
				viewContent.find(".widget-notifi-icon").addClass("sdp-glyph-success-green");
			}
			else {
				viewContent.find(".widget-notifi-icon").addClass("sdp-glyph-warning-yellow");
			}
			viewContent.find(".baseci-appdata").append(baseCIdataDiv);
			var viewAppdataDiv = constructDataString(data[i], false, "incidentCount", "problemCount", "changeCount", "emergencyChangeCount", "releaseCount", "emergencyReleaseCount"); // No i18n
			if(viewAppdataDiv != null) {
				viewContent.find(".allci-appdata").html(viewAppdataDiv);	
			}
			
			//Remove unnecessary empty elements
			if(viewAppdataDiv == null && data[i].ownerDetails.name == undefined) {
				viewContent.find(".wdt-inner-cis").remove()
			}
			else if(viewAppdataDiv == null) {
				viewContent.find(".wdt-cis-heading").remove();
			}
			else if(data[i].ownerDetails.name == undefined) {
				viewContent.find(".wdt-cis-body").remove();
			}
				
	      	viewUl.append(viewContent);
			viewContent = viewHTML.clone();
	    }
	    viewUl.find(".moreinfo-btn").off('click').on('click', function() {      //NO I18N
            const viewId = jQuery(this).attr('data-viewid');
            const viewName = jQuery(this).attr('data-viewname');
            const baseCI = jQuery(this).attr('data-baseci');
            showMoreInfo(viewId, viewName, baseCI, true);
        });
		viewUl.find("[name=moreinfo-btn-link]").off('click').on('click', function() {      //NO I18N
			const viewId = jQuery(this).attr('data-viewid');
			const viewName = jQuery(this).attr('data-viewname');
			const baseCI = jQuery(this).attr('data-baseci');
			const isBaseCI = jQuery(this).attr('data-isbaseci');
			dashboard.showMoreInfo(viewId, viewName, baseCI, isBaseCI);
		});
	    //Tooltip for widget
	    initTooltip(".cmdb-cards");//NO I18N
	}

	// Construct links for other app data.
	function constructDataString(data, isBaseCI, c1, c2, c3, c4, c5, c6) {
		// Elements are added to an array to maintain order and appended to a div.
		// Anchor and span ar cloned because simply appendind them moves the elements.
	    var anchor = jQuery('<a>', {
			"name" : "moreinfo-btn-link", //no i18n
	    	'class': 'moreinfo', //no i18n
	    	'href': 'javascript:void(0)' //no i18n
	    });
	    var elementsToAppend = [];
	    var span = isBaseCI ? jQuery('<span>').text(', ') : jQuery('<span>').html(',<br>'); //no i18n

	    //return if no other app data
	    if(data[c1] == 0 && data[c2] == 0 && data[c3] == 0 && data[c4] == 0 && data[c5] == 0 && data[c6] == 0) {
	    	return null;
	    }
	    var title = data.viewName;

	    var div = jQuery('<div>'); //no i18n
	    if(data[c1] > 0) {
	    	var incidents = anchor.clone(true);
			const viewId = data.viewId;
			const encodedName = encodeHTMLAttribute(title);
			const baseCI = data.baseCI;
			const isBaseCI = true;
			incidents.attr("data-viewid", viewId);
			incidents.attr("data-viewname", encodedName);
			incidents.attr("data-baseci", baseCI);
			incidents.attr("data-isbaseci", isBaseCI);
	    	elementsToAppend.push(incidents.text(getMessageForKey("common.request") + " : " + data[c1]));
	    }
	    if(data[c2] > 0) {
	      // Add a comma if there are incidents.
	      if(data[c1] > 0) {
	    	 elementsToAppend.push(span.clone());
	      }
	      var problems = anchor.clone(true);
		  const viewId = data.viewId;
		  const encodedName = encodeHTMLAttribute(title);
		  const baseCI = data.baseCI;
		  const isBaseCI = true;
		  problems.attr("data-viewid", viewId);
		  problems.attr("data-viewname", encodedName);
		  problems.attr("data-baseci", baseCI);
		  problems.attr("data-isbaseci", isBaseCI);
	      elementsToAppend.push(problems.text(getMessageForKey("sdp.problem.problemtab") + " : " + data[c2]));
	    }
	    if(data[c3] > 0) {
	      if(data[c1] > 0 || data[c2] > 0) {
	    	  elementsToAppend.push(span.clone())
	      }
	      var changes = anchor.clone(true);
		  const viewId = data.viewId;
		  const encodedName = encodeHTMLAttribute(title);
		  const baseCI = data.baseCI;
		  const isBaseCI = true;
		  changes.attr("data-viewid", viewId);
		  changes.attr("data-viewname", encodedName);
		  changes.attr("data-baseci", baseCI);
		  changes.attr("data-isbaseci", isBaseCI);
	      elementsToAppend.push(changes.text(getMessageForKey("sdp.common.change") + " : " + data[c3]));
	    }
	    if(data[c4] > 0) {
		  if(data[c1] > 0 || data[c2] > 0 || data[c3] > 0) {
		      elementsToAppend.push(span.clone());
		  }
		  var eChanges = anchor.clone(true);
		  const viewId = data.viewId;
		  const encodedName = encodeHTMLAttribute(title);
		  const baseCI = data.baseCI;
		  const isBaseCI = true;
		  eChanges.attr("data-viewid", viewId);
		  eChanges.attr("data-viewname", encodedName);
		  eChanges.attr("data-baseci", baseCI);
		  eChanges.attr("data-isbaseci", isBaseCI);
	      elementsToAppend.push(eChanges.text(getMessageForKey("sdp.change.emergencychange") + " : " + data[c4]));
	    }
		if(data[c5] > 0) {
			if(data[c1] > 0 || data[c2] > 0 || data[c3] > 0 || data[c4] > 0) {
				elementsToAppend.push(span.clone());
			}
			var releases = anchor.clone(true);
			const viewId = data.viewId;
			const encodedName = encodeHTMLAttribute(title);
			const baseCI = data.baseCI;
			const isBaseCI = true;
			releases.attr("data-viewid", viewId);
			releases.attr("data-viewname", encodedName);
			releases.attr("data-baseci", baseCI);
			releases.attr("data-isbaseci", isBaseCI);
			elementsToAppend.push(releases.text(getMessageForKey("common.release") + " : " + data[c5]));
		}
		if(data[c6] > 0) {
			if(data[c1] > 0 || data[c2] > 0 || data[c3] > 0 || data[c4] > 0 || data[c5] > 0 ) {
				elementsToAppend.push(span.clone());
			}
			var emergencyRelease = anchor.clone(true);
			const viewId = data.viewId;
			const encodedName = encodeHTMLAttribute(title);
			const baseCI = data.baseCI;
			const isBaseCI = true;
			emergencyRelease.attr("data-viewid", viewId);
			emergencyRelease.attr("data-viewname", encodedName);
			emergencyRelease.attr("data-baseci", baseCI);
			emergencyRelease.attr("data-isbaseci", isBaseCI);
			elementsToAppend.push(emergencyRelease.text(getMessageForKey("sdp.release.emergency") + " : " + data[c6]));
		}
	    div.html(elementsToAppend);
	    return div;
	}
	
	return {
		initialize: initialize,
		navigatePage: navigatePage,
		next: next,
		previous: previous,
		showMoreInfo: showMoreInfo
	};
	
})();

/* dashboard ends */

/*dashboard moreinfo starts */

var moreInfo = (function() {
	function showBaseCIData(data) {
		var card = addMoreInfoData(data.requestData, getMessageForKey("sdp.requests.common.requests")); 
		jQuery("#tab_2_1 .moreinfo-baseci-content").append(card);
		var card = addMoreInfoData(data.problemData, getMessageForKey("sdp.header.problems")); 
		jQuery("#tab_2_1 .moreinfo-baseci-content").append(card);
		var card = addMoreInfoData(data.changeData, getMessageForKey("sdp.change.changes")); 
		jQuery("#tab_2_1 .moreinfo-baseci-content").append(card);
		var card = addMoreInfoData(data.releaseData, getMessageForKey("admin.module.releases"));
		jQuery("#tab_2_1 .moreinfo-baseci-content").append(card);
	}
	
	function showOtherCIData(data) {
		var card = addMoreInfoData(data.requestData, getMessageForKey("sdp.requests.common.requests"));
		jQuery("#tab_3_1 .moreinfo-otherci-content").append(card);
		var card = addMoreInfoData(data.problemData, getMessageForKey("sdp.header.problems")); 
		jQuery("#tab_3_1 .moreinfo-otherci-content").append(card);
		var card = addMoreInfoData(data.changeData, getMessageForKey("sdp.change.changes")); 
		jQuery("#tab_3_1 .moreinfo-otherci-content").append(card);
		var card = addMoreInfoData(data.releaseData, getMessageForKey("admin.module.releases"));
		jQuery("#tab_3_1 .moreinfo-otherci-content").append(card);
	}

	function addMoreInfoData(data, type) {
		var card = jQuery("#moreinfo-temp-card").clone();
		card.removeAttr("id"); //no i18n
		card.removeAttr("style"); //no i18n
		card.find("[data-type='category-header']").text(type);
		card.find("[data-type='category-count']").text("(" + (data?data.length:0) + ")");
		if(data == undefined || data.length == 0) {
			var text = "";
			if(type == "Requests") {
				text = getMessageForKey("ae.cmdb.businessview.moreinfo.norequests");
			}
			else if(type == "Problems") {
				text = getMessageForKey("ae.cmdb.businessview.moreinfo.noproblems");
			}
			else if(type == "Changes") {
				text = getMessageForKey("ae.cmdb.businessview.moreinfo.nochanges");
			}
			else if(type == "Releases") {
				text = getMessageForKey("sdp.release.no");
			}
			var emptyMsg = jQuery("<p />").attr("align", "center").attr("class", "pt30 text-muted").text(text);
			card.find(".org-card-items").append(emptyMsg);       
		}
		else {
			data.forEach(function(d) {
				var row = jQuery("#moreinfo-temp-row").clone();
				row.removeAttr("id"); //no i18n
				row.removeAttr("style"); //no i18n
				row.find("[data-type='category-row']").data("category", type); //no i18n
				row.find("[data-type='category-row']").data("id", d.id); //no i18n
				var titleAnchor = jQuery("<a />").attr({"href": d.url, "target": "_blank"}).text(d.title);
				row.find("[data-type='title']").append(titleAnchor);
				d.attributes.forEach(function(field) {
		  			var fieldDiv = jQuery("<p />").attr("class", "role-desc mb5");
		  			var label = jQuery("<label />").attr("class", "text-muted pr5 mb0");
		  			var span = jQuery("<span />")
		  			
					label.text(field.fieldName + " : ");
		  			if(field.fieldValue != undefined) {
						span.text(field.fieldValue);
		  			}
		  			else {
		  				span.text("-");
		  			}
					fieldDiv.append(label);
					if(field.fieldId == 3 && field.fieldValue != undefined) {
						var em = jQuery("<em />").attr("class", "priority-badge mr5");
						em.css("background-color", field.color); //no i18n
						em.html("&nbsp;"); //no i18n
						fieldDiv.append(em);
					}
					if(field.fieldId == 1) {
						if(field.fieldValue != undefined) {
							var more = jQuery("<span />").attr("class", "expandable");
							var cis = field.fieldValue;
							var ciText = "";
							Object.keys(cis).forEach(function(ciId, index) {
							    ciText += cis[ciId] + ", ";
							});
							ciText = ciText.substring(0, ciText.length - 2);
							if(ciText.length < 35) {
								more.text(ciText);
							}
							else {
								more.text(ciText.substring(0, 30));
								var moreLink = jQuery("<a />").attr({"class": "common-sprite common-more-dots",
									"title": getMessageForKey("sdp.common.more") + "...", //no i18n
									"href": "/" //no i18n
								});
								moreLink.off('click').on('click', function() {    //NO I18N
                                    CommonUIActions.expandBox(this, false);
                                });
								more.append(moreLink);
								var moreSpan = jQuery("<span />").attr("class", "expand-box").css("display", "none");
								moreSpan.text(ciText.substring(30, ciText.length));
								more.append(moreSpan);
							}
					        fieldDiv.append(more);
						}
					}
					else {
						fieldDiv.append(span);
					}
					row.append(fieldDiv);
				});
				card.find(".org-card-items").append(row);
			});
		}
		return card;
	}

	// load ci details page. this page is the same as in ci tab.
	function showCIInfo() {
		let url = `/ui/cmdb_module?ciid=${ciId}&mode=popup&externalframe=true&noheader=true`;
		jQuery("#ci_details_div").attr("src", url);
		jQuery("[data-switch=sdtab]").on("click", function() {
			const elementId =jQuery(this).attr('id');
			const ele = jQuery("#_DIALOG_CONTENT").find('.sdtab-content');
			if (elementId !== "ci-details-tab") {
				ele.addClass("p10"); //no i18n
			}
			else{
				ele.removeClass("p10"); //no i18n
			}
		});
	}


	// constrcut ci distribution html table
	function updateCIDistribution(data) {
	  jQuery("#totalcis").text(data.totalCIs)
	  // Add table header.
	  var ciDistr = jQuery("#cidistribution");
	  ciDistr.append("<thead><tr  class=\"tc-row\"><th class=\"tableHeader\">" + getMessageForKey("ae.cmdb.businessview.cicount") + "</th><th class=\"tableHeader\">" + getMessageForKey("ae.cmdb.admin.citype.citype") + "</th></tr></thead><tbody></tbody>");  //no i18n
	  var fourCol = false;
	  if(data.count > 10) {
	    fourCol = true;
	  }

	  // for each ci type, add type name and count.
	  var i = 1;
	  var tr = jQuery("<tr class=\"tc-row\">");
	  jQuery.each(data.distribution, function(key, value) {
	    var td1 = jQuery("<td>", {"width": 80}).html(value.count);
	    var td2 = jQuery("<td>").text(key);
	    tr = tr.append(td1).append(td2);
	    if(fourCol == true && i % 2 == 0) {
			ciDistr.find('tbody').append(tr);
	      tr = jQuery("<tr class=\"tc-row\">");
	    }
	    else if(fourCol == false){
			ciDistr.find('tbody').append(tr);
	      tr = jQuery("<tr class=\"tc-row\">");
	    }
	  });
	}
	
	function initialize() {
		//load ci details page
		showCIInfo();
		
		if(!isAEBuild) {
			//load otherinfo tabs
			jQuery.post("/BusinessViewMoreInfo.do", {viewId: viewId, ciId: ciId}, function(data) { //no i18n
				if(data != undefined) {
					showBaseCIData(data.baseCIData);
					showOtherCIData(data.otherCIData);
					//To enable scroll option within all module cards, disabling nicescroll element - suggested by UI team
					// jQuery(".org-card-items").niceScroll({horizrailenabled:false});
				}
			});
		}
		
		//load ci distribution
		jQuery.get('/BusinessView.do', {operation: 'getCIDistribution', viewId: viewId}, function(data) {//NO I18N
			updateCIDistribution(data);
		});
		
		//switch to otherinfo tabs if clicked from card count
		if(forBaseCI == true) {
			jQuery("#basecitab").trigger("click");
		}
		else if(forBaseCI == false){
			jQuery("#othercitab").trigger("click");
		}
		
	}
	return {
		initialize: initialize		
	}
})();

/* dashboard moreinfo ends */

/* save business view */
function savebusinessview() {
	if(!jQuery('#saveForm').valid()) {
		return false;
	}

	if(jQuery("#saveForm input[name=viewName]").val().length > 200){
      	  jQuery("#alert-failure").css("display", "block") //no i18n
          jQuery("#failed-alert-message").text(getMessageForKey("ae.cmdb.businessview.error.longname"));
      	  return false;
      }

    if(viewId != null && edit != null) {
  	  
      //Save As button
      var formData = jQuery("#saveForm").serializeArray();
		
      if(jQuery("#saveForm input[name=viewName]").val().trim() == "") {
          jQuery("#alert-failure").css("display", "block") //no i18n
          jQuery("#failed-alert-message").text(getMessageForKey("ae.cmdb.businessview.error.emptyname"));
      }
      else {
	        var operation = {name: "operation", value: "editViewDetails"}; // no i18n
	        formData.push(operation)
	        formData.push({name: "viewId", value: viewId});  // no i18n
	
	        var baseCIID = {name: "baseCiid", value: viewData.baseciid}; // no i18n
	        formData.push(baseCIID)
	
	        if(!jQuery("input:checkbox[name='editable']").is(":checked")) {
	          var editable = {name: "editable", value: "off"} // no i18n
	          formData.push(editable);
	        }
	        
	        jQuery.ajax('/BusinessView.do', { //no i18n
	          data: formData,
	          type: 'POST', //no i18n
	          success: function(data) {
	            if(data == null) {
	              jQuery("#alert-failure").css("display", "block")  //no i18n
	              jQuery("#failed-alert-message").text(getMessageForKey("ae.cmdb.businessview.error.generic")) //no i18n
	            }
	            else if(data == "emptyviewname") {
	              jQuery("#alert-failure").css("display", "block") //no i18n
	              jQuery("#failed-alert-message").text(getMessageForKey("ae.cmdb.businessview.error.emptyname")) //no i18n
	            }
	            else {
	              jQuery("#alert-success").css("display", "block") //no i18n
	              updateState(getPortalViewName("BusinessViewsListView"),"_D_RP", null);//No I18N
	              refreshSubView(getPortalViewName('BusinessViewsListView'));//NO I18N
	              setTimeout(function() {
	                closeDialog();
	              }, 1000);
	            }
	          },
	          error: function() {
	            jQuery("#alert-failure").css("display", "block") //no i18n
	            jQuery("#failed-alert-message").text(getMessageForKey("ae.cmdb.businessview.error.generic")); //no i18n
	          }
	        });
      }
    }
    else {
      map.controller.save();
    }
    return false;
  }

/* delete business view */
function deletebusinessviews(confirm) {
	if(confirm) { 
		var views = [];
		var viewName = getPortalViewName('BusinessViewsListView');	//NO I18N
	    jQuery("#"+viewName+"_TABLE tr input:checked").each(function(i, c) {
	       if(!isNaN(jQuery(c).val())) {
	          views.push(jQuery(c).val());
	        }
	    });
	    if(views.length != 0) {
	      	jQuery.post('/BusinessView.do', {operation: 'deleteView', views:  (typeof sdpToJSON != 'undefined') ? sdpToJSON(views) : JSON.stringify(views) }, function() { //no i18n
	          refreshSubView(getPortalViewName('BusinessViewsListView'));//NO I18N
	      	});
	  	}
	}
}
