const { pool } = require('./config/db');

async function alterDb() {
  const migrations = [
    {
      name: 'Add is_adaptive to exams',
      sql: 'ALTER TABLE exams ADD COLUMN is_adaptive TINYINT(1) DEFAULT 0'
    },
    {
      name: 'Add difficulty to questions',
      sql: "ALTER TABLE questions ADD COLUMN difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium'"
    },
    {
      name: 'Add ai_feedback to results',
      sql: 'ALTER TABLE results ADD COLUMN ai_feedback TEXT NULL'
    }
  ];

  for (const migration of migrations) {
    try {
      console.log(`Running: ${migration.name}...`);
      await pool.execute(migration.sql);
      console.log(`  ✅ ${migration.name} — Success`);
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log(`  ⏭️  ${migration.name} — Column already exists, skipping.`);
      } else {
        console.error(`  ❌ ${migration.name} — Error:`, error.message);
      }
    }
  }

  console.log('\nAll migrations complete.');
  process.exit(0);
}

alterDb();
