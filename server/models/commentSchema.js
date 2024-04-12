const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text:{
        type:String,
        required:true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'USER',
        required:true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'POST',
        required: true
    }
});


const Comment = new mongoose.model("COMMENT",commentSchema);

module.exports = Comment;