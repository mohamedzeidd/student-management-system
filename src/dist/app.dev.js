"use strict";

var express = require('express');

var path = require("path");

var bcrypt = require('bcrypt');

var collection = require("../models/config");

var _require = require('react'),
    cloneElement = _require.cloneElement;

var app = express();

var courses = require('../models/course');

var mongoose = require('mongoose');

var _require2 = require('ejs'),
    name = _require2.name;

app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

var cookieParser = require('cookie-parser');

var session = require('express-session');

var _require3 = require('fs'),
    read = _require3.read;

var _require4 = require('timers/promises'),
    scheduler = _require4.scheduler;

app.use(session({
  secret: "Your secret key",
  saveUninitialized: false,
  resave: false
}));
app.set('view engine', 'ejs');
app.use(express["static"]("public"));
app.use(express["static"]("Assets"));
app.use(express["static"]("views/student"));
app.use(express["static"]("views/admin"));
app.listen(3000, function () {
  console.log("welcome to my web page");
});

function toLowerCaseString(input) {
  return input.toLowerCase();
} //Authintcation function


function checkSignIn(req, res, next) {
  if (req.session.user) {
    next(); //If session exists, proceed to page
  } else {
    var err = new Error("Not logged in!");
    console.log(req.session.user);
    next(err); //Error, trying to access unauthorized page!
  }
}

function checkAdmin(req, res, next) {
  if (req.session.user.type == "admin") {
    next(); //If session exists, proceed to page
  } else {
    var err = new Error("Not Admin");
    console.log(req.session.user);
    next(err); //Error, trying to access unauthorized page!
  }
}

function checkDoctor(req, res, next) {
  if (req.session.user.type == "staff") {
    next(); //If session exists, proceed to page
  } else {
    var err = new Error("Not Doctor");
    console.log(req.session.user);
    next(err); //Error, trying to access unauthorized page!
  }
} //All routes are here


app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/", function (req, res) {
  res.redirect('login');
});
app.get("/logout", function (req, res) {
  req.session.destroy();
  res.redirect("/");
}); //Student routes

app.get("/add-user", checkSignIn, function (req, res) {
  res.render('admin/add-user');
});
app.get("/studentinfo", checkSignIn, function _callee(req, res) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          //res.send(username)
          res.render("student/studentinfo", {
            username: req.session.user.username,
            type: req.session.user.type,
            department: req.session.user.department
          });
          console.log(req.session.user);

        case 2:
        case "end":
          return _context.stop();
      }
    }
  });
});
app.get("/student", checkSignIn, function (req, res) {
  res.render('student/studentpage');
});
app.get("/chosensubjects", checkSignIn, function _callee2(req, res) {
  var name1, subject;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(collection.findOne({
            name: req.session.user.username
          }));

        case 2:
          name1 = _context2.sent;
          subject = name1.subjects;
          res.render("student/chosensubjects", {
            subject: subject
          });

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  });
}); // Route to render the messages page for the logged-in student

app.get('/student-msg', function _callee3(req, res) {
  var username, user, studentMessages;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          username = req.session.user.username;
          _context3.prev = 1;
          _context3.next = 4;
          return regeneratorRuntime.awrap(collection.findOne({
            name: username
          }).populate('messages'));

        case 4:
          user = _context3.sent;

          if (user) {
            _context3.next = 7;
            break;
          }

          return _context3.abrupt("return", res.status(404).send('User not found'));

        case 7:
          // Get the messages associated with the user
          studentMessages = user.messages; // Render the messages.ejs template and pass the messages data

          res.render('student/student-msg', {
            messages: studentMessages
          });
          _context3.next = 15;
          break;

        case 11:
          _context3.prev = 11;
          _context3.t0 = _context3["catch"](1);
          console.error(_context3.t0);
          res.status(500).send('Internal Server Error');

        case 15:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[1, 11]]);
}); //Staff routes

