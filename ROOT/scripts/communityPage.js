/* $Id$ */


/* Community page script starts here */

	jQuery(document).ready(function(){
		com_resize();
		jQuery(window).on('resize', function(){
		com_resize();
	});
	
	  
	jQuery.ajax({
		url: '/Support.do?method=getCommunityPage', // No I18N
        type: 'GET', // No I18N
        dataType: "text", // No I18N
        success: function(responseJson)
        {
			var json_data = JSON.parse(responseJson)
			
			if(json_data.Error != null){
				showalert('failure',json_data.Error,'isAutoHide=false');	// No I18N
				jQuery('#iframe-forum-msg').hide();
				return false;
			}
			
			var a ="", b = "", c = "";
			
			//insert telephone number in the title
			if(json_data.contact != null){
				var title = "<i class='comspr icon-lg mr10 fl "+json_data.contact.icon_class+"'></i><div class='fl' title='"+json_data.contact.description+"'><h5>"+json_data.contact.url+"</h5></div>";
				jQuery('#community-contact-number div').append(title);
				jQuery('#community-contact-number').after('<p class="separatorbordr mtop6 mb5"></p>');
				jQuery('#community-contact-number').show();
			}
			
			
			if(json_data.issues_features_support != null){
				jQuery.each(json_data.issues_features_support.links, function(key, value) {		  
				a =  a + "<div class='community-iconrow'><a href=\""+value.url+"\"  target='_blank' id="+value.id+" title='"+value.description+"'><i class='comspr icon-lg mr10 fl "+value.icon_class+"'></i>"+value.name+"</a></div>";
				});
				
				//jQuery('.communty-leftsectn div.sidebar-links1').before('<p class="separatorbordr mtop6 mb5"></p>');
				jQuery('.communty-leftsectn div.sidebar-links1').append(a);
				jQuery('.communty-leftsectn div.sidebar-links1').after('<p class="separatorbordr mb5"></p>');
			}
			
			if(json_data.debug_support != null){
				jQuery.each(json_data.debug_support.links, function(key, value) {
				b =  b + "<div class='community-iconrow'><a href=\""+value.url+"\" id="+value.id+" title='"+value.description+"'><i class='comspr icon-lg mr10 fl "+value.icon_class+"'></i>"+value.name+"</a></div>";
				});
				
				jQuery('.communty-leftsectn div.sidebar-links2').append(b);
				//jQuery('.communty-leftsectn div.sidebar-links2').before('<p class="separatorbordr mb5"></p>');
				jQuery('.communty-leftsectn div.sidebar-links2').after('<p class="separatorbordr mb5"></p>');
			}	
		
			if(json_data.application_status_check != null){
				jQuery.each(json_data.application_status_check.links, function(key, value) {
				c =  c + "<div class='community-iconrow'><a class='community-forumlink' href=\""+value.url+"\"  target='_blank' id="+value.id+">"+value.name+"</a></div>";
				});				
				
				jQuery('.communty-leftsectn div.sidebar-links3').before('<div class="community-status-check mb5">'+json_data.application_status_check.name+'</div> ');
				jQuery('.communty-leftsectn div.sidebar-links3').append(c);
			}
			
			if(json_data.buildInfo != null){
				var your_version = '<td>'+getMessageForKey('sdp.about.version')+' </td>';
				var product_version = '<b>'+json_data.buildInfo.product_version+'</b>';
				var build_no = '<b>'+json_data.buildInfo.build_no+'</b>';
				var td = your_version+'<td> : '+product_version+ ' ' +getMessageForKey('sdp.about.build') + ' ' +build_no+'</td>';
				jQuery('#build-info tr:first-child').append(td);
				
				//jQuery('#build-info tr:first-child').html(': <b>'+json_data.buildInfo.product_version+'</b>'+jQuery('#build-info tr:first-child td:nth-child(2)').html()+' <b>'+json_data.buildInfo.build_no+'</b>');
				jQuery('#build-info h4').text(json_data.buildInfo.name);
				//http://manageengine.com/products/service-desk/scripts/SDPDetails.js
				jQuery('#build-info').show();
			}

			//changing target attribute for links which opens in new window
			jQuery('#report_an_issue,#table_data_count,#scheduled_activities,#serverlog_threaddump_parser').attr({target: '_self'});
			
			//insert forum loading text
			if(json_data.forum != null){
				jQuery('#iframe-forum-msg h5').text(json_data.forum.loading_text);
				//insert forum_url
				jQuery('#forum-iframe').attr({src: json_data.forum.url});
				jQuery('#forum-iframe').on('load',function(){
					jQuery('#iframe-forum-msg').hide();
					jQuery(this).show();
				});
			}else{
				jQuery('#iframe-forum-msg').hide();
			}
			
	
		},
		error: function(responseJson){
			var errorMsg = getMessageForKey('sdp.community.failed');
			showalert('failure',errorMsg,'isAutoHide=false');	// No I18N
			jQuery('#iframe-forum-msg').hide();
		}
	});
});

function com_resize(){
	var wh = jQuery(window).height();
    t = jQuery('.communty-leftsectn').offset().top;

    r = wh-(t+30);

	jQuery('.communty-leftsectn .scroll-wrap').height(r-50);  
  	jQuery('.communty-rightsectn .scroll-wrap').height(r+20-50);
}

/* Community page script ends here */
