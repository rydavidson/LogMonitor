function Controller(){
    var that = this;

 // ################ Main Display Event Handlers ################
    this.onUpdateNowButtonClick = function(){
        if ( (guiManager.dialogOnDisplay === null) && (stateManager.getTargetWithFocus() !== null) ){
            guiManager.setProgressBarWaiting();
            that.checkForTargetUpdate(stateManager.getTargetWithFocus());
        }
    };
    this.onStylesButtonClick = function(){
        if ( (! guiManager.dialogOnDisplay) && (stateManager.getTargetWithFocus() !== null) ){
            guiManager.showStylesDialog();
        }
    };
    this.onOptionsButtonClick = function(){
    //TODO refactor
        if ( (! guiManager.dialogOnDisplay) && (stateManager.getTargetWithFocus() !== null) ){
            guiManager.showOptionsDialog();
        }
    };
    this.onTick = function(){
        stateManager.forEachTarget( function(t){
            t.onTick(); 
        });
        
        var targetWithFocus = stateManager.getTargetWithFocus();
        if ( targetWithFocus !== null ){
            if ( ! targetWithFocus.getBroken() ){
                if ( targetWithFocus.getWaitingForServer() ){
                    guiManager.setProgressBarWaiting();
                } else {
                    guiManager.setProgressBarValue(targetWithFocus.getTimerIndex(), targetWithFocus.getRefreshInterval());
                }
            }
        }
    };
    this.buildTargetClickHandler = function(targetName){
        return function(){
            if ( guiManager.dialogOnDisplay === null ){
                var newTargetWithFocus = stateManager.getTargetByName(targetName);
                assert(newTargetWithFocus !== null, 'Could not find a target called ' + targetName, 'onTargetClick');
                
                var prevTargetWithFocus = stateManager.getTargetWithFocus();
                
                if ( prevTargetWithFocus !== newTargetWithFocus ) {
                    stateManager.setTargetWithFocus( newTargetWithFocus );
                    
                    if ( prevTargetWithFocus ){
                        guiManager.setTargetStatus( prevTargetWithFocus );
                    }
                    guiManager.setTargetStatus(newTargetWithFocus);
                    
                    guiManager.clearDisplay();
                    guiManager.setCurrentStyles(newTargetWithFocus.getColStyles());
                    guiManager.setFilterText(newTargetWithFocus.getFilter());
                    guiManager.showTargetText(newTargetWithFocus);
                    guiManager.updateErrorStatus(newTargetWithFocus);
                    
                    that.checkForTargetUpdate(newTargetWithFocus);
                }
            }        
        };
    };
    this.onFilterButtonClick = function(){
        var target;
        if ( (! guiManager.dialogOnDisplay) && ((target = stateManager.getTargetWithFocus()) !== null) ){
            target.setFilter(guiManager.getFilterText());
            guiManager.showTargetText(target);
        }
    };
    
 // ################ Option Dialog Event Handlers ################
    this.onOptionsDialogMouseDown = function(e){
        assert(guiManager.dialogOnDisplay === 'options', 'Expected options dialog to be displayed', 'onOptionsDialogMouseDown');
        guiManager.onOptionsDialogMouseDown(e);
    };
    this.onBtnOptionsOkClick = function() {
        assert(guiManager.dialogOnDisplay === 'options', 'Expected options dialog to be displayed', 'onBtnOptionsOkClick');
        guiManager.onBtnOptionsOkClick();
    };
    this.onBtnOptionsCancelClick = function() {
        assert(guiManager.dialogOnDisplay === 'options', 'Expected options dialog to be displayed', 'onBtnOptionsCancelClick');
        guiManager.onBtnOptionsCancelClick();
    };
    
    this.onOptionsDialogClosed = function(okClicked){
        var targetWithFocus = stateManager.getTargetWithFocus();
        assert(targetWithFocus, "Expected a non-null targetWithFocus", "onOptionsDialogClosed");
        guiManager.setCurrentStyles(targetWithFocus.getColStyles());
        if (okClicked){
            PrefStore.saveTargetPrefs(targetWithFocus);
            that.checkForTargetUpdate(targetWithFocus);
        }
    };
    
 // ################ Styles Dialog Event Handlers ################
    this.onSelectedColumnIndexChanged = function(){ 
        assert(guiManager.dialogOnDisplay === 'styles', 'Expected styles dialog to be displayed', 'onSelectedColumnIndexChanged');
        guiManager.onSelectedColumnIndexChanged();
    };
    this.onColourTypeChanged          = function(){ 
        assert(guiManager.dialogOnDisplay === 'styles', 'Expected styles dialog to be displayed', 'onColourTypeChanged');
        guiManager.onColourTypeChanged();
    };
    this.onHiddenCheckboxChanged      = function(){ 
        assert(guiManager.dialogOnDisplay === 'styles', 'Expected styles dialog to be displayed', 'onHiddenCheckboxChanged');
        guiManager.onHiddenCheckboxChanged();
    };
    this.onBtnStylesOk                = function(){ 
        assert(guiManager.dialogOnDisplay === 'styles', 'Expected styles dialog to be displayed', 'onBtnStylesOk');
        guiManager.onBtnStylesOk();
    };
    this.onBtnStylesCancel            = function(){
        assert(guiManager.dialogOnDisplay === 'styles', 'Expected styles dialog to be displayed', 'onBtnStylesCancel');
        guiManager.onBtnStylesCancel();
    };
    this.onStyleDialogMouseDown       = function(e){
        assert(guiManager.dialogOnDisplay === 'styles', 'Expected styles dialog to be displayed', 'onStyleDialogMouseDown');
        guiManager.onStyleDialogMouseDown(e);
    };
    this.buildColourPickedHandler = function(colour){
        return function(){
            guiManager.onColourSelected(colour);
        };
    };
    this.onStyleDialogClosed = function(){
        var targetWithFocus = stateManager.getTargetWithFocus();
        assert(targetWithFocus, "Expected a non-null targetWithFocus", "onStyleDialogClosed");
        guiManager.setCurrentStyles(targetWithFocus.getColStyles());
        PrefStore.saveTargetPrefs(targetWithFocus);
    };

 // ################ HTTP Request Config Data ################    
    function getConfigData(){
        try{
            var configObject;
            function onGotConfigDataOk(response){
                configObject = response;
            }
            function onGotConfigDataErr(err){
                handleHttpManagerError(err);
            }
        
            httpHandler.getConfigData(onGotConfigDataOk, onGotConfigDataErr);
            return configObject;
            
        } catch (e) {
            debug('In Controller.checkForTargetChange: ' + e);
        }
    
    }
    
 // ################ HTTP Request Target List ################
    this.requestTargetList = function(){
        try{
            function onGotTargetListOk(response){
                stateManager.clearTargets();
                
                var thisTarget, firstTargetName;
                for ( var i = 0; i < response.targets.length; i+=1 ){
                    var responseTargetObject = response.targets[i];
                    thisTarget = Target.build(responseTargetObject);
                    
                    if (i===0){
                        firstTargetName = thisTarget.getName();
                    }
                    
                 // See if we have any preferences saved for this target - if so then apply them   
                    PrefStore.loadTargetPrefs(thisTarget);
                    
                    stateManager.addTarget(thisTarget);
                }
                
                guiManager.updateTargetList();    
                if (firstTargetName){
                 // Select the first of the targets
                    that.buildTargetClickHandler(firstTargetName)();
                }
            
            }
            function onGotTargetListErr(err){
                handleHttpManagerError(err);
            }
        
            httpHandler.requestTargetList(onGotTargetListOk, onGotTargetListErr);
        } catch (e) {
            debug('In Controller.requestTargetList: ' + e);
        }
    };
    
 // ################ HTTP Check for Target Change ################
    this.checkForTargetChange = function(target){
        try{
            function onGotTargetChangeOk(response, target){
                var lastUpdateTime = response.lastUpdateTime;
                var hasUpdated     = response.hasUpdated;
            
                assert( lastUpdateTime !== undefined, 'Response did not contain lastUpdateTime', '_onGotTargetChangeOk');
                assert( hasUpdated     !== undefined, 'Response did not contain hasUpdated',     '_onGotTargetChangeOk');    
                
                target.setBroken(false);
                target.setLastQueryTime(lastUpdateTime);
            
                if ( hasUpdated ){
                    target.setHasUnviewedUpdates(true);
                    if ( target.getHasFocus() ){
                        that.checkForTargetUpdate(target);
                    } else {
                        target.setWaitingForServer(false);
                        target.resetTimerIndex();
                    }
                } else {
                    target.setWaitingForServer(false);
                    target.resetTimerIndex();
                }
                guiManager.setTargetStatus(target);
            }
            function onGotTargetChangeErr(err, target){
                handleHttpManagerError(err);
            }
        
            httpHandler.checkForTargetChange(target, onGotTargetChangeOk, onGotTargetChangeErr);
            target.setWaitingForServer(true);
            
        } catch (e) {
            debug('In Controller.checkForTargetChange: ' + e);
        }
    };
    
 // ################ HTTP Target Update ################
     this.checkForTargetUpdate = function(target){
        try{
            function onGotTargetUpdateOk(response, target){
                target.setBroken(false);
                target.resetTimerIndex();
                target.setWaitingForServer(false);
            
                guiManager.setProgressBarValue(0, target.getRefreshInterval());
            
                target.setData(response);
                if ( target.getHasFocus() ){
                    if ( (! guiManager.dialogOnDisplay) && (stateManager.getTargetWithFocus() !== null) ){
                     // Need to re-set the styles here because a targets styles array may change when it get new data
                         guiManager.setCurrentStyles(target.getColStyles());
                    }
                 
                    guiManager.showTargetText(target);
                    guiManager.updateErrorStatus(target);
                    target.setHasUnviewedUpdates(false);
                    guiManager.setTargetStatus(target);
                }
            }
            
            function onGotTargetUpdateErr(err, target){
                handleHttpManagerError(err);
            }
        
             httpHandler.requestUpdate(target, onGotTargetUpdateOk, onGotTargetUpdateErr);
            target.setWaitingForServer(true);
            
        } catch (e) {
            debug('In Controller.checkForTargetUpdate: ' + e);
        }
    };
    
 // #################################################
    function handleHttpManagerError(err){
        if (err.target){
            var target = err.target;
            assert(target instanceof Target, "Expected target property to be a Target instance, instead it was " + err.target, 
                    "handleHttpManagerError()");
            target.setBroken(true, err.msg);
            guiManager.setTargetStatus(target);
            if (target.getHasFocus()){
	            guiManager.updateErrorStatus(target);
	        }
        }
    }
        
    var httpHandler  = new HttpHandler();
    CONFIG = getConfigData();    
    var stateManager = new StateManager();
    var guiManager   = new GuiManager(that, stateManager);
    guiManager.attachHandlers();
}
