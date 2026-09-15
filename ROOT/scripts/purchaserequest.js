//$Id$

var historyMessages = {"REQUESTID+C" : "sdp.purchase.request.history.created"};//NO I18N
var historyColumnI18N = {"DESCRIPTION" : "sdp.common.desc", "SUBJECT" : "sdp.common.subject", "REQUESTEDDATE" : "sdp.purchase.request.requested.date", "DATEREQUIRED" : "sdp.requests.common.duedate", "SHIPPING_DETAILS" : "sdp.purchase.link3", "REQUESTEDBY" : "sdp.purchase.newpo.requestedby", "TECHNICIANID" : "sdp.common.technician", "COSTCENTERID" : "sdp.admin.addnew.costcenterlabel", "VENDORID" : "sdp.purchase.request.suggested.vendor", "SITEID" : "sdp.requests.common.site", "STATUSID" : "sdp.approval.status", "ATTACHMENTNAME" : "sdp.inventory.fileName", "ITEMNAME" : "sdp.purchase.request.requested.item", "QUANTITY" : "sdp.purchase.addNew.itemLI.quantity", "ESTIMATED_COST" : "sdp.project.projectattribute.estimatedcost", "APPROVALLEVEL" : "ae.purchase.mlApprover.Level", "APPROVALCONDITION" : "ae.purchase.level.approvalType", "LEVELSTATUSID" : "sdp.approval.level.status", "PRIORITYID" : "sdp.requests.common.priority", "TYPEID" : "sdp.purchase.requests.type" };//NO I18N

function convertFormToJSON(form1, form2)
{
	var json = {};

	json = constructJSON(form1, json);

	if( form2 != undefined )
	{
		json.udf_fields = {};

		json.udf_fields = constructJSONForCustomField(form2, json.udf_fields); 
	}

	var service_requests = [];
	
	if( jQuery('#serviceRequestId').length > 0 )
	{
		var requestDetails = {};

		requestDetails.service_request_id = parseInt(jQuery('#serviceRequestId').val());//NO I18N

		service_requests.push(requestDetails);
	}

	var allProducts = [];

	//for( i = 1; i <= totalProductRows; i++ )
	jQuery('[id^=itemDetails_]').each(function()
	{
		var productDetails = {};

		var isEmptyRow = false;

		jQuery(this).find('input').each(function()
		{
			if( this.value != null && this.value != 'null' )
			{
				tagName = this.name.split("_")[0];

				if( tagName == 'quantity' || tagName == 'estimated' || tagName == 'totalCost' )
				{
					if ( tagName == 'quantity' )
					{
						productDetails.quantity =  (trim(this.value) == '' ? null : parseFloat(this.value));//NO I18N
					}
					else if( tagName == 'estimated' )
					{
						productDetails.estimated_cost =  (trim(this.value) == '' ? null : parseFloat(this.value));//NO I18N
					}
					else
					{
						productDetails[this.name.split("_")[0]] =  (trim(this.value) == '' ? null : parseFloat(this.value));//NO I18N
					}

				}
				else if( this.name.indexOf('item_name_') >= 0 )
				{
					productDetails.item_name =  ( trim(this.value) == '' ? null :  this.value);//NO I18N
				}
				else if( this.name.indexOf('item_desc_') >= 0 )
				{
					productDetails.item_desc =  ( trim(this.value) == '' ? null :  this.value);//NO I18N
				}
				else
				{
					productDetails[this.name.split("_")[0]] =  ( trim(this.value) == '' ? null :  this.value );//NO I18N
				}
			//	productDetails[this.name.split("_")[0]] =  (trim(this.value) == '' ? null : this.value);//NO I18N
			}
			else
			{
				productDetails[this.name.split("_")[0]] = null;
			}
			if( this.name.indexOf('item_name_') >= 0 && trim(this.value) == '' )
			{
				isEmptyRow = true;
			}
		});

		if( !isEmptyRow )
		{
			allProducts.push(productDetails);
			//allProducts[i-1] = productDetails;
		}
	});

	if( allProducts.length > 0 )
	{
		json.requested_items = allProducts;
	}

	if( service_requests.length > 0 )
	{
		json.service_requests = service_requests;
	}

	var noOfLevel = jQuery('[id^=approverLevelRow_]').length;//No I18N

	var allApprovalLevels = [];

	if( jQuery('#enableApproval').is(':checked'))
	{	
		for( i = 1; i <= noOfLevel; i++ )
		{
			var levelDetails = {};

			jQuery('#approverLevelRow_' + i + ' select').each(function()
			{
				levelDetails.approval_level = i;//NO I18N
				levelDetails.approval_condition = jQuery('#condition_' + i).val();//No I18N

				var approvers = jQuery('#approver_' + i + ' option');
				var allApprovers = [];

				for( j = 0; j < approvers.length; j++ )
				{
					var approver = {};
					approver.approver = (approvers[j].value == '' ? null : parseInt(approvers[j].value));
					allApprovers.push(approver);
				}
				if( allApprovers.length > 0 )
				{
					levelDetails.approvers = allApprovers;
				}
			});

			if( levelDetails.approvers != undefined )
			{
				allApprovalLevels.push(levelDetails);
			}
		}
	}

	if( allApprovalLevels.length > 0 )
	{
		json.approval_details = allApprovalLevels;
	}
	else
	{
		//allApprovalLevels.push({});
		json.approval_details = []; 
	}

	return json;
}

function constructJSONForCustomField(form, json)
{
	var array = jQuery(form).serializeArray();

	jQuery("form" + form + " :input").each(function() 
	{
		var tempCustomFields = {};

		if( jQuery(this).attr("id") != undefined && jQuery(this).attr("id").indexOf("udf_date") >= 0 && this.value != '' )
		{
			tempCustomFields.value = this.value;
			json[this.name] = tempCustomFields;
		}
		else 
		{
			if( this.value != undefined && trim(this.value) != '' )
			{
				if( jQuery(this).attr('datatype') == 'Long' )
				{
					tempCustomFields.value = parseInt(this.value);
					json[this.name] = tempCustomFields;
				}
				else
				{
					tempCustomFields.value = this.value;
					json[this.name] = tempCustomFields;
				}
			}
			else
			{
				json[this.name] = null; 
			}
		}
	});
	return json;
}

function constructJSON(form, json)
{
	var array = jQuery(form).serializeArray();

	jQuery("form" + form + " :input").each(function() 
	{
		if( "requested_date" == this.name && this.value != '' )
		{
			json[this.name] = this.value;
		}
		else if( "requester" == this.name && parseInt(this.value) < 0 )
		{
			json[this.name] = null;
		}
		else if( "date_required" == this.name && this.value != '' )
		{
			json[this.name] = this.value;
		}
		else if( jQuery(this).attr("id") != undefined && jQuery(this).attr("id").indexOf("udf_date") >= 0 && this.value != '' )
		{
			json[this.name] = this.value; 
		}
		else
		{
			if( this.name != 'site' )
			{
				if( this.value != undefined && trim(this.value) != '' )
				{
					if( jQuery(this).attr('datatype') == 'Long' )
					{
						json[this.name] = parseInt(this.value);
					}
					else
					{
						json[this.name] = this.value;
					}
				}
				else
				{
					json[this.name] = null; 
				}
			}
			else
			{
		       		if( this.name == 'site' && parseInt(this.value) <= 0 )
				{
					json[this.name] = null;
				}
				else
				{
					json[this.name] = parseInt(this.value) || null;
				}
			}		

		}
		if( trim(this.name) != '' )
		{
			var allowedValuePattern = jQuery( document.getElementById( this.name ) ).attr("allowedvalue");//NO I18N
			if( allowedValuePattern != null && allowedValuePattern != undefined)
			{
				var regExpression = new RegExp(allowedValuePattern.replace(/^\/|\/$/g, ''));
				if( !regExpression.test(this.value) )
				{
					json[this.name] = null;//NO I18N
				}
			}
		}
	});
	return json;
}

function calculateTotalPRCost( inputFieldObj )
{
	fieldIndex = inputFieldObj.id.split("_")[1];//NO I18N

	if( inputFieldObj.id.indexOf("estimated_cost_") >= 0 )
	{
		fieldIndex = inputFieldObj.id.split("_")[2];//NO I18N

		if( !isDouble(trim(inputFieldObj.value)) )
		{
			showBaloonToolTip(inputFieldObj.id, getMessageForKey('sdp.inventory.detailAsset.invalidCostMsg'));//NO I18N
			return;
		}
	}
	else if( inputFieldObj.id.indexOf("quantity_") >= 0 )
	{
		if( !isDouble(trim(inputFieldObj.value)) )
		{
			showBaloonToolTip(inputFieldObj.id, getMessageForKey('sdp.purchase.receiveitem.errmsg.enterquantity'));//NO I18N
			return;
		}
	}

	jQuery('#totalCost_' + fieldIndex).val((parseFloat(jQuery('#quantity_' + fieldIndex).val()) * parseFloat(jQuery('#estimated_cost_' + fieldIndex).val())).toFixed(2));//No I18N

	var totalCostFields = jQuery("[id^='totalCost_']");//NO I18N

	var totalCost = 0;

	totalCostFields.each(function()
	{
		totalCost += parseFloat(this.value);
	});
	jQuery('#estimated_cost_' + fieldIndex).val((parseFloat(jQuery('#estimated_cost_' + fieldIndex).val())).toFixed(2));
	jQuery('#totalvalue').val((parseFloat(totalCost)).toFixed(2));
}

function validateFormFieldValues(inputSectionId)
{
	var mandatoryInputFields = jQuery('#' + inputSectionId).find(':input[mandatory]');//NO I18N

	if( mandatoryInputFields.length > 0 )
	{
		for( i = 0; i < mandatoryInputFields.length; i++ )
		{
			datatype = jQuery(mandatoryInputFields[i]).attr('datatype');

			if( datatype == 'string' && trim(mandatoryInputFields[i].value) == '' )
			{
				showBaloonToolTip(mandatoryInputFields[i].id, getMessageForKey(jQuery(mandatoryInputFields[i]).attr('errorMessage')));//NO I18N
				return false;
			}
			if( jQuery(mandatoryInputFields[i]).attr("id") == "site" && jQuery("#site").attr("mandatory") == "true" )
			{
				siteId = jQuery("#site").val();
				if( siteId == null || siteId <= 0 )
				{
					showBaloonToolTip(jQuery("#site").siblings()[0].id, getMessageForKey('sdp.purchase.site.mandatory.jsPNameErr'));//NO I18N
					return false;
				}
			}
			if( datatype == 'double' && (trim(mandatoryInputFields[i].value) == '' || parseFloat(mandatoryInputFields[i].value) < 0 ) )
			{
				showBaloonToolTip(mandatoryInputFields[i].id, getMessageForKey(jQuery(mandatoryInputFields[i]).attr('errorMessage')));//NO I18N
				return false;
			}
		}
	}

	var validationInputFields = jQuery('#' + inputSectionId).find(':input[validation]');//NO I18N

	if( validationInputFields.length > 0 )
	{
		for( i = 0; i < validationInputFields.length; i++ )
		{
			datatype = jQuery(validationInputFields[i]).attr('datatype');

			if( datatype == 'Long' && trim(validationInputFields[i].value) != '' && !isInteger(validationInputFields[i].value) )
			{
				showBaloonToolTip(validationInputFields[i].id, getMessageForKey(jQuery(validationInputFields[i]).attr('errorMessage')));//NO I18N
				return false;
			}
		}
	}

	requestItems = new Array();

	i = 0;
			
	duplicateFound = null;

	jQuery('#requestedItemTable [id^=item_name_]').each( function() 
	{
		tempValue = this.value.toLowerCase();

		if( requestItems.indexOf(tempValue) == -1 )
		{
			requestItems.push(this.value.toLowerCase());
		}
		else
		{
			duplicateFound = jQuery(this).attr('id');//NO I18N
		}
	});

	if( duplicateFound != null )
	{
		showBaloonToolTip(duplicateFound, getMessageForKey('sdp.purchase.newpo.productname.errmsg'));//NO I18N
		return false;
	}

	invalidInputField = null;

	jQuery('[id^=estimated_cost_]').each( function() 
	{
		if( !isDouble(trim(this.value)) )
		{
			invalidInputField = jQuery(this).attr("id");//NO I18N
		}
	});

	if( invalidInputField != null )
	{
		showBaloonToolTip(invalidInputField, getMessageForKey('sdp.inventory.detailAsset.invalidCostMsg'));//NO I18N
		return false;
	}

	invalidInputField = null;

	jQuery('[id^=quantity_]').each( function() 
	{
		if( !isDouble(trim(this.value)) )
		{
			invalidInputField = jQuery(this).attr("id");//NO I18N
		}
	});

	if( invalidInputField )
	{
		showBaloonToolTip(invalidInputField, getMessageForKey('sdp.purchase.receiveitem.errmsg.enterquantity'));//NO I18N
		return false;
	}
	
	var index = null;

	if( jQuery('#enableApproval').is(":checked") )
	{
		jQuery('[id^=approverLevelRow_] [id^=appTabList]').each( function()
		{
			if( jQuery(this).children().length == 0	)
			{
				index = jQuery(this).attr("id").split("_")[1];
				if( jQuery('#appTabList_'+index).length > 0 )
				{
					showBaloonToolTip('appTabList_'+index, getMessageForKey('ae.purchase.mlApprover.LevelApprover.errmsg', [Number(index)]));//NO I18N
				}
				return false;
			}
		});
	}
	
	if( index != null )
	{
		return false;
	}


	return true;
}

var isVendorAssociated = false;

var associatedPO = null;

