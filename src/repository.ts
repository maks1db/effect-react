/* eslint-disable require-yield */
/* eslint-disable @typescript-eslint/naming-convention */
import { Context, Effect, Layer, Stream, SubscriptionRef } from 'effect';

import { makeInspectInstance } from './inspect';

export interface RepositoryTag {
  readonly _: unique symbol;
}

const inspectInstance = makeInspectInstance();

export const makeRepository = <RepositoryType>(
  name: string,
  defaultValue: RepositoryType,
) => {
  const ref = Effect.runSync(SubscriptionRef.make(defaultValue));
  const Tag = Context.GenericTag<BaseImplementation<RepositoryType>>(name);

  inspectInstance.sendChanges(ref.changes, name);

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
