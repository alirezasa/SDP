var rateLimitListview = {
	/*Function used to load the list view of malicious activities*/
	closeAccessViolationSlider: function() {
		let direction = (sdp_user.DIRECTION == "LTR") ? 'right' : 'left';//NO I18N
		jQuery('#modify_rate_limit_slider .formpopup-preview').animate({
		    [direction] : '-100%'
		}, 200, function() {
		    jQuery('#modify_rate_limit_slider').addClass('hide');
		});
    },
    showThresholdList : function() {
	  	renderhbs('#suspicious-activities', 'throttle-history', {}, false, "throttle", null, null, null, false); // NO I18N
      	jQuery("#throttleHistoryBlock").dialog({
	    	modal: true,
	        draggable: true,
	        width: 1100,
	        height: 650,
	        title: translate("sdp.admin.enable.throttle.exceeds.push.notification.title"),
	      	open: function(){
	       	/* Throttle Exceeding logs listview code starts here */
	        	var table_info = {
	          		"list_info" : {}// NO I18N
	        	}
	
			 	var header_metadata = {
					"url" : {// NO I18N
						"text" : translate("sdp.admin.url.access.violation.url"),// NO I18N
						"width" : "180px",// NO I18N
						"dataCelltransformer" : UrlRTLTransformer// NO I18N
	                },
	                "ip" : {// NO I18N
	                  	"text" : translate("sdp.admin.url.access.violation.ip"),// NO I18N
	                  	"width" : "110px"// NO I18N
	                },
	                "user.name" : {// NO I18N
	                  	"text" : translate("sdp.admin.url.access.violation.user"),// NO I18N
	                  	"width" : "150px"// NO I18N
	                },
	                "operation_time.display_value" : {// NO I18N
	                  	"text" : translate("sdp.admin.url.access.violation.date"),// NO I18N
	                  	"disableSearching" : true,// NO I18N
					  	"width" : "110px"// NO I18N
	                },
					"threshold": {// NO I18N
						"text" : translate("sdp.notification.diskio.header3"),// NO I18N
	                  	"disableSearching" : true,// NO I18N
	                  	"disableSorting": true,//NO I18N
						"width" : "90px"// NO I18N
					},
					"duration": {// NO I18N
						"text" : translate("sdp.throttle.duration.seconds"),// NO I18N
	                  	"disableSearching" : true,// NO I18N
	                  	"disableSorting": true,//NO I18N
						"width" : "110px"// NO I18N
					}
		        }
				
				if (PORTALID && PORTALID>0) {
					header_metadata['integ_key.name']={
						"text" : translate("ads.admin.logon_settings.tfa.duo_authenticator_integration_key"),//NO I18N
						"width" : "150px"// NO I18N
					}
				}
	
	        	var table_content = {
	            	"header" : header_metadata// NO I18N
	          	}
	
	            var options = {
	              	paginationEnabled : true,
	              	sortingEnabled : true,
	              	searchEnabled : true,
	              	entity_name : "throttle_exceeding_histories",// NO I18N
	              	callbackURL : "throttle_exceeding_histories",// NO I18N
	              	callbackRowfunction : rowdataConstruct,
	              	row_inputdata : rowdataConstruct(),
	              	isODAPI : true
	            }
	
	            function rowdataConstruct() {
	              	return {
	                	"list_info" : {// NO I18N
	                  		"sort_field" : "operation_time",// NO I18N
	                  		"sort_order" : "desc"// NO I18N
	                	}
	              	}
	            }
	    
	            function UrlRTLTransformer(td) {
				  	return "<div id='showSuspNotif' class='d_w ' dir='ltr' title="+e_attr(td.row_data.url)+" rel='uitip'><a href=\"/\" data-event=\"click\" data-handler='rateLimitListview.showRateLimitDetails(" + td.row_data.id + ",false,null," + td.row_data.helpdesk_id + ",true);' nonce='" + sdpNonce + "'>"+e_html(td.row_data.url)+"</a></div>"
	            }
	
	       	 	var throttleExceedingLogsTable = new tableComponent(table_info, table_content,options);
			
				$sdEventListener("#showSuspNotif");	//NO I18N
            /* Throttle Exceeding logs listview code ends here */
          	},
          	close: function(){
	            jQuery(this).dialog("destroy");//NO I18N
	            jQuery("#throttle_exceeding_histories_div").find("table").remove();
	      		jQuery("#t_searchicon_throttle_exceeding_histories").empty();
	            jQuery("#pagination_comp_throttle_exceeding_histories").empty();
				rateLimitListview.closeAccessViolationSlider();
	            jQuery("#modify_access_content").empty();
				jQuery("#throttleHistoryBlock").off().remove();
          	}
      	})
    },
	showRateLimitDetails: function(moduleId, isread, id, helpdeskId, fromListView) {
		if(typeof rateLimitDetails === 'undefined') {
			const getScript = (sdp_app.IS_DEVELOPMENT_MODE) ? ["/scripts/rate_limit_details.js"] : ["/scripts/rate_limit_min.js"] ; //NO I18N
          	ResourceLoader({
            	js: getScript,
            	success: function() {
					rateLimitDetails.showSuspiciousNotificationAlert(moduleId, isread, id, helpdeskId, fromListView, false);
            	}
			});
        }
		else {
			rateLimitDetails.showSuspiciousNotificationAlert(moduleId, isread, id, helpdeskId, fromListView, false);
		}
	}
};