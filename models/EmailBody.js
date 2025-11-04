const mongoose = require('mongoose');
const emailSchema = new mongoose.Schema({
    message_id: { type: String, required: true, unique: true },
    from: { type: String, required: true },
    subject: { type: String, required: true },
    created_at: { type: Date, required: true },
    email_body: { type: String, required: true },
    to: { type: String, required: true },
    inserted_at: { type: Date, default: Date.now }
});

emailSchema.statics.save = async function (emailData) {
    try {
        const result = await this.updateOne(
            { message_id: emailData.message_id },
            { $setOnInsert: emailData },
            { upsert: true }
        );

        if (result.upsertedId) {
            const newDoc = await this.findById(result.upsertedId);
            console.log(`[📥] New email saved (${emailData.message_id}) from ${emailData.domain}`);
            return { success: true, action: 'inserted', result: newDoc._doc };
        } else {
            console.log(`[🔁] Duplicate email ignored (${emailData.message_id}) from ${emailData.domain}`);
            return { success: false, action: 'duplicate', result: null };
        }
    } catch (err) {
        if (err.code === 11000) {
            console.warn(`[⚠️] Duplicate Message-ID skipped: ${emailData.message_id} from ${emailData.domain}`);
            return { success: false, error: 'duplicate_key', message: err.message };
        } else {
            console.error('[❌] Error saving email:', err);
            return { success: false, error: 'database_error', message: err.message };
        }
    }
}
const EmailModel = mongoose.model('Email', emailSchema);

module.exports = EmailModel;
