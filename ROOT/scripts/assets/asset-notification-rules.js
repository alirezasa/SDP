//for Asset Notification template
var $assetNotificationRules={
        init : function(){   
        var self = this;
        self.prevItem = 0;
           var contEditSec = jQuery('#messageRow div[rel="contenteditablesec"]');
           contEditSec.addClass("p15").removeAttr("contenteditable").css('height','450px'); //NO I18N
           jQuery("#notfiColMenu").addClass("disp-flex");
           jQuery("#textCompleteMenu").appendTo("body");   //NO I18N

           // Build dummy menu popup in conetenteditor
           contEditSec.on('keyup',function(){ //NO I18N
              if(event.key=="$"){
                 var range = this.ownerDocument.getSelection().getRangeAt(0).cloneRange();
                 var wrapperNode = range.endContainer.parentNode;
                 var node = this.ownerDocument.createElement('span');
                 node.id="injectCode";
                 range.insertNode(node);
                 range.selectNodeContents(node);
                 range.deleteContents();
                setTimeout(function() {
                    wrapperNode.normalize();
                }, 1);
                 var $node = jQuery(node);
                 var position = $node.offset();
                 jQuery("#textCompleteMenu>ul.sdmenu-dd").css({
                    'left' : position.left,   //NO I18N
                    'top' : position.top + 20    //NO I18N
                 });
                 jQuery("#textCompleteMenu").removeClass('hide');
              }
           });

           // Append the menu to contenteditable editor
           jQuery("#textCompleteMenu li").on({
              mouseenter : function(){
              },
              mouseleave : function(){
              },
              click : function(){
                 var txt = jQuery(this).text().trim(), 
                 icon=jQuery(this).attr("data-icon"),
                 tableIcon = jQuery("#TableIconDom").html();
                 if(icon=='table'){
                    jQuery("#injectCode").before(txt+tableIcon).remove();
                } else {
                    jQuery("#injectCode").before(txt).remove();
                 }
                 jQuery("#textCompleteMenu").addClass('hide');
                 initTooltip("#tablecontentEdit");   //NO I18N
              }
           });         

        }, 
        saveColumnCust : function(ele){
            
        if (jQuery(ele).attr("id") == "saveColumnCust") {
            var _self = this,
                queryStr_show = [],
                queryStr_hide = [];
           
              $sortableElement = jQuery("#activities_table_colsort");
             $sortableElement.find('li input[type=checkbox]').each(function(){               
                            var $this=jQuery(this);
                            var value=$this.val();
                            var isChecked=$this.is(':checked');//No I18N
                            if(isChecked){
                              
                                queryStr_show.push(escape(value))
                } else {
                            
                              queryStr_hide.push(escape(value))
                            }
                        });   
                    
      
            
             var path=jQuery(location).attr('href');
               var param=path.substring(path.indexOf("=")+1,path.indexOf("&"));     
        
            var params="action=get_selected_notification_fields&notifType="+encodeURIComponent(param)+"&showList="+encodeURIComponent("["+queryStr_show+"]")+"&hideList="+encodeURIComponent("["+queryStr_hide+"]");//NO I18N
          
                   
       var response = sdpAjax({
      type: 'POST',                                    //NO I18N
      url: '/servlet/AdminApiServlet',                                             //NO I18N
      data: params,              
      success: function(obj){
        var outputResponce=obj;
                    if (outputResponce.status == 'failed') {
            showalert('failure',outputResponce.message,'isAutoHide=true,delay=3,width=auto') ;   //NO I18N   
                    } else {
        jQuery("#notfiColMenu").removeClass('translatex0').addClass("translatex100");
        jQuery("body").removeClass("of-h"); //NO I18N
        showalert('success',getMessageForKey('sdp.notification.column.success'),'isAutoHide=true,delay=3,width=auto') ;   //NO I18N 
        }
        }
    });
           
            
        } else {
            jQuery("body").removeClass("of-h"); //NO I18N
           jQuery("#notfiColMenu").removeClass('translatex0').addClass("translatex100");
          }
           
        },
        
        tableColCustm : function(){
        var self = this;
            var columnList={};      
            var path=jQuery(location).attr('href');
            var param=path.substring(path.indexOf("=")+1,path.indexOf("&"));
        if(self.prevItem !== 0) { //Case when all the items are loaded already
            if(!jQuery("body").hasClass("of-h") && jQuery("#notfiColMenu").hasClass("translatex100")) {
                jQuery("body").addClass("of-h");
                jQuery("#notfiColMenu").removeClass('translatex100').addClass("translatex0");
            }
            return;
        }
        sdpAjax({
                type: "GET", // No I18N
                dataType: 'json', // No I18N
                async: false,
                url: "/servlet/AdminApiServlet?action=notification_fields&notifType="+encodeURIComponent(param), //NO I18N
                success: function (data) {
                     columnList = data;
                self.columnList = data;
                var append = true;
                while(append) {
                    append = self.loadColumnList(); //intial load
                }
                }
            });
    },
            
    loadColumnList: function() {
        var self = this;
        var count = self.columnList.response_data.length - self.prevItem >= 100 ? 100 : self.columnList.response_data.length - self.prevItem; // Number of items to load
            var columnHtmlArr=[];
        var prevItem = self.prevItem;
        if(count === 0) {
            return false;
                        }     
                 
        for (var curItem = prevItem; curItem < prevItem + count; curItem++) {
            var counter = self.columnList.response_data[curItem];
            var isChecked = counter.is_selected === "true";
            var field = e_html(counter.field);
            var display_name = e_html(counter.display_name);
            var inputAttrs = 'type="checkbox" value="' + field + '" class="colcheckbox" id="' + field + '"'; //No I18N
            if (isChecked) {
                inputAttrs += ' checked'; //No I18N
                    }
            if (field === "name") {
                inputAttrs += ' disabled'; //No I18N
                    }           
            var liClass = isChecked ? 'show' : ''; //No I18N
            columnHtmlArr.push('<li class="' + liClass + '"><span class="ctl"><i><b class="mt4"></b></i><input ' + inputAttrs + '></span><span class="vmiddle pl3 disp-c wb-bw"><label class="cur-ptr" for="' + field + '">' + display_name + '</label></span></li>');
             }
        self.prevItem = curItem;
            
            jQuery("#activities_table_colsort").append(columnHtmlArr);
            jQuery("body").addClass("of-h");    //NO I18N
            jQuery("#notfiColMenu").show();
            jQuery("#variable").html("<strong>"+self.columnList.variable+"</strong>");  //NO I18N
            jQuery("#notfiColMenu").removeClass('translatex100').addClass("translatex0");
            
        bindEvents(prevItem, curItem); // Bind events for the newly loaded elements
        return true;
        }
     };

     jQuery(document).ready(function(){     
        $assetNotificationRules.init();
     });

     function validateColumnChooser($this)
    {
        var val=true;
         var path=jQuery(location).attr('href');
            var param=path.substring(path.indexOf("=")+1,path.indexOf("&"));
            
            sdpAjax({
                type: "GET", // No I18N
                dataType: 'json', // No I18N
                async: false,
                url: "/servlet/AdminApiServlet?action=notification_fields&notifType="+param, //NO I18N
                success: function (data) {
                     columnList = data;
                }
            });
             for (var i = 0; i < columnList.response_data.length; i++) 
             {               
                 var counter = columnList.response_data[i];    
                if(document.getElementById(counter.field)==null)
                {
                    val=true;
                    break;
                }
                 var checked=(document.getElementById(counter.field).checked); 
                             
                 if((checked && counter.is_selected=="false") || (!checked && counter.is_selected=="true")){
                  
             val=(confirm(getMessageForKey('sdp.notification.confirm'))); //NO I18N
             break;
            
                 }
             }
             
             if(val)
             {          
                var variabe= jQuery("#msgod iframe").contents().find("#notify-table").text().trim();
                 variabe=variabe+"<br/>";//No I18N
                jQuery("#msgod iframe").contents().find("#notify-table").after(variabe).remove();
                                
             }
            
        return val;
    };