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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/api', apiRouter);

// MongoDB Connection
mongoose.connect(process.env.dbURI)
    .then(() => {
        console.log('Connected to mongo')
    })
    .catch(err =>{
        console.log('MongoDB Connection Error:', err)
    });

// Create HTTP Server
const server = http.createServer(app);


// Begin Listening
server.listen(port, (err) => {
    if (err) {
        console.error(`Error starting server: ${err}`);
    } else {
        console.log(`Server is running on port ${port}...`);
    }
});