import { Console, Effect } from 'effect';

import { makeRepository } from '../../../../../src';

export const Counter = makeRepository('features/counter', 0);

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

// // @ts-ignore
// Effect.runPromise(
//   makeInspectorEffectProgram([Counter]).pipe(Effect.provide(Counter.Live)),
// );
