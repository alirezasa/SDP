//$Id$
/* Takes care of adjusting the height of left and right sections of page based on browser window size */
function resize(){
    var h =jQuery(window).height()- jQuery('#new-pr').offset().top - is_chathgt - 10 ;
    jQuery('#new-pr, .scroll-wrap').height(h);
    jQuery('.req-list').height(h-82);
    jQuery('#single-details>div>form').height(h);
    jQuery('.pr-details-wrap').height(h-jQuery('.content-actions').outerHeight());
}

/* Add "active" class to a list item in left sidebar */
jQuery(document).on('click','.request-item',function(){//NO I18N
	jQuery(this).addClass('active').siblings('.request-item').removeClass('active');//NO I18N
});

// Flexigrid Ui Fix starts
jQuery(document).on('mouseover','#listview_div .flexigrid .thOver',function(){ //NO I18N
	jQuery('.nBtn, .nDiv').css('left',jQuery(this).position().left+jQuery(this).width()-15); //NO I18N
});

jQuery(document).on('mousemove click','#new-pr .flexigrid, #listview_div .flexigrid',function(){ //NO I18N
	jQuery('.hDivBox thead th:visible').each(function(index){
		jQuery('.cDrag div').eq(index).css('left',jQuery(this).position().left+jQuery(this).width()); //NO I18N
	});
});
// Flexigrid Ui Fix ends

function activateSelectionOnList(itemId, elId) {
	jQuery('#'+elId).find('.request-item').removeClass( 'active' );
	jQuery('#'+elId).find('.request-item').each(function() {
		if(jQuery(this).attr('id') == ('item-'+itemId)) {
			jQuery(this).addClass('active');
		}
	});
}

/* Special HTML formating for adding icons to PO filter select2 component */
function formatPOSelection(val) {
	return '<span class="pr-icon"><i class="pr-sprite pr-cart-sm"></i></span>' + val.text;//No I18N
}

/* Special HTML formating for adding icons to PR filter select2 component */
function formatPRSelection(val) {
	return '<span class="pr-icon"><i class="pr-sprite pr-order-sm"></i></span>' + val.text;//No I18N
}

function updatePRListSort()
{
	if( jQuery('#sortOrder').hasClass('asc-sort') )
	{ 
		jQuery('#sortOrder').removeClass('asc-sort');//No I18N
		jQuery( document.getElementsByClassName('sort-icon') ).attr('title', getMessageForKey('sdp.purchase.request.listview.sortby.desc'));
	    	addPersonalization('prsortclass', "-");//No I18N
	}
	else
	{
		jQuery('#sortOrder').addClass('asc-sort');//No I18N
		jQuery( document.getElementsByClassName( 'sort-icon' ) ).attr('title', getMessageForKey('sdp.purchase.request.listview.sortby.asc'));
       		addPersonalization('prsortclass', "asc-sort");//No I18N
	}
}

function togglePRSummaryList( val )
{
	if ( val == true )
	{
        addPersonalization('showprsummarylist', "showPurchaseSummaryList");//No I18N
		document.location = '/PurchaseOrderList.do';
	}
	else if ( val == false )
	{
		addPersonalization('showprsummarylist', "hidePurchaseSummaryList");//No I18N
		document.location = '/PurchaseOrderList.do';
	}

}

function updatePOListSort()
{
	if( jQuery('#sortOrder').hasClass('asc-sort') )
	{
		jQuery('#sortOrder').removeClass('asc-sort');//No I18N
		jQuery('#sortOrder').attr('title', getMessageForKey('sdp.purchase.request.listview.sortby.desc'));
		addPersonalization('posortclass', "-");//No I18N
	}
	else
	{
		jQuery('#sortOrder').addClass('asc-sort');//No I18N
		jQuery('#sortOrder').attr('title', getMessageForKey('sdp.purchase.request.listview.sortby.asc'));
		addPersonalization('posortclass', "asc-sort");//No I18N
	}
}


var poInputJson = { "list_info": {"row_count": "10","start_index": "1" } , "fields_required": ["id", "custom_id" ,"subject" ,"created_date","status_name","owner_name","date_required","requester_name", "comments" , "is_overdue"] , "include" : [ "permissions" ] };//No I18N

if(isMSP) {
	poInputJson.fields_required.push("account_id");
}

var prInputJson = { "list_info": {"row_count": "10","start_index": "1", "fields_required": ["request_id", "subject","date_required","createdby_name","status_name", "requester_name", "technician_name", "is_overdue_notified","created_date", "comments"] } , "include" : [ "permissions" ] };//No I18N

if(isMSP) {
        prInputJson.list_info.fields_required.push("account_id");
}

/* Common function for Purchase module's UI
    This method used for list view, only when creating PR from flow chart.
*/


function loadPurchaseUI(startPosition)
{
	if( startPosition != null && startPosition != undefined )
	{
		prInputJson.list_info.start_index = "1";//No I18N
	}

	prInputJson.list_info.sort_field = jQuery('#listFilter').val();//No I18N
	prInputJson.list_info.row_count = jQuery('#perpage').val();//No I18N

	if( jQuery('#sortOrder').hasClass('asc-sort') )
	{
		prInputJson.list_info.sort_order = "asc";//No I18N
	}
	else
	{
		prInputJson.list_info.sort_order = "desc";//No I18N
	}

	var params = "input_data="+sdpToJSON(prInputJson);//NO I18N

    var prURL = '/PurchaseRequest.do?task=showList';//NO I18N
    
    	if(isMSP) {
    		prURL = appendAccountIdForPRUrls(prURL, getAccountId());
    	}
    	
	sdpAjax({type: 'POST', url: prURL, data: params, dataType: 'text', success: function(responseJson) { populatePurchaseData(JSON.parse(responseJson)) }});//NO I18N
}

function navigateToPreviousRecord()
{
	if( jQuery('#previousNavigation').attr('isFirstPage') == 'false' )
	{
		startIndex = parseInt(prInputJson.list_info.start_index);
		perPage = parseInt(prInputJson.list_info.row_count);

		startIndex = startIndex - perPage;

		if( startIndex <= 0 )
		{
			startIndex = 1;
		}
		prInputJson.list_info.start_index = startIndex;

		jQuery('#purchaseRequestList').html('');

	}
}
function navigateToPreviousRecordForPO()
{
	if( jQuery('#previousNavigation').attr('isFirstPage') == 'false' )
	{
		startIndex = parseInt(poInputJson.list_info.start_index);
		perPage = parseInt(poInputJson.list_info.row_count);

		startIndex = startIndex - perPage;

		if( startIndex <= 0 )
		{
			startIndex = 1;
		}
		poInputJson.list_info.start_index = startIndex;

		jQuery('#purchaseOrderList').html('');

	}

}

function navigateToNextRecordForPO()
{
	if( jQuery('#nextNavigation').attr('isLastPage') == 'false' )
	{
		startIndex = parseInt(poInputJson.list_info.start_index);
		perPage = parseInt(poInputJson.list_info.row_count);

		startIndex = startIndex + perPage;

		poInputJson.list_info.start_index = startIndex;

		//jQuery('#purchaseOrderList').html('');
		jQuery('#nextNavigation').attr("hasClicked","true");

	}

}
function navigateToNextRecord()
{
	if( jQuery('#nextNavigation').attr('isLastPage') == 'false' )
	{
		startIndex = parseInt(prInputJson.list_info.start_index);
		perPage = parseInt(prInputJson.list_info.row_count);

		startIndex = startIndex + perPage;

		prInputJson.list_info.start_index = startIndex;

		//jQuery('#purchaseRequestList').html('');
		jQuery('#nextNavigation').attr("hasClicked","true");


	}
}

var checkPOListRender = true ;

