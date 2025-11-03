const validateConfig = (req, res, next) => {
    const requiredFields = ['user', 'password', 'host', 'port', 'tls'];
    console.log(req.body);
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        return res.status(422).json({ error: `Missing configuration fields: ${missingFields.join(', ')}` });
    }
    next();
};
module.exports = validateConfig;
