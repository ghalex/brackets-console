/**
 *
 *
 * @author Alexandru Ghiura ghalex@gmail.com (https://github.com/ghalex)
 *
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, console, brackets, _, $, Mustache */
define(function (require, exports, module) {

    "use strict";

    var _ = brackets.getModule('thirdparty/lodash'),
        AppInit = brackets.getModule('utils/AppInit'),
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
    var $appPanel,
        $appButton,
        $logContainer;

    function _updateNotifierIcon() {

        var $input = $('#' + EXTENSION_ID + '-panel .toolbar .error');
        var label = $input.find('span').first().text();
        $input.html('');
        $input.html('<span>' + label + '</span>&nbsp;<em>(' + errorsCount + ')</em>');

        $input = $('#' + EXTENSION_ID + '-panel .toolbar .debug');
        label = $input.find('span').first().text();
        $input.html('');
        $input.html('<span>' + label + '</span>&nbsp;<em>(' + (logsCount - errorsCount) + ')</em>');

        $input = $('#brackets-console-button .counts');
        $input.toggle(errorsCount > 0);
        $input.find('em').first().text(errorsCount);

    }
    function _handlerPanelVisibility() {
        $appButton.toggleClass('active');
        Resizer.toggle($appPanel);
        if (!$appButton.hasClass('active')) {
            EditorManager.focusEditor();
        }
    }

    function _refreshPanel(event) {
        var $this = $( event.currentTarget );
        var name = $this.data('name');
        $this.toggleClass('active');
        $logContainer.find('.box .' + name).toggle();
    }

    function clearConsole() {
        $logContainer.find('.box').html('');
        logsCount = 0;
        errorsCount = 0;
        _updateNotifierIcon();
    }

    /**
     * Logs a message to console.
     * @param msg
     */
    function log(msg) {
        if ($logContainer !== null) {
            var texts = msg.toString().split('\n'),
                i = 0,
                oddClass = (logsCount % 2) ? 'odd' : '';
            for (i = 0; i < texts.length; i++) {
                var ln18 = {message: texts[i].replace(/(\r\n|\n|\r)/gm, ''), file: '', even: oddClass, log: 'debug'};
                $logContainer.find('.box').first().append(Mustache.render(RowHTML, ln18));
            }
            logsCount++;
            _updateNotifierIcon();
        }
    }

    function error(msg) {
        if ($logContainer !== null) {
            var i = 0,
                texts = msg.toString().split('\n'),
                oddClass = (logsCount % 2) ? 'odd' : '';
            for (i = 0; i < texts.length; i++) {
                var ln18 = {message: texts[i].replace(/(\r\n|\n|\r)/gm, ''), file: '', even: oddClass, log: 'error'};
                $logContainer.find('.box').first().append(Mustache.render(RowHTML, ln18));
            }
            logsCount++;
            errorsCount++;
            _updateNotifierIcon();
        }
    }

    /**
     *
     * HTML ready
     * Load StyleSheet
     * Create Panel
     * Create Button
     * Get count notifier
     * Get logs container
     * Get close button
     * Add listeners toggle panel visible/hide
     *
     */
    AppInit.htmlReady(function () {

        ExtensionUtils.loadStyleSheet(module, "styles/styles.css");

        var minHeight = 100;
        var ln18 = { 'label': 'Console Panel' };
        PanelManager.createBottomPanel(EXTENSION_ID + '.panel', $(Mustache.render(PanelHTML, ln18)), minHeight);
        $appPanel = $('#' + EXTENSION_ID + '-panel');
        $logContainer = $('#' + EXTENSION_ID + '-panel .table-container');

        var base = '#' + EXTENSION_ID + '-panel .toolbar';
        $(base + ' .clear').on('click', clearConsole);
        $(base + ' .close').on('click', _handlerPanelVisibility);
        $(base + ' .title').on('click', _handlerPanelVisibility);
        $(base + ' .error').on('click', _refreshPanel);
        $(base + ' .debug').on('click', _refreshPanel);

        ln18 = { 'label': 'Open console' };
        $('#main-toolbar .buttons').append(Mustache.render(ButtonHTML, ln18));
        $appButton = $('#' + EXTENSION_ID + '-button').on('click', _handlerPanelVisibility);

        _updateNotifierIcon();

    });


    AppInit.appReady(function () {
    });

    var _log = console.log;
    var _warn = console.warn;
    var _debug = console.debug;
    var _error = console.error;

    console.log = function () {
        var args = _.toArray(arguments);
        log(args[0]);
        return _log.apply(console, arguments);
    };

    console.error = function () {
        var args = _.toArray(arguments);
        error(args[0]);
        return _error.apply(console, arguments);
    };

    // Exports
    exports.log = log;
    // exports.warn = log;
    exports.error = error;
    // exports.debug = error;
    exports.clear = clearConsole;

});
