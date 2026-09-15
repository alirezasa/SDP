/* $Id$ */
var projectMemberTable={
	/*
		*A function to intialize the webComponent.
		*@param{object}options - contains project id for which the members listview should be rendered.
	*/
	callComponent : function(options){
		options.tableHolder = "members";// NO I18N
		options.url = 'projects/'+options.projectId+'/members';//No I18N
		var _self = this;
		_self.options = options;
		sdpAjax({
            url: '/api/v3/'+options.url+'/_links',//NO I18N
            success: function(resp){
                if(resp._links){
                    jQuery(resp._links).each(function(index,value){
                        if(value.method == "post"){
                            _self.options.allowed_operations["ADD"] = true;
                        }else if(value.method == "put"){// NO I18N
                            _self.options.allowed_operations["PUT"] = true;
                        }else if(value.method == "delete"){// NO I18N
                            _self.options.allowed_operations["DELETE"] = true;
                        }
                    });
                }
            },
            headers: {Accept: "vnd.manageengine.v3+json"},// No I18N
            ignorefailuremessage: true,
            async: false
        });

        renderhbs("#ProjectMembersListView", "ProjectMemberTemplate", _self.options, false, "project");// No I18N

		delete WebComponents.instancePool["webc_"+options.tableHolder];//NO I18N
        WebComponents.render("webc_"+options.tableHolder);//NO I18N
	},
	tableCompOptions: function() {
		return {
			bulkSelectionSetting:{
				constructSelectedListCB: function(data){
					return '<span rel="uitip" mode_ellipsis="true" title="'+e_attr(data.user.name)+'">#'+data.user.id+' '+e_html(data.user.name)+'</span>';
				}
			},
			callback: {
	            "delete": {// No I18N
	                success: function(response){
	                    var success;
	                    var membersList = '';
	                    jQuery.each(response.response_status, function(index, value){
	                        if(value.messages && value.messages[0].status_code == 4005){
	                            membersList += WebComponents.instancePool["webc_members"].bulkSelect.selectedRecords[value.id].user.name +',';
	                        }else{
	                            success = true;
	                        }
	                    });
	                    membersList = membersList.slice(0,-1);
	                    if(success){
	                        showalert('success',translate("common.delete.success"),"isAutoHide=true"); // No I18N
	                    }
	                    if(membersList != ''){
	                        showalert('failure','<b>'+e_html(membersList)+'</b> - '+translate("sdp.projectmembers.delete.inactive.errorMsg"),"isAutoHide=false"); // No I18N
	                    }
	                }
	            }
	        }
		}
	},
	rowDataConstruct: function(table_info) {
		return {
			"list_info": table_info.list_info,//NO I18N
			"fields_required": ["id","user","role","is_active","employee_id","jobtitle","department","email_id","phone"]//NO I18N
		};
	},
	headerDataConstruct: function(){
		var meta_data = {
			"members_head_chk" : { // No I18N
                "type" : "checkbox", // No I18N
                "hide_label" :true, //NO I18N
                "default": true //NO I18N
            },
			"is_active":{// NO I18N
                "type": "icon",// No I18N
                "hide_label": true,// No I18N
				"default": true,// No I18N
            	"dataCelltransformer": projectMemberTable.constructStatusIcon// No I18N
			},
            "user": {//No I18N
            	"default": true //NO I18N
			},
			"role": {//No I18N
				"default": true, //NO I18N
				"mandatory": true// No I18N
			}
        };
        meta_data.role.inlineEdit = projectMemberTable.options.allowed_operations.PUT;
        if(!projectMemberTable.options.allowed_operations.DELETE){
        	delete meta_data.members_head_chk;
        }
        sdpAjax({
            url: "/api/v3/"+projectMemberTable.options.url + "/_metainfo",// No I18N
            async: false,
            success: function (data) {
            	var metainfo = data.metainfo.fields;
			    jQuery.each(metainfo.user.fields, function(index, value){
			    	meta_data[index] = value;
			    	meta_data[index].frommeta = true;
			    	meta_data[index].is_inmeta = true;
			    	meta_data[index].value_path = "user."+index;
			    	if(index === "department"){
			    		meta_data[index].value_path = "user."+index+".name";// NO I18N
			    		meta_data[index].dataCelltransformer = projectMemberTable.constructDepartment;
			    	}
			    });
			    jQuery.extend(meta_data.role, metainfo.role);
			    meta_data.role.href = "/"+projectMemberTable.options.url+"/${id}/role";
			    jQuery.extend(meta_data.user, metainfo.user);
        		meta_data.id = jQuery.extend(metainfo.id,{"default":"true"});
            },
            ignorefailuremessage:true
        });
        return meta_data;
	},
	callbackAfterRender: function(){
		var val;
		jQuery.each(WebComponents.instancePool["webc_members"].visibleContents, function(index,value){
			if(value.user.id == sdp_user.LOGGEDIN_USERID){
				val = value.id;
			}
		});
		jQuery("[data-entityid="+val+"]").find('input').attr("disabled",true).attr("class","hide");//NO I18N
	},
	constructStatusIcon: function(table_data,_self){
		var canEdit = projectMemberTable.options.allowed_operations.PUT;
		if(table_data.row_data.is_active){
			return '<span id="row_'+table_data.row_data.id+'" class="cspr enable icon-sm '+ (canEdit? 'clickaction cur-ptr" data-event="click" data-handler="projectMemberTable.changeMemberStatus('+table_data.row_data.id+',false);" nonce='+sdpNonce+' title="'+translate("sdp.projectmembers.inactive")+'"':'')+' rel="uitip"></span>'//NO I18N
		}else{
			return '<span id="row_'+table_data.row_data.id+'" class="cspr disable-no icon-sm '+ (canEdit? 'clickaction cur-ptr" data-event="click" data-handler="projectMemberTable.changeMemberStatus('+table_data.row_data.id+',true);" nonce='+sdpNonce+' title="'+translate("sdp.projectmembers.active")+'"':'')+' rel="uitip"></span>'//NO I18N
		}
	},
	constructDepartment: function(table_data,_self){
		var user = table_data.row_data.user;
		if(user.department){
			const siteName = user.department.site? e_html(user.department.site.name): translate("common.site.nosite");
            const department = e_html(user.department.name);
            const title = `<b>${translate('sdp.requests.common.site')}:</b> ${siteName}<br><b>${translate('sdp.project.projectattribute.department')}:</b> ${department}`;
            return '<div class="d_w w-150px" rel="uitip" mode_html="true" title="'+ e_attr(title) +'">'+department+'</div>';//NO I18N
		}else{
			return '<div class="d_w w-150px">-</div>';//NO I18N
		}
	},
	/*
		*A function to activate or deactivate project members
		*@param{String}id - Member id 
		*@param{boolean}isActive - Whether to activate or deactive the member
	*/
	changeMemberStatus: function(id,isActive){
		sdpAjax({
			type: "put",//NO I18N
			url: '/api/v3/'+WebComponents.instancePool["webc_members"].t_obj.options.callbackURL+'/'+id,//NO I18N
			data: sdpAjaxInputData({"member":{"is_active": isActive}}),// NO I18N
			acceptODCompatible: true,
			success: function(resp){
				showalert('success',translate(isActive?"sdp.projectmembers.activated":"sdp.projectmembers.deactivated",['<b>'+e_html(WebComponents.instancePool["webc_members"].loadedRecords[id].user.name)+'</b>']),"isAutoHide=true"); // No I18N
				WebComponents.instancePool["webc_members"].refreshTable();
			},
			error: function(xhr){
				var resp = xhr.responseJSON;
				if(resp.response_status && resp.response_status.messages && resp.response_status.messages[0].message){
                	showalert('failure', e_html(resp.response_status.messages[0].message),"isAutoHide=false"); // No I18N
                }
			},
			ignorefailuremessage: true
		});
	}
};