function populatePRFields( requestId, thisRow, jsonObj, attchmentAccessUserId)
{
	if( jsonObj != null && jsonObj != undefined )
	{
		associatedPO = [];

		var gUniqueRowID = parseInt(thisRow.id.split("_")[1]) + 1;

		var prObj = jsonObj.purchaserequests;
		
		if ( prObj.request_status.name == 'Rejected' )
		{
			var prRejectedHistoryObj = jsonObj.purchaserequests.rejectedDetails;
			
			jQuery( "#RejecteddoneBy" ).text( prRejectedHistoryObj.rejectedBy.name );
			
			jQuery( "#rejectedDate" ).text( prRejectedHistoryObj.rejectedOn.display_value );
			
			jQuery( "#cancelinformation , #Reject_popup" ).css( "display","block" );//NO I18N
			
			var comments = encodeHTML( (prRejectedHistoryObj.reasonComments) ).split("&#xa;").join("<br />");
			
			if ( comments.length < 38 )
			{
				jQuery( "#Reject_popup #info" ).html( comments );

				//jQuery( "#Reject_popup #pop-up" ).prepend( comments );
				jQuery( "#Reject_popup #pop-up" ).remove();
			}
			else
			{
				jQuery( "#Reject_popup #info" ).prepend( comments.slice( 0 , 37 ) + "..." );
				
				jQuery( "#Reject_popup #pop-up" ).prepend( comments );
			}
		}

		if ( prObj.canceledDetails != null && prObj.request_status.name == 'Canceled' )
		{
			jQuery( "#cancelinformation , #Cancel_popup" ).css( "display","block" );//NO I18N

			var prCancelhistoryObj = prObj.canceledDetails;

			jQuery( "#doneByInfo" ).text( prCancelhistoryObj.canceledBy.name );

			jQuery( "#canceltime" ).text( prCancelhistoryObj.canceledOn.display_value );

			var comments = encodeHTML( (prCancelhistoryObj.reasonComments) ).split("&#xa;").join("<br />");

			if ( comments.length < 38 )
			{
				jQuery( "#Cancel_popup #info" ).html( comments );
				
				jQuery( "#Cancel_popup #pop-up" ).remove();
			}
			else
			{
				jQuery( "#Cancel_popup #info" ).prepend( comments.slice( 0 , 37 ) + "..." );

				jQuery( "#Cancel_popup #pop-up" ).prepend( comments );
			}
		}

		//delete prObj.comments;
		jQuery( "#new-pr #sidebar" ).show();	
		if ( ! ( !jQuery("#purchaseRequestList").children("#item-"+requestId)[0] ) )
		{
			if( prObj.comments != null )
			{
				jQuery( document.getElementById( 'req-tool-tip_' + requestId ) ).html( encodeHTML(prObj.comments).split("&#xa;").join("<br />") );
			}

			var prstatusname = prObj.request_status.name;
		       	var prStatusClass = ( prstatusname == "Approved" ? "pr-status status-approved ml5" : ( prstatusname == "Rejected" ? "pr-status status-rejected ml5" : ( prstatusname == "Canceled" ? "pr-status status-canceled ml5" : "pr-status  ml5" )));//NO I18N
			prStatusClass += ( jQuery( "#item-"+requestId).find( "#prstatusname" ).hasClass("status-pending") == true ? " status-pending" : "" );//NO I18N
			jQuery( "#item-"+requestId ).find("#prstatusname" ).text( prstatusname ).attr({ "class" :prStatusClass });
			jQuery( "#item-"+requestId ).find("#prduedate" ).text( prObj.date_required == null ?  getMessageForKey('sdp.common.notassigned') :  prObj.date_required.display_value);
			jQuery( "#item-"+requestId ).find("h4").html( "#"+requestId +" - "+ encodeHTML(prObj.subject) );//NO I18N
			jQuery( "#item-"+requestId ).find("#prrequestedby").html( prObj.requester == null ? getMessageForKey('sdp.common.notassigned') : encodeHTML(prObj.requester.name) );
			jQuery( "#item-"+requestId ).find("#prtechnician").html( prObj.technician == null ? getMessageForKey('sdp.common.notassigned') : encodeHTML(prObj.technician.name) );
		}

		
		if( (prObj.request_status.name == 'Open' || prObj.request_status.name == 'Approved') && hasRole(jsonObj.permissions, 'canCreatePO') )
		{
			jQuery('#addNewPOLink').show();//NO I18N
		}
		else
		{
			jQuery('#addNewPOLink').hide();//NO I18N
		}
		if( prObj.request_status.name == "Rejected" )
		{
			var prRejectedHistoryObj = prObj.rejectedDetails;

			var rejectedDetailsArray = [];

			var cmts = getMessageForKey('sdp.common.comments');

			rejectedDetailsArray.push( "<b>" + encodeHTML(prRejectedHistoryObj.rejectedBy.name) + "</b>" );//NO I18N
			rejectedDetailsArray.push( "<b>" + prRejectedHistoryObj.rejectedLevel + "</b>" );//NO I18N
			rejectedDetailsArray.push( "<b>" + prRejectedHistoryObj.rejectedOn.display_value + "</b>" );//NO I18N

			var comments = getMessageForKey('ae.purchase.listview.tooltip.rejected.case1',rejectedDetailsArray);

			var reasonMsg = encodeHTML((prRejectedHistoryObj.reasonComments)).split("&#xa;").join("<br />");

			if( reasonMsg.length != 0 )
			{
				comments += "<br><b>" + encodeHTML(cmts) + ": </b>" + reasonMsg;//NO I18N
			}
			jQuery( "#item-"+requestId ).find(".req-tool-tip" ).html( comments );//NO I18N
		}
		if(  ! hasRole(jsonObj.permissions, 'canCancelPR') || prObj.request_status.name =="Canceled" )
		{
			jQuery( document.getElementById( 'cancelPRLink' ) ).hide();//NO I18N
			if ( prObj.request_status.name == "Canceled" )
			{
				jQuery( document.getElementById( 'closePRLink' ) ).hide();//NO I18N

				var prCanceledHistoryObj = prObj.canceledDetails;

				var canceledDetailsArray = [];

				var cmts = getMessageForKey('sdp.common.comments');

				canceledDetailsArray.push( "<b>" + encodeHTML(prCanceledHistoryObj.canceledBy.name) + "</b>" );//NO I18N
				canceledDetailsArray.push( "<b>" + prCanceledHistoryObj.canceledOn.display_value + "</b>" );//NO I18N

				var comments = getMessageForKey('ae.purchase.listview.tooltip.canceled.case1', canceledDetailsArray);

				var reasonMsg = encodeHTML((prCanceledHistoryObj.reasonComments)).split("&#xa;").join("<br />");

				if( reasonMsg.length != 0 )
				{
					comments += "<br><b>" + encodeHTML(cmts) + ": </b>" + reasonMsg;//NO I18N
				}
				jQuery( "#item-"+requestId ).find(".req-tool-tip" ).html( comments );
			}
		}
		if( prObj.request_status.name == 'Closed' || prObj.request_status.name == 'Canceled' )
		{
			jQuery( document.getElementById( "purchaserequestid-" + requestId ) ).find( "#editpurchaserequest" ).remove();
			jQuery( document.getElementById( "item-"+ requestId ) ).find( "#editpurchaserequest" ).remove();
		}

		if( prObj.request_status.name == 'Closed' )
		{
			jQuery( document.getElementById( 'cancelPRLink' ) ).hide();//NO I18N
			jQuery('#pr-approvals-content').find('[id^=levelNotifyLabel_]').each(function()
			{
				jQuery(this).addClass('hide');
			});
		}

		if( !hasRole(jsonObj.permissions, 'canClosePR') || prObj.request_status.name == 'Closed' )
		{
			jQuery('#closePRLink').hide();//NO I18N
		}
				
		if( prObj.purchase_orders != undefined && prObj.purchase_orders.length > 0 && hasRole( jsonObj.permissions, 'canViewPO' ) )
		{
			jQuery('#addNewPOLink').hide();
			jQuery('#submitApprovalLink').hide();
			jQuery('#closePRLink').hide();//NO I18N
			jQuery('#cancelPRLink').hide();//NO I18N
			//jQuery('#editPRLink').hide();

			jQuery('#associatedPOs').show();
			
			var i = 0;

			var poComments = null;

			var purchaseOrderId = null;

			var poCustomId = null;

			jQuery.each(prObj.purchase_orders, function(key, json)
			{
				associatedPO[i++] = json;

				if( json.hasOwnProperty("po_comments") )
				{
					poComments = json.po_comments;
					poCustomId = json.po_custom_id;
					purchaseOrderId = json.purchase_order_id;
				}
			});

			if( prObj.request_status.name != 'Closed' && prObj.request_status.name != 'Canceled' &&  prObj.request_status.name != 'Rejected' && poComments != null )
			{
				jQuery( "#cancelinformation , #comment_for_PO" ).css( "display","block" );//NO I18N
				
				// getTranslatedComment method in PurchaseRequestRepository, we are encoding the po comments commonly, so removing encodeHTML for poComments in client side to avoid double encoding.

				jQuery( document.getElementById("comment_for_PO" ) ).find( "#po_message_info" ).html( getMessageForKey('sdp.purchase.common.po') + ' # ' + '<a href="/" sdphrefJs="js-href-purchaserequest-0" style="color:#0011FF; display: inline-block;" data-event="click" data-handler="viewPurchaseOrder(' + purchaseOrderId + ')" nonce="'+sdpNonce+'">' + encodeHTML(poCustomId) + '</a> : ' + poComments );//NO I18N
				$sdEventListener(jQuery( document.getElementById("comment_for_PO"))); // NO I18N 
			}
		}
		else
		{
			jQuery('#associatedPOs').hide();
		}

		if( prObj.vendor != null && prObj.vendor.name != '' && prObj.vendor.name != null )
		{
			isVendorAssociated = true;

			 if(prObj.vendor.currency != null && prObj.vendor.currency.symbol != '' && prObj.vendor.currency.symbol != null) {
				var currency = prObj.vendor.currency.symbol;
				jQuery('#itemTotalCost').text('('+currency+')');
				jQuery('#itemTotalCostId').text('('+currency+')');
				jQuery('#itemEstimatedCost').text('('+currency+')');
			 }
		}
		else
		{
			isVendorAssociated = false;
		}
		
		var levelDetails = prObj.approval_details;

		jQuery('#prtitle').html('['+getMessageForKey("sdp.purchase.request.number")+ requestId + '] ' + encodeHTML(prObj.subject));//NO I18N
		jQuery("#PRID").text(requestId);
		jQuery("#PRNAME").text(prObj.subject);
		applyBrowserTitle();
		jQuery('#statusName').html('<b>' + encodeHTML(prObj.request_status.name) + '</b>');//NO I18N
		if ( prObj.request_status.name == 'Approved' || prObj.request_status.name == 'Rejected' || prObj.request_status.name == 'Canceled' )
		{
			jQuery( document.getElementById( 'prstatusnameheader' ) ).hide();
			jQuery('#PRStatusName').text( prObj.request_status.name ).addClass(prObj.request_status.name).show();
		}
		jQuery('#approveThisPR').hide();//NO I18N
		jQuery('#rejectThisPR').hide();//NO I18N

		if( prObj.request_status.name == 'Closed' || !hasRole(jsonObj.permissions, 'update') )
		{
			jQuery('#editPRLink').hide();//NO I18N
		}

		if( prObj.request_status.name == "Canceled" || prObj.request_status.name == 'Rejected' || prObj.request_status.name == 'Approved' || prObj.request_status.name == 'Closed' || levelDetails == undefined || levelDetails.length == 0 )
		{
			jQuery('#submitApprovalLink').hide();//NO I18N
		}

		var createdDetails = jQuery('#createdByName').html();//NO I18N

		if( createdDetails != undefined )
		{
			createdDetails = createdDetails.replace('#', (prObj.created_date.display_value));//NO I18N
			createdDetails = createdDetails.replace('-', encodeHTML(prObj.createdby.name));//NO I18N

			jQuery('#createdByName').html(createdDetails);//NO I18N
		}
		
		var index = 1;

		var newRow = null;

		var labelName = null;

		jQuery.each(prObj, function(key, value)
		{
			if( key != 'udf_fields' && key != 'service_requests' && key != 'subject' && key != 'attachments' && key != 'requested_items' && key != 'approval_details' && key != 'comments' && key != "purchase_orders" && key != 'request_id' && key != 'canceledDetails' && key != 'rejectedDetails' && key != 'currency' )
			{
				if( index == 1 )
				{
					newRow = thisRow.cloneNode(true);
					newRow.id = "rowNumber_" + gUniqueRowID;
	       	 			jQuery(newRow).show().removeClass('hide');
					thisRow.parentNode.insertBefore(newRow, thisRow);
				}

				labelName = jsonObj.display_labels[key];

				if( labelName == undefined )
				{
					labelName = jsonObj.display_labels[key + ".name"];//No I18N

					if( prObj[key] != undefined )
					{
						value = prObj[key].name;
						
						if(key =='costcenter') 
						{
							value = prObj[key].code+","+prObj[key].name;
						}
					}
				}
			
				if( value != null && typeof value == 'object' )
				{
					value = value.display_value;//to get date data
				}

				if( value == null )
				{
					value = '-';//NO I18N
				}

				if( labelName != undefined )
				{
					jQuery(newRow).find("[id='fieldName" + index + "']").text(labelName);
				}
				else
				{
					jQuery(newRow).find("[id='fieldName" + index + "']").text(key);
				}
				jQuery(newRow).find("[id='fieldName" + index + "']").attr("id", key);
				jQuery(newRow).find("[id='fieldValue" + index + "']").html('<div>' + encodeHTML(value).split("&#xa;").join("<br />") + '</div>');
				jQuery(newRow).find("[id='fieldValue" + index + "']").removeAttr("id");//NO I18N
				gUniqueRowID++;
				index++;
				if( index == 3 )
				{
					index = 1;
				}
			}
		});
				
		if( prObj.hasOwnProperty("udf_fields") && prObj.udf_fields != null )
		{
			jQuery.each(prObj.udf_fields, function(key, value)
			{
				if( index == 1 )
				{
					newRow = thisRow.cloneNode(true);
					newRow.id = "rowNumber_" + gUniqueRowID;
	       	 			jQuery(newRow).show().removeClass('hide');
					thisRow.parentNode.insertBefore(newRow, thisRow);
				}

				labelName = encodeHTML(jsonObj.display_labels[key]);

				if( prObj.udf_fields[key] != null && prObj.udf_fields[key].hasOwnProperty("display_value") )
				{
					value = prObj.udf_fields[key].display_value;
				}
				
				if( value == null )
				{
					value = '-';//NO I18N
				}

				if( labelName != undefined )
				{
					jQuery(newRow).find("[id='fieldName" + index + "']").html(labelName);
				}
				else
				{
					jQuery(newRow).find("[id='fieldName" + index + "']").text(key);
				}

				jQuery(newRow).find("[id='fieldName" + index + "']").attr("id", key);
				jQuery(newRow).find("[id='fieldValue" + index + "']").html('<div>' + encodeHTML(value).split("&#xa;").join("<br />") + '</div>');
				jQuery(newRow).find("[id='fieldValue" + index + "']").removeAttr("id");//NO I18N
				gUniqueRowID++;
				index++;
				if( index == 3 )
				{
					index = 1;
				}
			});
		}


		var itemDetails = prObj.requested_items;

		if( itemDetails != undefined && itemDetails.length > 0 )
		{
			thisRow = document.getElementById('requestedItem_0');
			var gUniqueRowID = parseInt(thisRow.id.split("_")[1]) + 1;
			var prTotalCost = 0;		
			jQuery.each(itemDetails, function(key, json)
			{
				newRow = thisRow.cloneNode(true);
				newRow.id = "requestedItem_" + gUniqueRowID;
	       	 			
				jQuery(newRow).show().removeClass('hide');
				thisRow.parentNode.insertBefore(newRow, thisRow);

				jQuery(newRow).find('td').each(function()
				{
					fieldname = jQuery(this).attr("fieldname");

					if( fieldname == 'itemName' && json.hasOwnProperty('item_name') )
					{
						jQuery(this).html(encodeHTML(json.item_name));
					}
					if( fieldname == 'itemDesc' && json.hasOwnProperty('item_desc') && json.item_desc != null )
					{
						jQuery(this).html(encodeHTML(json.item_desc));
					}
					if( fieldname == 'itemQuantity' && json.hasOwnProperty('quantity') )
					{
						jQuery(this).text(json.quantity);
					}
					if( fieldname == 'itemReceived' && json.hasOwnProperty('received') )
					{
						jQuery(this).text(json.received);
					}
					if( fieldname == 'itemCost' && json.hasOwnProperty('estimated_cost') )
					{
						jQuery(this).text((parseFloat(json.estimated_cost)).toFixed(2));
					}
					if( fieldname == 'itemTotalCost' )
					{
						var itemTotalCost = parseFloat(json.estimated_cost) * parseFloat(json.quantity);
						prTotalCost = prTotalCost+itemTotalCost;
						jQuery(this).text(itemTotalCost.toFixed(2));
					}
				});

				gUniqueRowID++;
			});
			jQuery('#totalCostRow').show().removeClass('hide');
			jQuery('#totalCostValue').text(prTotalCost.toFixed(2));
		}
		else
		{
			jQuery('#noitemfound').show().removeClass('hide');
		}

		if( !jsonObj.isprintview && levelDetails != undefined && levelDetails.length > 0 )
		{
			levelDetails = sortByKey(levelDetails, 'level');//NO I18N

			jQuery('#no_approval_found').hide();

			var notifyTextAdded = false;

			for( var i = 0; i < levelDetails.length; i++ )
			{
				if( document.getElementById('levelDetails_' + levelDetails[i].level) == undefined )
				{
					addApprovalRow((document.getElementById('levelDetails_1')),levelDetails[i].level);
					addPRApprovalSection((document.getElementById('level_1')), levelDetails[i].level);

				}

				jQuery('#levelDetails_' + levelDetails[i].level).show();//No I18N
				jQuery('#levelNumber_' + levelDetails[i].level).text(getMessageForKey('ae.purchase.mlApprover.Level') + ' ' + levelDetails[i].level );//NO I18N
				if(levelDetails[i].status.name == 'Denied') {
					levelDetails[i].status.name = 'Rejected';
				}
				jQuery('#levelStatus_' + levelDetails[i].level).text(levelDetails[i].status.name);//NO I18n
				
				if (  levelDetails[i].status.name == 'Approved' )
				{
					var levelStatusStyle = 'status_appr';//No I18N
				}
				else if ( levelDetails[i].status.name == 'Rejected' )
				{
					var levelStatusStyle = 'status_rej';//No I18N
				}
				else if ( levelDetails[i].status.name == 'Pending Approval' )
				{
					var levelStatusStyle = 'status_pend';//No I18N
				}
				else
				{
					var levelStatusStyle ='status_other';//No I18N
				}
				
				jQuery( document.getElementById( 'levelStatus_'+levelDetails[i].level ) ).attr({"class": levelStatusStyle });

				if( (levelDetails[i].action_taken_on != undefined && levelDetails[i].action_taken_on.display_value != '') )
				{
					jQuery('#levelNotifiedOn_' + levelDetails[i].level).text(getMessageForKey('ae.approval.lastNotifyDate') + ' : ' +  levelDetails[i].action_taken_on.display_value);//NO I18N
				}
				else
				{
					jQuery('#levelNotifiedOn_' + levelDetails[i].level).text('');//NO I18N
				}

				if( jQuery('#statusName').text() != 'Approved' && jQuery('#statusName').text() != 'Rejected' )
				{
					if( (levelDetails[i].action_taken_on == undefined || levelDetails[i].action_taken_on.display_value == '') && !notifyTextAdded && levelDetails[i].action_taken_on != null )
					{
						jQuery('#levelNotifyLinkText_' + levelDetails[i].level).text(getMessageForKey("ae.purchase.approvalTab.notify"));//NO I18N
						levelNumber = levelDetails[i].level;

						jQuery('#levelNotifyLinkText_' + levelDetails[i].level).on("click", {"requestId" : requestId, "levelNumber" : levelNumber}, openNotificationWindow);

						notifyTextAdded = true;
						jQuery('#levelNotifyLabel_' + levelDetails[i].level).show();//NO I18N
					}
					else if( !notifyTextAdded && levelDetails[i].status.name != 'Approved' && levelDetails[i].status.name != 'Rejected' )
					{
						//No need to call this block when the level approval status is 'Approved'
						jQuery('#levelNotifyLinkText_' + levelDetails[i].level).text(getMessageForKey("ae.purchase.approvalTab.notifyAgain"));//NO I18N
						levelNumber = levelDetails[i].level;

						jQuery('#levelNotifyLinkText_' + levelDetails[i].level).on("click", {"requestId" : requestId, "levelNumber" : levelNumber}, openNotificationWindow);

						notifyTextAdded = true;
						jQuery('#levelNotifyLabel_' + levelDetails[i].level).show();//NO I18N
					}
					else
					{
						jQuery('#levelNotifyLabel_' + levelDetails[i].level).hide();//NO I18N
					}
				}
				else
				{
					jQuery('#levelNotifyLabel_' + levelDetails[i].level).hide();//NO I18N
				}

				approvalDescriptionObj = prObj.approval_details[i].approvals;

				approvalDescription = [];
				
				for ( j = 0 ; j < approvalDescriptionObj.length; j++)
				{
					approvalDescription.push( encodeHTML(approvalDescriptionObj[j].comments) )
				}
				
				updateApproverDetails( prObj.request_status.name, levelDetails[i], jsonObj.loggedUserId.id , requestId, levelDetails[i].level , approvalDescription  );
			}
			
			for( var i = 0; i < levelDetails.length; i++ )
			{
				if( !(levelDetails[i].level_status_name == 'Pending Approval' || ( i == 0 && (levelDetails[i].level_status_name == 'To Be Sent' || levelDetails[i].level_status_name == 'Rejected') )) )
				{
					jQuery(document.getElementById('levelDetails_' + (parseInt(levelDetails[i].approval_level) ))).trigger("click");
				}
			}

		}
		else
		{
			jQuery( document.getElementById('prapprovalsection') ).hide();
			jQuery( document.getElementById('pr-approvals')).hide();
		}
	}
}

function openNotificationWindow(event)
{
	openPRNotificationWindow(event.data.requestId, event.data.levelNumber);    
}

function hasRole(jsonArray, role)
{
	exists = false;
	jQuery.each(jsonArray, function(i,obj)
	{
		if (obj === role)
		{
			exists = true;
		}
	}); 
	return exists;
}

function showSimilarPRs( requestId )
{
	if( requestId == null || requestId == undefined )
	{
		showURLInDialog('/purchase/showsimilarprs.jsp?date=' + new Date().getMilliseconds(), 'modal=yes,closeButton=no,position=absmiddle,width=850', showSimilarPRshgtcal);//No I18N
	}
	else
	{
		showURLInDialog('/purchase/showsimilarprs.jsp?date=' + new Date().getMilliseconds() + '&requestId=' +requestId, 'modal=yes,closeButton=no,position=absmiddle,width=850', showSimilarPRshgtcal);//No I18N
	}
}

function showSimilarPRshgtcal() {
	var hgt = jQuery(window).height() - jQuery("#viewportdiv").offset().top - 70;
	if(hgt > 320) {
		hgt = 320;
	} else if(hgt < 120) {
		hgt = 120;
	}
	setTimeout(function(){
		jQuery("#_DIALOG_LAYER #viewportdiv").css('height',hgt+'px');//NO I18N
	},10);
}

function showPRnotification()
{
	showURLInDialog('/purchase/prnotificationtemplates.jsp?date=' + new Date().getMilliseconds(), 'modal=yes,closeButton=no,position=absmiddle,width=850');//No I18N
}
function createPOforPRs()
{
	var selectedPRs = '';

	jQuery('#purchaseRequestList').find('[name="purchaseRequestList"]').each( function()
	{
		if( jQuery(this).is(':checked') )
		{
			selectedPRs += '&requestIds=' + this.value;//NO I18N
		}
	});

	if( selectedPRs == '' )
	{
		alert(getMessageForKey('sdp.purchase.request.choose.prs.tocreate.po'));//NO I18N
	}
	else
	{
		jQuery.ajax({type: 'POST', async: false, url: '/PurchaseRequest.do?task=check_for_newly_added_products' + selectedPRs, data: '',contentType: 'application/json; charset=utf-8', dataType: 'html', success: function(responseText) { if( responseText.startsWith("[") ) {alert(getMessageForKey('sdp.purchase.request.similar.pr.withoutvendor.warn') + "  ( PR# "+responseText.substring(1,responseText.length-1).split(",").join(" , PR#") + " )")} else if( responseText != 'No unknown products' ){ showDialog(responseText, "top=20, left=90,width=750,closeButton=no"); } else {document.location="/PurchaseOrder.do?module=newPO" + selectedPRs+"&PORTALID="+PORTALID;} }, error: function(responseText) {alert( (typeof sdpToJSON != 'undefined') ? sdpToJSON(responseText) : JSON.stringify(responseText) )}});//NO I18N
	}
}

function cancelPR( requestId )
{
	if( confirm(getMessageForKey("sdp.purchase.request.cancel.confirm")) )
	{
		displayLoadingInformation(null,getMessageForKey("sdp.admin.backup.settings.save.progress.msg"), true, 1000);//No I18N

		showURLInDialog('/PurchaseApproval.do?module=get&requestId=' + requestId + '&changeStatusTo=Canceled','modal=yes,closeButton=no,position=absmiddle');//No I18N
	}
}

function closePR( requestId )
{
	if( confirm(getMessageForKey("sdp.purchase.request.close.confirm")) )
	{
		displayLoadingInformation(null,getMessageForKey("sdp.admin.backup.settings.save.progress.msg"), true, 1000);//No I18N
		
		showURLInDialog('/PurchaseApproval.do?module=get&requestId=' + requestId + '&changeStatusTo=Closed','modal=yes,closeButton=no,position=absmiddle');//No I18N

	}
}

function sendEMailTo(requestId)
{
	var url = '/Notify.do?notifyModule=PurchaseRequest&mode=E-Mail&id=' + requestId + '&notifyTo=all&subject=' + encodeURIComponent(jQuery('#prtitle').text());//NO I18N
	if(isMSP){
	    url += '&persistentAccountId='+getAccountId(); //NO I18N
	}
	NewWindow(url,'Send_e-mail','900','550','yes','center');//NO I18N
}

