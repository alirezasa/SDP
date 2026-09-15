/* $Id$ */

/**
 * Embedded Video related js should be added here.
 */
var embedVideo = (function() {
    "use strict";	//No i18N
    //supported file format, not supported - 'wmv','flv','vob','avi','mpeg','3gp','mkv','mov','ogg'
    var supportedFormats = ['mp4','webm'];
    var supportedMimeType = {'webm':'video/webm','mp4':'video/mp4','3gp':'video/3gpp','flv':'video/x-flv','wmv':'video/x-ms-wmv','mov':'video/quicktime','vob':'video/x-ms-vob,video/dvd,video/mpeg','avi':'video/x-msvideo','mpeg':'video/mpeg','mkv':'video/x-matroska','ogg':'video/ogg,audio/ogg,application/ogg'};
    var allowVideoTypes;

    function embedVideo(element) {
        this.element = element;
        var self = this;
        self.embedVideoPopup();
    }
    /*
     * Action Functions for the Editor's Embed Video Popup 
     */
    function videoEmbedUI(container,editor,embedVideoObj){
        'use strict'; //no i18n
        var videoUpload = {
            container : container,
            editor : editor,
            embedVideoObj : embedVideoObj,
            editorContent : jQuery(".ze_area").contents(), // NO I18N
            cancel: function(){
                jQuery("#"+this.container.id).dialog('close');
            },
            save : function() {
                this.container.querySelector('.card-save').disabled = true; // NO I18N
                /**
                 * Getting the selected radio ID.
                 */
                var input_id = jQuery(this.container).find("input:radio[name='video-option']:checked").attr("id");
                var result;
                if (input_id == "upload_from_computer_input") { 
                    result = this.localFileUpload();
                } else if (input_id == "embed_link_input" || !embedVideoObj.uploadVideo) { // NO I18N
                    var text = this.container.querySelector('textarea#embed-video').value; // NO I18N
                    text = text.trim();
                    result = this.webFile(text);
                }
                if (result != true) {
                    this.container.querySelector('.card-save').disabled = false; // NO I18N
                }
            },

            uploadFile : function() {
                if(this.form == undefined){
                    this.form = this.container.querySelector('form'); // NO I18N	
                }		
                var fileUploadInput = this.form.elements.video_file;
                var file = fileUploadInput.files[0];
                var videoTypeText = {mp4:translate('sdp.embedvideo.mp4'),webm:translate('sdp.embedvideo.webm')}
                if(file){	
                    var file_size = file.size / 1024 / 1024; // file.size gives in Bytes
                    var flag = true;
                    var getForm = jQuery('#video_form'); // NO I18N
                    getForm.find("#file_size, #file_type").removeClass("danger").addClass("move-req tf0-7 top0").removeAttr("title");
                    /**
                     * Error message handling based on type and size.
                     */
                    //  console.log(embedVideoObj.element.allowVideoTypes,file,file.type,'file.type');  

                    var type = file.name.split('.');
                    type = type.pop();
                    if( allowVideoTypes.indexOf(type) == -1 || supportedMimeType[type].indexOf(file.type) == -1 ) {
                        getForm.find("#file_type").removeClass("move-req tf0-7 top0").addClass("danger").attr("title", translate("sdp.common.failed"));
                        flag = false;
                    }
                    if (file_size > 10) {
                        getForm.find("#file_size").removeClass("move-req tf0-7 top0").addClass("danger").attr("title", translate("sdp.common.failed"));
                        flag = false;
                    }
                    /**
                     * The uploaded video data is set on the details page.
                     */
                    if (flag) {
                        getForm.find("#video-save").attr("disabled", false);
                        getForm.find('.mp4format > span').text(videoTypeText[type]);
                        getForm.find("#video_upload_container").addClass("hide").removeClass("disp-flex");
                        getForm.find("#video_details_container").removeClass("hide").addClass("disp-flex");
                        getForm.find("#video_file_name").text(file.name);
                    } else {
                        fileUploadInput.value = "";
                    }
                }
            },

            removeFile : function() {
                var fileInput = this.form.elements.video_file; // NO I18N
                fileInput.value = "";
                /**
                 * Removing the video file.
                 */
                var getForm = jQuery('#video_form'); // NO I18N
                getForm.find("#video_file_name").text("");
                getForm.find("#video_details_container").addClass("hide").removeClass("disp-flex");
                getForm.find("#video_upload_container").removeClass("hide").addClass("disp-flex");
                getForm.find("#video-save").attr("disabled", true);
            },

            localFileUpload : function() {
                (this.form == undefined) ?  this.form = this.container.querySelector('form') : "";
                var fileInput = this.form.elements.upload_file;
                var result = true;
                /**
                 * Checking the video limit.
                 */
                if(this.checkLimit()){
                    this.createPoster(URL.createObjectURL(fileInput.files[0]));
                } else{
                    showalert("warning", translate("sdp.embedvideo.count.error.message"), "isAutoHide=true");   //No I18N
                    result = false;
                }
                return result;
            },

            checkLimit : function() {
                var content = this.editor.getContent();
                /**
                 * SD - 118618
                 */
                var count = jQuery(content).filter("div[data-video='embed']").find('span.img-container').length; // NO I18N
                if (count > 9) {
                    return false;
                }
                return true;
            },

            createPoster : function(file) {
                var vd = this;
                var video = document.createElement("video");
                video.src = file;
                var is_thumbnail = false;
                /**
                 * 119894 Error while uploading video in chrome.
                 */
                video.addEventListener('canplay', function() {
                    video.currentTime = 5;
                    video.addEventListener('timeupdate', function(evt) {
                        generateThumbnail(vd);
                    }, false);
                }, false);

                video.addEventListener('error',function(error){
                    videoUpload.removeFile();
                    showalert("warning", translate("sdp.embedvideo.error.upload",[file.type]), "isAutoHide=true");   //No I18N
                });

                function generateThumbnail(vd) {
                    if(!is_thumbnail){
                    var c = document.createElement("canvas");
                    var ctx = c.getContext("2d"); // NO I18N
                    c.width = 1280;
                    c.height = 720;
                    ctx.drawImage(video, 0, 0, c.width, c.height);
                    var imgsrc = c.toDataURL("image/jpeg"); // NO I18N
                    //to compare with black canvas. In IE the timeUpdate event is triggered Twice    
                    var blank_c = document.createElement("canvas");
                    var blank_video = document.createElement("video");    
                    var blank_ctx = blank_c.getContext("2d"); // NO I18N
                    blank_c.width = 1280;
                    blank_c.height = 720;
                    blank_ctx.drawImage(blank_video, 0, 0, blank_c.width, blank_c.height);
                    var blank_imgsrc =blank_c.toDataURL("image/jpeg"); // NO I18N
                        if(imgsrc!=blank_imgsrc){
                            vd.storeFile(imgsrc);
                            is_thumbnail=true;
                        }
                    }
                }
            },

            storeFile : function(imgsrc) {
                if (imgsrc != "") {
                    var self = this;
                    var getVideo = this.form.elements.video_file.files[0];
                    var formData = new FormData();
                    formData.append("input_stream", imgsrc);
                    formData.append("input_video", getVideo);
                    /**
                     * Uploading the video.
                     */
                    sdpAjax({
                        url : "/api/v3/solutions/videos", // NO I18N
                        data : formData,
                        acceptODCompatible: true,
                        type : 'POST', // NO I18N
                        contentType: false,
                        processData: false,
                        success : function(data) {
                            if (data.result != "fail") {
                                self.addReplacementDiv(data.video["content-url"], data.video.thumbnail_image["content-url"], true);
                            }
                        }
                    });
                }
            },

            addReplacementDiv : function(videoId, thumbnailId, isEmbedVideo) {
                var videoElement =  document.createElement("div");
                var get_id = (new Date()).getTime();
                renderhbs(videoElement, "editor_videotag", null, null, "components");
                var img= videoElement.querySelector('.video');	//no i18n
                if(isEmbedVideo){
                    img.setAttribute("class","embed-video");
                }else{
                    img.setAttribute("class","iframe-video");
                }
                var img_id = "img_"+get_id;		//no i18n
                img.dataset.videoId = videoId;
                img.setAttribute("id",img_id);	
                img.src=thumbnailId;
                var remove_id = "remove_"+get_id;		//no i18n
                var removeDiv = videoElement.querySelector('.remove');	//no i18n
                removeDiv.setAttribute("id",remove_id);
                var playIconDiv = videoElement.querySelector(".video-circle");	 //no i18n
                var playIconDiv_id = "circle_"+get_id;		//no i18n
                playIconDiv.dataset.imgId = img_id;
                playIconDiv.setAttribute("id",playIconDiv_id); 
                var content = videoElement.innerHTML;
                if(isEmbedVideo){ // Used for counting the embed Videos
                    content = "<div data-video='embed'>"+content+"</div>";
                }else{
                    content = "<div data-video='iframe'>"+content+"</div>";
                }
                content = "<div><br></div>"+content+"<div><br></div>"; //no i18n
                /**
                 * Not need to encode here. It's not user data.
                 */                
                editor.insertHTML(content);
                jQuery("#"+this.container.id).dialog('close');   
            },

            webFile : function(text) {
                if (text != "") {
                    const getInstance = embedVideo.prototype;
                	if(text.startsWith("<iframe")){ // NO I18N
                        if(text.includes("</iframe>")){ // NO I18N
                            var iframe_text = text.substring(0, text.indexOf("</iframe>")+9);// NO I18N  
                            var html = jQuery.parseHTML(iframe_text);
                            /**
                             *  Now, embedToEditor is out of scope. That's why we called it like this
                             */
                            return getInstance.embedToEditor(html[0].getAttribute("src"));
                        }else{
                            jQuery(this.container).find("[data-id=embed-error-msg]").text(translate("sdp.embedvideo.iframeError")).removeClass("hide"); // NO I18N  
                            return false;
                        }      
                    }else if(text.includes("<")||text.includes(">")){ // NO I18N
                        jQuery(this.container).find("[data-id=embed-error-msg]").text(translate("sdp.embedvideo.iframeError")).removeClass("hide"); // NO I18N  
                        return false;
                    }else{ // for direct YouTube URLs
                        return getInstance.embedToEditor(text);
                    }
                } else {
                    jQuery(this.container).find("[data-id=embed-error-msg]").text(translate("sdp.embedvideo.iframeEmpty")).removeClass("hide"); // NO I18N
                    return false;
                }
            },

            embedToEditor : function(url) {
                var embedURL=null,startTime,vId;
                var allowedHost = ['www.youtube-nocookie.com','www.youtube.com']; // www.youtube-nocookie.com - to support user privacy mode
                url = url.replace(/&amp;/g, '&');
                var urlObject = new URL(url);

                if(allowedHost.indexOf(urlObject.hostname) >=0 ) {
                    vId =  urlObject.searchParams.get('v') || urlObject.pathname.indexOf('embed') && urlObject.pathname.split('/').pop() || false;
                    var host = urlObject.hostname;
                    embedURL = vId ? `https://${host}/embed/${vId}` : null;
                    startTime = urlObject.searchParams.get('start') || false;
                }

                if(embedURL!=null) {
                    embedURL += "?rel=0"; // will not allow related videos suggestion //NO I18N
                    if(startTime) {
                        //add start time
                        embedURL+='&start='+startTime;
                    }
                    var thumbnailsrc="https://img.youtube.com/vi/"+vId+"/0.jpg";	// no i18n
                    this.addReplacementDiv(embedURL,thumbnailsrc,false);	// no i18n
                    jQuery(this.container).find("[data-id=embed-error-msg]").addClass("hide"); // NO I18N
                    return true;
                } else {
                    jQuery(this.container).find("[data-id=embed-error-msg]").text(translate("api.common.invalid_url")).removeClass("hide"); // NO I18N
                    return false;
                }
            }
        }
        return videoUpload;
        }

    /**
     * To verify the URL.
     * We need this method globally, that's why it's changed here.
     * @param {string} url 
     * @param {boolean} verify 
     * @returns Boolean
     */
    embedVideo.prototype.embedToEditor = function(url, verify) {
        /**
         * "?rel=0" is removed from the URL to verify the URL, when playing the video.
         */
        url = (verify) ? url.split('?')[0] : url;
        var embedURLregex = new RegExp("^(\s)*(http(s?):\/\/(www\.|)youtube\.com\/embed\/)[a-zA-Z0-9_-]+$");// No I18N
        var YtURLregex = new RegExp("^(\s)*(http(s?):\/\/(www\.|)youtube\.com\/watch).*$");// No I18N
        var YtShortURLregex = new RegExp("^(\s)*(http(s?):\/\/(www\.|)youtu.be\/)[a-zA-Z0-9_-]+$");// No I18N
        var embedURL=null,vId;
        if(YtURLregex.test(url)){
            var paramRegex = new RegExp('[\\?&]v=([^&#]*)');
            var results = paramRegex.exec(url);
            vId =  results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
            embedURL = "https://www.youtube.com/embed/"+vId;		// No I18N
        }else if(YtShortURLregex.test(url)){		
            var prefix = 'youtu.be\/';								// No I18N
            var index = url.indexOf(prefix);
            vId = url.substring(index+prefix.length);
            embedURL = "https://www.youtube.com/embed/"+vId;		// No I18N
        }else if(embedURLregex.test(url)){
            vId=url.substring(url.lastIndexOf("/")+1, url.length);
            embedURL=url;
        }
        /**
         * Returning a boolean value that indicates whether the verification condition is met, based on the state of verify and the truthness of embed URL.
         */
        if(verify){
            return embedURL ? true : false;
        }
        if(embedURL!=null){
            embedURL += "?rel=0"; // will not allow related videos suggestion //NO I18N
            var thumbnailsrc="https://img.youtube.com/vi/"+vId+"/0.jpg";	// no i18n
            /**
             * addReplacementDiv is in scope. That's why we called it like this
             */
            videoEmbedActions.addReplacementDiv(embedURL,thumbnailsrc,false);	// no i18n
            jQuery(videoEmbedActions.container).find("[data-id=embed-error-msg]").addClass("hide"); // NO I18N
            return true;
        }else {
            jQuery(videoEmbedActions.container).find("[data-id=embed-error-msg]").text(translate("api.common.invalid_url")).removeClass("hide"); // NO I18N
            return false;
        }
    }
    /**
     * If the thumbnail URL is not a YouTube URL we will remove the video
     * @param {*} element 
     */
    embedVideo.prototype.validateThumbnail = function(element) {
            const ele = jQuery(element);
            const getImgSrc = ele.find("img").attr("src");
            /**
             * Define a regular expression to match YouTube thumbnail URLs
             */
            const regex = new RegExp("https:\\/\\/img\\.youtube\\.com\\/vi\\/[a-zA-Z0-9_-]+\\/0\\.jpg"); // No I18N
            /**
             *  Use the regular expression to search for a match in 'getImgSrc'
             */
            const match = getImgSrc && getImgSrc.match(regex);
            /**
             * Initialize a flag to track whether a video has been deleted
             */
            let hasDeletedVideo = false;
            /**
             * If there is no match (i.e., the thumbnail URL doesn't match the expected format)
             */
            if(!match){
                /**
                 * Remove the closest ancestor element with the attribute 'data-video' set to 'iframe'
                 */
                ele.closest("[data-video=iframe]").remove();
                /**
                 * Set the 'hasDeletedVideo' flag to true
                 */
                hasDeletedVideo = true;
            }
            /**
             *  Return the 'hasDeletedVideo' flag to indicate whether a video was deleted
             */
            return hasDeletedVideo;
    }

    /*
     * function to display video in Popup in Editor 
     */
    embedVideo.prototype.displayVideo = function(content,isEmbed) {
        var self = this;
        self.htmljQ = jQuery("html");//NO I18N
        var div = document.createElement("div");
        div.classList.add("layer-box");	//NO I18N
        div.classList.add("sdp-videoPopupDiv");	//NO I18N
        /**
         * layer overrides the tooltip that is why we decrese the z-index
         */
        div.style["z-index"] = 10000; // video popoup dialog zIndex
        div.setAttribute("tabindex", "0");
        var overlaylayer = document.createElement("div");
        var overlayClassList = overlaylayer.classList;
        overlayClassList.add("layer-box"); //NO I18N
        overlayClassList.add("freezelayerbg1"); //NO I18N
        overlaylayer.style["z-index"] = 9999; // overlay zindex
        jQuery('<div data-id="preview_close_icon" title="'+translate("sdp.common.close")+'" role="img" rel="uitip" class="video-layer-close" ></div>').appendTo(div); //NO I18N
        var innerContainer = document.createElement("div");
        innerContainer.classList.add("flex-center"); //NO I18N
        innerContainer.classList.add("fh");	//NO I18N
        div.appendChild(innerContainer);
        var innerDiv = document.createElement("div");
        innerDiv.classList.add("videoinnerdiv");//NO I18N
        innerDiv.appendChild(content);
        innerContainer.appendChild(innerDiv);
        document.body.appendChild(overlaylayer);
        document.body.appendChild(div);
        self.htmljQ.addClass('no-scroll'); // NO I18N
        jQuery("body").addClass("of-h");  // NO I18N
        jQuery(div).focus();
        initTooltip('.layer-box.sdp-videoPopupDiv');
        jQuery(document).on('keyup.sdp-videoPopupDiv',function (e) {
            if (e.keyCode == 27) { // escape key maps to keycode `27`
                if(jQuery(".sdp-videoPopupDiv").length){
                    jQuery(document).off('keyup.sdp-videoPopupDiv');
                    jQuery("[data-id=preview_close_icon]").trigger("click");//NO I18N
                }
            }
        });
        jQuery("[data-id=preview_close_icon]").on("click",function(){
            jQuery(overlaylayer).remove();
            jQuery(div).remove(); 
            jQuery("body").removeClass("of-h"); // NO I18N
        });
        initTooltip(".sdp-videoPopupDiv");
    }
    
    /*
     * Insert Video icon function in toolbar
     */
    embedVideo.prototype.embedVideoPopup = function() {
        'use strict'; //no i18n
        var self = this;
        var editor;
        try {
            if(ZEditor.editor){
                editor = ZEditor.editor;
            }else{
                editor = ZEditor[this.element.element];
            }
        } catch(e) {
            console.error(e);
            return;
        }
       
        var acceptedFormat = supportedFormats.map((type) => supportedMimeType[type]).join(',');
        var tempDiv = document.createElement('div');
        /**
         * To enable the video upload feature.
         */
        self.uploadVideo = editor.initobj.options.hasOwnProperty("uploadVideo") ? editor.initobj.options.uploadVideo : false;
        allowVideoTypes = this.element.allowVideoTypes; 
                        allowVideoTypes = allowVideoTypes.filter(function(type){
                            return supportedFormats.indexOf(type) != -1;
                        });
        var supportedFormatText = allowVideoTypes.join(', ');
        var data = {"upload_video" : self.uploadVideo,acceptedFormat:acceptedFormat,supportedFormatText:supportedFormatText};
        renderhbs(tempDiv, "video_insert_template", data, null, "components");
        /**
         * Define an array of objects containing selectors, events, and corresponding action names
         */
        let actions = [
            { selector: "[data-id=remove_link]", event: "click.remove_link", action: "removeFile" },
            { selector: "#video-save", event: "click.video-save", action: "save" },
            { selector: "#video-cancel", event: "click.video-cancel", action: "cancel" },
            { selector: "#upload_file", event: "change.upload_file", action: "uploadFile" }
        ];
        /**
         * Iterate through each object in the array and attach event handlers
         */
        actions.forEach(function(item) {
            /**
             * Find the element based on the selector, remove any existing event handler for the specified event,
             * and attach a new event handler that calls the corresponding method on the videoEmbedActions object
             */
            jQuery(tempDiv).find(item.selector).off(item.event).on(item.event, function(){
                /**
                 * Call the corresponding method
                 */
                videoEmbedActions[item.action]();
            });
        });
        var content = tempDiv.firstChild;
        var content_id = "editor-video-embed"+(new Date()).getTime();	//NO I18N
        content.setAttribute("id", content_id);
        var popupObj = jQuery(content).dialog({     
                modal : true, 
                title : translate('sdp.embed.insert.video'), // NO I18N
                height : "auto",// NO I18N
                width : "480",
                dialogClass : 'video-embed-popup', // NO I18N
                resizeable : false,
                open : function(){               
                    var getForm = jQuery('#video_form');
                    if(!self.uploadVideo){
                        setTimeout(function(){
                            getForm.find("#embed-video").focus();
                        },10);
                    }
                    getForm.find("#video_upload_container").show();
                    /**
                     * Initiating the on change event of radio button 
                     */
                    getForm.find("[data-attr=radio_button]").change(function(e){
                        getForm.find("[data-attr=inner-container]").addClass("hide");
                        var getTargetId = getForm.find(this).attr("target-id");
                        getForm.find("#"+getTargetId).removeClass("hide");
                        var isVisibleDC = getForm.find("#video_details_container").is(":visible");
                        var disableValue = getTargetId == "upload_from_computer" && !isVisibleDC ? true : false;
                        getForm.find("#video-save").attr("disabled", disableValue);
                        if(getTargetId == "embed_youtube_link"){
                            getForm.find("#embed-video").focus();
                        }
                    })
                    initTooltip("#video_form");
                },
                close : function(){
                    jQuery(this).dialog('destroy');
                }
        });
        window.videoEmbedActions = videoEmbedUI(content,editor,self);
    }
    return embedVideo;
})();