function populatePurchaseData(json)
{
	if ( ! json.purchaserequests )
	{
		if ( loadPODetailsandList )
		{
			loadPODetailsandList = false;
			if ( json.purchaseorders.length > 0 && json.purchaseorders[0].id != undefined )
			{
				viewPurchaseOrder( json.purchaseorders[0].id );
			}
			else
			{
				jQuery( document.getElementsByClassName('details-div') ).html('<div class="font14px"><p align="center" class="p20"> '+ getMessageForKey('sdp.requests.listview.nopurchaseordermessage') +'</p></div>')
			}
		}
	}
	else
	{

		if ( loadPRDetailsandList )
		{
			loadPRDetailsandList = false ;
			if ( json.purchaserequests.length > 0 && json.purchaserequests[0].request_id != undefined )
			{
				showPRDetails( json.purchaserequests[0].request_id )
			}
			else
			{
				jQuery( document.getElementsByClassName('details-div') ).html('<div class="font14px"><p align="center" class="p20">' + getMessageForKey('sdp.purchase.request.history.noprmessage') +'</p></div>');
				if ( jQuery( document.getElementById( 'assetrole' ) ).val() == 'null' )
				{
					jQuery('#switch-panel').show();
					jQuery('#toggle-back').hide();
				}
			}
		}
	}

	try
	{
		window.onresize = resize();
	}
	catch(e)
	{
		//Throwing 'Not Implemented error in IE'
	}

	jQuery(window).on('resize', function(){
		resize();
	});

	if ( checkPOListRender == true )
	{
		checkPOListRender = false;
		//render purchaseOrderList
		if( viewRequestId != null && prOperation == 'viewPR' )
		{
			showPRDetails(viewRequestId);
			viewRequestId = null;
			prOperation = null;
		}
		else if( prOperation != null && prOperation == 'newPR' )
		{
			newPurchaseRequest();
			viewRequestId = null;
			prOperation = null;
		}
		else if( poOperation != null && poOperation == "newPO" )
		{
			newPurchaseOrder();
			viewRequestId = null;
			poOperation = null;
		}
		else
		{
			//this condition is to check whether the PO summary list is loaded or not.
			if ( jQuery( '#purchaseOrderList' ).length == 0 )
			{
				loadPurchaseOrderList();
			}
		}
	}

	if  ( ! jQuery("#prfilter")  )
	{
		jQuery('#filterPO').select2({formatSelection: formatPRSelection,
		                escapeMarkup:function(t) { return t; },
		                containerCssClass : "purchase-filter-select",//No I18N
		                dropdownCssClass: "purchase-filter-select-drop",//No I18N
		                formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message') }
	        });
	}

	else
	{
		jQuery('#prfilter').select2({formatSelection: formatPRSelection,
			                escapeMarkup:function(t) { return t; },
			                containerCssClass : "purchase-filter-select",//No I18N
			                dropdownCssClass: "purchase-filter-select-drop",//No I18N
			                formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message') }
		        });
	}

	// Tooltip
	jQuery('.request-item').on('mouseenter', function(){
		var pos = jQuery(this).offset();
	   tip_text = jQuery(this).find('.req-tool-tip').html();
	   prStatus = jQuery(this).find('#prstatusname').html();
		if(tip_text && prStatus != 'Closed'){jQuery('.req-global-tip').show().html(tip_text).offset({top: pos.top+4});}
	}).on('mouseleave',function(){
		jQuery('.req-global-tip').hide();
	});

	jQuery('#filterPO').select2({formatSelection: formatPOSelection,
		escapeMarkup:function(t) { return t; },
		containerCssClass : "purchase-filter-select",//No I18N
		dropdownCssClass: "purchase-filter-select-drop",//No I18N
		formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message') }
	});

	jQuery('#listFilter').select2({containerCssClass : "purchase-filter-select",//No I18N
		minimumResultsForSearch: Infinity,
		dropdownCssClass: "purchase-filter-select-drop",//No I18N
		formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message') }
	});
}

function loadPurchaseOrderList()
{
	poSearchText = jQuery( " #posearchtext " ).val() == "" ? null : jQuery( " #posearchtext " ).val();
	if ( poSearchText != "null" )
	{
		//jQuery.ajax({type: 'POST', url: '/FlexiListView.ls?viewName=purchaseOrderList&searchText=' + poSearchText + '&height=' + (jQuery(window).height()-310), data: '', contentType: 'application/json; charset=utf-8', dataType: 'html', success: function(responseHtml) { jQuery('#poList').html(responseHtml); }});//NO I18N
	}
	else
	{
		//jQuery.ajax({type: 'POST', url: '/FlexiListView.ls?viewName=purchaseOrderList&filterBy='+ jQuery( document.getElementById( "filterPO" ) ).val() +'&height=' + (jQuery(window).height()-310), data: '', contentType: 'application/json; charset=utf-8', dataType: 'html', success: function(responseHtml) { jQuery('#poList').html(responseHtml); }});//NO I18N
	}
}


previousPOPerPageValue = 0;

function loadPOPerPage()
{
	addPersonalization( 'poPerPage', jQuery('#perpage').val());//No I18N

	countPOList = 0;

	jQuery("#purchaseOrderList").children().each(function(){
		countPOList  = countPOList + 1;
	});

	if ( previousPOPerPageValue <= countPOList || jQuery("#perpage").val() < previousPOPerPageValue )
	{
		jQuery('#purchaseOrderList').html('');
		jQuery( document.getElementById( 'purchaseOrderList' ) ).attr('loadPODetailsPage','true');
	}

}

previousPRPerPageValue = 0;

function loadPRPerPage()
{
	addPersonalization('prPerPage', jQuery('#perpage').val());//No I18N

	countPRList = 0;

	jQuery("#purchaseRequestList").children().each(function(){
		countPRList  = countPRList + 1;
	});

	if ( previousPRPerPageValue <= countPRList || jQuery("#perpage").val() < previousPRPerPageValue )
	{
		jQuery('#purchaseRequestList').html('');
		jQuery( document.getElementById( 'purchaseRequestList' ) ).attr('loadPRDetailsPage','true');
	}
}

previousPRSearchText = true;

viewRequestId = null;
prOperation = null;
showApprovalTag = null;

function loadPurchaseRequestSummary( operationName, requestId , showApprovalPage )
{
	viewRequestId = requestId;
	prOperation = operationName;
	showApprovalTag = showApprovalPage;

	jQuery("#searchBox").on('keypress', function(e)
	{
		if ( ! ( !jQuery("#searchBox").val().trim() ) )
		{
			previousPRSearchText = true;
		}

		if( e.which == 13 && previousPRSearchText )
		{
			if ( !jQuery("#searchBox").val().trim() )
			{
				previousPRSearchText = false;
			}

			jQuery('#purchaseRequestList').html('');
			jQuery( document.getElementById( 'purchaseRequestList' ) ).attr('loadPRDetailsPage','true');
			loadPurchaseUI(1);
		}
	});
	var getprfilter = getPersonalizeData('prFilter');//NO I18N
	var getprperpage = getPersonalizeData('prPerPage');//NO I18N
	var getprstatusfilter = getPersonalizeData('prStatusFilter');//NO I18N
	if ( Object.keys(getprfilter).length !=0 )
	{
		jQuery('#listFilter').val( getprfilter );
	}
	if ( Object.keys(getprperpage).length !=0 )
	{
		jQuery('#perpage').val( getprperpage );
	}
	if ( Object.keys(getprstatusfilter).length !=0 )
	{
		jQuery('#prfilter').val( getprstatusfilter );
	}

	var sortClass = getPersonalizeData('prsortclass');//No I18N

	if( Object.keys(sortClass).length !=0 )
	{
	        jQuery( document.getElementsByClassName('sort-icon') ).attr('title', getMessageForKey('sdp.purchase.request.listview.sortby.desc'));
		jQuery('#sortOrder').addClass(sortClass);
	}
	loadPurchaseUI();
}

previousSearchText = true;
poOperation = null;

function loadPurchaseOrderSummary( operationName )
{
	poOperation = operationName;

	jQuery( "#searchBox" ).on('keypress', function(e)
	{
		if ( ! ( !jQuery("#searchBox").val().trim() ) )
		{
			previousSearchText = true;
		}

		if( e.which == 13 && previousSearchText )
		{
			if ( !jQuery("#searchBox").val().trim() )
			{
				previousSearchText = false;
			}

			jQuery('#purchaseOrderList').html('');
			jQuery( document.getElementById( 'purchaseOrderList' ) ).attr('loadPODetailsPage','true');
		}
	});
	var getpofilter = getPersonalizeData('poFilter');//NO I18N
	var getpoperpage = getPersonalizeData('poPerPage');//NO I18N
	var getpostatusfilter = getPersonalizeData('poStatusFilter');//NO I18N
	if ( Object.keys(getpofilter).length !=0 )
	{
		jQuery('#listFilter').val( getpofilter );
	}
	if ( Object.keys(getpoperpage).length !=0 )
	{
		jQuery('#perpage').val( getpoperpage );
	}
	if ( Object.keys(getpostatusfilter).length !=0 )
	{
		jQuery('#filterPO').val( getpostatusfilter );
	}

	var sortClass = getPersonalizeData('posortclass');//No I18N

	if( Object.keys(sortClass).length !=0 )
	{
	        jQuery( document.getElementsByClassName('sort-icon') ).attr('title', getMessageForKey('sdp.purchase.request.listview.sortby.desc'));
		jQuery('#sortOrder').addClass(sortClass);
	}
}


