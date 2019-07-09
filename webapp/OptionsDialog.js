function OptionsDialog(guiManager, controller){
    assert(guiManager, "Expected a valid guiManager", "OptionsDialog constructor");
    assert(controller, "Expected a valid controller", "OptionsDialog constructor");
    
    var that = this;
    
    var target = null;
    
    var MIN_INTERVAL = 1;
    var MAX_INTERVAL = 300;    
    var MIN_LINE_COUNT = 1;
    var MAX_LINE_COUNT = 200;

 // visible property
    var visible = false;
    this.getVisible = function(){
        return visible;
    };
    this.setVisible = function(newValue){
           assert((newValue === true) || (newValue === false), 
               "Expected newValue to be either true or false", "OptionsDialog .setVisible()");    
        visible = newValue;
    };

 // optionsLineCount property
    this.getOptionsLineCount = function(){
        return guiManager.getElement('txtLines').value;
    };
    this.setOptionsLineCount = function(lineCount){
        guiManager.getElement('txtLines').value = lineCount;
    };

 // optionsRefreshIntervalproperty
    this.getOptionsRefreshInterval = function(){
        return guiManager.getElement('txtRefresh').value;
    };
    this.setOptionsRefreshInterval = function(refreshInterval){
        guiManager.getElement('txtRefresh').value = refreshInterval;
    };

 // optionsShowDividers property    
    this.getOptionsShowDividers = function(){
        return guiManager.getElement('chkShowDividers').checked;
    };
    this.setOptionsShowDividers = function(isChecked){
        guiManager.getElement('chkShowDividers').checked = isChecked;
    }; 

 // GUI event handlers    
    this.onOptionsDialogMouseDown = function(event){
        guiManager.dragOptionsDialog(event);
    };
    this.onBtnOptionsOkClick = function() {
        if (validateOk()){
            applyOptionsToTarget(target);
            that.hide(true);
        }
    };
    this.onBtnOptionsCancelClick = function() {
        that.hide(false);
    };

 // show/hide methods
     this.show = function(newTarget){
        assert(newTarget !== null, 'expected non-null newTarget', 'OptionsDialog.show');
        target = newTarget;     
    
         clearErrors();
    
        guiManager.getElement('options').style.display = 'block';
        guiManager.getElement('options').style.top     = '100px';
        guiManager.getElement('options').style.left    = '200px';
        
        visible = true;
        
        // TODO Need to do these here because IE won't allow this if the dialog is hidden
        guiManager.getElement('btnOptionsOk').onclick     = guiManager.attachHandler( controller, "onBtnOptionsOkClick");
        guiManager.getElement('btnOptionsCancel').onclick = guiManager.attachHandler( controller, "onBtnOptionsCancelClick");
        guiManager.getElement('options').onmousedown      = guiManager.attachHandler( controller, "onOptionsDialogMouseDown");   
            
        guiManager.getElement('lblTitle').innerHTML      = "Options for " + target.getName();
        guiManager.getElement('txtLines').value          = target.getLineCount();
        guiManager.getElement('txtRefresh').value        = target.getRefreshInterval();
        guiManager.getElement('chkShowDividers').checked = target.getShowDividers();        
    };
    this.hide = function(ok){
        guiManager.getElement('options').style.display  = 'none';
        visible = false;
        guiManager.onOptionsDialogClosed(ok);    
    };
     
 // Validation stuff    
    function showErrors(){
        guiManager.getElement('optionsErrMsg').style.display = 'block';
    }
    function clearErrors(){
        guiManager.getElement('optionsErrMsg').innerHTML     = '';
        guiManager.getElement('optionsErrMsg').style.display = 'none';
        guiManager.getElement('txtRefresh').className = '';
        guiManager.getElement('txtLines').className = '';    
    }
    function addError(fieldId, msg) {
        guiManager.getElement(fieldId).className = 'errField';
        guiManager.getElement('optionsErrMsg').innerHTML += ('&diams; ' + msg + '<br />');
    }
    
    function applyOptionsToTarget(target){
        assert( target instanceof Target, 'target object was not a Target instance', 'OptionsDialog._applyOptionsToTarget');
        target.setLineCount(that.getOptionsLineCount());
        target.setRefreshInterval(that.getOptionsRefreshInterval());
        target.setShowDividers(that.getOptionsShowDividers());
    }
    function validateOk() {
         clearErrors();
         
        var lineCount   = Number(that.getOptionsLineCount());
        var lineCountOk = (!isNaN(lineCount)) && (lineCount >= MIN_LINE_COUNT) && (lineCount <= MAX_LINE_COUNT);
        if (!lineCountOk){
            addError('txtLines', 'Enter a line count value between ' + MIN_LINE_COUNT + ' and ' + MAX_LINE_COUNT);    
        }
        
        var interval   = Number(that.getOptionsRefreshInterval());
        var intervalOk = (!isNaN(interval)) && (interval >= MIN_INTERVAL) && (interval <= MAX_INTERVAL);
        if (!intervalOk){
            addError('txtRefresh', 'Enter a refresh interval between ' + MIN_INTERVAL + ' and ' + MAX_INTERVAL);    
        }
        
        var validatesOk = intervalOk && lineCountOk;
        if (!validatesOk){
            showErrors();
        }
        
        return validatesOk;
    }
}

