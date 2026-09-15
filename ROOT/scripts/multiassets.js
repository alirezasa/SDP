//$Id$
var allassets;
var count = 0;
var windowVar;

function updateSelectedCIDropdown(element, userId, chosenCIs, maxCnt)
{
	var searchText = '';

	if(element != undefined && element != null)
	{
		jQuery(element).select2({
			minimumInputLength: 0,
			
			ajax: {
				url: "/selectci.json",//NO I18N
				contentType: "application/json; charset=utf-8", //No I18N
				dataType: 'jsonp',//NO I18N
				quietMillis: 500,
				data: function (term, page)
				{
					searchText = term;
					if(searchText != null)
					{
						if(searchText.indexOf("\\") != -1)//NO I18N
						{
							searchText = searchText.replace(/\\/g, '\\\\');//NO I18N
						}
						if(searchText.indexOf("\?") != -1)//NO I18N
						{
							searchText = searchText.replace(/\?/g, '\\\?');//NO I18N
						}
					}
					return getSelectCIQuery(searchText, userId, page);
				},
				results: function (data, page) 
				{
					return {results: data};
				},
				escapeMarkup: function (m) { return m; }
			},
			multiple: true,
			closeOnSelect: false,
			maximumSelectionSize: maxCnt,
			minimumResultsForSearch: 10,
			
			placeholder: function() { return getMessageForKey("sdp.helpdesk.common.select.ci"); }, //No I18N
			
			formatSearching: function() { return getMessageForKey('ae.common.search.text'); }, //No I18N

			formatNoMatches: function (){ 
				if(searchText != '')
				{
					return getMessageForKey('ae.select2.no.message'); //No I18N
				}
				else
				{
					return '';
				}
			},
			sortResults: function(results, container, query) {
                return sortResultsFn(results, container, query);
            },
			formatSelectionTooBig: function (limit) {return translate('sdp.helpdesk.common.selection.toobig',[limit])} //No I18N
		}).on("select2-opening", function() {//No I18N
			jQuery('#select2-drop-mask').hide(); //No I18N
		}).on("change", function(e) {
			if(jQuery(element).attr('data-id') === 'request') {
				if(jQuery(element).select2('data').length > 2) {
					jQuery('#showallcis').removeClass('hide');
				} else {
					jQuery('#showallcis').addClass('hide');
				}
			}
		});
		if(chosenCIs != undefined && chosenCIs != null && chosenCIs != 'null') //No I18N
		{
			jQuery(element).select2('data', chosenCIs); //No I18N
		}
		jQuery(element).select2("container").find("div.select2-drop").append("<div class='typename-band'>" + getMessageForKey('sdp.helpdesk.common.search.cis.hint') + "</div>"); //No I18N
		//jQuery('#select2-drop-mask').hide(); //No I18N
		// jQuery('.select2-choices').bind('focusin',{}, associateCIActions.setDefault); //No I18N
		if(jQuery(element).attr('data-id') !== 'request') {
			jQuery(element).on('change', associateCIActions.showHideToggle); //No I18N
		}
		//This is for request module
		if(jQuery(element).attr('data-id') === 'request') {
			if(jQuery(element).select2('data').length > 2) {
				jQuery('#showallcis').removeClass('hide');
			}
				
		}


	}
}

