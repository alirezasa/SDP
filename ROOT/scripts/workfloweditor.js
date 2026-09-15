//$Id$

var panning = false;
var padding = 50;
var mousePosition = { x: 0, y: 0 };
var defConditionNodeWidth = 145;
var defBaseNodeWidth = 150;
var defNodeHeight = 100;
var graphPadding = 30;  // Padding so links on statements can be added without going beyond origin

// Misc. variables
var cacheIdNameMap = {};
var submissionStage, closeStage;
var paperTranslationVal;
var wf_rtl_enabled = (parent.sdp_user.DIRECTION == "RTL") ? true : false; //No i18N
var wf_datas = {};

var customHighlighter = {
  highlighter: {
    name: 'addClass',//No i18N
    options: {
      className: 'highlighted'//No i18N
    }
  }
};

var errorHighlighter = {
  highlighter: {
    name: 'addClass',   //No i18n
    options: {
      className: 'error-highlighted'  //No i18n
    }
  }
};

var instanceLinkHighlighter = {
  highlighter: {
    name: 'addClass', //No i18N
    options: {
      className: 'instance-link-highlighted'  //No i18n
    }
  }
};

var instanceNodeHighlighter = {
  highlighter: {
    name: 'addClass', //No i18N
    options: {
      className: 'instance-node-highlighted'  //No i18n
    }
  }
};

var instanceCurrentNodeHighlighter = {
  highlighter: {
    name: 'addClass', //No i18N
    options: {
      className: 'instance-current-node-highlighted'  //No i18n
    }
  }
};

var loopHighlighter = {
  highlighter: {
    name: 'addClass',         //No i18N
    options: {
      className: 'loop-highlighted' //No i18N
    }
  }
};

