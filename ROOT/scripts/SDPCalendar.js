//$Id$
var monthName = new Array("sdp.month.jan","sdp.month.feb","sdp.month.mar","sdp.month.apr","sdp.month.may","sdp.month.jun","sdp.month.jul","sdp.month.aug","sdp.month.sep","sdp.month.oct","sdp.month.nov","sdp.month.dec");//No i18N
var noOfDays = new Array(31,28,31,30,31,30,31,31,30,31,30,31);
var dayName = new Array("sdp.days.sun","sdp.days.mon","sdp.days.tue","sdp.days.wed","sdp.days.thu","sdp.days.fri","sdp.days.sat"); // No I18N

function plotChange(changeId, module,prev,next){//Add module check
var monthVar=currentMonth;
	

    var changeObj = document.getElementById(changeId);
    var sd = parseInt(changeObj.getAttribute('startDate'));
    var ed = parseInt(changeObj.getAttribute('endDate'));
    var sm = parseInt(changeObj.getAttribute('startMonth'));
    var em = parseInt(changeObj.getAttribute('endMonth'));
    var sy = parseInt(changeObj.getAttribute('startYear'));
    var ey = parseInt(changeObj.getAttribute('endYear'));
    var color = changeObj.getAttribute('color');
    var url = "/calendar/ElementDetails.jsp?module=" + module + "&elementId=" + changeObj.getAttribute("elementId") + "&" + new Date().getTime(); // No I18N
    var title = "<div style='float:left;height:14px;line-height:12px;color:#ffffff;font:11px bold;' id='StripStart'><span class='leftcurve'>&nbsp;</span></div><div style='float:right;height:14px;line-height:12px;color:#ffffff;font:11px bold;' id='StripEnd'><span class='rightcurve'>&nbsp;</span></div>"; // No I18N

    if(parent.sdp_user.DIRECTION != null && parent.sdp_user.DIRECTION == "RTL") {
        title = "<div style='float:right;height:14px;line-height:12px;color:#ffffff;font:11px bold;' id='StripStart'><span class='rightcurve'>&nbsp;</span></div><div style='float:left;height:14px;line-height:12px;color:#ffffff;font:11px bold;' id='StripEnd'><span class='leftcurve'>&nbsp;</span></div>"; // No I18N
    }

var yearVar=year;
    if(prev)
    {
    	monthVar-=1;
    	if(monthVar<0)
    	{
    		monthVar=11;
    		yearVar--;
    	}
        if(em!=monthVar || ey!=yearVar)
        { ed = noOfDays[monthVar];}


    }
    else if(next)
    {
      	if(monthVar==11)
    	{
    		yearVar++;
    	}
    	monthVar=(monthVar+1)%12;
        if(sm!=monthVar || sy!=yearVar)
        { sd = 1;}
        
    }
    if((sm>monthVar && sy>=yearVar) || (em<monthVar && ey<=yearVar) ||sy>yearVar || ey< yearVar)
    {//when it starts in future or ends in past
    	if(!prev && !next)
    	{
    		plotChange(changeId, module,true,false);
    		plotChange(changeId, module,false,true);
    	} 	
    	
    	return;}

    title = title.concat("<a class='changeLink' href='/' rel='noopener noreferrer' data-url='"+url); // No I18N

    title = title.concat("'>" + changeObj.innerHTML + "</a>"); // No I18N
    // If the date start on one month and end on another month, then the isStartAdjusted and isEndAdjusted will be set and dates will be modified as required.
    // IMPORTANT: There might be a problem here since Feb is hardcoded to have 28 days.
    var isStartAdjusted = false;
    var isEndAdjusted = false;
    if(ey > yearVar) {
        ed = noOfDays[monthVar];
        isEndAdjusted = true;
    }

    if(sy < yearVar) {
        isStartAdjusted = true;
        sd = 1;
    }

    if(em > monthVar) {
        ed = noOfDays[monthVar];
        isEndAdjusted = true;
    }
    if(sm < monthVar) {
        isStartAdjusted = true;
        sd = 1;
    }
    

    
    
    // barObj is the div object that is created to represent a change in a week stri
    var barObj = null;
    // Indicates whether the change can be shown as a strip or hidden[occurs when the particular date has more than 3 strips already visible]
    var display = false;

    // The Key will be of format M<month>D<date>
    // The dayObject represented by the key will have the following attributes.
    // week - indicates the week status.Possible values are middle, start and end.
    // items - the list of ids, that occur in that day. This will be a comma separated list.
    for(var days=sd; days<=ed; days++) {
        var key = "M" + monthVar + "D" + days; // No I18N
        var dayObj = document.getElementById(key);
        if(!dayObj)
        continue;	
        var weekStatus = dayObj.getAttribute("week");
        var items = dayObj.getAttribute("items");
        if(items == null) {
            items = changeId;
        }
        else {
            items = items + "," + changeId; // No I18N
        }
        dayObj.setAttribute("items", items); // No I18N
        var isAvailable = checkAvailability(barObj,  dayObj);
        // Now starts the headache. This is where all the strips are constructed based on a series of if checks. A lot of scenario's have been handled here. Therefore be very careful when doing a CRUD operation in the code that follows. You have already been warned.
        if(days == sd) {
            barObj = constructMainDiv(dayObj, title, color);
            display = checkDisplayStatus(barObj, dayObj);
            // Only, when the display is true, the created obj should be added to the body, else a count should be added to the More list.
            if(display) {
                document.body.appendChild(barObj);
                if(isStartAdjusted) {
                    var elements = barObj.getElementsByTagName("div");
                    for(var cc=0; cc<elements.length; cc++) {
                        if(elements[cc].id == "StripStart") {
                            elements[cc].innerHTML = "<b><</b> &nbsp;"; // No I18N
                        }
                    }
                }
            }
            else {
                addElementToMore(monthVar, days, dayObj, module);
            }
        }
        else if(days == ed && weekStatus != "start") {
        //issue has occured due to the barObj not available and we are trying to access the same. Hence checking if isAvailable attribute(if more than 3 changes are present in a day, isavailable will be false) and skipping this part and adding + more attribute if more than 3 changes are present.
        if(isAvailable){
            setDisplayStatus(dayObj, barObj);
            barObj.style.width = parseInt(barObj.style.width) + parseInt(dayObj.offsetWidth) - 2+"px";
            // Required when the page is viewed in RTL (Arabic). The bar needs to be pushed to the left for every passing day. So subtracting the day's width from the left position
            if(parent.sdp_user.DIRECTION != null && parent.sdp_user.DIRECTION == "RTL") {
                barObj.style.left = parseInt(barObj.style.left) - dayObj.offsetWidth +"px";
            }
            if(isEndAdjusted) {
                var elements = barObj.getElementsByTagName("div");
                for(var cc=0; cc<elements.length; cc++) {
                    if(elements[cc].id == "StripEnd") {
                        elements[cc].innerHTML = "&nbsp; <b>></b> "; // No I18N
                    }
                }
            }
        }
            if(!display) {
                addElementToMore(monthVar, days, dayObj, module);
            }
        }
        else if(weekStatus == "end" && days != ed && days != sd) {
            // For cases where the task ends on a saturday but starts before that
            barObj.style.width = parseInt(barObj.style.width) + parseInt(dayObj.offsetWidth) +"px";
            // Required when the page is viewed in RTL (Arabic). The bar needs to be pushed to the left for every passing day. So subtracting the day's width from the left position
            if(parent.sdp_user.DIRECTION != null && parent.sdp_user.DIRECTION == "RTL") {
                barObj.style.left = parseInt(barObj.style.left) - dayObj.offsetWidth +"px";
            }
            setDisplayStatus(dayObj, barObj);
            var elements = barObj.getElementsByTagName("div");
            for(var cc=0; cc<elements.length; cc++) {
                if(elements[cc].id == "StripEnd") {
                    elements[cc].innerHTML = "&nbsp; <b>></b> "; // No I18N
                }
            }
            if(!display) {
                addElementToMore(monthVar, days, dayObj, module);
            }

        }
        else if(weekStatus == "end" && days==sd) {
            // Case when the start date is a weekend. In this case the right hand side image should be replaced with a > symbol
            var elements = barObj.getElementsByTagName("div");
            barObj.style.width = parseInt(barObj.style.width) + 2+"px";
            for(var cc=0; cc<elements.length; cc++) {
                if(elements[cc].id == "StripEnd") {
                    elements[cc].innerHTML = "&nbsp; <b>></b> "; // No I18N
                }
            }
        }
        else if(weekStatus == "start") {
            if(days != sd){
                if(display) {
                    barObj = constructMainDiv(dayObj, title, color);
                    display = checkDisplayStatus(barObj, dayObj);
                    document.body.appendChild(barObj);
                    var elements = barObj.getElementsByTagName("div");
                    for(var cc=0; cc<elements.length; cc++) {
                        if(elements[cc].id == "StripStart") {
                            elements[cc].innerHTML = "<b><</b> &nbsp;"; // No I18N
                        }
                    }
                }
                else if(isAvailable){
                    // Means that the positions P1, P2, P3 are all occupied by previous changes and this change has been hidden on its start date, but has some of the other days visible. So starting the strip on those days
                    barObj = constructMainDiv(dayObj, title, color);
                    display = checkDisplayStatus(barObj, dayObj);
                    document.body.appendChild(barObj);
                    var elements = barObj.getElementsByTagName("div");
                    for(var cc=0; cc<elements.length; cc++) {
                        if(elements[cc].id == "StripStart") {
                            elements[cc].innerHTML = "<b><</b> &nbsp;"; // No I18N
                        }
                    }
                }
                else {
                    addElementToMore(monthVar, days, dayObj, module);
                }
            }
        }
        else {
        //issue has occured due to the barObj not available and we are trying to access the same. Hence checking if isAvailable attribute(if more than 3 changes are present in a day, isavailable will be false) and skipping this part and adding + more attribute if more than 3 changes are present.
            if(days != sd && days != ed) {
                if(isAvailable){
                setDisplayStatus(dayObj, barObj);
                barObj.style.width = parseInt(barObj.style.width) + parseInt(dayObj.offsetWidth)+"px";
                // Required when the page is viewed in RTL (Arabic). The bar needs to be pushed to the left for every passing day. So subtracting the day's width from the left position
                if(parent.sdp_user.DIRECTION != null && parent.sdp_user.DIRECTION == "RTL") {
                    barObj.style.left = parseInt(barObj.style.left) - dayObj.offsetWidth + 1+"px";
                }
              }
                if(!display) {
                    if(isAvailable){
                        // Means that the positions P1, P2, P3 are all occupied by previous changes and this change has been hidden on its start date, but has some of the other days visible. So starting the strip on those days
                        barObj = constructMainDiv(dayObj, title, color);
                        display = checkDisplayStatus(barObj, dayObj);
                        document.body.appendChild(barObj);
                        var elements = barObj.getElementsByTagName("div");
                        for(var cc=0; cc<elements.length; cc++) {
                            if(elements[cc].id == "StripStart") {
                                elements[cc].innerHTML = "<b><</b> &nbsp;"; // No I18N
                            }
                        }
                    }
                    else {
                        addElementToMore(monthVar, days, dayObj, module);
                    }
                }
            }
        }
    }
if(!prev && !next)
{
	plotChange(changeId, module,true,false);
	plotChange(changeId, module,false,true);
}	
}

