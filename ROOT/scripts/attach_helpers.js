/* $Id $ */

/**
 * Common methods or variables used in attachment component and file upload field will be handled here
 */

var cl_attach = {
    icons: {
        image: "attachment-sprite attach-image top4", //NO I18N
        other: "attachment-sprite attach-file top2", //NO I18N
        video: "attachment-sprite attach-video top5", //NO I18N
        audio: "attachment-sprite attach-audio top3", //NO I18N
        nopreview: "attachment-sprite attach-empty top3", //NO I18N
        pdf: "attachment-sprite attach-pdf top3", //NO I18N
        zip: "attachment-sprite attach-zip top5", //NO I18N
        tar: "attachment-sprite attach-zip top5", //NO I18N
        rar: "attachment-sprite attach-zip top5", //NO I18N
        doc: "attachment-sprite attach-doc top3", //NO I18N
        docx: "attachment-sprite attach-doc top3", //NO I18N
        xls: "attachment-sprite attach-xls top3", //NO I18N
        xlsx: "attachment-sprite attach-xls top3", //NO I18N
        csv: "attachment-sprite attach-xls top3", //NO I18N
        tsv: "attachment-sprite attach-xls top3", //NO I18N
        ppt: "attachment-sprite attach-ppt top3", //NO I18N
        pptx: "attachment-sprite attach-ppt top3", //NO I18N
        txt: "attachment-sprite attach-file top3", //NO I18N
        html: "attachment-sprite attach-html top5", //NO I18N
        htm: "attachment-sprite attach-html top5", //NO I18N
        xhtml: "attachment-sprite attach-html top5" //NO I18N
    },
    /**
     * Method to get config for attachments
     */
    getConfig: function (options) {
        if (options.entity == "" || !options.upload) {
            return;
        }
        var url = options.base_url + "/" + options.entity + "/";
        var field_name = options.field_id ? options.field_id : "attachments";   //No I18N
        url += (options.entity_id && options.entity_id != "") ? options.entity_id + "/" + field_name + "/get_config" : field_name + "/get_config";//No I18N
        options.unallowed_ext = options.allowed_ext = [];
        if (!sdp_app.attachment_configuration) {
            sdp_app["attachment_configuration"] = {};
        }
        options.entity = options.field_id && !options.entity.includes(options.field_id) ? options.entity + "/" + options.field_id : options.entity;
        var attconfig = sdp_app.attachment_configuration;
        if (!attconfig[options.entity]) {
            sdpAjax({
                url: url,
                async: false,
                cache: true,
                ignoreHeader: true,
                ignorefailuremessage: true,
                success: function (resp) {
                    attconfig[options.entity] = resp.attachment_settings;
                }
            });
        }
        options.max_file_size = attconfig[options.entity].attachment_size || sdp_app.MAX_FILE_ATTACHMENT_SIZE_IN_MB;
        options.upload_limit = attconfig[options.entity].tuple_limit || "";
        var type = attconfig[options.entity].filter_type;
        if (type == "Exclude") {
            options.unallowed_ext = attconfig[options.entity].extensions;
        } else if (type == "Include") {
            options.allowed_ext = attconfig[options.entity].extensions;
        }
    },
    /**
     * Method to get file extension
     * @param {String} name name of the file
     * @returns extension of the file
     */
    extension: function (name) {
        var ext = "";
        name = name ? name.toString() : "";
        name = name.split(".");
        ext = name[name.length - 1] || "";
        return jQuery.trim(ext.toLowerCase());
    },
    /**
     * Method to Provide Attachment Flag
     * @param {String} extension file extension name
     * @returns reference key for icon
     */
    flag: function (extension) {
        switch (extension) {
            case "png": //NO I18N
            case "jpg": //NO I18N
            case "jpeg": //NO I18N
            case "ico": //NO I18N
            case "webp": //NO I18N
            case "gif": //NO I18N
                return "image"; //NO I18N
            case "css": //NO I18N
            case "html": //NO I18N
            case "xml": //NO I18N
            case "htm": //NO I18N
            case "js": //NO I18N
            case "ts": //NO I18N
            case "xhtml": //NO I18N
            case "es": //NO I18N
            case "txt": //NO I18N
            case "tsv": //NO I18N
                return "docs"; //NO I18N
            case "mp4": //NO I18N
            case "ogv": //NO I18N
            case "webm": //NO I18N
                return "video"; //NO I18N
            case "ogg": //NO I18N
            case "mp3": //NO I18N
            case "wav": //NO I18N
                return "audio"; //NO I18N
            case "pdf": //NO I18N
                return "pdf"; //NO I18N

            case "csv": //NO I18N
            case "docx": //NO I18N
            case "xls": //NO I18N
            case "xlsx": //NO I18N
                return "sdp_preview";
            default:
                return "nopreview"; //NO I18N
        }
    },
    /** 
     * Load the Attachment Preivew box 
     */
    loadBox: function () {
        var $body = jQuery("body"); //NO I18N
        if ($body.find(".atp-box").length == 0) {
            var template = '<div class="layer-box atp-box  freezelayerbg1"><div class="row fw atp-header m0" data-id="atp-header" ><div class="col-xs-5 tl printname-tilte" data-atp-el="filename" ></div><div class="col-xs-2" data-atp-el="count"></div><div class="col-xs-5 tr"><a class="pr20 text-white" data-atp-action="download" href=""><em class="cspr icon-md p-download mr5 "></em> <span class="hidden-xs"> ' + translate("sdp.common.download") + ' </span></a><button type="button" class="pr20 text-white  btn-link txt-dec-none-i p0" data-atp-action="print" ><em class="cspr icon-md p-printer mr5 "></em>  <span class="hidden-xs">' + translate("sdp.common.print") + '</span> </button><button type="button" class="text-white preAttachcls pl30 btn-link txt-dec-none-i p0" data-atp-action="close" role="img" title=" ' + translate("sdp.common.close") + '" rel="uitip" ><em class="cspr icon-md p-close "></em></butoon>' + "</div>" + "</div>" + '<div class="disp-t fw"><button type="button" class="btn btn-secondary pos-abs p10 top50-per" data-atp-action="prev" rel="uitip" title="' + translate("sdp.common.previous") + '"><em class="cspr icon-sm p-preview"></em>' + "</button>  " + '<div class="disp-ib fw pos-rel" data-id="atp-cntr-outer"> <div class="atp-cntr" ><div data-id="atp-cntr-inner" class="disp-ib pos-rel top-5"><div class="loader-cnt atp-tg">' + ajaxBar("white") + '</div>           ' + '<div class="media-cnt p10 atp-tg"><img src="" class="center-block maxh-60vh" data-id="center_block">' + '</div>            ' + '<div class="doc-cnt tl center-block bgwhite atp-tg p10" >                ' + '</div> </div>           ' + '</div></div>' + '<button class="btn btn-secondary pos-abs right0  p10 top50-per"  data-atp-action="next" rel="uitip" title="' + translate("sdp.common.next") + '"><em class="cspr icon-sm p-next"></em></button>' + '</div>' + '</div>';

            template = jQuery(template);
            template.css({'display': 'none', 'z-index': '999'});
            template.find('[data-id="center_block"]').css({'max-width': '80vw'});

            const $cntr_outer = template.find('[data-id=atp-cntr-outer]');

            $body.append(template);
            jQuery(document).on("keyup", function (e) {
                var key = e.which;
                if ($body.find(".atp-box").is(":visible")) {
                    e.preventDefault();
                    e.stopPropagation();
                    let zoomDiv = null;
                    if (key == 27) { //esc
                        cl_attach.close();
                    } else if (key == 37) { //left
                        zoomDiv = $cntr_outer.find('div.atp-zoom');
                        if(zoomDiv.length) {
                            zoomDiv.trigger('focus'); // In firefox browser scrolling with arrow keys doesn't work unless the div is in focus
                            //SD-127288 & case-SDP_HTML_515 => When left key is pressed when an image is in zoom, then it should scroll left instead moving to the next image
                            return false;
                        }
                        $body.find('[data-atp-action="prev"]').trigger("click");
                    } else if (key == 39) { //right
                        zoomDiv = $cntr_outer.find('div.atp-zoom');
                        if(zoomDiv.length) {
                            zoomDiv.trigger('focus'); // In firefox browser scrolling with arrow keys doesn't work unless the div is in focus
                            //SD-127288 & case-SDP_HTML_515 => When right key is pressed when an image is in zoom, then it should scroll right instead moving to the prvious image
                            return false;
                        }
                        $body.find('[data-atp-action="next"]').trigger("click");
                    }
                    zoomDiv && (document.activeElement.blur()); // Reset the focused element back to body
                }
            });
        }
    },
    /**
     * Method to close preview
     */
    close: function () {
        var $body = jQuery("body"); //NO I18N
        $body.removeClass("atp-open").end().find(".atp-box:not([data-id=desc])").hide().removeClass("pdf").end().find("[data-attach-open]").removeAttr("data-attach-open").end().find(".atp-box .media-cnt").html(""); //NO I18N
    },
    /**
     * Method to show preview of files
     * @param {dom} element attachment for which preview needs to be loaded
     * @param {Object} options options passed for the component
     */
    filePreview: function (element, options, _self) {
        var hasPreviewAvailable = function (data) {
            var isEdge = /Edge/.test(navigator.userAgent);
            /** The PDF preview, is not available on EDGE on non login servlet */
            if (data.attachUrl == "" || (isEdge && data && data.attachUrl.indexOf("/servlet/HdFileDownloadServlet") !== -1 && data.attachFlag === "pdf")) {
                return false;
            } else {
                return true;
            }
        };

        options = options || { show: cl_attach.filePreview };
        var $body = jQuery("body"); //NO I18N
        const external_link = ((element.attr("data-external-link") === 'true') || (element.attr("data-img-target")) === 'true') === true;//NO I18N
        let flag = element.attr("data-attach-flag"); //NO I18N
        let icon = element.attr("data-attach-icon") || ""; //NO I18N
        icon = icon.replace("attachment-sprite", "fspr");
        icon = icon.replace(/top\d/, "");
        icon = icon.replace("vmiddle", "");
        icon = jQuery.trim(icon);
        element.closest(".atp-container-target").find("[data-attachment]").removeAttr("data-attach-open"); //NO I18N
        element.attr("data-attach-open", true);
        var totalAttachment = element.closest(".atp-container-target"); //NO I18N
        totalAttachment = totalAttachment.find("[data-attachment]").length;
        if (totalAttachment > 1) {
            totalAttachment = totalAttachment;
        }
        let index = element.attr("data-attach-index"); //NO I18N
        let url = element.attr("data-attach-url"); //NO I18N
        let name = element.attr("data-attach-name"); //NO I18N
        let extension = cl_attach.extension(name);
        if (!extension) {
            extension = "";
        }
        $body.find(".atp-box [data-atp-action='next'],.atp-box [data-atp-action='prev']").addClass("hidden");
        index = parseInt(index);
        $body.addClass("atp-open").end().find(".atp-box").show().removeClass("hidden").end().find(".atp-box .atp-tg").hide().end().find(".atp-box [data-atp-el='filename']").text(element.attr("data-attach-name").replace(/\?.+/, '')).attr("title", element.attr("data-attach-name")).prepend('<em class="' + icon + '1 icon-lg vmiddle"></em> ');
        if (totalAttachment != 1) {
            if (index == 1) {
                $body.find(".atp-box [data-atp-action='next']").removeClass("hidden");
            } else if (index == totalAttachment) {
                $body.find(".atp-box [data-atp-action='prev']").removeClass("hidden");
            } else {
                $body.find(".atp-box [data-atp-action='next'],.atp-box [data-atp-action='prev']").removeClass("hidden");
            }
        }
        /* Remove all the XHR call  */
        if (options.xhrPool != null) {
            options.xhrPool.abort();
        }
        /**
         * Remove Previosuly running media
         */
        $body.find(".atp-box .media-cnt").removeClass('disp-c vmiddle').html("");
        $body.find(".atp-box .doc-cnt").html("");
        $body.find(".atp-box").removeClass("pdf");
        if (options.unsupported_files && options.unsupported_files.indexOf(extension) !== -1) {
            flag = "nopreview"; // NO I18N
        }
        if (!hasPreviewAvailable(element[0].dataset)) {
            flag = "nopreview"; // NO I18N
        }
        const downloadUrl = url;
        if(flag !== 'nopreview' && !external_link) { //SD-123983 fix
            url += url.includes("?") ? "&mode=view" : "?mode=view"; // NO I18N
        }
        /**  Switch the Preview Accoriding to the Flag  */
        switch (flag) {
            /** Load the Image TAG on the Media Content   */
            case "image": //NO I18N
                var nopreview = false;
                /* Show the loader for image loading */
                $body.find(".atp-box .loader-cnt").show();
                /*
                 * Load Image via Jquery
                 */
                var image = new Image();
                image.src = url;
                image.onload = function (response) {
                    $body.find(".atp-box .loader-cnt").hide();
                    if (response.response_status && response.response_status.status == "failed" && response.response_status.messages) {
                        showalert("failure", response.response_status.messages[0].message, "isAutoHide=false"); // NO I18N
                        cl_attach.close();
                        return false;
                    }
                    var img = jQuery(image);
                    img.css({
                        "max-width": "90vw", // NO I18N
                        "max-height": "79vh", // NO I18N
                    }).addClass("center-block");
                    $body.find(".atp-box .media-cnt").addClass("disp-c vmiddle").html(img).end().find('.atp-box [data-atp-action="print"]').show().end().find(".atp-box .media-cnt").show();
                    var is_ie = /MSIE|Trident/.test(window.navigator.userAgent);
                    var jq_doc = jQuery(document);
                    /*
                     * Not Load Zoom in/ Zoom Out Feature for IE11 && Image width / Height smaller than screen
                     * Reason :  cursor:zoom-in / cursor:zoom-out is not supported
                     * Moreinfo :  https://caniuse.com/#feat=css3-cursors-newer
                     */
                    if (!is_ie && (img.prop("naturalWidth") > jq_doc.width() || img.prop("naturalHeight") > jq_doc.height())) {
                        $body.find(".atp-box .media-cnt > img").off().on("click", function () {
                            var _this = $body.find(this);
                            $body.find(this).toggleClass("ful-zm").end().find(".atp-cntr").toggleClass("atp-zoom"); //No I18N
                            if ($body.find(this).hasClass("ful-zm")) {
                                var style = _this.attr("style");
                                _this.removeAttr("style").attr("data-style", style); // NO I18N
                            } else {
                                if(_this.attr('nonce') === undefined) {
                                    _this.attr('nonce', window.sdpNonce);
                                }
                                convertDataStyle(_this);
                            }
                        });
                    } else {
                        img.css("cursor", "default"); // NO I18N
                    }
                };
                image.onerror = function (e) {
                    element.attr("data-attach-flag", "nopreview"); // NO I18N
                    $body.find(".atp-box .loader-cnt").hide();
                };
                break;

            case "sdp_preview":
                        function XlsxPreview(iFrameDoc){
                            let curr_link_tags=["/style/sdp-design.css",`/style/${sdp_app.IS_SDP?"sdp":"ae"}-design-includes.css`]
                            let css_toload=` table a{pointer-events:none}.attachment-preview table{border-collapse:collapse;width:100%}.attachment-preview table td,.attachment-preview table th{border:1px solid #d9d9d9;text-align:left;padding:3px 5px}.attachment-preview .sdmenu-dd{top:inherit;bottom:40px}`;
                            let script_toload=["/scripts/thirdparty.js","/scripts/ui-utils.js","/scripts/sdp-design.js"];
                                let script_content= `
                                var responsetab = new ResponsiveTabs("#sheettabs");
                                if (jQuery("#sheettabs").find(".overflow-menu").length) {
                                responsetab.reArrangeTab();
                                }
                                jQuery(window).on("resize", function (e) {
                                responsetab.handleTabs();
                                });

                                jQuery("[id^=sheet_]").each((i,ele)=>{
                                  const curr_sheet=jQuery(ele);
                                  if(curr_sheet.find("table tr").length==0){
                                     curr_sheet.html('<div class="tc p10 mt50 ">No data to display</div>')
                                  }    
                                })
                                jQuery("#sheettabs").find("li").on("click",function(e){
                                    if(jQuery(this).hasClass('overflow-menu')){
                                        return;
                                    }
                                    jQuery("#sheettabs").find("li").removeClass("active");
                                    jQuery(this).addClass("active");
                                    new ResponsiveTabs("#sheettabs").reArrangeTab()
                                })`;
                                async function loadDynmaicScripts(){
                                        for (const src of script_toload) {
                                            await loadScript(src); // Wait for each script to load
                                        }
                                    let script = iFrameDoc.createElement('script');
                                    script.textContent = script_content;
                                    script.nonce = typeof sdpNonce != "undefined" ? sdpNonce : "rAnd0m";// No I18N
                                    iFrameDoc.body.appendChild(script);  // Dynamically created script gets executed   
                                }
                                async function loadScript(src){
                                    return new Promise(function(resolve, reject) {
                                        var script = iFrameDoc.createElement('script');
                                        script.src = `${src}?${sdp_app.BUILD_NUMBER}`;  // External script source
                                         // Append the script to the iframe's head or body
                                        iFrameDoc.body.appendChild(script);
                                        script.onload = function() {
                                            resolve();
                                        };
                                        script.onerror=()=>{
                                            reject();
                                        }
                                    })
                                }
                                curr_link_tags.map(css=>{
                                    var link = iFrameDoc.createElement('link');
                                    link.rel = 'stylesheet';  // Specify the relationship (stylesheet)
                                    link.href =  `${css}?${sdp_app.BUILD_NUMBER}`;  // URL of the CSS file
                                    link.type = 'text/css';  // Specify the type
                                    iFrameDoc.head.appendChild(link);
                                })
                                var style = iFrameDoc.createElement('style');
                                style.textContent = css_toload;
                                iFrameDoc.head.appendChild(style); 
                                loadDynmaicScripts();  
                        }
                var ajaxoptions = {
                    url: url,
                    dataType: "text",//117479 -- HTML/CSS/TXT file ajax call return proper output  
                    beforeSend: function () {
                        /** Show the Loading Bar */
                        $body.find(".atp-box .loader-cnt").show();
                        $body.find('[data-atp-action="print"]').hide(); // To prevent print before load
                    },
                    ignorefailuremessage:true,
                    success: function (response) {

                        /** Hide the Loading Bar */
                        $body.find(".atp-box .loader-cnt").hide();
                        if (response.response_status && response.response_status.status == "failed" && response.response_status.messages) {
                            showalert("failure", response.response_status.messages[0].message, "isAutoHide=false"); // NO I18N
                            cl_attach.close();
                            return false;
                        }
                        
                        try {
                            $body.find(".atp-box .doc-cnt").html('<iframe frameborder="0" src="" style="height:99%;width:100%" ></iframe>').show();
                            var iFrame = $body.find(".atp-box .doc-cnt iframe");
                            var iFrameDoc = iFrame[0].contentDocument || iFrame[0].contentWindow.document;
                            iFrameDoc.open();
                            iFrameDoc.write(DOMPurify.sanitize(response));
                            iFrameDoc.close();
                            switch (extension) {
                                case 'xlsx':
                                case 'xls':
                                case 'csv':
                                    XlsxPreview(iFrameDoc);
                                    break;
                            }        
                            } catch (err) {
                            $body.find(".atp-box .loader-cnt").hide();
                            element.attr("data-attach-flag", "nopreview"); // NO I18N
                            _self.show(element, options);
                        }
                    },
                    error: function (err,status) {
                      if(status=="abort") return;// To handle multiple clicks of attachment
                        /** Hide the Loading Bar */
                        $body.find(".atp-box .loader-cnt").hide();
                        element.attr("data-attach-flag", "nopreview"); // NO I18N
                        _self.show(element, options);
                    }
                };
                ajaxoptions = _self.getHeader(ajaxoptions);
                var xhr = sdpAjax(ajaxoptions);
                options.xhrPool = xhr;
                break;
            /** Load the No Preview DIV on the Media Content   */
            case "nopreview": //NO I18N
                $body.find(".atp-box .media-cnt").addClass('disp-c vmiddle').show().html('<div class="no-preview atp-tg m-center"><div class="vmiddle disp-c"><div> ' + translate("sdp.app.preview.notavailable") + ' </div><p class=""> <a href="' + downloadUrl + '" data-atp-action="download" class="btn btn-primary ">' + translate("sdp.common.download") + '</a> </p></div></div></div>').end().find(".atp-box [data-atp-action='print']").hide();

                break;
            /** Load Docs content by ajax call the url    */
            case "docs": //NO I18N
                var ajaxoptions = {
                    url: url,
                    dataType: "text",//117479 -- HTML/CSS/TXT file ajax call return proper output  
                    beforeSend: function () {
                        /** Show the Loading Bar */
                        $body.find(".atp-box .loader-cnt").show();
                    },
                    success: function (response) {
                        /** Hide the Loading Bar */
                        $body.find(".atp-box .loader-cnt").hide();
                        if (response.response_status && response.response_status.status == "failed" && response.response_status.messages) {
                            showalert("failure", response.response_status.messages[0].message, "isAutoHide=false"); // NO I18N
                            cl_attach.close();
                            return false;
                        }
                        if (["html", "xhtml", "htm"].indexOf(extension) !== -1) {
                            try {
                                $body.find(".atp-box .doc-cnt").html('<iframe sandbox="allow-same-origin" frameborder="0" src="" id="htmlPreview"></iframe>').show();

                                var iFrame = $body.find(".atp-box .doc-cnt iframe");
                                var iFrameDoc = iFrame[0].contentDocument || iFrame[0].contentWindow.document;
                                iFrameDoc.open();
                                iFrameDoc.write(response);
                                iFrameDoc.close();
                            } catch (err) {
                                $body.find(".atp-box .loader-cnt").hide();
                                element.attr("data-attach-flag", "nopreview"); // NO I18N
                                _self.show(element, options);
                            }
                        } else {
                            $body.find(".atp-box .loader-cnt").hide();
                            $body.find(".atp-box .doc-cnt").text(response).show();
                        }
                    },
                    error: function () {
                        /** Hide the Loading Bar */
                        $body.find(".atp-box .loader-cnt").hide();
                        element.attr("data-attach-flag", "nopreview"); // NO I18N
                        _self.show(element, options);
                    }
                };
                ajaxoptions = _self.getHeader(ajaxoptions);
                var xhr = sdpAjax(ajaxoptions);
                /** Append the Attachment on the DOC Content DIV */
                $body.find('.atp-box [data-atp-action="print"]').show();
                options.xhrPool && (options.xhrPool = xhr);
                break;
            case "pdf": //NO I18N
                var is_ie = /MSIE|Trident/.test(window.navigator.userAgent);
                $body.find('.atp-box [data-atp-action="print"]').hide();
                $body.find(".atp-box").addClass("pdf");
                if (is_ie) {
                    $body.find(".atp-box .loader-cnt").hide();
                    element.attr("data-attach-flag", "nopreview"); // NO I18N
                    _self.show(element, options);
                    return;
                } else {
                    $body.find(".atp-box .loader-cnt").show();
                    try {
                        var pdfUrl = url;
                        const $object = jQuery(`<object>`, {'class': 'fw'}).attr('data', pdfUrl).css({'height': '99%', 'width': $body.find(".atp-box .doc-cnt").width()});
                        const $embed = jQuery(`<embed>`, {'src': pdfUrl, 'type': 'application/pdf'});
                        $body.find(".atp-box .doc-cnt").html('').append($object.append($embed)).show();

                        $body.find(".atp-box .loader-cnt").hide();
                    } catch (error) {
                        $body.find(".atp-box .loader-cnt").hide();
                        element.attr("data-attach-flag", "nopreview"); // NO I18N
                        _self.show(element, options);
                        return;
                    }
                }
                break;
            case "video": //NO I18N
                /** Check Video Feature is Avaiable by the browser  */
                if (typeof document.createElement("video").canPlayType == "undefined") {
                    element.attr("data-attach-flag", "nopreview"); //NO I18N
                    options.show(element, options);
                    return false;
                } else {
                    /** Load the No Preview Content */
                    var videoMIME = "";
                    /** Switch the Different Type of Extension  */
                    switch (extension) {
                        case "mp4": //NO I18N
                            videoMIME = "video/mp4"; //NO I18N
                            break;
                        case "ogv": //NO I18N
                            videoMIME = "video/ogg"; //NO I18N
                            break;
                        case "webm": //NO I18N
                            videoMIME = "video/webm"; //NO I18N
                            break;
                    }
                    $body.find('.atp-box [data-atp-action="print"]').hide().end().find(".atp-box .media-cnt").show().html(' <video controls="controls"><source src="' + url + '" type="' + videoMIME + '"></source></video> '); //NO I18N
                }
                break;
            case "audio": //NO I18N
                /** Check Audio Feature is Avaiable by the browser  */
                if (typeof document.createElement("audio").canPlayType == "undefined") {
                    element.attr("data-attach-flag", "nopreview"); //NO I18N
                    _self.show(element, options);
                    return false;
                } else {
                    var audioMIME = "";
                    /** Switch the Different Type of Extension  */
                    switch (extension) {
                        case "mp3": //NO I18N
                            audioMIME = "audio/mpeg"; //NO I18N
                            break;
                        case "ogg": //NO I18N
                            audioMIME = "audio/ogg"; //NO I18N
                            break;
                        case "wav": //NO I18N
                            audioMIME = "audio/wav"; //NO I18N
                            break;
                    }
                    $body.find('.atp-box [data-atp-action="print"]').hide().end().find(".atp-box .media-cnt").show().html(' <audio controls="controls"><source src="' + url + '" type="' + audioMIME + '"></source></audio> '); //NO I18N
                }
                break;
        }

        $body.find(".atp-box [data-atp-el='count']").text(index + " / " + totalAttachment).end().find("[data-atp-action='download']").attr({ href: downloadUrl });
        const download = $body.find("[data-atp-action='download']").attr('data-inline-img', external_link); //NO I18N

        if (options.target == "img") {
            download.attr("target", "_blank"); //NO I18N
        } else {
            download.removeAttr("target"); //NO I18N
        }
    },
    /**
     * Method to get the Header based on the options available
     */
    getHeader: function (options) {
        var header = {};
        if (options.accept_od_compatible) {
            header = { 'Accept': 'vnd.manageengine.v3+json' };
        } else if (options.header) {
            header = { 'Accept': options.header };
        }
        return header;
    },
    /**
     * Method to print the attachment only for Image and Docs 
     * @param {String} flag type of the attachemnt 
     * @param {String} url url for the attachment
     */
    print: function (flag, url) {
        var $body = jQuery("body"); //NO I18N
        var height = screen.availHeight * 0.9;
        var width = screen.availWidth * 0.9;
        var winPrint = window.open("", "", "left=0,top=0,width=" + width + ",height=" + height + ",toolbar=0,scrollbars=0,status=0");
        var winPrintiframe;
        if (flag == "image") {
            /** If image the create a new window then append the image */
            var img = document.createElement("img");
            img.src = url;
            img.addEventListener('load', function (event) {
                var dataUrl = cl_attach.imgConvertCanvas(event.currentTarget);
                const $img = jQuery(`<img>`, {'src': `${dataUrl}`, 'class': 'h-auto'}).css({'max-width': '80vw'});
                jQuery(winPrint.document.body).html('').append($img)
            });
        }
        else if (flag == 'docs'  ) { //NO I18N
            var print_data;
            if ($body.find(".doc-cnt iframe").length) {   //NO I18N
                var iFrame = $body.find(".atp-box .doc-cnt iframe");  //NO I18N
                var iFrameDoc = iFrame[0].contentDocument || iFrame[0].contentWindow.document;
                print_data = iFrameDoc.getElementsByTagName("html")[0].innerHTML;   //NO I18N

                /** 107770 -- iframe sandbox skip script excusion in HTML file refer in attach preview ui  **/
                const $frame = jQuery(`<iframe>`, {'id': 'htmlframeprint', 'sandbox': 'allow-same-origin allow-modals', 'frameborder': 0}).css({'height': '99%', 'width': '100%'});
                jQuery(winPrint.document.body).html('').append($frame);

                var iFrame = jQuery(winPrint.document.body).find("iframe");
                var iFrameDoc = iFrame[0].contentDocument || iFrame[0].contentWindow.document;
                iFrameDoc.open();
                iFrameDoc.write('<pre>' + print_data + '</pre>');
                iFrameDoc.close();


                var winPrintiframe = winPrint;
                winPrint = winPrint.document.getElementById("htmlframeprint").contentWindow;
            } else {
                print_data = $body.find(".doc-cnt").html();   //NO I18N
                winPrint.document.body.innerHTML = '<pre>' + print_data + '</pre>'; //NO I18N
            }
        }
        setTimeout(function () {
            winPrint.focus();
            winPrint.addEventListener("afterprint", (event) => {winPrintiframe.close();});// To handle large files, binding events to close the window after dialog shows
            winPrint.print();
        }, 500);
        
    },
    /**
     * Print preview Image convert to Canvas and render to html 
     * @param {dom} img dom of the image
     * @returns canvas reference
     */
    imgConvertCanvas: function (img) {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Set width and height
        canvas.width = img.width;
        canvas.height = img.height;
        // Draw the image
        ctx.drawImage(img, 0, 0);
        return canvas.toDataURL('image/jpeg');
    },
    /**
     * Downloads a file as a blob using AJAX and triggers browser download
     * @param {Object} opt - Download options
     * @param {string} opt.url - URL to download the file from
     * @param {string} opt.filename - Desired filename for the downloaded file
     * @param {Object} [opt.list_info] - Optional list information for the request
     * @param {Function} [cb] - Optional callback function to execute after successful download
     * @returns {void}
     */
    blobdownload: function(opt, cb) {
        /**
         * Performs the AJAX request to download the file
         * @param {Object} param - Download options
         * @param {string} param.url - URL to download from
         * @param {Object} [param.list_info] - Optional list information
         */
        const defaults = {
            useClientFileName: true
        };

        opt = jQuery.extend({}, defaults, opt);

        let fileName = opt.filename;
        function downloadFileWithAjax(param) {
            var ajaxOptions = {
                url: param.url,
                ignorefailuremessage: true,
                xhrFields: {
                    responseType: 'blob'
                },
                success: function(data, status, xhr) {
                    const disposition = xhr.getResponseHeader('Content-Disposition');
                    if(!opt.useClientFileName) {
                        const filenameRegex = /filename\*?=([^']*'')?([^;]*)/; // Regex to get file name from Content-Disposition
                        const matches = filenameRegex.exec(disposition);
                        const fn = matches != null && matches[2];
                        if (fn) {
                            fileName = fn.replace(/['"]/g, ''); // Remove any extra quotes
                            fileName = decodeURIComponent(fileName); // Decode the filename
                        }
                    }
                    handleDownloadSuccess(data, xhr, param);
                },
                error: function(xhr, status, error) {
                    handleDownloadError(error);
                },
                complete: function(xhr, status, error) {
                    if (typeof cb === 'function') {
                        cb(xhr, status, error);
                    }
                },
                preAjaxCallback: function(e) {
                    delete e.contentType;
                    delete e.dataType
                    return e;
                }
            };

            // Add list info data if provided
            if (param.list_info) {
                ajaxOptions.data = sdpAjaxInputData(param.list_info);
            }
            sdpAjax(ajaxOptions);
        }

        /**
         * Handles successful file download
         * @param {Blob} data - The downloaded blob data
         * @param {XMLHttpRequest} xhr - The XHR object
         * @param {Object} param - Original download options
         */
        function handleDownloadSuccess(data, xhr, param) {
            // Create blob and download URL
            var blob = new Blob([data]);
            var url = window.URL.createObjectURL(blob);

            // Create and trigger download link
            var downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = fileName;
            
            // Append link, trigger download, and cleanup
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            window.URL.revokeObjectURL(url);
        }

        /**
         * Handles download errors
         * @param {Error} error - The error object
         */
        function handleDownloadError(error) {
            showalert('failure', translate('apicodes.4001'), 'isAutoHide=true'); // No I18N
        }

        // Start the download process
        downloadFileWithAjax(opt);
    }
};
