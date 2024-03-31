import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { Main } from '../pages/main';
import { appRuntime } from './Runtime.ts';
import { EffectRuntimeContext } from '../../../../src/bindings.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EffectRuntimeContext.Provider value={appRuntime.runtime}>
      <Main />
    </EffectRuntimeContext.Provider>
  </React.StrictMode>,
);
