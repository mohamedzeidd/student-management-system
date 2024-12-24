const express = require('express')
const path = require("path")
const bcrypt = require('bcrypt')
const collection = require("../models/config")
const { cloneElement } = require('react')
const app = express()
const courses = require('../models/course')
const mongoose = require('mongoose');
const { name } = require('ejs')
app.use(express.json())

app.use(express.urlencoded({extended:false}))
var cookieParser = require('cookie-parser');
const session = require('express-session');
const { read } = require('fs')
const { scheduler } = require('timers/promises')
app.use(session({secret: "Your secret key" , saveUninitialized:false , resave:false}));
app.set('view engine','ejs')
app.use(express.static("public"))
app.use(express.static("Assets"))
app.use(express.static("views/student"))
app.use(express.static("views/admin"))
app.listen(3000,() => {
    console.log("welcome to my web page")
})

function toLowerCaseString(input) {
    return input.toLowerCase();
}

//Authintcation function
function checkSignIn(req, res , next){
    if(req.session.user){
       next();     //If session exists, proceed to page
    } else {
       var err = new Error("Not logged in!");
       console.log(req.session.user);
       next(err);  //Error, trying to access unauthorized page!
    }
}
function checkAdmin(req, res , next){
    if(req.session.user.type == "admin"){
       next();     //If session exists, proceed to page
    } else {
       var err = new Error("Not Admin");
       console.log(req.session.user);
       next(err);  //Error, trying to access unauthorized page!
    }
}
function checkDoctor(req, res , next){
    if(req.session.user.type == "staff"){
       next();     //If session exists, proceed to page
    } else {
       var err = new Error("Not Doctor");
       console.log(req.session.user);
       next(err);  //Error, trying to access unauthorized page!
    }
}
//All routes are here
app.get("/login",(req,res)=>{
    res.render("login")
})
app.get("/",(req,res)=>{
    res.redirect('login')   
    
})
app.get("/logout",(req , res)=>{
    req.session.destroy()
    res.redirect("/")
})


