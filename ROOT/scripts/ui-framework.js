/* $Id$ */
if(window.jQuery != null) {

	(function($){
		$.fn.extend({ 
			clearfield: function(options){
				var defaults = {
					fieldclass: 'fontgray', // No I18N
					defaultclass: null
				}
				var options = $.extend(defaults, options);
				
				return this.each(function(){
					var o = options;
					var obj = $(this);
					obj.on('focus', function(){
						if(jQuery.trim(this.value) == this.defaultValue)
						{
							this.value = '';
							this.className =o.defaultclass;
						}
					}).on('blur', function(){
						if(jQuery.trim(this.value) == '')
						{
							this.value = this.defaultValue;
							this.className =o.fieldclass;
						}
					}); 
				});
			},
			countercomboUI: function(options){
				var defaults = {
					filterclass: 'countfilterval', // No I18N
					wrapclass: 'selectwrap', // No I18N
					hoverclass: 'selectwraph' // No I18N
				}
				var options = $.extend(defaults, options);
				
				return this.each(function(){
					var o = options;
					var obj = jQuery(this);
					var selwrap = jQuery("<span class='selectwrap'></span>");
					
					obj.ready(function() {
                        var w = obj.width();
						if(obj.prev().hasClass('selectwrap'))
						{
							obj.prev().remove();
						}
						var h = obj.height();
						var t = obj.position().top;
						
						jQuery(selwrap).css({width:w,height:h});
						
						obj.before(jQuery(selwrap));
					
					});
					
					if ((jQuery(document).find('#nondoctype').length!=0) && (!jQuery.support.opacity) ) { 
							h = h + 10 +'px'; // NO I18N
							jQuery('.selectwrap').closest('.ui-listnav-countfilter-pos').css('top','-4px');// NO I18N
					}
					//var value = document.getElementById('roleid').options[document.getElementById('roleid').selectedIndex].text;
					var value = obj.find('option:selected').text();
					var selval = value;
					jQuery(selwrap).append('<span class='+o.filterclass+'>'+encodeHTML(selval)+'</span><em></em>');
					
					obj.on('mouseenter',function(){
						jQuery(selwrap).addClass(o.hoverclass);	
					}).on('mouseleave',function(){
						jQuery(selwrap).removeClass(o.hoverclass);	
					});
					obj.on('change', function(){
						//value = document.getElementById('roleid').options[document.getElementById('roleid').selectedIndex].text;
						value = obj.find('option:selected').text();
						jQuery(selwrap).find('span.'+o.filterclass).text(value);
					});
					
				});
			},
			shortdesc: function(options){
				var defaults = {
					charcount: 100, // No I18N
					scrollheight: 300, // No I18N
					moreclass: '.ui-textlink1', // No I18N
					moretext: 'more...', // No I18N
					lesstext: 'less', // No I18N
					lesscontrol: true
				}
				var options = $.extend(defaults, options);
				
				return this.each(function(){
					var o = options;
					var obj = $(this);
					var htmlheight = obj.height();
				
					if(htmlheight>200){
						jQuery(obj).css({height:o.scrollheight,overflow:'auto'}).css('margin-bottom',10);// No I18N
					}
				});
			},
			shortdesc2: function(options){
				var defaults = {
					charcount: 100, // No I18N
					moreclass: '.ui-textlink1', // No I18N
					moretext: 'more...', // No I18N
					lesstext: 'less', // No I18N
					lesscontrol: true
				}
				var options = $.extend(defaults, options);
				
				return this.each(function(){
					var o = options;
					var obj = $(this);
					var htmlcontent = obj.html();
					if(htmlcontent.length > o.charcount) {
							 
						var contentshow = htmlcontent.substr(0, o.charcount);
						var contenthide = htmlcontent.substr(o.charcount, htmlcontent.length - o.charcount);
						var html = contentshow + '<span class="morecontent"><span>' + contenthide + '</span>&nbsp;&nbsp;<b class="encl">[</b><span class="ui-textlink1 a-tag" role="button">' + o.moretext + '</span><b class="encl">]</b></span>';
						jQuery(this).html(html);
					}
					jQuery(o.moreclass).on('click', function(){
						if(o.lesscontrol)
						{
							if(jQuery(this).hasClass("less")) {
								jQuery(this).removeClass("less");
								jQuery(this).html(o.moretext);
							} else {
								jQuery(this).addClass("less");
								jQuery(this).html(o.lesstext);
							}
								//jQuery(this).parent().prev().toggle(); 
								jQuery(this).prev().prev().toggle(); 
								return false;
						}
						else
						{
							jQuery(this).prev().prev().show(); 
							jQuery(this).html('').closest('.morecontent').find('.encl').remove(); // No I18N
							return false;
						}
						});
				});
			}
		});
	})(jQuery);
	
	jQuery.expr.pseudos.icontains = function(a, i, m) {		        
   		 return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;		
 	};
}
function loadOnHoverEditIcon(jQueryObj){
		//jQuery('#ui-framework-design1 .ui-viewform .ui-formfield a').prepend('<i class="editspot"></i>');
		jQueryObj('#ui-framework-design1 .ui-viewform .ui-formfield').on('mouseenter', function(){ // No I18N
			if(jQueryObj(this).find('.ui-cancelicon').length!=0)
			{
				jQueryObj(this).closest('.ui-formfield').attr('class','ui-formfield editspot-n'); // No I18N
			}
			else if (jQueryObj(this).find('a').length!=0)
			{
				jQueryObj(this).attr('class','ui-formfield editspot-h');
				jQueryObj(this).find('a').on('click', function(){
					jQueryObj(this).closest('.ui-formfield').attr('class','ui-formfield editspot-n'); // No I18N
				});
				
			}
		}).on('mouseleave',function(){
			jQueryObj(this).attr('class','ui-formfield editspot-n');
		});
}
function freezeheader(){
	var tabpos = jQuery('.ui-tabs1').position();
	var contpos = jQuery('.ui-container-panel').position();
	var top1 = tabpos.top;
	var top2 = contpos.top;
	var t1 = top1-top2;
	var hfreezer = jQuery("<div class='disableheader'></div>");
	var h = t1+10;
	var t = top2;
	jQuery(hfreezer).css({top:t,height:h});
	jQuery(hfreezer).prependTo('body'); // No I18N
}

