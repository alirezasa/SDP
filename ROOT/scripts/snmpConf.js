/* $Id$ */ 

function getMIBList()
{ 
	jQuery('#MIBList').select2(
            jQuery.ajax({
                      async: false,
                      url:"/SNMPConfiguration.do", //NO I18N
                      data : "method=getMibList",  //NO I18N
                      type: "GET", //NO I18N
                      dataType: "json", //NO I18N
                      success: function(data){
                    	  
                    	if(data.resultStr != null)
                    	{
                    	   data = data.resultStr;
                           jQuery.each(data,function(key,value){
                        	   		jQuery('#MIBList').append(jQuery("<option></option>").val(key).text(value));
                           	});
                    	}
                    	else
                    	{
                    		showalert('failure',data.resultStr,'isAutoHide=false,delay=3,width=400') //NO I18N 	
                    	}
											initTooltip("#configOIDtwo");	//NO I18N
                      }
           })
      );  
	  jQuery('#MIBList').on("change", function(event){loadMibTree()});
	  jQuery('#MIBList').select2('data',{"id":"RFC1213-MIB","text":"RFC1213-MIB"},true); //NO I18N
		snmpCallBack.initsnmpTooltip();
}

function loadMibTree()
{
	var input_data = {"mibbrowser":{"mib_name":jQuery('#MIBList').val()}};          //NO I18N
	sdpAjax({
		async: false,
		url:"/api/v3/mibbrowser", //NO I18N
		data : "input_data="+encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(input_data) : JSON.stringify(input_data) ), //NO I18N
		type: "GET", //NO I18N
		dataType: "json", //NO I18N
		success:function(data){
		  if(data.response_status.status == 'success')
		  {
			  jQuery('#TreeStructure').empty();
			  jQuery('#TreeStructure').html("<div id='mibTreeView'></div>");
			  jQuery('#mibTreeView').jstree({
				'core':{  //NO I18N
					'data':data.mibbrowser[0].mib, //NO I18N
					"check_callback" : true           //NO I18N
				},
				"search":{ //NO I18N
					"case_insensitive": true, //NO I18N
					 "show_only_matches" : true //NO I18N
				},
				plugins: [
				          "dnd", "search", //NO I18N
				          "types", "wholerow" //NO I18N
				       ]    //Plugins added for drag and drop,search,types-control nesting rules and icon,wholerow-makes node selection
			  });
			  if(jQuery('#exorcol').attr('isToggle')=='false')        // change the Icon to Expand all while loading the mib file
			  {
				  jQuery('#exorcol').attr("title", getMessageForKey("sdp.requests.viewrequest.expandall")).tooltip({
                      content: function() {
                          const element = jQuery(this);
                          return element.attr("title"); // NO I18N
                      },
                      track: true,
                      show: {
                          delay: 250
                      },
                      tooltipClass: "uitip" // NO I18N
                  })
				  jQuery('#exorcol').find('span').attr('class','cspr expand-arrow1 icon-sm top3'); //NO I18N
				  jQuery("#mibTreeView").jstree("close_all"); //NO I18N
				  jQuery('#exorcol').attr('isToggle','true'); //NO I18N
			  }
			  jsTreeOnClick();
		  }
		  else
		  {
			  jQuery('#TreeStructure').empty();
			  jQuery('#alertbox').html('');
			  showalert('failure',ZSEC.Encoder.encodeForHTML(data.response_status.messages[0].message),'isAutoHide=false,delay=3,width=400') //NO I18N
		  }
	}
	});
}

function jsTreeOnClick() {
	jQuery('#mibTreeView').on("changed.jstree",function(e,data){
	    if(data.selected[0] != null)
	    {
	           jQuery("#OIDSelected").val(data.instance.get_node(data.selected[0]).original["Number OID"]);
	           if(data.instance.get_node(data.selected[0]).original["Number OID"] != null)
	           {
	        	   jQuery("#OIDToMap").val(data.instance.get_node(data.selected[0]).original["Number OID"]+".0"); //NO I18N
	           }
	           else
	           {
	        	   jQuery("#OIDToMap").val("");
	           }
	           if(data.instance.get_node(data.selected[0]).original.Description != null && trim(data.instance.get_node(data.selected[0]).original.Description) != "")
	           {
	        	   jQuery("#mibNodeDescription").text(data.instance.get_node(data.selected[0]).original.Description);
	           }
	           else
	           {
	        	   jQuery("#mibNodeDescription").text('');
	           }
	    }
	});
}

function triggerUploadMIB()
{
    if(sdp_app.IS_DEMO_BUILD) {
        showalert('failure',getMessageForKey('sdp.setup.orgdef.demoonline.jserror'),'isAutoHide=true,delay=3');//No I18N
        return false;
    }
	jQuery("#uploadMIB").trigger('click');
}

function uploadMIB()
{
	 var files = event.target.files;
	 var data = new FormData();
	 jQuery.each(files, function(key,value){
		 data.append("uploadMIB",value);   //NO I18N
	 });

	 jQuery.ajax({
		 url : '/SNMPConfiguration.do?method=uploadMIBFile', //NO I18N
		 type : 'POST', //NO I18N
		 data : data,
		 cache : false,
		 dataType : 'json', //NO I18N
		 processData : false,
		 contentType : false,
		 success: function(data)
		 {
			 if(data.resultStr != null)
			 {
				 showalert('success',data.resultStr,'isAutoHide=true,delay=3,width=400') //NO I18N
				 var fileName = encodeHTML(data.fileName);
				 jQuery('#MIBList').append(jQuery("<option></option>").val(fileName).text(fileName));
				 jQuery('#MIBList').select2('data',{"id":fileName,"text":fileName},true); //NO I18N
			 }
			 else
			 {
				 showalert('failure',data.errorStr,'isAutoHide=false,delay=3,width=400') //NO I18N
			 }
		 },
	      error:function(data)
	      {
	    	  showalert('failure',jQuery.parseJSON(data.responseText).response_status.messages[0].message,'isAutoHide=false,delay=3,width=400');	//NO I18N
	      }
	 });
	 jQuery('#uploadMIB').val('');
}

function searchMIBNodes()
{
	jQuery("#mibTreeView").jstree("search",jQuery("#search_node").val()); //NO I18N
}

function expandOrCollapseAll()
{
	var el = document.activeElement;
	if(jQuery(el).attr('isToggle')=='true')
	{
		jQuery(el).attr("title", getMessageForKey("sdp.common.collapseall")).tooltip({
            content: function()
            {
            const element = jQuery(this);
            return element.attr("title"); //NO I18N
            },
            track: true,
            show: {
            delay: 250
            },
            tooltipClass: "uitip" // NO I18N
        })
		jQuery(el).find('span').attr('class','cspr collapse-arrow1 icon-sm top3 vshow'); //NO I18N
		jQuery("#mibTreeView").jstree("open_all"); //NO I18N
		jQuery(el).attr('isToggle','false'); //NO I18N
	}
	else
	{
	    jQuery(el).attr("title", getMessageForKey("sdp.requests.viewrequest.expandall")).tooltip({
            content: function()
            {
            const element = jQuery(this);
            return element.attr("title"); //NO I18N
            },
            track: true,
            show: {
            delay: 250
            },
            tooltipClass: "uitip" // NO I18N
        })
		jQuery(el).find('span').attr('class','cspr expand-arrow1 icon-sm top3 vshow'); //NO I18N
		jQuery("#mibTreeView").jstree("close_all"); //NO I18N
		jQuery(el).attr('isToggle','true'); //NO I18N
	}
}

function changeListViewData()
{
	var productTypeId = jQuery('#productType').val();
	var filterJSON = {};
	if(productTypeId != '' && productTypeId != '0')
	{
	    filterJSON["product_type.id"] = productTypeId;      //NO I18N
	}
	var manufacturerId = jQuery('#manufacturer').val();
	if(manufacturerId != '' && manufacturerId != '-1')
	{
	    filterJSON["manufacturer.id"] = manufacturerId;	//NO I18N
	}
	snmpDevicesListView(filterJSON);
}

function searchHighlight(searchText)
{
	if(searchText)
	{
	   jQuery("#OIDOutput span").contents().unwrap();
	   var content = jQuery("#OIDOutput").html();
	   var searchExp = new RegExp(searchText, "ig");
	   var matches = content.match(searchExp);
	   var count = 0;
	   if(matches)
	   {
		   jQuery("#OIDOutput").html(content.replace(searchExp,function(match){
			   count = count+1;
			   var styleClass;
			   if(count == 1)
			   {
				   styleClass = 'highlight focustext'; //NO I18N
			   }
			   else
			   {
				   styleClass = 'highlight'; //NO I18N
			   }
			   return "<span id='search_"+count+"' class='"+styleClass+"'>"+match+"</span>";
		   })) ;
	   }
	   else
	   {
		   jQuery('.highlight').removeClass("highlight");
		   jQuery('.focustext').removeClass("focustext");
	   }
	}
	else
	{
	   jQuery('.highlight').removeClass("highlight");
	   jQuery('.focustext').removeClass("focustext");
	}
}

