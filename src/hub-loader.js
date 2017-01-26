'use strict';

import { WebSocketChannel } from './web-socket-channel.js';
import { Correlator } from './correlator.js';

/******************************************************************************/

export class HubLoader {
  constructor (hubName) {
    this._hubName = hubName;
    this._hubUri  = null;
    this._ownUri  = null;
    this._channel = null;
    this._sink    = null;
  }

  get hubName () {
    return this._hubName;
  }

  get hubProxy () {
    throw new Error ('not implemented');
  }

  get connection () {
    return new Error ('not implemented');
  }

  get hub () {
    throw new Error ('not implemented');
  }

  async load (hubUri, ownUri, ready) {
    this._channel = WebSocketChannel.create (hubUri, `${this.hubName}`, new Correlator ());
    this._hubUri  = this._channel.uri;
    this._ownUri  = ownUri;
    await ready (this);
  }


  setupSink (factory) {
    this._sink = factory (this);
  }

  async start () {
    try {
      await this._channel.open ();
      this.onConnected ();
    } catch (err) {
      this.onError (err);
    }
  }

  async rpc (verb, obj) {
    const node = this._channel.correlator.new ();
    const request = {'.v': verb, '.cc': node.id, ...obj};
    await this._channel.send (request);
    const reply = await this._channel.receive (node.id);
    return reply['.r'];
  }

  onConnected () {
    console.log (`Connected to ${this.hubName} at ${this._hubUri}`);
  }

  onError (err) {
    console.error (`Cannot connect to ${this.hubName}: ${err}`);
  }

  static get jQuery () {
    throw new Error ('not implemented');
  }
}

/******************************************************************************/
