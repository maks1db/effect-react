/* eslint-disable require-yield */
/* eslint-disable @typescript-eslint/naming-convention */
import { Context, Effect, Layer, Stream, SubscriptionRef } from 'effect';

import { DevtoolsLogger } from './inspector/DevtoolsLogger';
import { addInspectorProgram } from './inspector/inspector-runtime';

export interface RepositoryTag {
  readonly _: unique symbol;
}

export const makeRepository = <RepositoryType>(
  name: string,
  defaultValue: RepositoryType,
) => {
  const ref = Effect.runSync(SubscriptionRef.make(defaultValue));
  const Tag = Context.GenericTag<BaseImplementation<RepositoryType>>(name);

  const loggerProgram = ref.changes.pipe(
    Stream.tap(data =>
      Effect.flatMap(DevtoolsLogger, logger => logger.log(name, data)),
    ),
    Stream.runDrain,
  );

  addInspectorProgram(loggerProgram);

  const Live = Layer.succeed(Tag, {
    changes: ref.changes,
    update: fn => SubscriptionRef.update(ref, fn),
    get: () => SubscriptionRef.get(ref),
    reset: () => SubscriptionRef.set(ref, defaultValue),
    subscribe: ref.changes.pipe(Stream.drop(1)),
    __defaultValue: defaultValue,
  });

  return { Tag, Live };
};

export interface BaseImplementation<RepositoryType> {
  changes: Stream.Stream<RepositoryType, never, never>;
  get: () => Effect.Effect<RepositoryType, never, never>;
  update: (
    fn: (store: RepositoryType) => RepositoryType,
  ) => Effect.Effect<void, never, never>;
  reset: () => Effect.Effect<void, never, never>;
  subscribe: Stream.Stream<RepositoryType, never, never>;
  __defaultValue: RepositoryType;
}
