import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import jwtConfig from '../config/jwt.js';

// Signup function
export const signup = async (req, res) => {
  const { email, firstName, lastName, password, role } = req.body;

  try {
    // Validate inputs
    if (!email || !firstName || !lastName || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use.' });
    }

    // Create a new User instance
    const newUser = new User({
      email,
      firstName,
      lastName,
      password, // Password will be hashed by the pre-save hook in User.js
      role, // Defaults to 'patient' if not provided
    });

    // Save the user
    const savedUser = await newUser.save();

    // Generate a JWT
    const token = jwt.sign(
      { id: savedUser._id, role: savedUser.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // Respond with user details (excluding password) and the token
    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        avatarUrl: savedUser.avatarUrl,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
};

// Login function
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Password incorrect.' });
    }

    // Generate a JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    // Respond with user details (excluding password) and the token
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};
