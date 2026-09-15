// $Id$
function showBrowseByTopicsLayer(layerName, shadowLayerName){
	if (document.getElementById){ // Netscape 6 and IE 5+
		var targetElement = document.getElementById(layerName);
		var shadowElement = document.getElementById(shadowLayerName);
		targetElement.style.visibility = 'visible'; // No I18N
	}
}

function hideBrowseByTopicsLayer(layerName){
	if (document.getElementById){
		var targetElement = document.getElementById(layerName);
		targetElement.style.visibility = 'hidden'; // No I18N
	}
}

function showAllSolutionTopics(){
	document.getElementById('CategoryList').style.display='none'; // No I18N
	document.getElementById('AllCategory').style.display='block'; // No I18N
}

function CategoryAll(){
	document.getElementById('CategoryList').style.display='block'; // No I18N
	document.getElementById('AllCategory').style.display='none'; // No I18N
}

function checkSolutionSearchText(thisForm)
{
	//alert(thisForm.searchText.value);
	if(isEmpty(thisForm.searchText.value) || thisForm.searchText.value === getMessageForKey('sdp.solutions.search') ||thisForm.searchText.value === getMessageForKey('sdp.home.searchsolution'))
	{
		alert(getMessageForKey('sdp.solution.searchsolution.emptysearchtext'));
		thisForm.searchText.focus();
		return false;
	}

	/* csrf is not appended by default for this form element in some cases. (Reason unknown)
	* so we are manually appening the csrf element here.
	*/
	var csrfElement = document.createElement("input");
    csrfElement.setAttribute("type","hidden");
    csrfElement.setAttribute("name", getCSRFParamName());
    csrfElement.setAttribute("value", getCSRFParamValue());
    thisForm.appendChild(csrfElement);

	if("stateData" in window){
 	  	var viewId = 'SolutionsListView';//NO I18N
 	  	var srchTerm = thisForm.searchText.value;

 	  	viewId = getPortalViewName(viewId);
        if(loggedInUserID === null){
            viewId = 'SDSolutionsListView';//NO I18N
        }

        updateState(viewId,'SearchString',srchTerm.trim());

	if( PORTALID != undefined  )
	{
		updateState(viewId,"_D_RP", "PORTALID=" + PORTALID);//No I18N
		updateState(viewId,"_PN", null);//No I18N
	}
        refreshSubView(viewId);
     	return false;
	}
    else{
			thisForm.submit();
     }
}
function updateSolutionsListView(selVal,displayName)
{
	document.getElementById("SolutionStatusFilter").innerHTML = displayName;
	jQuery('#SolutionStatusActions').attr('title',displayName).uitooltip({content:displayName});
	updateState(getPortalViewName("SolutionsListView"), "viewName", selVal);  // No I18N
        refreshSubView(getPortalViewName("SolutionsListView")); // No I18N
}

function expandContract(element,img)
	{
	if(document.getElementById(element).style.display==='none')
		{
			$(element).show();
			document.getElementById(img).src="../images/hideuparrow1.png";
		}
	else
		{
			$(element).hide();
			document.getElementById(img).src="../images/showdownarrow1.png";
		}
}

function calExpandContractAllTopics(topicTreeViewobj)
{
	var JSONobj=topicTreeViewobj.personalizedTopics;
	if(loggedInUserID !== null && JSONobj.personalizedTopics!==null)
 	{
 			expandContractAllTopics(undefined,JSONobj.personalizedTopics);
 	}
	if(loggedInUserID === null)
	{
			expandContractAllTopics(undefined,"ExpandAll");// No I18N
	}
	document.getElementById('personalizedTopics').value=JSONobj.personalizedTopics;
}

function expandContractAllTopics(img,action)
{
	/*Old one display text now change to svg icon for leftnav topic Expand and Collapse*/
	if(action === undefined)
	{
		var action = 'ExpandAll'; // No I18N
		if($(img).getAttribute('status') === 'ExpandAll')
		{
			action = 'contractAll'; // No I18N
			//document.getElementById(img).innerHTML='['+getMessageForKey("ae.cmdb.leftnavigation.expand")+']';
			jQuery('#'+img).attr({'class':'cspr icon-sm expand-arrow1 cur-ptr mr5'}).uitooltip({content:getMessageForKey("ae.cmdb.leftnavigation.expand")});// No I18N
		}
		else
		{
			//document.getElementById(img).innerHTML='['+ getMessageForKey("ae.cmdb.leftnavigation.collapse")+']';
			jQuery('#'+img).attr({'class':'cspr icon-sm collapse-arrow1 cur-ptr mr5'}).uitooltip({content:getMessageForKey("ae.cmdb.leftnavigation.collapse")});// No I18N
		}
	}
	else
	{
		if(action !== "ExpandAll")
		{
			//document.getElementById('ManageTopicsImg1').innerHTML='['+getMessageForKey("ae.cmdb.leftnavigation.expand")+']';
			jQuery('#ManageTopicsImg1').attr({'class':'cspr icon-sm expand-arrow1 cur-ptr mr5','title':getMessageForKey("ae.cmdb.leftnavigation.expand")}).uitooltip({content:getMessageForKey("ae.cmdb.leftnavigation.expand")});// No I18N
		}
		else
		{
			//document.getElementById('ManageTopicsImg1').innerHTML='['+getMessageForKey("ae.cmdb.leftnavigation.collapse")+']';
			jQuery('#ManageTopicsImg1').attr({'class':'cspr icon-sm collapse-arrow1 cur-ptr mr5','title':getMessageForKey("ae.cmdb.leftnavigation.collapse")}).uitooltip({content:getMessageForKey("ae.cmdb.leftnavigation.collapse")});// No I18N
		}
	}
	var allTopics=document.getElementById('topicsTreeViewDiv').childNodes;
	for(var i=1;i<allTopics.length;i++)
	{
		expandContractTopic(allTopics[i],action);
	}
	$('ManageTopicsImg1').setAttribute('status',action);
	if(loggedInUserID !== null)
	{
		var newUrl = '/servlet/SolutionsServletUtil';// No I18N
		var params = 'command=setSelectedTopics&selectedTopicsIDs='+action;// No I18N
		var myAjax = new Ajax.Request(newUrl, {
			method: 'post',// No I18N
			parameters: params
		});
	}
}

function expandContractTopic(element,action)
{
	var subAction = 'contract'; // No I18N
	if(action === 'ExpandAll')
	{
		subAction = 'expand'; // No I18N
	}
	if(element.getAttribute('status') !== null)
	{
		var topicID = $(element).getAttribute('topicid');
		var img = "TopicImg_"+topicID; // No I18N
		topicExpandContract(element,topicID,img,subAction)

		var subTopics=element.childNodes;
		for(var j=0;j<subTopics.length;j++)
		{
			var ctn1=subTopics[j];
			if(ctn1.tagName==='DIV')
			{
				expandContractTopic(ctn1,action);
			}
		}
	}
}

function topicExpandContract(element,topicID,img,action)
{
	var childElements=$(element).childNodes;
	if(action ==='expand')
	{
		for(var i=0;i<childElements.length;i++)
		{
			if($(childElements[i]).tagName==='DIV')
			{
				$(childElements[i]).show();
			}
		}
	if(document.getElementById(img).className === 'lastnode-clsp' || document.getElementById(img).className === 'lastnode-expnd')
	{
		document.getElementById(img).className="lastnode-expnd";// No I18N
	}
	else
	{
		document.getElementById(img).className="darrow";// No I18N
	}
	$(element).setAttribute('status','expand');// No I18N
	}
	else
	{
		for(var i=0;i<childElements.length;i++)
		{
			if($(childElements[i]).tagName==='DIV' && $(childElements[i]).className !== 'mtopic')
			{
				$(childElements[i]).hide();
			}
		}
		if(document.getElementById(img).className === 'lastnode-clsp' || document.getElementById(img).className === 'lastnode-expnd')
		{
			document.getElementById(img).className="lastnode-clsp";// No I18N
		}
		else
		{
			document.getElementById(img).className="rightarrow";// No I18N
		}

	$(element).setAttribute('status','contract');// No I18N
	}
}

