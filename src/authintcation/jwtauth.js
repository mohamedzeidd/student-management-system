const jwt = require("jsonwebtoken")

exports.cookieJwtAuth = (req,res,next) =>{
    try{
        const user = jwt.verify(token,process.env.MY_SECRET_TOKEN);
        req.user = user;
        next()
    }catch(err){
        res.clearCookie("token")
        return res.redirect("/")
    }
}
