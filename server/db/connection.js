const mongoose = require('mongoose');
const db = `mongodb+srv://trungtan25112k2:9OmUjxxkie0oBxgx@cluster0.7xajidb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(db,{
    useNewUrlParser:true,
    useUnifiedTopology:true

}).then(() =>{
    console.log('database connected successfully');
}).catch((e)=>{
    console.log(e,'<=error');
})