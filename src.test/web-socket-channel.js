/* global describe it */
/* global Promise setTimeout */

import { expect, clock } from 'mai-chai';
import { WebSocketChannel } from 'electrum-ws-client';

/******************************************************************************/

function delay (ms) {
  return new Promise (function (resolve) {
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
    it ('builds URI, server, port and /path provided', () => {
      const channel = new WebSocketChannel ('example.org', 1234, '/echo');
      expect (channel.uri).to.equal ('ws://example.org:1234/echo');
    });
  });

  describe ('create()', () => {
    it ('extracts URI, host only; protocol http:', () => {
      const channel = WebSocketChannel.create ('http://example.org/');
      expect (channel.uri).to.equal ('ws://example.org:80/');
    });
    it ('extracts URI, server, port and path provided; protocol http:', () => {
      const channel = WebSocketChannel.create ('http://example.org:1234/echo');
      expect (channel.uri).to.equal ('ws://example.org:1234/echo');
    });
    it ('extracts URI, host and path provided; protocol https:', () => {
      const channel = WebSocketChannel.create ('https://example.org/echo');
      expect (channel.uri).to.equal ('ws://example.org:443/echo');
    });
    it ('extracts URI, host, port and path provided; protocol ws:', () => {
      const channel = WebSocketChannel.create ('ws://example.org:1234/echo');
      expect (channel.uri).to.equal ('ws://example.org:1234/echo');
    });
    it ('accepts a query string', () => {
      const channel = WebSocketChannel.create ('ws://example.org:1234/echo?param=bar');
      expect (channel.uri).to.equal ('ws://example.org:1234/echo?param=bar');
    });
    it ('with hub name', () => {
      const channel = WebSocketChannel.create ('ws://example.org:1234/hubs', 'xyz');
      expect (channel.uri).to.equal ('ws://example.org:1234/hubs/xyz');
    });
    it ('with hub name, accepts a query string', () => {
      const channel = WebSocketChannel.create ('ws://example.org:1234/hubs?p=bar', 'xyz');
      expect (channel.uri).to.equal ('ws://example.org:1234/hubs/xyz?p=bar');
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
      await delay (50);
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

  describe ('send() and receive() exchange performance measurement', ()=> {
    it ('gets echo back in less than 1.5ms', async () => {
      const channel = new WebSocketChannel ('localhost', 54321);
      await channel.open ();
      const perf = clock ();
      for (let i = 0; i < 100; i++) {
        channel.send ({foo: i});
        const echo = await channel.receive ();
        expect (echo).to.deep.equal ({foo: i});
      }
      expect (clock (perf)).to.be.at.most (150);
    });
  });
});

/******************************************************************************/
