# @davidahouse/redis-agent

[![npm (scoped)](https://img.shields.io/npm/v/@davidahouse/redis-agent.svg)](https://www.npmjs.com/package/davidahouse/redis-agent)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@davidahouse/redis-agent.svg)](https://www.npmjs.com/package/davidahouse/redis-agent)

## Install

```
$ npm install --save redis-agent
```

## Usage

```
const RedisAgent = require('redis-agent')

const conf = {redisHost: '', redisPort: 9999, reidsPassword: null, agentName: '', heartbeatPrefix: '', heartbeatInterval: null}

const agent = new RedisAgent(conf)

```

## Subscribe to receive pub/sub messages

```
agent.subscribe(['events*'])
```

## Receiving messages

```
agent.on('message', function(msg) {
  // Called for every message received
})

agent.on('event_123', function(msg) {
  // Or you can have a handler for each message
  // type
})
```

## Sending messages

```
agent.send('event_123', msg)
```