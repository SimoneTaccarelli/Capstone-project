import NodeMailer from 'nodemailer';
import dotenv from 'dotenv';

const transporter = NodeMailer.createTransport({
    host: process.env.SEND_GRIFD_HOST,
    port: process.env.SEND_GRID_PORT,
    auth: {
        user: process.env.SEND_GRID_USER,
        pass: process.env.SEND_GRID_API_KEY,
    },
});

export default transporter;

