/* $Id$ */

/* helper for right panel */
/* this helper return true if status comment is not Empty */
Handlebars.registerHelper("isStatusCommentNotEmpty",function(){ //NO I18N
  var closure_info = $req.details.request_info.closure_info;
  if(closure_info && (closure_info.hasOwnProperty("requester_ack_resolution") || closure_info.requester_ack_comments) && $req.details.self_service_portal_settings.is_close_comment_mandatory) {
    return true;
  } else {
    return false;
    }
});

/* this helper return true when status has a seperate section (in case of status close or resolved) */
Handlebars.registerHelper("is_statusHasSection",function(){ //NO I18N
  try {
    if($req.details.request_info.status != null) {
      var statusVal = Handlebars.helpers.getStatusValue();
      if(statusVal === 'Closed' || statusVal === 'Resolved'){
       return true;
      }
    }
  } catch(ex) {
    console.error(ex);
  }
  return false;
});

/* this helper return true if key is present in technician right panel secition and for status it return true when status don't have a seperate section */
Handlebars.registerHelper("getKeySectionStatus",function(key){ //NO I18N
  if($req.rpanel.fieldsObj[key] !== undefined) {
    return $req.rpanel.fieldsObj[key].VIEW;
  }else{
    return false;
  }
});

/* this helper set the display value for multiSelect and multiLine fields */
Handlebars.registerHelper('setFieldText',function(text, fieldId, type, options_display){ //NO I18N

  if(text === '-') {
    return text;
  }
  var textString = "",i=0;  //No I18N
  var length = text.length;
  if(type==='multi_select' && fieldId === 'assets') {
    text = $req.details.asset_info ? $req.details.asset_info : text;
    length = text.length;
    for(i=0; i<length; i++) {
		//104960 In print preview page asset info won't be available so we take asset id from asset data's request info
      var id = text[i].resource_id||text[i].id;
      var value = e_html(text[i].name);
      var asset_info_btn = "";
      var is_deleted = !$req.details.request_info.hasOwnProperty("deleted_assets") ? false : $req.details.request_info.deleted_assets.indexOf(text[i].name) === -1 ? false : true;
      if(sdp_user.ROLES.indexOf("ViewInventoryWS") > -1 && !is_deleted) {
        asset_info_btn = '<button type="button" name="asset_info" data-asset_id='+id+' class="btn btn-xs btn-link vtop ml3 pos-rel top-3" title='+getMessageForKey("sdp.request.requestdetails.tooltip.cidetails")+'><span class="cspr monitor icon-xs"></span></button>';  //No I18N
      }
      if(window.print_mode) {
        textString += '<span class="asset-row mb5">' + value + asset_info_btn + '</span>';  //No I18N
      } else {
        var opacity = is_deleted ? "opac5" : "";  //No I18N
        if(i<3) {
          textString += '<span class="asset-row ' + opacity + '">' + value + asset_info_btn;  //No I18N
          if(i === 2 && length > 3) {
            var remValue = length - i - 1;
            textString += '<a href="/"  data-toggle_field="'+fieldId+'" name = "toggle_show_more" class="asset-less fr text-lowercase">'+remValue+' '+ getMessageForKey("sdp.common.more")+'</a>';  //No I18N
          }
          textString += '</span>';  //No I18N
        } else {
          textString += '<span class="asset-row asset-more hide ' + opacity + '">' + value + asset_info_btn;   //No I18N
          if(i === length-1) {
            textString +='<a href="/" data-toggle_field="'+fieldId+'" name = "toggle_show_more" class="asset-more fr hide text-lowercase">'+getMessageForKey('sdp.common.show')+' '+getMessageForKey("sdp.common.less")+'</a>';//NO I18N
          }
          textString += '</span>';  //No I18N
        }
      }
    }
    return textString;
  } else if(type === 'multi_select' || (type === "unknown" && fieldId === 'email_ids_to_notify')) { //NO I18N
    for(i=0; i<length; i++) {
      if(window.print_mode) {
            textString += '<span class="disp-b mb5">' + e_html(((fieldId=="space"||fieldId=="configuration_items")?text[i].name:text[i]));  //No I18N
			if(fieldId=="configuration_items" && sdp_user.ROLES.indexOf("ViewCI") > -1){
				textString += '<button type="button" name="request_ci_info" data-ci-id='+text[i].id+' class="btn btn-xs btn-link vtop ml3 pos-rel top-3" rel="uitip" title="'+getMessageForKey('ae.cmdb.relationshipmap.actions.viewCIdetails')+'"><span class="cspr monitor icon-xs"></span></button>';
			}
			textString += '</span>';  //No I18N
          } else {
            if(i < 3) {
          textString += '<span class="disp-b mb5">'+ e_html(((fieldId=="space"||fieldId=="configuration_items")?text[i].name:text[i])); //No I18N
		  if(fieldId=="configuration_items" && sdp_user.ROLES.indexOf("ViewCI") > -1){
				textString += '<button type="button" name="request_ci_info" data-ci-id='+text[i].id+' class="btn btn-xs btn-link vtop ml3 pos-rel top-3" rel="uitip" title="'+getMessageForKey('ae.cmdb.relationshipmap.actions.viewCIdetails')+'"><span class="cspr monitor icon-xs"></span></button>';
		  }
          if(i === 2 && length > 3) {
            var remValue = length-i-1;
            textString += '<a class="show-less fr text-link text-lowercase" href="/" data-toggle_field="'+fieldId+'"  name = "toggle_show_more">'+remValue+' '+getMessageForKey("sdp.common.more")+'</a>'; //No I18N
          }
          textString += '</span>';  //No I18N
        } else {
          textString += '<span class="show-more disp-b mb5 hide">' + e_html(((fieldId=="space"||fieldId=="configuration_items")?text[i].name:text[i]));   //No I18N
		  if(fieldId=="configuration_items" && sdp_user.ROLES.indexOf("ViewCI") > -1){
				textString += '<button type="button" name="request_ci_info" data-ci-id='+text[i].id+' class="btn btn-xs btn-link vtop ml3 pos-rel top-3" rel="uitip" title="'+getMessageForKey('ae.cmdb.relationshipmap.actions.viewCIdetails')+'"><span class="cspr monitor icon-xs"></span></button>';
		  }
          if(i === length-1) {
            textString +='<a href="/" class="show-more fr hide  text-link text-lowercase" data-toggle_field="'+fieldId+'"  name = "toggle_show_more">'+getMessageForKey('sdp.common.show')+' '+getMessageForKey("sdp.common.less")+'</a>';//NO I18N
          }
          textString += '</span>';  //No I18N
        }
          }
    }
    if(fieldId === 'email_ids_to_notify') {
      if(text && text.length > 0) {
        text = (text.toString()).replace(/,/g,';');
      }
      //SD-120760 : Email IDs to notify field values should be encoded.
      textString += '<input type="hidden" value="'+e_attr(text)+'" id="select_'+fieldId+'_val">'; //NO I18N
    }
    return textString;
  } else if(type==='multi_line') { //NO I18N
    var dummySpan = document.createElement("span");
        dummySpan.innerText=text;
    if(text.length > 120 && !window.print_mode) {
      textString += '<span class="asset-row">' + (dummySpan.innerHTML).substring(0,120)+ '... <a href="/" class ="text-link text-lowercase" data-toggle_field="'+fieldId+'"  name="show_more_text">'+getMessageForKey('sdp.common.show') + ' ' + getMessageForKey('sdp.common.more') + '<span class="text-content hide">'+e_html(text)+'</span></a></span>';
    } else {
      textString += '<span class="asset-row">' + dummySpan.innerHTML + '</span>';
    }
    return textString;
  }
  if(fieldId=="maintenance"&&$req.details.request_info.maintenance&&$req.details.request_info.maintenance.id&&sdp_user.ROLES.indexOf("ViewRequestMaintenances")>-1 && (!$req.details.request_info.is_service_request || ( $req.details.request_info.is_service_request && sdp_app.IS_SERVICECATALOG_ENABLED ))){
	return '<a href="/" class="cur-ptr text-color4" name="maintenance_preview">'+e_html(text)+'</a>';
  }
  return e_html(text);
});