// userId param introduced for overriding in MSP
function getSelectCIQuery(searchText, userId, page) {
	return { searchText: encodeURIComponent(searchText), page: page };
}

 /* This function will call AssociateCIList.do in a new window
  * the user parameter can be userID or userName (will be taken care of in the server)
  * the user parameter will be null when called from the new/edit workorder page
  * the user parameter has to be provided when called from workorder details page
  * When the userName is also passed a check will be done in the server whether the id belongs to the username
  */
 function showCIsForAssociation(mode, userId, userName, siteId, assetElement, element)
 {
     if(userId == null) {    //b in new /edit workorder
         // if no user is provided, we will try to fetch it from the page (in case new workorder and edit workorder pages)
         var requester = $('reqSearch'); // No I18N
         var requesterID = $('requesterID'); // No I18N
         var oboUser = $('oboSearch'); //No I18N
         var oboUserID = $('oboID'); //No I18N
         //if OBO user is present, pass obouser details. else requester details
         if(oboUser != null && oboUser.value != "")
         {
        	 userName = oboUser.value;
        	 if(oboUserID != null && userName != "")
        	 {
        		 userId = oboUserID.value;
        	 }
         }
         else
         {
        	 if(requester != null) {
                 userName = requester.value;
              // if requester id is passed, pass the id, else pass the requester name..
                 if(requesterID != null && userName != "") {
                     // requesterID will be present even if user is not entered, so the check
                     userId = requesterID.value;
                 }
             } 
         }         
     }
     if(isMSP){
    	 siteId='null';//No I18N
     }
     if(siteId == undefined) { siteId = 'null'; }        //No I18N
     var elementid =  'selectedCIs'; //No I18N
     if(mode == 'spotedit')
     {
    	 elementid =  'selectedCIs1'; //No I18N 
     }
     if(assetElement!=null)
     {
    	 elementid=assetElement;
     }
     //If element itself is passed, then use that element, in case if the element id is not present
     var selectedData = element ? jQuery(element).select2('data') : jQuery("#"+elementid).select2('data');
     var selectedCount = selectedData.length;
     if(selectedCount < maxCICount)
     {
    	 var module="workorder";//No I18N
    	 if(mode.indexOf("change")>=0)
    	 {
    	    module = "change";//No I18N
    	 }
    	 if(mode == 'change_template')
    	 {
    		 elementid='ASSETID';//No I18N
    		 var list=jQuery("#FormDAC #"+elementid+" option");
    		 selectedCount=list.length;
    		 selectedData=[];
    		 for(var k=0;k<selectedCount;k++)
    		 {
    			 var elt=list[k];
    			 jsonObj={};
    			 jsonObj.id=elt.value;
    			 jsonObj.text=elt.text;
    			 selectedData.push(jsonObj);
    		 }
    	 }
	 selectedData=encodeURIComponent(Object.toJSON(selectedData));
    	 //selectedData=encodeURIComponent(JSON.parse( (typeof sdpToJSON != 'undefined') ? sdpToJSON(selectedData) : JSON.stringify(selectedData) ));
     
    	 
    	 if(userId != null && userId != "0" && userId != "-1") {
    		 if(module=="change"){
    			 windowVar=NewWindow(getModifiedUrlForCIList('/AssociateCIList.do?mode=' + encodeURIComponent(mode) + '&category=0&siteID='+siteId+'&selectedCount='+selectedCount+'&module='+module+'&selectedData='+selectedData+'&parentElement1='+encodeURIComponent(elementid)), 'AssociateCIList', '900', '550', 'yes', 'center',null,null,"changeAsset"); // No I18N
    		 }
    		 else{
    			 windowVar=NewWindow(getModifiedUrlForCIList('/AssociateCIList.do?mode=' + encodeURIComponent(mode) + '&category=userasset&siteID='+siteId+'&selectedCount='+selectedCount+'&module='+module+'&selectedData='+selectedData+'&parentElement1='+encodeURIComponent(elementid)), 'AssociateCIList', '900', '550', 'yes', 'center',null,null,"changeAsset"); // No I18N
    		 }
    	 }
    	 else {
    		 windowVar=NewWindow(getModifiedUrlForCIList('/AssociateCIList.do?mode=' + encodeURIComponent(mode) + '&category=typewiseasset&selectedCount='+selectedCount+'&module='+module+'&selectedData='+selectedData+'&parentElement1='+encodeURIComponent(elementid)),'AssociateCIList','900','600','yes','center',null,null,"changeAsset"); // No I18N
    	 }

    	 
     }
     else
     {
    	 alert(translate('sdp.helpdesk.common.selection.toobig',[maxCICount]));
     }    
 } 
 function getModifiedUrlForCIList(url)
 {
	 if(isMSP){
		 if(document.getElementById("siteID") != null) {
		 		siteId = document.getElementById("siteID").value;
		 	}else if(document.getElementById("SITEID") != null) {
		         	siteId = document.getElementById("SITEID").value;
		 	}else{
		 		siteId="null";	// No I18N
		 	}
		 	var accountId = undefined;
		     var userType = sdp_user.USERTYPE;
		 	if(userType=='Technician'){
		 		try{
		 			accountId = siteAccountModel[siteId];
		 		}catch(e){}
		 	}
			return accountId == undefined ? url : `${url}&WF_ACCOUNTID=${accountId}`;
	 }else{
		 return url;
	 }

 }
 var associateCIActions = {
		 
		 //creation page functions
		 creationPageInit : function()
		 {
			 // jQuery('#showallcis').bind('click',{parentid:'#multiasset'}, associateCIActions.toggleSelectedAssets); //No I18N
			 // jQuery('.showmore:not(#showallcis), .showless:not(#showallcis)').on('click',{parentid:'.ms-select2-field'}, associateCIActions.toggleSelectedAssets(this)); //No I18N
			 jQuery('.showmore, .showless').on('click',function(){//No I18N
			 	associateCIActions.toggleSelectedAssets(this)
			 });
			 associateCIActions.showHideToggle('#multiasset');//No I18N
			 associateCIActions.showHideToggle('#select2ci');//No I18N
			 jQuery('div.ms-select2-field').each(function(){
			 	associateCIActions.showHideToggle('#'+jQuery(this).attr('id'));//No I18N
			 });

			 jQuery('.ms-select2-field .select2-choices, #multiasset .select2-choices').on('mouseenter mouseleave', function(){
			 	//jQuery(this).niceScroll({zindex:10});
			 });
		 },
		 
		 setDefault : function()
		 {
			 jQuery('#multiasset .select2-choices').attr('style','height:60px !important;'); //No I18N
			 //jQuery(".select2-choices").niceScroll(); //No I18N
		 },
		 
		 showHideToggle : function(el)
		 {
			 if(el.currentTarget!=undefined && el.currentTarget.id=="assetlist"){
				 /*Written for Asset multiSelect valid Check*/
			     /*Start of code*/
			 	 formCheckValid.elementValid(el.target.name);
			 	 /*End of code*/ 
			 }
			 var _elm =jQuery(el+'.select2-choices')[0]; //No I18N 
			 if(typeof _elm != 'undefined')
			 {	
			 if ((_elm.clientHeight < _elm.scrollHeight) || (_elm.clientWidth < _elm.scrollWidth)) {   
				 jQuery(el).parent().find('.showmore, .showless').show(); //No I18N 
			 }else{
				 if(_elm.clientHeight > 65)
				 {
					jQuery(el).parent().find('.showmore, .showless').show().attr('class','showless'); //No I18N
					jQuery(el).parent().find('.showmore, .showless').prop('title', getMessageForKey('sdp.helpdesk.common.select2.showmore')); //No I18N
				 }
				 else
				 {
					 jQuery(el).parent().find('.showmore, .showless').hide(); //No I18N
				 }
			 }}
		 },
		 
		 popupInit : function()
		 {
			 jQuery('.addedcis').on('click', {}, associateCIActions.showAddedCIs ); //No I18N
			 jQuery('.round-close-bgblack').on('click', {}, associateCIActions.showAddedCIs ); //No I18N
			 jQuery(document).on('click', '#' + getPortalViewName('AssociateCIListView') + '_TABLE input[type="checkbox"]',  {}, associateCIActions.chooseCIs) // No I18N
			 jQuery(document).on('click', '#' + getPortalViewName('AssociateCIListView') + '_TABLE input[name="checkbox23"]',  {}, associateCIActions.chooseAllCIs) // No I18N
			 jQuery(document).on('click', '.removeasset', {}, associateCIActions.removeAddedCIs ); //No I18N
			 jQuery(window).on('resize', {}, associateCIActions.setDynamicPosition); //No I18N
			 associateCIActions.setDynamicPosition();
			 jQuery('#savebtn').on('click',{}, associateCIActions.saveCIs); //No I18N
			 associateCIActions.populateChosenCIs();
		 },
		
		 setDynamicPosition : function()
		 {
			 var dw = jQuery(document).width();
			 var dh = jQuery(document).height();
			 var assetinfo = jQuery('.addedcisinfo'); //No I18N
			 var w = assetinfo.width() /2;
			 var position = dw/2 - w - 50 ;
			 var direction = jQuery('body').css('direction'); //No I18N
			 if(direction == 'rtl') //No I18N
			 {
				 assetinfo.css({'bottom':'10px', 'right': position }); //No I18N
			 }
			 else
			 {
				 assetinfo.css({'bottom':'10px', 'left': position }); //No I18N
			 }
			 
		 },

		 showAddedCIs : function()
		 {
			 var cimenu = jQuery('#addedcismenu'); //No I18N
			 var amvisible = cimenu.is(":visible"); //No I18N
			 if(amvisible){
				 cimenu.slideUp();
			 }
			 else{
				 cimenu.slideDown();
				 jQuery('#addedcismenu').css({"border-bottom": "solid 0 #ccc"}); //No I18N
			 }
			 associateCIActions.setmenuWidth();
		 },

		 chooseAllCIs : function()
		 {
			 var allchkobj = jQuery('#'+getPortalViewName('AssociateCIListView')+'_TABLE input[type="checkbox"]').not(':first');//No I18N
			
			 var parentchkobj = jQuery(this).prop('checked'); //No I18N
			 var len = allchkobj.length;
			 var ele1 = jQuery('.count-container span:eq(0)'); // No I18N
			 var ele2 =jQuery('.count-container span:eq(1)'); // No I18N
			 var ele1Top = ele1.css('top'); // No I18N
			 var ele2Top = ele2.css('top'); // No I18N
			 if(parentchkobj){
				 len = 0;
				 var lilist = jQuery('#addedcismenu ul li'); //No I18N
				 var lilength = lilist.length;
				 for(j = 0; j < allchkobj.length; j++){
					 var isChosenAlready = false;
					 var ciid = jQuery(allchkobj[j]).val();
					 for(i = 0; i < lilength; i++){
						 var id = jQuery(lilist[i]).attr('id'); //No I18N
						 if(id === ciid){
							 isChosenAlready = true;
							 break;
						 }
					 }
					 if(isChosenAlready == false)
					 {
						 len = len + 1;
					 }
				 }
				 if((count + len) > maxCIsAllowed)
				 {
					 if(selectedCnt == 0)
					 {
						 alert(translate('sdp.helpdesk.common.selection.toobig',[maxCIsAllowed]));//No I18N
					 }
					 else
					 {
						 alert(getMessageForKey('sdp.helpdesk.common.associateci.popup.maxci.mesg'));//No I18N	
					 }
					 var lilist = jQuery('#addedcismenu ul li'); //No I18N
					 var lilength = lilist.length;
					 for(j = 0; j < allchkobj.length; j++){
						 var isChosenAlready = false;
						 var ciid = jQuery(allchkobj[j]).val();
						 for(i = 0; i < lilength; i++){
							 var chosenid = jQuery(lilist[i]).attr('id'); //No I18N
							 if(chosenid === ciid){
								 isChosenAlready = true;
								 break;
							 }
						 }
						 if(isChosenAlready == false)
						 {
							 jQuery(allchkobj[j]).prop('checked', false); //No I18N							 
						 }
					 }
					 jQuery(this).prop('checked', false); //No I18N
					 return;
				 }
				 if(ele1Top === '0px') // No I18N
				 {
					 ele2.html(count).css({top:'22px'}); // No I18N
					 ele1.animate({top:'-28px'}); // No I18N
					 ele2.animate({top:'0'}); // No I18N
				 }
				 else if(ele2Top === '0px') // No I18N
				 {
					 ele1.html(count).css({top:'22px'}); // No I18N
					 ele2.animate({top:'-28px'}); // No I18N
					 ele1.animate({top:'0'}); // No I18N
				 }
				 jQuery('.count-container').animateHighlight('#04A817', 500);//No I18N
				 
				 for(j = 0; j <  allchkobj.length; j++){
					 var isChosenAlready = false;
					 var ciid = jQuery(allchkobj[j]).val();
					 for(i = 0; i < lilength; i++){
						 var id = jQuery(lilist[i]).attr('id'); //No I18N
						 if(id === ciid){
							 isChosenAlready = true;
							 break;
						 }
					 }
					 if(isChosenAlready == false)
					 {
						 associateCIActions.addCINames(allchkobj[j]);
						 count = count + 1;
					 }
				 }
				 jQuery('.count-container span').html(count);//No I18N
				 
			 }else{
				 if(ele1Top === '0px') //No I18N
				 {
					 ele2.html(count).css({top:'-28px'}); //No I18N
					 ele1.animate({top:'22px'}); //No I18N
					 ele2.animate({top:'0'}); //No I18N
				 }
				 else if(ele2Top === '0px') //No I18N
				 {
					 ele1.html(count).css({top:'-28px'}); //No I18N
					 ele2.animate({top:'22px'}); //No I18N
					 ele1.animate({top:'0'}); //No I18N
				 }
				 jQuery('.count-container').animateHighlight('#943D20', 500);//No I18N
				 for(i = 0; i < len; i++){
					 associateCIActions.removeAddedCIs(allchkobj[i], true);
				 }
				 count = count - len;
				 if(count < 0)
				 {
					 count = 0;
				 }
				 jQuery('.count-container span').html(count);//No I18N
			 }
			
			 var direction = jQuery('body').css('direction'); //No I18N
			 if(count > 9)
			 {				 
				 if(direction == 'rtl') //No I18N
				 {
					 jQuery('.hele, .vele').css({'padding-right': '6px'}); //No I18N
				 }
				 else
				 {
					 jQuery('.hele, .vele').css({'padding-left': '6px'}); //No I18N
				 }
			 }
		 	 else
		 	 {
		 		if(direction == 'rtl') //No I18N
				 {
		 			jQuery('.hele, .vele').css({'padding-right': ''}); //No I18N
				 }
		 		 else
		 		 {
		 			jQuery('.hele, .vele').css({'padding-left': ''}); //No I18N
		 		 }
		 	 }
		 },
		 
		 chooseCIs : function()
		 {
			 var infodiv = jQuery('.addedcisinfo').is(":visible"); //No I18N
			 if(jQuery(this).attr('name') === 'checkbox23')//No I18N
			 {
				 return;
			 }
			 var ischecked = jQuery(this).prop('checked'); //No I18N
			 if(ischecked && (count >= maxCIsAllowed))
			 {
				 if(selectedCnt == 0)
				 {
					 alert(translate('sdp.helpdesk.common.selection.toobig',[maxCIsAllowed]));//No I18N
				 }
				 else
				 {
					 alert(getMessageForKey('sdp.helpdesk.common.associateci.popup.maxci.mesg'));//No I18N	
				 }
				 jQuery(this).prop('checked', false); //No I18N
				 return;
			 }
			 if(infodiv)
			 {
				 var ele1 = jQuery('.count-container span:eq(0)'); // No I18N
				 var ele2 =jQuery('.count-container span:eq(1)'); // No I18N
				 var ele1Top = ele1.css('top'); // No I18N
				 var ele2Top = ele2.css('top'); // No I18N
				 if(ischecked)
				 {
					 var lilist = jQuery('#addedcismenu ul li'); //No I18N
					 var lilength = lilist.length;
					 var isChosenAlready = false;
					 var ciid = jQuery(this).val();
					 for(i = 0; i < lilength; i++){
						 var id = jQuery(lilist[i]).attr('id'); //No I18N
						 if(id === ciid){
							 isChosenAlready = true;
						 }
					 }
					 if(isChosenAlready == false)
					 {
						 associateCIActions.addCINames(this);
						 count = count + 1;
						 if(ele1Top === '0px') // No I18N
						 {
							 ele2.html(count).css({top:'22px'}); // No I18N
							 ele1.animate({top:'-28px'}); // No I18N
							 ele2.animate({top:'0'}); // No I18N
						 }
						 else if(ele2Top === '0px') // No I18N
						 {
							 ele1.html(count).css({top:'22px'}); // No I18N
							 ele2.animate({top:'-28px'}); // No I18N
							 ele1.animate({top:'0'}); // No I18N
						 }
						 jQuery('.count-container').animateHighlight('#04a817', 500); // No I18N
					 }
				 }
				 else
				 {
					 if(count > 0)
					 {
						 count = count-1;
						 if(ele1Top === '0px') //No I18N
						 {
							 ele2.html(count).css({top:'-28px'}); //No I18N
							 ele1.animate({top:'22px'}); //No I18N
							 ele2.animate({top:'0'}); //No I18N
						 }
						 else if(ele2Top === '0px') //No I18N
						 {
							 ele1.html(count).css({top:'-28px'}); //No I18N
							 ele2.animate({top:'22px'}); //No I18N
							 ele1.animate({top:'0'}); //No I18N
						 }
						 jQuery('.count-container').animateHighlight('#943D20', 500); //No I18N
						 associateCIActions.removeAddedCIs(this, true);
					 } 
				 }
			 }
			 var direction = jQuery('body').css('direction'); //No I18N
			 if(count > 9)
			 {				 
				 if(direction == 'rtl') //No I18N
				 {
					 jQuery('.hele, .vele').css({'padding-right': '6px'}); //No I18N
				 }
				 else
				 {
					 jQuery('.hele, .vele').css({'padding-left': '6px'}); //No I18N
				 }
			 }
		 	 else
		 	 {
		 		if(direction == 'rtl') //No I18N
				 {
		 			jQuery('.hele, .vele').css({'padding-right': ''}); //No I18N
				 }
		 		 else
		 		 {
		 			jQuery('.hele, .vele').css({'padding-left': ''}); //No I18N
		 		 }
		 	 }
		 },

		 setmenuWidth : function()
		 {
			 var cimenu = jQuery('#addedcismenu'); //No I18N
			 var aiw = jQuery('.addedcisinfo').width(); //No I18N
			 cimenu.css({'width':aiw}); //No I18N
		 },

		 addCINames : function(ele, obj)
		 {
			 var ciid = jQuery(ele).closest('tr').find('td:eq(0) input').val(); //No I18N
			 var ciname = jQuery(ele).closest('tr').find('td:eq(1)').html(); //No I18N
			 var rowref = jQuery(ele).closest('tr').index()+1; //No I18N
			 jQuery('#addedcismenu ul').prepend('<li id=' + ciid + '><span class="removeasset"></span> <span class="assetname">' + ciname + '</span></li>'); //No I18N
		 },

		 removeAddedCIs : function(inputobj,ischeck)
		 {
			 if(ischeck){
				 var idval = jQuery(inputobj).val();//.closest('tr').index()+1; //No I18N
				 var liobj = jQuery('#addedcismenu ul').find('li#'+idval).remove(); //No I18N
			 }else{
				 var liobj = jQuery(this).parent();
				 var rowidx = liobj.attr('id'); //No I18N
				 liobj.remove();
				 jQuery('input[type=checkbox][value=' + rowidx +']').prop("checked", false); //No I18N
				 associateCIActions.chooseCIs();
				 if(count === 0)
				 {
					 jQuery('#addedcismenu').slideUp(); //No I18N
				 }
			 }
		 },

		 saveCIs : function()
		 {
			 var addedcis = jQuery('#addedcismenu ul li'); //No I18N
			 var len = addedcis.length;
			 var ciobjs;
			 if(mode == 'change_template'){
				 var list=jQuery('#ASSETID_CUR span');
				 var select= document.createElement("select");
				 for(i = 0; i < len; i++)
				 {
					 var idStr = jQuery('#addedcismenu ul li').eq(i).attr('id'); //No I18N
					 var textStr = jQuery('#addedcismenu ul li').eq(i).find('.assetname').text(); //No I18N
					 var obj={};
					 var option = new Option(textStr,idStr);
					 jQuery(select).append(option);
				 }
				var id=window.opener.Canvas.viewObjects.ASSETID.INDEX_NO;
				var selBox = window.opener.document.getElementById('_ev'+id).getElementsByTagName('SELECT')[0];
				window.opener.Change_Canvas.copyAssetDetails(select,select,selBox);
				//Canvas.viewObjects.ASSETID = select;
			 }
			 else if(mode=='change_global' || mode=='change_spot' || mode=='change_inline'){
			 	//Handled for New change form
				 var data=[];
				 for(i=0;i<len;i++){
					var idStr = jQuery('#addedcismenu ul li').eq(i).attr('id'); //No I18N
					var textStr = jQuery('#addedcismenu ul li').eq(i).find('.assetname').text().trim(); //No I18N
					data.push(idStr);
				 }
				if(window.opener.$relform) {
					data.length == 0 && (data = "");
					window.opener.$relform.setFieldValue("assets", data);	//No I18N
					window.opener.jQuery('[name="assets"]').trigger("change");       //No I18N
		        }
			 }
			 else{
				 var data = [];
				 for(i = 0; i < len; i++)
				 {
					 var idStr = jQuery('#addedcismenu ul li').eq(i).attr('id'); //No I18N
					 var textStr = jQuery('#addedcismenu ul li').eq(i).find('.assetname').text(); //No I18N
					 ciobjs = {   id: idStr, text: textStr };
					 data.push(ciobjs);
				 }
				 var select2Element = window.opener.jQuery("#"+parentElement1); // NO I18N
				 select2Element.select2("data", data); // NO I18N
				 // SD-91367 we dont need to trigger the on change in details page 
				 if (!window.opener.req_details) {
					select2Element.trigger("change"); //No I18N 
				 }
				 
				 
				 if(len > 2 ) {
				 	window.opener.jQuery("#showallcis").removeClass('hide');
				 	//jQuery('#showallcis').removeClass('hide');
				 } else {
				 	window.opener.jQuery("#showallcis").addClass('hide');
				 }
			 }
			 window.close();
			 
		 },

		 fetchChosenCIs : function()
		 {
			 var arr = [];
			 var addedcis = jQuery('#addedcismenu ul li'); //No I18N
			 var len = addedcis.length;
			 for(i = 0; i < len; i++)
			 {
				 var idStr = jQuery('#addedcismenu ul li').eq(i).attr('id'); //No I18N
				 var textStr = jQuery('#addedcismenu ul li').eq(i).find('.assetname').html(); //No I18N
				 var ciobj = {   id: idStr, text: textStr };
				 arr.push(ciobj);
			 }
			 jQuery('#chosenCIs')[0].value = Object.toJSON(arr); //No I18N
		 },

		 populateChosenCIs : function()
		 {
			 if(str != "" && str != null)
			 {
				 var jsonarr = JSON.parse(str);
				 var len = jsonarr.length;
				 for(var i = 0; i < len; i++)
				 {
					 var ciobj = jsonarr[i];
					 var ciid = ciobj.id;
					 var ciname = ciobj.text || ciobj.name;
					 jQuery('#addedcismenu ul').prepend('<li id=' + ciid + '><span class="removeasset"></span> <span class="assetname">' + encodeHTML(ciname) + '</span></li>'); //No I18N
				 }
				 count = len;
				 var ele1 = jQuery('.count-container span:eq(0)'); // No I18N
				 var ele2 =jQuery('.count-container span:eq(1)'); // No I18N
				 var ele1Top = ele1.css('top'); // No I18N
				 var ele2Top = ele2.css('top'); // No I18N
				 if(ele1Top === '0px') // No I18N
				 {
					 ele2.html(count).css({top:'22px'}); // No I18N
					 ele1.animate({top:'-28px'}); // No I18N
					 ele2.animate({top:'0'}); // No I18N
				 }
				 else if(ele2Top === '0px') // No I18N
				 {
					 ele1.html(count).css({top:'22px'}); // No I18N
					 ele2.animate({top:'-28px'}); // No I18N
					 ele1.animate({top:'0'}); // No I18N
				 }
			 }
		 },
		 showSelectedAssets : function(spotedit) {
			 jQuery('#cis_selected').addClass('show').removeClass('hide');  //No I18N
			 jQuery('#spotedit-container, .saveactions').addClass('hide').removeClass('show'); //No I18N
			 jQuery('#spotedit-container').html(''); // No I18N 
                         fixRowHeightForSpotEdit(jQuery("#cis_selected"));
                         fixSectionRowsHeight(jQuery('#cis_selected').parents('.seccolumn').eq(0));//NO I18N
		 },

		 toggleAssets : function(hcount){
			 if(jQuery('.hideasset').is(':visible')){ //No I18N
				 jQuery('.hideasset').css({'display':'none'}); //No I18N
				 jQuery('#readmore').html(hcount + ' ' + getMessageForKey('sdp.common.more')); //No I18N
			 }
			 else{
				 jQuery('.hideasset').css({'display':'block'}); //No I18N
				 jQuery('#readmore').html(getMessageForKey('sdp.common.less')); //No I18N
			 }
                         /*Fixing row height*/
                         fixRowHeightForSpotEdit(jQuery('#cis_selected'));
                         fixSectionRowsHeight(jQuery('#cis_selected').parents('.seccolumn').eq(0));//NO I18N
		 },

		 toggleSelectedAssets : function(el){
			 var t = jQuery(el);
			 if(t.hasClass('showmore')){ //No I18N
				if(jQuery(el).attr("pmtask") === "true"){
					 t.closest('.right-col').addClass('active').find('ul.select2-choices').attr('style','height:auto !important; top:0; position:absolute;'); //No I18N 
				 }else{
					 t.closest('.fafr-value').addClass('active').find('ul.select2-choices').attr('style','height:auto !important; top:0; position:absolute; max-height: inherit;'); //No I18N 
				 }
				 t.attr('class','showless'); //No I18N
				 t.prop('title', getMessageForKey('sdp.helpdesk.common.select2.showless')); //No I18N
			 }
			 else
			 {
				 if(jQuery(el).attr("pmtask") === "true"){
					 t.closest('.right-col').removeClass('active').find('ul.select2-choices').attr('style',''); //No I18N 
				 }else{
					 t.closest('.fafr-value').removeClass('active').find('ul.select2-choices').attr('style',''); //No I18N
				 }
				 t.attr('class','showmore'); //No I18N
				 t.prop('title', getMessageForKey('sdp.helpdesk.common.select2.showmore')); //No I18N
			 }
		 }
 };
 //Method to construct select2 component for multi select additional field
 //fieldName - field to be changed as select2
 //displayName - for placeholder
