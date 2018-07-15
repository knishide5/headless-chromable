const WebSocket = require('ws')
const EventEmitter = require('events');

class Connection extends EventEmitter {
  static async createForWebSocket(url, delay = 0) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url, { perMessageDeflate: false });
      ws.on('open', () => resolve(new Connection(url, ws, delay)));
      ws.on('close', () => console.log('close'));
      ws.on('message', (data) => console.log(`message: ${data}`));
      ws.on('error', reject);
    });
  }

  constructor(url, transport, delay = 0) {
    super();
    this._lastId = 0;
    this._url = url;
    this._transport = transport;
    this._delay = delay;
  }

  send(method, params = {}) {
    const id = ++this._lastId;
    const message = JSON.stringify({id, method, params});
    this._transport.send(message);
  }
}
module.exports = Connection;
