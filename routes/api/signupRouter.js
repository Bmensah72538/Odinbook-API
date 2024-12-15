import express from 'express';
import utils from '../../lib/passwordUtils.js';
import bcrypt from 'bcrypt';
import axios from 'axios';
import User from '../../models/users.js';  
import { validationResult } from 'express-validator';
import signupValidator from '../../middleware/signupValidator.js';  

const router = express.Router();

// reCAPTCHA Secret Key 
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET; 

router.post(
    '/signup',
    signupValidator,  
    async (req, res) => {
        // Step 1: Validate incoming fields
        const errors = validationResult(req); 
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password, email, captchaToken } = req.body;

        // Step 2: Ensure all required fields are provided
        if (!username || !password || !email || !captchaToken) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Step 3: Verify reCAPTCHA token with Google's API
        try {
            const captchaResponse = await axios.post(
                'https://www.google.com/recaptcha/api/siteverify',
                null,
                {
                    params: {
                        secret: RECAPTCHA_SECRET,  
                        response: captchaToken,       
                    },
                }
            );

            // Check if reCAPTCHA verification was successful
            if (!captchaResponse?.data?.success) {
                return res.status(400).json({ error: 'reCAPTCHA validation failed.' });
            }
        } catch (error) {
            console.error('Error verifying reCAPTCHA:', error);
            return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
        }

        // Step 4: Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Signup failed. Username already taken.' });
        }

        // Step 5: Create new user (store user in DB)
        let newUser;
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            newUser = new User({ 
                username, 
                password: hashedPassword, 
                email,
            });
            await newUser.save();
        } catch (error) {
            console.error('Failed to save user', error);
            return res.status(500).json({ error: 'Failed to create user.' });
        }

        // Step 6: Issue JWT tokens
        const access = utils.issueAccess(newUser);
        const refresh = utils.issueRefresh(newUser);

        // Step 7: Return success response with tokens and user ID
        res.json({
            access,
            refresh,
            userId: newUser._id,
        });
    }
);

export default router;