function sortByKey(array, key)
{
	return array.sort(function(a, b)
	{
		var x = a[key]; var y = b[key];
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}

function updateApproverDetails(statusName, levelDetails, loggedUserId, requestId, approvalLevel , comments )
{
	if( levelDetails.approvals != undefined )
	{
		var dynamicHtml = '<li><label>' + getMessageForKey("ae.purchase.mlApprover.approverheader") + ':</label></li>';//NO I18N

		var appendtodynamicHtml = '';//NO I18N 
		var loadPRPendingMessage = true;	
		for( var i = 1; i <= levelDetails.approvals.length; i++ )
		{
			//levelDetails = levelDetails.approvals[i];
			if(levelDetails.approvals[i-1].obo_approver == null){
				dynamicHtml += '<li>' + encodeHTML(levelDetails.approvals[i-1].approver.name);//NO I18N
			}else{
				dynamicHtml += '<li>' + encodeHTML(levelDetails.approvals[i-1].approver.name) + " [" + getMessageForKey("sdp.backupapprover.approver.view.info", [encodeHTML(levelDetails.approvals[i-1].obo_approver.name)]) + "]";//NO I18N
			}
			
			if( levelDetails.approvals[i-1].approver.id == loggedUserId && levelDetails.status.name == 'Pending Approval' && statusName != 'Closed' && statusName != 'Canceled' && statusName != 'Rejected' && levelDetails.approvals[i-1].status.name != "Approved" && levelDetails.approvals[i-1].status.name != "Rejected")
			{
				if( levelDetails.approvals[i-1].status.name == "Pending Approval" )
				{
					jQuery('#approveThisPR').show();//NO I18N
					jQuery('#rejectThisPR').show();//NO I18N
					
					loadPRPendingMessage = false;
					var getAppendToDynamicHtml = appendtodynamicHtml;

					appendtodynamicHtml = '<ul class="status_action_btns dib" id="ShowPRStatusMessage_' + levelDetails.level +'"><li><a href="/" sdphrefJs="js-href-purchaserequest-2" data-event="click" data-handler="javascript:openPRApprovalWindow(' + requestId + ', ' + approvalLevel + ',false,' + levelDetails.approvals[i-1].id + ')" nonce="'+sdpNonce+'"><i class="appr_tick mr5"></i> ' + getMessageForKey('ae.purchase.changePOStatus.approve') + '</a></li>';//NO I18N
					
					appendtodynamicHtml += '<li><a href="/" sdphrefJs="js-href-purchaserequest-4" data-event="click" data-handler="javascript:openPRRejectWindow(' + requestId + ', ' + approvalLevel + ',false,' + levelDetails.approvals[i-1].id + ')" nonce="'+sdpNonce+'" ><i class="reject_icon mr5"></i>' + getMessageForKey('ae.purchase.changePOStatus.reject') + '</a></li></ul>'+ getAppendToDynamicHtml;//NO I18N
				}
			}
			else
			{
				comments[i-1] = ( comments[i-1] == null ? "" : comments[i-1] );
				if( levelDetails.approvals[i-1].status.name == 'Approved' )
				{
					loadPRPendingMessage = false;
					if(levelDetails.approvals[i-1].obo_approver == null){
						appendtodynamicHtml += '</li></ul><div class="appr_status_info mt15" id="ShowPRStatusMessage_' + levelDetails.level + '"><i class="appr_tick mr5"></i>' + levelDetails.approvals[i-1].status.name + '&nbsp;' + getMessageForKey('sdp.common.by') +' <strong>'+ encodeHTML(levelDetails.approvals[i-1].approver.name) + '</strong>&nbsp;'+ getMessageForKey('sdp.purchase.history.on') + '&nbsp;<span class="appr_time">' + levelDetails.approvals[i-1].action_taken_on.display_value + '<p>' + comments[i-1].split("&#xa;").join("<br />")  + '</p></span></div>';//NO I18N
					}else{
						appendtodynamicHtml += '</li></ul><div class="appr_status_info mt15" id="ShowPRStatusMessage_' + levelDetails.level + '"><i class="appr_tick mr5"></i>' + levelDetails.approvals[i-1].status.name + '&nbsp;' + getMessageForKey('sdp.common.by') +' <strong>'+ encodeHTML(levelDetails.approvals[i-1].approver.name) + '&nbsp;[' + getMessageForKey("request.onbehalfof") + '&nbsp;' + encodeHTML(levelDetails.approvals[i-1].obo_approver.name) +']</strong>&nbsp;'+ getMessageForKey('sdp.purchase.history.on') + '&nbsp;<span class="appr_time">' + levelDetails.approvals[i-1].action_taken_on.display_value + '<p>' + comments[i-1].split("&#xa;").join("<br />")  + '</p></span></div>';//NO I18N
					}
				}
				else if( levelDetails.approvals[i-1].status.name == 'Denied' )
				{
					levelDetails.approvals[i-1].status.name = 'Rejected';
					loadPRPendingMessage = false;
					if(levelDetails.approvals[i-1].obo_approvers == null){
						appendtodynamicHtml += '</li></ul><div class="appr_status_info mt15" id="ShowPRStatusMessage_'+ levelDetails.level +'"><i class="reject_icon mr5"></i>' + levelDetails.approvals[i-1].status.name + '&nbsp;'+ getMessageForKey('sdp.common.by') +' <strong>'+ encodeHTML(levelDetails.approvals[i-1].approver.name) + '</strong>&nbsp;'+ getMessageForKey('sdp.purchase.history.on') + '&nbsp;<span class="appr_time">'  + levelDetails.approvals[i-1].action_taken_on.display_value + '<p>' + comments[i-1].split("&#xa;").join("<br />")  +'</p></span></div>';//NO I18N
					}else{
						appendtodynamicHtml += '</li></ul><div class="appr_status_info mt15" id="ShowPRStatusMessage_'+ levelDetails.level +'"><i class="reject_icon mr5"></i>' + levelDetails.approvals[i-1].status.name + '&nbsp;'+ getMessageForKey('sdp.common.by') +' <strong>'+ encodeHTML(levelDetails.approvals[i-1].approver.name) + '&nbsp;[' + getMessageForKey("request.onbehalfof") + '&nbsp;' + encodeHTML(levelDetails.approvals[i-1].obo_approver.name) +']</strong>&nbsp;'+ getMessageForKey('sdp.purchase.history.on') + '&nbsp;<span class="appr_time">'  + levelDetails.approvals[i-1].action_taken_on.display_value + '<p>' + comments[i-1].split("&#xa;").join("<br />")  +'</p></span></div>';//NO I18N
					}
				}
			}
			
			if( i < levelDetails.approvals.length )
			{
				dynamicHtml += '<span>(' + levelDetails.rule.value + ')</span></li>';//No I18N
			}
		}

		if ( loadPRPendingMessage == true )
		{
			jQuery( "#levelStatus_"+levelDetails.level ).attr( {"class" : "status_pend" } );
			if(levelDetails.status.name == "Pending Approval") {
				appendtodynamicHtml += '<span class="appr_status_info approval-status-pending ml15" id="ShowPRStatusMessage_' + levelDetails.level +'">' + getMessageForKey('sdp.purchase.status.pendingapproval') + '</span>';//NO I18N
			}
			else {
                        appendtodynamicHtml += '<span class="appr_status_info approval-status-pending ml15" id="ShowPRStatusMessage_' + levelDetails.level +'">' + getMessageForKey('sdp.approval.status.tobesent') + '</span>';//NO I18N
			}
		}


		jQuery(document.getElementById('levelApprovers_' + levelDetails.level)).html('');
		
		jQuery(document.getElementById('levelApprovers_' + levelDetails.level)).append(dynamicHtml);
		
		if ( levelDetails.level != 1 )
		{
		jQuery( document.getElementById( 'level_' + levelDetails.level ) ).find("#ShowPRStatusMessage_1").remove();
		}	
		
		jQuery(document.getElementById('level_' + levelDetails.level)).append( appendtodynamicHtml );

		$sdEventListener(document.getElementById('level_' + levelDetails.level));
		
		
	}
}
function addPRApprovalSection( thisRow,index)
{

	if( document.createElement && document.childNodes && thisRow!=null)
	{
		//var gUniqueRowID = parseInt(thisRow.id.split("_")[1]) + 1;

		var newElement = thisRow.cloneNode(true);

		newElement.id = "level_" + index;

		thisRow.parentNode.appendChild(newElement);

		jQuery(newElement).find('[id^=levelApprovers]').each(function()
		{
				jQuery(this).attr('id', this.id.split("_")[0] + '_' + index);
		});

		return newElement;
	}
	return null;
}
function addApprovalRow(thisRow,index)
{
	if( document.createElement && document.childNodes && thisRow!=null)
	{
		//var gUniqueRowID = parseInt(thisRow.id.split("_")[1]) + 1;

		var newElement = thisRow.cloneNode(true);

		newElement.id = "levelDetails_" + index;

		thisRow.parentNode.appendChild(newElement);

		jQuery(newElement).find('[id^=level]').each(function()
		{
			jQuery(this).attr('id', this.id.split("_")[0] + '_' + index);
		});
		
		return newElement;
	}
	return null;
}

function addHistoryDetailsRow(thisRow, index, lastAddedIndex)
{
	if( document.createElement && document.childNodes )
	{
		//var gUniqueRowID = parseInt(thisRow.id.split("_")[2]) + 1;
		var gUniqueRowID = index + 1; 

		var newElement = thisRow.cloneNode(true);

		newElement.id = "historyDetails_" + + lastAddedIndex + '_' + gUniqueRowID;//NO I18N

		if( lastAddedIndex == 1)
		{
			//jQuery(newElement).removeClass('hide');//No I18N
			jQuery(newElement).show();
		}
		else
		{
			//jQuery(newElement).addClass('hide');//No I18N
			jQuery(newElement).hide();
		}

		thisRow.parentNode.appendChild(newElement);

		jQuery(newElement).find('[id^=history]').each(function()
		{
			jQuery(this).attr('id', this.id.split("_")[0] + '_' + gUniqueRowID);
		});
		return newElement;
	}
	return null;
}

function addHistoryHeaderRow(thisRow)
{
	var gUniqueRowID = 0;

	if( document.createElement && document.childNodes )
	{
		gUniqueRowID = parseInt(thisRow.id.split("_")[1]) + 1;

		var newElement = thisRow.cloneNode(true);

		newElement.id = "historyHead_" + gUniqueRowID;

		jQuery(newElement).removeClass('hide');//No I18N

		thisRow.parentNode.appendChild(newElement);

		jQuery(newElement).find('[id^=header]').each(function()
		{
			jQuery(this).attr('id', this.id.split("_")[0] + '_' + gUniqueRowID);
		});
	}
	return gUniqueRowID;
}

function showHideHistory( thisObj )
{
	var index = thisObj.id.split("_")[1];//NO I18N

	//jQuery('#historyDetails_' + index).toggle();//NO I18N
		
	jQuery('#purchaseHistory').find('[id^=historyDetails_' + index + ']').each(function()
	{
		jQuery(this).toggle();
	});

	if( jQuery('#headerExpand_' + index).hasClass('hide') )
	{
		jQuery('#headerExpand_' + index).removeClass('hide');//NO I18N
		jQuery('#headerCollapse_' + index).addClass('hide');//NO I18N
	}
	else
	{
		jQuery('#headerExpand_' + index).addClass('hide');//NO I18N
		jQuery('#headerCollapse_' + index).removeClass('hide');//NO I18N
	}
}

function showHideApproval( obj )
{
	jQuery('#level_' + obj.id.split("_")[1]).toggle();//NO I18N
}

function replaceNewLineChar( value )
{
	try
	{
		var index = value.indexOf('\\n');

		while( index >= 0 )
		{
			value = value.replace('\\n', '<br>');

			index = value.indexOf('\\n');
		}
	}
	catch(e)
	{
	}
	return value;
}

function populatePRFieldValues(jsonObject, isPOCreated, isItemReceived)
{
	var result = null;

	if( jsonObject != null && jsonObject != undefined )
	{
		result = jsonObject.purchaserequests;
		
		jQuery.each(result, function(key, value)
		{
			if( value != null && typeof value != 'object' )
			{
				if( key != 'site' && key != 'requester' )
				{
					jQuery("[name='" + key + "']").val( replaceHTMLCode( value.toString() ) );//NO I18N
				}
			}
			else if( value != null && (key == 'date_required' || key == 'requested_date') )
			{
				jQuery( document.getElementById(key) ).siblings(document.getElementsByClassName('dateformatLabel')).hide();//NO I18N
				jQuery("[name='" + key + "']").val(value.display_value);//NO I18N
			}
			else if( key == 'site' )
			{
				if( isItemReceived )
				{
					jQuery("[name='" + key + "']").prop("disabled",false);//NO I18N
					jQuery("[name='" + key + "']").attr("onchange","");//NO I18N
				}
			}
			else if( key == 'costcenter' || key == 'priority' || key == 'purchase_type' || key == 'vendor' || key == 'technician' )
			{
				if( value != null )
				{
					if( key == 'technician' && !jQuery("[name='" + key + "']:contains("+encodeHTML(value.name)+")").length)
					{
						//this fix is used for when the technician is not coming from given site.
						//this case is occured while technician is change from one site to another.
						jQuery("[name='" + key + "']").append(jQuery("<option/>", {
							value: parseInt(value.id),
							text: encodeHTML(value.name)
						})).val( parseInt(value.id) );
					}
					else
					{
						jQuery("[name='" + key + "']").val(value.id);//NO I18N
					}
					if( key == 'costcenter' && !jQuery("[name='" + key + "']:contains("+encodeHTML(value.name)+")").length)
					{
						//this fix is used for when the costcenter is not coming from given site.
						//this case is occured while costcenter is change from one site to another.
						jQuery("[name='" + key + "']").append(jQuery("<option/>", {
							value: parseInt(value.id),
							text: encodeHTML(value.name +','+value.code)
						})).val(parseInt(value.id));
					}
					else
					{
						jQuery("[name='" + key + "']").val(value.id);//NO I18N
					}

				}

				if( key == "vendor" )
				{
					jQuery("[name='" + key + "']").attr( "setEstimatedCost" , "false");//NO I18N
				}
			}
			else if( value != null && key == 'udf_fields' )
			{
				jQuery.each(result.udf_fields, function(key, udf_value)
				{
					if( udf_value != null )
					{
						if( udf_value.hasOwnProperty("display_value") )
						{
							jQuery( document.getElementById(key) ).siblings(document.getElementsByClassName('dateformatLabel')).hide();//NO I18N
							jQuery("[name='" + key + "']").val(udf_value.display_value);//NO I18N
						}
						else
						{
							jQuery("[name='" + key + "']").val( replaceHTMLCode( udf_value.toString() ));//NO I18N
						}
					}
				});
			}

			if ( isPOCreated ) 
			{
				jQuery( "#addproduct" ).remove();

				if ( key === 'vendor' || key === 'date_required' || key === 'costcenter')
				{
					jQuery("[name='" + key + "']").prop("disabled", false);//NO I18N
					jQuery("[name='" + key + "']").attr("onchange","");//NO I18N
					jQuery("[name='" + key + "']").addClass("graybg fontgray");//NO I18N
				}
			}
		});
		if ( isPOCreated && jQuery( document.getElementById( 'date_required' ) ).val() == ""  )
		{
			jQuery( document.getElementById( 'date_required' ) ).siblings(document.getElementsByClassName('dateformatLabel')).css("z-index" , 0);//NO I18N
		}

		jQuery("#site").attr( "associatedSRs" , ( jsonObject.hasOwnProperty("associatedSRsForPR") ? jsonObject.associatedSRsForPR : "null" ));
	}
	var itemDetails = result.requested_items;

	if( itemDetails != undefined && itemDetails.length > 0 )
	{
		var itemRowIndex = 1;	

		jQuery.each(itemDetails, function(key, json)
		{
			/*if( json.hasOwnProperty('product') )
			{
				jQuery('#product_' + itemRowIndex).val(json.product);
			}*/
			if( json.hasOwnProperty('item_name') )
			{
				jQuery('#item_name_' + itemRowIndex).val( replaceHTMLCode( json.item_name ) );//NO I18N
				
				if ( isPOCreated )
				{
					jQuery('#item_name_' + itemRowIndex).prop("disabled", false);//NO I18N
				}
			}
			if( json.hasOwnProperty('item_desc') && json.item_desc != null )
			{
				jQuery('#item_desc_' + itemRowIndex).val( replaceHTMLCode( json.item_desc ) );//NO I18N
			}
			if( json.hasOwnProperty('quantity') )
			{
				jQuery('#quantity_' + itemRowIndex).val(json.quantity);
				
				if ( isPOCreated )
				{
					jQuery('#quantity_' + itemRowIndex).prop("disabled", false);//NO I18N
				}
			}
			if( json.hasOwnProperty('estimated_cost') )
			{
				json.estimated_cost = ( json.estimated_cost == 0 ? "0.00" : ( json.estimated_cost % 1 == 0 ? json.estimated_cost.toFixed(2) : json.estimated_cost ));

				jQuery('#estimated_cost_' + itemRowIndex).val((parseFloat(json.estimated_cost)).toFixed(2));
				
				if ( isPOCreated )
				{
					jQuery('#estimated_cost_' + itemRowIndex).prop("disabled", false);//NO I18N
				}
			}

			if( itemRowIndex < itemDetails.length )
			{
				addNewItemRow(document.getElementById('itemDetails_' + itemRowIndex));
			}

			itemRowIndex++;
		});

		jQuery('[id^="estimated_cost_"]').trigger('blur');
		
		if ( isPOCreated )
		{
			jQuery('[id^=addLicenseImg_]').each( function () { jQuery(this).hide().removeAttr("onclick");});//NO I18N
		}
	}
	
	var levelDetails = result.approval_details;

	var levelRowIndex = 1;

	if( levelDetails != undefined && levelDetails.length > 0 )
	{
		levelDetails = sortByKey(levelDetails, 'level');//No I18N
		jQuery('#enableApproval').attr( "prStatusName" , result.request_status.name );//NO I18N

		jQuery.each(levelDetails, function(key, json)
		{
			jQuery('#condition_' + levelRowIndex).val(json.rule.value);
			jQuery('#levelstatus_' + levelRowIndex).val(json.status.name);

			if( levelRowIndex < levelDetails.length )
			{
				addNextLevel(document.getElementById('approverLevelRow_' + levelRowIndex));
			}

			updateLevelApproverList(json.approvals, levelRowIndex, json.rule.value);

			levelRowIndex++;
		});
		
		if( isPOCreated || result.request_status.name == "Rejected" )
		{
			if( jQuery('#enableApproval').prop('checked') )
			{
				jQuery('#enableApproval').hide().removeAttr("onchange").next().hide();//NO I18N
				jQuery('#approvalTitle').parent().hide();//NO I18N
				jQuery('#enableApproval').hide().removeAttr("onchange").next().hide();//NO I18N
			}
		}
		if( result.request_status.name == "Approved" )
		{
			jQuery("#enableApproval").parent().hide();
		}
	}
	else
	{
		jQuery('#poApprovalTable').hide();//NO I18N
		jQuery('#enableApproval').prop('checked', false);//NO I18N
		
		if( isPOCreated )
		{
			jQuery('#approvalTitle').parent().hide();//NO I18N
			jQuery('#enableApproval').hide().removeAttr("onchange").next().hide();//NO I18N
		}
	}
}

function updateLevelApproverList( approvers, levelRowIndex, condition )
{
	if( approvers != undefined && approvers.length > 0  )
	{
		var list = '';
		var option = '';

		var noOfApprovers = approvers.length;

		var count = 1;

		jQuery.each(approvers, function(key, json)
		{
			if( noOfApprovers == count )
			{
				condition = null;
			}

			var approver_id, approver_name;
			if(json.obo_approvers != undefined){
				approver_id = json.obo_approvers.obo_id;
				approver_name = json.obo_approvers.obo_name;
			}else {
				approver_id = json.approver.id;
				approver_name = json.approver.name;
			}
			list = updatePOApproverList(list, approver_id, approver_name, json.cost_limit, condition);
			option = updatePOApproverSelectList(option, approver_id, approver_name, json.cost_limit);
			count++;
		});
		
		jQuery('#approverLevelRow_' + levelRowIndex).find('div').html(list);//NO I18N
		jQuery('#approverLevelRow_' + levelRowIndex).find('select').html(option);//NO I18N
		
		if ( isPOCreated || jQuery('#enableApproval').attr("prStatusName") == "Rejected" )
		{
			jQuery('#approverLevelRow_' + levelRowIndex).find('div span').removeAttr("onmouseover").removeAttr("onmouseout");//NO I18N
			jQuery('[id^=usersicon_]').each( function () { jQuery(this).hide().removeAttr("onclick");});//NO I18N
			jQuery('[id^=addLevelImg_]').each( function () { jQuery(this).hide().removeAttr("onclick");});//NO I18N
			jQuery('[id^=deleteLevelImg_]').each( function () { jQuery(this).hide().removeAttr("onclick");});//NO I18N
		}
	}
}

function changeSelectTagUI( jsonObj, noOfOptionsToBeDisplayed)
{
	var siteId = -1;
	var siteName = getMessageForKey("sdp.admin.technician.addtechnician.nosite");//NO I18N
	
	if( jQuery('#serviceSiteId').length > 0 )
	{
		siteId = jQuery('#serviceSiteId').val();
		siteName = jQuery('#serviceSiteName').val();
	}

	var userId = -1;
	var userName = getMessageForKey("sdp.purcase.request.select.requester");//NO I18N

	if( jQuery('#serviceRequesterId').length > 0 )
	{
		userId = jQuery('#serviceRequesterId').val();
		userName = jQuery('#serviceRequesterName').val();
	}

	if( jsonObj != null )
	{
		if( jsonObj.purchaserequests.site != null )
		{
			siteId = jsonObj.purchaserequests.site.id || siteId;
			siteName = replaceHTMLCode(jsonObj.purchaserequests.site.name) || siteName;
		}

		if( jsonObj.purchaserequests.requester != null )
		{
			userId = jsonObj.purchaserequests.requester.id || userId;
			userName = replaceHTMLCode(jsonObj.purchaserequests.requester.name) || userName;
		}
	}
	jQuery("#priority").select2({formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message') }});
	jQuery("#technician").select2({formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message') }});
	jQuery("#purchase_type").select2({formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message') }});
	jQuery("#costcenter").select2({formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message') }});
	jQuery("#vendor").select2({formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message') }});

	if( jQuery( "#site" ).attr( "mandatory" ) == "true" )
	{
		if( siteName == getMessageForKey("sdp.admin.technician.addtechnician.nosite") )
		{
			siteName = getMessageForKey( "sdp.asset.assignOwner.chooseSite" );
		}
		openSelect2Dropdown('/usersites.json?noallsiteoption=no', 'site', siteId, siteName , noOfOptionsToBeDisplayed);//NO I18N
	}
	else
	{
		openSelect2Dropdown('/usersites.json?noallsiteoption=yes', 'site', siteId , siteName , noOfOptionsToBeDisplayed);//NO I18N
	}

	openSelect2Dropdown('/allusers.json', 'requester', userId, userName);//NO I18N
	jQuery('#subject').trigger('focus');
}

function submitPRDetails(serviceRequestId)
{
	var tagTR = jQuery("#requestedItemTable tbody tr");

	if(tagTR.length == 2)
	{
		alert(getMessageForKey("sdp.purchase.newproduct.select.errmsg"));
		location.reload();
		return;
	}

	if( validateFormFieldValues('newPRForm') )
	{
		try
		{
			jQuery('#processing').removeClass('hide');//No I18N
			jQuery('#saving').addClass('hide');//No I18N

			/*if( !jQuery('#enableApproval').is(':checked') )
			{
				jQuery('#poApprovalTable tr').each(function(){
					jQuery(this).remove();
				});
			}*/

			var formData = convertFormToJSON('#purchaseRequest','#pradditionalInfo');//NO I18N

			if( markAsAboveCostLimitElement() )
			{
				alert(getMessageForKey("ae.purchase.mlApprover.LevelApprover.abovecostlimit"));
				jQuery('#processing').addClass('hide');jQuery('#saving').removeClass('hide');//NO I18N
				return;
			}
			
			var param = jQuery('#operation').val();

			checkUpdatePR = false;

			if("updatePR" == param)
			{
				checkUpdatePR = true;
				param += "&requestId=" + jQuery('#requestId').val();//NO I18N
			}

			chooseVendor = jQuery("#savePR").attr("choosevendor");

			if( chooseVendor != undefined && chooseVendor )
			{
				if( formData.vendor == null )
				{
					showBaloonToolTip("vendor",getMessageForKey('sdp.purchase.addNew.general.selectOp0'));//NO I18N
					jQuery('#processing').addClass('hide');jQuery('#saving').removeClass('hide');//NO I18N
					return;
				}
				else
				{
					param += "&redirectToNewPOPage=" + chooseVendor;//NO I18N
				}
			}
			else
			{
				param += "&redirectToNewPOPage=false";//NO I18N
			}
			
			var isPOCreateRole = jQuery('#isPOCreateRole').val();

			//Removing unwanted keys
			delete formData[''];
			delete formData['sdpcsrfparam'];
			delete formData.udf_fields['sdpcsrfparam'];

			var finalParam = "input_data="+encodeURIComponent('{"purchaserequests":' + JSON.stringify(formData) + '}');//NO I18N


			jQuery.ajax({type: 'POST', url: '/PurchaseRequest.do?task=' + param, data: finalParam, dataType: 'json', success: function(jsonObj) { if( jsonObj.status == 200 ) { if( document.getElementById('prsectionLoad') ) { document.location="/PurchaseRequest.do?task=viewPR&requestId="+Number(jsonObj.request_id)+"&sectionLoad=false&PORTALID="+PORTALID  } else{ updateNewPRResponse(serviceRequestId, jsonObj.request_id, jsonObj.createNewPO); if(isPOCreateRole != undefined && isPOCreateRole == 'true'){callCustomAjaxRequestForGET( "/PurchaseRequest.do" , 'task=similarrequest'  , loadsimilarrequest , ajaxRequestOnFailure , 'addpurchaserequest');} } }else{alert(jsonObj.errorMessage);jQuery('#processing').addClass('hide');jQuery('#saving').removeClass('hide')} }, error: function(jsonObj) {if(jsonObj.responseText.indexOf('/jsp/AuthError.jsp') !== -1) {alert(getMessageForKey('sdp.common.operation.autherror'))} else {alert(getMessageForKey('sdp.api.errormessage.invalid.inputdata'))};jQuery('#processing').addClass('hide');jQuery('#saving').removeClass('hide')} });//NO I18N
		}
		catch(e)
		{
			jQuery('#processing').addClass('hide');jQuery('#saving').removeClass('hide');//NO I18N
			alert(e.message);
		}
		if(!(window.opener && window.opener.req_module)) {
			resize();
			jQuery('.pr-details-wrap').getNiceScroll().resize();
		}
	}
}

function updateNewPRResponse(serviceRequestId, purchaseRequestId, createNewPO)
{
	if( serviceRequestId != null)
	{
		if(window.opener.req_module) {
			window.opener.$req.details.updateRequestTemplates("purchase");	//No I18N
		} else {
			window.opener.document.location = "/WorkOrder.do?woMode=viewWO&woID=" + serviceRequestId;
		}
		setTimeout(function(){self.close()}, 500);
	}
	else
	{
		if ( createNewPO == "true" )
		{
			//document.location = "/PurchaseOrder.do?module=newPO&requestIds=" + purchaseRequestId;
			//newPurchaseOrder(purchaseRequestId);
			checkForNewlyAddedProducts(purchaseRequestId);
		}
		else
		{
			//document.location = "/PurchaseRequest.do?task=viewPR&requestId=" + purchaseRequestId;
			showPRDetails(purchaseRequestId);
			$prList.init('purchase_request', null, null, false,null,null); //NO I18N
		}
	}
}

function associateSRstoPR(requestId)
{
	var param = '';

	jQuery("[name=allServiceRequests]").each(function()
	{
		if( this.checked )
		{
			param += '&serviceRequestIds=' + this.value;//NO I18N
		}
	});

	if( param == '' )
	{
		alert(getMessageForKey('sdp.purchase.request.choose.srs.toassociate.pr'));
	}
	else
	{
		jQuery('#processing').removeClass('hide');//No I18N
		jQuery('#saving').addClass('hide');//No I18N
		jQuery.ajax({
			type: 'POST',//NO I18N
			url: '/PurchaseRequest.do?task=associateSRsToPR&requestId=' + requestId + param,//NO I18N
			data: '',
			contentType: 'application/json; charset=utf-8', //NO I18N
			dataType: 'text',//NO I18N 
			success: function(responseText) 
			{ 
				associateSRsSuccess(responseText, requestId)
			},
		       	error: function(jsonObj) 
			{
				alert(jsonObj);
				jQuery('#processing').addClass('hide');
				jQuery('#saving').removeClass('hide')
			} 
		});//NO I18N
	}
}

function associateSRsSuccess( responseText, requestId)
{
	if( responseText == 'success' )
	{
		jQuery( "#associatedSRsToPR" , window.opener.document ).children().not( document.getElementById("srItem-sample") ).remove();
		window.opener.loadAssociatedSRsToPurchaseRequest( requestId );
		window.opener.loadPRTabDetails( opener.document.getElementById('pr-history') , requestId , true );
		setTimeout(function(){self.close()}, 500);
	}
	else
	{
		jQuery('#processing').addClass('hide');jQuery('#saving').removeClass('hide');
		alert(responseText);
	}
}

function showPurchaseRequestTab(tabID)
{
	showSoftwareTab(tabID);
}

function loadPRTabDetails( tab, requestId , mandatoryLoad )
{
	if( tab.id == 'pr-history' )
	{
		if( mandatoryLoad == true )
		{
			jQuery( document.getElementById( "purchaseHistory" ) ).children().not("#historyHead_0,#historyDetails_0_0").remove();//NO I18N
		}

		var length = jQuery('#purchaseHistory').children().length;//NO I18N

		if( length == 2 )
		{
			jQuery.ajax({type: 'GET', url: '/PurchaseRequest.do?task=showHistory&requestId=' + requestId, contentType: 'application/json; charset=UTF8', dataType: 'text', success: function(jsonObj) { showPurchaseRequestHistory(JSON.parse(jsonObj));}, error: function(jsonObj) { showPurchaseRequestHistory(  JSON.parse(jsonObj.responseText) )}});//NO I18N
		}
	}
	else if( tab.id == 'pr-servicerequests' )
	{
		if( jQuery('#pr-servicerequests-content').text() == '' )
		{
			jQuery.ajax({type: 'GET', url: '/PurchaseRequest.do?task=showAssociatedSR&requestId=' + requestId, contentType: 'application/json; charset=UTF8', dataType: 'text', success: function(jsonObj) { showAssociatedSRDetails(jsonObj);}});//NO I18N
		}
	}
}

function showAssociatedSRDetails( responseObj )
{
	jQuery('#pr-servicerequests-content').html(responseObj);
}

function showPurchaseRequestHistory( jsonObj )
{
	if( jsonObj.purchaseHistory != undefined )
	{
		var historyLength = jsonObj.purchaseHistory.length;

		if( historyLength != undefined && historyLength > 0 )
		{
			var lastAddedIndex = 0;

			for( var i = 0; i < historyLength; i++ )
			{
				lastAddedIndex = updateHistoryDetails(i, jsonObj.purchaseHistory[i], jsonObj.additionalFieldAliases, lastAddedIndex);
			}
		}
		else
		{
			updateHistoryDetails(0, jsonObj.purchaseHistory, jsonObj.additionalFieldAliases, 0);
		}
		enableHistoryScriptsFromPurchaseRequest();
		//jQuery('#headerExpand_1').addClass('hide');
		//jQuery('#headerCollapse_1').removeClass('hide');
	}
}

function enableHistoryScriptsFromPurchaseRequest()
{
	/*jQuery(document).on('click','.history-toggleheader i',function() //NO I18N
	{
		var visible = false;

		if( jQuery(this).attr('class') == 'ui-expand' )
		{
			jQuery(this).removeAttr('class').addClass('ui-collapse');// NO I18N
			visible = true;
		}
		else
		{
			jQuery(this).removeAttr('class').addClass('ui-expand');// NO I18N
		}

		jQuery('[id^=historyDetails_' + this.id.split("_")[1] + ']').each(function()
		{
			if( visible )
			{
				//jQuery(this).show();
				jQuery(this).slideDown('slow'); // NO I18N
			}
			else
			{
				//jQuery(this).hide();
				jQuery(this).slideUp('slow'); // NO I18N
			}
		});
	});*/
	historyExpandCollapse();
}
jQuery(document).ready(function(){
	enableHistoryScriptsFromPurchaseRequest();
});

function updateHistoryDetails( i, jsonObj, additionalFieldAliases, lastAddedIndex)
{
	if( jQuery('#headerHistoryDate_' + lastAddedIndex).text() != jsonObj.changed_date )
	{
		lastAddedIndex = addHistoryHeaderRow(document.getElementById('historyHead_' + lastAddedIndex));//NO I18N
		
		jQuery('#headerHistoryDate_' + lastAddedIndex).text(jsonObj.changed_date.display_value);

		if( lastAddedIndex != 1 )
		{
			jQuery('#headerIndex_' + lastAddedIndex).removeAttr('class').addClass('ui-expand');// NO I18N
		}
		else
		{
			jQuery('#headerIndex_' + lastAddedIndex).removeAttr('class').addClass('ui-collapse');// NO I18N
		}
	}

	addHistoryDetailsRow(document.getElementById('historyDetails_0_0'), i, lastAddedIndex);//NO I18N

	var content = getMessageForKey('sdp.change.history.owner') + '&nbsp;<b>' + encodeHTML(jsonObj.updated_by) + '</b>&nbsp;'//NO I18N
	if(jsonObj.integration_key) {
		content += '<br>' + getMessageForKey('sdp.integration.key.history.performed.by', ['<b>' + encodeHTML(jsonObj.integration_key) + '</b>']) + '</b>&nbsp;'//NO I18N
	}
	jQuery('#historyHeader_' + (i+1)).html(content);
	jQuery('#historyTime_' + (i+1)).html(encodeHTML(jsonObj.changed_time));

	var historyDetails = jQuery('#historyData_' + (i+1));//NO I18N

	var diffLength = jsonObj.history_details.length;

	var data = '';//No I18N

	var historyCAO = null;

	for( var j = 0; j < diffLength; j++ )
	{
		var detailsObj = jsonObj.history_details[j];

		historyCAO = historyDetails[detailsObj.column_name + '+' + detailsObj.operation];

		if( historyCAO != null )
		{
			data += '<li>' + getMessageForKey(historyCAO) + '</li>';//NO I18N
		}
		else
		{
			var displayName = historyColumnI18N[detailsObj.column_name];

			if( displayName == null )
			{
				if( displayName == null && additionalFieldAliases != undefined )
				{
					displayName = additionalFieldAliases[detailsObj.column_name];
				}

				if( displayName == null )
				{
					displayName = detailsObj.column_name;
				}
			}
			else
			{
				displayName = getMessageForKey(displayName);
			}

			detailsObj.previous_value = ( detailsObj.previous_value != null ? encodeHTML(detailsObj.previous_value).split("&#xa;").join("<br />") : detailsObj.previous_value );
			detailsObj.latest_value   = ( detailsObj.latest_value != null ? encodeHTML(detailsObj.latest_value ).split("&#xa;").join("<br />") : detailsObj.latest_value );
			detailsObj.relative_column_value = ( detailsObj.relative_column_value != null ? encodeHTML(detailsObj.relative_column_value).split("&#xa;").join("<br />") : null );
			displayName = ( displayName != null ? encodeHTML(displayName) : displayName );

			if( detailsObj.operation == 'U' || detailsObj.operation == 'EU' || detailsObj.operation.startsWith('zia') || detailsObj.operation.startsWith('platform_ai'))
			{

				if( detailsObj.relative_column == 'APPROVALLEVEL' )
				{
					if( detailsObj.previous_value == "or" )
					{
						levelConditionChangedFrom = getMessageForKey("sdp.purchase.request.approver.levelcondition.changed.message0");
						levelConditionChangedTo   = getMessageForKey("sdp.purchase.request.approver.levelcondition.changed.message1");
						data += '<li>' + getMessageForKey("sdp.purchase.request.history.approvallevel", [detailsObj.relative_column_value, levelConditionChangedFrom, levelConditionChangedTo]) + '</li>';//NO I18N
					}
					else
					{
						levelConditionChangedFrom = getMessageForKey("sdp.purchase.request.approver.levelcondition.changed.message1");
						levelConditionChangedTo   = getMessageForKey("sdp.purchase.request.approver.levelcondition.changed.message0");
						data += '<li>' + getMessageForKey("sdp.purchase.request.history.approvallevel", [detailsObj.relative_column_value, levelConditionChangedFrom, levelConditionChangedTo]) + '</li>';//NO I18N
					}
				}
				else if( detailsObj.column_name == 'APPROVALREMINDER' )
				{
					data += '<li>' + getMessageForKey('sdp.purchase.approval.reminder.history', [detailsObj.latest_value]) + '</li>';//NO I18N  
				}
				
				else if( detailsObj.relative_column == 'LEVEL_NUMBER' || detailsObj.relative_column == 'level')
				{
					if( detailsObj.column_name == 'APPROVAL_STATUS' )
					{
					   //zia starts
					    var actionMode = "";
                        if(detailsObj.operation == 'EU')
                        {
                        	//actionMode = getMessageForKey("sdp.approvalemail.action.byemail"):
                        	actionMode = getMessageForKey("approvalemail.action.byemail")+"&nbsp;:&nbsp;"+getMessageForKey("common.emailreply");//NO I18N
                        }
						if (detailsObj.operation.startsWith('zia') || detailsObj.operation.startsWith('platform_ai')) {
							actionMode = translate("approvalemail.action.byemail") + "&nbsp;:&nbsp;";      //NO I18N
							if (detailsObj.operation.startsWith('zia')) {
								actionMode += translate("admin.zia");//NO I18N
								if (detailsObj.operation.endsWith('gpt')) { //If predicted by Zia Fallback - GPT
									actionMode += "&nbsp;(" + translate("zia.gpt.history") + ")";   //NO I18N
								}
								//If predicted directly using GPT
							} else if (detailsObj.operation.endsWith('gpt')) {  //NO I18N
								actionMode += translate("chatgpt.label");//NO I18N
							}
						}
						//zia ends
    					if( detailsObj.latest_value == 'A' )
                        {
                            data += '<li>' + getMessageForKey('sdp.purchase.request.history.approvedby', [detailsObj.previous_value, detailsObj.relative_column_value]) + '<br>'+actionMode +  '</li>';//NO I18N
                        }
                        else
                        {
                            data += '<li>' + getMessageForKey('sdp.purchase.request.history.rejectedby', [detailsObj.previous_value, detailsObj.relative_column_value]) + '<br>'+ actionMode + '</li>';//NO I18N
                        }
					}
					
					else if( detailsObj.column_name == 'LEVELSTATUSID' )
					{
						if( detailsObj.latest_value == '1' )
						{
							data += '<li>' + getMessageForKey('sdp.purchase.request.history.level.approved', [detailsObj.relative_column_value]) + '</li>';//NO I18N 
						}
						else if( detailsObj.latest_value == '2' )
						{
							data += '<li>' + getMessageForKey('sdp.purchase.request.history.level.rejected', [detailsObj.relative_column_value]) + '</li>';//NO I18N 
						}
					}
				}
				else
				{
					if( detailsObj.relative_column != null )
					{
						data += '<li>' + getMessageForKey(historyColumnI18N[detailsObj.relative_column]) + ' [' + detailsObj.relative_column_value + '] ' + getMessageForKey('sdp.requests.history.modified', [displayName, (detailsObj.previous_value == null ? '(' + getMessageForKey('sdp.admin.requesterDef.none') + ')' : detailsObj.previous_value), detailsObj.latest_value]) + '</li>';//NO I18N
					}
					else
					{
						data += '<li>' + getMessageForKey('sdp.requests.history.modified', [displayName, (detailsObj.previous_value == null ? '(' + getMessageForKey('sdp.admin.requesterDef.none') + ')' : detailsObj.previous_value), (detailsObj.latest_value == null ? '(' + getMessageForKey('sdp.admin.requesterDef.none') + ')' :  ( detailsObj.latest_value == "Canceled" ? '<b class="status-canceled">' + detailsObj.latest_value + '</b>' : '<b>' + detailsObj.latest_value + '</b>') )]) + '</li>';//NO I18N
					}
				}
			}
			else if(detailsObj.operation == 'APPROVAL_VERIFIED')
					{
						jQuery('#historyHeader_' + (i+1)).html(getMessageForKey('zia.approval.verifiedby') +'&nbsp;'+getMessageForKey('sdp.common.by')+ '&nbsp;<b>' + encodeHTML(jsonObj.updated_by) + '</b>&nbsp;');//NO I18N
						if(detailsObj.column_name == 'APPROVAL_MAIL_CONTENT')
						{
							data += '<li>'+getMessageForKey("zia.approval.mailcontent")+' : <b>'+detailsObj.latest_value+'</b></li>';// NO I18n
						}
						else if(detailsObj.column_name == 'ZIA_PREDICTED_AS')
						{
							data += '<li>'+getMessageForKey("zia.approval.predictedas")+' : <b>'+detailsObj.latest_value+'</b></li>';// NO I18n
						}
						else if(detailsObj.column_name == 'USER_VERIFIED_AS')
						{
							data += '<li>'+getMessageForKey("zia.approval.verifiedas")+' : <b>'+detailsObj.latest_value+'</b></li>';// NO I18n
						}
						else if(detailsObj.column_name == 'USER_VERIFIED_ACTION')
						{
							data += '<li>'+getMessageForKey("zia.approval.verifiedaction")+' : <b>'+detailsObj.latest_value+'</b></li>';// NO I18n
						}
					}
			else if( detailsObj.operation == 'C' )
			{
				if( (detailsObj.relative_column == 'LEVEL_NUMBER' || detailsObj.relative_column == 'level') && detailsObj.column_name == 'APPROVERID' )
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.history.addnewapprover', [detailsObj.latest_value, detailsObj.relative_column_value]) + '</li>';//NO I18N
				}
				else if( detailsObj.column_name == 'APPROVALLEVEL' || detailsObj.column_name == 'level')
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.history.addedlevel', [detailsObj.latest_value]) + '</li>';//NO I18N
				}
				else if( detailsObj.column_name == 'ITEMNAME' )
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.history.addedproduct', [detailsObj.latest_value]) + '</li>';//NO I18N
				}
				else if( detailsObj.column_name == 'STATUSID' )
				{
					data += '<li>' + getMessageForKey('sdp.requests.history.modified', [displayName, (detailsObj.previous_value == null ? '(' + getMessageForKey('sdp.admin.requesterDef.none') + ')' : detailsObj.previous_value), (detailsObj.latest_value == null ? '(' + getMessageForKey('sdp.admin.requesterDef.none') + ')' :  ( detailsObj.latest_value == "Canceled" ? '<b class="status-canceled">' + detailsObj.latest_value + '</b>' : '<b>' + detailsObj.latest_value + '</b>') )]) + '</li>';//NO I18N
				}
				else if( detailsObj.column_name == 'REQUESTID' )
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.history.created') + '</li>';//NO I18N
				}
				else if( detailsObj.column_name == 'PURCHASEORDERID' )
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.po.created', [detailsObj.relative_column_value, detailsObj.latest_value]) + '</li>';//NO I18N
				}
				else if( detailsObj.column_name == 'SERVICEREQUESTID' )
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.history.associated.frompo.text', [detailsObj.latest_value]) + '</li>';//NO I18N
				}
				else if( detailsObj.column_name == 'ATTACHMENTNAME' )
				{
					data += '<li>' + getMessageForKey('sdp.attachment.history.add', [detailsObj.latest_value]) + '</li>';//NO I18N
				}
			}
			else if( detailsObj.operation == 'R' )
			{
				if((detailsObj.relative_column == 'LEVEL_NUMBER' || detailsObj.relative_column == 'level') && detailsObj.column_name == 'APPROVERID' )
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.history.deleteapprover', [detailsObj.latest_value, detailsObj.relative_column_value]) + '</li>';//NO I18N
				}
				else if( detailsObj.column_name == 'APPROVALLEVEL' || detailsObj.column_name == 'level')
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.history.deletelevel', [detailsObj.latest_value]) + '</li>';//NO I18N
				}
				else if( detailsObj.column_name == 'ITEMNAME' )
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.history.removedproduct', [detailsObj.latest_value]) + '</li>';//NO I18N
				}
				else if( detailsObj.column_name == 'SERVICEREQUESTID' )
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.history.remove.frompo.text', [detailsObj.latest_value]) + '</li>';//NO I18N
				}
				else if( detailsObj.column_name == 'ATTACHMENTNAME' )
				{
					data += '<li>' + getMessageForKey('sdp.attachment.history.remove', [detailsObj.latest_value]) + '</li>';//NO I18N
				}
				else if( detailsObj.column_name == 'PURCHASEORDERID' )
				{
					if( jsonObj.relative_column_value == null && detailsObj.relative_column_value == null )
					{
						data += '<li>' + getMessageForKey('sdp.purchase.request.po.delete') + '</li>';//NO I18N
					}
					else
					{
						data += '<li>' + getMessageForKey('sdp.purchase.request.po.detach', [detailsObj.relative_column_value]) + '</li>';//NO I18N
					}
				}
			}
			else if( detailsObj.operation == 'DETACH' )
			{
				if( detailsObj.column_name == 'SERVICEREQUESTID' )
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.history.detached.frompo.text', [detailsObj.latest_value]) + '</li>';//NO I18N
				}
			}
			else if( detailsObj.operation == 'RESTORE_FROM_TRASH' )
			{
				if( detailsObj.column_name == 'SERVICEREQUESTID' )
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.history.restore.frompo.text', [detailsObj.latest_value]) + '</li>';//NO I18N
				}
			}
			else if( detailsObj.operation == 'REMOVE_PERMANENTLY' )
			{
				if( detailsObj.column_name == 'SERVICEREQUESTID' )
				{
					data += '<li>' + getMessageForKey('sdp.purchase.request.history.permanentdelete.frompo.text' , [detailsObj.latest_value]) + '</li>';//NO I18N
				}
			}
		}
	}
	historyDetails.html(data);
	jQuery('#historyDetails_0_0').hide();

	return lastAddedIndex;
}

