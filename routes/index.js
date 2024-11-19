import express from 'express'
import utils from '../lib/passwordUtils.js'
import 'dotenv/config'

const router = express.Router();

router.get('/', (req, res) => {
    if(req.user){
        res.send('User found. Very cool.')
    }
    res.send('Index. Unfinished.')
})
// router.get('/api', (req, res) => {
//     res.json({hello: 'world'})
// })


export default router 