function callSelect2MultiSelect(fieldName,displayName)
{
	jQuery('#'+fieldName).select2("destroy");//No I18N
	//Getting already selected options for the field
	var selectedValues = jQuery("#"+fieldName+"_val").val();
	var arr = [];
	var maxSelectionCount = jQuery('#maxOptions4MultiSelect').val();
	var maxLimit = new Array();
	maxLimit[0]=maxSelectionCount;
	if(!(selectedValues==null || selectedValues == "-" || selectedValues == "" || selectedValues == "null")) {
		var value = selectedValues.split(";");
		for(var i=0 ; i<value.length; i++)
		{
			var json = {};
			json.id=value[i];
			json.text=value[i];
			arr.push(json);
		}
	}
	// Call select2
	jQuery("#"+fieldName).select2({
        placeholder: getMessageForKey('sdp.leftpanel.search.title')+" "+displayName,//No I18N
        //width:"81%",
        closeOnSelect: false,
        maximumSelectionSize:maxSelectionCount,
		formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message'); }, //No I18N
		formatSelectionTooBig: function (limit) {return getMessageForKey('sdp.admin.multiselect.max.option.exceed',maxLimit)} //No I18N
	});
	jQuery("#"+fieldName).select2('data',arr);
}

// Saving values from bulk select pop up to form
jQuery(document).on('click','#bulk-select-save',function(){//No I18N
   var fieldName = jQuery('#fieldName').val()
   var type = jQuery('#type').val()
   var arr = []; var mainjson={}; 

   jQuery('.bulk-select-options>div').each(function(index){
	  if(jQuery(this).find('input').is(':checked')){
          var val = jQuery(this).find('input:checked').val();
		var json = {}
		json.id=val;
		json.text = jQuery(this).find('input:checked').parent().text();
		arr.push(json);
		mainjson[val]=val;
        }
      });
      closeDialog();
      if(type === 'checkbox' || type === 'radio') {
	    var div = jQuery('div[data-name='+fieldName+'_sdpdiv]');
	    if(div.length == 0) { 
		div = jQuery('#ProDetInFrame').hasClass('show') ? jQuery('#ProDetInFrame') : jQuery('#'+fieldName + "_PH") ;
	    }
   	    var options = div.find('input[id='+fieldName+']');
	    options.each( function() {
		var option = jQuery(this);
		option.prop('checked',false); // No I18N
		if(mainjson[option.val()] != undefined) { option.prop('checked',true); }
	    });

      }
      else { 
	  jQuery('#'+fieldName).select2('data', arr);
      triggerEvent(jQuery('#'+fieldName)[0],'change');// No I18N
	  jQuery('#'+fieldName).trigger('focus');
      }
    });
	
