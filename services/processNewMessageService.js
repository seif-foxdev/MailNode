const EmailModel = require("../models/EmailBody");
const { simpleParser } = require('mailparser');
redisClient = require('../config/redis');
function processNewMessage(msg, seqno, domain) {
    console.log(`[📨] New message (#${seqno}) detected on ${domain}`);

    msg.on('body', (stream) => {
        simpleParser(stream, async (err, parsed) => {
            if (err) {
                console.error(`[❌] Error parsing email from ${domain}:`, err);
                return;
            }            
            const emailData = {
                message_id: parsed.to?.text + parsed.date || `no-id-${Date.now()}`, // fallback if missing
                from: parsed.from?.text || 'Unknown',
                subject: parsed.subject || 'No Subject',
                created_at: parsed.date || new Date(),
                email_body: parsed.text || parsed.html || '',
                to: parsed.to?.text || 'Unknown'
            };

            const { success, result } = await EmailModel.save(emailData);
            if (success) {
                redisClient.publishMessage('newEmail', { ...result });
            }

        });
    });

    msg.once('attributes', (attrs) => {
        console.log(`[🔍] UID: ${attrs.uid} from ${domain}`);
    });

    msg.once('end', () => {
        console.log(`[✅] Finished processing message #${seqno} from ${domain}`);
    });
}

module.exports = processNewMessage;