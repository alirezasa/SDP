/* $Id$ */
/*  This file has utility functions required for handling templates in change details page.
 */
var change_template={

    /**
     * copy template properties for a particulat fied
     */
    copyTemplateProperties:function (stageName,field)
    {
        var layoutToSearch=this.getLayout(stageName);
        return this.getFieldProperties(layoutToSearch.sections,field);
    },
    /**
     * get the layout for particular stage
     */
    getLayout:function (stageName)
    {
        _self=this;
        var templatecpy = jQuery.extend(true,{},_self.template);
        var layoutscpy = templatecpy.layouts;
        for(var i=0,len=layoutscpy.length; i<len; i++) {
            if (layoutscpy[i].stage && layoutscpy[i].stage.internal_name === stageName) {
                return layoutscpy[i];
            }
        }
    },
    /**
     * returns properties for a field in layout if exists
     */
    getFieldProperties:function (sections,field)
    {
        var propertiesData = {};
        for(var i=0,len=sections.length;i<len;i++)
        {
            for(var j=0,flen=sections[i].fields.length;j<flen;j++)
            {
                if(sections[i].fields[j].name === field)
                {
                    //TODO add further properties if needed
                    propertiesData["mandatory"]= sections[i].fields[j].mandatory;
                    return propertiesData;
                }
            }
        }
    },


    /**
     Returns permissions for submission stage
     */
    getEntityTemplateData: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var stageName = tabs_panel.internal_name;
        var stagePermission = _self.stagesObject[stageName];
        _self.entityFields = {
            canEdit : stagePermission && stagePermission.canEdit && !_self.printPreview,
            canDissociateProject: (!_self.printPreview && _self._links && _self._links.projects && _self._links.projects.post && _self.stagePermissions["Submission"] && _self.stagePermissions["Submission"].edit) ? true : false
        };
        return _self.entityFields;
    },
    /**
     Returns permissions and additional data for schedule tabs for submission and uat stages
     */
    getScheduleData: function(tabName, tabSetting, tabs_panel){
        var _self = this;
        var stageName = tabs_panel.internal_name;
        var stagePermission = _self.stagesObject[stageName];
        scheduleData = {
            name : stageName,
            canEdit : stagePermission.canEdit && !_self.printPreview,
        };
        return scheduleData;
    },
    /**
     * Get all permissions required to show Actions
     */
    getActionsTemplateData: function(){
        var _self = this;
        var permissions = {};
        var data = {status : _self.status};
        //remove the current status from action menu
        data.status = data.status.filter(item => item.id !== _self.entity_data.status.id);
        if(_self._links){
            _self._links.edit && _self._links.edit.put && _self.stagePermissions["Submission"] && _self.stagePermissions["Submission"].edit && (permissions.canEditEntity = true);
            permissions.showPopup = _self.stagePermissions.global.ISSDCM && _self.entity_data.deleted_time == null;
            _self._links.notes && _self._links.notes.post && (permissions.canAddNote = true);
            _self._links["delete"] && _self._links["delete"]["delete"] && (permissions.canDeleteEntity = true);
        }

        //Data is fetched in ChangeDetail.jsp, when change listview is revamped, we can use the above code or add api to get this data
        if(_self.options.prevNextIds){
            var list = _self.options.prevNextIds;
            for(var i=0; i<list.length;i++) {
                var curId = list[i];
                if(_self.id == curId) {
                    permissions.navigation = true;
                    if(i > 0) {
                        permissions.prevId = list[i - 1];
                    }
                    if(i < list.length -1 ){
                        permissions.nextId = list[i + 1];
                    }
                    break;
                }
            }
        }

        var canEditAnyStagePermission = _self.stagePermissions["global"].edit;
        permissions.canAddReminder = canEditAnyStagePermission && !_self.isRequester();
        var ispre_approved=_self.entity_data.change_type && _self.entity_data.change_type.pre_approved?true:false;
        permissions.canAddTask = Object.values(_self.stagePermissions).filter(obj => obj.hasOwnProperty("internal_name") && (ispre_approved?obj.internal_name!="Approval":true) ).any(obj => obj.edit === true);// No I18N
        permissions.canAddWorklog = canEditAnyStagePermission;

        var canEditPlanningStage =  _self.stagePermissions["Planning"] ? _self.stagePermissions["Planning"].edit : false;
        var canEditReleaseStage = _self.stagePermissions["Release"] ? _self.stagePermissions["Release"].edit : false;
        //downtime can be added only when change is in submission or planning stage along with planning stage edit permission,case handled for non-workflow changes
        permissions.canAddDowntime = (_self.entity_data.stage.internal_name === 'Submission' || _self.entity_data.stage.internal_name === 'Planning') && canEditPlanningStage ;// No I18N
        permissions.canUpdateDescriptiveField = canEditPlanningStage;
        permissions.canAddReview = _self.stagePermissions["Review"] ? _self.stagePermissions["Review"].edit : false;

        _self._links && _self._links.copy && _self._links.copy.post &&(permissions.canCopyEntity = true);

        _self._links && _self._links.make_announcement && _self._links.make_announcement.post && (permissions.canMakeAnnouncement = true);
        _self._links && _self._links.notifications && _self._links.notifications.post && (permissions.canSendNotification = true);

        _self._links && _self._links.Close_completed && (permissions.Close_completed = _self._links.Close_completed);
        _self._links && _self._links.Close_cancelled && (permissions.Close_cancelled = _self._links.Close_cancelled);

        _self.stagePermissions["Planning"] && _self.stagePermissions["Planning"].edit && _self._links && _self._links.initiated_by_requests && _self._links.initiated_by_requests.post && (permissions.canAssociateIncident = true);
        _self.stagePermissions["Planning"] && _self.stagePermissions["Planning"].edit && _self._links && _self._links.problems && _self._links.problems.post && (permissions.canAssociateProblem = true);
        _self.stagePermissions["Submission"] && _self.stagePermissions["Submission"].edit && _self._links && _self._links.projects && _self._links.projects.post && (permissions.canAssociateProject = true);
        _self.summary && _self.summary.projects && _self.summary.projects.initiated_by_project && (permissions.isProjectAssociated = true);
        _self.stagePermissions["Release"] && _self.stagePermissions["Release"].edit && _self._links && _self._links.releases && _self._links.releases.post && (permissions.canAssociateRelease = true);
        _self.summary && _self.summary.releases && (_self.summary.releases.all == 1) && (permissions.isReleaseAssociated = true);

        permissions.canEditStatus=false;
        data.status.forEach(function(status)
        {
            if(status.action_name)
            {permissions.canEditStatus=true;}
        });

        _self._links && _self._links.restore_from_trash && _self._links.restore_from_trash.put && (permissions.canRestoreEntity = true);

        _self.allowed_actions = permissions;
        return {"allowed_actions": permissions, "data": data};   // No I18N
    },
    /**
     * Pre-data to construct note's template
     */
    getAdditionalFieldsTemplateData: function(tabName, tabSetting, tabs_panel){
        var obj = {};
        var stageName = tabs_panel.internal_name;
        obj.stage = stageName;
        return obj;
    },

}