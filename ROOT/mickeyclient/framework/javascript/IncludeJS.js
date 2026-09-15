//$Id$
function includeMainScripts(contextPath)
{
	// Contextpath has start with "/" always.
	if(contextPath.indexOf("/") < 0)
	{
		contextPath = "/";
	}

	var scriptsToInclude = "";
	if(parent["MC_JS_INCLUDED"] != null)
	{
		return;
	}
        var buildNumber="9400";
	scriptsToInclude += getScriptInc(contextPath + "framework/javascript/framework.js?"+buildNumber); // No I18N
	scriptsToInclude += getScriptInc(contextPath + "components/javascript/components.js?"+buildNumber); // No I18N
	parent.document.writeln(scriptsToInclude);
	parent["MC_JS_INCLUDED"] = true;   // No I18N
}

function getScriptInc(scriptFilePath)
{
   return "<script src='" + scriptFilePath + "' type='text/javascript'></script>"; // No I18N
}

function includeJS(scriptFilePath,win)
{
   var index = scriptFilePath.lastIndexOf('/'); // No I18N
   var fileName = scriptFilePath;
   if(index > -1)
   { 
     fileName = scriptFilePath.substring(index + 1);
   }
   if(parent[fileName] != null)
   {
     return;
   }
   if(parent == win)
   { //This check is done as otherwise the script loading is done in a separate thread in IE.
      parent.document.writeln(getScriptInc(scriptFilePath));
   }
   else
   {// This check is done as otherwise the ui becomes blank when trying to update the document from iframe.
      var doc = parent.document;
      includeScriptInDoc(doc,scriptFilePath);
   }
   parent[fileName] = true;
}

function includeScriptInDoc(doc,scriptFilePath)
{
   var e = doc.createElement("script"); // No I18N
   e.src = scriptFilePath;
   e.type="text/javascript"; // No I18N
   doc.getElementsByTagName("head")[0].appendChild(e);  
}
