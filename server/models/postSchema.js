const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    caption:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'USER',
        required:true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'USER'
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'COMMENT'
        }
    ]
})


const Post = new mongoose.model("POST",postSchema);

module.exports = Post;