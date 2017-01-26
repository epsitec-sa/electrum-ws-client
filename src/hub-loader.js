'use strict';

import { WebSocketChannel } from './web-socket-channel.js';
import { Correlator } from './correlator.js';

/******************************************************************************/

function findFunction (obj, name) {
  const func1 = obj[name];
  if (typeof func1 === 'function') {
    return func1;
  }

  const camel = name.substr (0, 1).toLowerCase () + name.substr (1);
  const func2 = obj[camel];
  if (typeof func2 === 'function') {
    return func2;
  }
}

function getArgs (obj) {
  if (typeof obj === 'object') {
    return Object
      .keys (obj)
      .filter (key => !key.startsWith ('.'))
      .map (key => obj[key]);
  }
}

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

  async load (hubUri, ownUri, ready, correlator) {
    this._channel = this._createChannel (hubUri, correlator);
    this._hubUri  = this._channel.uri;
    this._ownUri  = ownUri;
    await ready (this);
  }


  registerSink (factory) {
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

  async send (verb, obj) {
    const request = {'.v': verb, ...obj};
    await this._channel.send (request);
  }

  onConnected () {
    console.log (`Connected to ${this.hubName} at ${this._hubUri}`);
  }

  onError (err) {
    console.error (`Cannot connect to ${this.hubName}: ${err}`);
  }

  _createChannel (hubUri, correlator) {
    correlator = correlator || new Correlator ((verb, obj) => this._dispatchToSink (verb, obj));
    return WebSocketChannel.create (hubUri, `${this.hubName}`, correlator);
  }

  _dispatchToSink (verb, obj) {
    if (this._sink) {
      const func = findFunction (this._sink, verb);
      const args = getArgs (obj);
      if (func && args) {
        func (...args);
      } else {
        throw new Error (`Cannot dispatch ${verb} to sink; the function could not be found`);
      }
    } else {
      throw new Error (`Cannot dispatch ${verb} to sink; no sink has been registered`);
    }
  }

  static get jQuery () {
    throw new Error ('not implemented');
  }
}

/******************************************************************************/
