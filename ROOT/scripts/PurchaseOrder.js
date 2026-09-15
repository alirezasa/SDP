//$Id$
//***********************************************
//	setting purchaseOrder ID for global use
//***********************************************

var poID;
var mode;
var requestOne;
var operationOne;
var requestTwo;
var operationTwo;
var requestThree;
var operationThree;
var isPrompted = false;
var paymentDetID;
var invDetID
var canViewPR = false;

function setPurchaseOrderID(poID, mode) {
	this.poID = poID;
	this.mode = mode;
}

function setSubTotal(sTotal) {
	this.subTotal = sTotal;
}

//***********************************************
//	Adding new site information
//***********************************************
function addNewSite(address) {
	var element = document.getElementById("shippingAddress");
	var x = findPosX(element);
	var y = findPosY(element) - 250;
	var finalX = x + element.offsetWidth - 400;
	showURLInDialog('/purchase/POSiteInput.jsp?address=' + address, 'modal=yes,closeButton=no,position=absmiddle');//No I18N
}

//***********************************************
//	Opening new window for print preview	
//***********************************************
function openPrintPreviewWindow(purchaseOrderID) {
	NewWindowP('/PurchaseOrder.do?module=print_preview&poID=' + purchaseOrderID, '', '800', '550', 'yes', 'center', 'yes', 'yes');//No I18N
}

function getSelectionId(text, li) {
	jQuery('#reqID').val(li.id);
}
//***********************************************
//	Sending mail notification
//***********************************************
function sendPurchaseNotification(changeStatusTo, approvalLevel, isPurchaseApprovalCommentMandatory) {
	if (document.getElementById('enableMailNotify') != undefined && document.getElementById('enableMailNotify').checked == true) {
		if (!validateEMailIDs(document.getElementById('mail_ids'))) {
			return false;
		}

		/*var isAssetBuild = <%=ServiceDeskUtil.getInstance().isAssetBuild()%>;
		if(!isAssetBuild && !checkEmailIdsForValidityInSDP(document.getElementById('mail_ids'))){
			return false;
		}*/
	}
	document.PoStatusChangeForm.approvalLevel.value = approvalLevel;//No I18N
	if (changeStatusTo == "Pending Approval") {
		document.PoStatusChangeForm.module.value = 'sendApprovalNotification';//No I18N
    	document.PoStatusChangeForm.mailIds.value='';//No I18N
	}
	else if (changeStatusTo == "CancelPO") {
		var comments = document.getElementById('description').value;
		if ((comments.trim()).length == 0) {
			alert(getMessageForKey("sdp.purchase.status.comments.alert"));
			return false;
		}
		document.PoStatusChangeForm.module.value = 'cancel_this_po';
	}
	else if (changeStatusTo == "Rejected") {
		var comments = document.getElementById('description').value;

		if ((comments.trim()).length == 0) {
			alert(getMessageForKey("sdp.purchase.status.comments.alert"));
			return false;
		}
		document.PoStatusChangeForm.module.value = 'sendRejectedNotification';//No I18N
	}
	else if (changeStatusTo == "Canceled") {
		var purchaseRequestComments = document.getElementById('description').value;
		if ((purchaseRequestComments.trim()).length == 0) {
			alert(getMessageForKey("sdp.purchase.status.comments.alert"));
			return false;
		}
		document.PoStatusChangeForm.module.value = 'cancelpr';//No I18N
	}
	else if (changeStatusTo == "email_po_to_owner") {
		document.PoStatusChangeForm.module.value = changeStatusTo;
		//this.operationOne = changeStatusTo;
	}
	else if (changeStatusTo == "email_po_to_vendor") {
		document.PoStatusChangeForm.module.value = changeStatusTo;
		//this.operationOne = changeStatusTo;
	}
	else if (changeStatusTo == "Approved") {
		var comments = document.getElementById('description').value;

		if ((comments.trim()).length == 0 && isPurchaseApprovalCommentMandatory) {
			alert(getMessageForKey("sdp.purchase.status.comments.alert"));
			return false;
		}
		document.PoStatusChangeForm.module.value = 'approve';//No I18N
	}
	else if (changeStatusTo == "Ordered") {
		document.PoStatusChangeForm.module.value = 'po_placed_to_vendor';//No I18N
	}
	else if (changeStatusTo == "Closed") {
		document.PoStatusChangeForm.module.value = 'close';//No I18N
	}
	else if (changeStatusTo == "Payment Done") {
		document.PoStatusChangeForm.module.value = 'payment_done';//No I18N
	}
	else if (changeStatusTo == "Invoice Received") {
		document.PoStatusChangeForm.module.value = 'invoice_received';//No I18N
	}

	jQuery('#processing').removeClass('hide');
	jQuery('#notificationButton').addClass('hide');

	document.PoStatusChangeForm.submit();
	//callAjaxThreadOne(this.operationOne);
}

//***********************************************
//	Ajax module controller	
//***********************************************

function callAjaxThreadOne(action) {
	requestOne = false;
	// branch for native XMLHttpRequest object
	if (window.XMLHttpRequest) {
		try {
			requestOne = new XMLHttpRequest();
		}
		catch (e) {
			requestOne = false;
		}
		// branch for IE/Windows ActiveX version
	}
	else if (window.ActiveXObject) {
		try {
			requestOne = new ActiveXObject("Msxml2.XMLHTTP");//No I18N
		}
		catch (e) {
			try {
				requestOne = new ActiveXObject("Microsoft.XMLHTTP");//No I18N
			}
			catch (e) {
				requestOne = false;
			}
		}
	}
	if (requestOne) {

		if (action == 'get_vendor_details') {
			var url = "/PurchaseOrder.do";//No I18N

			var params = "module=" + action + "&vendorid=" + document.getElementById('vendorID').value;//No I18N
			requestOne.open("POST", url, true);//No I18N
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			requestOne.setRequestHeader("Content-length", params.length);//No I18N
			requestOne.onreadystatechange = updateAjaxThreadOne;
			requestOne.send(params);
		}
		else if (action == 'get_shipaddress_details' || action == 'get_billaddress_details') {
			var url = "/PurchaseOrder.do";//No I18N

			var params = "module=get_site_details";//No I18N
			if (action == 'get_shipaddress_details') {
				params += "&siteid=" + Number(document.getElementById('shippingAddress').value);//No I18N
			}
			else {
				params += "&siteid=" + Number(document.getElementById('billingAddress').value);//No I18N
				this.operationOne = 'get_billaddress_details';//No I18N
			}
			requestOne.open("POST", url, true);//No I18N
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			requestOne.setRequestHeader("Content-length", params.length);//No I18N
			requestOne.onreadystatechange = updateAjaxThreadOne;
			requestOne.send(params);
		}
		else if (action == 'editpo') {
			var url = "/PurchaseOrder.do";//No I18N
			var params = "module=editpo&poID=" + poID;//No I18N

			if(isMSP) {
                		params += "&persistentAccountId="+getAccountId()+"&persistAccountID=false";
        		}

			requestOne.open("POST", url, true);//No I18N
			//parent.invokeProgressIndicator('savebutton','Saving information please wait...','progress');
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			requestOne.setRequestHeader("Content-length", params.length);//No I18N
			requestOne.onreadystatechange = updateAjaxThreadOne;
			requestOne.send(params);
		}
		else if (action == 'add_new_po') {
			//new Effect.ScrollTo(document.getElementById('success_message'));

			var url = "/PurchaseOrder.do";//No I18N
			var params = "module=add_new_po";//No I18N
			if (mode == 'edit') {
				params = "module=update_po&po_id=" + poID;//No I18N
			}
			params += "&purchaseOrderID=" + encodeURIComponent(document.getElementById('purchaseOrderID').value);//No I18N
			params += "&purchaseOrderName=" + encodeURIComponent(document.getElementById('purchaseOrderName').value);//No I18N
			params += "&requiredBy=" + encodeURIComponent(document.getElementById('requiredDateID').value);//No I18N
			params += "&createdDate=" + encodeURIComponent(document.getElementById('createdDateID').value);//No I18N
			if (document.getElementById('vendorID') != null) {
				params += "&vendor=" + encodeURIComponent(document.getElementById('vendorID').value);//No I18N
			}else{
				params += "&vendor=" + encodeURIComponent(document.getElementById('vendor').value);//No I18N
			}

			jQuery('#hiddenInputs').find('[name="requestIds"]').each(function () {
				params += "&requestIds=" + this.value;//No I18N
			});

			params += "&shippingAddress=" + encodeURIComponent(document.getElementById('shipaddress').value);//No I18N
			params += "&billingAddress=" + encodeURIComponent(document.getElementById('billaddress').value);//No I18N
			params += "&poCurrencyId=" + encodeURIComponent(document.getElementById('poCurrencyId').value);//No I18N

			//Old chrome version 65.0.3325.181, Base currency exchange Rate will be taken as "".
			var exchangeRate = document.getElementById('exchangeRate').value;
			if (exchangeRate == "" || exchangeRate == undefined ){
			    exchangeRate = "1.0";
			}
			params += "&exchangeRate=" + encodeURIComponent(exchangeRate);//No I18N


			var itemCount = jQuery('#product_table tr.po-new-item-row').length;
			for (j = 0; j < itemCount; j++) {
				var rowId = jQuery('#product_table tr.po-new-item-row:eq(' + j + ')').attr('id');
				var index = rowId.split('_');
				var i = index[1];
				var componentType;
				var component;
				var assetDescription;
				var service;
				var serviceDescription;
				var otherItem;
				var otherDescription;
				var itemCategory = jQuery('#itemCategorySelect_' + i).val();
				if(itemCategory == ''){
					itemCategory = trim(jQuery('#itemCategorySelect_' + i).select2('data').id);
				}
				var itemPartNo;
				var itemQuantity = jQuery('#itemQuantity_' + i).val();//No I18N
				if (itemCategory == 'Assets') {
					componentType = jQuery('#componentTypeSelect_' + i).val();
					component = jQuery('#componentSelect_' + i).val();
					assetDescription = jQuery('#assetTextArea_' + i).val();
					itemPartNo = jQuery('#itemInputPartNo_' + i).val();
				}
				if (itemCategory == 'Services') {
					service = jQuery('#serviceSelect_' + i).val();
					serviceDescription = jQuery('#serviceTextArea_' + i).val();
					itemPartNo = jQuery('#itemInputPartNo_' + i).val();
				}
				if (itemCategory == 'Others') {
					otherItem = jQuery('#otherSelect_' + i).val();
					otherDescription = jQuery('#otherTextArea_' + i).val();
					itemPartNo = jQuery('#itemPartNo_' + i).val();//No I18N
				}
				var itemPrice = jQuery('#itemPrice_' + i).val();
				var itemTaxRate = jQuery('#itemTaxRate_' + i).val();
				var itemAmount = jQuery('#itemAmount_' + i).val();
				params += "&poItems=" + encodeURIComponent(itemCategory) + "_," + componentType + "_," + encodeURIComponent(component) + "_," + encodeURIComponent(assetDescription) + "_," + encodeURIComponent(service) + "_," + encodeURIComponent(serviceDescription) + "_," + encodeURIComponent(otherItem) + "_," + encodeURIComponent(otherDescription) + "_," + encodeURIComponent(itemPartNo) + "_," + itemPrice + "_," + itemTaxRate + "_," + itemQuantity + "_," + itemAmount + "_," + i;//No I18N
			}
			params += "&subTotal=" + document.getElementById('subTotal').value;//No I18N
			params += "&discountvalue=" + document.getElementById('discountvalue').value;//No I18N
			var isDiscountSame = compareDiscount(document.getElementById('subTotal').value, document.getElementById('discount').value, document.getElementById('discountvalue').value);
			if (isDiscountSame) {
				params += "&discount=" + document.getElementById('discount').value;//No I18N
			} else {
				params += "&discount=-1"; //Set discount rate to -1//No I18N
				document.getElementById('discount').value = "";
			}
			params += "&totalitemvalue=" + document.getElementById('totalitemvalue').value;//No I18N
			params += "&shippingcost=" + document.getElementById('shippingcost').value;//No I18N
			params += "&taxratevalue=" + document.getElementById('taxratevalue').value;//No I18N
			params += "&taxrate=" + document.getElementById('taxrate').value;//No I18N
			params += "&salestax=" + document.getElementById('salestax').value;//No I18N
			params += "&addtaxrate=" + document.getElementById('addtaxrate').value;//No I18N
			params += "&priceadjustment=" + document.getElementById('priceadjustment').value;//No I18N
			params += "&totalvalue=" + document.getElementById('totalvalue').value;//No I18N
			if (document.getElementById('attach')) {
				var attach = document.getElementById('attach');
				var attPath = document.getElementById('attPath');
				var attSize = document.getElementById('attSize');
				var att_desc = document.getElementById('att_desc');
				var length = attach.length;
				for (i = 0; i < length; i++) {
					params += "&attach=" + encodeURIComponent(attach[i].value);//No I18N
					params += "&attPath=" + encodeURIComponent(attPath[i].value);//No I18N
					params += "&attSize=" + attSize[i].value;//No I18N
					if (att_desc.length > 0) {
						var attchmentDesc = att_desc[i].value
						attchmentDesc = escape(attchmentDesc);
						params += "&att_desc=" + attchmentDesc;//No I18N
					}
				}
			}

			if (jQuery('#poApprovalEnabled').length == 0 || jQuery('#poApprovalEnabled').is(':checked')) {
				var levelCount = jQuery('#LevelCount').val();
				for (i = 1; i <= levelCount; i++) {
					jQuery('#approver_' + i + ' ' + 'option').each(function (j) {
						params += "&approver_" + i + "=" + document.getElementById('approver_' + i)[j].value;//No I18N
					});
					params += "&approveCondition_" + i + "=" + jQuery('#condition_' + i).val();//No I18N
				}
				if(params.indexOf('&approver_') == -1) {
					params += "&levelCount=0";//No I18N
					params += "&poApprovalEnabled=true";//NO I18N
				}
				else {
				params += "&levelCount=" + levelCount;//No I18N
				params += "&poApprovalEnabled=true";//NO I18N
				}
			}
			else {
				params += "&levelCount=0";//No I18N
				params += "&poApprovalEnabled=true";//NO I18N
			}
			params += "&reqName=" + encodeURIComponent(document.getElementById('requesterName').value);//No I18N
			params += "&reqID=" + encodeURIComponent(document.getElementById('reqID').value);//No I18N
			params += "&costcenter=" + document.getElementById('costcenter').value;//No I18N
			params += "&glcode=" + document.getElementById('glcode').value;//No I18N
			params += "&remarks=" + encodeURIComponent(document.getElementById('remarks').value);//No I18N
			params += "&terms=" + encodeURIComponent(document.getElementById('terms').value);//No I18N
			params += "&signingAuthority=" + encodeURIComponent(document.getElementById('signingAuthority').value);//No I18N

			for (i = 1; i <= 4; i++) {
				var numberAddFields = document.getElementById("long_UDF_LONG" + i);
				if (numberAddFields) {
					params += "&long" + i + "=" + numberAddFields.value;//No I18N
				}
			}
			for (i = 1; i <= 4; i++) {
				var numberAddFields = document.getElementById("date_UDF_DATE" + i);
				if (numberAddFields) {
					params += "&date" + i + "=" + numberAddFields.value;//No I18N
				}
			}
			for (i = 1; i <= 4; i++) {
				var costAddFields = document.getElementById("costUDF_COST" + i);
				if (costAddFields) {
					params += "&cost" + i + "=" + costAddFields.value;//No I18N
				}
			}
			for (i = 1; i <= 12; i++) {
				var numberAddFields = document.getElementById("text_UDF_CHAR" + i);
				if (numberAddFields) {
					params += "&text" + i + "=" + encodeURIComponent(numberAddFields.value);//No I18N
				}
			}
			/*
			 *Below snippet is used to take no. of first level approver.
			 * */
			var approverCountForLevelOne=0;
			for (i = 1; i <= levelCount; i++) {
				if (i == 2) {
					break;
				}
				jQuery('#approver_'+i+' '+'option').each(function(j){
					approverCountForLevelOne++;
				});
			}
			if (document.getElementById('noApproversWithMail').value != '0') {
				if (approverCountForLevelOne != 0 || (approverCountForLevelOne == 1 && jQuery('select#approver_1 > option:eq(0)').val() != jQuery('#poOwnerId').val())) {
					if (confirm(getMessageForKey("sdp.purchase.newpo.sendmail.confirm"))) {
						var isemailconf = document.getElementById('ismailconf').value;
						if (isemailconf != null && isemailconf == "false") {
							alert(getMessageForKey("sdp.puchase.POStatusChange.mailNotif1"))
						}
						else {
							params += "&notifyToApprover=true";//No I18N
						}
					}
				}
			}
			/*
			 *Below Section is used when Owner is the only  first level approver
			 * */
			if (approverCountForLevelOne == 1 && jQuery('select#approver_1 > option:eq(0)').val() == jQuery('#poOwnerId').val()) {
				params += "&ownerAsOnlyApproverForFirstLevel=true";//No I18N
			}

			if(isMSP) {
				params +="&persistentAccountId=" + getAccountId() + "&persistAccountID=false";//No I18N
			}

			requestOne.open("POST", url, true);//No I18N
			//callLoadingIcon('loadmessage', getMessageForKey("sdp.admin.backup.settings.save.progress.msg"));
			callLoadingIcon('addPurchasOrderLoading', document.getElementById('sdp.admin.backup.settings.save.progress.msg').innerHTML);//No I18N
			//parent.invokeProgressIndicator('savebutton',getMessageForKey("sdp.admin.backup.settings.save.progress.msg"),'progress');//No I18N
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			requestOne.setRequestHeader("Content-length", params.length);//No I18N
			requestOne.onreadystatechange = updateAjaxThreadOne;
			requestOne.send(params);

			new Effect.ScrollTo(document.getElementById('saved_msg'));

		}
		else if (action == 'cancel_this_po' || action == 'sendApprovalNotification' || action == 'sendRejectedNotification' || action == 'email_po_to_owner' || action == 'email_po_to_vendor' || action == 'approve') {
			var url = "/PurchaseOrder.do";//No I18N
			var params = "module=" + action;//No I18N

			if (document.getElementById('enableMailNotify') != undefined && document.getElementById('enableMailNotify').checked == true) {
				params += "&mailIds=" + encodeURIComponent(document.getElementById('mailToAddress').value);//No I18N
				params += "&subject=" + encodeURIComponent(document.getElementById('mailSubject').value);//No I18N
			}
			params += "&description=" + encodeURIComponent(document.getElementById('reasonForStatusChange').value);//No I18N
			params += "&poID=" + poID; //No I18N

			callLoadingIcon('NotifyProgress',getMessageForKey("sdp.purchase.newpo.sendmail.sending"));

			requestOne.open("POST", url, true);//No I18N
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			requestOne.setRequestHeader("Content-length", params.length);//No I18N
			requestOne.onreadystatechange = updateAjaxThreadOne;
			requestOne.send(params);
		}
		else if (action == 'show_history') {
			var url = "/PurchaseOrder.do";//No I18N
			var params = "module=" + action + "&poID=" + poID; //No I18N
			//parent.invokeProgressIndicator(null,getMessageForKey("sdp.purchase.progress.indicator.history"),'progress');//No I18N
                        //displayLoadingInformation(null,"Loading PO History",true);
			requestOne.open("POST", url, true);//No I18N
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			requestOne.setRequestHeader("Content-length", params.length);//No I18N
			requestOne.onreadystatechange = updateAjaxThreadOne;
			requestOne.send(params);
		}
		else if (action == 'show_approval_details') {
			if (requestFrom != 'nonLogin') {
                        	var url = "/purchase/ApprovalDetails.jsp?poID="+poID+"&customId="+customId+"&isApprovalCostLimitExceed="+isApprovalCostLimitExceed+"&poStatus="+poStatus+"&requestFrom="+requestFrom+"&mailRecepientId="+mailRecepientId;//No I18N
			}
			else {
				var url = "/purchase/ApprovalDetails.jsp"+location.search+"&customId="+customId+"&isApprovalCostLimitExceed="+isApprovalCostLimitExceed+"&poStatus="+poStatus+"&requestFrom="+requestFrom+"&mailRecepientId="+mailRecepientId;//No I18N

				if (portalId != null && location.search.indexOf('PORTALID') == -1) {
					url += '&PORTALID=' + portalId;//NO I18N
				}
			}

                        var params = "";
                        requestOne.open("GET", url, true);//No I18N
                        requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
                        requestOne.setRequestHeader("Content-length", params.length);//No I18N
                        requestOne.onreadystatechange = updateAjaxThreadOne;
                        requestOne.send(params);
		}
		else if (action == 'show_invoicepayment_listview') {
                        var url = "/purchase/InvoicePaymentListView.jsp?poID="+poID;//No I18N
                        //var url = "/InvoicePayment.cc?poID="+poID;//No I18N
			//document.getElementById('invoiceframe').src =  "/purchase/InvoicePaymentListView.jsp?poID="+poID; 
                        //var url = "/InvoiceListView.cc?poID="+poID;//No I18N
			//alert(url);
                        var params = "";
                        requestOne.open("GET", url, true);//No I18N
                        requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
                        requestOne.setRequestHeader("Content-length", params.length);//No I18N
                        requestOne.onreadystatechange = updateAjaxThreadOne;
                        requestOne.send(params);
		}
		else if (action == 'add_site_details') {
			var url = "/PurchaseOrder.do";//No I18N
			var params = "module=" + action;//No I18N

			params += "&site=" + encodeURIComponent(document.getElementById('popSiteName').value);//No I18N
			params += "&region=" + document.getElementById('popRegion').value;//No I18N
			params += "&door=" + encodeURIComponent(document.getElementById('popDoorNumber').value);//No I18N
			params += "&street=" + encodeURIComponent(document.getElementById('popStreet').value);//No I18N
			params += "&landmark=" + encodeURIComponent(document.getElementById('popLandMark').value);//No I18N
			params += "&city=" + encodeURIComponent(document.getElementById('popCity').value);//No I18N
			params += "&pcode=" + encodeURIComponent(document.getElementById('popPostalCode').value);//No I18N
			params += "&state=" + encodeURIComponent(document.getElementById('popState').value);//No I18N
			params += "&country=" + encodeURIComponent(document.getElementById('popCountry').value);//No I18N

			requestOne.open("POST", url, true);//No I18N
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			requestOne.setRequestHeader("Content-length", params.length);//No I18N
			requestOne.onreadystatechange = updateAjaxThreadOne;
			requestOne.send(params);
		}
		else if (action == 'add_invoice_details' || action == 'update_invoice_details') {
			var url = "/PurchaseOrder.do";//No I18N
			var params = constructParameters(document.InvoiceDetailsForm);
			params += "&poID=" + poID + "&module="+action; //No I18N
			params += "&invoiceDetailsID=" + encodeURIComponent(document.getElementById('invoiceDetailsID').value);//No I18N
			requestOne.open("POST", url, true);//No I18N
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			requestOne.setRequestHeader("Content-length", params.length);//No I18N
			requestOne.onreadystatechange = updateAjaxThreadOne;
			requestOne.send(params);
		}
		else if (action == 'add_payment_details' || action == 'update_payment_details') {
			var url = "/PurchaseOrder.do";//No I18N
			var params = constructParameters(document.PaymentDetailsForm);
			if (document.PaymentDetailsForm.paymentExchangeRate == undefined) {
				params += "&paymentExchangeRate=1";//No I18N
			}
			params += "&poID=" + poID + "&module="+action; //No I18N
			params += "&paymentDetailsID=" + encodeURIComponent(document.getElementById('paymentDetailsID').value);//No I18N
			requestOne.open("POST", url, true);//No I18N
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			requestOne.setRequestHeader("Content-length", params.length);//No I18N
			requestOne.onreadystatechange = updateAjaxThreadOne;
			requestOne.send(params);
		}
		else if (action == 'refresh_action_menu') {
			var millis = new Date();
			var url = "/PurchaseOrder.do";//No I18N
			var params = "module=" + action+"&time="+millis;//No I18N
			params += "&poID=" + poID;//No I18N
			requestOne.open("POST", url, true);//No I18N
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			requestOne.setRequestHeader("Content-length", params.length);//No I18N
			requestOne.onreadystatechange = updateAjaxThreadOne;
			requestOne.send(params);
		}
		else if (action == 'delete_invoice' || action == 'delete_payment') {
			var url = "/PurchaseOrder.do";//No I18N
			var params = "module=" + action;//No I18N
			if (action == 'delete_invoice') {
					params += "&invDetID="+this.invDetID;
			} else {
				params += "&paymentDetID="+this.paymentDetID;
			}
			params += "&poID=" + poID;//No I18N
			requestOne.open("POST", url, true); //No I18N
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			requestOne.setRequestHeader("Content-length", params.length);
			requestOne.onreadystatechange = updateAjaxThreadOne;
			requestOne.send(params);
		}
		if (action == 'refresh_menu') {
			var url = "/PurchaseOrder.do";//No I18N
			var params = "module=" + action;//No I18N
			params += "&poID=" + poID; //No I18N
			requestOne.open("POST", url, true);//No I18N
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
			requestOne.setRequestHeader("Content-length", params.length);//No I18N
			requestOne.onreadystatechange = updateAjaxThreadOne;
			requestOne.send(params);
		}

	}
}
var subTotal = 0;
var total_item = 0;

//***********************************************
//	Updating vendor details	
//***********************************************

function updateVendorDetails(selected_vendor) {
	jQuery('tr#noitemsfound').removeClass("hide");
	jQuery('tr.po-new-item-row').remove();
	clearAllFields();
 	this.operationOne = 'get_vendor_details';//No I18N
	callAjaxThreadOne(this.operationOne);
	addNewPOItemRow();
}

var addressFor = "";
//***********************************************
//	Adding site details
//***********************************************
function addSiteDetails(addressFor) {
	this.addressFor = addressFor;
	var site = document.getElementById('popSiteName');
	var region = document.getElementById('popRegion');
	if (!site || trim(site.value) == '') {
		alert(getMessageForKey("sdp.purchase.newsite.select.errmsg"));
		return false;
	}
	/*if( !region || trim(region.value) == -1 )
	{
		alert(getMessageForKey("sdp.purchase.newpo.region.errmsg"));
		return false;
	}*/
	this.operationOne = 'add_site_details';//No I18N
	callAjaxThreadOne(this.operationOne);
}

var poIDForPO2WO;
var reqPO2WO;
var operationPO2WO = ""; //No I18N
function associateRequests(purchaseOrderID) {
	this.operationPO2WO = "associate_requests";//No I18N
	this.poIDForPO2WO = purchaseOrderID;
	var params = "operation=" + this.operationPO2WO + "&purchaseOrderID=" + purchaseOrderID;//No I18N
	var checkbox = getCheckBoxValues();
	var url = "/WOToPOAssociation.do";//No I18N
	if(checkbox != "")//No I18N
	{
		params = params + checkbox;
	}
	else {
		alert(getMessageForKey("sdp.purchase.wotopo.noreqerrmsg"));//No I18N
		return;
	}
	sendAjaxRequest(url, params);
}

function associatePurchaseRequests(purchaseOrderId) {
	var isSelected = false;
	var params = '&purchaseOrderId=' + purchaseOrderId;//NO I18N

	jQuery("[name='purchaseRequestList']").each(function () {
		if (this.checked) {
			params += '&requestIds=' + this.value;//No I18N
			isSelected = true;
		}
	});

	if (isSelected) {
		jQuery.ajax({type: 'POST', async: false, url: '/PurchaseRequest.do?task=check_for_newly_added_products' + params, data: '',contentType: 'application/json; charset=utf-8', dataType: 'html', success: function(responseText) { if( responseText.startsWith("[") ) {alert(getMessageForKey('sdp.purchase.request.similar.pr.withoutvendor.warn') + '\n' + responseText)} else if( responseText != 'No unknown products' ){ showDialog(responseText, "top=20, left=90,width=750,closeButton=no"); } else { addRequestsToPO(params, purchaseOrderId); } }});//NO I18N
	}
	else {
		alert(getMessageForKey("sdp.purchase.request.choose.prs.toassociate.po"));//NO I18N
	}
}

function addRequestsToPO(params, purchaseOrderId) {
	jQuery.ajax({type: 'POST', url: '/PurchaseRequest.do?task=addRequestsToPO' + params, data: '',contentType: 'application/json; charset=utf-8', dataType: 'text', success: function(responseText) { afterAddingRequestsToPO(responseText, purchaseOrderId); }});//NO I18N
}

function afterAddingRequestsToPO(responseText, purchaseOrderId) {
	if (responseText == 'success') {
		if (window.opener.document.getElementById('assreqTab_content') != null && window.opener.document.getElementById('assreqTab_content').style.display == 'block') {
			jQuery( '#purchaseOrderTab_content' , window.opener.document ).html('');
			jQuery( '#historyTab_content' , window.opener.document ).html('');
			jQuery( "#associatedSrsandPrstoPO" , window.opener.document  ).children().not("poassociatedrequestItem-sample").remove();//NO I18N
	         	window.opener.parent.loadAssociatedSRsandPRsToPurchaseOrder(purchaseOrderId);
		}
		else {
			window.opener.parent.viewPurchaseOrder(purchaseOrderId);
		}
		setTimeout(function() {self.close()}, 500);//NO I18N
	}
	else {
		alert(responseText);
	}
}

