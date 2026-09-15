
function loadOutgoingMailConfigureMsg()
{
  top.window.opener.location.assign('/EMailDef.do?mailType=outgoing&mode=view');//No I18N
  window.close();
}
function downloadDefaultSupportFile()
{
	checkForCookie = setInterval(function(){
        var cookieName = "isLogFileDownloaded=" //No I18N
        var cookies = document.cookie.split(';');
        for(var i=0; i<cookies.length; i++) 
        {
            var cookie = cookies[i];
            while (cookie.charAt(0)==' ')
            {
                cookie = cookie.substring(1)
            } 
            if (cookie.indexOf(cookieName) != -1)
            {
                clearInterval(checkForCookie)
                closeDialog();
				Store.removeCookie("isLogFileDownloaded"); //No I18N
                jQuery("#loadingDIV").css("display","none");//No I18N
                document.getElementById("sbtn").disabled = false;
                document.getElementById("sbtn").className = "btn btn-primary";
                break;
            } 
          }      
    },3000); //No I18N
    jQuery("#loadingmsg").html(getMessageForKey("sdp.support.supportfile.creating"));
    jQuery("#loadingDIV").css("display","block");//No I18N
    document.getElementById("supportCreationFrame").src="/SupportFile.do"
    document.getElementById("sbtn").disabled = true;
    document.getElementById("sbtn").className = "btn";
}
function showUploadOption()
{
	if(jQuery("#customizedFile").is(':checked'))
	{
		jQuery("#attachmentDiv").show();
		document.getElementById("displayAttachments").style.display = "block"
	}
	
	//document.getElementById("attachfileButton").click();
}
function greyOutThisLabel()
{
	if(!jQuery("#supportFile").is(":checked"))
	{
		jQuery("#defaultFile").css({'display': 'block', opacity: 0.7})//No I18N
	}
	else
	{
		jQuery("#defaultFile").css({'display': 'block', opacity: ''})//No I18N
	}
}

function checkMandatory()
{
	var fromAddress = document.getElementById("fromEmailSearch").value;
	var toAddress = document.getElementById("toEmailSearch").value;
	var subject = document.getElementById("subject").value;
	if(fromAddress== "" || subject=="" || toAddress=="" )
	{
		alert(getMessageForKey("sdp.support.reportissue.mandatoryalert"));//No I18N
	}
	else
	{
		checkFromAddress();
	}
}
function checkFromAddress()
{
	var fromAddress = document.getElementById("fromEmailSearch");
	var validto = validateEMailIDs(fromAddress);
	if(validto)
	{
		checkToAddress()
	}
	
}
function checkToAddress()
{
	var toAddress = document.getElementById("toEmailSearch");
	var validto = validateEMailIDs(toAddress);
	if(validto)
	{
	    /*var isAssetBuild = <%=ServiceDeskUtil.getInstance().isAssetBuild()%>;
	    if(!isAssetBuild && !checkEmailIdsForValidityInSDP(document.getElementById("toEmailSearch"))){
            return false;
        }*/
		checkCcAddress()
	}
	
}
function checkCcAddress()
{
	var ccAddress = document.getElementById("ccEmailSearch");
	
	
	if(ccAddress.value != "")
	{
		var validto = validateEMailIDs(ccAddress);
		if(validto)
		{
		    /*var isAssetBuild = <%=ServiceDeskUtil.getInstance().isAssetBuild()%>;
		    if(!isAssetBuild && !checkEmailIdsForValidityInSDP(document.getElementById("ccEmailSearch"))){
				return false;
            }*/
			sendMail();
		}
	}
	else
	{
		sendMail();
	}
}

