import chatModel from "../Models/chatModel.js";
import mongoose from "mongoose";

export const createChat=async(req,res)=>{
//     const newChat= new chatModel({
//         members:[req.body.senderId,req.body.recieverId]
//     })
//     try {
//         const result= await newChat.save()
//         console.log(result,"rsltttttttttt")
//         res.status(200).json(result)
//     } catch (error) {
//         res.status(500).json(error)
//     }
// }


try {
    const chatExist = await await chatModel.findOne({
        members:{$all:[req.body.senderId,req.body.receiverId]}
    })
    if(chatExist){
        return res.status(400).json({message:"chat already exist"})
    }
    const newChat = new chatModel({
        members: [req.body.senderId,req.body.receiverId]
    })
    const result = await newChat.save();
    res.status(200).json(result);
} catch (error) {
    res.status(500).json(error)
}
}

export const userChats=async(req,res)=>{
    try {
        const chat=await chatModel.find({
            members:{$in:[req.params.userId]}
        })
        res.status(200).json(chat)
    } catch (error) {
        res.status(500).json(error)
        
    }
}


export const findChat=async(req,res)=>{
        try {
            const chat=await chatModel.findOne({
                members:{$all:[req.params.firstId,req.params.secondId]}
                
            })
            
        res.status(200).json(chat)

        } catch (error) {
        res.status(500).json(error)
            
        }
}