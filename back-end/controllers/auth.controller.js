import Administrator from '../../front-end/itoko/src/pages/Administrator.js';
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
                lastName,
                profilePic: `https://ui-avatars.com/api/?background=8c00ff&color=fff&name=${firstName}+${lastName}` // Assuming you want to store the profile picture URL
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

export async function logout (request , response, next){
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) {
        return response.status(401).json({error: "Unauthorized"});
    }
    try {
        await admin.auth().verifyIdToken(token);
        response.status(200).json({message: "Logout successful"});
    } catch (error) {
        response.status(401).json({error: error.message});
    }
}

export async function deleteUser (request , response, next){
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) {
        return response.status(401).json({error: "Unauthorized"});
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        await User.deleteOne({firebaseUid: decodedToken.uid});
        response.status(200).json({message: "User deleted successfully"});
    } catch (error) {
        response.status(401).json({error: error.message});
    }
}

export async function updateUser (request , response, next){
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) {
        return response.status(401).json({error: "Unauthorized"});
    }
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const {firstName, lastName} = request.body;
        const user = await User.findOneAndUpdate(
            {firebaseUid: decodedToken.uid},
            {firstName, lastName},
            {new: true}
        );
        
        if (!user) {
            return response.status(404).json({error: "User not found"});
        }
        
        response.status(200).json(user);
    } catch (error) {
        response.status(401).json({error: error.message});
    }
}

export async function isAdministrator (request, response, next) {
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
        
        if (user.role !== 'Admin') {
            return response.status(403).json({error: "Forbidden"});
        }
        
        response.status(200).json(user);
    } catch (error) {
        response.status(401).json({error: error.message});
    }
}

export const verifyToken = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({error: "Unauthorized"});
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({firebaseUid: decodedToken.uid});
      
      if (!user) return res.status(404).json({error: "User not found"});
      
      // Allega l'utente alla richiesta per i middleware successivi
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({error: "Token non valido"});
    }
  };
  
  export const isAdmin = (req, res, next) => {
    // req.user è stato aggiunto dal middleware verifyToken
    if (req.user?.role !== 'Admin') {
      return res.status(403).json({error: "Forbidden - Admin required"});
    }
    next();
  };