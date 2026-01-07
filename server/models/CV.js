import mongoose from 'mongoose';

const CVSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cvName: {
        type: String,
        required: true,
        default: 'CV mới'
    },
    cvFilePath: {
        type: String,
        required: true
    },
    cvText: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // AI analysis data
    cvScore: {
        type: Number
    },
    cvAnalysis: {
        skills: [String],
        experience: String,
        education: String,
        strengths: [String],
        weaknesses: [String]
    },
    cvEmbedding: [Number]
}, {
    timestamps: true
});

// Ensure only one default CV per user
CVSchema.index({ userId: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

const CV = mongoose.model('CV', CVSchema);

export default CV;











