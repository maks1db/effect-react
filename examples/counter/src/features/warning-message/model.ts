import { makeRepository, runForkEffect } from '../../../../../src';
import { makeInspectorEffectProgram } from '../../shared/effect-inspector';


export const WarningMessageStore = makeRepository('features/warning-message', {
  timer: 0,
  clickErrorCounter: 0
});

runForkEffect(makeInspectorEffectProgram([WarningMessageStore]));