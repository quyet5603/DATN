/**
 * Service để gọi Python Resume Matcher API
 */
import axios from 'axios';
import FormData from 'form-data';

const RESUME_MATCHER_URL = process.env.RESUME_MATCHER_SERVICE_URL || 'http://localhost:5001';

/**
 * Phân tích một CV với job description
 * @param {Buffer} resumeBuffer - File buffer của CV
 * @param {String} filename - Tên file CV
 * @param {String} jobDescription - Mô tả công việc
 * @returns {Object} Analysis result với score, analysis, suggestions
 */
export async function analyzeResume(resumeBuffer, filename, jobDescription) {
  try {
    const formData = new FormData();
    formData.append('resume_file', resumeBuffer, {
      filename: filename,
      contentType: 'application/pdf'
    });
    formData.append('job_description', jobDescription);

    const response = await axios.post(
      `${RESUME_MATCHER_URL}/api/analyze-resume`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 60000 // 60 seconds timeout cho AI processing
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error calling resume matcher service:', error.message);
    throw new Error(`Resume analysis failed: ${error.message}`);
  }
}

/**
 * Match nhiều CVs với một job description
 * @param {Array} resumes - Array of {buffer, filename}
 * @param {String} jobDescription - Mô tả công việc
 * @returns {Array} Ranked results với scores
 */
export async function matchResumes(resumes, jobDescription) {
  try {
    const formData = new FormData();
    
    resumes.forEach(resume => {
      formData.append('resumes', resume.buffer, {
        filename: resume.filename,
        contentType: 'application/pdf'
      });
    });
    
    formData.append('job_description', jobDescription);

    const response = await axios.post(
      `${RESUME_MATCHER_URL}/api/match-resumes`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 120000 // 2 minutes cho nhiều CVs
      }
    );

    return response.data.results;
  } catch (error) {
    console.error('Error matching resumes:', error.message);
    throw new Error(`Resume matching failed: ${error.message}`);
  }
}

/**
 * Extract text từ CV PDF
 * @param {Buffer} resumeBuffer - File buffer của CV
 * @param {String} filename - Tên file
 * @returns {String} Extracted text
 */
export async function extractResumeText(resumeBuffer, filename) {
  try {
    const formData = new FormData();
    formData.append('resume_file', resumeBuffer, {
      filename: filename,
      contentType: 'application/pdf'
    });

    const response = await axios.post(
      `${RESUME_MATCHER_URL}/api/extract-resume-text`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 30000
      }
    );

    return response.data.text || response.data.raw_text;
  } catch (error) {
    console.error('Error extracting resume text:', error.message);
    throw new Error(`Text extraction failed: ${error.message}`);
  }
}

