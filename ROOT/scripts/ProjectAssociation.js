// $Id$
var $projectAssociation = {
    /*
        A function to initialize the associated request/change/release view
    */
	init: function(projectId, assocCount, changeAssocLimit){
		var _self = this;
		_self.options = {"request":{}, "change":{}, "projectId": projectId, "assocCount": assocCount, "changeAssocLimit": changeAssocLimit};//No I18N

        $projectAssociation.showActiveRequests();
        jQuery("#initChanges").on("zbeforepanelexpand", $projectAssociation.showChanges);

        jQuery("#initReleases").on("zbeforepanelexpand", function(){
            var releaseContainer = jQuery("#initReleases #associatedRelease");
            if(releaseContainer.html() !== ""){
                return;
            }
            if(getReleasePermission(projectId)){
                releaseContainer.load("/release/ReleaseList.jsp?module=release&from=project&associatedEntityID="+projectId+"&operation=associated");//No I18N
            }else{
                var html = '<div id="no_assocReleaseList" class="alert-nodata noborder whitebg"><span class="status-icon icon-lg pr10"><span aria-hidden="true" class="common-sprite icon-lg info-icon2-lg"></span></span><span class="msg">'; // No I18N
                html +=  translate("sdp.change.noreleaseassociationmsg")+ '&nbsp;</span></div>'; // No I18N
                releaseContainer.html(html);
            }
        });
	},
	/*
	    A function to define options and initialize associated active request listview
	    @PARAM - fromArchive boolean variable to decide if the active request listview is opened from archived request listview
	*/
	showActiveRequests: function(evt, fromArchive){
	    if(!sdp_user.ROLES.contains("ViewRequests")){
            jQuery("#associatedRequests").html('<div class="alert-nodata whitebg"> <span class="msg"><span>'+translate("sdp.project.association.request.none")+'</span></div>')
            return;
        }
	    if(fromArchive){
            jQuery("#archivedRequests").hide();
            jQuery("#associatedRequests").show();
            return;
        }
	    if(jQuery("#associatedRequests").html() !== ""){
            return;
        }
        var projectId = $projectAssociation.options.projectId;
         var request = {
            "entity" 		    : "associated_requests",//NO I18N
            "module" 	        : "requests",//NO I18N
            "url" 			    : "projects/"+projectId+"/associated_requests",//NO I18N
            "metainfo_url" 	    : "projects/"+projectId+"/requests/request",//NO I18N
            "personalize_key"   : "project_request",//NO I18N
            "tableHolder" 		: "project_request",//NO I18N
            "allowedOperations" : {},//NO I18N
            "projectId" 	    : projectId,//NO I18N
            "assocCount"        : $projectAssociation.options.assocCount//NO I18N
         };

         sdpAjax({
             url: '/api/v3/projects/'+projectId+'/requests/_links', // No I18N
             ignorefailuremessage: true, async: false, acceptODCompatible: true,
             data: sdpAjaxInputData({"operations_required": ["add"]}),// No I18N
             success: function(resp){
                 if(resp._links){
                     resp._links.forEach(function(value, index){
                         if(value.method == "post"){
                             if(sdp_user.ROLES.contains("CreateRequests")){
                                 request.allowedOperations["create"] = true;
                             }
                             request.allowedOperations["add"] = true;
                         }
                     });
                 }
             }
         });

        $projectAssociation.options.request = request;
        renderhbs("#associatedRequests", "AssociatedToProject", request, false, "project");// No I18N
        delete WebComponents.instancePool["webc-"+request.tableHolder];//NO I18N
         WebComponents.render("webc-"+request.tableHolder);
	},
	/*
        A function to define options and initialiaze associated archived request listview
    */
	showArchiveRequests: function(){
	    if(jQuery("#archivedRequests").html() !== ""){
            jQuery("#associatedRequests").hide();
            jQuery("#archivedRequests").show();
            return;
        }

		var projectId = $projectAssociation.options.projectId;
        var arcRequest = {
            "entity" 		    : "archived_requests",//NO I18N
            "url" 			    : "projects/"+projectId+"/archived_requests",//NO I18N
            "metainfo_url" 	    : "projects/"+projectId+"/requests/request",//NO I18N
            "personalize_key"   : "project_request",//NO I18N
            "tableHolder" 		: "project_arc_request",//NO I18N
            "allowedOperations" : {},//NO I18N
            "projectId" 	    : projectId,//NO I18N
            "assocCount"        : $projectAssociation.options.assocCount,//NO I18N
            "fromArchive"		: true//NO I18N
        };

        $projectAssociation.options.arcRequest = arcRequest;
        renderhbs("#archivedRequests", "AssociatedToProject", arcRequest, false, "project");// No I18N
        delete WebComponents.instancePool["webc-"+arcRequest.tableHolder];//NO I18N
        WebComponents.render("webc-"+arcRequest.tableHolder);
        jQuery("#associatedRequests").hide();
        jQuery("#archivedRequests").show();
	},
	/*
        A function to define options and initialiaze associated change listview
    */
	showChanges: function(){
	    if(!$projectAssociation.options.assocCount.hasOwnProperty("change")){// here change attribute in assocCount json is checked since the count is populated based on the AcessTheChange.toAccessChangeModule permission
            jQuery("#associatedChanges").html('<div class="alert-nodata whitebg"> <span class="msg"><span>'+translate("sdp.project.association.change.none")+'</span></div>')
            return;
        }
	    if(jQuery("#associatedChanges").html() !== ""){
            return;
        }
		var projectId = $projectAssociation.options.projectId;
        var change = {
            "entity" 		    : "associated_changes",//NO I18N
            "module" 	        : "changes",//NO I18N
            "url" 			    : "projects/"+projectId+"/associated_changes",//NO I18N
            "metainfo_url" 	    : "projects/"+projectId+"/changes/change",//NO I18N
            "personalize_key"   : "project_change",//NO I18N
            "tableHolder" 		: "project_change",//NO I18N
            "allowedOperations" : {},//NO I18N
            "projectId" 	    : projectId//NO I18N
        };

        sdpAjax({
            url: '/api/v3/projects/'+projectId+'/changes/_links', // No I18N
            ignorefailuremessage: true, async: false, acceptODCompatible: true,
            data: sdpAjaxInputData({"operations_required": ["add"]}),// No I18N
            success: function(resp){
                if(resp._links){
                    resp._links.forEach(function(value, index){
                        if(value.method == "post"){
                            if(sdp_user.ROLES.contains("CreateChanges")){
                                change.allowedOperations["create"] = true;
                            }
                            change.allowedOperations["add"] = true;
                        }
                    });
                }
            }
        });

        $projectAssociation.options.change = change;
        renderhbs("#associatedChanges", "AssociatedToProject", change, false, "project");// No I18N
        delete WebComponents.instancePool["webc-"+change.tableHolder];//NO I18N
        WebComponents.render("webc-"+change.tableHolder);
	},
	tableOtherOptions: function(module){
		return {
            metaInfo_input: {"for":"association_project"}, //NO I18N
            height_settings:{"adjustHeight":"430"} //NO I18N
		};
	},
	fetchTableInfo: function(personalize_key){
        var table_info = $tasks.getPersonalization(personalize_key);
        delete table_info.list_info.filter_by;
        return table_info;
	},
	rowDataConstruct: function(table_info){
		var inputObject = {};
	  	inputObject.list_info = table_info.list_info;
	    inputObject.fields_required = Object.keys(table_info.fields_required);
	    if(table_info.fields_required.hasOwnProperty("subject")){
            inputObject.fields_required.push("short_description");
            inputObject.fields_required.indexOf("category")==-1 && inputObject.fields_required.push("category");
        }
	    return inputObject;
	},
	constructRequestTitle: function(table_data){
        var row_data = table_data.row_data;
        var title = '<strong>'+translate('common.requestid')+' :</strong>' + row_data.id + '<br><strong>'+translate('sdp.common.category')+' :</strong> ' + (row_data.category?e_attr(row_data.category.name):'-') + ' <br><strong>'+translate('sdp.common.subject')+' :</strong> ' + e_html(row_data.subject) + ' <br><strong>'+translate('sdp.common.description')+' :</strong> ' + row_data.short_description
        return '<a href="/WorkOrder.do?woMode=viewWO&woID='+row_data.id+'&fromListView=true" target="_blank" rel="uitip noopener noreferrer" mode_html="true" title="'+e_attr(title)+'">'+e_html(row_data.subject)+'</a>';
    },
    constructChangeTitle: function(table_data){
        var row_data = table_data.row_data;
        return '<a href="/ui/changes?entity_id='+row_data.id+'&mode=detail" target="_blank" rel="uitip noopener noreferrer" mode_ellipsis="true" title="'+e_attr(row_data.title)+'">'+e_html(row_data.title)+'</a>';
    },
    constructArcRequestTitle: function(table_data){
        var row_data = table_data.row_data;
        return '<a href="/SDArchiveWorkOrder.do?woMode=viewWO&woID='+row_data.id+'" target="_blank" rel="uitip noopener noreferrer" mode_ellipsis="true" title="'+e_attr(row_data.subject)+'">'+e_html(row_data.subject)+'</a>';
    },
	setNoDataBanner: function(table_data){
	    if(table_data.t_obj.table_info.list_info.search_criteria){
            return false;
        }
		var html = "";
        if("associated_requests" === table_data.t_obj.options.entity_name){
            if($projectAssociation.options.assocCount.request.archive != 0){
                return false;
            }
            html =  '<div class="alert-nodata whitebg"> <span class="msg">';
            html += '<span>'+translate("sdp.project.association.request.none")+'</span>';
            if($projectAssociation.options.request.allowedOperations.create){
                html += '<a class="text-link ml5" id="createModule" href="/" data-module="requests" >'+translate("sdp.kbs.createReq")+'</a><span class="ml5">'+translate("sdp.admin.common.or")+'</span>';
            }
            if($projectAssociation.options.request.allowedOperations.add){
                html += '<a class="text-link ml5" id="associateProject" href="/" data-module="requests" >'+translate("sdp.project.associate.request")+'</a> </span>';
            }
            html += '</div>';
        }else{
            html =  '<div class="alert-nodata whitebg"> <span class="msg">';
            html += '<span >'+translate("sdp.project.association.change.none")+'</span>';
            if($projectAssociation.options.change.allowedOperations.create){
                html += '<a class="text-link ml5" id="createModule" href="/" data-module="changes" >'+translate("sdp.project.associate.new.change")+'</a><span class="ml5">'+translate("sdp.admin.common.or")+'</span>';
            }
            if($projectAssociation.options.change.allowedOperations.add){
                html += '<a class="text-link ml5" id="associateProject" href="/" data-module="changes" >'+translate("sdp.project.associate.child.change")+'</a> </span> </div>';
            }
        }
        return html;
	},
	callbackAfterBodyRender: function(tableOptions){
	    if(WebComponents.instancePool["webc-project_request"]){
            $projectAssociation.options.assocCount.request.active = WebComponents.instancePool["webc-project_request"].t_obj.table_info.list_info.total_count;//NO I18N
            var reqCnt = $projectAssociation.options.assocCount.request.active+$projectAssociation.options.assocCount.request.archive;
            jQuery("#initRequests #project_request_count").html(reqCnt != 0?"("+reqCnt+")":"");
        }
        if(WebComponents.instancePool["webc-project_change"]){
            var chngCnt = WebComponents.instancePool["webc-project_change"].t_obj.table_info.list_info.total_count;//No I18N
            jQuery("#initChanges #project_change_count").html(chngCnt != 0?"("+chngCnt+")":"");
            if(chngCnt >= $projectAssociation.options.changeAssocLimit){
                jQuery("#createModule", "#associatedChanges ").hide().removeAttr("data-non-action");
                jQuery("#associateProject", "#associatedChanges").hide().removeAttr("data-non-action");
            }else{
                jQuery("#associatedChanges #createModule").show().attr("data-non-action","project_change");
                jQuery("#associatedChanges #associateProject").show().attr("data-non-action","project_change");
            }
        }

        var $container = jQuery("#associatedRequests,#associatedChanges,#archivedRequests");
        $container.off(".proj-assoc");// NO I18N

        $container.on("click.proj-assoc", "#createModule", function(evt){
            $projectAssociation.createAndAssociate(this.getAttribute("data-module"));
        });
        $container.on("click.proj-assoc", "#associateProject", function(evt){
            $projectAssociation.associateProject(this.getAttribute("data-module"));
        });

        $container.on("click.proj-assoc", "#dissociateProject", function(evt){
            $projects.dissociateProject(this.getAttribute("data-module"),null,$projectAssociation.options.projectId);
        });

        $container.on("click.proj-assoc", "#archiveRequests", function(evt){
            $projectAssociation.showArchiveRequests();
        });

        $container.on("click.proj-assoc", "#activeRequests", function(evt){
            $projectAssociation.showActiveRequests(this, true);
        });

        $container.find(".tablelist").css("min-height","400px");//No I18N

        $container.one("remove.proj-assoc", function(){//No I18N
            $container.off(".proj-assoc");//No I18N
            delete WebComponents.instancePool["webc-project_request"];//NO I18N
            delete WebComponents.instancePool["webc-project_change"];//NO I18N
        });
	},
	/*
	    A function to call the Add form for request and change
	    @PARAM - module requests/changes
	*/
	createAndAssociate: function(module){
		if(module === "requests"){
			$RFPreview.show(undefined, true, undefined, undefined,undefined,"fromProject=true", {freeze_index: 90});//No I18N
		}else{
			$previewComponent.load('/ui/changes?mode=add&from=project&associatedEntityId='+$projectAssociation.options.projectId+'&externalframe=true',translate('sdp.change.listview.newchange'),'75%',null, null, 'newchange_popup',null,null,"auto_close:true");//No I18N
		}
	},
	/*
	    A function to open the Associate listview for request and change respectively.
	    @PARAM - module requests/changes
	*/
	associateProject: function(module){
		var url = '/project/ProjectAssociation.jsp?mode=associate&projectId='+$projectAssociation.options.projectId+'&externalframe=true';//No I18N
		var title = "";
		if(module === "requests"){
			url+="&module=request";//No I18N
			title = translate("sdp.requests.projectdialog.associatetoproject");//No I18N
		}else{
			url+="&module=change";//No I18N
			title = translate("sdp.change.associatechangetoproject");//No I18N
		}
		$previewComponent.load(url,title,null,null,null,'associate_project',null,null,"auto_close:true");//No I18N
	}
}

