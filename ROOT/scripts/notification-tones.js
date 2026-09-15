var $notificationtone = {
    openNotificationTones:function(event,ele)
             {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                   if(jQuery(ele).hasClass("active"))
                   {
                     jQuery("#notificationTones").dialog("close");//No I18N
                     return;
                   }
                   jQuery(ele).addClass("active")
                   var target = jQuery('#profile-slider');
                   jQuery("#notificationTones").show().panelSlider({
                         width: 400,
                         header: false,
                         placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
                         position:{
                                     my: sdp_user.DIRECTION === "RTL" ? "left" : "right", // NO I18N
                                     at: sdp_user.DIRECTION === "RTL" ? "right" : "left", // NO I18N
                                      of : target
                                 },
                         dialogClass: "tabui-rightpanel", // NO I18N
                         modal: false,
                         open:function(){
                            var notificationTone = sdp_user.CLIENT_CONF.notificationTone;
                            var data =[{"id":"notifTonesAnnouncements" ,"key":"sdp.home.announcement.label"},{"id":"notifTonesBroadcast","key":"broadcast.msg.label",},{"id":"notifTonesChat","key":"sdp.dc.dcmenu.tools.chat"},{"id":"notifTonesTechnician","key":"sdp.admin.notificationrules.techNotifications",}];  // NO I18N
                            if(notificationTone)
                          {
                            data[0].tone = notificationTone.GeneralNotifications && notificationTone.GeneralNotifications.Announcement?notificationTone.GeneralNotifications.Announcement:"None"; // NO I18N
                            data[2].tone = notificationTone.chat?notificationTone.chat.new_chat_request:"None"; // NO I18N
                            data[3].tone = notificationTone.DynamicNotifications?notificationTone.DynamicNotifications.notifCount:"None"; // NO I18N
                            data[1].tone = notificationTone.GeneralNotifications && notificationTone.GeneralNotifications.broad_cast_mesg?notificationTone.GeneralNotifications.broad_cast_mesg:"None"; // NO I18N
                          }
                          else
                          {
                            data[0].tone =  data[1].tone =  data[2].tone = data[3].tone = "None";
                          }
                          var is_chat_enabled = sdp_app.IS_SDP_CHAT_ENABLED;
                            if (is_chat_enabled && sdp_user.USERTYPE == "Requester") {
                                is_chat_enabled = sdp_app.IS_CHAT_ENABLED_FOR_USER;
                            }
                            if(!is_chat_enabled)
                            {
                                    data[2]=data[3];
                                    data = data.slice(0,3);
                            }
                            if(sdp_user.ROLES.indexOf("ViewAnnouncements")==-1)
                            {
                                     data = data.slice(1);
                            }
                          renderhbs("#notificationTones", 'notification-tones', data, false, 'notification-tones', true); // NO I18N
                         jQuery("#notificationTones").find(".form-control ").on("change",function(){
                           if(jQuery(this).val()!="None"){
                             jQuery("#"+jQuery(this).attr("id")+"Icon").show();
                           new Audio('/sounds/'+jQuery(this).val()+".mp3").play();// NO I18N
                           }
                            else
                            {
                              jQuery("#"+jQuery(this).attr("id")+"Icon").hide();
                            }
                           });
                            jQuery("#notificationTones").find(".play-normal ").on("click",function(){
                            var tone = jQuery("#"+jQuery(this).attr("for")).val();
                            if(tone!="None"){
                             new Audio('/sounds/'+tone+".mp3").play();// NO I18N
                             }
                             });
                             jQuery("#notificationTones span").hover(function(){
                                 jQuery(this).removeClass("play-normal");
                                 jQuery(this).addClass("play-selected");
                              },function(){
                                jQuery(this).removeClass("play-selected");
                                jQuery(this).addClass("play-normal");
                             }
                            )
                              jQuery("#close-profile-slider").hide();
                         },
                         close:function(){
                            //SD-104151 issuefix
                            jQuery(this).dialog('destroy'); // NO I18N
                            jQuery("#notificationTones").html("");
                            jQuery("#close-profile-slider").show();
                            jQuery(ele).removeClass("active");
                            jQuery(ele).blur();
                         }
                         }).bind("dialogclose",function(e){ // NO I18N
                          jQuery(ele).closest('[role="dialog"]').focus(); // NO I18N
                         });
                        $header.openDialogCheck();
            			},
                        openDialogCheck:function(){
                          if(jQuery("#customize_tabs").hasClass("ui-dialog-content")){
                              jQuery("#customize_tabs").dialog("close");//No I18N
                          }
                        },
                           saveNotificationTones:function()
                           {
                               var chatTone= jQuery("#notifTonesChat").val();
                               var announcementTone =  jQuery("#notifTonesAnnouncements").val();
                               var broadcastTone = jQuery("#notifTonesBroadcast").val();
                               var dyanmicNotificationsTone = jQuery("#notifTonesTechnician").val();
                               var doNotDisturb = jQuery('#dnd:checked').val();
                               var data={};
                               if(chatTone!="None")
                               {
                                   data.chat={"new_chat_request":chatTone,"new_chat_message":chatTone}; //No I18N
                               }
                               if(announcementTone!="None" || broadcastTone!="None")
                               {
                                   data.GeneralNotifications={};
                                   if(announcementTone!="None")
                                   {
                                       data.GeneralNotifications.Announcement = announcementTone;
                                   }
                                   if(broadcastTone!="None")
                                   {
                                       data.GeneralNotifications.broad_cast_mesg=broadcastTone;
                                   }
                               }
                               if(dyanmicNotificationsTone!="None")
                               {
                                   data.DynamicNotifications={};
                                   data.DynamicNotifications.notifCount=dyanmicNotificationsTone;
                               }
                               options = {"is_portalspecific":false}; //No I18N
                               ClientUtil.addUserPersonalization("notificationTone",data);//No I18N
                               sdp_user.CLIENT_CONF.notificationTone = data;
                               window.showalert('success', translate("api.saved.success",[translate("sdp.notification.tones")]), "isAutoHide=true"); // No I18N
                           }
}
