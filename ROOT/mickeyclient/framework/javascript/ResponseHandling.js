//$Id$


/**
 *@param {AjaxResponse}
 *@type DOMElement
 */
function getRootViewEl(response)
{
  var holderDiv = document.createElement("div");
  //showDialog(response.responseText,"");
  holderDiv.innerHTML = response.getOnlyHtml();

  var rootView = DOMUtils.getFirstMatchingElement(holderDiv.getElementsByTagName("div"),null,"unique_id","*");  //No I18N
  return rootView;
}

/**
  * This method gets the roo div element from the response
  * and replaces the view in the client with the view from
  * reponse. Invokes the scripts in response and sets the
  * status as finished
  */
function updateViewInResp(response,reqOptions)
{
var viewToRefreshDiv = getRootViewEl(response);
if((parent.ROOT_VIEW_ID === "RequestsView" ) && typeof parent.updateRequestTable === "function") {
  parent.updateRequestTable(viewToRefreshDiv);
}
else {
  updateViewFromReq(viewToRefreshDiv);
}
    response.invokeScripts();
    updateParentCookie();
    return StatusMsgAPI.OPSTATUS.FINISHED;
}


/**
 * This method replaces the existing view element with
 * the view element passed as arugument
 */
function updateViewFromReq(viewToRefreshEl)
{
  var toReplaceViewId = viewToRefreshEl.getAttribute("unique_id");
  var currentEl = document.getElementById(toReplaceViewId + "_CT");
  if(!currentEl)
  {
    throw new Error("The corresponding html content for " + toReplaceViewId + " not present in parent window.");  //No I18N
  }
  currentEl.parentNode.replaceChild(viewToRefreshEl,currentEl);
}

/**
 * Sets state cookie after end of ajax request response
 */
function updateParentCookie()
{
  var urlStr = window.location.href;
  var index = urlStr.indexOf("STATE_ID");
  if(index < 0)
  {
     return;
  }
  var newIndex = urlStr.indexOf("/","STATE_ID".length + index + 1);
  var path = CONTEXT_PATH + "/" + urlStr.substring(index,newIndex);
  var curDate = new Date();
  if(RESTFUL == true)
  {
	  updateStateCookie("/",curDate.getTime(),null);
  }
  else
  {
  	updateStateCookie(path,curDate.getTime(),null);
  }
  //alert("Here");
}


/*
 *  This method can be used to do execute the script after all
 *  operations are done.Quite similar to the body onload function.
 *
 */
function addToOnLoadScripts(script,win)
{
	win.postInvokeScripts.push([script,arguments]);
}

/*
 * Used by the framework to execute the onload scripts.
 *
 */

function execOnLoadScripts(win)
{
  //$$ Fix
  docAlreadyLoaded = true;
  AjaxAPI.showPersMsg(0);
  for(var i = 0; i < win.postInvokeScripts.length; i++)
  {
    try
    {
    	executeFunctionAsString(win.postInvokeScripts[i][0],win,win.postInvokeScripts[i][1]);
    }
    catch(e)
    {
      if(showError)
      {
         StatusMsgAPI.showMsg("Exception occurred when executing post invoke script " + win.postInvokeScripts[i] + " .Msg : " + e.message,false);  //No I18N
      }
    }
  }
}
