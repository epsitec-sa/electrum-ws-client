/* global Promise WebSocket require global */

import Url from 'url';
import {Correlator} from './correlator.js';

/******************************************************************************/

export class WebSocketChannel {
  constructor (
    server = 'localhost',
    port = '80',
    path = '/',
    correlator = null
  ) {
    if (path.startsWith ('/')) {
      path = path.substr (1);
    }
    this._uri = `ws://${server}:${port}/${path}`;
    this._correlator = correlator || new Correlator ();

    // NodeJS?
    if (typeof WebSocket === 'undefined') {
      // Inject WebSocket w3c compatible API
      global.WebSocket = require ('websocket').w3cwebsocket;
    }
  }

  static create (url, rel, correlator) {
    const u = Url.parse (url);

    const server = u.hostname;
    let path = u.pathname || '/';
    const query = u.query;
    const port =
      u.port ||
      (u.protocol === 'http:' && '80') ||
      (u.protocol === 'https:' && '443');

    if (!port) {
      throw new Error (`Unsupported protocol ${u.protocol} for '${url}'`);
    }

    if (rel) {
      if (path.endsWith ('/')) {
        path = path + rel;
      } else {
        path = path + '/' + rel;
      }
    }
    if (query) {
      path = path + '?' + query;
    }

    return new WebSocketChannel (server, port, path, correlator);
  }

  open () {
    if (this._ws) {
      throw 'WebSocketChannel is already open';
    }

    return new Promise ((resolve, reject) => {
      this._ws = new WebSocket (this._uri);
      this._ws.onmessage = event =>
        this._processMessage (JSON.parse (event.data));
      this._ws.onopen = _ => resolve ('connected');
      this._ws.onerror = event => reject (event);
    });
  }

  send (obj) {
    if (!this._ws) {
      throw 'WebSocketChannel must be opened first';
    }

    return Promise.resolve (this._ws.send (JSON.stringify (obj)));
  }

  receive (id) {
    return this._correlator.receive (id);
  }

  /****************************************************************************/

  get correlator () {
    return this._correlator;
  }

  get uri () {
    return this._uri;
  }

  get receiveReadyCount () {
    return this.correlator.node ().receiveReadyCount;
  }

  get receiveWaitingCount () {
    return this.correlator.node ().receiveWaitingCount;
  }

  /****************************************************************************/

  _processMessage (json) {
    this.correlator.dispatch (json);
  }
}

/******************************************************************************/
