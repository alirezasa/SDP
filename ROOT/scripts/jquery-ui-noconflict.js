jQuery.widget.bridge('uitooltip', jQuery.ui.tooltip);
/**
* Issue fix SD-84865
*/
var jQBody = jQuery("body");
jQuery.widget("sdp.dialog", jQuery.ui.dialog, {
    open: function() {
	    setTimeout(function() {
	    	if(jQBody.find('.ui-widget-overlay').length != 0  ){
		        jQBody.addClass('of-h');
	    	}else{
		        jQBody.removeClass('of-h');
	    	}
			/** After dialog opened CSP common event calling  **/
			$sdEventListener('.ui-dialog');//NO I18N
	    },50);
        return this._super();
    },
    close: function() {
        jQBody.removeClass('of-h');
    	return this._super();
    }
});