var WorkflowEditorInstance = (function () {
  var instance;
  function createInstance() {
    return new WorkflowEditor();
  }
  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

function WorkflowEditor() {
  // Default options for Workflow Editor
  var def_options = { canvas_id: 'wf_canvas_container', stencil_id: 'wf_stencil_inner_container', canvas_width: 880, canvas_height: 600, stencil_width: 290, stencil_height: 800, module: wf_datas.module }  //No I18N
  var options = {};

  // Paper declarations for Stencil and Canvas
  var canvasPaper = null;
  var stencilPaper = null;
  var operationManager = null;

  // Graph declarations for Stencil and Canvas
  var canvasGraph = new joint.dia.Graph();
  var stencilGraph = new joint.dia.Graph();
  var isGraphChanged = false;
  var WorkflowStencil = joint.dia.Paper.extend({
    options: _.extend(_.extend({}, joint.dia.Paper.prototype.options), {
      gridSize: 2,
      interactive: false,
      perpendicularLinks: true
    }
    ),
    initialize: function () {
      var offset = {};
      var flyPapperSize = { width: 270, height: 30 };
      joint.dia.Paper.prototype.initialize.apply(this, arguments);

      this.on('cell:pointerdown', function (cellView, evt, x, y) {       //No i18N
        jQuery('#wf_paper_holder').append('<div id="wf_fly_paper"></div>');   //No i18N
        var flyGraph = new joint.dia.Graph(),
          wf_fly_paper = new joint.dia.Paper({
            el: jQuery('#wf_fly_paper'),
            model: flyGraph,
            interactive: false,
            width: flyPapperSize.width,
            height: flyPapperSize.height
          }),
          flyShape = cellView.model.clone(),
          pos = cellView.model.position();

        flyShape.set('size', flyPapperSize);//No i18N
        flyShape.attr('.flyRectBody/width', flyPapperSize.width, { silent: true });
        flyShape.attr('.flyRectBody/height', flyPapperSize.height, { silent: true });
        flyShape.attr('text/ref-x', 40, { silent: true });
        flyShape.attr('text/ref-y', 15, { silent: true });
        flyShape.attr('.flyImage/ref-x', 13, { silent: true });
        flyShape.attr('.flyImage/ref-y', 7, { silent: true });

        offset = {
          x: x - pos.x,
          y: y - pos.y
        };

        flyShape.position(0, 0);
        flyGraph.addCell(flyShape);

        jQuery("#wf_fly_paper").offset({
          left: evt.pageX - offset.x,
          top: evt.pageY - offset.y
        });

        jQuery('body').on('mousemove.fly', function (e) {  //No i18N
          jQuery("#wf_fly_paper").offset({
            left: e.pageX,
            top: e.pageY
          });
          jQuery('#wf_rhs').css({ zIndex: 1 });
          jQuery('#wf_fly_paper').css({ zIndex: 2 });
        });
      });

      this.on('cell:pointerup', function (cellView, evt, x1, y1) {  //No i18N
        jQuery('#wf_rhs, #wf_fly_paper').css({ zIndex: 'auto' });        //No i18N
        var target = canvasPaper.options.el.offset();
        var isDroppedOverPaper = jQuery(evt.target).closest('#wf_rhs').length == 0;  //No i18N
        var x = evt.pageX,
          y = evt.pageY;
        // Dropped over paper ?
        if (isDroppedOverPaper && x > target.left && x < target.left + canvasPaper.options.el.width() && y > target.top && y < target.top + canvasPaper.options.el.height()) {
          var gobj = cellView.model.attributes.attrs.origobj;
          var canvasPaperTranslation = V(canvasPaper.viewport).translate();
          if (!canvasPaperTranslation.ty) {
            canvasPaperTranslation.ty = 0;
          }
          //Position set as per scale when adding node if paper is zoomed in/out
          var canvasPaperScale = V(canvasPaper.viewport).scale();
          var posX = (x - target.left - offset.x - canvasPaperTranslation.tx) / canvasPaperScale.sx;
          var posY = (y - target.top - offset.y - canvasPaperTranslation.ty) / canvasPaperScale.sy;
          wf_datas.x_position = posX;
          wf_datas.y_position = posY;
          var module = options.module.toLowerCase();

          // Show node input dialogs
          if (gobj.type == 'stage') {
            wf_datas.wf_self.controller.send("wf_init_multivalue_popup", { "wf_popup_name": "stage" }); //No i18N
          }
          else if (gobj.type == 'notification') {
            wf_datas.wf_self.controller.send("wf_notify_popup", { "wf_popup_name": "wf_notification" }); //No i18N
          }
          else if (gobj.type == 'approval') {
            wf_datas.wf_self.controller.send("wf_init_announce_popup", { "wf_popup_name": "wf_approval" }); //No i18N
          }
          else if (gobj.type == 'condition') {
            wf_datas.wf_self.controller.send("wf_condition_popup"); //No i18N
          }
          else if (gobj.type == 'switch') {
            wf_datas.wf_self.controller.send("wf_init_multivalue_popup", { "wf_popup_name": "switch" }); //No i18N
          }
          else if (gobj.type == 'fieldupdate') {
            wf_datas.wf_self.controller.send("wf_notify_popup", { "wf_popup_name": "wf_field_update" }); //No i18N
          }
          else if (wf_datas.wrapper && typeof wf_datas.wrapper.stencilHooks[gobj.type] == "function") {
            wf_datas.wrapper.stencilHooks[gobj.type]();
          }
          else {
            jQuery('#wf_fly_paper').remove();
            showalert('failure', translate("sdp.admin.workflows.node.supported.error"), "isAutoHide=false"); // No I18N
          }
        }
        else {
          // Alert if not dropped over paper
          jQuery('#wf_fly_paper').remove();
          showalert('info', translate("sdp.admin.workflows.node.droponpaper"), "isAutoHide=true"); // No I18N
        }
        jQuery('body').off('mousemove.fly').off('mouseup.fly');//No i18N
      });
      this.reset();
    },

    reset: function () {
      this.model.resetCells();
    },

    load: function (stencil_data) {
      //Populate stencil graph with flow symbols
      var stencilArr = [];
      jQuery.each(stencil_data, function (arrayID, group) {
        var attrs = {
          rect: { fill: group.fill, width: 270, height: 30, rx: 3, ry: 3, stroke: group.stroke },
          text: { text: group.name, fill: '#666', 'ref-x': 0.15, 'ref-y': 0.50, 'font-size': 12, 'text-anchor': 'start' },//No i18N
          origobj: group
        };
        /** If the imgname attribute is not present then image attribute will not be set to avoid showing the image in the stencil
         *  Since the image is not shown the space between rect and text will be reduced
        */
        if (!group.imgname) {
          attrs.text['ref-x'] = 0.05;   //NO I18N
        } else {
          attrs.image = { 'xlink:href': group.imgname, width: 16, height: 16, 'ref-x': 0.05, 'ref-y': 0.25 }; //No i18N
        }
        var sobj = new joint.shapes.workfloweditor.stencilele({
          position: { x: group.x, y: group.y },
          size: { width: 270, height: 30 },
          attrs: attrs
        });
        stencilArr.push(sobj);
      });
      stencilGraph.addCells(stencilArr);
    }

  });

  //Generic Canvas for Workflow
  var WorkflowCanvas = joint.dia.Paper.extend({
    linkErrorMsg: "",
    options: _.extend(_.extend({}, joint.dia.Paper.prototype.options), {
      gridSize: 10,
      defaultLink: defaultLink,
      interactive: true,
      perpendicularLinks: true,
      linkConnectionPoint: joint.util.shapePerimeterConnectionPoint,
      multiLinks: false,
      snapLinks: true,
      restrictTranslate: true,
      markAvailable: true,
      async: true,
      linkView: joint.dia.LinkView.extend({
        initialize: function () {
          var linkToolMarkup = this.model.toolMarkup;
          var linkVertexMarkup = this.model.vertexMarkup;
          linkToolMarkup = linkToolMarkup.replace('Remove link.', translate("zeditor.unlink"));
          linkVertexMarkup = linkVertexMarkup.replace("Remove vertex.", translate("sdp.admin.workflow.workflowediotr.linktools.removevertex"));
          this.model.set('toolMarkup', linkToolMarkup);//No i18N
          this.model.set('vertexMarkup', linkVertexMarkup);//No i18N
          joint.dia.LinkView.prototype.initialize.apply(this, arguments);
        },
        _markAvailableMagnets: function () {
          this.markingAvailableMagnets = true;
          joint.dia.LinkView.prototype._markAvailableMagnets.apply(this, arguments);
          this.markingAvailableMagnets = false;
        },
        onRemove: function () {
          if (this.sourceMagnet) {
            V(this.sourceMagnet).removeClass("has-out-links");
          }
          if (!wf_datas.isInitialData && wf_datas.wrapper && wf_datas.wrapper.removeConnector && typeof wf_datas.wrapper.removeConnector == "function") {
            wf_datas.wrapper.removeConnector(this.model);
          }
        },
        onRender: function () {
          if (this.sourceMagnet) {
            V(this.sourceMagnet).addClass("has-out-links");
          }
        }
      })
    }),

    initialize: function () {
      var initialEnd;
      var wfOptions = {};
      var prevTranslation;
      this.model = canvasGraph;
      joint.dia.Paper.prototype.initialize.apply(this, arguments);

      this.on('blank:pointerdown', function (event, x, y) {//No i18N
        var scale = V(this.viewport).scale();
        dragStartPosition = { x: x * scale.sx, y: y * scale.sy };
        prevTranslation = V(canvasPaper.viewport).translate();
        jQuery("#wf_main_container").find(".joint-paper").css("cursor", "move"); //No i18N
        unhighlightNodes();
      });

      this.on('blank:pointerup', function (event, x, y) {
        jQuery("#wf_main_container").find(".joint-paper").css("cursor", "default");  //No i18N
        if (prevTranslation && paperTranslationVal) {
          // Don't go beyond the viewport origin
          var paperBBox = canvasPaper.getContentBBox();
          if (paperBBox.x < 0 && paperBBox.y < 0) {
            canvasPaper.setOrigin(prevTranslation.tx, prevTranslation.ty);
          } else if (paperBBox.x < 0) {
            canvasPaper.setOrigin(prevTranslation.tx, paperTranslationVal.ty);
          } else if (paperBBox.y < 0) {
            canvasPaper.setOrigin(paperTranslationVal.tx, prevTranslation.ty);
          }
          prevTranslation = undefined;
        }
        dragStartPosition = undefined;
      });

      this.on('cell:pointerup', function (cellView, x, y) {//No i18N
        dragStartPosition = undefined;
      });

      this.on("link:connect", function (linkView, evt, elementViewConnected, magnet, arrowhead) {
        // Prevent links from ports that already have a link
        var port = jQuery(magnet).attr('port');
        var portLinks = [];
        var links = canvasGraph.getConnectedLinks(elementViewConnected.model, { outbound: true });
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          if (link.attributes.source.port == port) {
            portLinks.push(link);
          }
        }
        if (portLinks && portLinks.length > 1) {
          var elem = linkView.model;
          if (elem instanceof joint.dia.Link) {
            var source = elem.attributes.source;
            var target = elem.attributes.target;
            if (initialEnd) {
              elem.set(arrowhead, initialEnd, { ui: true });
              return;
            }
          }
        }
        this.linkErrorMsg = "";//clearing errorMsg if any on if link connected successfully
        if (linkView.sourceMagnet) {
          V(linkView.sourceMagnet).addClass("has-out-links");
        }
        if (!wf_datas.isInitialData && wf_datas.wrapper && wf_datas.wrapper.addConnector && typeof wf_datas.wrapper.addConnector == "function") {
          wf_datas.wrapper.addConnector(linkView.model);
        }
      });

      this.on("link:disconnect", function (linkView, evt, elementView, magnet, arrowhead) {
        if (arrowhead == "source") {
          V(magnet).removeClass("has-out-links");
        }
      });

      this.on('render:done', function (opt) {//No i18N
        wfOptions = getOptions();

        if ((wfOptions.module == "change" || wfOptions.module == "release")) {
          // Disabling deleting, changing in/out ports of the link connecting Start and Submission - Requested
          var startNode;
          jQuery.each(getCellsByType("workfloweditor.StartEndNode"), function (idx, cell) {  //No i18N
            if (cell.get("is_start_node") === true) {
              startNode = cell;
              return false;
            }
          });
          if (startNode) {
            var links = canvasGraph.getConnectedLinks(startNode, {
              outbound: true
            });
            if (links.length) {
              links[0].findView(canvasPaper).options.interactive = {
                arrowheadMove: false
              };
              jQuery("g[model-id='" + links[0].id + "'] .link-tools .tool-remove").remove();
            }
          }
        }

        if (!opt.add) {
          setCanvasGraphChanged(false);
          return;
        }

        // automatically resize the paper - Edit Case
        updateWFViewPortLayout();

        var $svg = jQuery(canvasPaper.svg);
        if (opt.changes) {
          var addedCell = opt.changes.added[0];
          highlightNode(addedCell.findView(canvasPaper));
        }
        jQuery("#wf_canvas_loader .loading1").remove();
        setPortSelectorForLinks();

        // set the initial graph data in editor options
        if (opt.initialCanvasGraphData) {
          setOptions({ 'initialCanvasGraphData': canvasPaper.model.toJSON() });            //No i18N
          if (jQuery.isEmptyObject(wf_datas.wrapper)) {
            // update the order of stage after rendering
            updateStageNodesOrder();
          } else {
            //Update the Node Header for Options Menu and Action Node
            if (wf_datas.wrapper.updateNodeTypeName && typeof wf_datas.wrapper.updateNodeTypeName == "function") {
              wf_datas.wrapper.updateNodeTypeName();
            }
          }
        }
        canvasPaper.listenTo(canvasPaper.model, 'change add remove reset', adjustPaper);        //No I18n
        canvasPaper.listenTo(canvasPaper.model, 'change remove', doListenForGraphChanges);        //No I18n
        canvasPaper.on('translate', adjustPaper);

        setOptions({
          initial_size: {
            height: $svg.height(),
            width: $svg.width()
          }
        });

        // Reset the undo/redo stack when resetting graph
        if (opt.initialCanvasGraphData || opt.loadExistingCanvasGraphData) {
          operationManager.reset();
        }
      });

      this.on('cell:pointerdown', function (cellView, evt, x1, y1) {//No i18N
        panning = true;
        mousePosition.x = evt.pageX;
        mousePosition.y = evt.pageY;
        var elem = cellView.model;
        if (elem instanceof joint.dia.Element) {
          var dragStartPoint = jQuery(evt.target).closest('.joint-element').attr('transform').match(/\d+/g);//No i18N
          if (dragStartPoint.length == 2) {
            mousePosition.x = +dragStartPoint[0];
            mousePosition.y = +dragStartPoint[1];
          }
        }
        highlightNode(cellView);
      });

      this.on('cell:pointerup', function (cellView, evt, x1, y1) {//No i18N
        var elem = cellView.model;
        if (elem instanceof joint.dia.Link) {
          // display error tip if invalid connection
          if (this.linkErrorMsg.length > 0) {
            showalert('failure', this.linkErrorMsg, "isAutoHide=false"); // No I18N
            this.linkErrorMsg = "";
          }
        }
        else if (elem instanceof joint.dia.Element) {
          //Node dropped over another node reverse to its original position
          // Find the first element below that is not a link nor the dragged element itself.
          var elementBelow = canvasGraph.get('cells').find(function (cell) {
            if (cell instanceof joint.dia.Link) { return false; }// Not interested in links.
            if (cell.id === cellView.model.id) { return false; }// The same element as the dropped one.
            if (cell.getBBox().containsPoint(g.point(x1, y1))) {
              return true;
            }
            return false;
          });

          if (elementBelow) {
            cellView.model.position(mousePosition.x, mousePosition.y);
          }
        }
        panning = false;
      });

      this.on('element:collapse', function (cellView, evt, x1, y1) {
        evt.stopPropagation();
        if (wf_datas.wrapper) {
          if (wf_datas.wrapper.module === 'zia-bot') {
            var nodeType = cellView.model.get('type').slice('workfloweditor.'.length);  //NO I18N
            if (typeof wf_datas.wrapper.shapes[nodeType].branchView.expand == "function") {
              wf_datas.wrapper.shapes[nodeType].branchView.expand(cellView.model, evt);
            }
          }
        }
      });

      this.on('cell:pointermove', function (cellView, evt, x1, y1) {//No i18N
        var elem = cellView.model;
        if (elem instanceof joint.dia.Link) {
          if (cellView._initialEnd) {
            initialEnd = cellView._initialEnd;
          }
        }
        var svgHeight = canvasPaper.svg.getBBox().height;
        var svgWidth = canvasPaper.svg.getBBox().width;

        var nodeWidth = cellView.getBBox().width;
        var nodeHeight = cellView.getBBox().height;
        if (panning) {
          //Providing extra space for the node while dragging when it hits the border of a paper
          var heightVal = svgHeight + padding >= canvasPaper.options.height ? svgHeight + nodeHeight : canvasPaper.options.height;
          var widthVal = svgWidth + padding >= canvasPaper.options.width ? svgWidth + nodeWidth : canvasPaper.options.width;
          canvasPaper.setDimensions(widthVal, heightVal);

          this.options.width = widthVal;
          this.options.height = heightVal;
          jQuery('#' + options.canvas_id).width(widthVal);
          jQuery('#' + options.canvas_id).height(heightVal);
        }
      });
    },

    sortViews: _.noop,

    beforeRenderViews: function () {
      this.documentFragment = document.createDocumentFragment();
    },

    add: function (constructor, options) {
      var element = new constructor(options);
      this.model.addCells([element]);
      return element;
    }
  });

  // Canvas for Change workflow
  var ChangeWorkflowCanvas = WorkflowCanvas.extend({

    options: _.extend(_.extend({}, WorkflowCanvas.prototype.options), {
      validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
        //return (magnetS !== magnetT);

        // Don't connect to the ports that already has outgoing links
        if (end == "source" && magnetS && linkView.sourceMagnet !== magnetS && V(magnetS).hasClass("has-out-links")) {
          return false;
        }

        // Prevent loop linking
        if (magnetS == magnetT) {
          if (!linkView.markingAvailableMagnets) {
            this.linkErrorMsg = translate('sdp.admin.workflow.validation.diffsrcandtar');
          }
          return false;
        }

        var source = cellViewS ? cellViewS.model : undefined;
        var target = cellViewT ? cellViewT.model : undefined;
        var sourceType = source ? source.get('type') : undefined;
        var targetType = target ? target.get('type') : undefined;
        var sourcePort = magnetS ? jQuery(magnetS).attr('port') : undefined;
        var targetPort = magnetT ? jQuery(magnetT).attr('port') : undefined;
        var sourceMagnetType = magnetS ? magnetS.getAttribute('type') : undefined;
        var targetMagnetType = magnetT ? magnetT.getAttribute('type') : undefined;

        // Prevent linking from Start Node to nodes other than Submission - Requested
        if (sourceType == 'workfloweditor.StartEndNode' && source.get('is_start_node') == true) {
          if (target) {
            var submissionStageCell = getStageCell(wfGetInternalName('Submission'))[0];
            var requested = submissionStageCell.get('options').filter(function (option) { return option.internal_name == wfGetInternalName('Requested'); });   //No i18N
            if (targetType == 'workfloweditor.Stage' && target.get('stage_internal_name') == wfGetInternalName('Submission')) {
              if (magnetT && targetPort != "input_" + encodeURIComponent(requested[0].name)) {
                if (!linkView.markingAvailableMagnets) {
                  this.linkErrorMsg = translate('sdp.admin.workflow.validation.startsubmission', [requested[0].name, submissionStageCell.get("name")]);
                }
                return false;
              }
            } else {
              if (!linkView.markingAvailableMagnets) {
                this.linkErrorMsg = translate('sdp.admin.workflow.validation.startsubmission', [requested[0].name, submissionStageCell.get("name")]);
              }
              return false;
            }
          }
        }

        // Prevent linking to End Node from nodes other than Close
        if (targetType == 'workfloweditor.StartEndNode' && target.get('is_start_node') == false) {
          if (source && (sourceType != 'workfloweditor.Stage' || source.get('stage_internal_name') != wfGetInternalName('Close'))) {
            var closeStageCell = getStageCell(wfGetInternalName('Close'))[0];
            if (!linkView.markingAvailableMagnets) {
              this.linkErrorMsg = translate('sdp.admin.workflow.validation.endclose', [closeStageCell.get("name")]);
            }
            return false;
          }
        }

        if (source && source.get('stage_internal_name') == wfGetInternalName('Close')) {
          var completedStatus = source.get('options').filter(function (option) { return option.internal_name == wfGetInternalName('Completed'); });  //NO i18n
          if (completedStatus.length) {
            if (sourcePort == 'output_' + completedStatus[0].name && target && (targetType != 'workfloweditor.StartEndNode' || target.get('is_start_node') != false)) {
              if (!linkView.markingAvailableMagnets) {
                this.linkErrorMsg = translate('sdp.admin.workflow.validation.completeend', [completedStatus[0].name]);
              }
              return false;
            }
          }
        }

        // Prevent recursive linking --- Prevent linking from output ports to input ports within one element.
        if (cellViewS == cellViewT) {
          if (sourceType == 'workfloweditor.Stage') {
            // check if linking inport and outport of same value
            if (sourcePort && targetPort && sourcePort.slice('output'.length) == targetPort.slice('input'.length)) {
              if (!linkView.markingAvailableMagnets) {
                this.linkErrorMsg = translate('sdp.admin.workflow.validation.diffsrcandtar');
              }
              return false;
            }
          }
          else if (sourceType != 'workfloweditor.Switch') {
            if (!linkView.markingAvailableMagnets) {
              this.linkErrorMsg = translate('sdp.admin.workflow.validation.diffsrcandtar');
            }
            return false;
          }
        }

        // Prevent linking from input ports.
        if (sourceMagnetType === 'input') {
          return false;
        }

        // Prevent linking to input ports.
        if (targetMagnetType && targetMagnetType !== 'input') {
          if (!linkView.markingAvailableMagnets) {
            this.linkErrorMsg = translate('sdp.admin.workflow.validation.targetinput');
          }
          return false;
        }


        //Hook to validate the link in wrapper
        if (wf_datas.wrapper && wf_datas.wrapper.validateConnection && typeof wf_datas.wrapper.validateConnection == "function") {
          if (!wf_datas.wrapper.validateConnection(cellViewS, magnetS, cellViewT, magnetT, end, linkView, this)) {
            return false;
          }
        }

        this.linkErrorMsg = "";
        return true;
      },

      validateMagnet: function (cellView, magnet) {
        // Note that this is the default behaviour. Just showing it here for reference.
        // Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
        if (magnet.getAttribute('magnet') === 'passive') {
          return false;
        }

        // If unlimited connections attribute is null, we can only ever connect to one object
        // If it is not null, it is an array of type strings which are allowed to have unlimited connections
        var unlimitedConnections = magnet.getAttribute('unlimitedConnections');
        var links = canvasGraph.getConnectedLinks(cellView.model);
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          if (link.attributes.source.id === cellView.model.id && link.attributes.source.port === magnet.attributes.port.nodeValue) {
            // This port already has a connection
            if (unlimitedConnections && link.attributes.target.id) {
              var targetCell = canvasGraph.getCell(link.attributes.target.id);
              if (unlimitedConnections.indexOf(targetCell.attributes.type) !== -1) {
                return true; // It's okay because this target type has unlimited connections
              }
            }
            return false;
          }
        }
        return true;
      }
    })

  });

  function doListenForGraphChanges() {
    if (!isGraphChanged) {
      isGraphChanged = true;
    }
  }

  function onMouseMove(event) {
    if (typeof dragStartPosition === "undefined") { return; }
    paperTranslationVal = {
      tx: event.offsetX - dragStartPosition.x,
      ty: event.offsetY - dragStartPosition.y
    };
    canvasPaper.setOrigin(paperTranslationVal.tx, paperTranslationVal.ty);
  }

  function offsetToLocalPoint(x, y) {
    var svgPoint = canvasPaper.svg.createSVGPoint();
    svgPoint.x = x;
    svgPoint.y = y;
    // Transform point into the viewport coordinate system.
    var pointTransformed = svgPoint.matrixTransform(canvasPaper.viewport.getCTM().inverse());
    return pointTransformed;
  }

  /** Get Workflow Editor Options **/
  var getOptions = function () {
    return jQuery.extend(options, def_options);
  };

  var processHistory = function (history) {
    if (!history || history.length === 0) {
      return false;
    }
    var wf_new_history = [];
    jQuery.each(history, function (key, value) {
      var wf_opertaion = value.operation;
      value.display_operation_name = translate("sdp.workflow.history." + e_html(wf_opertaion));
      if (wf_opertaion.indexOf("statement") >= 0) { // No I18N
        var wf_type_index, wf_stage_internal_name;
        jQuery.each(value.diff, function (index, diff) {
          if (diff.field.name === "type") { // No I18N
            wf_type_index = index;
          }
          if (diff.field.name === "stage_internal_name") {
            wf_stage_internal_name = diff.current_value ? diff.current_value : diff.previous_value;
          }
        });
        var wf_statement_diff = value.diff[wf_type_index];
        value.diff.splice(wf_type_index, 1);
        if (wf_stage_internal_name) {
          value.diff.splice(value.diff.indexOf(value.diff.filter(function (d) { return d.field.name == "stage_internal_name" })[0]), 1); //NO I18N
        }
        var statementType = wf_statement_diff.current_value ? wf_statement_diff.current_value : wf_statement_diff.previous_value;
        if (statementType == "StartEndNode") { // No I18N
          return;
        }
        //Restricting history for default stages [submission, close]
        if (wf_stage_internal_name && (wf_stage_internal_name == wfGetInternalName('Submission') || wf_stage_internal_name == wfGetInternalName('Close'))) { // No I18N
          return;
        }
        var wf_keys = (wf_opertaion == "statement_add") ? "added" : "deleted"; // No I18N
        value.display_operation_name = translate("api." + wf_keys + ".success", [getI18NedStatementType(e_html(statementType))]); // No I18N 
      }
      var object_values = Object.keys(value.diff).map(function (e) {
        return value.diff[e];
      });
      if (typeof (object_values[0]) === 'object') {
        jQuery.each(value.diff, function (keydiff, valuediff) {
          var wf_field_name = valuediff.field.name;
          wf_field_name = e_html(wf_field_name);
          if (!(wf_field_name === 'id' || wf_field_name === 'file_id') && valuediff.previous_value !== undefined) {
            if (valuediff.current_value !== null && (typeof (valuediff.current_value) === 'object' || valuediff.current_value.trim() !== "")) {
              var current_value = valuediff.current_value;
              if ((wf_opertaion.match(/connector_(add|delete)/g) && (wf_field_name === "source" || wf_field_name === "target"))) {
                current_value = WorkflowEditorInstance.getInstance().getTransformedConnectorForWorkflowHistory(current_value, wf_field_name);
                var wf_current_str = "<p><strong>" + wf_field_name + " : </strong>" + e_html(current_value) + "</p>";
                value["display_string_" + wf_field_name] = wf_current_str;
              }
              else {
                value["display_string_" + wf_field_name] = "<p><strong>" + translate("sdp.common.name") + " : </strong>" + e_html(current_value) + "</p>"; // No I18N
              }
            }
            if (valuediff.previous_value !== null && (typeof (valuediff.previous_value) === 'object' || valuediff.current_value.trim() !== "")) {
              var previous_value = valuediff.previous_value;
              if (wf_opertaion.match(/connector_(add|delete)/g) && (wf_field_name === "source" || wf_field_name === "target")) {
                previous_value = WorkflowEditorInstance.getInstance().getTransformedConnectorForWorkflowHistory(previous_value, wf_field_name);
                var wf_prev_str = "<p><strong>" + wf_field_name + " : </strong>" + e_html(previous_value) + "</p>";
                value["display_string_" + wf_field_name] = wf_prev_str;
              } else {
                value["display_string_" + wf_field_name] = "<p><strong>" + translate("sdp.common.name") + " : </strong>" + e_html(previous_value) + "</p>"; // No I18N
              }
            }
            if (wf_field_name == "validated") {
              value["display_string_" + wf_field_name] = "<p>" + translate("sdp.workflow.history.validated") + " " + translate("sdp.problem.history.knownerror.msg", [e_html(previous_value), e_html(current_value)]) + "</p>"; // No I18N
            }
            if (wf_field_name == "type") {
              value["display_string_" + wf_field_name] = "<p>" + translate("common.type") + " " + translate("sdp.problem.history.knownerror.msg", [e_html(previous_value), e_html(current_value)]) + "</p>"; // No I18N
            }
            if (wf_field_name == "description") {
              value["display_string_" + wf_field_name] = "<p>" + translate("sdp.common.description") + " " + translate("sdp.problem.history.knownerror.msg", [e_html(previous_value), e_html(current_value)]) + "</p>"; // No I18N
            }
            if (wf_field_name == "is_default") {
              value["display_string_" + wf_field_name] = "<p>" + translate("common.default") + " " + translate("sdp.problem.history.knownerror.msg", [e_html(previous_value), e_html(current_value)]) + "</p>"; // No I18N
            }
            if (wf_field_name == "name" && previous_value != undefined && current_value != undefined) {
              value["display_string_" + wf_field_name] = "<p>" + translate("sdp.common.name") + " " + translate("sdp.problem.history.knownerror.msg", [e_html(previous_value), e_html(current_value)]) + "</p>"; // No I18N
            }
            if (wf_field_name == "inactive") {
              value["display_string_" + wf_field_name] = "<p>" + translate("sdp.project.projectstatusattribute.isdeleted") + " " + translate("sdp.problem.history.knownerror.msg", [e_html(previous_value), e_html(current_value)]) + "</p>"; // No I18N
            }
            if (wf_field_name == "allowed_stages_config") {
              const valueDisplayValueMapping = {
                "ALL_STAGES": translate("workflow.show.all.stage.status"), // No I18N
                "ONLY_WF_STAGES": translate("workflow.show.only.configured.stage.status") // No I18N
              };
              value["display_string_" + wf_field_name] = "<p><strong>" + translate("workflow.stage.status.visibility") + "</strong> " + translate("sdp.problem.history.knownerror.msg", [e_html(valueDisplayValueMapping[previous_value]), e_html(valueDisplayValueMapping[current_value])]) + "</p>"; // No I18N
            }
          }
        });
      }
      wf_new_history.push(value);
    });
    return wf_new_history;
  };

  var getTransformedConnectorForWorkflowHistory = function (value, fieldName) {
    var stmt = value[fieldName + "_statement"].name; //NO I18N
    if (!stmt) {
      stmt = value[fieldName + "_statement"].id; //NO I18N
    }
    var port = null;
    if (value[fieldName + "_port"]) {
      port = value[fieldName + "_port"].name; //NO I18N
      if (port) {
        if (port === "input" || port === "output") { //NO I18N
          port = port[0].toUpperCase() + port.substr(1);
        } else if (port.match(/(input|output)_.*/)) {
          port = port.split('_', 2)[1];
        }
      } else {
        port = value[fieldName + "_port"].id;
      }
    }
    return stmt + " :: " + port;
  };

  /** Set Workflow Editor Options **/
  var setOptions = function (userOptions) {
    jQuery.extend(options, def_options, userOptions);
  };

  /** Initialize Canvas Graph and draw **/
  var draw = function (useroptions) {
    options = {};
    jQuery.extend(options, def_options, useroptions);

    //Setting height and width for canvas & stencil
    options.canvas_height = jQuery('#' + options.canvas_id).height();
    options.canvas_width = jQuery('#' + options.canvas_id).width();
    options.stencil_height = jQuery('#' + options.stencil_id).height();
    options.stencil_width = jQuery('#' + options.stencil_id).width();
    if (!wf_datas.is_view) {
      var stencilOptions = {
        el: jQuery('#' + options.stencil_id),
        height: options.stencil_height,
        width: options.stencil_width,
        model: stencilGraph,
        interactive: false
      };
      stencilPaper = new WorkflowStencil(stencilOptions);
      stencilPaper.load(options.stencil_data);
    }
    //Creating workflow canvas goes here
    var canvasOptions = {
      el: jQuery('#' + options.canvas_id),
      height: options.canvas_height,
      width: options.canvas_width,
      model: canvasGraph
    };

    if (options.module == 'change' || options.module == 'release' || wf_datas.wrapper.module) {
      canvasPaper = new ChangeWorkflowCanvas(canvasOptions);
      canvasPaper.model.clear();
      canvasPaper.model.fromJSON(options.canvas_data);
      canvasPaper.$el.on('mousemove', onMouseMove); //No I18n
      operationManager = new joint.workfloweditor.OperationManager({ graph: canvasGraph });
    }
    else {
      // General Workflow Canvas, Not for change module
      canvasPaper = new WorkflowCanvas(canvasOptions);
      canvasPaper.model.fromJSON(JSON.parse(options.canvas_data));
    }
  };

  /** Add a node to canvas paper **/
  var addNode = function (constructor, nodeOptions) {
    var node = null;
    if (nodeOptions.position) {
      var canvasPaperTranslation = V(canvasPaper.viewport).translate();
      // when graph is negatively translated, if dropping a node on the negative area,
      // adjust the position of the node within the graph padding, so node will always be in the positive position
      if (canvasPaperTranslation.tx + nodeOptions.position.x < 0) {
        nodeOptions.position.x = graphPadding - canvasPaperTranslation.tx;
      }
      if (canvasPaperTranslation.ty + nodeOptions.position.y < 0) {
        nodeOptions.position.y = graphPadding - canvasPaperTranslation.ty;
      }
    }
    if (nodeOptions.type == "workfloweditor.Stage") {
      node = addStageNode(constructor, nodeOptions);
    }
    else {
      node = canvasPaper.add(constructor, nodeOptions);
    }
    jQuery('#wf_fly_paper').remove();
    return node;
  };

  /** Add multiple nodes to canvas paper **/
  var addNodes = function (cells, addOptions) {
    canvasPaper.model.addCell(cells, addOptions);
  };

  /** Add node of type Stage and update stage order **/
  var addStageNode = function (constructor, options) {
    canvasPaper.model.trigger("batch:start", { batchName: "add-stage" });  //No i18N
    var cell = canvasPaper.add(constructor, options);
    cell.updateStageOrder(options.stage_index, null, false);
    canvasPaper.model.trigger("batch:stop", { batchName: "add-stage" }); //No i18N
    return cell;
  };

  /** Returns link object for the given source and target **/
  var createLink = function (options) {
    var targetType = options.target.type;
    // To make connector deletion available
    var canDelete = true;
    if (options.attributes) {
      canDelete = options.attributes.candelete_target;
    }
    var link = new joint.shapes.logic.Wire({
      markup: '<path class="connection" stroke="black" d="M 0 0 0 0"/>' + //No i18N
        '<path class="marker-source" fill="black" stroke="black" d="M 0 0 0 0"/>' + //No i18N
        '<path class="marker-target" fill="black" stroke="black" d="M 0 0 0 0"/>' + //No i18N
        '<path class="connection-wrap" d="M 0 0 0 0"/>' + //No i18N
        '<g class="labels"/>' + //No i18N
        '<g class="marker-vertices"/>' + //No i18N
        '<g class="marker-arrowheads"/>' + //No i18N
        (canDelete ? '<g class="link-tools"/>' : '') + //No i18N
        '<title />',//No i18N
      router: { name: 'manhattan', args: {} },//No i18N
      connector: { name: 'jumpover' },//No i18N
      vertices: options.vertices,
      attributes: options.attributes,
      id: options.id,
      name: options.name,
      attrs:
      {
        '.connection': { stroke: '#ccc' },  //No i18N
        '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' },//No i18N
        '.link-tools .tool-remove circle, .marker-vertex': { r: 11 }//No i18N
      },
      source: { id: options.source.id, port: options.sourcePort, type: options.source.type, name: options.source.name },
      target: { id: options.target.id, port: options.targetPort, type: options.target.type, name: options.target.name }
    });
    return link;
  };

  /** Add link to the canvas paper between the given source and target **/
  var addLink = function (options) {
    var link = createLink(options);
    canvasPaper.model.addCell(link);
    link.toBack();
    return link;
  };

  /** Get links that connects the given source and target ports **/
  var getLink = function (options) {
    var links = canvasPaper.model.getLinks();
    for (var i = 0; i < links.length; i++) {
      if (links[i].attributes.source.id == options.source.id && links[i].attributes.target.id == options.target.id && links[i].attributes.source.port == options.sourcePort && links[i].attributes.target.port == options.targetPort) {
        return links[i];
      }
    }
  };

  /** Set selectors of the source and target of each connected magnet **/
  var setPortSelectorForLinks = function () {
    var links = canvasGraph.getLinks();
    jQuery.each(links, function (idx, link) {
      var source = link.get("source");
      if (!source.selector && source.id) {
        var sourceView = getCell(source.id).findView(canvasPaper);
        var sourceEscapeSelector = jQuery.escapeSelector(source.port);
        var $sourceMagnet = sourceView.$el.find("circle.port-body[port='" + sourceEscapeSelector + "']");
        source.selector = sourceView.getSelector($sourceMagnet[0]);
        $sourceMagnet.addClass("has-out-links");
        link.set("source", source);   //No i18N
      }

      var target = link.get("target");
      if (!target.selector && target.id) {
        var targetCell = getCell(target.id);
        if (targetCell) {
          var targetView = targetCell.findView(canvasPaper);
          var targetEscapeSelector = jQuery.escapeSelector(target.port);
          target.selector = targetView.getSelector(targetView.$el.find("circle.port-body[port='" + targetEscapeSelector + "']")[0]);
          link.set("target", target);   //No i18N
        }
      }
    });
  };

  /** Update the node model and attributes **/
  var updateNode = function (constructor, options) {
    var cell = canvasPaper.model.getCell(options.id);
    var type = options.type;
    var splitType = type.split(".")[1];
    if (type == "workfloweditor.Stage" || type == "workfloweditor.Switch") {
      cell.findView(canvasPaper).addOption(options.options);
    } else if (type == "workfloweditor.Approval") { //No i18N
      cell.findView(canvasPaper).updateApproval(options);
    } else if (type == "workfloweditor.Notification") {  //No i18N
      cell.findView(canvasPaper).updateNotification(options);
    } else if (type == "workfloweditor.Condition") { //No i18N
      cell.findView(canvasPaper).updateCondition(options);
    } else if (type == "workfloweditor.FieldUpdate") { //No i18N
      cell.findView(canvasPaper).updateFieldUpdateDetails(options);
    } else if (wf_datas.wrapper && typeof wf_datas.wrapper.shapes[splitType].branchView[splitType + "Update"] == "function") {
      wf_datas.wrapper.shapes[splitType].branchView[splitType + "Update"](cell.findView(canvasPaper), options);
    }
  };

  /** Reorders stage cells **/
  var organizeStageCells = function (orderedCells) {
    canvasPaper.model.trigger("batch:start", { batchName: "reorder-stages" });  //No I18N
    for (var i = 0; i < orderedCells.length; i++) {
      var cell = getCell(orderedCells[i]);
      cell.set("stage_order", i + 1);   //No I18N
      cell.appendStageOrder(cell);
    }
    canvasPaper.model.trigger("batch:stop", { batchName: "reorder-stages" });   //No I18N
  };

  /** Setting stage order based on the stage_index value **/
  var setOrderByStageIndex = function (stageCells) {
    canvasPaper.model.trigger("batch:start", { batchName: "reorder-stages" });  //No I18N
    stageCells.sort(function (a, b) {
      return a.get('stage_index') - b.get('stage_index');
    });
    for (var i = 0; i < stageCells.length; i++) {
      stageCells[i].set('stage_order', i + 1);
      stageCells[i].appendStageOrder(stageCells[i]);
    }
    canvasPaper.model.trigger("batch:stop", { batchName: "reorder-stages" });   //No I18N
  };

  /** Update stage order based on stage index **/
  var updateStageNodesOrder = function () {
    var stageCells = getCellsByType("workfloweditor.Stage");  //NO i18n
    var stageIndexBased = stageCells[0].get("stage_order") == null;
    if (stageIndexBased) {
      // set stage_order for all stage nodes based on stage index
      setOrderByStageIndex(stageCells);
    } else {
      // using stage_order from DB
      for (var i = 0; i < stageCells.length; i++) {
        stageCells[i].appendStageOrder(stageCells[i]);
      }
    }
  };

  /** Returns canvas paper **/
  var getCanvasPaper = function () {
    return canvasPaper;
  };

  /** Returns the cell by ID **/
  var getCell = function (id) {
    return canvasPaper.model.getCell(id);
  };

  /** Returns cells of given type **/
  var getCellsByType = function (type) {
    return jQuery.grep(canvasPaper.model.getCells(), function (value) {
      return value.get("type") == type;
    });
  };

  /** Returns stage cell for the given stage internal name **/
  var getStageCell = function (internal_name) {
    return jQuery.grep(getCellsByType("workfloweditor.Stage"), function (stageCell) {    //No i18N
      return stageCell.get("stage_internal_name") == internal_name;
    });
  };

  /** Returns name of the connector
   * format: `Source_Node_Type : Source_Node_Name Source_Node_Port ::: Target_Node_Type : Target_Node_Name Target_Node_Port`
  **/
  var getConnectorName = function (options) {
    var sourcePort, targetPort, sourceType, targetType, transformedSourcePortName, transformedTargetPortName;
    if (options.link) {
      var link = options.link;
      if (link.get('name')) {
        return link.get('name');
      }
      var source = getCell(link.get('source').id);
      var target = getCell(link.get('target').id);
      sourcePort = link.get('source').port;
      targetPort = link.get('target').port;
      sourceType = source.get('type').slice('workfloweditor.'.length);  //No i18N
      targetType = target.get('type').slice('workfloweditor.'.length);  //No i18N
      transformedSourcePortName = source.get('name');
      transformedTargetPortName = target.get('name');
    } else {
      sourcePort = options.source.port;
      targetPort = options.target.port;
      sourceType = options.source.type;
      targetType = options.target.type;
      transformedSourcePortName = options.source.name;
      transformedTargetPortName = options.target.name;
    }
    if (sourcePort.indexOf('output_') == 0) {
      transformedSourcePortName = transformedSourcePortName + ' ' + sourcePort.substring("output_".length);
    } else if (sourcePort == 'Yes' || sourcePort == 'No') {         //No i18N
      transformedSourcePortName = transformedSourcePortName + ' ' + sourcePort;
    }
    if (targetPort.indexOf('input_') == 0) {
      transformedTargetPortName = transformedTargetPortName + ' ' + targetPort.substring("input_".length);
    }
    return decodeURIComponent(getI18NedStatementType(sourceType) + ' : ' + transformedSourcePortName + ' ::: ' + getI18NedStatementType(targetType) + ' : ' + transformedTargetPortName);
  };

  /** Returns canvas graph data in API format **/
  var getGraphData = function (isEdit) {
    var canvasData = canvasGraph.toJSON();
    var nodeData = [], connectorData = [];
    var isStrictMode;
    var statementAttributes = {
      StartEndNode: ["is_start_node"],
      Stage: ["stage_internal_name","stage_id", "statuses"],  //No i18N
      Condition: ["criteria"],
      Switch: ["field", "is_udf", "options"], //No i18N
      Approval: ["notify_to", "subject", "content", "approval_rule","approval_rule_value"],  //No i18N
      start: ["start"],
      multiSelectNode: ["options", "id", "node_id", "internal_name", "can_delete_node"],   //NO I18N
      userInput: ["options", "id", "internal_name"],    //NO I18N
      action: ["options", "id", "node_id", "is_default", "action", "custom_function_id", "internal_name", "view_details"],  //NO I18N
      output: ["options", "id"],    //NO I18N
      furtherAssistance: ["options", "id"], //NO I18N
      feedback: ["options", "id"],  //NO I18N
      button: ["button"]
    };

    // Branch node names are encoded for specifying port names
    function decodeAttributeForOptions(attributeValues) {
      for (var j = 0; j < attributeValues.length; j++) {
        if (attributeValues[j].internal_name) {
          attributeValues[j].internal_name = decodeURIComponent(attributeValues[j].internal_name.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
        }
        if (attributeValues[j].name) {
          attributeValues[j].name = decodeURIComponent(attributeValues[j].name.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
        }
      }
      return attributeValues;
    }

    // Get unique statement key
    function getKey(cell, key_counter) {
      var cellType = cell.get('type').slice('workfloweditor.'.length);  //No i18N
      var wfOptions = getOptions();
      var key;
      if (cellType == "Stage") {
        key = cellType + "_" + cell.get('stage_internal_name') + "_" + cell.get('stage_order') + "_" + (key_counter ? key_counter : (++wfOptions.counter[cellType]));
      }
      else if (cellType == "StartEndNode") {
        key = (cell.get('is_start_node') ? 'start' : 'end');    //No i18N
      }
      else if (cellType == "FieldUpdate" || cellType == "Switch" || cellType == "Notification" || cellType == "Approval" || cellType == "Condition") {
        key = cellType + "_" + cell.get('name') + "_" + (key_counter ? key_counter : (++wfOptions.counter[cellType]));
      } else {
        key = cellType;
      }
      cell.set('key', key);   //No i18N
      return key;
    }

    // Get updated statement key
    function getModifiedKey(cell) {
      var oldKey = cell.get('key');
      return getKey(cell, oldKey.substring(oldKey.lastIndexOf('_') + 1));
    }
    var viewPortTranslation = V(canvasPaper.viewport).translate();
    for (var i = 0; i < canvasData.cells.length; i++) {
      if (canvasData.cells[i].type == 'logic.Wire') {
        // Formatting connectors
        var data = {};

        // In Edit mode, retain the original connector ID
        if (isEdit && (wf_datas.wrapper && wf_datas.wrapper.module === 'zia-bot' || !isNaN(canvasData.cells[i].id))) {
          data.id = canvasData.cells[i].id;
        }

        var source = getCell(canvasData.cells[i].source);
        var target = getCell(canvasData.cells[i].target);
        var source_key = source.get('key') ? getModifiedKey(source) : getKey(source);
        data.source = { "source_statement": { "key": source_key}, "source_port": decodeURIComponent(canvasData.cells[i].source.port) };  //No i18n
        if((wf_datas.wrapper && wf_datas.wrapper.module == 'zia-bot') || target){
          var target_key = target.get('key') ? getModifiedKey(target) : getKey(target);
        data.target = { "target_statement": { "key": target_key}, "target_port": decodeURIComponent(canvasData.cells[i].target.port) };  //No i18N
        }else{
          data.target = {};
        }
        if(wf_datas.wrapper && wf_datas.wrapper.module === 'zia-bot') {
          data.source.source_statement.id = source.get('id');
          data.target.target_statement.id = target.get('id');
        }

        data.attributes = canvasData.cells[i].attributes;

        // changing attributes to format --> attributes = [{id: 111, key: 'vertices', value: {x: 100, y: 100}}}]
        // as vertices is a model attribute not a custom attribute thus converting it into server format here
        if (canvasData.cells[i].vertices && canvasData.cells[i].vertices.length != 0) {
          for (var vertexIndex = 0; vertexIndex < canvasData.cells[i].vertices.length; vertexIndex++) {
            var vertex = canvasData.cells[i].vertices[vertexIndex];
            vertex.x += viewPortTranslation.tx;
            if (viewPortTranslation.ty) {
              vertex.y += viewPortTranslation.ty;
            }
          }
          data.vertices = canvasData.cells[i].vertices;
        } else {
          data.vertices = [];
        }
        connectorData.push(data);
      } else {
        // Formatting statements
        var data = {};

        // In Edit mode, retain the original statement ID
        if (isEdit && (wf_datas.wrapper && wf_datas.wrapper.module === 'zia-bot' || !isNaN(canvasData.cells[i].id))) {
          data.id = canvasData.cells[i].id;
        }
        data.name = canvasData.cells[i].name;
        data.type = { "name": canvasData.cells[i].type.slice('workfloweditor.'.length) };

        // Get updated unique key for each statement
        var cell = getCell(canvasData.cells[i].id);
        data.key = cell.get("key") ? getModifiedKey(cell) : getKey(cell);

        data.description = canvasData.cells[i].description;
        if (canvasData.cells[i].action_id) {
          data.action = { 'id': canvasData.cells[i].action_id };
        }

        if (canvasData.cells[i].position) {
          canvasData.cells[i].position.x += viewPortTranslation.tx;
          canvasData.cells[i].position.y += viewPortTranslation.ty;
        }
        data.position = canvasData.cells[i].position;

        var attributes = statementAttributes[data.type.name];
        if (attributes) {
          for (var attrIndex = 0; attrIndex < attributes.length; attrIndex++) {
            var attr = attributes[attrIndex];
            var value = canvasData.cells[i][attr];
            if (data.type.name == "Stage" && attr == "statuses") {
              value = decodeAttributeForOptions(canvasData.cells[i].options);
              for (var statusIndex = 0; statusIndex < value.length; statusIndex++) {
                var status = value[statusIndex];
                if (status.notify_to && status.notify_to.users) {
                  for (var userIndex = 0; userIndex < status.notify_to.users.length; userIndex++) {
                    // remove extra fields, as photo_url field throws error in security filter
                    var userObj = { id: status.notify_to.users[userIndex].id, name: status.notify_to.users[userIndex].name };
                    status.notify_to.users[userIndex] = userObj;
                  }
                }
              }
            }
            else if (data.type.name == "Stage" && attr == "stage_order") {
              //Stage order is required in strict mode. If non-strict mode, stage order is required only if all the stages are configured in workflow.
              //Otherwise reset the stage_order attribute.
              if (!isStrictMode) {
                value = null;
              }
            }
            else if (data.type.name == "Switch") {
              if (attr == "field") {
                // Handling `Not in any Site`
                if (value == "site") {
                  for (var idx = 0; idx < canvasData.cells[i].options.length; idx++) {
                    if (canvasData.cells[i].options[idx].id == "-1") {
                      canvasData.cells[i].options[idx].id = null;
                    }
                  }
                }
              } else if (attr == "options") {  //No i18N
                value = decodeAttributeForOptions(value);
              }
            }
            else if (data.type.name == "Approval") {
              if (attr == "notify_to" && value && value.users && value.users.length) {
                for (var userIndex = 0; userIndex < value.users.length; userIndex++) {
                  // remove extra fields, as photo_url field throws error in security filter
                  var userObj = { id: value.users[userIndex].id, name: value.users[userIndex].name };
                  value.users[userIndex] = userObj;
                }
              }
            }
            else if ((data.type.name == "multiSelectNode" || data.type.name == "furtherAssistance" || data.type.name == "feedback") && attr == "options") {
              var modifiedOptions = [];
              jQuery.each(value, function (i, option) {
                var modifiedOption = {};
                modifiedOption.id = option.id;
                modifiedOption.name = option.name;
                modifiedOption.next_node = option.next_node;
                modifiedOptions.push(modifiedOption);
              });
              value = modifiedOptions;
            } else if (data.type.name == "button") {
              var modifiedButtonAttributes = {};
              modifiedButtonAttributes.next_node = value.next_node;
              value = modifiedButtonAttributes;
            }
            data[attr] = value;
          }
        }
        nodeData.push(data);
      }
    }
    return {
      'statements': nodeData,      //No i18N
      'connectors': connectorData    //No i18N
    };
  };

  /*
   * Returns links originating from an element
   * if the elementView is branch type, return the outgoing links corresponding to the specified inport
   * */
  var getOutgoingLinks = function (element, prevLink) {
    var outLinks = canvasGraph.getConnectedLinks(element, { outbound: true });
    if (element.get('type') == 'workfloweditor.Stage' && prevLink) {
      // Return outgoing links corresponding to the incoming ports in branch nodes
      var prevTargetId = prevLink.get('target').port.slice('input_'.length);  //No i18n
      for (var i = 0; i < outLinks.length; i++) {
        if (outLinks[i].get('source').port.slice('output_'.length) == prevTargetId) {
          return new Array(outLinks[i]);
        }
      }
    }
    return outLinks;
  };

  /** Detect loops for each link **/
  var checkLoops = function (link, _visitedPorts, _visitedLinksByOrder) {
    var visitedPorts = _visitedPorts || {};
    var visitedLinksByOrder = _visitedLinksByOrder || [];
    var currentCell = canvasGraph.getCell(link.get('target').id); //No i18N

    if (currentCell) {
      if (visitedPorts[currentCell.id] == undefined) {
        visitedPorts[currentCell.id] = [];
      }
      visitedPorts[currentCell.id].push(link.get('target').id + link.get('target').port);
      visitedLinksByOrder.push(link.id);

      var neighborLinks = getOutgoingLinks(currentCell, link);
      if (neighborLinks && neighborLinks.length == 1) {
        //          for(var i = 0; i < neighborLinks.length; i++) {
        var tempVisitedPorts = jQuery.extend(true, {}, visitedPorts);
        var tempVisitedLinks = jQuery.extend(true, [], visitedLinksByOrder);

        var neighborLinkTarget = neighborLinks[0].get('target');
        // check if the target port is already visited
        if (!visitedPorts[neighborLinkTarget.id] || visitedPorts[neighborLinkTarget.id].indexOf(neighborLinkTarget.id + neighborLinkTarget.port) < 0) {
          // if not already visited, check for loops in the current link
          var result = checkLoops(neighborLinks[0], visitedPorts, visitedLinksByOrder);
          if (result != null && result.loopExists == true) {
            return {
              loopExists: true,
              origin: result.origin
            };
          }
        } else if (visitedPorts[neighborLinkTarget.id].indexOf(neighborLinkTarget.id + neighborLinkTarget.port) >= 0) {
          visitedPorts[neighborLinkTarget.id].push(neighborLinkTarget.id + neighborLinkTarget.port);
          visitedLinksByOrder.push(neighborLinks[0].id);

          var loopOrigin = getOutgoingLinks(canvasGraph.getCell(neighborLinkTarget.id), neighborLinks[0]);
          var loopOriginatingConnector = getConnectorName({ link: loopOrigin[0] });
          var linksToHighlight = [];
          var originIndex = visitedLinksByOrder.indexOf(loopOrigin[0].id);
          while (originIndex < visitedLinksByOrder.length) {
            linksToHighlight.push(canvasGraph.getCell(visitedLinksByOrder[originIndex++]));
          }
          highlightNodes(linksToHighlight, loopHighlighter);
          setTimeout(function () {
            unhighlightNodes(loopHighlighter);
          }, 5000);
          return {
            loopExists: true,
            origin: loopOriginatingConnector
          };
        }
        visitedPorts = jQuery.extend(true, {}, tempVisitedPorts);
        visitedLinksByOrder = jQuery.extend(true, [], tempVisitedLinks);
        //          }
      }
    } else {
      return;
    }
  };

  /** Validate the canvas graph **/
  var validateGraph = function () {
    var module = getOptions().module;
    var start = false, end = false;
    var startNode, endNode;
    var isValid = true;
    var errorMsg = {};
    var unconnectedNodes = [];
    var unconnectedLinks = [];

    //If StartEndNode is not used by modules, then below variable value will decide whether to validate the node connections of start and end nodes
    var isStartEndNodeValidationRequired = true;
    //If unconnected nodes and link validation and error message is required, following variable can be used to validate
    var isUnconnectedNodeLinkValidationRequired = false;
    //if loop validation for the connectors has to be stopped for the wrapper modules, then the following variable can be used to validate
    var isLoopValidationRequired = true;

    var getWrapper = wf_datas.wrapper;
    var isWrapperAvailable = getWrapper && !jQuery.isEmptyObject(wf_datas.wrapper);
    if (isWrapperAvailable) {
      isStartEndNodeValidationRequired = getWrapper.is_start_end_node_validation_required;
      isUnconnectedNodeLinkValidationRequired = getWrapper.is_unconnected_node_validation_required;
      isLoopValidationRequired = getWrapper.is_loop_validation_required;
    }

    //check for start end nodes
    if (isStartEndNodeValidationRequired) {
      jQuery.each(getCellsByType('workfloweditor.StartEndNode'), function (key, value) { //No i18N
        if (value.get('is_start_node')) {
          start = true;
          startNode = value;
        } else {
          end = true;
          endNode = value;
        }
      });

      if (!(start && end) || startNode == undefined || endNode == undefined) {
        errorMsg.startend_missing = translate('sdp.admin.workflow.validation.missingstartend');  //No i18N
      }
    }

    var stageCells = getCellsByType('workfloweditor.Stage');  //No I18N
    //check for at least two stage nodes
    if (!isWrapperAvailable && stageCells.length < 2) {
      errorMsg.stage_missing = translate('sdp.admin.workflow.validation.missingstage', [submissionStage, closeStage]); //No i18N
    }

    var cells = canvasGraph.getCells();
    for (var i = 0; i < cells.length; i++) {
      if (cells[i].isLink()) {
        //check for broken links
        if (cells[i].getSourceElement() == null || cells[i].getTargetElement() == null) {
          errorMsg.invalid_connector = translate('sdp.admin.workflow.validation.invalidconnector');  //No i18N
          unconnectedLinks.push(cells[i]);
        }
      } else {
        if (cells[i].get('type') == 'workfloweditor.StartEndNode') {
          //check for the presence of start and end node
          if (cells[i].get('is_start_node')) {
            if (!canvasGraph.isSource(cells[i])) {
              errorMsg.start_missing = translate('sdp.admin.workflow.validation.missingstartconnector'); //No i18N
            }
          } else {
            if (!canvasGraph.isSink(cells[i])) {
              errorMsg.end_missing = translate('sdp.admin.workflow.validation.missingendconnector'); //No i18N
            }
          }
        }
        else {
          //Below attributes can be used to check whether the node has to be considered as start or end node.
          //If a node has to be considered as start node, then there will be no input connection.
          var isSourceCell = cells[i].get('isSourceCell');
          //If a node has to be considered as leaf node, then there will be no output connection.
          var isLeafCell = cells[i].get('isLeafCell');

          //check for at least one incoming and outgoing link to a node
          if ((!isSourceCell && canvasGraph.isSource(cells[i])) || (!isLeafCell && canvasGraph.isSink(cells[i]))) {
            unconnectedNodes.push(cells[i]);
          }

          //check if start node is connected to submission and end node is connected to close
          if (cells[i].get('type') == 'workfloweditor.Stage') {
            if (cells[i].get('stage_internal_name') == wfGetInternalName('Submission')) {
              var requested;
              for (var optIndex = 0; optIndex < cells[i].get("options").length; optIndex++) {
                if (cells[i].get("options")[optIndex].internal_name == wfGetInternalName('Requested')) {
                  requested = cells[i].get("options")[optIndex];
                  break;
                }
              }
              if (startNode && canvasGraph.isNeighbor(startNode, cells[i], { outbound: true })) {
                var connectedLinks = canvasGraph.getConnectedLinks(startNode, { outbound: true });
                if (requested && connectedLinks[0].get("target").port != "input_" + encodeURIComponent(requested.name)) {
                  errorMsg.start_with_submission = translate('sdp.admin.workflow.validation.startsubmission', [requested.name, cells[i].get('name')]); //No i18N
                }
              } else {
                errorMsg.start_with_submission = translate('sdp.admin.workflow.validation.startsubmission', [requested.name, cells[i].get('name')]);   //No i18N
              }
              if (module == "change" && cells[i].get("stage_order") != 1) {
                errorMsg.submission_stage_order = translate("sdp.admin.workflow.validation.stage.order", [cells[i].get("name"), 1]);
              }
            }
            else if (cells[i].get('stage_internal_name') == wfGetInternalName('Close')) {
              if (endNode && !canvasGraph.isNeighbor(endNode, cells[i], { inbound: true })) {
                errorMsg.end_with_close = translate('sdp.admin.workflow.validation.endclose', [cells[i].get('name')]); //No i18N
              }
              if (module == "change" && cells[i].get("stage_order") != stageCells.length) {
                errorMsg.close_stage_order = translate("sdp.admin.workflow.validation.stage.order", [cells[i].get("name"), stageCells.length]);
              }
            }
            else if (module == "change" && cells[i].get("stage_internal_name") == wfGetInternalName('Planning')) {
              if (cells[i].get("stage_order") != 2) {
                errorMsg.planning_stage_order = translate("sdp.admin.workflow.validation.stage.order", [cells[i].get("name"), 2]);
              }
            }
          }

          if (cells[i].get('type') == 'workfloweditor.Approval') {
            var connectedLinks = canvasGraph.getConnectedLinks(cells[i], { outbound: true });
            var validConnectorPresent = false;
            for (var j = 0; j < connectedLinks.length; j++) {
              if (connectedLinks[j].get('source').port == 'output_Approved' || connectedLinks[j].get('source').port == 'output_Denied') {
                validConnectorPresent = true;
              }
            }
            if (!validConnectorPresent) {
              errorMsg.approval_connector = translate('sdp.admin.workflow.validation.mandatoryapprconnector', [translate("sdp.purchase.status.approved"), translate("sdp.common.approval.status.denied")]);
            }
          }
          if (cells[i].get('type') == 'workfloweditor.Approval' || cells[i].get('type') == 'workfloweditor.Condition' || cells[i].get('type') == 'workfloweditor.Switch') {
            var outgoingconnectors = canvasGraph.getConnectedLinks(cells[i]);
            var connectorName;
            var valConnectorPresent = true;
            for (var j = 0; j < outgoingconnectors.length; j++) {
              var targetPort = outgoingconnectors[j].get('target').port;
              var targetName = outgoingconnectors[j].get('target').id;
              for (var k = 0; k < outgoingconnectors.length; k++) {
                var sourcePort = outgoingconnectors[k].get('source').port;
                var sourceName = outgoingconnectors[k].get('source').id;
                if (targetPort && targetPort.replace('input_', '') == sourcePort.replace('output_', '') && targetName == sourceName) {
                  valConnectorPresent = false;
                  connectorName = getConnectorName({ link: outgoingconnectors[k] });
                  break;
                }
              }
              if (!valConnectorPresent) {
                break;
              }
            }
            if (!valConnectorPresent) {
              errorMsg.loop = translate('sdp.admin.workflow.validation.workflow_loop', ['"' + connectorName + '"']);    //No i18N
            }
          }

          //check if unreachable flow exists
          if ((startNode && !canvasGraph.isSuccessor(startNode, cells[i])) || (endNode && !canvasGraph.isPredecessor(endNode, cells[i]))) {
            if (!errorMsg.unreachable_flow) { errorMsg.unreachable_flow = translate('sdp.admin.workflow.validation.unreachableflow'); }
          }
        }
      }
    }

    if (!errorMsg.unreachable_flow && startNode && endNode && !canvasGraph.isSuccessor(startNode, endNode)) {
      errorMsg.startend_nopath = translate('sdp.admin.workflow.validation.nostarttoendpath');  //No i18N
    }

    //check for loops
    if(isLoopValidationRequired) {
      var links = canvasGraph.getLinks();
      for (var i = 0; i < links.length; i++) {
        if (links[i].get('source').id && links[i].get('target').id) {
          var result = checkLoops(links[i]);
          if (result != null && result.loopExists === true) {
            errorMsg.loop = translate('sdp.admin.workflow.validation.workflow_loop', ['"' + result.origin + '"']);    //No i18N
            break;
          }
        }
      }
    }

    //Eventhough unconnected nodes are present but if the errorMsg object is empty, then the below block is not getting executed
    //So inorder to continue with old flow and work according to the module requirement, if error message is empty second condition is checked
    if (errorMsg && !jQuery.isEmptyObject(errorMsg) || (isUnconnectedNodeLinkValidationRequired && unconnectedNodes.length)) {
      if (unconnectedNodes.length != 0) {
        errorMsg.connector_missing = translate("sdp.admin.workflow.validation.missingconnector", [unconnectedNodes.map(function (node) { return node.get('name') }).join(', ')]); //No i18N
      }
      var wf_error_str = "";
      jQuery.each(errorMsg, function (key, value) {
        wf_error_str += e_html(value) + "<br>";
      });
      showalert('failure', wf_error_str, "isAutoHide=false"); // No I18N
    }

    if (unconnectedNodes.length || unconnectedLinks.length) {
      highlightNodes(unconnectedNodes.concat(unconnectedLinks), errorHighlighter);
    }

    var validationPassed = (jQuery.isEmptyObject(errorMsg));
    if (validationPassed) {
      //Callback function for the modules to validate the workflow and highlight the problematic cells if required
      if (isWrapperAvailable && typeof getWrapper.preSaveValidation == "function") {
        validationPassed = getWrapper.preSaveValidation(cells);
      }
    }

    const validateGraphTimer = setTimeout(function () {
      unhighlightNodes(errorHighlighter);
      unhighlightNodes();
    }, 5000);
    wf_datas.wf_self.controller.send("storeSetTimeoutTimer", validateGraphTimer);  //NO I18N
    return validationPassed;
  };

  /** Update module for the workflow editor **/
  var updateModule = function (moduleName) {
    setOptions({ module: moduleName });
    def_options.module = moduleName;
    wf_datas.module = moduleName;
  }

  /** Clear the graph and load the initial data if needed **/
  var clearGraph = function (loadInitialGraph) {
    showconfirm(true, 'title=' + translate("sdp.admin.workflow.cleargraph") + ', message=' + translate("sdp.admin.workflow.cleargraph.confirm") + ', submitbutton=' + translate("common.proceed") + ', cancelbutton=' + translate("common.no") + ', closebutton=yes, closeOnEscKey=yes', wf_clear_graph); //No I18N
    function wf_clear_graph(boolean) {
      if (boolean) {
        canvasPaper.model.clear();
        if (loadInitialGraph) {
          jQuery("#wf_canvas_loader").html(ajaxBar());
          if (options.initialCanvasGraphData) {
            canvasPaper.model.fromJSON(options.initialCanvasGraphData);
            if (!wf_datas.wrapper) {
              updateStageNodesOrder();
            } else if (wf_datas.wrapper.updateNodeTypeName && typeof wf_datas.wrapper.updateNodeTypeName == "function") {   //NO I18N
              wf_datas.wrapper.updateNodeTypeName();
            }
            jQuery("#wf_canvas_loader .loading1").remove();
          } else {
            loadInitialCanvasGraphData();
          }
        }
        operationManager.reset();
      }
    }
  };

  /** Clear the graph models and paper, detach events **/
  var clearPaper = function () {
    //to remove all the cells from the graph and their associated views from the paper
    canvasPaper.model.clear();
    //to cleanup the paper from the DOM, including its event handlers
    canvasPaper.remove();
    if (stencilPaper) {
      stencilPaper.model.clear();
      stencilPaper.remove();
    }
  };

  /** Resize the Canvas Paper **/
  var resize = function () {
    canvasPaper.setDimensions(jQuery('#' + options.canvas_id).width(), jQuery('#' + options.canvas_id).height());
  };

  /** Zoom In/Out the Canvas Paper **/
  var zoomPaper = function (e, zoom_value) {
    var bboxDim = canvasPaper.getContentBBox();
    var p = offsetToLocalPoint((bboxDim.x + bboxDim.width) / 2, (bboxDim.y + bboxDim.height) / 2);
    var newScale = zoom_value / 100;
    if (newScale >= 0.5 && newScale <= 2) {
      canvasPaper.scale(newScale, newScale, p.x, p.y);
      canvasPaper.setOrigin(0, 0); // reset the previous viewport translation
      adjustPaper();
    }
  };

  /** Adjust Canvas Paper dimensions **/
  var adjustPaper = function () {
    try {
      var viewportH = jQuery(window).height() - (jQuery('#header-placeholder').height() + jQuery('#wf_header').height() + 70); //reducing header band height
      var viewportW = jQuery(window).width() - 20;
      if (canvasPaper == null) {
        //canvaspaper not loaded yet
        jQuery('#' + def_options.canvas_id).width(viewportW);
        jQuery('#' + def_options.canvas_id).height(viewportH);
        return;
      }
      var boundingBox = canvasPaper.svg.getBBox();
      var svgHeight = boundingBox.height + boundingBox.y + defNodeHeight;
      var svgWidth = boundingBox.width + boundingBox.x + defBaseNodeWidth;

      //stencilPaper.setDimensions(widthVal ,jQuery('#wf_stencil_container').height()-5);

      //Dont adjust to graph size if svgDimesion is lower than the browser viewport
      var heightVal = svgHeight < viewportH ? viewportH : svgHeight;
      var widthVal = svgWidth < viewportW ? viewportW : svgWidth;
      canvasPaper.setDimensions(widthVal, heightVal);

      jQuery('#' + options.canvas_id).width(widthVal);
      jQuery('#' + options.canvas_id).height(heightVal);
    }
    catch (err) {
      //Error Handling
    }
  };

  /** Undo Operation **/
  var undoGraph = function () {
    operationManager.undo();
  };

  /** Redo Operation **/
  var redoGraph = function () {
    operationManager.redo();
  };

  /** Highlight the node **/
  var highlightNode = function (cellview, highlighter) {
    unhighlightNodes();
    if (!highlighter) {
      highlighter = customHighlighter;
    }
    if (cellview) {
      cellview.highlight(null, highlighter);
    }
  };

  /** Highlight multiple nodes **/
  var highlightNodes = function (cells, highlighter) {
    if (!highlighter) {
      highlighter = customHighlighter;
    }
    unhighlightNodes(highlighter);
    jQuery.each(cells, function () {
      this.findView(canvasPaper).highlight(null, highlighter);
    });
  };

  /** Remove highlighting from a node **/
  var unhighlightNode = function (cellView, highlighter) {
    if (!highlighter) {
      highlighter = customHighlighter;
    }
    if (cellView) {
      cellView.unhighlight(null, highlighter);
    }
  };

  /** Remove highlighting from multiple nodes **/
  var unhighlightNodes = function (highlighter) {
    if (!highlighter) {
      highlighter = customHighlighter;
    }
    _.each(canvasGraph.getCells(), function (cell) {
      var cellView = cell.findView(canvasPaper);
      if (cellView) {
        cellView.unhighlight(null, highlighter);
      }
    });
  };

  /** Instance Graph - Highlight the stage node for the given stage name **/
  var highlightCurrentStage = function (stageName) {
    var stage_cells = getCellsByType("workfloweditor.Stage"); //No i18N
    for (var i = 0; i < stage_cells.length; i++) {
      if (stage_cells[i].get('stage_internal_name') == stageName) {
        var currentStageNode = stage_cells[i].findView(canvasPaper);
        unhighlightNode(currentStageNode); highlightNode(currentStageNode, instanceCurrentNodeHighlighter);
        stage_cells[i].attr('rect.body/filter', { name: 'dropShadow', args: { dx: 2, dy: 2, blur: 2, color: '#fbda65' } });
        break;
      }
    }
  };

  /** Returns true if any changes done in canvas graph after initial loading **/
  var isCanvasGraphChanged = function () {
    return isGraphChanged;
  };

  /** Sets if any changes done in canvas graph after initial loading **/
  var setCanvasGraphChanged = function (val) {
    isGraphChanged = val;
  };

  /** The operatioManager object is used for controlling the undo/redo operations */
  var getOperationManager = function () {
    return operationManager;
  }

  return {
    getOptions: getOptions,
    setOptions: setOptions,
    validateGraph: validateGraph,
    getGraphData: getGraphData,
    draw: draw,
    addNode: addNode,
    addNodes: addNodes,
    createLink: createLink,
    addLink: addLink,
    updateNode: updateNode,
    organizeStageCells: organizeStageCells,
    setOrderByStageIndex: setOrderByStageIndex,
    getCanvasPaper: getCanvasPaper,
    getCell: getCell,
    getCellsByType: getCellsByType,
    getConnectorName: getConnectorName,
    clearGraph: clearGraph,
    clearPaper: clearPaper,
    zoomPaper: zoomPaper,
    adjustPaper: adjustPaper,
    undoGraph: undoGraph,
    redoGraph: redoGraph,
    highlightNode: highlightNode,
    highlightNodes: highlightNodes,
    unhighlightNode: unhighlightNode,
    unhighlightNodes: unhighlightNodes,
    isCanvasGraphChanged: isCanvasGraphChanged,
    setCanvasGraphChanged: setCanvasGraphChanged,
    updateModule: updateModule,
    processHistory: processHistory,
    getTransformedConnectorForWorkflowHistory: getTransformedConnectorForWorkflowHistory,
    getOperationManager: getOperationManager
  };
}

/************ Workflow Elements - Nodes and Links  starts here ************/

joint.shapes.basic.PortsModelInterface.updatePortsAttrs = function (eventName) {

  if (this._portSelectors) {

    var newAttrs = joint.util.omit(this.get('attrs'), this._portSelectors);
    this.set('attrs', newAttrs, { silent: true }); //No i18N
  }

  // This holds keys to the `attrs` object for all the port specific attribute that
  // we set in this method. This is necessary in order to remove previously set
  // attributes for previous ports.
  this._portSelectors = [];

  var attrs = {};

  joint.util.toArray(this.get('inPorts')).forEach(function (portName, index, ports) {
    var portAttributes = this.getPortAttrs(portName, index, ports.length, '.inPorts', 'in'); //No i18N
    this._portSelectors = this._portSelectors.concat(Object.keys(portAttributes));
    joint.util.assign(attrs, portAttributes);
  }, this);

  joint.util.toArray(this.get('outPorts')).forEach(function (portName, index, ports) {
    var portAttributes = this.getPortAttrs(portName, index, ports.length, '.outPorts', 'out'); //No i18N
    this._portSelectors = this._portSelectors.concat(Object.keys(portAttributes));
    joint.util.assign(attrs, portAttributes);
  }, this);

  // Silently set `attrs` on the cell so that noone knows the attrs have changed. This makes sure
  // that, for example, command manager does not register `change:attrs` command but only
  // the important `change:inPorts`/`change:outPorts` command.
  this.attr(attrs, { silent: true });
  // Manually call the `processPorts()` method that is normally called on `change:attrs` (that we just made silent).
  this.processPorts();
  // Let the outside world (mainly the `ModelView`) know that we're done configuring the `attrs` object.
  this.trigger('process:ports'); //No i18N
};

joint.shapes.basic.PortsViewInterface.renderPorts = function () {
  var $inPorts = this.$('.inPorts').empty();
  var $outPorts = this.$('.outPorts').empty();

  var portTemplate = joint.util.template(this.model.portMarkup);

  _.each(_.filter(this.model.ports, function (p) { return p.type === 'in'; }), function (port, index) {

    $inPorts.append(V(portTemplate({ id: index, port: port })).node);
  });

  _.each(_.filter(this.model.ports, function (p) { return p.type === 'out'; }), function (port, index) {

    $outPorts.append(V(portTemplate({ id: index, port: port })).node);
  });
};

joint.shapes.devs.ModelView = joint.dia.ElementView.extend(joint.shapes.basic.PortsViewInterface);

/*
 *  problem is with the interface the devs.Model:initialize() method as it is won't allow multilevel inheritance. workaround
 */

joint.shapes.devs.Model.prototype.initialize = function () {
  // temp fix
  if (this.updatePortsAttrs) {
    this.updatePortsAttrs();
    this.on('change:inPorts change:outPorts', this.updatePortsAttrs, this);   //No i18N
    this._parent = (this._parent || this).constructor.__super__;
    this._parent.initialize.apply(this, arguments);
  } else {
    joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);
    this.on('change:inPorts change:outPorts', this.updatePortItems, this);
    this.updatePortItems();
  }
}

