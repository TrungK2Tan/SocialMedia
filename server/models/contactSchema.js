const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    follower:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'USER'
    },
    followed:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'USER'
    },
   
})


const Contacts = new mongoose.model("CONTACT",contactSchema);

module.exports = Contacts;