function openPRNotificationWindow(requestId, approvalLevel)
{
	var millis = new Date();

	if( jQuery('#statusName').text() == 'Rejected' )
	{
		approvalLevel = 1;
	}
	else
	{
		approvalLevel = getInProcessLevelNumber(approvalLevel);
	}

    var url = '/PurchaseApproval.do?module=approved&date='+new Date().getMilliseconds()+'&requestId=' + requestId + '&approvalLevel=' + approvalLevel + '&changeStatusTo=Pending Approval&time='+millis;//No I18N
    if(isMSP){
        url += '&persistentAccountId='+getAccountId(); //NO I18N
    }
	showURLInDialog(url,'modal=yes,closeButton=no,position=absmiddle');//No I18N
}

function getInProcessLevelNumber( approvalLevel )
{
	if( approvalLevel == null || approvalLevel == undefined )
	{
		if( jQuery('#statusName').text() == 'Rejected' )
		{
			approvalLevel = 1;
		}

		jQuery('[id^=levelStatus_]').each(function()
		{
			if( jQuery(this).text() == 'Pending Approval')
			{
				approvalLevel = parseInt(this.id.split("_")[1]);
				return false;
			}
		});
		if( approvalLevel == null || approvalLevel == undefined )
		{
		jQuery('[id^=levelStatus_]').each(function()
		{
			if( jQuery(this).text() == 'To Be Sent')
			{
				approvalLevel = parseInt(this.id.split("_")[1]);
				return false;
			}
		});
		}

		if( approvalLevel == null || approvalLevel == undefined )
		{
			approvalLevel = 1;
		}
	}
	return approvalLevel;
}

