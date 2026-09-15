//$Id$

//Ifrme height has been resize based on dc page height
function resizeIframe(dynheight)
{
    document.getElementById("dcFrame").height=dynheight;
}  
function hideIframe()
{
	//document.getElementById("dcframetb").style.display = "none";
	var tableEL = document.getElementsByName("dcframetb");
for(var x=0;x<tableEL.length;x++){
    tableEL[x].style.display="none";
}	
    //document.getElementById("dcFrame").height="0 px";
	
}      



/*
 * This method invoke for dc chat 
 */
function invokeDCChat(event , reqName , requesterID , requestID )
{
    var url = "/DCHomePage.do?operation=dcchat&requesterName="+ encodeURIComponent(reqName) +"&requestID="+ encodeURIComponent(requestID) +"&requesterID="+requesterID;//No i18n
     
    var newwindow = window.open( url ,'Desktopcentral_Chat','height=400,width=500');
    if (window.focus) {
        newwindow.focus()
        }
		
}

var DcToolsEssential ={
    dcAction :'',
    dcWsName :'',
    fromSDPpage : '',
    loadDcAssetAction: function(actionName, wsName){
        this.dcAction = actionName;
        this.dcWsName = wsName;
        this.fromSDPpage = 'true';
        jQuery.getScript("/scripts/dc_tools_action.js?"+buildNumber);// NO I18N
    }
}