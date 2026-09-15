/*$Id$ */

/**
  ** We have implemented customization of pages as component
  ** Now we have Portal and Login page customization
  Here we need options, to customize you page
    ** Component initialization
       new CustomizationComponent(options);
    ** Parameters (options)
        module - will be used for Loading/Saving files , uploading images in (module's)path and mandatory field checks
        getTemplateVariableReplacedHTML - Callback , will be used for replacing predefined {{variables}}
        invlokeOnInit - Callback, Function will get invoked on initialization of component
        insertImageURL - If your module have an upload / insert images option, then need to give an images folder URL (For upload / GET images)
        dynamicVariables - [] Need to listout all the Predefined variables, while initializing component
          ex : ["{{login_image}}","{{login_form}}","{{product_name}}","{{product_version}}","{{copyright_year}}"]
**/

function CustomizationComponent(options) {
  options.draftsURL = options.draftsURL ? options.draftsURL : options.publishURL;
  this.options = options;
  this.init();
  if(isMSP && options.accountId!=undefined){
	setTimeout(function() {
		document.getElementById("__persistentAccountId__select").value=options.accountId;
	},500);
  }
}

CustomizationComponent.prototype = {
  /* Component initialization starts here */
    init: function(){
      var _self = this;
      //customizeContentDiv - Div will be available parent JSP (You need to put div with id "customizeContentDiv" in your parent JSP)
      jQuery("#customizeContentDiv").load("/jsp/Customization.jsp", function(){ //NO I18N
          var isPublishAvailable = false;
          if(_self.options.module == "portal"){//NO I18N
             isPublishAvailable = _self.readFile("/custom/esm/portalPublish.html", null, true);//NO I18N
          }
          let iframIdName = sdp_app.IS_MSPOrSCP ? "id='code_preview_iframe' name='code_preview_iframe'" : "";//NO I18N
          let templateData = {"module": _self.options.module, isPublishAvailable : isPublishAvailable, iframIdName: iframIdName};//NO I18N
          renderhbs("#customization_editor", "login-portal-customization", templateData, false, "admin");//NO I18N
        setTimeout(function(){
          jQuery("#customizeContentDiv").show();
          if(typeof _self.options.invlokeOnInit === "function"){
            callbackFormFunc(_self.options.invlokeOnInit,[_self]);
          }
          jQuery(".CodeMirror").remove();
          _self.loadCurrentEditor();
          if(_self.doc){
            _self.doc.find('[data-name=headerOperation]').find('li a[name="v-split-view"]').click();
          }
          /*Button actions for Save, Draft, Restore, Cancel*/
          jQuery(".saveCustom").on('click', function(){
            _self.saveCustomFile('publish'); //NO I18N
          });
          jQuery(".draftCustom").on('click', function(){
            _self.saveCustomFile('draft'); //NO I18N
          });
          jQuery(".gobackCustom").on('click', function(){
            _self.goBack();
          });
          jQuery('.restoreBtn').on('click', function(){
            var type = jQuery(this).attr('data-restore');
            _self.restoreToFile(type)
          });
          
          var floatDir = sdp_user.DIRECTION === "RTL" ? "left" : "right";//NO I18N
          document.querySelector('[data-name="restore-btn"]').style.setProperty("float",floatDir,"important");//NO I18N
        },1);
      });
    },
    loadOAuthSection: function(self, oAuthDiv) {
        var oAuthFrontSection = oAuthDiv.find("#oauth-front-section div");
        if (oAuthDiv.length) {
            if(self.oauth_list_data == undefined){
                sdpAjax({
                    url: '/servlet/SDOAuthRequestServlet?mode=list',        // No I18N
                    async: false,
                    type: 'GET',//No I18N
                    success: function(response) {
                        self.oauth_list_data = response;
                    }
                });
            }

            var response = self.oauth_list_data;
            if(response.length > 0) {
                oAuthFrontSection.parent().removeClass("hide");
            } else {
                return;
            }

            var maxWidth = oAuthFrontSection[0].offsetWidth;
            var itemWidth = 40 + 10; // Item width + gap
            var maxVisible = Math.floor(maxWidth / itemWidth) - 1;

            oAuthFrontSection.html('')
            for (var key=0; key < response.length; key++) {
                var icon = response[key].icon_path;
                icon = icon ? icon : "/images/no-image-icon.svg";        // No I18N
                var no_image = "/images/no-image-icon.svg" == icon;     // No I18N
                var id = response[key].id;
                var name = response[key].provider_name;
                if(key < maxVisible) {
                    var html = "<button type='button' class='btn btn-default' data-id='" + id + "' title='" + e_attr(name) + "'>" +       // No I18N
                                    "<img src='" + icon + "' alt='" + e_attr(name) + "'" + (no_image ? " class='w-32px'" : "") + ">" +
                               "</button>";
                    oAuthFrontSection.append(html);
                }
            }
            if(response.length > maxVisible) {
                    var front_more = "<button type='button' class='btn btn-default' id='oauth-more' title='" + translate('sdp.common.more') + "'>" +        // No I18N
                                "<img src='/custom/login/oauthicons/more.svg' alt='" + translate('sdp.common.more') + "'>" +
                           "</button>";
                oAuthFrontSection.append(front_more);
            }
        }
    },
    loadCurrentEditor : function() { //Custom editor initialization
        var _self = this;
            _self.doc = jQuery("#customizeContentDiv");
        var $scriptEditor = _self.doc.find('[name=code]');
        $scriptEditor.attr('id', 'codeEditor'); //NO I18N
        _self.cmEditor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
          mode: "text/html", //NO I18N
          autoCloseTags: true,
          lineNumbers: true,
          lineWrapping: true,
          styleActiveLine: true,
          theme: 'default', //NO I18N
          profile: 'xhtml', //NO I18N
          /* define Emmet output profile */
          extraKeys: {
            "Ctrl-Q": function(cm) { //NO I18N
              cm.foldCode(cm.getCursor());
            }
          },
          rtlMoveVisually: true,
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"] //NO I18N
        });

        setTimeout(function(){
          _self.cmEditor.setSize(window.innerWidth * 0.497, window.innerHeight * 0.85);
          _self.doc.find('[name=code_preview]').css({ "height": window.innerHeight * 0.85 }); //NO I18N
          
          /* on change in the editor renderView will be call*/
          _self.cmEditor.on('change', function(){
            _self.renderView()
          });
          _self.readFile(_self.options.renderOrder || _self.options.draftsURL); 
          _self.addListener();
          if(_self.options.insertImageURL){
             _self.insertImageSelect2();
             jQuery("#upLoadImage").on('change', function(){
              _self.uploadFile();
            });
          }
          var dynVar = _self.options.dynamicVariables;
          if(dynVar){
            var varArray = _self.getAsSelect2Object(dynVar);
            jQuery("#insertVariable").select2({'data':varArray,"placeholder" : translate("customize.insert.variable"),"allowClear" :true}).on("click",function(e){ //NO I18N
                var cursurPos = _self.cmEditor.getCursor();
                var value = e.target.value;
                if(value){
                    _self.cmEditor.replaceRange(value,cursurPos,cursurPos);
                    _self.cmEditor.refresh();
                }
                jQuery("#insertVariable").val('').trigger("change");
            });
          }
        },1);
    },

    /* read the File and response set in Code Editor*/
    readFile : function(Url, index, getFileExists) {
      var urlStr = "", isArrayURL = false, isFileExists = false;
      if(Array.isArray(Url)){
        if(typeof index != "undefined"){
          index += 1;
        }else{
          index = 0;
        }
        urlStr = Url[index];
        isArrayURL = true;
      }else{
        urlStr = Url;
      }
      if(!urlStr){
          return false;
      }
      var _self = this;
        jQuery.ajax({
          url: urlStr,
          async: false,
          dataType: 'html', //No I18N
          type: 'GET', //No I18N
          cache: false,
          statusCode: {
            404: function() {
              if(isMSP && _self.options.module=="login"){
            	_self.readFile("/custom/login/Login.html"); //NO I18N 
          	  }else if(!getFileExists){
                _self.readFile(isArrayURL ? Url : _self.options.publishURL, index);
              }
            }
          },
          success: function(resp) {
            isFileExists = true;
            if(!getFileExists){
              _self.cmEditor.setValue(resp);
            }
          }
        });
        return isFileExists;
    },
    /* onChange in Editor , render the Html Content*/
    renderView : function() {
      var _self = this;
      var iframe = this.doc.find('iframe')[0];
      if(isMSPOrSCP) {
        iframe = document.getElementById("code_preview_iframe");
      }
      var contentDocument = (iframe.contentWindow || iframe.contentDocument);
      var content = this.cmEditor.getValue();
      if(typeof _self.options.getTemplateVariableReplacedHTML === "function"){
          content = callbackFormFunc(_self.options.getTemplateVariableReplacedHTML, [content]);
      }
      var url = "";//NO I18N
      if(_self.options.module == "login"){
        url = "/style/loginstyle.css"; //NO I18N
      }else{
        var fileName = "aesm_portal.css"; // No I18N
        if(sdp_user.DIRECTION === "RTL"){
          fileName = "aesm_portal_RTL.css"; // No I18N
        }
        url = "custom/style/"+fileName; //NO I18N
      }
      
      var $head = this.doc.find('iframe').contents().find("head");
      if(isMSPOrSCP) {
        $head = jQuery("#code_preview_iframe").contents().find("head");
      }
          $head.append(jQuery("<link/>", { rel: "stylesheet", href: url, type: "text/css" })); //NO I18N
          contentDocument.document.body.innerHTML = "";
          contentDocument.document.body.innerHTML += content;
          setTimeout(function() {
	          _self.loadOAuthSection(_self, jQuery(contentDocument.document));
          }, 10);
    },
    /* Insert Image Option and onchnage Functionality */
    insertImageSelect2:function(){
      var _self = this;
         sdpAjax({
            type:"GET", //NO I18N
            async:false,
            cache: false,
            url:_self.options.insertImageURL, //No I18N
            success:function(resp){
                var insertImage = _self.doc.find('[name=insertImage]');
                /* apply select to and add options in insert image */
                var data = _self.getAsSelect2Object(resp);
                insertImage.select2({"data":data, "placeholder" :translate("custmize.image.placeholder"), "allowClear" :true}); //NO I18N
                /* add bottom select 2 upload image */
                jQuery(insertImage).select2("container").on("select2-opening", function() { //No I18N
                                  }).find(".select2-drop").append('<div class="select2-filter-option disp-t fw"><div name="uploadImage" class="tc cur-ptr"><span aria-hidden="true" class="cspr export icon-sm p0 mr5"></span>'+translate("common.upload.image")+'</div></div>');
                /* on select any option image set on the editor cursor position and insert image set as initial value (-- insert image --) */
                insertImage.off("click").on("click",function(e){ //NO I18N
                    var cursurPos = _self.cmEditor.getCursor();
                    var value = e.target.value;
                    if(value){
                        var code = '<img src="/custom/login/'+encodeURIComponent(value)+'">'; //SD-76175
                        _self.cmEditor.replaceRange(code,cursurPos,cursurPos);
                        _self.cmEditor.refresh();
                       jQuery(this).val('').trigger("change");
                    }

                });
                
                jQuery('[name=uploadImage]').on('click',function(){
                    _self.doc.find('#upLoadImage').click();
                });
            }
        });
    },
    /* listener bind for changing view (Split, Code, Preview)*/
    addListener : function() {
      var _self = this;
        jQuery.fn.toggleButtons();
        _self.doc.find('[data-name=headerOperation]').off('click').on('click', function(e) { //NO I18N
        var name = e.target.getAttribute('name');
        _self.doc.find('[name=insertImage],[name=insertVariable]').prop('disabled', false); //NO I18N
        switch (name) {
          case 'codeview': //NO I18N
            _self.addActiveClass(name);
            _self.doc.find('[name=code_preview]').addClass('hide');
            _self.cmEditor.setSize(window.innerWidth * 0.9, window.innerHeight * 0.85);
            break;
          case 'preview': //NO I18N
            _self.doc.find('[name=insertImage],[name=insertVariable]').prop('disabled',true); //NO I18N
            _self.addActiveClass(name);
            _self.cmEditor.setSize(0, 0);
            _self.doc.find('[name=code_preview]').removeClass('hide').removeClass('col-xs-6').addClass('col-xs-12').css({ "width": (window.innerWidth - 5), "height": window.innerHeight * 0.85 }); //NO I18N
            break;
          case 'v-split-view': //NO I18N
            _self.addActiveClass(name);
            _self.cmEditor.setSize(window.innerWidth * 0.497, window.innerHeight * 0.85);
            _self.doc.find('[name=code_preview]').removeClass('col-xs-12').removeClass('hide').css({ "width": window.innerWidth * 0.49, 'height': window.innerHeight * 0.85 }).addClass('col-xs-6').end().find('[name=code]').parent().removeClass('col-xs-12').addClass('col-xs-6'); //NO I18N
            break;
          case 'verticalView': //NO I18N
            _self.addActiveClass('v-split-view'); //NO I18N
            _self.cmEditor.setSize(window.innerWidth * 0.497, window.innerHeight * 0.85);
            _self.doc.find('[name=code_preview]').removeClass('hide').removeClass('col-xs-12').addClass('col-xs-6').css({ 'width': window.innerWidth * 0.49, 'height': window.innerHeight * 0.85 }).end().find('[name=code]').parent().removeClass('col-xs-12').addClass('col-xs-6'); //NO I18N
            break;
          case 'horizontalView': //NO I18N
            _self.addActiveClass('v-split-view'); //NO I18N        
            _self.cmEditor.setSize((window.innerWidth - 10), window.innerHeight * 0.425);
            _self.doc.find('[name=code_preview]').removeClass('hide').removeClass('col-xs-6').addClass('col-xs-12').css({ 'width': (window.innerWidth - 10), 'height': window.innerHeight * 0.425 }).end().find('[name=code]').parent().removeClass('col-xs-6').addClass('col-xs-12'); //NO I18N
            break;
        }
      });
    },
    /* active class added in functionallities */
    addActiveClass : function(name) {
      var parEle = jQuery('[data-name="headerOperation"] ul li');
          parEle.removeClass('active');
          parEle.find('[name='+name+']').parent().addClass('active');
      if((name == "codeview" || name == "preview") && parEle.find('button[name="horizontalView"]').hasClass('btn-secondary')){
          parEle.find('button[name="horizontalView"]').removeClass('btn-secondary');
          parEle.find('button[name="verticalView"]').addClass('btn-secondary');
      }
    },
    /* save HTML content as Draft / Published */
    saveCustomFile : function(portalsaveType) {
      if(sdp_app.IS_DEMO_BUILD)
      {
        showalert('failure', '<b>' + translate("sdp.demo.errormsg") + '<b>', 'isAutoHide=true,delay=3,width=400'); //NO I18N
      }
      else{
      var _self = this;
      var module = _self.options.module;
      var content = _self.cmEditor.getValue();
          if (module == "portal" && (content.indexOf("{{{new-portal-cards}}}") === -1 && content.indexOf("{{{portal-cards}}}") === -1)) { //Portal card is mandatory
            showalert('failure', '<b>' + translate("mdh.portal.card.mandate") + '<b>', 'isAutoHide=true,delay=3'); //NO I18N
            return ;
          } else if (module == "login") { //NO I18N
              var mandatory_elements = ['{{login_form}}', '{{saml_div}}', '{{oauth_div}}', '{{error_div}}']      // No I18N
              for (var i = 0; i < mandatory_elements.length; i++) {
                  var element = mandatory_elements[i];
                  if(content.indexOf(element) === -1) {
                      showalert('failure', '<b>' + translate("sdp.admin.login.page.custom.add.element", [element]) + '<b>', 'isAutoHide=true,delay=3,width=280'); //NO I18N
                      return;
                  }
              }
          }
          var dataVal = {};
            if(module == "portal"){ //NO I18N
              dataVal.action =  "portalCustomization";  //No I18N
              dataVal.portalType = portalsaveType;
            }else if(module == "login"){ //NO I18N
              dataVal.action =  "loginCustomization";  //No I18N
              if(isMSP){
            	  dataVal.persistentAccountId=getAccountId(); 
              }
            }
                
          dataVal.data = content;
          sdpAjax({
            url: '/servlet/SDAjaxServlet', //No I18N
            async:false,
            type: 'POST', //No I18N
            data: dataVal,
            dataType: 'text', //NO I18N
            success: function(resp) {
              var sucMsg = translate("api.saved.success" ,[translate("sdp.cpl.scc")]); // No I18N
              if(module == "portal"){ //No I18N
                sucMsg = translate("publish.success",[translate("common.portal")]); // No I18N
                if(portalsaveType === "draft"){
                  sucMsg = translate("draft.saved",[translate("common.portal")]); // No I18N
                }
              }
              showalert('success', '<b>' + sucMsg + '<b>', 'isAutoHide=true,delay=3'); //NO I18N
            }
          });
       }   
    },
    /* restore editor to Default / Published */
    restoreToFile : function(type) {
      this.cmEditor.setValue(""); //NO I18N
      var fileName = ""; //NO I18N
      var module = this.options.module;
      if(module == "portal"){ //NO I18N
        if(type == "publish"){ //NO I18N
          fileName = "/custom/esm/portalPublish.html"; //NO I18N
        }else{
          fileName = "/custom/esm/portalDefault.html"; //NO I18N
        }
      }else if(module == "login"){ //NO I18N
	  if(isMSP){
		  var accId=getAccountId();
		  if(accId!=0 && accId!=mspAccountId){
			  fileName = "/custom/login/Login.html"; //NO I18N 
		  }else{
        fileName = "/custom/login/default.html"; //NO I18N
      }
	  }else{
      // this block is always executed for SDP. SDP flow unchanged
		fileName = "/custom/login/default.html"; //NO I18N  
	  }
        
      }
      this.readFile(fileName); //NO I18N
    },
    /* upload Image */
    uploadFile:function(){
        var login_img = this.doc.find("#upLoadImage").val();
        if(!login_img){
            return false;
        }
        if(login_img.indexOf('"')>0){
            showalert("failure", translate("sdp.admin.login.page.custom.invalid.name"), "isAutoHide=true"); // No I18N
            this.doc.find("#upLoadImage").val("");  // No I18N
            return false;
        }

        var login_custom_img = document.getElementById("upLoadImage").files[0];   // No I18N
        var validFormats = new Array("jpg", "jpeg", "png", "bmp", "gif"); //No I18N

        //Image file type validation
        var extension = login_img.substring(login_img.lastIndexOf('.') + 1).toLowerCase(); // No I18N
        var validFileBool = false;
        for(var i=0; i<validFormats.length; i++){
            if(validFormats[i] == extension){
            validFileBool = true;
            break;
            }
        }
        if(!validFileBool){ 
            showalert("failure", translate("sdp.admin.login.page.custom.invalid.image.type"), "isAutoHide=true");  // No I18N
            this.doc.find("#upLoadImage").val("");  // No I18N
            return false;
        }
        
        //image size validation
        if(login_custom_img.size > 5242880){
            showalert("failure", translate("sdp.admin.login.page.custom.size.exceed"), "isAutoHide=true"); // No I18N
            this.doc.find("#upLoadImage").val("");  // No I18N
            return false;
        }
        var formdata = new FormData();
        formdata.append("input_image", login_custom_img);  //No I18N
        var url = ""; //NO I18N
        if(this.options.module === "login"){ //NO I18N
          url ="/api/v3/files/upload?for=LOGINCUSTOMIZATION"; //NO I18N
        }
        var _self = this;
        sdpAjax({
            processData: false,
            contentType: false,
            type: "post", // No I18N
            url:url, //NO I18N
            data: formdata,
            success:function(response){
              if(_self.options.module === "login"){
                var status = response.response_status.status;
                if (status === 'success') {
                  showalert('success', '<b>' + translate("sdp.admin.login.page.custom.success.upload") + '<b>', 'isAutoHide=true,delay=3,width=250'); //NO I18N
                  _self.doc.find("#upLoadImage").val("");  // No I18N
                  _self.insertImageSelect2();
                }
              }
              else
              {
                showalert('success','<b>'+ translate("sdp.admin.login.page.custom.success.upload") + '<b>','isAutoHide=true,delay=3,width=250'); //NO I18N
                _self.doc.find("#upLoadImage").val("");  // No I18N
                _self.insertImageSelect2();
              }
            },
            error:function(response){
              if(_self.options.module === "login"){
                var message = response.responseJSON.response_status.messages[0].message;
                showalert('failure', '<b>' + message + '<b>', 'isAutoHide=true,delay=3,width=250'); //NO I18N
                _self.doc.find("#upLoadImage").val("");  // No I18N
                _self.insertImageSelect2();
              }
            }
        });
    },
    /* this Function return the obj as Select2 supported allowed Values */
    getAsSelect2Object:function(inObj){
        var select2Obj = [];
        for (var i = 0; i < inObj.length; i++) {
          select2Obj.push({"id" : inObj[i],"text" : inObj[i]});
        }
        return select2Obj;
    },
    /*Click action for Back button*/
    goBack: function(){
      jQuery("#top-header").show();
      if(this.options.module === "portal"){ //NO I18N
        mdh.mdhTabSwitch('portal_customization',false); //NO I18N
      }else if(this.options.module === "login"){ //NO I18N
        if(forwardfrom === "ESM"){ //NO I18N
          mdh.mdhTabSwitch('applicationsettings',false); //NO I18N
        }else{
          if(window.location.href.indexOf("mode=update")!=-1) {
            window.location.href="/SetUpWizard.do?forwardTo=settings#customize"; //NO I18N
          }
          else {
            window.location.reload();  
          }
        }
      }
    }
}
