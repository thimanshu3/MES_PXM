const mongoose = require('mongoose')



const PageContentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    order: {
        type: Number,
    },
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
    pageContent: [PageContentSchema]
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
    componets: [ComponentSchema],
}, {
    timestamps: true
})

module.exports = mongoose.model('FormDesignSchema', FormSchema)