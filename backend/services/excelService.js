// ============================================================
// Excel Export Service — Using ExcelJS
// ============================================================
const ExcelJS = require('exceljs');

const excelService = {
    // Generate results Excel file
    generateResultsExcel: async (results, res) => {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Online Exam System';
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet('Exam Results', {
            headerFooter: {
                firstHeader: 'Online Examination Results Report'
            }
        });

        // Define columns
        worksheet.columns = [
            { header: 'S.No', key: 'sno', width: 8 },
            { header: 'Student Name', key: 'student_name', width: 25 },
            { header: 'Email', key: 'student_email', width: 30 },
            { header: 'Exam Name', key: 'exam_name', width: 30 },
            { header: 'Subject', key: 'subject_name', width: 25 },
            { header: 'Score', key: 'score', width: 10 },
            { header: 'Total Marks', key: 'total_marks', width: 12 },
            { header: 'Percentage', key: 'percentage', width: 12 },
            { header: 'Grade', key: 'grade', width: 10 },
            { header: 'Status', key: 'status', width: 10 },
            { header: 'Date', key: 'created_at', width: 18 }
        ];

        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF6366F1' }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.height = 25;

        // Add data rows
        results.forEach((result, index) => {
            const row = worksheet.addRow({
                sno: index + 1,
                student_name: result.student_name,
                student_email: result.student_email,
                exam_name: result.exam_name,
                subject_name: result.subject_name,
                score: result.score,
                total_marks: result.total_marks,
                percentage: result.percentage,
                grade: result.grade,
                status: result.status.toUpperCase(),
                created_at: new Date(result.created_at).toLocaleDateString()
            });

            // Alternate row colors
            if (index % 2 === 0) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF8FAFC' }
                };
            }

            // Color code status
            const statusCell = row.getCell('status');
            statusCell.font = {
                bold: true,
                color: { argb: result.status === 'pass' ? 'FF10B981' : 'FFEF4444' }
            };

            row.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Add borders
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
                };
            });
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=exam_results.xlsx');

        await workbook.xlsx.write(res);
    }
};

module.exports = excelService;
