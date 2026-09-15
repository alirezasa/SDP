/* $Id$ */
//overriding framework APIs for SDP Team to load views in iframe. 

/**
  * Creates an object newView and assign request parameters, parent view
  * parent content area. And sets this object to statedata mapped through
  * uniqueid of the view
  */

TableDOMModel = parent.TableDOMModel;

function createView(win,uniqueId,viewName,requestParams,parentView,parentDCA,refId,viewGenTime)
{
	parent.createView(win,uniqueId,viewName,requestParams,parentView,parentDCA,refId,viewGenTime);
}


/**
 * Given the referenceId returns the view state object from the 
 * statedata array
 */
function getViewState(refId)
{
  return parent.getViewState(refId);
}


/**
 * Initializes the main view by creating a stateData and a referenceIds object.
 * The stateData contains state for each subview and the referenceIds contains
 * each views referenceId. The values for a view can be retrieved at any point
 * of time by using the getUniqueId(id) and the getReferenceId(id) methods.
 */
function initializeMainView(win,rootViewId,context,themedir, restful, sasmode)
{
	parent.initializeMainView(win,rootViewId,context,themedir, restful, sasmode);
}

/**
 * Creates a new MenuItem object for the given menuitem and adds it to the
 * manager.
 */
function createMenuItem(menuItemName, properties,jsoptions){
 
	parent.createMenuItem(menuItemName, properties,jsoptions);
 }


function updateTimeToLoad(timeToLoad,win)
{
	parent.updateTimeToLoad(timeToLoad,win);
}


/*
 * Used by the framework to execute the onload scripts.
 * 
 */

function execOnLoadScripts(win)
{
	parent.execOnLoadScripts(win);
}

function showOptions(columnName,searchValue)
{
	parent.showOptions(columnName,searchValue);
}


function adjustOption(columnName)
{
	parent.adjustOption(columnName);
}

function remListViewNumericCheck(str,list){
	parent.remListViewNumericCheck(str,list);
}


