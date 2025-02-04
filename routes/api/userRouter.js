import express from 'express';
import utils from '../../lib/passwordUtils.js';
import User from '../../models/users.js';
import Friendship from '../../models/friendships.js';


const router = express.Router();

// GET /api/user: Retrieves the authenticated user's information.
router.get('/', utils.authJWT, async(req, res) => {
    console.log(`User ${req.user} is authenticated`);
    try {
        const user = await User.findById(req.user);
        const friendships = await Friendship.find({
            $or: [{ user1: req.user }, { user2: req.user }]
        });
        res.json({
            _id: req.user,
            username: user.username,
            friendships: friendships
        });
    } catch (error) {
        console.log(`Error finding user ${req.user}`);    
    }
})

// GET /api/user/:userId: Retrieves information about a specific user.
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
router.get('/search', utils.authJWT, async(req, res) => {
    const { qUsername } = req.query
    console.log();
    res.json({qUsername})
    return;
})

export default router;