function SdpEmbedVideo(obj){
    try{
		if(obj){//No I18N
		   new embedVideo(obj);
        } 
	}catch(e){
		console.error(e);
	}
}

SdpEmbedVideo.context = 'VIDEO_EMBED_IN_EDITOR';					//No i18N

/*
 * Rendering Video in DOM
 */
var renderVideo = (function() {
        "use strict";	//No i18N
    function renderVideo(obj,isEmbed) {
        this.obj = obj;
        this.jQ = jQuery(obj);
        var self = this;
        if(isEmbed){
            self.renderEmbedVideo();
        }else{
            self.renderIframeVideo();
        }
    }
    /*
     * rendering Iframe videos
     */
    renderVideo.prototype.renderIframeVideo = function() {
        var self = this;
        var youtubeVideosrc = self.jQ.attr("data-video-id"); // NO I18N
        const getInstance = embedVideo.prototype;
        /**
         * On the details page, If the thumbnail URL is not a YouTube URL, we will remove the video.
         */
        getInstance.validateThumbnail(self.jQ.parent());
        /**
         * On the details page, If the video URL is not a YouTube URL, we will show as thumbnail image.
         */
        if(!getInstance.embedToEditor(youtubeVideosrc, true)){
            return false;
        }
        self.jQ.addClass("hide");
        var youtubeVideosrc = self.jQ.attr("data-video-id"); // NO I18N
        var iframe = document.createElement("iframe");
        iframe.src = youtubeVideosrc;
        iframe.sandbox = "allow-scripts allow-same-origin allow-presentation allow-popups"; //NO I18N
        iframe.style.width = "480px";
        iframe.style.height = "270px";
        iframe.setAttribute("allowfullscreen", true);
        iframe.classList.add("noborder");
        iframe.title = translate("common.embed.video");
        if(self.jQ.closest('span.img-container').find(".img-videoContainer").length){
            self.jQ.closest('span.img-container').find(".img-videoContainer").empty().append(iframe);		// no i18n
        }else{
            var videoContainer = document.createElement("div");
            videoContainer.classList.add("img-videoContainer");	//NO I18N
            videoContainer.appendChild(iframe);
            self.jQ.closest('span.img-container').append(videoContainer);	//NO I18N
        }
    };
    /*
     * rendering embeded videos
     */
    renderVideo.prototype.renderEmbedVideo = function() {
        var self = this;
        var videoId = self.jQ.attr("data-video-id"); // NO I18N
        var thumbnailId = self.jQ.attr("src"); // NO I18N
        if (thumbnailId != undefined && videoId != undefined) {
            /**
             * Create the video element with jQuery
             */
            let videoElement = jQuery('<video>', {
                controls: true,
                css: {
                    width: '480px',
                    height: '270px',
                    backgroundColor: 'black'
                },
                poster: thumbnailId
            });
            /**
             * Create the source element with jQuery
             */
            let sourceElement = jQuery('<source>', {
                src: videoId,
                type: 'video/mp4'
            });
            /**
             * Append the source element to the video element
             */
            videoElement.append(sourceElement);
            /**
             * Create a div container and append the video element to it
             */
            let contentObject = jQuery('<div>');
            contentObject.append(videoElement);
            if(self.jQ.closest('span.img-container').find(".img-videoContainer").length){
                self.jQ.closest('span.img-container').find(".img-videoContainer").empty().append(contentObject[0].firstChild);		// no i18n
            }else{
                var videoContainer = document.createElement("div");
                videoContainer.classList.add("img-videoContainer");// NO I18N
                videoContainer.appendChild(contentObject[0].firstChild);
                self.jQ.closest('span.img-container').append(videoContainer);// NO I18N
            }
            self.jQ.addClass("hide");
        }
    };
    return renderVideo;
    })();

