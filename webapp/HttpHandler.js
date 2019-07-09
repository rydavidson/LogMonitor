function HttpHandler(){
    var that = this;
    
    var GET_LIST_URL   = "view?requestType=listTargets";
    var GET_UPDATE_URL = "view?requestType=hasUpdated"; //&targetId=bob&lastQueryTime=1157815927395";
    var GET_LATEST_URL = "view?requestType=getLatest"; //&targetId=bob&lineCount=10;
    var GET_CONFIG_URL = "view?requestType=getConfig"; 
    var HTTP_METHOD    = "POST"; // Need this to avoid IE caching for requests where the URL remains the same
    var xmlHttpNotSupported = false;

    this.getConfigData = function(callbackOk, callbackErr){
        sendRequest(GET_CONFIG_URL, callbackOk, callbackErr, false);
    };

    this.checkForTargetChange = function(target, callbackOk, callbackErr){
        var url = GET_UPDATE_URL + '&targetId=' + target.getName() + '&lastQueryTime=' + target.getLastQueryTime();
        sendRequest(url, callbackOk, callbackErr, true, target);
    };
    
    this.requestTargetList = function (callbackOk, callbackErr){
        sendRequest(GET_LIST_URL, callbackOk, callbackErr, true);
    };
    
    this.requestUpdate = function(target, callbackOk, callbackErr){
        var url = GET_LATEST_URL + '&targetId=' + target.getName() + '&lineCount=' + target.getLineCount();
        sendRequest(url, callbackOk, callbackErr, true, target);
    };

    function sendRequest(url, callbackOk, callbackErr, async, target){
        var reqObject = getRequestObject();
        var processResponse = function(){ 
            try{
                var response = getResponse(reqObject);
                if ( response !== null ){
                    callbackOk(response, target);
                }
            } catch (e) {
                callbackErr(response, target);
            }
        };
        if (async){
	        reqObject.onreadystatechange = processResponse;
	    }
        reqObject.open(HTTP_METHOD, url, async);
        reqObject.send("");
        if (!async){    
	        processResponse();    
        }
    }
    
    function getResponse(requestObject){
        if ( requestObject !== null ){
            if ( requestObject.readyState === 4 ){
                if ( requestObject.status >= 200 && requestObject.status <= 299 ){  
                    var rspObject;
                    try{
                        rspObject = eval("(" + requestObject.responseText + ")" );
                    } catch (e) {
                        throw "ERROR in getResponse() running eval(" + requestObject.responseText + ")";
                    }
                    if ( rspObject.error !== undefined ) {
                        throw "ERROR in response from server: " + rspObject.error;
                    } else {
                        return rspObject;
                    }
                } else {
                    //showError(requestObject.status);
                    return null;
                }// if ( requestObject.status
            } else {
                return null;
            }//if ( requestObject.readyStat
        } else {
            return null;
        }//if ( requestObject != null
    }
    
    function getRequestObject() {
     // Retrieves (or builds) the request object   
        var newReqObject=null;
        if ( ! xmlHttpNotSupported ){
         // branch for native XMLHttpRequest object
            if(window.XMLHttpRequest) {
                try {
                    newReqObject = new XMLHttpRequest();
                } catch(e) {
                    newReqObject = null;
                }
         // branch for IE/Windows ActiveX version
            } else if(window.ActiveXObject) {
                   try {
                    newReqObject = new ActiveXObject("Msxml2.XMLHTTP");
                  } catch(e) {
                    try {
                          newReqObject = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch(e) {
                          newReqObject = null;
                    }
                }
            }
            xmlHttpNotSupported = ( newReqObject === null );
            if ( xmlHttpNotSupported ){
               // TODO - talk to GUIMAnager
                doAlertNotSupported();   
            } 
        } 
        return newReqObject;
    } //getRequestObject()
    
}


