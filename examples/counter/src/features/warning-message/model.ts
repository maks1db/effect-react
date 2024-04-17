import { Duration, Effect, Stream } from 'effect';
import { makeRepository } from '../../../../../src';
// import { makeInspectorEffectProgram } from '../../shared/effect-inspector';

export const WarningMessageStore = makeRepository('features/warning-message', {
  timer: 0,
  clickErrorCounter: 0,
});

export const program = Effect.gen(function* ($) {
  const store = yield* $(WarningMessageStore.Tag);

  const interval = store.subscribe.pipe(
    Stream.map(x => x.timer),
    Stream.changes,
    Stream.filter(x => x > 0),
    Stream.debounce(Duration.seconds(1)),
    Stream.tap(() => store.update(s => ({ ...s, timer: s.timer - 1 }))),
  );

  const reset = store.subscribe.pipe(
    Stream.map(x => x.timer),
    Stream.changes,
    Stream.filter(x => x === 0),
    Stream.tap(store.reset),
  );

  yield* $(
    Effect.all([interval, reset].map(Stream.runDrain), {
      concurrency: 'unbounded',
    }),
  );
}).pipe(Effect.provide(WarningMessageStore.Live));

// runForkEffect(makeInspectorEffectProgram([WarningMessageStore]));
