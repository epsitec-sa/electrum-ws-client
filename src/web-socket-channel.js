'use strict';

import WebSocket from 'ws';

export class WebSocketChannel {
  constructor(server = 'localhost', port = '80', path = '') {
    this._uri = `ws://${server}:${port}/${path}`;
  }

  get uri () {
    return this._uri;
  }

  open () {
    if (this._ws) {
      throw 'WebSocketChannel is already open';
    }

    return new Promise ((resolve, reject) => {
      this._ws = new WebSocket (this._uri);
      this._ws.onmessage = event => this.processMessage (JSON.parse (event.data));
      this._ws.onopen = event => resolve ('connected');
      this._ws.onerror = event => reject (event);
    });
  }

  get ws () {
    return this._ws;
  }

  processMessage (json) {
    console.log (json);
  }
}
