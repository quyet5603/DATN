import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/VerifyToken.js';

const router = express.Router();

import { getUsers } from '../controllers/User/getUsers.js';
import { getUser } from '../controllers/User/getUser.js';
import { addUser } from '../controllers/User/addUser.js';
import { deleteUser } from '../controllers/User/deleteUser.js';
import { updateUser } from '../controllers/User/updateUser.js';
import { updateUserByCandidate } from '../controllers/User/updateUserByCandidate.js';
import { updateProfile } from '../controllers/User/updateProfile.js';
import { uploadAvatar, uploadAvatarMiddleware } from '../controllers/User/uploadAvatar.js';

router.get('/all-users', getUsers); 
router.post('/add-user', addUser); 
router.get('/user/:id', getUser); 
router.delete('/delete-user/:id', deleteUser); 
router.put('/update-user/:id', updateUser);
router.put('/update-user-by-candidate/', updateUserByCandidate);

// Profile management routes (require authentication)
router.put('/update-profile/:id', authenticate, updateProfile);
router.post('/upload-avatar/:id', authenticate, uploadAvatarMiddleware, uploadAvatar);

export default router;