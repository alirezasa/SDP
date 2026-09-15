/* $Id$ */
/*
 * uploadImageSlider is used for upload image and view images using image slider. It's using both attachPreview and imageSlider.
 * As of it is used in product and software page.
*/
var uploadImageSlider = function() {
    _attach_component : null,
    imageModule = null,
    api_url = "",
    sliderId = null,
    uploadElementId = null,
    no_image_li_style = null,
    images = [];


    var _maxImagesCount = 0;
    var _imagesCount = 0;
    var _imageIndex = 0;
    //To return the default content. When no images are added.
    var _noImageElement = function () {
        var message = getMessageForKey("common.no.info.msg", [getMessageForKey("common.images")]);
        var $element = jQuery("<li>", {"id":"li-img-slider-noimage", "class":"text-muted fw sb disp-ib no-border", "style": no_image_li_style});
        $element.append(jQuery("<label>", {"class":"label-blk"}).append(message));
        return $element;
    }
    //To return the div content for image section. Parameter used are imageurl, index and isenabled as default.
    var _createSliderElement = function(image, index, is_checked) {
      var $element = jQuery("<label>", {"class":"label-blk disp-b", "for":"default_sliderimg_" + index});
      $element.append(jQuery("<span>", {"class":"radbck"}));
      $element.append(jQuery("<input>", {"id":"default_sliderimg_" + index, "class":"pos-rel", "name":"default_sliderimage", "type":"radio", "title": getMessageForKey("mark.as.default.image"), "rel": "uitooltip"}));
      $element.find("#default_sliderimg_"+index).prop('checked', is_checked); //NO I18N
      $element.append(jQuery("<div>", {"class":"img-blk"}).append(jQuery("<img>", {"class":"sliderimage_src", "data-id": image.id, "src": image["content-url"]})));
      $element.append(jQuery("<span>", {"class":"cspr icon-sm trash fr", "onClick":"uploadImageSlider.deleteImage(this)","title": getMessageForKey("common.remove.image"), "rel": "uitooltip"}));
      $element.append(jQuery("<span>", {"class":"trashbck"}));
      return jQuery("<li>").append($element);
    }  
    //To render image section. Parameter used are imagesurl string array.
    var _renderImages = function(images) {
        if (images) {
            images.forEach(function(img, index) {
                var $imgElement = _createSliderElement(img, _imageIndex, ('primary' in img)); //NO I18N
                jQuery("#imageList").append($imgElement);
                _imagesCount++;
                _imageIndex++;
                jQuery('#img-slider').imageSlider();
            }); 
        }   
        if (_imagesCount > 0) {
            jQuery("#li-img-slider-noimage").remove();
        } else {
            jQuery("#imageList").html("").append(_noImageElement());
            _imageIndex = 0;
        }
        if(_imagesCount >= _maxImagesCount) {
            disableAddImages();

        }else if(_imagesCount > 0){
            if(this._attach_component != undefined) {
                _attach_component.options.max_upload_length = _maxImagesCount - _imagesCount;
            }
        }
    }
    //This method used to initialize the uploader.
    var init = function(module_name, img_sliderId, upload_element_id, images_array, maxImagesCount, noImageContentStyle, url) {
        
        if (noImageContentStyle != undefined) {
            no_image_li_style = noImageContentStyle;
        }else {
            no_image_li_style = "min-height:100px;line-height:100px;left:188%";	//NO I18N
        }
        if(_imagesCount > 0) {
            jQuery("#imageList").html("").append(_noImageElement());
        }
        _imagesCount = 0;
         _imageIndex = 0;
        imageModule = module_name;
        api_url = url;
        sliderId = img_sliderId;
        uploadElementId = upload_element_id;
        images = images_array;
        _maxImagesCount = maxImagesCount;
        _renderImages(images);
        init_attachment_preview();
        if(_imagesCount >= _maxImagesCount) {
            disableAddImages();
        }else {
            enableAddImages();  
        }
    }
    //This method used to initialize the _attach_component for image uploader.
    var init_attachment_preview = function() {
        this._attach_component = new attachPreview(jQuery("#" + uploadElementId), {
            max_upload_length: _maxImagesCount - _imagesCount,
            servlet_url: api_url,
            upload_param: 'input_image', //NO I18N
            upload: true,
            multiple_upload: false,
            drop_element: jQuery("#" + sliderId),
            browse_html: '<div id="addImgIcon" style="width:63px;height:46px;" data-img="add-image" data-id="organizationLogo" class="aspr img-add ml10"></div>', //NO I18N
            mime_types: 'image/jpeg,image/gif,image/png', //NO I18N
            allowed_ext: ['jpeg', 'jpg', 'png', 'gif'],  //NO I18N
            max_file_size: 5,
            servlet_cb: function (resp) {
                if(resp.response_status.status != "success") return;
                _renderImages([resp.media]);
            }
        });
        jQuery('.slider-choose').imageSlider();
    }
    //Method used to delete the added image form image slider section.
    var deleteImage = function(target) {
        var is_selected_option = jQuery(target).closest("li").find("input[type=radio]").prop("checked") != undefined;		//NO I18N
        jQuery(target).closest("li").remove();	//NO I18N
        _imagesCount--;
        if (_imagesCount == 0) {
            jQuery("#imageList").append(_noImageElement());
            _imageIndex = 0;
        }else if(is_selected_option){
            jQuery("input:radio[name=default_sliderimage]:first").prop('checked', true); //NO I18N
        }
        if(_imagesCount < _maxImagesCount) {
            enableAddImages();
            init_attachment_preview();
        }
        jQuery('#img-slider').imageSlider(); 
    }
    //Method used to reset the image slider section.
    var resetImagesList = function() {
        _imagesCount = 0;
        jQuery("#imageList li").remove();
        _renderImages();
        enableAddImages();
        init_attachment_preview();
    }
    //To disable add or upload image option
    var disableAddImages = function() {
        if(this._attach_component != undefined) {
            jQuery("#addImageDiv").addClass("cur-na");
            jQuery("#addImgIcon").addClass("cur-na");
            jQuery("#addImageDiv label").addClass("cur-na");
            _attach_component.destroy();
        }
        jQuery("#addImageDiv").addClass("opac3");
    }
    //To enable add or upload image option
    var enableAddImages = function() {
        jQuery("#addImageDiv").removeClass("opac3");
        jQuery("#addImageDiv").removeClass("cur-na");
        jQuery("#addImgIcon").removeClass("cur-na");
        jQuery("#addImageDiv label").removeClass("cur-na");
    }
    //This method return the images array from loaded image slider section.
    var getImagesList = function() {
        var images = [];
        jQuery("#imageList li img").each(function(){
            var image = jQuery(this).data("id");  //NO I18N
            if(images.length > 0 && jQuery(this).closest("li").find("input").prop("checked")) {
                var img = images[0];
                images[0] = image;
                image = img;
            }
            images.push(image);
        });
        if(images.length) {
            jQuery("#product_images").val();
        }
        return images;
    }
    return {
      init: init,
      deleteImage: deleteImage,
      getImagesList: getImagesList,
      resetImagesList: resetImagesList
    }
  }();
