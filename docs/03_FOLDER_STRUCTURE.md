# Cấu trúc thư mục và file

## 1. Cây thư mục chính

| Path                 | Nhiệm vụ                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| `index.html`         | HTML shell, mount `#root`, load FontAwesome và Google API script         |
| `src/main.jsx`       | Entry point React; bọc `BrowserRouter` và `MapProvider`                  |
| `src/App.jsx`        | Root Mapbox map, globe rotation, route và global toaster                 |
| `src/pages`          | Các màn hình/feature chính                                               |
| `src/components`     | Component dùng lại và UI primitives                                      |
| `src/services`       | Firebase init/Auth/Storage và tải GeoJSON                                |
| `src/contexts`       | Initial map view context                                                 |
| `src/constants`      | Mode, source ID, category/color mapping                                  |
| `src/utils`          | `fitBounds`, tiện ích timing; có file rỗng `folderDriveList.js`          |
| `src/assets`         | Backup data thủ công, chart mẫu/fallback, ảnh, video, font và PDF worker |
| `public`             | Favicon public                                                           |
| `vite.config.js`     | Vite React, Node polyfills, alias `@` -> `src`                           |
| `tailwind.config.js` | Tailwind theme/content                                                   |
| `vercel.json`        | SPA rewrite cho Vercel                                                   |
| `package.json`       | Dependency và scripts                                                    |

## 2. Pages

| File/folder                                              | Vai trò                                                                     |
| -------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/pages/HomePage/HomePage.jsx`                        | Landing, globe reposition ngẫu nhiên, marker định hướng, link Start         |
| `src/pages/SiteSelection/SiteSelection.jsx`              | Tải/cache base data, render site polygons, context dữ liệu và nested outlet |
| `src/pages/Details/Details.jsx`                          | Điều phối site, mode, scenario list và navbar                               |
| `src/pages/Details/Overview/Overview.jsx`                | Media overview và animation dọc road                                        |
| `src/pages/Details/Project/Project.jsx`                  | Tải PDF project từ Storage và hiển thị viewer                               |
| `src/pages/Details/Interact/Interact.jsx`                | Chọn mode GIS/scenario, auth state, Edit Mode                               |
| `src/pages/Details/Interact/Landuse/Landuse.jsx`         | Land Use layer, filter/chart/gallery và polygon editor                      |
| `src/pages/Details/Interact/Buildinguse/Buildinguse.jsx` | Building extrusion, viewpoint, chart và editor                              |
| `src/pages/Details/Interact/Activities/Activities.jsx`   | Activity cluster/filter và point editor                                     |
| `src/pages/Details/Interact/Interview/Interview.jsx`     | Interview marker/gallery, chart viewer/editor                               |
| `src/pages/Auth/Auth.jsx`                                | Login/signup email/password                                                 |
| `src/pages/AboutProject/AboutProject.jsx`                | Video giới thiệu và nội dung project                                        |

`src/App.jsx` còn import `src/pages/Test/Test`, nhưng file này không tồn tại trong worktree hiện tại.

## 3. Services và data

| File                               | Vai trò                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| `src/services/firebaseApp.js`      | Khởi tạo Firebase client bằng config hard-code                                         |
| `src/services/firebaseAuth.js`     | Wrapper email/password signup/login/logout; Google provider chưa hoạt động             |
| `src/services/firebaseStorage.js`  | Wrapper `ref`, `listAll`, download URL, metadata, upload string/bytes                  |
| `src/services/fetchGeoJSONData.js` | Tải `:area/geojson/<fileName>.json` từ Storage                                         |
| `src/assets/data/chartdata.js`     | Chart interview Base mẫu                                                               |
| `src/assets/data/data.js`          | Backup thủ công cho base map trên cloud; không tham gia trực tiếp vào runtime hiện tại |

## 4. Component dùng lại

| Nhóm            | File tiêu biểu                                                                     | Vai trò                                         |
| --------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------- |
| Edit UI         | `EditSideBar`, `AccordionCustom`, `RadioGroups`, `SliderCustom`, `TextFieldCustom` | Form scenario và thuộc tính GIS                 |
| Map info/filter | `AnnotationTable`, `InfoTable`                                                     | Legend/filter và hover tooltip                  |
| Media           | `PhotoSlide`, `PhotoViewer`, `DocumentViewer`                                      | Gallery và PDF                                  |
| Chart           | `ChartCustom`                                                                      | Adapter Chart.js                                |
| Icon/action     | `LottieIcon`, `SpeedDialCustom`, `Button`                                          | Action UI                                       |
| Loading         | `SkeletonLoading/*`                                                                | Skeleton ảnh/video                              |
| UI primitives   | `src/components/ui/*.tsx`                                                          | Alert, dialog, select, tabs, toast, carousel... |

## 5. Entry point và route

| Route            | Component                       | Ghi chú                        |
| ---------------- | ------------------------------- | ------------------------------ |
| `/`              | `HomePage`                      | Public                         |
| `/auth`          | `Auth`                          | Login/signup                   |
| `/:area`         | `SiteSelection`                 | Tải data theo segment `area`   |
| `/:area/:site`   | `Details` trong `SiteSelection` | Site detail                    |
| `/about_project` | `AboutProject`                  | Public                         |
| `/test`          | `Test`                          | Component thiếu; làm build lỗi |

Route không có guard. Quyền Edit được điều khiển bằng auth state trong UI, không phải protected route.
