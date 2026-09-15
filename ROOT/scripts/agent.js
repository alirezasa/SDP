/**
 * 
 * @param r : Rdp object 
 */
function startGatewayAgent(r){
    var downloadRef = document.getElementById('agentRef');

    if (navigator.appVersion.indexOf("Win")!=-1) {
        downloadRef.href="sg_agent.exe";
    } else if (navigator.appVersion.indexOf("Mac")!=-1) {
        downloadRef.href="sg_agent.zip";
    } else if (navigator.appVersion.indexOf("Linux")!=-1) {
        downloadRef.href="sg_agent.rpm";
    };


    var scardElm = document.getElementById('smartCardInfo');
    var btnBridgeElm = document.getElementById('btnBridge');
    if (!scardElm || !btnBridgeElm){
        hi5.notifications.notify("Failed to display Smart Card dialog, Smart Card redirection will be disabled.");
        r.run();
        return;
    }
    var bridgeURL = 'http://127.0.0.1:8095/bridge.html';
    btnBridgeElm.onclick = function(e) {
        window.__agentBridge = window.open(bridgeURL);
    };

    var isSSL = r.protocol == 'wss';
    if (isSSL){
        if (hi5.browser.isIE){
            hi5.notifications.notify("Sorry, Smart Card redirection is diabled because IE doesn't support cross-domain message.");
            r.run();
            return;
        }
    }else {
        var sslOption = document.getElementById('smartCardOptional');
        if (sslOption){
            sslOption.style.display = 'none';
        }
    }

    var scardDlg = new hi5.ui.Lightbox(scardElm);
    scardDlg.show();

    var _connected = false;
    scardDlg.onclose = function(){
        if (!isSSL){//connect to agent directly
            var ws = new WebSocket("ws://127.0.0.1:8095");
            ws.binaryType = "arraybuffer";
            
            r.onagentmessage = function(data){
                if (ws && ws.readyState == ws.OPEN){
                    ws.send(data);
                }else{
                    console.log('xxxx: ' + ws.readyState);
                }
            };
    
            ws.onopen = function(){
                _connected = true;
            };
        
            ws.onmessage = function (e) { // Received data (a byte array) from smart card agent
                if (r) {
                    r.writeAgent(e.data);
                }
            };
        
            ws.onclose = function () {
                // console.log("Agent closed the connection.");
                if (r) {
                    r.onagentmessage = null;
                }
                if (ws){
                    ws = null;
                    if (!_connected){
                        hi5.notifications.notify('Failed to connect to the Agent. Plase make sure the Agent is running. Smart card redirection will be disabled.');
                    }else{
                        hi5.notifications.notify('Agent was disconencted. Plase make sure the Agent is running. Smart card redirection will be disabled.');
                    }
                }
            };
        
            ws.onerror = function (evt) {
                if (ws) {
                    ws.close();
                }
            };
            
        }else {
            if (window.__agentBridge){//bridge.html is opened
                r.onagentmessage = function(data){
                    __agentBridge.postMessage(data, bridgeURL);
                }

                window.addEventListener('message', function(e){
                    if (r) {
                        r.writeAgent(e.data);
                    }
                }, false);
                
            }else{
                hi5.notifications.notify("New winodw for bridge.html is not opened. Smart card redirection will be disabled.");
            }

    
        }
   
        r.run();
    };
}