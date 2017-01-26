'use strict';

import {expect} from 'mai-chai';
import URL from 'url';

describe ('URL.parse()', () => {
  it ('decomposes an URL', () => {
    const url = URL.parse ('http://localhost:54321/foo/bar?q&x=1#z');
    expect (url.host).to.equal ('localhost:54321');
    expect (url.hostname).to.equal ('localhost');
    expect (url.port).to.equal ('54321');
    expect (url.pathname).to.equal ('/foo/bar');
    expect (url.query).to.equal ('q&x=1');
    expect (url.hash).to.equal ('#z');
  });
});
