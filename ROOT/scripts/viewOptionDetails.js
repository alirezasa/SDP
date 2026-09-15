/* $Id:$ */
//JS File contains changes related to Resource-Question Option Details(Image,Cost,description) in a dialog
let dialogOpen = false;
var optionsViewer={
	question:null,
	sel_index:null,
	cur_index:null,

	//this callback method will be called when the 'View Details' dialog is closed
	callback:function(){

	},
	
	//optionsViewer attributes initialization
	init:function(data){
		var qnOptions;
		this.question=data.question,this.cur_index=data.cur_index,this.callback=data.callback,this.showCost=data.showCost,this.templateId=data.templateId,this.woId=data.woId;
		this.question.selection_type=(this.question.type=='select')?'radio':this.question.type;
		qnOptions=this.question.options;
		this.onChange = data.onChange;
		this.showNavigation=(qnOptions.length>1);
		if(data.sel_index){
			for(var index = 0; index < qnOptions.length; index++) {
				qnOptions[index].selected = false;
			}
			for(i=0;i<data.sel_index.length;i++){
				qnOptions[data.sel_index[i]].selected=true;
			}
		}
		this.openOptionsViewer();
	},

	//initialize imageChanger and contentSlider component
	openOptionsViewer:function(){
		var data,_self=this,option;//NO I18N
		data={'showNavigation':this.showNavigation,'currencySymbol':sdp_app.CURRENCY_SYMBOL,'question':this.question,'showCost':this.showCost, onChange:this.onChange};//NO I18N
		renderhbs('#viewOptions', 'view-option-details', data, false, 'requests/properties', null, null, $req.details.bindEvents.property_templates.view_option_details); //No I18N
		this.openPopup();
		this.setDescForOption();//NO i18N
		this.setPrevNextValue();
	},

	//description will be not be provided in data ,hence API should be invoked separately to get description value
	setDescForOption:function(){
		if(this && this.question){
		var _self=this,options=this.question.options,option,curSelOption;
		var selOption=options[_self.cur_index],optionId=selOption.id,result=null;

		if(selOption.id&&selOption.description==undefined){
			result=getOptionDetails(this.question.id,optionId,this.templateId,this.woId);
			selOption.description=(result.description)?result.description:'';//NO i18N
			selOption.images=result.images;
			let image_token_content = _self.question.image_token ? ('&key=' + _self.question.image_token) : ''; //No I18N
			//if image size is greater than 1, then separate div has to be constructed and appended.
			if(selOption.images.length >1){
				var modifiedImgDiv='<div class="thumimage" id="thumbImg"><ul>';
				for(var i=0;i<selOption.images.length;i++){
					var eachImgDiv='<li data-src="'+selOption.images[i]+'?res=450x350' + image_token_content + '" ><a href="/"><img src="'+selOption.images[i]+'?res=48x48' + image_token_content + '" ></a></li>';
					modifiedImgDiv = modifiedImgDiv+eachImgDiv;
				}
				modifiedImgDiv+='</ul></div>';
			}
		}
		
		curSelOption=jQuery("#optionsSlider").find(".item:eq("+this.cur_index+")");
		if(selOption.images.length>1){
			curSelOption.find("#optionImgDiv").prepend(modifiedImgDiv);
			curSelOption.find("#primaryImgDiv").attr("class","showimg-blk thumleft h-350px");
			//image slider has to be reinitialised
			setTimeout(function(){//Animate event stop the below function defaultly, Settimeout required for after animate event below function call
				jQuery('[data-cslide=imageChanger]').imageChanger();
			},100);
		}
		if(selOption.description){
			curSelOption.find("#optionDesc").html(''+selOption.description);
			curSelOption.find("#descHeader").hide();
		}
		else{
			curSelOption.find("#descHeader").show();
		}
		curSelOption.find('.thumimage ul li:first').addClass('active');
		}
	},

	//disable prev and next button based on the option displayed
	setPrevNextValue:function(){
		this.setNavBtnValue(this.cur_index-1,jQuery("#prevBtnText"));
		this.setNavBtnValue(this.cur_index+1,jQuery("#nextBtnText"));				
	},

	//Dialog initialization
	openPopup:function(){
		var qn_name=this.question.name,_self=this,callbackfn=this.callback,optionIndex;
		
		jQuery("#viewOptions").dialog({
			title:qn_name,
			modal:true,
			width:700,
			draggable:false,
			resizable:false,
			dialogClass:'fix-box',//NO I18N
			closeOnEscape:false,
			position: { my: "center center", at: "center center", of: window },	// No I18N
			open:function(){
				if(dialogOpen === false){
					dialogOpen = true;
					_self.initializeEvents();
					jQuery('body').css('overflow','hidden');//NO I18N	
					jQuery("#viewOptions").dialog("option","position", { my: "center center", at: "center center", of: window }); //NO I18N
				}
			},
			close:function(){
				dialogOpen = false;
				jQuery('body').css('overflow','scroll');//NO I18N
				jQuery("div[aria-describedby='viewOptions']").remove();
				if(callbackfn){
					callbackfn(_self.getSelectedOptions());
				}
			}
		})
	},

	initializeEvents:function(){
		var _self=this,option;
		jQuery('#optionsSlider').find('.item:eq('+this.cur_index+')').addClass('active')
		.find('#thumbImg ul li:first').addClass('active');
		jQuery('[data-cslide=imageChanger]').imageChanger();
		jQuery('#optionsDetailView').contentSlider(function(ele,operation,activeIndex){
			_self.cur_index=activeIndex;
			_self.setDescForOption();//NO i18N
			_self.setPrevNextValue();
		});
		this.setPrevNextValue();
	},

	//btnEle-either prevbtn or nextbtn
	//pEle-ele can be either prevbtn or nextbtn text
	//curindex- index of the currently displayed option
	setNavBtnValue:function(curindex,pEle){
		if(this && this.question){
			const options=this.question.options,
			optionVal=options[curindex];
		
			if(optionVal){
				pEle.text(optionVal.name).attr('title',e_html(optionVal.name)); //NO i18N
			}
			initTooltip("#optionsDetailView"); //NO I18N
		}
	},

	//get selected options from the dialog i.e. from the checkbox 
	getSelectedOptions:function(){
		var selOpt=[],question=this.question;
		var options=question.options;
		var eleName="optionView_"+question.id;//NO I18N
		var optionId,index;
		jQuery("input[name='"+eleName+"']:checked").each(function(){
			optionId=jQuery(this).attr('id')
			index=optionId.substring(optionId.lastIndexOf("_")+1);
			delete options[index].selected;
			selOpt.push(options[index]);
		})

		question.selected_options=selOpt;
		delete question.selection_type;
		return question;
	}
}
