const mongoose = require('mongoose')

const ActivityLogSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        index: true
    }
})

module.exports = mongoose.model('ActivityLog', ActivityLogSchema)