/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context, Effect, Layer } from 'effect';
import { NoSuchElementException } from 'effect/Cause';
import { DevtoolsExtension } from './DevtoolsExtension';
import { DevtoolsStore } from './DevtoolsStore';

interface DevtoolsLoggerIml {
  log: (
    key: string,
    value: any,
  ) => Effect.Effect<void, NoSuchElementException, never>;
}

export class DevtoolsLogger extends Context.Tag('DevtoolsLogger')<
  DevtoolsLogger,
  DevtoolsLoggerIml
>() {
  static readonly Live = (name: string) =>
    Layer.effect(
      this,
      Effect.flatMap(
        Effect.all([DevtoolsExtension, DevtoolsStore]),
        ([extension, storeService]) =>
          Effect.gen(function* ($) {
            const instance = yield* $(extension.getInstance(name));

            return {
              log: (key: string, value: any) =>
                storeService
                  .update(key, value)
                  .pipe(
                    Effect.flatMap(store =>
                      Effect.sync(() => instance.send(key, store)),
                    ),
                  ),
            };
          }),
      ).pipe(
        Effect.provide(
          Layer.mergeAll(DevtoolsExtension.Live, DevtoolsStore.Live),
        ),
      ),
    );
}
