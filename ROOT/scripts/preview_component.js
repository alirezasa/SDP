/* $Id $ */

/** Previewer component */
var $Previewer = (function () {
    var flags = [];
    var preview_mode = "slider";  //No I18N
    var options = {};
    
    return {
        setFlag: function(property, context, defaultval) {
            context = context || window;
            if(typeof context[property] !== "undefined") {
                flags.push({
                    prop: property,
                    value: context[property],
                    context: context
                });
                context[property] = defaultval;
            }
        },

        resetFlags: function() {
            for(var i = 0, len = flags.length; i < len; i++) {
                flags[i].context[flags[i].property] = flags[i].value;
            }
            flags = [];
        },

        showPreview: function(config, event) {
            if(event) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
            this.reset();

            options = config;
            if(!options.url || !options.container) {
                throw new Error("URL / Container is missing"); //No I18N
                return;
            }
            var width = options && options.width ? options.width : "60%"; //No I18N
            var rpanel = options && options.rpanel ? true : false;
			if(options.beforeLoad && typeof options.beforeLoad === "function") {
				options.beforeLoad();
            }
            let frz_index = options.freeze_index ? options.freeze_index : '';
			$previewComponent.load(options.url,'',options.width,'',options.afterLoad,options.container,true,frz_index,'hideHeader:true,closecallback:$Previewer.closePreview_previewcb');
			
            jQuery(window).on("resize.previewer", function() {
                var height = jQuery("#sdp-chat-bar").length > 0 ? jQuery(window).height() - 28 : jQuery(window).height();   //No I18N
                jQuery("#freeze-layer, #" + options.container).css("height", height + "px");    //No I18n
            });
        },

        closePreview_previewcb: function() {
            this.resetFlags();
            if(options.onClose && typeof options.onClose === "function") {
                options.onClose();
            }
            jQuery(window).off("resize.previewer"); //No I18N
		},
        closePreview: function() {
			$previewComponent.closePreview(options.container);
        },

        reset: function() {
            flags = [];
            preview_mode = "slider";  //No I18N
            options = {};
        }
    };
})();

var $RFPreview = (function () {
    var defaults = null;
    var existingVals = {};

    function onbeforeload() {
        // onbefore handler
        var copyData = function(source, target, key) {
            if(source[ key ] && ( source[ key ].constructor === Object || source[ key ].constructor === Array )) {
                target[ key ] = JSON.parse(sdpToJSON( source[ key ] ));
            } else {
                target[ key ] = source[ key ];
            }
        };
        var varList = ["req_module", "woID", "templateID"]; //No I18N
        /** cloning the current $se object */
        existingVals.$se = jQuery.extend(true, {}, $se);;

        for(var i = 0, len = varList.length; i < len; i++) {
            if(typeof window[ varList[i] ] !== "undefined") {
                copyData( window, existingVals, varList[i] );
            }
        }
        /** resetting $se to the default values */
        if(window.req_details !== undefined) {
            $req && $req.common && $req.common.resetFAFRProps();
        }
    }

    function onafterload() {
        // onafter handler
        if(defaults && typeof $req !== "undefined" && $req.form) {
            $req.form.afterLoadCallback = function() {
                for(var field in defaults) {
                    if(!$rf.fields[ field ] || (field === "requester" && $rf.fields.values.requester)) {
                        continue;
                    }
                    var value = defaults[ field ] && defaults[ field ].hasOwnProperty("content") ? defaults[ field ].content : defaults[ field ];   //No I18N
                    /** When the template have default group and don't  have any site, then the site will came as {} */
                    if(field === "site" && jQuery.isEmptyObject(value)){
                      value = null;
                    } else if(field === "site" && value.id == "-1") { //No I18N
                      value = $rf.fields[field].hasOwnProperty("allowedValues") ? null : "-1"; //No I18N
                    }
                    if (window.isMSP && field === "site") {
                        if (value === null) {
                            // when there's no site to be set by default, do not set null for MSP as it will not set any site.
                            // In this case, the 1st available site is loaded by default
                            continue;
                        } else {
                            $req.mspform.getSiteData(value);
                        }
                    }
                    $rf.setFieldValue(field, value);
                    if(field === "requester") {
                        jQuery($rf.fields.requester.element).select2("close");  //No I18N
                    }
					//setting space data in request form 
					try{
						if(field=="space"){
							$rf.setFieldValue("space",[value[0].id]); //No I18N
							$rf.disableField('space'); //No I18N
						}
					}
					catch(e){
					}
                }
            };
        }
    }

    function onclose() {
        // onclose handler
        window.minpreview = undefined;
        window.req_form = undefined;
        window.$rf = undefined;

        for(var key in existingVals) {
            if(key === undefined || key === "dom" || key === "formObject") {
                continue;
            }
            window[ key ] = existingVals[ key ];
        }
        existingVals = {};
		try{
		if(defaults){
			defaults=null;
		}
		}
		catch(e){
		}
    }

    return {
        show: function(id, isnewform, event, defaultData,templateid,is_from, config={}) {
            if(typeof $rf !== "undefined" && !$rf.is_destroyed) {
                throw new Error("Request form is already instantiated in this web page.");  //No I18N
            }
            var url = "/WorkOrder.do?"; //No I18N
            if(isnewform || !id) {
                url += "woMode=newWO";  //No I18N
                if(id) {
                  url += "&reqTemplate=" + id;  //No I18N
                }
            } else {
                url += "woMode=editWO&woID=" + id;  //No I18N
            }
            url += "&minpreview=true"; //No I18N
			if(templateid){
				url += "&reqTemplate="+templateid; //No I18N
			}
			if(is_from){
				url += "&"+is_from; //No I18N
			}	
			if(defaultData&&defaultData.space&&defaultData.space[0]&&defaultData.space[0].id){
				url += "&spaceID="+defaultData.space[0].id; //No I18N
			}				
            defaults = defaultData || null;
            var options = {
                url: url,
                container: "request-form-dialog", //No I18N
                width: "75%", //No I18N
                beforeLoad: onbeforeload,
                afterLoad: onafterload,
                onClose: onclose
            };
            options = jQuery.extend({}, options, config);
            $Previewer.showPreview(options, event);
        },
        close: function() {
            $Previewer.closePreview();
        }
    };
})();
/*
This Component is used to preview the request in Ember and Non-Ember Pages.
*/

