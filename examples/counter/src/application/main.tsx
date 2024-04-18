import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { Main } from '../pages/main';
import { startDevtoolsInspector } from '../../../../src';

if (process.env.NODE_ENV === 'development') {
  startDevtoolsInspector('Counter example');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
