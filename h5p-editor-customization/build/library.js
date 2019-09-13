"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Stores information about H5P libraries.
 */
var Library = function () {
    function Library(machineName, major, minor, patch) {
        _classCallCheck(this, Library);

        this.machineName = machineName;
        this.majorVersion = major;
        this.minorVersion = minor;
        this.patchVersion = patch;
        this.id = undefined;
        this.title = undefined;
        this.runnable = undefined;
        this.restricted = undefined;
    }

    /**
     * Compares libraries by giving precedence to title, then major version, then minor version 
     * @param {Library} otherLibrary 
     */


    _createClass(Library, [{
        key: "compare",
        value: function compare(otherLibrary) {
            return this.title.localeCompare(otherLibrary.title) || this.majorVersion - otherLibrary.majorVersion || this.minorVersion - otherLibrary.minorVersion;
        }

        /**
         * Compares libraries by giving precedence to major version, then minor version, then patch version. 
         * @param {Library} otherLibrary 
         */

    }, {
        key: "compareVersions",
        value: function compareVersions(otherLibrary) {
            return this.majorVersion - otherLibrary.majorVersion || this.minorVersion - otherLibrary.minorVersion || this.patchVersion - otherLibrary.patchVersion;
        }

        /**
         * Returns the directory name that is used for this library (e.g. H5P.ExampleLibrary-1.0)
         */

    }, {
        key: "getDirName",
        value: function getDirName() {
            return this.machineName + "-" + this.majorVersion + "." + this.minorVersion;
        }
    }]);

    return Library;
}();

module.exports = Library;