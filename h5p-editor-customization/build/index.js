'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var https = require('https');
var unzipper = require('unzipper');
var stream = require('stream');

var defaultEditorIntegration = require('../assets/default_editor_integration');
var defaultTranslation = require('../assets/translations/en.json');
var defaultRenderer = require('./renderers/default');

var ContentTypeCache = require('../src/content-type-cache');
var ContentTypeInformationRepository = require('../src/content-type-information-repository');

var H5PEditor = function () {
    function H5PEditor(storage) {
        var urls = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
            baseUrl: '/h5p',
            ajaxPath: '/ajax?action=',
            libraryUrl: '/h5p/editor/',
            filesPath: ''
        };
        var keyValueStorage = arguments[2];
        var config = arguments[3];
        var libraryManager = arguments[4];
        var user = arguments[5];

        _classCallCheck(this, H5PEditor);

        this.storage = storage;
        this.renderer = defaultRenderer;
        this.baseUrl = urls.baseUrl;
        this.translation = defaultTranslation;
        this.ajaxPath = urls.ajaxPath;
        this.libraryUrl = urls.libraryUrl;
        this.filesPath = urls.filesPath;
        this.contentTypeCache = new ContentTypeCache(config, keyValueStorage);
        this.contentTypeRepository = new ContentTypeInformationRepository(this.contentTypeCache, keyValueStorage, libraryManager, config, user);
        this.config = config;
    }

    _createClass(H5PEditor, [{
        key: 'render',
        value: function render(contentId) {
            var model = {
                styles: this._coreStyles(),
                scripts: this._coreScripts(),
                integration: this._integration(contentId)
            };

            return Promise.resolve(this.renderer(model));
        }
    }, {
        key: 'useRenderer',
        value: function useRenderer(renderer) {
            this.renderer = renderer;
            return this;
        }
    }, {
        key: 'setAjaxPath',
        value: function setAjaxPath(ajaxPath) {
            this.ajaxPath = ajaxPath;
            return this;
        }
    }, {
        key: 'saveH5P',
        value: function saveH5P(contentId, content, metadata, library) {
            var _this = this;

            return this.storage.saveContent(contentId, content).then(function () {
                return _this._generateH5PJSON(metadata, library);
            }).then(function (h5pJson) {
                return _this.storage.saveH5P(contentId, h5pJson);
            });
        }
    }, {
        key: 'loadH5P',
        value: function loadH5P(contentId) {
            var _this2 = this;

            return Promise.all([this.storage.loadH5PJson(contentId), this.storage.loadContent(contentId)]).then(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    h5pJson = _ref2[0],
                    content = _ref2[1];

                return {
                    library: _this2._getUbernameFromH5pJson(h5pJson),
                    h5p: h5pJson,
                    params: {
                        params: content,
                        metadata: h5pJson
                    }
                };
            });
        }
    }, {
        key: 'getLibraryData',
        value: function getLibraryData(machineName, majorVersion, minorVersion, language) {
            return Promise.all([this._loadAssets(machineName, majorVersion, minorVersion, language), this.storage.loadSemantics(machineName, majorVersion, minorVersion), this.storage.loadLanguage(machineName, majorVersion, minorVersion, language), this.storage.listLanguages(machineName, majorVersion, minorVersion)]).then(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 4),
                    assets = _ref4[0],
                    semantics = _ref4[1],
                    languageObject = _ref4[2],
                    languages = _ref4[3];

                return {
                    name: machineName,
                    version: {
                        major: majorVersion,
                        minor: minorVersion
                    },
                    semantics: semantics,
                    language: languageObject,
                    defaultLanguage: null,
                    javascript: assets.scripts,
                    css: assets.styles,
                    translations: assets.translations,
                    languages: languages
                };
            });
        }
    }, {
        key: '_loadAssets',
        value: function _loadAssets(machineName, majorVersion, minorVersion, language) {
            var _this3 = this;

            var loaded = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

            var key = machineName + '-' + majorVersion + '.' + minorVersion;
            var path = this.baseUrl + '/libraries/' + key;

            if (key in loaded) return Promise.resolve(null);
            loaded[key] = true;

            var assets = {
                scripts: [],
                styles: [],
                translations: {}
            };

            return Promise.all([this.storage.loadLibrary(machineName, majorVersion, minorVersion), this.storage.loadLanguage(machineName, majorVersion, minorVersion, language || 'en')]).then(function (_ref5) {
                var _ref6 = _slicedToArray(_ref5, 2),
                    library = _ref6[0],
                    translation = _ref6[1];

                return Promise.all([_this3._resolveDependencies(library.preloadedDependencies || [], language, loaded), _this3._resolveDependencies(library.editorDependencies || [], language, loaded)]).then(function (combinedDependencies) {

                    combinedDependencies.forEach(function (dependencies) {
                        return dependencies.forEach(function (dependency) {
                            dependency.scripts.forEach(function (script) {
                                return assets.scripts.push(script);
                            });
                            dependency.styles.forEach(function (script) {
                                return assets.styles.push(script);
                            });
                            Object.keys(dependency.translations).forEach(function (k) {
                                assets.translations[k] = dependency.translations[k];
                            });
                        });
                    });

                    (library.preloadedJs || []).forEach(function (script) {
                        return assets.scripts.push(path + '/' + script.path);
                    });
                    (library.preloadedCss || []).forEach(function (style) {
                        return assets.styles.push(path + '/' + style.path);
                    });
                    assets.translations[machineName] = translation || undefined;
                });
            }).then(function () {
                return assets;
            });
        }
    }, {
        key: '_resolveDependencies',
        value: function _resolveDependencies(originalDependencies, language, loaded) {
            var _this4 = this;

            var dependencies = originalDependencies.slice();
            var resolved = [];

            var resolve = function resolve(dependency) {
                if (!dependency) return Promise.resolve(resolved);

                return _this4._loadAssets(dependency.machineName, dependency.majorVersion, dependency.minorVersion, language, loaded).then(function (assets) {
                    return assets ? resolved.push(assets) : null;
                }).then(function () {
                    return resolve(dependencies.shift());
                });
            };

            return resolve(dependencies.shift());
        }
    }, {
        key: 'getContentTypeCache',
        value: function getContentTypeCache() {
            return this.contentTypeRepository.get();
        }
    }, {
        key: 'saveContentFile',
        value: function saveContentFile(contentId, field, file) {
            var _this5 = this;

            return new Promise(function (resolve) {
                _this5.storage.saveContentFile(contentId, field, file).then(function () {
                    resolve({
                        mime: file.mimetype,
                        path: file.name
                    });
                });
            });
        }
    }, {
        key: 'getLibraryOverview',
        value: function getLibraryOverview(libraries) {
            var _this6 = this;

            return Promise.all(libraries.map(function (libraryName) {
                var _parseLibraryString2 = _this6._parseLibraryString(libraryName),
                    machineName = _parseLibraryString2.machineName,
                    majorVersion = _parseLibraryString2.majorVersion,
                    minorVersion = _parseLibraryString2.minorVersion;

                return _this6.storage.loadLibrary(machineName, majorVersion, minorVersion).then(function (library) {
                    return {
                        uberName: library.machineName + ' ' + library.majorVersion + '.' + library.minorVersion,
                        name: library.machineName,
                        majorVersion: library.majorVersion,
                        minorVersion: library.minorVersion,
                        tutorialUrl: '',
                        title: library.title,
                        runnable: library.runnable,
                        restricted: false,
                        metadataSettings: null
                    };
                });
            }));
        }
    }, {
        key: '_generateH5PJSON',
        value: function _generateH5PJSON(metadata, _library) {
            var _this7 = this;

            return new Promise(function (resolve) {
                var lib = _this7._parseLibraryString(_library);
                _this7.storage.loadLibrary(lib.machineName, lib.majorVersion, lib.minorVersion).then(function (library) {
                    var h5pJson = Object.assign({}, metadata, {
                        mainLibrary: library.machineName,
                        preloadedDependencies: [].concat(_toConsumableArray(library.preloadedDependencies), [{
                            machineName: library.machineName,
                            majorVersion: library.majorVersion,
                            minorVersion: library.minorVersion
                        }])
                    });

                    resolve(h5pJson);
                });
            });
        }

        // eslint-disable-next-line class-methods-use-this

    }, {
        key: '_getUbernameFromH5pJson',
        value: function _getUbernameFromH5pJson(h5pJson) {
            var library = h5pJson.preloadedDependencies.filter(function (dependency) {
                return dependency.machineName === h5pJson.mainLibrary;
            })[0];
            return library.machineName + ' ' + library.majorVersion + '.' + library.minorVersion;
        }

        // eslint-disable-next-line class-methods-use-this

    }, {
        key: '_parseLibraryString',
        value: function _parseLibraryString(libraryName) {
            return {
                machineName: libraryName.split(' ')[0],
                majorVersion: libraryName.split(' ')[1].split('.')[0],
                minorVersion: libraryName.split(' ')[1].split('.')[1]
            };
        }
    }, {
        key: 'installLibrary',
        value: function installLibrary(id) {
            var _this8 = this;

            return new Promise(function (y) {
                return https.get(_this8.config.hubContentTypesEndpoint + id, function (response) {
                    response.pipe(unzipper.Parse()).on('entry', function (entry) {
                        var base = entry.path.split('/')[0];
                        if (base === 'content' || base === 'h5p.json') {
                            entry.autodrain();
                            return;
                        }

                        _this8.storage.saveLibraryFile(entry.path, entry);
                    }).on('close', y);
                });
            });
        }
    }, {
        key: 'uploadPackage',
        value: function uploadPackage(contentId, data) {
            var _this9 = this;

            var dataStream = new stream.PassThrough();
            dataStream.end(data);

            var filesSaves = [];

            return new Promise(function (y) {
                return dataStream.pipe(unzipper.Parse()).on('entry', function (entry) {
                    var base = entry.path.split('/')[0];

                    if (base === 'content' || base === 'h5p.json') {
                        filesSaves.push(_this9.storage.saveContentFile2(contentId, entry.path, entry));
                    } else {
                        filesSaves.push(_this9.storage.saveLibraryFile(entry.path, entry));
                    }
                }).on('close', y);
            }).then(function () {
                return Promise.all(filesSaves);
            });
        }
    }, {
        key: '_coreScripts',
        value: function _coreScripts() {
            var _this10 = this;

            return ['/core/js/jquery.js', '/core/js/h5p.js', '/core/js/h5p-event-dispatcher.js', '/core/js/h5p-x-api-event.js', '/core/js/h5p-x-api.js', '/core/js/h5p-content-type.js', '/core/js/h5p-confirmation-dialog.js', '/core/js/h5p-action-bar.js', '/editor/scripts/h5p-hub-client.js', '/editor/scripts/h5peditor-editor.js', '/editor/scripts/h5peditor.js', '/editor/scripts/h5peditor-semantic-structure.js', '/editor/scripts/h5peditor-library-selector.js', '/editor/scripts/h5peditor-form.js', '/editor/scripts/h5peditor-text.js', '/editor/scripts/h5peditor-html.js', '/editor/scripts/h5peditor-number.js', '/editor/scripts/h5peditor-textarea.js', '/editor/scripts/h5peditor-file-uploader.js', '/editor/scripts/h5peditor-file.js', '/editor/scripts/h5peditor-image.js', '/editor/scripts/h5peditor-image-popup.js', '/editor/scripts/h5peditor-av.js', '/editor/scripts/h5peditor-group.js', '/editor/scripts/h5peditor-boolean.js', '/editor/scripts/h5peditor-list.js', '/editor/scripts/h5peditor-list-editor.js', '/editor/scripts/h5peditor-library.js', '/editor/scripts/h5peditor-library-list-cache.js', '/editor/scripts/h5peditor-select.js', '/editor/scripts/h5peditor-selector-hub.js', '/editor/scripts/h5peditor-selector-legacy.js', '/editor/scripts/h5peditor-dimensions.js', '/editor/scripts/h5peditor-coordinates.js', '/editor/scripts/h5peditor-none.js', '/editor/scripts/h5peditor-metadata.js', '/editor/scripts/h5peditor-metadata-author-widget.js', '/editor/scripts/h5peditor-metadata-changelog-widget.js', '/editor/scripts/h5peditor-pre-save.js', '/editor/ckeditor/ckeditor.js', '/editor/wp/h5p-editor.js'].map(function (file) {
                return '' + _this10.baseUrl + file;
            });
        }
    }, {
        key: '_coreStyles',
        value: function _coreStyles() {
            var _this11 = this;

            return ['/core/styles/h5p.css', '/core/styles/h5p-confirmation-dialog.css', '/core/styles/h5p-core-button.css', '/editor/libs/darkroom.css', '/editor/styles/css/h5p-hub-client.css', '/editor/styles/css/fonts.css', '/editor/styles/css/application.css', '/editor/styles/css/libs/zebra_datepicker.min.css'].map(function (file) {
                return '' + _this11.baseUrl + file;
            });
        }
    }, {
        key: '_editorIntegration',
        value: function _editorIntegration(contentId) {
            var _this12 = this;

            return Object.assign(defaultEditorIntegration, {
                ajaxPath: this.ajaxPath,
                libraryUrl: this.libraryUrl,
                filesPath: this.filesPath + '/' + contentId + '/content',
                assets: {
                    css: ['/core/styles/h5p.css', '/core/styles/h5p-confirmation-dialog.css', '/core/styles/h5p-core-button.css', '/editor/libs/darkroom.css', '/editor/styles/css/h5p-hub-client.css', '/editor/styles/css/fonts.css', '/editor/styles/css/application.css', '/editor/styles/css/libs/zebra_datepicker.min.css'].map(function (asset) {
                        return '' + _this12.baseUrl + asset;
                    }),
                    js: ['/core/js/jquery.js', '/core/js/h5p.js', '/core/js/h5p-event-dispatcher.js', '/core/js/h5p-x-api-event.js', '/core/js/h5p-x-api.js', '/core/js/h5p-content-type.js', '/core/js/h5p-confirmation-dialog.js', '/core/js/h5p-action-bar.js', '/editor/scripts/h5p-hub-client.js', '/editor/scripts/h5peditor.js', '/editor/language/en.js', '/editor/scripts/h5peditor-semantic-structure.js', '/editor/scripts/h5peditor-library-selector.js', '/editor/scripts/h5peditor-form.js', '/editor/scripts/h5peditor-text.js', '/editor/scripts/h5peditor-html.js', '/editor/scripts/h5peditor-number.js', '/editor/scripts/h5peditor-textarea.js', '/editor/scripts/h5peditor-file-uploader.js', '/editor/scripts/h5peditor-file.js', '/editor/scripts/h5peditor-image.js', '/editor/scripts/h5peditor-image-popup.js', '/editor/scripts/h5peditor-av.js', '/editor/scripts/h5peditor-group.js', '/editor/scripts/h5peditor-boolean.js', '/editor/scripts/h5peditor-list.js', '/editor/scripts/h5peditor-list-editor.js', '/editor/scripts/h5peditor-library.js', '/editor/scripts/h5peditor-library-list-cache.js', '/editor/scripts/h5peditor-select.js', '/editor/scripts/h5peditor-selector-hub.js', '/editor/scripts/h5peditor-selector-legacy.js', '/editor/scripts/h5peditor-dimensions.js', '/editor/scripts/h5peditor-coordinates.js', '/editor/scripts/h5peditor-none.js', '/editor/scripts/h5peditor-metadata.js', '/editor/scripts/h5peditor-metadata-author-widget.js', '/editor/scripts/h5peditor-metadata-changelog-widget.js', '/editor/scripts/h5peditor-pre-save.js', '/editor/ckeditor/ckeditor.js'].map(function (asset) {
                        return '' + _this12.baseUrl + asset;
                    })
                }
            });
        }
    }, {
        key: '_integration',
        value: function _integration(contentId) {
            return {
                url: this.baseUrl,
                postUserStatistics: false,
                saveFreq: false,
                hubIsEnabled: true,
                l10n: {
                    H5P: this.translation
                },
                editor: this._editorIntegration(contentId)
            };
        }
    }]);

    return H5PEditor;
}();

module.exports = H5PEditor;