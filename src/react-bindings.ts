/* eslint-disable no-redeclare */
import { Context, Effect, Fiber, Layer, pipe, Stream } from 'effect';
import { useEffect, useMemo, useState } from 'react';

import { Repository } from './repository';

export type RepositoryType<Store> = {
  Tag: Context.Tag<Repository<Store>, Repository<Store>>;
  Live: Layer.Layer<Repository<Store>, never, never>;
};

export function useSubscription<Store>(
  repository: RepositoryType<Store>,
): Store;
export function useSubscription<Store, SelectorFnType>(
  repository: RepositoryType<Store>,
  selectorFn: (store: Store) => SelectorFnType,
): SelectorFnType;
export function useSubscription<Store, SelectorFnType>(
  { Live, Tag }: RepositoryType<Store>,
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