/**
* This constructs the main div, to be shown as a blue strip.
*/
function constructMainDiv(dayObj, title, color) {
    var barObj = document.createElement("Div"); // No I18N
    barObj.style.left = findPosX(dayObj)+"px";
    // The width is set after subtracting 1, because the right border in calendarcell[css] is set to 1px. If this is increased then the same amount should be subtracted here. Then only the closing arrow will come just inside the cell.
    barObj.style.width = dayObj.offsetWidth - 1+"px";
    barObj.innerHTML = title;
    barObj.className = "calendarStrip"; // No I18N
    barObj.id = "ElementMark"; // No I18N
    barObj.style.background = color;
    return barObj;
}

/**
* Checks which position is available for display and sets the height accordingly. Also it fills the newlt occupied values.i.e if P1 is free, the it will be occupied and its status will be changed to yes.
*/
function checkAvailability(barObj, dayObj) {
    var p1 = dayObj.getAttribute("P1");
    var p2 = dayObj.getAttribute("P2");
    var p3 = dayObj.getAttribute("P3");
    var display = false;
    if(p1 == "no") {
        display = true;
    }
    else if(p2 == "no") {
        display = true;
    }
    else if(p3 == "no") {
        display = true;
    }
    return display;
}

/**
* Checks which position is available for display and sets the height accordingly. Also it fills the newlt occupied values.i.e if P1 is free, the it will be occupied and its status will be changed to yes.
*/
function checkDisplayStatus(barObj, dayObj) {
    var p1 = dayObj.getAttribute("P1");
    var p2 = dayObj.getAttribute("P2");
    var p3 = dayObj.getAttribute("P3");
    var display = false;
    var addHeight = 0;
    var pos = null;
    if(p1 == "no") {
        display = true;
        dayObj.setAttribute("P1","yes"); // No I18N
        addHeight = 20;
        pos = "P1"; // No I18N
    }
    else if(p2 == "no") {
        display = true;
        dayObj.setAttribute("P2","yes"); // No I18N
        addHeight = 37;
        pos = "P2"; // No I18N
    }
    else if(p3 == "no") {
        display = true;
        dayObj.setAttribute("P3","yes"); // No I18N
        addHeight = 54;
        pos = "P3"; // No I18N
    }
    if(pos != null) {
        barObj.setAttribute("pos", pos); // No I18N
    }
    barObj.style.top = findPosY(dayObj) + addHeight+"px";
    return display;
}

function setDisplayStatus(dayObj, barObj) {
    var p1 = dayObj.getAttribute("P1");
    var p2 = dayObj.getAttribute("P2");
    var p3 = dayObj.getAttribute("P3");
    if(p1 == "no" && barObj.getAttribute("pos") == "P1") {
        dayObj.setAttribute("P1","yes"); // No I18N
    }
    else if(p2 == "no" && barObj.getAttribute("pos") == "P2") {
        dayObj.setAttribute("P2","yes"); // No I18N
    }
    else if(p3 == "no" && barObj.getAttribute("pos") == "P3") {
        dayObj.setAttribute("P3","yes"); // No I18N
    }
}

function markChange(elementId, module,prev,next){
    var changeObj = document.getElementById(elementId);
    var sd = parseInt(changeObj.getAttribute('startDate'));
    var ed = parseInt(changeObj.getAttribute('endDate'));
    var sm = parseInt(changeObj.getAttribute('startMonth'));
    var em = parseInt(changeObj.getAttribute('endMonth'));
    var sy = parseInt(changeObj.getAttribute('startYear'));
    var ey = parseInt(changeObj.getAttribute('endYear'));
    var monthVar=currentMonth;
    var yearVar=year;

    if(prev)
    {
    	monthVar-=1;
    	if(monthVar<0)
    	{
    		monthVar=11;
    		yearVar--;
    	}
        if(em!=monthVar || ey!=yearVar)
        	//add year check
        { ed = noOfDays[monthVar];}


    }
    else if(next)
    {
     	if(monthVar==11)
    	{
    		yearVar++;
    	}
    	monthVar=(monthVar+1)%12;
        if(sm!=monthVar || sy!=yearVar)
        	//year check
        { sd = 1;}

    }
    if((sm>monthVar && sy>=yearVar) || (em<monthVar && ey<=yearVar) ||sy>yearVar || ey< yearVar)
    {//when it starts in future or ends in past
    	if(!prev && !next)
    	{
        	markChange(elementId, module,true,false);
        	markChange(elementId, module,false,true);
    	} 	
    	
    	return;}

    if(ey > yearVar) {
        ed = noOfDays[monthVar];
    }
    if(sy < yearVar) {
        sd = 1;
    }

    if(monthVar > sm) {
        sd = 1;
    }
    if(monthVar < em) {
        ed = noOfDays[monthVar];
    }
    for(var days=sd; days<=ed; days++) {
        var day = document.getElementById("D"+days+"M"+monthVar); // No I18N
        if(day != null) {
            day.className  = day.className + " sb fontblacklink"; // No I18N
            var items = day.getAttribute("items");
            if(items == null) {
                items = ""; // No I18N
            }
            day.setAttribute("items", items + "," + elementId); // No I18N
            var textNow = "<a href='/' rel='noopener' class='miniCaledar_select_link' data-days='"+days+"' data-monthVar='"+monthVar+"' data-module='"+module+"'>"+days+"</a>";// No I18N
            day.innerHTML = textNow;
        }
    }
    if(!prev && !next)
    {
    	markChange(elementId, module,true,false);
    	markChange(elementId, module,false,true);
    }
        addChangeListListener();
}

function showDayList(curDate, curMonth, key, module, doNotLoad) {
    var obj = document.getElementById(key);
    var day = parseInt(obj.getAttribute("day")) - 1;
    var content = "<table width='100%' border='0' cellspacing='0' cellpadding='0'><tr><td><table width='100%' border='0' cellspacing='0' cellpadding='0' class='left-nav-boxbrd2'><tr class='DashboardTableColor portlettr'><td class='leftnavheading leftnavheadingtitle' valign='top'><span class='currentdate'>" + getMessageForKey(dayName[day]) + ", " + getMessageForKey(monthName[curMonth]) + " " + curDate + "</span></td></tr></table></tr></tr><tr><td valign='top' class='RightItemBorder1'><ul class='calendarlist1'>"; // No I18N
//cwf start
    var elemUrl = "/ui/changes?mode=detail&entity_id="; // No I18N
    //cwf end
    if("Request" == module) {
        elemUrl = "/WorkOrder.do?woMode=viewWO&woID="; // No I18N
    }
    if(obj.getAttribute("items") != null) {
        var items = obj.getAttribute("items").split(","); // No I18N
        for(var cnt=0; cnt<items.length; cnt++) {
            if(document.getElementById(items[cnt]) != null) {
                var url = "/calendar/ElementDetails.jsp?module=" + encodeURIComponent(module) + "&elementId=" + encodeURIComponent(document.getElementById(items[cnt]).getAttribute("elementId")); // No I18N
                var title = document.getElementById(items[cnt]).innerHTML;
                content = content.concat("<li><table cellspacing=0 cellpadding=0 border=0 class='tl-fixed fw'><tr><td width='16'><a class='pl0' rel=\"noopener\" href='" + elemUrl + document.getElementById(items[cnt]).getAttribute("elementId") + "'><span class=\"cspr " + (document.getElementById(items[cnt]).getAttribute("isemergency") === 'true' ? "chn-mod2" : "chn-mod1") + " icon-sm\" rel=\"uitip\" title=\"" + (document.getElementById(items[cnt]).getAttribute("isemergency") === 'true' ? getMessageForKey("sdp.change.emergencychange") : getMessageForKey("common.change")) + "\"></span></a></td>");
                content = content.concat("<td width='85%'><div class='text-overflow pr5'><a class ='minicalendar_change_list' style='text-decoration:none;' rel=\"noopener\"  href='/' data-url='"+url+"' rel=\"uitip\" mode_ellipsis=\"true\" title=\""+title+"\">"); // No I18N

                content = content.concat(e_html(title));
                content = content.concat("</a></div>"); // No I18N
                content = content.concat("<td ><div style='width:12px;height:12px;border:1px solid #000000;background:" + document.getElementById(items[cnt]).getAttribute("color") + "'>&nbsp;</div></td>"); // No I18N
                content = content.concat("</td></tr></table></li>"); // No I18N
            }
        }
    }
    else {
        content = content.concat(getMessageForKey("sdp.changes.minical.nochanges"));
    }
    content = content.concat("</ul></td></tr></table>"); // No I18N
    document.getElementById("DayList").innerHTML = content;
    var par = obj.parentNode;
    if(par.getAttribute("type") != null && par.getAttribute("type") == "Week") {
        var stDate = par.getAttribute("day");
        var month = par.getAttribute("month");
        var year = par.getAttribute("year");
        var url = "/calendar/WeekCalendar.jsp?module=" + encodeURIComponent(module) + "&date=" + encodeURIComponent(stDate) + "&month=" + encodeURIComponent(month) + "&year=" + encodeURIComponent(year); // No I18N
        window.open(url, "WeekCal_Frame"); // No I18N
    }

    initTooltip("#DayList");    // No I18N
        addChangePreviewListener();
}
/**
* This function appends current time in milliseconds to the url
*/
function processCalURL(url,params){
    url += "&" + new Date().getMilliseconds();
    showURLInDialog(url,params);
}

