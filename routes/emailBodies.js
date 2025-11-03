const express = require('express');
const router = express.Router();
const EmailBody = require('../models/EmailBody');


router.get('/email-body/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const emailBody = await EmailBody.findById(id);
        if (!emailBody) {
            return res.status(404).json({ error: 'Email body not found' });
        }
        res.json(emailBody);
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/email-bodies/:searchTerm', async (req, res) => {
    const { searchTerm } = req.params;
    try {
        const emailBodies = await EmailBody.find({
            $or: [
                { body: { $regex: searchTerm, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });
        res.json(emailBodies);
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/delete-emails', async (req, res) => {
    const { ids } = req.body
    try {
        const deletedCount = await EmailBody.deleteMany({ _id: { $in: ids } })
        res.json({ deletedCount });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;