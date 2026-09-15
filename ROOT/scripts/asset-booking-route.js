// $Id$
var $asset_booking_route = {
  entity_id: null,
  current_page: null,
  previous_page: null,
  renderPage: function(options) {
    //previous_page is set
    this.previous_page = options.from ? options.from : this.current_page;
    //current_page is set
    this.current_page = options.mode;
    if(options.mode!="details"){
      var urlParams = 'mode=' + options.mode; //No I18N
    }
    jQuery('#asset-bookings-section').empty();
    if(options.mode=="details" || options.mode=="add"){
      jQuery('#left-panel-section').hide();
      jQuery('#Right-Section').removeClass('pt10').addClass("pt0");
    }else{
      jQuery('#left-panel-section').show();
    }
    jQuery("#template-customize-info").hide();
    jQuery('#asset-bookings-section').removeClass("fh");
    $asset_booking_list.store_criteria={};
    switch (options.mode) {
      case 'details': //No I18N
            var urlParams = 'mode=' + options.mode; //No I18N
            if (options.entity_id && options.entity_id != 'null') {
              urlParams += '&entity_id=' + options.entity_id; //No I18N
            }
          Handlebars.registerHelper('getmeta-object', function (metadata,indexVal) {//NO I18N
            var defaultValue = metadata.fields[indexVal] && metadata.fields[indexVal].display_name;
            return defaultValue;
          });
          Handlebars.registerHelper('getfield-object', function (bookedData,indexVal) {//NO I18N
              var defaultValue = bookedData[indexVal];
              if(indexVal=="booked_by"){
                  defaultValue = bookedData[indexVal].name;
              }else if(indexVal=="purpose"){//NO I18N
                  defaultValue = bookedData[indexVal] && bookedData[indexVal].name;
              }
              if(defaultValue && defaultValue.id){
                  defaultValue = defaultValue.name;
              }
              return defaultValue || '-';
          });
          $asset_booking_details.initDetails(options.entity_id);
          window.history.pushState({spa_skipstate: true}, '', '/ui/assets/bookings?' + urlParams);
         
          
        break;
      case 'add': //No I18N
        options.entity_id = null;
        $asset_booking_form.onLoad();
        break;
      case 'settings': //No I18N
        options.entity_id = null;
        $asset_booking_settings.onLoad();
        urlParams += window.location.hash ? window.location.hash : "#specification";//No I18N
        break;
      default:
        $asset_booking_list.onLoad();
    }
    (options.mode!="details") && window.history.pushState({spa_skipstate: true}, '', '/ui/assets/bookings?' + urlParams);//No I18N
    
  }
};
