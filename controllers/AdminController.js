import UserModel from "../Models/userModel.js";
import PostModel from "../Models/postModel.js"

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const adminRegister = async (req, res) => {

   const {firstname, lastname,username} = req.body
        const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPass;
  
    const newAdmin = new UserModel({firstname,lastname,username,password:hashedPass,isAdmin:true,Active:true});
  //  const newAdmin= new UserModel({username,password,...req.body});
   // const {username,password,...rest}=new UserModel(req.body)
    
   //const newAdmin={username,password,...rest}

   
  
    try {
    
      const admin = await newAdmin.save();
  
      const token = jwt.sign(
        {
          firstname: admin.firstname,
          id: admin._id,
        },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
      res.status(200).json({ admin, token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


  export const adminLogin = async (req, res) => {
    const { Email,password} = req.body;
  
    try {
      const admin = await UserModel.findOne({ Email:Email,isAdmin:true });
      console.log(admin);
  
      if (admin) {
        const validity = await bcrypt.compare(password, admin.Password);
  
        if (!validity) {
          res.status(400).json("Wrong password");
        } else {
          const token = jwt.sign(
            {
                email: admin.username,
              id: admin._id,
            },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
          );
  
          res.status(200).json({ admin, token });
        }
      } else {
        res.status(404).json("User does not exists");
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const adminUserList= async (req, res, next) => {
    try {
      const users = await UserModel.find().lean()
      
      res.status(200).json({ users })
     
    } catch (error) {
      console.log(error)
    }
  }

  export const blockUser=async(req,res,next)=>{
    try {
      const userId=req.body.userId
      
      console.log(req.body,"blicing")
      await UserModel.updateOne({_id:userId},
      {
        $set:{
          Active:false
        }
      })
      res.status(201).json({blockstatus: true})
    } catch (error) {
      res.status(500).json({ message: error.message})
    }
  }
 
  export const unblockUser=async(req,res,next)=>{
    try {
      const userId=req.body.userId
      console.log(req.body,"unblocking")
      await UserModel.updateOne({_id:userId},
      {
        $set:{
          Active:true
        }
      })
      res.status(200).json({blockstatus: false})
    } catch (error) {
      res.status(500).json({ message: error.message})
    }
  }
 

  
// export const getAllReports = async (req, res, next) => {
//   try {
//       await PostModel.find({ reportCount: { $not: { $eq: 0 } } }).then((result) => {
//         console.log(result,'resultresultresultresult');
//           res.status(201).json({ status: true, reports: result, message: 'get all reports' })
//       })
//   } catch (error) {

//   }
// }



export const removePost = async (req, res) => {
  try {
    console.log(req.body, "post reqbody");
    const { postId } = req.body;
    await post.deleteOne({ postId }).then((response) => {
      console.log(response, "response");
      res.status(200).json({ success: true, postId, message: "Post removed" });
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Can't delete post" });
  }
};

//show reported posts for admin

export const getReportedPosts = async(req,res) =>{
  const posts = await PostModel.find()
  const reportedPosts = posts.filter((post)=>post.reports.length > 0)
  //console.log(posts,'posts',reportedPosts,'posts with reports')
  res.status(200).json(reportedPosts)
}

export const reportedPostRemove = async(req,res) => {
  console.log("evide ethiyo");
  const postId = req.params.id
  try {
      const removedFieldUpdate = await PostModel.findById(postId)
      console.log(removedFieldUpdate,"updatttttttt")
    
      if(removedFieldUpdate.removed){
          const response = await removedFieldUpdate.updateOne({$set:{removed:false}})
          console.log(response,"post unblicked")
          res.status(200).json("post unblocked")
      }else{
          const response = await removedFieldUpdate.updateOne({$set:{removed:true}})
          
          
          res.status(200).json("post blocked successfully")

      }
      
  } catch (error) {
      res.status(500).json(error)
  }
}