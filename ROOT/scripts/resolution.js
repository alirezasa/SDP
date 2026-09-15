 /*$Id$ */
var req_rsln = (function($){
var r = {};
var JD  = jQuery(document);
    r.showallSolutions = function(eleId,copyEle,association_type) {
        var startIndex, endIndex = JD.find("#end_index").val();
        /** if this fn is invoked even before the resolution tab is loaded completely, the endIndex element will not be available */
        if(isNaN(parseInt(endIndex))) {
          return;
        }
        startIndex = parseInt(endIndex) - 4 ; 
        JD.find("#end_index").val(parseInt(endIndex) + 5);
        var request_id  = req_details ? $req.details.request_info.id : JD.find("#request_id").val();
        var inputObject = {};
        var list_info   = {};
        var search_fields = {};
        list_info.start_index = startIndex.toString();
        if(eleId != "mrk_sln") {
          list_info.end_index   = endIndex.toString();
        }
        list_info.sort_field = "associated_time"; // No I18N
        list_info.sort_order = "desc";        // No I18N
        if(association_type == "applied"){
          list_info.search_criteria = { field: 'association_type', value: 'applied', condition: 'contains' }; //No I18N
        }
        inputObject.list_info = list_info;
        var dataVal = sdpAjaxInputData(inputObject);
        sdpAjax({
          url: '/api/v3/requests/'+request_id+'/associated_solutions', // No I18N
          data: dataVal,
          success: function(jsonArray) {
              var sln_obj = jsonArray.associated_solutions;
              if (sln_obj.length > 0) {
                  if(association_type != "applied" ){
                    if(jsonArray.list_info.has_more_rows == true){
                      jQuery("#viewmore_"+eleId).show();
                    }else{
                      jQuery("#viewmore_"+eleId).hide();
                    }
                  }
                  if(eleId=="mrk_sln") {              // No I18N
                    jQuery("#mrk_sln_list").show();
                  }
                  jQuery("#no_"+eleId).hide();
                  var sln_ids = JD.find("#sln_id_list").val();
                  var divEle = jQuery("<div></div>"); // No I18N
                  jQuery.each(sln_obj, function(index, jsonObject) {
                        jsonObject.request_sln_id = jsonObject.id;
                      if(jsonObject.association_type != "tried"){
                        jsonObject.associated       = getMessageForKey("sdp.request.resolution.appliedby"); // No I18N
                        jsonObject.associatedby     = encodeHTML(jsonObject.associated_by.name);
                        jsonObject.associatedon     = jsonObject.associated_time.display_value;
                        jsonObject.comments_show   = "hide"; // No I18N
                        jsonObject.association_type_style = "success"; // No I18N
                        jsonObject.delete_title     = getMessageForKey("sdp.request.resolution.removeappliedsln"); // No I18N
                        jsonObject.operation_id     = "applied"; // No I18N
                        jsonObject.association_type_title = getMessageForKey("sdp.request.resolution.appliedslntitle"); // No I18N
                        if(jsonObject.association_type == "applied"){
                          jsonObject.request_id       = request.id;
                        }
                      }else{
                        jsonObject.associated       = getMessageForKey("sdp.request.resolution.triedby"); // No I18N
                        jsonObject.association_type_style = "warning2"; // No I18N
                        jsonObject.associatedby     = encodeHTML(jsonObject.associated_by.name);
                        jsonObject.associatedon     = jsonObject.associated_time.display_value;
                        jsonObject.delete_title     = getMessageForKey("sdp.request.resolution.removetriedsln"); // No I18N
                        jsonObject.operation_id     = jsonObject.id;
                        jsonObject.request_id       = request.id;
                        jsonObject.association_type_title = getMessageForKey("sdp.request.resolution.triedslntitle"); // No I18N
                        if(jsonObject.comments ==null){
                          jsonObject.comments ="-";
                        }
                        else {
                          jsonObject.comments = encodeHTML(jsonObject.comments);
                        }
                      }
                      if(jsonObject.solution.description ==null){
                          jsonObject.sln_description ="-";
                        } else {
                          jsonObject.sln_description  = jsonObject.solution.description;
                        }
                    jsonObject.sln_title        = encodeHTML(jsonObject.solution.title);
                    jsonObject.sln_id           = jsonObject.solution.id;

                    sln_ids = sln_ids ? sln_ids + "," + jsonObject.sln_id  :  jsonObject.sln_id;
                    var parentDiv = getHtmlForTemplate(copyEle, jsonObject, false); // No I18N
                    jQuery(divEle).append(parentDiv);

                  });
                  JD.find("#"+eleId).append(jQuery(divEle).html()); // No I18N

                  //Adding event listeners
                   (eleId==='mrk_sln') && // No I18N
                     jQuery('#mrk_sln').find('a').off('click').on('click',function(event){ // No I18N
                     let ele= jQuery(event.currentTarget);
                     let sln_id = ele.data('sln_id'); // No I18N
                     let request_sln_id=ele.data('request_sln_id'); // No I18N
                     showURLInDialog(`/workorder/SolutionPopup.jsp?sln_id=${sln_id}&request_solution_id=${request_sln_id}`,'modal=yes,closeButton=no,width=860,position=absmiddle');//NO I18N
                     return false;
                   });

                  jQuery('#sln_list #delete-soln').off("click").on("click", function(event){  // No I18N
                    var sln_id = jQuery(this).attr('data-request-sln-id');
                    req_rsln.slnReqDeAss(sln_id);
                  });

                  jQuery('#sln_list [data-cs-field="solution_link"]').off("click").on("click", function(event){// No I18N
                    var sln_id = jQuery(this).attr('data-sln-id');
                    var req_status_close = jQuery(this).attr('data-req-status-close')
                    showURLInDialog('/workorder/SolutionPopup.jsp?sln_id='+sln_id+'&reqStatusClose='+req_status_close,'modal=yes,closeButton=no,width=860,position=absmiddle'); // No I18N
                    return false;
                    });

                    jQuery('#sln_list #soln_comments_link').off("click").on("click", function(event){// No I18N
                      var request_sln_id = jQuery(this).attr('data-request-sln-id');
                      showURLInDialog('/workorder/popup_inference.jsp?request_sln_id='+request_sln_id+'&request_id='+request_id,'modal=yes,closeButton=no,width=610,position=absmiddle'); // No I18N
                    });

                  JD.find("#sln_id_list").val(sln_ids);
              }else if(eleId=="mrk_sln") {              // No I18N
                jQuery("#mrk_sln_list").hide();
              } else {
                jQuery("#no_"+eleId).show();
                JD.find("#"+eleId).html("");
               // jQuery("#viewmore_"+eleId).hide();
                JD.find("#sln_id_list").val("");
              }
          },
          async :false
      })
    },
    r.searchAllSoltnOnKeyUp = function(solnsrch,e){
      var srchTerm = solnsrch.value;

      if((srchTerm.length>0&&srchTerm.charAt(srchTerm.length-1)==' ')  || e.key === 'Enter'){
        JD.find("#end_index").val(5);
        JD.find("#sln_id_list").val("");
        JD.find("#suggested_sln_list").html("");
        //SD-84092 : Search in all solution under resolution tab return result based on the topic filter applied on solution listview
        r.showSuggestSolutions();
      }
    },
    r.searchFieldItems = function(){
      var searchFields = null;
      jQuery('#solutionSdmenu > li').each(function() {
        if(jQuery( this ).hasClass( 'checkmark' )){
              var searchFieldId = jQuery( this ).attr('id');
            if(searchFields != null ) {
              searchFields = searchFields + searchFieldId.substring(9)+ ":" ;
            }else{
              searchFields = searchFieldId.substring(9) + ":" ;
            }
          }
        });
      return searchFields;
    },
    r.showSuggestSolutions = function(){
        var startIndex, endIndex = JD.find("#end_index").val();
        startIndex = parseInt(endIndex) - 4 ;
        JD.find("#end_index").val(parseInt(endIndex) + 5);
        var request_id = req_details ? $req.details.request_info.id : JD.find("#request_id").val();
        var inputObject = {}, list_info = {}, search_fields = {}, solutions = {}, topic = {},search_criteria = [];
        var fields_required = ["id","title","description","is_public"];    // No I18N
        list_info.start_index = startIndex.toString();
        list_info.row_count = endIndex.toString();
        list_info.filter_by={name:"ApprovedSolutions"};  // No I18N
        var searchText = (JD.find('#sln_searchtext').val()).trim();
        if(searchText != ""){
             //For field specific search
			 getSearchFieldPersonalization();
            if(jQuery("#solnsrch_Entire_Content").hasClass("checkmark")){
                list_info.gsearch = searchText;
            }
            else{
              var search_options = "";
              if(jQuery("#solnsrch_Title").hasClass("checkmark")){
                search_options = "title:";  // No I18N
              }
              if(jQuery("#solnsrch_Topic").hasClass("checkmark")){
                search_options = search_options +"topic:";  // No I18N
              }
              if(jQuery("#solnsrch_Description").hasClass("checkmark")){
                search_options = search_options + "description:";   // No I18N
              }
              if(jQuery("#solnsrch_Keywords").hasClass("checkmark")){
                search_options = search_options + "keywords:";  // No I18N
              }
              list_info.gsearch = search_options + searchText;
            }
        }
        else{
          if(JD.find("#topicID").val() == "-1"){ //SD-110480
          list_info.gsearch = getSearchStringForSuggestSolutions();
        }
        }
        list_info.fields_required = fields_required;
        inputObject.list_info = list_info;
        if(JD.find("#topicID").val() != "-1"){
          topic.id = JD.find("#topicID").val();
          if(topic.id<1 && searchText =="" ){
            delete list_info.gsearch;
          }
          else if(topic.id>0)
          search_criteria.push({
            "field":"topic.id", // No I18N
            "condition":"eq", // No I18N
            "value": topic.id  // No I18N
        });
        }
        var associatedIds=r.getAssociatedSolutions();
        if(associatedIds.length){
          search_criteria.push({
            "field":"id", // No I18N
            "condition":"not in", // No I18N
            "values": associatedIds, // No I18N
            "logical_operator":"and" // No I18N
        });
        }
        if(search_criteria.length){
          inputObject.list_info.search_criteria=search_criteria;
        }

        var dataVal = sdpAjaxInputData(inputObject);
        sdpAjax({
          url: '/api/v3/solutions',  // No I18N
          data: dataVal,
          success: function(jsonArray) {
            var sln_obj = jsonArray.solutions;
              if (sln_obj.length > 0) {
               if(jsonArray.list_info.has_more_rows == true){
                  JD.find("#more_sugg_sln").show();
                }else{
                  JD.find("#more_sugg_sln").hide();
                }
                JD.find("#norecords").hide();
                if(searchText == "" && JD.find("#topicID").val() == "-1"){
                  JD.find('#sugg_sln_head').show();
                }else{
                  JD.find('#sugg_sln_head').hide();
                }
                var sln_ids= JD.find("#sln_id_list").val();
                var divEle = jQuery("<div></div>"); // No I18N
                jQuery.each(sln_obj, function(index, jsonObject) {
                    jsonObject.request_id = request_id;
                    var temp = jsonObject["is_public"];
                    if(jsonObject.short_description == null){
                      jsonObject.short_description ="-";   // No I18N
                      }
                    if(temp === true) {
                      jsonObject.pub_private = "cspr unlock-line icon-sm";  // No I18N
                      jsonObject.privatetitle= getMessageForKey("sdp.solution.listview.publicsolutions"); // No I18N
                    }else{
                      jsonObject.pub_private = "cspr lock-line-clr icon-sm"; // No I18N
                      jsonObject.privatetitle= getMessageForKey("sdp.solution.listview.privatesolutions"); // No I18N
                    }
                    jsonObject.title = encodeHTML(jsonObject.title);
                    var parentDiv = getHtmlForTemplate("suggested_sln", jsonObject, false); // No I18N
                    jQuery(divEle).append(parentDiv);
                    sln_ids = sln_ids ? sln_ids + "," + jsonObject.id  :  jsonObject.id;
                });
                JD.find("#suggested_sln_list").append(jQuery(divEle).html()); // No I18N
                JD.find("#sln_id_list").val(sln_ids);

                //Adding event listeners for Solutions under resolution
                jQuery('#suggested_sln_list [data-cs-field="solution_link"]').off("click").on("click", function(event){ // No I18N
                  var sln_id = jQuery(this).attr('data-sln-id');
                  var req_status_close = jQuery(this).attr('data-req-status-close')
                  showURLInDialog('/workorder/SolutionPopup.jsp?sln_id='+sln_id+'&reqStatusClose='+req_status_close,'modal=yes,closeButton=no,width=860,position=absmiddle'); // No I18N
                  return false;
                  });

                  jQuery('#suggested_sln_list [data-cs-field="copy_solution"]').off("click").on("click", function(event){ // No I18N
                    var sln_id = jQuery(this).attr('data-soln-id');
                    req_rsln.setActiveTabSugg('copy' ,request_id,sln_id); // No I18N
                    });

                    jQuery('#suggested_sln_list #triedsolutn').off("click").on("click", function(event){ // No I18N
                      var sln_id = jQuery(this).attr('data-soln-id');
                      showURLInDialog('/workorder/popup_inference.jsp?sln_id='+sln_id+'&request_id='+request_id,'modal=yes,closeButton=no,width=610,position=absmiddle'); // No I18N
                      });
              }
              else{
              if(searchText == "" && JD.find("#topicID").val() == "-1"){
                JD.find("#norecords .innner").text(getMessageForKey("sdp.request.resolution.noSuggestion.message"));  // No I18N
              } else {
                JD.find("#norecords .innner").text(getMessageForKey("sdp.solutions.home.popularsolutions.nosolutions"));  // No I18N
              }
              JD.find("#norecords").show();
                JD.find('#sugg_sln_head').hide();
                JD.find("#more_sugg_sln").hide();
                JD.find("#suggested_sln_list").html("");
                JD.find("#sln_id_list").val("");
              }
          },async:false
      });
    },
    r.tabRedirect = function(){

    },
    r.tabSwitching = function (ele,loggedin){
        JD.find(ele).addClass('active').siblings().removeClass('active');
        var id = JD.find(ele).attr('data-switch');
        JD.find('.sdtab-content').find('#suggested_sln_list,#sln_list,#mrk_sln').empty().end().find('#'+id).show().siblings('div').hide();
        JD.find(".searchHide").hide();
        jQuery("#end_index").val(5);
        JD.find("#sln_id_list").val("");
        if(id == "tab1"){ // No I18N
          var resolution_url = jQuery("#resolution_url").val();
          var resol_cont=jQuery("#resln_cont");
          resol_cont.load(resolution_url,function(){ // No I18N
            bindResolutionEvents(resol_cont)
            if(document.getElementById("woStatus_Id") != null){
                document.getElementById("woStatus_Id").value = document.getElementById('Inline_STATUSID').value;
            }
            //SD-119569 : Instead getting resolution from JSP we can get from global object of request info.
            var descContent = $req.details.request_info.resolution && $req.details.request_info.resolution.content ? $req.details.request_info.resolution.content : "";
            descContent = appendImageToken(descContent, $req.details.request_info.image_token);
            if(resolution_url.indexOf("editResolution") == -1){
                if(descContent!="" && (!loggedin || loggedin.toLowerCase() !== "requester")  && (jQuery.inArray('ViewSolutions',sdp_user.ROLES) != -1)){
                  r.showallSolutions("mrk_sln","copymarked_sln","applied"); // No I18N
                }
              }
              else{
                var solutionId = jQuery("#sln_Obj").val();
                var slnObj="" ;
                if(solutionId !=""){
                  slnObj     = req_rsln.getSolutionContent(solutionId);
                }
                var concatDesc = "";
                if(slnObj != ""){
                  var title = "<div>"+getMessageForKey("sdp.common.title")+" : "+encodeHTML(slnObj.title)+"<br>";
                  var desc  = getMessageForKey("sdp.common.desc")+" : "+slnObj.description+"<br><br>";
                  concatDesc = title + desc;
                }
                if(descContent!=""){
                  descContentConcat = descContent;
                  //SD-80157 fix - everytime br tags gets added even if the solution is empty
                  if(concatDesc!=""){
                   descContentConcat +="<br><br>"+  concatDesc +"</div>";
                  }
                }else{
                  descContentConcat =  concatDesc +"</div>";
                }

                descContent = descContentConcat;
                jQuery("#sln_Obj").val("");
                jQuery("#resolution_url").val(getResolutionURL());
            }
            //SD-119569 : Setting value directly to editor instead of setting it as inner html as the resolution to avoid unwanted encoding and decoding.
            zeditor({element:'HTMLDesc_Focus',customName:"resolution_editor",focus:true, imgParameters:{module:"WorkOrder"}, showAsVideo: true,acceptODCompatible: true,inlineimagesAPI:'/api/v3/requests/'+request_id.value+'/images',content:descContent});// No I18N
            $req.prop.checkResolutionStatus = false;
            if($req.details.request_info.status) {
              let ele= jQuery("<em class='priority-badge mr5' style='background-color:"+e_attr($req.details.request_info.status.color)+"'>&nbsp;</em>"+e_html($req.details.request_info.status.name)+'<span class="caret ml5"></span>');
              jQuery("[name=resolution_status]").find("[name=viewWOStatus]").append(ele); //NO I18N
            }
          });
        }else if(id == "tab2"){ // No I18N
          var topicId=null;
          if(JD.find("#topicID").val() != "-1"){
           topicId = JD.find("#topicID").val();
          }
          JD.find("#topicsTreeViewDiv,#topicID").empty();
          JD.find("#topicID").append("<option class=\"combolevel00\" id=\"-1\" value=\"-1\">"+getMessageForKey("sdp.solutions.newsolution.choosetopic")+"</option>");
          JD.find("#topicID").append("<option class=\"combolevel00\" id=\"OPTIONTopicID_0\" value=\"0\">&#8226;&nbsp;"+getMessageForKey("sdp.solutions.topics.alltopics")+"</option>");
          JD.find(".searchHide").show();
          constructTopicStructure();
          if(topicId != null){
            JD.find("#topicID").val(topicId);
            //SD-113828-selected topic from solution tab should be retained after switching the tabs under resolution
            var topicDivID="OPTIONTopicID_"+topicId;// No I18N
            var topicName=JD.find("#"+topicDivID).text()
            JD.find("#s2id_topicID").find(".select2-chosen").text(topicName);
          }
          r.showSuggestSolutions();
          show_bs_menu();
        }
        else if(id == "tab3"){ // No I18N
          r.showallSolutions("sln_list","applied_list_cont"); // No I18N
        }
    },
    r.getSolutionContent = function(sln_id){
      var slnObj="";
      sdpAjax({
          url: '/api/v3/solutions/'+sln_id, // No I18N
          success: function(resp) {
            slnObj = resp.solution;
             //To append image token while rendering solution content in request resolution
            slnObj.description = appendImageToken(slnObj.description, slnObj.image_token);
          },
          async:false
        });
      return slnObj;
    },
    r.searchByTopicId = function(){
      JD.find("#sln_searchtext").val("");
      JD.find("#end_index").val(5);
      JD.find("#sln_id_list").val("");
      JD.find("#suggested_sln_list").empty();
      r.showSuggestSolutions();
    },
    r.slnReqDeAss = function(sln_req_id){
      sdpAjax({
          url: '/api/v3/solution_to_request/'+sln_req_id, // No I18N
          type: 'DELETE', // No I18N
          success: function(jsonArray) {
             if(jsonArray.response_status.status == "success"){
                 showsdpMessage(getMessageForKey("sdp.request.resolution.remove.success.message"),'success',5000);   // No I18N
                JD.find("#end_index").val(5);
                JD.find("#sln_id_list").val("");
                JD.find("#sln_list").empty();
                r.showallSolutions("sln_list","applied_list_cont"); // No I18N
                //resolution tab change based on solution suggestions and solution removed from tried list
                isSuggestionsAvailable(req_details ? $req.details.request_info.id : document.getElementById("request_id").value);
             }
          }
      });
    },
    r.slnToReqAss = function(association_type,request_id,solution_id,comments,request_sln_id){
      var inputObject = {};
      var solution_to_request = {};
      var type = 'PUT';// No I18N
      if(request_sln_id == "" || request_sln_id == null || request_sln_id == undefined ){
        solution = {},request = {},idval={},idval1={};
        idval.id=request_id;
        solution_to_request.request = idval;
        idval1.id=solution_id;
        solution_to_request.solution = idval1;
        solution_to_request.association_type = association_type;
        type='POST';// No I18N
        request_sln_id="";
      }
      solution_to_request.comments = comments;
      inputObject.solution_to_request = solution_to_request;
      var dataVal = sdpAjaxInputData(inputObject);
      sdpAjax({
          url: '/api/v3/solution_to_request/'+request_sln_id, // No I18N
          type: type, // No I18N
          data : dataVal,
          success: function(jsonArray) {
             if(jsonArray.response_status.status == "success"){
               if(type == "POST") {                         // No I18N
                 showsdpMessage(getMessageForKey("sdp.request.resolution.try.success.message"),'success',5000);  // No I18N
               } else {
                 showsdpMessage(jsonArray.response_status.messages[0].message,'success',5000);
               }
             }
          },
          async:false
      });
    },
    r.addComments = function(srcDivId,request_sln_id){
      var request_id  = req_details ? $req.details.request_info.id : JD.find("#"+srcDivId+" #request_id").val();
      var solution_id = JD.find("#"+srcDivId+" #sln_id_p").val();
      var comments   = JD.find("#"+srcDivId+" #infer_cont").val();
      r.setActiveTabSugg("tried",request_id,solution_id,comments,request_sln_id); // No I18N
      closeDialog();
    },
    r.setActiveTabSugg = function(association_type,request_id,sln_id,comments,request_sln_id){
      if(association_type == "copy" ){
        jQuery("#sln_Obj").val(sln_id);
        var params = "&editResolution=true&copySln=true&sln_id="+sln_id; // No I18N
        if(window.externalframe){
          params = params+'&externalframe=true'; // NO I18N
        }
        jQuery("#resolution_url").val(getResolutionURL(params));
        jQuery('#attachfiles').addClass('hide');
      }
      else if(association_type == "tried"){
        req_rsln.slnToReqAss(association_type,request_id,sln_id,comments,request_sln_id);
      }
      if(association_type == "copy"){
        jQuery(".sugs-tabs").find('li[data-switch="tab1"]').trigger('click');
      }
      else if(association_type == "tried"){
         if(request_sln_id == "" || request_sln_id == null || request_sln_id == undefined ){
            jQuery(".sugs-tabs").find('li[data-switch="tab2"]').trigger('click');
            // resolution tab change based on solution suggestions and solution moved to tried list
            isSuggestionsAvailable(request_id);
          } else {
            jQuery(".sugs-tabs").find('li[data-switch="tab3"]').trigger('click');
          }
      }
    },
    r.loadSolutionDetail = function(sln_id,showbtmfooter){
      var request_id    = req_details ? $req.details.request_info.id : parent.document.getElementById("request_id").value;
      var jD = jQuery(document);
      var jsonObject={};
      var sln_id_list;
       if("false" == showbtmfooter) {
          sln_id_list = sln_id;
       } else {
          sln_id_list   = parent.document.getElementById("sln_id_list").value;
       }
      jsonObject.dsolnid = sln_id;
      jsonObject.request_id = request_id;
      jsonObject.PORTAL_ID = PORTALID;  //SD-115741
      sdpAjax({
          url: '/api/v3/solutions/'+sln_id, // No I18N
          success: function(jsonArray) {
            if(jsonArray.response_status.status == "success"){
              var jsonOutput = jsonArray.solution;
              var sln_id_array = new Array();
              sln_id_array = sln_id_list.split(",");
              var curr_sln_id = sln_id_array.indexOf(sln_id.toString());
              if((curr_sln_id + 1) == sln_id_array.length){
                jsonObject.hasNextClass = "ui-opacity3"; // No I18N
              }
              if((curr_sln_id + 1) == 1){
                jsonObject.hasPrevClass = "ui-opacity3"; // No I18N
              }
              if(sln_id_array.length==1){
                jQuery("#navigation").hide();
              }
              var temp = jsonOutput["is_public"];
              if(temp === true) {
                jsonObject.pub_private = "cspr unlock-line icon-sm";  // No I18N
                jsonObject.privatetitle= getMessageForKey("sdp.solution.listview.publicsolutions"); // No I18N
              }else{
                jsonObject.pub_private = "cspr lock-line-clr icon-sm"; // No I18N
                jsonObject.privatetitle= getMessageForKey("sdp.solution.listview.privatesolutions"); // No I18N
              }
              jsonObject.dsolntitle = encodeHTML(jsonOutput.title);
              jsonObject.dsolntopic = encodeHTML(jsonOutput.topic.name);
              //SD-83179 Updated time will be null for newly created solutions.
              if(jsonOutput.last_updated_time!=null){
              jsonObject.dsolnupdated = jsonOutput.last_updated_time.display_value;
              }
              jsonObject.dsolnviews = "("+jsonOutput.no_of_hits +" Views)";
              if(jsonOutput.description ==null){
                jsonObject.dsolndesc ="-";
                } else {
                  //To append image token while viewing solution details from request- tried solution/solutions
                  jsonObject.dsolndesc  = appendImageToken(jsonOutput.description, jsonOutput.image_token);
                }
            }
          },
          async:false
      });
      if( "false" == showbtmfooter) {
        jsonObject.btmboxsctn   = "hide"; // No I18N
        jsonObject.applieddiv   = "hide"; // No I18N
        jsonObject.suggslnsdiv  = "hide"; // No I18N

      }
      else if(request_id != "" && request_id != "null" && request_id != undefined){
        var inputObject = {};
        var list_info = {};
        list_info.search_criteria = { field: 'solution', value: sln_id, condition: 'eq' }; //No I18N
        inputObject.list_info = list_info;
        var dataVal = sdpAjaxInputData(inputObject);
        sdpAjax({
          url: '/api/v3/requests/'+request_id+'/associated_solutions', // No I18N
          data: dataVal,
          success: function(jsonArray) {
            if(Array.isArray(jsonArray.response_status) && jsonArray.response_status.length && jsonArray.response_status[0].status == "success"){ //No I18N
              if(jsonArray.associated_solutions.length > 0){
                  var jsonOut = jsonArray.associated_solutions[0];
                  jsonObject.suggslnsdiv  = "hide"; // No I18N
                  jsonObject.applied_by   = encodeHTML(jsonOut.associated_by.name);
                  jsonObject.applied_on   = jsonOut.associated_time.display_value;
                if(jsonOut.association_type == "applied"){
                  jsonObject.btmboxsctn   = "hide"; // No I18N
                  jsonObject.associated       = getMessageForKey("sdp.request.resolution.appliedby"); // No I18N
                }else if(jsonOut.association_type == "tried"){ // No I18N
                  jsonObject.associated       = getMessageForKey("sdp.request.resolution.triedby"); // No I18N
                  jsonObject.btmboxsctn   = "show"; // No I18N
                  if(jsonOut.comments == null){
                    jsonOut.comments = "-";
                    jsonObject.comments_text="";
                  }else{

                    jsonObject.comments_text = encodeHTML(jsonOut.comments);
                    jsonObject.comments    = encodeHTML(jsonOut.comments);
                  }

                  jsonObject.request_id   = jsonOut.request.id;
                  jsonObject.request_sln_id = jsonOut.id;
                }
            }
            else{
              jsonObject.btmboxsctn   = "show"; // No I18N
              jsonObject.applieddiv   = "hide"; // No I18N
              jsonObject.suggslnsdiv  = "show"; // No I18N
            }
          }
        },
          async:false
        });
    }
    var parentDiv = getHtmlForTemplate("dsoln", jsonObject, false); // No I18N
    jD.find("#detailedview").html(parentDiv); // No I18N

    jQuery('#dsolnprev').on('click', function(e) {
        if(jD.find("#dsolnprev").hasClass("ui-opacity3")){
            e.preventDefault();
            return false;
        } else {
            r.nextPrevSlnNavigation('prev'); // No I18N
        }
    });

    jQuery('#dsolnnext').on('click', function(e) {
      if(jD.find("#dsolnnext").hasClass("ui-opacity3")){
          e.preventDefault();
          return false;
      } else {
          r.nextPrevSlnNavigation('next'); // No I18N
      }
    });

    jD.find('.triedpopup').on('click', function(e){
      if(jD.find(this).hasClass('active1')){
        jD.find('.addinference-popup', '.butnclose').hide();
        jD.find(this).removeClass('active1');
      }
      else{
        jD.find('.addinference-popup').show();
        jD.find(this).addClass('active1');
      }
    });
    jD.find('.addinference-popup').on('click', function(e){e.stopPropagation();});
    /*jQuery(document).on('click', function() {
         jD.find(".addinference-popup").hide();
    });*/

    jD.find('.butnclose').on('click', function(e){
    jD.find('.triedpopup').removeClass('active1');
    jQuery('.addinference-popup').hide();
    });

    jQuery("#sol-close-popup").off("click").on("click", function(event){closeDialog()}); //NO I18N
    jQuery("#sol-popup-add-comments").off("click").on("click", function(event){req_rsln.addComments('SlnPopUp');}); //NO I18N
    jQuery("#sol-update-comments").off("click").on("click", function(event){req_rsln.addComments('appliedSlnPopUp',event.target.dataset.sln_id);}); //NO I18N
    jQuery("#cpy-to-resolution").off("click").on("click", function(event){req_rsln.setActiveTabSugg('copy' ,$req.details.request_info.id,event.target.dataset.sol_id);closeDialog();}); //NO I18N
  },
  r.nextPrevSlnNavigation = function(nextPrev){
    var sln_id_array = new Array();
    var sln_id_list   = parent.document.getElementById("sln_id_list").value;
        sln_id_array = sln_id_list.split(",");
    var idVal = jQuery('#sln_id_p').val();
    var curr_sln_id = sln_id_array.indexOf(idVal);
    var sln_id= "";
    if(nextPrev == "next"){ // No I18N
      sln_id = sln_id_array[curr_sln_id + 1];
    }else if(nextPrev == "prev"){ // No I18N
      sln_id = sln_id_array[curr_sln_id - 1];
    }
    req_rsln.loadSolutionDetail(sln_id);
    //For converting the image to video in solutionPopup
    // SD-123915
    var solution_attach_preview = new attachPreview(jQuery("#soln-details"), {target : 'img', layouts : false, attachWrap: true});	//NO I18N
  },

  //To get all the associated solutions to a request
  r.getAssociatedSolutions= function(){
    var inputObject = {};
    var fields_required = ["solution"];    // No I18N
    inputObject.fields_required = fields_required;
    var associatedIds=[];
    var dataVal = sdpAjaxInputData(inputObject);
    var request_id  = req_details ? $req.details.request_info.id : JD.find("#request_id").val();
        sdpAjax({
          url: '/api/v3/requests/'+request_id+'/associated_solutions', // No I18N
          data: dataVal,
          success: function(jsonArray) {
            if(jsonArray.associated_solutions ){
            jsonArray.associated_solutions.forEach(function(val){
            associatedIds.push(val.solution.id) ;
            });
            }
          },
        async :false
      });
        return associatedIds;
  },
  r.searchFieldUpdate = function(){
    var searchFields = req_rsln.searchFieldItems();
      if(searchFields != null) {
        var newUrl = '/servlet/SolutionsServletUtil';// No I18N
        var params = 'command=setSearchFields&search_fields='+searchFields;// No I18N
        jQuery.ajax({
          url : newUrl,
          type : 'POST',// No I18N
          data: params
        });
      }
  }
 return r;
}(jQuery));

