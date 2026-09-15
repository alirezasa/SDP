 jQuery(document).ready(function() {

	 loadAdminCustomTag();
 });

function loadAdminCustomTag()
{						 
		hoveTemplate('unsel_temp','mArw');//NO I18N	

		hoveTemplate('SelectedTemplates2','extclose'); //NO I18N

		/*Incoming Email Hover Script Begin*/
		jQuery('#unsel_temp').find('li.mTLi').off('click').on('click',function(){moveTemplates(this);});//NO I18N

}

function hoveTemplate(id,cls)
{ 					 
	jQuery('#'+id+' ul li').on('mouseenter',
			function () {  
				jQuery(this).css("background-color","#f8f8f8").find("span."+cls).removeClass('hide').addClass('show');  //NO I18N
			}).on('mouseleave', 
			function () {
				jQuery(this).css("background-color","transparent").find("span."+cls).removeClass('show').addClass('hide');//NO I18N
			}
			);
}

function deleteTemplates(that){
	var th = jQuery(that), liobj = th.parent('li'); isLi_Head = liobj.hasClass('tmpthdr'),ul_id = th.parents('ul').eq(0).attr('id'),f_li = th.parents('ul').eq(0).find('li:first'), unsel_divId =liobj.attr('data-divID');//NO I18N
	var selObj = jQuery('#SelectedTemplates'), unselObj = jQuery('#unsel_temp #'+unsel_divId+' .extmptftr');
	ul_id = 'chooseTechList';//NO I18N

	if( jQuery('#defaultPopulated').val() == 'true' )
	{
		isSuccess = disablePRNotificationForTech(liobj, that);

		if( !isSuccess )
		{
			return false;
		}
	}
	if(isLi_Head){
		jQuery('#selectedTechList').find('li').each(function()
		{
			if( parseInt(this.value) > 0 )
			{
				jQuery(this).remove();
				jQuery('#'+ul_id).append(this);
			}
		});
	}else{
		unselObj.find('#'+ul_id).append(liobj.clone().wrap('<div>').parent().html());
		liobj.remove();
	}
        unselObj.find('.extclose').parent().css('background-color','transparent');//NO I18N
	unselObj.find('.extclose').removeClass('extclose show').addClass('mArw hide').html("&nbsp;");//NO I18N
	hoveTemplate('unsel_temp','mArw');//NO I18N
	jQuery('#unsel_temp').find('li.mTLi').off('click').on('click',function(e){ moveTemplates(this); }); //NO I18N
	var f_id = 'InTemplate';//NO I18N
	if(unsel_divId === 'showSerTemplate'){ 
		f_id ='STemplate';//NO I18N
	}	
	
	var ScrolPos = 	unselObj.find('#'+ul_id).find('li:last').offset();

	if( ScrolPos != undefined )
	{
		jQuery(".extmptftr").scrollTop(ScrolPos.top);
	}
	
	FilterTemplate(jQuery('#'+f_id));
        jQuery('.overTooltip').remove();
}

function moveTemplates(that){
	var th = jQuery(that), liobj = th; isLi_Head = liobj.hasClass('tmpthdr'),ul_id = th.parents('ul').eq(0).attr('id'),f_li = th.parents('ul').eq(0).find('li:first');//NO I18N
	var selObj = jQuery('#SelectedTemplates'), unselObj = jQuery('#unsel_temp');
	ul_id = 'selectedTechList';//NO I18N
	if( jQuery('#defaultPopulated').val() == 'true' )
	{
		isSuccess = enablePRNotificationForTech(jQuery(that), that);

		if( !isSuccess )
		{
			return false;
		}
	}
	if(isLi_Head){
		unselObj.find('#chooseTechList').find('li').each(function()
		{
			if( parseInt(this.value) > 0 )
			{
				jQuery(this).remove();
				selObj.find('#'+ul_id).append(this);
			}
		});
	}else{
		selObj.find('#'+ul_id).append(liobj.clone().wrap('<div>').parent().html());
		liobj.remove();
	}
        jQuery('.overTooltip').remove();
        selObj.find('.mArw').parent().css('background-color','transparent').end().removeClass('mArw show').addClass('extclose hide').html("<img src='/images/spacer.gif' width='11px' height='11px' align='absmiddle' title='Remove' />");
       
	var ScrolPos = 	selObj.find('#'+ul_id).find('li:last').position(); 

	if( ScrolPos != undefined )
	{
    		jQuery(".SltScrTem").scrollTop(ScrolPos.top);
	}
	hoveTemplate('SelectedTemplates','extclose');//NO I18N
	jQuery('#SelectedTemplates').find('span.extclose').off('click').on('click',function(e){ deleteTemplates(this); });//NO I18N	
}
		 
	jQuery("#seltemacn").on('click', function(){
	  jQuery("#FTemDiv").toggle();
  	});

	// Stop closing div on filter div
	jQuery("#SHTemplate").on('click', function(event){event.stopPropagation()}); 

 //});

function FilterTemplate(a){ 
    if(jQuery(a).attr("id")=="STemplate"){ 
	 	jQuery("#STemplate").removeClass("selHdrBrn").addClass("selHdrBr");
		jQuery("#InTemplate").removeClass("selHdrBr").addClass("selHdrBrn");
        jQuery("#showSerTemplate").show(); jQuery("#showInTemplate").hide()
       
	   jQuery("#srFiTxt").attr('onKeyUp','filterpredef(this,\'\showSerTemplate\'\)');
    }
    if(jQuery(a).attr("id")=="InTemplate"){ 
	 jQuery("#InTemplate").removeClass("selHdrBrn").addClass("selHdrBr");
	  jQuery("#STemplate").removeClass("selHdrBr").addClass("selHdrBrn");
       
	   jQuery("#showSerTemplate").hide(); jQuery("#showInTemplate").show()
	  jQuery("#srFiTxt").attr('onKeyUp','filterpredef(this,\'\showInTemplate\'\)'); 
    }  
}

					
function shSrcIcon(shdiv,fs)
{
	jQuery('#'+shdiv).slideToggle('fast');
	jQuery('#'+fs).trigger('focus');
}
  
  
// Search Filter 
function filterpredef(ele,tmName) {  
	var predefval = jQuery(ele).val();
	jQuery('#'+tmName).find("#searchNoresult").addClass("hide").hide();
	if (predefval) {  
  		jQuery('#'+tmName).find("li:not(:Contains(" + predefval + "))").hide();
    		jQuery('#'+tmName).find("li:first,li:Contains(" + predefval + ")").show();
		if ( ! jQuery('#'+tmName).find("li:not(:first)").is(':visible') )
		{
			jQuery('#'+tmName).find("li:first").hide();
			jQuery('#'+tmName).find("#searchNoresult").removeClass('hide').show();
		}
  	} else {
		jQuery(ele).on('keyup',function(evt){ 	//NO I18N 
			if ( evt.which == 13 )
			{
				jQuery( ele ).parent().slideToggle('fast');//NO I18N
			}
		});
  		jQuery('#'+tmName).find("li").show();
  	}
} 

// clear the filter search
function clearpredef( eleName , inpsearch ){
	jQuery( document.getElementById( inpsearch ) ).val("").trigger("onkeyup");
	jQuery( document.getElementById( eleName ) ).slideToggle('fast');//NO I18N
}