/*  The common part of both mpp and other format file  */

function importHistory(tabName,fileFormat,module,parentEntity,parentEntityId) {
    if(sdp_app.IS_REBRAND) {
        jQuery('#import-tab-headscetion li:eq(1) a').trigger('click');
    }
       var entity = jQuery("#entityName").val();
	   var encodeURL = encodeURIComponent('{"entity" : "'+ entity +'","file_format":"'+ fileFormat +'","list_info": {"start_index": "' + start_index + '", "row_count": "25"}}'); //NO I18N
	   var importHistoryUrl='/servlet/ImportServlet?submitaction=import_history&module='+module+'&input_data='+encodeURL // No I18N
	   importHistoryUrl=appendParentDetailsInImportUrl(parentEntity,parentEntityId,importHistoryUrl)

       sdpAjax({
        	 url: importHistoryUrl ,
	    	 dataType: 'json', //No I18N
	    	 success: function(jsonResponse) {
	    		if(jsonResponse.import_history.length>0)
	    		{
		    		jQuery('#impResultDisplay').show();
		    		if(start_index == 1){
		    		jQuery('#impResultDisplay').empty();
		    		}
		    		 if(jsonResponse.view_more === "enable"){
		    			 jQuery('#viewMoreDiv').show();
		    		 }
		    		 else{
		                    jQuery('#viewMoreDiv').hide();
		                }
		    		importResult(tabName,jsonResponse,fileFormat,module,parentEntity,parentEntityId);

		                start_index = start_index + 25 ;
		               initTooltip("#importresults");//No I18N
	            }
	            else{
                    jQuery('#impResultDisplay').show();
	                jQuery('#viewMoreDiv').hide();
	            }
	        }
	    });
	}



