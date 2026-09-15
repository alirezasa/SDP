/* $Id$ */
/*  This file has utility functions required for displaying Change conversation page.
 */
var change_conversation = {
    /**
     * Initializes the conversation component
     */
    loadConversationsForChange: function(){
        var _self = this;
        _self.getStages(_self.base_url).then(function(stagesArray){
            var notificationConfig = {
                module: _self.entity_name +"s",  //No I18N
                module_id: _self.id,
                container: "#conversation_section",  //No I18N
                system_notifications: true,
                expand: {
                    expand_panel: _self.printPreview ? true : false
                },
                selected_filters: ["email"], //No I18N
                lazy_load: true,
                sort: {
                    order: "desc",  //No I18N
                    key: _self.printPreview ? "" : _self.entity_name+"_conv_sort" //No I18N
                },
                show_count: 10,
                row_count: 10,
                allowed_operations: {
                    email: ["reply","forward"]  //No I18N
                },
                emailReply: function(data){

                    var mailConfig = {type: "reply", module: _self.entity_name, module_id: _self.id, sub_module_id: data.conv_id};  // NO I18N
                    mailConfig.afterNotificationSent = function(){
                        $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#conversations"));  // NO I18N
                        _self.$convComp.reinitialize();
                    };
                    mailConfig.imgParameters = {module: _self.entity_name +"_notification", withURL: false, noForm: true};  //No I18N
                    // To be handled commonly when change UI is implemented
                    mailConfig.user_fetch = {url: _self.base_url+ "/" +_self.id + '/' + _self.entity_name + '_requester', lookup_field: _self.entity_name + '_requester', search_keys: ['email_id']}; //No I18N
                    $notification_popup.openNotificationForm(mailConfig);
                },
                emailForward: function(data){
                    var mailConfig = {type: "forward", module: _self.entity_name, module_id: _self.id, sub_module_id: data.conv_id};    // NO I18N
                    mailConfig.afterNotificationSent = function(){
                        $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#conversations"));  // NO I18N
                        _self.$convComp.reinitialize();
                    };
                    mailConfig.imgParameters = {module: _self.entity_name +"_notification", withURL: false, noForm: true};  //No I18N
                    // To be handled commonly when change UI is implemented
                    mailConfig.user_fetch = {url: _self.base_url+ "/" +_self.id + '/' + _self.entity_name + '_requester', lookup_field: _self.entity_name + '_requester', search_keys: ['email_id']}; //No I18N

                    $notification_popup.openNotificationForm(mailConfig);
                },
                stages: stagesArray,
                disableStage: !_self.stagePermissions["global"].edit ? true : false,
                enable_mention: sdp_user.USERTYPE == "Requester" ? false : true,    //No I18N
                mention_options: {autoCheck: false, users: {show: true, href: _self.base_url+"/"+_self.id+"/"+_self.entity_name+"_requester", lookup_entity: _self.entity_name+"_requester"}},
                preview_mode: _self.printPreview || _self.isTrashed,
                afterLoadConversations: function(){
                    jQuery(this.container).find('#conv_title').html(translate("common.filter"));
                }
            };
            if(_self.printPreview){
                notificationConfig.afterLoadConversations = function(){
                    jQuery(notificationConfig.container).find('[data-id="toggle-conv"],[data-id="sort"]').addClass("hide");
                }
            }
            _self.$convComp = new Conversation(notificationConfig);
        });
    },
}