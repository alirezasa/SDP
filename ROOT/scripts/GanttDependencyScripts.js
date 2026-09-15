//$Id$
var taskDependenciesJson;

function drawGanttDependencies(){

	taskDependenciesJson = ganttProperties.taskDependency;

	drawTaskDependencies();
}

function getTaskIds(){

	var taskIDs = [];

	for(var taskID in ganttProperties.tasksJSON){
		taskIDs.push(taskID);
	}

	return taskIDs;
}

function drawTaskDependencies(){

	for(var parent in taskDependenciesJson){

		for(var i=0;i < taskDependenciesJson[parent].length;i++){

			if(gantbardir == 'left'){
				drawDependencyForIds('#s_task_'+parent,'#s_task_'+taskDependenciesJson[parent][i]);
			}
			else{
				drawDependencyForIds('#s_task_'+taskDependenciesJson[parent][i],'#s_task_'+parent);
			}
		}
	}
}

function drawDependencyForIds(parentTaskId,childTaskId){

	var parentTaskSpan = jQuery(parentTaskId),
		childTaskSpan = jQuery(childTaskId);

	if(parentTaskSpan.length == 0){	
		childTaskSpan.append('<i class="line timeline-before"></i>');
		return;
	}

	if(childTaskSpan.length == 0){	
		parentTaskSpan.append('<i class="line timeline-after"></i>');
		return;
	}

	parentTaskSpan.append('<i class="line"><i class="before"></i><i class="after"></i></i>');
	
	childTaskSpan.append('<i class="line"><i class="before"></i><i class="after"></i></i>');

	parentTaskSpan.siblings('.gantt-barview-span-taskinfo,.gantt-barview-span-ownerinfo').addClass('has-dependency');	//No I18N
	childTaskSpan.siblings('.gantt-barview-span-taskinfo,.gantt-barview-span-ownerinfo').addClass('has-dependency');	//No I18N

	var parent_left = parentTaskSpan.offset().left+8.5,
		parent_top = parentTaskSpan.offset().top,
		parent_bottom = parent_top+parentTaskSpan.outerHeight(),
		parent_width = parent_left+parentTaskSpan.outerWidth(),

		child_left = childTaskSpan.offset().left-8.5,
		child_top = childTaskSpan.offset().top,
		child_bottom = child_top+childTaskSpan.outerHeight(),
		width = (child_left-parent_width+1)/2,
		parentLine = parentTaskSpan.find('.line').eq(-1),
		childLine = childTaskSpan.find('.line').eq(-1);

	if((child_left>=parent_width)&&!(parent_top>child_top)){
		parentLine.attr('data-id',childTaskId).css({top: 5, height: 10, right:'-10px'})	//NO I18N
						 .find('.before').css({width:'8px',right:0}).end()	//NO I18N
						 .find('.after').css({width:width,left:0});
		childLine.attr('data-id',parentTaskId).addClass('turn-line').css({top:'auto', bottom: 4, height: child_bottom-parent_bottom-10, left:'-10px'})	//NO I18N
						 .find('.before').css({width:'8px',left:0}).end()	//NO I18N
						 .find('.after').css({width:width,right:0});
		if(parent_top==child_top){
			parentLine.attr('data-id',childTaskId).addClass('turn-line').css({top: 5, height: 10, right:'-10px'})	//NO I18N
							 .find('.after').css({width:'8px',right:0, left: 'auto'}).end()	//NO I18N
							 .find('.before').css({width:width,left:0});

			childLine.attr('data-id',parentTaskId).css({top: 5, height: 10, left:'-10px'})	//NO I18N
							 .find('.after').css({width:'8px',left:0}).end()	//NO I18N
							 .find('.before').css({width:width,right:0,left:'auto'});	//NO I18N
			if(gantbardir == 'right'){
				parentLine.find('.before').css('right',-width);	//NO I18N
				childLine.find('.after').css('right','-8px');	//NO I18N
			}
		}
	}
	else if(parent_top>child_top){
		parentLine.attr('data-id',childTaskId).css({top:'auto', bottom: 5, height: parent_bottom-child_bottom-10, right:'-10px'})	//NO I18N
						 .find('.after').css({width:'8px',right:0}).end()	//NO I18N
						 .find('.before').css({width:width,left:0});
		childLine.attr('data-id',parentTaskId).addClass('turn-line').css({top: 4, height: 10, left:'-10px'})	//NO I18N
						 .find('.after').css({width:'8px',left:0}).end()	//NO I18N
						 .find('.before').css({width:width,right:0});

		if(parent_width>=child_left){
			parentLine.find('.before').css({width:-width+1,left:width-1});
			childLine.find('.before').css({width:-width+1,right:width-1});
		} 
	}
	else{
		parentLine.attr('data-id',childTaskId).css({top: 5, height: 10, right:'-10px'})	//NO I18N
						 .find('.before').css({width:'8px',right:0}).end()	//NO I18N
						 .find('.after').css({width:-width,left:width});
		if(parent_top==child_top){
			childLine.attr('data-id',parentTaskId).addClass('turn-line').css({top:4, height: 11, left:'-10px'})	//NO I18N
						 .find('.before').css({width:-width+1,right:width-1}).end()
						 .find('.after').css({width:'8px',left:0});	//NO I18N
		}
		else{
			childLine.attr('data-id',parentTaskId).addClass('turn-line').css({top:'auto', bottom: 4, height: child_bottom-parent_bottom-10, left:'-10px'})	//NO I18N
							 .find('.before').css({width:'8px',left:0}).end()	//NO I18N
							 .find('.after').css({width:-width+3,right:width-3});
		}
	}
}

