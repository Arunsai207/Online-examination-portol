// ============================================================
// Email Service — Nodemailer wrapper
// ============================================================
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const emailService = {
    // Send password reset email
    sendPasswordReset: async (email, token) => {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        const mailOptions = {
            from: `"Online Exam System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset Request',
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🎓 Online Exam System</h1>
                    </div>
                    <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                        <h2 style="color: #1e293b; margin-bottom: 16px;">Password Reset Request</h2>
                        <p style="color: #475569; line-height: 1.6;">
                            You have requested to reset your password. Click the button below to create a new password:
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" 
                               style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; 
                                      padding: 14px 32px; border-radius: 8px; font-weight: 600; display: inline-block;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #94a3b8; font-size: 14px;">
                            This link will expire in 1 hour. If you did not request this reset, please ignore this email.
                        </p>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Email send error:', error.message);
            return false;
        }
    },

    // Send exam result notification
    sendResultNotification: async (email, studentName, examName, score, grade) => {
        const mailOptions = {
            from: `"Online Exam System" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Exam Result: ${examName}`,
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🎓 Online Exam System</h1>
                    </div>
                    <div style="background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                        <h2 style="color: #1e293b;">Hi ${studentName},</h2>
                        <p style="color: #475569; line-height: 1.6;">
                            Your result for <strong>${examName}</strong> is now available:
                        </p>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <p style="font-size: 36px; font-weight: 700; color: #6366f1; margin: 0;">${score}%</p>
                            <p style="font-size: 18px; color: #475569; margin: 8px 0;">Grade: <strong>${grade}</strong></p>
                        </div>
                        <p style="color: #475569;">Login to your account to view the detailed analysis.</p>
                    </div>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Email send error:', error.message);
            return false;
        }
    }
};

module.exports = emailService;
