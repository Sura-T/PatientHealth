import express from 'express';
import { signup, login } from '../controllers/authController.js';

const router = express.Router();

// @route   POST /api/v1/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/v1/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', login);

export default router;
