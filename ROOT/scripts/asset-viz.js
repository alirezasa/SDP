/* $Id$ */
/* Util classes */
// Text truncate Function for managing a constant size

var truncate1 = function (text, size)
{
	return (text.length > size+1)?text.substr(0,size)+'...':text;	
}

function loadPreviousDependencyState(){

	if(TaskDependency.baseTask == null){ 	return true;		}

	jQuery( '#'+TaskDependency.baseTask ).addClass('node-currentnode');

	if(TaskDependency.taskRelation != null){	
			
		vizard.infoData.nodeId = TaskDependency.baseTask;

		if( 'removeDependency' == TaskDependency.taskRelation ){

			removeRelation();

		}else{		markSelectableNodes( TaskDependency.taskRelation ); 		}
	}
}
function resetTimer(timer){
	if(timer){	
		clearTimeout(timer);
		timer = null;
	}
}
 
var labelType, useGradients, nativeTextSupport, animate;

(function() {
  var ua = navigator.userAgent,
      iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
      typeOfCanvas = typeof HTMLCanvasElement,
      nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),//NO I18N
      textSupport = nativeCanvasSupport 
        && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');//NO I18N
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';//NO I18N
  nativeTextSupport = labelType == 'Native';//NO I18N
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
  
  

})(); 

empty	= function(){};

var TaskDependency = null;

