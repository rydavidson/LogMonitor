function ColStyle(){

 // visible property    
    var visible = true;
    this.getVisible = function(){
        return visible;
    };
    this.setVisible = function(newValue){
        visible = newValue;
    };

 // foreColour property
    var foreColour = CONFIG.defaultForeColour;
    this.getForeColour = function(){
        return foreColour;
    };
    this.setForeColour = function(newValue){
        foreColour = newValue;
    };
    
 // backColour property    
    var backColour = CONFIG.defaultBackColour;    
    this.getBackColour = function(){
        return backColour;
    };
    this.setBackColour = function(newValue){
        backColour = newValue;
    };

 // highlight property    
    var highlight = false;
    this.getHighlight = function(){
        return highlight;
    };
    this.setHighlight = function(newValue){
           assert((newValue === true) || (newValue === false), "Expected newValue to be either true or false", "ColStyle .setHighlight()");
        highlight = newValue;
    };

    this.toString = function(){
          return '{ visible: ' + visible + ', foreColour: "' + foreColour + 
                '", backColour: "' + backColour + '", highlight: ' + highlight + '}';
    };
    
    this.clone = function(){
        var copy = new ColStyle();
        
        copy.setVisible(visible);
        copy.setForeColour(foreColour);
        copy.setBackColour(backColour);
        copy.setHighlight(highlight);
        
        return copy;
    };
    
}
ColStyle.build = function(sourceObject){
    var colStyle = new ColStyle();
    ColStyle.populate(sourceObject, colStyle);
    return colStyle;
};
ColStyle.populate = function(sourceObject, colStyle){
    if (sourceObject instanceof ColStyle){
        colStyle.setVisible(sourceObject.getVisible());
        colStyle.setForeColour(sourceObject.getForeColour());
        colStyle.setBackColour(sourceObject.getBackColour());
        colStyle.setHighlight(sourceObject.getHighlight());
        
    } else {
        if (sourceObject.visible !== undefined) {
            colStyle.setVisible(sourceObject.visible);
        }
        if (sourceObject.foreColour !== undefined) {
            colStyle.setForeColour(sourceObject.foreColour);
        }
        if (sourceObject.backColour !== undefined) {
            colStyle.setBackColour(sourceObject.backColour);
        }
        if (sourceObject.highlight !== undefined) {
            colStyle.setHighlight(sourceObject.highlight);
        }

    }
};

ColStyle.copyStyleArray = function(styles){
 // Accepts an array of objects and copies their data into an array of ColStyle objects
    assert(styles !== null, 'null styles array', '_copyStylesArray');
    var copy = new Array(styles.length);
    var thisObject, style;
    for( var i = 0; i < styles.length; i=i+1 ){
        thisObject = styles[i];
        assert(thisObject !== null, 'expected non-null object at index ' + i, '_copyStylesArray');        
        style = new ColStyle();
        ColStyle.populate(thisObject, style);
        copy[i] = style;
    }
    return copy;
};


