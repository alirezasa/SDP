 /* $Id $ */
// `display_name` should be used with translate method
var highlightCount = -1,
    searchresultelementcount = 0,
    admin_focus = false;

jQuery(document).ready(function() {
    if (typeof Ember == "undefined" && !sdp_app.IS_ESMDIR) {
        // Initialize search in Admin sidebar for Non-ember pages.
        initiateKeySearch();
    }
});
function processAdminSidebarData(data) {
    return data;
};
function select2_search($el, term) {
    var $search = $el.data('select2').dropdown;//No i18n
    $search.val(term);
    $search.trigger('keyup');
    $el.select2('open'); //No i18n
};
function initiateKeySearch() {
	var catgry = '',
	LandingPagedd = '';
	if( jQuery('#admin-landing-page').length == 1 ){//no i18n
		var catgry = 'sub-catgry';//no i18n
		LandingPagedd = 'admin-landing-ddown';//no i18n
	}
    var admin_search_row = jQuery(".admin-searchrow"),//no i18n
            $adminpage_search = jQuery('input.admin-searchbar');
    $select2 = jQuery("<select>",  {"multiple":true});
    adminpage_searchresult = jQuery('.admin-searchresult'), // No I18N
            jQuery.ajax("/AdminHome.do?method=adminSettings").done(function (result) {//no i18n
			if(result.Error) {
				return;
			}
        var data = [],
                j, i;
		result = $adminSetJson.init(result,true);//Call admin json for select2 component
        result = result.admin_settings;
        for (i = 0; i < result.length; i++) {
            var optgroup = jQuery("<optgroup>",{"label":result[i].text});
            for (j = 0; j < result[i].children.length; j++) {
                if(result[i].children[j]['parentEntitie']) {//Select2 search for Sub group display_name also
					optgroup.append(jQuery("<option>",{value: result[i].children[j].url, text: result[i].children[j].text, "data-info": '<span class="'+catgry+' disp-b text-muted font-xsmall">'+result[i].text+' >> '+result[i].children[j].parentEntitie.display_name+'</span>', "data-content": result[i].children[j].parentEntitie.display_name}));
				} else {//Display Entite name only
					optgroup.append(jQuery("<option>",{value: result[i].children[j].url, text: result[i].children[j].text}));
				}
            }
            $select2.append(optgroup);
        }
        function format(state) {
            if (!state.id) {
                return state.text; // optgroup
            } else if (state.element[0].dataset.info) {
				return " <a href='" + state.id + "'>" + e_html(state.text) + state.element[0].dataset.info + "</a>";
			} else {
				return " <a href='" + state.id + "'>" + e_html(state.text) + "</a>";
			}
            //return " <a href='" + state.id + "'>" + e_html(state.text) + "</a>";
        };
		function searchmatchfn(term, text, opt) {//Search all values like (Group name, Sub group name and Entite)
			var matcher = opt.parent('select').select2.defaults.matcher;//no i18n
			return matcher(term, text) || (opt[0].dataset.content &&  matcher(term, opt[0].dataset.content));
		};
        admin_search_row.append($select2);
        $select2.select2({
            containerCssClass: "hide",//no i18n
            dropdownCssClass: LandingPagedd,
            //width: admin_search_row.width(),
            formatResult: format,
			matcher: searchmatchfn,
			formatNoMatches : translate("ae.select2.no.message"),
        }).on("change", function (e) {
              var url = e.val[0];
              /*Selected value was getting retained , if we changed the child route alone
                To resolve the above issue, we are resetting the select2's selected value
              */
              jQuery(this).select2("data","");//no i18n
              window.location.href = url;
        }).on("select2-close", function (e)
        {
            admin_search_row.find(".select2-container").addClass('hide');
            $adminpage_search.removeClass('hide');
            admin_search_row.find(".admin-searchicon").removeClass('hide');

        }).on('select2-open', function () {
            jQuery('.select2-results').on('mouseup', function (event) {//no i18n
                if (event.which == 3 || event.which == 2) {
                    event.preventDefault();
                    jQuery(this).find('.select2-result').removeClass("select2-result");//no i18n
                } else if (event.which == 1) {
                    jQuery(this).find('.select2-result').addClass("select2-result");//no i18n
                }
            });
            admin_search_row.find(".admin-searchicon").addClass('hide');//no i18n
        });
        //admin_search_row.find(".select2-container").width(admin_search_row.width()-2);
        admin_search_row.find(".select2-container").addClass("fw");
    });
	$adminpage_search.trigger('focus');
	$adminpage_search.on('keydown', function (event) {
		switch (event.which) {
		case 17: // CTRL
		case 18: // ALT
		case 27: // ESC
		case 91: // CMD
		  return;
	  }
	  if (event.ctrlKey || event.altKey) {
		  return;
	  }
	  if(event.which != 9) {//Skip TAB key event
		if($select2.data('select2')) {//80386 -- Admin home page check select2 render or not
			admin_search_row.find(".select2-container").removeClass('hide');//no i18n
			$adminpage_search.val("").addClass('hide');
			select2_search($select2, event.key)
	  	}
	  }
	});
}

    function sidebarnav(th){
   var selectedHeaderClass=th.getAttribute('class'); // No I18N
    if(selectedHeaderClass=="lnav-headeractive") // No I18N
    {
        jQuery(th).attr('class','lnav-header'); // No I18N
        jQuery('.lnav-itemslist').slideUp(300); // No I18N
    }
    else
    {
        var current_childblock = jQuery(th).next('div.lnav-itemslist'); // No I18N
        var current_header = jQuery(th);
        jQuery(th).attr('class','lnav-headeractive').next("div").slideDown(300); // No I18N
        jQuery('.lnav-itemslist').not(current_childblock).slideUp(300); // No I18N
        setTimeout(function() {jQuery('.lnav-itemslist').not(current_childblock).stop(true, true).hide();}, 200); // No I18N
        jQuery('.lnav-headeractive').not(current_header).attr('class','lnav-header'); // No I18N
    }
    return false;
}

var meIntegration={
     highlightHttpsHelp: function() {
        var delay=1;
         if(jQuery('#helpcardContent').css('display')=='none') {
             jQuery('#helpcardToggle').trigger('click');
             delay=500;
         }
         if(jQuery('#integ-https').length>0) {
             window.setTimeout(function(){
                 jQuery('#integ-https').get(0).scrollIntoView();
                 jQuery('#integ-https').effect("highlight", {}, 3000); // No I18N
             }, delay);
        }
    }
 };
 //Searcing the field........
var jQueryCacheData = null;
var jQueryCacheChar = null;
var jQueryCacheLiIndex = null;
var jQueryCachedLiObject = null;

function searchAndSelectInDropDown(dropDownId,firstLiId,ulIdToScroll,idForSearchResult,chosenCiTypeId)
{
jQuery("#"+dropDownId).on('keydown', function (e) {//No I18N
  if ((65 <= e.which && e.which <= 65 + 25) || (97 <= e.which && e.which <= 97 + 25)) { 
    var keyValue = e.which;
    if((97 <= e.which && e.which <= 97 + 25)){
        keyValue -=  32;
    }
    var keyStr = String.fromCharCode(keyValue);
    if(keyStr != jQueryCacheChar){
      jQueryCacheChar = keyStr;
      jQueryCacheData = jQuery("li[searchchar='"+keyStr+"']");//No I18N
      jQueryCacheLiIndex = 0;
    }
         
    var currentjQueryLiLength = jQueryCacheData.length;

    if( jQueryCachedLiObject != null ){
      jQuery(jQueryCachedLiObject).removeAttr('className');//No I18N
    }
         
    if( currentjQueryLiLength >0 ){
      if( ( currentjQueryLiLength-1 ) < jQueryCacheLiIndex ){
        jQueryCacheLiIndex = 0;
      }

      jQueryCachedLiObject = jQueryCacheData[jQueryCacheLiIndex];
      updateSelecteStyleAndData(ulIdToScroll,idForSearchResult,chosenCiTypeId);
      jQueryCacheLiIndex += 1; 
    }

  } else if (e.which == 13) {
  }
  else if(e.which == 38 || e.which == 40){
    // for up and down keys...
    if( jQueryCachedLiObject != null ){
      var count = jQuery(jQueryCachedLiObject).attr('count');//No I18N
      if(e.which == 40 && count > 0){
        count = +count +1;
      }
      else if(e.which == 38 && count > 0){
        count = +count -1;
      }
      
      if(count == 0 ){
        count = count + 1;
      }
      if(jQuery("li[count='"+count+"']").length ==0){//No I18N
        return false;
      }
      jQuery(jQueryCachedLiObject).removeAttr('className');//No I18N
      jQueryCachedLiObject = jQuery("li[count='"+count+"']"); //No I18N

      updateSelecteStyleAndData(ulIdToScroll,idForSearchResult,chosenCiTypeId);
      
      jQueryCacheLiIndex = 0; 
    }

  }
});

  //In this we are using iframs so,this function maye called multiple time.Even though we are taking only one
  jQuery('body').off('click');//No I18N
  jQuery('#'+firstLiId).off('click');//No I18N
  jQuery('body').on('click', function() {//No I18N
  jQuery('#'+firstLiId+' iframe').hide();//No I18N
  jQuery('#'+firstLiId).removeClass('mnuActive');//No I18N
  jQuery('#'+firstLiId).addClass("mnuNormal");//No I18N
  
  });

   jQuery("#"+firstLiId).click//No I18N
  (
  	function(e)
	{
		if (jQuery(this).is('.mnuNormal') && !jQuery(this).hasClass('.disable-opacity3')) {//No I18N
		         jQuery(this).removeClass('mnuNormal');//No I18N
		         jQuery(this).addClass("mnuActive");//No I18N
		         jQuery('#'+firstLiId+' iframe').show();//No I18N
		} else {
		         jQuery(this).removeClass('mnuActive');//No I18N
		         jQuery(this).addClass("mnuNormal");//No I18N
			 jQuery('#'+firstLiId+' iframe').hide();//No I18N
		}
		e.stopPropagation();
	}
   );



}

function updateSelecteStyleAndData(ulIdToScroll,idForSearchResult,chosenCiTypeId){
jQuery(jQueryCachedLiObject).attr('className','current');//No I18N
      jQuery('#'+idForSearchResult).text(jQuery(jQueryCachedLiObject).text());//No I18N
      var count = jQuery(jQueryCachedLiObject).attr('count');//No I18N
      $(chosenCiTypeId).value = jQuery(jQueryCachedLiObject).attr('citypeid');//No I18N
      if( count > 10 ){
        $(ulIdToScroll).scrollTop = count * 18 - 18;//No I18N
      }
      else{
        $(ulIdToScroll).scrollTop = 0;//No I18N
      }
}

function disableForDemo() {
    alert(getMessageForKey("sdp.setup.orgdef.demoonline.jserror")); //No I18N
    return false;
}
/*Render Admin tab ui using Sub Group section available */
var $renderTabui = {
	/* Ember and Non Ember page current(active) url different */
	load: function(tabs, id, isEmber, entObj) {
		var entitiesobj = tabs;
		var adtabui = [];
		if(!isEmber) {
			var headerSectionLabel = e_html(tabs.selectedItemParent.text) + " - " + e_html(tabs.selectedItem.text);
			entitiesobj = tabs.selectedItem.groups;
		}
		var setId = id;
		var selectedObj = {};
		for(var i=0; i<entitiesobj.length; i++) {
			var dispname = entObj[entitiesobj[i]].display_name;
			if(!isEmber) {
				if(entObj[entitiesobj[i]].url == id) {
					headerSectionLabel = e_html(tabs.selectedItemParent.text) + " - " + e_html(tabs.selectedItem.text);
					if(!entObj[entitiesobj[i]].hideentitytitle) { 
						headerSectionLabel = headerSectionLabel + " - " + e_html(dispname);
					}
					if(entObj[entitiesobj[i]].hideintabui) {
						setId = entObj[entitiesobj[i]].activeurl;
					}
					if(entObj[entitiesobj[i]].history) {
						selectedObj = entObj[entitiesobj[i]].history;
					}
				}
			} else {
				if(i == id) {
					setId = entObj[entitiesobj[i]].url;
					if(entObj[entitiesobj[i]].hideintabui) {
						setId = entObj[entitiesobj[i]].activeurl;
					}
					if(entObj[entitiesobj[i]].history) {
						selectedObj = entObj[entitiesobj[i]].history;
					}
				}
			}
			if(!entObj[entitiesobj[i]].hideintabui) {
				var entt = {
					"label": dispname,// NO I18N
					"id": entitiesobj[i],// NO I18N
					"url": entObj[entitiesobj[i]].url// NO I18N
				}
				adtabui.push(entt);
			}
		}
		var adTabs;//Tab ui responsive 
		const admintabui = jQuery('#admintabui');
		renderhbs(admintabui, 'sdp-tabui', {"entities":adtabui,"currentUrl":setId,"isEmber":isEmber, "history": selectedObj},false,"admin", false, false, function() { // NO I18N
			admintabui.find('#tab_ui_history').off('click.tabui').on('click.tabui', (evt) => viewModuleHistory(evt.currentTarget));// NO I18N
			adTabs = new ResponsiveTabs('#adtabui');// NO I18N
		});
		jQuery( window ).on('resize', function(event){
			adTabs.handleTabs();
		});
		if(!isEmber) {
			jQuery("#wizardHeaderId").html(headerSectionLabel);//No I18N
		}
	},
};
/** 
	Render admin home page ( admin bar ), Left panel UI ( admin bar's ) and Select2 search option
	1. Admin Group section JSON format declare in client side (previously its declare in 'AdminSettingsUtil.java' file, now we GET available entities in this JAVA file)
		a. SDP new ui JSON data variable "$adminSetJson.admin_grouping", old ui JSON data variable "$adminSetJson.admin_grouping_old"
		b. AE ui JSON data variable "$adminSetJson.ae_admin_grouping"
		
		Group JSON format(Group, Subgroup, Entites)
		$adminSetJson.admin_grouping = [
			{
				"id": "groupId",//Group Element id
				"display_name": translate("groupKey"),//i18n keys value
				"modules": [
					"entitiesId",//Entite Id
					{//Sub Group JSON with Entite
						"groups": {
							"id":"subgroupId",//Sub Group Id
							"modules":["entitiesId"]//Entite Id
							
							//Extra options: Some keys show only in search bar (Advanced Portal Settings --> Request, Technicians, Attachment,....), below key not show in Admin bar or Admin left panel
							"extrasearch": ["entitiesId"]
						}
					}
				]
			}
		]
		
	2. Entites value: we user as return function adminAllEntite(mode), we need add all entities in object format with "id" and "display_name" is mandatory key for this
		*mode = Group json format type old or new
		
		Entities JSON format(Group, Subgroup, Entites)
		"entitiesId": {
			"display_name": translate("entitiesKey"),//i18n keys value
			"url": "link",//url link
			
			//Extra options: not for all entities
			"hideintabui": true,//Skip the display_name for entities (show parent key or Group key)
			
			"hideentitytitle": true,//Admin Right side wizard header need to add display_name or not(Advanced Portal Settings --> Request, Technicians, Attachment,.... [Notification rules ui also])
			
			"parentkey": true,//Used for Select2 search option, search subgroup name with entities display_name
		}
**/
var $customConfig = {
	isInitialized: false,
	configList: [],
	init: function() {
		var resultArr = [];
		if (!sdp_app.IS_AE && sdp_app.IS_CUSTOM_MODULE_ENABLED && !sdp_app.IS_ReportConfigAdmin && !sdp_app.IS_CMDBAdmin) {
			sdpAjax({
				url: '/api/v3/custom_modules/_get_configurations',//No I18N
				async: false,
				cache: false,
				ignorefailuremessage: true,
				success: function(resp) {
					resultArr = resp.configurations;
				},
				error: function(resp) {
                	resultArr = [];
                }
			});
		}
		this.isInitialized = true;
		this.configList = resultArr;
	},
	get: function() {
		if(!this.isInitialized) {
			this.init();
		}
		return this.configList;
	}
};

