const Imap = require('node-imap');
const redisClient = require('../config/redis');
const processNewMessage = require('../services/processNewMessageService');

class ImapClass {
    static activeImaps = {};
    constructor(config) {
        this.imap = new Imap({
            user: config.user,
            password: config.password,
            host: config.host,
            port: config.port,
            tls: config.tls
        });
        this.domain = config.user.split('@')[1];
    }
    
    
    connect() {
        ImapClass.activeImaps[this.domain] = this;
        this.imap.once('ready', () => {
            console.log(`[✅] IMAP connected for ${this.domain}. Opening INBOX...`);
            this.imap.openBox('INBOX', false, (err, box) => {
                if (err) throw err;

                console.log(`[📬] INBOX opened for ${this.domain}. Listening for new mail...`);
                this.imap.on('mail', (numNewMsgs) => {
                    console.log(`[📩] ${numNewMsgs} new message(s) detected on ${this.domain}`);

                    this.imap.search(['UNSEEN'], (err, results) => {
                        if (err) {
                            console.error(`[❌] Search error on ${this.domain}:`, err);
                            return;
                        }

                        if (!results || results.length === 0) {
                            console.log(`[ℹ️] No unseen messages found on ${this.domain}.`);
                            return;
                        }

                        const f = this.imap.fetch(results[results.length - 1], { bodies: '' });
                        f.on('message', (msg, seqno) => {
                            processNewMessage(msg, seqno, this.domain);
                        });

                        f.once('error', (err) => {
                            console.error(`[❌] Fetch error on ${this.domain}:`, err);
                        });

                        f.once('end', () => {
                            console.log(`[✅] Finished fetching unseen messages on ${this.domain}.`);
                        });
                    });
                });
            });
        });

        this.imap.once('error', (err) => {
            console.error(`[❌] IMAP error on ${this.domain}:`, err);
            redisClient.publishMessage('imapError', this.imap);
        });

        this.imap.once('end', () => {
            console.log(`[🔚] IMAP connection ended for ${this.domain}.`);
            redisClient.publishMessage('imapEnded', this.imap._config);
        });

        this.imap.connect();
    }
    disconnect() {
        this.imap.end();
        delete ImapClass.activeImaps[this.domain];
    }
}
module.exports = ImapClass;