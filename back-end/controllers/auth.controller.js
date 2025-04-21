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
            profilePic: null
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
        
        // Cerca l'utente sia per firebaseUid che per email
        let user = await User.findOne({firebaseUid: uid});
        
        // Se non trovato per firebaseUid, cerca per email
        if (!user) {
            const userByEmail = await User.findOne({email});
            
            if (userByEmail) {
                // Aggiorna l'utente esistente con il nuovo firebaseUid
                user = await User.findByIdAndUpdate(
                    userByEmail._id,
                    { $set: { firebaseUid: uid } },
                    { new: true }
                );
                console.log("Utente aggiornato con nuovo firebaseUid:", user._id);
            } else {
                // Crea un nuovo utente se non esiste né per uid né per email
                user = await User.create({
                    firebaseUid: uid, 
                    email, 
                    firstName, 
                    lastName,
                    role: 'User',
                    profilePic: null
                });
                console.log("Nuovo utente creato:", user._id);
            }
        }
        
        response.status(200).json(user);
    } catch (error) {
        console.error("Firebase token verification error:", error);
        console.error("Error details:", error.message, error.code);
        response.status(401).json({error: "Unauthorized", message: error.message});
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

export async function getUserData(request, response) {
    try {
        // Usa direttamente l'utente che è già stato trovato da verifyToken
        const user = request.user;
        
        if (!user) {
            return response.status(404).json({ error: "Utente non trovato" });
        }
        
        // Includi tutti i campi necessari, compreso profilePic
        response.status(200).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            profilePic: user.profilePic, // Aggiungi questa riga!
            createdAt: user.createdAt
            // altri campi che potresti voler includere
        });
    } catch (error) {
        console.error("Errore nel recupero dati utente:", error);
        response.status(500).json({ error: error.message });
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

export const updateUser = async (req, res) => {
    try {
      
      
      const userId = req.user._id;
      const updateData = { ...req.body };
      
      // Se è stata caricata un'immagine, aggiungi l'URL ai dati da aggiornare
      if (req.file) {
        // Prova diverse proprietà possibili
        updateData.profilePic = req.file.secure_url || req.file.path || req.file.url;
        
        // Aggiungi questo per debug
        console.log("URL immagine che verrà salvato:", updateData.profilePic);
      }
      
      // Aggiorna l'utente nel database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      );
      
      // Log utente aggiornato
      console.log("Utente aggiornato:", {
        id: updatedUser._id,
        profilePic: updatedUser.profilePic
      });
      
      res.status(200).json({
        success: true,
        user: updatedUser,
       
      });
    } catch (error) {
      console.error('Errore nell\'aggiornamento utente:', error);
      res.status(500).json({
        success: false,
        error: 'Impossibile aggiornare l\'utente'
      });
    }
};

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