var addProjectMemberTable={
	/*
		*A function to intialize the webComponent.
		*@param{object}options - contains project id for which the addMembers listview should be rendered.
	*/
	callComponent : function(options){
		options.url = 'projects/'+options.projectId+'/members/user';//NO I18N
		options.tableHolder="addmembers";//NO I18N
		var _self = this;
		_self.options = options;

		renderhbs("#ProjectMembersListView", "AddProjectMemberTemplate", _self.options, false, "project");//NO I18N
		jQuery("#userProjectRoles").sdp_select2({
			multiple:false,
			placeholder: translate("form.select.placeholder", [translate('sdp.project.projectmembersattribute.roleid')]), // No I18N
			allowClear: true,
			width: "175px",// NO I18N
			url:[{
				url:"/api/v3/projects/"+options.projectId+"/members/role",//NO I18N
				field:'role',//NO I18N
				headers : { Accept: "vnd.manageengine.v3+json" }// No I18N
			}]
		});

		delete WebComponents.instancePool["webc_"+options.tableHolder];//NO I18N
        WebComponents.render("webc_"+options.tableHolder);
	},
	rowDataConstruct: function(table_info) {
		return {
			"list_info": table_info.list_info,//NO I18N
			"fields_required": Object.keys(table_info.fields_required)//NO I18N
		};
	},
	tableCompOptions: function() {
		return {
			bulkSelectionSetting: {
				selectionCallback: function() {
					jQuery("#assignRoleDiv").removeClass("disableDiv");
				},
				unSelectionCallback: function() {
					if(WebComponents.instancePool["webc_addmembers"].bulkSelect.getSelectedIDs().length == 0){
						jQuery("#assignRoleDiv").addClass("disableDiv");
					}
				}
			}
		}
	},
	callbackAfterRender: function(){
		jQuery("#addUser").off("click").on("click",function(){//NO I18N
			var members = [];
			var role = jQuery("#userProjectRoles").val();//NO I18N
			var ids = WebComponents.instancePool["webc_addmembers"].bulkSelect.getSelectedIDs();
			if(ids.length === 0){
	            showalert(translate("common.delete.atleastone"));//NO I18N
	            return false;
		    }
			jQuery.each(ids, function(index,id){
				var input = {};
				input.user = {"id":id};//NO I18N
				if(role !== ''){//NO I18N
					input.role = {"id": role};//NO I18N
				}
				members.push(input);
			});

			var inputObject = { members};
			var data = sdpAjaxInputData(inputObject);

			sdpAjax({
				url:"/api/v3/projects/"+addProjectMemberTable.options.projectId+"/members",//NO I18N
	    		acceptODCompatible: true,
				type:"POST",//NO I18N
	    		async: false,
	    		cache: false,
				data: data,
	    		ignorefailuremessage: true,
				success: function(resp){
					jQuery("#userProjectRoles").select2("data",null);// NO I18N
					loadProjectMembers();
	    			showalert('success',translate("sdp.project.addmembers.successmessage"),"isAutoHide=true"); // No I18N
    			},
                error: function(xhr){
                    var error;
                    var success;
                    jQuery.each(xhr.responseJSON.response_status, function(index, value){
                        if(value.status === "success"){// No I18N
                            success = true;
                        }else if(value.status == "failed"){// No I18N
                            error = value.messages[0].message;
                        }
                    });
                    if(success){
                        showalert('success',translate("sdp.project.addmembers.successmessage"),"isAutoHide=true"); // No I18N
                    }
                    if(error){
                        showalert('failure', e_html(error),"isAutoHide=false"); // No I18N
                    }
                    loadProjectMembers();
                }
			});
			return true;
		});
		jQuery("#rolesDescHelpCard").click(function(){
			$previewComponent.load("/project/ProjectRolesDescription.jsp?projectId="+addProjectMemberTable.options.projectId+"&externalframe=true",translate("sdp.projectrole.helpcard.title"),"700px",parseInt(jQuery(window).height()) - 65,null,"rolesmodule_popup");  // No I18N
		});
	},
	constructDepartment: function(table_data,_self){
		var department = table_data.row_data.department;
		if(department){
		    const siteName = department.site? e_html(department.site.name) : translate("common.site.nosite");
			const departmentName = e_html(department.name);
        	const title = `<b>${translate('sdp.requests.common.site')}:</b> ${siteName}<br><b>${translate('sdp.project.projectattribute.department')}:</b> ${departmentName}`;
			return '<div class="d_w w-150px" rel="uitip" mode_html="true" title="'+ e_attr(title) +'">'+departmentName+'</div>';//NO I18N
		}else{
			return '<div class="d_w w-150px">-</div>';//NO I18N
		}
	},
	/*
		*A function to render Project roles helpcard in previewComponent
		*@param(String)projectId - project id for which the roles has to fetched
	*/
	renderRolesHelpCard: function(projectId){
        renderhbs("#ProjectRolesHelpCard","projectRoles-helpcard-template",{"tableHolder":"rolesHelpCard", "projectId":projectId}, false, "project");//NO I18N
        delete WebComponents.instancePool["webc_rolesHelpCard"];//NO I18N
        WebComponents.render("webc_rolesHelpCard");
	},
	rolesRowDataConstruct: function(data){
		return {"fields_required": ["name","description"],"list_info": {"row_count":10}};// NO I18N
	}
};