var $ReqPreview = (function () {
    var flags = [];
    var close_dialog_container = null;

    function setFlag(property, context, defaultval) {
        context = context || window;
        if(typeof context[property] !== "undefined") {
            flags.push({
                prop: property,
                value: context[property],
                context: context
            });
            context[property] = defaultval;
        }
    };

    function resetFlags() {
        for(var i = 0, len = flags.length; i < len; i++) {
            flags[i].context[flags[i].property] = flags[i].value;
        }
        flags = [];
    }
    
    return {
        options: {//for getting preview open or not check in parent node
			is_open: false,
		},
        afterloadRequestPreview_cb: function(id) {
			var iframe = jQuery(id).contents();
			iframe.on("click","#back_to_list",function(e){
				  e.preventDefault();
				  parent.$ReqPreview.closeRequestPreview('#req-details-preview'); // NO I18N
			});
			iframe.find("#content-inner").css("min-width", 800); // NO I18N
		},
        showRequestPreview: function(id, options, event) {
            if(event) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
			this.options.is_open = true;
            var width = options && options.width ? options.width : "60%"; //No I18N
            var from = options && options.from ? "&from="+options.from : ""; //No I18N /** Check request details page where should come from(dashboard|admin|msteams|cf_request|merge|link_request|maintenance) **/
			var url = '/WorkOrder.do?woMode=viewWO&woID='+id+'&noheader=true&externalframe=true'+from; //No I18N
			
			if(!close_dialog_container && jQuery("#wo-details-form").length) { //No I18N
                close_dialog_container = jQuery("#wo-details-form").html(); //No I18N
            }
			$previewComponent.load(url,'',width,'',this.afterloadRequestPreview_cb,'req-details-preview',false,'','hideHeader:true,closecallback:parent.$ReqPreview.closeRequestPreview_compcb');
			window.previewID = id;
            window.widgetID = jQuery(event.target).parents("li[data-widgetid]").data("widgetid");
        },

        closeRequestPreview_compcb: function(selector) {
			jQuery('#detailview').html('').addClass('hide');
			window.req_details = undefined;	
			resetFlags();
			jQuery("#wo-details-form").html(close_dialog_container);  //No I18N
			if(!close_dialog_container && !!window.close_dialog_container) {
			  jQuery("#wo-details-form").html(window.close_dialog_container);  //No I18N
			}
			$req.details.updateCollaborationCount(window.previewID);
			window.previewID = undefined;
			try {
			  if(!!window.top.requestListViews && !!window.top.requestListViews.kan_col_id) {   
				window.top.requestListViews.kan_col_id = null;
			  }
			} catch (error) {}
            if(window.widgetID) {
                jQuery(`.gridsterul li[data-widgetid=${window.widgetID}]`).find("#instantRefresh").trigger("click"); //No I18N
                delete window.widgetID;
            }
		},
        closeRequestPreview: function(selector) {
			var _self = this;
            if(!selector){
              selector = "#detailview"; // NO I18N
            }
			if(selector == "#detailview") {
                var animDuration = 350;
                typeof(sdp_user.CLIENT_CONF.Accessibility) != 'undefined' && (sdp_user.CLIENT_CONF.Accessibility.animation == true) ? animDuration = 10 : animDuration = 350 ; // 128134
				jQuery(selector).animate({right: "-100%"}, animDuration, "swing", function() {    //No I18N
					jQuery("#freeze-layer ,#req-details-preview").remove(); //No I18N
					_self.closeRequestPreview_compcb(selector)
				});
			} else {
				$previewComponent.closePreview(selector.replace("#",""));
			}
			this.options.is_open = false;
        }
    };

})();
/**
 * List view popup rendering
 * @param {object} options - Contains information to be used after successful dialog open
 * options --> titleBarFilters - Details of filters to be shown & its data
 * Few widgets have two filters (say, seriesFilter & itemFilter), while others have only one
 * options.titleBarFilters contains data of the above filters, their labels, respective URL criteria.
 */
