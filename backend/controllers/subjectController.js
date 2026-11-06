// ============================================================
// Subject Controller — CRUD operations
// ============================================================
const Subject = require('../models/Subject');

const subjectController = {
    // Get all subjects
    getAll: async (req, res, next) => {
        try {
            const subjects = await Subject.findAll();
            res.json({ success: true, data: subjects });
        } catch (error) {
            next(error);
        }
    },

    // Get subject by ID
    getById: async (req, res, next) => {
        try {
            const subject = await Subject.findById(req.params.id);
            if (!subject) {
                return res.status(404).json({ success: false, message: 'Subject not found' });
            }
            res.json({ success: true, data: subject });
        } catch (error) {
            next(error);
        }
    },

    // Create subject
    create: async (req, res, next) => {
        try {
            const { subject_name } = req.body;
            const subject = await Subject.create(subject_name);
            res.status(201).json({
                success: true,
                message: 'Subject created successfully',
                data: subject
            });
        } catch (error) {
            next(error);
        }
    },

    // Update subject
    update: async (req, res, next) => {
        try {
            const { subject_name } = req.body;
            const subject = await Subject.findById(req.params.id);

            if (!subject) {
                return res.status(404).json({ success: false, message: 'Subject not found' });
            }

            await Subject.update(req.params.id, subject_name);
            res.json({ success: true, message: 'Subject updated successfully' });
        } catch (error) {
            next(error);
        }
    },

    // Delete subject
    delete: async (req, res, next) => {
        try {
            const subject = await Subject.findById(req.params.id);
            if (!subject) {
                return res.status(404).json({ success: false, message: 'Subject not found' });
            }

            await Subject.delete(req.params.id);
            res.json({ success: true, message: 'Subject deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = subjectController;
