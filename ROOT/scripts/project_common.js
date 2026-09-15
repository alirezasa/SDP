var $projects = {
    /*
        A function to switch view in Project List View
        @PARAM - current_view_mode - table|classic|kanban|gantt|resMgmt
    */
	switchTo: function(current_view_mode){
		var perObj = $tasks.getPersonalization("projects") ;      //NO I18N
	    perObj.current_view_mode = current_view_mode;
	    addPersonalization("projects",perObj); //No I18N
	    $spa.navigate("/ui/projects?mode=list","projects");  //NO I18N
	},
	/*
	    A function to load project association page in Project Details page.
	*/
	loadProjectAssociation: function(projectId){
		parent.sdpAjax({
	        async: false, dataType: "html", // NO I18N
	        url: "/project/ProjectAssociation.jsp?mode=associated&projectId="+projectId,// NO I18N
	        success : function(response){
	            parent.jQuery("#proj-assoc-content").html(response);
	        }
	    });
	},
	/*
	    A function to redirect the user to home page when deleting the only project(from details page) the logged in user have permission to view
	*/
	goToHomeAfterProjectDelete: function(){
		showalert('info',translate("sdp.project.delete.redirectmessage"),'isAutoHide=false');// No I18N
        setTimeout(function (){
            window.location.href = '/ui/home';// No I18N
        },2000);
	},
	/*
	    A function to load milestone List view in Project Details page
	*/
	loadMileStoneList: function(){
    	parent.sdpAjax({
            url: "/ui/milestones?mode=list&projectId="+parent.jQuery('#projectid').html(), async: false, dataType:"html",//NO I18N
            success : function(response){
                parent.jQuery("#MileStone-list-content").html(response);
            }
        });
    },
    /*
        A function to dissociate request/change from project
        @PARAM - module requests/changes
    */
    dissociateProject: function(module,moduleId,projectId,from){
        var message = (module === 'requests'?"sdp.project.requestdissociate.confirm":"sdp.project.changedissociate.confirm");//No I18N
        var title = (module === 'requests'?"common.dissociate.request":"sdp.project.dissociatechange");//No I18N
        var fromActions = (from === "actions");//No I18N
        parent.showconfirm(true,
            "title=" + parent.translate(title) + ',' +//No I18N
            "message=" + parent.translate(message) + "," + //No I18N
            "submitbutton=" + parent.translate("sdp.common.ok") + "," + //No I18N
            "cancelbutton=" + parent.translate("sdp.common.cancel") + "," + //No I18N
            "closebutton=yes,closeOnEscKey=yes",// NO I18N
            function(didConfirm) {
                if(didConfirm){
                    var input_data = {[module]: []};
                    if(module === "requests"){
                        message="common.requests";// No I18N
                        var ids = WebComponents.instancePool["webc-project_request"].bulkSelect.getSelectedIDs();//No I18N
                        ids.forEach(function(value, index){
                            input_data[module].push({"request": {"id":value}});
                        });
                    }else{
                        message="common.changes";// No I18N
                        var ids = moduleId? [moduleId]:WebComponents.instancePool["webc-project_change"].bulkSelect.getSelectedIDs();//No I18N
                        ids.forEach(function(value, index){
                            input_data[module].push({"change": {"id":value}});
                        });
                    }

                    parent.sdpAjax({
                        url:"/api/v3/projects/"+projectId+"/"+module,//No I18N
                        data:parent.sdpAjaxInputData(input_data),
                        async: false, type: "DELETE", acceptODCompatible: true,//No I18N
                        success: function(response){
                            if(module === "requests"){
                                WebComponents.instancePool["webc-project_request"].refreshTable();//No I18N
                            }else{
                                if(!fromActions){
                                    WebComponents.instancePool["webc-project_change"].refreshTable();//No I18N
                                }else{
                                    window.top.loadProjectDetails();
                                    window.top.showProjTabs(document.getElementById('proj-details'));
                                }
                            }
                            window.top.showalert("success", parent.translate("api.dissociate.success.msg", [parent.translate(message)]), "isAutoHide=true, delay=3"); //No I18N
                        },
                         error:function(xhr){
                             var resp = xhr.responseJSON;
                             var success_msg="",  failure_msg="";
                             resp.response_status.each(function(ele){
                                 if(ele.status_code != 2000){
                                     failure_msg = ele.messages[0].message;
                                 }else{
                                    success_msg = parent.translate("api.dissociate.success.msg", [parent.translate(message)]);
                                 }
                             });
                             if(success_msg != ""){
                                 window.top.showalert('success',window.top.e_html(success_msg),"isAutoHide=true");// NO I18N
                                if (module === "requests") {
                                    WebComponents.instancePool["webc-project_request"].refreshTable()//No I18N
                                } else {
                                    if (!fromActions) {
                                        WebComponents.instancePool["webc-project_change"].refreshTable()//No I18N
                                    } else {
                                        window.top.loadProjectDetails();
                                        window.top.showProjTabs(window.top.document.getElementById("proj-details"))
                                    }
                                }
                             }
                             if(failure_msg != ""){
                                 window.top.showalert('failure',window.top.e_html(failure_msg),"isAutoHide=false");// NO I18N
                             }
                         }
                    });
                }
            }, true
        );
    }
}