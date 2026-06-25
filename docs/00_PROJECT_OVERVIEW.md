# Tổng quan dự án Night Time Economy

## 1. Phạm vi tài liệu

Tài liệu này được lập nhằm phục vụ quá trình bàn giao và tiếp nhận hệ thống. Nội dung bao gồm tổng quan dự án, kiến trúc ứng dụng, cấu trúc mã nguồn, cấu hình môi trường, tích hợp Firebase, xử lý dữ liệu GIS/Mapbox, quy trình vận hành và các lưu ý bảo trì.

Các hạng mục chưa hoàn thiện hoặc cần bổ sung thông tin được ghi chú tại các phần tương ứng để thuận tiện cho quá trình tiếp nhận và tiếp tục phát triển.

## 2. Đối tượng sử dụng

Night Time Economy là một nền tảng bản đồ tương tác hỗ trợ trực quan hóa và phân tích dữ liệu không gian của các khu vực nghiên cứu. Hệ thống hiện đang thể hiện dữ liệu mặc định tại Nha Trang, cho phép người dùng khám phá các khu vực quy hoạch, quan sát phân bố dữ liệu trên bản đồ và chuyển đổi giữa nhiều chế độ phân tích khác nhau để hỗ trợ đánh giá hoạt động kinh tế ban đêm.

- `Overview`: giới thiệu khu vực, media và mô phỏng điểm di chuyển trên mạng lưới đường.
- `Project`: xem phương án thiết kế được upload dưới dạng PDF (nếu có).
- `Interact`: xem, lọc và thống kê các layers `landuse`, `buildinguse`, `activities`, `interview`.
- `Edit`: người dùng đã đăng nhập có thể tạo/chỉnh geometry, thuộc tính, viewpoint, chart và lưu thành scenario riêng của bản thân trên Firebase Storage.

Nhóm người dùng:

| Nhóm người dùng | Chức năng chính                                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Người xem       | Chọn khu vực nghiên cứu (Site), xem các lớp dữ liệu GIS, hình ảnh/video, biểu đồ phân tích, các kịch bản (Scenario) và phương án thiết kế.  |
| Người biên tập  | Đăng nhập, bật **Edit Mode**, cập nhật dữ liệu không gian và nội dung, quản lý Scenario, Media, Chart và các thông tin phân tích liên quan. |
| Quản trị viên   | Có thể cập nhật base map                                                                                                                    |

## 3. Chức năng chính

| Chức năng         | Input runtime hiện tại                                      | Xử lý                                                                                       | Output                                                 |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Chọn khu vực/site | Route `/:area`, Storage object `<area>/geojson/site.json`   | Render polygon, `fitBounds`, click layer                                                    | Chuyển đến `/:area/:site`                              |
| Xem Land Use      | Storage object `<area>/geojson/landuse.json`                | Phân màu theo `properties.Landuse`, tính diện tích bằng Turf, filter và thống kê            | Polygon 2D, tooltip, legend, pie chart                 |
| Xem Building Use  | Storage object `<area>/geojson/buildinguse.json`            | Phân màu theo `properties.Buildsused`, extrude theo `height`, lọc viewpoint theo `id_build` | Building 3D, tooltip, legend, chart, gallery viewpoint |
| Xem Activities    | Storage object `<area>/geojson/activities.json`             | Cluster, filter `item_1`, `Time`, `Informal`                                                | Cluster/point, tooltip, legend, time filter            |
| Xem Interview     | Storage object `<area>/geojson/interview.json`, media/chart | Symbol layer và tải media/chart                                                             | Marker biểu tượng, gallery, chart                      |
| Xem Overview      | Storage object `<area>/geojson/road.json`, media overview   | Turf chia tuyến theo bước 10 m, animation                                                   | Điểm chạy theo đường, video và ảnh                     |
| Xem Project       | PDF trong Firebase Storage                                  | React PDF Viewer                                                                            | Trình đọc PDF                                          |
| Scenario          | GeoJSON scenario trong Firebase Storage                     | Tải/merge scenario hoặc phục hồi Base từ `sessionStorage`                                   | Bản đồ theo phương án                                  |
| Biên tập          | Mapbox Draw, form thuộc tính, file ảnh                      | Cập nhật state và source, upload Storage                                                    | Scenario mới/cập nhật                                  |
| Authentication    | Email/password                                              | Firebase Authentication                                                                     | Cho phép hiện Edit Mode trong UI                       |

## 4. Vai trò GIS, Mapbox và Firebase

