  /* $Id$ */
  var $announcements={
  fromViewAnn:false,
  title:"null",//NO I18N
  priority:"null",//NO I18N
  module:'',
  curIndex:0,
  curAnnObj:null,
  mail_configured:false,
  isAPIValid:null,
  meta_information:null,
  checkMailConfigured:function(){
    if(!$announcements.mail_configured){
        sdpAjax({
          async:false,
          url:'/servlet/HdClientUtilServlet?command=isOutgoingMailConfigured',//NO I18N
          success:function(resp){
            $announcements.mail_configured=resp;
          }
        });
    }
    return $announcements.mail_configured;
  },

  cancelAction:function(){
     if(!this.fromViewAnn){
      jQuery('#announceDialogDiv').dialog('close');//NO I18N
     }
     else{
         $announcements.checkForPrevAnn();
     }
  },

      //check if announcement has a previous announcement
  checkForPrevAnn:function(){
     var annI18nKey=getMessageForKey('sdp.home.announcement.addnew.headTitle');
     jQuery('#announceDialogDiv').dialog('option','title',annI18nKey);//NO I18N
     jQuery("#viewAnn").show().removeClass('pos-rel');
     jQuery("#annForm").hide();
     $announcements.fromViewAnn=true;

     if($announcements.curIndex==1){
          jQuery("#prevbtn").addClass('disabled');
     }
     else
     {
         jQuery("#prevbtn").removeClass('disabled');
     }
     initTooltip("#viewAnn");//NO I18N
  },

  hideMsg:function(){
      jQuery(".form-wrapper").css("padding-top","10px");//NO I18N
    jQuery("#errorMsg").hide();
  },

  saveOrUpdateAnn:function(opName,annId,table_comp){
    if(jQuery('#announcement_sec').valid()){
        var annDiv=jQuery('#announceDialogDiv');
        var title=annDiv.find('#ann_title').val();
        var priority=annDiv.find("#priority").select2('data');//NO I18N
        var services=annDiv.find("#service_category").select2('data');//NO I18N
        var displayToDC=annDiv.find('#displayToDC').is(':checked');//NO I18N
        var fromDate=annDiv.find("#ann_fromDate").val();
        var toDate=annDiv.find("#ann_toDate").val();
        var modeType=jQuery("[name='accessibility']:checked").val();
        var is_public=!(modeType=='private');//NO I18N
        var usermailIds=annDiv.find("#addEmailUser").select2('data');//NO I18N
        var annType=annDiv.find("#announcement_type").select2('data');//NO I18N
        var content=editor.getHTML();
        var method=(opName=='add')?'POST':'PUT';//NO I18N
        var usrgroups,inputdata,annObj;
        var saveTxt=(opName=='add')?getMessageForKey('sdp.admin.common.saving'):getMessageForKey("sdp.admin.common.updating");

        toDate=(toDate=='')?0:toDate;
        annObj={"title":title,"is_public":is_public,"from_date":{"value":fromDate},"to_date":{"value":toDate}};//NO I18N

        usrgroups=annDiv.find('#user_groups').select2('data');//NO I18N
        if(!isSCP){
            annObj.user_groups=this.convToS2Json(usrgroups);
    	}

        if(content.trim().length>0){
            annObj.content=content;
        }
        else
        {
            annObj.content = '-';
        }
        if($announcements.mail_configured){
            if(usermailIds.length>0) {
            annObj.email_ids=[];
            }
            var length = usermailIds.length;
            for( var i =0 ;i<length;i++)
            {
                annObj.email_ids.push(usermailIds[i].text);
            }
        }
        if(priority){
          annObj.priority={"id":priority.id,"name":priority.text};//NO I18N
        }
        else if( method=="PUT")
        {
         annObj.priority=null;
        }

        if(services.length>0 || method=="PUT"){
           annObj.service_category=this.convToS2Json(services,'text','name');//NO I18N
        }

        if(annType){
            annObj.announcement_type={"id":annType.id,"name":annType.text};//NO I18N
        }
        else if( method=="PUT")
        {
             annObj.announcement_type=null;
         }

        annObj.display_in_dc=displayToDC;
		if(isMSP){ // MSP changes for Announcement feature
			var sel_accIDs=$acc_multibox.getAccountIDs();
			if(sel_accIDs.length==0) {
				  showalert("failure",getMessageForKey("sdp.msp.reqTemplate.selectAccount.error"),'isAutoHide=false');//NO I18N
				  return;
			}
            if(sel_accIDs.length>0) {
			annObj.associated_accounts=[];
            }
            var length = sel_accIDs.length;
			 for( var i =0 ;i<length;i++)
            {
				var accJson ={"id":sel_accIDs[i]};
                annObj.associated_accounts.push(accJson);
            }
			if(document.getElementById('selectAll').checked){
				annObj.is_global=true;
			}
			else{
				annObj.is_global=false;
			}
				
        }
        jQuery("#savebtn").text(saveTxt);
        inputdata={"announcement":annObj};// No I18N
        jQuery("#savebtn").prop('disabled',true);// No I18N
        this.announcementAPIcall(inputdata,method,annId);
    }
    else if(jQuery("#title_div").find(".alert-danger").css("display")=="block")
    {
        setTimeout(function(){
                           jQuery("#ann_title").focus();
                   },50);
    }


  },

  announcementAPIcall:function(inputData,method,annId){
    var strData = "input_data=" + encodeURIComponent(sdpToJSON(inputData)); //No I18N
    var annKey=getMessageForKey('sdp.home.announcement.addnew.headTitle');
    var msg=(method=='POST')?translate('api.added.success',[annKey]):translate('api.updated.success',[annKey]);// No I18N
    var url='/api/v3/announcements';//NO I18N

    if(annId){
        url+='/'+annId;
    }
    sdpAjax({
        url:url,
        type:method,
        data:strData,
        success: function(resp) {
          $announcements.curAnnObj=resp;
           $announcements.curAnnObj.isTechnician=(sdp_user.USERTYPE=='Technician');//NO I18N
          $announcements.processHtml( $announcements.curAnnObj,'viewAnnouncement','viewAnn');//NO I18N
          jQuery("#ann_content p").html(resp.announcement.content);

          if($announcements.module=='announcementList'){
             WebComponents.getInstance("webc-annlist").refreshTable(); // No I18N
          }
          else if($announcements.module=='home_page'){
             $home_page.processAnnouncements();
          }

          if(method=="POST"||$announcements.fromViewAnn){
            if(method=="POST"){
              $announcements.curIndex=1;
            }
            $announcements.checkForPrevAnn();
            $announcements.checkForNextAnn();
          }
          else{
             jQuery('#announceDialogDiv').dialog('close');//NO I18N
          }
          //118119 -- RTA section Zoho color contrast changes updated
          ThemeCustomizer.zcontrastcolorinit("#ann_content");// NO I18N
          showalert('success',msg,'isAutoHide=true');// No I18N
        },
        error:function(result){
          var errorMsg=result.responseJSON.response_status.messages[0].message;
          var failureKey=(method=='POST')?"api.saved.failure":'api.updated.failure';// No I18N
          var failureMsg=(errorMsg)?errorMsg:translate(failureKey,[annKey]);
          showalert('failure',failureMsg,'isAutoHide=false,delay=5');// No I18N
          jQuery("#savebtn").prop('disabled',false);// No I18N
          jQuery("#savebtn").text(translate('common.save'));
        }
    });
  },

  initFormElements:function(description){
    var annTypeKey=getMessageForKey("sdp.searchitem.select", [getMessageForKey("announcement.type")]);
    var priorityKey=translate('common.priority.placeholder');
    var servicesKey=getMessageForKey("sdp.searchitem.select", [getMessageForKey("common.services")]);
    var usrGrpsKey=getMessageForKey("sdp.searchitem.select", [getMessageForKey("sdp.admin.group.user")]);
    var usrGrpS2,content,_self=this;

    if(description){
      content=description;
    }
    else{
    content=( $announcements.curAnnObj)? $announcements.curAnnObj.announcement.content:'';
    }
    setTimeout(function(){
      _self.initZEditor(content);
      jQuery("#ann_title").focus();
      _self.showMailError();
    },400);

    displayClientTime('ann_fromDate',true);// No I18N
    displayClientTime('ann_toDate');//NO I18N
    this.observeViewChange();
    this.initS2('announcement_type',annTypeKey,'/api/v3/announcements/announcement_type','announcement_type',false);//NO I18N
    this.initS2('priority',priorityKey,'/api/v3/announcements/priority','priority',false);//NO I18N
    this.initS2('service_category',servicesKey,'/api/v3/announcements/service_category','service_category',true);//NO I18N
	if(isMSP){// MSP changes for Announcement feature
		$acc_multibox.refreshUG();
	}
	else{
    usrGrpS2=this.initS2('user_groups',usrGrpsKey,'/api/v3/announcements/user_groups','user_groups',true);//NO I18N
	}
     jQuery("#user_groups").on("select2-open",function(){
                               jQuery("#show_shared").find(".alert-danger").hide();
                              });
     jQuery("#addEmailUser").on("select2-open",function(){
                                    jQuery("#email_div").find(".alert-danger").hide();
                               });

    jQuery(usrGrpS2).on('change',function(){
        jQuery(this).valid();
    })
  },

  showMailError:function(){
    var _self=this;
    var api_url = "/api/v3/users";//NO I18N
	var api_field = "users";//NO I18N
	if(isSCP){
		 api_url = "/api/v3/announcements/user_email";//NO I18N
		 api_field = "user_email";//NO I18N
	}
      jQuery("#addEmailUser").keydown(function(){
          event.preventDefault();
      })
      jQuery("#addEmailUser").focus(function(event){
        if(!_self.checkMailConfigured()){
          jQuery("#errorMsg").css({"position":"absolute","z-index":"99"}).show();//NO I18N
            jQuery(".form-wrapper").css("padding-top","50px"); //NO I18N
          event.preventDefault();
          jQuery("#emailError").text(translate("sdp.admin.importwsdetails.here"));
          if(sdp_user.ROLES.indexOf("SDAdmin")==-1){
             jQuery("#emailError").hide();
          }
          return;
        }else if(!jQuery("#addEmailUser").data('select2')) { //NO I18N
            $announcements.mail_configured=true;
      var input_data={
          formatSearching: window.translate("ae.common.search.text"),
          formatNoMatches: window.translate("ae.common.select2nomatchesfound"),
          formatNoRecordsFound: window.translate("ae.common.select2norecordsfound"),
          tags:true,
          placeholder:getMessageForKey("announcement.select.email"),
          multiple:true,
          url:[{
              url:api_url,//no i18n
              list_info:{sort_field:"email_id","search_criteria": [{"field": "email_id","value":null,"condition": "is not","logical_operator":"and"},{"field": "email_id","value":"","condition": "is not","logical_operator":"and"}]},//NO I18N
			  field:api_field,//no i18n
              cache:[],
              search_field:"email_id",//NO I18N
              processResults:function(cacheData,data,field,i){
                  if((data.email_id && data.email_id.length) || (data.value && data.value.email_id && data.value.email_id.length)){
                      cacheData.push({id:data.text||data.email_id||data.value.email_id,text:data.text||data.email_id||data.value.email_id,value:data});
                  }

              }
          }]
      };
	  if(isMSP){ // MSP changes for Announcement feature
				 var sel_accIDs=$acc_multibox.getAccountIDs();
					var msp_crit = [];
					var msp_crit = {
					field: "account.id", // No I18N
					condition: 'in', // No I18N
					values: sel_accIDs,
					logical_operator: "AND" // No I18N
					};
					input_data.url[0].list_info.search_criteria.push(msp_crit);
				}
      jQuery("#addEmailUser").sdp_select2(input_data);
            jQuery("#addEmailUser").select2('open');//NO I18N
          jQuery("#errorMsg").hide();//NO I18N
            jQuery(".form-wrapper").css("padding-top","10px");  //NO I18N
        }
    });
  },

  validateForm:function(){
    var mailerrorKey=getMessageForKey('sdp.common.email.errmsg');
    var titleErrorKey=getMessageForKey('missing.value.warning',[translate('common.title')]);
    var usrGrpKey=getMessageForKey('common.validation.select',[getMessageForKey('sdp.admin.group.user')]);
    jQuery.validator.addMethod('groupOfEmailIds',function(value,element){//NO I18N
       var mailids = jQuery("#addEmailUser").select2('data')//No I18N
       var result=true;
       for(i=0;i<mailids.length;i++){
            var mail=mailids[i].text;
            var regExp=/^[\w]([\w\-\.\+\'\/]*)@([\w\-\.]*)(\.[a-zA-Z]{2,22}(\.[a-zA-Z]{2}){0,2})$/;
            result=result&&(regExp.test( mail ));
       }
       return this.optional( element ) || result;
    },mailerrorKey);
    jQuery('#announcement_sec').validate({
      rules:{
       "ann_title" :"required",// No I18N
       "ann_mail_ids":{// No I18N
          "groupOfEmailIds":true// No I18N
       }
      },
      messages:{
        "ann_title" :titleErrorKey,// No I18N
        "user_groups":usrGrpKey// No I18N
      },
      ignore:'input[type=hidden]',// No I18N
      errorPlacement: function(error, element) {
          var eleId=$(element).attr('id');
          var top='40px';//NO I18N
          if(eleId=='user_groups'){
            top='75px';// No I18N
          }
          error.insertAfter( element );
          error.addClass( 'alert alert-danger alert-arrow p5' ).css({ 'top':top,'position':'absolute','z-index':'1', 'display':'block', 'white-space':'nowrap'}); //NO I18N

      }
    });
  },

  showAnnounceDialog:function(title,newForm){
     let modal = closeOnEsc = window.isNotificationPanelOpened ? false : true;
     let direction = jQuery("body").css("direction").toLowerCase() == 'rtl' ? { my: "left+50", at: "right", of: jQuery("#Notifications") } : { my: "right-50", at: "left", of: jQuery("#Notifications") }; //NO I18N
     const position = modal ?  { my: "center", at: "center", of: window } : direction; // NO I18N
    jQuery('#announceDialogDiv').dialog({
       'modal':modal,//NO I18N
       'title':title,//NO I18N
       'top':'20',//NO I18N
       'width':'950px',//NO I18N
       'height':jQuery(window).height(), //NO I18N
       'position': position, //NO I18N
       'resizable':false,//NO I18N
       'draggable':true,//NO I18N
       'dialogClass':'announcement-dialog',//NO I18N
        'closeOnEscape': closeOnEsc, //NO I18N
       open:function(event,ui){
         var ele=jQuery(event.target);
         ele.css({'height':'100%'});// No I18N
          var closebutton = jQuery(".announcement-dialog .ui-dialog-titlebar-close")[0];
           jQuery(closebutton).attr("id","close-announcement");
            jQuery(document).find('body').addClass('of-h');

            jQuery('body').find("#close-announcement").on("click", function(e) { //NO I18N
              if(window.isNotificationPanelOpened){
                $notifContainer.find('[data-id=' + activeClassID + ']').removeClass("active"); //NO I18N
                jQuery("#Notifications").find("[data-action='close']").addClass("disp-ib").removeClass("vhide"); //NO I18N
                $bellNotifications.initActiveClass();
              }

            });
       },
       close:function(event,ui){
          $announcements.fromViewAnn=false;
           $announcements.curAnnObj=null;
            jQuery(document).find('body').removeClass('of-h');
            jQuery('#announceDialogDiv').dialog('destroy').remove(); //NO I18N
            }
    });

    $announcements.wrapDescriptionPanel();
  },

  initS2:function(id,placeholder,url,resultKey,isMultiple){
         var sort_field="name"; // No I18N
      var ann_div=jQuery('#announceDialogDiv');
      var sel2=ann_div.find('#'+id).sdp_select2({
        placeholder:placeholder,
        allowClear:true,
        url:[{
          url:url,
          list_info:{sort_field:sort_field},//NO I18N
          field:resultKey//No I18N
        }],
        multiple:isMultiple,
        cacheData:{}
      })
      return sel2;
  },
  showCalendar:function(eleToInit,eleToCompare,condition){
    var eleToCompareDiv,eleToInitDiv;
    var eleToCompareDiv=document.getElementById(eleToCompare);
    var eleToInitDiv=document.getElementById(eleToInit);
    var validateArgs=[eleToInitDiv,eleToCompareDiv,getMessageForKey('sdp.contract.addNew.jsDateDiffErr')];
    if(condition){
        validateArgs.push("less");
    }
    initCalendar(eleToInit, null, null, null, null, checkValidDate, window,validateArgs,null,null,null,null);
  },

  observeViewChange:function(){
    jQuery('[name="accessibility"]').change(function(){
        var val=jQuery('[name="accessibility"]:checked').val();
        jQuery('#mode>div').hide();
        if(val=='private'){
           jQuery('#show_private').show();
           jQuery('#user_groups').rules("remove","required");// No I18N

        }
        else if(val=='public'){
            jQuery('#show_public').show();
            jQuery("#user_groups").select2('data',null);// No I18N
            jQuery('#user_groups').rules("remove","required");// No I18N
        }
        else{
            jQuery('#show_shared').show();
            jQuery('#user_groups').rules("add","required");// No I18N
        }
    });
  },

  loadNewAnnounceForm:function(module,moduleId){
    var usrgrps,json,ann_title='',ann_description='';
    var curDate=new Date().getTime();

    this.loadAnnHtml('add',module,moduleId); //NO I18N
     var title = $announcements.title!="null"?$announcements.title:"";//NO I18N
    json={"announcement":{"content":"","title":title, "is_public":true,"to_date":null,"from_date":{ "value":curDate}},"operation":"add"};//NO I18N
    jQuery("#viewAnn").hide();
  jQuery("#annForm").show();

    annContent=ann_description;
      usrgrps=$announcements.getUsrGroups();
      json.announcement.show_usr_group=(usrgrps.length>0);
      /** Solution given by Asif**/
      json.uem_integrated=false;
      if(typeof uem_integrated !== 'undefined'){
        json.uem_integrated = uem_integrated && uem_product=="Endpoint Central";//NO I18N
      }
      else{
        jQuery.ajax({
          cache: false,
          async: false,
          url: "/servlet/AJaxServlet?action=GetHeaderDetails",//NO I18N
          success: function(data) {
            if(data.desktop_central_menu){
                 json.uem_integrated=data.desktop_central_menu.isintegrated && data.desktop_central_menu.uemproduct=="Endpoint Central";//NO I18N
            }
          }
        });
      }
    this.processHtml(json,'announcementDiv','annForm',function(){//No I18N
      jQuery("#emailError").on('click',(event)=>{($announcements.hideMsg())});
    });
    jQuery("#show_public").show();

    $announcements.showAnnounceDialog(getMessageForKey('sdp.home.announcement.showAll.addNew'),true);//NO I18N

    setTimeout(function(){
        $announcements.initFormElements($announcements.content);
        $announcements.validateForm();
         if($announcements.priority!="null")
         {
            json.announcement.priority=$announcements.priority;
            $announcements.setS2Values(json);
         }
		 
		  if(isMSP){// MSP changes for Announcement feature
			$acc_multibox.populateAccData("Announcement",moduleId);//NO I18N
		  }
    },100);  // No I18N
  },

  initZEditor:function(content){
      if(content=='-') {
          content = "";
      }
    zeditor({
        element:'announcement_content',// No I18N
        edithtml:true,
        content:content,
        buttonsToHide:["image"]
    });
  },

  editAnnouncement:function(annId){
    var info_id="show_",_self=$announcements;//NO I18N
    var mode,annObj,resp;
    var dialogTitle=getMessageForKey('sdp.home.announcement.view.editTitle');

    $announcements.loadAnnHtml('edit'); //NO I18N
    resp=$announcements.getAnnAPI(annId);

    if(resp){
        resp.operation="update";//NO I18N
        /** Solution given by Asif**/
        resp.uem_integrated = false;
        if(typeof uem_integrated !== 'undefined'){
          resp.uem_integrated=uem_integrated && uem_product=="Endpoint Central";//NO I18N
        }
        else{
          jQuery.ajax({
            cache: false,
            async: false,
            url: "/servlet/AJaxServlet?action=GetHeaderDetails",//NO I18N
            success: function(data){
              if(data.desktop_central_menu){
                  resp.uem_integrated=data.desktop_central_menu.isintegrated && data.desktop_central_menu.uemproduct=="Endpoint Central";//NO I18N
              }
            }
          });
        }
        annObj=resp.announcement;
          usrgrps=$announcements.getUsrGroups();
          annObj.show_usr_group=(usrgrps.length>0);
         $announcements.curAnnObj=resp;

        mode=(annObj.has_user_group)?"shared":((annObj.is_public)?"public":"private");//NO I18N
        info_id+=mode;

        $announcements.processHtml(resp,'announcementDiv','annForm',function(){//No I18N
          jQuery("#emailError").on('click',(event)=>{($announcements.hideMsg())});
        });
        if(!$announcements.fromViewAnn){
            jQuery("#viewAnn").hide();
            jQuery("#annForm").show();

            setTimeout(function(){
              $announcements.showAnnounceDialog(dialogTitle,true);
            },10);
        }
        else{
            jQuery('#announceDialogDiv').dialog('option','title',dialogTitle);// No I18N
            jQuery('#viewAnn').addClass('pos-rel').end().removeClass('pos-abs');
        }

        setTimeout(function(){
           _self.initZEditor(resp.announcement.content);
           $announcements.initFormElements();
           $announcements.setS2Values(resp);
           $announcements.validateForm();
           jQuery("#"+info_id).show();
           jQuery("#displayToDC").prop('checked',annObj.display_in_dc);// No I18N

           if($announcements.fromViewAnn){
               jQuery("#viewAnn").hide();
               jQuery("#annForm").show();
           }
		   if(isMSP){// MSP changes for Announcement feature
			$acc_multibox.populateAccData("Announcement",annId);//NO I18N
		  }
         },100);

        setTimeout(function(){
          initTooltip("#annForm");//NO I18N
           jQuery('[name="accessibility"]').trigger("change")
        },1000);
     }
  },

  getAnnAPI:function(annId,data,prevNextOp,helpdeskId){
     var result= $announcements.curAnnObj,url;
     if(result==null||prevNextOp){
        url='/api/v3/announcements';//NO I18N
        if(annId){
            url+="/"+annId;
        }
         if(helpdeskId){
                url+=("?PORTALID="+helpdeskId);// No I18N
          }
         sdpAjax({
            url:url,
            data:data,
            async:false,
            method:'GET',//NO I18N
            success:function(resp){
               if(!prevNextOp){
                   $announcements.curAnnObj=resp;
               }
               result=resp;
            },
            ignorefailuremessage: true,
            error:function(result){
                if(result.status=='404' | result.status==400){
                    var infoMsg=getMessageForKey('sdp.home.announcement.announceViewAction.noDataErr');
                    var titleKey=getMessageForKey('sdp.info');
                    var okKey=getMessageForKey('sdp.common.ok');
                    showconfirm(true,'title='+titleKey+', message='+infoMsg+', cancelbutton='+okKey+', closebutton=yes, closeOnEscKey=yes',showconfirmcommit);// No I18N
                    function showconfirmcommit(s) {
                        $home_page.processAnnouncements();
                    }
                }
            }
        });
    }
    return result;
  },

  getUsrGroups:function(){
      var inputData={"list_info":{"row_count":"10","start_index":1}};// No I18N
      var enInputData=JSON.stringify(inputData);
      var data={"input_data":enInputData};// No I18N
      var result;
      sdpAjax({
            url:'/api/v3/announcements/user_groups',// No I18N
            data:data,
            async:false,
            method:'GET',//NO I18N
            success:function(resp){
              result=resp.user_groups;
            }
        });
      return result;
  },

  setS2Values:function(resp){
    jQuery("#priority").select2('data',this.convToS2Json(resp.announcement.priority,'name','text'));//NO I18N
    jQuery("#service_category").select2('data',this.convToS2Json(resp.announcement.service_category,'name','text'));//NO I18N
    jQuery("#announcement_type").select2('data',this.convToS2Json(resp.announcement.announcement_type,'name','text'));//NO I18N
    if(resp.announcement.show_usr_group){
        jQuery("#user_groups").select2('data',this.convToS2Json(resp.announcement.user_groups,'name','text'));//NO I18N
    }
  },

  convToS2Json:function(json,fromKey,toKey){
    var convArr;
    if(json){
      if(json.length==undefined){
          var newobj={'id':json.id};//NO I18N
          if(toKey){
             newobj[toKey]=json[fromKey];
          }
          convArr=newobj;
      }
      else{
          var convArr=[];
          for(var i=0;i<json.length;i++){
              var obj=json[i];
              var newobj={"id":obj.id};//NO I18N
              if(toKey){
                  newobj[toKey]=obj[fromKey];
              }
              convArr.push(newobj);
          }
          convObj=convArr;
      }
    }
    return convArr;
  },

  processHtml:function(json,srcDiv,destDiv,callBackFn){
       var mode;
       var ann=json.announcement;
       json.meta_information=$announcements.meta_information;

       mode=(ann.has_user_group)?"Shared":((ann.is_public)?"Public":"Private");// No I18N
       modei18nKey=this.getModeI18NKey(mode);
       ann.mode=modei18nKey;
       initTooltip("#annSection");//NO I18N
       if(callBackFn)
       {
          renderhbs('#'+destDiv,srcDiv, json,false,'home',null,true,callBackFn); // NO I18N
       }
       else{
        renderhbs('#'+destDiv,srcDiv, json,false,'home'); // NO I18N
       }

       if(srcDiv=='viewAnnouncement'){
          initTooltip("#viewAnn");//NO I18N
       }
       else{
          initTooltip("#annForm");//NO I18N
       }
  },

  loadAnnHtml:function(mode,ann_module,moduleId){
        var url = "/home/AnnouncementForm.jsp"; // No I18N
        if(ann_module&&moduleId){
            url+="?module="+ann_module+"&moduleId="+moduleId+"&mode="+mode;//NO I18N
        }
        else
        {
          url+="?mode="+mode; //NO I18N
        }
        //announcement-main check is to avoid removing the dialog when edit is clicked from announcement popup
        if(jQuery("#announceDialogDiv").length>0 & jQuery("#announcement-main").length<=0)
        {
            jQuery("#announceDialogDiv").remove();
        }
        if (jQuery("#announceDialogDiv:not(.ui-dialog-content)").length && jQuery("#announceDialogDiv.ui-dialog-content").length) {
          jQuery("#announceDialogDiv:not(.ui-dialog-content)").remove();
        }
        if(jQuery("#announceDialogDiv").length<=0){
            jQuery.ajax({
                   url: url,
                   async: false,
                   success: function (resp) {
                        jQuery("[name='announcement_section']").html(resp);
                   }
               });
          }
  },

      makeAnnouncementAsRead:function(dynamicNotifId)
      {
          var data = {
                 "action": "mark_announcement_as_read"// No I18n
          };
          sdpAjax({
              type: "POST",//NO I18N
              async:false,
              data:data,
              url:'/servlet/SDAjaxServlet?dynamicNotifId='+dynamicNotifId,//NO I18N
              success:function(resp){
              }
          });
      },
  viewAnnouncement:function(annId,from,dynamicNotifId,helpdeskId){
       $announcements.handleAnnouncement(annId, helpdeskId, from, dynamicNotifId);
       if (from === "inAppNotif" || from === "dynamicNotifications") { //NO I18N
         if (helpdeskId !== sdp_app.PORTAL_ID && sdp_user.ROLES.indexOf('ViewAnnouncements') < 0) { //NO I18N
           return;
         }
       }
       var json=$announcements.getAnnAPI(annId,null,null,helpdeskId);
       var modei18nKey,dialogTitle,curIndex=1,is_public;
       var compiledhtml,resulthtml,mode,has_user_group=false;
       dialogTitle=getMessageForKey('sdp.home.announcement.addnew.headTitle');

       if($announcements.module=='announcementList'){
          var tableStIndex=parseInt(jQuery("#startPageIndex").text());
          curIndex=tableStIndex+jQuery("[data-ann-id="+annId+"]").parents('tr').index();// No I18N
       }
       else if($announcements.module=='home_page'){
          curIndex=jQuery("[data-annid="+annId+"]").index()+1;
       }

       if(json){
         $announcements.loadAnnHtml('view'); //NO I18N
          $announcements.curAnnObj=json;
         json.operation='view';// No I18N
         json.isTechnician=(sdp_user.USERTYPE=='Technician');//NO I18N

         $announcements.processHtml(json,'viewAnnouncement','viewAnn');// No I18N
         $announcements.fromViewAnn=true;
         jQuery("#ann_content p").html(json.announcement.content);
         jQuery("#viewAnn").show();
         jQuery("#annForm").hide();

         $announcements.showAnnounceDialog(dialogTitle,false);
         if(curIndex==1){
            jQuery("#prevbtn").addClass('disabled');
         }
         else{
          jQuery("#prevbtn").removeClass('disabled');
         }
         $announcements.curIndex=curIndex;
      }
      if(helpdeskId && helpdeskId!=PORTALID)
      {
      jQuery("#prevbtn").hide();
      jQuery("#nextbtn").hide();
       jQuery("#edit_link").hide();
      jQuery("#delete_link").hide();
      }
      else
      {
      $announcements.checkForNextAnn();
      }
      //118119 -- RTA section Zoho color contrast changes updated
      ThemeCustomizer.zcontrastcolorinit("#ann_content");// NO I18N
  },

  checkForNextAnn:function(){
    var listInfo=this.getListInfo();
    var nextindex=$announcements.curIndex+1;
    var data={ "list_info": {"sort_field":"from_date","sort_order":"desc","start_index":nextindex,"row_count":1}};// No I18N
    var strData,resp;

    if(listInfo.filter_by){
      data.list_info.filter_by=listInfo.filter_by;
    }
    if(listInfo.search_criteria)
    {
        data.list_info.search_criteria=listInfo.search_criteria;
    }
    resp=this.getAnnAPI(null,sdpAjaxInputData(data),true);

    if(resp.announcements.length<=0){
        jQuery("#nextbtn").addClass('disabled');
    }
    else{
        jQuery("#nextbtn").removeClass('disabled');
    }
  },

  nextAnnouncement:function(){
    var nextindex=$announcements.curIndex+1;
    var listInfo=this.getListInfo();
    var data={ "list_info": {"sort_field":"from_date","sort_order":"desc","start_index":nextindex,"row_count":1}};// No I18N
	if(isMSP){
		data={ "list_info": {"sort_field":"from_date","sort_order":"desc","start_index":nextindex,"row_count":1,"group_by":["id","from_date"]}};// No I18N
	}
    var resp;

    if(listInfo.filter_by){
      data.list_info.filter_by=listInfo.filter_by;
    }
    if(listInfo.search_criteria)
    {
      data.list_info.search_criteria=listInfo.search_criteria;
    }
    //get the next announcement using announcement - list info API
    //and then compile the 'viewannouncement' html
    jQuery("#annLoading").html(ajaxBar());
    resp=this.getAnnAPI(null,sdpAjaxInputData(data),true);
     $announcements.curAnnObj=null;

    if(resp.announcements.length>0){
        has_more_rows=resp.list_info.has_more_rows;
		if(!isMSP){
        annObj={"announcement":resp.announcements[0]};
        }
		else
		{
			var ann_ID = resp.announcements[0].id;
			resp=$announcements.getAnnAPI(ann_ID);
			annObj={"announcement":resp.announcement};//NO I18N
		}
        annObj.isTechnician=(sdp_user.USERTYPE=='Technician');//NO I18N
        this.processHtml(annObj,'viewAnnouncement','viewAnn');// No I18N

        this.curIndex=$announcements.curIndex+1;
        jQuery("#ann_content p").html(annObj.announcement.content);

        if(!has_more_rows){
            jQuery("#nextbtn").addClass('disabled');
        }
        jQuery("#prevbtn").removeClass('disabled');
      }
      else{
          jQuery("#nextbtn").addClass('disabled');
      }
      jQuery("#annLoading").html("");
      $announcements.wrapDescriptionPanel();
      //118119 -- RTA section Zoho color contrast changes updated
      ThemeCustomizer.zcontrastcolorinit("#ann_content");// NO I18N
  },

  prevAnnouncement:function(){
    var resp,curEle,prevEle,_self=this,annObj,modeKey,previndex=this.curIndex-1;
    var listInfo=this.getListInfo();
    var data={ "list_info":{"sort_field":"from_date","sort_order":"desc","start_index":previndex,"row_count":1}};// No I18N
	if(isMSP){
		data={ "list_info": {"sort_field":"from_date","sort_order":"desc","start_index":previndex,"row_count":1,"group_by":["id","from_date"]}};// No I18N
	}
    if(listInfo.filter_by){
        data.list_info.filter_by=listInfo.filter_by;
    }
    if(listInfo.search_criteria)
    {
         data.list_info.search_criteria=listInfo.search_criteria;
    }
    jQuery("#annLoading").html(ajaxBar());
    resp=this.getAnnAPI(null,sdpAjaxInputData(data),true);
     $announcements.curAnnObj=null;

   //get the prev announcement using announcement - list info API
   //and then compile the 'viewannouncement' html
    if(resp){
		if(!isMSP){
        annObj={"announcement":resp.announcements[0]};
        }
		else
		{
			var ann_ID = resp.announcements[0].id;
			resp=$announcements.getAnnAPI(ann_ID);
			annObj={"announcement":resp.announcement};//NO I18N
		}
        annObj.isTechnician=(sdp_user.USERTYPE=='Technician');//NO I18N

        this.processHtml(annObj,'viewAnnouncement','viewAnn');//NO I18N
        jQuery("#ann_content p").html(annObj.announcement.content);
        _self.curIndex=previndex;

        if(_self.curIndex==1){
             jQuery("#prevbtn").addClass('disabled');
        }
        else{
            jQuery("#prevbtn").removeClass('disabled');
        }
        jQuery("#nextbtn").removeClass('disabled');
    }
    jQuery("#annLoading").html("");
      $announcements.wrapDescriptionPanel();
      //118119 -- RTA section Zoho color contrast changes updated
      ThemeCustomizer.zcontrastcolorinit("#ann_content");// NO I18N
  },

  //get filterby based on module
  getListInfo:function(){
      var filter_by={'name':'currently_showing'};// No I18N
      var listInfo={"filter_by": filter_by};// No I18N
      if($announcements.module=='announcementList'){
        try{
          listInfo=WebComponents.getInstance('webc-annlist').t_obj.table_info.list_info; // No I18N
        }catch(e){ }
      }
      return listInfo;
  },

  getModeI18NKey:function(mode){
      var i18nKey;
      if(mode=='Public'){// No I18N
        i18nKey='sdp.dashboard.common.public';// No I18N
      }else if(mode=='Private'){// No I18N
        i18nKey='sdp.dashboard.common.private';// No I18N
      }else if(mode=='Shared'){// No I18N
        i18nKey='sdp.dashboard.common.shared';// No I18N
      }
      return getMessageForKey(i18nKey);
  },

  delAnnouncement: function(id,fromViewAnn) {
    if(window.confirm(getMessageForKey('sdp.admin.change.commonlistview.deleteConform',[getMessageForKey("sdp.home.announcement.addnew.headTitle")]))) //NO I18N
    {
       sdpAjax({
            cache: false,
            async:false,
            url: "/api/v3/announcements/"+id, //NO I18N
            type: 'DELETE', //No I18N
            success: function(response) {
                if(response.response_status.status == "success")
                {
                   window.showalert("success", translate("api.deleted.success",[getMessageForKey("sdp.home.announcement.addnew.headTitle")]), 'isAutoHide=true,delay=3');//NO I18N
                   if($announcements.module=='home_page'){
                      $home_page.processAnnouncements();
                   }
                   else if($announcements.module=='announcementList'){
                     WebComponents.getInstance("webc-annlist").refreshTable(); // No I18N
                   }
                   jQuery('#announceDialogDiv').dialog('close');//NO I18N
                }
            }
        });
    }
  },
        // wrap the announcement description
      wrapDescriptionPanel: function() {
          var descEle = jQuery("#ann_content");	//No I18N
          var descHeight = jQuery("#ann_content").height();
          if(descHeight > 300) {
              descEle.css({"height": "300px", "overflow": "hidden"});	//No I18N
              jQuery("#show-more").removeClass("hide");	//No I18N
          } else {
              jQuery("#show-more").addClass("hide");	//No I18N
          }
      },
// show full description
  moreInfo:function(){
      var totalheight=jQuery("#annInfo").height()+jQuery("#ann_content").height()+100;
      var scrollTopVal=totalheight-jQuery("#annDetails").height();

      jQuery("#annDetails").animate({scrollTop:scrollTopVal},500);
      jQuery("#annInfo").css('border','1px solid #ffd400');//NO I18N

      setTimeout(function(){
          jQuery("#annInfo").css('border','none');//NO I18N
      },1000);
  },
  dcAPIKeyInvalid:function(element)
  {
      if($announcements.isAPIValid == "false" || $announcements.isAPIValid =="null" )
      {
      jQuery('#dc-info').show();
      jQuery('#dc-msg').html(translate("sdp.admin.tech.enabledclogin.dcstopped",[encodeHTML(getUEMProdName(true, false).uem_integ_prod)]));
      }
  },
  showDCInfo:function()
  {
  jQuery('#dc_restrictions_msg').dialog({width: '500px','modal':false,draggable:false,//NO I18N
  open:function(event , ui){
  jQuery(this).parent().find('.ui-dialog-title').html('<span class="ui-dialog-title help-icon"> '+getMessageForKey("sdp.dc.announcement.restrictions")+'</span>');
   jQuery(this).parent().find('button').attr('id', 'dcClose');
  jQuery(this).parent().css({"z-index":"999","left":"800px","top":"900px"});//NO I18N
   jQuery(this).dialog("widget").position({my: 'top',at: 'right',of:jQuery("#announceDialogDiv").find(".rspr")});//NO I18N

  }
  });
  },
   handleAnnouncement : function(annId, helpdeskId, from ,dynamicNotifId){
       const isAnnouncementRoleEnabled = sdp_user.ROLES.indexOf('ViewAnnouncements') >= 0; //NO I18N
       if (!isAnnouncementRoleEnabled && helpdeskId !== sdp_app.PORTAL_ID) {
         closeAnnouncement(annId, 'announcement'); //NO I18N
         const url = "/ui/home?view_type=my_view&announcementId=" + annId + "&portal_id=" + helpdeskId; //NO I18N
         const notificationContainer = jQuery("#notification-container").find('[data-id='+dynamicNotifId+']'); //NO I18N

         notificationContainer.removeClass("active"); //NO I18N
         if( from == 'dynamicNotifications'){ //NO I18N
           const is_read = notificationContainer.hasClass('highlight'); //NO I18N
           if(is_read){
             notificationContainer.removeClass('highlight'); //NO I18N
             $announcements.makeAnnouncementAsRead(dynamicNotifId);
           }
         }
         window.open(url, "_blank", 'noopener,noreferrer'); //NO I18N
         return;
       }

       if (from === "dynamicNotifications") { //NO I18N
         $announcements.makeAnnouncementAsRead(dynamicNotifId);
       }
     }
  };

var $annList={

  webComponent:{
    HandlebarData:function(){
      return {
        edit : sdp_user.ROLES.indexOf("ModifyAnnouncements") !== -1,
        delete : sdp_user.ROLES.indexOf("DeleteAnnouncements") !== -1
      }
    },
    row_inputdata:function(table_info){
         var list_info = table_info.list_info;
         var get_input_data = $annList.input_data;
         if(get_input_data){
            if(get_input_data.search_criteria){
              list_info.search_criteria = get_input_data.search_criteria;
            }
         }
        /**
         * Selecting the "All announcement" filter while opening the popup from zia.
         */
        if($annList && $annList.from == "zia"){
          list_info.filter_by = {"name" : translate('all.announcements')};// No I18N 
        }
         return {"list_info" : list_info};//NO I18N
       },
    width:{
      tableWidth:(window.externalframe ? screen.width:jQuery(window).width())-380,
      title:function(){
          return ((this.tableWidth*30)/100)+"px";//NO I18N
      },
      restriction:function(){
        return ((this.tableWidth*10)/100)+"px";//NO I18N
      },
      date_range:function(){
        return ((this.tableWidth*30)/100)+"px";//NO I18N
      },
      priority:function(){
        return ((this.tableWidth*10)/100)+"px";//NO I18N
      },
      type:function(){
        return ((this.tableWidth*20)/100)+"px";//NO I18N
      }
    }
  },
  loadAnnListView:function(){
          $announcements.module='announcementList';//NO I18N
          WebComponents && WebComponents.instancePool["webc-annlist"] && delete WebComponents.instancePool["webc-annlist"]; //No I18N
          WebComponents.render("webc-annlist");
          this.setDefaultFilterBy();
  },

 setDefaultFilterBy:function(){
      var listInfoObj=WebComponents.getInstance("webc-annlist").t_obj.table_info.list_info; //NO I18N
      var filterByValue,filterTextVal;

      if(listInfoObj.filter_by){
        filterByValue=listInfoObj.filter_by.name;
        switch(filterByValue){
          case 'currently_showing'://NO I18N
            filterTextVal=translate('sdp.home.announcement.announceShowAction.select2');
            break;
          case 'to_be_shown'://NO I18N
            filterTextVal=translate('sdp.home.announcement.announceShowAction.select3');
            break;
          case 'already_shown'://NO I18N
            filterTextVal=translate('sdp.home.announcement.announceShowAction.select4');
            break;
        }
      }
      else{
          filterTextVal=translate('all.announcements');
      }
      jQuery("#annFilter").text(filterTextVal);
 },

 tableCompOptions : function(){
    return {
          "default_sort_field" : {//NO I18N
            "sort_field": "from_date",//NO I18N
            "sort_order": "desc"//NO I18N
          }
      };
 },
  rowdataConstruct : function(table_info){
        var inputObject = {};
        inputObject.list_info = table_info.list_info;
        return inputObject;
  },

 row_construct_title:function(table_data){
      var rowData=table_data.row_data;
      var title=rowData.title;
      var col_str='<a rel="uitip" title="'+encodeHTMLAttribute(title)+'"  data-ann-id="'+rowData.id+'" data-event="click" data-handler="$annList.openAnnouncement('+rowData.id+')" href="/" nonce="'+sdpNonce+'"><span class="vmiddle">'+ e_html(title)+'</span></a>';
      return col_str;
  },
  openAnnouncement: function(id){
      $announcements.viewAnnouncement(id);
  },
  row_construct_edit_icon:function(table_data,$annList){
      var rowData=table_data.row_data;
      var paramArr=[rowData.id];
      var col_str='<button class="btn btn-link btn-xs clickaction pt5" type="button" title="'+translate("common.edit")+'" rel="uitip" data-action-name="$announcements.editAnnouncement" data-action-param='+paramArr+'><span aria-hidden="true" class="cspr edit icon-sm"></span></button>';
      return col_str;
  },
  row_construct_restriction:function(table_data,$annList){
     var rowData=table_data.row_data;
     var mode=(rowData.has_user_group)?"Shared":((rowData.is_public)?"Public":"Private");// No I18N
     var i18nKeyMode=$announcements.getModeI18NKey(mode);
     var iconClass='';
      switch(mode){
        case "Shared":// No I18N
          iconClass='cspr share2 mr5 top0';// No I18N
          break;
        case "Public":// No I18N
           iconClass='cspr globe mr5 top0';// No I18N
          break;
        case "Private":// No I18N
          iconClass='cspr lock-line-clr mr5 top0';// No I18N
          break;
      }

      var col_str="<div><span class='"+iconClass+" icon-sm'></span>"+i18nKeyMode+"</div>";
      return col_str;
  },

  row_construct_date_range:function(table_data){
    var rowData=table_data.row_data;
    var fromDate=rowData.from_date.display_value;
    var toDate=rowData.to_date;

    toDate=(toDate==null)?'N/A':toDate.display_value;// No I18N
    var col_str='<div>'+fromDate+' - '+toDate+'</div>';
    return col_str;
  },

   changeFilter:function(filter_name,ele){
        var tablecomp= WebComponents.getInstance("webc-annlist");//NO I18N
        var listInfoObj=tablecomp.t_obj.table_info.list_info;
        var filter_value=jQuery(ele).text();

        if(filter_name=='all'){
            delete listInfoObj.filter_by;
        }
        else{
            listInfoObj.filter_by={"name":filter_name};// No I18N
        }
        jQuery("#annFilter").text(filter_value);
        tablecomp.refreshTable();
    }

 };