// Link Definition
var defaultLink = new joint.shapes.logic.Wire(
  {
    router: { name: 'manhattan', args: {} },//No i18N
    connector: { name: 'jumpover' },//No i18N
    attrs:
    {
      '.connection': { stroke: '#ccc' },  //No i18N
      '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }, //No i18N
      '.link-tools .tool-remove circle, .marker-vertex': { r: 11 }//No i18N
    }
  });
defaultLink.toBack();

/************ Workflow Elements - Nodes and Links - starts here ************/
joint.shapes.workfloweditor = {};

// Stencil Symbols definition
joint.shapes.workfloweditor.stencilele = joint.shapes.basic.Rect.extend({
  markup: '<g class="stencilobj"><rect class="flyRectBody"/><text/><image class="flyImage"/></g>', //No i18N
  defaults: joint.util.deepSupplement({
    type: 'workfloweditor.stencilele'//No i18N
  }, joint.shapes.basic.Rect.prototype.defaults)
});

//Canvas Symbols definition
joint.shapes.workfloweditor.Base = joint.shapes.devs.Model.extend(_.extend({}, joint.shapes.basic.PortsModelInterface,
  {

    markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g class="node-icon-cont" /><text class="node-type"/><text class="node-name"/><title class="node-title"/><g class="node-content"><rect class="node-content-rect"/><text class="node-content-text"/></g><g class="actions"><image class="btn-edit-node"><title/></image><image class="btn-remove-node"><title/></image></g><g class="inPorts"/><g class="outPorts"/></g>',
    portMarkup: '<g class="port port<%= id %>"><circle class="port-body"/><text class="port-label"/></g>',//No i18N

    defaults: joint.util.deepSupplement({
      type: 'workfloweditor.Base',//No i18N
      size: { width: defBaseNodeWidth, height: defNodeHeight },
      name: '',
      isPortInTopBottomModel: true,
      nodeHeaderHeight: 40,
      attrs:
      {
        '.': { magnet: false, filter: { name: 'dropShadow', args: { dx: 0, dy: 1, blur: 2, color: '#000', opacity: 0.16 } } },
        '.body': {  //No I18n
          rx: 3, ry: 3,
          width: defBaseNodeWidth, height: defNodeHeight + 100,
          fill: {
            type: 'linearGradient',//No I18n
            stops: [
              { offset: '0', color: '#9AE6D4' },//No I18n
              { offset: '1', color: '#fff' }//No I18n
            ],
            // Top-to-bottom gradient.
            attrs: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' }
          }
        },
        '.actions': {         //No i18N
          'ref-y': -8,        //No I18n
          'ref-x': -10       //No I18n
        },
        '.port-body': {     //No I18n
          r: 5,
          magnet: true
        },
        '.inPorts .port-body': { magnet: 'passive', type: 'input' },//No i18N
        '.outPorts .port-body': { magnet: 'true', type: 'output' },//No i18N
        '.btn-edit-node': {       //No i18N
          width: 14, height: 14,
          'ref-x': 120,       //No i18N
          'xlink:href': '/images/edit-ico.svg'//No I18n
        },
        '.btn-remove-node': {     //No i18N
          width: 14, height: 14,
          'ref-x': 140,       //No i18N
          'xlink:href': '/images/delete-ico.svg'//No I18n
        },
        '.node-name': { 'font-size': 14, 'font-weight': 'bold', x: 7, y: 33, dy: 5 },    //No i18N
        '.node-icon': { x: 125, y: 10, width: 18, height: 18 },                //No i18N
        '.node-type': { x: 7, y: 16, dy: 5 },                        //No i18N
        '.node-content': { y: 40 },                            //No i18N
        '.node-content-rect': { width: defBaseNodeWidth - 2, height: 60, x: 1, y: 40 },  //No I18n
        '.node-content-text': { 'font-size': 11, dy: 5, x: 7, y: 55 }      //No I18n
      }
    },
      joint.shapes.devs.Model.prototype.defaults
    ),
    initialize: function () {
      var type = this.get('type').slice('workfloweditor.'.length);//No i18N
      this.attr('.node-type/text', getStencilName(type)); //No i18N
      joint.shapes.basic.PortsModelInterface.initialize.apply(this, arguments);
    },
    getPortAttrs: function (portName, index, total, selector, type) {
      var attrs = {};
      var portClass = 'port' + index;//No i18N
      var portSelector = selector + '>.' + portClass;
      var portCircleSelector = portSelector + '>circle';//No i18N
      attrs[portCircleSelector] = { port: { id: portName || _.uniqueId(type), type: type } };
      if (this.attributes.isPortInTopBottomModel == true) { //changes for showing input port on top in case single input port model
        attrs[portSelector] = { ref: '.body', 'ref-x': (index + 0.5) * (1 / total) };//No i18N
        if (selector === '.outPorts') { attrs[portSelector]['ref-dy'] = 0; }
        attrs['.inPorts'] = { transform: 'translate(0, 0)', height: 20, width: 20 };   //No i18N
        attrs['.outPorts'] = { transform: 'translate(0, 0)', height: 20, width: 20 };//No i18N
      }
      else {
        attrs[portSelector] = { ref: '.body', 'ref-y': (index + 0.5) * (1 / total) };//No i18N
        if (selector === '.outPorts') { attrs[portSelector]['ref-dx'] = 0; }
        attrs['.inPorts'] = { transform: 'translate(0, 0)', height: 20, width: 20 };   //No i18N
        attrs['.outPorts'] = { transform: 'translate(0, 0)', height: 20, width: 20 };//No i18N
      }
      return attrs;
    }
  }));

