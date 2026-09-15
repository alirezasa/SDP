 /* $Id$ */
var assetArray = [];
var userData = {};

function getParsedString(str)
{
	var str = str.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/[\r\n]/g, "\\n");
	return str;
}
function addNewLoan(form)
{
	var userId = userData.id;
	var startTime = form.startDate.value;
	var endTime = form.endDate.value;
	var comments = form.comments.value;

	if (startTime == "")
	{
		form.startDate.focus();
		showBaloonToolTip('startDateDiv', getMessageForKey("common.from.empty")); //NO I18N
		return false;
	}
	else if (endTime == "")
	{
		form.endDate.focus();
		showBaloonToolTip('endDateDiv', getMessageForKey("common.to.empty")); //NO I18N
		return false;
	}
	var startTimeLong  = (startTime);
	var endTimeLong  = (endTime);
	if(startTimeLong > endTimeLong){
		form.endDate.focus();
		showBaloonToolTip('endDateDiv', getMessageForKey("common.validate.date")); //NO I18N
		return false;
	}
	else if(jQuery.isEmptyObject(assetArray) || assetArray == "")
	{
		var isBarcode = jQuery('#barcodeScan').prop('checked');//NO I18N
		if(isBarcode)
		{
			showBaloonToolTip('scannedBarcodes', getMessageForKey('ae.barcode.formValidation.scanBarcode')); //NO I18N
		}
		else
		{
			showBaloonToolTip('selectedAssets', getMessageForKey('sdp.asset.loan.selectresources')); //NO I18N
		}
		return false;
	}
	else if(!userData.hasOwnProperty("id"))
	{
		showBaloonToolTip('user', getMessageForKey("common.user.empty")); //NO I18N
		return false;
	}
	else if(comments.length > 250)
	{
		showalert("failure", getMessageForKey("common.comments.maxlength"), 'isAutoHide=false');//NO I18N
		jQuery("#comments").trigger('focus');
		return false;
	}
	else if(assetArray.length > 100)
	{
		showalert("failure", getMessageForKey("sdp.asset.loan.asset.max"), 'isAutoHide=false');//NO I18N
		return false;
	}
	else
	{
		var newArray = "";
    	if(assetArray != undefined)
   		{
    		jQuery.each(assetArray, function(key,value) {
    			if(newArray != "") { newArray += "," }
    			newArray += '{"asset":{"id":"'+ value.id + '","name":"'+ getParsedString(value.name) +'"}}';//NO I18N

    		});
   		}
    	newArray = "[" + newArray +"]";
		
    	var saveBtn = jQuery("#createLoanBtn");
    	inProgressBtn(saveBtn, getMessageForKey("sdp.asset.loan.add.inProgress"), true);
    	
    	var createLoanJSON = '{"asset_loan":{"loaned_assets":'+newArray+',"start_time":{"value":"'+startTime+'"},"end_time":{"value":"'+endTime+'"},"loaned_to":{"id":"'+userData.id+'"},"comments":"'+getParsedString(comments)+'"}}';//NO I18N
		var input_data = 'input_data='+encodeURIComponent(createLoanJSON);//No I18N
		sdpAjax({
			url: 'api/v3/asset_loans',//No I18N
			acceptODCompatible: true,
			type: "POST",//NO I18N
			async: true,
			dataType: 'json',//NO I18N
			data: input_data,
			success: function( data ) 
			{
				var views = parent.ViewNames;
				var viewname = Object.keys(views)[0];
				if(viewname != null)
				{
					parent.refreshSubView(getPortalViewName(viewname));
				}
				userData = {};
				var message = getMessageForKey("sdp.asset.loan.add.success");
				var status = 'success';//No I18N
				var isHideAlert = true;

				if(data.response_status.status != null && data.response_status.messages != null)
				{
					status = data.response_status.status;
					message = data.response_status.messages[0].message;
					if(status == "failed"){status="failure";isHideAlert=false;}
				}
				showalert(status, message, 'isAutoHide='+isHideAlert);//NO I18N
				closeDialog();
				setTimeout(function(){
    				initTooltip('#'+getPortalViewName("LoanRegistryListView")+'_TABLE');//NO I18N
				},200);
			},
			error: function(data)
			{
				inProgressBtn(saveBtn, getMessageForKey("sdp.asset.loan.checkOut"), false);

				var message =  getMessageForKey("sdp.asset.loan.add.failure");
				if(data.responseJSON != null || data.responseJSON.response_status.messages[0].message != null)
				{
					message = data.responseJSON.response_status.messages[0].message;
				}
				showalert('failure', message, 'isAutoHide=false');//NO I18N
				//closeDialog();
			}
		});
	}
}
function returnLoan(form)
{
	var userId = userData.id;
	var endTime = form.returnedDate.value;
	var comments = form.returnComments.value;
	if(endTime == '')
	{
		form.returnedDate.focus();
		showBaloonToolTip('returnDateDiv', getMessageForKey("common.to.empty")); //NO I18N
		return false;
	}
	else if(!userData.hasOwnProperty("id"))
	{
		showBaloonToolTip('returnByUser', getMessageForKey("common.user.empty")); //NO I18N
		return false;
	}
	else if(jQuery.isEmptyObject(assetArray) || assetArray == "" || assetArray == undefined)
	{
		var isBarcode = jQuery('#barcodeScan').prop('checked');//NO I18N
		if(isBarcode)
		{
			showBaloonToolTip('scannedBarcodes', getMessageForKey('ae.barcode.formValidation.scanBarcode')); //NO I18N
		}
		else
		{
			showBaloonToolTip('selectedAssets', getMessageForKey('sdp.asset.loan.selectAsset.return')); //NO I18N
		}
		return false;
	}
	else if(comments.length > 250)
	{
		showalert("failure", getMessageForKey("common.comments.maxlength"), 'isAutoHide=false');//NO I18N
		jQuery("#returnComments").trigger('focus');
		return false;
	}
	else if(assetArray.length > 100)
	{
		showalert("failure", getMessageForKey("sdp.asset.loan.return.asset.max"), 'isAutoHide=false');//NO I18N
		return false;
	}
	else
	{
		var returnLoanId = form.returnLoanId.value;
		var endTimeLong = endTime;
		
		var repairedAssets = jQuery('input:checkbox.repairAssets:checked').map(function () {return this.id.substring(18);}).get();
		
		var newAssetArray = '';
		for(var i=0; i<assetArray.length; i++)
		{
			var resJSON = assetArray[i];
			if(endTimeLong < resJSON.loan_start.value)
			{
				showalert("failure", getMessageForKey("sdp.asset.loan.validate.asset.returnTime", [encodeHTML(resJSON.name), resJSON.loan_start.display_value]), 'isAutoHide=false');//NO I18N
				return false;
			}
			var stateJSON = '{"name": "In Store"}';//NO I18N
			if(repairedAssets.contains(resJSON.id))
			{
				stateJSON = '{"name": "In Repair"}';//NO I18N
			}
			
			newAssetArray += (newAssetArray != '')?", ":"";
			newAssetArray += '{"id":'+resJSON.id+',"state":'+stateJSON+'}';//No I18N
		}
		
		var saveBtn = jQuery("#returnLoanBtn");
    	inProgressBtn(saveBtn, getMessageForKey("sdp.asset.loan.return.inProgress"), true);

		var returnLoanJSON = '{"asset":['+ newAssetArray +'],"returned_on":{"value":"'+endTime+'"},"comments":"'+getParsedString(comments)+'","returned_by":{"id":'+userData.id+'}}';//NO I18N
    	var input_data = 'input_data='+encodeURIComponent(returnLoanJSON);//No I18N
		sdpAjax({
			url: 'api/v3/loaned_assets/_return',//No I18N
			acceptODCompatible: true,
			type: "PUT",//NO I18N
			async: true,
			data: input_data,
			dataType: 'json',//NO I18N
			success: function( data ) 
			{
				userData = {};
				var views = parent.ViewNames;
				var viewname = Object.keys(views)[0];
				if(viewname != null)
				{
					parent.refreshSubView(getPortalViewName(viewname));
				}
				else if(returnLoanId != null)
				{
					renderLoanData(returnLoanId);
				}
				var message = getMessageForKey("sdp.asset.loan.return.success");
				var status = 'success';//No I18N
				var isHideAlert = true;
				
				if(data.response_status != null && data.response_status.messages != null)
				{
					status = data.response_status.status;
					message = data.response_status.messages[0].message;
				}
				else if(data.response_status[0] != null && data.response_status[0].messages != null)
				{
					status = data.response_status[0].status;
					message = data.response_status[0].messages[0].message;
				}
				if(status == "failed"){status="failure";isHideAlert=false;inProgressBtn(saveBtn, getMessageForKey("sdp.asset.loan.checkIn"), false);}
				showalert(status, ZSEC.Encoder.encodeForHTML(message), 'isAutoHide='+isHideAlert);//NO I18N
				closeDialog();
				setTimeout(function(){
    				initTooltip('#'+getPortalViewName("LoanRegistryListView")+'_TABLE');//NO I18N
				},200);
			},
			error: function(data)
			{
				inProgressBtn(saveBtn, getMessageForKey("sdp.asset.loan.checkIn"), false);
				var message =  getMessageForKey("sdp.asset.loan.return.failure");
				if(data.responseJSON.response_status != null && data.responseJSON.response_status.messages != null)
				{
					message = data.responseJSON.response_status.messages[0].message;
				}
				else if(data.responseJSON.response_status[0] != null && data.responseJSON.response_status[0].messages != null)
				{
					message = data.responseJSON.response_status[0].messages[0].message;
				}
				
				showalert('failure', ZSEC.Encoder.encodeForHTML(message), 'isAutoHide=false');//NO I18N
				//closeDialog();
			}
		});
	}
}
function extendLoan(id, url, input_data)
{
	if(url != "")
	{
		var saveBtn = jQuery("#editLoanBtn");
    	inProgressBtn(saveBtn, getMessageForKey("sdp.asset.loan.save.inProgress"), true);
    	
		sdpAjax({
			url: url,
			acceptODCompatible: true,
			type: "PUT",//NO I18N
			async: true,
			data: input_data,
			dataType: 'json',//NO I18N
			success: function( data )
			{
				showalert('success', getMessageForKey("sdp.asset.loan.extend.success"), 'isAutoHide=true');//NO I18N
				closeDialog();

				var views = parent.ViewNames;
				var viewname = Object.keys(views)[0];
				if(viewname != null)
				{
					parent.refreshSubView(getPortalViewName(viewname));
				}
				else
				{
					if(jQuery("#tab_1_1").hasClass("active"))
					{
						if(data.asset_loan == undefined)
						{
							renderLoanData(id);
						}
						else
						{
							renderLoanData(data.asset_loan);
						}
					}
					else
					{
						renderLoanHistory(id);
					}
				}
				setTimeout(function(){
    				initTooltip('#'+getPortalViewName("LoanRegistryListView")+'_TABLE');//NO I18N
					parent.attachDomEvents();
				},200);
			},
			error: function(data)
			{
				inProgressBtn(saveBtn, getMessageForKey("sdp.common.save"), false);
				
				var message = getMessageForKey("sdp.asset.loan.extend.failure");
				if(data.responseJSON.response_status != null && data.responseJSON.response_status.messages != null)
				{
					message = data.responseJSON.response_status.messages[0].message;
				}
				else if(data.responseJSON.response_status[0] != null && data.responseJSON.response_status[0].messages != null)
				{
					message = data.responseJSON.response_status[0].messages[0].message;
				}
				showalert('failure', message, 'isAutoHide=false');//NO I18N
				//closeDialog();
			}
		});
	}
}
function getAssetDetails(asset, isBarcode, isNewLoan)
{
	var assetJSON = {};
	if(asset != '')
	{
		var urlData = '';//No I18N
		var input_data = "";
		if(isBarcode)
		{
			var param = {"list_info":{"fields_required":["loan_start", "loan_end","name", "barcode","module", "state", "product", "site", "user", "department", "used_by_asset"],"search_criteria":{"field":"barcode","condition":"is","value":asset}}};//NO I18N
			input_data = 'input_data='+encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(param) : JSON.stringify(param) );//NO I18N
			urlData = '/api/v3/asset_assets';//No I18N
		}
		else
		{
                urlData = "/api/v3/asset_assets/"+encodeHTMLAttribute(asset);//No I18N
		}
		sdpAjax({
			url: urlData,
			acceptODCompatible: true,
			data: input_data,
			async: false,
			dataType: 'json',//NO I18N
			success: function( data ) 
			{
				assetJSON = data;
			}
		});
		
		if(assetJSON != null)
		{
			if(isBarcode && assetJSON.asset_assets.length == 1)
			{
				assetJSON = assetJSON.asset_assets[0];
			}
			else
			{
				assetJSON = assetJSON.asset_asset;
			}
		}
	}
	return assetJSON;
}
function getUserDetails(userId)
{
	var userJSON = {};
	var urlData = "api/v3/users/"+userId;//No I18N
	sdpAjax({
		url: urlData,
		acceptODCompatible: true,
		async: false,
		dataType: 'json',//NO I18N
		success: function( data ) 
		{
			userJSON = data.user;
		}
	});
	return userJSON;
}
function getLoanDetails(loanId)
{
	var loanJSON = {};
	var urlData = "api/v3/asset_loans/"+loanId;//No I18N
	sdpAjax({
		url: urlData,
		acceptODCompatible: true,
		async: false,
		dataType: 'json',//NO I18N
		success: function( data ) 
		{
			loanJSON = data.asset_loan;
		}
	});
	return loanJSON;
}
function getLoanHistory(loanId, index)
{
	var loanJSON = [];
	var urlData = 'api/v3/asset_loans/'+loanId+'/history';//No I18N
	var input_data = 'input_data={"list_info":{"row_count":"100","sort_field":"time","sort_order":"desc","get_total_count":"true","start_index":'+index+'}}';//No I18N
	sdpAjax({
		url: urlData,
		data: encodeURI(input_data),
		acceptODCompatible: true,
		async: false,
		dataType: 'json',//NO I18N
		success: function( data ) 
		{
			var resultJSON = data.history;
			if(data.list_info.has_more_rows)
			{
				var moreHistory = getLoanHistory(loanId, data.list_info.row_count+1);
				resultJSON = resultJSON.concat(moreHistory);
			}
			loanJSON = resultJSON;
		}
	});
	return loanJSON;
}

