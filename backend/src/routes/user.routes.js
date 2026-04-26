import express from 'express';
import { register, login, getProfile, updateProfile, logout, addContact } from '../controllers/user.controller.js';

import authMiddleware from '../middleware/auth.js';
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/logout", authMiddleware, logout);
router.post("/add-contact", authMiddleware, addContact);



export default router; 