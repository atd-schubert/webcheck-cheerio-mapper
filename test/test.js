"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var freeport = require("freeport");
var webcheck_1 = require("webcheck");
var webcheck_cheerio_1 = require("webcheck-cheerio");
var webcheck_plugin_group_1 = require("webcheck-plugin-group");
var __1 = require("../");
describe("Cheerio Mapper Plugin", function () {
    var port;
    var server;
    before(function (done) {
        var app = express();
        app.get("/", function (req, res) {
            // tslint:disable-next-line:max-line-length
            res.set("Content-Type", "text/html").send("<html><head></head><body><a class=\"a\">Text from class A</a><div class=\"b\">Text from class B</div><span class=\"c\">Text from class C</span></body></html>");
        });
        freeport(function (err, p) {
            if (err) {
                done(err);
            }
            port = p;
            server = app.listen(port);
            done();
        });
    });
    after(function (done) {
        server.close(done);
    });
    describe("Get mappings", function () {
        var webcheck = new webcheck_1.Webcheck();
        var plugin = new __1.CheerioMapperPlugin({});
        var group = new webcheck_plugin_group_1.PluginGroup({
            plugins: [new webcheck_cheerio_1.CheerioPlugin(), plugin],
        });
        before(function () {
            webcheck.addPlugin(group);
            group.enable();
        });
        it("should get a linear mapping", function (done) {
            plugin.onError = done;
            plugin.onData = function (data) {
                if (data.a === "Text from class A"
                    && data.b === "Text from class B"
                    && data.c === "Text from class C") {
                    return done();
                }
                return done(new Error("Wrong content fetched"));
            };
            plugin.mappings = {
                a: ".a",
                b: "div.b",
                c: ".c",
            };
            webcheck.crawl({
                url: "http://localhost:" + port + "/",
            }, function (err) {
                if (err) {
                    return done(err);
                }
            });
        });
        it("should get a nested mapping", function (done) {
            plugin.onError = done;
            plugin.onData = function (data) {
                if (data.a === "Text from class A"
                    && data.nested.b === "Text from class B"
                    && data.nested.c === "Text from class C") {
                    return done();
                }
                return done(new Error("Wrong content fetched"));
            };
            plugin.mappings = {
                a: ".a",
                nested: {
                    b: "div.b",
                    c: ".c",
                },
            };
            webcheck.crawl({
                url: "http://localhost:" + port + "/",
            }, function (err) {
                if (err) {
                    return done(err);
                }
            });
        });
        it("should parse with functions and nested", function (done) {
            plugin.onError = done;
            plugin.onData = function (data) {
                if (data.a === "Text from class A"
                    && data.nested.b === "Text from class B"
                    && data.nested.c === "Text from class C") {
                    return done();
                }
                return done(new Error("Wrong content fetched"));
            };
            plugin.mappings = {
                a: function ($, result) {
                    return $(".a").text();
                },
                nested: {
                    b: function ($, result) {
                        return $("div.b").text();
                    },
                    c: ".c",
                },
            };
            webcheck.crawl({
                url: "http://localhost:" + port + "/",
            }, function (err) {
                if (err) {
                    return done(err);
                }
            });
        });
    });
    describe("Overwrite with force", function () {
        var webcheck = new webcheck_1.Webcheck();
        var plugin = new __1.CheerioMapperPlugin({});
        var group = new webcheck_plugin_group_1.PluginGroup({
            plugins: [new webcheck_cheerio_1.CheerioPlugin(), plugin],
        });
        before(function () {
            webcheck.addPlugin(group);
            group.enable();
        });
        it("should get a linear mapping", function (done) {
            plugin.onError = done;
            plugin.onData = function (data) {
                if (data.a === "FORCE A" && data.b === "Text from class B" && data.c === "Text from class C") {
                    return done();
                }
                return done(new Error("Wrong content fetched"));
            };
            plugin.mappings = {
                a: ".a",
                b: "div.b",
                c: ".c",
            };
            webcheck.crawl({
                parameters: {
                    forceValue: {
                        a: "FORCE A",
                    },
                },
                url: "http://localhost:" + port + "/",
            }, function (err) {
                if (err) {
                    return done(err);
                }
            });
        });
        it("should get a nested mapping", function (done) {
            plugin.onError = done;
            plugin.onData = function (data) {
                if (data.a === "Text from class A"
                    && data.nested.b === "FORCE B"
                    && data.nested.c === "Text from class C") {
                    return done();
                }
                return done(new Error("Wrong content fetched"));
            };
            plugin.mappings = {
                a: ".a",
                nested: {
                    b: "div.b",
                    c: ".c",
                },
            };
            webcheck.crawl({
                parameters: {
                    forceValue: {
                        nested: {
                            b: "FORCE B",
                        },
                    },
                },
                url: "http://localhost:" + port + "/",
            }, function (err) {
                if (err) {
                    return done(err);
                }
            });
        });
        it("should parse with functions and nested", function (done) {
            plugin.onError = done;
            plugin.onData = function (data) {
                if (data.a === "Text from class A"
                    && data.nested.b === "FORCE B"
                    && data.nested.c === "Text from class C") {
                    return done();
                }
                return done(new Error("Wrong content fetched"));
            };
            plugin.mappings = {
                a: function ($, result) {
                    return $(".a").text();
                },
                nested: {
                    b: function ($, result) {
                        return $("div.b").text();
                    },
                    c: ".c",
                },
            };
            webcheck.crawl({
                parameters: {
                    forceValue: {
                        nested: {
                            b: "FORCE B",
                        },
                    },
                },
                url: "http://localhost:" + port + "/",
            }, function (err) {
                if (err) {
                    return done(err);
                }
            });
        });
        it("should have the result as parameter", function (done) {
            plugin.onError = done;
            plugin.onData = function (data, result) {
                if (data.a === "Text from class A"
                    && data.nested.b === "FORCE B"
                    && data.nested.c === "Text from class C"
                    && result.settings.parameters.forceValue.nested.b === "FORCE B") {
                    return done();
                }
                return done(new Error("Wrong content fetched"));
            };
            plugin.mappings = {
                a: function ($, result) {
                    return $(".a").text();
                },
                nested: {
                    b: function ($, result) {
                        return $("div.b").text();
                    },
                    c: ".c",
                },
            };
            webcheck.crawl({
                parameters: {
                    forceValue: {
                        nested: {
                            b: "FORCE B",
                        },
                    },
                },
                url: "http://localhost:" + port + "/",
            }, function (err) {
                if (err) {
                    return done(err);
                }
            });
        });
    });
});
//# sourceMappingURL=test.js.map