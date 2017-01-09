'use strict';

import WebSocket from 'ws';

/******************************************************************************/

export class WebSocketChannel {
  constructor(server = 'localhost', port = '80', path = '') {
    this._uri = `ws://${server}:${port}/${path}`;
    this._waits = [];
    this._ready = [];
  }

  open () {
    if (this._ws) {
      throw 'WebSocketChannel is already open';
    }

    return new Promise ((resolve, reject) => {
      this._ws = new WebSocket (this._uri);
      this._ws.onmessage = event => this._processMessage (JSON.parse (event.data));
      this._ws.onopen = event => resolve ('connected');
      this._ws.onerror = event => reject (event);
    });
  }

  send (obj) {
    if (!this._ws) {
      throw 'WebSocketChannel must be opened first';
    }

    return Promise.resolve (this._ws.send (JSON.stringify (obj)));
  }

  receive () {
    if (this._ready.length > 0) {
      // Return immediately the already received message
      const value = this._ready.shift ();
      return Promise.resolve (value);
    } else {
      // Queue a promise which will be resolved when we receive a message
      const deferred = Promise.defer ();
      this._waits.push (deferred);
      return deferred.promise;
    }
  }

  /****************************************************************************/

  get uri () {
    return this._uri;
  }

  get receiveReadyCount () {
    return this._ready.length;
  }

  get receiveWaitingCount () {
    return this._waits.length;
  }

  /****************************************************************************/

  _processMessage (json) {
    if (this._waits.length == 0) {
      // No receive is waiting for the message; enqueue it for future calls
      // to receive()
      this._ready.push (json);
    } else {
      // A receive() is blocked waiting for the message; resolve the pending
      // promise by passing it the specified value
      const deferred = this._waits.shift ();
      deferred.resolve (json);
    }
  }
}

/******************************************************************************/
