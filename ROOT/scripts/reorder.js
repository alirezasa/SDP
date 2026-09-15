/* $Id$ */
/**** Reorder Home Page ****/
var reorder = {
	isEnabled : false,
	needReload : false,
	applychangeEnable :null,

	init: function(){

		reorder.applychangeEnable = jQuery("#Reorderoption").find("button")
		reorder.applychangeEnable.prop("disabled", true);// NO I18N
		
	    jQuery('#applyChanges').on('click', function() {
	    	reorder.applyReorderChanges(true);
	    });
	    jQuery('#Reordercancel').on('click', function() {
	    	reorder.validateReorderCancel();
	    });
	    jQuery('#Reorderreset').on('click', function() {
	        Mousetrap.unbind('esc');// NO I18N
	        showconfirm(true,'title=' + getMessageForKey("sdp.common.reset") + ', message=' + getMessageForKey("sdp.requestcatalog.reorder.discard") + ', submitbutton=' + getMessageForKey("sdp.change.submission.yes") + ', cancelbutton=' + getMessageForKey("sdp.change.submission.no") + ', closebutton=yes, closeOnEscKey=yes', function(save) { // No I18N
	            if(save) {
	            	reorder.resetReorder();
	            }
	            Mousetrap.bind('esc', function (e) {
	            	reorder.validateReorderCancel();
	            });
	        });
	    });

	    jQuery(window).on('resize', function(){
	    	if(jQuery('.reorder-container').length > 0){
	    		if(jQuery('#_DIALOG_CONTENT').length == 0){
	    			jQuery('.reorder-container').height(jQuery(window).height() - jQuery('.reorder-container').offset().top-10);
	    		}else{
	    			if(jQuery('#reorderSection').length == 0){
	    				jQuery('.reorder-container').height(jQuery('#_DIALOG_CONTENT').height() - 110);//No i18N
	    			}else{
	    				jQuery('#reorderSection .reorder-container').height(jQuery('#_DIALOG_CONTENT').height() - 110);//No i18N
	    			}
	    		}
	    	}
	      });

	    reorder.showReorderMsg('#reorderSection .request-catalog-inner', '.reorder-input-alert'); // No I18N

	    jQuery('#reorderSection .left .category-sorting .sdp-glyph').on('click', function() {
	    	reorder.ascendingdescendingmn(jQuery('#reorderSection .col-xs-3.left'));
	    });
	    jQuery('#reorderSection .right .category-sorting .sdp-glyph').on('click', function() {
	    	reorder.ascendingdescendingmn(jQuery('#reorderSection .col-xs-9.right'));
	    });
	    jQuery(window).trigger('resize');
	},
	setIsEnabled: function(value){
		reorder.isEnabled = value;
	},
	getIsEnabled: function(){
		return reorder.isEnabled;
	},
	setNeedReload: function(value){
		reorder.needReload = value;
	},
	getNeedReload: function(){
		return reorder.needReload;
	},
	enableReorder: function(){
	    jQuery('[data-name=mainContainer]').reordermnfn({"reordersortable":"disable","checklimit":10}); // No I18N
	    jQuery('[data-name=secondmainContainer]').reordermnfn({"reordersortable":"disable","checklimit":14}); // No I18N
	    jQuery('#reorderSection .left li, #reorderSection .right li').addClass('cursor-drag');
	    jQuery('#reorderSection .right').addClass('reorderenable');
	    jQuery('[data-name=mainContainer]').sortable('enable'); // No I18N
	    jQuery('[data-name=secondmainContainer]').sortable('enable'); // No I18N
	    Mousetrap.unbind('esc');// NO I18N
	    reorder.applychangeEnable.prop("disabled", true); // No I18N
	    Mousetrap.bind('esc', function (e) {
	    	reorder.validateReorderCancel();
	    });
	},
	applyReorderChanges : function(needToEnableReorder){
	    var data = [];
	    var datafield;
	    var categoryMap = {}, templateMap = {};
	    var selectedcategory = jQuery('#parentCategory').val();
	    jQuery('#reorderSection .left .reorder-container li').each(function(key, value) {
	        var id = '';
	        var name = '';
	        var comments =  jQuery(this).attr('title');
	        var imagepath = '';
	        var fieldDefault = [];
	        var fielddata;
	        id = jQuery(this).find('.categoryId').text();
	        jQuery('#reorderSection #template-list-' + id + ' .reorder-container li').each(function(key, value) {
	            var templateindex = key + 1;
	            var templateid = jQuery(this).find('.templateId').text();
	            var templatename = jQuery(this).find('.template-catalog-title #subject').text();
	            var templatecomments = jQuery(this).find('.template-catalog-title #desc').text();
	            var servicetemplatelength = jQuery(this).find('.bgcircle .service-req-icon').length;
	            if (servicetemplatelength == 1) {
	                var servicetemplate = true;
	            } else {
	                var servicetemplate = false;
	            }
	            fielddata = {
	                "id": templateid, // No I18N
	                "index": templateindex, // No I18N
	                'name': templatename, // No I18N
	                "comments": templatecomments, // No I18N
	                "is_service_template": servicetemplate // No I18N
	            }
	            fieldDefault.push(fielddata);
	            if(id == selectedcategory) {
	                templateMap[templateid] = templateindex;
	            } 
	        });
	        var categoryindex = key + 1;
	        name = jQuery(this).find('.template-catalog-title').text();
	        var src = jQuery(this).find('.disp-c img').attr('src');
	        var imagepathsrc = '{"content-url":"' + src +'"}';  // No I18N
	        imagepath = JSON.parse(imagepathsrc);
	        datafield = {
	            "id": id, // No I18N
	            "index": categoryindex, // No I18N
	            "name": name, // No I18N
	            "icon_name": imagepath, // No I18N
	            "comments": comments, // No I18N
	            "request_templates": fieldDefault // No I18N
	        }
	        categoryMap[id] = categoryindex;
	        data.push(datafield);
	    });
	    var service_categories = {
	        "service_categories": data // No I18N
	    }
	    
	    var reorderURL = "/servlet/SDAjaxServlet?action=organize_request_catalog"; // No I18N
	    if(categoryMap != null) {
	      reorderURL += "&categorySortOrder=";// No I18N
	      reorderURL +=  (typeof sdpToJSON != 'undefined') ? sdpToJSON(categoryMap) : JSON.stringify(categoryMap) ; // No I18N
	    }
	    if(templateMap != null) {
	      reorderURL += "&templateSortOrder=";// No I18N
	      reorderURL +=  (typeof sdpToJSON != 'undefined') ? sdpToJSON(templateMap) : JSON.stringify(templateMap) ; // No I18N
	    }
	    if(selectedcategory != null) {
	      reorderURL += "&serviceCategoryId=" + selectedcategory; // No I18N
	    }

	    jQuery.ajax({
	        url: encodeURI(reorderURL),
            type:'POST', // No I18N
            data:getCSRFParamURL(),
	        async: false,
	        success: function(response) {
	        	reorder.setNeedReload(true);
	            showalert('success', getMessageForKey('sdp.requestcatalog.reorder.success'), 'isAutoHide=true,delay=2'); // No I18N
	            var categoryId = jQuery('#parentCategory').val();
	            refreshCatalog(service_categories);
	            LoadRequestCatalog();
	            jQuery('#reorderSection #categoryList_' + categoryId).trigger('click');
	            jQuery('[data-name=mainContainer]').reordermnfn({"reordersortable":"enable","checklimit":10}); // No I18N
	            jQuery('[data-name=secondmainContainer]').reordermnfn({"reordersortable":"enable","checklimit":14}); // No I18N
	            if(needToEnableReorder){
	            	reorder.enableReorder();
	            }else{
	            	reorder.reorderCancel();
	            }
	        },
	        error: function(response) {
	          showalert('failure', getMessageForKey('sdp.requestcatalog.reorder.failed'), 'isAutoHide=true,delay=2'); // No I18N           
	        }
	    });
	},
	resetReorder: function (){
		var categoryId = jQuery('#parentCategory').val();
        LoadRequestCatalog();
        jQuery('#reorderSection #categoryList_' + categoryId).trigger('click');
        jQuery('[data-name=mainContainer]').reordermnfn({"reordersortable":"enable","checklimit":10}); // No I18N
        jQuery('[data-name=secondmainContainer]').reordermnfn({"reordersortable":"enable","checklimit":14}); // No I18N
        reorder.enableReorder();
        reorder.applychangeEnable.prop("disabled", true); // No I18N
    },
	validateReorderCancel: function (){
        if(jQuery('#reorderSection .left').find('.reorderhiglite').length != 0 || jQuery('#reorderSection .right').find('.reorderhiglite').length != 0) {
            Mousetrap.unbind('esc');// NO I18N
            showconfirm(true,'title=' + getMessageForKey("sdp.requestcatalog.reorder.save.title") + ', message=' + getMessageForKey("sdp.requestcatalog.reorder.save") + ', submitbutton=' + getMessageForKey("sdp.common.save") + ',submitbutton2='+getMessageForKey("sdp.admin.requesttemplate.request.discard") +' ,cancelbutton=' + getMessageForKey("sdp.common.cancel") + ', closebutton=yes, closeOnEscKey=yes', function(save, button) { // No I18N
                if(save){
                    if(button == 'submitButton'){
                    	reorder.applyReorderChanges(false);

                    }else{
                    	reorder.reorderCancel();
                    }
                }else{
                	Mousetrap.bind('esc', function (e) {
                		reorder.validateReorderCancel();
                	});            	
                }
            });
        }else{
        	reorder.reorderCancel();
        }
        if(jQuery("#_DIALOG_LAYER").css('visibility') != 'visible'){
            jQuery("#FreezeLayer").css('z-index','') // No I18N
        }
    },
    reorderCancel: function (){
    	fromReorder = false;
        closeDialog();
        if(reorder.getNeedReload()){
        	setTimeout(function(){ window.location.reload(); }, 200);
        }
    },
    showReorderMsg: function(list, msgBox){
    	    var listDiv = jQuery(list); //.request-catalog-inner
    	    var msgBoxDiv = jQuery(msgBox); //.reorder-input-alert

    	    jQuery(document).on({
    	        'focus': function() { // No I18N
    	            if (!jQuery(msgBox + ' input').is(':checked')) {
    	                var dialogOff = jQuery('#_DIALOG_LAYER').offset();
    	                var left = jQuery(this).offset().left - 30;
    	                var top = jQuery(this).offset().top - msgBoxDiv.outerHeight() - 10;
    	                if(dialogOff != undefined){
    	                    left = left - dialogOff.left;
    	                    top = top - dialogOff.top;
    	                }
    	                msgBoxDiv.css({
    	                    'left': left, // No I18N
    	                    'top': top // No I18N
    	                }).show();
    	            }
    	            msgBoxDiv.removeClass('active');
    	            setTimeout(function() {
    	                msgBoxDiv.addClass('active');
    	            }, 200);
    	        },
    	        'blur': function() { // No I18N
    	            if (!msgBoxDiv.hasClass('active')) {
    	                msgBoxDiv.hide();
    	            }
    	        }
    	    }, list + ' input.form-control'); // No I18N

    	    jQuery(document).on('click', msgBox + ' input', function(event) {
    	        event.stopPropagation();
    	        msgBoxDiv.removeClass('active').hide();
    	    });

    	    jQuery(document).on('click', function() {
    	        if (msgBoxDiv.hasClass('active')) {
    	            msgBoxDiv.hide();
    	        }
    	    });
    },
    updateOrderAscend: function (data){ // Number for each input
    	data.each(function(index) {
            jQuery(this).find('[data-name=reorderlist]:not(.hide)').each(function(index) {
                jQuery(this).find('input[data-name=reorderformcontrol]').val(index + 1);
            });
        });
    },
    ascendingdescending: function(dataname, sortDescending){
        var sort = this;
        var list = dataname.find('.reorder-container');
        //var listLi = dataname.find('li', list);
        var listLi = dataname.find('li:visible', list);
        var parentList = jQuery(listLi[0]).parent();
        listLi.sort(function(a, b) {
            var keyA = jQuery(a).find('[data-name=namelist]').text().toLowerCase();;
            var keyB = jQuery(b).find('[data-name=namelist]').text().toLowerCase();;
            if (sortDescending) {
            	return (keyA > keyB) ? -1 : (keyA < keyB) ? 1 : 0;
            } else {
            	return (keyA < keyB) ? -1 : (keyA > keyB) ? 1 : 0;
            }
        });
        jQuery.each(listLi, function(index, row) {
            //list.append(row);
            parentList.append(row);
        });
        reorder.applychangeEnable.prop("disabled", false); // No I18N
    },
    ascendingdescendingmn: function(dataname){
        if (dataname.find('[data-name=sorticon] .sdp-glyph').hasClass('sdp-glyph-sort-up')) {
            dataname.find('[data-name=sorticon] .sdp-glyph').removeClass('sdp-glyph-sort-up');
            dataname.find('[data-name=sorticon] .sdp-glyph').addClass('sdp-glyph-sort-down');
            dataname.find('[data-name=sorticon] .sdp-glyph').attr('title', getMessageForKey('sdp.purchase.request.listview.sortby.asc'));
            sortDescending = true;
            reorder.ascendingdescending(dataname, sortDescending);
        } else {
            dataname.find('[data-name=sorticon] .sdp-glyph').removeClass('sdp-glyph-sort-down');
            dataname.find('[data-name=sorticon] .sdp-glyph').addClass('sdp-glyph-sort-up');
            dataname.find('[data-name=sorticon] .sdp-glyph').attr('title', getMessageForKey('sdp.purchase.request.listview.sortby.desc'));
            sortDescending = false;
            reorder.ascendingdescending(dataname, sortDescending)
        }
        reorder.updateOrderAscend(dataname.find('.reorder-container'));
    },
    showTemplatesPopup: function(module){
        var height = jQuery(window).height()-100;
        showURLInDialog('/RequestTemplatesList.do?module='+module+'&fromReorder=true','modal=yes,closeButton=no,width=1200,height=700,position=absmiddle,closeOnEscKey=no',function(){ // No I18N  
            jQuery("#FreezeLayer").css('z-index','999'); // No I18N
        });
    }
};// end of reorder

