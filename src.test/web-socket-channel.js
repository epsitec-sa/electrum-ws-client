'use strict';

import {expect} from 'mai-chai';
import {WebSocketChannel} from 'electrum-ws-client';

/******************************************************************************/

function delay (ms) {
  return new Promise (function (resolve, reject) {
      setTimeout (resolve, ms);
    });
}

/******************************************************************************/

describe ('WebSocketChannel', () => {
  describe ('Constructor', () => {
    it ('builds URI, no arguments provided', () => {
      const channel = new WebSocketChannel ();
      expect (channel.uri).to.equal ('ws://localhost:80/');
    });
    it ('builds URI, server and port provided', () => {
      const channel = new WebSocketChannel ('example.org', 1234);
      expect (channel.uri).to.equal ('ws://example.org:1234/');
    });
    it ('builds URI, server, port and path provided', () => {
      const channel = new WebSocketChannel ('example.org', 1234, 'echo');
      expect (channel.uri).to.equal ('ws://example.org:1234/echo');
    });
  });

  describe ('open() on unknown URL', ()=> {
    it ('throws an exception', () => {
      const channel = new WebSocketChannel ('localhost', 12345);
      return expect (channel.open ()).to.eventually.be.rejected;
    });
  });

  describe ('open() on listening URL', ()=> {
    it ('connects to WS server', () => {
      const channel = new WebSocketChannel ('localhost', 54321);
      return expect (channel.open ()).to.eventually.equal ('connected');
    });
  });

  describe ('send() on open channel', ()=> {
    it ('works', async () => {
      const channel = new WebSocketChannel ('localhost', 54321);
      const result = await channel.open ();
      expect (result).to.equal ('connected');
      channel.send ({foo: 42});
    });
  });

  describe ('receive() after message is received', ()=> {
    it ('gets echo back', async () => {
      const channel = new WebSocketChannel ('localhost', 54321);
      const result = await channel.open ();
      expect (result).to.equal ('connected');
      channel.send ({foo: 42});
      expect (channel.receiveReadyCount).to.equal (0);
      expect (channel.receiveWaitingCount).to.equal (0);
      await delay (10);
      expect (channel.receiveReadyCount).to.equal (1);
      expect (channel.receiveWaitingCount).to.equal (0);
      const echo = await channel.receive ();
      expect (channel.receiveReadyCount).to.equal (0);
      expect (channel.receiveWaitingCount).to.equal (0);
      expect (echo).to.deep.equal ({foo: 42});
    });
  });

  describe ('receive() before message is received', ()=> {
    it ('gets echo back', async () => {
      const channel = new WebSocketChannel ('localhost', 54321);
      const result = await channel.open ();
      const echoPromise = channel.receive ();
      expect (result).to.equal ('connected');
      channel.send ({foo: 42});
      expect (channel.receiveReadyCount).to.equal (0);
      expect (channel.receiveWaitingCount).to.equal (1);
      const echo = await echoPromise;
      expect (channel.receiveReadyCount).to.equal (0);
      expect (channel.receiveWaitingCount).to.equal (0);
      expect (echo).to.deep.equal ({foo: 42});
    });
  });
});

/******************************************************************************/
