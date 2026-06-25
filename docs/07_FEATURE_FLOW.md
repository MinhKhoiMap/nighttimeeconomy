# Luồng chức năng chính

## 1. Hiển thị bản đồ và chọn site

| Mục      | Chi tiết                                                                                   |
| -------- | ------------------------------------------------------------------------------------------ |
| Mục đích | Mở globe, vào area và chọn site polygon                                                    |
| File     | `App.jsx`, `HomePage.jsx`, `SiteSelection.jsx`, `fetchGeoJSONData.js`                      |
| Input    | Route `:area`, Firebase Storage object `<area>/geojson/site.json`                          |
| Xử lý    | Load GeoJSON, cache toàn bộ base data, render Source/Layer, `fitBounds`, click `fill_<id>` |
| Output   | Điều hướng `/:area/:site`, cung cấp Context                                                |
| Bảo trì  | `site.properties.id` phải duy nhất và khớp route/path Storage                              |

## 2. Land Use

| Mục          | Chi tiết                                                                               |
| ------------ | -------------------------------------------------------------------------------------- |
| File         | `Landuse/Landuse.jsx`                                                                  |
| Data         | `landuseData[site]`                                                                    |
| Field        | `id`, `Landuse`                                                                        |
| Layer/source | `landuse`, `landuse_selection` fill                                                    |
| Xem          | Hover hiện Landuse/diện tích; legend filter; pie chart; double-click mở design gallery |
| Edit         | Draw create/update/delete polygon, radio `Landuse`, undo, upload ảnh/text              |
| Save         | Upload `activities`, `buildinguse`, `interview`, `landuse` vào scenario                |

## 3. Building Use và Viewpoint

| Mục          | Chi tiết                                                                        |
| ------------ | ------------------------------------------------------------------------------- |
| File         | `Buildinguse/Buildinguse.jsx`                                                   |
| Data         | `buildinguseData[site]`, `viewpointsData[site]`                                 |
| Field        | `id`, `Buildsused`, `height`; viewpoint `id`, `id_build`                        |
| Layer/source | `buildinguse`/`buildinguse_selection` fill-extrusion; `viewpoints` circle       |
| Xem          | Hover use; double-click chọn building; context menu viewpoint mở gallery; chart |
| Edit         | Polygon/point Draw, sửa use/height/geometry, tạo viewpoint, upload ảnh          |
| Save         | Upload 5 file GeoJSON và media viewpoint                                        |

## 4. Activities

| Mục          | Chi tiết                                                      |
| ------------ | ------------------------------------------------------------- |
| File         | `Activities/Activities.jsx`                                   |
| Data         | `activitiesData[site]`                                        |
| Field        | `id`, `item_1`/`Item`, `Time`, `Informal`                     |
| Layer/source | `activities-point`; cluster/circle/symbol layers              |
| Filter       | Category và ba time slot x formal/informal                    |
| Edit         | Double-click tạo/chọn point; sửa coordinate, category và time |
| Save         | Upload 4 file GeoJSON scenario                                |

Time encoding:

| Code | Khoảng giờ  |
| ---- | ----------- |
| `1`  | 06:00–18:00 |
| `2`  | 18:00–22:00 |
| `3`  | 22:00–06:00 |

`Time` có thể ghép như `12`, `123`; `Informal` là chuỗi/giá trị `0` hoặc `1`. UI upload ảnh hiện chỉ preview, không gửi Storage.

## 5. Interview

| Mục          | Chi tiết                                                                  |
| ------------ | ------------------------------------------------------------------------- |
| File         | `Interview/Interview.jsx`, `chartdata.js`                                 |
| Data         | `interviewPointData[site]`, media folder, chart JSON                      |
| Layer/source | `interview`, `interview_point` symbol dùng image `locate`                 |
| Xem          | Click point tải gallery; Base dùng chart local; scenario tải `chart.json` |
| Edit         | Tạo/sửa pie, bar, likert chart; không chỉnh interview point               |
| Save         | `uploadString` chart JSON                                                 |

## 6. Scenario

1. `Details.loadingScenarios()` list folder `/<area>/scenarios/<siteId>`.
2. Viewer thấy tất cả scenario; Edit Mode lọc folder bắt đầu bằng email hiện tại.
3. Metadata của item đầu tiên được dùng làm thời gian update để sort.
4. `Interact.getScenarioGeoJSON()` tải tất cả file JSON và merge vào state.
5. Chọn Base giải nén `sessionStorage.geojson_source`.
6. Editor save dùng tên `<email>-<scenario-name>` hoặc giữ `scenarioChosen.name`.

Không có delete/rename scenario. UI ghi rõ scenario đã upload không được rename.

Các scenario JSON là object/path được quản lý qua Firebase service wrapper. Theo xác nhận mới, runtime scenario không lấy từ local JSON.

## 7. Overview

| Mục    | Chi tiết                                                          |
| ------ | ----------------------------------------------------------------- |
| File   | `Overview/Overview.jsx`                                           |
| Data   | `roads[siteIndex]`, `nha_trang/media/<siteId>/overview`           |
| Xử lý  | Turf line distance/along mỗi 10 m; animation frame và trail layer |
| Output | Point chạy dọc road, video và ảnh                                 |

Area path đang hard-code `nha_trang`.

## 8. Project PDF

| Mục    | Chi tiết                                                     |
| ------ | ------------------------------------------------------------ |
| File   | `Project.jsx`, `DocumentViewer.jsx`                          |
| Path   | `nha_trang/media/site<index+1>/project/<scenario-lowercase>` |
| Xử lý  | Lấy item đầu tiên, download URL, render PDF viewer           |
| Output | Toolbar navigation/zoom/search và reading indicator          |

Không validate item tồn tại/MIME trước lấy `slidesRef[0]`; PDF worker tải từ CDN.

## 9. Authentication và quyền

- Login/signup dùng email/password.
- Login thành công điều hướng `/nha_trang`; signup điều hướng `/nha_trang`.
- Authenticated user thấy Edit Mode.
- Không có role, route guard hoặc kiểm tra owner trước upload tại client.
- Quyền thật phụ thuộc Storage Rules; bộ rules đang vận hành cần được xác nhận trong quá trình tiếp nhận.

## 10. Import/export GIS

- Không có UI import GeoJSON từ máy.
- Không có export/download GeoJSON.
- Save scenario là upload JSON nội bộ qua Firebase SDK.
- Dataset `data.js` là backup thủ công cho base map trên cloud, không tham gia runtime.
- Các `src/assets/images/*.json` được dùng cho Lottie/icon UI, không phải GIS layer data.

## 11. Lưu ý bảo trì

- Nhiều path `nha_trang` cần thay bằng `params.area`/config.
- Không đổi case/tên field nếu chưa migrate đồng bộ renderer, filter, editor và dữ liệu Storage.
- Phải cleanup map event trong `useEffect`; một số handler hiện thiếu cleanup hoặc dùng closure cũ.
