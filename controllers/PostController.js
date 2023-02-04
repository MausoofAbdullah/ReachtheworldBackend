import PostModel from "../Models/postModel.js";
import mongoose from "mongoose";
import UserModel from "../Models/userModel.js";

//create new post

export const createPost= async(req,res)=>{
  
  console.log(req.body,"ffffffffff")
    const newPost= new PostModel(req.body)


    try {
        await newPost.save()
        res.status(200).json(newPost)
    } catch (error) {
        res.status(500).json(error)
    }
}

//get post

export const getPost= async(req,res)=>{
    const id=req.params.id
    try {
       const post=await PostModel.findById(id) 
       res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

//update post
 export const updatePost=async(req,res)=>{
    const postId=req.params.id
    const {userId}=req.body
    try {
        const post=await PostModel.findById(postId)
        if(post.userId===userId){
            await post.updateOne({ $set:req.body})
            res.status(200).json("post updated")
        }else{
            res.status(403).json("action forbidden")
        }
    } catch (error) {
       res.status(500).json(error) 
    }
 }

 //delete post

 
// export const deletePost = async (req, res) => {
//     try {
//         const { postId } = req.body
//         console.log(postId, 'postid');
  
  
//         let deletePost = await PostModel.deleteOne({ _id: postId })
//         if (deletePost) {
            
  
//             res.status(200).json({  message: " Post deleted", success: true });
  
//         } else {
//             console.log("error");
//         }
  
  
  
//     } catch (error) {
//         res.status(500).json("hello" + error.message);
//     }
//   }
  

//  export const deletePost= async(req,res)=>{
//     const id =req.params.id
//     const {userId}=req.body

//     try {
//        const post=await PostModel.findById(id)
//        if(post.userId===userId){
//         await post.deleteOne()
//         res.status(200).json("post deleted successfully")
//        } 
//        else{
//         res.status(403).json("action forbidden")
//        }
//     } catch (error) {
//         res.status(500).json(error)
//     }
//  }

 //like and dislike a post

 export const likePost= async(req,res)=>{
        const id=req.params.id
        const {userId}=req.body

        try {
            const post=await PostModel.findById(id)
         
            if (post.likes.includes(userId)) {
              await post.updateOne({ $pull: { likes: userId } });
              res.status(200).json("Post disliked");
            }else {
                await post.updateOne({ $push: { likes: userId } });
                res.status(200).json("Post liked");
              }
        } catch (error) {
            res.status(500).json(error)
        }
 }

 // get timeline post

 export const getTimelinePosts=async (req,res)=>{
    const userId=req.params.id
    try {
        
        const currentUserPosts=await PostModel.find({userId: userId})
        const followingPosts=await UserModel.aggregate([
            {
                $match:{
                    _id: new mongoose.Types.ObjectId(userId) 
                }
            },
            {
                $lookup:{
                    from:"posts",
                    localField:"following",
                    foreignField:"userId",
                    as:"followingPosts"
                }
            },
            {
                $project:{
                    followingPosts:1,
                    _id:0
                    
                }
            }
        ])
        
        res.status(200).json(currentUserPosts.concat(...followingPosts[0].followingPosts)
        .sort((a,b)=>{
            return b.createdAt-a.createdAt
        }))
        
    } catch (error) {
        res.status(500).json(error) 
    }
 }

 export const commentPost= async (req, res, next) => {
     const comment = req.body;
     console.log(req.params.id);
     console.log(comment,"comment server pao");
    try {
        const post = await PostModel.findById(req.params.id)
        const commentData = await post.updateOne({$push:{comments:comment}})
        console.log(commentData);
        res.status(200).json(commentData)
    } catch (error) {
        res.status(500).json(error) 
    }
  }
  // delete a comment

export const deleteComment = async(req,res)=>{
    const {commentId} = req.body
    console.log(commentId,'hei')
    const post = await PostModel.findById(req.params.id)
    console.log(post)
    const removeComment = await post.updateOne({$pull:{comments:{_id:commentId}}})
}



export const deletePost = async(req,res)=> {
    const id = req.params.id
    
    const userId = req.body.currentUser;
  
    try {
        const post = await PostModel.findById(id)
        if(post.userId === userId){
            await post.deleteOne();
            res.status(200).json("Post deleted successfully")
        }else{
            res.status(403).json("Action forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

// export const reportPost = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { loggedInUserId } = req.body;
//         console.log(req.body,"reporting post req.body")
//         const post = await PostModel.findById(id);
//         const isReported = post.report.get(loggedInUserId);

//         if (isReported) {
//             console.log("once reported");
//         } else {
//             post.report.set(loggedInUserId, true);
//         }

//         const updatedPost = await PostModel.findByIdAndUpdate(
//             id,
//             { report: post.report },
//             { new: true }
//         );

//         res.status(200).json(updatedPost);
//     } catch (err) {
//         res.status(409).json({ message: err.message });
//     }
// }


// export const reportPost = async (req, res) => {
//     try {
//       const { postId } = req.params;
//       console.log(postId,"postid report")
  
//      const body = req.body;
//     // console.log(body,"report obj bodyh")
//       const obj = {
//         reason: body.reason,
//         reporterId: body.reporterId,
//         date: new Date(),
//       };
//      console.log(obj, "kkkkjkjk");
//       const postDetails = await PostModel.findOne({_id: postId });
//       console.log(postId,"new postid for checking")
//     console.log(postDetails,'3d........')
//       const userExists = postDetails.reports.find(
//         (report) => {
//           console.log(report.reporterId,'....................',obj.reporterId)
//           return report.reporterId === obj.reporterId
//         }
//       );
//     //  console.log(userExists,'231231414124');
//       if (userExists) {
//         res.status(200).json({
//           success: false,
//           message: "post is already reported",
//         });
//       } else {
//       await postDetails.updateOne(
//           {
//             $push: {
//               reports: obj,
//             },
//             $inc: {
//               reportCount: 1,
//             },
//           }
//         );
  
//       const hosapost= await postDetails.save();
//     //  console.log(hosapost,"hosa post")
//         // .then((response) => {
//         res.status(201).json({ status: true, message: "Report submitted" });
//         // })
//       }
//     } catch (error) {}
//   };

//report post S

export const reportPost = async(req,res) =>{
  const id = req.params.id
  console.log(id,'heloo')
  console.log(req.body,'report post')
  
  const response = await PostModel.findByIdAndUpdate(id,{$push:{reports:req.body}})
}