function focusHighLight()
{
	var id = jQuery(".focustext").attr('id');
	var data = id.split('_');
	var idNum = parseInt(data[1])+1;
	jQuery("#"+id).removeClass('focustext');
	if(jQuery('#search_'+idNum).length)
	{
	   	jQuery('#search_'+idNum).addClass("focustext");
	}
	else
	{
		idNum = 1;
		jQuery('#search_1').addClass("focustext");
	    jQuery('#search_1').trigger('focus');
	}
	var container = jQuery('#OIDOutput');
   	var scrollTo = jQuery('#search_'+idNum);
   	container.scrollTop(
   		    scrollTo.offset().top - container.offset().top + container.scrollTop()
   		);
}

function clearDiv()
{
	jQuery('#OIDOutput').text('');
	jQuery('#clearSection').prop('disabled',true);//No I18N
}
function getValuesForOID(tabName,operation)
{
	var mibName = jQuery('#MIBList').val();
        if(sdp_app.IS_DEMO_BUILD) {
            showalert('failure',getMessageForKey('sdp.setup.orgdef.demoonline.jserror'),'isAutoHide=true,delay=3');//No I18N
            return false;
        }
	/*if(trim(mibName) == '')
	{
	    alert(getMessageForKey("sdp.admin.snmp.mibbrowser.choose.mib"));
	    return false;
	}*/

	var host = jQuery('#host').val();
	if(trim(host) == '')
	{
	    alert(getMessageForKey("sdp.admin.snmp.enter.hostname"));
	    jQuery('#host').trigger('focus');
	    return false;
	}

	var oid = jQuery('#OIDSelected').val();
	if(trim(oid) == '')
	{
	    alert(getMessageForKey("sdp.admin.snmp.enter.oid"));
	    jQuery('#OIDSelected').trigger('focus');
	    return false;
	}
	if(mibName != null && !trim(mibName) == ''){
		var paramJSON = {"mib_name":mibName,"host_name":host,"oid":oid,"operation_name":operation}; //NO I18N
	}
	else{
   	 var paramJSON = {"host_name":host,"oid":oid,"operation_name":operation}; //NO I18N
    }
	if(tabName == 'MIBBrowser')
	{
	   	if(jQuery('#tab_1_1').hasClass('active'))
	   	{
	   		if(trim(jQuery('#community').val()) == '')
	   		{
	   			alert(getMessageForKey("sdp.admin.snmp.mibbrowser.community.error"));
	   		    jQuery('#community').trigger('focus');
	   		    return false;
	   		}
	   		var password = encryptDataWithRSA(jQuery("#community").val());
			paramJSON.snmp_password_info = {"password":password};   //NO I18N
	   		paramJSON.snmp_port_number = snmpv1v2.t1_portNo;
	   		paramJSON.snmp_time_out = snmpv1v2.t1_timeSec;
	   		paramJSON.snmp_retries = snmpv1v2.t1_retries
	   		paramJSON.max_repetitions = snmpv1v2.t1_maxrepetition;
	   		paramJSON.non_repeaters = snmpv1v2.t1_nonrepeaters;
	   		paramJSON.protocol = {"name":"SNMP V1/V2"}; //NO I18N
	   	}
	   	else if(jQuery('#tab_2_1').hasClass('active'))
	   	{
	   		paramJSON.snmpv3_port_number = snmpv3.t2_portNo;
	   		paramJSON.snmpv3_time_out = snmpv3.t2_timeSec;
	   		paramJSON.snmpv3_retries = snmpv3.t2_retries;
	   		paramJSON.snmpv3_username = snmpv3.t2_username;
	   		paramJSON.snmpv3_contextname = snmpv3.t2_contextname;
	   		paramJSON.snmpv3_authentication_protocol = snmpv3.t2_authcategory;
	   		var authPassword = encryptDataWithRSA(snmpv3.t2_authpassword);
	   		paramJSON.snmpv3_auth_password_info = {"password":authPassword};  //NO I18N
	   		paramJSON.snmpv3_encryption_protocol = snmpv3.t2_encryptcategory;
	   		var EncryptPassword = encryptDataWithRSA(snmpv3.t2_encrptpassword);
	   		paramJSON.snmpv3_encryption_password_info = {"password":EncryptPassword	};  //NO I18N
	   		paramJSON.protocol = {"name": "SNMP V3"}; //NO I18N
	   	}
	   	else
	   	{
	   		paramJSON.id = mibCred.credentialID;
	   	}

	}
	else
	{
		var credentials = jQuery('#credentials').val();
		if(trim(credentials) == '')
		{
		   alert(getMessageForKey("sdp.admin.snmp.choose.credentials"));
		   jQuery('#credentials').select2('open');  //NO I18N
		   return false;
		}
		paramJSON.id = credentials;
	}
	var input_data = {"snmp":paramJSON};  //NO I18N
	var temp = true;
	sdpAjax({
		url:"/api/v3/snmp", //NO I18N
		data : "input_data="+encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(input_data) : JSON.stringify(input_data) ), //NO I18N
		type: "GET", //NO I18N
		dataType: "json", //NO I18N
		success:function(data){
			temp = false;
			if(data.response_status.status == 'success')
		    {
			  var output;
			  if(data.snmp[0].snmp_get != null)
			  {
				  output = "<br>"+data.snmp[0].snmp_get.replace(/\n/g,"<br/><br/>")+'<br/><br/>'+ jQuery('#OIDOutput').html();  //NO I18N
			  }
			  else
			  {
				  output = "<br>"+data.snmp[0].snmp_table.replace(/\n/g,"<br/><br/>")+'<br/><br/>'+ jQuery('#OIDOutput').html();  //NO I18N
			  }
			  jQuery('#OIDOutput').html(output);
			  jQuery('#clearSection').prop('disabled',false);//No I18N
		    }
			else
			{
				showalert('failure',data.response_status.messages[0].message,'isAutoHide=false,delay=3,width=400') //NO I18N
			}
			jQuery('#'+operation).prop('disabled',false);//No I18N
			jQuery('#loading').addClass('hide');
			jQuery('#OIDOutput').removeClass('pt63');
		},
		beforeSend: function() {
			setTimeout(function(){
				if(temp)
				{
					jQuery(document).scrollTop();
					jQuery('#loading').removeClass('hide');
					jQuery('#OIDOutput').addClass('pt63');
					jQuery('#'+operation).prop('disabled',true);//No I18N
				}
			},300)

		}
	});
    return true;
}

var snmpv1v2;
function createJSONForV1v2()
{
	var portNo = jQuery('#t1_portNo').val();
	if(trim(portNo) == '')
    {
	   alert(getMessageForKey("sdp.admin.snmp.mibbrowser.enter.portno"));
	   jQuery('#t1_portNo').trigger('focus');
	   return false;
	}
	else if(!jQuery.isNumeric(trim(portNo)))
	{
	   alert(getMessageForKey("sdp.admin.credentiallibrary.validport"));
	   jQuery('#t1_portNo').trigger('focus');
	   return false;
	}

	var timeSec = jQuery('#t1_timeSec').val();
	if(trim(timeSec) == '')
	{
	   alert(getMessageForKey("sdp.admin.snmp.mibbrowser.enter.timesec"));
	   jQuery('#t1_timeSec').trigger('focus');
	   return false;
	}
	else if(!jQuery.isNumeric(trim(timeSec)))
	{
	   alert(getMessageForKey("sdp.admin.ad.schedule.invalidno"));
	   jQuery('#t1_timeSec').trigger('focus');
	   return false;
	}

	var retries = jQuery('#t1_retries').val();
	if(trim(retries) == '')
	{
	   alert(getMessageForKey("sdp.admin.snmp.mibbrowser.enter.retires"));
	   jQuery('#t1_retries').trigger('focus');
	   return false;
	}
	else if(!jQuery.isNumeric(trim(retries)))
	{
	   alert(getMessageForKey("sdp.admin.ad.schedule.invalidno"));
	   jQuery('#t1_retries').trigger('focus');
	   return false;
	}

	var maxRep = jQuery('#t1_maxrepetition').val();
	if(trim(maxRep) == '')
	{
	   alert(getMessageForKey("sdp.admin.snmp.mibbrowser.enter.max.repetition"));
	   jQuery('#t1_maxrepetition').trigger('focus');
	   return false;
	}
	else if(!jQuery.isNumeric(trim(maxRep)))
	{
	   alert(getMessageForKey("sdp.admin.ad.schedule.invalidno"));
	   jQuery('#t1_maxrepetition').trigger('focus');
	   return false;
	}

	var nonRep = jQuery('#t1_nonrepeaters').val();
	if(trim(nonRep) == '')
	{
	   alert(getMessageForKey("sdp.admin.snmp.mibbrowser.enter.non.repeaters"));
	   jQuery('#t1_nonrepeaters').trigger('focus');
	   return false;
	}
	else if(!jQuery.isNumeric(trim(nonRep)))
	{
	   alert(getMessageForKey("sdp.admin.ad.schedule.invalidno"));
	   jQuery('#t1_nonrepeaters').trigger('focus');
	   return false;
	}

	var community = jQuery('#community').val();
	if(trim(community) == '')
	{
		alert(getMessageForKey("sdp.admin.snmp.mibbrowser.community.error"));
		jQuery('#community').trigger('focus');
		return false;
	}

	snmpv1v2 = {"t1_portNo":portNo,"t1_timeSec":timeSec,"t1_retries":retries,"t1_maxrepetition":maxRep,"t1_nonrepeaters":nonRep,"community":community};  //NO I18N
	return true;
}