app.get("/staffinfo", function (req, res) {
  res.render("staff/staffinfo", {
    username: req.session.user.username,
    type: req.session.user.type,
    department: req.session.user.department
  });
  console.log(req.session.user);
});
app.get("/doctorCourses", function _callee4(req, res) {
  var doctorcourses;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(courses.find({
            doctorname: req.session.user.username
          }));

        case 2:
          doctorcourses = _context4.sent;
          res.render("staff/doctorCourses", {
            courses: doctorcourses
          });

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
});
app.get("/all-students", checkSignIn, function _callee5(req, res) {
  var name1, student, allusers;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(collection.findOne({
            name: req.body.studentname
          }));

        case 3:
          name1 = _context5.sent;
          student = "student";
          _context5.next = 7;
          return regeneratorRuntime.awrap(collection.find({
            type: student
          }));

        case 7:
          allusers = _context5.sent;
          res.render("staff/all-students", {
            users: allusers,
            user: name1
          });
          _context5.next = 14;
          break;

        case 11:
          _context5.prev = 11;
          _context5.t0 = _context5["catch"](0);
          console.log(_context5.t0);

        case 14:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 11]]);
});
app.get("/search-student", function (req, res) {
  res.render("staff/search-student", {
    student: null,
    message: ''
  });
});
app.get("/student-grades", checkSignIn, function _callee6(req, res) {
  var name, student, subjects;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          name = req.query.studentname;
          _context6.prev = 1;
          _context6.next = 4;
          return regeneratorRuntime.awrap(collection.findOne({
            name: name
          }));

        case 4:
          student = _context6.sent;

          if (!student) {
            _context6.next = 10;
            break;
          }

          subjects = student.subjects;
          return _context6.abrupt("return", res.render("staff/student-grade", {
            subjects: subjects,
            student: student
          }));

        case 10:
          return _context6.abrupt("return", res.render("staff/student-grade", {
            subjects: [],
            message: 'Student not found'
          }));

        case 11:
          _context6.next = 17;
          break;

        case 13:
          _context6.prev = 13;
          _context6.t0 = _context6["catch"](1);
          console.error('Error fetching student grades:', _context6.t0);
          res.render("staff/student-grade", {
            subjects: [],
            message: 'An error occurred while fetching the student grades'
          });

        case 17:
        case "end":
          return _context6.stop();
      }
    }
  }, null, null, [[1, 13]]);
});
app.post("/add-grade/:studentId/:subjectId", checkDoctor, function _callee7(req, res) {
  var _req$params, studentId, subjectId, grade, student, subject;

  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _req$params = req.params, studentId = _req$params.studentId, subjectId = _req$params.subjectId;
          grade = req.body.grade;
          _context7.prev = 2;
          _context7.next = 5;
          return regeneratorRuntime.awrap(collection.findById(studentId));

        case 5:
          student = _context7.sent;

          if (student) {
            _context7.next = 8;
            break;
          }

          return _context7.abrupt("return", res.status(404).send('Student not found'));

        case 8:
          subject = student.subjects.id(subjectId);

          if (subject) {
            _context7.next = 11;
            break;
          }

          return _context7.abrupt("return", res.status(404).send('Subject not found'));

        case 11:
          subject.grade = grade;
          _context7.next = 14;
          return regeneratorRuntime.awrap(student.save());

        case 14:
          res.redirect("/student-grades?studentname=".concat(student.name));
          _context7.next = 21;
          break;

        case 17:
          _context7.prev = 17;
          _context7.t0 = _context7["catch"](2);
          console.error('Error adding grade:', _context7.t0);
          res.status(500).send('Internal Server Error');

        case 21:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[2, 17]]);
}); // Route to render the messages page

