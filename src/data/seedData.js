import { ROLES } from '../utils/constants';

// Tài khoản admin mặc định (tạo sẵn khi lần đầu chạy app)
export const SEED_ADMIN = {
  id: 'admin_001',
  fullName: 'Quản trị viên',
  email: 'admin@toolstore.vn',
  password: 'admin123',
  role: ROLES.ADMIN,
  balance: 0,
  createdAt: new Date().toISOString(),
};

// Danh sách sản phẩm mẫu, mỗi sản phẩm có nhiều gói dịch vụ (packages)
export const SEED_PRODUCTS = [
  {
    id: 'p_gpmlogin',
    name: 'GPMLOGIN [4.3.6]',
    category: 'facebook',
    views: 2596,
    shortDesc: 'Giải pháp giả lập nhiều thông tin máy chủ, hỗ trợ nuôi nhiều account trên 1 máy.',
    description:
      'GPM Login là giải pháp giả lập nhiều thông tin máy chủ, hỗ trợ nuôi nhiều account trên 1 máy tính duy nhất, phù hợp với việc nuôi account trên Facebook, Amazon, Ebay... Sản phẩm được bán chính thức.',
    packages: [
      { id: 'std', name: 'Gói Năm (Standard)', desc: 'Hạn sử dụng 1 năm, có cập nhật và fix lỗi', price: 200000 },
      { id: 'life', name: 'Gói Vĩnh Viễn (Ultimate)', desc: 'Mua một lần – dùng mãi mãi, có cập nhật và fix lỗi vĩnh viễn', price: 300000, best: true },
    ],
  },
  {
    id: 'p_gpmglobal',
    name: 'GPM GLOBAL MỚI NHẤT',
    category: 'facebook',
    views: 5245,
    shortDesc: 'Phiên bản GPM Global mới nhất, tối ưu hiệu năng và bảo mật.',
    description: 'Bản GPM Global mới nhất, tối ưu hiệu năng, hỗ trợ đa nền tảng và bảo mật vượt trội.',
    packages: [
      { id: 'std', name: 'Gói Năm (Standard)', desc: 'Hạn sử dụng 1 năm, có cập nhật và fix lỗi', price: 200000 },
      { id: 'life', name: 'Gói Vĩnh Viễn (Ultimate)', desc: 'Mua một lần – dùng mãi mãi', price: 320000, best: true },
    ],
  },
  {
    id: 'p_activegem',
    name: 'Active GEM LOGIN [5.0.8]',
    category: 'facebook',
    views: 1707,
    shortDesc: 'Công cụ kích hoạt và quản lý GEM Login chuyên nghiệp.',
    description: 'Công cụ kích hoạt & quản lý GEM Login, hỗ trợ đồng bộ nhiều profile trình duyệt cùng lúc.',
    packages: [
      { id: 'std', name: 'Gói Năm (Standard)', desc: 'Hạn sử dụng 1 năm', price: 300000 },
      { id: 'life', name: 'Gói Vĩnh Viễn (Ultimate)', desc: 'Mua một lần – dùng mãi mãi', price: 450000, best: true },
    ],
  },
  {
    id: 'p_sniperpage',
    name: 'Sniper Page Tool',
    category: 'facebook',
    views: 980,
    shortDesc: 'Tự động quét & xử lý page Facebook theo kịch bản định sẵn.',
    description: 'Tool tự động quét, lọc và xử lý fanpage Facebook theo kịch bản, tiết kiệm thời gian vận hành.',
    packages: [
      { id: 'std', name: 'Gói Tháng', desc: 'Hạn sử dụng 1 tháng', price: 480000 },
      { id: 'life', name: 'Gói Năm', desc: 'Hạn sử dụng 1 năm, tiết kiệm hơn', price: 4500000, best: true },
    ],
  },
  {
    id: 'p_tiktokauto',
    name: 'TikTok Auto Farm',
    category: 'tiktok',
    views: 1523,
    shortDesc: 'Tự động tương tác, nuôi tài khoản TikTok số lượng lớn.',
    description: 'Tự động hoá thao tác nuôi tài khoản TikTok: xem video, follow, like theo kịch bản tuỳ chỉnh.',
    packages: [
      { id: 'std', name: 'Gói Tháng', desc: 'Hạn sử dụng 1 tháng', price: 350000 },
      { id: 'life', name: 'Gói Vĩnh Viễn', desc: 'Mua một lần – dùng mãi mãi', price: 1800000, best: true },
    ],
  },
  {
    id: 'p_iginteract',
    name: 'Instagram Interact Pro',
    category: 'instagram',
    views: 764,
    shortDesc: 'Tăng tương tác Instagram tự động, an toàn theo giờ.',
    description: 'Tăng like, comment, follow tự động trên Instagram theo khung giờ an toàn, tránh khoá tài khoản.',
    packages: [
      { id: 'std', name: 'Gói Tháng', desc: 'Hạn sử dụng 1 tháng', price: 250000 },
      { id: 'life', name: 'Gói Năm', desc: 'Hạn sử dụng 1 năm', price: 2200000, best: true },
    ],
  },
  {
    id: 'p_telegramsender',
    name: 'Telegram Mass Sender',
    category: 'telegram',
    views: 601,
    shortDesc: 'Gửi tin nhắn hàng loạt tới nhóm/kênh Telegram.',
    description: 'Công cụ gửi tin nhắn hàng loạt, quản lý nhiều tài khoản Telegram cùng lúc, hỗ trợ lịch gửi.',
    packages: [{ id: 'std', name: 'Gói Vĩnh Viễn', desc: 'Mua một lần – dùng mãi mãi', price: 990000, best: true }],
  },
  {
    id: 'p_emailchecker',
    name: 'Email Checker & Cleaner',
    category: 'email',
    views: 432,
    shortDesc: 'Kiểm tra & lọc email sống/chết tốc độ cao.',
    description: 'Kiểm tra danh sách email theo lô lớn, lọc email hợp lệ/không hợp lệ, tốc độ xử lý cao.',
    packages: [{ id: 'std', name: 'Gói Vĩnh Viễn', desc: 'Mua một lần – dùng mãi mãi', price: 690000, best: true }],
  },
  {
    id: 'p_aicontent',
    name: 'AI Content Generator',
    category: 'ai',
    views: 3120,
    shortDesc: 'Tạo nội dung, hình ảnh tự động bằng AI cho MMO.',
    description: 'Sinh nội dung bài viết, caption, hình ảnh tự động phục vụ chạy MMO đa nền tảng.',
    packages: [
      { id: 'std', name: 'Gói Tháng', desc: 'Hạn sử dụng 1 tháng', price: 199000 },
      { id: 'life', name: 'Gói Năm', desc: 'Hạn sử dụng 1 năm, tiết kiệm 40%', price: 1490000, best: true },
    ],
  },
];
