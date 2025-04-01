import User from '../models/Users.js';
import admin from 'firebase-admin';

export async function freshRegister(request, response, next) {
    const {email, firstName, lastName} = req.body;
    try {
        const user = await User.create({email, password, firstName, lastName});
        response.status(201).json(user);
    } catch (error) {
        response.status(400).json({error: error.message});
    }
}

export async function loginGoogle(request, response, next) {
    const {token} = request.body;
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const {uid, email} = decodedToken;
        const displayName = decodedToken.name || '';
        
        // Estrai firstName e lastName dal displayName
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        let user = await User.findOne({firebaseUid: uid});
        
        if (!user) {
            user = await User.create({
                firebaseUid: uid, 
                email, 
                firstName, 
                lastName
            });
        }
        
        response.status(200).json(user);
    } catch (error) {
        console.error("Firebase token verification error:", error);
        response.status(401).json({error: "Unauthorized"});
    }
}

export async function readUser (request , response, next){
    const token = request.headers.authorization?.split(" ")[1];

    if (!token) {
        return response.status(401).json({error: "Unauthorized"});
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const user = await User.findOne({firebaseUid: decodedToken.uid});
        
        if (!user) {
            return response.status(404).json({error: "User not found"});
        }
        
        response.status(200).json(user);
    } catch (error) {
        response.status(401).json({error: error.message});
    }
}

export async function login (request , response, next){
}