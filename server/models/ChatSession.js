import mongoose from 'mongoose';

const ChatSessionSchema = new mongoose.Schema({
    candidateID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: false // Có thể là general interview
    },
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    sessionType: {
        type: String,
        enum: ['interview', 'general'],
        default: 'interview'
    },
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        feedback: String,
        score: Number
    }],
    summary: {
        overallScore: Number,
        feedback: [String],
        strengths: [String],
        weaknesses: [String],
        recommendations: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
});

const ChatSession = mongoose.model('ChatSession', ChatSessionSchema);

export default ChatSession;

