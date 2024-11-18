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
// router.post('/messages', utils.authJWT, async(req, res) => {
//     const message = req.body.message;
//     const userId = req.user.sub;
//     const chatroomid = req.body.chatroomid;

// })

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

router.get('/messages', utils.authJWT, async(req, res) => {
    const userId = req.user.sub;
    const user = await User.findById(userId);
    const chatrooms = await Chatrooms.find({ participants: userId })
    
    
    res.json({
        user: user,
        chatrooms: chatrooms
    })

})

router.get('/friends', utils.authJWT, async(req, res) => {
    const userId = req.user.sub;
    await User.findById(userId);
    
})

export default router;