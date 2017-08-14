import React from 'react';
import { render } from 'react-dom';
import App from './App';
import getData from './api';

function renderApp(data) {
  render(
    <App data={data} />,
    document.getElementById('root')
  );
}

renderApp();

getData().then((data) => renderApp(data))
  .catch(console.log.bind(console));
