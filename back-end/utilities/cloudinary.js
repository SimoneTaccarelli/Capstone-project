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

// Configura lo storage per prodotti
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itoko/product', // Crea la sottocartella product
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Configura lo storage per avatar
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itoko/avatar', // Sottocartella per avatar
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 200, height: 200, crop: 'fill' }]
  }
});

const designStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'itoko/design', // Sottocartella per avatar
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 200, height: 200, crop: 'fill' }]
  }
});



// Middleware di upload per prodotti
const productUpload = multer({ storage: productStorage });

// Middleware di upload per avatar
const avatarUpload = multer({ storage: avatarStorage });

// Middleware di upload per design
const designUpload = multer({ storage: designStorage });


// Upload generale
const upload = multer({ storage: storage });

export { cloudinary, productUpload, avatarUpload, designUpload, upload };