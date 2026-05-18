import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'mteia-secret-key-2024';

console.log('🚀 Starting MTEIA RIASEC Server...');
console.log('PORT:', PORT);

// Serve frontend static files
const distPath = join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  console.log('Serving frontend from:', distPath);
  app.use(express.static(distPath));
} else {
  console.log('WARNING: frontend/dist not found');
}

app.use(cors());
app.use(express.json());

// Initialize database
let db;
const dbPath = join(__dirname, 'mteia.db');

async function initDb() {
  try {
    const SQL = await initSqlJs();
    
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
      console.log('Loaded existing database');
    } else {
      db = new SQL.Database();
      console.log('Created new database');
    }
    
    // Create tables
    db.run('PRAGMA foreign_keys = ON');
    
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('R','I','A','S','E','C')),
      question_text TEXT NOT NULL,
      order_num INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      school TEXT,
      grade TEXT,
      session_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      scores TEXT NOT NULL,
      recommended_field TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES students(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      result_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
      FOREIGN KEY (result_id) REFERENCES results(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    )`);
    
    // Create default admin
    const adminCheck = db.exec("SELECT id FROM users WHERE email = 'admin@mteia.org'");
    if (adminCheck.length === 0 || adminCheck[0].values.length === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.run('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)', 
        [uuidv4(), 'admin@mteia.org', hash, '系統管理員']);
      console.log('Default admin created');
    }
    
    // Seed questions
    const questionCheck = db.exec('SELECT COUNT(*) FROM questions');
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
      console.log(`Seeded ${defaultQuestions.length} questions`);
    }
    
    // Save database
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
    console.log('Database saved');
    
  } catch (err) {
    console.error('DB init error:', err);
  }
}

function saveDb() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

// Auth middleware
const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = auth.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTH ROUTES ============

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  const user = db.exec('SELECT * FROM users WHERE email = ?', [email]);
  if (!user.length || !user[0].values.length) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const row = user[0].values[0];
  const userData = {
    id: row[0],
    email: row[1],
    password_hash: row[2],
    name: row[3]
  };
  
  if (!bcrypt.compareSync(password, userData.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: userData.id, email: userData.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, name: userData.name, email: userData.email });
});

// ============ QUESTIONS ROUTES ============

app.get('/api/questions', (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  const result = db.exec('SELECT id, type, question_text, question_text_zh, order_num FROM questions ORDER BY order_num');
  if (!result.length) return res.json([]);
  
  const questions = result[0].values.map(row => ({
    id: row[0],
    type: row[1],
    question_text: row[2],
    question_text_zh: row[3],
    order_num: row[4]
  }));
  res.json(questions);
});

app.post('/api/questions', authenticate, (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  const { type, question_text, order_num } = req.body;
  if (!type || !question_text) {
    return res.status(400).json({ error: 'Type and question_text required' });
  }
  
  const id = uuidv4();
  db.run('INSERT INTO questions (id, type, question_text, order_num) VALUES (?, ?, ?, ?)', 
    [id, type, question_text, order_num || 0]);
  saveDb();
  
  res.json({ id, type, question_text, order_num });
});

app.delete('/api/questions/:id', authenticate, (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  db.run('DELETE FROM questions WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ success: true });
});

// ============ STUDENTS ROUTES ============

app.get('/api/students', authenticate, (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  const result = db.exec('SELECT * FROM students ORDER BY created_at DESC');
  if (!result.length) return res.json([]);
  
  const students = result[0].values.map(row => ({
    id: row[0],
    name: row[1],
    school: row[2],
    grade: row[3],
    session_id: row[4],
    created_at: row[5]
  }));
  res.json(students);
});

app.get('/api/students/:id', authenticate, (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  const student = db.exec('SELECT * FROM students WHERE id = ?', [req.params.id]);
  if (!student.length || !student[0].values.length) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  const row = student[0].values[0];
  const studentData = {
    id: row[0],
    name: row[1],
    school: row[2],
    grade: row[3],
    session_id: row[4],
    created_at: row[5]
  };
  
  // Get results
  const results = db.exec('SELECT * FROM results WHERE student_id = ?', [req.params.id]);
  if (results.length && results[0].values.length) {
    studentData.results = results[0].values.map(r => ({
      id: r[0],
      student_id: r[1],
      scores: JSON.parse(r[2]),
      recommended_field: r[3],
      created_at: r[4]
    }));
  }
  
  res.json(studentData);
});

app.delete('/api/students/:id', authenticate, (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  db.run('DELETE FROM answers WHERE result_id IN (SELECT id FROM results WHERE student_id = ?)', [req.params.id]);
  db.run('DELETE FROM results WHERE student_id = ?', [req.params.id]);
  db.run('DELETE FROM students WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ success: true });
});

// ============ RESULTS ROUTES ============

app.get('/api/results', authenticate, (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  const result = db.exec(`
    SELECT r.id, r.student_id, r.scores, r.recommended_field, r.created_at, s.name, s.school, s.grade
    FROM results r
    JOIN students s ON r.student_id = s.id
    ORDER BY r.created_at DESC
  `);
  if (!result.length) return res.json([]);
  
  const results = result[0].values.map(row => ({
    id: row[0],
    student_id: row[1],
    scores: JSON.parse(row[2]),
    recommended_field: row[3],
    created_at: row[4],
    student_name: row[5],
    school: row[6],
    grade: row[7]
  }));
  res.json(results);
});

// Student submit results (no auth required)
app.post('/api/results', (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  const { name, school, grade, scores } = req.body;
  if (!name || !scores) {
    return res.status(400).json({ error: 'name and scores required' });
  }
  
  // Create student first
  const student_id = uuidv4();
  const session_id = uuidv4();
  db.run('INSERT INTO students (id, name, school, grade, session_id) VALUES (?, ?, ?, ?, ?)',
    [student_id, name, school || '', grade || '', session_id]);
  
  // Calculate scores by type
  const typeScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  
  scores.forEach(({ question_id, score, type }) => {
    if (typeScores[type] !== undefined) {
      typeScores[type] += score;
      counts[type]++;
    }
  });
  
  // Normalize
  Object.keys(typeScores).forEach(key => {
    if (counts[key] > 0) {
      typeScores[key] = Math.round((typeScores[key] / counts[key]) * 10) / 10;
    }
  });
  
  // Find dominant
  const dominant = Object.entries(typeScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  const fieldMap = {
    R: '工程、農業、機械、餐飲',
    I: '數理化、生命科學、資訊',
    A: '藝術、設計、語文',
    S: '社會心理、教育、醫藥衛生',
    E: '管理、財經、法政',
    C: '行政、圖書資訊、遊憩運動'
  };
  
  const result_id = uuidv4();
  db.run('INSERT INTO results (id, student_id, scores, recommended_field) VALUES (?, ?, ?, ?)',
    [result_id, student_id, JSON.stringify(typeScores), fieldMap[dominant]]);
  
  saveDb();
  res.json({ session_id, student_id });
});

// ============ STUDENT SIDE ROUTES ============

app.post('/api/student/start', (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  const { name, school, grade } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name required' });
  }
  
  const id = uuidv4();
  const session_id = uuidv4();
  db.run('INSERT INTO students (id, name, school, grade, session_id) VALUES (?, ?, ?, ?, ?)', 
    [id, name, school || '', grade || '', session_id]);
  saveDb();
  
  res.json({ student_id: id, session_id });
});

app.post('/api/student/submit', (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  const { student_id, answers } = req.body;
  if (!student_id || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'student_id and answers required' });
  }
  
  // Calculate scores
  const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  
  answers.forEach(({ question_id, score, type }) => {
    if (scores[type] !== undefined) {
      scores[type] += score;
      counts[type]++;
    }
  });
  
  // Normalize scores (average)
  Object.keys(scores).forEach(key => {
    if (counts[key] > 0) {
      scores[key] = Math.round((scores[key] / counts[key]) * 10) / 10;
    }
  });
  
  // Find dominant type
  const dominant = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  const fieldMap = {
    R: '工程、農業、機械、餐飲',
    I: '數理化、生命科學、資訊',
    A: '藝術、設計、語文',
    S: '社會心理、教育、醫藥衛生',
    E: '管理、財經、法政',
    C: '行政、圖書資訊、遊憩運動'
  };
  
  const recommended_field = fieldMap[dominant];
  
  // Save result
  const result_id = uuidv4();
  db.run('INSERT INTO results (id, student_id, scores, recommended_field) VALUES (?, ?, ?, ?)', 
    [result_id, student_id, JSON.stringify(scores), recommended_field]);
  
  // Save answers
  answers.forEach(ans => {
    db.run('INSERT INTO answers (id, result_id, question_id, score) VALUES (?, ?, ?, ?)', 
      [uuidv4(), result_id, ans.question_id, ans.score]);
  });
  
  saveDb();
  
  res.json({ result_id, scores, recommended_field, dominant });
});

app.get('/api/student/result/:student_id', (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  const result = db.exec('SELECT * FROM results WHERE student_id = ? ORDER BY created_at DESC LIMIT 1', [req.params.student_id]);
  if (!result.length || !result[0].values.length) {
    return res.status(404).json({ error: 'No result found' });
  }
  
  const row = result[0].values[0];
  res.json({
    id: row[0],
    student_id: row[1],
    scores: JSON.parse(row[2]),
    recommended_field: row[3],
    created_at: row[4]
  });
});

// Get result by session_id (for student to view their result)
app.get('/api/results/:session_id', (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  const studentResult = db.exec('SELECT id, name, school, grade FROM students WHERE session_id = ?', [req.params.session_id]);
  if (!studentResult.length || !studentResult[0].values.length) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  const studentRow = studentResult[0].values[0];
  const studentId = studentRow[0];
  const result = db.exec('SELECT * FROM results WHERE student_id = ? ORDER BY created_at DESC LIMIT 1', [studentId]);
  if (!result.length || !result[0].values.length) {
    return res.status(404).json({ error: 'No result found' });
  }
  
  const row = result[0].values[0];
  res.json({
    id: row[0],
    student_id: row[1],
    scores: JSON.parse(row[2]),
    recommended_field: row[3],
    created_at: row[4],
    student: {
      name: studentRow[1],
      school: studentRow[2],
      grade: studentRow[3]
    }
  });
});

// ============ EXPORT ROUTES ============

app.get('/api/export/students', authenticate, (req, res) => {
  if (!db) return res.status(500).json({ error: 'Database not ready' });
  
  const result = db.exec(`
    SELECT s.name, s.school, s.grade, r.scores, r.recommended_field, r.created_at
    FROM students s
    LEFT JOIN results r ON s.id = r.student_id
    ORDER BY r.created_at DESC
  `);
  
  if (!result.length) return res.json([]);
  
  let csv = 'Name,School,Grade,Scores,Recommended Field,Date\n';
  result[0].values.forEach(row => {
    csv += `${row[0]},${row[1]||''},${row[2]||''},${row[3]||''},${row[4]||''},${row[5]||''}\n`;
  });
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
  res.send(csv);
});

// Serve index.html for all non-API routes (SPA)
app.get('*', (req, res) => {
  if (fs.existsSync(distPath)) {
    res.sendFile(join(distPath, 'index.html'));
  } else {
    res.send('Frontend not found. Please build the frontend.');
  }
});

// Start server
initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`🌐 Visit: https://mteia-riasec-production.up.railway.app`);
  });
});