function editPurchaseRequest( requestId, chooseVendor, productNames)
{
	jQuery('div[id*="flexigrid_bdiv_"]').getNiceScroll().remove();//NO I18N
	if ( ! jQuery( "#purchaseRequest-"+requestId )[0] )
	{
		jQuery('.details-div').html("<table height='100%' width='100%'><tr id='processing'><td align='center' colspan='2' width='100%' style='height:30px;'><img valign='middle' src='/images/ajax-loader.gif'>&nbsp;&nbsp;" + getMessageForKey("sdp.common.loading") + "</td></tr></table>");//NO I18N

		var param = '/PurchaseRequest.do?task=editPR&requestId=' + requestId;//NO I18N

		if( chooseVendor != undefined && chooseVendor != null && chooseVendor )
		{
			param += '&chooseVendor=true';//NO I18N
		}
		if( productNames != undefined && productNames != null)
		{
		    var names = sdpToJSON(productNames.split(','));
			param += '&productNames='+encodeURIComponent(names);//NO I18N
		}
		jQuery.ajax({type: 'GET', url: param, data: '' , contentType: 'plain/text; charset=utf-8', dataType: 'html', success: function(responseJson) { jQuery('.details-div').html(responseJson);//No I18N
		jQuery("#savePR").attr("choosevendor",chooseVendor);//NO I18N
		applyBrowserTitle();
		}});
	}
	jQuery('#pr-sidebar').attr('style','display: none !important');
	jQuery('#purchaseOrderList').getNiceScroll().remove();
	jQuery(window).on('resize', function(){
		jQuery('#single-details .details-div').height('auto');//No I18N
		jQuery('#content-div>.scroll-wrap').css('overflow','visible');//No I18N
		jQuery('.newpr-body').css('overflow','visible');//No I18N
		jQuery('#new-pr, .scroll-wrap').css('height','auto'); //No I18N
	});
	jQuery(window).trigger('resize');
	jQuery('#purchaseRequestList').getNiceScroll().resize();
	//Issue fix SD-92567
	jQuery('body').css({'overflow-y':'auto'});//No I18N
}

function showPRDetails( requestId, mandatoryLoad , isSimilarRequest )
{
	// jQuery('#flexigrid_bdiv_10').getNiceScroll().remove();//NO I18N
	 window.history.pushState({},"","/PurchaseRequest.do?task=viewPR&requestId="+requestId+'&sectionLoad=false');

    jQuery('#pr-sidebar').removeAttr('style'); //No I18N
	jQuery('div[id*="flexigrid_bdiv_"]').getNiceScroll().remove();//NO I18N
	if( jQuery('#purchaserequestid-' + requestId).length <= 0 || mandatoryLoad == true )
	{
		if( jQuery('.details-div').length > 0 )
		{
			jQuery( document.getElementById('showsummarylist') ).hide();
			jQuery( document.getElementById('content-div') ).removeClass( "ab-border" );
			jQuery('.details-div').html("<table height='100%' width='100%'><tr id='processing'><td align='center' colspan='2' width='100%' style='height:30px;'><img valign='middle' src='/images/ajax-loader.gif'>&nbsp;&nbsp;" + getMessageForKey("sdp.common.loading") + "</td></tr></table>");//NO I18N
			if( isSimilarRequest && isSimilarRequest != null && isSimilarRequest != undefined )
			{
				var prURL =  '/PurchaseRequest.do?task=viewPR&issimilarrequest=true&requestId=' + requestId;//NO I18N
				if(isMSP && document.getElementById('item-'+requestId)) {
					prURL = appendAccountIdForPRUrls(prURL, document.getElementById('item-'+requestId).getAttribute('account_id'));
				}
				jQuery.ajax({type: 'GET', url: prURL, data: '' , contentType: 'plain/text; charset=utf-8', dataType: 'html', success: function(responseJson) {jQuery('.details-div').html(responseJson);jQuery('.pr-details-wrap').niceScroll({cursorcolor: "#98AFC7", cursorwidth:"7px",  background: "#fff", cursorborder: "0", autohidemode: true,     cursorminheight: 30 });},//NO I18N
				complete : function(){ setTimeout(function(){ resize(); },100); //NO I18N
				}});//NO I18N
			}
			else
			{
				var prURL =  '/PurchaseRequest.do?task=viewPR&showApprovalPage='+ showApprovalTag +'&requestId=' + requestId;//NO I18N
				if(isMSP && document.getElementById('item-'+requestId)) {
					prURL = appendAccountIdForPRUrls(prURL, document.getElementById('item-'+requestId).getAttribute('account_id'));
				}

				jQuery.ajax({type: 'GET', url: prURL, data: '' , contentType: 'plain/text; charset=utf-8', dataType: 'html', success: function(responseJson) {jQuery('.details-div').html(responseJson);jQuery('.pr-details-wrap').niceScroll({cursorcolor: "#98AFC7", cursorwidth:"7px",  background: "#fff", cursorborder: "0", autohidemode: true,     cursorminheight: 30 });},//NO I18N
				complete : function(){ setTimeout(function(){ resize(); },100); //NO I18N
				}
				});//NO I18N
				showApprovalTag = null;
			}

		}
		else
		{
			jQuery('.details-div', window.parent.document).html("<table height='100%' width='100%'><tr id='processing'><td align='center' colspan='2' width='100%' style='height:30px;'><img valign='middle' src='/images/ajax-loader.gif'>&nbsp;&nbsp;" + getMessageForKey("sdp.common.loading") + "</td></tr></table>");//NO I18N

			var prURL =  '/PurchaseRequest.do?task=viewPR&requestId=' + requestId;//NO I18N

			if(isMSP) {
				prURL = appendAccountIdForPRUrls(prURL, document.getElementById('item-'+requestId).getAttribute('account_id'));
			}

			jQuery.ajax({type: 'POST', url: prURL, data: '' , contentType: 'plain/text; charset=utf-8', dataType: 'html', success: function(responseJson) { jQuery('.details-div', window.parent.document).html(responseJson);//No I18N
				jQuery('.pr-details-wrap', window.parent.document).niceScroll({cursorcolor: "#98AFC7", cursorwidth:"7px",  background: "#fff", cursorborder: "0", autohidemode: true,     cursorminheight: 30 });//NO I18N
			}, //NO I18N
			complete : function(){ setTimeout(function(){ resize(); },100);	}});//NO I18N

		}
	}
	else
	{
		if( isSimilarRequest ){closeDialog();}
	}

	jQuery('#content-div').removeClass('border-before');
	jQuery('.newpr-body').removeClass('pr-listview-page');

	setTimeout(function(){
		activateSelectionOnList( requestId ,'purchaseRequestList');//NO I18N
	},600);

	if ( jQuery( document.getElementById( 'assetrole' ) ).val() == 'null' )
	{
		jQuery('#switch-panel').show();
		jQuery('#toggle-back').hide();
	}
	jQuery('#_DIALOG_LAYER').remove();//NO I18N
	jQuery('.pr-details-wrap').getNiceScroll().resize();
	//Issue fix SD-91836
	jQuery('html, body').animate({ scrollTop: 0 }, "slow");//No I18N
	setTimeout(function(){
		jQuery(window).trigger('resize');
		jQuery('body').css({'overflow-x':'auto','overflow-y':'hidden'});//No I18N
	},200);
	//Issue fix SD-92567
	jQuery(window).on('resize', function(){
		jQuery('body').css({'overflow-x':'auto','overflow-y':'hidden'});//No I18N
	});
}

