/* $Id$ */
$sol.associations = {
    //To load a Association tab
    loadAssociations : function(){
        var _self = $sol.associations;
        if($sol.details.isTech){
             if(sdp_user.ROLES.indexOf("ViewRequests") != -1){
                _self.loadAssociatedRequests();
             }
             if(sdp_app.IS_PROBLEM_MODULE && sdp_user.ROLES.indexOf("ViewProblems") != -1){
                _self.loadAssociatedProblem();
             }
        }
        if(!isMSPOrSCP){
            _self.loadAssociatedSolutions();
            _self.updateLinkedSolutionsCount($sol.details.entity_data.id);
        }
    },
    //To load a associated request
    loadAssociatedRequests : function(){
        var _self = this;
        var table_info = {"list_info" : {"start_index" : "1", "row_count" : "10"}}; //No I18N
        var header_metadata = {
            id:{
                "display_name": translate("sdp.common.id"), //No I18N
                "value_path" : "request.id", // No I18N
                "width" : "60px"    // No I18N
            },
            subject: {
                "display_name": translate("sdp.common.subject"), //No I18N
                "width" : "130px", // No I18N
                "dataCelltransformer": _self.constructRequestSubject // No I18N
            },
            applied_by: {
                "display_name": translate("sdp.request.resolution.appliedby"),  //No I18N
                "dataCelltransformer": _self.constructAssociatedRequestDateField, // No I18N
                "width" : "190px"   // No I18N
            },
            tried_by:{
                "display_name": translate("sdp.request.resolution.triedby"),    //No I18N
                "dataCelltransformer": _self.constructAssociatedRequestDateField, // No I18N
                "width" : "190px"   // No I18N
            }
        }

        var inputData = {
                list_info: {
                    start_index: "1",
                    row_count: "10",
                    get_total_count: true
                }
        }
        if($SolObj.isRequestCheckEnabled==true)
        {
            jQuery("#solutiontype").prop('checked',true);// No I18N
            inputData.list_info.search_criteria = {"field" : "association_type","condition":"eq","value":"applied"}// No I18N
        }

        var options = {
            entity_name      : "associated_requests", //No I18N
            callbackURL      : "solutions/"+$sol.details.id+"/associated_requests", //No I18N
            tableHolder      : "associatedrequests", //No I18N
            paginationEnabled : true,
            row_inputdata : inputData,
            width : '100%',
            height : 'auto',    //No I18N
            default_sort_field : {
                sort_field : "associated_time",//No I18N
                sort_order : "desc" //No I18N
            },
            isODAPI : true,
            view: "table", //No I18N
            view_mode: "linear", //No I18N
            nodataString : '<div class="tc p15"><span>'+ translate("solution.associated.requests.empty")+'</span></div>',   //No I18N
            nodatabanner_callback : _self.nodatabanner_callback,
            nodataStringhgt : "75",

        }
        var table_content = {"header" : header_metadata }; //No I18N
        jQuery("#solutiontype").click(function(){
            if(this.checked){
                $SolObj.isRequestCheckEnabled=true;
                var search_criteria = {"field" : "association_type","condition":"eq","value":"applied"};  //No I18N
                _self.tableObjRequest.t_obj.table_info.list_info.search_criteria=search_criteria;
                _self.tableObjRequest.refreshTable("refresh"); //No I18N
            }
            else{
                $SolObj.isRequestCheckEnabled=false;
                delete _self.tableObjRequest.t_obj.table_info.list_info.search_criteria;
               _self.tableObjRequest.refreshTable("refresh");  //No I18N
            }
        });
        _self.tableObjRequest = new tableComponent(table_info,table_content,options);
    },
    //To load a associated problem
    loadAssociatedProblem : function(){
        var _self = this;
        var header_metadata = {
          "id" : { // No I18N
            "display_name": translate("sdp.common.id"), //No I18N
            "column_settings": { "view_type": "row" ,"rowposition":1 },  //No I18N
            "width" : "90px" //No I18N
          },
          "title":{ // No I18N
            "display_name": translate("common.title"), //No I18N
            "width" : "130px", // No I18N
            "dataCelltransformer": _self.constructProblemTitle // No I18N
          },
          "reported_by":{ // No I18N
            "display_name": translate("sdp.itil.common.reportedby"), //No I18N
             "width" : "100px"  // No I18N
          },
          "technician":{ // No I18N
            "display_name": translate("sdp.requests.viewrequest.listview.assignedto"), //No I18N
             "width" : "100px"  // No I18N
          },
          "category":{ // No I18N
            "display_name": translate("sdp.common.category"), //No I18N
            "width" : "100px" //No I18N
          },
          "priority":{ // No I18N
            "display_name": translate("common.priority"), //No I18N
          },
          "status":{ // No I18N
            "display_name": translate("sdp.requests.common.status"), //No I18N
          },
          "urgency":{ // No I18N
            "display_name": translate("sdp.itil.common.urgency"), //No I18N
          },

        };
        var table_info = {"list_info" : {"start_index" : "1", "end_index" : "2"}};    //No I18N
        var table_content = {"header" : header_metadata };   //No I18N
        var options = {
            entity_name      : "problem",     //No I18N
            tableHolder : "associated_problem",  //No I18N
            callbackDataGet : _self.getAssociatedProblemData,
            width : '100%',
            height : 'auto',    //No I18N
            view: "table", //No I18N
            view_mode: "linear", //No I18N
            nodataString : '<div class="tc p15"><span>'+ translate('solution.problem.nodata.message')+'</span></div>',  //No I18N

        }
        _self.tableObjProblem = new tableComponent(table_info,table_content,options);
    },
    //To load a Linked Solutions here
    loadAssociatedSolutions : function(){
        var _self = this;
        var table_info = {"list_info" : {"start_index" : "1", "row_count" : "10"}}; //No I18N
        var header_metadata = {
            "linked_solutions_head_chk": { //No i18N
                "default": true, //No i18N
                "type": "checkbox", //No i18N
            },
            "id": { //No I18N
                //"sortingEnabled": true, // No I18N
                "default": true, //No i18N
                "display_name": translate("sdp.common.id"), //No I18N
                "width" : "60px", // No I18N
                "value_path":"relationid.id"// No I18N
            },
            "title": { //No i18N
                "display_name":translate("sdp.common.title"), //No I18N
                "default": true, //No i18N
                "hide_label": true, //No i18N
                "sortable": true, // No I18N
                "width" : "130px", // No I18N
                "value_path":"relationid.title",// No I18N
                "dataCelltransformer": _self.constructSolutionTitle //No i18N
            },
            "topic": { //No I18N
                "display_name":translate("sdp.solutions.newsolution.topic"), //No I18N
                "default": true, //No i18N
                "sortable": true, // No I18N
                "width" : "130px", // No I18N
                "value_path":"relationid.topic.name"// No I18N
            },
            "type": { //No I18N
                "display_name":translate("common.type"), //No I18N
                "default": true, //No i18N
                "sortable": true, // No I18N
                "value_path":"relationid.type"// No I18N
            },
            "visibility" :{ //No I18N
                "display_name":translate("ae.cmdb.relationshipmap.visibility"), //No I18N
                "default": true, //No i18N
                "sortable": true, // No I18N
                "value_path":"relationid.is_public",// No I18N
                "dataCelltransformer": _self.constructSolutionVisibility //No i18N
            },
            "created_time": { //No I18N
                "display_name":translate("sdp.solutions.newsolution.createdon"), //No I18N
                "default": true, //No i18N
                "sortable": true, // No I18N
                "width" : "140px", // No I18N
                "value_path":"relationid.created_time.display_value"// No I18N
            },
            "created_by": { //No I18N
                "display_name":translate("sdp.solutions.newsolution.createdby"), //No I18N
                "default": true, //No i18N
                "sortable": true, // No I18N
                "width" : "100px", // No I18N
                "value_path":"relationid.created_by.name"// No I18N
            },
            "expiry_date" :{ //No I18N
                "display_name":translate("sdp.inventory.detailAsset.expiryDate"), //No I18N
                "default": true, //No i18N
                "sortable": true, // No I18N
                "value_path":"relationid.expiry_date.display_value"// No I18N
            }
        };
        if(!$sol.details.isTech){
            delete header_metadata.linked_solutions_head_chk;
            delete header_metadata.visibility;
            delete header_metadata.expiry_date;
        }
        if(!$sol.details.permissions.edit || $sol.details.entity_data.deleted_time!=null){
            delete header_metadata.linked_solutions_head_chk;
        }
        var table_content = {"header" : header_metadata }; //No I18N
        var options = {
            entity_name      : "solution_relations", //No I18N
            tableHolder : "linked_solutions", //No I18N
            callbackURL : "solutions/"+$sol.details.id+"/solution_relations", //No I18N
            sortingEnabled : true,
            row_inputdata : _self.rowDataConstructForAssociatedSolutions(table_info),
            bulkSelectionSetting:{
                constructSelectedListCB: function(row_data){
                    return '<span rel="uitip" mode_ellipsis=true title="'+e_attr(row_data.relationid.title)+'">#'+row_data.relationid.id+' '+ZSEC.Encoder.encodeForHTML(row_data.relationid.title)+'</span>';
                }
            },
            width : '100%',
            height : 'auto',    //No I18N
            default_sort_field : {
                sort_order : "asc" //No I18N
            },
            isODAPI : true,
            view: "table", //No I18N
            view_mode: "linear", //No I18N
            paginationEnabled : true,
            nodatabanner_callback : function(table_data){
                if(table_data.t_obj.options.paginationEnabled){
                    table_data.t_obj.options.paginationEnabled=false;
                    jQuery('#solutionRemoveLink').hide(); //No I18N
                }
            },
            nodataString : '<div class="tc p15"><span>'+translate("sdp.solution.listview.not.available")+'</span></div>',  //No I18N
            nodataStringhgt : "75",
            isFR_ListInfo_Support : true,




        }
        _self.tableObjAssociatedSolution = new tableComponent(table_info,table_content,options);
    },

    //To construct a request's subject
    constructRequestSubject: function(rd){
        var rd = rd.row_data;
        return '<a href="/WorkOrder.do?woMode=viewWO&woID='+rd.request.id+'" data-event="click" data-handler="requestListViews.showRequestPreview('+rd.request.id+',event)" nonce='+sdpNonce+' rel="uitip" mode_ellipsis=true title="'+e_attr(rd.request.subject)+'">'+ZSEC.Encoder.encodeForHTML(rd.request.subject)+'</a>'; //No I18N
    },

    //To construct a request Applied By details
    constructAssociatedRequestDateField: function(rd){
        var row_data = rd.row_data;
        var head_data = rd.head_data;
        if(head_data.id == "applied_by" && row_data.association_type == 'applied'){
            return $sol.associations.convertLongToDateFormat(row_data);
        }
        else if(head_data.id == "tried_by" && row_data.association_type == 'tried'){
            return $sol.associations.convertLongToDateFormat(row_data);
        }
        else{
            return '<div class="d_w">-</div>';
        }
    },
    /* This function is used to convert Long to Date */
    convertLongToDateFormat : function (row_data){
        var convertedDate = new Date(row_data.associated_time);
        var dateAndTime = sdpDate.format({"entire_date" : convertedDate , "type" : "D MMMM , YYYY hh:mm A"});  //No I18N
        var detailsWithDateAndTime = ZSEC.Encoder.encodeForHTML(row_data.associated_by.name)+' '+translate('sdp.common.on')+' '+dateAndTime;
        return '<span class="text-color2" rel="uitip" mode_ellipsis="true" title="'+e_attr(detailsWithDateAndTime)+'">'+detailsWithDateAndTime+'</span>';
    },

    //To construct a associated solutions title here
    constructSolutionTitle: function(table_data){
        var rd = table_data.row_data;
        var titleClass = '';
            if($sol.list.current_view_mode == 'linear'){
                titleClass = 'uni-heading'; // No I18N
            }
        var title = "";
            title = '<div class="ui-tooltip-style-1"><span class="disp-t"> <span class="disp-c"><span class="hspr icon-md ri-solutn ml-5 mr5"></span></span> <span class="sb vmiddle disp-c text-color4">'+ZSEC.Encoder.encodeForHTML(rd.relationid.title)+'</span></span>'+'</div>';
        return '<a data-event="click" data-handler="$sol.details.openSolutionDetailsPreview('+rd.relationid.id+')" nonce='+sdpNonce+' class="'+titleClass+'" href="/ui/solutions?entity_id='+rd.relationid.id+'&mode=detail&PORTALID='+PORTALID+'" rel="uitip noopener" mode_html="true" title="'+e_attr(title)+'" ">'+ZSEC.Encoder.encodeForHTML(rd.relationid.title)+'</a>';//No I18N  //SD-115741
    },

    //To construct a associated solutions visibility here
    constructSolutionVisibility : function(table_data){
        var rd = table_data.row_data;
        var title = translate("sdp.solution.listview.privatesolutions");//No I18N
        var iconclass = "lock-line-clr"; //No I18N
        var text = translate("sdp.dashboard.common.private")
        if(rd.relationid.is_public){
            text = translate("sdp.dashboard.common.public")
            title = translate("sdp.solution.listview.publicsolutions"); //No I18N
            iconclass = "public-filter"; //No I18N
        }
        return  '<div class="disp-flex valign-center">'+
                    '<span class="cspr icon-sm '+iconclass+' mr3 shrink0 top0" rel="uitip" title="'+title+'"></span>'+
                    '<span class="text-overflow">'+text+'</span>'+
                '</div>';
    },
    //This call back is used to hide the pagination details when no data is available
    nodatabanner_callback : function(table_data){
        if(table_data.t_obj.options.paginationEnabled){
            table_data.t_obj.options.paginationEnabled=false;
        }
    },
    //To construct a problem title field
    constructProblemTitle : function(rd){
         var rd = rd.row_data;
         return '<a href="/ui/problems?mode=detail&entity_id='+rd.id+'" rel="uitip" mode_ellipsis=true rel="noopener" title="'+e_attr(rd.title)+'" data-event="click" data-handler="$previewComponent.load(\'/ui/problems?mode=detail&entity_id='+rd.id+'&externalframe=true\',\''+getMessageForKey("request.problem.associated")+'\',null,null,null,\'listview_popup\');" nonce='+sdpNonce+'>'+ZSEC.Encoder.encodeForHTML(rd.title)+'</a>';
    },

    //To construct a associated problem data here
    getAssociatedProblemData : function(){
        var _self = $sol.details;
        var problem = [];
        var problemDetails = {};
        var dataObject = {};
        if(_self.entity_data.problem_resolution != null || _self.entity_data.problem_workaround != null){
            var problemId = "";
            if(_self.entity_data.problem_resolution != null){
                problemId = _self.entity_data.problem_resolution.id;
            }
            else if(_self.entity_data.problem_workaround){
                problemId = _self.entity_data.problem_workaround.id;
            }
            if(sdp_user.ROLES.contains("ViewProblems")){
                sdpAjax({
                    url: "/api/v3/problems/"+ problemId, // No I18N
                    type: "GET", //No I18N
                    success: function(resp) {
                        if (resp.response_status && resp.response_status.status == "success") {
                           problemDetails["id"] = problemId;
                           problemDetails["title"] = resp.problem.title;
                           var requiredFields = ['reported_by','technician','category','priority','status','urgency'];  //No I18N
                           for(i=0;i<requiredFields.length;i++){
                                if(resp.problem[requiredFields[i]] != null){
                                    problemDetails[requiredFields[i]] = resp.problem[requiredFields[i]].name;
                                }
                            }
                        }
                    },
                    async: false
                });
            }
        }
        if(Object.keys(problemDetails).length !== 0){
            problem.push(problemDetails);
            dataObject["problem"] = problem;
            return dataObject;
        }
        else{
            return {"problem" :[]}  //No I18N
        }
    },

    //To construct a list info for Linked solutions in details page
    rowDataConstructForAssociatedSolutions : function(table_info){
        var fields_required_arr = [];
        var inputObject = {};
        inputObject.list_info = table_info.list_info;
        fields_required_arr.push("relationid.id"); //No I18N
        fields_required_arr.push("relationid.title"); //No I18N
        fields_required_arr.push("relationid.topic"); //No I18N
        fields_required_arr.push("relationid.created_time"); //No I18N
        fields_required_arr.push("relationid.is_public"); //No I18N
        fields_required_arr.push("relationid.created_by"); //No I18N
        fields_required_arr.push("relationid.expiry_date"); //No I18N
        fields_required_arr.push("relationid.type"); //No I18N
        inputObject.fields_required = fields_required_arr;
        inputObject.list_info.sort_field = "relationid.id";  //No I18N
        return inputObject;
    },
    //To update a Linked solutions count when delink the solution and hide the attach button when linked solution count reach to 100
    updateLinkedSolutionsCount : function(solutionId){
        var input_data = {"list_info": {"fields_required" : ["relationcount"]}}; // No I18N
        sdpAjax({
            url: "/api/v3/solutions/" + solutionId + "/_summary", // No I18N
            data:sdpAjaxInputData(input_data),
            success: function(resp) {
                var relationsCount = resp.solution_summary.relationcount;
                if(relationsCount >= 100){
                    window.top.jQuery("#solutionLink").hide();
                }
                jQuery("#linkedsolutions").html(relationsCount);   // No I18N
            },
            async: false
        });
    },
}