function addChangePreviewListener(){
    var miniCalendarChangeLinks = document.querySelectorAll('.minicalendar_change_list');// No I18N
	miniCalendarChangeLinks.forEach(link => {
	link.addEventListener('click', function(event) {
        event.preventDefault();
        let url = this.getAttribute('data-url');
		processCalURL(url,"closeButton=yes,title=ChangeDetails,width=800,modal=yes,position=absmiddle");// No I18N
    });

});
}

function addChangeListListener(){
    var miniCalendarLinks = document.querySelectorAll('.miniCaledar_select_link');// No I18N
	miniCalendarLinks.forEach(link =>{
    link.addEventListener('click', function(event) {
        event.preventDefault();
        let days = this.getAttribute('data-days');
		let monthVar = this.getAttribute('data-monthVar');
		let module = this.getAttribute('data-module');

		showDayList(days,monthVar,"D"+days+"M"+monthVar,module,true);// No I18N
	});	 });
}

function addElementToMore(currentMonth, days, dayObj, module) {
    var moreObj = document.getElementById("More_" + currentMonth + "_Date_" + days);
    if(moreObj == null) {
        moreObj = document.createElement("Div"); // No I18N
        moreObj.style.left = findPosX(dayObj)+"px";
        moreObj.id="More_" + currentMonth + "_Date_" + days; // No I18N
        moreObj.style.width = dayObj.offsetWidth - 1+"px";
        moreObj.className = "moredata";  // No I18N
        moreObj.innerHTML = "<a href='/' rel='noopener' class='calendar_showmore_link' data-days='"+days+"' data-month='"+currentMonth+"' data-daysObj='"+dayObj.id+"' data-module='"+module+"' >+1 more</a>"; // No I18N
        moreObj.setAttribute("more","1"); // No I18N
        moreObj.style.top = findPosY(dayObj) + 74+"px";
        document.body.appendChild(moreObj);
    }
    else {
        var cnt = moreObj.getAttribute("more");
        moreObj.setAttribute("more", parseInt(cnt) + 1); // No I18N
        moreObj.innerHTML = "<a href='/' rel='noopener' class='calendar_showmore_link' data-days='"+days+"' data-month='"+currentMonth+"' data-daysObj='"+dayObj.id+"' data-module='"+module+"' >" + "+" + (parseInt(cnt) + 1) + " more</a>"; // No I18N
    }
}


function loadMonthCal(showColors) {
    var elements = parent.toBeShown;
    for(var cnt = 0; cnt < elements.length; cnt++) {
        var color = document.getElementById(elements[cnt]).getAttribute("color");
        if(showColors == null) {
            parent.plotChange(elements[cnt], parent.module);
        }
        else {
            for(var cl = 0; cl < showColors.length; cl++) {
                if(showColors[cl] == color) {
                    parent.plotChange(elements[cnt], parent.module);
                    break;
                }
            }
        }
    }

    let changeLinks = document.querySelectorAll('.changeLink');// No I18N
changeLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        let elementId = this.getAttribute('data-url');
        showURLInDialog(
            `${elementId}`,
            "closeButton=yes,title=ChangeDetails,width=800,modal=yes,position=absmiddle"// No I18N
        );
    });
});

let showmoreLinks = document.querySelectorAll('.calendar_showmore_link');// No I18N
showmoreLinks.forEach(link => {
link.addEventListener('click', function(event) {
    event.preventDefault();
    let days = this.getAttribute('data-days');
    let month = this.getAttribute('data-month');
    let daysObj = this.getAttribute('data-daysObj');
    let module = this.getAttribute('data-module');

    showDayList(days,month,daysObj,module,true);
});
});

}


function checkAndLoadTypes() {
    var elements = document.getElementsByTagName("input");
    var showColors = new Array();
    var url = "/calendar/SaveColorSelection.jsp?"; // No I18N
    for(var cnt=0; cnt < elements.length; cnt++) {
        if(elements[cnt].id.indexOf("showType") >= 0) {
            if(elements[cnt].checked){
                showColors.push(elements[cnt].value);
                url = url.concat("&COLORS=" + (elements[cnt].value!='null'?encodeURIComponent(elements[cnt].value):"")); // No I18N
            }
        }
    }
   var saveColorSelection = new Ajax.Request(url, {
    method: 'post'// No I18N
});
    var divObjs = parent.document.getElementsByTagName("div");
    var tobeDeleted = new Array();
    for(var i=0; i<divObjs.length; i++) {
        if(divObjs[i].id.indexOf("ElementMark") >= 0 || divObjs[i].id.indexOf("More_") >= 0) {
            tobeDeleted.push(divObjs[i]);
        }
    }
    for(var j=0; j<tobeDeleted.length;j++){
        parent.document.body.removeChild(tobeDeleted[j]);
    }
    resetPositions();
    loadMonthCal(showColors);
}

function resetPositions() {
    var divObjs = document.getElementsByTagName("td");
    for(var cnt=0; cnt < divObjs.length; cnt++) {
        var obj = divObjs[cnt];
        if(obj.getAttribute("P1") != null) {
            obj.setAttribute("P1", "no"); // No I18N
            obj.setAttribute("P2", "no"); // No I18N
            obj.setAttribute("P3", "no"); // No I18N
        }
        if(obj.getAttribute("items") != null && obj.getAttribute("minical") == null) {
            obj.setAttribute("items", ""); // No I18N
        }
    }
}

function editLeaveDetails(leaveId, from) {
    var url = "/calendar/MarkUnavailability.jsp?mode=edit&LEAVEID=" + leaveId; // No I18N
    if(from != null) {
        url = url + "&from=" + from; // No I18N
    }
    url = url + "&" + new Date().getTime(); // No I18N
    showURLInDialog(url,"position=absmiddle, title="+getMessageForKey('sdp.home.techcal.mark.heading'));// No I18N
}

function addLeaveDetails(techId, date, month, year, from) {
    var url = "/calendar/MarkUnavailability.jsp?mode=edit&TECHID=" + techId + "&DATE=" + date + "&MONTH=" + month + "&YEAR=" + year; // No I18N
    if(from != null) {
        url = url.concat("&from=" + from); // No I18N
    }
    showURLInDialog(url, "position=absmiddle,title="+getMessageForKey('sdp.home.techcal.mark.heading'));// No I18N
}


/**
* Loads the calendar for a tech for the given month and year. This will be
* called from the matrix view when the technician name or a number in the view
* is clicked.
*/
function showRequestsForTechOn(techId, date, month, year) {
    url = "/calendar/TechnicianCalendar.jsp?techId=" + techId  + "&date=" + date + "&month=" + month + "&year=" + year + "&matrix=true"; // No I18N
    window.open(url, "Cal", "width=900,height=620"); // No I18N
    closeDialog();
}

function showListForBackupTech()
{
    url="/BackupTechList.do?externalframe=true"; // No I18N
    $previewComponent.load(url,window.getMessageForKey("sdp.calendar.list.backuptech"),null,null,null,'listview_popup'); //No I18N
}