function openPRApprovalWindow(requestId, approvalLevel, exceedLimit, approvalId)
{
	if(exceedLimit == 'true')
	{
		alert(getMessageForKey("sdp.purchase.approver.approvelimit.err.message"));
		return;
	}
	
	approvalLevel = getInProcessLevelNumber(approvalLevel);
	
	var param = 'module=approved&date='+new Date().getMilliseconds() + '&approvalLevel=' + approvalLevel + '&requestId=' + requestId + '&changeStatusTo=Approved';//NO I18N
	
	if(approvalId != undefined)
	{
		param = param+'&approvalId='+approvalId;//NO I18N
	}

	showURLInDialog('/PurchaseApproval.do?'+param,'modal=yes,closeButton=no,position=absmiddle');//No I18N
}

function openPRRejectWindow(requestId, approvalLevel, exceedLimit, approvalId)
{
	if(exceedLimit == 'true')
	{	
		alert(getMessageForKey("sdp.purchase.approver.approvelimit.err.message"));
		return;
	}
	
	approvalLevel = getInProcessLevelNumber(approvalLevel);
	
	var param = 'module=approved&date='+new Date().getMilliseconds() + '&approvalLevel=' + approvalLevel + '&requestId=' + requestId + '&changeStatusTo=Rejected';//NO I18N
	
	if(approvalId != undefined)
	{
		param = param+'&approvalId='+approvalId;//NO I18N
	}

	showURLInDialog('/PurchaseApproval.do?'+param,'modal=yes,closeButton=no,position=absmiddle');//No I18N
}

function updatePRApproval(operation, isPurchaseApprovalCommentMandatory)
{
	var comments = encodeURIComponent(document.getElementById('reasonForStatusChange').value);
	
	if(operation == "approve" && (comments.trim()).length == 0 && isPurchaseApprovalCommentMandatory)
	{
		alert(getMessageForKey("sdp.purchase.status.comments.alert"));
		return;
	}
	else if(operation == "reject" && (comments.trim()).length == 0)
	{
		alert(getMessageForKey("sdp.purchase.status.comments.alert"));
		return;
	}
	
	
	
	jQuery('#approvalButton').addClass('hide');
	jQuery('#processing').removeClass('hide');
	document.ApprovalForm.operation.value = operation;
	//IssueId : 73552 : Approval Comments are stored with encoded string.
	//jQuery('#reasonForStatusChange').val(encodeURIComponent(jQuery('#reasonForStatusChange').val()));
	var from = document.ApprovalForm.from.value;
	if (from != null && from == "HOME")
	{
		var frm = jQuery("#ApprovalForm");
    	/*frm.submit(function (e) {
			e.preventDefault();
			alert("submit"); */
			jQuery.ajax({
            	type: frm.attr('method'),
            	url: frm.attr('action'),
           		data: frm.serialize(),
           		success: function (res) 
            	{
					jQuery('#processing').addClass('hide');
					if (res != null)
					{
						var successmsg = res.successmessage;
						var failuremsg = res.failuremessage;
						if (successmsg != undefined && successmsg != null && successmsg != "")
						{
							//window.opener.showMessageAndClose(msg);
							window.opener.showSuccessMessageAndClose(null,successmsg,3000);
						}
						else if(failuremsg != undefined && failuremsg != null && failuremsg != "")
						{
							window.opener.showFailureMessageAndClose(failuremsg,3000);	
						}
					}
					window.opener.$home_page.processApprovals();
					window.close();
				}
			});
   		//});

	}
	else
	{
		document.ApprovalForm.submit();
	}
}

function viewPO( requestId )
{
	if( associatedPO != null && associatedPO.length > 0 )
	{
		associatedPOText = '';//NO I18N

		for( i = 0; i < associatedPO.length; i++ )
		{
			associatedPOText += '<tr height="35"><td class="ui-formlabel">' + getMessageForKey('sdp.purchase.common.po') + ' # </td> <td class="ui-formfield"> <a href="/" sdphrefJs="js-href-purchaserequest-16" style="color:#0011FF; display: inline-block;" data-event="click" data-handler="viewPurchaseOrder('+associatedPO[i].purchase_order_id+')" nonce="'+sdpNonce+'">' + ZSEC.Encoder.encodeForHTML(associatedPO[i].po_custom_id) + '</a></td></tr><tr height="35"> <td class="ui-formlabel">' + getMessageForKey('sdp.requests.common.status') + '</td><td class="ui-formfield"> <b>' + associatedPO[i].purchase_status.name + '</b></td></tr> <tr height="35"> <td class="ui-formlabel">' + getMessageForKey('sdp.purchase.addNew.general.RDate') + '</td><td class="ui-formfield"> ' + (associatedPO[i].po_required_by == null ? getMessageForKey('sdp.common.notassigned') : associatedPO[i].po_required_by.display_value) + '</td></tr> <tr height="35"> <td class="ui-formlabel">' + getMessageForKey('sdp.reportcols.mod4.receiveddate') + '</td><td class="ui-formfield"> <b>' + ( associatedPO[i].po_received_date == null  ? getMessageForKey('sdp.common.notassigned') :  associatedPO[i].po_received_date.display_value ) + '</b></td></tr>';//NO I18N
			//purchase_order_id is primary key, po_required_by and po_received_date is date format, purchase_status is defualt data,so no need to encode the value.
		}

		showDialog('<div class="dc-shadow"><table cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #ddd"><tbody id="viewPo"><tr><td class="p15 newpr-dialog-header grayborder" data-event="mousedown" data-handler="captureDialog(event)" nonce="'+sdpNonce+'" data-event="mouseup" data-handler="javascript:refreshNiceScroll()" nonce="'+sdpNonce+'">' + getMessageForKey('ae.approval.nonlogin.poDetails') + '<span class="fr"><a data-event="click" data-handler="javascript:closeDialog();" nonce="'+sdpNonce+'"><img border="0" class="close-dialog-icon" src="/images/spacer.gif"></a></span></td></tr><tr><td class="p15" bgcolor="#FFFFFF" valign="top" width="100%" id="ui-framework-design1"><table class="ui-viewform" width="100%">' + associatedPOText + '</table></td></tr></tbody></table></div>', "top=20, left=90,width=350,closeButton=no",function(){$sdEventListener('#viewPo')});//NO I18N
	}
}

function createPO( requestId )
{
	if( isVendorAssociated )
	{
		checkForNewlyAddedProducts( requestId )
	}
	else
	{
		alert(getMessageForKey('sdp.purchase.request.associate.vendor.warn'));
		//document.location = '/PurchaseRequest.do?task=editPR&requestId=' + requestId + "&chooseVendor=true";//NO I18N
		editPurchaseRequest(requestId, true);
	}
}

function checkForNewlyAddedProducts( requestId )
{
	jQuery.ajax({type: 'GET', url: '/PurchaseRequest.do?task=check_for_newly_added_products&requestIds=' + requestId, data: '',//NO I18N
							   contentType: 'application/json; charset=utf-8', //NO I18N
							   dataType: 'html', //NO I18N
							   success: function(responseText) 
							   			{ 
								   			if( responseText.startsWith("[") ) 
								   			{
								   				alert(getMessageForKey('sdp.purchase.request.similar.pr.withoutvendor.warn') + "  ( PR# "+responseText.substring(1,responseText.length-1).split(",").join(" , PR#") + " )");//NO I18N
								   			} 
								   			else if( responseText != 'No unknown products' )
								   			{ 
								   				showDialog(responseText, "top=20, left=90,width=800,closeButton=no"); //NO I18N
								   			}
								   			else
								   			{
								   				newPurchaseOrder(requestId);
								   			} 
								   		}
				});
}

function checkDuplicateProductFound( productName , index )
{
	var duplicateProductFound = false;
	jQuery( '[id^="unknownItemAuto_"]' ).find( '[id^="itemName_"]' ).each(function(){
		if( jQuery(this).val() == productName && parseInt( jQuery( this ).attr("id").split('_')[1] ) != index )
		{
			duplicateProductFound = true;
		}
	});
	return duplicateProductFound;
}

function setProductTypeForHiddenField( productName , index , productTypeValue )
{
	jQuery( '[id^="unknownItemAuto_"]' ).find( '[id^="itemName_"]' ).each(function(){

		var currentIndex = parseInt( jQuery( this ).attr("id").split('_')[1] );

		if( jQuery(this).val() == productName && currentIndex != index )
		{
			jQuery( document.getElementById( "unknownItemType_" + currentIndex ) ).val( productTypeValue ).attr("setProductHiddenFields", "false").trigger( "onchange" );
			jQuery( "#itemName_"+currentIndex).attr( "productName", productName );
		}
	});
	jQuery('#itemName_' +index).attr("productName",productName);
}

function prePopulateValueForSameProduct( itemObj )
{
	var index = parseInt(jQuery( itemObj ).attr("id").split('_')[1]);
	jQuery( '[id^="unknownItemAuto_"]' ).find( '[id^="itemName_"]' ).each(function(){

		var currentIndex = parseInt( jQuery( this ).attr("id").split('_')[1] );

		if( jQuery(this).val() == jQuery(itemObj).attr("productName") && currentIndex != index )
		{
			jQuery( this ).val( jQuery(itemObj).val() );
		}
	});
	jQuery(itemObj).attr("productName",jQuery(itemObj).val());
}

function setManufacturerHiddenField( ManufactureType )
{
	var index 	= parseInt( jQuery( ManufactureType ).attr("id").split('_')[1] );
	var productName = jQuery( document.getElementById( "itemName_"+index ) ).val();

	jQuery( '[id^="unknownItemAuto_"]' ).find( '[id^="itemName_"]' ).each(function(){
		var currentIndex = parseInt( jQuery( this ).attr("id").split('_')[1] );
		if( jQuery(this).val() == productName && currentIndex != index )
		{
			jQuery( document.getElementById( "unknownItemMfg_"+currentIndex ) ).val( ManufactureType.value );	
		}
	});
}

function populateUnknownProducts( index, productName, itemRequestId )
{
	if( document.getElementById('unknownProductRow_' + index) == undefined )
	{
		if( checkDuplicateProductFound( productName , index ) )
		{
			//need to hide when the duplicate product Fields found.
			jQuery( addNewProductRow(document.getElementById('unknownProductRow_' + (index-1))) ).addClass("hide");
		}
		else
		{
			addNewProductRow(document.getElementById('unknownProductRow_' + (index-1)));
		}
	}

	jQuery( document.getElementById( 'unknownItemAuto_'+index ) ).find( '#itemName_'+index ).val( replaceHTMLCode(productName ) );
	jQuery('#itemRequestId_' + index).val(itemRequestId);
	jQuery('#oldItemName_' + index).val(productName);
	updateSelect2ForunKnownItemCategory(index);
}

function addNewProductRow(thisRow)
{
	if( document.createElement && document.childNodes )
	{
		var gUniqueRowID = parseInt(thisRow.id.split("_")[1]) + 1;

		var newElement = thisRow.cloneNode(true);
		newElement.id = "unknownProductRow_" + gUniqueRowID;

		thisRow.parentNode.insertBefore(newElement, thisRow);

		jQuery('#unknownProductRow_'+gUniqueRowID).find("#s2id_unknownItemCategory_"+thisRow.id.split("_")[1]).remove();
		try
		{
			document.getElementById('unknownItemType_' + gUniqueRowID).value = '-1';//No I18N
		}
		catch(ex)
		{
			//Error ignored
		}
		
		jQuery(newElement).find('[id^=unknown]').each(function()
		{
			var idValue = this.id.split("_")[0] + '_' + gUniqueRowID;

			jQuery(this).attr('id', idValue);
			jQuery(this).attr('name', idValue);
		});
		
		jQuery(newElement).find('[id^=itemName]').each(function()
		{
			var idValue = this.id.split("_")[0] + '_' + gUniqueRowID;

			jQuery(this).attr('id', idValue);
			jQuery(this).attr('name', idValue);
		});

		jQuery(newElement).find('[id^=oldItemName]').each(function()
		{
			var idValue = this.id.split("_")[0] + '_' + gUniqueRowID;

			jQuery(this).attr('id', idValue);
			jQuery(this).attr('name', idValue);
		});
		
		jQuery(newElement).find('[id^=itemRequestId_]').each(function()
		{
			var idValue = this.id.split("_")[0] + '_' + gUniqueRowID;

			jQuery(this).attr('id', idValue);
			jQuery(this).attr('name', idValue);
		});

		jQuery(newElement).find('[id^="searchitem_"]').each(function()
		{
			var idValue = this.id.split("_")[0] + '_' + gUniqueRowID;

			jQuery(this).attr('id', idValue);
			jQuery(this).attr('name', idValue);
		});
		
		return newElement;
	}
	return null;
}

function clonePRProductElement()
{
	hideBaloonToolTip('normalbubbletooltip');//No I18N
	jQuery( addNewItemRow() ).find( '[id^="item_name_"]' ).removeAttr('isAjaxBinded');//No I18N
	jQuery('[id^=addLicenseImg_]').each( function () { var id = this.id; jQuery('#'+id).on('click',function () { removeItemRow(this); }) }); 
}
function enableAutopopulation( inputField )
{
	var tagId = inputField.name.split("_")[1];//NO I18N

	if( parseInt(jQuery('#componentTypeSelect_' + tagId).val()) < 0 )
	{
		showBaloonToolTip('componentTypeSelect_' + tagId, getMessageForKey('sdp.purchase.filter.producttype'));//NO I18N
		return;
	}
}

function onUnknownItemCategoryChange(el) 
{
	var curr_row = jQuery(el).closest('tr');//NO I18N
	var parentTrId = jQuery(el).closest('tr').attr('id');//NO I18N
	var indexno = parentTrId.split('_');
	curr_row.find('select').select2('destroy')//NO I18N
	
	if (jQuery(el).val() == 'Assets')//NO I18N 
	{
		curr_row
          .find('.item-category-field')
          .html(jQuery('#componentTypeDiv').html())
          .end()
          .find('.po-items-ui select')
          .select2()
          .end()
          
		curr_row.find('#componentTypeSelect').attr('id','componentTypeSelect_'+indexno[1]);
		updateSelect2ProductType(indexno[1]);
	} 
	else if (jQuery(el).val() == 'Services')//NO I18N
	{
		curr_row
				.find('.item-category-field')
				.html(jQuery('#servicesTypeDiv').html())
				.end()
				.find('.po-items-ui select')
				.select2()
				.end()
				curr_row.find('#serviceTypeSelect').attr('id','serviceTypeSelect_'+indexno[1]);
				updateSelect2ForServiceType(indexno[1]);
	} 
	else if (jQuery(el).val() == 'Others')//NO I18N
	{
		curr_row
				.find('.item-category-field')
				.html(jQuery('#othersDiv').html())
				.end()
				.find('.po-items-ui select')
				.select2()
				.end()
	} 
	else 
	{
		curr_row.find('.po-items-ui select').select2();
	}
}
function updateSelect2ProductType(indexno)
{
    var options = {
            url: "/api/v3/purchase_orders/items/product_type", //NO I18N
            entity: "product_type", //NO I18N
            id : "componentTypeSelect_"+indexno, //NO I18N
            displayField: "display_name",//No I18N
            placeHolder : getMessageForKey("sdp.admin.product.addproduct.type.choose"),
            list_info: { "search_criteria": { "field": "api_name", "values": ["asset_asset", "consumable_consumable", "software_product_software"], "condition": "not in", "logical_operator": "AND" } }, //No I18N
            allowClear:"true"
            }
    hierarchySelect2.init(options);
	var element = jQuery('#componentTypeSelect_'+indexno);
	  element.on("change", function(event) { //no i18n
		enableManufacturerList(this);
	});
}
function updateSelect2ForunKnownItemCategory(index){
    var statusData=[{id:"Assets",text:getMessageForKey("sdp.header.inventory")}, {id:"Services",text:getMessageForKey("sdp.itil.common.service.item")},{id:"Others",text:getMessageForKey("sdp.inventory.assethome.others")}]
    jQuery('#unknownItemCategory_'+index).select2({
        placeholder:getMessageForKey("sdp.common.selectcategory"),
        data : statusData,
        allowClear:"true"
    });
}
function updateSelect2ForServiceType(indexno)
{
	params = '{"module": "vendorservicetype", "dropdownLength":"25"}';//NO I18N
	updateSelect2Dropdown({ elementId : 'serviceTypeSelect_'+indexno, //NO I18N
				            placeHolder : getMessageForKey("ae.po.servicetype.choose"),
				            isOnChangeEventRequired : false,
				            isPagination : true,
				            isAllowClear : true,
				            params : params
				            }); 
}

