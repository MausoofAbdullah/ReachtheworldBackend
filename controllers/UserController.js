import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//getAll user
export const getAllUser=async(req,res)=>{
  try {
    let users=await UserModel.find()
    users=users.map((user)=>{
      const {password,...otherDetails}=user._doc
     // console.log(user._doc,"documents")
      return otherDetails
    })
    res.status(200).json(users)
  } catch (error) {
    res.status(500).json(error)
  }
}


//get user

export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await UserModel.findById(id);
    if (user) {
      const { password, ...otherDetails } = user._doc;
      res.status(200).json(otherDetails);
    } else {
      res.status(400).json("no such user exists");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

//update user

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { _id, currentUserId, currentUserAdminStatus, password } = req.body;
  console.log(id,req.body,"try")
  console.log(password,"specifically passwoerd")

  if (id === _id) {
    try {
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(password, salt);
      }
      const user = await UserModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      console.log(user,"traagain")
      const token = jwt.sign(
        { username: user.username, id: user._id },
        process.env.JWT_KEY,{expiresIn:"1h"}
      );
      res.status(200).json(user,token);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("access denied, you can only update your profile");
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const { currentUserId, currentUserAdminStatus } = req.body;
  if (id === currentUserId || currentUserAdminStatus) {
    try {
      await UserModel.findByIdAndDelete(id);
      res.status(200).json("user deleted successfully");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("access denied, you can only delete your profile");
  }
};

//follow user and following user

export const followUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;
  if (id === _id) {
    res.status(403).json("action forbidden");
  } else {
    try {
      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(_id);

      if (!followUser.followers.includes(_id)) {
        await followUser.updateOne({ $push: { followers: _id } });
        await followingUser.updateOne({ $push: { following: id } });
        res.status(200).json("user followed");
      } else {
        res.status(403).json("user is already followed by you!");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

//unfollow a user

export const unfollowUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;
  if (id === _id) {
    res.status(403).json("action forbidden");
  } else {
    try {
      const unFollowUser = await UserModel.findById(id);
      const unFollowingUser = await UserModel.findById(_id);

      if (unFollowUser.followers.includes(_id)) {
        await unFollowUser.updateOne({ $pull: { followers: _id } });
        await unFollowingUser.updateOne({ $pull: { following: id } });
        res.status(200).json("user unfollowed");
      } else {
        res.status(403).json("user is not followed by you!");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

//searching users

export const getUserData = async(req,res)=>{
  const {data} = req.body
  console.log(data)
  const peopleData = await UserModel.find({"firstname":new RegExp(data,'i')})
  res.json(peopleData.slice(0, 10))
  console.log(peopleData,'hello from getuserdata')
}

// export const searchUser = async (req, res) => {
//   try {
//     const keyword = req.query.name || "";
//     const users = await UserModel.find({
//       $or: [
//         { username: { $regex: keyword, $options: "i" } },
//         { firstname: { $regex: keyword, $options: "i" } },
//         { lastname: { $regex: keyword, $options: "i" } },
//       ],
//     }).select({ username: 1, firstname: 1, lastname: 1, profilePicture: 1 });
//     res.status(200).json(users);
//   } catch (err) {
//     console.log(err);
//   }
// };