/* global describe it */

import {expect} from 'mai-chai';
import {Correlator} from 'electrum-ws-client';

/******************************************************************************/

describe ('Correlator', () => {
  describe ('new()', () => {
    it ('allocates unique ids', async () => {
      const correlator = new Correlator ();
      const node0 = correlator.new ();
      const node1 = correlator.new ();
      expect (node0.id).to.equal ('i0');
      expect (node1.id).to.equal ('i1');
    });
  });

  describe ('dispose()', () => {
    it ('recycles ids', async () => {
      const correlator = new Correlator ();
      const node0 = correlator.new ();
      const node1 = correlator.new ();
      correlator.dispose (node0);
      const node2 = correlator.new ();
      expect (node1.id).to.equal ('i1');
      expect (node2.id).to.equal ('i0');
    });

    describe ('node()', () => {
      it ('retreives specified node', async () => {
        const correlator = new Correlator ();
        const node0 = correlator.new ();
        const node1 = correlator.new ();
        expect (node0).to.equal (correlator.node ('i0'));
        expect (node1).to.equal (correlator.node ('i1'));
      });
    });

    describe ('receive() & dispatch()', () => {
      it ('dispatch() before receive() buffers message', async () => {
        const correlator = new Correlator ();
        const node = correlator.new ();
        expect (node.receiveReadyCount).to.equal (0);
        expect (node.receiveWaitingCount).to.equal (0);
        correlator.dispatch ({'.cc': node.id});
        expect (node.receiveReadyCount).to.equal (1);
        expect (node.receiveWaitingCount).to.equal (0);
        expect (await correlator.receive (node.id)).to.deep.equal ({'.cc': node.id});
        expect (correlator.has (node.id)).to.be.false ();
      });
      it ('receive() before dispatch() awaits future message through promise', async () => {
        const correlator = new Correlator ();
        const node = correlator.new ();
        expect (node.receiveReadyCount).to.equal (0);
        expect (node.receiveWaitingCount).to.equal (0);
        const replyPromise = correlator.receive (node.id);
        expect (node.receiveReadyCount).to.equal (0);
        expect (node.receiveWaitingCount).to.equal (1);
        expect (correlator.has (node.id)).to.be.true ();
        correlator.dispatch ({'.cc': node.id});
        expect (await replyPromise).to.deep.equal ({'.cc': node.id});
        expect (correlator.has (node.id)).to.be.false ();
      });
    });
  });
});

/******************************************************************************/