/**
 * Fetching the default admin entities to be shown in the admin page.
 * Default Admin entities are populated in DB with respective layout information.
 * The module details are fetched through API.
 * Then details are feeded to "module component" in client to render in admin page.
 * */

var $defaultConfig = {
	isInitialized: false,
	configList: [],
	init: function() {
		var crit = {
			for:"admin", //No I18N
		};
		var resultArr = [];
		sdpAjax({
			url: '/api/v3/modules', //No I18N
			async: false,
			cache: false,
			ignorefailuremessage: true,
			data: sdpAjaxInputData(crit),
			success: function (resp) {
				resultArr = resp.modules;
			}
		});
		this.isInitialized = true;
		this.configList = resultArr;
	},
	get: function() {
		if(!this.isInitialized) {
			this.init();
		}
		return this.configList;
	}
};

var $adminSetJson = {
	response: [],//used for Integration UI(skip calls)
	init: function(resp, select2call) {
		this.response = resp;
		// MSP and SCP methods written here for re-structuring sdp_admin_json
		if(sdp_app.IS_MSP){
			$msp_admin.createMSPJson();
		}
		if(sdp_app.IS_SCP){
			$msp_admin.createSCPJson();
		}
		return {"admin_settings": this.renderJson(resp,select2call)};//No I18N
	},
	setJSONOption: function(module, groups, entObj) {//Display entities key for Admin bar and Left panel
		let display_name = entObj[module].display_name;
		if(module == 'custom-link') {//No I18N//Zoho creator app display name changes updated //String creatorLinksName = GlobalConfigUtil.getInstance().getGlobalConfigValue("display_name", "CreatorLinks");
			display_name = sdpheader_data && sdpheader_data.external_links ? sdpheader_data.external_links.display_name : display_name;
		}
		var md = {
			"id": module,//No I18N
			"text": display_name,//For Select2//No I18N
			"name": display_name,//For Old usage function//No I18N
			"url": entObj[module].url,//No I18N
		};
		if(groups) {
			md["groups"] = groups;//No I18N
		}
		return md;
	},
	setJSONselect2: function(ent, dispname, gid, entObj) {//Select2 search keys for entities display_name with parentElement display_name 
		if(ent == 'custom-link') {//No I18N//Zoho creator app display name changes updated
			dispname = sdpheader_data && sdpheader_data.external_links ? e_html(sdpheader_data.external_links.display_name) : dispname;
		}
		var module = {
			"id": ent,//No I18N
			"text": dispname,//For Select2//No I18N
			"name": dispname,//For Old usage function//No I18N
			"url": entObj[ent].url,
			"parentEntitie": {//No I18N
				"display_name": entObj[gid].display_name,//No I18N
				"id": gid,//No I18N
			},
		};
		return module;
	},
	licenseBasedNotificationtabs: function() {
		var roles = sdp_user.ROLES;
		var modules = sdp_app.IS_ASSET_MODULE ? ["request-nrules","tasks-nrules","problem-nrules","change-nrules","release-nrules","project-nrules","solution-nrules","space-nrules","asset-nrules","purchaseNot-nrules","contract-nrules","report-nrules","mobile-nrules","approval-nrules"] : ["request-nrules","tasks-nrules","problem-nrules","change-nrules","release-nrules","project-nrules","solution-nrules",,"space-nrules","report-nrules","mobile-nrules","approval-nrules"];//No I18N
		if(roles.indexOf("SDAdmin") == -1 && roles.indexOf("HelpdeskConfig") != -1) {
			modules = ["request-nrules","tasks-nrules","mobile-nrules"];//No I18N
		} else {
			//modules = ["request-nrules","tasks-nrules","solution-nrules","purchaseNot-nrules","report-nrules","mobile-nrules","approval-nrules"];
			if(!sdp_app.IS_PROJECT_ENABLED) {
				//modules.filter(e => e !== 'project-nrules');
				modules = modules.filter(function(e) { return e !== 'project-nrules' });//No I18N
			}
			if(!sdp_app.IS_CHANGE_ENABLED) {
				modules = modules.filter(function(e) { return e !== 'change-nrules' });//No I18N
				modules = modules.filter(function(e) { return e !== 'release-nrules' });//No I18N
			}
			if(!sdp_app.IS_PROBLEM_MODULE) {
				modules = modules.filter(function(e) { return e !== 'problem-nrules' });//No I18N
			}
			if(!sdp_app.IS_SPACE_MODULE) {
				modules = modules.filter(function(e) { return e !== 'space-nrules' });//No I18N
			}			
		}
		if(sdp_app.IS_REBRAND) {
            modules = modules.filter(item => item !== "mobile-nrules");//No I18N
        }
		if(sdp_app.IS_SCP ) {
			modules = modules.filter(function(e) { return e !== 'mobile-nrules' });//No I18N
		}
		return modules;
	},
	renderJson: function(resp, select2call) {
		var _self = this;
		var adminjson = "new";//Admin bar render Old or New UI using this key//No I18N
		if(sdp_app.IS_SDP) {
			adminjson = ClientUtil.getUserPersonalization('admin_json'); //No I18N
			adminjson = (adminjson && adminjson.mode) ? adminjson.mode : adminjson;
			if(jQuery.isEmptyObject(adminjson)) {
				adminjson = "new";//No I18N
			}
			var as = (adminjson == 'new') ? this.admin_grouping : this.admin_grouping_old;//No I18N
			// re-structuring adminjson for MSP and SCP
			if(sdp_app.IS_MSP){
				as = (adminjson == 'new') ? $msp_admin.msp_new_admin_json : $msp_admin.msp_old_admin_json;//No I18N
			}
			else if(sdp_app.IS_SCP){
				as = (adminjson == 'new') ? $msp_admin.scp_new_admin_json : $msp_admin.scp_old_admin_json;//No I18N
			}
			if ($customConfig.get().length !== 0) {
				var groupId = (adminjson === 'new') ? 'helpdeskcustomizer' : 'generalsettings';//No I18N
				var groupIndex,hasCustomConfig = false, cus_index;
				as.forEach((admingroup, index) => {
					if (admingroup.id === groupId) {
						groupIndex = index;
						admingroup.modules.forEach((module, index1) => {
							if (typeof module === 'object' && module.groups.id === 'custom-configurations') {
							    cus_index = index1;
								hasCustomConfig = true;
							}
						});
					}
				});
				var modules = [];
                $customConfig.get().forEach (config => {
                    modules.push(config.name);
                });
				if (cus_index==undefined) {
					var config_group = {
						groups: {
							id: 'custom-configurations',//No I18N
							modules: modules
						}
					};
					as[groupIndex].modules.push(config_group);
                }else{
                    delete as[groupIndex].modules[cus_index].groups.modules;
                    as[groupIndex].modules[cus_index].groups.modules = modules;
                }
			}
		} else {
			adminjson = "old";//No I18N
			var as = this.ae_admin_grouping;
		}
		var entObj = adminAllEntite(adminjson);//Get all entities keys
		var allowOpt = [];
		for(var i=0; i<as.length; i++) {
			var md = as[i].modules;//Available Option in Each Group
			var children = [];
			for(var j=0; j<md.length; j++) {
				if(typeof md[j] === "object") {//No I18N
					var ent = md[j].groups.modules;
					if(select2call) {//In select2 need add all options
						var exSearch = false;
						for(var k=0; k<ent.length; k++) {
							if(resp.admin_settings.indexOf(ent[k]) != '-1') {
								let dispname = entObj[ent[k]].display_name; //Skippig encoding here, since encoding happens in component itself
								if(entObj[ent[k]].parentkey) {
									if(entObj[ent[k]].parentkey_pos && entObj[ent[k]].parentkey_pos == "left") {
										dispname = translate(entObj[md[j].groups.id].display_name) + ' ' +dispname;
									} else {
										dispname += ' ' + entObj[md[j].groups.id].display_name;
									}
								}
								var module = _self.setJSONselect2(ent[k],dispname,md[j].groups.id,entObj);
								children.push(module);
								if(md[j].groups.extrasearch) {
									exSearch = true;
								}
							}
						}
						if(exSearch && md[j].groups.extrasearch) {
							var moduleschk = _self.licenseBasedNotificationtabs();
							var extra = md[j].groups.extrasearch;
							for(var k=0; k<extra.length; k++) {
								if(md[j].groups.id != "notificationrules" || (md[j].groups.id == "notificationrules" && moduleschk.indexOf(extra[k]) != '-1')) {
									let dispname = entObj[extra[k]].display_name;
									var module = _self.setJSONselect2(extra[k],dispname,md[j].groups.id,entObj);
									children.push(module);
								}
							}
						}
					} else {//Group section show only groups
						var parentUrl;
						var addEntitehead = false;
						var avaModule = [];
						for(var k=0; k<ent.length; k++) {
							if(resp.admin_settings.indexOf(ent[k]) != '-1') {
								avaModule.push(ent[k]);
								if(!addEntitehead) {
									parentUrl = entObj[ent[k]].url;
								}
								addEntitehead = true;
							}
						}
						if(addEntitehead) {
							if(md[j].groups.defaultmodules) {//For ember integration module usage only
								var dmodule = md[j].groups.defaultmodules;
								for(var k=0; k<dmodule.length; k++) {
									avaModule.push(dmodule[k]);
								}
							} else {
								entObj[md[j].groups.id].url = parentUrl;
							}
							var module = _self.setJSONOption(md[j].groups.id,avaModule,entObj);
							children.push(module);
						}
					}
				} else {
					if(resp.admin_settings.indexOf(md[j]) != '-1') {
						var module = _self.setJSONOption(md[j],false,entObj);
						children.push(module);
					}
				}
			}
			if(children.length > 0) {
				var iconclass = (as[i].id === 'organizationaldetails' && sdp_app.IS_MDH_SETUP) ? 'admin-servicedeskconfiguration' : "admin-"+as[i].id;
				const dispname = as[i].display_name;
				var allowObj = {
					"icon_class" : iconclass,//No I18N
					"id" : as[i].id,//No I18N
					//For Select2
					"text" : dispname,//No I18N
					//For Old usage function
					"name" : dispname,//No I18N
					"children" : children,//No I18N
				};
				if(as[i].skipsubgroup_nextprev) {
					allowObj["skipsubgroup_nextprev"] = true;
				}
				allowOpt.push(allowObj);
			}
		}
		return allowOpt;
	},


	admin_grouping_old: [
		{
			"id": "organizationaldetails",//No I18N
			"display_name": (sdp_user.ROLES.indexOf("SDAdmin") != -1 || sdp_user.ROLES.indexOf("HelpdeskConfig") != -1 || sdp_user.ROLES.indexOf("ReportConfigAdmin") != -1) ? sdp_app.IS_MDH_SETUP ? translate("sdp.admin.leftpanel.servicedeskconfiguration") : translate("sdp.admin.leftnav.OrganizationalDetails") : translate("sdp.admin.leftpanel.helpdeskcustomizer"),//No I18N
			"modules": (sdp_user.ROLES.indexOf("SDAdmin")>-1 && !sdp_app.IS_ASSET_MODULE && sdp_app.IS_ITHelpDesk) ? sdp_app.IS_MDH_SETUP ? ["instancesettings","sites","operational-hours","holidays","leavetypes","departments","department","mailserversettings","sms_configurations"] : ["instancesettings","organizationdetails","mailserversettings","sms_configurations","regions","sites","operational-hours","holidays","departments","department","organizationalroles","windowsdomainscan"] : ["instancesettings","organizationdetails","mailserversettings","sms_configurations","regions","sites","operational-hours","holidays","departments","department","organizationalroles","timesheet"],//No I18N
		},
		{
			"id": "userssettings",//No I18N
			"display_name": translate("sdp.admin.leftpanel.users"),//No I18N
			"modules": sdp_app.IS_MDH_SETUP ? ["roles","user","requesters","technicians","support_groups","support_group","group-roles","usergroups","activedirectory","ldap","azuread","oauth-providers","sso","technicianautoassign"] : ["roles","user","requesters","technicians","support_groups","support_group","group-roles","usergroups","activedirectory","ldap","azuread","oauth-providers","sso","leavetypes","technicianautoassign"]//No I18N
		},
		{
			"id": "helpdeskcustomizer",//No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdeskcustomizer"),//No I18N
			"modules": ["category","status","level","mode","impact","urgency","priority","prioritymatrix","requesttype","worklogtypes","tasktypes","task-templates","taskclosingrules","taskcustomtriggers","tcf","worklog","worklog-templates","notificationrules","checklists","announcement-types","task","notebusinessrules","notecustomtriggers","ntcf","notificationbusinessrules","notificationcustomtriggers","ncf","approvallevelcustomtriggers","alcf","approvalcustomtriggers","acf","cmbusinessrules","cmcustomtriggers"],//No I18N
		},
		{
			"id": "incidentmanagement",//No I18N
			"display_name": translate("sdp.admin.leftpanel.incidentmanagement"),//No I18N
            "modules": sdp_app.IS_SERVICECATALOG_ENABLED ?["incident-templates","fafr-incident-templates","request","requestclosurecode","requestclosingrules","resolution-template","replytemplate","requestcustommenu","customtriggers","request_timer","rcf","chats","rlc","businessrules","servicelevelagreements"] : ["incident-templates","fafr-incident-templates","request","requestclosurecode","requestclosingrules","resolution-template","replytemplate","service-categories","requestcustommenu","customtriggers","request_timer","rcf","chats","rlc","businessrules","servicelevelagreements"]//No I18N
		},
		{
			"id": "problemchangemanagement",//No I18N
			"display_name": (sdp_app.IS_PROBLEM_MODULE && sdp_app.IS_CHANGE_ENABLED) ? translate("sdp.admin.leftpanel.helpdesk.problem&change") : (sdp_app.IS_PROBLEM_MODULE) ? translate("sdp.admin.leftpanel.helpdesk.problem") : translate("sdp.admin.leftpanel.helpdesk.change"),//No I18N
			"modules": ["problemadditionalfields","problem-templates","problemclosurerules","problemcustomtriggers","pbcf","changetypes","risk","reasonforchange","cabs","changeroles","change-stages","cwf","changeadditionalfields","change-templates","changeclosurecode","change-closurerule","changesla","changecustomtriggers","ccf","changeconfiguration","change-deploymentimpacts"]//No I18N
		},
		{
			"id": "releasemanagement",//No I18N
			"display_name": translate("admin.release_conf"),//No I18N
			"modules": ["release-stages","release","release-roles","release-templates","rwf","release-closurecodes","release-closurerule","relcf","releasecustomtriggers"]//No I18N
		},
		{
			"id": "servicecatalog",//No I18N
			"display_name": translate("sdp.itil.common.service.catalog"),//No I18N
            "modules": sdp_app.IS_SERVICECATALOG_ENABLED?["service-categories","servicecatalog","fafr-service-templates","resource-questions","resource-sections","service-SLA","servicecatalogbrules"]:[],//No I18N
		},
		{
			"id": "projectmanagement",//No I18N
			"display_name": translate("sdp.project.license.text"),//No I18N
			"modules": ["projecttypes","projectroles","projectstatus","projectsettings","project","project-templates","projectcustomtriggers","pcf"],//No I18N
		},
		{
			"id": "discoverysettings",//No I18N
			"display_name": translate("sdp.admin.leftnav.discoveryHead"),//No I18N
			"modules": (sdp_user.ROLES.indexOf("SDAdmin")>-1 && !sdp_app.IS_ASSET_MODULE && sdp_app.IS_ITHelpDesk) ? ["windowsagentconfiguration","credentialslibrary","networkscan","auditsettings","distributedassetscan","remotecontroltools","scansettings","snmpConfigurations"] : ["windowsagentconfiguration","credentialslibrary","windowsdomainscan","networkscan","auditsettings","distributedassetscan","remotecontroltools","scansettings","snmpConfigurations"],//No I18N
		},
		{
			"id": "spacemanagement",//No I18N
			"display_name": translate("space.mgmt"),//No I18N
			"modules": ["campus","structure","floor","room","space-amenities","space-criticalities","room-layouts","space-statuses","space-units","space","facility-service-templates","facility-service"],//No I18N
		},
		{
			"id": "assetmanagement",//No I18N
			"display_name": translate("sdp.admin.leftpanel.assetmgmt"),//No I18N
			"modules": ["all_product_types","product","vendor","vendor_udf","asset","assetImport","assetstate","configurationitemtypes","relationshiptypes", "associations", "association_types", "ci-types", "ci_status", "cmdb", "asset_sync_rules", "sync-rules"]//No I18N
		},
		{
			"id": "softwaremanagement",//No I18N
			"display_name": translate("sdp.inventory.wsDetailView.tabHeader.software"),//No I18N
			"modules": ["softwaretype","softwarecategory","licenseadditionalfields","softwarelicensetypes","agreementadditionalfields","importlicensesfromcsv","softwaremetering"],//No I18N
		},
		{
			"id": "purchasecontractmanagement",//No I18N
			"display_name": translate("sdp.common.admin.general.purchase&contract"),//No I18N
			"modules": ["purchaseadditionalfields","purchaserequestadditionalfields","purchaserequestdefaultvalues","purchasedefaultvalues","costcenter","glcode","currency","vendorServices","contracttype","contractadditionalfields"],//No I18N
		},
		{
			"id": "usersurveyrelated",//No I18N
			"display_name": translate("sdp.admin.leftpanel.survey"),//No I18N
			"modules": ["surveysettings","surveyglobalrules","emailsettings","surveyreports"],//No I18N
		},
		{
			"id": "generalsettings",//No I18N
			"display_name": translate("sdp.reports.customReport.generalSettings"),//No I18N
			"modules": [{//No I18N
					"groups": {//No I18N
						"id":"advancedportalsettings",//No I18N
						"extrasearch":["requestersettings","techniciansettings","approvalsettings","customizationsettings","portal-customization","product-tour"],//No I18N
						"modules":["selfserviceportalsettings"]//No I18N
					}
				},
				{
					"groups" :{ //No I18N
						"id" : "ui-customizations" ,//No I18N
					    "extrasearch" : ["browser-title","manage-tabs","custom-fonts","rta-config","landing-page"], //No I18N
						"defaultmodules": ["browser-title","manage-tabs","rta-config","landing-page"],//No I18N
					    "modules" : ["themes"]  //No I18N
					 }
				}, "securitysettings", "importssl", "attachment-settings", "two-factor-auth", "auto-update", "backupscheduling", "custom-schedules", "gff", "csf", "cbf", "cmcf","dreconnections", "optood", "api", "apisettings", "proxysettings", "PrivacySettings", "privacy-settings", "PerformanceSettings", "translations", "pagescripts", "aesm-fosconfiguration", "aesm-fosreplication", "custom-modules",//No i18N
			]
		},
		{
			"id": "zia",//No I18N
			"display_name": translate("admin.zia"),//No I18N
			"modules": ["ziaconfigurations",//No I18N
				{
					"groups" :{ //No I18N
						"id" : "zia-bot-group" ,//No I18N
					    "modules" : ["zia-bot-action","zia-bot-button","embed-zia-bot"]  //No I18N
					 }
				}, "zcf"],  //NO I18N
		},
		{
			"id": "integrations",//No I18N
			"skipsubgroup_nextprev": true,//No I18N
			"display_name": translate("common.apps.addons"),//No I18N
			"modules": [//No I18N
				{
					"groups": {//No I18N
						"id":"integrations",//No I18N
						"defaultmodules": ["manageengine","thirdparty","widgets"],//No I18N
						"extrasearch" : !sdp_app.IS_MDH_SETUP && sdp_app.isCTIEnabled ?  ["zohotelephony"] : [] ,//No I18N
						"modules":["admanagerplus","adselfserviceplus","zohoreportsintegration","uemproducts","mobiledevicemanagerplus","opmanager","appmanager","passwordmanagerpro","pam360","site24x7","microsoftteams","keymanagerplus","outlookoffice","mscalendar","telephony","jira","sccmsettings","solarwindssettings","office365","eventloganalyzer","whatsapp","chatgpt","officeaddin"]//No I18N
					}
				},
				{
					"groups": {//No I18N
						"id":"webhooks_group",//No I18N
						"modules":["webhooks","problem_webhook","change_webhook","release_webhook","task_webhook","project_webhook"]//No I18N
					}
				},"custom-link","integrationkey","globalvariables","zflowagent","custom_widget" //No I18N
			],
		},
        {
            "id": "dataadminsetting",//No I18N
            "display_name": translate("admin.audit.data.administration"),//No I18N
            "modules": ["dataarchiving", "userauditlog"] //No I18N
        }
	],
	admin_grouping: [
		{
			"id": "organizationaldetails",//No I18N
			"display_name": (sdp_app.IS_SDP) ? translate("sdp.admin.leftpanel.servicedeskconfiguration") : translate("sdp.admin.leftnav.OrganizationalDetails"),//No I18N
			"modules": ["organizationdetails","instancesettings","organizationalroles","regions","sites","operational-hours","holidays","departments","leavetypes","currency","timesheet"],//No I18N
		},
		{
			"id": "userssettings",//No I18N
			"display_name": translate("common.user.permission"),//No I18N
    		"modules": ["roles","requesters","technicians","usergroups","support_groups","group-roles","activedirectory","oauth-providers","sso","ldap","azuread","privacy-settings","PrivacySettings"]//No I18N
		},
		{
			"id": "mailsetting",//No I18N
			"display_name": translate("sdp.dc.dcmenus.admin.mail_server_settings"),//No I18N
			"modules": ["mailserversettings","outgoingmail","spamfilter","emailcommand","delimiter"]//No I18N
		},
		{
			"id": "helpdeskcustomizer",//No I18N
			"display_name": translate("sdp.cpl.scc"),//No I18N
			"modules": [//No i18n
				{
					"groups": {//No i18n
						"id":"helpdesk",//No i18n
						"modules":["category","status","level","mode","impact","urgency","priority","prioritymatrix","requesttype","tasktypes","worklogtypes"]//No i18n
					}
				},
				{
					"groups": {//No i18n
						"id":"changemanagement",//No i18n
						"modules":["changetypes","risk","reasonforchange","cabs","change-stages","changeroles","changeconfiguration","change-deploymentimpacts"]//No i18n
					}
				},
				{
					"groups": {//No i18n
						"id":"releasemanagement",//No i18n
						"modules":["release-stages","release-roles"]//No i18n
					}
				},
				{
					"groups": {//No i18n
						"id":"projectmanagement",//No i18n
						"modules":["projecttypes","projectstatus","projectroles","projectsettings"]//No i18n
					}
				},
				{
					"groups": {//No i18n
						"id":"spacemanagement",//No i18n
						"modules":["space-amenities","space-criticalities","room-layouts","space-statuses","space-units"]//No i18n
					}
				},
				{
					"groups": {//No i18n
						"id":"assetmanagement",//No i18n
						"modules":["all_product_types","product","asset_sync_rules","vendor","softwaretype","softwarecategory","softwarelicensetypes","assetstate","importlicensesfromcsv","softwaremetering"]//No i18n
					}
				},
				{
					"groups": {//No i18n
						"id":"cmdbmanagement",//No i18n
						"modules": ["ci-types", "ci_status", "sync-rules"],//No I18N
					}
				},
				{
					"groups": {//No i18n
						"id":"associations",//No i18n
						"modules":["associations","association_types"]//No i18n
					}
				},
				{
					"groups": {//No i18n
						"id":"purchasemanagement",//No i18n
						"modules":["purchaserequestadditionalfields","purchasedefaultvalues","costcenter","glcode","vendorServices"]//No i18n
					}
				},
				{
					"groups": {//No i18n
						"id":"contractmanagement",//No i18n
						"modules":["contracttype"]//No i18n
					}
				},
				{
					"groups": {//No i18n
						"id":"additionalfields",//No i18n
						"modules": ["request","user","technician","support_group","worklog","problemadditionalfields","changeadditionalfields","release","project","task","space","facility-service","asset","cmdb","licenseadditionalfields","agreementadditionalfields","purchaseadditionalfields","purchaserequestdefaultvalues","contractadditionalfields","department","vendor_udf"]//No i18n
					}
				},
				"announcement-types","checklists",//No I18N
				{
					"groups": {//No I18N
						"id":"closurecodegroups",//No I18N
						"modules":["requestclosurecode","changeclosurecode","release-closurecodes"]//No I18N
					}
				}
			]
		},
		{
			"id": "assetmanagement",//No I18N
			"display_name": translate("common.templates.forms"),//No I18N
			"modules": sdp_app.IS_SERVICECATALOG_ENABLED?[//No i18n
				{
					"groups": {//No I18N
						"id":"servicecatalogmanagement",//No I18N
						"modules":["service-categories","servicecatalog","resource-questions","resource-sections"]//No I18N
					}
				},"servicecategories","incident-templates","problem-templates","change-templates","release-templates","project-templates","task-templates","worklog-templates","replytemplate","resolution-template","campus","structure","floor","room","facility-service-templates",//No I18N
				{
					"groups": {//No I18N
						"id":"fafrmanagement",//No I18N
						"modules":["fafr-incident-templates","fafr-service-templates"]//No I18N
					}
				}
			]:[
				"service-categories","incident-templates","problem-templates","changetemplate","release-templates","project-templates","task-templates","worklog-templates","replytemplate","resolution-template","campus","structure","floor","room","facility-service-templates",//No I18N
				{
					"groups": {//No I18N
						"id":"fafrmanagement",//No I18N
						"modules":["fafr-incident-templates","fafr-service-templates"]//No I18N
					}
				}
			],
		},
		{
			"id": "automation",//No I18N
			"display_name": translate("common.automation"),//No I18N
			"modules": [//No I18N
				{
					"groups": {//No I18N
						"id":"businessrulesgroups",//No I18N
						"modules":["businessrules","servicecatalogbrules","notebusinessrules","notificationbusinessrules","cmbusinessrules"]//No I18N
					}
				},
				{
					"groups": {//No I18N
						"id":"slagroups",//No I18N
						"modules":["servicelevelagreements","service-SLA","changesla"]//No I18N
					}
				},"rlc",//No i18n
				{
					"groups": {//No I18N
						"id":"triggergroups",//No I18N
						"modules":["customtriggers","problemcustomtriggers","changecustomtriggers","releasecustomtriggers","projectcustomtriggers","taskcustomtriggers","notecustomtriggers","notificationcustomtriggers","approvallevelcustomtriggers","approvalcustomtriggers","cmcustomtriggers"]//No I18N
					}
				},
				"request_timer",//No I18N
				{
					"groups": {//No I18N
						"id":"notificationrules",//No I18N
						"extrasearch":["request-nrules","tasks-nrules","problem-nrules","change-nrules","release-nrules","project-nrules","solution-nrules","space-nrules","asset-nrules","purchaseNot-nrules","contract-nrules","report-nrules","mobile-nrules","approval-nrules"],//No I18N
						"modules":["notificationrules"]//No I18N
					}
				},
				{
					"groups": {//No I18N
						"id":"closurerulesgroups",//No I18N
						"modules":["requestclosingrules","problemclosurerules","change-closurerule","release-closurerule","taskclosingrules"]//No I18N
					}
				},"technicianautoassign",//No i18n
				{
					"groups": {//No I18N
						"id":"workflowgroups",//No I18N
						"modules":["cwf","rwf"]//No I18N
					}
				},"preventivemaintenancetasks","custom-schedules"//No i18n
			],
		},
		{
			"id": "discoverysettings",//No I18N
			"display_name": translate("sdp.admin.leftnav.discoveryHead"),//No I18N
			"modules": ["windowsagentconfiguration","windowsdomainscan","credentialslibrary","remotecontroltools","scansettings","snmpConfigurations","networkscan","auditsettings","distributedassetscan"],//No I18N
		},
		{
			"id": "assetmanagement",//No I18N
			"display_name": translate("sdp.admin.leftpanel.assetmgmt"),//No I18N
			"modules": ["assetImport"]//No I18N
		},
		{
			"id": "usersurveyrelated",//No I18N
			"display_name": translate("sdp.admin.leftpanel.survey"),//No I18N
			"modules": ["surveysettings","surveyglobalrules","emailsettings","surveyreports"],//No I18N
		},
		{
			"id": "generalsettings",//No I18N
			"display_name": translate("sdp.reports.customReport.generalSettings"),//No I18N
			"modules": [//No I18N
				{
					"groups": {//No I18N
						"id":"advancedportalsettings",//No I18N
						"extrasearch":["requestersettings","techniciansettings","approvalsettings","customizationsettings","portal-customization","product-tour"],//No I18N
						"modules":["selfserviceportalsettings"],//No I18N
					},
				},
				{
				"groups" :{ //No I18N
					"id" : "ui-customizations" ,//No I18N
					"extrasearch":["browser-title","manage-tabs","custom-fonts","rta-config","landing-page"],//No I18N
					"defaultmodules": ["browser-title", "manage-tabs","rta-config","landing-page"],//No I18N
					"modules" : ["themes"] //No I18N
				 },
				}, "attachment-settings", "backupscheduling", "securitysettings", "importssl", "two-factor-auth","auto-update", "optood", "proxysettings", "PerformanceSettings", "translations", "aesm-fosconfiguration", "aesm-fosreplication"],//No I18N
		},
		{
			"id": "integrations",//No I18N
			"skipsubgroup_nextprev": true,//No I18N
			"display_name": translate("common.apps.addons"),//No I18N
			"modules": ["chats","sms_configurations",//No I18N
				{
					"groups": {//No I18N
						"id":"integrations",//No I18N
						"defaultmodules": ["manageengine","thirdparty","widgets"],//No I18N
						"extrasearch" : !sdp_app.IS_MDH_SETUP && sdp_app.isCTIEnabled ?  ["zohotelephony"] : [] ,//No I18N
						"modules":["admanagerplus","adselfserviceplus","zohoreportsintegration","uemproducts","mobiledevicemanagerplus","opmanager","appmanager","passwordmanagerpro","pam360","site24x7","microsoftteams","keymanagerplus","outlookoffice","mscalendar","telephony","jira","sccmsettings","solarwindssettings","office365","eventloganalyzer","whatsapp","chatgpt","officeaddin"]//No I18N
					}
				},"custom-link","zflowagent" //No I18N
			],
		},
		/*{
			"id": "customentity",//No I18N
			"display_name": "Custom Entity",//No I18N
			"modules": ["custom-modules"],//No I18N
		},*/
		{
			"id": "developerspace",//No I18N
			"display_name": translate("common.developer.space"),//No I18N
			"modules": [//No i18n
				{
					"groups": {//No I18N
						"id":"customactiongroups",//No I18N
						//"extrasearch": ["gff"],//No I18N
						//"defaultmodules": ["gff"],//No I18N
						"modules":["rcf","pbcf","tcf","ccf","relcf","pcf","ntcf","ncf","alcf","acf","csf", "zcf","cbf", "cmcf", "gff"]//No I18N
					}
				},
				"dreconnections", //No I18N
				{
					"groups": {//No I18N
						"id":"custommenu",//No I18N
						"modules":["requestcustommenu"]//No I18N
					}
				},{
					"groups": {//No I18N
						"id":"webhooks_group",//No I18N
						"modules":["webhooks","problem_webhook","change_webhook","release_webhook","task_webhook","project_webhook"]//No I18N
					}
				},
				"pagescripts","integrationkey","globalvariables","api","apisettings","custom-modules","custom_widget"]//No I18N
		},
		{
			"id": "zia",//No I18N
			"display_name": translate("admin.zia"),//No I18N
			"modules": ["ziaconfigurations",//No I18N
				{
					"groups" :{ //No I18N
						"id" : "zia-bot-group" ,//No I18N
					    "modules" : ["zia-bot-action","zia-bot-button","embed-zia-bot"]  //No I18N
					 }
				}],
		},
        {
            "id": "dataadminsetting",//No I18N
            "display_name": translate("admin.audit.data.administration"),//No I18N
            "modules": ["dataarchiving", "userauditlog"] //No I18N
        }
	],
	ae_admin_grouping: [
		{
			"id": "organizationaldetails",//No I18N
			"display_name": translate("sdp.admin.leftnav.OrganizationalDetails"),//No I18N
    		"modules": ["organizationdetails","mailserversettings","regions","sites","department","departments","notificationrules","roles","user","requesters","technicians","activedirectory","ldap","azuread","oauth-providers","sso"]//No I18N
		},
		{
        			"id": "automation",//No I18N
                    "display_name": translate("common.automation"),//No I18N
                    "modules": ["custom-schedules"],//No I18N
        		},
		{
			"id": "discoverysettings",//No I18N
			"display_name": translate("sdp.admin.leftnav.discoveryHead"),//No I18N
			"modules": ["windowsagentconfiguration","credentialslibrary","windowsdomainscan","networkscan","auditsettings","distributedassetscan","remotecontroltools","scansettings","snmpConfigurations"],//No I18N
		},
		{
			"id": "assetmanagement",//No I18N
			"display_name": translate("sdp.admin.leftpanel.assetmgmt"),//No I18N
			"modules": ["all_product_types","product","asset_sync_rules","vendor","vendor_udf","asset","assetImport","assetstate","service-categories"],//No I18N
		},
		{
			"id": "ci-types",//No I18N
			"display_name": translate("common.cmdb"),//No I18N
			"modules": ["ci-types", "association_types", "ci_status", "cmdb", "sync-rules","impact"]//No I18N
		},
		{
			"id": "softwaremanagement",//No I18N
			"display_name": translate("sdp.inventory.wsDetailView.tabHeader.software"),//No I18N
			"modules": ["softwaretype","softwarecategory","licenseadditionalfields","softwarelicensetypes","agreementadditionalfields","importlicensesfromcsv","softwaremetering"],//No I18N
		},
		{
			"id": "servicecatalog",//No I18N
			"display_name": translate("sdp.header.purchase"),//No I18N
			"modules": ["purchaseadditionalfields","purchaserequestadditionalfields","purchaserequestdefaultvalues","purchasedefaultvalues","costcenter","glcode","currency","vendorServices"],//No I18N
		},
		{
			"id": "purchasecontractmanagement",//No I18N
			"display_name": translate("sdp.header.contracts"),//No I18N
			"modules": ["contracttype","contractadditionalfields"],//No I18N
		},
		{
			"id": "generalsettings",//No I18N
			"display_name": translate("sdp.reports.customReport.generalSettings"),//No I18N
			"modules": [ //No I18N
				{
				   "groups": {//No I18N
						"id":"ui-customizations",//No I18N
						"extrasearch" : ["custom-fonts","rta-config"], //No I18N
						"defaultmodules": ["rta-config"],//No I18N
						"modules":["themes"]//No I18N
				    }
				},"securitysettings", "importssl", "attachment-settings","two-factor-auth","auto-update", "proxysettings","backupscheduling", "api", "privacy-settings", "PerformanceSettings", "aesm-fosconfiguration", "aesm-fosreplication"]//No I18N
		},
		{
			"id": "integrations",//No I18N
			"skipsubgroup_nextprev": true,//No I18N
			"display_name": translate("common.apps.addons"),//No I18N
			"modules": [//No I18N
				{
					"groups": {//No I18N
						"id":"integrations",//No I18N
						"defaultmodules": ["manageengine","thirdparty"],//No I18N
						"modules":["sccmsettings","solarwindssettings","uemproducts","zohoreportsintegration","office365"]//No I18N
					}
				}
			],
		},
		{
			"id": "developerspace",//No I18N
            "display_name": translate("common.developer.space"),//No I18N
            "modules": [
            			{
                        					"groups": {//No I18N
                        						"id":"aecustomactiongroups",//No I18N
                        						"modules":["csf","gff"]//No I18N
                        					}
                        				},
                        "integrationkey"],//No I18N
		},{
            "id": "dataadminsetting",//No I18N
            "display_name": translate("admin.audit.data.administration"),//No I18N
            "modules": ["userauditlog"] //No I18N
        }
	],

};
function adminAllEntite(mode) {
	var adminmodulelinks = {
		"instancesettings": {//No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk.instancesettings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=instancesettings" //No I18N
		},
		"organizationdetails": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk.organization"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=orgdetails" //No I18N
		},
		"mailserversettings": { //No I18N
			"hideintabui": true, //No I18N
			"display_name": (mode == "new") ? translate("sdp.admin.email.incoming") : translate("sdp.dc.dcmenus.admin.mail_server_settings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=email" //No I18N
		},
		"sms_configurations": { //No I18N
			"display_name": translate("admin.sms_conf"), //No I18N
			"url": "/app#/admin/sms_configurations" //No I18N
		},
		"regions": { //No I18N
			"display_name": translate("sdp.gettingstarted.subhead2.organization.regions"), //No I18N
			"url": "/app#/admin/modules/regions" //No I18N
		},
		"sites": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk.site"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=site" //No I18N
		},
		"operational-hours": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk.operatinghours"), //No I18N
			"url": "/app#/admin/operational-hours" //No I18N
		},
		"holidays": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk.holidays"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=holidays" //No I18N
		},
		"departments": { //No I18N
			"display_name": translate("sdp.gettingstarted.subhead2.organization.departments"), //No I18N
			"url": "/app#/admin/modules/departments" //No I18N
		},
		"department": { //No I18N
            "parentkey": true,//No i18n
            "display_name": (sdp_app.IS_SDP && mode == 'new') ? translate("sdp.inventory.wsDetailView.ownerDetails.dept") : translate("department.additional.fields"), //No I18N
            "url": "/app#/admin/additional-fields/department" //No I18N
		},
		"organizationalroles": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk.orgroles"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=orgroles" //No I18N
		},
		"servicelevelagreements": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.newrequest") : translate("sdp.admin.leftpanel.helpdesk.sla"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=sla" //No I18N
		},
		"notificationrules": { //No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("sdp.contract.printView.notifyRules"), //No I18N
			"url": (sdp_app.IS_AE) ? "/SetUpWizard.do?forwardTo=notification" : "/SetUpWizard.do?forwardTo=notDefconfig" //No I18N
		},
		"windowsdomainscan": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.assetmgmt.windowsscan"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=domain" //No I18N
		},
		"roles": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.users.role"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=role" //No I18N
		},
		"useradditionalfields": { //No I18N
			"display_name": translate("sdp.admin.additionalfields.user.leftnavtext"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=requesterUDF" //No I18N
		},
		"requesters": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.users"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=requester" //No I18N
		},
		"technicians": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.users.technician"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=technician" //No I18N
		},
		"support_groups": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk.queues"), //No I18N
			"url": "/app#/admin/modules/support_groups" //No I18N
		},
		"support_group": { //No I18N
			"parentkey": true,//No i18n
            "display_name": (mode == "new") ? translate("sdp.admin.leftpanel.helpdesk.queues") : translate("admin.group.udf"), //No I18N
			"url": "/app#/admin/additional-fields/support_group" //No I18N
		},
		"group-roles": { //No I18N
			"display_name": translate("grouprole.pl"), //No I18N
			"url": "/app#/admin/modules/group-roles" //No I18N
		},
		"usergroups": { //No I18N
			"display_name": translate("sdp.admin.group.user"), //No I18N
			"url": "/app#/admin/modules/usergroups" //No I18N
		},
		"activedirectory": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.users.activedirectory"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=activeDirectory" //No I18N
		},
		"ldap": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.users.LDAP"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=LDAP" //No I18N
		},
		"azuread": { //No I18N
        			"display_name": translate("azure.ad.import"), //No I18N
        			"url": "/app#/admin/azuread" //No I18N
        		},
		"oauth-providers": { //No I18N
			"display_name": translate("auth.oauth.providers"), //No I18N
			"url": "/app#/admin/oauth-providers" //No I18N
		},
        "sso": { //No I18N
			"display_name": translate("sso.title"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=sso" //No I18N
		},
		"leavetypes": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk.leavetype"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=leaveType" //No I18N
		},
		"technicianautoassign": { //No I18N
			"display_name": translate("sdp.admin.techautoassign"), //No I18N
			"url": "/app#/admin/technicianautoassign" //No I18N
		},
		"category": { //No I18N
			"display_name": translate("sdp.reportcols.mod1.categoryname"), //No I18N
			"url": "/app#/admin/modules/category" //No I18N
		},
		"status": { //No I18N
			"display_name": translate("sdp.itil.common.service.item.status"), //No I18N
			"url": "/app#/admin/modules/status" //No I18N
		},
		"level": { //No I18N
			"display_name": translate("sdp.reportcols.mod1.levelname"), //No I18N
			"url": "/app#/admin/modules/level" //No I18N
		},
		"mode": { //No I18N
			"display_name": translate("sdp.requests.common.mode"), //No I18N
			"url": "/app#/admin/modules/mode" //No I18N
		},
		"impact": { //No I18N
            "display_name": translate("sdp.problem.impact"), //No I18N
            "url": "/app#/admin/modules/impact" //No I18N
        },
        "urgency": { //No I18N
            "display_name": translate("sdp.admin.leftpanel.helpdesk.urgency"), //No I18N
            "url": "/app#/admin/modules/urgency" //No I18N
        },
        "priority": { //No I18N
            "display_name": translate("sdp.itil.common.priority"), //No I18N
            "url": "/app#/admin/modules/priority" //No I18N
        },
		"prioritymatrix": { //No I18N
			"display_name": translate("sdp.admin.prioritymatrix.prioritymatrix"), //No I18N
			"url": "/app#/admin/modules/prioritymatrix" //No I18N
		},
		"requesttype": { //No I18N
			"display_name": translate("sdp.requests.common.requesttype"), //No I18N
			"url": "/app#/admin/modules/requesttype" //No I18N
		},
		"worklogtypes": { //No I18N
			"display_name": translate("sdp.requests.common.worklogtype"), //No I18N
			"url": "/app#/admin/modules/worklogtypes" //No I18N
		},
		"worklog-templates": { //No I18N
            "display_name": translate("worklog.templates"), //No I18N
        	"url": "/app#/admin/modules/worklog-templates" //No I18N
        },
		"tasktypes": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.task.tasktypes"), //No I18N
			"url": "/app#/admin/modules/tasktypes" //No I18N
		},
		"task-templates": { //No I18N
			"display_name": translate("sdp.admin.tasktemplate"), //No I18N
			"url": "/app#/admin/task-templates" //No I18N
		},
		"taskclosingrules": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.task") : translate("sdp.admin.taskclosingrules"), //No I18N
			"url": "/app#/admin/modules/taskclosingrules" //No I18N
		},
		"taskcustomtriggers": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.task") : translate("sdp.admin.task.customtrigger"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=taskautoaction" //No I18N
		},
		"tcf": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.task") : translate("dre.task.title"), //No I18N
			"url": "/app#/admin/custom-functions/tcf/custom-actions" //No I18N
		},
		"worklog": { //No I18N
        	"parentkey": true,//No i18n
        	"display_name": (mode == "new") ? translate("sdp.requests.common.worklog") : translate("sdp.admin.leftnav.WorkLogAdditionalFields"), //No I18N
        	"url": "/app#/admin/additional-fields/worklog" //No I18N
        },
		"checklists": { //No I18N
			"display_name": translate("sdp.header.checklist"), //No I18N
			"url": "/app#/admin/checklists" //No I18N
		},
		"announcement-types": { //No I18N
			"display_name": translate("announcement.type"), //No I18N
			"url": "/app#/admin/modules/announcement-types" //No I18N
		},
		"incident-templates": { //No I18N
			"display_name": translate("common.incident.template"), //No I18N
			"url": "/app#/admin/incident-templates" //No I18N
		},
		"fafr-incident-templates": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.newrequest") : translate("sdp.overview.requestMgmt.fieldAndFormRules.title"), //No I18N
			"url": "/app#/admin/fafr-incident-templates" //No I18N
		},
		"request": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.request") : translate("sdp.admin.leftpanel.helpdesk.requestcustomfields"), //No I18N
			"url": "/app#/admin/additional-fields/request" //No I18N
		},
		"requestclosurecode": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.request") : translate("sdp.request.closurecode"), //No I18N
			"url": "/app#/admin/modules/requestclosurecode" //No I18N
		},
		"requestclosingrules": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.request") : translate("sdp.admin.leftpanel.helpdesk.closerequestrule"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=closerequestfilter" //No I18N
		},
		"resolution-template": { //No I18N
			"display_name": translate("sdp.admin.resolutiontemplate"), //No I18N
			"url": "/app#/admin/modules/resolution-template" //No I18N
		},
		"replytemplate": { //No I18N
			"display_name": translate("sdp.admin.replytemplate"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=ReplyTemplate" //No I18N
		},
		"requestcustommenu": { //No I18N
			"display_name": (mode == "new") ? translate("common.request") : translate("sdp.request.externalaction"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=externalMenuAction" //No I18N
		},
		"customtriggers": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.request") : translate("sdp.request.externalaction.autoaction"), //No I18N
			"url": "/app#/admin/modules/customtriggers" //No I18N
		},
		"cmbusinessrules": { //No I18N
             "parentkey": true,//No i18n
             "display_name": (mode == "new") ? translate("custom.customModule") : translate("business.rules.suffix", [translate("custom.customModule")]), //No I18N
             "url": "/app#/admin/modules/cmbusinessrules" //No I18N
         },
         "cmcustomtriggers": { //No I18N
             "parentkey": true,//No i18n
             "display_name": (mode == "new") ? translate("custom.customModule") : translate("custom.triggers.suffix", [translate("custom.customModule")]), //No I18N
             "url": "/app#/admin/modules/cmcustomtriggers" //No I18N
         },
        "notecustomtriggers": { //No I18N
            "parentkey": true,//No i18n
            "display_name": (mode == "new") ? translate("sdp.common.note") : translate("custom.triggers.suffix", [translate("sdp.common.note")]), //No I18N
            "url": "/app#/admin/modules/notecustomtriggers" //No I18N
        },
        "notebusinessrules": { //No I18N
            "parentkey": true,//No i18n
            "display_name": (mode == "new") ? translate("sdp.common.note") : translate("business.rules.suffix", [translate("sdp.common.note")]), //No I18N
            "url": "/app#/admin/modules/notebusinessrules" //No I18N
        },
        "notificationcustomtriggers": { //No I18N
            "parentkey": true,//No i18n
            "display_name": (mode == "new") ? translate("sdp.admin.workflow.stencil.notification") : translate("custom.triggers.suffix", [translate("sdp.admin.workflow.stencil.notification")]), //No I18N
            "url": "/app#/admin/modules/notificationcustomtriggers" //No I18N
        },
        "notificationbusinessrules": { //No I18N
            "parentkey": true,//No i18n
            "display_name": (mode == "new") ? translate("sdp.admin.workflow.stencil.notification") : translate("business.rules.suffix", [translate("sdp.admin.workflow.stencil.notification")]), //No I18N
            "url": "/app#/admin/modules/notificationbusinessrules" //No I18N
        },
        "approvalcustomtriggers": { //No I18N
            "parentkey": true,//No i18n
            "display_name": (mode == "new") ? translate("sdp.change.changedetails.approval") : translate("custom.triggers.suffix", [translate("sdp.change.changedetails.approval")]), //No I18N
            "url": "/app#/admin/modules/approvalcustomtriggers" //No I18N
        },
        "approvallevelcustomtriggers": { //No I18N
            "parentkey": true,//No i18n
            "display_name": (mode == "new") ? translate("common.approvallevel") : translate("custom.triggers.suffix", [translate("common.approvallevel")]), //No I18N
            "url": "/app#/admin/modules/approvallevelcustomtriggers" //No I18N
        },
		"rcf": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.request") : translate("dre.request.title"), //No I18N
			"url": "/app#/admin/custom-functions/rcf/custom-actions" //No I18N
		},
		/* Note Custom Function */
        "ntcf": { //No I18N
            "parentkey": true,//No i18n
            "display_name": (mode == "new") ? translate("sdp.common.note") : translate("custom.function.suffix", [translate("sdp.common.note")]), //No I18N
            "url": "/app#/admin/custom-functions/ntcf/custom-actions" //No I18N
        },
        /* Notification Custom Function */
        "ncf": { //No I18N
            "parentkey": true,//No i18n
            "display_name": (mode == "new") ?  translate("sdp.admin.workflow.stencil.notification") : translate("custom.function.suffix", [translate("sdp.admin.workflow.stencil.notification")]), //No I18N
            "url": "/app#/admin/custom-functions/ncf/custom-actions" //No I18N
        },
        /* Approval Level Custom Function  */
        "alcf": { //No I18N
           "parentkey": true,//No i18n
            "display_name": (mode == "new") ? translate("common.approvallevel") : translate("custom.function.suffix", [translate("common.approvallevel")]), //No I18N
           "url": "/app#/admin/custom-functions/alcf/custom-actions" //No I18N
        },
        /* Approval Custom Function  */
        "acf": { //No I18N
           "parentkey": true,//No i18n
            "display_name": (mode == "new") ? translate("sdp.change.changedetails.approval") : translate("custom.function.suffix", [translate("sdp.change.changedetails.approval")]), //No I18N
           "url": "/app#/admin/custom-functions/acf/custom-actions" //No I18N
        },
		"chats": { //No I18N
			"display_name": translate("chat.settings"), //No I18N
			"url": "/app#/admin/chats/settings" //No I18N
		},
		"rlc": { //No I18N
			"display_name": translate("admin.rlc"), //No I18N
			"url": "/app#/admin/rlc" //No I18N
		},
		"businessrules": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.newrequest") : translate("sdp.admin.rule.addrule.rules"), //No I18N
			"url": "/app#/admin/modules/businessrules" //No I18N
		},
		"request_timer": { //No I18N
        			"display_name": translate("request.timer.action"), //No I18N
        			"url": "/app#/admin/modules/request_timer" //No I18N
        		},
		"problemadditionalfields": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.newproblem") : translate("sdp.admin.problemcustomfields.title"), //No I18N
			"url": "/app#/admin/additional-fields/problem" //No I18N
		},
		"problem-templates": { //No I18N
			"display_name": translate("admin.problemconf.template"), //No I18N
			"url": "/app#/admin/problem-templates" //No I18N
		},
		"problemclosurerules": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.newproblem") : translate("sdp.admin.leftpanel.helpdesk.probclosefield"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=problemmanclose" //No I18N
		},
		"problemcustomtriggers": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.newproblem") : translate("common.newproblem")+" "+translate("sdp.request.externalaction.autoaction"), //No I18N
			"url": "/app#/admin/modules/problemcustomtriggers" //No I18N
		},
		"pbcf": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.newproblem") : translate("common.newproblem")+" "+translate("dre.custom.function"), //No I18N
			"url": "/app#/admin/custom-functions/pbcf/custom-actions" //No I18N
		},
		"changetypes": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk.changetype"), //No I18N
			"url": "/app#/admin/modules/changetypes" //No I18N
		},
		"risk": { //No I18N
			"display_name": translate("sdp.admin.change.risk"), //No I18N
			"url": "/app#/admin/modules/risk" //No I18N
		},
		"reasonforchange": { //No I18N
			"display_name": translate("sdp.admin.reasonforchange"), //No I18N
			"url": "/app#/admin/modules/reasonforchange" //No I18N
		},
		"cabs": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk.cab"), //No I18N
			"url": "/app#/admin/modules/cabs" //No I18N
		},
		"changeroles": { //No I18N
			"display_name": translate("sdp.admin.change.changeroles"), //No I18N
			"url": "/app#/admin/modules/changeroles" //No I18N
		},
		"change-stages": { //No I18N
			"display_name": (mode == "new") ? translate("sdp.admin.change.stageandstatus") : translate("admin.change.header.change-stage-status"), //No I18N
			"url": "/app#/admin/modules/change-stages" //No I18N
		},
		"cwf": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.change") : translate("sdp.admin.changeworkflow"), //No I18N
			"url": "/app#/admin/modules/cwf" //No I18N
		},
		"changeadditionalfields": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.change") : translate("sdp.admin.changecustomfields.title"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=changeudf" //No I18N
		},
		"change-templates": { //No I18N
			"display_name": (mode == "new") ? translate("sdp.admin.changetemplate") : translate("sdp.admin.changetemplate"), //No I18N
			"url": "/app#/admin/change-templates" //No I18N
		},
		"changeclosurecode": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.change") : translate("sdp.admin.change.changeclosurecode"), //No I18N
			"url": "/app#/admin/modules/changeclosurecode" //No I18N
		},
					"change-deploymentimpacts": { //No I18N
                			"display_name": translate("admin.releaseconf.downtime_type"), //No I18N
                			"url": "/app#/admin/modules/change-deploymentimpacts" //No I18N
                		},
		"change-closurerule": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.change") : translate("sdp.admin.leftpanel.helpdesk.changeclosefield"), //No I18N
			"url": "/app#/admin/modules/change-closurerule" //No I18N
		},
		"changesla": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.change") : translate("sdp.change.sla.admin.lbl"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=changeslalistview" //No I18N
		},
		"changecustomtriggers": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.change") : translate("sdp.admin.change.customtrigger"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=changeautoaction" //No I18N
		},
		"ccf": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.change") : translate("dre.change.title"), //No I18N
			"url": "/app#/admin/custom-functions/ccf/custom-actions" //No I18N
		},
		"changeconfiguration": { //No I18N
			"parentkey": true,//No i18n
			"display_name": translate("admin.change.configuration"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=changeconfiguration" //No I18N
		},
		"release-stages": { //No I18N
			"display_name": (mode == "new") ? translate("sdp.admin.change.stageandstatus") : translate("admin.releaseconf.stageandstatus"), //No I18N
			"url": "/app#/admin/modules/release-stages" //No I18N
		},
		"release": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.release") : translate("admin.releaseconf.udf"), //No I18N
			"url": "/app#/admin/additional-fields/release" //No I18N
		},
		"release-roles": { //No I18N
			"display_name": translate("admin.releaseconf.roles"), //No I18N
			"url": "/app#/admin/modules/release-roles" //No I18N
		},
		"release-templates": { //No I18N
			"display_name": translate("admin.releaseconf.template"), //No I18N
			"url": "/app#/admin/release-templates" //No I18N
		},
		"rwf": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.release") : translate("admin.releaseconf.workflow"), //No I18N
			"url": "/app#/admin/modules/rwf" //No I18N
		},
		"release-closurecodes": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.release") : translate("admin.releaseconf.closurecode"), //No I18N
			"url": "/app#/admin/modules/release-closurecodes" //No I18N
		},
		"release-closurerule": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.release") : translate("admin.releaseconf.closurerule"), //No I18N
			"url": "/app#/admin/modules/release-closurerule" //No I18N
		},
		"relcf": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.release") : translate("admin.releaseconf.customfunction"), //No I18N
			"url": "/app#/admin/custom-functions/relcf/custom-actions" //No I18N
		},
		"releasecustomtriggers": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.release") : translate("admin.releaseconf.customtrigger"), //No I18N
			"url": "/app#/admin/modules/releasecustomtriggers" //No I18N
		},
		"space-amenities": { //No I18N
			"display_name": translate("space.amenities"), //No I18N
			"url": "/app#/admin/modules/space-amenities" //No I18N
		},
		"space-criticalities": { //No I18N
			"display_name": translate("space.criticalities"), //No I18N
			"url": "/app#/admin/modules/space-criticalities" //No I18N
		},
		"room-layouts": { //No I18N
			"display_name": translate("room.layouts"), //No I18N
			"url": "/app#/admin/modules/room-layouts" //No I18N
		},
		"space-statuses": { //No I18N
			"display_name": translate("space.status"), //No I18N
			"url": "/app#/admin/modules/space-statuses" //No I18N
		},
		"space-units": { //No I18N
			"display_name": translate("space.units"), //No I18N
			"url": "/app#/admin/modules/space-units" //No I18N
		},
		"campus": { //No I18N
			"display_name": translate("campus.templates"), //No I18N
			"url": "/app#/admin/space-templates/campus" //No I18N
		},
		"structure": { //No I18N
			"display_name": translate("structure.templates"), //No I18N
			"url": "/app#/admin/space-templates/structure" //No I18N
		},
		"floor": { //No I18N
			"display_name": translate("floor.templates"), //No I18N
			"url": "/app#/admin/space-templates/floor" //No I18N
		},
		"room": { //No I18N
			"display_name": translate("room.templates"), //No I18N
			"url": "/app#/admin/space-templates/room" //No I18N
		},
		"facility-service-templates": { //No I18N
			"display_name": translate("facility.service.templates"), //No I18N
			"url": "/app#/admin/space-templates/facility-service-templates" //No I18N
		},
		"space": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("space.field") : translate("space.additional.fields"), //No I18N
			"url": "/app#/admin/additional-fields/space" //No I18N
		},
		"facility-service": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("space.facility") : translate("facility.service.additional.fields"), //No I18N
			"url": "/app#/admin/additional-fields/facility-service" //No I18N
		},
		"service-categories": { //No I18N
			"display_name": translate("sdp.itil.common.service.categories.it"), //No I18N
			"url": "/app#/admin/modules/service-categories" //No I18N
		},
		"servicecatalog": { //No I18N
			"display_name": translate("sdp.itil.common.service.catalog"), //No I18N
			"url": "/app#/admin/modules/servicecatalog" //No I18N
		},
		"fafr-service-templates": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("sdp.itil.common.service") : translate("sdp.overview.serviceCatalog.fieldAndFormRules.title"), //No I18N
			"url": "/app#/admin/fafr-service-templates" //No I18N
		},
		"resource-questions": { //No I18N
             "display_name": translate("sdp.admin.service.resourcequestions"), //No I18N
             "url": "/app#/admin/modules/resource-questions" //No I18N
         },
		"resource-sections": { //No I18N
			"display_name": translate("resource.sections"), //No I18N
			"url": "/app#/admin/modules/resource-sections" //No I18N
		},
		"service-SLA": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("sdp.itil.common.service") : translate("sdp.admin.leftpanel.helpdesk.sla"), //No I18N
			"url": "/app#/admin/service-SLA" //No I18N
		},
		"servicecatalogbrules": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("sdp.itil.common.service") : translate("sdp.itil.common.service.catalog") + " - " + translate("sdp.admin.leftpanel.helpdesk.rule"), //No I18N
			"url": "/app#/admin/modules/servicecatalogbrules" //No I18N
		},
		"projecttypes": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.project.projecttypes"), //No I18N
			"url": "/app#/admin/modules/projecttypes" //No I18N
		},
		"projectroles": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.project.projectroles"), //No I18N
			"url": "/app#/admin/modules/projectroles" //No I18N
		},
        "projectsettings": { //No I18N
            "display_name": translate("admin.leftpanel.project.settings"), //No I18N
            "url": "/app#/admin/projectsettings" //No I18N
        },
		"projectstatus": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.project.projectstatus"), //No I18N
			"url": "/app#/admin/modules/projectstatus" //No I18N
		},
		"project": { //No I18N
        	"parentkey": true,//No i18n
        	"display_name": (mode == "new") ? translate("common.project") : translate("sdp.admin.project.customfields.title"), //No I18N
        	"url": "/app#/admin/additional-fields/project" //No I18N
        },
        "task": { //No I18N
            "parentkey": true,//No i18n
            "display_name": (mode == "new") ? translate("common.task") : translate("admin.taskconf.udf"), //No I18N
            "url": "/app#/admin/additional-fields/task" //No I18N
        },
		"project-templates": { //No I18N
			"display_name": translate("project.templates"), //No I18N
			"url": "/app#/admin/project-templates" //No I18N
		},
		"projectcustomtriggers": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.project") : translate("sdp.admin.leftpanel.project.projectcustomtrigger"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=projectautoaction" //No I18N
		},
		"pcf": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.project") : translate("dre.project.title"), //No I18N
			"url": "/app#/admin/custom-functions/pcf/custom-actions" //No I18N
		},
		"cmcf": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("custom.customModule") : translate("dre.custom.module.title"), //No I18N
			"url": "/app#/admin/custom-functions/cmcf/custom-actions" //No I18N
		},
		"windowsagentconfiguration": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.assetmgmt.windowsscan.scansetting"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=agentsettings" //No I18N
		},
		"credentialslibrary": { //No I18N
			"display_name": translate("sdp.admin.credentialslibrary.title"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=credentials" //No I18N
		},
		"networkscan": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.assetmgmt.networkscan"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=network" //No I18N
		},
		"auditsettings": { //No I18N
			"display_name": translate("sdp.admin.discovery.schedulescan"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=netDefconfig" //No I18N
		},
		"distributedassetscan": { //No I18N
			"display_name": translate("sdp.common.admin.DistributedAssetScan"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=ExportImport" //No I18N
		},
		"remotecontroltools": { //No I18N
			"display_name": translate("ae.admin.discovery.rcsetting"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=rcSettings" //No I18N
		},
		"scansettings": { //No I18N
			"display_name": translate("sdp.admin.discovery.scansettings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=aesettings" //No I18N
		},
		"sccmsettings": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/thirdparty", //No I18N
			"display_name": translate("sdp.discovery.sccm.sccmadminoption"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=sccmsettings" //No I18N
		},
		"solarwindssettings":{ //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/thirdparty", //No I18N
			"display_name": translate("sdp.discovery.swintegration.swadminoption"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=solarwindssettings" //No I18N
		},
		"snmpConfigurations": { //No I18N
			"display_name": translate("sdp.admin.snmp.snmpconfiguration"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=snmpConfigurations" //No I18N
		},
		"office365": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/thirdparty", //No I18N
			"display_name": translate("ae.admin.o365"), //No I18N
			"url": "/app#/admin/modules/office365" //No I18N
		},
		"all_product_types": { //No I18N
			"display_name": translate("sdp.admin.product.listview.type"), //No I18N
			"url": "/app#/admin/all_product_types" //No I18N
		},
		"product": { //No I18N
			"display_name": translate("sdp.header.newproduct"), //No I18N
			"url": "/app#/admin/modules/product" //No I18N
		},
		"asset_sync_rules": { //No I18N
			"display_name": mode === "new" ? translate("ae.cmdb.sync.rules") : translate("asset.sync.rule"), //No I18N
			"url": "/app#/admin/asset_modules/asset_sync_rules" //No I18N
		},
		"vendor": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.assetmgmt.vendor"), //No I18N
			"url": "/app#/admin/modules/vendor" //No I18N
		},
		"vendor_udf": { //No I18N
        	"parentkey": true,//No i18n
        	"display_name": (mode == "new") ? translate("sdp.admin.leftpanel.assetmgmt.vendor") : translate("admin.vendorconf.udf"), //No I18N
        	"url": "/app#/admin/additional-fields/vendor_udf" //No I18N
        },
		"asset": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("sdp.header.asset") : translate("sdp.admin.leftpanel.assetmgmt.assetcustomfields"), //No I18N
			"url": "/app#/admin/additional-fields/asset" //No I18N
		},
		"assetImport": { //No I18N
			"display_name": translate("sdp.common.admin.assetmgt.ImportassetFromCSV"), //No I18N
			"url": "/servlet/ImportServlet?submitaction=loadImportTab&module=asset_asset" //No I18N
		},
		"assetstate": { //No I18N
			"display_name": translate("sdp.admin.assetmgt.resourcestate"), //No I18N
			"url": "/app#/admin/modules/assetstate" //No I18N
		},
		"ci-types": { //No I18N
			"display_name": translate("ae.cmdb.citypes.label"), //No I18N
			"url": "/app#/admin/ci-types/" //No I18N
		},
		"ci_status": { //No I18N
			"display_name": translate("sdp.api.cmdb.ci.status"), //No I18N
			"url": "/app#/admin/modules/ci_status" //No I18N
		},
		"cmdb": { //No I18N
			"parentkey": true,//No i18n
			"display_name": mode === "new" ? translate("common.cmdb") : translate("cmdb.udf.title"), //No I18N
			"url": "/app#/admin/additional-fields/cmdb" //No I18N
		},
		"cmdbmanagement": { //No I18N
			"display_name": translate("common.cmdb"), //No I18N
			"url": "/app#/admin/ci-types/" //No I18N
		},
		"sync-rules": {//No I18N
		 "display_name": mode === "new" ? translate("ae.cmdb.sync.rules") : translate("cmdb.sync.rule"), //No I18N
			"url": "/app#/admin/ci-types/sync-rules" //No I18N
		},
		"softwaretype": { //No I18N
			"display_name": translate("sdp.inventory.newSW.swType"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=softwareTypeView" //No I18N
		},
		"softwarecategory": { //No I18N
			"display_name": translate("sdp.inventory.detailWS.SWcategory"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=softwareCategoryView" //No I18N
		},
		"licenseadditionalfields": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.license") : translate("sdp.admin.adminhome.licenseudf"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=licenseudf" //No I18N
		},
		"softwarelicensetypes": { //No I18N
			"display_name": translate("sdp.admin.software.license.types"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=licenseTypes" //No I18N
		},
		"agreementadditionalfields": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.agreement") : translate("sdp.admin.software.agreement.additionalfields"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=agreementudf" //No I18N
		},
		"importlicensesfromcsv": { //No I18N
			"display_name": translate("sdp.admin.software.license.import"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=importswlicenses" //No I18N
		},
		"softwaremetering": { //No I18N
			"display_name": translate("sdp.inventory.home.softwaremetering"), //No I18N
			"url": "/app#/admin/modules/softwaremetering" //No I18N
		},
		"purchaseadditionalfields": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.purchase") : translate("sdp.common.admin.general.PurchaseAdditionalFields"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=purchaseudf" //No I18N
		},
		"purchaserequestadditionalfields": { //No I18N
			"display_name": translate("sdp.purchase.request.admin.settings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=prsettings" //No I18N
		},
		"purchaserequestdefaultvalues": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.purchase.request") : translate("sdp.purchase.request.additionalfields"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=purchaserequestudf" //No I18N
		},
		"purchasedefaultvalues": { //No I18N
			"display_name": translate("sdp.admin.purchasedefault.header"), //No I18N
			"url": "/app#/admin/modules/purchasedefaultvalues" //No I18N
		},
		"costcenter": { //No I18N
			"display_name": translate("sdp.admin.addnew.costcenterlabel"), //No I18N
			"url": "/app#/admin/modules/costcenter" //No I18N
		},
		"glcode": { //No I18N
			"display_name": translate("sdp.admin.addnew.glcodelabel"), //No I18N
			"url": "/app#/admin/modules/glcode" //No I18N
		},
		"currency": { //No I18N
			"display_name": translate("ae.currency"), //No I18N
			"url": "/app#/admin/modules/currency" //No I18N
		},
		"vendorServices": { //No I18N
			"display_name": translate("ae.admin.vendorServices"), //No I18N
			"url": "/app#/admin/modules/vendorServices" //No I18N
		},
		"contracttype": { //No I18N
			"display_name": translate("ae.admin.contract.contractType"), //No I18N
			"url": "/app#/admin/modules/contracttype" //No I18N
		},
		"contractadditionalfields": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.newcontract") : translate("sdp.admin.leftnav.ContractAdditionalFields"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=contractsUDF" //No I18N
		},
		"surveysettings": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.survey.configuration"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=surveyconfig" //No I18N
		},
		"surveyglobalrules": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.survey.excluderules"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=surveyglobalrules" //No I18N
		},
		"emailsettings": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.survey.emailsettings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=emailsettings" //No I18N
		},
		"surveyreports": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.survey.reports"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=surveyreports" //No I18N
		},
		"selfserviceportalsettings": { //No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("sdp.admin.leftpanel.general.settings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=settings" //No I18N
		},
		"securitysettings": { //No I18N
			"display_name": translate("sdp.admin.security.settings.key"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=securitysettings" //No I18N
		},
		"importssl": { //No I18N
			"display_name": translate("sslimport.importsslcer"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=importssl" //No I18N
		},
		"ui-customizations" : { //No I18N
            "hideintabui": true, //No I18N
			"display_name": translate("admin.uicustomization"), //No I18N
			"url": "/app#/admin/ui-customizations/themes" //No I18N
		},
		"zia-bot-group" : { //No I18N
			"display_name": translate("zia.bot.label"), //No I18N
			"url": "/app#/admin/modules/zia-bot-action" //No I18N
		},
		"themes": { //No I18N
			"display_name": (sdp_app.IS_SDP) ? translate("sdp.app.settings.themes") : translate("sdp.admin.css.title"), //No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"url": "/app#/admin/ui-customizations/themes" //No I18N
		},
		"browser-title": { //No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("admin.browserTitle"), //No I18N
			"url": "/app#/admin/ui-customizations/browser-title" //No I18N
		},
		"manage-tabs": { //No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("webtab.manage.tab"), //No I18N
			"url": "/app#/admin/ui-customizations/manage-tabs" //No I18N
		},
		"landing-page": { //No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("instance.landing.page.title"), //No I18N
			"url": "/app#/admin/ui-customizations/landing-page" //No I18N
		},
		"zia-bot-button": { //No I18N
			"parentkey": true, //No I18N
			"parentkey_pos": "left", //No I18N
			"display_name": translate("common.buttons"), //No I18N
			"url": "/app#/admin/modules/zia-bot-button", //No I18N
		},
      	"rta-config": { //No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("admin.rtaconfigtab"), //No I18N
			"url": "/app#/admin/ui-customizations/rta-config" //No I18N
		},
		"attachment-settings": { //No I18N
			"display_name": translate("admin.ssp.attachmentsettings"), //No I18N
			"url": "/app#/admin/attachment-settings" //No I18N
		},
		"two-factor-auth": { //No I18N
			"display_name": translate("ads.login.twofactor.two_factor_authentication_heading"), //No I18N
			"url": "/app#/admin/two-factor-auth" //No I18N
		},
		"auto-update": { //No I18N
        	"display_name": translate("au.au"), //No I18N
        	"url": "/app#/admin/auto-update" //No I18N
        	},
		"dreconnections":{ //No I18N
       	   "display_name": translate("dre.connections.title"), //No I18N
       	   "url": "/app#/admin/dreconnections" //No I18N
        },
		"backupscheduling": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.general.backupschedule"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=backupschedule" //No I18N
		},
		"dataarchiving": { //No I18N
			"display_name": translate("sdp.archive.adminSetup.dataArchivingTitle"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=archive" //No I18N
		},
		"custom-schedules": { //No I18N
			"display_name": translate("admin.custom.schedules"), //No I18N
			"url": "/app#/admin/custom-schedules" //No I18N
		},
		"csf": { //No I18N
			"parentkey": true,//No i18n
			"display_name": translate("admin.custom.schedules.function"), //No I18N
			"url": "/app#/admin/custom-functions/csf/custom-actions" //No I18N
		},
		"cbf": { //No I18N
			"parentkey": true,//No i18n
			"display_name": translate("admin.callback.custom.function"), //No I18N
			"url": "/app#/admin/custom-functions/cbf/custom-actions" //No I18N
		},
		"zcf": { //No I18N
            "parentkey": true,//No i18n
            "display_name": translate("admin.custom.zia.function"), //No I18N
            "url": "/app#/admin/custom-functions/zcf/custom-actions" //No I18N
        },
		"optood": { //No I18N
			"display_name": translate("admin.optood"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=optood" //No I18N
		},
		"api": { //No I18N
			"display_name": translate("sdp.admin.api.key.head"), //No I18N
			"url": "/app#/admin/api" //No I18N
		},
		"custom-modules": { //No I18N
			"display_name": translate("custom.modules"), //No I18N
			"url": "/app#/admin/custom-modules" //No I18N
		},
		"apisettings": { //No I18N
			"display_name": translate("sdp.admin.api.key.head"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=apisettings" //No I18N
		},
		"proxysettings": { //No I18N
			"display_name": translate("sdp.dc.dcmenus.admin.proxy_settings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=ProxySettings" //No I18N
		},
		"PrivacySettings": { //No I18N
			"display_name": translate("admin.privacysettings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=PrivacySettings" //No I18N
		},
		"privacy-settings": { //No I18N
			"display_name": translate("admin.privacysettings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=privacy-settings" //No I18N
		},
		"PerformanceSettings": { //No I18N
			"display_name": translate("admin.performancesettings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=PerformanceSettings" //No I18N
		},
		"translations": { //No I18N
			"display_name": translate("sdp.admin.translation.title"), //No I18N //"sdp.admin.translation.title" + (M)DHSettings.getInstance().isMDHSetup() ? ".mdh" : "//No I18N
			"url": "/SetUpWizard.do?forwardTo=translations" //No I18N
		},
		"pagescripts": { //No I18N
			"display_name": translate("admin.pagescripts"), //No I18N
			"url": "/app#/admin/pagescripts" //No I18N
		},
		"aesm-fosconfiguration": { //No I18N
        	"display_name": translate("sdp.admin.leftpanel.fos.configuration"), //No I18N
        	"url": "/SetUpWizard.do?forwardTo=fosconfiguration" //No I18N
        },
        "aesm-fosreplication": { //No I18N
        	"display_name": translate("sdp.admin.leftpanel.fos.replication"), //No I18N
        	"url": "/SetUpWizard.do?forwardTo=fosreplication" //No I18N
        },
		"ziaconfigurations": { //No I18N
			"display_name": translate("admin.ziaconfiguration"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=ziaconfiguration" //No I18N
		},
		"zia-bot-action": { //No I18N
			"parentkey": true, //No I18N
			"parentkey_pos": "left", //No I18N
			"display_name": translate("sdp.common.actions"), //No I18N
			"url": "/app#/admin/modules/zia-bot-action" //No I18N
		},
        "embed-zia-bot": { //No I18N
			"parentkey": true, //No I18N
			"parentkey_pos": "left", //No I18N
			"display_name": translate("zia.bot.embed"), //No I18N
			"url": "/app#/admin/modules/embed-zia-bot" //No I18N
		},
		"admanagerplus": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/manageengine", //No I18N
			"display_name": translate("common.admp"), //No I18N
			"url": "/app#/admin/admanagerplus" //No I18N
		},
		"adselfserviceplus": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/manageengine", //No I18N
			"display_name": translate("meintegration.adselfservice.title"), //No I18N
			"url": "/app#/admin/adselfserviceplus" //No I18N
		},
		"eventloganalyzer": { //No I18N
            "hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/manageengine", //No I18N
			"display_name": translate("meintegration.eventloganalyzer.title"), //No I18N
			"url": "/app#/admin/eventloganalyzer" //No I18N
		},
		"zohoreportsintegration": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/manageengine", //No I18N
			"display_name": translate("sdp.admin.zreports.zrconfiguration"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=zrconfig" //No I18N
		},
		"uemproducts": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/manageengine", //No I18N
			"display_name": translate("sdp.uem.products"), //No I18N
			"url": "/app#/admin/uemproducts" //No I18N
		},
		"mobiledevicemanagerplus": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/manageengine", //No I18N
			"display_name": translate("meintegration.mdmp.title"), //No I18N
			"url": "/app#/admin/mobiledevicemanagerplus" //No I18N
		},
		"opmanager": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/manageengine", //No I18N
			"display_name": translate("meintegration.opmanager.title"), //No I18N
			"url": "/app#/admin/opmanager" //No I18N
		},
		"appmanager": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/manageengine", //No I18N
			"display_name": translate("meintegration.apm.title"), //No I18N
			"url": "/app#/admin/appmanager" //No I18N
		},
		"passwordmanagerpro": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/manageengine", //No I18N
			"display_name": translate("pmp.title"), //No I18N
			"url": "/app#/admin/passwordmanagerpro" //No I18N
		},
        "pam360": { //No I18N
            "hideintabui": true, //No I18N
            "activeurl": "/app#/admin/integrations/manageengine", //No I18N
            "display_name": translate("pam360.title"), //No I18N
            "url": "/app#/admin/pam360" //No I18N
        },
		"site24x7": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/manageengine", //No I18N
			"display_name": translate("common.site24x7"), //No I18N
			"url": "/app#/admin/site24x7" //No I18N
		},
		"custom-link": { //No I18N
			"display_name": translate("admin.zoho.creator.app"), //No I18N //String creatorLinksName = GlobalConfigUtil.getInstance().getGlobalConfigValue("display_name", "CreatorLinks");//No I18N
			"url": "/app#/admin/custom-link" //No I18N
		},
		"jira": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/thirdparty", //No I18N
			"display_name": translate("jira.title"), //No I18N
			"url": "/app#/admin/jira" //No I18N
		},
		"microsoftteams": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/thirdparty", //No I18N
			"display_name": translate("msteams.title"), //No I18N
			"url": "/app#/admin/microsoftteams" //No I18N
		},
		"whatsapp": { //No I18N
             "hideintabui": true, //No I18N
             "activeurl": "/app#/admin/integrations/thirdparty", //No I18N
             "display_name": translate("whatsapp.title"), //No I18N
             "url": "/app#/admin/whatsapp" //No I18N
         },
         "officeaddin": { //No I18N
             "hideintabui": true, //No I18N
             "activeurl": "/app#/admin/integrations/thirdparty", //No I18N
             "display_name": translate("outlookaddin.title"), //No I18N
             "url": "/app#/admin/officeaddin" //No I18N
         },
		 "msteams.widget": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/widgets", //No I18N
			"display_name": translate("msteams.widget.title"), //No I18N
			"isWidget":true, //No I18N
			"url": "https://help.servicedeskplus.com/ms-teams-sdp-extension"//No i18n
		},
		"ai.widget": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/widgets", //No I18N
			"display_name": translate("ai.widget.title"), //No I18N
			"isWidget":true, //No I18N
			"url": "https://help.servicedeskplus.com/ai-assistant-widget"//No i18n
		},
		"jira.widget": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/widgets", //No I18N
			"display_name": translate("jira.widget.title"), //No I18N
			"isWidget":true, //No I18N
			"url": "https://help.servicedeskplus.com/jira-custom-widget"//No i18n
		},
		"zoom.widget": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/widgets", //No I18N
			"display_name": translate("zoom.widget.title"), //No I18N
			"isWidget":true, //No I18N
			"url": "https://help.servicedeskplus.com/zoom-sdp-extension"//No i18n
		},
		"zohomeet.widget": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/widgets", //No I18N
			"display_name": translate("zohomeet.widget.title"), //No I18N
			"isWidget":true, //No I18N
			"url": "https://help.servicedeskplus.com/zoho-meeting-custom-widget"//No i18n
		},
		"teamviewer.widget": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/widgets", //No I18N
			"display_name": translate("teamviewer.widget.title"), //No I18N
			"isWidget":true, //No I18N
			"url": "https://help.servicedeskplus.com/team-viewer-sdp-extension"//No i18n
		},
		"confluence.widget": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/widgets", //No I18N
			"display_name": translate("confluence.widget.title"), //No I18N
			"isWidget":true, //No I18N
			"url": "https://help.servicedeskplus.com/confluence-sdp-extension"//No i18n
		},
		"keymanagerplus": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/manageengine", //No I18N
			"display_name": translate("kmp.title"), //No I18N
			"url": "/app#/admin/keymanagerplus" //No I18N
		},
		"outlookoffice": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/thirdparty", //No I18N
			"display_name": translate("outlookoffice.title"), //No I18N
			"url": "/app#/admin/outlookoffice" //No I18N
		},
		"mscalendar": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/thirdparty", //No I18N
			"display_name": translate("mscalendar.title"), //No I18N
			"url": "/app#/admin/mscalendar" //No I18N
		},
		"telephony": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/thirdparty", //No I18N
			"display_name": translate("com.me.admin.telephony.title"), //No I18N
			"url": "/app#/admin/telephony" //No I18N
		},
		"zohotelephony": { //No I18N
			"hideentitytitle": true, //No I18N
			"parentkey": true,//No i18n
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/thirdparty", //No I18N
			"display_name": translate("common.zohotelephony"), //No I18N
			"url": "/app#/admin/telephony" //No I18N
		},
		"chatgpt": { //No I18N
			"hideintabui": true, //No I18N
			"activeurl": "/app#/admin/integrations/thirdparty", //No I18N
			"display_name": translate("chatgpt.label"), //No I18N
			"url": "/app#/admin/chatgpt"//No i18n
		},
		"integrationkey": { //No I18N
			"display_name": translate("sdp.admin.integration.name.key"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=integrationkey" //No I18N
		},
		"globalvariables" :{ //No I18N
			"display_name": translate("common.admin.globalvariables"), //No I18N
			"url": "/app#/admin/modules/globalvariables" //No I18N
		},
		"webhooks_group":{//No I18N
			"display_name": translate("common.webhooks"), //No I18N
			"url": "/app#/admin/modules/webhooks" //No I18N
		},
		"custom_widget": { //No I18N
			"display_name": translate("common.custom_widget"), //No I18N
			"url": "/app#/admin/modules/custom_widget" //No I18N
		},
		"webhooks":{//No I18N
			"parentkey": true,//No i18n
			"display_name": translate("common.request"), //No I18N
			"url": "/app#/admin/modules/webhooks" //No I18N
		},
		"problem_webhook":{//No I18N
			"parentkey": true,//No i18n
			"display_name": translate("common.newproblem"), //No I18N
			"url": "/app#/admin/modules/problem_webhook" //No I18N
		},
		"change_webhook":{//No I18N
			"parentkey": true,//No i18n
			"display_name": translate("sdp.header.newchange"), //No I18N
			"url": "/app#/admin/modules/change_webhook" //No I18N
		},
		"release_webhook":{//No I18N
			"parentkey": true,//No i18n
			"display_name": translate("common.release"), //No I18N
			"url": "/app#/admin/modules/release_webhook" //No I18N
		},
		"task_webhook":{//No I18N
			"parentkey": true,//No i18n
			"display_name": translate("common.task"), //No I18N
			"url": "/app#/admin/modules/task_webhook" //No I18N
		},
		"project_webhook":{//No I18N
			"parentkey": true,//No i18n
			"display_name": translate("common.project"), //No I18N
			"url": "/app#/admin/modules/project_webhook" //No I18N
		},

		"additionalfields": { //No I18N
			"display_name": translate("sdp.admin.common.addiotnalfield"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=reqUDF" //No I18N
		},
		"user": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (sdp_app.IS_SDP && mode == 'new') ? translate("sdp.helpdesk.common.user") : translate("sdp.admin.additionalfields.user.leftnavtext"), //No I18N
			"url": "/app#/admin/additional-fields/user" //No I18N
			//"url": (sdp_app.IS_SDP) ? "/app#/admin/additional-fields/user" : "/SetUpWizard.do?forwardTo=requesterUDF" //No I18N
		},
		"technician": { //No I18N
			"parentkey": true,//No i18n
			"display_name": (mode == "new") ? translate("common.technician") : translate("sdp.admin.additionalfields.technician.text"), //No I18N
			"url": "/app#/admin/additional-fields/technician" //No I18N
		},

		"helpdesk": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk"), //No I18N
			"url": "/app#/admin/modules/category" //No I18N
		},
		"mailserversetting": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk.mailsettings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=email" //No I18N
		},
		"releasemanagement": { //No I18N
			"display_name": translate("admin.release_conf"), //No I18N
			"url": "/app#/admin/modules/release-stages" //No I18N
		},
		"changemanagement": { //No I18N
			"display_name": translate("sdp.change.license.text"), //No I18N
			"url": "/app#/admin/modules/changetype" //No I18N
		},
		"projectmanagement": { //No I18N
			"display_name": translate("sdp.project.license.text"), //No I18N
			"url": "/app#/admin/modules/projecttypes" //No I18N
		},
		"spacemanagement": { //No I18N
			"display_name": translate("space.mgmt"), //No I18N
			"url": "/app#/admin/modules/space-amenities" //No I18N
		},
		"assetmanagement": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.assetmgmt"), //No I18N
			"url": "/app#/admin/all_product_types" //No I18N
		},
		"associations": { //No I18N
			"display_name": translate("asset.header.associations"), //No I18N
			"hideentitytitle": true, //No I18N
			"url": "/app#/admin/associations" //No I18N
		},
		"association_types": { //No I18N
			"display_name": translate("association.types"), //No I18N
			"url": "/app#/admin/modules/association_types" //No I18N
		},
		"purchasemanagement": { //No I18N
			"display_name": translate("common.purchase.management"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=prsettings" //No I18N
		},
		"contractmanagement": { //No I18N
			"display_name": translate("common.contract.management"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=contractTypeView" //No I18N
		},
		"fafrmanagement": { //No I18N
			"display_name": translate("sdp.overview.requestMgmt.fieldAndFormRules.title"), //No I18N
			"url": "/app#/admin/fafr-incident-templates" //No I18N
		},
		"servicecatalogmanagement": { //No I18N
			"display_name": translate("sdp.itil.common.service.catalog"), //No I18N
			"url": "/app#/admin/modules/service-categories" //No I18N
		},
		"businessrulesgroups": { //No I18N
			"display_name": translate("sdp.admin.rule.addrule.rules"), //No I18N
			"url": "/app#/admin/modules/businessrules" //No I18N
		},
		"slagroups": { //No I18N
			"display_name": translate("sdp.admin.leftpanel.helpdesk.sla"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=sla" //No I18N
		},
		"triggergroups": { //No I18N
			"display_name": translate("sdp.request.externalaction.autoaction"), //No I18N
			"url": "/app#/admin/modules/customtriggers" //No I18N
		},
		"closurerulesgroups": { //No I18N
			"display_name": translate("common.closure.rules"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=closerequestfilter" //No I18N
		},
		"workflowgroups": { //No I18N
			"display_name": translate("common.workflows"), //No I18N
			"url": "/app#/admin/modules/cwf" //No I18N
		},
		"customactiongroups": { //No I18N
			"display_name": translate("dre.custom.function"), //No I18N
			"url": "/app#/admin/custom-functions/rcf/custom-actions" //No I18N
		},
		"aecustomactiongroups": { //No I18N
        	"display_name": translate("dre.custom.function"), //No I18N
        	"url": "/app#/admin/custom-functions/csf/custom-actions" //No I18N
        },
		"globalfunctiongroups": { //No I18N
			"display_name": translate("dre.global.functions"), //No I18N
			"url": "/app#/admin/custom-functions/rcf/global-functions" //No I18N
		},
		"closurecodegroups": { //No I18N
			"display_name": translate("sdp.admin.change.closurecode"), //No I18N
			"url": "/app#/admin/modules/requestclosurecode" //No I18N
		},
		"integrations": {//No I18N
			"display_name": translate("admin.integrations"), //No I18N
			"url": "/app#/admin/integrations/manageengine" //No I18N
		},
		"thirdparty": {//No I18N
			"parentkey": true,//No i18n
			"history" : { //No I18N
				"entity": "integration", //No I18N
				"id": "integrations", //No I18N
				"key": "Integration", //No I18N
			},
			"display_name": translate("common.thirdparty"), //No I18N
			"url": "/app#/admin/integrations/thirdparty" //No I18N
		},
		"manageengine": {//No I18N
			"parentkey": true,//No i18n
			"history" : { //No I18N
				"entity": "integration", //No I18N
				"id": "integrations", //No I18N
				"key": "Integration", //No I18N
			},
			"display_name": translate("common.manageengine"), //No I18N
			"url": "/app#/admin/integrations/manageengine" //No I18N
		},
		"widgets": {//No I18N
			"parentkey": true,//No i18n
			"display_name": translate("sdp.dashboard.customwidget.header.label"), //No I18N
			"url": "/app#/admin/integrations/widgets" //No I18N
		},
		"outgoingmail": { //No I18N
			"hideintabui": true, //No I18N
			"display_name": translate("sdp.admin.email.outgoing"), //No I18N
			"url": "/EMailDef.do?mailType=outgoing&mode=view" //No I18N
		},
		"spamfilter": {//No I18N
			"hideintabui": true, //No I18N
			"display_name": translate("sdp.admin.filter.mail"), //No I18N
			"url": "/FilterDef.do?mode=edit&filterName=MailFilter" //No I18N
		},
		"emailcommand": {//No I18N
			"hideintabui": true, //No I18N
			"display_name": translate("sdp.admin.email.mailparser.tooltip"), //No I18N
			"url": "/EMailDef.do?mailType=mailparser&mode=view" //No I18N
		},
		"delimiter": {//No I18N
			"hideintabui": true, //No I18N
			"display_name": translate("sdp.admin.email.delimiter.tooltip"), //No I18N
			"url": "/EMailDef.do?mailType=delimiter&mode=view" //No I18N
		},
		"custommenu": {//No I18N
			"display_name": translate("common.custom.menu"), //No I18N
			"url": "/EMailDef.do?mailType=delimiter&mode=view" //No I18N
		},
		"advancedportalsettings": { //No I18N
			"hideintabui": true, //No I18N
			"display_name": translate("sdp.admin.leftpanel.general.settings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=settings" //No I18N
		},
		"requestersettings": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.requester"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=settings#requester" //No I18N
		},
		"techniciansettings": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.technician"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=settings#technician" //No I18N
		},
		"attachmentsettings": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.attachment"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=settings#attachment" //No I18N
		},
		"approvalsettings": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("sdp.change.changedetails.approval"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=settings#approval" //No I18N
		},
		"customizationsettings": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("sdp.cpl.scc"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=settings#customize" //No I18N
		},
		"mailserversettingsgroup": { //No I18N
			"hideintabui": true, //No I18N
			"display_name": translate("sdp.dc.dcmenus.admin.mail_server_settings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=email" //No I18N
		},
		"gff": { //No I18N
			"parentkey": true,//No i18n
			"display_name": translate("dre.global.functions"), //No I18N
			"url": "/app#/admin/custom-functions/gff/global-functions" //No I18N
		},
		"request-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.requester"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#request" //No I18N
		},
		"tasks-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.task"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#tasks" //No I18N
		},
		"problem-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.newproblem"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#problem" //No I18N
		},
		"change-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.change"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#change" //No I18N
		},
		"release-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.release"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#release" //No I18N
		},
		"project-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.project"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#project" //No I18N
		},
		"solution-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.newsolution"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#solution" //No I18N
		},
		"space-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("space.field"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#space" //No I18N
		},
		"asset-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.asset"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#asset" //No I18N
		},
		"purchaseNot-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.purchase"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#purchaseNot" //No I18N
		},
		"contract-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.newcontract"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#contract" //No I18N
		},
		"report-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.reports"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#report" //No I18N
		},
		"mobile-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("common.mobile"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#mobile" //No I18N
		},
		"approval-nrules": {//No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("sdp.admin.workflow.stencil.approval"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=notDefconfig#approval" //No I18N
		},
		"portal-customization": { //No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("sdp.home.ssp.customization.sspcustomizationtitle"), //No I18N
			"url": "/SSCustomizeView.do?action=getDashboard" //No I18N
		},
		"product-tour": { //No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"display_name": translate("ssp.helptour.customize.product.tour"), //No I18N
			"url": "/app#/admin/ssp-tour" //No I18N
		},
		"custom-fonts": { //No I18N
			"hideintabui": true, //No I18N
			"hideentitytitle": true, //No I18N
			"parentkey": true,//No i18n
			"display_name": translate("common.custom") + " " + translate("zeditor.fontfamily"), //No I18N
			"url": "/app#/admin/ui-customizations/themes" //No I18N
		},
		"zflowagent":{//No I18N
			"display_name": translate("common.zflowagent"), //No I18N
			"url": "/app#/admin/zflowagent" //No I18N
		},
		"userauditlog":{ //NO I18N
            "display_name": translate("user.audit.title"), //NO I18N
            "url" :"/app#/admin/modules/userauditlog" //NO I18N
        },
			"timesheet":{ //No I18N
			"display_name": translate("sdp.admin.timesheet.settings"), //No I18N
			"url": "/SetUpWizard.do?forwardTo=TimesheetConfig" //No I18N
		},
	};
	if ($customConfig.get().length !== 0 && !adminmodulelinks['custom-configurations']) {
		adminmodulelinks['custom-configurations'] = {//No I18N
			display_name: translate("custom.configurations"), //No I18N
			url: "/app#/admin/modules/" + $customConfig.get()[0].name //No I18N
		};
		$customConfig.get().forEach( config => {
			adminmodulelinks[config.name] = {
				display_name: config.display_name,
				url: "/app#/admin/modules/" + config.name //No I18N
			};
		});
	}
	if(sdp_app.IS_MSPOrSCP){
	    // for adding MSP and SCP admin entities in the Admin page
		$msp_admin.addMSPSCPAdminEntite(adminmodulelinks,mode);
	}
	return adminmodulelinks;
}
/*Admin Json configurations End*/

