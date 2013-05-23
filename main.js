/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, console, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";
    
    var AppInit       = require("utils/AppInit"),
        Resizer       = require("utils/Resizer"),
        StatusBar     = require("widgets/StatusBar"),
        ConsoleHTML   = require("text!widgets/Console.html");
    
    var _init = false;
    var $console,
        $showHide,
        $clear;
    
    var logsNr = 0;
    
    /**
     * Logs a message to console.
     * @param msg
     */
    function log(msg) {
        var text = msg ? msg.toString().replace(/\n/g, "<br />") : msg;
        var oddClass = (logsNr % 2) ? "odd" : "";
        
        $console.append("<p class='log " + oddClass + "'>" + text + "</p>");
        $console.animate({ scrollTop: $console[0].scrollHeight }, 10);
        
        logsNr++;
    }
    
    function error(msg) {
        var text = msg ? msg.toString().replace(/\n/g, "<br />") : msg;
        var oddClass = (logsNr % 2) ? "odd" : "";
        
        $console.append("<p class='error " + oddClass + "'>" + text + "</p>");
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
        $showHide = $("#editor-console-toolbar > #show-hide");
        $clear =  $("#editor-console-toolbar > #clear");
        
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