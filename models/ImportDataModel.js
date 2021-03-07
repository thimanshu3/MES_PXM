const mongoose = require('mongoose')

const CellSchema = new mongoose.Schema({
    text: String,
})

const RowSchema = new mongoose.Schema({
    text: String,
    cells: [CellSchema],
})

const ExcelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type:{
        type: String,
        type: String,
        enum: ['Netsuite', 'other'],
        required: true
    },
    creator: {
        type: String,
        required: true,
        index: true
    },
    rows: [RowSchema],
}, {
    timestamps: true
})

module.exports = mongoose.model('ExcelImportSchema', ExcelSchema)