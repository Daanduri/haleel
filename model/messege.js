const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_id:{ 
        type:mongoose.Schema.Types.ObjectId,
        default: ""
    },
    chatt:{
        type:String,
        default: ""
    }
    
});

const User = mongoose.model('messege', userSchema);