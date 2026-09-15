/* $Id$ */
var rlc = {
    canvas: {
        selector: "#wf_canvas" //No i18n
    },
    stencil: {
        selector: "#wf_stencil", //No i18n
        gap:10
    },
    messages: {
        start_to_end:translate("rlc.error.start_to_end"),
        complete_to_end:translate("admin.rlc.transition.pending.to.end.node"),
        complete_to_resolve:translate("admin.rlc.transition.completed.to.hold.status"),
        resolve_to_hold:translate("admin.rlc.transition.completed.to.hold.status"),
        one_to_pending:translate("admin.rlc.transition.completed.to.pending.status"),
        invalidpath:translate("rlc.error.invalidpath"),
        pathexsist:translate("common.already_exsist",[translate("admp.common_path")]),
        empty_status:translate("rlc.empty_status"),
        unsave_data:translate("sdp.rlc.unsave_data"),
        restrict:translate("rlc.change_to_draft"),
        template_disassociate:translate("rlc.template_disassociate"),
        sucess_draft_delete:translate("sdp.admin.common.delete.success",[translate("request.draft")])
    },
    interactive:function(){
        if(rlc.view=="publish"&&rlc.lifecycle.has_draft){
            return false;
        }
        return true;
    },
    stencildata: [],
    ruleCnt: 1,
    panning: false,
    padding: 50,
    mousePosition: {
        x: 0,
        y: 0
    },
    dragStartPosition: null,
    flyPaper: '<div id="flyPaper" class="av-status" style="position:fixed;z-index:100;pointer-event:none;"></div>',
    manager_defaults:{
        oprnBeforeAdd: null,
        oprnNameRegex: ['add','remove','change:target','change:source','change:position'],//No i18n
         methods:{
          add:function(){
            rlc.load_stencil();
          },
          remove:function(){
            rlc.load_stencil();
          }
        }
    },
    render:function(){ //To render Canvas Stencile will call this on every save function 
        rlc.init_stencil();
        rlc.init_canvas();
        rlc.draw_graph(rlc.lifecycle.nodes,rlc.lifecycle.transitions);
        rlc.load_stencil();
        rlc.lifecycle.ui_attributes&&rlc.lifecycle.ui_attributes.zoom&&rlc.canvas.paper.scale(rlc.lifecycle.ui_attributes.zoom.x,rlc.lifecycle.ui_attributes.zoom.y);
        rlc.lifecycle.ui_attributes&&rlc.lifecycle.ui_attributes.pan&&rlc.canvas.paper.translate(rlc.lifecycle.ui_attributes.pan.x,rlc.lifecycle.ui_attributes.pan.y);
    },
    //To get general metainfo to render right panel, because in some case like template dissociation it will be helpful to show the name
    getGeneralMetainfo:function(){
        sdpAjax({
                url: 'api/v3/requests/_metainfo',//No i18n
                type: 'GET',//No i18n
                async:false,
                cache:false,
                data: {input_data:sdpToJSON( {for: "lifecycle"})},//No i18n
                success:function(data) {
                    if(data.metainfo){
                      rlc.general_meta_info=data.metainfo;
                    }
                    else if(data.response_status.status=="failed"){
                        showalert("failure",data.response_status.messages[0].message.display_message||data.response_status.messages[0].message||translate("sdp.common.error.unknown"),'isAutoHide=false,delay=3');//NO I18N
                    }
                },
                error: function(json){
                    var data = json.responseJSON;
                    if(data.response_status && data.response_status.status=="failed"){
                        showalert("failure",data.response_status.messages[0].message.display_message||data.response_status.messages[0].message||translate("sdp.common.error.unknown"),'isAutoHide=false,delay=3');//NO I18N
                    }
                }
        });
    },
    /*To get general metainfo to criteria component ,mandate fields, optional fields , 
    this will pass only associated template id to avoid script tag issue thrown by framework*/
    getMetaInfo:function(){
        input_template=jQuery.extend(true,[],rlc.lifecycle.request_templates,[]);
        for(var i=0;i<input_template.length;i++){
            input_template[i]={id:input_template[i].id};
        }
        sdpAjax({
                url: 'api/v3/requests/_metainfo',//No i18n
                type: 'GET',//No i18n
                data: {input_data:sdpToJSON( {for: "lifecycle","templates": input_template})},//No i18n
                async:false,
                cache:false,
                success:function(data) {
                    if(data.metainfo){
                        rlc.metainfo=data.metainfo;
                    }
                    else if(data.response_status.status=="failed"){
                        showalert("failure",data.response_status.messages[0].message.display_message||data.response_status.messages[0].message||translate("sdp.common.error.unknown"),'isAutoHide=false,delay=3');//NO I18N
                    }
                },
                error:function (json) {
                    var data = json.responseJSON;
                    if(data.response_status && data.response_status.status=="failed"){
                        showalert("failure",data.response_status.messages[0].message.display_message||data.response_status.messages[0].message||translate("sdp.common.error.unknown"),'isAutoHide=false,delay=3');//NO I18N
                    }
                }
        });
    },
    /*Zoom in/out for slider in canvas */
    zoomPaper: function(e,x) {
        var newScale;
        x=x?x.value:e;
        newScale = x / 100;
        if (newScale > 0.4 && newScale < 2) {
            rlc.canvas.paper.setOrigin(0, 0); // reset the previous viewport translation
            rlc.canvas.paper.scale(newScale, newScale);
            rlc.canvas.paper.$el.attr("transform", "scale(" + newScale + ")");
        }
        return;
    },
    init_stencil: function(options) {
        this.stencil = options = jQuery.extend({}, this.stencil, options);
        options.graph = new joint.dia.Graph();
        options.paper = new joint.dia.Paper({
            el: jQuery(options.selector),
            width: options.width,
            height: options.height,
            model: options.graph
        });
        //to Collect all stencil html element inside a list
        jQuery(options.selector).prepend('<ul class="items p0"></ul>');
        options.paper.on('cell:pointerdown', function(cellView, e, x, y) { //No I18N
            e.preventDefault();
            if(rlc.view=="publish"&&rlc.lifecycle.has_draft){
                return;
            }
            jQuery('body').append(rlc.flyPaper);
            var flyGraph = new joint.dia.Graph(),
                flyPaper = new joint.dia.Paper({
                    el: jQuery('#flyPaper'),
                    model: flyGraph,
                    interactive: false
                }),
                flyShape = cellView.model.clone(),
                pos = cellView.model.position(),
                offset = {
                    x: x - pos.x,
                    y: y - pos.y
                };
            flyShape.position(0, 0);
            flyGraph.addCell(flyShape);
            jQuery(flyPaper.el).prepend(jQuery(cellView.$box[0].outerHTML)[0]);
            jQuery("#flyPaper").offset({
                left: e.pageX - offset.x,
                top: e.pageY - offset.y
            });
            jQuery('body').off('mousemove.fly').on('mousemove.fly', function(e) {//no i18n
                e.preventDefault();
                jQuery("#flyPaper").offset({
                    left: e.pageX - offset.x,
                    top: e.pageY - offset.y
                });
            });
            jQuery('body').off('mouseup.fly').on('mouseup.fly', function(e) {//no i18n
                e.preventDefault();
                var x = e.pageX,
                    y = e.pageY,
                    target = rlc.canvas.paper.$el.offset();
                if (x > target.left && x < target.left + rlc.canvas.paper.$el.width() && y > target.top && y < target.top + rlc.canvas.paper.$el.height()) {
                    var scale = rlc.canvas.paper.scale()
                    var position = {
                        y: (y - target.top - offset.y - rlc.canvas.paper.translate().ty) / rlc.canvas.paper.scale().sy,
                        x: (x - target.left - offset.x - rlc.canvas.paper.translate().tx) / rlc.canvas.paper.scale().sx
                    }
                    var node=rlc.addStatus({
                        id: flyShape.get("entity_id"),
                        name: flyShape.get('label'),
                        position: position
                    });
                    rlc.canvas.graph.addCell(node);
                    rlc.stencil.graph.getCell(flyShape.get("entity_id")).remove(); //No i18n
                }
                flyShape.remove();
                jQuery('#flyPaper').remove();
                jQuery('body').off('mousemove.fly').off('mouseup.fly');//no i18n
            });
        });
    },
    init_canvas: function(options) {
        this.canvas = options = jQuery.extend({}, this.canvas, options);
        options.graph = new joint.dia.Graph();
        var width=jQuery('.req-wf').width() - jQuery("#reqFilterSidebar").width()-20;
        var height=jQuery(window).height() - jQuery("[data-name=graph-view]").offset().top - jQuery("[data-name=graph-view] .form-footer").height() - 52;
        jQuery(options.selector).parent().css({width:width,height:height});
        options.paper = new joint.dia.Paper({
            el: jQuery(options.selector),
            width: width,
            height:height,
            model: options.graph,
            linkView: this.customView,
            defaultLink: new this.CustomLink(),
            multiLinks: false, //cant have link with same node
            snapLinks: {
                radius: 75 //radius for magnet effect to attract target node
            },
            interactive: this.interactive, //to move label
            restrictTranslate: true,
            markAvailable: true,
            async: true,
            validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                if (cellViewS === cellViewT) {return false};
                return true;
            },
            validateMagnet: function(cellView, magnet) {
                return true;
            }
        });
        options.refresh_ports=function(){
            var cells = rlc.canvas.graph.getCells();
            var links = rlc.canvas.graph.getLinks();
            rlc.canvas.paper.$el.find("svg .port-body").removeClass('port-active');
            for (var i = 0; i < links.length; i++) {
                if (links[i].get('target').id) {
                    var t_cell = rlc.canvas.graph.getCell(links[i].get('target').id)
                    t_cell && rlc.canvas.paper.$el.find("svg [model-id='" + links[i].get('target').id + "'] [port='" + links[i].get('target').port+"']").addClass('port-active');
                }
                if (links[i].get('source').id) {
                    var s_cell = rlc.canvas.graph.getCell(links[i].get('source').id)
                    s_cell && rlc.canvas.paper.$el.find("svg [model-id='" + links[i].get('source').id + "'] [port='" + links[i].get('source').port+"']").addClass('port-active');
                }
            }
            rlc.canvas.paper.$el.find(".outPorts .port .port-body:not(port-active)").hide();
            rlc.canvas.paper.$el.find(".inPorts .port .port-body:not(port-active)").hide();
        }
        var paper = this.canvas.paper;
        //this.setGrid(rlc.canvas.paper,15,'#a4a4a4');
        this.canvas.paper.on('blank:pointerdown', function(event, x, y) { //No i18N
            var scale = V(this.viewport).scale();
            rlc.dragStartPosition = {
                x: x * scale.sx,
                y: y * scale.sy
            };
        });
        this.canvas.paper.$el.on('mousemove', function(event) {
            if (rlc.dragStartPosition) {
                paper.translate(
                    event.offsetX - rlc.dragStartPosition.x,
                    event.offsetY - rlc.dragStartPosition.y);
            }
        });
        /*this.canvas.paper.on('blank:mousewheel',function(e, x, y, delta){
            e.preventDefault();
            e = e.originalEvent;
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))) / 50;
            var offsetX = (e.offsetX || e.clientX - rlc.canvas.paper.$el.offset().left); // offsetX is not defined in FF
            var offsetY = (e.offsetY || e.clientY - rlc.canvas.paper.$el.offset().top); // offsetY is not defined in FF
            function offsetToLocalPoint(x, y) {
                var svgPoint = rlc.canvas.paper.svg.createSVGPoint();
                svgPoint.x = x;
                svgPoint.y = y;
                // Transform point into the viewport coordinate system.
                var pointTransformed = svgPoint.matrixTransform(rlc.canvas.paper.viewport.getCTM().inverse());
                return pointTransformed;
            }
            var p = offsetToLocalPoint(offsetX, offsetY);
            newScale = V(rlc.canvas.paper.viewport).scale().sx + delta; // the current paper scale changed by delta
            if (newScale >= 0.4 && newScale <= 2) {
                rlc.canvas.paper.setOrigin(0, 0); // reset the previous viewport translation
                rlc.canvas.paper.scale(newScale, newScale, p.x, p.y);
                jQuery("#rlcslider").slider('value', newScale * 100); //No i18n
            }
            rlc.canvas.paper.$el.attr("transform", "scale(" + newScale + ")");
        });*/
        this.canvas.paper.$el.on('mousedown', function(e) {
            rlc.mousePosition.x = e.pageY;
            rlc.mousePosition.y = e.pageX;
            rlc.mousePosition.top = jQuery(this).scrollTop();
            rlc.mousePosition.left = jQuery(this).scrollLeft();
        });
        this.canvas.paper.on('cell:pointerup blank:pointerup', function(cellView, x, y) { //No i18N
            rlc.dragStartPosition = undefined;
            rlc.mousePosition = {};
            var elem = cellView.model;
            if (!(elem instanceof joint.dia.Link)) {
                rlc.canvas.paper.$el.find(".transition :not(.new)").removeClass("active").addClass("inactive")//No i18n
                rlc.canvas.paper.$el.find(".labels.jointlabelhover").each(function(index, el) {
                    if(!jQuery(el).find(".transition").hasClass('new')){
                        jQuery(el).removeClass('jointlabelhover');
                    }
                });
                rlc.controller.send('resetTransaction'); //No i18n
            }
            else{
                var id=elem.get('source').id||elem.get('source').key
                if( rlc.start_node==id && elem.get('data')){
                    var data=elem.get('data');
                    data.before={placeholders:[]};
                    var fields=elem.get('data').during&&data.during.mandatory_fields;
                    if(fields&& fields.length){
                        fields = jQuery.grep(fields, function(value) {
                          if(["tasks","worklog","depends_on_requests"].indexOf(value)==-1){
                            return true;
                          }
                          return false;
                        });
                        data.during.mandatory_fields=fields;
                    }
                    elem.set('data',data);//no i18n
                }
                rlc.controller.send('resetTransaction'); //No i18n
                rlc.controller.send('showRuleSection', elem.get('id')); //No i18n
            }
        });
        this.canvas.paper.on('cell:pointerdown', function(cellView, evt, x1, y1) { //No i18N
            rlc.panning = true;
            rlc.mousePosition.x = evt.pageX;
            rlc.mousePosition.y = evt.pageY;
            var elem = cellView.model;
            if (elem instanceof joint.dia.Element) {
                var dragStartPoint = jQuery(evt.target).closest('.joint-element').attr('transform').match(/\d+/g); //No i18N
                if (dragStartPoint.length == 2) {
                    rlc.mousePosition.x = +dragStartPoint[0];
                    rlc.mousePosition.y = +dragStartPoint[1];
                }
            }
        });
        this.canvas.paper.on('cell:pointerup', function(cellView, evt, x1, y1) {
            var elem = cellView.model
            var source = elem.get('source');
            var target = elem.get('target');
            if(elem instanceof joint.dia.Link){
                cellView.adjustWidth();
            }
            if (elem instanceof joint.dia.Link && (!source.id || !target.id)) { //remove link with no source id 
                elem.remove();
            } else if (elem instanceof joint.dia.Link && source.id && target.id) {//Prevent duplicate link that already exsist
                var elem = cellView.model;
                cellView.adjustWidth();
                var targetParentEvent = evt.target.className.baseVal;
                if (targetParentEvent && targetParentEvent.indexOf("transition") > -1) {
                    if (!elem.get('name')) {
                        rlc.controller.send('editTransition', elem.get('id')); //No i18n
                    } else {
                        rlc.controller.send('showRuleSection', elem.get('id')) //No i18n  
                    }
                    return;
                }
                //Validation code
                var graph = rlc.canvas.graph;
                var source_node = rlc.canvas.graph.getCell(source.id);
                var target_node = rlc.canvas.graph.getCell(target.id);
                var end_node=rlc.canvas.graph.getCell(rlc.end_node);
                var s_id=source_node.id||source_node.key;
                var e_id=end_node.id||end_node.key;
                var t_id=target_node.id||target_node.key;
                var links = rlc.canvas.graph.getLinks();
                var cur_id = elem.get('id');
                var closeconnectedtoOpen = {},close_to_open=[];
                var links_from_source=graph.getConnectedLinks(source_node, { outbound: true });
                for(var i=0;i<links_from_source.length;i++){
                    if(links_from_source[i].get('target').id==t_id && links_from_source[i].id !==cur_id){
                        elem.remove();
                        showalert('info', rlc.messages.pathexsist, 'isAutoHide=true,delay=3');//No i18n
                        return;
                    }
                }
                var links_connected_to_end=rlc.canvas.graph.getConnectedLinks(end_node,{inbound:true});
                var close_connected_to_end=[];
                for(var i=0;i<links_connected_to_end.length;i++){
                    var cur_node=rlc.canvas.graph.getCell(links_connected_to_end[i].get('source').id);
                    var cur_node_id=cur_node.id||cur_node.key;
                    var links=rlc.canvas.graph.getConnectedLinks(cur_node,{outbound:true});
                    for (var j = 0; j < links.length; j++) {
                        if (graph.getCell(links[j].get('target').id).get("entity_id")!=-1 && rlc.nodedata[graph.getCell(links[j].get('target').id).get("entity_id")] && rlc.nodedata[graph.getCell(links[j].get('target').id).get("entity_id")].in_progress) {
                            if(!closeconnectedtoOpen[cur_node.get("entity_id")]){
                                closeconnectedtoOpen[cur_node.get("entity_id")]=1;
                            }
                            else{
                                closeconnectedtoOpen[cur_node.get("entity_id")]++
                            }

                        }
                    }
                }
                var message = false;
                if (target_node.get('entity_id') == "-1") {
                    elem.prop(['labels', 0, 'attrs', 'text', 'text'], "End"); //No i18N
                    elem.prop(['labels', 0, "attrs", "text", "display"], "none"); //No i18N
                    elem.prop(['labels', 0, "attrs", "path", "display"], "none"); //No i18N
                }
                if (target_node.get('entity_id') == "0") {
                    message = rlc.messages.invalidpath;
                }
                else if (source_node.get('entity_id') == "-1") {
                    message = rlc.messages.invalidpath;
                }
                else if (source_node.get('entity_id') == "0" && target_node.get('entity_id') == "-1") {
                    message = rlc.messages.start_to_end;
                }
                else if (rlc.nodedata[source_node.get('entity_id')] && target_node.get('entity_id') == "-1" && rlc.nodedata[source_node.get('entity_id')].in_progress) {
                    message = rlc.messages.complete_to_end;
                }
                else if (rlc.nodedata[source_node.get('entity_id')] && rlc.nodedata[target_node.get('entity_id')] &&  !rlc.nodedata[source_node.get('entity_id')].in_progress  && rlc.nodedata[target_node.get('entity_id')].in_progress && rlc.nodedata[target_node.get('entity_id')].stop_timer) {
                    message = rlc.messages.complete_to_resolve;
                }
                else if (rlc.nodedata[source_node.get('entity_id')] && !rlc.nodedata[source_node.get('entity_id')].in_progress && closeconnectedtoOpen[source_node.get('entity_id')] > 1) {
                    message = rlc.messages.one_to_pending;
                }
			    //SD-101783 - To prevent setting start node as target node
                //Timer stopped pending status in start node info message
                else if(rlc.nodedata[target_node.get('entity_id')].in_progress && rlc.nodedata[target_node.get('entity_id')].stop_timer && source_node.get('entity_id') == "0"){
                     if(!confirm(translate("rlc.stop.timer.pending.startnode.info"))){
                        //removing transition graph
                        elem.remove();
                        return;
                    }
                }
                if (message) {
                    elem.remove();
                    showalert('info', message, 'isAutoHide=true,delay=3');//No i18n
                    return;
                } else{
                    rlc.canvas.paper.$el.find("svg [model-id='" + target_node.get('id') + "'] [port='"+ elem.get('target').port +  "']").addClass('port-active');
                    rlc.canvas.paper.$el.find("svg [model-id='" + source_node.get('id') + "'] [port='"+ elem.get('source').port +  "']").addClass('port-active');
                }
                
            }
            //Node dropped over another node reverse to its original position
            else if (elem instanceof joint.dia.Element) {
                var elementBelow = rlc.canvas.graph.get('cells').find(function(cell) {
                    if (cell instanceof joint.dia.Link) {
                        return false;
                    } // Not interested in links.
                    if (cell.id === cellView.model.id) {
                        return false;
                    } // The same element as the dropped one.
                    if (cell.getBBox().containsPoint(g.point(x1, y1))) {
                        return true;
                    }
                    return false;
                });
                if (elementBelow) {
                    cellView.model.position(rlc.mousePosition.x, rlc.mousePosition.y);
                }
            }
            rlc.panning = false;
            //GHide Nodes port
            paper.$el.find(".outPorts .port .port-body:not(port-active)").hide();
            paper.$el.find(".inPorts .port .port-body:not(port-active)").hide();
        });
        /*this.canvas.graph.on('change:position', function(cell) {
            if (_.contains(rlc.canvas.graph.getCells(), cell)) {
                var bbox = rlc.canvas.paper.findViewByModel(cell);
                _.each(rlc.canvas.graph.getLinks(), function(link) {
                    var linkView = paper.findViewByModel(link);
                    if (rlc.overlap(linkView.getBBox(), bbox)) {
                        linkView.update();
                    }
                });
            }
        });*/
        this.canvas.graph.on('remove', function() {
            rlc.canvas.refresh_ports();
        });
        this.canvas.paper.listenTo(this.canvas.paper.model, 'change add remove reset', rlc.adjustPaper); //No I18n
    },
    draw_graph: function(nodes, transitions) {
        rlc.canvas.graph.clear();
        rlc.canvas.paper.$el.find(".html-element").remove();
        if (nodes.length == 0) {
            nodes.push({
                name: window.translate("sdp.rlc.start"), //No i18n
                ui_attributes: {
                    position: {
                        y: 79,
                        x: Math.round(jQuery(document).width() / 3)
                    }
                },
                entity_id: "0" //No i18n
            })
            nodes.push({
                name: window.translate("sdp.rlc.end"), //No i18n
                ui_attributes: {
                    position: {
                        y: Math.round(79 + jQuery(document).height() / 2),
                        x: Math.round(jQuery(document).width() / 3)
                    }
                },
                entity_id: "-1" //No i18n
            });
        }
        var cells_list=[];
        for (var i = 0; i < nodes.length; i++) {
           var status=this.addStatus({
                id: nodes[i].entity_id,
                cellid: nodes[i].id || nodes[i].key,
                name: nodes[i].name,
                position: nodes[i].ui_attributes.position
            });
            if(nodes[i].entity_id=="-1"){
                   rlc.end_node=status.get('id');
            }else if(nodes[i].entity_id=="0"){
                 rlc.start_node=status.get('id');
            }
            cells_list.push(status); 
        }
        for (var i = 0; i < transitions.length; i++) {
            transitions[i].id = "trans_" + (transitions[i].id || transitions[i].key); //No i18n
            if (transitions[i].id.indexOf('trans_') > -1) {
                var id = transitions[i].id;
                id=id.substring(id.lastIndexOf("trans_"), id.length);
                transitions[i].id = id;
            }
            var link=this.addLink({
                id: transitions[i].id,
                name: transitions[i].name,
                position: transitions[i].ui_attributes.position,
                source: transitions[i].source_node,
                target: transitions[i].target_node,
                data: transitions[i]
            });
            if(rlc.end_node==link.get('target').id){
                link.prop(['labels', 0, "attrs", "text", "display"], "none"); //No i18N
                link.prop(['labels', 0, "attrs", "path", "display"], "none"); //No i18N
            }
            cells_list.push(link);
        }
        rlc.canvas.graph.resetCells(cells_list);
        setTimeout(function(){
            rlc.canvas.refresh_ports();
        },100);
    },
    overlap: function(rect1, rect2) {
        return !(rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom);
    },
    adjustPaper: function() {
        try { //Error Handling
            var viewportH = jQuery(window).height() - 115; //reducing header band height 
            var viewportW = jQuery(window).width() - jQuery('#reqFilterSidebar').width() - 20;
            if (canvasPaper == null) { //canvaspaper not loaded yet
                jQuery(this.canvas.selector).width(viewportW).height(viewportH);
                return;
            }
            var svgHeight = this.canvas.paper.svg.getBBox().height + defBaseNodeWidth;
            var svgWidth = this.canvas.paper.svg.getBBox().width + defNodeHeight;
            //Dont adjust to graph size if svgDimesion is lower than the browser viewport
            var heightVal = svgHeight < viewportH ? viewportH : svgHeight;
            var widthVal = svgWidth < viewportW ? viewportW : svgWidth;
            canvasPaper.setDimensions(widthVal, heightVal);
            jQuery(this.canvas.selector).width(widthVal).height(heightVal);
        } catch (err) {

        }
    },
    addStatus: function(option) {
        var id = parseInt(option.id);
        var template = [];
        var inPorts = ["in1", "in2", "in3", "in4", "in5"]; //No i18n
        var outPorts = ["out1", "out2", "out3", "out4", "out5"]; //No i18n
        var size = {
            width: 100,
            height: 30
        };
        switch (id) {
            case 0:
                template = [
                    '<div class="html-element html-element-start" style="border-radius:50%">',
                    '<span class="truncate-ellipsis" ><a href="/" title=' + option.name + ' class="truncate-wrapper fw pt20 text-color6"></a></span>',
                    '</div>'
                ]
                outPorts = ["out1"];
                inPorts = [];
                size = {
                    width: 60,
                    height: 60
                };
                option.name = "Start"
                break;
            case -1:
                template = [
                    '<div class="html-element html-element-end" style="border-radius:50%">',
                    '<span class="truncate-ellipsis"><a href="/" title=' + option.name + ' class="truncate-wrapper fw pt20 text-color6"></a></span>',
                    '</div>'
                ]
                inPorts = ["in1"];
                outPorts = [];
                size = {
                    width: 60,
                    height: 60
                };
                option.name = "End"
                break;
            default:
                className="";//No i18n
                if(rlc.nodedata[id] && !rlc.nodedata[id].in_progress){
                    className+=" status-closed";//no i18n
                }
                else if(rlc.nodedata[id] && rlc.nodedata[id].stop_timer){
                    className+=" status-onhold";//no i18n
                }
                template = [
                    '<div class="html-element html-element-status">',
                    //<i class="rounded-circle disp-ib ml10" style="width: 10px; height: 10px; background-color:'+(rlc.nodedata[id].color||"#fff")+'"></i>
                    '<span class="truncate-ellipsis"><a href="/" class="truncate-wrapper fw p5 pb0 text-color6 '+className+'"></a></span>',
                    '<button class="btn btn-link btn-xs p0 node-remove" title="'+translate("rlc.remove_status")+'" rel="uitip"><span class="cspr icon-sm danger"></span></button></div>'//no i18n
                ];
                if(rlc.view=="publish"&&rlc.lifecycle.has_draft){
                    template[2]="</div>"
                }
                break;
        }
        var node = new joint.shapes.html.Element({
            template: template.join(''),
            position: {
                x: option.position.x,
                y: option.position.y
            },
            label: option.name,
            division: "node",//No i18n
            inPorts: inPorts,
            outPorts: outPorts,
            size: size,
            entity_id: id
        });
        if (option.cellid) {
            node.set('id', option.cellid);//No i18n
            if(id=="-1"){
                rlc.canvas.end_node=node.get("id");
            }
        }
        return node;
    },
    addLink: function(option) {
        var newLink = new rlc.CustomLink();
        newLink.set('id', option.id);//No i18n
        //this.canvas.graph.addCell(newLink);
        cell = this.canvas.graph.getCell(newLink.get('id'));//No i18n
        newLink.prop(['labels', 0, 'attrs', 'text', 'text'], (option.name||"+")); //No i18N
        option.name && newLink.set("name", (option.name)); //No i18N
        newLink.set("data", option.data); //No i18N
        option.position && newLink.set('vertices', option.position);//No i18n
        var s_id = option.source && (option.source.key || option.source.id);
        var t_id = option.target && (option.target.key || option.target.id)
        var s_port = option.data && option.data.ui_attributes.source_node_port;
        var t_port = option.data && option.data.ui_attributes.target_node_port;
        s_id &&newLink.set('source', {//No i18n
            id: s_id,
            port: s_port
        });
        t_id && newLink.set('target', {//No i18n
            id: t_id,
            port: t_port
        });
        if (option.data && option.data.ui_attributes.label_position) {
          newLink.prop(['labels', 0, 'position', 'distance'], parseFloat(option.data.ui_attributes.label_position)); //No i18N   
          newLink.prop(['labels', 0, 'position', 'offset'],0); //No i18N   
        }
        return newLink;
    },
    load_stencil: function() {//Populate stencil graph with flow symbols
        var gap = rlc.stencil.gap;
        var stencil_data = [];
        var exsisting_nodes = [];
        var cell = rlc.canvas.graph.getCells();
        var index = 0;
        rlc.stencil.graph.resetCells();
        rlc.stencil.paper.$el.find(".items").html('');
        for (var i = 0; i < cell.length; i++) {
            if (cell[i].get('type') == "html.Element") {
                exsisting_nodes.push(cell[i].get("entity_id"));
            }
        }
        var empty_stencil_tag = true;
        var node_id=Object.keys(rlc.nodedata);
        for (var i = 0; i < node_id.length; i++) {
            if (!exsisting_nodes.includes(parseInt(node_id[i]))&& !rlc.nodedata[node_id[i]].deleted) {
                empty_stencil_tag = false;
                className="truncate-wrapper col-xs-11 p5 pl10 text-color6";//No i18n
                if(!rlc.nodedata[node_id[i]].in_progress){
                    className+=" status-closed";//No i18n
                }
                else if(rlc.nodedata[node_id[i]].stop_timer){
                    className+=" status-onhold";//No i18n
                }
                var stencil = new joint.shapes.html.Element({
                    template: ['<li class="truncate-ellipsis" style="width: 230px;"><span class="'+className+'" data-name="status" style="height: 28px;"></span><span class="cspr drag1 icon-xs cursor-move top4"></span></li>'].join(''),
                    markup: '<g class="rotatable"><rect class="body"/></g><title class="node-title"/>',//No i18n
                    position: {
                        x: 0,
                        y: 0 + (index * 40)
                    },
                    division: "stencil",//No i18n
                    label: rlc.nodedata[node_id[i]].name,
                    size: {
                        width: 140,
                        height: 10
                    },
                    attrs: {
                        '.body': {//No i18n
                            height: 30
                        }
                    },
                    entity_id: node_id[i]
                });
                stencil.set('id', node_id[i]);
                rlc.stencil.graph.addCell(stencil);
                gap = gap + gap;
                index++;
            }
        }
        if (empty_stencil_tag) {
            jQuery(rlc.stencil.selector).find(".items").html("<p class='text-muted tc'>"+rlc.messages.empty_status+"</p>")
        }
    },
    findIndex:function(array,value,key){
            for(var i=0;i<array.length;i++){
                if(array[i].id==value||array[i].key==value||array[i][key]==value){
                    return i;
                }
            }
            return false;
    },
    /**
     * Let's trigger this method after initializing the joint dependency file from "rlc/route.js"
     */
    initNodeShapes: function(){
        rlc.CustomLink = joint.dia.Link.define('CustomLink', {//No i18n
            labelMarkup: '<g class="label"><path/><text/></g>', //NO I18N
            attrs: {
                ".connection": { //NO I18N
                    "stroke": "#aaa", //NO I18N
                    "stroke-width": 1.0 //NO I18N
                },
                ".marker-target": { //NO I18N
                    "d": "M 10 0 L 0 5 L 10 10", //NO I18N
                    "stroke-width": 1.0, //NO I18N
                    "stroke": "#555", //NO I18N
                    "fill": "#757575" //NO I18N
                },
                // this is for on over link
                ".marker-arrowheads .marker-arrowhead-group-source .marker-arrowhead": { //NO I18N
                    "d": "M-3,0a3,3 0 1,0 6,0a3,3 0 1,0 -6,0" //NO I18N
                },
                ".marker-arrowheads .marker-arrowhead-group-target .marker-arrowhead": { //NO I18N
                    "d": "M 10 0 L 0 5 L 10 10" //NO I18N
                },
                '.link-tool .tool-remove': {//NO I18N
                   transform:"scale(.65)"//No i18n
                }
            },
            router: {
                name: 'manhattan'//No i18n
            },
            connector: {
                name: 'rounded'//No i18n
            },
            labels: [{
                position: {
                    distance: 0.5,
                    offset: 0
                },
                attrs: {
                    text: {
                        text: '+',
                        fill: 'white',//No i18n
                        //fontFamily: 'sans-serif',//No i18n
                        y: "5",
                        x: "0"
        
                    },
                    path: {
                        d: "M -12.5 -11 L 22.5 -11 L 12.5 11 L -22.5 11 Z",//No i18n
                        class: "transition"//No i18n
                    }
                }
        
            } ]
        });
        rlc.customView = joint.dia.LinkView.extend({
            update: function() {
                joint.dia.LinkView.prototype.update.apply(this, arguments);
                this.adjustWidth();
                return this;
            },
            updateLink: function(option) {
               this.model.prop(['labels', 0, 'attrs', 'text', 'text'], option.name); //No i18N
               this.model.set("name", option.name); //No i18N
               this.model.set("data",option); //No i18N
               this.adjustWidth();
            },
            adjustWidth: function() {
                var width = this.$el.find('text')[0].getComputedTextLength() < 10 ? 15 : this.$el.find('text')[0].getComputedTextLength();
                width = Math.round(width + 25);
                h = 12;
                h1 = h;
                if (document.documentMode || /Edge/.test(navigator.userAgent)) {
                    h1 = h + 4;
                }
                var d =
                    "M " + ((-width / 2) + 5) + " " + (-h) + " " + //NO I18N
                    "L " + ((+width / 2) + 5) + " " + (-h) + " " + //NO I18N
                    "L " + ((+width / 2) - 5) + " " + (+h1) + " " + //NO I18N
                    "L " + ((-width / 2) - 5) + " " + (+h1) + " " + //NO I18N
                    "Z"; //NO I18N
                (!this.$el.find(".labels .transition").hasClass('active'))&&this.$el.find(".labels .transition").addClass('inactive');
                if (!this.model.get('name')) {
                    d = "M -10 -10 L 12 -10 L 12 10 L -10 10 Z";//No i18n
                    !this.$el.find(".labels").hasClass('jointlabelhover') && this.$el.find(".labels").addClass('jointlabelhover');
                    this.$el.find(".labels .transition").addClass("new");
                }
                this.$el.find(".labels path").attr("d",d);
                this.model.prop(['labels', 0, 'position', 'offset'], 0); //No i18N
            }
        });
        
        //Shapes and its definitions
        joint.shapes.html = {};
        joint.shapes.html.Element = joint.shapes.basic.Generic.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {
            markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><title class="node-title"/><g class="inPorts"/><g class="outPorts"/><g class="actions"><circle class="delete"/></g></g>',//No i18n
            //markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g class="inPorts"/><g class="outPorts"/></g>',
            portMarkup: '<g class="port port<%= id %>"><circle class="port-body"/></g>',//No i18n
            defaults: joint.util.deepSupplement({
                type: 'html.Element',//No i18n
                size: {
                    width: 100,
                    height: 30
                },
                attrs: {
                    '.': {
                        magnet: false
                    },
                    '.body': {//No i18n
                        width: 230,
                        height: 26
                    },
                    'rect': {//No i18n
                        fill: 'transparent'//No i18n
                    },
                    '.port-body': {//No i18n
                        r: 4,
                        magnet: true,
                        stroke: 'black'//No i18n
                    },
                    text: {
                        fill: 'black',//No i18n
                        'pointer-events': 'none'//No i18n
                    },
                    '.inPorts circle': {//No i18n
                        fill: '#fff',//No i18n
                        stroke: '#a4b7c2'//No i18n
                    },
                    '.outPorts circle': {//No i18n
                        fill: '#fff',//No i18n
                        stroke: '#a4b7c2'//No i18n
                    }
                }
            }, joint.shapes.basic.Generic.prototype.defaults),
            getPortAttrs: function(portName, index, total, selector, type) {
                var attrs = {};
                var portClass = 'port' + index + "";
                var portSelector = selector + '>.' + portClass;
                var portBodySelector = portSelector + '>.port-body';//No i18n
                attrs[portBodySelector] = {
                    port: {
                        id: portName || _.uniqueId(type),
                        type: type
                    }
                };
                attrs[portSelector] = {
                    ref: '.body',//No i18n
                    'ref-x': (index + 0.5) * (1 / total)//No i18n
                };
                if (selector === '.outPorts') {
                    attrs[portSelector]['ref-dy'] = 0;
                }
                return attrs;
            }
        }));
        // Create a custom view for that element that displays an HTML div above it.
        // -------------------------------------------------------------------------
        joint.shapes.html.ElementView = joint.dia.ElementView.extend({
            events: {
                'mouseover': 'overnode',//No i18n
                'mouseout': 'outnode'//No i18n
            },
            initialize: function() {
                _.bindAll(this, 'updateBox');//No i18n
                this.model.attr('.node-title/text', this.model.get('label'), {silent: true});
                joint.dia.ElementView.prototype.initialize.apply(this, arguments);
                this.$box = jQuery(joint.util.template(this.model.get('template'))());
                this.model.on('change', this.updateBox, this); // Remove the box when the model gets removed from the graph.
                this.model.on('remove', this.removeBox, this);
                if (this.model.get('division') == "node") {
                    this.$box.find('.node-remove').on('click', _.bind(this.model.remove, this.model)); // Update the box position whenever the underlying model changes.
                    this.listenTo(this.model, 'process:ports', this.update);//No i18n
                }
                joint.dia.ElementView.prototype.initialize.apply(this, arguments);
                this.updateBox();
            },
            render: function() {
                this.listenTo(this.paper, 'scale', this.updateBox);//No i18n
                this.listenTo(this.paper, 'translate', this.updateBox);//No i18n
                joint.dia.ElementView.prototype.render.apply(this, arguments);
                if (this.model.get('division') == "node") {
                    this.paper.$el.prepend(this.$box);
                } else {
                    this.paper.$el.find(".items").append(this.$box);
                }
                this.updateBox();
                return this;
            },
            overnode: function(evt, x, y) {
                if (this.model.get('division') !== "stencil") {
                    this.$el.find(".inPorts .port .port-body").show();
                    this.$el.find(".outPorts .port .port-body").show()
                    this.$box.addClass('active');
                    var outnode = this.model.graph.getConnectedLinks(this.model, {
                        outbound: true
                    });
                    for (var i = 0; i < outnode.length; i++) {
                        var node=rlc.canvas.paper.$el.find("[model-id="+outnode[i].id+"]");
                        node.find(".transition").addClass('selected');
                        node.find(".labels").addClass('jointlabelhover');
                    }
                }
            },
            outnode: function(evt, x, y) {
                if (this.model.get('division') !== "stencil" && evt.target.className.baseVal !== "delete") { //hiding nodes ports
                    this.$el.find(".inPorts .port .port-body").hide();
                    this.$el.find(".outPorts .port .port-body").hide();
                    this.$box.removeClass('active');
                    var outnode = this.model.graph.getConnectedLinks(this.model, {
                        outbound: true
                    });
                    for (var i = 0; i < outnode.length; i++) {
                        var node=rlc.canvas.paper.$el.find("[model-id="+outnode[i].id+"]");
                        node.find(".transition").removeClass('selected');
                        outnode[i].get('name')&&node.find(".labels").removeClass('jointlabelhover');
                        
                    }
                }
            },
            renderPorts: function() {
                var $inPorts = this.$('.inPorts').empty();
                var $outPorts = this.$('.outPorts').empty();
                // In Lodash, _.template() uses Function constructor which throws the error - "EvalError: Refused to evaluate a string as JavaScript" due to CSP policy. Hence replacing with joint.util.template()
                var portTemplate = joint.util.template(this.model.portMarkup);
                _.each(_.filter(this.model.ports, function(p) {
                        return p.type === 'in'
                    }),
                    function(port, index) {
                        var template = V(portTemplate({
                            id: index,
                            port: port
                        })).node;
                        port.selector = template.getAttribute('class');
                        $inPorts.append(template);
                    });
                _.each(_.filter(this.model.ports, function(p) {
                        return p.type === 'out'
                    }),
                    function(port, index) {
                        var template = V(portTemplate({
                            id: index,
                            port: port
                        })).node;
                        port.selector = template.getAttribute('class');
                        $outPorts.append(template);
                    });
            },
            update: function() {
                this.renderPorts();
                joint.dia.ElementView.prototype.update.apply(this, arguments);
            },
            updateBox: function() {
                if (!this.paper) {return};
                //var bbox = this.model.getBBox();
                if (this.model.get('division') == "node") {
                    this.$box.find('a').text(this.model.get('label'));
                    const bbox = this.getBBox({
                        useModelGeometry: true
                    });
                    const scale = joint.V(this.paper.viewport).scale();
                    this.$box.css({
                        transform: "scale(" + scale.sx + "," + scale.sy + ")",//No i18n
                        transformOrigin: '0 0',
                        width: bbox.width / scale.sx,
                        height: bbox.height / scale.sy,
                        left: bbox.x,
                        top: bbox.y
                    });
                } else {
                    this.$box.find("[data-name='status']").text(this.model.get('label'));
                }
            },
            removeBox: function(evt) {
                if(this.model.get('division')!="stencil") {
                    var links=rlc.canvas.graph.getConnectedLinks(this.model);
                    for(var i=0;i<links.length;i++) {
                         links[i].remove();
                    }
                }
                this.$box.remove();
                this.remove();
                setTimeout(function(){
                    rlc.load_stencil();
                    rlc.canvas.refresh_ports();
                },1);
            }
        });
        rlc.manager = Backbone.Model.extend({
            defaults: rlc.manager_defaults,
            PREFIX_LENGTH: 7,
            initialize: function(options) {
                _.bindAll(this, 'initBatchOperation', 'storeBatchOperation'); //No i18N
                this.graph = options.graph;
                this.reset();
                this.listen();
            },
            listen: function() {
                this.listenTo(this.graph, 'all', this.addOperation, this); //No i18N
                this.listenTo(this.graph, 'batch:start', this.initBatchOperation, this); //No i18N
                this.listenTo(this.graph, 'batch:stop', this.storeBatchOperation, this); //No i18N
            },
            createOperation: function(options) {
                var oprn = {
                    action: undefined,
                    data: {
                        id: undefined,
                        type: undefined,
                        previous: {},
                        next: {}
                    },
                    batch: options && options.batch
                }
                return oprn;
            },
            addOperation: function(oprnName, cell, graph, options) {
                if (!this.get('oprnNameRegex').includes(oprnName)) {
                    return;
                }
                if (typeof this.get('oprnBeforeAdd') == 'function' && !this.get('oprnBeforeAdd').apply(this, arguments)) {
                    return;
                }
                var push = _.bind(function(oprn) {
                    this.redoStack = [];
                    if (!oprn.batch) {
                        this.undoStack.push(oprn);
                        this.trigger('add', oprn); //No i18N
                    } else {
                        this.lastOprnIndex = Math.max(this.lastOprnIndex, 0);
                        // Operations possible thrown away. Someone might be interested.
                        this.trigger('batch', oprn); //No i18N
                    }
                }, this);
                var operation = undefined;
                if (this.batchOperation) {
                    // set operation as the one used last.
                    // in most cases we are working with same object, doing same action
                    // etc. translate an object piece by piece
                    operation = this.batchOperation[Math.max(this.lastOprnIndex, 0)];
        
                    // Check if we are start working with new object or performing different action with it.
                    // Note, that operation is uninitialized when lastOprnIndex equals -1. (see 'initBatchOperation()') 
                    // in that case we are done, operation we were looking for is already set
                    if (this.lastOprnIndex >= 0 && (operation.data.id !== cell.id || operation.action !== oprnName)) {
                        // trying to find operation first, which was performing same action with the object
                        // as we are doing now with cell
                        operation = _.find(this.batchOperation, function(oprn, index) {
                            this.lastOprnIndex = index;
                            return oprn.data.id === cell.id && oprn.action === oprnName;
                        }, this);
        
                        if (!operation) {
                            // operation with such an id and action was not found. Let's create new one
                            this.lastOprnIndex = this.batchOperation.push(this.createOperation({
                                batch: true
                            })) - 1;
                            operation = _.last(this.batchOperation);
                        }
                    }
        
                } else {
                    // single operation
                    operation = this.createOperation();
                    operation.batch = false;
                }
        
                if (oprnName === 'add' || oprnName === 'remove') {
                    operation.action = oprnName;
                    operation.data.id = cell.id;
                    operation.data.type = cell.attributes.type;
                    operation.data.attributes = _.merge({}, cell.toJSON());
                    operation.options = options || {};
                    return push(operation);
                }
        
                // `changedAttribute` holds the attribute name corresponding
                // to the change event triggered on the model.
                var changedAttribute = oprnName.substr(this.PREFIX_LENGTH);
                if (!operation.batch || !operation.action) {
                    // Do this only once. Set previous box and action (also serves as a flag so that
                    // we don't repeat this branche).
                    operation.action = oprnName;
                    operation.data.id = cell.id;
                    operation.data.type = cell.attributes.type;
                    operation.data.previous[changedAttribute] = _.clone(cell.previous(changedAttribute));
                    operation.options = options || {};
                }
                operation.data.next[changedAttribute] = _.clone(cell.get(changedAttribute));
                return push(operation);
            },
            initBatchOperation: function() {
                if (!this.batchOperation) {
                    this.batchOperation = [this.createOperation({
                        batch: true
                    })];
                    this.lastOprnIndex = -1;
                    // batch level counts how many times has been initBatchOperation executed.
                    // It is useful when we doing an operation recursively.
                    this.batchLevel = 0;
                } else {
                    // batch operation is already active
                    this.batchLevel++;
                }
            },
        
            storeBatchOperation: function() {
                // In order to store batch operation it is necesary to run storeBatchOperation as many times as 
                // initBatchOperation was executed
                if (this.batchOperation && this.batchLevel <= 0) {
                    // checking if there is any valid operation in batch
                    // for example: calling `initBatchOperation` immediately followed by `storeBatchOperation`
                    if (this.lastOprnIndex >= 0) {
                        this.redoStack = [];
                        this.undoStack.push(this.batchOperation);
                        this.trigger('add', this.batchOperation); //No i18N
                    }
        
                    delete this.batchOperation;
                    delete this.lastOprnIndex;
                    delete this.batchLevel;
        
                } else if (this.batchOperation && this.batchLevel > 0) {
                    // low down batch operation level, but not store it yet
                    this.batchLevel--;
                }
            },
            revertOperation: function(operation) {
                this.stopListening();
                var batchOperation;
                if (_.isArray(operation)) {
                    batchOperation = operation;
                } else {
                    batchOperation = [operation];
                }
                for (var i = batchOperation.length - 1; i >= 0; i--) {
                    var oprn = batchOperation[i],
                        cell = this.graph.getCell(oprn.data.id);
                    switch (oprn.action) {
                        case 'add': //No i18N
                            cell.remove();
                            break;
                        case 'remove': //No i18N
                            this.graph.addCell(oprn.data.attributes);
                            break;
                        default:
                            var attribute = oprn.action.substr(this.PREFIX_LENGTH);
                            cell.set(attribute, oprn.data.previous[attribute]);
                            break;
                    }
                    if (typeof this.get("methods")[oprn.action] == 'function' && !this.get("methods")[oprn.action].apply(this, arguments)) {
                              return;
                    }
                }
                this.listen();
            },
            applyOperation: function(operation) {
                this.stopListening();
                var batchOperation;
                if (_.isArray(operation)) {
                    batchOperation = operation;
                } else {
                    batchOperation = [operation];
                }
                for (var i = 0; i < batchOperation.length; i++) {
                    var oprn = batchOperation[i],
                        cell = this.graph.getCell(oprn.data.id);
                    switch (oprn.action) {
                        case 'add': //No i18N
                            this.graph.addCell(oprn.data.attributes);
                            break;
                        case 'remove': //No i18N
                            cell.remove();
                            break;
                        default:
                            var attribute = oprn.action.substr(this.PREFIX_LENGTH);
                            cell.set(attribute, oprn.data.next[attribute]);
                            break;
                    }
                    if (typeof this.get("methods")[oprn.action] == 'function' && !this.get("methods")[oprn.action].apply(this, arguments)) {
                        return;
                    }
                }
                this.listen();
            },
            undo: function() {
                var operation = this.undoStack.pop();
                if (operation) {
                    this.revertOperation(operation);
                    this.redoStack.push(operation);
                }
            },
            redo: function() {
                var operation = this.redoStack.pop();
                if (operation) {
                    this.applyOperation(operation);
                    this.undoStack.push(operation);
                }
            },
            cancel: function() {
                if (this.hasUndo()) {
                    this.revertOperation(this.undoStack.pop());
                    this.redoStack = [];
                }
            },
            reset: function() {
                this.undoStack = [];
                this.redoStack = [];
            },
            hasUndo: function() {
                return this.undoStack.length > 0;
            },
        
            hasRedo: function() {
                return this.redoStack.length > 0;
            }
        });
    }
}

