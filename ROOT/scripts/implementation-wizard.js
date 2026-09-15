/* $Id$ */
var $impl_asst = {
    planID : null,
    planName : null,
    plantime: null,
    lastSlide :null,
    planstatus: null,
    modules:["UserManagement","Requests","Problems","Changes","Releases","Assets","CMDB","Purchase","Contracts","Survey","General"],//NO I18N
    selected_modules: null,
    edit_mode:false,
    salesIQ_url : `https://salesiq.zoho.com/signaturesupport.ls?widgetcode=f97f84e635e0fe2398e0bb1c08bbaf4852feb05ad7c9ac3c8b77a828feca4c90`,

    buildPlan : function(a){
        let $container = jQuery("#admin-wizard");
        renderhbs($container, 'org-details', {}, false,'admin-wizard',false,false,function(){ //No I18N
            jQuery("#continue-to-build").off('click').on('click',function(){$impl_asst.plandetailspage();}) //No I18N
        }); 
    },

    //return the modules that are enabled for the application to display in the module-wizard
    getEnabledModules() {
        const allModules = $impl_asst.modules;
        const defaultModules = ["UserManagement", "Requests", "Survey"]; // NO I18N
        const conditionalModules = {
            "Assets": sdp_app.IS_ASSET_MODULE,// NO I18N
            "Problems": sdp_app.IS_PROBLEM_MODULE,// NO I18N
            "Purchase": sdp_app.IS_PURCHASE_MODULE,// NO I18N
            "Releases": sdp_app.IS_RELEASE_MODULE,// NO I18N
            "CMDB": sdp_app.IS_CMDB_ENABLED,// NO I18N
            "Contracts": sdp_app.IS_CONTRACT_MODULE,// NO I18N
            "Changes": sdp_app.IS_CHANGE_ENABLED// NO I18N
        };
    
        return allModules.filter(module => 
            defaultModules.includes(module) || conditionalModules[module]
        );
    },
    //render the questionnaire according to the selected modules and fill in the responses if the plan is being edited
    chooseModule : function(){
        function construct_questionnare(modules){
            sdpAjax({
                url:`/api/v3/impl_plans/${$impl_asst.planID}/_get_questions`,
                method:"GET",// NO I18N
                success:function(data){
                    if(data.impl_slide.length == 0){
                        window.showalert('failure', translate("sdp.implementation.restart"), 'isAutoHide=true'); // No I18N
                        return;
                    }
                    let plan_answers = null ;
                    //Get the answers for the plan if the plan is already configured and is being edited 
                    sdpAjax({
                        url:`/api/v3/impl_plans/${$impl_asst.planID}/answers`,
                        method:"GET",// NO I18N
                        async: false,
                        success:function(data){
                            //store the answers to fill the answers after rendering questionnaire  
                            plan_answers = data.answers;
                        }
                    });

                    //Rendering the questionnaire according to the json con figured (implquestionnare.json)
                    Handlebars.registerHelper('getKeyandValue', function(object, options) { //No I18N
                        let result = '';
                        for (let key in object) {
                        if (object.hasOwnProperty(key)) {
                            result += options.fn({ key: key, value: object[key] });
                        }
                        }
                        return result;
                    });
                    let sortedArray = Object.entries(data.impl_slide[0]).sort((a, b) => a[1].order - b[1].order);
                    let sortedmodules = {};
                    for (const [key, value] of sortedArray) {
                        sortedmodules[key] = value.questions;
                    }

                    renderhbs(jQuery("#data-content"), 'questionnare', sortedmodules, false,'admin-wizard',false,false,function(){//No I18N
                        jQuery("#data-content input:visible").eq(0).focus();
                        jQuery("#impl_prev_options,#impl_next_options").off('click').on('click',function(){$impl_asst.switchpage(this)});//No I18N
                        jQuery("#impl_submit_options").off('click').on('click',function(){//No I18N
                            jQuery("#impl_submit_options").prop("disabled",true);//No I18N
                            $impl_asst.finishplan(this);
                        });
                    }); 

                    if (modules.length > 1) {
                        jQuery("#impl_next_options").prop("disabled", false);// NO I18N
                        jQuery("#impl_submit_options").prop("disabled", true).addClass("hide");// NO I18N
                    }

                    let $content = jQuery("#data-content");
                    $content.find("[data-id='select2_div']").each(function(index,el){
                        let ques = sortedmodules;
                        let $el = jQuery(el);
                        let slide_code= $el.attr("id").split('_')[0];
                        let module = $el.closest(`[data-name='module']`).attr("id").split('_')[0];
                        let ques_data = ques[module].find(obj => obj.code === slide_code);
                        let options =[]
                        ques_data.options.forEach(function(a){
                            let tmp ={};
                            let [opt_id, opt_text] = Object.entries(a)[0];
                            tmp.id = opt_id;
                            tmp.text = opt_text;
                            options.push(tmp)
                        })
                        $el.select2({
                            placeholder: translate("sdp.request.select.options"), //No I18N
                            allowClear: true,
                            closeOnSelect: false,
                            data: options,
                            multiple:true
                        })
                    });
                    $content.find("[data-name='module']").each(function(e,mod){
                        let $mod = jQuery(mod);
                        if(e != 0){$mod.addClass("hide");}
                        $mod.attr("data-page-id",e+1);
                    });

                    //Fill- out the answers based on the quescode
                    for (let module of plan_answers){
                        let mod_name = module.module;
                        let answers = module.module_answers;
                        let $mod_container = jQuery(`#${mod_name}_impl`);
                        for(let ans of answers){
                            let module_name = module.module;
                            let plan_questions = data.impl_slide[0];
                            let module_questions = plan_questions[module_name].questions;
                            if(ans.answers.length > 0 && (ans.type == "MCQ"  || ans.type == "MAQ" ) ){
                                $mod_container.find(`[name='${ans.quescode}'][data-id='${ans.answers[0]}']`).attr("checked",true);
                            }
                            else if(ans.answers.length > 0 && ans.type == "MSQ"){
                                let options = [];
                                let answer_question = module_questions.find(obj => obj.code === ans.quescode);
                                for(let opt of ans.answers){
                                    let temp = {};
                                    let option_text = answer_question.options.find(obj => obj.hasOwnProperty(parseInt(opt)))

                                    temp.id = opt;
                                    temp.text = option_text[opt];
                                    options.push(temp);
                                }
                                $mod_container.find(`#${ans.quescode}_${ans.question_id}`).select2("data",options);//NO I18N

                            }
                        }
                    }
                    //Check if Request Module is selected.If Service Catalog is not available hide the question "requestservs"
                    if(!sdp_app.IS_SERVICECATALOG_ENABLED){
                        jQuery("#data-content").find(`[data-quescode="requestservs"]`).parent().remove();//No I18N
                    }
                }
            });
        }
        let modules = $impl_asst.selected_modules;
        let plan_input = {
            "impl_plan":{//NO I18N
             "name": $impl_asst.planName,//NO I18N
             "modules": sdpToJSON(modules),//NO I18N
             "status": "ongoing",//NO I18N
             "time_taken": 0//NO I18N
            }
        }

        //check if plan is being edited
        let method = $impl_asst.edit_mode ? `PUT` : `POST`;
        let url = $impl_asst.edit_mode ? `/api/v3/impl_plans/${$impl_asst.planID}` : `/api/v3/impl_plans`;
        sdpAjax({
            url : url,
            method : method,
            data: sdpAjaxInputData(plan_input),
            success:function(data){
                $impl_asst.planID = data.impl_plan.id;
                construct_questionnare(modules); 
            }
        })
    },
    //Get the responses user filled in the particular module in the required formats from the page 
    getModuleAnswers(mod,for_submit){
        let result={};
        let mod_name = jQuery(mod).attr("id").slice(0, -"_impl".length); //No I18N
        result[mod_name]=[];
        let questions = jQuery(mod).find("[data-name='question']");
        questions.each(function(i,quest){
            let $quest = jQuery(quest);
            let seq_id = $quest.attr("data-sequence");
            let data ={};
            let type="";
            let answers=[];
            let quescode = jQuery(quest).attr("data-quescode");
            if($quest.parent().find(`[data-id="select2_div"]`).length > 0){
                type=$quest.attr("data-questype");
                let data = $quest.parent().find(`[data-id="select2_div"]`).select2("data");//NO I18N
                let ans_JSON = [];
                for(let option of data){
                    ans_JSON.push(option.id);
                }
                answers = ans_JSON;
            }
            else if($quest.parent().find('input').length > 0){
                type = $quest.attr("data-questype");
                let data_id = jQuery($quest.parent().find("input:checked")).attr("data-id");
                if(data_id != undefined){
                    answers.push(data_id);
                }
            }
            data["type"]= type;
            data["question_id"]=seq_id;
            data["answers"]=answers
            data["quescode"] = quescode;
            result[mod_name].push(data);
        });
        //Handling for ServiceCatalog Module
        //As Q_id = 4 is treated as a submodule ("ServiceCatalog") if answer is not present , ServiceCatalog answer will be added by default 
        if("Request" == mod_name && result.Request.filter(obj => obj.question_id == "4" ).length == 0){
            result.Request.push({"answers":[],"quescode":"requestservs","question_id":"4","type":"MCQ"}); //NO I18N
        }
        return result;
    },

    //Save the responses and generate the plan for the entered responses
    finishplan : function(el){
        //save the last page progress 
        this.savepageprogress();
        let modules = jQuery("#data-content").find("[data-name='module']");
        let result ={};
        modules.each(function(e,mod){
            let mod_name = jQuery(mod).attr("id").slice(0, -"_impl".length); //No I18N
            result[mod_name] = $impl_asst.getModuleAnswers(mod,true)[mod_name];
        });
        let input_data ={};
        input_data.results=result;
        sdpAjax({
            url:`/api/v3/impl_plans/${$impl_asst.planID}/_build_plan`,
            method:"GET",// NO I18N
            success:function(data){
                if(data.impl_plan.length == 0){
                    jQuery("#impl_submit_options").prop("disabled",false);//No I18N
                    window.showalert('failure', translate("sdp.implementation.restart"), 'isAutoHide=true'); // No I18N
                    return;
                }
                let time = 0;
                let plan = data.impl_plan;
                for(let group of plan){
                    for(let slide of group.data){
                        time += slide.time;
                    }
                }
                $impl_asst.plantime = time;
                window.location="/app#/admin-wizard/start";
                if(jQuery(`[data-id="impl_bubble"]`).length == 0){
                    jQuery(document.body).append(`<div id="impl-bubble"></div>`);
                    renderhbs(jQuery("#impl-bubble"), 'floating-bubble', {}, true, 'admin-wizard',false,false,function(){ //No I18N
                        jQuery("#implementation_assistant").off("click.bubble").on("click.bubble",function(){$impl_asst.initImplTour();}) //NO I18N
                    });
                    initTooltip("#implBubble");//NO I18N
                    jQuery("#esm-widget-videobtn").addClass("hide");//NO I18N
                }
                
            },
            error:function(data){
                jQuery("#impl_submit_options").prop("disabled",false);//No I18N
            }
        });
    },
    //save the module responses when switched from one page to other 
    savepageprogress(){
        let $container = jQuery("#data-content");
        let $modules = $container.find("[data-name='module']");
        let currentpage = parseInt($modules.not(".hide").attr("data-page-id"));//NO I18N
        let current_page = $container.find(`[data-name='module'][data-page-id='${currentpage}']`);

        let mod_name = jQuery(current_page).attr("id").slice(0, -"_impl".length); //No I18N
        let answers = $impl_asst.getModuleAnswers(current_page,false);
        let get_input = {
                "list_info": {//NO I18N
                    "search_criteria":[{"field":"module","value":mod_name ,"condition":"is","logical_operator":"AND"}] //No I18N
                }
            }
        //async is set to false to make sure that answers are saved first and any other operation is performed later(build_plan)
        sdpAjax({
            url:`/api/v3/impl_plans/${$impl_asst.planID}/answers`,
            method:"GET",// NO I18N
            async:false,
            data:sdpAjaxInputData(get_input),
            success:function(data){
                const method = data.answers.length > 0 ? 'PUT' : 'POST';//NO I18N
                const url = method === 'POST'//NO I18N
                    ? `/api/v3/impl_plans/${$impl_asst.planID}/answers`
                    : `/api/v3/impl_plans/${$impl_asst.planID}/answers/${data.answers[0].id}`;

                const tmp={
                            module: mod_name,
                            module_answers: answers[mod_name]
                        }
                let input_data = {};
                input_data.impl_answer = method === 'PUT' ?  tmp : [tmp];
                sdpAjax({
                    url: url,
                    method: method,
                    async: false,
                    data: sdpAjaxInputData(input_data),
                    success: function(response) {
                        // Handle success here
                    }
                });
            }});

    },

    //switch between different module questions in the questionnaire page 
    switchpage(el){
        
        let $container = jQuery("#data-content");
        let $modules = $container.find("[data-name='module']");
        let currentpage = parseInt($modules.not(".hide").attr("data-page-id"));//NO I18N
        let total_pages = $modules.length;
        this.savepageprogress();
        //switch between pages unhide next page and hide current page 
        if(el.id == "impl_next_options" && currentpage < total_pages){
            $container.find(`[data-name='module'][data-page-id='${currentpage}']`).addClass("hide").end().find(`[data-name='module'][data-page-id='${currentpage+1}']`).removeClass("hide");
            currentpage++;
        }
        else if(el.id == "impl_prev_options" && currentpage > 0 && (currentpage < total_pages+1)){
            $container.find(`[data-name='module'][data-page-id='${currentpage}']`).addClass("hide").end().find(`[data-name='module'][data-page-id='${currentpage-1}']`).removeClass("hide");
            currentpage--;
        }
        // Update button states
        const prevDisabled = currentpage === 1;
        const nextDisabled = currentpage === total_pages;
        const submitVisible = currentpage === total_pages;

        $container.find("#impl_prev_options").prop("disabled", prevDisabled);// NO I18N
        $container.find("#impl_next_options").prop("disabled", nextDisabled);// NO I18N
        $container.find("#impl_submit_options").prop("disabled", !submitVisible).toggleClass("hide", !submitVisible);// NO I18N
        jQuery("#data-content input:visible").eq(0).focus()
        jQuery('body,html').animate({
            scrollTop: 0
          }, 500);
    },

    //get the built plan and open helptour component by passing $impl_asst.openTour as `callback` function
    getImplementationTour(planID,callback){
        let impl_tour=[];
        sdpAjax({
            url : `/api/v3/impl_plans/${planID}/_get_slides`,
            method : `GET`,
            skipSUBREQUEST:true,
            success:function(data){
                let slides = data.impl_slide;
                for (let module of $impl_asst.modules) {
                    let module_tour = {
                        "data":[],//NO I18N
                        "name":module,//NO I18N
                        "type":"group"//NO I18N
                    };
                    let module_slides = slides.filter(slide => slide.module === module);
                    if(module_slides.length != 0 ){
                        module_slides.sort(function(a, b) {
                            return a.order_id - b.order_id;
                        });
                        for(let slide of module_slides){
                            let slide_json = JSON.parse(slide.slide);
                            slide_json.configured = slide.is_configured;
                            slide_json.slide_code = slide.slide_code;
                            module_tour.data.push(slide_json);
                        }
                        impl_tour.push(module_tour);
                    }
                }
                if(typeof callback != 'undefined'){
                    callback(impl_tour)
                }
                return impl_tour;
            }
        });
    },
    //Onclick event for floating bubble 
    startImpl(planID){
        let fromESM = sdp_app.IS_ESMDIR;
        if(fromESM != undefined && fromESM){
            $impl_asst.getImplementationTour(planID,$impl_asst.openTour);
        }
        else{
            sdpAjax({
                url : `/api/v3/impl_plans`,
                method : `GET`,
                skipSUBREQUEST:true,
                success:function(data){
                     
                    $impl_asst.planID = data.impl_plans[0].id;
                    $impl_asst.planName = data.impl_plans[0].name;
                    $impl_asst.lastSlide = data.impl_plans[0].last_slide;
                    $impl_asst.planstatus = data.impl_plans[0].status;
                    $impl_asst.getImplementationTour($impl_asst.planID,$impl_asst.openTour);
                }
            });
        }    
    },

    //callback function for switching between slides 
    renderfn(selfComp){
        let $component = jQuery('#hv-'+selfComp.uuid);
        let $configure = $component.find("#impl_configure_settings");
        let $esttime = $component.find("#impl_timing");
        let currentslide = selfComp.options.currentSlideIndex;
        let URL = selfComp.options.data[currentslide].URL
        $configure.attr("href",URL);
        $esttime.text(selfComp.options.data[currentslide].time);
    },

    //Open the implementation assistant Tour 
    openTour(slides){
        function updatePlanStatus(){
            let planID = $impl_asst.planID;
            let plan_input = {
                "impl_plan":{//NO I18N
                 "status": "completed",//NO I18N
                }
            }
            let status = false;
            sdpAjax({
                url : `/api/v3/impl_plans/${planID}`,
                method : `PUT`,
                data: sdpAjaxInputData(plan_input),
                async : false,
                success:function(data){
                    status = true;
                },
                error: function(data){status=false;}
            })
            return status;
        }
        function displaySuccessSlideinTour($hc){
             //hide nav buttons and footer
             $hc.find('.inner-panel > div:not(".of-h")').hide();
             //hide content and render last success slide 
             $hc.find('.inner-panel > div.of-h > div:not(".tsheadersec")').hide()
             $hc.find('.inner-panel > div.of-h').append(`<div id="success-slide"><div id="intallDoneMsg" class="fh pt30"> <div class="tc pos-rel mt30 pt30"> <svg height="400" width="400" class="pos-abs static" style="left: 50%;top: 50%;transform: translate(-50%, -50%);"> <use href="#adminwiz-successmsg"></use> </svg> <div class="z-ind95 pos-rel"> <h1 class="mb30 pt30"><span class="nobold disp-b mt20">${translate("sdp.implementation.hey")}, ${e_html(sdp_user.USERNAME)}!</span></h1> <div class="font-xlarge lh-normal p10"> <p class="mb15 inheritbg">${translate("sdp.implementation.done")}.!</p> <p class="mb15 inheritbg">${translate("sdp.implementation.implemented")}</p> <p class="mb15 inheritbg">${translate("sdp.implementation.keepgoing")}!</p> </div> </div> </div> </div></div>`);

            //remove floating bubble from the screen 
            jQuery("#implBubble").remove();
        }
        function footerFunctions(el,task){
            let $tgt = jQuery(el.target);
            let slide_code = $tgt.attr("data-slide-code");
            let hc_id = $tgt.attr("data-hc");
            let proceed = false;
            let $hc= jQuery(`#hv-${hc_id}`);
            if(task == `mark_as_read`){
                proceed = $impl_asst.markasread(slide_code,$hc);
                $hc.find("#impl_markasread").attr("disabled",true);
            }
            else if(task == `configure_setting`){
                const integration_slides = ["generalmsteams","generalreqarc","generalmscal","generaloutlook"];//No I18N
                if(slide_code.startsWith("general") && !integration_slides.includes(slide_code) ){
                    proceed = $impl_asst.markasread(slide_code,$hc);
                }
            }

            if (proceed) {
                const $icon = $hc.find(".sidenav ul.helpdesk-custom-scrollbar li.active span.cspr");
                $icon.removeClass("help-nav-icon blank-tick").addClass("success");
            }

            //check if tour is completely configured and update status 
            if($impl_asst.checkIfCompleted($hc) == 0 ){
                //update status as "completed"
                let status = updatePlanStatus();
                if(status){displaySuccessSlideinTour($hc)}
            }
        }

        let slide_count =0;
        for(i=0;i<slides.length;i++){
            slide_count += slides[i].data.length;
        }
        if(slide_count < $impl_asst.lastSlide){
            $impl_asst.lastSlide = 0 ;
        }
        jQuery('body').append(`<div id="impl_tour"></div>`);
        var HCInstance = new HelpTourComponent({
            data:slides, // Your array of slide data
            progressbar: false,
            arrows:true,
            sidebar: true,
            title: "Implementation Plan",//NO I18N
            navigateIcons: true,
            currentSlideIndex:$impl_asst.lastSlide,
            cbAfterInit:$impl_asst.renderfn,
            // cbAfterRender:$whats_new.reRender,
            triggerButton:jQuery("#impl_tour"), // NO I18N
            staticNav : true,
            group: true,
            imagePreview: true,
            iconClass: 'blank-tick pos-rel top2', // NO I18N
            configIconClass:'success pos-rel top2',//NO I18N
            responsive: true,
            footer:true,
            footer_html:`<div class="fw disp-t pl20 pr20 p10"> <div class="disp-c" style="width:275px;"></div> <div class="disp-c"> <div class="disp-flex valign-center"> <a class="btn btn-primary" rel="noopener noreferrer" id="impl_configure_settings" href="" target="_blank" data-configure="">${translate("sdp.implementation.configure.button")}</a> <a class="btn btn-default" id="impl_markasread" data-configure=""><span class="cspr icon-sm vsub mr5 enable top0"></span>${translate("sdp.implementation.mark")}</a> <div class="tr ml20 fw mt-5" style="height:35px;"> <span class='text-color1'>${translate("common.need.assistance")}?</span> <a  id="impl_need_assist" href="${$impl_asst.salesIQ_url}" target="_blank" rel="noopener noreferrer" class="text-color1 disp-ib"> <span class="contact-support cspr icon-xl42 tf0-7 vmiddle top-1 pos-rel" rel="uitip" title="${translate("chat.live")}"></span><span>${translate("chat.live")}</span></a> </div> </div> </div> </div>`,
            onSlideChange:function(index,ins){
                $impl_asst.updateLastSlideIndex(index,ins);
                $impl_asst.changeConfigURL(index,ins);
            },
            onFinish:function(index){},
            isConfigWiz: true
        });
        HCInstance.open();

        let $hc = jQuery(`#hv-${HCInstance.uuid}`);

        if($impl_asst.checkIfCompleted($hc) == 0 ){
            //update status as "completed"
            let status = updatePlanStatus();
            if(status){displaySuccessSlideinTour($hc)}
        }
        else{
            //If plan is completed display the last success slide 
            if ($impl_asst.planstatus === 'completed') {
                displaySuccessSlideinTour($hc);
            }

            // add onclick event to markasread button
            $hc.find("#impl_markasread").off('click').on('click',function(el){ //No I18N
                footerFunctions(el,`mark_as_read`);
            });

            //add onclick event to configure button to mark the slide as read if the slide is in general module
            $hc.find("#impl_configure_settings").off('click').on('click',function(el){  //No I18N
                footerFunctions(el,`configure_setting`);
            });
        }
    },

    //check if all the slides are marked as configured (pass the component jQuery as $hc )
    checkIfCompleted($hc){
        let count = 0;
        $hc.find(".playlist-section > ul > li.cur-ptr").each(function(ind,el){
            //check if option is unconfigured and update the count
            if(jQuery(el).find("span.help-nav-icon").hasClass("blank-tick")){
                count++;
            }
        });
        return count;
    },
    //Mark the slide as read when clicked on mark as configured 
    markasread(slide_code,$hc){
        let count = $impl_asst.checkIfCompleted($hc);
        let is_configured = count <= 1 ? true : false ;
        let markasread = {"impl_mark_as_configured":{"slide_code": slide_code,"is_plan_finished":is_configured}};// NO I18N
        let status = false;
        sdpAjax({
            url : `/api/v3/impl_plans/${$impl_asst.planID}/_mark_as_configured`,
            method : `PUT`,
            async:false,
            data: sdpAjaxInputData(markasread),
            success:function(){
                status = true;
            },
            error : function(){
                status = false;
            }
        }) ;
        return status; 
    },
    
    //change the Configure option URL when navigated through slides
    changeConfigURL(index,ins){
        let $hc =jQuery("#hv-" + ins.uuid);
        let data = ins.options.data[index];
        let $markasread = $hc.find("#impl_markasread");
        let is_configured = $hc.find(".sidenav").find("ul.helpdesk-custom-scrollbar").find(`li[data-index=${index}]`).find("span.cspr").hasClass('success'); //No I18N
        $hc.find("#impl_configure_settings").attr("href",data.URL).attr("data-slide-code",data.slide_code).attr("data-hc",ins.uuid);
        $hc.find("#impl_timing").text(data.time);
        $markasread.attr("data-slide-code",data.slide_code).attr("data-hc",ins.uuid);
        //mark disable as false if disabled
        $markasread.attr("disabled",false);
        //update slide_code for markasread
        $markasread.attr("data-slide-code",data.slide_code).attr("data-hc",ins.uuid);
        //mark as completed button hide/unhide
        data.configured || is_configured ? $markasread.addClass("hide") : $markasread.removeClass("hide");

        //Add slide_code to salesIQ url 
        let assist_url = $impl_asst.salesIQ_url + `&user_slide=${data.slide_code}`;
        $hc.find("#impl_need_assist").attr("href",assist_url);
    },

    //update the User Progress
    updateLastSlideIndex(index,instance){
        $impl_asst.lastSlide = index;
        let slideChange = {
            "update_last_slide":{ // NO I18N
                "last_slide": index // NO I18N
            }
        }
        sdpAjax({
            url:`/api/v3/impl_plans/${$impl_asst.planID}/_update_last_slide`,
            method:"PUT",// NO I18N
            data:sdpAjaxInputData(slideChange)
        });

    },

    //save modules
    postmodules(){
        let modules = []
        jQuery("#data-content").find("input:checked").each(function(e){modules.push(jQuery(this).attr("name"))});
        $impl_asst.selected_modules = modules;
        this.chooseModule();
        
    },

    //open the plan-details page 
    plandetailspage(){
        let redirect = true;

        if (!$impl_asst.edit_mode) {
            jQuery("#adminDetails input[data-req]").each(function() {
                const currentIP = jQuery(this);
                const value = currentIP.val();
                const isTooLong = value.length > 250;

                if (!value || isTooLong) {
                    const errorElement = currentIP.siblings("[data-error]");// NO I18N
                    errorElement.removeClass("hide"); // No I18N
                    const errorMessage = isTooLong
                        ? translate("sdp.api.security.exception.value.toolong")
                        : translate("common.enter.values.label", [translate("sdp.implementation.plan.name")]);

                    errorElement.text(errorMessage);
                    currentIP.trigger("focus");
                    redirect = false;
                    return false; // Exit the `.each()` loop
                }
            });
        }else{
            let $container = jQuery("#admin-wizard");
            renderhbs($container, 'org-details', {}, false,'admin-wizard',false,false,function(){//No I18N
                jQuery("#continue-to-build").off('click').on('click',function(){$impl_asst.plandetailspage();})//No I18N
            }); 
        }
        if(!redirect){
            return false;
        }
        let $container = jQuery("#data-content");
        if(!$impl_asst.edit_mode){
            $impl_asst.planName = $container.find("#planName").val();
        }
        window.location="/app#/admin-wizard/plan-details";
    },

    //open module-wizard
    initModulesPage(){
        function getmoduleDiv(modules,id){
            //for internal purposes in remove option method
            let module_div  = null;
            modules.filter(function() {
                if(jQuery(this).find(`[name="${id}"]`).length > 0){
                    module_div = this;
                    return true;
                }
                return false;
            });
            return jQuery(module_div);
        }
        function removeOption(id){
            //remove one of the options in the module-wizard displayed
            let $module_container = jQuery("#data-content").find(`[data-id="module_container"]`);
            let modules = $module_container.find('.disp-c div').not(`:has(input#${id})`);
            let count = 0;
            $module_container.empty();
            //add 5 columns to the div 
            for(let i=0;i<5;i++){
                const $mod_cont = `<div class="disp-c pr25" data-row=${i}></div>`;
                $module_container.append($mod_cont);
            }
            $impl_asst.modules.forEach(function(item, index, arr) {
                let $option = getmoduleDiv(modules,item);
                    if($option.length > 0){
                    //construct the modules by re-arranging all
                    let row = count % 5;
                    let $row = $module_container.find(`[data-row=${row}]`);
                    $option.removeClass("mt10");
                    //add mt10 class for the options in the second row 
                    if(count > 4 ){
                        $option.addClass("mt10");
                    }
                    $row.append($option);
                    count++;
                }
            });
        }
        let $container = jQuery("#data-content");
        let modules = $impl_asst.getEnabledModules();
        renderhbs($container, 'module-wizard', {"modules":modules}, false,'admin-wizard',false,false,function(){ //No I18N
            //if the portal is not IT remove assets and re-arrange the modules
            if(!sdp_app.IS_ITHelpDesk){
                removeOption("Assets");
            }

            jQuery("#chooseModule").off('click').on('click',function(){$impl_asst.postmodules();}) //No I18N
        });
        if($impl_asst.edit_mode){
            $container.find("input").each(function(e){
                let $in = jQuery(this);
                if($impl_asst.selected_modules.includes($in.attr("name")) && $impl_asst.getEnabledModules().includes($in.attr("name"))){
                    $in.attr("checked",true)
                }
            });
        }
        
        if($container.find("input:checked").length>0){$container.find("#chooseModule").attr("disabled",false);}
        $container.find("input[type=checkbox]").on("change", function() {
            let checkedCount = $container.find("input[type=checkbox]:checked").length;
            $container.find("#chooseModule").prop("disabled", checkedCount === 0); //No I18N
        });
    },

    //display success page after saving the tour
    initStartImplPage(){
        let $container = jQuery("#admin-wizard");
        let hours = Math.floor($impl_asst.plantime / 60);
        let mins = $impl_asst.plantime % 60;
        let est_time = hours > 0 ? `${hours} ${window.translate("common.hours")} ${mins} ${window.translate("common.minutes")}` : `${mins} ${window.translate("common.minutes")}`;
        renderhbs($container, 'start-implementing', {"planID":$impl_asst.planID,"est_time":est_time}, false,'admin-wizard',false,false,function(){//No I18N
            jQuery("#startImpl").off('click').on('click',function(){$impl_asst.startImpl();})//No I18N
        }); 
        jQuery('body,html').animate({
            scrollTop: 0
          }, 500);
    },

    //Sample Data Feature related 
    showSampleDataPopUp(a){
        let operation = jQuery(a).attr("data-operation");
        let param = false;
        operation === 'add' ? param = false : param = true; //NO I18N
        let message = operation === 'add' ? translate("sample.data.add.alert") : translate("sample.data.del.alert"); //NO I18N
        sdpAjax({
            type: 'GET', //NO I18N
            url: '/api/v3/impl_plans', //NO I18N
            success : function(responseObj){
                const impl_asst_status = responseObj.impl_plans.length == 0 ? "" : responseObj.impl_plans.get(0).status; //NO I18N
                if((impl_asst_status == 'ongoing' || impl_asst_status == 'completed') && operation == 'add'){ //NO I18N
                    message += translate("sample.data.add.implementationassistant.alert"); //NO I18N
                }
                let url = operation === 'add' ? '/api/v3/sample_entries/load' : '/api/v3/sample_entries/remove'; //NO I18N
                let type = operation === 'add' ? "POST" : "DELETE"; //NO I18N
                let btnText = operation === 'add' ?  'sdp.common.add' : 'sdp.common.delete'; //NO I18N

                showconfirm(true,'title='+translate("common.confirm.submit")+', message='+message+', submitbutton='+translate(btnText)+', cancelbutton='+translate('common.cancel')+', closebutton=yes, closeOnEscKey=yes', function(isSubmitted){//NO I18N
                    if(isSubmitted)
                    {
                        $impl_asst.handleSampleData(url,type)
                    }
                },param);
            }
        });
    },
    handleSampleData(url, type){
        let $page = jQuery("#impl_sampledata");
        $page.find('#sampleDataBtn').attr('disabled', true).end().find('#spanSampleBtn').addClass('mr10 task-loading');

        let ajaxOptions = {
            url: url,
            type: type,
            success: function(data) {
                const message = data.response_status.messages[0].message;
                window.showalert('success', e_html(message), 'isAutoHide=true'); // No I18N
            },
            error: function(err) {
                jQuery('#sampleDataBtn').attr('disabled', false); //NO I18N
                jQuery('#spanSampleBtn').removeClass('mr10 task-loading'); //NO I18N
                showalert('failure', e_html(err.responseJSON.response_status.messages[0].message), 'isAutoHide=false'); // No I18N
            }
        };

        if(type !== 'DELETE'){ //NO I18N
            const selectedValue = jQuery('#selectVertical').val(); //NO I18N
            const input_data = {"sample_entry": {"industry": selectedValue}}; //NO I18N
            ajaxOptions.data = sdpAjaxInputData(input_data);
        }

        sdpAjax(ajaxOptions);
    },
    //Onclick event for System-updates slider in landing page
    checkSystemUpdates(){
        loadEventView();
        setEventCount();
    },
    resetReadStatus(ID, isEmbedded)
    {
        var isRead = true;
        var hasLink = true;
        var content_ID = jQuery('#' + ID);
        if(content_ID.hasClass('feature-unread'))
        {
            isRead = false;
        }
        if(content_ID.attr('style') == "cursor: default;")
        {
            hasLink = false;
        }
        var header_ID = content_ID.prevAll('h4:first').attr('id');  //No i18N
        if(hasLink == true || isRead == false)
        {
            jQuery.ajax('/event/controller', //No i18N
            {
                data: {"action": "resetReadStatus", "ID": ID, "headerID": header_ID, "isRead": isRead, "hasLink": hasLink}, //No i18N
                type: "GET",    //No i18N
                cache: false,
                success: function(linkToRedirect)
                {
                    if(linkToRedirect != "null" && linkToRedirect != "" && !isEmbedded)
                    {
                        var win = window.open(linkToRedirect, '_blank');
                        if(win)
                        {
                            //Browser has allowed it to be opened
                            win.focus();
                        }
                        else
                        {
                            //Broswer has blocked it
                            alert(getMessageForKey("sdp.event.link.popup")); //No i18N
                        }
                    }
                    content_ID.removeClass('feature-unread');
                    content_ID.find('#release-stage').hide();
                }
            });
        }
    },

    //For loading the required scripts 
    initImplTour(ele){
        let planID = jQuery(ele).attr("data-plan-id");
        let files = typeof $impl_asst == 'undefined' ? [`/scripts/implementation-wizard.js`] : []; //No I18N
        sdp_app.IS_DEVELOPMENT_MODE ? files : files.push(`/scripts/hbs-template-admin-wizard.js`); 
        if(files.length == 0){
            $impl_asst.startImpl(planID);
        }
        else{
            ResourceLoader({
                js: files,
                success: function(){
                    $impl_asst.startImpl(planID);
                }
            });
        }
    }
}

