// ============================================================
// Student Controller — CRUD operations
// ============================================================
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const { getPagination } = require('../utils/helpers');

const studentController = {
    // Get all students with search and pagination
    getAll: async (req, res, next) => {
        try {
            const { search } = req.query;
            const { page, limit } = getPagination(req.query.page, req.query.limit);
            const result = await Student.findAll(search, page, limit);
            res.json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    },

    // Get student by ID
    getById: async (req, res, next) => {
        try {
            const student = await Student.findById(req.params.id);
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }
            res.json({ success: true, data: student });
        } catch (error) {
            next(error);
        }
    },

    // Create student (admin)
    create: async (req, res, next) => {
        try {
            const { name, email, password, phone, course } = req.body;

            const existing = await Student.findByEmail(email);
            if (existing) {
                return res.status(400).json({ success: false, message: 'Email already registered' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const student = await Student.create({
                name, email, password: hashedPassword, phone, course
            });

            res.status(201).json({
                success: true,
                message: 'Student created successfully',
                data: student
            });
        } catch (error) {
            next(error);
        }
    },

    // Update student
    update: async (req, res, next) => {
        try {
            const { name, email, phone, course } = req.body;
            const student = await Student.findById(req.params.id);

            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }

            // Check if new email conflicts with another student
            if (email !== student.email) {
                const existing = await Student.findByEmail(email);
                if (existing) {
                    return res.status(400).json({ success: false, message: 'Email already in use' });
                }
            }

            await Student.update(req.params.id, { name, email, phone, course });
            res.json({ success: true, message: 'Student updated successfully' });
        } catch (error) {
            next(error);
        }
    },

    // Delete student
    delete: async (req, res, next) => {
        try {
            const student = await Student.findById(req.params.id);
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }

            await Student.delete(req.params.id);
            res.json({ success: true, message: 'Student deleted successfully' });
        } catch (error) {
            next(error);
        }
    },

    // Update profile (student self)
    updateProfile: async (req, res, next) => {
        try {
            const { name, phone, course } = req.body;
            const student = await Student.findById(req.user.id);

            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }

            await Student.update(req.user.id, {
                name: name || student.name,
                email: student.email,
                phone: phone || student.phone,
                course: course || student.course
            });

            res.json({ success: true, message: 'Profile updated successfully' });
        } catch (error) {
            next(error);
        }
    },

    // Change password (student self)
    changePassword: async (req, res, next) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const student = await Student.findByEmail(req.user.email);

            const isMatch = await bcrypt.compare(currentPassword, student.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Current password is incorrect' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            await Student.updatePassword(req.user.id, hashedPassword);

            res.json({ success: true, message: 'Password changed successfully' });
        } catch (error) {
            next(error);
        }
    },

    // Save Face Descriptor (student self)
    updateFaceDescriptor: async (req, res, next) => {
        try {
            const { face_descriptor } = req.body;
            if (!face_descriptor) {
                return res.status(400).json({ success: false, message: 'Face descriptor is required' });
            }

            const student = await Student.findById(req.user.id);
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found' });
            }

            // Save descriptor as JSON string
            await Student.updateFaceDescriptor(req.user.id, JSON.stringify(face_descriptor));

            res.json({ success: true, message: 'Face registration successful!' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = studentController;
