import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import Chatrooms from '../models/chatrooms.js';
import Messages from '../models/messages.js';
import validator from 'validator';
import User from '../models/users.js';

// Cors Origin
const allowedOrigin = process.env.corsAllowedOrigin;

// DBUri
const dbURI = process.env.dbURI;

//Access token secret
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// WebSocket Server Initialization Export
export const initSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: allowedOrigin,
            methods: ['GET', 'POST'],
        }
    });
    // Add authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token; // Access the token from the auth object
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        
        try {
            // Verify the token
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
            socket.user = decoded; // Attach user info to the socket object
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
        });
        
        // Verify that user is a chatroom participant
        const verifyAccess = async ({ userId, chatroomId }) => {
            try {
                const chatroom = await Chatrooms.findById(chatroomId);
                if (!chatroom) return false; // Chatroom not found, deny access
                return chatroom.participants.includes(userId); // Return true if the user is in the participants array
            } catch (err) {
                console.error('Error verifying access:', err);
                return false; // Return false if an error occurs
            }
        };
        
        // Handle WebSocket Connections
        io.on('connection', (socket) => {
            console.log('A user connected:', socket.id);
            socket.on('joinChatroom', async ({ userId, chatroomId }) => {
                console.log(`User ${userId} is attempting to join chatroom ${chatroomId}...`);
                const hasAccess = await verifyAccess({ userId, chatroomId });
                if (hasAccess) {
                    socket.join(chatroomId); // Join the socket.io room named after the chatroomId
                    console.log(`User ${userId} joined chatroom ${chatroomId}`);
                } else {
                    socket.emit('error', { error: `Access denied to chatroom ${chatroomId}` });
                }
            });
            
            // Handle getting messages
            socket.on('getMessages', async (chatroomId) => {
                // Initialize messages array
                let messages = [];
        
                // Search for chatroom and return array of messages if found.
                try {
                    const chatroom = await Chatrooms.findById(chatroomId)
                    if (!chatroom) {
                        return socket.emit('error', { error: `Chatroom ${chatroomId} not found.` });
                    }
                    messages = chatroom.messages;
                    socket.emit('getMessages', messages);
                } catch (error) {
                    console.log(`Unable to fetch messages. Chatroom ID:${chatroomId}`, error);
                    socket.emit('error', { error: `An error occurred while fetching messages for chatroom ${chatroomId}.` });
                }
            });
        
            // Handle sending messages
            socket.on('sendMessage', async (data) => {
                // Log message
                console.log('Message received:', data);
                // Validate data
                if (!data.chatroomId || !data.messageText || !data.userId) {
                    console.log('Invalid message.')
                    return socket.emit('error', { error: 'Invalid message payload.' });
                }
                const hasAccess = await verifyAccess(data);
        
                if(!hasAccess) {
                    console.log(`Unauthorized access attempt by user ID:${data.userId} to chatroom ID:${data.chatroomId}`);
                    socket.emit('error', { error: `Unauthorized access to chatroom ID:${data.chatroomId}` });
                    return;
                }

                const user = await User.findById(data.userId)
        
                // Create Sanitized Message
                const sanitizedMessage = {
                    chatroomId: data.chatroomId,
                    messageText: validator.escape(data.messageText),
                    author: data.userId,
                    timestamp: new Date(),
                }
                const newMessage = new Messages(sanitizedMessage);
                const toBeEmitted = await newMessage.populate('author', 'username');
        
                // Save message
                try {
                    await newMessage.save()
                    io.to(data.chatroomId).emit('newMessage', toBeEmitted);
                    console.log('Message saved to DB and broadcasted:', toBeEmitted);
                } catch (err) {
                    console.log(`Unable to save message to chatroom ID:${data.chatroomId}`, err);
                    socket.emit('error', { error: 'Failed to send message. Please try again.' });
                }
                
            });
        
            // Handle disconnections
            socket.on('disconnect', () => {
                console.log('A user disconnected:', socket.id);
            });
        });
    return io;
}