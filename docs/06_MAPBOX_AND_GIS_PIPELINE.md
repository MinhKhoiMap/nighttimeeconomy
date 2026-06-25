# Mapbox và GIS pipeline

## 1. Khởi tạo Mapbox

`src/App.jsx` tạo một `Map` dùng chung:

- Token: gán hard-code vào `mapboxgl.accessToken`.
- Style: Mapbox hosted style URL hard-code.
- Projection: `globe`.
- Initial view: context `src/contexts/initialViewContext.js` với longitude `-74.5`, latitude `40`, zoom `2`, pitch `0`.
- `doubleClickZoom={false}`, không có attribution control, logo ở bottom-left.
- Globe tự quay khi zoom dưới 5 và người dùng không tương tác.

Home page sau đó fly đến một random point toàn cầu và tạo DOM marker hard-code tại `[109.1912744, 12.2442343]`.

## 2. Nguồn dữ liệu

| Nguồn | Dữ liệu | Trạng thái |
|---|---|---|
| Firebase / Firebase Storage | Base GeoJSON: `<area>/geojson/site.json`, `landuse.json`, `buildinguse.json`, `activities.json`, `interview.json`, `road.json` | Nguồn runtime chính cho Mapbox `Source`; truy cập qua service wrapper |
| Firebase / Firebase Storage | Scenario GeoJSON trong `<area>/scenarios/<siteId>/<scenario>/*.json` | Nguồn runtime khi người dùng chọn scenario |
| Firebase / Firebase Storage | Media/PDF/chart JSON | Nguồn nội dung bổ sung |
| Local hard-code | `chartdata.js` | Chỉ là chart Base fallback của Interview |
| Local backup data | `data.js` | Backup thủ công cho base map trên cloud; không phải nguồn runtime |
| Static asset local | `src/assets/images/*.json`, ảnh, SVG | Icon/Lottie/UI asset; không phải nguồn dữ liệu GIS |
| User edit | Mapbox Draw và form | Được lưu thành scenario trong Storage |
| API khác | Chưa ghi nhận trong phiên bản hiện tại | — |

Kết luận theo xác nhận mới: Mapbox không đọc `src/assets/data/data.js` hay JSON local để render layer/site/scenario trong luồng chính. App đi qua service wrapper (`fetchGeoJSONData`, `firebaseStorage` hoặc service tương ứng), nhận dữ liệu từ Firebase, đưa vào React Context/state rồi truyền vào Mapbox `Source`.

## 3. Source và layer

| Source ID | Layer ID/type | Data/field chính | Tương tác |
|---|---|---|---|
| Mỗi `site.properties.id` | line + `fill_<id>` fill | Site Feature | click chọn site, hover cursor |
| `landuse` | `landuse_selection` fill | `Landuse` | hover tooltip, double-click gallery/edit |
| `buildinguse` | `buildinguse_selection` fill-extrusion | `Buildsused`, `height` | hover tooltip, double-click chọn/edit |
| `activities-point` | `cluster-point` circle, symbol count, `activities_point` circle | `item_1`, `Time`, `Informal` | click cluster, hover tooltip, double-click edit |
| `interview` | `interview_point` symbol | `id` | click gallery |
| `viewpoints` | `viewpoints` circle | `id`, `id_build` | context menu gallery/edit |
| anonymous | `point-effect` circle | Turf point | Overview animation |
| runtime `effect-<uuid>` | circle | Trail point | Tạo/xóa liên tục khi animate |

Không có heatmap, choropleth theo numeric scale, route service hoặc popup Mapbox native. Tooltip/gallery được làm bằng React/DOM overlay.

## 4. GIS format

- GeoJSON: `FeatureCollection` → `Feature` → `geometry`/`properties`.
- Geometry dùng: `Point`, `LineString`, `Polygon`, `MultiPolygon`.
- Tọa độ theo thứ tự `[longitude, latitude]`.
- Dữ liệu theo site ngoài `site.json` là array của `FeatureCollection`; index là khóa liên kết ngầm.
- Feature ID nghiệp vụ nằm ở `properties.id`; Mapbox Draw cũng sinh top-level `id` và code có lúc chuyển vào `properties.id`.

## 5. Xử lý viewport

