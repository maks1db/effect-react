/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
/* eslint-disable no-redeclare */
import { Context, Effect, Fiber, Layer, pipe, Stream } from 'effect';
import { useEffect, useMemo, useState } from 'react';

import { Store } from './store';

export type StoreType<StoreValue, StoreName> = {
  Tag: Context.Tag<StoreName, Store<StoreValue>>;
  Live: Layer.Layer<StoreName, never, never>;
};

export function useSubscription<Store, StoreName>(
  repository: StoreType<Store, StoreName>,
): Store;
export function useSubscription<Store, SelectorFnType, StoreName>(
  repository: StoreType<Store, StoreName>,
  selectorFn: (store: Store) => SelectorFnType,
): SelectorFnType;
export function useSubscription<Store, SelectorFnType, StoreName>(
  { Live, Tag }: StoreType<Store, StoreName>,
  selectorFn?: (store: Store) => SelectorFnType,
) {
  const runnableService = useMemo(
    () => Effect.runSync(Tag.pipe(Effect.provide(Live))),
    [],
  );
  const defaultValue = useMemo(
    () =>
      selectorFn
        ? selectorFn(runnableService.__defaultValue)
        : runnableService.__defaultValue,
    [],
  );

  const [state, updateState] = useState(defaultValue);

  useEffect(() => {
    const program = pipe(
      runnableService.changes,
      Stream.map(s => (selectorFn ? selectorFn(s) : s)),
      Stream.changes,
      Stream.tap(s => Effect.sync(() => updateState(s))),
      Stream.runDrain,
    );
    const fiber = Effect.runFork(program);
    return () => {
      Effect.runPromise(Fiber.interrupt(fiber));
    };
  }, []);

  return state;
}

export const useProgram = <A, E>(program: Effect.Effect<A, E, never>) => {
  useEffect(() => {
    const fiber = Effect.runFork(program);
    return () => {
      Effect.runPromise(Fiber.interrupt(fiber));
    };
  }, []);
};
