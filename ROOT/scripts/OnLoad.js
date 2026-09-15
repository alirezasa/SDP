/* $Id$ */

/**
 * Scripts that need to be called while the page is loading.
 */

function setMinLeftPanelHeight(){
    if(document.getElementById("Right-Section") != null) {
        var rightHt = document.getElementById('Right-Section').clientHeight;//No i18N
        var ltSec = document.getElementById('Left-Section');
        var leftHt = (ltSec) ? ltSec.clientHeight : null;    //No i18N
        var openInd =  document.getElementById('LeftIndicator');//No i18N
        var closedInd =  document.getElementById('LeftIndicatorClosed');//No i18N

        if(rightHt > leftHt) {
            if(openInd) { openInd.style.height = rightHt; }
            if(closedInd) { closedInd.style.height = rightHt; }
        }
        else {
            if(openInd) { openInd.style.height = leftHt; }
            if(closedInd) { closedInd.style.height = leftHt; }
        }
    }
}