var snmpv3;
function createJSONForV3()
{
	var portNo = jQuery('#t2_portNo').val();
	if(trim(portNo) == '')
	{
	   alert(getMessageForKey("sdp.admin.snmp.mibbrowser.enter.portno"));
	   jQuery('#t2_portNo').trigger('focus');
	   return false;
	}
	else if(!jQuery.isNumeric(trim(portNo)))
	{
	   alert(getMessageForKey("sdp.admin.credentiallibrary.validport"));
	   jQuery('#t2_portNo').trigger('focus');
	   return false;
	}

	var timeSec = jQuery('#t2_timeSec').val();
	if(trim(timeSec) == '')
	{
	   alert(getMessageForKey("sdp.admin.snmp.mibbrowser.enter.timesec"));
	   jQuery('#t2_timeSec').trigger('focus');
	   return false;
	}
	else if(!jQuery.isNumeric(trim(timeSec)))
	{
	   alert(getMessageForKey("sdp.admin.ad.schedule.invalidno"));
	   jQuery('#t2_timeSec').trigger('focus');
	   return false;
	}

	var retries = jQuery('#t2_retries').val();
	if(trim(retries) == '')
	{
	   alert(getMessageForKey("sdp.admin.snmp.mibbrowser.enter.retires"));
	   jQuery('#t2_retries').trigger('focus');
	   return false;
	}
	else if(!jQuery.isNumeric(trim(retries)))
	{
	   alert(getMessageForKey("sdp.admin.ad.schedule.invalidno"));
	   jQuery('#t2_retries').trigger('focus');
	   return false;
	}

	var userName = jQuery('#t2_username').val();
	if(trim(userName) == '')
	{
	   alert(getMessageForKey("sdp.admin.credentiallibrary.enter.username"));
	   jQuery('#t2_username').trigger('focus');
	   return false;
	}
	var contextName = jQuery('#t2_contextname').val();
	var t2_authcategory = jQuery('#t2_authcategory').val();
	var t2_authpassword = jQuery('#t2_authpassword').val();
	if(trim(t2_authcategory) == "" && trim(t2_authpassword) != "")
	{
	   alert(getMessageForKey("sdp.admin.snmp.mibbrowser.auth.category"));
	   jQuery('#t2_authcategory').select2('open'); //NO I18N
	   return false;
	}
	if(trim(t2_authcategory) != "" && trim(t2_authpassword) == "")
	{
	   alert(getMessageForKey("sdp.admin.credentiallibrary.enter.password"));
	   jQuery('#t2_authpassword').trigger('focus');
	   return false;
	}
	var t2_encryptcategory = jQuery('#t2_encryptcategory').val();
	var t2_encrptpassword = jQuery('#t2_encrptpassword').val();
	if(trim(t2_encryptcategory) == "" && trim(t2_encrptpassword) != "")
	{
	   alert(getMessageForKey("sdp.admin.snmp.mibbrowser.encrpt.category"));
	   jQuery('#t2_encryptcategory').select2('open'); //NO I18N
	   return false;
	}
	if(trim(t2_encryptcategory) != "" && trim(t2_encrptpassword) == "")
	{
	   alert(getMessageForKey("sdp.admin.credentiallibrary.enter.password"));
	   jQuery('#t2_encrptpassword').trigger('focus');
	   return false;
	}

	snmpv3 = {"t2_portNo":portNo,"t2_timeSec":timeSec,"t2_retries":retries,"t2_username":userName,"t2_contextname":contextName,"t2_authcategory":t2_authcategory,"t2_authpassword":t2_authpassword,"t2_encryptcategory":t2_encryptcategory,"t2_encrptpassword":t2_encrptpassword}; //NO I18N
	return true;
}

var mibCred = {};
function createJSONForCredentials()
{
	var credentials = jQuery('#credentials').select2('data');  //NO I18N
	if(trim(jQuery('#credentials').val()) == '')
	{
	   alert(getMessageForKey("sdp.admin.snmp.choose.credentials"));
	   jQuery('#credentials').select2('open');  //NO I18N
	   return false;
	}
	else
	{
		mibCred = {"credentialID":credentials.id,"activetab":"mibCred"};   //NO I18N
		delete snmpv1v2.activetab;
		delete snmpv3.activetab;
		displayCredentialsType(credentials.text);
	}
	return true;
}

function setEmptyValToCredentialJSON()
{
	mibCred = {};
}

function setValtoJSON()
{
	var returnVal = true;
	var text;
	if(jQuery('#tab_1_1').hasClass('active'))
   	{
		returnVal = createJSONForV1v2();
		if(returnVal)
		{
			snmpv1v2.activetab = "snmpv1v2";//NO I18N
			delete snmpv3.activetab;
			delete mibCred.activetab;
			text = getMessageForKey('sdp.admin.snmp.mibbrowser.v1.v2');
		}
   	}
	else if(jQuery('#tab_2_1').hasClass('active'))
	{
		returnVal = createJSONForV3();
		if(returnVal)
		{
			delete snmpv1v2.activetab;
			delete mibCred.activetab;
			snmpv3.activetab = "snmpv3";   //NO I18N
			text = getMessageForKey('sdp.admin.snmp.mibbrowser.v3');
		}
	}
	else
	{
		returnVal = createJSONForCredentials();
	}
	if(returnVal)
	{
		displayCredentialsType(text);
		closeParameterPOPup();
	}
}

function displayCredentialsType(text)
{
	if(text != null && trim(text) != '')
	{
		jQuery('#displayCredType').text(text);
	}
}

function setValuesFromJSON()
{
	jQuery('#t1_portNo').val(snmpv1v2.t1_portNo);
	jQuery('#t1_timeSec').val(snmpv1v2.t1_timeSec);
	jQuery('#t1_retries').val(snmpv1v2.t1_retries);
	jQuery('#t1_maxrepetition').val(snmpv1v2.t1_maxrepetition);
	jQuery('#t1_nonrepeaters').val(snmpv1v2.t1_nonrepeaters);
	jQuery('#community').val(snmpv1v2.community);

	jQuery('#t2_portNo').val(snmpv3.t2_portNo);
	jQuery('#t2_timeSec').val(snmpv3.t2_timeSec);
	jQuery('#t2_retries').val(snmpv3.t2_retries);
	jQuery('#t2_username').val(snmpv3.t2_username);
	jQuery('#t2_contextname').val(snmpv3.t2_contextname);
	if(snmpv3.t2_authcategory == '')
	{
		jQuery('#t2_authcategory').select2('val','');   //NO I18N
	}
	else
	{
		jQuery('#t2_authcategory').select2('val',snmpv3.t2_authcategory);   //NO I18N
	}
	jQuery('#t2_authpassword').val(snmpv3.t2_authpassword);
	if(snmpv3.t2_encryptcategory == '')
	{
		jQuery('#t2_encryptcategory').select2('val','');   //NO I18N
	}
	else
	{
		jQuery('#t2_encryptcategory').select2('val',snmpv3.t2_encryptcategory);   //NO I18N
	}
	jQuery('#t2_encrptpassword').val(snmpv3.t2_encrptpassword);

	if("credentialID" in mibCred)
	{
	    jQuery('#credentials').val(mibCred.credentialID).trigger('change');
	}
	else
	{
		jQuery('#credentials').select2('val','');   //NO I18N
	}
}

function closeParameterPOPup()
{
	jQuery('#setParameter').addClass('hide');

	if("activetab" in mibCred)
	{
		jQuery('#setParameter .nav-sdtabs li:eq(2) a').trigger('click');
	}
	else if("activetab" in snmpv3)
	{
		jQuery('#setParameter .nav-sdtabs li:eq(1) a').trigger('click');
	}
	else
	{
		jQuery('#setParameter .nav-sdtabs li:eq(0) a').trigger('click');
	}
}

function changeSNMPInvOIDListView()
{
	var inventoryTitle = '';
	var filterJSON = {};
	var data = jQuery('#Inv_productType').select2('data'); //No I18N
	if(data)
	{
		inventoryTitle = data.display_name;
		if(data.id != 0) {
			filterJSON["product_type.id"] = data.id;  //NO I18N
		}
		jQuery('#Inv_manufacturer').select2('enable'); //NO I18N
	}
	else
	{
		alert(getMessageForKey("sdp.admin.snmp.please.choose.producttype"));
        jQuery('#Inv_productType').trigger('focus');
        return false;
	}
	data = jQuery('#Inv_manufacturer').select2('data'); //No I18N
	if(data && data.id != "-1")
	{
		filterJSON["manufacturer.id"] = data.id;           //NO I18N
		inventoryTitle = inventoryTitle+" - "+data.text;
	}
	jQuery('#snmpInvOIDs').show();
	jQuery('#Inv_title').text(inventoryTitle);
	snmpInventoryOIDListView(filterJSON);
}

