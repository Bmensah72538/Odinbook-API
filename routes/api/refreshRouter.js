import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../../models/users.js';

const router = express.Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Mock database of refresh tokens (replace with your DB or memory storage)
const refreshTokensDB = new Set(); // Example: replace with Redis or MongoDB


// Refreshes the access token using the provided refresh token. 
router.post('/', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token is required.' });
    }

    // Check if the refresh token is valid and stored
    if (!refreshTokensDB.has(refreshToken)) {
        return res.status(403).json({ error: 'Invalid or expired refresh token.' });
    }

    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        // Optionally check user status or other conditions
        const user = await User.findById(decoded.sub); // `sub` is the user ID
        if (!user) {
            return res.status(403).json({ error: 'Invalid refresh token.' });
        }

        // Generate a new access token
        const accessToken = jwt.sign(
            { sub: user._id, username: user.username }, // Payload
            ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' } // Short-lived access token
        );

        // Respond with the new access token
        return res.json({ accessToken });
    } catch (error) {
        console.error('Failed to verify refresh token:', error);
        return res.status(403).json({ error: 'Invalid or expired refresh token.' });
    }
});

export default router;