function updateAssetDetails(Object, valueTxt, isBarcode, isNewLoan)
{
	if(valueTxt != "")
	{
		var assetJSON = getAssetDetails(valueTxt, isBarcode, isNewLoan);
		if(!jQuery.isEmptyObject(assetJSON) && checkValidAsset(assetJSON,isBarcode))
		{
			if(isNewLoan)
			{
				renderAssetData(assetJSON, isBarcode);
			}
			else
			{
				renderReturnAssetData(assetJSON, isBarcode)
			}
		}
		else
		{
			jQuery(Object).val("").trigger('focus');//NO I18N
			jQuery("#s2id_scannedBarcodes ul li:nth-last-child(2)").addClass("hide");
			showBaloonToolTip('scannedBarcodes', getMessageForKey('sdp.asset.loan.validate.barcode.noAsset')); //NO I18N
		}
	}
	showHideOfMsg();
}
function checkValidAsset(assetJSON,isBarcode){
	if(isMSP && jQuery('#assetAccountDiv').is(":visible") && isBarcode){
		var accId=jQuery("#assetaccount").val();
		var assetSite=assetJSON.site.id;
		var assetAccId=siteAccountModel[assetSite];
		if(accId==assetAccId){
			return true;
		}else{
			return false;
		}
	}else{
		return true;
	}
}
function updateUserDetails(id)
{
	var value = jQuery(id).val();
	if(value != undefined && value != "")
	{
		var valueTxt =  value.replace(/<([^ ])/g, '< $1').trim();
		var userJSON = null;
		if(valueTxt != 0)
		{
			userJSON = getUserDetails(valueTxt);
		}
		renderUserData(userJSON);
	}
}
function renderUserData(userJSON)
{
	var empId = '-';
	var dept = '-';
	var site = '-';
	
	userData = {};
	
	jQuery('#reqDetails').show();
	if(userJSON != null)
	{
		empId = (userJSON.employee_id == null || userJSON.employee_id == ""? empId : userJSON.employee_id);
		if(userJSON.department != null)
		{
			dept = userJSON.department.name;
			site = (userJSON.department.site == null ? site : userJSON.department.site.name)
		}
		userData = {"id" : userJSON.id, "name": userJSON.name}//NO I18N
		
		jQuery('#empId').html( encodeHTML(empId) );
		jQuery('#empdept').html( encodeHTML(dept) );
		jQuery('#empsite').html( encodeHTML(site) );
	}
	else
	{
		jQuery('#reqDetails').hide();
	}
}
function renderReturnAssetData(assetJSON, isBarcode)
{
	if(assetJSON != undefined && assetJSON != null)
	{
		var resourceId = assetJSON.id;
		var assetName = assetJSON.name;
		if(isBarcode)
		{
			var isReturned = jQuery.isEmptyObject(assetJSON.loan_end);
			var isDuplicate = false;
			assetArray.forEach(function(obj) {if(obj.id == resourceId){isDuplicate = true;}});
			if(isReturned || isDuplicate)
			{
				if(isReturned)
				{
					showBaloonToolTip('scannedBarcodes', getMessageForKey('sdp.asset.loan.validate.asset.notloaned')); //NO I18N
				}
				else
				{
					showBaloonToolTip('scannedBarcodes', getMessageForKey('ae.barcode.vendor.duplicate')); //NO I18N
				}
				jQuery("#s2id_scannedBarcodes ul li:nth-last-child(2)").addClass("hide");
				return false;
			}
			resourceId = assetJSON.barcode;
		}
		var assetDetailsTxt = '<div id="txt_'+encodeHTML(resourceId)+'" class="asset-detail p10"> <div class="asset-det-count ml15"><b>' + encodeHTML(assetName) + '</b></div>';

		var loanedTo = getMessageForKey("sdp.inventory.resource.state.leased");
		assetDetailsTxt += '<div class="asset-det-count ml15"><p><span class="text-muted">';
		assetDetailsTxt += getMessageForKey("sdp.inventory.resource.state.leased") + " "+ encodeHTML(assetJSON.user.name) + '</span> on '+ assetJSON.loan_start.display_value + '</p>';//No I18N
		
		var start = new Date(assetJSON.loan_end.value);
		var end = new Date();
		var diff = new Date(end - start);
		var delay = Math.floor(diff/1000/60/60/24);
		
		if(delay > 0)
		{
			assetDetailsTxt += '<p class="text-danger">'+ getMessageForKey("sdp.requests.view.delayedby") +' '+ delay +' day(s)</p>';
		}
		assetDetailsTxt += '<p class="pt4">';
		assetDetailsTxt += '<input id=repaired_checkbox_'+encodeHTML(resourceId) +' type="checkbox" style="position:relative" class="mt4 mr8 repairAssets"/><label class="checkbox-inline pl3 pt0" for="repaired_checkbox_'+encodeHTML(resourceId) +'">' + getMessageForKey("sdp.asset.loan.movetorepair") + '</label></p>';
		assetDetailsTxt += '</div></div><div id="border_'+encodeHTML(resourceId) +'" class="divider mt0 mb0 asset-detail"></div>';
		
		assetArray.push(assetJSON);
		
		jQuery('#assetDetails').prepend(assetDetailsTxt);//No I18N
		if(assetArray.length == 1)
		{
			var userJSON = getUserDetails(assetJSON.user.id);
			if(!jQuery.isEmptyObject(userJSON))
			{
				jQuery("#s2id_returnByUser").select2('data', userJSON);//No I18N
				renderUserData(userJSON);
			}
		}
	}
	else
	{
		jQuery("#s2id_scannedBarcodes ul li:nth-last-child(2)").remove();
		showBaloonToolTip('scannedBarcodes', getMessageForKey('sdp.asset.loan.validate.asset.notloaned')); //NO I18N
		return false;
	}
}
function renderAssetData(assetJSON, isBarcode)
{
	var resourceId = assetJSON.id;
	var assetName = assetJSON.name;
	if(assetName != null)
	{
		if(isBarcode)
		{
			var isAssetAvailable = jQuery.isEmptyObject(assetJSON.loan_end) && jQuery.isEmptyObject(assetJSON.loan_start) && jQuery.isEmptyObject(assetJSON.used_by_asset) && jQuery.isEmptyObject(assetJSON.user)  && jQuery.isEmptyObject(assetJSON.department);
			if(isAssetAvailable){
				var state_name = assetJSON.state.name;
				var excludedStates = ["Expired", "Disposed"]; // NO I18N
				if(excludedStates.contains(state_name)){
					isAssetAvailable = false;
				}
			}
			var isDuplicate = false;
			assetArray.forEach(function(obj) {if(obj.id == resourceId){isDuplicate = true;}});
			if(!isAssetAvailable || isDuplicate)
			{
				if(!isAssetAvailable)
				{
					showBaloonToolTip('scannedBarcodes', getMessageForKey('sdp.asset.loan.validate.asset.notReturned')); //NO I18N
				}
				else
				{
					showBaloonToolTip('scannedBarcodes', getMessageForKey('ae.barcode.vendor.duplicate')); //NO I18N
				}
				jQuery("#s2id_scannedBarcodes ul li:nth-last-child(2)").addClass("hide");
				return false;
			}
			resourceId = assetJSON.barcode;
		}
		var productTypeName = assetJSON.module.display_name;
		var productName = assetJSON.product.name;
		var barcodeNameTxt = getMessageForKey("ae.barcode.barcode");
		var site = assetJSON.site == null ? getMessageForKey("sdp.admin.org.technician.organizationdefault") : encodeHTML(assetJSON.site.name);

		var assetDetailsTxt = '<div id="txt_'+encodeHTML(resourceId)+'" class="asset-detail p10"> <div class="asset-det-count ml15"><b>' + encodeHTML(assetName) + '</b></div>';

		var barcode = "-";
		var barcodedetails = assetJSON.barcode;
		if(barcodedetails != null && barcodedetails != undefined)
		{
			barcode = barcodedetails;
		}
		
		assetDetailsTxt += '<div class="asset-det-count ml15">' +'<p>'+ barcodeNameTxt +' : <b>'+ encodeHTML(barcode) +'</b></p>';
		assetDetailsTxt += '<p>'+ encodeHTML(productTypeName) + ", "+ encodeHTML(productName) +'</p>';
		assetDetailsTxt += '<p>'+ site +'</p>';
		assetDetailsTxt += '</div> </div> <div id="border_'+encodeHTML(resourceId)+'" class="divider mt0 mb0 asset-detail"></div>';
		
		assetArray.push(assetJSON);
		
		jQuery('#assetDetails').prepend(assetDetailsTxt);//No I18N
	}
	else
	{
		jQuery("#s2id_scannedBarcodes ul li:nth-last-child(2)").addClass("hide");
		showBaloonToolTip('scannedBarcodes', getMessageForKey('sdp.asset.loan.validate.barcode.noAsset')); //NO I18N
	}
}
function renderLoanData(loanId, hideActions)
{
	var loanJSON = null;
	if(typeof(loanId) == 'string' || typeof(loanId) == 'number')
	{
		loanJSON = getLoanDetails(loanId);
	}
	else
	{
		loanJSON = loanId;
	}
	if(loanJSON != null)
	{
		jQuery(".loan_assets").remove();
		jQuery(".row").remove();
		jQuery("#to span").remove();
		jQuery("#comments span").remove();
		jQuery("#selectAll").prop('checked', false); // no i18n
		
		jQuery("#loanrightdiv").removeClass('hide');
		jQuery("#loanrightdiv").addClass('disp-c');
		
		jQuery("#start_time").html(loanJSON.start_time.display_value);
		jQuery("#to").prepend("<span>"+loanJSON.end_time.display_value+"</span>");//No I18N
		jQuery("#end_time").val(loanJSON.end_time.display_value);
		 jQuery("[sdphrefJs*='js-href-loan-booking-']").off('click').on("click", function () { //No I18N
					 const getId = jQuery(this).attr("data-id");
					 window.open('/ui/assets/bookings?mode=details&entity_id='+Number(getId),"_self","noopener");
				 });
		if(loanJSON.booking != undefined){
            var bookinglink = '<a rel="noopener noreferrer" href="/" data-handler="javascript:window.open(\'/ui/assets/bookings?mode=details&entity_id='+Number(loanJSON.booking.id)+'&\')" data-event="click" nonce="'+sdpNonce+'" sdpJs="js-href-loan-0">'+encodeHTML(loanJSON.booking.display_id)+'</a>';
            jQuery("#booking_id").html(bookinglink);
			parent.$sdEventListener('[sdpJs="js-href-loan-0"]');//NO I18N
			
        }
        else{
            jQuery("#bookingDiv").addClass('hide');
            jQuery("#bookingDiv").removeClass('disp-c');
        }
		let bookingList = document.querySelectorAll("[sdphrefJs*='js-href-loan-booking-']");//No I18N
		bookingList.forEach(function(node){
			node.addEventListener("click", function(event) {
				const getId = node.dataset.id;
				window.open('/ui/assets/bookings?mode=details&entity_id='+Number(getId),"_self","noopener");
			});
		});
		jQuery("#userName").html(encodeHTML(loanJSON.loaned_to.name));
		jQuery("#userName").attr("title", (loanJSON.loaned_to.name));
		jQuery("#userImg").on('click',function(){
			showUserDetails(loanJSON.loaned_to.id,loanJSON.id,loanJSON.key);
		});

		var site = "-";
		if(loanJSON.site != undefined && loanJSON.site.name != undefined)
		{
			site = loanJSON.site.name;
			if(isMSP){
				try{
					site=site+" , "+getAccountName(siteAccountModel[loanJSON.site.id]);
				}catch(ex){}
			}
		}
		jQuery("#site").html(encodeHTML(site));
		jQuery("#technician").html(encodeHTML(loanJSON.created_by.name));
		jQuery("#technician").attr("title", (loanJSON.created_by.name));
		var comments = (loanJSON.comments);
		if(comments == null || ("null" == (comments)) )
		{
			comments = "-";
		}
		jQuery("#comments").prepend("<span>"+ encodeHTML(comments) +"</span>");//No I18N
		if(comments == "-"){ comments = ""; }
		jQuery("#loan_comments").val(comments);
		jQuery("#loanId").val(loanJSON.id);
		jQuery("#emailUser").on("click", function() {
			openLoanNotifyWindow(loanJSON.id,loanJSON.loaned_to.id);
		});
		
		if(loanJSON.extended_to.value != loanJSON.end_time.value)
		{
			jQuery("#extended_to").html(loanJSON.extended_to.display_value);
			jQuery("#extendToDiv").show();
		}
		
		var status = loanJSON.status;
		if("On Loan" == status)
		{
			jQuery("#status").addClass('info');
		}
		else if("Closed" == status)
		{
			jQuery("#status").addClass('success');
			jQuery("#extendLoanBtn").prop("disabled", true); //No I18N
			
			jQuery("#returned_on").html(loanJSON.returned_on.display_value);
			jQuery("#returnedOnDiv").show();
		}
		else
		{
			jQuery("#status").addClass('danger');
			jQuery("#status").addClass('off');
		}
		jQuery("#status").html(encodeHTML(status));
		
		var assetDetails = loanJSON.loaned_assets;
		var assetArray = [];
		jQuery.each(assetDetails, function(i, assetJSON){
			assetArray[i] = assetJSON.id;
		});
		
		assetArray = assetArray.sort(function (a, b) {  return a - b;  });
		for(var i=0; i< assetArray.length; i++)
		{
			var asset = '<tr class="loan_assets" id="loan_asset_'+assetArray[i]+'"></tr>';
			jQuery('#loan-details').append(asset);
		}

		var isTrimText = false;
		jQuery.each(assetDetails, function(i, assetJSON){
			if(assetJSON.is_returned || (!assetJSON.is_returned && loanJSON.extended_to.value != assetJSON.end_time.value)){
				isTrimText = true;
				return false;
			}
		});
		
		var checkedIn = getMessageForKey("sdp.asset.loan.loanedAsset.return");
		var extendedDate = getMessageForKey("sdp.asset.loan.loanedAsset.extend");
		
		jQuery.each(assetDetails, function(i, assetJSON){
			var asset = '<td valign="top" width="30">';
			var is_extended = false;var is_returned = assetJSON.is_returned;
			if((!is_returned) && loanJSON.extended_to.value != assetJSON.end_time.value){
				is_extended = true;
			}
			if(is_returned)
			{
				asset += '<input class="hide" type="checkbox" disabled="true"/>';
			}
			else
			{
				if(!hideActions) {
					if(assetDetails.length == 1) {
						asset += '<input class="assetCheckBox hide" type="checkbox" checked="true" id="checkbox_'+ assetJSON.asset.id +'" name="">';
					} else {
						asset += '<input class="assetCheckBox" type="checkbox" id="checkbox_'+ assetJSON.asset.id +'" name="">';
					}
				}
			}
			var assetName = assetJSON.asset.name;

			asset += '</td><td valign="top" width="40%"><div class="asset-detail pl15"><div title="'+encodeHTML(assetJSON.asset.name)+'" class="asset-det-list text-info">';
 			asset += '<a rel="noopener" href="/" sdphrefJs="js-href-loan-asset-'+assetJSON.asset.id+'" data-id= "'+ assetJSON.asset.id +'" data-api-name= "'+ assetJSON.asset.module.api_plural_name +'" >';
			if((isTrimText) && assetName.length > 30)
			{
				assetName = assetName.slice(0,30)+' ...';
			}
			else if(assetName.length > 50)
			{
				assetName = assetName.slice(0,50)+'...';
			}
			asset +=  encodeHTML(assetName);
			asset += '</a>'
			asset += '</div><div class="asset-det-count"><p><span class="text-muted">';
			asset += '</span>' + encodeHTML(assetJSON.asset.module.display_name);
			asset += '</p></div></div></td><td valign="top">';
			
			if(is_extended)
			{
				asset += '<span class="text-muted">' +extendedDate + ' : </span>' + assetJSON.end_time.display_value + '</td></tr>';
			}
			if(is_returned)
			{
				asset += '<span class="cspr tick-green2 icon-sm mr5"></span><span class="text-success">'+ checkedIn + ' : </span>' + assetJSON.end_time.display_value + '</td>';
			}
			jQuery('#loan_asset_'+assetJSON.id).append(asset);
			let nodesList = document.querySelectorAll("[sdphrefJs*='js-href-loan-asset-']");//No I18N
			nodesList.forEach(function(node){
				node.addEventListener("click", function(event) {
					event.preventDefault();
					assetsObj.loadAssetDetailPopup(node.dataset.id,node.dataset.apiName);
				});
			});
		});
	}
}
function renderLoanHistory(loanId)
{
	var histDetails = getLoanHistory(loanId, 0);
	jQuery('#content-section').empty();
	jQuery.each(histDetails, function(i, histJSON){
		if(histJSON.hasOwnProperty('time'))
		{
			var operation = histJSON.operation;
			var time = new Date(parseInt(histJSON.time.value));
			
			var operation_date = time.toLocaleString('en-US', { day : 'numeric', month : 'short', year : 'numeric'});//NO I18N
			var operation_time = time.toLocaleString('en-US', { hour : 'numeric', minute : 'numeric' });//NO I18N
			
			var trimmed_date = time.toISOString().slice(0,10);
			var isIgnore = false;
			
			var assetNames = ""; var toUser = "";
			var curr_value = ""; var prev_value = ""; var diff_details = "";var fieldname = "";
			
			var historyDiff = histJSON.diff;
			for(var i=0; i< historyDiff.length; i++)
			{
				var diff = historyDiff[i];
				var field = diff.field.name;
				var current_value = diff.current_value;
				var previous_value = diff.previous_value;
				
				if("asset" == (field))
				{
					assetNames += (assetNames != "")?", ":"";//No I18N
					assetNames += current_value;
				}
				else if(("loaned_to") == field)
				{
					toUser = current_value.name;
				}
				else if(("returned_by") == field)
				{
					toUser = current_value.name;
				}
				else if(operation == "Notification" && "is_escalated" == field && (current_value == "false" || current_value == null || current_value == "0"))
				{
					isIgnore = true;
				}
				else if(field == "is_returned")
				{
					fieldname = field;
					operation = "Returned";//NO I18N
				}
				else if(fieldname != "is_returned" && field != "status" && "is_escalated" != field)
				{
					fieldname = field;
					if(current_value != null && current_value != undefined)
					{
						curr_value = current_value;
					}
					if(previous_value != null && previous_value != undefined)
					{
						prev_value = previous_value;
					}
				}
			}

			var comments = histJSON.description;
			if(comments == null || comments == "null" || comments == "")
			{
				comments = "";
			}
			
			var extendToDetails = "";
			if(fieldname == "comments")
			{
				comments = "";
				operation = "Updated";//NO I18N
				
				prev_value = prev_value == "" ? "-": prev_value;
				curr_value = curr_value == "" ? "-": curr_value;
				
				if(assetNames != "")
				{
					extendToDetails = getMessageForKey("sdp.asset.loan.history.asset.comment").replace('{0}', '<b>'+ encodeHTML(assetNames) +'</b>').replace('{1}', '<b>'+ encodeHTML(curr_value) +'</b>');//NO I18N
				}
				else
				{
					extendToDetails = getMessageForKey("sdp.asset.loan.history.comment").replace('{0}', '<b>'+ encodeHTML(prev_value) +'</b>').replace('{1}', '<b>'+ encodeHTML(curr_value) +'</b>');//NO I18N
				}
			}
			else if(fieldname == "extended_to")
			{
				operation = "Extended";//NO I18N

				extendToDetails = getMessageForKey("sdp.asset.loan.history.extendLoan")
				.replace('{0}', '<b>'+ encodeHTML(prev_value.display_value) +'</b>').replace('{1}', '<b>'+ encodeHTML(curr_value.display_value) +'</b>');
			}
			else if(fieldname == "returned_on")
			{
				extendToDetails = getMessageForKey("sdp.reports.surveyDetails.closedOn")+
				"<span class='colon'></span><b>"+ encodeHTML(curr_value.display_value) +"</b></p>";
			}
			else if(fieldname == "end_time" && assetNames != "")
			{
				operation = "Extended";//NO I18N
				
				extendToDetails = getMessageForKey("sdp.asset.loan.history.extendAsset");
				extendToDetails += '</br><b>'+ encodeHTML(assetNames) +'</b> &nbsp;' + getMessageForKey("sdp.common.date.from")+'&nbsp;';//No I18N
				extendToDetails += '<b>'+ encodeHTML(prev_value.display_value) +'</b>&nbsp;' +getMessageForKey("sdp.common.date.to") + '&nbsp;<b>'+ encodeHTML(curr_value.display_value) +'</b>';//No I18N
			}
			else if(assetNames != "")
			{
				var trimmedassetNames = assetNames;
				if(operation == "Created")
				{
					trimmedassetNames = getTrimmedAssetNames(assetNames, 40);
				}
				extendToDetails += "<p>" + getMessageForKey('sdp.header.inventory')+ "<span class='colon'></span><b title='"+encodeHTML(assetNames)+"'>"+ encodeHTML(trimmedassetNames) +"</b></p>";
			}
			diff_details = "<p>" + extendToDetails + "</p>";
			
			if(!isIgnore)
			{
				if(jQuery('#'+trimmed_date).html() == undefined)
				{
					var history ="<div class='accordion-log zcomponents' id='zc-loan-history'><div class='panel-group history-log status-log'><div class='panel'><div class='panel-heading'><div class='panel-title'>";
					
					history +=	operation_date;
					
					history += "<span class='cspr icon-sm circle-arrow-down fr'></span></div></div><div id='date_"+trimmed_date+"'><div class='panel-body' id='"+ trimmed_date +"'></div></div></div></div></div></div>";
					
					jQuery('#content-section').append(history);
					zcomponent.collapsible_init('#zc-loan-history');//NO I18N
				}
				
				//Need to change as histJSON.by.name - framework changes
				var performed_by = histJSON.by.name;
				if(performed_by == undefined)
				{ 
					performed_by = getUserDetails(histJSON.by.id).name;
					if(performed_by == undefined)
					{
						performed_by = getMessageForKey("sdp.reports.customReport.systemuser");
					}
				}
				
				var histDetails = "<div class='row'><div class='history-time'>";
				histDetails += operation_time;
				histDetails +=  "</div><div class='history-status'><span class='disp-t'><span class='disp-c'>";
				
				var operationName = getMessageForKey("sdp.requests.history.updated");
				//Icon class for the history operations
				var historyIcon = "sdp-glyph sdp-glyph-edit2";//No I18N
				if(operation == "Created") { operationName = getMessageForKey("sdp.admin.brule.whentoexec.created"); historyIcon = "list-sprite icon-sm notes-icon2"; }
				else if(operation == "Closed") { operationName = getMessageForKey("sdp.requests.history.closed"); historyIcon = "sdp-glyph sdp-glyph-close"; }
				else if(operation == "Returned") { operationName = getMessageForKey("sdp.asset.loan.operation.returned"); }
				else if(operation == "Extended") { operationName = getMessageForKey("sdp.asset.loan.operation.extended"); }
				else if(operation == "Notification") { operationName = getMessageForKey("sdp.admin.notification.asset.loanExpiry"); historyIcon = "list-sprite icon-sm flag-warning-icon"; comments =""}
				
				histDetails += "<span aria-hidden='true' class='"+historyIcon+"'></span>";
				histDetails += "</span><span class='disp-c vmiddle'><span class='status'>";
				
				histDetails += operationName;
				histDetails += "</span></span></span></div><div class='history-logs'><div class='log-row text-wrap'>";
				histDetails += "<p>" + getMessageForKey('sdp.requests.history.performedby') + "  <b>" + encodeHTML(performed_by) + '</b></p>';

				if(histJSON.integration_key) {
					histDetails += "<p>" + getMessageForKey('sdp.integration.key.history.performed.by', ['<b>' + encodeHTML(histJSON.integration_key.name) + '</b>']) + '</p>';
				}
				if(diff_details != "")
				{
					histDetails += diff_details;
				}
				if(toUser != "")
				{
					histDetails += "<p>";
					if(operation == "Created")
					{
						histDetails += getMessageForKey('sdp.inventory.resource.state.leased');
					}
					else if(operation == "Returned")
					{
						histDetails += getMessageForKey('sdp.asset.loan.returnBy');
					}
					histDetails += "<span class='colon'></span><b>"+ encodeHTML(toUser) +"</b></p>";
				}
				if(comments != "")
				{
					histDetails += "<p>" + getMessageForKey('common.comments')+ "<span class='colon'></span><b>"+ encodeHTML(comments) +"</b></p>";
				}
				histDetails += "</div></div>";
				jQuery('#'+trimmed_date).append(histDetails);
			}
		}
	});
	if(window.innerWidth > 1500)
	{
		jQuery("#loanrightdiv").removeClass('hide');
		jQuery("#loanrightdiv").addClass('disp-c');
	}
	else
	{
		jQuery("#loanrightdiv").addClass('hide');
		jQuery("#loanrightdiv").removeClass('disp-c');
	}
}
function getTrimmedAssetNames(assetNames, size)
{
	var assets = "";
	if(assetNames.length != 0)
	{
		if(typeof(assetNames) == "object")
		{
			for(var i=0; i< assetNames.length; i++)
			{
				var asset = assetNames[i];
				if(assets.length <= size)
				{
					if(assets == "")
					{
						assets = asset;
					}
					else
					{
						assets += ","+ asset;
					}
				}
				else
				{
					break;
				}
			}
		}
		else
		{
			assets = assetNames;
		}
		if(assets.length > (size))
		{
			assets = assets.slice(0, (size))+'...';
		}
	}
	return assets;
}
function showBarcode(show)
{
	if(show)
	{
		jQuery("#barcodesDiv").css({display:""});//No I18N
		jQuery("#selectedAssets").select2("val", "");//No I18N
		jQuery("#assetsDiv").css({display:"none"});//No I18N
		jQuery('#assetDetails').find('.asset-detail').remove();//NO I18N
	}
	else
	{
		jQuery("#assetsDiv").css({display:""});//No I18N
		jQuery("#barcodesDiv").css({display:"none"});//No I18N
		jQuery("#scannedBarcodes").select2("val", "");//No I18N
		jQuery('#assetDetails').find('.asset-detail').remove();//NO I18N
	}
	showHideOfMsg();
	assetArray = [];
}
function deleteAssetDetails(removeId, isBarcode, isNewLoan)
{
	document.getElementById("txt_"+removeId).remove();
	document.getElementById("border_"+removeId).remove();

	assetArray.forEach(function(obj) {
		var matched_column = obj.id;
		if(isBarcode)
		{
			matched_column = obj.barcode;
		}
		if(matched_column == removeId){removeId = obj.id}
	});
	
	var newArray = assetArray.filter(function(asset) { 
		   return asset.id != removeId;
	});
	assetArray = newArray;
	showHideOfMsg();
}
function showHideOfMsg()
{
	if(jQuery('#assetDetails').find('.asset-detail').html() == undefined)
	{
		jQuery('#noAssetMsg').show();
	}
	else
	{
		jQuery('#noAssetMsg').hide();
	}
}

