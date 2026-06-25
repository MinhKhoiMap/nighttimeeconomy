# Công nghệ sử dụng

## 1. Nền tảng

| Hạng mục        | Công nghệ                                 |                      Phiên bản khai báo | Vai trò                                                                   |
| --------------- | ----------------------------------------- | --------------------------------------: | ------------------------------------------------------------------------- |
| Frontend        | React                                     |                               `^18.2.0` | Component và state UI                                                     |
| Build tool      | Vite                                      |                                `^5.0.8` | Dev server, build SPA                                                     |
| Ngôn ngữ        | JavaScript/JSX và một phần TypeScript/TSX | Không có compiler config trong snapshot | Logic chính là JSX; UI primitives/hook có TS/TSX                          |
| Routing         | `react-router-dom`                        |                               `^6.21.1` | `BrowserRouter`, route động `:area`, `:site`                              |
| Map             | `mapbox-gl`, `react-map-gl`               |                      `^3.0.1`, `^7.1.7` | Map engine và React bindings                                              |
| GIS             | `@turf/turf`                              |                                `^6.5.0` | bbox, area, intersects, along, random point                               |
| Backend runtime | Không có backend riêng trong repo         |                                       — | App truy cập Firebase từ browser qua service wrapper trong `src/services` |

Đây là static client-side SPA. Các thao tác dữ liệu runtime được đi qua Firebase service wrapper trong mã nguồn.

## 2. Firebase services

| Service        | Trạng thái                                        | File sử dụng                                                 |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| Authentication | Có: email/password; Google popup bị comment       | `src/services/firebaseAuth.js`, `src/pages/Auth/Auth.jsx`    |
| Storage        | Có: list, download, metadata, upload string/bytes | `src/services/firebaseStorage.js`, các page Details/Interact |

## 3. Dependency quan trọng

| Dependency                                                 | Vai trò thực tế trong ứng dụng                                         |
| ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| `@mapbox/mapbox-gl-draw`                                   | Vẽ/sửa/xóa polygon và point                                            |
| `mapbox-gl-draw-waypoint`                                  | Mở rộng modes của Draw trong Building Use                              |
| `lz-string`                                                | Nén/giải nén `sessionStorage.geojson_source`                           |
| `firebase`                                                 | Authentication và Storage SDK                                          |
| `@mui/material`, `@emotion/*`                              | Accordion, Menu, Slider, ImageList, SpeedDial và styled components     |
| `@radix-ui/*`                                              | Nền cho các component trong `src/components/ui`                        |
| `antd`                                                     | `Image` và `Skeleton`                                                  |
| `chart.js`, `react-chartjs-2`, `chartjs-plugin-datalabels` | Pie/bar/likert chart và data label                                     |
| `@react-pdf-viewer/*`, `pdfjs-dist`                        | PDF viewer, toolbar, navigation, search, worker                        |
| `react-photo-view`                                         | Gallery/zoom/rotate ảnh                                                |
| `@lordicon/react`, `lottie-web`                            | Icon animation từ JSON                                                 |
| `lucide-react`                                             | Icon UI                                                                |
| `embla-carousel-react`                                     | Carousel thông qua UI component                                        |
| `jquery`                                                   | DOM class/fade, cursor và chèn nút Draw                                |
| `uuid`                                                     | ID point activity và ID hiệu ứng animation                             |
| `clsx`, `tailwind-merge`, `class-variance-authority`       | Ghép class trong UI primitives                                         |
| `vite-plugin-node-polyfills`                               | Polyfill Node module trong browser; các GIS page có dùng module `path` |

## 4. Dependency chưa được sử dụng trực tiếp

Phiên bản hiện tại chưa ghi nhận import trực tiếp đối với:

- `axios`
- `google-auth-library`
- `@lordicon/element`
- `@mapbox/mapbox-gl-draw-static-mode`
- `mapbox-gl-draw-snap-mode`
- `ldrs`

Không nên xóa chỉ dựa trên bảng này; cần chạy build/test sau khi khôi phục trạng thái build và kiểm tra dependency gián tiếp.

## 5. UI và styling

- Tailwind CSS được cấu hình trong `tailwind.config.js` với content glob cho `src`.
- CSS thường nằm cạnh page/component (`App.css`, `index.css`, `*.css`).
- `src/components/ui` là tập UI primitives kiểu shadcn/Radix.
- FontAwesome được load hai lần từ cùng URL trong `index.html`.
- Themify icon font nằm tại `src/assets/fonts/themify`.
