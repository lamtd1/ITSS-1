# Hướng dẫn chạy dự án (Backend, Frontend, AI)

Tài liệu này hướng dẫn chạy 3 phần của dự án trên Windows (PowerShell v5.1).

## Yêu cầu chung
- Cài đặt Node.js (>= 18 khuyến nghị). Kiểm tra: `node -v`
- PostgreSQL đang chạy (AI Service + Backend dùng Sequelize)
- (Nếu dùng) MongoDB chạy nếu biến `MONGO_URI` được cấu hình
- Tạo file `.env` trong thư mục `backend/` theo phần cấu hình bên dưới

## Cấu hình môi trường (`backend/.env`)
Sao chép mẫu bên dưới và chỉnh giá trị thực tế:

```
# Backend server
PORT=3000
MONGO_URI=mongodb://localhost:27017/itss1

# PostgreSQL (dùng chung cho Backend và AI Service)
DB_NAME=itss1_db
DB_USER=postgres
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=5432

# Auth/JWT (nếu có)
JWT_SECRET=change_me
```

Lưu ý:
- Backend và AI service cùng dùng biến `DB_*` qua `backend/config/db.js`.
- AI service đã cấu hình dùng chung instance Sequelize của backend.
- Nếu chưa dùng MongoDB, có thể bỏ trống `MONGO_URI` nhưng đảm bảo code không phụ thuộc.

## Cài đặt phụ thuộc
Thực hiện mỗi phần trong cửa sổ PowerShell khác nhau để chạy song song.

### 1) Backend
```powershell
cd "E:\hung\prj\ITSS1\ITSS-1\backend"
npm install
# Cài nodemon (nếu chưa có)
npm install -D nodemon
```

### 2) Frontend
```powershell
cd "E:\hung\prj\ITSS1\ITSS-1\frontend"
npm install
```

### 3) AI Service (nằm trong backend)
Phần AI dùng chung `node_modules` của backend, không cần cài lại.

## Chạy dự án
Mở 3 cửa sổ PowerShell riêng, chạy theo thứ tự bên dưới:

### Cửa sổ 1: Backend API
```powershell
cd "E:\hung\prj\ITSS1\ITSS-1\backend"; npm run start:server
```
Mặc định: chạy ở port `PORT` trong `.env` (ví dụ 5000). Script dùng `nodemon --inspect server.js`.

### Cửa sổ 2: AI Service
```powershell
cd "E:\hung\prj\ITSS1\ITSS-1\backend"; npm run start:ai
```
- Mặc định AI Service chạy port `8000` (xem `backend/ai/server.js`).
- Đảm bảo các biến `AI_DB_*` đúng để kết nối Postgres.

### Cửa sổ 3: Frontend (Vite)
```powershell
cd "E:\hung\prj\ITSS1\ITSS-1\frontend"; npm run dev
```
- Vite mặc định chạy ở `http://localhost:5173` (tuỳ phiên bản cấu hình).
- Nếu frontend gọi API, kiểm tra base URL (ví dụ `http://localhost:3000`).

## Kiểm tra nhanh kết nối
- Backend: truy cập `http://localhost:5000/api/auth/...` hoặc `http://localhost:5000/api/slides/...`
- AI Service: truy cập `http://localhost:8000/` theo route trong `backend/ai/routes/translationRoutes.js`
- Frontend: truy cập `http://localhost:5173`

## Ghi chú lỗi thường gặp
- `npm start` lỗi ở frontend: dùng `npm run dev` (Vite). `npm start` không có trong `frontend/package.json`.
- Thiếu `nodemon`: cài `npm install -D nodemon` trong thư mục `backend`.
- Lỗi kết nối DB: kiểm tra `.env`, Postgres đang chạy, user/pass đúng.
- Cổng trùng: thay `PORT` hoặc dừng tiến trình đang chiếm cổng.

## Cấu trúc liên quan
- Backend scripts: `backend/package.json` -> `start:server`, `start:ai`
- Backend API entry: `backend/server.js`
- AI Service entry: `backend/ai/server.js`
- Frontend scripts: `frontend/package.json` -> `dev`, `build`, `preview`

## Build/Preview Frontend
```powershell
cd "E:\hung\prj\ITSS1\ITSS-1\frontend"; npm run build
cd "E:\hung\prj\ITSS1\ITSS-1\frontend"; npm run preview
```

---
Nếu cần, mình có thể thêm hướng dẫn seed dữ liệu hoặc script khởi tạo DB dựa trên thư mục `data/`.