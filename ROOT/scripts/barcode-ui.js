// JavaScript Document


var barcode = {
	init : function(){
		//jQuery('.panel-heading ').bind('click', {}, barcode.accordion);//NO I18N
		//jQuery('.bc-mainscreen li').bind('mousemove', {}, barcode.intro);//NO I18N
		//jQuery('.arrow-tab li').bind('click', {arg:'true'}, barcode.arrowtabselection);//NO I18N
		//barcode.arrowtabselection();
		loadUI('','barcodeoptions', 1);//NO I18N
		//jQuery('#productType, #siteList, #ProductList, #barcodeprev, #mappingfield').select2();//NO I18N
		//jQuery('#vendor-bc').bind('keypress', {}, barcode.scanedVendorbarcode);//NO I18N
		jQuery('#bc-generation').on('click',{'id':'barcodeoptions', 'fnref': 1}, loadUI);//NO I18N
		jQuery('#bc-printoptions').on('click', function(){loadUI('', 'printoptions', 3);});//NO I18N
		jQuery('#bc-history').on('click', function(){loadUI('', 'bc-history-content', 0)});//NO I18N
		jQuery('#bc-asset-tracking').on('click', function(){loadUI('', 'assettracking', 0)});//NO I18N
		
	},
	removedefaultSelection : function(){
		jQuery(this).find('li:eq(0) div').attr('style', '');//NO I18N
		//jQuery('#intro-0').attr('style', '');//NO I18N
	},
	
	intro : function(){
		jQuery(this).parent().find('div').attr('style', '');//NO I18N
		jQuery(this).find('div.m-arrow, div.l-arrow, div.r-arrow').show();//NO I18N
		jQuery(this).parent().find('li:eq(0) div:first').attr('class','vendor-bc');//NO I18N
		jQuery(this).parent().find('li:eq(1) div:first').attr('class','own-bc');//NO I18N
		jQuery(this).parent().find('li:eq(2) div:first').attr('class','gen-bc');//NO I18N
		var idx = jQuery(this).index();
		var clsname = jQuery(this).find('div:eq(0)').attr('class');//NO I18N
		jQuery(this).find('div:eq(0)').attr('class', clsname+'-act');//NO I18N
		var allele = jQuery('.bcinfo-c > div').hide();//NO I18N
		jQuery('#intro-'+idx).show();//NO I18N
	},
	
	
	accordion : function(){
		var currentele = jQuery(this).closest('z-collapsiblepanel');//NO I18N
		var isCompleted = currentele.hasClass('completed');//NO I18N
		var isNotallowed = currentele.hasClass('normal');//NO I18N
		var isOpen = currentele.hasClass('active');//NO I18N
		if(isCompleted || isNotallowed || isOpen){ return false;}
		var isvisible = currentele.find('z-cpcontent.zcollapsiblepanel__content').is(':visible');//NO I18N
		var parentele = jQuery('z-collapsiblepanels');//NO I18N
		parentele.find('z-collapsiblepanel.active').removeClass('active');//NO I18N
		parentele.find('z-collapsiblepanel').addClass('normal');//NO I18N
		if(isvisible){
			currentele.removeClass('active').addClass('normal');//NO I18N
			return;
			}
		currentele.addClass('active').removeClass('normal');//NO I18N
	},
	
	arrowtabselection : function(event){
		var w = jQuery('.activetab').outerWidth();//NO I18N
		var lp = w/2 -10;
		if(event){
			var liobj = jQuery(this)
			var ulobj = liobj.parent();
			jQuery(ulobj).find('li').removeClass('activetab');//NO I18N
			liobj.addClass('activetab');//NO I18N
			liobj.append((jQuery('.active-arrow')));//NO I18N
			w = liobj.outerWidth();
			lp = w/2 -10;
			jQuery('.active-arrow').css({'left': lp});//NO I18N
			var commontab = liobj.attr('other');//NO I18N
			if(commontab){
				jQuery('#innertabcontainer > div').hide();//NO I18N
				var showcls = liobj.attr('elecls');//NO I18N
				jQuery(showcls).show();

			}
			else{
				var showcls = liobj.attr('elecls');//NO I18N
				var hidecls = liobj.attr('hidecls');//NO I18N
				jQuery('.'+hidecls).hide();//NO I18N
				jQuery('.'+showcls).show();//NO I18N
			}
			
		}
		else{
			jQuery('.active-arrow').css({'left': lp});//NO I18N
		}
	},
	triggerNextstep : function(showid, hideid){
		jQuery('*[rel=uitooltip-print]').uitooltip({
		content: function(){
			var element = jQuery( this );
				return element.attr('title')
			},
		tooltipClass: 'uitip',//NO I18N
		position: {
			my: 'left center',//NO I18N
			at: 'right+10 center'//NO I18N
		},
		show: {
			effect: 'none',//NO I18N
			delay: 10
		},hide: {
			effect: 'none',//NO I18N
			delay: 10
		}
	});
		var ParentID = jQuery(showid).parent().attr('id'),
		domPID = document.getElementById(ParentID);
		if(domPID){
			domPID.expandPanel(showid);
		}
		jQuery(showid).removeClass('normal').addClass('active');//NO I18N
		jQuery(hideid).removeClass('active').addClass('completed');//NO I18N
		if(domPID){
			domPID.collapsePanel(hideid);
		}

	},
	presetDialog: function(el){
			showModal(el,800,300,'auto',false);//NO I18N
	},
	printDialog: function(){
			showModal("labelprint-dialog",800,150,500,false);//NO I18N
	},
	avoidStepsDialog: function(el){
		//showModal(el,700,150,400,false);
		var myIcon = '<span class="info-icon-hdr fl"></span>';//NO I18N
		jQuery('#'+el).dialog({
			width:750,
			resizable: false,
			modal: true,
			open: function () {
            jQuery(this)
                .parent()
                .children(".ui-dialog-titlebar")//NO I18N
								.find('.info-icon-hdr').remove();//NO I18N
						jQuery(this)
                .parent()
                .children(".ui-dialog-titlebar")//NO I18N
                .prepend(myIcon);
        },
			/*open: function(){
							jQuery(this).find('.btn-primary').bind('click',function(){
									jQuery('#'+id).dialog().dialog('close');
							});
			},*/
			create: function() {
					jQuery(this).find('.scroller')//NO I18N
					.css({
						"maxHeight":600,//NO I18N
						"minHeight":150,//NO I18N
						"overflow":'auto'//NO I18N
						})
						.niceScroll(niceScrollString); 
			}
		});
		jQuery(".info-icon").children(".ui-dialog-titlebar").append("<span class='ui-icon ui-icon-help'></span>");//NO I18N
	},
	removeAttachment: function()
	{
		jQuery('.attachment').find('.common-close-icon4').on('click',function(){//NO I18N
			jQuery(this).closest('.file').fadeOut('slow',function(){//NO I18N
				jQuery(this).remove();
				if(jQuery('#scanedvendorbc').find('.file').length==0)//NO I18N
					{
					jQuery('#barcode-textarea').slideUp();//NO I18N
					}
			});
		});
	},
	scanedVendorbarcode : function(event){
		var txtobj = jQuery(this);
		if(txtobj.val().trim()!='')//NO I18N
		{
			if (event.keyCode === 13) 
    			{
    				var currentlength = jQuery('.scannedBarcodeClass').length;
    				var allowedBarcodesCount = jQuery('#allowedBarcodesCount').val();
    				if(Number(allowedBarcodesCount) <= Number(currentlength))
    				{
    					showBaloonToolTip('vendor-bc', getMessageForKey('ae.barcode.formValidation.allowedCount', [allowedBarcodesCount]));//NO I18N
    					return false;
    				}
			       var isDuplicate = false;	
   				jQuery('.scannedBarcodeClass').each(function() 
				{
					if(txtobj.val().trim() == jQuery(this).text())
					{
						showBaloonToolTip('vendor-bc', getMessageForKey('ae.barcode.vendor.duplicate')); //NO I18N
						jQuery('#vendor-bc').val("");//NO I18N
						isDuplicate = true;
						return false;
					}
   				}); 
				if(!isDuplicate)
				{	
					var barcodeTxt = txtobj.val().replace(/<([^ ])/g, '< $1');
					barcodeTxt = encodeHTML(barcodeTxt.trim());
        				var newentry = '<div class="file">'+//NO I18N
                              		'<span class="common-sprite icon-sm common-close-icon4"></span>'+//NO I18N
                              		'<a href="/" class="scannedBarcodeClass">'+barcodeTxt+'</a>'+//NO I18N
                          		'</div>';//NO I18N
					jQuery('#scanedvendorbc').prepend(newentry).closest('#barcode-textarea').slideDown();//NO I18N
					txtobj.val('').trigger('focus');//NO I18N
					barcode.removeAttachment();
				}	
    			}
		}
		/*else
		{
			
		}*/
	}
}
	
