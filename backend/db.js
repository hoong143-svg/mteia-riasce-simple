import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'mteia.db');

// Initialize SQL.js
const SQL = await initSqlJs();

// Load or create database
let db;
if (fs.existsSync(dbPath)) {
  const fileBuffer = fs.readFileSync(dbPath);
  db = new SQL.Database(fileBuffer);
} else {
  db = new SQL.Database();
}

// Helper to save database
function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize tables
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('R','I','A','S','E','C')),
    question_text TEXT NOT NULL,
    order_num INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    school TEXT,
    grade TEXT,
    session_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS results (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    scores TEXT NOT NULL,
    recommended_field TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (student_id) REFERENCES students(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    result_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    FOREIGN KEY (result_id) REFERENCES results(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
  )
`);

// Create default admin if not exists
const adminCheck = db.exec('SELECT id FROM users WHERE email = ?', ['admin@mteia.org']);
if (adminCheck.length === 0 || adminCheck[0].values.length === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.run('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)', 
    [uuidv4(), 'admin@mteia.org', hash, '系統管理員']);
  console.log('Default admin created: admin@mteia.org / admin123');
}

// Seed default questions if empty
const questionCheck = db.exec('SELECT COUNT(*) as count FROM questions');
const questionCount = questionCheck[0]?.values[0][0] || 0;
if (questionCount === 0) {
  const defaultQuestions = [
    { type: 'R', text: '組裝家具或電子設備時，我會仔細閱讀說明書並按照步驟操作' },
    { type: 'R', text: '我喜歡使用工具修理東西，例如修理自行車或小家電' },
    { type: 'R', text: '我願意在戶外工作，即使天氣炎熱或寒冷' },
    { type: 'R', text: '我喜歡實際動手做東西，而不是只說不做' },
    { type: 'R', text: '我擅長使用機械或電子設備' },
    { type: 'R', text: '我喜歡種植植物或照顧動物' },
    { type: 'R', text: '我喜歡有明確步驟的工作，不怕重複性高' },
    { type: 'I', text: '我喜歡研究新事物，了解原理和運作方式' },
    { type: 'I', text: '我會深入鑽研自己感興趣的課題，不怕花時間' },
    { type: 'I', text: '我喜歡解決複雜的問題，需要動腦思考的那種' },
    { type: 'I', text: '我習慣收集資料，分析數據來得出結論' },
    { type: 'I', text: '我喜歡閱讀科普文章或觀看科學相關的影片' },
    { type: 'I', text: '我對新科技和新發明特別感興趣' },
    { type: 'I', text: '我希望從事需要高度專業知識的工作' },
    { type: 'A', text: '我喜歡藝術創作，例如畫畫、寫作或音樂' },
    { type: 'A', text: '我會用自己的方式表達想法，不一定遵循傳統' },
    { type: 'A', text: '我喜歡參加創意活動，例如設計、表演或寫作' },
    { type: 'A', text: '我對美感和設計有敏銳的觀察力' },
    { type: 'A', text: '我希望工作環境能有發揮創意的空間' },
    { type: 'A', text: '我喜歡獨自工作，有彈性時間的工作方式' },
    { type: 'S', text: '我喜歡幫助別人解決問題或傾聽他們的困擾' },
    { type: 'S', text: '我擅長與人溝通，能讓別人理解我的想法' },
    { type: 'S', text: '我喜歡參與團體活動，樂於協助他人' },
    { type: 'S', text: '我希望工作能對社會有正面貢獻' },
    { type: 'S', text: '我會主動關心朋友的狀況，願意提供支持' },
    { type: 'S', text: '我喜歡教學或傳授知識給別人' },
    { type: 'S', text: '我容易與不同背景的人相處融洽' },
    { type: 'E', text: '我喜歡帶領團隊，激勵大家一起達成目標' },
    { type: 'E', text: '我善於說服別人接受我的想法' },
    { type: 'E', text: '我喜歡有挑戰性的目標，願意冒險' },
    { type: 'E', text: '我善於規劃和組織活動，能有效率地完成任務' },
    { type: 'E', text: '我希望有機會晉升到管理階層' },
    { type: 'E', text: '我喜歡競爭環境，能激發我的潛能' },
    { type: 'C', text: '我喜歡有明確規則和程序的工作' },
    { type: 'C', text: '我做事情喜歡按部就班，有條不紊' },
    { type: 'C', text: '我擅長時間管理，能準時完成任務' },
    { type: 'C', text: '我注重細節，能仔細核對文件資料' },
    { type: 'C', text: '我喜歡處理數據和文書工作，例如整理報表' },
    { type: 'C', text: '我服從規定，喜歡穩定的工作環境' },
    { type: 'C', text: '我會徹底完成被交付的工作，即使枯燥也不馬虎' }
  ];

  defaultQuestions.forEach((q, index) => {
    db.run('INSERT INTO questions (id, type, question_text, order_num) VALUES (?, ?, ?, ?)', 
      [uuidv4(), q.type, q.text, index + 1]);
  });
  console.log(`Seeded ${defaultQuestions.length} default questions`);
}

saveDb();

// Wrapper to work like better-sqlite3
const dbWrapper = {
  prepare: (sql) => ({
    get: (...params) => {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return undefined;
    },
    all: (...params) => {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    },
    run: (...params) => {
      db.run(sql, params);
      saveDb();
    }
  }),
  exec: (sql) => {
    db.run(sql);
    saveDb();
  }
};

export default dbWrapper;