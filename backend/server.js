import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Railway sets PORT automatically
console.log('PORT:', PORT);
const JWT_SECRET = process.env.JWT_SECRET || 'mteia-secret-key-2024';

// Serve frontend static files (built with `npm run build`)
const distPath = join(__dirname, '..', 'frontend', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.use(cors());
app.use(express.json());

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
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) {
    return res.status(409).json({ error: 'Email already exists' });
  }
  
  const hash = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)').run(id, email, hash, name);
  
  const token = jwt.sign({ id, email, name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id, email, name } });
});

// ============ QUESTIONS ROUTES ============

// Get all questions
app.get('/api/questions', (req, res) => {
  const questions = db.prepare('SELECT * FROM questions ORDER BY order_num').all();
  res.json(questions);
});

// Get questions by type
app.get('/api/questions/:type', (req, res) => {
  const { type } = req.params;
  const questions = db.prepare('SELECT * FROM questions WHERE type = ? ORDER BY order_num').all(type.toUpperCase());
  res.json(questions);
});

// Add question (protected)
app.post('/api/questions', authenticate, (req, res) => {
  const { type, question_text } = req.body;
  if (!type || !question_text) {
    return res.status(400).json({ error: 'Type and question_text required' });
  }
  
  const id = uuidv4();
  const maxOrder = db.prepare('SELECT MAX(order_num) as max FROM questions').get().max || 0;
  db.prepare('INSERT INTO questions (id, type, question_text, order_num) VALUES (?, ?, ?, ?)').run(id, type.toUpperCase(), question_text, maxOrder + 1);
  
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);
  res.json(question);
});

// Update question (protected)
app.put('/api/questions/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { question_text, type } = req.body;
  
  const existing = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  db.prepare('UPDATE questions SET question_text = ?, type = ? WHERE id = ?').run(
    question_text || existing.question_text,
    type ? type.toUpperCase() : existing.type,
    id
  );
  
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(id);
  res.json(question);
});

// Delete question (protected)
app.delete('/api/questions/:id', authenticate, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM questions WHERE id = ?').run(id);
  res.json({ success: true });
});

// Bulk import questions (protected)
app.post('/api/questions/bulk', authenticate, (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Questions array required' });
  }
  
  const insert = db.prepare('INSERT INTO questions (id, type, question_text, order_num) VALUES (?, ?, ?, ?)');
  const maxOrder = db.prepare('SELECT MAX(order_num) as max FROM questions').get().max || 0;
  
  const imported = [];
  questions.forEach((q, index) => {
    const id = uuidv4();
    insert.run(id, q.type.toUpperCase(), q.question_text, maxOrder + index + 1);
    imported.push({ id, type: q.type, question_text: q.question_text });
  });
  
  res.json({ success: true, count: imported.length, questions: imported });
});

// ============ STUDENTS & RESULTS ROUTES ============

// Get all students
app.get('/api/students', authenticate, (req, res) => {
  const students = db.prepare(`
    SELECT s.*, r.scores, r.recommended_field, r.created_at as result_date
    FROM students s
    LEFT JOIN results r ON s.id = r.student_id
    ORDER BY s.created_at DESC
  `).all();
  
  const result = students.map(s => ({
    ...s,
    scores: s.scores ? JSON.parse(s.scores) : null
  }));
  res.json(result);
});

// Create student and result
app.post('/api/results', (req, res) => {
  const { name, school, grade, scores } = req.body;
  if (!name || !scores) {
    return res.status(400).json({ error: 'Name and scores required' });
  }
  
  // Calculate scores per type
  const scoreMap = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0, count: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } };
  
  scores.forEach(({ question_id, score }) => {
    const question = db.prepare('SELECT type FROM questions WHERE id = ?').get(question_id);
    if (question && scoreMap[question.type] !== undefined) {
      scoreMap[question.type] += score;
      scoreMap.count[question.type]++;
    }
  });
  
  // Calculate average and find dominant type
  const averages = {};
  let maxType = 'R';
  let maxAvg = 0;
  
  for (const type of ['R', 'I', 'A', 'S', 'E', 'C']) {
    const count = scoreMap.count[type];
    averages[type] = count > 0 ? scoreMap[type] / count : 0;
    if (averages[type] > maxAvg) {
      maxAvg = averages[type];
      maxType = type;
    }
  }
  
  // Determine recommended field
  const fieldMap = {
    R: { zh: '工程、農業、機械、餐飲', en: 'Engineering, Agriculture, Mechanics, Culinary' },
    I: { zh: '數理化、生命科學、資訊', en: 'Science, Mathematics, IT, Life Sciences' },
    A: { zh: '藝術、設計、語文', en: 'Arts, Design, Languages' },
    S: { zh: '社會心理、教育、醫藥衛生', en: 'Social Work, Education, Healthcare' },
    E: { zh: '管理、財經、法政', en: 'Business, Finance, Law, Administration' },
    C: { zh: '行政、圖書資訊、遊憩運動', en: 'Administration, Library, Recreation' }
  };

  const lang = req.body.lang || 'zh';
  const getField = (type) => fieldMap[type]?.[lang] || fieldMap[type]?.zh || fieldMap[type];
  
  const studentId = uuidv4();
  const sessionId = uuidv4();
  
  // Insert student
  db.prepare('INSERT INTO students (id, name, school, grade, session_id) VALUES (?, ?, ?, ?, ?)').run(
    studentId, name, school || null, grade || null, sessionId
  );
  
  // Insert result
  const resultId = uuidv4();
  db.prepare('INSERT INTO results (id, student_id, scores, recommended_field) VALUES (?, ?, ?, ?)').run(
    resultId, studentId, JSON.stringify(averages), getField(maxType)
  );
  
  // Insert answers
  const insertAnswer = db.prepare('INSERT INTO answers (id, result_id, question_id, score) VALUES (?, ?, ?, ?)');
  scores.forEach(({ question_id, score }) => {
    insertAnswer.run(uuidv4(), resultId, question_id, score);
  });
  
  res.json({
    student_id: studentId,
    session_id: sessionId,
    scores: averages,
    recommended_field: getField(maxType),
    result_id: resultId
  });
});