function setTopicHierarchy(topicID,searchString,isBreadcrumb, portalId)
{
	if(topicID!==null)
	{
		var topicStr = null; //No i18n
		var categoryLinkTD = new Array();
		var allTopicLinkTD = "";
		var element='DIVTopicID_'+topicID;//NO I18N
		var i=0;

		if(loggedInUserID !== null)
		{
			topicStr = "showTopicDetails.do?action=view&"; //No i18n
		}
		else
		{
			topicStr = "showTopicDetails.sd?PORTALID=" + portalId + '&'; //No i18n
		}

		if(document.getElementById(element) === null)
		{
			topicID = 0;
			element='DIVTopicID_'+topicID;//NO I18N
		}
		i=topicID;
		jQuery("#topicsTreeViewDiv").scrollTop(jQuery("#DIVTopicID_"+topicID).position().top - 150);

		allTopicLinkTD = document.createElement("td");
		allTopicLinkTD.setAttribute("nowrap","nowrap");
		allTopicLinkTD.innerHTML = "<a id= 'breadcrumbTopicLink0' href="+topicStr+"id="+ 0 +" class=\"breadcrumb-link-ui2\">"+getMessageForKey("sdp.solution.listview.allsolutions")+"</a>";
		allTopicLinkTD.setAttribute('title', getMessageForKey("sdp.solution.listview.allsolutions"));
		$('TopicLinkOf_0').className = 'ActTopic';

	if( topicID !== 0)
	{
		do
		{
			var childElements=$(element).childNodes;
			if($(element).getAttribute('status')==='contract')
			{
				for(var j=0;j<childElements.length;j++)
				{
					if($(childElements[j]).tagName==='DIV')
					{
						$(childElements[j]).show();
					}
				}
				if(document.getElementById('TopicImg_'+$(element).getAttribute('topicid')).className === 'lastnode-clsp' || document.getElementById('TopicImg_'+$(element).getAttribute('topicid')).className === 'lastnode-expnd')
				{
					document.getElementById('TopicImg_'+$(element).getAttribute('topicid')).className="lastnode-expnd";// No I18N
				}
				else
				{
					document.getElementById('TopicImg_'+$(element).getAttribute('topicid')).className="darrow";// No I18N
				}
				$(element).setAttribute('status','expand');// No I18N
			}
			var linkElement='TopicLinkOf_'+$(element).getAttribute('topicid');//NO I18N
			$(linkElement).className = 'ActTopic';
			element=$(element).parentNode;
			var newTD = document.createElement("td");
			newTD.setAttribute("nowrap","nowrap");
			newTD.innerHTML = "> <a id= 'breadcrumbTopicLink"+topicID+"' href="+topicStr+"id="+topicID+" class=\"breadcrumb-link-ui2\">"+$(linkElement).innerHTML+"</a>";
			newTD.setAttribute('title', $(linkElement).innerText);
			categoryLinkTD[categoryLinkTD.length] = newTD;
			topicID = $(element).getAttribute('topicid');
		}while($(element).id!=='topicsTreeViewDiv');//NO I18N

	if(isBreadcrumb === "true")
		{
			if(searchString === "false")
			{
				$(breadcrumb).appendChild(allTopicLinkTD);
				for(var k=categoryLinkTD.length-1 ; k>=0; k--)
				{
					if(k!==0)
					{
						getTrimmedTopicName(categoryLinkTD[k]);
					}
					$(breadcrumb).appendChild(categoryLinkTD[k]);
				}
				document.getElementById('breadcrumbTopicLink'+i).className='fontbold';
			}
		}
	}

	}

	if(searchString !== undefined && searchString === "true")
	{
		document.getElementById('solnsrch').focus();
	}
}

function getTrimmedTopicName(tdElement)
{
	if(tdElement.childNodes[1] !== undefined && tdElement.childNodes[1].innerHTML !== null)
	{
		var fullTopicName = tdElement.childNodes[1].innerHTML;
		var trimmedString = fullTopicName.substr(0, 20);
		if(fullTopicName.length > 20)
		{
			trimmedString = trimmedString.concat("..");
		}
		tdElement.childNodes[1].innerHTML = encodeHTML(trimmedString);
		tdElement.setAttribute('title', encodeHTML(fullTopicName));
	}
}

function setTopicsOption(topicTreeViewElement,selectElementID)
{
	var selectElement=document.getElementById(selectElementID);
	var allTopics=$(topicTreeViewElement).childNodes;
	for(var i=1;i<allTopics.length;i++)
	{
		if(allTopics[i].tagName==='DIV' && allTopics[i].id !=="DIVTopicID_0")
		{
			var topicID=allTopics[i].getAttribute('topicid');
			var text = "";
			for(var j=0;j<allTopics[i].getAttribute('level')*3;j++)
			{
				text = text + "&nbsp;";//NO I18N
			}
			text = text +"&#8226;&nbsp;"+ $('TopicLinkOf_'+topicID).innerHTML;	//NO I18N
			var tooltip = 'title="'+e_attr($('TopicLinkOf_'+topicID).innerHTML)+'" rel="uitip" class="text-overflow"'; //NO I18N
			jQuery('<option value="'+topicID+'" id=OPTIONTopicID_'+ topicID +' '+tooltip+'>'+text+'</option>').appendTo(selectElement);
			setTopicsOption(allTopics[i],selectElementID);
		}
	}
}

function constructTopicTreeView(topicTreeViewobj,topicElement,parentElementID, portalId)
{
	var obj=topicTreeViewobj.topicDetails;
	var topicsCount=obj[0].topicsDetailsCount;
	var topicsTreeViewParent=document.getElementById(parentElementID);

	if(topicsCount > 0)
	{
		var element = $('hidden'+topicElement).clone();

		element.id = "DIVTopicID_0";	// No I18N

		topicsTreeViewParent.appendChild(element);
		$("DIVTopicID_0").setAttribute('level','0');
		$(element.id).setAttribute('topicID',0);
		$(element.id).setAttribute('title', getMessageForKey("sdp.solution.listview.allsolutions"));

		var link = $('hiddenA').clone();
		if(loggedInUserID !== null)
		{
			link.href="showTopicDetails.do?action=view&id=0"; // No I18N
		}
		else
		{
			link.href="showTopicDetails.sd?id=0&PORTALID=" + portalId; // No I18N
		}
		link.innerHTML=getMessageForKey("sdp.solution.listview.allsolutions"); // No I18N
		link.id="TopicLinkOf_0"; // No I18N
		element.appendChild(link);

		$(link.id).show();
		$(element.id).show();
	}
	for(var i=1;i<=topicsCount;i++)
	{
		element = $('hidden'+topicElement).clone();

		element.id = topicElement+"TopicID_"+obj[i].topicID;
		topicsTreeViewParent.appendChild(element);

			$(element.id).setAttribute('level','0');
			$(element.id).setAttribute('topicID',obj[i].topicID);
			$(element.id).setAttribute('title', obj[i].topicName);

			var link = $('hiddenA').clone();
			if(loggedInUserID !== null)
			{
				link.href="showTopicDetails.do?action=view&id="+obj[i].topicID; // No I18N
			}
			else
			{
				link.href="showTopicDetails.sd?id="+obj[i].topicID + "&PORTALID=" + portalId; // No I18N
			}
			link.innerHTML=encodeHTML(obj[i].topicName);
			link.id="TopicLinkOf_"+obj[i].topicID;
			element.appendChild(link);

			$(link.id).show();
		$(element.id).show();
	}
	moveChildTopicsUnderParent(topicTreeViewobj,topicElement,parentElementID);
}

function moveChildTopicsUnderParent(topicTreeViewobj,topicElement,parentElementID)
{
	var topicTreeView=topicTreeViewobj.topicDetails;
	var topicsCount=topicTreeView[0].topicsDetailsCount;
	var obj=topicTreeViewobj.topicHierarchyDetails;
	var topicsHierarchyCount=obj[0].topicsHierarchyCount;
	var topicsTreeViewParent=document.getElementById(parentElementID);
	for(i=1;i<=topicsHierarchyCount;i++)
	{
		var childTopicID=obj[i].topicID;
		childTopicID=parseInt(childTopicID);
		var parentTopicID=obj[i].parentID;
		parentTopicID=parseInt(parentTopicID);
		var parentTopicElement=document.getElementById(topicElement+"TopicID_"+parentTopicID);
		var childTopicElement=document.getElementById(topicElement+"TopicID_"+childTopicID);

			var hasChildTopic = parentTopicElement.getElementsByClassName("mtopic").length; //No I18N
			if(hasChildTopic === 0)
			{
				var imgElement=$('hiddenIMG').clone();
				imgElement.id='TopicImg_'+parentTopicID;
				imgElement.align = "absbottom" ; //No I18N

				var preElement = document.createElement("div");
				preElement.className = "mtopic";
				parentTopicElement.insertBefore(imgElement,parentTopicElement.childNodes[0]);
				preElement.innerHTML = parentTopicElement.innerHTML;
				parentTopicElement.innerHTML = '';
				parentTopicElement.appendChild(preElement);
			}

			if(loggedInUserID !== null)
			{
				$(parentTopicElement).setAttribute('status','contract');
				$(childTopicElement.id).hide();
			}
			else
			{
				$(parentTopicElement).setAttribute('status','expand');
				imgElement.className="darrow";// No I18N
			}
			parentTopicElement.appendChild(childTopicElement);
			$(imgElement.id).show();
		}
	addSpaceForTopicWithNoChild(topicTreeViewobj);
	callUpdateLevelDIV();
	callSetIntendation();
	callReplaceTeeByL();
	callRemoveImg();
	document.getElementById('topicsTreeViewDiv').appendChild(document.createElement("br"));
}

function callRemoveImg()
{
	var allTopics=document.getElementById('topicsTreeViewDiv').childNodes;
	for(var i=1;i<allTopics.length;i++)
	{
		removeImg(allTopics[i]);
	}
}

function removeImg(topicDiv)
{
	if(topicDiv.getAttribute('status')!==null && topicDiv=== topicDiv.parentNode.lastChild && topicDiv.tagName === 'DIV')
	{
		var level = topicDiv.getAttribute("level");
		topicDiv.childNodes[0].childNodes[level].className = 'lastnode-clsp';
		removeImgElement(topicDiv,level);
	}
	else if(topicDiv.tagName === 'DIV')
	{
		var topicDivChildNode = topicDiv.childNodes;
		for(var j =0 ; j < topicDivChildNode.length ; j++)
		{
			if(topicDivChildNode[j].tagName === 'DIV')
			{
				removeImg(topicDivChildNode[j]);
			}
		}
	}
}

