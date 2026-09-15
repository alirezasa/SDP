/* $Id $ */

var $zoho=$zoho || {};
$zoho.salesiq = $zoho.salesiq || {widgetcode:"e6219f06ca715911e95decc200f1ab04862da3febf660678d28bc291d7584af0", values:{},ready:function(){}};//NO I18N

var z_d=document;
var z_s=z_d.createElement("script");
z_s.type="text/javascript";
z_s.id="zsiqscript";
z_s.defer=true;
z_s.src="https://salesiq.zoho.com/widget";
var z_t=z_d.getElementsByTagName("script")[0];
z_t.parentNode.insertBefore(z_s,z_t);
//z_d.write("<div id='zsiqwidget'></div>");

$zoho.salesiq.ready=function(embedinfo){
    if(!sdp_app.IS_DEMO_BUILD)
    {
        $zoho.salesiq.visitor.name(sdp_user.USERNAME);
        $zoho.salesiq.visitor.email(sdp_user.EMAILID);
    }
   // Ending chat session
    jQuery('#logoutLink').on('click', function() {
        $zoho.salesiq.chat.complete();
        return true;
    });
}
