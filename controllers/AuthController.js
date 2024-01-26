import UserModel from "../Models/userModel.js";
import otpModel from "../Models/otpModel.js";
import bcrypt,{genSalt} from "bcrypt";
import jwt from "jsonwebtoken";
import nodeMailer from "nodemailer"

import { sendOtpVerificationEmail } from "../service/nodemailer.js";




//Registering new user
export const registerUser = async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.password, salt);
  req.body.password = hashedPass;
  req.body.verified=false


//Registering new user
// export const registerUser = async (req, res) => {
  // const salt = await bcrypt.genSalt(10);
  // const hashedPass = await bcrypt.hash(req.body.password, salt);
  // req.body.password = hashedPass;


   const newUser = new UserModel(req.body);
   const { username } = req.body;
   //console.log(req.body,"what is in it")
   
  

  try {
    const oldUser = await UserModel.findOne({ username });
    

    if (oldUser) {
      return res
        .status(400)
        .json({ message: "username is already registered" });
    }

    const user = await newUser.save();
    
    console.log(user, "register user");
    await sendOtpVerificationEmail(user, res)


 
    // const token = jwt.sign(
    //   {
    //     username: user.username,
    //     id: user._id,
    //   },
    //   process.env.JWT_KEY,
    //   { expiresIn: "1h" }
    // );
    // res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//verifying user for otp


//login user before otp trying

export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username: username });
    if (user) {
      const validity = await bcrypt.compare(password, user.password);
      if(user.Active===false){
        res.status(400).json("You donot have permission")
      }

      // validity?res.status(200).json(user):res.status(400).json("wrong Password")
      else if (!validity) {
        res.status(400).json("wrong password");
      } else {
        const token = jwt.sign(
          {
            username: user.username,
            id: user._id,
          },
          process.env.JWT_KEY,
          { expiresIn: "1h" }
        );
       
        res.status(200).json({ user, token });
        // console.log(user,"gap",token,"login");
      }
    } else {
      res.status(400).json("user does not exist");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//forgot password

export const forgotPassword=async(req,res)=>{
  const {username}=req.body
  try {
    const user=await UserModel.findOne({username:username})
    if(user){
      await sendOtpVerificationEmail(user, res)
    }else{
      res.status(400).json("user does not exist")
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
    
  }
}
//otpverification

export const verifyotp = async (req, res) => {
  try {
    let { userId, otp } = req.body;
    if (!userId || !otp) {
      throw Error("Empty otp details are not allowed");
    } else {
      const userOTPVerificationRecords = await otpModel.find({ userId });
      if (userOTPVerificationRecords.length <= 0) {
        //no records found
        throw new Error(
          "Account record doesn't exist or have been verified already, Please signup or login"
        );
      } else {
        const { expiresAt } = userOTPVerificationRecords[0];
        const hashedOTP = userOTPVerificationRecords[0].otp;

        if (expiresAt < Date.now()) {
          //user otp record has expired
          await otpModel.deleteMany({ userId });
          throw new Error("Code has expired. Please request again.");
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);
          if (!validOTP) {
            // supplied otp is wrong
            throw new Error("Invalid code passed. Check your inbox.");
          } else {
            // UserModel.updateOne({_id:userId},{verified:true})
            await UserModel.findOneAndUpdate(
              { _id: userId },
              { $set: { verified: true } }
            );
            const user = await UserModel.findById({ _id: userId });
            console.log(user);
            await otpModel.deleteMany({ userId });
            const token = jwt.sign(
              {
                username: user.username,
                id: user._id,
              },
              process.env.JWT_KEY,
              { expiresIn: "1h" }
            );
            res.status(200).json({ user, token });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
};

// resend verification otp during signup

export const resendotp = async (req, res) => {
  try {
    let { userId, username } = req.body;

    if (!userId || !username) {
      throw Error("Empty user details are not allowed");
    } else {
      // delete existing records and resend
      await otpModel.deleteMany({ userId });
      sendOtpVerificationEmail({ _id: userId, username: username }, res);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
};

//Nodemailer stuff



// send email Link For reset Password
export const resetPassword=async(req,res)=>{
  
  const username = req.body;
  console.log(username,"is this")

  if(!username.username){
      res.status(401).json({status:401,message:"Enter Your Email"})
  }

  try {
      const userfind = await UserModel.findOne({username:username.username});
      console.log(userfind,"find user")
      

      // token generate for reset password
      const token = jwt.sign({_id:userfind._id},  process.env.JWT_KEY,{
          expiresIn:"1h"
      });
      
      
      const setusertoken = await UserModel.findByIdAndUpdate({_id:userfind._id},{verifytoken:token},{new:true});
console.log(setusertoken,"set")


      if(setusertoken){
          const mailOptions = {
              from:"otp.nms@gmail.com",
              to:username.username,
              subject:"Sending Email For password Reset",
              // text:`This Link Valid For 2 MINUTES http://localhost:3000/newpassword/${userfind.id}/${setusertoken.verifytoken}`
              text:`This Link Valid For 2 MINUTES https://client-reachtheworld.vercel.app/newpassword/${userfind.id}/${setusertoken.verifytoken}`

          }
          let transporter = nodeMailer.createTransport({
            service: "gmail",
            auth:{
              user: process.env.FROM_EMAIL,
              pass: process.env.FROM_PASSWORD
            }
          })

          transporter.sendMail(mailOptions,(error,info)=>{
              if(error){
                  console.log("error",error);
                  res.status(401).json({status:401,message:"email not send"})
              }else{
                  console.log("Email sent",info.response);
                  res.status(201).json({status:201,message:"Email sent Successfully"})
              }
          })

      }

  } catch (error) {
      res.status(401).json({status:401,message:"invalid user"})
  }

};


// verify user for forgot password time
export const newpassword=async(req,res)=>{
  const {id,token} = req.params;
  console.log(id,token," lets check for id and token")

  try {
      const validuser = await UserModel.findOne({_id:id,verifytoken:token});
      
      const verifyToken = jwt.verify(token,process.env.JWT_KEY);

      console.log(verifyToken)

      if(validuser && verifyToken._id){
          res.status(201).json({status:201,validuser})
      }else{
          res.status(401).json({status:401,message:"user not exist"})
      }

  } catch (error) {
      res.status(401).json({status:401,error})
  }
};

//change password

export const changepassword=async(req,res)=>{
  const {id,token} = req.params;
 


  const {password} = req.body;
  console.log(req.body,"for qer body")

  try {
    const validuser = await UserModel.findOne({_id:id,verifytoken:token});
  
      
      
      const verifyToken = jwt.verify(token,process.env.JWT_KEY);
      console.log("inside verify token")

      console.log(verifyToken,"is he valid")
      if(validuser && verifyToken._id){
         // const newpassword = await bcrypt.hash(password,12);
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);



          const setnewuserpass = await UserModel.findByIdAndUpdate({_id:id},{password:hashedPass});
          console.log(setnewuserpass,"newp password set")

          setnewuserpass.save();
          res.status(201).json({status:201,setnewuserpass})

      }else{
          res.status(401).json({status:401,message:"user not exist"})
      }
  } catch (error) {
      res.status(401).json({status:401,error})
  }
}