function SdpRenderVideo(obj,isEmbed){
    try{
		if(obj){//No I18N
		  var render_video = new renderVideo(obj,isEmbed);
        }
	}catch(e){
		console.error(e);
	}
}

/*
 * function to set onclick actions for the saved videos loaded in the editor
 */
function setActionsForVideo(editorId){
    if(editorId){
        const getInstance = embedVideo.prototype;
        var editorContent = jQuery("#"+editorId+" .ze_area").contents(); // no i18n
        /**
         * Initialize a flag to track whether a video has been deleted
         */
        let hasDeletedVideo = false;
         /**
         * On the Add and Edit page, If the thumbnail URL is not a YouTube URL, we will remove the video.
         * SD - 118618
         */        
        editorContent.find("div[data-video=iframe] span.img-container").each(function(index, element) {
                 /**
                 * Validate the thumbnail and get a flag indicating whether it's deleted
                 */
                let isDeleted = getInstance.validateThumbnail(element);
                /**
                 * If the thumbnail was deleted, update the hasDeletedVideo flag
                 */
                isDeleted ? hasDeletedVideo = isDeleted : "";
        });
        /**
         *  If at least one video was deleted and there's an editorContent with a body
         */
        if(hasDeletedVideo && editorContent[0] && editorContent[0].body) {
            /**
             * Trigger a 'blur' event on the editorContent body
             */
            jQuery(editorContent[0].body).trigger('blur');
        }    
        editorContent.on("click",'.video-circle',function(){ // no i18n
            var img_id = this.getAttribute('data-img-id'); // no i18n
            editorContent.find('#'+img_id).trigger("click"); // no i18n
        });
        editorContent.on("click",'img.embed-video',embedVideoPopUp); // no i18n
        editorContent.on("click",'img.iframe-video',iframeVideoPopUp); // no i18n
        editorContent.on("click",'.delete-wrapper .remove',removeVideo); // no i18n

        function embedVideoPopUp(){
            const video_url = this.getAttribute('data-video-id');
            /**
             * Create the video element with jQuery
             */
            let videoElement = jQuery('<video>', {
                controls: true,
                css: {
                    backgroundColor: 'black'
                }
            }).addClass("w-100per fh");
            /**
             * Create the source element with jQuery
             */
            let sourceElement = jQuery('<source>', {
                src: video_url,
                type: 'video/mp4'
            });
            /**
             * Append the source element to the video element
             */
            videoElement.append(sourceElement);
            /**
             * Check if the content is defined and not null
             */
            if (videoElement.length) {
                /**
                 * Create a div container with jQuery and append the video element to it
                 */
                let contentObject = jQuery('<div>').append(videoElement);
                /**
                 * Assuming getInstance is already defined and displayVideo is a method on it
                 */
                getInstance.displayVideo(contentObject[0].firstChild, true);
            }
        }

        function iframeVideoPopUp(){	
            var video_url = this.getAttribute('data-video-id');
            /**
             * On the Add and Edit page, if the video URL is not a YouTube URL, we will return an error message like "Invalid URL".
             */
            if(!getInstance.embedToEditor(video_url, true)){
                showalert("failure", translate("api.common.invalid_url"), "isAutoHide=false");   //No I18N
                return false;
            }
            var iframe = document.createElement("iframe");
            iframe.src = video_url;
            iframe.sandbox = "allow-scripts allow-same-origin allow-presentation";// no i18n
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.classList.add("noborder");
            iframe.title = translate("common.embed.video");
            getInstance.displayVideo(iframe, false);  
        }

        function removeVideo(){
            jQuery(this).closest("div").remove(); // no i18n
        }
    }
}
