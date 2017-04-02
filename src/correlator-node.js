/* global Promise */

/******************************************************************************/

export class CorrelatorNode {
  constructor (id) {
    this._id = id;
    this._waits = [];
    this._ready = [];
  }

  get id () {
    return this._id;
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

  get receiveReadyCount () {
    return this._ready.length;
  }

  get receiveWaitingCount () {
    return this._waits.length;
  }

  /****************************************************************************/

  dispatch (json) {
    if (this._waits.length === 0) {
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
