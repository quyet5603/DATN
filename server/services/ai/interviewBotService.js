/**
 * Service để gọi Python Interview Bot API
 */
import axios from 'axios';

const INTERVIEW_BOT_URL = process.env.INTERVIEW_BOT_SERVICE_URL || 'http://localhost:5002';

/**
 * Bắt đầu một interview session mới
 * @param {String} jobTitle - Tiêu đề công việc
 * @param {String} jobDescription - Mô tả công việc (optional)
 * @param {String} candidateName - Tên ứng viên (optional)
 * @returns {Object} {session_id, first_question, status}
 */
export async function startInterview(jobTitle, jobDescription = null, candidateName = null) {
  try {
    console.log(`[Interview Bot] Calling ${INTERVIEW_BOT_URL}/api/start-interview`);
    console.log(`[Interview Bot] Request data:`, { jobTitle, jobDescription: jobDescription?.substring(0, 100), candidateName });
    
    const response = await axios.post(
      `${INTERVIEW_BOT_URL}/api/start-interview`,
      {
        job_title: jobTitle,
        job_description: jobDescription,
        candidate_name: candidateName
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log(`[Interview Bot] Response status: ${response.status}`);
    console.log(`[Interview Bot] Response data:`, response.data);
    return response.data;
  } catch (error) {
    console.error('[Interview Bot] Error starting interview:', error.message);
    if (error.response) {
      console.error('[Interview Bot] Response status:', error.response.status);
      console.error('[Interview Bot] Response data:', error.response.data);
      throw new Error(`Failed to start interview: ${error.response.data?.detail || error.response.data?.error || error.message}`);
    } else if (error.request) {
      console.error('[Interview Bot] No response received. Is the service running?');
      throw new Error(`Cannot connect to interview bot service at ${INTERVIEW_BOT_URL}. Please ensure the service is running.`);
    } else {
      throw new Error(`Failed to start interview: ${error.message}`);
    }
  }
}

/**
 * Gửi message trong interview và nhận response
 * @param {String} sessionId - ID của session
 * @param {String} message - Câu trả lời của user
 * @returns {Object} {response, feedback, score}
 */
export async function sendChatMessage(sessionId, message) {
  try {
    const response = await axios.post(
      `${INTERVIEW_BOT_URL}/api/chat`,
      {
        session_id: sessionId,
        message: message
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error.message);
    throw new Error(`Failed to send message: ${error.message}`);
  }
}

/**
 * Kết thúc interview và nhận tổng kết
 * @param {String} sessionId - ID của session
 * @returns {Object} Summary với score, feedback, recommendations
 */
export async function endInterview(sessionId) {
  try {
    const response = await axios.post(
      `${INTERVIEW_BOT_URL}/api/end-interview/${sessionId}`,
      null,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error ending interview:', error.message);
    throw new Error(`Failed to end interview: ${error.message}`);
  }
}

/**
 * Lấy thông tin session
 * @param {String} sessionId - ID của session
 * @returns {Object} Session data với messages
 */
export async function getSession(sessionId) {
  try {
    const response = await axios.get(
      `${INTERVIEW_BOT_URL}/api/session/${sessionId}`,
      {
        timeout: 10000
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error getting session:', error.message);
    throw new Error(`Failed to get session: ${error.message}`);
  }
}

