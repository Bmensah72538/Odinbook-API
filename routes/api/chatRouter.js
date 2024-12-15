import express from 'express';
import utils from '../../lib/passwordUtils';
const router = express.Router();


// GET /api/chatrooms: Retrieves all chatrooms the authenticated user is participating in.
router.get('/chatrooms', utils.authJWT, async(req, res) => {
    const userId = req.headers.userId;
    if(!userId) {
        res.send('User ID is not found.');
    } 
    Chatrooms.find({ participants: userId })
        .then(chatrooms => {
            res.json({
                chatrooms: chatrooms
            })
        })
        .catch(error => {
            res.send('Failed to return chatrooms')
        })
})

// GET /api/chatrooms/:chatroomId/messages: Retrieves all messages for a specific chatroom.
router.get('/chatrooms/:chatroomId/messages', utils.authJWT, async(req, res) => {
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
router.post('/chatrooms:chatroomId/messages', utils.authJWT, async(req, res) => {
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