app.get('/messages', function _callee8(req, res) {
  var user, messages;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.prev = 0;
          _context8.next = 3;
          return regeneratorRuntime.awrap(collection.findOne({
            name: req.session.user.username
          }));

        case 3:
          user = _context8.sent;

          if (user) {
            _context8.next = 6;
            break;
          }

          return _context8.abrupt("return", res.status(404).send('User not found'));

        case 6:
          // Get messages associated with the user
          messages = user.messages || []; // If user has no messages, initialize as empty array

          res.render('staff/sendMsg', {
            messages: messages
          });
          _context8.next = 14;
          break;

        case 10:
          _context8.prev = 10;
          _context8.t0 = _context8["catch"](0);
          console.error(_context8.t0);
          res.status(500).send('Internal Server Error');

        case 14:
        case "end":
          return _context8.stop();
      }
    }
  }, null, null, [[0, 10]]);
});
app.post('/send', function _callee9(req, res) {
  var _req$body, recipient, message, sender, user, recipientUser;

  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _req$body = req.body, recipient = _req$body.recipient, message = _req$body.message;
          sender = req.session.user.username; // Assuming the sender is always the doctor for this example

          _context9.prev = 2;

          if (!(!message || message.trim() === '')) {
            _context9.next = 5;
            break;
          }

          return _context9.abrupt("return", res.status(400).send('Message content is required'));

        case 5:
          _context9.next = 7;
          return regeneratorRuntime.awrap(collection.findOne({
            name: req.session.user.username
          }));

        case 7:
          user = _context9.sent;

          if (user) {
            _context9.next = 10;
            break;
          }

          return _context9.abrupt("return", res.status(404).send('User not found'));

        case 10:
          // Add the new message to the user's messages array
          user.messages.push({
            sender: sender,
            recipient: recipient,
            message: message
          }); // Save the updated user document

          _context9.next = 13;
          return regeneratorRuntime.awrap(user.save());

        case 13:
          _context9.next = 15;
          return regeneratorRuntime.awrap(collection.findOne({
            name: recipient
          }));

        case 15:
          recipientUser = _context9.sent;

          if (!recipientUser) {
            _context9.next = 20;
            break;
          }

          recipientUser.messages.push({
            sender: sender,
            recipient: recipient,
            message: message
          });
          _context9.next = 20;
          return regeneratorRuntime.awrap(recipientUser.save());

        case 20:
          // Redirect back to the messages page after sending the message
          res.redirect('/messages');
          _context9.next = 27;
          break;

        case 23:
          _context9.prev = 23;
          _context9.t0 = _context9["catch"](2);
          console.error(_context9.t0);
          res.status(500).send('Internal Server Error');

        case 27:
        case "end":
          return _context9.stop();
      }
    }
  }, null, null, [[2, 23]]);
}); //Admin routes

app.get("/admin", checkAdmin, function (req, res) {
  res.render("admin/adminhome");
});
app.get("/all-users", checkSignIn, function _callee10(req, res) {
  var name1, allusers;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.prev = 0;
          _context10.next = 3;
          return regeneratorRuntime.awrap(collection.findOne({
            name: req.body.studentname
          }));

        case 3:
          name1 = _context10.sent;
          _context10.next = 6;
          return regeneratorRuntime.awrap(collection.find());

        case 6:
          allusers = _context10.sent;
          res.render("admin/all-users", {
            users: allusers,
            user: name1
          });
          _context10.next = 13;
          break;

        case 10:
          _context10.prev = 10;
          _context10.t0 = _context10["catch"](0);
          console.log(_context10.t0);

        case 13:
        case "end":
          return _context10.stop();
      }
    }
  }, null, null, [[0, 10]]);
});
app.get("/add-courses", checkAdmin, function (req, res) {
  res.render('admin/add-courses');
});
app.get("/all-courses", checkAdmin, function _callee11(req, res) {
  var allcourses;
  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _context11.prev = 0;
          _context11.next = 3;
          return regeneratorRuntime.awrap(courses.find());

        case 3:
          allcourses = _context11.sent;
          res.render("admin/all-courses", {
            courses: allcourses
          });
          _context11.next = 10;
          break;

        case 7:
          _context11.prev = 7;
          _context11.t0 = _context11["catch"](0);
          console.log(_context11.t0);

        case 10:
        case "end":
          return _context11.stop();
      }
    }
  }, null, null, [[0, 7]]);
});
app.get("/add-user", checkAdmin, function (req, res) {
  res.render('admin/add-user');
});
app.post("/login", function _callee12(req, res) {
  var username, password, type, check, checkpass, department, email, nationality, dateofbirth, level, subjects;
  return regeneratorRuntime.async(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.prev = 0;
          username = req.body.username;
          password = req.body.password;
          type = req.body.type;
          _context12.next = 6;
          return regeneratorRuntime.awrap(collection.findOne({
            name: username
          }));

        case 6:
          check = _context12.sent;

          //var data = {username:req.body.username,password:req.body.password,type:req.body.type,check.department}
          if (check == false) {
            res.send("user connot find");
          }

          _context12.next = 10;
          return regeneratorRuntime.awrap(bcrypt.compare(req.body.password, check.password));

        case 10:
          checkpass = _context12.sent;

          if (checkpass) {
            if (check.type == req.body.type) {
              department = check.department;
              email = check.email;
              nationality = check.nationality;
              dateofbirth = check.dateofbirth;
              level = check.level;
              subjects = check.subjects;

              if (check.type == "student") {
                req.session.user = {
                  username: req.body.username,
                  password: req.body.password,
                  type: req.body.type,
                  department: department,
                  email: email,
                  nationality: nationality,
                  dateofbirth: dateofbirth,
                  level: level,
                  subjects: subjects
                };
                res.render('student/studentpage');
              } else if (check.type == "admin") {
                //req.session.user = data
                req.session.user = {
                  username: req.body.username,
                  password: req.body.password,
                  type: req.body.type,
                  department: department,
                  email: email,
                  nationality: nationality,
                  dateofbirth: dateofbirth,
                  level: level
                };
                res.render('admin/adminhome');
              } else {
                req.session.user = {
                  username: req.body.username,
                  password: req.body.password,
                  type: req.body.type,
                  department: department,
                  email: email,
                  nationality: nationality,
                  dateofbirth: dateofbirth,
                  level: level
                };
                res.render("staff/staffhome");
              }
            }
          } else {
            res.send("Wrong password");
          }

          _context12.next = 17;
          break;

        case 14:
          _context12.prev = 14;
          _context12.t0 = _context12["catch"](0);
          res.send("wrong details");

        case 17:
        case "end":
          return _context12.stop();
      }
    }
  }, null, null, [[0, 14]]);
}); //All functions are here to handle Admin requests

