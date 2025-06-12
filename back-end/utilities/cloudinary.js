import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configurazione di base di Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage generale
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itoko',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

const graphicStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itoko/graphic',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    
  }
});

// Configura lo storage per prodotti
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itoko/product',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
   
  }
});

// Configura lo storage per avatar
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itoko/avatar',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 200, height: 200, crop: 'fill' }]
  }
});

// NUOVI STORAGE SEPARATI PER LOGO E FRONTIMAGE

// Storage specifico per i loghi
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itoko/design/logo',
    allowed_formats: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    // Trasformazione per logo (opzionale)
    transformation: [{ width: 300, height: 200, crop: 'limit' }]
  }
});

// Storage specifico per le immagini frontali
const frontImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itoko/design/frontimage',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    // Trasformazione per immagini banner (opzionale)
    transformation: [{ width: 1920, height: 1080, crop: 'limit' }]
  }
});

// Middleware di upload per prodotti
const productUpload = multer({ storage: productStorage });

// Middleware di upload per avatar
const avatarUpload = multer({ storage: avatarStorage });

const graphicUpload = multer({ storage: graphicStorage });

// Middleware di upload per logo
const logoUpload = multer({ 
  storage: logoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per i loghi
  }
});

// Middleware di upload per immagini frontali
const frontImageUpload = multer({ 
  storage: frontImageStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per immagini frontali
  }
});

// Mantieni designUpload per retrocompatibilità (opzionale - puoi rimuoverlo)
const designStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itoko/design',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  }
});

const designUpload = multer({ 
  storage: designStorage,
  limits: {
    fileSize: 25 * 1024 * 1024, 
  }
});

// Upload generale
const upload = multer({ storage: storage });

export { 
  cloudinary, 
  productUpload, 
  avatarUpload, 
  logoUpload,        
  frontImageUpload,  
  designUpload,      
  upload,
  graphicUpload

};