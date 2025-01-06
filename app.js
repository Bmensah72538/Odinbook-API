import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors';
import http from 'http';


// Import Routes 
import indexRouter from './routes/index.js'
import apiRouter from './routes/api/index.js'

// Import Socket.io
import { initSocket } from './sockets/index.js'

// Init App
const app = express();
const port = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const allowedOrigin = process.env.corsAllowedOrigin;

// Middleware
app.use(cors({
    origin: allowedOrigin,  // Adjust to your frontend domain
    methods: ['GET', 'POST', 'PUT'],           // Add allowed methods
  }));
app.options('*', cors());  // Ensure CORS is enabled for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/api', apiRouter);

// Initialize MongoDB Connection
try {
    await mongoose.connect(process.env.dbURI)
    console.log('Connected to MongoDB');
} catch (error) {
    console.log('Error connecting to MongoDB');
}

    
// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Begin Listening
server.listen(port, '0.0.0.0', (err) => {
    if (err) {
        console.error(`Error starting server: ${err}`);
    } else {
        console.log(`Server is running on port ${port}...`);
    }
});