app.post("/add-user", function _callee13(req, res) {
  var name, password, type, department, email, nationality, dateofbirth, level, user, existuser, hashedpassword;
  return regeneratorRuntime.async(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          name = req.body.username;
          password = req.body.password;
          type = req.body.type;
          department = req.body.department;
          email = req.body.email;
          nationality = req.body.nationality;
          dateofbirth = req.body.dateofbirth;
          level = req.body.level;
          user = {
            name: name,
            password: password,
            type: type,
            department: department,
            email: email,
            nationality: nationality,
            dateofbirth: dateofbirth,
            level: level
          };
          _context13.next = 11;
          return regeneratorRuntime.awrap(collection.findOne({
            name: user.name
          }));

        case 11:
          existuser = _context13.sent;

          if (!existuser) {
            _context13.next = 16;
            break;
          }

          res.send("user already exist, try onther name");
          _context13.next = 24;
          break;

        case 16:
          _context13.next = 18;
          return regeneratorRuntime.awrap(bcrypt.hash(user.password, 10));

        case 18:
          hashedpassword = _context13.sent;
          user.password = hashedpassword;
          _context13.next = 22;
          return regeneratorRuntime.awrap(collection.insertMany(user));

        case 22:
          console.log(user);
          res.render('login');

        case 24:
        case "end":
          return _context13.stop();
      }
    }
  });
});
app.post("/add-courses", function _callee14(req, res) {
  var data, existcourse, coursedata, _coursedata;

  return regeneratorRuntime.async(function _callee14$(_context14) {
    while (1) {
      switch (_context14.prev = _context14.next) {
        case 0:
          _context14.prev = 0;
          data = {
            doctorname: req.body.doctorname,
            name: req.body.coursename,
            level: req.body.level,
            code: req.body.code,
            presubject: req.body.presubject,
            department: toLowerCaseString(req.body.department),
            semester: req.body.semester,
            year: req.body.year
          };
          _context14.next = 4;
          return regeneratorRuntime.awrap(courses.findOne({
            code: data.code
          }));

        case 4:
          existcourse = _context14.sent;

          if (existcourse) {
            _context14.next = 28;
            break;
          }

          if (!(data.level == 1 || data.level == 2)) {
            _context14.next = 18;
            break;
          }

          if (!(data.department == "All")) {
            _context14.next = 15;
            break;
          }

          _context14.next = 10;
          return regeneratorRuntime.awrap(courses.insertMany(data));

        case 10:
          coursedata = _context14.sent;
          res.redirect("/admin");
          console.log(coursedata);
          _context14.next = 16;
          break;

        case 15:
          console.log("Wrond department type");

        case 16:
          _context14.next = 28;
          break;

        case 18:
          if (!(data.level == 3 || data.level == 4)) {
            _context14.next = 27;
            break;
          }

          if (!(data.department != null)) {
            _context14.next = 25;
            break;
          }

          _context14.next = 22;
          return regeneratorRuntime.awrap(courses.insertMany(data));

        case 22:
          _coursedata = _context14.sent;
          res.render("/admin");
          console.log(_coursedata);

        case 25:
          _context14.next = 28;
          break;

        case 27:
          res.send("already exist");

        case 28:
          _context14.next = 33;
          break;

        case 30:
          _context14.prev = 30;
          _context14.t0 = _context14["catch"](0);
          console.log(_context14.t0); //res.render("add-courses" , {title:"Add Course" , message:"Error adding course" , nav:admin_nav_bar})

        case 33:
        case "end":
          return _context14.stop();
      }
    }
  }, null, null, [[0, 30]]);
});
app.get("/delete-user/:_id", function _callee15(req, res) {
  var _id;

  return regeneratorRuntime.async(function _callee15$(_context15) {
    while (1) {
      switch (_context15.prev = _context15.next) {
        case 0:
          _id = req.params._id;
          _context15.next = 3;
          return regeneratorRuntime.awrap(collection.deleteOne({
            _id: _id
          }).then(function () {
            console.log("user deleted succefuly");
            res.redirect("/admin");
          })["catch"](function (err) {
            console.log({
              message: err.message
            });
          }));

        case 3:
        case "end":
          return _context15.stop();
      }
    }
  });
});
app.get("/delete-courses/:_id", function _callee16(req, res) {
  var _id;

  return regeneratorRuntime.async(function _callee16$(_context16) {
    while (1) {
      switch (_context16.prev = _context16.next) {
        case 0:
          _id = req.params._id;
          _context16.next = 3;
          return regeneratorRuntime.awrap(courses.deleteOne({
            _id: _id
          }).then(function () {
            console.log("course deleted succefuly");
            res.redirect("/admin");
          })["catch"](function (err) {
            console.log({
              message: err.message
            });
          }));

        case 3:
        case "end":
          return _context16.stop();
      }
    }
  });
});
app.get("update-user/:_id", function _callee17(req, res) {
  var _id;

  return regeneratorRuntime.async(function _callee17$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          _id = req.params._id;
          _context17.next = 3;
          return regeneratorRuntime.awrap(collection.findOneAndUpdate({
            _id: _id
          }).then(function () {
            console.log("user deleted succefuly");
            res.redirect("/admin");
          })["catch"](function (err) {
            console.log({
              message: err.message
            });
          }));

        case 3:
        case "end":
          return _context17.stop();
      }
    }
  });
});
app.get('/search-user', function (req, res) {
  res.render('admin/search-user');
}); // Route to handle search result

