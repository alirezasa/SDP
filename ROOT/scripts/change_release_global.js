/* $Id$ */
var $CRObj = {
    redirectTo: function (module, forwardTo, id, tabName, from, view, mode, operation, associatedEntityId) {
            $CRObj.doPush = true;
            //Resetting ffr didFetchRules when for is loaded
            if($se&&$se.ffr){
                $se.ffr.didFetchRules=false;
            }
        var printPreview = $CRObj.printPreview;
        var pathName = ""; // No I18N
            forwardTo = forwardTo ? forwardTo : (isNaN(parseInt(id)) ? "list" : "detail"); // No I18N

        var externalframe  = $CRObj.externalframe == "true"; // No I18N
        if(forwardTo === "list"){ // No I18N
            //hide scrollbar for listview.. But scrollbar will be present for associations
            if(operation != "associated") {
                jQuery('body').addClass('of-h'); // No I18N
            }
            pathName = (module=="release") ? "/release/ReleaseList.jsp" : ""; // No I18N
        }else if(forwardTo === "detail"){ // No I18N
            jQuery('body').removeClass('of-h'); // No I18N
            pathName = (module=="release") ? "/release/ReleaseDetails.jsp" : "/change/ChangeDetail.jsp"; // No I18N
        }else{
            jQuery('body').removeClass('of-h'); // No I18N
            pathName = (module=="release") ? "/release/ReleaseForm.jsp" : "/change/ChangeForm.jsp"; // No I18N
        }
        var containerId = printPreview ? "module-content" : "change-section"; // No I18N
        var params = ""; // No I18N
            if(module=="release" || (module=="change" && printPreview)){ // No I18N
                addParam("module="+module); // No I18N
            }
            if(externalframe){ // No I18N
                addParam("externalframe="+externalframe); // No I18N
            }
            if(module === 'change') {
                from && addParam("from="+from); // No I18N
                (associatedEntityId && associatedEntityId != "null") && addParam("associatedEntityId="+associatedEntityId); // No I18N
            }
            //Params added for association scenerio
            if(operation == "associated") {
                addParam("from="+from); // No I18N
                addParam("operation="+operation); // No I18N
                var associatedEntityIdParam = ((module==="release" && forwardTo==="list")? "associatedEntityID=":"associatedEntityId=");//No I18N
                (associatedEntityId && associatedEntityId != "null") && addParam(associatedEntityIdParam+associatedEntityId); // No I18N
            }
            if(mode == "copy")
            {
                addParam("mode=copy");// No I18N
            }
            var modeVal = mode ? mode : forwardTo;// No I18N
            if(module=="release" && (modeVal=="add" || modeVal=="edit" || modeVal=="form")){
                jQuery('body').addClass("pos-rel"); // No I18N
                var getData = null;
                if(id && id!="null"){
                    sdpAjax({url:'/api/v3/releases/'+id+'/_get_properties',success:function(resp){getData = resp;},async:false});// No I18N
                }
                var canEdit = getData && getData.release;
                if((canEdit && canEdit.submission_edit==true) || !canEdit){
                    pathName = "/release/ReleaseForm.jsp";// No I18N
                    var checkForm = modeVal=="form" ? "edit" : modeVal;// No I18N
                    addParam("mode="+checkForm);// No I18N
                }else if(canEdit && canEdit.submission_edit==false){
                    window.open('/jsp/AuthError.jsp',"_self");
                }
            }else if(module=="change" && (modeVal=="add" || modeVal=="edit" || modeVal=="form")){  // No I18N
                //If mode is add and user don't have create change permission redirect to auth error page.
                const activeWindow = $extFrame.getActiveWindow();
                if(modeVal=="add" && !activeWindow.sdp_user.ROLES.includes("CreateChanges"))
                {
                    window.open('/jsp/AuthError.jsp',"_self", 'noopener');
                }
                else if(modeVal=="edit" && id && id!="null" ){
                    sdpAjax({url:'/api/v3/changes/'+id+'/get_properties',success:function(resp){getData = resp;},async:false});// No I18N
                    var canEdit = getData && getData.change;
                    //If the user don't have edit permission accessing the change url should redirect to auth error page
                    if(canEdit && canEdit.Submission_edit==false)
                    {
                        window.open('/jsp/AuthError.jsp',"_self", 'noopener');
                    }
                }


                var checkForm = modeVal=="form" ? "edit" : modeVal;// No I18N
                addParam("mode="+checkForm);// No I18N
            }
            else if(forwardTo == "detail"){
                if(!tabName){
                    tabName = module=="change" ? "Submission" : "submission"; // No I18N
                }
                addParam("tabName="+tabName); // No I18N                
                addParam("printPreview="+printPreview); // No I18N
            }else if(forwardTo == "new"){ // No I18N
                addParam("forwardTo=new"); // No I18N 
            }
            if(id){
              $CRObj.entity_id = id;
              addParam("id="+id); // No I18N
            }
            function addParam(param) {
                params += params === "" ? param : "&"+param; // No I18N
            }
            if(params){
                params = "?"+params;
            }
        jQuery("#"+containerId).load(pathName+params, function() {
            if(!printPreview && !externalframe && (forwardTo !== "list" || from == "entity_not_exists")){ // No I18N
                $CRObj.pushingStateURL(module, forwardTo, id, tabName, view, mode);
            }
            else if(forwardTo == "list" && from == "cancelForm"){
                $CRObj.pushingStateURL(module, forwardTo, id, tabName, view, mode);
            }
        });
    },
    callPrintpreview : function(module, id){
        this.printPreview = true;
        this.redirectTo(module, "detail", id); // No I18N
    },
    pushingStateURL :function(module, forwardTo, id, tabName, view, mode){
        
        var urlStr = "";  // No I18N
        function addParam(param) {
            urlStr += urlStr === "" ? (module =="change" ? "changes?" : "releases?") : "&"; // No I18N
            urlStr += param;
        }

        if(id && id != "null"){
            addParam("entity_id=" + id); // No I18N
        }

        if(forwardTo != "list"){ // No I18N
            if(module=="release" && (view=="preview" || mode=="add" || mode=="edit" || mode=="form")){
                if(view=="preview"){
                    addParam("mode=add&view=preview");// No I18N
                }else{
                    addParam("mode=" + mode); // No I18N
                    tabName="";
                }
            }else{
                addParam("mode=" + forwardTo); // No I18N
            }
        }else{
          addParam("mode=get");// No I18N
        }
        if(forwardTo != "list" && tabName){ // No I18N
            urlStr += "#"+tabName;
        }
        if($CRObj.doPush){
            window.history.pushState({'forwardTo' : forwardTo, "entity_id": id, "tab": tabName, "module": module, "spa_skipstate" : true}, '', urlStr); // No I18N
        }else{
            $CRObj.doPush = true;
        }
    }
}