function editDeviceData(row_data)
{
    row_data = JSON.parse(row_data);
   	showURLInDialog('../setup/AddSnmpModelPopup.jsp?mode=edit','position=absmiddle,closeButton=no,width=auto,modal=yes'); //No I18N
   	setTimeout(function(){
   		jQuery('#oidTypeID').val(row_data.id);
   		jQuery('#snmpModel').val(row_data.model);
   	   	jQuery('#addSNMPModel_productType').select2('data',{"id":row_data.product_type.id,"display_name":row_data.product_type.name}, true); //No I18N
   	   	jQuery('#addSNMPModel_manufacturer').select2('data',{"id":row_data.manufacturer.id,"text":row_data.manufacturer.name},true); //No I18N
   	   	jQuery('#sysOID').val(row_data.sysoid);
   	   	jQuery('#modeloid').val(row_data.modeloid);
   	}, 250);

}


function loadMappedAttrValue()
{
	var selectedJSON = JSON.parse(jQuery('#AttributeList').select2("data").id);	//NO I18N
	var oid = selectedJSON.oid;
	if(trim(oid) != null)
	{
	    jQuery('#OIDToMap').val(oid);
	    jQuery('#OIDSelected').val(oid);
	}
	else
	{
	    jQuery('#OIDToMap').val('');
	}

	var unit = selectedJSON.unit;
	if(trim(unit) != null && trim(unit) != "")
	{
		jQuery("#unit").val(unit).trigger('change');
	}
	else
	{
	    jQuery('#unit').val(-1).trigger('change');
	}
}

function validateAttributeType()
{
	var attribute = jQuery('#AttributeList').select2("data");        //NO I18N
	if(attribute != null)
	{
		attribute = jQuery.parseJSON(jQuery('#AttributeList').select2("data").id);
		var unit = jQuery('#unit').val();
		if(attribute.data_type != getMessageForKey('ae.cmdb.newCIType.number') && unit != null && trim(unit) != '' && trim(unit) != '-1')
		{
			alert(getMessageForKey('sdp.admin.snmp.unit.choose.for.numeric.field'));
			jQuery('#unit').select2("val","-1");	//NO I18N
		}
	}
}

function saveAttribute()
{
	var attribute = jQuery('#AttributeList').select2("data");        //NO I18N
	if(attribute == null)
	{
	   	alert(getMessageForKey("sdp.admin.snmp.please.choose.attribute"));
	   	jQuery('#AttributeList').select2('open');  //NO I18N
	   	return false;
	}
	attribute = jQuery.parseJSON(jQuery('#AttributeList').select2("data").id);        //NO I18N
	var oid = jQuery('#OIDToMap').val();
	if(oid == null || trim(oid) == '' || trim(oid) == '-')
	{
	    delete attribute.oid;
	}
	else
	{
	    attribute.oid = oid;
	}
	var unit = jQuery('#unit').val();
	if(unit != null && trim(unit) != '' && trim(unit) != '-1')
	{
	    attribute.unit = unit;
	}
	else
	{
	    delete attribute.unit;
	}
	var data = jQuery('#Inv_productType').select2('data');       //NO I18N
	var snmpInvTypeData = {};
	if(data != null)
	{
		snmpInvTypeData.product_type = {"id":data.id,"name":data.text};       //NO I18N
	}
	data = jQuery('#Inv_manufacturer').select2('data');            //NO I18N
	if(data != null && data.id != -1)
	{
	    snmpInvTypeData.manufacturer = {"id":data.id,"name":data.text};	         //NO I18N
	}
	snmpInvTypeData.configure_oid = attribute;
	var input_data = {"snmpinventorytype":snmpInvTypeData};               //NO I18N
	sdpAjax({
		async: false,
		url:"/api/v3/snmpinventorytype", //NO I18N
		data: "input_data="+encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(input_data) : JSON.stringify(input_data) )+"&"+getCSRFParamName()+"="+getCSRFParamValue(), //NO I18N
		type: "PUT", //NO I18N
		dataType: "json", //NO I18N
		success:function(data){
			if(data.response_status.status == 'success')
			{
			    showalert('success',data.response_status.messages[0].message,'isAutoHide=true,delay=3,width=400'); //NO I18N
			    if(data.snmpinventoryoid != null)
			    {
			    	jQuery('#AttributeList option:selected').val((typeof sdpToJSON != 'undefined') ? sdpToJSON(data.snmpinventoryoid[0]) : JSON.stringify(data.snmpinventoryoid[0]) );
			    }
			    else
			    {
			    	jQuery('#AttributeList option:selected').val((typeof sdpToJSON != 'undefined') ? sdpToJSON(attribute) : JSON.stringify(attribute) ); //NO I18N
			    }
			    changeSNMPInvOIDListView();
			}
			else
			{
			    showalert('failure',data.response_status.messages[0].message,'isAutoHide=false,delay=3,width=400');	//NO I18N
			}
		}
	});
	return false;
}

function editOIDMapping(row_data)
{
    row_data = JSON.parse(row_data);
	showURLInDialog('../setup/SnmpOIDConfigPopup.jsp','title='+getMessageForKey("sdp.admin.snmp.configure.oid.for")+' '+encodeHTML(jQuery('#Inv_title').text())+',width=auto,modal=yes,position=absmiddle',snmpCallBack.initsnmpTooltip);
	setTimeout(function(){
	jQuery('#AttributeList').select2('data',{"id": (typeof sdpToJSON != 'undefined') ? sdpToJSON(row_data) : JSON.stringify(row_data) ,"text":row_data.field},true); //No I18N
	}, 250);
}

function getAttributeListToMapOID()
{
	var filterJSON = {};
	var data = jQuery('#Inv_productType').select2('data');           //NO I18N
	filterJSON.product_type = {"id":data.id,"name":data.text};         //NO I18N
	data = jQuery('#Inv_manufacturer').select2('data');               //NO I18N
	if(data != null && data.id != "-1") //If manufacturer filter is not selected, then manufacturer criteria is not required to set.
	{
	    filterJSON.manufacturer = {"id":data.id,"name":data.text};	        //NO I18N
	}
	var device_inventory = {"snmpinventorytype":filterJSON};                //NO I18N
	jQuery("#AttributeList").attr("data-placeholder",getMessageForKey("sdp.admin.snmp.choose.attribute"));
	jQuery('#AttributeList').select2(
            sdpAjax({
                      async: false,
                      url:"/api/v3/snmpinventorytype", //NO I18N
                      data : "input_data="+encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(device_inventory) : JSON.stringify(device_inventory) ), //NO I18N
                      type: "GET", //NO I18N
                      dataType: "json", //NO I18N
                      success: function(data){
                      	jQuery.each(data.snmpinventoryoids, function(messageIndex,jsonObject) {
                              jQuery('#AttributeList').append(jQuery("<option></option>").val((typeof sdpToJSON != 'undefined') ? sdpToJSON(jsonObject) : JSON.stringify(jsonObject) ).text(jsonObject.field));   
                      	   });
                      }
       })
  );
  jQuery('#AttributeList').on("change", function(event){loadMappedAttrValue()});
}

function getSnmpCredentialsList()
{	
	jQuery("#credentials").sdp_select2({
	      multiple:false,
	      placeholder: getMessageForKey("ae.admin.credentiallibrary.scantype"), //NO I18N
	      url:[{
	      	url:"/api/v3/snmp_credentials",//NO I18N
	     	field:'snmp_credentials',//NO I18N
	     	list_info:{start_index:1,sort_field:"name",row_count:25,search_criteria:[{"field" : "protocol.name","condition" : "contains","value": "SNMP"}]},//NO I18N
	      	isOPAPI : false
	      }]
	  });
}

function addNetworkDeviceManufacturer(id)
{
	var manufacturerName = jQuery('#manufacturerName').val();
	var toReturn = true;
	if(trim(manufacturerName) == '')
    {
	    alert(getMessageForKey("sdp.admin.snmp.enter.manufacturer"));
	    jQuery('#manufacturerName').trigger('focus');
	    return false;
	}
	var data = {"networkdevicemanufacturer" : {"name":manufacturerName}}; //NO I18N
	sdpAjax({
		async: false,
		url:"/api/v3/networkdevicemanufacturer", //NO I18N
		data : "input_data="+encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(data) : JSON.stringify(data) )+"&"+getCSRFParamName()+"="+getCSRFParamValue(), //NO I18N
		type: "POST", //NO I18N
		dataType: "json", //NO I18N
		success:function(data){
			if(data.response_status.status == 'success')
			{
			   showalert('success',data.response_status.messages[0].message,'isAutoHide=true,delay=3,width=400'); //NO I18N
			   jQuery('#'+id).select2('data',{"id":data.networkdevicemanufacturer[0].id,"text":data.networkdevicemanufacturer[0].name},true); //NO I18N
			}
			else
			{
			    showalert('failure',data.response_status.messages[0].message,'isAutoHide=false,delay=3,width=400');	//NO I18N
			    toReturn = false;
			}
			if(id != 'addSNMPModel_manufacturer')
			{
			   closeDialog();
			}
		}
	});

	return toReturn;
}

