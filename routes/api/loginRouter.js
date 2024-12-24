import express from 'express'
import utils from '../../lib/passwordUtils.js';
import User from '../../models/users.js';

const router = express.Router();

router.get('/', (req, res)=>{
    res.send('There is nothing to find here.')
});
router.post('/', async (req, res) => {
    //auth user
    const { username, password } = req.body;
    try {
        const user = await User.findOne({username: username});
        // Does user exist?
        if(!user) {
            res.json({error: 'Invalid username/password'});
            return;
        }
        // Validate password
        const validationResult = await utils.validPassword(password, user);
        if(!validationResult) {
            res.json({error: 'Invalid username/password'});
            return;
        }
        //then send JWT
        const access = await utils.issueAccess(user);
        const refresh = await utils.issueRefresh(user);
        console.log('User logged in:', user.username);
        res.json({
            accessToken: access,
            refreshToken: refresh,
            _id: user._id
        });
    } catch (error) {
        console.log(error);
        res.json({error: 'Login failed.'});
    }
    
})

export default router;