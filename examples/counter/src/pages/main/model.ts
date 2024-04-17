import { Effect, Layer, Stream } from 'effect';

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

  const warningActiveOnClick = counter.subscribe.pipe(
    Stream.mapEffect(() =>
      Effect.map(warningMessage.get(), store => {
        return store.timer > 0;
      }),
    ),
  );

  const clickOnActiveError = warningActiveOnClick.pipe(
    Stream.filter(Boolean),
    Stream.tap(() =>
      warningMessage.update(s => ({
        timer: TIMEOUT_WARNING_SECONDS,
        clickErrorCounter: s.clickErrorCounter + 1,
      })),
    ),
  );

  const clickOnEmptyError = warningActiveOnClick.pipe(
    Stream.filter(x => !x),
    Stream.tap(() =>
      warningMessage.update(() => ({
        clickErrorCounter: 1,
        timer: TIMEOUT_WARNING_SECONDS,
      })),
    ),
  );

  yield* $(
    Effect.all([clickOnActiveError, clickOnEmptyError].map(Stream.runDrain), {
      concurrency: 'unbounded',
    }),
  );
}).pipe(Effect.provide(Layer.mergeAll(Counter.Live, WarningMessageStore.Live)));
