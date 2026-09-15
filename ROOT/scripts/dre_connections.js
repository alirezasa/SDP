/* $Id:$ */
var sdp_app = {};

async function encryptDreConnAuthenticationData(data, key){
    this.sdp_app.PUBLIC_KEY_FOR_PWD_ENCRYPTION = key;
    await this.loadSDPSecurityScript('/scripts/forge_1.3.1.min.js'); //NO I18N
    await this.loadSDPSecurityScript('/scripts/sdp_security.js'); //NO I18N
    return this.encryptWithAES(data);
}

function loadSDPSecurityScript(url){
    return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = () => resolve();
        document.head.appendChild(script);
    });
}





