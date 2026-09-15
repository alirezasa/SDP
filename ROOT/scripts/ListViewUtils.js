/* $Id$ */

// this will remove the numeric search in the listview column..
function remListViewNumericCheck(str,list){
	if(!str){
		return;	
	}
	var baseTable = parent.document.getElementById(str);
	if(!baseTable){
		return;
	}
	for(var i=0;i<list.length;i++){
		// this code is not working in IE..
		//if(baseTable.getElementsBySelector('[id="'+list[i]+'"]')!=""){
		//	(baseTable.getElementsBySelector('[id="'+list[i]+'"]')[0]).removeAttribute('validatemethod'); //NO I18N
		//}
		if(($(str).getElementsBySelector('[id="'+list[i]+'"]'))!=""){

			 ($(str).getElementsBySelector('[id="'+list[i]+'"]')[0] ).removeAttribute('validatemethod') ;
		}
                
                //MICKEY2LITE:new mc components are given with id of format "<columnname>+txt". hence the following check is required.
                var str1 = str.substring(0,str.indexOf("_TABLE")+1);
                if(($(str).getElementsBySelector('[id="'+str1+list[i]+'txt"]'))!=""){

			 ($(str).getElementsBySelector('[id="'+str1+list[i]+'txt"]')[0] ).removeAttribute('validatemethod') ;
		}
	}
}

var isexecuteOnLoadCalled = false;

function executeCustomPropScripts(viewName,customProps){

	backupViewName = viewName;

	if( backupViewName.indexOf("_HD_") >= 0 )
	{
		backupViewName = backupViewName.split("_HD_")[0];
	}

	constructprojlistheader(viewName);

	if( jQuery('#_DIALOG_LAYER #'+viewName+'_TABLE').length != 0 ){
	
		//hiding column chooser in the pop-up dialog lists to avoid the parent pop-up closed when the column chooser is clicked..

		if( jQuery('#_DIALOG_LAYER #'+viewName+'_CCBtn').length != 0 ){
			
			jQuery('#_DIALOG_LAYER #'+viewName+'_CCBtn').addClass('hide');
		}
	}

    if(viewName.indexOf("ProjectMembersListView") != -1){	//No I18N

		constructprojeditcell();
	
	}else if( viewName.indexOf("ShowTaskDetails") != -1 ){	//No I18N
	
		constructprojeditcell();
		loadHighlightParentTasksScripts();
		loadMarkedIconTooltip();

	}else if( viewName.indexOf("ShowTaskTemplate") != -1 || viewName.indexOf("ShowTaskTemplateLV") != -1 ){	//No I18N

		loadMarkedIconTooltip(true);

	} else if( viewName.indexOf("SolutionsListView") != -1 || viewName.indexOf("SDSolutionsListView") != -1){	//No I18N
	
		hideNavigationControls();
	}
	else if( viewName.indexOf("CFChangesList") != -1 ){	//No I18N
	
		setChangePreviewEvent();
	}

	if(parent.jQuery('#'+backupViewName+'_CC_TABLE')[0] != null && parent.jQuery('#'+backupViewName+'_CC_EMPTY')[0] != null){
		var totalCount = parent.jQuery('#'+backupViewName+'_NAV').find('#totalRecordsCount').html();

		if(totalCount == '0' && ( parent.jQuery('#'+backupViewName+'_CC_TABLE').find('.searchRow').hasClass('hide') ) ){

			parent.jQuery('#'+backupViewName+'_CC_TABLE').attr('class','hide');
			parent.jQuery('#'+backupViewName+'_CC_EMPTY').attr('class','show');
		} 
		var minLength = parent.jQuery('#'+backupViewName+'_NAV').find("select[name='pageLength']")[0].options[0].value

	   	if( parseInt( minLength ) >= parseInt( totalCount ) ){

			parent.jQuery('#'+backupViewName+'_NAV').attr('class','hide');

			if( parent.jQuery('#'+viewName+'_RowCount')[0] != null){
				parent.jQuery('#'+viewName+'_RowCount').attr('class','ui-list-count1 fl pt5');
				parent.jQuery('#'+viewName+'_RowCount').html( getMessageForKey('sdp.requests.workorder.rowcount')+' : '+totalCount);
			}else{
				parent.jQuery('#'+backupViewName+'_NAV').parent().append('<span class="ui-list-count1 fl pt5" id="'+viewName+'_RowCount" >'+getMessageForKey('sdp.requests.workorder.rowcount')+' : '+totalCount+' </span>');
			}
	   	}else{
			parent.jQuery('#'+backupViewName+'_NAV').attr('class','show');
			parent.jQuery('#'+viewName+'_RowCount').attr('class','hide');
		}
	}
}

function constructprojlistheader(viewName)
{
	if( jQuery('#ui-framework-design1 #'+viewName+'_TABLE').length != 0 )
	{
      		jQuery('.countfilter').countercomboUI();
		jQuery('#ui-framework-design1 #'+viewName+'_TABLE').attr('cellspacing',0).find('th').wrapInner('<span class="inner" />');
	}
}
function constructprojeditcell()
{
		jQuery('#ui-framework-design1 .tableComponent tr').on('mouseover', function(){
			roleHighlightON(this);
 		}).on('mouseout', function(){
			roleHighlightOFF(this);
		});
		jQuery('#TaskGroupTechLayer').on('mouseover', function(e){
			e.stopPropagation();
		});
}
function roleHighlightON(row)
{
	//jQuery(row).addClass('roleh');
	
	if(jQuery(row).find('[type=editcell]').length != 0 && jQuery(row).find('[type=editcell]').closest('td').find('.ui-cancelicon').length==0){
    	
		jQuery(row).find('[type=editcell]').closest('td').addClass('editon');	//No I18N
	}

}
function roleHighlightOFF(row)
{
    jQuery(row).find('[type=editcell]').closest('td').removeClass('editon');	//No I18N
}
function rowHighlightON(row)
{
	jQuery(row).attr('class','hover');
    var len=row.getElementsByTagName('td');
    for(i=0;i<len.length;i++)
    {
	jQuery(len[i]).attr("class",len[i].className.replace(/listNormal/gi,'listHover'));
	jQuery(len[i]).attr("style","");
    }

}
function rowHighlightOFF(row)
{
	jQuery(row).attr('class','normal');
    var len=row.getElementsByTagName('td');
    for(i=0;i<len.length;i++)
    {
	jQuery(len[i]).attr("class",len[i].className.replace(/listHover/gi,'listNormal'));
	jQuery(len[i]).attr("style","");
    }
}  
    
function hideNavigationControls()
{
	if(document.getElementsByClassName('pagenav-lastpage-off')[0] !== undefined)
	{	
		document.getElementsByClassName('pagenav-lastpage-off')[0].className="hide";
	}
	if(document.getElementsByClassName('pagenav-first-off')[0]!==undefined)
	{	
		document.getElementsByClassName('pagenav-first-off')[0].className="hide";
	}
	if(document.getElementsByClassName('pagenav-first')[0] !== undefined)
	{	
		document.getElementsByClassName('pagenav-first')[0].className="hide";
	}
	if(document.getElementsByClassName('pagenav-lastpage')[0]!==undefined)
	{	
		document.getElementsByClassName('pagenav-lastpage')[0].className="hide";
	}
	if(document.getElementsByClassName('fontGray57')[0]!==undefined)
	{	
		document.getElementsByClassName('fontGray57')[0].className="hide";
	}
	
	document.getElementsByClassName('seph')[1].className="hide";
	document.getElementsByClassName('seph')[0].className="hide";
}



