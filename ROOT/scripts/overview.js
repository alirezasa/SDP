/* $Id$ */
var systemUpdate = "";
function addOverviewEvents(){
    setEventCount();
    jQuery(document).on('click', '.event-btn', function(e) // No I18N
    {
        e.stopPropagation();
        loadEventView();
        setEventCount();
    });
}
jQuery(document).ready(function() 
{
	/* UI behaviour starts */

    /**Overview event handling */
	jQuery('#overview_modules li').on('click', function(){
        var slideindex = jQuery(this).data('slide-to');  //No i18N
        POtour.openSlide(slideindex);
	});

    jQuery(document).on('click', '.c-bglayer', function()  //No i18N
    {
        hidemodal();
    });

	jQuery(document).on('keyup', {}, function(event)
	{
		if(event.keyCode==27)
		{ 
			hidemodal(); 
		}
	});
	/* UI behaviour ends */

    /** Contact us click event */
    jQuery(document).off('click.overview_contactus').on('click.overview_contactus', '#overview-pop-contact,#overview-contact-us' , function(e){ //No i18N
        e.preventDefault();
        window.open('https://salesiq.zoho.com/signaturesupport.ls?widgetcode=f97f84e635e0fe2398e0bb1c08bbaf4852feb05ad7c9ac3c8b77a828feca4c90&', '_blank', 'noopener'); //No i18N
    })

});


// Hide the slide show
function hidemodal()
{
    jQuery('.feature-content .close-dialog').trigger('click');
    jQuery("body")
    .find('.c-bglayer').fadeOut().end()
    // hide the iframe
    .find('iframe.feature-content.current').hide();

    if(jQuery('.feature-cnt .c-wrap').hasClass('show'))
    {
        jQuery('.feature-cnt .c-wrap').removeClass('show');  //For Events
        resetIsNew();
        jQuery('.feature-cnt').detach();
    }
    else
    {
        jQuery('.c-wrap').removeClass('show');  //For Overview
    }
}
/* UI methods end */

/* Functionality methods */

// This method checks if the required proxy fields are entered properly
// Posts the entered proxy fields to the server via an AJAX call
function checkProxyAndPost(proxyForm)
{    
    if( proxyForm.proxyHost.value == null || proxyForm.proxyHost.value.trim() == "" )
    {
    //sd-114613 Internal Pentest : XSS in i18n {No need since its a static key from properties }
        alert( getMessageForKey("sdp.admin.proxysettings.validation.mandatory", [ getMessageForKey("sdp.admin.proxy.host") ]) );    
        proxyForm.proxyHost.focus();    
        return;
    }
    if( proxyForm.proxyPort.value == null || proxyForm.proxyPort.value.trim() == "" )
    {
    //sd-114613 Internal Pentest : XSS in i18n {No need since its a static key from properties }
        alert( getMessageForKey("sdp.admin.proxysettings.validation.mandatory", [ getMessageForKey("sdp.admin.proxy.port") ]) );   
        proxyForm.proxyPort.focus();    
        return;
    } 
    else if( ! checkNumeric(proxyForm.proxyPort, 'int', false) )    //NO I18N
    {     
        return;     
    }       
    var proxyPassword = proxyForm.proxyPassword.value;
    if(proxyPassword != null && proxyPassword.trim() != ""){
        proxyPassword = encryptDataWithRSA(proxyPassword);
    }
    jQuery('#proxyPostButton').prop("disabled", true); //No i18N
    jQuery.ajax('/overview/controller',     //No i18N
    { 
        data: {"proxyHost": proxyForm.proxyHost.value, "proxyPort": proxyForm.proxyPort.value, "proxyUserName": proxyForm.proxyUserName.value, "proxyPassword": proxyPassword, "action": "proxy"}, //No i18N
        type: "POST", //No i18N
        success: formSubmitHelperProxy
    });
}

// This method is used to take care of displaying status messages to the user based on the status of posting the data using the proxy settings
function formSubmitHelperProxy(responseStatus) 
{
    jQuery('#proxyPostButton').prop("disabled", false); //No i18N
    if(responseStatus === "1") 
    {
        showOperationalStatus(getMessageForKey("sdp.overview.proxy.success"),"alert-greenicon-yes", null, "successbox", "");   //No i18N
    }
    else if(responseStatus === "2") 
    {
        showOperationalStatus(getMessageForKey("sdp.overview.proxy.info"),"alert-warn-icon", null, "successbox", "");  //No i18N
    }
    else if(responseStatus === "4") 
    {
        showOperationalStatus(getMessageForKey("sdp.overview.proxy.error"),"alert-redicon-no", null, "successbox", "");    //No i18N
    }
}

