<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
    <head>
        <title>LogMonitor - Client Page</title>
        <meta http-equiv="pragma" content="no-cache" />
        <meta http-equiv="cache-control" content="no-cache" />
        <meta http-equiv="expires" content="0" />    
        <meta http-equiv="description" content="LogMonitor" />
        <![if ! IE]>
        	<link rel="stylesheet" type="text/css" href="logmonitor_posn.css" />
        <![endif]> 
		<!--[if IE]>
	        <link rel="stylesheet" type="text/css" href="logmonitor_posn_IE.css">
        <![endif]-->        
        <link rel="stylesheet" type="text/css" href="logmonitor_enabled.css" />
        <link rel="stylesheet" type="text/css" href="logmonitor_disabled.css" />
        <link rel="stylesheet" type="text/css" href="logmonitor_common.css" />

		<script src="Controller.js"    type="text/javascript"></script>
		<script src="HttpHandler.js"   type="text/javascript"></script>
		<script src="StateManager.js"  type="text/javascript"></script>
		<script src="Target.js"        type="text/javascript"></script>
		<script src="GuiManager.js"    type="text/javascript"></script>
		<script src="StylesDialog.js"  type="text/javascript"></script>
		<script src="OptionsDialog.js" type="text/javascript"></script>		
		<script src="PrefStore.js"     type="text/javascript"></script>				
		<script src="Globals.js"       type="text/javascript"></script>				
		<script src="ColStyle.js"      type="text/javascript"></script>			
    </head>
    
    <body onload="onInit()">
        <!-- Main screen structure -->
        <div id="leftBar"></div>
        <div id="mainArea">
            <div id="textArea"></div>
            <div id="controlPanelArea">
                <div id="progressOuter">
                    <div id="progressInner"></div>
                </div>
                <div id="updateNowButton" class="divButton">Refresh</div>
                <div id="optionsButton"   class="divButton">Options</div>
                <div id="stylesButton"    class="divButton">Styles</div>
                
                <input type="text" id="filterBox" />
                <div id="filterButton" class="divButton">Apply</div>
            </div>      		
        </div>
        
        <!-- Options Dialog box -->
        <div id="options">
            <span id="lblTitle"></span>
            <span id="lblLines">Lines to Display:</span>     <input type="text"     id="txtLines" />
            <span id="lblRefresh">Refresh Interval:</span>   <input type="text"     id="txtRefresh" />
            <span id="lblShowDividers">Show Dividers:</span> <input type="checkbox" id="chkShowDividers" />
            <div id="optionsErrMsg"></div>
            <div class="divButton" id="btnOptionsOk">OK</div>
            <div class="divButton" id="btnOptionsCancel">Cancel</div>
        </div>

        <!-- Styles Dialog box -->        
        <div id="styles">
            <span id="lblStylesTitle"></span>
            <select id="selColStyle" size="10">
                <option>0</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
            </select>
            
            <span id="styleSample"></span>
            
            <span id="lblStylesForeColour">ForeColour</span>
            <input type="radio" name="colourType" class="radioStyle" id="colourTypeFore"/>
            
            <span id="lblStylesBackColour">BackColour</span>
            <input type="radio" name="colourType" class="radioStyle" id="colourTypeBack"/>
            
            <span id="lblCheckStyleHidden">Hide</span>
            <input type="checkbox" class="checkStyle" id="checkStyleHidden"/>
            
            <div id="colourPicker"></div>
            <div id="btnStylesOk"     class="divButton">OK</div>
            <div id="btnStylesCancel" class="divButton">Cancel</div>
        </div>
        
        <noscript>
        	<div id="noscriptMessage"><br/>You must enable JavaScript in your browser for this page to work correctly</div>
        </noscript>
    </body>
</html>
