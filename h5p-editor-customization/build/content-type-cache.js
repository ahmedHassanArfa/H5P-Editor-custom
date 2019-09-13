'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _require = require('crc'),
    crc32 = _require.crc32;

var axios = require('axios');
var merge = require('merge');
var qs = require('qs');

/**
 * This class caches the information about the content types on the H5P Hub.
 * 
 * IT DOES NOT exactly correspond to the ContentTypeCache of the original PHP implementation,
 * as it only caches the data (and converts it to a local format). It DOES NOT add information
 * about locally installed libraries and user rights. ContentTypeInformationRepository is meant to do this. 
 * 
 * Usage:
 * - Get the content type information by calling get(). 
 * - The method updateIfNecessary() should be called regularly, e.g. through a cron-job.
 * - Use contentTypeCacheRefreshInterval in the H5PEditorConfig object to set how often
 *   the update should be performed. You can also use forceUpdate() if you want to bypass the 
 *   interval. 
 */

var ContentTypeCache = function () {
    /**
     * 
     * @param {H5PEditorConfig} config The configuration to use.
     * @param {IStorage} storage The storage object.
     */
    function ContentTypeCache(config, storage) {
        _classCallCheck(this, ContentTypeCache);

        this._config = config;
        this._storage = storage;
    }

    /**
     * Checks if the cache is not up to date anymore (update interval exceeded).
     * @returns {Promise<boolean>} true if cache is outdated, false if not
     */


    _createClass(ContentTypeCache, [{
        key: 'isOutdated',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                var lastUpdate;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this._storage.load("contentTypeCacheUpdate");

                            case 2:
                                lastUpdate = _context.sent;
                                return _context.abrupt('return', !lastUpdate || Date.now() - lastUpdate > this._config.contentTypeCacheRefreshInterval);

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function isOutdated() {
                return _ref.apply(this, arguments);
            }

            return isOutdated;
        }()

        /**
         * Checks if the interval between updates has been exceeded and updates the cache if necessary.
         * @returns {Promise<boolean>} true if cache was updated, false if not
         */

    }, {
        key: 'updateIfNecessary',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var oldCache;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this._storage.load("contentTypeCache");

                            case 2:
                                oldCache = _context2.sent;
                                _context2.t0 = !oldCache;

                                if (_context2.t0) {
                                    _context2.next = 8;
                                    break;
                                }

                                _context2.next = 7;
                                return this.isOutdated();

                            case 7:
                                _context2.t0 = _context2.sent;

                            case 8:
                                if (!_context2.t0) {
                                    _context2.next = 10;
                                    break;
                                }

                                return _context2.abrupt('return', this.forceUpdate());

                            case 10:
                                return _context2.abrupt('return', false);

                            case 11:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function updateIfNecessary() {
                return _ref2.apply(this, arguments);
            }

            return updateIfNecessary;
        }()

        /**
         * Downloads the content type information from the H5P Hub and stores it in the storage object.
         * @returns {Promise<boolean>} true if update was done; false if it failed (e.g. because Hub was unreachable)
         */

    }, {
        key: 'forceUpdate',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                var cacheInHubFormat, cacheInInternalFormat;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                cacheInHubFormat = void 0;
                                _context3.prev = 1;
                                _context3.next = 4;
                                return this._downloadContentTypesFromHub();

                            case 4:
                                cacheInHubFormat = _context3.sent;

                                if (cacheInHubFormat) {
                                    _context3.next = 7;
                                    break;
                                }

                                return _context3.abrupt('return', false);

                            case 7:
                                _context3.next = 12;
                                break;

                            case 9:
                                _context3.prev = 9;
                                _context3.t0 = _context3['catch'](1);
                                return _context3.abrupt('return', false);

                            case 12:
                                cacheInInternalFormat = cacheInHubFormat.map(ContentTypeCache._convertCacheEntryToLocalFormat);
                                _context3.next = 15;
                                return this._storage.save("contentTypeCache", cacheInInternalFormat);

                            case 15:
                                _context3.next = 17;
                                return this._storage.save("contentTypeCacheUpdate", Date.now());

                            case 17:
                                return _context3.abrupt('return', true);

                            case 18:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[1, 9]]);
            }));

            function forceUpdate() {
                return _ref3.apply(this, arguments);
            }

            return forceUpdate;
        }()

        /**
         * Returns the cache data.
         * @returns {Promise<any[]>} Cached hub data in a format in which the version objects are flattened into the main object, 
         */

    }, {
        key: 'get',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                return _context4.abrupt('return', this._storage.load("contentTypeCache"));

                            case 1:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function get() {
                return _ref4.apply(this, arguments);
            }

            return get;
        }()

        /**
         * If the running site has already been registered at the H5P hub, this method will
         * return the UUID of it. If it hasn't been registered yet, it will do so and store
         * the UUID in the storage object.
         * @returns {Promise<string>} uuid
         */

    }, {
        key: '_registerOrGetUuid',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                var response;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                if (!this._config.uuid) {
                                    _context5.next = 2;
                                    break;
                                }

                                return _context5.abrupt('return', this._config.uuid);

                            case 2:
                                _context5.next = 4;
                                return axios.post(this._config.hubRegistrationEndpoint, this._compileRegistrationData());

                            case 4:
                                response = _context5.sent;

                                if (!(response.status !== 200)) {
                                    _context5.next = 7;
                                    break;
                                }

                                throw new Error('Could not register this site at the H5P Hub. HTTP status ' + response.status + ' ' + response.statusText);

                            case 7:
                                if (!(!response.data || !response.data.uuid)) {
                                    _context5.next = 9;
                                    break;
                                }

                                throw new Error("Could not register this site at the H5P Hub.");

                            case 9:
                                this._config.uuid = response.data.uuid;
                                _context5.next = 12;
                                return this._config.save();

                            case 12:
                                return _context5.abrupt('return', this._config.uuid);

                            case 13:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function _registerOrGetUuid() {
                return _ref5.apply(this, arguments);
            }

            return _registerOrGetUuid;
        }()

        /**
         * @returns An object with the registration data as required by the H5P Hub
         */

    }, {
        key: '_compileRegistrationData',
        value: function _compileRegistrationData() {
            return {
                uuid: this._config.uuid,
                platform_name: this._config.platformName,
                platform_version: this._config.platformVersion,
                h5p_version: this._config.h5pVersion,
                disabled: this._config.fetchingDisabled,
                local_id: ContentTypeCache._generateLocalId(),
                type: this._config.siteType,
                core_api_version: this._config.coreApiVersion.major + '.' + this._config.coreApiVersion.minor
            };
        }

        /**
         * @returns An object with usage statistics as required by the H5P Hub
         */
        // eslint-disable-next-line class-methods-use-this

    }, {
        key: '_compileUsageStatistics',
        value: function _compileUsageStatistics() {
            return {
                num_authors: 0, // number of active authors
                libraries: {} // TODO: add library information here
            };
        }

        /**
         * Downloads information about available content types from the H5P Hub. This method will
         * create a UUID to identify this site if required. 
         * @returns {Promise<any[]>} content types
         */

    }, {
        key: '_downloadContentTypesFromHub',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
                var formData, response;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return this._registerOrGetUuid();

                            case 2:
                                formData = this._compileRegistrationData();

                                if (this._config.sendUsageStatistics) {
                                    formData = merge.recursive(true, formData, this._compileUsageStatistics());
                                }

                                _context6.next = 6;
                                return axios.post(this._config.hubContentTypesEndpoint, qs.stringify(formData));

                            case 6:
                                response = _context6.sent;

                                if (!(response.status !== 200)) {
                                    _context6.next = 9;
                                    break;
                                }

                                throw new Error('Could not fetch content type information from the H5P Hub. HTTP status ' + response.status + ' ' + response.statusText);

                            case 9:
                                if (response.data) {
                                    _context6.next = 11;
                                    break;
                                }

                                throw new Error("Could not fetch content type information from the H5P Hub.");

                            case 11:
                                return _context6.abrupt('return', response.data.contentTypes);

                            case 12:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function _downloadContentTypesFromHub() {
                return _ref6.apply(this, arguments);
            }

            return _downloadContentTypesFromHub;
        }()

        /**
         * Converts an entry from the H5P Hub into a format with flattened versions and integer date values.
         * @param {object} entry 
         */

    }], [{
        key: '_convertCacheEntryToLocalFormat',
        value: function _convertCacheEntryToLocalFormat(entry) {
            return {
                machineName: entry.id,
                majorVersion: entry.version.major,
                minorVersion: entry.version.minor,
                patchVersion: entry.version.patch,
                h5pMajorVersion: entry.coreApiVersionNeeded.major,
                h5pMinorVersion: entry.coreApiVersionNeeded.minor,
                title: entry.title,
                summary: entry.summary,
                description: entry.description,
                icon: entry.icon,
                createdAt: Date.parse(entry.createdAt),
                updatedAt: Date.parse(entry.updatedAt),
                isRecommended: entry.isRecommended,
                popularity: entry.popularity,
                screenshots: entry.screenshots,
                license: entry.license,
                owner: entry.owner,
                example: entry.example,
                tutorial: entry.tutorial || '',
                keywords: entry.keywords || [],
                categories: entry.categories || []
            };
        }

        /**
         * Creates an identifier for the running instance.
         * @returns {string} id
         */

    }, {
        key: '_generateLocalId',
        value: function _generateLocalId() {
            return crc32(__dirname);
        }
    }]);

    return ContentTypeCache;
}();

module.exports = ContentTypeCache;