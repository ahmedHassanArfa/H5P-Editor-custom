'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Stores configuration options and literals that are used throughout the system.
 * Also loads and saves the configuration of changeable values (only those as "user-configurable") in the storage object.
 */
var H5PEditorConfig = function () {
  /**
   * 
   * @param {IStorage} storage 
   */
  function H5PEditorConfig(storage) {
    _classCallCheck(this, H5PEditorConfig);

    this._storage = storage;

    /**
     * This is the name of the H5P implementation sent to the H5P for statistical reasons. 
     * Not user-configurable but should be overridden by custom custom implementations. 
     */
    this.platformName = 'H5P-Editor-NodeJs';

    /**
     * This is the version of the H5P implementation sent to the H5P when registering the site. 
     * Not user-configurable but should be overridden by custom custom implementations. 
     */
    this.platformVersion = '0.1';

    /**
     * This is the version of the PHP implementation that the NodeJS implementation imitates. 
     * It is sent to the H5P Hub when registering there.
     * Not user-configurable and should not be changed by custom implementations.
     */
    this.h5pVersion = '1.22';

    /**
     * This is the version of the H5P Core (JS + CSS) that is used by this implementation.
     * It is sent to the H5P Hub when registering there.
     * Not user-configurable and should not be changed by custom implementations.
     */
    this.coreApiVersion = { major: 1, minor: 19 };

    /**
     * Unclear. Taken over from PHP implementation and sent to the H5P Hub when registering the site.
     * User-configurable.
     */
    this.fetchingDisabled = 0;

    /**
     * Used to identify the running instance when calling the H5P Hub.
     * User-configurable, but also automatically set when the Hub is first called.
     */
    this.uuid = ''; // TODO: revert to''

    /**
     * Unclear. Taken over from PHP implementation.
     */
    this.siteType = 'local';

    /**
     * If true, the instance will send usage statistics to the H5P Hub whenever it looks for new content types or updates.
     * User-configurable.
     */
    this.sendUsageStatistics = false;

    /**
     * Called to register the running instance at the H5P Hub.
     * Not user-configurable.
     */
    this.hubRegistrationEndpoint = 'https://api.h5p.org/v1/sites';

    /**
     * Called to fetch information about the content types available at the H5P Hub.
     * Not user-configurable.
     */
    this.hubContentTypesEndpoint = 'https://api.h5p.org/v1/content-types/';

    /** 
     * Time after which the content type cache is considered to be outdated in milliseconds. 
     * User-configurable. 
     */
    this.contentTypeCacheRefreshInterval = 1 * 1000 * 60 * 60 * 24;

    /**
     * If set to true, the content types that require a Learning Record Store to make sense are 
     * offered as a choice when the user creates new content.
     * User-configurable.
     */
    this.enableLrsContentTypes = true;

    /**
     * The list of content types that are enabled when enableLrsContentTypes is set to true.
     * Not user-configurable.
     */
    this.lrsContentTypes = ['H5P.Questionnaire', 'H5P.FreeTextQuestion'];
  }

  /**
   * Loads a settings from the storage interface.
   * @param {string} settingName 
   * @returns {Promise<any>} the value of the setting
   */


  _createClass(H5PEditorConfig, [{
    key: 'loadSettingFromStorage',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(settingName) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this._storage.load(settingName);

              case 2:
                _context.t0 = _context.sent;

                if (_context.t0) {
                  _context.next = 5;
                  break;
                }

                _context.t0 = this[settingName];

              case 5:
                this[settingName] = _context.t0;

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function loadSettingFromStorage(_x) {
        return _ref.apply(this, arguments);
      }

      return loadSettingFromStorage;
    }()

    /**
     * Saves a setting to the storage interface.
     * @param {string} settingName 
     */

  }, {
    key: 'saveSettingToStorage',
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(settingName) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._storage.save(settingName, this[settingName]);

              case 2:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function saveSettingToStorage(_x2) {
        return _ref2.apply(this, arguments);
      }

      return saveSettingToStorage;
    }()

    /**
     * Loads all changeable settings from storage. (Should be called when the system initializes.)
     */

  }, {
    key: 'load',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.loadSettingFromStorage("fetchingDisabled");

              case 2:
                _context3.next = 4;
                return this.loadSettingFromStorage("uuid");

              case 4:
                _context3.next = 6;
                return this.loadSettingFromStorage("siteType");

              case 6:
                _context3.next = 8;
                return this.loadSettingFromStorage("sendUsageStatistics");

              case 8:
                _context3.next = 10;
                return this.loadSettingFromStorage("contentTypeCacheRefreshInterval");

              case 10:
                _context3.next = 12;
                return this.loadSettingFromStorage("enableLrsContentTypes");

              case 12:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function load() {
        return _ref3.apply(this, arguments);
      }

      return load;
    }()

    /**
     * Saves all changeable settings to storage. (Should be called when a setting was changed.)
     */

  }, {
    key: 'save',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return this.saveSettingToStorage("fetchingDisabled");

              case 2:
                _context4.next = 4;
                return this.saveSettingToStorage("uuid");

              case 4:
                _context4.next = 6;
                return this.saveSettingToStorage("siteType");

              case 6:
                _context4.next = 8;
                return this.saveSettingToStorage("sendUsageStatistics");

              case 8:
                _context4.next = 10;
                return this.saveSettingToStorage("contentTypeCacheRefreshInterval");

              case 10:
                _context4.next = 12;
                return this.saveSettingToStorage("enableLrsContentTypes");

              case 12:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function save() {
        return _ref4.apply(this, arguments);
      }

      return save;
    }()
  }]);

  return H5PEditorConfig;
}();

module.exports = H5PEditorConfig;