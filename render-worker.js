import { parentPort } from 'node:worker_threads';
import { renderToHTML } from './render-shared.js';

if (!parentPort) throw new Error('This file must be run as a worker thread');

parentPort.on('message', ({ id, markdown, diagramColors }) => {
  try {
    const html = renderToHTML(markdown, diagramColors);
    parentPort.postMessage({ id, html });
  } catch (e) {
    parentPort.postMessage({ id, error: e.message });
  }
});
