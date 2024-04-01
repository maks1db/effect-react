import { Duration, Effect, Stream } from 'effect';
import { makeRepository, runForkEffect } from '../../../../../src';
import { makeInspectorEffectProgram } from '../../shared/effect-inspector';

export const WarningMessageStore = makeRepository('features/warning-message', {
  timer: 0,
  clickErrorCounter: 0,
});

export const program = Effect.gen(function* ($) {
  const store = yield* $(WarningMessageStore.Tag);

  const interval = store.changes.pipe(
    Stream.map(x => x.timer),
    Stream.changes,
    Stream.filter(x => x > 0),
    Stream.debounce(Duration.seconds(1)),
    Stream.tap(() => store.update(s => ({ ...s, timer: s.timer - 1 }))),
    Stream.runDrain,
  );

  const reset = store.changes.pipe(
    Stream.map(x => x.timer),
    Stream.changes,
    Stream.filter(x => x === 0),
    Stream.tap(store.reset),
    Stream.runDrain,
  );

  yield* $(Effect.all([interval, reset], { concurrency: 'unbounded' }));
});

runForkEffect(makeInspectorEffectProgram([WarningMessageStore]));