function newPurchaseRequest()
{
	// jQuery('#flexigrid_bdiv_10').getNiceScroll().remove();//NO I18N
	jQuery('div[id*="flexigrid_bdiv_"]').getNiceScroll().remove();//NO I18N
	jQuery('.details-div').html("<table height='100%' width='100%'><tr id='processing'><td align='center' colspan='2' width='100%' style='height:30px;'><img valign='middle' src='/images/ajax-loader.gif'>&nbsp;&nbsp;" + getMessageForKey("sdp.common.loading") + "</td></tr></table>");//NO I18N

	jQuery.ajax({type: 'GET', url: '/PurchaseRequest.do?task=newPR', data: '' , contentType: 'plain/text; charset=utf-8', dataType: 'html', success: function(responseJson) { jQuery('.details-div').html(responseJson);//No I18N
		applyBrowserTitle(); //No I18N
	// jQuery('.details-div').niceScroll({cursorcolor: "#98AFC7", cursorwidth:"7px",  background: "#fff", cursorborder: "0", autohidemode: true,     cursorminheight: 30 });
	}});//NO I18N
	jQuery('#pr-sidebar').attr('style','display: none !important');
	jQuery('#content-div').removeClass('border-before');
	jQuery(window).on('resize', function(){
		jQuery('#single-details .details-div').height('auto');//No I18N
		jQuery('#content-div>.scroll-wrap').css('overflow','visible');//No I18N
		jQuery('.newpr-body').css('overflow','visible');//No I18N
		jQuery('#new-pr, .scroll-wrap').css('height','auto'); //No I18N
	})
	jQuery(window).trigger('resize');
	jQuery('#purchaseRequestList').getNiceScroll().resize();
	//Issue fix SD-92567
	jQuery('body').css({'overflow-y':'auto'});//No I18N
}

function newPurchaseOrder(purchaseRequestId)
{
	var param = "action=fetchProductWithDoubleValue" //NO I18N
	var paramattribute = "";
	var accountid;
	if(isMSP && getAccountId()==0 && (purchaseRequestId == undefined || (purchaseRequestId != null && purchaseRequestId.toString().indexOf("requestIds") < 0))) {
                //Account ID will be taken from a different account combo when creating PO from similar PR window
		alert(getMessageForKey("sdp.admin.requesterImportWiz.selectAccountErrMsg"));//No I18N
		return;
        }
	if(isMSP) {
		if(purchaseRequestId != undefined && purchaseRequestId != null && purchaseRequestId.toString().indexOf("requestIds") > 0 && $('accountfilter')) {
			accountid = $('accountfilter').value;
		}
		else {
			accountid = getAccountId();
		}	
		param = appendAccountIdForPRUrls(param, accountid);
        }

	if( purchaseRequestId != undefined && purchaseRequestId != null )
	{
	    if( purchaseRequestId.toString().indexOf("requestIds") < 0 )
		{
	    	paramattribute += "&requestIds=" + purchaseRequestId;//NO I18N
		}
		else
		{
			paramattribute += purchaseRequestId;
		}
	}
	param +=paramattribute; 
	callCustomAjaxRequest("/servlet/AJaxServlet", param, function(req) {// no i18n
		if( req.responseText == 'Success' )
		{
			jQuery('div[id*="flexigrid_bdiv_"]').getNiceScroll().remove();//NO I18N
			jQuery('.details-div').html("<table height='100%' width='100%'><tr id='processing'><td align='center' colspan='2' width='100%' style='height:30px;'><img valign='middle' src='/images/ajax-loader.gif'>&nbsp;&nbsp;" + getMessageForKey("sdp.common.loading") + "</td></tr></table>");//NO I18N

			var param = '/PurchaseOrder.do?module=newPO';//No I18N
			param +=paramattribute;
			jQuery.ajax({type: 'POST', url: param, data: '' , contentType: 'plain/text; charset=utf-8', dataType: 'html', success: function(responseJson) { if(isMSP) { setAccountId(accountid);} jQuery('.details-div').html(responseJson);//No I18N
				applyBrowserTitle(); //No I18N
			}});//NO I18N
			jQuery('#pr-sidebar').attr('style','display: none !important');
			jQuery( document.getElementById( 'showsummarylist' ) ).hide();
			jQuery( document.getElementById( 'content-div' ) ).removeAttr("class");//No I18N
			jQuery( document.getElementById( 'purchaseRequestList') ).getNiceScroll().remove();

			jQuery(window).on('resize', function(){
				jQuery('#single-details .details-div').height('auto');//No I18N
				jQuery('#content-div>.scroll-wrap').css('overflow','visible');//No I18N
				jQuery('.newpr-body').css('overflow','visible');//No I18N
				jQuery('#new-pr, .scroll-wrap').css('height','auto'); //No I18N
			});
			jQuery('#purchaseOrderList').getNiceScroll().resize();
			jQuery('#purchaseRequestList').getNiceScroll().resize();
			jQuery(window).trigger('resize');
		}
		else
		{
			var productNames = req.responseText;
			alert(getMessageForKey('ae.purchaserequest.product.doublequantityerror', ZSEC.Encoder.encodeForHTML([productNames])));
			parent.closeDialog();
			var chooseVendor = jQuery("#savePR").attr("choosevendor");
			if( chooseVendor != undefined && chooseVendor != null && chooseVendor )
			{
				jQuery("#s2id_vendor").css("border", "");//NO I18N
				var productArray = productNames.split(",");
				productArray.forEach(function(entry) {
					jQuery('#requestedItemTable [id^=quantity_]').each( function() 
							{
								var index = ((this.id).split("_"))[1]; 
								if( isDouble(trim(this.value)) && trim(jQuery('#item_name_'+index).val()) == trim(entry))
								{
									markAsMandatoryElement(this.id);
									return false;
								}
							});
				});
				if(!jQuery("#saving").is(":visible"))
				{
					jQuery('#processing').addClass('hide');jQuery('#saving').removeClass('hide');//NO I18N
				}
			}
			else
			{
				editPurchaseRequest(purchaseRequestId, false, productNames);
			}
		}
	}, ajaxRequestOnFailure, 'fetchProductWithDoubleValue',false);//NO I18N
	//Issue fix SD-92567
	setTimeout(function(){
		jQuery('body').css({'overflow-y':'auto'});//No I18N
	},100);
}

function viewPurchaseOrder(purchaseOrderId, operation, viewPOdetailsandlist , viewPOdetailsalone )
{
	window.history.pushState({},'', '/PurchaseOrder.do?module=view&poID='+purchaseOrderId+'&sectionLoad=false'); // No I18N
	// jQuery('#flexigrid_bdiv_10').getNiceScroll().remove();//NO I18N
	jQuery('#pr-sidebar').removeAttr('style'); //No I18N
	jQuery('div[id*="flexigrid_bdiv_"]').getNiceScroll().remove();//NO I18N
	if( purchaseOrderId != null && (jQuery('#purchaseOrder_' + purchaseOrderId).length <= 0 || viewPOdetailsandlist == true) )
	{
		var param = '/PurchaseOrder.do?module=view&poID=' + purchaseOrderId + '&sectionLoad=true';//NO I18N

		if( operation != undefined && operation != null )
		{
			param += "&operation=" + operation;//No I18N
		}

		jQuery('.details-div').html("<table height='100%' width='100%'><tr id='processing'><td align='center' colspan='2' width='100%' style='height:30px;'><img valign='middle' src='/images/ajax-loader.gif'>&nbsp;&nbsp;" + getMessageForKey("sdp.common.loading") + "</td></tr></table>");//NO I18N

		jQuery.ajax({type: 'GET', url: param, data: '' , contentType: 'plain/text; charset=utf-8', dataType: 'html', success: function(responseJson) { jQuery('.details-div').html(responseJson);//No I18N
			applyBrowserTitle(); //No I18N
		jQuery('.pr-details-wrap').niceScroll({cursorcolor: "#98AFC7", cursorwidth:"7px",  background: "#fff", cursorborder: "0", autohidemode: true,     cursorminheight: 30 });//NO I18N
		closeDialog();if ( viewPOdetailsalone != true ) { updatePurchaseOrderSummaryList(purchaseOrderId, viewPOdetailsandlist ) }},
		complete : function(){
					setTimeout(function(){ resize(); },100);
				}});//NO I18N

		jQuery( document.getElementById( 'content-div') ).removeAttr( 'class' );//NO I18N
		jQuery( document.getElementById( 'showsummarylist' ) ).hide();
		jQuery('#new-pr #sidebar').show();
		jQuery(window).on('resize', function(){
			resize();
			// jQuery('#content-div>.scroll-wrap').css('overflow','auto');//No I18N
			//Issue fix SD-92567
			jQuery('body').css({'overflow':'hidden'});//No I18N
		});
		jQuery(window).trigger('resize');

		setTimeout(function(){
			activateSelectionOnList(purchaseOrderId,'purchaseOrderList');//NO I18N
			jQuery('.pr-details-wrap').getNiceScroll().resize().show();
		},600);

		jQuery('#purchaseOrderList').getNiceScroll().resize();
		jQuery('#purchaseRequestList').getNiceScroll().remove();
		jQuery('#_DIALOG_LAYER').remove();//NO I18N
		//Issue fix SD-92567
		setTimeout(function(){
			jQuery(window).trigger('resize');
			jQuery('body').css({'overflow':'hidden'});//No I18N
		 },200);
	}
	else if ( purchaseOrderId == null )
	{
		document.location = '/PurchaseOrderList.do';
	}

}

