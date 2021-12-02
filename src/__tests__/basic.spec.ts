import NavigoRouter from "../../index";
import Navigo from "../index";

describe("Given the Navigo library", () => {
  beforeEach(() => {
    history.pushState({}, "", "/");
  });
  describe("when creating a router", () => {
    it("should accept just a function to the `on` method", () => {
      const handler = jest.fn();
      const router: NavigoRouter = new Navigo("/foo");
      router.on(handler);
      expect(router.routes).toStrictEqual([
        { path: "foo/foo", handler, hooks: {}, name: "foo/foo" },
      ]);
    });
    it("should accept path and a function", () => {
      const handler = jest.fn();
      const router: NavigoRouter = new Navigo("/foo");
      router.on("/bar", handler);
      expect(router.routes).toStrictEqual([
        { path: "foo/bar", handler, hooks: {}, name: "foo/bar" },
      ]);
    });
    it("should accept path as RegExp and a function", () => {
      const handler = jest.fn();
      const router: NavigoRouter = new Navigo("/foo");
      router.on(/^b/, handler);
      expect(router.routes).toStrictEqual([
        { path: /^b/, handler, hooks: {}, name: "^b" },
      ]);
    });
    it("should accept object with paths and handlers", () => {
      const handler = jest.fn();
      const router: NavigoRouter = new Navigo("/foo");
      router.on({
        a: handler,
        b: handler,
      });
      expect(router.routes).toStrictEqual([
        { path: "foo/a", handler, hooks: {}, name: "foo/a" },
        { path: "foo/b", handler, hooks: {}, name: "foo/b" },
      ]);
    });
    it("should allow chaining of the `on` method", () => {
      const router: NavigoRouter = new Navigo("/");
      router.on("foo", () => {}).on("bar", () => {});
      expect(router.routes).toHaveLength(2);
    });
    it("should start listening to the popstate event", () => {
      const add = jest.spyOn(window, "addEventListener");
      const r: NavigoRouter = new Navigo("/");

      expect(add).toBeCalledWith("popstate", expect.any(Function));
      add.mockRestore();
    });
    describe('and when using "named routes"', () => {
      it("should allow us to define routes", () => {
        const r: NavigoRouter = new Navigo("/");
        const handler = jest.fn((done) => done());
        const hook = jest.fn((done) => done());

        r.on({
          "/foo": { as: "my foo", uses: handler, hooks: { before: hook } },
          "/bar": { as: "my bar", uses: handler },
        });

        r.resolve("foo");
        r.resolve("bar");

        expect(handler).toBeCalledTimes(2);
        expect(handler).toBeCalledWith(expect.any(Function),
          expect.objectContaining({
            route: expect.objectContaining({ name: "my foo" }),
          })
        );
        expect(handler).toBeCalledWith(expect.any(Function),
          expect.objectContaining({
            route: expect.objectContaining({ name: "my bar" }),
          })
        );
        expect(r.lastResolved()).toStrictEqual([
          {
            data: null,
            params: null,
            queryString: "",
            hashString: "",
            route: {
              handler: expect.any(Function),
              hooks: {},
              name: "my bar",
              path: "bar",
            },
            url: "bar",
          },
        ]);
        expect(hook).toBeCalledTimes(1);
      });
      describe("and we use the `generate` method", () => {
        it("should allow us to generate a URL out of the named route", () => {
          const r: NavigoRouter = new Navigo("/");
          const handler = jest.fn();

          r.on({
            "foo/:id/:action": { as: "my foo", uses: handler },
          });

          expect(r.generate("my foo", { id: "xxx", action: "save" })).toEqual(
            "/foo/xxx/save"
          );
        });
        it("should allow us to generate a URL out of the named route", () => {
          const r: NavigoRouter = new Navigo("/sss");
          const handler = jest.fn();

          r.on({
            "foo/:id/:action": { as: "my foo", uses: handler },
          });

          expect(
            r.generate(
              "my foo",
              { id: "xxx", action: "save" },
              { includeRoot: true }
            )
          ).toEqual("/sss/foo/xxx/save");
        });
        it("should allow us to generate a URL out of the named route", () => {
          const r: NavigoRouter = new Navigo("/sss");
          const handler = jest.fn();

          r.on({
            "foo/:id/:action": { as: "my foo", uses: handler },
          });

          expect(
            r.generate(
              "my foo",
              { id: "xxx", action: "save" },
              { includeRoot: false }
            )
          ).toEqual("/foo/xxx/save");
        });
        it("should return null if the name is not found", () => {
          const r: NavigoRouter = new Navigo("/");
          const handler = jest.fn();

          r.on({
            "/foo/:id/:action": { as: "my foo", uses: handler },
          });

          expect(r.generate("blah", {})).toEqual(null);
        });
        it("should work even if we don't provide data", () => {
          const r: NavigoRouter = new Navigo("/");
          const handler = jest.fn();

          r.on({
            "/foo/:id/:action": { as: "my foo", uses: handler },
          });

          expect(r.generate("my foo")).toEqual("/foo/:id/:action");
        });
        describe("and we have a root path", () => {
          it("should allow us to say if we want the root path or not", () => {
            const r: NavigoRouter = new Navigo("/myapp");
            const handler = jest.fn();

            r.on({
              "/foo/:id/:action": { as: "my foo", uses: handler },
            });

            expect(r.generate("my foo", null, { includeRoot: false })).toEqual(
              "/foo/:id/:action"
            );
          });
        });
      });
    });
    it("should create an instance of Route for each route and Match+Route if there is matching paths", () => {
      const r: NavigoRouter = new Navigo("/");
      r.on("/about/", (done) => done())
        .on((done) => done())
        .resolve("/about?a=b");

      expect(r.routes).toStrictEqual([
        {
          name: "about",
          path: "about",
          hooks: {},
          handler: expect.any(Function),
        },
        {
          name: "",
          path: "",
          hooks: {},
          handler: expect.any(Function),
        },
      ]);
      expect(r.lastResolved()).toStrictEqual([
        {
          data: null,
          params: { a: "b" },
          queryString: "a=b",
          hashString: "",
          route: {
            name: "about",
            path: "about",
            hooks: {},
            handler: expect.any(Function),
          },
          url: "about",
        },
      ]);
    });
    describe("and we have a custom path and switch routes", () => {
      it("should properly register the routes", () => {
        history.pushState({}, "", "/app/foo/bar");
        const r: NavigoRouter = new Navigo("/app", { strategy: "ALL" });
        const handlerA = jest.fn((done) => done());
        const hooksA = {
          leave: jest.fn((done) => done()),
        };
        const handlerB = jest.fn((done) => done());
        const hooksB = {
          leave: jest.fn((done) => done()),
        };

        r.on("/foo/:id", handlerA, hooksA);
        r.resolve();
        r.on("/foo/:id", handlerB, hooksB);
        r.resolve();

        expect(handlerA).toBeCalledTimes(1);
        expect(handlerB).toBeCalledTimes(1);
        expect(hooksA.leave).not.toBeCalled();
        expect(hooksB.leave).not.toBeCalled();
      });
    });
  });
  describe("when we have a no matching route", () => {
    it("should log a warning and return false", () => {
      const warn = jest.spyOn(console, "warn");
      warn.mockImplementationOnce(() => {});
      const r: NavigoRouter = new Navigo("/");
      const res = r.resolve();

      expect(res).toEqual(false);
      expect(warn).toBeCalledWith(
        `Navigo: "/" didn't match any of the registered routes.`
      );
      warn.mockRestore();
    });
    describe("and when we pass noMatchWarning=true", () => {
      it("should not print a warning if there is no matching route", () => {
        const warn = jest.spyOn(console, "warn");
        warn.mockImplementationOnce(() => {});
        const r: NavigoRouter = new Navigo("/");
        const res = r.resolve("/", { noMatchWarning: true });

        expect(res).toEqual(false);
        expect(warn).not.toBeCalled();
        warn.mockRestore();
      });
      describe("and we set noMatchWarning=true in the navigo constructor", () => {
        it("should not print a warning if there is no matching route", () => {
          const warn = jest.spyOn(console, "warn");
          warn.mockImplementationOnce(() => {});
          const r: NavigoRouter = new Navigo("/", {
            hash: true,
            noMatchWarning: true,
          });
          const res = r.resolve("/", {});

          expect(res).toEqual(false);
          expect(warn).not.toBeCalled();
          warn.mockRestore();
        });
      });
    });
    it("should still update the browser URL", () => {
      const warn = jest.spyOn(console, "warn");
      warn.mockImplementationOnce(() => {});
      const push = jest.spyOn(history, "pushState");
      const r: NavigoRouter = new Navigo("/");
      r.navigate("/foo");

      expect(push).toBeCalledTimes(1);
      expect(push).toBeCalledWith({}, "", "/foo");

      warn.mockRestore();
      push.mockRestore();
    });
    it("should flush the `current`", () => {
      const warn = jest.spyOn(console, "warn");
      warn.mockImplementation(() => {});
      const r: NavigoRouter = new Navigo("/");
      r.on("/foo", (done) => done());
      r.navigate("/foo");

      expect(r.lastResolved()).toStrictEqual([
        expect.objectContaining({ url: "foo" }),
      ]);
      expect(r.current).toStrictEqual([
        expect.objectContaining({ url: "foo" }),
      ]);

      r.navigate("/bar");

      expect(r.lastResolved()).toEqual(null);
      expect(r.current).toEqual(null);

      warn.mockRestore();
    });
  });
  describe("when resolving a route", () => {
    it("should call our handler", () => {
      const r: NavigoRouter = new Navigo("/");
      const handler = jest.fn((done) => done());
      r.on("foo/:id", handler);
      r.on("foo/xxx-yyy-zzz", handler);
      r.resolve("/foo/xxx-yyy-zzz");

      expect(handler).toBeCalledTimes(1);
      expect(handler).toBeCalledWith(expect.any(Function), {
        data: { id: "xxx-yyy-zzz" },
        params: null,
        route: expect.any(Object),
        url: expect.any(String),
        queryString: expect.any(String),
        hashString: expect.any(String),
      });
    });
    it("should take into account the order of the routes definition", () => {
      const r: NavigoRouter = new Navigo("/");
      const handlerA = jest.fn((done) => done());
      const handlerB = jest.fn((done) => done());

      r.on("foo/bar", handlerA);
      r.on("foo/*", handlerB);

      r.resolve("/foo/bar");
      r.resolve("/foo/moo");

      expect(handlerA).toBeCalledTimes(1);
      expect(handlerB).toBeCalledTimes(1);
    });
    it("should call the handler once if the matched route is the same", () => {
      const r: NavigoRouter = new Navigo("/");
      const handler = jest.fn((done) => done());

      r.on("foo/:id", handler);

      r.resolve("/foo/bar");
      r.resolve("/foo/moo");
      r.resolve("/foo/moo");
      r.resolve("/foo/moo?a=10");

      expect(handler).toBeCalledTimes(3);
      expect(handler.mock.calls[0][1]).toMatchObject({
        data: { id: "bar" },
      });
      expect(handler.mock.calls[1][1]).toMatchObject({
        data: { id: "moo" },
      });
      expect(handler.mock.calls[2][1]).toMatchObject({
        data: { id: "moo" },
        params: { a: "10" },
      });
    });
    describe("and we add the same matching route again", () => {
      it("should resolve the newly added route", () => {
        const r: NavigoRouter = new Navigo("/", { strategy: "ALL" });
        const h1 = jest.fn((done) => done());
        const h2 = jest.fn((done) => done());

        r.on("/foo", h1);
        r.resolve("/foo");
        r.on("/foo", h2);
        r.resolve("/foo");

        expect(r.routes).toHaveLength(2);
        expect(h1).toBeCalledTimes(1);
        expect(h1).toBeCalledWith(expect.any(Function), expect.objectContaining({ url: "foo" }));
        expect(h2).toBeCalledTimes(1);
        expect(h2).toBeCalledWith(expect.any(Function), expect.objectContaining({ url: "foo" }));
      });
    });
  });
  describe("when defining multiple routes with the same paths", () => {
    it("should resolve their handlers and their hooks", () => {
      const r: NavigoRouter = new Navigo("/");
      const order = [];
      const handlerA = jest.fn().mockImplementation((done) => {
         order.push("a");
         done();
      });
      const handlerB = jest.fn().mockImplementation((done) => {
        order.push("b");
        done();
      });

      r.on("/foo", handlerA, {
        before: (done) => {
          order.push("beforeA");
          done();
        },
        leave: (done) => {
          order.push("leaveA");
          done();
        },
        after: (done) => {
          order.push("afterA");
          done();
        },
      });
      r.on("/foo", handlerB, {
        before: (done) => {
          order.push("beforeB");
          done();
        },
        leave: (done) => {
          order.push("leaveB");
          done();
        },
        after: (done) => {
          order.push("afterB");
          done();
        },
      });

      r.on("/bar", (done) => {
        order.push("bar");
        done();
      });

      r.navigate("/foo?a=b", { resolveOptions: { strategy: "ALL" } });
      r.navigate("/bar?a=b", { resolveOptions: { strategy: "ALL" } });

      expect(handlerA).toBeCalledTimes(1);
      expect(handlerB).toBeCalledTimes(1);
      expect(order).toStrictEqual([
        "beforeA",
        "a",
        "afterA",
        "beforeB",
        "b",
        "afterB",
        "leaveA",
        "leaveB",
        "bar",
      ]);
    });
  });
  describe("when we change the default resolving strategy", () => {
    it("should use the new value", () => {
      const r: NavigoRouter = new Navigo("/", { strategy: "ALL" });
      const handlerA = jest.fn((done) => done());
      const handlerB = jest.fn((done) => done());
      const expectedObject = expect.objectContaining({ url: "foo/bar" });
      r.on("/foo/bar", handlerA).on("/foo/:something", handlerB);
      r.navigate("/foo/bar");
      expect(handlerA).toBeCalledTimes(1);
      expect(handlerB).toBeCalledTimes(1);
      expect(r.lastResolved()).toHaveLength(2);
      expect(r.current).toHaveLength(2);
      expect(handlerA).toBeCalledWith(expect.any(Function),expectedObject);
      expect(handlerB).toBeCalledWith(expect.any(Function),expectedObject);
    });
    it("should respect the resolveOptions passed to navigate and resolve", () => {
      const r: NavigoRouter = new Navigo("/", { strategy: "ALL" });
      const handlerA = jest.fn((done) => done());
      const handlerB = jest.fn((done) => done());
      r.on("/foo/bar", handlerA)
        .on("/foo/:something", handlerB)
        .notFound((done) => done());
      r.navigate("/foo/bar", { resolveOptions: { strategy: "ONE" } });
      r.navigate("/nope");
      r.resolve("/foo/bar", { strategy: "ONE" });
      expect(handlerA).toBeCalledTimes(2);
      expect(handlerB).toBeCalledTimes(0);
      expect(r.lastResolved()).toHaveLength(1);
      expect(r.current).toHaveLength(1);
    });
  });
  describe("when we have a custom root and we have a match", () => {
    it("should not include the root into the Match's url prop", () => {
      const r: NavigoRouter = new Navigo("/app");
      const h = jest.fn((done) => done());

      r.on("/login", h);
      r.navigate("login");

      expect(h).toBeCalledTimes(1);
      expect(h).toBeCalledWith(expect.any(Function), {
        url: "login",
        data: null,
        params: null,
        queryString: "",
        hashString: "",
        route: {
          handler: expect.any(Function),
          hooks: {},
          name: "app/login",
          path: "app/login",
        },
      });
    });
  });
  describe("when using matchLocation and we have a custom root", () => {
    it("should properly match the path #1", () => {
      const r: NavigoRouter = new Navigo("/app");

      expect(r.matchLocation("posts/edit/:id", "posts/edit/xxx")).toStrictEqual(
        expect.objectContaining({
          data: {
            id: "xxx",
          },
        })
      );
    });
    it("should properly match the path #2", () => {
      const r: NavigoRouter = new Navigo("/app");

      expect(r.matchLocation("", "")).toStrictEqual(
        expect.objectContaining({
          url: "",
        })
      );
    });
  });
});
