var __knownSymbol = (name, symbol) => {
  return (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
};
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

// src/bindings.ts
import {
  Effect as Effect2,
  Exit,
  Fiber,
  Layer,
  pipe,
  Runtime as Runtime2,
  Scope,
  Stream
} from "effect";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore
} from "react";

// src/GlobalEffectRuntime.ts
import { Effect, Runtime } from "effect";
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
    Runtime.runFork(this.runtime)(
      Effect.all(this.programs, { concurrency: "unbounded" })
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
var makeAppRuntime = (layer) => Effect2.gen(function* ($) {
  const scope = yield* __yieldStar($(Scope.make()));
  const context = yield* __yieldStar($(
    Layer.buildWithScope(scope)(layer)
  ));
  const runtime = yield* __yieldStar($(
    pipe(Effect2.runtime(), Effect2.provide(context))
  ));
  globalRuntime.initRuntime(runtime);
  return {
    runtime,
    close: Scope.close(scope, Exit.unit)
  };
});
var EffectRuntimeProvider = createContext(
  Runtime2.defaultRuntime
);
var useRuntime = () => useContext(EffectRuntimeProvider);
var useProgram = (program) => {
  const runtime = useRuntime();
  useEffect(() => {
    if (runtime) {
      const fiber = Runtime2.runFork(runtime)(program);
      return () => {
        Effect2.runPromise(Fiber.interrupt(fiber));
      };
    }
    return void 0;
  }, [runtime]);
};
var makeSubscribeTag = (tag, runtime, selectorFn) => (onChange) => {
  const fib = Effect2.flatMap(
    tag,
    (ref) => pipe(
      ref.changes,
      Stream.map((store) => selectorFn ? selectorFn(store) : store),
      Stream.changes,
      Stream.tap(() => Effect2.sync(onChange)),
      Stream.runDrain
    )
  );
  const fiber = Runtime2.runFork(runtime)(fib);
  return () => {
    return Effect2.runPromise(Fiber.interrupt(fiber));
  };
};
var makeSubscribeEffect = (program, runtime, ref) => (onChange) => {
  const fib = Effect2.flatMap(
    program,
    (stream$) => pipe(
      stream$,
      Stream.changes,
      Stream.tap(
        (data) => Effect2.sync(() => {
          ref.current = data;
          onChange();
        })
      ),
      Stream.runDrain
    )
  );
  const fiber = Runtime2.runFork(runtime)(fib);
  return () => {
    return Effect2.runPromise(Fiber.interrupt(fiber));
  };
};
function useSubscription(contextRef, selectorFn) {
  const runtime = useRuntime();
  const subscribe = useRef();
  if (!subscribe.current && runtime) {
    subscribe.current = makeSubscribeTag(contextRef, runtime, selectorFn);
  }
  return useSyncExternalStore(subscribe.current, () => {
    const program = pipe(
      Effect2.flatMap(contextRef, (service) => service.get()),
      Effect2.map((store) => selectorFn ? selectorFn(store) : store)
    );
    return Runtime2.runSync(runtime)(program);
  });
}
function useEffectStream(program) {
  const runtime = useRuntime();
  const subscribe = useRef();
  const refData = useRef();
  if (!subscribe.current && runtime) {
    subscribe.current = makeSubscribeEffect(program, runtime, refData);
  }
  return useSyncExternalStore(subscribe.current, () => {
    return refData.current;
  });
}

// src/inspect.ts
import { Context as Context2, Effect as Effect3, Option, Stream as Stream2, flow } from "effect";
import { assocPath, mergeDeepRight } from "ramda";
var initExtension = (name, isDev = true) => Option.gen(function* ($) {
  if (!isDev) {
    return yield* __yieldStar($(Option.none()));
  }
  const extension = yield* __yieldStar($(
    Option.fromNullable(window.__REDUX_DEVTOOLS_EXTENSION__)
  ));
  const instance = extension.connect({ name });
  return yield* __yieldStar($(Option.some(instance)));
});
var InstanceStore = class {
  constructor() {
    this.store = {};
  }
  get() {
    return this.store;
  }
  update(data) {
    this.store = mergeDeepRight(this.store, data);
    return this.store;
  }
};
var makeInspectInstance = (name) => {
  const _instance = initExtension(name);
  const store = new InstanceStore();
  const makeStream = (defaultName) => (value) => {
    const sendToDevtools = (currentName) => Stream2.tap(
      (data) => Effect3.tap(_instance, (instance) => {
        const logObject = assocPath(currentName.split("/"), data, {});
        const result = store.update(logObject);
        instance.send(currentName, result);
      })
    );
    if (Context2.isTag(value)) {
      return Effect3.flatMap(value, (ref) => {
        return ref.changes.pipe(sendToDevtools(value.key), Stream2.runDrain);
      });
    }
    if (Effect3.isEffect(value)) {
      return value.pipe(
        Effect3.flatMap(
          flow(sendToDevtools(`${defaultName}/combined$`), Stream2.runDrain)
        )
      );
    }
    return Effect3.succeed(0);
  };
  const makeInspectorEffectProgram = (stores, defaultName) => {
    return Effect3.gen(function* ($) {
      if (Option.isNone(_instance)) {
        return;
      }
      const streams$ = stores.map((x) => {
        if ("Live" in x) {
          return x.Live;
        }
        return x;
      }).map(makeStream(defaultName));
      yield* __yieldStar($(Effect3.all(streams$, { concurrency: "unbounded" })));
    });
  };
  return { makeInspectorEffectProgram };
};

// src/repository.ts
import { Context as Context3, Effect as Effect4, Layer as Layer2, SubscriptionRef } from "effect";
var makeRepository = (name, defaultValue) => {
  const Tag = Context3.GenericTag(name);
  const Live = Layer2.scoped(
    Tag,
    Effect4.gen(function* ($) {
      const ref = yield* __yieldStar($(SubscriptionRef.make(defaultValue)));
      return {
        changes: ref.changes,
        update: (fn) => SubscriptionRef.update(ref, fn),
        get: () => SubscriptionRef.get(ref)
      };
    })
  );
  return { Tag, Live };
};
export {
  EffectRuntimeProvider,
  makeAppRuntime,
  makeInspectInstance,
  makeRepository,
  runForkEffect,
  useEffectStream,
  useProgram,
  useRuntime,
  useSubscription
};
//# sourceMappingURL=index.mjs.map