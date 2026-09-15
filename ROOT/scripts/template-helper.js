var $templateHelper = {
    processHistory : function (history){
        const i18n = {
            'layout_section_add': 'section.add.history', //No I18N
            'layout_section_edit': 'section.edit.history', //No I18N
            'layout_section_delete': 'section.delete.history' //No I18N
        };
        Object.keys(i18n).forEach((key) => i18n[key] = translate(i18n[key]));
        let modifiedHistory = history.map((obj) => {
            if(typeof obj.operation === 'string') {
                if(obj.operation.includes('layout_section_add')) {
                    obj.operation = {name: obj.operation, display_name: i18n.layout_section_add};
                }
                else if(obj.operation.includes('layout_section_edit')) {
                    obj.operation = {name: obj.operation, display_name: i18n.layout_section_edit};
                }
                else if(obj.operation.includes('layout_section_delete')) {
                    obj.operation = {name: obj.operation, display_name: i18n.layout_section_delete};
                }
            }
            return obj;
        });
        $history.processHistory(modifiedHistory);
    }
};