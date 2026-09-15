/*
* The below code was recommended by vijayan from mickey team. During the column chooser call, State Object will not send with the URL. 
* The below code will send the state object along with URLs for all column chooser request. And the code is taken from Mickey Source.
*/
function displayColumnChooser(menuItemId, srcViewRefId, additionalParams,index) {
        var menuItemObj = getMenuItemObj(menuItemId);
        var url = CONTEXT_PATH + "/" + getURLSuffixed(menuItemObj.ACTIONLINK) + additionalParams;
        //TODO: Case where template viewparams is not passed to view , when
        //columnchooser link is clicked. Not sure if this is the right fix,
        //need to check it
        
        //to close all the other columnchooser windows
        var div=document.getElementById("ChooserListTypeInline_CT");
        if(div!="undefined" && div!=null)
        {
        	closeDialog(null,div);
        }
        var reqParams = null;
        if(srcViewRefId != null)
        {
            reqParams = stateData[srcViewRefId]._D_RP;
        }
  		if(reqParams != null)
  		{
  			url = url + "&" + reqParams;
  		} 
  		url =	updateStateCookieAndAppendSid(url);       
	showURLInDialog(url, menuItemObj.WINPARAMS);
}
