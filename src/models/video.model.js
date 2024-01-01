const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema(
    {
       video:{
        type:String ,
        required: true ,
    },
    thumbnail:{
        type:String ,
        required: true ,
    },     
    title:{
        type:String ,
        required: true ,
    },
    description:{
        type:String ,
        required: true ,
    },
    duration :{
        type :Number ,
        required: true ,
    } ,
    views :{
        type : Number ,
        default:0
    },
    ispublished:{
        type:Boolean ,
        default: true
    } ,
    owner :{
        type : Schema.Types.ObjectId,
        ref : "User"
    }

},{thumbnail : true}
)

module.exports = mongoose.model('Video' , videoSchema)