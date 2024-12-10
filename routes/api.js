import express from 'express'
import utils from '../lib/passwordUtils.js'
import User from '../models/users.js';
import Messages from '../models/messages.js'
import Chatrooms from '../models/chatrooms.js'
import jwt from 'jsonwebtoken'


const router = express.Router();

router.post('/login', (req, res) => {
    //auth user
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({username: username})
    .then((user) => {
        if(!user) {
            res.send('invalid username/password');
            return;
        }
        //then send JWT
        const access = utils.issueAccess(user);
        const refresh = utils.issueRefresh(user);
        res.json({
            access: access,
            refresh: refresh,
            userId: user._id
        });
    })
    
})
router.post('/signup', (req, res) => {
    //auth user
    const username = req.body.username;
    if(username.length > 20) {
        res.send('Username length cannot exceed 20 characters');
        return;
    }
    const password = req.body.password;
    if(password.length > 20) {
        res.send('Password length cannot exceed 20 characters');
        return;
    }
    User.findOne({username: username})
        .then((user) => {
            if(user) {
                res.send('User already exists.');
                return;
            }
            //then send JWT
            const access = utils.issueAccess(user);
            const refresh = utils.issueRefresh(user);
            res.json({
                access: access,
                refresh: refresh,
                userId: user._id
            });
        })
    
})

router.get('/refresh', (req, res) => {
    if (req.headers.refresh) {
        
        // Destructuring refreshToken from cookie
        const refreshToken = req.headers.refresh.split(' ')[1];

        // Verifying refresh token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err) {          
                    // Wrong Refesh Token
                    return res.status(406).json({ message: 'Unauthorized' });
                }
                else {
                    // Correct token we send a new access token
                    console.log(decoded);
                    res.send('Aye lmao')
                    // const accessToken = issueJwt(user);
                    // return res.json({ accessToken });
                }
            })
    } else {
        return res.status(406).json({ message: 'Unauthorized' });
    }
})

router.post('/messages', async(req, res) => {
    const user = await User.findById('658f469b4736ad5b996dc5b8')
    const chatroomid = '10';
    const message = req.body.message;

    const chatroom = new Chatrooms()
    chatroom.participants.push(user._id);
    await chatroom.save()
    
    // console.log('messagepost', chatroom)
    
    res.send('yea')

    

})
// GET /api/chatrooms: Retrieves all chatrooms the authenticated user is participating in.
// GET /api/chatrooms/:chatroomId/messages: Retrieves all messages for a specific chatroom.
// POST /api/chatrooms/:chatroomId/messages: Sends a new message to a specific chatroom.
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

router.get('/friends', utils.authJWT, async(req, res) => {
    const userId = req.user.sub;
    await User.findById(userId);
    
})

export default router;