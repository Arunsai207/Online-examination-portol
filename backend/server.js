// ============================================================
// Server Entry Point
// ============================================================
const app = require('./app');
const { testConnection } = require('./config/db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Start server
        app.listen(PORT, () => {
            console.log(`\n🚀 Online Exam System API Server`);
            console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`   Port: ${PORT}`);
            console.log(`   URL: http://localhost:${PORT}`);
            console.log(`   Health: http://localhost:${PORT}/api/health\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
