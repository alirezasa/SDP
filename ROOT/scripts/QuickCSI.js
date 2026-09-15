//$Id$	
var csi_tree;
var admin_csi={
		
		// reloads the parent page
		refreshParent:function(){
			location.reload();
		},
		
		//refresh the page only after saving the category and close button is clicked
		closeQuickCSI:function(){
			if(jQuery("#quickcsi").attr('class')=="hide"){
				if(document.getElementById("totalcategory").innerHTML>0||document.getElementById("totalcategory").innerHTML>0||document.getElementById("totalitems").innerHTML>0)
				{closeDialog(admin_csi.refreshParent());}
			}
				closeDialog(); 
		},
		//For treeview, we get the CSIobject from the db which is in the apiformat and  that is converted to jstree format 
		convertTodhtml:function(csiobj,level){
			for (var i = 0, len = csiobj.length; i < len; i++) {
				if(level=="subcat"){//NO I18N
					admin_csi.sub_categoryId = csiobj[i].id;
					admin_csi.subcatText = csiobj[i].name;
					csiobj[i].id="subcategory_"+csiobj[i].id;
				}
				else if(level=="cat"){//NO I18N
					admin_csi.categoryId = csiobj[i].id;
					admin_csi.catText    = csiobj[i].name;
					csiobj[i].id="category_"+csiobj[i].id;
				}
				else{
					if(level=="item"){//NO I18N
						csiobj[i].id="item_"+csiobj[i].id;
					}
				}
				if(csiobj[i].hasOwnProperty("name")){
					var add_id = ' id = "'+csiobj[i].id+'" ';//NO I18N
					csiobj[i].text="<span "+add_id+">"+e_html(csiobj[i].name)+"</span>";
					csiobj[i].tooltip= csiobj[i].name;
					delete(csiobj[i].name);
				}
				if(csiobj[i].hasOwnProperty("sub_categories")){
					var csiobj_temp = {};
					var data_attributes = ' data-category = "'+admin_csi.categoryId+'" ';//NO I18N
						csiobj_temp.id= "cat_"+admin_csi.categoryId;
						csiobj_temp.li_attr= {class: 'selectedTreeRow'}; //NO I18N
						csiobj_temp.text="<a "+data_attributes+" class='text-link'>+ "+translate("sdp.common.subcategory")+"</a>";
						csiobj_temp.tooltip= translate("sdp.tree.add.under.csi.subcat")+ " " +admin_csi.catText;
						csiobj[i].sub_categories.push(csiobj_temp);

					admin_csi.convertTodhtml(csiobj[i].sub_categories,"subcat");
					csiobj[i].children=csiobj[i].sub_categories;	
					delete(csiobj[i].sub_categories);
				}
				if(csiobj[i].hasOwnProperty("items")){		
					var csiobj_temp = {};
					var data_attributes = ' data-subcategory = "'+admin_csi.sub_categoryId+'" ';//NO I18N
					csiobj_temp.id= "subcat_"+admin_csi.sub_categoryId;
					csiobj_temp.li_attr= {class: 'selectedTreeRow'};
					csiobj_temp.text="<a "+data_attributes+" class='text-link'>+ "+translate("sdp.common.item")+"</a>";
					csiobj_temp.tooltip= translate("sdp.tree.add.under.csi.item")+ " " +admin_csi.catText+" >> " +admin_csi.subcatText;
					csiobj[i].items.push(csiobj_temp);	

					admin_csi.convertTodhtml(csiobj[i].items,"item");
					csiobj[i].children=csiobj[i].items;	
					delete(csiobj[i].items);
				}
			}	
			return csiobj;
		},
        
		//jstree will be instantiated on the pageload
		doOnLoad:function(){
		    jQuery("#quickcsi .inc_close_form").off("click").on("click", () => { closeDialog() }); //No I18N
		    jQuery("#quickcsi .save_form").off("click").on("click", () => { admin_csi.reset() }); //No I18N
    	    jQuery("#quickcsi .save_close").off("click").on("click", () => { admin_csi.save() }); //No I18N
		    jQuery("#qcsi_preview").off("click").on("click", () => { admin_csi.generateJSON(true) }); //No I18N
		    jQuery("#qcsi_expand").off("click").on("click", () => { admin_csi.expand() }); //No I18N
		    jQuery("#qcsi_collapse").off("click").on("click", () => { admin_csi.collapse() }); //No I18N
		    jQuery("#quickta").off("focus").on("focus", () => { admin_csi.enableTab() }); //No I18N
		    jQuery(".qcsiMt .advTcount").off("mousedown").on("mousedown", (event) => { captureDialog(event) }); //No I18N
		    jQuery("#closeQuickCSI, .qcsiMt .advTcount .close2").off("click").on("click", () => { admin_csi.closeQuickCSI() }); //No I18N

			var convcsiobj;
			var headobj={};
			let plugins = ["themes", "types"]
			let treeOptions = {
				plugins: plugins,
			};
			
			jQuery("#treeboxbox_tree1").jstree(treeOptions)
			if(document.getElementById("quickcsi")!=null){
				admin_csi.generateJSON(true);
			}
			if(document.getElementById("treepreview")!=null){
				var baseUrl = '/api/v3/categories/_get_csi_model';	// variable introduced for modifying URL for MSP/SCP	//NO I18N
				if(isMSP){
					var accEle = document.getElementById("persAccId");
					if(accEle)
					{
						baseUrl += '?ACCOUNTID='+accEle.value; //NO I18N
					}
				}
				sdpAjax({
					type: "GET"    ,  //NO I18N
					url: baseUrl   ,  //NO I18N 
          async:false,
					success :function(data){
						var csiobj=data;
						convcsiobj=admin_csi.convertTodhtml(csiobj.csi_model.categories,"cat");//NO I18N
						headobj.id=0;
						headobj.item=convcsiobj;
						jQuery("#treeboxbox_tree1").jstree("destroy");
						jQuery("#treeboxbox_tree1").jstree(treeOptions)
						jQuery('#treeboxbox_tree1').jstree(true).settings.core.data = convcsiobj;
						jQuery('#treeboxbox_tree1').jstree(true).refresh();
						jQuery("#treeboxbox_tree1").jstree("open_all");
						jQuery("#treeboxbox_tree1").addClass("jstree-folder-ovr");
					}
				});
				if(jQuery("#expandicon").hasClass('sdp-glyph-fullscreen')){
					$("#_DIALOG_CONTENT").css({height:"547px"});//No i18n
				}
				$('.qcsiMt').removeClass('hide');
			}
			
		},

		//if same category exists ,then add the child items under the same category
		//This applies for category,subcategory and item
		searchJson:function(key,origjson){
			var i;
			var len;
			if(origjson==undefined){
			return null;
			}
			for (i=0;i<origjson.length;i++){
				if(origjson[i].text.toLowerCase()==key.toLowerCase()){
					return i;
				}
			}
			return null;
		},

		expand:function(){
			jQuery("#treeboxbox_tree1").jstree("open_all");
		},

		collapse:function(){
			jQuery("#treeboxbox_tree1").jstree("close_all");
		},

		//restricts pressing the tab key based on the position of the cursor
		findParent:function(start,val){
			var lines = val.substr(0,start).split("\n");
			var lineno=lines.length;
			var textlines=val.split("\n");
			for(j=lineno-1;j>=0;j--){		
				if(lines[j].trim()=='')
				{continue;}
				else 
				{break;}
			}
			var tabnos=admin_csi.noOfTabs(lines[j]);
			var presenttabno=admin_csi.noOfTabs(textlines[lineno-1]);
			if(tabnos==0&&presenttabno==0||(tabnos==1&&(presenttabno==1||presenttabno==0))||(tabnos==2&&(presenttabno==1||presenttabno==0)))
			{	return true;}
			else
			{	return false;}
		},
		
		//This function allows the tab key in the textarea and handles autoindentation
		enableTab:function() {
			var el = document.getElementById("quickta");
			el.onkeydown = function(e) {
				var val = this.value, 
				start = this.selectionStart, 
				before = val.substring(0, start),
				end = this.selectionEnd;
				//tab key
				if (e.keyCode === 9) {
					if(start==0||val.trim().length==0){
						this.selectionStart = this.selectionEnd = start ;
						return false;
					}
					if(admin_csi.findParent(start,val)){
						this.value = val.substring(0, start) + '\t'+ val.substring(end);//NO I18N
						this.selectionStart = this.selectionEnd = start + 1;
					}
					else{
						this.selectionStart = this.selectionEnd = start ;
					}
					return false;
				}
				//Enter Key
				if (e.keyCode == 13){
					var lines = before.split(/\n/g);
					var len = lines.length - 1;
					var line = lines[len];
					admin_csi.generateJSON(true);
					len = admin_csi.noOfTabs(line);
					if (len == 1) {
						this.value = val.substring(0, start) + '\n' + '\t'+ val.substring(end);//NO I18N
						this.selectionStart = this.selectionEnd = start + 2;
						return false;
					}
					if (len == 2) {
						this.value = val.substring(0, start) + '\n' + '\t' + '\t'+ val.substring(end);//NO I18N
						this.selectionStart = this.selectionEnd = start + 3;
						return false;
					}
				}
			};
		},

		//finds the no of tabs in a line
		noOfTabs:function(line) {
			var len, j;
			if (line[0] != '\t')
			{len = 0;}
			else {
				len = 1;
				for (j = 1; j < line.length; j++) {
					if (line[j] != '\t')
					{break;}
					len++;
				}
			}
			return len;
		},

		//creating JSON from the textarea according to jstree format
		generateJSON:function(isEncode){
			var main={};
			var jsoncat = {};
			var jsonsubcat = {};
			var jsonitem = [];
			var catindex,subcatindex,itemindex;
			var count=0;
			main.id=0;
			main.children=[];
			var val = document.getElementById("quickta").value;
			var lines = val.split(/\n/g);
			var length = lines.length - 1;
			var i, j, len, line;
			for (i = 0; i <= length; i++) {
				line = lines[i];
				if (line.trim().length == 0)//to ignore blank lines
				{continue;}
				len = admin_csi.noOfTabs(line);
				lines[i] = lines[i].trim();//to remove leading and trailing whitespaces
				lines[i] = lines[i].replace(/\s+/g, " ");//to remove extra whitespaces between the words
				if(len==0){
					var searchkey=admin_csi.searchJson(lines[i],main.item);
					if(searchkey==null){
						jsoncat={};
						jsoncat.id=++count;
						jsoncat.text=admin_csi.enHTML(lines[i],isEncode);
						jsoncat.children=[];
						main.children.push(jsoncat);
						catindex=main.children.length-1;
					}
					else
					{catindex=searchkey;}
				}
				if(len==1){
					if(main.children.length-1>=catindex)
					{	
						var searchkey=admin_csi.searchJson(lines[i],main.children[catindex].item);
						if(searchkey==null){			
							jsonsubcat={};
							jsonsubcat.id=++count;
							jsonsubcat.text=admin_csi.enHTML(lines[i],isEncode);
							jsonsubcat.children=[];
							main.children[catindex].children.push(jsonsubcat);
							subcatindex=main.children[catindex].children.length-1;
						}
						else{
							subcatindex=searchkey;
						}
					}
					else
					{	continue;}
				}	
				if(len==2){
					if(main.children.length-1>=catindex&&main.children[catindex].children.length-1>=subcatindex)
					{
						var searchkey=admin_csi.searchJson(lines[i],main.children[catindex].children[subcatindex].item);
						if(searchkey==null){
							jsonitem={};
							jsonitem.id=++count;
							jsonitem.text=admin_csi.enHTML(lines[i],isEncode);
							main.children[catindex].children[subcatindex].children.push(jsonitem);
						}
					}
					else
					{	continue;}
				}	
			}
			if(isEncode){
				jQuery('#treeboxbox_tree1').jstree(true).settings.core.data = main.children;
				jQuery('#treeboxbox_tree1').jstree(true).refresh();
				jQuery("#treeboxbox_tree1").jstree("open_all");
				jQuery("#treeboxbox_tree1").addClass("jstree-folder-ovr");
			}
			return main;
		},
		enHTML : function(txt,isEncode){
			if(isEncode){
				txt = e_html(txt);
			}
			return txt;
		},

		//convert the dhtmlxjsonformat to apiformat
		convApiFormat:function(jsonarray,level){
			for(var i=0;i<jsonarray.length;i++){
				if(jsonarray[i].hasOwnProperty("text")){
					jsonarray[i].name=jsonarray[i].text;
					delete(jsonarray[i].text);
				}
				if(jsonarray[i].hasOwnProperty("children")){
					if(level=="category"){ 
					    admin_csi.convApiFormat(jsonarray[i].children,"subcategory");
						jsonarray[i].sub_categories=jsonarray[i].children;
						delete(jsonarray[i].children);
					}
					if(level=="subcategory"){
					    admin_csi.convApiFormat(jsonarray[i].children,"children");
					    jsonarray[i].items=jsonarray[i].children;
					 }
				delete(jsonarray[i].children);
				}
				delete(jsonarray[i].id);
			}    
			return jsonarray;
		},

		//Sending the json data to the Server and displaying the results on the client side 
		save:function(){
			var jsoncat=admin_csi.generateJSON(false);
			var catarray=admin_csi.convApiFormat(jsoncat.children,"category");//NO I18N
			var catjson={};
			var inputobj={};
			catjson.categories=catarray;
			inputobj.csi_model=catjson;
			if(window.Prototype){
				delete Object.prototype.toJSON;
				delete Array.prototype.toJSON;
			}
			var items= (typeof sdpToJSON != 'undefined') ? sdpToJSON(inputobj) : JSON.stringify(inputobj) ; //NO I18N
			var data={"input_data":items}; //NO I18N
			if (catarray.length>0)
			{
				sdpAjax({
						type: "post"    ,  //NO I18N
						url:'/api/v3/categories/_add_csi_model', //NO I18N
						"data":data,//NO I18N 
						success :function(data){
							var results=data.csi_model;
							jQuery("#totalrecords").text(results.successful_entries);
							jQuery("#totalcategory").text(results.categories);
							jQuery("#totalsubcategory").text(results.sub_categories);
							jQuery("#totalitems").text(results.items);
						}
		    });
			}
			else
			{	
				jQuery("#totalrecords").text("0");
				jQuery("#totalcategory").text("0");
				jQuery("#totalsubcategory").text("0");
				jQuery("#totalitems").text("0");
			}
			jQuery("#Resultdiv").removeClass("hide");
			jQuery("#quickcsi").addClass("hide");
		},

        //Clears the textarea and changes preview accordingly
		reset:function() {
			document.getElementById("quickta").value = '';
			admin_csi.generateJSON(true);
		} 
};
jQuery(document).ready(function(){
	/**settimeout for load jstree dependency */
	setTimeout(function(){
		admin_csi.doOnLoad();
	}, 500)
});
