import mongoose from "mongoose";
const chatSchema=mongoose.Schema(
    {
        members:{
            type:Array
        },
        // timestamp: {
        //     type: Date,
        //     default: Date.now,
        //   },
    },
    {
        timestamps:true
    }
)

const chatModel=mongoose.model("chats",chatSchema)
export default chatModel