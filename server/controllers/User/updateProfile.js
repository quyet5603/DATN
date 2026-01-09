import User from '../../models/User.js';

/**
 * Cập nhật thông tin hồ sơ người dùng
 */
export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            userName, 
            userEmail, 
            phoneNumber, 
            dateOfBirth, 
            gender, 
            address, 
            description,
            position,
            personalLink,
            cvSections,
            // Company fields
            companyTitle,
            companyDescription,
            website,
            companyLocations,
            companySize,
            companyType,
            industry,
            country,
            establishedYear,
            workingHours,
            companyIntroduction
        } = req.body;

        // Validate required fields
        if (!userName || !userEmail) {
            return res.status(400).json({
                success: false,
                message: 'Họ tên và Email là bắt buộc'
            });
        }

        // Normalize email: trim whitespace and convert to lowercase
        const normalizedEmail = userEmail.trim().toLowerCase();

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Check if email is already taken by another user (case-insensitive)
        if (normalizedEmail !== user.userEmail.toLowerCase()) {
            const existingUser = await User.findOne({ 
                $or: [
                    { userEmail: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } },
                    { userEmail: normalizedEmail }
                ]
            });
            if (existingUser && existingUser._id.toString() !== id) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã được sử dụng bởi tài khoản khác'
                });
            }
        }

        // Build update object based on role
        const updateData = {
            userName,
            userEmail: normalizedEmail // Lưu email đã được normalize
        };

        // Add personal info fields (for candidate)
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
        if (gender !== undefined) updateData.gender = gender;
        if (address !== undefined) updateData.address = address;
        if (description !== undefined) updateData.description = description;
        if (position !== undefined) updateData.position = position;
        if (personalLink !== undefined) updateData.personalLink = personalLink;
        if (cvSections !== undefined) updateData.cvSections = cvSections;

        // Add company info fields (for employer)
        if (companyTitle !== undefined) updateData.companyTitle = companyTitle;
        if (companyDescription !== undefined) updateData.companyDescription = companyDescription;
        if (website !== undefined) updateData.website = website;
        if (companyLocations !== undefined) updateData.companyLocations = companyLocations;
        if (companySize !== undefined) updateData.companySize = companySize;
        if (companyType !== undefined) updateData.companyType = companyType;
        if (industry !== undefined) updateData.industry = industry;
        if (country !== undefined) updateData.country = country;
        if (establishedYear !== undefined) updateData.establishedYear = establishedYear;
        if (workingHours !== undefined) updateData.workingHours = workingHours;
        if (companyIntroduction !== undefined) updateData.companyIntroduction = companyIntroduction;

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công',
            user: {
                _id: updatedUser._id,
                userName: updatedUser.userName,
                userEmail: updatedUser.userEmail,
                phoneNumber: updatedUser.phoneNumber,
                dateOfBirth: updatedUser.dateOfBirth,
                gender: updatedUser.gender,
                address: updatedUser.address,
                description: updatedUser.description,
                position: updatedUser.position,
                personalLink: updatedUser.personalLink,
                avatar: updatedUser.avatar,
                role: updatedUser.role,
                cvSections: updatedUser.cvSections,
                // Company fields
                companyTitle: updatedUser.companyTitle,
                companyDescription: updatedUser.companyDescription,
                website: updatedUser.website,
                companyLocations: updatedUser.companyLocations,
                companySize: updatedUser.companySize,
                companyType: updatedUser.companyType,
                industry: updatedUser.industry,
                country: updatedUser.country,
                establishedYear: updatedUser.establishedYear,
                workingHours: updatedUser.workingHours,
                companyIntroduction: updatedUser.companyIntroduction
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật thông tin',
            error: error.message
        });
    }
};

