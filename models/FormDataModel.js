const mongoose = require('mongoose')



const AssignedFieldSchema = new mongoose.Schema({
    fieldId: String
})

const PageContentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    order: {
        type: Number,
    },
    AssignedFields: [AssignedFieldSchema]
})


const TabComponentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    order: {
        type: Number,
    },
    type: String ,
    pageContent: [PageContentSchema],
    AssignedFields: [AssignedFieldSchema]
})

const SubComponentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['tab', 'sec']
    },
    order: {
        type: Number,
    },
    tabComponents: [TabComponentSchema],
    AssignedFields: [AssignedFieldSchema]
})

const ComponentSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    type: {
        type: String,
        enum: ['tab', 'sec']
    },
    order:{
        type: Number,
    },
    subComponents: [SubComponentSchema],
})

const FormSchema = new mongoose.Schema({
    formId: {
        type: String,
        required: true
    },
    allFields: { type: Array, "default": [] },
    componets: [ComponentSchema],
}, {
    timestamps: true
})

module.exports = mongoose.model('FormDesignSchema', FormSchema)