joint.shapes.workfloweditor.BaseView = joint.shapes.devs.ModelView.extend(
  {
    events: {
      'click .btn-edit-node': 'editNode',     //No i18N
      'click .btn-remove-node': 'removeNode',   //No i18N
      'mouseover': 'mouseoverNode',       //No I18n
      'mouseout': 'mouseoutNode'          //No I18n
    },
    mouseoverNode: function (evt, x, y) {
      var modelId = this.model.get("id");
      var selector1 = 'g[model-id="' + modelId + '"] g.actions';//No I18n
      jQuery(selector1).show();
    },
    mouseoutNode: function (evt, x, y) {
      jQuery('g.actions').hide(); //will hide an element.
    },
    interactive: false,

    initialize: function () {
      this.model.attr('.node-name/text', this.getText(), { silent: true });
      // <title> elements are not applicable for PDF
      this.model.attr('.node-title/text', this.model.get('name'), { silent: true });
      this.model.attr('.btn-edit-node title/text', translate("sdp.common.edit"), { silent: true });
      this.model.attr('.btn-remove-node title/text', translate("sdp.common.delete"), { silent: true });
      joint.shapes.devs.ModelView.prototype.initialize.apply(this, arguments);
    },

    edit: function () {
      var type = this.model.get("type");
      var wfOptions = WorkflowEditorInstance.getInstance().getOptions();
      var module = wfOptions.module.toLowerCase();
      var splitType = type.split(".")[1];
      if (type == "workfloweditor.Stage") {
        wf_datas.wf_self.controller.send("wf_init_multivalue_popup", { "wf_model_id": this.model.id, "wf_popup_name": "stage" }); //No i18N
      } else if (type == "workfloweditor.Switch") {//No i18N
        wf_datas.wf_self.controller.send("wf_init_multivalue_popup", { "wf_model_id": this.model.id, "wf_popup_name": "switch" }); //No i18N
      } else if (type == "workfloweditor.Notification") {//No i18N
        wf_datas.wf_self.controller.send("wf_notify_popup", { "wf_model_id": this.model.id, "wf_popup_name": "wf_notification" }); //No i18N
      } else if (type == "workfloweditor.Approval") {//No i18N
        wf_datas.wf_self.controller.send("wf_init_announce_popup", { "wf_model_id": this.model.id, "wf_popup_name": "wf_approval" }); //No i18N
      } else if (type == "workfloweditor.Condition") {//No i18N
        wf_datas.wf_self.controller.send("wf_condition_popup", { "wf_model_id": this.model.id }); //No i18N
      } else if (type == "workfloweditor.FieldUpdate") { //No i18N
        wf_datas.wf_self.controller.send("wf_notify_popup", { "wf_model_id": this.model.id, "wf_popup_name": "wf_field_update" }); //No i18N
      } else if (wf_datas.wrapper && typeof wf_datas.wrapper.shapes[splitType].editAction == "function") {
        wf_datas.wrapper.shapes[splitType].editAction({ "wf_model_id": this.model.id });
      }
    },

    updateModel: function (options) {
      this.paper.model.trigger('batch:start', { batchName: 'update-model' });//No i18N
      this.model.set('name', options.name); //No i18N
      var attrsUpdate = {};
      attrsUpdate['.node-name'] = { text: this.getText() };//No I18n
      attrsUpdate['.node-title'] = { text: options.name };//No I18n
      this.model.attr(attrsUpdate);
      this.paper.model.trigger('batch:stop', { batchName: 'update-model' });//No i18N
    },

    render: function () {
      joint.shapes.devs.ModelView.prototype.render.apply(this, arguments);
      this.paper.$el.prepend(this.$box);
      return this;
    },

    renderMarkup: function () {
      joint.dia.ElementView.prototype.renderMarkup.apply(this, arguments);
      var nodeIconMarkup = this.model.nodeIconMarkup;
      if (nodeIconMarkup && nodeIconMarkup != '') {
        this.$('.node-icon-cont').append(V(nodeIconMarkup).node);
      }
    },

    resize: function () {
      var pos = this.model.get('position');
      joint.dia.ElementView.prototype.resize.apply(this, arguments);
      this.model.set('position', pos);//No i18N
    },

    editNode: function (evt) {
      this.edit();
    },
    removeNode: function (evt) {
      this.model.remove();
    },
    getText: function (options) {
      var lineWidth = defBaseNodeWidth - 30;  // 30 --> padding + node-icon width
      var lineCount = 1;
      var textToTrim, fontProps, trimmedText = '';
      if (options) {
        textToTrim = options.name;
        fontProps = this.model.attr(options.selector);
        if (options.lineCount) { lineCount = options.lineCount; }
        if (options.lineWidth) { lineWidth = options.lineWidth; }
      } else { // node name
        textToTrim = this.model.get('name');
        fontProps = this.model.attr('.node-name');
      }

      // create a dummy text element in DOM
      var textElement = V('<text><tspan style="white-space:pre"></tspan></text>').attr(fontProps).node; //No i18N
      var textSpan = textElement.firstChild;
      var textNode = document.createTextNode('');
      textSpan.appendChild(textNode);
      jQuery('#wf_canvas_container svg:first').append(textElement);  //No i18N
      if (!textToTrim) { return textToTrim; }
      textToTrim = textToTrim.replace(/\n/g, " ");
      var words = textToTrim.split(' ');
      for (var i = lineCount; i > 0; i--) {
        var n = 0, temp = '', trimmed = false;
        if (i == 1) {  // if single line or last line, append `...` at the end
          textToTrim = words.join(' ');
          while (n < textToTrim.length) {
            // check if word fits into the node by appending character by character
            temp = temp.concat(textToTrim.charAt(n++));
            textNode.data = temp;
            if (textSpan.getComputedTextLength() > lineWidth) {
              trimmedText = trimmedText.concat(temp.slice(0, -3).concat("..."));
              trimmed = true;
              break;
            }
          }
        } else {  // if multi lines, return the words which can be fit into the node
          var tempTrimmedText = '';
          while (n < words.length) {
            // check if text fits into the node by appending word by word
            temp = (temp.length != 0) ? temp.concat(" " + words[n]) : temp.concat(words[n]);
            textNode.data = temp;
            if (textSpan.getComputedTextLength() > lineWidth) {
              tempTrimmedText = tempTrimmedText.concat(words.slice(0, n).join(' '));  //No i18N
              trimmed = true;
              words.splice(0, n);
              break;
            }
            n++;
          }
          if (n == 0) {  // handling if the whole word itself does not fit into the node
            temp = '', tempTrimmedText = '';
            while (n < words[0].length) {
              temp = temp.concat(words[0].charAt(n++));
              textNode.data = temp;
              if (textSpan.getComputedTextLength() > lineWidth) {
                tempTrimmedText = tempTrimmedText.concat(temp.slice(0, -1));
                words[0] = words[0].substring(n - 1);
                break;
              }
            }
          }
          if (tempTrimmedText.length == 0) {
            trimmedText = trimmedText.concat(temp + "\n");  //No i18N
            trimmed = true;
            break;
          }
          trimmedText = trimmedText.concat(tempTrimmedText + "\n"); //No i18N
        }
      }
      textElement.parentNode.removeChild(textElement);  // remove the dummy text element

      if (!trimmed) {    // if text is not trimmed, return the original text
        trimmedText = trimmedText.concat(textToTrim);
      }
      return trimmedText;
    }
  });

