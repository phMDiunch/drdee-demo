/**
 * Dọn dẹp một đối tượng trước khi gửi lên Firestore.
 * Chuyển đổi các giá trị `undefined` thành giá trị mặc định (chuỗi rỗng cho string, 0 cho number).
 * @param {object} data - Đối tượng dữ liệu đầu vào.
 * @returns {object} - Đối tượng dữ liệu đã được làm sạch.
 */
export const cleanDataForFirestore = (data) => {
  const cleanedData = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      // Nếu giá trị là undefined, thay thế bằng giá trị mặc định
      // Nếu không, giữ nguyên giá trị gốc
      cleanedData[key] =
        value === undefined ? (typeof value === "number" ? 0 : "") : value;
    }
  }
  return cleanedData;
};

// ... các hàm helper khác sẽ được thêm vào đây trong tương lai
