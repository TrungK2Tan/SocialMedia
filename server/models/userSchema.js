const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    image: {
        type: String // Đây là một ví dụ, bạn có thể điều chỉnh loại dữ liệu tùy theo nhu cầu của bạn, ví dụ như String để lưu trữ URL của hình ảnh hoặc Buffer để lưu trữ dữ liệu hình ảnh trực tiếp.
    }
})


const Users = new mongoose.model("USER",userSchema);

module.exports = Users;