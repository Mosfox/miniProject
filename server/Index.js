const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------- ข้อมูลในหน่วยความจำ (in-memory) ----------
const PRIORITIES = ['low', 'medium', 'high'];
let nextId = 4;
let tasks = [
  { id: 1, title: 'ส่งรายงานวิชา Web Development', category: 'เรียน', priority: 'high', done: false, createdAt: new Date().toISOString() },
  { id: 2, title: 'ซื้อของเข้าบ้าน', category: 'ส่วนตัว', priority: 'low', done: false, createdAt: new Date().toISOString() },
  { id: 3, title: 'อ่านสไลด์ Express.js', category: 'เรียน', priority: 'medium', done: true, createdAt: new Date().toISOString() },
];

// ตรวจสอบข้อมูล: คืนข้อความ error หรือ null ถ้าผ่าน
function validate(body, { partial = false } = {}) {
  const { title, category, priority, done } = body;
  if (!partial || title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) return 'ต้องระบุ title (ข้อความที่ไม่ว่าง)';
  }
  if (category !== undefined && typeof category !== 'string') return 'category ต้องเป็นข้อความ';
  if (priority !== undefined && !PRIORITIES.includes(priority)) return 'priority ต้องเป็น low, medium หรือ high';
  if (done !== undefined && typeof done !== 'boolean') return 'done ต้องเป็น true หรือ false';
  return null;
}

// ---------- REST API: /api/tasks ----------

// GET /api/tasks?done=true&category=เรียน&priority=high
app.get('/api/tasks', (req, res) => {
  const { done, category, priority } = req.query;
  let result = tasks;
  if (done !== undefined) result = result.filter(t => t.done === (done === 'true'));
  if (category) result = result.filter(t => t.category === category);
  if (priority) result = result.filter(t => t.priority === priority);
  res.json(result);
});

// GET /api/tasks/:id
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'ไม่พบงานที่ระบุ' });
  res.json(task);
});

// POST /api/tasks
app.post('/api/tasks', (req, res) => {
  const error = validate(req.body || {});
  if (error) return res.status(400).json({ error });
  const { title, category, priority, done } = req.body;
  const task = {
    id: nextId++,
    title: title.trim(),
    category: (category || '').trim() || 'ทั่วไป',
    priority: priority || 'medium',
    done: done || false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  res.status(201).json(task);
});

// PATCH /api/tasks/:id
app.patch('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: 'ไม่พบงานที่ระบุ' });
  const error = validate(req.body || {}, { partial: true });
  if (error) return res.status(400).json({ error });
  const { title, category, priority, done } = req.body;
  if (title !== undefined) task.title = title.trim();
  if (category !== undefined) task.category = category.trim() || 'ทั่วไป';
  if (priority !== undefined) task.priority = priority;
  if (done !== undefined) task.done = done;
  res.json(task);
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'ไม่พบงานที่ระบุ' });
  tasks.splice(index, 1);
  res.status(204).end();
});

// JSON ที่ส่งมาผิดรูปแบบ -> 400
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'รูปแบบ JSON ไม่ถูกต้อง' });
  console.error(err);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดที่เซิร์ฟเวอร์' });
});

app.listen(PORT, () => console.log(`Task Manager running at http://localhost:${PORT}`));