/* set label for right panel */
Handlebars.registerHelper("setLabel",function(key,associate_change_header){ //NO I18N
  var html = "";
  var request_info = $req.details.request_info;
  var permissions = $req.details.operational_data.links;
  var show_rpanel = $req.layout.show_rpanel;
  var clsName ="ml5", titleStr = ""; //NO I18N
  switch(key){
    case 'linked_requests': //NO I18N
        html ='<label class="control-label disp-ib pt0">'+getMessageForKey("sdp.requests.view.linkedfrom.linked")+'</label> <a id="linked-req-count" class="disp-ib ml5" href="/">('+$req.details.request_metrics.link_request_count+')</a>'; //No I18N
        break;
    case 'linked_to_request': //NO I18N
        html ='<label class="control-label disp-ib pt0">'+getMessageForKey("sdp.requests.view.linkedto.linked")+'</label> <a id="linked-to-req" rel="noopener" class="ml5 disp-ib" href="/WorkOrder.do?woMode=viewWO&woID='+$req.details.request_info.linked_to_request.request.id+'" target="_blank" title="'+getMessageForKey("sdp.common.subject")+ ' : '+encodeHTMLAttribute( $req.details.request_info.linked_to_request.request.subject )+"\n"+getMessageForKey("sdp.requests.linkrequests.comments")+ ' : '+encodeHTMLAttribute( $req.details.request_info.linked_to_request.link_comments ||"")+'"> &#35;'+$req.details.request_info.linked_to_request.request.id+' </a>'; //No I18N
        break;
    case 'associate_problem': //NO I18N
        if(permissions.problem && permissions.problem.get) {
          if(!show_rpanel){
            clsName = "mt10 disp-b nobold text-color6"; //NO I18N
            titleStr = ' &nbsp'+encodeHTMLAttribute($req.details.request_associations.request_problem_association.problem.title); //NO I18N
          }
          html ='<label class="control-label disp-ib pt0"><span data-i18n-key="request.problem.associated">'+getMessageForKey("request.problem.associated")+'</span><a data-id="'+$req.details.request_associations.request_problem_association.problem.id+'" id="asso-problem-id" class="'+clsName+'" rel="uitip noopener" data-default-tooltip="true" title="'+e_html($req.details.request_associations.request_problem_association.problem.title)+'" href="/ui/problems?mode=detail&entity_id='+$req.details.request_associations.request_problem_association.problem.id+'" target="_blank"> &#35;'+$req.details.request_associations.request_problem_association.problem.id+ titleStr+' </a></label>'; //No I18N
        } else {
          html ='<label class="control-label disp-ib pt0" data-i18n-key="request.problem.associate">'+getMessageForKey("request.problem.associate")+'</label>'; //NO I18N
        }
      break;
    case 'associate_change': //NO I18N
        if(associate_change_header === 'causesheader') {
          html += '<label class="ml20">'+getMessageForKey("sdp.requests.changedialog.causesheader"); //NO I18N
          if(permissions.request_initiated_change && permissions.request_initiated_change.get) {
            if(!show_rpanel){
              clsName = "mt10 disp-b nobold text-color6"; //NO I18N
              titleStr = ' &nbsp'+encodeHTMLAttribute($req.details.request_associations.request_initiated_change.change.title); //NO I18N
            }
            html +='<a id="change-initiated-id" class="'+clsName+'" rel="uitip noopener" data-default-tooltip="true" title="'+e_html($req.details.request_associations.request_initiated_change.change.title)+'" href="/ui/changes?entity_id='+$req.details.request_associations.request_initiated_change.change.id+'&mode=detail" target="_blank"> &#35;'+$req.details.request_associations.request_initiated_change.change.id+titleStr+' </a>';   //No I18N
          }
          html +='</label>';  //No I18N
        } else if(associate_change_header === 'causedbyheader') { //NO I18N
          html +='<label class="ml20">'+getMessageForKey("sdp.requests.changedialog.causedbyheader"); //NO I18N
          if(permissions.request_caused_by_change && permissions.request_caused_by_change.get) {
            if(!show_rpanel){
              clsName = "mt10 disp-b nobold text-color6"; //NO I18N
              titleStr = ' &nbsp'+encodeHTMLAttribute($req.details.request_associations.request_caused_by_change.change.title); //NO I18N
            }
            html += '<a id="change-caused-id" class="'+clsName+'" rel="uitip noopener" data-default-tooltip="true" title="'+ e_html($req.details.request_associations.request_caused_by_change.change.title)+'" href="/ui/changes?entity_id='+$req.details.request_associations.request_caused_by_change.change.id+'&mode=detail" target="_blank"> &#35;'+$req.details.request_associations.request_caused_by_change.change.id+titleStr+' </a>';  //No I18N
          }
          html +='</label>';      //No I18N
        }
      break;
    case 'associate_project': //NO I18N
        if(permissions.project && permissions.project.get) {
          if(!show_rpanel){
            clsName = "mt10 disp-b nobold text-color6"; //NO I18N
            titleStr = ' &nbsp'+encodeHTMLAttribute($req.details.request_associations.project_request_association.project.title);  //NO I18N
          }
          html += '<label class="control-label disp-ib pt0"><span data-i18n-key="sdp.change.associatedproject">'+translate("sdp.change.associatedproject")+'</span><a id="asso-project-id" class="'+clsName+'" rel="uitip noopener noreferrer" mode_ellipsis="true" data-default-tooltip="true" title="'+encodeHTMLAttribute($req.details.request_associations.project_request_association.project.title )+'" href="/ProjectAction.do?submitaction=ViewProject&projectid='+$req.details.request_associations.project_request_association.project.id+'" target="_blank"> &#35;'+ $req.details.request_associations.project_request_association.project.id + titleStr +' </a></label>'; //No I18N
        } else {
          html += '<label class="control-label disp-ib pt0" data-i18n-key="sdp.requests.projectdialog.associateproject">'+getMessageForKey("sdp.requests.projectdialog.associateproject")+'</label>'; //NO I18N
        }
      break;
    case 'associate_purchase_request':  //NO I18N
      if($req.details.request_metrics.purchase_request_count != '0') {
          html +='<label class="control-label pt0">'+getMessageForKey("sdp.purchase.requests")+'<a id="asso-pr-count" class="ml5" href="/">('+$req.details.request_metrics.purchase_request_count+')</a> </label>';  //No I18N
      }else {
          html +='<label class="control-label pt0">'+getMessageForKey("sdp.purchase.request.associate")+'</label>'; //NO I18N
      }
      break;
    case 'associate_purchase_order': //NO I18N
        if($req.details.request_metrics.purchase_order_count != '0') {
          html +='<label class="control-label pt0">'+getMessageForKey("request.purchase.orders")+'<a id="asso-po-count" class="ml5" href="/">('+$req.details.request_metrics.purchase_order_count+')</a></label>';  //No I18N
      } else {
        html +='<label class="control-label pt0">'+getMessageForKey("sdp.workorder.wotopo.popup.associatepo")+'</label>'; //NO I18N
      }
      break;
    case 'tasks': //NO I18N
        html = getMessageForKey("sdp.admin.task.title");  //No I18N
      break;
    case 'checklists': //NO I18N
        html = getMessageForKey("rightpanel.checklists");  //No I18N
      break;
    case 'attachments': //NO I18N
        html = getMessageForKey("sdp.common.attachments");  //No I18N
      break;
    case 'share': //NO I18N
        html = getMessageForKey("sdp.request.share"); //No I18N
      break;
    case 'account':   // written for MSP/SCP // NO I18N
      if(window.isMSPOrSCP) {
        html = getMessageForKey("sdp.admin.leftpanel.users.customer");   //No I18N
      }
      break;
    case 'comment': //NO I18N
        if(request_info.closure_info.requester_ack_resolution){
          html = getMessageForKey("sdp.request.close.accepted");  //No I18N
        }else{
          html = getMessageForKey("sdp.request.close.notaccepted"); //No I18N
        }
      break;
    default :
      html = $req.rpanel.fieldsObj[key].TITLE;
      break;
  }
  return html;
});

