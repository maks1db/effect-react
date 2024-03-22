/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-yield */
import { Context, Effect, Option, Stream, flow } from 'effect';
import { assocPath, mergeDeepRight } from 'ramda';

import { BaseImplementation } from './repository';
import { StreamEffect } from './types';




const initExtension = (name: string, isDev = true) => 
  Option.gen(function* ($) {
        
    if (!isDev) {
      return yield* $(Option.none());
    }
    const extension = yield* $(
      Option.fromNullable(window.__REDUX_DEVTOOLS_EXTENSION__),
    );

    const instance = extension.connect({ name });

    return yield* $(Option.some(instance)); 
  });

class InstanceStore {
  store: Store = {};

  get() {
    return this.store;
  }

  update(data: Record<string, unknown>) {
    this.store = mergeDeepRight(this.store, data);
    return this.store;
  }
}

export const makeInspectInstance = (name: string) => {
  const _instance = initExtension(name);
  const store = new InstanceStore();

  const makeStream =
    (defaultName?: string) =>
      (value: Context.Tag<any, BaseImplementation<any>> | StreamEffect<any>) => {
        const sendToDevtools = (currentName: string) =>
          Stream.tap(data =>
            Effect.tap(_instance, instance => {
              const logObject = assocPath(currentName.split('/'), data, {});
              const result = store.update(logObject);

              instance.send(currentName, result);
            }),
          );
        if (Context.isTag(value)) {
          return Effect.flatMap(value, ref => {
            return ref.changes.pipe(sendToDevtools(value.key), Stream.runDrain);
          });
        }

        if (Effect.isEffect(value)) {
          return value.pipe(
            Effect.flatMap(
              flow(sendToDevtools(`${defaultName}/combined$`), Stream.runDrain),
            ),
          );
        }

        return Effect.succeed(0);
      };

  const makeInspectorEffectProgram = (
    stores: ({ Live: Context.Tag<any, BaseImplementation<any>>} | StreamEffect<any>)[],
    defaultName?: string,
  ) => {
    return Effect.gen(function* ($) {
      if (Option.isNone(_instance)) {
        return;
      }

      const streams$ = stores.map(x => {
        if ('Live' in x) {
          return x.Live;
        }
        return x;
      })
        .map(makeStream(defaultName));

      yield* $(Effect.all(streams$, { concurrency: 'unbounded' }));
    });
  };

  return { makeInspectorEffectProgram };
};



type ReduxDevTools = {
  connect: (params: { name: string }) => {
    send: (type: string, value: Record<string, unknown>) => void;
  };
};
interface MyWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevTools;

}

declare let window: MyWindow;

type Store = Record<string, unknown>;