# Firebase setup và data model

## 1. Khởi tạo Firebase

- `src/services/firebaseApp.js` gọi `initializeApp()` với client config hard-code.
- `src/services/firebaseAuth.js` kế thừa `FirebaseApp` và export singleton `new FirebaseAuth()`.
- `HomePage` import `firebaseAuth` để Firebase default app được khởi tạo.
- `src/services/firebaseStorage.js` gọi `getStorage(app)`.

Lưu ý triển khai: `FirebaseApp` khai báo `static registerApp` nhưng constructor gán `this.registerApp`; trong `firebaseStorage.js`, code lại đọc `firebaseApp.registerApp` trên class. Giá trị này là `undefined`, nên Storage đang phụ thuộc Firebase default app đã được khởi tạo bởi import khác. Đây là coupling theo thứ tự module và cần sửa trước khi mở rộng.

## 2. Services sử dụng

| Service        | API dùng                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Authentication | `getAuth`, `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`, `updateProfile`, `onAuthStateChanged` |
| Storage        | `getStorage`, `ref`, `listAll`, `getDownloadURL`, `getMetadata`, `uploadString`, `uploadBytes`                              |

Theo xác nhận của người phát triển, dữ liệu runtime được lấy từ Firebase và Firebase access được wrap qua service layer. Không kết luận vắng mặt Firestore chỉ vì component/page không gọi API Firestore trực tiếp; khi cần xác minh collection/rules/index phải kiểm tra service wrapper, Firebase Console và cấu hình deploy.

## 3. Authentication

| Hạng mục           | Hiện trạng                                                                   |
| ------------------ | ---------------------------------------------------------------------------- |
| Provider hoạt động | Email/password                                                               |
| User profile       | Firebase Auth `displayName` dự kiến được cập nhật khi signup                 |
| Role/permission    | Phiên bản hiện tại chưa ghi nhận role/claim/document role riêng              |
| Protected route    | Không có                                                                     |
| Edit Mode          | Chỉ hiện khi `onAuthStateChanged` trả user                                   |
| Ownership scenario | Tên folder bắt đầu bằng email và UI lọc bằng `startsWith(currentUser.email)` |

Tên folder/email chỉ là convention phía client, không phải cơ chế authorization. Security Rules phải xác thực `request.auth` và quyền trên path; bộ rules vận hành cần được xác nhận trong quá trình tiếp nhận.

## 4. Firebase Storage data model

Các tên `site.json`, `landuse.json`, `chart.json` bên dưới là object/path được quản lý qua Firebase service wrapper trong phiên bản hiện tại. App không dùng `src/assets/data/data.js` để render GIS/base map runtime.

### 4.1 Cây path hiện tại

```text
<area>/
├── geojson/
│   ├── site.json
│   ├── landuse.json
│   ├── buildinguse.json
│   ├── activities.json
│   ├── interview.json
│   └── road.json
├── scenarios/<siteId>/<userEmail>-<scenarioName>/
│   ├── activities.json
│   ├── buildinguse.json
│   ├── interview.json
│   ├── landuse.json
│   └── viewpoints.json
├── media/<siteId>/
│   ├── overview/<image-or-video>
│   ├── interview/<interviewId>/<image>
│   ├── design_images/<scenario>/landuse/<featureId>/
│   │   ├── <image>
│   │   └── <image-or-name>.json
│   └── viewpoints/<scenario>/<viewpointId>/
│       ├── <image>
│       └── <image>.json
├── charts_data/<siteId>/<scenario>/chart.json
└── media/site<index+1>/project/<scenario-lowercase>/<pdf>
```

### 4.2 Object và schema GIS

| Object             | Shape dự kiến                                  | Field/properties frontend phụ thuộc                                                             |
| ------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `site.json`        | Một GeoJSON `FeatureCollection` polygon        | `features`, `feature.properties.id`, `feature.geometry`; `feature.name` được dùng làm React key |
| `landuse.json`     | Mảng `FeatureCollection`, index tương ứng site | `properties.id`, `properties.Landuse`; Polygon/MultiPolygon                                     |
| `buildinguse.json` | Mảng `FeatureCollection`                       | `properties.id`, `properties.Buildsused`, `properties.height`; Polygon                          |
| `activities.json`  | Mảng `FeatureCollection`                       | `properties.id`, `item_1`, `Item`, `Time`, `Informal`; Point                                    |
| `interview.json`   | Mảng `FeatureCollection`                       | `properties.id`; Point                                                                          |
| `road.json`        | Mảng `FeatureCollection`                       | geometry `LineString` để Turf `lineDistance`/`along`                                            |
| `viewpoints.json`  | Mảng `FeatureCollection`                       | `properties.id`, `properties.id_build`; Point                                                   |
| `chart.json`       | Array chart config                             | `id`, `typeChart`, `opts`, `title`, `labels`, `dataset`; có thể có `legend`                     |

