/* $Id$ */

/**
 * PLUGINS
 * toggleButtons, toggleSlider, menuColorPicker, disableTableRows
 */

/**
 * COMMON UTILITY 
 * limitWidth, limitHeight, getWidth, getHeight, getDirection, scrollTopos
 */
(function($){
    $.fn.extend({ 
        settings: {
            cl: ['btn-default','btn-primary','btn-secondary','btn-success','btn-info','btn-warning','btn-danger'] //NO I18N
        },
        // CUSTOM SELECT
        customselect: function(options){
            var cswrapper = jQuery(document.createElement('div')).addClass('customselect');
            return this.each(function(){
                var obj = jQuery(this);
                obj.wrap(cswrapper);
                var objclass = obj.attr('class'); //NO I18N
                var csoverlay =  jQuery(document.createElement('span')).addClass('csoverlay '+objclass);
                obj.before(jQuery(csoverlay));
                jQuery(csoverlay).css({width:obj.outerWidth(),height:obj.outerHeight()}).append('<span>'+obj.val()+'</span><em></em>');
                obj.on('change', function(){
                    jQuery(csoverlay).find('span').text(jQuery(this).val());
                });
            });
        },

        tableScroller: function(options){
            var defaults = {
                tableclass: null,
                navclass: null
            }
            var options = jQuery.extend(defaults, options);
                return this.each(function(){
                    var obj = jQuery(this),
                            opt = options,
                            tableclass = jQuery(opt.tableclass),
                            tableh = tableclass.find('thead'),
                            srchrow = tableclass.find('.searchRow'),
                            // clone the table <thead> to put this cloned section under #thead div to make it sticky
                            thwrap = tableh.clone(),
                            wraphead = jQuery(document.createElement("div")).attr('id','thead'), //NO I18N
                            wrapbody = jQuery(document.createElement("div")).attr('id','tbody').css('width','100%'), //NO I18N
                            // Get all the <table> attributes to append in the table under cloned #thead div
                            attributes = tableclass.prop("attributes"); //NO I18N
                            
                    wraphead.insertBefore(tableclass).html(thwrap).wrapInner('<table/>'); //NO I18N
                    if(srchrow.length==1)
                            { srchrow.insertAfter(wraphead.find('thead')).wrap('<tbody/>'); } //NO I18N
                    if(opt.navclass!=null) {
                         var nav = jQuery(opt.navclass);
                         freezeoffset = nav.offset().top;
                    }
                    else {
                        freezeoffset =wraphead.offset().top;
                    }
                    jQuery.each(attributes, function() {
                            jQuery(wraphead).find('table').attr(this.name, this.value);
                    });
                    tableh.remove();
                    tableclass.wrap(wrapbody);
                    wrapbody = tableclass.closest('div'); //NO I18N
                    wraphead.css({
                        'overflow':'hidden', //NO I18N
                        'width':wrapbody.scrollWidth+'px' //NO I18N
                    });
                    wrapbody.css('margin-top',0); //NO I18N
                    wraphead.find('table tr th').each(function (i){
                        jQuery(this).find('div').width(jQuery(wrapbody.find("tr:nth-child(2) td")[i]).width());
                    });
                    jQuery(window).on('scroll',function(){ //NO I18N
                        var scrolltop = jQuery(this).scrollTop();
                        var tboffset =wrapbody.offset();
                        wraphead.css('left',tboffset.left); //NO I18N
                        var cssprop = {'position':'fixed','left':tboffset.left - jQuery(window).scrollLeft()}; //NO I18N
                        if(scrolltop>=freezeoffset)
                        {
                            wraphead.scrollLeft(jQuery(this).scrollLeft());
                            if(opt.navclass!=null) {
                                nav.css(cssprop).css({'top':0,'z-index':3,'width':(wrapbody[0].clientWidth+2)+'px','margin':'0'}); //NO I18N
                                navouter = nav.outerHeight();
                            }
                            else {
                                navouter = 0;
                            }
                            wraphead.css(cssprop).css({'top':navouter,'z-index':2,'width':wrapbody[0].clientWidth+'px'}); //NO I18N
                            wrapbody.css({'margin-top':navouter+wraphead.height(),'z-index':1,'position':'relative'}); //NO I18N
                        }
                        else
                        {
                            wraphead.css({
                                'position':'static', //NO I18N
                                'top':'auto', //NO I18N
                                'width':wrapbody[0].scrollWidth+'px' //NO I18N
                            });
                            if(opt.navclass!=null) {
                                nav.css('position','static'); //NO I18N
                            }
                            wrapbody.css('margin-top',0); //NO I18N
                        }
                    });
            });
        },

        toggleRadio: function(){
            var btn_cl = this.settings.cl;
            return this.each(function(){
                var el = jQuery(this),
                        label;
                el.find('input[type=radio]').on('click',function(){ //NO I18N
                    label = jQuery(this).closest('label'); //NO I18N
                    jQuery(btn_cl).each(function(i,val){
                        if(label.siblings('.'+val).length>0) { label.addClass(val).siblings().removeClass(val); }
                    });
                    label.siblings().addClass('btn-default');
                });
            });
        },
        
        /*
        Plugin Name: 
        toggleButtons
        Plugin Usage:
        By default, Bootstrap btn-group buttons lose active state when clicking anywhere outside. The plugin toggleButtons() will retain the active state class.
        Init via markup:
        Add data-button-group="true" to the element with .btn-group class.
        Init via javascript:
        jQuery.fn.toggleButtons();
        Used In:
        Template Catalog (Catalog Filter Buttons)
        */
        toggleButtons: function(){
            var btn_group = jQuery('*[data-button-group=true]');//NO I18N
            var btn_cl = this.settings.cl;
            btn_group.each(function(){
                var btngroup = jQuery(this),
                    btn		 = btngroup.find('.btn'),//NO I18N
                    cur_btn;
                btn.on('click',function(){ //NO I18N
                    cur_btn = jQuery(this);
                    jQuery(btn_cl).each(function(i,val){
                        if(cur_btn.siblings('.'+val).length>0) { cur_btn.addClass(val).siblings().removeClass(val); }//NO I18N
                    });
                    cur_btn.siblings().addClass('btn-default');//NO I18N
                });
            });
        },
        
        /* 
        Plugin Name: 
        toggleSlider
        Plugin Usage: 
        Toggle Switch Button Component.
        jQuery('#toggle1').toggleSlider()
        Example:
        jQuery('#toggle1').toggleSlider({slider:false,buttonSize:'btn-xs',activeClass:'btn-warning'});
        Params:
        slider - true/false. Applies sliding animation
        buttonSize: btn-xs/btn-sm/btn-md/btn-lg. Defines button size
        activeClass: btn-success/btn-warning/btn-info/btn-primary/btn-secondary. Defines button style
        Used In:
        Create Task Form (mark/assign buttons)
        */			
        toggleSlider: function(options){
            var defaults = {
                slider: false,
                buttonSize: 'btn-sm',//NO I18N
                activeClass: 'btn-default' //NO I18N
            }
            var statusClass;
            var options = jQuery.extend(defaults, options);
            // bootstrap button classes
            var btn_cl = this.settings.cl;
            // structure
            var container = jQuery('<div class="btn-group"></div>'),  //NO I18N
                label = jQuery('<label class="btn '+options.buttonSize+' btn-default defaultbtn"></label>'); //NO I18N
            return this.each(function(){
                var obj = jQuery(this);
                /* check to prevent multiple initialization */
                if(obj.find('.btn-group').length==0) {
                    var	opt = options,
                        outerW, outerH, dir, active, disabled;
                    obj.addClass('btn-toggle').wrapInner(container);  //NO I18N
                    obj.find('input[type=radio]').each(function(){  //NO I18N
                        jQuery(this).wrap(label).after(jQuery(this).attr('data-value')); //NO I18N

                        // default states
                        disabled = (jQuery(this).is(':disabled')) ? true: false; //NO I18N
                        active = (jQuery(this).is(':checked')) ? true : false; //NO I18N
                        var statusClass = (active) ? opt.activeClass : '';
                        if(disabled) { jQuery(this).closest('label').addClass('disabled'); }   //NO I18N
                        if( opt.slider == false ){
                            if(active) { jQuery(this).parent().removeClass('btn-default').addClass(statusClass); }
                        }
                    });
                    if(opt.slider!=true) {
                        if(!disabled) {
                             obj.find('input[type=radio]').on('click',function(){ //NO I18N
                                label = jQuery(this).closest('label'); //NO I18N
                                jQuery(btn_cl).each(function(i,val){
                                    if(label.siblings('.'+val).length>0) { label.addClass(val).siblings().removeClass(val); }
                                });
                                label.siblings().addClass('btn-default');  //NO I18N
                            });
                        }
                    }
                    else {
                        obj.addClass( 'btn-toggle-slide' ); //NO I18N
                        oW     = obj.find( 'label' ).getWidth( true,true ); //NO I18N
                        oH     = obj.find( 'label' ).getHeight( true,true ); //NO I18N
                        outerW = oW / 2;
                        outerH = oH / 2;
                        obj.css({ 'width' : oW+'px' , 'height' : oH+'px' }).find( '.btn-group' ).css({ 'width' : oW*2 , 'height' : oH+'px' }).find( 'label' ).css( 'width' , oW+'px' ); //NO I18N
                        var spot        = jQuery(document.createElement('span'));//NO I18N
                        var spotClass = (disabled) ? 'toggle-spot disabled': 'toggle-spot'; //NO I18N
                        spot.addClass(spotClass).insertAfter(obj.find('.btn-group'));  //NO I18N
                        obj.find('.toggle-spot').css({'width':oH-2+'px','height':oH-2+'px','top':'1px'}); //NO I18N
                        var mainclass = obj.find( '.btn-group' )  //NO I18N
                        if(!disabled) {
                            onlineOfflinecheck();
                            function onlineOfflinecheck(){
                                if( mainclass.find( 'label:first input[type=radio]' ).is( ':checked' ) == true ){  //NO I18N
                                    obj.find( '.btn-group label:first' ).removeClass( 'btn-default toggle-slider-anim1' ).addClass( options.activeClass+' toggle-slider-anim2' ).end().find( '.toggle-spot' ).removeClass( 'toggle-spot-anim' ); //NO I18N
                                }
                                else{
                                    obj.find( '.btn-group label:first' ).removeClass( 'btn-default' ).addClass( 'toggle-slider-anim1 '+options.activeClass ).end().find( '.toggle-spot' ).addClass( 'toggle-spot-anim' ); //NO I18N
                                    setTimeout(function(){
                                        obj.find( '.btn-group label:first' ).addClass( 'toggle-slider-anim2' );
                                    },100);
                                }
                            }
                            obj.on( 'click' , function(){ //NO I18N
                                if( mainclass.find( 'label:first input[type=radio]' ).is( ':checked' ) == true ){  //NO I18N
                                    mainclass.find( 'label:first' ).find( 'input[type=radio]' ).prop( 'checked' , false ).end().siblings().find( 'input[type=radio]' ).prop( 'checked' , true );  //NO I18N
                                }
                                else{
                                    mainclass.find( 'label:first' ).find( 'input[type=radio]' ).prop( 'checked' , true ).end().siblings().find( 'input[type=radio]' ).prop( 'checked' , false ); //NO I18N
                                }
                                onlineOfflinecheck();
                            });
                        }
                    }
                }
            });
        },			
        
        // Plugin Name: menuColorPicker
        // Plugin Usage: Color indicator & picker for dropdown menus
        // Used In: 'Priority' & 'Status' menus
        menuColorPicker: function(){
            return this.each(function(){
                var obj = jQuery(this);
                obj.on('change', function(){
                var cur			= jQuery(this),
                    cur_option  = cur.find("option:selected"),
                    cur_color	= cur_option.attr('data-border'),//NO I18N
                    indicator 	= cur.closest('.pipe');//NO I18N
                indicator.css('border-color',cur_color);//NO I18N
                });
            });
        },
        
        // Plugin Name: disableTableRows
        // Plugin Usage: disables/enables rows in a table with optional 'click' event prevention
        // Used In: Custom Schedules List View			
        disableTableRows : function( jsonArray ) {
            element = jQuery( this ); //change tooltip content
            if ( element.hasClass( 'sdp-glyph-ok-circle' ) ){
                element.attr( 'title' , jsonArray.disableTooltipText ).uitooltip({ content: jsonArray.disableTooltipText });//NO I18N
            }
            else{
                element.attr( 'title' , jsonArray.enableTooltipText ).uitooltip({ content: jsonArray.enableTooltipText });//NO I18N
            }
            return this.on('click', function( event ){
                        that = jQuery( this ),
                        DisableEdit = that.closest( 'tr' );//NO I18N
                        if ( jsonArray.isClickEnabled == true ){ // diabling click event on anchor tags
                            DisableEdit.find( 'td' ).on( 'click', function (e){ //NO I18N
                                allElement = DisableEdit.find( 'td *' );                        
                                if ( that.hasClass( 'sdp-glyph-ok-circle' ) ){
                                    allElement.removeAttr( 'style' ); //NO I18N
                                }
                                else{
                                    allElement.css( 'cursor','default' ); //NO I18N
                                    that.css( 'cursor','pointer' ); //NO I18N
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            });
                        }
                        //change icon and opacity 
                        if ( that.hasClass( 'sdp-glyph-ok-circle' ) ){
                                that.attr({
                                    'class':'sdp-glyph sdp-glyph-ban-circle text-danger',//NO I18N
                                    'title':jsonArray.enableTooltipText//NO I18N
                                }).uitooltip({ content: jsonArray.enableTooltipText }); //NO I18N
                                DisableEdit.find('td').attr( 'class' , 'opac5' ); //NO I18N
                                if( jsonArray.disableIconColor == 'gray' ){
                                    that.addClass( 'text-muted' );//NO I18N
                                }
                        }
                        else{
                            that.attr({
                                'class':'sdp-glyph sdp-glyph-ok-circle text-success',//NO I18N
                                'title':jsonArray.disableTooltipText//NO I18N
                            }).uitooltip({ content: jsonArray.disableTooltipText }); //NO I18N
                            DisableEdit.find('td').removeAttr( 'class' ); //NO I18N
                            if( jsonArray.disableIconColor == 'gray' ){
                                that.removeClass( 'text-muted' );//NO I18N
                            }
                        }
                        that.removeAttr( 'title' ); //NO I18N
                    });
        },
        
        // --------------------
        // COMMON UTILITIES
        // --------------------			
        /* COMMON UTILITY - limitWidth: sets minimum or maximum width for elements.
        Set limitWidth(true) to set maximum width */
        limitWidth: function(max){ // max = true
            var limit = (max) ? 'max' : 'min'; //NO I18N
            var y = this.width( Math[limit].apply(this, jQuery(this).map(function(i,e){
             return jQuery(e).width();
            }).get() ) );
        },
        
        /* COMMON UTILITY - limitHeight: sets minimum or maximum height for elements.
        Set limitHeight(true) to set maximum height */
        limitHeight: function(max){ // max = true
            var limit = (max) ? 'max' : 'min'; //NO I18N
            var y = this.height( Math[limit].apply(this, jQuery(this).map(function(i,e){
             return jQuery(e).height();
            }).get() ) );
        },
        
        /* COMMON UTILITY - getWidth: returns minimum or maximum width of elements.
        Set getWidth(true) to return maximum width */
        getWidth: function (max,outerW){ // max = true
            var limit = (max) ? 'max' : 'min'; //NO I18N
            if(!outerW)
                { var maxW = Math[limit].apply(Math, jQuery(this).map(function(){ return jQuery(this).width(); }).get()); }
            else
                { var maxW = Math[limit].apply(Math, jQuery(this).map(function(){ return jQuery(this).outerWidth(); }).get()); }
            return maxW;
        },
        
        /* COMMON UTILITY - getHeight: returns minimum or maximum height of elements.
        Set getHeight(true) to return maximum height */
        getHeight: function (max,outerH){ // max = true
            var limit = (max) ? 'max' : 'min'; //NO I18N
            if(!outerH)
                { var maxH = Math[limit].apply(Math, jQuery(this).map(function(){ return jQuery(this).height(); }).get()); }
            else
                { var maxH = Math[limit].apply(Math, jQuery(this).map(function(){ return jQuery(this).outerHeight(); }).get()); }
            
            return maxH;
        },
        
        /* COMMON UTILITY - getDirection: detects & returns browser directions - ltr or rtl */
        getDirection: function(){
            var browserDir = jQuery("body").css("direction").toLowerCase(); //NO I18N
            return browserDir;
        },

        /* COMMON UTILITY - scrollTopos element to element 
        element - which element to scroll (body, some scroll above element)
        to - element offsetTop position to scroll
        duration - time
        */
        scrollTopos: function(element, to, duration){
            //to = to.offsetTop
            if (duration <= 0) return;
            var difference = to - element.scrollTop;
            var perTick = difference / duration * 10;
            setTimeout(function() {
                element.scrollTop = element.scrollTop + perTick;
                if (element.scrollTop == to) return;
                jQuery.fn.scrollTopos(element, to, duration - 10);
            }, 10);
        }
    });
})(jQuery);
