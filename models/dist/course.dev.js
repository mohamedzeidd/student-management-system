"use strict";

var mongoose = require("mongoose");

var connect = mongoose.connect("mongodb://127.0.0.1:27017/courses");
connect.then(function () {
  console.log("Database connected succefuly");
})["catch"](function () {
  console.log("Database cannot connect");
});
var courseschema = new mongoose.Schema({
  doctorname: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number,
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
  department: {
    type: String,
    required: true
  },
  year: {
    type: Number
  },
  semester: {
    type: String
  }
});
var courses = new mongoose.model("courses", courseschema);
module.exports = courses;