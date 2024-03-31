import { Layer } from 'effect';
import { Counter } from './counter';
import { WarningMessageStore } from './warning-message/model';

export const FeaturesLayer = Layer.mergeAll(Counter.Live, WarningMessageStore.Live);