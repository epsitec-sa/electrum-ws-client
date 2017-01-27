'use strict';

import { CorrelatorNode } from './correlator-node.js';

/******************************************************************************/

export class Correlator {
  constructor (dispatcher) {
    this._nodes = {};
    this._free = [];
    this._next = 0;
    this._default = new CorrelatorNode ();
    this._dispatcher = dispatcher;
  }

  new () {
    const node = this._getNode ();
    this._nodes[node.id] = node;
    return node;
  }

  dispose (node) {
    if (node === this._default) {
      throw new Error ('Default node may not be disposed');
    } else {
      delete this._nodes[node.id];
      this._free.push (node);
    }
  }

  has (id) {
    return id && this._nodes.hasOwnProperty (id);
  }

  node (id) {
    if (id) {
      if (this._nodes.hasOwnProperty (id)) {
        return this._nodes[id];
      }
      throw new Error (`Correlation ID ${id} cannot be found`);
    } else {
      return this._default;
    }
  }

  async receive (id) {
    const node = this.node (id);
    const result = await node.receive ();
    if (node !== this._default) {
      this.dispose (node);
    }
    return result;
  }

  dispatch (obj) {
    const id = obj['.cc'];
    const verb = obj['.v'];
    if ((this._dispatcher) &&
        (id === undefined) &&
        (verb)) {
      return this._dispatcher (verb, obj);
    } else {
      return this.node (id).dispatch (obj);
    }
  }

  /****************************************************************************/

  _getNode () {
    if (this._free.length > 0) {
      return this._free.pop ();
    } else {
      const id = this._next++;
      return new CorrelatorNode (`i${id}`);
    }
  }
}

/******************************************************************************/
