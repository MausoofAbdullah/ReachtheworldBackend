import mongoose from "mongoose";
const {ObjectId}=mongoose.Schema;

const postSchema=mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
          },
        desc:String,
        likes:[],
        image:String,
        removed:{
            type:Boolean,
            default:false
        },
        comments:[{
            commentedUser:{
                type:String,
                required: true
            },
            comment:{
                type:String,
                required:true
            },
            time:{
                type: Date,
                required: true
            },
            user:{
                type:String,
                required:true
            },
            // report:[
            //     {
            //         id:{
            //             type:ObjectId,
            //             ref:"users",
                    
            //         },
            //         savedAt:{
            //             type:Date,
            //             required:true
            //         }
            //     }
            // ]
           
            
        }],

        //reports working
        // reports:{
        //     type: Array,
        //     default: [],
        //   },
        //   reportcount:{
        //     type:Number,
        //     default:0
        //   }

        reports:[{
            reportedUser:{
                type:String,
                required:true
            },
            reason:{
                type:String,
                required:true
            }
        }]
    },
    {
        timestamps:true
    }
)
const PostModel=mongoose.model("posts",postSchema)
export default PostModel