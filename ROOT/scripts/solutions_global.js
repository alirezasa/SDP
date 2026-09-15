/* $Id$ */
$SolGlobal = {
     /** To construct a solution status */
            constructStatus: function(table_data){
              var rd = table_data.row_data;
              var status_colors = {
                "Approved": "#3c9405", //No I18N
                "UnApproved": "#faaa3e", //No I18N
                "Rejected": "#ec1923", //No I18N
                "Expired": "#cb0013", //No I18N
                "Approval Pending": "#d0d0d0" //No I18N
              };
              var status_name = rd.approval_status.name;
              var status_clr = status_colors[status_name] || "#000000"; //No I18N
              var status = status_name.charAt(0).toUpperCase() + status_name.toLowerCase().substr(1);
              return  '<div class="disp-flex valign-center">'+
                          '<span class="arrowBG mr5 shrink0" style="background:'+status_clr+'" title="'+e_attr(status)+'" rel="uitip"></span>'+
                          '<span class="text-overflow">'+ZSEC.Encoder.encodeForHTML(status)+'</span>'+
                      '</div>'; //No I18N
            },

            /** To construct a solution Visibility */
            constructVisibility: function(table_data){
                var rd = table_data.row_data;
                var title = translate("sdp.solution.listview.privatesolutions");//No I18N
                var iconclass = "lock-line-clr"; //No I18N
                var text = translate("sdp.dashboard.common.private")
                if(rd.is_public){
                    text = translate("sdp.dashboard.common.public")
                    title = translate("sdp.solution.listview.publicsolutions"); //No I18N
                    iconclass = "public-filter"; //No I18N
                }
                return  '<div class="disp-flex valign-center">'+
                            '<span class="cspr icon-sm '+iconclass+' mr3 shrink0 top0" rel="uitip" title="'+e_attr(title)+'"></span>'+
                            '<span class="text-overflow">'+ZSEC.Encoder.encodeForHTML(text)+'</span>'+
                        '</div>';
            },
            advancesearch_preview: function(criteria){

            var _self = this;
            var header_metadata = {
                   "id" : { // No I18N
                     "display_name": translate("sdp.common.id"), //No I18N
                      "width" : "120px", // No I18N

                    },
                   "title":{ // No I18N
                     "display_name": translate("common.title"), //No I18N
                     "width" : "150px", // No I18N


                   },
                   "topic": { //No I18N
                       "display_name":translate("sdp.solutions.newsolution.topic"), //No I18N
                       "value_path":"topic.name",// No I18N
                       "width" : "150px", // No I18N


                   },
                   "approval_status" : { //No I18N
                         "display_name" : translate("sdp.approve.apprstatus"), // No I18N
                         "value_path" : "approval_status.name",// No I18N
                         "dataCelltransformer": _self.constructStatus // No I18N


                   },
                   "is_public" : { // No I18N
                         "display_name" : translate("ae.cmdb.relationshipmap.visibility"), // No I18N
                         "value_path":"is_public", // No I18N
                         "searchable" : false, // No I18N
                         "dataCelltransformer": _self.constructVisibility //No i18N
                   },
                   "no_of_hits" :{ // No I18N
                        "display_name" : translate("sdp.common.views"), // No I18N

                   },
                   "created_time":{ // No I18N
                         "display_name":translate("sdp.solutions.newsolution.createdon"), // No I18N
                         "value_path":"created_time.display_value", // No I18N
                         "searchable" : false,// No I18N
                   },
                   "last_updated_time":{ // No I18N
                         "display_name":translate("sdp.solutions.newsolution.updatedon"), // No I18N
                         "value_path":"last_updated_time.display_value", // No I18N
                   }

                 };
                 var current_view = Object.assign({}, sdp_user.CLIENT_CONF.solutions_currentview);
                 var table_info = {"list_info" : {"start_index" : "1", "end_index" : "2"}};    //No I18N
                 var table_content = {"header" : header_metadata };   //No I18N

                 var options = {
                     entity_name      : "solutions",     //No I18N
                     tableHolder       : "solutions",   // No I18N
                     callbackURL      : "solutions",   // No I18N
                     isODAPI : true,
                     paginationEnabled : true,
                     sortingEnabled : true,
                     staticHeader: true,
                     height: _self.setHeight(),
                     width: 'auto', // No I18N
                     searchEnabled : true,
                     view: "table", //No I18N
                     view_mode: "linear", //No I18N
                     nodataString : '<div class="tc p15"><span>'+ translate('sdp.solution.listview.not.available')+'</span></div>',  //No I18N
                     row_inputdata : {
                                     list_info: {
                                         get_total_count: true,
                                         search_criteria: criteria
                                     },
                                     "for":"list_view_filter"//No I18N
                                 },
                 }

                 _self.customView_tableObj=new tableComponent(table_info,table_content,options);
                 _self.resizeTable();
                },
            /** Set tablecomponent height */
            setHeight: function(){
				var height;
                var listview_height = (typeof $sol!=='undefined' && (typeof $sol.list!=='undefined') && $sol.list.current_view_mode=='linear')?73:111//No I18N
                var current_view=sdp_user.CLIENT_CONF.solutions_currentview;
                var isTrash = (current_view && current_view.filter_by && current_view.filter_by.name && current_view.filter_by.name == 'trash') || (typeof $SolObj!=='undefined' && $SolObj.deletedTopicID) ? true : false;
                var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0; //No I18N
                jQuery('#header-placeholder').length == 0 ? height = (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height - 80) : height = (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - listview_height);//No I18N
                return (isTrash ? height-65 : height-15);
            },
             //This function is used to popular search in requester home page
                checkAndSearch : function(){
                    var input = document.getElementById("solnsrch");
                    input.addEventListener("keypress", function(event) {
                        if (event.keyCode === 13) {
                            if(input.value != ''){
                                var url = "/ui/solutions?mode=list&gsearch="+encodeURIComponent(input.value)+"&isPopular=true";//No I18N
                                window.externalframe ? window.open(url, '_blank', 'noopener,noreferrer') : window.open(url, '_self', 'noopener'); //incase of external frame open in new window else load in same window
                            }
                        }
                    });
                },
             resizeTable: function(){
                var resizeTimeoutWO;
                       jQuery(window).off('resize.sol_resize').on('resize.sol_resize', function() {    //No I18N
                           clearTimeout(resizeTimeoutWO);
                           resizeTimeoutWO = setTimeout(function() {
                               $SolGlobal && $SolGlobal.resizeTableHeightWidth();
                           }, 400);
                       });
             },
             resizeTableHeightWidth:function(){
                var _self = this;
                setTimeout(function(){
                    var chatbar_height = jQuery("#sdp-chat-bar").is(":visible") ? jQuery("#sdp-chat-bar").height() : 0, // No I18N
                        jqB = jQuery('body').attr('data-header-tabs'),
                        jqSCWidth = jQuery('.sidebar-container').width(); //No I18N
                    if(jqB == 'sidebar' || jqB == 'sidebarlite'){
                        treeWidth = treeWidth - jqSCWidth;
                    }
                    _self.customView_tableObj.setTableHeight(jQuery('#header-placeholder').length == 0 ? (jQuery(window).height() - (jQuery('#top-header').height() || 0) - chatbar_height- 80) : (jQuery(window).height() - jQuery('#header-placeholder').height() - chatbar_height - 80));
                }, 500);
             },

             /*This function is used to avoid multiple click getting triggered
               The button will be disabled for success response,enabled for error response
             */
             multipleClickAvoid : function(event,isDisable){
                 if(event && event.detail && event.detail != 1) {
                     return;
                 }
                 var submitBtn = {};
                 if(event && event.target) {
                     submitBtn = event.target;
                     submitBtn.disabled = isDisable;
                 }
             },
           constructSubTopicDropdown : function(topic){
                 var _self= this;
                 if(topic.children == null){
                     return _self.constructTopicDropdown(topic);
                 }
                 topic = _self.constructTopicDropdown(topic);
                 for (var i = 0; i < topic.children.length; i++) {
                     topic.children[i] = _self.constructSubTopicDropdown(topic.children[i]);
                 }
                 return topic;
             },
            //This function is used to construct a topics select2 data for dropdown
             constructTopicDropdown : function(tp){
                 var topicObj = {
                     id: tp.id,
                     text: tp.name,
                     children:tp.children!=null ? tp.children : []
                 };
                 return topicObj;
             }



}