function getAllowedValue(data) {
    var field = data[1];
    var values = data[2];
    var result = "";
    if (field && field != "0") {
        var type = jQuery("#rule_tabs").find('.active a').attr('data-name');
        if(type && rlc.metainfo[type].rule_criteria[field]){
            return e_html(rlc.metainfo[type].rule_criteria[field].display_name);
        }
        else{
            return type&&("<strike>"+e_html(rlc.general_meta_info[type].rule_criteria[field].display_name)+"<strike>");
        }
    }
    return result.slice(0, -1);
}
function math(data) {
    var a = data[1];
    var operator = data[2];
    var b = data[3];
    switch (operator) {
        case "add":return a + b;break;//No i18n
        case "diff":return a - b;break;//No i18n
    }
}
function CriteriaChildren(rule,metainfo,general_meta_info,skipfirst, udfKey = 'udf_fields'){ //NO I18N
    var html="";
    for(var i=0;i<rule.length;i++) {
        var criteria=rule[i];
		//criteria.values ? criteria.values=criteria.values : criteria.values = [null];//No i18n
		if(criteria.values == undefined) {
			var val = criteria.value;
		} else {
			var val = criteria.values;
		}
		
		var cField = criteria.field;
		var udf = false,res = false;
		if(cField.indexOf(udfKey) != -1) {
			cField = cField.replace(udfKey+ '.','');
			udf = true;
		}
		if(cField.indexOf('resources') != -1) {
			cField = cField.replace('resources.','');
			res = true;
		}
		var fInfo = cField.split('.')[0];
		var prevVal = false;
		if(criteria.field.indexOf('${old')!=-1) {
			var getField = cField.replace('${old.','').replace('}','');
				fInfo = getField.split('.')[0];
				cField = getField;
				if(["eq","neq"].indexOf(criteria.condition)==-1) {
					prevVal = true;
				}
		}
		if(udf) {
			var field_info=metainfo[udfKey].fields[fInfo];
			var general_field_info=general_meta_info[udfKey].fields[fInfo];
		} else if(res) {
			var field_info=metainfo.resources.fields[fInfo];
			var general_field_info=general_meta_info.resources.fields[fInfo];
		} else {
			var field_info=metainfo[fInfo];
			var general_field_info=general_meta_info[fInfo];
		}
		var field=(field_info&& e_html(field_info.display_name));
		if(cField.split('.').length == 2) {
			if(field_info.fields == undefined) {
				var field_infoObj="."+cField.split('.')[1].charAt(0).toUpperCase() + cField.split('.')[1].slice(1);
				var field_info1= field + field_infoObj;
			} else {
				var field_infoObj=field_info.fields[cField.split('.')[1]];
				var field_info1= field + ('.'+ e_html(field_infoObj.display_name));
			}
			field=field_info1;
		}
        if(!field && general_field_info) {
            field="<strike>"+e_html(general_field_info.display_name)+"</strike>";
        }
        if(field){
            var condition=rlc.findIndex(getAllowedConditions(general_field_info),criteria.condition,"name");//no i18n
            if(!condition) {
                if(criteria.condition=="is"){
                    condition=translate("sdp.condition.1");
                }
                if(criteria.condition=="is not"){
                    condition=translate("sdp.condition.2");
                }
                if(criteria.condition=="eq"){
                    condition=translate("common.isnotmodified");
                }
                if(criteria.condition=="neq"){
                     condition=translate("common.ismodified");
                }
                if(criteria.condition=="contains"){
                    condition=translate("sdp.criteria.14");
                }
                if(criteria.condition=="not contains"){
                    condition=translate("sdp.criteria.15");
                }
                if(criteria.condition=="starts with"){
                    condition=translate("sdp.criteria.16");
                }
                if(criteria.condition=="ends with"){
                    condition=translate("sdp.criteria.17");
                }
                if(criteria.condition=="between"){
                    condition=translate("sdp.criteria.26");
                }
                if(criteria.condition=="not between"){
                    condition=translate("common.notbetween");
                }
                if(criteria.condition=="greater than"){
                    condition=translate("sdp.condition.9");
                }
                if(criteria.condition=="lesser than"){
                    condition=translate("sdp.condition.10");
                }
                if(criteria.condition=="greater or equal"){
                    condition=translate("sdp.condition.11");
                }
                if(criteria.condition=="lesser or equal"){
                    condition=translate("sdp.condition.12");
                }
                if(criteria.condition=="on"){
                    condition=translate("sdp.condition.13");
                }
                if(criteria.condition=="not on"){
                    condition=translate("sdp.condition.not.on");
                }
                if(criteria.condition=="after"){
                    condition=translate("sdp.condition.14");
                }
                if(criteria.condition=="on or after"){
                    condition=translate("sdp.condition.on.after");
                }
                if(criteria.condition=="before"){
                    condition=translate("sdp.condition.15");
                }
                if(criteria.condition=="on or before"){
                    condition=translate("sdp.condition.on.before");
                }
                if(criteria.condition=="is empty"){
                    condition=translate("sdp.admin.rule.addrule.condition.isempty");
                }
                if(criteria.condition=="is not empty"){
                    condition=translate("sdp.admin.rule.addrule.condition.isnotempty");
                }
                if(criteria.condition=="is changed"){
                    condition=translate("common.ismodified");
                }
                if(criteria.condition=="is not changed"){
                    condition=translate("common.isnotmodified");
                }
            } else {
                condition=getAllowedConditions(general_field_info)[condition].display_name;
            }
            //Append previous value to condition
            if(prevVal) {
                condition = translate('sdp.inventory.detailWS.prevvalue') + ' > ' + condition;
            }
            var values;
			if(criteria.field=="maintenance"){
				if(criteria.condition=="is"&&criteria.values&&criteria.values.length>0&&criteria.values[0]==null){
					val[0]="false";
				}
				else if(criteria.condition=="is not"&&criteria.values&&criteria.values.length>0&&criteria.values[0]==null){
					val[0]="true";
					condition=translate("sdp.condition.1");
				}
			}
            if(["is","is not"].indexOf(criteria.condition)!=-1 && val==null || ["neq","eq"].indexOf(criteria.condition)!=-1 && val.indexOf("${new") == 0){
                 values=translate("sdp.common.empty");//No i18n
            } else if (general_field_info.type != "date") {//No I18N
                if(general_field_info.type=="boolean"||criteria.field=="maintenance"){
                    values=val[0]=="true"?translate("sdp.common.true"):translate("sdp.common.false");
                }
				if(general_field_info.lookup_entity == 'site' && val) {
					for(var j=0; j<val.length; j++) {
						if(val[j] == null) {
							val[j] = {"id":"-1","name":translate("common.site.nosite")};//No i18n
						}
					}
				}
                values=commaSeperator(["", val]);
            } else {
                if((val[0].id && val[0].id.startsWith("$(")) || val[0].startsWith("$(")){
                    values=commaSeperator(["", val]);
                }else{
                    values=new Date(parseInt(val[0])).toDateString();
                    if(criteria.condition == "between" || criteria.condition == "not between"){
                        values = values + ", " + new Date(parseInt(val[1])).toDateString();
                    }
                }
            }
			html+='<span class="fl fw">';
			if(criteria.children != undefined) {
				html+='<span class="cspr down-arrow1 icon-xs" style="background-position: -221px -8px;"></span>';
			}
            if(skipfirst == "condition") {
                html+='<span class="text-muted">('+(criteria.logical_operator=="and"?translate("sdp.requests.fieldFormRules.operators.and"):translate("sdp.requests.fieldFormRules.operators.or")).toUpperCase()+')</span>';
            }
            html+='<span class="sb" style="color: #CE5408;"> '+field+' </span>';
            html+='<span class="text-muted ml5 mr5"> '+condition.toUpperCase()+' </span>';
            html+='<span class="sb">'+values+'</span>';
			if(criteria.children != undefined) {
				html+='<span class="fl fw pl15">' + CriteriaChildren(criteria.children, metainfo, general_meta_info, "condition") + ' </span> ';
			}
			skipfirst = "condition";//No i18n
			html+='</span>';
        }
    }
    return html;
}
function fieldupdateInner(data){
    /**
     * Type is undefined in some cases; this issue also occurs in the RRAF branch.
     * For safety purposes, we use a try-catch method.
     */
    try{
        var html="";
        var type=data[2];
        var metainfo = rlc.metainfo[type].rule_action.field_update; 
        var general_meta_info = rlc.general_meta_info[type].rule_action.field_update;
        var rule=cloneJson(data[1]);
        for(var i=0;i<rule.length;i++) {
            var udf = false,res = false;
            var field = rule[i].name;
            var update_config = rule[i].update_config;
            if(field.indexOf('udf_fields') != -1) {
                field = field.replace('udf_fields.','');
                udf = true;
            }
            if(field.indexOf('resources') != -1) {
                field = field.replace('resources.','');
                res = true;
            }
            if(field.indexOf('group.') != -1) {
                rule[i].display_name = metainfo.group.display_name + '.' + metainfo.group.fields.name.display_name;
            }
            var fInfo = rule[i]
            if(udf) {
                var field_info=metainfo.udf_fields.fields[field];
                var general_field_info=general_meta_info.udf_fields.fields[field];
            } else if(res) {
                var field_info=metainfo.resources.fields[field];
                var general_field_info=general_meta_info.resources.fields[field];
            } else {
                var field_info=metainfo[field];
                var general_field_info=general_meta_info[field];
            }
            var dispname=e_html(rule[i].display_name);
            if(!field_info && general_field_info) {
                dispname="<strike>"+e_html(rule[i].display_name)+"</strike>";
            }
            var condition=translate("sdp.condition.1").toUpperCase();
            if(rule[i].display_value == null) {
                if(rule[i].name == 'site') {
                    rule[i].display_value = {'id': '-1', 'name': translate('common.site.nosite')};//No i18n
                } else {
                    rule[i].display_value = {'id': '-1', 'name': translate('common.none')};//No i18n
                }
            }
            if(rule[i].value == "$(current_user)") {
                rule[i].display_value = "$"+translate("sdp.common.loggedinuser");
            }
            else if(rule[i].value == "$(today)") {
                rule[i].display_value = translate("sdp.common.today");
            }
            else if(rule[i].value == "$(yesterday)") {
                rule[i].display_value = translate("sdp.common.yesterday");
            }
            else if(rule[i].value == "$(this_month)") {
                rule[i].display_value = translate("sdp.common.thismonth");
            }
            else if(rule[i].value == "$(last_month)") {
                rule[i].display_value = translate("sdp.common.lastmonth");
            }
            else if(rule[i].value == "$(this_week)") {
                rule[i].display_value = translate("sdp.common.thisweek");
            }
            else if(rule[i].value == "$(last_week)") {
                rule[i].display_value = translate("sdp.common.lastweek");
            }
            var value=(rule[i].display_value.name) ? rule[i].display_value.name : rule[i].display_value;
            if(general_field_info != undefined && general_field_info.multiple && general_field_info.type == "lookup" &&  value != undefined && Array.isArray(value) && value.length > 0)
            {  var nameArr = [];
            for(var k=0; k<value.length; k++)
                {
                    nameArr.push(value[k].name);
                }
                value = nameArr;
            }
            if(i !=0 ) {
                html+='<span class="pr10"> ; </span>';
            }
            //update config display
            if(update_config != undefined && update_config.operation && general_field_info.update_config && general_field_info.update_config[update_config.operation] != undefined){
            var updateConfigDisp = general_field_info.update_config[update_config.operation].display_name;
            dispname = dispname + " > " + e_html(updateConfigDisp);
            }

            //alias enitity display
            if(rule[i].display_value.alias_entity!=undefined && general_field_info.alias_entities && general_field_info.alias_entities[rule[i].display_value.alias_entity] != undefined){
            var aliasEntityDisp = general_field_info.alias_entities[rule[i].display_value.alias_entity].display_name;
            dispname = dispname + " > " + e_html(aliasEntityDisp);
            }
            html+='<span><span class="sb">'+dispname+'</span><span class="text-muted ml5 mr5">'+condition+'</span><span class="sb">'+e_html(value)+'</span></span>';
        }
        return html;
    }catch(error){
       //console.warn(error);
    }
}
function CriteriaInner(data){
    var rule=cloneJson(data[1]);
    var type=data[2]||jQuery("#rule_tabs").find('.active a').attr('data-name');
	if(!type){
		return;
	}
	return CriteriaChildren(rule, rlc.metainfo[type].rule_criteria, rlc.general_meta_info[type].rule_criteria);
}
function Criteria(data){
    var rule=data[1];
    var type=data[2]||jQuery("#rule_tabs").find('.active a').attr('data-name');
    var html="";
    for(var i=0;i<rule.length;i++) {
        var criteria=rule[i];
        criteria.values ? criteria.values=criteria.values : criteria.values = [null];
        if(!type){
            return;
        }
        rlc.getMetaInfo();
        criteria.field=="group.name" ? criteria.field="group" : null;//No i18n
        criteria.field=="closure_info.closure_code" ? criteria.field="closure_info" : null;//No i18n
        criteria.field=="closure_info.closure_comments" ? criteria.field="closure_info" : null;//No i18n
        var field_info=rlc.metainfo[type].rule_criteria[criteria.field];
        var general_field_info=rlc.general_meta_info[type].rule_criteria[criteria.field];
        var field=(field_info&& e_html(field_info.display_name));
        if(!field && general_field_info) {
            field="<strike>"+e_html(general_field_info.display_name)+"</strike>";
        }
        if(field){
            var condition=rlc.findIndex(getAllowedConditions(general_field_info),criteria.condition,"name");//no i18n
            if(!condition){
                if(criteria.condition=="is"){
                    condition=translate("sdp.condition.1");
                }
                if(criteria.condition=="is not"){
                    condition=translate("sdp.condition.2");
                }
            } else {
                condition=getAllowedConditions(general_field_info)[condition].display_name;   
            }
            var values;
            if(["is","is not"].indexOf(criteria.condition)!=-1 && criteria.values&& criteria.values[0]==null){
                 values=translate("sdp.common.empty");//No i18n
            }
            else if (criteria.field.indexOf("date") == -1) {
                if(general_field_info.type=="boolean"){
                    values=criteria.values[0]=="true"?translate("sdp.common.true"):translate("sdp.common.false");
                }
                values=commaSeperator(["", criteria.values]);
            } else {
                return new Date(parseInt(data.values[0]));
            }
            if(i!=0){
                html+='<span class="text-muted"> '+(criteria.logical_operator=="and"?translate("sdp.requests.fieldFormRules.operators.and"):translate("sdp.requests.fieldFormRules.operators.or")).toUpperCase()+' </span>';
            }
            html+='<span class="sb"> '+field+' </span>';
            html+='<span class="text-muted ml5 mr5"> '+condition.toUpperCase()+' </span>';
            html+='<span class="sb">'+values+'</span>';
        }
    }
    return html;
}
function commaSeperator(data) {
    var key = data[2];
    data = data[1];
    var result = "";
    for (var i = 0; i < data.length; i++) {
		if(data[i] == null) {//if value none then add none value
			result = result + translate('common.none') + ((data.length - 1) != i ? ", ":"");
		} else if((data[i] && data[i].id && data[i].id == "$(current_user)") || data[i] == "$(current_user)") {
			result = result + "$"+translate("sdp.common.loggedinuser") + ((data.length - 1) != i ? ", ":"");
		}
		else if((data[i] && data[i].id && data[i].id == "$(today)") || data[i] == "$(today)") {
		    result = result + translate("sdp.common.today") + ((data.length - 1) != i ? ", ":"");
        }
        else if((data[i] && data[i].id && data[i].id == "$(yesterday)") || data[i] == "$(yesterday)") {
            result = result + translate("sdp.common.yesterday") + ((data.length - 1) != i ? ", ":"");
        }
        else if((data[i] && data[i].id && data[i].id == "$(this_month)") || data[i] == "$(this_month)") {
            result = result + translate("sdp.common.thismonth") + ((data.length - 1) != i ? ", ":"");
        }
        else if((data[i] && data[i].id && data[i].id == "$(last_month)") || data[i] == "$(last_month)") {
            result = result + translate("sdp.common.lastmonth") + ((data.length - 1) != i ? ", ":"");
        }
        else if((data[i] && data[i].id && data[i].id == "$(this_week)") || data[i] == "$(this_week)") {
            result = result + translate("sdp.common.thisweek") + ((data.length - 1) != i ? ", ":"");
        }
        else if((data[i] && data[i].id && data[i].id == "$(last_week)") || data[i] == "$(last_week)") {
            result = result + translate("sdp.common.lastweek") + ((data.length - 1) != i ? ", ":"");
        }
        else {
			if (!data[i] && data[i] != '') {
				break;
			}
			var word = e_html(data[i][key] || data[i].name || data[i].display_name || data[i]);
			if(data[i].is_deleted)
			{
				word='<span class="text-warning">'+word+'</span>';
			}
			if(typeof data[i].is_active == "boolean" && !data[i].is_active){
				word='<strike>'+word+'</strike>';
			}
			var csi = "";
            if(data[i].subcategory && data[i].subcategory.category && !(data[i].name).includes(data[i].subcategory.name + " > "))
            {
                csi = e_html(csi + data[i].subcategory.category.name) + " > " + e_html(data[i].subcategory.name) + " > " + e_html(data[i].name);
            }
            else if(data[i].category && !(data[i].name).includes(data[i].category.name + " > "))
            {
                csi = csi + e_html(data[i].category.name) + " > " + e_html(data[i].name);
            }
            else
            {
                csi = csi + word;
            }
            result = result + csi + ((data.length - 1) != i ? ", ":"");
		}
    }
    return result;
}

