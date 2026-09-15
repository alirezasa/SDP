/* $Id$ */
var $SolObj = {
    ...$SolGlobal,
    /*
     * This object should be populated on the page load.
     * This object is used to get a active solution tab and logged in user's permission.
     */

    /* To initialize the  Solution object option and call the url redirect function */
    topicview : "subtopic",//NO I18N
    deletedTopicID: null,
    init : function(options){
        /* To set the external parameter in the variable */
        var params = ""; // No I18N
        /* Checking for association id for problem Resolution/Workaround */
        if(options.associateID && options.associateID!="null"){
            params += params === "" ? "associateID="+options.associateID: "&associateID="+options.associateID; // No I18N
        }
        /* Checking for association type for problem Resolution/Workaround */
        if(options.associateType && options.associateType!="null"){
            params += params === "" ? "associateType="+options.associateType: "&associateType="+options.associateType; // No I18N
        }
        /* To checking the global search happend via popular solutions */
        if(options.isPopular != "null"){
            $SolObj.isPopular = options.isPopular;
        }
        //To checking the list view page loaded via previewComponent / linked solutions page
        if(options.isPreview != "null"){
            $SolObj.isPreview = options.isPreview;
        }
        $SolObj.printPreview = options.printPreview;
        /* To checking the input data */
        if(options.input_data != "null"){
            options.input_data = JSON.parse(options.input_data);
        }else{
            options.input_data = null;
        }
        /* To checking the hashUrl for solution tab change */
        var hashURL = window.location.hash, tabName = "";
        if(hashURL != null && hashURL != "") {  // No I18N
            tabName = hashURL.substr(1);
        }
        /* to checking the forwardTo url */
        if(options.forwardTo == "null"){
            options.forwardTo = "";
        }
        /* To checking the entity id */
        if(options.entity_id == "null"){  // No I18N
            options.entity_id = "";  // No I18N
        }
        /* To checking the from option */
        if(options.from == "null" || options.from == "undefined"){  // No I18N
            options.from  = "";  // No I18N
        }
        /* To checking the doPush state */
        if($SolObj.doPush != false){
            $SolObj.doPush = true;
        }
        /* To checking the entity id for detail page redirection */
        if(options.entity_id){
            options.forwardTo = options.forwardTo ? options.forwardTo : "detail";  // No I18N
        }else{
            if(options.forwardTo == "null"){  // No I18N
                options.forwardTo = "list";  // No I18N
            }
        }
         /* To check whether the resolved request toggle is checked in request Tab */
        $SolObj.isRequestCheckEnabled = false;
        /* Set the input_data to SolObj */
        $SolObj.input_data = options.input_data;
        /* To checking the external frame */
        $SolObj.externalframe = options.externalframe;
        /* Close the advanced filter with any other ways this variable set to be false (Click any topic with advanced filter applied time) */
        $SolObj.isFilterCanceled = true;
        $SolObj.isFilterSaved = false;
        $SolObj.isFilterApplied = false;
        /* To checking the mode */
        if(options.mode == "add"){// No I18N
            options.forwardTo = "add";// No I18N
        }
        /* Call the url redirection function */
        this.redirectTo(options.module, options.forwardTo, options.entity_id, tabName, options.from, options.view, options.mode, params);
    },
    // //To avoid multiple popState event binding
    maintainPopState : function(){
        if(!window.$SolObj.isPopStateAvailable){
            window.$SolObj.isPopStateAvailable = true;
            jQuery(window).off('popstate.solution').on('popstate.solution', function (event) { // No I18N
                var state = event.originalEvent.state;
                if (state && !state.spa){ //To discard popstate event trigger, because of history (history pushed by SPA)
                    /**
                     * If a search query is present in the retained SPA state, append it to the base URL
                     * Otherwise, use the base URL with default mode parameter set to "get"
                     **/
                    let url = $spa.retainQuery.search ? "/ui/solutions" + $spa.retainQuery.search : "/ui/solutions?mode=list"; // No I18N
                    window.history.replaceState({'forwardTo' : "list","module" : "solution","spa_skipstate" : true}, '', url); // No I18N
                    $SolObj.redirectTo("solution", "list");    // No I18N
                }
            });
        }
    },
    /* This function is used to redirect the specific solution page */
    redirectTo: function (module, forwardTo, id, tabName, from, view, mode,reqParam) {
            $SolObj.doPush = true;
        var printPreview = $SolObj.printPreview;
        var pathName = ""; // No I18N
            forwardTo = forwardTo ? forwardTo : (isNaN(parseInt(id)) ? "list" : "detail"); // No I18N

        var externalframe  = $SolObj.externalframe == "true"; // No I18N
        if(module == "solution"){
            if(forwardTo === "list"){ // No I18N
                //hide scrollbar for listview
                jQuery('body').addClass('of-h'); // No I18N
                pathName = "/kbase/SolutionList.jsp"; // No I18N
            }else if(forwardTo === "detail"){ // No I18N
                jQuery('body').removeClass('of-h'); // No I18N
                pathName = "/kbase/SolutionDetails.jsp"; // No I18N
            }else{
                jQuery('body').removeClass('of-h'); // No I18N
                pathName = "/kbase/SolutionForm.jsp"; // No I18N
            }
        }
        var containerId = printPreview ? "module-content" : "solution-section"; // No I18N
        var params="";
        if(reqParam && reqParam!==""){
            addParam(reqParam);
        }
            if(module){
                addParam("module="+module); // No I18N
            }
            if(externalframe){
                addParam("externalframe="+externalframe); // No I18N
            }
            var modeVal = mode ? mode : forwardTo;
            if(module=="solution" && (modeVal=="add" || modeVal=="edit" || modeVal=="form")){
                jQuery('body').addClass("pos-rel"); // No I18N

                //TODO permission
                var canAdd = this.getPermissions().add;
                var canEdit = this.getPermissions().edit;
                if(canAdd || canEdit){
                    pathName = "/kbase/SolutionForm.jsp";// No I18N
                    var checkForm = modeVal=="form" ? "edit" : modeVal;// No I18N
                    addParam("mode="+checkForm);// No I18N
                }else if(canAdd){
                    window.open('/jsp/AuthError.jsp',"_self");
                }
            }
            else if(forwardTo == "detail"){
                if(!tabName){
                    tabName = "feedback"; // No I18N
                }
                addParam("tabName="+tabName); // No I18N
                addParam("printPreview="+printPreview); // No I18N
            }else if(forwardTo == "new"){ // No I18N
                addParam("forwardTo=new"); // No I18N
            }
            if(id){
              $SolObj.entity_id = id;
              addParam("id="+id); // No I18N
            }
            function addParam(param) {
                params += params === "" ? param : "&"+param; // No I18N
            }
            if(params){
                params = "?"+params; //No I18N
            }
            if(isMSP){
                $mspSolutionList.initHeaderAccountBox(forwardTo);
            }
        jQuery("#"+containerId).load(pathName+params, function() {
            if(!printPreview && !externalframe && (forwardTo !== "list" || from == "entity_not_exists")){ // No I18N
                $SolObj.pushingStateURL(module, forwardTo, id, tabName, view, mode,reqParam);
            }
            else if(forwardTo == "list" && from == "cancelForm"){
                $SolObj.pushingStateURL(module, forwardTo, id, tabName, view, mode);
            }
        });
    },
    pushingStateURL :function(module, forwardTo, id, tabName, view, mode,reqParam){
        var urlStr = "";  // No I18N
        function addParam(param) {
            urlStr += urlStr === "" ? "solutions?" : "&"; // No I18N
            urlStr += param;
        }

        if(id && id != "null"){
            addParam("entity_id=" + id); // No I18N
        }

        if(forwardTo != "list"){ // No I18N
            if(module=="solution" && (view=="preview" || mode=="add" || mode=="edit" || mode=="form")){
                if(view=="preview"){
                    addParam("mode=add&view=preview");// No I18N
                }else{
                    addParam("mode=" + mode); // No I18N
                    tabName="";
                }
            }else{
                addParam("mode=" + forwardTo); // No I18N
                if(forwardTo == "detail"){  //SD-115741
                    addParam("PORTALID="+PORTALID); // No I18N
                }
            }
        }else{
          addParam("mode=list");// No I18N
        }
        if(reqParam && reqParam!==""){
            addParam(reqParam);
        }
        if(forwardTo != "list" && tabName){ // No I18N
            urlStr += "#"+tabName;
        }
        if($SolObj.doPush){
            window.history.pushState({'forwardTo' : forwardTo, "entity_id": id, "tab": tabName, "module": module, "spa_skipstate" : true}, '', urlStr); // No I18N
        }else{
            $SolObj.doPush = true;
        }
    },

    //This function is return Logged in User's solution related permissions
    getPermissions: function(){
        var permissions = {};
        var roles = sdp_user.ROLES;
        permissions = {
            view: roles.indexOf("ViewSolutions") > -1, //No I18N
            add: roles.indexOf("CreateSolutions") > -1, //No I18N
            edit: roles.indexOf("ModifySolutions") > -1, //No I18N
            "delete": roles.indexOf("DeleteSolutions") > -1 //No I18N
        }
        return permissions;
    },
    //To get a active tab while url loading
    getActiveTab : function(){
        var tabNameinHash = window.location.hash && window.location.hash.substring(1);
        if(this.isStageChanged != true && tabNameinHash){
            return tabNameinHash;
        }
        //When no tabs name is available in a link feedback tab will be loaded
        return "feedback";   //No I18N
    },
    /*SD 117831-This function is used to check self approve permission*/
    checkSelfApprovePermission : function(){
        var links;
            sdpAjax({
                url: '/api/v3/solutions/_links', // No I18N
                success: function(resp) {
                   links  = resp._links;
                },
                async:false
            });
           return links.filter(operation => operation.name=="approve");

    },

    //To restore solutions from trash
         restore_solutions : function(id){

            showconfirm(true,'title='+translate('common.confirm')+', message='+translate("sdp.restore.confirmation",[translate('sdp.header.newsolution')])+', submitbutton=OK, cancelbutton=Cancel, closebutton=yes, closeOnEscKey=yes',function(confirm){    //No I18N
                if(confirm){
                    var url = "/api/v3/solutions/" + id + "/_restore_from_trash"; //No I18N
                    sdpAjax({
                        url: url,
                        type: "PUT", //No I18N
                        success: function(resp){
                            showalert('success', translate('sdp.restore.success',[translate('sdp.header.newsolution')]), "isAutoHide=true"); // No I18N
                            if($SolObj.fromPage == 'details'){

                                $SolObj.redirectTo("solution","list",null,null,"entity_not_exists"); //No I18N
                                $SolObj.deletedTopicID=null;
                            }
                            else{

                                $sol.tree.refreshTree();
                                $sol.list.refreshList()

                            }

                        }
                    })


                }
            });
         },

         //To get DeletionTimeLimit to cleanup solutions from trash
         getDeletionTimeLimit : function(){
                  var input_data = {"list_info" : {"row_count" : 25,// No I18N
                  "search_criteria" : {// No I18N
                     "field" : "parameter",// No I18N
                     "condition" : "eq",// No I18N
                     "value" : "DeletionTimeLimit",// No I18N
                     "logical_operator" : "AND"// No I18N
                  }
                  } };
                  var DeletionTimeLimit = 30;

                 sdpAjax({
                     url: "/api/v3/solution_settings", // No I18N
                     data : sdpAjaxInputData(input_data),
                     success: function(resp) {
                         DeletionTimeLimit=resp.solution_settings[0].paramvalue;
                     },
                     async: false
                 });
                 return DeletionTimeLimit
             },
         //Used to close the dialog box using its ID
         closeDialogBox : function(elementId){
             jQuery('#'+elementId).dialog('close');
         }



    }
