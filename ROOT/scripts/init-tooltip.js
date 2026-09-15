/* $Id$ */

/**
 * Function to initialize tooltips.
 * @param {string} el - The selector for the element(s) to attach tooltips to.
 */
var initTooltip = (function(el){
	/**
	 * This script is using strict mode to enforce a more stringent set of rules during runtime.
	 * Strict mode helps catch common coding mistakes and prevents the use of error-prone features,
	 * promoting safer and more maintainable code.
	 */
	'use strict';
	/**
     * Object containing functions related to tooltips
     */
	var tip = {
		/**
		 * Function to initialize tooltips once.
		 * @param {string} el - The selector for the element(s) to attach tooltips to.
		 */
		callOnce : function(el) {	
			if (!callTooltipOnce) {
                tip.init(el);
                callTooltipOnce = true;
                return;
			}
		},

		/**
		 * Function to initialize tooltips multiple times.
		 * @param {string} el - The selector for the element(s) to attach tooltips to.
		 */
		callMulti:function(el) {
			tip.init(el);
		},

		/**
		 * Function to initialize tooltips.
		 * @param {string} el - The selector for the element(s) to attach tooltips to.
		 */
		init:function(el) {
			var rel, 
				trim = typeof el == 'string' ? jQuery.trim(el) : el, 
				trimChild = jQuery(trim),
				tip1 = trimChild.find('[rel=uitooltip]').add(jQuery(trimChild).filter('[rel=uitooltip]')),//.add(jQuery(trimChild).filter( - filter to add self element which have rel attribute
				tip2 = trimChild.find('[rel=uitooltip-track]').add(jQuery(trimChild).filter('[rel=uitooltip-track]')),
				tip3 = trimChild.find('[rel=uitooltip-popover]').add(jQuery(trimChild).filter('[rel=uitooltip-popover]')),
				tip4 = trimChild.find('[rel=uitooltip-track-table]').add(jQuery(trimChild).filter('[rel=uitooltip-track-table]')),
				/**
                  		 * To avoid phishing attack we need to add rel="noopener noreferrer".
				 * Earlier we initialized the tool tip based on rel="uitip".
				 * Defining rel="utip noopener noreferrer" like this, "uitip" will not work.
				 * That's why, We check if the rel value contains "uitip".
				 */
				tip_all = trimChild.find('[rel*=uitip]').add(jQuery(trimChild).filter('[rel*=uitip]'));
			var convertLineBreak = function (content) {
				try {
					/**
					 * encoded newline characters alone are replaced back with \n
					 */
					content = content.replace(/&#xa;/g, '<br>');
				} catch(ex) {}
				return content;
			};
			jQuery( '.ui-tooltip' ).remove();

			/**
             * jQueryUI Tooltip Plugin: all type
             */
			if(tip_all.length!=0) {
				/**
				 * rel="uitip" -- Tooltip UI attributes with track event default
				 * mode_ellipsis="true" -- Truncate the value and show tooltip only when content truncate
				 * mode_html="true" -- Skip to encode in title content
				 * mode_type="width/height" -- Ellipsis configure in width/height calculation, default "width"
				**/
				rel = tip_all;
				/**
				 * Configuration options for the uitip
				 */
				let tipOpt = {
					/**
					 * Custom classes for styling
					 */
					classes : {
						"ui-tooltip" : "uitip",
					},
					/**
					 * Show configuration
					 */
					show : {
						effect : 'none',//NO I18N
						delay : 10
					},
					/**
					 * Hide configuration
					 */
					hide : {
						effect : 'none',//NO I18N
						delay : 10
					},
					/**
					 * Content configuration - a function to dynamically generate the tooltip content
					 * @returns String
					 */
					content : function() {
						return tipconstruct(jQuery(this));
					},
					/**
					 * Enable tracking to keep the tooltip positioned near the triggering element
					 */
					track : true
				};
				/**
                 * Function to construct tooltip content based on element attributes.
                 * @param {jQuery} e - The jQuery element for which tooltip content is constructed.
                 * @returns {string|boolean} - The constructed tooltip content or false if tooltip should not be shown.
                 */
				function tipconstruct(e) {
					/**
                     * Get the value of the 'title', 'orgTitle', or 'help-title' attribute from the element
                     */
					var r = e.attr("title") || e.attr("orgTitle") || e.attr('help-title');//NO I18N;
					let styleConvert = false;
					/**
                     * Check if 'mode_html' attribute is not set
                     */
					if(!e.attr("mode_html")) {//NO I18N
						/**
                         * Convert line breaks if necessary
                         */
						convertLineBreak(r);
						/**
                         * Encode the tooltip content as HTML
                         */
						r = jQuery("<a>").text(r).html();//NO I18N
					}else{
						/**
						 * Set styleConvert flag to true if mode_html attribute is present
						 */
						styleConvert = true;
						/**
						 * SD - 124138
						 * For elements without a 'help-title' attribute, we are not setting a default title.
						 * This logic is intended to only apply when a help-title is not present.
						 */
						if(!e.attr('help-title')){
							if(r && r != ""){
								e.attr("data-uitip", r);
							}else{
								r = e.attr("data-uitip");
							}
						}
					}
					/**
                     * Check if 'mode_ellipsis' attribute is set
                     */
					if(e.attr("mode_ellipsis")) {
						var showTooltip = true;
						var type = (e.attr('mode_type') == undefined) ? 'width' : e.attr('mode_type');
						/**
						 * SD - 123980
                         * Determine whether tooltip should be shown based on scroll width/height
                         */
						if (type === 'width') {
							showTooltip = e[0].scrollWidth > e[0].offsetWidth || e.parent()[0].scrollWidth > e.parent()[0].offsetWidth;
						} else if (type === 'height') {
							showTooltip = e[0].scrollHeight > e[0].offsetHeight || e.parent()[0].scrollHeight > e.parent()[0].offsetHeight;
						}
						/**
                         * If tooltip should not be shown, set 'orgTitle' and remove 'title' attribute
                         */
				        if (!showTooltip) {
				        	e.attr("orgTitle", r).attr("title","");//NO I18N
				        	return false;
				        }
					}
					/**
					 * SD - 124138
                     * Check if 'mode_multiline' attribute is set and 'title' attribute is not empty
                     */
			        if(e.attr("mode_multiline") && (e.attr("title") != "" || e.attr("data-uitip") != "")) {
						r = "<span data-style='white-space:pre-wrap'>"+ r + "</span>" ;//NO I18N
						/**
						 * Set styleConvert flag to true if mode_multiline attribute is present
						 */
						styleConvert = true;
					}
					const $tempDiv = jQuery('<div>').html(r);
					/**
					 * Function to check if an element contains any child elements with the 'data-style' attribute
					 */
					function hasDataStyle($element) {
						return $element.find('[data-style]').length > 0;
					}
					/**
					 * Check if styleConvert is true and the temporary div contains elements with 'data-style'
					 */
					if(styleConvert && hasDataStyle($tempDiv)){
						r = jQuery(r);
						/**
						 * Apply style conversions to the tip value using the $sdStyleConverter function
						 */
						$sdStyleConverter(r);
					}
					/**
                     * Return the constructed tooltip content
                     */
					return r;
				}
				/**
				 * Handles the 'focusin' event for uitip.
				 * Closes the uitooltip associated with the current element.
				 */
				function handleUitipFocusIn() {
					jQuery(this).uitooltip('close');
				}
				rel.each(function(){//NO I18N
					var current = jQuery(this);
					/**
					 * SD - 120099
					 * Creating a shallow copy of the tipOpt object using the spread operator
					 * This copies the top-level properties of tipOpt to clonedTipOpt
					 */
					let clonedTipOpt = { ...tipOpt };
					/**
					 * Extract the value of the 'rel-class' attribute from the 'current' element
					 */
					let tooltipClass = current.attr('rel-class');
					/**
					 * Check if 'tooltipClass' has a truthy value (i.e., it's not undefined, null, 0, "", etc.)
					 */
					if(tooltipClass){
						/**
						 * If 'tooltipClass' exists, set it as the 'tooltipClass' property in the 'clonedTipOpt' object
						 */
						clonedTipOpt["tooltipClass"] = tooltipClass;
						/**
						 * Set the 'items' property in the 'clonedTipOpt' object based on the value of 'tooltipClass'
						 */
						clonedTipOpt["items"] = (tooltipClass === "help-text") ? "[help-title]" : "[title]";//Helpcard related changes update in uitooltip
					}
					/**
					 * SD - 124138
					 * The tooltip does not work without a title attribute in jQuery UI v1.13.2, so we set an empty title attribute. This has no impact on WCAG compliance.
					 */
					if(current.attr("mode_html")){
						clonedTipOpt["close"] = () => current.attr("title", "");
					}
					/**
					 * Remove any existing 'focusin' event listener with the 'uitip' namespace to avoid duplication.
					 */
					current.uitooltip(clonedTipOpt).off('focusin.uitip').on('focusin.uitip', handleUitipFocusIn);
				});
			}
			/**
             * End -- tooltip "all type"
             */

            /**
             * jQueryUI Tooltip Plugin: For Icons
             */
			if(tip1.length!=0) {
				rel = tip1;
				jQuery.each(rel, function() {
					var ele = jQuery(this),
						effect_dir = "up", direc = ele.attr('rel-dir'), relClass = ele.attr('rel-class'),
						relPL = parseInt(ele.attr('rel-pl')), relPR = parseInt(ele.attr('rel-pr')), relPT = parseInt(ele.attr('rel-pt')), relPB = parseInt(ele.attr('rel-pb'));
					var tippos = { my: "left top+15", at: "left bottom" };	//NO I18N
					if(direc !== undefined) {
						(parent.sdp_user && parent.sdp_user.DIRECTION === "RTL") && (direc = direc === "right" ? "left" : (direc === "left" ? "right" : direc));
						tippos = { my: tooltipPos[direc].my, at: tooltipPos[direc].at };
						effect_dir = tooltipPos[direc].direction;
					}
					relClass || (relClass = "");
					/**
                     * Since IE shows the tooltip on focussing the uitooltip initialized element, the alternate attribute [help-text] is being used for the html
                     */
					var items = relClass === "help-text" ? "[help-title]" : "[title]";
					ele.uitooltip({//NO I18N
						items: items,
						content: function(){
							return convertLineBreak(relClass === "help-text" ? jQuery( this ).attr('help-title') : jQuery( this ).attr('title'));
						},
						tooltipClass: relClass,
						position: {
							my: tippos.my,
							at: tippos.at,
							using: function(position, feedback) {
								var ele = jQuery(this);
								if(direc !== undefined) {
									var tipDirecClass = "down";
									(feedback.horizontal !== "center" && (tipDirecClass = feedback.horizontal === "right" ? "left" : "right") && (direc === "right"|| direc ==="left"))
									|| (tipDirecClass = feedback.vertical === "top" ? "down" : "up");
									(tipDirecClass === "right" && relPR && !isNaN(relPR) && (position.left += relPR))
									|| (tipDirecClass === "left" && relPL && !isNaN(relPL) && (position.left -= relPL))
									|| (tipDirecClass === "up" && relPT && !isNaN(relPT) && (position.top -= relPT))
									|| (tipDirecClass === "down" && relPB && !isNaN(relPB) && (position.top += relPB));
									ele.addClass("direction " + tipDirecClass);
								}

								ele.css(position);
							}
						},
						show: { effect: 'none', delay: 300, duration: 120 },	//NO I18N
						hide: { effect: 'none', delay: 10, duration: 100 }	//NO I18N
					}).on( 'focusin' , function () {
						if(relClass === "help-text") {
							jQuery( this ).uitooltip( 'open' );
						} else {
							jQuery( this ).uitooltip( 'close' );
						}
					});
				});
			}
			
			/**
             * jQueryUI Tooltip Plugin: For Subject Lines
             */
			if(tip2.length!=0) {
				rel = tip2;
				if(jQuery('.listview.gridlistview').length!=0){
					var tooltipClassName = 'uitooltip-track grid-tip';//NO I18N
				}
				else {
					var tooltipClassName = 'uitooltip-track';//NO I18N
				}
				rel.each(function(){//NO I18N
					var current = jQuery(this);
					current.data('current-title', current.attr('title'));
					var currentData = current.data('current-title');
					var cursorTrack = current.data('cursor-track');//NO I18N
					if(cursorTrack==null||cursorTrack==undefined) { cursorTrack = true; }
					current.uitooltip({//NO I18N
						content: function(){
							var element = jQuery( this );
							return element.attr('title')//NO I18N
						},
						track:cursorTrack,
						tooltipClass: tooltipClassName,//NO I18N
						show: {
							effect: 'none',//NO I18N
							delay: 10
						},hide: {
							effect: 'none',//NO I18N
							delay: 10
						}
					}).on( 'focusin, click, hover, mouseover' , function (event) {     
						if(event.type === 'focusin') {
							jQuery( this ).uitooltip('close');
						}
						if(event.type === 'click') {
							if(event.target.tagName === 'A') {
								jQuery( this ).uitooltip('close');
								jQuery( this ).attr('title',currentData).uitooltip({content:currentData,track:cursorTrack}); //NO I18N
							}
							if(event.type === 'hover'){
								if(event.target.tagName === 'A') {
									rel.uitooltip('close');
								}
							}
						}
						if(event.type === "mouseover" && event.target.tagName === 'DIV'){
							if(event.target.classList.contains('cv-block')){
								jQuery(".cv-block .tc").on("mouseover", function(){
									jQuery(".ui-tooltip").prev('.ui-tooltip').hide();
								}).on("mouseleave", function(){
									jQuery(".ui-tooltip").prev('.ui-tooltip').show();
								});
							}
						}
						jQuery(".attachdrop .atdwnld").on("mousemove", function(){	// #99967, #99663 - Avoid the Multiple uitooltip - Attachment with desc
							jQuery(".ui-tooltip").prev('.ui-tooltip').hide();
						}).on("mouseout", function(){
							jQuery(".ui-tooltip").prev('.ui-tooltip').show();
						});
					});
				});
			}

			/**
             * jQueryUI Tooltip Plugin: For TableComponent - Dynamic Tooltip
             */
			if(tip4.length!=0){
				rel = tip4;
				if(jQuery('.listview.gridlistview').length!=0){
					var tooltipClassName = 'uitooltip-track grid-tip';//NO I18N
				}
				else {
					var tooltipClassName = 'uitooltip-track';//NO I18N
				}
				rel.each(function(){//NO I18N
					var current = jQuery(this);
					var cursorTrack = current.data('cursor-track');//NO I18N
					if(cursorTrack==null||cursorTrack==undefined) { cursorTrack = true; }
					current.uitooltip({//NO I18N
						content: function(){
							var e = jQuery(this);
							var r = e.attr("title") || e.attr("orgTitle");//NO I18N
							/*
								Fix for HTML Attribute XSS - jQuery UI - v1.12.0
								Actually, in our product jquery-ui.min.js, thirdparty framework fixed this XSS issue, inside "content" function.
								But , here we are overridding the "content" function, we have to write the below code.
								**
									In Jquery-ui (Fix) :  return jQuery( "<a>" ).text( title ).html();
								**
								Ref : https://github.com/jquery/jquery-ui/commit/f2854408cce7e4b7fc6bf8676761904af9c96bde
							*/
							if(!e.attr("data-allowhtml")){//NO I18N
								r = jQuery( "<a>" ).text( r).html();//NO I18N
							}
							var showTooltip = true;

							if(e.attr("data-default-tooltip") !== "true"){
								var isChrome = /Chrome\//.test(navigator.userAgent);
								var type = (e.attr('data-tooltip-type') == undefined) ? 'width' : e.attr('data-tooltip-type');
						        if(isChrome){
									if(type == 'width') {
						        		showTooltip = e[0].scrollWidth ? e[0].offsetWidth < e[0].scrollWidth : e.parent()[0].offsetWidth < e.parent()[0].scrollWidth;
									} else if(type == 'height') {
										showTooltip = e[0].scrollHeight ? e[0].offsetHeight < e[0].scrollHeight : e.parent()[0].offsetHeight < e.parent()[0].scrollHeight;
									}
						        }else{
									if(type == 'width') {
						        		showTooltip = e[0].scrollWidth > jQ(e).parent().width();
									} else if(type == 'height') {
										showTooltip = e[0].scrollHeight > jQ(e).parent().height();
						        }
						    }
						    }
					        if (!showTooltip){
					        	e.attr("orgTitle", r).attr("title","");//NO I18N	
					        	return false;
					        }
					        if(e.attr("data-multiline") && e.attr("title") != ""){
								r = "<span style='white-space:pre-wrap'>"+ r + "</span>" ;//NO I18N
							}
					        return r;
						},
						show: {
							effect: 'none',//NO I18N
							delay: 10
						},hide: {
							effect: 'none',//NO I18N
							delay: 10
						}, 
						track:cursorTrack,
						tooltipClass: tooltipClassName//NO I18N
					}).on( 'focusin' , function () {        
						jQuery( this ).uitooltip( 'close' );   
					});
				});
			}
		}
	}
	
	/**
     * Check if 'el' is undefined, null, or an empty string
     */
	if(el==undefined || el==null || el=='undefined' || el==' ') {
        /**
         * If 'el' is not provided or empty, default it to 'body'
         */
		el = 'body';
        /**
         * Initialize tooltips once for the specified element
         */
		tip.callOnce(el);
	}
	else {
        /**
         * If 'el' is provided and not empty, initialize tooltips multiple times for the specified element
         */
		tip.callMulti(el);
	}
	
	return;
});

/**
  * 
  * @param {Dom Element} el 
  * @param {string} title translated string 
  * Used to load the tooltip for dynamically add elements | dynamic loaded dom element
  */
function dynamicToolTip(el, title){
	el.attr('title', title);
	let tipOpt = {
		classes : {
			"ui-tooltip" : "uitip",
		},
		show : {
			effect : 'none',//NO I18N
			delay : 10
		},
		hide : {
			effect : 'none',//NO I18N
			delay : 10
		},
		track : true,
		content: title
	};
	el.uitooltip(tipOpt);
}