function updatePurchaseOrderSummaryList(purchaseOrderId, mandatoryLoad)
{
	if( jQuery('#purchaseOrderList').length <= 0 || mandatoryLoad == true )
	{
		jQuery('#pr-sidebar').html("<table height='100%' width='100%'><tr id='processing'><td align='center' colspan='2' width='100%' style='height:30px;'><img valign='middle' src='/images/ajax-loader.gif'>&nbsp;&nbsp;" + getMessageForKey("sdp.common.loading") + "</td></tr></table>");//NO I18N

		jQuery.ajax({type: 'GET', url: '/purchase/posummarylist.jsp', data: '' , contentType: 'plain/text; charset=utf-8', dataType: 'html', success: function(responseJson) { jQuery('#pr-sidebar').html(responseJson);if ( jQuery( document.getElementById( 'assetrole' ) ).val() != "null" ) { jQuery( document.getElementById( 'switchtopr' ) ).remove(); } }});//NO I18N
	}
}

// Resize NiceScroll on clicking tabs in PO and PR
jQuery(document).on('click','.details-tabs a, #tabSection a',function(){//NO I18N
	jQuery('.pr-details-wrap').getNiceScroll().resize().show();
});

var loadPRDetailsandList = false;
function switchToPR()
{
	jQuery('#purchaseOrderList').getNiceScroll().remove();
	loadPRDetailsandList = true;
	jQuery.ajax({type: 'GET', url: '/purchase/prsummarylist.jsp', data: '' , contentType: 'plain/text; charset=utf-8', dataType: 'html', success: function(responseJson) { jQuery('#pr-sidebar').html( responseJson ).find('#pr-sidebar').attr('id',''); jQuery('#toggle-back').hide(); jQuery('#switch-panel').show();}});//NO I18N
}

var loadPODetailsandList = false;
function switchToPO()
{
	jQuery('#purchaseRequestList').getNiceScroll().remove();
	loadPODetailsandList = true;
	jQuery.ajax({type: 'GET', url: '/purchase/posummarylist.jsp', data: '' , contentType: 'plain/text; charset=utf-8', dataType: 'html', success: function(responseJson) { jQuery('#pr-sidebar').html(responseJson);}});//NO I18N
}

// Export as dropdown position fix
jQuery(document).on('click','#new-pr #export-list-as_purchaseOrderList',function(){ //NO I18N
	jQuery('#export-options_purchaseOrderList').css({'top':jQuery(this).position().top+68,'left':jQuery(this).position().left}); //NO I18N
});

//Refresh niceScroll on tab click
jQuery(document).on('click','#new-pr .details-div',function(){//NO I18N
	setTimeout(function(){
		jQuery('.pr-details-wrap').getNiceScroll().resize();//NO I18N
	},500);
});

// Nicescroll fix in detial PR page
jQuery(document).on('click','#new-pr .details-tabs li, #new-pr .ui-tabs1',function(){//NO I18N
	jQuery('div[id*="flexigrid_bdiv_"]').getNiceScroll().remove();//NO I18N
});

// PR notification tabs
jQuery(document).on('click','.pr-ui-tab a',function(){//NO I18N
	var obj = jQuery(this);//NO I18N
	obj.closest('ul').find('a').removeClass('active').end().end().addClass('active');//NO I18N
	jQuery('.pr-ui-tab-content').removeClass('active').parent().find(obj.attr('data-tab')).addClass('active');//NO I18N
});

// Show searchBox
jQuery(document).on('click','a.pr-toggle-search',function(event){//NO I18N
	jQuery(this).toggleClass('active');//NO I18N
	jQuery('.show-pr-search').toggle().find('input').trigger('focus');//NO I18N
	if ( ! jQuery( document.getElementsByClassName( 'show-pr-search' ) ).is( ":visible" ) )
	{
		var e = jQuery.Event("keypress");//NO I18N
		e.which = 13;
		jQuery( document.getElementsByClassName( 'show-pr-search' ) ).find('input').val('').trigger(e);
	}
});

// Check listview page
jQuery(document).ready(function(){//NO I18N
	if(jQuery('#content-div').hasClass('border-before')){//NO I18N
		jQuery('.newpr-body').addClass('pr-listview-page');//NO I18N
	}

	jQuery(document).on('click', function(){//NO I18N
		if(jQuery('.newpr-body').hasClass('pr-listview-page')){//NO I18N
		    jQuery.ajaxSetup({//NO I18N
		        complete: function(){ jQuery('.newpr-body').removeClass('pr-listview-page'); }//NO I18N
		    });
		}
	});
});

//UI for purchase Home Page
function setUIForCreatePurchase()
{
	if(jQuery(window).height()<870){
		jQuery('.create-first-btns').addClass('fix-to-bottom');//NO I18N
		jQuery('.workflow-diagram').css('margin-bottom',200);//NO I18N
	}
	jQuery(window).on('scroll', function(){
		jQuery('.create-first-btns').removeClass('fix-to-bottom');
		jQuery('.workflow-diagram').css('margin-bottom',0);//NO I18N
	});
}

//This function is used for remove filter link in the purchase home page
function removeFilterLinks()
{
	jQuery("#purchaseWorkFlow a").not("#createPR,#createPO").removeAttr("onclick").css({'cursor': 'default', 'color': '#000'});//NO I18N
	if ( ! jQuery( document.getElementById("createPR") ).length )
	{
		jQuery( document.getElementById("purchaserequestheader") ).remove();
		jQuery( document.getElementById("purchaseorderheader") ).removeClass( 'fl' ).parent().addClass('fix-to-bottom create-only-one');
	}
	if ( ! jQuery( document.getElementById("createPO") ).length )
	{
		jQuery( document.getElementById("purchaseorderheader") ).remove();
		jQuery( document.getElementById("purchaserequestheader") ).removeClass( 'fl' ).parent().addClass( 'fix-to-bottom create-only-one' );
	}
}

function setFilterLinksInPurchaseWorkFlow()
{
	jQuery('#_DIALOG_LAYER').css('z-index',10000);//NO I18N

	if ( ! jQuery( document.getElementById("createPR") ).length )
	{
		jQuery( "#workflowPR a" ).removeAttr("onclick").css({'cursor': 'default', 'color': '#000'});//NO I18N
	}
	if ( ! jQuery( document.getElementById("createPO") ).length )
	{
		jQuery( "#workflowPO a" ).removeAttr("onclick").css({'cursor': 'default', 'color': '#000'});//NO I18N
	}
}

function loadPRListCorrespondingToFilter()
{
	var purchaseRequestId = jQuery( jQuery( document.getElementById( "purchaseRequestList" ) ).find( '[id^="item-"]' )[0] ).attr("id").split("item-")[1];
	var currentPRIdInDetailsPage = jQuery( '[id^=purchaserequestid-]').attr("id") != undefined ? jQuery( '[id^=purchaserequestid-]').attr("id").split("-")[1] : null;
	var loadprdetailspage = true;
	if ( purchaseRequestId != "0" )
	{
		if ( currentPRIdInDetailsPage != null )
		{
			jQuery( document.getElementById( "purchaseRequestList" ) ).find( '[id^="item-"]' ).each(function(){
				if ( jQuery( this ).attr("id").split("item-")[1] == currentPRIdInDetailsPage )
				{
					loadprdetailspage = false;
					activateSelectionOnList( currentPRIdInDetailsPage ,'purchaseRequestList');//NO I18N
					jQuery( ".req-list , #purchaseRequestList #item-"+currentPRIdInDetailsPage ).animate({
						scrollTop: jQuery( "#item-"+currentPRIdInDetailsPage ).offset().top-190
					}, 1500);
				}
			});
		}
		if ( loadprdetailspage )
		{
			showPRDetails( purchaseRequestId );
		}
	}
	else
	{
		jQuery( document.getElementsByClassName('details-div') ).html('<div class="font14px"><p align="center" class="p20">' + getMessageForKey('sdp.purchase.request.history.noprmessage') +'</p></div>');
		if ( jQuery( document.getElementById( 'assetrole' ) ).val() == 'null' )
		{
			jQuery('#switch-panel').show();
			jQuery('#toggle-back').hide();
		}
	}
}

