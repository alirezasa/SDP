/* $Id$ */

jQuery(document).ready(function() {
    initTooltip("#addRem");//NO I18N
});

function selectReminder(isBulkSelect, thisForm) {
    var deleteBtn = document.getElementById('delTask');
    var changeStateBtn = document.getElementById('changeState');
    if(deleteBtn) {
        deleteBtn.disabled = (!deleteBtn.disabled);
    }
    if(changeStateBtn) {
        changeStateBtn.disabled = (!changeStateBtn.disabled);
    }
    if(isBulkSelect) {
        selectAll(thisForm, 'checkbox'); //No I18N
    }
}
