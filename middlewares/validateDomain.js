const validateConfig = (req, res, next) => {
    const requiredFields = ['host', 'port', 'tls'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        return res.status(422).json({ error: `Missing configuration fields: ${missingFields.join(', ')}` });
    }
    next();
};
module.exports = validateConfig;
