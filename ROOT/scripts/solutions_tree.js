/* $Id$ */
/**
 * jstree node customization addon plugin start here
 */
 jQuery.jstree.defaults.node_customize = {
    "key": "type", //No I18N
    "switch": {}, //No I18N
    "default": null //No I18N
};
jQuery.jstree.defaults.core.force_text=true;
jQuery.jstree.plugins.node_customize = function (options, parent) {
    this.redraw_node = function (obj, deep, callback, force_draw) {
        var node_id = typeof obj === "object" ? obj.id: obj; //No I18N
        var el = parent.redraw_node.apply(this, arguments);
        if (el) {
            var node = this._model.data[node_id];
            var cfg = this.settings.node_customize;
            var key = cfg.key;
            var type =  (node && node.original && node.original[key]);
            var customizer = (type && cfg["switch"][type]) || cfg["default"];
            if(customizer)
                customizer(el, node);
        }
        return el;
    };
}
/** ends here */

$sol.tree = {
    all_topics: [],
    active_topics:[],
    formated_topics: [],
    parentIds: [],
    topics_info: {
        start_index: 1,
        has_more: false,
    },
    /** initialization and getting the topics tree datas */
    initTopicTree: function () {
        //TODO loader for tree
        this.getAllTopics();
        document.getElementsByTagName('body')[0].classList.add('sol-context-menu'); //No I18N
    },
    /** render the solution topic tree */
    renderTopics: function (options) {
        var _self = this;
        //Exclude inactive topics for requester and move solution to topic popup
        var personalize = sdp_user.CLIENT_CONF.solutions_currentview;
        var showActiveTopics=(options && options.treeSelector == "sol_move_tree") || sdp_user.USERTYPE === "Requester" || (personalize && personalize.includeTrashedTopic==false)? true : false;//No I18N
        _self.treeData= showActiveTopics ?_self.active_topics : _self.all_topics;
        _self.treeView.options = {
            treeSelector: "solution_tree", //No I18N
            customizeNodeCB: _self.constructNodeHtml,
            actions: {
                createCB: _self.solTreeActions.create,
                renameCB: _self.solTreeActions.rename,
                deleteCB: _self.solTreeActions.operation_delete,
                restoreCB: _self.solTreeActions.restore_topics,
                moveCB: _self.solTreeActions.move,
            }
        }
        jQuery.extend(_self.treeView.options, options);
        _self.treeView.tree_data = _self.treeData;
        _self.treeView.initTreeView();
    },

    /** fetching the topics tree */
    getAllTopics: function (cb) {
        var _self = this;

        var current_view = sdp_user.CLIENT_CONF.solutions_currentview;
        var current_topic=$SolObj.deletedTopicID ? $SolObj.deletedTopicID : (current_view && (current_view.topicID)) ? current_view.topicID : null;

        if(current_topic){
            jQuery('[data-sol-listaction="all_solutions"]').removeClass('text-primary');
        }
        var input_data={"include_inactive_value" : true}//No I18N
        _self.all_topics = [];
        sdpAjax({
            type: "GET", //No I18N
            url: "/api/v3/topics/_get_topic_tree", //No I18N
            data: sdpAjaxInputData(input_data),
            async : false,
            success: function (resp) {
                var topics = resp.topics;
                  topics.forEach(function(topic){
                    var topicObj=_self.constructSubTopicData(topic);
                    _self.all_topics.push(topicObj);
                  })
                $sol.tree.active_topics=_self.constructActiveTopics(_self.all_topics);
                if(typeof cb === "function"){
                    cb();
                }else{
                    _self.renderTopics();
                }
            }
        });
    },
    /** construct the node in the topics tree */
    constructNodeHtml: function(el, node){
        var html = "";
        var html_class = "";

        if(node){
            html_class= (node.original.isdeleted && sdp_user.USERTYPE!='Requester') ? "opac6" : html_class;//No I18N
            if($SolObj.getPermissions().edit || $SolObj.getPermissions().delete){
                html = "<div class='disp-t fw vtop'><div class='disp-c "+html_class+"'><span>"+e_html(node.text)+"</span></div><div class='disp-c pos-rel vtop minw-30px'><button class='disp-ib fr btn btn-link btn-sm nodesettings' data-topic-actions data-topic-id="+node.a_attr.id+" rel='uitip' title='"+translate("sdp.solution.topic.actions")+"'"+"><span class='cspr menulist icon-xs flat top0'></span></button><span class='nodecount disp-ib fr text-overflow'> "+(node.original.count > 0 ? node.original.count : "")+" </span></div></div>";
            }
            else{
                html = "<div class='disp-t fw vtop'><div class='disp-c "+html_class+"'><span>"+e_html(node.text)+"</span></div><div class='disp-c pos-rel vtop minw-30px'><span class='nodecount disp-ib fr text-overflow'> "+(node.original.count > 0 ? node.original.count : "")+" </span></div></div>";
            }
            jQuery(el).find("#"+node.a_attr.id).html(html);
        }
    },
    /** Topics tree actions */
    solTreeActions: {
        /** To create a Topic */
        create: function(tree, data){
            var tpname = data.text;
            if(tpname.length <= 50){
                var parent= data.node.parent || null;
                var input_data = {"topic": {"name": tpname}}; //No I18N
                if(parent && parent != "#"){
                    input_data.topic.parent = {"id": parent} //No I18N
                }
                $sol.tree.ajaxTpCall(input_data).then(function(resp){
                    showalert("success", translate('api.added.success',[translate('sdp.solutions.search.fields.topic')]), "isAutoHide=true, delay=2"); //No I18N
                    $sol.tree.refreshTree(function(){
                        jQuery('#solution_tree').animate({
                            scrollTop: jQuery("[data-tree-id='"+resp.topic.id+"']").offset().top - jQuery('#solution_tree').offset().top + jQuery('#solution_tree').scrollTop()
                        }, 500);
                        jQuery('#solution_tree').jstree("hover_node",resp.topic.id ); //No I18N
                        setTimeout(function(){
                            jQuery('#solution_tree').find("#310_anchor").removeClass("jstree-hovered"); //No I18N
                        }, 1000);
                    });
                       if($sol.list.tempGsearch){
                          $sol.tree.removeGsearch();
                       }
                }).fail(function(resp){
                    var node = jQuery('#' + data.node.id);
                    tree.delete_node(node);
                    if($sol.list.tempGsearch){
                      $sol.tree.removeGsearch();
                   }
                });
            }
            else{
                var node = jQuery('#' + data.node.id);
                tree.delete_node(node);
                showalert("failure", translate("sdp.api.security.exception.value.toolong"), "isAutoHide=true, delay=2"); //No I18N
            }
        },
         /** To rename a Topic */
        rename: function(tree, data){
            var tpname = data.text;
            var oldTpname = data.old;
            if(oldTpname != tpname){
                if(tpname.length <= 50){
                    var topicid = data.node.id.indexOf("_").length > 0 ? data.node.id.split("_")[1] : data.node.id;
                    var url = "/api/v3/topics/" + topicid; //No I18N
                    var input_data = {"topic": {"name": tpname}}; //No I18N
                    $sol.tree.ajaxTpCall(input_data, url, "PUT").then(function(resp){ //No I18N
                        showalert("success", translate('common.renamed',[translate('sdp.solutions.search.fields.topic')]), "isAutoHide=true, delay=2"); //No I18N
                        $sol.tree.updatePersonalisation(topicid,tpname);
                        $sol.tree.refreshTree();
                           if($sol.list.tempGsearch){
                             $sol.tree.removeGsearch();
                          }
                        return false;
                    }).fail(function(resp){
                        var node = jQuery('#' + data.node.id);
                        tree.rename_node(node, data.old);
                        $sol.tree.refreshTree();
                         if($sol.list.tempGsearch){
                           $sol.tree.removeGsearch();
                         }
                    });
                }
                else{
                    $sol.tree.refreshTree();
                    showalert("failure", translate("sdp.api.security.exception.value.toolong"), "isAutoHide=true, delay=2"); //No I18N
                }
            }
            else{
                $sol.tree.refreshTree();
            }
        },
         /** To construct a delete topic popup */
        operation_delete: function(node, parent){
            var tpname = node.text;
            var subtpCount = 0,sol_count = 0;
            var topicid = "";
            var isdeleted = node.original.isdeleted;
            if(node.children && node.children.length > 0){
                subtpCount = node.children.length;
            }
            if(node.original && node.original.count > 0){
                sol_count = node.original.count;
            }
            var hbsData = {
                topic_id: node.id,
                topic_name: tpname,
                isdeleted:isdeleted
            }
            if(subtpCount > 0 || sol_count > 0){
                //The topic have some subtopics and some solutions, at this time this block will be executed
                var topic_content1 = "",topic_content2="", topic_content3=""; //No I18N
                sol_count > 0 && (topic_content1 += sol_count+' <b>'+translate("sdp.solutions.managetopics.deletetopic.solutions")+'</b>'); //No I18N
                subtpCount > 0 && sol_count > 0 && (topic_content1 += ' '+translate("sdp.admin.common.and")+ ' ', topic_content2 += " "+translate("sdp.solutions.managetopics.deletetopic.solutions"))//No I18N
                subtpCount > 0 && (topic_content1 += subtpCount+" <b>"+translate("sdp.solutions.managetopics.deletetopic.subtopics")+"</b>",topic_content3 += " "+translate("sdp.solutions.managetopics.deletetopic.subtopics")); //No I18N
                sol_count > 0 && !(subtpCount > 0) && (topic_content2 += " "+translate("sdp.solutions.managetopics.deletetopic.solutions"))//No I18N

                hbsData.topic_content1 = topic_content1;
                hbsData.topic_content2 = topic_content2;
                hbsData.topic_content3 = topic_content3;
                hbsData.subtpCount = subtpCount;
                hbsData.sol_count = sol_count;

                if(hbsData.isdeleted == true){
                    showconfirm(true,'title='+translate("sdp.solutions.managetopics.deletetopic")+', message='+translate("solution.topic.delete",[e_html(tpname),sol_count])+', submitbutton='+translate("common.delete")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',function(confirm){   // No I18N
                       if(confirm){
                           $sol.tree.solTreeActions.delete_topic(node.id,null,null,node.original.isdeleted,node.original.count);
                       }
                   },true);
                }

                else{
                    var hbsHtml = renderhbs(null,"sol_topic_delete_dialog",hbsData,false,"solutions",null,null,null,true);     //No I18N
                    jQuery('#solution_tree_topic_delete_popup').dialog({
                        title:translate("sdp.solutions.managetopics.deletetopic"),
                        autoOpen : false,
                        modal : true,
                        position: { my: "center center", at: "center center", of: window }, //NO I18N
                        open: function(event, ui){
                            $sdEventListener(jQuery("#solution_tree_topic_delete_popup"));
                            if(subtpCount > 0){
                                jQuery("#subtopics_list").show();
                            }
                            /** remove the current topic in the select2 handling */
                            var tree_Data = structuredClone($sol.tree.active_topics);
                            var topicList = $sol.tree.deleteChildTopic(tree_Data,node.id);

                            jQuery("#sol_subtopics_list_select").select2({data:topicList,placeholder:translate("zia.bot.select.topic"),dropdownCssClass: 's2-hover-ui1'}); // No I18N
                            jQuery("#sol_subtopics_list_select").on("change", function(e) { jQuery('#delete_topic_error').hide() });
                            jQuery("#subtopics_list_select").select2({data:topicList,placeholder:translate('sdp.solution.topic.roottopic'),allowClear:true,dropdownCssClass: 's2-hover-ui1'}); // No I18N
                        },
                        close: function(event,ui){
                            jQuery('#delete_confirm').remove();
                            jQuery('#solution_tree_topic_delete_popup').dialog("destroy"); // No I18N
                        },
                        width: 500,
                    }).html(hbsHtml).dialog("open"); // No I18N
                }
            }
            else{

               showconfirm(true,'title='+translate("sdp.solutions.managetopics.deletetopic")+', message='+translate("topics.delete.confirm2",[e_html(tpname)])+', submitbutton='+translate("common.delete")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',function(confirm){   // No I18N
                   if(confirm){

                       $sol.tree.solTreeActions.delete_topic(node.id,null,null,node.original.isdeleted,node.original.count);
                   }
               },true);
            }
            return false; 
        },
         /** To move one topic to another topic or root topic */
        move: function(node,parent){

            var topic_content = $sol.tree.constructMoveTopicPopupContent(node);
            jQuery('#moveTopicConfirmHTML .text').html(topic_content);
            if(parent.text){jQuery('#moveTopicConfirmHTML .disp-b #parentTopicName').html('<strong>'+e_html(parent.text)+'</strong>'); } //No I18N
            else{jQuery('#moveTopicConfirmHTML .disp-b #parentTopicName').text(translate("topics.move.content.separate"));} //No I18N
            var HTML = jQuery("#moveTopicConfirmHTML").html();
            showconfirm(true,'title=<span>'+translate("move.topics")+'</span><span class="text-muted ml5 mr5"></span><span class="text-muted">'+e_html(node.text)+'</span>, message='+HTML+', submitbutton=Move, cancelbutton=Cancel, closebutton=yes, closeOnEscKey=yes',confirmMoveCallback); //No I18N

            function confirmMoveCallback(proceed){  // callback function for move topic from topic
                if(proceed){
                    var nodeId = node.id;
                    var parentId = parent.id;
                    var url = "/api/v3/topics/" + nodeId;   //No I18N
                    var input_data = {"topic": {"parent": null}};   //No I18N

                    if(parentId != "#"){
                        input_data.topic.parent = {"id": parentId};     //No I18N
                    }
                    sdpAjax({
                        type: "PUT", //No I18N
                        url: url,
                        data: sdpAjaxInputData(input_data),
                        async: false,
                        success: function(){
                            $sol.tree.refreshTree();
                            showalert("success", translate('common.moved',[translate('sdp.solutions.search.fields.topic')]), "isAutoHide=true, delay=2"); //No I18N
                            if($sol.list.tempGsearch){
                              $sol.tree.removeGsearch();
                            }

                        },error: function(){
                        }
                    })
                }
            }
        },
         /** To delete a topic */
        delete_topic:function(topicId,solutionTopicId,subtopicTopicId,isdeleted,solcount){

            var input_data = {};
            var msg="";var url="";
            var input_data = {
                "topic": { "solution_to_topic": -1, "subtopic_to_topic":  -1 } //No I18N
            } 
            if(solutionTopicId){
                            input_data.topic.solution_to_topic = solutionTopicId;

            }
            if(subtopicTopicId){
                            input_data.topic.subtopic_to_topic = subtopicTopicId;
            }


           if(solcount > 0 && isdeleted && isdeleted.toString() != "true" && !solutionTopicId){
                url = "/api/v3/topics/"+ topicId + "/_move_to_trash" //No I18N
                msg='api.trashed.success';// No I18N
                input_data=null
            }
            else {
                url = "/api/v3/topics/"+ topicId //No I18N
                msg='api.deleted.success';// No I18N
            }
            sdpAjax({
                    type: "DELETE", //No I18N
                    url: url,
                    data: input_data==null? null : sdpAjaxInputData(input_data),
                    async: false,
                    success: function(){
                        showalert("success", translate(msg,[translate('sdp.solutions.search.fields.topic')]), "isAutoHide=true, delay=2"); //No I18N
                        $sol.tree.refreshTree();
                        jQuery('#all_solutions_id').trigger("click");
                        if(jQuery('#delete_confirm').length != 0){     // SD-109067
                            jQuery('#solution_tree_topic_delete_popup').dialog('close');    //No I18N
                        }
                    }
            })


        },
       restore_topics : function(tree, data){
            if(tree.original.count>0){
                var hbsData={
                    topicID:tree.original.id,
                    topicName:tree.original.name,
                    solCount:tree.original.count
                }
                var restoreHbsData = renderhbs(null,"sol_topic_restore_dialog",hbsData,false,"solutions",null,null,null,true);     //No I18N
                jQuery("#solution_tree_topic_restore_popup").dialog({
                    title : translate("sdp.requests.restorerequests")+" "+translate("sdp.solutions.newsolution.topic"),//No I18N
                    autoOpen : false,
                    modal : true,
                    position: { my: "center center", at: "center center", of: window }, //NO I18N
                    open : function(event,ui){
                        $sdEventListener(jQuery("#solution_tree_topic_restore_popup"));
                    },
                    close: function(event,ui){
                        jQuery('#restore_confirm').remove();
                        jQuery('#solution_tree_topic_restore_popup').dialog("destroy"); // No I18N
                    },
                    width: 500,

                }).html(restoreHbsData).dialog("open");// No I18N
            }
            else{
                showconfirm(true,'title='+translate("sdp.requests.restorerequests")+" "+translate("sdp.solutions.newsolution.topic")+', message='+translate("topics.restore.confirm",[e_html(tree.original.name)])+', submitbutton='+translate("sdp.requests.restorerequests")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',function(confirm){   // No I18N
                   if(confirm){
                       $sol.tree.solTreeActions.restoreTopicCall(tree.original.id);
                   }
                });
            }


        },
        restoreTopicCall(topicID,input_data){
            var url = "/api/v3/topics/"+topicID+"/_restore_from_trash"; //No I18N
            sdpAjax({
                url: url,
                type: "PUT", //No I18N
                data:sdpAjaxInputData(input_data),
                success: function(resp){
                    showalert('success', translate('sdp.restore.success',[translate('sdp.solutions.newsolution.topic')]), "isAutoHide=true"); // No I18N
                    $sol.tree.refreshTree();
                    var solutionsTable = WebComponents.instancePool["webc_solutions"];// No I18N
                    solutionsTable.refreshTable("refresh")
                    if(jQuery('#restore_confirm').length != 0){
                        jQuery('#solution_tree_topic_restore_popup').dialog('close'); //No I18N
                    }
                   if($sol.list.tempGsearch){
                     $sol.tree.removeGsearch();
                   }
                }
            })
        }
        
    },
    /** ajax function for call the topics tree and data handling */
    ajaxTpCall: function(input_data, url, type){
        return sdpAjax({
            type: type || "POST", //No I18N
            url: url || "/api/v3/topics", //No I18N
            data: sdpAjaxInputData(input_data),
            async: true
        })
    },
    /** refresh the topics tree when some action preformed */
    refreshTree : function(callback){
        var _self = $sol.tree;
        _self.topics_info = { start_index: 1,has_more: false};
        _self.all_topics = [];
        _self.getAllTopics(function(){
			var personalize = sdp_user.CLIENT_CONF.solutions_currentview;
	        _self.treeData=(personalize && personalize.includeTrashedTopic==false) ? _self.active_topics : _self.all_topics;            
	        jQuery("#"+_self.treeView.options.treeSelector).jstree(true).settings.core.data = $sol.tree.treeData;
            // jQuery('#solution_tree').jstree(true).redraw(true);
            jQuery('#solution_tree').jstree(true).refresh();
            
            if(jQuery('#solution_tree').jstree(true).get_selected(true).length == 0){
                jQuery('#all_solutions_id').addClass('text-primary');
            }
            initTooltip('#sol_topic_tree'); //No I18N
            if(typeof callback === "function"){
                callback();
            }
        });
    },
    /** To update topic id and topic name on solution personalisation **/
    updatePersonalisation:function(id,name,isdeleted){

        var personalize = sdp_user.CLIENT_CONF.solutions_currentview;
        if(personalize){
            if(personalize.topicID!=id){
                personalize.topicID = id;
                personalize.topicNAME=name;
            }
            else{
                personalize.topicNAME=name;
            }

        }else{
        personalize = {topicID : id , topicNAME :name};
        }
        addPersonalization('solutions_currentview', personalize);
    },
    /** treeview object data handling  */
    treeView : {
        options:{},
        flag: {
            create:false, update:false
        },
        /** intialized the jstree */
        initTreeView:function(){
            this.setupJstree();
            this.treeEventBinds();
            initTooltip("#sol_topic_tree") //No I18N
            initTooltip('#sol-tree-button');//No I18N
            var solTreeHeight = getConsolidatedHeight()+ 120 +'px'; //No I18N
            document.getElementById('solution_tree').style.height = 'calc(100vh - '+solTreeHeight+')'; //No I18N
            return this;
        },
        /** setting up the jstree and the options */
        setupJstree: function(){
            var _self = this;
            var treeOptions = {};
            var plugins = ["themes", "html_data", "crrm", "node_customize"]; //No I18N
            if($SolObj.getPermissions().edit || $SolObj.getPermissions().delete){
                plugins.push("dnd"); //No I18N
                plugins.push("contextmenu");
            }

            treeOptions = {
                dnd: {
                    drag_target: false,
                    drop_target: false
                },
                core: {
                    check_callback: function(action, node, parent, position, more){
                        switch(action){
                            case "move_node": //No I18N
                                if (more && more.core && typeof _self.options.actions.moveCB === "function") { // disallow re-ordering
                                    var s = _self.options.actions.moveCB(node,parent);
                                    return s == undefined ? false : s;
                                }
                                return true;
                        }
                    },
                    animation: 200,
                    strings: {
                        //TODO i18n
                        loading: "Loading...", //No I18N
                        new_node: ' '
                    },
                    themes: {
                        theme: false,
                        responsive: true,
                        icons: false,
                        dots: false
                    },
                    data: _self.tree_data
                },
                plugins: plugins
            };
            /**
            * Customize the node html callback
            */
            if(sdp_user && sdp_user.USERTYPE!='Requester' && typeof _self.options.customizeNodeCB == "function"){
                treeOptions.node_customize = {
                    "default": function(el, node) {     //No I18N
                        _self.options.customizeNodeCB(el, node);
                    }
                }
            }
            //contextmenu is used to construct a topic menus operations (create, Rename, Remove)
            treeOptions.contextmenu = {
                "items": function($node) { //No I18N
                    var tree = jQuery("#"+_self.options.treeSelector).jstree(true);
                     var actions={
                        "Restore" : { //No I18N
                            "label": translate("sdp.requests.restorerequests"), //No I18N
                            "action": function(obj){ //No I18N

                                 if(typeof _self.options.actions.restoreCB == "function"){
                                    return _self.options.actions.restoreCB($node, obj);
                                }

                            }
                        },
                        "Create": { //No I18N
                            "label": translate("sdp.solution.topic.create"), //No I18N
                            "separator_after": true, //No I18N
                            "action": function (obj) {  //No I18N
                                _self.flag.create = true;
                                $node = tree.create_node($node, " ");
                                tree.edit($node);
                                document.getElementById($node).classList.add('jsnode','sol-jsnode-rename'); //No I18N
                                $sol.tree.topicLengthCheck("#"+$node,50);
                            }
                        },
                        "Rename": { //No I18N
                            "label": translate("sdp.solutions.header.managetopics.renametopic"), //No I18N
                            "action": function (obj) { //No I18N
                                _self.flag.rename = true;
                                $node['li_attr']['class'] = 'jsnode sol-jsnode-rename'; //No I18N
                                tree.edit($node);
                                $sol.tree.topicLengthCheck("#"+$node.id,50);
                            }
                        },
                        "Remove": { //No I18N
                            "label": translate("sdp.solution.topic.delete"), //No I18N
                            "action": function (obj) { //No I18N
                                if(typeof _self.options.actions.deleteCB == "function"){
                                    // Make sure to delete the node after callback operation
                                    return _self.options.actions.deleteCB($node, obj);
                                }else{
                                    tree.delete_node($node);
                                }
                            }
                        }
                 }

                var trashActions={};
                if($node.original.isdeleted){
                    if($SolObj.getPermissions().edit){
                        trashActions["Restore"]=actions["Restore"]
                    }
                    if($SolObj.getPermissions().delete){
                       trashActions["Remove"]=actions["Remove"]
                    }
                    return trashActions;
                }
                else{
                    if(!$SolObj.getPermissions().delete){
                        delete actions["Remove"];
                    }
                    if(!$SolObj.getPermissions().edit){
                        delete actions["Rename"];
                        delete actions["Create"];
                    }
                    delete actions["Restore"];
                    return actions;
                }

              }
            };
            treeOptions = jQuery.extend(treeOptions, _self.options);
            _self.treeObj = jQuery("#" + _self.options.treeSelector).jstree(treeOptions);
            jQuery('#solution_tree_skloader').hide();
            jQuery('#solution-tree-wrapper-id').show();
        },
        /** jstree based event handling */
        treeEventBinds: function(){
            var _self = this;
            var opt = _self.options;
            /**
              When new node, context menu, tree action, expand tree , select, delet, renaming the node this event triggers
              When cloning the treeview these events are not triggered
            */
            if(!opt.isClone){
                jQuery("#" + opt.treeSelector).off('rename_node.jstree').on('rename_node.jstree', function(e, data){
                    var tree = jQuery("#" + opt.treeSelector).jstree(true);
                    var node = jQuery('#' + data.node.id);
                    if(_self.flag.create && data.text.trim().length > 0){
                        typeof opt.actions.createCB == "function" && opt.actions.createCB(tree, data);  //No I18N
                        _self.flag.create = false;
                    }else if(_self.flag.create){
                        tree.delete_node(node);
                    }
                    if(_self.flag.rename && data.text.trim().length > 0){
                        typeof opt.actions.renameCB == "function" && opt.actions.renameCB(tree, data);  //No I18N
                        _self.flag.rename = false;
                    }
                });

                jQuery(document).off("context_show.vakata").on("context_show.vakata",function(reference, element, position){ //No I18N
                    jQuery("#"+opt.treeSelector).jstree().deselect_all(true);
                    var settingPos = jQuery(element.reference).find(".nodesettings");
                    var cntmenu = jQuery(element.element);
                    if(sdp_user.DIRECTION === "RTL"){
                        jQuery(cntmenu).css({top: settingPos.offset().top+25, left: settingPos.offset().left - cntmenu.width() + 125});
                    }else{
                        jQuery(cntmenu).css({top: settingPos.offset().top+25, left: settingPos.offset().left - cntmenu.width() + 15});
                    }
                });

                /** remove the node selection when context menu closed */
                jQuery(document).off("context_hide.vakata").on("context_hide.vakata",function(reference, element, position){ //No I18N
                    var personalize = sdp_user.CLIENT_CONF.solutions_currentview;
                    var prevSelectNode;
                    if($SolObj.deletedTopicID){
                        prevSelectNode = $SolObj.deletedTopicID;
                    }
                    else if(!jQuery.isEmptyObject(personalize) && personalize.topicID){
                      prevSelectNode = personalize.topicID;
                    }


                    var curNodeId = jQuery(element.reference).closest(".jstree-node").attr("id"); //No I18N
                    if(curNodeId != prevSelectNode){
                        jQuery(element.reference).removeClass("jstree-clicked jstree-context");
                        if(prevSelectNode){
                            jQuery("#" + opt.treeSelector).jstree("select_node", prevSelectNode)
                        }
                    }else{
                        jQuery(element.reference).removeClass("jstree-context");
                        jQuery("#" + opt.treeSelector).jstree("select_node", prevSelectNode)
                    }
                });
                
                jQuery(document).off("click.solaction"+ opt.treeSelector).on("click.solaction"+ opt.treeSelector, '[data-topic-actions]', function(e){  //No I18N
                    e.stopPropagation();
                    e.preventDefault();
                    var curEle = jQuery(this),
                    topicId = curEle.attr('data-topic-id'); //No I18N
                    jQuery('#'+opt.treeSelector).find('#'+topicId).trigger('contextmenu.jstree');//No I18N
                    var windowHeight = jQuery(window).height(),
                    curEleTop = curEle.offset().top,
                    vakataJQ = jQuery('ul.vakata-context'),
                    cMenuHeight = vakataJQ.height()+20;
                    if(( (windowHeight - cMenuHeight) - 50) < curEleTop ){
                        vakataJQ.css('top',curEleTop - cMenuHeight); //No I18N
                    }
                    return false;
                });

                jQuery("[data-addtopic]").on('click.'+opt.treeSelector, function(e){  //No I18N
                    jQuery("#" + opt.treeSelector).jstree("create_node", "#", { 'id' : 0, 'text' : ''}, "first",function (node) {
                        this.edit(node);
                        _self.flag.create = true;
                    });
                    const newNode = document.getElementsByClassName("jstree-rename-input")[0];
                    newNode.placeholder = translate("sdp.solution.topic.new");
                    newNode.id="new_node";
                    document.getElementsByClassName('jstree-node')[0].classList.add('sol-jsnode-rename'); //No I18N
                    $sol.tree.topicLengthCheck("#"+newNode.id,50);
                });

                jQuery("[data-expand-action]").off("click."+opt.treeSelector).on("click."+opt.treeSelector, function(e){  //No I18N
                    var action = jQuery(this).attr("data-expand-action");
                    if(action == 'expand'){
                        jQuery("#"+opt.treeSelector).jstree("open_all");
                        jQuery(this).attr("data-expand-action", "collapse").find("span").addClass("collapse-arrow1").removeClass("expand-arrow1").uitooltip({'content':translate('sdp.common.collapseall')});//No I18N
                    }else{
                        jQuery("#"+opt.treeSelector).jstree("close_all");
                        jQuery(this).attr("data-expand-action", "expand").find("span").addClass("expand-arrow1").removeClass("collapse-arrow1").uitooltip({'content':translate('sdp.common.expandall')});//No I18N
                    }
                    initTooltip('#sol_topic_tree'); //No I18N
                });

                jQuery("[data-show-action]").off("click").on("click", function(e){ //No I18N
                    var ele = jQuery(this);
                    if(ele.data("show-action") == "hide"){
                        ele.closest(".sb-slider-wrap").addClass("sb-slider-hide").closest(".sb-slider").addClass("noborder"); //No I18N
                         jQuery('[data-cs-field="show_topics"]').attr("id","LeftIndicator");
                         jQuery('[data-cs-field="hide_topics"]').attr("id","");
                        $sol.list && $sol.list.resizeTableHeightWidth();
                    }else{
                        ele.closest(".sb-slider-wrap").removeClass("sb-slider-hide").closest(".sb-slider").removeClass("noborder"); //No I18N
                        jQuery('[data-cs-field="hide_topics"]').attr("id","LeftIndicator");
                        jQuery('[data-cs-field="show_topics"]').attr("id","");
                        $sol.list && $sol.list.resizeTableHeightWidth();
                    }
                });

                jQuery("[data-deletedtopicview]").off("click").on("click", function(e){ //No I18N
                    var personalize = sdp_user.CLIENT_CONF.solutions_currentview;
                    curEle = jQuery(this);
                    if(jQuery(this).attr("data-DeletedtopicView") == "hide"){
                      curEle.find('>span').attr('class','cspr di-trash icon-md cur-ptr pos-abs top5 mt4 ml-20');
                        jQuery('#hideshowele').uitooltip({'content':translate("solution.deletedtopic.show")});
                        if($SolObj.deletedTopicID){
                             var view='table',viewMode='table';// No I18N
                                if($sol.list.view_mode == "classic"){ // No I18N
                                    viewMode = "linear"; // No I18N
                                    view = 'kanban'; // No I18N
                             }
                             var current_view = sdp_user.CLIENT_CONF.solutions_currentview;
                             var filter_by=(current_view && current_view.filter_by) ? current_view.filter_by : {"name":"AllSolutions"};//No I18N
                             $sol.list.setTemplate(view,viewMode,(filter_by.name == 'trash')? true : false);
                            jQuery('#all_solutions_id').trigger( "click" );
                        }
                        if(personalize){
                            personalize.includeTrashedTopic=false;
                        }
                        else{
                            personalize={'includeTrashedTopic' : false}// No I18N
                        }
                        addPersonalization('solutions_currentview', personalize);
                        curEle.attr("data-deletedtopicview","show");
                        $sol.tree.treeData=$sol.tree.active_topics;
                    }
                    else{
                        curEle.find('>span').attr('class','cspr en-trash icon-md cur-ptr');
                        jQuery('#hideshowele').uitooltip({'content':translate("solution.deletedtopic.hide")});
                       if(personalize){
                          personalize.includeTrashedTopic=true;
                       }
                       else{
                        personalize={'includeTrashedTopic':true}// No I18N
                       }
                        addPersonalization('solutions_currentview', personalize);
                        curEle.attr("data-deletedtopicview","hide");
                        $sol.tree.treeData=$sol.tree.all_topics;
                    }
		        
		          jQuery("#"+$sol.tree.treeView.options.treeSelector).jstree(true).settings.core.data = $sol.tree.treeData;
		          jQuery('#solution_tree').jstree(true).refresh();
		          if(jQuery('#solution_tree').jstree(true).get_selected(true).length == 0){
		              jQuery('#all_solutions_id').addClass('text-primary');
		          }
		          initTooltip('#sol_topic_tree'); //No I18N
             });
                jQuery("#"+opt.treeSelector).off('select_node.jstree').on('select_node.jstree', function(e, data){

                    var isContext =  data.event && data.event.target && jQuery(data.event.target).hasClass('menulist') ? true : false; //No I18N

                    if(!isContext && $SolObj.isFilterSaved == false){
                    
                        $sol.list.table_comp_solution.changeFilterString("clearOnly");// No I18N
                        jQuery("#"+opt.treeSelector).jstree('select_node', data.node.id);
                        var solutionsTable = WebComponents.instancePool["webc_solutions"];// No I18N
                        var personalize = sdp_user.CLIENT_CONF.solutions_currentview;

                        var previousDeletedTopic = $SolObj.deletedTopicID!=null ? $SolObj.deletedTopicID : null;

                        $SolObj.deletedTopicID=(data.node.original.isdeleted) ? data.node.id : null;
                        solutionsTable.t_obj.table_info.list_info.search_criteria = {
                        "field":"topic.id", // No I18N
                        "condition":"eq", // No I18N
                         "value": data.node.id  // No I18N
                        };
                        var previousTopic = (personalize && personalize.topicID) ? personalize.topicID : null;
                        if(!personalize || (personalize && personalize.topicID!=data.node.id)){
                           if(!$SolObj.deletedTopicID){
                                if(jQuery.isEmptyObject(personalize)){
                                    personalize = {topicID : data.node.id , topicNAME :data.node.text};
                                }else{
                                    personalize.topicID = data.node.id;
                                    personalize.topicNAME=data.node.text;
                                }
                                addPersonalization('solutions_currentview', personalize);
                           }
                    }
                    var GSearch=false;
                    if($sol.list.tempGsearch){
                        GSearch=true
                        if(solutionsTable.t_obj.table_info.list_info.gsearch){
                            delete solutionsTable.t_obj.table_info.list_info.gsearch;
                            delete $sol.list.tempGsearch;
                            $SolObj.pushingStateURL("solutions", "list");   //No I18N
                        }
                    }

                    jQuery('[data-sol-listaction="all_solutions"]').removeClass('text-primary');
                        //Used to remove a advanced filter when any topic clicked at the time of advanced filter applied
                        if(jQuery(".viewFiltRight .cancel-filter:visible").length > 0 && viewFilterComponent){
                            $SolObj.isFilterCanceled = false;
                            viewFilterComponent.resetFilter();
                            if($SolGlobal.topicview == "topic"){
                                solutionsTable.t_obj.table_info["for"]="topic_filter";// No I18N
                            }
                            else{
                                delete solutionsTable.t_obj.table_info["for"];
                            }
                        }
                    var view='table',viewMode='table';// No I18N
                        if($sol.list.view_mode == "classic"){ // No I18N
                            viewMode = "linear"; // No I18N
                            view = 'kanban'; // No I18N
                        }
                        //Reinitializing tableComponent when switching from active topic to inactive topic
                        if(!previousDeletedTopic && $SolObj.deletedTopicID){
                             $sol.list.setTemplate(view,viewMode,true);
                            $sol.list.filterByRenderAction();
                            var listviewJQ=jQuery('#listcontrols');
                            listviewJQ.find('#solutions-filters').text(translate("sdp.requests.trashrequest"));// No I18N
                            listviewJQ.find('#listview_btn').attr("title",translate("sdp.requests.trashrequest"));// No I18N
                            solutionsTable.t_obj.table_info.list_info.filter_by = {"name":"trash"};//No I18N
                        }
                        //Reinitializing tableComponent when switching from inactive topic to active topic
                        else if(previousDeletedTopic && !$SolObj.deletedTopicID){
                            var current_view = sdp_user.CLIENT_CONF.solutions_currentview;
                            var filter_by=(current_view && current_view.filter_by) ? current_view.filter_by : {"name":"AllSolutions"};//No I18N
                            $sol.list.setTemplate(view,viewMode,(filter_by.name == 'trash')? true : false);
                            $sol.list.filterByRenderAction();
                        }
                       else {
                            //Need to invoke solution api call while selecting inactive topic continuously
                            if($SolObj.deletedTopicID){
                                solutionsTable.t_obj.table_info.list_info.filter_by = {"name" : "trash"};//No I18N
                                solutionsTable.refreshTable("refresh");// No I18N
                            }
                            else{
                                var current_view=$sol.list.filterByRenderAction();
                                if(current_view.filter_by && current_view.filter_by.name == "trash" && GSearch){
                                    $sol.list.setTemplate(view,viewMode,true);
                                }
                                else{
                                   solutionsTable.refreshTable("refresh");// No I18N
                                }

                            }
                       }
                }
                });

                jQuery(document).off("change.sol_move").on("change.sol_move", "input[name='sol_move_option']", function(e){ //No I18N
                    var curChecked = jQuery(this).val();
                    if(curChecked == "topic-list"){
                        jQuery("#sol_subtopics_list").show();
                    }else{
                        jQuery("#sol_subtopics_list").hide();
                    }
                });

                jQuery(document).off("change.subtopic_move").on("change.subtopic_move", "input[name='subtopic_move_option']", function(e){ //No I18N

                                     var curChecked = jQuery(this).val();
                                     if(curChecked == "subtopic_topic-list"){
                                          jQuery("#subtopics_list").show();
                                     }else{
                                          jQuery("#subtopics_list").hide();
                                     }
                                 });

                jQuery(document).off("click.sol_delete").on("click.sol_delete", "#delete_topics", function(e){ //No I18N

                    var solutionTopicId = jQuery("#sol_subtopics_list_select").val(); //No I18N
                    var subtopicTopicId = jQuery("#subtopics_list_select").val(); //No I18N
                    var topicId = jQuery("#delete_confirm").attr("data-topicid"); //No I18N
                    var isdeleted = jQuery("#delete_confirm").attr("data-deleted");
                    var solcount = jQuery("#delete_confirm").attr("data-solcount"); //No I18N
                    if(solutionTopicId || subtopicTopicId){
                       $sol.tree.solTreeActions.delete_topic(topicId, solutionTopicId ,subtopicTopicId,isdeleted,solcount);
                    }
                    else if(jQuery("input[value='topic-list']").prop('checked')){
                        jQuery("#delete_topic_error").show();
                    }
                    else{
                        $sol.tree.solTreeActions.delete_topic(topicId,null,null,isdeleted,solcount);
                    }
                });

                jQuery(document).off("click.sol_restore").on("click.sol_restore","#restoreTopicButton", function(e){// No I18N
                    var restore_option=jQuery("input[type='radio'][name='restoreTopic']:checked").val();
                    var topicID=jQuery("#restore_confirm").attr("data-topicid");
                    var input_data={};
                    input_data.restore_solutions= (restore_option=="restoreTopicSol") ? true : false;// No I18N
                    $sol.tree.solTreeActions.restoreTopicCall(topicID,input_data)
                    
                })
            }
        }
    },

    //To constract a Move Topic Popup related content
    constructMoveTopicPopupContent:function(node){
        var subtpCount = 0,sol_count = 0;
        if(node.children && node.children.length > 0){
            subtpCount = node.children.length;
        }
        if(node.original && node.original.count > 0){
            sol_count = node.original.count;
        }
        var topic_content = "";
        if(subtpCount > 0 || sol_count > 0){
            topic_content = topic_content + '<span>'+translate("solution.move.topic.this")+' ';      //No I18N
            if(subtpCount > 0 ){
                topic_content = topic_content + subtpCount+' '+translate("solution.move.subtopics")+' ';
            }
            if(subtpCount > 0 && sol_count > 0){
                topic_content = topic_content + translate("sdp.admin.common.and") + ' ';
            }
            if(sol_count > 0 ){
                topic_content = topic_content +sol_count+' '+translate("solution.move.topic.solutions");
            }
            topic_content = topic_content + '</span><hr class="ht-medium mt10 mb15">';
        }
        return topic_content;
    },

    //Delete child topic when select a delete topic popup
    deleteChildTopic :function(tree_Data,node)
    {
        for (var i = 0; i < tree_Data.length; i++) {
            if(tree_Data[i].id==node)
            {
                tree_Data.splice(i,1);
                break;
            }
            var child = tree_Data[i].children;
            if(child.length){
                this.deleteChildTopic(child,node);
            }
        }
        return tree_Data;
    },



    //For Topic length check and alert
    topicLengthCheck : function(id,maxlength){
        jQuery(id).keydown( function(){
            if (jQuery('.jstree-rename-input').val().length >= maxlength) {
                jQuery('.jstree-rename-input').val(jQuery('.jstree-rename-input').val().substr(0, maxlength));
            }
        });

        jQuery(id).keyup( function(){
            if (jQuery('.jstree-rename-input').val().length > maxlength) {
                jQuery('.jstree-rename-input').val(jQuery('.jstree-rename-input').val().substr(0, maxlength));
                jQuery('#alertbox').remove();
                showalert("warning", translate("sdp.solution.topic.char.limit"), "isAutoHide=true"); //No I18N
            }
        });
    },

        constructSubTopicData : function(topic){
             if(topic.children==null){
                 return this.constructTopicData(topic);
             }

             topic=this.constructTopicData(topic);
             for (var i = 0; i < topic.children.length; i++) {
               topic.children[i]=this.constructSubTopicData(topic.children[i]);
             }
             return topic
         },

         constructTopicData : function(tp){
             var current_topic = sdp_user.CLIENT_CONF.solutions_currentview;
             var current_topicID;
             if(current_topic && current_topic.topicID && tp.isdeleted==false){
                 jQuery('[data-sol-listaction="all_solutions"]').removeClass('text-primary')
                 current_topicID = current_topic.topicID;
             }
             else if(current_topic && current_topic.topicID==tp.id && tp.isdeleted==true){
                jQuery('[data-sol-listaction="all_solutions"]').addClass('text-primary');
                delete current_topic.topicID;
                delete current_topic.topicName;
                $SolObj.deletedTopicID=null;
                window.addPersonalization('solutions_currentview', current_topic);
             }
             var tpObj = {
                 id: tp.id,
                 name: tp.name,
                 text: tp.name,
                 count: sdp_user.USERTYPE === "Technician" ? tp.solution_count : 0, //No I18N
                 parent_id: tp.parent != null ? tp.parent.id : 0,
                 isdeleted:tp.isdeleted,
                 li_attr : { "class" : "jsnode", "data-tree-id": tp.id, "data-cs-field":"sol_topic"}, //No I18N
                 state:{},
                 children:tp.children!=null ? tp.children : []
             };
             tpObj.state.selected = (current_topicID == tp.id) ? true : false
             tpObj.state.opened = tp.parent == null ? true : false
             return tpObj;
         },
        removeDeletedTopic : function(topics){
        var _self=this;
             if(topics.children==null){
                 return;
             }
             topics.children = topics.children.filter(item =>!item['isdeleted']);
               topics.children.forEach(function(topic){
                   _self.removeDeletedTopic(topic);
               })
             return;
         },
         constructActiveTopics : function(allTopics){
             var _self=this;
             var active_topics = structuredClone(allTopics);
             active_topics = active_topics.filter(item =>!item['isdeleted']);
             active_topics.forEach(function(topics){
                 _self.removeDeletedTopic(topics);
             })
             return active_topics;
         },
        removeGsearch : function(){
             var solutionsTable = WebComponents.instancePool["webc_solutions"];// No I18N
             if(solutionsTable.t_obj.table_info.list_info.gsearch){
                 delete solutionsTable.t_obj.table_info.list_info.gsearch;
                 delete $sol.list.tempGsearch;
                 $SolObj.pushingStateURL("solutions", "list");   //No I18N
             }
             var current_view=$sol.list.filterByRenderAction();
             if(current_view.filter_by && current_view.filter_by.name == "trash" && GSearch){
                 $sol.list.setTemplate(view,viewMode,true);
             }
             else if(sdp_user.USERTYPE == "Technician" ){
                 var filter_by=current_view.filter_by ? current_view.filter_by : {"name":"AllSolutions"};//No I18N
                 solutionsTable.t_obj.table_info.list_info.filter_by = filter_by;
                 solutionsTable.refreshTable("refresh");// No I18N
             }

       }

}
