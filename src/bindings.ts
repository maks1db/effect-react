/* eslint-disable no-param-reassign */
/* eslint-disable no-redeclare */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Context,
  Effect,
  Exit,
  Fiber,
  Layer,
  pipe,
  Runtime,
  Scope,
  Stream,
} from 'effect';
import {
  createContext,
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';

import { GlobalEffectRuntime } from './GlobalEffectRuntime';
import { BaseImplementation } from './repository';
import { StreamEffect } from './types';

const globalRuntime = new GlobalEffectRuntime();

export const runForkEffect = (program: Effect.Effect<void, any, any>) => {
  globalRuntime.addForkProgram(program);
};

export const makeAppRuntime = <A, E, R>(layer: Layer.Layer<A, E, R>) =>
  Effect.gen(function* ($) {
    const scope = yield* $(Scope.make());
    const context: Context.Context<A> = yield* $(
      Layer.buildWithScope(scope)(layer),
    );
    const runtime = yield* $(
      pipe(Effect.runtime<A>(), Effect.provide(context)),
    );

    globalRuntime.initRuntime(runtime);

    return {
      runtime,
      close: Scope.close(scope, Exit.unit),
    };
  });

export const EffectRuntimeContext = createContext<Runtime.Runtime<any>>(
  Runtime.defaultRuntime as any,
);

export const useRuntime = () => useContext(EffectRuntimeContext);

export const useProgram = <A, E, R>(program: Effect.Effect<A, E, R>) => {
  const runtime = useRuntime();
  useEffect(() => {
    if (runtime) {
      const fiber = Runtime.runFork(runtime)(program);
      return () => {
        Effect.runPromise(Fiber.interrupt(fiber));
      };
    }
    return undefined;
  }, [runtime]);
};

const makeSubscribeTag =
  <A, B>(
    tag: Context.Tag<any, BaseImplementation<A>>,
    runtime: Runtime.Runtime<unknown>,
    selectorFn?: (store: A) => B,
  ) =>
  (onChange: () => void) => {
    const fib = Effect.flatMap(tag, ref =>
      pipe(
        ref.changes,
        Stream.map(store => (selectorFn ? selectorFn(store) : store)),
        Stream.changes,
        Stream.tap(() => Effect.sync(onChange)),
        Stream.runDrain,
      ),
    );
    const fiber = Runtime.runFork(runtime)(fib);
    return () => {
      return Effect.runPromise(Fiber.interrupt(fiber));
    };
  };

const makeSubscribeEffect =
  <A>(
    program: StreamEffect<A>,
    runtime: Runtime.Runtime<unknown>,
    ref: MutableRefObject<A | undefined>,
  ) =>
  (onChange: () => void) => {
    const fib = Effect.flatMap(program, stream$ =>
      pipe(
        stream$,
        Stream.changes,
        Stream.tap(data =>
          Effect.sync(() => {
            ref.current = data;
            onChange();
          }),
        ),
        Stream.runDrain,
      ),
    );
    const fiber = Runtime.runFork(runtime)(fib);
    return () => {
      return Effect.runPromise(Fiber.interrupt(fiber));
    };
  };

export type RepositoryType<StoreType> =
  | { Tag: Context.Tag<any, BaseImplementation<StoreType>> }
  | Context.Tag<any, BaseImplementation<StoreType>>;

export function useSubscription<StoreType>(
  repository: RepositoryType<StoreType>,
): StoreType;
export function useSubscription<StoreType, SelectorFnType>(
  repository: RepositoryType<StoreType>,
  selectorFn: (store: StoreType) => SelectorFnType,
): SelectorFnType;
export function useSubscription<StoreType, SelectorFnType>(
  repository: RepositoryType<StoreType>,
  selectorFn?: (store: StoreType) => SelectorFnType,
) {
  const contextRef = 'Tag' in repository ? repository.Tag : repository;
  const runtime = useRuntime();
  const subscribe = useRef<(db: () => void) => () => void>();
  if (!subscribe.current && runtime) {
    subscribe.current = makeSubscribeTag(contextRef, runtime, selectorFn);
  }

  return useSyncExternalStore(subscribe.current as any, () => {
    const program = pipe(
      Effect.flatMap(contextRef, service => service.get()),
      Effect.map(store => (selectorFn ? selectorFn(store) : store)),
    );
    return Runtime.runSync(runtime)(program);
  });
}

export function useEffectStream<StoreType>(program: StreamEffect<StoreType>) {
  const runtime = useRuntime();
  const subscribe = useRef<(db: () => void) => () => void>();

  const refData = useRef<StoreType>();
  if (!subscribe.current && runtime) {
    subscribe.current = makeSubscribeEffect(program, runtime, refData);
  }

  return useSyncExternalStore(subscribe.current as any, () => {
    return refData.current;
  });
}
