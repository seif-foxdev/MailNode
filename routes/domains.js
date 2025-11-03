const express = require('express');
const router = express.Router();
const validateDomain = require('../middlewares/validateDomain');
const Domain = require('../models/Domain');

router.post('/', validateDomain, async (req, res) => {
    try {
        await Domain.create(req.body);
        res.status(200).send('IMAP endpoint POST is set up and ready.');
    } catch (error) {
        next(error);
    }
});

router.put('/:id', validateDomain, async (req, res, next) => {
    try {
        if (!req.params.id) {
            return next(new Error('Missing domain ID'));
        }
        await Domain.updateOne({ _id: req.params.id }, req.body);
        res.status(200).send('IMAP endpoint PUT is set up and ready.');
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        if (!req.params.id) {
            return next(new Error('Missing domain ID'));
        }
        await Domain.deleteOne({ _id: req.params.id });
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});


module.exports = router;