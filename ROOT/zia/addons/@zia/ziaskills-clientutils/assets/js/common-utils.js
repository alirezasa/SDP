if(typeof ziapf.hasUtilsLoaded === "undefined"){
	if(typeof ziapf === "undefined"){
		var ziapf = {};
	}

	if(typeof ziaframework === "undefined"){
		var ziaframework = {};
	}
	ziapf.hasUtilsLoaded = true;

	ziapf.getCSRFToken = function(){ //both
	    var values = document.cookie.split(";");
	    for(var i=0;i<values.length;i++)
	    {
	        if(values[i].includes("ziacsr"))
	        {
	            var csrfToken = "ziacsrfparam="+values[i].trim().substring(7,values[i].length);
	            return csrfToken;
	        }
	    }
	}

	ziapf.deBounce = function(callback,delay){ //both
		var debounceTimeOut;
		return function(){
			let args = arguments;
			clearTimeout(debounceTimeOut);
			debounceTimeOut = setTimeout(function(){
				callback.apply(this,args);
			}.bind(this),delay);
		}
	}

	ziaframework.mergeData = function(parent,data,exclude = []){ //both
		if(data && Object.keys(data).length){
			for(var prop in data){
				if(!exclude.includes(prop)){
					ziapf[parent][prop]=data[prop];
				}
			}
		}
		else{
			ziapf[parent]={};
		}
	}

	ziapf.url_templates.get_image_url=function (){ //both
		return this.image_url+"file?ID="+arguments[0]+"&height=30&width=30"; //NO I18N
	}

	ziapf.url_templates.get_static_image_url=function (){ //both
	    let relativePath = arguments[0];
        if(ziapf.url_templates.fingerprints[relativePath]) {
            relativePath = ziapf.url_templates.fingerprints[relativePath];
        }
        return this.img_static_url+relativePath;
	}

	ziapf.url_templates.get_dre_url=function (){ //both
		return this.dre_url+arguments[0];
	}

	ziapf.url_templates.get_portal_url=function (){ //both
		return this.portal_base_url.replace('{portalid}',arguments[0]);
	}

	ziapf.url_templates.get_download_url=function (requestData){ //both
		var featureName = requestData.featureName, fileId = requestData.fileId, cliMsg = requestData.cliMsg;
		var params = {}, url, staticUrls = ziapf.url_templates;
		params["x-service"] = ziapf.service_details.upload_download_service; //NO I18N
	    if(Object.keys(ziapf.current_user).length > 0){
	        params["event-id"] = featureName + "-" + fileId + "-" + ziapf.portalid;  //NO I18N
	        url = staticUrls.download_url + "/webdownload"; //NO I18N
	    } else {
	        params["event-id"] = featureName + "-" + fileId;  //NO I18N
	        url = staticUrls.public_download_url + "/public";  //NO I18N
	    }
	    if(cliMsg && Objects.keys(cliMsg).length > 0){
	        params["x-cli-msg"] = btoa(cliMsg); //NO I18N
	    }
	    Object.keys(params).forEach(function(key,i){
	        if(i == 0)	{
	            url += '?'+key+'='+encodeURIComponent(params[key]);
	        } else {
	            url += '&'+key+'='+encodeURIComponent(params[key]);
	        }
	    });
		return url;
	}

	if(typeof ziapf.json === "undefined"){
		ziapf.json={}
	}

	ziapf.json.deepCopy=function(object){ //both
		if (Object.prototype.toString.call(object) === '[object Array]'){
			var clone = [];
			for (var i=0; i<object.length; i++){
				clone[i] = ziapf.json.deepCopy(object[i]);
			}
			return clone;
		}
		else if (typeof(object)=="object"){
			var clone = {};
			for (var prop in object){
				if (object.hasOwnProperty(prop)){
					clone[prop] = ziapf.json.deepCopy(object[prop]);
				}
			}
			return clone;
		}
		else{
			return object;
		}
	}

	ziapf.prependResourceURL = function() { //both
		var resources = arguments[0];
		if( typeof resources === "undefined" )
		{
			return resources;
		}
		else
		{
			var returnURLs = [];
			for ( var index in resources )
			{
				if(!resources.hasOwnProperty(index)){
					continue;                        
				}
				var resource = resources[index];
				if(ziapf.url_templates.fingerprints[resource]) {
				    resource = ziapf.url_templates.fingerprints[resource];
				}
				if( ! resource.startsWith("//") )
				{
					if( resource.endsWith("js") )
					{
						resource = ziapf.url_templates.js_static_url+resource;
					}
					else if ( resource.endsWith("css") )
					{
						resource = ziapf.url_templates.css_static_url+resource;
					}
				}
				returnURLs.push(resource);

			}
			return returnURLs;
		}
	}

	HTMLElement.prototype.ziaShow = function () { //both
		this.style.display='inherit';
	}

	HTMLElement.prototype.ziaHide = function () { //both
		this.style.display='none';
	}

	ziapf.datetime={};

	ziapf.datetime.findMonth=function(monthName,format){ //both
		switch(format){
			case 'full':
				switch(monthName){
					case 'Jan': return ziapf.I18n.translateWithKey('zia.months.jan');
					case 'Feb': return ziapf.I18n.translateWithKey('zia.months.feb');
					case 'Mar': return ziapf.I18n.translateWithKey('zia.months.mar');
					case 'Apr': return ziapf.I18n.translateWithKey('zia.months.apr');
					case 'May': return ziapf.I18n.translateWithKey('zia.months.may');
					case 'Jun': return ziapf.I18n.translateWithKey('zia.months.jun');
					case 'Jul': return ziapf.I18n.translateWithKey('zia.months.jul');
					case 'Aug': return ziapf.I18n.translateWithKey('zia.months.aug');
					case 'Sep': return ziapf.I18n.translateWithKey('zia.months.sep');
					case 'Oct': return ziapf.I18n.translateWithKey('zia.months.oct');
					case 'Nov': return ziapf.I18n.translateWithKey('zia.months.nov');
					case 'Dec': return ziapf.I18n.translateWithKey('zia.months.dec');
				}
			break;
			case 'number':
				switch(monthName){
					case 'Jan': return '01';
					case 'Feb': return '02';
					case 'Mar': return '03';
					case 'Apr': return '04';
					case 'May': return '05';
					case 'Jun': return '06';
					case 'Jul': return '07';
					case 'Aug': return '08';
					case 'Sep': return '09';
					case 'Oct': return '10';
					case 'Nov': return '11';
					case 'Dec': return '12';
				}
			break;
			case 'month':
	            switch(monthName){
	                case 1 : return ziapf.I18n.translateWithKey('Jan');
	                case 2 : return ziapf.I18n.translateWithKey('Feb');
	                case 3 : return ziapf.I18n.translateWithKey('Mar');
	                case 4 : return ziapf.I18n.translateWithKey('Apr');
	                case 5 : return ziapf.I18n.translateWithKey('May');
	                case 6 : return ziapf.I18n.translateWithKey('Jun');
	                case 7 : return ziapf.I18n.translateWithKey('Jul');
	                case 8 : return ziapf.I18n.translateWithKey('Aug');
	                case 9 : return ziapf.I18n.translateWithKey('Sep');
	                case 10 : return ziapf.I18n.translateWithKey('Oct');
	                case 11 : return ziapf.I18n.translateWithKey('Nov');
	                case 12 : return ziapf.I18n.translateWithKey('Dec');
	            }
	        break;
		}
	}

	ziapf.datetime.findDay = function(day){ //both
	    switch(day){
	        case "Sun": return 0;
	        case "Mon": return 1;
	        case "Tue": return 2;
	        case "Wed": return 3;
	        case "Thu": return 4;
	        case "Fri": return 5;
	        case "Sat": return 6;
	    }
	}

	ziapf.datetime.convertDate = function(dateModifier){ //both
	    var dateNow = Date.now();
	    var dateObject = ziapf.datetime.getTimeObject(dateNow);
	    switch(dateModifier){
	        case "thisWeekStart":
	            var day = ziapf.datetime.findDay(dateObject.day);
	            dateObject = ziapf.datetime.getTimeObject(dateNow - (day * 24 * 3600 * 1000));
	            return ziapf.I18n.translateWithKey("zia.months."+dateObject.month.toLowerCase())+" "+ dateObject.date +", "+dateObject.year; //NO I18N
	        case "lastWeekStart":
	            var day = ziapf.datetime.findDay(dateObject.day) + 7;
	            dateObject = ziapf.datetime.getTimeObject(dateNow - (day * 24 * 3600 * 1000));
	            return ziapf.I18n.translateWithKey("zia.months."+dateObject.month.toLowerCase())+" "+ dateObject.date +", "+dateObject.year; //NO I18N
	        case "lastWeekEnd":
	            var day = ziapf.datetime.findDay(dateObject.day) + 1;
	            dateObject = ziapf.datetime.getTimeObject(dateNow - (day * 24 * 3600 * 1000));
	            return ziapf.I18n.translateWithKey("zia.months."+dateObject.month.toLowerCase())+" "+ dateObject.date +", "+dateObject.year; //NO I18N
	        case "thisMonthStart":
	            return ziapf.I18n.translateWithKey("zia.months."+dateObject.month.toLowerCase())+" 01, "+dateObject.year; //NO I18N
	        case "lastMonthStart":
	            var monthNumber = ziapf.datetime.findMonth(dateObject.month, "number"); //NO I18N
	            dateObject = ziapf.datetime.getTimeObject(new Date(dateObject.year, monthNumber - 1, 0));
				return ziapf.I18n.translateWithKey("zia.months."+dateObject.month.toLowerCase())+" 01, "+dateObject.year; //NO I18N
	        case "lastMonthEnd":
	            var monthNumber = ziapf.datetime.findMonth(dateObject.month, "number"); //NO I18N
	            dateObject = ziapf.datetime.getTimeObject(new Date(dateObject.year, monthNumber - 1, 0));
	            return ziapf.I18n.translateWithKey("zia.months."+dateObject.month.toLowerCase())+" "+ dateObject.date +", "+dateObject.year; //NO I18N
	        case "lastQuarterStart":
	            var monthNumber = ziapf.datetime.findMonth(dateObject.month, "number") - 2; //NO I18N
	            var year = dateObject.year;
	            if(!monthNumber) {
	                monthNumber = 0;
	            }
	            if(monthNumber <= 0) {
	                monthNumber += 12;
	                year -= 1;
	            }
	            var month = ziapf.datetime.findMonth(monthNumber, "month"); //NO I18N
	            return ziapf.I18n.translateWithKey("zia.months."+month.toLowerCase())+" 01, "+ year; //NO I18N
	        case "lastHalfStart":
	            var monthNumber = ziapf.datetime.findMonth(dateObject.month, "number") - 5; //NO I18N
	            var year = dateObject.year;
	            if(!monthNumber) {
	                monthNumber = 0;
	            }
	            if(monthNumber <= 0) {
	                monthNumber += 12;
	                year -= 1;
	            }
	            var month = ziapf.datetime.findMonth(monthNumber, "month"); //NO I18N
	            return ziapf.I18n.translateWithKey("zia.months."+month.toLowerCase())+" 01, "+ year; //NO I18N
	        case "thisYearStart":
	            var month = ziapf.datetime.findMonth(1, "month"); //NO I18N
	            return ziapf.I18n.translateWithKey("zia.months."+month.toLowerCase())+" 01, "+dateObject.year; //NO I18N
	        case "lastYearStart":
	            var month = ziapf.datetime.findMonth(1, "month"); //NO I18N
	            return ziapf.I18n.translateWithKey("zia.months."+month.toLowerCase())+" 01, "+ (dateObject.year - 1); //NO I18N
	        case "lastYearEnd":
	            var month = ziapf.datetime.findMonth(12, "month"); //NO I18N
	            return ziapf.I18n.translateWithKey("zia.months."+month.toLowerCase())+" 31, "+ (dateObject.year - 1); //NO I18N
	    }
	    return ziapf.I18n.translateWithKey("zia.months."+dateObject.month.toLowerCase())+" "+ dateObject.date +", "+dateObject.year; //NO I18N
	}

	ziapf.datetime.converTime = function(time){ //both
		if(time){
			time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
			if(time.length>1){
				time = time.slice(1);
				time[5] = +time[0] < 12 ? ' AM' : ' PM';
				time[0] = +time[0] % 12 || 12;
				if(time[0] < 10){
					time[0] = "0"+time[0];
				}
			}
			return time.join('');
		}
		return time;
	}

	ziapf.datetime.getTimeObject = function(timeStamp){ //both
		var newDate = (new Date(Number(timeStamp)));
	    var splitUps=newDate.toString().split(" ");
		var dateStamp={
			day:splitUps[0],
			month:splitUps[1],
			date:splitUps[2],
			year:splitUps[3],
			time:splitUps[4],
			timeZone:splitUps[5]+splitUps[6]
		}
		return dateStamp;
	}

	ziapf.timeouts={}; //both

	if(typeof ziaframework === "undefined"){ //both
		var ziaframework={};
	}

	ziaframework.toJSON=function(input) { //both
		return JSON.parse(JSON.stringify(input));
	}

	if(typeof ziapf.onkeyupStack === "undefined"){ //both
		ziapf.onkeyupStack={};
	}


	ziapf.onkeyup = function(e){ //both
		for(var funcName in ziapf.onkeyupStack){
			ziapf.onkeyupStack[funcName](e);
		}
	}
	window.addEventListener("keyup",ziapf.onkeyup,true); //both

	if(typeof ziapf.onresizeStack === "undefined"){ //both
		ziapf.onresizeStack={};
	}


	ziapf.onresize = function(e){ //both
		for(var funcName in ziapf.onresizeStack){
			ziapf.onresizeStack[funcName](e);
		}
	}
	window.addEventListener("resize",ziapf.onresize,true); //both

	if(typeof ziapf.onScrollStack === "undefined"){ //both
		ziapf.onScrollStack={};
	}

	ziapf.onscroll = function(e){ //both
		for(var funcName in ziapf.onScrollStack){
			ziapf.onScrollStack[funcName](e);
		}
	}

	window.addEventListener("scroll",ziapf.onscroll,true); //both

	ziapf.CJS = (function(){ //both
		return{
			execScript : function(src, onLoad, poolName) {
				// single function that works with onload and onreadystatechange
				var func = function() {
					if ( this.readyState && this.readyState != "complete" && this.readyState != "loaded" ) {
						return; 
					}
					this.onload = this.onreadystatechange = null; // ensure callback is only called once
					if(onLoad){
						onLoad(poolName);
					}
				};

				// Add a SCRIPT element pointing to the (already cached) src so the JS gets executed.
				var se;
				if(src.endsWith("js")){
					se = document.createElement('script');
					se.src = src;
				}
				else if(src.endsWith("css")){
					se = document.createElement('link');	
					se.rel="stylesheet";
					se.href = src;
				}
				se.onload = se.onreadystatechange = func;  // set this BEFORE setting .src
				var s1 = document.querySelector('head'); //NO I18N
				s1.appendChild(se, s1);
			}
		};	
	})();

	if(typeof ziaframework === "undefined"){ //both
		ziaframework={};
	}

	ziaframework.requestPools={}; //both

	ziaframework.ziaRequestPool=function(poolName) { //both
		this.poolName=poolName;
		this.pendingRequests = 0;
		this.requestURLs=[];
		this.status="adding"; //NO I18N
	    this.addRequest=function(toRequest){
	    	if(this.status=="adding"){ //NO I18N
	    		if(typeof toRequest === "object"){
	    			for(var i=0;i<toRequest.length;i++){
		    			this.requestURLs.push(toRequest[i]);
			    		this.pendingRequests++;	
	    			}
	    		}
	    		else{
		    		this.requestURLs.push(toRequest);
		    		this.pendingRequests++;
		    	}
	    	}
	    }
	    this.processRequests = function(argument) {
	    	this.status="processing"; //NO I18N
	    	if(this.requestURLs.length){
				for(var i=0;i<this.requestURLs.length;i++){
					var thisURL=this.requestURLs[i];
					ziapf.CJS.execScript(thisURL,this.fakeCallback,this.poolName);
				}
			}
			else{
				var poolName=this.poolName;
				ziaframework.requestPools[poolName].pendingRequests=1;
				this.fakeCallback(this.poolName);
			}
	    }
	    this.fakeCallback = function(poolName){
	    	ziaframework.requestPools[poolName].pendingRequests--;
	    	if(ziaframework.requestPools[poolName].pendingRequests==0){
	    		if(ziaframework.requestPools[poolName].callback){
	    			ziaframework.requestPools[poolName].callback();
	    		}
	    		delete ziaframework.requestPools[poolName];
	    	}
	    }
	}

	ziapf.deBounce = function(callback,delay){ //both
		var debounceTimeOut;
		return function(){
			let args = arguments;
			clearTimeout(debounceTimeOut);
			debounceTimeOut = setTimeout(function(){
				callback.apply(this,args);
			}.bind(this),delay);
		}
	}

	ziaframework.chat_urlRegExp = /(\[.*?\]\(((ht|f)tp(s?):\/\/[0-9a-zA-Z][-.\w]*(:[0-9])*(\/?)([a-zA-Z0-9\-.?,:'/\\+=&%$#_[\]@!()*;~]*)\))|((ht|f)tp(s?):\/\/[0-9a-zA-Z][-.\w]*(:[0-9])*(\/?)([a-zA-Z0-9\-.?,:'/\\+=&%$#_[\]@!()*;~]*)?))/i; //NO I18N
	ziaframework.chat_urlRegExp_match = /(\[.*?\]\(((ht|f)tp(s?):\/\/[0-9a-zA-Z][-.\w]*(:[0-9])*(\/?)([a-zA-Z0-9\-.?,:'/\\+=&%$#_[\]@!()*;~]*)\))|((ht|f)tp(s?):\/\/[0-9a-zA-Z][-.\w]*(:[0-9])*(\/?)([a-zA-Z0-9\-.?,:'/\\+=&%$#_[\]@!()*;~]*)?))/g; //NO I18N
	ziaframework.dataUrl = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i; //NO I18N
}