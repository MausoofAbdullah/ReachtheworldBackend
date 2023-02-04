import express  from "express";
import { createPost, deletePost, getPost, getTimelinePosts, likePost, updatePost,commentPost,deleteComment,reportPost } from "../controllers/PostController.js";
const router=express.Router()
import authMiddleware from "../middleware/authMiddleware.js"


router.post('/',createPost)
router.get('/:id',getPost)
router.put('/:id',updatePost)
//router.delete("/:id",deletePost)
router.put('/:id/comment-post', commentPost)
router.post("/:id/post-delete", deletePost);
//router.post('/:postId/report-post', reportPost)
router.post('/reportpost/:id',reportPost)

router.put('/:id/like',likePost)
router.get("/:id/timeline",getTimelinePosts)
router.post('/:id/deleteComment',deleteComment)
export default router