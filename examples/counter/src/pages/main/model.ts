import { Effect, Stream } from 'effect';
import { Counter, counterValueChanged } from '../../features/counter';
import { WarningMessageStore } from '../../features/warning-message';

export const upButtonClicked = () => counterValueChanged(1);
export const downButtonClicked = () => counterValueChanged(-1);

export const program = Effect.gen(function* ($) {

  const counter$ = yield* $(Counter.Tag, Effect.map(x => x.changes));
  const warningMessage = yield* $(WarningMessageStore.Tag);

  const warningActiveOnClick$ = counter$.pipe(Stream.changes, Stream.mapEffect(() => Effect.map(warningMessage.get(), ({ timer }) => {
    return timer > 0;
  })));

  const activeWarningEffect = warningActiveOnClick$.pipe(Stream.filter(Boolean), Stream.tap(() => 
    warningMessage.update(s => ({...s, clickErrorCounter: s.clickErrorCounter + 1}))), Stream.runDrain);

  const disabledWarningEffect = warningActiveOnClick$.pipe(Stream.filter(x => !x), Stream.tap(() => 
    warningMessage.update(s => ({...s, timer: 3}))), Stream.runDrain);


  yield* $(Effect.all([activeWarningEffect, disabledWarningEffect], { concurrency: 'unbounded' }));
});