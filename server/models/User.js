import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    
    userName:{
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userPassword: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String
    },
    dateOfBirth: {
        type: String
    },
    description: {
        type: String
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        required: true,
        enum: ["employer", "candidate"],
        default: "candidate"
    },
    isAssigned: {
        type: Boolean
    },
    applications: [{
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'shortlist', 'rejected'],
            default: 'active'
        }
    }],
    // AI-related fields
    cvFilePath: {
        type: String
    },
    cvText: {
        type: String
    },
    cvScore: {
        type: Number
    },
    cvAnalysis: {
        skills_match: [String],
        experience_match: String,
        education_match: String,
        strengths: [String],
        weaknesses: [String]
    },
    cvSuggestions: [String],
    cvEmbedding: [Number], // Vector embedding cho semantic search
    // Password reset fields
    resetPasswordCode: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    // Email verification fields
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String,
        default: null
    },
    verificationExpires: {
        type: Date,
        default: null
    }
});

const User = mongoose.model('User', UserSchema);

export default User;