// This method checks if the required proxy fields are entered properly
// Posts the entered proxy fields to the server via an AJAX call
function checkProxyAndPull(proxyForm)
{    
    if( proxyForm.proxyHost.value == null || proxyForm.proxyHost.value.trim() == "" )
    {
        //sd-114613 Internal Pentest : XSS in i18n {No need since its a static key from properties }
        alert( getMessageForKey("sdp.admin.proxysettings.validation.mandatory", [ getMessageForKey("sdp.admin.proxy.host") ]) );    
        proxyForm.proxyHost.focus();    
        return;
    }
    if( proxyForm.proxyPort.value == null || proxyForm.proxyPort.value.trim() == "" )
    {
        //sd-114613 Internal Pentest : XSS in i18n {No need since its a static key from properties }
        alert( getMessageForKey("sdp.admin.proxysettings.validation.mandatory", [ getMessageForKey("sdp.admin.proxy.port") ]) );   
        proxyForm.proxyPort.focus();    
        return;
    }
    else if( ! checkNumeric(proxyForm.proxyPort, 'int', false) )    //NO I18N
    {     
        return;     
    }       

    var proxyPassword = proxyForm.proxyPassword.value;
    if(proxyPassword != null && proxyPassword.trim() != ""){
        proxyPassword = encryptDataWithRSA(proxyPassword);
    }

    jQuery('#eventPullButton').prop("disabled", true); //No i18N
    jQuery.ajax('/event/controller',     //No i18N
    { 
        data: {"proxyHost": proxyForm.proxyHost.value, "proxyPort": proxyForm.proxyPort.value, "proxyUserName": proxyForm.proxyUserName.value, "proxyPassword": proxyPassword, "action": "getEventInfo"}, //No i18N
        type: "POST", //No i18N
        dataType: 'json', // No I18N
        success: function(systemArray)
        {
            jQuery('#eventPullButton').prop("disabled", false); //No i18N
            loadEventView();
            setEventCount();
        }
    });
}

function updatecontentload() 
{
    jQuery.ajax({
        type: 'GET', // No I18N
        cache: false,
        url: '/event/controller', // No I18N
        data: {"action": "getEventInfo"}, // No I18N
        contentType: 'application/json', // No I18N
        dataType: 'json', // No I18N
        success: populateEventView
    });
}

function populateEventView(systemArray)
{
  var network         = jQuery(systemUpdate).find('.jumbotron-container'),
      updatejson      = systemArray.productUpdate,
      networkjson     = systemArray.networkStatus,
      content_text    = jQuery('.update-content');

  //no network
  if(networkjson != null)
  {
      content_text.prepend(network);
      jQuery('.jumbotron-container .jumbotron-text').find('h2').first().text(networkjson.ERROR_MESSAGE_1);
      jQuery('.jumbotron-container .jumbotron-text').find('h2').last().text(networkjson.ERROR_MESSAGE_2);
      jQuery('.jumbotron-container .jumbotron-text').find('p').last().text(networkjson.ERROR_MESSAGE_3);
      jQuery('.jumbotron-container .jumbotron-text').find('a').first().text(getMessageForKey('sdp.event.error.proxy.button'));
      jQuery('.jumbotron-container .jumbotron-text').find('a').first().attr('title', getMessageForKey('sdp.event.error.proxy.button'));
  }
  if(updatejson != null)
  {
      jQuery.map(updatejson, function(content, n)
      {
        var featurejson    = content.recentUpdate;
        //header json value
        content_text.append('<h4 id=' + content.header_ID + '></h4>')
                    .find('#' + content.header_ID).text(content.headNotification);
        //recentUpdate json value
        jQuery.each(featurejson, function(key, value)
        {
            updatecloneRow = jQuery(systemUpdate).find('.feature-update-new').html();
            content_text.append(jQuery(updatecloneRow).attr('id', value.ID));
            content_text.find('#' + value.ID).find('div[rel]').attr('title', value.itemCategory);
            content_text.find('#' + value.ID)
                        .find('.feature-title').text(value.Title).end()
                        .find('div:first-child span').addClass(value.iconClass).end()
                        .find('#count-date').text(getCustomizedTime(value.DateTime)).attr('title', value.ActualDate).end();
            content_ID = jQuery('#' + value.ID);
            if(value.hasLink === false)
            {
                content_ID.css('cursor', 'default'); // No I18N
            }
            if (value.isread == false)
            {
                content_ID.addClass('feature-unread');
            }
            if(value.calendar != '')
            {
                content_ID.find('div:first-child span').attr('class', 'feature-calender')
                          .append('<em>' + value.calendar.date + '</em><em>' + value.calendar.month + '</em>');
            }
            if (value.isNew === true)
            {
                content_ID.find('#release-stage').text("new"); // No I18N
            }
            else
            {
                content_ID.find('#release-stage').hide();
            }
            if (value.Description != '')
            {
                content_ID.find('div:last-child').append('<p>' + value.Description + '</p>');
            }
        });
    initTooltip('.update-content'); //NO I18N
      });
   }
}
function setEventCount()
{
    jQuery.ajax('/event/controller', //No i18N
    {
        data: {"action": "fetchCount"}, //No i18N
        type: "GET",    //No i18N
        cache: false,
        success: function(count)
        {
            var msg = translate("common.event.systemUpdates");//NO I18N
            var a_msg = '';
            if(count > 0)
            {
                if(count == 1 ) {
                    msg  =  count + " " + translate("common.event.systemUpdate");//NO I18N
                }else{
                     msg =  count + " " + msg;
                }
                a_msg= '<span class="badge badge-count btn-danger" action="active">'+count+'</span>';//NO I18N
            }
            jQuery('#eventNotificationLink,.email-icon.ov-upd-icon').find('.event-btn span.badge').remove().end().append(a_msg);
        }
    });
}
function resetIsNew()
{
    jQuery.ajax('/event/controller', //No i18N
    {
        data: {"action": "resetIsNewStatus"}, //No i18N
        type: "GET",    //No i18N     
        cache: false,
        success: function()
        {
            setEventCount();
        }
    });
}

