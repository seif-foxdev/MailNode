const express = require('express');
const validateConfig = require('../middlewares/validateConfig');
const Imap = require('../classes/Imap');
const router = express.Router();
router.post('/', validateConfig, (req, res) => {
    const imap = new Imap(req.body);
    imap.connect();
    // console.log(imap.activeImaps);
    
    res.status(200).send('IMAP endpoint is set up and ready.');
});
router.delete('/:domain',  (req, res) => {
    const { domain } = req.params;
    const imap = Imap.activeImaps[domain];
    if (imap) {
        imap.disconnect();
        res.status(200).send('IMAP endpoint is disconnected.');
    } else {
        res.status(404).send('IMAP endpoint not found.');
    }
});

module.exports = router;