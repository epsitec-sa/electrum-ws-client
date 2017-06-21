/* global global require */

// NodeJS?
if (typeof exports !== 'undefined') {
  // Load babel polyfill
  require ('regenerator-runtime/runtime');
  // Inject WebSocket w3c compatible API
  global.WebSocket = require ('websocket').w3cwebsocket;
}
export {WebSocketChannel} from './web-socket-channel.js';
export {HubLoader} from './hub-loader.js';
export {Correlator} from './correlator.js';
