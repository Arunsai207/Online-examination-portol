const { pool } = require('./config/db');

async function alterDb() {
  try {
    console.log('Adding start_time and end_time to exams table...');
    await pool.execute('ALTER TABLE exams ADD COLUMN start_time DATETIME NULL AFTER exam_date, ADD COLUMN end_time DATETIME NULL AFTER start_time');
    console.log('Columns added successfully.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist. Skipping.');
    } else {
      console.error('Error altering table:', error);
    }
  } finally {
    process.exit(0);
  }
}

alterDb();