jQuery(document).ready(function() {
	showPlaceholder();
});

// To make the input case-insensitive.
jQuery.expr.pseudos.Contains = function (a, i, m) {//NO I18N
        return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;//NO I18N
};

function showPlaceholder(){
	// Cross-browser support for HTML5 'Placeholder' elements in Form Inputs//NO I18N
	jQuery.support.placeholder = false;
	ph = document.createElement('input'); // The reference to the element currently held in the createdElement will get garbage collected. There is no need to use delete. It should be cleaned up with any other variables in the function's scope.//NO I18N
	if('placeholder' in ph) { jQuery.support.placeholder = true; }//NO I18N
	
	if(!jQuery.support.placeholder) { 
		var active = document.activeElement;
		jQuery(':text, textarea').on('focus',function () {//NO I18N
			if (jQuery(this).attr('placeholder') !=undefined && jQuery(this).attr('placeholder') != '' && jQuery(this).val() == jQuery(this).attr('placeholder')) {//NO I18N
				jQuery(this).val('').removeClass('ph');
			}
		}).on('blur',function () {//NO I18N
			if (jQuery(this).attr('placeholder') !=undefined && jQuery(this).attr('placeholder') != '' && (jQuery(this).val() == '' || jQuery(this).val() == jQuery(this).attr('placeholder'))) {//NO I18N
				jQuery(this).val(jQuery(this).attr('placeholder')).addClass('ph'); //NO I18N
			}
		});
		jQuery(':text, textarea').trigger('blur');//NO I18N
		jQuery(active).trigger('focus');
		jQuery('form').on('submit', function () {//NO I18N
			jQuery(this).find('.ph').val('');//NO I18N
		});
	}
}
