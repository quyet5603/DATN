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
    position: {
        type: String
    },
    personalLink: {
        type: String
    },
    avatar: {
        type: String
    },
    // Company information fields (for employer role)
    companyTitle: {
        type: String
    },
    companyDescription: {
        type: String
    },
    website: {
        type: String
    },
    companyLocations: {
        type: String // Có thể là string hoặc array, tạm thời dùng string
    },
    companySize: {
        type: String
    },
    companyType: {
        type: String
    },
    industry: {
        type: String
    },
    country: {
        type: String
    },
    establishedYear: {
        type: String
    },
    workingHours: {
        type: String
    },
    companyIntroduction: {
        type: String
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "employer", "candidate"],
        default: "candidate"
    },
    isAssigned: {
        type: Boolean
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
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
    // CV Sections for CV Template
    cvSections: {
        introduction: { type: String, default: '' },
        education: [{
            school: String,
            major: String,
            isCurrent: Boolean,
            from: String,
            to: String
        }],
        experience: [{
            company: String,
            position: String,
            isCurrent: Boolean,
            from: String,
            to: String,
            description: String,
            projects: String
        }],
        skills: [{
            skill: String,
            experience: String
        }],
        languages: [{
            language: String,
            level: String
        }],
        projects: [{
            name: String,
            isCurrent: Boolean,
            startMonth: String,
            startYear: String,
            endMonth: String,
            endYear: String,
            description: String,
            link: String
        }],
        certificates: [{
            name: String,
            organization: String,
            year: String
        }],
        awards: [{
            name: String,
            organization: String,
            year: String,
            description: String
        }]
    },
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
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

const User = mongoose.model('User', UserSchema);

export default User;