function ganttTitleOnHover(){

	jQuery('.gantt-barview-span-taskinfo,.gantt-barview-span-ownerinfo').on('mouseenter', function(event){

		if(ganttProperties.bar_hover != null && ganttProperties.bar_hover != jQuery(this).parent().attr('id')){	return;	}

		ganttProperties.actionEntityid = jQuery(this).parent().attr('entityid');

		jQuery('.gantt-barview-span').removeClass('gantt-barview-h');
		jQuery('.gantt-barview-span-taskinfo,.gantt-barview-span-ownerinfo').removeClass('gantt-barview-taskinfo-h');

		jQuery('i.line').hide();
		jQuery(this).addClass('gantt-barview-taskinfo-h');

		jQuery(this).siblings('.proj-gantt-infopop').hide();	//No I18N
		jQuery(this).siblings('.gantt-barview-span').addClass('gantt-barview-h');	//No I18N

		var depLines = jQuery(this).siblings('.gantt-barview-span').find('i.line');	//No I18N

		for(var i = 0; i < depLines.length; i++){
			jQuery(depLines[i]).show().addClass('line-hover');
			var id = jQuery(depLines[i]).parent().attr('id');

			var data_id = jQuery(depLines[i]).attr('data-id');
			jQuery(data_id).addClass('gantt-barview-h');
			jQuery(data_id).find('[data-id=#'+id+']').show().addClass('line-hover');
		}
		showGanttPopup = false;
	}).on('mouseleave', function(e){

		if(ganttProperties.bar_hover != null  && ganttProperties.bar_hover != jQuery(this).parent().attr('id')){	return;	}

		jQuery(this).siblings('.proj-gantt-infopop').show();	//No I18N
		jQuery('i.line').show();

		var depLines = jQuery(this).siblings('.gantt-barview-span').find('i.line');	//No I18N

		for(var i = 0; i < depLines.length; i++){

			jQuery(depLines[i]).removeClass('line-hover');
			var id = jQuery(depLines[i]).parent().attr('id');

			var data_id = jQuery(depLines[i]).attr('data-id');
			jQuery(data_id).removeClass('gantt-barview-h');
			jQuery(data_id).find('[data-id=#'+id+']').removeClass('line-hover');
		}
		showGanttPopup = true;
	});

	jQuery('i.line').on('mouseenter mouseleave',function(e){
		e.stopPropagation();
	});
}