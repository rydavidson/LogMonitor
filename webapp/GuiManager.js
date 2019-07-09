function GuiManager(controller, stateManager){
    var that = this;
    
    this.COLOUR_SELECTION = [
        '#FF0000','#FF4444','#FF8888','#FFAAAA','#FFDDDD', 
        '#FFFF00','#FFFF44','#FFFF88','#FFFFAA','#FFFFDD',
        '#00FF00','#44FF44','#88FF88','#AAFFAA','#DDFFDD',
        '#00FFFF','#44FFFF','#88FFFF','#AAFFFF','#DDFFFF',
        '#0000FF','#4444FF','#8888FF','#AAAAFF','#DDDDFF',
        '#FF00FF','#FF44FF','#FF88FF','#FFAAFF','#FFDDFF',
        '#000000','#FFFFFF'];

    this.attachHandlers = function(){
        that.getElement('updateNowButton').onclick = that.attachHandler( controller, "onUpdateNowButtonClick");
        that.getElement('optionsButton').onclick   = that.attachHandler( controller, "onOptionsButtonClick");
        that.getElement('stylesButton').onclick    = that.attachHandler( controller, "onStylesButtonClick");
        that.getElement('filterButton').onclick    = that.attachHandler( controller, "onFilterButtonClick");
    };
    
    this.attachHandler = function(handlerObject, handlerMethodName){
        return function(e){
            handlerObject[handlerMethodName](e);
        };
    };
    
    /* ######## Main Screen Event Handlers ######## */
    this.showOptionsDialog = function(){
        enableCSS(1,false);
        enableCSS(2,true);
        applyDisabledStyleToDisplay();
        optionsDialog.show(stateManager.getTargetWithFocus());
        that.dialogOnDisplay = 'options';            
    };
    
    this.showStylesDialog = function(){
        enableCSS(1,false);
        enableCSS(2,true);
        applyDisabledStyleToDisplay();    
        stylesDialog.show(stateManager.getTargetWithFocus().getColStyles());
        that.dialogOnDisplay = 'styles';        
    };
    
    
    /* ######## Options Dialog Event Handlers ######## */
    this.onOptionsDialogMouseDown = function(e){
        assert(optionsDialog.getVisible(), 'Expected options dialog to be visible', 'onOptionsDialogMouseDown');
        optionsDialog.onOptionsDialogMouseDown(e);
    };
    this.onBtnOptionsOkClick = function() {
        assert(optionsDialog.getVisible(), 'Expected options dialog to be visible', 'onBtnOptionsOkClick');
        optionsDialog.onBtnOptionsOkClick();
    };
    this.onBtnOptionsCancelClick = function() {
        assert(optionsDialog.getVisible(), 'Expected options dialog to be visible', 'onBtnOptionsCancelClick');
        optionsDialog.onBtnOptionsCancelClick();
    };
    this.onOptionsDialogClosed = function(ok){
        assert(!optionsDialog.getVisible(), 'Expected options dialog not to be visible', 'GuiManager.onOptionDialogClosed'); 
        assert(that.dialogOnDisplay === 'options', 'Expected dialogOnDisplay to be "options"', 'GuiManager.onOptionDialogClosed');     
        that.dialogOnDisplay = null;
        enableCSS(1,true);
        enableCSS(2,false);    
        controller.onOptionsDialogClosed(ok);
    };
    
    
    /* ######## Styles Dialog Event Handlers ######## */
    this.onSelectedColumnIndexChanged = function(){ 
        assert(stylesDialog.getVisible(), 'Expected styles dialog to be visible', 'GuiManager.onSelectedColumnIndexChanged'); 
        var colIndex = that.getElement('selColStyle').selectedIndex;
        stylesDialog.onSelectedColumnIndexChanged(colIndex); 
        that.applyHighlightingToDisplay(colIndex);
    };
    this.onColourTypeChanged          = function(){ 
        assert(stylesDialog.getVisible(), 'Expected styles dialog to be visible', 'GuiManager.onColourTypeChanged'); 
        stylesDialog.onColourTypeChanged();
    };
    this.onColourTypeChanged          = function(){ 
        assert(stylesDialog.getVisible(), 'Expected styles dialog to be visible', 'GuiManager.onColourTypeChanged'); 
        stylesDialog.onColourTypeChanged();
    };
    this.onHiddenCheckboxChanged      = function(){ 
        assert(stylesDialog.getVisible(), 'Expected styles dialog to be visible', 'GuiManager.onHiddenCheckboxChanged'); 
        stylesDialog.onHiddenCheckboxChanged();
    };
    this.onBtnStylesOk                = function(){ 
        assert(stylesDialog.getVisible(), 'Expected styles dialog to be visible', 'GuiManager.onBtnStylesOk'); 
        stylesDialog.onBtnStylesOk();
    };
    this.onBtnStylesCancel            = function(){ 
        assert(stylesDialog.getVisible(), 'Expected styles dialog to be visible', 'GuiManager.onBtnStylesCancel'); 
        stylesDialog.onBtnStylesCancel();
    };
    this.onStyleDialogMouseDown       = function(e){ 
        assert(stylesDialog.getVisible(), 'Expected styles dialog to be visible', 'GuiManager.onStyleDialogMouseDown'); 
        stylesDialog.onStyleDialogMouseDown(e);
    };
    this.onStyleDialogClosed         = function(){ 
        assert(!stylesDialog.getVisible(), 'Expected styles dialog not to be visible', 'GuiManager.onStyleDialogClosed'); 
        assert(that.dialogOnDisplay === 'styles', 'Expected dialogOnDisplay to be "styles"', 'GuiManager.onStyleDialogClosed');     
        this.applyHighlightingToDisplay(-1);
        enableCSS(1,true);
        enableCSS(2,false);    
        that.dialogOnDisplay = null;
        controller.onStyleDialogClosed();
    };
    this.onColourSelected            = function(colour){
        assert(stylesDialog.getVisible(), 'Expected styles dialog to be visible', 'GuiManager.onColourSelected'); 
        stylesDialog.onColourSelected(colour);
    };
    
    /* ################ Options Dialog ################ */
    this.dragOptionsDialog = function(event){
        dragStart(event, 'options');
    };
    
    this.dragStyleDialog = function(event){
        dragStart(event, 'styles');
    };
    
    /* ################ Main Display ################ */
    this.setProgressBarWaiting = function(){
        that.setProgressBarMsg('waiting...');
    };
    this.setProgressBarMsg = function(msg){
        var progressBar = that.getElement('progressInner');
        progressBar.style.width = PROGRESS_BAR_WIDTH + "px";
        progressBar.innerHTML   = msg;
    };
    this.setProgressBarValue = function(value, maxValue){
        var progressBar = that.getElement('progressInner');
        progressBar.innerHTML   = '';
        progressBar.style.width = PROGRESS_BAR_WIDTH * Number( value / maxValue ) + "px";
    };
    
    function setProgressBarBroken(){
        that.setProgressBarMsg('Error');
    }
    
    this.setTargetStatus = function(target){
        var targetDiv = that.getElement(target.getName());    
        
        if (!target.getBroken()){
            if ( target.getHasFocus() ){
                if ( target.getHasUnviewedUpdates() ) {
                    targetDiv.className = 'logLinkFocusChanged';
                } else {
                    targetDiv.className = 'logLinkFocus';
                }
                
            } else {
                if ( target.getHasUnviewedUpdates() ) {
                    targetDiv.className = 'logLinkChanged';
                } else {
                    targetDiv.className = 'logLink';
                }
            }
        } else {
            targetDiv.className = 'logLinkBroken';
        }
    };
    
    this.showErrorMessage = function(msg){
		var errorBoxElement = document.createElement('div');
		errorBoxElement.setAttribute('id', 'errorBox');
		
	 // Add a title
		var errBoxTitle = document.createElement('div');
		errBoxTitle.setAttribute('id', 'errorBoxTitle');
		errBoxTitle.appendChild(document.createTextNode("Error"));
		errorBoxElement.appendChild(errBoxTitle);

	 // Add a place for the message to go
		var errBoxMsg = document.createElement('div');
		errBoxMsg.appendChild(document.createTextNode(msg));
		errorBoxElement.appendChild(errBoxMsg);
		
	 // Add a boilerplate message at the bottom
		var errBoxFooter = document.createElement('div');
		errBoxFooter.setAttribute('id', 'errorBoxFooter');		
		errBoxFooter.appendChild(document.createTextNode("Click the 'Refresh' button below to try again"));
		errorBoxElement.appendChild(errBoxFooter);   		

		var textArea = that.getElement('textArea');	
		textArea.appendChild(errorBoxElement);
		errorBox = that.getElement('errorBox', true, false);
    };
    
    this.clearDisplay = function(textArea){
        if (!textArea){
            textArea = that.getElement('textArea');
        }
        clearVolatileElements();
        var children = textArea.childNodes;
        for( var i = children.length - 1; i >= 0; i-- ){
            textArea.removeChild(children[i]);    
        }
    };
    this.showTargetText = function(target){
        var span;
        var textNode;
        var br;
        var divider;
        
        var textArea = that.getElement('textArea');
        that.clearDisplay(textArea);
        
        for ( var i = 0; i < target.getRowCount(); i++ ){
            var colCount = target.getColCount(i);
            for ( var j = 0; j < colCount; j++ ){
                span = document.createElement('span');
                span.setAttribute('id', 'row' + i + 'col' + j);
                textNode = document.createTextNode(target.getValue(i,j));
                span.appendChild( textNode );
                textArea.appendChild(span);                    
            }
            br = document.createElement('br');
            textArea.appendChild(br);                    
            if ( target.getShowDividers() ){
                divider = document.createElement('div');
                divider.className = 'divider';
                textArea.appendChild(divider);      
            }
        }
        that.applyStylesToDisplay();
    };
    this.updateErrorStatus = function(target){
        assert(target instanceof Target, "Expected target to be a Target instance", "updateErrorStatus");
        
        var isBroken = target.getBroken();
        assert(isBroken === true || isBroken === false, "Expected isBroken to be a boolean value", "updateErrorStatus");
        
        if (isBroken){
            setProgressBarBroken();
            that.showErrorMessage(target.getErrorMsg());
        } else {
            //
        }
    };
    this.setCurrentStyles = function(styles){
        assert(styles instanceof Array, "Expected currentStyles to be an Array instance", "setCurrentStyles");
        currentStyles = styles;
        that.applyStylesToDisplay();
    };
    
    this.applyStylesToDisplay = function(){
        var styles = currentStyles;
        assert(styles instanceof Array, "Expected currentStyles to be an Array instance", "applyStylesToDisplay");
        for( var i = 0; i < styles.length; i++ ){
            applyStyleToColumn( i, styles[i]);
        }
    };
    
    this.applyHighlightingToDisplay = function(highlightedColIndex){
        var styles = currentStyles;
        for( var i = 0; i < styles.length; i++ ){
              styles[i].setHighlight(i===highlightedColIndex);
        }
        that.applyStylesToDisplay();
    };

    this.updateTargetList = function() {
        var html='';
        var thisTarget;
        var leftBar = that.getElement('leftBar');
        var targetBox;
        var textNode;
       
        var childNode;
        var i;
        for ( i = leftBar.childNodes.length - 1; i >= 0; i-- ){
           childNode = leftBar.childNodes[i];
           leftBar.removeChild(childNode);
        }
       
        var targetCount = stateManager.getTargetCount();
        var target;
        for ( i = 0; i < targetCount; i++ ){
            target = stateManager.getTargetByIndex(i);
            targetBox = document.createElement('div');
               
            targetBox.setAttribute('id', target.getName());
            targetBox.className = 'logLink';
            targetBox.onclick = controller.buildTargetClickHandler(target.getName());
               
            textNode = document.createTextNode(target.getName());
          
            targetBox.appendChild(textNode);
            leftBar.appendChild(targetBox);
        }
        addVersionBox(leftBar);
    };
    
    function addVersionBox(leftBar){
        var versionBox = document.createElement('div');
        versionBox.setAttribute('id', 'versionBox');
        
           versionBox.appendChild(document.createTextNode(CONFIG.appName));
           versionBox.appendChild(document.createElement('br'));
           versionBox.appendChild(document.createTextNode(CONFIG.appVersion));
           versionBox.appendChild(document.createElement('br'));
           
           var link = document.createElement('a');
           link.setAttribute('href', CONFIG.appLink);
        link.appendChild(document.createTextNode(CONFIG.appLinkText));
        versionBox.appendChild(link);
        
           leftBar.appendChild(versionBox);
    }
    
    function enableCSS(sheetIndex,enable) {
        if(document.styleSheets){
            document.styleSheets[sheetIndex].disabled = !enable;
        }
    }
    
    function dragStart(event, id) {
        var el;
        var x, y;
    
        if (!event){
            event = window.event;
        }
        
        var target = event.target;
        if (!target){
            target = event.srcElement;
        }
    
        dragObj.elNode = that.getElement(id);
        
        if ( id !== target.id ){
            return;
        }
        
        if (dragObj.elNode.nodeType === 3){
            dragObj.elNode = dragObj.elNode.parentNode;
        }
        if (window.scrollX !== undefined){
            //Non-IE    
            x = event.clientX + window.scrollX;
            y = event.clientY + window.scrollY;        
        } else {
            //IE    
            x = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;    
            y = event.clientY + document.documentElement.scrollTop  + document.body.scrollTop;
        }
    
        dragObj.cursorStartX = x;
        dragObj.cursorStartY = y;
    
        dragObj.elStartLeft  = parseInt(dragObj.elNode.style.left, 10);
        dragObj.elStartTop   = parseInt(dragObj.elNode.style.top,  10);
        
        if (isNaN(dragObj.elStartLeft)){
        	dragObj.elStartLeft = 0;
        }
        if (isNaN(dragObj.elStartTop)){
        	dragObj.elStartTop  = 0; 
        }
        
        dragGoListener   = buildDragGo();
        dragStopListener = buildDragStop();
        
        if (document.addEventListener){
            //Non-IE
            document.addEventListener("mousemove", dragGoListener,   true);
            document.addEventListener("mouseup",   dragStopListener, true);
        } else {
            //IE
            document.attachEvent("onmousemove", dragGoListener);
            document.attachEvent("onmouseup",   dragStopListener);
        }
        
        if (event.preventDefault){
            //Non-IE    
            event.preventDefault();       
        } else {
            //IE    
            window.event.cancelBubble = true;
            window.event.returnValue = false;        
        }
    }
    
    function buildDragGo() {
        return function(event){
            if (!event){
                event = window.event;
            }
        
            var x, y;
            if (window.scrollX !== undefined){
             // Non-IE    
                x = event.clientX + window.scrollX;
                y = event.clientY + window.scrollY;        
            } else {
             // IE    
                x = event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;    
                y = event.clientY + document.documentElement.scrollTop  + document.body.scrollTop;
            }
        
            dragObj.elNode.style.left = (dragObj.elStartLeft + x - dragObj.cursorStartX) + "px";
            dragObj.elNode.style.top  = (dragObj.elStartTop  + y - dragObj.cursorStartY) + "px";    
            
            if (event.preventDefault){
             // Non-IE    
                event.preventDefault();
            } else {
             // IE    
                window.event.cancelBubble = true;
                window.event.returnValue = false;    
            }
        };
    }  
    
    function buildDragStop() {
        return function(event){
            if (!event){
                event = window.event;
            }
        
            if (document.removeEventListener){
                document.removeEventListener("mousemove", dragGoListener, true);
                document.removeEventListener("mouseup",   dragStopListener, true);
            } else {
                document.detachEvent("onmousemove", dragGoListener);
                document.detachEvent("onmouseup",   dragStopListener);
            }
        };
    } 
    
    // Private Functions
    function applyStyleToColumn( colIndex, style ){
        assert(style instanceof ColStyle, "Expected style to be a ColStyle instance", "applyStyleToColumn");
        var rowCount = stateManager.getTargetWithFocus().getRowCount();
        for ( var i = 0; i < rowCount; i++ ){
            applyStyleToElement( 'row' + i + 'col' + colIndex, style );
        }
    }
    function applyStyleToElement(elementId, style){
        assert(style instanceof ColStyle, "Expected style to be a ColStyle instance", "applyStyleToElement");
        var element = that.getElement(elementId, true, true);
        if ( element ){
            if ( style === null ){
                element.style.display         = '';
                element.style.border          = '';
                element.style.backgroundColor = '';
                element.style.color           = '';
            } else {
                if ( style.getVisible() !== null ){
                    if ( style.getVisible() ){
                        element.style.display = 'inline';
                    } else {
                        element.style.display = 'none';
                    }
                }
                if ( style.getHighlight() !== null){
                    if ( style.getHighlight() ){
                        element.style.border = '1px solid black';
                    } else {
                        element.style.border = '';
                    } 
                }
                                
                if ( style.getBackColour() !== null ){
                    element.style.backgroundColor = style.getBackColour();
                }
                
                if ( style.getForeColour() !== null ){
                    element.style.color = style.getForeColour();
                }
            }
        }    
    }
    
    this.getElement = function(id, isVolatile, okIfNotThere){
        var element;
        var cacheObject = isVolatile ? volatileElements : stableElements;
        
        if (!cacheObject[id]){
            element = document.getElementById(id);
            if (element) {
                cacheObject[id] = element;        
            } else if (!okIfNotThere) {
                assert(element, 'No element with id \'' + id + '\' was found in the document', 'GuiManager.getElement');
            }
    
        } else {
            element = cacheObject[id];
        }
        return element;
    };
    
    function clearVolatileElements(){
        volatileElements = {};
    }
    
    this.getFilterText = function(){
        return that.getElement('filterBox', false).value;
    };
    this.setFilterText = function(text){
        that.getElement('filterBox', false).value = text;
    };
    
    enableCSS(1,true);
    enableCSS(2,false);
    
    this.dialogOnDisplay = null;
    var PROGRESS_BAR_WIDTH = 98;
        
    this.COL_PICKER_ID_PREFIX = 'colPicker';
    
    var DISABLED_STYLES = [];
    var newStyle;
    for(var i=0; i < CONFIG.styleCount; i++){
        newStyle = new ColStyle();
        newStyle.setHighlight(false);
        newStyle.setForeColour('');
        newStyle.setBackColour('');
        newStyle.setVisible(true);
        DISABLED_STYLES[i] = newStyle;        
    }
    
    var dragObj = {};
    
    var stableElements   = {};
    var volatileElements = {};    
    
    function applyDisabledStyleToDisplay(){
        that.setCurrentStyles(DISABLED_STYLES);
    }
    
    function setupColourPicker(){
        containerDiv = that.getElement('colourPicker');
        var thisDiv;
        for( var index = 0; index < that.COLOUR_SELECTION.length; index++ ){
            thisDiv = document.createElement('span');
            thisDiv.setAttribute('class', 'colourBox');
            thisDiv.setAttribute('id',    that.COL_PICKER_ID_PREFIX + that.COLOUR_SELECTION[index]);
            thisDiv.onclick = controller.buildColourPickedHandler(that.COLOUR_SELECTION[index]);        
            
            thisDiv.style.cssText = "background-color: " + that.COLOUR_SELECTION[index];
                    
            containerDiv.appendChild(thisDiv);
        }
    }
    setupColourPicker();
    
    var stylesDialog  = new StylesDialog(this, controller, stateManager);    
    var optionsDialog = new OptionsDialog(this, controller);      
    
    var dragGoListener   = null;
    var dragStopListener = null;
    
    var currentStyles = null; // this is the array of styles currently being displayed
}
