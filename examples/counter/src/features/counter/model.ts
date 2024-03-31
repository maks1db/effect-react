import { Effect } from 'effect';
import { makeRepository, runForkEffect } from '../../../../../src';
import { makeInspectorEffectProgram } from '../../shared/effect-inspector';

export const Counter = makeRepository('features/counter', 0);  

export const counterValueChanged = (value: number) => runForkEffect(Effect.gen(function* ($) {
  yield* $(Counter.Tag, Effect.flatMap(store => store.update((v) => v + value)));
})); 


runForkEffect(makeInspectorEffectProgram([Counter]));