// Get result by session (student view)
app.get('/api/results/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const student = db.prepare('SELECT * FROM students WHERE session_id = ?').get(sessionId);
  
  if (!student) {
    return res.status(404).json({ error: 'Result not found' });
  }
  
  const result = db.prepare('SELECT * FROM results WHERE student_id = ?').get(student.id);
  if (!result) {
    return res.status(404).json({ error: 'No result yet' });
  }
  
  res.json({
    student,
    scores: JSON.parse(result.scores),
    recommended_field: result.recommended_field,
    created_at: result.created_at
  });
});

// Get result details with answers (counselor view)
app.get('/api/results/detail/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const result = db.prepare('SELECT * FROM results WHERE id = ?').get(id);
  
  if (!result) {
    return res.status(404).json({ error: 'Result not found' });
  }
  
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(result.student_id);
  const answers = db.prepare(`
    SELECT a.*, q.type, q.question_text 
    FROM answers a 
    JOIN questions q ON a.question_id = q.id 
    WHERE a.result_id = ?
  `).all(id);
  
  res.json({
    student,
    result,
    scores: JSON.parse(result.scores),
    answers
  });
});

// Delete student (protected)
app.delete('/api/students/:id', authenticate, (req, res) => {
  const { id } = req.params;
  
  // Delete answers first
  const results = db.prepare('SELECT id FROM results WHERE student_id = ?').all(id);
  results.forEach(r => {
    db.prepare('DELETE FROM answers WHERE result_id = ?').run(r.id);
  });
  db.prepare('DELETE FROM results WHERE student_id = ?').run(id);
  db.prepare('DELETE FROM students WHERE id = ?').run(id);
  
  res.json({ success: true });
});

// Export CSV (protected)
app.get('/api/export/csv', authenticate, (req, res) => {
  const students = db.prepare(`
    SELECT s.name, s.school, s.grade, s.created_at, r.scores, r.recommended_field
    FROM students s
    LEFT JOIN results r ON s.id = r.student_id
    ORDER BY s.created_at DESC
  `).all();
  
  const csvHeader = '姓名,學校,年級,日期,R(實用),I(研究),A(藝術),S(社會),E(企業),C(事務),推薦學群\n';
  const csvRows = students.map(s => {
    const scores = s.scores ? JSON.parse(s.scores) : { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    return `"${s.name}","${s.school || ''}","${s.grade || ''}","${s.created_at}",${scores.R.toFixed(2)},${scores.I.toFixed(2)},${scores.A.toFixed(2)},${scores.S.toFixed(2)},${scores.E.toFixed(2)},${scores.C.toFixed(2)},"${s.recommended_field || ''}"`;
  }).join('\n');
  
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=mteia-results.csv');
  res.send('\ufeff' + csvHeader + csvRows); // BOM for Excel
});

// ============ STATS ROUTE ============

app.get('/api/stats', authenticate, (req, res) => {
  const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
  const totalResults = db.prepare('SELECT COUNT(*) as count FROM results').get().count;
  const totalQuestions = db.prepare('SELECT COUNT(*) as count FROM questions').get().count;
  
  // Top recommended fields
  const fieldCounts = db.prepare(`
    SELECT recommended_field, COUNT(*) as count 
    FROM results 
    GROUP BY recommended_field 
    ORDER BY count DESC
  `).all();
  
  res.json({
    totalStudents,
    totalResults,
    totalQuestions,
    fieldCounts
  });
});

// Get current user (for token validation)
app.get('/api/auth/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - serve index.html for all non-API routes
// This must be after all API routes
if (existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 MTEIA RIASEC Server running on http://localhost:${PORT}`);
  console.log(`📱 Open in browser: http://YOUR_IP:${PORT}`);
});
