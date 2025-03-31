const mongoose= require("mongoose")
const bcrypt = require('bcrypt');
var CryptoJS = require("crypto-js");

const userSchema= new mongoose.Schema({
    username:{
        type:String,
        required:[true,"Please enter your username"],
    },
    email:{
        type:String,
        required:[true,"Please enter your email"]
    },
    password:{
        type:String,
        required:[true,"Please enter the password"]
    },
    otp:{
        type:String,
    },
    otp_expiry_time:{
        type:Date,
    },
    verified:{
        type:Boolean,
        default:false,
    },
    passwordResetToken:{
        type:String
    },
    passwordTokenExpire:{
        type:Date
    },
    profileUrl:{
        type:String,
        default:""
    },
    role:{
        type:String,
        enum:["instructor","student"],
        default:"student"

    },
    enrolledCourses:[{
        type:mongoose.Schema.ObjectId,
        ref:"Course"
    }]
},
{
    timestamps:true
}
)
userSchema.methods.checkotp= async function (candidateOtp,userOtp){
    try{
        return await bcrypt.compare(candidateOtp,userOtp);
    }catch(error){
        console.log("err",error);
        
    }
 }
 userSchema.methods.checkotp= async function (candidateOtp,userOtp){
    
    return await bcrypt.compare(candidateOtp,userOtp);
 }

 userSchema.methods.CreateResetToken= async function(){
    const randomNumber = CryptoJS.lib.WordArray.random(16);
    const resettoken = randomNumber.toString(CryptoJS.enc.Hex);
    const token = CryptoJS.AES.encrypt(resettoken, process.env.seceretKey).toString();
    this.passwordResetToken = token;
    this.passwordTokenExpire= Date.now()+10*60*1000;
    await this.save();
    return token;
   
 }

const UserModel= mongoose.model("User",userSchema)
module.exports=UserModel