app.get('/result', function _callee18(req, res) {
  var name, user, course;
  return regeneratorRuntime.async(function _callee18$(_context18) {
    while (1) {
      switch (_context18.prev = _context18.next) {
        case 0:
          name = req.query.name;
          _context18.prev = 1;
          _context18.next = 4;
          return regeneratorRuntime.awrap(collection.findOne({
            name: name
          }));

        case 4:
          user = _context18.sent;

          if (user) {
            _context18.next = 7;
            break;
          }

          return _context18.abrupt("return", res.render('admin/result', {
            userNotFound: true,
            invalidtype: false
          }));

        case 7:
          if (!(user.type === 'student')) {
            _context18.next = 11;
            break;
          }

          return _context18.abrupt("return", res.render('admin/result', {
            user: user,
            userNotFound: false,
            invalidtype: false,
            subjects: user.subjects
          }));

        case 11:
          if (!(user.type === 'staff')) {
            _context18.next = 18;
            break;
          }

          _context18.next = 14;
          return regeneratorRuntime.awrap(courses.find({
            doctorname: name
          }));

        case 14:
          course = _context18.sent;
          return _context18.abrupt("return", res.render('admin/result', {
            user: user,
            userNotFound: false,
            invalidtype: false,
            courses: course
          }));

        case 18:
          return _context18.abrupt("return", res.render('admin/result', {
            userNotFound: false,
            invalidtype: true
          }));

        case 19:
          _context18.next = 25;
          break;

        case 21:
          _context18.prev = 21;
          _context18.t0 = _context18["catch"](1);
          console.error(_context18.t0);
          return _context18.abrupt("return", res.status(500).send('Server error'));

        case 25:
        case "end":
          return _context18.stop();
      }
    }
  }, null, null, [[1, 21]]);
}); //welocme to my webiste
//Student Functions

