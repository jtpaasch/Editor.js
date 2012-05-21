/**
 * An 'edit-in-place' module --- lets you edit particular elements on 
 * the page in-place. 
 *
 * To make an element editable, you just need to register it. For 
 * instance, to register an element with an id of 'lastname':
 * 
 *     Editor.register('#lastname');
 *
 * That's all you need to do. The element will then be editable. You can 
 * click on it, and it will turn into a textbox that you can edit.  
 * 
 * You can register many elements all at once, using any valid CSS selector.
 * For instance, this makes all div elements and all elements with a class
 * of 'firstname' editable:
 *
 *     Editor.register('div .firstname');
 *
 * By default, the Editor highlights editable elements when the mouse 
 * hovers over them. You can set the way the highlight looks by defining 
 * a CSS class for your page called 'editor-highlight'. For instance, 
 * this would make editable elements turn yellow on mouse overs:
 * 
 *     .editor-highlight { background: yellow; }
 *
 * If for some reason, your page already uses a class called 
 * 'editor-highlight', you can specify a different class name to use:
 *
 *    Editor.setup({ highlight: 'my-highlight-class' });
 *    Editor.register('#lastname');
 *
 * If you want to save an element that's been edited, you can specify a
 * callback function that gets called when something is edited:
 *
 *    function update(text) {
 *        console.log('New contents: ' + text);
 *    } 
 *
 *    Editor.setup({ save: update });
 *    Editor.register('#lastname');
 *
 * Finally, you can specify a custom textbox:
 * 
 *     Editor.setup({ pane: '<textarea class="my-edit-pane"></textarea>' });
 *
 */
