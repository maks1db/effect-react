import './index.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { Main } from '../pages/main';
import { initInspectParams } from '../../../../src';

initInspectParams('Counter example', process.env.NODE_ENV === 'development');

console.log(process.env.NODE_ENV);
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
