/* $Id$ */

function validateRange(form){
	var fromIndex = form.fromIndex.value;
	var toIndex = form.toIndex.value;
	var totalRecords = form.totalRecords.value;
	fromIndex = trimAll(fromIndex);
	toIndex = trimAll(toIndex);
	if(fromIndex==""){
		window.alert(getMessageForKey("enterfromindex"));
		form.fromIndex.focus();
		return false;
	}
	if(toIndex==""){
		window.alert(getMessageForKey("entertoindex"));
		form.toIndex.focus();
		return false;
	}
	if( !isPositiveInteger(fromIndex) ){
		window.alert(getMessageForKey("invalidfromindex"));
		form.fromIndex.focus();
		return false;
	}
	if( !isPositiveInteger(toIndex) ){
		window.alert(getMessageForKey("invalidtoindex"));
		form.toIndex.focus();
		return false;
	}
	fromIndex = parseInt(fromIndex);
	toIndex = parseInt(toIndex);
	if ( fromIndex == 0 ){
		alert(getMessageForKey("negativefromindex"));
		return false;
	}
	if( fromIndex > toIndex ){
		window.alert(getMessageForKey("frommorethanto"));	
		form.fromIndex.focus();
		return false;
	}
	if( toIndex > totalRecords){
		alert(getMessageForKey("tomorethantotal"));
		return false;
	}
	return true;
}

function validatePage(form){
	pageNumber = form.pageNumber.value;
	totalPages = form.totalPages.value;
	if(!isPositiveInteger(pageNumber)){
		alert("Enter a positive integer for Page");//No I18N
		return false;
	}
	pageNumber = parseInt(pageNumber);
	totalPages = parseInt(totalPages);
	if(pageNumber > totalPages){
		alert("Page number should be less than the TotalPages");//No I18N
		return false;
	}
	if(pageNumber < 1){
		alert("Page number should be greater than 0");//No I18N
		return false;
	}
	return true;
}