joint.shapes.workfloweditor.StartEndNode = joint.shapes.workfloweditor.Base.extend(
  {
    markup: '<g class="rotatable"><g class="scalable"><rect class="body"/><g class="node-icon-cont"/></g><text class="label"/><text class="name"/><title class="node-title"/><g class="inPorts"/><g class="outPorts"/></g>',  //No i18N 
    defaults: joint.util.deepSupplement({
      type: 'workfloweditor.StartEndNode', //No i18N
      size: { width: 80, height: 25 },
      attrs: {
        '.body': {            //No i18N
          rx: 12, ry: 12,
          width: 80, height: 25
        },
        '.node-icon': {         //No i18N
          width: 16, height: 16,
          x: 10,
          y: 5
        },
        '.label': { text: 'start', x: 5, y: 7 }//No i18N
      }
    }, joint.shapes.workfloweditor.Base.prototype.defaults),
    initialize: function () {
      joint.shapes.workfloweditor.Base.prototype.initialize.apply(this, arguments);
      this.attr('.body/fill', 'white');
      if (this.get('is_start_node') == true) {
        this.attr(".label/text", translate("sdp.common.start"));
        this.nodeIconMarkup = '<svg class="node-icon start" viewBox="-191 193 16 16" style="enable-background:new -191 193 16 16;"><circle cx="-183" cy="201" r="7.9"/><polygon points="-185.1,197.2 -179.5,201.3 -185.1,205.3 "/></svg>';  //No i18N
      } else {
        this.attr(".label/text", translate("sdp.common.end"));
        this.nodeIconMarkup = '<svg class="node-icon end" viewBox="-191 193 16 16" style="enable-background:new -191 193 16 16;"><circle cx="-183" cy="201" r="7.9"/><path d="M-185.6,198.1h5.9c0.2,0,0.3,0.1,0.3,0.3v5.9c0,0.2-0.1,0.3-0.3,0.3h-5.9c-0.2,0-0.3-0.1-0.3-0.3v-5.9  C-185.9,198.2-185.8,198.1-185.6,198.1z"/></svg>'; //No i18N
      }
    }
  });
joint.shapes.workfloweditor.StartEndNodeView = joint.shapes.devs.ModelView.extend({
  initialize: function () {
    this.model.attr('.node-title/text', this.model.attr(".label/text"), { silent: true });
    joint.shapes.devs.ModelView.prototype.initialize.apply(this, arguments);
  },
  renderMarkup: function () {
    joint.dia.ElementView.prototype.renderMarkup.apply(this, arguments);
    var nodeIconMarkup = this.model.nodeIconMarkup;
    if (nodeIconMarkup && nodeIconMarkup != '') {
      this.$('.node-icon-cont').append(V(nodeIconMarkup).node);
    }
  },
  resize: function () {
    var pos = this.model.get('position');
    joint.dia.ElementView.prototype.resize.apply(this, arguments);
    this.model.set('position', pos);//No i18N
  }
});

joint.shapes.workfloweditor.Notification = joint.shapes.workfloweditor.Base.extend(
  {
    markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g class="node-icon-cont"/><text class="node-type"/><text class="node-name"/><title class="node-title"/><g class="node-content"><rect class="node-content-rect"/><text class="node-content-text"/><title class="node-content-title"/></g><g class="actions"><image class="btn-edit-node"><title/></image><image class="btn-remove-node"><title/></image></g><g class="inPorts"/><g class="outPorts"/></g>',
    nodeIconMarkup: '<svg viewBox="0 0 16.5 12.444" class="node-icon notification"><path d="M13.071,13.821a1.592,1.592,0,0,1-2.142,0L4,7.579v9.577a1.067,1.067,0,0,0,1.067,1.066H18.933A1.067,1.067,0,0,0,20,17.156V7.579Z" transform="translate(-4 -5.778)" style="fill: #917824"/><path d="M11.643,12.318a.533.533,0,0,0,.714,0L19.449,5.93a1.037,1.037,0,0,0-.516-.152H5.067a1.037,1.037,0,0,0-.516.152Z" transform="translate(-4 -5.778)" style="fill: #917824"/></svg>', //No i18N
    defaults: joint.util.deepSupplement(
      {
        type: 'workfloweditor.Notification',//No i18N
        inPorts: ['input'],
        outPorts: ['output']
      },
      joint.shapes.workfloweditor.Base.prototype.defaults)
  });

joint.shapes.workfloweditor.NotificationView = joint.shapes.workfloweditor.BaseView.extend(
  {
    initialize: function () {
      var paper = WorkflowEditorInstance.getInstance().getCanvasPaper();
      paper.model.trigger("batch:start", { batchName: "add-notification" }); //No i18N
      this.model.attr('.body/fill', '#FFF3C9');
      var textVal = this.getText({ name: this.model.get('subject'), selector: '.node-content-text', lineCount: 4, lineWidth: this.model.getBBox().width - 10 });//No i18N
      var titleVal = this.model.get('subject'); //No i18N
      this.model.attr('.node-content-text/text', textVal);
      // <title> elements are not applicable for PDF
      if (parent.isInternetExplorer()) {
        titleVal.replace(/\n/g, "\r");
        this.model.attr('.node-content-title/text', titleVal);
      } else {
        titleVal = parent.ashtmlString(titleVal);
        titleVal.replace(/\n/g, parent.astextString("&#10;"));
        this.model.attr('.node-content-title/html', titleVal);
      }
      joint.shapes.workfloweditor.BaseView.prototype.initialize.apply(this, arguments);
      paper.model.trigger("batch:stop", { batchName: "add-notification" });  //No i18N
    },
    updateNotification: function (options) {
      this.paper.model.trigger('batch:start', { batchName: 'update-notification' });//No i18N
      //Setting updated subject in model goes here
      var subject = options.subject;
      var textVal = this.getText({ name: subject, selector: '.node-content-text', lineCount: 4, lineWidth: this.model.getBBox().width - 10 });//No i18N
      var attrsUpdate = {};
      attrsUpdate['.node-content-text'] = { text: textVal };  //No I18n
      attrsUpdate['.node-content-title'] = { text: subject }; //No I18n
      this.model.set('subject', options.subject);       //No i18N
      this.model.set('action_id', options.action_id);     //No i18N
      this.model.attr(attrsUpdate);
      this.updateModel(options);
      this.paper.model.trigger('batch:stop', { batchName: 'update-notification' });//No i18N
    }
  });

joint.shapes.workfloweditor.Branch = joint.shapes.devs.Model.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {

  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g><g class="node-icon-cont" /><text class="node-type"/><text class="node-name"/><title class="node-title"/></g><g class="options"></g><g class="option-actions"></g><g class="actions"><image class="btn-edit-node"><title/></image><image class="btn-remove-node"><title/></image></g><g class="inPorts"/><g class="outPorts"/></g>',
  portMarkup: '<g class="port port<%= id %>"><circle class="port-body"/><text class="port-label"/></g>',//No i18N
  optionMarkup: '<g class="option"><rect class="option-rect"/><text class="option-text"/><title class="option-title"/><g class="option-inport"><circle class="port-body"/><text class="port-label"/></g><g class="option-outport"><circle class="port-body"/><text class="port-label"/></g></g>',//No I18n
  actionMarkup: '<g class="option-action"><rect class="action-rect"/><image class="btn-notify-option" /></g>', //No i18N

  defaults: joint.util.deepSupplement({

    type: 'workfloweditor.Branch',//No I18n
    size: { width: 1, height: 1 },
    isSingleInputPort: false,
    optionHeight: 26,
    nodeHeaderHeight: 40,
    paddingBottom: 20,
    minWidth: 150,
    actionWidth: 20,

    inPorts: [],
    outPorts: [],

    attrs: {
      '.': { magnet: false, filter: { name: 'dropShadow', args: { dx: 0, dy: 1, blur: 4, color: '#000', opacity: 0.16 } } },
      '.body': {    //No I18n
        rx: 0, ry: 0,
        width: 150, height: 250,
        fill: {
          type: 'linearGradient',             //No I18n
          stops: [
            { offset: '0', color: '#9AE6D4' },    //No I18n
            { offset: '1', color: '#fff' }      //No I18n
          ],
          // Top-to-bottom gradient.
          attrs: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' }
        }
      },
      '.node-icon': { //No I18n
        width: 18, height: 18,
        y: 10,
        x: 125
      },
      '.btn-edit-node': {     //No i18N
        width: 16, height: 16,
        x: (120),
        y: (0),
        'xlink:href': '/images/edit-ico.svg' //No I18n
      },
      '.btn-remove-node': {   //No i18N
        width: 16, height: 16,
        x: (140),
        y: (0),
        'xlink:href': '/images/delete-ico.svg'   //No I18n
      },
      '.port-body': {//No I18n
        r: 5,
        magnet: true
      },
      '.option-inport .port-body': { magnet: 'passive', type: 'input' },    //No i18N
      '.option-outport .port-body': { magnet: 'true', type: 'output' },    //No i18N
      '.inPorts .port-body': { magnet: 'passive', type: 'input' },      //No i18N
      '.port-label': {        //No I18n
        'pointer-events': 'none'  //No I18n
      },
      '.option-outport': {      //No I18n
        ref: '.body', 'ref-dx': 0 //No I18n
      },
      '.actions': {         //No i18N
        'ref-y': -8,        //No I18n
        'ref-x': -10       //No I18n
      },
      // Text styling.
      '.option-text': { 'font-size': 11, x: 10, y: '1.5em' },    //No I18n
      '.node-type': { dy: 5, x: 7, y: 16 },            //No I18n 
      '.node-name': { 'font-size': 14, 'font-weight': 'bold', dy: 5, x: 7, y: 33 },   //No I18n
      '.inPorts .port-label': { x: 0, dy: 0 },  //No I18n
      '.outPorts .port-label': { x: 0, dy: 0 }, //No I18n

      // Options styling.
      '.option-rect': {             //No I18n
        rx: 0, ry: 0,
        width: defBaseNodeWidth - 2,
        x: 1
      },
      '.action-rect': {             //No I18n
        width: 16,
        x: -10,
        y: 20
      },
      '.btn-notify-option': {           //No i18N
        y: 5,
        x: 126,
        width: 16, height: 16
      }
    }
  }, joint.shapes.basic.Generic.prototype.defaults),

  initialize: function () {

    this.on('change:options', this.onChangeOptions, this);//No I18n

    this.on('change:optionHeight', this.autoresize, this);//No I18n

    this.attr('.options/ref-y', this.get('nodeHeaderHeight'), { silent: true });

    this.attr('.option-outport/y-alignment', this.get('optionHeight') / 2);
    this.attr('.option-inport/y-alignment', this.get('optionHeight') / 2);

    var type = this.get('type').slice('workfloweditor.'.length);//No i18N
    this.attr('.node-type/text', getStencilName(type)); //No i18N

    this.onChangeOptions();
    joint.shapes.basic.PortsModelInterface.initialize.apply(this, arguments);
  },
  onChangeOptions: function () {

    var options = this.get('options');//No I18n
    var size = this.get('size');
    var optionHeight = this.get('optionHeight');
    var model = this;

    // First clean up the previously set attrs for the old options object.
    // We mark every new attribute object with the `dynamic` flag set to `true`.
    // This is how we recognize previously set attributes.
    var attrs = this.get('attrs');
    _.each(attrs, function (attrs, selector) {

      if (attrs.dynamic) {
        // Remove silently because we're going to update `attrs`
        // later in this method anyway.
        model.removeAttr(selector, { silent: true });
      }
    }, this);

    // Collect new attrs for the new options.
    var offsetY = 0;
    var attrsUpdate = {};

    _.each(options, function (option) {
      var selector = '[option-id="' + encodeURIComponent(option.id) + '"]';//No I18n

      attrsUpdate[selector] = { transform: 'translate(0, ' + offsetY + ')', dynamic: true };//No I18n
      attrsUpdate[selector + ' .option-rect'] = { height: optionHeight, dynamic: true };//No I18n
      attrsUpdate[selector + ' .option-inport .port-body'] = { port: 'input_' + encodeURIComponent(option.name), dynamic: true };//No I18n
      attrsUpdate[selector + ' .option-outport .port-body'] = { port: 'output_' + encodeURIComponent(option.name), dynamic: true };//No I18n
      attrsUpdate[selector + ' .option-text'] = { text: option.name, dynamic: true };//No I18n

      attrsUpdate[selector + ' .btn-notify-option'] = {   //No i18N
        "xlink:href": option.override_notification ? "/images/notified-true.svg" : "/images/notified-false.svg",    //No i18N
        dynamic: true
      };

      offsetY += optionHeight;

    }, this);

    //Build inports and outports dynamically as per options array
    var inPorts = this.get('inPorts'), outPorts = this.get('outPorts');

    var isSingleInputPort = this.get('isSingleInputPort');

    // Add ports if necessary
    for (var i = outPorts.length; i < options.length; i++) {
      if (!isSingleInputPort) {
        inPorts.push("input_" + options[i].name);
      }
      outPorts.push("output_" + options[i].name);
    }

    // Remove ports if necessary
    if (!isSingleInputPort) {
      inPorts.splice(-1, inPorts.length - options.length);
    }
    outPorts.splice(-1, outPorts.length - options.length);

    // Update ports
    for (var i = 0; i < options.length; i++) {
      if (!isSingleInputPort) {
        inPorts[i] = "input_" + options[i].name;
      }
      outPorts[i] = "output_" + options[i].name;
    }

    this.set('inPorts', inPorts);//No I18n
    this.set('outPorts', outPorts);//No I18n

    this.attr(attrsUpdate);
    this.autoresize();
  },

  autoresize: function () {
    var options = this.get('options') || [];//No I18n
    var gap = this.get('paddingBottom') || 20;
    gap = 0;//No gap required at bottom
    var height = options.length * this.get('optionHeight') + this.get('nodeHeaderHeight') + gap;
    this.resize(this.get('minWidth') || 150, height);
  },

  getPortAttrs: function (port, index, total, selector, type) {
    joint.shapes.workfloweditor.Base.prototype.getPortAttrs.apply(this, arguments);

    var attrs = {};
    if (this.attributes.isSingleInputPort == true && selector == '.outPorts') {
      return attrs;
    }
    else if (this.attributes.isSingleInputPort == false) {
      if (selector === '.inPorts' || selector === '.outPorts') {
        return attrs;
      }
    }

    var portClass = 'port' + index;//No i18N
    var portSelector = selector + '>.' + portClass;
    var portTextSelector = portSelector + '>.port-label';//No I18n
    var portCircleSelector = portSelector + '>.port-body';//No I18n
    if (port.label) {
      attrs[portTextSelector] = { text: port.label };
    }
    attrs[portCircleSelector] = { port: { id: port || _.uniqueId(type), type: type } };
    attrs[portSelector] = { ref: '.body', 'ref-x': (index + 0.5) * (1 / total) };//No I18n

    if (selector === '.outPorts') { attrs[portSelector]['ref-dy'] = 0; }

    if (this.attributes.isSingleInputPort == true && selector === '.inPorts') { //changes for showing input port on top in case single input port model
      attrs[portSelector] = { ref: 'rect', 'ref-x': (index + 0.5) * (1 / total), 'ref-y': 0 };//No i18N
      attrs[selector] = { transform: 'translate(0, 0)' };
    }

    return attrs;
  },

  changeOption: function (id, option) {

    if (!option.id) {
      option.id = id;
    }

    var options = JSON.parse(sdpToJSON(this.get('options')));//No I18n
    options[_.findIndex(options, { id: id })] = option;
    this.set('options', options);//No I18n
  }
}));