function invokeTechCalAction(cellObjId) {
    var cellObj = document.getElementById(cellObjId);
    var isCountPresent = cellObj.getAttribute("isEntryPresent");
    var leaveId = cellObj.getAttribute("leaveId");
    if(isCountPresent == null && leaveId == null) {
        addLeaveDetails(cellObj.getAttribute("techId"), cellObj.getAttribute("date"), cellObj.getAttribute("month"), cellObj.getAttribute("year"));
    }
    else if(isCountPresent != null && leaveId == null) {
        var content = document.getElementById("linkDiv_Add").innerHTML;
        content = content.replace(/\$TECHID/g, cellObj.getAttribute("techId")); // No I18N
        content = content.replace(/\$DATE/g, cellObj.getAttribute("date")); // No I18N
        content = content.replace(/\$MONTH/g, cellObj.getAttribute("month")); // No I18N
        content = content.replace(/\$YEAR/g, cellObj.getAttribute("year")); // No I18N
        showDialog(content, "position=relative,closeButton=no,top=-" + document.getElementById("matrixDiv").scrollTop); // No I18N
    }
    else if(isCountPresent != null && leaveId != null) {
        var content = document.getElementById("linkDiv_Edit").innerHTML;
        content = content.replace(/\$TECHID/g, cellObj.getAttribute("techId")); // No I18N
        content = content.replace(/\$DATE/g, cellObj.getAttribute("date")); // No I18N
        content = content.replace(/\$MONTH/g, cellObj.getAttribute("month")); // No I18N
        content = content.replace(/\$YEAR/g, cellObj.getAttribute("year"));      // No I18N
        content = content.replace(/\$LEAVEID/g, cellObj.getAttribute("leaveId"));        // No I18N
        showDialog(content, "position=relative,closeButton=no,top=-" + document.getElementById("matrixDiv").scrollTop); // No I18N
    }
    else if(isCountPresent == null && leaveId != null) {
        //editLeaveDetails(leaveId);
        var content = document.getElementById("linkDiv_Edit").innerHTML,
			cellObjId_jq = jQuery('#'+cellObjId);	
        content = content.replace(/\$TECHID/g, cellObj.getAttribute("techId")); // No I18N
        content = content.replace(/\$DATE/g, cellObj.getAttribute("date")); // No I18N
        content = content.replace(/\$MONTH/g, cellObj.getAttribute("month")); // No I18N
        content = content.replace(/\$YEAR/g, cellObj.getAttribute("year"));      // No I18N
        content = content.replace(/\$LEAVEID/g, cellObj.getAttribute("leaveId"));        // No I18N
		showDialog(content, "position=relative,closeButton=no,top=10"); // No I18N
		if(cellObj !== null) {
			jQuery('#_DIALOG_LAYER').css({'top':cellObjId_jq.offset().top+cellObjId_jq.outerHeight()+'px'});// No I18N
		}
    }

    // edit
    if(leaveId != null){

        document.querySelector('#_DIALOG_CONTENT #js-event-TechCalendar-21').addEventListener("click", function(event) {
            if(!editLeaveDetails(leaveId)){event.preventDefault();}
        });
        document.querySelector('#_DIALOG_CONTENT #js-event-TechCalendar-25').addEventListener("click", function(event) {
             if(!showRequestsForTechOn(cellObj.getAttribute("techId"), cellObj.getAttribute("date"), cellObj.getAttribute("month"), cellObj.getAttribute("year"))){
                event.preventDefault();
             }
        });
        document.querySelector('#_DIALOG_CONTENT #js-event-TechCalendar-23').addEventListener("click", function(event) { closeDialog() }); //No I18N
    } else if(isCountPresent != null && leaveId == null){ // add
        document.querySelector('#_DIALOG_CONTENT #js-event-TechCalendar-27').addEventListener("click", function(event) {
            if(!addLeaveDetails(cellObj.getAttribute("techId"), cellObj.getAttribute("date"), cellObj.getAttribute("month"), cellObj.getAttribute("year"))){
                event.preventDefault();
            }
        });
        document.querySelector('#_DIALOG_CONTENT #js-event-TechCalendar-29').addEventListener("click", function(event) { closeDialog() }); //No I18N
        document.querySelector('#_DIALOG_CONTENT #js-event-TechCalendar-31').addEventListener("click", function(event) {
            if(!showRequestsForTechOn(cellObj.getAttribute("techId"), cellObj.getAttribute("date"), cellObj.getAttribute("month"), cellObj.getAttribute("year"))){
                event.preventDefault();
            }
        });
    }
}

function setAjaxWithTimeOut()
{
    new Ajax.Autocompleter('SiteList1_siteSearch', 'search_SiteList1', '/setup/SiteAjax.jsp?action=searchSite&configID=101&SELECTSITE=SiteList1', {paramName : 'siteName',afterUpdateElement:refView},'SiteList1');//No I18N
}

function reloadTechCalendar() {
    var month = parent["TechCal_Month"]; // No I18N
    var year = parent["TechCal_Year"]; // No I18N
    window.frames['SDPHeaderFrame'].location.href = "/calendar/TechCalendar.jsp?month=" + month + "&year=" + year ; // No I18N

    //As re-assigning of frame is happening we need to reassign the ajax.
    if(document.getElementById("SiteList1_siteSearch") != null) {
        // A time delay of 1 sec is given for the ajax assignation.
        setTimeout(function(){setAjaxWithTimeOut();}, 1000);
    }
    closeDialog();
}


function validateLeaveForm(formObj) {
    var searchQuery = window.location.search;
    var newWindow = false;
    var closeWindow = true;
    // Check if Mark Unavailability form is opened in New Window.
    if(searchQuery.indexOf('newwindow=true') > -1) {
        newWindow = true;
    }

    if(formObj.FROM.value == "" || formObj.TO.value == "") {
        alert(getMessageForKey("sdp.admin.holiday.datejserror"));
        closeWindow = false;
        return false;
    }
    var result = checkTime(formObj.FROM, formObj.TO);
    if(!result) {
        alert(getMessageForKey("sdp.home.techcal.invaliddate"));
        closeWindow = false;
        return false;
    }
    // Close mark unavailability dialog on submit
    if(newWindow && closeWindow) {
        window.close();
    }
    return true;
}

function showCalendarForTechs(techArray) {
    var tableObject = document.getElementById('TechCalTable');
    var trObjects = tableObject.getElementsByTagName("tr")
    for(var i=0; i<trObjects.length; i++) {
        if(trObjects[i].id.indexOf("T_") >= 0) {
            trObjects[i].className = 'hide'; // No I18N
        }
    }

    var modifiedArray = new Array();
    if(techArray != null){
        document.getElementById("NoTechMsg").className = "hide"; // No I18N
        if(techArray.length == 0) {
            modifiedArray = techList;
        }
        else {
            for(var i=0; i<techList.length; i++) {
                for(var cnt=0; cnt<techArray.length; cnt++) {
                    if(techList[i] == techArray[cnt]) {
                        modifiedArray[modifiedArray.length] = techArray[cnt];
                    }
                }
            }
        }
    }
    else {
        document.getElementById("NoTechMsg").className = "show"; // No I18N
    }
    if(modifiedArray == null || modifiedArray.length == 0) {
        document.getElementById("NoTechMsg").className = "show"; // No I18N
    }

    for(var cnt=0; cnt<modifiedArray.length; cnt++) {
        var cssClass = "calendar-odd-row"; // No I18N
        //      if(cnt % 2 == 1) {
            //          cssClass = "calendar-odd-row";
        //      }
        document.getElementById("T_" + modifiedArray[cnt]).className = cssClass;
        var tdObjs = document.getElementById("T_" + modifiedArray[cnt]).getElementsByTagName("td");
        for(var k=0; k<tdObjs.length; k++) {
            if(tdObjs[k].getAttribute("isCurrentDate") != null) {
                if(cnt == modifiedArray.length - 1) {
                    tdObjs[k].className="currentDate-bottom"; // No I18N
                }
                else {
                    tdObjs[k].className="currentDate-middle"; // No I18N
                }
            }
        }
    }
    updateCalendarUI();
}

var selGroup = null;
var selSite = null;
var selSiteName = null;
var holidaySelSite = null;
var weekdaySelSite = null;

function loadCalForGroup(groupId) {
    if(groupId != null) {
        selGroup = groupId;
    }
    else {
        selGroup = "-1"; // No I18N
    }
    markHolidays();
    if(selGroup == "-1" || selGroup == null) {
        var techsToBeShown = techList;
        if(selSite == "-1") {
            techsToBeShown = parent.techList;
        }
        else {
            techsToBeShown = parent["siteTechs_" + selSite]; // No I18N
        }
        parent.showCalendarForTechs(techsToBeShown);
        return;
    }
    var groupTechs = parent["group_" + groupId]; // No I18N
    parent.showCalendarForTechs(groupTechs);
    
}

function markHolidays() {

    var site = selSite;
    if(selSite == null || selSite == "-1") {
        site = "0"; // No I18N
    }
    // Modified for msp,will not affect sdp
	 if(ophRefSites[site]){//refer site
		if(ophRefSites[site] == 'true'){//refering default site
			ophSite = 0;
		}else{//refering another site
			ophSite = ophRefSites[site]
		}
    }else{//not a refer site
        ophSite = site;
    }
	//Modified for MSP, will not affect SDP
	if(holidayRefSites[site]){//refer site
		if(holidayRefSites[site] == 'true'){//refering default site
			holidaySite = 0;
		}else{//refering another site
			holidaySite = holidayRefSites[site]
		}
    }else{//not a refer site
        holidaySite = site;
    }
    var weekEnds = parent["weekEnd_" + ophSite]; // No I18N
    var holidays = parent["holiday_" + holidaySite]; // No I18N
    var spanObjs = document.getElementsByTagName("span");
    for(var i=0; i<spanObjs.length; i++){
        var obj = spanObjs[i];
        if(obj.getAttribute("day") != null) {
            var day = obj.getAttribute("day");
            var spanDate = obj.getAttribute("date");
            var className = "";
            obj.className = "";
            if(weekEnds != null){
                // Clear the values before loading
                for(var j=1; j<weekEnds.length; j++) {
                    if(weekEnds[j] == day) {
                        className = "weekEndBG"; // No I18N
                        obj.className = className;
                        if(obj.innerHTML != "") {
                            obj.style.padding="0px"; // No I18N
                            obj.style.height="23px"; // No I18N
                            obj.style.lineHeight="20px"; // No I18N
                        }
                    }
                }
            }
            if(holidays != null){

                // Clear the values before loading
                for(var j=1; j<holidays.length; j++) {
                    if(holidays[j] == spanDate) {
                        className = "holidayBG"; // No I18N
                        obj.className = className;
                        if(obj.innerHTML != "") {
                            obj.style.padding="0px"; // No I18N
                            obj.style.height="23px"; // No I18N
                            obj.style.lineHeight="20px"; // No I18N
                        }
                    }
                }
            }

        }
    }
    var calObj = document.getElementById("TechCalTable");
    var tdObjs = calObj.getElementsByTagName("td");
    for(var i=0; i<tdObjs.length; i++) {
        var tdId = tdObjs[i].id;
        if(tdId != null && tdId.indexOf("T") >= 0) {
            if(tdObjs[i].getAttribute("leaveId") != null) {
                document.getElementById(tdId + "_span").className = "calendar-leavebg"; // No I18N
            }
        }
    }
}

