function StateManager(){
    var that = this;
    
 // Target collection management
    var targets = [];
    this.addTarget = function(newTarget){
        assert(newTarget instanceof Target, "Expected a Target object but instead got " + newTarget, "StateManager .addTarget()");
        targets.push(newTarget);
    };
    this.clearTargets = function(){
        targets = [];
    };
    this.getTargetCount = function(){
        return targets.length;
    };
    this.forEachTarget = function(fn) {
        var targetCount = targets.length;
        for ( var i = 0; i < targetCount; i++ ){
            fn( targets[i] );
        }
    };
    this.getTargetByName = function(name){
        var targetCount = targets.length;    
        for ( var i = 0; i < targetCount; i++ ){
            if ( targets[i].getName() === name ){
                var matchingTarget = targets[i];
                assert(matchingTarget instanceof Target, "Expected a Target object but instead got " + matchingTarget, "StateManager .addTarget()");            
                return matchingTarget;
            }
        }
        return null;
    };
    this.getTargetByIndex = function(index){
        var minIndex = 0, maxIndex = targets.length;
        assert(index >= minIndex && index <= maxIndex, 
                "Expected target index between " + minIndex + " and " + maxIndex + " but got " + index, 
                "StateManager .getTargetByIndex()");

        var matchingTarget = targets[index];
        assert(matchingTarget instanceof Target, "Expected a Target object but instead got " + matchingTarget, "StateManager .addTarget()");            
        return matchingTarget;                
    };
    
 // Target-with-focus management
    var targetWithFocus = null;
    this.getTargetWithFocus = function(){
        return targetWithFocus;
    };
    this.setTargetWithFocus = function(target){
        if ( targetWithFocus !== target ){
            if ( targetWithFocus !== null ){
                targetWithFocus.setHasFocus(false);
            }
            if (target !== null){
                target.setHasFocus(true);
            }
            targetWithFocus = target;
        }
    };

 // Override toString()
    this.toString = function(){
        var result = 'Target Count = ' + targets.length + '\n\n';
        var targetCount = that.getTargetCount();
        var target;
        for (var i=0; i < targetCount; i++) {
            target = that.getTargetByIndex(i);
            result += target.toString();
            result += '\n';
        }
        return result;
    };
}