function CreateViz(vizContainerId, options){
	//console.log(options);
 	var defaults = {			
			onInit			:empty,
			levelsToShow	:2,
			// Node Styling and customisation options
			"Asset"			:{"$type" :"assetnode"	 , 	"$width": 120, "$height":80},									//NO I18N
			"Relation"		:{"$type" :"stroke-rect" , 	"$width": 120, "$height":40},									//NO I18N
			
			// Edge Styling
			"edgeColor"		:{ normal :"#cccccc",  hover:"#7777aa", selected:"666666", disabled:"#adad00"},				//NO I18N
			
			// Containers and tip options
			"InfoContainer"	:{ id:"#ASSET_DESC_PANEL", hoverTime:1000, fadeTime:200, onShow: empty, onHide: empty,hideTime:40000 },	//NO I18N	
			
			// Internal filter used to check if a relations has been processed
			filterRels		:true,
			
			// Data Feteching function
			onNodeClick		: empty,
			
			// Tip Custamisation function
			onShowTip		: empty,
			
			// Creation of node Element
			onCreateHtmlNode: empty,
			
			// Max and Min scaling for the chart
			maxScale	    :1.5,
			minScale 		:0.5,
			preventMousewheel	:false,
			
			plotArrowSize : 5,
			nameTruncateVal : 15,	
			beginx : 40

	};
	var chart 	 	= this; 
	
	vizContainerId 	= vizContainerId || "infovis";					//NO I18N
		
	options 	  	= $jit.util.extend(defaults, options);	 
	edgeColor 		= options.edgeColor;
	nodeType  		= {"asset"		: 0,  "relation"	: 1};		//NO I18N	
	infoProp  		= options.InfoContainer;

	beginx			= options.beginx;
	plotArrowSize 		= options.plotArrowSize;
	nameTruncateVal 	= options.nameTruncateVal;


	$activeNode 	= null;
	$replot = false;
	
	$infoPanel 	  	= jQuery(infoProp.id);							// DOM id for the info panel of the viz. 
	$infoData		= { nodeId		:null, blocked		:false,	hoverTimer	:null, fadeTimer	:null,hideTimer:5000 };		 
	
	/*  Below are related functions for Showing Details of the product as Tips */
	$attrPanel = jQuery("#CI_ATTRIB_PANEL");						//NO I18N
	$attrInfo  = jQuery("#CI_ATTRIB_INFO");							//NO I18N
	
	$attrPanel.find(".ui-close").on('click', function(){					//NO I18N
												hideAttribInfo();
										});
	
	
	
	/*$morePanel  = jQuery("#CI_MORE_PANEL");							//NO I18N
	$morePanel.find(".ui-close").click(function(){					//NO I18N
												hideMoreInfo();
										});
	 
	*/
	
	var $panned 	  = false;		 
	var $pannedOffset = {x:0, y:0};
	
	var $hovered	  = false;
	var $hoverType    = 0;
	
	var $userActionFlags = { nodeClick:false, canvasPanned:false };
	
	/*
	***** Data Parsing Algorithm for Asset Relationship visualisation *****
	
		Parsing input data for the Asset relationship tree 
		A json request to the server will fetch all related assets and their 
		relationship name to the currently selected asset.
		
		Json request --> {Asset a} --> Related To name --> {Asset b}		
		data structure (Input to Javascript infoviz)
			[{
			 	id		:"$AssetID$",
				name	:"$AssetName$",
				data 	:{"$More asset related data$"}
			 }]
		The data that is coming in over a period of time based on the users interaction will be parsed and sent into a Hash map for storage and reference.
	*/
	
	var INPUT_ASSET_LIST	= $A(), 													// List of all assets currently processed in the viz.
	 	ROOT_ID				= null,														// Node if of the asset that has come in first.
	 	MASTER_TREE			= $H({'tree': []}),					//NO I18N				// Hash tree for the Asset input for the Viz.	
	 	MOREEDGELIST		= $H({'edges': []}), 				//NO I18N				// List of additional edges on the order that the data has been processed
		ASSET_REL_LIST	   	= $H(),														// All asset relations in the view and list of all assets in view
		ALL_REL_LIST 		= $H(),														// All node relations in the view
		RELATION_HASH_LIST	= $H();														// Relation ids processed till now.
		INCOMING_DATA		= $A();														// Json feed of incoming data
		NODE_CLICKED 		= $H();
	
	// The raw data coming from the server is converted into a list of assets and relations
	function ProcessRelations(data, fromId){
		// A Temporary view list for the current data being processed 
		try{
			//INCOMING_DATA = $jit.util.extend(data, INCOMING_DATA);
			$A(data)
				.each(function(info){ 
					   INCOMING_DATA.push(info);
					   if(info.data && !(RELATION_HASH_LIST.get(info.data.relId))){	 
							ConvertToTree(SplitData(info, fromId));
							if(options.filterRels) RELATION_HASH_LIST.set(info.data.relId, 1);
					   }
				 });  
		}catch(err){

		}
	}
	
	// The Jit framework uses a single node hash name for any unique incoming data for a particular type of graph
	// This function is a utility function to generate a temp unique id for and incoming asset...
	// Currently the function will return the actual data that comes in... This will be modified later if a requirement for multiple canvases with same data is to be created
	function getNodeId(id){
		//return id+"_"+vizContainerId;
		return id;
	}
	
	function getRelationId(info){
		return getNodeId(info.fromId)+'_'+info.data.relTypeId;
	}
	
	// Spliting the Asset object and its relations as two seperate nodes
	function SplitData(info, fromId){ 
		var relNode 			= {    id		 : getRelationId(info),  //NO I18N
									   relId	 : info.data.relId, 
									   relTypeId : info.data.relTypeId,
									   name		 : info.data.relation,
									   fromId	 : getNodeId(info.fromId),
									   data		 : {}, 
									   children	 : []
								  };	
		
		relNode.data 			= $jit.util.extend(relNode.data, options.Relation);
		relNode.data.objType    = nodeType.relation;

		var assetNode			= {id		: getNodeId(info.id),			   
								   name		: info.name,
								   relId	: info.data.relId, 
								   fromId	: relNode.id,								   
								   data		: {assetId: info.id}, 
								   children : []};
		
		//bellow code for appending the ciAttributes to old attributes.		
		var node = st.graph.getNode(assetNode.id);		
		if(node && node.data.ciAttribute && info && info.data.ciAttribute) {
				node.data.ciAttribute.ciRelId = node.data.ciAttribute.ciRelId+';'+info.data.ciAttribute.ciRelId;
		}
		assetNode.data 			= $jit.util.merge(assetNode.data, options.Asset, info.data);
		assetNode.data.objType  = nodeType.asset;
		
		if(INPUT_ASSET_LIST.length) 
			AssetMapping(info.fromId, info.id);										
		 

		return [relNode, assetNode];
	} 
	
	// Converting the list to a tree than can be used to feed the Viz.
	function ConvertToTree(relations){
			var tree		   = MASTER_TREE.get('tree');//NO I18N
				
			$A(relations)
				.each(function(rel){					
					if(!INPUT_ASSET_LIST.length) ROOT_ID = rel.id;  
						if(ALL_REL_LIST.get(rel.id) && !rel.data.objType){ 
							var edges 		 = MOREEDGELIST.get(rel.fromId);
							if(!edges) edges = MOREEDGELIST.set(rel.fromId, []);							
							edges.push(rel.id);													 
						}
						else if(INPUT_ASSET_LIST.length){ 
							  var temp 	     = MASTER_TREE.get(rel.fromId);
							  if(!temp) temp = MASTER_TREE.set(rel.fromId, []);
							  
						 	 temp.push(rel); 
						 	 tree.push(rel); 
						} 		
						if(INPUT_ASSET_LIST.length>1) 
						 	 NodeMapping(rel.fromId, rel.id);
						 
						INPUT_ASSET_LIST.push(rel);  			 
				});	 
			//console.clear();
			//console.log(MASTER_TREE.toSource()); 
	}	 
	// Cross Mapping relations with assets in the view
	function AssetMapping(fromId, id){
		var asset 		 	= ASSET_REL_LIST.get(fromId);
		if(!asset) asset    = ASSET_REL_LIST.set(fromId, []);							
		asset.push(id);													
			
		var asset 		    = ASSET_REL_LIST.get(id);
		if(!asset) asset    = ASSET_REL_LIST.set(id, []);							
		asset.push(fromId);	
	}
	
	// Cross Mapping Nodes with each other in the view
	function NodeMapping(fromId, id){
		var nodeId 		 	  = ALL_REL_LIST.get(fromId);
		if(!nodeId) nodeId    = ALL_REL_LIST.set(fromId, {parents:$H(), children:$H()});							
			nodeId.children.set(id, 1);													
			
		var nodeId 		      = ALL_REL_LIST.get(id);
		if(!nodeId) nodeId    = ALL_REL_LIST.set(id, 	 {parents:$H(), children:$H()});							
			nodeId.parents.set(fromId, 1);
	} 
	
	function getJsonNode(nodeId){ 	
		nodeId = getNodeId(nodeId);
		var _children 	= MASTER_TREE.get(nodeId);
		$A(_children).each(function(childnode){
				childnode.children = MASTER_TREE.get(childnode.id);
		});
				
		return (_children)?{id:nodeId, children: _children}:null;
	}
	
	
	function plotArrow(pos, dim, ctx){
		 var  c1x = pos.x, 
			  c1y = pos.y, 
			  c2x = c1x   - dim, 
			  c2y = pos.y + dim, 
			  c3x = c1x   - dim, 
			  c3y = pos.y - dim;
			ctx.beginPath();
			ctx.moveTo(c1x, c1y);
			ctx.lineTo(c2x, c2y);
			ctx.lineTo(c3x, c3y);
			ctx.closePath();
		  ctx.fill(); 
	}
	
	// Edge plotting Function 
	function plotEdges(nodeFrom, nodeTo, orn){				
			if(nodeFrom && nodeTo){
				orn = orn || "left"; //NO I18N
				var ctx 	 = st.canvas.getCtx(),
					rel 	 = nodeFrom._depth < nodeTo._depth,
					begin 	 = st.geom.getEdge(nodeFrom, 'begin', orn),//NO I18N
					end		 = st.geom.getEdge(nodeTo  , 'end',   orn); //NO I18N
					dim 	 = (end.x - begin.x);

				if(nodeFrom.data.objType){
					begin.x -= beginx;
				}
				if(!rel){	
					end.x += nodeTo.getData("width"); //NO I18N 
				}
				
				ctx.beginPath();
				ctx.strokeStyle = edgeColor.normal;
				ctx.fillStyle 	= edgeColor.normal;
				ctx.lineWidth   = 1.5;				
				drawArrow		= false;
				
				if($hovered && !st.busy){ 
					//if(!$hoverType){ 
						if(nodeFrom.getData("hover") && nodeTo.getData("hover")){//NO I18N
							var val = nodeTo.getData("hover") - nodeFrom.getData("hover");//NO I18N
							//console.log(nodeFrom.getData("hover")+" - "+nodeTo.getData("hover") +"= "+val);
							if(val == 1){
								ctx.strokeStyle = edgeColor.hover;
								ctx.fillStyle 	= edgeColor.hover;
								ctx.lineWidth   = 2;
								drawArrow		= true;
							} 
						} 
					//}
					/*
					else if(nodeFrom.getData("hover") || nodeTo.getData("hover")){ //NO I18N
						ctx.strokeStyle = edgeColor.hover;
						ctx.fillStyle 	= edgeColor.hover;						
						ctx.lineWidth   = 2;
						drawArrow		= true;
					}  */
				}
				/*
				else if( nodeFrom.selected && nodeTo.selected ) {
					ctx.strokeStyle = edgeColor.selected;
					ctx.lineWidth   = 2;
				}*/
				
				ctx.moveTo(begin.x, begin.y);		 
		 		if(!rel){	 
					dimy  = end.y - begin.y;
					// Current node depth is higher than the connecting node					
					ctx.bezierCurveTo(begin.x - dim/4, begin.y + dimy/4, end.x - dim/2, end.y, end.x, end.y);			 				
				}else{				 					
					ctx.bezierCurveTo(begin.x + dim, begin.y, end.x-dim, end.y, end.x, end.y);		 					
				}
				 
				ctx.stroke(); 
				
				if(nodeFrom.data.objType && drawArrow){ 
						// invert edge direction 
						plotArrow(end, (rel)?plotArrowSize:-(plotArrowSize), ctx);
				}
		}
	}
	
	$jit.ST.Plot.EdgeTypes.implement({
		'groupedbezier': {//NO I18N
			   'render': function(adj, canvas) {//NO I18N
				 var orn = this.getOrientation(adj),
					 nodeFrom = adj.nodeFrom, 
					 nodeTo = adj.nodeTo;
					 plotEdges(nodeFrom, nodeTo, orn); 
			   }
			}
	});
	
	$jit.ST.Plot.NodeTypes.implement({
      'stroke-rect': {//NO I18N
        'render': function(node, canvas) {//NO I18N
          var width  = node.getData('width'),//NO I18N
              height = node.getData('height'),//NO I18N
              pos 	= this.getAlignedPos(node.pos.getc(true), width, height),
              from = {x:pos.x,y:(pos.y+height/2)},
              to   = {x:(pos.x+width/2)+20, y:(pos.y+height/2)}; 
		  
		  //canvas.getCtx().strokeStyle = node.getData("color");		  
          this.edgeHelper.line.render(from, to, canvas);
			
		  // Plotting Additional Edges connecting various nodes
		  var edges = MOREEDGELIST.get(node.id);
		  if(edges){
		  	$A(edges).each(function(n){
				nodeFrom = node;
				nodeTo   = st.graph.getNode(n);		
				plotEdges(nodeFrom, nodeTo);			
			});
		  }
        }
      },
	  'assetnode':{//NO I18N
			'render': function(node, canvas) {//NO I18N
				  var width = node.getData('width'),//NO I18N
					  height = node.getData('height'),//NO I18N
					  pos = this.getAlignedPos(node.pos.getc(true), width, height); 
				} 
	   }
    });
	
	// Function to create the Asset label HTML Dom
	CreateAssetHTML = function(label, node){
			//var criticalClass = (node.data.ciCritical) ? 	" node-critical":"";//NO I18N
			//var attrClass     = (node.data.ciAttribute)? 	" node-relattr" :"";//NO I18N
				 
			var isClosed = '';
			var isLastDependent = '';
			var isRecentReq='';
			var isMyRequest='';
			//Check whether the request is closed
			if(TaskDependency && node.data.status){  isClosed = checkIsClosed(node.data.ciType , node.data.status);	}
			//Check whether the node in dependency group is last dependent request
			if(TaskDependency && node.data.lastdependentwo){ isLastDependent = checkIsLastDependent(node.data.lastdependentwo);}
			//Check whether the request is archived
			if(TaskDependency && node.data.isarchived){ isClosed = checkIsArchived(isClosed, node.data.isarchived);}
			//Check whether the request is trashed
			if(TaskDependency && node.data.istrashed){ isClosed = checkIsTrashed(isClosed, node.data.istrashed);}
			//Check whether the user opened the dependency group from this request 
			if(TaskDependency && node.data.isrecentwo){ isRecentReq = checkIsRecent(node.data.isrecentwo);}
			//Check whether the request is assigned to logged-in tech
			if(TaskDependency && node.data.ismyrequest){
				isMyRequest = checkIsMyRequest(node.data.ismyrequest);
				if(isMyRequest === 'myrequest')
				{
					isMyRequest = '<div class="myrequest"></div>'; //NO I18N
				}
			}
			if(isClosed === 'completednode')
			{
				//If the request is closed then we will invoke closed icon
					isClosed='tick.svg'; //NO I18N
			}
			else if(isClosed === 'archivednode')
			{
				//If the request is archived then we will invoke archived icon
					isClosed='archived.svg'; //NO I18N
			}
			else if(isClosed === 'trashdnode')
			{
				//If the request is trashed then we will invoke trashed icon
					isClosed='trash.svg'; //NO I18N
			}
			else if(isClosed === '')
			{
				//If the request is involved none of above then there will be no icon
				isClosed = 'spacer.gif'; //NO I18N
			}
			
			var ciName		  = isMyRequest + '<div class="jit-assetnode-inner '+isRecentReq+'"><span class="jit-ciname"><span style="height: 10%; width: 10%;" class="fl"><img name="closedNodeImage" src="/images/' + isClosed +  '" style="width: 100%; height: auto;" class="ml3"></span>'+encodeHTML(truncate1(node.name, nameTruncateVal))+'</span></div>'; //NO I18N
			var ciType        = node.data.ciType?'<span class="jit-citype">'+encodeHTML(truncate1(node.data.ciType, 18))+'</span>':''; //NO I18N
			var buttons		  = '';//'<span class="ui-bt-expand" ><span class="expand_icon"></span></span>'; 		
			
			//var container = jQuery('<div title="'+node.name+'" />')//NO I18N
			//Need to change this fix.For workaround this done in js,need to check the css for IE.Issue Id:35094
			var style=''; //NO I18N

			if(TaskDependency){	style = style + 'top : -40%;';	} 
			var imgStr = "";
			if(node.data.imageIcon != null){ 	imgStr = '<img  src="'+encodeHTMLAttribute(node.data.imageIcon)+'" style="'+encodeHTMLAttribute(style)+'" class="icon" />';    }	//NO I18N

			var container = jQuery('<div />')//NO I18N
				.addClass('node-assetContainer')//NO I18N

				.append(imgStr) //Encoded in 498 line
				.append(encodeHTML(node.data.VIP))
				//.append('<img src="/images/exclamation.png" class="info_critical" />')//NO I18N
				.append('<div class="jit-assetnode '+isLastDependent+'" >'+	
						ciName+ciType+buttons+ //These are encoded in line no 488, 489 and 490
						'</div>'
					)//NO I18N 
				.on('mouseover', function(e){ 
					// a high-priority tip is already being displayed,
					// don't show this node's tip
					if ($infoData.blocked) return; 				
					
					if ($infoData.fadeTimer) resetTimer($infoData.fadeTimer);						
					resetTimer($infoData.hoverTimer);
					
					var self = this;
					
					$infoData.hoverTimer = setTimeout(
												function(){
														resetTimer($infoData.hoverTimer);	
														/*jQuery(self).find('.jit-assetnode')
															.animate({height:"40%", top:"50%"}, 400);*/
									
														showTip(node);																					
												}, infoProp.hoverTime);

					if ($infoData.hideTimer) resetTimer($infoData.hideTimer);						
					
					var self = this;
					//below code for self hidding the tool tip after the 4 secs.	
					$infoData.hideTimer = setTimeout(
												function(){
														resetTimer($infoData.hideTimer);
														hideTip();		
												}, 4000);

				})
				.on('mouseout', function(e){ 	   
					// a high-priority tip is already being displayed,
					// don't show this node's tip
					if ($infoData.blocked) return;
					
					if ($infoData.hoverTimer) resetTimer($infoData.hoverTimer);
					if ($infoData.hideTimer) resetTimer($infoData.hideTimer);
					resetTimer($infoData.fadeTimer);
					
					var self = this;
					
					$infoData.fadeTimer = setTimeout(
												function(){
														resetTimer($infoData.fadeTimer);	 
														/*jQuery(self).find('.jit-assetnode')
															.animate({height:"20%", top:"55%"}, 200);*/
									
														hideTip();																				
												}, infoProp.fadeTime);
					
				})
				.on('click', function(e){ 
					$activeNode = node.id;
					NODE_CLICKED.set(node.id, 1);					
					//console.log(node.anySubnode());
					if(TaskDependency){
						options.onNodeClick(node.id);
					} else {
						if(!node.anySubnode()){
							st.onClick(node.id); 
						}else{
							options.onNodeClick(node.id);
						}
					}
				})
				.appendTo(label);
			  
			  
			  jQuery(label)
					.addClass("assetElement");									//NO I18N 
				
			  options.onCreateHtmlNode(label, container, node.data);
			
	}
	//To check the I.E compatible version
	isCompatibleIEBrowser = function()
	{
		return true;
	}

	// Function to Create the Relation Html
	CreateRelationHTML = function(label, node){
				label.className = 'labelElement';												//NO I18N
				label.innerHTML   = '<div class="jit-relnode">'+encodeHTML(truncate1(node.name, 15))+'</div>';   //NO I18N 
				
	} 
	
	var loadSave = false;
	
	options.insertData = function(nodeId, rawData, onComplete){ 
			//console.log(this.isLoadingData());
			if(this.isLoadingData() || (this.currentNode() == nodeId)){	   
			 	//var assetId 	= this.getAssetId(nodeId),
				//console.log(rawData);
				var result  	= this.ProcessData(nodeId, rawData); 
			      	//console.log(result.toSource());	
				if(result){		
					if(onComplete){
						if(this.replot()) {
							st.addSubtree(result, 'replot'); //NO I18N
							//st.onClick(nodeId);
							this.clearReplot();
						}
						else {
							onComplete.onComplete(nodeId, result);  
						}
					}
					else{
						st.addSubtree(result, 'animate'); //NO I18N
						//st.onClick(nodeId);	
					}						
				}
				this.clearActiveNode();
			}
			if(onComplete)
				onComplete.onComplete();  				
	};
	
	options.isLoadingData = function(){
		return loadSave;
	};
	
	options.currentNode   = function(){ 
		return $activeNode;
	};
	
	options.ProcessData   = function(nodeId, data){
		ProcessRelations(data);
		return getJsonNode(nodeId);
	};
	
	options.clearActiveNode	= function(){
		$activeNode = null;	
	};
		
	options.getAssetId      = function(nodeId){
			return st.graph.getNode(nodeId).data.assetId;
	};
	
	options.hasNode		   = function(nodeId){
		return st.graph.hasNode(nodeId);
	}; 
	
	options.getNode		   = function(nodeId){
		return st.graph.getNode(nodeId);
	};
	
	options.replot = function() {
		return $replot;
	};

	options.clearReplot = function() {
		$replot = false;
	}
	// Getter method for getting all the assets in the graph
	options.getAssetsInView = function(){
		return ASSET_REL_LIST.keys();	
	};
	// Getter method for getting all the connected assets
	options.getConnectedAssets = function(assetId){  
		return ASSET_REL_LIST.get(assetId);
	};

    var animationDuration = 500;
    if(TaskDependency){ 	animationDuration = 0; 	}

    //Asset Spacetree
    //Create a new ST instance
    var st = new $jit.ST({
        //id of viz container element
        injectInto		: vizContainerId,
		orientation		: 'left',		  //NO I18N
        //set duration for the animation
	
        	duration   		: animationDuration,
	
		offsetX    		: 0,
		offsetY    		: 0,
		hideLabels		: false,
		constrained		: false,
		//used to restrict the leave nodes ajax on parent onClick method.
		callLeavesReqOnParentCall : false,
        //set animation transition type
        transition		: $jit.Trans.Quart.easeInOut,
		levelsToShow	: 2, 
        //set distance between node and its children
        levelDistance	: 30, 
        //enable panning
        Navigation: {
          enable:false,
          panning:true
        },
        //set node and edge styles
        //set overridable=true for styling individual
        //nodes or edges
        Node: { 
            type: 'none',				//NO I18N
            color: edgeColor.normal,	//NO I18N
            overridable: true,
			lineWidth: 1
        },
		// Setting Edge Styles
        Edge: {
            type: 'groupedbezier',		//NO I18N
            overridable: true,
			lineWidth: 1.5,
			color:edgeColor.normal  	//NO I18N
        },
		
		Events:{
			enable:true,
			onDragStart: function(node, eventInfo, e){				
				 this.mPressed = true; 
				 
				 this.pos = eventInfo.getPos();
				 var canvas = st.canvas,
					ox = canvas.translateOffsetX,
					oy = canvas.translateOffsetY,
					sx = canvas.scaleOffsetX,
					sy = canvas.scaleOffsetY;
				this.pos.x *= sx;
				this.pos.x += ox;
				this.pos.y *= sy;
				this.pos.y += oy; 
			},
			onMouseMove: function(node, eventInfo, e){
				 if(!this.mPressed) return;
				
				var thispos = this.pos, 
					currentPos = eventInfo.getPos(),
					canvas = st.canvas,
					ox = canvas.translateOffsetX,
					oy = canvas.translateOffsetY,
					sx = canvas.scaleOffsetX,
					sy = canvas.scaleOffsetY;
				currentPos.x *= sx;
				currentPos.y *= sy;
				currentPos.x += ox;
				currentPos.y += oy;
				var x = currentPos.x - thispos.x,
					y = currentPos.y - thispos.y;
					 
				st.config.offsetX += x * 1/sx;
				st.config.offsetY += y * 1/sy;				
				this.pos = currentPos; 
				st.canvas.translate(x * 1/sx, y * 1/sy);	
				$panned = true; 
			},
			onClick: function(node, eventInfo, e){
				 this.mPressed = false;	  
			},
			onMouseWheel: function(delta, e){
				if(options.preventMousewheel)   return;
				var val = 30 / 1000,
					ans = 1 + delta * val;
				scaleCanvas(ans, ans);
				if(e.preventDefault){
				    e.preventDefault();
				}else{
				    e.returnValue = false; 
				};
								
				//e.preventDefault();
			}
		},
        
        onBeforeCompute: function(node){
            //Log.write("loading " + node.name);
			//hideAttribInfo();
			//hideMoreInfo();
			hideTip();
			//console.clear();
			$('noDataMSG').hide(); 
			$('Loading').show();
			if(!TaskDependency)
			{
				if( $('actionMSG') ){        $('actionMSG').innerHTML = '';	}
			}
        },
        
        onAfterCompute: function(nodeId){
  			$('Loading').hide();	        
				//no need to show the no data message on save List
			if(!TaskDependency && nodeId && initNodeList.length == 0 && ALL_REL_LIST.get(nodeId) && ALL_REL_LIST.get(nodeId).children && ALL_REL_LIST.get(nodeId).children.toArray().length==0) {
				$('noDataMSG').show();
				setTimeout(function(){$('noDataMSG').hide()},2000);
			}
        },
        
        //This method is called on DOM label creation.
        //Use this method to add event handlers and styles to
        //your node.
        onCreateLabel: function(label, node){
            label.id 		= node.id;  
		
			if(!node.data.objType)
				CreateAssetHTML(label, node);				
			else
				CreateRelationHTML(label, node); 
			
			//if(scaleOffsetX != 1) 
			scaleLabel(node, label);
			if(!jQuery.browser.safari && isCompatibleIEBrowser() )
			{	
			jQuery(label)
				.on('mouseover', function(e){
					  node.setData("hover", 3);									//NO I18N
					  $hovered   = true;			
					  $hoverType = node.data.objType;
					  
					  var parentList   = [];
					  var childrenList = [];
					  
					  if(!$hoverType){   
							if(ALL_REL_LIST.get(node.id)) {
									ALL_REL_LIST.get(node.id).parents.keys().each(function(parent_Id){
										parentList.push(parent_Id); 
										ALL_REL_LIST.get(parent_Id).parents.keys().each(function(parentLVL2_Id){
											parentList.push(parentLVL2_Id); 													
										});
									});
								}
							
							parentList.each(function(nodeId){ 
									nodeObj = st.graph.getNode(nodeId);
									nodeObj.setData("hover", 1 + nodeObj.data.objType); //NO I18N
							})
							//node.setData("hover", 3);									//NO I18N
							// Setting Hover status for children Nodes
							if(ALL_REL_LIST.get(node.id)) {
								ALL_REL_LIST.get(node.id).children.keys().each(function(child_Id){
										childrenList.push(child_Id); 
										ALL_REL_LIST.get(child_Id).children.keys().each(function(childLVL2_Id){
											childrenList.push(childLVL2_Id); 													
										});
								});
							}
							childrenList.each(function(nodeId){ 
									nodeObj = st.graph.getNode(nodeId);
									if(nodeObj){
										nodeObj.setData("hover", 5 - nodeObj.data.objType);	//NO I18N
									}
							});								
					  }else{
                    					
						  // while mouseover the connections...

						  if(ALL_REL_LIST.get(node.id)) {
							ALL_REL_LIST.get(node.id).parents.keys().each(function(parent_Id){
									parentList.push(parent_Id);
								    parentNode = st.graph.getNode(parent_Id);
									parentNode.setData("hover", 2);						//NO I18N
							});
							
							ALL_REL_LIST.get(node.id).children.keys().each(function(child_Id){ 
									childrenList.push(child_Id);
									childNode = st.graph.getNode(child_Id); 
									if(childNode){
										childNode.setData("hover", 4);//NO I18N
									}
							});
						  }
					  }
					  this.hoverList = parentList.concat(childrenList);
					  st.plot();
				})
			   .on('mouseout', function(e){
					  node.setData("hover", 0);		//NO I18N									
					  $hovered = false;		
					  if(this.hoverList){ 
						  this.hoverList.each(function(nodeId){
							  if(st.graph.getNode(nodeId)){
								st.graph.getNode(nodeId).setData("hover", 0);//NO I18N
							  }
						  });
					  }
					  st.plot();								
				});
			}
        },
		//Add a request method for requesting on-demand json trees.   
		//This method gets called when a node  
		//is clicked and its subtree has a smaller depth  
		//than the one specified by the levelsToShow parameter.  
		//In that case a subtree is requested and is added to the dataset.  
		//This method is asynchronous, so you can make an Ajax request for that  
		//subtree and then handle it to the onComplete callback.  
		//Here we just use a client-side tree generator (the getTree function).  
		request	  		: options.onNodeClick,		
		ProcessData		: options.ProcessData,		
		getAssetId		: options.getAssetId,		
		hasNode			: options.hasNode,		
		isLoadingData	: options.isLoadingData,
		currentNode 	: options.currentNode,
		clearActiveNode	: options.clearActiveNode,	
		// Getter method for getting all the assets in the graph
		getAssetsInView : options.getAssetsInView,
		// Getter method for getting all the connected assets
		getConnectedAssets : options.getConnectedAssets,		
		insertData 		: options.insertData, 
		getNode			: options.getNode,
		replot			: options.replot,
		clearReplot		: options.clearReplot,
		       
        //This method is called right before plotting
        //a node. It's useful for changing an individual node
        //style properties before plotting it.
        //The data properties prefixed with a dollar
        //sign will override the global node style properties.
        onBeforePlotNode: function(node){ 
            //add some color to the nodes in the path between the
            //root node and the selected node.		 
				if($hovered && node.getData("hover") && !st.busy){//NO I18N
					var nodeLabel = st.labels.getLabel(node.id);
					if(nodeLabel){
						$(nodeLabel).addClassName("node-active");//NO I18N
						$(nodeLabel).removeClassName("node-adj");//NO I18N
						if(node.data.objType){
							node.data.$color 	 = edgeColor.hover;
							node.data.$lineWidth = 2;						
						} 
					}
				}
				/*
				else if (node.selected) {  
					var nodeLabel = st.labels.getLabel(node.id);
					if(nodeLabel){
						$(nodeLabel).addClassName("node-active");
						$(nodeLabel).removeClassName("node-adj");
						
						node.data.$color 	 = edgeColor.selected;
						node.data.$lineWidth = 2;
						
						node.eachAdjacency(function(adj) { 
							var adjNodeLabel = st.labels.getLabel(adj.nodeTo.id);						
							if(adjNodeLabel){
								$(adjNodeLabel).addClassName("node-adj");	
								adj.nodeTo.data.$color 	   = edgeColor.selected;
								adj.nodeTo.data.$lineWidth = 2;
							} 
						});   
					}
					
				}*/
				else {
					delete node.data.$color;
					delete node.data.$lineWidth;
					//if the node belongs to the last plotted level
					var nodeLabel = st.labels.getLabel(node.id);
					if(nodeLabel){
						$(nodeLabel).removeClassName("node-active");//NO I18N
						$(nodeLabel).removeClassName("node-adj");//NO I18N
					} 
				}
			 
        },
		
		onAfterPlotNode: function(node){
			
		}, 
        //This method is called right before plotting
        //an edge. It's useful for changing an individual edge
        //style properties before plotting it.
        //Edge data proprties prefixed with a dollar sign will
        //override the Edge global style properties.
        onBeforePlotLine: function(adj){
 
        },
		onAfterPlotLine: function(adj){
 
		}
    });
	
	var initNodeList = options.saveList||[];
	var notInTree    = [];
	var loadSaveData = function(type){
		if(initNodeList.length){
			var index 	= 0;
			var nodeId 	= getNodeId(initNodeList[index]);
			$activeNode = nodeId;
			if(st.graph.hasNode(nodeId)){ 
				 if(type){
						st.onClick(nodeId, {onComplete:function(){ 
														initNodeList.splice(index, 1);
														loadSaveData(type);
												}});
				 }else{
						st.select(nodeId);
						initNodeList.splice(index, 1);
						loadSaveData(type);
				 }
			}			
			else{
				notInTree.push(initNodeList[index]);
				initNodeList.splice(index, 1);
			}

			if( TaskDependency && ( options.saveList.length  == (index+1) ) ){	loadPreviousDependencyState();		}
		}else if( TaskDependency ){
		
			var maxHeight = 0;
			var maxWidth = 0;
			var minleft = 0;
			var maxleft = 0;
			var minTop = 0;
			var maxTop = 0;
			
			var window_Height = jQuery(window).height();
			var window_Width = jQuery(window).width();
			
			var assetElements = parent.jQuery('#cmdbViz-label').find('.assetElement');

			//console.log('here-->'+assetElements.length);
			for(var i = 0;i<assetElements.length;i++){
			
				var assetElement = assetElements[i];

				var thisLeft = parseInt( assetElement.style.left , 10);
				var thisTop = parseInt( assetElement.style.top , 10);

				//console.log('here-->'+thisLeft + '---->'+thisTop);

				if(minleft === 0){	minleft = thisLeft; 	}
				if(minTop === 0){	minTop = thisTop; 	}

				if(thisLeft < minleft){	minleft = thisLeft;	}
				if(thisLeft > maxleft){	maxleft = thisLeft;	}
				if(thisTop < minTop){	minTop = thisTop;	}
				if(thisTop > maxTop){	maxTop = thisTop;	}

				//console.log('thisLeft-->'+minleft + '---->'+maxleft);
				//console.log('thisTop-->'+minTop + '---->'+maxTop);
			}

			maxWidth = maxleft - minleft;
			maxHeight = maxTop - minTop;
			
			//console.log('maxWidth-->'+maxWidth);
			//console.log('maxHeight-->'+maxHeight);
			
			// we will minimize the height and width since we need will ZoomOut the map using scaleCanvas(0.7,0.7);
			maxWidth = maxWidth - ( (maxWidth*3)/10);
			maxHeight = maxHeight  - ( (maxHeight*3)/10) ;

			if(maxHeight < window_Height){	maxHeight = window_Height; }
			if(maxWidth < window_Width){	maxWidth = window_Width }

			//console.log('maxWidth-->'+maxWidth);
			//console.log('maxHeight-->'+maxHeight);

			// position of the root node will get shifted after st.canvas.resize(maxWidth , maxHeight)..
			var rootHeight_1 = parseInt( parent.jQuery('#cmdbViz-label').find('#0')[0].style.top , 10);
			var rootLeft_1 = parseInt( parent.jQuery('#cmdbViz-label').find('#0')[0].style.left , 10);

			st.canvas.resize(maxWidth , maxHeight);
			
			parent.jQuery("#cmdbViz").css('height',maxHeight+"px");//NO I18N
			parent.jQuery("#cmdbViz").css('width',maxWidth+"px");//NO I18N
		
			var rootHeight = parseInt( parent.jQuery('#cmdbViz-label').find('#0')[0].style.top , 10);
			var rootLeft = parseInt( parent.jQuery('#cmdbViz-label').find('#0')[0].style.left , 10);

			//console.log('rootHeight-->'+rootHeight+'---->'+rootHeight_1);
			//console.log('rootLeft-->'+rootLeft +'--->'+rootLeft_1);
				
			// this calculation will adjust the root node position so that map will be positioned within the visible page...
			// to avoid the dragging..
			
			if( maxHeight <= window_Height  ){ 	rootHeight = 0;
			
			}else{	rootHeight = (maxHeight - rootHeight ) - ( (maxTop - rootHeight_1)*0.8 ) ; 	}

			if(maxWidth <= window_Width){	rootLeft = (rootLeft_1 * 0.8) - window_Width;
		
			}else{	rootLeft = (maxWidth - rootLeft) - ((maxleft - rootLeft_1)*0.9 );	}

			//this will drag the root element to the place so that map will fit the height and width of the canvas..
			st.canvas.translate(rootLeft,rootHeight, true);

			// to zoomout the map..
			scaleCanvas(0.6,0.6);

			$('Loading').hide();

			// to move the scroll to the root element..
			var scrollToElement = '#0';
			if( TaskDependency.baseTask !== null){ 		scrollToElement = '#'+TaskDependency.baseTask;		}

			jQuery(window).scrollTop( parseInt( parent.jQuery('#cmdbViz-label').find(scrollToElement)[0].style.top , 10) - 75 );
			jQuery(window).scrollLeft( parseInt( parent.jQuery('#cmdbViz-label').find(scrollToElement)[0].style.left , 10) - window_Width/2 );

			// declared in taskdependenciesmap.jspf this will avoid the movement of nodes on clicking the same..
			mapRendered = true;	
			
			if(TaskDependency.exportPDF != null && TaskDependency.exportPDF.toString() == "true"){
			
				parent.jQuery('[name="closedNodeImage"]').each(function(){

					if(parent.jQuery(this).attr('src').indexOf('tick') != -1){

						parent.jQuery(this).removeAttr('src').attr('src', '/images/spacer.gif');	//NO I18N
						parent.jQuery(this).removeClass('ml3').addClass('ui-button-add3');

						var parentSpan = parent.jQuery(this).parents('span')[0];
						parent.jQuery(this).removeAttr('style');	//NO I18N
						parent.jQuery(parentSpan).removeAttr('style');	//NO I18N
					}
				});
			} else{
			
				parent.document.exportasPDFForm.pagewidth.value = parent.jQuery('#cmdbViz-canvas').width();
				parent.document.exportasPDFForm.pageheight.value = parent.jQuery('#cmdbViz-canvas').height();
			}
			var clientTimeEnd = (new Date()).getTime();
			clientTime = clientTimeEnd-clientTime;
		}
		return; 
		/*st.onClick(st.root, {onComplete:function(){
				MASTER_TREE.each(function(node){
					if(node.key != "tree" && node.key != ROOT_ID){
							console.log(node.key);
							var n = getJsonNode(node.key);
							if(options.loadAnimated)
								st.onClick(node.key);
							else
								st.addSubtree(n, 'replot');					//NO I18N 
								//st.select(pair.key);
					}
					 
				});					 								
		}});*/
		
	}
	
	var init = function(){ 	  
		if(options.initFeed){
			// Process the feed that is coming in 
			ProcessRelations(options.initFeed);	 			  			
			// Load the Primary node onto the Tree
			st.loadJSON(MASTER_TREE.get(ROOT_ID));	  			
			//compute node positions and layout
			st.compute();
			//optional: make a translation of the tree
			st.geom.translate(new $jit.Complex(-200, 0), "current");//NO I18N 
			//emulate a click on the root node.
			//st.config.duration = 100;
			$activeNode = st.root;
		st.onClick(st.root,  {Move: {  
      					enable: true,  
      					offsetX: 300,  
      					offsetY: 0  
    					},
					onComplete:function(){	
										loadSave = true;
 										loadSaveData(options.loadAnimated);	 
										loadSave = false;
								 }}); 
			
		
					 
			//st.config.duration = 500; 
		}  
		if(options.onInit)
			options.onInit(st); 
	};
	init();
	floatingmenubarscroll();
       	

 	$infoPanel
		.on('mouseover', function(e){
				if($infoData.fadeTimer)
					 resetTimer($infoData.fadeTimer); 
				if($infoData.hoverTimer)
					 resetTimer($infoData.hoverTimer);		
			})
		.on('mouseout', function(e){
				if($infoData.blocked)	  	 return;
				
				if($infoData.fadeTimer){
					resetTimer($infoData.fadeTimer);
				}				
				if($infoData.hoverTimer){
					resetTimer($infoData.hoverTimer);
				}	
				
				$infoData.fadeTimer = setTimeout(
											function(){
												resetTimer($infoData.fadeTimer);
												hideTip();
											}, infoProp.fadeTime		 
										);
			});
	
	/* Display attribute information */
	function showAttribInfo(node){
		if(st.busy) 					return; 
		
		hideMoreInfo();
		
		var nodeElement 		= st.labels.getLabel(node.id);
		
		
		if(node.data.ciAttribute){
			for(x in node.data.ciAttribute)
				$attrInfo.html("<li>"+x+": "+ encodeHTML(node.data.ciAttribute[x])+"</li>");//NO I18N
		}
		
		var cssConfig 			= {		
										left	: 	parseInt(nodeElement.style.left),
										top		:	parseInt(nodeElement.style.top)
								  };
		
		$attrPanel.css(cssConfig).show(300);
	}
	
	function hideAttribInfo(){
		if($attrPanel)
			$attrPanel.hide();
	}

	/* Display more information */
	function showMoreInfo(node){
		if(st.busy) 					return; 
		
		hideAttribInfo();
		
		var nodeElement 		= st.labels.getLabel(node.id);
		
		
		if(node.data.ciAttribute){
			for(x in node.data.ciAttribute)
				$attrInfo.html("<li>"+x+": "+ encodeHTML(node.data.ciAttribute[x])+"</li>");//NO I18N
		}
		
		var cssConfig 			= {		
										left	: 	parseInt(nodeElement.style.left),
										top		:	parseInt(nodeElement.style.top)
								  };
		
		//$morePanel.css(cssConfig).show(300);
	}
	/*
	function hideMoreInfo(){
		if($morePanel)
			$morePanel.hide();
	}*/
	
	/*	Displays available information about an Asset-Node in a DOM panel */ 
	function showTip(node, block){
		
		if(st.busy) 					return;
		
		// Check if the current tip is already shown
		if($infoData.nodeId == node.id)	return;
		
		if(block)						$infoData.blocked = true;
		 
		$infoData.nodeId 		= node.id;
		
		var nodeElement 		= jQuery(st.labels.getLabel(node.id));
		var citype = node.data.ciType ? encodeHTML(node.data.ciType):''; //NO I18N
	
		if(TaskDependency){
			$infoPanel.find(".desc_title").html(
			
				getNodeHoverHTML(node,citype)

					 		).on('click', hideTip);//NO I18N

		}else{
			$infoPanel.find(".desc_title")//NO I18N
                    .html("<img src='"+node.data.imageIcon+"' width='48px' height='48px'  />"+  //NO I18N
                          node.data.VIP+
                          "<h2>"+citype+"</h2>" +//NO I18N
                          "<a class='desc-title-link' href='/' rel='noopener' sdphrefJs='js-href-asset-viz-0' data-id="+node.data.ciid+" data-api-name='"+node.data.api_plural_name+"'>"+encodeHTML(node.name)+"</a>").on('click', hideTip);//NO I18N
						  if(!node.data.canview || (node.data.canview && node.data.canview == 'true' )){
            jQuery("[sdphrefJs='js-href-asset-viz-0']").off('click').on('click', function(e){  //NO I18N
                ViewCIInfo(this.getAttribute('data-id'), this.getAttribute('data-api-name'));
				jQuery("#ASSET_DESC_PANEL").hide();
            });
						  }
		}

		var incidentDisplay = $infoPanel.find(".desc_moreinfo");//NO I18N
			incidentDisplay.html("");


		if(node.data.ciIncident){
			var liList = "";
			
			jQuery.each(node.data.ciIncident, function(index, value){
							liList += "<li>"+encodeHTML(value)+"</li>";//NO I18N
						});
			
			incidentDisplay
					.html("<h4>Incidents</h4><ul>"+liList+"</ul>");//NO I18N
		}
		
		var nodePos = nodeElement.position();
		var bottom  = nodePos.top+nodeElement.height();
		
		
		//console.log(bottom+" "+ jQuery(document).height());
		
		
		
		if(node.data.ciAttribute){
			for(x in node.data.ciAttribute)
				$attrInfo.html("<li>"+x+": "+ encodeHTML(node.data.ciAttribute[x])+"</li>");//NO I18N
		}
		var paddingTop = jQuery('td.work_viewshade:visible').css('padding-top');//NO I18N
		
		if(popup) paddingTop=undefined;
		
		var trimTopVal=-6;

		var topVal = paddingTop ? nodeElement.position().top + +paddingTop.substr(0,paddingTop.indexOf('px'))+trimTopVal:nodeElement.position().top;

		var cssConfig 			= {     
										top		: topVal,
										display : 'block',//NO I18N
										left	: nodeElement.css('left')//NO I18N
							}; 					  
								  
		var animateConfig 		= {		
										//left	: 	parseInt(nodeElement.style.left), 
										opacity :   1 
							};
		
		$infoPanel.stop().css(cssConfig);
		
		$infoPanel.animate(animateConfig, 300, function(){
														$infoData.blocked = false;
												}); 
		
		options.onShowTip(node);
	}
	
	/* Fade the panel away */
	function hideTip(){
		$infoData.nodeId = null;
		$infoPanel.stop()
				  .animate({ "opacity": 0 }, 300,  function(){//NO I18N
													$infoPanel.css("display", "none");//NO I18N
												});
	}
	// Primary scale is in terms of 1 meaning 100%
	// All additional scalling will be done in terms of decimal percentages
	var scaleOffsetX = 1;
	var scaleOffsetY = 1;	
	
	jQuery('#zoomin')//NO I18N
			.on('click', function(){ 
				 // Relatively Scaling the canvas and its labels by 110% 
 				 scaleCanvas(1.1, 1.1);		 
			});
			
	jQuery('#zoomout')//NO I18N
			.on('click', function(){  
				 // Relatively Scaling the canvas and its labels by 90% 							
				 scaleCanvas(0.9, 0.9);
			});
			
	jQuery('#zoomreset')//NO I18N
			.on('click', function(){   
				 resetCanvas();
			});
			
	function resetCanvas(){
		canvasContainer = jQuery("#"+vizContainerId);//NO I18N
		st.config.offsetX = 0;
		st.config.offsetY = 0;
		st.canvas.resize(canvasContainer.width(), canvasContainer.height());
		scaleOffsetX = 1;
		scaleOffsetY = 1; 
		// Scaling the labels
		scaleLabels();
	}

	function scaleCanvas(scalex, scaley){   
			// Scaling the canvas data
			st.canvas.scale(scalex, scaley);
		
			// Scale offset tracks the total percentage the canvas has scaled till now
			scaleOffsetX *= scalex;
			scaleOffsetY *= scaley; 
			
			// Scaling the labels
			scaleLabels();				 
	}
	
	// Scaling the Label elements by increasing a with:height and placing a margin value so that it overlaps the bitmap element
	function scaleLabels(){
				jQuery.each(st.labels.labels, function(index, value){
					  var node = st.graph.getNode(this.id);					  
					  scaleLabel(node, this);
			  });
	}
	
	// Code for scaling a particular label element
	function scaleLabel(node, labelElement){
		    // Checking if a node exits for the particular label
			if(!node) return;
			
			// Scaling is done with respect to the actual nodes width and height
			var pw = node.getData('width'), //NO I18N
				ph = node.getData('height'),//NO I18N
				dw = parseInt(pw * scaleOffsetX),
				dh = parseInt(ph * scaleOffsetY),
				fs = 100*scaleOffsetX;
				pos = jQuery(labelElement).position();
			
			// Moving the pivot point to the center of the Dom Label element then calculating the additional margin that should be applied because of the scaling
			pos.left = parseInt((pw/2) - (dw/2)).ceil();
			pos.top  = parseInt((ph/2) - (dh/2)).ceil();
			
			// Appling scaled values to the label element
			jQuery(labelElement).css({
								  marginLeft : pos.left, marginTop : pos.top, 	// Margin values are added to propely position the values 
								  width 	 : dw	   , height	   : dh,	    	// Scaled width and height
								  fontSize	 : fs+'%'//NO I18N
							 });									
	} 
	
	window.onresize = function(e){	
		var tempScale = {x:scaleOffsetX, y:scaleOffsetY};
  		resetCanvas();	
		scaleCanvas(tempScale.x, tempScale.y);
  	}

// Returning Object processing information
	return {
		getNodeList : function() {
			return ASSET_REL_LIST.keys();
		},
		getRelList : function() {
			return ASSET_REL_LIST;
		},
		getParentList : function(nodeid) {
			return ALL_REL_LIST.get(nodeid).parents.keys();
		},
		getChildList : function(nodeid) {
			return ALL_REL_LIST.get(nodeid).children.keys();
		},
		getGraphNode : function(nodeid) {
			return ALL_REL_LIST.get(nodeid).children.keys();
		},
		setHoverList : function(list) {
			this.hoverList = list ;
		},
		setHovered : function() {
			$hovered   = true;
		},
		
		plot : function() {
			st.plot() ;
		},
		isRendered : function(nodeId) {
			if(ASSET_REL_LIST.get(nodeId)) return true; else return false;	     
		},			    
		addRelation : function(nodeId, data){
			//loadSave = true;			
			ProcessRelations(data);
			var result = getJsonNode(nodeId);						
			//console.log(result);	
			st.addSubtree(result, 'replot'); //NO I18N
			st.onClick(nodeId);
			//loadSave = false;			
		}, 
		clickNode : function(nodeId){
			$activeNode = nodeId;
			$replot = true;
			st.onClick(nodeId);
		},
		getSaveData : function(){
			return {root:st.root, nodes:NODE_CLICKED.keys()};	
		},
		reInit 	: function() {
			MASTER_TREE = $H({'tree': []});
	 		MOREEDGELIST		= $H({'edges': []}), 				//NO I18N				// List of additional edges on the order that the data has been processed
			ASSET_REL_LIST	   	= $H(),														// All asset relations in the view and list of all assets in view
			ALL_REL_LIST 		= $H(),														// All node relations in the view
			RELATION_HASH_LIST	= $H();														// Relation ids processed till now.
			INCOMING_DATA		= $A();														// Json feed of incoming data
			NODE_CLICKED 		= $H();
		},
		st		   : st,
		infoPanel	   : $infoPanel,
		infoData	: $infoData,
		json 	   : INCOMING_DATA
	};
}



