import * as react from 'react';
import { Context, Layer, Stream, Effect, Runtime } from 'effect';

interface Tag {
    readonly _: unique symbol;
}
declare const makeRepository: <RepositoryType>(name: string, defaultValue: RepositoryType) => {
    Tag: Context.Tag<Tag, BaseImplementation<RepositoryType>>;
    Live: Layer.Layer<Tag, never, never>;
};
interface BaseImplementation<RepositoryType> {
    changes: Stream.Stream<RepositoryType, never, never>;
    get: () => Effect.Effect<RepositoryType, never, never>;
    update: (fn: (store: RepositoryType) => RepositoryType) => Effect.Effect<void, never, never>;
}

type StreamEffect<A> = Effect.Effect<Stream.Stream<A, unknown, unknown>, unknown, unknown>;

declare const runForkEffect: (program: Effect.Effect<void, any, any>) => void;
declare const makeAppRuntime: <A, E, R>(layer: Layer.Layer<A, E, R>) => Effect.Effect<{
    runtime: Runtime.Runtime<A>;
    close: Effect.Effect<void, never, never>;
}, E, R>;
declare const EffectRuntimeProvider: react.Context<Runtime.Runtime<any>>;
declare const useRuntime: () => Runtime.Runtime<any>;
declare const useProgram: <A, E, R>(program: Effect.Effect<A, E, R>) => void;
declare function useSubscription<StoreType>(contextRef: Context.Tag<any, BaseImplementation<StoreType>>): StoreType;
declare function useSubscription<StoreType, SelectorFnType>(contextRef: Context.Tag<any, BaseImplementation<StoreType>>, selectorFn: (store: StoreType) => SelectorFnType): SelectorFnType;
declare function useEffectStream<StoreType>(program: StreamEffect<StoreType>): StoreType | undefined;

declare const makeInspectInstance: (name: string) => {
    makeInspectorEffectProgram: (stores: ({
        Live: Context.Tag<any, BaseImplementation<any>>;
    } | StreamEffect<any>)[], defaultName?: string) => Effect.Effect<void, unknown, any>;
};

export { EffectRuntimeProvider, makeAppRuntime, makeInspectInstance, makeRepository, runForkEffect, useEffectStream, useProgram, useRuntime, useSubscription };