function persistSelectedSite(siteId) {
	if(siteId == null || siteId == 'null' || siteId==0) {
		selSite = 0;
		selSiteName = translate("sdp.admin.technician.addtechnician.nosite"); // No I18N
	}
	else if(siteId==-1) {
		selSite = -1;
		selGroup = -1;
		selSiteName = translate("sdp.reports.globalview.allsites"); // No I18N
	} else {
		try {
			selSite = siteId;
			selSiteName = jQuery("#SiteList1").select2('data').text; // No I18N
		} catch(ex) {}
	}
}

function loadCalForSite(siteId, groupObj) {
    if(siteId == null || siteId == 'null' || (!isMSPOrSCP && siteId=="-2" )) {
        siteId = 0;
    }
   persistSelectedSite(siteId);

   var selGrp = groupObj.value;
   groupObj.innerHTML = ''; // No i18n

   markHolidays();
   var groupNamesObj = document.getElementById("GroupNames_PH"); // No i18n
   var groupFrag = document.createDocumentFragment();
   var groupOpt = new Option(getMessageForKey("sdp.calendar.alltechs"), "-1"); // No i18n
   groupFrag.appendChild(groupOpt);
   groupOpt.innerText=getMessageForKey("sdp.calendar.alltechs");
   if(groupsRefSites[siteId]){//refer site
	   if(groupsRefSites[siteId] == 'true'){//refering default site
     grpSiteId = 0;
	   }else{//refering another site
		   grpSiteId = groupsRefSites[siteId]
	   }
   }else{//not a refer site
     grpSiteId = siteId;
   }

   var siteGroups = parent["site_" + grpSiteId]; // No i18n
   if(siteGroups != null){
   for (var i = 1; i < siteGroups.length; i++) {
     var grpId = siteGroups[i];
     var grpName = document.getElementById("GROUPID_" + grpId).innerHTML; // No i18n
     var grpOpt = new Option(grpName, grpId);
     groupFrag.appendChild(grpOpt);
     grpOpt.innerText=grpName;
   }
   }
   groupObj.appendChild(groupFrag);
   if(siteId == "-1") {
     parent.showCalendarForTechs(parent.techList);
   }else {
     parent.showCalendarForTechs(parent["siteTechs_" + siteId]);
   }
}

