'use strict';

import { expect, clock } from 'mai-chai';
import { HubLoader } from 'electrum-ws-client';

/******************************************************************************/

describe ('HubLoader', () => {
  describe ('usage', () => {
    it ('opens a connection', async () => {
      const loader = new HubLoader ('foo');
      expect (loader.hubName).to.equal ('foo');
      let ready = 0;
      await loader.load ('ws://localhost:54320', 'x', async hub => {
        hub.setupSink (() => 'sink');
        await hub.start ();
        const perf = clock ();
        const reply = await hub.rpc ('Length', {message: 'hello'});
        expect (clock (perf)).to.be.at.most (20);
        expect (reply).to.equal ('5 characters');
        ready++;
      });
      expect (ready).to.equal (1);
      expect (loader._sink).to.equal ('sink');
    });
  });
});
