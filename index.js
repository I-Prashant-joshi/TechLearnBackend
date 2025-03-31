const app = require("./app")
const http= require("http")
const server= http.createServer(app)
const env=require("dotenv").config();
const port = process.env.PORT || 6000
console.log("port ===>",port)
const mongoose= require("mongoose")
mongoose.connect(process.env.ConUrl).then(()=>{
    console.log("connected Sucessfully with the database")
},(err)=>{console.log(err)})

process.on("uncaughtException",(err)=>{
    console.log(err);
    process.exit(1);
 })
 process.on("unhandledRejection",(err)=>{
    console.log(err);
    server.close(()=>
    process.exit(1)
    )
 })

server.listen(port,(req,res)=>{
    console.log("server started successfully")
    
})