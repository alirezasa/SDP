// $Id$
var Barcode = function(options) {
	var loadFormContents = function(isAssoBarcode,isOnlySiteList)
	{
		jQuery.ajax({
			async: false,
			url: '/BarcodeScanAction.do?method=createLoadBarcode&isAssoBarcode='+isAssoBarcode+'&isOnlySiteList='+isOnlySiteList,//NO I18N
			type: "POST",//NO I18N
			dataType: 'json',//NO I18N
			success: function( data ) {
				if(!isOnlySiteList)
				{
					constrauctSelectOptions("productType",data.productTypes,true);//NO I18N
					if(!isAssoBarcode)
					{
					}
					else
					{
						constrauctSelectOptionsForMappingField("mappingField",data.mappingFields,true);//NO I18N
					}
				}
				jQuery("#allowedBarcodesCount").val(data.allowedBarcodesCount);
				constrauctSelectOptions("siteList",data.sites,true);//NO I18N
				constrauctSelectOptions("labelSite",data.sites,true);//NO I18N
				jQuery("#labelSite option[value='']").remove();//NO I18N
			}
		});
	},

	productTypeChange = function(productType, newProduct)
	{
		if(productType==="0"){
			jQuery("#productList").select2("val", ""); //NO I18N
			jQuery("#productList").select2("enable", false); //NO I18N
			jQuery("#serviceTagRow").hide();//NO I18N
			jQuery("#addNewProdButton").addClass("hide");//NO I18N
		}
		else{
			jQuery.ajax({
				async: false,
				url: '/BarcodeScanAction.do?method=createLoadBarcode&mode=productTypeChange&productType='+productType,//NO I18N
				type: "POST",//NO I18N
				dataType: 'json',//NO I18N
				success: function( data ) {
					if(newProduct == undefined)
					{
						jQuery("#productList").select2("enable", true);//NO I18N
						var module = jQuery("#productType").select2("data"); //NO I18N
						var prodOptions = {
							url: [{
								url: "/api/v3/"+encodeHTMLAttribute(module.api_plural_name)+"/product",//NO I18N
								field: "product" //NO I18N
							}],
							value:{},
							placeholder: getMessageForKey("sdp.inventory.resourcesconn.chooseproduct"),
							allowClear: true
						}
						jQuery("#productList").sdp_select2(prodOptions);
						jQuery("#productList").select2("data",null);//NO I18N
						if(data.isWorkstation)
						{
							jQuery("#isWorkstation").val(true);//NO I18N
							jQuery("#serviceTagRow").show();
						}
						else
						{
							jQuery("#isWorkstation").val(false);//NO I18N
							jQuery('#serviceTag').prop('checked', false);//NO I18N
							jQuery("#serviceTagRow").hide();//NO I18N
						}
					}
					jQuery("#addNewProdButton").removeClass("hide");//NO I18N
				}
			});
		}

	},

    addingNewProduct = function () {
        var data;
        jQuery.validator.addMethod('ipAddress', function (value) {// No I18N
            return isIpAddress(value) || isIpV6Address(value) || !value;
            // return value.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/) || !value;
        }, getMessageForKey("ae.cmdb.inventory.addNewWorkstationCI.valideIP.message"));

        jQuery.validator.addMethod("double", function (value) {// No I18N
            return isDouble(value) || !value;
            // return value.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/) || !value;
        }, getMessageForKey("sdp.inventory.contract.msg1"));
        if(!jQuery("#product_new_form").valid()) return;

        data = {
            "product":  { // No I18N
                "name": jQuery("#product_name").val(),// No I18N
                //"product_type": { "id": jQuery('#productType').val() }, // No I18N
                "all_product_type": { "id": jQuery('#productType').val() }, // No I18N
                "cost": jQuery("#product_cost").val() || 0,  // No I18N
                "manufacturer": jQuery("#model_manufacturer").val(), // No I18N
            }
        }

        if (this.productType.internal_name === "Computer") {
            data.product.computer_group = { id: jQuery("#computer_group").val() };
        }

        sdpAjax({
            url: "/api/v3/products",//NO I18N
            type: "post", // No I18N
            data: sdpAjaxInputData(data),
            success: function (response) {
				var product = {id : response.product.id, text : response.product.name};
                showalert("success", getMessageForKey("sdp.admin.common.addedsuccessfully"), "isAutoHide=true"); // No I18N
                jQuery("#popup_form_container").dialog("close"); // No I18N
                productTypeChange(jQuery('#productType').val());
				jQuery("#productList").select2("data",product); // No I18N
            },
        });
    },
	productChange = function(product,isSequenceNeeded)
	{
		if(product.value != "-1")
		{
			jQuery.ajax({
				url: '/BarcodeScanAction.do?method=createLoadBarcode&mode=productChange&product='+product.value,//NO I18N
				type: "POST",//NO I18N
				dataType: 'json',//NO I18N
				success: function( data ) {
					if(isSequenceNeeded)
					{
						setSequence(data.productTypeId,false);
					}
					if(data.isWorkstation)
					{
						jQuery("#isWorkstation").val(true);//NO I18N
						jQuery("#serviceTagRow").show();
					}
					else
					{
						jQuery('#serviceTag').prop('checked', false);//NO I18N
						jQuery("#serviceTagRow").hide();//NO I18N
					}
				}
			});
		}
	},

	assoProductTypeChange = function(productType)
	{
		if(productType != "-1" && productType != "0")
		{
			var isSequence = jQuery("#isSequence").val();
			if(isSequence == "true")
			{
				setSequence(productType,true);
			}
			else
			{
				var site = jQuery("#siteList").val();
				jQuery.ajax({
					url: '/BarcodeScanAction.do?method=createExistingAssets&mode=loadMappingFields&productType='+productType+'&site='+site,//NO I18N
					type: "POST",//NO I18N
					dataType: 'json',//NO I18N
					success: function( data )
					{
						jQuery('#mappingField').select2("destroy");//NO I18N
						constrauctSelectOptionsForMappingField("mappingField",data.mappingFields,false);//NO I18N
						jQuery('#mappingField').select2();//NO I18N
						if(data.count==-1)
						{
                            jQuery("#productType").select2("data", {"id": 0, "display_name": getMessageForKey("sdp.admin.product.typejserror")}); //NO I18N
							alert(getMessageForKey('ae.barcode.formValidation.noAssetsAvail'));
							return false;
						}
					}
				});

			}
		}
		else
		{
			jQuery('#count').val("");//NO I18N
		}
		return false;
	},

	addVendorBarcode = function() {
			if(jQuery('.scannedBarcodeClass').text() == '' ||  jQuery('.scannedBarcodeClass').text() == undefined) {
				showBaloonToolTip('vendor-bc', getMessageForKey('ae.barcode.formValidation.scanBarcode')); //NO I18N
				return false;
			}
			else if(jQuery('#productType').val() == -1 || jQuery('#productType').val() == 0 || jQuery('#productType').val() == '') {
				showBaloonToolTip('productType', getMessageForKey('ae.barcode.formValidation.productType'));//NO I18N
				return false;
			}
			else if(jQuery('#productList').val() == -1 || jQuery('#productList').val() == 0 || jQuery('#productList').val() == '') {
				showBaloonToolTip('productList', getMessageForKey('ae.barcode.formValidation.product'));//NO I18N
				return false;
			}
			else {
				jQuery("#generateBarodesForAssets").prop('disabled', true);//NO I18N
				jQuery("#generateBarodesForAssets").html(getMessageForKey('sdp.admin.common.saving'));
				var barcodeArr = [];
				jQuery('.scannedBarcodeClass').each(function()
				{
     					barcodeArr.push(jQuery(this).text());
   				});
			       jQuery("#barcodes").val(barcodeArr.join(','));//NO I18N
			       var jsonObj = jQuery("#venderBarcodeForm").formToJSON();
			       delete jsonObj.sdpcsrfparam;
				if(jQuery("#serviceTag").prop('checked') == true)
				{
					jsonObj.isServiceTag=true;
				}
				else
				{
					jsonObj.isServiceTag=false;
				}
				var jsonString = '&data='+encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(jsonObj) : JSON.stringify(jsonObj) );//NO I18N
				jQuery.ajax({
					url: '/BarcodeScanAction.do?method=createVendorBarcode',//NO I18N
					type: "POST",//NO I18N
					data: jsonString,
					dataType: 'json',//NO I18N
					success: function( data )
					{
						if(data.isCountExceeded) {
							showBaloonToolTip('vendor-bc', getMessageForKey('ae.barcode.formValidation.allowedCount', [data.allowedBarcodesCount]));//NO I18N
					    	return false;
						}
						else {

						jQuery("#totalCount").text(data.successCount+data.failureCount);//NO I18N
						jQuery("#successCount").text(data.successCount);//NO I18N
						jQuery("#failureCount").text(data.failureCount);//NO I18N
						if(data.successCount > 0 && data.failureCount > 0)
						{
							jQuery(".bc-sep").show();//NO I18N
							jQuery(".bc-sucess").show();//NO I18N
							jQuery(".bc-failure").show();//NO I18N
						}
						else if(data.successCount > 0)
						{
							jQuery(".bc-sucess").show();//NO I18N
						}
						if(data.failureCount > 0)
						{
							jQuery(".bc-failure").show();//NO I18N
							jQuery("#failedHeader").show();
							jQuery("#failedTableHeader").show();
							jQuery.each(data.failureBarcodes, function (i, barcodes)
							{
								jQuery("#failedTableBody").append('<tr><td width="30%"><div style="width:100px">'+encodeHTML(barcodes.barcode)+'</div></td><td><div>'+encodeHTML(barcodes.reason)+'</div></td></tr>');//NO I18N
							});
						}
						setTimeout(function() { parent.closeDialog();}, 100);
						barcode.triggerNextstep('#vendorsstep2', '#vendorsstep1');//NO I18N
						}
					},
					error: function(xhr)
					{
						parent.window.open('/jsp/Error.jsp', '_self');//No i18n
					}
				});
			}
			return false;
	},
	setSequence = function(productType,isAssoBarcode)
	{
		var isSequence = jQuery("#isSequence").val();
		jQuery("#prefix").val('').removeClass('ph');//NO I18N
		jQuery("#sufix").val('').removeClass('ph');//NO I18N
		jQuery("#from").val('').removeClass('ph');//NO I18N
		var site = "-1";
		if(isAssoBarcode)
		{
			site = jQuery("#siteList").val();
		}
		if(productType != "0" && isSequence == "true"){
			jQuery.ajax({
				url: '/BarcodeScanAction.do?method=createOwnBarcode&mode=getSequence&productType='+productType+'&isAssoBarcode='+isAssoBarcode+'&site='+site,//NO I18N
				type: "POST",//NO I18N
				dataType: 'json',//NO I18N
				success: function( data ) {
					if(isAssoBarcode)
					{
						if(data.count != "-1")
						{
							jQuery("#count").val(data.count);//NO I18N
							jQuery("#count").prop('disabled', true);//NO I18N
						}
						else
						{
							jQuery("#count").val('');//NO I18N
							jQuery("#productType").select2("data", {"id": 0, "display_name": getMessageForKey("sdp.admin.product.typejserror")}); //NO I18N
							alert(getMessageForKey('ae.barcode.formValidation.noAssetsAvail'));
							return false;
						}
					}
					if(data.seqAvailable)
					{
						jQuery("#prefix").val(data.prefix).removeClass('ph');//NO I18N
						jQuery("#sufix").val(data.sufix).removeClass('ph');//NO I18N
						jQuery("#from").val(data.from).removeClass('ph');//NO I18N
						//showPlaceholder();
					}
				}
			});
		}
	},
	generateAndAddAsset = function(id)
	{
		/*if(jQuery('#productList').val() == -1 )
		{
			showBaloonToolTip('productList', "Please select product");//NO I18N
			return false;
		}
		else if(jQuery("#isSequence").val() == "true"){

		}*/
		if(isMSPOrSCP){
			jQuery("#generateAndAddAsset").prop('disabled','true');//NO I18N
		}
		var ownBarcodeObj = jQuery("#ownBarcodeForm").formToJSON();
		delete ownBarcodeObj.sdpcsrfparam;
		ownBarcodeObj.isVendorBarcode = "false";//NO I18N
		if(ownBarcodeObj.productType == "-1" || ownBarcodeObj.productType == "0" || ownBarcodeObj.productType == "")
		{
			showBaloonToolTip('productType', getMessageForKey('ae.barcode.formValidation.productType'));//NO I18N
			return false;
		}
		else if(ownBarcodeObj.product == "-1" || ownBarcodeObj.product == "0" || ownBarcodeObj.product == "")
		{
			showBaloonToolTip('productList', getMessageForKey('ae.barcode.formValidation.product'));//NO I18N
			return false;
		}
		else if(ownBarcodeObj.isSequence == "true" && (ownBarcodeObj.from == "" || !(/^\d+$/.test(ownBarcodeObj.from))))
		{
			showBaloonToolTip('from', getMessageForKey('ae.barcode.formValidation.validNumber'));//NO I18N
			return false;
		}
		else if(ownBarcodeObj.isSequence == "true" && (ownBarcodeObj.count == "" || !(/^[0-9]+$/.test(ownBarcodeObj.count)) || ownBarcodeObj.count <= 0))
		{
			showBaloonToolTip('count', getMessageForKey('ae.barcode.formValidation.validCount'));//NO I18N
			return false;
		}
		else if(ownBarcodeObj.isSequence == "true" && Number(ownBarcodeObj.allowedBarcodesCount) < Number(ownBarcodeObj.count))
		{
			showBaloonToolTip('count', getMessageForKey('ae.barcode.formValidation.allowedCount', [ownBarcodeObj.allowedBarcodesCount]));//NO I18N
			return false;
		}
		else if(ownBarcodeObj.isSequence == "false" && ownBarcodeObj.barcodes.trim() == "")
		{
			showBaloonToolTip('barcodes', getMessageForKey('ae.barcode.formValidation.enterBarcodes'));//NO I18N
			return false;
		}
		else if(ownBarcodeObj.isSequence == "false" && Number(ownBarcodeObj.allowedBarcodesCount) < ownBarcodeObj.barcodes.split(',').length)
		{
			showBaloonToolTip('barcodes', getMessageForKey('ae.barcode.formValidation.allowedCount', [ownBarcodeObj.allowedBarcodesCount]));//NO I18N
			returnVal = false;
		}
		else
		{
			jQuery("#generateBarodesForAssets").prop('disabled', true);//NO I18N
			jQuery("#generateBarodesForAssets").html(getMessageForKey('sdp.admin.common.saving'));
			if(jQuery("#serviceTag").prop('checked') == true)
			{
				ownBarcodeObj.isServiceTag=true;
			}
			else
			{
				ownBarcodeObj.isServiceTag=false;
			}
			jQuery.ajax({
				url: '/BarcodeScanAction.do?method=createOwnBarcode&mode=generateBarcodes',//NO I18N
				type: "POST",//NO I18N
				data: '&data='+encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(ownBarcodeObj) : JSON.stringify(ownBarcodeObj) ),//NO I18N
				dataType: 'json',//NO I18N
				success: function( data )
				{
					if(data.isCountExceeded) {

						if(ownBarcodeObj.isSequence == "true") {
							showBaloonToolTip('count', getMessageForKey('ae.barcode.formValidation.allowedCount', [data.allowedBarcodesCount]));//NO I18N
						}
						else
						{
							showBaloonToolTip('barcodes', getMessageForKey('ae.barcode.formValidation.allowedCount', [data.allowedBarcodesCount]));//NO I18N
						}
				    	return false;
					}
					else {

					if(isMSPOrSCP){
						jQuery("#generateAndAddAsset").prop('disabled','false');//NO I18N
					}
					jQuery("#successCount").text(data.successCount);//NO I18N
					jQuery("#failureCount").text(data.failureCount);//NO I18N
					jQuery("#historyId").val(data.historyId);//NO I18
					jQuery('#successPrint').append(Number(data.successCount));//NO I18N
					if(ownBarcodeObj.isSequence == "false")
					{
						jQuery("#totalManualCount").text(data.successCount+data.failureCount);//NO I18N
						jQuery("#step1ManualInfo").show();
					}
					else
					{
						jQuery("#totalSeqCount").text(ownBarcodeObj.count);//NO I18N
						jQuery("#step1SeqInfo").show();//NO I18N
						jQuery("#startEndSequence").text(data.startingSeq+' - '+data.endingSeq);//NO I18N
					}
					if(data.successCount > 0 && data.failureCount > 0)
					{
						jQuery(".bc-sep").show();//NO I18N
						jQuery(".bc-sucess").show();//NO I18N
						jQuery(".bc-failure").show();//NO I18N
						jQuery("#step2SuccesCountInfo").removeAttr("style");//NO I18N
						jQuery("#step2FailureCountInfo").removeAttr("style");//NO I18N
					}
					else if(data.successCount > 0)
					{
						jQuery(".bc-sucess").show();//NO I18N
						jQuery("#step2SuccesCountInfo").removeAttr("style");//NO I18N
					}
					if(data.successCount <= 0)
					{
						jQuery("#continuePrintDiv").hide();//NO I18N
					}
					if(data.failureCount > 0)
					{
						jQuery("#step2FailureCountInfo").removeAttr("style");//NO I18N
						jQuery(".bc-failure").show();//NO I18N
						jQuery("#failedHeader").show();//NO I18N
						jQuery("#failedTableHeader").show();//NO I18N
						jQuery.each(data.failureBarcodes, function (i, barcodes)
						{
							jQuery("#failedTableBody").append('<tr><td width="30%"><div style="width:100px">'+encodeHTML(barcodes.barcode)+'</div></td><td><div>'+encodeHTML(barcodes.reason)+'</div></td></tr>');//NO I18N
						});
					}
					jQuery('#step2SuccesCount').append(Number(data.successCount));//NO I18N
					jQuery('#step2FailureCount').append(Number(data.failureCount));//NO I18N
					//closeProgressIndicator(null, null);//NO I18N
					setTimeout(function() { parent.closeDialog();}, 100);
					barcode.triggerNextstep('#collapseTwo', '#collapseOne');//NO I18N
					}
				},
				error: function(xhr)
				{
					parent.window.open('/jsp/Error.jsp', '_self');//No i18n
				}
			})
		}
		return false;
	},
	setPrintLater = function()
	{
		var historyId = jQuery("#historyId").val();//No I18N
		jQuery.ajax({
			url: '/BarcodeScanAction.do?method=createOwnBarcode&mode=setPrintLater&historyId='+historyId,//NO I18N
			type: "POST",//NO I18N
			dataType: 'text',//NO I18N
			success: function( data )
			{
				window.history.back();
			}
		});
	}
	loadLabelProperty = function(fromPrint)
	{
		jQuery.ajax({
			url: '/BarcodeScanAction.do?method=createLoadBarcode&mode=loadLabelProperty',//NO I18N
			type: "POST",//NO I18N
			dataType: 'json',//NO I18N
			success: function( data )
			{
				if(!jQuery.isEmptyObject(data))
				{
					constructAndEncodrSelectOptions("labelProperty",data,true);//NO I18N
					if(fromPrint)
					{
						constructAndEncodrSelectOptions("dialogLabelProperty",data,true);//NO I18N
						applySelect2ForProperty("dialogLabelProperty");//NO I18N
					}
				}
				applySelect2ForProperty("labelProperty");//NO I18N
			}
		});
	},
	editLabelProperty = function(propertyId)
	{
		jQuery('.ui-dialog-title').text(getMessageForKey('ae.barcode.label.updateTitle'));//NO I18N
		jQuery.ajax({
			url: '/BarcodeScanAction.do?method=createLabelProperty&mode=edit&propertyId='+propertyId,//NO I18N
			type: "POST",//NO I18N
			dataType: 'json',//NO I18N
			success: function( data )
			{
				if(!jQuery.isEmptyObject(data))
				{
					jQuery("#propertyName").val(data.propertyName);//NO I18N
					jQuery("#width").val(data.width);//NO I18N
					jQuery("#height").val(data.height);//NO I18N
					jQuery("#dpi").val(data.dpi);//NO I18N
					jQuery("#columns").val(data.labelsPerRow);//NO I18N
					jQuery("#description").val("");//NO I18N
					if(data.description != '-')
					{
						jQuery("#description").val(data.description);//NO I18N
					}
					jQuery("#gap").val("");//NO I18N
					if(data.gap != 0)
					{
					jQuery("#gap").val(data.gap);//NO I18N
					}
					jQuery("#labelSite").select2("destroy");//NO I18N
					if(data.labelSite != undefined)
					{
					jQuery("#labelSite").val(data.labelSite);//NO I18N
					}
					jQuery("#labelSite").select2();//NO I18N
					jQuery("#saveButton").hide();//NO I18N
					jQuery("#updateButton").show();//NO I18N
					jQuery("#propertyId").val(propertyId);//NO I18N
					barcode.presetDialog('labelpreset-dialog');//NO I18N
				}
			},
			error: function(xhr)
			{
				parent.window.open('/jsp/Error.jsp', '_self');//No i18n
			}
		});
	},
	deleteLabelProperty = function(propertyId)
	{
		if(window.confirm(getMessageForKey('ae.barcode.label.delete.confirm')))
		{
		jQuery.ajax({
			url: '/BarcodeScanAction.do?method=createLabelProperty&mode=delete&propertyId='+propertyId,//NO I18N
			type: "POST",//NO I18N
			dataType: 'text',//NO I18N
			success: function( data )
			{
				jQuery("#labelProperty").select2('destroy');//NO I18N
				jQuery("#dialogLabelProperty").select2('destroy');//NO I18N
				jQuery("#labelProperty").val('-1');//NO I18N
				jQuery("#dialogLabelProperty").val('-1');//NO I18N
				jQuery("#labelProperty option[value='"+propertyId+"']").remove();//NO I18N
				jQuery("#dialogLabelProperty option[value='"+propertyId+"']").remove();//NO I18N
				//jQuery("#labelProperty").select2();//NO I18N
				//jQuery("#dialogLabelProperty").select2();//NO I18N
				applySelect2ForProperty("labelProperty");//NO I18N
				applySelect2ForProperty("dialogLabelProperty");//NO I18N
				jQuery("#preview").hide();
				jQuery("#dialogPreview").hide();

				alert(getMessageForKey('ae.barcode.label.delete.success'));
			}
		});
		}
	},
	preAddLabelProperty = function()
	{
		jQuery("#saveButton").show();
		jQuery("#updateButton").hide();
		jQuery("#propertyName").val("");//NO I18N
		jQuery("#width").val("");//NO I18N
		jQuery("#height").val("");//NO I18N
		jQuery("#dpi").val("150");//NO I18N
		jQuery("#columns").val("");//NO I18N
		jQuery("#gap").val("");//NO I18N
		jQuery("#description").val("");//NO I18N
		jQuery("#propertyId").val();//NO I18N
		jQuery('.ui-dialog-title').text(getMessageForKey('ae.barcode.label.addTitle'));//NO I18N
		barcode.presetDialog('labelpreset-dialog');//NO I18N
	},
	addLabelProperty = function()
	{
		var validate = function()
		{
			var labelPropertyObj = jQuery("#labelPropertyForm").formToJSON();
			if(labelPropertyObj.propertyName.trim() == "")
			{
				showBaloonToolTip('propertyName', getMessageForKey('ae.barcode.formValidation.enterPropertryName'));//NO I18N
				jQuery("#propertyName").val("");//NO I18N
				return false;
			}
			else if(labelPropertyObj.width == "" || !jQuery.isNumeric(labelPropertyObj.width) || labelPropertyObj.width <=0 )
			{
				showBaloonToolTip('width', getMessageForKey('ae.barcode.formValidation.validNumber'));//NO I18N
				return false;
			}
			else if(labelPropertyObj.height == "" || !jQuery.isNumeric(labelPropertyObj.height) || labelPropertyObj.height <=0)
			{
				showBaloonToolTip('height', getMessageForKey('ae.barcode.formValidation.validNumber'));//NO I18N
				return false;
			}
			else if(labelPropertyObj.dpi == "" || !(/^[0-9]+$/.test(labelPropertyObj.dpi)) || labelPropertyObj.dpi <=0)
			{
				showBaloonToolTip('dpi', getMessageForKey('ae.barcode.formValidation.validNumber'));//NO I18N
				return false;
			}
			else if(labelPropertyObj.columns == "" || !(/^[0-9]+$/.test(labelPropertyObj.columns)) || labelPropertyObj.columns <=0)
			{
				showBaloonToolTip('columns', getMessageForKey('ae.barcode.formValidation.validNumber'));//NO I18N
				return false;
			}
            else if(labelPropertyObj.columns > 100)
            {
                // #129932 AE - This check included to prevent DOS attack. So label property rows is limited to 100.
                showBaloonToolTip('columns', getMessageForKey('ae.barcode.formValidation.limitedNumber')); //NO I18N
                return false;
            }
			else if(labelPropertyObj.columns > 1 && (labelPropertyObj.gap == "" || !jQuery.isNumeric(labelPropertyObj.gap) || labelPropertyObj.gap <=0))
			{
				showBaloonToolTip('gap', getMessageForKey('ae.barcode.formValidation.validNumber'));//NO I18N
				return false;
			}
			else if(labelPropertyObj.columns <= 1 && labelPropertyObj.gap != "" )
			{
				showBaloonToolTip('gap', getMessageForKey('ae.barcode.formValidation.gap'));//NO I18N
				return false;
			}
			return true;
		},
		submitAjax = function(isUpdate)
		{
			var labelPropertyObj = jQuery("#labelPropertyForm").formToJSON();
			delete labelPropertyObj.sdpcsrfparam;
			if(validate())
			{
			var mode = "add";//NO I18N
			if(isUpdate)
			{
				mode = "update";//NO I18N
			}
			jQuery.ajax({
			url: '/BarcodeScanAction.do?method=createLabelProperty&mode='+mode,//NO I18N
			type: "POST",//NO I18N
			data: '&data='+encodeURIComponent( typeof sdpToJSON != 'undefined' ? sdpToJSON(labelPropertyObj) : JSON.stringify(labelPropertyObj)),//NO I18N
			dataType: 'json',//NO I18N
			success: function( data )
			{
				if(data.success)
				{
					jQuery("#labelProperty").select2('destroy');//NO I18N
					jQuery("#dialogLabelProperty").select2('destroy');//NO I18N
					constrauctSelectOptions("labelProperty",data.allProperties,false);//NO I18N
					constrauctSelectOptions("dialogLabelProperty",data.allProperties,false);//NO I18N
					jQuery('#labelProperty').val(data.addedId);//NO I18N
					jQuery('#dialogLabelProperty').val(data.addedId);//NO I18N
					applySelect2ForProperty("labelProperty");//NO I18N
					applySelect2ForProperty("dialogLabelProperty");//NO I18N
					jQuery('#labelPropertyForm')[0].reset();
					jQuery('#labelpreset-dialog').dialog('close');//NO I18N
					if(jQuery('#labelprint-dialog').css('display') == 'none' || jQuery('#labelprint-dialog').css('display') == undefined)
					{
						generateBarcodesToPrint(data.addedId,true,true);//NO I18N
					}
					else
					{
						generateBarcodesToPrint(data.addedId,true,true,true);//NO I18N
					}
				}
				else
				{
					showBaloonToolTip('propertyName', getMessageForKey('ae.barcode.formValidation.propertyDuplicate'));//NO I18N
					return false;
				}
			},
			error: function(xhr)
			{
				parent.window.open('/jsp/Error.jsp', '_self');//No i18n
			}
			});
			}
			return false;
		};
		return {
			submitAjax:submitAjax
		}
	},
	printOwnBarcodes = function()
	{
		if(generateBarcodesToPrint(jQuery('#labelProperty').val(),false,false))
		{
			barcode.triggerNextstep('#empty', '#collapseThree');//NO I18N
		}
	},
	printAssosiateBarcodes = function()
	{
		if(generateBarcodesToPrint(jQuery('#labelProperty').val(),false,false))
		{
			generateMappingDoc(jQuery('#historyId').val());//NO I18N
			barcode.triggerNextstep('#exast-step4', '#exast-step3');//NO I18N
		}
	},
	generateBarcodesToPrint = function(labelProperty,isPreview,isTest,isDialog)
	{
		if(labelProperty == "-1")
		{
			if(!isPreview)
			{
				if(isDialog)
				{
					showBaloonToolTip('dialogLabelProperty', getMessageForKey('ae.barcode.formValidation.chooseProperty'));//NO I18N
					jQuery("#dialogPreview").hide();
				}
				else
				{
					showBaloonToolTip('labelProperty', getMessageForKey('ae.barcode.formValidation.chooseProperty'));//NO I18N
					jQuery("#preview").hide();
				}
			}
			else
			{
				jQuery("#preview").hide();
				jQuery("#dialogPreview").hide();
			}
			return false;
		}
		else
		{
			var historyId = jQuery("#historyId").val();//No I18N
			var propObject = jQuery("#printForm").formToJSON();//No I18N
			if(isDialog)
			{
				propObject = jQuery("#dialogForm").formToJSON();//No I18N
			}
			delete propObject.sdpcsrfparam;
			propObject.historyId = historyId;
			propObject.isTest = isTest;
			propObject.count = jQuery("#count").val();//No I18N
				jQuery.ajax({
				url: '/BarcodeScanAction.do?method=createOwnBarcode&mode=printBarcodes',//NO I18N
				type: "POST",//NO I18N
				data:'&data='+encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(propObject) : JSON.stringify(propObject) ),//NO I18N
				dataType: 'json',//NO I18N
				success: function( data )
				{
					var content = '';
					var barcodes = data.barcodes;
					var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
					var isIE = navigator.userAgent.toLowerCase().indexOf('trident') > -1;
					var widthPixel = 93;
					if(isChrome)
					{
						widthPixel = 86;
					}
					if(isPreview)
					{
						content += '<div class="col-group"><div class="row-inner"><label class="left-col control-label">'+getMessageForKey("ae.barcode.genaeration.preview")+'</label><div class="right-col"><div style="width:700px; overflow:auto; white-space:nowrap; padding:10px 3px;">';//NO I18N
						for(i=0;i<data.labelsPerRow;i++)
						{
							var barcodeImagePath = 	'/barcodes/'+parseInt(data.loggedUser)+'/'+i+'.svg?'+jQuery.now();//NO I18N
							if(barcodes[i] == undefined)
							{
								barcodeImagePath = '/images/blankBarcode.svg';//NO I18N
							}
							content += '<div class="bcpreview" style="margin-right:'+parseFloat(data.gap)*96/25.4+'px;"><img src="'+barcodeImagePath+'" width="'+(parseFloat(data.width)*96)+'px" height="'+(parseFloat(data.height)*96)+'px"/></div>';//NO I18N
						}
						content += '</div></div></div></div>';//NO I18N
						if(isDialog)
						{
							jQuery("#dialogPreview").html(content);//NO I18N
							jQuery("#dialogPreview").show();//NO I18N
						}
						else
						{
							jQuery("#preview").html(content);//NO I18N
							jQuery("#preview").show();//NO I18N
						}
					}
					else
					{
						content += '<html><head><title>'+getMessageForKey("ae.barcode.printBarcodes")+'</title></head><body style="margin: 0px;"><table valign="middle">';//NO I18N
						var k =0;
        					for(var i=0; i<= (barcodes.length/data.labelsPerRow); i++)
						{
							content += '<tr>';
							for(var j=1; j<= data.labelsPerRow; j++)
							{
								if(barcodes[k])
								{
									if(j != 1)
									{
										content +='<td width="'+parseFloat(data.gap)*96/25.4+'px"></td>';//NO I18N
									}

									if(isChrome)
									{
										content +='<td align="center">'+'<img src="/barcodes/'+parseInt(data.loggedUser)+'/'+k+'.svg?'+jQuery.now()+'" width="'+((parseFloat(data.width)*widthPixel)-(86/25.4)-(86/25.4))+'px" height="'+((parseFloat(data.height)*widthPixel)-(86/25.4)-(86/25.4))+'px"/></td>';//NO I18N
									}
									else
									{
										content +='<td align="center">'+'<img src="/barcodes/'+parseInt(data.loggedUser)+'/'+k+'.svg?'+jQuery.now()+'" width="'+((parseFloat(data.width)*widthPixel)-(96/25.4)-(96/25.4))+'px" height="'+((parseFloat(data.height)*widthPixel)-(96/25.4)-(96/25.4))+'px"/></td>';//NO I18N
									}
									k++;
								}
							}
							content +='</tr>';//NO I18N
						}
						content +='</table></body></html>';//NO I18N
						var printWindow = window.open('', getMessageForKey("ae.barcode.printBarcodesPopup"), 'height=400,width=600');
						printWindow.document.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">');//NO I18N
        					printWindow.document.write(content);
						printWindow.document.close();
						//jQuery(printWindow.document.body).html(content);

						/* 81610 button doesn't show the barcodes print preview issue fix*/
						// if(!isChrome)
						// {
						// 	printWindow.location.reload();
						// }
						/* 81610 button doesn't show the barcodes print preview */
						printWindow.focus();
						setTimeout(function(){printWindow.print();}, 1000);
        					//printWindow.print();
						setTimeout(function(){printWindow.close();}, 5000);
					}
				}
			});
			return true;
		}
	},
	generateAndAssosiateToAsset = function()
	{
		var assoBarcodeObj = jQuery("#assoBarcodeForm").formToJSON();
		delete assoBarcodeObj.sdpcsrfparam;
		assoBarcodeObj.isVendorBarcode = "false";//NO I18N
		assoBarcodeObj.count = jQuery("#count").val();//NO I18N
		if(assoBarcodeObj.productType == "0")
		{
			showBaloonToolTip('productType', getMessageForKey("ae.barcode.formValidation.productType"));//NO I18N
			return false;
		}
		else if(assoBarcodeObj.isSequence == "true" && (assoBarcodeObj.from == "" || !(/^\d+$/.test(assoBarcodeObj.from))))
		{
			showBaloonToolTip('from', getMessageForKey("ae.barcode.formValidation.validNumber"));//NO I18N
			return false;
		}
		else if(assoBarcodeObj.isSequence == "true" && (assoBarcodeObj.count == "" || !(/^[0-9]+$/.test(assoBarcodeObj.count)) || assoBarcodeObj.count <= 0))
		{
			showBaloonToolTip('count', getMessageForKey("ae.barcode.formValidation.validCount"));//NO I18N
			return false;
		}
		else if(assoBarcodeObj.isSequence == "false" && assoBarcodeObj.mappingField == "-1")
		{
			showBaloonToolTip('mappingField', getMessageForKey("ae.barcode.formValidation.mapping"));//NO I18N
			return false;
		}
		else
		{
			jQuery("#generateBarodesForAssets").prop('disabled', true);//NO I18N
			jQuery.ajax({
				url: '/BarcodeScanAction.do?method=createExistingAssets&mode=generateBarcodes',//NO I18N
				type: "POST",//NO I18N
				data: '&data='+encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(assoBarcodeObj) : JSON.stringify(assoBarcodeObj) ),//NO I18N
				dataType: 'json',//NO I18N
				success: function( data )
				{
					if(!jQuery.isEmptyObject(data))
					{
						jQuery("#successCount").text(data.successCount);//NO I18N
						jQuery("#failureCount").text(data.failureCount);//NO I18N
						jQuery("#historyId").val(data.historyId);//NO I18N
						if(assoBarcodeObj.isSequence == "false")
						{
							jQuery("#totalCount").text(data.successCount+data.failureCount);//NO I18N
							jQuery("#step1MapInfo").show();//NO I18N
							jQuery("#mappedField").text(data.mappedFieldDisplay);//NO I18N
						}
						else
						{
							jQuery("#totalCount").text(data.successCount);//NO I18N
							jQuery("#step1SeqInfo").show();//NO I18N
							jQuery("#startEndSequence").text(data.startingSeq+' - '+data.endingSeq);//NO I18N
						}

						if(data.successCount > 0 && data.failureCount > 0)
						{
							jQuery(".bc-sep").show();//NO I18N
							jQuery(".bc-sucess").show();//NO I18N
							jQuery(".bc-failure").show();//NO I18N
							jQuery("#step2SuccesCountInfo").removeAttr("style");//NO I18N
							jQuery("#step2FailureCountInfo").removeAttr("style");//NO I18N
						}
						else if(data.successCount > 0)
						{
							jQuery(".bc-sucess").show();//NO I18N
							jQuery("#step2SuccesCountInfo").removeAttr("style");//NO I18N
						}
						if(data.successCount <= 0)
						{
							jQuery("#continuePrintDiv").hide();//NO I18N
						}
						if(data.failureCount > 0)
						{
							jQuery("#step2FailureCountInfo").removeAttr("style");//NO I18N
							jQuery(".bc-failure").show();//NO I18N
							jQuery("#failedHeader").show();
							jQuery("#failedTableHeader").show();
							jQuery.each(data.failureBarcodes, function (i, barcodes)
							{
								var failedCode = barcodes.barcode;
								var failedReason = barcodes.reason;
								if(failedCode == undefined)
								{
									failedCode = getMessageForKey("ae.barcode.existing.notAvail");
									failedReason = getMessageForKey("ae.barcode.existing.mappinField.noValues");
								}
							jQuery("#failedTableBody").append('<tr><td width="25%"><div>'+encodeHTML(barcodes.asset)+'</div></td><td width="25%"><div style="width:100px">'+encodeHTML(failedCode)+'</div></td><td><div>'+encodeHTML(failedReason)+'</div></td></tr>');//NO I18N
							});
						}
						jQuery('#step2SuccesCount').append(Number(data.successCount));//NO I18N
						jQuery('#step2FailureCount').append(Number(data.failureCount));//NO I18N
						jQuery('#successPrint').append(Number(data.successCount));//NO I18N
						barcode.triggerNextstep('#exast-step2', '#exast-step1');//NO I18N
					}
					else
					{
						if(assoBarcodeObj.isSequence == "false")
						{
							alert(getMessageForKey("ae.barcode.formValidation.mapping.noValue"));
						}
						else
						{
							alert(getMessageForKey("ae.barcode.formValidation.mapping.noAssets"));
						}
						jQuery("#generateBarodesForAssets").prop('disabled', false); //NO I18N
						return false;
					}
				},
				error: function(xhr)
				{
					parent.window.open('/jsp/Error.jsp', '_self');//No i18n
				}
			})
		}
		return false;
	},
	generateMappingDoc = function(historyId)
	{
		jQuery.ajax({
				url: '/BarcodeScanAction.do?method=createExistingAssets&mode=generateMappingDoc&historyId='+historyId,//NO I18N
				type: "POST",//NO I18N
				dataType: 'text',//NO I18N
				success: function( data )
				{
					jQuery("#mappingDoc").prop("href", "/barcodes/"+data+"/mappingFile/AssetBarcodeMapping.html?"+jQuery.now());//NO I18N
					jQuery("#mappingDocButton").prop("href", "/barcodes/"+data+"/mappingFile/AssetBarcodeMapping.html?"+jQuery.now());//NO I18N
				}
			});
	},
	swapPrintTab = function(isManual,isSequential,isPrintLater)
	{
		jQuery("#print-manual").hide();//NO I18N
		jQuery("#print-range").hide();//NO I18N
		jQuery("#print-notprinted").hide();//NO I18N
		jQuery("#isManual").val(false);//NO I18N
		jQuery("#isSequential").val(false);//NO I18N
		jQuery("#isPrintLater").val(false);//NO I18N
		jQuery("#labelPropertyDiv").show();//NO I18N
		jQuery("#labelProperty").select2("destroy");//NO I18N
		jQuery("#labelProperty").val("-1");//NO I18N
		//jQuery("#labelProperty").select2();//NO I18N
		applySelect2ForProperty("labelProperty");//NO I18N
		jQuery("#dialogLabelProperty").select2("destroy");//NO I18N
		jQuery("#dialogLabelProperty").val("-1");//NO I18N
		applySelect2ForProperty("dialogLabelProperty");//NO I18N
		jQuery("#preview").hide();//NO I18N
		jQuery("#historyId").val("");//NO I18N
		if(isSequential)
		{
			jQuery("#print-range").show();//NO I18N
			jQuery("#isSequential").val(true);//NO I18N
			jQuery('#labelprint-dialog').hide();//NO I18N
		}
		else if(isPrintLater)
		{
			jQuery("#print-notprinted").show();//NO I18N
			jQuery("#isPrintLater").val(true);//NO I18N
			jQuery("#labelPropertyDiv").hide();//NO I18N
		}
		else
		{
			jQuery("#print-manual").show();//NO I18N
			jQuery("#isManual").val(true);//NO I18N
			jQuery('#labelprint-dialog').hide();//NO I18N
		}
	},
	printSection = function()
	{
		var validate = function(printSectionObj)
		{
			var returnVal = true;
			if(printSectionObj.isManual == "true" && printSectionObj.manualCodes.trim() == "")
			{
				showBaloonToolTip('manualCodes', getMessageForKey("ae.barcode.formValidation.enterBarcodes"));//NO I18N
				jQuery("#manualCodes").val("");//NO I18N
				returnVal = false;
			}
			else if(printSectionObj.isSequential == "true" && (printSectionObj.from == "" || !(/^\d+$/.test(printSectionObj.from))))
			{
				showBaloonToolTip('from', getMessageForKey("ae.barcode.formValidation.validNumber"));//NO I18N
				returnVal = false;
			}
			else if(printSectionObj.isSequential == "true" && (printSectionObj.count == "" || !(/^[0-9]+$/.test(printSectionObj.count)) || printSectionObj.count <= 0))
			{
				showBaloonToolTip('count', getMessageForKey("ae.barcode.formValidation.validCount"));//NO I18N
				returnVal = false;
			}
			else if(printSectionObj.isSequential == "true" && Number(printSectionObj.allowedBarcodesCount) < Number(printSectionObj.count))
			{
				showBaloonToolTip('count', getMessageForKey('ae.barcode.formValidation.allowedCount', [printSectionObj.allowedBarcodesCount]));//NO I18N
				returnVal = false;
			}
			else if(printSectionObj.isManual == "true" && Number(printSectionObj.allowedBarcodesCount) < printSectionObj.manualCodes.split(',').length)
			{
				showBaloonToolTip('manualCodes', getMessageForKey('ae.barcode.formValidation.allowedCount', [printSectionObj.allowedBarcodesCount]));//NO I18N
				returnVal = false;
			}
			else if(printSectionObj.labelProperty == "-1")
			{
				jQuery("#preview").hide();//NO I18N
				showBaloonToolTip('labelProperty', getMessageForKey("ae.barcode.formValidation.chooseProperty"));//NO I18N
				returnVal = false;
			}
			if(!returnVal)
			{
				jQuery("#labelProperty").select2("destroy");//NO I18N
				jQuery("#labelProperty").val("-1");//NO I18N
				//jQuery("#labelProperty").select2();//NO I18N
				applySelect2ForProperty("labelProperty");//NO I18N
				jQuery("#dialogLabelProperty").select2("destroy");//NO I18N
				jQuery("#dialogLabelProperty").val("-1");//NO I18N
				applySelect2ForProperty("dialogLabelProperty");//NO I18N
			}

			return returnVal;
		},
		validateAndPrint = function(isPreview,isTest)
		{
			var printSectionObj = jQuery("#printForm").formToJSON();
			if(validate(printSectionObj))
			{
				printSectionObj.historyId="";//NO I18N
				generateBarcodesToPrint(printSectionObj.labelProperty,isPreview,isTest);
			}
			return false;
		};
		return {
			validate : validate,
			validateAndPrint:validateAndPrint
		}
	},
	loadBarcodeHistory = function(isPrintLater,site,searchText, startIndex)
	{
		if(searchText != "-1" && searchText.trim() == "")
		{
			searchText="-1";//NO I18N
		}
		if(site == "")
		{
			site=0;//NO I18N
		}
		zcomponent.collapsible_destroy('#bchiszcp'); //NO I18N
		var text = '{"isPrintLater":'+isPrintLater+',"site":'+site+',"searchText":'+searchText+',"startIndex":'+startIndex+'}';//NO I18N
		jQuery.ajax({
				url: '/BarcodeScanAction.do?method=loadHistoryPrint&mode=loadHistory',//NO I18N
				type: "POST",//NO I18N
				data: '&data='+encodeURIComponent(text),//NO I18N
				dataType: 'json',//NO I18N
				success: function( data )
				{
					var content = '';
					var history = data.barcodeHistory;
					if(isPrintLater)
					{
						if(history.length > 0)
						{
							jQuery("#noData").hide();//NO I18N
							jQuery("#historyTable").show();//NO I18N
							for(i=0;i<history.length;i++)
							{
								var historyObj = history[i];
								content += '<tr id="'+parseInt(historyObj.historyId)+'"><td width="40"><div class="hidden-cell"><button class="btn-default print-btn" title="'+getMessageForKey("ae.barcode.ownBarcode.headerPrint")+'" nonce="'+sdpNonce+'" data-event="click" data-handler="setHistoryid('+parseInt(historyObj.historyId)+');barcode.printDialog()" id="setHistory" data-name="setHistory"><span class="icon-sm common-sprite common-print-icon1"></span></button></div></td><td><div>'+encodeHTML(historyObj.productType)+'</div></td><td><div>'+encodeHTML(historyObj.createdTime)+'</div></td><td><div>'+encodeHTML(historyObj.createdBy)+'</div></td><td><div>'+encodeHTML(historyObj.successcount)+'</div></td><td><div>'+encodeHTML(historyObj.details)+'</div></td></tr>';//NO I18N
							}
							content += '</div></div></div>';//NO I18N
							jQuery("#historyContent").html(content);//NO I18N
							parent.$sdEventListener('[data-name="setHistory"]');//NO I18N
						}
						else
						{
							jQuery("#historyTable").hide();//NO I18N
							jQuery("#noData").show();//NO I18N
						}
					}
					else
					{
						jQuery("#noData").hide();//NO I18N
						var monthYear = '';
						if(startIndex > 1)
						{
							content = jQuery("#content").val();//NO I18N
							monthYear = jQuery("#monthYear").val();//NO I18N
						}
						var count = 0;
						//var divIds = ["collapse0"]
						for(i=0;i<history.length;i++)
						{
							count++;
							var historyObj = history[i];
							if(monthYear != '' && monthYear != historyObj.createdMonth)
							{
								content += '</div></div></div>';//NO I18N
							}
							if(monthYear === '' || monthYear != historyObj.createdMonth)
							{
								content += '<div class="panel"><div class="panel-heading"><h4 class="panel-title m0">'+encodeHTML(historyObj.createdMonth)+'</h4></div><div id="collapse'+Number(i)+'"><div class="panel-body">';//NO I18N
								/*if(i != 0)
								{
									alert(divIds.length)
									divIds[divIds.length] = "collapse"+i;//NO I18N
								}*/
							}
            						content += '<div class="hist-row"><div class="hidden-cell"><button class="btn-default print-btn" title="'+getMessageForKey("ae.barcode.ownBarcode.headerPrint")+'" id="setHistory" data-event="click" nonce="'+sdpNonce+'" data-handler="setHistoryid('+Number(historyObj.historyId)+');barcode.printDialog()" data-name="setHistory"><span class="icon-sm common-sprite common-print-icon1"></span></button></div><div class="rowpos"><div class="hist-time">'+encodeHTML(historyObj.createdTime)+', '+encodeHTML(historyObj.createdHour)+'</div><div class="hist-entry"><ul><li><span class="common-sprite common-tick-icon2 icon-xs fl mt4"></span><div class="ml20">'+getMessageForKey("ae.contract.view.createdBy")+' <strong>'+encodeHTML(historyObj.createdBy)+'</strong><br><strong>'+Number(historyObj.successcount)+' </strong>'+historyObj.addOrAsso+' '+encodeHTML(historyObj.productType)+'</div></li><li><span class="common-sprite common-tick-icon2 icon-xs fl mt4"></span><div class="ml20">'+getMessageForKey("ae.barcode.history.generatedType")+' <strong>'+encodeHTML(historyObj.details)+'</strong></div></li><li><span class="common-sprite common-tick-icon2 icon-xs fl mt4"></span><div class="ml20">'+getMessageForKey("sdp.common.comments")+' <strong>'+encodeHTML(historyObj.comments).split("&#xd;&#xa;").join("<br>")+'</strong></div></li></ul></div></div></div>';//NO I18N
							monthYear = historyObj.createdMonth;
							jQuery("#monthYear").val(monthYear);//NO I18N
						}
						jQuery("#content").val(content);//NO I18N

						content += '</div></div></div>';//NO I18N
						if(count==20)
						{
							content +='<div data-event="click" nonce="'+sdpNonce+'" data-handler="Barcode().loadBarcodeHistory('+isPrintLater+','+site+','+searchText+','+(startIndex+20)+');" align="center" id="viewMoreDiv"><a href="/">View More...</a></div>';//NO I18N
						}
						jQuery(".panel-group").html(content);//NO I18N
						parent.$sdEventListener('[data-name="setHistory"]');//NO I18N
						parent.$sdEventListener('#viewMoreDiv');//NO I18N
						if(count == 20){
							$sdEventListener("#viewMoreDiv"); //NO I18N
						}
						/*for(i=1;i<divIds.length;i++)
						{
							alert(divIds[i]);
							jQuery("#"+divIds[i])[0].onclick();
						}*/
						if(count==0 && startIndex <= 1)
						{
							jQuery(".panel-group").html('<p align="center" id="noData">'+getMessageForKey("sdp.listview.nodataavailble")+'</p>');//NO I18N
						}

					}
					/* Below Lines added for Zoho Components */
					zcomponent.collapsible_init('#bchiszcp'); //NO I18N
					/* Above Lines added for Zoho Components */
				}
			});
	},
	updateHistoryAsPrinted = function(historyId)
	{
		jQuery.ajax({
				url: '/BarcodeScanAction.do?method=updateHistoryPrint&mode=updateHistory&data='+historyId,//NO I18N
				type: "POST",//NO I18N
				dataType: 'text',//NO I18N
				success: function( data )
				{
					return false;
				}
		})
	};
	return {
		addVendorBarcode    : addVendorBarcode,
		loadFormContents    : loadFormContents,
		productTypeChange   : productTypeChange,
		productChange       : productChange,
		assoProductTypeChange : assoProductTypeChange,
		setSequence         : setSequence,
		generateAndAddAsset : generateAndAddAsset,
		setPrintLater       : setPrintLater,
		loadLabelProperty   : loadLabelProperty,
		preAddLabelProperty : preAddLabelProperty,
		addLabelProperty    : addLabelProperty,
		editLabelProperty   : editLabelProperty,
		deleteLabelProperty : deleteLabelProperty,
		printOwnBarcodes    : printOwnBarcodes,
		printAssosiateBarcodes : printAssosiateBarcodes,
		generateBarcodesToPrint: generateBarcodesToPrint,
		generateAndAssosiateToAsset : generateAndAssosiateToAsset,
		generateMappingDoc : generateMappingDoc,
		swapPrintTab       : swapPrintTab,
		printSection       : printSection,
		loadBarcodeHistory : loadBarcodeHistory,
		updateHistoryAsPrinted : updateHistoryAsPrinted
	}
}

