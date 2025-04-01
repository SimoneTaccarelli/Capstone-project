import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import open from 'open';
import admin from 'firebase-admin';
import gobalRouter from './routes/auth.js';



// Load environment variables
dotenv.config();


//
const server = express();
server.use(express.json());
server.use(cors())
server.use('/api/v1' , gobalRouter)


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
server.listen(`${process.env.PORT}`, async() => {
  console.log(`${process.env.API_URL_BACK_END}`);
  await open (`${process.env.API_URL_BACK_END}`);
});
