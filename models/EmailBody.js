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
        const result = await this.findOneAndUpdate(
            { message_id: emailData.message_id },
            { $setOnInsert: emailData },
            { upsert: true, new: true, select: ' _id from subject to' }
        );
        if (result.upsertedCount > 0) {
            console.log(`[📥] New email saved (${emailData.message_id}) from ${emailData.domain}`);
            return { success: true, action: 'inserted', result: result._doc };
        } else {
            console.log(`[🔁] Duplicate email ignored (${emailData.message_id}) from ${emailData.domain}`);
            return { success: true, action: 'duplicate', result: result._doc };
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
