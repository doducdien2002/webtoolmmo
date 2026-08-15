# ToolStore MMO – React Project

Giao diện bán Tool/Source Code (theme trắng) có đăng nhập/đăng ký, khu vực
người dùng và khu vực quản trị (admin), kèm luồng **mua sản phẩm → sinh
license key → gửi lên admin duyệt → admin kích hoạt**.

## 1. Cài đặt & chạy thử

```bash
npm install
npm run dev
```

Mở trình duyệt tại địa chỉ hiển thị trong terminal (mặc định `http://localhost:5173`).

Build production:

```bash
npm run build
npm run preview
```

## 2. Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@toolstore.vn` | `admin123` |
| User | Tự đăng ký tại trang `/register` | — |

> Dữ liệu (user, sản phẩm, đơn hàng) được lưu trong `localStorage` của
> trình duyệt để demo không cần backend. Xem mục 4 để thay bằng API thật.

## 3. Cấu trúc thư mục

```
src/
├── components/
│   ├── common/       # Icon, Badge, Modal, ProductCard, StatCard, ProtectedRoute, AdminRoute...
│   └── layout/        # Sidebar, Topbar, UserLayout, AdminLayout, AuthLayout
├── context/
│   ├── AuthContext.jsx    # Trạng thái đăng nhập, user hiện tại
│   └── ToastContext.jsx   # Thông báo toast toàn cục
├── data/
│   └── seedData.js    # Dữ liệu mẫu: tài khoản admin, danh sách sản phẩm
├── pages/
│   ├── auth/           # LoginPage, RegisterPage
│   ├── user/            # DashboardPage, ProductsPage, ProductDetailPage, MyKeysPage, TopUpPage
│   └── admin/            # AdminDashboardPage, AdminProductsPage, AdminOrdersPage, AdminUsersPage
├── services/
│   ├── storageService.js  # Lớp trừu tượng đọc/ghi dữ liệu (hiện dùng localStorage)
│   ├── authService.js     # Đăng ký / đăng nhập / cập nhật user
│   ├── productService.js  # CRUD sản phẩm
│   └── orderService.js    # Luồng mua hàng & kích hoạt key
├── utils/
│   ├── constants.js    # ROLES, ORDER_STATUS, CATEGORIES...
│   └── formatters.js   # formatVND, formatDateTime, genLicenseKey, genId
├── App.jsx              # Toàn bộ định tuyến (routes)
├── main.jsx             # Điểm khởi chạy React
└── index.css             # Design tokens & toàn bộ style (theme trắng)
```

## 4. Luồng nghiệp vụ mua – kích hoạt key

1. User chọn sản phẩm → chọn gói dịch vụ → xác nhận điều khoản → **Thanh
   toán ngay** (`ProductDetailPage.jsx`).
2. `orderService.checkout()` sinh 1 `licenseKey`, tạo **order** với
   `status = "pending"`, đồng thời trừ số dư user.
3. Đơn hàng xuất hiện trong **Admin → Yêu cầu kích hoạt**
   (`AdminOrdersPage.jsx`).
4. Admin bấm:
   - **Kích hoạt** → `orderService.approve()` → `status = "active"` →
     user thấy key thật tại trang **Key của tôi**.
   - **Từ chối** → `orderService.reject()` → `status = "rejected"`.

## 5. Cách kết nối API thật thay cho localStorage

Toàn bộ project chỉ giao tiếp dữ liệu qua 3 service:
`authService`, `productService`, `orderService`. Mỗi service lại chỉ gọi
`storageService`. Muốn chuyển sang backend thật, bạn chỉ cần:

1. Sửa các hàm trong `authService.js`, `productService.js`,
   `orderService.js` để gọi `fetch`/`axios` tới API thay vì
   `storageService.read/write`.
2. Không cần sửa bất kỳ component/page nào vì chúng chỉ import và gọi
   hàm từ service, không biết dữ liệu tới từ đâu.

## 6. Mở rộng thêm

- Thêm cổng thanh toán thật ở `TopUpPage.jsx` (thay vì cộng số dư trực tiếp).
- Thêm phân trang / tìm kiếm nâng cao ở `AdminOrdersPage.jsx`.
- Thêm vai trò "cộng tác viên (CTV)" bằng cách mở rộng `ROLES` trong
  `utils/constants.js` và tạo thêm `CtvRoute`, `CtvLayout` tương tự
  `AdminRoute`/`AdminLayout`.