function countLines(element) {
    var prevLH = element.style.lineHeight;
    var factor = 1000;
    element.style.lineHeight = factor + 'px';
    var height = element.getBoundingClientRect().height;
    element.style.lineHeight = prevLH;
    return Math.floor(height / factor);
}
function expandmorefn($this) {
    if(jQuery($this).closest('[data-id=more]').attr('data-more') == 'true') {
        jQuery($this).text(jQuery($this).attr('data-value-less'));//no i18n
        jQuery($this).closest('[data-id=more]').attr('data-more','false').css('height','auto');//no i18n
    } else {
        jQuery($this).text(jQuery($this).attr('data-value-more'));//no i18n
        jQuery($this).closest('[data-id=more]').attr('data-more','true').css('height','');//no i18n
    }
}

function capitalize(data){
    return data[1].toUpperCase();
}
function getAllowedConditions(fieldObj){
    var allowed_conditions = [];
    var operators = {
        is: {
            key: "is",  //NO I18N
            display: translate("sdp.admin.rule.addrule.condition.is"),  //NO I18N
            supp_types: ["lookup", "approvers_list", "string", "text", "html", "int", "float", "double", "long", "boolean", "date", "datetime", "timediff", "simple", "checkbox", "multipicklist", "sequence_number"]       //NO I18N
        },
        are: {
            key: "are", //NO I18N
            display: translate("sdp.admin.rule.addrule.condition.are"), //NO I18N
            supp_types: ["checkbox", "approvers_list", "multipicklist"]     //NO I18N
        },
        is_not: {
            key: "is not",  //NO I18N
            display: translate("sdp.admin.rule.addrule.condition.isnot"),   //NO I18N
            supp_types: ["lookup", "approvers_list", "string", "text", "html", "int", "long", "float", "double", "boolean", "date", "datetime", "timediff", "simple", "checkbox", "multipicklist", "sequence_number"]       //NO I18N
        },
        is_empty: {
            key: "is empty",    //NO I18N
            display: translate("sdp.admin.rule.addrule.condition.isempty"), //NO I18N
            supp_types: ["lookup", "approvers_list", "string", "text", "html", "float", "double", "int", "long", "simple", "checkbox", "multipicklist", "date", "sequence_number"],     //NO I18N
            isprefunc: !0,
            value: null,
            replacekey: "is"    //NO I18N
        },
        is_not_empty: {
            key: "is not empty",    //NO I18N
            display: translate("sdp.admin.rule.addrule.condition.isnotempty"),  //NO I18N
            supp_types: ["lookup", "approvers_list", "string", "text", "html", "float", "double", "int", "long", "simple", "checkbox", "multipicklist", "date", "sequence_number"],     //NO I18N
            isprefunc: !0,
            value: null,
            replacekey: "is not"    //NO I18N
        },
        contains: {
            key: "contains",    //NO I18N
            display: translate("sdp.admin.rule.addrule.condition.contains"),    //NO I18N
            supp_types: ["html", "string", "text"]      //NO I18N
        },
        not_contains: {
            key: "not contains",    //NO I18N
            display: translate("sdp.admin.rule.addrule.condition.dncontain"),   //NO I18N
            supp_types: ["html", "string", "text"]      //NO I18N
        },
        starts_with: {
            key: "starts with", //NO I18N
            display: translate("sdp.admin.rule.addrule.condition.begins"),  //NO I18N
            supp_types: ["string", "text"]      //NO I18N
        },
        ends_with: {
            key: "ends with",   //NO I18N
            display: translate("sdp.admin.rule.addrule.condition.ends"),    //NO I18N
            supp_types: ["string", "text"]      //NO I18N
        },
        greater_than: {
            key: "greater than",    //NO I18N
            display: translate("sdp.common.greaterthan"),   //NO I18N
            supp_types: ["float", "double", "int", "long", "date", "datetime", "timediff", "sequence_number"]       //NO I18N
        },
        lesser_than: {
            key: "lesser than", //NO I18N
            display: translate("sdp.common.lesserthan"),    //NO I18N
            supp_types: ["float", "double", "int", "long", "date", "datetime", "timediff", "sequence_number"]       //NO I18N
        },
        greater_or_equal: {
            key: "greater or equal",    //NO I18N
            display: translate("sdp.common.greaterorequal"),    //NO I18N
            supp_types: ["float", "double", "int", "long", "date", "datetime", "timediff", "sequence_number"]       //NO I18N
        },
        lesser_or_equal: {
            key: "lesser or equal", //NO I18N
            display: translate("sdp.common.lesserorequal"), //NO I18N
            supp_types: ["float", "double", "int", "long", "date", "datetime", "timediff", "sequence_number"]       //NO I18N
        },
        between: {
            key: "between", //NO I18N
            display: translate("sdp.admin.rule.addrule.condition.between"), //NO I18N
            supp_types: ["float", "double", "int", "long"]      //NO I18N
        },
        not_between: {
            key: "not between", //NO I18N
            display: translate("sdp.admin.rule.addrule.condition.notbetween"),  //NO I18N
            supp_types: ["float", "double", "int", "long"]      //NO I18N
        }
    }

    //Generate allowed conditions using static data
    for(var ops in operators) {
        if(operators[ops].supp_types.indexOf(fieldObj.type) != -1) {  
            allowed_conditions.push({name: operators[ops].key, display_name: operators[ops].display});
        } 
    }
    return allowed_conditions;
}