app.get("/student-subject", function _callee19(req, res) {
  var username, check, dep, d, subjects, _subjects, _subjects2, _subjects3;

  return regeneratorRuntime.async(function _callee19$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          username = req.session.user.username;
          _context19.next = 3;
          return regeneratorRuntime.awrap(collection.find({
            username: username
          }));

        case 3:
          check = _context19.sent;
          dep = req.session.user.department;
          d = toLowerCaseString(dep);

          if (!username) {
            _context19.next = 36;
            break;
          }

          if (!(d == "cs")) {
            _context19.next = 15;
            break;
          }

          _context19.next = 10;
          return regeneratorRuntime.awrap(courses.find({
            department: req.session.user.department
          }));

        case 10:
          subjects = _context19.sent;
          console.log(subjects);
          res.render("student/studentsubject", {
            subjects: subjects
          });
          _context19.next = 36;
          break;

        case 15:
          if (!(d == "ai")) {
            _context19.next = 23;
            break;
          }

          _context19.next = 18;
          return regeneratorRuntime.awrap(courses.find({
            department: req.session.user.department
          }));

        case 18:
          _subjects = _context19.sent;
          console.log(_subjects);
          res.render("student/studentsubject", {
            subjects: _subjects
          });
          _context19.next = 36;
          break;

        case 23:
          if (!(d == "it")) {
            _context19.next = 31;
            break;
          }

          _context19.next = 26;
          return regeneratorRuntime.awrap(courses.find({
            department: req.session.user.department
          }));

        case 26:
          _subjects2 = _context19.sent;
          console.log(_subjects2);
          res.render("student/studentsubject", {
            subjects: _subjects2
          });
          _context19.next = 36;
          break;

        case 31:
          if (!(d == "all")) {
            _context19.next = 36;
            break;
          }

          _context19.next = 34;
          return regeneratorRuntime.awrap(courses.find({
            department: req.session.user.department
          }));

        case 34:
          _subjects3 = _context19.sent;
          res.render("student/studentsubject", {
            subjects: _subjects3
          });

        case 36:
        case "end":
          return _context19.stop();
      }
    }
  });
});
app.post("/chosensubjects", function _callee20(req, res) {
  var subjects, existcourse, student, isSubjectAdded, subjectsInSemester;
  return regeneratorRuntime.async(function _callee20$(_context20) {
    while (1) {
      switch (_context20.prev = _context20.next) {
        case 0:
          _context20.prev = 0;
          subjects = {
            name: req.body.coursename,
            code: req.body.code
          };
          _context20.next = 4;
          return regeneratorRuntime.awrap(courses.findOne({
            code: req.body.code
          }));

        case 4:
          existcourse = _context20.sent;
          _context20.next = 7;
          return regeneratorRuntime.awrap(collection.findOne({
            name: req.session.user.username
          }));

        case 7:
          student = _context20.sent;

          if (student) {
            _context20.next = 10;
            break;
          }

          return _context20.abrupt("return", res.status(404).send({
            message: 'Student not found'
          }));

        case 10:
          if (!existcourse) {
            _context20.next = 29;
            break;
          }

          if (!(existcourse.department == req.session.user.department && existcourse.level == req.session.user.level)) {
            _context20.next = 26;
            break;
          }

          isSubjectAdded = student.subjects.some(function (subject) {
            return subject.code === subjects.code;
          });

          if (!isSubjectAdded) {
            _context20.next = 15;
            break;
          }

          return _context20.abrupt("return", res.send("Subject already added"));

        case 15:
          subjectsInSemester = student.subjects.filter(function (subject) {
            return subject.semester === existcourse.semester;
          });

          if (!(subjectsInSemester.length >= 7)) {
            _context20.next = 20;
            break;
          }

          return _context20.abrupt("return", res.send("Maximum number of subjects for this semester reached"));

        case 20:
          student.subjects.push({
            name: req.body.coursename,
            code: req.body.code,
            presubject: existcourse.presubject,
            semester: existcourse.semester,
            year: existcourse.year
          });
          _context20.next = 23;
          return regeneratorRuntime.awrap(student.save());

        case 23:
          res.render('student/chosensubjects', {
            subject: student.subjects,
            student: student
          });

        case 24:
          _context20.next = 27;
          break;

        case 26:
          res.send("Cannot add this subject");

        case 27:
          _context20.next = 30;
          break;

        case 29:
          res.send("Wrond subject code");

        case 30:
          _context20.next = 35;
          break;

        case 32:
          _context20.prev = 32;
          _context20.t0 = _context20["catch"](0);
          console.log(_context20.t0); //res.render("add-courses" , {title:"Add Course" , message:"Error adding course" , nav:admin_nav_bar})

        case 35:
        case "end":
          return _context20.stop();
      }
    }
  }, null, null, [[0, 32]]);
});
app.post('/delete-subject/:_id', function _callee21(req, res) {
  var subjectId, studentName, student, updatedSubjects;
  return regeneratorRuntime.async(function _callee21$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          subjectId = req.params._id;
          _context21.prev = 1;
          // Log session data
          console.log('Session user:', req.session.user); // Log the name used in the query

          studentName = req.session.user.username;
          console.log('Finding student with name:', studentName); // Fetch the student document based on the session user name

          _context21.next = 7;
          return regeneratorRuntime.awrap(collection.findOne({
            name: studentName
          }));

        case 7:
          student = _context21.sent;

          if (student) {
            _context21.next = 11;
            break;
          }

          console.log('Student not found');
          return _context21.abrupt("return", res.render('student/studentpage', {
            student: {},
            message: 'Student not found'
          }));

        case 11:
          // Log the student's current subjects
          console.log('Current subjects:', student.subjects); // Filter out the subject to be deleted

          updatedSubjects = student.subjects.filter(function (subject) {
            return subject._id.toString() !== subjectId;
          }); // Log the updated subjects to ensure the filter is working correctly

          console.log('Updated subjects:', updatedSubjects); // Update the student document with the filtered subjects

          student.subjects = updatedSubjects; // Save the updated student document

          _context21.next = 17;
          return regeneratorRuntime.awrap(student.save());

        case 17:
          // Log success message
          console.log('Subject deleted successfully');
          res.render('student/studentpage', {
            student: student,
            message: 'Subject deleted successfully'
          });
          _context21.next = 25;
          break;

        case 21:
          _context21.prev = 21;
          _context21.t0 = _context21["catch"](1);
          // Log the error
          console.error('Error deleting subject:', _context21.t0);
          res.render('student/studentpage', {
            student: {},
            message: 'An error occurred while deleting the subject'
          });

        case 25:
        case "end":
          return _context21.stop();
      }
    }
  }, null, null, [[1, 21]]);
}); // Route for students to view their grades

