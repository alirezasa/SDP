/* $Id$ */
/*  This file has utility functions required for displaying Change associations page.
 */
var change_associations = {
    /**
     * Loading associations in all the stages
     */
    loadChangeAssociations: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var stageName = tabs_panel.internal_name;
        if(stageName == "Implementation"){
            if(_self._links.projects && _self._links.projects.get){
                const canCreateProject = this.isUserPermittedToCreateProject() && !$rc.isTrashed && !$rc.printPreview && _self.stagePermissions.Implementation && _self.stagePermissions.Implementation.edit;
                const canEditProject = (!$rc.isTrashed && !$rc.printPreview  && (_self._links.hasOwnProperty('projects') && _self._links.projects.hasOwnProperty('post') && _self.stagePermissions.Implementation && _self.stagePermissions.Implementation.edit));// No I18N
                var project_url = '/project/ProjectListViewWeb.jsp?module=' + _self.entity_name + '&canEditProject=' + canEditProject + '&module_id=' + _self.id + '&externalframe=false&initiatedby=change&canCreateProject='+ canCreateProject; // No I18N
                jQuery('#project_associations').load(project_url); // No I18N
            }
        }else if(stageName == "Release"){   // No I18N
            if(_self._links.releases && _self._links.releases.get){
                var release_url = '/release/ReleaseList.jsp?module=release&from=change&associatedEntityID='+ _self.id +'&operation=associated&preview='+(_self.printPreview ? true : false); // No I18N
                jQuery('#associatedReleaseList').load(release_url); // No I18N
            }
        }else if(stageName == "Planning"){   // No I18N
            if(_self._links.problems && _self._links.problems.get){
                var problem_url = '/ui/problems?mode=list&from=change&associatedEntityId=' + _self.id + '&operation=associated'+(_self.printPreview?'&printPreview=true':'')+'&noheader=true'+(isMSP?'&nomspheader=true':''); // No I18N
                jQuery('#associatedProblemList').load(problem_url); // No I18N
            }
            if(_self._links.initiated_by_requests && _self._links.initiated_by_requests.get){
                var request_url = '/workorder/RequestListViewWeb.jsp?module=' + _self.entity_name + '&module_id=' + _self.id + '&view=associated&type=initiated_by_requests&externalframe=false&canAssociate=' + ((!_self.printPreview && !_self.isTrashed && _self._links.hasOwnProperty('initiated_by_requests') && _self._links.initiated_by_requests.hasOwnProperty('post')) ? true : false); // No I18N
                jQuery('#associatedinitiated_by_requests').load(request_url); // No I18N
            }
            if(_self._links.initiated_requests && _self._links.initiated_requests.get){
                var request_url = '/workorder/RequestListViewWeb.jsp?module=' + _self.entity_name + '&module_id=' + _self.id + '&view=associated&type=initiated_requests&externalframe=false&canAssociate=' + ((!_self.printPreview && !_self.isTrashed && _self._links.hasOwnProperty('initiated_requests') && _self._links.initiated_requests.hasOwnProperty('post')) ? true : false); // No I18N
                jQuery('#associatedinitiated_requests').load(request_url); // No I18N
            }
        }
    },
    isUserPermittedToCreateProject: function(){
        var canCreateProject = false;
        var userProjectPermission = sdpAjax({
            url: "/api/v3/projects/_links", //NO I18N
            type: 'GET',  //NO I18N
            cache: false,
            async: false,
            success: function(data){
                for(var link of data._links) {
                    if(link.name === "add") {
                        canCreateProject = true;
                        return;
                    }
                }
            }
        });
        return canCreateProject;
    },

    loadPreviewComponent:function (path,title, width, height, callback,containerId, isDiv, zIndex, optdata){
        $previewComponent.load(path,title, width, height, callback,containerId, isDiv, zIndex, optdata);
        setTimeout(function(){
            jQuery('#'+containerId).focus();
        }, 200);

    },
    /**
     * returns weather user has access to associations
     */
    hasAssociationsAccess: function(){
        return !!(($rc._links && ($rc._links.initiated_requests || $rc._links.initiated_by_requests || $rc._links.problems || $rc._links.projects || $rc._links.releases)) && (($rc.stagePermissions.Implementation && $rc.stagePermissions.Implementation.view) || ($rc.stagePermissions.Planning && $rc.stagePermissions.Planning.view) || ($rc.stagePermissions.Release && $rc.stagePermissions.Release.view)));
    },
    /**
     * Get the association permission for all module
     */
    getAssociationPermission: function(){
        var _self = this;
        var permission = {};
        permission.canViewProject = _self._links && _self._links.projects && _self._links.projects.get ? true : false;
        permission.canViewProblem = _self._links && _self._links.problems && _self._links.problems.get ? true : false;
        permission.canViewRelease = _self._links && _self._links.releases && _self._links.releases.get ? true : false;
        permission.canViewinitiated_by_requests = _self._links && _self._links.initiated_by_requests && _self._links.initiated_by_requests.get ? true : false;
        permission.canViewinitiated_requests = _self._links && _self._links.initiated_requests && _self._links.initiated_requests.get ? true : false;
        return permission;
    },

    /**
     * returns summary of associations access
     */
    getAssociationsAccessSummary: function(){
        var associations_summary = {};
        $rc.stagePermissions['Planning'] && $rc.stagePermissions['Planning'].view && $rc._links && $rc._links['initiated_requests'] && $rc._links['initiated_requests'].get && (associations_summary.canView_initiated_requests = true);
        $rc.stagePermissions['Planning'] && $rc.stagePermissions['Planning'].view && $rc._links && $rc._links['initiated_by_requests'] && $rc._links['initiated_by_requests'].get && (associations_summary.canView_initiated_by_requests = true);
        $rc.stagePermissions['Planning'] && $rc.stagePermissions['Planning'].view && $rc._links && $rc._links['problems'] && $rc._links['problems'].get && (associations_summary.canView_problems = true);
        $rc.stagePermissions['Implementation'] && $rc.stagePermissions['Implementation'].view && $rc._links && $rc._links['projects'] && $rc._links['projects'].get && (associations_summary.canView_projects = true);
        $rc.stagePermissions['Release'] && $rc.stagePermissions['Release'].view && $rc._links && $rc._links['releases'] && $rc._links['releases'].get && (associations_summary.canView_releases = true);

        return associations_summary;
    },
    /**
     * Check whether project is associated
     */
    checkProjectAssociation: function(){
        var _self = this;
        _self.getAssociatedProject();
        if(_self.associatedProject){
            _self.loadAssociatedProjectSection();
        }
    },

    /**
     * Loading Project that initiated this Change section if the project is associated
     */
    loadAssociatedProjectSection: function(){
        var _self = this;
        var promisefn = [], metadata;

        jQuery("#initiatedByProject").removeClass("hide");
        var fetchProjectmeta = sdpAjax({
            url: _self.base_url+ "/" + _self.id + "/projects/project/_metainfo", //NO I18N
            type: 'GET',  //NO I18N
            cache: false,
            success: function(data){
                metadata = data.metainfo;
            }
        });
        promisefn.push(fetchProjectmeta);
        var initFC = function(){
            var requiredfields = ["title","owner","status","scheduled_end_time","priority","projected_end_time"];   // No I18N
            var column_count = "2";
            var fieldsProperty = {
                title: {
                    custom_render: function(){
                        return '<p class="form-control-static"><a rel="noopener" href="/ProjectAction.do?submitaction=ViewProject&projectid='+_self.associatedProject.project.id+'" target="_blank">'+ e_html(_self.associatedProject.project.title) +'</a></p>'; // No I18N
                    }
                }
            };
            var template = _self.constructTemplate(requiredfields,column_count,fieldsProperty);
            var configJSON = {
                formid: "initiatedByProjectDetails",   // No I18N
                template: template,
                entitydata: _self.associatedProject.project,
                metadata: metadata,
                container: "initiatedByProjectDetails",// No I18N
                canEdit: false,
                mode: "view",   // No I18N
                afterRenderCallback: function(form){ }
            };

            _self.$initiatedbyProject_FC = _self.initFormComponent(configJSON);
        };

        jQuery.when.apply(this, promisefn).then(function() {
            initFC();
        });
    },
    /**
     * Dissociate project association in Submission stage
     */
    dissociateProjectAssociation: function(){
        var _self = this;

        var deleteAssoc = function(confirm){
            if(confirm){
                if(!_self.associatedProject){
                    _self.getAssociatedProject();
                }
                var entityData = [];
                var entityJson = {["project"]: {"id": _self.associatedProject.project.id},"initiated_by": "project"}; //No I18N
                entityData.push(entityJson);
                var inputData = sdpAjaxInputData({["projects"]: entityData});


                sdpAjax({
                    url: _self.base_url+ "/" + _self.id + "/projects", //NO I18N
                    type: 'DELETE',  //NO I18N
                    data: inputData,
                    acceptODCompatible: true,
                    success: function(resp){
                        if(resp.response_status && resp.response_status[0].status === "success"){
                            showalert("success", translate("sdp.project.dissociatefromchange") , "isAutoHide=true");  //No I18N
                            _self.associatedProject = null;
                            jQuery("#initiatedByProject").addClass("hide");
                            jQuery("#projectDissocMenu").addClass("hide");
                            jQuery("#projectAssocMenu").removeClass("hide");
                            if($rc.summary && $rc.summary.projects) {
                                $rc.summary.projects.initiated_by_project = false;
                            }
                            $rc.$detailsComp.gotoTabByPath($rc.getTabPathHash("#Submission/details"));//No I18N
                        }
                    }
                });
            }
        };
        showconfirm(true,'title='+translate("sdp.change.dissociateproject")+', message='+translate("sdp.change.projectdissociate.confirm")+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',deleteAssoc,true); //No I18N
    },
    /**
     * Render Project that initiated this Change section, only if the project is associated
     */
    getAssociatedProject: function(){
        var _self = this;
        var inputObject = {"list_info":{"search_criteria":{"field":"initiated_by","condition":"is","value": "project"}}};  //NO I18N
        var dataval = sdpAjaxInputData(inputObject);
        sdpAjax({
            url: _self.base_url+ "/" + _self.id + "/projects", //NO I18N
            type: 'GET',  //NO I18N
            data: dataval,
            acceptODCompatible: true,
            async: false,
            success: function(resp){
                if(resp.response_status && resp.response_status[0].status == "success" && resp.projects.length > 0){
                    _self.associatedProject = resp.projects[0];
                }
            }
        })
    },

    getAssociatedRelease: function(){
        var _self = this;
        sdpAjax({
            url: _self.base_url+ "/" + _self.id + "/releases", // No I18N
            acceptODCompatible : true,
            async: false,
            success: function(resp) {
                if(resp.response_status && resp.response_status[0].status == "success" && resp.releases.length > 0){
                    _self.associatedRelease = resp.releases[0];
                }
            },

        });
    },
    /**
     * To dissociate release from change
     */
    dissociateRelease : function (){
        var _self = this;
        _self.getAssociatedRelease();
        var deleteAssoc = function(confirm){
            if(confirm){
                _self.getAssociatedRelease();
                var assocReleaseId = _self.associatedRelease.release.id;
                var data = sdpAjaxInputData({ "releases": [{ "release": { "id": assocReleaseId } }] }); // No I18N
                sdpAjax({
                    url: _self.base_url+ "/" + _self.id + "/releases", // No I18N
                    data: data,
                    type: "DELETE", // No I18N
                    acceptODCompatible : true,
                    success: function(resp) {
                        showalert("success", translate("sdp.project.history.releasedisassociated"), "isAutoHide=true, delay=3"); //No I18N

                        //To show associate option after disassociation
                        jQuery('#changeReleaseAssocAction').removeClass("hide");
                        jQuery('#changeReleaseDissocAction').addClass("hide");
                        jQuery("#associated_release_count")[0].innerHTML = 0;
                        $releaseList.table_comp_release.refreshTable("refresh"); //NO I18N
                    }
                });
            }
        };
        showconfirm(true,'title='+translate("sdp.project.dissociaterelease")+', message='+translate("sdp.change.releasedissociate.confirm")+', submitbutton='+translate("sdp.common.ok")+', cancelbutton='+translate("sdp.common.cancel")+', closebutton=yes, closeOnEscKey=yes',deleteAssoc,true); //No I18N
    },
}