function onloadResolutionEvents(req_id,url){
  jQuery("#request_id").val(req_id); // No I18N
  jQuery("#resolution_url").val(url); // No I18N
  const solutionMenu = jQuery('#solutionSdmenu'); // No I18N
  const solutionMenuLi = solutionMenu.find(' > li'); // No I18N
  solutionMenu.parent().off('shown.sdp.sdmenu').on('shown.sdp.sdmenu',function(){getSearchFieldPersonalization();}); // No I18N
  solutionMenuLi.on('click', function(e){ // No I18N
    const self = jQuery( this );
      if( self.text() == 'Entire Content' ){ 
        solutionMenuLi.removeClass( 'checkmark' ); // No I18N
        self.addClass( 'checkmark' ); // No I18N
      } 
      else{
          if(self.hasClass( 'checkmark' )){
            self.removeClass( 'checkmark' ); // No I18N
          }else{
            self.addClass( 'checkmark' ); // No I18N
          }
          if(solutionMenu.find('li:first-child').hasClass( 'checkmark' ) ){
            solutionMenu.find('li:first-child').removeClass( 'checkmark' ); // No I18N
          }
      }
      req_rsln.searchFieldUpdate();
  });
}
function bindResolutionEvents(res_element){
  res_element.find('#timeSpentId').off("click").on("click",function(event) {// No I18N
      $worklogForm.showHideWorklog()
  });
  res_element.find('#js-event-ViewWorkOrderResolution-4').off("click").on("click",function(event) {//NO I18N
     addResolution(event.currentTarget);
  });
  res_element.find('#js-event-ViewWorkOrderResolution-5').off("click").on("click",function(event) {//NO I18N
    return addResolution(event.currentTarget, true);
 });
 res_element.find('#js-event-ViewWorkOrderResolution-6').off("click").on("click",function(event) {//NO I18N
    $req.prop.cancelResolution('details', event);return false;
 });
 res_element.find('#js-event-ViewWorkOrderResolution-7').off("click").on("click",function(event) {//NO I18N
       $req.prop.cancelResolution('resolution', event);return false;
  });
 res_element.find('#woResolution_Id').off("change").on("change",function(event) {//NO I18N
        resolutionTemplateChange()
 });
 res_element.find('#js-event-Resolution-1').off("click").on("click",function(event) {//NO I18N
    let help_dialog=showDialog(document.getElementById("resolutiontemplate_icon_help").innerHTML, "closeButton=no, position=relative,closeOnBodyClick=yes");//NO I18N
    jQuery(help_dialog).find('#digCloseBtn').off("click").on("click",function(event) {//NO I18N
      closeDialog();
     });
    return false;
 });
 res_element.find('#js-event-Resolution-3').off("click").on("click",function(event) {//NO I18N
   $req.prop.setEditResolutionStatus(); return false;
 });
 res_element.find('#js-event-Resolution-6').off("click").on("click",function(event) {//NO I18N
        let cur= jQuery(event.currentTarget);
        let resolver= cur.data('resolver');//NO I18N
        NewWindow(`/setup/UsersPopup.jsp?isUser=true&apiModule=requests&apiEntity=submitted_by&apiModuleId=${woID}&viewType=mydetails&userId=${resolver}`,'userdetails','1100','700','yes','center', null, null, null, true);
  });
 res_element.find('#edit_resolution').off("click").on("click",function(event) {//NO I18N
   $req.details.changeTab('resolution',['tab1', '&editResolution=true']);//NO I18N
   return false;
});
}