function sendMail()
{
	document.getElementById("sbtn").disabled = true;
	document.getElementById("sbtn").className = "btn";
	String.prototype.replaceAll=function(s1, s2) {return this.split(s1).join(s2)}
	var fromAddress = document.getElementById("fromEmailSearch").value;
	var toAddress = document.getElementById("toEmailSearch").value;
	var subject = encodeURIComponent(document.getElementById("subject").value); 
	var ccAddress = document.getElementById("ccEmailSearch").value;//No I18N
	var description = getHTMLDescription();//No I18N
	if(description.indexOf("<br />")==-1)
	{
		description = description.replaceAll(/\n/g, "<br />")
	}
	description = encodeURIComponent(description);
	attachments = getAttachments();
	parameters = "submitAction=sendmail&fromAddress="+fromAddress+"&toAddress="+toAddress+"&ccAddress="+ccAddress+"&subject="+subject+"&description="+description+"&fileName="+attachments;//No I18N
	jQuery("#loadingmsg").html(getMessageForKey("sdp.support.reportissue.sending"))
	if(jQuery("#supportFile").is(':checked'))
	{
		parameters = "submitAction=sendmail&fromAddress="+fromAddress+"&toAddress="+toAddress+"&ccAddress="+ccAddress+"&subject="+subject+"&description="+description+"&fileName="+attachments+"&defaultFile=true";//No I18N	
		jQuery("#loadingmsg").html(getMessageForKey("sdp.support.supportfile.creating"))
	}
	jQuery("#loadingDIV").css("display","block");//No I18N	
	jQuery.ajax({url:"supportRequest.do",type:"POST",datatype:"xml",data:parameters,success:callbackFn})//No I18N
	
}
function callbackFn(response)
{	
	title = jQuery(response).find('result').text()
	if(title == "Sent Successfully")
	{
		jQuery("#replyMsg").html(getMessageForKey("sdp.support.reportissue.successMsg")+"&nbsp&nbsp<img class='exit1' border='0' valign='absmiddle' data-event='click' data-handler='closeReplyMsgDialog();' nonce="+sdpNonce+" src='/images/info-closebtn.gif'>");//No I18N
		jQuery("#message").css("display","block");//No I18N
		jQuery("#loadingDIV").css("display","none");//No I18N
		setTimeout(function(){ window.close(); }, 2000);
		
	}
	else
	{
		jQuery("#replyMsg").html(getMessageForKey("sdp.support.reportissue.failureMsg")+"&nbsp&nbsp<img class='exit1' border='0' valign='absmiddle' data-event='click' data-handler='closeReplyMsgDialog();' nonce="+sdpNonce+" src='/images/info-closebtn.gif'>");//No I18N
		jQuery("#message").css("display","block");//No I18N
		jQuery("#loadingDIV").css("display","none");//No I18N	
		document.getElementById("sbtn").disabled = false;
		document.getElementById("sbtn").className = "btn btn-primary";
	}
	$sdEventListener("#replyMsg");//No I18N
}
function getAttachments()
{
	var attachedFiles = "";
	jQuery(window.attachComponent.selector.find(attachComponent.options.target+'.preAttach')).each(function(){
		var currentDiv=jQuery(this);
		attachedFiles+=currentDiv[0].getAttribute("data-attach-name")+",";
	});
	return attachedFiles;
	
}
function showSupportFileContents()
{
    var visible = document.getElementById("supportFileContentDiv").style.visibility
    if(visible == "hidden")
    {
        document.getElementById("supportFileContentDiv").style.visibility = "visible"
        document.getElementById("supportFileContentDiv").style.display = "";
    }else
    {
        document.getElementById("supportFileContentDiv").style.visibility = "hidden"
        document.getElementById("supportFileContentDiv").style.display = "none";
    }
}
function closeReplyMsgDialog()
{
	jQuery("#message").css("display","none");//No I18N
}

function initializeAttachmentComponent()
{
	var attach_options = {
		"servlet_url": "api/v3/files/upload?for=REPORTANISSUE", // No I18N
		"multiple":false,// No I18N
		"drop_element" : jQuery("#attachjs"),// No I18N
		"layouts":  true,// No I18N
		"upload":  true,// No I18N
		"download":false,// No I18N
		"skipPreview":true,// No I18N
		"is_new_form": true,// No I18N
		"max_file_size":20,// No I18N
		"csrf":true,// No I18N
		ondelete: function(context,attachmentFile,attachment){
        			attachmentFile.parents(".btn-group:first").fadeOut("fast", function() {	//No I18N
        				jQuery(this).remove();
        			});
        		}
	};

	window.attachComponent = new attachPreview('#attachComponent',attach_options);// No I18N
}