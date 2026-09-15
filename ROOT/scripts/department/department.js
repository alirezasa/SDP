var departmentMod =  (function(){
    var deptModel = {};
    deptModel.siteGroupExceptReferModel = null;
    deptModel.departmentModel = [];
    window.selectedUsersSelect2Data = deptModel.selectedUsersSelect2Data = { includeUsers: [], excludeUsers: [] };
    deptModel.dissociateObj= {};
    /**
     * Initiate department site filter dropdown
     * @param {*} controller 
     * @param {*} ele 
     * @param {*} selobject 
     * @param {*} isChanged 
     */
    deptModel.initDepartSiteFilter = function(controller, ele, selobject, isChanged){
        const currEle = ele && ele.id;
        const listViewComp = (currEle=='pa-siteFilter') ? controller.p_controller.tableComp : controller.tableComp;//NO I18N
        
        if(listViewComp && listViewComp.hasOwnProperty("t_obj")){
            const listInfoObj = listViewComp.t_obj.table_info.list_info;
            let getSearchCriteria = listInfoObj.search_criteria;
            if(selobject){
                const getDeletedVal = controller.isInActive;
                if(getSearchCriteria && Array.isArray(getSearchCriteria)){
                    const isDelCriteriaInd = getSearchCriteria.findIndex(obj => obj.field ==="deleted");//NO I18N
                    if(isDelCriteriaInd!=-1){
                        getSearchCriteria[isDelCriteriaInd].value = getDeletedVal;
                    }
                    const isSiteCriteriaInd = getSearchCriteria.findIndex(obj => obj.field ==="site");//NO I18N
                    if(isSiteCriteriaInd!=-1){
                        getSearchCriteria[isSiteCriteriaInd].value = (selobject.id==-1) ? null : selobject.id;
                    }else{
                        getSearchCriteria.push({
                            "field":"site",//NO I18N
                            "value":(selobject.id==-1) ? null : selobject.id,
                            "condition":"is",//NO I18N
                            "logical_operator":"AND"//NO I18N
                        });
                    }
                }else{
                    listInfoObj.search_criteria = {
                        "field":"site",//NO I18N
                        "value":(selobject.id==-1) ? null : selobject.id,
                        "condition":"is",//NO I18N
                        "logical_operator":"AND"//NO I18N
                    };
                }
            }else{
                if( Array.isArray(getSearchCriteria)){
                    const getIndexVal = getSearchCriteria.findIndex(obj => obj.field ==="site" || obj.field ==="site.id");//NO I18N
                    if(getIndexVal!=-1){
                        listViewComp.t_obj.table_info.list_info.search_criteria.splice(getIndexVal,1);
                    }
                }else{
                    delete listInfoObj.search_criteria;
                }
                
            }
            
        }
        
        const personaliseSiteCont = (currEle=='pa-siteFilter') ? null : ((PORTALID>0) ? (esm_details && esm_details.current_portal.name.replace(/ /g, "_")+"_depart_site_val") : "esm_depart_site_val");//NO I18N
        if(personaliseSiteCont && selobject){
            if(sdp_user.CLIENT_CONF.hasOwnProperty(personaliseSiteCont)){
                if(sdp_user.CLIENT_CONF[personaliseSiteCont] && sdp_user.CLIENT_CONF[personaliseSiteCont].hasOwnProperty("id")){
                    if(selobject && selobject.hasOwnProperty("id")){
                        if(selobject.id!=sdp_user.CLIENT_CONF[personaliseSiteCont].id){
                            addPersonalization(personaliseSiteCont, selobject);
                        }
                    }
                }else{
                    addPersonalization(personaliseSiteCont, selobject);
                }
            }else{
                addPersonalization(personaliseSiteCont, selobject);
            }
        }else{
            personaliseSiteCont && addPersonalization(personaliseSiteCont, selobject);
        }
        listViewComp.refreshTable();
    },
    /**
     * Render organization roles function in department form
     * @param {*} controller 
     * @param {*} departCtrl 
     */
    deptModel.renderOrgRolesFun=function(controller,departCtrl){
        const getFormData = departCtrl && Object.keys(departCtrl.storeFormConfig).length>0 && departCtrl.storeFormConfig;
        const input_data = { "row_count": 100, "search_criteria": [{ "field": "associated_entity", "value": "department", "condition": "is" }] };//NO I18N
        let cloneOpt = {
            mode: "new",//NO I18N
            selector: "department-roles-section",//NO I18N
            min_rows:0,
            max_rows:10,
            meta_info: {
                org_role: {
                    type: "lookup",//NO I18N
                    place_holder: "common.select.roles",//NO I18N
                    unique: true,
                    select2_options: {
                        dropdownCssClass: 'text-wrap',//NO I18N
                        url: [{
                            url: "/api/v3/org_roles",//NO I18N
                            field: "org_roles",//NO I18N
                            list_info: input_data
                        }]
                    },
                    error_messages: {
                        data_msg_required: translate("dre.clone.field.error.msg")
                    }
                },
                user: {
                    type: "lookup",//NO I18N
                    place_holder: "admp.select.user",//NO I18N
                    select2_options: {
                        dropdownCssClass: 'text-wrap',//NO I18N
                        url: [{
                            url: sdp_app.IS_ESMDIR ? "/api/v3/orgusers" : "/api/v3/users",//NO I18N
                            field: sdp_app.IS_ESMDIR ? "orgusers" : "users",//NO I18N
                            processResults: function processResults(search_data, data) {
                                var textVal = data.text ? data.text : data.email_id ? data.name + ", " + data.email_id : data.name;
                                search_data.push({
                                    id: data.id,
                                    text: textVal
                                });
                            }
                        }]
                    },
                    error_messages: {
                        data_msg_required: translate("dre.clone.field.error.msg")
                    }
                }
            },
            callbackRowDelete: function callbackRowDelete(obj) {
                if(jQuery('[data-attr="clonerows"]').length == 0){
                    jQuery("#orgwrapper").addClass("hidden");   
                    jQuery("#assign_roles").show();
                }
            }
        };
        if (getFormData.mode === "edit" || getFormData.mode === "view" || isMDHSetup=="true") {
            const getStoreConfig = departCtrl.storeFormConfig;
            cloneOpt.data = (getStoreConfig && getStoreConfig.entitydata && getStoreConfig.entitydata.role_associations) || [];
            cloneOpt.mode = getStoreConfig && getStoreConfig.mode;
            if(!cloneOpt || !cloneOpt.data || cloneOpt.data.length == 0){
                if(getFormData.mode === "edit"){
                    jQuery("#assig_roles").show();
                }
            }
        }
        controller.departRolesCloneObj = new cloneRows(cloneOpt);
    };
    /**
     * Rendering this function for site dropdown for both listview and pending association popup
     * @param {*} ele 
     * @param {*} ctrl 
     * @param {*} selSiteVal 
     * @param {*} sdpSiteVar 
     */
    deptModel.renderSiteDropdown=function(ele,ctrl,selSiteVal,sdpSiteVar){
        let isEle = (ele==="#pa-siteFilter") ? "" : ((selSiteVal && selSiteVal.id) ? ({id:sdp_user.CLIENT_CONF[sdpSiteVar].id,text:sdp_user.CLIENT_CONF[sdpSiteVar].name || sdp_user.CLIENT_CONF[sdpSiteVar].text}) : "");
        isEle = (typeof departmentMod.getSiteIsAvail!='undefined') ? (isEle ? ((departmentMod.getSiteIsAvail==false) ? "" : isEle) : "") : isEle;
        jQuery(ele).sdp_select2({
            value:isEle,
            cache:false,
            multiple:false,
            placeholder: translate("sdp.admin.org.technician.allsite"), // No I18N
            allowClear: true,
            width : 180,
            formatSelection: function (item) {
                if(item && item.id=="-1"){
                    item.text = translate("sdp.common.defaultsetting");//NO I18N
                }
                return e_html(item.text);
            },
            formatResult: function (item) {
                if(item && item.id=="-1"){
                    item.text = translate("sdp.common.defaultsetting");//NO I18N
                }
                return e_html(item.text);
            },
            url:[{
            url:"/api/v3/departments/site",//NO I18N
            field:'site',//NO I18N
            list_info:{fields_required:["id","name"]}//NO I18N
            }]
        });
        jQuery(ele).off('change').on("change",function(){
            const data = jQuery(this).select2('data');//NO I18N
            ctrl.actions.deptSiteFilterExeFun(this,data,ctrl,true)
        });  
    },
    /**
     * Construct name for department ci details page in listview
     * @param {*} tableData 
     * @param {*} ctrl 
     * @returns 
     */
    deptModel.constructDepartmentCiDet=function(tableData,ctrl){
        const data = tableData.row_data;
        if (data.linked_ci === undefined) {
            return '-';
        } else {
            const getLinkedCi = data.linked_ci;
            /**Onclick function for ci link */
            jQuery(document).off('click').on('click','.view_ci',function(evt){//NO I18N
                const getDepartId = jQuery(evt.target).attr("data-row-id");
                const getCiId = jQuery(evt.target).attr("data-ci-id");
                const pageUrl = `/cmdb/CIPopup.jsp?ciid=${getCiId}&externalframe=true&refEntity=departments&refField=linked_ci&refInstanceId=${getDepartId}`;
                $previewComponent.load(pageUrl,executeTitleFunction(),"600px")//NO I18N
            });
            /**For setting title to cidetails slider popup */
            function executeTitleFunction() {
                return `<div><span>${translate('ae.cmdb.importci.header.ciDetails')}</span></div>`;
            }
            /**Check license is professional or not */
            if(ctrl.getEdition=="Professional"){
                return `<a id="departments_ci_${data.id}" data-row-id="${data.id}" data-ci-id="${getLinkedCi.id} href="/"  class="cur-ptr view_ci" title="" rel="uitip" orgtitle="${data.name}_Associated_ci">${getLinkedCi.name}</a>`;
            }else{
                return `<span>${getLinkedCi.name}</span>`;
            }
        }
    },
    /**Get product redition is proffessional or enterprise */
    deptModel.getProductEdition=function(){
        
        let getEdition = null;
        sdpAjax({
            url: "/overview/controller?action=getLicenseInformation",//NO I18N
            async:false,
            success: function (response) {       
                getEdition = response.PRODUCTEDITION;
            }
        });
        return getEdition;
    },
    /**
     * Callback function for search result in department listview
     * @param {*} search 
     * @param {*} ctrl 
     * @param {*} tableData 
     */
    deptModel.departCallbackSearchFunction=function(search,ctrl,tableData){
        let critChildArray = [];
        let tableObj = ctrl.tableComp;
        let search_Obj = tableObj.t_obj.table_info.list_info.search_criteria;
        let getSelSiteValue = jQuery("#site-dropdown").val();
        getSelSiteValue = (getSelSiteValue && getSelSiteValue==-1) ? null : getSelSiteValue;
        const getDeletedVal = ctrl.isInActive;
        let isDeleted = false;
        let getCriteriaData = function(getKey,isChangeSite){
            if(getKey.field=="deleted" || getKey.field=="site.id" || getKey.field=="site"){
                getKey.condition = "is";//NO I18N
                if(getKey.field=="site.id" || getKey.field=="site"){
                    getKey.field = "site";//NO I18N
                    isChangeSite && (getKey.value = getSelSiteValue);
                }
            }
            if(getKey.field=="deleted"){
                isDeleted = true;
            }
        }
        
        if(search_Obj && search_Obj.children && search_Obj.children.length>0){
            search_Obj.children.forEach(function(fld,index){
               getCriteriaData(fld);
                critChildArray.push(fld);
            });
            getCriteriaData(search_Obj,true);
            if(search_Obj.field=="site.id" || search_Obj.field=="site"){
                search_Obj.value = getSelSiteValue;
            }
            delete search_Obj.children;
        }else{

            if(search_Obj && search_Obj.field=="deleted"){
                isDeleted = true;
                search_Obj.condition = "is";//NO I18N
            }
            let getSearchCriteriaValue = tableObj.t_obj.table_info.list_info.search_criteria;
            if(getSearchCriteriaValue && typeof getSelSiteValue!="undefined" && getSelSiteValue!=""){
                critChildArray.push({"field":"site","value":getSelSiteValue,"condition":"is","logical_operator":"AND"})//NO I18N
            }else if(typeof getSelSiteValue!="undefined" && getSelSiteValue!=""){//NO I18N
                critChildArray = [{"field":"site","value":getSelSiteValue,"condition":"is","logical_operator":"AND"}];//NO I18N
            }
            
        }
        
        if(search_Obj && (search_Obj.field=="site.id" || search_Obj.field=="site")){
            search_Obj.condition = "is";//NO I18N
            search_Obj.field = "site";//NO I18N
            if(getSelSiteValue==""){
                search_Obj = null;
            }
        }
        if(!isDeleted){
            critChildArray.push({"field":"deleted","value": getDeletedVal,"condition":"is","logical_operator":"AND"});//NO I18N
        }
        
        search_Obj && Array.isArray(critChildArray) && critChildArray.push(search_Obj);
        delete tableObj.t_obj.table_info.list_info.search_fields;
        tableObj.t_obj.table_info.list_info.search_criteria = critChildArray;
        tableObj.refreshTable();
    },
    /**
     * Used function for search criteria
     * @param {Object} ctrl 
     * @returns 
     */
    deptModel.getSearchCriteriaForDepartment=function(ctrl){
        const searchCriteriaValue = [{"field":"deleted","value": false,"condition":"is","logical_operator":"AND"}];//NO I18N
        let currEsmPortalName = !sdp_app.IS_ESMDIR ? (esm_details && esm_details.current_portal.name.replace(/ /g, "_")+"_depart_site_val") : "esm_depart_site_val";//NO I18N
        let selSiteVal = !sdp_app.IS_ESMDIR  ? sdp_user.CLIENT_CONF[currEsmPortalName] : sdp_user.CLIENT_CONF.esm_depart_site_val;
                 
        if(selSiteVal && selSiteVal!==undefined && selSiteVal!=='null' && selSiteVal.id!="-1"){
            const getSelSiteId = selSiteVal.id;
            const getSites = sdpAjax({url:"/api/v3/sites/"+getSelSiteId,async:false,ignorefailuremessage: true});//NO I18N
            if(getSites.responseJSON.response_status.status=="success"){
                getSites.then(function(response){
                    const siteData = response.site;
                    selSiteVal.text = siteData.name;
                    departmentMod && (departmentMod.getSiteIsAvail = true);
                    searchCriteriaValue.push({
                        "field":"site",//NO I18N
                        "value": getSelSiteId,//NO I18N
                        "logical_operator":"AND",//NO I18N
                        "condition":"is"//NO I18N
                    });
                });
            }else if(getSites.responseJSON.response_status.status=="failed"){//NO I18N
                if(getSites.responseJSON.response_status.messages && getSites.responseJSON.response_status.messages.length>0){
                    if(getSites.responseJSON.response_status.messages[0].status_code=="4002"){
                        searchCriteriaValue.push({
                            "field":"site",//NO I18N
                            "value": getSelSiteId,//NO I18N
                            "logical_operator":"AND",//NO I18N
                            "condition":"is"//NO I18N
                        });
                    }
                }
                departmentMod && (departmentMod.getSiteIsAvail = false);
            }
        }else if(selSiteVal && selSiteVal!==undefined && selSiteVal!=='null' && selSiteVal.id=="-1"){
            
            searchCriteriaValue.push({
                "field":"site",//NO I18N
                "value": null,//NO I18N
                "logical_operator":"AND",//NO I18N
                "condition":"is"//NO I18N
            });
        }
        return searchCriteriaValue;
    },
    /**
     * Used to initiate department after callback body render
     * @param {undefined} tableData 
     * @param {Object} ctrl 
     */
    deptModel.forInitiatingDepartment=function(tableData,ctrl){
        const self = ctrl.getDepartMod;
        jQuery("#pen_assoc_click").off('click.assocition-department').on('click.assocition-department','a',function(){// No I18N
            self.dissociateDeptDialog(ctrl)
        });
    },  
    deptModel.forPendingAssociationInfo=function(tableData,ctrl,data){
        const self = departmentMod;
        if(!sdp_app.IS_ESMDIR && sdp_user.ROLES.indexOf("SDAdmin")!=-1){
            self.checkForPendingAssociations();
        }
        self.departmentModel= data.visibleContents;
        
    },
    /**
     * Execute function to render listview while onchange filters based on site
     * @param {*} controller 
     * @param {*} isDeleted 
     * @param {*} tComp 
     */
    deptModel.includeDelatedInSearchFields=function(controller, isDeleted,tComp){
        let getSearchCriteria = tComp.t_obj.table_info.list_info.search_criteria;
        if(getSearchCriteria && Array.isArray(getSearchCriteria)){
            const isDelCriteriaInd = getSearchCriteria.findIndex(obj => obj.field ==="deleted");//NO I18N
            if(isDelCriteriaInd!=-1){
                getSearchCriteria[isDelCriteriaInd].value = isDeleted;
            }
        }
        
        
        const getSiteVal =  jQuery("#site-dropdown").val();
        if(getSiteVal==-1){
            tComp.t_obj.table_info.default_searchfields = {"site":null}//NO I18N
        }else if(!getSiteVal){
            delete tComp.t_obj.table_info.default_searchfields.site;
        }else{
            tComp.t_obj.table_info.default_searchfields = {"site":jQuery("#site-dropdown").val()}//NO I18N
        }
        
        if(tComp.t_obj.table_info.default_searchfields &&
            Object.keys(tComp.t_obj.table_info.default_searchfields).length>0){
            tComp.t_obj.table_info.default_searchfields.deleted =  isDeleted;
        }else{
            tComp.t_obj.table_info.default_searchfields = {"deleted" : isDeleted};//NO I18N
        }
        
        delete tComp.t_obj.table_info.search_fields;
            self.departmentModel = tComp.visibleContents;
       
            
    },
    /**Pending association initiate function */
    deptModel.checkForPendingAssociations=function(){
        const self = this;
        self.dissociateObj= {};
        let pendingAssoPromise = sdpAjax({
            url: "/api/v3/departments/_pending_associations"// No I18N
        });
        pendingAssoPromise.then(function (response) {
            self.dissociateObj.pending_associations = response.pending_associations;
            if(self.dissociateObj.pending_associations.associated_assets==false && self.dissociateObj.pending_associations.user_criteria==false){
                jQuery('#am-list-view').find('[name=pending_assoc_section]').hide();
            }else{
                jQuery('#am-list-view').find('[name=pending_assoc_section]').show();
            }
        });
    },
    /**Dissociatie department from pending association popup
     * @param {*} indexCtrl
     */
    deptModel.initDissociateDeptPopup= function(indexCtrl){
        const self = this;
        const parentElement = jQuery('#departmentDissociateContainer');
        self.parentCtrl.getParentTcomp = self.parentCtrl.tablwindoweComp;
        let pendAssociationsData = self.dissociateObj.pending_associations;
        if(!window.siteGroupExceptReferModel || (window.siteGroupExceptReferModel && !window.siteGroupExceptReferModel.hasOwnProperty("Sites"))){
            window.siteGroupExceptReferModel= {"Sites" : indexCtrl.getModulesInfo('departments/site',null,"site")};//NO I18N
        }
       
        if(pendAssociationsData.user_criteria){
            parentElement.find("#dissociateAssetsContainer").hide().end()
                        .find("#userCriteriaContainer").show().end()
                        .find("#advancesearch tr").not("#cloneCriteriaRow").remove(); //NO I18N
            self.populateRequesterCriteria();
            self.addUserCriteriaListeners();
            if(!pendAssociationsData.associated_assets){
                parentElement.find("[data-rel='stepLabel']").hide().end()
                             .find("#userCriteriaSubmit").text(translate("sdp.common.submit"));
            }
        }else if(pendAssociationsData.associated_assets){
            parentElement.find("#userCriteriaContainer").hide().end()
                        .find("#dissociateAssetsContainer").show().end()
                        .find("[data-rel='stepLabel']").hide();
            self.populateAssetAssociations();
            jQuery("#pa-siteFilter").select2("data",{});//NO I18N
            self.renderSiteDropdown("#pa-siteFilter",self.parentCtrl);//NO I18N
        }
    },
    /**
     * Open dissoaciate dialog using jquery dialog
     * @param {*} controller 
     */
    deptModel.dissociateDeptDialog= function(controller){
        const self = this;
        self.parentCtrl = controller;
        self.initDissociateDeptPopup(controller);
        let defaultOptions = {
            width: 800,
            draggable: false,
            resizable: false,
            top:0,
            right:0,
            title: function() {
                const currEle = this,
                      backEle = '<div><span>'+translate('esm.dept.modifyassociations')+'</span></div>';
                jQuery(currEle).html(backEle)
            },
            placement : sdp_user.DIRECTION === "RTL" ? "left" : "right", //NO I18N
            close: function(){
                self.parentCtrl.tableComp =  self.parentCtrl.getParentTcomp;
                deptModel.closeDeptDissociatePopup();
            }
          }
          window.inactiveDepartmentsPopup = function(){
            let inactivePopupOptions = {
                width: 400,
                resizable: false,
                draggable:false,
                top:0,
                right:0,
                title: translate("common.departments.inactive"),
                placement : sdp_user.DIRECTION === "RTL" ? "left" : "right"//NO I18N
            }
            jQuery('#inactiveDeptPopup').panelSlider(inactivePopupOptions);// No I18N
        }
        jQuery('#departmentDissociateContainer').panelSlider(defaultOptions);// No I18N

        jQuery("#viewDelDepartment").off('click.view-department').on('click.view-department',function(){// No I18N
            inactiveDepartmentsPopup("#site-delete-div-header");// No I18N
        });
    },
    /**Populate request criteria in association */
    deptModel.populateRequesterCriteria=function(){
        const self = this,
              parentElement = jQuery('#userCriteriaContainer'),
              requestCriteriaPromise = sdpAjax({
            url: 'api/v3/associate_portal_requesters/'+PORTALID,//NO I18N
            headers: {Accept: "vnd.manageengine.v3+json"}//NO I18N
        });
        
        requestCriteriaPromise.then(function (result) {
            const CriteriaObj = result.associate_portal_requester;
                const curInstanceEle = CriteriaObj.is_alluser_as_requester ?  "instance-two" : "instance-one";//NO I18N
                parentElement.find(".instance-common").hide().end()
                             .find("."+curInstanceEle).show().end()
                             .find(".importchose[data-rel='"+curInstanceEle+"']").prop('checked', true);//NO I18N     
              if(!CriteriaObj.is_alluser_as_requester)
              {
                   if(!sdp_app.alluser_configured){
                       //show the users who needed to be acknowledged by the portal admin.
                       self.showVerifyUsersListMsg();
                   }
                   const requester_conditions = CriteriaObj.requester_conditions;
                   let rowsCount = 0, maxRow = 0;
                   for(var i=0; i< requester_conditions.length; i++ )
                   {
                       Criteria = requester_conditions[i];
                       
                       const newEleFromClone = parentElement.find("#cloneCriteriaRow").clone(true),
                         selectElement = newEleFromClone.find('select[id=field]').attr('id', 'field_'+i);//NO I18N
                       maxRow = selectElement[0].length - 1; //maximum row that can be added
                      
                       const selectedFieldId = (Criteria.field == "Department") ? 2 : 1,//NO I18N
                           condition = Criteria.condition;
                       selectElement.val( selectedFieldId );
                    
                       if(Criteria.field === "User") {
                           if( condition === "is not" ) {
                               var data = self.getSelectedIds(Criteria).Criteria;
                               self.selectedUsersSelect2Data.excludeUsers = data;
                               if(data.length > 0) {
                                   self.showExcludeUsers(true);
                               }
 
                           } else if(condition === "is") {// No I18N
                               self.selectedUsersSelect2Data.includeUsers = self.getSelectedIds(Criteria).Criteria;
                           }
                           continue;
                       }
                       rowsCount++;
                       newEleFromClone.find('select[id=criteria]').attr('id', 'criteria_'+i).val(Criteria.condition);//NO I18N
                       
                       var ids = "",
                       fldName = (Criteria.field == "Department" ? "departments" : "sites"),//NO I18N
                       selectedObj = self.getSelectedIds(Criteria, fldName);
                      
                       newEleFromClone.find('input[id=criteriaValue]').attr('id', 'criteriaValue_'+i).attr('data-fld', fldName)
                    
 
                       ids = selectedObj.ids;
                       selectedObj = selectedObj.Criteria;
                       
                       

                       let select2options = {
                        value:selectedObj,
                        multiple : true,
                        placeholder: translate("form.select.placeholder",[fldName]), // No I18N
                        allowClear: true,
                        url:[{
                        url:"/api/v3/"+fldName,//NO I18N
                        field:fldName,
                        list_info:(fldName=="departments") ? {start_index:1,row_count:100,"search_criteria": [{"field":"deleted","value": false,"condition":"is","logical_operator":"AND"}]} : {start_index:1,row_count:100}//NO I18N
                        }],
            
                         showmaxlength:10
                       }
                       let addOpt = {};
                           ids = ids.substring(0,ids.length-1);
                       if(fldName == "sites"){
                        parentElement.find("#siteIdsStr").val(ids);
                           addOpt = {
                               changeCallBack : self.callbackAssociation
                           }
                       } else if(fldName == "departments"){ // No I18N
                        parentElement.find("#DepartmentsIdsStr").val(ids);
                           addOpt = {
                               changeCallBack : self.callbackAssociation,
                               formatResult : self.deptSiteFormatResult,
                               formatSelection : self.deptSiteFormatResult
                           };
                           if(parentElement.find("#isDepartmentDissociatePopup").val() === "true"){
                             //add list of deleted departments used in user criteria to deleted dept pop-up
                             let itemList = "", critValues = Criteria.values;
                             for(let k=0, len=critValues.length; k<len; k++){
                               if(critValues[k].is_deleted || critValues[k].deleted){
                                 itemList += '<div class="form-group mt15" data-siteid="0">'+ e_html(critValues[k].name) +'</div>';
                               }
                             }
                             jQuery("#inactiveDeptContainer").html(itemList);
                           }
                       }
                       select2options = jQuery.extend(select2options,addOpt);
                       newEleFromClone.find('select[id=operator]').attr('id', 'operator_' + i).addClass("hide");//NO I18N
                       
                       if(i == 0){
                        newEleFromClone.find('div[id=operatorTxt]').attr('id', 'operatorTxt_' + i).addClass("hide").end()//NO I18N
                                       .find('select[id=operator]').attr('id', 'operator_' + i).addClass("hide");//NO I18N
                       }else{
                        newEleFromClone.find('div[id=operatorTxt]').attr('id', 'operatorTxt_' + i).removeClass("hide").text(Criteria.logical_operator).end()//NO I18N
                                       .find('select[id=operator]').attr('id', 'operator_' + i).val((Criteria.logical_operator == "AND" ? 1 : 2));//NO I18N
                       }
 
                       var addRowBtn = newEleFromClone.find('a[id=addBtn]').attr('id', 'addBtn_'+i);
                       var removeRowBtn = newEleFromClone.find('a[id=removeBtn]').attr('id', 'removeBtn_'+i);
 
                       removeRowBtn.removeClass( "hide" );//NO I18N
                       addRowBtn.addClass( "hide" );//NO I18N
 
                       newEleFromClone.attr('id', 'criteriaRow_'+i).removeClass("hide");//NO I18N
 
                       parentElement.find("#cloneCriteriaRow").parent().append(newEleFromClone);
                       if(fldName == "sites"){
                           newEleFromClone.find('#criteriaValue_'+i).closest('td').append('<span class="aspr template-sm icon-sm opac5 m5 cur-ptr pos-abs top5" data-value="Sites" data-import="site" id="import_sitepopup" title="'+translate("sdp.admin.org.technician.associatesites")+'"></span>'); // No I18N
                       }else if(fldName == "departments") { // No I18N
                           newEleFromClone.find('#criteriaValue_'+i).closest('td').append('<span class="aspr template-sm icon-sm opac5 m5 cur-ptr pos-abs top5" data-value="Departments" data-import="department" id="import_departmentpopup" title="'+translate("user.associate.departments")+'"></span>'); // No I18N
                       }
                       jQuery("#criteriaValue_"+i).sdp_select2(select2options)
                       
                   }
                   jQuery(parentElement).off('click').on('click','#import_sitepopup,#import_departmentpopup',function(e){//NO I18N
                    self.callUserAssociation(e.currentTarget.getAttribute("data-value"))
               });
                   if ( rowsCount < maxRow ) {
                    parentElement.find("#addBtn_" + (rowsCount - 1)).removeClass("hide");
                   }
 
                    if(rowsCount === 0) {
                        parentElement.find('.importchose[data-rel=instance-one]').click();
                    }
                    
                    self.showIncludeUsers(true);
               }
               
        });
       
           
            jQuery(document).on('click','#UsersCriteria .removerowbtn,#UsersCriteria .addrowbtn', function(e) {
                const getCurrSelEle = e.currentTarget;
                if(jQuery(getCurrSelEle).hasClass("addrowbtn")){
                    self.addRequesterNewCriteriaRow(getCurrSelEle);
                }else{
                    self.removeRequesterCriteriaRow(getCurrSelEle);   
                }
                
            });
   },
   /**
    * execute to get associated user
    * @param {*} field 
    */
   deptModel.callUserAssociation=function(field){
    var self = this, options = {};
    
        window.importUserAssociation = {};
       
    if(field == "Departments"){
      options.allowed_values = self.departmentModel;
      var getEleId = jQuery('[data-fld="departments"]').attr("id");
      options.selected_values = jQuery('#userCriteriaContainer').find("#"+getEleId).val() && jQuery('#userCriteriaContainer').find("#"+getEleId).val().split(","); // No I18N
      options.dialogtitle = options.label = translate("sdp.admin.leftpanel.helpdesk.department"); // No I18N
    }else if(field == "Sites"){ // No I18N
      options.callbackToGetContent = userList.AppendSitesHTML;
      options.dialogtitle = options.label = translate("sdp.admin.org.technician.associatedsites"); // No I18N
    }
    options.saveCallBack = saveAssociatedIds;
    
    importUserAssociation = new BulkAssociationComponent(options,userList);

    importUserAssociation.field = field;
},
deptModel.removeRequesterCriteriaRow=function(obj){
    var parentElement = jQuery('#userCriteriaContainer'),
        eleGrandParent = jQuery(obj).parent().parent(),
        rowCount = jQuery('tr[id^=criteriaRow_]').length;
    eleGrandParent.remove();
    if(rowCount < 2) {
        parentElement.find('.importchose[data-rel=instance-one]').click();
        return;
    }
    var uniqueID = parentElement.find('tr[id^=criteriaRow_]').last().attr('id').split('_')[1];//NO I18N
    parentElement.find('#addBtn_'+uniqueID).removeClass("hide");
    if(rowCount <= 2) {
        parentElement.find("#operatorTxt_"+uniqueID).addClass("hide");
    }
},
deptModel.addRequesterNewCriteriaRow=function(obj){
    var parentElement = jQuery('#userCriteriaContainer'),
       uniqueID = parentElement.find(obj).attr('id').split('_')[1],//NO I18N
      field = parentElement.find('#field_' + uniqueID).val(),//NO I18N
      criteria = parentElement.find('#criteria_' + uniqueID).val(),//NO I18N
      criteriaValue = parentElement.find('#criteriaValue_' + uniqueID).val(),//NO I18N
      criteriaRow = parentElement.find('tr[id^=criteriaRow_]'),
      maxRow = parentElement.find("field_" + uniqueID).length - 1; //maximum row that can be added

    if( field != undefined && field != -1 && criteria != undefined && criteria != -1 && criteriaValue != undefined && criteriaValue != '' ){
        var newUniqueID = parseInt(uniqueID) + 1;
           var newElement = parentElement.find("#cloneCriteriaRow").clone(true);
           newElement.find('select[id=field]').attr('id', 'field_' + newUniqueID).end()//NO I18N
                        .find('select[id=criteria]').attr('id', 'criteria_' + newUniqueID).end()//NO I18N
                        .find('input[id=criteriaValue]').attr('id', 'criteriaValue_' + newUniqueID).end()//NO I18N
                        .find('select[id=operator]').attr('id', 'operator_' + newUniqueID).end()//NO I18N
                        .find('div[id=operatorTxt]').attr('id', 'operatorTxt_' + newUniqueID).removeClass("hide").show();//NO I18N

        var addBtn = jQuery(newElement).find('a[id=addBtn]');
        if(criteriaRow.length + 1 >= maxRow) {
          addBtn.addClass("hide");//NO I18N
        }
        newElement.find('a[id=removeBtn]').prop('id', 'removeBtn_' + newUniqueID).removeClass("hide");//NO I18N
        newElement.find('#removeBtn_' + uniqueID).removeClass("hide");//show remove button for the current element.
        addBtn.prop('id', 'addBtn_' + newUniqueID);//NO I18N
        newElement.find('#addBtn_' + uniqueID).addClass("hide").end()//hide current element add button.
                  .attr('id', 'criteriaRow_' + newUniqueID).removeClass("hide");//NO I18N
                  parentElement.find("#cloneCriteriaRow").parent().append(newElement);
    }
    else{
        showalert(translate("sdp.request.advsearch.showalert.enterall"));
    }
    
    
},
deptModel.deptSiteFormatResult=function(state){
    return e_html(state.text) + ( state.site ? ", " + e_html(state.site.name) : "" );
},
deptModel.callbackAssociation=function(ele){
    jQuery(ele).closest("td.form-element").find("[data-import]").trigger("click"); // No I18N
},
deptModel.getSelectedIds=function(Criteria, fldName) {
    var selectedObj = [], ids = "";
    for(var k=0; k < Criteria.values.length; k ++){
        if(fldName != "sites" || (fldName == "sites" && k < 10)){
            Criteria.values[k].text = Criteria.values[k].name;
            selectedObj.push(Criteria.values[k]);
        }
        ids += Criteria.values[k].id + ",";//NO I18N
    }
    return {Criteria: selectedObj, ids: ids}
},
deptModel.showIncludeUsers=function(isDisplay) {
    
    var self = this;
   if(!isDisplay) {
       jQuery("#include_users_to_import").select2("data", []).parent().addClass("hide");// No I18N
       return;
   }
   
   self.initUsersSelect2({
       placeholder: translate("sdp.users.include.select2.placeholder"),
       id: "include_users_to_import",//NO I18N
       callback: self.openUserIncludeListView,
       data: self.selectedUsersSelect2Data.includeUsers
   });

   jQuery("#include_users_to_import").parent().removeClass("hide");
},
deptModel.showVerifyUsersListMsg=function() {
    var crObj = {
        "field": "operation_type",// No I18N
        "condition": "contains",// No I18N
        "values": [// No I18N
            "user_list_for_acknowledge"// No I18N
        ]
    },
    list_info = { fields_required: ["id"] }, inObj = {}, dataVal = {};
    list_info.row_count = 1;
    list_info.get_total_count = true;
    inObj.list_info = list_info;
    list_info.search_criteria = crObj;

    dataVal = sdpAjaxInputData(inObj);
    sdpAjax({
        url : "/api/v3/users", // No I18N
        data : dataVal,
        success: function(resp){
            var portalUsersList = jQuery("#portalUsersList");
            if(resp.users.length > 0){
                portalUsersList.find("#userCount").html(resp.list_info.total_count).end().show(); // No I18N
            } else {
                portalUsersList.hide();
            }
        }
    });
},
deptModel.userCriteriaTypeChange= function(ele){
    
    var parentElement = jQuery('#userCriteriaContainer'),
        optionSelected = parentElement.find(ele.target).data("rel"); //NO I18N
    if(optionSelected === "instance-one"){
        parentElement.find(".instance-two").hide().end()
                    .find(".instance-one").show();
    }else if(optionSelected === "instance-two"){ //NO I18N
        parentElement.find(".instance-one").hide().end()
                    .find(".instance-two").show();
    }
},
deptModel.openUserIncludeListView=function() {
    window.open('/setup/UsersPopup.jsp?popupfor=include_orgusers&isUser=true&module=import_user','mydetails','1100','750','yes','center',"_self","noopener");
},
deptModel.openExcludeUserListView=function() {
    window.open('/setup/UsersPopup.jsp?popupfor=exclude_orgusers&isUser=true&module=import_user','mydetails','1100','750','yes','center',"_self","noopener");
  },
  deptModel.showExcludeUsers=function(ele) {
    ele.preventDefault();
    var self = this,
        parentElement = jQuery('#userCriteriaContainer'),
        container = parentElement.find("#exclude_users_from_import").parent(),//NO I18N
        isDisplay = typeof ele == "boolean" ? ele : ele.target.checked;//NO I18N
        
    parentElement.find("#exclude_users_chkbx").attr("checked", isDisplay);// No I18N
    if(!isDisplay) {
        container.addClass("hide");//NO I18N
        parentElement.find("#exclude_users_from_import").select2("data", []).parent().addClass("hide");// No I18N
        return;
    }

    container.removeClass("hide");

    self.initUsersSelect2({
        placeholder: translate("sdp.users.include.select2.placeholder"),
        id: "exclude_users_from_import",//NO I18N
        callback: self.openExcludeUserListView,
        data: self.selectedUsersSelect2Data && self.selectedUsersSelect2Data.excludeUsers
    });
},
deptModel.initUsersSelect2=function(options) {
    var self = this,
        select2options = {
            value: options.data,
            multiple:true,
            placeholder: options.placeholder,
            allowClear: true,
            readonly:true,
            url:[{
            url:"/api/v3/users",//NO I18N
            field:'users'//NO I18N
            }],
            formatSelection : self.userFormatResult,
            criteriaCallback: self.assetStateCritCB,
            changeCallBack : options.callback,
            showmaxlength:10
   };
   jQuery('#'+options.id).sdp_select2(select2options);
   initTooltip("#departmentDissociateContainer")//NO I18N
},
//returns select2 option tooltip format to show the user's basic details such as name, email, and email id.
deptModel.userFormatResult = function(user){
    var titleStr = '<div><b>'+getMessageForKey('sdp.common.name.is')+' : </b><span>'+e_attr(user.name)+'</span><br><b>'+getMessageForKey('sdp.common.email.is')+' : </b><span>'+(user.email_id ? e_attr(user.email_id) : "N/A" )+'</span><br><b>'+getMessageForKey('sdp.common.empid.is')+' : </b><span>'+(user.employee_id ? e_attr(user.employee_id) : 'N/A' )+'</span><br><b>'+getMessageForKey('sdp.common.dept.is')+' : </b><span>'+((user.department && user.department.name)? e_attr(user.department.name) + (user.department.site ? ", " + e_attr(user.department.site.name) : "" ) : 'N/A' )+'</span><br></div>'; // No I18N
    
    return `<div rel="uitip" mode_html="true" title="${e_attr(titleStr)}" >${e_html(user.name)}</div>`;
};
deptModel.submitUserCriteria= function(){
    var self = this,
    parentElement = jQuery('#departmentDissociateContainer'),
        criteriaValidation = self.importPortalUser();
    if(criteriaValidation !== false){
        jQuery('#userCriteriaContainer').hide();
        if(self.dissociateObj.pending_associations.associated_assets){
            parentElement.find("#dissociateAssetsContainer").show().end()
                        .find("#assetDissociationSubmit").text(translate("sdp.admin.home.wizard.finish"));
            self.populateAssetAssociations();
        }else{
            self.closeDeptDissociatePopup(true);
        }
    }
},
deptModel.importPortalUser=function()
{
        var requesterCriteria = {},
            parentElement = jQuery('#userCriteriaContainer'),
            criteria_details = [],
            criteriaElement = parentElement.find('tr[id^=criteriaRow_]'),//NO I18N
            users,
            self = this;
        if( parentElement.find(".importchose[data-rel='instance-one']").is(":checked") ){
            if(self.validateRequesterDynamicCriteria() ){
                for( i = 0; i < criteriaElement.length; i++ ){
                        var criteria = {},
                          rowElement = parentElement.find(criteriaElement[i]);
                        criteria.field = jQuery(rowElement).find('select[id^=field_]').find('option:selected').val();//NO I18N
                        var fieldId = criteria.field,fieldElementId;
                                                                                                                                             
  
                        if(fieldId === "1") {
                            criteria.field = "Site"; // No I18N
                            fieldElementId = "siteIdsStr"; // No I18N
                        } else if(fieldId === "2") { // No I18N
                            criteria.field = "Department"; // No I18N
                            var getEleId = jQuery('[data-fld="departments"]').attr("id");
                            fieldElementId = getEleId; 
                        } else if(fieldId === "-1") { // No I18N
                            continue;
                        }
                        if(fieldId !== "3") { // No I18N
                         criteria.values = jQuery("#" + fieldElementId).val().split(',');
                        }
                        criteria.condition = jQuery(rowElement).find('select[id^=criteria_]').find('option:selected').val();//NO I18N
  
                        if( i == 0 ){
                                criteria.logical_operator = '-';//NO I18N
                        }
                        else{
                                var operator = jQuery(rowElement).find('div[id^=operatorTxt_]').text();//NO I18N
                                criteria.logical_operator = ( operator == "AND" ? "AND" : "OR");//NO I18N
                        }
                        criteria_details.push(criteria);
                }
  
                var excludedUsersIds = [], includeUsersIds = [];
  
                jQuery.each(self.selectedUsersSelect2Data.excludeUsers, function(index, val) {
                  excludedUsersIds.push(val.id);
                });
  
                jQuery.each(self.selectedUsersSelect2Data.includeUsers, function(index, val) {
                  includeUsersIds.push(val.id);
                });
  
                if (includeUsersIds.length) {
                    var inlcludeUsers = {
                        field: "User", // No I18N
                        condition: "is", // No I18N
                        values: includeUsersIds,
                        logical_operator: "OR" // No I18N
                    };
                    criteria_details.push(inlcludeUsers);
                }
  
                if (excludedUsersIds.length && jQuery("#exclude_users_chkbx").is(":checked")) {
                    var excludeUsers = {
                        field: "User", // No I18N
                        condition: "is not", // No I18N
                        values: excludedUsersIds,
                        logical_operator: "AND" // No I18N
                    };
                    criteria_details.push(excludeUsers);
                }
                if( criteria_details && criteria_details.length > 0 ){
                    requesterCriteria.requester_conditions = criteria_details;
                }
                requesterCriteria.is_alluser_as_requester = false;
                sdp_app.IS_IMPORT_ALL_ORG_USER = false;
            }
            else{
                return false;
            }
        }
        else if(parentElement.find(".importchose[data-rel='instance-two']").is(":checked") ){
            requesterCriteria.is_alluser_as_requester = true;
            sdp_app.IS_IMPORT_ALL_ORG_USER = true;
        }
        else{
            showalert('failure', translate("mdh.user.import.choose.import.type"), 'isAutoHide=true');//NO I18N
            return;
        }
        jQuery("#loader-div").html('<div data-id="cview-freeze" class="cview-freeze" style="z-index: 10;">'+ajaxBar("white")+'</div>');//NO I18N
        const inputData = {associate_portal_requester: requesterCriteria};


        sdpAjax({
            url: "/api/v3/associate_portal_requesters/"+PORTALID,//NO I18N 
            type:"PUT",//NO I18N
            async: false,
            data: sdpAjaxInputData(inputData),
            headers: {Accept: "vnd.manageengine.v3+json"},//NO I18N
            success : function(response) {
                jQuery("#loader-div").html('');
                showalert('success',translate("user.import.success"),'isAutoHide=true');//NO I18N
                if(jQuery("#isDepartmentDissociatePopup").val() !== "true"){
                    userList.redirectTo('list',true); //No I18N
                }
            },
            error : function( result ){
                jQuery("#loader-div").html('');
                showalert('failure', e_html(result.responseJSON.response_status.messages[0].message), 'isAutoHide=true');//NO I18N
            }
        });
    },
    deptModel.validateRequesterDynamicCriteria=function(){
        var fieldNameList = jQuery('select[id^=field_]'),//NO I18N
            self = this;
        for(var i = 0; i < fieldNameList.size(); i++ ){
            var fieldName = jQuery(fieldNameList[i]).val(),
              hasUsers = self.selectedUsersSelect2Data.includeUsers.length > 0,
              isFieldSelected = !(fieldName == null || fieldName == undefined || fieldName == -1);
            if(!hasUsers && !isFieldSelected){
                showalert(translate("user.import.crit.field.mandate"));
                return false;
            }
            if(hasUsers && !isFieldSelected) {
                return true;
             }
        }
        var criteriaList = jQuery('select[id^=criteria_]');//NO I18N
        if(criteriaList && criteriaList.size()>0){
            for(var j = 0; j < criteriaList.size(); j++ ){
                var criteria = jQuery(criteriaList[j]).val();
                if( criteria == null || criteria == undefined || criteria == -1 ){
                    showalert(translate("user.import.crit.type.mandate"));
                    return false;
                }
            }
        } 
        
        var criteriaValueList = jQuery('input[id^=criteriaValue_]');//NO I18N
        if(criteriaValueList && criteriaValueList.size()>0){
            for(var k = 0; k < criteriaValueList.size(); k++ ){
                var value = jQuery(criteriaValueList[k]).val();
                if( value == '' ){
                    showalert(translate("user.import.crit.value.mandate"));
                    return false;
                }
            }
        }
        return true;
    },
    deptModel.addUserCriteriaListeners=function(){
        var self = this,
        parentElement = jQuery("#userCriteriaContainer");
        parentElement.find("#cloneCriteriaRow").parent().find("select").on('change', function(){
            self.onchangeForAllDropdownCriteria(this)
        });
        parentElement.find('.typeopt').on('click', function() {
            parentElement.find(this).text() === 'AND' ? parentElement.find(this).text('OR') : parentElement.find(this).text('AND');//NO I18N
        });
        
    },
    deptModel.onchangeForAllDropdownCriteria=function(currentElement){
        var objID = jQuery(currentElement).attr('id'),//NO I18N
        parentElement = jQuery("#userCriteriaContainer"),
              uniqueID = objID.split('_')[1];//NO I18N
            if( objID != undefined && objID.indexOf('field_') > -1 )
            {
                var crFieldId = parentElement.find(currentElement).val();
                if(crFieldId != "-1"){
                    var fldElements = parentElement.find(currentElement).closest('tr').parents('tbody').find('select[id^=field_]'),//NO I18N
                        hasDupldate = false;
                    for(var i in fldElements) {
                        if( currentElement !== fldElements[i] && fldElements[i].value === crFieldId ) {
                            hasDupldate = true;
                            break;
                        }
                        }

                    if( hasDupldate ) {
                        showalert('failure', translate("import.user.criteria.dublicate",[e_html(jQuery(fldElements[0]).children("option").filter(":selected").text())]), 'isAutoHide=true');//NO I18N
                        parentElement.find(currentElement).closest('tr').find('#criteriaValue_'+uniqueID).val("").next().remove();
                        parentElement.find(currentElement).val(-1).trigger('change');
                        return false;
                    }
                }
                parentElement.find(currentElement).parent().parent().find('select[id=criteria_' + uniqueID + ']').val(-1);//NO I18N
                
                var seleField = parentElement.find(currentElement).val();
                jQ("#criteriaValue_"+uniqueID).select2('destroy');//NO I18N
                parentElement.find(currentElement).closest('tr').find('#criteriaValue_'+uniqueID).next().remove(); //removing existing selection button   // No I18N
                let select2options;
                var select2Container = parentElement.find(currentElement).closest('tr').find('#criteriaValue_'+uniqueID).closest('td'); // No I18N
                parentElement.find("input#criteriaValue_" + uniqueID).val("");
                if(seleField == "1"){
                    parentElement.find("#siteIdsStr").val("");
                    select2options = {
                        value:"",
                        multiple : true,
                        placeholder: translate("form.select.placeholder",[translate("sdp.admin.leftpanel.helpdesk.site")]),//NO I18N
                        allowClear: true,
                        url:[{
                        url:"/api/v3/sites",//NO I18N
                        field:"sites"//NO I18N
                        }],
            
                         showmaxlength:10
                       }
                   
                    select2Container.append(`<span class="aspr template-sm icon-sm opac5 m5 cur-ptr pos-abs top5" data-import="site" id="import_sitepopup" data-value="Sites" title="${translate("sdp.admin.org.technician.associatesites")}"></span>`); // No I18N
                }else if(seleField == "2"){
                    parentElement.find("#DepartmentsIdsStr").val("");
                    select2options = {
                        value:"",
                        multiple : true,
                        placeholder:  translate("form.select.placeholder",[translate("sdp.admin.leftpanel.helpdesk.department")]),//NO I18N
                        allowClear: true,
                        formatResult : self.deptSiteFormatResult,
                        formatSelection : self.deptSiteFormatResult,
                        url:[{
                        url:"/api/v3/departments",//NO I18N
                        field:"departments",//NO I18N
                        list_info:{start_index:1,row_count:100,"search_criteria": [{"field":"deleted","value": false,"condition":"is","logical_operator":"AND"}]}//NO I18N
                        }],
            
                         showmaxlength:10
                       }
                   
                    select2Container.append(`<span class="aspr template-sm icon-sm opac5 m5 cur-ptr pos-abs top5" data-import="department" data-value="Departments" id="import_departmentpopup" title="${translate("user.associate.departments")}"></span>`); // No I18N
                }
                if(seleField !== "-1") {
                    parentElement.find('#criteriaValue_'+uniqueID).sdp_select2(select2options);

                    parentElement.find('#criteriaValue_'+uniqueID).on("change",function(){//NO I18N
                        departmentMod.callbackAssociation()
                    });
                    
                    parentElement.find('[id^=removeBtn_]').last().removeClass("hide")
                }
                parentElement.find(currentElement).parent().find('span[id=field_' + uniqueID + '-error]').remove();//NO I18N
            }
            else if( objID != undefined && objID.indexOf('criteria_') > -1 )
            {
                
                parentElement.find(currentElement).parent().parent().find('span[id=criteria_' + uniqueID + '-error]').remove();//NO I18N
            }
    },
    /**Populate asset assocaitions function */
    deptModel.populateAssetAssociations=function(){
        const self = this;
        self.initComponent();
        const parentElement = jQuery('#dissociateAssetsContainer')
        parentElement.on('change',"[name='cusRadio']", function(){
            var moveTo = this.value;
            if(moveTo === "dept"){
                parentElement.find("#selectDepartment").select2("enable").end()//NO I18N
                             .find("#selectAssetState").select2("val",null).select2("disable").end()//NO I18N
                             .find("#moveAssetsCB").removeClass("hide");
            }else if(moveTo === "state"){ //NO I18N
                parentElement.find("#selectAssetState").select2("enable").end()//NO I18N
                             .find("#selectDepartment").select2("val",null).select2("disable").end()//NO I18N
                             .find("#moveAssetsCB").addClass("hide").find("input").prop("checked", false); //NO I18N
            }
            jQuery("#assetDissociationSubmit").prop("disabled", true); //No I18N
        });

        parentElement.find("#selectDepartment,#selectAssetState").select2("val",null).select2("disable").on('change', function(){ //NO I18N
            if(this.value){
                jQuery("#assetDissociationSubmit").prop("disabled", false); //No I18N
            }else{
                jQuery("#assetDissociationSubmit").prop("disabled", true); //No I18N
            }
        });
        
        parentElement.find("#selectAssetState").sdp_select2({
            value:"",
            multiple:false,
            placeholder: translate("form.select.placeholder", [translate("sdp.inventory.detailAsset.state")]), // No I18N
            allowClear: true,
            url:[{
            url:"/api/v3/asset_states",//NO I18N
            field:'asset_states',//NO I18N
            list_info:{"search_criteria":[{ field:"is_ownership_allowed",condition:'is',value:"false",logical_operator:"AND"},{ field:"name",condition:'is not',value:"In Repair",logical_operator:"AND"}]}//NO I18N
            }],
            criteriaCallback: self.assetStateCritCB
        });    
        parentElement.find("#selectDepartment").sdp_select2({
            value:"",
            multiple:false,
            placeholder: translate("form.select.placeholder", [translate("sdp.helpdesk.common.dept")]), // No I18N
            allowClear: true,
            url:[{
            url:"/api/v3/departments",//NO I18N
            field:'departments',//NO I18N
            list_info:{start_index:1,row_count:100,"search_criteria": [{"field":"deleted","value": false,"condition":"is","logical_operator":"AND"}]}//NO I18N
            }],
            formatResult: self.formatDepartmentsCB,
            formatSelection: self.formatDepartmentsCB,
            criteriaCallback: self.DeptCritCB,
            processResults: function(search_data, data) {
                let processedResult = {
                    id:  data.id,
                    text: data.name || data.text,
                    deleted: data.deleted,
                    site : data.site
                };
                search_data.push(processedResult);
            }
        });    
    },
    /**
     * Format department text in department dropdown in assocaition page
     * @param {*} data 
     * @returns 
     */
    deptModel.formatDepartmentsCB= function(data){
        var dept = data.name || data.text;
        if(data.site){

            dept = dept + ", " + data.site.name;
        }
        return e_html(dept);
    },
    /**
     * Search department based on search text 
     * @param {*} searchText 
     * @returns 
     */
    deptModel.DeptCritCB = function(searchText){
        if(searchText){
            //if search text present, search through both department and site
            var crit_Obj = {} , critArray = [];
            crit_Obj = {
                "field" : "name", // No I18N
                "condition" : "like", // No I18N
                "value" : searchText, // No I18N
                "logical_operator" : "OR" // No I18N
            };
            critArray.push({"field":"deleted","value": false,"condition":"is","logical_operator":"AND"}); // No I18N
            crit_Obj.children = critArray;
            return crit_Obj;
        }else{
            return false;
        }
    },
    /**
     * Search asset based on search text 
     * @param {*} searchText 
     * @returns 
     */
    deptModel.assetStateCritCB= function(searchText){
        let crit_Obj = {} , critArray = [];
        crit_Obj = {
            "field" : "is_ownership_allowed", // No I18N
            "condition" : "is", // No I18N
            "value" : "false", // No I18N
            "logical_operator" : "AND" // No I18N
        };
        critArray.push({"field":"name","condition":"is_not","value": "In Repair","logical_operator" : "AND"}); // No I18N
        if(searchText){
           critArray.push({"field":"name","condition":"like","value": searchText,"logical_operator" : "AND"}); // No I18N
        }
        crit_Obj.children = critArray;
        return crit_Obj;
    },
    deptModel.initComponent = function() {
        const self = this;
        const getDefaultMetainfo = self.parentCtrl && self.parentCtrl.tableComp && self.parentCtrl.tableComp.t_obj && self.parentCtrl.tableComp.t_obj.meta_info; 
        
        self.parentCtrl.getParentTcomp = self.parentCtrl.tableComp;
        let getModulesList = Ember.getOwner(self.parentCtrl).lookup("controller:admin.modules").moduleConfigurations,//NO I18N
            getPenAssModuleConfigs = getModulesList.pendingassociatedepartments,
            tempCtl = {"isSubentity":true, "parentController" : self.parentCtrl},//NO I18N
            options = {
            "tableHolder" : "departmentsPA",  // No I18N
            "staticHeader" :false, // No I18N
            "callbackURL" : getPenAssModuleConfigs.listview.entity_name, // No I18N
            "entity_name" : getPenAssModuleConfigs.listview.entity_name, // No I18N
            bulkSelectionSetting : {
                unSelectionCallback: function (elm) {
                    self.addDissociatePopupListeners(elm,self)
                },
                selectionCallback: function (elm) {
                    self.addDissociatePopupListeners(elm,self)
                }
            }
        };
        
        let getModuleCtrl = Ember.getOwner(self.parentCtrl).lookup("controller:admin.modules");//NO I18N
        getModuleCtrl.moduleConfigurations.pendingassociatedepartments.listview.meta_info = getDefaultMetainfo;
        self.parentCtrl.send("showListView","pendingassociatedepartments", getPenAssModuleConfigs, options, tempCtl);//NO I18N
      },
      /**
       * Onchange function for radio button inside association form
       * @param {*} elm 
       * @param {*} self 
       */
      deptModel.addDissociatePopupListeners= function(elm,self){
            const parentElement = jQuery('#dissociateAssetsContainer');
            const cusRadioBtns = parentElement.find("[name='cusRadio']");
            const selectedDepts = self.parentCtrl.tableComp && self.parentCtrl.tableComp.bulkSelect.getSelectedIDs().length;
            if(selectedDepts>0){
                cusRadioBtns.prop("disabled", false); //NO I18N
            }else{
                cusRadioBtns.prop("disabled", true); //NO I18N
                cusRadioBtns.prop("checked", false); //NO I18N
                parentElement.find("#selectDepartment,#selectAssetState").select2('disable').select2('val','').end()//NO I18N
                            .find("#moveAssetsCB").addClass("hide").find("input").prop("checked", false); //NO I18N
                jQuery("#assetDissociationSubmit").prop("disabled", true); //No I18N
            }
    },
    /**
     * Execute function to associate assets
     * @returns 
     */
    deptModel.submitAssetAssociations= function(){
        const self = this;
        let input_data = {},
            selectedDepts = [],
            parentElement = jQuery('#dissociateAssetsContainer'),
            moveTo = parentElement.find("[name='cusRadio']:checked").val(),
            checkedBoxes = parentElement.find("#departmentsPA_body input:checked");
        for(var i=0; i<checkedBoxes.length; i++){
            selectedDepts.push(checkedBoxes[i].value);
        }
        selectedDepts = selectedDepts.join(",");
        
        if(moveTo === "dept"){
            var changeAssetSite = parentElement.find("#moveAssetsCB input").prop("checked"); //NO I18N
            var moveToDept = parentElement.find("#selectDepartment").val();
            if(!moveToDept){
                showalert(translate("common.validation", [translate("ae.cmdb.source.dept")]));
                return;
            }
            input_data.department_id = moveToDept;
            input_data.change_asset_site = changeAssetSite;
        }else if(moveTo === "state"){ //NO I18N
            var moveToState = parentElement.find("#selectAssetState").val();
            if(!moveToState){
                showalert(translate("common.validation", [translate("sdp.inventory.detailAsset.state")]));
                return;
            }
            input_data.state_id = moveToState;
        }else if(selectedDepts === ""){
            showalert(translate("esm.dept.dissociate.emptydept"));
            return;
        }else if(!moveTo){
            showalert(translate("esm.dept.dissociate.emptymoveto"));
            return;
        }
        const getSelIds = self.parentCtrl.tableComp.bulkSelect.getSelectedIDs();
        if(getSelIds && getSelIds.length>0){
            sdpAjax({
                url: "/api/v3/departments/_pending_associations?ids="+getSelIds,//NO I18N
                type:"PUT",//NO I18N
                async: false,
                data: sdpAjaxInputData(input_data),
                success : function() {
                    let message = parentElement.find("#assetAssociationDeptSuccessMess").text();
                    if(moveTo === "state"){
                        message = parentElement.find("#assetAssociationStateSuccessMess").text();
                    }
                    showalert('success',e_html(message),'isAutoHide=true');//NO I18N
                    self.closeDeptDissociatePopup(true);
                }
            });
        }
    },
    /**
     * Execute function to Close dialog
     * @param {*} isAfterSubmit 
     */
    deptModel.closeDeptDissociatePopup=function(isAfterSubmit){
        jQuery('#departmentDissociateContainer').dialog('close'); //NO I18N
        let checkedRadio = jQuery("#dissociateAssetsContainer [name='cusRadio']:checked");
        const moveTo = checkedRadio.val();
        checkedRadio.prop("checked", false); //No I18N
        if(moveTo === "dept"){
            jQuery("#selectDepartment").select2("val",null).select2("disable"); //NO I18N
            jQuery("#moveAssetsCB").addClass("hide").find("input").prop("checked", false); //NO I18N
        }else if(moveTo === "state"){ //NO I18N
            jQuery("#selectAssetState").select2("val",null).select2("disable"); //NO I18N
        }
        jQuery("#assetDissociationSubmit,[name='cusRadio']").prop("disabled", true); //No I18N
        if(isAfterSubmit){
            this.checkForPendingAssociations();
        }
    };
    return deptModel;
}());
/**
 * Save function for association form
 * @param {*} selectedObj 
 * @param {*} context 
 * @param {*} field 
 */
