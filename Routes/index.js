const route = require("express").Router()
const authController=require("./auth")

route.use("/auth",authController)
module.exports=route
