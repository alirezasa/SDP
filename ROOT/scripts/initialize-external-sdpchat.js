//$Id$

var sdp_url = getSDPURL();
var title_interval = null;
var default_title = document.title;
var origin = window.origin;


var newDiv = document.createElement("div");
newDiv.style.background = "#333333";
newDiv.style.borderRadius  = "4px"; //No I18N
newDiv.style.bottom = "0";
newDiv.style.color = "white";
newDiv.style.cursor ="pointer";
newDiv.style.padding = "3px !important";
newDiv.style.position = "fixed";
newDiv.style.display = "none";
newDiv.style.right = "10px"; //No I18N
newDiv.style.zIndex = "10";
newDiv.style.height = "29px"; //No I18N
newDiv.setAttribute("id","external_sdp_chat");
document.body.appendChild(newDiv);


newDiv.addEventListener('click',function () {
	var html_content = jQuery("#me_sdp_chat_content_div").html();
	if(html_content !==""){
		jQuery("#external_sdp_chat").css('display','none'); // No I18N
		jQuery("#me_sdp_chat_content_div").css('display',''); // No I18N

	}
	else{
		loadSDPChat();
	}
});

const styleContent = ".ext-chat{position:fixed;bottom:15px;z-index:1000;right:15px;width:auto;float:right;}.ext-chat>button.btn{background-color:#315def;color:#FFF;border-radius:25px;padding:5px 15px 5px 5px;transition:transform 0.3s ease;transform-origin:center;will-change:transform;backface-visibility:hidden;box-shadow:0 3px 9px rgba(123,123,123,0.5);font-family:'Zoho Puvi',Arial;display:inline-block;margin-bottom:0;font-weight:normal;text-align:center;vertical-align:middle;cursor:pointer;background-image:none;border:1px solid transparent;white-space:nowrap;line-height:1.42857143;}.ext-chat>button.btn:hover{transform:scale(1.1) translateZ(0);}.ext-chat>button.btn>span.ec-icon{border-radius:25px;background-color:#567cf8;display:inline-flex;height:35px;width:35px;margin-right:5px;justify-content:center;align-items:center;}.ext-chat>button.btn>span.ec-txt{display:inline-flex;font-size:15px;justify-content:center;align-items:center;height:35px;vertical-align:top;}.ext-chat>button.btn>span.ec-icon>img{width:20px;height:20px;}";
const styleElement = document.createElement('style');
styleElement.type = 'text/css';
styleElement.appendChild(document.createTextNode(styleContent));
document.head.appendChild(styleElement);

const htmlContent = "<div class='ext-chat'><button class='btn' type='button'><span class='ec-icon'><img src='" + sdp_url + "images/ext-chat.svg' alt='Chat with us' class='icon-md'></span><span class='ec-txt'><span>Chat with us!</span></span></button></div>"
document.getElementById("external_sdp_chat").innerHTML = htmlContent;

if (typeof jQuery === "undefined") {
	var jsElm = document.createElement("script");
	jsElm.type = "text/javascript";
	jsElm.onload = function() {
        loadSDPChat();
    };
	jsElm.src = sdp_url+"scripts/jquery.min.js"; //No I18N
	document.body.appendChild(jsElm);
} else {
    loadSDPChat();
}
function setExternalIframe(height, width) {
    jQuery("#sdp_external_chat").height(height); //No I18N
    jQuery("#sdp_external_chat").width(width);	//No I18N
}

function minimizeIframe(data) {
	var chatId = data.id;
	var height = '29px', width = '300px'; //No I18N
	if(chatId != undefined && chatId != ""){
		width = '320px';	 //No I18N
		if(chatId == 'zia') {
    		height = '55px';    //NO I18N
			width = '55px';     //NO I18N
		} else if (chatId == 'livechat') {      //NO I18N
    		height = '28px';    //NO I18N
			width = '101px';     //NO I18N
		}
	}
	setExternalIframe(height, width);
}

function maximizeIframe(data) {
    var chatId = data.id;
    var height = '455px', width = '325px'; //No I18N
    var right = '10px';     // No I18N
    if(chatId != undefined && chatId != ""){
        if(chatId == 'zia') {
            width = '450px'; //No I18N
            height = jQuery(window).height() - 40;
        } else if (chatId == 'zia_livechat_bridge') {       // No I18N
            width = '408px'; //No I18N
            height = '415px'; //No I18N
        } else if (chatId == 'dialog') {       // No I18N
            width = window.innerWidth;
            height = window.innerHeight;
            right = '0px';  // No I18N
        } else if(chatId == 'preview_component') {      // No I18N
            width = '1140px'; //No I18N
            height = jQuery(window).height() - 40;
        } else {
            width = '320px'; //No I18N
            height = '477px'; //No I18N
        }
    } else {
        right = '5px' //No I18N
    }
    jQuery("#me_sdp_chat_content_div").css('right', right); //No I18N
	setExternalIframe(height, width);
}

