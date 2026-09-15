/*
 * 
 * @param {type} url
 * @param url - url to be modified
 * @param newwindow - can take values boolean true, boolean false, string name of window
 * @returns null
 */

function appendDID(url, newwindow){
    var redirectWindow = '';
    
    if(newwindow){
        redirectWindow = window.open('','_blank');
    }
    else if(newwindow!=false){
        redirectWindow = window.open('',newwindow);
    }
    if(newwindow!=false){
        redirectWindow.location.href = url;
    }
    else{
       window.location.replace(url);
    }

    return false;
}
