import { FC } from 'react';
import { useSubscription } from '../../../src';
import './App.css';

import { query, errorQuery } from './model'

function App() {

  
  return (
    <>
      <div className="card">
        <PendingButton />
        <QueryResult />

        <PendingErrorButton />
        <QueryResultError />
      </div>
    </>
  )
}

const PendingButton: FC = () => {
  const isPending = useSubscription(query.repository, x => x.pending)
  return <button disabled={isPending} onClick={() => query.start('hello')}>
          Fetch data
        </button>
}

const QueryResult: FC = () => {

  const { data, pending } = useSubscription(query.repository)
  return <>
      <p>{`status: ${pending ? 'pending' : '...waiting'}`}</p>
      {data && <p className='data'>{`Received: ${data}`}</p>}
    </>
}

const PendingErrorButton: FC = () => {
  const isPending = useSubscription(errorQuery.repository, x => x.pending)
  return <button disabled={isPending} onClick={() => errorQuery.start('wow, an error')} className='mt'>
          Fetch error data
        </button>
}

const QueryResultError: FC = () => {

  const { data, pending, error } = useSubscription(errorQuery.repository)
  return <>
      <p>{`status: ${pending ? 'pending' : '...waiting'}`}</p>
      {data && <p>{`data: ${data}`}</p>}
      {error && <p className='error'>{error.message}</p>}
    </>
}

export default App
