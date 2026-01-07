import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    jobID: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    employmentType: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    specificAddress: {
        type: String
    },
    salary: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    level: {
        type: String
    },
    employeeType: {
        type: String
    },
    quantity: {
        type: Number,
        default: 1
    },
    deadline: {
        type: Date
    },
    educationRequirement: {
        type: String
    },
    experienceRequirement: {
        type: String
    },
    genderRequirement: {
        type: String
    },
    jobRequirement: {
        type: String
    },
    benefits: {
        type: String
    },
    applicationForm:{ 
        question: [{ type: String}], 
        answer: [{ type: String}] 
    },
    applicants: [{
        applicant : {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'shortlist', 'rejected'],
            default: 'active'
        }
    }],
    // AI-related fields
    requiredSkills: [String],
    jobEmbedding: [Number], // Vector embedding cho semantic search
    minExperience: Number,
    educationLevel: String,
    employerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Tạm thời optional để không break dữ liệu cũ
    }
}, {
    timestamps: true // Tự động thêm createdAt và updatedAt
});

const Job = mongoose.model('Job', JobSchema);

export default Job;