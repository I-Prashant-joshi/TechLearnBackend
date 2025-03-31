const credential = require("../Controller/authController")

const route= require("express").Router()

route.post("/register-user",credential.register,credential.sendOtp)
route.post("/verify",credential.verifyotp)
route.post("/sendOtp",credential.sendOtp)
route.post("/forgot-password",credential.forgotPassword)
// route.post("/generate-password",credential.forgotPassword)



module.exports=route