joint.shapes.workfloweditor.BranchView = joint.shapes.workfloweditor.BaseView.extend(_.extend({}, joint.shapes.basic.PortsViewInterface, {

  events: {
    'click .btn-edit-node': 'editNode',       //No i18N
    'click .btn-remove-node': 'removeNode',     //No i18N
    'click .btn-notify-option': 'onNotifyOption', //No I18n
    'mouseover': 'mouseoverNode',         //No I18n
    'mouseout': 'mouseoutNode',           //No I18n
    'mouseover .option': 'mouseoverOption',     //No I18n
    'mouseout .option': 'mouseoutOption',     //No I18n
    'mouseover .body': 'mouseoverBody',       //No I18n
    'mouseover .port-body': 'mouseoverBody'     //No I18n
  },
  mouseoverBody: function (evt, x, y) {
    jQuery('g.option-actions').hide(); //will hide an element.
  },
  mouseoverOption: function (evt) {
    var $target = jQuery(evt.target);
    if ($target.attr("class").indexOf('port-body') == -1) {
      var $option = $target.attr("option-id") ? $target : $target.parents(".option");   //No i18N
      $option.find(".btn-notify-option").removeClass("hide");
    }
  },
  mouseoutOption: function (evt) {
    var $target = jQuery(evt.target);
    var $option = $target.attr("option-id") ? $target : $target.parents(".option");     //No i18N
    if ($option.attr("override-notif") != "true") {
      $option.find(".btn-notify-option").addClass("hide");
    }
  },
  initialize: function () {
    var paper = WorkflowEditorInstance.getInstance().getCanvasPaper();
    paper.model.trigger("batch:start", { batchName: "add-branch" }); //No i18N
    this.model.attr('.node-name/text', this.getText(), { silent: true });
    this.listenTo(this.model, 'change:options', this.renderOptions, this);//No I18n

    this.on('cell:mouseout', function (cellView, evt, x1, y1) {//No i18N
      var relatedTargetClass = jQuery(cellView.relatedTarget).attr("class");
      if (typeof relatedTargetClass === "undefined" || relatedTargetClass.indexOf('connection') >= 0 || relatedTargetClass.indexOf('marker') >= 0 || relatedTargetClass.indexOf('ui-') >= 0) {
        jQuery('g.option-actions').hide(); //will hide an element.;
      }
    });
    joint.shapes.workfloweditor.BaseView.prototype.initialize.apply(this, arguments);
    paper.model.trigger("batch:stop", { batchName: "add-branch" });  //No i18N
  },

  renderMarkup: function () {

    joint.dia.ElementView.prototype.renderMarkup.apply(this, arguments);

    var nodeIconMarkup = this.model.nodeIconMarkup;
    if (nodeIconMarkup && nodeIconMarkup != '') {
      this.$('.node-icon-cont').append(V(nodeIconMarkup).node);
    }

    // A holder for all the options.
    this.$options = this.$('.options');
    // Create an SVG element representing one option. This element will
    // be cloned in order to create more options.
    this.elOption = V(this.model.optionMarkup);
    if (this.model.actionMarkup != '') {
      this.elAction = V(this.model.actionMarkup);
    }
    this.renderOptions();
  },

  renderOptions: function () {

    this.$options.empty();
    var attrsUpdate = {};
    var view = this;
    _.each(this.model.get('options'), function (option, index) {//No I18n
      var selector = '[option-id="' + encodeURIComponent(option.id) + '"]'; //No I18n
      var className = 'option-' + encodeURIComponent(option.id);  //No I18n

      var elOption = view.elOption.clone().addClass(className);
      elOption.attr('option-id', encodeURIComponent(option.id));
      elOption.attr('option-index', index);
      var $notifyIcon = V(elOption.node).find(".btn-notify-option");
      if ($notifyIcon.length) {
        $notifyIcon = $notifyIcon[0];
        if (option.override_notification == true) {
          elOption.attr('override-notif', "true");
          $notifyIcon.removeClass("hide");
          $notifyIcon.addClass("notify-true");
          attrsUpdate[selector + " .btn-notify-option"] = { "xlink:href": "/images/notified-true.svg" };    //No i18N
        } else {
          elOption.attr('override-notif', "false");
          $notifyIcon.removeClass("notify-true");
          $notifyIcon.addClass("hide");
          attrsUpdate[selector + " .btn-notify-option"] = { "xlink:href": "/images/notified-false.svg" }; //No i18N
        }
      }
      view.$options.append(elOption.node);

      var nodeText = view.getText({ name: option.name, selector: '.option-text' });//No I18n
      attrsUpdate[selector + ' .option-text'] = { text: nodeText, dynamic: true };//No I18n

      if (view.model.get('type') == 'workfloweditor.Approval') {
        if (nodeText.indexOf('Approved') != -1) {//temp : hardcoded status name
          attrsUpdate[selector + ' .option-color-rect'] = { fill: 'green' };//No I18n
        }
        else if (nodeText.indexOf('Denied') != -1) {//temp : hardcoded status name
          attrsUpdate[selector + ' .option-color-rect'] = { fill: 'red' };//No I18n
        } else if (nodeText.indexOf('Pending Approval') != -1) {//temp : hardcoded status name
          attrsUpdate[selector + ' .option-color-rect'] = { fill: 'orange' };//No I18n
        }
      }
      // <title> elements are not applicable for PDF
      attrsUpdate[selector + ' .option-title'] = { text: option.name, dynamic: true };//No I18n
    }, this);
    if (this.elAction) {
      this.$('.option-actions').append(this.elAction.node);
    }
    this.model.attr(attrsUpdate);
    // Apply `attrs` to the newly created SVG elements.
    this.update();
  },

  onNotifyOption: function (evt) {
    var wfOptions = WorkflowEditorInstance.getInstance().getOptions();
    var module = wfOptions.module.toLowerCase();
    var status_id = jQuery(evt.target).parent().attr('option-id');
    wf_datas.wf_self.controller.send("wf_init_announce_popup", { "wf_model_id": this.model.id, "wf_status_id": status_id, "wf_popup_name": "wf_override_status" }); //No I18n
  },

  addOption: function (optionsArr, option_index) {
    this.paper.model.trigger('batch:start', { batchName: 'update-branch' });//No i18N
    this.model.set('options', optionsArr);//No I18n
    this.renderOptions();
    this.paper.model.trigger('batch:stop', { batchName: 'update-branch' });//No i18N
  }

}));

joint.shapes.workfloweditor.Approval = joint.shapes.workfloweditor.Branch.extend({
  optionMarkup: '<g class="option"><rect class="option-rect"/><rect class="option-color-rect"/><text class="option-text"/><title class="option-title"/><g class="option-outport"><circle class="port-body"/><text class="port-label"/></g></g>',//No I18n
  nodeIconMarkup: '<svg viewBox="0 0 15 15" class="node-icon approval"><circle cx="7" cy="7" r="7" style="fill: #4bb20d"/><polyline points="3.889 6.95 5.997 9.057 10.111 4.943" style="fill: none;stroke: #fff;stroke-miterlimit: 10;stroke-width: 1.16666666666667px"/></svg>', //No i18N
  actionMarkup: '',
  defaults: joint.util.deepSupplement({
    type: 'workfloweditor.Approval',//No I18n
    isSingleInputPort: true,
    isPreApproved: false,
    inPorts: ["input"],
    nodeIconName: '/images/svg/approval.svg',//No I18n
    attrs: {
      '.option-color-rect': {//No I18n
        rx: 2, ry: 2,
        fill: 'red',//No I18n
        width: 8, height: 8,
        'ref-x': 5,//No I18n
        'ref-y': 10//No I18n
      }
    }

  }, joint.shapes.workfloweditor.Branch.prototype.defaults),
  initialize: function () {
    this.attr('.option-text/ref-x', 8);
    this.attr('.body/fill', '#E1FCD0');
    joint.shapes.workfloweditor.Branch.prototype.initialize.apply(this, arguments);
  }
});
joint.shapes.workfloweditor.Switch = joint.shapes.workfloweditor.Branch.extend({
  optionMarkup: '<g class="option"><rect class="option-rect"/><text class="option-text"/><title class="option-title"/><g class="option-outport"><circle class="port-body"/><text class="port-label"/></g></g>',//No I18n
  nodeIconMarkup: '<svg viewBox="0 0 17 14.375" class="node-icon switch"><polygon points="0 4.446 4.845 8.893 4.845 6.274 9.414 6.274 9.414 2.619 4.845 2.619 4.845 0 0 4.446" style="fill: #7e63b4"/><polygon points="17 9.928 12.155 14.375 12.155 11.756 7.586 11.756 7.586 8.101 12.155 8.101 12.155 5.482 17 9.928" style="fill: #7e63b4"/></svg>',  //No i18N
  actionMarkup: '<g class="option-action"><rect class="action-rect"/></g>',//No I18n
  defaults: joint.util.deepSupplement({
    type: 'workfloweditor.Switch',//No I18n
    isSingleInputPort: true,
    inPorts: ["input"],
    nodeIconName: '/images/svg/switch.svg'//No I18n
  }, joint.shapes.workfloweditor.Branch.prototype.defaults),
  initialize: function () {
    this.attr('.action-rect/width', 0);//No Option actions
    this.attr('.body/fill', '#EDE8F7');
    joint.shapes.workfloweditor.Branch.prototype.initialize.apply(this, arguments);
  }
});

joint.shapes.workfloweditor.Stage = joint.shapes.workfloweditor.Branch.extend({
  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g><g class="node-icon-cont"></g><text class="node-type"/><text class="node-name"/><title class="node-title"/></g><g class="options"></g><g class="option-actions"></g><g class="actions"><image class="btn-edit-node"><title/></image><image class="btn-remove-node"><title/></image></g><g class="inPorts"/><g class="outPorts"/></g>',
  nodeIconMarkup: '<svg class="node-icon stage" viewBox="0 0 16 13.538"><g><polygon points="16 4.308 8 0 0 4.308 8 8.615 16 4.308" style="fill: #25b28f"/><polygon points="8 9.846 1.143 6.154 0 6.769 8 11.077 16 6.769 14.857 6.154 8 9.846" style="fill: #25b28f"/><polygon points="8 12.308 1.143 8.615 0 9.231 8 13.538 16 9.231 14.857 8.615 8 12.308" style="fill: #25b28f"/></g></svg>',  //No i18N
  optionMarkup: '<g class="option"><rect class="option-rect"/><text class="option-text"/><title class="option-title"/><rect class="action-rect"/><image class="btn-notify-option" /><g class="option-inport"><circle class="port-body"/><text class="port-label"/></g><g class="option-outport"><circle class="port-body"/><text class="port-label"/></g></g>',//No I18n
  actionMarkup: '',
  defaults: joint.util.deepSupplement({
    type: 'workfloweditor.Stage',//No I18n
    isSingleInputPort: false,
    nodeIconName: '/images/svg/stage.svg'//No I18n
  }, joint.shapes.workfloweditor.Branch.prototype.defaults),

  initialize: function () {
    this.attr('.body/fill', '#C7FAED');
    joint.shapes.workfloweditor.Branch.prototype.initialize.apply(this, arguments);
  },

  updateStageOrder: function (stage_index, stage_order, isRemove) {
    var workfloweditorInstance = WorkflowEditorInstance.getInstance();
    // Find the stages that are to be executed after the current stage, based on the stage index
    // since the order previous stages are not changed
    var stageNodes = workfloweditorInstance.getCellsByType("workfloweditor.Stage"); //No I18N
    if (isRemove) {
      //update stage_order of nodes having order greater than deleted node's order
      stageNodes = jQuery.grep(stageNodes, function (node) {
        return parseInt(node.get("stage_order")) > stage_order;
      });
      for (var i = 0; i < stageNodes.length; i++) {
        stageNodes[i].set("stage_order", stageNodes[i].get("stage_order") - 1);
        this.appendStageOrder(stageNodes[i]);
      }
    } else {
      stageNodes.sort(function (nodeA, nodeB) {
        return nodeA.get("stage_index") - nodeB.get("stage_index");
      });
      var currentStageOrder;
      for (var i = 1; i < stageNodes.length; i++) {
        if (stage_index == stageNodes[i].get("stage_index")) {
          //insert stage node next to the stage with max stage index and less than the added node's stage index
          currentStageOrder = parseInt(stageNodes[i - 1].get("stage_order")) + 1;
          stageNodes[i].set("stage_order", currentStageOrder);
          this.appendStageOrder(stageNodes[i]);
          break;
        }
      }
      //update stage_order of nodes having order greater than added node's order
      for (var i = 1; i < stageNodes.length; i++) {
        var nodeStageOrder = parseInt(stageNodes[i].get("stage_order"));
        if (nodeStageOrder >= currentStageOrder && stage_index != parseInt(stageNodes[i].get("stage_index"))) {
          stageNodes[i].set("stage_order", nodeStageOrder + 1);
          this.appendStageOrder(stageNodes[i]);
        }
      }
    }
  },
  appendStageOrder: function (cell) {
    //appending order index with stage name
    cell.attr('.node-type/text', translate("sdp.admin.workflow.stencil.stage") + " " + cell.get("stage_order"));
  }
});

joint.shapes.workfloweditor.StageView = joint.shapes.workfloweditor.BranchView.extend({

  renderMarkup: function () {
    joint.shapes.workfloweditor.BranchView.prototype.renderMarkup.apply(this, arguments);
    //User is not allowed to delete submission & close stage
    if (this.model.get("stage_internal_name") == wfGetInternalName('Submission') || this.model.get("stage_internal_name") == wfGetInternalName('Close')) {
      var modelId = this.model.get("id");
      var selector = 'g[model-id="' + modelId + '"] .btn-remove-node';//No i18N
      jQuery(selector).remove();
      this.model.attr('.btn-edit-node/x', 140, { silent: true });//reposition edit node as submission and close stages dont have remove option
    }
  },
  removeNode: function () {
    const config = wf_datas.wf_self.controller.allowed_stages_config;
    let nodesWithNonAvailableStageFields = wfEditorUtil.getNodesWithNonAvailableStageFields(this.model.get('stage_internal_name'));//No i18N
    if(config == "ONLY_WF_STAGES" && nodesWithNonAvailableStageFields.length > 0){
      showalert('failure', translate("workflow.removal.stage.fields.error.message"), "isAutoHide=false"); // No I18N
      wf_datas.wf_editor_instance.highlightNodes(nodesWithNonAvailableStageFields, errorHighlighter);
      //clear timer started by other validations
      wf_datas.wf_self.controller.send("clearSetTimeoutTimer");  //NO I18N
      //setTimeout is set to 1min, so that highlighted nodes wont be unhighlighted immediately
      const removeNodeTimer = setTimeout(function () {
        wf_datas.wf_editor_instance.unhighlightNodes(errorHighlighter);
      }, 60000);
      wf_datas.wf_self.controller.send("storeSetTimeoutTimer", removeNodeTimer);  //NO I18N
			return;
    }
    config == "ONLY_WF_STAGES" && wf_datas.wf_editor_instance.unhighlightNodes(errorHighlighter); //NO I18N
    this.model.updateStageOrder(this.model.get('stage_index'), this.model.get("stage_order"), true);
    joint.shapes.workfloweditor.BranchView.prototype.removeNode.apply(this, arguments);
  }
});
joint.shapes.workfloweditor.SwitchView = joint.shapes.workfloweditor.BranchView;

joint.shapes.workfloweditor.ApprovalView = joint.shapes.workfloweditor.BranchView.extend({
  renderMarkup: function () {
    joint.shapes.workfloweditor.BranchView.prototype.renderMarkup.apply(this, arguments);
    if (this.model.get('isPreApproved')) {
      this.setAsPreApproved();
    }
  },
  updateApproval: function (options) {
    this.paper.model.trigger('batch:start', { batchName: 'update-approval' });//No i18N
    this.updateModel(options);
    this.model.set("approval_rule", options.approval_rule); //No i18N
    this.model.set("approval_rule_value", options.approval_rule_value); //No i18N
    if (options.cab_users) {
      this.model.set("cab_users", options.cab_users);   //No i18N
    }
    this.model.set("notify_to", options.notify_to); //No i18N
    this.model.set("subject", options.subject);   //No i18N
    this.model.set("content", options.content);   //No i18N
    this.paper.model.trigger('batch:stop', { batchName: 'update-approval' });//No i18N
  },
  setAsPreApproved: function () {
    this.model.attr('.node-type/text', translate("sdp.admin.workflow.stencil.approval") + ' - ' + translate("sdp.admin.changetype.ispreapproved")); //No i18N
    this.$('.node-icon-cont svg').addClass('preapproved');
  }
});

joint.shapes.workfloweditor.Condition = joint.shapes.workfloweditor.Base.extend(_.extend({}, joint.shapes.basic.PortsModelInterface,
  {
    portMarkup: '<g class="port port<%= id %>"><circle class="port-body"/><text class="port-label"/></g>',  //No i18N
    nodeIconMarkup: '<svg class="node-icon condition" viewBox="0 0 15 15" ><rect x="2.197" y="2.196" width="10.607" height="10.607" transform="translate(-3.107 7.501) rotate(-45)" style="fill: #0092c1"/><text transform="translate(4.988 11.123)" style="font-size: 9px;fill: #fff;font-family: Arial-BoldMT, Arial;font-weight: 700">?</text></svg>', //No i18N
    markup: '<g class="rotatable"><g class="scalable"><path class="body"/></g><g class="node-icon-cont"/><text class="node-type"/><text class="node-name"/><title class="node-title"/><g class="actions"><image class="btn-edit-node" ><title/></image><image class="btn-remove-node"><title/></image></g><g class="inPorts"/><g class="outPorts"/></g>', //No i18N 
    defaults: joint.util.deepSupplement({
      type: 'workfloweditor.Condition', //No i18N
      nodeWidth: defConditionNodeWidth,
      nodeHeight: defNodeHeight,
      size: { width: defConditionNodeWidth, height: defNodeHeight },
      name: 'Condition',     //No i18N
      inPorts: ['input'],
      outPorts: ['Yes', 'No'],   //No i18N
      nodeIconName: '/images/svg/condition.svg',    //No I18n
      attrs: {
        path: { d: 'M 40 0 L 80 40 40 80 0 40 z' }, //No i18N

        text: {
          'pointer-events': 'none' //No i18N
        },
        '.node-name': { 'font-size': 14, 'font-weight': 'bold', text: name, y: 55, x: 72, textAnchor: 'middle' }, //No i18N
        '.node-type': { x: 72, y: 40, textAnchor: 'middle' },                   //No I18n

        //Adjusting output port 'Yes' right side
        '.outPorts>.port0 .port-label': { x: 0, y: '-0.7em' },       //No i18N
        //Adjusting output port 'No' left side
        '.outPorts>.port1 .port-label': { x: 0, y: '-0.7em' },       //No i18N

        '.btn-edit-node': {       //No i18N
          width: 16, height: 16,
          'ref-y': 10,        //No i18N
          'ref-x': 60         //No i18N
        },
        '.btn-remove-node': {     //No i18N
          width: 16, height: 16,
          'ref-y': 10,        //No i18N
          'ref-x': 95         //No i18N
        },
        '.node-icon': {         //No i18N
          width: 18, height: 18,
          x: 63,
          y: 9
        }
      }
    }, joint.shapes.workfloweditor.Base.prototype.defaults),
    getPortAttrs: function (portName, index, total, selector, type) {
      joint.shapes.workfloweditor.Base.prototype.getPortAttrs.apply(this, arguments);
      var attrs = {};
      var portClass = 'port' + index;//No i18N
      var portSelector = selector + '>.' + portClass;
      var portCircleSelector = portSelector + '>circle';//No i18N
      var portLabelSelector = portSelector + '>.port-label';//No i18N
      attrs[portCircleSelector] = { port: { id: portName || _.uniqueId(type), type: type } };
      attrs[portSelector] = { ref: '.body', 'ref-y': ((index) * 35) - (index + 2) };//No i18N

      if (selector === '.outPorts') {
        attrs[portSelector]['ref-dx'] = 0;

        if (portSelector == '.outPorts>.port0') {
          attrs[portSelector]['ref-y'] = (this.get("nodeHeight") / 2);
          attrs[portSelector]['ref-x'] = 0;
        }
        else if (portSelector == '.outPorts>.port1') {
          attrs[portSelector]['ref-y'] = (this.get("nodeHeight") / 2);
          attrs[portSelector]['ref-x'] = -this.get("nodeWidth");
        }
        attrs[portLabelSelector] = { text: translate("sdp.admin.settings." + portName.toLowerCase()) };
      }
      if (selector === '.inPorts') {
        attrs[portSelector]['ref-x'] = (this.get("nodeWidth") / 2);
        attrs[portSelector]['ref-y'] = 0;
      }
      return attrs;
    }
  }));

joint.shapes.workfloweditor.ConditionView = joint.shapes.workfloweditor.BaseView.extend(
  {
    initialize: function () {
      var paper = WorkflowEditorInstance.getInstance().getCanvasPaper();
      paper.model.trigger("batch:start", { batchName: "add-Condition" });  //No i18N
      this.model.attr('.name/text', this.getText(), { silent: true });
      this.model.attr('.body/fill', '#CBF2FF');
      this.model.attr('.scalable/transform', 'scale(1.80, 1.25)');
      joint.shapes.workfloweditor.BaseView.prototype.initialize.apply(this, arguments);
      paper.model.trigger("batch:stop", { batchName: "add-Condition" }); //No i18N
    },
    updateCondition: function (options) {
      this.paper.model.trigger('batch:start', { batchName: 'update-condition' });//No i18N
      this.updateModel(options);
      this.model.set('criteria', options.criteria); //No i18N
      this.model.attr('.node-name/text', this.getText());
      this.paper.model.trigger('batch:stop', { batchName: 'update-condition' });//No i18N
    }
  });

