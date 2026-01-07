import CV from '../../models/CV.js';

/**
 * Service để chấm điểm CV dựa trên dữ liệu phân tích
 */
class CVScoringService {
    /**
     * Tính điểm tổng thể cho CV dựa trên các tiêu chí
     * @param {Object} cvAnalysis - Dữ liệu phân tích từ CV
     * @returns {Object} - Điểm số và phân tích chi tiết
     */
    calculateCVScore(cvAnalysis) {
        const scores = {
            skillsScore: 0,
            experienceScore: 0,
            educationScore: 0,
            strengthsScore: 0,
            completenessScore: 0
        };

        // 1. Điểm kỹ năng (0-25 điểm)
        if (cvAnalysis.skills && Array.isArray(cvAnalysis.skills)) {
            const skillCount = cvAnalysis.skills.length;
            if (skillCount >= 10) {
                scores.skillsScore = 25;
            } else if (skillCount >= 7) {
                scores.skillsScore = 20;
            } else if (skillCount >= 5) {
                scores.skillsScore = 15;
            } else if (skillCount >= 3) {
                scores.skillsScore = 10;
            } else if (skillCount > 0) {
                scores.skillsScore = 5;
            }
        }

        // 2. Điểm kinh nghiệm (0-30 điểm)
        if (cvAnalysis.experience) {
            const expText = cvAnalysis.experience.toLowerCase();
            
            // Tìm số năm kinh nghiệm
            const yearMatches = expText.match(/(\d+)\s*(năm|years?)/g);
            if (yearMatches && yearMatches.length > 0) {
                // Lấy số năm lớn nhất
                const years = yearMatches.map(match => {
                    const num = parseInt(match.match(/\d+/)[0]);
                    return num;
                });
                const maxYears = Math.max(...years);
                
                if (maxYears >= 5) {
                    scores.experienceScore = 30;
                } else if (maxYears >= 3) {
                    scores.experienceScore = 25;
                } else if (maxYears >= 2) {
                    scores.experienceScore = 20;
                } else if (maxYears >= 1) {
                    scores.experienceScore = 15;
                } else {
                    scores.experienceScore = 10;
                }
            } else if (expText.includes('fresher') || expText.includes('mới') || expText.includes('chưa có')) {
                scores.experienceScore = 5;
            } else {
                // Có mô tả kinh nghiệm nhưng không rõ số năm
                scores.experienceScore = 12;
            }
        }

        // 3. Điểm học vấn (0-20 điểm)
        if (cvAnalysis.education) {
            const eduText = cvAnalysis.education.toLowerCase();
            
            if (eduText.includes('tiến sĩ') || eduText.includes('phd') || eduText.includes('doctorate')) {
                scores.educationScore = 20;
            } else if (eduText.includes('thạc sĩ') || eduText.includes('master')) {
                scores.educationScore = 18;
            } else if (eduText.includes('đại học') || eduText.includes('bachelor') || eduText.includes('cử nhân')) {
                scores.educationScore = 15;
            } else if (eduText.includes('cao đẳng') || eduText.includes('college')) {
                scores.educationScore = 12;
            } else if (eduText.includes('trung cấp') || eduText.includes('diploma')) {
                scores.educationScore = 8;
            } else {
                scores.educationScore = 5;
            }
        }

        // 4. Điểm điểm mạnh (0-15 điểm)
        if (cvAnalysis.strengths && Array.isArray(cvAnalysis.strengths)) {
            const strengthCount = cvAnalysis.strengths.length;
            if (strengthCount >= 5) {
                scores.strengthsScore = 15;
            } else if (strengthCount >= 3) {
                scores.strengthsScore = 12;
            } else if (strengthCount >= 2) {
                scores.strengthsScore = 8;
            } else if (strengthCount > 0) {
                scores.strengthsScore = 5;
            }
        }

        // 5. Điểm hoàn thiện (0-10 điểm)
        let completenessCount = 0;
        if (cvAnalysis.skills && cvAnalysis.skills.length > 0) completenessCount++;
        if (cvAnalysis.experience) completenessCount++;
        if (cvAnalysis.education) completenessCount++;
        if (cvAnalysis.strengths && cvAnalysis.strengths.length > 0) completenessCount++;
        
        scores.completenessScore = (completenessCount / 4) * 10;

        // Tổng điểm
        const totalScore = Math.round(
            scores.skillsScore + 
            scores.experienceScore + 
            scores.educationScore + 
            scores.strengthsScore + 
            scores.completenessScore
        );

        // Giảm điểm nếu có điểm yếu nhiều
        let finalScore = totalScore;
        if (cvAnalysis.weaknesses && Array.isArray(cvAnalysis.weaknesses)) {
            const weaknessCount = cvAnalysis.weaknesses.length;
            if (weaknessCount >= 5) {
                finalScore -= 10;
            } else if (weaknessCount >= 3) {
                finalScore -= 5;
            }
        }

        // Đảm bảo điểm trong khoảng 0-100
        finalScore = Math.max(0, Math.min(100, finalScore));

        return {
            totalScore: finalScore,
            breakdown: scores,
            grade: this.getGrade(finalScore),
            recommendation: this.getRecommendation(finalScore, scores)
        };
    }

    /**
     * Xếp loại CV dựa trên điểm
     */
    getGrade(score) {
        if (score >= 90) return { label: 'Xuất sắc', emoji: '🌟', color: '#10b981' };
        if (score >= 80) return { label: 'Tốt', emoji: '👍', color: '#22c55e' };
        if (score >= 70) return { label: 'Khá', emoji: '😊', color: '#84cc16' };
        if (score >= 60) return { label: 'Trung bình', emoji: '😐', color: '#eab308' };
        if (score >= 50) return { label: 'Yếu', emoji: '😕', color: '#f97316' };
        return { label: 'Kém', emoji: '😞', color: '#ef4444' };
    }

