import { Effect } from 'effect';

import { makeAppRuntime } from '../../../../src';
import { FeaturesLayer } from '../features';

export const appRuntime = Effect.runSync(makeAppRuntime(FeaturesLayer));

