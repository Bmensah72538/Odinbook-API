import express from 'express';
import utils from '../../lib/passwordUtils.js';
import Chatrooms from '../../models/chatrooms.js';

const router = express.Router();


// GET /api/chatrooms: Retrieves all chatrooms the authenticated user is participating in.
router.get('/', utils.authJWT, async(req, res) => {
    const userId = req.user;
    if(!userId) {
        return res.json({error:'User ID is not found in request.'});
    } 
    try {
        const chatrooms = await Chatrooms.find({ participants: userId });
        console.log(chatrooms);
        res.json({chatrooms});

    } catch (error) {
        res.json({error:'Failed to return chatrooms'});
    }
})

// GET /api/chatrooms/:chatroomId/messages: Retrieves all messages for a specific chatroom.
router.get('/:chatroomId/messages', utils.authJWT, async(req, res) => {
    const chatroomId = req.params.chatroomId;
    const userId = req.headers.userId;
    if(!userId) {
        res.send('User ID is not found.');
    } 
    Chatrooms.findById(chatroomId)
        .then(chatrooms => {
            res.json({
                messages: chatroom.messages
            })
        })
        .catch(error => {
            res.send(`Error finding messages in chatroom: ${chatroomId}`);
        })
})

// POST /api/chatrooms/:chatroomId/messages: Sends a new message to a specific chatroom.
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

export default router;