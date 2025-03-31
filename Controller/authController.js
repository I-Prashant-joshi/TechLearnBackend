const UserModel = require("../Modal/User")
const filterObj = require("../Utils/filterObj")
const otpGenerator = require("otp-generator");
const mail = require("../Services/mailer");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
function signToken(userId){
  return jwt.sign({userId},process.env.jwtToken,{expiresIn:"1d"});
}
const register=async(req,res,next)=>{
    try{
        const {username,email,password}=req.body
        const existingUser=await UserModel.findOne({email})
        
        const filterData=filterObj(req.body,"username","email","password")

        if(existingUser && existingUser.verified){
            res.status(400).json({error:"Email is already in use"})
          }
          
          else if(existingUser){
            const update= await UserModel.findOneAndUpdate({email},{filterData},{new:true,validateModifiedOnly:true})
            req.userId=existingUser._id;

            next()
        }
        else{
            const newUser= await UserModel.create(filterData)
            req.userId=newUser._id
            next()
        }
    }
    catch(error){
        console.log(error)
    }
}
const sendOtp=async(req,res)=>{
    const {userId}=req;
    //Generate Otp
    const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false ,lowerCaseAlphabets:false});
    console.log("🚀 ~ exports.sendOtp=async ~ otp:", otp)
    let otpExpiryTime= Date.now() + 10*60*1000;
    const hashedOtp = await bcrypt.hash(otp,12)
  await UserModel.findByIdAndUpdate(userId,{
    otp:hashedOtp,
    otp_expiry_time:otpExpiryTime,
  })
   const userData= await UserModel.findOne({_id:userId})
    const email=userData.email;
    const sub="Email verification";
    const text=`<b><h4> Your OTP for verification is  ${otp} . OTP is valid for 10 min only  </h4>`
  //send mail
  if(userData){
  mail.sendMail({
    email,
    sub,     
    text
   }).then(()=>
   res.status(200).json({
    status:"success",
    message:"Otp sent successfully"
   })
   ).catch((error) => {
    res.status(400).json({
      status:"error",
      message:"Failed to send mail"
     })
   }
   )
   
  }
  else{
    res.status(400).json({
      status:"error",
      message:"There is an issue"
     })
  }
}
const forgotPassword= async(req, res, next)=>{
  const user= await UserModel.findOne({email:req.body.email});
  if(!user)
  {
    res.status(400).json({
      status:"error",
      message:"There is no user for the given email"
    })
    return;
  }
  const token = await user.CreateResetToken();
  const url=`http://localhost:3000/auth/generatePassword?code=${token}`;
  try {
    // mail to be send 
    const email=req.body.email;
    const sub="Free Chat";
    const text=url;
    if(token){
      mail.sendMail({
        email,
        sub,
        text
       }).then(()=>
       res.status(200).json({
        status:"success",
        message:"Reset Password link sent successfully"
      })
       ).catch((error) => {
        res.status(400).json({
          status:"error",
          message:"Failed to send mail"
         })
       }
       )
       
      }
      else{
        res.status(400).json({
          status:"error",
          message:"There is an issue"
         })
      }
  
    
  } catch (error) {
    user.passwordResetToken=undefined;
    user.passwordTokenExpire=undefined;
    await user.save({validateBeforeSave:false})
    console.log(error);
    res.status(500).json({
      status:"success",
      message:"There is an error in sending the mail",
    })
  }
}

const verifyotp = async(req,res,next) => {
  const {email,otp}= req.body;
  console.log("verifyyy ====>",email,otp);
  
  const userData= await UserModel.findOne(
    {
      email,
      otp_expiry_time:{$gt:Date.now()}
    })

    if(!userData){
      res.status(400).json({
        status:"error",
        message:"Email is not valid or otp expired"
      })
      return;
    }
   
if(userData.otp==undefined){
  res.status(400).json({
    status:"error",
    message:"Please register first"
  })
  return  
}

  if(!await userData.checkotp(otp,userData.otp)){
    
    res.status(400).json({
      status:"error",
      message:"Otp is invalid"
    })
    return
  }

    userData.verified=true;
    userData.otp=undefined;
    await userData.save({new:true, validateModifiedOnly:true});
    const token= signToken(userData._id);

    res.status(200).json({
        status:"success",
        message:"OTP verified successfully",
        token,
        userId:userData._id
    })

}


module.exports={register,sendOtp,verifyotp,forgotPassword}