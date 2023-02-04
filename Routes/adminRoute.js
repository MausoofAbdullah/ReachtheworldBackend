import express from "express"
import {adminRegister,adminLogin,adminUserList,blockUser,unblockUser,getReportedPosts,reportedPostRemove} from "../controllers/AdminController.js"

const router=express.Router()

router.post('/',adminRegister)
router.post('/login',adminLogin)
router.get('/user-list',adminUserList)

router.post('/block-user',blockUser)
router.post('/unblock-user',unblockUser)

router.post('/getreportedposts',getReportedPosts)
router.post('/reportedpostremove/:id',reportedPostRemove)


// router.get('/reports', getAllReports)
// router.delete('/remove-post',removePost)
export default router