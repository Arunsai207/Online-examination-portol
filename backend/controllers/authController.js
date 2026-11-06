// ============================================================
// Auth Controller — Registration, Login, Password Reset
// ============================================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const emailService = require('../services/emailService');
const { pool } = require('../config/db');
const { ROLES } = require('../utils/constants');
require('dotenv').config();

const authController = {
    // ===== Student Registration =====
    register: async (req, res, next) => {
        try {
            const { name, email, password, phone, course } = req.body;

            // Check if email already exists
            const existingStudent = await Student.findByEmail(email);
            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create student
            const student = await Student.create({
                name, email, password: hashedPassword, phone, course
            });

            // Generate JWT
            const token = jwt.sign(
                { id: student.id, email, role: ROLES.STUDENT },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    token,
                    user: {
                        id: student.id,
                        name: student.name,
                        email: student.email,
                        role: ROLES.STUDENT
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // ===== Login (Admin & Student) =====
    login: async (req, res, next) => {
        try {
            const { email, password, role } = req.body;

            let user;
            let userRole;

            if (role === ROLES.ADMIN) {
                user = await Admin.findByEmail(email);
                userRole = ROLES.ADMIN;
            } else {
                user = await Student.findByEmail(email);
                userRole = ROLES.STUDENT;
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Generate JWT
            const token = jwt.sign(
                { id: user.id, email: user.email, role: userRole },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
            );

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: userRole
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // ===== Forgot Password =====
    forgotPassword: async (req, res, next) => {
        try {
            const { email } = req.body;

            // Check in both tables
            let user = await Student.findByEmail(email);
            if (!user) {
                user = await Admin.findByEmail(email);
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'No account found with that email'
                });
            }

            // Generate reset token
            const token = uuidv4();
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour

            // Store token in database
            await pool.execute(
                'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
                [email, token, expiresAt]
            );

            // Send reset email
            await emailService.sendPasswordReset(email, token);

            res.json({
                success: true,
                message: 'Password reset link sent to your email'
            });
        } catch (error) {
            next(error);
        }
    },

    // ===== Reset Password =====
    resetPassword: async (req, res, next) => {
        try {
            const { token, password } = req.body;

            // Find valid token
            const [rows] = await pool.execute(
                'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
                [token]
            );

            if (rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token'
                });
            }

            const resetRecord = rows[0];

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Update password in appropriate table
            let updated = false;
            const student = await Student.findByEmail(resetRecord.email);
            if (student) {
                await Student.updatePassword(student.id, hashedPassword);
                updated = true;
            } else {
                const admin = await Admin.findByEmail(resetRecord.email);
                if (admin) {
                    await Admin.updatePassword(admin.id, hashedPassword);
                    updated = true;
                }
            }

            // Delete used token
            await pool.execute('DELETE FROM password_resets WHERE email = ?', [resetRecord.email]);

            if (updated) {
                res.json({
                    success: true,
                    message: 'Password reset successful. You can now login with your new password.'
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
        } catch (error) {
            next(error);
        }
    },

    // ===== Get Current User =====
    getMe: async (req, res, next) => {
        try {
            let user;
            if (req.user.role === ROLES.ADMIN) {
                user = await Admin.findById(req.user.id);
            } else {
                user = await Student.findById(req.user.id);
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: { ...user, role: req.user.role }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;
