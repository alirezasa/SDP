/* $Id:$ */
//format question options with image enabled
//Options value is passed as argument
function formatQnOptions_Images(item,hideDetails){
    var option_image_token = item.image_token ? ('?key=' + item.image_token) : ''; //No I18N
    var imgSrc=(item.images&&item.images.length>0) ? (item.images[0] + option_image_token) : '../images/dummyimage.png';//No I18N
    var optionsHtml='<span><div class="disp-ib vmiddle inner-content select-img"><img src='+imgSrc+'></div><div class="disp-ib mb0 vmiddle pl15 sb w-70per"><span rel="uitip" title="'+e_html(item.name || item.text)+'" class="mb10 disp-b text-overflow w-100per">'+e_html(item.name || item.text)+'</span>';
    if(item.cost){
       optionsHtml+='<span class="mb10 disp-b">'+e_html(sdp_app.CURRENCY_SYMBOL)+'&nbsp;'+item.cost+'</span>';
    }
    if(!hideDetails&&item.id!='placeholder'){
      optionsHtml+='<span name="viewDetails" class="mb0 disp-b"><a href="/" class="text-link">'+translate('common.viewdetails')+'</a></span>';
    }

    optionsHtml+='</div></span>';
    return optionsHtml;
}

//format question options with cost enabled
//Options value is passed as argument
function formatQnCostOptions(item){
      var optionVal,optionsHtml;
      optionVal=e_html(item.name || item.text);

      if(item.cost){
        optionVal+=' - '+e_html(sdp_app.CURRENCY_SYMBOL)+' '+item.cost;
      }
      
      optionsHtml='<div>'+optionVal+'</div>';
      return optionsHtml;
}

//invoke question options API
function getOptionDetails(qnId,optionId,templateId,woId, includeReqIdInUrl = false){
      var url='/api/v3/udf_fields/'+qnId+'/'+optionId;//NO I18N
      var option;

      if(templateId){
         /* Deleted options details can be fetched only when request id is passed. Also, unselected options details can be fetched only when the request is not present.  */
         /* currently includeReqIdInUrl is set to true, whem view details is clicked from request details page */
         url='/api/v3/requests/' + (includeReqIdInUrl && woId ? woId + '/' : '') + 'udf_fields/'+qnId+'/'+optionId;//NO I18N

      }

      sdpAjax({
          url:url,
          async:false,
          success:function(resp){
            if (resp.product || resp.software || resp.request_option) {
              option = resp.product || resp.software || resp.request_option;
              option.images = [];
              let imagesKey = resp.product? 'product_icon':resp.software ? 'software_image':'pictures';
              if (option[imagesKey]) {
                let images = option[imagesKey];
                for (let i = 0; i < images.length; i++) {
                    //primary image has to be displayed first, though order id is different.
                    if (images[i].primary && i !== 0) {
                        option.images.unshift(images[i]['content-url']);
                    } else {
                        option.images.push(images[i]['content-url']);
                    }
                }
              }
              option.description = (option.description || (option.additional_attributes && option.additional_attributes.description)) || '';
              option.cost = (option.cost || (option.additional_attributes && option.additional_attributes.cost)) || '';
            }

          }
      })
      return option;
}


