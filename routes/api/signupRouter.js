import express from 'express';
import utils from '../../lib/passwordUtils.js';
import bcrypt from 'bcrypt';
import User from '../../models/users.js';  
import { validationResult } from 'express-validator';
import signupValidator from '../../middleware/signupValidator.js';  

const router = express.Router();

router.get('/', (req, res)=>{
    res.send('hi there');
})

router.post(
    '/',
    signupValidator,  
    async (req, res) => {
        // Step 1: Validate incoming fields
        const errors = validationResult(req); 
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password, email } = req.body;

        // Step 2: Ensure all required fields are provided
        if (!username || !password || !email ) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Step 3: Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Signup failed. Username already taken.' });
        }

        // Step 4: Create new user (store user in DB)
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

        // Step 5: Issue JWT tokens
        const access = await utils.issueAccess(newUser);
        const refresh = await utils.issueRefresh(newUser);

        // Step 6: Return success response with tokens and user ID
        res.json({
            access,
            refresh,
            userId: newUser._id,
        });
    }
);

export default router;
