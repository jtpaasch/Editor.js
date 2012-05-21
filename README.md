Editor
======

A javascript "edit in place" module --- lets you edit particular elements on 
the page in-place. 

To make an element editable, you just need to register it. For 
instance, to register an element with an id of 'lastname':
 
     Editor.register('#lastname');

That's all you need to do. The element will then be editable. You can 
click on it, and it will turn into a textbox that you can edit.  
 
You can register many elements all at once, using any valid CSS selector.
For instance, this makes all div elements and all elements with a class
of 'firstname' editable:

     Editor.register('div .firstname');

By default, the Editor highlights editable elements when the mouse 
hovers over them. You can set the way the highlight looks by defining 
a CSS class for your page called 'editor-highlight'. For instance, 
this would make editable elements turn yellow on mouse overs:

    .editor-highlight { background: yellow; }

If for some reason, your page already uses a class called 
'editor-highlight', you can specify a different class name to use:

    Editor.setup({ highlight: 'my-highlight-class' });
    Editor.register('#lastname');

If you want to save an element that's been edited, you can specify a
callback function that gets called when something is edited:

    function update(text) {
        console.log('New contents: ' + text);
    } 

    Editor.setup({ save: update });
    Editor.register('#lastname');

Finally, you can specify a custom edit pane/textbox for the editing 
if the default does not suit your needs:
 
     Editor.setup({ pane: '<textarea class="my-edit-pane"></textarea>' });
 