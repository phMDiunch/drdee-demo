// src/constants/index.js

// =================================================================
// HẰNG SỐ DÙNG CHUNG
// =================================================================
export const GENDERS = ["Nam", "Nữ", "Khác"];

export const CLINIC_PREFIXES = [
  { label: "Minh Khai", value: "MK" },
  { label: "Tôn Đức Thắng", value: "TDT" },
  { label: "Đà Nẵng", value: "DN" },
];

// =================================================================
// MODULE DỊCH VỤ
// =================================================================
export const SERVICE_CATEGORIES = [
  "Tổng quát",
  "Nha chu",
  "Phục hình",
  "Niềng răng",
  "Thẩm mỹ",
  "Implant",
  "Khác",
];

export const SERVICE_UNITS = ["Lần", "Răng", "Cái", "Hàm", "Bộ"];

export const OFFICIAL_WARRANTIES = [
  "1 năm",
  "2 năm",
  "3 năm",
  "4 năm",
  "5 năm",
  "6 năm",
  "7 năm",
  "8 năm",
  "9 năm",
  "10 năm",
  "11 năm",
  "12 năm",
  "13 năm",
  "14 năm",
  "15 năm",
  "20 năm",
  "30 năm",
  "Trọn đời",
  "Không bảo hành",
];

export const CLINIC_WARRANTIES = [
  "1 tháng",
  "3 tháng",
  "6 tháng",
  "1 năm",
  "2 năm",
  "3 năm",
  "4 năm",
  "5 năm",
  "6 năm",
  "7 năm",
  "8 năm",
  "9 năm",
  "10 năm",
  "15 năm",
  "20 năm",
  "25 năm",
  "30 năm",
  "Trọn đời",
  "Không bảo hành",
];

export const MILK_TEETH_POSITIONS = [
  "R51",
  "R52",
  "R53",
  "R54",
  "R55",
  "R61",
  "R62",
  "R63",
  "R64",
  "R65",
  "R71",
  "R72",
  "R73",
  "R74",
  "R75",
  "R81",
  "R82",
  "R83",
  "R84",
  "R85",
];

export const PERMANENT_TEETH_POSITIONS = [
  "R11",
  "R12",
  "R13",
  "R14",
  "R15",
  "R16",
  "R17",
  "R18",
  "R21",
  "R22",
  "R23",
  "R24",
  "R25",
  "R26",
  "R27",
  "R28",
  "R31",
  "R32",
  "R33",
  "R34",
  "R35",
  "R36",
  "R37",
  "R38",
  "R41",
  "R42",
  "R43",
  "R44",
  "R45",
  "R46",
  "R47",
  "R48",
];

// =================================================================
// MODULE NHÂN VIÊN
// =================================================================
export const USER_ROLES = [
  "admin",
  "employee",
  // Bạn có thể thêm các vai trò khác ở đây
];

export const EMPLOYMENT_STATUSES = ["Đang làm việc", "Thử việc", "Nghỉ việc"];

export const CONTRACT_TYPES = ["Thử việc", "Chính thức", "Thời vụ"];

// =================================================================
// MODULE LỊCH HẸN
// =================================================================
export const APPOINTMENT_STATUSES = [
  "Đã lên lịch",
  "Đã xác nhận",
  "Đã đến",
  "Không đến",
  "Đã hủy",
];

// =================================================================
// MODULE ĐIỀU TRỊ & THANH TOÁN
// =================================================================
export const TREATMENT_PLAN_STATUSES = [
  "Đang điều trị",
  "Hoàn thành",
  "Đã hủy",
];

export const TREATMENT_STATUSES = [
  "Chưa điều trị",
  "Đang điều trị",
  "Hoàn thành",
];

export const PAYMENT_METHODS = ["Tiền mặt", "Chuyển khoản", "Thẻ"];

export const PAYMENT_STATUSES = [
  "Chưa thanh toán",
  "Đã thanh toán",
  "Thanh toán một phần",
];
