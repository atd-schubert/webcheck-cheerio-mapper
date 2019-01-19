import * as express from "express";
import * as freeport from "freeport";
import { Server } from "http";
import { Webcheck } from "webcheck";
import { CheerioPlugin } from "webcheck-cheerio";
import { PluginGroup } from "webcheck-plugin-group";
import { CheerioMapperPlugin, INestedDictionary } from "../";

describe("Cheerio Mapper Plugin", () => {
    let port: number;
    let server: Server;
    before((done: Mocha.Done) => {
        const app = express();
        app.get("/", (req, res) => {
            // tslint:disable-next-line:max-line-length
            res.set("Content-Type", "text/html").send(`<html><head></head><body><a class="a">Text from class A</a><div class="b">Text from class B</div><span class="c">Text from class C</span></body></html>`);
        });

        freeport((err, p) => {
            if (err) {
                done(err);
            }
            port = p;
            server = app.listen(port);
            done();
        });
    });
    after((done: Mocha.Done) => {
        server.close(done);
    });
    describe("Get mappings", () => {
        const webcheck = new Webcheck();
        const plugin = new CheerioMapperPlugin({} as any);
        const group = new PluginGroup({
            plugins: [new CheerioPlugin(), plugin],
        });

        before(() => {
            webcheck.addPlugin(group);
            group.enable();
        });

        it("should get a linear mapping", (done: Mocha.Done) => {
            plugin.onError = done;
            plugin.onData = (data) => {
                if (data.a === "Text from class A"
                    && data.b === "Text from class B"
                    && data.c === "Text from class C"
                ) {
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
            }, (err?: Error | null) => {
                if (err) {
                    return done(err);
                }
            });
        });
        it("should get a nested mapping", (done: Mocha.Done) => {
            plugin.onError = done;
            plugin.onData = (data) => {
                if (data.a === "Text from class A"
                    && (data.nested as INestedDictionary).b === "Text from class B"
                    && (data.nested as INestedDictionary).c === "Text from class C"
                ) {
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
            }, (err?: Error | null) => {
                if (err) {
                    return done(err);
                }
            });
        });
        it("should parse with functions and nested", (done: Mocha.Done) => {
            plugin.onError = done;
            plugin.onData = (data) => {
                if (data.a === "Text from class A"
                    && (data.nested as INestedDictionary).b === "Text from class B"
                    && (data.nested as INestedDictionary).c === "Text from class C"
                ) {
                    return done();
                }
                return done(new Error("Wrong content fetched"));
            };

            plugin.mappings = {
                a: ($, result) => {
                    return $(".a").text();
                },
                nested: {
                    b: ($, result) => {
                        return $("div.b").text();
                    },
                    c: ".c",
                },
            };

            webcheck.crawl({
                url: "http://localhost:" + port + "/",
            }, (err?: Error | null) => {
                if (err) {
                    return done(err);
                }
            });
        });
    });

    describe("Overwrite with force", () => {
        const webcheck = new Webcheck();
        const plugin = new CheerioMapperPlugin({} as any);
        const group = new PluginGroup({
            plugins: [new CheerioPlugin(), plugin],
        });

        before(() => {
            webcheck.addPlugin(group);
            group.enable();
        });

        it("should get a linear mapping", (done: Mocha.Done) => {
            plugin.onError = done;
            plugin.onData = (data) => {
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
            }, (err?: Error | null) => {
                if (err) {
                    return done(err);
                }
            });
        });
        it("should get a nested mapping", (done: Mocha.Done) => {
            plugin.onError = done;
            plugin.onData = (data) => {
                if (data.a === "Text from class A"
                    && (data.nested as INestedDictionary).b === "FORCE B"
                    && (data.nested as INestedDictionary).c === "Text from class C"
                ) {
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
            }, (err?: Error | null) => {
                if (err) {
                    return done(err);
                }
            });
        });
        it("should parse with functions and nested", (done: Mocha.Done) => {
            plugin.onError = done;
            plugin.onData = (data) => {
                if (data.a === "Text from class A"
                    && (data.nested as INestedDictionary).b === "FORCE B"
                    && (data.nested as INestedDictionary).c === "Text from class C"
                ) {
                    return done();
                }
                return done(new Error("Wrong content fetched"));
            };

            plugin.mappings = {
                a: ($, result) => {
                    return $(".a").text();
                },
                nested: {
                    b: ($, result) => {
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
            }, (err?: Error | null) => {
                if (err) {
                    return done(err);
                }
            });
        });
        it("should have the result as parameter", (done: Mocha.Done) => {
            plugin.onError = done;
            plugin.onData = (data, result) => {
                if (data.a === "Text from class A"
                    && (data.nested as INestedDictionary).b === "FORCE B"
                    && (data.nested as INestedDictionary).c === "Text from class C"
                    && result.settings.parameters!.forceValue.nested.b === "FORCE B"
                ) {
                    return done();
                }
                return done(new Error("Wrong content fetched"));
            };

            plugin.mappings = {
                a: ($, result) => {
                    return $(".a").text();
                },
                nested: {
                    b: ($, result) => {
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
            }, (err?: Error | null) => {
                if (err) {
                    return done(err);
                }
            });
        });
    });
});
