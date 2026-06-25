# Security checklist

## 1. Kết quả rà soát hiện trạng

| Hạng mục                        | Kết quả                                                                                    | Mức độ                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| Mapbox token hard-code          | Có trong `src/App.jsx`; không chép giá trị vào tài liệu                                    | Cao                                                 |
| Firebase config hard-code       | Có trong `src/services/firebaseApp.js`                                                     | Trung bình; rủi ro chính là rules/config môi trường |
| Server secret/private key       | Chưa ghi nhận trong repository                                                             | —                                                   |
| `.env`/env isolation            | Không có                                                                                   | Cao về vận hành                                     |
| Firebase Storage Rules          | Không có trong repo                                                                        | Cao, cần xác nhận ngay                              |
| Firestore Rules                 | Cần xác nhận nếu Firebase/Firestore được dùng qua service wrapper hoặc cấu hình ngoài repo | Không kết luận chỉ từ component/page                |
| Protected route                 | Không có route guard                                                                       | Trung bình                                          |
| Role/admin authorization        | Không có role; mọi authenticated user thấy Edit Mode                                       | Cao                                                 |
| Check quyền trước update/upload | Chỉ check gián tiếp bằng việc user tồn tại/UI; không có role/owner check đáng tin cậy      | Cao                                                 |
| Delete                          | App không có Storage delete; editor xóa feature khỏi scenario state                        | Trung bình                                          |
| Upload MIME                     | `accept="image/*"` phía browser, không phải security control                               | Cao                                                 |
| Upload size/count               | Không validate                                                                             | Cao                                                 |
| Filename/path sanitization      | Dùng filename gốc, email và scenario name trong path; không sanitize rõ ràng               | Cao                                                 |
| Auth signup                     | Cho phép tự đăng ký từ UI; policy phê duyệt user không có                                  | Cao                                                 |
| Google scope                    | Code thêm contacts readonly dù Google login bị comment                                     | Trung bình; bỏ nếu không cần                        |
| XSS                             | React escape text; chưa ghi nhận `dangerouslySetInnerHTML`/`eval`                          | Tốt trong phạm vi rà soát hiện trạng                |
| Third-party CDN                 | FontAwesome, Google API script, PDF worker; không có CSP/SRI rõ ràng                       | Trung bình                                          |
| Logging                         | Nhiều `console.log` có thể lộ URL/data/user email                                          | Trung bình                                          |
| Map attribution                 | `attributionControl={false}`                                                               | Cần kiểm tra tuân thủ Mapbox terms                  |

## 2. Authorization thực tế

Frontend authorization không đủ bảo vệ dữ liệu. Việc:

- ẩn/hiện Edit Mode;
- đặt email vào tên scenario;
- lọc dữ liệu bằng `startsWith(email)`;

đều có thể bị client sửa/bỏ qua. Firebase Storage Security Rules phải là enforcement point. Rules, custom claims và chính sách role cần được xác nhận trong quá trình tiếp nhận.

## 3. Yêu cầu Rules tối thiểu cần xác nhận/thiết kế

- Public/anonymous chỉ được đọc đúng nội dung công khai.
- Chỉ authenticated user phù hợp được ghi scenario/media/chart.
- User không được ghi vào scenario của user khác; không dựa vào prefix email nếu có thể dùng UID.
- Chặn ghi Base GeoJSON với user thường.
- Validate content type, kích thước, extension và path depth trong khả năng của Rules.
- Hạn chế delete/update theo ownership/role.
- Admin dùng custom claim do môi trường tin cậy cấp, không do client tự ghi.
- Rules có test bằng Firebase Emulator.

Không deploy rule mẫu chưa test trực tiếp lên production.

## 4. Upload checklist

- [ ] MIME thực được kiểm tra, không chỉ `accept`.
- [ ] Giới hạn size/file count/quota.
- [ ] Filename được chuẩn hóa, tránh collision/path bất thường.
- [ ] Chỉ cho phép image/PDF/video đúng feature.
- [ ] Scan/kiểm duyệt file theo yêu cầu tổ chức.
- [ ] Metadata/contentType được set và kiểm tra.
- [ ] Object cũ/mồ côi có lifecycle an toàn.
- [ ] Download URL/public access phù hợp dữ liệu.

## 5. Authentication checklist

- [ ] Xác nhận có được phép self-signup không.
- [ ] Password policy/MFA/Email verification theo yêu cầu.
- [ ] Authorized domains đúng môi trường.
- [ ] Tắt provider/scope không dùng.
- [ ] Role/claim/UID ownership được định nghĩa.
- [ ] Route/UI và Storage Rules cùng enforce.
- [ ] Có quy trình revoke user và audit write.

## 6. Secret/token response

### Mapbox token

Token đã commit phải được xem là đã lộ. Rotate/restrict theo `11_MAINTENANCE_GUIDE.md`.

### Firebase config

Firebase web config xuất hiện trong bundle là bình thường về mặt client architecture, nhưng không được coi là secret. Bảo vệ bằng Rules, App Check nếu phù hợp, quota/monitoring và environment isolation. Service account/private key tuyệt đối không được đưa vào `VITE_*` hoặc repo.

## 7. Trước bàn giao production

- [ ] Review git history bằng secret scanner của tổ chức.
- [ ] Rotate/restrict Mapbox token.
- [ ] Xác minh Storage Rules đang deploy, commit rules vào repo và test.
- [ ] Tách Firebase/Mapbox dev-staging-prod.
- [ ] Quyết định self-signup và role model.
- [ ] Bổ sung upload validation/quota.
- [ ] Thêm CSP và loại script CDN thừa/duplicate.
- [ ] Loại log nhạy cảm.
- [ ] Xác nhận backup, monitoring và incident owner.