function loadEventView()
{
    //SD-125269 - Event binding trigger for open the the popup if the implementation wizard is not loaded
    if(typeof $impl_asst == 'undefined'){
        let files = [`/scripts/implementation-wizard.js`,`/scripts/hbs-template-admin-wizard.js`];
        ResourceLoader({
          js:files,
          success: function() {
            $impl_events.landing();
          }
        });
    }
    jQuery.get('../overview/announcement.jsp', function (data) 
    {
        systemUpdate = jQuery.parseHTML(data);
        jQuery('.update-content').empty();
        jQuery('body').append(jQuery(systemUpdate).filter('.feature-cnt'));     // No I18N
        var main_feature         = jQuery('.feature-cnt'),
            back_layer           = main_feature.find('.c-bglayer'),
            show_feature         = main_feature.find('.c-wrap');

            updatecontentload();
            main_feature.show();
            show_feature.addClass('show');
            back_layer.fadeIn();
    });
}


function getCustomizedTime(timeInMillis)
{
    var d = new Date();
    var utcTime = d.getTime();
    var istTime = utcTime + (330 * 60 * 1000);

    var timeDiff = istTime - timeInMillis;
    var timeString = getTimeString(timeDiff);

    return timeString;
}

function getTimeString(timeDiff)
{
    var dayInMs = 24 * 60 * 60 * 1000,
        hourInMs = 60 * 60 * 1000,
        minuteInMs = 60 * 1000,
        days = Math.floor(timeDiff / dayInMs),
        hours = Math.floor((timeDiff - (days * dayInMs)) / hourInMs),
        minutes = Math.floor((timeDiff - (days * dayInMs) - (hours * hourInMs)) / minuteInMs),
        seconds = Math.round((timeDiff - (days * dayInMs) - (hours * hourInMs) - (minutes * minuteInMs)) / 1000),
        weeks = 0,
        months = 0,
        years = 0,
        customizedTimeString = "";

    if(seconds === 60)
    {
        minutes++;
        seconds = 0;
    }
    if(minutes === 60)
    {
        hours++;
        minutes = 0;
    }
    if(hours == 24)
    {
        days++;
        hours = 0;
    }

    if(days >= 7)
    {
        weeks = Math.floor(days / 7);
    }
    if(weeks >= 4)
    {
        months = Math.floor(weeks / 4);
    }
    if(months >= 12)
    {
        years = Math.floor(months / 12);
    }

    if(years === 1)
    {
        customizedTimeString = "1 year ago"; // NO I18N
    }
    else if(years > 1)
    {
        customizedTimeString = years + " years ago"; // NO I18N
    }
    else if(months === 1)
    {
        customizedTimeString = "1 month ago"; // NO I18N
    }
    else if(months > 1)
    {
        customizedTimeString = months + " months ago"; // NO I18N
    }
    else if(weeks === 1)
    {
        customizedTimeString = "1 week ago"; // NO I18N
    }
    else if(weeks > 1)
    {
        customizedTimeString = weeks + " weeks ago"; // NO I18N
    }
    else if(days === 1)
    {
        customizedTimeString = "1 day ago"; // NO I18N
    }
    else if(days > 1)
    {
        customizedTimeString = days + " days ago"; // NO I18N
    }
    else if(hours === 1)
    {
        customizedTimeString = "1 hour ago"; // NO I18N
    }
    else if(hours > 1)
    {
        customizedTimeString = hours + " hours ago"; // NO I18N
    }
    else if(minutes === 1)
    {
        customizedTimeString = "1 minute ago"; // NO I18N
    }
    else if(minutes > 1)
    {
        customizedTimeString = minutes + " minutes ago"; // NO I18N
    }
    else if(seconds === 1)
    {
        customizedTimeString = "1 second ago"; // NO I18N
    }
    else if(seconds > 1)
    {
        customizedTimeString = seconds + " seconds ago"; // NO I18N
    }
    return customizedTimeString;
}