function addNewProductType()
{
	var productTypeName = jQuery('#productTypeName').val();
	if(trim(productTypeName) == '')
	{
	    alert(getMessageForKey("sdp.admin.producttype.namejserror"));
	    jQuery('#productTypeName').trigger('focus');
	    return false;
	}
	jQuery.ajax({
			async: false,
			url:"/ProductTypeDef.do?mode=add&category="+jQuery('#category').select2('data').id+"&resourceType="+jQuery('#type').select2('data').id+"&name="+encodeURIComponent(productTypeName)+"&description="+encodeURIComponent(jQuery('#description').val()), //NO I18N
			type: "POST", //NO I18N
			dataType: "xml", //NO I18N
			success:function(data){
				if(data.getElementsByTagName("status")[0].childNodes[0].nodeValue == 200)
				{
					 showalert('success',data.getElementsByTagName("message")[0].childNodes[0].nodeValue,'isAutoHide=true,delay=3,width=400'); //NO I18N
					 jQuery('#addSNMPModel_productType').select2('data',{"id":data.getElementsByTagName("id")[0].childNodes[0].nodeValue,"text":productTypeName},true); //NO I18N
					 jQuery('#backview').trigger('click');
				}
				else
				{
				    showalert('failure',encodeHTML(data.getElementsByTagName("message")[0].childNodes[0].nodeValue),'isAutoHide=false,delay=3,width=400');	//NO I18N
				}
			}
		});

}

var unKnownTypeOID = [];
function loadUnknownTypeOIDList()
{
	var val = unKnownOIDListView();
	setTimeout(function(){
		const formatResult = (data) => e_html(data.display_name || data.text);
		if(jQuery('#snmp_unknowntype_oids td').attr('colspan') != 'undefined' && jQuery('#snmp_unknowntype_oids td').attr('colspan') == 6)
		{
		    jQuery('#saveUnknownOID').addClass('hide');
		}
		else
		{
		    jQuery('#saveUnknownOID').removeClass('hide');
		}
		for(var i = 0; i < unKnownTypeOID.length; i++)
		{
			var eleId = 'productType_'+unKnownTypeOID[i].id;
			var options = {
				url: "/api/v3/asset_assets/module", //No I18N
				entity: "module", //No I18N
				id : eleId,
				displayField : "display_name",//No I18N
				selectedValue: 0,
				inputData: {"for": "snmp", "list_info":{"fields_required":["display_name"], "start_index": 1, "row_count": 100}},  //NO I18N
				defaultOption : {"id": 0, "display_name": getMessageForKey("sdp.admin.product.typejserror")}//No I18N
			}
			hierarchySelect2.init(options);

			  var params = '{"module": "snmpManufacturer","dropdownLength":"25"}'; //NO I18N
			  if(unKnownTypeOID[i].manufacturer!=null){
			  	var selectedProductTypeData = {"id":unKnownTypeOID[i].manufacturer.id,"text":unKnownTypeOID[i].manufacturer.name};  //NO I18N
			  	updateSelect2Dropdown({ elementId:'manufacturer_'+unKnownTypeOID[i].id, // no i18n
			   					            placeHolder: getMessageForKey("sdp.admin.snmp.choose.manufacturer"),
			   					            isOnChangeEventRequired : false,
			   					            params: params,
			   					            selectedData : selectedProductTypeData,
			     			                formatSearching : getMessageForKey("sdp.admin.snmo.fetching.manufacturer"),
			   					            noMatchesFormatString : getMessageForKey("ae.select2.no.message"),
			   					            noOtherValuesFound : getMessageForKey("sdp.admin.snmp.no.other.manufacturer.found")
			   		 			            });

			  }
			  else{
			  	updateSelect2Dropdown({ elementId:'manufacturer_'+unKnownTypeOID[i].id, // no i18n
			   					            placeHolder: getMessageForKey("sdp.admin.snmp.choose.manufacturer"),
			   					            isOnChangeEventRequired : false,
			   					            params: params,
			   					            formatSearching : getMessageForKey("sdp.admin.snmo.fetching.manufacturer"),
			   					            noMatchesFormatString : getMessageForKey("ae.select2.no.message"),
			   					            noOtherValuesFound : getMessageForKey("sdp.admin.snmp.no.other.manufacturer.found")
			   		 			            });
			  }
			  const manufacturerBtn = jQuery('<a class="btn btn-default disp-b" id="snmpman" data-id='+unKnownTypeOID[i].id+' ><span class="common-sprite icon-xs common-add-icon4 mr5"></span>'+getMessageForKey("sdp.common.addnew")+'</a>');
			  manufacturerBtn.on("click", function(event) { //NO I18N
				event.preventDefault();
				let id = jQuery(this).data("id"); //NO I18N
				showURLInDialog('../setup/AddNetworkDeviceManufacturer.jsp?manuUnOID='+id,'modal=no,closeOnEscKey=yes,closeButton=no,width=400,position=absmiddle'); //NO I18N
			  });
			  jQuery("#manufacturer_"+unKnownTypeOID[i].id).select2("container").on("select2-opening").find(".select2-drop").append(manufacturerBtn); //NO I18N
		}
	},500)
}


function resetUnknownTypeOIDData()
{
	jQuery('#snmp_unknowntype_oids').find('input:text').val('');
	jQuery('#snmp_unknowntype_oids [id^=productType_]').select2("val",""); //NO I18N
	jQuery('#snmp_unknowntype_oids [id^=manufacturer_]').select2("val",""); //NO I18N
}

function associateUnknownTypeOIDs()
{
	var unKnownOIDData = [];
	var isFieldSelected = true;
	jQuery('#snmp_unknowntype_oids td:first-child span').each(function() {
	    var data = jQuery(this).attr("id").split('_');
	    var id = data[1];
	    var productTypeID = jQuery('#productType_'+id).val();

        if(productTypeID == 0){
            productTypeID ='';
        }

	    var product = jQuery('#product_'+id).val();
	    var manufacturerID = jQuery('#manufacturer_'+id).val()
	    if(productTypeID == '' && trim(product) != '')
	    {
	       alert(getMessageForKey("sdp.admin.snmp.please.choose.producttype"));
	       jQuery('#productType_'+id).select2('open');  //NO I18N
	       isFieldSelected = false;
	       return false;
	    }

	    if(trim(product) == '' && manufacturerID != '')
	    {
	    	alert(getMessageForKey("sdp.admin.snmp.unknown.enter.model"));
	    	jQuery('#product_'+id).trigger('focus');
	    	isFieldSelected = false;
	    	return false;
	    }

	    if(manufacturerID == '' && productTypeID != '')
	    {
	    	alert(getMessageForKey("sdp.admin.snmp.please.select.manufacturer"));
	    	jQuery('#manufacturer_'+id).select2('open');  //NO I18N
	    	isFieldSelected = false;
	    	return false;
	    }

	    if(productTypeID != '' && trim(product) != '' && manufacturerID != '')
	    {
	        var oiddata = {"id":id,"product_type":{"id":productTypeID,"name":jQuery('#productType_'+id).select2('data').text},"model":product,"manufacturer":{"id":manufacturerID,"name":jQuery('#manufacturer_'+id).select2('data').text}}; //NO I18N
	        unKnownOIDData.push(oiddata);
	    }
	});
    if(unKnownOIDData.length > 0 && isFieldSelected)
    {
    	if(window.Prototype) {
    		delete Array.prototype.toJSON;
    		Object.prototype.toJSON;
    	}
    	var paramData = {"snmp_unknowntype_oids":unKnownOIDData};   //NO I18N
    	sdpAjax({

     		 url : '/api/v3/snmp_unknowntype_oids', //NO I18N
     		 data : 'input_data='+encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(paramData) : JSON.stringify(paramData) )+"&"+getCSRFParamName()+"="+getCSRFParamValue(), //NO I18N
     		 type : 'PUT', //NO I18N
     		 dataType : 'json', //NO I18N
     		 success: function(data)
     		 {
     			 if(data.snmp_unknowntype_oids != null)
     			 {
     				 showalert('success',data.response_status.messages[0].message,'isAutoHide=true,delay=3,width=400') //NO I18N
     				 loadUnknownTypeOIDList();
     			 }
     			 else
     			 {
     				 showalert('failure',data.response_status.messages[0].message,'isAutoHide=false,delay=3,width=400') //NO I18N
     			 }
     		 }
     	    });
    }
    else
    {
    	if(isFieldSelected)
    	{
    		alert(getMessageForKey("ae.cmdb.admin.relationship.type.mandatoryfield"));
    		return false;
    	}
    }
}

//Unknown type oid list view
function unKnownOIDListView()
{
	var table_info = table_comp.getTableInfo("snmp_unknowntype_oids"); //No I18N
    var _self = this;
    var table_content = {};
        table_content.header = this.headerdataConstructForunKnownOIDList(table_info);
        setTimeout(function(){
            var options = {};
            	options.searchEnabled       = false;
                options.row_inputdata       = _self.rowdataConstruct(table_info);
                options.callbackURL         = "snmp_unknowntype_oids"; // No I18N
                options.entity_name         = "snmp_unknowntype_oids"; // No I18N
                table_comp_obj = new tableComponent(table_info,table_content,options);
        },1);

   return true;
}

