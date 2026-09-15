/* $Id $ */

/* PARTIALS NEEDED FOR THE HANDLEBAR TEMPLATES ARE AVAILABLE HERE*/


/*
*	Show more/less toggle feature for email to/cc
*	@param - 'arr' - Email to/cc array.
* 	Usage: {{> showMore arr=to show_len=4 el_id="element-id"}} where ( to -> ["abc@xyz.com", "test@123.co", "admin@test.com"] ) and 3 -> minimum no of email ids shown by default
*/
Handlebars.registerPartial('showMore', function(context){	//No I18N
	var arr = context.arr;
	var show_len = context.show_len;
	var el_id = context.el_id;
	var el_class = context.el_class;
	var min_content = '<span>';	//No I18N
	var showMoreBtn = '';	//No I18N
	var more_val_content = '';	//No I18N
	var showLessBtn = '';	//No I18N
	var arr_len = arr.length; 

	if(arr_len > show_len) {
		showMoreBtn = '<span class="show-more show-more-partial"><button type="button" class="btn btn-link txt-dec-none-i p0 cur-ptr">' + window.translate("sdp.common.morewithlimit",[(arr_len - show_len)]) + '</button></span>';	//No I18N
		more_val_content = '<span class="more-values hide">';	//No I18N
		showLessBtn = '<span class="ml10 show-less hide show-less-partial"><button type="button" class="btn btn-link txt-dec-none-i p0 cur-ptr">' + window.translate('sdp.common.showless') + '</button></span>';	//No I18N
	}
	jQuery(document).off('click', '.show-more-partial button').on('click', '.show-more-partial button', function() {	//No I18N
		var $par = jQuery(this).parent();
		$par.addClass('hide');	//No I18N
		$par.parent().find('.more-values').removeClass('hide');	//No I18N
		$par.parent().find('.show-less').removeClass('hide');	//No I18N
	});
	jQuery(document).off('click', '.show-less-partial button').on('click', '.show-less-partial button', function() {	//No I18N
		var $par = jQuery(this).parent();
		$par.addClass('hide');	//No I18N
		$par.parent().find('.more-values').addClass('hide');	//No I18N
		$par.parent().find('.show-more').removeClass('hide');	//No I18N
	});
	jQuery.each(arr, function(index, content) {
		if(index < show_len) {
			content && (content.hasOwnProperty("email_id") ? min_content += content.email_id : min_content += content);	//No I18N
			if(index < arr_len-1) {
				min_content += ', ';	//No I18N
			}
		} else {
			content && (content.hasOwnProperty("email_id") ? more_val_content += content.email_id : more_val_content += content);	//No I18N
			if(index < arr_len-1) {
				more_val_content += ', ';	//No I18N
			}
		}
	});
	min_content += '</span>';	//No I18N
	if(arr_len > show_len) {
		more_val_content += '</span>';	//No I18N
	}
	var container = '<span';	//No I18N
	if(el_id) {
		container += ' id="' + el_id + '"';	//No I18N
	}
	if(el_class) {
		container += ' class="' + el_class + '"';	//No I18N
	}
	container += '>' + min_content + showMoreBtn + more_val_content + showLessBtn + '</span>';	//No I18N
	return container;
});