var Editor = Editor || (function() {

    /**
     * The HTML for the Edit pane.
     * @var String
     */    
    var pane = '<textarea class="editor-pane"></textarea>';

    /**
     * The CSS class name for the highlight.
     * @var String
     */
    var highlight = 'editor-highlight';

    /**
     * The Function/method to execute when a field has been edited. 
     * @var Function
     */
    var save;
    
    /**
     * Trim whitespace from both sides of a string.
     * @param String text The text/string to trim.
     * @return String Trimmed text.
     */
    var trim = function(text) {
        
        // Remove space at the front of the string.
        text = text.replace(/^\s+/, '');
        
        // Remove spaces one by one, starting at the end of the string
        // and working backwards until we hit a non-space character.
        var i = text.length - 1;
        for (i; i >= 0; i -= 1) {
            if (/\S/.test(text.charAt(i))) {
                text = text.substring(0, i + 1);
                break;
            }
        }
        
        // Return the trimmed string.
        return text;
    };
	
    /** 
     * Adds a CSS class to an element.
     * @param HTMLElement element The element to add the class to.
     * @param String class_name The name of the class to add to the element.
     * @return Nothing.
     */    
    var add_class = function(element, class_name) {

	// Only proceed if the class isn't already there. 
        if (element.className.indexOf(class_name) === -1) {
            // If the list of class names is empty, add the new class name.
            if (element.className === '') {
                element.className = class_name;
            } 
            
            // If the list of class names is not empty, first add a space,
            // then the class name (class names are separated by spaces).
            else {
                element.className = element.className + ' ' + class_name;
            }
        }
    };
    
    /**
     * Removes a CSS class from an element.
     * @param HTMLElement element The element to remove the class from.
     * @param String class_name The class name to remove.
     * @return Nothing.
     */
    var remove_class = function(element, class_name) {
        
        // Remove the class name, then trim the list of class names 
        // to make sure there are no rogue spaces.
        element.className = trim(element.className.replace(class_name, ''));        
    };
    
    /**
     * Adds an event handler to an element. 
     * @param HTMLElement element The element to add the handler to.
     * @param String event_type The type of event to handle (e.g., "click").
     * @param Function callback The function to execute when the event occurs. 
     * @return Nothing.
     */
    var on = function(element, event_type, callback) {
        
        // Webkit and Mozilla browsers use 'addEventListener' 
        // to add listeners to objects.
        if (element.addEventListener) {
            element.addEventListener(event_type, callback, false);
        } 
        
        // IE uses 'attachEvent' to add listeners instead. IE 
        // also prefixes event types with 'on'. 
        else if (element.attachEvent) {
            element.attachEvent('on' + event_type, callback);
        }
    };
    
    /**
     * Removes an event handler from an element. 
     * @param HTMLElement element The element to remove the handler from.
     * @param String event_type The type of event (e.g., "click").
     * @param Function callback The function to remove. 
     * @return Nothing.
     */
    var detach = function(element, event_type, callback) {
        
        // Webkit and Mozilla browsers use 'removeEventListener' 
        // to remove listeners from objects.
        if (element.removeEventListener) {
            element.removeEventListener(event_type, callback, false);
        } 
        
        // IE uses 'detachEvent' to remove listeners instead. IE 
        // also prefixes event types with 'on'. 
        else if (element.detachEvent) {
            element.detachEvent('on' + event_type, callback);
        }
    };
    
    /**
     * Sets up the editor by setting options.
     * @param Object options Options are: 
     *                       (a) pane: the HTML of the editor pane.
     *                       (b) highlight: CSS class name for the highlight.
     *                       (c) save: the function to execute after editing.
     * @return Nothing.
     */
    var setup = function(options) {
        
        // Set the HTML for the edit pane/textbox that shows 
        // when the user clicks an editable element.
        if (options.pane) {
            pane = options.pane;
        }
        
        // Set the name of the CSS class that controls the highlight.
        // The highlight occurs when the user hovers over an editable element.
        if (options.highlight) {
            highlight = options.highlight;
        }
        
        // Set the function that should be executed when an element 
        // has been edited.
        if (options.save) {
            save = options.save;
        }
    };

    /**
     * Registers elements --- this makes them editable.
     * @param String selector The CSS selector that selects the elements you
     *                        want to make editable.  
     */    
    var register = function(selector) {
        
        // Make sure 'querySelectorAll' is available.
        // (IE 7 and lower does not support it.)
        if (document.querySelectorAll !== undefined) {
        	
      	    // Call the 'edit_in_place' method for each selected element.
            var elements = document.querySelectorAll(selector), 
                total = elements.length, i;
            for (i = 0; i < elements.length; i += 1) {
                edit_in_place(elements[i]);
            }
        }
    };
    
    /**
     * Makes an element editable. It does this by doing two things: 
     * (a) adds the highlight CSS class during mouseovers/hover, 
     * (b) calls the 'edit' method when the element is clicked. 
     * @param HTMLElement element The element to make editable.
     * @return Nothing.
     */
    var edit_in_place = function(element) {
        
        // When the user hovers over an editable element,
        // add the CSS highlight class. 
        element.onmouseover = function() {
            add_class(element, highlight);
        };
        
        // When the user moves their mouse off an editable 
        // element, remove the CSS highlight class.
        element.onmouseout = function() {
            remove_class(element, highlight);
        };
        
        // When the user clicks on the element, execute the 'edit' method.
        on(element, 'click', edit);
    };
    
    /**
     * Converts an element into an editable textbox.
     * @param Event event The event (a mouse click) that triggered this method.
     * @return Nothing.
     */ 
    var edit = function(event) {
        
        // Get a reference to the event and target element. 
        event = event || window.event;
        var element = event.srcElement || event.target;
        
        // Make this element un-editable while it's being edited.
        // (We don't want to edit the edit pane/textbox!)
	detach(element,'click', edit);
        
        // Save the original HTML of this element 
        // and replace it with the edit pane/textbox.
        element.original_html = element.innerHTML;
        element.innerHTML = pane;
        
        // Set the edit pane to the same width/height as the element.
        var edit_pane = element.children[0];
        edit_pane.style.width = (element.offsetWidth - 10) + 'px';
        edit_pane.style.height = (element.offsetHeight + 10) + 'px';
        
        // Put the original HTML into the edit pane/textbox, and 
        // put the focus on the textbox.
        edit_pane.innerHTML = trim(element.original_html);
        edit_pane.focus();
        
        // When the user changes focus elsewhere on the page,
        // execute the 'update' method.
        on(element.childNodes[0], 'blur', update);
    };
    
    /**
     * Update the element with the new content. 
     * @param Event event The event (a blur) that triggered this method.
     * @return Nothing.
     */
    var update = function(event) {
    	
    	// Get a reference to the event and the edit pane/textbox. 
        event = event || window.event; 
        var edit_pane = event.srcElement || event.target;
        
        // Set the element's inner HTML to whatever was typed 
        // into the edit pane/textbox.
        var element = edit_pane.parentNode;
        element.innerHTML = edit_pane.value;
        
        // Make this element editable again.
        on(element, 'click', edit);
        
        // If a 'save' function is defined, execute it.
        if (save !== undefined) {
            save(element);
        }
    };
    
    /**
     * Only expose 'setup' and 'register' as public methods. 
     */
    return {
        setup: setup,
        register: register
    };
}());