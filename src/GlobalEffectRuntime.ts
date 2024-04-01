/* eslint-disable @typescript-eslint/no-explicit-any */
import { Effect, Runtime } from 'effect';

export class GlobalEffectRuntime {
  runtime: Runtime.Runtime<any> | null = null;

  programs: Effect.Effect<void, any, any>[] = [];

  addForkProgram(program: Effect.Effect<void, any, any>) {
    this.programs.push(program);
    this.runFork();
  }

  runFork() {
    if (!this.runtime) {
      return;
    }

    Runtime.runFork(this.runtime)(
      Effect.all(this.programs, { concurrency: 'unbounded' }),
    );

    this.programs = [];
  }

  initRuntime(runtime: Runtime.Runtime<any>) {
    this.runtime = runtime;
    this.runFork();
  }
}
