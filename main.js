/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       		= brackets.getModule("utils/AppInit"),
        Resizer       		= brackets.getModule("utils/Resizer"),
		PreferencesManager  = brackets.getModule("preferences/PreferencesManager"),
        ConsoleHTML   		= require("text!html/console.html"),
		preferences 		= PreferencesManager.getPreferenceStorage("extensions.Themes-for-brackets");
    
    var _init = false;
    var $console,
		$consoleToolbar,
        $showHide,
        $clear;
    
    var logsNr = 0;
	
    /**
     * Logs a message to console.
     * @param msg
     */
    function log(msg) {
		var texts = msg.toString().split('\n'),
			i = 0,
			oddClass = (logsNr % 2) ? "odd" : "";
		
		for(i = 0; i < texts.length; i++) {
			$console.append("<input type='text' class='log " + oddClass + "' value='" + texts[i] + "'/>");
		}
		
        $console.animate({ scrollTop: $console[0].scrollHeight }, 10);
        
        logsNr++;
    }
    
    function error(msg) {
        var texts = msg.toString().split('\n'),
			i = 0,
			oddClass = (logsNr % 2) ? "odd" : "";
        
		for(i = 0; i < texts.length; i++) {
			$console.append("<input type='text' class='error " + oddClass + "' value='" + texts[i] + "'/>");
		}
		
        $console.animate({ scrollTop: $console[0].scrollHeight }, 10);        
        logsNr++;
    }
    
    function clear() {
        $console.html("");
        logsNr = 0;
    }
    
    AppInit.htmlReady(function () {
        $(ConsoleHTML).insertAfter("#status-bar");

        _init = true;		
        $console = $("#editor-console");
		$consoleToolbar = $("#editor-console-toolbar");
        $showHide = $("#editor-console-toolbar > #show-hide");
        $clear =  $("#editor-console-toolbar > #clear");
        
		
		if (preferences) {
			var theme = preferences.getValue("theme");
			
			$console.addClass(theme);
			$consoleToolbar.addClass(theme);
		}
	
        $showHide.click(function () {
            Resizer.toggle($console);
        });
        
        $clear.click(function () {
            clear();
        });
        
        Resizer.makeResizable($console.get(0), Resizer.DIRECTION_VERTICAL, Resizer.POSITION_BOTTOM, 0);
    });
    
    var _log = console.log;
    var _error = console.error;
    
    console.log = function () {
        var arg = arguments;
        
        log(arg[0]);
        return _log.apply(console, arguments);
    };
    
    console.error = function () {
        var arg = arguments;
        
        error(arg[0]);
        return _error.apply(console, arguments);
    };
    
    // Exports
    exports.log = log;
    exports.error = error;
    exports.clear = clear;
});