function loadComboBoxOptions(comboBox, options, nameFx, prevSelectedId, firstOpt) {
    if(prevSelectedId == null) {
        prevSelectedId =comboBox.value;
    }
    comboBox.innerHTML = '';
    var frag = document.createDocumentFragment();
    frag.appendChild(firstOpt);
    
    var id;
    var name;
    var reload=true;
    for(var i=0;i<options.length;i++) {
        id = options[i];
        name = nameFx(id);
        if(name != null) {
            var newOption = new Option(name,id);
            frag.appendChild(newOption);
            newOption.innerText=name;
        if(id==prevSelectedId){
        newOption.selected=true;
        reload=false;
        }
         }
    }
    comboBox.appendChild(frag);

    if(reload){
    loadCalendarForTech("-1");
    }
}
function loadTechListForGroup(groupId, techObj, techId) {
	selGroup = groupId;
	parent.jQuery('#TechList').select2('destroy');//NO I18N
    var techs;
    if(groupId == "-1")  {
        if(!isMSP){
            techs = parent["siteTechs_" + 0];
        }
        else{
            persistSelectedSite(document.getElementById("SiteList1").value); // No I18N
            if(selSite != null && selSite != -1) {
                techs = parent["siteTechs_" + selSite];
            } 
        }
    }
    else {
        techs = parent["group_" + groupId];
    }
    var defOption=document.createElement('option');
    defOption.innerHTML="---- " + getMessageForKey("sdp.requests.common.select.technician") + " ----";
    defOption.value="-1";
        loadComboBoxOptions(techObj, techs, function(techId) {
                try {
                    return document.getElementById("TECHID_" + techId).innerHTML;
                } catch(x) {
                    return null;
                }
        },
        techId, defOption);
		parent.jQuery('#TechList').select2({width:'225px',formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message') }});//NO I18N
}

function loadListForSite(siteId, techObj, groupObj, techId, groupId) {
    if(siteId == null || siteId == 'null' || (!isMSPOrSCP && siteId=="-2" )) {
        siteId = 0;
    }
    persistSelectedSite(siteId);
    var techs = parent["siteTechs_" + siteId]; // No I18N
    var opts = techObj.options;
    if(techId == null) {
        opts[0].selected = true;
    }

    while(opts.length>0) {
        opts[0] = null;
    }

    opts = groupObj.options;
    if(groupId == null) {
        opts[0].selected = true;
    }

    while(opts.length>0) {
        opts[0] = null;
    }

    var techNamesObj = document.getElementById("TechNames_PH");
    var groupNamesObj = document.getElementById("GroupNames_PH");
    var opt = new Option("---- " + getMessageForKey("sdp.requests.common.select.technician") + " ----", "-1"); // No I18N
    techObj.options[techObj.options.length] = opt;
    var groupOpt = new Option(getMessageForKey("sdp.edit.request.justTechnician"), "-1"); // No I18N
    groupObj.options[groupObj.options.length] = groupOpt;
    //Modified for msp, will not affect sdp
    if(groupsRefSites[siteId]){//refer site
		if(groupsRefSites[siteId] == 'true'){//refering default site
        grpSiteId = 0;
		}else{//refering another site
			grpSiteId = groupsRefSites[siteId]
		}
    }else{//not a refer site
        grpSiteId = siteId;
    }
    var siteGroups = parent["site_" + grpSiteId]; // No I18N
    var groupNames = groupNamesObj.getElementsByTagName("div");
    for(var i=0; i<groupNames.length;i++) {
        var gpId = groupNames[i].getAttribute("groupId");
        if(siteGroups != null) {
            for(var j=0; j<siteGroups.length; j++) {
                if(siteGroups[j] == gpId) {
                    var name = groupNames[i].innerText;
                    name = name.replace(/&amp;/g, "&"); // No I18N
                    var opt = new Option(name, groupNames[i].getAttribute("groupId"));
                    groupObj.options[groupObj.options.length] = opt;
                    if(groupId == gpId) {
                        groupObj.options[groupObj.options.length - 1].selected = true;
                    }
                }
            }
        }
    }



    if(siteId == "-1") {
        var techNames = techNamesObj.getElementsByTagName("div");
        for(var i=0; i<techNames.length;i++) {
            var name = techNames[i].innerText;
            name = name.replace(/&amp;/g, "&"); // No I18N
            var opt = new Option(name, techNames[i].getAttribute("techId"));
            techObj.options[techObj.options.length] = opt;
            if(techNames[i].getAttribute("techId") == techId) {
                techObj.options[techObj.options.length - 1].selected = true;
            }
        }
    }
    else {
        if(groupId != null && groupId != "-1" && groupId != 'null') {
            techs = parent["group_" + groupId]; // No I18N
        }
        var techNames = techNamesObj.getElementsByTagName("div");
        for(var i=0; i<techNames.length;i++) {
            var currId = techNames[i].getAttribute("techId");
            if(techs != null) {
                for(var j=1; j<techs.length;j++) {
                    if(techs[j] == currId) {
                        var name = techNames[i].innerText;
                        name = name.replace(/&amp;/g, "&"); // No I18N
                        var opt = new Option(name, techNames[i].getAttribute("techId"));
                        techObj.options[techObj.options.length] = opt;
                        if(currId == techId) {
                            techObj.options[techObj.options.length - 1].selected = true;
                        }
                    }
                }
            }
        }
    }
}


var currentDate = null;
function constructDayList(mod, date, month, year, slide, type) {
    if(date == null) {
        date = currentDate;
    }
    else {
        currentDate = date;
    }
    if(slide == null) {
        slide = true;
    }
    if(mod !== "Reminder") {
        new Effect.SlideUp(document.getElementById("Calendar_Div"));
        new Effect.BlindDown(document.getElementById("SampleContent"));
    }
    var tableCont = "";
    var leaveId="";
    var backupId="";

    var dateObj = document.getElementsByTagName("Date");
    var display = "";
    var tableCont = "";
    if(mod == "Reminder"){
        document.getElementById("ShowGroup").className = 'hide'; // No I18N
        if(document.getElementById("showTechList") != null) {
            document.getElementById("showTechList").className = 'hide'; // No I18N
        }
        if(document.getElementById("showReassignButton") != null) {
            document.getElementById("showReassignButton").className = 'hide'; // No I18N
        }
    }else{
        document.getElementById("ShowGroup").className = 'show'; // No I18N
        if(document.getElementById("showTechList") != null) {
            document.getElementById("showTechList").className = 'show'; // No I18N
        }
        if(document.getElementById("showReassignButton") != null) {
            document.getElementById("showReassignButton").className = 'show'; // No I18N
        }
    }


    if(mod == "Reminder") {
        var dateObj = document.getElementsByTagName("Center");
        tableCont = "<div style='height:175px;overflow:auto'><table class='tableComponent' cellspacing=1 align=center cellpadding='0' border='0'><tr><th class='tableHeader'>" + getMessageForKey("sdp.home.allReminder.taskSummary") + "</th><th class='tableHeader'>" + getMessageForKey("sdp.home.allReminder.taskDate") + "</th></tr>"; // No I18N
        display = getMessageForKey("sdp.home.allReminder.reminders");
        var cnt = 0;
        var remDate = new Date(year+"-"+(month+1)+"-"+date);
        remDate.setHours(0,0,0,0);
        var from = remDate.getTime();
        remDate.setHours(23,59,59,999);
        var to = remDate.getTime();
        for(var i=0; i<dateObj.length; i++) {
            var obj = dateObj[i]
            var id = obj.id;
            if(id == date + "_Rem") {
                var divs = obj.getElementsByTagName("div");
                var remId = obj.getAttribute("itemid");
                var text = "";
                var time = "";
                for(var k=0; k< divs.length; k++) {
                    if(divs[k].id == "text") {
                        text = divs[k].innerHTML;
                    }
                    if(divs[k].id == "time") {
                        time = divs[k].innerHTML;
                    }
                }
                var cssClass = 'oddRow'; // No I18N
                if(cnt%2==0) {
                    cssClass = 'evenRow'; // No I18N
                }
                var reassign = obj.getAttribute("reassigned");
                if(reassign == null) {
                    tableCont = tableCont.concat("<tr class='" + cssClass + "'>"); // No I18N
                    tableCont = tableCont.concat("<td>"); // No I18N
                    tableCont = tableCont.concat(text);
                    tableCont = tableCont.concat("</td>"); // No I18N
                    tableCont = tableCont.concat("<td>"); // No I18N
                    tableCont = tableCont.concat(time);
                    tableCont = tableCont.concat("</td></tr>"); // No I18N
                    cnt++;
                }
            }
        }
        $header.invokeReminders({"mode":"list","entity":"calendar","from":from, "to":to});//No I18N
        return;
    }
    if(mod == "Request") {
        var dateObj = document.getElementsByTagName("Center");
        tableCont = "<div style='height:175px;overflow:auto'><table width='100%' border='0' cellspacing='0' cellpadding='0' style='padding:1px;'><tr><td><table class='tableComponent' cellspacing=1 align=center cellpadding='0' border='0'><tr><th class='tableHeader' style='width:30px;'><input type='checkbox' name='checkbox23' id='select-all-checkbox'></th><th class='tableHeader' style='width:56%;'>" + getMessageForKey("sdp.common.title") + "</th><th class='tableHeader' style='width:20%'>" + getMessageForKey("sdp.requests.common.status") + "</th><th class='tableHeader' style='width:20%'>" + getMessageForKey("sdp.requests.common.priority") + "</th></tr>"; // No I18N
        display = getMessageForKey("sdp.header.requests");
        var cnt = 0;
        for(var i=0; i<dateObj.length; i++) {
            var obj = dateObj[i]
            var id = obj.id;
            if(id == date + "_Leave") {
                var divs = obj.getElementsByTagName("Center");
                leaveId = obj.getAttribute("leaveid");
                backupId = obj.getAttribute("backupId");
                //alert("Badkup ID: " + backupId);
            }

            if(id == date + "_Req") {
                var divs = obj.getElementsByTagName("div");
                var reqId = obj.getAttribute("itemid");
                var text = "";
                var status = "";
                var priority = "";
                for(var k=0; k< divs.length; k++) {
                    if(divs[k].id == "text") {
                        text = divs[k].innerHTML;
                    }
                    if(divs[k].id == "status") {
                        status = divs[k].innerHTML;
                    }
                    if(divs[k].id == "priority") {
                        priority = divs[k].innerHTML;
                    }
                }
                var cssClass = 'oddRow'; // No I18N
                if(cnt%2==0) {
                    cssClass = 'evenRow'; // No I18N
                }
                var reassign = obj.getAttribute("reassigned");
                if(reassign == null) {
                    tableCont = tableCont.concat("<tr class='" + cssClass + "'><td width='30'><input type='checkbox' name='checkbox' module='Request' value='"+ reqId + "'></td>") // No I18N;
                    tableCont = tableCont.concat("<td><a id='Title" + reqId + "' class='entity-preview-link' target='DetailsFrame' rel='noopener' href='/workorder/WOPrintPreview.jsp?isPreview=true&trimmed_details=request_details,requester_details,share_request,history,conversations,resolution,worklog,notes&woID=" + reqId + "' >"); // No I18N
                    tableCont = tableCont.concat(text);
                    tableCont = tableCont.concat("</a></td>"); // No I18N
                    tableCont = tableCont.concat("<td>"); // No I18N
                    tableCont = tableCont.concat(status);
                    tableCont = tableCont.concat("</td><td>"); // No I18N
                    tableCont = tableCont.concat(priority);
                    tableCont = tableCont.concat("</td></tr>"); // No I18N
                    cnt++;
                }
            }
        }
    }
    if(mod == "Visit") {
        var dateObj = document.getElementsByTagName("Center");
        tableCont = "<div style='height:175px;overflow:auto'><table width='100%' border='0' cellspacing='0' cellpadding='0' style='padding:1px;'><tr><td><table class='tableComponent' cellspacing=1 align=center cellpadding='0' border='0'><tr><th class='tableHeader' style='width:30px;'><input type='checkbox' name='checkbox23' id='select-all-checkbox'></th><th class='tableHeader' style='width:56%;'>" + getMessageForKey("sdp.common.title") + "</th><th class='tableHeader'>" + getMessageForKey("sdp.requests.common.status") + "</th></tr>"; // No I18N
        display = getMessageForKey("sdp.home.reminderDisplay.heading");
        var suffix = "_Tsk";        // No i18n
        if(mod == "Visit") {
            suffix = "_Visit";      // No i18n
        }
        var cnt = 0;
        for(var i=0; i<dateObj.length; i++) {
            var obj = dateObj[i]
            var id = obj.id;
            if(id == date + suffix) {
                var divs = obj.getElementsByTagName("div");
                var reqId = obj.getAttribute("itemid");
                var text = "";
                var status = "";
                var priority = "";
                for(var k=0; k< divs.length; k++) {
                    if(divs[k].id == "text") {
                        text = divs[k].innerHTML;
                    }
                    if(divs[k].id == "status") {
                        status = divs[k].innerHTML;
                    }
                    if(divs[k].id == "priority") {
                        priority = divs[k].innerHTML;
                    }
                }
                var cssClass = 'oddRow'; // No I18N
                if(cnt%2==0) {
                    cssClass = 'evenRow'; // No I18N
                }
                var reassign = obj.getAttribute("reassigned");
                if(reassign == null) {
                    tableCont = tableCont.concat("<tr class='" + cssClass + "'><td width='30'><input type='checkbox' name='checkbox' module='Task' value='"+ reqId + "'></td>"); // No I18N
                    tableCont = tableCont.concat("<td><a class='entity-preview-link' target='DetailsFrame' rel='noopener' href='/tasks/CalendarPrintView.jsp?TASKID=" + reqId + "'  >"); // No I18N
                    tableCont = tableCont.concat(text);
                    tableCont = tableCont.concat("</a></td>"); // No I18N
                    tableCont = tableCont.concat("<td>"); // No I18N
                    tableCont = tableCont.concat(status);
                    tableCont = tableCont.concat("</td></tr>"); // No I18N
                    cnt++;
                }
            }
        }
    }
    if(mod == "Change") {
        var dateObj = document.getElementsByTagName("Center");
        tableCont = "<div style='height:175px;overflow:auto'><table width='100%' border='0' cellspacing='0' cellpadding='0' style='padding:1px;'><tr><td><table class='tableComponent' cellspacing=1 align=center cellpadding='0' border='0'><tr><th class='tableHeader' style='width:30px;'><input type='checkbox' name='checkbox23' id='select-all-checkbox'></th><th class='tableHeader' style='width:46%;'>" + getMessageForKey("sdp.common.title") + "</th><th class='tableHeader' style='width:20%'>" + getMessageForKey("sdp.admin.change.stage")+"</th><th class='tableHeader' style='width:20%'>" + getMessageForKey("sdp.requests.common.status") + "</th><th class='tableHeader' style='width:20%'>" + getMessageForKey("sdp.requests.common.priority") + "</th></tr>"; // No I18N
        display = getMessageForKey("sdp.change.changes");
        var cnt = 0;
        for(var i=0; i<dateObj.length; i++) {
            var obj = dateObj[i]
            var id = obj.id;
            if(id == date + "_Chn") {
                var divs = obj.getElementsByTagName("div");
                var reqId = obj.getAttribute("itemid");
                var text = "";
                var status = "";
                var stage="";
                var priority = "";
                for(var k=0; k< divs.length; k++) {
                    if(divs[k].id == "text") {
                        text = divs[k].innerHTML;
                    }
                    if(divs[k].id == "status") {
                        status = divs[k].innerHTML;
                    }
                    if(divs[k].id == "stage") {
                        stage = divs[k].innerHTML;
                }   
                    if(divs[k].id == "priority") {
                        priority = divs[k].innerHTML;
                    }
                }
                var cssClass = 'oddRow'; // No I18N
                if(cnt%2==0) {
                    cssClass = 'evenRow'; // No I18N
                }
                var reassign = obj.getAttribute("reassigned");
                if(reassign == null) {
                    tableCont = tableCont.concat("<tr class='" + cssClass + "'><td width='30'><input type='checkbox' name='checkbox' module='Change' value='"+ reqId + "'></td>"); // No I18N
                    tableCont = tableCont.concat("<td><a class='entity-preview-link' target='DetailsFrame' rel='noopener' href='/ui/print?externalframe=true&module=change&entity_id="+reqId+"' >"); // No I18N
                    tableCont = tableCont.concat(text);
                    tableCont = tableCont.concat("</a></td>"); // No I18N
                    tableCont = tableCont.concat("<td>");
                    tableCont = tableCont.concat(stage);
                    tableCont = tableCont.concat("</td><td>"); // No I18N
                    tableCont = tableCont.concat(status);
                    tableCont = tableCont.concat("</td><td>"); // No I18N
                    tableCont = tableCont.concat(priority);
                    tableCont = tableCont.concat("</td></tr>"); // No I18N
                    cnt++;
                }
            }
        }
    }
    if(mod == "Problem") {
        var dateObj = document.getElementsByTagName("Center");
        tableCont = "<div style='height:175px;overflow:auto'><table width='100%' border='0' cellspacing='0' cellpadding='0' style='padding:1px;'><tr><td><table class='tableComponent' cellspacing=1 align=center cellpadding='0' border='0'><tr><th class='tableHeader' style='width:30px;'><input type='checkbox' name='checkbox23' id='select-all-checkbox'></th><th class='tableHeader' style='width:56%;'>" + getMessageForKey("sdp.common.title") + "</th><th class='tableHeader' style='width:20%'>" + getMessageForKey("sdp.requests.common.status") + "</th><th class='tableHeader' style='width:20%'>" + getMessageForKey("sdp.requests.common.priority") + "</th></tr>"; // No I18N
        display = getMessageForKey("sdp.problem.problems");
        var cnt = 0;
        for(var i=0; i<dateObj.length; i++) {
            var obj = dateObj[i]
            var id = obj.id;
            if(id == date + "_Prb") {
                var divs = obj.getElementsByTagName("div");
                var reqId = obj.getAttribute("itemid");
                var text = "";
                var status = "";
                var priority = "";
                for(var k=0; k< divs.length; k++) {
                    if(divs[k].id == "text") {
                        text = divs[k].innerHTML;
                    }
                    if(divs[k].id == "status") {
                        status = divs[k].innerHTML;
                    }
                    if(divs[k].id == "priority") {
                        priority = divs[k].innerHTML;
                    }
                }
                var cssClass = 'oddRow'; // No I18N
                if(cnt%2==0) {
                    cssClass = 'evenRow'; // No I18N
                }
                var reassign = obj.getAttribute("reassigned");
                if(reassign == null) {
                    tableCont = tableCont.concat("<tr class='" + cssClass + "'><td width='30'><input type='checkbox' name='checkbox' module='Problem' value='"+ reqId + "'></td>") // No I18N;
                    tableCont = tableCont.concat("<td><a target='DetailsFrame' href='/ui/print?entity_id="+reqId+"&module=problem&externalframe=true'>"); // No I18N
                    tableCont = tableCont.concat(text);
                    tableCont = tableCont.concat("</a></td>"); // No I18N
                    tableCont = tableCont.concat("<td>"); // No I18N
                    tableCont = tableCont.concat(status);
                    tableCont = tableCont.concat("</td><td>"); // No I18N
                    tableCont = tableCont.concat(priority);
                    tableCont = tableCont.concat("</td></tr>"); // No I18N
                    cnt++;
                }
            }
        }
        if(document.ReAssignForm){
            document.ReAssignForm.setAttribute('onSubmit','return false');
            document.ReAssignForm.setAttribute('module','Problem');
        }
    }
    tableCont = tableCont.concat("</table></div><br>"); // No I18N
    let techDayList=document.getElementById("techDayList");
    techDayList.innerHTML = tableCont;
    let selectAllCheckbox = techDayList.querySelector('#select-all-checkbox'); // No I18N

    selectAllCheckbox.addEventListener('click', function() {
        selectAll(this.form, 'checkbox');// No I18N
    });

    let titleLinks = document.querySelectorAll('.entity-preview-link');// No I18N
	titleLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        invokeProgressIndicator(null, "sdp.common.processing");// No I18N
    });
});


    var techId = parent["SelTech"]; // No I18N
    var techName;
    if(document.getElementById("TECHID_" + techId) != null)
    {
        techName = document.getElementById("TECHID_" + techId).innerHTML;
    }
    else
    {
        if(parent["SelTechName"] != null)
        {
            techName = parent["SelTechName"]; // No I18N
        }
    }

    //preparing the tech list dynamically for backuptechnician and reassigning technician list.
    var techNamesObj = document.getElementById("TechNamesForAssocSites");
    var backuptechList = document.getElementById("backuptechnician");