// SD-96324

function setAdminConfig(form)
  {
   var issitetzoverwrite=document.getElementById("siteTimezoneOverwrite").checked;
   var ispersonalizetzoverwrite=document.getElementById("personalizeTimezoneOverwrite").checked;
   var isdateformatoverwrite=document.getElementById("dateFormatOverwrite").checked;
   var istimeformatoverwrite=document.getElementById("timeFormatOverwrite").checked;
      if(document.SettingsForm.langOverwrite){
        var islangoverwrite = document.getElementById("langOverwrite").checked;
        if(islangoverwrite) {
            document.SettingsForm.langOverwrite.value="true";
        }
        else
        {
            document.SettingsForm.langOverwrite.value="false";
        }
      }
      if(issitetzoverwrite)
      {
        document.SettingsForm.siteTimezoneOverwrite.value="true";
      }
      else
      {
        document.SettingsForm.siteTimezoneOverwrite.value="false";
      }
      if(ispersonalizetzoverwrite)
      {
        document.SettingsForm.personalizeTimezoneOverwrite.value="true";
      }
      else
      {
        document.SettingsForm.personalizeTimezoneOverwrite.value="false";
      }
      if(isdateformatoverwrite)
      {
        document.SettingsForm.dateFormatOverwrite.value="true";
      }
      else
      {
        document.SettingsForm.dateFormatOverwrite.value="false";
      }
      if(istimeformatoverwrite)
      {
        document.SettingsForm.timeFormatOverwrite.value="true";
      }
      else
      {
        document.SettingsForm.timeFormatOverwrite.value="false";
      }
  }

  function setadmincheckbox(islangchecked,issitechecked,ispersonalizechecked,isdatechecked,istimechecked)
  {
  if( document.SettingsForm.langOverwrite){
    if(islangchecked)
    {
      document.SettingsForm.langOverwrite.checked=true;
      document.SettingsForm.langOverwrite.value="true";
    }
    else
    {
      document.SettingsForm.langOverwrite.checked=false;
      document.SettingsForm.langOverwrite.value="false";
    }
  }
  if(document.SettingsForm.siteTimezoneOverwrite) {
    if(issitechecked)
    {
      document.SettingsForm.siteTimezoneOverwrite.checked=true;
      document.SettingsForm.siteTimezoneOverwrite.value="true";
    }
    else
    {
      document.SettingsForm.siteTimezoneOverwrite.checked=false;
      document.SettingsForm.siteTimezoneOverwrite.value="false";
    }
   }
   if(document.SettingsForm.personalizeTimezoneOverwrite) {
    if(ispersonalizechecked)
    {
      document.SettingsForm.personalizeTimezoneOverwrite.checked=true;
       document.SettingsForm.personalizeTimezoneOverwrite.value="true";
    }
    else
    {
      document.SettingsForm.personalizeTimezoneOverwrite.checked=false;
      document.SettingsForm.personalizeTimezoneOverwrite.value="false";
    }
   }
   if(document.SettingsForm.dateFormatOverwrite) {
    if(isdatechecked)
    {
      document.SettingsForm.dateFormatOverwrite.checked=true;
      document.SettingsForm.dateFormatOverwrite.value="true";
    }
    else
    {
      document.SettingsForm.dateFormatOverwrite.checked=false;
      document.SettingsForm.dateFormatOverwrite.value="false";
    }
   }
   if(document.SettingsForm.timeFormatOverwrite) {
    if(istimechecked)
    {
      document.SettingsForm.timeFormatOverwrite.checked=true;
      document.SettingsForm.timeFormatOverwrite.value="true";
    }
    else
    {
      document.SettingsForm.timeFormatOverwrite.checked=false;
      document.SettingsForm.timeFormatOverwrite.value="false";
    }
   }

  }

