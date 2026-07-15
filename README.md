# EnterpriseHub AI — MVP

منصة تشغيل داخلية للشركات: تخزين ملفات، إدارة مستندات، وذكاء اصطناعي للبحث والتحليل.

هذا الإصدار يغطي **الأساسيات** الجاهزة للتشغيل:
- ✅ **Auth**: تسجيل / دخول بـ JWT وأدوار (Admin, HR, Finance, Legal, Employee)
- ✅ **Company Drive**: مجلدات، رفع/تنزيل/حذف ملفات (soft delete)، مع دعم تخزين محلي أو MinIO/S3
- ✅ **Dashboard**: إحصائيات حية (عدد الملفات، المساحة المستخدمة، التصاريح المنتهية...)
- ✅ **Audit Log**: تسجيل كل عملية رفع/حذف/تنزيل في قاعدة البيانات (الواجهة لعرضه لاحقًا)
- 🔜 مجهزة بنيويًا وغير مفعّلة بعد: License Management، Notifications، AI Document Intelligence، Smart Search، AI Chat، Employee Management (الجداول والنماذج موجودة في `backend/app/models`)

## البنية

```
enterprisehub-ai/
├── backend/          FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── core/     config, database, security (JWT/bcrypt)
│   │   ├── models/    User, Folder, File, License, AuditLog
│   │   ├── schemas/   Pydantic request/response models
│   │   ├── services/  storage.py (local disk أو MinIO/S3)
│   │   └── api/routes/ auth.py, drive.py, dashboard.py
│   └── requirements.txt
├── frontend/         Next.js 16 (App Router) + Tailwind v4 + RTL عربي
│   ├── app/(dashboard)/  dashboard, drive
│   ├── app/login/
│   ├── components/      Sidebar, Topbar, StatCard
│   ├── context/          auth-context.tsx
│   └── lib/api.ts        عميل الـ API
└── docker-compose.yml  Postgres + MinIO + backend + frontend
```

## التشغيل السريع (Docker)

```bash
cp backend/.env.example backend/.env
# عدّل SECRET_KEY في backend/.env لقيمة عشوائية قبل أي استخدام حقيقي

docker compose up --build
```

- الواجهة: http://localhost:3000
- الـ API: http://localhost:8000/docs (Swagger تلقائي)
- MinIO Console: http://localhost:9001 (minioadmin / minioadmin)

## التشغيل بدون Docker (تطوير محلي)

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # STORAGE_BACKEND=local يكفي للتطوير بدون MinIO
uvicorn app.main:app --reload
```
يحتاج PostgreSQL شغّال محليًا (أو غيّر DATABASE_URL). الجداول تُنشأ تلقائيًا عند أول تشغيل.

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## أول استخدام

1. أنشئ أول مستخدم عبر Swagger (`/docs`) على `POST /api/auth/register`، أو من الطرفية:
   ```bash
   curl -X POST http://localhost:8000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"full_name":"Aya","email":"aya@company.com","password":"secret123","department":"IT","role":"admin"}'
   ```
2. سجّل الدخول من `/login` في الواجهة بنفس البيانات.
3. من "ملفات الشركة" أنشئ مجلدات وارفع ملفات — يدعم السحب والإفلات.

## الخطوة التالية المقترحة

الموديولات التالية جاهزة الجداول في قاعدة البيانات لكن بلا API/واجهة بعد، رتبتها حسب الأسهل تنفيذًا:
1. **License Management** — CRUD كامل فوق جدول `licenses` الموجود + عرضه في الواجهة.
2. **Notifications** — مهمة مجدولة (APScheduler/Celery) تفحص `licenses.expiry_date` يوميًا وترسل تنبيهات.
3. **AI Document Intelligence** — عند الرفع: استخراج نص (OCR إن لزم) → تلخيص وتصنيف عبر LLM → تخزين في `files.extracted_text/ai_summary/ai_category`.
4. **Smart Search / AI Chat** — يعتمد على النقطة السابقة (يحتاج نص مستخرج ومفهرس أولًا، عبر FAISS/ChromaDB).

قوليلي أي موديول تحبي نبدأ فيه بعد كده وهكمله بنفس الأسلوب (كود شغال ومُختبر).
