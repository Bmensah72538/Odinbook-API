import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';


// Import Routes 
import indexRouter from './routes/index.js'
import apiRouter from './routes/api.js'

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

// WebSocket Server
const io = new SocketIOServer(server, {
    cors: {
        origin: allowedOrigin,
        methods: ['GET', 'POST'],
    }
});

// Handle WebSocket Connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a chatroom
    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`${socket.id} joined room ${room}`);
    });

    // Handle sending messages
    socket.on('sendMessage', (data) => {
        console.log('Message received:', data);
        io.to(data.room).emit('newMessage', data); // Broadcast message to the room
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});



// Begin Listening
server.listen(port, (err) => {
    if (err) {
        console.error(`Error starting server: ${err}`);
    } else {
        console.log(`Server is running on port ${port}...`);
    }
});