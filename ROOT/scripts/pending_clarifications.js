/* $Id $ */

if(typeof $req === "undefined" || !$req) {
	var $req = {};
	/** when loading th request preview inside iframe, the sdp_user has to be fetched from parent scope */
	if(!window.sdp_user) {
		var sdp_user = parent.sdp_user;
	}
	$req.sdp_user = parent.sdp_user;
	$req.winsize_sm = 1420;	/** Minimum window width limit, upto which the left panel will be hidden by default */
}


$req.approval_clarifications = {


	listRequests : function(wrapper)
	{
		/* * For Listing the requests that has pending clarifications * */		
		var self = this;

        // SD-113480 - Row count is set as 100 to get requests with status pending clarifications
		var data = { "list_info": { "filter_by":{"name":"My_Pending_Clarification"} ,  fields_required:["id","approval_status","subject","created_time","status"] ,"get_total_count" : true, "row_count": 100} } // No I18N


		var url = "/api/v3/requests"; // No I18N
		sdpAjax({
		        url : url,
		        type : "GET", // No I18N
		        data : sdpAjaxInputData(data),
		        success : function(resp)
		        {
		        	if(resp)
		        	{
		        		var theTemplateScript = jQuery("#clarification-requests").html();	//NO I18N
				  		if(resp.requests.length)
				  		{
				  			resp.requests[0].is_active = true;
				  			jQuery("#clarifications-iframe").attr("src","/approval/PendingClarifications.jsp?externalframe=true&&requestId="+resp.requests[0].id);


				  			jQuery("#clarifications-iframe").on("load", function () {
								jQuery("#req-detail-loader").hide();
							});

					  		var popuptitle=$extFrame.getActiveWindow().document.getElementById("pending-request-title");
					  		if(popuptitle)
					  		{
					  			popuptitle.textContent = translate("sdp.approve.needclarification")+" (" +resp.list_info.total_count+ ")";
					  		}
					  		renderhbs(wrapper,"clarification-requests",resp,false,"approval",false, false,function(){ //No I18N
					  		//Call Back for attaching Event Listener to Request List View Elements
					  		    jQuery("#multi-approve-list").off('click').on('click','li', (event) => { //No I18N
                                    const request_id = event.currentTarget.getAttribute('data-action-id');
                                    if(request_id){
                                        self.loadDetails(request_id);
                                    }
                                });
					  		});
				  		}	
				  		else
				  		{
							  $extFrame.getActiveWindow().$previewComponent.closePreview("preview_approval_wrapper");// No I18N
				  		}

		        	}
		        }
		    });	
	},

	toggleLeftPane:function(ele)
	{
		/* * Toggling the left pane for clarifications widdget * */		

		var title = jQuery("#nmi-dialog").hasClass("slidein") ? "View Panel" : "Hide Panel"; //NO I18N
		jQuery("#nmi-dialog").toggleClass("slidein"); //NO I18N
		jQuery("#nmi-dialog").toggleClass("slideout"); //NO I18N

		jQuery(ele).attr('title', title);
	},

	loadDetails : function(request_id)
	{
		/* * Loading a particular request's clarification * */		

		jQuery("#clarifications-iframe").attr("src","/approval/PendingClarifications.jsp?externalframe=true&&requestId="+request_id);

		jQuery("#req-detail-loader").show();

		jQuery("#multi-approve-list li").removeClass("active");
		jQuery("#pending_request_"+request_id).addClass("active");
	}
};