/**
 * Overview Slides handling
 */
var POtour = {
    POInstance: {},
    init(){
        var _this = this;
        var slides = this.transferPOData();
        try {
            _this.POInstance = new HelpTourComponent({
                data:slides, // Your array of slide data
                arrows:true,
                sidebar: true,
                title: translate("common.overview"), // No I18N
                navigateIcons: true,
                currentSlideIndex:0,
                staticNav: true,
                group: true,
                responsive: true,
                iconClass: 'overviewlist', // No I18N
                groupBySlide: true,
                cbAfterInit: _this.renderContactUs,
                cbAfterRender:  _this.renderContactUs,
                afterSlideRender: function() {
                    _this.checkAddon();
                }
            });
        } catch (error) {throw error}
    },
    transferPOData(){
        var transformData = []
        POData.map(function(el){
            var hasMedia = el.media !== undefined;
            var parentMedia = translate(el.media);
            parentMedia = hasMedia && parentMedia.indexOf('youtube') == -1 ? "https://www.youtube.com/embed/"+parentMedia : hasMedia && parentMedia; // No I18N
            var parentData = {
                type: 'group', // No I18N
                name :translate(el.fullTitle),
                title :translate(el.fullTitle),
                description: translate(el.fullContent),
                alignment:"bottom", // No I18N
                content_type: hasMedia ? 'embed': 'text', // No I18N
                link:"<iframe width=\"560\" height=\"315\" src=\""+parentMedia+"\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe>", // No I18N
                data: []
            }
            el.featuresList.map(function(child){
                var hasChildMedia = child.video !== undefined;
                var childMedia = translate(child.video);
                childMedia = hasChildMedia && childMedia.indexOf('youtube') == -1 ? "https://www.youtube.com/embed/"+childMedia : hasChildMedia && "https://www.youtube.com/embed/"+childMedia.match(/(?:youtu\.be\/|youtube\.com\/.*v=)([a-zA-Z0-9_-]+)/)[1]; // No I18N
                parentData.data.push({
                    name: translate(child.featureListTitle),
                    title: translate(child.featureListTitle),
                    description: '<div class="tl pr10 pl10">'+translate(child.featureListContent) +'<div class="pt15"></div><h5>'+translate('sdp.overview.setUpGuide')+'</h5>'+ translate(child.guide) + '</div>', // No I18N
                    descriptionType: 'html', // No I18N
                    alignment:"bottom", // No I18N
                    link:"<iframe width=\"560\" height=\"315\" src=\""+childMedia+"\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe>", // No I18N
                    type: hasChildMedia ? "embed": "text" // No I18N
                })
            })
            transformData.push(parentData)
        })
        return transformData;
    },
    openSlide(index){
        this.POInstance.currentGroupIndex = index;
        // reset the slide index when slide open
        this.POInstance.options && (this.POInstance.options.currentSlideIndex = 0);
        jQuery('#hv-'+this.POInstance.uuid).remove();
        this.POInstance.init();
        this.POInstance.open();
    },
    renderContactUs(_self){
        var html = `<a class="email-icon pos-abs bottom0 right0" rel="uitip" id="overview-pop-contact" href="/" title="${translate('common.contactus')}" style='${(sdp_user.DIRECTION === "RTL" ? 'right' : 'left')}:inherit'><em class="sdp-glyph sdp-glyph-mail overview-update pl3"></em></a>`
        jQuery('#hv-'+_self.uuid+ ' .email-icon').length === 0 && jQuery('#hv-'+_self.uuid).find('.inner-panel > .fw').append(html)
    },
    checkAddon() {
        var groupIndex = this.POInstance.currentGroupIndex;
        var currentGroup = jQuery("[data-slide-to='"+groupIndex+"']");
        var hasAddon = currentGroup.find('[data-addon]');
        if(hasAddon.length > 0) {
            var header = jQuery('#hv-'+this.POInstance.uuid).find('.media-container [data-content-header] h3')
            if(header.find('[data-slide-addon]').length > 1) {
                return;
            }
            header.append('<span data-slide-addon>');
            var addonSpan = jQuery('<span>');
            addonSpan.attr('data-slider-addon',"").addClass('pos-rel top-10');
            addonSpan.append(jQuery(hasAddon).clone()).find('[data-content]')
            header.append(addonSpan);
            initTooltip('#hv-'+this.POInstance.uuid) // No I18N
        }
    }
}