function importResult(tabName,jsonResponse,fileFormat,module,parentEntity,parentEntityId) {
    var responseObj = jsonResponse.import_history;
    for (var i = 0; i < responseObj.length; i++){
        var displayDateTime = convertDateFormat(responseObj[i].imported_time);
        var DateTimeArray = displayDateTime.split(">>");
        responseObj[i].createdDate = DateTimeArray[0];
        responseObj[i].createdTime = DateTimeArray[1];
    }
    var groups = {};
    jQuery.each(responseObj, function(index, value) {
        var crtDate = value.createdDate;
        delete value.createdDate;
        if (groups[crtDate]){
        	groups[crtDate].push(value);
        } else {
        	groups[crtDate] = [value];
        }
    });

    var grpbyCreateDate = jQuery.map(groups, function(group, key) {
        var mappedGrp = {};
        mappedGrp[key] = group;
        return mappedGrp;
    });

    var import_failed=getMessageForKey('sdp.import.failedmsg');
    var import_success=getMessageForKey('sdp.import.successmsg');

    for (var i = 0; i < grpbyCreateDate.length; i++) {
            for(key in grpbyCreateDate[i]){
                var idVal = key.replace(/[, ]/g, "").trim();
                var importSubList = grpbyCreateDate[i][key];
            var clonedHeader = jQuery('#importListheader').clone()
                .removeAttr('id');// No I18N
            clonedHeader.find('div.panel-title').html(key+'<span class="cspr icon-sm circle-arrow-down fr"></span>');

            var collectionDiv = jQuery('#importHistBody').clone()
            .removeAttr('id') //No I18N
            .attr("id", "collapseHist_" + idVal);

            for (var j = 0; j < importSubList.length; j++) {
                responseJson = importSubList[j];
                responseJson.username = '<span class="import-file-username">'+ encodeHTML(responseJson.imported_by) + '</span>';
                var importStatus = responseJson.result;
                var importMessage = importStatus.message;
                if(fileFormat == "xls/xlsx/csv")
                	{
                    responseJson.impStatuslable = "close-red2"; //No I18N
                    responseJson.importStatus = import_failed;
                    var statusMsgKey;
                    if(importStatus.status == "partial_success"){
                        statusMsgKey='sdp.project.import.status.partial';//No I18N
                    }else if(importStatus.status == "success" ){//No I18N
                        statusMsgKey='sdp.project.import.status.success';//No I18N
                    	responseJson.importStatus = import_success;
                        responseJson.impStatuslable = "tick-green2"; //No I18N
                    }else{
                        statusMsgKey='sdp.project.import.status.failed';//No I18N
                    }
                    responseJson.importMessage = getMessageForKey(statusMsgKey,[
                    "<strong>"+encodeHTML(getMessageForKey(responseJson.entityDisplayName))+"</strong>"
                    ,"<strong>"+encodeHTML(responseJson.file_name)+"</strong>"
                    ]);

                //total records msg and result xls download part
                    var concatString = "<p>" + getMessageForKey("sdp.reports.default.totalrecordsmsg") +
                                            ": <b>" + importMessage.total_records +"</b>"+"&nbsp &nbsp ("+
                                            getMessageForKey("sdp.common.success") +": <b>" + importMessage.success+"</b>&nbsp &nbsp|&nbsp &nbsp"+//No I18N
                                                                    getMessageForKey("sdp.discovery.sccm.failure")+": <b>" +  importMessage.failed + "</b> )"+//No I18N
                                        " </p>" ;

                    if(importMessage!=undefined && importMessage.hasOwnProperty('results')){
                        var inputData = '{"results_path":"'+ importMessage.results +'"}';    //No I18N
                        inputData = encodeURIComponent(inputData);
                        var url = "/servlet/ImportServlet?submitaction=download_results_file&module="+module+"&input_data="+inputData; //No I18N
                        url=appendParentDetailsInImportUrl(parentEntity,parentEntityId,url);

                        concatString = concatString +
                        "<div style='max-width:300px' class='disp-ib'>"+
                            "<a target='_blank' class='btn btn-md btn-white2 pt0 pl0 fw text-overflow boxszbb' href='"+url+"' rel='noopener noreferrer'> <em class='attachment-sprite attach-xls mr10'></em>"+getMessageForKey("sdp.import.results.download")+"</a>";
                        concatString=concatString+"</div>";

                    }

                    responseJson.importStatusButton = "hide"; //No I18N
                    responseJson.importErrorObject = concatString;

                	}

                // this part is common for the mpp format
                else{
                        if (importStatus.status == "partial_success" || importStatus.status == "failed") {
                            if(importMessage!=undefined && importMessage.hasOwnProperty('project_id')){
                                responseJson.projectID = importMessage.project_id;
                                if(importMessage.hasOwnProperty('isDeleted')){
                                    responseJson.projectlink="<strong>"+getMessageForKey("common.project")+"</strong> #"+importMessage.project_id;
                                }else{
                                    responseJson.projectlink="<strong>"+getMessageForKey("common.project")+'</strong> <span> <a rel="noopener noreferrer uitip" target="_blank" title="'+getMessageForKey("sdp.project.import.projectdetails.tooltip")+'" href="/ProjectAction.do?submitaction=ViewProject&projectid='+importMessage.project_id+'"> #'+importMessage.project_id+'</a></span>';
                                }
                                responseJson.importMessage = getMessageForKey('sdp.project.import.status.partial',[responseJson.projectlink,encodeHTML(responseJson.file_name)]); //No I18N
                            }
                            else{
                                responseJson.importMessage = getMessageForKey('sdp.project.import.status.failed',["<strong>"+getMessageForKey("common.project")+"</strong>","<strong>"+encodeHTML(responseJson.file_name)+"</strong>"]); //No I18N
                            }

                            // this part is for handling the error messages
                            var concatString = "";
                            var messageVal = importMessage;
                            var errorMsgCount = 0;
                            if(messageVal!=undefined&&messageVal.hasOwnProperty("error_message")){
                                // this part has to be checked in partial success cases
                                for (var a = 0; a < messageVal.error_message.length; a++) {
                                    var messageObj = messageVal.error_message[a];
                                    errorMsgCount++;
                                    concatString = concatString + "<p>" + encodeHTML(messageObj) + "</p>";
                                }
                            }
                            if(errorMsgCount < 2){
                                responseJson.importStatusButton = "hide"; //No I18N
                            }
                            responseJson.importErrorObject = concatString;
                            responseJson.impStatuslable = "close-red2"; //No I18N
                            responseJson.importStatus = import_failed;
                            // end of this part is for handling the error messages

                        } else {
                            if(importMessage!=undefined&&importMessage.hasOwnProperty('isDeleted')){
                                responseJson.projectlink="<strong>"+getMessageForKey("common.project")+'</strong> #'+importMessage.project_id;
                            }else{
                                responseJson.projectlink ="<strong>"+getMessageForKey("common.project")+"</strong>"+
                                    "<span>"+
                                        "<a rel='uitip' target='_blank' title='"+getMessageForKey('sdp.project.import.projectdetails.tooltip')+//No I18N
                                        "' href='/ProjectAction.do?submitaction=ViewProject&projectid="+importMessage.project_id+"'>" +//No I18N
                                        " #"+importMessage.project_id+
                                        "</a>"
                                    +"</span>";
                            }
                            responseJson.impStatuslable = "tick-green2"; //No I18N
                            responseJson.importStatus = import_success;
                            responseJson.importMessage = getMessageForKey('sdp.project.import.status.success',[responseJson.projectlink,"<strong>"+encodeHTML(responseJson.file_name)+"</strong>"]); //No I18N
                            responseJson.importStatusButton = "hide"; //No I18N
                        }
                }
                responseJson.performedBy=getMessageForKey('sdp.requests.history.request.reply',["<strong>"+encodeHTML(responseJson.imported_by)+"</strong>"]);


                var parentDiv = getHtmlForTemplateForImport("importedResultData", responseJson, false); // No I18N
                var divContent = jQuery(parentDiv).find('div.panel-body').html();
                if(jQuery('#collapseHist_'+idVal).length > 0){
                    jQuery(divContent).appendTo(jQuery('#collapseHist_'+idVal).find('.panel-body'));
                }
                else{
                    jQuery(divContent).appendTo(jQuery(collectionDiv).find('.panel-body'));
                }
            }
            var panelDiv = jQuery('<div />', {"class": 'panel'}); // No I18N
            if(jQuery('#collapseHist_'+idVal).length == 0){
                jQuery(clonedHeader).appendTo(panelDiv); // No I18N
                jQuery(collectionDiv).appendTo(panelDiv); // No I18N
                jQuery(panelDiv).appendTo("#impResultDisplay"); // No I18N
            }
        }
    }
    jQuery('#importresults [rel=uitip]').uitooltip({//NO I18N
        content: function(){
            var element = jQuery( this );
                return element.attr('title')//NO I18N
            },
        position: {
            my: "center top+5",//NO I18N
            at: "center bottom"//NO I18N
        },
        show: {
            effect: 'none',//NO I18N
            delay: 10
        },hide: {
            effect: 'none',//NO I18N
            delay: 10
        }
    });

    if(fileFormat == "xls/xlsx/csv")
    	{
    	jQuery('#importresults').show();
    	}
    else
    	{

        jQuery('#filesArea').empty();
        jQuery('.import-browser-area').show();
        jQuery('.import-droptarget,.import-import-btn,.addRefCheck').hide();
    	}
      zcomponent.collapsible_init('#importprjZC');// No I18N
}

