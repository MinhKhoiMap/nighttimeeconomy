# Environment variables

## 1. Trạng thái hiện tại

Phiên bản hiện tại chưa đọc `import.meta.env`, `process.env` hoặc biến `VITE_*`, đồng thời chưa có `.env.example`. Mapbox token và Firebase client config đang được khai báo trực tiếp trong mã nguồn.

Vì vậy, bảng “biến môi trường hiện có” là:

| Biến | Trạng thái |
|---|---|
| Mapbox token env | Không có |
| Firebase config env | Không có |
| API endpoint env | Không có |
| App URL env | Không có |
| Secret server-side | Không có backend để sử dụng |

## 2. Giá trị cấu hình đang hard-code

| Cấu hình | File | Bắt buộc | Ghi chú bảo mật |
|---|---|---:|---|
| Mapbox public access token | `src/App.jsx` | Có | Đã commit; không chép token thật vào tài liệu |
| Mapbox style URL | `src/App.jsx` | Có | Phụ thuộc account/style hiện tại |
| Firebase `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId` | `src/services/firebaseApp.js` | Có | Firebase web config là client config nhưng phải kết hợp Security Rules an toàn |
| Firebase Storage path prefix | Nhiều page | Có | Có cả route động và `nha_trang` hard-code |
| PDF worker CDN URL/version | `src/components/DocumentViewer/DocumentViewer.jsx` | Có khi xem PDF | Phụ thuộc `unpkg.com` và version `3.4.120` |

## 3. Bộ env đề xuất khi chuẩn hóa

Đây là khuyến nghị refactor, chưa được hỗ trợ trực tiếp trong phiên bản hiện tại.

| Tên đề xuất | Dùng tại | Bắt buộc | Ví dụ giả lập |
|---|---|---:|---|
| `VITE_MAPBOX_ACCESS_TOKEN` | `src/App.jsx` | Có | `pk.example_public_token` |
| `VITE_MAPBOX_STYLE_URL` | `src/App.jsx` | Có | `mapbox://styles/example/style-id` |
| `VITE_FIREBASE_API_KEY` | `src/services/firebaseApp.js` | Có | `AIzaExampleOnly` |
| `VITE_FIREBASE_AUTH_DOMAIN` | cùng file | Có | `example.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | cùng file | Có | `example-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | cùng file | Có | `example-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | cùng file | Có theo config | `123456789000` |
| `VITE_FIREBASE_APP_ID` | cùng file | Có | `1:123:web:example` |
| `VITE_DEFAULT_AREA` | `HomePage`, các path hard-code | Tùy refactor | `nha_trang` |

Ví dụ `.env.local` sau khi refactor:

```dotenv
VITE_MAPBOX_ACCESS_TOKEN=pk.example_public_token
VITE_MAPBOX_STYLE_URL=mapbox://styles/example/style-id
VITE_FIREBASE_API_KEY=AIzaExampleOnly
VITE_FIREBASE_AUTH_DOMAIN=example.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=example-project
VITE_FIREBASE_STORAGE_BUCKET=example-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789000
VITE_FIREBASE_APP_ID=1:123456789000:web:example
VITE_DEFAULT_AREA=nha_trang
```

## 4. Lưu ý bảo mật

- Mọi biến `VITE_*` được bundle vào JavaScript client và người dùng có thể xem; không đặt service account key, private key, admin credential hoặc server secret trong đó.
- Hạn chế Mapbox token theo allowed URL/scope và xoay token đã lộ.
- Firebase web config không thay thế Authentication/Storage Security Rules.
- `.gitignore` bỏ qua `.env` và `*.local`; vẫn cần commit `.env.example` chỉ chứa placeholder.
- Env trên Vercel phải được khai báo cho từng Production/Preview/Development environment sau khi ứng dụng chuyển sang đọc env.
