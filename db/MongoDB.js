const mongoose = require('mongoose')

mongoose
    .connect(process.env.MONGODB_URL || 'mongodb://localhost:27017', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(() => console.log('\x1b[34m%s\x1b[0m', 'Connected to MongoDB...'))
    .catch(err => {
        console.error('\x1b[31m%s\x1b[0m', err)
        process.exit(1)
    })

module.exports = mongoose.connection