// import {} from '

import { Effect, ManagedRuntime } from 'effect';
import { NoSuchElementException } from 'effect/Cause';
import { DevtoolsLogger } from './DevtoolsLogger';

let inspectorRuntime: ManagedRuntime.ManagedRuntime<
  DevtoolsLogger,
  NoSuchElementException
>;

const programs: Effect.Effect<void, NoSuchElementException, DevtoolsLogger>[] =
  [];

export const addInspectorProgram = (
  program: Effect.Effect<void, NoSuchElementException, DevtoolsLogger>,
) => {
  if (inspectorRuntime) {
    inspectorRuntime.runFork(program);
  } else {
    programs.push(program);
  }
};

export const startDevtoolsInspector = (name: string) => {
  inspectorRuntime = ManagedRuntime.make(DevtoolsLogger.Live(name));

  if (programs.length > 0) {
    inspectorRuntime.runFork(
      Effect.all(programs, { concurrency: 'unbounded' }),
    );
  }
};
