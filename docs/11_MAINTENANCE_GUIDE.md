# Hướng dẫn bảo trì và mở rộng

## 1. Thêm data domain/collection mới

Với một domain GIS mới lưu trong Firebase/Firebase Storage:

1. Định nghĩa schema/ID/geometry và version.
2. Tạo file base trong `<area>/geojson`.
3. Load vào `SiteSelection`, cache và đưa vào `SiteDataContext`.
4. Thêm source/layer/component và constant ID.
5. Bổ sung domain vào scenario load/save ở tất cả editor hoặc refactor thành một service save tập trung.
6. Viết validator và migration.
7. Cập nhật Storage Rules theo path.

Nếu domain mới dùng Firestore hoặc service Firebase khác, phải tạo/cập nhật service wrapper, model/query/index/rules và tài liệu hóa rõ data flow qua service.

Không thêm domain mới bằng cách chỉ commit JSON local vào `src/assets`. Runtime data đi qua Firebase service wrapper; `src/assets/data/data.js` chỉ là backup thủ công cho base map trên cloud.

## 2. Thêm filter/search

- Filter category hiện dùng state + Mapbox expression hoặc lọc `features` trong memory.
- Thêm filter mới nên tạo pure predicate, compose với filter hiện tại, memoize kết quả và giữ field case chính xác.
- Với dataset lớn, không deep-copy/filter toàn collection mỗi render; dùng vector tile/filter server-side hoặc index.
- Chức năng search text chưa được triển khai. Cần xác định search scope, normalization tiếng Việt và hành vi fly/fit trước khi triển khai.

## 3. Tách dev/staging/production

1. Tạo Firebase project/bucket và Mapbox token/style riêng cho từng env.
2. Chuyển config sang `VITE_*`.
3. Tạo `.env.development.local`, `.env.staging.local`/CI vars, production vars.
4. Tách Storage Rules/IAM và dataset.
5. Gắn domain restrictions cho token.
6. Hiển thị environment banner trong non-production.
7. Cấm production write từ local nếu không có phê duyệt.

## 4. Đổi Firebase project/Mapbox style

Xem `05_FIREBASE_SETUP_AND_DATA_MODEL.md` và `06_MAPBOX_AND_GIS_PIPELINE.md`. Luôn test cả Authentication, Storage reads/writes, nested routes, media, PDF và layer ordering.

## 5. Performance với GIS lớn

Ưu tiên theo thứ tự:

1. Đo thời gian load/render, bundle và memory.
2. Tải song song các file độc lập bằng `Promise.all` và có retry/error UI.
3. Chỉ tải site/layer cần thiết; bỏ mảng toàn area nếu không cần.
4. Simplify geometry theo zoom; cân nhắc vector tiles/Mapbox tileset.
5. Tránh `JSON.parse(JSON.stringify(...))` toàn dataset khi edit một feature.
6. Debounce/throttle mousemove; cleanup event handler.
7. Tách/chunk media và lazy load.
8. Không tạo source/layer mới mỗi animation frame; cập nhật một source cố định.
9. Đặt cache version/TTL thay vì cache session vô hạn.

## 6. Token Mapbox bị lộ

Token hiện đã nằm trong mã nguồn. Quy trình xử lý:

1. Tạo/rotate token thay thế trong Mapbox account.
2. Chỉ cấp scope cần đọc style/tiles.
3. Hạn chế allowed URLs cho từng environment.
4. Chuyển token sang env để quản trị deployment; hiểu rằng public token vẫn hiển thị trong client.
5. Thu hồi token cũ sau khi deployment mới hoạt động.
6. Kiểm tra usage/billing bất thường.

## 7. Firebase permission denied

1. Ghi nhận exact path, operation, auth UID/email và environment.
2. Xác nhận `onAuthStateChanged` đã có user và token chưa hết hạn.
3. Đối chiếu path thực tế (`nha_trang` so với route area).
4. Kiểm tra Storage Rules bằng Emulator/Rules simulator nếu tổ chức có cấu hình.
5. Không sửa rules thành public write để “chữa nhanh”.
6. Kiểm tra ownership convention và custom claims nếu bổ sung role.

Rules hiện chưa có trong repository; cần xác nhận bộ rules đang vận hành trong quá trình tiếp nhận.

## 8. Map/layer không render

- Map: kiểm tra token/style/network/container size.
- Data: download URL, JSON parse, cache và array index site.
- Layer: ID, source mount timing, field case, geometry, filter, `beforeId`.
- Draw: control chỉ add một lần, event cleanup, selected feature ID.
- Symbol: image load trước layer.
- 3D: `height` numeric; pitch hiện không tự đổi khi vào Building Use.

## 9. Refactor ưu tiên

1. Khôi phục build và ESLint/test baseline.
2. Chuẩn hóa Firebase singleton/config env.
3. Loại hard-code area/path và định nghĩa Storage schema tập trung.
4. Viết Security Rules + emulator tests.
5. Tách data access khỏi UI và tập trung scenario serializer.
6. Thêm schema validation/migration/version.
7. Sửa event lifecycle và mutation state.
8. Tối ưu load/cache/render.
9. Duy trì hoặc archive `src/assets/data/data.js` theo chính sách backup thủ công cho base map; không đưa file này vào runtime nếu không có yêu cầu và migration rõ ràng.

## 10. Dependency maintenance

- Dùng `npm ci` trong CI.
- Review changelog/migration trước major upgrade Mapbox, Firebase, Vite, React PDF Viewer.
- Chạy build/lint/test và smoke test map after upgrade.
- Không update PDF API mà giữ worker CDN khác version.
- Xóa dependency chỉ sau khi xác nhận không có dynamic/indirect usage.