function removeImgElement(topicDivs,levels)
{
	var topicDivCN = topicDivs.childNodes;
	for(var k =0 ; k < topicDivCN.length ; k++)
	{
		if(topicDivCN[k].getAttribute('status')!==null)
		{
			var childs = topicDivCN[k].childNodes;
			for(var x = 0 ; x < childs.length ; x++ )
			{
				if(childs[x].getAttribute('status')!==null)
				{
					childs[x].childNodes[0].childNodes[levels].className = "";
					removeImgElement(childs[x],levels);
				}
				else
				{
					childs[x].childNodes[levels].className = "";
				}
			}
			removeImg(topicDivCN[k]);
		}
		else
		{
			if(topicDivCN[k].className !== 'mtopic')
			{
				topicDivCN[k].childNodes[levels].className = "";
			}
		}
	}
}

function addSpaceForTopicWithNoChild(topicTreeViewobj)
{
	var obj=topicTreeViewobj.topicDetails;
	var topicsCount=obj[0].topicsDetailsCount;

	for(var i=1;i<=topicsCount;i++)
	{
		var id = "DIVTopicID_"+obj[i].topicID;

		if(!document.getElementById(id).hasAttribute("status"))
		{
			$(id).innerHTML='<img width="19" hspace="5" border="0" src="/images/spacer.gif" align="absbottom" class="sol-tee levelLast" >'+$(id).innerHTML;
		}
	}
}
function callTopicExpandContract(img)
{
	var idSplit=(img.id).split("_");
	var tid= parseInt(idSplit[idSplit.length-1]);
	var action = 'contract';// No I18N
	if($('DIVTopicID_'+tid).getAttribute('status')==='contract')
	{
		action = 'expand';  // No I18N
	}
	topicExpandContract('DIVTopicID_'+tid,tid,'TopicImg_'+tid,action);// No I18N
}

function callUpdateLevelDIV()
{
	var allTopics=document.getElementById('topicsTreeViewDiv').childNodes;
	for(var i=0;i<allTopics.length;i++)
	{
		var allSubTopics=allTopics[i].childNodes;
		for(var k=0;k<allSubTopics.length;k++)
		{
			var ctn=allSubTopics[k];
			if(ctn.tagName==='DIV' && ctn.className !== 'mtopic')
			{
				updatelevel(ctn);
			}
		}
	}
}

function updatelevel(childTopicDIV)
{
	childTopicDIV.setAttribute('level',parseInt(childTopicDIV.parentNode.getAttribute('level'))+1);

	var subTopics=childTopicDIV.childNodes;
	for(var j=0;j<subTopics.length;j++)
	{
		var ctn=subTopics[j];
		if(ctn.tagName==='DIV' && ctn.className !== 'mtopic')
		{
			updatelevel(ctn);
		}
	}
}

function callSetIntendation()
{
	var allTopics=document.getElementById('topicsTreeViewDiv').childNodes;
	for(var i=0;i<allTopics.length;i++)
	{
		var allSubTopics=allTopics[i].childNodes;
		for(var k=0;k<allSubTopics.length;k++)
		{
			var ctn=allSubTopics[k];
			if(ctn.tagName==='DIV')
			{
				setIntendation(ctn);
			}
		}
	}
}

function setIntendation(childTopicDIV)
{
	var indent;
	if($(childTopicDIV).getElementsByClassName("mtopic").length === 0)
	{
		indent=getIntendationForTopicLevel(childTopicDIV.getAttribute('level'));
		childTopicDIV.innerHTML=indent+childTopicDIV.innerHTML;
	}
	else
	{
		indent=getIntendationForTopicLevel(childTopicDIV.getAttribute('level'));
		childTopicDIV.getElementsByClassName("mtopic")[0].innerHTML=indent+childTopicDIV.getElementsByClassName("mtopic")[0].innerHTML;
	}
	var subTopics=childTopicDIV.childNodes;
	for(var j=0;j<subTopics.length;j++)
	{
		var ctn=subTopics[j];
		if(ctn.tagName==='DIV' && ctn.className !== 'mtopic')
		{
			setIntendation(ctn);
		}
	}
}

function getIntendationForTopicLevel(level)
{
	var indent='';
	for(var i=0;i<level;i++)
	{
		indent = indent + "<img width=\"15\" border=\"0\" src=\"/images/spacer.gif\" align=\"absbottom\" class=\"sol-bar level"+i+" \">" ;//No I18N
	}
	return indent;
}

function callReplaceTeeByL()
{
	var allTopics=document.getElementById('topicsTreeViewDiv').childNodes;
	for(var i=1;i<allTopics.length;i++)
	{
		var allSubTopics=allTopics[i].childNodes;
		for(var k=0;k<allSubTopics.length;k++)
		{
			var ctn=allSubTopics[k];
			if(ctn.tagName==='DIV')
			{
				replaceTeeByL(allSubTopics[k]);
			}
		}
	}

	replaceTeeByL(allTopics[i-1]);
}

function replaceTeeByL(element)
{
		if(element === element.parentElement.lastChild && element.getAttribute('status')===null)
		{
			var childNodesLength = 	element.childNodes.length;
			var lastImgElement = element.childNodes[childNodesLength-2];
			lastImgElement.className = 'sol-teecor';
			lastImgElement.align = 'top';
		}
		else
		{
			var subTopics=element.childNodes;
			for(var j=0;j<subTopics.length;j++)
			{
				var ctn1=subTopics[j];
				if(ctn1.tagName==='DIV')
				{
					replaceTeeByL(ctn1);
				}
			}
		}
}

function getIntendationForManageTopicActions(level)
{
	var indent = "";
	for(var i=0 ; i < level ; i++)
	{
		indent = indent + "&nbsp;&nbsp;&nbsp;";//No I18N
	}
	return indent;
}

function setSolutionsPermission(userID,ViewPermission,CreatePermission,ModifyPermission,DeletePermission,ApprovePermission)
{
	 isUserHavingViewSolutionsPermission=ViewPermission;
	 isUserHavingCreateSolutionsPermission=CreatePermission;
	 isUserHavingModifySolutionsPermission=ModifyPermission;
	 isUserHavingDeleteSolutionsPermission=DeletePermission;
	 isUserHavingSolutionsApprovePermission=ApprovePermission;
	 loggedInUserID = userID;
}

function solutionListAction(mode,modeId,form,append)
{
	var checkbox=form.checkbox;
	if(checkbox) {
		var list="";
		if(checkbox.length){
			for(var i=0;i<checkbox.length;i++){
				if(checkbox[i].checked){
					list=list+"&checkbox="+checkbox[i].value; // No I18N
				}
			}
		}
		else if(checkbox.checked){
			list=list+"&checkbox="+checkbox.value; // No I18N
		}
		if(list!=""){
			if(mode=='Delete'){
				form.action="/AddSolution.do?submitaction=deleteSolution&deleteSolution=true&ListView=true"; // No I18N
				if(jQuery(form).find("input[name="+getCSRFParamName()+"]").val()==null)
				{
					addHiddenInput(form,getCSRFParamName(),getCSRFParamValue());
				}	
				jQuery('#_DIALOG_LAYER').remove();
				var answer=confirm(getMessageForKey("sdp.admin.category.listview.delete.confirmdelete"));
				if(answer!=0){
					form.submit();
				}
			}
			else{
				var url = "/kbase/ApproveAction.jsp?modeId="+modeId+"&mode="+mode+list; // No I18N
				var title = getMessageForKey("sdp.solution.approvals.rejectsolutions");
				if(mode == "Approve") {
					title = getMessageForKey("sdp.solution.approvals.approvecomments");
				}
				jQuery('#_DIALOG_LAYER').remove();
				showURLInDialog(url, "width=400,title=" + title ); // No I18N
			}
		}
		else {
			alert(getMessageForKey("sdp.solution.listview.selectmessage"));
		}
	}
	else {
		alert(getMessageForKey("sdp.solutions.home.popularsolutions.nosolutions"));
	}
}
function validateSolutionForm(theForm,status)
{
	if(status!=null)
	{
		theForm.approveStatusID.value=status;
	}

	if(isEmpty(theForm.title.value))
	{
		alert(getMessageForKey("sdp.solutions.newsolution.titlejserror"));
		theForm.title.value = '';
		theForm.title.focus();
		return false;
	}
	title = trimAll(theForm.title.value);
	theForm.title.value = title;
	// This if for removing checking whether any values are present in the html area. In Ie, it will be P tags and in FF it will be BR tags. Hence both tags are removed first.

	// the following code is required to transform the plain text
	// to html text when the user had toggled to plain editing
	var content = getHTMLDescription();
	theForm.resolution.value = content;
	content = content.replace(/<br \/>/g,""); // No I18N
	content = content.replace(/<br>/g,"\n"); // No I18N
	content = content.replace(/<p \/>/g,""); // No I18N
	content = content.replace(/<\/p>/g,""); // No I18N
	content = content.replace(/<p>/g,""); // No I18N
	content = trimAll(content);
	if(content == "")
	{
		alert(getMessageForKey("sdp.solutions.newsolution.contentjserror"));
		return false;
	}
	if((isEmpty(theForm.topicID.value)) || (theForm.topicID.value == -1))
	{
		alert(getMessageForKey("sdp.solutions.newsolution.topicjserror"));
		theForm.topicID.focus();
		return false;
	}
	keywords = trimAll(theForm.keywords.value);
	theForm.keywords.value = keywords;

	if(document.addSolutionForm.isPublic.checked)
   	 {
		assignedUserGroups = theForm.selectedUserGroupsId;
		for(i=0;i<assignedUserGroups.length;i++)
		{
			assignedUserGroups.options[i].selected = true;
		}
	}

	theForm.isPublicSolution.value = theForm.isPublic.checked;

	return true;
}