function saveAssociatedIds(selectedObj, context, field) {
    field = field || importUserAssociation.field;
    let id; //to get select2 of the field.
    let inputElementId; //used to store field's selected ids.
    const self = this;
    switch (field) {
        case "Sites":// No I18N
            inputElementId = "siteIdsStr";// No I18N
            id = "import_sitepopup"; // No I18N
            break;
        case "Departments":// No I18N
            inputElementId = "DepartmentsIdsStr";// No I18N
            id = "import_departmentpopup"; // No I18N
            break;
        case "include_orgusers":// No I18N
            id = "include_users_to_import"; // No I18N
            self.selectedUsersSelect2Data.includeUsers = selectedObj.select2Objects;
            break;
        case "exclude_orgusers":// No I18N
            var hasUsers = selectedObj.select2Objects.length > 0;

            self.selectedUsersSelect2Data.excludeUsers = selectedObj.select2Objects;
            id = "exclude_users_from_import"; // No I18N
            if(!hasUsers) {
                selfshowExcludeUsers(false);
            }
    }

    let selectElement = jQuery("#" + id);

    if(field !== "exclude_orgusers" && field !== "include_orgusers") {// No I18N
        selectElement = selectElement.prev();
    }

    if(field === "Sites" || field === "Departments") {
        jQuery("#"+ inputElementId).val(selectedObj.selectedIds);
    }

    selectElement.select2('data',selectedObj.select2Objects.slice(0, 10)).trigger("change"); // No I18N
};