function sspCustomCardSelection($this) {
	jQuery('.ssp-custm-card').removeClass('selected');
	let selectedDiv = jQuery($this).closest('.ssp-custm-card'); //NO I18N
	selectedDiv.addClass('selected');
	let value = selectedDiv.attr("id").replace("_ssp_customization", "");
	jQuery($this).parent().find('#SSPCustomizationType').val(value);
}
function openLink(url, target) {
	event.stopPropagation();
	window.open(url, target, 'noopener'); //NO I18N
}

/**** Functions Moved from setup.js as part of Azure User sync feature - start ****/
// check for e-mail notification for self-service login.
function isLoginNotifcation_Outgoing_Enabled(){
    var result=true;
    sdpAjax({
        url: "/servlet/AJaxServlet?action=checkLoginNotification_Outgoing",  //No I18N
        async:false,
        type: 'GET', //No I18N
        complete: function (resp) {
           var response = JSON.parse(resp.responseText);
           var status=response.status;
           if(status=="failure"){
               showalert('failure', getMessageForKey("sdp.announcement.mail.configureserver.jserror") + "<a class='text-link' style='cursor:pointer' data-event='click' data-handler='javascript:redirectToOutgoingMailServer();' nonce=" + sdpNonce + "> " + getMessageForKey("sdp.inventory.home.scan.configurenow") + "</a>",'isAutoHide=false');//NO I18N
               $sdEventListener("#alertbox");  //No I18N
               result=false;
           }
        }
    });
    return result;
}

