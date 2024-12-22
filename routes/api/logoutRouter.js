import express from 'express';

const router = express.Router();

router.post('/', (req, res) => {
    const { user } = req.body;
    res.json({user});
});

export default router;