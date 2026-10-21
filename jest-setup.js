// Jest setup provided by Grafana scaffolding
import './.config/jest-setup';

import { MessageChannel as NodeMessageChannel } from 'node:worker_threads';

// jsdom has no MessageChannel; react-dom/server (React 19) needs it at import time.
// Unref port1 so the channel does not keep jest open. Same shim as Grafana core:
// https://github.com/facebook/react/issues/26608#issuecomment-1734172596
global.MessageChannel = class {
  constructor() {
    const channel = new NodeMessageChannel();
    this.port1 = new Proxy(channel.port1, {
      set(port1, prop, value) {
        const result = Reflect.set(port1, prop, value);
        if (prop === 'onmessage') {
          port1.unref();
        }
        return result;
      },
    });
    this.port2 = channel.port2;
  }
};
