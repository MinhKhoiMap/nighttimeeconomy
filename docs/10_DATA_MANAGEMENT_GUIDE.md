# Hướng dẫn quản trị dữ liệu GIS/Firebase

## 1. Nguyên tắc vận hành

- Thao tác trên dev/staging trước production.
- Backup object/folder liên quan trước khi overwrite.
- Không đổi tên field/path tùy ý; frontend phụ thuộc case chính xác.
- Validate GeoJSON và mở thử đúng site/mode trước khi công bố.
- Scenario đang được upload bằng overwrite object cùng path; không có transaction hoặc rollback trong app.
- Nguồn dữ liệu runtime chính là Firebase, được truy cập qua service wrapper như `firebaseStorage` hoặc service tương ứng. Không cập nhật tài liệu hoặc quy trình như thể app đang đọc JSON local, trừ các fallback/static asset đã nêu rõ.

## 2. Thêm khu vực/area mới

Ứng dụng dùng route `/:area`, nhưng còn nhiều path `nha_trang` hard-code. Trước khi thêm area thứ hai cần refactor toàn bộ path trong `Overview`, `Project`, `Landuse`, `Activities` sang `params.area` hoặc config.

Sau refactor:

1. Tạo `<area>/geojson/` trong Firebase Storage.
2. Upload đủ `site.json`, `landuse.json`, `buildinguse.json`, `activities.json`, `interview.json`, `road.json`.
3. Đảm bảo mảng trong 5 file theo site có cùng thứ tự với `site.features`.
4. Mỗi site có `properties.id` duy nhất, dùng được trong URL/path.
5. Cập nhật default area trên Home page/config.
6. Test viewer, scenario, media và edit cho từng site.

Không có bước đặt GeoJSON vào thư mục local của repository cho runtime chính. `src/assets/data/data.js` là backup thủ công cho base map trên cloud; không coi đó là dữ liệu production đang được app fetch để render map.

## 3. Thêm site mới trong area hiện có

1. Thêm polygon vào `site.json`.
2. Thêm một `FeatureCollection` ở cùng index vào từng dataset array.
3. Thêm road `FeatureCollection`; Overview gọi `changeRoad(0)`, nên cần ít nhất một road feature hợp lệ hoặc phải sửa component để hỗ trợ rỗng.
4. Tạo media folders khi cần.
5. Xóa cache session và test route `/<area>/<site.properties.id>`.

## 4. Thêm/cập nhật đối tượng GIS

| Layer | Geometry | Field bắt buộc theo frontend |
|---|---|---|
| Site | Polygon; code load bounds giả định ring đầu | `properties.id` |
| Land Use | Polygon/MultiPolygon | `properties.id`, `properties.Landuse` |
| Building Use | Polygon | `properties.id`, `properties.Buildsused`, `properties.height` nếu extrude |
| Activities | Point | `properties.id`, `item_1`, `Time`, `Informal` |
| Interview | Point | `properties.id` |
| Road | LineString | Geometry hợp lệ cho Turf |
| Viewpoint | Point | `properties.id`, `properties.id_build` |

Tọa độ là `[longitude, latitude]`. Không lưu `[latitude, longitude]`.

### Qua UI Edit Mode

- Login → chọn site → action menu → Edit Mode.
- Chọn/New scenario; `Base` không sửa được.
- Landuse/Buildinguse dùng Mapbox Draw.
- Activities double-click site polygon để tạo point.
- Save để upload scenario.

UI không chỉnh được site, road hoặc interview point; phải cập nhật dữ liệu ngoài app sau khi có quy trình review.

## 5. Cập nhật popup/card/detail

- Hover Land Use đọc `Landuse` và tính `Area` runtime.
- Hover Building Use đọc `Buildsused`.
- Hover Activities đọc `item_1`.
- Interview chỉ dùng `id` để tìm media.
- Overview description đang hard-code trong JSX.
- Không có Mapbox `Popup` native.

Muốn thêm field hiển thị phải cập nhật cả schema, `InfoTable` payload và mọi editor/import validator liên quan.

## 6. Upload media/file

