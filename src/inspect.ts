/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable require-yield */
import { Effect, Option, Stream } from 'effect';
import { assocPath, mergeDeepRight } from 'ramda';

let TITLE = '';
let ENABLE = false;

let _instance: ReturnType<typeof initExtension>;

// TODO: переделать в class

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

export const initInspectParams = (title: string, enabled: boolean) => {
  TITLE = title;
  ENABLE = enabled;

  _instance = initExtension(TITLE, ENABLE);
};

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

export const makeInspectInstance = () => {
  const store = new InstanceStore();

  const sendChanges = (
    changes: Stream.Stream<any, never, never>,
    unitName: string,
  ) => {
    if (!_instance) {
      _instance = initExtension(TITLE, ENABLE);
    }
    const sendToDevtools = (currentName: string) =>
      Stream.tap(data =>
        Effect.tap(_instance, instance => {
          const logObject = assocPath(currentName.split('/'), data, {});
          const result = store.update(logObject);

          instance.send(currentName, result);
        }),
      );

    const program = changes.pipe(sendToDevtools(unitName), Stream.runDrain);
    Effect.runFork(program);
  };

  return { sendChanges };
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
