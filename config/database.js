const { default: mongoose } = require("mongoose");
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('[🗄️] Connected to MongoDB successfully.');
    } catch (err) {
        console.error('[❌] MongoDB connection error:', err);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connect;