// Bulk select script
var bulk_select = {
  init : function(){
    this.clearInput();
    this.searchItems();
    this.selectAll();
    this.sortItems();
    this.filterItems();
    this.checkAvailability();
	
  },
  items : function(){
            return jQuery('.bulk-select-options>div');
  },
  clearInput : function(){ // Clear search input
    jQuery('.bulk-select-search input').on('keyup', function(){
      if(!jQuery(this).val()){
        jQuery(this).next('.common-close-icon4').addClass('hide'); //No I18N
      }
      else{ 
		jQuery(this).next('.common-close-icon4').removeClass('hide');//No I18N
	  }
    });

    jQuery('.bulk-select-search .common-close-icon4').on('click', function(){
      jQuery(this).addClass('hide').parent().find('input').val(''); //No I18N
      bulk_select.items().removeClass('hide'); //No I18N
      	jQuery('.bulk-select-options #no-matches-found').addClass('hide'); //No I18N
    });
  },
  searchItems: function(){ // Search options

    bulk_select.items().each(function(){
      jQuery(this).attr('data-search',jQuery(this).find('label').text().toLowerCase());
    });

    // Search input
    jQuery('.bulk-select-search>input[type="search"]').on('keyup', function(){
      var val = jQuery(this).val().toLowerCase();

      bulk_select.items().addClass('hide'); //No I18N
      bulk_select.items().each(function(){
        if(jQuery(this).attr('data-search').indexOf(val) >= 0){ jQuery(this).removeClass('hide'); }
      });
	  if(jQuery('.bulk-select-options>div.form-group:visible').length==0){
      	jQuery('.bulk-select-options #no-matches-found').removeClass('hide'); //No I18N
      }
      else{
      	jQuery('.bulk-select-options #no-matches-found').addClass('hide'); //No I18N
      }
    });
  },
  selectAll : function(){ // Select all options  
jQuery('#bulk-select-checkall').on('change', function(){ 
//Need to select options based on max options that can be selected count configured in global config table. 
  var len = jQuery('.bulk-select-options>div:visible').find('input:not(:checked)').length;
  var alreadySelected =  bulk_select.items().find('input:checked').length;
  var maxOptions4MultiSelect = jQuery('#maxOptions4MultiSelect').val();
  if(jQuery('#bulk-select-checkall').is(':checked') && ((len+alreadySelected) > maxOptions4MultiSelect))
  {
	  var count = new Array();
	  count[0]=maxOptions4MultiSelect;
	  alert(getMessageForKey('sdp.admin.multiselect.max.option.exceed',count));//No I18N
	  jQuery('#bulk-select-checkall').prop('checked',false); //No I18N
  }
  else
  {
    jQuery('.bulk-select-options>div:visible input').prop('checked',jQuery(this).is(':checked')); //No I18N
  }
   });
  },
  sortItems : function(){ // Sorting
    jQuery('#bulk-select-sort').on('click', function(){

      var list = jQuery('.bulk-select-options'),
        listli = list.children('div:visible');//No I18N
         order = jQuery(this).find('span').hasClass('common-asc-icon');//No I18N

      listli.sort(function(a,b){
        /* var an = a.getAttribute('data-search'),
            bn = b.getAttribute('data-search'); */
			var an = jQuery(a).attr('data-search'),
            bn = jQuery(b).attr('data-search');
        if(order){ return (an > bn) ? 1 : 0; }
        else { return (an < bn) ? 1 : 0; }
      }).each(function(){
		list.prepend(this);
	  });
      //listli.detach().appendTo(list);

      if(order){
        jQuery(this).attr('title',getMessageForKey('sdp.common.sort.descending'))
                    .find('span').attr('class','common-sprite icon-sm common-desc-icon mt3');
      }
      else{
        jQuery(this).attr('title',getMessageForKey('sdp.common.sort.ascending'))
                    .find('span').attr('class','common-sprite icon-sm common-asc-icon mt3');
      }
    });
  },
  filterItems : function(){ // Filter by       
    jQuery('#bulk-select-filter-none').on('click', function(){
      bulk_select.items().removeClass('hide');
	  jQuery('.bulk-select-options #no-matches-found').addClass('hide'); //No I18N
    });

    jQuery('#bulk-select-filter-checked').on('click', function(){
       bulk_select.items().addClass('hide').find('input:checked').closest('div').removeClass('hide'); //No I18N
    });

    jQuery('#bulk-select-filter-unchecked').on('click', function(){
      bulk_select.items().addClass('hide').find('input:not(:checked)').closest('div').removeClass('hide');//No I18N
    });
  },
  checkAvailability : function(){
	  jQuery('.bulk-select-options input[type="checkbox"]').on('click', function(){
	  var maxOptions = jQuery('#maxOptions4MultiSelect').val();
	  var ischecked = jQuery(this).prop('checked'); //No I18N
	  var length = bulk_select.items().find('input:checked').length;
	  if(ischecked && (length > maxOptions))
	  {
		var count = new Array();
		count[0]=maxOptions;
		alert(getMessageForKey('sdp.admin.multiselect.max.option.exceed',count));//No I18N
		jQuery(this).prop('checked', false); //No I18N
		return;
	  }
   });
	  
  }
}

