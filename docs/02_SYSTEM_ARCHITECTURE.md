# Kiến trúc hệ thống

## 1. Kiểu kiến trúc

Ứng dụng là React SPA chạy hoàn toàn trên browser. Một `Map` duy nhất được mount trong `src/App.jsx`; các route render layer và overlay UI bên trong Map. Client giao tiếp với Mapbox và Firebase qua các service wrapper trong `src/services`, đặc biệt `firebaseStorage`. Phiên bản hiện tại chưa tách backend riêng trong repository.

## 2. System overview

```mermaid
flowchart LR
    U[Người dùng] --> SPA[Vite React SPA]
    SPA --> RR[React Router]
    RR --> PAGE[Page / Component]
    PAGE --> EDITOR[Hook / Editor / Service]
    PAGE --> MAP[Mapbox / react-map-gl]
    PAGE --> TURF[Turf GIS processing]
    EDITOR --> AUTH[Firebase Authentication service]
    EDITOR --> FBS[firebaseStorage / Firebase service wrapper]
    FBS --> FB[Firebase / Firestore / Storage]
    FB --> BASE[Base GeoJSON]
    FB --> SCN[Scenario GeoJSON]
    FB --> MEDIA[Ảnh / video / PDF]
    FB --> CHART[Chart JSON]
    MAP --> STYLE[Mapbox hosted style]
    BASE --> PAGE
    SCN --> PAGE
    MEDIA --> PAGE
    CHART --> PAGE
    PAGE --> SS[sessionStorage geojson_source]
```

## 3. Cấu trúc frontend

1. `src/main.jsx` mount `BrowserRouter`, `MapProvider` và `App`.
2. `src/App.jsx` tạo Map globe, token/style và route.
3. `HomePage` hiển thị landing/marker định hướng.
4. `SiteSelection` tải toàn bộ base GeoJSON, cache vào `sessionStorage`, render polygon site và cung cấp `SiteDataContext`/`SiteChosenContext`.
5. `Details` quản lý site, view mode, scenario và context scenario.
6. `Interact` chọn một trong bốn mode GIS và tải scenario.
7. Mỗi mode tự khai báo `Source`, `Layer`, event handler, filter/chart và editor.

State không dùng Redux/Zustand/query library. Dữ liệu được truyền bằng React Context và cập nhật trực tiếp trong object/array ở một số chỗ.

## 4. Firebase data flow

```mermaid
flowchart TD
    U[User/UI] --> A[Page / Component]
    A --> B[Hook / Editor / Service]
    B --> C[fetchGeoJSONData hoặc service liên quan]
    C --> D[firebaseStorage wrapper]
    D --> E[Firebase / Firestore / Storage]
    E --> F[Download URL / list / metadata / upload result]
    F --> G[JSON / media / PDF data]
    G --> H[projectData / Context / state]
    H --> I[LZString sessionStorage cache]
    H --> J[Mapbox Sources/Layers hoặc UI]

    K[Chọn scenario] --> L[Details / Interact]
    L --> D
    D --> M[Firebase scenario objects]
    M --> N[Merge vào projectData]
    N --> J

    O[Edit + Save] --> P[Editor component]
    P --> D
    D --> Q[Firebase scenarios/media/charts_data]
```

Các `*.json` trong sơ đồ là object/path được quản lý qua Firebase service wrapper, không phải file JSON local trong repository.

## 5. Map rendering flow

```mermaid
flowchart LR
    SERVICE[Firebase service wrapper] --> GEO[GeoJSON runtime từ Firebase]
    GEO --> CACHE[projectData/context]
    CACHE --> MODE{Interact mode}
    MODE --> LU[Landuse Source + fill]
    MODE --> BU[Buildinguse Source + fill-extrusion]
    MODE --> AC[Activities Source + cluster/circle]
    MODE --> IV[Interview Source + symbol]
    CACHE --> SITE[Site Sources + fill/line]
    CACHE --> ROAD[Turf along road]
    ROAD --> ANIM[Circle animation]
    LU --> EVT[Map events/filter/tooltip/chart]
    BU --> EVT
    AC --> EVT
    IV --> EVT
```

## 6. User interaction flow

```mermaid
flowchart TD
    HOME["Trang chủ"] --> START["Start"]
    START --> AREA["/:area"]
    AREA --> SELECT["Click site polygon"]
    SELECT --> DETAILS["/:area/:site"]
    DETAILS --> OVER["Overview"]
    DETAILS --> PROJ["Project PDF"]
    DETAILS --> INTER["Interact"]
    INTER --> FILTER["Landuse / Buildinguse / Activities / Interview"]
    FILTER --> SCENARIO["Chọn Base hoặc scenario"]
    INTER --> LOGIN{"Đã đăng nhập?"}
    LOGIN -- "Không" --> AUTH["/auth"]
    LOGIN -- "Có" --> EDIT["Edit Mode"]
    EDIT --> SAVE["Upload Storage"]
```

## 7. Update data flow

```mermaid
flowchart TD
    USER[Authenticated user] --> EDIT[Edit Mode]
    EDIT --> DRAW[Mapbox Draw]
    EDIT --> FORM[Thuộc tính/chart]
    EDIT --> FILE[Chọn ảnh]
    DRAW --> STATE[projectData/context]
    FORM --> STATE
    STATE --> SAVE[Save scenario]
    SAVE --> SG[Storage scenarios/*.json]
    FILE --> SM[Storage media/*]
    FORM --> SC[Storage charts_data/chart.json]
    SG --> REVIEW[Người xem chọn scenario]
```

## 8. Cache và lifecycle dữ liệu

- Base GeoJSON được tải nối tiếp, sau đó nén vào `sessionStorage` key `geojson_source`.
- Cache không có version/TTL; dữ liệu base thay đổi trên Storage sẽ không tự cập nhật trong cùng tab/session.
- Scenario được merge vào `projectData`; chọn Base dùng dữ liệu giải nén từ `sessionStorage`.
- Editor cập nhật cả Map source và context. Việc save upload toàn bộ nhóm dataset, không chỉ feature vừa sửa.
- `src/assets/data/data.js` được xác nhận là dữ liệu backup thủ công cho base map trên cloud; không được coi là nguồn dữ liệu runtime chính.
- `src/assets/data/chartdata.js` chỉ là fallback chart Base của Interview khi không chọn scenario Storage.

## 9. Backend/API

- Không có backend/server/API route.
- `fetch()` chỉ dùng với Firebase download URL và PDF worker CDN.
- Firebase SDK được sử dụng từ client qua các service wrapper trong `src/services`.
- `vercel.json` rewrite mọi route không có dấu chấm về `/` để hỗ trợ SPA routing.
