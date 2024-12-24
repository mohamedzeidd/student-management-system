"use strict";

var mongoose = require("mongoose");

var connect = mongoose.connect("mongodb://127.0.0.1:27017/login");
var Schema = mongoose.Schema;
connect.then(function () {
  console.log("Database connected succefuly");
})["catch"](function () {
  console.log("Database cannot connect");
});
var messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    "default": Date.now
  }
});
var subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  presubject: {
    type: String,
    required: true
  },
  grade: {
    type: Number,
    "default": null
  },
  semester: {
    type: String
  },
  year: {
    type: Number
  } // You can add more fields as needed

});
var loginSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  type: {
    type: String,
    require: true
  },
  department: {
    type: String,
    require: true
  },
  email: {
    type: String
  },
  nationality: {
    type: String
  },
  dateofbirth: {
    type: Date
  },
  level: {
    type: String
  },
  subjects: [subjectSchema],
  messages: [messageSchema]
});
var collection = new mongoose.model("login", loginSchema);
module.exports = collection;