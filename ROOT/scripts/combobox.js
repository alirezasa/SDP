/* $Id$ */
var isIE = navigator.appName == 'Microsoft Internet Explorer' && navigator.userAgent.indexOf('Opera') < 1 ? 1 : 0;//No i18N
var isOp = navigator.userAgent.indexOf('Opera') > -1 ? 1 : 0;//No i18N
var isGe = navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('Safari') < 1 ? 1 : 0;//No i18N

function ComboBox() {
	this.options = new Array();
	this.onchange = undefined;
	this.onbeforeclick = undefined;
	this.selectedIndex = undefined;
	this.defaultSelectedIndex = 0;
	this.getSelectedValue = _ComboBox_getSelectedValue;
	this.appendOption = _ComboBox_appendOption;
	this.showOptions = _ComboBox_showOptions;
	this.hideOptions = _ComboBox_hideOptions;
	this.init = _ComboBox_init;
	this.root = undefined;
	this.selectOption = _ComboBox_selectOption;
	this.selectIndex = _ComboBox_selectIndex;
	this.toString = _ComboBox_toString;
}

ComboBox.docs = new Array();

ComboBox.getPos = function(el) {
	var r = { offsetLeft: el.offsetLeft, offsetTop: el.offsetTop };
	if (el.offsetParent) {
		var tmp = ComboBox.getPos(el.offsetParent);
		r.offsetLeft += tmp.offsetLeft;
		r.offsetTop  += tmp.offsetTop;
		r.offsetRight += tmp.offsetRight;
	}
	return r;
}

ComboBox.comboBoxes = new Array();

ComboBox.addComboBox = function(comboBox) {
	ComboBox.comboBoxes[ComboBox.comboBoxes.length] = comboBox;
}

ComboBox.addDoc = function(doc) {
	ComboBox.docs[ComboBox.docs.length] = doc;
}
// normal event handling
ComboBox.addEvent = function(el, evname, func) {
	if (isIE) {
		el.attachEvent("on" + evname, func);//No i18N
	} else {
		el.addEventListener(evname, func, true);
	}
}

ComboBox.removeEvent = function(el, evname, func) {
	if (isIE) {
		el.detachEvent("on" + evname, func);//No i18N
	} else {
		el.removeEventListener(evname, func, true);
	}
};

ComboBox.documentClick = function(ev) {
	ev || (ev = window.event);
	var el = isIE ? ev.srcElement : ev.target;
	var ele = el;
	var div = undefined;
	for (var i=0;i<ComboBox.comboBoxes.length;i++) {
		var comboBox = ComboBox.comboBoxes[i];
		el = ele;
		div = document.getElementById(comboBox.id);

		for (; el != null && el != div; el = el.parentNode);
		if (el == null) {
			div.style.display="none";//No i18N
			var docs = ComboBox.docs;
			if (docs) {
				for (var j=0;j<docs.length;j++) {
					ComboBox.removeEvent(docs[j], "mousedown", ComboBox.documentClick);//No i18N
				}
			}
		}
	}
}

function _ComboBox_appendOption(option) {
	var comboBox = this;
	this.box.appendChild(option.optionEle);
	option.optionEle.onclick = function(ev) {
		comboBox.selectOption(option);
		comboBox.hideOptions();
		if (typeof comboBox.onchange == "function") {
			comboBox.onchange();
		}
	}

	option.optionEle.onmouseover = function(ev) {
		option.optionEle.className = "boldtext";//No i18N
	}	

	option.optionEle.onmouseout = function() {
		option.optionEle.className = "boxdis";//No i18N
	}


	option.index = this.options.length;
	if (option.selected == true || option.index == comboBox.defaultSelectedIndex) {
		comboBox.selectOption(option);
	}
	this.options[this.options.length] = option;
	
}

function _ComboBox_init() {
	var comboBox = this;
	this.root = document.createElement("div");
	this.root.className = "combo";//No i18N
	this.root.onmousedown = function() {
		if (typeof comboBox.onbeforeclick == "function") {
			comboBox.onbeforeclick();
		}
	}

	this.root.onclick = function(event) {
		var ev = (isIE) ? window.event : event;
		var target = (isIE) ? ev.srcElement : ev.target;
		var r = ComboBox.getPos(target);
		var x = r.offsetLeft;
		var y = r.offsetTop + target.offsetHeight-5;
		comboBox.showOptions(x, y);

		ComboBox.addEvent(document, "mousedown", ComboBox.documentClick);//No i18N
		/* If there exists other doc object - i mean iframe - add events for that also */
		if (ComboBox.docs) {
			for (var i=0;i<ComboBox.docs.length;i++) {
				var doc = ComboBox.docs[i];
				ComboBox.addEvent(doc, "mousedown", ComboBox.documentClick);//No i18N
			}
		}

	}
	this.box = document.createElement("div");
	this.box.className="box";//No i18N
	this.box.style.display="none";//No i18N
	ComboBox.addComboBox(this.box);
	this.box.id = "box"+ComboBox.comboBoxes.length;//No i18N
	document.body.appendChild(this.box);
	return this.root;
}

function _ComboBox_selectOption(option) {
	option.selected = true;
	option.className="boxdis boldtext";//No i18N
	var value = option.optionEle.firstChild.nodeValue;
	// The value is set to "" since the drop down icon will have very less space for text display
	value = "";
	if (value && value.length > 10) {
		value = value.substring(0,7) + "...";//No i18N
	}
	var tNode = document.createTextNode(value);

	var firstChild = this.root.firstChild;
	if (firstChild) {
		this.root.removeChild(firstChild);
	}
	this.root.appendChild(tNode);
	this.root.title = option.value;

	this.selectedIndex = option.index;
	this.selectedOption = option;
	/* Unselect other options */
	for (var i=0;i<this.options.length;i++) {
		var obj = this.options[i];
		if (obj != option) {
			obj.selected = false;
			obj.optionEle.className="boxdis";//No i18N
		}
	}
}

function _ComboBox_selectIndex(index) {
	var options = this.options;
	for (var i=0;i<options.length;i++) {
		var option = options[i];
		if (option.index == index) {
			this.selectOption(option);
			break;
		}
	}
}

function _ComboBox_getSelectedValue() {
	return this.selectedOption.value;
}

function _ComboBox_showOptions(left, top) {
	this.box.style.position="absolute";//No i18N
	this.box.style.left = left+'px';
	this.box.style.top = top+'px';
	this.box.style.display="block";//No i18N
}

function _ComboBox_hideOptions() {
	this.box.style.display="none";//No i18N
}

function _ComboBox_toString() {
	return "ComboBox"; // No I18N
}

function ComboOption() {
	this.selected = false;
	this.optionEle = undefined;
	this.create = _ComboOption_create;
	this.index = undefined;
	this.value = undefined;
}

function _ComboOption_create(value, id) {
	var ele = document.createElement("div");
	ele.className="boxdis"; // No I18N
	if (id) {
		ele.id=id;
	}
	var tNode = document.createTextNode(value);
	ele.appendChild(tNode);
	this.optionEle = ele;
	this.value = value;
}