// Set pre selected values in bulk select list
function setBulkValues(fieldName){
  var values = jQuery("#"+fieldName).val();
  if(jQuery("#"+fieldName).is("input") && jQuery("#"+fieldName).attr("data-dynamic-options") === "true"){
    //field is an input element in the case of dynamic loading
    // values = values.toString().split(','); //not using split(",") because we allow options to be saved with a comma.
    values = [];
    jQuery("#"+fieldName).select2("data").each(function(ele){
        values.push(ele.id);
    });
  }
  if(values != null)
  {
	  //values = values.toString().split(',');
	for(var i = 0; i<values.length; i++){
		//jQuery('.bulk-select-options input[value="'+values[i]+'"]').prop('checked',true);
		jQuery('.bulk-select-options [data-search="'+values[i]+'"] input').prop('checked',true); //No I18N
	}
	jQuery(".bulk-select-options input").filter(function(k,v){return values.indexOf(jQuery(v).val()) != -1;}).prop("checked",true); //No I18N
  }

}

//Method for populating multi select poop up window
function populateData(fieldName,fromParam,type)
{
    //FromParam 'viewOnly' indicates 'view more' option from request details page.
    var constructDiv = "";
    if(fromParam == "viewOnly")
	{
		if(fieldName.indexOf("Share_") == 0)
		{
			selectedData = jQuery('#selectedData').val();
			if(selectedData != "")
			{
				selectedData = JSON.parse(selectedData);
			}
			var key = fieldName.substr(6);
			var values = selectedData[key];
			if(typeof(values) == "string")
			{
				values = JSON.parse(values);
			}
			for(var i=0;i<values.length;i++)
			{
				if(values[i] == null && key == "sites")
				{
					constructDiv += "<div class='form-group mt15'><label class='control-label p0 m0 pl5'>"+getMessageForKey("sdp.admin.org.technician.organizationdefault")+"</label></div>";
				}
				else if("site" in values[i] && values[i].site != null)
				{
					constructDiv += "<div class='form-group mt15'><label class='control-label p0 m0 pl5'>"+encodeHTML(values[i].name+","+values[i].site.name)+"</label></div>";
				}
				else
				{
					constructDiv += "<div class='form-group mt15'><label class='control-label p0 m0 pl5'>"+encodeHTML(values[i].name)+"</label></div>";
				}
			}
		}
		else
		{
			var values = jQuery("#"+fieldName+"_val").val();
			values = values.split(';');
			for(var i=0;i<values.length;i++)
			{
				constructDiv += "<div class='form-group mt15'><label class='control-label p0 m0'><input class='fl mt1 mr10' value='"+encodeHTMLAttribute(values[i])+"' type='checkbox' disabled checked>"+encodeHTML(values[i])+"</label></div>";
			}
		}
	} 
	else if(fromParam == "solutionOwner") {
		var values = solutionOwner;
		for(var i=0;i<values.length;i++)
		{
			constructDiv += "<div class='form-group mt15'><label class='control-label pl5'>"+encodeHTML(values[i])+"</label></div>";
		}
	}
	else if(fromParam == "template")
	{
		jQuery('#'+fieldName+' select').find('option').each(function(){
			constructDiv += "<div class='form-group mt15'><label class='control-label p0 m0'><input class='fl mt1 mr10' value='"+encodeHTMLAttribute(this.value)+"' type='checkbox' disabled>"+encodeHTML(this.value)+"</label></div>";
		});
		if(constructDiv == "")
		{
			constructDiv = "<div class=' p10 tc mt20'><p>"+getMessageForKey('sdp.admin.multiselect.options.notavail')+"</p></div>";
		}
	}
	else
	{
		//for check box options
		if(type != null && (type === 'checkbox' || type === 'radio')) {
			var name= (type === 'radio') ? 'radioname' : ''; // No I18N
			var div = jQuery('div[data-name='+fieldName+'_sdpdiv]');
			if(div.length == 0) { 
				div = jQuery('#ProDetInFrame').hasClass('show') ? jQuery('#ProDetInFrame') : jQuery('#'+fieldName + "_PH") ;
			}
			div.find('input[type='+type+'][id='+fieldName+']').each(function() {
				var item = jQuery(this);
				var value = item.val();
				var isChecked = item.is(':checked') ? 'checked' : ''; // No I18N
				if(!item.parent('label').hasClass('hide')) {
					constructDiv += "<div class='form-group mt15'><label class='control-label p0 m0'><input class='fl mt1 mr10' value='"+encodeHTMLAttribute(value)+"' type='"+type+"' "+isChecked+" name='"+name+"'>"+encodeHTML(value)+"</label></div>";
				}
		
			});
		}
	       	//for multi select
		else {
			var options = document.getElementById(fieldName);
            if(jQuery(options).attr("data-dynamic-options") === "true"){
                var apiFieldName = jQuery(options).attr("data-field-name");
                var optionsArray = dynamicLoading.optionsMap[apiFieldName];
                for(var i = 0, len = optionsArray.length; i < len; i++){
                    constructDiv += "<div class='form-group mt15'><label class='control-label p0 m0'><input class='fl mt1 mr10' value='"+encodeHTMLAttribute(optionsArray[i].id)+"' type='checkbox'>"+encodeHTML(optionsArray[i].text)+"</label></div>";
                }
            }else{
    			jQuery.each(options, function(key,option){
    				var value = option.value;
    				if(window.req_module){
    				    constructDiv += "<div class='form-group mt15'><label class='control-label p0 m0'><input class='fl mt1 mr10' value='"+e_attr(value)+"' type='checkbox'>"+e_html(option.text)+"</label></div>";
    				}
    				else{
    				    constructDiv += "<div class='form-group mt15'><label class='control-label p0 m0'><input class='fl mt1 mr10' value='"+e_attr(value)+"' type='checkbox'>"+e_html(option.value)+"</label></div>";
    				}
    			});
            }
		}
		if(constructDiv == "")
		{
			constructDiv = "<div class=' p10 tc mt20'><p>"+getMessageForKey('sdp.admin.multiselect.options.notavail')+"</p></div>";
		}
	}
	jQuery('.bulk-select-options').append(constructDiv);
}

