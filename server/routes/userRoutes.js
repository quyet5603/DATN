import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/VerifyToken.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = express.Router();

import { getUsers } from '../controllers/User/getUsers.js';
import { getUser } from '../controllers/User/getUser.js';
import { addUser } from '../controllers/User/addUser.js';
import { deleteUser } from '../controllers/User/deleteUser.js';
import { updateUser } from '../controllers/User/updateUser.js';
import { updateUserByCandidate } from '../controllers/User/updateUserByCandidate.js';
import { updateProfile } from '../controllers/User/updateProfile.js';
import { uploadAvatar, uploadAvatarMiddleware } from '../controllers/User/uploadAvatar.js';

// Admin-only routes - bảo vệ các routes nguy hiểm
router.get('/all-users', authenticate, requireAdmin, getUsers); 
router.post('/add-user', authenticate, requireAdmin, addUser); 
router.get('/user/:id', getUser); // Public - ai cũng có thể xem profile
router.delete('/delete-user/:id', authenticate, requireAdmin, deleteUser); 
router.put('/update-user/:id', authenticate, requireAdmin, updateUser);
router.put('/update-user-by-candidate/', updateUserByCandidate);

// Profile management routes (require authentication)
router.put('/update-profile/:id', authenticate, updateProfile);
router.post('/upload-avatar/:id', authenticate, uploadAvatarMiddleware, uploadAvatar);

export default router;