Quan hệ theo index/ID:

- Index của mảng dataset tương ứng index feature trong `site.json`.
- Route `:site` khớp `site.features[i].properties.id`.
- Viewpoint liên kết building bằng `viewpoint.properties.id_build == building.properties.id`.
- Media liên kết bằng `<siteId>`, scenario name và feature/viewpoint/interview ID trong Storage path.

## 5. Read/write flow

| Operation     | Cách thực hiện                                                                |
| ------------- | ----------------------------------------------------------------------------- |
| Load base     | Lấy download URL rồi `fetch().json()`                                         |
| List scenario | `listAll()` folder site, lấy metadata item đầu tiên để sort `updated`         |
| Load scenario | List toàn bộ JSON trong folder, dùng filename làm key rồi merge `projectData` |
| Save scenario | `JSON.stringify()` toàn bộ dataset và `uploadString()` từng file              |
| Upload media  | `uploadBytes()`; text phụ được `uploadString()`                               |
| Load media    | `listAll()`, `getMetadata()`, `getDownloadURL()`                              |

## 6. Phân biệt Firebase runtime và dữ liệu local

| Nhóm dữ liệu                                                      | Nguồn runtime hiện tại      | Luồng/service liên quan                                                                                                  | Ghi chú                                                     |
| ----------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Base GeoJSON `site/landuse/buildinguse/activities/interview/road` | Firebase                    | `fetchGeoJSONData.js` đi qua `getRef`/`getDownloadUrl` từ `firebaseStorage.js` rồi `fetch`                               | `SiteSelection.jsx` gọi lần lượt `getBaseGeoJSONData(...)`. |
| Scenario GeoJSON                                                  | Firebase                    | `Details.jsx` và `Interact.jsx` đi qua `listChild`, `listChilds`, `getDownloadUrl` từ `firebaseStorage.js`               | Filename được dùng làm key merge vào `projectData`.         |
| Media overview/interview/design/viewpoint                         | Firebase / Firebase Storage | `getRef`, `listChilds`, `getDownloadUrl`, `getMeta`, `updloadFile` trong `firebaseStorage.js`                            | Kiểm tra service layer thay vì chỉ component.               |
| Chart scenario                                                    | Firebase / Firebase Storage | `Interview.jsx` đọc/ghi `<area>/charts_data/<siteId>/<scenario>/chart.json` qua `getRef`/`getDownloadUrl`/`uploadString` | Base Interview dùng fallback local.                         |
| Chart Base Interview                                              | Hard-code trong mã nguồn    | `Interview.jsx` import `src/assets/data/chartdata.js`                                                                    | Đây là fallback chart, không phải toàn bộ data model.       |
| Local `src/assets/data/data.js`                                   | Không phải nguồn runtime    | Xác nhận từ người phát triển                                                                                             | Backup thủ công cho trường hợp mất base map trên cloud.     |
| Lottie/icon JSON                                                  | Static assets trong bundle  | `src/assets/images/*.json` được import bởi UI components                                                                 | Không phải dữ liệu GIS/layer/scenario.                      |

## 7. Chuyển Firebase project

1. Tạo/nhận Firebase Web App config của project đích.
2. Di chuyển config sang env theo `04_ENVIRONMENT_VARIABLES.md`.
3. Bật Email/Password Authentication; chỉ bật Google nếu hoàn thiện flow.
4. Tạo đúng cây Storage và upload base GeoJSON/media/PDF.
5. Viết và deploy Storage Security Rules trước khi mở write.
6. Thêm authorized domains cho local/deployment domain.
7. Kiểm tra CORS khi tải PDF/media.
8. Test viewer ẩn danh, login, scenario write/read và quyền user chéo.