function detachPurchaseRequests(purchaseOrderId, PurchaserequestId, detachElement) {
	var isSelected = false;
	var params = '&purchaseOrderId=' + purchaseOrderId+'&requestIds='+PurchaserequestId;//NO I18N
	var multidetach = ( jQuery( detachElement ).attr("prtosrData") == "true" ? true : false );

	jQuery.ajax({
		type: 'POST',//NO I18N 
		url: '/PurchaseRequest.do?task=removeRequestsFromPO' + params,//NO I18N
		data: '',
		contentType: 'application/json; charset=utf-8',//NO I18N
		dataType: 'text',//NO I18N
		success: function (responseText) {
			if (afterRemovingRequestsFromPO(responseText)) {
				disassociateRequestAfterSuccess( "success", PurchaserequestId , "poassociatedpurchaserequest_Item-" , multidetach , "purchaserequest");//NO I18N
				if (jQuery(document.getElementById("associatedSrsandPrstoPO")).children().length == 1) {
					jQuery( document.getElementById( "associatedpurchaseandserviceRequesttoPO" ) ).css({ "display" : "none" });//NO I18N
					jQuery( document.getElementById( "associateprsandsrstopurchaseOrder" ) ).removeAttr("style");//NO I18N
				}
				jQuery( document.getElementById( 'purchaseOrderTab_content' ) ).html('');
				jQuery( document.getElementById( 'historyTab_content' ) ).html('');
			}
		}
	});//NO I18N
}

function afterRemovingRequestsFromPO(responseText) {
	if (responseText != 'success') {
		jQuery('#pr_error_message').html(responseText);//NO I18N
		jQuery('#prErrorRow').show();//NO I18N
		return false;
	}
	return true;
}

function detachRequests(purchaseOrderID, serviceRequestId) {
	this.operationPO2WO = "detach_requests";//No I18N
	this.poIDForPO2WO = purchaseOrderID;
	this.srIDForPO2WO = serviceRequestId;
	var params = "operation=" + this.operationPO2WO + "&purchaseOrderID="+purchaseOrderID+"&checkbox="+serviceRequestId;//No I18N
	var url = "/WOToPOAssociation.do";//No I18N
	sendAjaxRequest(url, params);
}

//This function will take the url and parameters and form the HTTP POST request, send it to the server in async mode
//Make sure that url and params passed in are not null
function sendAjaxRequest(url, params) {
	reqPO2WO = getXMLHttpRequest();
	if (reqPO2WO) {
		reqPO2WO.open("POST", url, true);//No I18N
		reqPO2WO.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");//No I18N
		reqPO2WO.setRequestHeader("Content-length", params.length);//No I18N
		reqPO2WO.onreadystatechange = handleAjaxRequestStateChange;
		reqPO2WO.send(params);
	}
}

function handleAjaxRequestStateChange() {
	if (reqPO2WO.readyState == 4) {
		if (reqPO2WO.status == 200) {
			if("associate_requests" == operationPO2WO)//No I18N
			{
	       			var xmlDoc = reqPO2WO.responseXML.childNodes[0];
				var result = xmlDoc.childNodes[0].childNodes[0].nodeValue;
				if(result == '200')//No I18N
				{
					showMessageAndClose(getMessageForKey("sdp.purchase.wotopo.associate.success"), 1500);//No I18N
					jQuery( '#historyTab_content' , window.opener.document ).html('');
					jQuery( "#associatedSrsandPrstoPO" , window.opener.document  ).children().not("poassociatedrequestItem-sample").remove();//NO I18N
					window.opener.loadAssociatedSRsandPRsToPurchaseOrder( poIDForPO2WO );
				}
				else {
					showFailureMessageAndClose(getMessageForKey("sdp.purchase.wotopo.associate.failure"),1500);//No I18N
				}
				window.setTimeout(function(){window.close()}, 500);
			}
			else if("detach_requests" == operationPO2WO)//No I18N
			{
				var xmlDoc = reqPO2WO.responseXML.childNodes[0];
				var result = xmlDoc.childNodes[0].childNodes[0].nodeValue;
				if(result == '200')//No I18N
				{
					showMessageAndClose(getMessageForKey("sdp.purchase.wotopo.detach.success"), 1500);//No I18N
					disassociateRequestAfterSuccess( "success" , srIDForPO2WO , "poassociatedrequest_Item-" );//NO I18N

					if (jQuery(document.getElementById("associatedSrsandPrstoPO")).children().length == 1) {
						jQuery( document.getElementById( "associatedpurchaseandserviceRequesttoPO" ) ).css({ "display" : "none" });//NO I18N
						jQuery( document.getElementById( "associateprsandsrstopurchaseOrder" ) ).removeAttr("style");//NO I18N
					}
					jQuery( document.getElementById( 'historyTab_content' ) ).html('');
				}
				else {
					showFailureMessageAndClose(getMessageForKey("sdp.purchase.wotopo.detach.failure"),1500);//No I18N
				}
			}
			else if("open_printWO" == operationPO2WO)//No I18N
			{
				document.getElementById('listview_div').style.display = 'none';//No I18N
				document.getElementById('details_div').style.display = 'block';//No I18N
				document.getElementById('details_content').innerHTML = reqPO2WO.responseText;//No I18N
			}
		}
	}
}

function getCheckBoxValues() {
	var checkbox = "";//No I18N
	var inputelmnts = document.getElementsByTagName("input");//No I18N
	for (var i = 0; i < inputelmnts.length; i++) {
		if(inputelmnts[i].name.toLowerCase() == "checkbox")//No I18N
		{
			if (inputelmnts[i].checked == true) {
				checkbox += "&checkbox=" + inputelmnts[i].value;//No I18N
			}
		}
	}
	var hdrChkBox = document.getElementById('checkbox23');//No I18N
	if (hdrChkBox != undefined) {
		hdrChkBox.checked = false;
	}
	return checkbox;
}

function openWOPrintView(woId) {
	jQuery('#associateRequestsList,#associateRequestsMenu,#associateRequestsFooter,#associateRequests_defaultTitle').hide();
	jQuery("#PreviewFrame").attr('src', '/workorder/WOPrintPreview.jsp?isPreview=true&trimmed_details=request_details,requester_details,share_request,history,conversations,resolution,worklog,notes&woID='+woId);
	jQuery('#reqId').html("#"+woId);
	jQuery("#associateRequests_BackButton,#PreviewFrame,#reqId").show();
}

function backToListView() {
	jQuery('#associateRequestsList,#associateRequestsMenu,#associateRequestsFooter,#associateRequests_defaultTitle').show();
	jQuery("#associateRequests_BackButton,#PreviewFrame,#reqId").hide();
}

function showListViewPO() {
	document.getElementById('details_content').innerHTML = '';//No I18N
	document.getElementById('listview_div').style.display = 'block';//No I18N
	document.getElementById('details_div').style.display = 'none';//No I18N
}

function showAssociatedRequests(purchaseOrderID, isServiceCatelogEnabled, canViewPR) {
	this.canViewPR = canViewPR;

	showHide("assreqon", "assreqoff"); //No I18N
	showHide("historyoff","historyon");//No I18N
	if(jQuery('#approvalDetailsOff').val() != undefined && jQuery('#approvalDetailsOff').val() != undefined) //No I18N
	{
		showHide("approvalDetailsOff","approvalDetailsOn");//No I18N
	}
       	showHide("listviewoff","listviewon");//No I18N
        showHide("podetailsoff","podetailson");//No I18N
	var tblObj = document.getElementById('assreqtable'); //No I18N
	var rowCount = 0;

	if (tblObj != undefined) {
		rowCount = (tblObj.getElementsByTagName('tr')).length; //No I18N
	}

	var doFetch = ( isServiceCatelogEnabled || rowCount == 1 );
	document.getElementById('purchaseOrderTab_content').style.display = 'none'//No I18N
	document.getElementById('approvalTab_content').style.display = 'none'//No I18N
	document.getElementById('invoiceAndPaymentTab_content').style.display = 'none'//No I18N
	document.getElementById('historyTab_content').style.display = 'none'//No I18N
	document.getElementById('assreqTab_content').style.display = 'block' //No I18N
	//Setting tab name and its image
        var tabid = document.getElementById("tabdetails"); //No I18N

	if (tabid != undefined) {
		tabid.innerHTML = '<img src="/images/service-request-icon-small.png" valign="top" height="24" border="0" /><strong>' + getMessageForKey("sdp.requests.common.requests") + '</strong>'; //No I18N
	}
}

//***********************************************
//	Opening PO history page
//***********************************************
function openPOHistoryPage(purchaseOrderID) {
        //hideElement("viewPOContent");//No I18N
        //hideElement("po_details");//No I18N
        displayLoadingInformation(null,getMessageForKey("sdp.common.loading"), true, 500);
	showHide("historyon","historyoff");//No I18N
	if (jQuery('#approvalDetailsOff').val() != undefined && jQuery('#approvalDetailsOff').val() != undefined) {
		showHide("approvalDetailsOff","approvalDetailsOn");//No I18N
	}
	if(jQuery('#assreqoff').val() != undefined && jQuery('#assreqon').val() != undefined)//No I18N
	{
		showHide("assreqoff", "assreqon");//No I18N
	}
       	showHide("listviewoff","listviewon");//No I18N
        showHide("podetailsoff","podetailson");//No I18N
	if ((document.getElementById("historyTab_content").innerHTML).trim() == '') {
        	this.poID = purchaseOrderID;
		this.operationOne = 'show_history';//No I18N
		callAjaxThreadOne(this.operationOne);

	}
	else {
		document.getElementById('purchaseOrderTab_content').style.display = 'none'//No I18N
		document.getElementById('approvalTab_content').style.display = 'none'//No I18N
		document.getElementById('invoiceAndPaymentTab_content').style.display = 'none'//No I18N
		document.getElementById('assreqTab_content').style.display = 'none';//No I18N
		document.getElementById('historyTab_content').style.display = 'block'//No I18N
	}
	//Setting tab name and its image
        var tabid=document.getElementById("tabdetails");
	if (tabid != undefined) {
        	tabid.innerHTML = '<img width="20" height="20" src="/images/Resource_Ownership_History.gif"/><strong>'+getMessageForKey("sdp.purchase.history.title")+'</strong>';
	}
}
/*
 *This function is used to show details about PO Approval details under Approval tab of ViewPO page.
 * */
function showApprovalDetails(purchaseOrderID, customId, isApprovalCostLimitExceed, poStatus, requestFrom, mailRecepientId, portalId) {
	displayLoadingInformation(null,getMessageForKey("sdp.common.loading"), true, 500);
	showHide("approvalDetailsOn","approvalDetailsOff");//No I18N
	showHide("podetailsoff","podetailson");//No I18N
	if(jQuery('#assreqoff').val() != undefined && jQuery('#assreqon').val() != undefined)//No I18N
	{
		showHide("assreqoff", "assreqon");//No I18N
	}
	if (requestFrom != 'nonLogin') {
		showHide("listviewoff","listviewon");//No I18N
        	showHide("historyoff","historyon");//No I18N
	}
	if ((document.getElementById("approvalTab_content").innerHTML).trim() == "") {
		this.poID = purchaseOrderID;
		this.customId = encodeURIComponent(customId);
		this.isApprovalCostLimitExceed = isApprovalCostLimitExceed;
		this.poStatus = poStatus;
		this.requestFrom = requestFrom;
		this.mailRecepientId = mailRecepientId;

		if (portalId != null) {
			this.portalId = portalId;
		}
		this.operationOne = 'show_approval_details';//No I18N
		callAjaxThreadOne(this.operationOne);
	}
	else {
		document.getElementById('purchaseOrderTab_content').style.display = 'none'//No I18N
		document.getElementById('approvalTab_content').style.display = 'block'//No I18N
		document.getElementById('invoiceAndPaymentTab_content').style.display = 'none'//No I18N
		document.getElementById('assreqTab_content').style.display = 'none';//No I18N
		document.getElementById('historyTab_content').style.display = 'none'//No I18N
	}
	//Setting tab name and its image
	var tabid=document.getElementById("tabdetails");
	if (tabid != undefined) {
	       	tabid.innerHTML = '<img width="20" height="20" src="/images/user_icon.gif"/><strong>'+getMessageForKey("sdp.header.approvaltabDetails.txt")+'</strong>';
	}
}

function showInvoicePaymentListView(purchaseOrderID) {
        displayLoadingInformation(null,getMessageForKey("sdp.common.loading"), true, 500);
	showHide("listviewon","listviewoff");//No I18N
	if (jQuery('#approvalDetailsOff').val() != undefined && jQuery('#approvalDetailsOff').val() != undefined) {
	    	showHide("approvalDetailsOff","approvalDetailsOn");//No I18N
	}
	showHide("podetailsoff","podetailson");//No I18N
	showHide("historyoff","historyon");//No I18N
	if(jQuery('#assreqoff').val() != undefined && jQuery('#assreqon').val() != undefined)//No I18N
	{
		showHide("assreqoff", "assreqon");//No I18N
	}

	this.poID = purchaseOrderID;
	this.operationOne = 'show_invoicepayment_listview';//No I18N
	callAjaxThreadOne(this.operationOne);

	document.getElementById('purchaseOrderTab_content').style.display = 'none'//No I18N
	document.getElementById('approvalTab_content').style.display = 'none'//No I18N
	document.getElementById('invoiceAndPaymentTab_content').style.display = 'block'//No I18N
	document.getElementById('assreqTab_content').style.display = 'none';//No I18N
	document.getElementById('historyTab_content').style.display = 'none'//No I18N

	//Setting tab name and its image
        var tabid = document.getElementById("tabdetails");
	if (tabid != undefined) {
	        tabid.innerHTML = '<img width="20" height="20" src="/images/user_icon.gif"/><strong>'+getMessageForKey("sdp.header.invoice.details.txt")+'</strong>';
	}
}

function openPOApprovalWindow(pID, custom_id, exceedLimit, approvalLevel, approvalId) {
	if (exceedLimit == 'true') {
		alert(getMessageForKey("sdp.purchase.approver.approvelimit.err.message"));
		return;
	}
	this.poID = pID;
	showURLInDialog('/PurchaseApproval.do?date='+new Date().getMilliseconds() + '&approvalLevel=' + approvalLevel + '&poID=' + pID + '&changeStatusTo=Approved&module=approved&approvalId='+approvalId,'modal=yes,closeButton=no,position=absmiddle');//No I18N
}

function showInvoiceForm(invDetID, module) {
	var millis = new Date();
	var titleMsg = getMessageForKey("sdp.invoice.editdetails.txt");
	if (module == 'add_invoice_details') {
		titleMsg = getMessageForKey("sdp.invoice.adddetails.txt");
	}
	showURLInDialog('/purchase/InvoiceDetails.jsp?'  + 'invoiceDetailsID=' + invDetID + '&module='+module + '&poID='+poID+'&time='+millis+'&pageTiltle='+titleMsg,'modal=yes,closeButton=no,position=absmiddle');//No I18N
}

function validateInvoiceDetails(formObj, moduleName) {
		var isNotify = false;
	var invoiceID = trim(formObj.invoiceid.value);
	if (invoiceID == null || invoiceID == "") {
		alert(getMessageForKey("sdp.inoice.invalid.invoiceid.alert.msg"));
		return false;
	}

	if (document.InvoiceDetailsForm.notifyPaymnt.checked) {
					isNotify = true;
					var paymentDueDate = formObj.paymentDueDate.value;
					var notifyBefore = formObj.notifydays.value;
					var notifyList = formObj.notifyList.value;
	}

	if (isNotify) {
		if (isEmpty(paymentDueDate)) {
						alert(getMessageForKey("sdp.payment.duedate.alert.msg"));
						return false;
					}

		if (isEmpty(notifyList)) {
						alert(getMessageForKey("sdp.paymentdetails.addpayment.jsNotifyUserErr"));
						return false;
					}

		if (isEmpty(notifyBefore)) {
						alert(getMessageForKey("sdp.payment.notifydays.valid.alert.msg"));
						formObj.notifydays.focus();
						return false;
					}

		if (!isPositiveInteger(notifyBefore)) {
						alert(getMessageForKey("sdp.payment.notifydays.valid.alert.msg"));
						formObj.notifydays.focus();
						notifyBefore.focus();
						return false;
					}

		if (notifyBefore == '0') {
						alert(getMessageForKey("sdp.payment.notifydays.valid.alert.msg"));
						formObj.notifydays.focus();
						return false;
					}
					formObj.notifyForPayment.value = "true";
	}
	this.operationOne = moduleName;//No I18N
	callAjaxThreadOne(this.operationOne);
}

function deleteInvoice(invDetID) {
	promptStatus = confirm(getMessageForKey("sdp.invoice.delete.confirm"));
	if (promptStatus) {
					this.invDetID = invDetID;
					this.operationOne = "delete_invoice";//No I18N
					callAjaxThreadOne(this.operationOne);
		}
}

function deletePayment(paymentDetID) {
	promptStatus = confirm(getMessageForKey("sdp.payment.delete.confirm"));
	if (promptStatus) {
					this.paymentDetID = paymentDetID;
					this.operationOne = "delete_payment";//No I18N
					callAjaxThreadOne(this.operationOne);
		}
}

function showPaymentForm(paymentID, module) {
  showURLInDialog('/purchase/POPaymentDetails.jsp?' + 'paymentID=' + paymentID + '&mode=add' + '&module='+module+'&poID='+poID,'modal=yes,closeButton=no,position=absmiddle');//No I18N
}

function validatePaymentDetails(formObj, moduleName) {
	var amountPaid = trim(formObj.payAmount.value);
	var paymentDate = formObj.paymentDate.value;
	var isEscalate = false;
	var totalPrice = trim(formObj.totalPrice.value);
	var payDueDate = formObj.paymentDueDate.value;
	var notifyBefore = formObj.notifydays.value;
	var notifyList = formObj.notifyList.value;

	if (isEmpty(amountPaid)) {
		alert(getMessageForKey("sdp.paymentdetails.addpayment.payamount.error.msg"));
		formObj.payAmount.focus();
		return false;
	}

	if (!isDouble(amountPaid)) {
		alert(getMessageForKey("sdp.paymentdetails.addpayamount.jsErr"));
		formObj.payAmount.focus();
		return false;
	}
	if(amountPaid <= 0){
	    alert(getMessageForKey("sdp.paymentdetails.addpayamount.jsErr"));
        formObj.payAmount.focus();
        return false;
	}
	//Validatin Payment exchange rate.
	if (formObj.paymentExchangeRate != undefined) {
		var exchangeRate = formObj.paymentExchangeRate.value;
		if (exchangeRate == 0 || exchangeRate == 0.0) {
			alert(getMessageForKey("ae.exchangeRate.validation.jserr"));
			jQuery("#exchangeRate").trigger('focus');
			return false;
		}
		var anum=/(^\d+$)|(^\d+\.\d+$)/;
		if (!anum.test(trim(exchangeRate))) {
			alert(getMessageForKey("ae.exchangeRate.validation.jserr"));
			jQuery("#exchangeRate").trigger('focus');
			return false;
		}
	}
	if (isEmpty(paymentDate)) {
		alert(getMessageForKey("ae.purchase.paymentDate.validation"));
		formObj.paymentDate.focus();
		return false;
	}

	amountPaid = parseFloat(amountPaid);
	totalPrice = parseFloat(totalPrice);
	if (amountPaid > totalPrice) {
		alert(getMessageForKey('sdp.paymentdetails.addpayment.payamount.greaterthan.totalprice.msg'));
		formObj.payAmount.focus();
		return false;
	}

	if (document.PaymentDetailsForm.notifyPOPaymnt.checked) {
		isEscalate = true;
	}
	else {
		if (amountPaid < totalPrice) {
			var promptStatus = confirm(getMessageForKey('sdp.paymentdetails.addpayment.noify.prompt.msg'));//No I18N
			if (promptStatus) {
				document.getElementById('payment_notify_div').style.display='block';//No I18N
				document.getElementById('notifyPOPaymnt').checked='true';//No I18N
				return false;
			}
		}
	}
	//validating the escalation and check the mandatory fields, 
	// payDueDate, notifyBefore, userlist
	//check before submitting form need to handle the below cases
	//cases: Escalation enabled and Escalation disabled

	if (isEscalate) {
					//alert("payDueDate:::"+payDueDate + "\n"+ "notifyBefore:::::"+notifyBefore + "\n"+ "notifyList:::::"+notifyList + "\n" + "typeof(notifyList)::"+typeof(notifyList));
					//if(isEmpty(notifyBefore) || !isInteger(amountPaid) || !isPositiveInteger(amountPaid) )
		if (isEmpty(notifyBefore)) {
									alert(getMessageForKey("sdp.contract.addNew.jsNotifyErr"));
									formObj.notifydays.focus();
									return false;
					}

		if (!isPositiveInteger(notifyBefore)) {
									alert(getMessageForKey("sdp.contract.addNew.jsNotifyErr"));
									formObj.notifydays.focus();
									return false;
					}
		if (isEmpty(payDueDate)) {
									alert(getMessageForKey("sdp.paymentdetails.addpayment.jsDueDateErr"));
									formObj.paymentDueDate.focus();
									return false;
					}

		if (isEmpty(notifyList)) {
							alert(getMessageForKey("sdp.paymentdetails.addpayment.jsNotifyUserErr"));
							return false;
					}
				}
	this.operationOne = moduleName;//No I18N
	callAjaxThreadOne(this.operationOne);
}

/**Method  		: toggleNotify 
	Arguments		: FormName, CheckboxID, DivID
	Description	: Getting the checkbox status and toggle the Div 
*/
function toggleNotify(formName, checkboxID, divId) {
  var paydivObj = document.getElementById(divId);
	if (document.forms[formName].elements[checkboxID].checked == true) {
	paydivObj.style.display = 'block';//No I18N
  }
	else {
	paydivObj.style.display = 'none';//No I18N
  }
}

function callLoadingIcon(tdTagId, message) {
	document.getElementById(tdTagId).innerHTML =  '<table width="100%"><tr><td width="20%" align="right"><img src="/images/processing.gif"></td><td align="left">' + message + '</td></tr></table>';
}
function openPOApprovalSubmitWindow(purchaseId, custom_id, approvalLevel) {
	var millis = new Date();
	showURLInDialog('/PurchaseApproval.do?date='+new Date().getMilliseconds() + '&approvalLevel=' + approvalLevel + '&poID=' + purchaseId + '&changeStatusTo=Pending Approval&module=get&time='+millis,'modal=yes,closeButton=no,position=absmiddle');//No I18N
}
function openPOCancelWindow(purchaseId, custom_id) {
	showURLInDialog('/PurchaseApproval.do?date='+new Date().getMilliseconds() + '&poID=' + purchaseId + '&changeStatusTo=CancelPO&module=get','modal=yes,closeButton=no,position=absmiddle');//No I18N
}

function openPORejectWindow(pID, custom_id, exceedLimit, approvalLevel, approvalId) {
	if (exceedLimit == 'true') {
		alert(getMessageForKey("sdp.purchase.approver.approvelimit.err.message"));
		return;
	}
	this.poID = pID;
	showURLInDialog('/PurchaseApproval.do?poID=' + pID + '&changeStatusTo=Rejected&module=approved' + '&approvalLevel=' + approvalLevel+"&approvalId="+approvalId,'modal=yes,closeButton=no,position=absmiddle');//No I18N
}

function openPOStatusChangeWindow(pID, custom_id, poStatus, titleMsg) {
  this.poID = pID;
  showURLInDialog('/PurchaseApproval.do?poID=' + pID + '&changeStatusTo='+poStatus+'&module=get','modal=yes,closeButton=no,position=absmiddle');//No I18N
}