//Initializing hbs events seperately instead of onclick (CSP)
var $impl_events={
    landing : function(){
        let $admin = jQuery("#admin-wizard");

        //System Updates and contact Us events
        jQuery(document).off('click.announcement_read').on('click.announcement_read', '.feature-newupdate', function(e) // No I18N
        {
            let ID = this.id;
            $impl_asst.resetReadStatus(ID, false);
        });
        jQuery(document).find('.feature-cnt .update-content div').off('click.announcement_updatecontentdiv').on('click.announcement_updatecontentdiv', function(e) // No I18N
        {
            let ID = jQuery(this).parents('.feature-newupdate').attr('id'); // No I18N
            $impl_asst.resetReadStatus(ID, true);
            e.stopPropagation();
        });
        /** Contact us click event */
        $admin.find("#overview-pop-contact,#overview-contact-us").off('click.overview_contactus').on('click.overview_contactus' , function(){ //No i18N
            window.open('https://salesiq.zoho.com/signaturesupport.ls?widgetcode=f97f84e635e0fe2398e0bb1c08bbaf4852feb05ad7c9ac3c8b77a828feca4c90&', '_blank', 'noopener noreferrer'); //No i18N
        });
        //System Updates pop-up
        $admin.find("#overview-updates").off('click.sys_updates').on('click.sys_updates', function(){ //No i18N
            $impl_asst.checkSystemUpdates();
        });

        //Create new plan 
        $admin.find('#setupPlan').off('click').on('click' , function(){ //No i18N
            $impl_asst.buildPlan(this);
        });

        //Sample entries 
        $admin.find('#sampleDataBtn').off('click').on('click' , function(){ //No i18N
            $impl_asst.showSampleDataPopUp(this);
        });
    }
}
