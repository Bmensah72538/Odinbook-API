import express from 'express';
import utils from '../../lib/passwordUtils.js';
import Friendship from '../../models/friendships.js';

const router = express.Router();


// GET /api/friendship: Retrieves all friendships the authenticated user has.
router.get('/', utils.authJWT, async (req, res) => {
    const userId = req.user;
    if (!userId) {
        return res.json({ error: 'User ID is not found in request.' });
    }
    try {
        const friendshipArray = await Friendships.find(
            { $or: [{ user1: userId }, { user2: userId }] }
        );
        return res.json({ friendships: friendshipArray });
    } catch (error) {
        return res.json({error: 'Failed to retrieve friendships.'});
    }
});

// POST /api/friendship: Creates a new friendship between two users.
router.post('/', utils.authJWT, async (req, res) => {
    // Get userId from JWT
    const userId = req.user;
    // Ensure the request body contains a friendId
    if (!req.body.friendId) {
        return res.json({ error: 'Friend ID is required.' });
    }
    // Ensure the friendId is not the same as the userId
    if (req.body.friendId === userId) {
        return res.json({ error: 'Cannot add self as friend.' });
    }
    // Ensure the friendship does not already exist
    const existingFriendship = await Friendship.findOne({
        $or: [
            { user1: userId, user2: req.body.friendId },
            { user1: req.body.friendId, user2: userId },
        ],
    });
    if (existingFriendship) {
        return res.json({ error: 'Friendship already exists.' });
    }
    // Create new friendship
    try {
        const Friendship = new Friendship({ 
            user1: userId, 
            user2: req.body.friendId 
        })
        await Friendship.save();
    } catch (error) {
        return res.json({ error: 'Failed to create friendship.' });
    }
    return res.json({ message: 'Friendship created.' });
});