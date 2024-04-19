/* eslint-disable require-yield */
/* eslint-disable @typescript-eslint/naming-convention */
import { Context, Effect, Layer, Stream, SubscriptionRef } from 'effect';

import { DevtoolsLogger } from './inspector/DevtoolsLogger';
import { addInspectorProgram } from './inspector/inspector-runtime';

export const createStore = <TagName extends string, StoreType>({
  name,
  defaultValue,
}: StoreProps<StoreType, TagName>) => {
  const ref = Effect.runSync(SubscriptionRef.make(defaultValue));
  const Tag = Context.GenericTag<TagName, Store<StoreType>>(name);

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

interface StoreProps<StoreType, TagName> {
  name: TagName;
  defaultValue: StoreType;
}

export interface Store<StoreType> {
  changes: Stream.Stream<StoreType, never, never>;
  get: () => Effect.Effect<StoreType, never, never>;
  update: (
    fn: (store: StoreType) => StoreType,
  ) => Effect.Effect<void, never, never>;
  reset: () => Effect.Effect<void, never, never>;
  subscribe: Stream.Stream<StoreType, never, never>;
  __defaultValue: StoreType;
}
