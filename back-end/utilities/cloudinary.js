import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Configurazione Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurazione storage per multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itoko', // cartella su Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, crop: "limit" }] // ridimensiona immagini grandi
  },
});

// Middleware per gestire upload di file
const upload = multer({ storage: storage });

export { cloudinary, upload };