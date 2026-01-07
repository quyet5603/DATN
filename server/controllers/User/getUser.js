import User from '../../models/User.js'
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Kiểm tra file CV có tồn tại không
        let cvFileExists = false;
        if (user.cvFilePath) {
            const cvFullPath = path.join(__dirname, '../../uploads/', user.cvFilePath);
            cvFileExists = fs.existsSync(cvFullPath);
            
            if (!cvFileExists) {
                console.warn(`[GetUser] CV file not found: ${cvFullPath}`);
            }
        }

        // Log CV info for debugging
        console.log(`[GetUser] User ${userId} - CV Info:`, {
            hasCvFilePath: !!user.cvFilePath,
            cvFilePath: user.cvFilePath,
            cvFileExists: cvFileExists,
            hasCvText: !!user.cvText,
            cvTextLength: user.cvText?.length || 0,
            hasCvSections: !!user.cvSections,
            cvSectionsKeys: user.cvSections ? Object.keys(user.cvSections) : []
        });

        // Trả về user data với thông tin CV
        const userData = user.toObject();
        userData.cvFileExists = cvFileExists;
        userData.cvFileUrl = user.cvFilePath ? `http://localhost:8080/uploads/${user.cvFilePath}` : null;
        
        // Ensure cvSections is included in response
        if (userData.cvSections) {
            console.log('[GetUser] CV Sections found:', {
                hasIntroduction: !!userData.cvSections.introduction,
                educationCount: userData.cvSections.education?.length || 0,
                experienceCount: userData.cvSections.experience?.length || 0,
                skillsCount: userData.cvSections.skills?.length || 0
            });
        } else {
            console.log('[GetUser] No CV Sections found in user data');
        }

        res.status(200).json(userData);
    } catch (error) {
        console.error('[GetUser] Error:', error);
        res.status(500).json({ message: "Failed to get user", error: error.message });
    }
};

export {getUser};