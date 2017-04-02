/* global describe it console */
/* eslint no-console: 0 */

import { expect, clock } from 'mai-chai';
import { HubLoader } from 'electrum-ws-client';

/******************************************************************************/

class Sink {
  constructor (hub) {
    this._hub = hub;
  }
  pong (text) {
    console.log (`pong got "${text}"`);
  }
}

/******************************************************************************/

describe ('HubLoader', () => {
  describe ('rpc()', () => {
    it ('talks to the hub over a WebSocket channel', async () => {
      const loader = new HubLoader ('foo');
      expect (loader.hubName).to.equal ('foo');
      let ready = 0;
      await loader.load ('ws://localhost:54320', async hub => {
        await hub.start ();
        const perf = clock ();
        const reply = await hub.rpc ('Length', {message: 'Hello'});
        expect (clock (perf)).to.be.at.most (20);
        expect (reply).to.equal ('5 characters');
        ready++;
      });
      expect (ready).to.equal (1);
    });
  });

  describe ('rpc() with query string on URL', () => {
    it ('talks to the hub over a WebSocket channel', async () => {
      const loader = new HubLoader ('foo');
      expect (loader.hubName).to.equal ('foo');
      let ready = 0;
      await loader.load ('ws://localhost:54320?p=bar&q=zorg', async hub => {
        await hub.start ();
        const perf = clock ();
        const reply = await hub.rpc ('Length', {message: 'Question'});
        expect (clock (perf)).to.be.at.most (20);
        expect (reply).to.equal ('8 characters');
        ready++;
      });
      expect (ready).to.equal (1);
    });
  });

  describe ('send()', () => {
    it ('talks to the hub over a WebSocket channel', async () => {
      const loader = new HubLoader ('foo');
      expect (loader.hubName).to.equal ('foo');
      let ready = 0;
      await loader.load ('ws://localhost:54320', async hub => {
        hub.registerSink (x => {
          expect (x).to.equal (hub);
          return new Sink (x);
        });
        await hub.start ();
        const perf = clock ();
        const reply = await hub.send ('Ping', {text: 'Hi'});
        expect (clock (perf)).to.be.at.most (20);
        expect (reply).to.exist ();
        ready++;
      });
      expect (ready).to.equal (1);
    });
  });
});

/******************************************************************************/