function validateUnknownProductForm(purchaseOrderId)
{
	var param = '';//NO I18N
	var noOfInput = 0;
	var isValidationSuccess = true;
	var serviceNames = [];
	var softwareNames = '';
	var requestIds = '';//NO I18N
	jQuery('#unknownProductForm').find('[id^=unknownItemCategory_]:visible').each(function()
	{
		if( this.value == '-1' )
		{
			isValidationSuccess = false;
			showBaloonToolTip(this.id, getMessageForKey("ae.po.formvalidation.itemcategory"));//NO I18N
			return false;
		}
		else if(this.value == 'Assets')
		{
			if(jQuery('#componentTypeSelect_'+this.id.split("_")[1] ).val() == -1)
			{
				isValidationSuccess = false;
				showBaloonToolTip(jQuery('#componentTypeSelect_'+this.id.split("_")[1] ).attr("id"), getMessageForKey("sdp.purchase.filter.producttype"));//NO I18N
				return false;
			}
			else
			{
				param += "&" + jQuery('#unknownItemCategory_'+this.id.split("_")[1]).attr("id") + '=' + encodeURIComponent( this.value );
				param += "&" + jQuery('#componentTypeSelect_'+this.id.split("_")[1] ).attr("id") + '=' + encodeURIComponent( jQuery('#componentTypeSelect_'+this.id.split("_")[1] ).val() );
			}
		}
		else if(this.value == 'Services')
		{
			if(jQuery('#serviceTypeSelect_'+this.id.split("_")[1] ).val() == -1)
			{
				isValidationSuccess = false;
				showBaloonToolTip(jQuery('#serviceTypeSelect_'+this.id.split("_")[1] ).attr("id"), getMessageForKey("ae.pr.servicetype.selecterror"));//NO I18N
				return false;
			}
			else
			{
				param += "&" + jQuery('#unknownItemCategory_'+this.id.split("_")[1]).attr("id") + '=' + encodeURIComponent( this.value );
				param += "&" + jQuery(  '#serviceTypeSelect_'+this.id.split("_")[1] ).attr("id") + '=' + encodeURIComponent( jQuery('#serviceTypeSelect_'+this.id.split("_")[1] ).val() );
			}
			var serviceNameBox = jQuery( document.getElementById( 'unknownItemAuto_'+ this.id.split("_")[1] ) ).find( '#itemName_'+ this.id.split("_")[1]);//NI I18N
			serviceNames.push(encodeURIComponent(serviceNameBox.val()));
		}
		else if(this.value == 'Others')
		{
			param += "&" + jQuery('#unknownItemCategory_'+this.id.split("_")[1]).attr("id") + '=' + encodeURIComponent( this.value );
		}
		
		var textBox = jQuery( document.getElementById( 'unknownItemAuto_'+ this.id.split("_")[1] ) ).find( '#itemName_'+ this.id.split("_")[1]);//NO I18N
		
		if(trim(textBox.val()) == '')
		{
			isValidationSuccess = false;
			showBaloonToolTip(textBox.attr("id"), getMessageForKey("sdp.purchase.unknownitem.errormessage"));//NO I18N
			return false;
		}
		
		param += "&" + textBox.attr('name') + '=' + encodeURIComponent(textBox.val());

		var oldItem = jQuery('#oldItemName_' + this.id.split("_")[1]);//NO I18N
		
		param += "&" + oldItem.attr('name') + '=' + encodeURIComponent( oldItem.val() );//NO I18N
		
		var itemRequest = jQuery('#itemRequestId_' + this.id.split("_")[1]);//NO I18N
		
		param += "&" + itemRequest.attr('name') + '=' + itemRequest.val();//NO I18N
		
		noOfInput++;
		
	});
	var parameter = "action=checkInactiveServices";//No I18N
	parameter += "&serviceNames="+serviceNames;//No I18N
	callSjaxRequest('/servlet/AJaxServlet',parameter);//No I18N
	if(srequestOne.responseText != '')
	{
		showalert('failure',getMessageForKey('ae.vendorservice.inactiveservice.errormessage',[ZSEC.Encoder.encodeForHTML(srequestOne.responseText)]),'isAutoHide=true,closeOnEscKey=yes,width=500,height=80')//NO I18N
		return false;
	}
	jQuery('#unknownProductForm').find('[name="requestIds"]').each(function()
	{
		requestIds += "&requestIds=" + this.value;//NO I18N
	});

	jQuery('#unknownProductForm').find('[id^=unknownItemMfg_]').each(function()
	{
		if( this.value == '-1' && jQuery(this).is(":visible") )
		{
			isValidationSuccess = false;
			showBaloonToolTip(this.id, getMessageForKey("sdp.admin.producttype.addproducttype.selectManufacturer"));
			return false;
		}

		if( jQuery(this).is(":visible") )
		{
			param += "&" + this.name + '=' + this.value;
			softwareNames += "&softwareNames="+encodeURIComponent(jQuery('#itemName_' + this.name.split("_")[1]).val());//No I18N
		}
	});
	
	if(softwareNames != '')
	{
		parameter = "action=checkUnManagedSoftware"+softwareNames;//No I18N
		callSjaxRequest('/servlet/AJaxServlet',parameter);//No I18N
		if(srequestOne.responseText != '')
		{
			showalert('failure',getMessageForKey('sdp.software.unmanaged.errormessage',[encodeHTML(srequestOne.responseText)]),'isAutoHide=true,closeOnEscKey=yes,width=500,height=80')//NO I18N
			return false;
		}
	}
	if( isValidationSuccess )
	{
		param = 'task=create_product' + param + '&noOfInput=' + noOfInput;//NO I18N
		callCustomAjaxRequest("/PurchaseRequest.do", param, function(req) {// no i18n
			//alert(req.responseText);
			var browser = navigator.appName;
			var xmlDoc;
			if (browser == "Netscape1")
			{
					xmlDoc = req.responseXML;
			}
			else if(browser == "Netscape")
			{
					xmlDoc = req.responseXML;
			}
			else
			{
				xmlDoc = req.responseXML.xml;
			}
			if(xmlDoc != null && xmlDoc != 'null' && xmlDoc !="")
			{
				var resultTag = xmlDoc.getElementsByTagName("result");//NO I18N
				var statusNodeValue = resultTag[0].childNodes[0].childNodes[0].nodeValue;
				var message = resultTag[0].childNodes[1].childNodes[0].nodeValue;
				if(statusNodeValue == '200')
				{
					if( purchaseOrderId == null ) 
			 	  	{
			 	  		newPurchaseOrder( requestIds )
			 	  	}
			 	  	else
			 	  	{ 
			 	  		addRequestsToPO(requestIds + '&purchaseOrderId=' + purchaseOrderId, purchaseOrderId) //NO I18N
			 	  	} 
				}
				else
				{
					alert(message);
				}
			}
		}, ajaxRequestOnFailure);
	}
}
function enableManufacturerList(productType)
{
	if( parseInt(productType.value) > 0 )
	{
		jQuery.ajax({type: 'POST', url: '/PurchaseRequest.do?task=isSoftwareType&productTypeId=' + productType.value, data: '',contentType: 'application/json; charset=utf-8', dataType: 'text', success: function(responseText) { updateManufacturerList(responseText, productType) }});//NO I18N
	}

	var index = parseInt(productType.id.split('_')[1]);//NO I18N

	var productName = jQuery( document.getElementById( 'unknownItemAuto_'+index ) ).find( '#itemName_'+ index).val();//NO I18N

	jQuery('#unknownProductForm').find('[id^=itemName_]').each(function()
	{
		var searchIndex = parseInt(this.id.split('_')[1]);//NO I18N

		if( searchIndex != index && productName == jQuery( document.getElementById( 'unknownItemAuto_'+index ) ).find( '#itemName_'+ searchIndex).val() )
		{
			jQuery('#unknownItemType_' + searchIndex).val(productType.value);//No i18N
		}
	});
	if(  jQuery( productType ).attr( "setProductHiddenFields" ) == undefined )
	{
		setProductTypeForHiddenField( productName , index , productType.value);
	}
	
}

function updateManufacturerList( isSoftwareType, productTypeObj )
{
	var tagId = productTypeObj.id.split("_")[1];//NO I18N

	if( isSoftwareType == 'true' )
	{
		jQuery('#unknownSoftwareMfgDiv_' + tagId).show();//NO I18N
		jQuery('#unknownItemMfg_' + tagId).prop('disabled', false);//NO I18N
		jQuery('#unknownMfg_' + tagId).hide();//NO I18N
		var autocomp1 = new Ajax.Autocompleter('itemName_' + tagId, 'searchitem_'+tagId , '/servlet/AJaxServlet?action=searchSoftware&unknownItemType_' + tagId + '=' + productTypeObj.value, {paramName : 'item_name_' + tagId, afterUpdateElement : ''});//NO I18N
		jQuery('#unknownItemMfg_'+tagId+' select').select2();
	}
	else
	{
		jQuery('#unknownItemMfg_' + tagId).prop('disabled', true);//NO I18N
		jQuery('#unknownItemMfg_' + tagId).hide();//NO I18N
		jQuery('#unknownItemMfg_' + tagId).val(-1);//NO I18N
		jQuery('#unknownMfg_' + tagId).show();//NO I18N
	
		var autocomp1 = new Ajax.Autocompleter('itemName_' + tagId, 'searchitem_'+ tagId , '/servlet/AJaxServlet?action=searchProduct&unknownItemType_' + tagId + '=' + productTypeObj.value, {paramName : 'item_name_' + tagId, afterUpdateElement : ''});//NO I18N
	}
}

function updateVendorCurrency()
{
	var vendorId = jQuery('#vendor').val();//NO I18N

	if( vendorId != "-1" )
	{	
		jQuery.ajax({type: 'GET', url: '/PurchaseRequest.do?task=getVendorCurrency&vendorId=' + vendorId, data: '',contentType: 'application/json; charset=utf-8', dataType: 'text', success: function(responseText) { jQuery('#itemTotalCost').html('(' + responseText + ')');jQuery('#itemTotalCostId').html('(' + responseText + ')');jQuery('#itemEstimatedCost').html('(' + responseText + ')');jQuery('#overallTotalCost').html('(' + responseText + ')'); }});//NO I18N
	}
}


function getSimilarPurchaseRequest( requestId )
{
	jQuery.ajax({type: 'POST', url: '/PurchaseRequest.do', data: 'task=getSimilarPurchaseRequest&requestId='+ requestId ,contentType: 'application/x-www-form-urlencoded; charset=UTF-8', dataType: 'json', success: function(responseJson) { populateSimilarRequests(responseJson.requestForSameVendor, responseJson.requestForSameProduct);}});//NO I18N
}	

function populateSimilarRequests(vendorList, itemList)
{
	if( vendorList.purchaserequests != undefined )
	{
		if( vendorList.purchaserequests.length != undefined && vendorList.purchaserequests.length > 0 )
		{
			for( i = 0; i<vendorList.purchaserequests.length; i++ )
			{
				jQuery('#manufacturer').append('<option value="' + vendorList.purchaserequests[i].vendor.id + '">' + encodeHTML(vendorList.purchaserequests[i].vendor.name) + '</option>');
			}
		}
		else if( vendorList.purchaserequests.vendor != undefined )
		{
			jQuery('#manufacturer').append('<option value="' + vendorList.purchaserequests.vendor.id + '">' + encodeHTML(vendorList.purchaserequests.vendor.name) + '</option>');
		}
		else
		{
			jQuery('#manufacturer').append('<option value="-1">' + getMessageForKey('sdp.purchase.requests.similar.prs.novendor.found') + '</option>');
		}
	}
	else
	{
		jQuery('#manufacturer').append('<option value="-1">' + getMessageForKey('sdp.purchase.requests.similar.prs.novendor.found') + '</option>');
	}

	if( itemList.purchaserequests != undefined )
	{
		if( itemList.purchaserequests.length != undefined && itemList.purchaserequests.length > 0 )
		{
			for( i = 0; i<itemList.purchaserequests.length; i++ )
			{
				jQuery('#itemName').append('<option value="' + itemList.purchaserequests[i].request_id + '">' + encodeHTML(itemList.purchaserequests[i].requested_items[0].item_name) + '</option>');
			}
		}
		else if( itemList.purchaserequests.request_id != undefined )
		{
			jQuery('#itemName').append('<option value="' + itemList.purchaserequests.request_id + '">' + encodeHTML(itemList.purchaserequests.requested_items[0].item_name) + '</option>');
		}
		else
		{
			jQuery('#itemName').append('<option value="-1">' + getMessageForKey('sdp.purchase.newpo.ponoitemfound') + '</option>');
		}
	}
	else
	{
		jQuery('#itemName').append('<option value="-1">' + getMessageForKey('sdp.purchase.newpo.ponoitemfound') + '</option>');
	}

	if( jQuery('#manufacturer').val() > 0 )
	{
		var prurl = '/PurchaseRequest.do?task=getRequestRaisedForVendor&vendorId=' + jQuery('#manufacturer').val();//NO I18N
		if(isMSP) {
			prurl = appendAccountIdForPRUrls(prurl, $('accountfilter').value);
		}

		jQuery.ajax({type: 'POST', url: prurl, data: '',contentType: 'application/json; charset=utf-8', dataType: 'json', success: function(responseJson) { populateRequests(responseJson) }});//NO I18N
	}
	else
	{
		jQuery('#filterBy').val('sameItem');//NO I18N
		jQuery('#filterBy').trigger('onchange');//No I18N
	}
}

function loadSimilarItemRequests( thisRow )
{
	if( document.getElementById('itemName').options.length > 0 && jQuery(document.getElementById('itemName').options).val() != -1 )
	{
		var params = '';//NO I18n

		jQuery('#itemName option').each(function()
		{
			if( this.selected && parseInt(this.value) > 0 )
			{
				params += '&itemNames=' + encodeURIComponent(jQuery(this).text());//NO I18N
			}
		});

		if( params != '' )
		{
			jQuery( document.getElementById( 'nosimilarprfound' ) ).hide();
			jQuery( document.getElementById( 'similarRequestCreatePO' ) ).prop( "disabled", false ).show();//NO I18N
			var prurl = '/PurchaseRequest.do?';//NO I18N
                	if(isMSP) {
				prurl = appendAccountIdForPRUrls(prurl, $('accountfilter').value);
                	}

			jQuery.ajax({
				type: 'POST',//NO I18N 
				url: prurl,
				data: 'task=getRequestRaisedForItem' + params,//NO I18N
				contentType: 'application/x-www-form-urlencoded; charset=UTF-8', //NO I18N
				dataType: 'json', //NO I18N
				success: function(responseJson) { 
					populateRequests(responseJson) 
				},
				error : function(responseJson){
					if((responseJson.responseText).indexOf("AuthError.jsp") >= 0 ){ 
						alert(getMessageForKey("sdp.xss.vulnerability.message"));//NO I18N
						jQuery('#similarRequestRow_0').addClass("hide");//NO I18N
						jQuery( document.getElementById( 'nosimilarprfound' ) ).show();//NO I18N
						jQuery( document.getElementById( 'similarRequestCreatePO' ) ).prop( "disabled" , true ).hide();//NO I18N
					}
				}
			});
		}
		else
		{
			jQuery( document.getElementById( 'nosimilarprfound' ) ).show();
			jQuery( document.getElementById( 'similarRequestCreatePO' ) ).prop( "disabled" , true ).hide();//NO I18N
		}
	}
	else
	{
		jQuery('#similarRequestRow_0').addClass("hide");
		jQuery( document.getElementById( 'nosimilarprfound' ) ).show();
		jQuery( document.getElementById( 'similarRequestCreatePO' ) ).prop( "disabled" , true ).hide();//NO I18N
	}
}

function loadSimilarVendorRequests( thisRow )
{
	if( document.getElementById('manufacturer').options.length > 0 && parseInt(thisRow.value) > 0 )
	{
		jQuery( document.getElementById( 'nosimilarprfound' ) ).hide();
		jQuery( document.getElementById( 'similarRequestCreatePO' ) ).prop( "disabled", false ).show();//NO I18N
		var prurl = '/PurchaseRequest.do?task=getRequestRaisedForVendor&vendorId=' + thisRow.value;//NO I18N
		if(isMSP) {
			prurl = appendAccountIdForPRUrls(prurl, $('accountfilter').value);
		}
		jQuery.ajax({type: 'POST', url: prurl, data: '',contentType: 'application/json; charset=utf-8', dataType: 'json', success: function(responseJson) { populateRequests(responseJson) }});//NO I18N
	}
	else
	{
		jQuery('#similarRequestRow_0').addClass("hide");
		jQuery( document.getElementById( 'nosimilarprfound' ) ).show();
		jQuery( document.getElementById( 'similarRequestCreatePO' ) ).prop( "disabled" , true ).hide();//NO I18N
	}
}

function addNewSimilarRequestRow(thisRow)
{
	if( document.createElement && document.childNodes )
	{
		var gUniqueRowID = parseInt(thisRow.id.split("_")[1]) + 1;

		var newElement = thisRow.cloneNode(true);
		newElement.id = "similarRequestRow_" + gUniqueRowID;

		thisRow.parentNode.insertBefore(newElement, thisRow);

		jQuery(newElement).removeClass('hide');//No I18N

		jQuery(newElement).find('[id^=similarRequest]').each(function()
		{
			var idValue = this.id.split("_")[0] + '_' + gUniqueRowID;

			jQuery(this).attr('id', idValue);
			jQuery(this).attr('name', idValue);
		});
	}
	return null;
}

function populateRequests( jsonObject )
{
	jQuery('#matched_items tr').each( function()
	{
		if( parseInt(this.id.split('_')[1]) > 0 )
		{
			jQuery(this).remove();
		}
	});
	
	if( jsonObject.purchaserequests.length != undefined )
	{
		for( i = 0; i<jsonObject.purchaserequests.length; i++ )
		{
			if( i == 0 )
			{
				jQuery('#similarRequestRow_' + i).removeClass("hide");//NO I18N
			}
			else
			{
				addNewSimilarRequestRow(document.getElementById('similarRequestRow_' + (i-1)));//NO I18N
			}
			
			popuateRequestRowDetails(i,jsonObject.purchaserequests[i]);
		}
	}
	else
	{
		popuateRequestRowDetails(0,jsonObject.purchaserequests);
		jQuery('#similarRequestRow_0').removeClass('hide');//No I18N
	}
}

function popuateRequestRowDetails(index, purchaserequests)
{
	jQuery('#similarRequestId_' + index).val(purchaserequests.request_id);//NO I18N
	
	jQuery('#similarRequestNumber_' + index).html('<a style="cursor:pointer;" data-event="click" data-handler="javascript:showPRDetails(' + purchaserequests.request_id + ', false, true)" nonce="'+sdpNonce+'">' + getMessageForKey('sdp.purchase.request.number') + ' ' + purchaserequests.request_id + '</a>');//NO I18N

	$sdEventListener(jQuery('#similarRequestNumber_' + index)); // NO I18N
	var itemDetails = null;
	var itemName = null;

	for( j = 0; j<purchaserequests.requested_items.length; j++ )
	{
		itemName = purchaserequests.requested_items[j].item_name;

		if( isSearchItem(itemName) )
		{
			itemName = itemName;
		}

		if( itemDetails != null )
		{
			itemDetails += '<br>' + encodeHTML(itemName);//No I18N
		}
		else
		{
			itemDetails = encodeHTML(itemName);
		}
	}

	jQuery('#similarRequestItems_' + index).html(itemDetails);//NO I18N

	if( purchaserequests.vendor != undefined )
	{
		jQuery('#similarRequestVendor_' + index).html('<span class="fontgray">'+ getMessageForKey( "sdp.purchase.request.suggested.vendor") +' : &nbsp;</span>' + encodeHTML(purchaserequests.vendor.name));//NO I18N
	}
	else
	{
		jQuery('#similarRequestVendor_' + index).html('<span class="fontgray">'+ getMessageForKey( "sdp.purchase.request.suggested.vendor") +' : &nbsp;</span> -');//NO I18N
	}
}

function isSearchItem( itemName )
{
	var isMatched = false;

	jQuery('#itemName option').each(function()
	{
		if( this.selected && jQuery(this).text() == itemName )
		{
			isMatched = true;
		}
	});
	return isMatched;
}

function chooseRequestFilter(thisRow)
{
	jQuery('#matched_items tr').each( function()
	{
		if( parseInt(this.id.split('_')[1]) > 0 )
		{
			jQuery(this).remove();
		}
	});

	jQuery('#similarRequestId_0').val(-1);//NO I18N
	jQuery('#similarRequestNumber_0').html('');//NO I18N
	jQuery('#similarRequestItems_0').html('');//NO I18N
	jQuery('#similarRequestVendor_0').html('');//NO I18N

	if( thisRow.value == 'sameVendor' )
	{
		jQuery('#manufacturerFilter').removeClass('hide');
		jQuery('#itemFilter').addClass('hide');
	
		jQuery('#manufacturer').trigger('onchange');
	}
	else
	{
		jQuery('#itemName option').each(function(){this.selected = true});

		jQuery('#manufacturerFilter').addClass('hide');
		jQuery('#itemFilter').removeClass('hide');
		
		jQuery('#itemName').trigger('onchange');
	}
	showSimilarPRshgtcal();/*77204 -- PO popup height calculation*/
}

