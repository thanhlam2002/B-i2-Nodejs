# 📘 Book Manager API

API Quản lý sách sử dụng **Node.js**, **Express**, **MongoDB** và **Swagger UI**.

---

## 🚀 Chức năng chính

- Tạo, đọc, cập nhật, xoá sách (CRUD)
- Tìm kiếm theo chuyên mục
- Sắp xếp theo năm hoặc tiêu đề
- Tìm kiếm nâng cao theo tác giả và năm
- Phân trang danh sách sách
- Thống kê tổng số sách, sách cũ nhất và mới nhất
- Swagger UI để test và xem tài liệu API

---

## 📦 Cài đặt

```bash
git clone https://github.com/thanhlam2002/B-i2-Nodejs.git
cd B-i2-Nodejs
npm install
```

> 📌 **Lưu ý**: Cần cài sẵn Node.js và MongoDB trên máy.

---

## ⚙️ Chạy ứng dụng

1. Khởi động MongoDB (nếu bạn đang dùng MongoDB local):

```bash
mongod
```

2. Sau đó chạy app:

```bash
node index.js
```

Server sẽ chạy tại:  
👉 `http://localhost:3000`

---

## 🧪 Swagger API Docs

Giao diện tài liệu & test API trực tiếp tại:  
👉 `http://localhost:3000/api-docs`

---

## 💾 Dữ liệu mẫu

Bạn có thể dùng Postman hoặc Swagger để `POST` 20 quyển sách mẫu vào MongoDB, hoặc import file JSON nếu có.
