function PrefStore(){}

PrefStore.loadTargetPrefs = function(target) {
    var readCookie = function (name) {
        var cookieArray = document.cookie.split(';');
        var cookie;
        var nameEq = name + '=';
        for (var i = 0; i < cookieArray.length; i++) {
            cookie = cookieArray[i];
            cookie = cookie.replace(/^\s*(.*?)\s*$/, '$1'); // trim the cookie value
            if (cookie.indexOf(nameEq) === 0){
                return cookie.substring(nameEq.length, cookie.length);
            }
        }
        return null;
    };

    var txt = readCookie('target' + target.getName());
    
    //TODO security ?
    try {
        if (txt !== null){
            var prefsObject = eval("(" + txt + ")");
               Target.populate(prefsObject, target);
           }
        
    } catch (e){
        // Bad cookie, just ignore
        //alert("loadTargetPrefs Error: " + e.description + ' ' + txt);        
    }
};

PrefStore.saveTargetPrefs = function(target){
    assert( target instanceof Target, "Expected a Target object", "PrefStore .saveTargetPrefs");
    var jsonString = target.toJsonString();
        
    var createCookie = function (name,value) {
        var date = new Date();
        date.setTime( date.getTime() + (CONFIG.cookieLifeDays * 24 * 60 * 60 * 1000));
        var expires = date.toGMTString();
        document.cookie = name + "=" + value + "; expires=" + expires + "; path=/";
    };
    createCookie('target' + target.getName(), jsonString );
};
        