import mongoos from "mongoose";

const userSchema = new mongoos.Schema({
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
    role:{
        type: String,
        enum: ['Admin', 'User'],
        default: 'User',
    },
    
},{timestamps: true});

const User = mongoos.model("User", userSchema);
export default User;