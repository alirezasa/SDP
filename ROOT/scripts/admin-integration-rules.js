/* $Id$ */
var $integrationSyncRules = {
    container: "integration_sync_rules", //No I18N
    shouldShowReorder: false,
    isReorderEnabled: false,
    widthToResize: 1500,
    source_module_field: "name", // no i18n
    //to load particual source module list view by default
    fetchSourceModule() {
        return sdpAjax({
			url: "/api/v3/integration_sync_rules/source_module/", //No I18N
			data: sdpAjaxInputData({
			  	list_info: {
					row_count: 1,
				},
                service : {
                    id : this.model.id
                }
			})
		});
    },
    //init OPM/APP Manager integration sync rule list view
    async init (model) {
        const isAsset = model.sync_to === "asset"; //No I18N

        this.isAsset = isAsset;
        this.model = model;

        const { source_module } = await this.fetchSourceModule();

        if(source_module.length) {
            $integrationSyncRuleForm.options = { container: this.container };
            $syncRules.init(this);
            $integrationSyncRuleForm.toggle(true);
        } else {
            //show message when no device type is available.
            jQuery("#" + this.container).html(this.getNoDeviceTypeHtml()); //No I18N
        }

        jQuery("#empty-source-module-info").toggleClass("hide", source_module.length > 0); //No I18N
    },
    entity: "integration_sync_rules",//No I18N
    container: "integration_sync_rules",//No I18N
    getSourceModuleFilterCriteria() {
        return [{
            field: "service", //No I18N
            value: this.model.id,
            condition: "eq", //No I18N
            logical_operator: "AND"  //No I18N
        }];
    },
    getDestinationModuleFilterCriteria() {
        return [{
            field: "category",//No I18N
            condition: "is",//No I18N
            value: $integrationSyncRules.model.sync_to_id
        }];
    },
    getServiceFilter: () => {
        return {
            id : $integrationSyncRules.model.id
        };
    },
    add() {
        const self = $integrationSyncRules;
        $integrationSyncRuleForm.init({
            container: this.container,
            redirectToList: $syncRules.refreshList,
            isAsset: this.isAsset,
            model: this.model
        });
    },
    edit: (id) => {
        $integrationSyncRuleForm.init({ id, container: $integrationSyncRules.container, isAsset: $integrationSyncRules.isAsset, redirectToList: $syncRules.refreshList })
    },
    getNoDeviceTypeHtml() {
        return `<div id="no-association-banner">
            <div class="tc pt30 pb30 align-vh-center">
                <div class="alert alert-info icon w-auto" role="alert">
                    <span class="msg">${translate("integration.no.device.type")}</span>
                </div>
            </div>
        </div>`;
    },
    getServiceId : function() {
        return this.model.id;
    }
}