var listview_popup = {
  title: "",
  render:function(url,event_or_title, options){
      if (url) {
          if (!jQuery("#dynamiclistview").length) {
            jQuery('body').append("<div id='dynamiclistview'>"+ajaxBar()+"<iframe name='dynamicrlv' class='fw fh' id='dynamicrlv' target='_blank' src='about:blank' frameborder='0'></iframe></div>"); //NO I18N
          }
          var height = parseInt(jQuery(window).height() - 30, 10);
          var width = parseInt(jQuery(window).width()- 70, 10);
          
        var title = "";
        if(event_or_title) {
          if(typeof event_or_title !== "string"){ //No I18N
            var module = jQuery(event_or_title.currentTarget).attr("data-module"); //No I18N
            title = module ? jQuery(event_or_title.currentTarget).attr("data-module-title") : jQuery(event_or_title).closest(".widget-bg").find("select").val(); //NO I18N
          } else {
            title = event_or_title;
          }
        }
          this.title = title;
          // var title = typeof event_or_title == "string" ? event_or_title : jQuery(event_or_title).closest(".widget-bg").find(".widgets-hdr-txt").text(); //NO I18N
          var listviewDialog = jQuery("#dynamiclistview").dialog({
              title: title,
              height: height,
              width: width,
              position: { my: "center top", at: "center top+0", of: window }, //NO I18N
              modal: true,
              /**
               * Using this class to initialize a tooltip.
               */
              dialogClass : "dynamiclistview",
              open: function(e, u){
                // Add tooltip to title bar if title overflows
                if (jQuery(this).parent().find(".ui-dialog-title")[0].scrollWidth > jQuery(this).parent().find(".ui-dialog-title")[0].offsetWidth) {
                    jQuery(this).parent().find(".ui-dialog-title").attr("rel", "uitip").attr("title", title);
                }

                jQuery("#dynamicrlv").attr("src", url+"");
                jQuery("#dynamicrlv").load(function () {
                    jQuery("#dynamiclistview").find(".loading1").hide();
                });
                  
                /* To render popup filters for dashboard widgets in dialog's title bar */
                // Function to make label for filters
                var makeFilterLabel = function (labelId, labelName) {
                    return '<label for="'+labelId+'" class="fs13">' + labelName + '</label><input type="text" id="'+labelId+'" data-id="'+labelId+'" class="form-control select2-hidden-accessible" tabindex="-1" aria-hidden="true">';
                };
                if (options && options.titleBarFilters) {
                    var isSeriesFilterNeeded = options.titleBarFilters.isSeriesFilterNeeded;
                    var isItemFilterNeeded = options.titleBarFilters.isItemFilterNeeded;
                    var titleInfo = options.titleBarFilters.titleInfo;
                    var label1 = "";
                    var label2 = "";
                    var itemFilterFirst = false;
                    // Assign label for filters. Currently maximum of two filters available
                    if (titleInfo) {
                        label1 = titleInfo.label[0] ? titleInfo.label[0]+":" : "";
                        label2 = titleInfo.label[1] ? titleInfo.label[1]+":" : "";
                        itemFilterFirst = titleInfo.itemFilterFirst;
                    }

                    var titleBar = jQuery(this).parent().find(".ui-dialog-titlebar");
                    // Create dropdown for filters
                    var dropdown1 = isSeriesFilterNeeded ? makeFilterLabel("seriesFilter", label1) : ""; //No I18N
                    var dropdown2 = isItemFilterNeeded ? makeFilterLabel("itemFilter", label2) : ""; //No I18N
                    var connectPipe = dropdown1 != "" && dropdown2 != "" ? '<span id="filterPartition" class="table-pipeline opac3 filter-partition">&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span>' : "";
                    // Insert dropdown in the titlebar
                    jQuery((label1 == "" || label2 == "" ? '<span class="table-pipeline">&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;</span>' : '<span class="table-pipeline opac3">&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span>') + (itemFilterFirst ? (dropdown2 + connectPipe + dropdown1) : (dropdown1 + connectPipe + dropdown2))).insertBefore(titleBar.find(".ui-dialog-titlebar-close"));
                    titleBar.find(".ui-dialog-title").css("width", "auto"); // No I18n
                    const filterCss = { 'width': 'auto', 'background-color': 'transparent', 'border-color': 'transparent', 'color': '#515151', 'font-weight': 'bold' };
                    var seriesDropdown = jQuery("#seriesFilter").css(filterCss);
                    var itemDropdown = jQuery("#itemFilter").css(filterCss);

                    var seriesIndex = options.titleBarFilters.seriesIndex;
                    var itemIndex = options.titleBarFilters.itemIndex;
                    if (isSeriesFilterNeeded) {
                        var seriesFilter = options.titleBarFilters.seriesFilter;

                        // populate filter with data
                        seriesDropdown.select2({ data: seriesFilter, dropdownAutoWidth: true });
                        seriesDropdown.removeAttr("title"); // Removes rendering of title in unnecessary place
                        jQuery("#s2id_seriesFilter > a").css("background-color", "#f9f8f8"); // No I18n
                        seriesDropdown.on("change", function (e) {
                            var selectedGroup = jQuery(this).select2('data'); // No I18n
                            var criteria = [];

                            seriesIndex = selectedGroup.index;
                            // On change of series filter, item filter needs to be changed with its corresponding data
                            if (isItemFilterNeeded) {
                                var parsedCriteria = JSON.parse(selectedGroup.id);
                                // If item filter data is absent, we can hide the filter. (Asset dashboard case)
                                if (parsedCriteria.length == 1 && parsedCriteria[0].text == "") {
                                    itemDropdown.select2('destroy'); //No I18N
                                    titleBar.find("#filterPartition").addClass("hide");
                                } else {
                                    titleBar.find("#filterPartition").removeClass("hide");
                                    // Re-init filter with corresponding item filter data
                                    itemDropdown.select2('destroy').select2({ data: parsedCriteria, dropdownAutoWidth : true}).select2('data', parsedCriteria[itemIndex > parsedCriteria.length - 1 ? 0 : itemIndex]); // No I18n
                                    jQuery("#s2id_itemFilter > a").css("background-color", "#f9f8f8"); // No I18n
                                }
                                criteria = parsedCriteria[itemIndex > parsedCriteria.length - 1 ? 0 : itemIndex].id;
                            } else {
                                criteria = selectedGroup.id;
                            }
                            updateListView(criteria);
                        });
                        seriesDropdown.on("select2-close", function () {
                            // On close, remove focus of the opened dropdown
                            setTimeout(function() {
                                titleBar.find('.select2-container-active').removeClass('select2-container-active');
                                titleBar.find(':focus').blur();
                            }, 1);
                        });
                        seriesDropdown.select2('data', seriesFilter[seriesIndex]);
                    }

                    if (isItemFilterNeeded) {
                        var itemFilter = options.titleBarFilters.itemFilter;

                        // populate filter with data
                        itemDropdown.select2({ data: itemFilter, dropdownAutoWidth : true });
                        itemDropdown.removeAttr("title"); // Removes rendering of title in unnecessary place
                        jQuery("#s2id_itemFilter > a").css("background-color", "#f9f8f8"); // No I18n
                        itemDropdown.on("change", function (e) {
                            // On change of item filter, series filter need not be changed, as items fall under the present series itself
                            var selectedGroup = jQuery(this).select2('data'); // No I18n
                            var criteria = [];

                            itemIndex = selectedGroup.index;
                            criteria = selectedGroup.id;
                            updateListView(criteria);
                        });
                        itemDropdown.on("select2-close", function () {
                            // On close, remove focus of the opened dropdown
                            setTimeout(function() {
                                titleBar.find('.select2-container-active').removeClass('select2-container-active');
                                titleBar.find(':focus').blur();
                            }, 1);
                        });
                        itemDropdown.select2('data', itemFilter[itemIndex]);
                    }

                    // Update the url using the given criteria and reload the frame
                    var updateListView = function (criteria) {
                        var url = "/ui/load_list?module="+options.module; //No I18N
                        if(options.entity) {
  		                    url = url + "&entity="+options.entity; //No I18N
                        }

                        if (Array.isArray(criteria)) {
                            var input_data = { list_info: { search_criteria: criteria[0], filter_by: criteria[1] } };
                        } else {
                            var input_data = { list_info: { search_criteria: criteria } };
                        }
                        url = url + "&" + sdpAjaxInputData(input_data); // No I18n
                        jQuery("#dynamicrlv").attr("src", url);
                        jQuery("#dynamicrlv").load();
                    };
                }
                /**
                 * To initializing a tooltip for the header.
                 */
                initTooltip(".dynamiclistview .ui-dialog-titlebar");
              },
              close: function () {
                  jQuery(this).dialog("close").remove(); //NO I18N
                  typeof preventPieClick != "undefined" && (preventPieClick = false); //No I18N
                  if(options && typeof options.closeCB === 'function') {
                    options.closeCB();
                  }
              }
          });
          jQuery("#dynamiclistview").css("overflow","hidden"); //No I18N
          listviewDialog.dialog("open"); //NO I18N
      }
	},
	/**
	 * Event handling for popup
	 */
	bindEvent: function () {
    //listview_popup.bindEvent() this function should be called whenever the module list view render
      jQuery(document).off("keydown.listviewpopup").on("keydown.listviewpopup", function (e) { //NO I18N
          if (e.keyCode == 27 && top.jQuery("#dynamiclistview").dialog("isOpen")) {
              top.jQuery("#dynamiclistview").dialog("close").remove(); //NO I18N
              typeof preventPieClick != "undefined" && (preventPieClick = false); //No I18N
          }
      });

      jQuery(document).off("click.listviewpopup").on("click.listviewpopup", ".listview-popup", function (e) { //No I18N
        //This event not needed
		e.preventDefault();
        var href = jQuery(this).attr("href");
        listview_popup.render(href, e);
      })
	}
};
listview_popup.bindEvent();