function loadSDPChat()
{
	var chat_content_div = document.createElement("div");
	chat_content_div.style.bottom = "0";
	chat_content_div.style.color = "white";
	chat_content_div.style.position = "fixed";
	chat_content_div.style.right = "10px"; //No I18N
	chat_content_div.style.zIndex = "9999"; //No I18N
	chat_content_div.setAttribute("id","me_sdp_chat_content_div");
	document.body.appendChild(chat_content_div);

	var chat_notFrame = document.createElement("iframe"); //No I18N
        chat_notFrame.id = "sdp_external_chat"; //No I18N
        chat_notFrame.name = "sdp_external_chat"; //No I18N
        chat_notFrame.src = sdp_url+"externalCommFrame.do?origin="+origin+"&is_from_external_chat=true&is_initial_load=true"; //No I18N
	chat_notFrame.setAttribute("style", "visibility: visible; overflow: hidden;");
	chat_notFrame.setAttribute("width", "0");
	chat_notFrame.setAttribute("height", "0");
	chat_notFrame.setAttribute("frameborder", "0");
	chat_notFrame.setAttribute("scrolling", "no");
	chat_content_div.appendChild(chat_notFrame);

	window.addEventListener('message', (event) => {
    		processOutputMessage(event);
	});

	
	function processOutputMessage(e) {
		var data = e.data;
		if(e.originalEvent){
			data = e.originalEvent.data;
		}
		if(typeof data !="object"){
			data = JSON.parse(data);
		}
		if(data.type == 'disable_ext_chat'){
			jQuery("#external_sdp_chat").hide();
            jQuery("#sdp_external_chat").attr('src', '')
            setExternalIframe(150, 250);
            setTimeout(function() {
                var actionLink = '<p style="font-weight:normal;text-decoration:none;color:#1a6ebd;margin-top:20px;margin-bottom:10px;font-size: 13px;font-family: Verdana;display: inline-block;cursor: default">'+ data.message +'</p>'
                jQuery("#sdp_external_chat").contents().find('body').html('<div style="position: fixed;bottom: 0;right: 0;top: 0;border: 1px solid #ccc;"><div style="position:absolute;top:0px;width: 100%;height: 40px;background-color: #F4F4F9;z-index: 99;box-shadow: 0px 2px 1px #ccc;text-align:right;"></div><div style="background-color: #ffffff; position: relative !important;text-align: center;padding: 0px 20px;padding-top: 40px;height:100%">'+actionLink+'</div></div>');
            }, 50);
		}
		if(data.type== 'setExternalIframe'){
			setExternalIframe(data.height, data.width);
        }
		if(data.type== 'minimizeContent'){
            jQuery("#me_sdp_chat_content_div").hide();
            jQuery("#external_sdp_chat").show();
		}
		if(data.type === 'is_sdp_logged_in'){
			var is_user_loggedin = data.message;
			var showSamlLocalChoice = false;
			if(data.showSamlLocalChoice){
				showSamlLocalChoice = data.showSamlLocalChoice;
			}
			var mesg = "";
			var minimize_mesg = "Minimize";   //No I18N
			if(is_user_loggedin === 'false'){
                jQuery("#external_sdp_chat").show(); // No I18N
				jQuery("#me_sdp_chat_content_div").hide();
			}else{
				var navigation = data.navigation_type;
				jQuery("#external_sdp_chat").css('display',''); // No I18N
				var message = jQuery.parseJSON(data.message);
                // When external chat is disabled and chat is transferred_to_tech from inside SDP, chat is opened in external site too
                if (!(message.sdp_app.IS_SDP_EXT_CHAT_ENABLED && message.sdp_app.zia_info.IS_REQUESTER_CHAT_ACTIVE)) {
                    if(message.is_initial_load && message.sdp_app.zia_info.EMBED_ZIA_PORTALS.length > 0) {
                        minimizeIframe({'id':'zia'})    // No I18N
                    } else if (message.sdp_app.IS_SDP_CHAT_ENABLED && message.sdp_app.IS_SDP_EXT_CHAT_ENABLED) {
                        minimizeIframe({'id':'livechat'})    // No I18N
                    }
                }
                jQuery("#external_sdp_chat").css('display','none'); // No I18N
                jQuery("#me_sdp_chat_content_div").css('display',''); // No I18N
			}
		}

		if(data.type === 'minimize_iframe'){
			minimizeIframe(data);
		}
		if(data.type === 'maximize_iframe'){
			maximizeIframe(data);
		}

        if(data.type === 'change_portal'){
            var new_src = sdp_url + "externalCommFrame.do?origin=" + origin + "&is_from_external_chat=true&is_initial_load=false&PORTALID=" + data.portal_id; //No I18N
        	setExternalIframe(0, 0);
            jQuery("#sdp_external_chat").attr('src', new_src)
		}

		if(data.type === 'change_window_title'){
			var title = data.title;
			changeWindowTitle(title);
		}

		if(data.type === 'stop_toggling'){
			stopTitleToggling();
		}
	}


	

	function changeWindowTitle(title_mesg)
	{
		if(title_interval== null ){
			title_interval = setInterval(function(){
				var title = (document.title == default_title)? title_mesg : default_title;  //No I18N
				document.title = title;
			},900);

		}
	}

	function stopTitleToggling()
	{
		clearInterval(title_interval);
		title_interval = null;
		document.title = default_title;
	}
}


function getSDPURL()
{
	var url = "";
	var scripts = document.getElementsByTagName('script');
	var len = scripts.length;
	for(var i =0; i < len; i++) {
		if(scripts[i].src.search("initialize-external-sdpchat.js") > 0 && scripts[i].src.lastIndexOf("/") >= 0) {
			url = scripts[i].src.substring(0, scripts[i].src.lastIndexOf("/scripts/") + 1);
			break;
		}
	}
	return url;
}
