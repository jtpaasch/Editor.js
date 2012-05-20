var Editor = Editor || (function() {
    
    var url = 'save.php';
    var pane = '<textarea class="editor-pane"></textarea>';
    var highlight = 'editor-highlight';
    var save;
    
    var trim = function(text) {
        text = text.replace(/^\s+/, '');
        var i = text.length - 1;
        for (i; i >= 0; i -= 1) {
            if (/\S/.test(text.charAt(i))) {
                text = text.substring(0, i + 1);
                break;
            }
        }
        return text;
    };
    
    var add_class = function(element, class_name) {
        if (element.className.indexOf(class_name) === -1) {
            if (element.className === '') {
                element.className = class_name;
            } else {
                element.className = element.className + ' ' + class_name;
            }
        }
    };
    
    var remove_class = function(element, class_name) {
        element.className = trim(element.className.replace(class_name, ''));        
    };
    
    var on = function(element, event_type, callback) {
        if (element.addEventListener) {
            element.addEventListener(event_type, callback, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event_type, callback);
        }
    };
    
    var setup = function(options) {
        if (options.url) {
            url = options.url;
        }
        if (options.pane) {
            pane = options.pane;
        }
        if (options.highlight) {
            highlight = options.highlight;
        }
        if (options.save) {
            save = options.save;
        }
    };
    
    var register = function(selector) {
        if (document.querySelectorAll !== undefined) {
            var elements = document.querySelectorAll(selector), 
                total = elements.length, i;
            for (i = 0; i < elements.length; i += 1) {
                edit_in_place(elements[i]);
            }
        }
    };
    
    var edit_in_place = function(element) {
        element.onmouseover = function() {
            add_class(element, highlight);
        };
        element.onmouseout = function() {
            remove_class(element, highlight);
        };
        on(element, 'click', edit);
    };
    
    var edit = function(event) {
        event = event || window.event;
        var element = event.srcElement || event.target;
        element.original_html = element.innerHTML;
        element.innerHTML = pane;
        var edit_pane = element.children[0];
        edit_pane.style.width = (element.offsetWidth - 10) + 'px';
        edit_pane.style.height = (element.offsetHeight + 10) + 'px';
        edit_pane.innerHTML = trim(element.original_html);
        edit_pane.focus();
        on(element.childNodes[0], 'blur', update);
    };
    
    var update = function(event) {
        event = event || window.event;
        var edit_pane = event.srcElement || event.target;
        var element = edit_pane.parentNode;
        element.innerHTML = edit_pane.value;
        if (save !== undefined) {
            save(element);
        }
    };
    
    return {
        setup: setup,
        register: register
    };
}());


function save(element) {
    console.log('Saved: ');
    console.log(element);
}
Editor.setup({save: save});
Editor.register('#lipsum, #lorem');