//Errorlog popup from Systemlog viewer and failed user details during azure onetime import
var Community_ErrorLog = {  //  Issue Fix - #103884
    openErrorLog : function(url, title, id, w){
    var jB = jQuery('body');
    if(jB.find('#'+id).length == 1) {
      jB.find('#'+id).remove();
    }
    jB.append('<div id="'+id+'"></div>');
    jB.find('#'+id).dialog({  //create dialog, but keep it closed
      autoOpen: false,
      width: w,
      modal: true
    });
    jB.find('#'+id).load(url, function() {
      jB.find("div[aria-describedby=ErrorLogDetails]").find("span.ui-dialog-title").text(jB.find("#headerTitle").text());
      jB.find('#'+id).dialog("open"); // No I18N
    });
    }
};
/**** Functions Moved from setup.js as part of Azure User sync feature - end ****/

/**** Functions Copied from setup.js as part of Azure User sync feature - end ****/
//SD-128595
/* Part of SD-100780 fix */
function showClientSecret(eleId, showDeleteButton)
{
    jQuery('#old_'+ eleId).addClass('hide');
    jQuery('#new_' + eleId).removeClass('hide');
    if(showDeleteButton)
    {
        showClientSecretDeleteButton(eleId);
        setClientSecretTrue(); // Set changeClientSecret value as true when clicking the "Enter client secret" link  //No I18N
    }
    jQuery('#' + eleId).focus();
}

function resetClientSecret(eleId)
{
    jQuery('#old_'+ eleId).removeClass('hide');
    jQuery('#new_' + eleId).addClass('hide');
    jQuery('#changeClientSecret').val('false');
}

function showClientSecretDeleteButton(eleId)
{
    jQuery('#db_' + eleId).removeClass('hide');
}

function setClientSecretTrue()
{
    jQuery('#changeClientSecret').val('true');
}
/* Fix for SD-100780 ends */
/**** Functions Copied from setup.js as part of Azure User sync feature - end ****/
