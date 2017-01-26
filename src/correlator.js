'use strict';

import { CorrelatorNode } from './correlator-node.js';

/******************************************************************************/

export class Correlator {
  constructor () {
    this._nodes = {};
    this._free = [];
    this._next = 0;
    this._default = new CorrelatorNode ();
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

  node (id) {
    if (id) {
      return this._nodes[id];
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

  dispatch (json) {
    const id = json['.cc'];
    return this.node (id).dispatch (json);
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
