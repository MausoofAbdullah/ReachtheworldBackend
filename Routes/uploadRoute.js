import express from "express"
const router=express.Router()
import multer from "multer"
const storage = multer.diskStorage({
    destination: (req, file, cb)=> {
      cb(null, "public/images")
    },
    filename:  (req, file, cb)=> {
      cb(null,  req.body.name)
    }
  })
  //const upload = multer({ storage: storage })

  //image validation
  const upload = multer({ storage: storage ,
  fileFilter:(req,file,cb)=>{
    console.log(file,'file');
    // var ext = path.extname(file.originalname);
  //   if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
  //     return cb(new Error('Only images are allowed'))
  // }
    if(file.mimetype=="image/png" || file.mimetype=="image/jpg" || file.mimetype=="image/jpeg"){
      cb(null,true)
    }
    else{
      cb(null,false)
      return cb(new Error('only .png, .jpg, .jpeg format allowed'))
    }
  }})


  router.post('/',upload.single("file",(req,res)=>{
    try {
        return res.status(200).json("file uploaded successfully")
    } catch (error) {
      res.status(500).json('pls upload valid file')
        console.log(error)
    }
  }))
  export default router