var $sol = {

    /*
     * This Object is used to construct a topic tree data and Solution's form template
    */

    /** construct the topics data into tree view data for topic tree and select2 */
     constructListToTree: function (data, isList) {
         const ID_KEY = 'id'; //No I18N
         const PARENT_KEY = 'parent_id'; //No I18N
         const CHILDREN_KEY = isList ? 'item' : 'children'; //No I18N
         const map = {};

         data.forEach(function(treeObj){
             if(treeObj && treeObj[ID_KEY]){
                 map[treeObj[ID_KEY]] = treeObj;
                 treeObj[CHILDREN_KEY] = [];
             }
          });
         for (var i = 0; i < data.length; i++) {
             if (data[i][PARENT_KEY]) { // is a child
                 if (map[data[i][PARENT_KEY]] && map[data[i][PARENT_KEY]].id) // for dirty data
                 {
                     map[data[i][PARENT_KEY]][CHILDREN_KEY].push(data[i]); // add child to parent
                     data.splice(i, 1); // remove from root
                     i--; // iterator correction
                 } else {
                     data[i][PARENT_KEY] = 0; // clean dirty data
                 }
             }
         };
        return $sol.treeData = data;

     },
    /*Before Rendering form constructing template field changes*/
    constructTemplateInfo: function() {
        var _self = this;
        var template = {
            "created_time": null, //No I18N
            "updated_time": null, //No I18N
            "icon": null,  //No I18N
            "is_default": true, //No I18N
            "created_by": { //No I18N
                "email_id": null, //No I18N
                "phone": null, //No I18N
                "name": "System", //No I18N
                "mobile": null, //No I18N
                "profile_pic": { //No I18N
                    "content-url": "/images/default-profile-pic2.svg", //No I18N
                    "name": "default-profile-pic2.svg" //No I18N
                },
                "is_vipuser": false, //No I18N
                "id": "1", //No I18N
                "department": null //No I18N
            },
            "style_properties": null, //No I18N
            "inactive": false, //No I18N
            "draft": false, //No I18N
            "name": "Default Solution", //No I18N
            "updated_by": null, //No I18N
            "comment": "Default Template",  //No I18N
            "id": "1",  //No I18N
            "layouts":[]  //No I18N
        };
        //ispublic layout
        var isPublicLayout = {};
        isPublicLayout.sections = [{
				custom_section: true,
				partial: "sol-ispublic-template",	//No I18N
                has_fields: true,
				column_count: "1",	//No I18N
				field_align: "left-right",	//No I18N
				fields: [{
					name: "user_group_mapping",	//No I18N
                    position: {col: "1", col_size: "2", row: "1", row_size: "1"},	//No I18N
				}]
		}];
		isPublicLayout.has_fields = true;
		isPublicLayout.name = "-1";	//No I18N

        // Attachment layout
        var attachLayout = {};
        attachLayout.title = window.translate("sdp.common.attachments"); //No I18N
        attachLayout.name = "attachment";
        attachLayout.sections = [{
            type: "attachments",    //No I18N
            id: "attachments",  //No I18N
            container_id: "sol-attachment", //No I18N
            "collapsed_state":"collapsed", //No I18N
            options: {
                api: false,
                upload_api : true,
                upload :  true,
                enable_delete : true,
                is_odapi: true,
                download: true,
                entity: _self.form.entityNamePl,
                entity_id: _self.form.editId,
                entity_upload: _self.form.editId ? true : false
            }
        }];

        var associateValues={};
        if($sol.form  && $sol.form.associateType && $sol.form.associateType!="null"){
            if($sol.form.associateType.indexOf("PROBLEM")>-1){
                sdpAjax({
                    url: "/api/v3/problems/"+$sol.form.associateID, //No I18N
                    async:false,
                    cache:false,
                    success:function(data){
                        associateValues.title=data.problem.title;
                    }
                   });
            }else{
            sdpAjax({
            url: "/api/v3/requests/"+$sol.form.associateID, //No I18N
            async:false,
            cache:false,
            success:function(data){
                associateValues.title=data.request.subject;
                associateValues.description=data.request.resolution.content;
                if(data.request.resolution.resolution_attachments){
                    associateValues.has_attachments=true;
                    associateValues.attachments=data.request.resolution.resolution_attachments;
                }
            }
           });
        }
        }

        template[$SolObj.entityName]=Object.assign({}, associateValues);

        template.layouts.push(this.getLayoutSection_1());
        template.layouts.push(attachLayout);
        template.layouts.push(this.getLayoutSection_2());
        template.layouts.push(isPublicLayout);

        return template;
    },
    /*
     * This function returns the solution layout for name and tile fields
     */
    getLayoutSection_1: function(){
        var _self = this;
        var layout = {
            "name": "solution_template", //No I18N
            "sections": [ //No I18N
                {
                    "field_align": "left-right", //No I18N
                    "column_count": "1", //No I18N
                    "name": "-1", //No I18N
                    "collapsed_state": "expanded", //No I18N
                    "position": { //No I18N
                        "col": 1, //No I18N
                        "col_size": 1, //No I18N
                        "row": 1 //No I18N
                    },
                    "fields": [{ //No I18N
                            "name": "title", //No I18N
                            "position": { //No I18N
                                "col": 1, //No I18N
                                "col_size": 2, //No I18N
                                "row": 1, //No I18N
                                "row_size": 1 //No I18N
                            }
                        },
                        {
                            "name": "description",  //No I18N
                            "position": {  //No I18N
                                "col": 1,  //No I18N
                                "col_size": 2, //No I18N
                                "row": 2, //No I18N
                                "row_size": 1 //No I18N
                            },
                            "insertVideo": true, //No I18N
                            /* 109847 - Full screen view and resize option added for solution editor */
                            "resize" : true,    //No I18N
                            "allowFullscreen" : true,    //No I18N
                            /* SD-113361 - HTML editor option included in solution editor */
                            "edithtml": true,  //No I18N
                            "allowFullscreen" : true,    //No I18N
                            "allowVideoTypes":['mp4','webm'] //No I18N
                        }
                    ]
                }
            ]
        }
        return layout;
    },
    /*
     * This function returns the solution layout for topic, owner, review_date, expiry_date, keyword and comment fields
     */
    getLayoutSection_2: function(){
        var _self = this;
        var layout = {
            "name": "solution_template", //No I18N
            "sections": [ //No I18N
                {
                    "field_align": "left-right", //No I18N
                    "column_count": "2", //No I18N
                    "name": "-1", //No I18N
                    "collapsed_state": "expanded", //No I18N
                    "position": { //No I18N
                        "col": 1, //No I18N
                        "row": 2 //No I18N
                    },
                    "fields": [ //No I18N
                        {
                            "name": "topic", //No I18N
                            "position": { //No I18N
                                "col": 1, //No I18N
                                "col_size": 1, //No I18N
                                "row": 1, //No I18N
                                "row_size": 1 //No I18N
                            }
                        },
                        {
                            "name": "owner", //No I18N
                            "position": { //No I18N
                                "col": 2, //No I18N
                                "col_size": 1, //No I18N
                                "row": 1, //No I18N
                                "row_size": 1 //No I18N
                            }
                        },
                        {
                            "name": "review_date", //No I18N
                            "custom_render": $sol.form.renderReviewDate, //No I18N
                            "position": { //No I18N
                                "col": 1, //No I18N
                                "col_size": 1, //No I18N
                                "row": 2, //No I18N
                                "row_size": 1 //No I18N
                            }
                        },
                        {
                            "name": "expiry_date", //No I18N
                            "custom_render": $sol.form.renderExpiryDate, //No I18N
                            "position": { //No I18N
                                "col": 2, //No I18N
                                "col_size": 1, //No I18N
                                "row": 2, //No I18N
                                "row_size": 1 //No I18N
                            }
                        }
                    ]
                },
                {
                    "field_align": "left-right", //No I18N
                    "column_count": "1", //No I18N
                    "name": "-1", //No I18N
                    "collapsed_state": "expanded", //No I18N
                    "position": { //No I18N
                        "col": 1, //No I18N
                        "row": 2 //No I18N
                    },
                    "fields": [ //No I18N
                        {
                            "name": "keywords", //No I18N
                            "position": { //No I18N
                                "col": 1, //No I18N
                                "col_size": 2, //No I18N
                                "row": 1 //No I18N
                            }
                        },
                        {
                            "name": "operation_comment", //No I18N
                            "position": { //No I18N
                                "col": 1, //No I18N
                                "col_size": 2, //No I18N
                                "row": 2 //No I18N
                            }
                        }
                    ]
                }
            ]
        }
        return layout;
    },
};