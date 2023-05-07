const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_name:{ 
        type:String,
        default: ""
    },
    
});

const User = mongoose.model('User', userSchema);