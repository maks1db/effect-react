/* eslint-disable @typescript-eslint/no-use-before-define */
import { Data, Effect } from 'effect';
import { makeRepository } from './repository';

interface CreateQueryParams<QueryValue, Params> {
  handler: (params: Params) => Promise<QueryValue>;
  initialData: QueryValue;
  name: string;
}

class QueryError extends Data.TaggedError('QueryError')<{ message: string }> {}

export function createQuery<QueryValue, Params>(
  params: CreateQueryParams<QueryValue, Params>,
) {
  interface QueryProps {
    data: QueryValue;
    pending: boolean;
    error: QueryError | null;
  }

  const repository = makeRepository<QueryProps>(params.name, {
    data: params.initialData,
    pending: false,
    error: null,
  });

  const start = (queryParams: Params) => {
    const program = Effect.gen(function* ($) {
      yield* $(
        repository.Tag,
        Effect.flatMap(store =>
          store.update(s => ({ ...s, pending: true, error: null })),
        ),
        Effect.flatMap(() =>
          Effect.tryPromise({
            try: () => params.handler(queryParams),
            catch: e =>
              new QueryError({
                message: getErrorMessage(e),
              }),
          }),
        ),
        Effect.tapError(err =>
          Effect.flatMap(repository.Tag, store =>
            store.update(s => ({ ...s, pending: false, error: err })),
          ),
        ),
        Effect.flatMap(query =>
          Effect.flatMap(repository.Tag, store =>
            store.update(() => ({
              data: query,
              pending: false,
              error: null,
            })),
          ),
        ),
      );
    });

    const runnable = program.pipe(Effect.provide(repository.Live));
    Effect.runFork(runnable);
  };

  const reset = () => {
    const program = Effect.flatMap(repository.Tag, store => store.reset());
    const runnable = program.pipe(Effect.provide(repository.Live));

    Effect.runSync(runnable);
  };

  return {
    start,
    reset,
    repository,
  };
}

const getErrorMessage = (err: unknown) => {
  if (err instanceof Error) {
    return err.message || String(err.stack);
  }
  return String(err);
};
