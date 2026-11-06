// ============================================================
// PDF Generation Service — Using PDFKit
// ============================================================
const PDFDocument = require('pdfkit');

const pdfService = {
    // Generate result PDF for a student
    generateResultPDF: (resultData, res) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Pipe to response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=result_${resultData.student_name}_${resultData.exam_name}.pdf`);
        doc.pipe(res);

        // Header with gradient-like background
        doc.rect(0, 0, doc.page.width, 120).fill('#6366f1');
        doc.fontSize(28).fillColor('#ffffff').text('Online Exam System', 50, 35, { align: 'center' });
        doc.fontSize(14).fillColor('#e0e7ff').text('Examination Result Certificate', 50, 72, { align: 'center' });

        // Reset position
        doc.moveDown(4);

        // Student Details Section
        doc.fontSize(16).fillColor('#1e293b').text('Student Details', 50, 150);
        doc.moveTo(50, 172).lineTo(550, 172).stroke('#6366f1');
        doc.moveDown(0.5);

        const detailsY = 185;
        doc.fontSize(11).fillColor('#475569');
        doc.text(`Student Name:`, 50, detailsY);
        doc.fillColor('#1e293b').text(resultData.student_name, 200, detailsY);
        doc.fillColor('#475569').text(`Email:`, 50, detailsY + 22);
        doc.fillColor('#1e293b').text(resultData.student_email || '', 200, detailsY + 22);

        // Exam Details Section
        const examY = detailsY + 65;
        doc.fontSize(16).fillColor('#1e293b').text('Exam Details', 50, examY);
        doc.moveTo(50, examY + 22).lineTo(550, examY + 22).stroke('#6366f1');

        const examDetailsY = examY + 35;
        doc.fontSize(11).fillColor('#475569');
        doc.text(`Exam Name:`, 50, examDetailsY);
        doc.fillColor('#1e293b').text(resultData.exam_name, 200, examDetailsY);
        doc.fillColor('#475569').text(`Subject:`, 50, examDetailsY + 22);
        doc.fillColor('#1e293b').text(resultData.subject_name || '', 200, examDetailsY + 22);
        doc.fillColor('#475569').text(`Date:`, 50, examDetailsY + 44);
        doc.fillColor('#1e293b').text(resultData.exam_date || new Date().toLocaleDateString(), 200, examDetailsY + 44);

        // Result Section
        const resultY = examDetailsY + 90;
        doc.fontSize(16).fillColor('#1e293b').text('Result', 50, resultY);
        doc.moveTo(50, resultY + 22).lineTo(550, resultY + 22).stroke('#6366f1');

        // Result table
        const tableY = resultY + 40;
        const headers = ['Score', 'Total Marks', 'Percentage', 'Grade', 'Status'];
        const values = [
            resultData.score.toString(),
            resultData.total_marks.toString(),
            `${resultData.percentage}%`,
            resultData.grade,
            resultData.status.toUpperCase()
        ];

        // Draw table header
        doc.rect(50, tableY, 500, 30).fill('#f1f5f9');
        headers.forEach((header, i) => {
            doc.fontSize(10).fillColor('#475569').text(header, 55 + (i * 100), tableY + 10, { width: 95, align: 'center' });
        });

        // Draw table data
        doc.rect(50, tableY + 30, 500, 35).fill('#ffffff').stroke('#e2e8f0');
        values.forEach((value, i) => {
            const color = i === 4 ? (value === 'PASS' ? '#10b981' : '#ef4444') : '#1e293b';
            doc.fontSize(12).fillColor(color).text(value, 55 + (i * 100), tableY + 40, { width: 95, align: 'center' });
        });

        // Grade Legend
        const legendY = tableY + 100;
        doc.fontSize(12).fillColor('#1e293b').text('Grading Scale', 50, legendY);
        doc.fontSize(9).fillColor('#64748b');
        doc.text('A+ (90-100)  |  A (80-89)  |  B (70-79)  |  C (60-69)  |  F (Below 60)', 50, legendY + 18);
        doc.text('Minimum passing percentage: 60%', 50, legendY + 32);

        // Footer
        const footerY = doc.page.height - 80;
        doc.moveTo(50, footerY).lineTo(550, footerY).stroke('#e2e8f0');
        doc.fontSize(9).fillColor('#94a3b8');
        doc.text('This is a computer-generated document and does not require a signature.', 50, footerY + 10, { align: 'center' });
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, footerY + 25, { align: 'center' });
        doc.text('Online Examination and Result Management System', 50, footerY + 40, { align: 'center' });

        doc.end();
    }
};

module.exports = pdfService;
