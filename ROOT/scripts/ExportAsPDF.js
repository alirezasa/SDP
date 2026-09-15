// $Id$
var system = require('system');	// No I18N
var args = system.args;
var page = require("webpage").create(); // No I18N
var height_length = parseInt(system.args[7])
var width_length = parseInt(system.args[6])
if(width_length*0.25>height_length)
{
	height_length = width_length*0.25;
}

if(height_length<600)
{
	height_length =600
}
height_length = height_length*2
	

width_length = width_length*1.5;
//SD-111061, included portal id in phantom.addCookie inorder to fix exportaspdf issue in other portals
phantom.addCookie({
    'name': 'PORTALID', // No I18N
    'value': system.args[10],//portalid
    'domain': system.args[4]
    });

phantom.addCookie({
    'name': 'SDPSESSIONID', // No I18N
    'value': system.args[1],//Session id
    'domain': system.args[4] // No I18N    Server Name
    });
phantom.addCookie({
	'name': 'JSESSIONIDSDP', // No I18N
	'value': system.args[8],//jssionidsso
	'domain': system.args[4] // No I18N    Server Name
	});

page.customHeaders = {
  "PORTALID": system.args[9]
};

var url = (system.args[2]).toString();


if (url.indexOf('Workflow') != -1) 
{
	height_length = parseInt(system.args[7])*1.25;
	width_length = parseInt(system.args[6])*1.25;
	page.viewportSize = {
		width: width_length,
		height: height_length
	};
}

page.open(system.args[2], function(status) {   //url tobe invoked
	if (status !== 'success') {

        phantom.exit();
    } else {

    	if( (navigator.appVersion != null && navigator.appVersion.toLowerCase().indexOf('linux') != -1 && url.indexOf('Workflow') == -1) || url.indexOf('jobSheet') != -1){

			if( url.indexOf('Gantt') != -1 ){
				page.paperSize={

					width:parseInt(system.args[6]),
		    		height:parseInt(system.args[7])* ((parseInt(system.args[7]) < 1000) ? 3 : 2.5)
				}
			}else if(url.indexOf('jobSheet') != -1){

				page.paperSize={
			
					width:parseInt(system.args[6]),
		    		height:parseInt(system.args[7])
				}
			} else{

				page.paperSize={

					width:parseInt(system.args[6])*1.5,
		    		height:parseInt(system.args[7])* ((parseInt(system.args[7]) < 1000) ? 2 : 1.5)
				}
			}
		} else{
			if (url.indexOf('Gantt') != -1 ) {
            			page.paperSize={
            				width:parseInt(system.args[6])/1.5,
            	    		height:parseInt(system.args[7])* ((parseInt(system.args[7]) < 1000) ? 3 : 2.5)
            			}
            		} else {
            			page.paperSize = {
                                width:width_length,
                                height:height_length
                            }
            }
		}

    }
});

page.onLoadFinished = function(status) {
      // Need extra time for rendering task dependencies.
      if (url.indexOf('TaskDependencies') != -1 || url.indexOf('Workflow') != -1) {
        setTimeout(function () {
            page.render(system.args[3]);
            phantom.exit();
        }, parseInt(system.args[5]) + 3000);
      } else {
            page.render(system.args[3]);
            phantom.exit();
      }
};