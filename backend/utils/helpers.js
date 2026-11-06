// ============================================================
// Utility Helpers
// ============================================================

const helpers = {
    // Format date for display
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Pagination helper
    getPagination: (page, limit) => {
        const parsedPage = parseInt(page) || 1;
        const parsedLimit = parseInt(limit) || 10;
        return {
            page: parsedPage,
            limit: Math.min(parsedLimit, 100) // Cap at 100
        };
    },

    // Generate random token
    generateToken: () => {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    },

    // Sanitize input to prevent XSS
    sanitize: (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/[<>'"]/g, (char) => {
            const entities = { '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
            return entities[char] || char;
        });
    }
};

module.exports = helpers;
