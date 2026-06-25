# Hướng dẫn deployment

## 1. Cơ chế triển khai hiện có

Repository có `vercel.json`:

```json
{ "routes": [{ "src": "/[^.]+", "dest": "/", "status": 200 }] }
```

Đây là cấu hình SPA fallback cho Vercel.

## 2. Thông số build

| Hạng mục     | Giá trị                                              |
| ------------ | ---------------------------------------------------- |
| Install      | `npm ci`                                             |
| Build        | `npm run build`                                      |
| Output       | `dist`                                               |
| Framework    | Vite                                                 |
| SPA fallback | Mọi URL không phải static asset về `/index.html`/`/` |

## 3. Deploy Vercel

1. Import repository vào Vercel.
2. Chọn framework preset Vite.
3. Cấu hình Build Command `npm run build`, Output Directory `dist`, Install Command `npm ci`.
4. Sau khi refactor env, thêm toàn bộ `VITE_*` cho Production/Preview/Development.
5. Giữ SPA rewrite tương đương `vercel.json`.
6. Deploy preview và smoke test tất cả route, refresh trực tiếp `/:area/:site`.
7. Thêm deployment domain vào Firebase Authentication Authorized domains và Mapbox token URL restriction.
8. Promote production sau khi test read/write trên đúng Firebase environment.

## 5. Pre-deployment checklist

- [ ] `npm ci` hoàn tất từ lockfile sạch.
- [ ] `npm run build` thành công.
- [ ] Lint/test đạt; hiện project chưa có config/test.
- [ ] Không còn route/import thiếu.
- [ ] Config không trỏ nhầm production/dev.
- [ ] Storage Rules đã deploy và test bằng user ẩn danh/user thường.
- [ ] Mapbox token đã hạn chế domain/scope.
- [ ] Base GeoJSON đủ 6 file và đúng schema.
- [ ] Scenario/media/PDF path đã smoke test.
- [ ] Firebase Authorized domains có deployment domain.
- [ ] SPA fallback hoạt động khi refresh nested route.
- [ ] Backup/rollback plan và owner phê duyệt.
