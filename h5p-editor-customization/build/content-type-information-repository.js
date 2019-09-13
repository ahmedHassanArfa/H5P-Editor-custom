'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This class provides access to information about content types that are either available at the H5P Hub
 * or were installed locally. It is used by the editor to display the list of available content types. Technically
 * it fulfills the same functionality as the "ContentTypeCache" in the original PHP implementation, but it has been
 * renamed in the NodeJS version, as it provides more functionality than just caching the information from the Hub:
 *   - it checks if the current user has the rights to update or install a content type
 *   - it checks if a content type in the Hub is installed locally and is outdated locally
 *   - it adds information about only locally installed content types
 */
var ContentTypeInformationRepository = function () {
    /**
     * 
     * @param {ContentTypeCache} contentTypeCache 
     * @param {IStorage} storage 
     * @param {ILibraryManager} libraryManager 
     * @param {H5PEditorConfig} config 
     * @param {IUser} user 
     */
    function ContentTypeInformationRepository(contentTypeCache, storage, libraryManager, config, user) {
        _classCallCheck(this, ContentTypeInformationRepository);

        this._contentTypeCache = contentTypeCache;
        this._storage = storage;
        this._libraryManager = libraryManager;
        this._config = config;
        this._user = user;
    }

    /**
     * Gets the information about available content types with all the extra information as listed in the class description.
     */


    _createClass(ContentTypeInformationRepository, [{
        key: 'get',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                var cachedHubInfo;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this._contentTypeCache.get();

                            case 2:
                                cachedHubInfo = _context.sent;

                                if (cachedHubInfo) {
                                    _context.next = 9;
                                    break;
                                }

                                _context.next = 6;
                                return this._contentTypeCache.updateIfNecessary();

                            case 6:
                                _context.next = 8;
                                return this._contentTypeCache.get();

                            case 8:
                                cachedHubInfo = _context.sent;

                            case 9:
                                if (!cachedHubInfo) {
                                    // if the H5P Hub is unreachable use empty array (so that local libraries can be added)
                                    cachedHubInfo = [];
                                }
                                _context.next = 12;
                                return this._addUserAndInstallationSpecificInfo(cachedHubInfo);

                            case 12:
                                cachedHubInfo = _context.sent;
                                _context.next = 15;
                                return this._addLocalLibraries(cachedHubInfo);

                            case 15:
                                cachedHubInfo = _context.sent;
                                _context.next = 18;
                                return this._contentTypeCache.isOutdated();

                            case 18:
                                _context.t0 = _context.sent;

                                if (!_context.t0) {
                                    _context.next = 21;
                                    break;
                                }

                                _context.t0 = this._user.canInstallRecommended || this._user.canUpdateAndInstallLibraries;

                            case 21:
                                _context.t1 = _context.t0;
                                _context.t2 = cachedHubInfo;
                                _context.t3 = this._user.type;
                                _context.t4 = [];
                                _context.t5 = this._config.coreApiVersion;
                                return _context.abrupt('return', {
                                    outdated: _context.t1,
                                    libraries: _context.t2,
                                    user: _context.t3,
                                    recentlyUsed: _context.t4,
                                    apiVersion: _context.t5,
                                    details: null
                                });

                            case 27:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function get() {
                return _ref.apply(this, arguments);
            }

            return get;
        }()

        /**
         * 
         * @param {any[]} hubInfo
         * @returns {Promise<any[]>} The original hub information as passed into the method with appended information about 
         * locally installed libraries.  
         */

    }, {
        key: '_addLocalLibraries',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(hubInfo) {
                var _this = this;

                var localLibsWrapped, localLibs;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this._libraryManager.getInstalled();

                            case 2:
                                localLibsWrapped = _context3.sent;
                                localLibs = Object.keys(localLibsWrapped).map(function (machineName) {
                                    return localLibsWrapped[machineName][localLibsWrapped[machineName].length - 1];
                                }).filter(function (lib) {
                                    return !hubInfo.some(function (hubLib) {
                                        return hubLib.machineName === lib.machineName;
                                    }) && lib.runnable;
                                }).map(function () {
                                    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(localLib) {
                                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                            while (1) {
                                                switch (_context2.prev = _context2.next) {
                                                    case 0:
                                                        _context2.t0 = localLib.id;
                                                        _context2.t1 = localLib.machineName;
                                                        _context2.t2 = localLib.title;
                                                        _context2.t3 = localLib.majorVersion;
                                                        _context2.t4 = localLib.minorVersion;
                                                        _context2.t5 = localLib.patchVersion;
                                                        _context2.t6 = localLib.majorVersion;
                                                        _context2.t7 = localLib.minorVersion;
                                                        _context2.t8 = localLib.patchVersion;
                                                        _context2.t9 = _this._libraryIsRestricted(localLib) && !_this._user.canCreateRestricted;
                                                        _context2.next = 12;
                                                        return _this._libraryManager.libraryFileExists(localLib, 'icon.svg');

                                                    case 12:
                                                        if (!_context2.sent) {
                                                            _context2.next = 16;
                                                            break;
                                                        }

                                                        _context2.t10 = _this._libraryManager.getLibraryFileUrl('icon.svg');
                                                        _context2.next = 17;
                                                        break;

                                                    case 16:
                                                        _context2.t10 = undefined;

                                                    case 17:
                                                        _context2.t11 = _context2.t10;
                                                        return _context2.abrupt('return', {
                                                            id: _context2.t0,
                                                            machineName: _context2.t1,
                                                            title: _context2.t2,
                                                            description: '',
                                                            majorVersion: _context2.t3,
                                                            minorVersion: _context2.t4,
                                                            patchVersion: _context2.t5,
                                                            localMajorVersion: _context2.t6,
                                                            localMinorVersion: _context2.t7,
                                                            localPatchVersion: _context2.t8,
                                                            canInstall: false,
                                                            installed: true,
                                                            isUpToDate: true,
                                                            owner: '',
                                                            restricted: _context2.t9,
                                                            icon: _context2.t11
                                                        });

                                                    case 19:
                                                    case 'end':
                                                        return _context2.stop();
                                                }
                                            }
                                        }, _callee2, _this);
                                    }));

                                    return function (_x2) {
                                        return _ref3.apply(this, arguments);
                                    };
                                }());
                                _context3.next = 6;
                                return Promise.all(localLibs);

                            case 6:
                                localLibs = _context3.sent;
                                return _context3.abrupt('return', hubInfo.concat(localLibs));

                            case 8:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function _addLocalLibraries(_x) {
                return _ref2.apply(this, arguments);
            }

            return _addLocalLibraries;
        }()

        /**
         * Adds information about installation status, restriction, right to install and up-to-dateness.
         * @param {any[]} hubInfo 
         * @returns {Promise<any[]>} The hub information as passed into the method with added information. 
         */

    }, {
        key: '_addUserAndInstallationSpecificInfo',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(hubInfo) {
                var _this2 = this;

                var localLibsWrapped, localLibs;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this._libraryManager.getInstalled();

                            case 2:
                                localLibsWrapped = _context5.sent;
                                localLibs = Object.keys(localLibsWrapped).map(function (machineName) {
                                    return localLibsWrapped[machineName][localLibsWrapped[machineName].length - 1];
                                });
                                _context5.next = 6;
                                return Promise.all(hubInfo.map(function () {
                                    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(hl) {
                                        var hubLib, localLib;
                                        return regeneratorRuntime.wrap(function _callee4$(_context4) {
                                            while (1) {
                                                switch (_context4.prev = _context4.next) {
                                                    case 0:
                                                        hubLib = hl; // to avoid eslint from complaining about changing function parameters

                                                        localLib = localLibs.find(function (l) {
                                                            return l.machineName === hubLib.machineName;
                                                        });

                                                        if (localLib) {
                                                            _context4.next = 9;
                                                            break;
                                                        }

                                                        hubLib.installed = false;
                                                        hubLib.restricted = !_this2._canInstallLibrary(hubLib);
                                                        hubLib.canInstall = _this2._canInstallLibrary(hubLib);
                                                        hubLib.isUpToDate = true;
                                                        _context4.next = 19;
                                                        break;

                                                    case 9:
                                                        hubLib.id = localLib.id;
                                                        hubLib.installed = true;
                                                        hubLib.restricted = _this2._libraryIsRestricted(localLib) && !_this2._user.canCreateRestricted;
                                                        hubLib.canInstall = !_this2._libraryIsRestricted(localLib) && _this2._canInstallLibrary(hubLib);
                                                        _context4.next = 15;
                                                        return _this2._libraryManager.libraryHasUpgrade(hubLib);

                                                    case 15:
                                                        hubLib.isUpToDate = !_context4.sent;

                                                        hubLib.localMajorVersion = localLib.majorVersion;
                                                        hubLib.localMinorVersion = localLib.minorVersion;
                                                        hubLib.localPatchVersion = localLib.patchVersion;

                                                    case 19:
                                                    case 'end':
                                                        return _context4.stop();
                                                }
                                            }
                                        }, _callee4, _this2);
                                    }));

                                    return function (_x4) {
                                        return _ref5.apply(this, arguments);
                                    };
                                }()));

                            case 6:
                                return _context5.abrupt('return', hubInfo);

                            case 7:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function _addUserAndInstallationSpecificInfo(_x3) {
                return _ref4.apply(this, arguments);
            }

            return _addUserAndInstallationSpecificInfo;
        }()

        /**
         * Checks if the library is restricted e.g. because it is LRS dependent and the
         * admin has restricted them or because it was set as restricted individually.
         * @param {Library} library 
         */

    }, {
        key: '_libraryIsRestricted',
        value: function _libraryIsRestricted(library) {
            if (this._config.enableLrsContentTypes) {
                return library.restricted;
            }
            if (this._config.lrsContentTypes.some(function (contentType) {
                return contentType === library.machineName;
            })) {
                return true;
            }
            return library.restricted;
        }

        /**
         * Checks if users can install library due to their rights.
         * @param {Library} library 
         */

    }, {
        key: '_canInstallLibrary',
        value: function _canInstallLibrary(library) {
            return this._user.canUpdateAndInstallLibraries || library.isRecommended && this._user.canInstallRecommended;
        }
    }]);

    return ContentTypeInformationRepository;
}();

module.exports = ContentTypeInformationRepository;