if(!isMSP){
    var techNamesObj = document.getElementById("TechNamesForAssocSites");
    var techNames = techNamesObj.getElementsByTagName("div");
    var roleNamesObj = document.getElementById("GroupRoles");
    var roleNames = roleNamesObj.getElementsByTagName("div");
    if(backuptechList != null)
    {
        backuptechList.innerHTML="";
        var opt = new Option("---- " + getMessageForKey("sdp.requests.common.select.technician") + " ----", "0"); // No I18N
        backuptechList.append(opt);
        var optGroup = document.createElement('optgroup');
        optGroup.setAttribute('label', 'Technicians');
        for(var i=0; i<techNames.length;i++) {
            var name = techNames[i].innerHTML;
            if(techName != name)
            {
                name = name.replace(/&amp;/g, "&"); //No I18N
                name = name.replace(/&lt;/g, "<"); //NO I18N
                name = name.replace(/&gt;/g, ">"); //NO I18N
                opt = new Option(name, techNames[i].getAttribute("techId"));
                optGroup.append(opt);
            }
        }
        backuptechList.append(optGroup);

        if(roleNames.length>0){
        optGroup = document.createElement('optgroup');
        optGroup.setAttribute('label', 'Group Roles');
        for(var i=0; i<roleNames.length; i++){
            var name = roleNames[i].innerHTML;
            if(techName != name){
                name = name.replace(/&amp;/g, "&"); //No I18N
                name = name.replace(/&lt;/g, "<"); //NO I18N
                name = name.replace(/&gt;/g, ">"); //NO I18N
                opt = new Option(name, roleNames[i].getAttribute("techId"));
                optGroup.append(opt);
            }
        }
        backuptechList.append(optGroup);
    }
    }
    if(document.getElementById("TechList1") != null)
    {
        var technicianList = document.getElementById("TechList1");
        technicianList.innerHTML="";
        var opt1 = new Option("---- " + getMessageForKey("sdp.requests.common.select.technician") + " ----", "0"); // No I18N
        technicianList.append(opt1);
        var optGroup1 = document.createElement('optgroup');
        optGroup1.setAttribute('label', 'Technicians');
        for(var i=0; i<techNames.length;i++) {
            var name = techNames[i].innerHTML;
            if(techName != name)
            {
                name = name.replace(/&amp;/g, "&"); // No I18N
                name = name.replace(/&lt;/g, "<");
                name = name.replace(/&gt;/g, ">");
                opt1 = new Option(name, techNames[i].getAttribute("techId"));
                optGroup1.append(opt1);
            }
        }
        technicianList.append(optGroup1);

        if(roleNames.length>0){
            optGroup1 = document.createElement('optgroup');
            optGroup1.setAttribute('label', 'Group Roles');
            for(var i=0; i<roleNames.length; i++){
                var name = roleNames[i].innerHTML;
                if(techName != name){
                    name = name.replace(/&amp;/g, "&"); //No I18N
                    name = name.replace(/&lt;/g, "<"); //NO I18N
                    name = name.replace(/&gt;/g, ">"); //NO I18N
                    opt1 = new Option(name, roleNames[i].getAttribute("techId"));
                    optGroup1.append(opt1);
                }
            }
            technicianList.append(optGroup1);
        }
    }
    }
    //Here its finishes the tech list preparation.
    
        document.getElementById("SampleContent").className = 'show'; // No I18N
        document.ReAssignForm.currtech.value = techId;
        var formatedDate;
        if(event) {
            formatedDate = jQuery(event.target).attr("formatedDate");
            if(formatedDate==undefined) {
                formatedDate = jQuery(event.target.parentElement).attr("formatedDate");
            }
        }
        if(formatedDate) {
            document.getElementById("ViewType").innerHTML = getMessageForKey("sdp.calendar.date.display", new Array(display, techName, formatedDate, "")); // No I18N
        }
        else {
            document.getElementById("ViewType").innerHTML = getMessageForKey("sdp.calendar.date.display", new Array(display, techName, date, document.getElementById("month_ph").innerHTML)); // No I18N
        }
    if(backuptechList != null || isMSP) {
        document.BackupTechForm.currtech.value = techId;
        document.BackupTechForm.leaveid.value=leaveId;
        //document.BackupTechForm.backupmode.value="Unassign"; //No I18N
    if(backuptechList!=null){
        if(backupId==techId)
        {
            document.BackupTechForm.BackupTech[2].checked=true;  //-- for the none action case
            document.BackupTechForm.backuptechnician.value=0;
            document.BackupTechForm.backupmode.value="Unassign"; //No I18N
            document.BackupTechForm.backuptechnician.disabled=true; //No I8N
        }
        else if(backupId=="null")
        {
            document.BackupTechForm.BackupTech[0].checked=true;  //-- for the unassigned case
            document.BackupTechForm.backuptechnician.value=0;
            document.BackupTechForm.backupmode.value="none"; //No I18N
            document.BackupTechForm.backuptechnician.disabled=true; //No I8N
        }
        else
        {
            document.BackupTechForm.BackupTech[1].checked=true;  //-- for the backuptechnician case
            document.BackupTechForm.backuptechnician.disabled=false;
            document.BackupTechForm.backuptechnician.value=backupId;
            document.BackupTechForm.backupmode.value="Tech"; //No I18N
        }
    }
    }
    if(mod == "Request" && leaveId != ""){
        document.getElementById("BackupTechnicianConfig").className='show';
    }
    else {
        document.getElementById("BackupTechnicianConfig").className='hide';
    }

    if(mod == "Req") {
        //      document.getElementById("ShowGroup").className = 'show';
    }
    else {
        document.getElementById("ShowGroup").className = 'hide'; // No I18N
    }
    if(mod == "Reminder") {
        window.frames['DetailsFrame'].location.href = "/framework/html/blank.html"; // No I18N
    }
    else {
        window.frames['DetailsFrame'].location.href = "/jsp/PreviewMessage.jsp"; // No I18N
    }
}


