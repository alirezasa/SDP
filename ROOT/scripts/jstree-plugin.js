/**
 * jstree node customization addon plugin start here
 */
if(jQuery.jstree){
    jQuery.jstree.defaults.node_customize = {
        "key": "type", //No I18N
        "switch": {}, //No I18N
        "default": null //No I18N
    };

    jQuery.jstree.plugins.node_customize = function (options, parent) {
        this.redraw_node = function (obj, deep, callback, force_draw) {
            var node_id = typeof obj === "object" ? obj.id: obj; //No I18N
            var el = parent.redraw_node.apply(this, arguments);
            if (el) {
                var node = this._model.data[node_id];
                var cfg = this.settings.node_customize;
                var key = cfg.key;
                var type =  (node && node.original && node.original[key]);
                var customizer = (type && cfg["switch"][type]) || cfg["default"];
                if(customizer){
                    customizer(el, node);
                }
            }
            return el;
        };
    }
}
/** ends here */