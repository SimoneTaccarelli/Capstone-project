import User from '../models/Users.js';
import admin from 'firebase-admin';
//import mailer from '../helper/mailer.js';

export async function freshRegister(request, response, next) {
    try {
        const {email, firstName, lastName, firebaseUid} = request.body;
        
        if (!email || !firstName || !lastName || !firebaseUid) {
            return response.status(400).json({error: "All fields are required"});
        }
        
        const user = await User.create({
            email,
            firstName, 
            lastName,
            firebaseUid, // Importante per il collegamento
            profilePic: `https://ui-avatars.com/api/?background=8c00ff&color=fff&name=${firstName}+${lastName}`
        });
        
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

        // // Send welcome email
        // const mailOptions = {
        //     from: "itokonolab@gmail.com",
        //     to: user.email,
        //     subject: 'Welcome to Our Service',
        //     text: `Hello ${firstName}, welcome to our service!`,
        // };
        // await mailer.sendMail(mailOptions);
        
        response.status(200).json(user);
    } catch (error) {
        console.error("Firebase token verification error:", error);
        response.status(401).json({error: "Unauthorized"});
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


export async function eliminateUser(request, response, next) {
    try {
        // 1. Ottieni l'uid di Firebase dall'utente nella richiesta
        const firebaseUid = request.user.firebaseUid;
        
        // 2. Elimina l'utente da MongoDB
        await User.deleteOne({ firebaseUid });
        
        // 3. Elimina l'utente anche da Firebase Authentication
        await admin.auth().deleteUser(firebaseUid);
        
        response.status(200).json({ message: "User deleted successfully from MongoDB and Firebase" });
    } catch (error) {
        console.error("Error deleting user:", error);
        response.status(500).json({ error: error.message });
    }
}

export async function updateUser(request, response, next) {
    try {
        
        
        const { firstName, lastName } = request.body;
        
        // Usa req.user che è già stato popolato dal middleware verifyToken
        const updateData = {};
        
        // Aggiungi i campi solo se sono presenti
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        
        // Gestione dell'immagine del profilo
        if (request.file) {
            const profilePic = request.file?.location || request.file?.path;
            updateData.profilePic = profilePic;
        }
        
        // Log dei dati di aggiornamento
        console.log("Update data:", updateData);
        console.log("User:", request.user);
        
        // Aggiorna usando firebaseUid invece di _id
        const updatedUser = await User.findOneAndUpdate(
            { firebaseUid: request.user.firebaseUid },
            updateData,
            { new: true }
        );
        
        response.status(200).json(updatedUser);
    } catch (error) {
        console.error("Update error:", error);
        response.status(500).json({ error: error.message });
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
        next();
        
    } catch (error) {
        response.status(401).json({error: error.message});
    }
}