function headerdataConstructForunKnownOIDList(table_info)
{
    var _self = this;
	var remote;
	var header
	var isRemote;
		sdpAjax({
		type: 'GET',//no i18n
		url: '/servlet/AJaxServlet?action=getIsRemoteServer',//no i18n
		async: false,
		success: function(resp)
		{
			remote = resp;
		}
	  });
	if( remote != undefined){
		isRemote = remote.IsRemote
		if(isRemote === 'true'){
			header = [
		        { "id" : "OID", "text": getMessageForKey("sdp.aesettings.unknownoid"),"dataCelltransformer":"constructUnknownTypeOIDCell"}, // No I18N
	            {"id" : "sysDescription","text":getMessageForKey("sdp.inventory.asset.routerinfo.sysDescr"),"width":"355px","dataCelltransformer":"constructSysDescriptionCell"},// No I18N
	            {"id" : "Identified_In","text":getMessageForKey("sdp.aesettings.unknownoidmachine"),"dataCelltransformer":"constructIdentifiedInCell"}// No I18N
	        ];
		}
		else{
			header = [
	            { "id" : "OID", "text": getMessageForKey("sdp.aesettings.unknownoid"),"dataCelltransformer":"constructUnknownTypeOIDCell"}, // No I18N
	            {"id" : "sysDescription","text":getMessageForKey("sdp.inventory.asset.routerinfo.sysDescr"),"width":"355px","dataCelltransformer":"constructSysDescriptionCell"},// No I18N
	            {"id" : "Identified_In","text":getMessageForKey("sdp.aesettings.unknownoidmachine"),"dataCelltransformer":"constructIdentifiedInCell"},// No I18N
	            {"id" : "Product_Type","headCellTransformer": snmpHeaderCellConstruct,"dataCelltransformer":"constructProductTypeCell"},// No I18N
	            {"id" : "Product","headCellTransformer":snmpHeaderCellConstruct,"dataCelltransformer":"constructProductCell"},// No I18N
	            {"id" : "Manufacturer","headCellTransformer":snmpHeaderCellConstruct,"dataCelltransformer":"constructManufacturerCell"}// No I18N
	        ];
		}
	}
	else{
	    header = [
            { "id" : "OID", "text": getMessageForKey("sdp.aesettings.unknownoid"),"dataCelltransformer":"constructUnknownTypeOIDCell"}, // No I18N
            {"id" : "sysDescription","text":getMessageForKey("sdp.inventory.asset.routerinfo.sysDescr"),"width":"355px","dataCelltransformer":"constructSysDescriptionCell"},// No I18N
            {"id" : "Identified_In","text":getMessageForKey("sdp.aesettings.unknownoidmachine"),"dataCelltransformer":"constructIdentifiedInCell"},// No I18N
            {"id" : "Product_Type","headCellTransformer": snmpHeaderCellConstruct,"dataCelltransformer":"constructProductTypeCell"},// No I18N
            {"id" : "Product","headCellTransformer":snmpHeaderCellConstruct,"dataCelltransformer":"constructProductCell"},// No I18N
            {"id" : "Manufacturer","headCellTransformer":snmpHeaderCellConstruct,"dataCelltransformer":"constructManufacturerCell"}// No I18N
        ];
	}
    return header;
}
function snmpHeaderCellConstruct(head_data){
  var key = ""; // No I18N
	if(head_data.id == "Product_Type"){ // No I18N
		key = "sdp.admin.product.listview.type"; // No I18N
	}else if(head_data.id == "Product"){ // No I18N
		key = "ae.cmdb.source.model"; // No I18N
	}else{
		key = "sdp.inventory.detailWS.manufacturer"; // No I18N
	}
	return '<span class="mandatory">*</span>'+' '+getMessageForKey(key); // No I18N
}
function constructUnknownTypeOIDCell(table_data)
{
	var row_data = table_data.row_data;
	if(row_data.oid.length > 25)
	{
		return "<span id='oid_"+row_data.id+"' title='"+encodeHTML(row_data.oid)+"'>"+encodeHTML(row_data.oid)+"</span>";
	}
	else
	{
		return "<span id='oid_"+row_data.id+"'>"+encodeHTML(row_data.oid)+"</span>";
	}
}

function constructSysDescriptionCell(table_data)
{
	var row_data = table_data.row_data;
	if(row_data.sysdescription ==null) {
		return "<span id='sysDescription_"+row_data.id+"'> - </span>";
	}
	if(row_data.sysdescription.length > 45)
	{
	   return "<span title='"+encodeHTML(row_data.sysdescription)+"' id='sysDescription_"+row_data.id+"'>"+encodeHTML(row_data.sysdescription)+"</span>";
	}
	else
	{
		   return "<span id='sysDescription_"+row_data.id+"'>"+encodeHTML(row_data.sysdescription)+"</span>";
	}
}

function constructIdentifiedInCell(table_data)
{
	var row_data = table_data.row_data;
	if(row_data.identified_in.length > 25)
	{
		return "<span id='IdentifiedIn_"+row_data.id+"' title='"+encodeHTML(row_data.identified_in)+"'>"+encodeHTML(row_data.identified_in)+"</span>";
	}
	else
	{
		return "<span id='IdentifiedIn_"+row_data.id+"'>"+encodeHTML(row_data.identified_in)+"</span>";
	}
}

function constructProductTypeCell(table_data)
{
	var row_data = table_data.row_data;
	unKnownTypeOID.push(row_data);
	return "<div class='disp-c'><input type='text' id='productType_"+row_data.id+"' style='width:145px'/></div>";
}

function constructProductCell(table_data)
{
	var row_data = table_data.row_data;
	let model = (row_data.model != undefined && row_data.model != null)? row_data.model : "";
	return "<div class='disp-c'><input type='text' id='product_"+row_data.id+"' value='"+encodeHTMLAttribute(model)+"' class='form-control' style='width:145px'/></div>";
}

function constructManufacturerCell(table_data)
{
	var row_data = table_data.row_data;
	return "<div class='disp-c'><input type='text' id='manufacturer_"+row_data.id+"' style='width:145px'/></div>";
}


//Snmp device List view
function loadSnmpDeviceListView()
{
	if(trim(jQuery('#snmp_device_identification_div').html()) == '')
	{
		jQuery('#manufacturer').append(jQuery("<option></option>").val("").text(getMessageForKey("sdp.software.license.listview.swmfg.filter")));
		snmpDevicesListView();
	}
}
var table_comp_obj2 = {};
function snmpDevicesListView(filterData)
{
	if(filterData != null)
	{
		if(!jQuery.isEmptyObject(filterData)){
			table_comp_obj2.t_obj.table_info.default_searchfields = filterData;
		}else{
			if(table_comp_obj2.t_obj.table_info.default_searchfields){
				delete table_comp_obj2.t_obj.table_info.default_searchfields;
			}
		}
		table_comp_obj2.changeFilterString('defaultSearch'); //NO I18N
	}
	else
    {
		var table_info = table_comp.getTableInfo("snmp_device_identification"); //No I18N
		var _self = this;
		var table_content = {};
        table_content.header = this.headerdataConstruct(table_info);
        setTimeout(function(){
            var options = {};
                options.paginationEnabled   = true;
                options.searchEnabled       = true;
                options.sortingEnabled      = true;
                options.multiDeleteEnabled  = true;
                options.personalize_key     = "snmp_device_identification"; //No I18N
                //options.callbackRowfunction = "cust_filter.rowdataConstruct";//No I18N
                options.row_inputdata       = _self.rowdataConstruct(table_info);
                options.callbackURL         = "snmp_device_identification"; // No I18N
                options.entity_name         = "snmp_device_identification"; // No I18N
                options.csrf_needed			=  true;
                options.isODAPI             =  true;
                table_comp_obj2 = new tableComponent(table_info,table_content,options);
        },1);
	}
}

function rowdataConstruct(table_info)
{
    var inputObject = {};
    var list_info = table_info.list_info;
        inputObject.list_info = list_info;
        return inputObject;
}
function headerdataConstruct(table_info)
{
    var _self = this;
	var remote;
	var header;
	var isRemote;
		sdpAjax({
		type: 'GET',//no i18n
		url: '/servlet/AJaxServlet?action=getIsRemoteServer',//no i18n
		async: false,
		success: function(resp)
		{
			remote = resp;
		}
	  });
	if( remote != undefined){
		isRemote = remote.IsRemote
		if(isRemote === 'true'){
			header = [
				{ "id" : "model", "text": getMessageForKey("ae.cmdb.source.model")}, // No I18N
				{"id" : "product_type","text":getMessageForKey("sdp.admin.product.addproduct.type")},// No I18N
				{"id" : "manufacturer","text":getMessageForKey("sdp.admin.product.addproduct.manufacturer")},// No I18N
				{"id" : "sysoid","text":getMessageForKey("sdp.admin.snmp.sys.oid"),"width":"230px"},// No I18N
				{"id" : "modeloid","text":getMessageForKey("sdp.admin.snmp.modeloid"),"width":"230px"}// No I18N
			];
		}
		else{
			header = [
				{ "id" : "snmp_device_identification_head_chk",type : "checkbox"}, // No I18N
				{ "id" : "model", "text": getMessageForKey("ae.cmdb.source.model"),"width":"230px","dataCelltransformer" : "constructModelCell"}, // No I18N
				{"id" : "product_type","text":getMessageForKey("sdp.admin.product.addproduct.type")},// No I18N
				{"id" : "manufacturer","text":getMessageForKey("sdp.admin.product.addproduct.manufacturer")},// No I18N
				{"id" : "sysoid","text":getMessageForKey("sdp.admin.snmp.sys.oid"),"width":"230px"},// No I18N
				{"id" : "modeloid","text":getMessageForKey("sdp.admin.snmp.modeloid"),"width":"230px"}// No I18N
			];
		}
	}
	else{
		header = [
            { "id" : "snmp_device_identification_head_chk",type : "checkbox"}, // No I18N
            { "id" : "model", "text": getMessageForKey("ae.cmdb.source.model"),"width":"230px","dataCelltransformer" : "constructModelCell"}, // No I18N
            {"id" : "product_type","text":getMessageForKey("sdp.admin.product.addproduct.type")},// No I18N
            {"id" : "manufacturer","text":getMessageForKey("sdp.admin.product.addproduct.manufacturer")},// No I18N
            {"id" : "sysoid","text":getMessageForKey("sdp.admin.snmp.sys.oid"),"width":"230px"},// No I18N
            {"id" : "modeloid","text":getMessageForKey("sdp.admin.snmp.modeloid"),"width":"230px"}// No I18N
        ];
	}

    return header;
}

