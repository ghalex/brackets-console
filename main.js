/**
 *
 *
 * @author Alexandru Ghiura ghalex@gmail.com (https://github.com/ghalex)
 *
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, console, brackets, $, Mustache */
define(function (require, exports, module) {
    "use strict";

    var AppInit = brackets.getModule('utils/AppInit'),
        Resizer = brackets.getModule('utils/Resizer'),
        PanelManager = brackets.getModule('view/PanelManager'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager');

    var EXTENSION_ID = 'brackets-console';

    // UI templates
    var RowHTML = require('text!htmlContent/row.html'),
        PanelHTML = require('text!htmlContent/panel.html'),
        ButtonHTML = require('text!htmlContent/button.html');

    // Load preferences var
    var logsCount = 0,
        errorsCount = 0,
        debugPrefs = PreferencesManager.getExtensionPrefs('debug'),
        extensionPrefs = PreferencesManager.getExtensionPrefs(EXTENSION_ID);

    // Variables
    var $clear,
        $appPanel,
        $appButton,
        $closeButton,
        $logContainer,
        $consoleToolbar;

    /**
     * Logs a message to console.
     * @param msg
     */
    function log(msg) {
        var texts = msg.toString().split('\n'),
            i = 0,
            oddClass = (logsCount % 2) ? 'odd' : '';
        for (i = 0; i < texts.length; i++) {
            // $logContainer.append('<input type="text" class="log ' + oddClass + '" value="' + texts[i] + '"/>');
            var ln18 = {message:texts[i], file:'', class:oddClass};
            $logContainer.append(Mustache.render(RowHTML, ln18));
        }
        logsCount++;
        // $appPanel.animate({ scrollTop: $appPanel[0].scrollHeight }, 10);
    }

    function error(msg) {
        var i = 0,
            texts = msg.toString().split('\n'),
            oddClass = (logsCount % 2) ? 'odd' : '';
        for (i = 0; i < texts.length; i++) {
            // $logContainer.append('<input type="text" class="error ' + oddClass + '" value="' + texts[i] + '"/>');
            var ln18 = {message:texts[i], file:'', class:oddClass};
            $logContainer.append(Mustache.render(RowHTML, ln18));
        }
        logsCount++;
        // $appPanel.animate({ scrollTop: $appPanel[0].scrollHeight }, 10);
    }

    function _clearConsole() {
        $logContainer.html('');
        logsCount = 0;
        errorsCount = 0;
    }

    function _handlerPanelVisibility() {
        $appButton.toggleClass('active');
        Resizer.toggle($appPanel);
        if (!$appButton.hasClass('active')) {
            EditorManager.focusEditor();
        }
    }

    /**
     *
     * HTML ready
     * Load StyleSheet
     * Create Panel
     * Create Button
     * Add listeners toggle panel visible/hide
     *
     */
    AppInit.htmlReady(function () {

        ExtensionUtils.loadStyleSheet(module, "styles/styles.css")
            .done(function () {

                var minHeight = 100;
                var ln18 = { 'label': 'Console Panel' };
                PanelManager.createBottomPanel(EXTENSION_ID + '.panel', $(Mustache.render(PanelHTML, ln18)), minHeight);
                $appPanel = $('#' + EXTENSION_ID + '-panel');
                $logContainer = $('#' + EXTENSION_ID + '-panel .table-container');
                $closeButton = $('#' + EXTENSION_ID + '-panel .toolbar .close').on('click', _handlerPanelVisibility);

                ln18 = { 'label': 'Open console' };
                $('#main-toolbar .buttons').append(Mustache.render(ButtonHTML, ln18));
                $appButton = $('#' + EXTENSION_ID + '-button').on('click', _handlerPanelVisibility).hide();

                $appButton.show();

            });

    });

    AppInit.appReady(function () {
    });

    var _log = console.log;
    var _error = console.error;

    console.log = function () {
        var arg = arguments;
        console.log(arg);
        log(arg[0]);
        return _log.apply(console, arguments);
    };
    console.error = function () {
        var arg = arguments;
        error(arg[0]);
        errorsCount++;
        return _error.apply(console, arguments);
    };

    // Exports
    exports.log = log;
    exports.error = error;
    exports.clear = _clearConsole;

});
