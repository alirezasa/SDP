//$Id$
var request_menu ={
    saveMenu : function(menuId){
        var menuName = jQuery('#menuName').val().trim();
        if(menuName == "")
        {
            alert(getMessageForKey("sdp.request.externalaction.alertmsg.actionname"));
            return;
        }
        var forAllTemp = jQuery('input:radio[name=templates]:checked').val();
        var forAllRoles = jQuery('input:radio[name=roles]:checked').val();
        var selectedRoles = jQuery('#rolesList').val().trim();
        
        var selTempIds,selectedTempInTabs,tempList=[];

        if(forAllTemp==4){
            selectedTempInTabs =this.multiselectComp.getSelItems(true);
            if(selectedTempInTabs==null){
                return;
            }

            for(var tab in selectedTempInTabs){
                selTempIds=selectedTempInTabs[tab];
                for(var no=0;no<selTempIds.length;no++){
                    tempList.push(selTempIds[no].id);
                }
            }
        }    

        if(forAllRoles == 'false' && selectedRoles == "")
        {
            alert(getMessageForKey("sdp.request.externalaction.alertmsg.selectroles"));
            return;
        }
        var executor = jQuery('#executor').val().trim();
        var fileLoad=jQuery('#htmlfile').val().trim();
        if(fileLoad=="" && executor == "")
        {
            alert(getMessageForKey("sdp.request.externalaction.alertmsg.executor"));
            return;
        }
        if(fileLoad != ""&&!(fileLoad.endsWith('.htt')||fileLoad.endsWith('.htx')||fileLoad.endsWith('.htm')||fileLoad.endsWith('.html')||fileLoad.endsWith('.htmls'))){
            alert(getMessageForKey("sdp.request.externalaction.html.validation"));
            jQuery('#htmlfile').trigger('focus');
            return;
        }
		var val=executor.split(' ');
		var argumentCount = executor.indexOf("$COMPLETE_V3_JSON_FILE")!=-1?1:0;
		argumentCount+=(executor.indexOf("$HTML_DATA_JSON_FILE")!=-1?1:0);
		argumentCount+=(executor.indexOf("$HANDSHAKE_KEY")!=-1?1:0);
		var dollarCount = executor.split("$").length-1
		if(dollarCount>argumentCount || executor.endsWith("$"))
		{
            alert(getMessageForKey('sdp.admin.custom.menu.script.argumenterror'));
                jQuery('#executor').trigger('focus');
            return ;
		}
        /* if(executor.include("$COMPLETE_V3_JSON_FILE") && (executor.include("$COMPLETE_JSON_FILE") || executor.include("$DIFF_JSON"))){
            if((executor.length - executor.replace(/\$/g, "").length) > 1){
                alert(getMessageForKey('sdp.request.externalaction.argumenterror'));
                jQuery('#executor').trigger('focus');
                return;
            }
        } */

        var menuJSON = {
            "NAME":menuName,//No I18N
            "DESCRIPTION":jQuery('#menuDesc').val(), //No I18N
            "FOR_TEMPLATES":forAllTemp,//No I18N
            "IS_ALL_ROLES":forAllRoles,//No I18N
            "EXEC_TYPE":jQuery( "#executorType2 option:selected" ).val(),//No I18N
            "EXECUTOR":executor.trim(),//No I18N
            "HTML_LOAD":fileLoad.trim(),//No I18N
            "TEMPLATE_LIST":tempList,//No I18N
            "ROLE_LIST":selectedRoles.split(',')//No I18N
        };
        if(jQuery('#menuId').val()!="")
        {
            menuJSON.MENUID=jQuery('#menuId').val();//No I18N
        }
        var items = Object.toJSON(menuJSON);
        var saveURL = '/RequestExternalMenu.do?method=saveMenu';//No I18N
        var dataVal = {"menuJSON" :items}; //No I18N
        jQuery.post( saveURL,dataVal,function( data ) {
            if(data === 'samename'){
                showFailureMessageAndClose(getMessageForKey("sdp.request.externalaction.save.duplicatemsg"),4000);
                return;
            }
            if(data === 'v3_argument_error'){
                showFailureMessageAndClose(getMessageForKey("sdp.request.externalaction.argumenterror"),4000);
                return;    
            }
            var status_msg=data.MESSAGE;
            if(data == "demo_build")
            {
                window.showalert('failure', translate("sdp.setup.orgdef.demoonline.jserror"), "isAutoHide=true"); // No I18N
                return;
            }
            if(status_msg == "duplicate")
            {
                showFailureMessageAndClose(getMessageForKey("sdp.request.externalaction.save.duplicatemsg"),4000);
                return;
            }
            else if(status_msg == "failure")
            {
                showFailureMessageAndClose(getMessageForKey("sdp.request.externalaction.save.failuremsg"),4000);
                return;
            }
            /*else if(status_msg == "restricted_keys_used")
            {
             window.showalert('failure', data.restricted_keys, "isAutoHide=true");   // NO I18N
             return;
            }*/
            else if(status_msg == "invalid_executor_file")
            {
                window.showalert('failure',data.error_message, "isAutoHide=true");   // NO I18N
                return;
            }
            scroll(0,0);
            request_menu.showMenuList();
            if(status_msg == "success")
            {
                showMessageAndClose(getMessageForKey("sdp.request.externalaction.save.successmsg"),4000);
            }
        });
    },

    showAddNewMenu : function(){
        request_menu.getRoles();
        jQuery('#menuId,#menuName,#menuDesc,#htmlfile,#executor').val("");
        jQuery("#allTemplates,#selectRoles").prop("checked",true); //No I18N
        jQuery('#rolesList').select2('data',null); //No I18N
        jQuery('#executorType option[value="script"]').prop('selected', true);//No I18N
        jQuery('#executorHelp').html(getMessageForKey("sdp.request.externalaction.executor.scripthelp"));
        jQuery('#SelectedTemplates').empty();
        jQuery('#SHTemplate,#menulistview').hide();
        jQuery('#addmenu').show();
        jQuery('#menuName').trigger('focus');
    },

    showMenuList : function(){
        if(this.multiselectComp){
            this.multiselectComp.destroyMultiSelect();
        }

        jQuery('#menulistview').show();
        jQuery('#addmenu').hide();
        jQuery('#menuList').html(jQuery('#menuList tr:first'));
        request_menu.showMenusDetails();
    },

    showMenusDetails : function(){
        var menusListURL = '/RequestExternalMenu.do?method=getMenuActionListView';//No I18N
        jQuery.ajax({ type: "GET", cache: false, url: menusListURL}).done(function(data){ //No I18N
            var menuList = data.MENUS;
            for(var i=0;i<menuList.length;i++){
                if(menuList[i].APP_ID || menuList[i].SERVICEID){
                     menuList.splice(i,1);
                     i--;
                }
            }
            if(menuList.length == 0)
            {
                jQuery("#emptyCustomList").show();
                return;
            }
            else
            {
                jQuery("#emptyCustomList").hide();
            }
            jQuery.each(menuList, function(k, menuItem) {
                var menuRow = jQuery('#menuDetails').clone();
                request_menu.addMenuToList(menuRow, menuItem, "add");//No I18N
            });
            request_menu.applyEditDelete();
        });
    },

    applyEditDelete :function(){
        jQuery(".csAcnList").on('mouseenter',//No I18N
            function () {
                jQuery(this).css("background-color","#FCFCCE");//No I18N
            }).on('mouseleave',//No I18N
            function () {
                jQuery(this).css("background-color","transparent");//No I18N
            }
            );
    },

    deleteMenu : function(menuId){
        var deleteURL = '/RequestExternalMenu.do?method=deleteMenu'+'&menuId='+menuId;//No I18N
        jQuery.post(deleteURL,function( data ) {
            jQuery('#menu'+data.MENUID).remove();
            if(data.message == "success")
                {
                    showMessageAndClose(getMessageForKey("sdp.request.externalaction.delete.successmsg"),4000);
                }
            if(jQuery("#menuList tr[id*='menu']").length < 2)
            {
                jQuery("#emptyCustomList").show(); 
            }
        });
    },

    enableDisableMenu : function(menuId){
        var menuURL = '/RequestExternalMenu.do?method=enableDisableMenu'+'&menuId='+menuId;//No I18N
        jQuery.post(menuURL,function( data ) {
            if(data.ISENABLED)
            {
                jQuery('#menu'+data.MENUID+ ' #menuEnableDisable').removeClass("buli_cont pt10 pl10 buli_disabled").addClass("buli_cont pt10 pl10");
                jQuery('#menu'+data.MENUID+ ' #disableicon').removeClass("exTmp-disabled").addClass("exTmp-enabled");
                jQuery('#menu'+data.MENUID+ ' #disableicon').prop("title",getMessageForKey("sdp.request.externalaction.todisable")); //No I18N
            }
            else
            {
                jQuery('#menu'+data.MENUID+ ' #menuEnableDisable').removeClass("buli_cont pt10 pl10").addClass("buli_cont pt10 pl10 buli_disabled");
                jQuery('#menu'+data.MENUID+ ' #disableicon').removeClass("exTmp-enabled").addClass("exTmp-disabled");
                jQuery('#menu'+data.MENUID+ ' #disableicon').prop("title",getMessageForKey("sdp.request.externalaction.toenable"));//No I18N
            }
        });
    },
   
    selectAllTemplates : function(){
        jQuery('#assocTemplates').hide();//No I18N
    },

    showTemplateList : function(){
        var isCompInitialized=jQuery("#multiselect_menuTemplateAssoc").length>0;
        var tempList,selTemp,list_names,data;

        jQuery("#assocTemplates").show();
        if(!isCompInitialized){
            tempList=getAllTemplates();
            selTemp=this.getSelTemplates();
           
            list_names=[{"name":translate("common.incident.templates")}];//No I18N
            if(is_service_catalog_enabled){
                list_names.push({"name":translate("common.service.templates")});
            }
            data={'unselected_list':tempList,//No I18N
                  'id':'menuTemplateAssoc',//No I18N
                  'removeSelected':true,//No I18N   
                  'selected_list':selTemp,//No I18N
                  'subMenuAttrName':'request_templates',//No I18N
                  'unsel_list_names':list_names,//No I18N
                  'sel_list_name':translate('common.selected.templates'),//No I18N
                  'selectionEmptyMsg':translate('sdp.requests.fieldFormRules.selectTemplateErr'),//No I18N
                  'toolTipAttrName':'comments',//No I18N
                  'height':'300px'//No I18N
              };
            this.multiselectComp=new multiSelect(jQuery("#assocTemplates"),data);
        }
    },

    getSelTemplates:function(){
        var menuURL = '/RequestExternalMenu.do?method=getTemplates&menuId='+jQuery('#menuId').val();//No I18N
        if(isMSP){
    		menuURL = menuURL + '&fromRequestCustomMenu=true'; //No I18N
    	}
        var selTemp;
        jQuery.ajax({ 
            type: "GET", //No I18N
            async:false,
            cache: false, 
            url: menuURL
        }).done(function(data){//No I18N
             selTemp=data.selectedTemplates;
        });
        return selTemp;
    },

    editMenu : function(menuId){
        //request_menu.showAddNewMenu();
        jQuery('#menuId').val(menuId);
        var menuURL = '/RequestExternalMenu.do?method=editMenu&menuId='+menuId;//No I18N
        jQuery.ajax({ type: "GET", cache: false, url: menuURL}).done(function(data){//No I18N
            jQuery('#menuName').val(data.NAME.replace(/\\"/g,'"'));
            jQuery('#menuDesc').val(data.DESCRIPTION.replace(/\\"/g,'"'));
            var execType = data.EXECUTORTYPE;
            var html_load=data.HTML_LOAD;
            if(html_load)
            {
                html_load=html_load.replace(/\\"/g,'"');
                jQuery('#htmlfile').val(html_load);
                jQuery('#executorType1').val("html");//No I18N
            }
            jQuery('#executorType2 option[value="' + execType + '"]').prop('selected', true);//No I18N
            if(execType == "script")
            {
                jQuery('#executorHelp2').html(getMessageForKey("sdp.request.externalaction.executor.scripthelp"));
                jQuery('#script-message').show();
            }
            else
            {
                jQuery('#executorHelp2').html(getMessageForKey("sdp.request.externalaction.executor.classhelp"));
                jQuery('#script-message').hide();
            }

            jQuery('#executor').val(data.EXECUTOR.replace(/\\"/g,'"'));
            jQuery('input[name=templates][value=' + data.FOR_TEMPLATES + ']').prop('checked',true);//No I18N
            if(data.FOR_TEMPLATES == '4')
            {
                request_menu.showTemplateList();
            }
            else
            {
               jQuery('#SHTemplate').hide();//No I18N
            }
            if(data.ALL_ROLES)
            {
                jQuery("#allRoles").prop("checked",true); //No I18N
                jQuery("#selRole").hide();//No I18N
            }
            else
            {
                var rolesList = data.ROLES;
                if(rolesList!=null && rolesList!="")
                {
                    jQuery("#selectRoles").prop("checked",true); //No I18N
                    jQuery("#selRole").removeClass("hide").addClass("show");
                    jQuery("#rolesList").select2({
                        placeholder : getMessageForKey("sdp.request.externalaction.alertmsg.selectroles"),
                        data : data.SELECTEDROLES,
                        multiple:true
                    });

                    var roles = new Array();
                    jQuery.each(rolesList, function(roleId,roleName){
                        roles.push(roleId);     
                    });
                    jQuery('#rolesList').select2("val",roles); //No I18N
                    jQuery("#selRole").show();//No I18N
                }
            }
            jQuery('#menulistview').hide();
            jQuery('#addmenu').show();
            
        });
    },

    selectAllRoles : function(){
        jQuery("#selRole").hide();//No I18N
    },
    getRoles : function(){

        jQuery("#selRole").show();//No I18N
        var roleURL = '/RequestExternalMenu.do?method=getMenuRoles'; //No I18N
        jQuery.ajax({ type: "GET", cache: false, url: roleURL}).done(function(roleData){//No I18N
            jQuery("#rolesList").select2({
                placeholder : getMessageForKey("sdp.request.externalaction.alertmsg.selectroles"),
                data : roleData,
                multiple:true,
                closeOnSelect: false
            });
        });
    },

    executorHelpMsg :function(){
        if(jQuery('#executorType2').val() == "script")
        {
            jQuery('#executorHelp2').html(getMessageForKey("sdp.request.externalaction.executor.scripthelp"));
            jQuery('#script-message').show();
        }
        else
        {
            jQuery('#executorHelp2').html(getMessageForKey("sdp.request.externalaction.executor.classhelp"));
             jQuery('#script-message').hide();
        }
    },
    
    invokeActionPlugin : function(menuId,requestId)
    {
        if(isSCP && !sdp_app.IS_REQUEST_CUSTOM_MENU_MODULE_ENABLED) {
            // Request Custom Menu is license based for SCP
            return;
        }
        sdpAjax({
            url: "/servlet/SDAjaxServlet?action=EXECUTE_MENU_ACTION&woid="+requestId+"&menuid="+menuId, // No I18N
            type: "POST", // No I18N
            cache:false,    
            async: false,
            success: function (response) {
                    if(response.result == "failure"){
                            showFailureMessageAndRefreshOnClose(response.message);
                }
                else{
                            showalert('success',response.message,'isAutoHide=true,delay=3,width=400');//NO I18N 
           setTimeout(function(){location.reload()}, 1000);
               }
            }
        });

    },
    addMenuToList : function(menuRow, data, operation)
    {
        var menuRow = jQuery('#menuDetails').clone();
         menuRow.prop("id","menu"+data.MENUID);//No I18N
            menuRow.find('#menuDisp').text(data.NAME.replace(/\\"/g,'"'));
            menuRow.find('#menuDisp').on("click", function(){request_menu.editMenu(data.MENUID);});//No I18N
            menuRow.find('#menuDescDisp').text(data.DESCRIPTION.replace(/\\"/g,'"'));
            var html_load=data.HTML_LOAD;
            if(html_load === undefined){html_load = "";}
            else{html_load=html_load.replace(/\\"/g,'"')};
            if(data.EXECUTOR === undefined){data.EXECUTOR = "";}
            menuRow.find('#htmlfileDisp').text(" : "+html_load);
            menuRow.find('#executorDisp').text(" : "+data.EXECUTOR.replace(/\\"/g,'"'));
            var forTemp = data.FOR_TEMPLATES;
            if(forTemp == "1")
            {
                menuRow.find('#tempDisp').text(" : "+getMessageForKey("sdp.home.ssp.templates.showall"));
            }
            else if(forTemp == "2")
            {
                menuRow.find('#tempDisp').text(" : "+getMessageForKey("sdp.request.externalaction.allIncTemp"));
            }
            else if(forTemp == "3")
            {
                menuRow.find('#tempDisp').text(" : "+getMessageForKey("sdp.request.externalaction.allSerTemp"));
            }
            else if(forTemp == "4")
            {
                var allTemp = data.TEMPLATES;
                var templates = new Array();
                jQuery.each(allTemp, function(tempId,tempName){
                    templates.push(" "+tempName.replace(/\\"/g,'"'));
                });
                var templatesLen=templates.toString();
                if(templatesLen.length<100)
                {
                    menuRow.find('#tempDisp').text(" : "+templates);
                }
                else
                {
                    menuRow.find('#tempDisp').text(" : "+templatesLen.substring(0,100)+"...");
                }
            }

            var rolesList = data.ROLES;
            if(rolesList!=null && rolesList!="")
            {
                var roles = new Array();
                jQuery.each(rolesList, function(roleId,roleName){
                    roles.push(" "+roleName);
                });
                menuRow.find('#roleDisp').text(" : "+roles);
            }
            else
            {
                menuRow.find('#roleDisp').text(" : "+getMessageForKey("sdp.request.externalaction.allroles"));
            }
            menuRow.show();
            menuRow.find('#deleteicon').on("click", function(){request_menu.deleteMenu(data.MENUID);});//No I18N
            menuRow.find('#editicon').on("click", function(){request_menu.editMenu(data.MENUID);});//No I18N
            menuRow.find('#disableicon').on("click", function(){request_menu.enableDisableMenu(data.MENUID);});//No I18N
             if(data.ISENABLED!= undefined && !data.ISENABLED)
                {
                    menuRow.find('#menuEnableDisable').removeClass("buli_cont pt10 pl10").addClass("buli_cont pt10 pl10 buli_disabled");
                    menuRow.find('#disableicon').removeClass("exTmp-enabled").addClass("exTmp-disabled");
                    menuRow.find('#disableicon').prop("title",getMessageForKey("sdp.request.externalaction.toenable"));//No I18N
                }
         if(operation == "add"){
            jQuery('#menuList').append(menuRow);
        }
    },

    menuIdHtmlMap:{},
    fileNotFound:function(menuId){
        var fileName=request_menu.menuIdHtmlMap[menuId];
        alert(getMessageForKey('sdp.request.externalaction.html.notexist',[fileName]));
    }
}
