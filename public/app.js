const API = '/api/tasks';
const PRIORITY_LABEL = { low: 'ไม่รีบ', medium: 'ปกติ', high: 'ด่วน' };

const listEl = document.getElementById('task-list');
const summaryEl = document.getElementById('summary');
const errorEl = document.getElementById('error');
const form = document.getElementById('add-form');
const filterCategory = document.getElementById('filter-category');

let filterDone = '';
let editingId = null;

function showError(message) {
  errorEl.textContent = message || '';
  errorEl.hidden = !message;
}

// เรียก API ของตัวเอง; ถ้า status ไม่ ok ให้โยน error พร้อมข้อความจากเซิร์ฟเวอร์
async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `เกิดข้อผิดพลาด (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

const jsonOptions = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// ---------- GET: โหลดและแสดงรายการ ----------
async function loadTasks() {
  try {
    const params = new URLSearchParams();
    if (filterDone) params.set('done', filterDone);
    if (filterCategory.value) params.set('category', filterCategory.value);
    const tasks = await request(`${API}?${params}`);
    render(tasks);
    showError('');
    updateCategories();
  } catch (err) {
    showError(err.message);
  }
}

// เติมตัวเลือกหมวดหมู่จากข้อมูลทั้งหมด
async function updateCategories() {
  const all = await request(API);
  const categories = [...new Set(all.map(t => t.category))];
  const current = filterCategory.value;
  filterCategory.replaceChildren(new Option('ทุกหมวดหมู่', ''));
  categories.forEach(c => filterCategory.add(new Option(c, c)));
  filterCategory.value = categories.includes(current) ? current : '';
  const open = all.filter(t => !t.done).length;
  summaryEl.textContent = all.length ? `ค้างอยู่ ${open} จาก ${all.length} งาน` : '';
}

function render(tasks) {
  listEl.replaceChildren();
  if (!tasks.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'ยังไม่มีงานในมุมมองนี้ ลองเพิ่มงานแรกได้เลย';
    listEl.append(li);
    return;
  }
  tasks.forEach(t => listEl.append(t.id === editingId ? editRow(t) : taskRow(t)));
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function taskRow(t) {
  const li = el('li', `task p-${t.priority}${t.done ? ' done' : ''}`);

  const check = el('input');
  check.type = 'checkbox';
  check.checked = t.done;
  check.setAttribute('aria-label', `ทำ "${t.title}" เสร็จแล้ว`);
  check.addEventListener('change', () => update(t.id, { done: check.checked }));

  const body = el('div');
  body.append(el('div', 'task-title', t.title), el('div', 'task-meta', `${t.category} · ${PRIORITY_LABEL[t.priority]}`));

  const actions = el('div', 'actions');
  const edit = el('button', '', 'แก้ไข');
  edit.addEventListener('click', () => { editingId = t.id; loadTasks(); });
  const del = el('button', 'delete', 'ลบ');
  del.addEventListener('click', () => remove(t));
  actions.append(edit, del);

  li.append(check, body, actions);
  return li;
}

function editRow(t) {
  const li = el('li', `task p-${t.priority}`);
  li.append(el('span'));

  const fields = el('div', 'edit-fields');
  const title = el('input'); title.value = t.title; title.setAttribute('aria-label', 'ชื่องาน');
  const category = el('input'); category.value = t.category; category.setAttribute('aria-label', 'หมวดหมู่');
  const priority = el('select'); priority.setAttribute('aria-label', 'ความสำคัญ');
  Object.entries(PRIORITY_LABEL).forEach(([v, label]) => priority.add(new Option(label, v)));
  priority.value = t.priority;
  fields.append(title, category, priority);

  const actions = el('div', 'actions');
  const save = el('button', 'primary', 'บันทึก');
  save.addEventListener('click', () => update(t.id, { title: title.value, category: category.value, priority: priority.value }));
  const cancel = el('button', '', 'ยกเลิก');
  cancel.addEventListener('click', () => { editingId = null; loadTasks(); });
  actions.append(save, cancel);

  li.append(fields, actions);
  return li;
}

// ---------- POST: เพิ่มงาน ----------
form.addEventListener('submit', async e => {
  e.preventDefault();
  try {
    await request(API, jsonOptions('POST', {
      title: document.getElementById('title').value,
      category: document.getElementById('category').value,
      priority: document.getElementById('priority').value,
    }));
    form.reset();
    document.getElementById('priority').value = 'medium';
    await loadTasks();
  } catch (err) {
    showError(err.message);
  }
});

// ---------- PATCH: แก้ไข / ติ๊กเสร็จ ----------
async function update(id, changes) {
  try {
    await request(`${API}/${id}`, jsonOptions('PATCH', changes));
    editingId = null;
    await loadTasks();
  } catch (err) {
    showError(err.message);
  }
}

// ---------- DELETE: ลบงาน ----------
async function remove(t) {
  if (!confirm(`ลบงาน "${t.title}" ?`)) return;
  try {
    await request(`${API}/${t.id}`, { method: 'DELETE' });
    await loadTasks();
  } catch (err) {
    showError(err.message);
  }
}

// ---------- ตัวกรอง ----------
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelector('.tab.active').classList.remove('active');
    tab.classList.add('active');
    filterDone = tab.dataset.done;
    loadTasks();
  });
});
filterCategory.addEventListener('change', loadTasks);

loadTasks();