app.get("/grades", checkSignIn, function _callee22(req, res) {
  var student;
  return regeneratorRuntime.async(function _callee22$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          _context22.prev = 0;
          _context22.next = 3;
          return regeneratorRuntime.awrap(collection.findOne({
            name: req.session.user.username
          }));

        case 3:
          student = _context22.sent;

          if (student) {
            _context22.next = 6;
            break;
          }

          return _context22.abrupt("return", res.status(404).send({
            message: 'Student not found'
          }));

        case 6:
          // Render the student's grades view with the valid subjects and semesters
          res.render('student/grades', {
            subjects: student.subjects
          });
          _context22.next = 13;
          break;

        case 9:
          _context22.prev = 9;
          _context22.t0 = _context22["catch"](0);
          console.error('Error fetching student grades:', _context22.t0);
          res.status(500).send('Internal Server Error');

        case 13:
        case "end":
          return _context22.stop();
      }
    }
  }, null, null, [[0, 9]]);
});
app.post("/student-grades", function _callee23(req, res) {
  var find, subject;
  return regeneratorRuntime.async(function _callee23$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          _context23.next = 2;
          return regeneratorRuntime.awrap(collection.findOne({
            name: req.body.name
          }));

        case 2:
          find = _context23.sent;
          subject = find.subjects;
          console.log(subject);
          res.render("admin/studentgrades", {
            subject: subject
          });

        case 6:
        case "end":
          return _context23.stop();
      }
    }
  });
});
app.use('/add-user', function (err, req, res, next) {
  console.log(err); //User should be authenticated! Redirect him to log in.

  res.redirect('/');
});
app.use('/add-courses', function (err, req, res, next) {
  console.log(err); //User should be authenticated! Redirect him to log in.

  res.redirect('/');
});
app.use('/all-users', function (err, req, res, next) {
  console.log(err); //User should be authenticated! Redirect him to log in.

  res.redirect('/');
});
app.use('/all-courses', function (err, req, res, next) {
  console.log(err); //User should be authenticated! Redirect him to log in.

  res.redirect('/');
});
app.use('/delete-user', function (err, req, res, next) {
  console.log(err); //User should be authenticated! Redirect him to log in.

  res.redirect('/');
});
app.use('/delete-courses', function (err, req, res, next) {
  console.log(err); //User should be authenticated! Redirect him to log in.

  res.redirect('/');
});