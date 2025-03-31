const express = require("express");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize")
const bodyParser=require("body-parser");
const helmet =require("helmet");
const cors=require("cors");
const routes  = require("./Routes/index");
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 50,
	standardHeaders: 'draft-7', 
	legacyHeaders: false, 
})
const app = express();
app.use(express.json({limit:"10kb"}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use("/",limiter)
app.use(helmet());
app.use(mongoSanitize());
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: 'Content-Type, Authorization'
}))

app.use(routes)
module.exports = app;