function solutionApp_EmailList(id){

	var mailAdd=document.getElementById(id+"_Email").value;
    var check=document.getElementById(id).checked;
    var selApprsEle = parent.document.getElementById('selectedApprs');  //No i18n
    var selApprs = selApprsEle.value;
    var toContent = parent.document.getElementById('toEmailSearch').value;
    var userIDcontent = parent.document.getElementById('useridlist').value;
    var addList = [],userList=[];
    if(toContent!=null && toContent!=''){
        addList = toContent.split(',');
        userList = userIDcontent.split(',');
        selApprs = selApprs+","+id;            //No i18n
    }
    if(check && mailAdd!=null && mailAdd!=''){
        addList.push(mailAdd);
        userList.push(id);
    }else{
        addList.splice(addList.indexOf(mailAdd),1);
        userList.splice(userList.indexOf(id),1);
        selApprs = id;

    }
    parent.document.getElementById('toEmailSearch').value= addList.toString();
    		selApprsEle.value = selApprs;

    parent.document.getElementById('useridlist').value= userList.toString();
}

function confirmSolutionDelete(solID,topicID,url){
	var answer=confirm(getMessageForKey("sdp.admin.category.listview.delete.confirmdelete"));
	if(answer!=0){
		var deleteSolutionForm=createForm("/AddSolution.do","","POST","deleteSolution");// No I18N
		document.body.appendChild(deleteSolutionForm);
		addHiddenInput(deleteSolutionForm,"submitaction","deleteSolution");// No I18N
		addHiddenInput(deleteSolutionForm,"deleteSolution","true");// No I18N
		addHiddenInput(deleteSolutionForm,"solID",solID);// No I18N
		addHiddenInput(deleteSolutionForm,getCSRFParamName(),getCSRFParamValue());
		deleteSolutionForm.submit();
	}
}


function showAllSolutionComments() {
	/*Solution Details History Show all comments event*/
	var temp = jQuery('#view_hide');
	if(jQuery(temp).attr('data-id') == 'expand') {
		jQuery(temp).attr({'data-id':'collapse','title':getMessageForKey("ae.cmdb.leftnavigation.collapse")}).uitooltip({content:getMessageForKey("ae.cmdb.leftnavigation.collapse")}).find('span').attr('class','cspr icon-sm collapse-arrow1');// No I18N
		jQuery(temp).attr({'data-id':'collapse','title':getMessageForKey("ae.cmdb.leftnavigation.collapse")}).uitooltip({content:getMessageForKey("ae.cmdb.leftnavigation.collapse")});// No I18N
		zcomponent.collapsible_expandall('#solutionHistory');// No I18N
	} else {
		jQuery(temp).attr({'data-id':'expand','title':getMessageForKey("ae.cmdb.leftnavigation.expand")}).uitooltip({content:getMessageForKey("ae.cmdb.leftnavigation.expand")}).find('span').attr('class','cspr icon-sm expand-arrow1');// No I18N
		jQuery(temp).attr({'data-id':'expand','title':getMessageForKey("ae.cmdb.leftnavigation.expand")}).uitooltip({content:getMessageForKey("ae.cmdb.leftnavigation.expand")}); // No I18N
		zcomponent.collapsible_collapseall('#solutionHistory');// No I18N
	}
	leftsolelementhgt('#topicsTreeViewDiv','.content-panel-inner');// No I18N
}
function solutionZcomponent(){
	setTimeout(function(){
		if(document.getElementById('solutionHistory')){
			zcomponent.collapsible_destroy('#solutionHistory'); // No I18N
			zcomponent.collapsible_init('#solutionHistory',false); // No I18N
			jQuery('#solutionHistory > .panel-group > .panel:nth-child(1)').attr('id','soluHisCh1');// No I18N
			zcomponent.collapsible_expand('#solutionHistory','#soluHisCh1');// No I18N
		}
	},600);
}
function checkAddTopicForm(submitBtn, thisForm)
{
	if(window.is_unique==false){
		window.is_unique=null;
		return false;
	}
	
	if(isEmpty(thisForm.topicName.value))
	{
		alert(getMessageForKey("sdp.solutions.newtopic.namejserror"));
		thisForm.topicName.value = '';
		thisForm.topicName.focus();
		return false;
	}
	name = trimAll(thisForm.topicName.value);
	thisForm.topicName.value = name;
	if(isEmpty(thisForm.parentTopicID.value))
	{
		alert(getMessageForKey("sdp.solutions.newtopic.parentjserror"));
		thisForm.parentTopicID.focus();
		return false;
	}
	
	if(jQuery(submitBtn).attr("name")=="addTopicButton"){
		var url=thisForm.action;
		thisForm.action=url+"&addTopicButton=Add";
		return true;
	}
	else {
		return false;
	}
	
	disableButtonClick(submitBtn);
	//thisForm.submit();
	
}
function checkParentTopicSelection(theForm)
{
	if((theForm.changeSolutionParent != null) && (theForm.changeSolutionParent.checked))
	{
		if(isEmpty(theForm.solutionParentID.value))
		{
			alert(getMessageForKey("sdp.solutions.managetopics.deletetopic.choosesolutionparentalert"));
			return false;
		}
	}
	if((theForm.moveSubTopics != null) && (theForm.moveSubTopics.checked))
	{
		if(isEmpty(theForm.subTopicParentID.value))
		{
			alert(getMessageForKey("sdp.solutions.managetopics.deletetopic.choosetopicparentalert"));
			return false;
		}
	}
	return true;
}
function setSubmitAction(thisForm,submitActionValue)
{
	thisForm.submitAction.value=submitActionValue;
}
function checkTopicName(thisForm,button)
{
	
	if(button.name=="changeTopicNameButton")// No I18N
	{
		if(window.is_unique==false){
			window.is_unique=null;
			return false;
		}
		
		if(isEmpty(thisForm.topicName.value))
		{
			alert(getMessageForKey("sdp.solutions.newtopic.namejserror"));
			thisForm.topicName.value = '';
			thisForm.topicName.focus();
			return false;
		}
		thisForm.submitAction.value="rename"; // No I18N
		name = trimAll(thisForm.topicName.value);
		thisForm.topicName.value = name;
		return true;
	}
	else
	{
		thisForm.submitAction.value="cancel";// No I18N
		return true;
	}
	return false;
}
function showSolutionsApprovals(mode,modeId,solID)
{

	var url = "/kbase/ApproveAction.jsp?modeId="+modeId+"&mode="+mode+"&solutionId="+solID; // No I18N
	if("Approve"==mode){
		mode=getMessageForKey("sdp.solution.approvals.approvecomments");
	}else{
		mode=getMessageForKey("sdp.solution.approvals.rejectcomments");
	}
	showURLInDialog(url, "width=400,modal=yes,position=absmiddle,title="+mode+""); // No I18N
}

function addUsersForSolutionNotification(notName)
{

  var mode = 'add';//No i18N
        var values, ids, url;
  if(notName === "NotifyAdd_UpdateSolution") {//No i18N

    values = document.SolutionNotForm.NotifyAdd_UpdateSolution_UserDisplay.value;
    ids = document.SolutionNotForm.NotifyAdd_UpdateSolution_USERS.value;
          url = '/SearchItem.do?criteria=Technician Name&element1=document.SolutionNotForm.NotifyAdd_UpdateSolution_UserDisplay&element2=document.SolutionNotForm.NotifyAdd_UpdateSolution_USERS&from=escalate&type=Solution';//No i18N
  }
  else if(notName === "NotifyAdd_UpdateExpirySolution") {//No i18N

	    values = document.addSolutionForm.NotifyExpirySolution_UserDisplay.value;
	    ids = document.addSolutionForm.NotifyExpirySolution_USERS.value;
	          url = '/SearchItem.do?criteria=Technician Name&element1=document.addSolutionForm.NotifyExpirySolution_UserDisplay&element2=document.addSolutionForm.NotifyExpirySolution_USERS&from=escalate&type=Solution';//No i18N
	  }



  if(values!==null && values!=='' && ids!==null && ids!=='')
        {
                mode = 'edit';//No i18N
        }

        url = url + '&mode=' + mode;//No i18N

        NewWindow(url,'selectitem','320','350','yes','center');//No i18N
}

function cancelSolutionAddition(woid,statusID,module) {
	if(module==="problem")
	{
			window.top.$previewComponent.closePreview('new_solution_popup');//No I18N
	}
	else if(woid==null || woid=="") {
		document.location = "/SolutionsHome.do?action=view"; // No I18N
	}else {
		if(statusID != null) {
			if (statusID=="3") {
				document.location = "/WOListView.do"; // No I18N
			}
			else {
				document.location = "/WorkOrder.do?woMode=viewWO&woID="+woid; // No I18N
			}
		}
		else {
			document.location = "/WorkOrder.do?woMode=viewWO&woID="+woid; // No I18N
		}
	}
}

