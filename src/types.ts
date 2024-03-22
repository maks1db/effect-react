/* eslint-disable @typescript-eslint/no-explicit-any */
import { Effect, Stream } from 'effect';

export type StreamEffect<A> = Effect.Effect<
  Stream.Stream<A, unknown, unknown>,
  unknown,
  unknown
>;