function createPOForSimilarPRs()
{
	var isRequestSelected = false;

	var firstCheckBox = null;

	var params = '';//NO I18N

	var foundDifferentVendor = false;

	var vendorName = '';//NO I18N

	var uniqueId = 0;

	jQuery('[id^=similarRequestVendor_]').each(function()
	{
		uniqueId = this.id.split('_')[1];

		if( jQuery('#similarRequestId_' + uniqueId).is(':checked') )
		{
			if( vendorName != '' && jQuery(this).text() != vendorName )
			{
				showBaloonToolTip(this.id, getMessageForKey('sdp.purchase.request.cannot.createpo.fordiffvendor'));//NO I18N
				foundDifferentVendor = true;
			}
			vendorName = jQuery(this).text();
		}
	});

	if( !foundDifferentVendor )
	{
		jQuery('[id^=similarRequestId_]').each(function()
		{
			if( this.checked )
			{
				isRequestSelected = true;
				params += '&requestIds=' + this.value;//NO I18N
			}
			if( firstCheckBox == null )
			{
				firstCheckBox = this;
			}
		});

		if( !isRequestSelected )
		{
			showBaloonToolTip(firstCheckBox.id, getMessageForKey('sdp.purchase.request.choose.prs.tocreate.po'));//NO I18N
			return false;
		}

		jQuery.ajax({type: 'POST', async: false, url: '/PurchaseRequest.do?task=check_for_newly_added_products' + params, data: '',contentType: 'application/json; charset=utf-8', dataType: 'html', success: function(responseText) { if( responseText.startsWith("[") ) {alert(getMessageForKey('sdp.purchase.request.similar.pr.withoutvendor.warn') + "  ( PR# "+responseText.substring(1,responseText.length-1).split(",").join(" , PR#") + " )")} else if( responseText != 'No unknown products' ){ showDialog(responseText, "top=20, left=90,width=750,closeButton=no"); } else { newPurchaseOrder(params);} }, error: function(responseText) {alert( (typeof sdpToJSON != 'undefined') ? sdpToJSON(responseText) : JSON.stringify(responseText) )}});//NO I18N
	}
}

function updateProgress()
{
	jQuery('#processing').addClass('hide');
	jQuery('#onsuccess').removeClass('hide');
	setTimeout(function(){jQuery('#onsuccess').addClass('hide')}, 500);
	setTimeout(function(){jQuery('#saveButton').removeClass('hide')}, 500);
}

function populateRequestedItems( jsonObj )
{
	var itemDetails = jsonObj.assetDetails; 

	if( itemDetails != undefined && itemDetails.length > 0 )
	{
		var totalRows = 1;
		var itemCount = 1;
		jQuery.each(itemDetails, function(key, itemJson)
		{
			var itemRowIndex = 1;	
			jQuery.each(itemJson.requestedItemDetails, function(key, json)
			{
				if( json.hasOwnProperty('item_name') )
				{
					jQuery('#item_name_' + totalRows).val(json.item_name);
				}

				if( itemRowIndex < itemJson.requestedItemDetails.length )
				{
					addNewItemRow(document.getElementById('itemDetails_' + totalRows));
				}
				else if( itemCount < itemDetails.length )
				{
					addNewItemRow(document.getElementById('itemDetails_' + totalRows));
				}

				itemRowIndex++;totalRows++;
			});
			itemCount++;
		});

		jQuery('[id^="estimated_cost_"]').trigger('blur');
	}
	
}

function cancelAddNewPRPage( fromRequestPage )
{
	if( fromRequestPage == null )
	{
		document.location = "/PurchaseOrderList.do";//NO I18N
	}
	else
	{
		self.close();
	}
}

function showUnassociatedSRs(requestId)
{
	NewWindow('/PurchaseRequest.do?task=showUnassociatedSRs&requestId=' + requestId, 'UnAssociateRequests','900','540','yes','center');
}

function detachSRfromPurchaseRequest( purchaseRequestId , serviceRequestId)
{
	jQuery.ajax({
		type: 'POST',//NO I18N 
		url: '/PurchaseRequest.do?task=detachSRsFromPR&requestId=' + purchaseRequestId +'&serviceRequestIds='+ serviceRequestId, //NO I18N
		data: '',
		contentType: 'application/json; charset=utf-8',//NO I18N
		dataType: 'text', //NO I18N
		success: function(responseText) 
		{
			if( responseText != 'success' )
			{        
				setTimeout(function(){displayLoadingInformation("/images/deleteMail.gif", "' + getMessageForKey('sdp.purchase.wotopo.detach.failure') + '", true, 5000)},1000);//NO I18N
			}
			else
			{	
				disassociateRequestAfterSuccess( responseText, serviceRequestId ,  "srItem-" );//NO I18N

				if( jQuery( document.getElementById("associatedSRsToPR") ).find("[id^=srItem-]").length == 1  )
				{
				        jQuery( document.getElementById( "associatePurchaseRequestToSR" ) ).css({ "display" : "none" });//NO I18N	
					jQuery( document.getElementById( "associatesrtopr" ) ).removeAttr("style");//NO I18N
				}
				loadPRTabDetails( document.getElementById('pr-history') , purchaseRequestId , true );
			}	
		}, 
		error: function(jsonObj) 
		{
			jQuery('#loadingdivid').remove();
			setTimeout(function(){displayLoadingInformation("/images/deleteMail.gif", "' + getMessageForKey('sdp.purchase.wotopo.detach.failure') + '", true, 5000)},1000);//NO I18N
		} 
	});//NO I18N
}

function disassociateRequestAfterSuccess( responseText , detachedId , itemName , multidetached , detachedrequest )
{
	//detachedId may be servicerequestid or purchaserequestId or purchaseorderId
	jQuery('#loadingdivid').remove();

	if( responseText == 'success' )
	{
		if( detachedrequest == "purchaserequest" )
		{
			setTimeout(function(){showMessageAndClose(getMessageForKey("sdp.workorder.prtopo.detach.success"), 1500)},100);//NO I18N
		}
		else
		{
			setTimeout(function(){showMessageAndClose(getMessageForKey("sdp.purchase.wotopo.detach.success"), 1500)},100);//NO I18N
		}

		if( multidetached )
		{
			jQuery( "[id^="+ itemName + detachedId+"]" ).fadeOut(1000,function(){ 
				jQuery( "[id^="+ itemName + detachedId +"]" ).remove();
			});
		}
		else
		{
			jQuery( document.getElementById( itemName+detachedId ) ).fadeOut(1000,function(){ 
				jQuery( document.getElementById( itemName+detachedId ) ).remove();
			});
		}
	}
}

function filterTechnicianBySite( siteInput )
{
	var param = '';

	if( notificationEnabledTechIds != null && notificationEnabledTechIds != undefined )
	{
		for( i=0; i<notificationEnabledTechIds.length; i++ )
		{
			param += '&alreadyAddedTechnicianIds=' + notificationEnabledTechIds[i];
		}
	}

	jQuery.ajax({type: 'POST', url: '/servlet/AJaxServlet?action=filterTechnicianBySite&siteId=' + siteInput.value + param, contentType: 'application/json; charset=UTF8', dataType: 'text', success: function(htmlObj) { jQuery('#chooseTechList').html(htmlObj); loadAdminCustomTag(); }, error: function(jsonObj) {jQuery('#chooseTechList').html('');}});//NO I18N
}

function disablePRNotificationForTech( liObj, that )
{
	param = '';

	if( liObj.hasClass('tmpthdr') )
	{
		jQuery('#SelectedTemplates li').each(function()
		{
			if( parseInt(this.value) > 0 )
			{
				param += '&technicianIds=' + this.value;//NO I18N
				toRemoveDisabledTechId = this.value;
				notificationEnabledTechIds = jQuery.grep(notificationEnabledTechIds, function(value) { return value != toRemoveDisabledTechId });
			}
		});
	}
	else
	{
		if( liObj.val() != undefined )
		{
			param += '&technicianIds=' + liObj.val();//NO I18N
			notificationEnabledTechIds = jQuery.grep(notificationEnabledTechIds, function(value) {return value != liObj.val();});
		}
	}

	if( param != '' )
	{
		param = param + "&task=disableNotificationForTech&" + getCSRFParamName() + "=" + getCSRFParamValue();//NO I18N
		jQuery.ajax({type: 'POST', url: '/PurchaseRequest.do?', contentType: 'application/x-www-form-urlencoded;charset=UTF-8', data : param,dataType: 'json', success: function(jsonObj) { if( jsonObj.response_status.status != 'success' ) {alert(jsonObj.response_status.messages[0].message)} }, error: function(jsonObj) {alert(jsonObj.responseText)}});//NO I18N
		return true;
	}
	return false;
}

function enablePRNotificationForTech( liObj, that )
{
	param = '';

	if( liObj.hasClass('tmpthdr') )
	{
		jQuery('#incidentTemp_div li').each(function()
		{
			if( parseInt(this.value) > 0 )
			{
				if( jQuery(this).attr('hasvalidmailid') == true )
				{
					param += '&technicianIds=' + this.value;//NO I18N
					notificationEnabledTechIds.push(this.value);
				}
				else
				{
					alert(getMessageForKey('sdp.purchase.request.admin.notification.email.validation'));//NO I18N
					deleteTemplates(that);
					return false;
				}
			}
		});
	}
	else
	{
		if( liObj.val() != undefined && liObj.attr('hasvalidmailid') == "true" )
		{
			param += '&technicianIds=' + liObj.val();//NO I18N
			notificationEnabledTechIds.push(liObj.val());
		}
		else
		{
			alert(getMessageForKey('sdp.purchase.request.admin.notification.email.validation'));//NO I18N
			deleteTemplates(that);
			return false;
		}
	}
	if( param != '' )
	{
		param = param + "&task=enableNotificationForTech&" + getCSRFParamName() + "=" + getCSRFParamValue();//NO I18N
		jQuery.ajax({type: 'POST', url: '/PurchaseRequest.do?', contentType: 'application/x-www-form-urlencoded;charset=UTF-8; charset=UTF8', data : param ,dataType: 'json', success: function(jsonObj) { if( jsonObj.response_status.status != 'success' ) {alert(jsonObj.response_status.messages[0].message)} }, error: function(jsonObj) {alert(jsonObj.responseText)}});//NO I18N
		return true;
	}
	return false;
}

function swapMode(obj)
{
	if(obj.className == "ae-icon08")
	{
		obj.className = "ae-icon09";//NO I18N
	}
	else
	{
		obj.className = "ae-icon08";//NO I18N
	}
}	

function updatePRNotificationStatus(obj)
{
	param = document.getElementById('openPRTemplate').checked; //No I18N
	params = getCSRFParamName()+"="+getCSRFParamValue();
	jQuery.ajax({type: 'POST', url: '/PurchaseRequest.do?task=updatePRCreationNotification&enablePRCreationNotification=' + param, contentType: 'application/x-www-form-urlencoded;charset=UTF-8', data : params, dataType: 'json', success: function(jsonObj) { if( jsonObj.response_status.status != 'success' ) {alert(jsonObj.response_status.messages[0].message)} }, error: function(jsonObj) {alert(jsonObj.responseText)}});//NO I18N
}

function updateProductInputFieldValue(inputField, li)
{
	liObj = jQuery(li);
	
	index = inputField.name.split("_")[1];//NO I18N

/*	if( liObj.attr('id') != undefined )
	{
		document.getElementById('product_' + index).value = liObj.attr('id');//NO I18N
	}*/
}
function setAutoPopulateDivPosition(itemObj)
{
	var searchInputName = itemObj.name;

	if( searchInputName.indexOf("item_name_") >= 0 )
	{
		var searchItem = jQuery('#search_item');
		jQuery(searchItem).css('left', jQuery( itemObj ).parent().position().left  + 'px' );//NO I18N
		jQuery(searchItem).css('top',  (parseInt( jQuery( itemObj ).parent().position().top ) + 25) + 'px');//NO I18N
	}
	else if( searchInputName == 'requesterName' )
	{
		var searchRequester = jQuery('#search_requestedby');
		jQuery(searchRequester).css('left', 6  + 'px' );//NO I18N
		jQuery(searchRequester).css('top',  27 + 'px');//NO I18N
	}
	else if( searchInputName == 'signingAuthority' )
	{
		var searchAuthority = jQuery('#search_authority');
		jQuery(searchAuthority).css('left', (parseInt(jQuery( itemObj ).parent().position().left) + 120) + 'px' );//NO I18N
		jQuery(searchAuthority).css('top',  (parseInt( jQuery( itemObj ).parent().position().top ) + 25) + 'px');//NO I18N
	}
}

function enableAutoPopulate(itemObj)
{
	if (jQuery( itemObj ).attr( "isAjaxBinded" ) == undefined)
	{
		jQuery( itemObj ).attr( "isAjaxBinded" , "true" );
		new Ajax.Autocompleter(itemObj.id, 'search_item', '/servlet/AJaxServlet?action=searchProduct', {paramName : itemObj.id, afterUpdateElement : updateProductInputFieldValue });//NO I18N
	}
}

function setEstimatedCost( itemObj )
{
	var vendorid = jQuery( document.getElementById( "vendor") ).val();
	var productName = [];
	if( itemObj == null )
	{
		jQuery('[id^="item_name_"]').each(function(){
			if( jQuery( this ).val().trim() != "" && !parseInt(jQuery(this).closest('[id^="itemDetails_"]').find('[id^="estimated_cost_"]').val()))
			{
				productName.push(((jQuery( this ).val()).trim()));
			}
		});
	}
	else
	{
		if( jQuery( itemObj ).val().trim() != "" && !parseInt(jQuery( itemObj ).closest('[id^="itemDetails_"]').find('[id^="estimated_cost_"]').val()))
		{
			productName.push(((jQuery( itemObj ).val()).trim()));
		}
		else if( jQuery( itemObj ).val().trim() == "" )
		{
			var itemdetails_count = jQuery( itemObj ).attr( "name").split("_")[1];
			jQuery( document.getElementById( "estimated_cost_" + itemdetails_count ) ).val( "0.00" ).trigger("onblur");//NO I18N
		}
	}

	if ( vendorid != -1 && productName.length > 0 )
	{
	var data = "productName="+sdpToJSON(productName);//NO I18N
		sdpAjax({type: 'POST', url: '/PurchaseRequest.do?task=getEstimatedCostforProduct&vendorid='+encodeURIComponent(vendorid) , data: data , contentType: 'application/x-www-form-urlencoded; charset=utf-8', dataType:'json',//NO I18N
			success:function( jsonObj ){
				jQuery.each(jsonObj,function( productName , costValue )
					{
						jQuery('[id^="itemDetails_"]').each(function(){
							if( jQuery( this ).find( '[id^="item_name_"]' ).val() == productName && parseInt(costValue) )
							{
								jQuery( this ).find( '[id^="estimated_cost_"]' ).val( costValue );
								return false;
							}
							else if( jQuery( this ).find( '[id^="item_name_"]' ).val() == productName )
							{
								return false;	
							}
						});
					});				
				}
			   });
	}
}

function triggerEstimatedCost()
{
	if( jQuery("[name='vendor']").attr( "setEstimatedCost" ) == undefined )
	{
		var vendorid = jQuery( document.getElementById( "vendor") ).val();
		if ( vendorid != -1 )
		{
			setEstimatedCost();
		}
	}
	else
	{
		jQuery("[name='vendor']").removeAttr( "setEstimatedCost" );//NO I18N
	}
}

function showPrintPreview( requestId )
{
	NewWindow("/PurchaseRequest.do?task=printView&requestId=" + requestId, "PRPrintView","900","600","yes","center");//NO I18N
}

function markAsAboveCostLimitElement()
{
	var aboveCostLimit = false;
	var totalCost = parseFloat(document.getElementById("totalvalue").value);
	jQuery('[id^=approverLevelRow_]').each( function (i) {
		jQuery('#approver_' + (i+1) + ' option').each( function () {
			var approverId = jQuery(this).val();
			var appname =  jQuery(this).html();
			for (k = 0; k < approversName.length; k++) 
			{
				var name = approversName[k];
				if (name == trim(appname)) 
				{
					var costLimit = parseFloat(approversCost[k]);
					if( costLimit < totalCost && costLimit > 0)
					{
						jQuery("#" + approverId).css("border", "solid 2px red");//No I18N
						aboveCostLimit = true;
					}
					else
					{
						jQuery("#" + approverId).css("border", "solid 1px #DCDCDC");//No I18N
					}
					}
				}
		});
	});
	
	return aboveCostLimit;
}
function resetData()
{
	var siteId = jQuery("#site").val();

	if( siteId != -1 && jQuery("#site").attr( "associatedSRs" ) != undefined &&jQuery("#site").attr( "associatedSRs" ) != "null" )
	{
		alert( getMessageForKey("sdp.purchase.request.dissociate.sr.waringmessage",[jQuery("#s2id_site").text().trim()]) );
	}
	
	selectToInput("requester");//NO I18N
	
	selectToInput("technician");//NO I18N

	openSelect2Dropdown('/allusers.json?siteId='+siteId, 'requester', -1, getMessageForKey("sdp.purchase.newpo.requestedby"), 100);//NO I18N
	
	openSelect2Dropdown('/allusers.json?siteId='+siteId+'&isFilterBySite=true', 'technician', 0, getMessageForKey("sdp.purchase.newpo.requestedby"));//NO I18N
	
	jQuery("#" + jQuery("#requester").parent().children("div").attr("id") + " span:nth-child(1)").html( getMessageForKey("sdp.purcase.request.select.requester") );//NO I18N

	jQuery("#requester").val("-1");//NO I18N

	jQuery("#technician").val("-1");//NO I18N

	selectToInput("costcenter");//NO I18N

	jQuery("#" + jQuery("#technician").parent().children("div").attr("id") + " span:nth-child(1)").html( getMessageForKey("sdp.change.bulkoperation.selecttechnician") );//NO  I18n
	var selectedCostCenterData = JSON.parse('{"id" : "-1", "text" : "' + getMessageForKey("sdp.purcase.request.select.costcenter") + '"}');//NO I18N

	params = {"module": "costcenter","siteId":+siteId, "dropdownLength":"25", "defaultDropdownData" : {"id" : "-1", "text" : getMessageForKey("sdp.purcase.request.select.costcenter")}};//NO I18N

	updateSelect2Dropdown({ elementId : 'costcenter', //NO I18N
							placeHolder : getMessageForKey("sdp.purcase.request.select.costcenter"),
							selectedData : selectedCostCenterData,
							isOnChangeEventRequired : false,
							isPagination : true,
							params : (typeof sdpToJSON != 'undefined') ? sdpToJSON(params) : JSON.stringify(params) //No I18N
							});
	jQuery("#" + jQuery("#costcenter").parent().children("div").attr("id") + " span:nth-child(1)").html( getMessageForKey("sdp.purcase.request.select.costcenter") );//NO  I18n

}
function selectToInput( elementId )
{
	var elementObj = jQuery("#" + elementId);

	var elementName = elementObj.attr('name');
	var elementStyle = elementObj.attr('style');
	var elementOnChange = elementObj.attr('onchange');
	var elementAllowedValue = elementObj.attr('allowedvalue');
	var elementDataType = elementObj.attr('datatype');
	var elementValue = elementObj.val();

	var selectTagObj = jQuery(document.createElement("input"));

	selectTagObj.attr('name', elementName);
	selectTagObj.attr('id', elementId + "_");
	selectTagObj.attr('style', elementStyle);
	selectTagObj.attr('type', 'text');
	selectTagObj.attr('allowedvalue', elementAllowedValue);
	selectTagObj.attr('datatype', elementDataType);
	selectTagObj.on('change', function () { elementOnChange });
	selectTagObj.val(elementValue);

	elementObj.parent().append(jQuery(selectTagObj));

	jQuery('#' + elementId).select2("destroy");//NO I18N
	jQuery('.select2-drop-mask').remove();
	elementObj.remove();

	selectTagObj.attr('id', elementId);

	//jQuery('#' + elementId).select2();
	//jQuery('#' + elementId).select2("open");//NO I18N*/
}

