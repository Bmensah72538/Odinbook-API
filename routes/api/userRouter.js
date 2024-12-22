import express from 'express';
import utils from '../../lib/passwordUtils.js';
import User from '../../models/users.js';
const router = express.Router();

router.get('/', utils.authJWT, async(req, res) => {

    res.json({userId: req.user});
})

export default router;