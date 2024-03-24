import { Context, Effect, Layer, Stream, SubscriptionRef } from 'effect';

export interface RepositoryTag {
  readonly _: unique symbol;
}

export const makeRepository = <RepositoryType>(
  name: string,
  defaultValue: RepositoryType,
) => {

  const Tag = Context.GenericTag<RepositoryTag, BaseImplementation<RepositoryType>>(name);

  const Live = Layer.scoped(
    Tag,
    Effect.gen(function* ($) {
      const ref = yield* $(SubscriptionRef.make(defaultValue));

      return {
        changes: ref.changes,
        update: fn => SubscriptionRef.update(ref, fn),
        get: () => SubscriptionRef.get(ref),
      };
    }), 
  );

  return { Tag, Live };
};

export interface BaseImplementation<RepositoryType> {
  changes: Stream.Stream<RepositoryType, never, never>;
  get: () => Effect.Effect<RepositoryType, never, never>;
  update: (
    fn: (store: RepositoryType) => RepositoryType,
  ) => Effect.Effect<void, never, never>;
}

