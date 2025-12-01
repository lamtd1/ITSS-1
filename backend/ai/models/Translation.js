import mongoose from 'mongoose';

const TranslationSchema = new mongoose.Schema({
    input: {
        text: String,
        source: String,
        target: String
    },
    output: mongoose.Schema.Types.Mixed,
    type: { type: String, enum: ['word', 'sentence', 'list'] },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Translation', TranslationSchema);