jQuery(document).ready(function() {
	reorder.init();
});

(function() {
    jQuery.fn.reordermnfn = function(options) {
        /****
          1. Use any container for reorder and click button must inside that container
          2. Segment element must have classname "reorder-container"
          3. Sortable element have attr data-name="reorderlist"
          4. Input element have attr data-name="reorderformcontrol"
          5. Reorder button have id attr id="Reorderbtn"
               if reordersortable:disable
               else reordersortable:enable
               it could be different from each template so some other action handle by your's
          6. Apply button attr id="Reordersave"
          7. Cancel button attr id="Reordercancel"
        ****/
        var data = this;
        var dataoptions = jQuery.extend({
            "reordersortable": null, // No I18N
            "checklimit": null // No I18N
        }, options);
        var canceldata;

        function updateOrder(dataname) { // Number for each input
            data.each(function(index) {
                jQuery(this).find('[data-name=reorderlist]:not(.hide)').each(function(index) {
                    jQuery(this).find('input[data-name=reorderformcontrol]').val(index + 1);
                });
            });
        }

        function sortablefn(dataname) {
            dataname.sortable({ // Sortable funtion
                placeholder: "move-state-highlight", // No I18N
                helper: 'clone', // No I18N
                start: function(e, ui) {
                    ui.placeholder.height(ui.item.height());
                },
                axis:'y',// No I18N
                change: function(event, ui) {
                    reorder.applychangeEnable.prop("disabled", false); // No I18N
                },
                stop: function(event, ui) {
                	var oldIndex = jQuery(ui.item).find('input[data-name=reorderformcontrol]').val();
                    updateOrder(this);
                    var newIndex = jQuery(ui.item).find('input[data-name=reorderformcontrol]').val();
                    if(oldIndex != newIndex){
                    	jQuery('.reorder-container').find('[style*="table"]').addClass('reorderhiglite');
                    }else if(jQuery('.left').find('.reorderhiglite').length == 0 && jQuery('.right').find('.reorderhiglite').length == 0){
                    	reorder.applychangeEnable.prop("disabled", true); // No I18N
                    }
                }
            });
        }

        function reorderkeypressfn(dataname) {
            dataname.on('keypress', "[data-name=reorderlist] input[data-name=reorderformcontrol]", function(e) { //Use only add data-name="reorderformcontrol" in input
                var val = jQuery(this).val();
                if ((val != '') && (e.keyCode == 13) && (!isNaN(val))) {
                    var elm = jQuery(this).closest('[data-name=reorderlist]:visible'); // No I18N
                    var vl = elm.index();
                    val = (val > vl) ? val : val - 1;
                    /*if (dataname.find('[data-name=reorderlist].hide').length == 1) {
                        //val = (val >= vl) ? val : val-1;
                    }*/
                    if (val < 0) {
                        val = 0;
                    }
                    var elementSize = dataname.find('[data-name=reorderlist]:visible').length;
                    var position = vl + 1;
                    if(position == val || (position == 1 && val <=1) || (position == elementSize && val>=elementSize)){
                    	updateOrder(dataname);
                    }else{
                        if (val >= elementSize) {
                            val = elementSize;
                            dataname.find('[data-name=reorderlist]:visible').eq(val - 1).after(elm.clone());
                            dataname.find('[data-name=reorderlist]:visible').eq(val).addClass('reorderhiglite');
                            val = val - 1;
                        } else {
                        	dataname.find('[data-name=reorderlist]:visible').eq(val).before(elm.clone());
                        	dataname.find('[data-name=reorderlist]:visible').eq(val).addClass('reorderhiglite');
                        }
                        elm.remove();
                        dataname.animate({
                            scrollTop: dataname.find('.reorderhiglite').position().top - dataname.find('.reorderhiglite').height() - 20 //(val-1)*60
                        }, 500);
                        setTimeout(function() {
                            dataname.closest('.left').find('[data-name=reorderlist]:visible').removeClass('reorderhiglite') // No I18N
                        }, 900);
                        updateOrder(dataname);
                        jQuery('div.reorder-input-alert').fadeOut('medium'); // No I18N
                        reorder.applychangeEnable.prop("disabled", false); // No I18N
                    }
                }
            });
        }
        if (dataoptions.reordersortable != null) {
            reorderkeypressfn(data); //Create sortable function
            sortablefn(data); //Create sortable function
            updateOrder();
            if (dataoptions.reordersortable == 'enable') {
                data.sortable('enable'); // No I18N
            }
            if (dataoptions.reordersortable == 'disable') {
                data.sortable('disable'); // No I18N
            }
        }
        if (dataoptions.checklimit != null) {
            if (dataoptions.checklimit) {
                if (data.find('[data-name=reorderlist]:not(.hide)').length <= dataoptions.checklimit) {
                    data.find('[data-name=reorderlist]').removeClass('checklimit');
                } else {
                    data.find('[data-name=reorderlist]').addClass('checklimit');
                }
            }
            updateOrder();
        }
        if (dataoptions.checklimit == null) {
            data.find('[data-name=reorderlist]').removeClass('checklimit');
            updateOrder();
        }
    }
})(jQuery);