/* set right panel value */
Handlebars.registerHelper("setRightPanelValue",function(key,associate_change_header){ //NO I18N
      var html = "";  //No I18N
      var permissions = $req.details.operational_data.links;
      var nonce = Handlebars.helpers.getNonce();
      var editableFieldsArray = ['status','priority',"category","subcategory","item"]; //NO I18N
      if(permissions && permissions.assign && permissions.assign.put) {
        editableFieldsArray.push('technician');
        editableFieldsArray.push('group');
        if(!isSCP) {
        editableFieldsArray.push('site');
      }
      }

      var request_info = $req.details.request_info;
      var spotEditClass = "spot-static"; //NO I18N
      var label_cont = '';    //No I18N
      var type = '';  //No I18N
      var display = '';   //No I18N
      var reminderClass = "timer-ola-gray"; //No I18N
      var toolTipContent= translate('ola.duetime');
      var isTechnicianModify = permissions.edit && permissions.edit.put ? true : false;
      if(sdp_user.USERTYPE === 'Requester' || !isTechnicianModify || editableFieldsArray.indexOf(key) === -1 || request_info.is_trashed || window.print_mode || (key === 'priority' && $req.details.self_service_portal_settings.priority_matrix_techoverride === false)) {
        spotEditClass = ""; //No I18N
      }
      if($req.rpanel.fieldsObj[key] !== undefined){
          display = $req.rpanel.fieldsObj[key].DISPLAYVALUE;
          type = $req.rpanel.fieldsObj[key].TYPE;
          label_cont = '<p class="form-control-static '+spotEditClass+' colon">'+ e_html(display) +'</p>';  //No I18N

          if(request_info.ola_due_by_time){
              if(request_info.ola_due_by_time.display_value && key=="group"){
                if(request_info.is_current_ola_violated){
                  reminderClass="timer-ola-red"; //No I18N
                  toolTipContent=translate('ola.duetime.violated');
                }
              label_cont +='<div id="ola_due_timer" class="font-small cur-def" rel="uitip" title="' +toolTipContent+'"><span class="rspr '+reminderClass+' icon-sm"></span> ' +getMessageForKey('request.due.on')+' '+request_info.ola_due_by_time.display_value+' </div>';
              }
          }
      }

      switch(key){
        case 'assets': //NO I18N
            var uemIntegratedProduct = getUEMProdName(true, false).uem_integ_prod;
            var obj = $req.details.asset_info ? $req.details.asset_info : $req.details.request_info.assets;
            var tools = $req.details.toolsAllowed;
            html += '<div id="assets-right-panel" class="form-group row">'; //No I18N
            for(var i=0,ilen=obj.length;i<ilen;i++){
                if(i<3) {
                  html += '<div class="form-control-static">';  //No I18N
                } else {
                  html += '<div class="form-control-static more-asset disp-h">';  //No I18N
                }
                if(sdp_user.USERTYPE !== "Requester" && sdp_user.ROLES.indexOf("ViewInventoryWS") > -1) {
                  /** Asset icon with the link */
                  if(obj[i].resource_id) {
                    html += '<button type="button"  name="rp_asset_info" data-asset_id ='+obj[i].resource_id+' class="btn btn-xs btn-link pos-rel mt2" rel="uitip" title="'+getMessageForKey('sdp.inventory.breadcrumb.viewAssets')+'"><span class="cspr monitor icon-xs"></span></button>'; //No I18N
                  } else {
                    html += '<span class="btn btn-xs btn-link pos-rel top-2 cur-def"><span class="cspr monitor icon-xs"></span></span>'; //No I18N
                  }

                  /** Asset's name */
                  html += '<span class="ml10">'+e_html(obj[i].name)+'</span>';  //No I18N

                  /** Remote options for the respective asset */
                  if(obj[i].rdsOptions && obj[i].rdsOptions.length > 0) {
                    html += '<div class="btn-group bs-noconflict"><button type="button" name="asset_rds" class="btn btn-xs btn-link sdmenu-toggle" data-switch="sdmenu" title="'+getMessageForKey('request.asset.view.remotedesktop')+'"><span class="cspr remote-control icon-sm"></span></button><ul class="sdmenu-dd assetlinkdropdown p5" aria-labelledby="asset-remote-options"><li class="w-200px">'+getMessageForKey('sdp.helpdesk.common.remote.options')+'</li><li class="divider"></li>'; //No I18N
            for(var j=0; j<obj[i].rdsOptions.length; j++) {
                  if(obj[i].rdsOptions[j].name === "Password Manager Pro" || obj[i].rdsOptions[j].name === "PAM360") {
                    var title = (obj[i].rdsOptions[j].name === "PAM360") ? translate("pam.asset.remote", [translate('pam360.title')]) :  translate("pam.asset.remote", [translate('pmp.title')]);
                    /** TODO ::: Multiple sub dropdowns UI is getting broken in right panel */
                    html += '<li class="sdmenu bs-noconflict fw"><a href="/" name= "asset_pmp" class="pmp-rdp-list" title="' + title + '" nonce='+nonce+' data-event="mouseover" data-handler="showPmpRdpOptions(\''+e_html(obj[i].name)+'\', this, \''+obj[i].rdsOptions[j].name+'\');" data-switch="sdmenu">'+title+'<span class="caret fr top10 pos-rel"></span></a></li>';
                  } else if(obj[i].rdsOptions[j].name === "UEM Product"){
                        /** Remote Control DesktopCentral option for the Asset **/
                        html += '<li><a rel="noopener noreferrer" href="/" nonce='+nonce+' data-event="click" data-handler="NewWindow(\'DCServerSettings.do?operation=AssetAction&dcaction=remotecontrol&wsName='+encodeURIComponent(obj[i].name)+'&requestId='+Number(request_info.id)+'\',\'Remote_Control\',\'1100\',\'650\',\'no\',\'center\')" >'+e_html(getMessageForKey(obj[i].rdsOptions[j].dispName))+'</a></li>'; //No I18N
                  }else {
                        html += '<li><a href="'+obj[i].rdsOptions[j].url+'" '; //No I18N
                        if(obj[i].rdsOptions[j].target === "_blank") {
                            html += 'target="_blank"';  //No I18N
                        }
                        html += '>'+e_html(getMessageForKey(obj[i].rdsOptions[j].dispName))+'</a></li>';  //No I18N
                  }
            }
            html += '</ul></div>';  //No I18N
           }
        } else {
          html += '<span class="cspr monitor icon-xs"></span>'; //No I18N
          html += '<span class="ml10">'+e_html(obj[i].name)+'</span>';  //No I18N
        }
        if(obj[i].dcTools) {
            html += '<div id="loadingdivid" align="left" class="hide" style=" position: absolute; z-index: 300; left: 130px; top: 150px; border: 1px solid black; background-color: #ffffff"><img src="/images/processing.gif" align="absmiddle"> &nbsp;<span id="centerstatusmsg">'+getMessageForKey('sdp.admin.dcconfig.loading')+'</span></div>';//NO I18N
            html +='<div class="btn-group bs-noconflict mr10 mb4"><button type="button" name ="asset_dc_opts" class="btn btn-xs bs-noconflict btn-link sdmenu-toggle" data-switch="sdmenu" title="'+ getMessageForKey("sdp.admin.dcconfig.PowerOptionTitle",[encodeHTMLAttribute(uemIntegratedProduct)]) +'" rel="uitip"><img src="/images/tools.png" height="15px" width="17px"></button><a href="/" id="toolsactions" class="hide"></a>'; //No I18N
            html +='<ul class="sdmenu-dd assetlinkdropdown" >';
            html +='<li class="sdmenu bs-noconflict fw"><a href="/" name="asset_bs_dropdown"  class= "pl20" data-switch="sdmenu">'+getMessageForKey("sdp.admin.dcconfig.PowerOption") +'<span class="caret fr pos-rel mt5"></a>'; //NO I18N
                html +='<ul class="sdmenu-dd sdmenu-dd2 sdmenu-submenu fw bs-noconflict m0 p0" style="border: none; box-shadow: none;">'; //NO I18N
                var arrOfActions = tools.powerOptions;
                for (var k = 0; k < arrOfActions.length; k++) {
                    html +='<li><a href="/" class="bullet-arrow pl30" nonce='+nonce+' data-event= "click" data-handler="initiateDCToolsAction(\''+ e_attr(arrOfActions[k]) +'\',\'DCServerSettings.do?operation=AssetAction&dcaction='+encodeURIComponent(arrOfActions[k])+'&wsName='+encodeURIComponent(obj[i].name)+ '\', \'' + getMessageForKey("sdp.admin.dcconfig."+encodeURIComponent(arrOfActions[k])+".title") +'\');">' +getMessageForKey("sdp.admin.dcconfig."+e_html(arrOfActions[k]))+ '</a></li>'; //No I18N
                 }
             html += "</ul></li>";
             if(tools.showChatSysManager){
              html +='<li ><a href="/"  name="asset_dc_chat" data-asset_name="'+encodeURIComponent(obj[i].name)+'" class= "pl20">' + getMessageForKey("sdp.admin.dcconfig.Chat") +'</a></li>'; //No I18N
              html +='<li ><a href="/" name="asset_dc_sys" data-asset_name="'+e_attr(obj[i].name)+'" class= "pl20" >' +getMessageForKey("sdp.admin.dcconfig.sysmanager") + '</a></li></ul></div>'; //No I18N
            }}
        if(ilen > 3) {
            if(i == 2) {
                  html += '<a id="asset-show-more" href="/" class="fr pr20 pt2 text-link text-lowercase">'+ (ilen-i-1) +' '+ getMessageForKey('sdp.common.more')+'</a>';  //No I18N
            }
            if(i == ilen-1) {
                  html += '<a id="asset-hide-more" href="/" class="fr hide pr20 pt2 text-link text-lowercase">'+ getMessageForKey('sdp.common.show') +' ' + getMessageForKey('sdp.common.less')+'</a>';  //No I18N
            }
        }
        html += '</div>'; //No I18N
        }
        html += '</div>'; //No I18N
        break;
        case 'space': //NO I18N
            var obj = $req.details.request_info.space;
            html += '<div id="space-field-right-panel" class="form-group row">'; //No I18N
            for(var i=0,ilen=obj.length;i<ilen;i++){
				if(i<3) {
					html += '<div class="form-control-static">';  //No I18N
				} else {
					html += '<div class="form-control-static more-space disp-h">';  //No I18N
				}
				html += '<span class="ml10">'+e_html(obj[i].name)+'</span>';  //No I18N
				if(ilen > 3) {
					if(i == 2) {
						html += '<a id="space-show-more" href="/" class="fr pr20 pt2 text-link text-lowercase">'+ (ilen-i-1) +' '+ getMessageForKey('sdp.common.more')+'</a>';  //No I18N
					}
					if(i == ilen-1) {
						html += '<a id="space-hide-more" href="/" class="fr hide pr20 pt2 text-link text-lowercase">'+ getMessageForKey('sdp.common.show') +' ' + getMessageForKey('sdp.common.less')+'</a>';  //No I18N
					}
				}
				html += '</div>'; //No I18N
			}
			html += '</div>'; //No I18N
        break;	
		case 'configuration_items': //NO I18N
            var obj = $req.details.request_info.configuration_items;
            html += '<div id="configuration_items-field-right-panel" class="form-group row">'; //No I18N
            for(var i=0,ilen=obj.length;i<ilen;i++){
				if(i<3) {
					html += '<div class="form-control-static">';  //No I18N
				} else {
					html += '<div class="form-control-static more-configuration_items disp-h">';  //No I18N
				}
				if(sdp_user.USERTYPE !== "Requester" && sdp_user.ROLES.indexOf("ViewCI") > -1) {
				  if(obj[i].id) {
                    html += '<button type="button" name="rp_ci_info" data-ci-id='+obj[i].id+' class="btn btn-xs btn-link pos-rel mt2" rel="uitip" title="'+getMessageForKey('ae.cmdb.relationshipmap.actions.viewCIdetails')+'"><span class="cspr monitor icon-xs"></span></button>'; //No I18N
                  } else {
                    html += '<span class="btn btn-xs btn-link pos-rel top-2 cur-def"><span class="cspr monitor icon-xs"></span></span>'; //No I18N
                  }
				  html += '<span class="ml10">'+e_html(obj[i].name)+'</span>';  //No I18N
				}
				else{
					html += '<span class="cspr monitor icon-xs"></span>'; //No I18N
					html += '<span class="ml10">'+e_html(obj[i].name)+'</span>';  //No I18N
				}
				if(ilen > 3) {
					if(i == 2) {
						html += '<a id="configuration_items-show-more" href="/" class="fr pr20 pt2 text-lowercase">'+ (ilen-i-1) +' '+ getMessageForKey('sdp.common.more')+'</a>';  //No I18N
					}
					if(i == ilen-1) {
						html += '<a id="configuration_items-hide-more" href="/" class="fr hide pr20 pt2 text-lowercase">'+ getMessageForKey('sdp.common.show') +' ' + getMessageForKey('sdp.common.less')+'</a>';  //No I18N
					}
				}
				html += '</div>'; //No I18N
			}
			html += '</div>'; //No I18N
        break;
        case 'share': //NO I18N
            html='<div class="form-control-static colon"><div class="btn-group bs-noconflict">';  //No I18N
            if($req.details.request_info.is_shared){
            html +='<div class="cur-ptr" data-cs-field="share_request" ><span class="cspr share2 icon-sm opac7"></span><span class="ml5">'+getMessageForKey("common.viewdetails")+'</span></div></div></div>'; //No I18N
            }else{
                html +='<a href="/" class="btn text-color4 p0" data-cs-field="share_request" title="'+getMessageForKey('sdp.request.noshare.info')+'"><span class="common-sprite icon-xs common-add-icon4 mr5"></span><span data-i18n-key="sdp.request.share.title">'+getMessageForKey("sdp.request.share.title")+'</span></a></div></div>'; //No I18N
            }
          break;
        case 'tasks': //NO I18N
            var task_total_count = $req.details.request_metrics.task_total_count;
            var task_completed_count = $req.details.request_metrics.task_completed_count;
            html='<div class="form-control-static colon"><div class="btn-group btn-capsule" title="'+getMessageForKey('sdp.common.total')+':'+task_total_count+'&#10;'+getMessageForKey("sdp.admin.statusDef.complete")+':'+task_completed_count+'"><a class="btn btn-xs btn-default" name="task_count" href="/" >'+task_total_count+'</a> <a class="btn btn-xs btn-default btn-tick"  name="task_count" href="/"  >'+task_completed_count+'<span class="cspr tick-green icon-xs vmiddle top0 ml5"></span></a></div></div>'; //No I18N
            break;
        case 'checklists': //NO I18N
            var checklists_total_count = $req.details.request_metrics.checklists_total_count;
            var checklists_completed_count = $req.details.request_metrics.checklists_completed_count;
            html='<div class="form-control-static colon"><div class="btn-group btn-capsule" title="'+getMessageForKey('sdp.common.total')+':'+checklists_total_count+'&#10;'+getMessageForKey("sdp.admin.statusDef.complete")+':'+checklists_completed_count+'"><a class="btn btn-xs btn-default" name="checkList_count" href="/">'+checklists_total_count+'</a> <a class="btn btn-xs btn-default btn-tick"  name="checkList_count" href="/" >'+checklists_completed_count+'<span class="cspr tick-green icon-xs vmiddle top0 ml5"></span></a></div></div>'; //No I18N
            break;
        case 'attachments': //NO I18N
        var liHtml = '';
      var attachment = $req.details.request_info.attachments;
      for(var i=0,ilen=attachment.length;i<ilen;i++){
        var obj = attachment[i];
        liHtml+='<button type="button" data-href="'+obj.content_url+'" data-index="'+i+'" data-attach-size="'+obj.size.display_value+'">'+e_html(obj.name)+'</button>'; //No I18N
       }
       html +='<div class="form-control-static colon" > <div class="btn-group bs-noconflict"><a role="button" href="/" data-target-id="#attachmentDropdownTarget" id="attachmentDropdown" custom-class="attachPopup"><span aria-hidden="true" class="cspr paperclip icon-sm opac5 ptr-ev-none"></span>&nbsp;('+$req.details.request_info.attachments.length+')&nbsp;<span class="caret ptr-ev-none"></span></a></div></div><div id="attachmentDropdownTarget" class="hidden">'+liHtml+'</div> '; //No I18N
     break;
        case 'linked_requests': //NO I18N
            break;
        case 'linked_to_request': //NO I18N
          if(permissions.link_to_requests && permissions.link_to_requests['delete'] && $req.details.request_info.linked_to_request) {
            html += '<div class="form-control-static disp-ib p0"> <a id="rp-unlink-btn" class="text-primary" href="/" >'+getMessageForKey("common.unlink")+'</a></div>'; //No I18N
          }
          break;
        case 'associate_problem': //NO I18N
            var ternalVal = -1;
            if(request_info.category && request_info.category.id){
                ternalVal = request_info.category.id;
            }
            if(permissions.problem && permissions.problem['delete']) {
              html += '<div class="form-control-static disp-ib p0"> <a id="det-problem"  class="text-primary" href="/">'+getMessageForKey("sdp.inventory.addAssetsToWS.deassign.attachedAssets")+'</a></div>'; //No I18N
            } else {
              html += '<div class="form-control-static disp-ib p0">';  //No I18N
              if(permissions.request_problem_new) {
                html += '<a id="asso-problem-new" class="text-primary" href="/">'+getMessageForKey("common.new")+'</a>'; //No I18N
              }
              if(permissions.request_problem_new && permissions.search_problem) {
                html += '<span class="pl10 pr10">|</span>'; //No I18N
              }
              if(permissions.search_problem) {
          html += '<a id="asso-problem-search" class="text-primary" href="/">'+getMessageForKey("common.search.title")+'</a>'; //No I18N
              }
              html += '</div>'; //No I18N
          }
            break;
        case 'associate_change': //NO I18N
            if(associate_change_header === 'causesheader') {
                if (permissions.request_initiated_change && permissions.request_initiated_change['delete']) {
                  html +='<div class="form-control-static"> <a id="det-init-change" class="text-primary" href="/">'+getMessageForKey("sdp.inventory.addAssetsToWS.deassign.attachedAssets")+'</a></div>';  //No I18N
                } else if(permissions.request_initiated_change_new || permissions.search_request_initiated_change) {
                  html += '<div class="form-control-static">';  //No I18N
                  if(permissions.request_initiated_change_new) {
                    html += '<a id="change-init-new" class="text-primary" href="/">'+getMessageForKey("common.new")+'</a>'; //No I18N
                  }
                  if(permissions.request_initiated_change_new && permissions.search_request_initiated_change) {
                    html += '<span class="pl10 pr10">|</span>'; //No I18N
                  }
                  if(permissions.search_request_initiated_change) {
                    html += '<a id="change-init-search" class="text-primary" href="/">'+getMessageForKey("common.search.title")+'</a>';  //No I18N
                  }
                  html += '</div>'; //No I18N
                }
            } else if(associate_change_header === 'causedbyheader') { //NO I18N
                if(permissions.request_caused_by_change && permissions.request_caused_by_change['delete']) {
                  html +='<div class="form-control-static"> <a id="det-caused-change" class="text-primary" href="/">'+getMessageForKey("sdp.inventory.addAssetsToWS.deassign.attachedAssets")+'</a></div>';  //No I18N
                } else if(permissions.search_request_caused_by_change) {
                  html +='<div class="form-control-static"> <a id="change-caused-search" class="text-primary" href="/">'+getMessageForKey("common.search.title")+'</a></div>'; //No I18N
                }
            }
            break;
        case 'associate_project': //NO I18N
            if (permissions.project && permissions.project['delete']) {
              html +='<div class="form-control-static disp-ib p0"><a id="det-project"  class="text-primary" href="/">'+getMessageForKey("sdp.inventory.addAssetsToWS.deassign.attachedAssets")+'</a></div>'; //No I18N
            } else {
              html += '<div class="form-control-static disp-ib p0">';  //No I18N
        if(permissions.project_new) {
          html +='<a id="asso-project-new"  class="text-primary" href="/">'+getMessageForKey("common.new")+'</a>'; //No I18N
        }
        if(permissions.project_new && permissions.search_project) {
          html += '<span class="pl10 pr10">|</span>'; //No I18N
        }
        if(permissions.search_project) {
                  html +='<a id="asso-project-search"  class="text-primary" href="/" >'+getMessageForKey("common.search.title")+'</a>';  //No I18N
              }
              html += '</div>'; //No I18N
          }
            break;
        case 'associate_purchase_request':  //NO I18N
            if (permissions.purchase_request_new || permissions.purchase_request_search) {
                html +='<div class="form-control-static p0">'; //No I18N
                if(permissions.purchase_request_new) {
                    html +='<a id="asso-pr-new" href="/"  class="text-primary">'+getMessageForKey("common.new")+'</a>';  //No I18N
                }
                if(permissions.purchase_request_new && permissions.purchase_request_search) {
                  html += '<span class="pl10 pr10">|</span>'; //No I18N
                }
                if(permissions.purchase_request_search) {
                    html +='<a id="asso-pr-search"  class="text-primary" href="/">'+getMessageForKey("common.search.title")+'</a>'; //No I18N
                }
                html +='</div>';  //No I18N
            }
            break;
        case 'associate_purchase_order': //NO I18N
            if(permissions.purchase_order_search && permissions.purchase_order_search.get) {
                html +='<div class="form-control-static"> <a id="asso-po-search"  class="text-primary" href="/">'+getMessageForKey("common.search.title")+'</a></div>'; //No I18N
            }
          break;
        case 'status': //NO I18N
            var em_content = '<em class="priority-badge mr5" style="background-color:'+e_attr(request_info.status.color)+'">&nbsp;</em>'+e_html(request_info.status.name);  //No I18N
            if(sdp_user.USERTYPE == 'Technician'){
                try {
                  var statusVal = Handlebars.helpers.getStatusValue();
                  if(statusVal === 'Onhold'){
                    var schedule = $req.details.request_info.onhold_scheduler;
                    if(schedule !== undefined && schedule !== null && schedule.scheduled_time && Object.keys(schedule.scheduled_time).length){
                         em_content += '<span id="rp_onHoldIcon" class="cspr onhold ml5 vmiddle" title="'+getMessageForKey("sdp.requests.viewrequest.scheduleonhold")+'"></span>';
                     }else{
                       em_content += '<span id="rp_onHoldIcon" class="cspr icon-sm ml5 vsub reschedule"  title="'+getMessageForKey("sdp.requests.viewrequest.scheduleonhold")+'"></span>'; //No I18N
                     }
                  }
                } catch(ex) {
                  console.error(ex);
                }
            }
            if($req.details.request_info.is_editing_completed === false) {
              em_content += "<span class='editor-update-alert mandatory pl10'>*</span>";  //No I18N
            }

            var jQ_label = jQuery(label_cont);
            jQ_label.html(em_content);
            html = jQ_label[0].outerHTML;
            break;
        case 'priority': //NO I18N
            if(request_info.priority && Object.keys(request_info.priority).length){
              var em_content = '<em class="minw-0px '+(request_info.priority.color?"priority-badge":"disp-ib vmiddle boxszbb bgtransp block-bordered icon-xs top-1")+' mr5" style="background:' + e_attr(request_info.priority.color) + ';">&nbsp;</em>'+e_html(request_info.priority.name);  //No I18N
              var jQ_label = jQuery(label_cont);
              jQ_label.html(em_content);
              html = jQ_label[0].outerHTML;
            }else{
              html = label_cont;
            }
            break;
        case 'first_response_due_by_time':  //No I18N
          html += '<div class="form-control-static colon">'+e_html(display);
          if(request_info.is_first_response_overdue) {
            /** SD-86962 - Issue in displaying responsedue by time delay time in right panel when responded time is not set */
            var end_time = $req.details.getRespondedTime();
            if(!end_time) {
              var currStatus = $req.prop.getCurrentStatus();
              if(currStatus === 'Closed' || currStatus === 'Resolved') {
                end_time = $req.details.getResolvedTime();
              }
            }
            if(end_time) {
              html += '<div class="pos-rel"><span class="text-muted">'+getMessageForKey("sdp.requests.view.delayedby") + ' ' + getTimeDiff(request_info.first_response_due_by_time.value, end_time)+'</span><span aria-hidden="true" class="cspr triangle-red icon-sm pos-rel ml5 top2"><span class="path1"></span><span class="path2"></span></span></div>';
            } else {
              html += '<div class="pos-rel"><span class="text-muted">'+getMessageForKey("common.time.ago", [getTimeDiff(request_info.first_response_due_by_time.value, $req.details.server_time)])+'</span><span aria-hidden="true" class="cspr triangle-red icon-sm pos-rel ml5 top2"><span class="path1"></span><span class="path2"></span></span></div>';
            }
          }
          html += '</div>';
          break;
        case 'account':   // written for MSP/SCP //No I18N
            if(isMSPOrSCP) {
              if(!jQuery.isEmptyObject($req.details.request_info.account)) {
                var em_content = e_html(request_info.account.name);
                if($req.details.request_info.account.inactive) {
                  em_content = '<span id="inactive-account-icon" class="mspspr icon-sm top3 mr2 acc-inactive" rel="uitip" title="'+getMessageForKey("account.status.inactive")+'"></span>' + em_content;  //No I18N
                }
                if(sdp_app.IS_ACC_INFO_ICON_ENABLED) {
                  em_content = em_content+ '<span id="accountIcon" role="img" title="'+getMessageForKey("sdp.msp.admin.organization.header")+'" class="common-sprite icon-sm ml10 vsub acinfoicn"></span>';  //No I18N
                }
                var jQ_label = jQuery(label_cont);
                jQ_label.html(em_content);
                html = jQ_label[0].outerHTML;
              } else {
                html='<div class="form-control-static colon"><span>' + getMessageForKey("sdp.common.notassigned") + '</span></div>';  //No I18N
              }
            }
            break;
        case 'subaccount':  // written for SCP //No I18N
            if(isSCP) {
              if(!jQuery.isEmptyObject($req.details.request_info.subaccount)) {
                var em_content = e_html(request_info.subaccount.name);
                if($req.details.request_info.subaccount.inactive) {
                  em_content = '<span id="inactive-subaccount-icon" class="mspspr icon-sm top3 mr2 acc-inactive" rel="uitip" title="'+getMessageForKey("account.status.inactive")+'"></span>' + em_content; //No I18N
                }
                var jQ_label = jQuery(label_cont);
                jQ_label.html(em_content);
                html = jQ_label[0].outerHTML;
              } else {
                html='<div class="form-control-static colon"><span>' + getMessageForKey("sdp.common.notassigned") + '</span></div>';  //No I18N
              }
            }
            break;
        default:
          if(type === 'multi_line' || type === 'multi_select'){
            html = Handlebars.helpers.setFieldText(display,key,'multi_line'); //NO I18N
            var jQ_label = jQuery(label_cont);
            jQ_label.html('<span class="disp-ib vtop w-90per">'+html+'<span>'); //No I18N
            html = jQ_label[0].outerHTML;
          }else{
            html +=label_cont;
          }
          break; 
      }
      return html;
});


