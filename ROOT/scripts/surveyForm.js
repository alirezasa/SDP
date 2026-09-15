/* $Id$ */
(function() {
    /* 
    	####################### FORM CLASS ############################
    */
    var Form = function(survey_question, answerTypeMap) {
        this.survey_question = survey_question;
        this.answers = undefined;
        this.$ = undefined;
    }
    Form.prototype.questionFactory = function(quest) {
        var obj;
        var data="";
        if(quest.ques_type=="binaryValue" || quest.ques_type=="Radio")
        {
            data=quest.survey_radio;
        }
        else if(quest.ques_type=="starRating" || quest.ques_type=="Rating")
        {
            data=quest.survey_rating;
        }
        var defaultAnswer = quest.answer;
        var properties = quest.properties;
        switch (quest.ques_type) {
            case "starRating"://NO I18N
                obj = new StarRating(data, defaultAnswer, properties);
                break;
            case "Rating"://NO I18N
            case "opinionScale"://NO I18N
                obj = new OpinionScale(data, defaultAnswer, properties);
                break;
            case "binaryValue"://NO I18N
                obj = new BinaryValue(data, defaultAnswer, properties);
                break;
            case "Radio"://NO I18N
                obj = new RadioButton(data, defaultAnswer, properties);
                break;
        }
        return obj;
    }
    Form.prototype.createQuestion = function($el, position, question) {
        var questionHTML = "<li class='form-question-container'><div class='form-question-name'></div><div class='form-question-option'></div><button class='form-trashicon'><span class='cspr spad-delete icon-md'></span></button><button class='form-settingicon'><span class='cspr edit icon-sm'></span></button></li>";
        if (position == undefined || position == null) {
            position = $el.find(".form-question-container").length;
        }
        var tempObj = this.questionFactory(question);
        var $existingQuestions = $el.find(".form-question-container");
        if ($existingQuestions.length > position) {
            $existingQuestions.eq(position).before(questionHTML);
        } else {
            $el.append(questionHTML);
        }
        var $questionContainer = $el.find(".form-question-container").eq(position);
        $questionContainer.attr("data-number", position);
        $questionContainer.attr("data-text", "Question ");
        var qtn = question.ques_text;
        question.question_order=position+1;
        setTimeout(function(){ // This won't work without timeout .. Must be changed..
        	var $questionElement = $questionContainer.find(".form-question-name input");
        	if($questionElement.length){
        		$questionElement.val(qtn); //surveyDetails page
        	}else{
        		$questionContainer.find(".form-question-name").html(ZSEC.Encoder.encodeForHTML(qtn)); //FillSurvey page
        	}
        },0);
        if (question.is_mandatory) {
            $questionContainer.find(".form-question-name").addClass('mandatory-field');
        }
        tempObj.construct($questionContainer.find(".form-question-option"));

        return tempObj;
    }
    Form.prototype.construct = function($el) {
        var fields = [];
        this.$ = $el;
        //var questionHTML = "<li class='form-question-container'><div class='form-question-name'></div><div class='form-question-option'></div><button class='form-trashicon'><span class='sdp-glyph sdp-glyph-trash-fill'></span></button></li>";
        var questionHTML = "<li class='form-question-container'><div class='form-question-name'></div><div class='form-question-option'></div><button class='form-trashicon'><span class='cspr icon-sm star-fill opac5 mr5'></span></button></li>";
        for (var index = 0; index < this.survey_question.length; index++) {
            var tempObj = this.createQuestion($el, index, this.survey_question[index]);
            fields.push(tempObj);
        }
        this.answers = fields;
    }
    Form.prototype.removeQuestion = function(questionIndex) {
        if (this.answers[questionIndex].destroy()) {
            this.$.find(".form-question-container").eq(questionIndex).remove();
            this.answers.splice(questionIndex, 1);
            this.survey_question.splice(questionIndex, 1);
        }
    }
    Form.prototype.removeLastQuestion = function() {
        this.removeQuestion(this.survey_question.length - 1);
    }
    Form.prototype.removeFirstQuestion = function() {
        this.removeQuestion(0);
    }
    Form.prototype.addQuestion = function(question, questionIndex) {
        if (questionIndex == undefined || questionIndex == null) {
            questionIndex = this.survey_question.length;
        }
        var tempObj = this.createQuestion(this.$, questionIndex, question);
        this.answers.splice(questionIndex, 0, tempObj);
        this.survey_question.splice(questionIndex, 0, question);
    }
    Form.prototype.editQuestion = function(question) {
        var tempObj = this.questionFactory(question);
        if (question.type == 'starRating') {
            jQuery('.droppable-rightform li.active .form-question-option').find(".star-rating").remove();
        }
        if (question.type == 'rating') {
            jQuery('.droppable-rightform li.active .form-question-option').find(".opinion-scale").remove();
        }
        if (question.type == 'radio') {
            jQuery('.droppable-rightform li.active .form-question-option').find(".radio-options").remove();
        }
        tempObj.construct(jQuery('.droppable-rightform li.active').find(".form-question-option"));
    }
    Form.prototype.prependQuestion = function(question) {
        this.addQuestion(question, 0);
    }
    Form.prototype.appendQuestion = function(question) {
        this.addQuestion(question, this.survey_question.length);
    }
    Form.prototype.serialize = function() {
            for (var i = 0; i < this.answers.length; i++) {
                var val = this.answers[i].val();
                if (this.survey_question[i].is_mandatory) {
                    if (this.answers[i].isValid()) {
                        this.survey_question[i].answer = val;
                    } else {
                        throw "The response to the question \"" + this.survey_question[i].question + "\" is invalid. Please check your answers before submitting";//NO I18N
                    }
                } else {
                    this.survey_question[i].answer = val;
                }
            }
            return this.survey_question;
        }
        /* 
        	####################### SURVEY FORM PLUGIN ############################
        */
    jQuery.fn.surveyForm = function(data) {
        data = jQuery.extend({
            "survey_question": []//NO I18N
        }, data);
        var survey = this;

        function init() {
            var form = new Form(data.survey_question);
            form.construct(jQuery(survey));
            return form;
        }
        return init();
    }

    /* 
    	####################### ANSWER CLASS - SUPER CLASS FOR ALL ANSWER TYPES ############################
    */
    var Answer = function(options) {
        this.properties = options;
        this.$ = undefined;
    }
    Answer.prototype.destroy = function() {
        var isDeleted;
        try {
            this.$.remove();
            isDeleted = true;
        } catch (e) {
            isDeleted = false;
        } finally {
            return isDeleted;
        }
    }
    Answer.prototype.val = function() {
        return this.$.val();
    }
    Answer.prototype.isValid = function() {
            var val = this.val();
            return ((val != undefined) && (val != null));
        }
        /* 
        	####################### STARRATING CLASS ############################
        */
    var StarRating = function(options, defaultAnswer, properties) {
        this.options = options;
        this.defaultAnswer = defaultAnswer;
        this.properties = properties;
        this.$ = undefined;
    }
    StarRating.prototype = new Answer();
    StarRating.prototype.constructor = StarRating;
    StarRating.prototype.construct = function($el) {
            var data = jQuery.extend({
                "answer": this.defaultAnswer,//NO I18N
                "step": this.properties.step,//NO I18N
                "properties": this.properties//NO I18N
            }, this.options);
            this.$ = $el.StarRating(data);
        }
        /* 
        	####################### STARRATING PLUGIN ############################
        */
    jQuery.fn.StarRating = function(data) {
        data = jQuery.extend({
            "properties": {//NO I18N
                "name": "star-" + Math.random(),//NO I18N
                "className": {//NO I18N
                    "selected": "fa fa-star",//NO I18N
                    "unselected": "fa fa-star-o"//NO I18N
                }
            },
            "step": 0.5,//NO I18N
            "least_val": 0,//NO I18N
            "max_val": 0,//NO I18N
            "answer": null,//NO I18N
            "events": {//NO I18N
                "onValueChange": undefined//NO I18N
            }
        }, data);
        var $el = this;
        var value;
        $el.val = function() {
            return value;
        }

        function changeValue($el) {
            if (data.properties.trail) {
                highlightStar($el);
                value = jQuery($el).closest(".field").find("input").val();//NO I18N
                jQuery($el).parent().find("input").trigger('click');
            }
        }

        function setValue($starRating, value, ahover) {
            var starNumber = value / data.step;
            if (starNumber >= data.least_val && starNumber <= data.max_val) {
                changeValue($starRating.find(".field").eq(starNumber - 1).find(".field-val"));
            }
        }

        function highlightStar($el) {
            if (data.properties.trail) {
                var index = $el.closest(".field").index();//NO I18N
                $el.closest(".star-rating").find(".field > .field-val > i").removeClass(data.properties.className.selected).addClass(data.properties.className.unselected);//NO I18N
                for (var i = 0; i <= index; i++) {
                    $el.closest(".star-rating").find(".field").eq(i).find(" > .field-val > i").removeClass(data.properties.className.unselected).addClass(data.properties.className.selected);//NO I18N
                }
            }
        }

        function unHighlightAllStars($el) {
            if (data.properties.trail) {
                $el.closest(".star-rating").find(".field > .field-val > i").removeClass(data.properties.className.selected).addClass(data.properties.className.unselected);//NO I18N
            }
        }

        function closecmdDialog() {
            jQuery('.surveyadd-container').remove();
        }

        function init() {
            $el.append("<div class='star-rating' data-name='Rating'></div>");
            $starRating = $el.find(".star-rating").last();
            var val = 0;
            for (var i = data.least_val; i <= data.max_val; i += data.step) {
                $starRating.append("<div class='field'><input type='radio' style='opacity:0;' name='" + data.properties.name + "' value='" + i + "' /><div class='field-val'><i class='" + data.properties.className.unselected + "'></i><div>" + i + "</div></div></div>");
            }

            $starRating.find(".field-val").on('click', function(evt) {
                changeValue(jQuery(evt.target));
                if (data.events.onValueChange) {
                    data.events.onValueChange(value);
                    if (value <= 2) {
                        //negativeFeed(value,jQuery(this));
                    }
                }
            });

            $starRating.hover(null, function(evt) {
                unHighlightAllStars(jQuery(evt.target));
                setValue(jQuery(evt.target).closest(".star-rating"), value);//NO I18N
                //data.trail = true;
            });
            $starRating.find(".field-val").on('mouseenter mouseleave', function(evt) {
                highlightStar(jQuery(evt.target));
            });
            if (data.answer) {
                data.properties.trail = true;
                setValue($starRating, data.answer);
                data.properties.trail = false;
            }
            if (!data.properties.trail) {
                $starRating.parent().css('position', 'relative');//NO I18N
                $starRating.append('<div class="formnoeffect"></div>');
            }
        }
        init();
        return $el;
    }



    /* 
    	####################### OPINION CLASS ############################
    */
    var OpinionScale = function(options, defaultAnswer, properties) {
        this.options = options;
        this.defaultAnswer = defaultAnswer;
        this.properties = properties;
        this.$ = undefined;
    }
    OpinionScale.prototype = new Answer();
    OpinionScale.prototype.constructor = OpinionScale;
    OpinionScale.prototype.construct = function($el) {
        var data = jQuery.extend({
            "label": {//NO I18N
                "max_label": this.options.max_label,//NO I18N
                "mid_label": this.options.mid_label,//NO I18N
                "min_label": this.options.least_label,//NO I18N
            },
            "step": this.properties.step,//NO I18N
            "answer": this.defaultAnswer,//NO I18N
            "properties": this.properties//NO I18N
        }, this.options);
        this.$ = $el.OpinionScale(data);
    }

    /* 
    	####################### OPINION SCALE PLUGIN ############################
    */
    jQuery.fn.OpinionScale = function(data) {
        data = jQuery.extend({
            "className": {//NO I18N
                "selected": "selected",//NO I18N
                "unselected": ""//NO I18N
            },
            "step": 0.5,//NO I18N
            "least_val": 0,//NO I18N
            "max_val": 0,//NO I18N
            "label": {//NO I18N
                "min_label": "Extremely low",//NO I18N
                "mid_label": "Average",//NO I18N
                "max_label": "Extremely high"//NO I18N
            },
            "answer": null,//NO I18N
            "events": {//NO I18N
                "onValueChange": undefined//NO I18N
            }
        }, data);
        var $el = this;
        var value;
        $el.val = function() {
            return value;
        }

        function changeValue($el) {
            if (data.properties.trail) {
                var index = jQuery($el).closest(".field").index();//NO I18N
                if (value) {
                    jQuery($el).closest(".opinion-scale").find(".field-val").removeClass(data.className.selected).addClass(data.className.unselected);//NO I18N
                }
                value = jQuery($el).closest(".field").find("input").val();//NO I18N
                jQuery($el).addClass(data.className.selected);
                jQuery($el).parent().find("input").trigger('click');
            }
        }

        function setValue($opinionScale, value) {
            var starNumber = value / data.step;
            if (starNumber <= data.max_val) {
                data.trail = true;
                changeValue($opinionScale.find(".field").eq(starNumber - 1).find(".field-val"));
                data.trail = false;
            }
        }

        function closecmdDialog() {
            jQuery('.surveyadd-container').remove();
        }

        function init() {
            $el.append("<div class='opinion-scale' data-name='Opinion Scale'><div></div></div>");
            $opinionScale = $el.find(".opinion-scale").last().find("div");
            for (var i = data.least_val; i <= data.max_val; i += data.step) {
                $opinionScale.append("<div class='field'><input type='radio' style='opacity:0;' name='" + data.name + "' value='" + i + "' /><div class='field-val " + data.className.unselected + "'>" + i + "</div></div>");
            }
            $opinionScale.parent().append("<div class='opinion-label-container disp-flex justify-content-around'><div class='opinion-label label-left m0 mr3 bgwhite'>" + ZSEC.Encoder.encodeForHTML(data.label.min_label) + "</div><div class='opinion-label label-center bgwhite'>" + ZSEC.Encoder.encodeForHTML(data.label.mid_label) + "</div><div class='opinion-label label-right m0 ml3 bgwhite'>" + ZSEC.Encoder.encodeForHTML(data.label.max_label) + "</div></div>");

			setTimeout(function(){
				var wdh = 49*data.max_val;
				$el.find('.opinion-label-container').width(wdh);
			},200);
			/*
			setTimeout(function(){
				var wdh = (jQuery('.opinion-scale .opinion-label-container').width() - jQuery('.opinion-scale div .field:first-child').width()) / 2;
				jQuery('.opinion-scale .label-center').attr('style','left:'+wdh+'px;');
			},1);
            */
			$opinionScale.find(".field-val").on('click', function(evt) {
                changeValue(jQuery(evt.target));
                if (data.events.onValueChange) {
                    data.events.onValueChange(value);
                    if (value <= 5) {
                        //negativeFeed(value,jQuery(this));
                    }
                }
            });
            if (data.answer) {
                data.properties.trail = true;
                setValue($opinionScale, data.answer);
                data.properties.trail = false;
            }
            if (!data.properties.trail) {
                $opinionScale.parent().css('position', 'relative');//NO I18N
                $opinionScale.before('<div class="formnoeffect"></div>');
            }
        }
        init();
        return $el;
    }

    /* 
    	####################### BINARYVALUE CLASS ############################
    */
    var BinaryValue = function(options, defaultAnswer, properties) {
        this.options = options;
        this.defaultAnswer = defaultAnswer;
        this.properties = properties;
        this.$ = undefined;
    }
    BinaryValue.prototype = new Answer();
    BinaryValue.prototype.constructor = BinaryValue;
    BinaryValue.prototype.construct = function($el) {
            var data = {
                "fields": this.options,//NO I18N
                "answer": this.defaultAnswer,//NO I18N
                "properties": this.properties//NO I18N
            };
            this.$ = $el.BinaryValue(data);
        }
        /* 
        	####################### BINARY VALUE PLUGIN ############################
        */
    jQuery.fn.BinaryValue = function(data) {
        data = jQuery.extend({
            "properties": {//NO I18N
                "className": {//NO I18N
                    "selected": "selected",//NO I18N
                    "unselected": "",//NO I18N
                    "option_1": "",//NO I18N
                    "option_2": ""//NO I18N
                },
            },
            "fields": [{//NO I18N
                "label": 123,//NO I18N
                "class": "fa fa-check"//NO I18N
            }, {
                "label": 234,//NO I18N
                "class": "fa fa-times"//NO I18N
            }],
            "answer": null,//NO I18N
            "events": {//NO I18N
                "onValueChange": undefined//NO I18N
            }
        }, data);
        var $el = this;
        var value;
        $el.val = function() {
            return value;
        }

        function changeValue($el) {
            if (data.properties.trail) {
                $el.closest(".binary-value").find(".field-val").removeClass(data.properties.className.selected).addClass(data.properties.className.unselected);//NO I18N
                $el.addClass(data.properties.className.selected);
                value = $el.attr("data-value");
            }
        }

        function setValue($binaryValue, value) {
            changeValue($binaryValue.find("[data-value='" + value + "']"));
        }

        function closecmdDialog() {
            jQuery('.surveyadd-container').remove();
        }

        function init() {
            $el.append("<div class='binary-value' data-name='Binary Value'></div>");
            $binaryValue = $el.find(".binary-value").last();
            if(data.fields[0].multiplier > data.fields[1].multiplier)
             {
               $binaryValue.append("<div class='field mt20'><div class='field-val' data-multiplier='"+data.fields[0].multiplier+"' data-value='" + data.fields[0].option_id + "'><i class='" + data.properties.className.option_1 + "'></i> " + ZSEC.Encoder.encodeForHTML(data.fields[0].option_text) + "</div><div class='field-val' data-multiplier='"+data.fields[1].multiplier+"' data-value='" + data.fields[1].option_id + "'><i class='" + data.properties.className.option_2 + "'></i> " +  ZSEC.Encoder.encodeForHTML(data.fields[1].option_text) + "</div></div>");
             }
             else
             {
                $binaryValue.append("<div class='field mt20'><div class='field-val' data-multiplier='"+data.fields[1].multiplier+"' data-value='" + data.fields[1].option_id + "'><i class='" + data.properties.className.option_1 + "'></i> " + ZSEC.Encoder.encodeForHTML(data.fields[1].option_text) + "</div><div class='field-val' data-multiplier='"+data.fields[0].multiplier+"' data-value='" + data.fields[0].option_id + "'><i class='" + data.properties.className.option_2 + "'></i> " + ZSEC.Encoder.encodeForHTML(data.fields[0].option_text) + "</div></div>");
             }

            

            $binaryValue.find(".field-val").on('click', function(evt) {
                if (!jQuery(evt.target).hasClass('field-val')) {
                    changeValue(jQuery(evt.target).parent()); // Icon Click....
                } else {
                    changeValue(jQuery(evt.target));
                }
                if (data.events.onValueChange) {
                    data.events.onValueChange(value);
                }
            });
            if (data.answer) {
                data.properties.trail = true;
                //setValue($binaryValue,data.answer);
                $binaryValue.find(".field-val[data-multiplier=" + data.answer + "]").click();
                data.properties.trail = false;
            }
            if (!data.properties.trail) {
                $binaryValue.parent().css('position', 'relative');//NO I18N
                $binaryValue.append('<div class="formnoeffect"></div>');
            }
        }
        init();
        return $el;
    }



    /* 
    	####################### RADIO BUTTON CLASS ############################
    */
    var RadioButton = function(options, defaultAnswer, properties) {
        this.options = options;
        this.defaultAnswer = defaultAnswer;
        this.properties = properties;
        this.$ = undefined;
    }
    RadioButton.prototype = new Answer();
    RadioButton.prototype.constructor = RadioButton;
    RadioButton.prototype.construct = function($el) {
            this.$ = $el.RadioButton({
                "fields": this.options,//NO I18N
                "answer": this.defaultAnswer,//NO I18N
                "properties": this.properties//NO I18N
            });
        }
        /* 
        	####################### RADIO BUTTON PLUGIN ############################
        */
    jQuery.fn.RadioButton = function(data) {
        var $el = this;
        data = jQuery.extend({
            "name": "radio-" + Math.random(),//NO I18N
            "fields": [],//NO I18N
            "orientation": "y",//NO I18N
            "answer": null,//NO I18N
            "properties": {},//NO I18N
            "events": {//NO I18N
                "onValueChange": undefined//NO I18N
            }
        }, data);
        var value = "";
        $el.val = function() {
            return value;
        }

        function closecmdDialog() {
            jQuery('.surveyadd-container').remove();
        }

        function init() {
            //$el.append("<div class='radio-options form-radio-btn mt10 formradiooneby' data-name='Radio Button'><div class='field'></div></div>");
            $el.append("<div class='radio-options form-radio-btn mt10' data-name='Radio Button'><div class='field'></div></div>");
            $radio = $el.find(".radio-options").last().find(".field");
            if (data.orientation == "x") {
                $radio.addClass("horizontal");
            }
            for (var i = 0; i < data.fields.length; i++) {
                $radio.append("<div class='field-val mb10'><label for='" + data.fields[i].option_id + "' class='radio-inline' style='line-height: 1;'><input type='radio' id='" + data.fields[i].option_id + "' value='" + data.fields[i].option_id +"'multiplier='"+data.fields[i].multiplier + "' name='" + data.name + " '><span id='question_text'>" + ZSEC.Encoder.encodeForHTML(data.fields[i].option_text) + "</span></label></div>");
            }

            $radio.find(".field-val input").on('click', function(evt) {
                if (data.properties.trail) {
                    value = jQuery(evt.target).val();
                    if (data.events.onValueChange) {
                        data.events.onValueChange(evt);
                    }
                }
            });
            if (data.answer) {
                data.properties.trail = true;
                $radio.find(".field-val input[multiplier='" + data.answer + "']").click();
                data.properties.trail = false;
            }
            if (!data.properties.trail) {
                $radio.parent().css('position', 'relative');//NO I18N
                $radio.before('<div class="formnoeffect"></div>');
            }
        }
        init();
        return $el;
    }

    /* 
    	####################### Question Answer ############################
    */

})();