function validateXLSSolutionsImportMandatoryFields()
{
        if(document.getElementById('SolutionTitle').value == -1)
        {
                showBaloonToolTip('SolutionTitle', getMessageForKey("sdp.solution.import.title.mandatory"));//No I18N
                return false;
        }
        if(document.getElementById('contents').value == -1)
        {
                showBaloonToolTip('contents', getMessageForKey("sdp.solution.import.contents.mandatory"));//No I18N
                return false;
        }
        if(document.getElementById('topic').value == -1  && (document.getElementById('topicDefaultValue').value == ''))
        {
                showBaloonToolTip('topic', getMessageForKey("sdp.solution.import.topic.mandatory"));//No I18N
                return false;
        }
                var rowCount = document.getElementById('rowcount').innerHTML
        rowCount = rowCount.substring(rowCount.indexOf(":")+1); // Issue in I18N so changed behaviour
        if(rowCount < 1)
        {
            showBaloonToolTip('sheetcount', getMessageForKey("sdp.request.import.norows"));//No I18N);
            return false
        }
        document.importXLSSolution.submit();
}

function importXLSSolutionSubmitForm()
{
    document.importXLSSolution.submit();
    closeDialog();
    showProgressDiv();
}

function convertSelectToSelect2()
{
	jQuery('#loadingDIV').attr('class','mcLoaded');
 	if(window.jQuery)
 	{
 		jQuery(document).ready(function()
 		{
 			jQuery("#topicDefaultValue").select2({
 			    allowClear: true
 			});
 			jQuery("#createdbyDefaultValue").select2({
 			    allowClear: true
 			});
 			jQuery("#updatedbyDefaultValue").select2({
 			    allowClear: true
 			});
 			jQuery("#usergroupsDefaultValue").select2({
 			    allowClear: true
 			});

 			jQuery("#createdbyDefaultValue").select2("val", loggedInUserID);//NO I18N
 			jQuery("#updatedbyDefaultValue").select2("val", loggedInUserID);//NO I18N
 			//jQuery('#statusDefaultValue').val("1");

 			jQuery('#solutionOwnerDefaultValue').select2({
                multiple: true,
                closeOnSelect : false,
                allowClear: true,
                data:{ results: ownerArr, text: function(item) { return e_html(item.name); } },
                formatResult: function(item) { return e_html(item.name); } ,
                formatSelection: function(item) { return e_html(item.name); }
            });

 		});
 	}
}
function searchSoltnOnKeyUp(solnsrch, portalId){
	var srchTerm=solnsrch.value;
	if(srchTerm.length>0&&srchTerm.trim()==''){
		return;
	}
	else if((srchTerm.length==0)||(srchTerm.length>0&&srchTerm.charAt(srchTerm.length-1)==' ')){
	  	var viewId = 'SolutionsListView';//NO I18N
		viewId = getPortalViewName(viewId);
        
        if(loggedInUserID === null){
            viewId = 'SDSolutionsListView';//NO I18N
        }
	
    updateState(viewId,'SearchString',srchTerm.trim());

	updateState(viewId,"_D_RP", "PORTALID=" + portalId);//No I18N
	updateState(viewId,"_PN", null);//No I18N

        refreshSubView(viewId);
	}
}
function includeSearchFieldPersonalization(){
	var searchFields = null;
	jQuery('.sug-serch-menu li').each(function() {
		if(jQuery( this ).hasClass( 'checkmark' )){
			var searchFieldId = jQuery( this ).attr('id');
			if(searchFields != null ) {
				searchFields = searchFields + searchFieldId.substring(9)+ ":" ;
			} else {
				searchFields = searchFieldId.substring(9) + ":" ;
			}
		}
	});
	if(searchFields != null) {
		if(loggedInUserID !== null ) {
			var newUrl = '/servlet/SolutionsServletUtil';// No I18N
			var params = 'command=setSearchFields&search_fields='+searchFields;// No I18N
			var myAjax = new Ajax.Request(newUrl, {
				method: 'post',// No I18N
				parameters: params
			});
		}else {
			var newUrl = '/sd/SolutionSearch.sd';// No I18N
			var selectName = jQuery(document).find("#selectName").val();
			var params = 'search_fields='+searchFields+'&selectName='+selectName;// No I18N
			var myAjax = new Ajax.Request(newUrl, {
				method: 'post',// No I18N
				parameters: params
			});
		}
	} 
}
function getSearchFieldPersonalization() {
	var searchFields = null;
	if(loggedInUserID !== null ) {
		var newUrl = '/servlet/SolutionsServletUtil'; // No I18N
		var params = 'command=getSearchFields';// No I18N
        var _self = this;
        sdpAjax({
            type: "GET", //No I18N
            url: newUrl,
            data : sdpAjaxInputData(params),
            dataType : 'text', //No I18N
            success: function (result) {
               if(result!=null){
                   _self.SearchFieldPersonalization(result);
               }

            },
            async:false
        });
	}
}
function SearchFieldPersonalization(searchFieldList) {
	var fromIndex=0;
	var endIndex=searchFieldList.indexOf('&#x3a;');
	jQuery( '#solutionSdmenu > li' ).removeClass( 'checkmark' );			// No I18N
	while(endIndex!=-1) {
		var fieldname=searchFieldList.substring(fromIndex,endIndex);
		jQuery( "#solnsrch_"+fieldname).addClass( 'checkmark' );
		fromIndex=endIndex+6;
		endIndex=searchFieldList.indexOf('&#x3a;',fromIndex);
	}
}

function slnTabSwitching(){
		jQuery(this).addClass('active').siblings().removeClass('active');
		var id = jQuery(this).attr('data-switch');
		jQuery("#sln_req_type").val('activeReq');						// No I18N
		jQuery("#req_list").empty();
		jQuery("#end_index").val("5");
		jQuery('.sdtab-content').find('#'+id).show().siblings('div').hide();
		if(id == "tabs_Requests"){
			isArcRequestPresent();
			requestListView();
		}
	}