// helper for assgning link to every linked request
Handlebars.registerHelper('Separate_Request',function(req){ //No I18N
  var req_list = "";
  if(req.split(",").length>1){
    var requests = req.split(",");
    for(var i=0;i<requests.length;i++){
      if(i>0){
        req_list += ", ";
      }
      req_list += "<a target='_blank' href='/WorkOrder.do?woMode=viewWO&woID="+requests[i].trim()+"' title='"+translate('common.requestdetailstooltip')+"'>#"+requests[i].trim()+"</a>"
    } 
  }
  else{
    req_list += "<a target='_blank' href='/WorkOrder.do?woMode=viewWO&woID="+req+"' title='"+translate('common.requestdetailstooltip')+"'>#"+req+"</a>"   
  }
  return req_list;
});


Handlebars.registerHelper("isFCR",function(){ //NO I18N
  if(sdp_user.USERTYPE === 'Technician' && ((sdp_user.ROLES.indexOf('ClosingRequest')  !== -1) || (sdp_user.ROLES.indexOf('EditClosedRequest') !== -1) || (sdp_user.ROLES.indexOf('ResolvingRequest') !== -1))){
      return true;
  }
  return false;
  //return $req.details.request_info.is_fcr;
});

Handlebars.registerHelper("isFCR_Marked",function(){ //NO I18N
  return $req.details.request_info.is_fcr;
});

