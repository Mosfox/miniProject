# Task Manager

เว็บแอประบบจัดการงานส่วนตัวแบบลิสต์รายการ สร้างด้วย Node.js + Express.js (REST API) และหน้าเว็บ HTML/CSS/JavaScript ที่เรียก API ของตัวเองผ่าน `fetch()` — Mini Project แบบ full-stack

## แอปทำอะไรได้บ้าง

- ดูรายการงานทั้งหมด พร้อมกรองตามสถานะ (ทั้งหมด / ค้างอยู่ / เสร็จแล้ว) และตามหมวดหมู่
- เพิ่มงานใหม่ (ชื่องาน หมวดหมู่ ความสำคัญ) โดยไม่ต้องรีเฟรชหน้า
- ติ๊กว่าทำเสร็จแล้ว แก้ไขงาน และลบงาน
- ข้อมูลเก็บในหน่วยความจำของเซิร์ฟเวอร์ (รีสตาร์ทแล้วกลับเป็นข้อมูลตัวอย่าง)

## โครงสร้างโปรเจกต์

```
task-manager/
├── server/index.js     # เซิร์ฟเวอร์ Express + REST API
├── public/             # ฝั่งไคลเอนต์ (index.html, style.css, app.js)
├── docs/               # รายงาน PDF และภาพ screenshot
├── package.json
└── README.md
```

## วิธีติดตั้งและรัน

```bash
npm install
npm run dev     # หรือ npm start
```

จากนั้นเปิด http://localhost:3000

## REST API

Resource: `tasks` — ตัวอย่างข้อมูล

```json
{ "id": 1, "title": "ส่งรายงาน", "category": "เรียน", "priority": "high", "done": false, "createdAt": "2026-09-30T08:00:00.000Z" }
```

| Method | Endpoint | คำอธิบาย | Status |
|---|---|---|---|
| GET | `/api/tasks` | ดึงรายการทั้งหมด กรองด้วย `?done=true\|false`, `?category=...`, `?priority=low\|medium\|high` | 200 |
| GET | `/api/tasks/:id` | ดึงงานเดียว | 200, 404 ถ้าไม่พบ |
| POST | `/api/tasks` | เพิ่มงานใหม่ (ต้องมี `title`) | 201, 400 ถ้าข้อมูลไม่ถูกต้อง |
| PATCH | `/api/tasks/:id` | แก้ไขบางฟิลด์ (`title`, `category`, `priority`, `done`) | 200, 400, 404 |
| DELETE | `/api/tasks/:id` | ลบงาน | 204, 404 ถ้าไม่พบ |

## ภาพหลักฐานการดีบัก

> ใส่ภาพ screenshot 2 ภาพในโฟลเดอร์ `docs/` แล้วแก้ชื่อไฟล์ด้านล่างให้ตรง

![ภาพดีบัก 1](docs/debug-1.png)

![ภาพดีบัก 2](docs/debug-2.png)

## Screenshots และรายงาน

รายงานฉบับเต็มพร้อมภาพการทำงานอยู่ที่ [`docs/report.pdf`](docs/report.pdf)