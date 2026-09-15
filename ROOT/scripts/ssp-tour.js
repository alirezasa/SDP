//$Id$

var $customTour= {
    tour_Id : undefined,
    slide_Id : undefined,
    lang : undefined,
    language:undefined,
    no_of_slides : 0,
    slide_order_json :undefined,
    type:"",
    source:undefined,
    tour_data:undefined,
    slide_settings:undefined,
    has_draft: undefined,
    is_published:undefined,
    init :function(lang)
    {
        //updating slide content count
        jQuery(document).on('input propertychange',"#slide_content",function(event){
            var value = jQuery(this).val().substring(0,500);
            jQuery(this).val(value);
                jQuery("#contentCount").text(value.length+"/500");
        })
         jQuery(document).on('input propertychange',"#title",function(event){
                    var value = jQuery(this).val().substring(0,500);
                    jQuery(this).val(value);
                })
        //validation
        jQuery(document).on('input propertychange',"#name",function(event){
             var val = jQuery(this).val().substring(0,500);
             jQuery(this).val(val);
             if($customTour.slide_Id)
             {
                 jQuery("#slide-name-"+$customTour.slide_Id).text(val);
                 jQuery("#slide-name-"+$customTour.slide_Id).attr("title",val)

             }
             else
             {
                  jQuery("#newSlide").find(".textblk").text(val);
             }
             if(jQuery(this).val().length==0)
             {
                   jQuery("#name-valid-message").css("display", "block");//No I18N
             }
             else
             {
                    jQuery("#name-valid-message").css("display", "none");//No I18N
             }
        })
        jQuery(document).on('input propertychange',"#title",function(event){
            if(jQuery(this).val().length==0)
            {
                jQuery("#title-valid-message").css("display", "block");//No I18N
            }
            else
            {
                jQuery("#title-valid-message").css("display", "none");//No I18N
            }
        })
        if(lang) {
            $customTour.processTour(undefined,undefined,lang,undefined,true);
        }
    },

    //opens the tour  based on the languae passed
    processTour:function (tourId,slideId,lang,newSlide,rerender,from) {
        if(lang==undefined)
        {
            lang = $customTour.lang;
        }
        if(from=="cancel" &&( $customTour.slide_details == undefined || $customTour.slide_details.length==0))
        {
            window.location.href="/app#/admin/ssp-tour";
            return;
        }
        $customTour.lang=lang;
        var slide_detail = undefined;
        var input_object = {};
        jQuery("#newSlide").remove();
        jQuery("#createnewpo").show();
        input_object.list_info = {"search_criteria":{ "field": "language", "condition": "is", "value": lang }} //No I18N
        if(tourId==undefined ||$customTour.tour_data==undefined)
        {
         sdpAjax({
             url: "/api/v3/tour_details",//No I18N
             data: sdpAjaxInputData(input_object),//No I18N
             type: "GET",//No I18N
             async: false,
             success:function(response)
             {
                  $customTour.tour_data =  response.tour_details[0];
                  $customTour.tour_Id = $customTour.tour_data?$customTour.tour_data.id:undefined;
             }
         })
        }
        $customTour.has_draft=$customTour.tour_data?$customTour.tour_data.has_draft:true;
        $customTour.is_published=$customTour.tour_data?$customTour.tour_data.is_published:false;
        input_object.list_info=  {"sort_field": "order","start_index":1,"row_count":50, "sort_order": "asc","search_criteria": {field: "is_draft", condition: "is", value: ($customTour.has_draft!=undefined?$customTour.has_draft:false)}}//No I18N
        if(($customTour.tour_Id && ( $customTour.slide_details==undefined || tourId==undefined)) )
        {
            sdpAjax({//No I18N
                       url: "/api/v3/tour_details/" +  $customTour.tour_Id + "/slide_details" ,//No I18N
                       async: false, //No I18N
                       data: sdpAjaxInputData(input_object),//No I18N
                       type: "GET",//No I18N
                       success: function (data) { //No I18N
                       $customTour.slide_details=$customTour.slide_details = data.slide_details;
                      $customTour.no_of_slides=$customTour.slide_details.length;
                      $customTour.init_slide_order_json($customTour.slide_details);
            }
            })
        }
        if($customTour.slide_details==undefined || $customTour.slide_details.length==0)
        {
            $customTour.no_of_slides=0;
            newSlide=true;
            slide_detail=null;
        }
        else if(slideId==undefined && $customTour.slide_details.length>0 && newSlide!=true)
        {
            slide_detail = $customTour.slide_details[0];
            $customTour.slide_Id=slide_detail.id;
        }
        else if(slideId!=undefined)
        {
            $customTour.slide_Id = slideId;
            sdpAjax({ //No I18N
                        url: "/api/v3/tour_details/" + $customTour.tour_Id +"/slide_details/" + $customTour.slide_Id , //No I18N
                        type: "GET", //No I18N
                        async: false,
                        success: function (response) { //No I18N
                            slide_detail =  response.slide_detail;
                            if($customTour.has_draft!=slide_detail.is_draft)
                            {
                                slide_detail = $customTour.slide_details[0];
                                $customTour.slide_Id=slide_detail.id;
                            }
                        }
            })
        }
        if(newSlide==true && $customTour.slide_details)
        {
             slide_detail=null;
             if($customTour.slide_details.length>=50)
             {
                  window.showalert('warning',translate("ssp.tour.max.slide.warning"), "isAutoHide=true,delay=10");//No I18N
                  return;
             }
        }
        var inputdata = {"tour_detail":$customTour.tour_data,"slide_detail":slide_detail,"slide_details":$customTour.slide_details,"language":$tourListview.getLanguageName[lang],"lang":lang,"has_draft":$customTour.has_draft,"is_published":$customTour.is_published};//NO I18N
        if(rerender)
        {
            renderhbs("#ssp-details-container","Slide_details",inputdata,false,"admin",true);//No I18N
        }
        else
        {
            var slide_settings = slide_detail?slide_detail:undefined;
            var name = slide_settings?slide_settings.name:"";
            var title = slide_settings?slide_settings.title:"";
            var slide_content = slide_settings? slide_settings.description:"";
            jQuery("#name").val(name);
            jQuery("#title").val(title);
            jQuery("#slide_content").val(slide_content);
            jQuery("#contentCount").text((slide_content?slide_content.length:0)+"/500");
            if(name.length>0)
            {
            jQuery("#slide-name-"+$customTour.slide_Id).text(name);
            jQuery("#slide-name-"+$customTour.slide_Id).attr("title",name);
            }
            jQuery("#slide_template_div").find(".selected").removeClass("selected");
           if(slide_detail)
            {
                jQuery("#slide_form").find(".input-group-addon").html('<span class="mandatory">*</span>'+translate("sdp.gettingstarted.subhead.step")+' '+slide_detail.order);//No I18N
                jQuery("#slide_details_div").find("[name='cancel-button']").val(translate("sdp.common.reset"));
                if(slide_detail.type=="embed")
                {
                    $customTour.saveVideo(slide_settings.link);
                }
                else if(slide_detail.type == "image")
                {
                    if(jQuery(".img-exactblk").find("img").length==0)
                    {
                            jQuery(".img-exactblk").html(' <img src="" class="mainimg"> <span class="aspr textdesc-placeholder textimg"></span>')
                    }
                    if(slide_settings.slide_image)
                    {
                    jQuery(".mainimg")[0].src = slide_settings.slide_image["content-url"];
                    }
                }
                else
                {
                  jQuery(".img-exactblk").html(' <span class="aspr sd-organization mainimg"></span> <span class="aspr textdesc-placeholder textimg"></span>')
                  $customTour.changeImageAlignment(jQuery("#bottom-align"))//No I18N
                }
            }
             else
            {
              jQuery(".img-exactblk").html(' <span class="aspr sd-organization mainimg"></span> <span class="aspr textdesc-placeholder textimg"></span>')
              jQuery("#slide_form").find(".input-group-addon").html('<span class="mandatory">*</span>'+translate("sdp.gettingstarted.subhead.step")+' '+($customTour.no_of_slides+1));//No I18N
              $customTour.changeImageAlignment(jQuery("#bottom-align"))//No I18N
              jQuery("#slide_details_div").find("[name='cancel-button']").val(translate("common.cancel"));
            }

        }
        if($customTour.tour_data) {
               if($customTour.is_published==false || $customTour.has_draft==false)
               {
                     jQuery("#previewDropdown").hide();
               }
               if(!$customTour.has_draft)
               {
                     jQuery(".action-publish").hide();
               }
               if(slide_detail)
               {
                    $customTour.slide_settings = slide_detail;
                    $customTour.type=$customTour.slide_settings.type;
                    if($customTour.type=="image"){
                    if($customTour.slide_settings.slide_image)
                    {
                    $customTour.image_id = $customTour.slide_settings.slide_image.id
                        $customTour.source = $customTour.slide_settings.slide_image["content-url"]//No I18N
                        }
                    }else if($customTour.type=="embed"){
                        $customTour.source = $customTour.slide_settings.link;
                    }
                    $customTour.changeImageAlignment(jQuery("#" + $customTour.slide_settings.alignment + "-align"))//No I18N
                    if($customTour.slide_settings.type=="embed")
                    {
                        jQuery("#video-tag iframe").width("125");
                        jQuery("#video-tag iframe").height("85");
                        jQuery("#video-tag").show();
                    }
               }
               jQuery("[slide-id=" + $customTour.slide_Id + "]").addClass("selected");//No I18N
               if(jQuery('#slide_template_div').sortable())
               {
                      jQuery('#slide_template_div').sortable( "enable");//No I18N
                      jQuery("#slide_template_div").find(".dragblk").removeAttr("style");
               }
                $customTour.initSortable(); //No I18N
               }
        else
        {
              $customTour.no_of_slides=0;
              jQuery("#previewDropdown").hide();
              jQuery("#tour-options").hide();
              $customTour.tour_Id = undefined;
        }
        if(newSlide==true || $customTour.slide_details.length==0)
        {
              jQuery("[slide-id=" + $customTour.slide_Id + "]").removeClass("selected");//No I18N
              $customTour.slide_Id = undefined;//No I18N
              $customTour.source = undefined;
              $customTour.image_id = undefined;
              $customTour.slide_settings=undefined;
              $customTour.type = "";
              var slide_data={"order":($customTour.no_of_slides + 1) };//No I18N
              jQuery("#slide_template_div").append(' <div class="list-item pl0 pr0 listcount1 selected" id="newSlide" >\n' +//No I18N
               '                <div class="innerblk">\n' +//No I18N
               '                <span class="dragblk cspr drag1 icon-xs ui-sortable-handle top0"></span>\n' +//No I18N
               '                <span class="num-blk">' + ($customTour.no_of_slides + 1) + '</span>\n' +//No I18N
               '                <span class="textblk text-ellipsis" rel="uitip" mode_ellipsis="true" >' + translate("common.untitled") + '</span>\n' +//No I18N
               '<div class="btn-group bs-noconflict pos-rel disp-ib sdmenuup" id="options" nonce="'+sdpNonce+'" data-event="click" data-handler="$customTour.toggleNewSlideToOpen(this)">' +
               '<span class="more-blk cspr in-queue icon-sm sdmenu-toggle cur-ptr top0" title="Options" data-switch="sdmenu" id="option1"></span>' +
               '<ul class="sdmenu-dd showmenu sdmenu-dd-right" aria-labelledby="option1">' +
               '<li><a href="/" nonce="'+sdpNonce+'" data-event="click" data-handler="$customTour.changeSlideStatus(41,this)">Disable</a></li>' +
               '<li><a href="/" nonce="'+sdpNonce+'" data-event="click" data-handler="$customTour.deleteSlide(41,5)">Delete</a></li></ul></div>'  + //No I18N
               '            </div>\n' +//No I18N
               '            </div>');//No I18N
               jQuery("#newSlide").find("#option1").addClass("hide");
              if(jQuery('#slide_template_div').sortable())
              {
                    jQuery('#slide_template_div').sortable( "disable" );//No I18N
                    jQuery("#slide_template_div").find(".dragblk").css("visibility", "hidden");//No I18N
              }
              $sdEventListener(jQuery("#slide_template_div"));
         }
         var jQbody = jQuery(document);
         jQbody.find("#name").focus();
         initTooltip("#slide_template_div");//No I18N
         jQuery("#save-def").prop('disabled', false);//No I18N
          jQuery("#save-add-def").prop('disabled', false);//No I18N
     },
     toggleNewSlideToOpen : function(elem){
        jQuery(elem).toggleClass('open');//No I18N
        event.stopPropagation();
     },
    //construction the slide_details_json
    init_slide_order_json:function(slide_details)
    {
        var slide_details_json=[];
        for(var i=0;i<slide_details.length;i++)
        {
            slide_details_json[i]={'id':slide_details[i].id,'order':slide_details[i].order};
        }
        $customTour.slide_order_json=slide_details_json;
    },

    isSlideUpdated:function()
    {
            var jQbody = jQuery(document);
            var slide_name = jQbody.find("#name").val();//No I18N
            var slide_title = jQbody.find("#title").val();//No I18N
            var slide_content = jQbody.find("#slide_content").val();//No I18N
            var alignment =jQbody.find("#AlignmentButtons .btn-primary").attr('id').split("-")[0];//No I18N

        if($customTour.slide_settings!=undefined & $customTour.slide_Id!=undefined )
        {
            if(slide_name!=$customTour.slide_settings.name || slide_title!=$customTour.slide_settings.title || ($customTour.slide_settings.description==null && slide_content!="" ) ||($customTour.slide_settings.description && slide_content!=$customTour.slide_settings.description) || ( alignment!=$customTour.slide_settings.alignment && ($customTour.source!=null ||$customTour.image_id!=null))|| ( $customTour.type=="embed" && $customTour.source!=$customTour.slide_settings.link ) ||$customTour.type!=$customTour.slide_settings.type||($customTour.type=="image" && $customTour.slide_settings.slide_image && $customTour.image_id!=$customTour.slide_settings.slide_image.id)||( $customTour.slide_settings.slide_image==undefined && $customTour.image_id))
            {
              return true;
            }
            else
            {
             return false;
            }
        }
         if(jQuery("#newSlide").length>0)
        {
            if(slide_name == "" && slide_title == "" && slide_content == "" && alignment=="bottom" && $customTour.source == undefined && $customTour.image_id==undefined && $customTour.type == "")
            {
            return false;
            }
        }
        return true;
    },
    openSlide:function (slideId) {//No I18N

        if(slideId==$customTour.slide_Id && slideId!=undefined)
        {
            return ;
        }
        jQuery("#name-valid-message").css("display", "none");//No I18N
        jQuery("#title-valid-message").css("display", "none");//No I18N
        var slide_updated = $customTour.isSlideUpdated();
        if(slide_updated)
        {
            showconfirm(true, 'title=' + translate("common.unsaved.changes") + ', message=' + translate("common.unsaved.changes.message")+ ', submitbutton=' + translate('sdp.common.save') + ', cancelbutton=' + translate('common.discard') + ', closebutton=no, closeOnEscKey=no',  // No I18N
            function (save) { //callback
                if (save) {
                    $customTour.addNewSlide();
                }
                else if($customTour.slide_settings)
                {
                    jQuery("#slide-name-"+$customTour.slide_Id).text($customTour.slide_settings.name);
                }
                setTimeout(function(){
                    if((jQuery("#name-valid-message").css("display")=="none" && jQuery("#title-valid-message").css("display")=="none")||(!save)){
                        if(slideId!=undefined)
                        {
                            jQuery("#createnewpo").show();
                            $customTour.processTour($customTour.tour_Id,slideId,undefined,false,false);
                        }
                        else
                        {
                           jQuery("#createnewpo").hide();
                           $customTour.processTour($customTour.tour_Id,undefined,$customTour.lang,true,false);
                        }
                    }
                }, 200);
            });
        }
        else if(slideId==undefined)//No I18N
        {
             jQuery("#createnewpo").hide();
             $customTour.processTour($customTour.tour_Id,undefined,$customTour.lang,true,false);

        }
        else
        {
             jQuery("#createnewpo").show();
             jQuery("#newSlide").remove();
             $customTour.processTour($customTour.tour_Id,slideId,undefined,undefined,false);
        }
        if(slideId){
            jQuery('#slide_template_div').scrollTop(jQuery('#slide_template_div').find('[slide-id="'+slideId+'"]').index() * 64);;
        } else{
           jQuery('#slide_template_div').scrollTop(jQuery('#slide_template_div').find('.list-item').length * 64); jQuery(document).scrollTop(jQuery(document).height() - jQuery(window).height());
        }
    },


    addNewSlide:function (newSlide) {//No I18N
    var newTour=false;
    if(!$customTour.isSlideUpdated() && $customTour.slide_Id!=undefined)
    {
      window.showalert('warning',translate("common.nothing.to.save"), "isAutoHide=true,delay=10");//No I18N
      if(newSlide)
      {
        $customTour.openSlide();
      }
      return;
    }

     var jQbody = jQuery(document);
        var slide_name = jQbody.find("#name").val().trim();//No I18N
        var slide_title = jQbody.find("#title").val().trim();//No I18N
        var slide_content = jQbody.find("#slide_content").val().trim();//No I18N
        var alignment =jQbody.find("#AlignmentButtons .btn-primary").attr('id').split("-")[0];//No I18N
        var newTour=false;//No I18N
        //new tour
        if(!slide_name)
        {
            jQbody.find("#name").focus();
            jQbody.find("#name-valid-message").css("display", "block");//No I18N
            return;
        }
        else if(!slide_title)
        {
            jQbody.find("#title").focus();
            jQbody.find("#title-valid-message").css("display", "block");//No I18N
            return;
        }
            if(newSlide)
            {
                jQuery("#save-add-def").prop('disabled', true);//No I18N

            }
            else
            {
                jQuery("#save-def").prop('disabled', true);//No I18N
            }


         var slide_detail ={};
        jQuery("#tour-options").show();
        if ( $customTour.tour_Id == undefined) {//No I18N
            $customTour.tour_Id = $customTour.addNewTour();
                    newTour=true;
            slide_detail.order = 1;
        }
        else if (!$customTour.slide_Id)
        {
            slide_detail.order = $customTour.no_of_slides+1;
        }
        if(!$customTour.has_draft)
        {

             sdpAjax({ //No I18N
                    url: "/api/v3/tour_details/" + $customTour.tour_Id + "/make_draft",//No I18N
                    type: "PUT",//No I18N
                    async: false,//No I18N
                    success: function (obj) {//No I18N
                        if($customTour.slide_Id)
                        {
                            $customTour.slide_Id = obj.slide_details[$customTour.slide_settings.order-1].id
                        }
                    }
                })
        }
        var input_data = {};//No I18N
        var method = "POST"//No I18N
        url = "/api/v3/tour_details/" + $customTour.tour_Id + "/slide_details";//No I18N
        if ($customTour.slide_Id) { //No I18N
            method = "PUT"//No I18N
            url = url + "/" + $customTour.slide_Id;//No I18N
        }
        else
        {
            slide_detail["tour"]= {"id":$customTour.tour_Id};//No I18N
        }
         slide_detail.is_draft=true;
        slide_detail["title"] = slide_title;
        slide_detail["description"] = slide_content
        slide_detail.type = $customTour.type;
         slide_detail.alignment = "bottom";//No I18N
        if($customTour.source || $customTour.image_id)
        {
            slide_detail["type"] = $customTour.type;
            if($customTour.type=="image")
            {
            slide_detail["slide_image"] = {"id":$customTour.image_id}; //No I18N
            }else{
                slide_detail["link"] = $customTour.source
            }
            slide_detail.alignment = alignment;
        }
        slide_detail["name"]=slide_name;
        sdpAjax({//No I18N
            url: url,//No I18N
            type: method,//No I18N
            async:true,
            data: {"input_data": sdpToJSON( {"slide_detail": slide_detail})},//No I18N
            success: function (data) {//No I18N
            if(method=="POST")
            {
                    $customTour.no_of_slides = parseInt($customTour.no_of_slides)+1;
                    jQuery("#newSlide").find("#option1").removeClass("hide");
                    jQuery("#newSlide").attr("order-id", $customTour.no_of_slides);
                    jQuery("#newSlide").find(".textblk").attr("id","slide-name-"+data.slide_detail.id);
                    jQuery("#newSlide").on("click",function(){
                        $customTour.openSlide(data.slide_detail.id,$customTour.tour_Id);
                    });
                    jQuery("#newSlide").attr("slide-id",data.slide_detail.id);
                    jQuery(jQuery("#newSlide").find("a")[0]).on("click",function(){
                        $customTour.changeSlideStatus(data.slide_detail.id, this);
                    });
                    jQuery(jQuery("#newSlide").find("a")[1]).on("click",function(){
                        $customTour.deleteSlide(data.slide_detail.id , $customTour.tour_Id);
                    });
                    jQuery("#newSlide").attr("id","");
                    jQuery('#slide_template_div').scrollTop(jQuery('#slide_template_div').find('.list-item').length * 64); jQuery(document).scrollTop(jQuery(document).height() - jQuery(window).height());
            }
            if(data.response_status.status=="failed")
            {
                showalert("failure",data.slide_detail.messages[0].message, 'isAutoHide=false');//No I18N
            }
            else
            {
                if($customTour.has_draft)
                {
                       window.showalert("success", translate(method=="POST"?"api.added.success":"api.updated.success",[translate("ssp.slide")]), 'isAutoHide=true,delay=3');//NO I18N
                       $customTour.processTour(undefined,data.slide_detail.id,undefined,newSlide,newTour);
                }
                else
                {
                     $customTour.processTour(undefined,undefined,undefined,newSlide,true);
                    window.showalert("success", translate("draft.saved",[translate("ssp.tour")]), 'isAutoHide=true,delay=3');//NO I18N

                }
            }
            },
            error : function(resp){
                jQuery("#save-def").prop('disabled', false);//No I18N
                jQuery("#save-add-def").prop('disabled', false);//No I18N
                 showalert("failure",resp.response_status.messages[0].message, 'isAutoHide=false');//No I18N
            }
        });
    },
    addNewTour:function()
    {
    var input_object = {"tour_detail":{"name": $customTour.language,"module": "SSP","description": "SSP","language": $customTour.lang } }; //No I18N
    var tourId = null;
    sdpAjax({
        url: "/api/v3/tour_details",//No I18N
        async: false,
        data: sdpAjaxInputData(input_object),
        type: "POST",//No I18N
        success: function (obj) {
            tourId = obj.tour_detail.id;
        }
    })
            return tourId;
    },

    changeSlideStatus:function (slideId,element,orderid) {//No I18N
        var status = element.text.trim();//No I18N
        var value=null;//No I18N
        if(!$customTour.has_draft)
       {
            jQuery("#save-def").prop('disabled', true);//No I18N
            sdpAjax({ //No I18N
                   url: "/api/v3/tour_details/" + $customTour.tour_Id + "/make_draft",//No I18N
                   type: "PUT",//No I18N
                    async: false,//No I18N
                   success: function (obj) {//No I18N
                       slideId = obj.slide_details[orderid-1].id
                   }
               })
       }
        if(status==translate("sdp.common.enable")) {//No I18N
            value="enable"//No I18N
            status=translate("sdp.common.disable");//No I18N
        }
        else { //No I18N
            value = "disable";//No I18N
            status=translate("sdp.common.enable");//No I18N
        }
        jQuery("#slide-name-"+slideId).toggleClass('opac5');//No I18N
        sdpAjax({ //No I18N
            url: "/api/v3/tour_details/" + $customTour.tour_Id + "/slide_details/" + slideId + "/"+value,//No I18N
            type: "PUT",//No I18N
            success: function (data) {//No I18N

                element.text=status;//No I18N
            if($customTour.has_draft)
            {
                window.showalert("success", translate("api.updated.success",[translate("ssp.slide")]), 'isAutoHide=true,delay=3');//NO I18N
                  $customTour.processTour($customTour.tour_Id ,$customTour.slide_Id,undefined,undefined,false);
            }
            else
            {
                $customTour.processTour(undefined,undefined,undefined,undefined,true);
                window.showalert("success", translate("draft.saved",[translate("ssp.tour")]), 'isAutoHide=true,delay=3');//NO I18N

            }
            }
        });
    },

    markAsSlideOpen: function(elem){
        var p_span = elem;
        jQuery('#slide_template_div .btn-group').each(function(){
            if(elem!=p_span){
                jQuery(elem).removeClass('open');
            }
        });
        jQuery(elem).toggleClass('open');//No I18N
        event.stopPropagation();
    },

    deleteSlide:function (slideId,order) {//No I18N
        showconfirm(true, 'title=' + translate("common.delete.label",[translate("ssp.slide")]) + ', message=' + translate("sdp.customview.list.delete.confirm") + ', submitbutton=' + translate('sdp.common.delete') + ', cancelbutton=' + translate('sdp.common.cancel') + ', closebutton=yes, closeOnEscKey=yes',  // No I18N
        function (Delete) { //Delete callback
             if (Delete) {
              if(!$customTour.has_draft)
                     {
                          jQuery("#save-def").prop('disabled', true);//No I18N
                          sdpAjax({ //No I18N
                                 url: "/api/v3/tour_details/" + $customTour.tour_Id + "/make_draft",//No I18N
                                 type: "PUT",//No I18N
                                  async: false,//No I18N
                                  data:{"input_data":'{"order":'+order+'}'},//No I18N
                                 success: function (obj) {//No I18N
                                    slideId = obj.slide_details[order-1].id
                                 }
                             })
                     }
             sdpAjax({//No I18N
                    url: "/api/v3/tour_details/" + $customTour.tour_Id + "/slide_details/" + slideId,//No I18N
                    type: "DELETE",//No I18N
                    success: function (data) {//No I18N
                        $customTour.slide_Id = undefined;//No I18N
                        if($customTour.has_draft)
                        {
                        var order = jQuery("[slide-id="+slideId+"]")[0].getAttribute("order-id");//No I18N
                        var slide_order = $customTour.slide_order_json;//No I18N
                        var input_slide_order = [];
                        for(var i=0,j=0;i<slide_order.length;i++)//No I18N
                        {
                            if(Number(slide_order[i].order)!=Number(order))
                        {
                                input_slide_order[j]= slide_order[i];
                                if(Number(input_slide_order[j].order)>Number(order))//No I18N
                            {
                                    input_slide_order[j].order=""+(input_slide_order[j].order-1);//No I18N
                            }
                                j++;
                            }

                        }
                        sdpAjax({//No I18N
                            url: "/api/v3/tour_details/" + $customTour.tour_Id + "/slide_details",//No I18N
                            type: "PUT",//No I18N
                            data :  {"input_data":sdpToJSON({"slide_details":input_slide_order})},//No I18N
                            success: function (data) {//No I18N
                                $customTour.processTour(undefined,undefined,undefined,undefined,true);//No I18N
                            }
                        });
                             window.showalert("success", translate("api.deleted.success",[translate("ssp.slide")]), 'isAutoHide=true,delay=3');//NO I18N
                        }
                        else
                        {
                            window.showalert("success", translate("draft.saved",[translate("ssp.tour")]), 'isAutoHide=true,delay=3');//NO I18N
                            $customTour.processTour(undefined,undefined,undefined,undefined,true);//No I18N
                        }

                    }
             });
        }
        },true);

    },


    changeTourStatus:function (element,tourId) {//No I18N
        if (tourId == undefined)//No I18N
        {
            tourId = $customTour.tour_Id//No I18N
        }
        var status=element.text.trim();//No I18N
        var value=null;//No I18N
        if(status==translate("sdp.common.enable")) {//No I18N
            value="enable"//No I18N
            status=translate("sdp.common.disable");//No I18N
        }
        else {//No I18N
            value = "disable";//No I18N
            status=translate("sdp.common.enable");//No I18N
        }
        sdpAjax({ //No I18N
            url: "/api/v3/tour_details/" + tourId + "/"+value,//No I18N
            async: false,
            type: "PUT",//No I18N
            success: function (data) {//No I18N
            $customTour.tour_data = data.tour_detail;
            var jQbody = jQuery(document);
                jQbody.find("#tourStatus").text(status)//No I18N
                jQbody.find(".btn-group").removeClass("open");//No I18N
                window.showalert("success", translate("api.updated.success",[translate("ssp.tour")]), 'isAutoHide=true,delay=3');//NO I18N
            }
        });
    },
    markAsdefault:function(tourId)
    {
        if (tourId == undefined) {//No I18N
            tourId = $customTour.tour_Id;//No I18N
        }
        sdpAjax({ //No I18N
            url: "/api/v3/tour_details/" + tourId+"/mark_as_default",//No I18N
            type: "PUT",//No I18N
            success: function (data) {//No I18N
                setTimeout(function (){$tourListview.refreshListview();},100);
                window.showalert("success", translate("api.updated.success",[translate("ssp.tour")]), 'isAutoHide=true,delay=3');//NO I18N
            }
        });
    },

    deleteTour:function (tourId,from) {//No I18N
        if (tourId == undefined) {//No I18N
            tourId = $customTour.tour_Id;//No I18N
        }
        showconfirm(true, 'title=' + translate("common.delete.label",[translate("ssp.tour")]) + ', message=' + translate("sdp.customview.list.delete.confirm") + ', submitbutton=' + translate('sdp.common.delete') + ', cancelbutton=' + translate('sdp.common.cancel') + ', closebutton=yes, closeOnEscKey=yes',  // No I18N
        function (Delete) { //Delete callback
            if (Delete) {
            sdpAjax({ //No I18N
                url: "/api/v3/tour_details/" + tourId,//No I18N
                type: "DELETE",//No I18N
                success: function (data) {//No I18N
                    window.showalert("success", translate("api.deleted.success",[translate("ssp.tour")]), 'isAutoHide=true,delay=3');//NO I18N
                    $customTour.tour_Id = undefined;//No I18N
                    if(from=="ssp-tour")
                    {
                    $tourListview.initTable();
                    }
                    else
                    {
                    window.location.href="/app#/admin/ssp-tour";
                    }
                }
                });
            }
        },true);
    },

    changeImageAlignment:function(e)//No I18N
    {
        imageDiv = jQuery("#imageArea");
        imageDiv.removeClass("imgtp").removeClass("imgbt").removeClass("imgrt").removeClass("imglt");//No I18N
        jQuery("#AlignmentButtons").find(".btn-primary").removeClass("btn-primary").addClass("btn-white");//No I18N
        jQuery(e).addClass("btn-primary").removeClass("btn-white");//No I18N
        var align = jQuery(e).attr('id').split("-")[0];
        if(align=="top")//No I18N
        {
            imageDiv.addClass("imgtp");//No I18N
        }
        else if(align == "bottom")//No I18N
        {
            imageDiv.addClass("imgbt");//No I18N
        }
        else if(align=="right")//No I18N
        {
            imageDiv.addClass("imgrt");//No I18N
        }
        else//No I18N
        {
            imageDiv.addClass("imglt");//No I18N
        }
    },

    initSortable: function()//No I18N
    {
        setTimeout(function()//No I18N
        {
            jQuery('#slide_template_div').sortable(//No I18N
                {
                    handle: ".drag1", // No I18N//No I18N
                    start: function(e, ui)//No I18N
                    {
                        ui.placeholder.height(ui.item.height());//No I18N
                        ui.placeholder.css('visibility', 'visible'); // No I18N
                        var start_pos = ui.item.index();//No I18N
                        ui.item.data('start_pos', start_pos); // No I18N
                    },
                    update: function(e, ui)//No I18N
                    {

                        var start_pos = ui.item.data('start_pos')+1; //No I18N
                        var end_pos = ui.item.index()+1;//No I18N
                        var slide_order = $customTour.slide_order_json;//No I18N
                        if(start_pos<end_pos)//No I18N
                        {
                            for(var i=0;i<slide_order.length;i++)//No I18N
                            {
                                if(slide_order[i].order>start_pos & slide_order[i].order<=end_pos)//No I18N
                                {
                                    slide_order[i].order=""+(parseInt(slide_order[i].order)-1);//No I18N
                                }
                                else if(slide_order[i].order==start_pos)//No I18N
                                {
                                    slide_order[i].order=""+end_pos;//No I18N
                                }
                            }
                        }
                        else if(start_pos>end_pos)//No I18N
                        {
                            for(var i=0;i<slide_order.length;i++)//No I18N
                            {
                                if(slide_order[i].order<start_pos & slide_order[i].order>=end_pos)//No I18N
                                {
                                    slide_order[i].order=""+(parseInt(slide_order[i].order)+1);//No I18N
                                }
                                else if(slide_order[i].order==start_pos)//No I18N
                                {
                                    slide_order[i].order=""+end_pos;//No I18N
                                }
                            }
                        }
                        sdpAjax({//No I18N
                            url: "/api/v3/tour_details/" + $customTour.tour_Id + "/slide_details/reorder",//No I18N
                            type: "PUT",//No I18N
                            data :  {"input_data":sdpToJSON( {'slide_details':slide_order})},//No I18N
                            success: function (data) {//No I18N

                                if($customTour.has_draft)
                                {
                                     window.showalert("success", translate("api.updated.success",[translate("ssp.tour")]), 'isAutoHide=true,delay=3');//NO I18N
                                }
                                else
                                {
                                     window.showalert("success", translate("draft.saved",[translate("ssp.tour")]), 'isAutoHide=true,delay=3');//NO I18N
                                }
                                $customTour.processTour(undefined,$customTour.slide_Id,undefined,undefined,true);//No I18N
                            }
                        });
                    }

                });
        }, 300);
    },
    saveVideo:function(url)
    {
        var src = null;
        var jQbody = jQuery(document);
        var regex= /<iframe\s+(?:[^>]*?\s+)?src=(["'])(.*?)\1/;
        if(url) {
            src = url.match(regex)[2];
        } else {
            embedcode = jQuery('#changeVideo textarea').val();//No I18N
            var match = embedcode.match(regex);
            if(match) {
                src=match[2];
            }
            var urlpattern = new RegExp('^(https?)://');
            if(!src || !urlpattern.test(src)) {
                var msg = (!src) ? "ssp.tour.embed.code.error.message" : "sdp.common.url.invalid.param";//No I18N
                window.showalert('warning',translate(msg), "isAutoHide=true,delay=10");//No I18N
                return ;
            }
            jQbody.find('#changeVideo').dialog('close').dialog('destroy');//No I18N
        }
        embedcode='<iframe src="'+src+'" > </iframe>'; //No I18N
        $customTour.type="embed";
        $customTour.source=embedcode;
        jQbody.find("#imageArea").find( ".img-exactblk").html( '<div id="video-tag" class="embed-responsive embed-responsive-4by3" style="display: none">'+$customTour.source+"</div> <span class=\"aspr textdesc-placeholder textimg\"></span>");
        jQbody.find("#video-tag iframe").width("125");
        jQbody.find("#video-tag iframe").height("85");
        jQuery(jQbody.find("#video-tag")[0]).show();

    },
    changeVideo:function()
    {
        jQuery("#changeVideo").html(jQuery("#video-template").html());//No I18N
        jQuery("#changeVideo").find("[type=button]").attr("nonce",sdpNonce);//NO I18N
        jQuery('#changeVideo').dialog({
            resizable: false,
            height:'auto',//No I18N
            width: 600,
            modal: true,
            title: translate("common.embed.code"),//No I18N
            open: function(event, ui) {
                jQuery('.ui-dialog').css({
                    'box-shadow' :'rgba(0, 0, 0, 0.2) 0px 5px 10px', //No I18N
                    'border' : '1px solid #e5e5e5', //No I18N
                    'padding' : '0px' //No I18N
                });
                jQuery('#changeVideo textarea').focus();
            }
        });
    },
    changeImage:function (event,element) {//No I18N
        var filex = event.target.files || event.target.src;
        var ajax_data = new FormData();
        for (var i = 0; i < filex.length; i++) {
            ajax_data.append('input_image', filex[i], filex[i].name);
        }
        if($customTour.tour_Id == undefined)
        {
        $customTour.tour_Id = $customTour.addNewTour();
        }
        sdpAjax({
            url:"api/v3/tour_details/"+$customTour.tour_Id+"/slide_details/images",//No I18N
            type:"POST",//No I18N
            processData: false,
            ignorefailuremessage:true,
            contentType: false,
            data: ajax_data,
            success: function (resp) {//No I18N
                jQuery("#imageArea").find( ".img-exactblk").html( ' <img src="'+resp.media["content-url"]+'" class="mainimg"> <span class=\"aspr textdesc-placeholder textimg\"></span>');
               $customTour.source=resp.media["content-url"]; //No I18N
               $customTour.image_id =  parseInt(resp.media["id"]);
                        $customTour.type="image";
            },
            error : function(resp){
                 var response = JSON.parse(resp.responseText);
                 showalert("failure",response.response_status.messages[0].message, 'isAutoHide=false');//No I18N
               }
        })
        element.value = "";
    },

    moreinfo:function (){
        jQuery('#info-data').dialog({//No I18N
            title:translate("common.info"),
            resizable: false,
            height:'auto',//No I18N
            width: 450,
            modal: true,
            open:function()
            {
                var moreInfoDiv = jQuery("#info-data");
                moreInfoDiv.find("#noInfoDiv").hide();
                if($customTour.tour_data.published_by)
                {
                    moreInfoDiv.find("#published").html("<span data-lable='moreInfo' >"+translate("common.published.on.by.info",["</span> <span class='disp-ib colon' data-time='moreInfo' >"+$customTour.tour_data.published_time.display_value+"</span>","<span class='disp-ib' data-name='moreInfo'>"+e_html($customTour.tour_data.published_by.name)+"</span>"]));
                }
                else
                {
                    moreInfoDiv.find("#published").hide();
                }
                if($customTour.tour_data.last_updated_by)
                {
                    moreInfoDiv.find("#updated").html("<span data-lable='moreInfo' >"+translate("common.updated.on.by.info",["</span> <span class='disp-ib colon' data-time='moreInfo' >"+$customTour.tour_data.last_updated_time.display_value+"</span>","<span class='disp-ib' data-name='moreInfo'>"+e_html($customTour.tour_data.last_updated_by.name)+"</span>"]));
                }
                else
                {
                    moreInfoDiv.find("#updated").hide();
                }
                if($customTour.tour_data.created_time)
                {
                moreInfoDiv.find("#created").html("<span data-lable='moreInfo'>"+translate("common.created.on.by.info",["</span> <span class='disp-ib colon' data-time='moreInfo' >"+($customTour.tour_data.created_time==null?"":$customTour.tour_data.created_time.display_value)+"</span>","<span class='disp-ib' data-name='moreInfo'>"+e_html($customTour.tour_data.created_by.name)+"</span>"]))
                }
                else
                {
                    moreInfoDiv.find("#created").hide();
                }
                if(moreInfoDiv.find('.info-table').find('div:visible').length <= 0){
                     moreInfoDiv.find("#noInfoDiv").show();
                }
            },
             close:function()
              {
                  jQuery('#info-data').dialog('destroy');//No I18N
              }
        });
    },
    publish : function(tourid)
    {
        showconfirm(true, 'title=' + translate("common.confirm.publish") + ', message=' + translate("ssp.helptour.confirm.publish.message") + ', submitbutton=' + translate('sdp.admin.translation.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes',  // No I18N
            function (publish) { //Delete callback
                if (publish) {
                    if(!tourid)
                    {
                        tourid = $customTour.tour_Id;
                    }
                    sdpAjax({
                        url: "/api/v3/tour_details/" + tourid + "/publish",//No I18N
                        type: "PUT",//No I18N
                        success: function (data) {
                            window.showalert("success", translate("publish.success",[translate("ssp.tour")]), 'isAutoHide=true,delay=3');//NO I18N
                            jQuery("#previewDropdown").show();
                              $customTour.processTour(undefined,undefined,undefined,undefined,true);
                        }
                    });
                }
            });

    },
    restoreDefault:function(tourId)
    {
        if(tourId==undefined)
        {
            tourId = $customTour.tour_Id;
        }
        showconfirm(true, 'title=' + translate("common.restore_default") + ', message=' + translate("sdp.admin.dcconfig.toolscnfrmmsg",[translate("common.restore_default")]) + ', submitbutton=' + translate('sdp.common.yes.uppercase') + ', cancelbutton=' + translate('sdp.common.no.uppercase') + ', closebutton=yes, closeOnEscKey=yes',  // No I18N
        function (proceed) { //Delete callback
            if (proceed) {
                 sdpAjax({
                      url: "/api/v3/tour_details/" + tourId + "/restore_default",//No I18N
                      type: "PUT",//No I18N
                      success: function (data) {
                           window.showalert("success",  translate("common.restored",[translate("ssp.tour")]), 'isAutoHide=true,delay=3');//NO I18N
                           $customTour.processTour(undefined,undefined,undefined,undefined,true);
                         }
                      });
                    }
                 });

    },
    restorePublished:function(tourId)
    {
     if(tourId==undefined)
            {
                tourId = $customTour.tour_Id;
            }
            showconfirm(true, 'title=' + translate("ssp.theme.restore.pulished") + ', message=' + translate("sdp.admin.dcconfig.toolscnfrmmsg",[translate("ssp.theme.restore.pulished")]) + ', submitbutton=' + translate('sdp.common.yes.uppercase') + ', cancelbutton=' + translate('sdp.common.no.uppercase') + ', closebutton=yes, closeOnEscKey=yes',  // No I18N
                   function (proceed) { //Delete callback
                        if (proceed) {
                             sdpAjax({
                                  url: "/api/v3/tour_details/" + tourId + "/restore_published",//No I18N
                                  type: "PUT",//No I18N
                                  success: function (data) {
                                       window.showalert("success", translate("common.restored",[translate("ssp.tour")]), 'isAutoHide=true,delay=3');//NO I18N
                                      $customTour.processTour(undefined,undefined,undefined,undefined,true);
                        },
                    });
                }
            });

    },
    openPreview:function (tourId, isdraft,type){
        $customTour.init();
        if(!tourId)
        {
            tourId=$customTour.tour_Id;
        }
        var data={};
        var url= "/api/v3/tour_details/"+tourId+"/slide_details"//NO I18N
        var lastSlideId = 0;
        var slide_index = 0;
        data={"list_info": {start_index: 1,row_count:50,sort_field: "order", sort_order: "asc",search_criteria:[{field: "is_draft", condition: "is", value: isdraft},{field: "is_enabled", condition: "is", value: true,  logical_operator: "AND"}]}};//NO I18N
        sdpAjax({
            url: url,//NO I18N
            data: sdpAjaxInputData(data),
            type: "GET",//NO I18N
            success: function (data) {
                if( data.slide_details==undefined || data.slide_details.length==0)
                {
                    window.showalert('warning',translate("ssp.tour.not.available"), "isAutoHide=true,delay=10");//No I18N
                    return;
                }
                var slide_settings = [];
                for( var i=0;i<data.slide_details.length;i++)
                {
                    slide_settings[i]=(data.slide_details[i]);
                }
                var HCInstance = new HelpTourComponent({
                    data:slide_settings, // Your array of slide data
                    progressbar: true,
                    arrows:true,
                    sidebar: true,
                    title:false,
                    navigateIcons: true,
                    currentSlideIndex:slide_index,
                    triggerButton:jQuery("#tour-options [data-name='open-preview']") // NO I18N
                });
                HCInstance.open();
            },
            error:function(){
            window.showalert('warning',translate("ssp.tour.not.available"), "isAutoHide=true,delay=10");//No I18N
            }

        });

    },
    openHistory:function()
       {
       jQuery("#tab-content").load("/common/ViewHistory.jsp?id="+$customTour.tour_Id+"&module=tour_details");//NO I18N
       jQuery("#cs_tab_1_1").addClass("hide");
       jQuery("#cs_tab_2_1").removeClass("hide");
       jQuery("#tour-options").addClass("hide");
       },
       closeHistory:function()
       {
       jQuery("#tour-options").removeClass("hide");
        jQuery("#cs_tab_2_1").addClass("hide");
        jQuery("#cs_tab_1_1").removeClass("hide").removeClass("fade");
       }
}
var $tourListview = {
    table_content :{},
    filter_table :undefined,
    languageList:undefined,
    init : function()
    {
        Handlebars.registerHelper("getValue", function(list,key) { //No I18N
            return list[key];
        });
        $tourListview.openListView();
        jQuery("#newview-btn").click(function () {
            setTimeout(function(){
                jQuery("#cis").select2('open'); // No I18N
            }, 50);

            jQuery("#cis").on("change",function(e){ // No I18N
                var url="/app#/admin/ssp-tour/"+jQuery("#cis").select2("data").id;// No I18N
                window.location.href=url;
            });
        });
         var jQbody = jQuery(document);
        jQbody.find('select[name=chooseLanguage]').select2();
        jQbody.find('[ data-id=allsites], [ data-id=bview]').select2();
        jQbody.find('[data-id=bview]').on('select2-selecting',function(){ jQuery("#newview-btn").closest('.btn-group').removeClass('open'); });// No I18N
        jQbody.find('[data-id=bview]').on('select2-close',function(){ jQuery("#newview-btn").closest('.btn-group').removeClass('open'); });// No I18N
        $tourListview.initTable();
        setTimeout(function(){
            jQbody.find("#tour_details").addClass("admin-box").attr("cellspacing","0").attr("cellpadding","0"); // No I18N
        }, 50);
    },
    openListView:function()
    {
        var inputJson = {}
        inputJson.languageList=$tourListview.getLanguageName;
        inputJson.sortedKeys=$tourListview.sortedKeys;
        inputJson.sortedValues=$tourListview.sortedValues;
        inputJson.keys=Object.keys($tourListview.getLanguageName)
        renderhbs("#ssp-container","tour-listview",inputJson,false,"admin");//No I18N
    },
    initTable:function()
    {
      var table_info = table_comp.getTableInfo();
        $tourListview.table_content.header = $tourListview.headerdataConstruct();
        setTimeout(function(){
            var options = {};
            options.callbackSearchFunction = $tourListview.refreshListview;
            options.paginationEnabled   = true;
            options.isODAPI             = true;
            options.searchEnabled       = true;
            options.sortingEnabled      = true;
            options.personalize_key     = "tour_details"; // No I18N
            options.row_inputdata       = $tourListview.rowdataConstruct(table_info);
            options.callbackURL         = "tour_details"; // No I18N
            options.entity_name         = "tour_details"; // No I18N
            options.support_search_criteria = true;
            filter_table = new tableComponent(table_info,$tourListview.table_content,options);

        },0)

    },

    setting:function()
    {
        jQuery('#settings-container').dialog({// No I18N
            title: translate("sdp.requests.listview.settings"),
            resizable: false,
            height:'auto', // No I18N
            width: 450,
            modal: true,
            getLanguageName:undefined,
            open : function()
            {
                jQuery("#settings-container").html(jQuery("#Settings-html").html());//NO I18N
                jQuery("#settings-container").find("[type=button]").attr("nonce",sdpNonce);//NO I18N
                jQuery.ajax({
                    async: false,
                    url: "/servlet/SDAjaxServlet",//NO I18N
                    data: {"action": "getTourSettings"},//NO I18N
                    type: 'GET', //No I18N
                    success: function (response) {
                        if(response.waiting_time) {
                            jQuery("#settings-container").find("#waiting_time").val(response.waiting_time); // No I18N
                        }
                        else {
                            jQuery("#settings-container").find("#waiting_time").val(604800000); // No I18N
                        }
                        if(response.tour_in_help=="true")
                        {
                           jQuery("#settings-container").find("#check-box").prop('checked', true);//No I18N
                        }
                        else
                        {
                             jQuery("#settings-container").find("#check-box").prop('checked', false); //No I18N
                        }
                    }
                });
             },
             close:function()
            {
                jQuery("#settings-container").dialog('destroy');//No I18N
             }
        });
    },

    saveSettings: function()
    {
        time =jQuery("#settings-container").find("#waiting_time").val();// No I18N
        flag = jQuery("#settings-container").find("#check-box").is(":checked");//No I18N
        jQuery.ajax({
            async: false,
            url: "/servlet/SDAjaxServlet",//NO I18N
            data: {"waiting_time":time,"tour_in_help":flag,"action": "updateTourSettings"},//NO I18N
            type: 'POST', //No I18N
            success: function (response) {
                jQuery("#settings-container").dialog("close"); // No I18N
                 window.showalert("success", translate("api.saved.success",[translate("sdp.requests.listview.settings")]), 'isAutoHide=true,delay=3');//NO I18N
            }
        });
    },
    closeSettingsDialog() {
        jQuery('#settings-container').dialog('close');// No I18N
    },

    refreshListview:function(){
            filter_table.refreshTable(); // No I18N
    },

    headerdataConstruct:function()
    {
        var meta_data={};
        meta_data.options = { "type":"icon","dataCelltransformer" : $tourListview.constructOptions , "width" : "35px"};// No I18N
        meta_data.name = { "text": translate("ssp.helptour.listview.title"),"dataCelltransformer" : $tourListview.constructTitle, "width" : "600px"};// No I18N
        meta_data.status = { "text": translate("common.status"),"dataCelltransformer" : $tourListview.constructStatus, "width" : "150px" ,"disableSorting":true };// No I18N
        meta_data.views = { "text": translate("sdp.common.views"),"dataCelltransformer" : $tourListview.constructViews, "width" : "100px"};// No I18N
        return meta_data;
    },

    rowdataConstruct:function(table_info)
    {
            var inputObject = {};
            inputObject.list_info = table_info.list_info;
            inputObject.list_info.search_criteria = [{"field": "module", "condition": "is", "value": "SSP"}];// No I18N
            if($tourListview.sortedKeys.length<=1)
            {
                inputObject.list_info.search_criteria.push({"field": "name", "condition": "is", "value": "English", "logical_operator": "AND"});
            }
            return inputObject;
    },

    constructViews:function(table_data)
    {
        return '<span class="viewhits icon-md"></span>'+table_data.row_data.views;// No I18N
    },

    constructStatus:function(table_data)
       {
           if(!table_data.row_data.is_enabled) {// No I18N
               return '<label data-id="inactive" class="status-badge default1 btn-xs off text-center text-overflow" style="width: 100px;">'+translate("common.disabled")+'</label>';// No I18N
           }
           else if (table_data.row_data.is_published) {// No I18N
               return '<label class="status-badge success btn-xs off text-center text-overflow top5" data-id="active" style="width: 100px;">'+translate("common.published")+'</label>';// No I18N
           }
           else {// No I18N
               return '<label data-id="inactive" class="status-badge default1 btn-xs off text-center text-overflow top5" style="width: 100px;">'+translate("request.draft")+'</label>';// No I18N
           }
       },

    constructTitle:function(table_data) {
        var title = '<div>\n' +// No I18N
            '<div class="mb5">\n' +// No I18N
            '<a href="/app#/admin/ssp-tour/' + table_data.row_data.language+'" data-spa="true" class="font-normal h4" data-spa-module="admin" >'+$tourListview.getLanguageName[table_data.row_data.language]+(table_data.row_data.is_default?"<span class='text-success ml5'> ("+translate("common.default")+")</span>":"")+'</a>';// No I18N
        if(table_data.row_data.is_published && table_data.row_data.published_time && table_data.row_data.published_by)// No I18N
        {
            title+=   '</div> <p>'+"<span class='text-muted' >"+translate("common.published.on.by.info",["</span> <span> "+table_data.row_data.published_time.display_value+"</span> <span class='text-muted' >","</span ><span>"+e_html(table_data.row_data.published_by.name)+"</span>"])+'</p>';// No I18N
        }
        else {
            title += "</div>";// No I18N
        }
        if(table_data.row_data.last_updated_by && table_data.row_data.last_updated_time) {
            title += ' <p>' + "<span class='text-muted' >"+translate("common.updated.on.by.info",["</span> <span >"+table_data.row_data.last_updated_time.display_value+"</span> <span class='text-muted'>","</span> <span >"+e_html(table_data.row_data.last_updated_by.name)+"</span>"]);
        }
        if(table_data.row_data.created_by!=undefined & table_data.row_data.created_time!=undefined) {
            title += ' | ' +"<span class='text-muted' >"+translate("common.created.on.by.info",["</span> <span >"+table_data.row_data.created_time.display_value+"</span> <span class='text-muted' >","</span> <span >"+e_html(table_data.row_data.created_by.name)+"</span>"])+ '</p>\n </div>';// No I18N
        }
        return title;
    },

    constructOptions:function(table_data)
    {
        var status = table_data.row_data.is_enabled?translate("sdp.common.disable"):translate("sdp.common.enable");
        var previewType = "'published'";// No I18N
        return  '<div><div class="btn-group bs-noconflict">'+
            '                                          <span class="cspr menulist icon-xs sdmenu-toggle opac1 vtop" data-switch="sdmenu" id="option"></span>\n' +// No I18N
            '                                          <ul class="sdmenu-dd showmenu" aria-labelledby="option">\n' +// No I18N
            (table_data.row_data.is_published?'        <li><a href="/" nonce="'+sdpNonce+'" data-event="click" data-handler="$tourListview.openPreviewAndRefreshListView('+table_data.row_data.id+');">'+translate("sdp.common.preview")+'</a></li>\n':'') +// No I18N
            '                                            <li><a href="/" nonce="'+sdpNonce+'" data-event="click" data-handler="$tourListview.changeTourStatusAndRefreshListView(this,'+table_data.row_data.id+');" id="tourStatus">'+status+'</a></li>\n' +// No I18N
            (table_data.row_data.is_default || (!table_data.row_data.is_enabled)?'':('<li><a href="/" nonce="'+sdpNonce+'" data-event="click" data-handler="$customTour.markAsdefault('+table_data.row_data.id+');">'+translate("sdp.admin.change.setasdefault")+'</a></li>\n')) +// No I18N
            '                                            <li class="divider"></li>\n' +// No I18N
            '                                            <li><a href="/" nonce="'+sdpNonce+'" data-event="click" data-handler="$tourListview.deleteTourAndRefreshListView('+table_data.row_data.id+','+"'ssp-tour'"+');">'+translate("sdp.common.delete")+'</a></li>\n' +// No I18N
            '                                          </ul>\n' +// No I18N
            '                                        </div></div>';// No I18N

    },

    openPreviewAndRefreshListView:function(tourid){
        $customTour.openPreview(tourid,false);
        $tourListview.refreshListview();
    },
    changeTourStatusAndRefreshListView: function(elem,tourId){
        $customTour.changeTourStatus(elem,tourId);
        $tourListview.refreshListview();
    },
    deleteTourAndRefreshListView:function(tourId,from){
        $customTour.deleteTour(tourId,from);
        $tourListview.refreshListview();
    }

}
