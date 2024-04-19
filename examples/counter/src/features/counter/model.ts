import { Console, Effect } from 'effect';

import { createStore } from '../../../../../src';

export const Counter = createStore('features/counter', 0);

export const counterValueChanged = (value: number) => {
  const runnable = Effect.gen(function* ($) {
    yield* $(
      Counter.Tag,
      Effect.tap(s => Effect.flatMap(s.get(), Console.log)),
      Effect.flatMap(store => store.update(v => v + value)),
    );
  }).pipe(Effect.provide(Counter.Live));

  Effect.runSync(runnable);
};