function hidePurchaseRequestSummaryList()
{
	var prSummaryView = getPersonalizeData('showprsummarylist');//NO I18N
	if ( Object.keys(prSummaryView).length!=0 && prSummaryView != 'showPurchaseSummaryList' && jQuery( document.getElementById('assetrole') ).val() == "null" )
	{
		jQuery('#new-pr #sidebar').hide();
		jQuery( document.getElementById('showsummarylist') ).show();
		jQuery( document.getElementById('content-div') ).addClass( "ab-border" );
	}
}

function loadPurchaseCorrespondingToParameter( getOperationAttribute , getOperationParameter , getPOId , getPurchaseRequestId , canShowApprovalPage )
{
	if (  getOperationAttribute  == 'newPO')
	{
		newPurchaseOrder();
	}
	else if ( getOperationParameter == 'viewPO' )
	{
		viewPurchaseOrder( getPOId , null , true , false );
	}
	else if ( jQuery( document.getElementById('assetrole') ).val() == 'PurchaseRequest' && getOperationParameter != 'newPR' )
	{
		if( getOperationParameter == "viewPR" )
		{
			loadPurchaseRequestSummary( getOperationParameter , getPurchaseRequestId , canShowApprovalPage );
		}
		else
		{
			switchToPR();
		}
	}
	else if ( jQuery( document.getElementById('assetrole') ).val() == 'PurchaseOrder' )
	{
		jQuery('#new-pr #sidebar').hide();
		var postatusfilter = getPersonalizeData("poStatusFilter");//NO I18N
		if ( Object.keys(postatusfilter).length != 0 )
		{
			jQuery( document.getElementById( 'filterPO' ) ).val( postatusfilter );
		}
		loadPurchaseOrderList();
		jQuery( document.getElementById( 'filterPO' ) ).select2({formatSelection: formatPOSelection,
			escapeMarkup:function(t) { return t; },
			containerCssClass : "purchase-filter-select",//No I18N
			dropdownCssClass: "purchase-filter-select-drop",//No I18N
			formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message') }
		});
	}
	else
	{
		var postatusfilter = getPersonalizeData("poStatusFilter");//NO I18N
		if ( Object.keys(postatusfilter).length  != 0 )
		{
			jQuery( document.getElementById( 'filterPO' ) ).val( postatusfilter );
		}
		loadPurchaseRequestSummary( getOperationParameter , getPurchaseRequestId , canShowApprovalPage );
	}
}


function loadAssociatedSRsToPurchaseRequest( requestId )
{
	sdpAjax({type: 'GET', url: encodeURI('/api/v3/purchaserequests/'+Number(requestId)+'?INPUT_DATA={ "fields_required" : ["request_id","status_name"], "include" : ["archieved_requests", "service_requests"] }&date='+new Date().getTime()) , data: null , contentType: 'application/json; charset=utf-8', dataType: 'json', success: function(responseJson) { loadassociatedSRsToPR( responseJson ) }});//NO I18N
}


function loadassociatedSRsToPR( json )
{
	//temporary fix for site related respone.We need to fix in the API Call.below one only
	var srPurchaseData = ( json.purchaserequests != undefined ? json.purchaserequests : {} );

	var containsAssociatedSRData = false;

	if( jQuery( document.getElementById( "associatedServiceRequesttoPurchaseRequest" ) ).length == 0 )
	{
		jQuery( document.getElementById( "associatedrequestheader" ) ).prepend('<td valign="top" id="associatedServiceRequesttoPurchaseRequest"><div class="p20 mt20" align="center" id="associatesrtopr"><p>'+getMessageForKey("sdp.requests.prassociation.listview.noservicerequest")+'</p>');
	}
	jQuery.each( srPurchaseData , function( key , value )
	{
		if ( key != "request_status" && typeof( value ) == "object" && value != null )
		{
			containsAssociatedSRData = true;
			jQuery.each( value , function( index, item )
			{
				var cloneSRelement = jQuery( document.getElementById( "srItem-sample" ) ).clone();
				var srsitecheck = false;
                if(sdp_user.ROLES.indexOf("Restrict site access") > -1){
                    if(key=="service_requests"){
                        var ids = site_details.list.map(item => item.id);
                        if(item.site == null){
                            item.site=0;
                        }
                        if(ids.contains(item.site)){
                            srsitecheck = true;
                        }
                    }else{
                        var sitenames = site_details.list.map(item => item.name);
                        if(item.site == null){
                            item.site = "Not associated to any site"//No I18N
                        }
                        if(sitenames.contains(item.site)){
                            srsitecheck = true;
                        }
                    }
                }
                else{
                    srsitecheck = true;
                }
                var sr_privew =' NewWindow("/workorder/WOPrintPreview.jsp?isPreview=true&trimmed_details=request_details,requester_details,share_request,history,conversations,resolution,worklog,notes&woID=' + Number(item.service_request_id) + '&fromListView=true", "WOPrintView", "850", "600", "yes", "center")';
                if(!srsitecheck){
                    sr_privew = '';
                }

				//jQuery( cloneSRelement ).attr({ "id" : "srItem-"+ item.service_request_id , "onclick" : 'NewWindow("/WorkOrder.do?woMode=printWO&woID='+ item.service_request_id +'&fromListView=true", "WOPrintView", "850", "600", "yes", "center")' }).css({ "display":"block" }).append('<i class="req-sprite service-req-icon pr-sr-icon"></i>');//NO I18N
				jQuery( cloneSRelement ).attr({ "id" : "srItem-"+ Number(item.service_request_id) , "data-event" : "click", "data-handler" : sr_privew,"nonce" : sdpNonce }).css({ "display":"block" }).append('<i class="req-sprite service-req-icon pr-sr-icon"></i>');//NO I18N
				jQuery( cloneSRelement ).find( "#srsubject" ).text( "# " + Number(item.service_request_id) + " - " + replaceHTMLCode( replaceHTMLCode(item.subject) ) );
				if(srsitecheck){
					jQuery( cloneSRelement ).find( "#srsubject" ).html("<a id='srsubjectlink' herf='/'> #" + Number(item.service_request_id) + " - " +encodeHTML(item.subject)+"</a>");
				}
				jQuery( cloneSRelement ).find( "#srrequestedby" ).text( item.requester != null ? replaceHTMLCode(item.requester.name) :  getMessageForKey('sdp.common.notassigned') );
				jQuery( cloneSRelement ).find( "#srduedate" ).text( item.duebytime != null ? item.duebytime.display_value : getMessageForKey('sdp.common.notassigned') );
				jQuery( cloneSRelement ).find( "#srcreatedDate" ).text( item.created_date!= null ? item.created_date.display_value : getMessageForKey('sdp.common.notassigned') );
				jQuery( cloneSRelement ).find( "#srtechnician" ).text( item.technician != null ? replaceHTMLCode(item.technician.name) : getMessageForKey('sdp.common.notassigned') );
				jQuery( cloneSRelement ).find( "#srstatusname" ).text( ( item.status != null ? ( item.status.name != undefined ? replaceHTMLCode( item.status.name ) : replaceHTMLCode( item.status ) ) : getMessageForKey('sdp.common.notassigned') ) );
				
				jQuery( document.getElementById( "associatedSRsToPR" ) ).append( cloneSRelement );

				if( key == "service_requests" )
				{
					jQuery( cloneSRelement ).find("#deassociatedSRfromPR").attr({ "data-event" : "click" ,"data-handler" : "event.stopPropagation();detachSRfromPurchaseRequest(" + srPurchaseData.request_id +","+ item.service_request_id +")", "nonce" : sdpNonce });
					if(srsitecheck){
					    jQuery( cloneSRelement ).find("#srsubjectlink").off('click').on('click', (event) => { //NO I18N
                            window.location.href="/WorkOrder.do?woMode=viewWO&woID="+Number(item.service_request_id)+"&fromListView=true";
                        });
					}
					
					if( srPurchaseData.request_status.name == "Closed" || !jQuery("#hasmodifySRPermission").length || item.status.name == "Closed" || !srsitecheck)
					{
						jQuery( cloneSRelement ).find("#deassociatedSRfromPR").remove();
					}
					if( !item.is_active_request )
					{
						jQuery( cloneSRelement ).find("#deassociatedSRfromPR").remove();
					}
				}
				else
				{
					jQuery( cloneSRelement ).find("#deassociatedSRfromPR").remove();
					jQuery( cloneSRelement ).find('h4').prepend('<small class="mr5">'+getMessageForKey("sdp.archive.dView.purchase.arcReq.header")+'</small>');
					if(srsitecheck){
                        jQuery( cloneSRelement ).attr({"data-event" : "click" , "data-handler" : 'NewWindow("/SDArchiveWorkOrder.do?woMode=PrintView&woID='+ Number(item.service_request_id) +'&fromListView=true", "WOPrintView", "850", "600", "yes", "center",null,null,null,true)', "nonce" : sdpNonce});
                        jQuery( cloneSRelement ).find("#srsubject").attr({ "data-event" : "click" ,"data-handler" : "document.location='/SDArchiveWorkOrder.do?woMode=viewWO&woID="+Number(item.service_request_id)+"'", "nonce" : sdpNonce});
					}
					
				}
				setTimeout(function () {
						$sdEventListener(jQuery("#srItem-"+ item.service_request_id));
						$sdEventListener(jQuery("#deassociatedSRfromPR"));
						$sdEventListener(jQuery("#srsubject"));
					},100);
			});
		}
	});
	if( containsAssociatedSRData )
	{
		jQuery( document.getElementById( "associatesrtopr" ) ).css({ "display" : "none" });//NO I18N
		jQuery( document.getElementById( "associatePurchaseRequestToSR" ) ).removeAttr("style");//NO I18N
	}
	else
	{
		jQuery( document.getElementById( "associatePurchaseRequestToSR" ) ).css({ "display" : "none" });//NO I18N
		jQuery( document.getElementById( "associatesrtopr" ) ).removeAttr("style");//NO I18N
	}
}

