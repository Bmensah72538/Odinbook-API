import express from 'express';
import utils from '../../lib/passwordUtils.js';
import User from '../../models/users.js';
const router = express.Router();

router.get('/', utils.authJWT, async(req, res) => {
    console.log(`User ${req.user} is authenticated`);
    try {
        const user = await User.findById(req.user);
        res.json({
            _id: req.user,
            username: user.username
        });
    } catch (error) {
        console.log(`Error finding user ${req.user}`);    
    }
})

router.get('/:userId', utils.authJWT, async(req, res) => {
    const userId = req.params.userId;
    let user;
    try {
        user = await User.findById(userId);    
    } catch (error) {
        console.error(`Unable to access user ${userId}`);
        res.json({error: `Unable to access user ${userId}`});
        return;
    }
    console.log('User accessed:', user.username, user._id);
    res.json({
        username: user.username,
    })
    

})

export default router;