import express from 'express';
import utils from '../../lib/passwordUtils';
import axios from 'axios';
import User from '../../models/users';  // Assuming you have a User model for your database

const router = express.Router();

// reCAPTCHA Secret Key (store this in your environment variables)
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET; // Make sure to set it in .env

// Signup Route
router.post('/signup', async (req, res) => {
    const { username, password, email, captchaToken } = req.body;

    // Step 1: Verify reCAPTCHA token with Google's API
    if (!captchaToken) {
        return res.status(400).json({ error: 'reCAPTCHA token is required.' });
    }

    try {
        const captchaResponse = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: RECAPTCHA_SECRET,  // Your server-side secret key
                    response: captchaToken,       // Token received from frontend
                },
            }
        );

        // Check if reCAPTCHA verification was successful
        if (!captchaResponse.data.success) {
            return res.status(400).json({ error: 'reCAPTCHA validation failed.' });
        }

        // Step 2: Validate username and password length
        if (username.length > 20) {
            return res.status(400).json({ error: 'Username length cannot exceed 20 characters.' });
        }
        if (password.length > 20) {
            return res.status(400).json({ error: 'Password length cannot exceed 20 characters.' });
        }

        // Step 3: Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        // Step 4: Create new user (store user in DB)
        const newUser = new User({ username, password, email });

        // Step 5: Issue JWT tokens
        const access = utils.issueAccess(newUser);
        const refresh = utils.issueRefresh(newUser);

        // Step 6: Return success response with tokens and user ID
        res.json({
            access: access,
            refresh: refresh,
            userId: newUser._id,
        });
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
    }
});

export default router;
