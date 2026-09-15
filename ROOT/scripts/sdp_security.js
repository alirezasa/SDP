/* $Id$ */

/**To get CSRF param and Value**/
function getCSRFParamValue()
{
   return getCSRFCookie(getCSRFCookieName());
}
function getCSRFCookieName()
{
     return "sdpcsrfcookie";//NO I18N
}
function getCSRFParamName()
{
    return "sdpcsrfparam";//NO I18N
}
/**Security Team code https://intranet.wiki.zoho.com/securitydev/CSRF.html#CSRF_Prevention**/
function getCSRFCookie(name)
{
    var cookie_name = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++)
    {
        var c = ca[i].trim();
        if (c.indexOf(cookie_name) === 0)
        {
            return c.substring(cookie_name.length, c.length);
        }
    }
    return "";
}
/**To get CSRF param and Value**/
function getCSRFParamURL(isFirstParam) {
    var csrf_params = getCSRFParamName()+"="+getCSRFParamValue();
    if(isFirstParam != undefined && isFirstParam === true) {
        csrf_params = "?"+csrf_params;
    }
    else {
        csrf_params = "&"+csrf_params;    
    }
    return csrf_params;
}

/** Add CSRF to given object**/
function addCSRF(obj){
    obj[getCSRFParamName()] = getCSRFParamValue();
}

/*
To encrypt the clear text password being transmitted from the client
Note: To use the below function, the forge.min.js file must be imported in the respective client page.
 */
function encryptDataWithRSA(data) {
  if(sdp_app != undefined && sdp_app.PUBLIC_KEY_FOR_PWD_ENCRYPTION) {
    var publicKey = '-----BEGIN PUBLIC KEY-----' + sdp_app.PUBLIC_KEY_FOR_PWD_ENCRYPTION + '-----END PUBLIC KEY-----';//NO I18N
    var pkey = forge.pki.publicKeyFromPem( publicKey )
    let utf8_encoded_data=forge.util.encodeUtf8(data)
    var enc = pkey.encrypt( utf8_encoded_data, 'RSA-OAEP',//NO I18N
    {
        md : forge.md.sha256.create(),
        mgf1: { md:forge.md.sha256.create()}
    });
    return forge.util.encode64(enc);
  }
  return data;
}

/**
 To encrypt the given data with AES-CBC mode. Will return a object contains encryptedvalue and key, iv values used for encryption.
Encryption key and iv are encrypted with RSA encryption to avoid middle man attacks.

Note : To use the below function, the forge.min.js file must be imported in the respective client page.

**/
function encryptWithAES(data)
{
  if(sdp_app != undefined && sdp_app.PUBLIC_KEY_FOR_PWD_ENCRYPTION) {
    var iv = forge.random.getBytesSync(16);

    var key = forge.random.getBytesSync(16);
    var cipher = forge.cipher.createCipher('AES-CBC', key);//NO I18N
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(data));
    cipher.finish();
    var encrypted = btoa(cipher.output.getBytes());
   
    key = btoa(key);
    iv = btoa(iv);

    //encoding key and iv with RSA
    var encryptedKey = encryptDataWithRSA(key);
    var encryptedIV = encryptDataWithRSA(iv);

    var param = {};
    param.encryptedvalue = encrypted ;
    param.key = encryptedKey;
    param.iv =  encryptedIV;
    return param;
  }
  return data;
}