function loadAssociatedSRsandPRsToPurchaseOrder( purchaseorderId )
{
	if( jQuery("title:contains(ManageEngine AssetExplorer)").length > 0 )
	{
		var inputdata='{"fields_required" : ["id","status_name"],"include" : [prassociation]}'; //No I18N
		inputdata=encodeURIComponent(inputdata);
		sdpAjax({type: 'GET', url: '/api/v3/purchaseorders/'+Number(purchaseorderId)+'?INPUT_DATA='+inputdata+'&date='+new Date().getTime() , data: null , contentType: 'application/json; charset=utf-8', dataType: 'json', success: function(responseJson) { loadassociatedSRsandPRsToPO( responseJson ) }});//NO I18N
	}
	else
	{
		var inputdata='{"fields_required" : ["id","status_name"],"include" : [prassociation,service_requests,archieved_requests]}'; //No I18N
		inputdata='INPUT_DATA='+encodeURIComponent(inputdata);  //No I18N
		sdpAjax({type: 'GET', url: '/api/v3/purchaseorders/'+Number(purchaseorderId) +'?'+inputdata+'&date='+new Date().getTime() , data: null , contentType: 'application/json; charset=utf-8', dataType: 'json', success: function(responseJson) { loadassociatedSRsandPRsToPO( responseJson ) }});//NO I18N
	}
}

function loadassociatedSRsandPRsToPO( json )
{
	var associatedSRandPRdata = json.purchaseorders;
	var containsAssociatedPRandSRData = false;

	if( jQuery( document.getElementById( "isUserToAssociatePurchaseRequest" ) ).length == 0 )
	{
		jQuery( document.getElementById( "associatePRstoPurchaseOrder" ) ).remove();
		jQuery( document.getElementById( "associatefirstprtopo" ) ).remove();
	}

	if( jQuery( document.getElementById("isUserToAssociateServiceRequestsToPo") ).length == 0)
	{
		jQuery( document.getElementById( "AssociateServiceRequestsToPo" ) ).remove();
		jQuery( document.getElementById( "associatefirstsrtopo" ) ).remove();
	}
	jQuery.each( associatedSRandPRdata , function( key , value ){
		if( key!= "POStatus" && typeof( value ) == "object" && value != null )
		{
			containsAssociatedPRandSRData = true;
			jQuery.each( value , function( index , item ){
				loadPRData = true;
				if ( key == "prassociation" )
				{
					if(  item.hasOwnProperty( "pr_service_requests") )
					{
						loadPRData = false;
						jQuery.each( item.pr_service_requests , function( position , prassociationObj )
						{
							loadValueForPOassciation( prassociationObj , key , associatedSRandPRdata , item );
						});
					}
					if( item.hasOwnProperty( "pr_archieved_requests" ) )
					{
						loadPRData = false;
						jQuery.each( item.pr_archieved_requests , function( position , prassociationObj )
						{
							loadValueForPOassciation( prassociationObj , "archieved_requests" , associatedSRandPRdata , item);//NO I18N
						});
					}
				}
				if( loadPRData )
				{
					loadValueForPOassciation( item , key , associatedSRandPRdata );
					if( key == "service_requests" && ( associatedSRandPRdata.POStatus.name == "Canceled" || !jQuery("#UserallowtodetachSR").length ) )
					{
						jQuery("#poassociatedrequest_Item-"+item.request_id).find("#deassociatedSRorPRfromPO").remove();
					}
				}
			});
		}
	});
	if( containsAssociatedPRandSRData )
	{
		jQuery( document.getElementById( "associateprsandsrstopurchaseOrder" ) ).css({ "display" : "none" });//NO I18N
		jQuery( document.getElementById( "associatedpurchaseandserviceRequesttoPO" ) ).removeAttr("style");//NO I18N
	}
	else
	{
		jQuery( document.getElementById( "associatedpurchaseandserviceRequesttoPO" ) ).css({ "display" : "none" });//NO I18N
		jQuery( document.getElementById( "associateprsandsrstopurchaseOrder" ) ).removeAttr("style");//NO I18N
	}
}