- Chọn area: `SiteSelection.handleLoadSite()` tạo `LngLatBounds` từ `feature.geometry.coordinates[0]` rồi `fitBounds`.
- Chọn site/mode: `fitAreaUtls()` dùng Turf `bbox` cho Polygon/MultiPolygon.
- Padding thay đổi theo sidebar/mode.
- `SiteSelection.handleLoadSite()` chỉ duyệt ring đầu và giả định Polygon; MultiPolygon site chưa được xử lý tại đây.

## 6. Editing

### Land Use

- Mapbox Draw: polygon + trash.
- Double-click layer để đưa feature vào Draw.
- `draw.update`, `draw.delete`, `draw.create` cập nhật dataset/source.
- Sửa `Landuse`, geometry; upload ảnh/text theo feature ID.
- Undo dùng stack in-memory `EditHistories`.

### Building Use/Viewpoint

- Mapbox Draw: polygon, point, combine/uncombine và waypoint extension.
- Sửa `Buildsused`, `height`, geometry; thêm point viewpoint gắn `id_build`.
- Viewpoint dùng context menu; upload ảnh.

### Activities

- Double-click polygon site tạo point tạm; double-click activity chọn point có sẵn.
- Sửa tọa độ, `item_1`, `Time`, `Informal`; UUID cho point mới.
- UI chọn ảnh chỉ tạo object URL, không upload file trong `submitScenario`.

### Interview

- Phiên bản hiện tại chưa có chức năng chỉnh point/geometry cho Interview.
- Edit Mode chỉnh chart JSON của scenario.

## 7. Thêm layer mới

1. Xác định GeoJSON schema và nơi lưu trong `<area>/geojson` hoặc scenario.
2. Thêm key vào source state/context tại `SiteSelection`.
3. Nếu là mode, thêm ID vào `SourceID`/`interactMode` trong `src/constants/index.js`.
4. Tạo component `Source` + `Layer` và mount trong `Interact`.
5. Dùng layer ID duy nhất; đăng ký event sau khi layer tồn tại và cleanup bằng `map.off`.
6. Nếu scenario cần giữ layer, bổ sung file vào mọi object `geojson` của các `submitScenario`; hiện code lặp ở nhiều editor.
7. Thêm validation cho geometry/properties trước render/upload.

## 8. Đổi Mapbox style

Hiện sửa trực tiếp prop `mapStyle` trong `src/App.jsx`. Khuyến nghị chuyển sang `VITE_MAPBOX_STYLE_URL`. Style mới phải:

- Cho phép token/domain hiện tại.
- Không trùng layer ID runtime.
- Có projection/style tương thích Mapbox GL JS v3.
- Được test với `beforeId="point-effect"` và `beforeId="viewpoints"`; các layer tham chiếu phải tồn tại tại thời điểm add.

## 9. Debug map

| Lỗi | Kiểm tra |
|---|---|
| Map trắng/401/403 | Token, allowed URLs, style URL, network tab |
| Map không có kích thước | Chain `html`, `body`, `#root`, container phải có width/height |
| Source không tồn tại | Component/mode đã mount chưa; ID đúng theo `SourceID`; gọi `getSource` sau load |
| Layer không hiện | GeoJSON hợp lệ, coordinates `[lng,lat]`, field đúng case (`Landuse`, `Buildsused`, `item_1`) và filter không loại hết |
| Marker/symbol không hiện | `loadImage` thành công, image ID `locate`, source point hợp lệ |
| Cluster click lỗi | `features[0]` tồn tại; layer ID là `cluster-point`; source bật `cluster` |
| `fitBounds` lỗi | Geometry Polygon/MultiPolygon và bbox hợp lệ |
| Draw event nhân đôi | Kiểm tra dependency array và `map.off`; Activities hiện đăng ký hover mỗi render mà không cleanup |
| Dữ liệu cũ | Xóa `sessionStorage.geojson_source` rồi reload |
| Scenario lỗi | Kiểm tra folder có đủ file và filename khớp key `SourceID` |

## 10. Performance

- Base data được tải nối tiếp, không song song.
- Toàn bộ dataset được giữ trong React state và `sessionStorage`; scenario save upload toàn bộ dataset.
- Building fill-extrusion có thể nặng khi dataset lớn; `data.js` đang là backup thủ công, không phải dữ liệu runtime.
- Overview tạo/xóa source/layer mỗi frame trail, có chi phí cao.

Khi dữ liệu lớn: ưu tiên vector tiles/Mapbox tileset, bbox-based loading, simplification theo zoom, Web Worker cho xử lý nặng, debounce event, tránh deep-copy toàn collection và tách save theo site/layer/feature.
