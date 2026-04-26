import e from 'express';
import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    fullName : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    }, 
    phoneNumber : {
        type : String,
        required : true
    }, 
    trustedContacts : [{
        name : String,
        phoneNumber : String,
        email : String  
    }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;