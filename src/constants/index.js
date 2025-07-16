/**
 * =================================================================
 * SERVICE CONSTANTS (HẰNG SỐ CHO DỊCH VỤ)
 * =================================================================
 */

// Danh sách các nhóm dịch vụ để đảm bảo dữ liệu nhất quán
export const SERVICE_CATEGORIES = [
  "Tổng quát",
  "Nha chu",
  "Phục hình",
  "Niềng răng",
  "Thẩm mỹ",
  "Implant",
  "Khác",
];

// Danh sách các đơn vị tính
export const SERVICE_UNITS = ["Lần", "Răng", "Cái", "Hàm", "Bộ"];

/**
 * =================================================================
 * USER ROLE CONSTANTS (HẰNG SỐ CHO VAI TRÒ NGƯỜI DÙNG)
 * =================================================================
 */

export const USER_ROLES = ["admin", "employee"];

/**
 * =================================================================
 * PAYMENT STATUS CONSTANTS (HẰNG SỐ CHO TRẠNG THÁI THANH TOÁN)
 * =================================================================
 */

export const PAYMENT_STATUS = {
  PAID: "Đã thanh toán",
  UNPAID: "Chưa thanh toán",
  PARTIALLY_PAID: "Thanh toán một phần",
};

export const GENDERS = ["Nam", "Nữ", "Khác"];

export const EMPLOYMENT_STATUSES = ["Đang làm việc", "Thử việc", "Nghỉ việc"];

export const CONTRACT_TYPES = ["Thử việc", "Chính thức", "Thời vụ"];

// Thêm vào file src/constants/index.js
export const CLINIC_PREFIXES = [
  { label: "Minh Khai", value: "MK" },
  { label: "Tôn Đức Thắng", value: "TDT" },
  { label: "Đà Nẵng", value: "DN" },
];
