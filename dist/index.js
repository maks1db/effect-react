"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __knownSymbol = (name, symbol) => {
  return (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __await = function(promise, isYieldStar) {
  this[0] = promise;
  this[1] = isYieldStar;
};
var __yieldStar = (value) => {
  var obj = value[__knownSymbol("asyncIterator")];
  var isAwait = false;
  var method;
  var it = {};
  if (obj == null) {
    obj = value[__knownSymbol("iterator")]();
    method = (k) => it[k] = (x) => obj[k](x);
  } else {
    obj = obj.call(value);
    method = (k) => it[k] = (v) => {
      if (isAwait) {
        isAwait = false;
        if (k === "throw")
          throw v;
        return v;
      }
      isAwait = true;
      return {
        done: false,
        value: new __await(new Promise((resolve) => {
          var x = obj[k](v);
          if (!(x instanceof Object))
            throw TypeError("Object expected");
          resolve(x);
        }), 1)
      };
    };
  }
  return it[__knownSymbol("iterator")] = () => it, method("next"), "throw" in obj ? method("throw") : it.throw = (x) => {
    throw x;
  }, "return" in obj && method("return"), it;
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  EffectRuntimeProvider: () => EffectRuntimeProvider,
  makeAppRuntime: () => makeAppRuntime,
  makeInspectInstance: () => makeInspectInstance,
  makeRepository: () => makeRepository,
  runForkEffect: () => runForkEffect,
  useEffectStream: () => useEffectStream,
  useProgram: () => useProgram,
  useRuntime: () => useRuntime,
  useSubscription: () => useSubscription
});
module.exports = __toCommonJS(src_exports);

// src/bindings.ts
var import_effect2 = require("effect");
var import_react = require("react");

// src/GlobalEffectRuntime.ts
var import_effect = require("effect");
var GlobalEffectRuntime = class {
  constructor() {
    this.runtime = null;
    this.programs = [];
  }
  addForkProgram(program) {
    this.programs.push(program);
    this.runFork();
  }
  runFork() {
    if (!this.runtime) {
      return;
    }
    import_effect.Runtime.runFork(this.runtime)(
      import_effect.Effect.all(this.programs, { concurrency: "unbounded" })
    );
    this.programs = [];
  }
  initRuntime(runtime) {
    this.runtime = runtime;
    this.runFork();
  }
};

// src/bindings.ts
var globalRuntime = new GlobalEffectRuntime();
var runForkEffect = (program) => {
  globalRuntime.addForkProgram(program);
};
var makeAppRuntime = (layer) => import_effect2.Effect.gen(function* ($) {
  const scope = yield* __yieldStar($(import_effect2.Scope.make()));
  const context = yield* __yieldStar($(
    import_effect2.Layer.buildWithScope(scope)(layer)
  ));
  const runtime = yield* __yieldStar($(
    (0, import_effect2.pipe)(import_effect2.Effect.runtime(), import_effect2.Effect.provide(context))
  ));
  globalRuntime.initRuntime(runtime);
  return {
    runtime,
    close: import_effect2.Scope.close(scope, import_effect2.Exit.unit)
  };
});
var EffectRuntimeProvider = (0, import_react.createContext)(
  import_effect2.Runtime.defaultRuntime
);
var useRuntime = () => (0, import_react.useContext)(EffectRuntimeProvider);
var useProgram = (program) => {
  const runtime = useRuntime();
  (0, import_react.useEffect)(() => {
    if (runtime) {
      const fiber = import_effect2.Runtime.runFork(runtime)(program);
      return () => {
        import_effect2.Effect.runPromise(import_effect2.Fiber.interrupt(fiber));
      };
    }
    return void 0;
  }, [runtime]);
};
var makeSubscribeTag = (tag, runtime, selectorFn) => (onChange) => {
  const fib = import_effect2.Effect.flatMap(
    tag,
    (ref) => (0, import_effect2.pipe)(
      ref.changes,
      import_effect2.Stream.map((store) => selectorFn ? selectorFn(store) : store),
      import_effect2.Stream.changes,
      import_effect2.Stream.tap(() => import_effect2.Effect.sync(onChange)),
      import_effect2.Stream.runDrain
    )
  );
  const fiber = import_effect2.Runtime.runFork(runtime)(fib);
  return () => {
    return import_effect2.Effect.runPromise(import_effect2.Fiber.interrupt(fiber));
  };
};
var makeSubscribeEffect = (program, runtime, ref) => (onChange) => {
  const fib = import_effect2.Effect.flatMap(
    program,
    (stream$) => (0, import_effect2.pipe)(
      stream$,
      import_effect2.Stream.changes,
      import_effect2.Stream.tap(
        (data) => import_effect2.Effect.sync(() => {
          ref.current = data;
          onChange();
        })
      ),
      import_effect2.Stream.runDrain
    )
  );
  const fiber = import_effect2.Runtime.runFork(runtime)(fib);
  return () => {
    return import_effect2.Effect.runPromise(import_effect2.Fiber.interrupt(fiber));
  };
};
function useSubscription(contextRef, selectorFn) {
  const runtime = useRuntime();
  const subscribe = (0, import_react.useRef)();
  if (!subscribe.current && runtime) {
    subscribe.current = makeSubscribeTag(contextRef, runtime, selectorFn);
  }
  return (0, import_react.useSyncExternalStore)(subscribe.current, () => {
    const program = (0, import_effect2.pipe)(
      import_effect2.Effect.flatMap(contextRef, (service) => service.get()),
      import_effect2.Effect.map((store) => selectorFn ? selectorFn(store) : store)
    );
    return import_effect2.Runtime.runSync(runtime)(program);
  });
}
function useEffectStream(program) {
  const runtime = useRuntime();
  const subscribe = (0, import_react.useRef)();
  const refData = (0, import_react.useRef)();
  if (!subscribe.current && runtime) {
    subscribe.current = makeSubscribeEffect(program, runtime, refData);
  }
  return (0, import_react.useSyncExternalStore)(subscribe.current, () => {
    return refData.current;
  });
}

