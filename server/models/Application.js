import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
    jobID: {
        type: String,
        required: true,
        ref: 'Job'
    },
    candidateID:{
        type: String,
        required: true,
        ref: 'User'
    },
    applicationStatus:{
        type: String,
        required: true,
    },
    applicationForm:[{ 
        question: { type: String}, 
        answer: { type: String} 
    }],
    candidateFeedback:[{ 
        question: { type: String}, 
        answer: { type: String} 
    }],
    // AI matching fields
    matchScore: {
        type: Number,
        default: 0
    },
    aiAnalysis: {
        strengths: [String],
        weaknesses: [String],
        recommendations: [String]
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

const Application = mongoose.model('Application', ApplicationSchema);

export default Application;