//using ajax , to store the form data in db
function callAjaxToSubmitData( formName , showProgessIndicator , isITPortal, isRemote, isAssetBuild)
{
     if (  showProgessIndicator )
     {
        invokeProgressIndicator(null,"sdp.common.processing", null, null, null); //No I18N
     }
  if(formName == "assetForm")
  {
	  if(isITPortal) {
	    if(isRemote){
            var data = '{"notifyAuditChanges":"' + jQuery("#notifyAuditChanges").is(":checked") + '","selectedNotifyAuditChanges_TechList":"' + jQuery('#notifyAuditChanges_TechList').val()+'","notifyAuditChangesEmailIDs":"'+ jQuery('#notifyAuditChanges_EmailIDsList').val().replace(/\n/gm,"")+'","notifySWUnderCompliance":"'+jQuery('#notifySWUnderCompliance').is(":checked")+'","selectedNotifySWUnderCompliance_TechList":"'+jQuery('#notifySWUnderCompliance_TechList').val()+'","notifySWUnderComplianceEmailIDs":"'+jQuery('#notifySWUnderCompliance_EmailIDsList').val().replace(/\n/gm,"")+'","notifyProhibitedSoftware":"'+jQuery('#notifyProhibitedSoftware').is(":checked")+'","selectedNotifyProhibitedSoftware_TechList":"'+jQuery('#notifyProhibitedSoftware_TechList').val()+'","notifyProhibitedSoftwareEmailIDs":"'+jQuery('#notifyProhibitedSoftware_EmailIDsList').val().replace(/\n/gm,"")+'","notifyProhibitedSWToUsers":"'+jQuery('#notifyProhibitedSWToUsers').is(":checked")+'","notifyAssetWarrantyExpiry":"'+jQuery("#notifyAssetWarrantyExpiry").is(":checked")+'","selectedNotifyAssetWarrantyExpiry_TechList":"'+jQuery('#notifyAssetWExpiry_TechList').val()+'","notifyAssetWarrantyExpiryEmailIDs":"'+jQuery('#notifyAssetWExpiry_EmailIDsList').val().replace(/\n/gm,"")+'","notifyAssetWarrantyExpiryBefore":"'+jQuery('#notifyAssetWarrantyExpiryBefore').val()+'","notifyAssetWarrantyExpiryAfter":"'+jQuery('#notifyAssetWarrantyExpiryAfter').val()+'","notifyAssetWarrantyExpiryFrequency":"'+jQuery('#notifyAssetWarrantyExpiryFrequency').val()+'","notifyAssetExpiry":"'+jQuery('#notifyAssetExpiry').is(":checked")+'","selectedNotifyAssetExpiry_TechList":"'+jQuery('#notifyAssetExpiry_TechList').val()+'","notifyAssetExpiryEmailIDs":"'+jQuery('#notifyAssetExpiry_EmailIDsList').val().replace(/\n/gm,"") + '","notifyAssetExpiryBefore":"'+jQuery('#notifyAssetExpiryBefore').val()+ '","notifyAssetExpiryAfter":"'+jQuery('#notifyAssetExpiryAfter').val()+'","notifyAssetExpiryFrequency":"'+jQuery('#notifyAssetExpiryFrequency').val()+ '","notifySccmFailure":"' + jQuery("#notifySccmFailure").is(":checked") + '","notifySccmFailure_TechList":"' + jQuery('#notifySccmFailure_TechList').val()+'","notifySccmFailure_EmailIDsList":"'+ jQuery('#notifySccmFailure_EmailIDsList').val().replace(/\n/gm,"") + '","notifySolarwindsFailure":"' + jQuery("#notifySolarwindsFailure").is(":checked") + '","notifySolarwindsFailure_TechList":"' + jQuery('#notifySolarwindsFailure_TechList').val()+'","notifySolarwindsFailure_EmailIDsList":"'+ jQuery('#notifySolarwindsFailure_EmailIDsList').val().replace(/\n/gm,"") +'"}'; //No I18N
	    }
	    else if(isAssetBuild){
            var data = '{"notifyAuditChanges":"' + jQuery("#notifyAuditChanges").is(":checked") + '","selectedNotifyAuditChanges_TechList":"' + jQuery('#notifyAuditChanges_TechList').val()+'","notifyThresholdCountCrossover":"'+jQuery('#notifyThresholdCountCrossover').is(":checked")+'","selectedNotifyThresholdCountCrossover_TechList":"'+jQuery('#notifyThresholdCountCrossover_TechList').val()+'","notifyThresholdCountCrossoverEmailIDs":"'+jQuery('#notifyThresholdCountCrossover_EmailIDsList').val().replace(/\n/gm,"")+'","notifyAuditChangesEmailIDs":"'+ jQuery('#notifyAuditChanges_EmailIDsList').val().replace(/\n/gm,"")+'","notifySWUnderCompliance":"'+jQuery('#notifySWUnderCompliance').is(":checked")+'","selectedNotifySWUnderCompliance_TechList":"'+jQuery('#notifySWUnderCompliance_TechList').val()+'","notifySWUnderComplianceEmailIDs":"'+jQuery('#notifySWUnderCompliance_EmailIDsList').val().replace(/\n/gm,"")+'","notifyProhibitedSoftware":"'+jQuery('#notifyProhibitedSoftware').is(":checked")+'","selectedNotifyProhibitedSoftware_TechList":"'+jQuery('#notifyProhibitedSoftware_TechList').val()+'","notifyProhibitedSoftwareEmailIDs":"'+jQuery('#notifyProhibitedSoftware_EmailIDsList').val().replace(/\n/gm,"")+'","notifyProhibitedSWToUsers":"'+jQuery('#notifyProhibitedSWToUsers').is(":checked")+'","notifyLeaseExpiry":"'+jQuery('#notifyLeaseExpiry').is(":checked")+'","selectedLeaseExpiry_TechList":"'+jQuery('#notifyLeaseExpiry_TechList').val()+'","notifyLeaseExpiryEmailIDs":"'+jQuery('#notifyLeaseExpiry_EmailIDsList').val().replace(/\n/gm,"")+'","notifyLeaseExpiryBefore":"'+jQuery('#notifyLeaseExpiryBefore').val()+'","notifyLeaseExpiryAfter":"'+jQuery('#notifyLeaseExpiryAfter').val()+'","notifyLeaseExpiryFrequency":"'+jQuery('#notifyLeaseExpiryFrequency').val()+'","notifyAssetWarrantyExpiry":"'+jQuery("#notifyAssetWarrantyExpiry").is(":checked")+'","selectedNotifyAssetWarrantyExpiry_TechList":"'+jQuery('#notifyAssetWExpiry_TechList').val()+'","notifyAssetWarrantyExpiryEmailIDs":"'+jQuery('#notifyAssetWExpiry_EmailIDsList').val().replace(/\n/gm,"")+'","notifyAssetWarrantyExpiryBefore":"'+jQuery('#notifyAssetWarrantyExpiryBefore').val()+'","notifyAssetWarrantyExpiryAfter":"'+jQuery('#notifyAssetWarrantyExpiryAfter').val()+'","notifyAssetWarrantyExpiryFrequency":"'+jQuery('#notifyAssetWarrantyExpiryFrequency').val()+'","notifyAssetExpiry":"'+jQuery('#notifyAssetExpiry').is(":checked")+'","selectedNotifyAssetExpiry_TechList":"'+jQuery('#notifyAssetExpiry_TechList').val()+'","notifyAssetExpiryEmailIDs":"'+jQuery('#notifyAssetExpiry_EmailIDsList').val().replace(/\n/gm,"") + '","notifyNewLoan":"'+jQuery('#notifyNewLoan').is(":checked") + '","notifyReturnLoan":"'+jQuery('#notifyReturnLoan').is(":checked")+'","notifyExtendLoan":"'+jQuery('#notifyExtendLoan').is(":checked") + '","notifyAssignOwner":"'+jQuery('#notifyAssignOwner').is(":checked")+ '","notifyDeAssignOwner":"'+jQuery('#notifyDeAssignOwner').is(":checked")+'","notifyAssetExpiryBefore":"'+jQuery('#notifyAssetExpiryBefore').val()+'","notifyAssetExpiryAfter":"'+jQuery('#notifyAssetExpiryAfter').val()+'","notifyAssetExpiryFrequency":"'+jQuery('#notifyAssetExpiryFrequency').val()+ '","notifySccmFailure":"' + jQuery("#notifySccmFailure").is(":checked") + '","notifySccmFailure_TechList":"' + jQuery('#notifySccmFailure_TechList').val()+'","notifySccmFailure_EmailIDsList":"'+ jQuery('#notifySccmFailure_EmailIDsList').val().replace(/\n/gm,"") + '","notifySolarwindsFailure":"' + jQuery("#notifySolarwindsFailure").is(":checked") + '","notifySolarwindsFailure_TechList":"' + jQuery('#notifySolarwindsFailure_TechList').val()+'","notifySolarwindsFailure_EmailIDsList":"'+ jQuery('#notifySolarwindsFailure_EmailIDsList').val().replace(/\n/gm,"") +'"}'; //No I18N
	  	}
	    else {
            var data = '{"notifyAuditChanges":"' + jQuery("#notifyAuditChanges").is(":checked") + '","selectedNotifyAuditChanges_TechList":"' + jQuery('#notifyAuditChanges_TechList').val()+'","notifyThresholdCountCrossover":"'+jQuery('#notifyThresholdCountCrossover').is(":checked")+'","selectedNotifyThresholdCountCrossover_TechList":"'+jQuery('#notifyThresholdCountCrossover_TechList').val()+'","notifyThresholdCountCrossoverEmailIDs":"'+jQuery('#notifyThresholdCountCrossover_EmailIDsList').val().replace(/\n/gm,"")+'","notifyAuditChangesEmailIDs":"'+ jQuery('#notifyAuditChanges_EmailIDsList').val().replace(/\n/gm,"")+'","notifySWUnderCompliance":"'+jQuery('#notifySWUnderCompliance').is(":checked")+'","selectedNotifySWUnderCompliance_TechList":"'+jQuery('#notifySWUnderCompliance_TechList').val()+'","notifySWUnderComplianceEmailIDs":"'+jQuery('#notifySWUnderCompliance_EmailIDsList').val().replace(/\n/gm,"")+'","notifyProhibitedSoftware":"'+jQuery('#notifyProhibitedSoftware').is(":checked")+'","selectedNotifyProhibitedSoftware_TechList":"'+jQuery('#notifyProhibitedSoftware_TechList').val()+'","notifyProhibitedSoftwareEmailIDs":"'+jQuery('#notifyProhibitedSoftware_EmailIDsList').val().replace(/\n/gm,"")+'","notifyProhibitedSWToUsers":"'+jQuery('#notifyProhibitedSWToUsers').is(":checked")+'","notifyLeaseExpiry":"'+jQuery('#notifyLeaseExpiry').is(":checked")+'","selectedLeaseExpiry_TechList":"'+jQuery('#notifyLeaseExpiry_TechList').val()+'","notifyLeaseExpiryEmailIDs":"'+jQuery('#notifyLeaseExpiry_EmailIDsList').val().replace(/\n/gm,"")+'","notifyLeaseExpiryBefore":"'+jQuery('#notifyLeaseExpiryBefore').val()+'","notifyLeaseExpiryAfter":"'+jQuery('#notifyLeaseExpiryAfter').val()+'","notifyLeaseExpiryFrequency":"'+jQuery('#notifyLeaseExpiryFrequency').val()+'","notifyAssetWarrantyExpiry":"'+jQuery("#notifyAssetWarrantyExpiry").is(":checked")+'","selectedNotifyAssetWarrantyExpiry_TechList":"'+jQuery('#notifyAssetWExpiry_TechList').val()+'","notifyAssetWarrantyExpiryEmailIDs":"'+jQuery('#notifyAssetWExpiry_EmailIDsList').val().replace(/\n/gm,"")+'","notifyAssetWarrantyExpiryBefore":"'+jQuery('#notifyAssetWarrantyExpiryBefore').val()+'","notifyAssetWarrantyExpiryAfter":"'+jQuery('#notifyAssetWarrantyExpiryAfter').val()+'","notifyAssetWarrantyExpiryFrequency":"'+jQuery('#notifyAssetWarrantyExpiryFrequency').val()+'","notifyAssetExpiry":"'+jQuery('#notifyAssetExpiry').is(":checked")+'","selectedNotifyAssetExpiry_TechList":"'+jQuery('#notifyAssetExpiry_TechList').val()+'","notifyAssetExpiryEmailIDs":"'+jQuery('#notifyAssetExpiry_EmailIDsList').val().replace(/\n/gm,"") + '","notifyNewLoan":"'+jQuery('#notifyNewLoan').is(":checked") + '","notifyReturnLoan":"'+jQuery('#notifyReturnLoan').is(":checked")+'","notifyExtendLoan":"'+jQuery('#notifyExtendLoan').is(":checked") + '","notifyNewBooking":"'+jQuery('#notifyNewBooking').is(":checked") + '","notifyRescheduleBooking":"'+jQuery('#notifyRescheduleBooking').is(":checked") + '","notifyToPickupAssets":"'+jQuery('#notifyToPickupAssets').is(":checked") + '","notifyCancelBooking":"'+jQuery('#notifyCancelBooking').is(":checked") + '","notifyBookingAllocateAsset":"'+jQuery('#notifyBookingAllocateAsset').is(":checked")+'","notifyBookingAllocateBefore":"'+jQuery('#notifyBookingAllocateBefore').val()+ '","notifyAssignOwner":"'+jQuery('#notifyAssignOwner').is(":checked")+ '","notifyDeAssignOwner":"'+jQuery('#notifyDeAssignOwner').is(":checked")+'","notifyAssetExpiryBefore":"'+jQuery('#notifyAssetExpiryBefore').val()+'","notifyAssetExpiryAfter":"'+jQuery('#notifyAssetExpiryAfter').val()+'","notifyAssetExpiryFrequency":"'+jQuery('#notifyAssetExpiryFrequency').val()+ '","notifySccmFailure":"' + jQuery("#notifySccmFailure").is(":checked") + '","notifySccmFailure_TechList":"' + jQuery('#notifySccmFailure_TechList').val()+'","notifySccmFailure_EmailIDsList":"'+ jQuery('#notifySccmFailure_EmailIDsList').val().replace(/\n/gm,"") + '","notifySolarwindsFailure":"' + jQuery("#notifySolarwindsFailure").is(":checked") + '","notifySolarwindsFailure_TechList":"' + jQuery('#notifySolarwindsFailure_TechList').val()+'","notifySolarwindsFailure_EmailIDsList":"'+ jQuery('#notifySolarwindsFailure_EmailIDsList').val().replace(/\n/gm,"") +'"}'; //No I18N
	  	}
	}
	else{
		 var data = '{"notifyLeaseExpiry":"'+jQuery('#notifyLeaseExpiry').is(":checked")+'","selectedLeaseExpiry_TechList":"'+jQuery('#notifyLeaseExpiry_TechList').val()+'","notifyLeaseExpiryEmailIDs":"'+jQuery('#notifyLeaseExpiry_EmailIDsList').val().replace(/\n/gm,"")+'","notifyThresholdCountCrossover":"'+jQuery('#notifyThresholdCountCrossover').is(":checked")+'","selectedNotifyThresholdCountCrossover_TechList":"'+jQuery('#notifyThresholdCountCrossover_TechList').val()+'","notifyThresholdCountCrossoverEmailIDs":"'+jQuery('#notifyThresholdCountCrossover_EmailIDsList').val().replace(/\n/gm,"")+'","notifyLeaseExpiryBefore":"'+jQuery('#notifyLeaseExpiryBefore').val()+'","notifyLeaseExpiryAfter":"'+jQuery('#notifyLeaseExpiryAfter').val()+'","notifyLeaseExpiryFrequency":"'+jQuery('#notifyLeaseExpiryFrequency').val()+'","notifyAssetWarrantyExpiry":"'+jQuery("#notifyAssetWarrantyExpiry").is(":checked")+'","selectedNotifyAssetWarrantyExpiry_TechList":"'+jQuery('#notifyAssetWExpiry_TechList').val()+'","notifyAssetWarrantyExpiryEmailIDs":"'+jQuery('#notifyAssetWExpiry_EmailIDsList').val().replace(/\n/gm,"")+'","notifyAssetWarrantyExpiryBefore":"'+jQuery('#notifyAssetWarrantyExpiryBefore').val()+'","notifyAssetWarrantyExpiryAfter":"'+jQuery('#notifyAssetWarrantyExpiryAfter').val()+'","notifyAssetWarrantyExpiryFrequency":"'+jQuery('#notifyAssetWarrantyExpiryFrequency').val()+'","notifyAssetExpiry":"'+jQuery('#notifyAssetExpiry').is(":checked")+'","selectedNotifyAssetExpiry_TechList":"'+jQuery('#notifyAssetExpiry_TechList').val()+'","notifyAssetExpiryEmailIDs":"'+jQuery('#notifyAssetExpiry_EmailIDsList').val().replace(/\n/gm,"") + '","notifyNewLoan":"'+jQuery('#notifyNewLoan').is(":checked") + '","notifyReturnLoan":"'+jQuery('#notifyReturnLoan').is(":checked")+'","notifyExtendLoan":"'+jQuery('#notifyExtendLoan').is(":checked") + '","notifyAssignOwner":"'+jQuery('#notifyAssignOwner').is(":checked")+ '","notifyDeAssignOwner":"'+jQuery('#notifyDeAssignOwner').is(":checked")+'","notifyAssetExpiryBefore":"'+jQuery('#notifyAssetExpiryBefore').val()+'","notifyAssetExpiryAfter":"'+jQuery('#notifyAssetExpiryAfter').val()+'","notifyAssetExpiryFrequency":"'+jQuery('#notifyAssetExpiryFrequency').val()+'","notifyNewBooking":"'+ jQuery('#notifyNewBooking').is(":checked") + '","notifyRescheduleBooking":"'+jQuery('#notifyRescheduleBooking').is(":checked") + '","notifyToPickupAssets":"'+jQuery('#notifyToPickupAssets').is(":checked") + '","notifyCancelBooking":"'+jQuery('#notifyCancelBooking').is(":checked") + '","notifyBookingAllocateAsset":"'+jQuery('#notifyBookingAllocateAsset').is(":checked")+'","notifyBookingAllocateBefore":"'+jQuery('#notifyBookingAllocateBefore').val()+'"}';//NO I18N
	}
    }
  else if(formName == "purchaseForm")
  {
     var data = '{"notifyPOOverdue":"'+jQuery("#notifyPOOverdue").is(":checked")+'","notifyPOCanceled":"'+jQuery("#notifyPOCanceled").is(":checked")+'","notifyPOApproved":"'+jQuery("#notifyPOApproved").is(":checked")+'","notifyPORejected":"'+jQuery("#notifyPORejected").is(":checked")+'","notifyPOPendingApproval":"'+jQuery("#notifyPOPendingApproval").is(":checked")+'","notifyPORejectedForSrt":"'+jQuery("#notifyPORejectedForSrt").is(":checked")+'","notifyPOReceivedForSrt":"'+jQuery("#notifyPOReceivedForSrt").is(":checked")+'","notifyPartiallyReceivedSrt":"'+jQuery("#notifyPartiallyReceivedSrt").is(":checked")+'","notifyPOCanceledForSrt":"'+jQuery("#notifyPOCanceledForSrt").is(":checked")+'","PRPendingApprovalNotification":"'+jQuery("#PRPendingApprovalNotification").is(":checked")+'","PRApprovedNotification":"'+jQuery("#PRApprovedNotification").is(":checked")+'","PRRejectedNotification":"'+jQuery("#PRRejectedNotification").is(":checked")+'","PRCloseNotification":"'+jQuery("#PRCloseNotification").is(":checked")+'", "PRCancelNotification":"'+jQuery("#PRCancelNotification").is(":checked")+'","PRReceivedNotification":"'+jQuery("#PRReceivedNotification").is(":checked")+'","PRPartiallyReceivedNotification":"'+jQuery("#PRPartiallyReceivedNotification").is(":checked")+'","PROverdueNotification":"'+jQuery("#PROverdueNotification").is(":checked")+'"}';//No I18N
  }
  else if(formName == "contractForm")
  {
	  var data = '{"notifyContractExpiryToTechnician":"'+jQuery("#notifyContractExpiryToTechnician").is(":checked")+'"}';//No I18N
  }
  data = "data=" + data + "&" + getCSRFParamName()+"="+getCSRFParamValue(); //No I18N
  jQuery.ajax({
     url:'/AssetDefaultConfigDef.do?isAjaxSubmit=ajaxSubmit&formName='+formName, //No I18N
     type:"post",//No I18N
     dataType:'text',//No I18N
     data:data,//No I18N
     success:function(responseText){
    	if(responseText == "success")
        {
           if (  ! showProgessIndicator )
           {
               updateProgress();
           }    
           closeProgressIndicator("sdp.notification.settings.update.success", true); //No I18N
        }
    	else
   		{
            closeProgressIndicator("sdp.notification.settings.update.failure", false); //No I18N
   		}
     }
  });
}

//method added for MSP
function appendAccountIdForPRUrls(url, id) {
	return url + '&persistentAccountId=' + id + '&persistAccountID=false';//NO I18N
}

function LoadedSite(jsonText)
{

	var siteId = jQuery("#site").val();
	var selectedCostCenterData = JSON.parse('{"id" : "-1", "text" : "' + getMessageForKey("sdp.purcase.request.select.costcenter") + '"}');//NO I18N
	if(jsonText != null)
	{
		var prSiteId=jsonText && jsonText.purchaserequests.site ? jsonText.purchaserequests.site.id : undefined;
		if(prSiteId==undefined || prSiteId==null)
		{
			prSiteId=-1;
		}
		params = {"module": "costcenter","siteId":+prSiteId, "dropdownLength":"25", "defaultDropdownData" : {"id" : "-1", "text" : getMessageForKey("sdp.purcase.request.select.costcenter")}};//NO I18N
		if(jsonText.purchaserequests.costcenter!=null)
		{
			selectedCostCenterData = JSON.parse('{"id" : "' + jsonText.purchaserequests.costcenter.id + '", "text" : "' + jsonText.purchaserequests.costcenter.code+','+jsonText.purchaserequests.costcenter.name + '"}');//NO I18N	
		}
	}
	else
	{
		params = {"module": "costcenter","siteId":+siteId, "dropdownLength":"25", "defaultDropdownData" : {"id" : "-1", "text" : getMessageForKey("sdp.purcase.request.select.costcenter")}};//NO I18N
	}
	selectToInput("costcenter");//NO I18N
	updateSelect2Dropdown({ elementId : 'costcenter', //NO I18N
							placeHolder : prSiteId,
							selectedData : selectedCostCenterData,
							isOnChangeEventRequired : false,
							isPagination : true,
							params : (typeof sdpToJSON != 'undefined') ? sdpToJSON(params) : JSON.stringify(params) //No I18N
							});

}
