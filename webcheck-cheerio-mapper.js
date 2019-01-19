"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var webcheck_1 = require("webcheck");
var pkg = require("./package.json");
/**
 * A helper function for empty regular expressions
 * @private
 * @type {{test: Function}}
 */
var emptyFilter = {
    test: function () {
        return true;
    },
};
function mapper(mapping, result, $, force) {
    var data = {};
    for (var hash in mapping) {
        if (mapping.hasOwnProperty(hash)) {
            if (force.hasOwnProperty(hash) && typeof force[hash] !== "object") {
                data[hash] = force[hash];
            }
            else {
                if (typeof mapping[hash] === "string") {
                    data[hash] = $(mapping[hash]).text();
                }
                if (typeof mapping[hash] === "function") {
                    data[hash] =
                        mapping[hash]($, result);
                }
                if (typeof mapping[hash] === "object") {
                    data[hash] = mapper(mapping[hash], result, $, force[hash] || {});
                }
            }
        }
    }
    return data;
}
/**
 * Cheerio mapping plugin for webcheck.
 * @author Arne Schubert <atd.schubert@gmail.com>
 * @param {{}} [opts] - Options for this plugin
 * @param {{}} [opts.mappings] - Mappings
 * @param {RegExp|{test:Function}} [opts.filterContentType] - Follow only in matching content-type
 * @param {RegExp|{test:Function}} [opts.filterStatusCode] - Follow only in matching HTTP status code
 * @param {RegExp|{test:Function}} [opts.filterUrl] - Follow only in matching url
 * @param {Function} [opts.onError] - Function that get executed on errors
 * @param {Function} [opts.onData] - Function that get executed when data was fetched
 * @augments Webcheck.Plugin
 * @constructor
 */
var CheerioMapperPlugin = /** @class */ (function (_super) {
    __extends(CheerioMapperPlugin, _super);
    function CheerioMapperPlugin(opts) {
        var _this = _super.call(this) || this;
        _this.package = pkg;
        var contentTypeFilter = opts.filterContentType || /html|\+xml/;
        var statusCodeFilter = opts.filterStatusCode || /^2/;
        var urlFilter = opts.filterUrl || emptyFilter;
        // tslint:disable-next-line:no-console
        var fallbackLogging = function (err) { return console.error(err); };
        _this.onError = opts.onError || fallbackLogging;
        _this.onData = opts.onData;
        _this.mappings = opts.mappings;
        _this.on = {
            result: function (result) {
                if (!result.response.headers["content-type"]) {
                    result.response.headers["content-type"] = "application/octet-stream";
                }
                if (!urlFilter.test(result.url) ||
                    !contentTypeFilter.test(result.response.headers["content-type"]) ||
                    !statusCodeFilter.test(result.response.statusCode.toString())) {
                    return;
                }
                if (typeof result.getCheerio !== "function") {
                    _this.onError(new Error("CheerioPluginResult was not available. Did you activate the cheerio plugin?"), result);
                    return;
                }
                result.getCheerio(function (err, $) {
                    if (err) {
                        return _this.onError(err, result);
                    }
                    try {
                        _this.onData(mapper(_this.mappings, result, $, (result.settings.parameters && result.settings.parameters.forceValue) || {}), result);
                    }
                    catch (error) {
                        _this.onError(error, result);
                    }
                });
                result.settings.parameters = result.settings.parameters || {};
            },
        };
        return _this;
    }
    return CheerioMapperPlugin;
}(webcheck_1.Plugin));
exports.CheerioMapperPlugin = CheerioMapperPlugin;
//# sourceMappingURL=webcheck-cheerio-mapper.js.map