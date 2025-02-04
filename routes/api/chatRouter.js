import express from 'express';
import utils from '../../lib/passwordUtils.js';
import Chatrooms from '../../models/chatrooms.js';
import Messages from '../../models/messages.js';
import User from '../../models/users.js';
import mongoose from 'mongoose';

const router = express.Router();
const { ObjectId } = mongoose.Types;


// GET /api/chat: Retrieves all chatrooms the authenticated user is participating in.
router.get('/', utils.authJWT, async (req, res) => {
    const userId = req.user;
    if (!userId) {
        return res.json({ error: 'User ID is not found in request.' });
    }

    try {
        // Find all chatrooms for the user
        const objectId = new ObjectId(userId);
        const searchDoc = { "participants.user": objectId };
        const chatrooms = await Chatrooms.find(searchDoc)
            .populate('participants.user', 'username')
            .lean();
        console.log(`Found chatrooms for user ${objectId}:`, chatrooms);
        // Fetch messages and populate `authorUsername` virtual field
        const chatroomsWithMessages = await Promise.all(
            chatrooms.map(async (chatroom) => {
                const messages = await Messages.find({ chatroomId: chatroom._id })
                    .populate('author', 'username') 
                    .lean();
                return {
                    ...chatroom,
                    messages,
                };
            })
        );

        res.json({ chatrooms: chatroomsWithMessages });
    } catch (error) {
        console.error('Error fetching chatrooms:', error);
        res.json({
            error: 'Failed to return chatrooms',
            details: error.message,
        });
    }
});

// GET /api/chat/:chatroomId/messages: Retrieves all messages for a specific chatroom.
router.get('/:chatroomId/messages', utils.authJWT, async(req, res) => {
    const chatroomId = req.params.chatroomId;
    const userId = req.user;
    if(!userId) {
        res.json({ error: 'User ID is not found.'});
        return;
    } 
    try {
        console.log(`Attempting to find messages in chatroom: ${chatroomId}`);
        const messages = await Messages.find({ chatroomId: chatroomId });
        
        res.json({
            messages: messages,
        });
    } catch (error) {
        res.json({ error: `Error finding messages in chatroom: ${chatroomId}` });
    }
})

// POST /api/chat/:chatroomId/messages: Sends a new message to a specific chatroom.
router.post('/:chatroomId/messages', utils.authJWT, async(req, res) => {
    const chatroomId = req.params.chatroomId;
    const userId = req.headers.userId;
    if(!userId) {
        res.send('User ID is not found.');
    } 
    Messages.create({
        chatroomId: chatroomId,
        messageText: req.body.messageText,
        author: userId,
        date: {type: Date, default: Date.now}
    })
    .catch(error => {
        res.send('Error saving message');
    })
})

// POST /api/chat: Creates a new chatroom.
router.post('/', utils.authJWT, async(req, res) => {
    const userId = req.user;
    const { chatroomName, participants } = req.body;
    console.log(`Creating chatroom with name: ${chatroomName} and participants: ${participants}`);

    if(!chatroomName || !participants) {
        res.json({ error: 'Chatroom name and participants are required.',
            req: req.body,
        });
        return;
    }
    if(participants.length < 1) {
        res.json({ error: 'Chatroom must have at least one participant.'});
        return;
    };
    if(participants.includes(userId)) {
        res.json({ error: 'User cannot create chatroom with themselves.'});
        return;
    }
    if(participants.length > 10) {
        res.json({ error: 'Chatroom cannot have more than 10 participants.'});
        return;
    }

    // Find user IDs for participants
    if (participants) {
        try {
            // Fetch all participants in a single query
            const users = await User.find({ username: { $in: participants } });
            if (users.length !== participants.length) {
                const missingUsers = participants.filter(
                    (participant) => {
                        return !users.some(user => user.username === participant);
                    }
                );
                throw new Error(`Some participants were not found: ${missingUsers.join(', ')}`);
            }
    
            // Create participant objects
            const participantObjects = users.map((user) => {
                const output = {
                    _id: user._id,
                }
                return output;
            });
    
            console.log(`Creating chatroom with participants: ${participantObjects}`);
    
            // Create and save chatroom
            const newChatroom = new Chatrooms({
                name: chatroomName,
                participants: [
                    {
                    _id: userId, 
                    isAdmin: true
                    }, 
                    ...participantObjects
                ],
            });
            await newChatroom.save();
    
            // Respond with the new chatroom
            res.json({ chatroom: newChatroom });
        } catch (error) {
            console.error('Error creating chatroom:', error);
            res.json({ error: 'Failed to create chatroom.', details: error.message });
        }
    } else {
        res.json({ error: 'Participants are required.' });
    }    
})

// Deletes one participant
router.delete('/chatrooms/:chatroomId/participants/:userId', async (req, res) => {
    const { chatroomId, userId } = req.params;
    const currentUserId = req.user._id; // Assume you get this from auth middleware

    try {
        const chatroom = await Chatrooms.findById(chatroomId);

        // Check if the current user is an admin
        const currentUser = chatroom.participants.find(
            (participant) => participant.userId.toString() === currentUserId.toString()
        );

        if (!currentUser || !currentUser.isAdmin) {
            return res.status(403).json({ error: 'Only admins can remove participants.' });
        }

        // Remove the user from participants
        chatroom.participants = chatroom.participants.filter(
            (participant) => participant.userId.toString() !== userId
        );

        await chatroom.save();

        res.json({ message: 'Participant removed successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove participant.' });
    }
});
// Deletes entire chatroom
router.delete('/chatrooms/:chatroomId', async (req, res) => {
    const { chatroomId } = req.params;
    const currentUserId = req.user._id;

    try {
        const chatroom = await Chatrooms.findById(chatroomId);

        // Check if the current user is an admin
        const currentUser = chatroom.participants.find(
            (participant) => participant.userId.toString() === currentUserId.toString()
        );

        if (!currentUser || !currentUser.isAdmin) {
            return res.status(403).json({ error: 'Only admins can delete chatrooms.' });
        }

        await Chatrooms.findByIdAndDelete(chatroomId);

        res.json({ message: 'Chatroom deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete chatroom.' });
    }
});



export default router;