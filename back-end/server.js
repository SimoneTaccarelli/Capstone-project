import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import admin from 'firebase-admin';
import authRouter from './routes/auth.js';
import fileRouter from './routes/file.js';
import productRouter from './routes/product.js';
import stripeRouter from './routes/stripe.js';
import orderRouter from './routes/order.js';


import Stripe from 'stripe';



// Load environment variables
dotenv.config();


//
const server = express();
server.use(express.json());
server.use(cors({
  exposedHeaders: ['X-Pagination', 'Content-Type']
}))
server.use('/api/v1/' , authRouter)
server.use('/api/v1' , fileRouter)
server.use('/api/v1' , productRouter)
server.use('/api/v1/stripe' , stripeRouter)
server.use('/api/v1/order' , orderRouter)


admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CREDENTIALS))
});





// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {});

//check if the connection is successful
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

//check if the connection is unsuccessful
mongoose.connection.on('error', (err) => {
  console.log('Failed to connect to MongoDB', err);
});



const router = express.Router();



//listen to server
server.listen(`${process.env.PORT}`, () => {
  console.log(`Server running on ${process.env.API_URL_BACK_END}`);
});
