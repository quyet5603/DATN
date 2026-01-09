import User from '../models/User.js';
import CV from '../models/CV.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';

/**
 * Service để lấy thông tin context của user cho chatbot
 */
class UserContextService {
  /**
   * Lấy thông tin context đầy đủ của user
   * @param {string} userId - ID của user
   * @returns {Promise<Object>} - Object chứa thông tin user context
   */
  async getUserContext(userId) {
    try {
      if (!userId) {
        return null;
      }

      // Lấy thông tin user
      const user = await User.findById(userId);
      if (!user) {
        return null;
      }

      const context = {
        user: {
          id: user._id.toString(),
          name: user.userName,
          email: user.userEmail,
          role: user.role,
          phoneNumber: user.phoneNumber || 'Chưa cập nhật',
          address: user.address || 'Chưa cập nhật',
          position: user.position || 'Chưa cập nhật',
          description: user.description || '',
          gender: user.gender || 'Chưa cập nhật',
          dateOfBirth: user.dateOfBirth || 'Chưa cập nhật',
        }
      };

      // Nếu là candidate, lấy thông tin CV và applications
      if (user.role === 'candidate') {
        // Lấy CV mặc định hoặc CV mới nhất
        let defaultCV = await CV.findOne({ userId, isDefault: true, isActive: true });
        if (!defaultCV) {
          defaultCV = await CV.findOne({ userId, isActive: true })
            .sort({ updatedAt: -1 });
        }

        // Lấy CV text từ CV model hoặc User model (backward compatibility)
        let cvText = '';
        if (defaultCV && defaultCV.cvText) {
          cvText = defaultCV.cvText;
        } else if (user.cvText) {
          cvText = user.cvText;
        }

        // Lấy CV sections từ User model
        const cvSections = user.cvSections || {};

        context.candidate = {
          hasCV: !!(cvText || defaultCV),
          cvText: cvText ? cvText.substring(0, 2000) : '', // Giới hạn độ dài
          cvSections: {
            introduction: cvSections.introduction || '',
            education: cvSections.education || [],
            experience: cvSections.experience || [],
            skills: cvSections.skills || [],
            languages: cvSections.languages || [],
            projects: cvSections.projects || [],
            certificates: cvSections.certificates || [],
            awards: cvSections.awards || []
          }
        };

        // Lấy danh sách applications
        const applications = await Application.find({ candidateID: userId.toString() })
          .limit(10)
          .sort({ createdAt: -1 })
          .populate('jobID', 'jobTitle');

        context.candidate.applications = applications.map(app => ({
          jobTitle: app.jobID?.jobTitle || 'N/A',
          status: app.applicationStatus,
          matchScore: app.matchScore || 0,
          createdAt: app.createdAt
        }));
      }

      // Nếu là employer, lấy thông tin công ty và jobs
      if (user.role === 'employer') {
        context.employer = {
          companyTitle: user.companyTitle || 'Chưa cập nhật',
          companyDescription: user.companyDescription || '',
          website: user.website || '',
          companyLocations: user.companyLocations || '',
          companySize: user.companySize || '',
          companyType: user.companyType || '',
          industry: user.industry || '',
          country: user.country || '',
          establishedYear: user.establishedYear || '',
          workingHours: user.workingHours || '',
          companyIntroduction: user.companyIntroduction || ''
        };

        // Lấy danh sách jobs của employer
        const jobs = await Job.find({ employerId: userId })
          .limit(10)
          .sort({ createdAt: -1 })
          .select('jobTitle location salary description isActive createdAt');

        context.employer.jobs = jobs.map(job => ({
          title: job.jobTitle,
          location: job.location,
          salary: job.salary,
          description: job.description ? job.description.substring(0, 200) : '',
          isActive: job.isActive,
          createdAt: job.createdAt
        }));
      }

      return context;
    } catch (error) {
      console.error('[UserContextService] Error getting user context:', error);
      return null;
    }
  }