function constrauctSelectOptionsForMappingField(elementId,data,isAppend)
{
	if(!isAppend)
	{
		jQuery("#"+elementId).find('option:not(:first)').remove();//NO I18N
	}
	jQuery.each(data, function(id, text)
	{
		if( elementId ==  "labelProperty" )
		{
			jQuery("#"+elementId).append(new Option(encodeHTML(text), id));//NO I18N
		}
		else
		{
			if( elementId != 'labelSite' && elementId != 'siteList' && elementId != 'productType' && elementId != 'productList' && elementId != 'mappingField')
			{
				jQuery("#"+elementId).append(new Option(encodeHTML(text), id));//NO I18N
			}
			else
			{
				jQuery("#"+elementId).append(new Option(text, id));//NO I18N
			}
		}
	});
	jQuery("#"+elementId).sortSelectBox();
}

function constructAndEncodrSelectOptions(elementId,data,isAppend)
{
	if(!isAppend)
	{
		jQuery("#"+elementId).find('option:not(:first)').remove();//NO I18N
	}
	jQuery.each(data, function(id, text)
	{
		jQuery("#"+elementId).append(new Option(encodeHTML(text), id));//NO I18N
	});
	jQuery("#"+elementId).sortSelectBox();
}

function constrauctSelectOptions(elementId,data,isAppend)
{
	if(!isAppend)
	{
		jQuery("#"+elementId).find('option:not(:first)').remove();//NO I18N
	}
	jQuery.each(data, function(id, text)
	{
		if( elementId ==  "labelProperty" )
		{
			jQuery("#"+elementId).append(new Option(encodeHTML(text), id));//NO I18N
		}
		else
		{
			if( elementId != 'labelSite' && elementId != 'siteList' && elementId != 'productType' && elementId != 'productList')
			{
				jQuery("#"+elementId).append(new Option(encodeHTML(text), id));//NO I18N
			}
			else
			{
				jQuery("#"+elementId).append(new Option(text, id));//NO I18N
			}
		}
	});
	jQuery("#"+elementId).sortSelectBox();
}
function applySelect2ForProperty(elementId)
{
	var select2 = jQuery("#"+elementId).select2({
    		formatResult: format,
    		escapeMarkup: function(m) { return m; }
	}).data('select2');//NO I18N

	if(select2 != undefined){
	select2.onSelect = (function(fn) {
    		return function(data, options) {
        		var target;

        		if (options != null) {
            			target = jQuery(options.target);
        		}

        		if (target && target.hasClass('common-edit-icon2')) {
				Barcode().editLabelProperty(target.attr("data-value"));
        		}
			if (target && target.hasClass('common-trash-icon2')) {
				Barcode().deleteLabelProperty(target.attr("data-value"));
        		}
			else
			{
            			return fn.apply(this, arguments);
        		}
    		}
	})(select2.onSelect);
	}
}
function format(options)
{
	if(options.id != "-1" && jQuery("#isPropertyEditable").val() == "true")
	{
		return options.text = "<span class='fr'><i title='"+getMessageForKey("ae.barcode.label.editTitle")+"' class='common-sprite icon-sm common-edit-icon2 mr10' data-value='"+options.id+"' ></i><i title='"+getMessageForKey("ae.barcode.label.deleteTitle")+"' class='common-sprite icon-sm common-trash-icon2' data-value='"+options.id+"' ></i></span><span>"+ options.text + "</span>"
	}
	else
	{
		return options.text = options.text;
	}
}
