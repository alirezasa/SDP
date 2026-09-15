/* $Id $ */
/**
 * Will be called using the onClick event of any href. The configured url would be fetched, an additional param ajax would be added along to it and then the page would be loaded using jQuery. Will not be called when the user right click's the link and open's it in a new tab.
 */
jQuery(document).ready(function(e){
    /*jQuery(document).off('click','[noheader=true]').on('click','[noheader=true]',function(e){//No I18N

        var th = jQuery(this);
        var url = th.attr('href');
        if(url == undefined){
            url = th.data('url');//No i18n
        }
        sdpAjaxUrlHandler(url,th);
        return false;
    });*/
});

function ajaxUrlHandler(url,th){
  var pl_h = jQuery("#td-container");
  var tab_mod = jQuery('#sdp-tabs');
  var old_tab = tab_mod.find('li.active a');
  var old_tab_id = old_tab.attr('tab-name');
  if(url.indexOf("?") === -1) {
      url = url + "?noheader=true";//No I18N
  }
  else{
    url+="&noheader=true";//No I18N
  }
  jQuery.ajax({type: "GET", url: url , success: function(data) { // No I18N

      if (data.indexOf("j_username") > 0 && data.indexOf("j_password") > 0){// When the session times out and then the user clicks on any link, then the page will be refreshed
          location.href = url;
      }else{
          pl_h.html(data);
          jQuery('.page-progressbar').hide();
          scroll(0,0);
          // Code related to Tab color change handled here.
          var new_tab_id = selected_tab;
          if(old_tab_id !== new_tab_id){
              tab_mod.find('li').removeClass('active').find('[tab-name="'+new_tab_id+'"]').parent().addClass('active');
          }
          // Fixing of the menu bar in the details page would have been invoked after the page loads.
          floatingmenubarscroll();
		  //hiding navigation menus
		  jQuery('.btn-group').removeClass('open');
		  closeDialog();
      }
  }});
}

function sdpAjaxUrlHandler(url,th){
    if(window.externalframe) {
      url = url + (url.indexOf("?") > -1 ? "&" : "?") + "externalframe=true";
    }
    jQuery('.page-progressbar').show();
    var ajax_tabs = ['home','requests'];//No i18n
    var tab_mod = jQuery('#sdp-tabs');
    var old_tab = tab_mod.find('li.active a');
    var old_tab_id = old_tab.attr('id');
    var pl_h = jQuery("#td-container");
    if((window.externalframe || ajax_tabs.indexOf(old_tab_id) != -1) && pl_h.length > 0) {
        window.history.pushState({url:url}, '', url);
        ajaxUrlHandler(url,th);
    }else{
        location.href = url;
    }
}

/*jQuery(window).on('popstate', function(event) {
    var state = event.originalEvent.state;
    if (state) {
        ajaxUrlHandler( state.url );
    }
    else{
      ajaxUrlHandler(location.pathname+location.search);
    }
});*/