  /**
   * Format user context thành string để đưa vào prompt
   * @param {Object} context - User context object
   * @returns {string} - Formatted context string
   */
  formatContextForPrompt(context) {
    if (!context) {
      return '';
    }

    let prompt = '';

    // Thông tin cơ bản
    prompt += `THÔNG TIN NGƯỜI DÙNG:\n`;
    prompt += `- Tên: ${context.user.name}\n`;
    prompt += `- Vai trò: ${context.user.role === 'candidate' ? 'Ứng viên' : context.user.role === 'employer' ? 'Nhà tuyển dụng' : 'Quản trị viên'}\n`;
    prompt += `- Email: ${context.user.email}\n`;
    prompt += `- Số điện thoại: ${context.user.phoneNumber}\n`;
    prompt += `- Địa chỉ: ${context.user.address}\n`;
    if (context.user.position) {
      prompt += `- Chức vụ: ${context.user.position}\n`;
    }
    if (context.user.description) {
      prompt += `- Mô tả: ${context.user.description}\n`;
    }
    prompt += `\n`;

    // Thông tin candidate
    if (context.candidate) {
      prompt += `THÔNG TIN ỨNG VIÊN:\n`;
      
      if (context.candidate.hasCV) {
        if (context.candidate.cvText) {
          prompt += `CV Text: ${context.candidate.cvText}\n`;
        }

        const sections = context.candidate.cvSections;
        
        if (sections.introduction) {
          prompt += `Giới thiệu: ${sections.introduction}\n`;
        }

        if (sections.education && sections.education.length > 0) {
          prompt += `Học vấn:\n`;
          sections.education.forEach((edu, idx) => {
            prompt += `  ${idx + 1}. ${edu.school || ''} - ${edu.major || ''} (${edu.from || ''} - ${edu.to || ''})\n`;
          });
        }

        if (sections.experience && sections.experience.length > 0) {
          prompt += `Kinh nghiệm:\n`;
          sections.experience.forEach((exp, idx) => {
            prompt += `  ${idx + 1}. ${exp.position || ''} tại ${exp.company || ''} (${exp.from || ''} - ${exp.to || ''})\n`;
            if (exp.description) {
              prompt += `     Mô tả: ${exp.description.substring(0, 100)}\n`;
            }
          });
        }

        if (sections.skills && sections.skills.length > 0) {
          prompt += `Kỹ năng:\n`;
          sections.skills.forEach((skill, idx) => {
            prompt += `  ${idx + 1}. ${skill.skill || ''} - ${skill.experience || ''}\n`;
          });
        }
      } else {
        prompt += `Chưa có CV được upload.\n`;
      }

      if (context.candidate.applications && context.candidate.applications.length > 0) {
        prompt += `\nĐơn ứng tuyển gần đây:\n`;
        context.candidate.applications.slice(0, 5).forEach((app, idx) => {
          prompt += `  ${idx + 1}. ${app.jobTitle} - Trạng thái: ${app.status} - Điểm phù hợp: ${app.matchScore}\n`;
        });
      }

      prompt += `\n`;
    }

    // Thông tin employer
    if (context.employer) {
      prompt += `THÔNG TIN NHÀ TUYỂN DỤNG:\n`;
      prompt += `- Tên công ty: ${context.employer.companyTitle}\n`;
      if (context.employer.companyDescription) {
        prompt += `- Mô tả công ty: ${context.employer.companyDescription.substring(0, 200)}\n`;
      }
      if (context.employer.website) {
        prompt += `- Website: ${context.employer.website}\n`;
      }
      if (context.employer.industry) {
        prompt += `- Ngành nghề: ${context.employer.industry}\n`;
      }
      if (context.employer.companySize) {
        prompt += `- Quy mô: ${context.employer.companySize}\n`;
      }

      if (context.employer.jobs && context.employer.jobs.length > 0) {
        prompt += `\nCông việc đã đăng:\n`;
        context.employer.jobs.slice(0, 5).forEach((job, idx) => {
          prompt += `  ${idx + 1}. ${job.title} - ${job.location} - ${job.salary}\n`;
        });
      }

      prompt += `\n`;
    }

    return prompt;
  }
}

export default new UserContextService();