var incrementCountForPurchaseData = 0;
function loadValueForPOassciation( itemObj , key , associatedSRandPRdata , prDataForassociatedSRs )
{
	var clone_ListView_element = jQuery( document.getElementById( "poassociatedrequestItem-sample" ) ).clone();
	var cloneElement = jQuery(clone_ListView_element);
	var notAssignedMessage = getMessageForKey('sdp.common.notassigned');
	var subject =  ( "# " + itemObj.request_id + " - " + replaceHTMLCode(itemObj.subject));
	var requester = ( itemObj.requester != null ? itemObj.requester.name : notAssignedMessage);
	if(itemObj.duebytime != undefined) {
		var duebytime = ( itemObj.duebytime != null ? itemObj.duebytime.display_value : notAssignedMessage );
	}
	else {
	   var duebytime = ( itemObj.date_required != null ? itemObj.date_required.display_value : notAssignedMessage );
	}
	var technician = ( itemObj.technician !=null ? itemObj.technician.name : notAssignedMessage );
	var createddate = ( itemObj.created_date != null ? itemObj.created_date.display_value : notAssignedMessage);
	var statusname = ( key != "archieved_requests" ? itemObj.status != null ? replaceHTMLCode(itemObj.status.name) : notAssignedMessage : ( itemObj.status != null ? replaceHTMLCode(itemObj.status) : notAssignedMessage ));//NO I18N

	//cloneElement.attr({ "id" : "poassociatedrequest_Item-"+itemObj.request_id , "onclick" : 'NewWindow("/WorkOrder.do?woMode=printWO&woID='+ itemObj.request_id +'&fromListView=true", "WOPrintView", "850", "600", "yes", "center")' }).css({ "display":"block" }).append('<i class="req-sprite service-req-icon pr-sr-icon"></i>');//NO I18N
	if(sdp_user.ROLES.indexOf("ViewRequests") != -1) {
	cloneElement.attr({ "id" : "poassociatedrequest_Item-"+itemObj.request_id , "data-event" : "click", "data-handler" : 'NewWindow("/workorder/WOPrintPreview.jsp?isPreview=true&trimmed_details=request_details,requester_details,share_request,history,conversations,resolution,worklog,notes&woID='+ itemObj.request_id +'&fromListView=true", "WOPrintView", "850", "600", "yes", "center")',"nonce" : sdpNonce}).css({ "display":"block" }).append('<i class="req-sprite service-req-icon pr-sr-icon"></i>');//NO I18N
	}
	else {
	   cloneElement.attr({ "id" : "poassociatedrequest_Item-"+itemObj.request_id}).css({ "display":"block" }).append('<i class="req-sprite service-req-icon pr-sr-icon"></i>');//NO I18N
	}
	cloneElement.find("#poassociatedrequest_subject").text( subject );
	cloneElement.find("#poassociatedrequest_requestedby").html(encodeHTML(requester));
	cloneElement.find("#poassociatedrequest_duedate").text( duebytime );
	cloneElement.find("#poassociatedrequest_technician").html(encodeHTML(technician));
	cloneElement.find("#poassociatedrequest_createdtime").text( createddate );
	cloneElement.find("#poassociatedrequest_statusname").text(statusname );
	cloneElement.find("#deassociatedSRorPRfromPO").attr({ "data-event" : "click","data-handler" : "event.stopPropagation();detachRequests(" + associatedSRandPRdata.id +","+ itemObj.request_id +")" ,"nonce" : sdpNonce});
	
	if ( prDataForassociatedSRs != null )
	{

		//This check is for associate purchase request create from SR to purchase order
		if(sdp_user.ROLES.indexOf("ViewRequests") != -1) {

		cloneElement.find( "#poassociatedrequest_subject" ).html('<i class="pr-sprite pr-order-sm pr-sr-icon"></i>'+ "# " + Number(itemObj.request_id) + " - " + encodeHTML(itemObj.subject) ).attr({ "data-event" : "click", "data-handler" :  "document.location='/WorkOrder.do?woMode=viewWO&woID="+Number(itemObj.request_id)+"&fromListView=true'" , "nonce" : sdpNonce });//NO I18N
		}
		else {
		cloneElement.find( "#poassociatedrequest_subject" ).html('<i class="pr-sprite pr-order-sm pr-sr-icon"></i>'+ "# " + Number(itemObj.request_id) + " - " + encodeHTML(itemObj.subject) );//NO I18N
		}
		
		cloneElement.attr({ "id" : "poassociatedpurchaserequest_Item-"+prDataForassociatedSRs.request_id+"_"+incrementCountForPurchaseData });//NO I18N
		
		cloneElement.find("#deassociatedSRorPRfromPO").attr({ "data-event" : "click", "data-handler" : "event.stopPropagation();detachPurchaseRequests(" + associatedSRandPRdata.id +","+ prDataForassociatedSRs.request_id +" , this )" , "prtosrData" : "true", "nonce" : sdpNonce });

		cloneElement.find( "#poassociatedrequest_statusname" ).html( ZSEC.Encoder.encodeForHTML(statusname) + "    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PR # <a href='/' sdphrefJs='js-href-purchaserequest-ui-10' id='associatedPRLink' style='color: #1a6ebd'>"+ ZSEC.Encoder.encodeForHTML(prDataForassociatedSRs.request_id) + "</a>" );//NO I18N
		
		cloneElement.find("#associatedPRLink").attr({"data-event" : "click" , "data-handler" : "document.location='/PurchaseRequest.do?task=viewPR&requestId="+Number(prDataForassociatedSRs.request_id)+"&sectionLoad=false'", "nonce" : sdpNonce});
		
		if( jQuery( document.getElementById( "isUserToAssociatePurchaseRequest" ) ).length == 0 )
		{
			cloneElement.find("#deassociatedSRorPRfromPO").remove();
		}
		if( !itemObj.is_active_request )
		{
			cloneElement.find("#deassociatedSRorPRfromPO").remove();
		}
		
	}
	else if( prDataForassociatedSRs == null && key == "prassociation" )
	{
		//This check is for associate purchase request alone with the purchase order
		cloneElement.attr({ "id" : "poassociatedpurchaserequest_Item-"+itemObj.request_id , "data-event" : "click", "data-handler" : 'NewWindow("/PurchaseRequest.do?task=printView&requestId='+itemObj.request_id+'&fromListView=true", "WOPrintView", "850", "600", "yes", "center")', "nonce" : sdpNonce }).find('.service-req-icon').remove();
		cloneElement.find( "#poassociatedrequest_subject" ).prepend('<i class="pr-sprite pr-order-sm pr-sr-icon"></i>');

		cloneElement.find("#deassociatedSRorPRfromPO").attr({ "data-event" : "click" , "data-handler" : "event.stopPropagation();detachPurchaseRequests(" + associatedSRandPRdata.id +","+ itemObj.request_id +")" , "nonce" : sdpNonce });

		cloneElement.find("#poassociatedrequest_subject").attr({ "data-event" : "click" , "data-handler" : "document.location='/PurchaseRequest.do?task=viewPR&requestId="+itemObj.request_id+"&sectionLoad=false'", "nonce" : sdpNonce });
		
		if( jQuery( document.getElementById( "isUserToAssociatePurchaseRequest" ) ).length == 0 )
		{
			cloneElement.find("#deassociatedSRorPRfromPO").remove();
		}
		
	}

	if( key == "service_requests" )
	{
		if(sdp_user.ROLES.indexOf("ViewRequests") != -1) {
		cloneElement.find("#poassociatedrequest_subject").attr({ "data-event" : "click" , "data-handler" : "document.location='/WorkOrder.do?woMode=viewWO&woID="+itemObj.request_id+"&fromListView=true'", "nonce" : sdpNonce });
		}
		else {
		  cloneElement.find("#poassociatedrequest_subject").attr({ "data-event" : "click", "data-handler" : "event.stopPropagation();", "nonce" : sdpNonce });
		}
		
		if( !itemObj.is_active_request )
		{
			cloneElement.find("#deassociatedSRorPRfromPO").remove();
		}
	}
	else if( key == "archieved_requests" )
	{
		if(sdp_user.ROLES.indexOf("ViewRequests") != -1) {
		cloneElement.attr({"data-event" : "click" , "data-handler" : 'NewWindow("/SDArchiveWorkOrder.do?woMode=PrintView&woID='+ itemObj.request_id +'&fromListView=true", "WOPrintView", "850", "600", "yes", "center")', "nonce" : sdpNonce }).find('h4').prepend('<small class="mr5">'+getMessageForKey("sdp.archive.dView.purchase.arcReq.header")+'</small>');//NO I18N
        }
		else {
		  cloneElement.attr({"data-event" : "click" , "data-handler" : 'event.stopPropagation();' }).find('h4').prepend('<small class="mr5">'+getMessageForKey("sdp.archive.dView.purchase.arcReq.header")+'</small>');//NO I18N
		}	
		cloneElement.find("#poassociatedrequest_subject").attr({ "data-event" : "click" , "data-handler" : "document.location='/SDArchiveWorkOrder.do?woMode=viewWO&woID="+itemObj.request_id+"'" , "nonce" : sdpNonce});
		
		cloneElement.find("#deassociatedSRorPRfromPO").remove();
	}

	jQuery( document.getElementById( "associatedSrsandPrstoPO" ) ).append( cloneElement );
	
			$sdEventListener(jQuery("#poassociatedrequest_Item-"+itemObj.request_id));
			$sdEventListener(jQuery("#poassociatedpurchaserequest_Item-"+itemObj.request_id));
			$sdEventListener(jQuery("#poassociatedrequest_subject"));
			$sdEventListener(jQuery("#deassociatedSRorPRfromPO"));
			$sdEventListener(jQuery("#associatedPRLink"));
			if ( prDataForassociatedSRs != null ) {
				$sdEventListener(jQuery("#poassociatedpurchaserequest_Item-"+prDataForassociatedSRs.request_id+"_"+incrementCountForPurchaseData));
			}
	
	incrementCountForPurchaseData += 1;
}

