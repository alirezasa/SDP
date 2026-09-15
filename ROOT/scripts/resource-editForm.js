/* $Id$ */
//This JS file is related to resource 
var $resource_edit={
   
   //initialize select2 resource questions 
   initializeS2:function(showCost,allowed_values,default_values){
      var selectElements=jQuery("select[name='resource_dropdown']"),_self=this;
      //initialize select elements with select2 and bind change event for select2 for cost updation
      jQuery.each(selectElements,function(index,ele){
         var select2Ele=jQuery(ele);
         var id=select2Ele.attr('id');
         var fafr_key=_self.getFAFRKey(id);
         var has_images=(select2Ele.attr('data-hasimages')=="true");
         var has_cost=(select2Ele.attr('cost-enabled')=="true");
         var content=allowed_values[fafr_key];
         var fn_name=(has_images)?_self.formatQnOptions_Images:_self.formatQnCostOptions;
         var questionId=select2Ele.attr('data-questionId');
         var resId=select2Ele.attr('data-resid');
         var qn_value=(default_values[questionId])?default_values[questionId]:content[0];
         var selValue,_select,id,selEle;

         if(qn_value){
            selEle=jQuery(select2Ele).find("option[disp-value='"+e_attr(qn_value.name)+"']");
            selEle.prop('selected',true); //NO I18N
         }
         
         _select=jQuery(select2Ele).select2({
            formatResult:fn_name,
            formatNoMatches: translate("common.no.match.found"), //No I18N
            formatSelection:fn_name
         })

         var infoIcon=_select.siblings('span[name="infoIcon"]');//NO I18N
         if((showCost&&has_cost)||infoIcon.length>0){
               id=jQuery(this).attr('id');
               _select.on('change',function(){
                   selValue=_select.select2('data');//NO I18N

                   if(infoIcon.length>0){
                       if(selValue.id=="null"){
                          infoIcon.addClass('hide');
                       }else{
                          infoIcon.removeClass('hide');
                       }
                   }
                 
                  $req.resource.addRemoveCostDetails(selValue.element[0],_self.getFAFRKey(id));
              })
              if(infoIcon.length>0&&qn_value.id!="null"){
                   infoIcon.removeClass('hide');
              }
         }
      })
   },

   //format question options with image enabled
   //options value is taken from <select><option>......</select> DOM
   formatQnOptions_Images:function(item){
       if(item.element&&item.element.length>0){
          var attributes=jQuery(item.element[0]);
          var elementId=jQuery(attributes).attr('id');
          var images=jQuery(attributes).attr('data-images');
          var cost=jQuery(attributes).attr('data-cost');
          var optionName=jQuery(attributes).attr('disp-value');

          var imgSrc=(images)?images:'../images/dummyimage.png';//NO I18N
          var optionsHtml='<span><div class="disp-ib vmiddle inner-content select-img"><img src='+imgSrc+'></div><div class="disp-ib mb0 vmiddle pl15 sb w-70per"><span class="mb10 disp-b text-overflow">'+optionName+'</span>';
          
          if(cost!=undefined&&cost!=""&&elementId!="null"){
             optionsHtml+='<span class="mb10 disp-b">'+e_html(sdp_app.CURRENCY_SYMBOL)+'&nbsp;'+cost+'</span>';
          }
          optionsHtml+='</div></span>';
       }
       return optionsHtml;
   },

   //format questions options with cost enabled
   //options value is taken from <select><option>.....</select> DOM
   formatQnCostOptions:function(item){
      if(item.element&&item.element.length>0){
         var attributes=jQuery(item.element[0]);
         var elementId=jQuery(attributes).attr('id');
         var cost=jQuery(attributes).attr('data-cost');
         var optionVal=jQuery(attributes).attr('disp-value'),optionsHtml;

         if(cost!=undefined&&cost!=""&&elementId!="null"){
           optionVal+=' - '+e_html(sdp_app.CURRENCY_SYMBOL)+' '+cost;
         }
         
         optionsHtml='<div>'+optionVal+'</div>';
      }
      return optionsHtml;
   },

   //set resource height for relative view
   setResourceHeight:function(){
      var resList=jQuery('.addresourcecontent [data-name="widget-bg"]');
      var res,isExpandable,leftDiv,lDivHeight,rightDiv,isExpandable,rDivHeight,maxHeight;

      for(var i=0;i<resList.length;i++){
         res=resList[i];
         isExpandable=jQuery(res).hasClass('fw');//NO I18N
         
         if(isExpandable){
            continue;
         }
         leftDiv=jQuery(res);
         lDivHeight=leftDiv.innerHeight();
         i++;

         rightDiv=jQuery(resList[i]);
         isExpandable=jQuery(rightDiv).hasClass('fw');//NO I18N
         
         if(isExpandable){
            continue;
         }
         
         rDivHeight=rightDiv.children().innerHeight();
         maxHeight=(lDivHeight<rDivHeight)?rDivHeight:lDivHeight;
         
         leftDiv.innerHeight(maxHeight);
         rightDiv.innerHeight(maxHeight);
      }
   },

   //get fafr key from the given Value
   getFAFRKey:function(id){
      return id.substring(id.indexOf("_")+1)
   },

   //remove active classes for checked and unchecked checkboxes/radio
   highlightState:function(){
      var type;
      jQuery(".answer-block .label-blk input").each(function(index,ele){
         var checked=jQuery(this).prop('checked');//NO I18N
         //add active class for checked elements
         if(checked){
            jQuery(this).siblings('.block-bordered').addClass('active');//NO I18N
         }else{
            jQuery(this).siblings('.block-bordered').removeClass('active');//NO I18N
         }
      })

      //when options for questions are checked/unchecked, toggle the active class
      jQuery(".answer-block .label-blk input").on('change', function(){
         type=jQuery(this).attr('type');
         
         if(type=='radio'){
            var checked=jQuery(this).prop('checked');//NO I18N

            if(checked){
                jQuery(this).siblings('.block-bordered').addClass('active');//NO I18N
                jQuery(this).parents('.label-blk').siblings().find('.block-bordered').removeClass('active');//NO I18N
            }
            else{
                jQuery(this).siblings('.block-bordered').removeClass('active');//NO I18N
            }
         }
         else if(type=='checkbox'){
            jQuery(this).siblings('.block-bordered').toggleClass('active');//NO I18N
         }
      })
   }
}