function markAsLoanable(form)
{
	var valid = checkForDelete(form,'checkbox'); //No I18N
	if (!valid)
	{
		showalert('failure', getMessageForKey("sdp.asset.loan.selectAsset.loanable"), 'isAutoHide=false');//NO I18N
		return;
	}
	var resources = [];
	for(var i=0; i<form.elements.length; i++)
	{
		if (form.elements[i].name == 'checkbox') {
			if (form.elements[i].checked) {
				var value = form.elements[i].value;
				if (value != null && value != 'null' && !resources.indexOf(value) > -1 ) {
					resources.push(value);
				}
			}
		}
	}
	if(resources.length > 0){
		
		var saveBtn = jQuery("#saveAssetsBtn");
		inProgressBtn(saveBtn, getMessageForKey("sdp.asset.loan.save.inProgress"), true);
		
		var input_data = 'input_data={"asset_asset":{"is_loanable":true}}&ids='+resources;//No I18N
		sdpAjax({
			async: true,
			url: '/api/v3/asset_assets',//NO I18N
			acceptODCompatible: true,
			type: "PUT",//NO I18N
			data: input_data,
			dataType: 'json',//NO I18N
			success: function( data ) {
				var views = window.opener.ViewNames;
				var viewname = Object.keys(views)[0];
				if(viewname != null)
				{
					window.opener.refreshSubView(getPortalViewName(viewname));
				}
				self.close();
				window.opener.showalert('success', getMessageForKey("sdp.asset.loan.Loanable.success"), 'isAutoHide=true');//NO I18N
			},
			error: function(data)
			{
				inProgressBtn(saveBtn, getMessageForKey("sdp.common.save"), false);
				
				var message =  getMessageForKey("sdp.asset.loan.markLoanable.failure");
				if(data.responseJSON != null && data.responseJSON.response_status.messages[0].message != null)
				{
					message = data.responseJSON.response_status.messages[0].message;
				}
				
				showalert('failure', message, 'isAutoHide=false');//NO I18N
				//closeDialog();
			}
		});
	}
}