//Calling select2 for all multi select fields in the form
function destroyAndCallSelect2MultiSelect(fieldsList)
{
	var values = fieldsList.split(",");
	for(var i=0;i<values.length;i++)
	{
		callSelect2MultiSelect(values[i],"");
	}
}

function showMoreMultiFields(ele,forAsset) {
	var x;
	if(forAsset === true) { x = jQuery(ele).parent().find('#multiasset');}
	else { x =  jQuery(ele).closest('.mti-select'); }  //No I18N
	var element = jQuery(ele);
	if(element.attr('data-id') == 'showmore') {
		x.find('.select2-container-multi').attr('style','z-index: 2;');
		if(forAsset) {
			x.find('ul.select2-choices').attr('style','max-height: inherit;');	
		}
		else {
			x.find('ul.select2-choices').attr('style','height: auto !important; box-shadow: 0px 5px 10px 0px #DEDEDE');
			x.find('.select2-container-multi').addClass("multi-field-holder");  //No I18N
		}
		element.attr('data-id','showless').addClass('showless');
		element.prop('title', getMessageForKey('sdp.helpdesk.common.select2.showless')); //No I18N
	} else {
		x.find('.select2-container-multi,ul.select2-choices').removeAttr('style');
		element.attr('data-id','showmore').removeClass('showless');
		element.prop('title', getMessageForKey('sdp.helpdesk.common.select2.showmore')); //No I18N
		x.find('.select2-container-multi').removeClass("multi-field-holder"); //No I18N
	}
}
