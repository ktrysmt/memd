import { parentPort } from 'node:worker_threads';
import { renderToHTML, initHighlighter } from './render-shared.js';

if (!parentPort) throw new Error('This file must be run as a worker thread');

await initHighlighter();

parentPort.on('message', ({ id, markdown, diagramColors, shikiTheme }) => {
  try {
    const html = renderToHTML(markdown, diagramColors, shikiTheme);
    parentPort.postMessage({ id, html });
  } catch (e) {
    parentPort.postMessage({ id, error: e.message });
  }
});