function removeResources(form)
{
	var valid = checkForDelete(form,'checkbox'); //No I18N
	if (!valid)
	{
		showalert('failure', getMessageForKey("sdp.asset.loan.selectAsset.remove.loanable"), 'isAutoHide=false');//NO I18N
		return false;
	}
	var resources = [];
	for(var i=0; i<form.elements.length; i++)
	{
		if (form.elements[i].name == 'checkbox') {
			if (form.elements[i].checked) {
				var value = form.elements[i].value;
				if (value != null && value != 'null' && !resources.indexOf(value) > -1 ) {
					resources.push(value);
				}
			}
		}
	}
	if(resources.length > 0){
		var input_data = 'input_data={"asset_asset":{"is_loanable":false}}&ids='+resources;//No I18N
		sdpAjax({
			async: true,
			url: '/api/v3/asset_assets',//NO I18N
			type: "PUT",//NO I18N
			acceptODCompatible: true,
			data: input_data,
			dataType: 'json',//NO I18N
			success: function( data ) {
				showalert('success', getMessageForKey("sdp.asset.loan.Loanable.remove"), 'isAutoHide=true');//NO I18N
				var views = parent.ViewNames;
				var viewname = Object.keys(views)[0];
				if(viewname != null)
				{
					refreshSubView(getPortalViewName(viewName));
				}
			},
			error: function(data)
			{
				var message =  getMessageForKey("sdp.asset.loan.removeLoanable.failure");
				if(data.responseJSON != null && data.responseJSON.response_status.messages[0].message != null)
				{
					message = data.responseJSON.response_status.messages[0].message;
				}
				
				showalert('failure', message, 'isAutoHide=false');//NO I18N
				//closeDialog();
			}
		});
	}
}
function markLoanable()
{
	var width=870;
	if(isMSP){
		width=1075;
	}
	NewWindow('/LoanSelectResources.do','position=relative, closeButton=yes,title='+getMessageForKey("sdp.asset.loan.loanable.mark.title"),width,'513','yes','center');
}
function openLoanNotifyWindow(loanId, loanIds)
{
	NewWindow("Notify.do?notifyModule=Loan&mode=E-Mail&id="+loanId+"&notifyTo=0&loanIds="+loanIds,'notifyowner','900','600','yes','center');//No I18N
}
function getProducts(productType)
{
	if(productType == undefined)
	{
		productType = "0";
	}
	/**Criteria for getting products values based on selected product type */
	const inputData = {start_index:1},
	      getProductTypeVal = jQuery("#productType").select2("data"),// No I18N
	      getProductTypeId = getProductTypeVal && getProductTypeVal.id,
		  getModuleName = getProductTypeVal && getProductTypeVal.api_plural_name;

	/**End */

 	jQuery("#product").sdp_select2({
 	cache:{},
 	default_option : [{"id" : '0', "text" : getMessageForKey("ae.contract.resource.filter.allProducts")}],//NO I18N
 	value: {"id" : '0', "text" : getMessageForKey("ae.contract.resource.filter.allProducts")}, //NO I18N
 	multiple:false,
 	placeholder: getMessageForKey("ae.contract.resource.filter.allProducts"),  // No I18N
 	url:[{
 		url: getModuleName ? "/api/v3/"+getModuleName+"/product": "api/v3/asset_assets/product",//NO I18N
 		field:'product',//NO I18N
		list_info: inputData
 	}],
 	});
}
function emailUsers(form)
{
	if(isMSP && 0==getAccountId()){
		showalert('failure', getMessageForKey("sdp.admin.requesterImportWiz.selectAccountErrMsg"), 'isAutoHide=false');//NO I18N
		return false;
	}
	var valid = checkForDelete(form,'checkbox'); //No I18N
	if (!valid)
	{
		showalert('failure', getMessageForKey("sdp.asset.loan.selectAsset.notify"), 'isAutoHide=false');//NO I18N
		return false;
	}
	var resources = "";var resourcesArray = [];
	for(var i=0; i<form.elements.length; i++)
	{
		if (form.elements[i].name == 'checkbox') {
			if (form.elements[i].checked) {
				var value = form.elements[i].value;
				if (value != null && value != 'null') {
					if(!resourcesArray.contains(value))
					{
						resources = (resources != "")? (resources+","+value): value;
						resourcesArray.push(value);
					}
				}
			}
		}
	}
	openLoanNotifyWindow(0,resources);
}
function editLoanReturn(form)
{
	var selectedAssets = jQuery(form).find('input:checkbox.assetCheckBox:checked').map(function () {return this.id.substring(9);}).get();
	if(selectedAssets == "")
	{
		showalert('failure', getMessageForKey("sdp.asset.loan.selectAsset.return"), 'isAutoHide=true');//NO I18N
		return false;
	}
	showURLInDialog('/loan/ReturnLoan.jsp','position=absmiddle,width=720,modal=yes,title=' + getMessageForKey('sdp.asset.loan.return'));//No I18N
	setTimeout(function(){

		jQuery("#returnLoanId").val(loanId);
		jQuery('#selectedLoanedAssets').val(selectedAssets);
		
		showBarcode(false);
		jQuery("#assetSelect").prop("checked", true); //No I18N

		var selectedResData = [];
		for (var i = 0; i < selectedAssets.length; i++)
		{
			var assetJSON = getAssetDetails(selectedAssets[i], false, false);
			if(!jQuery.isEmptyObject(assetJSON))
			{
				var id = assetJSON.id;
				var name = assetJSON.name;

				var resData = {"id":id, "text":name};//No I18N
				selectedResData.push(resData);
				renderReturnAssetData(assetJSON, false, false);
			}
		}
		showHideOfMsg();
		jQuery("#s2id_selectedAssets").select2('data', selectedResData);//No I18N
		jQuery("#s2id_selectedAssets").select2('focus');//No I18N
	}, 250);
}