| Nội dung | Path | Cách app đọc |
|---|---|---|
| Overview ảnh/video | `<area>/media/<siteId>/overview`; một số đoạn hiện vẫn hard-code area | Dựa `metadata.contentType` |
| Interview ảnh | `<area>/media/<siteId>/interview/<interviewId>` | Tất cả item thành gallery URL |
| Landuse design image/text | `<area>/media/<siteId>/design_images/<scenario>/landuse/<featureId>` | Ghép ảnh và `.json` text bằng basename |
| Viewpoint image | `<area>/media/<siteId>/viewpoints/<scenario>/<viewpointId>` | Chỉ ảnh khi xem |
| Project PDF | `nha_trang/media/site<index+1>/project/<scenario-lowercase>` | Lấy item đầu tiên |

Ứng dụng hiện chỉ dùng `accept="image/*"` phía client; chưa có kiểm tra kích thước/MIME server-side trong repository. Các giới hạn này cần được enforce bằng Storage Rules hoặc quy trình vận hành.

## 7. Xóa dữ liệu an toàn

App không gọi `deleteObject`. Quy trình xóa Storage phải thực hiện ngoài app và cần:

1. Xác định mọi liên kết bằng site/scenario/feature ID.
2. Backup object/folder.
3. Nếu xóa feature, cập nhật GeoJSON trước; sau đó mới xóa media mồ côi.
4. Nếu xóa scenario, xóa đồng bộ scenario JSON, design images, viewpoints, chart và project PDF nếu cùng scope.
5. Không xóa Base GeoJSON khi client còn trỏ tới.
6. Smoke test và kiểm tra link/download URL cũ.

Owner, retention và người có quyền xóa cần được xác nhận trong quá trình tiếp nhận.

## 8. Backup

Repository hiện chưa có backup script/policy. Trước bàn giao cần xác nhận:

- bucket thực tế và IAM owner;
- object versioning/retention/lifecycle;
- backup location khác project/bucket;
- lịch và kiểm thử restore;
- phạm vi Authentication user export nếu cần.

Có thể dùng công cụ Google Cloud/Firebase Console được tổ chức phê duyệt để copy/version bucket. Câu lệnh, project và quyền cụ thể cần được xác nhận theo môi trường vận hành thực tế.

## 9. Kiểm tra dữ liệu sai format

Checklist cho từng file:

- JSON parse được và `type` đúng.
- FeatureCollection có `features` array.
- Geometry type đúng layer; coordinates hữu hạn và trong khoảng hợp lệ.
- Polygon ring đóng, không self-intersection; MultiPolygon đúng nesting.
- ID không null/trùng; viewpoint `id_build` trỏ building tồn tại.
- Category đúng constant hoặc chấp nhận màu fallback.
- `height` chuyển được sang number.
- `Time` chỉ gồm `1`, `2`, `3`; `Informal` nhất quán `0`/`1`.
- Mảng dataset có cùng số lượng/thứ tự site.
- File scenario có filename key mà `SourceID`/Context nhận biết.

## 10. Field/path không nên đổi tên

`id`, `Landuse`, `Buildsused`, `height`, `item_1`, `Item`, `Time`, `Informal`, `id_build`, `features`, `geometry`, `properties`, `coordinates`, cùng các filename `site`, `landuse`, `buildinguse`, `activities`, `interview`, `road`, `viewpoints`.

Nếu buộc phải đổi, cần migration dữ liệu và release frontend đồng bộ.

## 11. Local data trong repository

| File/nhóm | Vai trò hiện tại | Khuyến nghị quản trị |
|---|---|---|
| `src/assets/data/chartdata.js` | Fallback chart Base cho Interview | Có thể cập nhật nếu cần đổi chart Base; không thay cho chart scenario trên Storage. |
| `src/assets/data/data.js` | Backup thủ công cho base map trên cloud | Không phải nguồn runtime; không dùng làm nguồn dữ liệu chính của ứng dụng. |
| `src/assets/images/*.json` | Lottie/icon UI | Không quản trị như dữ liệu GIS. |
| GeoJSON production | Firebase / Firebase Storage `<area>/geojson` và `<area>/scenarios` | Quản trị bằng quy trình Firebase, service wrapper, backup và rules. |
