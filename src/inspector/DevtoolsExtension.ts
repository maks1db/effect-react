/* eslint-disable @typescript-eslint/naming-convention */
import { Context, Effect, Layer, Option } from 'effect';
import { NoSuchElementException } from 'effect/Cause';

interface MyWindow extends Window {
  __REDUX_DEVTOOLS_EXTENSION__?: ReduxDevTools;
}

declare let window: MyWindow;

interface DevtoolsExtensionImpl {
  getInstance: (
    name: string,
  ) => Effect.Effect<
    ReturnType<ReduxDevTools['connect']>,
    NoSuchElementException,
    never
  >;
}

export class DevtoolsExtension extends Context.Tag('DevtoolsExtension')<
  DevtoolsExtension,
  DevtoolsExtensionImpl
>() {
  static readonly Live = Layer.succeed(this, {
    getInstance: name =>
      Effect.gen(function* ($) {
        if (!name) {
          return yield* $(Option.none());
        }

        const extension = yield* $(
          Option.fromNullable(window.__REDUX_DEVTOOLS_EXTENSION__),
        );

        const instance = extension.connect({ name });

        return yield* $(Option.some(instance));
      }),
  });
}

type ReduxDevTools = {
  connect: (params: { name: string }) => {
    send: (type: string, value: Record<string, unknown>) => void;
  };
};
