const { default: mongoose } = require("mongoose");

const domainSchema = mongoose.Schema({
    host: { type: String, required: true },
    port: { type: Number, required: true },
    tls: { type: Boolean, required: true },
});

const Domain = mongoose.model('Domain', domainSchema);

module.exports = Domain;