- **GIS/Turf**: xử lý `FeatureCollection`, `Feature`, `Point`, `LineString`, `Polygon`, `MultiPolygon`; tính `bbox`, diện tích, giao cắt, nội suy điểm dọc tuyến.
- **Mapbox**: globe nền toàn ứng dụng; render `source`/`layer`, marker, cluster, fill, fill-extrusion, symbol, circle; xử lý click/hover/double-click/context menu và Mapbox Draw.
- **Firebase Authentication**: đăng ký, đăng nhập, đăng xuất bằng email/password.
- **Firebase / Firebase Storage**: nguồn runtime cho GeoJSON base, scenario, media, PDF và chart JSON; logic truy cập được đóng gói qua service trong `src/services`, đặc biệt `firebaseStorage`.
- Component/page không nhất thiết gọi Firebase hoặc Firestore API trực tiếp; khi review data flow cần lần theo `Page/Component -> Hook/Editor/Service -> firebaseStorage/service tương ứng -> Firebase`.

## 5. Input và trải nghiệm đầu ra

### Input chính

1. GeoJSON base từ Firebase Storage: `site`, `landuse`, `buildinguse`, `activities`, `interview`, `road`.
2. GeoJSON scenario từ Firebase Storage.
3. Media ảnh/video, PDF và chart JSON từ Firebase Storage.
4. Tương tác người dùng: chọn route/site/scenario/filter, click geometry, form edit, Mapbox Draw, upload ảnh.
5. Dataset local `src/assets/data/data.js` gồm 5 `FeatureCollection` building polygon, được xác nhận là dữ liệu backup thủ công cho base map trên cloud, không tham gia trực tiếp vào runtime hiện tại.
6. `src/assets/data/chartdata.js` được import làm chart fallback cho Base scenario trong Interview.

### Phân loại nguồn dữ liệu runtime

| Nhóm dữ liệu           | Nguồn runtime hiện tại                               | Service/file liên quan                                                                                 | Ghi chú                                                                              |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Site/project           | Firebase                                             | `src/services/fetchGeoJSONData.js`, `src/services/firebaseStorage.js`, `SiteSelection.jsx`             | Firebase access được wrap qua service; cache vào `sessionStorage.geojson_source`.    |
| GIS/base map/layer     | Firebase                                             | `fetchGeoJSONData.js`, `firebaseStorage.js`, `SiteSelection.jsx`, các component `Details/Interact`     | `src/assets/data/data.js` chỉ là backup base map thủ công, không phải nguồn runtime. |
| Landuse                | Firebase                                             | `Landuse.jsx`, `firebaseStorage.js`                                                                    | Save scenario bằng service wrapper và `uploadString`.                                |
| Buildinguse/viewpoints | Firebase                                             | `Buildinguse.jsx`, `firebaseStorage.js`                                                                | `viewpoints.json` chỉ được upload từ Buildinguse editor.                             |
| Activities             | Firebase                                             | `Activities.jsx`, `firebaseStorage.js`                                                                 | UI upload ảnh chỉ preview, chưa upload.                                              |
| Interviews             | Firebase; local fallback chart cho Base              | `Interview.jsx`, `firebaseStorage.js`, `chartdata.js`                                                  | Point/media từ Firebase; `chartdata.js` chỉ là fallback chart Base.                  |
| Media                  | Firebase / Firebase Storage                          | `Overview.jsx`, `Project.jsx`, `Landuse.jsx`, `Buildinguse.jsx`, `Interview.jsx`, `firebaseStorage.js` | Kiểm tra service layer thay vì chỉ component.                                        |
| Charts                 | Firebase / Firebase Storage; local fallback cho Base | `Interview.jsx`, `firebaseStorage.js`, `src/assets/data/chartdata.js`                                  | `chart.json` runtime là object trên Firebase, không phải file local.                 |
| Design/project options | Firebase / Firebase Storage                          | `Project.jsx`, `Landuse.jsx`, `Buildinguse.jsx`, `firebaseStorage.js`                                  | Một số path vẫn hard-code `nha_trang`.                                               |
| Local backup data      | Không phải nguồn runtime                             | `src/assets/data/data.js`                                                                              | Dữ liệu backup thủ công cho trường hợp mất base map trên cloud.                      |
| Static JSON/assets     | Static UI asset                                      | `src/assets/images/*.json`                                                                             | Lottie/icon JSON, không phải GIS/layer/scenario data.                                |

### Output

- Bản đồ globe và viewport zoom tự động theo khu vực.
- Layer GIS có màu/độ cao/filter/cluster.
- Tooltip, legend, chart, gallery ảnh/video và PDF viewer.
- Scenario người dùng được lưu thành JSON/media trên Firebase Storage.

## 6. Giới hạn quan trọng của snapshot

- Phiên bản hiện tại còn nhiều path khóa cứng `nha_trang`, trong khi route thiết kế là `/:area`.
- Không có Firebase Security Rules, cấu hình Firebase Hosting, CI/CD, test hoặc tài liệu schema chính thức.
- Data model runtime cần được hiểu qua service wrapper trong `src/services`; tài liệu không coi local JSON là nguồn dữ liệu chính.

Xem chi tiết tại `12_SECURITY_CHECKLIST.md` và `13_KNOWN_ISSUES_AND_HANDOVER_NOTES.md`.
