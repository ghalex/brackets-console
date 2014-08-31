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
/** ------------------------------------

    Modules

*/
    var _ = brackets.getModule('thirdparty/lodash'),
        Menus = brackets.getModule("command/Menus"),
        AppInit = brackets.getModule('utils/AppInit'),
        Resizer = brackets.getModule('utils/Resizer'),
        PanelManager = brackets.getModule('view/PanelManager'),
        EditorManager = brackets.getModule('editor/EditorManager'),
        ExtensionUtils = brackets.getModule('utils/ExtensionUtils'),
        CommandManager = brackets.getModule("command/CommandManager"),
        PreferencesManager = brackets.getModule('preferences/PreferencesManager');
/** ------------------------------------

    Globals

*/
    var EXTENSION_ID = 'brackets-console',
        WINDOWS_MENU_ID = EXTENSION_ID + '.windows.menus',
        SHOWPANEL_COMMAND_ID = EXTENSION_ID + '.showpanel';
/** ------------------------------------

    UI Templates

*/
    var Strings = require('./ln18'),
        RowHTML = require('text!htmlContent/row.html'),
        PanelHTML = require('text!htmlContent/panel.html'),
        ButtonHTML = require('text!htmlContent/button.html');
/** ------------------------------------

    Variables

*/
    var logsCount = 0,
        warnsCount = 0,
        errorsCount = 0,
        debugPrefs = PreferencesManager.getExtensionPrefs('debug'),
        extensionPrefs = PreferencesManager.getExtensionPrefs(EXTENSION_ID);
/** ------------------------------------

    UI Variables

*/
    var $appPanel,
        $appButton,
        $logContainer;
/** ------------------------------------

    Private Functions

*/
    /**
     *
     * MAJ des compteurs dans le panneau
     * MAJ du compteur de l'icone
     *
     */
    function _updateNotifierIcon() {
        $('#' + EXTENSION_ID + '-panel .toolbar .warn small em').first().text((warnsCount));
        $('#' + EXTENSION_ID + '-panel .toolbar .error small em').first().text((errorsCount));
        $('#' + EXTENSION_ID + '-panel .toolbar .debug small em').first().text((logsCount - (errorsCount + warnsCount)));
        var $input = $('#brackets-console-button .counts');
        $input.toggle(errorsCount > 0);
        $input.find('em').first().text(errorsCount);
    }

    /**
     *
     * Masque/Affiche le panneau
     * MAJ de la class de l'icone du panneau
     *
     */
    function _handlerPanelVisibility() {
        $appButton.toggleClass('active');
        Resizer.toggle($appPanel);
        CommandManager.get(SHOWPANEL_COMMAND_ID).setChecked($appButton.hasClass('active'));
        if (!$appButton.hasClass('active')) {
            EditorManager.focusEditor();
        }
    }

    function _refreshPanel(event) {
        var $this = $(event.currentTarget);
        var name = $this.data('name');
        $this.toggleClass('active');
        $logContainer.find('.box .' + name).toggle();
    }

    function __getErrorObject() {
        var traces = (new Error).stack.split("\n");
        traces.shift();
        var current = traces[0].trim(),
            file = current.match(/(file:\/\/)([a-zA-Z]:\\)(.)*?(.js)/gi)[0],
            col = current.match(/(:([0-9]*))/gi)[2].split(':')[1],
            line = current.match(/(:([0-9]*))/gi)[1].split(':')[1];
        return { fileName: file, lineNumber: line, column: col, stack: traces };
    }
/** ------------------------------------

    Console Functions

*/
    function clearConsole() {
        $logContainer.find('.box').html('');
        logsCount = 0;
        warnsCount = 0;
        errorsCount = 0;
        _updateNotifierIcon();
    }

    function log(msg, err, type) {
        if ($logContainer !== null) {
            logsCount++;
            if (_.isObject(msg)) { msg = JSON.stringify(msg); }
            var ln18 = _.extend(err, { message: msg, even: (logsCount % 2) ? 'odd' : '', type: type});
            $logContainer.find('.box').first().append(Mustache.render(RowHTML, ln18));
            _updateNotifierIcon();
        }
    }

    function warn(msg, err) {
        if ($logContainer !== null) {
            warnsCount++;
            log(msg, err, 'warn');
        }
    }

    function error(msg, err) {
        if ($logContainer !== null) {
            errorsCount++;
            log(msg, err, 'error');
        }
    }
/** ------------------------------------

    Extension Inits

*/
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
        PanelManager.createBottomPanel(EXTENSION_ID + '.panel', $(Mustache.render(PanelHTML, Strings)), minHeight);
        $appPanel = $('#' + EXTENSION_ID + '-panel');
        $logContainer = $('#' + EXTENSION_ID + '-panel .table-container');

        var base = '#' + EXTENSION_ID + '-panel .toolbar';
        $(base + ' .clear').on('click', clearConsole);

        $(base + ' .close').on('click', _handlerPanelVisibility);
        $(base + ' .title').on('click', _handlerPanelVisibility);

        $(base + ' .error').on('click', _refreshPanel);
        $(base + ' .debug').on('click', _refreshPanel);
        $(base + ' .warn').on('click', _refreshPanel);

        $('#main-toolbar .buttons').append(Mustache.render(ButtonHTML, Strings));
        $appButton = $('#' + EXTENSION_ID + '-button').on('click', _handlerPanelVisibility);
        $($appButton).find('em').first().hide();

        _updateNotifierIcon();


    });

    AppInit.appReady(function () {});
/** ------------------------------------

    Commands and Menus

*/
    function __registerCommands(){
        CommandManager.register( "Show Console", SHOWPANEL_COMMAND_ID, _handlerPanelVisibility);
    }
    __registerCommands();


    function __registerWindowsMenu(){
        var menu = Menus.addMenu('Windows', WINDOWS_MENU_ID, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);
        menu.addMenuItem(SHOWPANEL_COMMAND_ID);
    }
    __registerWindowsMenu();
/** ------------------------------------

    Console Proto

*/
    function __initConsoleWrapper(){
        var _log = console.log,
            _warn = console.warn,
            _debug = console.debug,
            _error = console.error;

        console.log = function () {
            var obj = __getErrorObject();
            log(_.toArray(arguments)[0], obj, 'debug');
            return _log.apply(console, arguments);
        };

        console.error = function () {
            var obj = __getErrorObject();
            error(_.toArray(arguments)[0], obj);
            return _error.apply(console, arguments);
        };

        console.warn = function () {
            var obj = __getErrorObject();
            warn(_.toArray(arguments)[0], obj);
            return _warn.apply(console, arguments);
        };

        // Exports
        exports.log = log;
        exports.debug = log;
        exports.warn = warn;
        exports.error = error;
        exports.clear = clearConsole;
    }
    __initConsoleWrapper();

});
