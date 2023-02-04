import mongoose from "mongoose";
const userOtpVerificationSchem=mongoose.Schema(
    {
        userId:String,
        otp:String,
        createdAt:Date,
        expiredAt:Date,
    }
)
const otpModel=mongoose.model("otp",userOtpVerificationSchem)
export default otpModel