/*barcode.init();


function loadUI(event, idval, refno){
	var data, dataid, ref;
	if(event.data){
		data = event.data;
		dataid = data.id;
		ref = data.fnref;
	}
	else{
		dataid = idval;
		ref = refno;
		}
	var path = 'barcode_html_source.html #'+dataid;//NO I18N
	jQuery( "#bc-container" ).load(path, function(){;//NO I18N
		if(ref === 1){	
			jQuery('.bc-mainscreen li').bind('mouseenter', {}, barcode.intro);//NO I18N
			//jQuery('.bc-mainscreen').bind('mouseover', {}, barcode.removedefaultSelection);//NO I18N
			jQuery('.vendor-bc-act').bind('click', {'id': 'vendorsbarcode', 'fnref' : 2}, loadUI);//NO I18N
			jQuery('.own-bc').bind('click', {'id': 'ownbarcode' , 'fnref' : 2}, loadUI);//NO I18N
			jQuery('.gen-bc').bind('click', {'id': 'existingassets' , 'fnref' : 2}, loadUI);//NO I18N
			}
		if(ref === 2){
			jQuery('.panel-heading ').bind('click', {}, barcode.accordion);//NO I18N
			jQuery('.arrow-tab li').bind('click', {arg:'true'}, barcode.arrowtabselection);//NO I18N
			jQuery('#productType, #siteList, #ProductList, #barcodeprev, #mappingfield').select2();//NO I18N
			jQuery('#vendor-bc').bind('keypress', {}, barcode.scanedVendorbarcode);//NO I18N
			}
		if(ref === 3){
			jQuery('.arrow-tab li').bind('click', {arg:'true'}, barcode.arrowtabselection);//NO I18N
			jQuery('#allsites1, #allsites2').select2();//NO I18N
		}
	});
}*/