function constructModelCell(table_data)
{
    var row_data = table_data.row_data;
    if(row_data.model.length > 25)
    {
    return "<div><a title='" + encodeHTML(row_data.model) + //NO I18N
           "' data-name='model' data-rowdata='" + encodeHTML( //NO I18N
               (typeof sdpToJSON != 'undefined') ? sdpToJSON(row_data) : JSON.stringify(row_data) //NO I18N
           ) + "' href='/'>" + encodeHTML(row_data.model) + "</a></div>"; //NO I18N
    }
    else
    {
    	return "<div><a data-name='model2' href='/' rel='noopener noreferrer' data-rowdata='" + //NO I18N
               encodeHTML((typeof sdpToJSON !== 'undefined') ? sdpToJSON(row_data) : JSON.stringify(row_data)) + //NO I18N
               "'>" + encodeHTML(row_data.model) + "</a></div>"; //NO I18N
    }
}

//Snmp InventoruOIDListView
var table_comp_obj1 = {};
function snmpInventoryOIDListView(filterJSON)
{
	if(trim(jQuery("#snmpinventoryoids_div").html()) === ""){
		var table_info = {},list_info={};
		    list_info.search_fields = filterJSON;
			if(!jQuery.isEmptyObject(list_info)) {
				table_info.list_info = list_info;
			}
	    var _self = this;
	    var table_content = {};
	        table_content.header = this.headerConstructForSnmpInventoryOIDList(table_info);
	        setTimeout(function(){
	            var options = {};
	            options.searchEnabled       = false;
	                options.sortingEnabled      = false;
	                options.row_inputdata       = _self.rowdataConstruct(table_info);
	                options.callbackURL         = "snmpinventorytype"; //No I18N
	                options.entity_name         = "snmpinventoryoids"; // No I18N
	                table_comp_obj1 = new tableComponent(table_info,table_content,options);
	        },1);
	}else{
			if(!jQuery.isEmptyObject(filterJSON)) {
				table_comp_obj1.t_obj.table_info.default_searchfields = filterJSON;
				table_comp_obj1.changeFilterString('defaultSearch'); //NO I18N
			}
	}
}

function headerConstructForSnmpInventoryOIDList(table_info)
{
    var _self = this;
	var remote;
	var header;
	var isRemote;
		sdpAjax({
		type: 'GET',//no i18n
		url: '/servlet/AJaxServlet?action=getIsRemoteServer',//no i18n
		async: false,
		success: function(resp)
		{
			remote = resp;
		}
	  });
	if( remote != undefined){
		isRemote = remote.IsRemote
		if(isRemote === 'true'){
			header = [
				{ "id" : "field", "text": getMessageForKey("sdp.requests.fieldFormRules.listview.fields")}, // No I18N
				{"id" : "oid","text":getMessageForKey("sdp.aesettings.unknownoid"), "dataCelltransformer" : "constructOIDCell"},// No I18N
				{"id" : "unit","text":getMessageForKey("sdp.admin.snmp.unit")},// No I18N
				{"id" : "data_type","text":getMessageForKey("ae.cmdb.cidetails.addInstanAttr.datatype")},// No I18N
				{"id" : "field_type","text":getMessageForKey("sdp.cmdb.addRelAtt.fieldType"), "dataCelltransformer" : "constructFieldTypeCell"},// No I18N
				{"id" : "oid_configured_for","text":getMessageForKey("sdp.admin.snmp.oid.configured.for"), "dataCelltransformer" : "constructOIDConfCell"}// No I18N
			];
		}
		else{
			header = [
				{ "id" : "field", "text": getMessageForKey("sdp.requests.fieldFormRules.listview.fields"),"dataCelltransformer" : "constructLEBELCell"}, // No I18N
				{"id" : "oid","text":getMessageForKey("sdp.aesettings.unknownoid"), "dataCelltransformer" : "constructOIDCell"},// No I18N
				{"id" : "unit","text":getMessageForKey("sdp.admin.snmp.unit")},// No I18N
				{"id" : "data_type","text":getMessageForKey("ae.cmdb.cidetails.addInstanAttr.datatype")},// No I18N
				{"id" : "field_type","text":getMessageForKey("sdp.cmdb.addRelAtt.fieldType"), "dataCelltransformer" : "constructFieldTypeCell"},// No I18N
				{"id" : "oid_configured_for","text":getMessageForKey("sdp.admin.snmp.oid.configured.for"), "dataCelltransformer" : "constructOIDConfCell"}// No I18N
			];
		}
	}
	else{
		header = [
            { "id" : "field", "text": getMessageForKey("sdp.requests.fieldFormRules.listview.fields"),"dataCelltransformer" : "constructLEBELCell"}, // No I18N
            {"id" : "oid","text":getMessageForKey("sdp.aesettings.unknownoid"), "dataCelltransformer" : "constructOIDCell"},// No I18N
            {"id" : "unit","text":getMessageForKey("sdp.admin.snmp.unit")},// No I18N
            {"id" : "data_type","text":getMessageForKey("ae.cmdb.cidetails.addInstanAttr.datatype")},// No I18N
            {"id" : "field_type","text":getMessageForKey("sdp.cmdb.addRelAtt.fieldType"), "dataCelltransformer" : "constructFieldTypeCell"},// No I18N
            {"id" : "oid_configured_for","text":getMessageForKey("sdp.admin.snmp.oid.configured.for"), "dataCelltransformer" : "constructOIDConfCell"}// No I18N
        ];
	}

    return header;
}

function constructLEBELCell(table_data)
{
    var row_data = table_data.row_data;

    if(row_data.field.length > 25)
	{
    	return "<div><a title='" + encodeHTML(row_data.field) + //NO I18N
               "' href='/' data-name='editoid' data-rowdata='" + //NO I18N
               encodeHTML(JSON.stringify(row_data)) + "'>" + //NO I18N
               encodeHTML(row_data.field) + "</a></div>"; //NO I18N
	}
	else
	{
		return "<div><a href='/' rel='noopener noreferrer' data-name='editoid2' data-rowdata='" + //NO I18N
               encodeHTML(JSON.stringify(row_data)) + "'>" + //NO I18N
               encodeHTML(row_data.field) + "</a></div>"; //NO I18N
	}
}

function constructOIDCell(table_data)
{
	var row_data = table_data.row_data;
	if(row_data.oid == null)
	{
	   return "-";
	}
	return "<div><span title='"+encodeHTML(row_data.oid)+"'>"+encodeHTML(row_data.oid)+"</span></div>";
}

function constructFieldTypeCell(table_data)
{
	var row_data = table_data.row_data;
	if(row_data.field_type.length > 25)
	{
	    return "<div><span title='"+encodeHTML(row_data.field_type)+"'>"+encodeHTML(row_data.field_type)+"</span></div>";
	}
	else
	{
	    return encodeHTML(row_data.field_type);
	}
}

function constructOIDConfCell(table_data)
{
	var row_data = table_data.row_data;
	if("oid_configured_for" in row_data && row_data.oid_configured_for.length > 25)
	{
	    return "<div><span title='"+encodeHTML(row_data.oid_configured_for)+"'>"+encodeHTML(row_data.oid_configured_for)+"</span></div>";
	}
	else if("oid_configured_for" in row_data)
	{
	    return encodeHTML(row_data.oid_configured_for);
	}
	else
	{
	    return "-";
	}
}

