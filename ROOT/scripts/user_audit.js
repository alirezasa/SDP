// Common method to translate audit log field keys and generate module links
function translateAuditLogField(key, value, resp) {
	if (key == "name") {
		return {
			key: translate("common.info"), //No I18N
			value: e_html(value),
			isInfo: true
		};
	}
	
	let translatedKey = key;
	let processedValue = e_html(value);
	
	// Map for field translations
	const fieldTranslationMap = new Map([
		["performed_from", "user.audit.performed.from"], //No I18N
		["username", "sdp.admin.email.incoming.username"], //No I18N
		["module", "gdpr.field.module"], //No I18N
		["sub_module", "sdp.support.errorlog.listview.submodule"], //No I18N
		["submodule_id", "user.audit.sub.module.id"], //No I18N
		["client_type", "user.audit.client.type"], //No I18N
		["ip_address", "ae.cmdb.source.ipAddress"], //No I18N
		["action", "user.audit.action"], //No I18N
		["time", "user.audit.date.logged"], //No I18N
		["helpdesk", "sdp.admin.leftpanel.helpdesk"], //No I18N
		["status", "common.status"], //No I18N
		["user_type", "mdm.user_type"] //No I18N
	]);
	
	// Handle special case for module_id
	if (key === "module_id") { //No I18N
		const portalid = resp.helpdesk?.value;
		const moduleLinks = new Map([
			["request", `/WorkOrder.do?woMode=viewWO&woID=${value}&PORTALID=${portalid}`], 	//No I18N
			["problem", `/ui/problems?mode=detail&entity_id=${value}&PORTALID=${portalid}#details`],//No I18N
			["change", `/ui/changes?entity_id=${value}&mode=detail&PORTALID=${portalid}#Submission/details`],//No I18N
			["project", `/ProjectAction.do?submitaction=ViewProject&projectid=${value}&PORTALID=${portalid}`], //No I18N
			["release", `/ui/releases?entity_id=${value}&mode=detail&PORTALID=${portalid}#submission/details`], //No I18N
			["solution", `/ui/solutions?entity_id=${value}&mode=detail&PORTALID=${portalid}#feedback`], //No I18N
			["request_maintenance", `/ui/maintenances?mode=details&id=${value}&PORTALID=${portalid}#details`] //No I18N
		]);
		const link = moduleLinks.get(resp.module.entity_name?.toLowerCase());
		processedValue = link ? `<a class="bg-transparent" target="blank" rel='noopener noreferrer' href="${link}">${value}</a>` : processedValue;
		translatedKey = translate("sdp.approval.moduleid"); //No I18N
	} else {
		// Use map to get translation key
		const translationKey = fieldTranslationMap.get(key);
		if (translationKey) {
			translatedKey = translate(translationKey); 
		}
	}
	
	return {
		key: translatedKey,
		value: processedValue,
		isInfo: false
	};
}

function getUserAuditLogInfo(log_id,table_name){
	sdpAjax({
		url: '/api/v3/user_audit?table_name='+table_name+'&id='+log_id,//No I18N
		async: false,
		cache: false,
		ignorefailuremessage: true
	}).done(function(resp){
			jQuery('body').append("<div id='audit_log_details' class='maxh-50vh oya w-40vw'></div>");
			let $logDetailsDiv = jQuery("#audit_log_details");
			let title = translate("user.audit.title"); // NO I18N
			$logDetailsDiv.dialog({	
				title: title,
				draggable: true,
				width: 600,
				modal: true,
				open() {
					const data = { ...resp };
					if(resp.module){
						data.module = resp.module.display_value;
					}
					if(resp.sub_module){
						data.sub_module = resp.sub_module.display_value;
					}
					if(resp.time){
						data.time = resp.time.display_value;
					}
					if(resp.helpdesk){
						data.helpdesk = resp.helpdesk.display_value;
					}
					delete data.table_name;
					delete data.id;
					delete data.user_id;
					var tableData = [];
					var infoVal = {};
					
					let columnOrder = getPersonalizeData("user_audit").column_order; //No I18N
					
					if (!columnOrder || !Array.isArray(columnOrder) || columnOrder.length === 0) {
						
						const defaultOrder = ["username","user_type", "module", "module_id", "sub_module", "submodule_id", "action", "info","client_type", "ip_address" , "time", "performed_from", "status", "helpdesk"]; //No I18N
						
						columnOrder = defaultOrder;
					}
					const processField = (key, value) => {
						if(sdp_app.IS_AE && key === "helpdesk") return;
						
						const fieldTranslation = translateAuditLogField(key, value, resp);
						if (fieldTranslation.isInfo) {
							infoVal.field = fieldTranslation.key;
							infoVal.value = fieldTranslation.value;
							return;
						}
						tableData.push({field: fieldTranslation.key, value: fieldTranslation.value});
					};

					if (columnOrder?.length) {
						// First process fields in column order
						const columnOrderSet = new Set(columnOrder);
						columnOrder.forEach(col => {
							if (data.hasOwnProperty(col)) {
								processField(col, data[col]);
							}
						});
						
						// Then process remaining fields
						Object.entries(data).forEach(([key, value]) => {
							if (!columnOrderSet.has(key)) {
								processField(key, value);
							}
						});
					} 
                    tableData.unshift(infoVal);
					renderhbs("#audit_log_details","user-audit-details",{"tableData":tableData},false,"admin");//No I18N
				}
			});
	});
}
