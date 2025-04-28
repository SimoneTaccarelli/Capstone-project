import User from '../models/Users.js';
import admin from 'firebase-admin';
import mailer from '../helper/mailer.js';

// Middleware per verifica token - utilizzato da più funzioni
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({error: "Unauthorized"});
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({firebaseUid: decodedToken.uid});
    
    if (!user) return res.status(404).json({error: "User not found"});
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({error: "Token non valido"});
  }
};

// Registrazione utente + invio email di benvenuto
export async function freshRegister(request, response, next) {
  try {
    const {email, firstName, lastName, firebaseUid} = request.body;
    
    if (!email || !firstName || !lastName || !firebaseUid) {
      return response.status(400).json({error: "All fields are required"});
    }
    
    // Verifica se utente esiste già
    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      return response.status(200).json({
        message: "User already exists",
        user: existingUser
      });
    }
    
    // Crea nuovo utente
    const user = new User({
      email,
      firstName, 
      lastName,
      firebaseUid,
      profilePic: null,
      role: 'User'
    });
    
    await user.save();
    
    // Tentativo di invio email con template HTML (non blocca la registrazione)
    try {
      await mailer.sendMail({
        from: 'Itokonolab@hotmail.com',
        to: user.email,
        subject: 'Benvenuto in ItokoNolab',
        html: `
          <html>
            <head>
              <title>Benvenuto in ItokoNolab!</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">  
                <div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h2 style="color: #333; margin-top: 0;">Benvenuto in ItokoNolab, ${firstName}!</h2>
                  <p style="margin-top: 20px; font-size: 16px;">
                    Grazie per esserti iscritto al nostro Shop online.<br>
                    Da questo momento potrai accedere a tutti i nostri prodotti e servizi esclusivi.
                  </p>
                  <p style="font-size: 16px;">
                    Potrai cancellare la tua iscrizione quando vuoi dal pannello di controllo del tuo account.
                  </p>
                </div>
                
                <div style="text-align: center; color: #777; font-size: 12px;">
                  <p>
                    &copy; ${new Date().getFullYear()} ItokoNolab. Tutti i diritti riservati.<br>
                    Per qualsiasi domanda, contattaci all'indirizzo email: support@itokonolab.com
                  </p>
                </div>
              </div>
            </body>
          </html>
        `
      });
      user.emailSent = true;
    } catch (emailError) {
      console.error("Errore nell'invio email:", emailError);
      user.emailSent = false;
    }
    
    // Risposta con dati utente
    return response.status(201).json(user);
  } catch (error) {
    console.error("Errore registrazione:", error);
    response.status(500).json({error: error.message});
  }
}

// Login Google
export async function loginGoogle(request, response) {
  const {token} = request.body;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const {uid, email} = decodedToken;
    const displayName = decodedToken.name || '';
    
    // Estrai firstName e lastName
    const nameParts = displayName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Cerca utente
    let user = await User.findOne({firebaseUid: uid});
    
    if (!user) {
      // Cerca per email
      const userByEmail = await User.findOne({email});
      
      if (userByEmail) {
        // Aggiorna utente esistente
        user = await User.findByIdAndUpdate(
          userByEmail._id,
          { $set: { firebaseUid: uid } },
          { new: true }
        );
      } else {
        // Crea nuovo utente
        user = await User.create({
          firebaseUid: uid, 
          email, 
          firstName, 
          lastName,
          role: 'User',
          profilePic: null
        });
      }
    }
    
    response.status(200).json(user);
  } catch (error) {
    response.status(401).json({error: error.message});
  }
}

// Login standard
export async function login(request, response) {
  try {
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) return response.status(401).json({error: "Unauthorized"});
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({firebaseUid: decodedToken.uid});
    
    if (!user) return response.status(404).json({error: "User not found"});
    
    response.status(200).json(user);
  } catch (error) {
    response.status(401).json({error: error.message});
  }
}

// Dati utente
export async function getUserData(request, response) {
  try {
    const user = request.user;
    
    response.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      createdAt: user.createdAt
    });
  } catch (error) {
    response.status(500).json({error: error.message});
  }
}

// Elimina utente
export async function eliminateUser(request, response) {
  try {
    const firebaseUid = request.user.firebaseUid;
    
    await User.deleteOne({ firebaseUid });
    await admin.auth().deleteUser(firebaseUid);
    
    response.status(200).json({message: "User deleted successfully"});
  } catch (error) {
    response.status(500).json({error: error.message});
  }
}

// Aggiorna utente
export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = { ...req.body };
    
    // Gestione immagine profilo
    if (req.file) {
      updateData.profilePic = req.file.secure_url || req.file.path || req.file.url;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Impossibile aggiornare l\'utente'
    });
  }
};

// Verifica admin
export async function isAdministrator(request, response, next) {
  try {
    if (request.user.role !== 'Admin') {
      return response.status(403).json({error: "Forbidden"});
    }
    next();
  } catch (error) {
    response.status(401).json({error: error.message});
  }
}



