import User from '../models/Users.js';
import admin from 'firebase-admin';
import mailer from '../helper/mailer.js';
import mongoose from 'mongoose';

export async function freshRegister(request, response, next) {
    try {
        console.log("\n------- NUOVA REGISTRAZIONE -------");
        console.log("⭐ Richiesta di registrazione ricevuta:", request.body);
        
        const {email, firstName, lastName, firebaseUid} = request.body;
        
        // Log dettagliati
        console.log("Email:", email);
        console.log("FirebaseUID:", firebaseUid);
        
        // AGGIUNGI log della connessione MongoDB
        console.log("Stato connessione MongoDB:", mongoose.connection.readyState);
        // 0 = disconnesso, 1 = connesso, 2 = connessione in corso, 3 = disconnessione in corso
        
        if (!email || !firstName || !lastName || !firebaseUid) {
            console.log("❌ Campi mancanti:", {
                email: !email,
                firstName: !firstName,
                lastName: !lastName,
                firebaseUid: !firebaseUid
            });
            return response.status(400).json({error: "All fields are required"});
        }
        
        try {
            // Verifica se l'utente esiste già
            const existingUser = await User.findOne({ firebaseUid });
            console.log("Utente esistente?", existingUser ? "SI" : "NO");
            
            if (existingUser) {
                console.log("❌ Utente già esistente con firebaseUid:", firebaseUid);
                return response.status(200).json({
                    message: "User already exists",
                    user: existingUser
                });
            }
        } catch (findError) {
            console.error("❌ Errore nella ricerca utente:", findError);
        }
        
        console.log("✅ Creazione utente in MongoDB...");
        
        const user = new User({
            email,
            firstName, 
            lastName,
            firebaseUid,
            profilePic: null,
            role: 'User'
        });
        
        try {
            await user.save();
            console.log("✅ Utente salvato con successo:", user._id);
        } catch (saveError) {
            console.error("❌ ERRORE NEL SALVATAGGIO:", saveError);
            return response.status(500).json({error: "Errore nel salvataggio: " + saveError.message});
        }
        
        // Aggiungi l'utente alla request per il middleware successivo
        request.registeredUser = user;
        
        // Chiama next() SENZA inviare risposta
        next();
    } catch (error) {
        console.error("❌ Errore generale nella registrazione:", error);
        response.status(500).json({error: error.message});
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

export async function welcomeEmail(request, response, next) {
    const {email} = request.body;
    try {
        if (!email) {
            return response.status(400).json({error: "Email is required"});
        }


        
        // Invia l'email di benvenuto
        await mailer.sendWelcomeEmail({
            from:'Itokonolab@hotmail.com',
            to: email,
            subject: 'Benvenuto in ItokoNolab',
            text: 'Grazie per esserti registrato! Siamo felici di averti con noi.'
        });
        
        response.status(200).json({message: "Welcome email sent successfully"});
    } catch (error) {
        response.status(500).json({error: error.message});
    }
}

export async function sendWelcomeEmail(request, response) {
    try {
        // Ottieni l'utente dalla request (passato da freshRegister)
        const user = request.registeredUser;
        
        if (!user || !user.email) {
            return response.status(400).json({error: "Email mancante"});
        }
        
        // Invia l'email di benvenuto
        await mailer.sendWelcomeEmail({
            from: 'Itokonolab@hotmail.com',
            to: user.email,
            subject: 'Benvenuto in ItokoNolab',
            text: `Ciao ${user.firstName},\n\nGrazie per esserti registrato! Siamo felici di averti con noi.\n\nItokoNolab Team`
        });
        
        console.log("✅ Email di benvenuto inviata a:", user.email);
        
        // Ora invia la risposta finale con i dati utente
        response.status(201).json(user);
    } catch (error) {
        console.error("❌ Errore nell'invio email:", error);
        // Se l'invio email fallisce, invia comunque i dati utente
        // ma indica che l'email non è stata inviata
        if (request.registeredUser) {
            response.status(201).json({ 
                ...request.registeredUser.toObject(), 
                emailSent: false 
            });
        } else {
            response.status(500).json({error: "Errore nell'invio email"});
        }
    }
}



