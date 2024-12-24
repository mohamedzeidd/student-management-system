const mongoose = require("mongoose")
const connect = mongoose.connect("mongodb://127.0.0.1:27017/courses")

connect.then(() =>{
    console.log("Database connected succefuly")
}).catch(() => {
    console.log("Database cannot connect")
})
const courseschema = new mongoose.Schema({

    doctorname:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    level:{
        type:Number,
        required:true,
    },
    code:{
        type:String,
        required:true
    },
    presubject:{
        type:String,
        required:true
    },
    department:{
        type:String,
        required:true
    },year:{type:Number},
    semester:{
        type:String
    }
})
const courses = new mongoose.model("courses",courseschema)
module.exports = courses