joint.shapes.workfloweditor.FieldUpdate = joint.shapes.workfloweditor.Base.extend({
  markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g class="node-icon-cont" /><text class="node-type"/><text class="node-name"/><title class="node-title"/><g class="node-content"><rect class="node-content-rect"/><text class="node-content-text"/><title class="node-content-title"/></g><g class="actions"><image class="btn-edit-node"><title/></image><image class="btn-remove-node"><title/></image></g><g class="inPorts"/><g class="outPorts"/></g>',
  nodeIconMarkup: '<svg class="node-icon fieldupdate" viewBox="0 0 15 14.25"><path d="M4.823,10.714H3v4.375L4.3,13.9a7,7,0,0,0,12.65-3.184H15.177A5.25,5.25,0,0,1,5.6,12.7l2.162-1.987Z" transform="translate(-3 -2.589)" style="fill: #bf5a36"/><path d="M10,2.589A7,7,0,0,0,3.054,8.714H4.823a5.251,5.251,0,0,1,9.661-1.858L12.625,8.714H17V4.339L15.747,5.592A6.991,6.991,0,0,0,10,2.589Z" transform="translate(-3 -2.589)" style="fill: #bf5a36"/></svg>',  //No i18N
  defaults: joint.util.deepSupplement(
    {
      type: 'workfloweditor.FieldUpdate',     //No i18N
      inPorts: ['input'],
      outPorts: ['output'],
      nodeIconName: '/images/svg/update.svg',  //No I18n
      name: 'Set Field Value',          //No I18n
      attrs: {
        '.node-content-text': { y: 10 }     //No I18n
      }
    },
    joint.shapes.workfloweditor.Base.prototype.defaults),
  initialize: function () {
    this.attr('.body/fill', '#FFEEE8');
    joint.shapes.workfloweditor.Base.prototype.initialize.apply(this, arguments);
  }
});
joint.shapes.workfloweditor.FieldUpdateView = joint.shapes.workfloweditor.BaseView.extend(
  {
    initialize: function () {
      var paper = WorkflowEditorInstance.getInstance().getCanvasPaper();
      paper.model.trigger("batch:start", { batchName: "add-FieldUpdate" });  //No i18N
      this.setFieldContent();
      joint.shapes.workfloweditor.BaseView.prototype.initialize.apply(this, arguments);
      paper.model.trigger("batch:stop", { batchName: "add-FieldUpdate" });   //No i18N
    },

    setFieldContent: function () {
      this.model.trigger('batch:start', { batchName: 'update-fieldupdate-render' });//No i18N
      this.model.attr('.node-content-text tspan/dy', '1.7em');
      this.model.attr('.node-content-text/ref-y', 25);
      var fieldUpdates = this.model.get('fieldUpdates');//No i18N
      var textVal = "";
      var titleVal = "";
      var rowCount = 0;
      var lineSep = "&#10;";
      if (parent.isInternetExplorer()) {   // isInternetExplorer() method is not available in PDF. This lineSep variable is used in <title> element, which is not required for PDF
        lineSep = "\n";//No i18N
      }
      for (var i = 0; i < fieldUpdates.length; i++) {
        var rowVal = fieldUpdates[i].key + " : " + fieldUpdates[i].value;
        rowVal = this.getText({ name: rowVal, selector: '.node-content-text', lineCount: 1, lineWidth: this.model.getBBox().width - 10 });  //No i18N
        textVal = textVal + rowVal + "\n";  //No i18N
        if (parent.isInternetExplorer()) {
          titleVal = titleVal + fieldUpdates[i].key + " : " + fieldUpdates[i].value + lineSep;  //No i18N
        } else {
          titleVal = titleVal + parent.ashtmlString(fieldUpdates[i].key) + " : " + parent.ashtmlString(fieldUpdates[i].value) + parent.astextString(lineSep); //No i18N
        }
        rowCount++;
      }
      textVal = textVal.substring(0, textVal.length - 1);
      titleVal = titleVal.substring(0, titleVal.length - 1);
      this.model.attr('.node-content-text/text', textVal);
      parent.isInternetExplorer() ? this.model.attr('.node-content-title/text', titleVal) : this.model.attr('.node-content-title/html', titleVal);
    },

    updateFieldUpdateDetails: function (options) {
      this.paper.model.trigger('batch:start', { batchName: 'update-fieldupdate' });//No i18N
      this.updateModel(options);
      this.model.set('fieldUpdates', options.fieldUpdates); //No i18N
      this.model.set('action_id', options.action_id);     //No i18N
      this.setFieldContent();
      this.onRender();
      this.paper.model.trigger('batch:stop', { batchName: 'update-fieldupdate' });//No i18N
    },
    onRender: function () {
      var $fieldContent = this.$el.find(".node-content-text");
      var heightVal;
      if ($fieldContent.attr("display") !== "none") {
        heightVal = $fieldContent[0].getBBox().height + 10;             // 10 for padding
      } else {
        heightVal = 10;
      }
      this.model.attr('.node-content-rect/height', heightVal);
      this.model.set('size', { width: defBaseNodeWidth, height: heightVal + 40 }); //No i18N
      this.model.attr('.scalable/transform', 'scale(1,1)');
      this.paper.model.trigger('batch:stop', { batchName: 'update-fieldupdate-render' });//No i18N
    }
  });


/************ Workflow Elements - Nodes and Links  ends here ************/

function processConnectorOptions(connectorData, initialLoad) {
  var workflowEditorInstance = WorkflowEditorInstance.getInstance();
  var options = { source: {}, target: {} };
  if (initialLoad) {
    if (connectorData.source.source_statement && connectorData.target.target_statement) {
      options.source.id = connectorData.source.source_statement.id;
      options.target.id = connectorData.target.target_statement.id;

      if (connectorData.source.source_statement.key.indexOf("Stage") == 0) {
        options.source.name = cacheIdNameMap.stages[options.source.id];
      } else if (connectorData.source.source_statement.key.indexOf("Switch") == 0 && cacheIdNameMap.switches[options.source.id]) {
        options.source.name = cacheIdNameMap.switches[options.source.id];
      } else if (connectorData.source.source_statement.key.indexOf("FieldUpdate") == 0) {
        options.source.name = cacheIdNameMap.fieldUpdates[options.source.id];
      } else if (connectorData.source.source_statement.key.indexOf("Notification") == 0) {
        options.source.name = cacheIdNameMap.notifications[options.source.id];
      } else {
        options.source.name = connectorData.source.source_statement.name;
      }

      if (connectorData.target.target_statement.key.indexOf("Stage") == 0) {
        options.target.name = cacheIdNameMap.stages[options.target.id];
      } else if (connectorData.target.target_statement.key.indexOf("Switch") == 0 && cacheIdNameMap.switches[options.target.id]) {
        options.target.name = cacheIdNameMap.switches[options.target.id];
      } else if (connectorData.target.target_statement.key.indexOf("FieldUpdate") == 0) {
        options.target.name = cacheIdNameMap.fieldUpdates[options.target.id];
      } else if (connectorData.target.target_statement.key.indexOf("Notification") == 0) {
        options.target.name = cacheIdNameMap.notifications[options.target.id];
      } else {
        options.target.name = connectorData.target.target_statement.name;
      }

      options.source.key = connectorData.source.source_statement.key;
      options.target.key = connectorData.target.target_statement.key;
    }

  }
  else {
    if (connectorData.target.target_statement == null) { return options; }
    if (connectorData.source.source_statement == null) { return options; }
    options.source = workflowEditorInstance.getCell(connectorData.source.source_statement.id);
    options.target = workflowEditorInstance.getCell(connectorData.target.target_statement.id);

    options.source.name = options.source.attributes.name;
    options.target.name = options.target.attributes.name;

    options.source.key = options.source.attributes.key;
    options.target.key = options.target.attributes.key;
  }

  if (options.source.key) {
    if (options.source.key == 'start') {
      options.source.name = translate("sdp.common.start");
      options.source.type = 'Workflow';//No i18N
    }
    else {
      options.source.type = options.source.key.split('_')[0];
    }
  }
  if (options.target.key) {
    if (options.target.key == 'end') {
      options.target.name = translate("sdp.common.end");
      options.target.type = 'Workflow';//No i18N
    }
    else {
      options.target.type = options.target.key.split('_')[0];
    }
  }

  options.sourcePort = encodeURIComponent(connectorData.source.source_port);
  options.targetPort = encodeURIComponent(connectorData.target.target_port);

  options.id = connectorData.id;
  options.name = workflowEditorInstance.getConnectorName({
    source: {
      name: encodeURIComponent(options.source.name),
      type: options.source.type,
      port: options.sourcePort
    },
    target: {
      name: encodeURIComponent(options.target.name),
      type: options.target.type,
      port: options.targetPort
    }
  });
  options.vertices = connectorData.vertices;
  if (connectorData.virtual) {
    options.virtual = connectorData.virtual;
  }
  if (connectorData.attributes) {
    options.attributes = connectorData.attributes;
  }
  return options;
}

//Loading canvas graph with default/initial graph data
function loadInitialCanvasGraphData() {
  var workflowEditorInstance = WorkflowEditorInstance.getInstance();
  var wfOptions = workflowEditorInstance.getOptions();
  var module = wfOptions.module.toLowerCase();
  var canvasGraphCells = { "cells": [] };//No i18n
  var getWrapper = wf_datas.wrapper;
  if (getWrapper && getWrapper.defaultShapes) {
    jQuery.each(getWrapper.defaultShapes, function (key, value) {
      canvasGraphCells.cells.push(new joint.shapes.workfloweditor[key](value));
      workflowEditorInstance.addNodes(canvasGraphCells.cells, {
        initialCanvasGraphData: true
      });
    })
  } else {
    var statusUrl, stageUrl, statusListInfo, statusResponseKey, stageResponseKey;
    var defaultStages = ['Submission', 'Close'];  //No i18N
    if (module == "change" || module == "release") {
      statusUrl = statusResponseKey = (module == "change") ? "change_statuses" : "release_statuses";  //No i18N
      stageUrl = stageResponseKey = (module == "change") ? "change_stages" : "release_stages";    //No i18N
      statusListInfo = {
        list_info: {
          search_criteria: {
            field: "stage.internal_name",     //No i18N
            condition: "eq",            //No i18N
            values: defaultStages,
            children: [{
              logical_operator: "AND",      //No i18N
              field: "prominent",         //No i18N
              condition: "eq",          //No i18N
              value: true
            },
            {
              logical_operator: "OR",      //No i18N
              field: "internal_name",         //No i18N
              condition: "eq",          //No i18N
              value: "Requested"  //No i18N
            }]
          }
        }
      };
    }
    // populate canvasGraph with default stage submission and close and start & end nodes in case of New workflow
    // Get the starting stage of a workflow - Submission & ending stage of a workflow - Close

    // adding start and end nodes goes here
    canvasGraphCells.cells.push(new joint.shapes.workfloweditor.StartEndNode({
      id: "21",
      position: {
        x: 50,
        y: 30
      },
      name: "Start",        //No i18N
      is_start_node: true,
      outPorts: ['output'],
    }));
    canvasGraphCells.cells.push(new joint.shapes.workfloweditor.StartEndNode({
      id: "22",
      position: {
        x: 600,
        y: 600
      },
      name: "End",        //No i18N
      is_start_node: false,
      inPorts: ['input']
    }));

    var requestedStatus, completedStatus;
    sdpAjax({
      url: "/api/v3/" + statusUrl, data: sdpAjaxInputData(statusListInfo), success: function (status_response) { //No i18N
        var statuses = status_response[statusResponseKey];

        sdpAjax({
          url: "/api/v3/" + stageUrl, data: sdpAjaxInputData({ //No i18N
            list_info: {
              search_criteria: {
                field: "internal_name",   //No i18N
                condition: "eq",      //No i18N
                values: defaultStages
              }
            }
          }),
          success: function (stage_response) {
            jQuery.each(stage_response[stageResponseKey], function (index, stage) {
              var cellData = {
                "id": stage.id,                 //No i18N
                "name": stage.name,               //No i18N
                "stage_internal_name": stage.internal_name,   //No i18N
                "stage_index": stage.stage_index,       //No i18N
                "description": stage.description,       //No i18N
                "type": "workfloweditor.Stage",         //No i18N
                "options": [],                  //No i18N
                "stage_id": stage.id              //No i18N
              };
              var values = [];
              jQuery.each(statuses, function (key, value) {
                // add statuses to the stage
                if (value.stage.internal_name == stage.internal_name) {
                  values.push({
                    "id": value.id,             //No i18N
                    "name": value.name,           //No i18N
                    "internal_name": value.internal_name,   //No i18N
                    "description": value.description    //No i18N
                  });
                }
                if (value.internal_name == wfGetInternalName('Requested')) { requestedStatus = value.name; }
                if (value.internal_name == wfGetInternalName('Completed')) { completedStatus = value.name; }
              });
              if (stage.internal_name == wfGetInternalName('Submission')) {
                submissionStage = stage.name;
                cellData.position = { x: 300, y: 120 };
              }
              else if (stage.internal_name == wfGetInternalName('Close')) {
                closeStage = stage.name;
                cellData.position = { x: 300, y: 400 };
              }
              cellData.options = values;

              canvasGraphCells.cells.push(new joint.shapes.workfloweditor.Stage(cellData));
              // adding links goes here
              if (stage.internal_name == wfGetInternalName('Submission')) {
                canvasGraphCells.cells.push(workflowEditorInstance.createLink({
                  source: {
                    id: '21'
                  },
                  sourcePort: 'output',                   //No i18N
                  target: {
                    id: stage.id
                  },
                  targetPort: 'input_' + encodeURIComponent(requestedStatus)  //No i18N
                }));
              }
              else if (stage.internal_name == wfGetInternalName('Close')) {
                canvasGraphCells.cells.push(workflowEditorInstance.createLink({
                  source: {
                    id: stage.id
                  },
                  sourcePort: 'output_' + encodeURIComponent(completedStatus),  //No i18N
                  target: {
                    id: '22'
                  },
                  targetPort: 'input'                     //No i18N
                }));
              }
            });
            workflowEditorInstance.addNodes(canvasGraphCells.cells, {
              initialCanvasGraphData: true
            });
          }
        });
      }
    });
  }

}

function drawWorkflow(response) {
  var workflowEditorInstance = WorkflowEditorInstance.getInstance();
  if (wf_datas.is_view) {
    wf_datas.wf_self.wf_append_workflow_datas(response);
  } else {
    wf_datas.wf_self.controller.send("wf_append_workflow_datas", response); //No i18N
  }
  var canvasGraphCells = { "cells": [] };  //No i18n
  var counter = {
    "Stage": 0,     //No i18N
    "Switch": 0,    //No i18N
    "Notification": 0,  //No i18N
    "Approval": 0,    //No i18N
    "Condition": 0,   //No i18N
    "FieldUpdate": 0  //No i18N
  };

  //adding statements goes here
  var statements = response.workflow.statements;
  for (var i = 0; i < statements.length; i++) {
    var cell = {};
    cell.id = statements[i].id;
    cell.key = statements[i].key;
    cell.name = statements[i].name;
    cell.description = statements[i].description;
    cell.type = "workfloweditor.".concat(statements[i].type.name);
    if (statements[i].action != null) {
      cell.action_id = statements[i].action.id;
    }

    // Update the counter for the statement key
    if (statements[i].name != "StartEndNode") {
      var key = statements[i].key;
      var regex = new RegExp(statements[i].type.name + "_");
      if (regex.test(key)) {
        var key_counter = key.substring(key.lastIndexOf("_") + 1, key.length);
        if (!isNaN(key_counter) && counter[statements[i].type.name] <= key_counter) {
          counter[statements[i].type.name] = parseInt(key_counter);
        }
      }
    }

    var statementProps = ["id", "name", "key", "description", "type", "action_id"];   //No i18N

    var attrKeys = Object.keys(statements[i]);
    for (var j = 0; j < attrKeys.length; j++) {
      var attrKey = attrKeys[j];
      if (statementProps.indexOf(attrKey) == -1) {
        var attrValue = statements[i][attrKey];
        if (attrKey == "statuses" && (cell.type == "workfloweditor.Stage" || cell.type == "workfloweditor.Approval")) {
          attrKey = "options";  //No i18N
        } else if (cell.type == "workfloweditor.Switch" && attrKey == "options") {
          for (var idx = 0; idx < attrValue.length; idx++) {
            if (attrValue[idx].id == null) { // Handling `Not in any site`
              attrValue[idx].id = "-1";
            }
          }
        } else if (attrKey == 'is_start_node') { //No i18N
          // include inports and outports for startend node
          if (attrValue == 'true') {
            attrValue = true;
            cell.outPorts = ['output'];
          } else if (attrValue == 'false') {
            attrValue = false;
            cell.inPorts = ['input'];
          }
        } else if (attrKey == 'is_udf') {  //No i18N
          if (attrValue == 'true') {
            attrValue = true;
          } else if (attrValue == 'false') {
            attrValue = false;
          }
        } else if (cell.type == "workfloweditor.FieldUpdate" && attrKey == "action") {
          var fields = [];
          if (attrValue && attrValue.field_update) {
            for (var index = 0; index < attrValue.field_update.length; index++) {
              var action_data = attrValue.field_update[index];
              var field = {};
              field.key = action_data.display_name;
              field.value = action_data.display_value ? action_data.display_value : "-";
              field.name = action_data.name;
              fields.push(field);
            }
          }
          cell.fieldUpdates = fields;
        } else if (cell.type == "workfloweditor.Notification" && attrKey == "action") {
          cell.subject = attrValue.notification.subject;
        }
        cell[attrKey] = attrValue;
      }
    }

    if (cell.type == "workfloweditor.Stage") {
      // since stage_index and stage_internal_name are internal attributes, removing them from attributes array
      if (!cacheIdNameMap.stages) {
        cacheIdNameMap.stages = {};
      }
      var element = new joint.shapes.workfloweditor.Stage(cell);
      cacheIdNameMap.stages[element.get("id")] = element.get("name");
      canvasGraphCells.cells.push(element);
    } else if (cell.type == "workfloweditor.Notification") {
      var element = new joint.shapes.workfloweditor.Notification(cell);
      if (!cacheIdNameMap.notifications) {
        cacheIdNameMap.notifications = {};
      }
      cacheIdNameMap.notifications[element.get("id")] = element.get("name");
      canvasGraphCells.cells.push(element);
    } else if (cell.type == "workfloweditor.Condition") {
      cell.attrs = { '.name': { text: cell.name } };  //No i18N
      canvasGraphCells.cells.push(new joint.shapes.workfloweditor.Condition(cell));
    } else if (cell.type == "workfloweditor.Switch") {
      cell.isSingleInputPort = true;
      var element = new joint.shapes.workfloweditor.Switch(cell);
      if (!cacheIdNameMap.switches) {
        cacheIdNameMap.switches = {};
      }
      if (element.get("is_udf")) {
        cacheIdNameMap.switches[element.get("id")] = element.get("name");
      }
      canvasGraphCells.cells.push(element);
    } else if (cell.type == "workfloweditor.Approval") {
      cell.isSingleInputPort = true;
      canvasGraphCells.cells.push(new joint.shapes.workfloweditor.Approval(cell));
    } else if (cell.type == "workfloweditor.StartEndNode") {
      cell.attrs = { '.label': { text: cell.name } }; //No i18n
      canvasGraphCells.cells.push(new joint.shapes.workfloweditor.StartEndNode(cell));
    } else if (cell.type == "workfloweditor.Task") {
      workflowEditorInstance.addNode(joint.shapes.workfloweditor.Task, cell);
    } else if (cell.type == "workfloweditor.FieldUpdate") {
      if (!cacheIdNameMap.fieldUpdates) {
        cacheIdNameMap.fieldUpdates = {};
      }
      var element = new joint.shapes.workfloweditor.FieldUpdate(cell);
      cacheIdNameMap.fieldUpdates[element.get("id")] = element.get("name");
      canvasGraphCells.cells.push(element);
    } else if (typeof wf_datas.wrapper.shapes[cell.type.split(".")[1]] == "object") {
      canvasGraphCells.cells.push(new joint.shapes.workfloweditor[cell.type.split(".")[1]](cell));
    }
  }
  workflowEditorInstance.setOptions({ 'counter': counter });  //NO i18N

  //adding connectors goes here
  for (var i = 0; i < response.workflow.connectors.length; i++) {
    var options = processConnectorOptions(response.workflow.connectors[i], true);
    canvasGraphCells.cells.push(workflowEditorInstance.createLink(options));
  }
  cacheIdNameMap = {};
  workflowEditorInstance.addNodes(canvasGraphCells.cells, {
    initialCanvasGraphData: true,
    loadExistingCanvasGraphData: true
  });
}

function getI18NedStatementType(type) {
  if (type == "Workflow") {
    return translate("common.workflow.label"); //No i18N
  }
  return getStencilName(type);
}