function reqDropdownChange(){
	var reqType = jQuery("#sln_req_type").val();
	jQuery("#req_list").empty();
	jQuery("#end_index").val("5");
	if(reqType == "activeReq") {
		requestListView();
	} else {
		arcRequestListView();
	}
}
function reqPrintViewUrl(requestID){
	var reqType = jQuery("#sln_req_type").val();
	if(reqType != null && reqType == "archiveReq") {
		NewWindowP('/SDArchiveWorkOrder.do?woMode=PrintView&woID='+requestID+'&fromModule=Solution','Print_Preview','1000','550','yes','center','yes','yes'); // No I18N
	} else {
		//NewWindowP('/WorkOrder.do?woMode=printWO&woID='+requestID+'&fromModule=Solution','','1100','700','yes','center','yes','yes'); // No I18N
		NewWindowP('/workorder/WOPrintPreview.jsp?isPreview=true&trimmed_details=request_details,requester_details,share_request,history,resolution&woID='+requestID,'','1100','700','yes','center','yes','yes'); // No I18N

	}
}
function requestListViewMore() {
	var reqType = jQuery("#sln_req_type").val();
	if(reqType == "activeReq") {
		requestListView();
	} else {
		arcRequestListView();
	}
	
}
function requestListView(){
	var startIndex, endIndex = jQuery("#end_index").val();
	startIndex = parseInt(endIndex) - 4 ;
	jQuery("#end_index").val(parseInt(endIndex) + 5);
	var solution_id = jQuery("#sln_id").val();
	var inputObject = {};
	var list_info 	= {};
	var search_fields = {};
	var fields_required = ["request","association_type","comments","associated_by","associated_time"]; // No I18N
	list_info.start_index = startIndex.toString();
	list_info.end_index = endIndex.toString();
	list_info.sort_field = "associated_time";	// No I18N
    list_info.sort_order = "desc";				// No I18N
    if(jQuery("#onlyresolvedrequest").prop("checked")==true) {
		search_fields.association_type = "applied"; // No I18N
		 list_info.search_fields  =  search_fields;
     } 
	inputObject.fields_required = fields_required;
	inputObject.list_info = list_info;
	var dataVal = sdpAjaxInputData(inputObject);
	sdpAjax({
      	url: '/api/v3/solutions/'+solution_id+'/associated_requests', // No I18N
      	data : dataVal,
      	success: function(response){
      		var request = response.solution_to_request;
	        if(request.length > 0){
	        	jQuery("#norecords").hide();
	        	if(response.list_info.has_more_rows == true){
                  jQuery("#btn_viewmore").show();
                }else{
                  jQuery("#btn_viewmore").hide();
                }
	            var divEle = jQuery("<div></div>"); // No I18N
	            jQuery.each(request, function(index, reqObj){
	            	reqObj.request_id = reqObj.request.id;
	            	reqObj.request_title = encodeHTML(reqObj.request.title);
	            	reqObj.associated_by = encodeHTML(reqObj.associated_by.name);
	            	reqObj.associated_on = reqObj.associated_time.display_value;
	            	if(reqObj.association_type != "tried"){
	            		reqObj.comments_show = "hide"; // No I18N
	            		reqObj.associated = getMessageForKey("sdp.request.resolution.appliedby"); // No I18N
	            	} else {
	            		if(reqObj.comments == null){
	            			reqObj.comments ="-";
	                     }
	            		reqObj.comments    = encodeHTML(reqObj.comments);
	            		reqObj.associated = getMessageForKey("sdp.request.resolution.triedby"); // No I18N
	            	}
	            	var reqDiv = getHtmlForTemplate("req_elem", reqObj, false); // No I18N
					jQuery(divEle).append(reqDiv);
	            });
	            jQuery("#req_list").append(jQuery(divEle).html()); // No I18N
	        }else{
	        	jQuery("#req_list").empty();
	        	jQuery("#norecords").show();
	        }
      	}
  });
}
function arcRequestListView(){
	var startIndex, endIndex = jQuery("#end_index").val();
		startIndex = parseInt(endIndex) - 4 ;
		jQuery("#end_index").val(parseInt(endIndex) + 5);
	var solution_id = jQuery("#sln_id").val();
	var search_fields = {};
	var inputObject = {};
	var list_info 	= {};
	var fields_required = ["request","association_type","comments","associated_by","associated_time"]; // No I18N
	list_info.start_index = startIndex.toString();
	list_info.end_index = endIndex.toString();
	list_info.sort_field = "associated_time";	// No I18N
    list_info.sort_order = "desc";				// No I18N
    if(jQuery("#onlyresolvedrequest").prop("checked")==true) {
		search_fields.association_type = "applied"; // No I18N
		 list_info.search_fields  =  search_fields;
     } 
	inputObject.fields_required = fields_required;
	inputObject.list_info = list_info;
	var dataVal = sdpAjaxInputData(inputObject);
	sdpAjax({
      	url: '/api/v3/solutions/'+solution_id+'/associated_arcrequests', // No I18N
      	data : dataVal,
      	success: function(response){
      		var request = response.solution_to_request;
	        if(request.length > 0){
	        	jQuery("#norecords").hide();
	        	if(response.list_info.has_more_rows == true){
                  jQuery("#btn_viewmore").show();
                }else{
                  jQuery("#btn_viewmore").hide();
                }
	            var divEle = jQuery("<div></div>"); // No I18N
	            jQuery.each(request, function(index, reqObj){
	            	reqObj.request_id = reqObj.request.id;
	            	reqObj.request_title = encodeHTML(reqObj.request.title);
	            	reqObj.associated_by = encodeHTML(reqObj.associated_by.name);
	            	reqObj.associated_on = reqObj.associated_time.display_value;
	            	if(reqObj.association_type != "tried"){
	            		reqObj.comments_show = "hide"; // No I18N
	            		reqObj.associated = getMessageForKey("sdp.request.resolution.appliedby"); // No I18N
	            	} else {
	            		if(reqObj.comments == null){
	            			reqObj.comments ="-";
	                     }
	            		reqObj.comments    = encodeHTML(reqObj.comments);
	            		reqObj.associated = getMessageForKey("sdp.request.resolution.triedby"); // No I18N
	            	}
	            	var reqDiv = getHtmlForTemplate("req_elem", reqObj, false); // No I18N
					jQuery(divEle).append(reqDiv);
	            });
	            jQuery("#req_list").append(jQuery(divEle).html()); // No I18N
	        }else{
	        	jQuery("#req_list").empty();
	        	jQuery("#norecords").show();
	        }
      	}
  });
}
function isArcRequestPresent(){
	var solution_id = jQuery("#sln_id").val();
	sdpAjax({
      	url: '/api/v3/solutions/'+solution_id+'/associated_arcrequests', // No I18N
      	success: function(response){
      		var request = response.solution_to_request;
	        if(request.length > 0){
	        	jQuery("#sln_req_type").show();
	        }else{
	        	jQuery("#sln_req_type").hide();
	        }
      	},async:false
  });
}

var solution_oldTime, solution_oldDispTime;
function initSolutionCalendar(element){

	var compareElement, errorCondition, setHrsMins, errorMsg;
	var tempVar;

	if('reviewdate' == element){ //NO I18N

		compareElement = 'expirydate';errorCondition = '';setHrsMins = '12:00';errorMsg=getMessageForKey("sdp.solution.expiry.review.date.mismatch1");//NO I18N
		solution_oldTime = document.getElementById("reviewdate").value;
		solution_oldDispTime = document.getElementById("reviewdate_Display").value;

	}else if('expirydate' == element){	//NO I18N

		compareElement = 'reviewdate';errorCondition = 'less';setHrsMins = '12:00';errorMsg=getMessageForKey("sdp.solution.expiry.review.date.mismatch2");//NO I18N
		solution_oldTime = document.getElementById("expirydate").value;
		solution_oldDispTime = document.getElementById("expirydate_Display").value;

		//To select the selected review date as the default value to the expiry date.
		if( (solution_oldTime == null || solution_oldTime <= 0 || solution_oldTime == "") && (document.getElementById('reviewdate').value != null && document.getElementById('reviewdate').value > -2) ) {
			tempVar = document.getElementById('expirydate').value;
			document.getElementById('expirydate').value = document.getElementById('reviewdate').value;
			if(tempVar == "") {
				tempVar = '-1';
			}
		}

	}
	// since the dropdown closes when mouse clicked outside the dropdown, disp-ib class will be added in ZSDPCalendar.js to keep the dropdownId open even after clicking next/previous/other buttons in calendar.
	var dropdownId = (('reviewdate' == element) ? 'ReviewDateDropDown' : (('expirydate' == element) ? 'ExpiryDateDropDown' : '')); //NO I18N
	var close = function( event, data ) {
		        jQuery('#'+dropdownId).removeClass('disp-ib'); // disp-ib class will be removed when mouse is clicked outside the calendar so that dropdown closes.
		      	jQuery("#"+dropdownId).css('display','none');//NO I18N
		      }
	initCalendar(element, null, null, null, null, checkAndResetValidDate, window, [element , compareElement, errorMsg , errorCondition], false, setHrsMins ,true, null, false, null, {'close' : close, 'position' : 'top', 'parentId' : dropdownId}); // No I18N
	//Reassigning the original value for the expiry date field.
	if(tempVar) {
		document.getElementById('expirydate').value = tempVar;
	}
}

function checkAndResetValidDate(element , compareElement, errorMsg , errorCondition) {

	var currentDate = new Date();
    currentDate.setHours(12,0,0);
    currentDate.setMilliseconds(0);

    document.getElementById('currentdate').value = currentDate.getTime();
    var currentDatVar = "currentdate";//NO I18N
    var currentErrorMsg = getMessageForKey('sdp.solution.currentdate.review.date.mismatch');
    if('expirydate' == element){
    	currentErrorMsg = getMessageForKey('sdp.solution.currentdate.expiry.date.mismatch');
    }
    var currentErrorCondition = 'less';//NO I18N
    //Checking the Current date to the review or expiry date
    if(!checkValidDate(element , currentDatVar, currentErrorMsg , currentErrorCondition)) {

		if('reviewdate' == element){ //NO I18N
			document.getElementById("reviewdate").value = solution_oldTime;
			document.getElementById("reviewdate_Display").value = solution_oldDispTime;
			if(solution_oldTime !=null && solution_oldTime != "" && solution_oldTime != "-1") {
				displayClientTime('reviewdate');//NO I18N
				jQuery('#reviewDateMenu').find('span').html(document.getElementById('reviewdate_Display').value);
			}
			else {
				resetReviewDate();
			}
		}else if('expirydate' == element){	//NO I18N
			document.getElementById("expirydate").value = solution_oldTime;
			document.getElementById("expirydate_Display").value = solution_oldDispTime;
			if(solution_oldTime !=null && solution_oldTime != "" && solution_oldTime != "-1") {
				displayClientTime('expirydate');//NO I18N
				jQuery('#expiryDateMenu').find('span').html(document.getElementById('expirydate_Display').value);
			}
			else{
				resetExpiryDate();
			}
		}
	}
	//Check/compare the review date and expiry date
	else if(checkValidDate(element , compareElement, errorMsg , errorCondition)) {
		if('reviewdate' == element){ //NO I18N
			jQuery('#reviewDateMenu').find('span').html(document.getElementById('reviewdate_Display').value);//NO I18N
		}else if('expirydate' == element){	//NO I18N
			jQuery('#expiryDateMenu').find('span').html(document.getElementById('expirydate_Display').value);//NO I18N
		}
	}
	else {
		if('reviewdate' == element){ //NO I18N
			document.getElementById("reviewdate").value = solution_oldTime;
			document.getElementById("reviewdate_Display").value = solution_oldDispTime;
			if(solution_oldTime !=null && solution_oldTime != "" && solution_oldTime != "-1") {
				displayClientTime('reviewdate');//NO I18N
				jQuery('#reviewDateMenu').find('span').html(document.getElementById('reviewdate_Display').value);
			}
			else {
				resetReviewDate();
			}
		}else if('expirydate' == element){	//NO I18N
			document.getElementById("expirydate").value = solution_oldTime;
			document.getElementById("expirydate_Display").value = solution_oldDispTime;
			if(solution_oldTime !=null && solution_oldTime != "" && solution_oldTime != "-1") {
				displayClientTime('expirydate');//NO I18N
				jQuery('#expiryDateMenu').find('span').html(document.getElementById('expirydate_Display').value);
			}
			else{
				resetExpiryDate();
			}
		}
	}
}

