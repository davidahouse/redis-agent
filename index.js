const asyncRedis = require('async-redis')
const util = require('util')
const EventEmitter = require('events')
const uuidv4 = require('uuid/v4')

/**
* This class represents a high level redis agent
*/
class RedisAgent {
  /**
  * Constructor for the RedisAgent class
  * @param {object} config the config object to use for redis connection details
  */
  constructor(config) {
    EventEmitter.call(this)
    const self = this
    this.config = config
    this.messageClient = null
    this.client = null

    this.connect = function() {
      if (config.redisPassword != null) {
        this.messageClient = asyncRedis.createClient({host: config.redisHost,
          port: config.redisPort,
          password: config.redisPassword})
        this.client = asyncRedis.createClient({host: config.redisHost,
          port: config.redisPort,
          password: config.redisPassword})
      } else {
        this.messageClient = asyncRedis.createClient({host: config.redisHost,
          port: config.redisPort})
        this.client = asyncRedis.createClient({host: config.redisHost,
          port: config.redisPort})
      }

      this.client.on('error', function(err) {
        console.log('Redis client error: ' + err)
      })

      this.messageClient.on('error', function(err) {
        console.log('Redis message client error: ' + err)
      })

      this.messageClient.on('pmessage', function(pattern, channel, message) {
        console.log('Message received: ' + channel)
        const messageObject = JSON.parse(message)
        self.emit('message', messageObject)
        self.emit(channel, messageObject)
      })

      if (this.config.heartbeatInterval) {
        setTimeout(this.heartbeat, this.config.heartbeatInterval)
      }
    }

    this.subscribe = function(pattern) {
      this.messageClient.psubscribe(pattern)
    }

    this.heartbeat = function() {
      if (config.heartbeatInterval) {
        let heartbeatPrefix = ''
        if (config.heartbeatPrefix != null) {
          heartbeatPrefix = config.heartbeatPrefix + '_'
        }
        let agentName = ''
        if (config.agentName != null) {
          agentName = config.agentName + '_'
        }
        const heartbeatEvent = heartbeatPrefix + agentName + 'heartbeat'
        const payload = {
          agentName: config.agentName,
          id: uuidv4().toString(),
          timestamp: new Date(),
        }
        self.client.publish(heartbeatEvent, JSON.stringify(payload))
        setTimeout(self.heartbeat, config.heartbeatInterval)
      }
    }

    this.sendMessage = function(message, payload) {
      try {
        self.client.publish(message, JSON.stringify(payload))
      } catch (e) {
        console.log('Error publishing message: ' + e)
      }
    }

    this.usingClient = function(callback) {
      callback(this.client)
    }
  }
}

util.inherits(RedisAgent, EventEmitter)
module.exports = RedisAgent
