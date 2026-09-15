//$Id$
var mdmpIframe = (function () {

    var iframeLoadHandler = function () {
    	if(!isMSPOrSCP){
    		jQuery('#mdmFrame').ready(function () {
                showHideContent(true);
            });
            jQuery('#mdmFrame').load(function () {
                showHideContent(false);
            });
    	}
        
        setTimeout(function(){
            showHideContent(true);
        }, 1000);
    };
    
    var showHideContent = function(isShow){
        var showMDMPContent = function(){
            jQuery('#loadingContent').hide();
            jQuery('#mdmFrameContent').show();
        }
        //Function added by msp
        var hideMDMPContent = function(){
            jQuery('#mdmFrameContent').hide();
            jQuery('#loadingContent').show();
        }
        if(isShow){
            if(jQuery('#isMSP')){
                handleMDMPMSP(showMDMPContent, hideMDMPContent);
            }
        else{
                showMDMPContent();
            }
        }
        else{
            hideMDMPContent();
        }
    };
    // Function defined by MSP
    var handleMDMPMSP = function(showiFrame, hideIframe){
        var mdmpAccountBased = jQuery('#mdmpAccountBased').val();
        var mdmpIsAllCustomer = jQuery('#mdmpIsAllCustomer').val();

        if(mdmpIsAllCustomer == true || mdmpIsAllCustomer == "true"){
            jQuery("#__persistentAccountId__select").select2("val", 0).attr('disabled','disabled').removeClass('accountFormStyle').addClass('accountStyleDisabled');    	//No i18n
        }
        else{
            if(document.HeaderForm.persistentAccountId.options[0].value == "0"){
                document.HeaderForm.persistentAccountId.remove(0);
            }
            jQuery("#__persistentAccountId__select").removeAttr('disabled').addClass('accountFormStyle').removeClass('accountStyleDisabled');	//No i18n
            var selectedAccount = jQuery("#__persistentAccountId__select").select2('data').text;    // No I18N

//            "/cmInfo.do?actionToCall=setCustomerFilter&customerId="+val

            var mdmFrameUrl = jQuery('#mdmFrameUrl').val();
            var setIframeUrl = function(accountName, showiFrame, hideIframe){
                hideIframe();
                if(accountName){
                    var urlSplit = mdmFrameUrl.split("?");
                    var newMDMFrameUrl = urlSplit[0] + "?customerName=" + encodeURIComponent(accountName) + "&" + urlSplit[1]
                    jQuery('#mdmFrame').attr('src', newMDMFrameUrl);
                    setTimeout(function(){
                        jQuery('#mdmFrame').attr('src', jQuery('#mdmFrame').attr('src'));
                        setTimeout(function(){showiFrame()}, 1000);
                    }, 2000);
                    jQuery('#customerError').addClass('mdm_hide');
                }
                else{
                    var isDCMDMPSame = jQuery('#isDCMDMPSame').val();
                    var customerErrorMsg = jQuery('#customerErrorMsg');
                    if(isDCMDMPSame == true || isDCMDMPSame == "true"){
                        customerErrorMsg.html(translate("sdp.dc.accountcombo.account_not_available_in_dc"));
                    }
                    else{
                        customerErrorMsg.html(translate("mdm.me_integ_account_not_avail"));
                    }
            jQuery('#loadingContent').hide();
                    jQuery('#customerError').removeClass('mdm_hide');
                }
            }
            setIframeUrl(selectedAccount, showiFrame, hideIframe);

            jQuery("#__persistentAccountId__select").on('select2-selecting', function (e) {
                var selectedAccountObj = e.choice;
                var accountName = selectedAccountObj.text;
                setIframeUrl(accountName, showiFrame, hideIframe);
            });
        }
    };

    return {
        init: iframeLoadHandler
    };

})();

jQuery(document).ready(function () {
    mdmpIframe.init();
});
