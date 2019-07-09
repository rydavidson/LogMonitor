function StylesDialog(guiManager, controller, stateManager){
    assert(guiManager,   "Expected a valid guiManager",   "StylesDialog constructor");
    assert(controller,   "Expected a valid controller",   "StylesDialog constructor");
    assert(stateManager, "Expected a valid stateManager", "StylesDialog constructor");
    
    var that = this;

    var tmpColStyles = null;
    var currentStyle = null;
    
 // visible property
    var visible = false;
    this.getVisible = function(){
        return visible;
    };
    this.setVisible = function(newValue){
           assert((newValue === true) || (newValue === false), 
               "Expected newValue to be either true or false", "StylesDialog .setVisible()");    
        visible = newValue;
    };
    
 // GUI event handlers
    this.onStyleDialogMouseDown = function(event){
        guiManager.dragStyleDialog(event);
    };
    
    this.onBtnStylesOk = function() {
        var target = stateManager.getTargetWithFocus();
        assert(stateManager.getTargetWithFocus() instanceof Target, 'target with focus was not a Target object', 'onBtnStylesOk');
        
        assert(tmpColStyles !== null, 'Expected non-null temp styles array', 'onBtnStylesOk');
        
        function applyStylesToTarget(styles, target){
            assert( target !== null, 'expected a non-null target', 'applyStylesToTarget');
            for( var i = 0; i < styles.length; i++ ){
                target.setColStyle(i, styles[i]);
            }
        }
        applyStylesToTarget(tmpColStyles, target);
        tmpColStyles = null;
    
        that.hide();
    };
    
    this.onBtnStylesCancel = function() {
        tmpColStyles = null;
        that.hide();    
    };
    
    this.onSelectedColumnIndexChanged = function(colIndex){
        assert(tmpColStyles instanceof Array, '_tmpColStyles not an array: ' + tmpColStyles, 'onSelectedColumnIndexChanged');
        
        assert(colIndex >= 0 && colIndex < tmpColStyles.length, 'bad style index: ' + colIndex, 'onSelectedColumnIndexChanged');
    
        setCurrentStyle( tmpColStyles[colIndex] );
    
        updateDialogForNewStyle();
        guiManager.applyStylesToDisplay();
    };
    
    this.onHiddenCheckboxChanged = function(){
        assert(currentStyle, '_currentStyle has not been set', '_getCurrentStyle');
    
        var checkBoxIsChecked = guiManager.getElement('checkStyleHidden').checked;
        getCurrentStyle().setVisible(!checkBoxIsChecked);
        
        updateSampleText();
    };
    
    this.onColourTypeChanged = function(){
        highlightColourBox(getCurrentColour());
    };
    
    this.onColourSelected = function(colour){
        assert("string" === (typeof colour), 'colour was not a String object', 'onColourSelected');
        
        highlightColourBox(colour);
    
        if (guiManager.getElement('colourTypeBack').checked){
            getCurrentStyle().setBackColour(colour);
        } else if (guiManager.getElement('colourTypeFore').checked){
            getCurrentStyle().setForeColour(colour);
        } else {
            assert( false, 'Expected either forecolour or backcolour to be set', 'StylesDialog.onColourSelected');        
        }
        updateSampleText();
    };
    
 // show/hide    
    this.show = function(stylesArray){
        assert(stylesArray instanceof Array, 'stylesArray was not an Array object', 'StylesDialog .show');
        tmpColStyles = stylesArray; // a copy is passed in so we don't need to clone it
        
        function setupStylesList(styles){
            var list = guiManager.getElement('selColStyle');
            var children = list.childNodes;
            var i;
            for (i = children.length - 1; i >= 0; i-- ){
                list.removeChild(children[i]);    
            }
            var item, textNode;
            for (i = 0; i < stylesArray.length; i++ ){
                item     = document.createElement('option');
                textNode = document.createTextNode(i);
                item.appendChild(textNode);
                list.appendChild(item);
            }
        }
        setupStylesList(stylesArray);
        
        setCurrentStyle(tmpColStyles[0]);
    
        guiManager.getElement('styles').style.display = 'block';
        guiManager.getElement('styles').style.top     = '100px';
        guiManager.getElement('styles').style.left    = '200px';
        
        visible = true;
        
     // Need to do these here because IE won't allow this if the dialog is hidden
     // TODO?
        guiManager.getElement('selColStyle').onchange     = guiManager.attachHandler( controller, "onSelectedColumnIndexChanged");
        guiManager.getElement('colourTypeFore').onclick   = guiManager.attachHandler( controller, "onColourTypeChanged");
        guiManager.getElement('colourTypeBack').onclick   = guiManager.attachHandler( controller, "onColourTypeChanged");
        guiManager.getElement('checkStyleHidden').onclick = guiManager.attachHandler( controller, "onHiddenCheckboxChanged");
        guiManager.getElement('btnStylesOk').onclick      = guiManager.attachHandler( controller, "onBtnStylesOk");
        guiManager.getElement('btnStylesCancel').onclick  = guiManager.attachHandler( controller, "onBtnStylesCancel");
        guiManager.getElement('styles').onmousedown       = guiManager.attachHandler( controller, "onStyleDialogMouseDown");
        
        var target = stateManager.getTargetWithFocus();
        assert(target !== null, 'expected non-null target with focus', 'showStylesDialog');
        
        guiManager.getElement('lblStylesTitle').innerHTML = "Column Styles for " + target.getName();
        guiManager.getElement('selColStyle').selectedIndex=0;
        guiManager.getElement('selColStyle').focus();
            
        guiManager.getElement('colourTypeFore').checked = true;
        guiManager.applyHighlightingToDisplay(0);
        updateDialogForNewStyle();
        guiManager.applyStylesToDisplay();
    };
    this.hide = function(){
        guiManager.getElement('styles').style.display  = 'none';
        visible = false;
        guiManager.onStyleDialogClosed();    
    };

 // ################    
    function getCurrentStyle(){
        assert(currentStyle, '_currentStyle has not been set', '_getCurrentStyle');
        return currentStyle;
    }
    
    function setCurrentStyle(newStyle){
        assert(newStyle instanceof ColStyle, 'newStyle is not a ColStyle object', '_setCurrentStyle');
        currentStyle = newStyle;
    }
    
    function updateDialogForNewStyle(){
        updateSampleText();    
        
        highlightColourBox(getCurrentColour());
        
        guiManager.getElement('checkStyleHidden').checked = ! getCurrentStyle().getVisible();
    }
    
    function getCurrentColour(){
     // Gets the fore/backcolour from the current style, according to the state of the radio buttons
        assert(currentStyle, 'currentStyle has not been set', 'getCurrentColour');
        
        var colour;
        var style = getCurrentStyle();
        if (guiManager.getElement('colourTypeBack').checked){
            colour = style.getBackColour();
        } else if (guiManager.getElement('colourTypeFore').checked){
            colour = style.getForeColour();
        } else {
            assert( false, 'Expected either forecolour or backcolour to be set', 'getCurrentColour');        
        }
        return colour;
    }
    
    function updateSampleText(){
        var style = getCurrentStyle();
        
        if ( style.getVisible() ){
            guiManager.getElement('styleSample').innerHTML        = 'Sample Text';
            guiManager.getElement('styleSample').style.color      = style.getForeColour();
            guiManager.getElement('styleSample').style.background = style.getBackColour();
        } else {
            guiManager.getElement('styleSample').innerHTML = '';
            guiManager.getElement('styleSample').style.background = '';
        }
    }
    
    function highlightColourBox(colour){
     // Select the correct colour box from the Colour Picker
        var colPickerBox;
        var foundColour = false;
        
        var COLOURS = guiManager.COLOUR_SELECTION;
        var PREFIX  = guiManager.COL_PICKER_ID_PREFIX;
           for ( var i = 0; i < COLOURS.length; i++ ) {
               colPickerBox = guiManager.getElement(PREFIX + COLOURS[i]);
               if ( colour === COLOURS[i] ) {
                   colPickerBox.className = 'colourBoxSelected';
                   foundColour = true;
               } else {
                   colPickerBox.className = 'colourBox';                     
               }
           }
        assert(foundColour, 'colour ' + colour + ' was not found in the colour picker', '_highlightColourBox');
    }    
    
}


