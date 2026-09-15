jQuery(() => {
    const $whats_new = {
        uuid : "",
        instance : null,
        tour : "",
        init: function(){
            $whats_new.tour = sdp_user.whatsnew_latest;
            jQuery('body').append(`<div id="whatsnew"></div>`);
            sdpAjax({
                url:`/servlet/AJaxServlet?action=whats_new&version=${$whats_new.tour}`,
                method:"GET",// NO I18N
                success:function(data){
                    let slides = data.slides;
                    let slide_count = 0;
                    slides.forEach(function(a) {
                        if(a.hasOwnProperty("data")){
                            slide_count += a.data.length
                        }
                        else{
                            slide_count+=1;
                        }
                    })
                    if(data.lastSlide > slide_count){data.lastSlide = slide_count-1}
                    var HCInstance = new HelpTourComponent({
                        data:slides, // Your array of slide data
                        progressbar: true,
                        arrows:true,
                        sidebar: true,
                        title: translate("sdp.common.whatsnew"),
                        navigateIcons: true,
                        currentSlideIndex:data.lastSlide,
                        cbAfterInit:$whats_new.reRender,
                        cbAfterRender:$whats_new.reRender,
                        triggerButton:jQuery("#whatsnew"), // NO I18N
                        staticNav : true,
                        group: true,
                        imagePreview: true,
                        iconClass: 'new-feature', // NO I18N
                        responsive: true,
                        onSlideChange:function(index){
                            $whats_new.updateSlideProgress(index);
                        },
                        onClose:function(index){
                            $whats_new.updateLastSlide(index);
                        },
                        onFinish:function(index){}
                    });
                    HCInstance.open();
                    $whats_new.uuid = `#hv-${HCInstance.uuid}`;
                    $whats_new.instance = HCInstance;
                }
            })
        },
        updateSlideProgress : function(index){
            sdpAjax({
                url:`/servlet/AJaxServlet?action=whatsnew_lastslide&slide=${index}&version=${$whats_new.tour}`,
                type:"POST",// NO I18N
                success:function(data){}});
        },
        updateLastSlide:function(index){
            sdpAjax({
                url:`/servlet/AJaxServlet?action=whatsnew_lastslide&slide=${index}&version=${$whats_new.tour}`,
                type:"POST",// NO I18N
                success:function(data){}
            });
            jQuery("#whatsnew").remove();
            jQuery($whats_new.uuid).remove();
            $whats_new.uuid = "";
            $whats_new.instance = null;
            $whats_new.tour ="";
        },
        changeTour:function(version){
            $whats_new.tour = version;
            sdpAjax({
                url:`/servlet/AJaxServlet?action=whats_new&version=${$whats_new.tour}`,
                method:"GET",// NO I18N
                success:function(data){
                    let slides = data.slides;
                    $whats_new.instance.options.data = slides;
                    $whats_new.instance.options.currentSlideIndex = data.lastSlide;
                    $whats_new.instance.reRender($whats_new.instance.options);
                }});
        },
        reRender:function(selfComp){
            let drop = `<label for="versions_dd" class="text-color1">${translate("sdp.common.version")}</label><div id="versions_dd" class="form-control ml15" style="width: 96px;"/>`;
			let url= $whats_new.getReadMeLink();
            let notes = `<a class="mr10 text-color1" href="`+url+`#${$whats_new.tour}" target="_blank" rel="noopener noreferrer"><span>${translate("sdp.common.release.notes")}</span></a><span class="vbar opac5 mr10"></span>`;
            let $component = jQuery('#hv-'+selfComp.uuid);
            $component.find('.top-header .fl').append(drop);
            $component.find('.top-header .fr').prepend(notes);
            let versions =[];
            sdp_user.whatsnew_tours.forEach(function(a) {
                let tmp ={};
                tmp.text = a;
                tmp.id = Number(a)
                versions.push(tmp)
            })
            $component.find("#versions_dd").select2({
                data: versions,
                value: parseInt($whats_new.tour)
            }).on('change', function (e) {
                if(e.added.text != e.removed.text){
                    $whats_new.changeTour(e.val);
                }
            }).select2("data", { // NO I18N
                id: Number($whats_new.tour),
                text: $whats_new.tour
            });
        },
		getReadMeLink:function(){//MSP and scp read me url, used to redirect release notes
			let url = "https://www.manageengine.com/products/service-desk/on-premises/readme.html"; // NO I18N
			if(checkIfMSP()){
				url="https://www.manageengine.com/products/service-desk-msp/readme.html";// NO I18N 
			}else if(checkIfSCP()){
				url="https://www.manageengine.com/products/support-center/readme.html"; // NO I18N
			}
			return url;
		}
		
    }
    $whats_new.init();
});