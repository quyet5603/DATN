import ollamaService from '../../services/ollamaService.js';
import Job from '../../models/Job.js';
import User from '../../models/User.js';
import CV from '../../models/CV.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lấy danh sách jobs được AI recommend cho candidate
 * Sử dụng AI để match CV với từng job và tính điểm phù hợp
 * Ưu tiên sử dụng CV từ CV Manager (default CV)
 */
export const getRecommendedJobs = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        error: 'User not authenticated' 
      });
    }
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Get all active jobs with employer info
    const jobs = await Job.find({}).populate('employerId', 'userName avatar userEmail address');
    
    if (jobs.length === 0) {
      return res.json({
        success: true,
        recommendedJobs: [],
        jobs: [],
        total: 0,
        message: 'No jobs available'
      });
    }
    
    // Ưu tiên lấy CV từ CV Manager (default CV)
    let defaultCV = await CV.findOne({ userId, isDefault: true, isActive: true });
    
    // Nếu không có default CV, lấy CV mới nhất
    if (!defaultCV) {
      defaultCV = await CV.findOne({ userId, isActive: true })
        .sort({ updatedAt: -1 });
    }
    
    // Nếu vẫn không có CV từ CV Manager, fallback về User.cvFilePath/cvText (backward compatibility)
    const hasCV = defaultCV || user.cvText || user.cvFilePath;
    
    if (!hasCV) {
      // Nếu chưa có CV, trả về tất cả jobs với match score = 0
      const allJobs = jobs.map((job) => ({
        jobId: job._id.toString(),
        jobTitle: job.jobTitle,
        location: job.location,
        employmentType: job.employmentType,
        salary: job.salary,
        description: job.description,
        matchScore: 0
      }));

      return res.json({
        success: true,
        recommendedJobs: allJobs.slice(0, 10),
        jobs: allJobs.slice(0, 10),
        total: allJobs.length,
        hasCV: false,
        message: 'All available jobs (upload CV for personalized AI recommendations)'
      });
    }

    // Nếu có CV, sử dụng AI để match với từng job
    console.log(`[Recommended Jobs] Matching CV for user ${userId} with ${jobs.length} jobs`);
    
    let cvText = '';
    let cvFilename = 'resume.pdf';

    // Ưu tiên: Lấy CV từ CV Manager
    if (defaultCV && defaultCV.cvFilePath) {
      try {
        const cvPath = path.join(__dirname, '../../', 'uploads', defaultCV.cvFilePath);
        if (fs.existsSync(cvPath)) {
          const cvBuffer = fs.readFileSync(cvPath);
          cvFilename = path.basename(defaultCV.cvFilePath);
          console.log(`[Recommended Jobs] Using CV from CV Manager: ${defaultCV.cvName}`);
          
          // Extract text từ PDF
          if (cvFilename.endsWith('.pdf')) {
            const pdfData = await pdfParse(cvBuffer);
            cvText = pdfData.text;
          } else {
            cvText = cvBuffer.toString('utf-8');
          }
        } else if (defaultCV.cvText) {
          // Fallback: dùng cvText nếu file không tồn tại
          cvText = defaultCV.cvText;
        }
      } catch (error) {
        console.error('Error reading CV file from CV Manager:', error);
      }
    }

    // Fallback: Lấy CV từ User (backward compatibility)
    if (!cvText && user.cvFilePath) {
      try {
        const cvPath = path.join(__dirname, '../../', 'uploads', user.cvFilePath);
        if (fs.existsSync(cvPath)) {
          const cvBuffer = fs.readFileSync(cvPath);
          cvFilename = path.basename(user.cvFilePath);
          console.log(`[Recommended Jobs] Using CV from User model (legacy)`);
          
          // Extract text từ PDF
          if (cvFilename.endsWith('.pdf')) {
            const pdfData = await pdfParse(cvBuffer);
            cvText = pdfData.text;
          } else {
            cvText = cvBuffer.toString('utf-8');
          }
        }
      } catch (error) {
        console.error('Error reading CV file from User:', error);
      }
    }

    // Nếu không có file, dùng cvText
    if (!cvText && (defaultCV?.cvText || user.cvText)) {
      cvText = defaultCV?.cvText || user.cvText;
      console.log(`[Recommended Jobs] Using CV text`);
    }

    // Nếu CV quá ngắn hoặc không có, trả về tất cả jobs không AI analysis
    if (!cvText || cvText.length < 50) {
      console.log(`[Recommended Jobs] CV too short or not available, returning all jobs without AI analysis`);
      
      const allJobs = jobs.map((job) => ({
        jobId: job._id.toString(),
        jobTitle: job.jobTitle,
        location: job.location,
        employmentType: job.employmentType,
        salary: job.salary,
        description: job.description,
        matchScore: 0
      }));

      return res.json({
        success: true,
        recommendedJobs: allJobs.slice(0, 10),
        jobs: allJobs.slice(0, 10),
        total: allJobs.length,
        hasCV: false,
        message: 'All available jobs (upload CV for personalized AI recommendations)'
      });
    }

    // Match CV với từng job (limit để tránh quá chậm)
    // Match với tối đa 30 jobs đầu tiên, sau đó sort và lấy top
    const jobsToMatch = jobs.slice(0, 30);
    console.log(`[Recommended Jobs] Starting to match ${jobsToMatch.length} jobs with CV...`);
    
    const matchPromises = jobsToMatch.map(async (job, index) => {
      try {
        console.log(`[Recommended Jobs] Matching job ${index + 1}/${jobsToMatch.length}: ${job.jobTitle}`);
        
        // Kiểm tra job description
        if (!job.description || !job.description.trim()) {
          console.warn(`[Recommended Jobs] Job ${job._id} has no description, skipping AI analysis`);
          return {
            jobId: job._id.toString(),
            jobTitle: job.jobTitle,
            location: job.location,
            employmentType: job.employmentType,
            salary: job.salary,
            description: job.description,
            matchScore: 0,
            error: 'Job has no description'
          };
        }

        // Phân tích CV với job description
        const jobInfo = {
          description: job.description,
          location: job.location,
          minExperience: job.minExperience,
          requiredSkills: job.requiredSkills,
          jobTitle: job.jobTitle
        };
        
        const analysis = await ollamaService.analyzeCV(
          cvText,
          job.description,
          jobInfo
        );

        const score = analysis?.score || 0;
        console.log(`[Recommended Jobs] Job ${job.jobTitle}: Score = ${score}% (Location: ${analysis.location_match?.match_status}, Experience: ${analysis.experience_match?.match_status})`);

        return {
          jobId: job._id.toString(),
          jobTitle: job.jobTitle,
          location: job.location,
          employmentType: job.employmentType,
          salary: job.salary,
          description: job.description,
          matchScore: score,
          matchReasons: analysis?.match_reasons || null,
          label: analysis?.label || null,
          locationMatch: analysis?.location_match,
          experienceMatch: analysis?.experience_match,
          skillsMatch: analysis?.skills_match
        };
      } catch (error) {
        console.error(`[Recommended Jobs] Error matching job ${job._id} (${job.jobTitle}):`, error.message);
        console.error(`[Recommended Jobs] Error details:`, {
          code: error.code,
          message: error.message,
          stack: error.stack?.substring(0, 200)
        });
        
        // Nếu lỗi, vẫn trả về job với score = 0
        return {
          jobId: job._id.toString(),
          jobTitle: job.jobTitle,
          location: job.location,
          employmentType: job.employmentType,
          salary: job.salary,
          description: job.description,
          matchScore: 0,
          error: error.message || 'Could not analyze',
          errorType: error.code === 'ECONNREFUSED' ? 'SERVICE_NOT_RUNNING' : 'ANALYSIS_ERROR'
        };
      }
    });

    // Chờ tất cả các match hoàn thành
    const matches = await Promise.all(matchPromises);

    // Thêm các jobs còn lại (nếu có) với score = 0
    const remainingJobs = jobs.slice(30).map((job) => ({
      jobId: job._id.toString(),
      jobTitle: job.jobTitle,
      location: job.location,
      employmentType: job.employmentType,
      salary: job.salary,
      description: job.description,
      matchScore: 0
    }));

    const allMatches = [...matches, ...remainingJobs];

    // Sort theo match score (cao nhất trước)
    allMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Trả về top 10 jobs có match score cao nhất
    const topJobs = allMatches.slice(0, 10);

    console.log(`[Recommended Jobs] Returning ${topJobs.length} recommended jobs with scores:`, 
      topJobs.map(j => `${j.jobTitle}: ${j.matchScore}%`));

    res.json({
      success: true,
      recommendedJobs: topJobs,
      jobs: topJobs,
      total: topJobs.length,
      hasCV: true,
      message: 'AI-recommended jobs based on your CV analysis',
      aiPowered: true
    });

  } catch (error) {
    console.error('Error getting recommended jobs:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to get recommended jobs',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