function showMonthCalendar() {
    new Effect.SlideDown(document.getElementById("Calendar_Div"));
    new Effect.BlindUp(document.getElementById("SampleContent"));
}

/**
* Loads the calendar of a particular tech in the ChangeFrame
*/
function loadCalendarForTech(techId, matrix) {
    // modified jsp for msp and scp
    var calendarType = "/calendar/OnlyCalendar.jsp?Type=Month&techId=";//NO I18N
    var url = calendarType + encodeURIComponent(techId) + "&month=" + encodeURIComponent(parent.currentMonth) + "&year=" + encodeURIComponent(parent.year) + "&matrix=" + encodeURIComponent(matrix); // No I18N
		var grpId=document.getElementById("GroupList");
		var siteId=document.getElementById("SiteList1");
		if(grpId!=null)
		{
        url = url.concat("&groupId=" + encodeURIComponent(grpId.value)); // No i18n
		}
		if(siteId!=null)
		{
        url = url.concat("&siteId=" +encodeURIComponent(siteId.value)); // No i18n
		}
    	url = url.concat("&exeScript=true"); // No i18n
    window.frames['ChangeFrame'].location.href = url; // No I18N

    //As re-assigning of frame is happening we need to reassign the ajax.
    if(document.getElementById("SiteList1_siteSearch") != null) {
        // A time delay of 1 sec is given for the ajax assignation.
        setTimeout(function(){setAjaxWithTimeOut();}, 1000);
    }
	if(techId == -1){
		parent.jQuery("#SiteList1").off("change");//NO I18N
	    parent.jQuery("#SiteList1").on("change", function () { parent.jQuery("#TechList").val("-1").trigger("change"); });//NO I18N
	}
    if(window.opener!=null)
    {
        //  window.opener.frames['SDPHeaderFrame'].location.href = "/calendar/TechCalendar.jsp?month=" + parent.currentMonth + "&year=" + parent.year + "&matrix=" + matrix; // No I18N
    }
}

/**
 * To initialize customfilter dropdown
 */
function initFilterDropDown()
{
	var filterList_obj = new filterListComp();
	filterList_obj.initComponent({            
		element : "#CalViewFilterMenu",    //No I18N
		module : "change",    //No I18N
		personalize_key : "change_view",   //No I18N 
		filter_action : "filterChangeCalView",    //No I18N
		addfilter_url : "/ListViewFilter.do?module=change&action=addfilter",  //No I18N  
		managefilter_url : "/ListViewFilter.do?module=change&action=listview",       //No I18N         
		user_type : sdp_user.USERTYPE,    
		favoritable : true   
	});
}

function changeCalendarForOption(id, url, month, year, date,site) {
    var siteParam = "";
    if(site!=undefined)
    {
        siteParam = "&site="+encodeURIComponent(site.value); // No I18N
    }
    var fullUrl = url + "&month=" + encodeURIComponent(month) + "&year=" + encodeURIComponent(year) + "&FILTERID=" + encodeURIComponent(id) +siteParam ; // No I18N
    if(date != null && date != " " && date != "") {
        fullUrl = fullUrl + "&date=" + encodeURIComponent(date); // No I18N
    }
    window.frames['ChangeFrame'].location.href = fullUrl; // No I18N
}

function filterChangeCalView(id)
{
	if(document.getElementById("date") == null){ 
		changeCalendarForOption(id,document.getElementById("url").value,document.getElementById("month").value,document.getElementById("year").value,"",document.getElementById("site"));
	} else { 
		changeCalendarForOption(id,document.getElementById("url").value,document.getElementById("month").value,document.getElementById("year").value,document.getElementById("date").value,document.getElementById("site"));
	}
}

function techCalendarSiteChange() {
    loadCalForSite(document.getElementById("SiteList1").value, document.getElementById("GroupList"));
}

function techMonthCalendarSiteChange() {
    loadListForSite(document.getElementById("SiteList1").value, document.getElementById("TechList"), document.getElementById("GroupList"));
}

//Added for SD-43173
function updateCalendarUI(){
    var $=parent.jQuery;
    var rightPadding=parseInt($('#matrix_body').width())-parseInt($('#TechCalTable').width());//NO I18N
    $('#matrix_head').css('padding-right',rightPadding);//NO I18N
    $('#matrix_head').find('table').find('tr').eq(0).find('td').eq(0).attr('width',450);//NO I18N
    $('#matrix_head').find('table').find('tr').eq(1).find('td').eq(0).attr('width',450);//NO I18N
    var tdlen = 70 / ($('#matrix_body').find('table').find('tr').eq(0).find('td').length - 1);
	
    $('#matrix_head').find('table').find('tr').each(function(){
        var i=0;
        $(this).find('td').each(function(){
            if( i == 0 ) {
                $(this).attr('width','30%');//NO I18N
            }
            else {
                $(this).attr('width',tdlen+'%');//NO I18N
            }
            i++;
        });	
    });
    $('#matrix_body').find('table').find('tr').each(function(){
       var i=0;
            $(this).find('td').each(function(){
            if( i == 0 ) {
                $(this).attr('width','30%');//NO I18N
            }
            else {
                $(this).attr('width',tdlen+'%');//NO I18N
            }
            i++;
        });
    });
}
//Configured Select2 For Scheduler's Site Drop Down
function updateSiteDropdown(elementId, selectedSiteId, selectedSiteName, siteCount)
{
	var searchEnabled = true;

	if( siteCount == null || siteCount == undefined )
	{
		siteCount = 100;
	}
	/* Used this method For account based select2 in Msp */
	function returnSelectUrl() {
		var url;
		if(isMSP){
			var accountId="0";
			try{
				accountId=document.getElementById("__persistentAccountId__select").value;
			}catch(e){
				try{accountId=window.opener.document.getElementById("__persistentAccountId__select").value;}catch(e){}
			}
			var params='persistentAccountId='+accountId;//NO I18N
			url='/usersites.json?'+params;//NO I18N
		}
		else{
			url='/usersites.json';//NO I18N
		}
		return url;
	}

	jQuery("#" + elementId).select2(
	{
		placeholder: selectedSiteName,
		formatNoMatches: function (){ return getMessageForKey('ae.select2.no.message'); },
		ajax: {
			url: function() { return returnSelectUrl() },
			dataType: 'jsonp',//NO I18N
			width: '100%',
			quietMillis: 500,
			data: function (term, page)
			{
				if(trim(term) != '')
				{
					searchEnabled = true;
				}
				else
				{
					searchEnabled = false;
				}
				return { searchText: term, page: page };
			},
			results: function (data, page)
			{
				if( data.length < siteCount && !searchEnabled && page < 2)
				{
					var elementObj = jQuery("#" + elementId);

					var elementName = elementObj.attr('name');
					var elementStyle = elementObj.attr('style');
					var elementOnChange = elementObj.attr('onchange');
					var elementValue = elementObj.val();

					var selectTagObj = jQuery(document.createElement("select"));

					for( i=0; i<data.length; i++ )
					{
						selectTagObj.append('<option value="' + data[i].id + '">' + encodeHTML(data[i].text) + '</option>');
					}
					selectTagObj.attr('name', elementName);
					selectTagObj.attr('id', elementId + "_");
					selectTagObj.attr('style', elementStyle);
					selectTagObj.attr('onchange', elementOnChange);
					selectTagObj.val(elementValue);

					elementObj.parent().append(jQuery(selectTagObj));

					jQuery('#' + elementId).select2("destroy");//NO I18N
					jQuery('.select2-drop-mask').remove();
					elementObj.remove();

					selectTagObj.attr('id', elementId);

					jQuery('#' + elementId).select2();
					jQuery('#' + elementId).select2("open");//NO I18N

					return {results: {}};
				}
				else
				{
					if(isMSP) {
						var more = data.length > 99;
						return {results: data,more: more};
					} else {
						return {results: data};
					}
				}
			},
			escapeMarkup: function (m) { return m; }
		      },
		multiple: false,
		formatSearching: function() { return getMessageForKey('ae.software.site.dropdown.search.text'); }
	});
	jQuery('#' + elementId).val(selectedSiteId);
}
function setMonthHeight() {
    jQuery("#CalendarView").height( jQuery("#taskview-sidebar-list").height() + 43);
    jQuery('#CalendarView').css('overflow','auto');// No I18N
}