// src/inspect.ts
var import_effect3 = require("effect");
var import_ramda = require("ramda");
var initExtension = (name, isDev = true) => import_effect3.Option.gen(function* ($) {
  if (!isDev) {
    return yield* __yieldStar($(import_effect3.Option.none()));
  }
  const extension = yield* __yieldStar($(
    import_effect3.Option.fromNullable(window.__REDUX_DEVTOOLS_EXTENSION__)
  ));
  const instance = extension.connect({ name });
  return yield* __yieldStar($(import_effect3.Option.some(instance)));
});
var InstanceStore = class {
  constructor() {
    this.store = {};
  }
  get() {
    return this.store;
  }
  update(data) {
    this.store = (0, import_ramda.mergeDeepRight)(this.store, data);
    return this.store;
  }
};
var makeInspectInstance = (name) => {
  const _instance = initExtension(name);
  const store = new InstanceStore();
  const makeStream = (defaultName) => (value) => {
    const sendToDevtools = (currentName) => import_effect3.Stream.tap(
      (data) => import_effect3.Effect.tap(_instance, (instance) => {
        const logObject = (0, import_ramda.assocPath)(currentName.split("/"), data, {});
        const result = store.update(logObject);
        instance.send(currentName, result);
      })
    );
    if (import_effect3.Context.isTag(value)) {
      return import_effect3.Effect.flatMap(value, (ref) => {
        return ref.changes.pipe(sendToDevtools(value.key), import_effect3.Stream.runDrain);
      });
    }
    if (import_effect3.Effect.isEffect(value)) {
      return value.pipe(
        import_effect3.Effect.flatMap(
          (0, import_effect3.flow)(sendToDevtools(`${defaultName}/combined$`), import_effect3.Stream.runDrain)
        )
      );
    }
    return import_effect3.Effect.succeed(0);
  };
  const makeInspectorEffectProgram = (stores, defaultName) => {
    return import_effect3.Effect.gen(function* ($) {
      if (import_effect3.Option.isNone(_instance)) {
        return;
      }
      const streams$ = stores.map((x) => {
        if ("Live" in x) {
          return x.Live;
        }
        return x;
      }).map(makeStream(defaultName));
      yield* __yieldStar($(import_effect3.Effect.all(streams$, { concurrency: "unbounded" })));
    });
  };
  return { makeInspectorEffectProgram };
};

// src/repository.ts
var import_effect4 = require("effect");
var makeRepository = (name, defaultValue) => {
  const Tag = import_effect4.Context.GenericTag(name);
  const Live = import_effect4.Layer.scoped(
    Tag,
    import_effect4.Effect.gen(function* ($) {
      const ref = yield* __yieldStar($(import_effect4.SubscriptionRef.make(defaultValue)));
      return {
        changes: ref.changes,
        update: (fn) => import_effect4.SubscriptionRef.update(ref, fn),
        get: () => import_effect4.SubscriptionRef.get(ref)
      };
    })
  );
  return { Tag, Live };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EffectRuntimeProvider,
  makeAppRuntime,
  makeInspectInstance,
  makeRepository,
  runForkEffect,
  useEffectStream,
  useProgram,
  useRuntime,
  useSubscription
});
//# sourceMappingURL=index.js.map