var $associateProject ={
    /*
        A function to define options and initialize Associate request/change listview
        @PARAM - entity requests/changes
        @PARAM - projectId
    */
	init: function(projectId, entity, from, changeAssocLimit, changeAssocCount){
		var _self = this;
		_self.options = {
		    "entity":entity,//NO I18N
		    "module":entity+'s',//NO I18N
		    "projectId":projectId,//NO I18N
		    "tableHolder":"assoc_project_"+entity,//NO I18N
		    "from":from,//NO I18N
		    "changeAssocLimit": changeAssocLimit, //NO I18N
            "changeAssocCount": changeAssocCount.change || 0//NO I18N
		};
        _self.options.tableInfo = $tasks.getPersonalization("project_"+entity);// NO I18N
		_self.options.url = _self.options.metainfo_url = "projects/"+_self.options.projectId+"/"+_self.options.module+"/"+entity;//No I18N
        _self.options.current_view = (_self.options.entity == "request"? translate("sdp.requests.viewrequest.allrequests"):translate("sdp.change.listview.allchanges"));// No I18N
        var filter_by = _self.options.tableInfo.list_info.filter_by;
        if(filter_by && filter_by.id != "0"){
            sdpAjax({
                url: '/api/v3/list_view_filters/'+filter_by.id,// NO I18N
                ignorefailuremessage: true, async: false,
                success: function(resp) {
                    _self.options.current_view = resp.list_view_filter.display_name;
                },
                error: function(response){
                    delete _self.tableInfo.list_info.filter_by;
                }
            });
        }
		renderhbs("#associateProject", "AssociateToProject", _self.options, false, "project");// No I18N
		delete WebComponents.instancePool["webc-"+_self.options.tableHolder];//NO I18N
        WebComponents.render("webc-"+_self.options.tableHolder);
	},
	fetchTableInfo: function(){
		return $associateProject.options.tableInfo;
	},
	tableOtherOptions: function(){
		return {
            metaInfo_input:{"for":"association_project"},// NO I18N
            width: jQuery(window).width()-2
        };
	},
	setHeight: function(){
        return jQuery(window).height()-100;
    },
	rowDataConstruct: function(table_info){
		var inputObject = {};
	  	inputObject.list_info = table_info.list_info;
	    inputObject.fields_required = Object.keys(table_info.fields_required);
	    return inputObject;
	},
	constructEditIcon: function(table_data){
        var url = '/WorkOrder.do?woMode=viewWO&woID='+table_data.row_data.id+'&fromListView=true';// NO I18N
        if($associateProject.options.module === "changes"){
            url = '/ui/changes?entity_id='+table_data.row_data.id+'&mode=detail';// NO I18N
        }
        return '<div><div class="right0 top0 p5 pr5 disp-ib"><a href="'+url+'" target="_blank" class="cspr flat icon-sm newtab" title="' + translate('sdp.requests.newrequest.autosuggest.newwindow.open') + '" rel="uitip noopener noreferrer"></a></div></div>';
    },
	callbackAfterBodyRender: function(){
        var $container = jQuery("#associate"+$associateProject.options.module);
        $container.off(".assoc-project");// NO I18N

        $container.one('click.assoc-project', "#ListViewFilterMenu", function(){//No I18N
            var filterList_obj = new filterListComp();
            filterList_obj.initComponent({
                module              : $associateProject.options.entity,
                element             : "#ListViewFilterMenu",    //No I18N
                filter_action       : "$associateProject.changeFilter",    //No I18N
                favoritable         : false,
                skipPersonalization : true,
                hideFilterSearch    : true,
                processFilters   : function(data){
                    data = data.filter(function (item) {
                      if(item.name != "closed_changes" && item.name != "my_closed_changes"){//No I18N
                        return item;
                      }
                    });
                    return data;
                }
            });
        });
        $container.on("click.assoc-project", "#associate", function(evt){
            $associateProject.associateToProject();
        });
    },
    changeFilter: function(filterId, filtername){
        jQuery("#associate"+$associateProject.options.module+" #selected_filter").text(filtername);
        WebComponents.instancePool["webc-"+$associateProject.options.tableHolder].t_obj.table_info.list_info.filter_by = {"id" : filterId}; //NO I18N
        WebComponents.instancePool["webc-"+$associateProject.options.tableHolder].refreshTable();// No I18N
    },
    /*
        A function to associate request/change to project
        @PARAM - requestId - Used while associating a request to project using createAndAssociate
    */
	associateToProject: function(requestId){
		var input_data ={},message = "",data=[];
        var ids = requestId?[requestId]:WebComponents.instancePool["webc-"+$associateProject.options.tableHolder].bulkSelect.getSelectedIDs();//No I18N
        var entity = requestId?'request':$associateProject.options.entity;//No I18N
        var projectId = requestId?$projectAssociation.options.projectId:$associateProject.options.projectId;
        if(entity=="request"){ // No I18N
            ids.forEach(function(value, index){
                data.push({"request": {"id":value}});
            })
            input_data = {"requests":data};     // No I18N
            message = "common.requests";         // No I18N
        }else if(entity=="change"){     // No I18N
            var initiated_by = "project";// No I18N
            if($associateProject.options.from == "actions"){
                initiated_by = "change";// No I18N
                 ids =[jQuery("#associatechanges .selected-row input").val()];
            }else{
                if(ids.length+$associateProject.options.changeAssocCount > $associateProject.options.changeAssocLimit){
                    window.top.showalert("failure", translate('sdp.change.project.association.maximumlimit', [$associateProject.options.changeAssocLimit]), "isAutoHide=false"); //No I18N
                    return;
                }
            }
            ids.forEach(function(value, index){
                data.push({"change": {"id":value}, "initiated_by":initiated_by});
            })
            input_data = {"changes":data};     // No I18N
            message ="common.changes";        // No I18N
        }

        sdpAjax({
            url: "/api/v3/projects/" + projectId + "/" + entity+"s", // No I18N
            async: false, acceptODCompatible: true, type: "POST",// No I18N
            data: sdpAjaxInputData(input_data),
            success: function(resp) {
                window.top.$previewComponent.closePreview("associate_project");// No I18N
                window.top.showalert("success", translate("api.associate.success.msg", [translate(message)]), "isAutoHide=true, delay=3"); //No I18N
                if($associateProject.options && $associateProject.options.from == "actions"){
                    if(entity === "request"){
                        window.top.jQuery("#proj-assoc").trigger("click");//No I18N
                    }else{
                        window.top.loadProjectDetails();
                        window.top.showProjTabs(window.top.jQuery('#proj-details')[0]);
                    }
                    return;
                }
                if(entity === "request"){
                    window.top.WebComponents.instancePool["webc-project_request"].refreshTable();//No I18N
                }else{
                    window.top.WebComponents.instancePool["webc-project_change"].refreshTable();//No I18N
                }
            }
        });
	}
}
