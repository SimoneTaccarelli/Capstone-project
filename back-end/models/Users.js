import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    firebaseUid:{
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match:/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    profilePic : {
        type: String,
    },
    
},{timestamps: true});

const User = mongoose.model("User", userSchema);
export default User;