    /**
     * Đưa ra khuyến nghị cải thiện CV
     */
    getRecommendation(totalScore, scores) {
        const recommendations = [];

        if (scores.skillsScore < 15) {
            recommendations.push({
                area: 'Kỹ năng',
                priority: 'high',
                message: 'Cần bổ sung thêm kỹ năng chuyên môn và kỹ năng mềm',
                suggestion: 'Liệt kê đầy đủ các kỹ năng kỹ thuật, công cụ, và kỹ năng mềm bạn có'
            });
        }

        if (scores.experienceScore < 15) {
            recommendations.push({
                area: 'Kinh nghiệm',
                priority: 'high',
                message: 'Mô tả kinh nghiệm làm việc chưa đầy đủ',
                suggestion: 'Bổ sung chi tiết về các dự án đã tham gia, vai trò và thành tích đạt được'
            });
        }

        if (scores.educationScore < 10) {
            recommendations.push({
                area: 'Học vấn',
                priority: 'medium',
                message: 'Thông tin học vấn cần được bổ sung',
                suggestion: 'Ghi rõ bằng cấp, trường học, chuyên ngành và thời gian học'
            });
        }

        if (scores.strengthsScore < 8) {
            recommendations.push({
                area: 'Điểm mạnh',
                priority: 'medium',
                message: 'Chưa thể hiện rõ điểm mạnh cá nhân',
                suggestion: 'Nêu bật những điểm mạnh và thành tích nổi bật của bạn'
            });
        }

        if (scores.completenessScore < 7) {
            recommendations.push({
                area: 'Tính hoàn thiện',
                priority: 'high',
                message: 'CV còn thiếu nhiều thông tin quan trọng',
                suggestion: 'Hoàn thiện đầy đủ các mục: kỹ năng, kinh nghiệm, học vấn, và thông tin cá nhân'
            });
        }

        if (totalScore >= 80 && recommendations.length === 0) {
            recommendations.push({
                area: 'Tổng thể',
                priority: 'low',
                message: 'CV của bạn đã rất tốt!',
                suggestion: 'Hãy đảm bảo cập nhật CV thường xuyên với các kỹ năng và kinh nghiệm mới'
            });
        }

        return recommendations;
    }

    /**
     * Cập nhật điểm cho CV trong database
     */
    async updateCVScore(cvId) {
        try {
            const cv = await CV.findById(cvId);
            if (!cv) {
                throw new Error('CV not found');
            }

            // Tính điểm từ cvAnalysis
            const scoreData = this.calculateCVScore(cv.cvAnalysis || {});
            
            // Cập nhật điểm vào database
            cv.cvScore = scoreData.totalScore;
            cv.updatedAt = new Date();
            await cv.save();

            return {
                cvId: cv._id,
                cvName: cv.cvName,
                score: scoreData.totalScore,
                grade: scoreData.grade,
                breakdown: scoreData.breakdown,
                recommendations: scoreData.recommendation
            };
        } catch (error) {
            console.error('Error updating CV score:', error);
            throw error;
        }
    }

    /**
     * Tính điểm cho tất cả CV của một user
     */
    async updateAllUserCVScores(userId) {
        try {
            const cvs = await CV.find({ userId, isActive: true });
            const results = [];

            for (const cv of cvs) {
                try {
                    const scoreData = await this.updateCVScore(cv._id);
                    results.push(scoreData);
                } catch (error) {
                    console.error(`Error scoring CV ${cv._id}:`, error);
                    results.push({
                        cvId: cv._id,
                        error: error.message
                    });
                }
            }

            return results;
        } catch (error) {
            console.error('Error updating user CV scores:', error);
            throw error;
        }
    }

    /**
     * Lấy điểm và phân tích cho CV
     */
    async getCVScore(cvId) {
        try {
            const cv = await CV.findById(cvId);
            if (!cv) {
                throw new Error('CV not found');
            }

            // Nếu chưa có điểm, tính điểm mới
            if (!cv.cvScore && cv.cvAnalysis) {
                return await this.updateCVScore(cvId);
            }

            // Trả về điểm hiện tại
            const scoreData = this.calculateCVScore(cv.cvAnalysis || {});
            
            return {
                cvId: cv._id,
                cvName: cv.cvName,
                score: cv.cvScore || scoreData.totalScore,
                grade: scoreData.grade,
                breakdown: scoreData.breakdown,
                recommendations: scoreData.recommendation,
                lastUpdated: cv.updatedAt
            };
        } catch (error) {
            console.error('Error getting CV score:', error);
            throw error;
        }
    }

    /**
     * So sánh điểm giữa nhiều CV
     */
    async compareCVScores(cvIds) {
        try {
            const results = [];
            
            for (const cvId of cvIds) {
                try {
                    const scoreData = await this.getCVScore(cvId);
                    results.push(scoreData);
                } catch (error) {
                    console.error(`Error getting score for CV ${cvId}:`, error);
                }
            }

            // Sắp xếp theo điểm cao xuống thấp
            results.sort((a, b) => b.score - a.score);

            return {
                cvs: results,
                highest: results[0],
                lowest: results[results.length - 1],
                average: results.reduce((sum, cv) => sum + cv.score, 0) / results.length
            };
        } catch (error) {
            console.error('Error comparing CV scores:', error);
            throw error;
        }
    }
}

export default new CVScoringService();
