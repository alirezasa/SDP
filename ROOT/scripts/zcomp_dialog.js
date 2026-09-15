(function ( $ ) {
	/***
	 * jQuery("#elementID").sdp_zcomponent_dialog(option)
	 * 
	 * option -- Zoho component options (refer : http://zohocomponents/#/api-guide/components/dialog/options?framework=web)
   * 
   * Get the list of dialog open in DOM (Example: jQuery(document).sdp_zcomponent_dialog("getcount");   )
	 * ***/
	var pluginName = "sdp_zcomponent_dialog",
		defaults = {
			type: "modal",
			maximizable: false,
            title: translate("common.title"),
            width: "700px",
            height: "500px",
            resizable: false,
            className: "sdpzcompdialog pos-fix",//Class name used for style changes
            labels: {//icon title changes minimize, maximize
            	maximizeRestore: translate("sdp.exit.fullscreen"),
            	minimizeRestore: translate("sdp.requests.restorerequests"),
				close: translate("common.close"),
            	maximize: translate("sdp.fullscreen"),
            	minimize: translate("common.minimize")
            }
		};
		var getcount = {};/** List down the number dialog open in DOM **/
		var cus_freezelayer = false;
		function Plugin( element, options ) {
			/***
			 * Plugin initialize method
			 * **/
			this.element = element;
			this._defaults = defaults;
			this._name = pluginName;
			this.cus_freezelayer = false;
			this.removefreezelayer = true;
			this.slider = false;
			this.revertback = false;
			
			this.options = jQuery.extend( {}, defaults, options);

			if(this.options.custom_options) {/** Delete custom action option **/
				jQuery.extend(this, this.options.custom_options);
				if(this.options.custom_options.freezelayer != undefined) {/** Freeze layer render outside the component **/
					this.cus_freezelayer = this.options.custom_options.freezelayer;
				}
				delete this.options.custom_options;
			}

			getcount[element.id] = options;

			this.init();
		}
		Plugin.prototype = {
			actions: function(event, ui, method) {
				//this.cus_freezelayer = true;
				/**
				 * Used to change the overlay element outside the dialog and 
				 * event, ui -- zohocomponent parameter event and ui 
				 * ***/
				var zdialog = this.zdialog;
				function addoverlay(zdialog_element) {
					zdialog_element = document.createElement('div');
		            zdialog_element.setAttribute('class', 'zdialog--overlay model-zdialog--overlay');
		            zdialog_element.setAttribute('style', 'z-index: 100');
		            zdialog_element.setAttribute('tabindex', '1');
		            
		            //document.body.append(zdialog_element); 
		            zdialog.element[0].after(zdialog_element);
		            zdialog.overlayElement = zdialog_element;
				}
				if(method) {
					var zdialog_element;
					if(method.type == "load") {
						if(event){
					        if(zdialog_element || document.getElementsByClassName('zdialog--overlay').length) {
					            zdialog_element.style.display = '';
					        } else {
					        	zdialog_element = addoverlay(zdialog_element);
					        }
					        //zdialog._hideDocumentScroll(event);
					    } else {
					        zdialog_element.style.display = 'none';
					        //zdialog._hideDocumentScroll(event);
					    }
					    document.body.classList.add('of-h');
					}
			    	if(method.type == "minimize") {
			    		zdialog.overlayElement.classList.add('hide');
			    		document.body.classList.remove('of-h');
			    	}
			    	if(method.type == "restore") {
			    		if(!zdialog.overlayElement.isConnected) {
			    			zdialog_element = addoverlay(zdialog_element);
			    		}
			    		zdialog.overlayElement.classList.remove('hide');
			    		document.body.classList.add('of-h');
			    	}
			    }
			},
			callbackfn: function(type, param) {
				/** Callback function for open, close, minimize, restore **/
				if(type) {
					if(typeof type == "string") {
						execFuncByName(type,window,param);
					}
					if(typeof type == "function") {
						type(param);
					}
				}
			},
			restorefn: function(target, ui) {
				target.css("bottom",""); //No I18N
		    	if(ui.options.position) {
		    		if(ui.options.position.top) {
		    			target.css("top",ui.options.position.top); //No I18N
		    		}
		    		if(ui.options.position.right) {
		    			target.css("right",ui.options.position.right); //No I18N
		    			target.css("left","auto"); //No I18N
		    		}
		    		if(ui.options.position.left) {
		    			target.css("left",ui.options.position.left); //No I18N
		    			target.css("right","auto"); //No I18N
		    		}
		    	}
			},
			init: function() {
				/***
				 * Component initalization 
				 * ***/
				var _self = this;
				var copt = _self.options;
				var id = this.element.getAttribute("id");
				var zoption = {
					open: function(event, ui) {
						if(_self.cus_freezelayer) {
							_self.actions(event, ui, {"type":"load"});
						}
						if(ui.options.type == "modal") {
							jQuery("body").addClass('of-h');
						}
						function headertooltip() {
	            			/** 'uitip' attribute added in close, minimize, maximize, restore **/
							var uidialog = jQuery(ui.dialog).find(".zdialog__header .zdialog__actiongroup");
							uidialog.find('[data-zdaction=minimize],[data-zdaction=maximize],[data-zdaction=close]').attr("rel","uitip");
							initTooltip(".zdialog__header");

							var parameteropt = {"event":event,"ui":ui};
							_self.callbackfn(copt.open,parameteropt);
							jQuery(ui.dialog).off("keydown.zfocushandler"); //No I18N
						}
            			if(_self.url && !isEmpty(_self.url)) {
            				jQuery(ui.dialog).find("#zcomurlcontent").remove();
            				jQuery(ui.dialog).find(".zdialog__content").html('<div id="zcomurlcontent" class="disp-t fh fw"></div>');
            				jQuery("#zcomurlcontent").append(ajaxBar());
            				if(_self.is_iframe) {
            					jQuery(ui.dialog).find("#zcomurlcontent").html(`<iframe id="zcomurlcontent-frame" src="${_self.url}" class="fw fh noborder" scrolling="yes" />`);
            					jQuery("#zcomurlcontent-frame").one("load",function() {
            						headertooltip();
            					});
            				} else {
            					let urlsuccess = false;
								sdpAjax({
								    url: _self.url,
								    ignorefailuremessage: true,
								    cache: false,
			                    	async: false,
			                    	dataType: "html",
								    success: function(response) {
								    	urlsuccess = true;
								    	jQuery(ui.dialog).find("#zcomurlcontent").html(response);

								    },
								    error: function(xhr, status, error) {
								        // Handle error
								    }
								});
								if(urlsuccess) {
									headertooltip();
								}
							}
            			} else {
            				headertooltip()
            			}
					},
				    close: function(event, ui) {
				        jQuery("body").removeClass('of-h').trigger("click");
				        if(_self.revertback && _self.zdialog.dialog_sdp_parent_node.length == 1) {
				        	ZComponents.dialog(document.getElementById(ui.options.id)).destroy();
				        	jQuery("#"+ui.options.id).removeAttr("style").hide();
				        	jQuery(_self.zdialog.dialog_sdp_parent_node).append(document.getElementById(ui.options.id));
				        } else {
					        if(_self.removefreezelayer) {
								if(ui.options.id && jQuery('#' + ui.options.id).length !== 0) {
									jQuery('#' + ui.options.id).closest('.zdialog--overlay').remove();
								}
								else {
									jQuery(".zdialog--overlay").remove();
								}
					        }
						}
						if(getcount[ui.options.id]) {
							delete getcount[ui.options.id];
						}

						if(copt.resizeWindow) {
							jQuery(window).off('resize' + _self.eventNamespace);
						}
						var parameteropt = {"event":event,"ui":ui};
						_self.callbackfn(copt.close,parameteropt);
				    },
				    minimize: function(event, ui) {
				    	if(_self.cus_freezelayer) {
				    		_self.actions(event, ui, {"type":"minimize"});
				    		//document.body.classList.remove('of-h');
				    	}
				    	if(ui.options.type == "modal") {
				    		jQuery("body").removeClass('of-h');
				    	}
	                    var btm = (is_chathgt == 0 ? 0 : is_chathgt - 2) || 0;
	                    var rl_pos = (btm == 0 && sdp_app.zia_info.IS_BOT_ENABLED) ? 60 : 0;//check chat bar height and left/right postion to update
	                    if(sdp_user.DIRECTION == 'LTR' || sdp_user.DIRECTION == 'ltr') {
	                    	jQuery(event.target).css({"bottom":btm,"right":rl_pos,"left":"auto"}); //No I18N
	                    } else {
	                    	jQuery(event.target).css({"bottom":btm,"left":rl_pos,"right":"auto"}); //No I18N
	                    }
						var parameteropt = {"event":event,"ui":ui};
						_self.callbackfn(copt.minimize,parameteropt);
	                },
				    restore: function(event, ui) {
				    	if(_self.cus_freezelayer) {
				    		_self.actions(event, ui, {"type":"restore"});
				    	}
				    	if(ui.options.type == "modal") {
				    		jQuery("body").addClass('of-h');
				    	}
				    	var target = jQuery(event.target);
				    	_self.restorefn(target, ui);
				    	target.css("bottom",""); //No I18N
				    	var parameteropt = {"event":event,"ui":ui};
						_self.callbackfn(copt.restore,parameteropt);
				    },
				    resize: function(event, ui) {
				    	var target = jQuery(event.target);
				    	_self.restorefn(target, ui);
				    	var parameteropt = {"event":event,"ui":ui};
						_self.callbackfn(copt.restore,parameteropt);
				    },
					beforeclose: function(event, ui) {
						/*
							SD-119146 fix - If popover is open, then close it before closing the dialog
						*/
						if(jQuery('#showPopover').is(':visible')) {
							window.closeDD ? closeDD() : showPopover.prototype.hideDefaultPopOver();
							return false;
						}

						if(typeof copt.beforeclose === "function") {
							return copt.beforeclose(event, ui);
						}
					}
				};
				if(copt.resizeWindow) { //resize dialog according to window height
					const $win = jQuery(window), $chat = jQuery("#sdp-chat-bar"), $ele = jQuery(_self.element);
					const eventNamespace = _self.eventNamespace = '.zdialog-component_' + _self.element.id;

					const calcHeight = () => {
						return ($chat.length > 0 && copt.type != 'modal') ? $win.height() - $chat.height() : $win.height(); // if chat bar is available, then subtract its height from window height, so that dialog component doesn't overlap chatbar
					}
					$win.off('resize' + eventNamespace).on('resize' + eventNamespace, () => {
						if(_self.scrollDebounce) {
							clearTimeout(_self.scrollDebounce);
						}
						_self.scrollDebounce = setTimeout(function() {
							/** below method will be called only when the resizing is stopped */
							let height = calcHeight();
							ZComponents.dialog($ele[0]).setAttribute("height", height);
							_self.scrollDebounce = null;
						}, 300);
					});				
				}
				if(_self.slider) {
					/** Dialog show as slider UI with animation **/
					let anidir = {
						position: {
			                right: "0px", //No I18N
			                top: "0px" //No I18N
			            },
			            resizable: {
			                directions: "w", //No I18N
			                minWidth: 920,
			            },
			            animation: {
			                open: {
			                    className: 'zeffects--slideright', //No I18N
			                    duration: 300
			                },
			                close: {
			                    className:'zeffects--slideright--reverse', //No I18N
			                    duration:300
			                }
			            },
		            };
		            if(sdp_user.DIRECTION == "RTL") {
			            anidir.position = {
			                left: "0px",
			                top: "0px"
			            };
			            anidir.animation = {
			                open:{
			                    className:'zeffects--slideleft', //No I18N
			                    duration: 300
			                },
			                close: {
			                    className: "zeffects--slideleft--reverse",
			                    duration: 300
			                }
			            };
			            anidir.resizable = {
			                directions: "e" , //No I18N
			                minWidth: 920,
			            };
			        }
			        _self.options = Object.assign({}, anidir, _self.options);
				}
				zoption = jQuery.extend( {}, _self.options, zoption);
				let parent_node = jQuery("#"+id).parent();
				_self["zdialog"] = ZComponents.dialog("#"+id, zoption);
				_self.zdialog.dialog_sdp_parent_node = parent_node;
                ZComponents.dialog("#"+id).open();
			}
		};
		jQuery.fn[pluginName] = function (options) {
			if(typeof options == "string") {
				if(options == "close") {
					var id = this[0].getAttribute("id");
					ZComponents.dialog("#"+id).close();
				} else if(options == "closeAll") {
					let zcompdialog = getcount;
			        if (zcompdialog && !jQuery.isEmptyObject(zcompdialog)) {
			            Object.keys(zcompdialog).forEach(key => {
			                const ele = jQuery("#"+key);//No I18N
			                if (key && ele.length == 1) {
			                  ZComponents.dialog("#"+key).close();
			                }
			            })
			        }
				} else if(options == "getcount") {
					return getcount;
				}
			} else {
				return this.each(function () {
					jQuery.data(this, "plugin_" + pluginName,
					new Plugin( this, options ));
				});
			}
		};
})( jQuery );



