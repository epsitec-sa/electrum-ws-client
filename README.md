# electrum-ws-client

The _Electrum WebSockets Client library_ provides a thin wrapper on top of
the `WebSocket` API, in order to allow building a simple JSON-based RPC
channel.

## WebSocketChannel

The `WebSocketChannel` provides a thin abstraction on top of the `WebSocket`
API.

Constructor:

* `new WebSocketChannel(server, port, path)`, initializes a web socket without
  opening the connection.

Static methods:

* `create(url)` &rarr; splits the URL and calls the constructor; returns an
  instance of `WebSocketChannel`.
* `create(url, rel)` &rarr; same as above, adds the specified relative path
  to the given URL.
* `create(url, rel, correlator)` &rarr; same as above, configures a custom
  _correlator_ (used by the synchronous RPC implementation).

Methods:

* `async open()` &rarr; promise, asynchronously opens the connection.
* `async send(obj)` &rarr; promise, asynchronously sends _obj_ as a JSON payload.
* `async receive()` &rarr; promise, asynchronously receives a JSON payload.
* `async receive(id)` &rarr; promise, asynchronously receives a JSON payload which
  matches the specified _correlation ID_.

Properties:

* `correlator` &rarr; associated _correlator_.
* `uri` &rarr; full URI of the channel.
* `receiveReadyCount` &rarr; number of received messages which have not yet
  been read by `receive()`.
* `receiveWaitingCount` &rarr; number of receivers blocked in `receive()`,
  waiting for messages to arrive.

Note that the URL may contain a query string. This can be used to pass
context along with a connection to the web socket server.

## Correlator

The `Correlator` ensures that when bidirectional RPC is used, responses get
routed to the matching request (i.e. it correlates requests and responses,
hence its name).

Constructor:

* `new Correlator(dispatcher)`, initializes a correlator.

Methods:

* `new()` &rarr; a correlation node, which has a unique `id`
  associated with it. The id will be used to correlate requests and responses.
* `dispose(node)`, disposes a correlation node when it is no longer
  needed. The associated `id` will be recycled and available for reuse.
* `has(id)` &rarr; true if the specified `id` is an active correlation ID.
* `node(id)` &rarr; the node with the specified `id`.
* `async receive()` &rarr; promise, asynchronously receives a payload
  without correlation ID; this is for
  messages directly sent by the server to the client (i.e. messages which are
  not responses to a request).
* `async receive(id)` &rarr; promise, asynchronously receives a payload
  with the specified correlation ID.
  The associated node will be disposed as soon the message is received.
* `dispatch(obj)`, dispatches a payload; if the payload contains a
  correlation ID, it will be routed to a matching receiving node; else
  it will be dispatched on the _dispatcher_ provided at construction time.

## Performance

Tested against a Kestrel-based WebSocket server, this library performs a
dialog with an echo service in about 1ms with the following asynchronous
test code:

```js
const channel = new WebSocketChannel ('localhost', 54321);
await channel.open ();

console.time ('perf');

channel.send ({foo: 42});
const echo = await channel.receive ();

console.timeEnd ('perf');

expect (echo).to.deep.equal ({foo: 42});
```
