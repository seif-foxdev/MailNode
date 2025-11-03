require('dotenv').config();
const express = require('express');
const connectMongo = require('./config/database.js');
const imapRouter = require('./routes/imap.js');
const domainRouter = require('./routes/domains.js');
const globalErrorHandler = require('./middlewares/globalError.js');
const redisClient = require('./config/redis.js');
const emailBodyRouter = require('./routes/emailBodies.js');

connectMongo();
redisClient.connect()
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/imap', imapRouter);
app.use('/domains', domainRouter);
app.use('/email-bodies', emailBodyRouter);

// IMPORTANT: Global error handler must be the LAST middleware
app.use(globalErrorHandler);

app.listen(process.env.PORT || 3000, () => {
    console.log(`[🌐] Server is running on port ${process.env.PORT || 3000}`)
});