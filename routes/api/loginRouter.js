import express from 'express'
import utils from '../../lib/passwordUtils.js';

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

export default router;