/*
  Preview Component
    To show the preview of given {url} as slider
    Params
    {url} - url to preview
    {containerId} - will be the 'id' of preview window
    {width} - will be the width of preview window
    {optdata} - can pass additional options, if we need
		Pass option as a string 'isFullPage:true,position:790px,closecallback:functionName'
		isFullPage -- set window full height to iframe
		position -- left/right iframe render position in px/%
		closecallback -- callback function fot after close preview component
		scrolling -- "no/yes" enable or disable iframe scrolling
		hideHeader -- header section with close icon hide option
		custom_class -- overwriter parent class for alignment
		renderin_prev_frame -- Render/change url in previously load iframe only
        auto_close -- close disable when we click feezelayour, ESC key triggered
*/
$previewComponent = {
	options: {},//Get preview component count and close one by one
	actions: {},//Get action like callback...
    internalDialogs: {}, // dialogs opened inside preview component
    load : function(url, title, width, height, callback,containerId, isDiv, zIndex, optdata){
		this["actions"] = {};
        width = (!width) ? "70%" : width;
		var dataopt = {"url":url,"title":title,"width":width,"height":height,"container_id":containerId,"is_div":isDiv};
		if(optdata) {
			var opt = optdata.split(",");//No i18N
			for (var j = 0; j < opt.length; j++) {
				this["actions"][opt[j].split(":")[0]] = opt[j].split(":")[1];
				dataopt[opt[j].split(":")[0]] = opt[j].split(":")[1];
			}
		}
		var f_zindex = !!zIndex ? this.freeze_index ? this.freeze_index : parseInt(zIndex) : 1000;
		dataopt["freeze_index"] = f_zindex;
		if(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
		}
		this.init(dataopt, callback);
    },
    init : function(opt, callback){
		var opt1 = {
			url: "",
			container_id: "module-preview",
			title: translate("common.details"),
			direction: sdp_user.DIRECTION == 'LTR' ? 'right': 'left',
			isFullPage: false,
			freeze_index: 1000,
			position: "0%",
			is_div: false,
			loaderPos: "60%",
			scrolling: "yes",
			loaderClass: "",
			renderin_prev_frame: false,
            externalPopUp: false,
            auto_close: false,
		};
		opt1 = jQuery.extend({}, opt1, opt);
		var self = this;
		if(opt1.renderin_prev_frame) {
			if(typeof self.options !== "undefined" && !jQuery.isEmptyObject(self.options)) {
				opt1.container_id = self.options[1].containerId;
				var previewDiv = jQuery("#"+opt1.container_id);
				if(previewDiv.length === 1 && !opt1.is_div) {
					previewDiv.parent().find("#preview-loading").show();
                    const 
                        $iFrame = jQuery("#"+opt1.container_id+"-frame"),
                        $titleDiv = previewDiv.find('[data-id="frame-header"]'),
                        hideHeader = (opt1.hideHeader === "true" || opt1.hideHeader === true);

                    if($titleDiv.length) {
                        //task-116654 => when new frame replaces old frame, title is getting retained. So, replace the title with new one.
                        $titleDiv.text(decodeURIComponent(opt1.title));
                        if(hideHeader) {
                            //when new frame replaces old frame and hideHeader option is set to true, then remove header div from DOM
                            previewDiv.find('[data-id="title-header-div"]').remove();
                        }
                    }
                    else if(!hideHeader) {
                        //task-116654 => when new frame replaces old frame and old frame was initialized with hideHeader=true, then header woudn't have been rendered in DOM.
                        $iFrame.parent().prepend($previewComponent.getHeaderHtml(opt1.container_id, opt1.title));
                        initTooltip(`[data-id="frame-close"]`);
                        addCloseEvent(opt1); //task 122375 => Close button event handler after initialized with render_in_prev_frame
                    }

                    const attr = {'src': opt1.url, 'scrolling': opt1.scrolling};

					$iFrame.attr(attr).one("load",function() {
						previewDiv.parent().find("#preview-loading").hide();
					});
                    if(callback){
                      callback("#"+opt1.container_id+"-frame");
                    }
					return;
				}
			}
		}
		jQuery("body").addClass("of-h");//No I18N

        const calcHeight = () => {
            const $win = jQuery(window), $chat = jQuery("#sdp-chat-bar");
            return ($chat.length > 0 && !opt1.isFullPage) ? $win.height() - $chat.height() : $win.height(); // if chat bar is available, then subtract its height from window height, so that preview component doesn't overlap chatbar
        };

		var height = calcHeight();   //No I18N
		// Assign z-index based on argument
		opt1.freeze_index = parseInt(opt1.freeze_index);
		if(typeof self.options === "undefined" || jQuery.isEmptyObject(self.options)) {
			self.options = {};
			jQuery("#freeze-layer, #"+opt1.container_id).remove(); //No I18N
		}
		var len = Object.keys(self.options).length + 1;
		self.options[len] = {
			"fzindex": self.options[len-1] ? self.options[len-1].fzindex + 1 : opt1.freeze_index, //No I18N
			"fid": self.options[len-1] ? self.options[len-1].fid + "_" + len  : "freeze-layer", //No I18N
			"containerId": opt1.container_id, //No I18N
		};
		opt1.freeze_index = self.options[len].fzindex;
		var d_zindex = !!opt1.freeze_index ? parseInt(opt1.freeze_index) + 1 : 1001;
		var freezelayer = self.options[len].fid;
        
        const $baseDiv = jQuery('<div>');
        const $freezeLayerDiv = jQuery(`<div id="${freezelayer}" class="pos-fix fw left0 top0 cur-ptr fh"></div>`).css({'background': 'black', 'opacity': '0.4', 'z-index': opt1.freeze_index});
        const containerCss = {'width': opt1.width, 'min-width': '800px', 'z-index': d_zindex, [opt1.direction]: '-100%'};
        if(opt1.is_div) {
            containerCss['overflow'] = 'auto';
            containerCss['height'] = height + 'px';
        }
        const $containerDiv = jQuery(`<div id="${opt1.container_id}" class="detailview pos-fix ${opt1.is_div ? '' : 'fh'} top0 whitebg p0 m0 frame-preview" tabindex="0"></div>`).css(containerCss);

        jQuery("body").append($baseDiv.append($freezeLayerDiv).append($containerDiv));

		jQuery("#preview-loading").remove();//No I18N
		var previewDiv = jQuery("#"+opt1.container_id);
        var animDuration = 350;
        if(sdp_user.CLIENT_CONF.Accessibility){
            (sdp_user.CLIENT_CONF.Accessibility.animation == true) ? animDuration = 10 : animDuration = 350;
        }
		if(opt1.direction == 'right') {
			previewDiv.animate({right: opt1.position}, animDuration, "swing", function() {   //No I18N
				afteranimate(opt1);
			});
		} else {
			previewDiv.animate({left: opt1.position}, animDuration, "swing", function() {   //No I18N
				afteranimate(opt1);
			});
		}
		jQuery(document).off("keydown.previewpopup").on("keydown.previewpopup", function(e) {  //No I18N
			var len = self.options ? Object.keys(self.options).length : 0;
			containerId = self.options && self.options[len] && self.options[len].containerId ? self.options[len].containerId : "module-preview";
            if (!i.auto_close) {
    			if(e.keyCode == 27 && jQuery("#"+containerId).length > 0) {
    				if(typeof self.options === "undefined" && self.options[len] === "undefined") {
    					jQuery(document).off("keydown.previewpopup"); //No I18N
    					return false;
    				}
    				if(self.options[len] && self.options[len].containerId == containerId ) {
    					self.closePreview(containerId);
    					if(jQuery.isEmptyObject(self.options)) {
    						jQuery(document).off("keydown.previewpopup"); //No I18N
    					}
    				}
    			}
            }
		});
        //SD-107267 fix => Resizing popup height according to window height
        jQuery(window).off('resize.preview').on('resize.preview', function() {
            var $ele = jQuery('#' + opt1.container_id);
            if($ele.length > 0) {
                let height = calcHeight();
                $ele.height(height);
            }
        })
        
		function afteranimate(opt1) {
			var previewDiv = jQuery("#"+opt1.container_id);
			var direction = sdp_user.DIRECTION == 'LTR' ? 'left': 'right';//No I18N
			var hideHeader = opt1.hideHeader ? '' : opt1.custom_class ? opt1.custom_class : 'p20 pt5';

            let $previewElement = jQuery((opt1.is_div ? `<div id="${opt1.container_id}-frame" class="${hideHeader} fw fh noborder oxa oya bgwhite"></div>` : `<iframe id="${opt1.container_id}-frame" src="${opt1.url}" class="fw fh noborder" scrolling="${opt1.scrolling}" />`));

            let $loadingDiv = jQuery(`<div id="preview-loading" class="loading1 ${opt1.loaderClass}"></div>`).css({'top': '49%', [direction]: opt1.loaderPos, 'z-index': 1002});

            previewDiv.parent().append($loadingDiv.append(`<div class="loading-bar1"></div><div class="loading-bar1"></div><div class="loading-bar1"></div><div class="loading-bar1"></div>`));

            let $headerUI, hasHeader = true;
            if(opt1.hideHeader) {
                hasHeader = false;
            }
            else {
                hasHeader = true;
                $headerUI = $previewComponent.getHeaderHtml(opt1.container_id, opt1.title);
            }

            let $flexDiv = jQuery('<div class="bodybg fh disp-flex"></div>').css({'flex-flow': 'column'});
            if(hasHeader) {
                $flexDiv.append($headerUI)
            }
            $flexDiv.append(jQuery($previewElement));
            previewDiv.html($flexDiv);

			if(opt1.is_div){
				jQuery("#"+opt1.container_id+"-frame").load(opt1.url, $previewComponent.contentStyling(opt1.container_id, previewDiv, callback, opt1.is_div));
			}else{
				jQuery("#"+opt1.container_id+"-frame").one("load",function() {$previewComponent.contentStyling(opt1.container_id, previewDiv, callback, opt1.is_div)});
			}
			addCloseEvent(opt1, freezelayer);
            jQuery("#"+opt1.container_id+"-frame").trigger('focus'); //SD-107142 fix => global shortcuts aren't working inside preview since it is not the active element, so manually triggering focus event 
		}
        function addCloseEvent(opt1, flId) {
            if(!flId) {
                const len = Object.keys(self.options).length;
                flId = self.options[len].fid;
            }
            jQuery("#"+opt1.container_id+"_previewclose").off("click").on("click", function(){
                $previewComponent.closePreview(opt1.container_id);
            });
            const $fl = jQuery("#"+flId).off('click.pc');
            if(!opt1.auto_close) {
                $fl.on("click.pc", () => {
                    $previewComponent.closePreview(opt1.container_id);
                });
            }
        }
	},
    contentStyling: function(containerId, previewDiv, callback, isDiv){
        var self = this;
    	previewDiv.parent().find("#preview-loading").hide();
        if(isDiv){
            var iframe = jQuery("#"+containerId+"-frame");
            iframe.css("min-width", 800); // NO I18N
        }else{
        	var iframe = jQuery("#"+containerId+"-frame").contents();
			iframe.find("#content-inner").css("min-width", 800); // NO I18N
        }
        if (!$previewComponent.options.auto_close) {
            iframe.off("keydown.previewpopup").on("keydown.previewpopup", function(e) {  //No I18N
    			if(e.keyCode == 27 && jQuery("#"+containerId).length > 0) {
    				var len = $previewComponent.options ? Object.keys($previewComponent.options).length : 0;
    				if(typeof $previewComponent.options === "undefined" && $previewComponent.options[len] === "undefined") {
    					iframe.off("keydown.previewpopup"); //No I18N
    					return false;
    				}

                if(!jQuery.isEmptyObject(self.internalDialogs)) {
                    // sd-109812 when other dialogs are opened inside preview_comp, then we don't close.
                    return;
                }

    				if($previewComponent.options[len].containerId == containerId ) {
    					$previewComponent.closePreview(containerId);
    					if(jQuery.isEmptyObject($previewComponent.options)) {
    						iframe.off("keydown.previewpopup"); //No I18N
    					}
    				}
    			}
            });
        }
        if(callback){
          callback("#"+containerId+"-frame");
        }
        $previewComponent.zcompdialogGetandSetclose(false);
    },
    getHeaderHtml(containerId, title) {
        return `<div class="boxHeader pr15 z-ind1" data-id="title-header-div">
                    <div clss="disp-t">
                        <div class="disp-c fw pl15 sb pt10 pb10" data-id="frame-header">${decodeURIComponent(title)}
                        </div>
                        <div class="disp-c vmiddle" data-id="frame-close">
                            <button id="${containerId}_previewclose" type="button" class="dig-close-btn" title="${translate('common.close')}" rel="uitip"></button>
                        </div>
                    </div>
                </div>`;
    },
    closePreview: function(containerId) {
		var _self = this;
	  var direction=this.direction ? this.direction : sdp_user.DIRECTION == 'LTR' ? 'right': 'left';//No I18N
	  var len = Object.keys(this.options).length;
	  containerId = this.options[len] && this.options[len].containerId ? this.options[len].containerId : containerId;
	  fid = this.options[len] && this.options[len].fid ? this.options[len].fid : "freeze-layer";
	  function aftercloseanimat(fid, containerId, _self) {  
		jQuery("#"+fid+", #"+containerId).remove(); //No I18N
		jQuery("#preview-loading").fadeOut();
		if(_self.actions.closecallback) {
			execFuncByName(_self.actions.closecallback,window);
		}
		
		delete _self.options[len];
        if(jQuery.isEmptyObject(_self.options)) {
          jQuery("body").removeClass("of-h");//No I18N
        }
        $previewComponent.zcompdialogGetandSetclose(true);
	  }
      var animDuration = 350;
    if(sdp_user.CLIENT_CONF.Accessibility){
        (sdp_user.CLIENT_CONF.Accessibility.animation == true) ? animDuration = 10 : animDuration = 350 ;
    }
	  jQuery("#"+containerId).animate({direction: "-100%"}, animDuration, "swing", function() {    //No I18N
		aftercloseanimat(fid, containerId, _self);
	  });
    },
    zcompdialogGetandSetclose: function(closepreview) {
        /**
         * Get the Zoho component dialog and disable the 'esc' key event in the dialog.
         * #elementID -- is dummy ID no use
         * getcount -- option get the zoho dialog information
         */
        let zcompdialog = jQuery("#elementID").sdp_zcomponent_dialog('getcount'); // Get the Zoho component dialog(s) associated with the element with ID "elementID".
        if (zcompdialog && !jQuery.isEmptyObject(zcompdialog)) { // Check if Zoho component dialogs are found and not empty.
            Object.keys(zcompdialog).forEach(key => {
                const ele = document.querySelector(key); //SD-121237 fix => check whether element is present in DOM or not
                if (key && ele) {
                    ZComponents.dialog(ele).setAttribute("closeOnEscKey", closepreview);
                    if(closepreview) {
                        //Set focus on the preview component
                        if(jQuery.isEmptyObject($previewComponent.options)) {
                            jQuery("#"+key).focus();
                        }
                    }
                }
            });
        }
    },
    /***
     * Get and return active parent iframe 
     * **/
    iframeActiveParent: function() {
        // Get the URL of the current iframe
        var url = jQuery(window.frameElement).attr('src');
        url = url ? url : parent.location.href;

        // Get the DOM element of the current iframe
        var $frameEle = jQuery(window.frameElement);
        var ele = $frameEle[0]; // Accessing the first element of the jQuery object

        // Get the document and window objects of the iframe
        var doc = ele.ownerDocument; // Document containing the iframe
        var win = doc.defaultView || doc.parentWindow; // Window object of the iframe

        // Return the window object of the active parent iframe
        return win;
    }
};
