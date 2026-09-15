/* $Id$ */
  	 
  	 /**
  	  *  This JS file will keep all the event handling JS code
  	  */
  	 
  	 
  	 /**
  	  * This function will check if Enter Key is pressed
  	  * If so will call the given function with the given parameters
  	  * If no function is passed then it will just stop the default behaviour of the ENTER Key
  	  * evt    - event
  	  * func   - function name
  	  * scope  - function scope
  	  * params - an array of function parameters
  	  * propagate - true/false wheter to stop Event Propagation/Bubbling
  	  */
  	 function handleEnterKey(evt, func, scope, params, propagate)
  	 {
  	     key = getEventKey(evt);
  	     if(key == 13) {     // if ENTER key
  	         //sdlog(Object.keys(evt));
  	         if(scope == null)       { scope = window; }
  	         if(func != null)        { func.apply(scope, params); }
  	         if(propagate != true)   { cancelEvent(evt); }
  	     }
  	 }
  	 
  	 /* This function will return the Event keycode */
  	 function getEventKey(evt) {
  	     if(window.event) { // IE
  	         getEventKey = function(evt) {
  	             return window.event.keyCode;
  	         }
  	     }
  	     else { // Mozilla
  	         getEventKey = function(evt) {
  	             return evt.which;
  	         }
  	     }
  	     return getEventKey(evt);
  	 }
  	 
  	 /* Tis function will stop event bubbling/propagation */
  	 function cancelEvent(evt)
  	 {
  	     if(window.event) { // IE
  	         cancelEvent = function(evt) {
  	            (evt.preventDefault) ? evt.preventDefault() : evt.returnValue = false;
  	             evt.cancelBubble = true;
  	             //window.event.cancelBubble = true;
  	         }
  	     }
  	     else { // Mozilla
  	         cancelEvent = function(evt) {
  	             evt.preventDefault();
  	             evt.stopPropagation();
  	         }
  	     }
  	     cancelEvent(evt);
  	 }