function updateShipAddressDetails() {
	if (document.getElementById("shippingAddress").value == -1) {
		document.getElementById("shipaddress").value=" ";
	}
	else {
	this.operationOne = 'get_shipaddress_details';//No I18N
	callAjaxThreadOne(this.operationOne);
	}
}
function updateBillAddressDetails() {
	if (document.getElementById("billingAddress").value == -1) {
		document.getElementById("billaddress").value=" ";
	}
	else {

	this.operationOne = 'get_billaddress_details';//No I18N
	callAjaxThreadOne(this.operationOne);
	}
}
function associateVendorProduct(response) {
    var cost = trimAll(document.ProductDefForm.price.value);
    var taxrate = trimAll(document.ProductDefForm.taxRate.value);
    data = {
       "product_vendor_association": {  //No I18N
           "product": {"id": response.product.id},  //No I18N
           "vendor": {"id": jQuery("#vendorID").val() ? jQuery("#vendorID").val() : jQuery("#vendor").val()},  //No I18N
           "product_price": cost || 0,  //No I18N
           "tax_rate": taxrate || 0  //No I18N
       }
   };
   sdpAjax({
       url: "/api/v3/product_vendor_associations",//NO I18N
       type: "post", // No I18N
       data: sdpAjaxInputData(data),
       success: function (response1) {
            var index = jQuery('#index').val();
            var componentData = {};
            componentData.id = response.product.name;
            componentData.text = response.product.name;
            jQuery('#componentSelect_' + index).select2('data', componentData);//No I18N
            if (jQuery("input[name='partNo']").val() != '') {
                jQuery('#itemInputPartNo_' + index).val(jQuery("input[name='partNo']").val());
            }
            else {
                jQuery('#itemInputPartNo_' + index).val('');
            }
            if (jQuery("input[name='price']").val() != '') {
                jQuery('#itemPrice_' + index).val(parseFloat(jQuery("input[name='price']").val()).toFixed(2));
            }
            if (jQuery("input[name='taxRate']").val() != '') {
                jQuery('#itemTaxRate_' + index).val(jQuery("input[name='taxRate']").val());
            }
            else {
                jQuery('#itemTaxRate_' + index).val('0.00');
            }
            parent.closeDialog();
            showalert("success", translate("sdp.admin.common.addedsuccessfully"), "isAutoHide=true"); // No I18N
            calculate(jQuery('#itemAmount_' + index));
       },
   });
}
function addNewProductApi() {
    var cost = trimAll(document.ProductDefForm.price.value);
    var part_no = trimAll(document.ProductDefForm.partNo.value);

    data = {
        "product":  { // No I18N
            "name": jQuery("#componentName").val(),// No I18N
            "all_product_type": { "id": jQuery('#componentType').val() }, // No I18N
            "cost": cost || 0,  // No I18N
            "part_no": part_no // No I18N
        }
    };
    if(document.ProductDefForm.isSoftwareSelected.value == "true"){ 
        data["product"]["software"]={"id":jQuery("#softwareList option:selected").val() ,"name":jQuery("#softwareList option:selected").text().trim()}; // No I18N
    }
    sdpAjax({
        url: "/api/v3/products",//NO I18N
        type: "post", // No I18N
        data: sdpAjaxInputData(data),
        success: function (response) {
            associateVendorProduct(response);
        },
        error:function(response){
            if(response.responseJSON.response_status.messages[0].field === 'software'){
                showalert('failure', ZSEC.Encoder.encodeForHTML(translate("sdp.purchase.newproduct.software.errmsg")),'isAutoHide=false,delay=3');// NO I18N
            }
            else if(response.responseJSON.response_status.messages[0].field === 'name'){
                showalert('failure', ZSEC.Encoder.encodeForHTML(translate("sdp.admin.product.addproduct.samename")),'isAutoHide=false,delay=3');// NO I18N
            }
            else {
                showalert('failure', ZSEC.Encoder.encodeForHTML(translate("sdp.purchase.addpo.errorunabletoadditem")),'isAutoHide=false,delay=3');// NO I18N
            }
        }
    });
}
function getValue(form) {
	var len = form.options.length;
	for (i = 0; i < len; i++) {
		if (form.options[i].selected == true) {
			if (form.options[i].value == -1) {
				return '';
			}
			return form.options[i].innerHTML;
		}
	}
}
function updateRequester() {
	if (isValidPOData(document.getElementById('requesterName'), '', 'text', getMessageForKey("sdp.purchase.update.requester.errmsg")) == false) {
		return false;
	}
	return true;
}
function updatePOName() {
	if (isValidPOData(document.getElementById('purchaseOrderName'), '', 'text', getMessageForKey("sdp.purchase.update.poname.errmsg")) == false) {
		return false;
	}
	return true;
}
function isValidPOData(control, comparevalue, datatype, errorMsg, onErrVal) {
	var isvalid = true;
	if (trim(control.value) == comparevalue) {
		isvalid = false;
	}
	if (datatype == 'integer') {
		isvalid = isInteger(trim(control.value));
	}
	else if (datatype == 'pinteger') {
		isvalid = isPositiveInteger(trim(control.value));
	}
	else if (datatype == 'double') {
		isvalid = isDouble(trim(control.value));
	}
	if (isvalid == false) {
		alert(errorMsg);
		if (onErrVal != null) {
			control.value=onErrVal;
		}
		control.focus();
		//if( control.id != undefined && control.id != '' )
		//{
		//	new Effect.ScrollTo(control.id);
		//}
	}
	return isvalid;
}
function updateNewRowEffect(trId) {
	var elem = document.getElementById(trId);
	var children = elem.rows;
	var node = children.item(children.length-1);
	for (var j = 0; j < node.childNodes.length; j++) {
		if (node.childNodes.item(j).nodeType == 1) {
			new Effect.Highlight(node.childNodes.item(j), { startcolor: "#00FF00" });//No I18N
		}
	}
}
function updateAjaxThreadOne() {
	// only if req shows "loaded"
	if (requestOne.readyState == 4) {
		// only if "OK"
		if (requestOne.status == 200) {
			if (operationOne == 'get_vendor_details') {
				parent.closeDialog();
				var responseJSON = JSON.parse(requestOne.responseText);
				var status = responseJSON.status;
				if (status == '200') {
					document.getElementById('vaddress').innerHTML = ZSEC.Encoder.encodeForHTML(responseJSON.address).replace(/&#x23;&#x23;/g, '<br>');
					document.getElementById('vphone').innerHTML = ZSEC.Encoder.encodeForHTML(responseJSON.phone);
					document.getElementById('vfax').innerHTML = ZSEC.Encoder.encodeForHTML(responseJSON.fax);
					document.getElementById('vcontact').innerHTML = ZSEC.Encoder.encodeForHTML(responseJSON.CONTACT_PERSON);
					document.getElementById('vemailid').innerHTML = ZSEC.Encoder.encodeForHTML(responseJSON.Email);

					getVendorCurrency(document.getElementById('vendorID').value, "get_vendor_details");// no i18n
				}
				else {
					parent.showFailureMessageAndClose(getMessageForKey("sdp.purchase.newpo.vendor.errmsg"),1500);
				}
			}
			else if (operationOne == 'cancel_this_po' || operationOne == 'sendApprovalNotification' || operationOne == 'sendRejectedNotification' || operationOne == 'approve') {
				var xmlDoc = requestOne.responseXML.childNodes[0];
				var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;
				if (status == '200') {
					if (document.getElementById('statusText') != null) {
						document.getElementById('statusText').innerHTML = xmlDoc.childNodes[1].childNodes[0].nodeValue;
					}
					parent.closeDialog();
					refreshMenu();

				}
				else {
					document.getElementById('newpo_error_message').innerHTML=xmlDoc.childNodes[1].childNodes[0].nodeValue;
					document.getElementById('newpo_error_div').style.display = 'block'//No I18N
					//parent.showFailureMessageAndClose(xmlDoc.childNodes[1].childNodes[0].nodeValue,1500);
				}
			}
			else if (operationOne == 'show_history') {
				document.getElementById('historyTab_content').innerHTML = requestOne.responseText;
				document.getElementById('purchaseOrderTab_content').style.display = 'none'//No I18N
				document.getElementById('approvalTab_content').style.display = 'none'//No I18N
				document.getElementById('invoiceAndPaymentTab_content').style.display = 'none'//No I18N
				document.getElementById('assreqTab_content').style.display = 'none';//No I18N
				document.getElementById('historyTab_content').style.display = 'block'//No I18N
			}
			else if (operationOne == 'show_approval_details') {
				document.getElementById('purchaseOrderTab_content').style.display = 'none'//No I18N
				document.getElementById('approvalTab_content').style.display = 'block'//No I18N
				document.getElementById('invoiceAndPaymentTab_content').style.display = 'none'//No I18N
				document.getElementById('historyTab_content').style.display = 'none'//No I18N
				document.getElementById('assreqTab_content').style.display = 'none';//No I18N
				document.getElementById('approvalTab_content').innerHTML = requestOne.responseText;
				var appDiv = document.getElementById('approvalTab_content');
				var scripts = appDiv.getElementsByTagName("script");
				for (var i = 0; i < scripts.length; i++) {
					var parentScript = scripts[i];
					try {
						var newScript = document.createElement('script');
						if (parentScript.src) {
							newScript.src = parentScript.src;
						}
						if (parentScript.innerHTML) {
							newScript.innerHTML = parentScript.innerHTML;
						}
						newScript.nonce = sdpNonce;
						document.getElementsByTagName("head")[0].appendChild(newScript);
					}
					catch (e) {

					}
				}
			}
			else if (operationOne == 'show_invoicepayment_listview') {
				document.getElementById('invoiceAndPaymentTab_content').innerHTML = requestOne.responseText;
				document.getElementById('purchaseOrderTab_content').style.display = 'none'//No I18N
				document.getElementById('approvalTab_content').style.display = 'none'//No I18N
				document.getElementById('assreqTab_content').style.display = 'none';//No I18N
				document.getElementById('invoiceAndPaymentTab_content').style.display = 'block'//No I18N
				document.getElementById('historyTab_content').style.display = 'none'//No I18N
				var poId = new URLSearchParams(window.location.search).get('poID');
				var currentTime = new Date().getTime();
				var invoiceList1 = document.querySelectorAll('[sdphrefJs="js-href-InvoicePaymentListView-0"]'); //No I18N
				invoiceList1.forEach(list => {
					list.addEventListener('click', function(event) {
					event.preventDefault();
					var invoiceId = parseInt(list.id.split('Invoice_Edit_')[1]);
					showURLInDialog('/purchase/InvoiceDetails.jsp?module=update_invoice_details&time='+parseInt(currentTime)+'&invoiceDetailsID='+invoiceId+'&poID='+poId+'&pageTiltle='+getMessageForKey("sdp.invoice.editdetails.txt")+'','modal=yes,closeButton=no,width=480');
					});
				});
				var invoiceList2 = document.querySelectorAll('[sdphrefJs="js-href-InvoicePaymentListView-1"]'); //No I18N
				invoiceList2.forEach(list => {
					list.addEventListener('click', function(event) {
					event.preventDefault();
					var invoiceId = list.id.split('Invoice_Delete_')[1];
					deleteInvoice(invoiceId);
					});
				});
				var paymentList1 = document.querySelectorAll('[sdphrefJs="js-href-InvoicePaymentListView-2"]'); //No I18N
				paymentList1.forEach(list => {
					list.addEventListener('click', function(event) {
					event.preventDefault();
					var paymentId = parseInt(list.id.split('Payment_Edit_')[1]);
					showURLInDialog('/purchase/POPaymentDetails.jsp?module=update_payment_details&mode=add&time='+parseInt(currentTime)+'&paymentID='+paymentId+'&poID='+poId+'','modal=yes,closeButton=no,width=500'); //No I18N
					});
				});
				var paymentList2 = document.querySelectorAll('[sdphrefJs="js-href-InvoicePaymentListView-3"]'); //No I18N
				paymentList2.forEach(list => {
					list.addEventListener('click', function(event) {
					event.preventDefault();
					var paymentId = list.id.split('Payment_Delete_')[1];
					deletePayment(paymentId);
					});
				});
			}
			else if (operationOne == 'email_po_to_owner') {
				var xmlDoc = requestOne.responseXML.childNodes[0];
				var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;
				if (status == '200') {
					parent.closeDialog();
				}
				else {
					parent.showFailureMessageAndClose(getMessageForKey("sdp.purchase.newpo.emailowner.errmsg"),1500);
				}
			}
			else if (operationOne == 'email_po_to_vendor') {
				var xmlDoc = requestOne.responseXML.childNodes[0];
				var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;
				if (status == '200') {
					parent.closeDialog();
				}
				else {
					parent.showFailureMessageAndClose(getMessageForKey("sdp.purchase.newpo.emailvendor.errmsg"),1500);
				}
			}
			else if (operationOne == 'get_shipaddress_details') {
				parent.closeDialog();
				var responseJSON = JSON.parse(requestOne.responseText);
				var status = responseJSON.status;
				if (status == '200') {
				     if(!isMSP){
					document.PurchaseOrderForm.shipaddress.value = (responseJSON.address).replace(/##/g, "\n");//NO I18N
				     }else{
					    document.PurchaseOrderForm.shipaddress.value = (responseJSON.address).replace(/##/g, "\n") + '\n' +(responseJSON.name).replace(/##/g, "\n");//No I18N
					 }

				}
				else {
					parent.showFailureMessageAndClose(getMessageForKey("sdp.purchase.newpo.address.errmsg"),1500);
				}
			}
			else if (operationOne == 'get_billaddress_details') {
				parent.closeDialog();
				var responseJSON = JSON.parse(requestOne.responseText);
                var status = responseJSON.status;
				if (status == '200') {
				     if(!isMSP){
					document.PurchaseOrderForm.billaddress.value = (responseJSON.address).replace(/##/g, "\n");//NO I18N
				     }else{
					    document.PurchaseOrderForm.billaddress.value = (responseJSON.address).replace(/##/g, "\n") + '\n' +(responseJSON.name).replace(/##/g, "\n");//NO I18N
					 }
				}
				else {
					parent.showFailureMessageAndClose(getMessageForKey("sdp.purchase.newpo.address.errmsg"),1500);
				}
			}
			else if (operationOne == 'delete_invoice' || operationOne == 'delete_payment') {
				var xmlDoc = requestOne.responseXML.childNodes[0];
				var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;
				if (status == '200') {
					showInvoicePaymentListView(poID);
				}
				else {
					var message = xmlDoc.childNodes[1].childNodes[0].nodeValue;
					parent.showFailureMessageAndClose(message,25000);
				}
			}
			else if (operationOne == 'add_new_po' || operationOne == 'editpo') {
				window.scrollTo(0,0);
				var resXml = requestOne.responseXML;
				var isError = 'false';//No I18N
				if (resXml != null) {
					var xmlDoc = resXml.childNodes[0];
					if (xmlDoc != null) {
						var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;
						if(status!=null && status == '500' )	//Errored case
						{
							isError = 'true';//No I18N
							hideElement('loadmessage');//No I18N
							hideElement('addPurchasOrderLoading');//NO I18N
							var message = xmlDoc.childNodes[1].childNodes[0].nodeValue.replace('Error:','');
							message = encodeHTML(message);
							alert( message );
							//parent.invokeProgressIndicator('requesterName', message, "completed", '/images/invalidoperationicon.gif');//No I18N
							showBaloonToolTip( 'requesterName', message );//NO I18N
							setTimeout(function(){closeDialog();}, 3000);
							//parent.showFailureMessageAndClose(message,1500);
							document.getElementById('requesterName').value='';
							document.getElementById('requesterName').focus();
						}
						else if(status!=null && status == '501' )	//Errored case
						{
							isError = 'true';//No I18N
							hideElement('loadmessage');//No I18N
							var message = xmlDoc.childNodes[1].childNodes[0].nodeValue;
							document.getElementById('newpo_error_message').innerHTML=encodeHTML(message);
							document.getElementById('newpo_error_div').style.display = 'block'//No I18N
							jQuery("td#addPurchasOrderLoading").find("table").remove();
							setTimeout(function(){closeDialog();}, 5000);
						}
						else if (status != null && status == '200') {
							var operation = xmlDoc.childNodes[1].childNodes[0].nodeValue;
							var purchaseOrderId = xmlDoc.childNodes[2].childNodes[0].nodeValue;
							if (document.getElementById('poSectionLoad')) {
								document.location ="/PurchaseOrder.do?module=view&sectionLoad=false&poID="+purchaseOrderId+"&PORTALID="+PORTALID;
							}

							//document.location = "/PurchaseOrder.do?module=view&poID="+xmlDoc.childNodes[2].childNodes[0].nodeValue+"&operation="+operation;

							if (operation == 'Canceled') {
							   var message = xmlDoc.childNodes[3].childNodes[0].nodeValue;
							   alert(message);
							   //viewPurchaseOrder(purchaseOrderId, operation, true);
							}
							else if (operation != 'update') {
								viewPurchaseOrder(purchaseOrderId, operation, true);
							}
							else {
								if (jQuery('#item-' + purchaseOrderId).length > 0) {
									viewPurchaseOrder(purchaseOrderId, operation, true );
								}
								else {
									viewPurchaseOrder(purchaseOrderId, operation, false );
								}
							}

							return;
						}
					}
				}
				if (isError == 'false') {
					itemsAdded = new Array();
                    var postartObj = document.getElementById('po_start');

					if (postartObj != undefined && postartObj != null) {
						postartObj.innerHTML = requestOne.responseText;
						var scriptObjs = postartObj.getElementsByTagName("script");
						for (var k = 0; k < scriptObjs.length; k++) {
							var parentScript = scriptObjs[k];
							try {
								var newScript = document.createElement('script');
								if (parentScript.src) {
									newScript.src = parentScript.src;
								}
								if (parentScript.innerHTML) {
									newScript.innerHTML = parentScript.innerHTML;
								}
								newScript.nonce = sdpNonce;
								document.getElementsByTagName("head")[0].appendChild(newScript);
							}
							catch (e) {

							}
						}
					}
                                        parent.startList();
                                        setTimeout(function(){closeDialog();});
                                        applyBrowserTitle();
					//prePopulateRequestedItems();
				}
			}
			else if (operationOne == 'add_site_details') {
				var xmlDoc = requestOne.responseXML.childNodes[0];
				var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;
				if (status == '200') {
					var org_id = xmlDoc.childNodes[1].childNodes[0].nodeValue;

					var bsite = document.getElementById("billingAddress");
					if(bsite.options) {
						bsite.options[bsite.options.length] = new Option(document.getElementById('popSiteName').value, org_id);
					}
					ssite = document.getElementById("shippingAddress");
					if(ssite.options) {
						ssite.options[ssite.options.length] = new Option(document.getElementById('popSiteName').value, org_id);
					}

					if (addressFor == 'Shipping Address' || addressFor == 'Shipping') {
						ssite.value = org_id;
						if(!ssite.options) {
							document.getElementById("shippingAddress_siteSearch").value= document.getElementById('popSiteName').value;
						}
						updateShipAddressDetails();
					}
					else {
						bsite.value = org_id;
						if(!bsite.options) {
							document.getElementById("billingAddress_siteSearch").value= document.getElementById('popSiteName').value;
						}
						updateBillAddressDetails();
					}

					parent.closeDialog();
				}
				else {
					var message = xmlDoc.childNodes[1].childNodes[0].nodeValue;
					alert(message);
				}
			}
			else if (operationOne == 'add_invoice_details') {
				var xmlDoc = requestOne.responseXML.childNodes[0];
				var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;
				if (status == '200') {
					parent.closeDialog();
					refreshMenu();
				}
				else {
					parent.showFailureMessageAndClose(getMessageForKey("sdp.invioce.add.error.msg"),1500);
				}
				showInvoicePaymentListView(poID);
			}
			else if (operationOne == 'update_invoice_details') {
				parent.closeDialog();
				var xmlDoc = requestOne.responseXML.childNodes[0];
				var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;

				if (status == '200') {
					parent.closeDialog();
				}
				else {
					parent.showFailureMessageAndClose(getMessageForKey("sdp.invioce.update.error.msg"),1500);
				}
				showInvoicePaymentListView(poID);
			}
			else if (operationOne == 'add_payment_details') {
				var xmlDoc = requestOne.responseXML.childNodes[0];
				var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;
				if (status == '200') {
					parent.closeDialog();
					refreshMenu();
				}
				else {
					parent.showFailureMessageAndClose(getMessageForKey("sdp.payment.add.error.msg"),1500);
				}
				showInvoicePaymentListView(poID);
			}
			else if (operationOne == 'update_payment_details') {
				var xmlDoc = requestOne.responseXML.childNodes[0];
				var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;

				if (status == '200') {
					parent.closeDialog();
				}
				else {
					parent.showFailureMessageAndClose(getMessageForKey("sdp.payment.update.error.msg"),1500);
				}
				showInvoicePaymentListView(poID);
			}
			else if (operationOne == 'refresh_menu') {
			    if(!isMSP){
				document.getElementById('purchaseOrderTab_content').innerHTML = requestOne.responseText;
				document.getElementById('purchaseOrderTab_content').style.display = 'block'//No I18N
				document.getElementById('approvalTab_content').style.display = 'none'//No I18N
				document.getElementById('assreqTab_content').style.display = 'none'; //No I18N
				document.getElementById('invoiceAndPaymentTab_content').style.display = 'none'//No I18N
				document.getElementById('historyTab_content').style.display = 'none'//No I18N
				}
				var scriptObjs = document.getElementById('tab_content').getElementsByTagName("script");
				for (var k = 0; k < scriptObjs.length; k++) {
					var parentScript = scriptObjs[k];
					try {
						var newScript = document.createElement('script');
						if (parentScript.src) {
							newScript.src = parentScript.src;
						}
						if (parentScript.innerHTML) {
							newScript.innerHTML = parentScript.innerHTML;
						}
						newScript.nonce = sdpNonce;
						document.getElementsByTagName("head")[0].appendChild(newScript);
					}
					catch (e) {

					}

				}
				parent.startList();
				setTimeout(function(){closeDialog();},1000);
			}
			else if (operationOne == 'refresh_action_menu') {
				var element = document.getElementById('menutop');
				if (element != undefined) {
					element.innerHTML = requestOne.responseText;
				}
			}
		}
	}
}
function replaceAll(data, sep) {
	var t = /##/g;
	data = data.replace(t,sep);
	return data;
}
function showHide(show, hide) {
	var show_div = document.getElementById(show);
	show_div.style.display = 'block';//No I18N
	var hide_div = document.getElementById(hide);
	hide_div.style.display = 'none';//No I18N
}
function showElement(show) {
	var element = document.getElementById(show);
	if (element != undefined) {
		element.style.display = 'block';//No I18N
	}
}
function hideElement(hide) {
	var hideObject = jQuery( '#'+hide );
	hideObject != undefined ? hideObject.hide() : '' ;
}


function updateAppList(app_list_obj) {
	var data = "";
	if (app_list_obj.length > 0) {
		var length = app_list_obj.length;
		for (i = 0; i < length; i++) {
			if (app_list_obj[i].selected == true) {
				if (data == "") {
					data = app_list_obj[i].innerHTML;
				}
				else {
					data += "," + app_list_obj[i].innerHTML;//No I18N
				}
			}
		}
	}
	document.getElementById('app_names').value = data;
}

function checkItemQuantity(obj) {
	var id = jQuery(obj).attr("id");
    var value = jQuery(obj).val();
    var indexno = id.split('_');
    var itemCategory = jQuery('#itemCategorySelect_'+indexno[1]).val();
    var error = false;
	if (itemCategory == 'Assets' && (trim(value) == '' || value.indexOf(".") != -1 || !isPositiveInteger(value) || parseInt(value, 10).toString() == '0')) {
    	error = true;
    }
	else if ((itemCategory == 'Services' || itemCategory == 'Others') && (trim(value) == '' || isDouble(value) == false )) {
    	error = true;
    }

	if (error) {
    	alert(getMessageForKey("ae.po.invalidquantity.errmsg"));
    	setTimeout(function() {
    		jQuery("#"+id).trigger('focus');
        }, 0);
    	return false;
	}
	if (jQuery('#isPartialReceived').val() != 'false') {
		var quantityReceived = parseFloat(jQuery("#itemReceivedQuantity_"+indexno[1]).html());
		var quantityEntered = parseFloat(value);
		if (quantityEntered < quantityReceived) {
			alert(getMessageForKey("sdp.purchase.partialpo.orderedquan.errmsg"));
			setTimeout(function() {
	    		jQuery("#"+id).trigger('focus');
	        }, 0);
			return false;
		}
	}
	calculate(obj);
}
function checkItemPrice(obj) {
	var id = jQuery(obj).attr("id");
	if (trim(obj.value) == '' || !isDouble(trim(obj.value))) {
		alert(getMessageForKey("sdp.purchase.common.invalidcost.errmsg"));
		jQuery('input#' + id).val('0.00');
		jQuery("input#" + id).trigger('focus');
		return false;
	}
	else {
		jQuery('input#' + id).val(parseFloat(obj.value).toFixed(2));
		calculate(obj);
	}
}
function checkItemTaxRate(obj) {
	var id = jQuery(obj).attr("id");
	if (trim(obj.value) == '' || !isDouble(trim(obj.value))) {
		alert(getMessageForKey("sdp.purchase.newpo.producttaxrate.errmsg"));
		jQuery('input#'+id).val('0.00');
		jQuery("input#"+id).trigger('focus');
	    	return false;
	}
	else {
		jQuery('input#' + id).val(parseFloat(obj.value).toFixed(2));
		calculate(obj);
	}
}
function calculate(el) {
	var parentTrId = jQuery(el).closest('tr').attr('id');//NO I18N
	var indexno = parentTrId.split('_');
	subTotal = parseFloat(jQuery('#subTotal').val());
	var price = jQuery('#itemPrice_'+indexno[1]).val();
	var itemCategory = jQuery('#itemCategorySelect_'+indexno[1]).val();
	var quantity = jQuery('#itemQuantity_'+indexno[1]).val();
	if (quantity == '' && itemCategory == 'Others') {
		quantity = 1;
	}
	if (quantity == 0) {
		return false;
	}
	var taxRate = jQuery('#itemTaxRate_'+indexno[1]).val();
	var itemTotal = price*quantity;
	var rowAmount = (itemTotal+(itemTotal*taxRate/100)).toFixed(2);
	jQuery('#itemAmount_'+indexno[1]).val(rowAmount);
	poCalculation();
}
function poCalculation() {
	var totalAmount = 0.0;
	jQuery("#product_table tr.po-new-item-row").each(function(i){
		var rowId = jQuery(this).attr('id');
		var index = rowId.split("_");
		var itemAmount = parseFloat(jQuery("#itemAmount_"+index[1]).val());
		totalAmount += itemAmount;
	});
	//Need to keep subTotal variable as we are using this in other functions also.
	subTotal = totalAmount;
	var discount = (jQuery('#discount').val()).replace(',','');//No I18N
	if (trim(discount) != '' && trim(discount) != '0') {
		discount = parseFloat(discount);
		jQuery('#discountvalue').val(((discount/100)*subTotal).toFixed(2));
	}
	jQuery('#subTotal').val(subTotal.toFixed(2));
	jQuery('#totalitemvalue').val((subTotal - (jQuery('#discountvalue').val()).replace(',','')).toFixed(2));//No I18N
	calculateTax();
	calculateAddTax();
	calculateTotal();
}
function calculateTax() {
	var tax = document.getElementById('taxrate').value;
	if (isValidPOData(document.getElementById('taxrate'), '', 'double', getMessageForKey("sdp.purchase.newpo.salestaxrate.errmsg"), '0.00') == false) {
		return false;
	}
	if (trim(tax) != '' && mode != 'view_po') {
		if (document.getElementById('taxShipping').value == 'true') {
			var total = parseFloat(document.getElementById('totalitemvalue').value) + parseFloat(document.getElementById('shippingcost').value);
			document.getElementById('taxratevalue').value = (( tax / 100) * total).toFixed(2);
		}
		else {
			document.getElementById('taxratevalue').value = (( tax / 100) * document.getElementById('totalitemvalue').value).toFixed(2);
		}
	}
}
function calculateAddTax() {
	var tax = document.getElementById('addtaxrate').value;
	if (isValidPOData(document.getElementById('addtaxrate'), '', 'double', getMessageForKey("sdp.purchase.newpo.additionaltaxrate.errmsg"), '0.00') == false) {
		return false;
	}
	if (trim(tax) != '' && mode != 'view_po') {
		document.getElementById('salestax').value = (( tax / 100) * document.getElementById('totalitemvalue').value).toFixed(2);
	}
}
function calculateTotal() {
	var total = 0;
	if (isValidPOData(document.getElementById('taxratevalue'), '', 'double', getMessageForKey("sdp.purchase.newpo.salestaxvalue.errmsg"), '0.00') == false) {
		return false;
	}
	if (isValidPOData(document.getElementById('shippingcost'), '', 'double', getMessageForKey("sdp.purchase.newpo.shippingcost.errmsg"), '0.00') == false) {
		return false;
	}
	if (isValidPOData(document.getElementById('salestax'), '', 'double', getMessageForKey("sdp.purchase.newpo.additionaltaxvalue.errmsg"), '0.00') == false) {
		return false;
	}
	/*if(checkPriceAdjustment(document.getElementById('priceadjustment')) == false)
	{	
		return false;
	}*/

	if (trim(document.getElementById('totalitemvalue').value) != '') {
		total += parseFloat(document.getElementById('totalitemvalue').value);
	}
	if (trim(document.getElementById('shippingcost').value) != '') {
		if (document.getElementById('taxShipping').value == 'true') {
			var temp = parseFloat(document.getElementById('totalitemvalue').value) + parseFloat(document.getElementById('shippingcost').value);
			var tax = document.getElementById('taxrate').value;
			document.getElementById('taxratevalue').value = (( tax / 100) * temp).toFixed(2);
		}

		total += parseFloat(document.getElementById('shippingcost').value);
	}
	if (trim(document.getElementById('taxratevalue').value) != '') {
		total += parseFloat(document.getElementById('taxratevalue').value);
	}
	if (trim(document.getElementById('salestax').value) != '') {
		total +=  parseFloat(document.getElementById('salestax').value);
	}
	/*if( trim(document.getElementById('priceadjustment').value) != '' )
	{
		total +=  parseFloat(document.getElementById('priceadjustment').value);
	}*/
	for (j = 1; j <= 4; j++) {
		var costFields = document.getElementById("costUDF_COST" + j);

		if (costFields && trim(costFields.value) != '') {
			if( isDouble(trim(costFields.value)) ==  false) {
				alert(getMessageForKey("sdp.purchase.common.invalidcost.errmsg"));
				costFields.value="";
				return false;
			}
			var costsign = document.getElementById("sign_costUDF_COST" + j);
			if (costsign && costsign.value == '+') {
				total +=  parseFloat(costFields.value);
			}
			else {
				if (costFields.value.indexOf('-') == 0) {
					total +=  parseFloat(costFields.value);
				}
				else {
					total -=  parseFloat(costFields.value);
				}
			}
		}
		if ( costFields && trim(costFields.value) == '') {
			costFields.value=0;
		}
	}

	var subTotal = total;
	if (trim(document.getElementById('priceadjustment').value) != '') {
		total +=  parseFloat(document.getElementById('priceadjustment').value);
	}

	if(!isPositiveInteger(total.toFixed(0))) {
		//SD-20788
		alert(getMessageForKey("sdp.purchase.negative.totalvalue.errormsg"));//No I18N
		control = document.getElementById('priceadjustment');
		control.value="0";
		control.focus();
		if(!isPositiveInteger(subTotal.toFixed(0))) {
			subTotal = 0;
		}
		total = subTotal;
		document.getElementById('totalvalue').value = total.toFixed(2);
		return false;
	}

	document.getElementById('totalvalue').value = total.toFixed(2);
}
function fillTotal(discount, operation) {
	discount = trim(discount);
	if (discount == '') {
		if (operation == '%') {
			jQuery('#discount').val('0.00');
		}
		else {
			jQuery('#discountvalue').val('0.00');
		}
	}
	else if (discount != '' && !isDouble(discount)) {
		alert(getMessageForKey("sdp.purchase.common.invalidnumber.errmsg"));
		jQuery('#discount').focus();
		jQuery('#discount').val('0.00');
		jQuery('#discountvalue').val('0.00');
	}
	else {
		discount = parseFloat(discount);
		var reg = /^(?:0?[1-9]\d*(?:\.\d*[0-9]*)?)|(:?^0.[1-9]+0?)$/;
		if (reg.test(discount)) {
	    	//Issue Id: 78811 : In case of PO created from PR then global subTotal variable contains 0 value. So need to take the value from form.
	    	subTotal = parseFloat(jQuery('#subTotal').val());
			if (operation == '%') {
				if (discount > 100) {
					alert(getMessageForKey("sdp.purchase.common.invaliddiscount.errmsg"));
					jQuery('#discount').focus();
					jQuery('#discount').val('0.00');
					return false;
				}
	    		jQuery('#discountvalue').val(((discount / 100) * subTotal).toFixed(2));
	    	}
			else if (operation == '-' && !compareDiscount(subTotal, jQuery('#discount').val(), discount)) {
	    		jQuery('#discount').val('0.00');
	    	}
	    	discValue = parseFloat(trim(jQuery('#discountvalue').val()));	//No I18N
			if (subTotal < discValue) {
				alert(getMessageForKey("sdp.purchase.common.invalidsubtotal.errmsg"));
				return false;
			}
	    	jQuery('#totalitemvalue').val((subTotal - discValue).toFixed(2));//No I18N
			calculateTax();
			calculateAddTax();
			calculateTotal();
	    }
	}
}
function updatePONumber() {
	if (isValidPOData(document.getElementById('purchaseOrderID'), '', 'text', getMessageForKey("sdp.purchase.update.ponubmer.errmsg")) == false) {
		return false;
	}
	return true;
}
function savePurchaseOrder(ownerId, ownerName) {
	if (updatePONumber() == false) {
			return false;
		}
	if (updatePOName() == false) {
			return false;
		}
	if (document.getElementById('vendorID') != null) {
		if (isValidPOData(document.getElementById('vendorID'), '-1', 'pinteger', translate("sdp.purchase.newpo.vendorname.errmsg")) == false) {
				return false;
			}
		}
	if (isValidPOData(document.getElementById('shipaddress'), '', 'text', getMessageForKey("sdp.purchase.newpo.shippingaddress.errmsg")) == false) {
			return false;
		}
	if (isValidPOData(document.getElementById('billaddress'), '', 'text', getMessageForKey("sdp.purchase.newpo.billingaddress.errmsg")) == false) {
			return false;
		}

		//Exchange Rate Validation
		var exchangeRate = jQuery("#exchangeRate").val();

	//Old chrome version 65.0.3325.181, Base currency exchange Rate will be taken as "".
	if(exchangeRate == "" || exchangeRate == undefined){
	    exchangeRate = "1.0";//setting base exchange Rate as 1.0
	}
	if (exchangeRate == 0 || exchangeRate == 0.0) {
			alert(getMessageForKey("ae.exchangeRate.validation.jserr"));
			jQuery("#exchangeRate").trigger('focus');
			return false;
		}
		var anum=/(^\d+$)|(^\d+\.\d+$)/;
	if (!anum.test(exchangeRate)) {
			alert(getMessageForKey("ae.exchangeRate.validation.jserr"));
			jQuery("#exchangeRate").trigger('focus');
			return false;
		}
		// Item Section check start

		var rowCount = jQuery('#product_table tr.po-new-item-row').length;
	if (rowCount == 0) {
			alert(getMessageForKey("ae.po.item.noitemmessage"));
			return false;
		}
	else {
			var err = false;
			var id = null;
			var message = null;
			var itemCategory = null;
			var itemQuantityValue = null;
			var requestItems = new Array();
			var isSelect2field = false;
		for (j = 0; j < rowCount; j++) {
				var rowId = jQuery('#product_table tr.po-new-item-row:eq('+j+')').attr('id');
				var index = rowId.split('_');
				var i = index[1];
			var itemCategory = jQuery('#itemCategorySelect_' + i).val();
            if(itemCategory == ''){
                itemCategory = trim(jQuery('#itemCategorySelect_' + i).text());
            }
            if (itemCategory == -1 || itemCategory == "" || itemCategory == '--Select Category--') {
					err = true;
					isSelect2field = true;
					id = "itemCategorySelect_"+i;//NO I18N
					message = getMessageForKey("ae.po.formvalidation.itemcategory");
				}
			else if (itemCategory == 'Assets' && jQuery('#componentTypeSelect_' + i).val() == -1) {
					err = true;
					isSelect2field = true;
					id = "componentTypeSelect_"+i;//NO I18N
					message = getMessageForKey("ae.barcode.formValidation.productType");
				}
			else if (itemCategory == 'Assets' && trim(jQuery('#componentSelect_' + i).val()) == '') {
					err = true;
					isSelect2field = true;
					id = "componentSelect_"+i;//NO I18N
					message = getMessageForKey("ae.barcode.formValidation.product");
				}
			else if (itemCategory == 'Services' && trim(jQuery('#serviceSelect_' + i).val()) == '') {
					err = true;
					isSelect2field = true;
					id = "serviceSelect_"+i;//NO I18N
					message = getMessageForKey("ae.admin.vendor.validation.servicename.jserr");
				}
			else if (itemCategory == 'Others' && trim(jQuery('#otherSelect_' + i).val()) == '') {
					err = true;
					id = "otherSelect_"+i;//NO I18N
					message = getMessageForKey("ae.po.formvalidation.othercategorytext");
				}
			else if (jQuery('#itemPrice_' + i).val() == '') {
					err = true;
					id = "itemPrice_"+i;//NO I18N
					message = getMessageForKey("ae.po.formvalidation.itemprice");
				}
			else if (jQuery('#itemTaxRate_' + i).val() != '' && isDouble(jQuery('#itemTaxRate_' + i).val()) == false) {
					err = true;
					id = "itemTaxRate_"+i;//NO I18N
					message = getMessageForKey("ae.po.formvalidation.taxrate");
				}
			else if (itemCategory == 'Assets' && (trim(jQuery('#itemQuantity_' + i).val()) == '' || (jQuery('#itemQuantity_' + i).val()).indexOf(".") != -1 || !isPositiveInteger(jQuery('#itemQuantity_' + i).val()) || parseInt(jQuery('#itemQuantity_' + i).val(), 10).toString() == '0')) {
					message = getMessageForKey("ae.po.formvalidation.quantity");
			    	err = true;
					id = "itemQuantity_"+i;//NO I18N
			    }
			else if ((itemCategory == 'Services' || itemCategory == 'Others') && (trim(jQuery('#itemQuantity_' + i).val()) == '' || isDouble(jQuery('#itemQuantity_' + i).val()) == false )) {
			    	message = getMessageForKey("ae.po.formvalidation.quantity");
			    	err = true;
					id = "itemQuantity_"+i;//NO I18N
			    }
			else if (itemCategory == 'Assets' && (jQuery('#assetTextArea_' + i).val() == jQuery('#assetTextArea_' + i).attr('placeholder'))) {
			    	jQuery('#assetTextArea_'+i).val("");
			    }
			else if (itemCategory == 'Services' && (jQuery('#serviceTextArea_' + i).val() == jQuery('#serviceTextArea_' + i).attr('placeholder'))) {
			    	jQuery('#serviceTextArea_'+i).val("");
			    }
			else if (itemCategory == 'Others' && (jQuery('#otherTextArea_' + i).val() == jQuery('#otherTextArea_' + i).attr('placeholder'))) {
			    	jQuery('#otherTextArea_'+i).val("");
			    }
				//For checking duplicate item start
			if (!err) {
				if (itemCategory == 'Assets') {
					if (requestItems.indexOf(jQuery('#componentSelect_' + i).val().trim().toLowerCase()) == -1) {
				    		requestItems.push(jQuery('#componentSelect_'+i).val().trim().toLowerCase());
						}
					else {
				    		message = getMessageForKey("ae.po.duplicateitemname.errmsg");
					    	err = true;
					    	isSelect2field = true;
							id = "componentSelect_"+i;//NO I18N
				    	}
				    }
				else if (itemCategory == 'Services') {
					if (requestItems.indexOf(jQuery('#serviceSelect_' + i).val().trim().toLowerCase()) == -1) {
				    		requestItems.push(jQuery('#serviceSelect_'+i).val().trim().toLowerCase());
						}
					else {
				    		message = getMessageForKey("ae.po.duplicateitemname.errmsg");
					    	err = true;
					    	isSelect2field = true;
							id = "serviceSelect_"+i;//NO I18N
				    	}
				    }
				else if (itemCategory == 'Others') {
					if (requestItems.indexOf(jQuery('#otherSelect_' + i).val().trim().toLowerCase()) == -1) {
				    		requestItems.push(jQuery('#otherSelect_'+i).val().trim().toLowerCase());
						}
					else {
				    		message = getMessageForKey("ae.po.duplicateitemname.errmsg");
					    	err = true;
							id = "otherSelect_"+i;//NO I18N
				    	}
				    }
				    //For checking duplicate item start
				}
			if (err) {
					alert(message);
				if (isSelect2field) {
						jQuery('#'+id).select2('focus');
					}
				else {
						jQuery('#'+id).trigger('focus');
					}
					return false;
				}
			}
		}
		// Irem section check end
	if (isValidPOData(document.getElementById('discountvalue'), '', 'double', getMessageForKey("sdp.purchase.newpo.discountvalue.errmsg")) == false) {
			return false;
		}
	if (isValidPOData(document.getElementById('shippingcost'), '', 'double', getMessageForKey("sdp.purchase.newpo.shippingcost.errmsg")) == false) {
			return false;
		}
	if (isValidPOData(document.getElementById('taxratevalue'), '', 'double', getMessageForKey("sdp.purchase.newpo.salestaxvalue.errmsg")) == false) {
			return false;
		}
	if (isValidPOData(document.getElementById('salestax'), '', 'double', getMessageForKey("sdp.purchase.newpo.additionaltaxvalue.errmsg")) == false) {
			return false;
		}
	if (checkPriceAdjustment(document.getElementById('priceadjustment')) == false) {
			return false;
		}
	if (updateRequester() == false) {
			return false;
		}
	if (updateNumberAdditionalFields() == false) {
			return false;
		}

	if (calculateTotal() == false) {
			return false;
		}

	if (jQuery('#poApprovalEnabled').is(':checked') && jQuery('#approverLevelRow_1 [id^=appTabList]').children().length == 0) {
			alert(getMessageForKey('ae.purchase.mlApprover.LevelApprover.errmsg', [1]));
			return false;
		}

		jQuery('#LevelCount').val(jQuery('#poApprovalTable').find('tr').length);
	if (jQuery('table#poApprovalTable > tbody > tr:eq(0)').find('option').length != 0 || jQuery('table#poApprovalTable > tbody > tr:eq(0)').attr('id') != undefined) {
			// For taking the no. of level for approval.
			var valid = undefined;
		for (i = 0; i < jQuery('#LevelCount').val(); i++) {
				var j = i+1;
			if (jQuery('table#poApprovalTable > tbody > tr:eq(' + i + ')').find('option').length == 0 && j != 1) {
					alert(getMessageForKey("ae.purchase.mlApprover.LevelApprover.errmsg").replace('{0}',j));
					return false;
				}
			else {
				if (jQuery('table#poApprovalTable > tbody > tr:eq(' + j + ')').find('option').length != 0 && jQuery('table#poApprovalTable > tbody > tr:eq(' + i + ')').find('option').length == 0) {
						alert(getMessageForKey("ae.purchase.mlApprover.LevelApprover.errmsg").replace('{0}',j));
						return false;
					}
				}
					}
		//Validating cost limit of the approver
		valid = validateApproverForCost();
		if (!valid) 
		{
					return false;
				}
			}

		this.operationOne='add_new_po';//No I18N
		callAjaxThreadOne(this.operationOne);
		return false;
	}
function updateNumberAdditionalFields() {
	for (i = 1; i <= 4; i++) {
			var numberAddFields = document.getElementById("long_UDF_LONG" + i);
		if (numberAddFields && !trim(numberAddFields.value) == "") {
			if (!isInteger(numberAddFields.value)) {
					alert(getMessageForKey("sdp.purchase.common.invalidnumber.errmsg"));
					numberAddFields.focus();
					return false;
				}
			}
		}
		return;
	}
function editPurchaseOrder(purchaseOrderID) {
		this.poID = purchaseOrderID;
		this.mode = 'edit';//No I18N
		this.operationOne='editpo';//No I18N
		callAjaxThreadOne(this.operationOne);
		jQuery('#pr-sidebar').attr('style','display: none !important');

		jQuery('#purchaseOrderList').getNiceScroll().resize();
		jQuery('#purchaseRequestList').getNiceScroll().resize();

		jQuery(window).on('resize', function(){
			jQuery('#single-details .details-div').height('auto');//No I18N
			jQuery('#content-div>.scroll-wrap').css('overflow','visible');//No I18N
			jQuery('.newpr-body').css('overflow','visible');//No I18N
			jQuery('#new-pr, .scroll-wrap').css('height','auto'); //No I18N
		})
		jQuery(window).trigger('resize');
		//Issue fix SD-92567
		jQuery('body').css({'overflow-y':'auto'});//No I18N
	}
function addNewVendor() {
		var element = document.getElementById("add_new_vendor_image");
		var x = findPosX(element) - 200;
		var y = findPosY(element) - 250;
		var finalX = x + element.offsetWidth;
		showURLInDialog('/purchase/addnewvendor.jsp','modal=yes,closeButton=no,position=absmiddle');//No I18N
	}
function validatePOVendorForm() {
	if(document.getElementById('parentID') != undefined)
	{
	if(document.getElementById('parentID').selectedIndex ==null || document.getElementById('parentID').selectedIndex == '' )
	{
		jQuery('#parentID').find('option:not(:first)').remove();
	}
	}
	if (trim(document.getElementById('vendorNameID').value) == '') {
			alert(getMessageForKey("sdp.purchase.newvendor.select.errmsg"));
			document.getElementById('vendorNameID').focus();
			return false;
		}
	if (document.getElementById('currencyDiv').value == 'usableCurrencyDiv') {
		if (trim(document.getElementById('vendorCurrency').value) == '-1') {
				alert(getMessageForKey("ae.admin.vendor.selectCurrency.alert"));
				document.getElementById('vendorCurrency').focus();
				return false;
			}
		}
	else if (document.getElementById('currencyDiv').value == 'otherCurrencyDiv') {
			var currency = jQuery("#usableCurrency").val();
			var currencyName = jQuery('#usableCurrency').children(':selected').text();//No I18N
		if (currency == -1) {
				alert(getMessageForKey("ae.currency.validation.jserr"));
				jQuery("#usableCurrency").trigger('focus');
				return false;
			}
			var currencySymbol = jQuery("#currencySymbol").val();
		if (currencySymbol == '') {
				alert(getMessageForKey("ae.currencySymbol.validation.jserr"));
				jQuery("#currencySymbol").trigger('focus');
				return false;
			}
			var exchangeRate = jQuery("#currencyExchangeRate").val();
		if (exchangeRate == 0 || exchangeRate == 0.0) {
				alert(getMessageForKey("ae.exchangeRate.validation.jserr"));
				jQuery("#currencyExchangeRate").trigger('focus');
				return false;
			}
			var anum=/(^\d+$)|(^\d+\.\d+$)/;
		if (!anum.test(exchangeRate)) {
				alert(getMessageForKey("ae.exchangeRate.validation.jserr"));
				jQuery("#currencyExchangeRate").trigger('focus');
				return false;
			}

		}

		var emailID = trim(document.getElementById('emailId').value);//No I18N
		if (emailID != null && emailID != "")//No I18N
		{
		var re =/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		if (!re.test(emailID))
		{
				alert(getMessageForKey("sdp.reports.report.emailid"));	//No I18N
				document.getElementById('emailId').focus();//No I18N
				return false;
			}
		}


		this.operationOne = 'add_new_vendor';//No I18N
		callAjaxThreadOne(this.operationOne);
	}

function openReceiveItemWindow() {
		//parent.invokeProgressIndicator(null,getMessageForKey("sdp.purchase.progress.indicator.openrecent"),'progress');//No I18N
		var millis = new Date();
		//showURLInDialog('/purchase/ReceiveItems.jsp?poID=' + poID+'&time='+millis+'&poNumber='+poNumber,'modal=yes,closeButton=no,left=20,top=20,position=absmiddle, width=950');//No I18N
		//javascript:NewWindow('/purchase/ReceiveItems.jsp?poID=' + poID+'&time='+millis+'&poNumber='+poNumber, 'ReceiveItems','950','600','yes','center');//No I18N
		javascript:NewWindow('/PurchaseOrder.do?module=ReceiveItems&poID=' + poID+'&time='+millis, 'ReceiveItems','950','600','yes','center');//No I18N
	}

function checkPriceAdjustment(control) {
		var isvalid = true;
		var str = trim(control.value);
	if (str != null && str.length > 0) {
			var sighChar = str.charAt(0);
		if (sighChar == '-' || sighChar == '+') {
				str = str.substr(1,str.length);
			}
		}

		isvalid = isDouble(str);

	if (isvalid == false) {
			alert(getMessageForKey("sdp.purchase.common.invalidnumber.errmsg"));
			control.value="0.00";
			control.focus();
			//if( control.id != undefined && control.id != '' )
			//{
			//	new Effect.ScrollTo(control.id);
			//}
		}
	else {
			var netTotal = parseFloat(document.getElementById('totalvalue').value);
			var paVal = trim(control.value);
		if (paVal != null && paVal.length > 0) {
				var sChar = paVal.charAt(0);
			if (sChar == '-') {
					//SD-25602 Problem in saving the purchaseorder, if the price adjustment is more than the total and less than net amount.
					//paVal = paVal.substr(1,paVal.length);
				if (paVal > netTotal) {
						isvalid = false;
						alert(getMessageForKey("sdp.purchase.priceadjustment.errormsg"));
						control.value="0";
						control.focus();
					}
				}
			}
		}

		return isvalid;
	}

function compareDiscount(total, discountrate, discountvalue) {
		var isSame = false;
		var discount = discountrate;
		var calculatedDiscount = 0;
	if (trim(discount) != '' && trim(discount) != '0') {
			calculatedDiscount = ((discount / 100) * total).toFixed(2);
		}

	if (calculatedDiscount == discountvalue) {
			isSame = true;
		}
		return isSame;
	}

function openNotifyWindow(str, purID) {
		javascript:NewWindow("Notify.do?notifyModule=PurchaseOrder&mode=E-Mail&id="+purID+"&notifyTo="+str,'notifyowner','900','600','yes','center');//No I18N
	}

function refreshWindow() {
	document.location=document.location;
}

function refreshMenu(requestFrom) {
	    //setting the tabname and tab image under the tabs
	    displayLoadingInformation(null,getMessageForKey("sdp.common.loading"), true, 500);
	    showHide("podetailson","podetailsoff");//No I18N
	if (jQuery('#approvalDetailsOff').val() != undefined && jQuery('#approvalDetailsOff').val() != undefined) {
	    	showHide("approvalDetailsOff","approvalDetailsOn");//No I18N
	    }
	    if(jQuery('#assreqoff').val() != undefined && jQuery('#assreqon').val() != undefined)//No I18N
	    {
		showHide("assreqoff", "assreqon");//No I18N
	    }
	if (requestFrom != undefined && requestFrom != 'nonLogin') {
            	showHide("historyoff","historyon");//No I18N
            	showHide("listviewoff","listviewon");       //No I18N
	    }
	    if((document.getElementById("purchaseOrderTab_content").innerHTML).trim() == '')
	    {
            	this.operationOne = 'refresh_menu';//No I18N
            	callAjaxThreadOne(this.operationOne);
	    }
	    else
	    {
	    	document.getElementById('purchaseOrderTab_content').style.display = 'block'//No I18N
		document.getElementById('approvalTab_content').style.display = 'none'//No I18N
		document.getElementById('invoiceAndPaymentTab_content').style.display = 'none'//No I18N
		document.getElementById('historyTab_content').style.display = 'none'//No I18N
		document.getElementById('assreqTab_content').style.display = 'none'//No I18N
	    }
	    var tabid=document.getElementById("tabdetails");
	if (tabid != undefined) {
            	tabid.innerHTML = '<img width="23" height="26" src="/images/purchase-default-value.gif"/><strong>'+getMessageForKey("sdp.header.newpo")+'</strong>';
	    }
	}

function clearAllFields() {
		document.getElementById('subTotal').value = "0.00";
		document.getElementById('totalitemvalue').value = "0.00";
		document.getElementById('totalvalue').value = "0.00";
		document.getElementById('shippingcost').value = "0.00";
		document.getElementById('discount').value = "0.00";
		document.getElementById('discountvalue').value = "0.00";
		//This value is might be set from PurchaseDefaultConfig, So no need to reset.
		//document.getElementById('taxrate').value = "0.00";
		document.getElementById('taxratevalue').value = "0.00";
		document.getElementById('addtaxrate').value = "0.00";
		document.getElementById('salestax').value = "0.00";
		document.getElementById('priceadjustment').value = "0.00";
	}


function removeEmptyValAndCloseProduct() {
	parent.closeDialog();
}

// When this window is opened, a new option would have been
// inserted in the parent. This has to be removed when we click
// cancel/close. This as a temp is done here. The complete flow
// should be changed

function validatePopupDefForm() {
	if (document.ProductDefForm.softwareList != undefined && jQuery('#softwareList').is(":hidden") != true) {

		val = trimAll(document.ProductDefForm.softwareList.value);

		if (val == -1) {

			alert(getMessageForKey("ae.cmdb.inventory.ci.swins.selectSWJSError"));

			document.ProductDefForm.softwareList.focus();

			return false;

		}

	}
	val = trimAll(document.ProductDefForm.componentName.value);
	if (val == null || val == '') {
		alert(getMessageForKey("sdp.purchase.addNew.popUpProduct.jsPNameErr"));
		document.ProductDefForm.componentName.focus();
		return false;
	}
	document.ProductDefForm.componentName.value = val;
	if (document.ProductDefForm.componentType.value == "") {
		alert(getMessageForKey("sdp.purchase.addNew.popUpProduct.jsPTypeErr"));
		document.ProductDefForm.componentType.focus();
		return false;
	}

	if (isSoftwareSelectedFromPO()) {
		document.ProductDefForm.isSoftwareSelected.value = "true";//No I18N
	}
	else {
		document.ProductDefForm.isSoftwareSelected.value = "false";//No I18N
	}

	var x = trimAll(document.ProductDefForm.price.value);
	var anum=/(^\d+$)|(^\d+\.\d+$)/;
	if (x == "") {
		alert(getMessageForKey("ae.po.item.pricecheck.message"));
		document.ProductDefForm.price.focus();
		return false;
	}
	else if (x != null && x != '' && !anum.test(x)) {
		alert(getMessageForKey("sdp.purchase.addNew.popUpProduct.jsCostErr"));
		document.ProductDefForm.price.focus();
		return false;
	}

	var taxrate = trimAll(document.ProductDefForm.taxRate.value);
	if ((taxrate != null && taxrate != '' && !anum.test(taxrate)) || (taxrate < 0 || taxrate > 100)) {
		alert(getMessageForKey("sdp.purchase.addNew.item.jsTaxErr"));//No I18N
		document.ProductDefForm.taxRate.focus();
		return false;
	}
	parent.addNewProductApi();
	return false;
}

function prePopulateSWProduct(selectTag) {
	document.getElementById('componentName').value = selectTag.options[selectTag.selectedIndex].text;
}

function reconcile(form, assetType, errmsg) {
	var c1="";
	var c2="";
	var count = 0;
	for (var i = 0; i < form.elements.length; i++) {
		if (form.elements[i].name == 'checkbox') {
			if (form.elements[i].checked) {
            	count++;
                var value = form.elements[i].value;
				if (c1 == "") {
					c1 = parseInt(value);
				}
				else {
					c2 = value;
				}
            }

        }
    }
	if (count != 2) {
    	alert(errmsg);
    	return;
    }
	showURLInDialog('/purchase/POReconcileConfirm.jsp?resource1='+c1+'&resource2='+c2+'&assetType='+assetType,'closeButton=yes,position=absmiddle,title='+getMessageForKey("sdp.purchase.reconcile.confirm.header"));
//	showDialog(inner,'title=Reconcile confirmation,closeButton=yes,position=absolute,width=250,height=70,top=100,left=350');
}

function recon(c1, c2, assetType) {
	var t1 = parseInt(c1);
    var t2 = parseInt(c2);
    var url = "/servlet/AJaxServlet";//No I18N
 	var params = "action=reconcile&resource1="+t1+"&resource2="+t2+"&assetType="+assetType;//No I18N

    requestOne = getXMLHttpRequest();
	if (requestOne) {
		try {
			callLoadingIcon('addReconcileLoading', document.getElementById('sdp.purchase.reconcile.progress.msg').innerHTML);//No I18N
			requestOne.open("POST", url, true);
			requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
			requestOne.setRequestHeader("Content-length", params.length);
			requestOne.onreadystatechange = updateAjaxRequestReconcile;
			requestOne.send(params);
		}
		catch (e) {
			alert(getMessageForKey("sdp.ajax.request.send.error"));//No I18N
		}
	}
}

function updateAjaxRequestReconcile() {
	if (requestOne.readyState == 4) {
		if (requestOne.status == 200) {
			var xmlDoc = requestOne.responseXML.childNodes[0];
			var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;
			var message = xmlDoc.childNodes[1].childNodes[0].nodeValue;
			if (status == '200') {
				parent.closeDialog();
				//self.close();
				showSuccessMessageAndClose(null,message,4000);
				window.setTimeout(function(){
                    if(window.name === "ReceiveItems")//No I18N
					window.close();
					else
                    assetListView.tableObject.refreshTable();
                        },3000);
			}
			else {
				document.getElementById('addReconcileLoading').innerHTML= '';
				document.getElementById('reconcile_Exception_message').innerHTML= encodeHTML(message);
				document.getElementById('reconcile_Exception_tr').style.display = '';
				//var message = xmlDoc.childNodes[1].childNodes[0].nodeValue;				
				//parent.showFailureMessageAndClose(message,25000);
			}
		}
	}
}

function openReconcileWindow(pID, callFrom, countOfConflictWS) {
	 var millis = new Date();
  	 showURLInDialog('/purchase/POReconcile.jsp?poID='+pID+'&time='+millis+'&callFrom='+callFrom+'&countOfConflictWS='+countOfConflictWS,'modal=yes,closeButton=no,position=absmiddle,width=885');//No I18N
}

function reconcileWS(form) {
	var url = "/PurchaseOrder.do";//No I18N
	var params = "module=reconcilews";//No I18N
	var serTagArray = new Array();
	if (form.elements != null) {
		isSelected = false;
		for (var i = 0; i < form.elements.length; i++) {
			if (form.elements[i].checked) {
	        		isSelected = true;
	            		var resID = form.elements[i].value;
				if (resID != -1) {
		        		var sTag = document.getElementById("parent_servicetag_"+resID).value;//No I18N
					sTag = trim(sTag);
					var scannedWsName = document.getElementById("mergedWS_"+resID).value;//No I18N
					scannedWsName = trim(scannedWsName);
					if (sTag == '') {
						showBaloonToolTip('parent_servicetag_'+resID,getMessageForKey('sdp.purchase.reconcile.ws.servicetag.error.msg'));//No I18N
		            			document.getElementById("parent_servicetag_"+resID).focus();//No I18N
		            			return false;
		            		}
					if (serTagArray.length > 0 && serTagArray.indexOf(sTag) != -1) {
						showBaloonToolTip('parent_servicetag_'+resID,getMessageForKey('ae.purchase.poReconcile.duplicateSerTag.error'));//No I18N
						document.getElementById("parent_servicetag_"+resID).focus();//No I18N
						return false;
					}
					serTagArray[i]=sTag;
		            		//params += "&resourceid=" +resID+ ","+sTag;//No I18N
					params += "&resourceid=" +resID+ ","+scannedWsName;//No I18N
	            		}
	        	}
		}
		if (isSelected == false) {
			showBaloonToolTip('RememberMe327',getMessageForKey('sdp.purchase.reconcile.ws.resource.select.msg'));//No I18N
			return false;
		}

		requestOne = getXMLHttpRequest();
		if (requestOne) {
			try {
				//invokeProgressIndicator(null,getMessageForKey("sdp.purchase.reconcile.progress.msg"),'progress');//No I18N
				callLoadingIcon('addReconcileLoading', document.getElementById('ae.purchase.reconcile.progress.indicator').innerHTML);//No I18N
				requestOne.open("POST", url, true);
				requestOne.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
				requestOne.setRequestHeader("Content-length", params.length);
				requestOne.onreadystatechange = updateAjaxRequestReconcile;
				requestOne.send(params);
			}
			catch (e) {
			alert(getMessageForKey("sdp.ajax.request.send.error"));//No I18N
			}
		}
	}
}

function selectAllWS(form, maincheck) {
	var value = maincheck.checked;

	for (var i = 0; i < form.elements.length; i++) {
		if (form.elements[i].type == "checkbox") {
        	form.elements[i].checked=value;
        }
	}
}

function validateApproverForCost() 
{
	var valid = true;
	var approverName = undefined;
	var total = parseFloat(document.getElementById("totalvalue").value);
	var exchangeRate = parseFloat(document.getElementById("exchangeRate").value);

	for (i = 0; i < jQuery('#LevelCount').val(); i++) 
	{
		var j = i + 1;
		jQuery('#approver_' + j + ' option').each(function (){
			var appname =  jQuery(this).text();
			for (k = 0; k < approversName.length; k++) 
			{
		var name = approversName[k];
				if (name == trim(appname)) 
				{
			var cost = parseFloat(approversCost[k]);
			total = total/exchangeRate;
					if (cost != -1 && cost < total) 
					{
						if(approverName != undefined)
						{
							approverName = approverName+', '+name;
						}
						else
						{
							approverName = name;
						}
				valid = false;
			}
		}
	}
		});
	}
	if(!valid)
	{
		//In JSP, the key is defined with {0} and replacing the value in javascript
		approverName = '"' + approverName + '"';// No I18N
		var alertMsg = getMessageForKey('sdp.purchase.validate.approver.cost.err.message');// No I18N
		alertMsg = alertMsg.replace('0', approverName);// No I18N
		alert(alertMsg);
	}
	return valid;
}

/**function to delete the number of rows 
   args: tableID 
         rowsToDel -- If not specified, will delete all the rows
*/


function deleteTableRows(tableID, rowsToDel) {
	if (document.getElementById(tableID) != undefined) {
		var tbl = document.getElementById(tableID);
		var lastRow = tbl.rows.length;
		if (rowsToDel != null && rowsToDel != "") {
			lastRow = rowsToDel;
		}

		while (lastRow > 0) {
			tbl.deleteRow(lastRow - 1);
			lastRow = tbl.rows.length;
		}
	}
}
//Function added to open a pop-up to get the mandatory close fileds.
function openPOStatusChangeWindow_manCheck(pID, custom_id, poStatus, titleMsg, manStatus) {
  	         this.poID = pID;
	if (poStatus == "Closed") {
		if (manStatus == 'false') {
  	                         showURLInDialog('PurchaseOrder.do?module=pomandatory&date='+new Date().getMilliseconds()+'&poID='+poID,'modal=yes,closeButton=no,position=absmiddle');//No I18N
  	                 }
		else {
  	                         showURLInDialog('/PurchaseApproval.do?date='+new Date().getMilliseconds()+'&poID=' + pID + '&changeStatusTo='+poStatus+'&module=get','modal=yes,closeButton=no,position=absmiddle');//No I18N
  	                 }
  	         }
  	 }


/***************************************MLApprover scripts Start*************************************************************/

function validateApproverPopUp(trId) {
	var selectedAppLength = jQuery('input[name=approverName]:checkbox:checked').length;
	if (selectedAppLength == 0) {
		alert(getMessageForKey("ae.purchase.approver.select.errorMessage"));
		return false;
	}
	var approvalCondition = jQuery("input[name=approvalCondition]:checkbox:checked").attr('id');
	var condition = 'or';//No I18N
	if (approvalCondition == 'everyone') {
	 	condition = 'and';//No I18N
	}
	var approverIds = [];
	var approverNames = [];
	var list = '';
	var option = '';

	jQuery('input[name=approverName]:checkbox:checked').each(function(i){
		approverIds[i] = jQuery(this).val();
		approverNames[i] = jQuery("label[for='" + approverIds[i] + "']").text();
		if (i < selectedAppLength - 1) {
			list = updatePOApproverList(list, approverIds[i], approverNames[i], condition);
		}
		else {
			list = updatePOApproverList(list, approverIds[i], approverNames[i], null);
		}

		option = updatePOApproverSelectList(option, approverIds[i], approverNames[i]);

	});
	jQuery('#'+trId).find('div').html(list);
	jQuery('#'+trId).find('select').html(option);
	jQuery('#'+trId).find('input').val(condition);
	postApproverUpdate();
	jQuery(document).off("mouseover").on("mouseover", "[data-id='spanpurchaseappr']", function(){showDeleteButton(this);}) //NO I18N
	jQuery(document).off("mouseout").on("mouseout", "[data-id='spanpurchaseappr']", function(){hideDeleteButton(this);}) //NO I18N
	jQuery(document).off("click.imgpurchaseappr").on("click.imgpurchaseappr", "[data-id='imgpurchaseappr']", function(){removeApprover(this);}) //NO I18N
	if (jQuery('[sdpJs="js-event-purchaserequestinputs-15"]').length) {
        jQuery(document).on('click', '[sdpJs="js-event-purchaserequestinputs-15"]', function(event) {
            var clickedElement = jQuery(this);
            showDD(clickedElement);
        });
    }
    // Add Next Level
    if (jQuery('[sdpJs="js-event-purchaserequestinputs-16"]').length) {
         jQuery(document).on('click', '[sdpJs="js-event-purchaserequestinputs-16"]', function(event) {
            if(isValidateApprover){
             addNextLevel(this.parentNode.parentNode);
            }
        });
    }
    isValidateApprover =true;
	closeDialog();
}

function updatePOApproverList(list, approverId, approverName, condition) {
	if (list != '') {
		list = list + "<span id='" + Number(approverId) + "' data-id='spanpurchaseappr'><img src='/images/spacer.gif' class='closebtn-circle' data-id='imgpurchaseappr'>" + ZSEC.Encoder.encodeForHTML(approverName) + "</span>";
	}
	else {

		list = "<span id='" + Number(approverId) + "' data-id='spanpurchaseappr'><img src='/images/spacer.gif' class='closebtn-circle' data-id='imgpurchaseappr'>" + ZSEC.Encoder.encodeForHTML(approverName) + "</span>";

		}

	if (condition != null) {
		list += "<b>" + condition + "</b>";//NO I18N
	}

	return list;
}
function updatePOApproverSelectList(option, approverId, approverName) {
	if (option != '') {
		option = option + "<option value='" + Number(approverId) + "'>" + ZSEC.Encoder.encodeForHTML(approverName) + "</option>";//NO I18N
	}
	else {
		option = "<option value='" + Number(approverId) + "'>" + ZSEC.Encoder.encodeForHTML(approverName) + "</option>";//NO I18N
	}
	return option;
}

function clearApproverList(removeall) {
		var selectObj = document.getElementById('popupappr');
	if (selectObj && selectObj.length > 0) {
			var len = selectObj.length;
		for (i = 0; i < len; i++) {
			if (removeall == true) {
					selectObj[i].selected = false;
				}
			}
		}
	}

function removeApprover(appObject) {
		var parentId = jQuery(appObject.parentNode.parentNode.parentNode.parentNode).attr('id');
		levelNumber = parentId.split('_')[1];

		levelStatus = jQuery('#' + parentId + ' TD #levelstatus_' + levelNumber).val();

	if (levelStatus === 'Approved' || levelStatus === 'Pending Approval' || levelStatus === 'Rejected') {
			alert (getMessageForKey('ae.purchase.mlApprover.LevelApprover.delete.err',[levelStatus]));
			return;
		}
	if (confirm(getMessageForKey("ae.purchase.removeApprover.confirm"))) {
			var spanId  = jQuery(appObject.parentNode).attr('id');
			var selectId = jQuery(jQuery('#'+parentId+'').find('select')).attr('id');
			var isBeforeHtmlExist = jQuery(appObject.parentNode).prev().html();
		if (isBeforeHtmlExist != null) {
				jQuery(appObject.parentNode).prev('b').remove();//No I18N
			}
		else {
				jQuery(appObject.parentNode).next('b').remove();//No I18N
			}
			jQuery(appObject.parentNode).remove();
			jQuery('#'+selectId+' option[value="'+spanId+'"]').remove();
		}
	}
/*------------------------------------------------ Add New Approver Level Row Start-----------------------------------------*/

function addNewApproverRow(thisRow) {
	if (document.createElement && document.childNodes) {
		var gUniqueRowID = parseInt(thisRow.id.split("_")[1]) + 1;
		var newElement = thisRow.cloneNode(true);
		newElement.id = "approverLevelRow_" + gUniqueRowID;
		thisRow.parentNode.insertBefore(newElement,thisRow.nextSibling);
		updateElementsNameForNewApproverRow(newElement, gUniqueRowID);
		jQuery('#'+newElement.id).find('SPAN,B').remove();
		reArrangeApproverLevel();
		return newElement;
	}
	return null;
}

function updateElementsNameForNewApproverRow(rowObj, newId) {
	var uvhId = null;
	for (var i = 0; i < rowObj.childNodes.length; i++) {
		if (rowObj.childNodes[i].nodeName == 'TD') {
			for (var j = 0; j < rowObj.childNodes[i].childNodes.length; j++) {
				var tags = rowObj.childNodes[i].childNodes[j];
				if (tags.nodeName == 'SELECT' || tags.nodeName == 'INPUT' || tags.nodeName == 'IMG' || tags.nodeName == 'DIV') {
					if (tags.nodeName == 'IMG') {
						var src = tags.src;
						var id = tags.id;
						if (id.indexOf("deleteLevelImg") != -1) {
							//tags.setAttribute('class','remove-items');//No I18N

							var browser = navigator.appName;
							if (browser == "Netscape") {
								tags.setAttribute('class','remove-items');//No I18N
								tags.onclick = function(event) {removeApproverRow(this);};
							}
							else {
								tags.className = 'remove-items';//No I18N
								tags.onclick = function() {removeApproverRow(this);};
							}
						}
						else if (src.indexOf("deleteicon") != -1) {
							var browser = navigator.appName;
							if (browser == "Netscape") {
								tags.onclick = function(event) {removeApproverRow(this);};
							}
							else {
								tags.onclick = function() {removeApproverRow(this);};
							}
						}

						if (tags.name != undefined && tags.name.indexOf("deleteLevelImg_") >= 0) {
							tags.name = "deleteLevelImg_" + newId;
							tags.id = "deleteLevelImg_" + newId;
						}
					}
					if (tags.name != undefined && tags.type != 'hidden') {
						tags.name = tags.name.split("_")[0] + '_' + newId;//No I18N
        	                                tags.id = tags.id.split("_")[0] + '_' + newId;//No I18N
					}
					if (tags.nodeName == 'DIV' && tags.id != undefined) {
						tags.id = tags.id.split("_")[0] + '_' + newId;//No I18N
					}

				}
			}
		}
	}
}
function removeApproverRow(theRow) {
	var tmpRow = theRow.parentNode.parentNode;

	levelNumber = tmpRow.id.split('_')[1];

	levelStatus = jQuery('#levelstatus_' + levelNumber).val();

	if (levelStatus === 'Approved' || levelStatus === 'Pending Approval' || levelStatus === 'Reject') {
		alert (getMessageForKey('ae.purchase.mlApprover.Level.delete.err',[levelNumber, levelStatus]));
		return;
	}

	for (var j = 0; j < tmpRow.childNodes.length; j++) {
		if (tmpRow.childNodes.item(j).nodeName == 'TD') {
			tmpRow.childNodes.item(j).setAttribute('bgcolor','#FF1111');
			//new Effect.Fade(tmpRow.childNodes.item(j),{duration:1.15});
		}
	}
	//new Effect.Fade(theRow,{duration:1.15});
	removePresentRow(theRow);
	reArrangeApproverLevel();
}
function removePresentRow(theRow) {
	try {
		if (document.createElement && document.childNodes) {
			if (theRow.type != 'TR') {
				var thisRow = theRow.parentNode.parentNode;
				if (thisRow.parentNode.rows != undefined && thisRow.parentNode.rows.length != 1) {
					thisRow.parentNode.removeChild(thisRow);
				}
				else if (theRow.parentNode.rows != undefined && theRow.parentNode.rows.length != 1) {
					theRow.parentNode.removeChild(theRow);
				}
			}
			else {
				theRow.parentNode.removeChild(theRow);
			}
		}
	}
	catch (e) {
		//alert(e.message); ignored
	}
	reArrangeApproverLevel();
}
function reArrangeApproverLevel() {
	var length = jQuery("table#poApprovalTable.poapproverlist tr").length;
	var childNode = jQuery("table#poApprovalTable.poapproverlist").children();
	var j = 1;
	for (var i = 0; i < length; i++) {
		childNode.children("tr:eq("+i+")").attr('id','approverLevelRow_'+j);//NO I18N
		childNode.children("tr:eq("+i+")").children("td:eq(0)").text(getMessageForKey('ae.purchase.mlApprover.Level')+" "+j);//NO I18N
		childNode.children("tr:eq("+i+")").children("td:eq(1)").find('div').attr('id','appTabList_'+j);//NO I18N
		childNode.children("tr:eq("+i+")").children("td:eq(2)").children("img:eq(0)").attr('id','addLevelImg_'+j);//NO I18N
		childNode.children("tr:eq("+i+")").children("td:eq(2)").children("img:eq(0)").attr('name','addLevelImg_'+j);//NO I18N
		childNode.children("tr:eq("+i+")").children("td:eq(2)").children("img:eq(1)").attr('id','deleteLevelImg_'+j);//NO I18N
		childNode.children("tr:eq("+i+")").children("td:eq(2)").children("img:eq(1)").attr('name','deleteLevelImg_'+j);//NO I18N
		childNode.children("tr:eq("+i+")").children("td:eq(3)").find('select').attr('id','approver_'+j);//NO I18N
		childNode.children("tr:eq("+i+")").children("td:eq(3)").find('select').attr('name','approver_'+j);//NO I18N
		childNode.children("tr:eq("+i+")").children("td:eq(4)").find('input').attr('id','condition_'+j);//NO I18N
		childNode.children("tr:eq("+i+")").children("td:eq(4)").find('input').attr('name','condition_'+j);//NO I18N
		j++;
	}
	jQuery('.poapproverlist-added').each(function(i){
	if(jQuery(this).height()>93) { jQuery(this).height('93px'); }
	if(jQuery(this).height()<31) { jQuery(this).height('31px'); }
	});
}
/*------------------------------------------------ Add New Approver Level Row Start-----------------------------------------*/

/**************************************************MLApprover scripts End****************************************************/
function getVendorCurrency(vendorId, module) {
	if (vendorId == "" && module == 'edit_product_vendor') {
			jQuery("#componentVendorCurrency").html("");//NO I18N
		}
	else if (vendorId != -1) {
			var param = "action=fetchVendorCurrency";//NO I18N
			param += "&vendorId="+vendorId;//NO I18N
			callCustomAjaxRequest("/servlet/AJaxServlet", param, fetchVendorCurrencySuccess, ajaxRequestOnFailure, module);//NO I18N
		}
	else {
			getBaseCurrency('setBaseCurrency');//No I18N
		}
	}

function fetchVendorCurrencySuccess(req, module) {
		var currencyJson = JSON.parse(req.responseText);
		var currencyId = currencyJson.currencyId;
		var currencySymbol = encodeHTML(currencyJson.currencySymbol);
		var currencyCode = currencyJson.frequentCurrencyCode;
		var exchangeRate = currencyJson.currencyExchangeRate;
		var currencyName = currencyJson.currencyName;
	if (currencySymbol != "") {
			currencySymbol = "("+currencySymbol+")";//NO I18N
		}
	if (module == "edit_product_vendor") {
			jQuery("#componentVendorCurrency").html(currencySymbol);//NO I18N
		}
	if (module == 'edit_service_vendor') {
			jQuery("#serviceVendorCurrency").html(currencySymbol);//NO I18N
		}

	else if (module == "get_vendor_details") {
			jQuery(".currencySymbolForExchange").html(currencySymbol);//NO I18N
			jQuery(".currencySymbol").html(currencySymbol);//NO I18N
			jQuery("#poCurrencyId").val(currencyId);//NO I18N
			jQuery("#poCurrency").html(currencyName+" - "+currencyCode);//NO I18N
			getBaseCurrency(currencyId,exchangeRate);
		}
	}

function getBaseCurrency(vendorCurrencyId, vendorCurrencyExchangeRate) {
		var currencyIdAndExchangeRate = vendorCurrencyId+"_"+vendorCurrencyExchangeRate;
		var param = "action=fetchBaseCurrency";//NO I18N
		callCustomAjaxRequest("/servlet/AJaxServlet", param, fetchBaseCurrencySuccess, ajaxRequestOnFailure, currencyIdAndExchangeRate);//NO I18N
	}
function fetchBaseCurrencySuccess(req, currencyIdAndExchangeRate) {
		var currencyCodeAndExchangeRateArray = currencyIdAndExchangeRate.split('_');
		var vendorCurrencyId = currencyCodeAndExchangeRateArray[0];
		var vendorCurrencyExchangeRate = currencyCodeAndExchangeRateArray[1];
		var baseCurrencyJson = JSON.parse(req.responseText);
		var baseCurrencyId = baseCurrencyJson.baseCurrencyId;
		var baseCurrencyCode = baseCurrencyJson.baseCurrencyCode;
		var baseCurrencySymbol  = baseCurrencyJson.baseCurrencySymbol;
		var baseCurrencyName = baseCurrencyJson.baseCurrencyName;
	if (vendorCurrencyId == baseCurrencyId) {
			jQuery("input#exchangeRate").val(vendorCurrencyExchangeRate);
			jQuery("#exchangeRateTitle").hide();
			jQuery("#exchangeRateValue").hide();
		}
	else if (vendorCurrencyId == 'setBaseCurrency') {
			var baseCurrencySymbol = "("+baseCurrencySymbol+")";//NO I18N
			jQuery(".currencySymbol").html(baseCurrencySymbol);//NO I18N
			jQuery("#poCurrencyId").val(baseCurrencyId);//NO I18N
			jQuery("#poCurrency").html(baseCurrencyName+" - "+baseCurrencyCode);//NO I18N
			jQuery("input#exchangeRate").val('');//NO I18N
			jQuery("#exchangeRateTitle").hide();//NO I18N
			jQuery("#exchangeRateValue").hide();//NO I18N
		}
	else {
			jQuery("#exchangeRateTitle").show();
			jQuery("#exchangeRateValue").show();
			jQuery("input#exchangeRate").val(vendorCurrencyExchangeRate);
		}
		//prePopulateRequestedItems();
	}
	/*function getAssociatedExchangeRate(vendorCurrencycode)
	{
		var param = "action=fetchAssociatedExchangeRate";//NO I18N
		param += "&currencySymbol="+currencySymbol;//NO I18N
		callCustomAjaxRequest("/servlet/AJaxServlet", param, fetchAssociatedExchangeRateSuccess, ajaxRequestOnFailure, "fetch_ExchangeRate");//NO I18N
	}
	function fetchAssociatedExchangeRateSuccess(req)
	{
		var result = req.responseText;
		jQuery("input#exchangeRate").val(result);
	}
	
	function getCurrencyDetails(currencySymbolObject)
	{
		var currencySymbol = jQuery(currencySymbolObject).val();
		var currency = "("+currencySymbol+")";
		jQuery(".currencySymbol").html(currency);//NO I18N
		getAssociatedExchangeRate(currencySymbol);
	}*/
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 	
function addNewFrequentCurrency() {
	showURLInDialog('CurrencyConfig.do?operation=addCurrency','modal=yes,closeButton=no,position=absmiddle');//No I18N
}
function editCurrency(currencyId, requestFrom) {
	showURLInDialog('CurrencyConfig.do?operation=editCurrency&currencyId='+currencyId+"&requestFrom="+requestFrom,'modal=yes,closeButton=no,position=absmiddle');//No I18N
}
function ajaxRequestOnFailure(requestObj, module) {
	alert(requestObj.responseText);
}
function fillCurrencySymbol(currencyIdObj) {
	if (currencyIdObj != -1) {
		var param = "operation=fetchCurrencySymbol&currencyId="+currencyIdObj;//NO I18N
		callCustomAjaxRequest('/CurrencyConfig.do', param, currencyOperation, ajaxRequestOnFailure, 'fetchCurrencySymbol'); //NO I18n
	}
	else {
		jQuery('#currencySymbol').val("");
	}
}
function currencyOperation(req, operation) {
	if (operation == 'fetchCurrencySymbol') {
		var currencySymbol = req.responseText;
		if (currencySymbol == 'null') {
			currencySymbol = '';
		}
		jQuery('#currencySymbol').val(currencySymbol);
	}
}
function validateReceiveItemsForm(form) {
	var serTagCheckArray = new Array();
	var itemSelected = false;
	var chkboxs = document.getElementsByName('productextid');
	if(isMSP && document.getElementById('siteId').value == "-1") {
		alert(getMessageForKey("sdp.msp.admin.requesterImportWiz.selectsite"));
		return false;
	}

	for (var i = 0; i < chkboxs.length; i++) {
		if (chkboxs[i].checked) {
			itemSelected = true;
			break;
		}
	}
	if (!itemSelected) {
		if (document.getElementById('workstationProduct') != undefined) {
			showBaloonToolTip('workstationProduct',getMessageForKey('sdp.purchase.addNew.item.jsItemErr'));//No I18N
		}
		else if (document.getElementById('assetProduct') != undefined) {
			showBaloonToolTip('assetProduct',getMessageForKey('sdp.purchase.addNew.item.jsItemErr'));//No I18N
		}
		else if (document.getElementById('softwareProduct') != undefined) {
			showBaloonToolTip('softwareProduct',getMessageForKey('sdp.purchase.addNew.item.jsItemErr'));//No I18N
		}
		else if (document.getElementById('serviceProduct') != undefined) {
			showBaloonToolTip('serviceProduct',getMessageForKey('sdp.purchase.addNew.item.jsItemErr'));//No I18N
		}
		else if (document.getElementById('otherProduct') != undefined) {
			showBaloonToolTip('otherProduct',getMessageForKey('sdp.purchase.addNew.item.jsItemErr'));//No I18N
		}
		return false;
	}
	for (var j = 0; j < chkboxs.length; j++) {
		if (chkboxs[j].checked) {
			var currentValue = document.getElementById('quantity_' + chkboxs[j].value).value;//No I18N
			var tableID = jQuery('#quantity_' + chkboxs[j].value).closest('table').attr('id');//No I18N
			var error = false;
			if ((tableID == 'workstationTable' || tableID == 'assetTable' || tableID == 'softwareTable') && (trim(currentValue) == '' || !isPositiveInteger(currentValue) || currentValue <= 0)) {
				error = true;
			}
			else if ((tableID == 'serviceTable' || tableID == 'othersTable') && (trim(currentValue) == '' || currentValue <= 0)) {
				error = true;
			}
			else if ((tableID == 'serviceTable' || tableID == 'othersTable') && (trim(currentValue) == '' || isDouble(currentValue) == false)) {
				error = true;
			}
			if (error) {
				showBaloonToolTip('quantity_' + chkboxs[j].value,  getMessageForKey('sdp.purchase.addNew.item.jsQuantityErr'));//No I18N
				return false;
			}
			var originalValue = document.getElementById('orgQuantity_' + chkboxs[j].value).value;//No I18N
			//Since the data are string type, converting it as number using parseInt()
			originalValue = parseInt(originalValue);
			currentValue = parseInt(currentValue);
			if (originalValue < currentValue) {
				showBaloonToolTip('quantity_' + chkboxs[j].value,  getMessageForKey('sdp.purchase.quantity.checkvalidation'));//No I18N
				return false;
			}
			if (document.getElementById('servicetag_' + chkboxs[j].value) != undefined && document.getElementById('servicetag_' + chkboxs[j].value).value != null && document.getElementById('servicetag_' + chkboxs[j].value).value != getMessageForKey("ae.purchase.receive.ws&server.servicetag")) {
				var serviceTagStr = document.getElementById('servicetag_' + chkboxs[j].value).value;
				var serviceTags = serviceTagStr.split(",");
				for (var k = 0; k < serviceTags.length; k++) {
					if (serviceTags[k] == '') {
						showBaloonToolTip('servicetag_'+chkboxs[j].value,getMessageForKey('ae.purchase.receive.inBetween.emptyServiceTagCheck'));//No I18N
						return false;
					}
					if (jQuery.inArray(serviceTags[k].toUpperCase(), serTagCheckArray) > -1) {
						showBaloonToolTip('servicetag_'+chkboxs[j].value,getMessageForKey('ae.purchase.receive.distinctServiceTag'));//No I18N
						return false;
					}
					else {
						serTagCheckArray[k] = serviceTags[k].toUpperCase();
					}
				}
				if (serviceTags.length > currentValue) {
					showBaloonToolTip('servicetag_'+chkboxs[j].value,getMessageForKey('ae.purchase.receive.servicetagCount.errorMessage'));//No I18N
					return false;
				}
				var param = "action=serTagCheckForReceive";//No I18N
				param += "&serTags="+serviceTagStr;//No I18N
				callSjaxRequest('/servlet/AJaxServlet',param);//No I18N
				if (srequestOne.responseText != '') {
					//var duplicateSerTags = srequestOne.responseText;
					showBaloonToolTip('servicetag_'+chkboxs[j].value,getMessageForKey('ae.purchase.receive.duplicateServiceTag'));//No I18N
					return false;
				}
			}

			var typeOfLicense = jQuery('[name="typeOfLicense_' + chkboxs[j].value + '"]:checked').val();

			if (typeOfLicense == 'standard') {
				if (document.getElementById('licenseType_' + chkboxs[j].value) != undefined) {
					if (document.getElementById('licenseType_' + chkboxs[j].value).value == -1) {
						if (!jQuery('.morelicence').is(":visible")) {
							openAddNewLicenseSection(document.getElementById('licencedetails_' + chkboxs[j].value));
						}
						showBaloonToolTip('licenseType_' + chkboxs[j].value,  getMessageForKey('sdp.admin.software.licensetype.choosetypetodel'));//No I18N
						return false;
					}
					if (document.getElementById('licenseOption_' + chkboxs[j].value).value == -1) {
						if (!jQuery('.morelicence').is(":visible")) {
							openAddNewLicenseSection(document.getElementById('licencedetails_' + chkboxs[j].value));
						}
						showBaloonToolTip('licenseOption_' + chkboxs[j].value,  getMessageForKey('sdp.inventory.swLicense.selectLicenseOptionjsError'));//No I18N
						return false;
					}
					if (!document.getElementById('licenseCount_' + chkboxs[j].value).readOnly) {
						if (!isPositiveInteger(document.getElementById('licenseCount_' + chkboxs[j].value).value) || parseInt(document.getElementById('licenseCount_' + chkboxs[j].value).value) <= 0) {
							if (!jQuery('.morelicence').is(":visible")) {
								openAddNewLicenseSection(document.getElementById('licencedetails_' + chkboxs[j].value));
							}
							showBaloonToolTip('licenseCount_' + chkboxs[j].value,  getMessageForKey('sdp.license.allocate.validinstallationcount'));//No I18N
							return false;
						}
					}
				}
			}
			else if (typeOfLicense == 'upgrade') {
				var $licensedSoftwares = jQuery('select[id^="licensedSoftware_' + chkboxs[j].value + '"]:visible');

			 	var isUpgradeSoftwareSelected = false;

				$licensedSoftwares.each(function () {
					if (this.value != '-1') {
						isUpgradeSoftwareSelected = true;
					}
				});

				if (!isUpgradeSoftwareSelected) {
					alert(getMessageForKey('ae.purchase.receive.renew.software.license.upgradedfrom'));
					return false;
				}
				var licensedSoftwareEntered = true;
				$licensedSoftwares.each(function () {
					if (this.value != '-1') {
						if (jQuery('#alreadyPurchased' + this.id.split('licensedSoftware')[1]).val() == '') {
							showBaloonToolTip('alreadyPurchased' + this.id.split('licensedSoftware')[1],  getMessageForKey('ae.software.choose.already.purchased.license'));//No I18N
							licensedSoftwareEntered=false;
						}
					}
				});
				if(!licensedSoftwareEntered){
					return false;
				}
				var $licensesList = jQuery('tr[id^="rowIndex_' + chkboxs[j].value + '"]');

				/*$licensesList.each(function()
				{
					if( jQuery('#' + this.id + ':visible').length == 0 )
					{
						jQuery('#' + this.id).remove();
					}
					else if( trim(jQuery('#installAllowed_' + this.id.split('rowIndex_')[1]).val()) == '' )
					{
						jQuery('#' + this.id).remove();
					}
				});	*/
			}
			else if (typeOfLicense == 'renewal' && originalValue != currentValue) {
				var $licensedSoftwares = jQuery('input[id^="purchasedLicense_' + chkboxs[j].value + '"]:visible');

				$licensedSoftwares.each(function () {
					if (this.value == '') {
						if (jQuery('#purchasedLicense' + this.id.split('purchasedLicense')[1]).val() == '') {
							showBaloonToolTip('purchasedLicense' + this.id.split('purchasedLicense')[1],  getMessageForKey('ae.software.choose.already.purchased.license'));//No I18N
							return false;
						}
					}
				});

				var $licensesList = jQuery('tr[id^="renewal_row_' + chkboxs[j].value + '"]');

				$licensesList.each(function () {
					if (jQuery('#' + this.id + ':visible').length == 0) {
						jQuery('#' + this.id).remove();
					}
					else if (trim(jQuery('#installAllowed_' + this.id.split('rowIndex_')[1]).val()) == '') {
						jQuery('#' + this.id).remove();
					}
				});
			}

			if (document.getElementById('servicetag_' + chkboxs[j].value) != undefined && document.getElementById('servicetag_' + chkboxs[j].value).value == getMessageForKey('ae.purchase.receive.ws&server.servicetag')) {

				// If No service tag is given by user then need to remove the default message of service tag text area.
				document.getElementById('servicetag_' + chkboxs[j].value).value = "";
			}
		}
	}
	var param = constructParameters(document.ReceiveItemsForm);
	param += '&module=received_items&poID=' + document.ReceiveItemsForm.poID.value;//NO I18N

	if(isMSP){
		param += '&persistAccountID=false&persistentAccountId=' + document.ReceiveItemsForm.persistentAccountId.value;//NO I18N
	}

	var $inputTags = jQuery('input[name^="oldLicense_"]');

	$inputTags.each(function () {
		param += "&" + this.name + "=" + this.value;//NO I18N
	});

	var $installAllowed = jQuery('input[name^="installAllowed_"]');

	$installAllowed.each(function () {
		param += "&" + this.name + "=" + this.value;//NO I18N
	});
	callLoadingIcon('addReceivePOLoading',getMessageForKey('ae.purchase.receivePO.progress.indicator'));//No I18N
	jQuery('#submitbutton').hide();
	jQuery('#cancelbutton').hide();
	callCustomAjaxRequest('/PurchaseOrder.do', param, receivePOItems, ajaxRequestOnFailure, document.ReceiveItemsForm.poID.value);//No I18N
	return false;
}

function receivePOItems(req, poID) {
	var xmlDoc = req.responseXML.childNodes[0];
	var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;
	if (status == '200') {
		window.opener.document.getElementById('statusText').innerHTML = xmlDoc.childNodes[1].childNodes[0].nodeValue;
		if (xmlDoc.childNodes[1].childNodes[0].nodeValue == 'Closed' || xmlDoc.childNodes[1].childNodes[0].nodeValue == 'Partially Received' || xmlDoc.childNodes[1].childNodes[0].nodeValue == 'Items Received') {
			if (xmlDoc.childNodes[2] != undefined && xmlDoc.childNodes[2].childNodes[0].nodeValue == 'true') {
				var countOfConflictWS = xmlDoc.childNodes[3].childNodes[0].nodeValue;
				openReconcileWindow(poID,'receiveConflict',countOfConflictWS);//NO I18N
			}
			else {
				//parent.closeDialog();
				//window.opener.location.reload();
				opener.viewPurchaseOrder(poID, null, true);
				self.close();
				//window.location.reload();

				//var message = getMessageForKey("ae.purchase.receivePO.fullSuccessMessage");
				//showSuccessMessageAndClose(null,message,4000);
				//parent.refreshWindow();
			}
		}
	}
	else if (status == '300') {
		document.getElementById('addReceivePOLoading').innerHTML= '';
		document.getElementById('received_Exception_message').innerHTML=xmlDoc.childNodes[1].childNodes[0].nodeValue;
		document.getElementById('received_Exception_tr').style.display = '';
	}
	else {
		//parent.showFailureMessageAndClose(getMessageForKey("sdp.purchase.poreceive.errorunabletoreceiveitem"),1500);
		document.getElementById('addReceivePOLoading').innerHTML= '';
		document.getElementById('received_Exception_message').innerHTML=getMessageForKey("sdp.purchase.poreceive.errorunabletoreceiveitem") + ' : ' + xmlDoc.childNodes[1].childNodes[0].nodeValue;//No I18N
		document.getElementById('received_Exception_tr').style.display = '';
	}
	jQuery('#submitbutton').show();//NO I18N
	jQuery('#cancelbutton').show();//NO I18N
}
function areaControl(elementID) {
	var elementDOM = document.getElementById(elementID);
	if (elementDOM.style.height <= "29px") {
		elementDOM.style.height = "60px";
		elementDOM.style.overflow ="auto";
	}
	else {
		elementDOM.style.height = "29px";
		elementDOM.style.overflow ="hidden";
	}
}

function emptyItem(ele) {
	if (jQuery('#' + ele).val() == trim(getMessageForKey('ae.purchase.receive.ws&server.servicetag'))) {
		jQuery('#'+ele).val('');//No I18N
		jQuery('#'+ele).removeClass('fontgray');//No I18N
	}
	jQuery('#'+ele).css('height','40px');//No I18N
}
function showItem(ele) {
	if (jQuery('#' + ele).val() == '') {
		jQuery('#'+ele).val(getMessageForKey('ae.purchase.receive.ws&server.servicetag'));//No I18N
		jQuery('#'+ele).addClass('fontgray');//No I18N
	}
	jQuery('#'+ele).css('height','22px');//No I18N
}

function selectAllCheckBox(checkbox, checkBoxId) {
	toSelectAll = false;
	if (checkbox.checked) {
		toSelectAll = true;
	}
	var chkboxs = document.getElementsByName('productextid');
	for (var i = 0; i < chkboxs.length; i++) {
		if (chkboxs[i].id.indexOf(checkBoxId) == 0) {
			chkboxs[i].checked = toSelectAll;
		}
	}
}
function updateLicenseOptionsForPO(purchaseorderitemid) {
	var url = "/servlet/AJaxServlet";//No I18N
	var param = "action=fetchLicenseOption&licenseTypeId=" + document.getElementById('licenseType_' + purchaseorderitemid).value;//No I18N
	callCustomAjaxRequestForGET(url,param, fetchLicenseOptionsRequestSuccess, ajaxRequestOnFailure, purchaseorderitemid);
}
function fetchLicenseOptionsRequestSuccess(req, purchaseorderitemid) {
	document.getElementById('licenseCount_' + purchaseorderitemid).value = '';//No I18N
	document.getElementById('licenseCount_' + purchaseorderitemid).removeAttribute('readOnly');

	var swOptionsObj = req.responseXML.getElementsByTagName("SoftwareLicenseOptions");
	var licenseOptionValue = document.getElementById('licenseOption_' + purchaseorderitemid);

	AssetUtil.removeAllOptionTags(licenseOptionValue);

	if (swOptionsObj.length > 0) {
		for (i = 1; i <= swOptionsObj.length; i++) {
			licenseOptionValue.options[i] = new Option(swOptionsObj[i-1].getAttribute('optionname'), swOptionsObj[i-1].getAttribute("licenseoptionid"));
		}
	}

	var swLicenseType = req.responseXML.getElementsByTagName("SoftwareInstallationTypes");
	var swComplianceType = req.responseXML.getElementsByTagName("SoftwareComplianceTracking");

	var installationTypeId = null;

	if (swLicenseType[0] != undefined && swComplianceType[0].getAttribute('trackby') == 'Workstation') {
		installationTypeId = swLicenseType[0].getAttribute('name');
	}
	else if (swLicenseType[0] != undefined && swComplianceType[0].getAttribute('trackby') == 'User') {
		var userAccess = req.responseXML.getElementsByTagName('SoftwareUserAccessTypes');
		installationTypeId = userAccess[0].getAttribute('name');
	}

	if( installationTypeId == 'Single' || installationTypeId == 'OEM' ) //Single or OEM
	{
		document.getElementById('licenseCount_' + purchaseorderitemid).value = '1';//No I18N
		document.getElementById('licenseCount_' + purchaseorderitemid).setAttribute('readOnly', 'true');
	}
	else if (installationTypeId == 'Unlimited') {
		document.getElementById('licenseCount_' + purchaseorderitemid).value = 'Unlimited';//No I18N
		document.getElementById('licenseCount_' + purchaseorderitemid).setAttribute('readOnly', 'true');
	}
	else {
		document.getElementById('licenseCount_' + purchaseorderitemid).value = '1';//No I18N
		document.getElementById('licenseCount_' + purchaseorderitemid).removeAttribute('readOnly');
	}
}
function showHideInstallationInput(selectTag, purchaseorderitemid) {
	var noOfInstallations = document.getElementById("licenseCount_" + purchaseorderitemid);

	var optionValue = selectTag.options[selectTag.options.selectedIndex].innerHTML;

	if( optionValue == 'Per Processor' ) //Per Processor license
	{
		noOfInstallations.setAttribute('readOnly', 'true');
		//Don't try to convert this value as i18n key bcoz its hard coded in server side
		noOfInstallations.value = "Unlimited"; //NO I18N
	}
	else if (optionValue == 'Per Mailbox' || optionValue == 'Per Seat - User' || optionValue == 'Per Seat - Device' || optionValue == 'Per Server') {
		noOfInstallations.removeAttribute('readOnly');
		noOfInstallations.value = "";
	}
}
function checkServiceTagAvailability(id) {
	if (trim(document.getElementById('servicetag_' + id).value) == '' || document.getElementById('servicetag_' + id).value == getMessageForKey('ae.purchase.receive.ws&server.servicetag')) {
		document.getElementById('enableSerTagAsBarcode_'+id).checked='';
		showBaloonToolTip('servicetag_'+id,getMessageForKey('ae.purchase.receive.ws&server.emptyServiceTagCheck'));//No I18N
	}
}

function reOrderLicenseList(poLotId) {
	var selectedOption = jQuery('[name="typeOfLicense_' + poLotId + '"]:checked').val();

	if (selectedOption == 'upgrade' || selectedOption == 'renewal') {
		var orginalQuantity = parseInt(jQuery('#orgQuantity_' + poLotId).val());
		var requiredQuantity = parseInt(jQuery('#quantity_' + poLotId).val());

		if (requiredQuantity < 0) {
			requiredQuantity = orginalQuantity
			jQuery('#quantity_' + poLotId).val(orginalQuantity);
		}

		if (requiredQuantity <= orginalQuantity) {
			for (i = 1; i <= orginalQuantity; i++) {
				jQuery('#rowIndex_' + poLotId + '_' + i).show();
			}
			for (i = 1; i <= orginalQuantity; i++) {
				jQuery('#renewal_row_' + poLotId + '_' + i).show();
			}

			var rowsToHide = (orginalQuantity - requiredQuantity);

			if (rowsToHide != orginalQuantity) {
				for (i = orginalQuantity; i > (orginalQuantity - rowsToHide); i--) {
					jQuery('#rowIndex_' + poLotId + '_' + i).hide();
				}
				for (i = orginalQuantity; i > (orginalQuantity - rowsToHide); i--) {
					jQuery('#renewal_row_' + poLotId + '_' + i).hide();
				}
			}
			else {
				jQuery('#quantity_' + poLotId).val(orginalQuantity);
			}
		}
		else if (requiredQuantity > orginalQuantity) {
			jQuery('#quantity_' + poLotId).val(orginalQuantity);
		}
	}
}

function showSelectedSection(sectionId) {
	poextid = sectionId.split('_');
	if(poextid[1]=='UpgLicence'){
		jQuery('#' + sectionId).show();//NO I18N
	}
	else{
		jQuery('#Rec_UpgLicence_' + poextid[2]+'_'+poextid[3]).hide();//NO I18N
	}

	//jQuery('#Renew-Licence').hide();//No I18N

}

function showDD(imgObj) {
	var obj = imgObj.closest('tr').attr('id');//No I18N
	var index = imgObj.closest('tr');//No I18N
	var Level = index[0].sectionRowIndex + 1;
	var aId = imgObj.parent().parent().parent().find('select').attr('id');
	var condition = imgObj.parent().parent().parent().find('input').val();
	var appIds = [];

	levelNumber = obj.split('_')[1];

	levelStatus = jQuery('#levelstatus_' + levelNumber).val();

	if (levelStatus === 'Pending Approval' || levelStatus === 'Rejected' || levelStatus === "Approved") {
		alert (getMessageForKey('ae.purchase.mlApprover.LevelApprover.add.err',[levelStatus]));
		return;
	}
	jQuery('#' + aId + ' option').each(function (i) {
				appIds[i]=jQuery(this).val();
			});
	var allOtherSelectedAppId = [];
	jQuery('#poApprovalTable option').each(function (j) {
				allOtherSelectedAppId[j]=jQuery(this).val();
			});
	var total = parseFloat(document.getElementById("totalvalue").value);

	if (document.getElementById('exchangeRate') != undefined) {
		var poExchangeRate = 0;
		poExchangeRate = parseFloat(document.getElementById('exchangeRate').value);
		total = total/poExchangeRate;
	}
	var url = '/purchase/POApproverPop-up.jsp?date='+new Date().getMilliseconds()+'&totalCost='+total+'&id='+obj+'&LevelNo='+Level+'&appIds='+appIds+'&allOtherSelectedAppId='+allOtherSelectedAppId+'&condition='+condition;//NO I18N

	if(isMSP) {
		var purchaseAccount = getAccountId();
		if(purchaseAccount == "0") {
			var prSite = document.purchaseRequest.site.value;
			if(prSite == "-1") {
				alert(getMessageForKey("sdp.msp.selectSite.error"));
				return;
			}
			else {
				url +='&siteId='+prSite;//NO I18N
			}
		}
		else {
			url +='&persistentAccountId='+getAccountId();//NO I18N
		}
	}

	showURLInDialog(url,'modal=yes,closeButton=no,width=700,position=relative');//No I18N
}

function postApproverUpdate() {
	var selectObj = document.getElementById('approver_1');
	if (selectObj && selectObj.length > 0) {
		var len = selectObj.length;
		var count = 0;
		for (i = 0; i < len; i++) {
			if (apprIDList != null) {
				var id = selectObj[i].value;
				for (k = 0; k < apprIDList.length; k++) {
					if (apprIDList[k] == id) {
						var hasEmail = apprIDMailList[k];
						if (hasEmail == 1) {
							if (document.getElementById("noApproversWithMail") != undefined) {
								document.getElementById("noApproversWithMail").value=1;
							}
							count++;
							return;
						}
					}
				}
			}
		}
		if (count == 0) {
			if (document.getElementById("noApproversWithMail") != undefined) {
				document.getElementById("noApproversWithMail").value=0;
			}
		}
	}
}

function addNextLevel(trObj) {
	var newTrObj =  addNewApproverRow(trObj);//No I18N
	removeNextLevelValues(newTrObj);
}

function removeNextLevelValues(newTrObj) {
	jQuery('#'+newTrObj.id+'').find('option').remove();
	jQuery('#'+newTrObj.id+'').find('input').val('');
}

function deleteIndividualPO(poId) {
	var param = 'module=delete_po';//No I18N

	if (poId != null) {
		param += '&checkbox=' + poId;//No I18N
	}
	else {
		return;
	}

	if (confirm(getMessageForKey('sdp.purchase.delete.confirm'))) {
		loadnextpo = jQuery( "#taskview-sidebar-row-" + poId ).next();

		if (!loadnextpo.length) {
			loadnextpo = jQuery( "#taskview-sidebar-row-" + poId ).prev();
		}

		//this case is occurs when the po is deleted from details page and that po is not in the summary list.
		if (!loadnextpo.length) {
			loadnextpo = jQuery("#taskview-sidebar-list").children().first();
		}

		displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.file.delete.progress.msg'), false);//NO I18n
		callCustomAjaxRequest("/PurchaseOrder.do", param, handlePurchaseOrder , ajaxRequestOnFailure, 'delete_po');//NO I18N
	}

}

var canCreatePORole;
function deletePurchaseRequest(requestId, canCreatePO) {
	canCreatePORole = canCreatePO;
	var param = 'task=deletePR';//No I18N
	if (requestId == null || requestId == undefined) {
		var isPRSelected = false;

		jQuery("[name='purchaseRequestList']").each(function(){
			if (this.checked) {
				param += '&requestIds=' + this.value;//No I18N
				isPRSelected = true;
			}
		});

		if (!isPRSelected) {
			alert(getMessageForKey('sdp.purchase.request.choose.todelete'));
			return false;
		}
	}
	else {
		param += '&requestIds=' + requestId;//No I18N
	}

	if (confirm(getMessageForKey('sdp.purchase.request.delete.confirm'))) {
		loadnextpr = jQuery( "#taskview-sidebar-row-" + requestId ).next();

		if (!loadnextpr.length) {
			loadnextpr = jQuery( "#taskview-sidebar-row-" + requestId ).prev();
		}

		displayLoadingInformation(null, getMessageForKey('sdp.admin.backup.file.delete.progress.msg'), false);//NO I18n
		callCustomAjaxRequest("/PurchaseRequest.do", param, handlePurchaseRequest, ajaxRequestOnFailure, 'delete_pr');//NO I18N	
	}
}

function handlePurchaseOrder(response, operation) {
	if (operation == 'delete_po') {
		jQuery('#loadingdivid').remove();//NO I18N

		var xmlDoc = response.responseXML.childNodes[0];

		var status = xmlDoc.childNodes[0].childNodes[0].nodeValue;

		if (status == '200') {
			displayLoadingInformation("/images/discoverystatus_discovered.gif", getMessageForKey('sdp.admin.common.deletedsuccessfully'), true, 3000);//NO I18N
			if (jQuery("#taskview-sidebar-list").length) {
				if (loadnextpo.length) {
					nextpoid = loadnextpo.attr('id').replace( /^\D+/g, '');
					viewPurchaseOrder( nextpoid );
				}

				if (jQuery("#taskview-sidebar-list").children().length == 1) {
					document.location='PurchaseOrderList.do?PORTALID='+PORTALID;
				}
				else {
					$prList.refreshSideBarView();
				}

			}
			else {
				$prList.refreshSideBarView();
			}
		}
		else {
			displayLoadingInformation("/images/deleteMail.gif", getMessageForKey('sdp.purchase.delete.errormsg')  , true, 5000);//NO I18N
		}
	}
}
function loadsimilarrequest(response, operation) {
	similarrequestcount = parseInt( response.responseText );

	if (operation == 'addpurchaserequest') {
		if (similarrequestcount > 0) {
			jQuery("#similarprrequest").removeClass('hide');
		}
	}
	else {
		if (similarrequestcount == 0) {
			jQuery("#similarprrequest").addClass('hide');
		}
	}
}
function handlePurchaseRequest(response, operation) {
	if (operation == 'delete_pr') {
		jQuery('#loadingdivid').remove();//NO I18N

		if (response.responseText == 'success') {
			if (canCreatePORole != undefined && canCreatePORole) {
				callCustomAjaxRequest("/PurchaseRequest.do", 'task=similarrequest' , loadsimilarrequest , ajaxRequestOnFailure);//NO I18N
			}
			displayLoadingInformation("/images/discoverystatus_discovered.gif", getMessageForKey('sdp.admin.common.deletedsuccessfully'), true, 3000);//NO I18N
			if (jQuery("#taskview-sidebar-list").length) {
				if (loadnextpr.length) {
					nextprid = loadnextpr.attr( 'id' ).replace( /^\D+/g, '' );
					showPRDetails( nextprid );
				}

				if (jQuery("#taskview-sidebar-list").children().length == 1) {
					document.location='PurchaseOrderList.do?PORTALID='+PORTALID;
				}
				else {
					$prList.refreshSideBarView();
				}

			}
			else {
				$prList.refreshSideBarView();
			}
		}
		else {
			displayLoadingInformation("/images/deleteMail.gif", getMessageForKey('sdp.purchase.request.unableto.delete'), true, 5000);//NO I18N
		}
	}
}

function enablePOApprovalSection(approvalCheckbox) {
	if (approvalCheckbox.checked) {
		//jQuery('#FreezeLayer').remove();
		jQuery('#poApprovalTable').show();//NO I18N
	}
	else {
		//freezePage('poApprovalTable');//NO I18N
		jQuery('#poApprovalTable').hide();//NO I18N
	}
}

function validatePOList() {
	var isPOSelected = false;

	jQuery('[name=purchaseOrderList]').each(function () {
		if (this.checked) {
			isPOSelected = true;
		}
	});

	if (!isPOSelected) {
		alert(getMessageForKey('sdp.purchase.listView.deleteConformErr'));
	}

	return isPOSelected;
}

function setStyleForPOMenuAction() {
	jQuery('#nav-actions>li:first').on('click', function(){
		jQuery(this).find('ul').toggle();
	});
	jQuery('#nav-actions>li:first').on('mouseenter', function(){
	}).on('mouseleave', function(){
		jQuery('#nav-actions>li:first>ul').hide();
	});
}

function setActionComboMenuForPO() {
	jQuery('.menubar .actionscombo').ActionsComboMenu({animSpeed: 100});
}


//This code is in the AssetDefaultConfig.jsp to be moved in this js any error occurs use this set of code in AssetDefaultConfig.jsp
//code line 5516 to 6106 
// to enable/disable the checkbox
function changeNotificationIcon(notType, displayId, displayRow) {
	if (displayId != null) {
		AssetshowMe(displayId,displayRow,notType);
	}
	if (notType == "notifyAssetWarrantyExpiry") {
		validateValuesOnChangeNotification("notifyAssetWExpiry_EmailIDsList", "errorNotifyAssetWarrantyExpiry", "errorNotifyAssetWarrantyExpiryEmailIDs", "errorNotifyAssetWarrantyExpiryDays","errorNotifyAssetWarrantyExpiryAfter","errorNotifyAssetWarrantyExpiryFrequency"); //no I18N
	}
	else if (notType == "notifyAssetExpiry") {
		validateValuesOnChangeNotification("notifyAssetExpiry_EmailIDsList", "errorNotifyAssetExpiry", "errorNotifyAssetExpiryEmailIDs", "errorNotifyAssetExpiryDays","errorNotifyAssetExpiryAfter","errorNotifyAssetExpiryFrequency"); //no I18N
	}
	else if (notType == "notifyAuditChanges") {
		validateValuesOnChangeNotification("notifyAuditChanges_EmailIDsList", "errorNotifyAuditChanges", "errorNotifyAuditChangesEmailIDs"); //no I18N
	}
	else if (notType == "notifySWUnderCompliance") {
		validateValuesOnChangeNotification("notifySWUnderCompliance_EmailIDsList", "errorNotifySWUnderCompliance", "errorNotifySWUnderComplianceEmailIDs"); //no I18N
	}
	else if (notType == "notifyProhibitedSoftware") {
		validateValuesOnChangeNotification("notifyProhibitedSoftware_EmailIDsList", "errorNotifyProhibitedSoftware", "errorNotifyProhibitedSoftwareEmailIDs"); //no I18N
	}
	else if (notType == "notifyLeaseExpiry") {
		validateValuesOnChangeNotification("notifyLeaseExpiry_EmailIDsList", "errorNotifyLeaseExpiry", "errorNotifyLeaseExpiryEmailIDs", "errorNotifyLeaseExpiryDays","errorNotifyLeaseExpiryAfter","errorNotifyLeaseExpiryFrequency"); //no I18N
	}
	else if (notType == "notifyThresholdCountCrossover") {
		validateValuesOnChangeNotification("notifyThresholdCountCrossover_EmailIDsList", "errorNotifyAssetReplenishmentTechs", "errorNotifyAssetReplenishmentMailIDs", null); //no I18N
	}
	else if (notType == "notifySccmFailure") {
        validateValuesOnChangeNotification("notifySccmFailure_EmailIDsList", "errorNotifySccmFailure", "errorNotifySccmFailureEmailIDs"); //no I18N
    }
    else if (notType == "notifySolarwindsFailure") {
        validateValuesOnChangeNotification("notifySolarwindsFailure_EmailIDsList", "errorNotifySolarwindsFailure", "errorNotifySolarwindsFailureEmailIDs"); //no I18N
    }
}

function callAjaxToChangeNotificationTab(id) {
	var modules = ['asset_notif','purchase_notif','contract_notif','report_notif'];//No I18N
	for (var i = 0; i < modules.length; i++) {
		if (document.getElementById(modules[i] + "_tab") == null) {
			continue;
		}
		if (id == modules[i]) {
			document.getElementById(id).className = "show"; // No I18N
			document.getElementById(id+"_tab").className = "subtabon"; // No I18N
		}
		else {
			document.getElementById(modules[i]).className = "hide"; // No I18N
			document.getElementById(modules[i]+"_tab").className = "subtaboff"; // No I18N
		}
	}
	if (id == "asset_notif") {
		jQuery("iframe[name=NotFrame]").attr("src","/setup/AssetNotifications.jsp");//NO I18N
	}
	else if (id == "purchase_notif") {
		jQuery("iframe[name=NotFrame]").attr("src","/setup/PurchaseNotifications.jsp");//NO I18N
	}
	else if (id == "contract_notif") {
		jQuery("iframe[name=NotFrame]").attr("src","/setup/ContractNotifications.jsp");//NO I18N
	}else if(id == "report_notif")// no i18n
	{
		jQuery("iframe[name=NotFrame]").attr("src","/setup/ReportNotifications.jsp"); //NO I18N
		ResourceLoader({js: [ "/scripts/reports.js"]});//No i18n
	}
}
function AssetshowMe(displayId, displayRow, notType) {
        var checkboxs = document.getElementById(notType);
        var enable = "none"; //No I18N
	if (checkboxs.checked) {
                enable = "";
        }
        document.getElementById(displayId).style.display = enable;
	if (displayRow != null) {
                document.getElementById(displayRow).style.display = enable;
        }
    }

function AssetvalidateInput(form, isITPortal, isRemote, isAssetBuild) {
	     var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    //After the reset operation, when the save button is clicked here we are setting the checked value for the UDF fields based on the image. This because during the reset operation even we are setting the clicked value and corresponding image for the UDF fields. But the value is reverted by the existing reset operation but the image won't change. Hence setting the checked value based on the image.
	if (resetted == true) {
		    var addFieldCount=document.getElementById("addFieldCount").value;
		if (addFieldCount > 0) {
			    var addField=document.getElementById("addField").value;
			    var addFieldArray=addField.split(",");
			for (i = 0; i < addFieldCount; i++) {
				    var addUDFField=addFieldArray[i];
				    var img_Str=document.getElementById(addUDFField+"_IMG").src;
				    var str = img_Str.match("checked_yes.gif");
				if (str != null && str == "checked_yes.gif") {
					    document.getElementById(addUDFField).checked=true;
				    }
			    }
		    }
	    }

	    defModule = document.AssetDefaultConfigDefForm.defModule.value;
	if (defModule != null) {
		if (defModule == "purDefconfig") {
			if (form.property6.value != "") {
				if (!checknumber(form.property6)) {
					    form.property6.focus();
					    return false;
				    }
			    }
			if (form.pocustomID.value.trim() == "") {
				    form.pocustomID.value = form.pocustomID.value.trim();
				    form.pocustomID.focus();
				    alert( getMessageForKey("sdp.admin.purchasedefault.defaultcurrency.enterStartFrom") );
				    return false;
			    }
			else if (form.pocustomID.value.trim() != "") {
				if (!checknumber(form.pocustomID)) {
					    form.pocustomID.focus();
					    return false;
				    }
			    }
		    }
		else if (defModule == "assetNotDefconfig") {
			    var check = true;

			    if(isITPortal) {
			    if(document.getElementById('notifyAuditChanges').checked==true ) //No I18N
			    {

				    var tech_List = document.getElementById('notifyAuditChanges_TechList').value.trim(); //No I18N
				    var emailids_List = document.getElementById('notifyAuditChanges_EmailIDsList').value.trim(); //No I18N
				    var checktemp = validateValuesForNotification(tech_List, emailids_List, "notifyAuditChanges_TechList", "notifyAuditChanges_EmailIDsList", "errorNotifyAuditChanges", "errorNotifyAuditChangesEmailIDs", null, null); //No I18N
					if (checktemp != true) {
					    check = checktemp;
				    }
			    }

			    if(document.getElementById('notifySWUnderCompliance').checked==true ) //No I18N
			    {
				    var tech_List=document.getElementById('notifySWUnderCompliance_TechList').value.trim(); //No I18N
				    var emailids_List = document.getElementById('notifySWUnderCompliance_EmailIDsList').value.trim(); //No I18N
				    var checktemp = validateValuesForNotification(tech_List, emailids_List, "notifySWUnderCompliance_TechList", "notifySWUnderCompliance_EmailIDsList", "errorNotifySWUnderCompliance", "errorNotifySWUnderComplianceEmailIDs", null, null); //No I18N
					if (checktemp != true) {
					    check = checktemp;
				    }
			    }

			    if(document.getElementById('notifyProhibitedSoftware').checked==true ) //No I18N
			    {
				    var tech_List=document.getElementById('notifyProhibitedSoftware_TechList').value.trim(); //No I18N
				    var emailids_List = document.getElementById('notifyProhibitedSoftware_EmailIDsList').value.trim(); //No I18N
				    var checktemp = validateValuesForNotification(tech_List, emailids_List, "notifyProhibitedSoftware_TechList", "notifyProhibitedSoftware_EmailIDsList", "errorNotifyProhibitedSoftware", "errorNotifyProhibitedSoftwareEmailIDs"); //No I18N
					if (checktemp != true) {
					    check = checktemp;
				    }
			    }
			    }
			    if(!isRemote) {
			    if(document.getElementById('notifyLeaseExpiry').checked == true) //No I18N
			    {
				    var notifyBefore = document.getElementById('notifyLeaseExpiryBefore').value.trim(); //No I18N
				    var notifyBeforeDays = Number(notifyBefore);
				    var notifyLeaseExpiryAfter = document.getElementById('notifyLeaseExpiryAfter').value.trim(); //No I18N
				    if(notifyLeaseExpiryAfter.length>0){
				    var notifyLeaseExpiryAfterDays = Number(notifyLeaseExpiryAfter);
				    	}
				    var notifyLeaseExpiryFrequency = document.getElementById('notifyLeaseExpiryFrequency').value.trim(); //No I18N
				    if(notifyLeaseExpiryFrequency.length>0){
				    var notifyLeaseExpiryFrequencyDays = Number(notifyLeaseExpiryFrequency);
				    	}

				    var tech_List=document.getElementById('notifyLeaseExpiry_TechList').value.trim(); //No I18N
				    var emailids_List = document.getElementById('notifyLeaseExpiry_EmailIDsList').value.trim(); //No I18N
				    var checktemp = validateValuesForNotification(tech_List, emailids_List, "notifyLeaseExpiry_TechList", "notifyLeaseExpiry_EmailIDsList", "errorNotifyLeaseExpiry", "errorNotifyLeaseExpiryEmailIDs", notifyBeforeDays, "notifyLeaseExpiryBefore", "errorNotifyLeaseExpiryDays",notifyLeaseExpiryAfterDays,"notifyLeaseExpiryAfter","errorNotifyLeaseExpiryAfter",notifyLeaseExpiryFrequencyDays,"notifyLeaseExpiryFrequency","errorNotifyLeaseExpiryFrequency"); //No I18N
					if (checktemp != true) {
					    check = checktemp;
				    }
			    }
				if (document.getElementById('notifyThresholdCountCrossover').checked == true) //No I18N
				{
					var tech_List = document.getElementById('notifyThresholdCountCrossover_TechList').value.trim(); //No I18N
					var emailids_List = document.getElementById('notifyThresholdCountCrossover_EmailIDsList').value.trim(); //No I18N
					var checktemp = validateValuesForNotification(tech_List, emailids_List, "notifyThresholdCountCrossover_TechList", "notifyThresholdCountCrossover_EmailIDsList", "errorNotifyAssetReplenishmentTechs", "errorNotifyAssetReplenishmentMailIDs", null, null, null); //NO I18N
					if (checktemp != true) {
						check = checktemp;
					}
				}
			    }
			    if(document.getElementById('notifyAssetWarrantyExpiry').checked == true) //No I18N
			    {
				    var notifyBefore = document.getElementById('notifyAssetWarrantyExpiryBefore').value.trim(); //No I18N
				    var notifyBeforedays = Number(notifyBefore);
				    var notifyAssetWarrantyExpiryAfter = document.getElementById('notifyAssetWarrantyExpiryAfter').value.trim(); //No I18N
				    if(notifyAssetWarrantyExpiryAfter.length>0){
					    var notifyAssetWarrantyExpiryAfterDays = Number(notifyAssetWarrantyExpiryAfter);
					    }
				    var notifyAssetWarrantyExpiryFrequency = document.getElementById('notifyAssetWarrantyExpiryFrequency').value.trim(); //No I18N
				    if(notifyAssetWarrantyExpiryFrequency.length>0){
					    var notifyAssetWarrantyExpiryFrequencyDays = Number(notifyAssetWarrantyExpiryFrequency);
					    	}

				    var tech_List = document.getElementById('notifyAssetWExpiry_TechList').value.trim(); //No I18N
				    var emailids_List = document.getElementById('notifyAssetWExpiry_EmailIDsList').value.trim(); //No I18N
				    var checktemp = validateValuesForNotification(tech_List, emailids_List, "notifyAssetWExpiry_TechList", "notifyAssetWExpiry_EmailIDsList", "errorNotifyAssetWarrantyExpiry", "errorNotifyAssetWarrantyExpiryEmailIDs", notifyBeforedays, "notifyAssetWarrantyExpiryBefore", "errorNotifyAssetWarrantyExpiryDays",notifyAssetWarrantyExpiryAfterDays, "notifyAssetWarrantyExpiryAfter", "errorNotifyAssetWarrantyExpiryDaysAfter",notifyAssetWarrantyExpiryFrequencyDays,"notifyAssetWarrantyExpiryFrequency","errorNotifyAssetWarrantyExpiryFrequency"); //NO I18N
				if (checktemp != true) {
					    check = checktemp;
				    }
			    }
			    if(document.getElementById('notifyAssetExpiry').checked == true) //No I18N
			    {
				    var tech_List = document.getElementById('notifyAssetExpiry_TechList').value.trim(); //No I18N
				    var emailids_List = document.getElementById('notifyAssetExpiry_EmailIDsList').value.trim(); //No I18N
				    var notifyBefore = document.getElementById('notifyAssetExpiryBefore').value.trim(); //No I18N
				    var notifyBeforedays = Number(notifyBefore);
				    var notifyAssetExpiryAfter = document.getElementById('notifyAssetExpiryAfter').value.trim(); //No I18N
				    if(notifyAssetExpiryAfter.length>0){
					    var notifyAssetExpiryAfterDays = Number(notifyAssetExpiryAfter);
					    }
				    var notifyAssetExpiryFrequency = document.getElementById('notifyAssetExpiryFrequency').value.trim(); //No I18N
				    if(notifyAssetExpiryFrequency.length>0){
					    var notifyAssetExpiryFrequencyDays = Number(notifyAssetExpiryFrequency);
					    	}

				    var checktemp = false;
				    checktemp = validateValuesForNotification(tech_List, emailids_List, "notifyAssetExpiry_TechList", "notifyAssetExpiry_EmailIDsList", "errorNotifyAssetExpiry", "errorNotifyAssetExpiryEmailIDs", notifyBeforedays, "notifyAssetExpiryBefore", "errorNotifyAssetExpiryDays",notifyAssetExpiryAfterDays,"notifyAssetExpiryAfter", "errorNotifyAssetExpiryDaysAfter",notifyAssetExpiryFrequencyDays,"notifyAssetExpiryFrequency","errorNotifyAssetExpiryFrequency"); // NO I18N
				if (checktemp != true) {
					    check = checktemp;
				    }
			    }
			    if (document.getElementById('notifySccmFailure').checked == true) //No I18N
                {
                    var tech_List = document.getElementById('notifySccmFailure_TechList').value.trim(); //No I18N
                    var emailids_List = document.getElementById('notifySccmFailure_EmailIDsList').value.trim(); //No I18N
                    var checktemp = validateValuesForNotification(tech_List, emailids_List, "notifySccmFailure_TechList", "notifySccmFailure_EmailIDsList", "errorNotifySccmFailure", "errorNotifySccmFailureEmailIDs", null, null); //No I18N
                    if (checktemp != true) {
                        check = checktemp;
                    }
                }
                if (document.getElementById('notifySolarwindsFailure').checked == true) //No I18N
                {
                    var tech_List = document.getElementById('notifySolarwindsFailure_TechList').value.trim(); //No I18N
                    var emailids_List = document.getElementById('notifySolarwindsFailure_EmailIDsList').value.trim(); //No I18N
                    var checktemp = validateValuesForNotification(tech_List, emailids_List, "notifySolarwindsFailure_TechList", "notifySolarwindsFailure_EmailIDsList", "errorNotifySolarwindsFailure", "errorNotifySolarwindsFailureEmailIDs", null, null); //No I18N
                    if (checktemp != true) {
                        check = checktemp;
                    }
                }
      if(!isAssetBuild){
			    if(document.getElementById('notifyBookingAllocateAsset').checked == true) //No I18N
			    {
				    var notifyBefore = document.getElementById('notifyBookingAllocateBefore').value.trim(); //No I18N
				    var notifyBeforeDays = Number(notifyBefore);
				    var checktemp = false;
					if(notifyBeforeDays != null)
					{
						var min_days = 1; var max_days = 5;
						var errorNotifyBefore = 'notifyBookingAllocateHours';//No I18N
						var message = getMessageForKey("booking.notification.allocate.hours.error");
						if(notifyBeforeDays == '' || notifyBeforeDays < min_days || notifyBeforeDays > max_days )
						{
							document.getElementById(errorNotifyBefore).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red>" + message + "</font>"; //NO I18N
							document.getElementById(errorNotifyBefore).focus();
						}
						else
						{
							document.getElementById(errorNotifyBefore).innerHTML = "";
							checktemp = true;
						}
					}
				    if(checktemp != true)
				    {
					    check = checktemp;
				    }
			    }
			}
			    var formName = jQuery('#assetForm').val();
			if (formName == "assetForm") {
				if (check) {
					callAjaxToSubmitData("assetForm", true, isITPortal, isRemote, isAssetBuild); //No I18N
					    check = false;
				    }
			    }
			    return check;
		    }
	    }
}

//tech_List means the selected technicians list,
 /**
  * emailids_List means selected emailids list
  * tech_List_ID means element id of the select2 in html
  * emailids_List_ID means element id of the textarea in html
  */
function validateValuesForNotification(tech_List, emailids_List, tech_List_ID, emailids_List_ID, errortech_List_ID, erroremailids_List_ID, notifyBeforeDays, notifyBefore, errorNotifyBefore, notifyAfterDays, notifyAfter, errorNotifyAfter, notifyFrequencyDays, notifyFrequency, errorNotifyFrequency) {
	var check = true;

	if (tech_List == "" && emailids_List == "") {
		document.getElementById(errortech_List_ID).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red>" + getMessageForKey("sdp.admin.notification.error.assetnotification.notechnician") + "</font>"; //no I18N
		document.getElementById(erroremailids_List_ID).innerHTML = "";
		document.getElementById(tech_List_ID).focus();
		check = false;
	}
	else if (emailids_List != "") {
		var emailcheckWrongEmails = validateEmailIDs(emailids_List);
		var emailCheck = emailcheckWrongEmails[0];
		var wrongEmailIDs = emailcheckWrongEmails[1];
		var numberOfValidEmails = emailcheckWrongEmails[2];
		var numberOfValidEmailIdsCheck = emailcheckWrongEmails[3];
		var duplicateEmailIDsCheck = emailcheckWrongEmails[4];
		var duplicateEmailIDs = emailcheckWrongEmails[5];
		var nonDuplicateEmailIDs = emailcheckWrongEmails[6];

		check = emailCheck;
		if (!emailCheck) {
			if (tech_List === "") {
				if (numberOfValidEmailIdsCheck) {

					document.getElementById(erroremailids_List_ID).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red > <b><i> " + encodeHTML(wrongEmailIDs.substring(0, wrongEmailIDs.length - 2)) + " </i></b> " + getMessageForKey("sdp.admin.notification.validemailerror") + " </font>";
					document.getElementById(errortech_List_ID).innerHTML = "";
					document.getElementById(emailids_List_ID).focus();
				}
				else {
					if (numberOfValidEmails < 1) {
						document.getElementById(errortech_List_ID).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red>" + getMessageForKey("sdp.admin.notification.error.assetnotification.notechnician") + "</font>";
						if (wrongEmailIDs.length > 0) {
							document.getElementById(erroremailids_List_ID).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red > <b><i> " + encodeHTML(wrongEmailIDs.substring(0, wrongEmailIDs.length - 2)) + " </i></b> " + getMessageForKey("sdp.admin.notification.validemailerror") + " </font>";
						}
						else {
							document.getElementById(erroremailids_List_ID).innerHTML = "";
						}
						document.getElementById(tech_List_ID).focus();
					}
					else if (numberOfValidEmails > 25) {
						document.getElementById(errortech_List_ID).innerHTML = "";
						document.getElementById(erroremailids_List_ID).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red > " + getMessageForKey("sdp.admin.notification.numberofvalidemaildsexceeded") + " </font>";
						document.getElementById(emailids_List_ID).focus();
					}
				}
			}
			else {
				document.getElementById(errortech_List_ID).innerHTML = "";
				if (numberOfValidEmailIdsCheck) {
					document.getElementById(erroremailids_List_ID).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red > <b><i> " + encodeHTML(wrongEmailIDs.substring(0, wrongEmailIDs.length - 2)) + " </i></b> " + getMessageForKey("sdp.admin.notification.validemailerror") + " </font>";
					document.getElementById(emailids_List_ID).focus();
				}
				else {
					if (numberOfValidEmails < 1) {
						if (wrongEmailIDs.length > 0) {
							document.getElementById(erroremailids_List_ID).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red > <b><i> " + encodeHTML(wrongEmailIDs.substring(0, wrongEmailIDs.length - 2)) + " </i></b> " + getMessageForKey("sdp.admin.notification.validemailerror") + " </font>";
							document.getElementById(emailids_List_ID).focus();
						}
						else {
							check = true;
						}
					}
					else if (numberOfValidEmails > 25) {
						document.getElementById(erroremailids_List_ID).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red > " + getMessageForKey("sdp.admin.notification.numberofvalidemaildsexceeded") + " </font>";
						document.getElementById(emailids_List_ID).focus();
					}
				}
			}
		}
		else {
			document.getElementById(errortech_List_ID).innerHTML = "";
			document.getElementById(erroremailids_List_ID).innerHTML = "";
		}
		if (check && !duplicateEmailIDsCheck) {
			document.getElementById(erroremailids_List_ID).innerHTML= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red ><b><i> " + duplicateEmailIDs + "</i></b> &nbsp;" + getMessageForKey("sdp.admin.notification.duplicateemailidspresent") + "</font>";
			document.getElementById(emailids_List_ID).focus();
			check = false;
		}
	}
	else {
		document.getElementById(errortech_List_ID).innerHTML = "";
		document.getElementById(erroremailids_List_ID).innerHTML = "";
	}
	if (notifyBeforeDays != null && errorNotifyBefore != null && notifyBefore != null) {
		var min_days = 1;
		var message = getMessageForKey("sdp.admin.notification.loan.notifybefore");

		if (notifyBeforeDays == '' || notifyBeforeDays < min_days || notifyBeforeDays > 90) {
			document.getElementById(errorNotifyBefore).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red>" + message + "</font>"; //NO I18N
			document.getElementById(notifyBefore).focus();
			check = false;
		}
		else {
			document.getElementById(errorNotifyBefore).innerHTML = "";
		}
	}
	if (notifyAfterDays != null && errorNotifyAfter != null && notifyAfter != null) {
		var min_days = 1;
		var message = getMessageForKey("sdp.admin.notification.loan.notifybefore");

		if (notifyAfterDays == '' || notifyAfterDays < min_days || notifyAfterDays > 90) {
			document.getElementById(errorNotifyAfter).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red>" + message + "</font>"; //NO I18N
			document.getElementById(notifyAfter).focus();
			check = false;
		}
		else {
			document.getElementById(errorNotifyAfter).innerHTML = "";
		}
	}
	else if (errorNotifyAfter != null) {
		document.getElementById(errorNotifyAfter).innerHTML = "";
	}
	if (notifyFrequencyDays != null && errorNotifyFrequency != null && notifyFrequency != null) {
		var min_days = 1;
		if (notifyFrequencyDays == '' || notifyFrequencyDays < min_days || notifyFrequencyDays > 90) {
			var message = getMessageForKey("sdp.admin.notification.loan.notifybefore");
			document.getElementById(errorNotifyFrequency).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red>" + message + "</font>"; //NO I18N
			document.getElementById(notifyFrequency).focus();
			check = false;
		}
		else if (notifyFrequencyDays > notifyBeforeDays) {
			var message = getMessageForKey("notification.frequncy.error");
			document.getElementById(errorNotifyFrequency).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red>" + message + "</font>"; //NO I18N
			document.getElementById(notifyFrequency).focus();
			check = false;
		}
		else {
			document.getElementById(errorNotifyFrequency).innerHTML = "";
		}
	}
	else if (errorNotifyFrequency != null) {
		document.getElementById(errorNotifyFrequency).innerHTML = "";
	}
	return check;
}

//--------------------------------------------------------------------------------------grouped for one purpose. used for AssetNotification.jsp
function validateValuesOnChangeNotification(emailIDs_List_ID, errorTech_List, errorEmailIDs_List, errorNotifyBefore) {
	document.getElementById(errorTech_List).innerHTML = "";
	if (errorNotifyBefore != null) {
		document.getElementById(errorNotifyBefore).innerHTML = "";
	}

	var emailidslist = document.getElementsByName(emailIDs_List_ID)[0].value.trim();
	if (emailidslist == "") {
		document.getElementById(errorEmailIDs_List).innerHTML = "";
	}
	else {
		var emailcheckWrongEmailIDs = validateEmailIDs(emailidslist);
		var emailCheck = emailcheckWrongEmailIDs[0];
		var wrongEmailIDs = emailcheckWrongEmailIDs[1];
		var numberOfValidEmails = emailcheckWrongEmailIDs[2];
		var numberOfValidEmailIdsCheck = emailcheckWrongEmailIDs[3];

		if (!emailCheck) {
			document.getElementById(errorEmailIDs_List).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red><b><i>" + encodeHTML(wrongEmailIDs.substring(0, wrongEmailIDs.length - 2 )) + "</i></b> " + getMessageForKey("sdp.admin.notification.validemailerror") + "</font>";
			if (!numberOfValidEmailIdsCheck && numberOfValidEmails > 25) {
				document.getElementById(errorEmailIDs_List).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = red>" + getMessageForKey("sdp.admin.notification.numberofvalidemaildsexceeded") + " </font>";
			}
			else if (wrongEmailIDs.length === 0) {
				document.getElementById(errorEmailIDs_List).innerHTML = "";
			}
		}
		else {
			document.getElementById(errorEmailIDs_List).innerHTML = "";
		}
	}
	var element = document.getElementById(emailIDs_List_ID);
	textAreaAutoResize(element);
}

function validateEmailIDs(emailids) {
	var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	
	var email_ID_Array = emailids.split(",");
	var emailCheck = true;
	var numberOfValidEmailIds = 0;
	var numberOfValidEmailIdsCheck = true;
	var wrongEmailIDs = '';

	var duplicateEmailIDsCheck = true;
	var nonDuplicateEmailIDs = new Array();
	var duplicateEmailIDs = new Array();
	for (var i = 0; i < email_ID_Array.length; i++) {
		email_ID_Array[i] = email_ID_Array[i].trim();
		if (email_ID_Array[i].length > 0) {
			if (!re.test(email_ID_Array[i])) {
				emailCheck = false;
				wrongEmailIDs =  wrongEmailIDs + email_ID_Array[i] + ", "  ;
			}
			else {
				if (nonDuplicateEmailIDs.indexOf(email_ID_Array[i]) === -1) {
					nonDuplicateEmailIDs.push(email_ID_Array[i]);
				}
				else {
					duplicateEmailIDs.push(email_ID_Array[i]);
					duplicateEmailIDsCheck = false;
				}
				numberOfValidEmailIds = numberOfValidEmailIds + 1;
			}
		}
	}
	if (wrongEmailIDs.length > 0) {
		emailCheck = false;
	}
	if (numberOfValidEmailIds > 25 || numberOfValidEmailIds < 1) {
		numberOfValidEmailIdsCheck = false;
		emailCheck = false;
	}
	return [emailCheck, wrongEmailIDs, numberOfValidEmailIds, numberOfValidEmailIdsCheck, duplicateEmailIDsCheck, duplicateEmailIDs, nonDuplicateEmailIDs];
}

function applyValues(selectedElements, selectedEmailIDs, selectedNotifyBefore, selectedNotifyAfter, selectedNotifyFrequency, tech_List_ID, emailIDs_List_ID, notifyBefore_ElementID, notifyAfter_ElementID, notifyFrequency_ElementID) {
if( selectedElements !== '')
	{
	var params = {
				element : tech_List_ID,
				multiple : true,
				placeHolder: getMessageForKey("sdp.admin.notificationrules.notifytechnician.select2placeholder"),
				value : selectedElements,
				formatSearching : getMessageForKey("ae.common.search.fetchtechnicians"),
				showNameOnly : false,
				searchOptions : ["name","email"]	// No I18N

			};
	technicianSelect.initializeSelect2(params);

	// 	updateSelect2Dropdown_AssetNotifications(tech_List_ID,  getMessageForKey("sdp.admin.notificationrules.notifytechnician.select2placeholder"), true, true, "getTechnicians", getMessageForKey("sdp.admin.notificationrules.notifytechnician.select2nomatchesfound"), getMessageForKey("sdp.admin.notificationrules.notifytechnician.select2notechniciansfound")); //NO I18N
		var x = jQuery('.select2-container-multi .select2-choices .select2-search-field input');
		var xlength = x.length;
		var index;
		for(index = 0; index < xlength; index++) {
			var eachelement = jQuery('.select2-container-multi .select2-choices .select2-search-field input:eq('+ index + ')');
					var eachelementcss = eachelement.css('width'); //NO I18N
			if (eachelementcss === '0px') {
						eachelement.css('width', '150%'); //NO I18N
					}
			else {
						eachelement.css('width', '150%'); //NO I18N
					}
					}
					}
	if (notifyBefore_ElementID != null) {
						updateNotifyBeforeToAcceptNumbers(notifyBefore_ElementID);
						jQuery('#' + notifyBefore_ElementID).val(selectedNotifyBefore);
					}
	if (notifyAfter_ElementID != null) {
						updateNotifyBeforeToAcceptNumbers(notifyAfter_ElementID);
						jQuery('#' + notifyAfter_ElementID).val(selectedNotifyAfter);
					}
	if (notifyFrequency_ElementID != null) {
						updateNotifyBeforeToAcceptNumbers(notifyFrequency_ElementID);
						jQuery('#' + notifyFrequency_ElementID).val(selectedNotifyFrequency);
					}
if(emailIDs_List_ID !== '') {
	if (selectedEmailIDs != null) {
						jQuery('#' + emailIDs_List_ID).val(' ' + selectedEmailIDs);
					}
	else {
						jQuery('#' + emailIDs_List_ID).val(' ');
					}
					updateTextResize(emailIDs_List_ID);
		}
}

function textAreaAutoResize(element) {
	element.style.height = "1px";
	element.style.height = (element.scrollHeight + 6 ) + "px";
}

function textAreaAutoResizeFirstTime(isITPortal, isRemote) {
	if (isITPortal) {
		var element = document.getElementById('notifyAuditChanges_EmailIDsList');
		textAreaAutoResize(element);
		element = document.getElementById('notifySWUnderCompliance_EmailIDsList');
		textAreaAutoResize(element);
		element = document.getElementById('notifyProhibitedSoftware_EmailIDsList');
		textAreaAutoResize(element);
	}
	if(!isRemote){
		var element = document.getElementById('notifyLeaseExpiry_EmailIDsList');
		textAreaAutoResize(element);
		element = document.getElementById('notifyAssetWExpiry_EmailIDsList');
		textAreaAutoResize(element);
		element = document.getElementById('notifyAssetExpiry_EmailIDsList');
		textAreaAutoResize(element);
	}
}

function updateTextResize(id) {
	var element = document.getElementById(id);
	element.style.width = '90.05%';
	element.style.resize = "none"; //no I18N
	jQuery("#" + id).on('focusin', function(){
		jQuery(this).css("border-width","1px"); //no I18N

	});
	jQuery("#" + id).on('focusout', function(){
		jQuery(this).css("border-width","1px"); //no I18N
	});
}

function updateNotifyBeforeToAcceptNumbers(id) {
	allowNumbers(id);
}


//This method will set checked value and corresponding image for the UDF fields based on the current value in DB for the
//reset operation.
function fillMandatoryFields() {

	var addFieldCount=document.getElementById("addFieldCount").value;

	if (addFieldCount > 0) {
		var selectedFields=document.getElementById("selectedFields").value;
		var count=document.getElementById("selectedFieldsCount").value;
		var addField=document.getElementById("addField").value;
		var selectedFieldsArray=selectedFields.split(",");
		var addFieldArray=addField.split(",");

		for (var j = 0; j < count; j++) {
			var udfField=selectedFieldsArray[j];
			if (document.getElementById(udfField) != null) {
				document.getElementById(udfField).checked=true;
			}
		}
	}
}


function resetPOMandatoryFields() {
	fillMandatoryFields();
	resetted=true;
}


function showhideApproval(gName) {
	var selRowObj = jQuery('#OHT_'+gName);
	var text = jQuery('#OHIST_'+gName);
	if (selRowObj.attr('class') == 'hide') {
		selRowObj.attr('class','show');
		text.html("<span class=\"cspr circle-arrow-down icon-sm\"></span>");
	}
	else if (selRowObj.attr('class') == 'show') {
		selRowObj.attr('class','hide');
		text.html("<span class=\"cspr circle-arrow-up icon-sm tf-rot90\"></span>");
	}
	else if (selRowObj.attr('class') == '') {
		selRowObj.attr('class','show');
		text.html("<span class=\"cspr circle-arrow-down icon-sm\"></span>");
	}
}

//POGeneralItemList.jsp script Start

// Remove item row
function removePOItemRow(obj) {
	var decision = confirm(getMessageForKey("ae.po.items.delete.confirm"));
	if (decision) {
		var trId = jQuery(obj).closest('tr').attr('id');//NO I18N
		jQuery('.sdp-glyph-trash-fill').closest('tr#'+trId).find('.po-items-ui select').select2('destroy').end().remove();//NO I18N
		if (jQuery('#product_table').find('.po-new-item-row').length <= 0) {
			jQuery('tr#noitemsfound').removeClass('hide');
		}
		if ((mode == 'edit' && jQuery('#product_table').children('tr').length == 2) || (mode != 'edit' && jQuery('#product_table').children('tr').length == 3)) {
			addNewPOItemRow();
		}
		poCalculation();
		jQuery('.po-new-item-row').each(function (index) {
			index = index+1;
			jQuery(this).attr('id', 'POItemRow_'+index);
			jQuery(this).find('select.item-category').attr('id','itemCategorySelect_'+index);
			jQuery(this).find("input[id^='itemCategorySelect_']").attr('id','itemCategorySelect_'+index);
			jQuery(this).find("div[id^='s2id_itemCategorySelect']").attr('id','s2id_itemCategorySelect_'+index);


			jQuery(this).find("input[id^='otherSelect']").attr('id','otherSelect_'+index);
			jQuery(this).find("textarea[id^='otherTextArea']").attr('id','otherTextArea_'+index);

			jQuery(this).find("div[id^='s2id_serviceSelect']").attr('id','s2id_serviceSelect_'+index);
			jQuery(this).find("input[id^='serviceSelect']").attr('id','serviceSelect_'+index);
			jQuery(this).find("textarea[id^='serviceTextArea']").attr('id','serviceTextArea_'+index);

			jQuery(this).find("div[id^='s2id_componentTypeSelect']").attr('id','s2id_componentTypeSelect_'+index);
			jQuery(this).find("input[id^='componentTypeSelect']").attr('id','componentTypeSelect_'+index);
			jQuery(this).find("div[id^='s2id_componentSelect']").attr('id','s2id_componentSelect'+index);
			jQuery(this).find("input[id^='componentSelect']").attr('id','componentSelect_'+index);
			jQuery(this).find("textarea[id^='assetTextArea']").attr('id','assetTextArea_'+index);


			jQuery(this).find("input[id^='itemPartNo']").attr('id','itemPartNo_'+index);
			jQuery(this).find("input[id^='itemInputPartNo']").attr('id','itemInputPartNo_'+index);

			jQuery(this).find("input[id^='itemPrice']").attr('id','itemPrice_'+index);
			jQuery(this).find("input[id^='itemTaxRate']").attr('id','itemTaxRate_'+index);
			jQuery(this).find("input[id^='itemQuantity']").attr('id','itemQuantity_'+index);
			jQuery(this).find("input[id^='itemAmount']").attr('id','itemAmount_'+index);
			jQuery(this).find("td").each(function (i) {
				i = i+1;
				var trid = jQuery(this).closest('tr').attr('id')//NO I18N
				jQuery(this).attr('id', trid+'_Td_'+i);
			});
		});

	}
}

// Add new row in PO Item code
function addNewPOItemRow() {
	var err = false;
	var isVendor = false;
	var id = null;
	var message = null;
	var requestItems = new Array();
	var isSelect2field = false;
	if (jQuery('#vendorID').val() == -1) {
		alert(getMessageForKey("ae.po.vendor.checkonaddnewitem"));
	}
	else {
		jQuery('#product_table tr.po-new-item-row').each(function (i) {
				var rowId = jQuery(this).attr('id');
				var idNum = rowId.split('_');
				var index = idNum[1];
			var category = jQuery(this).find('#itemCategorySelect_' + index).val();
			if(category == '' )
			{
				category = trim(jQuery(this).find('#itemCategorySelect_' + index).text());
			}
			if (category == '-1' || category == '' || category == '--Select Category--' ) {
					err = true;
					isSelect2field = true;
					id = "itemCategorySelect_"+index;//NO I18N
					message = getMessageForKey("ae.po.formvalidation.itemcategory");
				}
			else if (category == 'Assets' && jQuery('#componentTypeSelect_' + index).val() == -1) {
					err = true;
					isSelect2field = true;
					id = "componentTypeSelect_"+index;//NO I18N
					message = getMessageForKey("ae.barcode.formValidation.productType");
				}
			else if (category == 'Assets' && trim(jQuery('#componentSelect_' + index).val()) == '') {
					err = true;
					isSelect2field = true;
					id = "componentSelect_"+index;//NO I18N
					message = getMessageForKey("ae.barcode.formValidation.product");
				}
			else if (category == 'Services' && trim(jQuery('#serviceSelect_' + index).val()) == '') {
					err = true;
					isSelect2field = true;
					id = "serviceSelect_"+index;//NO I18N
					message = getMessageForKey("ae.admin.vendor.validation.servicename.jserr");
				}
			else if (category == 'Others' && trim(jQuery('#otherSelect_' + index).val()) == '') {
					err = true;
					id = "otherSelect_"+index;//NO I18N
					message = getMessageForKey("ae.po.formvalidation.othercategorytext");
				}
			else if (jQuery('#itemPrice_' + index).val() == '') {
					err = true;
					id = "itemPrice_"+index;//NO I18N
					message = getMessageForKey("ae.po.formvalidation.itemprice");
				}
			else if (jQuery('#itemTaxRate_' + index).val() == '') {
					err = true;
					id = "itemTaxRate_"+index;//NO I18N
					message = getMessageForKey("ae.po.formvalidation.taxrate");
				}
			else if (category == 'Assets' && (trim(jQuery('#itemQuantity_' + index).val()) == '' || (jQuery('#itemQuantity_' + index).val()).indexOf(".") != -1 || !isPositiveInteger(jQuery('#itemQuantity_' + index).val()) || parseInt(jQuery('#itemQuantity_' + index).val(), 10).toString() == '0')) {
			    	err = true;
			    	id = "itemTaxRate_"+index;//NO I18N
					message = getMessageForKey("ae.po.formvalidation.quantity");
			    }
			else if ((category == 'Services' || category == 'Others') && (trim(jQuery('#itemQuantity_' + index).val()) == '' || isDouble(jQuery('#itemQuantity_' + index).val()) == false )) {
			    	err = true;
			    	id = "itemQuantity_"+index;//NO I18N
					message = getMessageForKey("ae.po.formvalidation.quantity");
			    }
				//For checking duplicate item start
			if (!err) {
				if (category == 'Assets') {
					if (requestItems.indexOf(jQuery('#componentSelect_' + index).val().trim().toLowerCase()) == -1) {
				    		requestItems.push(jQuery('#componentSelect_'+index).val().trim().toLowerCase());
						}
					else {
				    		message = getMessageForKey("ae.po.duplicateitemname.errmsg");
					    	err = true;
					    	isSelect2field = true;
							id = "componentSelect_"+index;//NO I18N
				    	}
				    }
				else if (category == 'Services') {
					if (requestItems.indexOf(jQuery('#serviceSelect_' + index).val().trim().toLowerCase()) == -1) {
				    		requestItems.push(jQuery('#serviceSelect_'+index).val().trim().toLowerCase());
						}
					else {
				    		message = getMessageForKey("ae.po.duplicateitemname.errmsg");
					    	err = true;
					    	isSelect2field = true;
							id = "serviceSelect_"+index;//NO I18N
				    	}
				    }
				else if (category == 'Others') {
					if (requestItems.indexOf(jQuery('#otherSelect_' + index).val().trim().toLowerCase()) == -1) {
				    		requestItems.push(jQuery('#otherSelect_'+index).val().trim().toLowerCase());
						}
					else {
				    		message = getMessageForKey("ae.po.duplicateitemname.errmsg");
					    	err = true;
							id = "otherSelect_"+index;//NO I18N
				    	}
				    }
				}
				    //For checking duplicate item start

			});
		if (jQuery(this).find('select').length == 1) {
			if (jQuery(this).find('.item-category-field select').val() == '-1') {
					err = true;
				}
			}

		if (err) {
			alert(message);
			if (isSelect2field) {
				jQuery('#'+id).select2('focus');
			}
			else {
				jQuery('#'+id).trigger('focus');
			}
		}
		else {
			jQuery('tr#noitemsfound').addClass('hide');
			var a = jQuery('#po-item-row-copy').clone();
			jQuery('#po-item-new-link').before(a).prev().attr('class','po-new-item-row').find('.po-items-ui select').select2();
		}

		jQuery('.po-new-item-row').each(function (index) {
			index = index+1;
			jQuery(this).attr('id', 'POItemRow_'+index);
			jQuery(this).find("td").each(function (index) {
				index = index+1;
				var trid = jQuery(this).closest('tr').attr('id')//NO I18N
				jQuery(this).attr('id', trid+'_Td_'+index);
			});
			jQuery(this).find('.item-category').attr('id', 'itemCategorySelect_' + index);
			if (jQuery('#itemCategorySelect_' + index).data('select2') == undefined) {
				updateSelect2ForItemCategory(index);
			}
			jQuery(this).find('#itemPartNo').attr('id', 'itemPartNo_' + index);
			jQuery(this).find('#itemPrice').attr('id', 'itemPrice_' + index);
			jQuery(this).find('#itemTaxRate').attr('id', 'itemTaxRate_' + index);
			jQuery(this).find('#itemQuantity').attr('id', 'itemQuantity_' + index);
			jQuery(this).find('#itemReceivedQuantity').attr('id', 'itemReceivedQuantity_' + index);
			jQuery(this).find('#itemAmount').attr('id', 'itemAmount_' + index);
		});
	}
	    jQuery('[sdpJs="js-event-POGeneralItemList-6"]').on("blur",function() { checkItemPrice(this);});
		jQuery('[sdpJs="js-event-POGeneralItemList-13"]').on("blur",function() { checkItemPrice(this);});
		jQuery('[sdpJs="js-event-POGeneralItemList-20"]').on("blur",function() { checkItemPrice(this);});
		jQuery('[sdpJs="js-event-POGeneralItemList-7"]').on("blur",function() { checkItemTaxRate(this);});
		jQuery('[sdpJs="js-event-POGeneralItemList-14"]').on("blur",function() { checkItemTaxRate(this);});
		jQuery('[sdpJs="js-event-POGeneralItemList-21"]').on("blur",function() { checkItemTaxRate(this);});
		jQuery('[sdpJs="js-event-POGeneralItemList-8"]').on("blur",function() { checkItemQuantity(this);});
		jQuery('[sdpJs="js-event-POGeneralItemList-15"]').on("blur",function() { checkItemQuantity(this);});
		jQuery('[sdpJs="js-event-POGeneralItemList-22"]').on("blur",function() { checkItemQuantity(this);});
		jQuery('[sdpJs="js-event-POGeneralItemList-4"]').off("click.podelete").on("click.podelete", function(event) { removePOItemRow(this); }); //NO I18N
		jQuery('[sdpJs="js-event-POGeneralItemList-11"]').off("click.podelete").on("click.podelete", function(event) { removePOItemRow(this); }); //NO I18N
		jQuery('[sdpJs="js-event-POGeneralItemList-18"]').off("click.podelete").on("click.podelete", function(event) { removePOItemRow(this); }); //NO I18N
		
}

function selectInit(id,selector) {
	jQuery(id).on('change',function() {
		onPartNoChange(id);
		if (jQuery(id).val() != -1) {
			var value = jQuery(this).closest(selector).find('.select2-container .select2-choice .select2-chosen').text() || 'no value';//NO I18N
			jQuery(this).closest(selector).find('input[data-id=sel-input-field]').val(value);
		}
    });
    jQuery(selector).on('click',function() {
        jQuery(this).closest(selector).find(id).select2('close').end()//NO I18N
        .find('input[data-id=sel-input-field]').trigger('focus');

    })
    jQuery('body').on('click','[data-id=sel-click]',function(e) {
        e.stopPropagation();
        jQuery(this).closest(selector).find(id).select2('open');//NO I18N
    });
    jQuery(id).on('select2-open', function(e) {
    	jQuery(this).closest(selector).find('.input-group-addon').addClass('up-arrow-fill');
      });
    jQuery(id).on('select2-close', function(e) {
    	jQuery(this).closest(selector).find('.input-group-addon').removeClass('up-arrow-fill');
      });
}

function updatePartNoField(index, category) {
	if (category == 'Assets' || category == 'Services') {
		jQuery('#itemPartNo_'+index).next("span.input-group").remove();//NO I18N
		jQuery('<span class="input-group pos-abs top5 pl5 pr5 left0"><input type="text" id="itemInputPartNo_'+index+'"class="form-control" style="height:28px;" placeholder="'+getMessageForKey("ae.po.itempartno.choose")+'" data-id="sel-input-field"><span class="input-group-addon cur-ptr" data-id="sel-click" ></span></span>').insertAfter('#itemPartNo_'+index);//NO I18N
		jQuery('#itemPartNo_'+index).addClass("fw");
		jQuery('#itemPartNo_'+index).closest("td").addClass("input-as-select pos-rel");//NO I18N
		updateSelect2ForPartNo(index, category,-1);
		selectInit('#itemPartNo_'+index,".input-as-select");//NO I18N
	}
	else if (category == 'Others') {
		jQuery('#itemPartNo_'+index).select2('destroy');//NO I18N
		jQuery('#itemPartNo_'+index).closest("td").removeClass("input-as-select pos-rel");//NO I18N
		jQuery('#itemPartNo_'+index).next("span.input-group").remove();//NO I18N
		jQuery('#itemPartNo_'+index).addClass("form-control");
	}
}
//Select category field

function onItemCategoryChange(el,operationMode) {
	var vendorId = jQuery('#vendorID').val();
	var curr_row = jQuery(el).closest('tr');//NO I18N
	var parentTrId = jQuery(el).closest('tr').attr('id');//NO I18N
	var indexno = parentTrId.split('_');
	curr_row.find('select').select2('destroy')//NO I18N
	jQuery('#itemPartNo_'+indexno[1]).val('');
	if (jQuery(el).val() == 'Assets')//NO I18N 
	{
		curr_row
          .find('.item-category-field')
          .html(jQuery('#componentTypeDiv').html())
          .end()
          .find('.po-items-ui select')
          .select2()
          .end()
          .find('.po-product')
          .select2("container")//NO I18N
          .find("div.select2-drop")
          .append(
              '<a class="graybg btn-link btn-block" href="/" sdphrefJs="js-href-PurchaseOrder-6"><span class="btn"><span class="common-sprite icon-xs common-add-icon4 mr5"></span>'+getMessageForKey("ae.po.item.createnewproduct")+'</span></a>');//NO I18N

		curr_row.find('#componentTypeSelect').attr('id', 'componentTypeSelect_' + indexno[1]);
		curr_row.find('#componentSelect').attr('id', 'componentSelect_' + indexno[1]);
		curr_row.find('#assetTextArea').attr('id', 'assetTextArea_' + indexno[1]);
		if(operationMode === undefined){
		    updateSelect2ForProductType(indexno[1]);
		    updateSelect2ForProduct(vendorId, -1, indexno[1]);
		}
		jQuery('#assetTextArea_' + indexno[1]).val('');
		updatePartNoField(indexno[1], 'Assets');
	}
	else if (jQuery(el).val() == 'Services')//NO I18N
	{
		curr_row
				.find('.item-category-field')
				.html(jQuery('#servicesDiv').html())
				.end()
				.find('.po-items-ui select')
				.select2()
				.end()
				.find('.item-category-field select')
				.select2("container")//NO I18N
				.find("div.select2-drop")
				.append(
						'<a class="graybg btn-link btn-block" href="/" sdphrefJs="js-href-PurchaseOrder-7"><span class="btn"><span class="common-sprite icon-xs common-add-icon4 mr5"></span>'+getMessageForKey("ae.po.item.createnewservice")+'</span></a>');//NO I18N
				curr_row.find('#serviceSelect').attr('id','serviceSelect_'+indexno[1]);
				curr_row.find('#serviceTextArea').attr('id','serviceTextArea_'+indexno[1]);
				updateSelect2ForService(indexno[1]);
				jQuery('#serviceTextArea_'+indexno[1]).val('');
				updatePartNoField(indexno[1], 'Services');
	}
	else if (jQuery(el).val() == 'Others')//NO I18N
	{
		curr_row.find('.item-category-field').html(
				jQuery('#othersTextBoxDiv').html()).end()
				.find('.po-items-ui select').select2();
				curr_row.find('#otherSelect').attr('id','otherSelect_'+indexno[1]);
				curr_row.find('#otherTextArea').attr('id','otherTextArea_'+indexno[1]);
				jQuery('#otherTextArea_'+indexno[1]).val('');
				updatePartNoField(indexno[1], 'Others');
	}
	else {
		curr_row.find('.po-items-ui select').select2();
		jQuery('div.item-category-field').html('<textarea class="form-control" readonly="" style="height: 54px"></textarea>');
		jQuery('#otherTextArea_'+indexno[1]).val('');
		//jQuery('#itemPartNo_'+indexno[1]).removeAttr("onChange");//NO I18N
		//jQuery('#itemPartNo_'+indexno[1]).select2('destroy');//NO I18N
		//jQuery('#itemPartNo_'+indexno[1]).addClass("form-control");
	}
	jQuery('#itemPartNo_'+indexno[1]).val('');
	jQuery('#itemPrice_'+indexno[1]).val('0.00');
	jQuery('#itemTaxRate_'+indexno[1]).val('0.00');
    jQuery('#itemQuantity_'+indexno[1]).val('1');
    jQuery('#itemAmount_'+indexno[1]).val('0.00');
}

// On Component Type Change
function onComponentTypeChange(el) {
	var vendorID = jQuery('#vendorID').val();
	var componentTypeId = jQuery(el).val() == "" ? -1 : jQuery(el).val() ;
	var parentTrId = jQuery(el).closest('tr').attr('id');//NO I18N
	var indexno = parentTrId.split('_');
	updateSelect2ForProduct(vendorID, componentTypeId, indexno[1]);
	jQuery('#itemInputPartNo_'+indexno[1]).val('');
	updateSelect2ForPartNo(indexno[1], 'Assets', componentTypeId);
}
// On Component Change on Item list section
function onComponentChange(el) {
	var vendorID = jQuery('#vendorID').val();
	var componentName = jQuery(el).val();
	var parentTrId = jQuery(el).closest('tr').attr('id');//NO I18N
	var indexno = parentTrId.split('_');
	var partNoData = JSON.parse('{"id" : "0", "text" : "' + getMessageForKey("ae.po.itempartno.choose") + '"}');//NO I18N

	if (trim(componentName) == "") {
		jQuery('#itemPrice_'+indexno[1]).val('0.00');
		jQuery('#itemTaxRate_'+indexno[1]).val('0.00');
	    jQuery('#itemQuantity_'+indexno[1]).val('1');
	    jQuery('#itemAmount_'+indexno[1]).val('0.00');
	    jQuery('#itemInputPartNo_'+indexno[1]).val('');//No I18N
	    jQuery('#itemPartNo_'+indexno[1]).select2('data', partNoData);//No I18N
	}
	else {
		param = "module=get_component_details&vendorID=" + vendorID+"&componentName="+encodeURIComponent(componentName);//NO I18N
		callCustomAjaxRequest("/PurchaseOrder.do", param, function(req) {//NO I18N

			var componentJson = JSON.parse(req.responseText);
			if (componentJson.componentCost != undefined) {
				jQuery('#itemPrice_'+indexno[1]).val(componentJson.componentCost);
			}
			if (componentJson.componentTaxRate != undefined) {
				jQuery('#itemTaxRate_'+indexno[1]).val(componentJson.componentTaxRate);
			}
			if (componentJson.componentPartNo != undefined) {
				if ((componentJson.componentPartNo).trim() == '') {
					jQuery('#itemInputPartNo_'+indexno[1]).val('');//No I18N
					jQuery('#itemPartNo_'+indexno[1]).select2('data', partNoData);//No I18N
				}
				else {
					jQuery('#itemInputPartNo_'+indexno[1]).val(componentJson.componentPartNo);//No I18N
				}
			}
			else {
				jQuery('#itemInputPartNo_'+indexno[1]).val('');//No I18N
				jQuery('#itemPartNo_'+indexno[1]).select2('data', partNoData);//No I18N
			}
			var componentTypeData = {};
			componentTypeData.id = componentJson.componentTypeId;
			componentTypeData.display_name = (componentJson.componentTypeName).replace("\\", "\\\\");
			jQuery('#componentTypeSelect_' + indexno[1]).select2('data', componentTypeData);//No I18N
			calculate(jQuery('#itemAmount_' + indexno[1]));
		}, ajaxRequestOnFailure, 'get_component_details');//NO I18N
	}
}
// On Service Change on Item list section
function onServiceChange(el) {
	var vendorID = jQuery('#vendorID').val();
	var serviceName = jQuery(el).val();
	var parentTrId = jQuery(el).closest('tr').attr('id');//NO I18N
	var indexno = parentTrId.split('_');
	var partNoData = JSON.parse('{"id" : "0", "text" : "' + getMessageForKey("ae.po.itempartno.choose") + '"}');//NO I18N
	if (trim(serviceName) == "") {
		jQuery('#itemPrice_'+indexno[1]).val('0.00');
		jQuery('#itemTaxRate_'+indexno[1]).val('0.00');
	    jQuery('#itemQuantity_'+indexno[1]).val('1');
	    jQuery('#itemAmount_'+indexno[1]).val('0.00');
	    jQuery('#itemInputPartNo_'+indexno[1]).val('');//No I18N
	    jQuery('#itemPartNo_'+indexno[1]).select2('data', partNoData);//No I18N
	}
	else {
		param = "module=get_service_details&vendorID=" + vendorID+"&serviceName="+encodeURIComponent(serviceName);//NO I18N
		callCustomAjaxRequest("/PurchaseOrder.do", param, function(req) {//NO I18N
			var serviceJson = JSON.parse(req.responseText);
			if (serviceJson.serviceCost != undefined) {
				jQuery('#itemPrice_'+indexno[1]).val(serviceJson.serviceCost);
			}
			if (serviceJson.serviceTaxRate != undefined) {
				jQuery('#itemTaxRate_'+indexno[1]).val(serviceJson.serviceTaxRate);
			}
			if (serviceJson.servicePartNo != undefined) {
				if ((serviceJson.servicePartNo).trim() == '') {
					jQuery('#itemInputPartNo_'+indexno[1]).val('');//No I18N
					jQuery('#itemPartNo_'+indexno[1]).select2('data', partNoData);//No I18N
				}
				else {
					jQuery('#itemInputPartNo_'+indexno[1]).val(serviceJson.servicePartNo);//No I18N
				}
			}
			else {
				jQuery('#itemInputPartNo_'+indexno[1]).val('');//No I18N
				jQuery('#itemPartNo_'+indexno[1]).select2('data', partNoData);//No I18N
			}
			calculate(jQuery('#itemAmount_'+indexno[1]));
		}, ajaxRequestOnFailure, 'get_service_details');//NO I18N
	}
}

//On Part No. Change on Item list section
function onPartNoChange(id) {
	if (jQuery(id).val() != -1) {
		var vendorID = jQuery('#vendorID').val();
		var parentTrId = jQuery(id).closest('tr').attr('id');//NO I18N
		var indexno = parentTrId.split('_');
		var categoryName = jQuery('#itemCategorySelect_'+indexno[1]).val();
		if (categoryName == 'Assets') {
			var componentId = jQuery(id).val();
			if (componentId == 0) {
				jQuery('#itemPrice_'+indexno[1]).val('0.00');
				jQuery('#itemTaxRate_'+indexno[1]).val('0.00');
			    jQuery('#itemQuantity_'+indexno[1]).val('1');
			    jQuery('#itemAmount_'+indexno[1]).val('0.00');
			    var productData = JSON.parse('{"id" : "", "text" : "' + getMessageForKey("sdp.inventory.assetDefAction.chooseProdMsg") + '"}');//NO I18N
				jQuery('#componentSelect_'+indexno[1]).select2('data', productData);//No I18N
			}
			else {
				param = "module=get_component_details&vendorID=" + vendorID+"&componentId="+componentId;//NO I18N
				callCustomAjaxRequest("/PurchaseOrder.do", param, function(req) {// no i18n
					var componentJson = JSON.parse(req.responseText);
					if (componentJson.componentCost != undefined) {
						jQuery('#itemPrice_'+indexno[1]).val(componentJson.componentCost);
					}
					if (componentJson.componentTaxRate != undefined) {
						jQuery('#itemTaxRate_'+indexno[1]).val(componentJson.componentTaxRate);
					}
					if (componentJson.componentTypeId != undefined) {
						var componentTypeData = {};
						componentTypeData.id = componentJson.componentTypeId;
						componentTypeData.display_name = (componentJson.componentTypeName).replace("\\", "\\\\");
						jQuery('#componentTypeSelect_' + indexno[1]).select2('data', componentTypeData);//No I18N
					}
					if (componentJson.componentName != undefined) {
						var componentData = {};
						componentData.id = (componentJson.componentName).replace("\\","\\\\");
						componentData.text = (componentJson.componentName).replace("\\","\\\\");
						jQuery('#componentSelect_'+indexno[1]).select2('data', componentData);//No I18N
					}
					calculate(jQuery('#itemAmount_'+indexno[1]));
				}, ajaxRequestOnFailure, 'get_component_details');//NO I18N
			}
		}
		else if (categoryName == 'Services') {
			var serviceId = jQuery(id).val();
			if (serviceId == 0) {
				jQuery('#itemPrice_'+indexno[1]).val('0.00');
				jQuery('#itemTaxRate_'+indexno[1]).val('0.00');
			    jQuery('#itemQuantity_'+indexno[1]).val('1');
			    jQuery('#itemAmount_'+indexno[1]).val('0.00');
			    var serviceData = JSON.parse('{"id" : "", "text" : "' + getMessageForKey("ae.admin.vendor.serviceassociation.choose") + '"}');//NO I18N
				jQuery('#serviceSelect_'+indexno[1]).select2('data', serviceData);//No I18N
			}
			else {
				param = "module=get_service_details&vendorID=" + vendorID+"&serviceId="+serviceId;//NO I18N
				callCustomAjaxRequest("/PurchaseOrder.do", param, function(req) {// no i18n
					var serviceJson = JSON.parse(req.responseText);
					if (serviceJson.serviceCost != undefined) {
						jQuery('#itemPrice_'+indexno[1]).val(serviceJson.serviceCost);
					}
					if (serviceJson.serviceTaxRate != undefined) {
						jQuery('#itemTaxRate_'+indexno[1]).val(serviceJson.serviceTaxRate);
					}
					if (serviceJson.serviceName != undefined) {
						var serviceData = JSON.parse('{ "id" : "'+(serviceJson.serviceName).replace("\\","\\\\")+'", "text" : "'+(serviceJson.serviceName).replace("\\","\\\\")+'" }');//No I18N
						jQuery('#serviceSelect_'+indexno[1]).select2('data', serviceData);//No I18N
					}
					calculate(jQuery('#itemAmount_'+indexno[1]));
				}, ajaxRequestOnFailure, 'get_service_details');//NO I18N
			}
		}
	}
}

function updateSelect2ForItemCategory(index){
    var selectedCategoryData = JSON.parse('{"id" : "", "text" : "' + getMessageForKey("sdp.common.selectcategory") + '"}');
    var statusData=[{id:"Assets",text:translate("sdp.header.inventory")}, {id:"Services",text:translate("sdp.itil.common.service.item")},{id:"Others",text:translate("sdp.inventory.assethome.others")}] //NO I18N
    jQuery('#itemCategorySelect_'+index).select2({
        placeholder:translate("sdp.common.selectcategory"),
        data : statusData,
        allowClear:"true",
        selectedData:selectedCategoryData
    }).on("change", function() {onItemCategoryChange(this);});
}

function updateSelect2ForProduct(vendorID, componentTypeId, indexno) {
    if (componentTypeId == ""){
        componentTypeId = -1;
    }
    if(componentTypeId == -1){
        jQuery('#componentSelect_'+indexno).val("");
    }
	params = '{"module": "product", "componentTypeId": "' + componentTypeId + '","vendorID": "' + vendorID + '","dropdownLength":"25"}';//NO I18N
	updateSelect2Dropdown({
		elementId: 'componentSelect_' + indexno, //NO I18N
		placeHolder: translate("sdp.inventory.assetDefAction.chooseProdMsg"),
		isOnChangeEventRequired: false,
		isPagination: true,
		isAllowClear : true,
		params: params
	});
	if (jQuery('#addNewProductRole').val() == 'true') {
		jQuery('#s2id_componentSelect_'+indexno)
		.select2("container")//NO I18N
	    .find("div.select2-drop")
	    .append(
	        '<a class="graybg btn-link btn-block" href="/" sdphrefJs="js-href-PurchaseOrder-8" data-event="click" data-handler="callAddItem('+indexno+');return false;" nonce="'+sdpNonce+'"><span class="btn"><span class="common-sprite icon-xs common-add-icon4 mr5"></span>'+getMessageForKey("ae.po.item.createnewproduct")+'</span></a>');//NO I18N
		$sdEventListener('#s2id_componentSelect_'+indexno);// NO I18N
	}
	var element = jQuery('#componentSelect_'+indexno);
	element.on("change", function(event) { //no i18n
		onComponentChange(this);
	});
}
function updateSelect2ForProductType(indexno,componentTypeData) {
    var diabled = false;
    if(componentTypeData != undefined){
        diabled = componentTypeData.disabled;
    }
	var options = {
        url: "/api/v3/purchase_orders/items/product_type", //NO I18N
        entity: "product_type", //NO I18N
        id : "componentTypeSelect_"+indexno, //NO I18N
        displayField: "display_name",//No I18N
        placeHolder : getMessageForKey("sdp.admin.product.addproduct.type.choose"),
        list_info: { "search_criteria": { "field": "api_name", "values": ["asset_asset", "consumable_consumable", "software_product_software"], "condition": "not in", "logical_operator": "AND" } }, //No I18N
        selectedValue: componentTypeData,
        disabled:diabled,
		allowClear:"true"
        }
      hierarchySelect2.init(options);
	  var element = jQuery('#componentTypeSelect_'+indexno);
	  element.on("change", function(event) { //no i18n
		onComponentTypeChange(this);
	});
}
function updateSelect2ForService(indexno) {
	var vendorID = jQuery('#vendorID').val();
	var selectedServiceData = JSON.parse('{"id" : "", "text" : "' + getMessageForKey("ae.admin.vendor.serviceassociation.choose") + '"}');//NO I18N
	params = '{"module": "vendorservice", "vendorID": "'+vendorID+'","dropdownLength":"25", "defaultDropdownData" : {"id" : "", "text" : "' + getMessageForKey("ae.admin.vendor.serviceassociation.choose") + '"}}';//NO I18N
	updateSelect2Dropdown({
		elementId: 'serviceSelect_' + indexno, //NO I18N
		placeHolder: translate("ae.admin.vendor.serviceassociation.choose"),
		isOnChangeEventRequired: false,
		isPagination: true,
		isAllowClear : true,
		params: params
	});
	if (jQuery('#addNewServiceRole').val() == 'true') {
		jQuery('#s2id_serviceSelect_'+indexno)
		.select2("container")//NO I18N
	    .find("div.select2-drop")//NO I18N
	    .append(
	        '<a class="graybg btn-link btn-block" href="/" sdphrefJs="js-href-PurchaseOrder-10" data-event="click" data-handler="addNewServiceItem('+indexno+');return false;" nonce="'+sdpNonce+'"><span class="btn"><span class="common-sprite icon-xs common-add-icon4 mr5"></span>'+getMessageForKey("ae.po.item.createnewservice")+'</span></a>'); //NO I18N
		$sdEventListener('#s2id_serviceSelect_'+indexno);// NO I18N
	}
	var element = jQuery('#serviceSelect_'+indexno);
	element.on("change", function(event) { //no i18n
		onServiceChange(this);
	});
}

function updateSelect2ForPartNo(indexno, category, componentTypeId) {
	var vendorID = jQuery('#vendorID').val();
	var selectedPartNoData = JSON.parse('{"id" : "-1", "text" : "' + getMessageForKey("ae.po.itempartno.choose") + '"}');//NO I18N
	params = '{"module" : "partno", "vendorID" : "' + vendorID + '", "category" : "' + category + '", "componentTypeId" : "' + componentTypeId + '", "dropdownLength" : "25"}';//NO I18N
	updateSelect2Dropdown({
		elementId: 'itemPartNo_' + indexno, //NO I18N
		placeHolder: translate("ae.po.itempartno.choose"),
		selectedData: selectedPartNoData,
		isOnChangeEventRequired: false,
		isPagination: true,
		isAllowClear : true,
		params: params
	});
}

//Adding new asset model
function callAddItem(indexno) {
	if (jQuery('#componentTypeSelect_' + indexno).val() != '' && jQuery('#componentTypeSelect_' + indexno).val() != '-1') {
		showURLInDialog('/PurchaseOrder.do?module=show_add_new_product_page&vendorId='+jQuery('#vendorID').val()+"&componentTypeId="+jQuery('#componentTypeSelect_'+indexno).val()+"&componentType="+encodeURIComponent(jQuery('#componentTypeSelect_'+indexno).select2('data').display_name)+"&index="+indexno,'modal=yes,closeButton=no,position=absmiddle');//No I18N
	}
	else {
		jQuery('#componentSelect_'+indexno).select2('close');//No I18N
		alert(getMessageForKey("ae.po.item.createnewitem.componenttype.check"));
	}
}

//Adding new service
function addNewServiceItem(index) {
 	showURLInDialog('/PurchaseOrder.do?module=add_new_service_page&vendorId='+jQuery('#vendorID').val()+"&index="+index,'modal=yes,closeButton=no,position=absmiddle');//No I18N
}

function addServiceItemOperation(req, operation) {
	if (operation == 'addNewServiceItem') {
		var response = JSON.parse(req.response);
		var status = response.status;
		var message = response.message;

		if (status == '500') {
			document.getElementById("messageHolder").innerHTML = ZSEC.Encoder.encodeForHTML(message);
			ShowHide('error_message');//No I18N
			jQuery("#serviceItemSaveTR").show();//NO I18N
			jQuery("#serviceItemLoadingTR").hide();//NO I18N
		}
		else {
			var serviceName = response.servicename;
			var index = response.index;
			var serviceData = {};
			serviceData.id = serviceName.replace("\\","\\\\");
			serviceData.text = serviceName.replace("\\","\\\\");
			jQuery('#serviceSelect_'+index).select2('data', serviceData);//No I18N
			if (jQuery('#servicePartNo').val() != '') {
				jQuery('#itemInputPartNo_'+index).val(jQuery('#servicePartNo').val());
			}
			else {
				jQuery('#itemInputPartNo_'+index).val('');
			}
			if (jQuery('#servicePrice').val() != '') {
				jQuery('#itemPrice_' + index).val(parseFloat(jQuery('#servicePrice').val()).toFixed(2));
			}
			if (jQuery('#serviceTaxRate').val() != '') {
				jQuery('#itemTaxRate_' + index).val(parseFloat(jQuery('#serviceTaxRate').val()).toFixed(2));
			}
			else {
				jQuery('#itemTaxRate_'+index).val('0.00');
			}
			parent.closeDialog();
			calculate(jQuery('#itemAmount_'+index));
		}

	}
}

/*#######################::POServiceCode Start::########################*/

function showAssociatedAssets() {
	 function convertToUrlParams(params) {
	 	return Object.keys(params).map(key => key + '=' + params[key]);
     }

	 const urlParams = convertToUrlParams({
	 	module: "asset_assets",//No I18N
	 	externalframe: true,
	 	enableFilter: true,
	 	from: "purchase",//No I18N
	 	entity_id: poID,
	 	forwardTo: "list",//No I18N
	 	canShowLeftPanel: false
	 });

	 var url = "/asset/AssetPopup.jsp?" + urlParams.join("&");//NO I18N
	 $previewComponent.load(url, ZSEC.Encoder.encodeForHTML(translate("sdp.purchase.addNew.view.Assets.title")), jQuery(window).width() * 80 / 100 + "px");//No I18N
}

