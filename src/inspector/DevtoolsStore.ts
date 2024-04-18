import { Context, Effect, Layer, pipe, Ref } from 'effect';
import { assocPath, mergeDeepRight } from 'ramda';

interface DevtoolsStoreImpl {
  update: (
    currentName: string,
    data: Record<string, unknown>,
  ) => Effect.Effect<Record<string, unknown>, never, never>;
}

export class DevtoolsStore extends Context.Tag('DevtoolsStore')<
  DevtoolsStore,
  DevtoolsStoreImpl
>() {
  static readonly Live = Layer.effect(
    this,
    Effect.gen(function* ($) {
      const ref = yield* $(Ref.make<Record<string, unknown>>({}));

      return {
        update: (currentName, data) =>
          Ref.get(ref).pipe(
            Effect.flatMap(s => {
              const store = pipe(
                {},
                assocPath(currentName.split('/'), data),
                mergeDeepRight(s),
              );
              return Ref.set(ref, store);
            }),

            Effect.flatMap(() => Ref.get(ref)),
          ),
      };
    }),
  );
}
