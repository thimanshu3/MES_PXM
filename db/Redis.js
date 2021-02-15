const redis = require('redis')

const redisClient = redis.createClient()

redisClient.ping((err, reply) => {
    if (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        process.exit(1)
    }
    console.log('PING')
    console.log(reply)
    console.log('\x1b[34m%s\x1b[0m', 'Connected to RedisDB...')
})

module.exports = redisClient