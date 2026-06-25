# Hướng dẫn cài đặt và chạy local

## 1. Yêu cầu

- Node.js và npm.
- Khuyến nghị dùng một Node.js LTS tương thích Vite 5 và giữ cùng version trong CI.
- Quyền truy cập Firebase project/Storage phù hợp.
- Mapbox public token có quyền đọc style được cấu hình.

Repository có `package-lock.json`, vì vậy dùng npm để tái lập dependency.

## 2. Cài dependencies

```bash
npm ci
```

Nếu chủ động cập nhật dependency mới dùng `npm install`, nhưng thao tác này có thể thay đổi lockfile và không nên thực hiện trong quy trình bàn giao không kiểm soát.

## 3. Cấu hình

### Trạng thái cấu hình hiện tại

App không đọc `.env`; Firebase config, Mapbox token/style đã hard-code. Không chép lại các giá trị thật vào tài liệu.

### Cấu hình khuyến nghị

1. Refactor ứng dụng để đọc các key ở `04_ENVIRONMENT_VARIABLES.md`.
2. Tạo `.env.local` từ `.env.example` chứa placeholder.
3. Không commit `.env.local`.
4. Bật Email/Password trong Firebase Authentication.
5. Đảm bảo Storage có `<area>/geojson/*.json` và rules cho đúng môi trường.

## 4. Chạy development server

```bash
npm run dev
```

Mở URL Vite in ra terminal, thường là `http://localhost:5173`.

Luồng smoke test:

1. Mở `/` và kiểm tra style/globe.
2. Nhấn Start; do phiên bản hiện tại hard-code `district_3`, Storage phải có `district_3/geojson/*` hoặc cần sửa default area.
3. Chọn site, chuyển qua 4 Interact mode.
4. Mở Overview/Project.
5. Login bằng test account, tạo scenario thử ở project dev.

## 5. Build và preview

```bash
npm run build
npm run preview
```

- Output Vite mặc định: `dist/`.
- Preview chỉ phục vụ kiểm tra local, không phải production server.

### Trạng thái build đã xác thực

Tại snapshot bàn giao, `npm run build` thất bại:

```text
Could not resolve "./pages/Test/Test" from "src/App.jsx"
```

Nguyên nhân: `src/App.jsx` import `src/pages/Test/Test`, nhưng file không tồn tại. Cần xác nhận nên khôi phục component hay xóa route/import trước khi deploy.

## 6. Lint

```bash
npm run lint
```

Hiện lệnh thất bại vì không có ESLint configuration file. Cần bổ sung config phù hợp JSX/React/TSX rồi xử lý warning/error.

## 7. Lỗi local thường gặp

| Triệu chứng                                     | Nguyên nhân/kiểm tra                                                   |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| `vite is not recognized`                        | Dependency chưa cài đúng; chạy `npm ci`                                |
| Loading không kết thúc                          | Thiếu một trong 6 GeoJSON object hoặc Storage permission/download lỗi  |
| `Firebase App named '[DEFAULT]' already exists` | Init app nhiều lần/HMR; chuẩn hóa singleton bằng `getApps()`           |
| `FirebaseError: permission-denied`              | Authentication hoặc Storage Rules/path không khớp                      |
| Direct URL trả 404                              | Hosting thiếu SPA fallback về `index.html`                             |
| Base data cũ                                    | Xóa `sessionStorage.geojson_source` trong DevTools                     |
| PDF không mở                                    | File/path/MIME/CORS hoặc CDN worker không truy cập được                |
| Layer không hiện                                | Field case/schema/index site/geometry không đúng                       |
| Signup lỗi                                      | Luồng signup hiện có lỗi `updateProfile`/`navigator`; xem Known Issues |

## 8. Không dùng production để phát triển

Do Firebase project đang được khai báo trực tiếp và client có khả năng upload, không chạy Edit Mode thử nghiệm trên production trước khi:

- tách dev project;
- backup Storage;
- thay config bằng env theo môi trường.
