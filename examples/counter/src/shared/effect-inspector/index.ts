import { makeInspectInstance } from '../../../../../src';

export const { makeInspectorEffectProgram } = makeInspectInstance(
  'Counter Effect example',
  process.env.NODE_ENV === 'development',
);