function convertDateFormat(dateVar) {
    var dateJsonForm = new Date(parseInt(dateVar));
    var convertDate = new Date(dateJsonForm);
    var format = "AM"; //No I18N
    var hour = convertDate.getHours();
    var min = convertDate.getMinutes();
    if (hour > 11) {
        format = "PM"; //No I18N
    }
    if (hour > 12) {
        hour = hour - 12;
    }
    if (hour == 0) {
        hour = 12;
    }
    if (min < 10) {
        min = "0" + min;
    }
    var newDate = jQuery.datepicker.formatDate('M dd, yy', new Date(convertDate)); //No I18N
    var dispDate = newDate + ">>" + hour + ":" + min + " " + format;
    return dispDate;
}

function hideImportHistory(from)
   {
    jQuery("#importHistory").show();
    if(from=="getinput"){ //No I18N
        jQuery("#wizardcontent,#allButtons,#wizardheader").show();
    }else if(from=="mapfields"){ //No I18N
        jQuery("#fieldMap,#mapFields").show();
    }else if(from=="summary"){ //No I18N
        jQuery("#summarydiv").show();
    }
    jQuery("#impWizard").show();

    jQuery("#importresults,#backButton,#impSummary").hide();
   }

    function getResults(results,module,parentEntity,parentEntityId){
           var inputData = '{"results_path":"'+ results +'"}';    //No I18N
           inputData = encodeURIComponent(inputData);
           var url = "/servlet/ImportServlet?submitaction=download_results_file&module="+module+"&input_data="+inputData; //No I18N
           url=appendParentDetailsInImportUrl(parentEntity,parentEntityId,url)
           window.open(url,'_parent');
    }



    function getHtmlForTemplateForImport(templateId, data,encode) {
        var $popupDiv = jQuery('#' + templateId).clone();// No I18N
        var tpl = $popupDiv.removeAttr("id").wrap("<div></div>").parent().html(); // No I18N
        var html = tpl.replace(/\$(?:\{|%7B)(.*?)(?:\}|%7D)/g, function($1, $2) {
        //var html = tpl.replace(/\$(?:\{|%7B)(.*?)(?:\}|%7D)/g, function($1, $2) {
            if(encode ===true){
            return ($2 in data) ? ashtmlString(data[$2]) : '';
            }else{
            return ($2 in data) ? data[$2] : '';
            }
        });
        return html;
    }


/*  End Of The common part of both mpp and other format file  */

