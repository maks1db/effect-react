import { Console, Duration, Effect, Stream, SubscriptionRef } from 'effect';

import { Counter, counterValueChanged } from '../../features/counter';
import {
  TIMEOUT_WARNING_SECONDS,
  WarningMessageStore,
} from '../../features/warning-message';

export const upButtonClicked = () => counterValueChanged(1);
export const downButtonClicked = () => counterValueChanged(-1);

export const program = Effect.gen(function* ($) {
  const counter = yield* $(Counter.Tag);
  const warningMessage = yield* $(WarningMessageStore.Tag);

  const warningActiveOnClick$ = counter.changes.pipe(
    Stream.mapEffect(() =>
      Effect.map(warningMessage.get(), store => {
        return store.timer > 0;
      }),
    ),
    Stream.tap(v => Console.log('WOW', v)),
  );

  const clickOnActiveError = warningActiveOnClick$.pipe(
    Stream.filter(Boolean),
    Stream.tap(() =>
      warningMessage.update(s => ({
        timer: TIMEOUT_WARNING_SECONDS,
        clickErrorCounter: s.clickErrorCounter + 1,
      })),
    ),
    Stream.runDrain,
  );

  const clickOnEmptyError = warningActiveOnClick$.pipe(
    Stream.filter(x => !x),
    Stream.tap(() =>
      warningMessage.update(s => ({ ...s, timer: TIMEOUT_WARNING_SECONDS })),
    ),
    Stream.runDrain,
  );

  yield* $(
    Effect.all([clickOnActiveError, clickOnEmptyError], {
      concurrency: 'unbounded',
    }),
  );
});
