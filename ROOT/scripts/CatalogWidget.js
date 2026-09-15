/* $Id $ */
/** This object used for making catalog widgets on the SSP page and Requester page.**/
var catalog_widget={
      /** Get current time. **/
      getCurrentTime : function(){
          var current_date = new Date();
          return current_date.getTime();
      },
      /** Get hostname. **/
      getHostName : function(){
          var window_location = window.location;
          return window_location.protocol + "//" + window_location.host;
      },
      /** Get Catalog data id **/
      getCatalogDataId : function(widget_name){
          var data_id;
          /** note : widget_name is I18N key. That's why we have used getMessageForKey **/ 
          /** Request catalog data id **/
          (widget_name == getMessageForKey("common.req.requestcatalog")) ? data_id = "request_catalog" : ""; //No I18N
          /** Incident catalog data id **/
          (widget_name == getMessageForKey("common.tech.issuecatalog")) ? data_id = "incident_catalog" : ""; //No I18N
          /** Service catalog data id **/
          (widget_name == getMessageForKey("common.servicecatalog")) ? data_id = "service_catalog" : ""; //No I18N
          return data_id;
      },
      /** Construct catalog related data. **/
      constructCatalogObject : function(widget_obj){
          var catalog_obj={};
          /** note : widget_name is I18N key. That's why we have used getMessageForKey **/ 
          /** Request catalog **/
          (widget_obj.widget_name == getMessageForKey("common.req.requestcatalog")) ? catalog_obj = {"catalog_id":"request_catalog","catalog_module":"mergedRequest"} : ""; // No I18N
          /** Incident catalog **/
          (widget_obj.widget_name == getMessageForKey("common.tech.issuecatalog")) ? catalog_obj = {"catalog_id":"incident_catalog","catalog_module":"incident"} : ""; // No I18N
          /** Service catalog **/
          (widget_obj.widget_name == getMessageForKey("common.servicecatalog")) ? catalog_obj = {"catalog_id":"service_catalog","catalog_module":"serviceRequest"} : ""; // No I18N
          /** For Requester login **/
          catalog_obj.is_requester = (widget_obj.is_requester) ? 'true' : 'false';
          /** For Role check **/
          catalog_obj.is_SDAdmin = (sdp_user.ROLES.indexOf("SDAdmin") !== -1) ? 'true' : 'false';
          /** Return catalog compiled HTML **/
          var templateURL = this.getHostName()+"/Templates.do?module="+catalog_obj.catalog_module+"&noheader=true&"+this.getCurrentTime(); // No I18N
          if(sdp_user.USERTYPE=='Requester') {
            templateURL += "&externalframe=true"; // No I18N
          }
          return {"widget_id":catalog_obj.catalog_id,"widget_url":templateURL,"is_requester":catalog_obj.is_requester,"is_SDAdmin":catalog_obj.is_SDAdmin}; // No I18N
      } 
}