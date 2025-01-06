import express from 'express';
import utils from '../../lib/passwordUtils.js';
import Chatrooms from '../../models/chatrooms.js';
import Messages from '../../models/messages.js';
import User from '../../models/users.js';

const router = express.Router();


// GET /api/chat: Retrieves all chatrooms the authenticated user is participating in.
router.get('/', utils.authJWT, async (req, res) => {
    const userId = req.user;
    if (!userId) {
        return res.json({ error: 'User ID is not found in request.' });
    }

    try {
        // Find all chatrooms for the user
        const chatrooms = await Chatrooms.find({ participants: userId }).lean();

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
    if(participants) {
        try {
            const participantUserIds = await Promise.all(participants.map(async (participant) => {
                try {
                    const user = await User.find({ username: participant})
                    const userId = user._id;
                    return userId;
                } catch (error) {
                    res.json({ error: 'Failed to find user ID for participant.'});
                }
            }));
            console.log(`Creating chatroom with participants: ${participantUserIds}`);
            console.log(participantUserIds);
            const newChatroom = new Chatrooms({
                name: chatroomName,
                participants: [userId, ...participantUserIds],
            });
            await newChatroom.save();
            res.json({ chatroom: newChatroom });            
        } catch (error) {
            res.json({ error: 'Failed to create chatroom.', actualError: error});
        }
    }
})

export default router;