function validateNewSNMPModelForm()
{
	if(jQuery('#addNewModel').is(":visible"))
	{
		var url = '/api/v3/snmp_device_identification';   //NO I18N
 		var type = 'POST';                     //NO I18N
		var oidTypeId = jQuery('#oidTypeID').val();
		if(trim(oidTypeId) != "")
	    {
		   	url = url+"/"+oidTypeId; //NO I18N
		   	type = 'PUT';              //NO I18N
		}
		var snmpModel = jQuery('#snmpModel').val();
	    if(trim(snmpModel) == '')
	    {
	        alert(getMessageForKey("sdp.admin.snmp.please.provide.snmp.model"));
	        jQuery('#snmpModel').trigger('focus');
	        return false;
	    }

	    var productType = jQuery('#addSNMPModel_productType').val();
	    if(trim(productType) == '')
	    {
	    	alert(getMessageForKey("sdp.admin.snmp.please.choose.producttype"));
	        jQuery('#addSNMPModel_productType').select2('open');  //NO I18N
	        return false;
	    }
	    var productTypeName = jQuery('#addSNMPModel_productType').select2('data').text;        //NO I18N

	    var manufacturer = jQuery('#addSNMPModel_manufacturer').val();
	    if(trim(manufacturer) == '')
	    {
	    	alert(getMessageForKey("sdp.admin.snmp.please.select.manufacturer"));
	        jQuery('#addSNMPModel_manufacturer').select2('open');   //NO I18N
	        return false;
	    }
	    var manufacturerName = jQuery('#addSNMPModel_manufacturer').select2('data').text;         //NO I18N

	    var sysOID = jQuery('#sysOID').val();
	    if(trim(sysOID) == '')
	    {
	        alert(getMessageForKey("sdp.admin.snmp.please.provide.snmp.oid"));
	        jQuery('#sysOID').trigger('focus');
	        return false;
	    }
	    var modeloid = trim(jQuery('#modeloid').val());

	    var snmpModelJSON = {"model":snmpModel,"product_type":{"id":productType,"name":productTypeName},"manufacturer":{"id":manufacturer,"name":manufacturerName},"sysoid":sysOID, "modeloid":modeloid};//No I18N
	    var updateJSON = {"snmp_device_identification":snmpModelJSON};       //NO I18N
	    sdpAjax({
     		 url : url,
     		 data : 'input_data='+encodeURIComponent( (typeof sdpToJSON != 'undefined') ? sdpToJSON(updateJSON) : JSON.stringify(updateJSON) )+"&"+getCSRFParamName()+"="+getCSRFParamValue(),  //NO I18N
     		 type : type,
     		 dataType : 'json', //NO I18N
     		 success: function(data)
     		 {
     			 if(data.response_status.status == 'success')
     			 {
     				 showalert('success',data.response_status.messages[0].message,'isAutoHide=true,delay=3,width=400') //NO I18N
     				 closeDialog();
     				//jQuery('#productType').select2('data',{"id":"-1","text":'--'+getMessageForKey("sdp.admin.snmp.all.producttype")+'--'},true); //No I18N
     				//jQuery('#manufacturer').select2('data',{"id":"-1","text":'--'+getMessageForKey("sdp.software.license.listview.swmfg.filter")+'--'},true); //No I18N
     				 changeListViewData();
     			 }
     			 else
     			 {
     				 showalert('failure',data.response_status.messages[0].message,'isAutoHide=false,delay=3,width=400') //NO I18N
     			 }
     		 },
	         error:function(data)
	      	 {
	      		var errorMsg = jQuery.parseJSON(data.responseText).response_status.messages[0].message;
	      		var field = jQuery.parseJSON(data.responseText).response_status.messages[0].field;
	      		if(field == 'model')
	      		{
	      			field = getMessageForKey("ae.cmdb.source.model");	//NO I18N
	      		}
	      		else if(field == 'sysoid')
	      		{
	      			field = getMessageForKey("sdp.admin.snmp.sys.oid");	//NO I18N
	      		}
	      		errorMsg = errorMsg+'. [ '+field+' ] ';
	    	  	showalert('failure',errorMsg,'isAutoHide=false,delay=3,width=400');	//NO I18N
	      	 }
     	    });
	    return true;
	}
	else if(jQuery('#addNewManufacturer').is(":visible"))
	{
		var toReturn = addNetworkDeviceManufacturer('addSNMPModel_manufacturer');      //NO I18N
		if(toReturn)
		{
			jQuery('#backviewManu').trigger('click');
		}
	}
	else if(jQuery('#addNewproductType').is(":visible"))
	{
	    addNewProductType();
	}

}

function handleAddedAttribute(data,fieldType)
{
	 var value = {};
	 jQuery('.setparametertab').addClass('hide');
	 value.field = data.API.response.operation.Details.records.success[1].attribute.content;
	 value.attribute_id = data.API.response.operation.Details.records.success[1].attribute.id;
	 value.field_type = getMessageForKey("sdp.admin.snmp.ci.attribute");
	 jQuery('#AttributeList').append(jQuery("<option></option>").val((typeof sdpToJSON != 'undefined') ? sdpToJSON(value) : JSON.stringify(value) ).text(value.field));
	 jQuery('#AttributeList').select2('data',{"id": (typeof sdpToJSON != 'undefined') ? sdpToJSON(value) : JSON.stringify(value) ,"text":value.field},true); //NO I18N
	 jQuery('#attribute').val('');
	 jQuery('#attr_description').val('');
	 changeSNMPInvOIDListView();
}


function addNewCIAttribute()
{
	var attributeName = jQuery('#attribute').val();
	if(trim(attributeName) == '')
    {
	    alert(getMessageForKey("ae.cmdb.admin.citype.addattribute.mandatory"));
	    return false;
	}

	var fieldType = jQuery('#fieldType').val();
	if(trim(fieldType) == '')
    {
	    alert(getMessageForKey("sdp.admin.snmp.attribute.select.field.type"));
	    return false;
	}

	var productTypeSelect2 = jQuery('#Inv_productType').select2('data'); //No I18N
	var data = '<?xml version="1.0" encoding="UTF-8"?><API version="1.0" locale="en"><addattribute><tocitype>'+encodeURIComponent(productTypeSelect2.text)+'</tocitype><attributes><attribute><parameter><name>Attribute Name</name><value>'+encodeURIComponent(attributeName)+'</value></parameter>'; //NO I18N
	if(trim(jQuery('#attr_description').val()) != '')
	{
	   data = data+'<parameter><name>Description</name><value>'+encodeURIComponent(jQuery('#attr_description').val())+'</value></parameter>';  //NO I18N
	}
	data = data+'<parameter><name>Type</name><value>'+fieldType+'</value></parameter></attribute></attributes></addattribute></API>';  //NO I18N

	sdpAjax({
		async: false,
		url:"/api/cmdb/citypeattributes", //NO I18N
		type: "POST", //NO I18N
		data : 'OPERATION_NAME=add&ENTITY_NAME=citypeattributes&INPUT_DATA='+data,  //NO I18N
		dataType: "json", //NO I18N
		success:function(data){
			if(data.API.response.operation.result.status == 'Success')
			{
			   showalert('success',data.API.response.operation.result.message,'isAutoHide=true,delay=3,width=400'); //NO I18N
			   handleAddedAttribute(data,fieldType);
			}
			else
			{
			    showalert('failure',data.API.response.operation.result.message,'isAutoHide=false,delay=3,width=400');	//NO I18N
			}
		}
	});

	return true;
}

var snmpCallBack = {
	initsnmpTooltip : function(){	// Issue Fix - SD-78665,SD-107227
		initTooltip(".mibtab"); 	//NO I18N
		jQuery("#dialog_closeButton, #digCloseBtn").attr("onclick","closeDialog(snmpCallBack.closeCallBack)");	//NO I18N
	},
	closeCallBack : function(){
		jQuery("#exorcol>span").removeClass("vshow");	//NO I18N
	}
}

function loadSnmpScheduletime(){
	sdpAjax({
		type: 'GET',//no i18n
		ignorefailuremessage: true,
		url: '/servlet/AJaxServlet',//no i18n
		data: 'action=getScheduleDetailsForSNMPDataSync', //No I18N
		success: function(resp) {
			if(resp.last_schedule_time){
                jQuery("#snmpPrevScheduleValue").html(encodeHTML(resp.last_schedule_time));
                if(resp.snmp_sync_status == '1'){
                	jQuery("#snmpProgress").removeClass("hide");
                }
                else{
                    jQuery("#snmpSuccess").removeClass("hide");
                }
            }
            else{
                jQuery("#snmpPrevScheduleValue").html(' --');
                if(resp.snmp_sync_status == '1'){
                    jQuery("#snmpProgress").removeClass("hide");
                }
                else{
                jQuery("#snmpNotInitiated").removeClass("hide");
                }
            }
            jQuery("#snmpNextScheduleValue").html(encodeHTML(resp.next_schedule_time));
	}
	});
}
function syncSNMPData(){
	hideStatus();
	jQuery("#snmpProgress").removeClass("hide");
	sdpAjax({
		type: 'GET',//no i18n
		ignorefailuremessage: true,
		url: '/servlet/AJaxServlet',//no i18n
		data: 'action=syncSNMPData', //No I18N
		success: function(resp) {
			if(resp.central_server_unreachable){
                showalert("failure", getMessageForKey('remote.general.alert'), "isAutoHide=true");//NO I18N
                jQuery("#snmpProgress").addClass("hide");
                jQuery("#snmpFailed").removeClass("hide");
		    }
		    else{
                jQuery("#snmpProgress").addClass("hide");
                jQuery("#snmpSuccess").removeClass("hide");
                jQuery("#snmpPrevScheduleValue").html(encodeHTML(resp.last_schedule_time));
			}
		}
	});

}
function hideStatus(){
	if(!jQuery("#snmpSuccess").hasClass("hide")){
		jQuery("#snmpSuccess").addClass("hide");
	}
	else{
		jQuery("#snmpFailed").addClass("hide");
	}
	if(!jQuery("#snmpNotInitiated").hasClass("hide")){
		jQuery("#snmpNotInitiated").addClass("hide");
	}

}
