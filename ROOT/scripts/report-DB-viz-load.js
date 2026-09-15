//$Id$
function getDataModel( req, module) {alert(req.responseText);}
var aviz ;
	jQuery(document).ready(function(event){
								var basicData=JSON.parse(testing);
								var tempData = basicData.id.split(";")[0];
								if(tempData=="" || !tempData)
								{
								jQuery("#ASSET_DESC_PANEL").css("display","block"); //No I18N
								}
								tempData = basicData[tempData];
								tempData.fromId = "root";//No I18N
								JsonProxy = {root:[tempData]}	
					var config = {
								initFeed 	 		: JsonProxy.root, 						 
								//loadAnimated 		: $('Animated_replot').checked,
								saveList 			: ['assetId02', 'assetId03', 'assetId04'],//No I18N
								// Function to initiate when a node has been clicked
								onNodeClick			: function(nodeId, level, onComplete){
													//console.log(nodeId);
													var columns = this.getNode(nodeId).data.columns,clickedColumn,colName,tableId=nodeId;
													//console.log(columns);
													for(key in columns) {
														if(columns[key].isClicked) { 
															clickedColumn = columns[key];
															colName = key;
														}
													}
													
													//console.log(colName);
													
													if(clickedColumn) {
														var fVal;
														var colM = fetch[tableId.substring(2)];
														if(colM != null)
														{
															var tM = clickedColumn['colId'];
															var arr = colM[tM.substring(2)];
															if( arr != null)
															{
																fVal =  (typeof sdpToJSON != 'undefined') ? sdpToJSON(arr) : JSON.stringify(arr) ; //NO I18N
															}
															else
															{
																fVal = '[]';//No I18N
																// fVal = 'no';//No I18N
															}
														}
														else
														{
															// fVal = 'no';//No I18N
															fVal = '[]';//No I18N
														}
														clickedColumn.isClicked=false;
														if(clickedColumn.isPK) {
															param ="action=getFKDetails&columnType=PK&columnid="+clickedColumn['colId']+"&colmnName="+colName+"&tableId="+tableId+"&fetch="+fVal;//No I18N
														}
														else if(clickedColumn.isFK) {
															param ="action=getFKDetails&columnType=FK&columnid="+clickedColumn['colId']+"&colmnName="+colName+"&tableId="+tableId+"&fetch="+fVal;//No I18N
														}
														that = this;										
														jQuery.ajax({
														  url: '/servlet/DBVizAJaxServlet',//No I18N
														  dataType: 'json',//No I18N
														 data: encodeURI(param),
														  success: function(data){ 
																		//console.log(data);
																		if(data.hasOwnProperty('error')) 
																		{
																			$('Loading').hide(); 
																			alert('No Further Links, Reload to Continue');//No I18N
																		}
																		else
																		{
																			var rawData = new Array();
																			var tableIds=data.id.split(';');
																			for(var ind=0;ind<tableIds.length;ind++) {
																				if(tableIds[ind] && jQuery.inArray(data[tableIds[ind]].name,hiddenTables) === -1)
																					rawData[ind] = data[tableIds[ind]] ;
																			}
																			//console.log(rawData);
																			that.insertData(tableId,rawData,onComplete);
																		}
																	}
														  });

													}
													else{
														this.insertData(nodeId, JsonProxy[nodeId], onComplete); 													
													}
												},
						onColumnClick			: function(columnObj){	 
											var isFK = columnObj.attr('isFK'),colId = columnObj.attr('colId'),colName=columnObj.attr('colName'),tableId = columnObj.attr('tableId');
											//console.log(isFK);
											//console.log(colId);
											//console.log(colName);
											//console.log(tableId);
											//jQuery.getJSON(url,props,fn(data));
											//jQuery.getJSON('/servlet/AJaxServlet?action=getFKDetails&columnType=FK&columnid='+colId,{},function(jsonData){console.log(jsonData)});
											that = this;
											param ="action=getFKDetails&columnType=FK&columnid="+colId+"&colmnName="+colName+"&tableId="+tableId;//No I18N
											jQuery.ajax({
											  url: '/servlet/AJaxServlet',//No I18N
											  dataType: 'json',//No I18N
											  data: encodeURI(param),
											  success: function(data){/*console.log('test1');console.log(data[data.id].toSource());*/that.insertData(tableId,new Array(data[data.id]));}
											  });
											
											  },
											  
						onShowTip			: function(node){
												//console.log(resetTimer);														
												var moreInfo = jQuery('#CI_MORE_PANEL').empty().hide(); 
												 
												if(node.data.ciCritical){
													if(!node.data.showHtml){
														resetTimer(this.Interval); 
														moreInfo.addClass('loading').show();
														
														this.Interval	= setTimeout(function(){
																						var returnData = CriticalData[node.id]
																							showString = "";	
																							for(title in returnData){
																								showString += "<h2>"+title+"</h2>";	
																								showString += "<ul class='ci_attribute'>";
																								returnData[title].each(function(list){
																									showString += "<li><a href='#'>"+list+"</a></li>";								
																								});	
																								showString += "</ul>";
																							}
																						node.data.showHtml = showString;	
																						moreInfo.html(showString)
																								.removeClass('loading');
																					}, 1000);
													}else{
														moreInfo.html(node.data.showHtml).show();
													}
												}
											  },
						onCreateHtmlNode    : function(label, container, data){
													if(data.ciCritical){
														jQuery(label).addClass('node-critical'); 
														jQuery(container).append('<img src="'+data.ciCritical+'" class="info_critical" />')
													}	
											  }
					};
					 
		aviz = new CreateViz('cmdbViz', config);  //No I18N
	});
