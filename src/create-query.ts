/* eslint-disable @typescript-eslint/no-use-before-define */
import { Data, Effect } from 'effect';
import { makeRepository } from './repository';

interface CreateQueryParams<Params, QueryValue> {
  handler: (params: Params) => Promise<QueryValue>;
  initialData?: QueryValue;
  name: string;
}

interface QueryProps<Value> {
  data: Value;
  pending: boolean;
  error: QueryError | null;
}

class QueryError extends Data.TaggedError('QueryError')<{ message: string }> {}

export function createQuery<Params, QueryValue>(
  params: CreateQueryParams<Params, QueryValue>,
) {
  const repository = makeRepository<QueryProps<QueryValue>>(params.name, {
    // TODO: bad types. must fix
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    data: params.initialData ?? null,
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