//Student routes
app.get("/add-user",checkSignIn,(req,res)=>{
    res.render('admin/add-user')
})
app.get("/studentinfo",checkSignIn,async(req,res)=>{
     
    //res.send(username)
    res.render("student/studentinfo",{username:req.session.user.username,type:req.session.user.type,department:req.session.user.department})
    console.log(req.session.user)
})
app.get("/student",checkSignIn,(req,res)=>{
    res.render('student/studentpage')
})
app.get("/chosensubjects",checkSignIn,async(req,res)=>{
    var name1 = await collection.findOne({name:req.session.user.username})
    const subject = name1.subjects
    res.render("student/chosensubjects",{subject:subject})
})
// Route to render the messages page for the logged-in student
app.get('/student-msg', async (req, res) => {
    const username = req.session.user.username;
    try {
        // Find the user based on the username
        const user = await collection.findOne({ name: username }).populate('messages');
        if (!user) {
            return res.status(404).send('User not found');
        }
        // Get the messages associated with the user
        const studentMessages = user.messages;
        // Render the messages.ejs template and pass the messages data
        res.render('student/student-msg', { messages: studentMessages });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



//Staff routes
app.get("/staffinfo",(req,res)=>{
    
    res.render("staff/staffinfo",{username:req.session.user.username,type:req.session.user.type,department:req.session.user.department})
    console.log(req.session.user)
})
app.get("/doctorCourses",async(req,res)=>{
    const doctorcourses = await courses.find({doctorname:req.session.user.username})
    res.render("staff/doctorCourses",{courses:doctorcourses})
})
app.get("/all-students",checkSignIn,async(req,res)=>{
    try{
        const name1 = await collection.findOne({name:req.body.studentname})  
        const student = "student"
        const allusers = await collection.find({type:student})
        res.render("staff/all-students",{users:allusers,user:name1})
    }catch(err){
        console.log(err)
    }
})
app.get("/search-student", (req, res) => {
    res.render("staff/search-student", { student: null, message: '' });
});
app.get("/student-grades",checkSignIn,async(req,res)=>{
    const name = req.query.studentname;

    try {
        const student = await collection.findOne({ name: name });

        if (student) {
            const subjects = student.subjects;
            return res.render("staff/student-grade", { subjects: subjects ,student:student});
        } else {
            return res.render("staff/student-grade", { subjects: [], message: 'Student not found' });
        }
    } catch (error) {
        console.error('Error fetching student grades:', error);
        res.render("staff/student-grade", { subjects: [], message: 'An error occurred while fetching the student grades' });
    }
})
app.post("/add-grade/:studentId/:subjectId", checkDoctor, async (req, res) => {
    const { studentId, subjectId } = req.params;
    const { grade } = req.body;

    try {
        const student = await collection.findById(studentId);

        if (!student) {
            return res.status(404).send('Student not found');
        }

        const subject = student.subjects.id(subjectId);

        if (!subject) {
            return res.status(404).send('Subject not found');
        }

        subject.grade = grade;
        await student.save();

        res.redirect(`/student-grades?studentname=${student.name}`);
    } catch (error) {
        console.error('Error adding grade:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Route to render the messages page
app.get('/messages', async (req, res) => {
    try {
      // Fetch messages for the logged-in user
      const user = await collection.findOne({ name: req.session.user.username });
      if (!user) {
        // Handle case where user is not found
        return res.status(404).send('User not found');
      }
      // Get messages associated with the user
      const messages = user.messages || []; // If user has no messages, initialize as empty array
      res.render('staff/sendMsg', { messages });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.post('/send', async (req, res) => {
    const { recipient, message } = req.body;
    const sender = req.session.user.username; // Assuming the sender is always the doctor for this example
    
    try {
      // Check if message content is provided
      if (!message || message.trim() === '') {
        return res.status(400).send('Message content is required');
      }
      
      // Find the user sending the message
      const user = await collection.findOne({ name: req.session.user.username });
      if (!user) {
        return res.status(404).send('User not found');
      }
      
      // Add the new message to the user's messages array
      user.messages.push({ sender, recipient, message });
      
      // Save the updated user document
      await user.save();
      
      // Check if recipient exists and update recipient's messages
      const recipientUser = await collection.findOne({ name: recipient });
      if (recipientUser) {
        recipientUser.messages.push({ sender, recipient, message });
        await recipientUser.save();
      }
      
      // Redirect back to the messages page after sending the message
      res.redirect('/messages');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  
  
  
//Admin routes
app.get("/admin",checkAdmin,(req,res)=>{
    res.render("admin/adminhome")
})
app.get("/all-users",checkSignIn,async(req,res)=>{
    try{
        const name1 = await collection.findOne({name:req.body.studentname})  
        const allusers = await collection.find()
        res.render("admin/all-users",{users:allusers,user:name1})
    }catch(err){
        console.log(err)
    }
})
app.get("/add-courses",checkAdmin,(req,res)=>{
    res.render('admin/add-courses')
})
app.get("/all-courses",checkAdmin,async(req,res)=>{
    try{
        const allcourses = await courses.find()
        res.render("admin/all-courses",{courses:allcourses})
    }catch(err){
        console.log(err)
    }
})
app.get("/add-user",checkAdmin,(req,res)=>{
    res.render('admin/add-user')
})





app.post("/login",async(req,res)=>{
    try{
        const username = req.body.username
        const password=req.body.password
        const type=req.body.type
        const check = await collection.findOne({name : username})
        //var data = {username:req.body.username,password:req.body.password,type:req.body.type,check.department}
        if(check == false){
            res.send("user connot find")
        }
        const checkpass = await bcrypt.compare(req.body.password,check.password)
        if(checkpass){     
            if(check.type==req.body.type){
                
                const department = check.department
                const email = check.email
                const nationality = check.nationality
                const dateofbirth = check.dateofbirth
                const level = check.level
                const subjects = check.subjects
                if(check.type=="student"){
                    req.session.user = {username:req.body.username,password:req.body.password,type:req.body.type,department:department,email:email,nationality:nationality,dateofbirth:dateofbirth,level:level,subjects:subjects}
                    res.render('student/studentpage')
                }else if(check.type=="admin"){
                    //req.session.user = data
                    req.session.user = {username:req.body.username,password:req.body.password,type:req.body.type,department:department,email:email,nationality:nationality,dateofbirth:dateofbirth,level:level}
                    res.render('admin/adminhome')
                }else{
                    req.session.user = {username:req.body.username,password:req.body.password,type:req.body.type,department:department,email:email,nationality:nationality,dateofbirth:dateofbirth,level:level}
                    res.render("staff/staffhome")
                }
            }}
        else{
            res.send("Wrong password")
        }
    }catch{
        res.send("wrong details")
    }
})

//All functions are here to handle Admin requests
app.post("/add-user",async(req,res)=>{
   
    const name = req.body.username
    const password = req.body.password
    const type = req.body.type
    const department = req.body.department
    const email = req.body.email
    const nationality = req.body.nationality
    const dateofbirth = req.body.dateofbirth
    const level = req.body.level
    const user = {
        name:name,
        password:password,
        type:type,
        department:department,
        email:email,
        nationality:nationality,
        dateofbirth:dateofbirth,
        level:level
    }
    const existuser = await collection.findOne({name:user.name});
    if(existuser){
        res.send("user already exist, try onther name")
    }else{        
            const hashedpassword = await bcrypt.hash(user.password,10)
            user.password = hashedpassword
            
            await collection.insertMany(user)
            console.log(user) 
            res.render('login')
            
    }   
})
app.post("/add-courses",async(req,res)=>{
    
    try{
        const data = {
            doctorname:req.body.doctorname,
            name:req.body.coursename,
            level:req.body.level,
            code:req.body.code,
            presubject:req.body.presubject,
            department:toLowerCaseString(req.body.department),
            semester:req.body.semester,
            year:req.body.year
        }
        const existcourse = await courses.findOne({code:data.code});
        if(!existcourse){
            if(data.level == 1 || data.level == 2){
                if(data.department == "All"){
                    const coursedata = await courses.insertMany(data)
                    res.redirect("/admin")    
                    console.log(coursedata)
                }else{
                    console.log("Wrond department type")
                }      
        } else if(data.level == 3 || data.level == 4 ){
            if(data.department!=null){
            const coursedata = await courses.insertMany(data)
                    res.render("/admin")    
                    console.log(coursedata)
            }
        }
        else{
            res.send("already exist")
        }
        

    }}catch(err){
        console.log(err)
        //res.render("add-courses" , {title:"Add Course" , message:"Error adding course" , nav:admin_nav_bar})
    }
})

app.get("/delete-user/:_id",async(req,res)=>{
    const {_id} = req.params
    await collection.deleteOne({_id})
    .then(() => {
        console.log("user deleted succefuly")
        res.redirect("/admin")
    }).catch((err)=>{
        console.log({message:err.message})
    })
})
app.get("/delete-courses/:_id",async(req,res)=>{
    const {_id} = req.params
    await courses.deleteOne({_id})
    .then(() => {
        console.log("course deleted succefuly")
        res.redirect("/admin")
    }).catch((err)=>{
        console.log({message:err.message})
    })
})
app.get("update-user/:_id",async(req,res)=>{
    const {_id} = req.params
    await collection.findOneAndUpdate({_id})
    .then(() => {
        console.log("user deleted succefuly")
        res.redirect("/admin")
    }).catch((err)=>{
        console.log({message:err.message})
    })
})
app.get('/search-user', (req, res) => {
    res.render('admin/search-user');
  });
  
  // Route to handle search result
  app.get('/result', async (req, res) => {
    const { name } = req.query;
  
    try {
      const user = await collection.findOne({ name });
        
      if (!user) {
        return res.render('admin/result', { userNotFound: true, invalidtype: false });
      }
  
      if (user.type === 'student') {
        return res.render('admin/result', { user, userNotFound: false, invalidtype: false, subjects: user.subjects });
      } else if (user.type === 'staff') {
        const course = await courses.find({doctorname:name})
        return res.render('admin/result', { user, userNotFound: false, invalidtype: false, courses: course });
      } else {
        return res.render('admin/result', { userNotFound: false, invalidtype: true });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send('Server error');
    }
  });
//welocme to my webiste

//Student Functions
app.get("/student-subject",async(req,res)=>{
    const username = req.session.user.username
    const check = await collection.find({username:username})
    const dep = req.session.user.department
    const d = toLowerCaseString(dep)
    if(username){
        if(d == "cs"){
            const subjects = await courses.find({department:req.session.user.department})
            console.log(subjects)
            res.render("student/studentsubject",{subjects:subjects})
            
        }else if(d =="ai"){
            const subjects = await courses.find({department:req.session.user.department})
            console.log(subjects)
            res.render("student/studentsubject",{subjects:subjects})
        }else if(d =="it"){
            const subjects = await courses.find({department:req.session.user.department})
            console.log(subjects)
            res.render("student/studentsubject",{subjects:subjects})
        }else if(d == "all"){
            const subjects = await courses.find({department:req.session.user.department})
            res.render("student/studentsubject",{subjects:subjects})
        }
    }
})
app.post("/chosensubjects",async(req,res)=>{
    try{
        const subjects={
            name:req.body.coursename,
            code:req.body.code,         
        }
        const existcourse = await courses.findOne({code:req.body.code});
        const student = await collection.findOne({name:req.session.user.username});
        
        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }
        if(existcourse){
                if(existcourse.department == req.session.user.department && existcourse.level == req.session.user.level){
                        const isSubjectAdded = student.subjects.some(subject => subject.code === subjects.code);
                        if (isSubjectAdded) {
                                return res.send("Subject already added");
                        }
                        const subjectsInSemester = student.subjects.filter(subject => subject.semester === existcourse.semester);
                        if (subjectsInSemester.length >= 7) {
                            return res.send("Maximum number of subjects for this semester reached");
                        }else{
                            student.subjects.push({
                                name:req.body.coursename,
                                code:req.body.code,
                                presubject:existcourse.presubject,
                                semester: existcourse.semester,
                                year:existcourse.year
                            });
                            await student.save();  
                            
                            res.render('student/chosensubjects',{subject:student.subjects,student:student})  
                            
                        }  
                } else{
                    res.send("Cannot add this subject")
                }}       
        else{
            res.send("Wrond subject code")
        }
        

    }catch(err){
        console.log(err)
        //res.render("add-courses" , {title:"Add Course" , message:"Error adding course" , nav:admin_nav_bar})
    }
})
app.post('/delete-subject/:_id', async (req, res) => {
    const subjectId = req.params._id;

    try {
        // Log session data
        console.log('Session user:', req.session.user);
        

        // Log the name used in the query
        const studentName = req.session.user.username;
        console.log('Finding student with name:', studentName);

        // Fetch the student document based on the session user name
        const student = await collection.findOne({ name: studentName });

        if (!student) {
            console.log('Student not found');
            return res.render('student/studentpage', { student: {}, message: 'Student not found' });
        }

        // Log the student's current subjects
        console.log('Current subjects:', student.subjects);

        // Filter out the subject to be deleted
        const updatedSubjects = student.subjects.filter(subject => subject._id.toString() !== subjectId);

        // Log the updated subjects to ensure the filter is working correctly
        console.log('Updated subjects:', updatedSubjects);

        // Update the student document with the filtered subjects
        student.subjects = updatedSubjects;

        // Save the updated student document
        await student.save();

        // Log success message
        console.log('Subject deleted successfully');

        res.render('student/studentpage', { student, message: 'Subject deleted successfully' });
    } catch (error) {
        // Log the error
        console.error('Error deleting subject:', error);
        res.render('student/studentpage', { student: {}, message: 'An error occurred while deleting the subject' });
    }
});

// Route for students to view their grades
app.get("/grades", checkSignIn, async (req, res) => {
    try {
        const student = await collection.findOne({ name: req.session.user.username });
        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }

        

        // Render the student's grades view with the valid subjects and semesters
        res.render('student/grades', { subjects: student.subjects});
    } catch (error) {
        console.error('Error fetching student grades:', error);
        res.status(500).send('Internal Server Error');
    }
});




app.post("/student-grades",async(req,res)=>{
    const find = await collection.findOne({name:req.body.name})
    const subject = find.subjects
    console.log(subject)
    res.render("admin/studentgrades",{subject:subject})
})


app.use('/add-user',function(err, req, res, next){
    console.log(err);
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
})
app.use('/add-courses',function(err, req, res, next){
    console.log(err);
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
})
app.use('/all-users',function(err, req, res, next){
    console.log(err);
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
})
app.use('/all-courses',function(err, req, res, next){
    console.log(err);
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
})
app.use('/delete-user',function(err, req, res, next){
    console.log(err);
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
})
app.use('/delete-courses',function(err, req, res, next){
    console.log(err);
        //User should be authenticated! Redirect him to log in.
        res.redirect('/');
})






