/* $Id$ */

/* BroadCast messages starts*/

var $broadcast_mesg = {
	// To get the html content from showBroadCastMessage.html and append it to the header, upon recieving or clicking on a broadcast message notification
	showBroadcastMessage : function(bcm_obj){
		jQuery('#notifList').hide(); //No I18N
		sdpAjax({
			type: 'GET', //NO I18N
			dataType:'html',//NO I18N
			async:false,
			url:'/html/showBroadCastMessage.html?build='+sdp_app.BUILD_NUMBER,//NO I18N
			success:function(result){
				jQuery('#showBroadcastDialog').html(result).focus();
				//To close the bcm dialog box
				jQuery('#bcm-msgclose').on( 'click' , function(){
					notifications.closeBCMDialog();
					jQuery('#bcm-notificationbox').addClass('anim-scalehide' );
				});
			}
		});
		$broadcast_mesg.invokeb_msg(bcm_obj);
	},
	//gets the broadcast and populates the showBroadcastMessage.html page
	invokeb_msg : function(broadCastMsgObj){
		var previousMessages = '';
		if(broadCastMsgObj.message === undefined){ //if user clicks on notification messages
			var bcmId = broadCastMsgObj;
			broadCastMsgObj = $broadcast_mesg.getBroadCastMessage(bcmId);
		}
		else{ //for instant pop-up notifcation for logged in users
			var bcmId = broadCastMsgObj.broadcast_id;
			
				notifyMe(broadCastMsgObj,broadCastMsgObj.broadcast_id,'broad_cast','');  //No I18N
			if(broadCastMsgObj.previousMessages !== undefined){
				previousMessages = broadCastMsgObj.previousMessages;
			}
		}
		var broadCastMsg=broadCastMsgObj.message;
		var created_by=broadCastMsgObj.user.name;
		var created_time=broadCastMsgObj.created_time.display_value;
		var creator_id = broadCastMsgObj.user.id;

		var anchorTag = '<a href="/" id="broadcast_show_notif">' + e_html(created_by) + '</a>'; //NO I18N

		broadCastMsg = broadCastMsg.replace(/\n/g, '<br>');
		broadCastMsg = e_html(broadCastMsg);
		broadCastMsg = broadCastMsg.replace(/&lt;br&gt;/g, '<br>');

		jQuery("#bcm-notificationbox").find('#broadcast_i18n_title').text(translate('broadcast.msg.label')).end()
			.find("#latest_message").find("#messageBody").html(broadCastMsg).end().find("#senderDetails").html(translate('broadcast.sent.label', [anchorTag, created_time])).end();

		jQuery("#bcm-notificationbox").find("#message_list").prepend(previousMessages).end().find("#broad_cast_notif").scrollTop(jQuery("#latest_message").offset().top + 230).end()
			.attr('class','ui-dialog bcm-notification bcm-notificationbox');

		jQuery('#broadcast_show_notif').on("click", function() { //NO I18N
			const url = "/setup/UsersPopup.jsp?isUser=true&viewType=mydetails&userId=" + creator_id; //NO I18N
			const features = "'Sender_Details', '392', '490', 'yes', 'center', '300', '200'";  //NO I18N
			NewWindow(url, features);  
			return false;  
		});
	},

	getBroadCastMessage : function(broadcastMsgId){
		var broadcastMsgObj=null;
		//var broadCastUrl='/api/v3/broadcast_messages/'+broadcastMsgId;//NO I18N
		var broadCastUrl='/servlet/SDAjaxServlet?action=get_broadcast_message&broadcastid='+broadcastMsgId;//NO I18N
		sdpAjax({
			type: 'GET', //NO I18N
			dataType:'json',//NO I18N
			async:false,
			url:broadCastUrl,
			success:function(result){
				broadcastMsgObj=result.broadcast_message;
			}

		});
		return broadcastMsgObj;
	},
	//To add text to the broadcastMessage.html page
	broadcastMessageDialog : function(){
		if(sdp_user.USERTYPE === 'Technician'){
			var fileName="BroadCastMessage.html?build="+sdp_app.BUILD_NUMBER;//NO I18N
			showURLInDialog('/html/'+fileName,'title='+translate('broadcast.msg.label')+',width=420px,modal=yes,position=absmiddle',function(){//NO I18N
			jQuery('#BROADCAST_DIALOG_LAYER').find('#i18n-broadcast-message-label').append(translate('common.message')).end().find('#i18n-broadcast-all-technicians').text(translate('sdp.calendar.alltechs')).end()
				.find('#i18n-broadcast-loggedin-technicians').text(translate('common.loggedtechs')).end().find('#i18n-broadcast-send').text(translate('sdp.common.send')).end().find('#i18n-broadcast-cancel').text(translate('sdp.common.cancel')).end().find("#bcm-textarea").focus();
				$broadcast_mesg.attachBroadcastHandlers();

				setTimeout(function() {
					$broadcast_mesg.callSelect2Function();
				},100); 
			});
		}
	},

	callSelect2Function : function(){

		if(checkIfMSPOrSCP() && !sdp_feature_status.IS_SITE_GROUP_BROADCAST_ENABLED) { // Feature disabled for MSP and SCP
			return;
		}

		if(site_details.is_site_enabled && site_details.active_sites_len > 0){
			jQuery('#site_selection').sdp_select2({
                cache:{},
				placeholder: translate("sdp.request.common.select.site"), // NO I18N
                url:[{
                    url:"/api/v3/broadcast_messages/site",//NO I18N
                    field:'site',//NO I18N
                    list_info:{start_index:1, sort_field:"name",row_count:100} //NO I18N
                }],
				multiple:true,
				closeOnSelect: false
			});
			$broadcast_mesg.loadGroups("", ""); //NO I18N
		}else{
			$broadcast_mesg.loadGroups("['null']", ""); //NO I18N
					}

		var selected_sites_len = 0;
		jQuery("#site_selection").on('change', function(e) {
			var values = jQuery("#site_selection").val().split(",");
			if(values.indexOf("-1") !== "-1") {
				values[values.indexOf("-1")] = "null"; //NO I18N
                }

				if(values.length > selected_sites_len){
					selected_sites_len++;
					var group_data = jQuery("#group_selection").select2("data"); //NO I18N
					$broadcast_mesg.loadGroups(values, group_data);
				}else{
					selected_sites_len--;
					$broadcast_mesg.loadGroups(values, []);
					}
		});
	},

	getSupportGroupName : function(data){
		var support_group_name = "";
		if(data.name){
			support_group_name = data.name;
			if(data.site && data.site !== null){
				support_group_name = support_group_name + ","+data.site.name;
			}
		}
		if(data.text){
			support_group_name = data.text;
		}
		return support_group_name;
	},

	loadGroups : function(values, group_data){
		jQuery('#group_selection').select2("destroy").val("").removeClass("hide").sdp_select2({ //NO I18N
			cache:{},
			placeholder : translate("sdp.request.common.select.supportgroup"),
			multiple:true,
			url:[{
				url:"/api/v3/broadcast_messages/group",//NO I18N
				field:'group',//NO I18N
				list_info:{"start_index":1,"row_count":100,"sort_field":"name","search_criteria":[{"field":"name", "condition":"contains", "logical_operator":"AND", "value":"", "children" : [{"field":"site.id", "values":values, "condition":"in", "logical_operator":"AND"}]}]}//NO I18N
			}],
			closeOnSelect: false,
			processResults: function(search_data, data){
				search_data.push({id:data.id,text:$broadcast_mesg.getSupportGroupName(data)});
			},

			criteriaCallback : function(searchText){
				var search_criteria = [];
				var children = [];
				var values = [];

				var ids = jQuery('#site_selection').val();

				//The above id's line need to be changed.
				ids = ids.split(",");
				if(ids.indexOf("-1") !== "-1") {
				ids[ids.indexOf("-1")] = "null"; //NO I18N
		}
				children.push({
					"field": "site.id",// No I18N
					"values": values,// No I18N
					"condition": "in",// No I18N
					"logical_operator": "AND",// No I18N
					});

				if (searchText) {
					search_criteria.push({
						"field": "name",// No I18N
						"value": searchText,// No I18N
						"logical_operator": "AND",// No I18N
						"condition": "contains",// No I18N
						"children":children // No I18N
					});
				}
				return search_criteria;
	}

		},);
		jQuery("#group_selection").select2("data", group_data); //NO I18N
	},

	sendBrodCastMessg : function(){
		var message = jQuery("#bcm-textarea").val().trim();
		if(message === ''){
			jQuery("#i18n-broadcast-message-empty-error").text(translate('broadcast.msg.empty.error')).css('display', 'block').end(); //NO I18N
				jQuery("#bcm-textarea").on('keyup', function(){
					if(jQuery("#bcm-textarea").val() !== ''){
						jQuery("#i18n-broadcast-message-empty-error").css('display', 'none');//NO I18N
					}
				});
			return;
		}
		var inp_data = {
			"broadcast_message": { // No I18N
				"message": message, // No I18N  
				"type":jQuery("input[name=broadcast_to]").filter(":checked").val() //NO I18N
			}
		};

		var  selected_sites_groups = $broadcast_mesg.getSelectedSitesAndGroups();
		if(selected_sites_groups!=null){
			inp_data.broadcast_message.selected_sites_groups = selected_sites_groups
		}

		sdpAjax({
			url: '/api/v3/broadcast_messages', //No I18N
			type: "POST", //No I18N
			async: false,
			data : {"input_data" :  (typeof sdpToJSON != 'undefined') ? sdpToJSON(inp_data) : JSON.stringify(inp_data) }, //No i18N
			headers: {
				'Accept' : 'application/vnd.manageengine.v3+json'  // No I18N
			}, 

			success:function(response) {
				var api_status = response.response_status.status;
				if(api_status === 'success'){
					closeDialog();
					showalert('success', translate("api.added.success", [translate("broadcast.msg.label")]), "isAutoHide=true"); // No I18N
				}
				else{
					showalert('failure', response.response_status.messages[0].message, "isAutoHide=true"); // No I18N
				}
			},
			error: function (request, textStatus, errorThrown){
				showalert('failure', JSON.parse(request.responseText).response_status.messages[0].message, "isAutoHide=true"); // No I18N
			}
		});
	},

	getSelectedSitesAndGroups : function(){
		var sites = jQuery("#site_selection").val(); // No I18N
		var groups = jQuery("#group_selection").val(); // No I18N
		var obj = {
			groups: groups !== "" ? groups : "-1", //NO I18N
			sites: sites !== "" ? sites : "-1" //NO I18N
		};
		if (obj.groups === "-1") { //NO I18N
            delete obj.groups;
        }
		return (obj.sites !== "-1" || obj.groups !== "-1") ? obj : null;
	}, attachBroadcastHandlers : function() {
            jQuery('#BROADCAST_DIALOG_LAYER').off("click.broadcast").on("click.broadcast", "[data-name='sendBrodCastMessg']", function(){ //NO I18N
                $broadcast_mesg.sendBrodCastMessg();
            }).on("click.broadcast", "[data-name='closeBroadcastDialog']", function(){ //NO I18N
                closeDialog();
            });
    }
};

/* BroadCast messages ends*/

