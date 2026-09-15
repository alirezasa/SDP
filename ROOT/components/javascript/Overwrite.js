//No impact override functions
//Under AjaxAPI.js
AjaxAPI.addResponseToElement = function(response,requestOptions){
document.getElementById(requestOptions.v('CONTAINERID')).innerHTML = response.getOnlyHtml();
var effectstr = requestOptions.EFFECT;
if(effectstr == null)
{
effectstr = 'Effect.Grow';//No i18n
}
if(response.getScripts()!=null && response.getScripts()!="undefined"){
	response.getScripts().push('<script nonce='+sdpNonce+'>' + effectstr + '(\'' + requestOptions.v('CONTAINERID') + '\')</script>');
}
return StatusMsgAPI.OPSTATUS.FINISHED;
}
//Under AjaxAPI.js
AjaxUtils.scheduleScript = function(script,scriptFile){
var scriptTag = document.createElement("SCRIPT");
scriptTag.nonce=sdpNonce;
if ((scriptFile != null) && (scriptFile != ""))
{ scriptTag.src = scriptFile;}
scriptTag.text = script;
if (!document.getElementsByTagName("HEAD")[0]) {
document.createElement("HEAD").appendChild(scriptTag)
} else {
if(window.uniqueId != null)
{
scriptTag.id = "script_"+window.uniqueId;	
removeScriptsFromHead(window.uniqueId);
}
document.getElementsByTagName("HEAD")[0].appendChild(scriptTag);
}
}

//Under ViewUtils.js
function refreshSuccess(){
	var pretime=reqOpt.PRETIME;
res.responseText+="<script nonce="+sdpNonce+">sRefresh('"+pretime+"')</script>";
}

//Under ViewUtils.js
function processURLBasedOnLevel(url,id,refreshLevel,selId,callbackInSynch,hideStatusOnSuccess,param){
globalURL=url;
var viewUniqueId = getUniqueId(id);
var callback =function(response,requestOptions)
{
response.responseText+="<script nonce="+sdpNonce+">  hideTabLoadingStatus();</script>";
}
var callbackSynch =function(response,requestOptions){}		
if(refreshLevel == -1)
{    
openURL(url);
}
else if(refreshLevel == -3 ||refreshLevel == -4)
{    
var viewDiv = document.getElementById(viewUniqueId + "_CT");
var dca = viewDiv.getAttribute("associateddca");
var target="_mcframe_"+dca; // No i18n
url=(url.indexOf("?")!=-1)?url+="&&AjaxTab=true":url+="?AjaxTab=true";
url+="&&"+param;
if(refreshLevel == -4) 
{
url+="&&BackSupport=true";// No i18n
}
if(callbackInSynch==true && hideStatusOnSuccess)
{	
AjaxAPI.sendRequest({METHOD:"GET",URL:url,ASYNCHRONOUS:false,ONSUCCESSFUNC:callback,TARGET:target,MCFRAMEACTION:'replace'});// No i18n
}
else if(callbackInSynch==true)
{	
AjaxAPI.sendRequest({METHOD:"GET",URL:url,ASYNCHRONOUS:false,ONSUCCESSFUNC:callbackSynch,TARGET:target,MCFRAMEACTION:'replace'});// No i18n
}
else
{
showTabLoadingStatus();
AjaxAPI.sendRequest({METHOD:"GET",URL:url,ASYNCHRONOUS:true,ONSUCCESSFUNC:callback,TARGET:target,MCFRAMEACTION:'replace'});// No i18n
}
}
else if(refreshLevel == 0)
{
handleSubRequest(url,viewUniqueId);
}
else if(refreshLevel == -2)
{
var viewDiv = document.getElementById(viewUniqueId + "_CT");
var dca = viewDiv.getAttribute("associateddca");
var parView = getParentViewForDCA(dca);
handleSubRequest(url,parView);
}
else
{
var viewToRefresh = viewUniqueId;
for(var i = 0; i < refreshLevel; i++)
{
viewToRefresh = getUniqueId(stateData[viewToRefresh]._PV);
if(viewToRefresh == null)
{
break;
}
}
if((viewToRefresh == ROOT_VIEW_ID) || (viewToRefresh == null))
{
openURL(url);
}
else
{
handleSubRequest(url,viewToRefresh);
}
}
}

//Under listColumnChooser.js

function createAndShowCCTable(doc){
var ccTable = "";
if (this._isInline){
ccTable = ccTable.concat("<Table cellspacing='0' cellpadding='2' width='100%'>");
}
else{
ccTable = ccTable.concat("<Table cellspacing='0' class='ccListTable'><tr><td class='ccListHeader' colspan='2'>Columns</td></tr>");
}
var count = _viewObjects.length;
for(var i=0; i<count;i++){
var obj = _viewObjects[i];
var isVisible = obj[2];
var cssName = "ccNotSelected";// No i18n
if(currentId != null && currentId == obj[0]){
cssName = "ccSelected";// No i18n
}
ccTable = ccTable.concat("<TR><td class='"+cssName+"' width='20'><input type='checkbox' nonce='"+sdpNonce+"' data-event='click' data-handler='selectColumn(this, true)' column='" + obj[0] + "' name='" + obj[0] + "' id='" + obj[0] + "_INP' value='" + obj[1] + "' index='" + i + "'");// No i18n
if(isVisible == 'true'){
ccTable = ccTable.concat(" checked");// No i18n
}
ccTable = ccTable.concat("/></td><td nonce='"+sdpNonce+"' data-event='click' data-handler='selectColumn(this)' class='" + cssName + "' column='" + obj[0] + "' id='"+obj[0]+"_COL' index='"+i+"'>" + obj[1] + "</td></tr>");
}
ccTable = ccTable.concat("</table>");
if(doc == null){
document.getElementById('ccTable').innerHTML = ccTable;
}
else {
doc.getElementById('ccTable').innerHTML = ccTable;
}
$sdEventListener("#ccTable");// No i18n
}
