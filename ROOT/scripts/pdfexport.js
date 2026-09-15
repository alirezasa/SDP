/*
 options={
      height:`${window.screen.height}`, height of the screen
      width:`${window.screen.width}`, width of the screen
        url:window.location.toString().replace(window.location.origin,""), url to be exported
        puppeteer: {
          waitUntil: 'networkidle2',
            timeout:0 //Maximum wait time in milliseconds. Pass 0 to disable the timeout. 
            load - navigation is finished when the load event is fired.
            domcontentloaded - navigation is finished when the DOMContentLoaded event is fired.
            networkidle0 - navigation is finished when there are no more than 0 network connections for at least 500 ms.
            networkidle2 - navigation is finished when there are no more than 2 network connections for at least 500 ms.
        },
        pdf:{
            height:'170',
            width:'2000',
            scale:'1.0-2.0',
            margin:{
                left:0,
                right:0,
                bottom:0,
            },
            format:'A4|Letter',
            printBackground:true
        },
        pdf_settings:{
              element:'',//element
              header:true, // if header is false then noheader=true parameter is passed
        },
       page_settings:{
        timeout:"30", //page timeout
        css: '.ui-helper-hidden {display: none;}' //custom css
        waitfor_selector:'#myElement' //waits untill this element is found
        viewport:{
            height:800 view  height
            width:900 view width
        }
    },
        options:{
          html:false, //if true is passed content string should passed
          content:'hello world' //this is converted to pdf
          configurePdfprop:true, //default properties for height and width of the pdf is configures
        },
        prefunction:()=>{}, this function is called before the pdf call 
        show_loading:()=>{  
          jQuery(".page-progressbar").show();
        },
        hide_loading:()=>{  jQuery(".page-progressbar").hide();}
        }
      }
      
     HTML Examples

     exportPdf({
        file_name:'htmlexample1'
        options:{
            html:true,
            content:'html string'
        }
     })
      exportPdf({
        file_name: 'htmlexample2',
        pdf_settings:{
            element:'#myElement',
        }
        });


     URL Example
     
     exportPdf();
     
     
     
      */

function exportPdf(options) {
    function generateFileName() {
			const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
			const timestamp = Date.now(); // Get the current timestamp
			return `${timestamp}-${randomString}`;
		  }
		  
    default_options = {
        height: `${window.screen.height}`,
        width: `${window.screen.width}`,
        url: window.location.toString().replace(window.location.origin, ""),
        fileName: generateFileName(),
        puppeteer: {
            waitUntil: "networkidle2",
            timeout: 0,
        },
        pdf: {
            // height:'170',
            // width:'width',
            // scale:'1.0-2.0',
            // margin:{
            //    left:0,
            //    right:0,
            //    bottom:0,
            // },
            // format:'A4|Letter',
            // printBackground:true
        },
        /*screenshot: {
      fullPage: true,
      captureBeyondViewport: true,
      type: 'jpeg',
      quality: '100',
      omitBackground: true,
  },*/
        settings: {
            element: "", //element
            header: true,
            screenshot: false,
        },
        page_settings: {
            timeout: "30",
        },
        options: {
            configurePdfprop: true,
        },
        preFunction: () => {},
        showLoading: () => {
            jQuery(".page-progressbar").show();
        },
        hideLoading: () => {
            jQuery(".page-progressbar").hide();
        },
    };
    options = jQuery.extend({}, default_options, options);
    const settings = options.settings;
    if (settings.element) {
        if (settings.element) {
            // if not selector content should pre definded
            options.options.content = jQuery(`${settings.element}`).html();
        }
    }
    if (!settings.header) {
        if (!options.url.includes("noheader=true")) {
            let prefix = options.url.includes("?") ? "&" : "?";
            options.url += prefix + "noheader=true";
        }
    }
    options.preFunction(options);
    options.showLoading();
    if (settings.screenshot) {
        options.screenshot = {};
    }
    const data_tosend = {
        height: options.height,
        width: options.width,
        url: options.url,
        puppeteer: options.puppeteer,
        pdf: options.pdf,
        screenshot: options.screenshot,
        page_settings: options.page_settings,
        options: options.options,
    };
    jQuery.ajax({
        url: "/servlet/AJaxServlet?action=ExportAsPDF",
        method: "POST",
        data: {
            options: sdpToJSON(data_tosend),
        },
        xhr: function() {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 2) {
                    if (xhr.status == 200) {
                        xhr.responseType = "blob";
                    }
                }
            };
            return xhr;
        },
        error: function(xhr, status, error) {
            options.hideLoading(false);
            if (options.error) {
                options.error(xhr.responseJSON);
            } else {
                showalert(
                    "failure",
                    translate(xhr.responseJSON.message),
                    "isAutoHide=false"
                );
            }
        },
        success: function(data) {
            options.hideLoading(true);
            //Convert the Byte Data to BLOB object.
            var blob = new Blob([data], {
                type: "application/octetstream"
            });
            var fileName = `${options.fileName}${options.screenshot?".png":".pdf"}`;
            if (options.callback) {
                options.callback(blob, options);
            } else {
                var url = window.URL || window.webkitURL;
                link = url.createObjectURL(blob);
                var a = jQuery("<a />");
                a.attr("download", fileName);
                a.attr("href", link);
                a[0].click();
            }
        },
    });
}
