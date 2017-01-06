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

  describe ('open()', ()=> {
    it ('throws an exception', () => {
      var channel = new WebSocketChannel ('localhost', 54320);
      return expect (channel.open ()).to.eventually.equal ('connected');
    });

  });
});
