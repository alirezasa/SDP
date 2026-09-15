/* $Id$ */
var ziaBotWFUtil = {
    zwfControllerObj: null,
    wfControllerObj: null,
    workflow_data: null,
    wf_type: null,
    init: function (controllerObj, workflow_data) {
        this.zwfControllerObj = controllerObj;
        this.workflow_data = workflow_data;
        this.wfControllerObj = wf_datas.wf_self.controller;
        this.workflow_modification_operations.modifiedWorkflowJSON = {
            nodes_added: [],
            nodes_removed: [],
            nodes_updated: [],
            buttons_updated: []
        };
        this.wf_type = controllerObj.get('wf_type');
    },
    getConfiguration: function () {
        var _self = this;
        return {
            module: "zia-bot",  //NO I18N
            canvas_id: "wf_canvas_container",   //NO I18N
            stencil_id: "wf_stencil_inner_container",   //NO I18N
            is_start_end_node_validation_required: false,
            is_unconnected_node_validation_required: true,
            is_loop_validation_required: false,
            stencilGraphJson: [
                {
                    name: translate("zia.bot.workflow.options.menu"),
                    type: "multiSelectNode",    //NO I18N
                    id: 1,
                    x: 10,
                    y: 10,
                    fill: '#EAF5F2',    //NO I18N
                    stroke: '#b8d7cf'   //NO I18N
                },
                {
                    name: translate("sdp.admin.workflow.stencil.action"),
                    type: "action", //NO I18N
                    id: 2,
                    x: 10,
                    y: 50,
                    fill: '#F7E7D9',    //NO I18N
                    stroke: '#F4D5B9'   //NO I18N
                }
            ],
            stencilName: { "multiSelectNode": translate("zia.bot.workflow.options.menu"), "userInput": translate("sdp.admin.workflow.stencil.userinput"), "action": translate("sdp.admin.workflow.stencil.action"), "furtherAssistance": translate("zia.bot.workflow.furtherassistance.label"), "output": translate("zia.bot.response"), "feedback": translate("sdp.feedback.title") },  //NO I18N
            stencilHooks: { "multiSelectNode": ziaBotWFUtil.node_operations.multiSelectNode.edit, "action": ziaBotWFUtil.node_operations.action.edit }, //NO I18N
            /**
             * The shapes object has the definition for each and every statement types which is used to render the node while initialization and during update
             */
            shapes: {
                "start": {  //NO I18N
                    "branch": { //NO I18N
                        markup: '<g class="rotatable"><g class="scalable"><rect class="body"/><g class="node-icon-cont"/></g><text class="label"/><text class="name"/><title class="node-title"/><g class="inPorts"/><g class="outPorts"/></g>',  //No i18N
                        defaults: joint.util.deepSupplement({
                            type: 'workfloweditor.start', //No i18N
                            size: { width: 80, height: 25 },
                            isPortInTopBottomModel: false,
                            isSourceCell: true,
                            outPorts: ['output'],
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
                        }, joint.shapes.workfloweditor.Base.prototype.defaults)
                        ,
                        initialize: function () {
                            joint.shapes.workfloweditor.Base.prototype.initialize.apply(this, arguments);
                            this.attr('.body/fill', 'white');
                            this.attr('.body/stroke', '#D1D1D1');
                            this.attr(".label/text", translate("sdp.common.start"));
                            this.attr('.label/event', 'element:collapse');
                            this.nodeIconMarkup = '<svg class="node-icon start" viewBox="-191 193 16 16" style="enable-background:new -191 193 16 16;"><circle cx="-183" cy="201" r="7.9"/><polygon points="-185.1,197.2 -179.5,201.3 -185.1,205.3 "/></svg>';  //No i18N

                        }
                    },
                    "branchView": { //NO I18N
                        /**
                         * Function to listen the click event of the start node which is used to connect a 'Options Menu' node when there is no connection with start node
                         *
                         * @param {object} $this - start node cell object to get the 'next_node' attribute
                         * @param {} evt
                         */
                        expand: function ($this, evt) {
                            var start = $this.get('start');
                            if (!start.next_node) {
                                var sourceNode = { "cell": $this }; //NO I18N
                                _self.zwfControllerObj.set("sourceNode", sourceNode);   //NO I18N
                                _self.node_operations.multiSelectNode.edit();
                            }
                        }
                    },
                    "extendBranch": joint.shapes.workfloweditor.Base,   //NO I18N
                    "extendBranchView": joint.shapes.workfloweditor.BaseView,   //NO I18N
                },
                "furtherAssistanceButton": {    //NO I18N
                    "branch": { //NO I18N
                        markup: '<g class="rotatable"><g class="scalable"><rect class="body"/><g class="node-icon-cont"/></g><text class="label"/><text class="name"/><title class="node-title"/><g class="inPorts"/></g>',  //No i18N
                        defaults: joint.util.deepSupplement({
                            type: 'workfloweditor.furtherAssistanceButton', //No i18N
                            size: { width: 150, height: 25 },
                            isPortInTopBottomModel: false,
                            isLeafCell: true,
                            inPorts: ['input'],
                            outPorts: ['output'],
                            attrs: {
                                '.body': {            //No i18N
                                    rx: 12, ry: 12,
                                    width: 150, height: 25
                                },
                                '.node-icon': {         //No i18N
                                    width: 16, height: 16,
                                    x: 10,
                                    y: 5
                                },
                                '.label': { text: 'Further Assistance', x: 5, y: 7 }//No i18N
                            }
                        }, joint.shapes.workfloweditor.Base.prototype.defaults)
                        ,
                        initialize: function () {
                            joint.shapes.workfloweditor.Base.prototype.initialize.apply(this, arguments);
                            this.attr('.body/fill', 'white');
                            this.attr('.body/stroke', '#D1D1D1');
                            this.attr(".label/text", translate('zia.bot.workflow.furtherassistance.label'));
                            //Further Assistance Expand/collapse will happen only when a start node is present. so the event will be added only for that
                            if (!(ziaBotWFUtil.wf_type === 'expand' || ziaBotWFUtil.wf_type === 'button' || ziaBotWFUtil.workflow_data.workflow.isActionNotUsedInWorkflow || !parseInt(this.id))) {
                                this.attr('.label/event', 'element:collapse');
                            }
                            this.nodeIconMarkup = '<svg class="node-icon start" viewBox="-191 193 16 16" style="enable-background:new -191 193 16 16;"><circle cx="-183" cy="201" r="7.9"/><polygon points="-185.1,197.2 -179.5,201.3 -185.1,205.3 "/></svg>';  //No i18N
                        }
                    },
                    "branchView": { //NO I18N
                        /**
                         * Function to expand/collapse the further assistance button to see the flow (Further Assistance -> Feedback)
                         *
                         * @param {object} $this - furtherAssistance button cell object to get 'isCollapsed' attribute
                         * @param {*} evt
                         */
                        expand: function ($this, evt) {
                            var wf_editor = wf_datas.wf_editor_instance;
                            var wf_model = wf_editor.getCanvasPaper().model;
                            var workflowData = _self.workflow_data.workflow;
                            var statementDetails = workflowData.statements_details;
                            var connectorDetails = workflowData.connectors_details;
                            var optionDetail = connectorDetails[$this.id] ? connectorDetails[$this.id] : null;
                            var nextCellId = optionDetail.target;
                            var isNodeCollapsed = ziaBotWFUtil.workflow_canvas_operations.getSuccessorCells($this).length ? false : true;
                            var isFurtherAssistanceFeedbackNodeModified = ziaBotWFUtil.workflow_canvas_operations.isFurtherAssistanceFeedbackNodeModified();
                            if (!isFurtherAssistanceFeedbackNodeModified) {
                                if (isNodeCollapsed) {
                                    //Collapses the already expanded Further Assistance Node.
                                    var isFurtherAssistanceNodeExpanded = ziaBotWFUtil.workflow_canvas_operations.isFurtherAssistanceNodeExpanded();
                                    var collapseTimeout = 0;
                                    if (isFurtherAssistanceNodeExpanded) {
                                        ziaBotWFUtil.workflow_canvas_operations.collapseFurtherAssistanceNodes();
                                        collapseTimeout = 50;
                                    }

                                    var cells = [], connectors = [], cellIds = [];
                                    connectors.push(ziaBotWFUtil.workflow_canvas_operations.processConnector(optionDetail.connector));
                                    ziaBotWFUtil.workflow_canvas_operations.getCellsToBeExpanded(statementDetails, connectorDetails, true, nextCellId, cells, connectors, cellIds);
                                    var wf_canvas_cells = cells.concat(connectors);

                                    setTimeout(function () {
                                        wf_model.trigger("batch:start", { batchName: "add-collapsed-fa-cells" });  //No I18N
                                        ziaBotWFUtil.workflow_modification_operations.trackCell(wf_canvas_cells, false);
                                        wf_editor.addNodes(wf_canvas_cells);
                                        autoAlignWorkflow();
                                        //Adding the Yes Button - Start connector at the end to avoid the alignment issue
                                        setTimeout(function () {
                                            wf_editor.addNodes([_self.zwfControllerObj.get('furtherAssistanceStart_connector')]);
                                            wf_model.trigger("batch:stop", { batchName: "add-collapsed-fa-cells" });  //No I18N
                                        }, 100);
                                    }, collapseTimeout);
                                } else {
                                    ziaBotWFUtil.workflow_canvas_operations.collapseFurtherAssistanceNodes();
                                }
                            } else if (isNodeCollapsed) {
                                wf_datas.wf_editor_instance.highlightNodes([wf_model.getCell(statementDetails.further_assistance_node_id), wf_model.getCell(statementDetails.feedback_node_id)], errorHighlighter);
                                showalert('info', translate("zia.bot.fa.button.modified"), 'isAutoHide=true');  //NO I18N
                                setTimeout(function () {
                                    wf_datas.wf_editor_instance.unhighlightNodes(errorHighlighter);
                                }, 5000);
                            }
                        }
                    },
                    "extendBranch": joint.shapes.workfloweditor.Base,   //NO I18N
                    "extendBranchView": joint.shapes.workfloweditor.BaseView,   //NO I18N
                },
                "button": { //NO I18N
                    "branch": { //NO I18N
                        markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g><g class="node-icon-cont"></g><text class="node-name"/><title class="node-title"/><g class="actions"><image class="btn-edit-node"><title/></image></g><g class="option-outport"><circle class="port-body"/><text class="port-label"/></g></g></g>',  //No i18N
                        defaults: joint.util.deepSupplement({
                            isSourceCell: true,
                            type: 'workfloweditor.button', //No i18N
                            attrs: {
                                '.body': {            //No i18N
                                    width: 80, height: 10
                                },
                                '.node-name': { //NO I18N
                                    y: 25
                                }
                            }
                        }, joint.shapes.workfloweditor.Branch.prototype.defaults),
                        initialize: function () {
                            this.attr('.body/fill', 'white');
                            this.attr('.btn-edit-node/x', 140, { silent: true });
                            //Pointer should be shown only to the nodes which has next_node
                            var buttonObj = this.get('button');
                            if (buttonObj.next_node || !buttonObj.is_default) {
                                this.attr('.node-name/event', 'element:collapse');
                                this.attr('.node-name/cursor', 'pointer');
                            } else {
                                this.set('isLeafCell', true);   //NO I18N
                                this.attr('.option-outport/visibility', 'hidden');
                            }
                            joint.shapes.workfloweditor.Branch.prototype.initialize.apply(this, arguments);
                        }
                    },
                    "branchView": { //NO I18N
                        buttonUpdate: function ($this, options) {
                            $this.paper.model.trigger('batch:start', { batchName: 'update-button' });//No i18N
                            $this.updateModel(options);
                            $this.paper.model.trigger('batch:stop', { batchName: 'update-button' });//No i18N
                        },
                        /**
                         * Function to listen the click event to construct the next node if not connected
                         *
                         * @param {object} $this - button cell object to get the 'next_node' attribute
                         * @param {*} evt
                         */
                        expand: function ($this, evt) {
                            var button = $this.get('button');
                            //When the button's next node is removed, then below properties are set to create connection with the new nodes
                            if (!button.next_node) {
                                var sourceNode = { "cell": $this, "option": button };   //NO I18N
                                _self.zwfControllerObj.set("sourceNode", sourceNode);   //NO I18N
                                ziaBotWFUtil.node_operations.button.constructNextNodeForButton();
                            }
                        }
                    },
                    "extendBranch": joint.shapes.workfloweditor.Branch, //NO I18N
                    "extendBranchView": joint.shapes.workfloweditor.BranchView, //NO I18N
                    "editAction": ziaBotWFUtil.node_operations.button.edit  //NO I18N
                },

                "multiSelectNode": {    //NO I18N
                    "branch": { //NO I18N
                        optionMarkup: '<g class="option"><rect class="option-rect"/><text class="option-text"/><title class="option-title"/><g class="option-outport"><circle class="port-body"/><text class="port-label"/></g></g>',//No I18n
                        defaults: joint.util.deepSupplement({
                            type: 'workfloweditor.multiSelectNode', //No I18n
                            isSingleInputPort: true,
                            isLeafCell: true,
                            inPorts: ["input"],
                        }, joint.shapes.workfloweditor.Branch.prototype.defaults),
                        initialize: function () {
                            this.attr('.action-rect/width', 0);//No Option actions
                            this.attr('.body/fill', '#e7f5f2');
                            if (ziaBotWFUtil.wf_type === 'expand') {
                                this.markup = '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g><g class="node-icon-cont" /><text class="node-type"/><text class="node-name"/><title class="node-title"/></g><g class="options"></g><g class="option-actions"></g><g class="inPorts"/><g class="outPorts"/></g>';
                            } else {
                                this.attr('.option-text/cursor', 'pointer');
                                this.attr('.option-text/event', 'element:collapse');
                            }

                            joint.shapes.workfloweditor.Branch.prototype.initialize.apply(this, arguments);
                        },
                        getPortAttrs: function (portName, index, total, selector, type) {
                            var attrs = {};
                            if (selector === '.inPorts') {
                                attrs = joint.shapes.workfloweditor.Base.prototype.getPortAttrs.apply(this, arguments);
                                attrs['.inPorts>.port0']['ref-y'] = 0.2;    //NO I18N
                            }
                            return attrs;
                        }
                    },
                    "branchView": { //NO I18N
                        removeNode: function (evt) {
                            var _self = this;
                            var wf_model = wf_datas.wf_editor_instance.getCanvasPaper().model;
                            var inCompleteButtonTargetNodes = [];
                            var inCompleteButtonNames = [];
                            _self.model.attributes.options.forEach(function (opt) {
                                /** While deleting an Options Menu, the connection between an existing button and its next node will be verified,
                                 * if it got disconnected during customization, remove the next node and it successors. */
                                if (parseInt(opt.id) && !opt.next_node && opt.old_next_node) {
                                    var tagetNode = wf_model.getCell(opt.old_next_node);
                                    inCompleteButtonNames.push(opt.name);
                                    inCompleteButtonTargetNodes.push(tagetNode);
                                }
                            });
                            if (inCompleteButtonNames.length) {
                                message = translate("zia.bot.button.target.node.delete.msg", [e_html(inCompleteButtonNames.join())]);
                                message = message.replace(/,/g, "&#x2c;");
                                showconfirm(true, 'title=' + translate("common.confirm.submit") + ', message=' + message + ', submitbutton=' + translate('common.proceed') + ', cancelbutton=' + translate('common.no') + ', closebutton=yes, closeOnEscKey=yes', function (proceed) { //NO I18N
                                    if (proceed) {
                                        //Delete the target Node of the buttons while deleting the Options Menu Node
                                        inCompleteButtonTargetNodes.forEach(function (targetNode) {
                                            ziaBotWFUtil.workflow_canvas_operations.removeNodes(targetNode, false);
                                        });
                                        ziaBotWFUtil.workflow_canvas_operations.removeNodes(_self.model, true);
                                    }
                                });
                            } else {
                                ziaBotWFUtil.workflow_canvas_operations.removeNodes(_self.model, true);
                            }

                        },
                        renderMarkup: function () {
                            joint.shapes.workfloweditor.BranchView.prototype.renderMarkup.apply(this, arguments);
                            //Disabling delete for options node that comes after a default action
                            var can_delete_node = this.model.attributes.can_delete_node;
                            if ((typeof can_delete_node !== "undefined") && !can_delete_node) {
                                var modelId = this.model.get("id");
                                var selector = 'g[model-id="' + modelId + '"] .btn-remove-node';//No i18N
                                jQuery(selector).remove();
                                this.model.attr('.btn-edit-node/x', 140, { silent: true });
                            }
                        },
                        multiSelectNodeUpdate: function ($this, options) {
                            $this.paper.model.trigger('batch:start', { batchName: 'update-multiSelectNode' });//No i18N
                            $this.updateModel(options);
                            $this.model.set('name', options.name); //No i18N
                            $this.model.set('options', options.options); //No i18N
                            $this.model.attr('.node-name/text', $this.getText());
                            $this.paper.model.trigger('batch:stop', { batchName: 'update-multiSelectNode' });//No i18N
                        },
                        /**
                         * Function to expand/collapse the button's flow in a Options Menu
                         *
                         * In collapse mode, only one action's flow will be shown, so when a button is clicked for expanding
                         * then first button's Action will be shown and other flows will be collapsed
                         *
                         * In expand mode, all the flows will be expanded and individual flows can be expanded and collapsed
                         * without disturbing other flows
                         *
                         * @param {object} $this - Options Menu cell object to get the id and the attributes
                         * @param {object} evt - event object is used to get the clicked option(button) ID
                         * @returns The function will be returned in the middle if there is no connection for the button clicked to create next flow
                         */
                        expand: function ($this, evt) {
                            var optionId = jQuery(evt.currentTarget).parent().attr('option-id');
                            var wf_editor = wf_datas.wf_editor_instance;
                            var wf_model = wf_editor.getCanvasPaper().model;
                            var workflowData = _self.workflow_data.workflow;
                            var statementDetails = workflowData.statements_details;
                            var connectorDetails = workflowData.connectors_details;
                            var isExpandMode = _self.zwfControllerObj.get('wf_type') === 'expand';  //NO I18N
                            var optionIndex = -1;
                            var cellId = $this.id;
                            var option = wf_model.getCell(cellId).get('options').find(function (option, i) {  //NO I18N
                                if (option.id === optionId) {
                                    optionIndex = i;
                                    return true;
                                }
                            });

                            var isCollapsed = true;

                            wf_model.getLinks().every(function (link) {
                                //Remove improper links if connected to a button
                                if (!link.get('target').id) {
                                    link.remove();
                                    return false;
                                    //To find whether the option clicked is expanded/collapsed.
                                } else {
                                    var sourceCell = link.get('source');
                                    var sourcePortName = decodeURIComponent(sourceCell.port.slice('output_'.length)); //NO I18N
                                    if (sourcePortName == option.name && sourceCell.type === 'multiSelectNode') {
                                        isCollapsed = false;
                                        if (cellId != sourceCell.id) {
                                            wf_datas.wf_editor_instance.highlightNodes([wf_model.getCell(sourceCell.id)], errorHighlighter);
                                            showalert('info', translate("zia.bot.button.already.expanded", [e_html(sourcePortName)]), 'isAutoHide=true');   //NO I18N
                                            setTimeout(function () {
                                                wf_datas.wf_editor_instance.unhighlightNodes(errorHighlighter);
                                            }, 5000);
                                        }
                                    }
                                }
                                return true;
                            });

                            if (isCollapsed) {
                                var cells = [];
                                var connectors = [];
                                var cellIds = [];
                                var wf_canvas_cells = [];
                                var nextCellId;

                                var isCellsToBeCloned = false;

                                if (!option.next_node) {
                                    //When a new button is added, below properties are set to create connection with the new nodes
                                    var sourceNode = { "cell": $this, "option": option };   //NO I18N
                                    _self.zwfControllerObj.set("sourceNode", sourceNode);   //NO I18N
                                    ziaBotWFUtil.node_operations.button.constructNextNodeForButton();
                                    return;
                                } else {
                                    var optionDetail = connectorDetails[cellId] ? connectorDetails[cellId][optionId] : null;
                                    if (optionDetail) {
                                        nextCellId = optionDetail.target;
                                        connectors.push(ziaBotWFUtil.workflow_canvas_operations.processConnector(optionDetail.connector));

                                        //When a new button is added while editing the MultiSelect Node
                                    } else {
                                        nextCellId = option.next_node;
                                        //The cell is not present in the canvas so existing details can be used.
                                        var nextCell = wf_model.getCell(nextCellId);
                                        if (nextCell) {
                                            isCellsToBeCloned = true;
                                        }
                                        nextCell = statementDetails[nextCellId];
                                        var currentCell = $this.attributes;
                                        var connector = ziaBotWFUtil.workflow_canvas_operations.addConnectors([currentCell, nextCell], optionIndex)[0];
                                        connectors.push(connector);
                                    }
                                }
                                ziaBotWFUtil.workflow_canvas_operations.getCellsToBeExpanded(statementDetails, connectorDetails, isExpandMode, nextCellId, cells, connectors, cellIds);

                                wf_canvas_cells = cells.concat(connectors);

                                if (isCellsToBeCloned) {
                                    wf_canvas_cells = Object.values(wf_model.cloneCells(wf_canvas_cells));
                                }

                                setTimeout(function () {
                                    wf_model.trigger("batch:start", { batchName: "add-collapsed-cells" });  //No I18N
                                    ziaBotWFUtil.workflow_modification_operations.trackCell(wf_canvas_cells, false);
                                    wf_editor.addNodes(wf_canvas_cells);
                                    ziaBotWFUtil.workflow_modification_operations.updateNodeTypeName();
                                    autoAlignWorkflow();
                                    wf_model.trigger("batch:stop", { batchName: "add-collapsed-cells" });  //No I18N
                                }, 150);

                                //If the workflow is not in expanded mode, then all other flow will be collapsed.
                                if (!isExpandMode) {
                                    var cellsNotToBeCollapsed = [cellId];
                                    //Nodes added or updating in this editing should not be collapsed
                                    var modifiedNodes = ziaBotWFUtil.workflow_modification_operations.getModifiedNodes();
                                    cellsNotToBeCollapsed = cellsNotToBeCollapsed.concat(modifiedNodes);
                                    ziaBotWFUtil.workflow_canvas_operations.collapseNodes(null, cellsNotToBeCollapsed);
                                }

                            } else if (isExpandMode) {
                                wf_model.trigger("batch:start", { batchName: "remove-expanded-cells" });  //No I18N
                                ziaBotWFUtil.workflow_canvas_operations.collapseNodes(wf_model.getCell(option.next_node), [], true);
                                setTimeout(function () {
                                    autoAlignWorkflow();
                                    wf_model.trigger("batch:stop", { batchName: "remove-expanded-cells" });  //No I18N
                                }, 150);
                            }
                        }
                    },
                    "extendBranch": joint.shapes.workfloweditor.Branch, //NO I18N
                    "extendBranchView": joint.shapes.workfloweditor.BranchView, //NO I18N
                    "editAction": ziaBotWFUtil.node_operations.multiSelectNode.edit //NO I18N
                },

                "userInput": {  //NO I18N
                    "branch": { //NO I18N
                        markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g><g class="node-icon-cont"></g><text class="node-type"/><text class="node-name"/><title class="node-title"/></g><g class="options"></g><g class="option-actions"></g><g class="actions"></g><g class="inPorts"/><g class="outPorts"/></g>',
                        optionMarkup: '<g class="option"><rect class="option-rect"/><text class="option-text"/><title class="option-title"/></g>',//No I18n
                        defaults: joint.util.deepSupplement({
                            type: 'workfloweditor.userInput', //No I18n
                            isSingleInputPort: true,
                            inPorts: ["input"],
                            nodeHeaderHeight: 30
                        }, joint.shapes.workfloweditor.Branch.prototype.defaults),
                        initialize: function () {
                            this.attr('.action-rect/width', 0);//No Option actions
                            this.attr('.body/fill', '#f8f0d2');
                            this.attr('.btn-edit-node/x', 140, { silent: true });
                            joint.shapes.workfloweditor.Branch.prototype.initialize.apply(this, arguments);
                        },
                        getPortAttrs: function (portName, index, total, selector, type) {
                            var attrs = {};
                            if (selector === '.inPorts' || selector === '.outports') {
                                attrs = joint.shapes.workfloweditor.Base.prototype.getPortAttrs.apply(this, arguments);
                            }
                            return attrs;
                        }
                    },
                    "branchView": {    //NO I18N
                        initialize: function () {
                            joint.shapes.workfloweditor.BranchView.prototype.initialize.apply(this, arguments);
                            this.model.attr('.node-name/text', '', { silent: true });
                            if (ziaBotWFUtil.wf_type !== 'expand' && !this.model.get('is_default')) {
                                this.model.markup = '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g><g class="node-icon-cont"></g><text class="node-type"/><text class="node-name"/><title class="node-title"/></g><g class="options"></g><g class="option-actions"></g><g class="actions"><image class="btn-edit-node"><title/></image></g><g class="inPorts"/><g class="outPorts"/></g>';
                                this.model.attr('.btn-edit-node title/text', translate("zia.bot.userinput.info"), { silent: true });
                                this.model.attr('.btn-edit-node/xlink:href', '/images/info1.png', { silent: true });
                            }
                        },
                        userInputUpdate: function ($this, options) {
                            $this.paper.model.trigger('batch:start', { batchName: 'update-userinput' });//No i18N
                            $this.updateModel(options);
                            if (options.options) {
                                $this.model.set('options', options.options);    //NO I18N
                                $this.renderOptions();
                            }
                            $this.model.attr('.node-name/text', '');
                            $this.paper.model.trigger('batch:stop', { batchName: 'update-userinput' });//No i18N
                        }
                    },
                    "extendBranch": joint.shapes.workfloweditor.Branch, //NO I18N
                    "extendBranchView": joint.shapes.workfloweditor.BranchView, //NO I18N
                },

                "output": { //NO I18N
                    "branch": { //NO I18N
                        markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g><g class="node-icon-cont"></g><text class="node-type"/><text class="node-name"/><title class="node-title"/></g><g class="options"></g><g class="option-actions"></g><g class="inPorts"/><g class="outPorts"/></g>',
                        optionMarkup: '<g class="option"><rect class="option-rect"/><text class="option-text"/><title class="option-title"/></g>',//No I18n
                        defaults: joint.util.deepSupplement({
                            type: 'workfloweditor.output', //No I18n
                            isSingleInputPort: true,
                            inPorts: ["input"],
                            nodeHeaderHeight: 30
                        }, joint.shapes.workfloweditor.Branch.prototype.defaults),
                        initialize: function () {
                            this.attr('.action-rect/width', 0);//No Option actions
                            this.attr('.body/fill', '#e8f8d2');
                            joint.shapes.workfloweditor.Branch.prototype.initialize.apply(this, arguments);
                        },
                        getPortAttrs: function (portName, index, total, selector, type) {
                            var attrs = {};
                            if (selector === '.inPorts') {
                                attrs = joint.shapes.workfloweditor.Base.prototype.getPortAttrs.apply(this, arguments);
                            } else if (selector === '.outPorts') {  //NO I18N
                                attrs = joint.shapes.workfloweditor.Base.prototype.getPortAttrs.apply(this, arguments);
                            }
                            return attrs;
                        }
                    },
                    "branchView": { //NO I18N
                        initialize: function () {
                            joint.shapes.workfloweditor.BranchView.prototype.initialize.apply(this, arguments);
                            this.model.attr('.node-name/text', '', { silent: true });
                        }
                    },
                    "extendBranch": joint.shapes.workfloweditor.Branch, //NO I18N
                    "extendBranchView": joint.shapes.workfloweditor.BranchView  //NO I18N
                },

                "action": { //NO I18N
                    "branch": { //NO I18N
                        markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g><g class="node-icon-cont" /><text class="node-type"/><text class="node-name"/><title class="node-title"/></g><g class="options"></g><g class="option-actions"></g><g class="actions"><image class="btn-edit-node"><title/></image><image class="btn-remove-node"><title/></image></g><g class="inPorts"/><g class="outPorts"/></g>',
                        optionMarkup: '<g class="option"><rect class="option-rect"/><text class="option-text"/><title class="option-title"/></g>',//No I18n
                        defaults: joint.util.deepSupplement({
                            type: 'workfloweditor.action', //No I18n
                            isSingleInputPort: true,
                            inPorts: ["input"],
                            nodeHeaderHeight: 30
                        }, joint.shapes.workfloweditor.Branch.prototype.defaults),
                        initialize: function () {
                            this.attr('.body/fill', '#fae6d7');
                            joint.shapes.workfloweditor.Branch.prototype.initialize.apply(this, arguments);
                        },
                        getPortAttrs: function (portName, index, total, selector, type) {
                            var attrs = {};
                            if (selector === '.inPorts') {
                                attrs = joint.shapes.workfloweditor.Base.prototype.getPortAttrs.apply(this, arguments);
                            } else if (selector === '.outPorts') {  //NO I18N
                                attrs = joint.shapes.workfloweditor.Base.prototype.getPortAttrs.apply(this, arguments);
                            }
                            return attrs;
                        }
                    },
                    "branchView": { //NO I18N
                        initialize: function () {
                            joint.shapes.workfloweditor.BranchView.prototype.initialize.apply(this, arguments);
                            this.model.attr('.node-name/text', '', { silent: true });
                            if (ziaBotWFUtil.wf_type === 'expand') {
                                this.model.markup = '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g><g class="node-icon-cont" /><text class="node-type"/><text class="node-name"/><title class="node-title"/></g><g class="options"></g><g class="option-actions"></g><g class="outPorts"/></g>';
                            }
                            //In-port should not be shown if the action's flow alone is shown for previewing purpose.
                            else if (ziaBotWFUtil.workflow_data.workflow.isActionNotUsedInWorkflow) {
                                this.model.markup = '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g><g class="node-icon-cont" /><text class="node-type"/><text class="node-name"/><title class="node-title"/></g><g class="options"></g><g class="option-actions"></g><g class="actions"><image class="btn-edit-node"><title/></image></g><g class="outPorts"/></g>';
                                this.model.attr('.btn-edit-node/x', 140, { silent: true });
                                this.model.set('isSourceCell', true);   //NO I18N
                            }
                        },
                        renderMarkup: function () {
                            joint.shapes.workfloweditor.BranchView.prototype.renderMarkup.apply(this, arguments);
                            //User is not allowed to delete default actions
                            if (this.model.attributes.is_default) {
                                var modelId = this.model.get("id");
                                var selector = 'g[model-id="' + modelId + '"] .btn-remove-node';//No i18N
                                jQuery(selector).remove();
                                this.model.attr('.btn-edit-node/x', 140, { silent: true });
                            }
                        },
                        removeNode: function (evt) {
                            ziaBotWFUtil.workflow_canvas_operations.removeNodes(this.model, true);
                        },
                        actionUpdate: function ($this, options) {
                            $this.paper.model.trigger('batch:start', { batchName: 'update-action' });//No i18N
                            $this.updateModel(options);
                            $this.model.set('name', options.name); //No i18N
                            $this.model.set('is_default', options.is_default);  //NO I18N
                            if (options.action) {
                                $this.model.set('action', options.action); //No i18N
                            }
                            if (options.options) {
                                $this.model.set('options', options.options);    //NO I18N
                                $this.renderOptions();
                            }
                            if (options.custom_function_id) {
                                $this.model.set('custom_function_id', options.custom_function_id);  //NO I18N
                            }
                            if (options.description) {
                                $this.model.set('description', options.description);    //NO I18N
                            }
                            $this.model.attr('.node-name/text', '');
                            $this.paper.model.trigger('batch:stop', { batchName: 'update-action' });//No i18N
                        }
                    },
                    "extendBranch": joint.shapes.workfloweditor.Branch, //NO I18N
                    "extendBranchView": joint.shapes.workfloweditor.BranchView, //NO I18N
                    "editAction": ziaBotWFUtil.node_operations.action.edit  //NO I18N
                },

                "furtherAssistance": {  //NO I18N
                    "branch": { //NO I18N
                        markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g><g class="node-icon-cont"></g><text class="node-type"/><text class="node-name"/><title class="node-title"/></g><g class="options"></g><g class="option-actions"></g><g class="actions"><image class="btn-edit-node"><title/></image></g><g class="inPorts"/><g class="outPorts"/></g>',
                        optionMarkup: '<g class="option"><rect class="option-rect"/><text class="option-text"/><title class="option-title"/><g class="option-outport"><circle class="port-body"/><text class="port-label"/></g></g>',//No I18n
                        defaults: joint.util.deepSupplement({
                            type: 'workfloweditor.furtherAssistance', //No I18n
                            isSingleInputPort: true,
                            inPorts: ["input"],
                        }, joint.shapes.workfloweditor.Branch.prototype.defaults),
                        initialize: function () {
                            this.attr('.action-rect/width', 0);//No Option actions
                            this.attr('.body/fill', '#e8f8d2');
                            this.attr('.btn-edit-node/x', 140, { silent: true });
                            joint.shapes.workfloweditor.Branch.prototype.initialize.apply(this, arguments);
                        },
                        getPortAttrs: function (portName, index, total, selector, type) {
                            var attrs = {};
                            if (selector === '.inPorts') {
                                attrs = joint.shapes.workfloweditor.Base.prototype.getPortAttrs.apply(this, arguments);
                            }
                            return attrs;
                        }
                    },
                    "branchView": { //NO I18N
                        furtherAssistanceUpdate: function ($this, options) {
                            $this.paper.model.trigger('batch:start', { batchName: 'update-further-assistance' });//No i18N
                            $this.updateModel(options);
                            $this.model.set('name', options.name); //No i18N
                            $this.model.attr('.node-name/text', $this.getText());
                            $this.paper.model.trigger('batch:stop', { batchName: 'update-further-assistance' });//No i18N
                        }
                    },
                    "extendBranch": joint.shapes.workfloweditor.Branch, //NO I18N
                    "extendBranchView": joint.shapes.workfloweditor.BranchView, //NO I18N
                    "editAction": ziaBotWFUtil.node_operations.nodeLabel.edit   //NO I18N
                },
                "feedback": {   //NO I18N
                    "branch": { //NO I18N
                        markup: '<g class="rotatable"><g class="scalable"><rect class="body"/></g><g><g class="node-icon-cont"></g><text class="node-type"/><text class="node-name"/><title class="node-title"/></g><g class="options"></g><g class="option-actions"></g><g class="actions"><image class="btn-edit-node"><title/></image></g><g class="inPorts"/><g class="outPorts"/></g>',
                        optionMarkup: '<g class="option"><rect class="option-rect"/><text class="option-text"/><title class="option-title"/></g>',//No I18n
                        defaults: joint.util.deepSupplement({
                            type: 'workfloweditor.feedback', //No I18n
                            isSingleInputPort: true,
                            isLeafCell: true,
                            inPorts: ["input"],
                        }, joint.shapes.workfloweditor.Branch.prototype.defaults),
                        initialize: function () {
                            this.attr('.action-rect/width', 0);//No Option actions
                            this.attr('.body/fill', '#f8f0d2');
                            this.attr('.btn-edit-node/x', 140, { silent: true });
                            joint.shapes.workfloweditor.Branch.prototype.initialize.apply(this, arguments);
                        },
                        getPortAttrs: function (portName, index, total, selector, type) {
                            var attrs = {};
                            if (selector === '.inPorts') {
                                attrs = joint.shapes.workfloweditor.Base.prototype.getPortAttrs.apply(this, arguments);
                            }
                            return attrs;
                        }
                    },
                    "branchView": { //NO I18N
                        feedbackUpdate: function ($this, options) {
                            $this.paper.model.trigger('batch:start', { batchName: 'update-feedback' });//No i18N
                            $this.updateModel(options);
                            $this.model.set('name', options.name); //No i18N
                            $this.model.attr('.node-name/text', $this.getText());
                            $this.paper.model.trigger('batch:stop', { batchName: 'update-feedback' });//No i18N
                        }
                    },
                    "extendBranch": joint.shapes.workfloweditor.Branch, //NO I18N
                    "extendBranchView": joint.shapes.workfloweditor.BranchView, //NO I18N
                    "editAction": ziaBotWFUtil.node_operations.nodeLabel.edit   //NO I18N
                }
            },
            /**
             * Function to return the workflow modifications to the parent controller (wf-editor/controller.js)
             * @returns - JSON with information about nodes added/updated/removed, button updated and nodes counter
             */
            getModifiedWorkflowJSON: function () {
                return ziaBotWFUtil.workflow_modification_operations.getModifiedJSON();
            },
            /**
             * Function to send the connector added information to workflow modification function
             * @param {object} connector - connector cell object
             */
            addConnector: function (connector) {
                ziaBotWFUtil.workflow_modification_operations.addConnector(connector);
            },
            /**
             * Function to send the connector removed information to workflow modification function
             * @param {object} connector - connector cell object
             */
            removeConnector: function (connector) {
                ziaBotWFUtil.workflow_modification_operations.removeConnector(connector);
            },
            /**
             * Function to update the Node header names with internal_name
             */
            updateNodeTypeName: function () {
                ziaBotWFUtil.workflow_modification_operations.updateNodeTypeName();
            },
            /**
             *  Callback Function to validate the workflow based on the module requirements from WF framework
             */
            preSaveValidation: function (cells) {
                return ziaBotWFUtil.workflow_canvas_operations.validate_workflow(cells);
            },
            /**
             * Callback function to validate the links from WF framework
             */
            validateConnection: function (linkView, source, target, sourceType, targetType, sourcePort, targetPort, sourceMagnetType, targetMagnetType, workflowCanvasObj) {
                return ziaBotWFUtil.workflow_canvas_operations.validate_connection(linkView, source, target, sourceType, targetType, sourcePort, targetPort, sourceMagnetType, targetMagnetType, workflowCanvasObj);
            },
            /**
             * Callback function to check whether the workflow is modified from WF framework (wf-editor/controller.js)
             */
            isGraphModified: function () {
                return ziaBotWFUtil.workflow_modification_operations.isWorkFlowModified();
            },
            revertOperation: function (operation, operation_manager, shouldUndoAgain) {
                return ziaBotWFUtil.workflow_modification_operations.revertOperation(operation, operation_manager, shouldUndoAgain);
            },
            applyOperation: function (operation, operation_manager, shouldRedoAgain) {
                return ziaBotWFUtil.workflow_modification_operations.applyOperation(operation, operation_manager, shouldRedoAgain);
            },
            resetOperation: function () {
                return ziaBotWFUtil.workflow_modification_operations.resetOperation();
            }
        }
    },
    node_operations: {
        button: {
            /**
             * Function to open the Button edit pop-up where the name, command and user-type (All/Requester/Technician) can be updated
             * @param {object} options - To get the button ID
             */
            edit: function (options) {
                var title = translate('common.edit.label', [translate('zcpage.element.button')]); //NO I18N
                if (options && options.wf_model_id) {
                    var wf_get_cell = wf_datas.wf_editor_instance.getCell(options.wf_model_id);
                    var buttonObj = wf_get_cell.get('button');
                    jQuery("#bot-button-name").val(wf_get_cell.get('name'));
                    if (buttonObj.next_node) {
                        if (buttonObj.bot_command) {
                            jQuery("#bot-button-command").val(buttonObj.bot_command.name);
                        }
                        jQuery("#bot-button-usertype").val(buttonObj.usertype);
                        jQuery("#bot-button-command-usertype").removeClass('hide');
                    } else {
                        jQuery("#bot-button-command-usertype").addClass('hide');
                    }
                    ziaBotWFUtil.zwfControllerObj.set("wf_model_id", options.wf_model_id);  //NO I18N
                }
                jQuery('#bot-button-container').dialog({
                    resizable: false,
                    height: 'auto',    //No I18N
                    width: "500px", //NO I18N
                    title: title,
                    modal: true,
                    position: { my: "center top", at: "center top+85", of: window }, //No I18N
                    open: function () {
                        jQuery("body").addClass('pos-rel'); //No I18N
                        jQuery("#wf_append_loader .loading1").remove();
                        setTimeout(function () {
                            jQuery('#bot-button-container').find('select[isSelect2="true"]').select2();
                        }, 10);
                    },
                    close: function () {
                        ziaBotWFUtil.node_operations.button.cancel();
                    }
                });
            },
            save: function () {
                var currentCellId = ziaBotWFUtil.zwfControllerObj.get("wf_model_id");
                if (currentCellId && currentCellId !== "") {
                    var wf_get_cell = wf_datas.wf_editor_instance.getCell(currentCellId);
                    var buttonObj = wf_get_cell.get("button");
                    var oldButtonObj = ziaBotWFUtil.wfControllerObj.getDuplicateJSON(buttonObj);
                    var isButtonEdited = false;
                    var inputObject = { "zia_bot_button": {} }; //NO I18N
                    var buttonNameElement = jQuery("#bot-button-name");
                    var buttonCommandElement = jQuery("#bot-button-command");
                    var buttonName = buttonNameElement.val().trim();
                    var buttonCommand = buttonCommandElement.val().trim();

                    if (buttonName === "") {
                        showalert('failure', translate('common.validation', [translate('common.button.name')]), 'isAutoHide=false');    //NO I18N
                        buttonNameElement.focus();
                        return;
                    }


                    if (buttonObj.next_node) {

                        if (buttonCommand.indexOf('/') != 0) {
                            buttonCommand = '/' + buttonCommand;
                        }
                        if (buttonCommand && buttonCommand != "/") {
                            if (buttonObj.bot_command) {
                                if (buttonObj.bot_command.name != buttonCommand) {
                                    isButtonEdited = true;
                                    inputObject.zia_bot_button.bot_command_id = { "name": buttonCommand, "id": buttonObj.bot_command.id };  //NO I18N
                                    buttonObj.bot_command.name = buttonCommand;
                                }
                            } else {
                                isButtonEdited = true;
                                inputObject.zia_bot_button.bot_command_id = { "name": buttonCommand, "description": "-" };  //NO I18N
                                buttonObj['bot_command'] = { "name": buttonCommand };   //NO I18N
                            }
                        } else if (buttonObj.bot_command) {
                            inputObject.zia_bot_button.bot_command_id = null;
                            isButtonEdited = true;
                            delete buttonObj.bot_command;
                        }
                        var buttonUsertype = jQuery("#bot-button-usertype").val();
                        if (buttonUsertype != buttonObj.usertype) {
                            isButtonEdited = true;
                            inputObject.zia_bot_button.usertype = buttonUsertype;
                            buttonObj.usertype = buttonUsertype;
                        }
                    }
                    if (buttonName != buttonObj.name) {
                        isButtonEdited = true;
                        inputObject.zia_bot_button.name = buttonName;
                        buttonObj.name = buttonName;
                    }

                    if (isButtonEdited) {
                        sdpAjax({
                            url: "/api/v3/zia_bot_buttons/" + buttonObj.id, //NO I18N
                            data: sdpAjaxInputData(inputObject),
                            type: "PUT",    //NO I18N
                            success: function (response) {
                                // Update the id of the botcommand in the buttonObj.
                                if (buttonObj.bot_command) {
                                    buttonObj.bot_command["id"] = response.zia_bot_button.bot_command_id.id;
                                }
                                var wf_cell_data = { "id": currentCellId, "name": buttonName, "type": "workfloweditor.button", "button": buttonObj };   //NO I18N
                                wf_datas.wf_editor_instance.updateNode(joint.shapes.workfloweditor.button, wf_cell_data);
                                ziaBotWFUtil.node_operations.button.cancel();
                                showalert('success', translate('api.updated.success', [translate('zcpage.element.button')]), 'isAutoHide=true');//No i18N

                                if (buttonName != oldButtonObj.name) {
                                    //Change the name of the button in the workflow header select2
                                    var workflowHeaderElement = jQuery('#zia-bot-workflow-header-name');

                                    //Reforming the select2 data.
                                    var buttonList = ziaBotWFUtil.zwfControllerObj.get('button_header_select2');
                                    buttonList = buttonList.map(function (button) {
                                        if (button.id == buttonObj.id) {
                                            button.text = buttonName;
                                        }
                                        return button;
                                    });
                                    //Emptied the existing data and replacing with modified button list.
                                    workflowHeaderElement.empty().select2({
                                        data: buttonList
                                    });
                                    //Selecting the current button
                                    workflowHeaderElement.select2('data', { text: buttonName, id: buttonObj.id });  //No I18N
                                }

                                ziaBotWFUtil.node_operations.button.reset();
                            },
                            error: function (response) {
                                var field = response.responseJSON ? (response.responseJSON.response_status ? (response.responseJSON.response_status.messages ? response.responseJSON.response_status.messages[0].field : '') : '') : '';
                                if (field && field === 'name' || 'bot_command_id') {
                                    fieldKey = field === 'name' ? 'common.button.name' : 'bot.command.name';    //NO I18N
                                    showalert('failure', translate('api.not.unique', [translate(fieldKey)]), 'isAutoHide=false');   //NO I18N
                                }
                                wf_get_cell.set("button", oldButtonObj);  //NO I18N
                            }
                        });
                    } else {
                        showalert('warning', translate("sdp.common.nochangestosave"), 'isAutoHide=true');//No i18N
                        ziaBotWFUtil.node_operations.button.cancel();
                    }

                }
            },
            cancel: function () {
                jQuery("#bot-button-name").val('');
                jQuery("#bot-button-command").val('/');
                jQuery("#bot-button-usertype").val('All');  //NO I18N
                ziaBotWFUtil.zwfControllerObj.set("wf_model_id", "");   //NO I18N
                jQuery("#bot-button-container").dialog('destroy');  //NO I18N
                jQuery("body").removeClass('pos-rel');
            },
            get: function (buttonsToBeExcluded) {
                var zia_bot_buttons = ziaBotWFUtil.zwfControllerObj.get("zia_bot_buttons") || [];
                if (!zia_bot_buttons.length) {
                    zia_bot_default_buttons = [];
                    zia_bot_disabled_buttons = [];
                    var has_more_rows = true;
                    var i = 1;
                    do {
                        var inputObject = {};
                        inputObject.list_info = { "start_index": i, "row_count": "100", "sort_field": "name" }; //NO I18N
                        inputObject.list_info.fields_required = ["name", "id", "next_node", "is_enabled", "is_default"]; //No I18N
                        sdpAjax(
                            {
                                url: '/api/v3/zia_bot_buttons', //NO I18N
                                data: sdpAjaxInputData(inputObject),
                                async: false,
                                success: function (response) {
                                    zia_bot_buttons = zia_bot_buttons.concat(response.zia_bot_buttons);
                                    i += parseInt(response.list_info.row_count);
                                    has_more_rows = response.list_info.has_more_rows;

                                },
                                error: function (response) {
                                    has_more_rows = false;
                                }
                            });
                    } while (has_more_rows);

                    zia_bot_buttons = zia_bot_buttons.filter(function (button) {
                        if (!button.next_node && button.is_default) {
                            zia_bot_default_buttons.push(button.name.toLowerCase());
                            return false;
                        } else if (!button.is_enabled) {
                            zia_bot_disabled_buttons.push(button.name.toLowerCase());
                            return false;
                        } else if (button.next_node) {
                            button.next_node = button.next_node.id;
                        }
                        button.isCollapsed = true;
                        button.text = button.name; // Select2 component requires text attribute to render
                        return true;
                    });
                    ziaBotWFUtil.zwfControllerObj.set("zia_bot_buttons", zia_bot_buttons);  //NO I18N
                    ziaBotWFUtil.zwfControllerObj.set("zia_bot_default_buttons", zia_bot_default_buttons);  //NO I18N
                    ziaBotWFUtil.zwfControllerObj.set("zia_bot_disabled_buttons", zia_bot_disabled_buttons);  //NO I18N
                }
                var zia_bot_default_buttons = ziaBotWFUtil.zwfControllerObj.get("zia_bot_default_buttons");
                var zia_bot_disabled_buttons = ziaBotWFUtil.zwfControllerObj.get("zia_bot_disabled_buttons");

                buttonsToBeExcluded = buttonsToBeExcluded.map(function (button) {
                    return button.id;
                });

                zia_bot_buttons = zia_bot_buttons.filter(function (button) {
                    return buttonsToBeExcluded.indexOf(button.id) == -1;
                });
                return zia_bot_buttons;
            },
            /**
             * Resetting the variable to get the new values since there is a modification in the button
             */
            reset: function () {
                ziaBotWFUtil.zwfControllerObj.set("zia_bot_buttons", []);  //NO I18N
                ziaBotWFUtil.zwfControllerObj.set("zia_bot_default_buttons", []);  //NO I18N
                ziaBotWFUtil.zwfControllerObj.set("zia_bot_disabled_buttons", []);  //NO I18N
            },
            constructNextNodeForButton: function () {
                jQuery('#bot-select-node-container').dialog({
                    resizable: false,
                    height: 'auto',    //No I18N
                    width: "350px", //NO I18N
                    title: translate('sdp.common.menu.createnew'),    //NO I18N
                    modal: true,
                    position: { my: "center top", at: "center top+85", of: window }, //No I18N
                    open: function () {
                        jQuery("body").addClass('pos-rel'); //No I18N
                    },
                    close: function () {
                        ziaBotWFUtil.zwfControllerObj.set("sourceNode", null);    //NO I18N
                        ziaBotWFUtil.node_operations.button.cancelNodeCreation();
                    }
                });
            },
            createSelectedNode: function (nodeType) {
                if (nodeType === 'multiSelectNode') {
                    ziaBotWFUtil.node_operations.multiSelectNode.edit();
                } else if (nodeType === 'action') { //NO I18N
                    ziaBotWFUtil.node_operations.action.edit();
                }
                this.cancelNodeCreation();
            },
            cancelNodeCreation: function () {
                jQuery("body").removeClass('pos-rel'); //No I18N
                jQuery("#bot-select-node-container").dialog('destroy'); //NO I18N
            },

        },
        action: {
            max_action_count: 0,
            initial_action_node_count: 0,
            current_action_node_count: 0,
            edit: function (options) {
                var isActionNotUsedInWorkflow = ziaBotWFUtil.workflow_data.workflow.isActionNotUsedInWorkflow;
                var actionCell, actionCellAttributes;
                if (options && options.wf_model_id) {
                    var wf_get_cell = wf_datas.wf_editor_instance.getCell(options.wf_model_id);
                    jQuery("#wf_action_name").val(wf_get_cell.get('name'));
                    ziaBotWFUtil.zwfControllerObj.set("wf_model_id", options.wf_model_id); //NO I18N
                    actionCell = wf_datas.wf_editor_instance.getCell(options.wf_model_id);
                    actionCellAttributes = actionCell.attributes;
                } else if ((ziaBotWFUtil.node_operations.action.current_action_node_count + 1) > ziaBotWFUtil.node_operations.action.max_action_count) {
                    showalert('failure', translate('zia.bot.max.node.limit', [translate('sdp.admin.workflow.stencil.action'), ziaBotWFUtil.node_operations.action.max_action_count]), 'isAutoHide=false');    //NO I18N
                    jQuery('#wf_fly_paper').remove();
                    return;
                }

                if (isActionNotUsedInWorkflow) {
                    var zia_actions = { "isActionNotUsedInWorkflow": true, "action": { "name": actionCellAttributes.name, "is_default": actionCellAttributes.is_default } };    //NO I18N
                    if (!actionCellAttributes.is_default) {
                        zia_actions.view_types = ziaBotWFUtil.workflow_data.workflow.view_types;
                        zia_actions.view_modules = ziaBotWFUtil.workflow_data.workflow.view_modules;
                        zia_actions.module_parameter = ziaBotWFUtil.workflow_data.workflow.module_parameter;
                        zia_actions.action.custom_function_id = actionCellAttributes.custom_function_id;
                    }
                    ziaBotWFUtil.zwfControllerObj.set("zia_actions", zia_actions);  //NO I18N
                } else {
                    sdpAjax({
                        url: "/api/v3/zia_bot_actions/_getallactions",   //NO I18N
                        type: 'GET',    //NO I18N
                        success: function (resp) {
                            var zia_actions = resp.zia_bot_action.zia_actions;

                            if (actionCell) {
                                if (actionCellAttributes.is_default) {
                                    zia_actions.default_id = actionCell.get('action').id;
                                } else {
                                    zia_actions.custom_function_id = actionCell.get('custom_function_id');
                                }
                            }

                            //If a disabled action has to be edited then the action object must be pushed manually since it will not be available in the list
                            //to render properly in the left panel
                            if (ziaBotWFUtil.workflow_data.workflow.isButtonNotUsedInWorkflow) {
                                if (actionCellAttributes && !actionCellAttributes.is_default) {
                                    var customAction = zia_actions.custom_actions.find(function (c_action) {
                                        if (c_action.custom_function === actionCellAttributes.custom_function_id) {
                                            return true;
                                        }
                                    });
                                    if (!customAction) {
                                        customAction = {
                                            custom_function: actionCellAttributes.custom_function_id,
                                            name: actionCellAttributes.name,
                                            description: actionCellAttributes.description,
                                            id: actionCellAttributes.id,
                                            is_default: false,
                                            view_details: actionCellAttributes.view_details
                                        };
                                        zia_actions.custom_actions.push(customAction);
                                    }
                                }
                            }
                            ziaBotWFUtil.zwfControllerObj.set("zia_actions", zia_actions);  //NO I18N
                        }
                    });
                }
                jQuery('#wf_append_loader').html(ajaxBar());
                //Zia actions popup dialog
                setTimeout(function () {
                    var actionContainer = jQuery("#bot-action-container");
                    actionContainer.dialog({
                        resizable: false,
                        height: 'auto',    //No I18N
                        width: "1100px",    //NO I18N
                        title: translate("zia.bot.action.popup.title"),
                        modal: true,
                        position: { my: "center top", at: "center top+85", of: window }, //No I18N
                        open: function () {
                            jQuery("body").addClass('pos-rel'); //No I18N
                            jQuery("#wf_append_loader .loading1").remove();
                            var zia_actions = ziaBotWFUtil.zwfControllerObj.get("zia_actions");

                            if (zia_actions.view_modules) {
                                //Resetting the view type value of the module
                                actionContainer.find('#viewAsType').select2('val', ''); //NO I18N
                                var viewAsModuleElement = actionContainer.find('#bot-viewAsModule');
                                viewAsModuleElement.select2({
                                    data: zia_actions.view_modules,
                                    selectOnClose: true,
                                    formatNoMatches: function (term) {
                                        return translate("sdp.search.notfound");
                                    },
                                    dropdownCssClass: 's2-hover-ui1' //No I18N
                                });
                                viewAsModuleElement.select2('val', ''); //NO I18N
                            }

                            var accordState = false;
                            if (!isActionNotUsedInWorkflow) {
                                ziaBotWFUtil.node_operations.action.initiateActionSearch();
                                /*
                                    load custom or default action on right panel method for edit operation
                                */
                                if (actionCell) {
                                    if (actionCell.get('is_default')) {
                                        // load default actions right panel
                                        var default_actions = zia_actions.default_actions;
                                        for (var i = 0; i < default_actions.length; i++) {
                                            if (zia_actions.default_id == default_actions[i].id) {
                                                var default_action = { "name": actionCell.get('name'), "description": actionCell.get('description') };  //NO I18N
                                                ziaBotWFUtil.node_operations.action.loadDefaultAction(default_action, i);
                                                break;
                                            }
                                        }
                                    } else {
                                        // load custom actions right panel
                                        var custom_actions = zia_actions.custom_actions;
                                        for (var i = 0; i < custom_actions.length; i++) {
                                            if (zia_actions.custom_function_id == custom_actions[i].custom_function) {
                                                if (!custom_actions[i].view_details) {
                                                    custom_actions[i].view_details = actionCellAttributes.view_details;
                                                }
                                                ziaBotWFUtil.node_operations.action.loadCustomAction(custom_actions[i], i);
                                                break;
                                            }
                                        }
                                    }
                                }
                                //bind onclick event for left panel
                                var actions = jQuery('div#ziaaccordion > div.zwf-act-panel ul > li'); //NO I18N
                                actions.on('click', function () {
                                    var curEle = jQuery($(this));
                                    var actionType = curEle.parent('ul').attr('id');    //NO I18N
                                    var index = curEle.attr('id');
                                    var action;

                                    //Check whether default action / custom action is selected. Based on that render the right panel.
                                    if ('default-action-header' === actionType) {
                                        action = zia_actions.default_actions[index];
                                        ziaBotWFUtil.node_operations.action.loadDefaultAction(action, index);
                                    } else {
                                        action = zia_actions.custom_actions[index];
                                        ziaBotWFUtil.node_operations.action.loadCustomAction(action, index);
                                    }
                                });
                                // The code in the following section will stop expand and collapse when there is no data in custom actions.
                                var accordState = zia_actions.custom_actions.length == 0;
                            } else {
                                var action = {};
                                action.id = actionCellAttributes.id;
                                action.name = actionCellAttributes.name;
                                action.description = actionCellAttributes.description;
                                if (actionCellAttributes.is_default) {
                                    action.is_default = true;
                                    ziaBotWFUtil.node_operations.action.loadDefaultAction(action, 0);
                                } else {
                                    action.is_default = false;
                                    action.custom_function = actionCellAttributes.custom_function_id;
                                    action.view_details = actionCellAttributes.view_details;
                                    ziaBotWFUtil.node_operations.action.loadCustomAction(action, 0);
                                }
                            }

                            initTooltip('#ziaaccordion');   //NO I18N
                            ZComponents.accordion(document.getElementById("ziaaccordion"), { //NO I18N
                                className: "zwf-act-accordion", //NO I18N
                            }).setPanelAttributes("#custom-action-panel", "disabled", accordState); //NO I18N
                        },
                        close: function () {
                            ziaBotWFUtil.node_operations.action.cancel();
                        }
                    });
                }, 500);
            },
            save: function (options) {
                var is_default = options.is_default;
                var action_details = options.action_details;

                var wf_editor = wf_datas.wf_editor_instance;
                var wf_model = wf_editor.getCanvasPaper().model;

                var workflowData = ziaBotWFUtil.workflow_data.workflow;
                var statementDetails = workflowData.statements_details;
                var cells = [], connectors = [], wf_canvas_cells = [];

                var currentCellId = ziaBotWFUtil.zwfControllerObj.get("wf_model_id");
                var isNodeUpdated = false;

                wf_model.trigger("batch:start", { batchName: "save-action-cells" });  //No I18N

                if (is_default) {
                    var actionName = action_details.name;
                    var actionDescription = action_details.description;

                    var currentCell = wf_editor.getCell(currentCellId);

                    var name = currentCell.get('name');
                    var desc = currentCell.get('description');

                    if (actionName !== name || actionDescription !== desc) {
                        isNodeUpdated = true;
                    }

                    if (isNodeUpdated) {
                        var cell = {
                            "id": currentCellId,    //NO I18N
                            "name": actionName,   //NO I18N
                            "description": actionDescription, //NO I18N
                            "options": [    //NO I18N
                                {
                                    "id": "1",  //NO I18N
                                    "name": actionName //NO I18N
                                }
                            ],
                            "type": "workfloweditor.action",    //NO I18N
                            "is_default": true, //NO I18N
                        };
                        wf_editor.updateNode(joint.shapes.workfloweditor.action, cell);
                        ziaBotWFUtil.workflow_modification_operations.updateNode(cell);
                    }

                } else {

                    var custom_function_data = options.cf_details;

                    var custom_function_id = custom_function_data.id;
                    var cf_name = custom_function_data.name;
                    var cf_desc = custom_function_data.description;

                    //In order to maintain the parameter order as given by the user
                    var cf_script = custom_function_data.function_content;
                    var cf_parameters = cf_script.substring(cf_script.indexOf("(") + 1, cf_script.indexOf(")")).trim();
                    var cf_param_details = JSON.parse(custom_function_data.param_details);

                    var view_details = options.action_details.view_details;

                    if (cf_parameters) {
                        cf_parameters = cf_parameters.split(",");

                        //If context is the only parameter then it should not be constructed as user input node.
                        if (cf_parameters.length == 1) {
                            cf_parameters = [];
                        }
                    } else {
                        cf_parameters = [];
                    }

                    var currentCell = currentCellId ? wf_editor.getCell(currentCellId) : "";

                    //Editing an existing action node
                    if (currentCellId && !currentCell.get('is_default') && (currentCell.get('custom_function_id') == custom_function_id)) {

                        var actionCell = currentCell.attributes;

                        var name = currentCell.get('name');
                        var desc = currentCell.get('description');

                        if (cf_name !== name) {
                            actionCell.name = cf_name;
                            actionCell.options[0].name = cf_name;
                            isNodeUpdated = true;
                        }

                        if (cf_desc !== desc) {
                            actionCell.description = cf_desc;
                            isNodeUpdated = true;
                        }

                        var old_view_details = currentCell.get('view_details');

                        if (old_view_details.module !== view_details.module) {
                            actionCell.view_details.module = view_details.module;
                            isNodeUpdated = true;
                        }

                        if (old_view_details.type !== view_details.type) {
                            actionCell.view_details.type = view_details.type;
                            isNodeUpdated = true;
                        }

                        //Have to check whether there are any changes in the parameter

                        var successor_cells = ziaBotWFUtil.workflow_canvas_operations.getSuccessorCells(currentCell);
                        var input_cells = [], output_cell;
                        var cell = currentCell;
                        for (var i = 0; i < successor_cells.length; i++) {
                            var successor_cell = successor_cells[i];
                            if (successor_cell.get('key') == 'userInput') {
                                input_cells.push(successor_cell);
                            } else if (successor_cell.get('key') == 'output') { //NO I18N
                                output_cell = successor_cell;
                                break;
                            }
                        }

                        var newInputCells = [], tempCells = [];

                        //Initializing the paramIndex value as 1 to avoid considering the 'context' param in cf_parameters array
                        //as user input node
                        var paramIndex = 1;
                        while (paramIndex < cf_parameters.length) {
                            var param = cf_parameters[paramIndex].split(" ")[1];
                            if (paramIndex <= input_cells.length) {
                                cell = input_cells[paramIndex - 1];
                                var prompt_message = cf_param_details[param].dataMessage;
                                if (cell.attributes.name != prompt_message) {
                                    isNodeUpdated = true;
                                    var inputCell = cell.attributes;
                                    inputCell.options[0].name = prompt_message;
                                    inputCell.name = prompt_message;
                                    wf_editor.updateNode(joint.shapes.workfloweditor.userInput, inputCell);
                                }
                            } else {
                                if (!tempCells.length) {
                                    tempCells.push(cell.attributes);
                                }
                                cell = {
                                    "name": cf_param_details[param].dataMessage,
                                    "position": { "x": 0, "y": 0 }, //NO I18N
                                    "options": [    //NO I18N
                                        {
                                            "id": "1",  //NO I18N
                                            "name": cf_param_details[param].dataMessage //NO I18N
                                        }
                                    ],
                                    "key": "userInput"  //NO I18N
                                };
                                cell = ziaBotWFUtil.workflow_canvas_operations.processCell(cell);
                                newInputCells.push(cell);
                                tempCells.push(cell.attributes);
                            }
                            paramIndex++;
                        }

                        //Extra input parameters will be removed
                        if (paramIndex <= input_cells.length) {
                            for (var i = paramIndex - 1; i < input_cells.length; i++) {
                                ziaBotWFUtil.workflow_canvas_operations.removeCell(input_cells[i]);
                            }
                            //To establish a connection between the last input cell and output cell
                            tempCells.push(cell.attributes);
                            tempCells.push(output_cell.attributes);

                            isNodeUpdated = true;
                        }


                        //To establish a connection between the last Input cell and the output cell
                        if (newInputCells.length) {
                            isNodeUpdated = true;
                            tempCells.push(output_cell.attributes);

                            //Removing the existing connection with old input and output cell
                            var connected_links = ziaBotWFUtil.workflow_canvas_operations.getConnectedLinks(output_cell);
                            connected_links.forEach(function (link) {
                                if (link.get('target').type == 'output') {
                                    link.remove();
                                }
                            });
                        }

                        if (isNodeUpdated) {
                            wf_editor.updateNode(joint.shapes.workfloweditor.action, actionCell);
                            ziaBotWFUtil.workflow_modification_operations.updateNode(actionCell);
                        }
                        if (tempCells.length) {
                            var connectors = ziaBotWFUtil.workflow_canvas_operations.addConnectors(tempCells);
                            var wf_canvas_cells = newInputCells.concat(connectors);
                            wf_editor.addNodes(wf_canvas_cells);
                            autoAlignWorkflow();
                        }

                    } else {

                        var tempCells = [];
                        var renderTimeout = 0;
                        var isActionNodeAdded = false;

                        //If the previous action is default or different custom function, then remove the existing nodes and then add the new ones
                        if (currentCellId) {
                            isNodeUpdated = true;
                            tempCells = [currentCell.attributes];

                            var cell = {
                                "id": currentCellId,    //NO I18N
                                "name": cf_name,    //NO I18N
                                "type": "workfloweditor.action",    //NO I18N
                                "is_default": false,    //NO I18N
                                "description": cf_desc, //NO I18N
                                "custom_function_id": custom_function_id,   //NO I18N
                                "view_details": view_details,    //NO I18N
                                "options": [    //NO I18N
                                    {
                                        "id": "1",  //NO I18N
                                        "name": cf_name //NO I18N
                                    }
                                ]
                            };
                            wf_editor.updateNode(joint.shapes.workfloweditor.action, cell);
                            ziaBotWFUtil.workflow_modification_operations.updateNode(cell);

                            //Removing the cells
                            var connected_links = ziaBotWFUtil.workflow_canvas_operations.getConnectedLinks(currentCell);
                            var successorCellToBeRemoved;
                            connected_links.forEach(function (link) {
                                if (link.get('source').id == currentCellId) {
                                    successorCellToBeRemoved = wf_editor.getCell(link.get('target').id);    //NO I18N
                                }
                            });
                            ziaBotWFUtil.workflow_canvas_operations.removeSuccessorCells(successorCellToBeRemoved);
                            renderTimeout = 150;

                            //Adding new action node with custom function and its parameters
                        } else {
                            var cell = {
                                "name": cf_name,    //NO I18N
                                "position": { "x": 0, "y": 0 },//NO I18N
                                "options": [    //NO I18N
                                    {
                                        "id": "1",  //NO I18N
                                        "name": cf_name //NO I18N
                                    }
                                ],
                                "key": "action",    //NO I18N
                                "is_default": false,    //NO I18N
                                "description": cf_desc, //NO I18N
                                "custom_function_id": custom_function_id,//NO I18N
                                "view_details": view_details    //NO I18N
                            };

                            var actionNode_count = ziaBotWFUtil.workflow_modification_operations.actionNode_count + 1;
                            cell.internal_name = translate("sdp.admin.workflow.stencil.action") + " " + actionNode_count;  //NO I18N
                            ziaBotWFUtil.workflow_modification_operations.actionNode_count = actionNode_count;
                            isActionNodeAdded = true;

                            var addedCell = ziaBotWFUtil.workflow_canvas_operations.processCell(cell);

                            //Connect with the new button
                            var sourceNode = ziaBotWFUtil.zwfControllerObj.get("sourceNode");
                            if (sourceNode) {
                                var connector_obj = { "source": {}, "target": {} }; //NO I18N
                                connector_obj.source.source_port = "output_" + sourceNode.option.name;  //NO I18N
                                connector_obj.source.source_statement = sourceNode.cell.attributes;
                                connector_obj.target.target_port = "input"; //NO I18N
                                connector_obj.target.target_statement = addedCell.attributes;
                                var connector = ziaBotWFUtil.workflow_canvas_operations.processConnector(connector_obj);
                                connectors.push(connector);
                                ziaBotWFUtil.workflow_modification_operations.addConnector(connector);
                            }
                            ziaBotWFUtil.workflow_modification_operations.addNode(addedCell);
                            cells.push(addedCell);
                        }

                        //Iterating from index 1 to avoid creating the 'context' param as user input node
                        for (var i = 1; i < cf_parameters.length; i++) {
                            var parameter = cf_parameters[i].split(" ")[1];
                            cell = {
                                "name": cf_param_details[parameter].dataMessage,
                                "position": { "x": 0, "y": 0 }, //NO I18N
                                "options": [    //NO I18N
                                    {
                                        "id": "1",  //NO I18N
                                        "name": cf_param_details[parameter].dataMessage //NO I18N
                                    }
                                ],
                                "key": "userInput"  //NO I18N
                            };
                            cells.push(ziaBotWFUtil.workflow_canvas_operations.processCell(cell));
                        }

                        cell = {
                            "name": translate("dre.output"),   //NO I18N
                            "position": { "x": 0, "y": 0 }, //NO I18N
                            "options": [    //NO I18N
                                {
                                    "id": "1",  //NO I18N
                                    "name": translate("zia.bot.success.failure.message") // NO I18N
                                }
                            ],
                            "key": "output" //NO I18N
                        };
                        cells.push(ziaBotWFUtil.workflow_canvas_operations.processCell(cell));

                        cell = {
                            "name": translate("zia.bot.workflow.furtherassistance.label"),   //NO I18N
                            "position": { "x": 0, "y": 0 }, //NO I18N
                            "furtherAssistance": {  //NO I18N
                                "next_node": statementDetails.further_assistance_node_id,   //NO I18N
                                "isCollapsed": true //NO I18N
                            },
                            "key": "furtherAssistanceButton"    //NO I18N
                        };
                        cells.push(ziaBotWFUtil.workflow_canvas_operations.processCell(cell));

                        //Create connection with Output and Further Assistance but not add the cell again

                        cells.forEach(function (c) {
                            tempCells.push(c.attributes);
                        });

                        connectors = connectors.concat(ziaBotWFUtil.workflow_canvas_operations.addConnectors(tempCells));

                        wf_canvas_cells = cells.concat(connectors);

                        setTimeout(function () {
                            wf_editor.addNodes(wf_canvas_cells);
                            if (isActionNodeAdded) {
                                ziaBotWFUtil.workflow_modification_operations.updateNodeTypeName();
                            }
                            autoAlignWorkflow();
                        }, renderTimeout);
                    }

                }

                //Change the name of the action in the Workflow Heaselect2
                if (parseInt(currentCellId) && isNodeUpdated && ziaBotWFUtil.zwfControllerObj.get('wf_type') === 'action') {
                    var select2ActionId = ziaBotWFUtil.zwfControllerObj.get('action_id');
                    var currentCell = wf_editor.getCell(currentCellId);
                    var actionName = currentCell.get('name');
                    var actionId = currentCell.get('action').id;

                    var workflowHeaderElement = jQuery('#zia-bot-workflow-header-name');
                    var actionSelect2Data = ziaBotWFUtil.workflow_data.workflow.options;
                    jQuery.each(actionSelect2Data, function () {
                        if (this.id == actionId) {
                            this.text = actionName;
                        }
                    });
                    workflowHeaderElement.select2('data', actionSelect2Data);   //NO I18N
                    if (actionId == select2ActionId) {
                        jQuery('#s2id_zia-bot-workflow-header-name > a > .select2-chosen').attr('title', actionName);
                    }
                    workflowHeaderElement.select2('val', select2ActionId);  //NO I18N
                }

                jQuery('#wf_fly_paper').remove();
                ziaBotWFUtil.zwfControllerObj.set("wf_model_id", "");   //NO I18N
                jQuery("body").addClass("of-h");
                wf_model.trigger("batch:stop", { batchName: "save-action-cells" });  //No I18N
            },
            cancel: function () {
                jQuery("body").removeClass('pos-rel'); //No I18N
                ziaBotWFUtil.zwfControllerObj.set("wf_model_id", "");   //NO I18N
                ziaBotWFUtil.zwfControllerObj.set("sourceNode", null);   //NO I18N

                //Resetting ui changes
                var actionContainer = jQuery("#bot-action-container");
                //deselect actively selected action in left panel
                actionContainer.find('div#ziaaccordion > div.zwf-act-panel ul > li').removeClass('active');
                //remove default action name and description fields' error span
                actionContainer.find('#dactionname-error,#dactiondescription-error').remove();
                //remove custom action name
                actionContainer.find('#cactionname').val("");
                //hide all the div in right panel
                actionContainer.find('div#zia-actions-right-panel > div > div').addClass('hide');
                //show ziawfnodata div
                actionContainer.find('#ziawfnodata').removeClass('hide');
                //reset the deluge-form div
                actionContainer.find('#deluge-form').html("");
                //remove select2 select element
                actionContainer.find("#action_search").remove();
                //remove select2-container div
                actionContainer.find("#s2id_action_search").remove();

                //Call for dialog destroy
                actionContainer.dialog('destroy');  //NO I18N

                jQuery('#wf_fly_paper').remove();
            },
            loadDefaultAction: function (action, selected_id) {
                jQuery('#ziawfnodata').addClass("hide");
                var botContainer = jQuery('#bot-action-container');
                var rightPanel = botContainer.find('div#zia-actions-right-panel');
                var defaultActions = rightPanel.find('div#defaultactions');

                //Hide custom actions right panel
                rightPanel.find('div#customactions').addClass('hide');

                //Unload already saved data
                var zia_actions = ziaBotWFUtil.zwfControllerObj.get("zia_actions");
                Ember.set(zia_actions, "saved_data", "");   //NO I18N

                //highlight the selected option in left panel

                this.selectActionInLeftPanel("default-action-header", selected_id); //NO I18N

                //Change the pop-up title using the selected item
                botContainer.prev().find('.ui-dialog-title').text(translate("zia.bot.action.popup.select.title", [action.name]));

                //Load right panel with details
                defaultActions.removeClass('hide');

                //Setting focus on the action name
                setTimeout(function () {
                    defaultActions.find('input#dactionname').focus();
                }, 10);


                this.setSelectedAction(action);
            },
            setSelectedAction: function (action) {
                var zia_actions = ziaBotWFUtil.zwfControllerObj.get("zia_actions");
                Ember.setProperties(zia_actions, { "selected_action": action });    //NO I18N
                var viewAsModuleElement = jQuery('#bot-viewAsModule');
                var viewAsTypeElement = jQuery('#viewAsType');

                //Resetting the select2 values
                viewAsModuleElement.select2('val', ''); //NO I18N
                viewAsTypeElement.select2('val', '');   //NO I18N

                var view_details = zia_actions.selected_action.view_details;

                if (view_details) {
                    var selectedActionType = view_details.type;
                    if (selectedActionType === 'text') {
                        viewAsModuleElement.prop('disabled', true).select2({ 'data': '' }); //NO I18N
                    } else {
                        var selectedActionModule = view_details.module;
                        var select2Data;
                        var viewModules = zia_actions.view_modules;
                        for (var i = 0; i < viewModules.length; i++) {
                            var viewModule = viewModules[i];
                            if (viewModule.id === selectedActionModule) {
                                select2Data = viewModule;
                            } else if (viewModule.children) {
                                var viewModuleChildren = viewModule.children;
                                for (var j = 0; j < viewModuleChildren.length; j++) {
                                    viewModule = viewModuleChildren[j];
                                    if (viewModule.id === selectedActionModule) {
                                        select2Data = viewModule;
                                        break;
                                    }
                                }
                            }
                            //To break out of the loop when select2 data is set.
                            if (select2Data) {
                                break;
                            }
                        }
                        setTimeout(function () {
                            var view_modules = ziaBotWFUtil.wfControllerObj.getDuplicateJSON(viewModules);
                            if (selectedActionType === 'summary') {
                                view_modules.forEach(function (module) {
                                    delete module.children;
                                });
                            }
                            viewAsModuleElement.prop('disabled', false).select2({   //NO I18N
                                data: view_modules,
                                selectOnClose: true,
                                dropdownCssClass: 's2-hover-ui1', //NO I18N
                                formatNoMatches: function (term) {
                                    return translate("sdp.search.notfound");
                                }
                            });
                            viewAsModuleElement.select2('data', select2Data);   //NO I18N
                        }, 100);
                    }
                    viewAsTypeElement.select2('val', view_details.type);    //NO I18N

                }

            },
            loadCAadd: function (e) {
                //Whenever new custom action icon is clicked, custom action accordion should not get toggled
                e.stopPropagation();

                jQuery('div#ziaaccordion > div.zwf-act-panel ul > li').removeClass('active'); //NO I18N
                ziaBotWFUtil.node_operations.action.loadCustomAction();
            },
            loadCustomAction: function (action, selected_id) {
                jQuery('#ziawfnodata').addClass("hide");
                var botContainer = jQuery('#bot-action-container');
                var rightPanel = botContainer.find('#zia-actions-right-panel');
                var customActions = rightPanel.find('div#customactions');

                //Hide default actions right panel
                rightPanel.find('div#defaultactions').addClass('hide');

                //Show loading in custom actions right panel
                customActions.find('div#deluge-form').html(ajaxBar());
                customActions.removeClass('hide');

                //Unload already saved data
                var zia_actions = ziaBotWFUtil.zwfControllerObj.get("zia_actions");
                Ember.set(zia_actions, "saved_data", "");   //NO I18N

                if (action) {
                    //highlight the selected option in left panel
                    ziaBotWFUtil.node_operations.action.selectActionInLeftPanel("custom-action-header", selected_id);   //NO I18N
                }


                //Change the pop-up title using the selected item
                var title = action ? (action.name ? action.name : action.custom_function_name) : translate("zia.bot.action.popup.new");
                botContainer.prev().find('.ui-dialog-title').text(translate("zia.bot.action.popup.select.title", [title]));
                ziaBotWFUtil.node_operations.action.setSelectedAction(action ? action : "");

                var self = ziaBotWFUtil.zwfControllerObj;
                var cloneRowsOptions = {
                    "meta_info": {  //NO I18N
                        "dataMessage": {    //NO I18N
                            "type": "input",    //NO I18N
                            "error_messages": { //NO I18N
                                "data_msg_required": translate("dre.clone.field.error.msg") //NO I18N
                            },
                            "maxlength": 250,   //NO I18N
                            "place_holder": translate("zia.bot.cf.prompt.message")  //NO I18N
                        },
                        "type": {   //NO I18N
                            select2: { "data": [{ "id": "string", "text": "string" }, { "id": "int", "text": "int" }, { "id": "float", "text": "float" }], allowClear: true },  //NO I18N
                        }
                    },
                    override_data: function (paramObj, value) {
                        paramObj["dataMessage"] = value.dataMessage;
                        return paramObj;
                    },
                    allow_empty_row_save: true,
                    width: "800",
                    skipRow: ["context"],
                    max_rows: 9
                }
                var dc_options = {
                    "selector": "deluge-form",  //NO I18N
                    "module": "zia",    //NO I18N
                    "function_name": "",    //NO I18N
                    "dc_id": "",    //NO I18N
                    "tab_view": "custom-actions",   //NO I18N
                    "module_obj": "",   //NO I18N
                    "module_name": "zia",  //NO I18N
                    "module_key": { "name": "zia" },    //NO I18N
                    "module_needed": true,  //NO I18N
                    "context_needed": false,    //NO I18N
                    "function_type": "ziaaction",   //NO I18N
                    "save_test_popup": {},  //NO I18N
                    "dc_controller": ziaBotWFUtil.zwfControllerObj, //NO I18N
                    "global_common_fields": true,   //NO I18N
                    "editor_width": 809,    //NO I18N
                    "after_initialize": function () {   //NO I18N
                        var customActions = jQuery('#customactions'), dcForm = jQuery('#dc-form');
                        customActions.find('#return-type').closest('.col-group').css({ 'max-width': '', 'width': '425px' }).removeClass('mr20');    //NO I18N
                        customActions.find('#dc-desc').closest('.col-group').css({ 'max-width': '809px', 'width': '809px' });   //NO I18N
                        jQuery('#caction-footer > div').html('<div class="form-footer p0">' + dcForm.find('div.form-footer').html() + '</div>');
                        dcForm.find('div.form-footer.p0').remove();
                        customActions.find('#delugeEditorCont').css('width', '633px');  //NO I18N
                        //On cancel, previously saved data is checked. If any, it will be passed to builder.
                        jQuery('#dc-cancel').on('click', function () {
                            ziaBotWFUtil.node_operations.action.check_for_action_save();
                        });
                        customActions.find('div.form-footer button').attr('nonce',sdpNonce);   // No I18N
                        $sdEventListener('#customactions');     //NO I18N
                    },
                    "return_type_data": ["Map"],    //NO I18N
                    "is_popup": { "after_save_callback": "custom_action_save_callback", "before_save_callback": "custom_action_before_save" },  //NO I18N
                    "clone_rows": { "options": cloneRowsOptions },  //NO I18N
                    "default_arguments": [{ "name": "context", "type": "Map" }],    //NO I18N
                    "skip_arguments": ["dataMessage"]   //NO I18N
                };
                var type = '';
                var cactionname = rightPanel.find('#cactionname');
                if (action) {
                    if (action.view_details) {
                        // check if view_details is present using custom action used in workflow
                        type = action.view_details.type;
                    } else {
                        // check if view_details is present using DOM for custom actions not used in workflow
                        type = jQuery('#zia-actions-right-panel').find('#viewAsType').val();
                    }
                    dc_options.dc_id = action.custom_function;
                    /*
                        When the custom function is mapped to action already, retain action name
                        since it might be different from custom function name
                    */
                    if (action.name) {
                        cactionname.val(action.name);
                    }
                    else {
                        //Load action name from custom function name
                        cactionname.val(action.custom_function_name);
                    }
                }
                else {
                    cactionname.val("");
                }
                this.infoIconMessage(type);
                deluComp.init(dc_options);
                var dcFuncName = rightPanel.find('#dc-func-name');
                cactionname.on('keyup', function (val) {
                    dcFuncName.val(cactionname.val());
                });
                dcFuncName.on('keyup', function (val) {
                    cactionname.val(dcFuncName.val());
                });
                cactionname.focus();
            },
            selectActionInLeftPanel: function (name, selected_id) {
                //Make the selected_id as active in left panel
                var botContainer = jQuery('#bot-action-container');
                botContainer.find('div#ziaaccordion > div.zwf-act-panel ul > li').removeClass('active'); //NO I18N
                var leftPanelList = botContainer.find('ul#' + name);
                var selectedAction = leftPanelList.find('li#' + selected_id);
                if (selectedAction.length) {
                    selectedAction.addClass('active');
                    setTimeout(function () {
                        ZComponents.accordion(document.getElementById("ziaaccordion")).expandPanel("#" + botContainer.find('div#ziaaccordion > div.zwf-act-panel ul > li.active').parents('div.zaccordionpanel').attr('id')); //NO I18N
                        // The selected action will be shown in the left panel by scrolling to it
                        leftPanelList.scrollTop(selectedAction.get(0).offsetTop - (selectedAction.height() + 5));
                    }, 100);
                }
            },
            initiateActionSearch: function () {
                var zia_actions = ziaBotWFUtil.zwfControllerObj.get("zia_actions");
                var bot_container = jQuery('#bot-action-container');
                var admin_search_row = bot_container.find(".admin-searchrow");//no i18n
                var leftPanelSearch = bot_container.find('input.admin-searchbar');

                var lpSelect2 = jQuery("<select>", {
                    "multiple": true    //NO I18N
                });
                lpSelect2.attr('id', 'action_search');

                var optgroup = jQuery("<optgroup>", {
                    "label": translate("zia.bot.default.actions")   //NO I18N
                });
                zia_actions.default_actions.forEach(function (action, index) {
                    optgroup.append(jQuery("<option>", {
                        value: 'default_actions_' + index,  //NO I18N
                        text: action.name
                    }));
                });
                lpSelect2.append(optgroup);

                optgroup = jQuery("<optgroup>", {
                    "label": translate("zia.bot.custom.actions")    //NO I18N
                });
                zia_actions.custom_actions.forEach(function (action, index) {
                    optgroup.append(jQuery("<option>", {
                        value: 'custom_actions_' + index,   //NO I18N
                        text: action.name ? action.name : action.custom_function_name
                    }));
                });
                lpSelect2.append(optgroup);

                admin_search_row.append(lpSelect2);

                lpSelect2.select2({
                    containerCssClass: "hide",//no i18n
                    formatResult: format
                });

                function format(state) {
                    if (!state.id) {
                        return state.text; // optgroup
                    }
                    return "<a>" + e_html(state.text) + "</a>";
                };

                lpSelect2.on("change", function (e) {
                    if (e.val) {
                        ziaBotWFUtil.node_operations.action.loadSelectedAction(lpSelect2, (e.val));
                        lpSelect2.select2('val', null).trigger('change');   //NO I18N

                        //Reinitialising the select2 after selecting a value.
                        lpSelect2.select2('destroy');   //NO I18N
                        lpSelect2.select2({
                            containerCssClass: "hide",//no i18n
                            formatResult: format
                        });
                        admin_search_row.find(".select2-container").width(admin_search_row.width());
                    }
                });

                lpSelect2.on("select2-close", function (e) {
                    admin_search_row.find(".select2-container").addClass('hide');
                    leftPanelSearch.removeClass('hide');
                    admin_search_row.find(".admin-searchicon").removeClass('hide');

                });

                lpSelect2.on('select2-open', function () {
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

                admin_search_row.find(".select2-container").width(admin_search_row.width());

                leftPanelSearch.focus();

                leftPanelSearch.keydown(function (event) {
                    switch (event.keyCode) {
                        case 17: // CTRL
                        case 18: // ALT
                        case 27: // ESC
                        case 91: // CMD
                            return;
                    }
                    if (event.ctrlKey || event.altKey) {
                        return;
                    }
                    admin_search_row.find(".select2-container").removeClass('hide');//no i18n
                    leftPanelSearch.addClass('hide');
                    lpSelect2.select2('open');  //NO I18N
                });

            },
            loadSelectedAction: function (_self, value) {
                //Resetting the search actions select2 value
                jQuery('#' + _self.id).select2('val', null);

                //Based on selected value, the actions from left panel is loaded
                if (value) {
                    value = '' + value;
                    //value will be "default_actions_x" / "custom_actions_x"
                    var index = value.substr(value.lastIndexOf('_') + 1);
                    if (value.indexOf('default_actions_') > -1) {
                        //Find the corresponding default action and trigger click
                        jQuery('ul#default-action-header').find('li#' + index).trigger('click');
                    }
                    else {
                        //Find the corresponding custom action and trigger click
                        jQuery('ul#custom-action-header').find('li#' + index).trigger('click');
                    }
                }
            },
            save_default_action: function () {
                var options = {}, action_details = {};
                var rightPanel = jQuery('#zia-actions-right-panel');
                var actionNameEle = rightPanel.find('input#dactionname');
                var actionDescEle = rightPanel.find('textarea#dactiondescription');

                var selected_action = ziaBotWFUtil.zwfControllerObj.get("zia_actions").selected_action;
                var actionName = actionNameEle.val();
                if (!actionName || actionName.trim().length == 0) {
                    showalert("failure", translate("common.empty.msg", [translate("common.action.name")]), "isAutoHide=false"); //NO I18N
                    return;
                }
                var actionDescription = actionDescEle.val();
                if (!actionDescription || actionDescription.trim().length == 0) {
                    showalert("failure", translate("common.empty.msg", [translate("common.description")]), "isAutoHide=false"); //NO I18N
                    return;
                }
                options.is_default = true;
                action_details.name = actionName;
                action_details.description = actionDescription;
                action_details.id = selected_action.id;
                options.action_details = action_details;

                this.validateAndSaveAction(options);
            },
            check_for_action_save: function () {
                var zia_actions = ziaBotWFUtil.zwfControllerObj.get("zia_actions");
                var saved_data = zia_actions.saved_data;
                if (saved_data && typeof saved_data == 'object') {
                    this.validateAndSaveAction(saved_data);
                } else { // while clicking cancel when there are no changes made
                    jQuery('#bot-action-container').dialog('close');    //NO I18N
                }
            },
            validateAndSaveAction: function (options) {
                var _self = this;
                var actionButton = _self.getActionButton(options);
                var sourceNode = ziaBotWFUtil.zwfControllerObj.get("sourceNode");
                var message, sameOption;
                if (actionButton && (options.is_default || this.isButtonConnectionAvailable(actionButton, options.cf_details.id))) {
                    if (ziaBotWFUtil.zwfControllerObj.get('wf_type') === 'button' && sourceNode && sourceNode.cell.id.startsWith('button_')) {
                        if (!sourceNode.option || sourceNode.option.id !== actionButton.id) {
                            message = translate('zia.bot.action.button.available', [actionButton.name]);
                        }
                    } else if (sourceNode && sourceNode.option.id != actionButton.id) {
                        sameOption = sourceNode.cell.get('options').find(function (option) {
                            if (option.id === actionButton.id) {
                                return true;
                            }
                        });
                        if (sameOption) {
                            message = translate('zia.bot.action.button.available.samenode', [actionButton.name]);
                        }
                        else {
                            if (!actionButton.isEnabled) {
                                message = translate('zia.bot.action.button.available.disabled', [actionButton.name]);
                            } else {
                                message = translate('zia.bot.action.button.available.replace', [actionButton.name]);
                            }
                        }

                    } else if (!sourceNode) {
                        //New Action Drag Drop flow
                        if (!actionButton.isEnabled) {
                            message = translate('zia.bot.action.button.available.add.disabled', [actionButton.name]);
                        } else {
                            message = translate("zia.bot.action.button.available.add", [actionButton.name]);
                        }

                    }
                }

                if (message) {
                    message = e_html(message);
                    //Comma in the message is split by the showConfirm function since the parameters are split by ','
                    message = message.replace(/,/g, "&#x2c;");
                    showconfirm(true, 'title=' + translate("common.confirm.submit") + ', message=' + message + ', submitbutton=' + translate('common.proceed') + ', cancelbutton=' + translate('zia.bot.create.action') + ', closebutton=yes, closeOnEscKey=yes', function (proceed) { //NO I18N
                        if (proceed) {
                            _self.updateActionButton(sourceNode, sameOption, actionButton);
                        } else {
                            jQuery('#zwf-action-cadd').trigger('click');
                        }
                    });
                } else {
                    ziaBotWFUtil.node_operations.action.save(options);
                    jQuery('#bot-action-container').dialog('close');    //NO I18N
                }
            },
            /**
             * Function to check whether the action-BUTTON is currently modified or not.
             * If modified, then the new button can use the action or else have to make use of the existing button
             * @param {*} button - actionButton
             * @param {*} cfID  - custom function ID of the action
             * @returns
             */
            isButtonConnectionAvailable: function (button, cfID) {
                var cells = wf_datas.wf_editor_instance.getCanvasPaper().model.getElements();
                return cells.every(function (cell) {
                    if (cell.get('key') === 'multiSelectNode') {
                        var options = cell.get('options');
                        return options.every(function (opt) {
                            if (opt.name == button.name) {
                                if (!opt.next_node) {
                                    return false;
                                } else if (opt.old_next_node) {
                                    var nextNodeCell = wf_datas.wf_editor_instance.getCell(opt.next_node)
                                    if (nextNodeCell.attributes.custom_function_id != cfID) {
                                        return false;
                                    }
                                }
                            }
                            return true;
                        });
                    }
                    return true;
                });
            },
            /**
             * Function to update the button in the Options menu when an action which is mapped to that button is selected from the Actions Pop-up
             * @param {*} sourceNode
             * @param {*} sameOption
             * @param {*} actionButton
             */
            updateActionButton: function (sourceNode, sameOption, actionButton) {
                if (!sameOption && !actionButton.isEnabled) {
                    var entityURL = "/api/v3/zia_bot_buttons/" + actionButton.id + "/_modify"; // No I18N
                    var inputData = sdpAjaxInputData({ "zia_bot_button": { "is_enabled": true } });	// No I18N
                    sdpAjax({
                        url: entityURL,
                        type: 'PUT', // No I18N
                        async: false,
                        data: inputData,
                        error: function (response) {
                            showalert('failure', e_html(response.responseJSON.response_status.messages[0].message), "isAutoHide=false");// No I18N
                        }
                    });
                }
                if (!(ziaBotWFUtil.zwfControllerObj.get('wf_type') === 'button' && sourceNode.cell.id.startsWith('button_'))) {
                    jQuery('#bot-action-container').dialog('close');    //NO I18N
                    if (sourceNode) {
                        var new_options = [];

                        //Remove the newly added button if it is going to be replaced due to the action selected
                        if (ziaBotWFUtil.zwfControllerObj.newly_added_buttons) {
                            var newButtonIndex = ziaBotWFUtil.zwfControllerObj.newly_added_buttons.indexOf(sourceNode.option.name.toLowerCase());
                            if (newButtonIndex !== -1) {
                                delete ziaBotWFUtil.zwfControllerObj.newly_added_buttons[newButtonIndex];
                            }
                        }

                        sourceNode.cell.get('options').find(function (option) {
                            if (option.id !== sourceNode.option.id) {
                                new_options.push(option);

                                //Replacing the new button with the already available button
                            } else if (!sameOption) {
                                new_options.push(actionButton);

                            }
                        });
                        if (sourceNode.is_edit) {
                            ziaBotWFUtil.workflow_canvas_operations.deleteTargetCells([encodeURIComponent(sourceNode.option.name)], sourceNode.cell.id);
                        }
                        var sourceCell = sourceNode.cell.attributes;
                        var cell_data = {
                            "id": sourceCell.id,    //NO I18N
                            "name": sourceCell.name,    //NO I18N
                            "position": sourceCell.position,    //NO I18N
                            "options": new_options, //NO I18N
                            "type": "workfloweditor.multiSelectNode",   //NO I18N
                            "key": "multiSelectNode"    //NO I18N
                        };
                        wf_datas.wf_editor_instance.updateNode(joint.shapes.workfloweditor.multiSelectNode, cell_data);
                    }
                }
            },
            getActionButton: function (options) {
                var currentCellId = ziaBotWFUtil.zwfControllerObj.get("wf_model_id");
                var actionButtonResponse;
                var isActionButtonRequired = false;
                var wf_editor = wf_datas.wf_editor_instance;
                var currentCell = wf_editor.getCell(currentCellId);
                // Only in the add flow of Action node, the button verification has to be done
                if (!currentCellId) {
                    isActionButtonRequired = true;

                } else if (!currentCell.get('is_default') && (!options.cf_details || currentCell.get('custom_function_id') != options.cf_details.id)) {
                    isActionButtonRequired = true;
                    var connector = ziaBotWFUtil.workflow_canvas_operations.getConnectedLinks(currentCell).find(function (c) {
                        if (c.get('target').id == ziaBotWFUtil.zwfControllerObj.get('wf_model_id')) {
                            return true;
                        }
                    });
                    if (connector) {
                        var sourceConnector = connector.get('source');
                        var sourceCell = wf_editor.getCell(sourceConnector.id);
                        var button = sourceCell.get('options').find(function (b) {
                            if (b.name === decodeURIComponent(sourceConnector.port.slice('output_'.length))) {
                                return true;
                            }
                        });
                        var sourceNode = { "cell": sourceCell, "option": button, "is_edit": true }; //NO I18N
                        ziaBotWFUtil.zwfControllerObj.set("sourceNode", sourceNode);    //NO I18N
                    }
                }
                if (isActionButtonRequired) {
                    var inputObject = {};
                    inputObject.isDefault = options.is_default;
                    if (options.action_details.id) {
                        inputObject.id = options.action_details.id;
                    } else {
                        inputObject.customFunctionId = options.cf_details.id;
                    }
                    sdpAjax(
                        {
                            url: '/api/v3/zia_bot_workflows/_get_action_button', //NO I18N
                            data: sdpAjaxInputData(inputObject),
                            async: false,
                            success: function (response) {
                                actionButtonResponse = response.workflow_button;
                            }
                        }
                    );
                }
                return actionButtonResponse;
            },
            changeViewAsModuleList: function (typeSelect2) {
                var type = typeSelect2.value;
                /*info icon update*/
                this.infoIconMessage(type);
                var viewAsModuleElement = jQuery('#bot-viewAsModule');
                if (type === 'text') {
                    viewAsModuleElement.prop('disabled', true).select2({ data: '' });  //NO I18N
                } else {
                    var zia_actions = ziaBotWFUtil.zwfControllerObj.get('zia_actions');
                    var view_modules = zia_actions.view_modules;

                    if (type === 'summary') {
                        view_modules = ziaBotWFUtil.wfControllerObj.getDuplicateJSON(zia_actions.view_modules);
                        view_modules.forEach(function (module) {
                            delete module.children;
                        });
                    }
                    viewAsModuleElement.prop('disabled', false).select2({   //NO I18N
                        data: view_modules,
                        selectOnClose: true,
                        dropdownCssClass: 's2-hover-ui1', //NO I18N
                        formatNoMatches: function (term) {
                            return translate("sdp.search.notfound");
                        }
                    });
                }


            },
            validateModuleParameterInCF: function (module, customFunctionElement) {
                var zia_actions = ziaBotWFUtil.zwfControllerObj.get("zia_actions");
                var parameter = zia_actions.module_parameter[module];
                var parameterElements = customFunctionElement.find('#dc-clone-rows').find('input[data-name=name]');
                var isSubEntityParameterAvailable = false;
                jQuery(parameterElements).each(function () {
                    var parameterValue = this.value.trim();
                    if (parameterValue === parameter) {
                        isSubEntityParameterAvailable = true;
                    }
                });
                if (!isSubEntityParameterAvailable) {
                    showalert("failure", translate("zia.bot.cf.param", [parameter]), "isAutoHide=false");    //NO I18N
                    return false;
                }
                return true;
            },
            infoIconMessage: function (type) {
                jQuery('#viewas-info-div').removeClass('hide');
                var msgDiv = jQuery('#viewas-info-div > .msg');
                if (type === 'text') {
                    jQuery('#viewas-info-div > .msg').html(translate("zia.bot.message.view.info"));
                } else if (type !== '') {
                    var info = translate("zia.bot.others.view.info");
                    if (type == 'count') {
                        info += ' ' + translate("zia.bot.workflow.count.response");
                    }
                    msgDiv.html(info);
                }
                else {
                    // when you can not get view_details from DOM or custom action, hide it
                    jQuery('#viewas-info-div').addClass('hide');
                }
            },
            custom_action_save_callback: function (data, triggeredButton) {
                var action = ziaBotWFUtil.zwfControllerObj.get("zia_actions").selected_action;
                var options = {}, action_details = {}, cf_details = {};

                options.is_default = false;
                var rightPanel = jQuery('#zia-actions-right-panel');
                action_details.name = rightPanel.find('#cactionname').val();
                action_details.view_details = {};
                action_details.view_details.module = rightPanel.find('#bot-viewAsModule').val();
                action_details.view_details.type = rightPanel.find('#viewAsType').val();
                action_details.description = data.description;
                if (action && action.id) {
                    action_details.id = action.id;
                }
                cf_details.id = data.id;
                cf_details.param_details = data.param_details;
                options.action_details = action_details;
                options.cf_details = data;
                Ember.setProperties(ziaBotWFUtil.zwfControllerObj.get("zia_actions"), { "saved_data": options });   //NO I18N

                //Validate and Save the action details if 'save' button is clicked
                if (triggeredButton === "save") {
                    this.validateAndSaveAction(options);
                }
            },
            custom_action_before_save: function () {
                var custom = jQuery('#customactions');
                var value = custom.find('#cactionname').val();
                if (!value || value.trim().length == 0) {
                    showalert("failure", translate("common.empty.msg", [translate("common.action.name")]), "isAutoHide=false"); //NO I18N
                    return false;
                }
                var viewAsType = custom.find('#viewAsType').val();
                if (!viewAsType || viewAsType.trim().length == 0) {
                    showalert("failure", translate("common.empty.msg", [translate("zia.bot.action.popup.viewas.type")]), "isAutoHide=false");   //NO I18N
                    return false;
                }

                //View as module will not be listed for 'text' type
                if (viewAsType !== 'text') {
                    var viewAsModule = custom.find('#bot-viewAsModule').val();
                    if (!viewAsModule || viewAsModule.trim().length == 0) {
                        showalert("failure", translate("common.empty.msg", [translate("zia.bot.action.popup.viewas.module")]), "isAutoHide=false"); //NO I18N
                        return false;
                        //To Identify whether the view as module is a sub-entity using the hyphen (module separator)
                    } else if (viewAsModule.includes('-')) {
                        var module = viewAsModule.slice(0, viewAsModule.indexOf('-'));
                        if (!this.validateModuleParameterInCF(module, custom)) {
                            return false;
                        }
                    } else if (viewAsType == 'summary') {   //NO I18N
                        if (!this.validateModuleParameterInCF(viewAsModule, custom)) {
                            return false;
                        }
                    }
                }
                return true;
            }
        },
        multiSelectNode: {
            max_option_count: 0,

            initial_button_count: 0,
            max_button_count: 0,

            initial_options_menu_node_count: 0,
            current_options_menu_node_count: 0,
            max_options_menu_count: 0,

            edit: function (options) {
                var _self = ziaBotWFUtil.node_operations.multiSelectNode;
                var title = translate('common.edit.label', [translate('zia.bot.workflow.options.menu')]); //NO I18N
                var buttons = [];
                var isButtonSectionToBeShown = true;
                if (options && options.wf_model_id) {
                    var wf_get_cell = wf_datas.wf_editor_instance.getCell(options.wf_model_id);

                    var can_delete_node = wf_get_cell.get('can_delete_node');
                    if (typeof can_delete_node !== 'undefined' && !can_delete_node) {
                        isButtonSectionToBeShown = false;
                    }

                    jQuery("#wf_buttons_title").val(wf_get_cell.get('name'));
                    wf_get_cell.get('options').forEach(function (option) {
                        buttons.push(option);
                    });
                    ziaBotWFUtil.zwfControllerObj.set("wf_model_id", options.wf_model_id);  //NO I18N
                } else if ((ziaBotWFUtil.node_operations.multiSelectNode.current_options_menu_node_count + 1) > ziaBotWFUtil.node_operations.multiSelectNode.max_options_menu_count) {
                    showalert('failure', translate('zia.bot.max.node.limit', [translate('zia.bot.workflow.options.menu'), ziaBotWFUtil.node_operations.multiSelectNode.max_options_menu_count]), 'isAutoHide=false');    //NO I18N
                    jQuery('#wf_fly_paper').remove();
                    return;
                } else {
                    title = translate('common.add.label', [translate('zia.bot.workflow.options.menu')]);;  //NO I18N
                }

                /** The buttons section will not be shown for Default Option Menu nodes */
                ziaBotWFUtil.zwfControllerObj.set('isButtonSectionToBeShown', isButtonSectionToBeShown);    //NO I18N

                var multivalue = {
                    "wf_removed_values": [],    //NO I18N
                    "wf_selected_values": buttons,  //NO I18N
                };
                multivalue.wf_values_datas = ziaBotWFUtil.node_operations.button.get(buttons);
                ziaBotWFUtil.zwfControllerObj.set("multivalue", multivalue);    //NO I18N

                jQuery("#wf_append_loader").html(ajaxBar());
                jQuery('#bot-buttons-node-container').dialog({
                    resizable: false,
                    height: 'auto',    //No I18N
                    width: "500px", //NO I18N
                    title: title,
                    modal: true,
                    position: { my: "center top", at: "center top+85", of: window }, //No I18N
                    open: function () {
                        jQuery("body").addClass('pos-rel'); //No I18N
                        jQuery("#wf_append_loader .loading1").remove();
                        if (isButtonSectionToBeShown) {
                            setTimeout(function () {
                                var button_select2 = jQuery('#bot-buttons-select');
                                button_select2.select2('destroy');  //NO I18N
                                button_select2.val('');
                                button_select2.on("change", function (evt) {
                                    _self.wf_onchange_value(this);
                                });
                                button_select2.select2({
                                    placeholder: translate("zia.bot.selecttwo.placeholder"),
                                    createSearchChoice: _self.createSearchChoice,
                                    tags: multivalue.wf_values_datas,
                                    dropdownCssClass: "tags-dd",    //NO I18N
                                    selectOnClose: true
                                });
                                _self.wf_init_sortable();
                            }, 10);
                        }
                    },
                    close: function () {
                        jQuery('#bot-buttons-select').off("change");    //NO I18N
                        ziaBotWFUtil.node_operations.multiSelectNode.cancel();
                    }
                });
            },
            save: function () {
                var wf_get_multivalue = ziaBotWFUtil.zwfControllerObj.get("multivalue");
                var wf_get_selected_values = wf_get_multivalue.wf_selected_values;
                var optionsMenuTitle = jQuery("#wf_buttons_title");
                var optionsMenuTitleValue = optionsMenuTitle.val();
                if (optionsMenuTitleValue.trim() === "") {
                    showalert('failure', translate('sdp.common.titleerrormessage'), 'isAutoHide=false');    //NO I18N
                    optionsMenuTitle.focus();
                    return;
                } else if (!wf_get_selected_values.length) {
                    showalert('failure', translate('sdp.common.error.empty', [translate('common.buttons')]), 'isAutoHide=false');   //NO I18N
                    return;
                }
                var wf_removed_values = wf_get_multivalue.wf_removed_values;
                var wf_editor = wf_datas.wf_editor_instance;
                var wf_model = wf_editor.getCanvasPaper().model;
                var x_position = wf_datas.x_position ? parseInt(wf_datas.x_position) : 0;
                var y_position = wf_datas.y_position ? parseInt(wf_datas.y_position) : 0;
                var wf_cell_data = {
                    "name": optionsMenuTitleValue,  //NO I18N
                    "position": { "x": x_position, "y": y_position }, //NO I18N
                    "options": wf_get_selected_values,  //NO I18N
                    "type": "workfloweditor.multiSelectNode",   //NO I18N
                    "key": "multiSelectNode"    //NO I18N
                };
                wf_model.trigger("batch:start", { batchName: "add-multiSelectNode-cells" });  //No I18N

                var currentCellId = ziaBotWFUtil.zwfControllerObj.get("wf_model_id");
                if (currentCellId && currentCellId !== "") {
                    wf_cell_data.id = currentCellId;
                    if (wf_removed_values.length) {
                        ziaBotWFUtil.workflow_canvas_operations.deleteTargetCells(wf_removed_values, wf_cell_data.id);
                    }
                    wf_editor.updateNode(joint.shapes.workfloweditor.multiSelectNode, wf_cell_data);
                    ziaBotWFUtil.workflow_modification_operations.updateNode(wf_cell_data);
                } else {
                    var wf_canvas_cells = [];

                    var multiSelectNode_count = ziaBotWFUtil.workflow_modification_operations.multiSelectNode_count + 1;
                    wf_cell_data.internal_name = translate("zia.bot.workflow.options.menu") + " " + multiSelectNode_count;   //NO I18N
                    ziaBotWFUtil.workflow_modification_operations.multiSelectNode_count = multiSelectNode_count;

                    var addedCell = ziaBotWFUtil.workflow_canvas_operations.processCell(wf_cell_data);
                    wf_canvas_cells.push(addedCell);
                    ziaBotWFUtil.workflow_modification_operations.addNode(addedCell);

                    //Connect with the new button while adding a new node
                    var sourceNode = ziaBotWFUtil.zwfControllerObj.get("sourceNode");
                    if (sourceNode) {
                        var connector_obj = { "source": {}, "target": {} }; //NO I18N
                        var source_port = "output"; //NO I18N
                        if (sourceNode.option) {
                            source_port = "output_" + sourceNode.option.name;   //NO I18N
                        }
                        connector_obj.source.source_port = source_port;
                        connector_obj.source.source_statement = sourceNode.cell.attributes;
                        connector_obj.target.target_port = "input"; //NO I18N
                        connector_obj.target.target_statement = addedCell.attributes;
                        var connector = ziaBotWFUtil.workflow_canvas_operations.processConnector(connector_obj);
                        ziaBotWFUtil.workflow_modification_operations.addConnector(connector);
                        wf_canvas_cells.push(connector);

                        wf_editor.addNodes(wf_canvas_cells);
                        ziaBotWFUtil.workflow_modification_operations.updateNodeTypeName();
                        autoAlignWorkflow();

                        ziaBotWFUtil.zwfControllerObj.set("sourceNode", null);    //NO I18N
                    } else {
                        wf_editor.addNodes(wf_canvas_cells);
                        ziaBotWFUtil.workflow_modification_operations.updateNodeTypeName();
                    }
                }
                wf_model.trigger("batch:stop", { batchName: "add-multiSelectNode-cells" });  //No I18N

                jQuery("body").removeClass('pos-rel'); //No I18N
                Ember.set(wf_get_multivalue, "wf_selected_values", null);   //NO I18N
                ziaBotWFUtil.zwfControllerObj.set("wf_model_id", "");   //NO I18N
                jQuery("#wf_buttons_title").val("");
                jQuery('#bot-buttons-select').off("change");    //NO I18N
                jQuery("#bot-buttons-node-container").dialog('destroy');    //NO I18N
                jQuery('#wf_fly_paper').remove();
            },
            cancel: function () {
                var cellId = ziaBotWFUtil.zwfControllerObj.get('wf_model_id');
                // The existing_options array will maintain the saved options of the 'Options Menu' node
                var existing_options = [];
                if (cellId) {
                    existing_options = wf_datas.wf_editor_instance.getCell(cellId).get('options').map(function (opt) {  //NO I18N
                        return opt.name;
                    });
                }

                var wf_get_multivalue = ziaBotWFUtil.zwfControllerObj.get("multivalue");
                jQuery("body").removeClass('pos-rel'); //No I18N
                if (ziaBotWFUtil.zwfControllerObj.newly_added_buttons) {
                    wf_get_multivalue.wf_selected_values.forEach(function (selected_value) {
                        //Only the buttons which are currently added in the edit pop-up are validated.
                        if (!existing_options.length || !existing_options.includes(selected_value.text)) {
                            var selectedValueIndex = ziaBotWFUtil.zwfControllerObj.newly_added_buttons.indexOf(selected_value.text);
                            if (selectedValueIndex !== -1) {
                                delete ziaBotWFUtil.zwfControllerObj.newly_added_buttons[selectedValueIndex];
                            }
                        }
                    });
                }
                Ember.set(wf_get_multivalue, "wf_selected_values", null);   //NO I18N
                Ember.set(wf_get_multivalue, "wf_removed_values", null);    //NO I18N
                ziaBotWFUtil.zwfControllerObj.set("wf_model_id", "");   //NO I18N
                jQuery("#wf_buttons_title").val("");
                jQuery("#bot-buttons-node-container").dialog('destroy');    //NO I18N
                jQuery('#wf_fly_paper').remove();
            },
            remove_selected_value: function (wf_value_id) {
                var isButtonCanBeRemoved = true;
                var optionsMenuNode = wf_datas.wf_editor_instance.getCell(ziaBotWFUtil.zwfControllerObj.wf_model_id);
                //If the button's next node or new node is mapped then we should not delete the button because
                //removing the button and saving the workflow will not record these details.
                if (optionsMenuNode) {
                    isButtonCanBeRemoved = optionsMenuNode.attributes.options.every(function (option) {
                        if (parseInt(wf_value_id) && option.id == wf_value_id) {
                            if (!option.next_node || (option.old_next_node && option.old_next_node !== option.next_node)) {
                                return false;
                            }
                        }
                        return true;
                    });
                }
                if (!isButtonCanBeRemoved) {
                    showalert("failure", translate("zia.bot.button.remove.error"), 'isAutoHide=false'); //NO I18N
                } else {
                    var wf_get_multivalue = ziaBotWFUtil.zwfControllerObj.get("multivalue");
                    var wf_new_selected_values = [];
                    var wf_new_value_datas = wf_get_multivalue.wf_values_datas;
                    var removed_value_names = wf_get_multivalue.wf_removed_values;
                    jQuery.map(wf_get_multivalue.wf_selected_values, function (value, i) {
                        if (wf_value_id !== value.id) {
                            wf_new_selected_values.push(value);
                        } else {
                            value.text = value.name;    // Select2 component requires text attribute to render
                            if (parseInt(value.id)) {
                                wf_new_value_datas.push(value);
                            }
                            removed_value_names.push(encodeURIComponent(value.name));
                            var newly_added_buttons = ziaBotWFUtil.zwfControllerObj.newly_added_buttons;
                            if (newly_added_buttons) {
                                newly_added_buttons = newly_added_buttons.filter(function (e) {
                                    return e !== value.name.toLowerCase();
                                });
                                ziaBotWFUtil.zwfControllerObj.set('newly_added_buttons', newly_added_buttons);  //NO I18N
                                if (newly_added_buttons.length === 0) {
                                    ziaBotWFUtil.zwfControllerObj.newly_added_buttons = [];
                                }
                            }
                        }
                    });
                    wf_new_value_datas = wf_new_value_datas.filter(function (item) {
                        if (item.id != "-1") {
                            return item;
                        }
                    });
                    Ember.setProperties(wf_get_multivalue, { "wf_selected_values": ziaBotWFUtil.wfControllerObj.getDuplicateJSON(wf_new_selected_values), "wf_values_datas": ziaBotWFUtil.wfControllerObj.arraySort(ziaBotWFUtil.wfControllerObj.getDuplicateJSON(wf_new_value_datas)), "wf_removed_values": removed_value_names });    //NO I18N
                }
            },
            wf_init_sortable: function () {
                var wf_get_multivalue = ziaBotWFUtil.zwfControllerObj.get("multivalue");
                var wf_new_selected_values = [];
                jQuery('#wf_button_values').sortable({
                    placeholder: "ui-state-highlight",  //NO I18N
                    handle: '.ctl i',   //NO I18N
                    start: function (e, ui) {
                        ui.placeholder.height(ui.item.height());
                    },
                    update: function (e, ui) {
                        jQuery.each(jQuery("#wf_button_values li"), function () {   //NO I18N
                            var wf_get_value_id = jQuery(this).find("[data-id=wf_value_id]").text();
                            jQuery.map(wf_get_multivalue.wf_selected_values, function (value, i) {
                                if (value.id === wf_get_value_id) {
                                    wf_new_selected_values.push(value);
                                }
                            });
                        });
                        Ember.set(wf_get_multivalue, "wf_selected_values", wf_new_selected_values); //NO I18N
                        wf_new_selected_values = [];
                    }
                });
            },
            wf_onchange_value: function (element) {
                var select2_element = jQuery(element);
                var select2Data = select2_element.select2('data')[0];
                var buttonExists = false;
                if (select2Data) {
                    var selectedValue = select2Data.text.trim();
                    var wf_get_multivalue = ziaBotWFUtil.zwfControllerObj.get("multivalue");

                    var selected_values = wf_get_multivalue.wf_selected_values;
                    if (selectedValue === '') {
                        showalert("failure", translate("common.validation", [translate("zcpage.element.button")]), "isAutoHide=false");//No i18N
                    } else if (selectedValue.length > 100) {
                        showalert("failure", translate("common.maxlength", [translate("zcpage.element.button"), "100"]), "isAutoHide=false");//No i18N
                    } else if (ziaBotWFUtil.zwfControllerObj.zia_bot_default_buttons.includes(selectedValue.toLowerCase())) {
                        showalert("failure", translate("zia.bot.button.default.msg"), "isAutoHide=false");//No i18N
                    } else if (ziaBotWFUtil.zwfControllerObj.zia_bot_disabled_buttons.includes(selectedValue.toLowerCase())) {
                        showalert("failure", translate("zia.bot.button.disabled.msg"), "isAutoHide=false");//No i18N
                    } else if (selected_values.length >= ziaBotWFUtil.node_operations.multiSelectNode.max_option_count) {
                        showalert("failure", translate("common.limit.message", [ziaBotWFUtil.node_operations.multiSelectNode.max_option_count]), "isAutoHide=false");//No i18N
                    } else {
                        var newly_added_buttons = ziaBotWFUtil.zwfControllerObj.newly_added_buttons;

                        var saved_buttons = ziaBotWFUtil.zwfControllerObj.zia_bot_buttons;
                        var savedButton = saved_buttons.find(function (b) {
                            return b.text == selectedValue;
                        });
                        if (!savedButton && newly_added_buttons &&
                            (newly_added_buttons.filter(function (n) { return n; }).length + this.initial_button_count + 1) > this.max_button_count) {
                            showalert('failure', translate('zia.bot.max.button.limit', [this.max_button_count]), "isAutoHide=false")    //NO I18N
                        } else {
                            var msg = translate("zia.bot.button.exists");
                            for (var i = 0; i < selected_values.length; i++) {
                                if (selectedValue.toLowerCase() === selected_values[i].name.toLowerCase()) {
                                    buttonExists = true;
                                    break;
                                }
                            }
                            /*to check for looping of buttons in client*/
                            var sourceNode = ziaBotWFUtil.zwfControllerObj.sourceNode;
                            if (sourceNode && sourceNode.option && sourceNode.option.name === selectedValue) {
                                buttonExists = true;
                            }

                            // do not allow entering an unsaved button
                            if (newly_added_buttons && newly_added_buttons.indexOf(selectedValue.toLowerCase()) !== -1) {
                                msg = translate("zia.bot.button.new.exists");
                                buttonExists = true;
                            }
                            //If the id starts with 'button_' then its a newly added one to identify in the server side.
                            var option = { "name": selectedValue, "text": selectedValue, "id": "button_" + joint.util.uuid(), "isCollapsed": true };    //NO I18N
                            var wf_new_values = wf_get_multivalue.wf_values_datas.filter(function (item) {
                                if (item.text === selectedValue) {
                                    option = item;
                                } else {
                                    return true;
                                }
                            });

                            if (wf_new_values.length === 0) {
                                wf_new_values.push({ 'id': '-1', 'name': translate("common.no.match.found") });
                            }


                            if (buttonExists) {
                                option.id = "-1";
                                showalert("failure", msg, "isAutoHide=false");//No i18N
                            }
                            if (option.id !== "-1") {
                                (wf_get_multivalue.wf_selected_values) ? wf_get_multivalue.wf_selected_values.push(option) : "";
                                Ember.set(wf_get_multivalue, "wf_selected_values", ziaBotWFUtil.wfControllerObj.getDuplicateJSON(wf_get_multivalue.wf_selected_values) || [object]);
                                //if it is a valid button, insert it into the newly_added_buttons if it is not an already saved button in the builder
                                if (!savedButton) {
                                    if (!newly_added_buttons) {
                                        ziaBotWFUtil.zwfControllerObj.set('newly_added_buttons', [selectedValue.toLowerCase()]);
                                    } else {
                                        if (newly_added_buttons.indexOf(selectedValue.toLowerCase()) === -1) {
                                            newly_added_buttons.push(selectedValue.toLowerCase());
                                            ziaBotWFUtil.zwfControllerObj.set('newly_added_buttons', newly_added_buttons);  //NO I18N
                                        }
                                    }
                                }

                            }
                            Ember.set(wf_get_multivalue, "wf_values_datas", ziaBotWFUtil.wfControllerObj.arraySort(wf_new_values)); //NO I18N
                        }
                    }
                    select2_element.val('');
                }
                //Once the newly added option is added the div will be scrolled to bottom
                setTimeout(function () {
                    select2_element.select2({
                        tags: wf_get_multivalue.wf_values_datas
                    });
                    var selectedOptionsDiv = jQuery("#wf_button_values");
                    selectedOptionsDiv.scrollTop(selectedOptionsDiv.height());
                }, 10);

            },
            /**
             * Function to insert the tag value in the select2 where if the exact search term is already present, it need to be tagged/inserted
             *
             * @param {*} term - Search text
             * @param {*} data - The whole select2 data
             * @returns
             */
            createSearchChoice: function (term, data) {
                var canTag = !data || !(data.some(function (item) {
                    return item.text.toLowerCase() === term.toLowerCase()
                }));
                if (canTag) {
                    return { id: term, text: term };
                } else {
                    return null;
                }

            }
        },
        nodeLabel: {
            edit: function (options) {
                var title;
                if (options && options.wf_model_id) {
                    var wf_get_cell = wf_datas.wf_editor_instance.getCell(options.wf_model_id);
                    jQuery("#field-label-box").val(wf_get_cell.get('name'));
                    var nodeType = wf_get_cell.get("key");
                    if (nodeType === 'feedback') {
                        title = translate('sdp.feedback.title');
                    } else if (nodeType === 'furtherAssistance') {  //NO I18N
                        title = translate('zia.bot.workflow.furtherassistance.label');
                    }
                    title = translate('common.edit.label', [title]);
                    ziaBotWFUtil.zwfControllerObj.set("nodeType", nodeType);    //NO I18N
                    ziaBotWFUtil.zwfControllerObj.set("wf_model_id", options.wf_model_id);  //NO I18N
                }
                jQuery('#bot-node-label-container').dialog({
                    resizable: false,
                    height: 'auto',    //No I18N
                    width: "500px", //NO I18N
                    title: title,
                    modal: true,
                    position: { my: "center top", at: "center top+85", of: window }, //No I18N
                    open: function () {
                        jQuery("body").addClass('pos-rel'); //No I18N
                        jQuery("#wf_append_loader .loading1").remove();
                    },
                    close: function () {
                        jQuery("body").removeClass('pos-rel'); //No I18N
                    }
                });
            },
            save: function (nodeType) {
                var labelElement = jQuery("#field-label-box");
                var labelValue = labelElement.val();
                if (labelValue.trim() === "") {
                    showalert("failure", translate("sdp.common.titleerrormessage"), "isAutoHide=false");//No i18N
                    labelElement.focus();
                    return;
                }
                var wf_cell_data = { "name": labelValue, "position": { "x": parseInt(wf_datas.x_position), "y": parseInt(wf_datas.y_position) }, "options": [{ "id": "1", "name": "input from user will be received" }], "type": "workfloweditor." + nodeType };  //NO I18N
                var currentCellId = ziaBotWFUtil.zwfControllerObj.get("wf_model_id");
                if (currentCellId && currentCellId !== "") {
                    wf_cell_data.id = currentCellId;
                    wf_datas.wf_editor_instance.updateNode(joint.shapes.workfloweditor[nodeType], wf_cell_data);
                    ziaBotWFUtil.workflow_modification_operations.updateNode(wf_cell_data);
                }
                ziaBotWFUtil.zwfControllerObj.set("wf_model_id", "");   //NO I18N
                jQuery("#field-label-box").val("");
                jQuery("#bot-node-label-container").dialog('destroy');  //NO I18N
                jQuery("body").addClass("of-h");
            },
            cancel: function () {
                ziaBotWFUtil.zwfControllerObj.set("wf_model_id", "");   //NO I18N
                jQuery("#field-label-box").val("");
                jQuery("#bot-node-label-container").dialog('destroy');  //NO I18N
                jQuery('#wf_fly_paper').remove();
            },
        }
    },

    workflow_canvas_operations: {
        postWorkflowData: function (workflow_data, type) {
            var statementsDetails = workflow_data.workflow.statements_details;
            setTimeout(function () {
                ziaBotWFUtil.workflow_canvas_operations.initializeWorkflowHeader(workflow_data, type);
            }, 100);

            var multiSelectNode_count = statementsDetails.multiSelectNode_count;
            var actionNode_count = statementsDetails.actionNode_count;
            var max_option_count = statementsDetails.max_option_count;
            var max_options_menu_count = statementsDetails.max_options_menu_count;
            var initial_options_menu_node_count = statementsDetails.current_options_menu_node_count;
            var max_action_count = statementsDetails.max_action_count;
            var initial_action_node_count = statementsDetails.current_action_node_count;
            var max_button_count = statementsDetails.max_button_count;
            var initial_button_count = statementsDetails.current_button_count;

            ziaBotWFUtil.workflow_modification_operations.multiSelectNode_count = multiSelectNode_count;
            ziaBotWFUtil.workflow_modification_operations.actionNode_count = actionNode_count;

            ziaBotWFUtil.node_operations.multiSelectNode.max_option_count = max_option_count;
            ziaBotWFUtil.node_operations.multiSelectNode.max_options_menu_count = max_options_menu_count;
            ziaBotWFUtil.node_operations.multiSelectNode.initial_options_menu_node_count = initial_options_menu_node_count;
            ziaBotWFUtil.node_operations.multiSelectNode.current_options_menu_node_count = initial_options_menu_node_count;
            ziaBotWFUtil.node_operations.multiSelectNode.max_button_count = max_button_count;
            ziaBotWFUtil.node_operations.multiSelectNode.initial_button_count = initial_button_count;

            ziaBotWFUtil.node_operations.action.max_action_count = max_action_count;
            ziaBotWFUtil.node_operations.action.initial_action_node_count = initial_action_node_count;
            ziaBotWFUtil.node_operations.action.current_action_node_count = initial_action_node_count;

            ziaBotWFUtil.zwfControllerObj.set('wf_type', type); //NO I18N
        },
        initializeWorkflowHeader: function (workflow_data, type) {

            jQuery('#wf_workflow_input').attr('readonly', true);
            // give- cursor pointer
            jQuery('#wf_workflow_input').addClass('cur-def');

            if (type === 'action' || type === 'button') {

                var workflowHeaderElement = jQuery('#zia-bot-workflow-header-name');
                var isHeaderDataAvailable = ziaBotWFUtil.zwfControllerObj.get(type + '_header_select2') ? true : false;
                //Workflow Name select2 will be initialized if the action/button view is opened for the first time from the list view
                //And also when navigated from button -> listview -> button, the select2 has to be reinitialized.
                if (!isHeaderDataAvailable || !workflowHeaderElement.data('select2')) {
                    ziaBotWFUtil.zwfControllerObj.set(type + '_header_select2', workflow_data.workflow.options);    //NO I18N
                    workflowHeaderElement.select2({
                        data: workflow_data.workflow.options,
                        selectOnClose: true,
                        formatNoMatches: function (term) {
                            return translate("common.no.match.found");
                        }
                    });
                    setTimeout(function () {
                        workflowHeaderElement.select2('data', workflow_data.workflow.default_option);   //NO I18N
                        workflowHeaderElement.on("change", function (evt) {
                            var _self = this;
                            if (!ziaBotWFUtil.workflow_modification_operations.isWorkFlowModified()) {
                                ziaBotWFUtil.workflow_canvas_operations.changeWorkflowOnSelectedValue(_self, type);
                            } else {
                                var confirm_msg = translate("sdp.admin.workflow.closeeditor.confirm");
                                confirm_msg = confirm_msg.replace(/,/g, "&#x2c;");
                                showconfirm(true, 'title=' + translate("sdp.admin.workflow.closeeditor") + ', message=' + confirm_msg + ', submitbutton=' + translate("common.yes") + ', cancelbutton=' + translate("common.no") + ', closebutton=yes, closeOnEscKey=yes', wf_cancel_submit);    //NO I18N
                                function wf_cancel_submit(boolean) {
                                    if (boolean) {
                                        ziaBotWFUtil.workflow_canvas_operations.changeWorkflowOnSelectedValue(_self, type);
                                    }
                                }
                            }
                        });
                    }, 10);
                }

                var title = workflow_data.workflow.default_option.text;
                // Adds uitooltip to the selected action in title
                // Give title to the selected action in title for tooltip
                jQuery('#s2id_zia-bot-workflow-header-name > a > .select2-chosen').attr('rel', 'uitip').attr('title', title);
            }

            //Expand and collapse button status
            //PDF option is available only for expanded view
            if (type == "expand") {
                jQuery("#wf-expand-btn").addClass('active');
                jQuery("#wf-collapse-btn").removeClass('active');
                this.enableDisableExportPDFOption('enable');
            } else {
                this.enableDisableExportPDFOption('disable');
                if (type == "collapse") {
                    jQuery("#wf-collapse-btn").addClass('active');
                    jQuery("#wf-expand-btn").removeClass('active');
                }
            }

            /* Hiding the stenci option (Nodes Drag/Drop) in the following view:
            *  1. Expand
            *  2. Action which are not used in the workflow
            *  3. Default and Reserved buttons (E.g., Exit, Happy, Sad etc.,)
            */
            var workflowStatements = workflow_data.workflow.statements;
            if (type == "expand" ||
                workflow_data.workflow.isActionNotUsedInWorkflow ||
                (type === 'button' && workflowStatements.length == 1 && //NO I18N
                    workflowStatements[0].button.is_default &&
                    !workflowStatements[0].button.next_node)) {
                jQuery('#wf_rhs').addClass('hide');
            } else {
                jQuery('#wf_rhs').removeClass('hide');
            }


            //For Zia Bot's workflow alone, the the drag & drop stencil container will be hidden since it is hiding the workflowflow
            var stencilContainer = jQuery('#wf_stencil_main_container')
            if (stencilContainer.is(":visible")) {
                stencilContainer.slideToggle('slow,linear'); // No I18N
                jQuery('.rhs-drag .wf-toggle').toggleClass('wf-expand'); // No I18N
            }

            /* In ZiaWFBuilder, to remove the newly_added_buttons when user adds a new button
            *  and then saves in Edit Options Popup Menu but cancels or exits the WFBuilder
            *  without saving the changes
            */
            if (ziaBotWFUtil.zwfControllerObj && ziaBotWFUtil.zwfControllerObj.newly_added_buttons) {
                delete ziaBotWFUtil.zwfControllerObj.newly_added_buttons;
            }
            ziaBotWFUtil.node_operations.button.reset();
        },
        /**
         * Function to disable the 'Export PDF' option in non-expanded zia bot workflow view (Action-edit/Button-edit/Collapse)
         * and enable it back in Expand view.
         * 
         * @param {string} operation  - enable/disable
         */
        enableDisableExportPDFOption: function (operation) {
            var exportPDFOption = jQuery('#wf_export_pdf');
            var exportPDFOptionParent = exportPDFOption.parent();
            if (operation === 'enable') {
                exportPDFOption.removeClass();
                exportPDFOptionParent.removeAttr('class').removeAttr('title').removeAttr('rel').removeAttr('rel-class');
            } else {
                exportPDFOption.addClass('ptr-ev-none opac5');
                exportPDFOptionParent.attr('class', 'cur-na').attr('title', translate('zia.bot.export.pdf.expand')).attr('rel', 'uitip').attr('rel-class', 'uitip');
                initTooltip('.sdmenu-dd');  //NO I18N
            }
        },
        addConnectors: function (wf_cells, startOptionIndex) {
            var connectorLinks = [];
            var wf_statement = wf_cells[0];
            if (!startOptionIndex) {
                startOptionIndex = 0;
            }
            var source_statement = { "id": wf_statement.id, "key": wf_statement.key, "name": wf_statement.name };   //NO I18N
            var source_port = "output_" + wf_statement.options[startOptionIndex].name;
            var target_port = "input";  //NO I18N
            for (i = 1; i < wf_cells.length; i++) {
                var connector_obj = { "source": {}, "target": {} }; //NO I18N
                wf_statement = wf_cells[i];
                var target_statement = {};
                target_statement.id = wf_statement.id;
                target_statement.name = wf_statement.name;
                target_statement.key = wf_statement.key;
                if (wf_statement.key === 'userInput' || wf_statement.key == 'output' || wf_statement.key == 'furtherAssistanceButton' || (wf_statement.key === 'action' && !wf_statement.can_delete_node)) {
                    connector_obj.attributes = { 'candelete_target': false };   //NO I18N
                }

                connector_obj.source.source_port = source_port;
                connector_obj.source.source_statement = source_statement;
                connector_obj.target.target_port = target_port;
                connector_obj.target.target_statement = target_statement;
                connectorLinks.push(ziaBotWFUtil.workflow_canvas_operations.processConnector(connector_obj));

                source_statement = {};
                source_statement.key = target_statement.key;
                source_statement.id = target_statement.id;
                source_statement.name = target_statement.name;
                if (wf_statement.options) {
                    source_port = "output_" + wf_statement.options[0].name;
                } else {
                    source_port = "output_" + wf_statement.name;    //NO I18N
                }


            }
            return connectorLinks;
        },
        removeNodes: function (model, isCellToBeTracked) {
            var _self = this;
            var successor_cells = _self.getSuccessorCells(model);
            var wf_model = wf_datas.wf_editor_instance.getCanvasPaper().model;
            wf_model.trigger("batch:start", { batchName: "remove-nodes" });  //No I18N
            successor_cells.forEach(function (cell) {
                if (cell.attributes.key === 'furtherAssistance') {
                    _self.removeFurtherAssistanceStartNodeConnection(cell);
                }
            });
            ziaBotWFUtil.workflow_canvas_operations.removeSuccessorCells(model, isCellToBeTracked);
            wf_model.trigger("batch:stop", { batchName: "remove-nodes" });  //No I18N
        },
        removeSuccessorCells: function (model, isCellToBeTracked, shouldNotDeleteNode) {
            var _self = this;
            var successor_cells = _self.getSuccessorCells(model);
            successor_cells.forEach(function (cell) {
                _self.removeCell(cell);
            });
            _self.removeCell(model, isCellToBeTracked, shouldNotDeleteNode);
        },
        removeCell: function (cell, isCellToBeTracked, shouldNotDeleteNode) {
            //To remove the newly added buttons from the deleted Options Menu node
            if (cell.get('key') == 'multiSelectNode') {
                cell.get('options').forEach(function (opt) {
                    if (!parseInt(opt.id)) {
                        var newButtonIndex = ziaBotWFUtil.zwfControllerObj.newly_added_buttons.indexOf(opt.name.toLowerCase());
                        if (newButtonIndex !== -1) {
                            delete ziaBotWFUtil.zwfControllerObj.newly_added_buttons[newButtonIndex];
                        }
                    }
                });
            }
            if (isCellToBeTracked) {
                ziaBotWFUtil.workflow_modification_operations.trackCell(cell, true);
                ziaBotWFUtil.workflow_modification_operations.removeNode(cell, shouldNotDeleteNode);
            } else {
                ziaBotWFUtil.workflow_modification_operations.trackCell(cell, false);
            }
            ziaBotWFUtil.zwfControllerObj.set('isCellNotRemoved', !isCellToBeTracked);  //NO I18N
            jQuery.when(
                cell.remove()
            ).done(function () {
                ziaBotWFUtil.zwfControllerObj.set('isCellNotRemoved', false);   //NO I18N
            });
        },
        getSuccessorCells: function (cell) {
            return wf_datas.wf_editor_instance.getCanvasPaper().model.getSuccessors(cell);
        },
        getSuccessorCellIds: function (cell) {
            var successorCellIds = [];
            var sucessorCells = this.getSuccessorCells(cell);
            sucessorCells.forEach(function (c) {
                successorCellIds.push(c.id);
            });
            return successorCellIds;
        },
        getPredecessorCells: function (cell) {
            return wf_datas.wf_editor_instance.getCanvasPaper().model.getPredecessors(cell);
        },
        getPredecessorCellIds: function (cell) {
            var predecessorCellsIds = [];
            var predecessorCells = this.getPredecessorCells(cell);
            predecessorCells.forEach(function (c) {
                predecessorCellsIds.push(c.id);
            });
            return predecessorCellsIds;
        },
        getTargetCells: function (removed_options, cell_id) {
            var wf_editor_model = wf_datas.wf_editor_instance.getCanvasPaper().model;
            var connected_links = this.getConnectedLinks(wf_editor_model.getCell(cell_id));
            var target_cells = [];
            connected_links.forEach(function (link) {
                var source_cell = link.get('source');
                if (source_cell.id == cell_id && removed_options.indexOf(source_cell.port.slice('output_'.length)) !== -1) {
                    target_cells.push(wf_editor_model.getCell(link.get('target').id));
                }
            });
            return target_cells;
        },
        getConnectedLinks: function (cell) {
            return wf_datas.wf_editor_instance.getCanvasPaper().model.getConnectedLinks(cell);
        },
        deleteTargetCells: function (removed_options, cell_id) {
            var _self = this;
            var wf_model = wf_datas.wf_editor_instance.getCanvasPaper().model;
            var target_cells = _self.getTargetCells(removed_options, cell_id);
            wf_model.trigger("batch:start", { batchName: "delete-target-cells" });  //No I18N
            target_cells.forEach(function (cell) {
                _self.removeSuccessorCells(cell, true, true);
            });
            wf_model.trigger("batch:stop", { batchName: "delete-target-cells" });  //No I18N
        },
        getCellsToBeExpanded: function (statements_details, connectors_details, isActionNodeAdded, nextCellId, cells, connectors, cellIds) {
            var _self = this;
            var cell = statements_details[nextCellId];

            //The expand will happen only for the starting button of the multiselect node and rest will be collapsed
            if (cell.key === 'multiSelectNode') {
                for (var i = 1; i < cell.options.length; i++) {
                    cell.options[i].isCollapsed = true;
                }
            }

            var nextCell = connectors_details[nextCellId];

            if (nextCell && !cellIds.includes(nextCellId)) {
                cellIds.push(cell.id);
                if (nextCell.type === 'multiSelectNode' || nextCell.type === 'furtherAssistance' || nextCell.type === 'feedback') {

                    var options = cell.options;

                    if (isActionNodeAdded) {
                        options.forEach(function (option, index) {
                            nextCellId = nextCell[option.id].target;
                            var connector = _self.processConnector(nextCell[option.id].connector);

                            //The connector for the Further Assistance 'Yes' button and start node will be added separately.
                            if (nextCell.type === 'furtherAssistance' && nextCellId === 'start') {
                                ziaBotWFUtil.zwfControllerObj.set("furtherAssistanceStart_connector", connector);   //NO I18N
                            } else {
                                connectors.push(connector);
                                _self.getCellsToBeExpanded(statements_details, connectors_details, isActionNodeAdded, nextCellId, cells, connectors, cellIds);
                            }
                        });

                    } else {

                        nextCellId = nextCell[options[0].id].target;
                        connectors.push(_self.processConnector(nextCell[options[0].id].connector));
                        _self.getCellsToBeExpanded(statements_details, connectors_details, isActionNodeAdded, nextCellId, cells, connectors, cellIds);
                    }

                } else if (nextCell.type === 'action' || nextCell.type === 'userInput' || nextCell.type === 'output') {

                    if (nextCell.type === 'action') {
                        isActionNodeAdded = true;
                    }

                    nextCellId = nextCell.target;
                    connectors.push(_self.processConnector(nextCell.connector));
                    _self.getCellsToBeExpanded(statements_details, connectors_details, isActionNodeAdded, nextCellId, cells, connectors, cellIds);
                }
            }
            cells.push(_self.processCell(cell));
        },
        collapseNodes: function (targetCell, cellsNotToBeCollapsed, isExpandMode) {
            //The Further Assistance Nodes has to be collapsed first to avoid issue while collapsing the rest of the flow.
            var isFurtherAssistanceFeedbackNodeModified = ziaBotWFUtil.workflow_canvas_operations.isFurtherAssistanceFeedbackNodeModified();
            var isFurtherAssistanceNodeExpanded = ziaBotWFUtil.workflow_canvas_operations.isFurtherAssistanceNodeExpanded();
            if (!isFurtherAssistanceFeedbackNodeModified && isFurtherAssistanceNodeExpanded) {
                this.collapseFurtherAssistanceNodes();
            }
            this.collapseOtherNodes(targetCell, cellsNotToBeCollapsed, isExpandMode, isFurtherAssistanceFeedbackNodeModified);
        },
        collapseOtherNodes: function (targetCell, cellsNotToBeCollapsed, isExpandMode, isFurtherAssistanceFeedbackNodeModified) {
            var _self = this;
            var cellsToBeExcluded = [];
            var wf_editor = wf_datas.wf_editor_instance;
            cellsNotToBeCollapsed.forEach(function (cellId) {
                var predecessorCellIds = _self.getPredecessorCellIds(wf_editor.getCell(cellId));
                cellsToBeExcluded = cellsToBeExcluded.concat(cellId);
                cellsToBeExcluded = cellsToBeExcluded.concat(predecessorCellIds);
            });
            if (isFurtherAssistanceFeedbackNodeModified) {
                var statementDetails = ziaBotWFUtil.workflow_data.workflow.statements_details;
                cellsToBeExcluded.push(statementDetails.further_assistance_node_id);
                cellsToBeExcluded.push(statementDetails.feedback_node_id);
            }
            if (!targetCell) {
                if (ziaBotWFUtil.wf_type === 'button') {
                    targetCell = wf_editor.getCell('button_' + ziaBotWFUtil.zwfControllerObj.get('button_id')); //NO I18N
                } else {
                    targetCell = wf_editor.getCell('start');    //No I18N
                }

            }
            var expandedCells = [targetCell];
            expandedCells = expandedCells.concat(_self.getSuccessorCells(targetCell));
            if (!isExpandMode) {
                expandedCells = expandedCells.concat(_self.getPredecessorCells(targetCell));
            }

            var canvasPaper = wf_editor.getCanvasPaper();
            canvasPaper.model.trigger("batch:start", { batchName: "remove-expanded-cells" });  //No I18N
            expandedCells.forEach(function (cell) {
                if (cellsToBeExcluded.indexOf(cell.id) === -1) {
                    _self.removeCell(cell);
                }
            });
            canvasPaper.model.trigger("batch:stop", { batchName: "remove-expanded-cells" });   //No I18N
        },
        collapseFurtherAssistanceNodes: function () {
            var _self = this;
            var cellsToBeCollapsed = [];
            var wf_editor = wf_datas.wf_editor_instance;
            var wf_model = wf_editor.getCanvasPaper().model;
            var statementsDetails = ziaBotWFUtil.workflow_data.workflow.statements_details;
            wf_model.trigger("batch:start", { batchName: "remove-expanded-fa-cells" });  //No I18N
            var furtherAssistanceCell = wf_model.getCell(statementsDetails.further_assistance_node_id);
            cellsToBeCollapsed.push(furtherAssistanceCell);
            var feedbackCell = wf_model.getCell(statementsDetails.feedback_node_id);
            cellsToBeCollapsed.push(feedbackCell);
            cellsToBeCollapsed.forEach(function (cell) {
                _self.removeCell(cell);
            });
            wf_model.trigger("batch:stop", { batchName: "remove-expanded-fa-cells" });  //No I18N
        },
        removeFurtherAssistanceStartNodeConnection: function (furtherAssistanceCell) {
            var furtherAssistanceLinks = this.getConnectedLinks(furtherAssistanceCell);
            //Removing the connection link of Further Assistance 'Yes' and the Start Node to avoid recursive successor cells
            furtherAssistanceLinks.forEach(function (link) {
                if (link.attributes.target.id === 'start') {
                    link.remove();
                }
            });
        },
        processCell: function (cell) {
            var cellType = cell.key;
            var constructed_cell = {};
            Object.keys(cell).forEach(function (key) {
                constructed_cell[key] = cell[key];
            });
            constructed_cell["type"] = "workfloweditor." + cellType;    //NO I18N
            constructed_cell = new joint.shapes.workfloweditor[cellType](constructed_cell);
            return constructed_cell;
        },
        processConnector: function (connector) {
            return wf_datas.wf_editor_instance.createLink(processConnectorOptions(connector, true));
        },
        changeWorkflowOnSelectedValue: function (element, type) {
            var id = jQuery(element).val();
            window.location.href = "/app#/admin/workflows/zwf/" + sdp_app.zia_info.BOT_ID + "/" + type + "/" + id;
        },



        /**
         * Function to validate the workflow and identify any buttons flow are missing and highlight them
         *
         * @param {Array} cells - All the cells(statements and connectors) in the canvas
         * @returns validation result whether all buttons are properly connected with another node
         */
        validate_workflow: function (cells) {
            var inCompleteButtonNames = '';
            var inCompleteCells = [];
            var inCompleteNodeNames = '';
            cells.forEach(function (cell) {
                if (cell.get('key') === 'multiSelectNode') {
                    var options = cell.get('options');
                    var isButtonNotCompleted = false;
                    options.forEach(function (opt) {
                        if (!opt.next_node) {
                            inCompleteButtonNames += opt.name + ', ';
                            isButtonNotCompleted = true;
                        }
                    });
                    if (isButtonNotCompleted) {
                        inCompleteNodeNames += cell.get('name') + ', ';
                        inCompleteCells.push(cell);
                    }
                }
            });
            if (inCompleteButtonNames) {
                jQuery("#wf_canvas_loader .loading1").remove();
                inCompleteButtonNames = inCompleteButtonNames.substring(0, inCompleteButtonNames.length - 2);
                inCompleteNodeNames = inCompleteNodeNames.substring(0, inCompleteNodeNames.length - 2);
                showalert('failure', translate("zia.bot.workflow.complete.next.node", [e_html(inCompleteButtonNames), e_html(inCompleteNodeNames)]), "isAutoHide=false");   //NO I18N
                wf_datas.wf_editor_instance.highlightNodes(inCompleteCells, errorHighlighter);
                return false;
            }
            return true;
        },

        /**
         * Function to validate the links created by user in the Zia Bot Workflow
         *
         * @param {*} cellViewS - source cell
         * @param {*} magnetS - source port magnet
         * @param {*} cellViewT - target cell
         * @param {*} magnetT - target port magnet
         * @param {*} end
         * @param {*} linkView - linkview of the link which is used to get the source node/option and target node
         * @param {*} workflowCanvasObj - The whole workflow canvas object to set the link error msg
         * @returns validation result
         */
        validate_connection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView, workflowCanvasObj) {
            var invalidConnection = false;
            var wf_editor = wf_datas.wf_editor_instance;
            var canvasPaper = wf_editor.getCanvasPaper();
            var target = cellViewT ? cellViewT.model : undefined;
            var source = cellViewS ? cellViewS.model : undefined;
            if (!linkView.markingAvailableMagnets) {
                if (source) {
                    var type = source.get('key');
                    if (type === 'multiSelectNode') {
                        var sourcePortName = decodeURIComponent(linkView.model.get('source').port.slice('output_'.length)); //NO I18N
                        source.get('options').every(function (option) {
                            if (option.name == sourcePortName) {
                                if (option.next_node) {
                                    invalidConnection = true;
                                    workflowCanvasObj.linkErrorMsg = translate("zia.bot.link.validation.source", [e_html(sourcePortName)]);
                                }
                                return false;
                            }
                            return true;
                        });
                    } else if (type === 'start' && target && target.get('key') === 'action') {  //NO I18N
                        invalidConnection = true;
                        workflowCanvasObj.linkErrorMsg = translate("zia.bot.start.action.error");
                    }
                }

                if (!invalidConnection && target) {
                    jQuery.each(canvasPaper.model.getConnectedLinks(target), function () {
                        if (this.get('target').id == target.get('id') && this.get('source').port !== linkView.model.get('source').port) {
                            invalidConnection = true;
                            workflowCanvasObj.linkErrorMsg = translate("zia.bot.link.validation.target", [e_html(target.get('name'))]);
                        }
                    });
                }
            }
            return !invalidConnection;
        },
        isFurtherAssistanceFeedbackNodeModified: function () {
            var statementDetails = ziaBotWFUtil.workflow_data.workflow.statements_details;
            var wf_model = wf_datas.wf_editor_instance.getCanvasPaper().model;
            var furtherAssistanceNodeId = statementDetails.further_assistance_node_id;
            var feedBackNodeId = statementDetails.feedback_node_id;
            var updatedNodes = ziaBotWFUtil.workflow_modification_operations.modifiedWorkflowJSON.nodes_updated;
            if ((wf_model.getCell(furtherAssistanceNodeId) && updatedNodes.includes(furtherAssistanceNodeId)) ||
                (wf_model.getCell(feedBackNodeId) && updatedNodes.includes(feedBackNodeId))) {
                return true;
            }
            return false;
        },
        isFurtherAssistanceNodeExpanded: function () {
            return wf_datas.wf_editor_instance.getCell(ziaBotWFUtil.workflow_data.workflow.statements_details.further_assistance_node_id) ? true : false;
        }
    },

    workflow_modification_operations: {
        multiSelectNode_count: 0,
        actionNode_count: 0,
        modifiedWorkflowJSON: {},
        updateNodeTypeName: function () {
            var wf_editor = wf_datas.wf_editor_instance;
            var canvasPaper = wf_editor.getCanvasPaper();
            canvasPaper.model.trigger("batch:start", { batchName: "rename-node-type" });  //No I18N
            var multiSelectNodeCells = wf_editor.getCellsByType('workfloweditor.multiSelectNode');  //NO I18N
            multiSelectNodeCells.forEach(function (cell) {
                cell.attr('.node-type/text', cell.get("internal_name"));
            });
            var actionNodeCells = wf_editor.getCellsByType('workfloweditor.action');    //NO I18N
            actionNodeCells.forEach(function (cell) {
                cell.attr('.node-type/text', cell.get("internal_name"));
            });
            canvasPaper.model.trigger("batch:stop", { batchName: "rename-node-type" });   //No I18N
        },
        addNode: function (cell) {
            this.trackCell(cell, true);
            //If the node being deleted is a newly added node which is not yet added it should be removed in the below
            //array
            var removedNodeIndex = this.modifiedWorkflowJSON.nodes_removed.indexOf(cell.id);
            if (removedNodeIndex !== -1) {
                delete this.modifiedWorkflowJSON.nodes_removed[removedNodeIndex];
                return;
            }
            if (!this.modifiedWorkflowJSON.nodes_added.includes(cell.id)) {
                this.modifiedWorkflowJSON.nodes_added.push(cell.id);

                if (cell.attributes.key === 'multiSelectNode') {
                    ziaBotWFUtil.node_operations.multiSelectNode.current_options_menu_node_count++;
                } else if (cell.attributes.key === 'action') {  //NO I18N
                    ziaBotWFUtil.node_operations.action.current_action_node_count++;
                }
            }
        },
        updateNode: function (cell) {
            //If the node is newly added one but being modified during customization before saving, then it should be added.
            if (this.modifiedWorkflowJSON.nodes_added.includes(cell.id)) {
                return;

                ///If the node is already noted down as updated node then no need to record it again.
            } else if (!this.modifiedWorkflowJSON.nodes_updated.includes(cell.id)) {
                this.modifiedWorkflowJSON.nodes_updated.push(cell.id);
            }
        },
        updateButton: function (button) {
            if (!this.modifiedWorkflowJSON.buttons_updated.includes(button.id)) {
                this.modifiedWorkflowJSON.buttons_updated.push(button.id);
            }
        },
        removeNode: function (cell, shouldNotDeleteNode) {
            //If the node being deleted is a newly added node which is not yet added it should be removed in the below
            //array
            var addedNodeIndex = this.modifiedWorkflowJSON.nodes_added.indexOf(cell.id);
            if (addedNodeIndex !== -1) {
                ziaBotWFUtil.workflow_modification_operations.renameNodeType(cell);
                delete this.modifiedWorkflowJSON.nodes_added[addedNodeIndex];

                if (cell.attributes.key === 'multiSelectNode') {
                    ziaBotWFUtil.node_operations.multiSelectNode.current_options_menu_node_count--;
                } else if (cell.attributes.key === 'action') {  //NO I18N
                    ziaBotWFUtil.node_operations.action.current_action_node_count--;
                }
                return;
            }

            //If the node is available in the updated list then have to remove it.
            var updatedNodeIndex = this.modifiedWorkflowJSON.nodes_updated.indexOf(cell.id);
            if (updatedNodeIndex !== -1) {
                delete this.modifiedWorkflowJSON.nodes_updated[updatedNodeIndex];
            }

            //Node should not be removed because only the button of an Options Menu is being removed but not the successor nodes
            if (shouldNotDeleteNode) {
                return;
            }

            //Then add in removed List.
            if (!this.modifiedWorkflowJSON.nodes_removed.includes(cell.id)) {
                this.modifiedWorkflowJSON.nodes_removed.push(cell.id);

                if (cell.attributes.key === 'multiSelectNode') {
                    ziaBotWFUtil.node_operations.multiSelectNode.current_options_menu_node_count--;
                } else if (cell.attributes.key === 'action') {  //NO I18N
                    ziaBotWFUtil.node_operations.action.current_action_node_count--;
                }
            }
        },
        /**
         * Function to track the connector/node being added/removed and use it during the undo/redo operation
         * @param {object} cell - Cell (connector/node)
         * @param {boolean} isCellToBeTracked - whether to track the cell or not
         */
        trackCell: function (cell, isCellToBeTracked) {
            if (Array.isArray(cell)) {
                cell.forEach(function (c) {
                    c.attributes.isCellToBeTracked = isCellToBeTracked;
                });
            } else {
                cell.attributes.isCellToBeTracked = isCellToBeTracked;
            }
        },
        renameNodeType: function (removedNode) {
            var removedNodeType = removedNode.attributes.type;
            if (removedNodeType === 'workfloweditor.action' || removedNodeType === 'workfloweditor.multiSelectNode') {
                var internalNamePrefix = translate("zia.bot.workflow.options.menu") + ' ';   //NO I18N
                var counterVariable = 'multiSelectNode_count';  //NO I18N
                if (removedNodeType === 'workfloweditor.action') {
                    internalNamePrefix = translate("sdp.admin.workflow.stencil.action") + ' '; //NO I18N
                    counterVariable = 'actionNode_count';   //NO I18N
                }
                var removedNodeInternalName = removedNode.attributes.internal_name;
                var removedNodeCount = parseInt(removedNodeInternalName.slice(internalNamePrefix.length));
                var wf_editor = wf_datas.wf_editor_instance;
                var canvasPaper = wf_editor.getCanvasPaper();
                this.modifiedWorkflowJSON.nodes_added.forEach(function (node) {
                    var addedNode = wf_editor.getCell(node);
                    if (addedNode && addedNode.get('type') === removedNodeType) {
                        var addedNodeInternalName = addedNode.get('internal_name');
                        var addedNodeCount = parseInt(addedNodeInternalName.slice(internalNamePrefix.length));
                        if (addedNodeCount > removedNodeCount) {
                            addedNodeCount--;

                            canvasPaper.model.trigger("batch:start", { batchName: "rename-node-type" });  //No I18N
                            addedNodeInternalName = internalNamePrefix + addedNodeCount;
                            addedNode.set('internal_name', addedNodeInternalName);  //NO I18N
                            addedNode.attr('.node-type/text', addedNodeInternalName);
                            canvasPaper.model.trigger("batch:stop", { batchName: "rename-node-type" });   //No I18N

                            ziaBotWFUtil.workflow_modification_operations[counterVariable]--;
                        }
                    }
                });
            }
        },
        addConnector: function (connector) {
            if (!ziaBotWFUtil.wfControllerObj.get('wf_graph_action')) {
                ziaBotWFUtil.workflow_modification_operations.addNextNodeConnection(connector);
            }
        },
        //Newly added button's next node will be updated when a connector is added
        addNextNodeConnection: function (connector) {
            var wf_editor = wf_datas.wf_editor_instance;
            var connectorAttr = connector.attributes;
            var connector_source = connectorAttr.source;
            var connector_target = connectorAttr.target;
            var source_cell = wf_editor.getCell(connector_source.id);
            var sourceCellKey = source_cell.get('key');
            var connectorToBeTracked = false;
            if (sourceCellKey === 'multiSelectNode') {
                source_cell.get('options').every(function (option) {
                    if (encodeURIComponent(option.name) == connector_source.port.slice('output_'.length)) {
                        if (option.next_node !== connector_target.id) {
                            option.next_node = connector_target.id;
                            connectorToBeTracked = true;
                            //If the connector alone got updated for button in M.S node then it has to be updated
                            ziaBotWFUtil.workflow_modification_operations.updateNode(connector_source);
                        }
                        return false;
                    }
                    return true;
                });
            } else if (sourceCellKey === 'button') {    //NO I18N
                var button = source_cell.get('button');
                button.next_node = connector_target.id;
                connectorToBeTracked = true;
                ziaBotWFUtil.workflow_modification_operations.updateButton(button);
            } else if (sourceCellKey === 'start') { //NO I18N
                var start = source_cell.get('start');
                start.next_node = connector_target.id;
                connectorToBeTracked = true;
                ziaBotWFUtil.workflow_modification_operations.updateNode(connector_source);
            }
            if (connectorToBeTracked) {
                this.trackCell(connector, true);
            }
        },
        removeConnector: function (connector) {
            var connectorAttr = connector.attributes;
            if (!ziaBotWFUtil.wfControllerObj.get('wf_graph_action')
                && !ziaBotWFUtil.zwfControllerObj.get('isCellNotRemoved')
                && connectorAttr.source.id && connectorAttr.target.id) {
                ziaBotWFUtil.workflow_modification_operations.removeNextNodeConnection(connector);
            }
        },
        removeNextNodeConnection: function (connector) {
            var wf_editor = wf_datas.wf_editor_instance;
            var connectorAttr = connector.attributes;
            var connector_source = connectorAttr.source;
            var source_cell = wf_editor.getCell(connector_source.id);
            var sourceCellKey = source_cell.get('key');
            var connectorToBeTracked = false;
            if (sourceCellKey === 'multiSelectNode') {
                source_cell.get('options').every(function (option) {
                    if (encodeURIComponent(option.name) == connector_source.port.slice('output_'.length)) {
                        if (option.next_node) {
                            /** The old_next_node attribute in the options will hold the initial next node of the option
                             *  while the connection between them got removed */
                            if (!option.old_next_node) {
                                option.old_next_node = option.next_node;
                            }
                            option.next_node = null;
                            option.isCollapsed = true;
                            connectorToBeTracked = true;
                            ziaBotWFUtil.workflow_modification_operations.updateNode(connector_source);
                        }
                        return false;
                    }
                    return true;
                });
            } else if (sourceCellKey === 'button') {    //NO I18N
                var button = source_cell.get('button');
                button.next_node = null;
                connectorToBeTracked = true;
                ziaBotWFUtil.workflow_modification_operations.updateButton(button);
            } else if (sourceCellKey === 'start') { //NO I18N
                var start = source_cell.get('start');
                start.next_node = null;
                connectorToBeTracked = true;
                ziaBotWFUtil.workflow_modification_operations.updateNode(connector_source);
            }
            if (connectorToBeTracked) {
                this.trackCell(connector, true);
            }
        },
        revertOperation: function (operation, operation_manager, shouldUndoAgain) {

            var cell = operation.data;
            var attribute = operation.action.substr(operation_manager.PREFIX_LENGTH);
            var wf_graph_action = ziaBotWFUtil.wfControllerObj.get('wf_graph_action');
            if (wf_graph_action) {
                ziaBotWFUtil.wfControllerObj.set('wf_graph_action', null);  //No I18N
            }
            if (cell.type == 'logic.Wire') {
                var sourceCell = cell.attributes ? cell.attributes.source : null;
                var targetCell = cell.attributes ? cell.attributes.target : null;
                if (attribute == 'target' && cell.next && cell.next.target && cell.next.target.id) {
                    targetCell = cell.next.target;
                    cell = wf_datas.wf_editor_instance.getCell(cell.id);
                    if (cell && cell.attributes.target) {
                        cell.attributes.target.id = targetCell.id;
                        this.removeConnector(cell);
                    }
                } else if ((sourceCell)) {
                    if (operation.action == 'add' && targetCell.id && cell.attributes.isCellToBeTracked) {
                        this.removeConnector(cell);
                    } else if (operation.action == 'remove' && cell.attributes.isCellToBeTracked) {
                        this.addConnector(cell);
                    }
                }

            } else {
                if (operation.action == 'add' && cell.attributes.isCellToBeTracked) {
                    this.removeNode(cell);
                } else if (operation.action == 'remove' && cell.attributes.isCellToBeTracked) {
                    this.addNode(cell);
                } else if (attribute === 'options' && cell.type === 'workfloweditor.multiSelectNode') {
                    this.modifyNewlyAddedButtonArray(cell.next.options, cell.previous.options);
                }

                this.updateNodeTypeName();
            }
            if (wf_graph_action) {
                ziaBotWFUtil.wfControllerObj.set('wf_graph_action', wf_graph_action);   //No I18N
            }

            if (shouldUndoAgain == null) {
                shouldUndoAgain = false;
                if (operation.action != 'add' && operation.action != 'remove') {
                    //To ignore the 'vertexMarkup' and 'toolMarkup' attribute changes as a single undo operation
                    if (attribute == 'vertexMarkup' || attribute == 'toolMarkup') {
                        shouldUndoAgain = true;
                        //To ignore the changes done in nodes which are not updated by the user
                    } else if (cell.type != 'logic.Wire' &&                                            //No I18N
                        (!this.modifiedWorkflowJSON.nodes_updated.includes(cell.id)
                            && !this.modifiedWorkflowJSON.nodes_added.includes(cell.id)
                            && !this.modifiedWorkflowJSON.nodes_removed.includes(cell.id))) {
                        shouldUndoAgain = true;
                    }
                }
            }

            return shouldUndoAgain;
        },
        applyOperation: function (operation, operation_manager, shouldRedoAgain) {
            var cell = operation.data;
            var attribute = operation.action.substr(operation_manager.PREFIX_LENGTH);
            var wf_graph_action = ziaBotWFUtil.wfControllerObj.get('wf_graph_action');
            if (wf_graph_action) {
                ziaBotWFUtil.wfControllerObj.set('wf_graph_action', null);  //No I18N
            }
            if (operation.data.type == 'logic.Wire') {
                var sourceCell = cell.attributes ? cell.attributes.source : null;
                var targetCell = cell.attributes ? cell.attributes.target : null;
                if (attribute == 'target' && cell.next && cell.next.target && cell.next.target.id) {
                    targetCell = cell.next.target;
                    cell = wf_datas.wf_editor_instance.getCell(cell.id);
                    if (cell && cell.attributes.target) {
                        cell.attributes.target.id = targetCell.id;
                        this.addConnector(cell);
                    }
                } else if (sourceCell) {
                    if (operation.action == 'add' && cell.attributes.isCellToBeTracked) {
                        this.addConnector(cell);
                    } else if (operation.action == 'remove' && cell.attributes.isCellToBeTracked) {
                        this.removeConnector(cell);
                    }
                }
            } else {
                if (operation.action == 'add' && cell.attributes.isCellToBeTracked) {
                    this.addNode(cell);
                } else if (operation.action == 'remove' && cell.attributes.isCellToBeTracked) {
                    this.removeNode(cell);
                } else if (attribute === 'options' && cell.type === 'workfloweditor.multiSelectNode') {
                    this.modifyNewlyAddedButtonArray(cell.previous.options, cell.next.options);
                }
                this.updateNodeTypeName();
            }
            if (wf_graph_action) {
                ziaBotWFUtil.wfControllerObj.set('wf_graph_action', wf_graph_action);   //No I18N
            }

            if (shouldRedoAgain == null && operation_manager.hasRedo()) {
                shouldRedoAgain = false;
                var redoOperation = operation_manager.redoStack[operation_manager.redoStack.length - 1];
                redoOperation = Array.isArray(redoOperation) ? redoOperation[redoOperation.length - 1] : redoOperation;
                if (redoOperation.action != 'add' && redoOperation.action != 'remove') {
                    attribute = redoOperation.action.substr(operation_manager.PREFIX_LENGTH);

                    //To ignore the 'vertexMarkup' and 'toolMarkup' attribute changes as a single redo operation
                    if (attribute == 'vertexMarkup' || attribute == 'toolMarkup') {
                        shouldRedoAgain = true;
                        //To ignore the changes done in nodes which are not updated by the user
                    } else if (redoOperation.data.type != 'logic.Wire' &&                                            //No I18N
                        (!this.modifiedWorkflowJSON.nodes_updated.includes(cell.id)
                            && !this.modifiedWorkflowJSON.nodes_added.includes(cell.id)
                            && !this.modifiedWorkflowJSON.nodes_removed.includes(cell.id))) {
                        shouldRedoAgain = true;
                    }
                }
            }

            return shouldRedoAgain;
        },
        resetOperation: function () {
            this.modifiedWorkflowJSON = {
                nodes_added: [],
                nodes_removed: [],
                nodes_updated: [],
                buttons_updated: []
            };
            var statementsDetails = ziaBotWFUtil.workflow_data.workflow.statements_details;
            this.multiSelectNode_count = statementsDetails.multiSelectNode_count;
            this.actionNode_count = statementsDetails.actionNode_count;

            if (ziaBotWFUtil.zwfControllerObj && ziaBotWFUtil.zwfControllerObj.newly_added_buttons) {
                delete ziaBotWFUtil.zwfControllerObj.newly_added_buttons;
            }

            ziaBotWFUtil.node_operations.multiSelectNode.current_options_menu_node_count = ziaBotWFUtil.node_operations.multiSelectNode.initial_options_menu_node_count;
            ziaBotWFUtil.node_operations.action.current_action_node_count = ziaBotWFUtil.node_operations.action.initial_action_node_count;
        },
        /**
         * Method will modify the newly_added_buttons array if new button is added/removed via undo/redo operation.
         *
         * @param {Array} oldOptions Old options array in Options Menu Node
         * @param {Array} newOptions New options array in Options Menu Node
         */
        modifyNewlyAddedButtonArray: function (oldOptions, newOptions) {
            var availableOptions = new Set();
            var currentOptionNames = new Set(oldOptions.map(function (opt) {
                return opt.name;
            }));
            newOptions.forEach(function (opt) {
                if (currentOptionNames.has(opt.name)) {
                    availableOptions.add(opt.name);
                } else if (!parseInt(opt.id)) {
                    ziaBotWFUtil.zwfControllerObj.newly_added_buttons.push(opt.name.toLowerCase());
                }
            });
            oldOptions.forEach(function (opt) {
                if (!availableOptions.has(opt.name) && !parseInt(opt.id)) {
                    var buttonIndex = ziaBotWFUtil.zwfControllerObj.newly_added_buttons.indexOf(opt.name.toLowerCase());
                    if (buttonIndex !== -1) {
                        delete ziaBotWFUtil.zwfControllerObj.newly_added_buttons[buttonIndex];
                    }
                }
            });
        },
        /*
        * It returns the nodes which should not be collapsed which includes the newly added nodes and the nodes
        * being updated.
        */
        getModifiedNodes: function () {
            var modifiedNodesJSON = this.getModifiedJSON();
            if (modifiedNodesJSON) {
                var wf_editor = wf_datas.wf_editor_instance;
                var nodes_added = modifiedNodesJSON.nodes_added;
                nodes_added.forEach(function (cellId) {
                    nodes_added = nodes_added.concat(ziaBotWFUtil.workflow_canvas_operations.getSuccessorCellIds(wf_editor.getCell(cellId)));
                });
                var nodes_updated = modifiedNodesJSON.nodes_updated;
                nodes_updated.forEach(function (cellId) {
                    var updatedCell = wf_editor.getCell(cellId);
                    if (updatedCell.get('key') === 'action') {
                        nodes_updated = nodes_updated.concat(ziaBotWFUtil.workflow_canvas_operations.getSuccessorCellIds(wf_editor.getCell(cellId)));
                    }
                });
                return nodes_added.concat(nodes_updated);
            }
            return [];
        },
        getModifiedJSON: function () {
            var isModified = false;
            for (var key in this.modifiedWorkflowJSON) {
                //The counter object is not a Array and it does not need this filtering.
                if (key !== 'counter') {
                    this.modifiedWorkflowJSON[key] = this.modifiedWorkflowJSON[key].filter(function (value) {
                        if (value != null) {
                            isModified = true;
                            return true;
                        }
                    });
                }
            }
            if (isModified) {
                if (this.modifiedWorkflowJSON.nodes_added.length) {
                    var counter = {
                        "multiSelectNode_count": ziaBotWFUtil.workflow_modification_operations.multiSelectNode_count,   //NO I18N
                        "actionNode_count": ziaBotWFUtil.workflow_modification_operations.actionNode_count  //NO I18N
                    };
                    this.modifiedWorkflowJSON.counter = counter;
                }
                return this.modifiedWorkflowJSON;
            } else {
                return null;
            }
        },
        isWorkFlowModified: function () {
            return this.getModifiedJSON() != null;
        }
    }
};