function showUserDetails(userId,entityId,key)
{
	var url = '/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&apiModule=asset_loans&apiEntity=loaned_to&apiModuleId='+entityId+'&userId=' + encodeURIComponent(userId) + '&key='+key;	 // No I18N
    showURLInDialog(url + "&" + (new Date()).getTime(),'width=900,height=700, title='+getMessageForKey("sdp.inventory.wsRtPanel.userDetails")); // No I18N
}
function inProgressBtn(element, message, enable)
{
	if(enable)
	{
		element.prop("disabled", true).html('<span class="icon-sm spinner-icon2 mr5"></span>'+message); //No I18N
	}
	else
	{
		element.prop("disabled", false).html(message);//No I18N
	}
}
function convertDateFormat(dateObj){
	var gettweleveFormat = dateObj.getHours();
	if(dateObj.getHours()==00 || dateObj.getHours()==24){
		gettweleveFormat = 12;
	}else if(dateObj.getHours()>12){
		gettweleveFormat = dateObj.getHours() - 12;
	}
	var fomatedDateval = Date.parse(dateObj.toString().replace(dateObj.getHours()+":",gettweleveFormat+":"));
	fomatedDateval = new Date(fomatedDateval);
	return fomatedDateval;
};
function loanFormSubmite(page){
	if(isMSP){
		if(jQuery('#__persistentAccountId__select').val() == "0"){
			alert(getMessageForKey("sdp.msp.selectAccount.error"));
			return false;
		}
	}
	if(page=='ReturnLoan'){
		showURLInDialog('/loan/ReturnLoan.jsp','position=absmiddle,width=720,modal=yes,title=' + getMessageForKey('sdp.asset.loan.return')); //No I18N
	}
	if(page=='NewAssetLoan'){
		showURLInDialog('/loan/NewAssetLoan.jsp','position=absmiddle, width=720,modal=yes,title=' + getMessageForKey('sdp.asset.loan.new')); //No I18N
	}
}
