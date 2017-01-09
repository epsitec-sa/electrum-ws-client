'use strict';

import {expect} from 'mai-chai';
import {WebSocketChannel} from 'electrum-ws-client';

import all from 'mai-chai';

console.log (all.chaiAsPromised);

/******************************************************************************/

describe ('WebSocketChannel', () => {
  describe ('Constructor', () => {
    it ('builds URI, no arguments provided', () => {
      var channel = new WebSocketChannel ();
      expect (channel.uri).to.equal ('ws://localhost:80/');
    });
    it ('builds URI, server and port provided', () => {
      var channel = new WebSocketChannel ('example.org', 1234);
      expect (channel.uri).to.equal ('ws://example.org:1234/');
    });
    it ('builds URI, server, port and path provided', () => {
      var channel = new WebSocketChannel ('example.org', 1234, 'echo');
      expect (channel.uri).to.equal ('ws://example.org:1234/echo');
    });
  });

  describe ('open() on unknown URL', ()=> {
    it ('throws an exception', () => {
      var channel = new WebSocketChannel ('localhost', 12345);
      return expect (channel.open ()).to.eventually.be.rejected;
    });
  });

  describe ('open() on listening URL', ()=> {
    it ('connects to WS server', () => {
      var channel = new WebSocketChannel ('localhost', 54321);
      return expect (channel.open ()).to.eventually.equal ('connected');
    });
    it ('send() then works', async () => {
      var channel = new WebSocketChannel ('localhost', 54321);
      var result = await channel.open ();
      expect (result).to.equal ('connected');
      channel.send ({foo: 42});
    });
  });
});
