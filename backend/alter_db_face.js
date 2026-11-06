const { pool } = require('./config/db');

async function alterDb() {
  try {
    console.log('Adding face_descriptor to students table...');
    await pool.execute('ALTER TABLE students ADD COLUMN face_descriptor TEXT NULL');
    console.log('Column added successfully.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists. Skipping.');
    } else {
      console.error('Error altering table:', error);
    }
  } finally {
    process.exit(0);
  }
}

alterDb();
