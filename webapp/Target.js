function Target(targetName){
    var that = this;
    
 // name property - assigned via constructor only    
     assert(targetName, "Expected a valid targetName", "Target constructor");
    var name = targetName;
    this.getName = function(){
        return name;
    };

 // refreshInterval property    
    var refreshInterval = Number(CONFIG.defaultInterval);
    this.getRefreshInterval = function(){
        // TODO doesnt work: assert(refreshInterval instanceof Number, "Expected refreshInterval to be a Number", "Target .getRefreshInterval");
        return refreshInterval;
    };
    this.setRefreshInterval = function(newRefreshInterval){
        var tmp = Number(newRefreshInterval);
        assert(!isNaN(tmp), "Expected newRefreshInterval to be a Number", "Target .setRefreshInterval");
        refreshInterval = tmp;
    };

 // lineCount property, this is value displayed on Options Dialog    
    var lineCount     = Number(CONFIG.defaultLines);
    this.getLineCount = function(){
        return lineCount;
    };
    this.setLineCount = function(newLineCount){
        var tmp = Number(newLineCount);
        assert(!isNaN(tmp), "Expected newLineCount to be a Number", "Target .setLineCount");    
        lineCount = tmp;
    };

 // showDividers property
    var showDividers  = ("true" === CONFIG.defaultShowDividers);
    this.getShowDividers = function(){
        return showDividers;
    };
    this.setShowDividers = function(newValue){
        assert(newValue === true || newValue === false || newValue === "true" || newValue === "false", 
                "Expected newValue to be a true or false", "Target .setShowDividers");    
        showDividers = Boolean(newValue);
    };

 // timerIndex property, how many seconds since the last update check
    var timerIndex      = Number(0);
    this.resetTimerIndex = function(){
        timerIndex = Number(0);
    };
    this.getTimerIndex = function(){
        return timerIndex;
    };

 // lastQueryTime property
    var lastQueryTime   = Number(0);
    this.getLastQueryTime = function(){
        return lastQueryTime;
    };
    this.setLastQueryTime = function(newLastQueryTime){
        var tmp = Number(newLastQueryTime);
        assert(!isNaN(tmp), "Expected newLastQueryTime to be a Number", "Target .setLastQueryTime");        
        lastQueryTime = newLastQueryTime;
    };

 // hasUnviewedUpdates property
    var hasUnviewedUpdates = false;
    this.getHasUnviewedUpdates = function(){
        return hasUnviewedUpdates;
    };
    this.setHasUnviewedUpdates = function(newHasUnviewedUpdates){
        assert((newHasUnviewedUpdates===true || (newHasUnviewedUpdates===false)), 
                "Expected newHasUnviewedUpdates to be either true or false", "Target .setHasUnviewedUpdates");        
        hasUnviewedUpdates = newHasUnviewedUpdates;
    };

 // waitingForServer property
    var waitingForServer = false;
    this.getWaitingForServer = function(){
        return waitingForServer;
    };
    this.setWaitingForServer = function(newWaitingForServer){
        assert((newWaitingForServer===true || (newWaitingForServer===false)), 
                "Expected newWaitingForServer to be either true or false", "Target .setWaitingForServer");        
        waitingForServer = newWaitingForServer;
    };
    
 // hasFocus property
    var hasFocus = false;
    this.getHasFocus = function(){
        return hasFocus;
    };
    this.setHasFocus = function(newValue){
        assert((newValue===true || (newValue===false)), 
                "Expected newValue to be either true or false", "Target .setHasFocus");        
        hasFocus = newValue;
    };
    
 // broken property
    var broken     = false;
    var errMessage = null;
    this.getBroken = function(){
        return broken;
    };
    this.setBroken = function(newValue, msg){
        assert((newValue===true || (newValue===false)), 
                "Expected newValue to be either true or false", "Target .setBroken");        
        broken = newValue;
        if (broken) {
        	errMessage = msg;
        } else {
        	errMessage = null;
        }
    };
    this.getErrorMsg = function(){
    	return errMessage;
    };
    
 // ################ Filter Stuff ################
    var allData      = [];
    var filteredData = [];
    var prevFilter   = '';
    
 // filter property
    var filter = '';
    this.getFilter = function(){
        return filter;
    };
    this.setFilter = function(newFilter){
        if (!newFilter){
            newFilter = '';
        }
        filter = newFilter;
    };
 
    function doFilter(forceReCalc){
        if ( forceReCalc || (filter !== prevFilter) ) {
         // Need to recompute the filtered data
            if ( filter === '' ){
                filteredData = allData;
            } else {
                filteredData = [];
                var rowId=0;
                
                function rowMatchFilter(row, filter){
                       var matchFound=false;
                       for( var i=0; i<row.length; i++){
                        if ( row[i].indexOf(filter) >= 0 ){
                            matchFound = true;
                            break;
                        }
                       }
                       return matchFound;
                }
                
                for(var i=0; i < allData.length; i++){
                    if (rowMatchFilter(allData[i], filter)){
                         filteredData[rowId++] = allData[i];
                     }
                }
            }
            prevFilter = filter;
        }
    }
    
 // ################ ColStyle Stuff ################    
    var colStyles = [];
    for (var i = 0; i < colStyles.length; i++){
        colStyles[i] = new ColStyle();
    }
 
    this.getColStyle = function(index){
        var styleObject = null;
        //TODO assert?
        if ( index >= 0 && index < colStyles.length ){
            styleObject = new ColStyle();
            ColStyle.populate(colStyles[index], styleObject);
        } 
        return styleObject;
    };
    this.setColStyle = function(index, styleObject){
        /*assert(index >= 0 && index < colStyles.length, 
                "Expected index to be in the range 0-" + (colStyles.length-1) + ", but it was " + index,
                "Target .setColStyle()");*/
        if ( colStyles[index] === undefined ){
            colStyles[index] = new ColStyle();
        }
        ColStyle.populate(styleObject, colStyles[index]);
    };

    this.getColStyles = function(){
        return ColStyle.copyStyleArray(colStyles);
    };
    this.setColStyles = function(newColStyles){
        colStyles = ColStyle.copyStyleArray(newColStyles);
    };
    this.getColStylesCount = function(){
        return colStyles.length;
    };
 // ################ 

 // Get row and column counts
    this.getRowCount = function(){
           doFilter(false);
           return filteredData.length;
    };
    this.getColCount = function(row){
           doFilter(false);    
           if ( filteredData[row] !== null ){
               return filteredData[row].length;
           } else {
               return 0;
           }
    };
    
 // Get and Set data    
    this.getValue = function(row,col){
        doFilter(false);  
        if ( row < filteredData.length && col < filteredData[row].length ) {
               return filteredData[row][col];
        } else {
            return null;
        }
    };
    this.setData=function(data){
        //TODO assert
           allData=data;
           doFilter(true);
           updateStyles();
    };

    function updateStyles(){
     // Check we have enough styles to cover all the columns of data
        var currentStyleCount = colStyles.length;
        
        var maxCols=0;
     // Find the max number of data columns
        for(var k=0; k < allData.length; k++){
            if (maxCols < allData[k].length){
                maxCols = allData[k].length;
            }
        }

     // Add more styles if necessary
        if (currentStyleCount < maxCols){
            for (var j = currentStyleCount; j < maxCols; j++){
                colStyles[j] = new ColStyle();
            }
            assert( colStyles.length === maxCols, 
                    "Expected " + maxCols + " styles in Target, but found " + colStyles.length,
                    "Target .updateStyles()");
        }
    }
    
 // ################ 
    this.onTick = function(){
        if ( ! hasUnviewedUpdates && ! waitingForServer && ! that.getBroken() ){
            timerIndex++;
            if ( timerIndex >= refreshInterval ){
                controller.checkForTargetChange(this);
            }
        }
    };
     
    this.toString = function() {
        return "Target: " + name + ", lastQueryTime=" + lastQueryTime + 
            " hasUnviewedUpdates=" + hasUnviewedUpdates + ", refreshInterval=" + refreshInterval;
    };
    this.toJsonString = function() {
        var txt = '{ name: "' + that.getName() + '", lineCount: "' + that.getLineCount() + '", refreshInterval: ' + 
            that.getRefreshInterval() + ', showDividers: ' + that.getShowDividers() + ', colStyles: [';
        
        var isFirst = true;
        var styleCount = that.getColStylesCount();
        for ( var l = 0; l < styleCount; l++ ){
            if ( ! isFirst ){
                txt += ",";
            }
            if ( that.getColStyle(l) ){
                txt += that.getColStyle(l).toString();        
    
            } else {
                txt += "null";    
            }
            
            isFirst = false;           
        }
            
        txt += "] }";
        
        return txt;        
    };
}

Target.build = function(sourceObject){
    var target;
    if (sourceObject.name){
        target = new Target(sourceObject.name);
    } else {
        throw new Error("Invalid source object - no 'name' property");
    }
    
    Target.populate(sourceObject, target);
    
    return target;
};
Target.populate = function(sourceObject, target){
    if (sourceObject.lastQueryTime !== undefined){
        target.setLastQueryTime(sourceObject.lastQueryTime);
    }
    if (sourceObject.refreshInterval !== undefined){
        target.setRefreshInterval(sourceObject.refreshInterval);
    }
    if (sourceObject.lineCount !== undefined){
        target.setLineCount(sourceObject.lineCount);
    }
    if (sourceObject.showDividers !== undefined){
        target.setShowDividers(sourceObject.showDividers);
    }
    if (sourceObject.filter !== undefined){
        target.setFilter(sourceObject.filter);
    }
    if (sourceObject.colStyles !== undefined){
        for(var i=0; i < sourceObject.colStyles.length; i++){
            target.setColStyle(i, sourceObject.colStyles[i]);
        }
    }
};
