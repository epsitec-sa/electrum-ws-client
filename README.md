# electrum-ws-client

The _Electrum WebSockets Client library_ provides a thin wrapper on top of
the `WebSocket` API, in order to allow building a simple JSON-based RPC
channel.

## Usage

Constructor:

* `new WebSocketChannel(server, port, path)`, initializes a web socket without
  opening the connection.

Methods:

* `open()` &rarr; promise, asynchronously opens the connection.
* `send(obj)` &rarr; promise, asynchronously sends _obj_ as a JSON payload.
* `receive()` &rarr; promise, asynchronously receives a JSON payload.

Properties:

* `uri` &rarr; full URI of the channel.
* `receiveReadyCount` &rarr; number of received messages which have not yet
  been read by `receive()`.
* `receiveWaitingCount` &rarr; number of receivers blocked in `receive()`,
  waiting for messages to arrive.

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