//All scripts needed for add/edit solution page on ready scripts/events can be attached in this method.
function addSolutionPageOnReadyEvents() {
	zeditor({element: 'HTMLDesc', acceptODCompatible: true, inlineimagesAPI:'/api/v3/solutions/images',resize: true, edithtml: true, insertVideo: true}); //NO I18N
	checkPublic();

	//Attaching Select2 for the Solution Owner field .
	jQuery('#solutionOwnerID').select2({
		multiple: true,
		closeOnSelect : false,
		data:{ results: techArr, text: function(item) { return item.name; } },
		placeholder: getMessageForKey('common.select.technicians'),
		formatResult: function(item) { return e_html(item.name); } ,
		formatSelection: function(item) { return e_html(item.name); }
	});

	//Setting initial value for the Solution Owner field in the Select2.
	if(document.getElementById('submitaction').value == 'updateSolution' && typeof solutionOwnersInitialVar !== 'undefined') {
		jQuery('#solutionOwnerID').select2("val", solutionOwnersInitialVar);//NO I18N
	}

	//Client Date set for review date and Expiry date field.
	if(document.getElementById('reviewdate')) {
		displayClientTime('reviewdate');//NO I18N
		if(document.getElementById('reviewdate_Display').value != null && document.getElementById('reviewdate_Display').value != "") {
			jQuery('#reviewDateMenu').find('span').html(document.getElementById('reviewdate_Display').value);
		}
	}
	if(document.getElementById('expirydate')) {
		displayClientTime('expirydate');//NO I18N
		if(document.getElementById('expirydate_Display').value != null && document.getElementById('expirydate_Display').value != "") {
			jQuery('#expiryDateMenu').find('span').html(document.getElementById('expirydate_Display').value);
		}
	}

	//Cursor focus set to the Title field, from the Description editor field
	document.getElementById("title").focus();

}

function resetReviewDate() {
	document.getElementById("reviewdate").value = "-1";
	document.getElementById("reviewdate_Display").value = "";
	jQuery('#reviewDateMenu').find('span').html(getMessageForKey('sdp.common.notneeded'));
}

function resetExpiryDate() {
	document.getElementById("expirydate").value = "-1";
	document.getElementById("expirydate_Display").value = "";
	jQuery('#expiryDateMenu').find('span').html(getMessageForKey('sdp.common.notneeded'));
}

function setPeriodicCalendarDate(element){
	var days;
	if(element.id == 'threemonths'){
		days = 90;
	}
	else if(element.id == 'sixmonths'){
		days = 180;
	}
	else if(element.id == 'ninemonths'){
		days = 270;
	}
	var oldTime = document.getElementById("reviewdate").value;
	var oldDispTime = document.getElementById("reviewdate_Display").value;

	var currentDate = new Date();
    currentDate.setHours(12,0,0);
    currentDate.setMilliseconds(0);
    currentDate.setDate(currentDate.getDate() + days);

    document.getElementById("reviewdate").value = currentDate.getTime();

    var originalElement = 'reviewdate';compareElement = 'expirydate';errorCondition = '';errorMsg=getMessageForKey("sdp.solution.expiry.review.date.mismatch1");//NO I18N

    if(checkValidDate(originalElement , compareElement, errorMsg , errorCondition)) {
    	document.getElementById("reviewdate").value = currentDate.getTime();
    	displayClientTime('reviewdate');//NO I18N
		jQuery('#reviewDateMenu').find('span').html(document.getElementById('reviewdate_Display').value);
	}
	else {
		document.getElementById("reviewdate").value = oldTime;
		document.getElementById("reviewdate_Display").value = oldDispTime;
		if(oldTime !=null && oldTime != "" && oldTime != "-1") {
			jQuery('#reviewDateMenu').find('span').html(document.getElementById('reviewdate_Display').value);
		}
		else {
			resetReviewDate();
		}
	}
}

function showReviewDateMenuAndCalendar(){
    jQuery('.DashboardTableColor').on('click', function() {
	  if(jQuery("#_CALDIALOG_LAYER").css({'visibility':'visible'})) {
	    jQuery("#ReviewDateDropDown").css({'display':'block'});//NO I18N
	  }
    });
    jQuery('body').on('click', function(evt){
      if(jQuery(evt.target).closest('tr').attr('class') !== 'DashboardTableColor' && jQuery(evt.target).attr('id') !== 'reviewDateMenu'){
          jQuery("#ReviewDateDropDown").css('display','none');//NO I18N
      }
    });

    jQuery('#checkReview').on('click', function(){
    	if(!jQuery(this).hasClass('open')){
     		jQuery("#ReviewDateDropDown").css('display','block');//NO I18N
    	}
	});
}

function showExpiryDateMenuAndCalendar(){
    jQuery('.DashboardTableColor').on('click', function() {
	  if(jQuery("#_CALDIALOG_LAYER").css({'visibility':'visible'})) {
	    jQuery("#ExpiryDateDropDown").css({'display':'block'});//NO I18N
	  }
    });
    jQuery('body').on('click', function(evt){
      if(jQuery(evt.target).closest('tr').attr('class') !== 'DashboardTableColor' && jQuery(evt.target).attr('id') !== 'expiryDateMenu'){
          jQuery("#ExpiryDateDropDown").css('display','none');//NO I18N
      }
    });
    jQuery('#checkExpiry').on('click', function(){
    	if(!jQuery(this).hasClass('open')){
     		jQuery("#ExpiryDateDropDown").css('display','block');//NO I18N
    	}
	});
}

function callSolutionSettings() {

	var dataVars = {};
        dataVars['module'] = "solution";//No I18N
        dataVars['action'] = "getsolutionsettings";//No I18N
        dataVars['from'] = "solutionslistview";//No I18N
        dataVars[getCSRFParamName()] = getCSRFParamValue();

    jQuery.ajax({
        type: "POST",//No I18N
        url: "/servlet/SDAjaxServlet",//No I18N
        data : dataVars,
        contentType : "application/x-www-form-urlencoded; charset=UTF-8"//No I18N
    }).done(function(resdata){
        showSolutionSettings(resdata);
    });
    invokeProgressIndicator(null,'sdp.common.processing'); // No I18N
}

function showSolutionSettings(dataJson) {

    showDialog(jQuery('#solution-settings-div').html(),'title='+getMessageForKey("sdp.common.solution.settings")+', width=500, modal=yes,closeButton=yes, top=10, position=absmiddle');//No I18N

    if(dataJson.SolutionReviewDateReached == 'leaveSolution') {
    	document.getElementById('leaveSolution').checked = true;
    	jQuery('#_DIALOG_CONTENT').find('#leaveSolution').prop('checked',true);//NO I18N
    }
    else if(dataJson.SolutionReviewDateReached == 'moveUnapproved') {
    	document.getElementById('moveUnapproved').checked = true;
    	jQuery('#_DIALOG_CONTENT').find('#moveUnapproved').prop('checked',true);//NO I18N
    }
    else if(dataJson.SolutionReviewDateReached == 'markExpired') {
    	document.getElementById('markExpired').checked = true;
    	jQuery('#_DIALOG_CONTENT').find('#markExpired').prop('checked',true);//NO I18N
    }

}

function saveSolutionSettings() {
	var params = {};
    params.SolutionReviewDateReached = "leaveSolution";//No I18N

	closeDialog();
	if(jQuery('#_DIALOG_CONTENT').find('#moveUnapproved').prop('checked')) {
		params.SolutionReviewDateReached = "moveUnapproved";//No I18N
	}
	else if(jQuery('#_DIALOG_CONTENT').find('#markExpired').prop('checked')) {
		params.SolutionReviewDateReached = "markExpired";//No I18N
	}

	var dataVars = {};
        dataVars['module'] = "solution";//No I18N
        dataVars['action'] = "saveSolutionSettings";//No I18N
        dataVars['from'] = "solutionslistview";//No I18N
        dataVars['solutionsettings'] =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(params) : JSON.stringify(params) ; //NO I18N
        dataVars[getCSRFParamName()] = getCSRFParamValue();

	jQuery.ajax({
        type: "POST",//No I18N
        url: "/servlet/SDAjaxServlet",//No I18N
        data : dataVars,
        contentType : "application/x-www-form-urlencoded; charset=UTF-8"//No I18N
    }).done(function(data){
        if(data.status == "success") {
            showalert('success',getMessageForKey("sdp.solution.settings.save.successmsg"),'isAutoHide=true,delay=3,width=400');//NO I18N
        }
        else if(data.status == "failure"){
            showFailureMessageAndClose(getMessageForKey("sdp.solution.settings.save.failuremsg"), 5000);
        }
    });
}

function callMakeSolutionActive(solutionId) {
	var params = {};
    params.solutionId = solutionId;

    var dataVars = {};
        dataVars['module'] = "solution";//No I18N
        dataVars['action'] = "makeSolutionActive";//No I18N
        dataVars['from'] = "solutionview";//No I18N
        dataVars['solutionId'] =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(params) : JSON.stringify(params) ; //NO I18N
        dataVars[getCSRFParamName()] = getCSRFParamValue();

	jQuery.ajax({
        type: "POST",//No I18N
        url: "/servlet/SDAjaxServlet",//No I18N
        data : dataVars,
        contentType : "application/x-www-form-urlencoded; charset=UTF-8"//No I18N
    }).done(function(data){
        if(data.status == "success") {
            showalert('success',getMessageForKey("sdp.solution.markas.active"),'isAutoHide=true,delay=3,width=400');//NO I18N
            loadSolutionStatusDiv("Unapproved");//NO I18N
            loadSolutionStatusInActions(true, "Unapproved")//NO I18N
        }
        else if(data.status == "failure"){
            showFailureMessageAndClose(getMessageForKey("sdp.solution.settings.save.failuremsg"), 5000);
        }
    });
}