joint.workfloweditor = {};
joint.workfloweditor.OperationManager = Backbone.Model.extend({

  defaults: {
    oprnBeforeAdd: null,
    oprnNameRegex: /^(?:add|remove|change:\w+)$/
  },

  // length of prefix 'change:' in the event name
  PREFIX_LENGTH: 7,

  initialize: function (options) {
    _.bindAll(this, 'initBatchOperation', 'storeBatchOperation');//No i18N
    this.graph = options.graph;
    this.reset();
    this.listen();
  },

  listen: function () {
    this.listenTo(this.graph, 'all', this.addOperation, this);//No i18N
    this.listenTo(this.graph, 'batch:start', this.initBatchOperation, this);//No i18N
    this.listenTo(this.graph, 'batch:stop', this.storeBatchOperation, this);//No i18N
  },

  createOperation: function (options) {
    var oprn = {
      action: undefined,
      data: { id: undefined, type: undefined, previous: {}, next: {} },
      batch: options && options.batch
    }
    return oprn;
  },

  addOperation: function (oprnName, cell, graph, options) {

    if (!this.get('oprnNameRegex').test(oprnName)) {
      return;
    }

    if (typeof this.get('oprnBeforeAdd') == 'function' && !this.get('oprnBeforeAdd').apply(this, arguments)) {
      return;
    }

    var push = _.bind(function (oprn) {
      this.redoStack = [];
      if (!oprn.batch) {
        this.undoStack.push(oprn);
        this.trigger('add', oprn);//No i18N
      } else {
        this.lastOprnIndex = Math.max(this.lastOprnIndex, 0);
        // Operations possible thrown away. Someone might be interested.
        this.trigger('batch', oprn);//No i18N
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
        operation = _.find(this.batchOperation, function (oprn, index) {
          this.lastOprnIndex = index;
          return oprn.data.id === cell.id && oprn.action === oprnName;
        }, this);

        if (!operation) {
          // operation with such an id and action was not found. Let's create new one
          this.lastOprnIndex = this.batchOperation.push(this.createOperation({ batch: true })) - 1;
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


  initBatchOperation: function () {
    if (!this.batchOperation) {
      this.batchOperation = [this.createOperation({ batch: true })];
      this.lastOprnIndex = -1;
      // batch level counts how many times has been initBatchOperation executed.
      // It is useful when we doing an operation recursively.
      this.batchLevel = 0;
    } else {
      // batch operation is already active
      this.batchLevel++;
    }
  },

  storeBatchOperation: function () {
    // In order to store batch operation it is necesary to run storeBatchOperation as many times as 
    // initBatchOperation was executed
    if (this.batchOperation && this.batchLevel <= 0) {
      // checking if there is any valid operation in batch
      // for example: calling `initBatchOperation` immediately followed by `storeBatchOperation`
      if (this.lastOprnIndex >= 0) {
        this.redoStack = [];
        this.undoStack.push(this.batchOperation);
        this.trigger('add', this.batchOperation);//No i18N
      }

      delete this.batchOperation;
      delete this.lastOprnIndex;
      delete this.batchLevel;

    } else if (this.batchOperation && this.batchLevel > 0) {
      // low down batch operation level, but not store it yet
      this.batchLevel--;
    }
  },

  revertOperation: function (operation) {

    this.stopListening();

    var batchOperation;
    var shouldUndoAgain = null;

    if (_.isArray(operation)) {
      batchOperation = operation;
    } else {
      batchOperation = [operation];
    }

    for (var i = batchOperation.length - 1; i >= 0; i--) {
      var oprn = batchOperation[i], cell = this.graph.getCell(oprn.data.id);
      switch (oprn.action) {
        case 'add'://No i18N
          cell.remove();
          break;
        case 'remove'://No i18N
          this.graph.addCell(oprn.data.attributes);
          break;
        default:
          var attribute = oprn.action.substr(this.PREFIX_LENGTH);
          if (cell) {
            cell.set(attribute, oprn.data.previous[attribute]);
          }
      }
      //Callback function to modules for performing additional operations during revertOperation
      //If Undo has to be continued, the following hook can be used based on the operation
      if (wf_datas.wrapper && wf_datas.wrapper.revertOperation && typeof wf_datas.wrapper.revertOperation == "function") {
        shouldUndoAgain = wf_datas.wrapper.revertOperation(oprn, this, shouldUndoAgain);
      }
    }
    this.listen();
    return shouldUndoAgain;
  },

  applyOperation: function (operation) {

    this.stopListening();

    var batchOperation;
    var shouldRedoAgain = null;

    if (_.isArray(operation)) {
      batchOperation = operation;
    } else {
      batchOperation = [operation];
    }

    for (var i = 0; i < batchOperation.length; i++) {
      var oprn = batchOperation[i], cell = this.graph.getCell(oprn.data.id);
      switch (oprn.action) {
        case 'add'://No i18N
          this.graph.addCell(oprn.data.attributes);
          break;
        case 'remove'://No i18N
          cell.remove();
          break;
        default:
          var attribute = oprn.action.substr(this.PREFIX_LENGTH);
          if (cell) {
            cell.set(attribute, oprn.data.next[attribute]);
          }
          break;
      }
      //Callback function to modules for performing additional operations during redoOperation
      //If redo has to be continued, the following hook can be used based on the operation
      if (wf_datas.wrapper && wf_datas.wrapper.applyOperation && typeof wf_datas.wrapper.applyOperation == "function") {
        shouldRedoAgain = wf_datas.wrapper.applyOperation(oprn, this, shouldRedoAgain);
      }
    }
    this.listen();
    return shouldRedoAgain;
  },

  undo: function () {
    var operation = this.undoStack.pop();
    if (operation) {
      var shouldUndoAgain = this.revertOperation(operation);
      this.redoStack.push(operation);
      if (this.hasUndo()) {
        var nextOp = this.undoStack[this.undoStack.length - 1];
        if (_.isArray(nextOp) && nextOp[0].action == "add" || shouldUndoAgain) {
          this.undo();
        }
      }
    }
  },


  redo: function () {
    var operation = this.redoStack.pop();
    if (operation) {
      var shouldRedoAgain = this.applyOperation(operation);
      this.undoStack.push(operation);
      if (this.hasRedo()) {
        if (_.isArray(operation) && operation[0].action == "add" || shouldRedoAgain) {
          this.redo();
        }
      }
    }
  },

  cancel: function () {
    if (this.hasUndo()) {
      this.revertOperation(this.undoStack.pop());
      this.redoStack = [];
    }
  },

  reset: function () {
    this.undoStack = [];
    this.redoStack = [];
    //Callback function to modules for performing additional operations during resetOperation
    //If Undo has to be continued, the following hook can be used based on the operation
    if (wf_datas.wrapper && wf_datas.wrapper.resetOperation && typeof wf_datas.wrapper.resetOperation == "function") {
      wf_datas.wrapper.resetOperation();
    }
  },

  hasUndo: function () {
    return this.undoStack.length > 0;
  },

  hasRedo: function () {
    return this.redoStack.length > 0;
  }
});

function zoomingHandle(event, type) {
  var workflowEditorInstance = WorkflowEditorInstance.getInstance();
  var min = 50, max = 200, step = 10,
    value = parseInt(jQuery('.wf-zooming-value').text());
  if ((type == 'plus') && (value < max)) {
    value = value + step;
    workflowEditorInstance.zoomPaper(event, value);
  }
  if ((type == 'minus') && (value > min)) {
    value = value - step;
    workflowEditorInstance.zoomPaper(event, value);
  }
  if (type == 'reset') {
    value = 100;
    workflowEditorInstance.zoomPaper(event, value);
  }
  jQuery('.wf-zooming-value').text(value + '%');
}

function updateWFViewPortLayout() {
  var wfInstance = WorkflowEditorInstance.getInstance();
  var viewportH;
  if (wf_datas.is_view) {
    viewportH = jQuery(window).height() - (jQuery('#wf_view_container').height() + 10);
  }
  else {
    viewportH = jQuery(window).height() - (jQuery('#header-placeholder').height() + jQuery('#wf_header').height() + 60);
  }
  var wfOptions = wfInstance.getOptions();
  // Stencil area is not needed for PDF
  if (jQuery('.stencil-container').length) {
    var stencilScrollH = jQuery(window).height() - jQuery('.stencil-container').offset().top;
    jQuery('.stencil-container').css({ 'maxHeight': stencilScrollH - 10, 'width': 300 });//No I18n
    var $stencilNodeContainer = jQuery('#wf_stencil_inner_container');
    var stencilNodeHeight = 30;
    var stencilPadding = 10;  //padding between stencil elements
    var stencilElements = $stencilNodeContainer.find("g.joint-type-workfloweditor-stencilele");
    $stencilNodeContainer.height(stencilElements.length * stencilNodeHeight + (stencilElements.length + 1) * stencilPadding);
  }
  var viewportW = calculateWidthByLayout(jQuery(window).width());
  jQuery('.wf-paper-scroller').css('maxHeight', viewportH - 13);//No I18n
  jQuery('.wf-paper-scroller').height(viewportH);
  jQuery('.wf-paper-scroller').width(viewportW - 22);
  if (wfInstance != null) {
    wfInstance.adjustPaper();
  }
}

function loadWorkflow(options) {
  var stencilGraphJson = [];
  var getWrapper = {};
  //Counter to track number of nodes exists with a particular type
  var counter = {};
  if (options) {
    wf_datas.wrapper = options;
    getWrapper = wf_datas.wrapper;
  } else {
    wf_datas.wrapper = {};
  }
  if (wf_datas.mode == 'add') {
    if (getWrapper.counter) {
      counter = getWrapper.counter;
    } else {
      counter = { 'Stage': 0, 'Switch': 0, 'Notification': 0, 'Approval': 0, 'Condition': 0, 'FieldUpdate': 0 };  //No i18N
    }
  }
  // Stencil elements are not needed for PDF
  if (getWrapper.stencilGraphJson) {
    stencilGraphJson = getWrapper.stencilGraphJson;
  } else {
    stencilGraphJson = [{
      name: translate("sdp.admin.workflow.stencil.stage"),
      type: "stage",               //No i18n
      id: 1,
      x: 10,
      y: 10,
      fill: '#C7FAED',             //No i18n
      stroke: '#9AE6D4',               //No i18N
      imgname: '/images/wf-stage.svg'      //No i18N
    }, {
      name: translate("sdp.admin.workflow.stencil.condition"),
      type: "condition",             //No i18n
      id: 2,
      x: 10,
      y: 50,
      fill: '#CBF2FF',             //No i18n
      stroke: '#9DDDF2',               //No i18N
      imgname: '/images/wf-condition.svg'    //No i18N
    }, {
      name: translate("sdp.admin.workflow.stencil.switch"),
      type: "switch",              //No i18n
      id: 3,
      x: 10,
      y: 90,
      fill: '#EDE8F7',             //No i18n
      stroke: '#CFBDF2',               //No i18N
      imgname: '/images/wf-switch.svg'       //No i18N
    }, {
      name: translate("sdp.admin.workflow.stencil.notification"),
      type: "notification",            //No i18n
      id: 4,
      x: 10,
      y: 130,
      fill: '#FFF3C9',             //No i18n
      stroke: '#E0D094',               //No i18N
      imgname: '/images/wf-notification.svg'   //No i18N
    }, {
      name: translate("sdp.admin.workflow.stencil.approval"),
      type: "approval",              //No i18n
      id: 5,
      x: 10,
      y: 170,
      fill: '#E1FCD0',             //No i18n
      stroke: '#B9E39F',               //No i18N
      imgname: '/images/wf-approval.svg'     //No i18N
    }, {
      name: translate("sdp.admin.workflow.stencil.fieldupdate"),
      type: "fieldupdate",           //No i18n
      id: 6,
      x: 10,
      y: 210,
      fill: '#FFEEE8',             //No i18n
      stroke: '#F2C9BC',               //No i18N
      imgname: '/images/wf-field-update.svg'     //No i18N
    }]
  }
  var canvasGraphJson = { "cells": [] };           //No i18n
  // Draw called for stencil and canvas graph population
  var workflowEditorInstance = WorkflowEditorInstance.getInstance();
  var drawOpts = {
    'canvas_data': canvasGraphJson,            //No i18n
    'stencil_data': stencilGraphJson,           //No i18n
    'canvas_id': (getWrapper.canvas_id) ? getWrapper.canvas_id : "wf_canvas_container",             //No i18n
    'stencil_id': (getWrapper.stencil_id) ? getWrapper.stencil_id : "wf_stencil_inner_container",              //No i18n
    'counter': counter,                //No i18N
  };
  workflowEditorInstance.draw(drawOpts);
  if (getWrapper.shapes) {
    jQuery.each(getWrapper.shapes, function (key, value) {
      joint.shapes.workfloweditor[key] = value.extendBranch.extend(value.branch);
      joint.shapes.workfloweditor[key + "View"] = value.extendBranchView.extend(value.branchView);
    });
  }
  //loading canvas graph data goes here
  loadCanvasGraph();
}

function loadCanvasGraph() {
  if (wf_datas.mode == 'add') {  // Add case
    jQuery('.workflow-heading').addClass('visible');
    var workflowEditorInstance = WorkflowEditorInstance.getInstance();
    var initialGraphData = workflowEditorInstance.getOptions().initialCanvasGraphData;
    if (initialGraphData) {
      workflowEditorInstance.getCanvasPaper().model.fromJSON(initialGraphData);
      // automatically resize the paper - Add Case
      workflowEditorInstance.adjustPaper();
      var paper = workflowEditorInstance.getCanvasPaper();
      paper.listenTo(paper.model, 'change add remove reset', this.adjustPaper);//No I18n
      jQuery("#wf_canvas_loader .loading1").remove();
    } else {
      loadInitialCanvasGraphData();
    }
  }
  else if (wf_datas.wrapper.workflow_data) {
    drawWorkflow(wf_datas.wrapper.workflow_data);
    autoAlignWorkflow();
  }
  else {    // Edit case
    var id = wf_datas.wf_id;
    if (!id) { return; }
    var wf_get_current_time = new Date().getTime();
    sdpAjax({
      url: '/api/v3/workflows/' + id, success: function (response) {//No I18n
        wf_datas.wf_response_time = new Date().getTime() - wf_get_current_time;
        wf_datas.workflow = response.workflow;
        wf_datas.workflowStagesBeforeModification = wfEditorUtil.getWorkflowStages(response.workflow.statements);
        drawWorkflow(response);
      }
    });
  }
}

function isInternetExplorer() { // IE Version returning code is commented
  var user_agent, edge_index;
  user_agent = window.navigator.userAgent;
  edge_index = user_agent.indexOf('Edge/');
  if (edge_index > 0) {
    return true;
  }
  return false;
}

function ashtmlString(str) {
  return jQuery('<div/>').text(str).html();
}

function astextString(str) {
  return jQuery('<div/>').html(str).text();
}

function wfGetInternalName(wf_internal_name) {
  var wf_get_internal_name = ""
  if (wf_datas.module == "change") {
    wf_get_internal_name = wf_internal_name;
  } else if (wf_datas.module == "release") { //No I18n
    wf_get_internal_name = wf_internal_name.toLowerCase();
  }
  return wf_get_internal_name;
}

function getStencilName(type) {
  var nodeText = "";
  if (wf_datas.wrapper && wf_datas.wrapper.stencilName && wf_datas.wrapper.stencilName[type]) {
    nodeText = wf_datas.wrapper.stencilName[type];
  } else {
    nodeText = translate("sdp.admin.workflow.stencil." + type.toLowerCase());
  }
  return nodeText;
}

/**
 * Function to align the workflow using the DirectedGraph layout which is by default supported by JointJS
 * Included dagre.js and graphlib.js files which are dependency for this alignment.
 */
function autoAlignWorkflow() {
  var canvasPaperModel = WorkflowEditorInstance.getInstance().getCanvasPaper().model;
  joint.layout.DirectedGraph.layout(canvasPaperModel, {
    nodeSep: 75,
    edgeSep: 100,
    rankSep: 60,
    rankDir: 'LR',  //NO I18N
    align: 'UL',    //NO I18N
    ranker: 'tight-tree',   //NO I18N
    marginX: 75,
    marginY: 100,
    resizeClusters: true,
    clusterPadding: {
      top: 30,
      left: 20,
      right: 20,
      bottom: 20
    }
  });
}
/** Action Library selection ends **/

window.wfEditorUtil = {
  /**
   * Get stages in workflow by id
   */
  getWorkflowStages(statements){
    let wfStages = [];
    for(const statement of statements){
      if(statement.type.name == "Stage"){
        wfStages.push(statement.stage_id);
      }
    }
    return wfStages;
  },
  /**
   * Get stages in workflow by internal name
   */
  getWorkflowStagesInternalName(statements){
    let wfStages = [];
    for(const statement of statements){
      if(statement.type.name == "Stage"){
        wfStages.push(statement.stage_internal_name);
      }
    }
    return wfStages;
  },
  /**
   * Stage and its fields mapping details inorder to do workflow fields validation
   */
  getStageWiseFields() {
    let _self = this;
    let stageWiseFields;
    if (wf_datas.module === "change") {
      stageWiseFields = {
        "Planning": ["back_out_plan", "roll_out_plan", "impact_details", "checklist", "release_scheduled_start", "release_scheduled_end"],  //NO I18N
        "UAT": ["uat_description", "uat_scheduled_start", "uat_scheduled_end", "uat_actual_start", "uat_actual_end"],  //NO I18N
        "Release": ["release_actual_start", "release_actual_end", "release_description"],  //NO I18N
        "Review": ["review_details"],  //NO I18N
        "Close": ["close_details", "closure_code"]  //NO I18N
      };
      stageWiseFields = _self.appendStageWiseUDFFields(stageWiseFields);
    }
    else if (wf_datas.module === "release") {
      stageWiseFields = {
        "planning": ["back_out_plan", "roll_out_plan", "impact_details", "checklist"],  //NO I18N
        "review": ["next_review_on"]  //NO I18N
      };
    }
    return stageWiseFields;
  },

  /**
   * Get the stagewise udf fields and append it to the stage default fields
   */
  appendStageWiseUDFFields(stageWiseFields){
    let _self = this;
    sdpAjax({
      url: "/api/v3/"+wf_datas.module+"_stages/udf_fields",   //NO I18N
      async: false,
      success: function (response) {
        if(response && response.stage_udf_fields){
          for(const stageId in response.stage_udf_fields){
            const stageInternalName = _self.getStageInternalName(stageId);
            let udfFields = response.stage_udf_fields[stageId].map(udfAPIName => "udf_fields."+udfAPIName);
            if(stageWiseFields.hasOwnProperty(stageInternalName)){
              stageWiseFields[stageInternalName] = stageWiseFields[stageInternalName].concat(udfFields);
            }else{
              stageWiseFields[stageInternalName] = udfFields;
            }
          }
        }
      }
    });
    return stageWiseFields;
  },

  /**
   * check whether Condition|Field Update|Switch node has stage wise fields whose stage is not in the workflow
   */
  getNodesWithNonAvailableStageFields(stageName){
    let _self = this;
    let nodesWithNonStageFields = [];
    let conditionNodes = wf_datas.wf_editor_instance.getCellsByType("workfloweditor.Condition");  //NO I18N
    let fieldUpdateNodes = wf_datas.wf_editor_instance.getCellsByType("workfloweditor.FieldUpdate");  //NO I18N
    let wfNodes = conditionNodes.concat(fieldUpdateNodes);

    let switchNodes = wf_datas.wf_editor_instance.getCellsByType("workfloweditor.Switch");  //NO I18N
    wfNodes = wfNodes.concat(switchNodes);
    if(wfNodes.length > 0){
      wfNodes.forEach((wfNode) => {  
        let fieldsInNode = [];
        if(wfNode.attributes.type == "workfloweditor.Switch"){
          if(wfNode.attributes.is_udf){
            fieldsInNode = wfNode.attributes.internal_name.includes("udf_fields") ? wfNode.attributes.internal_name : wfNode.attributes.internal_name.split(".")[0]; //NO I18N
          }
        }else{
          let attributesField = wfNode.attributes.criteria ? wfNode.attributes.criteria : wfNode.attributes.fieldUpdates;
          fieldsInNode = attributesField.map((item) => {
            let field = item.field ? item.field : item.name;
            if(field.includes("udf_fields")){
              return field;
            }else{
              return field.split(".")[0];
            }});
        }
        
        let isFieldPresent = stageName ? _self.isRemovalStageFieldsPresentInWfNode(fieldsInNode,"",stageName) : _self.isNonAvailableStageFieldsPresentInWfNode(fieldsInNode);
        if(isFieldPresent){
          nodesWithNonStageFields.push(wfNode);
        }
      });
    }
    return nodesWithNonStageFields;
  },

  /**
   * Validate whether non available stage's field is present in other nodes. This validation happens when 'Show only the stages and statuses added in workflow' setting is chosen.
   */
  isNonAvailableStageFieldsPresentInWfNode(fieldsInNode, nodeType){
    let _self = this;
    let stagesInWf = _self.getWorkflowStagesInternalName(wf_datas.wf_editor_instance.getGraphData(true).statements);
    let stageWiseFields = _self.getStageWiseFields();
    wf_datas.wf_self.controller.send("wf_get_metainfo");  //NO I18N
    for(let stage of Object.keys(stageWiseFields)){
      if(!stagesInWf.includes(stage)){
        for(let field of stageWiseFields[stage]){
          if(fieldsInNode.includes(field)){
            return true;
          }
        }
      }
    }
    return false;
  },

  /**
   * Validate whether removal stage's field is present in other nodes. Validation happens when stage is removed.
   */
  isRemovalStageFieldsPresentInWfNode(fieldsInNode, nodeType, removalStageName){
    let _self = this;
    let stageWiseFields = _self.getStageWiseFields();
    if(stageWiseFields.hasOwnProperty(removalStageName)){
      for(let field of stageWiseFields[removalStageName]){
        if(fieldsInNode.includes(field)){
          return true;
        }
      }
    }
    return false;
  },
  getStageInternalName(stageId){
    let stages;
    if(wf_datas.stages){
      stages = wf_datas.stages;
    }else{
      sdpAjax({
        url: "/api/v3/"+(wf_datas.module === "change" ? "changes" : "releases")+"/stage",  //NO I18N
        success: function(response){
          if(response.response_status && response.response_status.status == "success"){
            stages = wf_datas.stages = response.stage;
          }
        },
        async: false
      });
    }
    let stageInternalName;
    for(const stage of stages){
      if(stage.id == stageId){
        stageInternalName =  stage.internal_name;
        break;
      }
    }
    return stageInternalName;
  }
}