Handlebars.registerHelper("getStatusValue",function(){return $req.prop.getCurrentStatus()});//No i18n

/** returns the responded time if the any response is provided already, else returns null */
Handlebars.registerHelper("respondedTime", function(request) {  //No I18N
  /** SD-86962 - Issue in displaying responsedue by time delay time in right panel when responded time is not set */
  var respondedTime = $req.details.getRespondedTime(request);
  if(!respondedTime) {
    var currStatus = $req.prop.getCurrentStatus();
    if(currStatus === 'Closed' || currStatus === 'Resolved') {
      respondedTime = $req.details.getResolvedTime(request);
    }
  }
  return respondedTime;
});

/** returns the responded time if ticket is resolved or completed already, else returns null */
Handlebars.registerHelper("resolvedTime", function(request) { //No I18N
  return $req.details.getResolvedTime(request);
});
/**
 *  A handlebar helper is used to get the account field values from the request info
 * And it is used in the SCP build's right panel account section
*/
Handlebars.registerHelper("getAccountFieldValue", function(fieldName){ // No I18N
  var accountFieldValues = $req.details.account_info;
  var value = "-";
  if(!fieldName){
    return value;
  }
  if(fieldName.includes("udf_")){
    value = accountFieldValues.accountudf_fields[fieldName] || "-";
  }else{
    value = accountFieldValues[fieldName] || "-";
  }
  return typeof value === 'object' ? value.name : value; //No I18N
})

