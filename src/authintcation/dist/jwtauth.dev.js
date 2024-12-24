"use strict";

var jwt = require("jsonwebtoken");

exports.cookieJwtAuth = function (req, res, next) {
  try {
    var user = jwt.verify(token, process.env.MY_SECRET_TOKEN);
    req.user = user;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.redirect("/");
  }
};