function loadSolutionStatusDiv(statusString) {

	var jQ, userTypeJSvar;
	if (typeof jQuery != 'undefined')
	{
		jQ = jQuery;
		userTypeJSvar = userTypeJS;
		getMessage = getMessageForKey;
	}
	//if this method is called from a dialog box(like approveaction.jsp), where parent.jquery should be used.
	else {
		jQ = parent.jQuery;
		userTypeJSvar = parent.userTypeJS;
		getMessage = parent.getMessageForKey;
	}

	//Making all status divs to display as none.
	jQ("#statusUnapproved").css('display','none');//NO I18N
	jQ("#statusPending").css('display','none');//NO I18N
	jQ("#statusApproved").css('display','none');//NO I18N
	jQ("#statusRejected").css('display','none');//NO I18N
	jQ("#statusExpiry").css('display','none');//NO I18N

	if(userTypeJSvar == "Technician") {
		//To display the respective status.
		if (statusString == "Approved") {
			jQ("#statusApproved").css('display','block');//NO I18N
		} else if (statusString == "Rejected") {//NO I18N
			jQ("#statusRejected").css('display','block');//NO I18N
		} else if (statusString == "Approval Pending") {//NO I18N
			jQ("#statusPending").css('display','block');//NO I18N
		} else if (statusString == "Expired") {//NO I18N
			jQ("#statusExpiry").css('display','block');//NO I18N
		} else {
			jQ("#statusUnapproved").css('display','block');//NO I18N
		}

		//SD-72856 To dispaly the approval status in respective languages
		if (statusString == "Approved") {
                			statusText= getMessage('sdp.solution.status.fullcapital.approved')//NO I18N
                		} else if (statusString == "Rejected") {//NO I18N
                			statusText= getMessage('sdp.solution.status.fullcapital.rejected')//NO I18N
                		} else if (statusString == "Approval Pending") {//NO I18N
                			statusText= getMessage('sdp.solution.status.fullcapital.pendingapproval')//NO I18N
                		} else if (statusString == "Expired") {//NO I18N
                			statusText= getMessage('sdp.solution.status.fullcapital.expired')//NO I18N
                		} else {
                			statusText= getMessage('sdp.solution.status.fullcapital.unapproved')//NO I18N
                		}

        		jQ('#statusInDet').text(statusText);//NO I18N

	}
}

function loadSolutionStatusInActions(isUserHavingModifySolutionsPermission,statusString) {
	if(isUserHavingModifySolutionsPermission) {
		if (statusString == "Expired") {
			jQuery("#markActive").css({'display':'block'});//NO I18N
			jQuery("#markExpired").css({'display':'none'});//NO I18N
		}
		else {
			jQuery("#markExpired").css({'display':'block'});//NO I18N
			jQuery("#markActive").css({'display':'none'});//NO I18N
		}
	}

	if (statusString == "Expired") {
		if(jQuery('#solutionEdit')){
			jQuery('#solutionEdit').hide();
		}
		if(jQuery('#solutionForward')){
			jQuery('#solutionForward').hide();
		}
		if(jQuery('#nav-approveactions')) {
			jQuery('#nav-approveactions').hide();
		}
	}
	else {
		if(jQuery('#solutionEdit')){
			jQuery('#solutionEdit').show();
		}
		if(jQuery('#solutionForward')){
			jQuery('#solutionForward').show();
		}
		if(jQuery('#nav-approveactions')) {
			jQuery('#nav-approveactions').show();
		}
	}

}

function showMarkSolutionExpiry(solutionId) {
	jQuery('#solution-expiry-comments-div').dialog({
		width: 500,
		resizable: true,
		modal: true,
		title: getMessageForKey("sdp.solution.settings.mark.expired"),
		create: function() {
			jQuery(this).parent().find('.ui-dialog-titlebar-close').attr('id','expire_closeDialogbtn')
		}
	});
}

function callMarkSolutionExpiry(){

    if(jQuery('#reviewConfirm').val() == ''){
      jQuery('#reviewConfirm').trigger('focus');
      return;
    }
    else{
    	jQuery('#solution-expiry-comments-div').dialog('close');  //NO I18N

      	var params = {};
	    params.solutionId = jQuery('#exp_sln_id').val();//No I18N
	    params.comments = jQuery('#reviewConfirm').val();//No I18N

		var dataVars = {};
        dataVars['module'] = "solution";//No I18N
        dataVars['action'] = "makeSolutionExpired";//No I18N
        dataVars['from'] = "solutionview";//No I18N
        dataVars['solutionId'] =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(params) : JSON.stringify(params) ; //NO I18N
        dataVars[getCSRFParamName()] = getCSRFParamValue();

        jQuery.ajax({
	        type: "POST",//No I18N
	        url: "/servlet/SDAjaxServlet",//No I18N
	        data : dataVars,
	        contentType : "application/x-www-form-urlencoded; charset=UTF-8"//No I18N
	    }).done(function(data){
	        if(data.status == "success") {
	            showalert('success',getMessageForKey("sdp.solution.markas.expired"),'isAutoHide=true,delay=3');//NO I18N
	            loadSolutionStatusDiv("Expired");//NO I18N
	            loadSolutionStatusInActions(true, "Expired");//NO I18N
	            jQuery('#reviewConfirm').val('')
	        }
	        else if(data.status == "failure"){
	            showFailureMessageAndClose(getMessageForKey("sdp.solution.settings.save.failuremsg"), 5000);
	        }
	    });
    }
}

function kbaseclosepoup(e) {
	/*Popup Close Event in Topic Page e.preventDefault(); for form action stop*/
	e.preventDefault();
	closeDialog();
}
function kbasepopupcall(url, features, callback) {
	/*Popup Event in Topic Page*/
	showURLInDialog(url, features, callback);
}
function leftsolelementhgt(leftid, rightclass) {
	/*Leftnav equal height for rightpanel without listview page*/
	setTimeout(function(){
		if(jQuery(window).height() - jQuery(rightclass).offset().top <= jQuery(rightclass).height()) {
			jQuery(leftid).css('height', (jQuery(rightclass).height() - 20) + "px");// No I18N
			jQuery(rightclass).css('height','');// No I18N
		} else {
			jQuery(leftid).css('height', (jQuery(window).height() - jQuery(leftid).offset().top - 40) + "px");// No I18N
			jQuery(rightclass).css('height', (jQuery(window).height() - jQuery(leftid).offset().top - 20) + "px");// No I18N
		}
		jQuery('html, body').animate({scrollLeft: -1}, 350, function() {
			jQuery(window).trigger('resize');
		});
	},100);
}
/*Solution Leftnav Hide and Show*/
function sollefttg(ishide, state, ev, module) {
	//Issue fix SD-92570
	if(state == 'Open'){
		changeCalendar.calenderViewOnchange(300);
	}
	else{
		changeCalendar.calenderViewOnchange(300);
	}
    if(ev.which == undefined && jQuery('[data-id=solutionleftnav]').hasClass('hide-sidebar')) {
        state = 'Open'; //No I18N
    }
    var url="/jsp/getLeftNav.jsp?LeftNav=" + state; //No I18N
	if (module !== undefined) {
		url += '&module=' + module;// No I18n
	}
    leftstatesollefttg(state);
    if(module==="change" && typeof $rc !== 'undefined' && $rc.moduleName)
	{//tab alignment issue on opening calendar
				$rc.reinitDetailsComponent();
	}
    window.open(url, "SDPHeaderFrame"); //No I18N
     setTimeout(function() {
        jQuery('html, body').animate({scrollLeft: -1}, 350, function() {    //NO I18N 
            if(jQuery(".tableComponent").length != 0) {
                window.adjustWOTableHeight(jQuery(".tableComponent"));  //NO I18N
            }
        });
     }, 50);
}
function leftstatesollefttg(status) {
    if(status == 'Open') {
        jQuery('[data-id=solutionleftnav]').removeClass('hide-sidebar');
    } else {
        jQuery('[data-id=solutionleftnav]').addClass('hide-sidebar');
    }
    if(jQuery('#MiniCalendar').length == 1 && jQuery('[name=ChangeListForm]').length == 1) {/*Change leftpanel calender view hide and show with table height calculation*/
    	changelistview.leftnavhgt();
    }
}
function addNewTopicClosefn(e) {
	e.preventDefault();
	jQuery('#addtopic').dialog('close');  //NO I18N
}
function addNewTopicfn() {
	//showModal('addtopic',480,150,400,false);
	jQuery('#addtopic').dialog({
		width: 480,
		resizable: true,
		modal: true,
		create: function() {
			jQuery(this).parent().find('.ui-dialog-titlebar-close').attr('id','topic_closeDialogbtn')
		},
		open: function(){
			setTimeout(function(){
				initTooltip("#parentTopicID"); //No I18N
			},10)
		}
	});
}
function updateSolutionStatus()
{
	parent.loadSolutionStatusDiv('Unapproved'); //No I18N
}
